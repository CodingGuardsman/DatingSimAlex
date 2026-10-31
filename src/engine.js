/**
 * engine.js — Runs the story script and owns every screen: title, name entry, dialogue,
 * menus, save/load, settings and the backlog.
 */
import { persist, listSlots, saveSlot, loadSlot, K_SLOT } from "./persist.js";
import { AudioSys } from "./audio.js";
import { Meta } from "./meta.js";
import { SCRIPT, CAST } from "./story.js";
import { IS_DEMO, STORE_URL, STORE_READY } from "./config.js";

const $ = (sel, root = document) => root.querySelector(sel);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const POS = { left: 24, center: 50, right: 76, farleft: 14, farright: 86 };
const BG = ["classroom", "hallway", "rooftop", "riverside", "infirmary", "darkroom", "beach"];

export class Game {
  constructor() {
    this.sessionStart = Date.now();
    this.awayMs = persist.data.lastPlayed ? Date.now() - persist.data.lastPlayed : 0;
    if (!persist.data.firstPlayed) persist.set("firstPlayed", Date.now());
    this.audio = new AudioSys(persist.data.settings);
    this.meta = new Meta(this);
    this.history = [];
    this.v = this._freshVars();
    this.frames = [];
    this.sprites = {};
    this.mode = null;       // "auto" | "skip" | null
    this.busy = false;
    this._registerBlocks();
    this._preload();
    this._bindUI();
    window.addEventListener("beforeunload", () => this._recordTime());
    document.addEventListener("visibilitychange", () => { if (document.hidden) this._recordTime(); });
  }

  name() { return persist.data.name || "you"; }

  _freshVars() {
    return { day: 0, aff: { hina: 0, rei: 0, sayo: 0 }, route: null, picked: [], seen: {}, sabotage: false, bg: null, music: null, shown: {} };
  }

  _recordTime() {
    const now = Date.now();
    persist.data.totalMs += now - (this._lastTimeMark || this.sessionStart);
    this._lastTimeMark = now;
    persist.data.lastPlayed = now;
    persist.save();
  }

  /** Give every nested command list an id so the cursor can be saved. */
  _registerBlocks() {
    this.blocks = {};
    let n = 0;
    const walk = (arr, id) => {
      this.blocks[id] = arr;
      arr.forEach(c => {
        if (!c || typeof c !== "object") return;
        for (const key of ["then", "else", "do"]) if (Array.isArray(c[key])) { c[key + "Id"] = "b" + (n++); walk(c[key], c[key + "Id"]); }
        if (Array.isArray(c.items)) c.items.forEach(it => { if (Array.isArray(it.do)) { it.doId = "b" + (n++); walk(it.do, it.doId); } });
      });
    };
    Object.entries(SCRIPT).forEach(([label, arr]) => walk(arr, label));
  }

  _preload() {
    for (const [who, info] of Object.entries(CAST)) {
      (info.expressions || []).forEach(e => { const i = new Image(); i.src = `assets/sprites/${who}/${e}.webp`; });
    }
    BG.forEach(b => { const i = new Image(); i.src = `assets/bg/${b}.webp`; });
  }

  /* =================== UI wiring =================== */

