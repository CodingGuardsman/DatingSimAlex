/**
 * engine.js — Runs the story script and owns every screen: title, name entry, dialogue,
 * menus, save/load, settings and the backlog.
 */
import { persist, listSlots, saveSlot, loadSlot, K_SLOT } from "./persist.js?v=2.1.0";
import { AudioSys } from "./audio.js?v=2.1.0";
import { Meta } from "./meta.js?v=2.1.0";
import { Minigames } from "./minigames.js?v=2.1.0";
import { SCRIPT, CAST, MEMORIES, ENDINGS, NOTES, FILE_TEXTS } from "./story.js?v=2.1.0";
import { TITLE_DELETED } from "./story_extra.js?v=2.1.0";
import { ai, PERSONAS, DOWNLOAD_SIZE } from "./ai.js?v=2.1.0";
import { senses } from "./senses.js?v=2.1.0";
import { IS_DEMO, STORE_URL, STORE_READY } from "./config.js?v=2.1.0";

const $ = (sel, root = document) => root.querySelector(sel);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const POS = { left: 24, center: 50, right: 76, farleft: 14, farright: 86 };
// 2.1: big poses. Close-ups fill the screen; action poses are a little larger than standing ones.
const CLOSE = ["close", "glass", "grab", "aim_close", "peek"];
const WIDE = ["turn", "twirl", "lean"];
const BG = ["classroom", "hallway", "rooftop", "riverside", "infirmary", "darkroom", "beach"];

export class Game {
  constructor() {
    this.sessionStart = Date.now();
    this.awayMs = persist.data.lastPlayed ? Date.now() - persist.data.lastPlayed : 0;
    persist.stampVersion();
    if (!persist.data.firstPlayed) persist.set("firstPlayed", Date.now());
    this.audio = new AudioSys(persist.data.settings);
    this.cast = CAST;
    this.memories = MEMORIES;
    this.meta = new Meta(this);
    this.mini = new Minigames(this);
    this.history = [];
    this.v = this._freshVars();
    this.frames = [];
    this.sprites = {};
    this.mode = null;       // "auto" | "skip" | null
    this.busy = false;
    this.ai = ai;
    this.senses = senses;
    this._registerBlocks();
    this._preload();
    this._bindUI();
    // The local AI loads in the background if the player turned it on. The game never waits for it.
    if (ai.enabled) ai.init();
    ai.onChange(() => this._aiBadge());
    this.meta.checkFolder();
    window.addEventListener("beforeunload", () => this._recordTime());
    // While the title screen is open, they're standing on it. Keep count.
    this._titleTicks = 0;
    setInterval(() => {
      if (document.hidden || !$(".title")) return;
      persist.data.titleMs += 1000;
      if (++this._titleTicks % 10 === 0) persist.save();
    }, 1000);
    document.addEventListener("visibilitychange", () => { if (document.hidden) this._recordTime(); });
  }

  name() { return persist.data.name || "you"; }

  /* ---------- the scrapbook ---------- */

  memCount() { return MEMORIES.filter(m => persist.data.mem[m.id]).length; }
  memTotal() { return MEMORIES.length; }

  _memory(id) {
    const m = MEMORIES.find(x => x.id === id);
    if (!m) return console.warn("[script] unknown memory", id);
    if (persist.data.mem[id]) return;
    persist.data.mem[id] = Date.now();
    persist.save();
    this.meta.memoryToast(this._fill(m.title), m.book);
    this._checkNotes();
  }

  /** A clue with no memory of its own, for the "What we know" page. */
  _know(id) {
    persist.data.known = { ...persist.data.known, [id]: true };
    persist.save();
    this._checkNotes();
  }

  /** Where each "What we know" note stands right now: "a" answered, "q" asked, or nothing yet. Never goes backwards. */
  _noteState(n) {
    const P = persist.data;
    const was = (P.noted || {})[n.id];
    const now = n.know(P) ? "a" : n.ask(P) ? "q" : null;
    return was === "a" || now === "a" ? "a" : was || now;
  }

