/**
 * meta.js — The fourth-wall effects. Each one is called deliberately from the story script;
 * nothing here fires at random. Watchers (tab, idle, cursor) only run while the script turns them on.
 */
import { persist, formatDuration, formatShort } from "./persist.js?v=2.1.0";

const $ = (sel, root = document) => root.querySelector(sel);
const sleep = ms => new Promise(r => setTimeout(r, ms));

export class Meta {
  constructor(game) {
    this.game = game;
    this.root = $("#game");
    this.fx = $("#fx");
    this.watch = { tab: false, idle: false, cursor: false, context: false };
    this._hiddenAt = 0;
    this._away = false;
    this._lastInput = Date.now();
    this._idleFired = false;
    this._said = new Set();
    this._lastNotify = 0;
    this.baseTitle = document.title;

    // Desktop build only: the Electron bridge from electron/preload.js.
    this.native = window.native ? this._wrapNative(window.native) : null;
    this.osName = "";
    this.pendingDeleted = [];
    if (this.native) {
      this.native.info().then(i => { this.osName = i.username || ""; this.gameDir = i.gameDir; });
      this.native.onCloseAttempt(msg => this._onCloseAttempt(msg));
      this.native.onFocusChange(focused => this._setAway(!focused));
    }

    document.addEventListener("visibilitychange", () => this._setAway(document.hidden));
    document.addEventListener("contextmenu", e => this._contextMenu(e));
    document.addEventListener("copy", () => this._once("copy", "What are you copying that for? Who are you going to show?"));
    window.addEventListener("resize", () => this._once("resize", "Don't make the room smaller. It's already so small in here."));
    ["pointerdown", "pointermove", "keydown"].forEach(ev =>
      window.addEventListener(ev, () => { this._lastInput = Date.now(); this._idleFired = false; }, { passive: true }));
    window.addEventListener("pointermove", e => this._moveReticle(e), { passive: true });
    setInterval(() => this._idleTick(), 1000);
  }

  /* ---------- small visual effects ---------- */

  pulse(cls, ms) {
    this.root.classList.remove(cls);
    void this.root.offsetWidth;
    this.root.classList.add(cls);
    setTimeout(() => this.root.classList.remove(cls), ms);
    return sleep(ms);
  }
  glitch(ms = 500) { this.game.audio.sfx("glitch"); return this.pulse("fx-glitch", ms); }
  shake(ms = 400) { return this.pulse("fx-shake", ms); }
  tear(ms = 900) { this.game.audio.sfx("static"); return this.pulse("fx-tear", ms); }
  static(ms = 700) { this.game.audio.sfx("static"); return this.pulse("fx-static", ms); }
  flash(color = "#fff", ms = 300) {
    const el = this._layer(`background:${color};opacity:.9;transition:opacity ${ms}ms`);
    requestAnimationFrame(() => { el.style.opacity = 0; });
    setTimeout(() => el.remove(), ms + 50);
    return sleep(ms);
  }
  async blackout(ms = 2000) {
    const el = this._layer("background:#000");
    await sleep(ms);
    el.remove();
  }
  /** Toggle a persistent mood filter on the whole game: "wrong", "red", "still", or null. */
  mood(name) {
    this.root.classList.remove("mood-wrong", "mood-red", "mood-still");
    if (name) this.root.classList.add("mood-" + name);
    this._mood = name;
    this.syncUncanny();
  }

  /**
   * The UI is cute until something is wrong. Then every piece of it (the text box, the hearts,
   * the menus, the cursor) turns into its uncanny twin. On during "wrong"/"red" moods and all of Act 2.
   */
  syncUncanny() {
    const on = ["wrong", "red", "still"].includes(this._mood) || !!this.game.v.sabotage;
    const was = this.root.classList.contains("uncanny");
    this.root.classList.toggle("uncanny", on);
    if (on && !was) this.pulse("ui-flip", 700);
  }

  /** The UI shows its other face for a moment, then pretends it didn't. */
  async flicker(ms = 260) {
    if (this.root.classList.contains("uncanny")) return;
    this.root.classList.add("uncanny");
    this.game.audio.sfx("glitch");
    await sleep(ms);
    this.root.classList.remove("uncanny");
  }