  _bindUI() {
    $("#say").addEventListener("click", () => this._advanceClick());
    $("#stage").addEventListener("click", () => {
      if ($("#game").classList.contains("ui-hidden")) return $("#game").classList.remove("ui-hidden");
      this._advanceClick();
    });
    window.addEventListener("keydown", e => {
      if ($("#screen").childElementCount) { if (e.key === "Escape") this.closeScreen(); return; }
      if (/^[1-9]$/.test(e.key)) {
        const b = document.querySelectorAll("#choices .choice")[Number(e.key) - 1];
        if (b && $("#choices").style.display !== "none") { b.click(); return; }
      }
      if (e.key === "h" || e.key === "H") { $("#game").classList.toggle("ui-hidden"); return; }
      if ($("#game").classList.contains("ui-hidden")) { $("#game").classList.remove("ui-hidden"); return; }
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); this._advanceClick(); }
    });
    $("#quick").addEventListener("click", e => {
      const a = e.target.dataset.q;
      if (!a) return;
      e.stopPropagation();
      this.audio.sfx("click");
      if (a === "auto") this._setMode(this.mode === "auto" ? null : "auto");
      if (a === "skip") this._setMode(this.mode === "skip" ? null : "skip");
      if (a === "save") this.openSaves("save");
      if (a === "load") this.openSaves("load");
      if (a === "log") this.openHistory();
      if (a === "settings") this.openSettings();
    });
  }

  _setMode(m) {
    if (m === "skip" && this._noskip) {
      this.meta.toast("Don't skip me.", 2500);
      this.audio.sfx("error");
      return;
    }
    this.mode = m;
    document.querySelectorAll("#quick [data-q]").forEach(b => b.classList.toggle("on", b.dataset.q === m));
    if (m && this._waitingClick) this._advanceClick(true);
  }

  _advanceClick(fromMode = false) {
    if (this.busy && !this._waitingClick && !this._typing) return;
    if (!fromMode) {
      this.audio.unlock();
      persist.data.clicks++;
      if (this.mode && !fromMode) this._setMode(null);
    }
    if (this._typing) { this._finishTyping = true; return; }
    if (this._waitingClick) { const r = this._waitingClick; this._waitingClick = null; r(); }
  }

  /* =================== screens =================== */

  showUI(on) { $("#ui").style.display = on ? "" : "none"; }

  closeScreen() { $("#screen").innerHTML = ""; }

  _screen(html, cls = "") {
    const el = $("#screen");
    el.innerHTML = `<div class="panel ${cls}">${html}</div>`;
    return el.firstElementChild;
  }

  title() {
    this.frames = [];
    this.meta.title(null);
    this.meta.mood(null);
    ["tab", "idle", "cursor", "context"].forEach(w => this.meta.setWatch(w, false));
    this.meta.guardClose(null);
    this.meta.progress(-1);
    this.showUI(false);
    this._clearSprites();
    const P = persist.data;
    if (!P.warned) return this._contentWarning();
    const summer = P.summer;
    const detention = !summer && P.endings.includes("detention") && P.endings[P.endings.length - 1] === "detention";
    const rerun = P.runs > 0;

    this._setBg(summer ? "beach" : "classroom");
    const scr = $("#screen");
    let girls = "";
    if (!summer && !detention) {
      const exprs = rerun ? { hina: "worried", rei: "annoyed", sayo: "neutral" } : { hina: "happy", rei: "neutral", sayo: "neutral" };
      girls = `<div class="title-girls">
        <img src="assets/sprites/rei/${exprs.rei}.webp" style="left:16%">
        <img src="assets/sprites/sayo/${exprs.sayo}.webp" class="${rerun ? "stare" : ""}" style="left:84%">
        <img src="assets/sprites/hina/${exprs.hina}.webp" style="left:50%">
      </div>`;
    }
    const sub = summer ? "closed for summer vacation"
      : detention ? "Monday. Again."
      : rerun ? `welcome back, ${this.name()}` : IS_DEMO ? "a visual novel · free demo" : "a visual novel";
    const buttons = summer
      ? `<button data-t="visit">Visit anyway</button><button data-t="settings">Settings</button><button data-t="forget">Forget them</button>`
      : `<button data-t="new">${rerun ? "Again" : "New Game"}</button><button data-t="load">Load</button><button data-t="settings">Settings</button><button data-t="quit">Quit</button>`;
    scr.innerHTML = `<div class="title ${rerun && !summer ? "rerun" : ""} ${detention ? "detention" : ""}">
      ${girls}
      <div class="title-card">
        <h1>${detention ? "After C<span class=\"dead\">l</span>ass" : "After Class"}</h1>
        <p class="title-sub">${sub}</p>
        <div class="title-buttons">${buttons}</div>
      </div>
      <p class="title-foot">${summer ? "They said not to wait up." : rerun ? `slot K · 412:13:09` : "Hoshimi Academy · the last week before summer"}</p>
    </div>`;

    if (detention) this.meta.mood("red");
    if (rerun && !summer) this.meta.console("sayo", "you came back. i knew you would. i'm sorry it's like this.");

    scr.querySelector(".title-buttons").addEventListener("click", e => {
      const t = e.target.dataset.t;
      if (!t) return;
      this.audio.unlock();
      this.audio.sfx("click");
      if (t === "new") this.askName();
      if (t === "load") this.openSaves("load", true);
      if (t === "settings") this.openSettings(true);
      if (t === "quit") this._quit();
      if (t === "visit") this.start("visit");
      if (t === "forget") this._forget();
    });
    // Music needs a gesture; start it on the first interaction with the title.
    const startMusic = () => {
      this.audio.unlock();
      this.audio.play(summer ? "musicbox" : detention ? "drone" : rerun ? "wrong" : "day");
    };
    scr.addEventListener("pointerdown", startMusic, { once: true });
    if (this.audio.ctx) startMusic();
  }

  /** Shown once, before the first title screen. */
  _contentWarning() {
    const p = this._screen(`<h2>Before you play</h2>
      <p>After Class is a psychological horror game disguised as a dating sim. It is not suitable for children or for anyone easily disturbed.</p>
      <p>It contains <b>flashing lights, screen shake and glitch effects</b>, sudden loud sounds, and moments where the game talks about you and your computer${this.meta.native ? ", and leaves files in its own folder" : ""}.</p>
      <p class="hint">The game never touches anything outside its own folder.</p>
      <div class="row"><button data-a="ok">I understand</button></div>`, "center warning");
    p.addEventListener("click", e => {
      if (e.target.dataset.a !== "ok") return;
      this.audio.unlock();
      persist.set("warned", true);
      this.title();
    });
  }

  async _quit() {
    if (persist.data.runs > 0) {
      this.meta.toast("Where would you even go?", 3000);
      this.audio.sfx("error");
      return;
    }
    if (this.meta.native) { this._recordTime(); return this.meta.native.quit(); }
    this.closeScreen();
    this.audio.stop();
    await this.meta.blackout(1800);
    this._screen(`<p class="quit-msg">Thanks for playing!<br><small>You can close this tab now.</small></p><button data-x>Back</button>`, "center")
      .querySelector("[data-x]").addEventListener("click", () => this.title());
  }

  _forget() {
    const p = this._screen(`<h2>Forget them?</h2><p>This erases every save and everything Hina, Rei and Sayo remember about you.</p>
      <div class="row"><button data-a="yes">Forget</button><button data-a="no">Keep them</button></div>`, "center");
    p.addEventListener("click", e => {
      if (e.target.dataset.a === "yes") { persist.forgetAll(); this.title(); }
      if (e.target.dataset.a === "no") this.title();
    });
  }

  askName() {
    const prev = persist.data.name;
    const p = this._screen(`<h2>What's your name?</h2>
      <p class="hint">${persist.data.runs > 0 ? "They already know it." : "This is the name the girls will call you."}</p>
      <input id="name-in" maxlength="16" autocomplete="off" spellcheck="false" value="${prev ? prev.replace(/"/g, "") : ""}">
      <div class="row"><button data-a="ok">Begin</button><button data-a="back">Back</button></div>`, "center");
    const input = $("#name-in", p);
    input.focus();
    const go = () => {
      const name = input.value.trim().slice(0, 16);
      if (!name) { input.classList.add("shake"); setTimeout(() => input.classList.remove("shake"), 400); return; }
      persist.set("name", name);
      this.closeScreen();
      this.start(name.toUpperCase() === "K" ? "named_k" : "start");
    };
    input.addEventListener("keydown", e => { if (e.key === "Enter") go(); e.stopPropagation(); });
    p.addEventListener("click", e => {
      if (e.target.dataset.a === "ok") go();
      if (e.target.dataset.a === "back") this.title();
    });
  }

  openSaves(mode, fromTitle = false) {
    const slots = listSlots();
    const P = persist.data;
    const kNote = P.runs > 0 ? K_SLOT.note : "corrupted";
    const rows = slots.map(s => {
      const d = s.data;
      let label = d ? `${d.dayLabel || "Day " + d.v.day} · ${new Date(d.savedAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : "empty";
      if (this.v.sabotage && !d) label = ["DON'T", "PLEASE", "STAY", "SHE'S STILL IN HERE", "GO HOME", "K"][s.n - 1];
      const thumb = d && d.v && d.v.bg ? ` style="--thumb:url(assets/bg/${d.v.bg}.webp)"` : "";
      return `<button class="slot ${d ? "has-thumb" : "empty"}" data-n="${s.n}"${thumb}><span class="slot-n">${s.n}</span><span>${label}</span></button>`;
    }).join("");
    const p = this._screen(`<h2>${mode === "save" ? "Save" : "Load"}</h2>
      <div class="slots">
        <button class="slot k" data-n="K"><span class="slot-n">K</span><span>${K_SLOT.day} · ${K_SLOT.playtime} · <i>${kNote}</i></span></button>
        ${rows}
      </div>
      <div class="row"><button data-a="close">Close</button></div>`);
    p.addEventListener("click", async e => {
      const b = e.target.closest("[data-n],[data-a]");
      if (!b) return;
      this.audio.sfx("click");
      if (b.dataset.a === "close") return fromTitle ? this.title() : this.closeScreen();
      const n = b.dataset.n;
      if (n === "K") {
        if (mode === "save") { this.audio.sfx("error"); this.meta.toast("That one isn't yours.", 2500); return; }
        if (P.runs === 0) { await this.meta.glitch(500); this.meta.toast("This save file is corrupted.", 2500); return; }
        this.closeScreen();
        return this.start("k_save");
      }
      if (mode === "save") {
        saveSlot(n, this._snapshot());
        this.meta.toast("Saved.", 1500);
        this.closeScreen();
      } else {
        const d = loadSlot(n);
        if (!d) return;
        this.closeScreen();
        this._restore(d);
      }
    });
  }

  openSettings(fromTitle = false) {
    const s = persist.data.settings;
    const p = this._screen(`<h2>Settings</h2>
      <label>Text speed <input type="range" min="10" max="90" value="${s.textSpeed}" data-s="textSpeed"></label>
      <label>Music <input type="range" min="0" max="1" step="0.05" value="${s.music}" data-s="music"></label>
      <label>Sound &amp; voices <input type="range" min="0" max="1" step="0.05" value="${s.sfx}" data-s="sfx"></label>
      <label class="check"><input type="checkbox" ${s.voice ? "checked" : ""} data-s="voice"> Character voices and announcements</label>
      ${this.meta.native ? `<div class="row left"><button data-a="full">Toggle fullscreen</button><button data-a="folder">Open the game folder</button></div>` : ""}
      <p class="keys">Space / Enter: next &middot; 1&ndash;9: choose &middot; H: hide text box &middot; Esc: close menus</p>
      <div class="row"><button data-a="close">Close</button></div>`);
    p.addEventListener("input", e => {
      const k = e.target.dataset.s;
      if (!k) return;
      let val = e.target.type === "checkbox" ? e.target.checked : Number(e.target.value);
      // In the rerun, they won't let you turn them off.
      if (this.v.sabotage && (k === "music" || k === "sfx") && val < 0.25) {
        val = 0.25; e.target.value = 0.25;
        this.meta.toast("Please don't mute us.", 2500);
      }
      if (this.v.sabotage && k === "voice" && !val) {
        val = true; e.target.checked = true;
        this.meta.toast("We want you to hear this.", 2500);
      }
      s[k] = val;
      persist.save();
      this.audio.applyVolumes();
    });
    p.addEventListener("click", e => {
      const a = e.target.dataset.a;
      if (a === "close") fromTitle ? this.title() : this.closeScreen();
      if (a === "full") this.meta.native.fullscreen(!this._full).then(f => { this._full = f; });
      if (a === "folder") this.meta.reveal();
    });
  }

  openHistory() {
    const items = this.history.slice(-60).map(h => `<div class="log-line"><b>${h.who || ""}</b> ${h.deleted ? `<s>${h.deleted}</s> ` : ""}${h.text}</div>`);
    if (persist.data.runs > 0) items.splice(Math.max(0, items.length - 3), 0, `<div class="log-line k"><b>K</b> i'm still here. i never left. please don't let them rewind me again</div>`);
    const p = this._screen(`<h2>Backlog</h2><div class="log">${items.join("")}</div><div class="row"><button data-a="close">Close</button></div>`);
    const log = $(".log", p);
    log.scrollTop = log.scrollHeight;
    p.addEventListener("click", e => { if (e.target.dataset.a === "close") this.closeScreen(); });
  }

  /* =================== save state =================== */

  _snapshot() {
    return {
      v: JSON.parse(JSON.stringify(this.v)),
      frames: this.frames.map(f => ({ id: f.id, i: Math.max(0, f.i - (f === this.frames[this.frames.length - 1] ? 1 : 0)), call: f.call })),
      dayLabel: this._dayLabel
    };
  }

  _restore(d) {
    this.v = { ...this._freshVars(), ...d.v };
    this.frames = d.frames.map(f => ({ ...f }));
    this._dayLabel = d.dayLabel;
    this.showUI(true);
    const shown = this.v.shown || {};
    this._clearSprites();
    if (this.v.bg) this._setBg(this.v.bg);
    Object.entries(shown).forEach(([who, s]) => this._show(who, s.expr, s.pos, true));
    if (this.v.music) this.audio.play(this.v.music);
    this.meta.mood(this.v.mood || null);
    this.meta.setWatch("tab", !!this.v.sabotage);
    this.meta.setWatch("idle", !!this.v.sabotage);
    this.meta.setWatch("context", !!this.v.sabotage);
    this._interrupt();
    this._run();
  }

  /** Release whatever line or menu the runner is waiting on, so a new cursor takes over. */
  _interrupt() {
    this._finishTyping = true;
    if (this._menuResolve) this._menuResolve();
    if (this._waitingClick) { const r = this._waitingClick; this._waitingClick = null; r(); }
  }

  /* =================== script runner =================== */

  start(label) {
    // The free demo ends after the first ending: the rerun, K's save and summer are in the full game.
    if (IS_DEMO && (/^(r_|k_save|visit)/.test(label) || (label === "start" && persist.data.runs > 0))) return this._demoEnd();
    this.v = this._freshVars();
    this.meta.mood(null);
    this.history = [];
    this.closeScreen();
    this.showUI(true);
    this._clearSprites();
    $("#say-text").textContent = "";
    $("#say-name").textContent = "";
    this.frames = [{ id: label, i: 0 }];
    this._interrupt();
    this._run();
  }

  async _run() {
    if (this._running) { this._restart = true; return; }
    this._running = true;
    while (this.frames.length) {
      if (this._restart) { this._restart = false; }
      const f = this.frames[this.frames.length - 1];
      const block = this.blocks[f.id];
      if (!block || f.i >= block.length) {
        this.frames.pop();
        continue;
      }
      const cmd = block[f.i++];
      try {
        await this._exec(typeof cmd === "string" ? this._parse(cmd) : cmd);
      } catch (e) {
        console.error("[script]", f.id, f.i - 1, e);
      }
    }
    this._running = false;
  }

  _parse(line) {
    const bar = line.indexOf("|");
    if (bar < 0) return { t: "say", who: null, text: line };
    const head = line.slice(0, bar).trim().split(/\s+/).filter(Boolean);
    return { t: "say", who: head[0] || null, expr: head[1], text: line.slice(bar + 1).trim() };
  }

  _fill(text) {
    const vars = this.meta.vars();
    return String(text).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  }

  _jump(label) {
    this.frames = [{ id: label, i: 0 }];
  }

  async _exec(c) {
    switch (c.t) {
      case "say": return this._say(c);
      case "show": return this._show(c.who, c.expr, c.pos);
      case "hide": return this._hide(c.who);
      case "clear": return this._clearSprites();
      case "bg": return this._setBg(c.id, c.fade !== false);
      case "music": this.v.music = c.id; return c.id ? this.audio.play(c.id) : this.audio.stop(1.5);
      case "sfx": return this.audio.sfx(c.id);
      case "wait": return sleep(c.ms);
      case "jump": return this._jump(c.to);
      case "call": this.frames.push({ id: c.to, i: 0 }); return;
      case "set": this.v[c.k] = c.v; return;
      case "add": this.v.aff[c.k] = (this.v.aff[c.k] || 0) + (c.n ?? 1); return;
      case "pset": persist.set(c.k, c.v); return;
      case "if": {
        const ok = c.when(this.v, persist.data, this);
        const id = ok ? c.thenId : c.elseId;
        if (id) this.frames.push({ id, i: 0 });
        return;
      }
      case "menu": return this._menu(c);
      case "fx":
        if (c.fn === "mood") this.v.mood = (c.args || [])[0] || null;
        return this.meta[c.fn](...(c.args || []));
      case "js": return c.run(this);
      case "day": return this._dayCard(c);
      case "end": return this._ending(c);
      case "title": this.frames = []; this.audio.stop(); return this.title();
      case "ui": return this.showUI(c.on);
      case "noskip": this._noskip = c.on; if (c.on && this.mode === "skip") this._setMode(null); return;
    }
  }

  /* ---------- dialogue ---------- */

  async _say(c) {
    const box = $("#say");
    const nameEl = $("#say-name");
    const textEl = $("#say-text");
    const who = c.who && c.who !== "-" ? c.who : null;
    const info = who ? CAST[who] : null;

    if (who && info && info.sprite) {
      if (!this.sprites[who]) this._show(who, c.expr || "neutral", this._autoPos());
      else if (c.expr) this._show(who, c.expr);
    }
    Object.entries(this.sprites).forEach(([k, el]) => el.classList.toggle("dim", !!who && k !== who && !!info && !!info.sprite));
    const speaker = who && this.sprites[who];
    if (speaker) { speaker.classList.remove("talk"); void speaker.offsetWidth; speaker.classList.add("talk"); }

    let display = who === "me" ? this.name() : info ? info.name : "";
    if (c.as) display = this._fill(c.as);
    nameEl.textContent = display;
    nameEl.style.display = display ? "" : "none";
    nameEl.style.setProperty("--who", info ? info.color : "#ccc");
    box.className = (who ? "who-" + who : "narration") + (c.corrupt ? " corrupt" : "");

    const text = this._fill(c.text);
    const entry = { who: display, text };
    if (c.voice && info) this.audio.speak(text, { pitch: info.pitch || 1, rate: info.rate || 1 });

    await this._type(textEl, text, who, c);
    if (c.rewrite) {
      await sleep(this.mode === "skip" ? 80 : 900);
      await this._erase(textEl);
      const re = this._fill(c.rewrite);
      entry.deleted = text;
      entry.text = re;
      await this._type(textEl, re, who, c);
    }
    this.history.push(entry);
    await this._waitAdvance(c);
  }

  async _type(el, text, who, c) {
    el.textContent = "";
    this._typing = true;
    this._finishTyping = false;
    const cps = c.speed || persist.data.settings.textSpeed;
    const instant = this.mode === "skip" && !c.noskip;
    for (let i = 0; i < text.length; i++) {
      if (instant || this._finishTyping) { el.textContent = text; break; }
      el.textContent += text[i];
      if (/\S/.test(text[i])) this.audio.blip(who, !!c.corrupt);
      const ch = text[i];
      await sleep(1000 / cps * (".!?".includes(ch) ? 5 : ch === "," ? 2.5 : 1));
    }
    this._typing = false;
  }

  async _erase(el) {
    const t = el.textContent;
    for (let i = t.length; i >= 0; i -= 2) {
      el.textContent = t.slice(0, i);
      await sleep(14);
    }
  }

  _waitAdvance(c) {
    $("#say").classList.add("ready");
    return new Promise(resolve => {
      const done = () => { $("#say").classList.remove("ready"); clearTimeout(this._modeTimer); resolve(); };
      this._waitingClick = done;
      if (this.mode === "skip" && !c.noskip) this._modeTimer = setTimeout(() => this._advanceClick(true), 70);
      if (this.mode === "auto") this._modeTimer = setTimeout(() => this._advanceClick(true), 1400 + $("#say-text").textContent.length * 35);
    });
  }

  /* ---------- choices ---------- */

  _menu(c) {
    if (this.mode === "skip") this._setMode(null);
    const wrap = $("#choices");
    const items = c.items.filter(it => !it.if || it.if(this.v, persist.data, this));
    wrap.innerHTML = "";
    wrap.style.display = "flex";
    this.busy = true;
    return new Promise(resolve => {
      this._menuResolve = () => {
        this._menuResolve = null;
        wrap.style.display = "none";
        wrap.innerHTML = "";
        this.busy = false;
        resolve();
      };
      items.forEach((it, idx) => {
        const b = document.createElement("button");
        b.className = "choice" + (it.cls ? " " + it.cls : "");
        b.innerHTML = `<span class="choice-key">${idx + 1}</span><span class="choice-text"></span>`;
        b.querySelector(".choice-text").textContent = this._fill(it.text);
        if (it.tag && (!it.tagIf || it.tagIf(this.v, persist.data))) {
          const tag = document.createElement("span");
          tag.className = "choice-tag";
          tag.textContent = this._fill(it.tag);
          b.appendChild(tag);
        }
        // How long the cursor rests on each option. The girls notice when you hesitate.
        b._hover = 0;
        b.addEventListener("pointerenter", () => { b._enter = performance.now(); });
        b.addEventListener("pointerleave", () => { if (b._enter) b._hover += performance.now() - b._enter; b._enter = 0; });
        b.addEventListener("click", async e => {
          e.stopPropagation();
          this.audio.sfx("click");
          persist.data.clicks++;
          // The Office decides for you.
          if (c.hijack) {
            wrap.querySelectorAll(".choice-text").forEach(x => { x.textContent = this._fill(c.hijack); x.parentElement.classList.add("hijacked"); });
            await this.meta.glitch(400);
            await sleep(700);
          }
          const picked = b.querySelector(".choice-text").textContent;
          let longest = null;
          wrap.querySelectorAll(".choice").forEach(x => {
            if (x === b) return;
            const ms = x._hover + (x._enter ? performance.now() - x._enter : 0);
            if (ms > 1200 && (!longest || ms > longest.ms)) longest = { ms, text: x.querySelector(".choice-text").textContent };
          });
          this.v.hesitate = longest ? { text: longest.text, secs: Math.round(longest.ms / 100) / 10 } : null;
          this.v.lastChoice = picked;
          this.v.lastChoiceIndex = idx;
          this.history.push({ who: this.name(), text: "» " + picked });
          const chosen = c.hijack && c.forceIndex != null ? items[c.forceIndex] : it;
          if (chosen.go) this._jump(chosen.go);
          else if (chosen.doId) this.frames.push({ id: chosen.doId, i: 0 });
          this._menuResolve();
        });
        if (it.flee) {
          let tries = 0;
          b.addEventListener("pointerenter", () => {
            // It gives up after a few tries; the point is that you noticed.
            if (++tries > 4) { b.style.transform = ""; return; }
            b.style.transform = `translate(${(Math.random() - 0.5) * 320}px, ${(Math.random() - 0.5) * 160}px)`;
            this.audio.sfx("glitch");
          });
        }
        wrap.appendChild(b);
      });
    });
  }

  /* ---------- stage ---------- */

  _setBg(id, fade = true) {
    this.v.bg = id;
    const stage = $("#bg");
    const img = document.createElement("div");
    img.className = "bg-img";
    img.style.backgroundImage = `url(assets/bg/${id}.webp)`;
    if (!fade) img.style.transition = "none";
    stage.appendChild(img);
    requestAnimationFrame(() => img.classList.add("in"));
    setTimeout(() => { while (stage.children.length > 1) stage.firstElementChild.remove(); }, fade ? 900 : 0);
  }

  _autoPos() {
    const used = Object.values(this.v.shown || {}).map(s => s.pos);
    return ["center", "left", "right"].find(p => !used.includes(p)) || "center";
  }

  _show(who, expr = "neutral", pos, instant = false) {
    const layer = $("#sprites");
    let el = this.sprites[who];
    if (!this.v.shown) this.v.shown = {};
    const prev = this.v.shown[who];
    pos = pos || (prev && prev.pos) || this._autoPos();
    if (!el) {
      el = document.createElement("img");
      el.className = "sprite";
      el.alt = who;
      layer.appendChild(el);
      this.sprites[who] = el;
      if (!instant) { el.classList.add("enter"); requestAnimationFrame(() => el.classList.remove("enter")); }
    }
    el.src = `assets/sprites/${who}/${expr}.webp`;
    el.style.left = POS[pos] + "%";
    el.classList.toggle("is-corrupt", expr === "corrupt");
    this.v.shown[who] = { expr, pos };
  }

  _hide(who) {
    const el = this.sprites[who];
    if (!el) return;
    el.classList.add("leave");
    setTimeout(() => el.remove(), 500);
    delete this.sprites[who];
    delete this.v.shown[who];
  }

  _clearSprites() {
    $("#sprites").innerHTML = "";
    this.sprites = {};
    this.v.shown = {};
  }

  async _dayCard(c) {
    this._dayLabel = c.text;
    const el = document.createElement("div");
    el.className = "daycard";
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const n = days.indexOf(c.text);
    const dots = n < 0 ? "" : days.map((d, i) => `<i class="${i < n ? "past" : i === n ? "now" : ""}"></i>`).join("");
    el.innerHTML = `<div class="daycard-line"></div><div class="daycard-title"></div><div class="daycard-sub"></div><div class="daycard-dots">${dots}</div>`;
    $(".daycard-title", el).textContent = this._fill(c.text);
    if (n >= 0) this.meta.progress((n + 1) / 5);
    $(".daycard-sub", el).textContent = this._fill(c.sub || "");
    if (c.wrong) el.classList.add("wrong");
    $("#fx").appendChild(el);
    this.audio.sfx(c.wrong ? "chime_down" : "bell");
    await sleep(c.ms || 2600);
    el.classList.add("out");
    await sleep(700);
    el.remove();
  }

  async _ending(c) {
    persist.addEnding(c.id);
    if (c.countRun !== false) persist.set("runs", persist.data.runs + 1);
    if (c.id === "summer") persist.set("summer", true);
    this.showUI(false);
    const el = document.createElement("div");
    el.className = "ending-card";
    this.meta.progress(-1);
    this.meta.guardClose(null);
    const closes = c.id === "summer" && this.meta.native;
    el.innerHTML = `<div class="ending-kind">${c.kind || "ENDING"}</div><div class="ending-name"></div>
      ${closes ? `<p class="ending-note">They're closing up for summer. The game will close itself.</p>` : ""}
      <button>${closes ? "Close" : "Return to title"}</button>`;
    $(".ending-name", el).textContent = c.name;
    $("#fx").appendChild(el);
    await new Promise(r => $("button", el).addEventListener("click", r, { once: true }));
    if (closes) { this._recordTime(); return this.meta.native.quit(); }
    el.remove();
    this.frames = [];
    if (IS_DEMO) return this._demoEnd();
    this.title();
  }

  /** End of the free demo: points the player to the full game. */
  _demoEnd() {
    this.frames = [];
    this.showUI(false);
    this._clearSprites();
    this.meta.mood("wrong");
    this._setBg("classroom");
    this.audio.play("wrong");
    const link = STORE_READY
      ? `<a class="buy" href="${STORE_URL}" target="_blank" rel="noopener">Get the full game on itch.io</a>`
      : `<p class="hint">Search for “After Class” on itch.io.</p>`;
    const p = this._screen(`<h2>End of the free demo</h2>
      <p>In the full game, the week starts again.</p>
      <p><b>This time, they remember you.</b></p>
      <p class="hint">Two acts · three endings · the save slot that isn't yours · a desktop version that leaves things in its own folder</p>
      <div class="row">${link}</div>
      <div class="row"><button data-a="back">Back to title</button></div>`, "center demo-end");
    this.meta.console("sayo", "you can't stay here. the rest of us are somewhere else now.");
    p.addEventListener("click", e => {
      if (e.target.dataset.a !== "back") return;
      this.meta.mood(null);
      this.title();
    });
  }
}
