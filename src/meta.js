/**
 * meta.js — The fourth-wall effects. Each one is called deliberately from the story script;
 * nothing here fires at random. Watchers (tab, idle, cursor) only run while the script turns them on.
 */
import { persist, formatDuration } from "./persist.js";

const $ = (sel, root = document) => root.querySelector(sel);
const sleep = ms => new Promise(r => setTimeout(r, ms));

export class Meta {
  constructor(game) {
    this.game = game;
    this.root = $("#game");
    this.fx = $("#fx");
    this.watch = { tab: false, idle: false, cursor: false };
    this._hiddenAt = 0;
    this._lastInput = Date.now();
    this._idleFired = false;
    this.baseTitle = document.title;

    document.addEventListener("visibilitychange", () => this._onVisibility());
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
  /** Toggle a persistent mood filter on the whole game: "wrong", "red", or null. */
  mood(name) {
    this.root.classList.remove("mood-wrong", "mood-red");
    if (name) this.root.classList.add("mood-" + name);
  }

  _layer(style) {
    const el = document.createElement("div");
    el.className = "fx-layer";
    el.style.cssText = style;
    this.fx.appendChild(el);
    return el;
  }

  /* ---------- the Office ---------- */

  /** A PA announcement: chime, red banner, synthesized voice. */
  async pa(text, { broken = false } = {}) {
    const audio = this.game.audio;
    audio.sfx(broken ? "chime_down" : "chime");
    const el = document.createElement("div");
    el.className = "pa-banner" + (broken ? " broken" : "");
    el.innerHTML = `<div class="pa-head">◆ ANNOUNCEMENT FROM THE OFFICE</div><div class="pa-text"></div>`;
    $(".pa-text", el).textContent = text;
    this.fx.appendChild(el);
    await sleep(1300);
    await audio.speak(text, broken ? { pitch: 0.2, rate: 0.7 } : {});
    await sleep(400);
    el.classList.add("out");
    setTimeout(() => el.remove(), 600);
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
        if (a === "take") {
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

  _onVisibility() {
    if (document.hidden) {
      this._hiddenAt = Date.now();
      if (this.watch.tab) {
        persist.set("tabouts", persist.data.tabouts + 1);
        document.title = `${this.game.name()}? come back`;
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
      screen: `${window.innerWidth} by ${window.innerHeight}`
    };
  }
}