  _layer(style) {
    const el = document.createElement("div");
    el.className = "fx-layer";
    el.style.cssText = style;
    this.fx.appendChild(el);
    return el;
  }

  /* ---------- illustrations and horror (2.1) ---------- */

  /** Graphic images (blood, death, jumpscare faces) are the ones whose id starts with "h_". */
  _graphic(id) { return /^h_/.test(id || ""); }
  get goreOn() { return persist.data.settings.gore !== false; }

  /**
   * Show a full-screen illustration (assets/cg/<id>.webp) over the stage, under the text box. cg(null) clears it.
   * It stays until cleared, and comes back when a save is loaded. With "graphic horror" off in Settings,
   * graphic ones are shown blurred and dark instead.
   */
  cg(id, { fade = true } = {}) {
    const stage = $("#stage");
    let layer = $("#cg");
    if (!layer) { layer = document.createElement("div"); layer.id = "cg"; stage.appendChild(layer); }
    this.game.v.cg = id || null;
    if (!id) { layer.classList.remove("in"); setTimeout(() => { if (!this.game.v.cg) layer.innerHTML = ""; }, 700); return; }
    const img = document.createElement("div");
    img.className = "cg-img" + (this._graphic(id) && !this.goreOn ? " withheld" : "");
    img.style.backgroundImage = `url(assets/cg/${id}.webp)`;
    if (!fade) img.style.transition = "none";
    // The darkroom: the rope creaks while it's on screen.
    if (id === "h_darkroom" && this.goreOn) this.game.audio.sfx("creak");
    layer.appendChild(img);
    layer.classList.add("in");
    requestAnimationFrame(() => img.classList.add("in"));
    setTimeout(() => { while (layer.children.length > 1) layer.firstElementChild.remove(); }, fade ? 900 : 0);
  }

  /**
   * A jumpscare: an image slams into the screen with a screech, the screen shakes, and it's gone.
   * Only ever called from a fixed place in the script. Gentle mode swaps it for a black flash.
   */
  async scare(id, ms = 700) {
    const audio = this.game.audio;
    if (!this.goreOn) { audio.sfx("static"); await this.blackout(Math.min(ms, 400)); return; }
    audio.sfx("scare");
    const el = document.createElement("div");
    el.className = "scare";
    el.style.backgroundImage = `url(assets/cg/${id}.webp)`;
    this.fx.appendChild(el);
    this.shake(ms);
    if (this.native) this.native.shake(ms * 0.8, 16).catch(() => {});
    await sleep(ms);
    el.classList.add("out");
    await sleep(160);
    el.remove();
  }

  /** An image for a few frames. You're not sure you saw it. The script pretends you didn't. */
  async subliminal(id, ms = 90) {
    if (this._graphic(id) && !this.goreOn) return;
    const el = document.createElement("div");
    el.className = "subliminal";
    el.style.backgroundImage = `url(assets/cg/${id}.webp)`;
    this.fx.appendChild(el);
    await sleep(ms);
    el.remove();
  }

  /** Something red runs down from the top of the screen and stays until it's turned off. */
  blood(on = true) {
    this.game.v.blood = !!on;
    this.root.classList.toggle("fx-blood", !!on && this.goreOn);
  }

  /* ---------- the game folder (.exe) ---------- */

  /**
   * Wraps the native file calls so the game remembers every file it has put in its folder.
   * When one of them disappears (the player deleted it), the girls notice: see noticeDeleted().
   */
  _wrapNative(raw) {
    const remember = name => { persist.data.written = { ...persist.data.written, [name]: Date.now() }; persist.save(); if (raw.fileWritten) raw.fileWritten(name); };
    const api = { ...raw };
    api.writeFile = async (name, text) => { const ok = await raw.writeFile(name, text); remember(name); return ok; };
    api.writeImage = async (name, url) => { const ok = await raw.writeImage(name, url); remember(name); return ok; };
    if (raw.onFileGone) raw.onFileGone(name => this._fileGone(name));
    if (raw.watchFiles) raw.watchFiles(Object.keys(persist.data.written || {}));
    return api;
  }