  /** Record any note that moved on, and say so once, after the memory toast has gone. */
  _checkNotes(quiet = false) {
    const P = persist.data;
    P.noted = P.noted || {};
    let asked = 0, answered = 0;
    for (const n of NOTES) {
      const st = this._noteState(n);
      if (st && st !== P.noted[n.id]) { st === "a" ? answered++ : asked++; P.noted[n.id] = st; }
    }
    if (!asked && !answered) return;
    persist.save();
    if (quiet) return;
    const what = answered && asked ? `${answered} answered, ${asked} new` : answered ? (answered > 1 ? `${answered} questions answered` : "a question answered") : (asked > 1 ? `${asked} new questions` : "a new question");
    clearTimeout(this._noteTimer);
    this._noteTimer = setTimeout(() => this.meta.memoryToast(what, "note"), 3900);
  }

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
    // Illustrations load after everything else; the jumpscares need to be ready the instant they're used.
    setTimeout(() => ["h_jump_hina", "h_jump_sayo", "h_jump_office", "hearing", "beach", "backstage"].forEach(c => { const i = new Image(); i.src = `assets/cg/${c}.webp`; }), 4000);
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
      const btn = e.target.closest("[data-q]");
      const a = btn && btn.dataset.q;
      if (!a) return;
      e.stopPropagation();
      this.audio.sfx("click");
      if (a === "auto") this._setMode(this.mode === "auto" ? null : "auto");
      if (a === "skip") this._setMode(this.mode === "skip" ? null : "skip");
      if (a === "save") this.openSaves("save");
      if (a === "load") this.openSaves("load");
      if (a === "log") this.openHistory();
      if (a === "book") this.openScrapbook();
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
    this.v = this._freshVars();
    this.meta.title(null);
    this.meta.mood(null);
    this.audio.muffle(false);
    ["tab", "idle", "cursor", "context"].forEach(w => this.meta.setWatch(w, false));
    this.meta.guardClose(null);
    this.meta.progress(-1);
    this.showUI(false);
    this._clearSprites();
    this.meta.cg(null);
    this.meta.blood(false);
    this.senses.stopCamera();
    const P = persist.data;
    if (!P.warned) return this._contentWarning();
    if (!P.aiAsked) return this._aiConsent();
    const last = P.lastEnding || P.endings[P.endings.length - 1];
    const graduated = P.graduated;
    // After the summer ending the school is closed. Coming back anyway is what opens the second term.
    const summer = P.summer && !P.act3 && !graduated;
    const term2 = P.act3 && !graduated;
    const detention = !P.summer && last === "detention";
    const rerun = P.runs > 0 && !summer && !graduated;
    // The rerun title looks the same at first glance. It isn't.
    $("#game").classList.toggle("uncanny", rerun);
    if (graduated) return this._graduatedTitle();

    this._setBg(summer ? "beach" : term2 && last === "recess" ? "rooftop" : "classroom");
    const scr = $("#screen");
    let girls = "";
    if (!summer && !detention) {
      // They hold the same pose every time. Smiling. Whether or not anyone is looking.
      // Whoever the Office kept back after Detention isn't on the menu. Just her tape mark.
      const stand = (g, e, x) => P.erased === g
        ? `<span class="title-absent" style="left:${x}%">${g.toUpperCase()}<small>kept back</small></span>`
        : `<img data-g="${g}" src="assets/sprites/${g}/${e}.webp" style="left:${x}%">`;
      girls = `<div class="title-girls">${stand("rei", "neutral", 16)}${stand("sayo", "neutral", 84)}${stand("hina", "happy", 50)}</div>`;
    }
    const sparkles = rerun ? "" : `<div class="title-sparkles">${Array.from({ length: 16 }, (_, i) =>
      `<i style="left:${(i * 37) % 100}%;animation-delay:${-(i * 1.7) % 11}s;animation-duration:${9 + (i % 5) * 2}s">${"♥✿✦♡"[i % 4]}</i>`).join("")}</div>`;
    const sub = summer ? "closed for summer vacation"
      : detention ? "Monday. Again."
      : term2 ? ({ retention: "season ∞", recess: "the bell is gone", free: "free period" }[last] || "second term")
      : rerun ? `welcome back, ${this.name()}` : IS_DEMO ? "a summer romance · free demo" : "a summer romance";
    const buttons = summer
      ? `<button data-t="visit">Visit anyway</button><button data-t="book">Scrapbook</button><button data-t="settings">Settings</button><button data-t="forget">Forget them</button>`
      : `<button data-t="new">${term2 ? "Back to class" : rerun ? "Again" : "New Game"}</button><button data-t="load">Load</button><button data-t="book">Scrapbook</button><button data-t="settings">Settings</button><button data-t="quit">Quit</button>`;
    // After the first ending, Sayo draws a fifth button. It goes behind the menu.
    // Once the player has drawn their own door for her, it's that one.
    const doorArt = P.door
      ? `<svg viewBox="0 0 120 170" class="drawn"><path d="${P.door}"/></svg>`
      : `<svg viewBox="0 0 120 170"><path d="M16 162 L13 24 Q15 9 60 8 Q105 9 107 24 L110 162 M13 163 L111 161"/><circle cx="91" cy="96" r="4"/></svg>`;
    const door = rerun ? `<button class="door-btn" data-t="door" aria-label="door">${doorArt}<span>${P.door ? "your door" : "door"}</span></button>` : "";
    const foot = summer ? "They said not to wait up. · notice: the second term begins soon"
      : term2 ? (last === "retention" ? `retention: ${this.meta.vars().playtime}` : "♡ we missed you ♡ — the Office")
      : rerun ? (P.behind ? "they are holding very still for you" : "slot K · 412:13:09")
      : "♡ Hoshimi Academy · the last week before summer ♡";
    scr.innerHTML = `<div class="title ${rerun ? "rerun" : "cute"} ${detention ? "detention" : ""} ${term2 ? "term2" : ""}">
      ${sparkles}
      ${girls}
      <div class="title-card">
        <div class="title-ribbon">${rerun && !summer ? "◉ Hoshimi Academy ◉" : "♡ Hoshimi Academy ♡"}</div>
        <h1>${detention ? "After C<span class=\"dead\">l</span>ass" : "After Class"}</h1>
        <p class="title-sub">${sub}</p>
        <div class="title-buttons">${buttons}</div>
      </div>
      ${door}
      <p class="title-foot">${foot}</p>
      <div class="title-whisper"></div>
    </div>`;

