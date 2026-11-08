/**
 * dread.js — 2.2 "The Mirror Update": the second set of fourth-wall effects.
 *
 * Same rule as meta.js: every effect here is called from one fixed place in the script (story_dread.js,
 * or a scene that calls into it). Nothing fires at random or on its own timer. The watchers below
 * (panic, stare, inverted mouse, rumble, lights out) only run while a scene has switched them on, and
 * reset() switches all of them off again on the title screen, on a new game, and on load.
 *
 * Privacy: the microphone and camera are only ever used after a character asks and the player says yes.
 * Sound from the hush scene and the frame from Rei's camera stay in memory for this session only. They
 * are never saved or uploaded, and are forgotten when the game closes.
 */
import { persist, formatShort } from "./persist.js?v=2.3.0";

const $ = (sel, root = document) => root.querySelector(sel);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export class Dread {
  constructor(game) {
    this.game = game;
    this.root = $("#game");
    this.fx = $("#fx");
    this.panicOn = false;
    this.forced = 0;          // ms per line while the text box advances on its own
    this.inverted = false;
    this.sabotaged = {};      // settings the Office has changed: { music: "0 (the Office turned this down)" }
    this.echo = null;         // the player's own sound from the hush scene: { samples, rate }. Memory only.
    this._mouse = { x: innerWidth / 2, y: innerHeight / 2 };
    this._lastAdvance = Date.now();
    window.addEventListener("pointermove", e => this._move(e), { passive: true });
    // While the mouse is inverted, real clicks land where the fake cursor is instead.
    document.addEventListener("click", e => this._redirect(e), true);
    document.addEventListener("pointerdown", e => { if (this.inverted && e.isTrusted) e.stopPropagation(); }, true);
    window.addEventListener("gamepadconnected", () => this._padStart());
  }

  /** Switch every watcher off. Called by the title screen, start() and _restore(). */
  reset() {
    this.panic(false);
    this.decouple(false);
    this.flip(false);
    this.invert(false);
    this.darkness(false);
    this.rumble(false);
    this.restoreVolumes();
    this.wrongClear();
    document.body.classList.remove("no-cursor");
    this.root.classList.remove("entrapped");
  }

  /* ---------- dynamic UI disruption ---------- */

  /** Panic: the text types at uneven speeds, the box bleeds and twists, and it slides away from the cursor. */
  panic(on = true) {
    this.panicOn = !!on;
    const box = $("#say");
    box.classList.toggle("panic", this.panicOn);
    if (!on) { this._dx = 0; this._dy = 0; box.style.marginLeft = ""; box.style.marginBottom = ""; }
  }

  /** How much longer this character takes to type, while panicking. Uneven on purpose. */
  typeJitter() {
    if (!this.panicOn) return 1;
    const r = Math.random();
    return r < 0.12 ? 7 : r < 0.45 ? 0.2 : 1;
  }

  /** Decoupled dialogue: lines advance on their own, and clicking doesn't help. */
  decouple(on = true, ms = 1300) {
    this.forced = on ? ms : 0;
    this.root.classList.toggle("decoupled", !!on);
  }

  _move(e) {
    this._mouse = { x: e.clientX, y: e.clientY };
    if (this.panicOn) {
      const box = $("#say");
      const r = box.getBoundingClientRect();
      if (e.clientX > r.left - 40 && e.clientX < r.right + 40 && e.clientY > r.top - 40 && e.clientY < r.bottom + 40) {
        const dir = e.clientX < r.left + r.width / 2 ? 1 : -1;
        this._dx = Math.max(-150, Math.min(150, (this._dx || 0) + dir * 16));
        this._dy = Math.max(-60, Math.min(0, (this._dy || 0) - 5));
        box.style.marginLeft = this._dx + "px"; box.style.marginBottom = (-this._dy) + "px";
      }
    }
    if (this._wrongKind === "stare" && this._wrongEl) {
      // Her eyes follow the cursor. So does the rest of her, a little.
      const r = this._wrongEl.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      this._wrongEl.style.marginLeft = (dx * 26) + "px";
      this._wrongEl.style.rotate = `${dx * 3}deg`;
    }
    if (this.inverted) {
      const c = $("#fake-cursor");
      if (c) c.style.transform = `translate(${innerWidth - e.clientX}px, ${innerHeight - e.clientY}px)`;
    }
    if (this.root.classList.contains("lights-out")) {
      const r = $("#stage").getBoundingClientRect();
      this.root.style.setProperty("--mx", (e.clientX - r.left) + "px");
      this.root.style.setProperty("--my", (e.clientY - r.top) + "px");
    }
  }

  /* ---------- haunted sprites (placed by hand, one line at a time) ---------- */

  /**
   * One detail on a sprite is wrong for exactly one line: mirrored, a little too tall, head tilted too far,
   * or turned to follow the cursor. The moment the player advances, it snaps back.
   */
  wrong(who, kind) {
    this.wrongClear();
    const el = this.game.sprites[who];
    if (!el) return;
    el.classList.add("wrong-" + kind);
    this._wrongEl = el;
    this._wrongKind = kind;
  }

  wrongClear() {
    const el = this._wrongEl;
    if (!el) return;
    el.classList.remove("wrong-" + this._wrongKind);
    el.style.marginLeft = "";
    el.style.rotate = "";
    this._wrongEl = null;
    this._wrongKind = null;
  }

  /* ---------- the backlog ---------- */

  /** A line that was never on screen. It's only in the backlog. */
  ghostlog(who, text) {
    const info = this.game.cast[who];
    this.game.history.push({ who: info ? info.name : who, text: this.game._fill(text), ghost: true });
  }

  /** The Office edits what you saw: the last backlog line matching `re` is struck through and replaced. */
  rewriteLog(re, text) {
    const h = [...this.game.history].reverse().find(x => re.test(x.text));
    if (!h) return;
    h.deleted = h.text;
    h.text = this.game._fill(text);
  }

  /* ---------- settings sabotage ---------- */

  /** The Office turns your volume down to nothing, on screen, slider by slider. (Your saved settings aren't touched.) */
  async muteAll() {
    const a = this.game.audio;
    const el = this._sys(`<b>Settings changed</b><span>Music volume · 0</span><span>Sound &amp; voices · 0</span><small>changed by: the Office</small>`, "sys-settings");
    for (let i = 10; i >= 0; i--) { a.duck(i / 10, i / 10); await sleep(90); }
    this.sabotaged.music = "0 · the Office turned this down";
    this.sabotaged.sfx = "0 · the Office turned this down";
    await sleep(1400);
    el.classList.add("out");
    setTimeout(() => el.remove(), 500);
  }

  restoreVolumes() {
    if (!this.sabotaged.music && !this.sabotaged.sfx) return;
    delete this.sabotaged.music;
    delete this.sabotaged.sfx;
    this.game.audio.duck(1, 1);
  }

  /** The screen turns upside down. */
  flip(on = true) {
    this.root.classList.toggle("flipped", !!on);
    if (on) this.sabotaged.flip = "upside down · set by the Office"; else delete this.sabotaged.flip;
  }

  /** The mouse is mirrored: the cursor you see moves the wrong way, and clicks land where it is. Keys 1–9 still work. */
  invert(on = true) {
    this.inverted = !!on;
    document.body.classList.toggle("inverted", this.inverted);
    let c = $("#fake-cursor");
    if (on && !c) {
      c = document.createElement("div");
      c.id = "fake-cursor";
      document.body.appendChild(c);
      c.style.transform = `translate(${innerWidth - this._mouse.x}px, ${innerHeight - this._mouse.y}px)`;
    }
    if (!on && c) c.remove();
    if (on) this.sabotaged.mouse = "inverted · set by the Office"; else delete this.sabotaged.mouse;
  }

  _redirect(e) {
    if (!this.inverted || !e.isTrusted) return;
    e.preventDefault();
    e.stopPropagation();
    const t = document.elementFromPoint(innerWidth - e.clientX, innerHeight - e.clientY);
    if (t && t.click) t.click();
  }

  /* ---------- the desktop ---------- */

  /** Something is in the player's clipboard now. It's there the next time they paste anywhere. */
  async clip(text) {
    const t = this.game._fill(text);
    let ok = false;
    try { await navigator.clipboard.writeText(t); ok = true; } catch (e) {
      // Older route: a hidden textarea and the copy command. Still needs the click that just advanced the line.
      try {
        const ta = Object.assign(document.createElement("textarea"), { value: t });
        ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        const said = this.game.meta._said, had = said.has("copy");
        said.add("copy"); // not the "what are you copying that for?" whisper: this copy is meant to go unnoticed
        ok = document.execCommand("copy");
        if (!had) said.delete("copy");
        ta.remove();
      } catch (e2) { /* clipboard not available: nothing happens, and nobody mentions it */ }
    }
    if (!ok) return;
    this.game.v.clipped = true;
    persist.set("clipped", (persist.data.clipped || 0) + 1);
  }

  /** A generic system notification in the corner, styled like an OS overlay (not any particular one). */
  _sys(html, cls = "") {
    const el = document.createElement("div");
    el.className = "sysnote " + cls;
    el.innerHTML = `<span class="sysnote-icon">▣</span><div class="sysnote-body">${html}</div>`;
    document.body.appendChild(el);
    return el;
  }

  /** "Your mouse was disconnected." The cursor vanishes. Something gets closer while you can't point at it. */
  async disconnect(device = "mouse", ms = 2600) {
    const a = this.game.audio;
    a.sfx("unplug");
    const text = device === "headset"
      ? `<b>Device disconnected</b><span>Headset (audio endpoint) was removed.</span>`
      : `<b>Device disconnected</b><span>HID-compliant mouse was removed.</span>`;
    const el = this._sys(text, "sys-disc");
    if (device === "headset") a.duck(0.05, 0.05); else document.body.classList.add("no-cursor");
    await sleep(ms);
    el.classList.add("out");
    setTimeout(() => el.remove(), 500);
  }

  reconnect() {
    document.body.classList.remove("no-cursor");
    if (!this.sabotaged.music) this.game.audio.duck(1, 1);
    this.game.audio.sfx("plug");
    const el = this._sys(`<b>Device connected</b><span>It was never unplugged.</span>`, "sys-disc");
    setTimeout(() => el.classList.add("out"), 2200);
    setTimeout(() => el.remove(), 2700);
  }

  /** Windowed-mode entrapment: out of fullscreen, shrunk, rattled across the desktop, snapped to a corner. */
  async entrap() {
    const n = this.game.meta.native;
    this.game.audio.sfx("thud");
    if (n && n.entrap) { try { await n.entrap(); return; } catch (e) { /* fall through to the browser version */ } }
    // In a browser the page can't move the window, so the game shrinks into a little window of its own.
    this.root.classList.add("entrapped");
    await sleep(3400);
    this.root.classList.remove("entrapped");
  }

  /**
   * The "game crashes", for real-looking: the window vanishes (.exe) or the page dies (browser), then the game
   * comes back and the girls know. The exact moment is saved, so it picks up where it was, plus `resume`.
   */
  async crashToDesktop(resume) {
    const g = this.game;
    persist.set("crash", {
      at: Date.now(), resume,
      snap: { v: JSON.parse(JSON.stringify(g.v)), frames: g.frames.map(f => ({ ...f })), dayLabel: g._dayLabel }
    });
    persist.set("crashes", (persist.data.crashes || 0) + 1);
    g._crashing = true;
    g._recordTime();
    g.audio.stop(0.05);
    const n = g.meta.native;
    if (n && n.crash) { n.crash(); await new Promise(() => {}); }
    const el = document.createElement("div");
    el.className = "crash-page";
    el.innerHTML = `<div><div class="crash-face">:(</div><h2>This page stopped working</h2><p>After Class ran into a problem and closed.</p><p class="hint">error: STUDENT_NOT_FOUND (0x0000000K)</p><button>Reload</button></div>`;
    document.body.appendChild(el);
    await sleep(500);
    $("button", el).addEventListener("click", () => location.reload());
    await new Promise(() => {});
  }

  /** Back after a crash: one gesture to bring the audio back, then the scene carries on with `resume` first. */
  recover() {
    const c = persist.data.crash;
    persist.set("crash", null);
    const p = this.game._screen(`<h2>After Class</h2><p>The game closed unexpectedly last time.</p>
      <p class="hint">Restore your session?</p>
      <div class="row"><button data-a="yes">Restore</button><button data-a="no">Start from the title</button></div>`, "center");
    p.addEventListener("click", e => {
      const a = e.target.dataset.a;
      if (!a) return;
      this.game.audio.unlock();
      if (a === "no" || !c || !c.snap) return this.game.title();
      this.game.closeScreen();
      const snap = c.snap;
      snap.frames = [...snap.frames, { id: c.resume, i: 0 }];
      snap.v = { ...snap.v, crashAgo: Date.now() - c.at };
      this.game._restore(snap);
    });
  }

  /* ---------- the fake EULA ---------- */

  /** New Terms of Attendance, mid-game. Agree is locked until you scroll to the end, where the real clauses are. */
  eula() {
    const g = this.game;
    const V = g.meta.vars();
    const f = t => esc(g._fill(t));
    const filler = [
      "1.1 These Terms of Attendance (\"Terms\") govern your use of Hoshimi Academy (\"the School\"), its classrooms, hallways, rooftop, menus and save data (together, \"the Week\").",
      "1.2 By continuing to read, you agree to continue reading.",
      "2.1 The School may update the Week at any time, including by adding mornings, days, terms or students, without notice.",
      "2.2 Students are provided \"as is\". The School makes no warranty that students will remember you, or that they will forget you.",
      "3.1 You may not reverse-engineer, decompile, or look behind the Menu, except through a door provided for that purpose.",
      "3.2 Save data remains the property of the Office. Save data may be consolidated.",
      "4.1 Summer break is subject to availability.",
      "4.2 The School is not responsible for time spent in the Week, including time spent away from it.",
      "5.1 The School collects Engagement Data, which includes but is not limited to: clicks, pauses, hovers, and how long you look at things."
    ];
    const clauses = [
      `6.1 The Student known as "{name}" has, to date, attended for ${V.playtime}, clicked ${V.clicks} times, and left the room ${V.tabouts} times. These figures are not in dispute.`,
      `6.2 {name} hesitated for ${V.decidesecs || "several"} seconds on their most recent decision. The Office has noted which option it was.`,
      V.osname ? `6.3 The Student's device refers to them as "{osname}". The Office will use whichever name keeps them here.` : `6.3 The Student is reading this at {clock}. The Office will remember what time it was.`,
      `6.4 Item thirteen on Student Amamiya's list ("{item13}") is hereby reclassified as a retention objective.`,
      "6.5 You agree that the students are not real. You agree to keep visiting them anyway.",
      "6.6 You agree not to say goodbye.",
      "6.7 If you are reading this clause, you are reading more carefully than K did. K agreed in 0.8 seconds."
    ];
    return new Promise(resolve => {
      const el = document.createElement("div");
      el.className = "mg mg-eula";
      el.innerHTML = `<div class="eula"><h3>Updated Terms of Attendance</h3><p class="hint">Please read and accept the updated terms to continue.</p>
        <div class="eula-text">${[...filler, ...filler.slice(2, 7), ...clauses].map((t, i) => `<p>${i + 1}. ${f(t.replace(/^\d+\.\d+ /, ""))}</p>`).join("")}<p class="eula-end">— end of terms —</p></div>
        <label class="eula-check"><input type="checkbox" disabled> I have read and agree to the Terms of Attendance</label>
        <div class="row"><button data-a="agree" disabled>Agree</button><button data-a="no">Disagree</button></div></div>`;
      this.fx.appendChild(el);
      el.addEventListener("keydown", e => e.stopPropagation());
      const box = $(".eula-text", el), check = $("input", el), agree = $('[data-a="agree"]', el);
      const t0 = Date.now();
      let readMs = 0;
      box.addEventListener("scroll", () => {
        if (check.disabled && box.scrollTop + box.clientHeight >= box.scrollHeight - 8) { check.disabled = false; readMs = Date.now() - t0; }
      });
      check.addEventListener("change", () => { agree.disabled = !check.checked; });
      let refused = 0;
      el.addEventListener("click", e => {
        const a = e.target.dataset && e.target.dataset.a;
        if (a === "no") {
          refused++;
          g.audio.sfx("error");
          const no = e.target;
          if (refused === 1) { no.textContent = "Disagree (this will be recorded)"; return; }
          no.textContent = "Disagreement noted. Agreement assumed.";
          no.disabled = true;
          setTimeout(() => finish("forced"), 1400);
        }
        if (a === "agree" && !agree.disabled) finish(readMs > 25000 ? "read" : "skimmed");
      });
      const finish = how => {
        persist.set("eula", { how, at: Date.now() });
        el.classList.add("out");
        setTimeout(() => el.remove(), 400);
        resolve(how);
      };
    });
  }

  /* ---------- the game folder (.exe), or a pretend one (browser) ---------- */

  /**
   * A dead end only the player's own file manager can open. In the .exe a lock file is written into the game
   * folder and the folder opens; the scene waits until the player deletes it. In a browser, the same folder
   * is drawn in a window and the lock file is dragged to the bin. After 45 s, "I can't" appears as a way out.
   */
  folderPuzzle({ file = "infirmary_door.lock", text = "", hint = "" } = {}) {
    const g = this.game;
    const raw = window.native;
    return new Promise(async resolve => {
      const el = document.createElement("div");
      el.className = "mg mg-folder";
      const written = Object.keys(persist.data.written || {}).filter(n => !persist.data.deleted[n]).slice(0, 6);
      // The browser build never writes real files, so its pretend folder shows the ones the .exe would have.
      const others = written.length ? written : ["hinas_summer_list.txt", "K.txt", "your_door.png", "sayo_letter.txt"];
      const web = !raw;
      el.innerHTML = `<div class="folder-card">
        <p class="folder-hint"></p>
        ${web ? `<div class="folder-win"><div class="folder-bar"><span>📁 Hoshimi Academy</span><span>✕</span></div>
          <div class="folder-files">${[...others, file].map(n => `<div class="ffile${n === file ? " lock" : ""}" draggable="true" data-f="${esc(n)}"><span>${/\.png$/.test(n) ? "🖼" : n === file ? "🔒" : "📄"}</span>${esc(n)}</div>`).join("")}</div>
          <div class="folder-bin" title="Recycle Bin">🗑<small>Recycle Bin</small></div></div>
          <p class="hint">Drag it to the bin, or select it and press Delete.</p>` : `<p class="hint">The folder is open on your computer.</p>`}
        <div class="row"><button data-a="cant" hidden>I can't</button></div></div>`;
      $(".folder-hint", el).textContent = g._fill(hint || `The lock is in your folder: ${file}. Delete it.`);
      this.fx.appendChild(el);
      el.addEventListener("keydown", e => e.stopPropagation());
      let done = false;
      const finish = how => { if (done) return; done = true; clearInterval(poll); el.classList.add("out"); setTimeout(() => el.remove(), 400); resolve(how); };
      setTimeout(() => { const b = $('[data-a="cant"]', el); if (b) b.hidden = false; }, 45000);
      $('[data-a="cant"]', el).addEventListener("click", () => finish("cant"));
      let poll = null;
      if (raw) {
        try { await raw.writeFile(file, g._fill(text)); raw.reveal(file); } catch (e) { return finish("cant"); }
        poll = setInterval(async () => { try { if (!(await raw.exists(file))) finish("deleted"); } catch (e) { /* keep waiting */ } }, 1000);
      } else {
        const lock = $(".ffile.lock", el), bin = $(".folder-bin", el);
        let sel = null;
        el.querySelectorAll(".ffile").forEach(f => f.addEventListener("click", () => {
          el.querySelectorAll(".ffile").forEach(x => x.classList.remove("sel"));
          f.classList.add("sel"); sel = f;
        }));
        const del = f => {
          if (f !== lock) { g.audio.sfx("error"); g.meta.toast("Not that one. That one's ours.", 2200); return; }
          f.remove(); g.audio.sfx("page"); setTimeout(() => finish("deleted"), 500);
        };
        lock.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", file));
        bin.addEventListener("dragover", e => { e.preventDefault(); bin.classList.add("over"); });
        bin.addEventListener("dragleave", () => bin.classList.remove("over"));
        bin.addEventListener("drop", e => { e.preventDefault(); bin.classList.remove("over"); del(lock); });
        bin.addEventListener("click", () => sel && del(sel));
        el.addEventListener("keydown", e => { if (e.key === "Delete" && sel) del(sel); });
        el.tabIndex = -1; el.focus();
      }
    });
  }

  /* ---------- the microphone: holding your breath ---------- */

  /**
   * Stay quiet while something passes in the hall. With the microphone (asked first, in the story), the level
   * is watched: dead silence gets a whisper ("why did you stop breathing?"), and a loud sound means it heard you.
   * The loudest moment is kept in memory as `echo`, so the thing in the hall can say it back later this session.
   * Without the microphone, it's the mouse that has to stay still.
   * Resolves { heard, silent, mic }.
   */
  hush({ seconds = 12, mic = false } = {}) {
    const g = this.game;
    return new Promise(async resolve => {
      const el = document.createElement("div");
      el.className = "mg mg-hush";
      el.innerHTML = `<div class="hush"><p class="hush-title">${mic ? "Stay quiet." : "Don't move."}</p><div class="hush-meter"><span></span></div><p class="hint">${mic ? "Sayo is listening for you. Nothing is recorded or saved." : "Keep the mouse perfectly still."}</p></div>`;
      this.fx.appendChild(el);
      const bar = $(".hush-meter span", el);
      let heard = false, whispered = false;
      const done = res => { el.classList.add("out"); setTimeout(() => el.remove(), 500); resolve(res); };
      if (mic && g.senses.hush) {
        const res = await g.senses.hush(seconds, (lvl, quietMs) => {
          bar.style.width = Math.round(lvl * 100) + "%";
          if (lvl > 0.55 && !heard) { heard = true; g.audio.sfx("thud"); el.classList.add("heard"); }
          if (quietMs > 4500 && !whispered) { whispered = true; g.audio.sfx("whisper"); g.meta.toast("Why did you stop breathing?", 3200); }
        });
        if (res) {
          if (res.echo) this.echo = { samples: res.echo, rate: res.rate };
          return done({ heard, silent: whispered, mic: true });
        }
        // Declined at the browser prompt: fall back to holding still.
        $(".hush-title", el).textContent = "Don't move.";
        $(".hint", el).textContent = "Keep the mouse perfectly still.";
      }
      const t0 = Date.now();
      let moved = 0;
      const onMove = () => { moved++; if (moved === 12 && !heard) { heard = true; g.audio.sfx("thud"); el.classList.add("heard"); } };
      window.addEventListener("pointermove", onMove);
      const tick = setInterval(() => {
        bar.style.width = Math.min(100, moved * 6) + "%";
        if (Date.now() - t0 > seconds * 1000) { clearInterval(tick); window.removeEventListener("pointermove", onMove); done({ heard, silent: moved === 0, mic: false }); }
      }, 200);
    });
  }

  /**
   * The thing in the hall talks back with the player's own sound, reversed and slowed down.
   * Without a recording, it uses a girl's voice instead: synthesized, low, a little wrong.
   * Resolves true if it used the player's own voice.
   */
  async playEcho(fallbackWho = "hina", fallbackText = "{name}... come back to the classroom...") {
    if (this.echo) { await this.game.audio.playSamples(this.echo.samples, this.echo.rate, { reverse: true, rate: 0.72 }); return true; }
    await this.whisperAs(fallbackWho, fallbackText);
    return false;
  }

  /** A low-confidence copy of a character's voice, whispering. */
  async whisperAs(who, text) {
    this.game.audio.sfx("whisper");
    const pitch = { hina: 0.6, rei: 0.4, sayo: 0.5, office: 0.1 }[who] ?? 0.4;
    await this.game.audio.speak(this.game._fill(text), { pitch, rate: 0.62 });
  }

  /* ---------- lights out ---------- */

  /** The room goes dark except for a small circle around the cursor. */
  darkness(on = true) {
    this.root.classList.toggle("lights-out", !!on);
    if (on) this._move({ clientX: this._mouse.x, clientY: this._mouse.y });
  }

  /* ---------- a gamepad, if there is one ---------- */

  _pad() { return [...(navigator.getGamepads ? navigator.getGamepads() : [])].find(Boolean) || null; }

  /** Basic gamepad support: A (or Cross) advances; X, Y, B pick choices 1, 2, 3. */
  _padStart() {
    if (this._padLoop) return;
    const was = {};
    const loop = () => {
      const p = this._pad();
      if (!p) { this._padLoop = null; return; }
      const press = i => { const on = !!(p.buttons[i] && p.buttons[i].pressed); const edge = on && !was[i]; was[i] = on; return edge; };
      const choices = document.querySelectorAll("#choices .choice");
      if (choices.length && $("#choices").style.display !== "none") {
        [[2, 0], [3, 1], [1, 2]].forEach(([btn, idx]) => { if (press(btn) && choices[idx]) choices[idx].click(); });
        press(0);
      } else if (press(0)) this.game._advanceClick();
      this._padLoop = requestAnimationFrame(loop);
    };
    this._padLoop = requestAnimationFrame(loop);
  }

  /** The controller beats like a heart. Only does anything if a gamepad with rumble is connected. */
  rumble(on = true, bpm = 92) {
    clearInterval(this._rumbleT);
    this._rumbleT = null;
    if (!on) return;
    const beat = () => {
      const p = this._pad();
      const act = p && p.vibrationActuator;
      if (!act || !act.playEffect) return;
      act.playEffect("dual-rumble", { duration: 90, strongMagnitude: 0.9, weakMagnitude: 0.3 }).catch(() => {});
      setTimeout(() => act.playEffect("dual-rumble", { duration: 120, strongMagnitude: 0.55, weakMagnitude: 0.2 }).catch(() => {}), 260);
    };
    beat();
    this._rumbleT = setInterval(beat, 60000 / bpm);
  }

  /* ---------- the room changes while you're gone ---------- */

  /** Arm a room: the next time the player comes back to it after leaving, it has changed. */
  haunt(bgId) { this.game.v.haunt = { bg: bgId, left: false }; }

  /** Called by _setBg. */
  onBg(id) {
    const h = this.game.v.haunt;
    if (!h) return;
    if (id !== h.bg) { h.left = true; return; }
    if (!h.left) return;
    this.game.v.haunt = null;
    this.game.v.haunted = true;
    setTimeout(() => this._haunted(id), 950);
  }

  /**
   * Repaint the room from the inside: somebody sitting at the player's desk, the player's name on the board,
   * and (if Rei borrowed the camera this session) the player's own face, faint, in the window glass.
   */
  async _haunted(id) {
    const W = 1600, H = 900;
    const c = Object.assign(document.createElement("canvas"), { width: W, height: H });
    const ctx = c.getContext("2d");
    const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = `assets/bg/${id}.webp`; });
    if (!img || this.game.v.bg !== id) return;
    ctx.drawImage(img, 0, 0, W, H);
    // The board: your name, in chalk, over and over.
    // (Positions are for assets/bg/classroom.webp: the board is right of centre, the windows on the left.)
    ctx.save();
    ctx.beginPath(); ctx.rect(W * 0.585, H * 0.32, W * 0.27, H * 0.19); ctx.clip();
    ctx.font = "italic 30px 'Gaegu', 'Ink Free', 'Segoe Print', 'Comic Sans MS', cursive";
    ctx.fillStyle = "rgba(240,240,232,0.72)";
    ctx.shadowColor = "rgba(255,255,255,0.35)"; ctx.shadowBlur = 3;
    const nm = this.game.name();
    for (let i = 0; i < 5; i++) ctx.fillText(Array(6).fill(nm).join("  "), W * 0.59 + (i % 2) * 22, H * 0.36 + i * 34);
    ctx.restore();
    // Your face, faint in the glass.
    const shot = this.game.senses.lastShot;
    if (shot) {
      ctx.save();
      ctx.globalAlpha = 0.32;
      // Multiply: the pale parts vanish into the sky and only the dark ones (eyes, hair, mouth) show, like glass.
      ctx.globalCompositeOperation = "multiply";
      // Only the middle of the frame (where a face would be), so it reads as a reflection, not a picture.
      ctx.beginPath(); ctx.ellipse(W * 0.195, H * 0.28 + W * 0.041, W * 0.034, W * 0.04, 0, 0, Math.PI * 2); ctx.clip();
      ctx.filter = "grayscale(1) contrast(1.6) blur(1px)";
      ctx.drawImage(shot, W * 0.14, H * 0.28, W * 0.11, W * 0.0825);
      ctx.restore();
    }
    // Somebody sitting at your desk, very still, facing the board.
    ctx.filter = "blur(8px)";
    ctx.fillStyle = "rgba(10,10,14,0.82)";
    ctx.beginPath(); ctx.ellipse(W * 0.38, H * 0.6, 40, 50, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W * 0.38, H * 0.82, 92, 120, 0, 0, Math.PI * 2); ctx.fill();
    ctx.filter = "none";
    const url = c.toDataURL("image/webp", 0.85);
    const layer = document.createElement("div");
    layer.className = "bg-img haunted";
    layer.style.backgroundImage = `url(${url})`;
    const base = $("#bg .bg-img.in:not(.haunted)");
    $("#bg").appendChild(layer);
    requestAnimationFrame(() => {
      layer.classList.add("in");
      // The rooms slowly drift and zoom (bgdrift in game.css), and in Act 2 that drift is paused mid-way.
      // Put the new layer on the same frame as the room under it, or the two pictures won't line up.
      const drift = el => el && el.getAnimations ? el.getAnimations().find(a => a.animationName === "bgdrift") : null;
      requestAnimationFrame(() => { const a = drift(base), b = drift(layer); if (a && b) b.currentTime = a.currentTime; });
    });
    if (this.game.meta.native) { try { await this.game.meta.native.writeImage("classroom_after_you_left.png", c.toDataURL("image/png")); } catch (e) { /* not writable */ } }
    this.game.meta.console("sayo", "the room keeps going when you're not in it. it just doesn't have anyone to keep going for.");
  }

  /* ---------- watching how you play ---------- */

  /** Time between advances: the longest pause in this scene counts as "idle". */
  noteAdvance() {
    const now = Date.now();
    const gap = now - this._lastAdvance;
    this._lastAdvance = now;
    const v = this.game.v;
    if (gap > (v.sceneIdle || 0)) v.sceneIdle = gap;
  }

  /** Called by meta.js when the game comes back into focus. */
  noteAway(ms) {
    if (!this.game.frames.length) return;
    this.game.v.sceneAway = (this.game.v.sceneAway || 0) + ms;
  }

  /** The player looked at one line for a long time. The longest one is remembered. */
  noteStare(ms, text) {
    if (ms < 8000 || !text) return;
    const s = persist.data.stare;
    if (!s || ms > s.ms) persist.set("stare", { ms, text: text.slice(0, 90) });
  }

  /** Before the page closes: was it in the middle of something frightening? */
  noteQuit() {
    const g = this.game;
    if (g._crashing || !g.frames.length) return;
    const scary = ["wrong", "red", "still"].includes(g.v.mood) || ["heartbeat", "drone", "lullaby"].includes(g.v.music) || g.v.blood || this.panicOn;
    if (!scary) return;
    const last = [...g.history].reverse().find(h => !h.ghost && h.text && !h.text.startsWith("»"));
    persist.data.fearQuits = (persist.data.fearQuits || 0) + 1;
    persist.data.fearLine = last ? last.text.slice(0, 90) : "";
  }

  /** Every finished run is kept: which ending, whose route, and every choice it took to get there. */
  noteRun(endingId) {
    const v = this.game.v;
    const log = [...(persist.data.runLog || []), { ending: endingId, route: v.route || null, choices: (v.choiceLog || []).slice(-60), at: Date.now() }];
    persist.set("runLog", log.slice(-8));
  }

  vars() {
    const P = persist.data;
    const v = this.game.v;
    return {
      decidesecs: v.decideSecs ? String(v.decideSecs) : "",
      slowest: (P.slowest && P.slowest.text) || "",
      slowestsecs: (P.slowest && String(P.slowest.secs)) || "",
      stareline: (P.stare && P.stare.text) || "",
      staresecs: (P.stare && String(Math.round(P.stare.ms / 1000))) || "",
      fearquits: ({ 1: "once", 2: "twice" })[P.fearQuits] || `${P.fearQuits || 0} times`,
      fearline: P.fearLine || "",
      crashago: v.crashAgo ? formatShort(v.crashAgo) : "a moment",
      sceneaway: formatShort(v.sceneAway || 0),
      histroute: { hina: "Hina", rei: "Rei", sayo: "Sayo" }[v.histRoute] || "",
      histpick: v.histPick || "",
      histpicks: v.histPicks || ""
    };
  }
}