  /** On start-up: anything we wrote that isn't there any more was deleted while the game was closed. */
  async checkFolder() {
    if (!this.native) return;
    for (const name of Object.keys(persist.data.written || {})) {
      if (persist.data.deleted[name]) continue;
      try { if (!(await this.native.exists(name))) this._fileGone(name); } catch (e) { /* folder unreadable */ }
    }
  }

  _fileGone(name) {
    if (!persist.data.written[name] || persist.data.deleted[name]) return;
    persist.data.deleted = { ...persist.data.deleted, [name]: Date.now() };
    persist.save();
    this.pendingDeleted = this.pendingDeleted || [];
    if (!this.pendingDeleted.includes(name)) this.pendingDeleted.push(name);
    this.console("sayo", `someone deleted ${name}. it was ours.`);
  }

  /** Put a deleted file back, with a note at the bottom from whoever noticed. */
  async restoreFile(name, note) {
    if (!this.native) return;
    const text = this.game._restoreText ? this.game._restoreText(name) : null;
    if (text != null) await this.native.writeFile(name, this.game._fill(text + (note ? "\n\n" + note : "")));
    delete persist.data.deleted[name];
    persist.save();
  }

  /* ---------- the player's camera (opt-in, see senses.js) ---------- */

  /**
   * Rei's polaroid, from the real camera: the player's own face, grainy black and white, with the figure
   * standing behind them. Resolves { taken, file } after the player clicks it away.
   */
  async photoReal({ senses, file = null, caption = "" }) {
    const shot = senses.snapshot(960, 720);
    if (!shot) return { taken: false };
    this.game.audio.sfx("shutter");
    await this.flash("#fff", 400);
    const W = 960, H = 720;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    ctx.drawImage(shot, 0, 0, W, H);
    // Something stands over your shoulder. It is a little too tall.
    ctx.filter = "blur(10px)";
    ctx.fillStyle = "rgba(8,8,12,0.78)";
    ctx.beginPath(); ctx.ellipse(W * 0.82, H * 0.24, 46, 58, 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W * 0.84, H * 0.78, 120, 230, 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.filter = "none";
    const data = ctx.getImageData(0, 0, W, H);
    for (let i = 0; i < data.data.length; i += 4) {
      const g = data.data[i] * 0.3 + data.data[i + 1] * 0.59 + data.data[i + 2] * 0.11;
      const n = (Math.random() - 0.5) * 34;
      data.data[i] = data.data[i + 1] = data.data[i + 2] = Math.max(0, Math.min(255, (g - 128) * 1.25 + 128 + n));
    }
    ctx.putImageData(data, 0, 0);
    ctx.fillStyle = "#ff9b3d";
    ctx.font = "bold 24px monospace";
    const d = new Date();
    ctx.fillText(`'${String(d.getFullYear()).slice(2)} ${d.getMonth() + 1} ${d.getDate()}  ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`, W - 270, H - 26);
    const url = c.toDataURL("image/png");
    if (file && this.native) { try { await this.native.writeImage(file, url); } catch (e) { /* folder not writable */ } }
    return new Promise(resolve => {
      const el = document.createElement("div");
      el.className = "polaroid-wrap";
      el.innerHTML = `<div class="polaroid real"><img alt="Rei's photo of you"><div class="polaroid-cap"></div></div>`;
      $("img", el).src = url;
      $(".polaroid-cap", el).textContent = this.game._fill(caption);
      this.fx.appendChild(el);
      el.addEventListener("click", () => { el.classList.add("out"); setTimeout(() => el.remove(), 500); resolve({ taken: true }); });
    });
  }

  /* ---------- the Office ---------- */

  /** A PA announcement: chime, red banner, and the Office's recorded voice (synthesized as a fallback). */
  async pa(text, { broken = false, template = null } = {}) {
    const audio = this.game.audio;
    audio.sfx(broken ? "chime_down" : "chime");
    const el = document.createElement("div");
    el.className = "pa-banner" + (broken ? " broken" : "");
    el.innerHTML = `<img class="pa-office" alt="" src="assets/sprites/office/${broken ? "eye" : "speak"}.webp"><div class="pa-head">${broken ? "◆ ANNOUNCEMENT FROM THE OFFICE ◆" : "♪ ding-dong · school announcement ♪"}</div><div class="pa-text"></div>`;
    $(".pa-text", el).textContent = text;
    this.fx.appendChild(el);
    await sleep(1300);
    const played = template && await audio.announce(template, this.vars(), { broken });
    if (!played) await audio.speak(text, broken ? { pitch: 0.2, rate: 0.7 } : {});
    await sleep(400);
    el.classList.add("out");
    setTimeout(() => el.remove(), 600);
  }

  /**
   * The Office's idea of a reward: an achievement popup, the kind that keeps people playing.
   * The girls hate them.
   */
  achievement(text) {
    const el = document.createElement("div");
    el.className = "achieve";
    el.innerHTML = `<span class="achieve-icon">★</span><span><small>ACHIEVEMENT UNLOCKED</small><b></b></span>`;
    $("b", el).textContent = this.game._fill(text);
    this.fx.appendChild(el);
    this.game.audio.sfx("sparkle");
    setTimeout(() => el.classList.add("out"), 3600);
    setTimeout(() => el.remove(), 4300);
  }

  /** Whisper: a line of text that appears at the edge of the screen and fades. */
  toast(text, ms = 3500) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = text;
    const side = Math.random() < 0.5 ? "left" : "right";
    el.style[side] = (3 + Math.random() * 10) + "%";
    el.style.top = (8 + Math.random() * 40) + "%";
    this.fx.appendChild(el);
    setTimeout(() => el.classList.add("out"), ms);
    setTimeout(() => el.remove(), ms + 1200);
  }