    if (detention || (term2 && last === "retention")) this.meta.mood("red");
    if (term2) this.meta.console("sayo", "we told you not to come back. ...hi. it's good to see you anyway.");
    else if (rerun) this.meta.console("sayo", "you came back. i knew you would. i drew you a door. it's next to the menu.");

    scr.querySelector(".title").addEventListener("click", e => {
      const el = e.target.closest("[data-t]");
      const t = el && el.dataset.t;
      if (!t) return;
      this.audio.unlock();
      this.audio.sfx("click");
      if (t === "new") term2 ? this.start("a3_start") : this.askName();
      if (t === "load") this.openSaves("load", true);
      if (t === "book") this.openScrapbook(true);
      if (t === "settings") this.openSettings(true);
      if (t === "quit") this._quit();
      if (t === "visit") this.start("visit");
      if (t === "forget") this._forget();
      if (t === "door") this._openDoor();
    });
    const quit = scr.querySelector('[data-t="quit"]');
    if (quit) quit.addEventListener("pointerenter", () => { persist.data.quitHovers++; persist.save(); });
    if (door) setTimeout(() => this.audio.sfx("pencil"), 1800);
    // Music needs a gesture; start it on the first interaction with the title.
    const startMusic = () => {
      this.audio.unlock();
      this.audio.play(summer ? "musicbox" : detention || last === "retention" ? "drone" : rerun ? "wrong" : "day");
    };
    scr.addEventListener("pointerdown", startMusic, { once: true });
    if (this.audio.ctx) startMusic();
    this._pose = 0;
    this._slipped = false;
    // A file vanished while the game was closed. They noticed. (The full scene plays once you're back in class.)
    const gone = this.meta.pendingDeleted[0];
    if (gone && girls) setTimeout(() => {
      const t = $(".title");
      if (!t) return;
      t.querySelectorAll(".title-girls img").forEach(i => { i.dataset.was = i.src; i.src = `assets/sprites/${i.dataset.g}/corrupt.webp`; });
      this.audio.sfx("glitch");
      const w = $(".title-whisper", t);
      w.textContent = TITLE_DELETED(gone);
      w.classList.add("on");
      setTimeout(() => t.querySelectorAll(".title-girls img").forEach(i => { if (i.dataset.was) i.src = i.dataset.was; }), 380);
    }, 2500);
    clearInterval(this._titleTimer);
    if (girls) this._titleTimer = setInterval(() => this._titleTick(), 300);
  }

  /** After the last ending there's no menu to stand on. Just the photo they left you. */
  _graduatedTitle() {
    this._setBg("rooftop");
    const year = new Date().getFullYear();
    const scr = $("#screen");
    scr.innerHTML = `<div class="title cute graduated">
      <div class="title-sparkles">${Array.from({ length: 12 }, (_, i) => `<i style="left:${(i * 37) % 100}%;animation-delay:${-(i * 1.7) % 11}s;animation-duration:${10 + (i % 5) * 2}s">${"✿♡✦"[i % 3]}</i>`).join("")}</div>
      <figure class="grad-photo"><div class="grad-img cg" style="background-image:url(assets/cg/graduation.webp)"></div><figcaption>Hoshimi Academy · class of ${year}${persist.data.restoredK ? " · and K" : ""}</figcaption></figure>
      <div class="title-card">
        <div class="title-ribbon">♡ Hoshimi Academy ♡</div>
        <h1>After Class</h1>
        <p class="title-sub">graduated</p>
        <div class="title-buttons"><button data-t="reunion">Reunion</button><button data-t="book">Scrapbook</button><button data-t="settings">Settings</button><button data-t="forget">Forget them</button></div>
      </div>
      <p class="title-foot">Nobody is standing on the menu anymore.</p>
    </div>`;
    scr.querySelector(".title").addEventListener("click", e => {
      const el = e.target.closest("[data-t]");
      const t = el && el.dataset.t;
      if (!t) return;
      this.audio.unlock();
      this.audio.sfx("click");
      if (t === "reunion") this.start("reunion");
      if (t === "book") this.openScrapbook(true);
      if (t === "settings") this.openSettings(true);
      if (t === "forget") this._forget();
    });
    const startMusic = () => { this.audio.unlock(); this.audio.play("musicbox"); };
    scr.addEventListener("pointerdown", startMusic, { once: true });
    if (this.audio.ctx) startMusic();
  }

  /**
   * The title screen is a place. When nobody moves, the girls stop holding their pose.
   * The moment you move, they snap back to smiling, as if nothing happened.
   */
  _titleTick() {
    const t = $(".title");
    if (!t) { clearInterval(this._titleTimer); this._titleTimer = null; return; }
    const idle = (Date.now() - this.meta._lastInput) / 1000;
    const img = {};
    t.querySelectorAll(".title-girls img").forEach(i => { img[i.dataset.g] = i; });
    const set = (g, e) => { const src = `assets/sprites/${g}/${e}.webp`; if (img[g] && !img[g].src.endsWith(src)) img[g].src = src; };
    if (!t.classList.contains("rerun")) {
      // Act 1: once, for a fraction of a second, Sayo's face slips.
      if (idle > 40 && !this._slipped && img.sayo) {
        this._slipped = true;
        set("sayo", "blank");
        setTimeout(() => set("sayo", "neutral"), 170);
      }
      return;
    }
    const stage = idle > 34 ? 4 : idle > 26 ? 3 : idle > 18 ? 2 : idle > 11 ? 1 : 0;
    if (stage === this._pose) return;
    const whisper = $(".title-whisper", t);
    if (stage < this._pose) {
      // Caught. Back into position, instantly.
      if (this._pose >= 2) { persist.data.caught++; persist.save(); }
      t.classList.add("snap");
      set("hina", "happy"); set("rei", "neutral"); set("sayo", "neutral");
      if (img.sayo) img.sayo.classList.remove("near");
      whisper.classList.remove("on");
      requestAnimationFrame(() => requestAnimationFrame(() => t.classList.remove("snap")));
      this._pose = 0;
      return;
    }
    this._pose = stage;
    if (stage >= 1) set("hina", "worried");
    if (stage >= 2) { set("hina", "sad"); set("rei", "annoyed"); }
    if (stage >= 3) { set("sayo", "reach_blank"); if (img.sayo) img.sayo.classList.add("near"); }
    if (stage >= 4) {
      const lines = persist.data.behind
        ? ["you can press something now.", "it's okay. we'll hold still.", "is anyone there?"]
        : ["we can hear the menu music the whole time.", "you can't see the door from where we're standing.", "is anyone there?"];
      whisper.textContent = lines[Math.floor(Math.random() * lines.length)];
      whisper.classList.add("on");
    }
  }

  /** Sayo's door: the menu swings open, and behind it is where they wait. */
  async _openDoor() {
    clearInterval(this._titleTimer);
    this.audio.sfx("door");
    const title = $(".title");
    const bgImg = $("#bg .bg-img:last-child");
    const wrap = document.createElement("div");
    wrap.className = "door-open";
    for (const side of ["l", "r"]) {
      const leaf = document.createElement("div");
      leaf.className = "leaf " + side;
      const inner = document.createElement("div");
      inner.className = "leaf-inner";
      if (bgImg) inner.appendChild(bgImg.cloneNode(true));
      if (title) inner.appendChild(title.cloneNode(true));
      leaf.appendChild(inner);
      wrap.appendChild(leaf);
    }
    $("#game").appendChild(wrap);
    this.closeScreen();
    $("#bg").innerHTML = "";
    this.audio.muffle(true);
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add("open")));
    await sleep(2000);
    wrap.remove();
    this.start("behind_title");
  }

  /** Shown once, before the first title screen. */
  _contentWarning() {
    const p = this._screen(`<h2>Before you play</h2>
      <p>After Class is a psychological horror game disguised as a dating sim. It is not suitable for children or for anyone easily disturbed.</p>
      <p>Choices can have permanent consequences, and the game may <b>delete its own save files</b>.</p>
      <p>It contains <b>flashing lights, screen shake and glitch effects</b>, <b>jumpscares</b> with sudden loud sounds, <b>blood</b>, <b>disturbing images</b> including implied death and suicide, and moments where the game talks about you and your computer${this.meta.native ? ", and leaves files in its own folder" : ""}.</p>
      <p>You can turn the graphic images off at any time in Settings.</p>
      <p class="hint">If you are struggling with thoughts of suicide or self-harm, please reach out: findahelpline.com lists free, confidential helplines in every country.</p>
      <p class="hint">The game never touches anything outside its own folder.</p>
      <div class="row"><button data-a="ok">I understand</button></div>`, "center warning");
    p.addEventListener("click", e => {
      if (e.target.dataset.a !== "ok") return;
      this.audio.unlock();
      persist.set("warned", true);
      this.title();
    });
  }

  /**
   * Shown once, after the content warning. The local AI is a big download, so the player chooses.
   * Either way the game is complete; the AI only changes who writes some of the lines.
   */
  _aiConsent() {
    // Deliberately vague about what it does: finding out is part of the game. Honest about what matters:
    // the size, that it stays on this computer, and that the camera and microphone always ask first.
    const p = this._screen(`<h2>One more thing</h2>
      <p>After Class has an optional <b>enhanced pack</b> that lets some scenes respond more closely to you.</p>
      <ul class="consent">
        <li>One download (${DOWNLOAD_SIZE} of on-device models), then it works offline.</li>
        <li>It runs entirely on this computer. Nothing you do in the game is uploaded anywhere.</li>
        <li>A few scenes may ask to use your camera or microphone. They always ask first, and saying no is always fine.</li>
        <li>Without it the game is complete: same story, same endings.</li>
      </ul>
      <p class="hint">Recommended for the intended experience. You can change this later in Settings.</p>
      <div class="row"><button data-a="on">Download it</button><button data-a="off">Not now</button></div>`, "center warning");
    p.addEventListener("click", e => {
      const a = e.target.dataset.a;
      if (!a) return;
      this.audio.unlock();
      persist.data.settings.ai = a === "on";
      persist.set("aiAsked", true);
      if (a === "on") ai.init();
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
    const p = this._screen(`<h2>Forget them?</h2><p>This erases every save and everything Hina, Rei and Sayo remember about you. You'll start again from the first Monday.</p>
      <p class="hint">Your scrapbook stays. It always does.</p>
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
      const special = { K: "named_k", HINA: "named_girl", REI: "named_girl", SAYO: "named_girl", OFFICE: "named_office", "THE OFFICE": "named_office" }[name.toUpperCase()];
      this.start(special || "start");
    };
    input.addEventListener("keydown", e => { if (e.key === "Enter") go(); e.stopPropagation(); });
    p.addEventListener("click", e => {
      if (e.target.dataset.a === "ok") go();
      if (e.target.dataset.a === "back") this.title();
    });
  }

  /** The Summer Scrapbook: everything the player has done with them, across every playthrough. */
  openScrapbook(fromTitle = false, tab = "list") {
    const P = persist.data;
    const got = id => !!P.mem[id];
    const books = [
      ["list", "Hina's summer list"], ["photo", "Rei's photos"], ["sketch", "Sayo's sketchbook"], ["other", "Keepsakes"]
    ];
    // The Office's files only show up once there's a reason to go looking for them.
    if (P.act3 || MEMORIES.some(m => m.book === "office" && got(m.id))) books.push(["office", "The Office's files"]);
    const items = MEMORIES.filter(m => m.book === tab);
    let body = "";
    if (tab === "endings") {
      body = `<div class="sb-cards">${ENDINGS.map((e, i) => P.endings.includes(e.id)
        ? `<div class="sb-card"><b>${i + 1}. ${e.name}</b><p>${e.text}</p></div>`
        : `<div class="sb-card blank"><b>${i + 1}. · · ·</b><p>${e.hint}</p></div>`).join("")}</div>`;
    } else if (tab === "notes") {
      const shown = NOTES.map(n => [n, this._noteState(n)]).filter(([, st]) => st);
      body = shown.length ? `<div class="sb-cards sb-notes">${shown.map(([n, st]) => st === "a"
        ? `<div class="sb-card note"><b>${n.q}</b><p>${this._fill(n.a)}</p></div>`
        : `<div class="sb-card blank note"><b>? ${n.q}</b><p>not sure yet</p></div>`).join("")}</div>`
        : `<p class="hint">Nothing strange has happened yet. Probably.</p>`;
    } else if (tab === "list") {
      body = `<ol class="sb-list">${items.map(m => `<li class="${got(m.id) ? "got" : ""}"><span class="sb-box">${got(m.id) ? "✓" : ""}</span><span>${this._fill(m.title)}</span></li>`).join("")}</ol>`;
    } else if (tab === "photo") {
      body = `<div class="sb-photos">${items.map(m => got(m.id)
        ? `<figure class="mini-pol${m.ghost ? " ghosted" : ""}"><div class="mini-img" style="background-image:url(assets/bg/${m.bg}.webp)">${m.who ? `<img src="assets/sprites/${m.who}/${m.expr || "neutral"}.webp" alt="">` : ""}</div><figcaption>${this._fill(m.title)}</figcaption></figure>`
        : `<figure class="mini-pol blank"><div class="mini-img"></div><figcaption>not developed yet</figcaption></figure>`).join("")}</div>`;
    } else {
      body = `<div class="sb-cards">${items.map(m => got(m.id)
        ? `<div class="sb-card${m.door || m.gift ? " door-card" : ""}"><b>${this._fill(m.title)}</b>${(m.door && P.door) || (m.gift && P.gift) ? `<svg viewBox="0 0 120 170"><path d="${m.door ? P.door : P.gift}"/></svg>` : ""}<p>${this._fill(m.text || "")}</p></div>`
        : `<div class="sb-card blank"><b>· · ·</b><p>${m.hint || "a page you haven't found"}</p></div>`).join("")}</div>`;
    }
    const n = this.memCount(), total = this.memTotal();
    const hearts = this.frames.length ? ["hina", "rei", "sayo"].map(g => {
      const a = Math.max(0, Math.min(5, this.v.aff[g] || 0));
      return `<span class="sb-heart" style="--who:${CAST[g].color}"><b>${CAST[g].name}</b> ${"♥".repeat(a)}${"♡".repeat(5 - a)}</span>`;
    }).join("") : "";
    const p = this._screen(`<h2>${$("#game").classList.contains("uncanny") ? "Evidence" : "Summer Scrapbook"}</h2>
      <div class="sb-progress"><span style="width:${Math.round(n / total * 100)}%"></span></div>
      <p class="hint">${n} of ${total} memories kept${n === total ? " · every single one ♡" : ""}</p>
      ${hearts ? `<div class="sb-hearts">${hearts}</div>` : ""}
      <div class="sb-tabs">${books.map(([k, label]) => `<button data-tab="${k}" class="${k === tab ? "on" : ""}">${label} <small>${MEMORIES.filter(m => m.book === k && got(m.id)).length}/${MEMORIES.filter(m => m.book === k).length}</small></button>`).join("")}<button data-tab="notes" class="${tab === "notes" ? "on" : ""}">What we know <small>${NOTES.filter(n => this._noteState(n) === "a").length}/${NOTES.filter(n => this._noteState(n)).length}</small></button><button data-tab="endings" class="${tab === "endings" ? "on" : ""}">Endings <small>${ENDINGS.filter(e => P.endings.includes(e.id)).length}/${ENDINGS.length}</small></button></div>
      <div class="sb-page">${body}</div>
      <p class="keys">The scrapbook keeps everything, even when they forget.</p>
      <div class="row"><button data-a="close">Close</button></div>`, "scrapbook");
    p.addEventListener("click", e => {
      const t = e.target.closest("[data-tab]");
      if (t) { this.audio.sfx("page"); return this.openScrapbook(fromTitle, t.dataset.tab); }
      if (e.target.dataset.a === "close") fromTitle ? this.title() : this.closeScreen();
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
      if (P.wiped && !d && this.v.sabotage) label = "consolidated by the Office";
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
        persist.set("loads", (persist.data.loads || 0) + 1);
        // Choices made since that save, in this same week, are the ones the load just took back.
        const now = (this.frames.length && this.v.choiceLog) || [];
        const then = (d.v && d.v.choiceLog) || [];
        const undone = now.length > then.length && then.every((c, i) => now[i] === c) ? now.slice(then.length) : [];
        this.closeScreen();
        this._pendingUndo = undone.length ? undone : null;
        this._restore(d);
      }
    });
  }

  /**
   * After a load that took choices back. Act 1: once, Sayo notices, and nobody else does.
   * After the first ending: they all remember, every time, and the Office starts keeping score.
   */
  _noticeUndo(undone) {
    const P = persist.data;
    persist.set("undone", [...(P.undone || []), ...undone].slice(-12));
    persist.set("undos", (P.undos || 0) + 1);
    this.v.undid = undone[undone.length - 1];
    this.v.undidCount = undone.length;
    if (P.runs === 0 && P.undos > 1) return; // Act 1 stays sweet: she only says it once
    this.frames.push({ id: P.runs === 0 ? "on_load_a1" : "on_load", i: 0 });
  }

  openSettings(fromTitle = false) {
    const s = persist.data.settings;
    const p = this._screen(`<h2>Settings</h2>
      <label>Text speed <input type="range" min="10" max="90" value="${s.textSpeed}" data-s="textSpeed"></label>
      <label>Music <input type="range" min="0" max="1" step="0.05" value="${s.music}" data-s="music"></label>
      <label>Sound &amp; voices <input type="range" min="0" max="1" step="0.05" value="${s.sfx}" data-s="sfx"></label>
      <label class="check"><input type="checkbox" ${s.voice ? "checked" : ""} data-s="voice"> Character voices and announcements</label>
      <label class="check"><input type="checkbox" ${s.gore !== false ? "checked" : ""} data-s="gore"> Graphic horror (blood, jumpscares, disturbing images)</label>
      <label class="check"><input type="checkbox" ${s.ai ? "checked" : ""} data-s="ai"> Enhanced pack <small>on-device models · ${DOWNLOAD_SIZE} once · runs only on this computer · <span class="ai-state">${{ off: "off", loading: "downloading…", ready: "ready", failed: "couldn't load" }[ai.state]}</span></small></label>
      ${this.meta.native ? `<div class="row left"><button data-a="full">Toggle fullscreen</button><button data-a="folder">Open the game folder</button></div>` : ""}
      ${fromTitle && persist.data.runs > 0 ? `<div class="row left"><button data-a="restart">Start over from the first week</button></div>` : ""}
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
      if (k === "ai" && val) ai.init();
      if (k === "gore") this.meta.blood(!!this.v.blood);
    });
    p.addEventListener("click", e => {
      const a = e.target.dataset.a;
      if (a === "close") fromTitle ? this.title() : this.closeScreen();
      if (a === "full") this.meta.native.fullscreen(!this._full).then(f => { this._full = f; });
      if (a === "folder") this.meta.reveal();
      if (a === "restart") this._forget();
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
    if (this._pendingUndo) { this._noticeUndo(this._pendingUndo); this._pendingUndo = null; }
    this.showUI(true);
    const shown = this.v.shown || {};
    this._clearSprites();
    if (this.v.bg) this._setBg(this.v.bg);
    Object.entries(shown).forEach(([who, s]) => this._show(who, s.expr, s.pos, true));
    if (this.v.music) this.audio.play(this.v.music);
    this.meta.mood(this.v.mood || null);
    this.meta.cg(this.v.cg || null, { fade: false });
    this.meta.blood(!!this.v.blood);
    this._inDelete = false;
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
    if (IS_DEMO && (/^(r_|a3_|k_save|visit|reunion)/.test(label) || (label === "start" && persist.data.runs > 0))) return this._demoEnd();
    this.v = this._freshVars();
    this.meta.mood(null);
    this.meta.cg(null);
    this.meta.blood(false);
    this._inDelete = false;
    this._portrait(null);
    if (label !== "behind_title") this.audio.muffle(false);
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
      case "set": this.v[c.k] = c.v; if (c.k === "sabotage") this.meta.syncUncanny(); return;
      case "mem": return this._memory(c.id);
      case "add": this.v.aff[c.k] = (this.v.aff[c.k] || 0) + (c.n ?? 1); return;
      case "pset": persist.set(c.k, c.v); this._checkNotes(); return;
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
      case "cg": return this.meta.cg(c.id);
      case "aisay": return this._aiSay(c);
    }
  }

  /* ---------- dialogue ---------- */

  async _say(c) {
    const box = $("#say");
    const nameEl = $("#say-name");
    const textEl = $("#say-text");
    const who = c.who && c.who !== "-" ? c.who : null;
    const info = who ? CAST[who] : null;

    // 2.1: a file the game wrote went missing. Whoever it belonged to notices before this line is said.
    if (this.meta.pendingDeleted.length && !this._inDelete && this.frames.length && !this._ended) {
      this.v.delFiles = this.meta.pendingDeleted.splice(0);
      this._inDelete = true;
      this.frames[this.frames.length - 1].i--; // say this line again afterwards
      this.frames.push({ id: "on_delete", i: 0 });
      return;
    }

    // The Office's speaker lights up while it talks and goes back to listening when someone else does.
    if (this.sprites.office && who !== "office" && (this.v.shown.office || {}).expr === "speak") this._show("office", "neutral");
    let portrait = null;
    if (who && info && info.sprite) {
      if (info.office) this._show(who, c.expr || (c.corrupt ? "eye" : "speak"), this.sprites[who] ? undefined : "farright");
      else if (info.minor && !this.sprites[who]) {
        // Minor characters step on stage only if there's an empty spot; otherwise they talk from the side of the text box.
        const free = this._freePos();
        if (free) this._show(who, c.expr || "neutral", free);
        else portrait = `assets/sprites/${who}/${c.expr || "neutral"}.webp`;
      } else if (!this.sprites[who] && !info.ghost) this._show(who, c.expr || "neutral", this._autoPos());
      else if (c.expr) this._show(who, c.expr);
    }
    this._portrait(portrait);
    Object.entries(this.sprites).forEach(([k, el]) => el.classList.toggle("dim", !!who && k !== who && !!info && !!info.sprite && !(CAST[k] || {}).office));
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
    const token = {};
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
          // One pick per menu, even if the click lands twice during the hijack animation.
          if (wrap._picked === token) return;
          wrap._picked = token;
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
          // 2.1: every pick is written down. Loading an older save can take a choice back; it can't make them forget it.
          this.v.choiceLog = [...(this.v.choiceLog || []), picked];
          this.history.push({ who: this.name(), text: "» " + picked });
          const chosen = c.hijack && c.forceIndex != null ? items[c.forceIndex] : it;
          if (chosen.go) this._jump(chosen.go);
          else if (chosen.doId) this.frames.push({ id: chosen.doId, i: 0 });
          if (this._menuResolve) this._menuResolve();
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
      // A choice with a clock on it. Not choosing is also a choice: when time runs out, the script goes to timeoutGo.
      if (c.timeout) {
        const bar = document.createElement("div");
        bar.className = "choice-timer";
        bar.innerHTML = `<span></span><small>${this._fill(c.timerLabel || "")}</small>`;
        wrap.appendChild(bar);
        const fill = bar.querySelector("span");
        const t0 = Date.now();
        const tick = setInterval(() => {
          if (wrap._picked === token || !wrap.contains(bar)) return clearInterval(tick);
          const left = 1 - (Date.now() - t0) / c.timeout;
          fill.style.width = Math.max(0, left * 100) + "%";
          if (left > 0) return;
          clearInterval(tick);
          wrap._picked = token;
          this.v.lastChoice = null;
          this.v.lastChoiceIndex = -1;
          this.history.push({ who: this.name(), text: "» (nothing)" });
          if (c.timeoutGo) this._jump(c.timeoutGo);
          if (this._menuResolve) this._menuResolve();
        }, 200);
      }
    });
  }

  /* ---------- stage ---------- */

  _setBg(id, fade = true) {
    this.v.bg = id;
    const stage = $("#bg");
    const img = document.createElement("div");
    img.className = "bg-img";
    if (id === "void") {
      // Behind the menu: no room, just three pieces of tape on the floor where they stand.
      img.classList.add("void");
      img.innerHTML = [["REI", 14], ["HINA", 50], ["SAYO", 86]].map(([n, x]) => `<span class="mark" style="left:${x}%">${n}</span>`).join("");
    } else img.style.backgroundImage = `url(assets/bg/${id}.webp)`;
    if (!fade) img.style.transition = "none";
    stage.appendChild(img);
    requestAnimationFrame(() => img.classList.add("in"));
    setTimeout(() => { while (stage.children.length > 1) stage.firstElementChild.remove(); }, fade ? 900 : 0);
  }

  /** A stage spot nobody is standing on, or null if the stage is full. */
  _freePos() {
    const used = Object.values(this.v.shown || {}).map(s => s.pos);
    return ["center", "left", "right"].find(p => !used.includes(p)) || null;
  }

  /** The small picture beside the name tag, for a minor character who couldn't fit on stage. */
  _portrait(src) {
    let img = $("#say-portrait");
    if (!img) { img = document.createElement("img"); img.id = "say-portrait"; img.alt = ""; $("#say").appendChild(img); }
    img.style.display = src ? "" : "none";
    if (src && !img.src.endsWith(src)) img.src = src;
  }

  /** Remember the stage before an interruption (a deleted file), so the scene can carry on as it was. */
  _stash() {
    this.v._stash = { bg: this.v.bg, shown: { ...this.v.shown }, music: this.v.music, cg: this.v.cg, mood: this.v.mood, blood: this.v.blood };
    this.meta.cg(null);
    this._clearSprites();
  }

  _unstash() {
    const st = this.v._stash;
    this._inDelete = false;
    this.v.delFiles = null;
    if (!st) return;
    this._clearSprites();
    if (st.bg) this._setBg(st.bg);
    Object.entries(st.shown || {}).forEach(([who, x]) => this._show(who, x.expr, x.pos, true));
    this.meta.cg(st.cg || null);
    this.meta.mood(st.mood || null);
    this.meta.blood(!!st.blood);
    this.v.music = st.music;
    if (st.music) this.audio.play(st.music); else this.audio.stop();
    this.v._stash = null;
  }

  /** The text of a file the game writes, for putting a deleted one back. */
  _restoreText(name) { const f = FILE_TEXTS[name]; return f ? f() : null; }

  /**
   * A line written live by the local language model (aiSay in script-helpers.js).
   * c.task(g) describes the situation in a sentence or two; c.include(g) gives the player's own words, which
   * the reply has to mention. The Office shows that it's generating; the girls just look like they're thinking.
   * If the model is off, slow, or says something it shouldn't, the written fallback line is used instead.
   */
  async _aiSay(c) {
    let text = null;
    const expr = typeof c.expr === "function" ? c.expr(this) : c.expr;
    if (ai.ready && this.mode !== "skip") {
      const office = c.who === "office";
      if (expr && CAST[c.who] && CAST[c.who].sprite) this._show(c.who, expr);
      $("#say").className = office ? "who-office thinking" : "who-" + c.who + " thinking";
      $("#say-name").textContent = (CAST[c.who] || CAST.office).name;
      $("#say-name").style.display = "";
      $("#say-text").textContent = office ? "◉ generating" : "…";
      if (office) this.audio.sfx("type");
      const situation = this._fill(typeof c.task === "function" ? c.task(this) : c.task);
      const include = typeof c.include === "function" ? c.include(this) : c.include;
      text = await ai.line({ who: c.who, situation, mustInclude: include ? [].concat(include) : null });
    }
    const fallback = typeof c.fallback === "function" ? c.fallback(this) : c.fallback;
    const line = text ? text.replace(/[{}]/g, "") : fallback;
    if (text) this.v.lastAiLine = text;
    return this._say({ t: "say", who: c.who, expr, text: line, corrupt: c.corrupt, live: !!text });
  }

  /** Who the model is talking to. Kept to one sentence: small models lose the thread in long prompts. */
  _aiSituation() { return `The player is called ${this.name()}.`; }

  /** The tiny "the Office is learning" badge while the model downloads. */
  _aiBadge() {
    let b = $("#ai-badge");
    if (!b) { b = document.createElement("div"); b.id = "ai-badge"; $("#game").appendChild(b); }
    const st = ai.state;
    b.className = st;
    // Neutral on purpose. (Act 3's patch notes are where the Office admits what it is now.)
    b.textContent = st === "loading" ? `downloading enhanced pack… ${Math.round(ai.progress * 100)}%`
      : st === "ready" ? "enhanced pack ready" : st === "failed" ? "enhanced pack couldn't load (the game is unaffected)" : "";
    if (st === "ready" || st === "failed") setTimeout(() => b.classList.add("gone"), 6000);
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
      el.dataset.who = who;
      layer.appendChild(el);
      this.sprites[who] = el;
      if (!instant) { el.classList.add("enter"); requestAnimationFrame(() => el.classList.remove("enter")); }
    }
    el.src = `assets/sprites/${who}/${expr}.webp`;
    el.style.left = POS[pos] + "%";
    el.classList.toggle("is-corrupt", expr === "corrupt");
    el.classList.toggle("pose-close", CLOSE.includes(expr));
    el.classList.toggle("pose-wide", WIDE.includes(expr));
    el.classList.toggle("is-office", !!(CAST[who] || {}).office);
    el.classList.toggle("is-minor", !!(CAST[who] || {}).minor);
    el.classList.toggle("is-ghost", !!(CAST[who] || {}).ghost);
    el.classList.toggle("is-eye", who === "office" && expr === "eye");
    // A main character taking a spot pushes a minor one out of it.
    if (!(CAST[who] || {}).minor) Object.entries(this.v.shown).forEach(([m, sh]) => { if (m !== who && (CAST[m] || {}).minor && sh.pos === pos) this._hide(m); });
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
    const dots = n < 0 ? "" : days.map((d, i) => `<i class="${i < n ? "past" : i === n ? "now" : ""}">${i <= n ? "♥" : "♡"}</i>`).join("");
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
    this._checkNotes(true);
    persist.set("lastEnding", c.id);
    if (c.countRun !== false) persist.set("runs", persist.data.runs + 1);
    if (c.id === "summer") persist.set("summer", true);
    if (c.id === "graduation") persist.set("graduated", true);
    this.showUI(false);
    const el = document.createElement("div");
    el.className = "ending-card";
    this.meta.progress(-1);
    this.meta.guardClose(null);
    const closes = (c.id === "summer" || c.id === "graduation") && this.meta.native;
    el.innerHTML = `<div class="ending-kind">${c.kind || "ENDING"}</div><div class="ending-name"></div>
      <p class="ending-mem">♡ ${this.memCount()} of ${this.memTotal()} memories in your scrapbook</p>
      ${closes ? `<p class="ending-note">${c.id === "graduation" ? "School's out. The game will close itself." : "They're closing up for summer. The game will close itself."}</p>` : ""}
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
      <p class="hint">Three acts · seven endings · a second term nobody asked for · the save slot that isn't yours · a desktop version that leaves things in its own folder</p>
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
