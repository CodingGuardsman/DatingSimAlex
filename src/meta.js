/**
 * meta.js — The fourth-wall effects. Each one is called deliberately from the story script;
 * nothing here fires at random. Watchers (tab, idle, cursor) only run while the script turns them on.
 */
import { persist, formatDuration, formatShort } from "./persist.js?v=2.3.0";

const $ = (sel, root = document) => root.querySelector(sel);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const K_SPRITE = "assets/sprites/k/neutral.webp";
const loadImage = src => new Promise(resolve => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = src;
});

async function drawPhotoGhost(ctx, { x, bottom, height, opacity }) {
  const figure = await loadImage(K_SPRITE);
  if (!figure) return;
  const { width, height: frameHeight } = ctx.canvas;
  const h = frameHeight * height;
  const w = h * figure.naturalWidth / figure.naturalHeight;
  ctx.save();
  ctx.filter = "grayscale(1) brightness(.3) blur(1.8px)";
  ctx.globalAlpha = opacity;
  ctx.drawImage(figure, width * x - w / 2, frameHeight * bottom - h, w, h);
  ctx.restore();
}

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
    this.osName = "";
    this.otherApp = "";
    this.pendingDeleted = [];
    this.native = window.native ? this._wrapNative(window.native) : null;
    this.refreshOtherApp();
    if (this.native) {
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

  async refreshOtherApp() {
    const request = this._otherAppRequest = {};
    if (!this.native || typeof this.native.runningApp !== "function" || persist.data.settings.notice === false) {
      this.otherApp = "";
      return;
    }
    try {
      const app = await this.native.runningApp();
      if (this._otherAppRequest === request && persist.data.settings.notice !== false) {
        this.otherApp = typeof app === "string" ? app : "";
      }
    } catch (e) {
      if (this._otherAppRequest === request) this.otherApp = "";
    }
  }

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
  /** CGs with redrawn frames (<id>_f1..f3.webp). They cycle in hard steps, a different drawing each time (Slay the Princess does this). */
  _frames(id) { return ["cute_hina","cute_rei","cute_sayo","cute_hina_desk","h_hina_blank","h_rei_flash","h_sayo_scribble","h_nurse_glitch","h_okada_reach","h_kanda_board","h_stalk_2","h_stalk_3","h_stalk_face","m_hina_4","m_rei_4","m_sayo_4"].includes(id) ? [id, id + "_f1", id + "_f2", id + "_f3"] : null; }

  _frameLoop(el, id) {
    const frames = !matchMedia("(prefers-reduced-motion: reduce)").matches && this._frames(id);
    if (!frames) return null;
    const images = frames.map(f => { const img = new Image(); img.src = `assets/cg/${f}.webp`; return img; });
    const horror = this._graphic(id);
    let k = 0, dir = 1, timer;
    const step = () => {
      if (!el.isConnected) return;
      k += dir;
      if (Math.random() < (horror ? 0.25 : 0.1)) k = Math.floor(Math.random() * frames.length);
      if (k >= frames.length - 1) dir = -1;
      if (k <= 0) dir = 1;
      if (images[k].naturalWidth) el.style.backgroundImage = `url(${images[k].src})`;
      // Calm CGs hold each drawing for about a second; flicking redrawn frames every ~200ms made them boil.
      timer = setTimeout(step, (horror ? 70 : 800) + Math.random() * (horror ? 90 : 900));
    };
    timer = setTimeout(step, 400);
    return () => clearTimeout(timer);
  }

  cg(id, { fade = true } = {}) {
    const stage = $("#stage");
    let layer = $("#cg");
    if (!layer) { layer = document.createElement("div"); layer.id = "cg"; stage.appendChild(layer); }
    this.game.v.cg = id || null;
    if (!id) {
      this._animatedCgUntil = 0;
      layer.classList.remove("in");
      setTimeout(() => { if (!this.game.v.cg) layer.innerHTML = ""; }, 700);
      return;
    }
    const img = document.createElement("div");
    img.className = "cg-img" + (this._graphic(id) && !this.goreOn ? " withheld" : "") + (this._graphic(id) ? " glitchy" : "");
    img.style.backgroundImage = `url(assets/cg/${id}.webp)`;
    if (!fade) img.style.transition = "none";
    // The darkroom: the rope creaks while it's on screen.
    if (id === "h_darkroom" && this.goreOn) this.game.audio.sfx("creak");
    layer.appendChild(img);
    const animated = !!this._frameLoop(img, id);
    layer.classList.toggle("framed", animated);
    this._animatedCgUntil = animated ? performance.now() + 3000 : 0;
    layer.classList.add("in");
    requestAnimationFrame(() => img.classList.add("in"));
    setTimeout(() => { while (layer.children.length > 1) layer.firstElementChild.remove(); }, fade ? 900 : 0);
  }

  /** Let an animated illustration breathe before the script replaces it. */
  async nextCG(id) {
    const frames = this.game.frames;
    const remaining = this._animatedCgUntil - performance.now();
    if (remaining > 0) await sleep(remaining);
    if (this.game.frames === frames) this.cg(id);
  }

  /**
   * A cut to black, a close-up, then darkness again. Called at fixed points in the script.
   * Gentle mode swaps the reveal for a brief blackout.
   */
  async scare(id, ms = 700) {
    const audio = this.game.audio;
    if (!this.goreOn) { audio.sfx("static"); await this.blackout(Math.min(ms, 400)); return; }
    const el = document.createElement("div");
    el.className = "scare";
    el.setAttribute("aria-hidden", "true");
    const art = new Image();
    art.className = "scare-art";
    art.alt = "";
    art.src = `assets/cg/${id}.webp`;
    el.appendChild(art);
    this.fx.appendChild(el);
    audio.scareSilence(true);
    try {
      const [decoded] = await Promise.all([art.decode().then(() => true, () => false), sleep(340)]);
      audio.sfx("scare");
      if (decoded) el.classList.add("hit");
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this.shake(130);
        if (this.native) this.native.shake(130, 8).catch(() => {});
      }
      await sleep(ms);
      el.classList.remove("hit");
      await sleep(220);
    } finally {
      el.remove();
      audio.scareSilence(false);
    }
  }

  /**
   * Turn around. The player controls the camera (drag / arrows / wheel). The room in front is empty. Something is behind them,
   * and it is closer every time they look away from it: each look behind shows the next stage, the swap happening while they face
   * front. The fourth time they turn, it is right there. Resolves after the scare.
   */
  async lookBehind({ cleanShadow = false } = {}) {
    const audio = this.game.audio;
    const gentle = !this.goreOn;
    // 2.3: the stalker art is a faceless shadow now (no gore), so Rei's scene uses it too. The sprite silhouette is for gore-off.
    const silhouette = gentle;
    const front = silhouette ? "assets/bg/classroom.webp" : "assets/cg/h_stalk_front.webp";
    const stages = ["h_stalk_1", "h_stalk_2", "h_stalk_3", "h_stalk_face"];
    const root = document.createElement("div");
    root.className = silhouette ? "behind clean-shadow" : "behind";
    root.innerHTML = `<div class="behind-strip"><div style="background-image:url(${front})"></div><div></div></div>
      <div class="behind-dial"><i></i></div>
      <div class="behind-hint">Hold → or drag left to look behind you.</div>`;
    this.fx.appendChild(root);
    if (!gentle) (silhouette ? stages.slice(-1) : stages).forEach(id => { const i = new Image(); i.src = `assets/cg/${id}.webp`; });
    const strip = root.firstElementChild, hint = root.lastElementChild, back = strip.lastElementChild;
    const knob = root.querySelector(".behind-dial i");
    let stopBackFrames;
    if (silhouette) {
      back.classList.add("behind-shadow-scene");
      back.style.backgroundImage = `url(${front})`;
      back.innerHTML = `<img class="behind-figure" src="${K_SPRITE}" alt="" draggable="false">`;
      back.dataset.stage = "0";
    } else {
      back.style.backgroundImage = `url(assets/cg/${stages[0]}.webp)`;
    }
    let pan = 0, lastPan = 0, dragging = false, lastX = 0, hold = 0, seen = false, stage = 0, beat = 0, whisper = 0;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const keys = new Set();
    const down = e => { dragging = true; lastX = e.clientX; };
    const up = () => { dragging = false; };
    const move = e => { if (!dragging) return; pan = Math.max(0, Math.min(1, pan - (e.clientX - lastX) / innerWidth * 1.4)); lastX = e.clientX; };
    const wheel = e => { pan = Math.max(0, Math.min(1, pan + e.deltaY / 1400)); };
    const kd = e => {
      const key = e.key.toLowerCase();
      if (!["arrowleft", "arrowright", "a", "d"].includes(key)) return;
      e.preventDefault(); e.stopImmediatePropagation(); keys.add(key);
    };
    const ku = e => keys.delete(e.key.toLowerCase());
    const blur = () => { keys.clear(); up(); };
    root.addEventListener("pointerdown", down); addEventListener("pointerup", up); addEventListener("pointermove", move);
    addEventListener("pointercancel", up); addEventListener("blur", blur);
    addEventListener("wheel", wheel, { passive: true }); addEventListener("keydown", kd, true); addEventListener("keyup", ku);
    const t0 = performance.now(); let last = t0;
    await new Promise(resolve => {
      const tick = now => {
        const dt = Math.min(50, now - last); last = now; const t = now - t0;
        if (keys.has("arrowright") || keys.has("d")) pan = Math.min(1, pan + dt / 1800);
        if (keys.has("arrowleft") || keys.has("a")) pan = Math.max(0, pan - dt / 1800);
        // Turning your head, not sliding a picture: the room swings round the middle of the screen and smears when you turn fast.
        const speed = Math.abs(pan - lastPan) / Math.max(dt, 1) * 1000; lastPan = pan;
        strip.style.transformOrigin = `${25 + pan * 50}% 50%`;
        strip.style.transform = reduce ? `translateX(${-pan * 50}%)` : `translateX(${-pan * 50}%) rotateY(${-Math.sin(pan * Math.PI) * 14}deg) scale(${1 + Math.sin(pan * Math.PI) * 0.08})`;
        strip.style.filter = reduce ? "" : `blur(${Math.min(5, speed * 4).toFixed(1)}px)`;
        knob.style.left = `${pan * 100}%`;
        const dread = Math.min(1, (stage + pan) / 3.5);
        if (!silhouette) root.style.filter = `brightness(${1 - 0.25 * pan}) contrast(${1 + 0.5 * dread})`;
        if (stage < 3 || pan < 0.9) { if (t - beat > 1500 - 1000 * dread) { beat = t; audio.sfx("heartbeat"); if (!gentle && pan > 0.4) this.shake(100); } }
        // looked behind: it counts once they've actually stared at it for a moment
        if (pan > 0.9) {
          hold += dt;
          if (hold > 900 && !seen) {
            if (gentle) return resolve();
            seen = true;
            hint.textContent = stage >= 3 ? "...It's gone. Turn back around." : "Hold ← or drag right to turn back.";
          }
        } else hold = 0;
        // The last time, the room behind you is empty. It is in front of you now.
        if (pan < 0.12 && seen && stage >= 3) {
          strip.firstElementChild.style.backgroundImage = `url(assets/cg/${stages[3]}.webp)`;
          stopBackFrames?.();
          stopBackFrames = this._frameLoop(strip.firstElementChild, stages[3]);
          return resolve();
        }
        // facing front again: it moves, unseen
        if (pan < 0.25 && seen && stage < 3) {
          seen = false;
          stage++;
          if (stage >= 3 && !silhouette) {
            // it has left the room behind you: show the same room, empty
            stopBackFrames?.(); stopBackFrames = null;
            back.style.backgroundImage = `url(${front})`;
            hint.textContent = "Hold → or drag left to look behind you.";
            if (t - whisper > 500) { whisper = t; audio.sfx("whisper"); }
            requestAnimationFrame(tick);
            return;
          }
          hint.textContent = "Hold → or drag left to look behind you.";
          if (silhouette && stage < 3) back.dataset.stage = String(stage);
          else {
            back.classList.remove("behind-shadow-scene");
            back.replaceChildren();
            back.style.backgroundImage = `url(assets/cg/${stages[stage]}.webp)`;
            stopBackFrames?.();
            stopBackFrames = this._frameLoop(back, stages[stage]);
            root.classList.toggle("framed", !!stopBackFrames);
          }
          if (t - whisper > 500) { whisper = t; audio.sfx("whisper"); }
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    root.removeEventListener("pointerdown", down); removeEventListener("pointerup", up); removeEventListener("pointermove", move);
    removeEventListener("pointercancel", up); removeEventListener("blur", blur);
    removeEventListener("wheel", wheel); removeEventListener("keydown", kd, true); removeEventListener("keyup", ku);
    audio.sfx(gentle ? "whisper" : "scare");
    if (!gentle) {
      root.classList.add("slam");
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this.shake(130);
        if (this.native) this.native.shake(130, 8).catch(() => {});
      }
    }
    await sleep(1600);
    stopBackFrames?.();
    root.classList.add("out");
    await sleep(200);
    root.remove();
  }

  /**
   * A face turning from cute to horror, in hard cuts that speed up and stutter back and forth (like a bad connection).
   * ids = the frames in order, cute first, horror last. Resolves when the last frame is on screen.
   */
  async morph(ids, holds = [1100, 800, 520, 340]) {
    const audio = this.game.audio;
    if (!this.goreOn) { this.cg(ids[0]); await sleep(900); return; }
    ids.forEach(id => { const i = new Image(); i.src = `assets/cg/${id}.webp`; });
    this.cg(ids[0], { fade: false });
    for (let k = 1; k < ids.length; k++) {
      await sleep(holds[k - 1] ?? 300);
      audio.sfx("glitch"); this.shake(140);
      // stutter: it goes forward, flinches back, then forward again
      this.cg(ids[k], { fade: false }); await sleep(70);
      this.cg(ids[k - 1], { fade: false }); await sleep(55);
      this.cg(ids[k], { fade: false });
    }
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

  syncGraphicHorror() {
    this.blood(this.game.v.blood);
    document.querySelectorAll("#cg .cg-img.glitchy").forEach(img => img.classList.toggle("withheld", !this.goreOn));
  }

  /* ---------- the game folder (.exe) ---------- */

  /**
   * Copies share a save profile, but each copy has its own game folder.
   * Only a file recorded in this folder can go missing from it.
   */
  _wrapNative(raw) {
    this._fileStateReady = this._openFileState(raw).catch(() => null);
    const remember = async name => {
      const state = await this._fileStateReady;
      if (!state) return;
      state.written[name] = Date.now();
      delete state.deleted[name];
      this.pendingDeleted = this.pendingDeleted.filter(file => file !== name);
      persist.save();
      if (raw.fileWritten) await raw.fileWritten(name).catch(() => {});
    };
    const api = { ...raw };
    api.writeFile = async (name, text) => {
      const ok = await raw.writeFile(name, text);
      if (ok) await remember(name);
      return ok;
    };
    api.writeImage = async (name, url) => {
      const ok = await raw.writeImage(name, url);
      if (ok) await remember(name);
      return ok;
    };
    if (raw.onFileGone) raw.onFileGone(name => this._fileGone(name));
    return api;
  }

  async _openFileState(raw) {
    const info = await raw.info();
    this.osName = info.username || "";
    this.gameDir = info.gameDir;
    if (!this.gameDir) return null;
    const folders = persist.data.fileFolders;
    let state = folders[this.gameDir];
    if (!state) {
      state = { written: {}, deleted: {} };
      // Legacy records have no folder. Only adopt copies that can be found here.
      for (const [name, writtenAt] of Object.entries(persist.data.written || {})) {
        if (await raw.exists(name).catch(() => false)) state.written[name] = writtenAt;
      }
      folders[this.gameDir] = state;
      persist.save();
    }
    if (raw.watchFiles) {
      await raw.watchFiles(Object.keys(state.written).filter(name => !state.deleted[name])).catch(() => {});
    }
    return state;
  }

  /** On start-up: anything we wrote that isn't there any more was deleted while the game was closed. */
  async checkFolder() {
    const state = await this._fileStateReady;
    if (!state) return;
    for (const name of Object.keys(state.written)) {
      await this._fileGone(name);
    }
  }

  async _fileGone(name) {
    const state = await this._fileStateReady;
    if (!state || !state.written[name] || state.deleted[name]) return;
    const writtenAt = state.written[name];
    // The file may have been rewritten since the watcher reported it.
    if (await this.native.exists(name).catch(() => true)) return;
    if (state.written[name] !== writtenAt || state.deleted[name]) return;
    state.deleted[name] = Date.now();
    persist.save();
    if (!this.pendingDeleted.includes(name)) this.pendingDeleted.push(name);
    this.console("sayo", `someone deleted ${name}. it was ours.`);
  }

  /** Put a deleted file back, with a note at the bottom from whoever noticed. */
  async restoreFile(name, note) {
    if (!this.native) return;
    const text = this.game._restoreText ? this.game._restoreText(name) : null;
    if (text != null) await this.native.writeFile(name, this.game._fill(text + (note ? "\n\n" + note : "")));
  }

  /* ---------- the player's camera (opt-in, see senses.js) ---------- */

  /**
   * Rei's polaroid, from the real camera: the player's own face, grainy black and white, with the figure
   * standing behind them. Resolves { taken, file } after the player clicks it away.
   */
  async photoReal({ senses, file = null, caption = "" }) {
    const shot = senses.snapshot(960, 720);
    if (!shot) return { taken: false };
    // 2.2: kept in memory for this session only, so the classroom can show your face in the window later.
    senses.lastShot = senses.snapshot(320, 240);
    this.game.audio.sfx("shutter");
    await this.flash("#fff", 400);
    const W = 960, H = 720;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    ctx.drawImage(shot, 0, 0, W, H);
    // Keep K at the edge of the frame, away from the center of the selfie.
    await drawPhotoGhost(ctx, { x: .87, bottom: 1.04, height: .86, opacity: .72 });
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
  achievement(text, kind = "") {
    const el = document.createElement("div");
    el.className = "achieve" + (kind ? " " + kind : "");
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
    const bgUrl = (($("#bg .bg-img:last-child") || {}).style || {}).backgroundImage || "";
    const bgSrc = (bgUrl.match(/url\("?(.*?)"?\)/) || [])[1];
    const bgImg = bgSrc ? await loadImage(bgSrc) : null;
    if (bgImg) ctx.drawImage(bgImg, 0, 0, W, H);
    // The figure that is always behind you: drawn before the girls, so it stands behind them.
    if (ghost) await drawPhotoGhost(ctx, { x: .76, bottom: .94, height: .67, opacity: .62 });
    for (const el of document.querySelectorAll("#sprites .sprite")) {
      const img = await loadImage(el.src);
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
      if (this.game.dread) this.game.dread.noteAway(away);
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
      was: this.game.v.wasName || persist.data.wasName || "",
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
      app: this.otherApp || "",
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
      erased: { hina: "Hina", rei: "Rei", sayo: "Sayo" }[persist.data.erased] || "",
      ...(this.game.dread ? this.game.dread.vars() : {})
    };
  }
}