  /**
   * The phone: a group chat that plays out message by message. msgs are [who, text] pairs;
   * who is a CAST id, "me", or anything else (shown as an unknown number). Resolves when put away.
   */
  phone({ title = "Summer Squad ☀", msgs = [], note = "" } = {}) {
    const cast = this.game.cast;
    return new Promise(async resolve => {
      const el = document.createElement("div");
      el.className = "phone-wrap";
      el.innerHTML = `<div class="phone"><div class="phone-top"><span class="phone-time"></span><span>●●● ▮</span></div>
        <div class="phone-head"><b></b><small></small></div><div class="phone-msgs"></div>
        <div class="phone-foot">tap to put your phone away</div></div>`;
      $(".phone-time", el).textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      $(".phone-head b", el).textContent = this.game._fill(title);
      $(".phone-head small", el).textContent = note;
      this.fx.appendChild(el);
      const box = $(".phone-msgs", el);
      let fast = this.game.mode === "skip";
      el.addEventListener("click", () => { if (done) close(); else fast = true; });
      let done = false;
      const close = () => { el.classList.add("out"); setTimeout(() => el.remove(), 350); resolve(); };
      for (const [who, text] of msgs) {
        const info = cast[who];
        const row = document.createElement("div");
        const mine = who === "me";
        row.className = "bubble-row" + (mine ? " me" : "") + (who === "k" ? " k" : "") + (text === null ? " deleted" : "");
        row.style.setProperty("--who", mine ? "var(--pink)" : info ? info.color : "#9a9a9a");
        if (!mine) {
          const name = document.createElement("span");
          name.className = "bubble-name";
          name.textContent = info ? (info.name || who) : "unknown number";
          row.appendChild(name);
        }
        const b = document.createElement("div");
        b.className = "bubble";
        if (!fast && !mine) {
          b.innerHTML = `<i class="typing"><b></b><b></b><b></b></i>`;
          row.appendChild(b); box.appendChild(row); box.scrollTop = box.scrollHeight;
          await sleep(Math.min(1500, 450 + (text || "").length * 18));
        }
        b.textContent = text === null ? "This message was deleted." : this.game._fill(text);
        if (!b.parentElement) { row.appendChild(b); box.appendChild(row); }
        box.scrollTop = box.scrollHeight;
        this.game.audio.sfx("pop");
        if (!fast) await sleep(mine ? 500 : 350);
      }
      done = true;
      el.classList.add("done");
    });
  }

  /** A little card in the corner: something was added to the scrapbook. */
  memoryToast(title, book) {
    const el = document.createElement("div");
    el.className = "memo-toast";
    const icon = { list: "✓", photo: "▣", sketch: "✎", other: "✿", note: "?" }[book] || "♥";
    const label = book === "note" ? "in your scrapbook: What we know" : this.root.classList.contains("uncanny") ? "it kept this one too" : "added to your scrapbook ♡";
    el.innerHTML = `<span class="memo-icon">${icon}</span><span><small>${label}</small><b></b></span>`;
    $("b", el).textContent = title;
    this.fx.appendChild(el);
    this.game.audio.sfx("sparkle");
    setTimeout(() => el.classList.add("out"), 3200);
    setTimeout(() => el.remove(), 3800);
  }

  /** A silhouette that stands in the background for a moment. K. */
  async ghost(ms = 1400, x = 70) {
    const el = document.createElement("div");
    el.className = "ghost";
    el.style.left = x + "%";
    $("#stage").appendChild(el);
    this.game.audio.sfx("heartbeat");
    await sleep(ms);
    el.classList.add("out");
    setTimeout(() => el.remove(), 800);
  }

  /** Fake "program not responding" dialog. Resolves "wait" or "close". */
  crash() {
    this.game.audio.sfx("error");
    this.root.classList.add("frozen");
    return new Promise(resolve => {
      const el = document.createElement("div");
      el.className = "os-dialog";
      el.innerHTML = `
        <div class="os-title"><span>After Class</span><span>✕</span></div>
        <div class="os-body">
          <div class="os-icon">!</div>
          <div><b>After Class is not responding</b><br>If you close the program, you might lose information.</div>
        </div>
        <div class="os-buttons"><button data-a="close">Close the program</button><button data-a="wait">Wait for the program to respond</button></div>`;
      this.fx.appendChild(el);
      el.addEventListener("click", async e => {
        const a = e.target.dataset && e.target.dataset.a;
        if (!a) return;
        el.remove();
        if (a === "close") await this.blackout(2600);
        this.root.classList.remove("frozen");
        resolve(a);
      });
    });
  }

  /** VHS rewind through the last lines of the backlog, then the script jumps. */
  async rollback() {
    const lines = this.game.history.slice(-14).reverse();
    this.game.audio.sfx("rewind");
    this.root.classList.add("fx-rewind");
    const box = $("#say-text");
    const name = $("#say-name");
    for (const h of lines) {
      name.textContent = h.who ? h.who.split("").reverse().join("") : "";
      box.textContent = h.text.split("").reverse().join("");
      await sleep(110);
    }
    this.root.classList.remove("fx-rewind");
    await this.static(500);
  }

  /** The end credits roll, then get eaten. */
  async credits(lines, { tear = true } = {}) {
    const el = document.createElement("div");
    el.className = "credits";
    el.innerHTML = `<div class="credits-roll">${lines.map(l => `<p>${l}</p>`).join("")}</div>`;
    this.fx.appendChild(el);
    const roll = $(".credits-roll", el);
    roll.style.animationDuration = (lines.length * 1.1) + "s";
    await sleep(tear ? lines.length * 520 : lines.length * 1100);
    if (tear) {
      roll.style.animationPlayState = "paused";
      this.game.audio.play("wrong");
      await sleep(1200);
      el.classList.add("melt");
      await this.tear(1400);
    }
    el.remove();
  }

  /** A letter the player can take with them: a real text file download. */
  letter(filename, body) {
    return new Promise(resolve => {
      const el = document.createElement("div");
      el.className = "letter";
      el.innerHTML = `<div class="letter-paper"><pre></pre><div class="letter-actions">
        <button data-a="take">Take the letter</button><button data-a="leave">Leave it</button></div></div>`;
      $("pre", el).textContent = body;
      this.fx.appendChild(el);
      el.addEventListener("click", e => {
        const a = e.target.dataset && e.target.dataset.a;
        if (!a) return;
        if (a === "take" && this.native) {
          // In the .exe the letter goes straight into the game folder, and the folder opens on it.
          this.native.writeFile(filename, body).then(() => this.native.reveal(filename)).catch(() => {});
        } else if (a === "take") {
          const url = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
          const link = document.createElement("a");
          link.href = url; link.download = filename;
          document.body.appendChild(link); link.click(); link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
        }
        el.remove();
        resolve(a);
      });
    });
  }

  /** Leave a message for anyone who opens the developer console. */
  console(who, text) {
    const colors = { hina: "#e8893a", rei: "#9b7bd8", sayo: "#6fbfb8", office: "#c0392b", k: "#888" };
    console.log(`%c${who.toUpperCase()}%c ${text}`, `color:#fff;background:${colors[who] || "#444"};padding:2px 6px;border-radius:3px`, `color:${colors[who] || "#aaa"};font-size:13px`);
  }

  title(text) { document.title = text || this.baseTitle; }

  /* ---------- watchers ---------- */

  setWatch(name, on) {
    this.watch[name] = on;
    if (name === "cursor") $("#reticle").style.display = on ? "block" : "none";
  }

  /** A whisper that only ever happens once per session, and only while the rerun watchers are on. */
  _once(key, text) {
    if (!this.watch.tab || this._said.has(key)) return;
    this._said.add(key);
    this.toast(text, 4000);
  }

  /** In the rerun, right-click opens their menu instead of yours. */
  _contextMenu(e) {
    if (!this.watch.context) return;
    e.preventDefault();
    document.querySelectorAll(".ctx").forEach(m => m.remove());
    const m = document.createElement("div");
    m.className = "ctx";
    m.innerHTML = ["Back", "Reload (it won't help)", "Save as… K", "Inspect (Rei is inspecting you too)", "—", "Let them go"]
      .map(t => t === "—" ? `<hr>` : `<div class="ctx-item ${t === "Let them go" ? "" : "off"}">${t}</div>`).join("");
    m.style.left = Math.min(e.clientX, window.innerWidth - 260) + "px";
    m.style.top = Math.min(e.clientY, window.innerHeight - 220) + "px";
    document.body.appendChild(m);
    m.addEventListener("click", ev => {
      if (ev.target.textContent === "Let them go") this.toast("Not like this. On the roof. On Friday.", 3500);
      m.remove();
    });
    setTimeout(() => window.addEventListener("pointerdown", function close(ev) {
      if (!m.contains(ev.target)) { m.remove(); window.removeEventListener("pointerdown", close); }
    }), 0);
  }

  /* ---------- desktop-only (After Class.exe) ---------- */

  async shakeWindow(ms = 600, strength = 14) {
    this.shake(Math.min(ms, 500));
    if (this.native) await this.native.shake(ms, strength);
  }
  async jolt(dx = 0, dy = 90) { if (this.native) await this.native.jolt(dx, dy); }
  progress(v) { if (this.native) this.native.progress(v); }
  async writeFile(name, text) { if (!this.native) return false; try { return await this.native.writeFile(name, this.game._fill(text)); } catch (e) { return false; } }
  async fileExists(name) { return this.native ? this.native.exists(name) : false; }
  reveal(name) { if (this.native) this.native.reveal(name); }
  guardClose(msg) { if (this.native) this.native.guardClose(msg ? this.game._fill(msg) : null); }

  _onCloseAttempt(msg) {
    this.game.audio.sfx("heartbeat");
    this.shakeWindow(500, 10);
    const el = document.createElement("div");
    el.className = "plead";
    el.innerHTML = `<div class="plead-text"></div><div class="plead-hint">Close the window again to really quit.</div>`;
    $(".plead-text", el).textContent = msg;
    this.fx.appendChild(el);
    setTimeout(() => el.classList.add("out"), 6000);
    setTimeout(() => el.remove(), 7000);
  }

  /* ---------- Rei's camera ---------- */

  /**
   * Rei takes a photo of the current scene: a polaroid built from the background and sprites on screen,
   * with something standing behind you. In the .exe the print is also saved to the game folder.
   */
  async photo({ file = null, caption = "", ghost = true, color = false } = {}) {
    this.game.audio.sfx("shutter");
    await this.flash("#fff", 400);
    const W = 960, H = 540;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
    const bgUrl = (($("#bg .bg-img:last-child") || {}).style || {}).backgroundImage || "";
    const bgSrc = (bgUrl.match(/url\("?(.*?)"?\)/) || [])[1];
    const bgImg = bgSrc ? await load(bgSrc) : null;
    if (bgImg) ctx.drawImage(bgImg, 0, 0, W, H);
    // The figure that is always behind you: drawn before the girls, so it stands behind them.
    if (ghost) {
      ctx.filter = "blur(9px)";
      ctx.fillStyle = "rgba(10,10,14,0.8)";
      ctx.beginPath(); ctx.ellipse(W * 0.76, H * 0.36, 34, 42, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(W * 0.76, H * 0.86, 95, 175, 0, 0, Math.PI * 2); ctx.fill();
      ctx.filter = "none";
    }
    for (const el of document.querySelectorAll("#sprites .sprite")) {
      const img = await load(el.src);
      if (!img) continue;
      const h = H * 0.98, w = h * img.width / img.height;
      const x = parseFloat(el.style.left) / 100 * W - w / 2;
      ctx.drawImage(img, x, H - h * 0.95, w, h);
    }
    // Black-and-white film look and a date stamp.
    const data = ctx.getImageData(0, 0, W, H);
    if (!color) for (let i = 0; i < data.data.length; i += 4) {
      const g = data.data[i] * 0.3 + data.data[i + 1] * 0.59 + data.data[i + 2] * 0.11;
      const n = (Math.random() - 0.5) * 26;
      data.data[i] = data.data[i + 1] = data.data[i + 2] = Math.max(0, Math.min(255, g * 1.05 + n));
    }
    ctx.putImageData(data, 0, 0);
    ctx.fillStyle = "#ff9b3d";
    ctx.font = "bold 22px monospace";
    const d = new Date();
    ctx.fillText(`'${String(d.getFullYear()).slice(2)} ${d.getMonth() + 1} ${d.getDate()}  ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`, W - 250, H - 24);
    const url = c.toDataURL("image/png");
    if (file && this.native) { try { await this.native.writeImage(file, url); } catch (e) { /* folder not writable */ } }

    return new Promise(resolve => {
      const el = document.createElement("div");
      el.className = "polaroid-wrap";
      el.innerHTML = `<div class="polaroid"><img alt="Rei's photo"><div class="polaroid-cap"></div></div>`;
      $("img", el).src = url;
      $(".polaroid-cap", el).textContent = this.game._fill(caption);
      this.fx.appendChild(el);
      el.addEventListener("click", () => { el.classList.add("out"); setTimeout(() => el.remove(), 500); resolve(); });
    });
  }

  /** Called when the game is hidden or unfocused (tab switch, minimize, alt-tab), and again when it's back. */
  _setAway(away) {
    if (away === this._away) return;
    this._away = away;
    if (away) {
      this._hiddenAt = Date.now();
      if (this.watch.tab) {
        persist.set("tabouts", persist.data.tabouts + 1);
        document.title = `${this.game.name()}? come back`;
        if (this.native && Date.now() - this._lastNotify > 90000) {
          this._lastNotify = Date.now();
          setTimeout(() => {
            if (!this._away) return;
            this.native.notify("The Office", `${this.game.name()}, please return to class.`);
            this.native.flash();
          }, 4000);
        }
      }
      if (this._absenceResolve) this._absenceStart = Date.now();
    } else {
      const away = Date.now() - this._hiddenAt;
      if (this.watch.tab) {
        document.title = this.baseTitle;
        if (away > 1500) setTimeout(() => this.toast(`you were gone for ${Math.round(away / 1000)} seconds`), 600);
      }
      if (this._absenceResolve && this._absenceStart) {
        this._absenceTotal += Date.now() - this._absenceStart;
        this._absenceStart = 0;
        this._absenceCheck();
      }
    }
  }

  _idleTick() {
    if (!this.watch.idle || this._idleFired || this.game.busy) return;
    if (Date.now() - this._lastInput > 45000) {
      this._idleFired = true;
      const lines = [
        `${this.game.name()}? Are you still there?`,
        "It's so quiet when you stop clicking.",
        "Don't fall asleep. That's when it rewinds."
      ];
      this.toast(lines[Math.floor(Math.random() * lines.length)], 5000);
      this.game.audio.sfx("heartbeat");
    }
  }

  _moveReticle(e) {
    if (!this.watch.cursor) return;
    const r = $("#reticle");
    r.style.transform = `translate(${e.clientX - 30}px, ${e.clientY - 30}px)`;
  }

  /**
   * The true ending: resolves once the player has looked away from the game
   * (tab hidden) for `seconds` in total, or has stayed perfectly still for `idleSeconds`.
   */
  waitForAbsence(seconds = 20, idleSeconds = 75) {
    return new Promise(resolve => {
      this._absenceTotal = 0;
      this._absenceStart = 0;
      this._absenceResolve = resolve;
      this._absenceNeed = seconds * 1000;
      const idleStart = Date.now();
      this._lastInput = Date.now();
      this._absenceTimer = setInterval(() => {
        if (Date.now() - this._lastInput > idleSeconds * 1000 && Date.now() - idleStart > idleSeconds * 1000) this._absenceDone();
      }, 1000);
    });
  }
  _absenceCheck() { if (this._absenceTotal >= this._absenceNeed) this._absenceDone(); }
  _absenceDone() {
    clearInterval(this._absenceTimer);
    const r = this._absenceResolve;
    this._absenceResolve = null;
    r && r();
  }

  /* ---------- real-world details the script can quote ---------- */

  vars() {
    const now = new Date();
    const h = now.getHours();
    const daypart = h < 5 ? "the middle of the night" : h < 12 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night";
    const session = Date.now() - this.game.sessionStart;
    const away = persist.data.lastPlayed ? Date.now() - persist.data.lastPlayed : 0;
    return {
      name: this.game.name(),
      clock: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      weekday: now.toLocaleDateString([], { weekday: "long" }),
      daypart,
      late: h < 5 || h >= 23 ? "yes" : "",
      playtime: formatDuration(persist.data.totalMs + session),
      session: formatDuration(session),
      runs: String(persist.data.runs),
      clicks: String(persist.data.clicks),
      tabouts: String(persist.data.tabouts),
      away: formatDuration(this.game.awayMs || away),
      screen: `${window.innerWidth} by ${window.innerHeight}`,
      osname: this.osName || "",
      hesitated: (this.game.v.hesitate && this.game.v.hesitate.text) || "",
      hesitatedSecs: (this.game.v.hesitate && String(this.game.v.hesitate.secs)) || "",
      lastChoice: this.game.v.lastChoice || "",
      titletime: formatShort(persist.data.titleMs),
      titleloops: String(Math.max(1, Math.floor(persist.data.titleMs / 43000))),
      quithovers: String(persist.data.quitHovers),
      caught: String(persist.data.caught),
      memcount: String(this.game.memCount()),
      memtotal: String(this.game.memTotal()),
      item13: persist.data.item13 || "something you never wrote down",
      survey: persist.data.survey || "(no comment)",
      loads: String(persist.data.loads || 0),
      forgets: String(persist.data.forgets || 0),
      defy: String(this.game.v.defy || 0),
      endings: String(persist.data.endings.length),
      year: String(now.getFullYear()),
      date: now.toLocaleDateString([], { month: "long", day: "numeric" }),
      wanted: this.game.v.wanted || persist.data.wanted || "",
      after: persist.data.after || "go outside",
      outside: persist.data.outside || "",
      lookaways: String((this.game.senses && this.game.senses.lookAways) || 0),
      spoken: this.game.v.spoken || "",
      lastai: this.game.v.lastAiLine || "",
      oldai: this.game.v.oldAi || "",
      undid: (this.game.v.undid || "").replace(/^["“]|["”]$/g, ""),
      undos: String(persist.data.undos || 0),
      erased: { hina: "Hina", rei: "Rei", sayo: "Sayo" }[persist.data.erased] || ""
    };
  }
}
