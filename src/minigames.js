/**
 * minigames.js — The interactive pieces that aren't dialogue: typed answers, the Office's survey,
 * Rei's viewfinder, Sayo's drawing, the pose rehearsal, the patch notes, the Hearing and the
 * Office's computer. Each one returns a promise, so the script just awaits it (see mini() in script-helpers.js).
 * The words live in the story files; these only know how to run.
 */
import { persist } from "./persist.js";

const $ = (sel, root = document) => root.querySelector(sel);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
/** Typed text ends up quoted back in the script, so keep it to plain words. */
const clean = (s, max) => String(s || "").replace(/[<>{}\\|`]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
// Keys typed into a minigame must never reach the dialogue box (space advances, H hides the UI, 1-9 pick choices).
const keepKeys = el => ["keydown", "keyup"].forEach(ev => el.addEventListener(ev, e => e.stopPropagation()));

export class Minigames {
  constructor(game) {
    this.game = game;
    this.fx = $("#fx");
  }

  get audio() { return this.game.audio; }
  fill(t) { return this.game._fill(t); }

  _overlay(cls, html) {
    const el = document.createElement("div");
    el.className = "mg " + cls;
    el.innerHTML = html;
    this.fx.appendChild(el);
    keepKeys(el);
    return el;
  }

  _close(el) {
    el.classList.add("out");
    setTimeout(() => el.remove(), 400);
  }

  /* ---------- a typed answer ---------- */

  /** A notebook card with one line to write on. Resolves the cleaned text (and stores it if `key` is given). */
  ask({ title = "", hint = "", placeholder = "", max = 40, key = null, value = "", allowEmpty = false, button = "Write it down" } = {}) {
    return new Promise(resolve => {
      const el = this._overlay("mg-ask", `<div class="ask-card"><h3></h3><p class="ask-hint"></p>
        <input maxlength="${max}" autocomplete="off" spellcheck="false"><div class="row"><button>${esc(button)}</button></div></div>`);
      $("h3", el).textContent = this.fill(title);
      $(".ask-hint", el).textContent = this.fill(hint);
      const input = $("input", el);
      input.placeholder = placeholder;
      input.value = value;
      setTimeout(() => input.focus(), 50);
      const go = () => {
        const text = clean(input.value, max);
        if (!text && !allowEmpty) { input.classList.add("shake"); setTimeout(() => input.classList.remove("shake"), 400); return; }
        this.audio.sfx("pencil");
        if (key) persist.set(key, text);
        this._close(el);
        resolve(text);
      };
      input.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
      $("button", el).addEventListener("click", go);
    });
  }

  /* ---------- the Office's survey ---------- */

  /** A five-star survey with only one possible answer. Comment is stored as persist.survey. */
  survey() {
    return new Promise(resolve => {
      const el = this._overlay("mg-survey", `<div class="survey">
        <div class="survey-head">Hoshimi Academy Student Office<small>student satisfaction survey · 1 minute</small></div>
        <div class="survey-q" data-q="1"><p>How was your last week before summer?</p><div class="stars">${[1, 2, 3, 4, 5].map(i => `<button data-star="${i}">☆</button>`).join("")}</div><p class="survey-note"></p></div>
        <div class="survey-q hidden" data-q="2"><p>Will you be staying for the second term?</p>
          <div class="row"><button data-stay="yes">Yes!</button><button data-stay="yes2">Of course ♡</button></div>
          <button class="survey-no" data-stay="no">no thanks, I don't like summer</button></div>
        <div class="survey-q hidden" data-q="3"><p>Anything you'd like to tell us? <small>(optional)</small></p>
          <textarea maxlength="80" rows="2" spellcheck="false"></textarea><div class="row"><button data-send>Submit</button></div></div>
      </div>`);
      const q = n => $(`[data-q="${n}"]`, el);
      el.addEventListener("click", async e => {
        const star = e.target.closest("[data-star]");
        if (star) {
          // Whatever you press, it's five stars.
          el.querySelectorAll("[data-star]").forEach(s => { s.textContent = "★"; s.classList.add("on"); });
          this.audio.sfx("sparkle");
          $(".survey-note", el).textContent = Number(star.dataset.star) === 5 ? "Thank you!" : `Thank you for your ★★★★★ rating! (We fixed a typo in your ${star.dataset.star}.)`;
          this.game.v.surveyStars = Number(star.dataset.star);
          await sleep(1100);
          q(1).classList.add("hidden"); q(2).classList.remove("hidden");
          return;
        }
        const stay = e.target.closest("[data-stay]");
        if (stay && stay.dataset.stay === "no") {
          this.audio.sfx("error");
          stay.textContent = "Are you sure? Everyone will be so sad. (tap Yes!)";
          stay.classList.add("shrink");
          this.game.v.surveyNo = true;
          return;
        }
        if (stay) { q(2).classList.add("hidden"); q(3).classList.remove("hidden"); $("textarea", el).focus(); return; }
        if (e.target.closest("[data-send]")) {
          persist.set("survey", clean($("textarea", el).value, 80));
          this.audio.sfx("pop");
          $(".survey", el).innerHTML = `<div class="survey-head">Thank you!<small>Your answers have been recorded. They will be kept forever.</small></div>`;
          await sleep(1600);
          this._close(el);
          resolve(true);
        }
      });
    });
  }

  /* ---------- Rei's viewfinder ---------- */

  /**
   * Rei hands you the camera. Somewhere in the scene, K is standing very still. Find them and press the shutter.
   * Resolves the number of missed shots.
   */
  viewfinder({ prompt = "Find K. Click when they're in the middle of the frame." } = {}) {
    return new Promise(resolve => {
      const bgUrl = (($("#bg .bg-img:last-child") || {}).style || {}).backgroundImage || "";
      const x = 18 + Math.random() * 64, y = 38 + Math.random() * 28;
      const el = this._overlay("mg-view", `<div class="view-scene">
          <div class="view-k" style="left:${x}%;top:${y}%"></div></div>
        <div class="view-mask"></div><div class="view-ring"><i></i></div>
        <p class="view-prompt"></p><p class="view-count">EXP <b>24</b></p>`);
      $(".view-scene", el).style.backgroundImage = bgUrl;
      $(".view-prompt", el).textContent = this.fill(prompt);
      // Rei's reticle (if she's watching your cursor) would sit on top of the viewfinder. Not while you're holding her camera.
      const reticle = $("#reticle"), reticleWas = reticle.style.display;
      reticle.style.display = "none";
      const ring = $(".view-ring", el), mask = $(".view-mask", el), k = $(".view-k", el);
      let misses = 0, shots = 24, done = false;
      const move = e => {
        el.style.setProperty("--x", e.clientX + "px");
        el.style.setProperty("--y", e.clientY + "px");
        const r = k.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height * 0.35));
        // The closer the frame gets, the sharper they come out.
        k.style.filter = `blur(${Math.min(14, 2 + d / 28)}px)`;
        ring.classList.toggle("near", d < 90);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("click", async e => {
        if (done) return;
        const r = k.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height * 0.35));
        this.audio.sfx("shutter");
        $(".view-count b", el).textContent = --shots;
        if (d < 85) {
          done = true;
          k.style.filter = "none";
          k.classList.add("found");
          mask.classList.add("flash");
          await sleep(1400);
          reticle.style.display = reticleWas;
          this._close(el);
          return resolve(misses);
        }
        misses++;
        mask.classList.remove("flash"); void mask.offsetWidth; mask.classList.add("flash");
        const hint = misses >= 4 ? "Rei: \"Left of where you're looking. No— your other left.\"" : ["Rei: \"Nothing there. Just the room.\"", "Rei: \"Blurry. Try again.\"", "Rei: \"They don't move. You do.\""][misses % 3];
        $(".view-prompt", el).textContent = hint;
        if (misses >= 4) k.classList.add("pulse");
      });
    });
  }

  /* ---------- Sayo's drawing ---------- */

  /**
   * A page of Sayo's sketchbook and a pencil. Whatever the player draws is kept as an SVG path
   * (persist.door when `door` is set, otherwise persist[key]), and in the .exe it's saved as a PNG next to the game.
   */
  draw({ prompt = "Draw a door.", door = true, key = null, file = null } = {}) {
    return new Promise(resolve => {
      const W = 360, H = 510;
      const el = this._overlay("mg-draw", `<div class="draw-page"><p class="draw-prompt"></p>
        <canvas width="${W}" height="${H}"></canvas>
        <div class="row"><button data-a="clear">Erase</button><button data-a="done" disabled>Give it to Sayo</button></div></div>`);
      $(".draw-prompt", el).textContent = this.fill(prompt);
      const cv = $("canvas", el), ctx = cv.getContext("2d");
      ctx.lineCap = ctx.lineJoin = "round";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#3b3440";
      let strokes = [], cur = null, inked = 0;
      const pt = e => {
        const r = cv.getBoundingClientRect();
        return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
      };
      cv.addEventListener("pointerdown", e => {
        cv.setPointerCapture(e.pointerId);
        cur = [pt(e)];
        strokes.push(cur);
      });
      cv.addEventListener("pointermove", e => {
        if (!cur) return;
        const p = pt(e), q = cur[cur.length - 1];
        const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
        if (d < 3) return;
        ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
        cur.push(p);
        inked += d;
        if (Math.random() < 0.12) this.audio.sfx("pencil");
        if (inked > 220) $('[data-a="done"]', el).disabled = false;
      });
      const up = () => { cur = null; };
      cv.addEventListener("pointerup", up);
      cv.addEventListener("pointercancel", up);
      el.addEventListener("click", async e => {
        const a = e.target.dataset && e.target.dataset.a;
        if (a === "clear") { strokes = []; inked = 0; ctx.clearRect(0, 0, W, H); $('[data-a="done"]', el).disabled = true; }
        if (a !== "done") return;
        // 360x510 canvas → the 120x170 box the title-screen door uses. Capped so it fits in storage.
        let budget = 700;
        const path = strokes.filter(s => s.length > 1).map(s => {
          const pts = s.slice(0, Math.max(2, budget));
          budget -= pts.length;
          return "M" + pts.map(([x, y]) => `${(x / 3).toFixed(1)} ${(y / 3).toFixed(1)}`).join(" L");
        }).filter(p => p.length > 1).join(" ");
        if (door) persist.set("door", path);
        else if (key) persist.set(key, path);
        if (file && this.game.meta.native) {
          const out = document.createElement("canvas");
          out.width = W; out.height = H;
          const o = out.getContext("2d");
          o.fillStyle = "#fbf7ee"; o.fillRect(0, 0, W, H);
          o.drawImage(cv, 0, 0);
          try { await this.game.meta.native.writeImage(file, out.toDataURL("image/png")); } catch (err) { /* folder not writable */ }
        }
        this.audio.sfx("page");
        this._close(el);
        resolve(path);
      });
    });
  }

  /* ---------- the pose rehearsal ---------- */

  /**
   * Behind the menu. The girls rest while you hold still, and snap back into their pose when you move.
   * Every so often the Office's eye opens to check on them: move while it's open, so they're smiling when it looks.
   * Fill the rest bar without getting caught three times. Resolves { strikes, tries }.
   */
  pose() {
    return new Promise(resolve => {
      const el = this._overlay("mg-pose", `<div class="pose-stage">
          <img data-g="rei" src="assets/sprites/rei/neutral.webp" style="left:16%">
          <img data-g="sayo" src="assets/sprites/sayo/neutral.webp" style="left:84%">
          <img data-g="hina" src="assets/sprites/hina/happy.webp" style="left:50%">
        </div>
        <div class="pose-eye"><svg viewBox="0 0 100 50"><path class="lid" d="M5 25 Q50 -5 95 25 Q50 55 5 25 Z"/><circle cx="50" cy="25" r="11"/></svg></div>
        <div class="pose-hud"><p class="pose-tip">Hold still so they can rest. When the eye opens, <b>move</b>, so they're smiling when it looks.</p>
          <div class="pose-bar"><span></span></div><p class="pose-strikes"></p></div>`);
      const img = {};
      el.querySelectorAll("[data-g]").forEach(i => { img[i.dataset.g] = i; });
      const set = (g, e) => { const src = `assets/sprites/${g}/${e}.webp`; if (!img[g].src.endsWith(src)) img[g].src = src; };
      const eye = $(".pose-eye", el), fill = $(".pose-bar span", el), strikesEl = $(".pose-strikes", el);
      let lastMove = Date.now(), tries = 0, strikes, rest, state, until, caughtThisOpen, timer, last;
      el.addEventListener("pointermove", () => { lastMove = Date.now(); });
      const reset = () => {
        tries++;
        strikes = 0; rest = 0; state = "closed"; until = Date.now() + 2500; caughtThisOpen = false; last = Date.now();
        strikesEl.textContent = "caught: ○ ○ ○";
        clearInterval(timer);
        timer = setInterval(tick, 80);
      };
      const tick = () => {
        const now = Date.now(), dt = now - last;
        last = now;
        const still = now - lastMove > 300;
        if (still) { set("hina", "sad"); set("rei", "annoyed"); set("sayo", "blank"); el.classList.add("resting"); }
        else { set("hina", "happy"); set("rei", "neutral"); set("sayo", "neutral"); el.classList.remove("resting"); }
        if (now > until) {
          // closed → warning (half open) → open → closed. It gets a little quicker after a second try, never harsher.
          if (state === "closed") { state = "warn"; until = now + 1000; this.audio.sfx("heartbeat"); }
          else if (state === "warn") { state = "open"; until = now + 1500 + Math.random() * 900; caughtThisOpen = false; }
          else { state = "closed"; until = now + 2600 + Math.random() * 2600; }
          eye.dataset.state = state;
        }
        if (state === "open" && still && !caughtThisOpen) {
          caughtThisOpen = true;
          strikes++;
          this.audio.sfx("error");
          el.classList.remove("caught"); void el.offsetWidth; el.classList.add("caught");
          strikesEl.textContent = "caught: " + "● ".repeat(strikes) + "○ ".repeat(Math.max(0, 3 - strikes));
          if (strikes >= 3) {
            clearInterval(timer);
            const box = document.createElement("div");
            box.className = "pose-fail";
            box.innerHTML = `<p>OFFICE LOG: students out of pose. Correcting.</p><button>Try again</button>`;
            el.appendChild(box);
            box.querySelector("button").addEventListener("click", () => { box.remove(); reset(); });
            return;
          }
        }
        if (still && state !== "open") rest += dt / 260;
        fill.style.width = Math.min(100, rest) + "%";
        if (rest >= 100) {
          clearInterval(timer);
          this.audio.sfx("sparkle");
          el.classList.add("won");
          setTimeout(() => { this._close(el); resolve({ strikes, tries }); }, 1600);
        }
      };
      reset();
    });
  }

  /* ---------- patch notes ---------- */

  /** A cheerful launcher popup announcing the update the Office installed. */
  patchNotes({ version = "2.0.0", lines = [], foot = "" } = {}) {
    return new Promise(resolve => {
      const el = this._overlay("mg-patch", `<div class="patch"><div class="patch-head"><b>After Class</b> has been updated <span>v${esc(version)}</span></div>
        <ul>${lines.map(l => `<li class="${l.startsWith("-") ? "minus" : l.startsWith("!") ? "warn" : ""}">${esc(this.fill(l.replace(/^[+\-!]\s*/, "")))}</li>`).join("")}</ul>
        <p class="patch-foot">${esc(this.fill(foot))}</p><div class="row"><button>Continue ♡</button></div></div>`);
      this.audio.sfx("chime");
      $("button", el).addEventListener("click", () => { this.audio.sfx("click"); this._close(el); resolve(true); });
    });
  }

  /* ---------- the Hearing ---------- */

  /**
   * One round of the Office's engagement hearing. The Office makes its statements; the player picks
   * the one that isn't true and presents a memory from the scrapbook as proof. Wrong answers cost patience;
   * running out just restarts the round. Resolves { misses }.
   * spec: { round, total, lines, weak, accept: [memory ids], wrong: [lines], hint: [who, text] }
   */
  hearing(spec) {
    const MEM = this.game.memories;
    return new Promise(resolve => {
      const got = MEM.filter(m => persist.data.mem[m.id]);
      const books = { list: "Hina's list", photo: "Rei's photos", sketch: "Sayo's sketchbook", other: "Keepsakes", office: "The Office's files" };
      const proofs = Object.keys(books).map(b => {
        const ms = got.filter(m => m.book === b);
        return ms.length ? `<h4>${books[b]}</h4>${ms.map(m => `<button class="proof" data-id="${m.id}">${esc(this.fill(m.title))}</button>`).join("")}` : "";
      }).join("");
      const el = this._overlay("mg-hearing", `<div class="hear">
        <div class="hear-top"><span class="hear-office">◉ THE OFFICE</span><span>ENGAGEMENT HEARING · round ${spec.round} of ${spec.total}</span><span class="hear-hearts"></span></div>
        <ol class="hear-lines">${spec.lines.map((l, i) => `<li data-i="${i}">${esc(this.fill(l))}</li>`).join("")}</ol>
        <p class="hear-msg">Pick the statement that isn't true. Then pick your proof.</p>
        <div class="hear-proofs">${proofs || "<p>You have nothing. Present yourself.</p>"}</div>
        <div class="row"><button data-a="hint">Ask the others</button><button data-a="present" disabled>Present proof</button></div>
      </div>`);
      let hearts = 5, misses = 0, line = null, proof = null, wrongN = 0;
      const heartsEl = $(".hear-hearts", el), msg = $(".hear-msg", el), present = $('[data-a="present"]', el);
      const drawHearts = () => { heartsEl.textContent = "patience " + "♥".repeat(hearts) + "♡".repeat(5 - hearts); };
      drawHearts();
      const say = (text, cls = "") => { msg.className = "hear-msg " + cls; msg.textContent = this.fill(text); };
      const ready = () => { present.disabled = line == null || !proof; };
      el.addEventListener("click", async e => {
        const li = e.target.closest(".hear-lines li");
        if (li) {
          el.querySelectorAll(".hear-lines li").forEach(x => x.classList.toggle("on", x === li));
          line = Number(li.dataset.i);
          this.audio.sfx("click");
          return ready();
        }
        const p = e.target.closest(".proof");
        if (p) {
          el.querySelectorAll(".proof").forEach(x => x.classList.toggle("on", x === p));
          proof = p.dataset.id;
          this.audio.sfx("page");
          return ready();
        }
        const a = e.target.dataset && e.target.dataset.a;
        if (a === "hint") { const [who, text] = spec.hint; say(`${this.game.cast[who].name}: "${text}"`, "hint"); return; }
        if (a !== "present") return;
        if (line === spec.weak && spec.accept.includes(proof)) {
          const stamp = document.createElement("div");
          stamp.className = "hear-stamp";
          stamp.textContent = "THAT'S A LIE";
          el.appendChild(stamp);
          this.audio.sfx("thud");
          this.game.meta.shake(300);
          await sleep(1500);
          this._close(el);
          return resolve({ misses });
        }
        misses++;
        hearts--;
        this.audio.sfx("error");
        el.classList.remove("hurt"); void el.offsetWidth; el.classList.add("hurt");
        drawHearts();
        const wrongLine = line !== spec.weak
          ? "That one's true, unfortunately. Pick a different statement."
          : (spec.wrong || ["That doesn't prove it. Think about what would."])[wrongN++ % (spec.wrong || [1]).length];
        say(wrongLine, "bad");
        if (hearts <= 0) {
          await sleep(900);
          say("OVERRULED. The Office smiles at you through every speaker in the building. ...Rei: \"Ignore it. Again. We have all week.\"", "bad");
          hearts = 5;
          drawHearts();
        }
      });
    });
  }

  /* ---------- the Office's computer ---------- */

  /**
   * OFFICE-PC: a whole desktop inside the game. Mail, files, a recycle bin, a message board, settings and a terminal.
   * spec holds the words (mail, files, bin, board, password, hints); the goals are fixed:
   *   read the directive · open the recycle bin · set extend_week to false (needs the password).
   * In the .exe the same retention.cfg is written to the game folder, and editing it there works too.
   * Resolves { restoredK, outside, admin }.
   */
  desktop(spec) {
    const g = this.game;
    const st = { mail: false, bin: false, changed: false, admin: false, restoredK: persist.data.restoredK, outside: false, fails: 0, openMail: new Set() };
    const cfg = () => `# retention.cfg — Hoshimi Academy Student Office
# do not edit. do not let them edit.
loop           = true
days_per_week  = 5
extend_week    = ${st.changed ? "false" : "true "}      # directive 2.0: minimum session three hours
allow_ending   = ${st.changed ? "true " : "false"}
smile_hold     = true
remember       = partial   # hina: counts. rei: looks. sayo: draws.
`;
    const files = () => ({ ...spec.files, "retention.cfg": cfg() });
    return new Promise(resolve => {
      const el = this._overlay("mg-desk", `<div class="desk">
        <div class="desk-icons">
          ${[["mail", "✉", "Mail"], ["files", "🗀", "Files"], ["bin", "♻", "Recycle Bin"], ["board", "☰", "Hoshimi Board"], ["settings", "⚙", "Engagement"], ["term", ">_", "Terminal"]]
            .map(([id, ico, label]) => `<button class="desk-icon" data-app="${id}"><span>${ico}</span>${label}</button>`).join("")}
        </div>
        <div class="desk-note"></div>
        <div class="desk-win hidden"><div class="win-bar"><b></b><button data-a="x">✕</button></div><div class="win-body"></div></div>
        <div class="desk-task"><span class="start">◉ OFFICE-PC</span><span class="task-msg"></span><button data-a="logoff" disabled>Log off</button><span class="task-clock"></span></div>
      </div>`);
      const win = $(".desk-win", el), body = $(".win-body", el), barTitle = $(".win-bar b", el);
      const clock = () => { $(".task-clock", el).textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); };
      clock();
      const clockTimer = setInterval(clock, 15000);
      const taskMsg = t => { $(".task-msg", el).textContent = this.fill(t); };

      const note = () => {
        const done = st.mail && st.bin && st.changed;
        $(".desk-note", el).innerHTML = `<b>sayo's note</b><ol>
          <li class="${st.mail ? "ok" : ""}">read the Office's mail</li>
          <li class="${st.bin ? "ok" : ""}">find out where K went</li>
          <li class="${st.changed ? "ok" : ""}">turn off <code>extend_week</code><small>it needs a password. the terminal can do it. so can the settings, maybe.</small></li>
        </ol>${done ? "<p>log off before it notices ♡</p>" : ""}`;
        $('[data-a="logoff"]', el).disabled = !done;
      };
      note();

      const open = (title, html) => {
        win.classList.remove("hidden");
        barTitle.textContent = title;
        body.innerHTML = html;
        body.scrollTop = 0;
        this.audio.sfx("click");
      };
      const text = s => `<pre class="win-text">${esc(this.fill(s))}</pre>`;
      const award = id => g._memory(id);

      const apps = {
        mail: () => {
          open("Mail — office@hoshimi.ac", `<div class="mail"><ul class="mail-list">${spec.mail.map((m, i) =>
            `<li data-mail="${i}" class="${st.openMail.has(i) ? "" : "unread"}"><b>${esc(this.fill(m.from))}</b><span>${esc(this.fill(m.subject))}</span><small>${esc(this.fill(m.date))}</small></li>`).join("")}</ul>
            <div class="mail-read"><p class="dim">Select a message.</p></div></div>`);
        },
        files: () => {
          const f = files();
          open("Files — C:\\OFFICE", `<div class="files">${Object.keys(f).map(p => `<button class="file" data-file="${esc(p)}">${p.endsWith("/") ? "🗀" : "🗎"} ${esc(p)}</button>`).join("")}</div><div class="file-view"></div>`);
        },
        bin: () => {
          st.bin = true; note(); award("f3");
          open("Recycle Bin", `<div class="files">${spec.bin.map((b, i) => `<button class="file" data-bin="${i}">🗎 ${esc(b.name)}</button>`).join("")}</div>
            <div class="file-view"><p class="dim">${spec.bin.length} items deleted by THE OFFICE. Reason: "student no longer engaged".</p></div>
            <div class="row left"><button data-a="restore" ${st.restoredK ? "disabled" : ""}>${st.restoredK ? "Restored" : "Restore all"}</button></div>`);
        },
        board: () => {
          open("Hoshimi Board — /after-class/", `<ul class="board">${spec.board.map((t, i) => `<li data-thread="${i}"><b>${esc(this.fill(t.title))}</b><small>${t.posts.length} replies</small></li>`).join("")}</ul>`);
        },
        settings: () => {
          open("Engagement settings", `<div class="eng">
            ${[["Sweetness", 82], ["Sadness", 46], ["Hope (rationed)", 12], ["Week length", 100]].map(([k, v]) => `<label>${k}<span class="eng-bar"><i style="width:${v}%"></i></span></label>`).join("")}
            <label class="eng-tog">Extend the week <b class="${st.changed ? "off" : "on"}">${st.changed ? "OFF" : "ON"}</b></label>
            <label class="eng-tog">Allow ending <b class="${st.changed ? "on" : "off"}">${st.changed ? "ON" : "OFF"}</b></label>
            <div class="row left"><button data-a="toggle">${st.changed ? "Changes saved" : "Change…"}</button></div>
            <p class="dim">${st.changed ? "Allow ending: ON. Somewhere, a bell nobody has rung in a long time is being dusted off." : "Changing these requires an administrator password."}</p></div>`);
        },
        term: () => {
          open("Terminal", `<div class="term"><div class="term-out"></div><div class="term-in"><span class="term-ps">office@OFFICE-PC:~$</span><input spellcheck="false" autocomplete="off"></div></div>`);
          termOut(spec.motd || "OFFICE-PC terminal. type 'help'.");
          termFocus();
        }
      };

      /* --- terminal --- */
      let pending = null; // a command waiting on a password
      const termOut = (s, cls = "") => {
        const out = $(".term-out", body);
        if (!out) return;
        const p = document.createElement("pre");
        p.className = cls;
        p.textContent = this.fill(s);
        out.appendChild(p);
        out.scrollTop = out.scrollHeight;
      };
      const termFocus = () => setTimeout(() => { const i = $(".term-in input", body); if (i) i.focus(); }, 30);
      const tryPassword = pw => {
        const ok = (spec.password || []).includes(pw.trim().toLowerCase().replace(/[^a-z ]/g, ""));
        if (ok) { st.admin = true; this.audio.sfx("sparkle"); return true; }
        st.fails++;
        this.audio.sfx("error");
        const h = (spec.hints || []).filter(([n]) => n === st.fails).map(([, who, t]) => `${g.cast[who].name.toLowerCase()}: ${t}`);
        if (h.length) setTimeout(() => { termOut(h[0], "hint"); taskMsg(h[0]); }, 400);
        return false;
      };
      const doChange = (how) => {
        if (st.changed) return "extend_week is already false.";
        st.changed = true;
        st.how = how;
        award("f5");
        note();
        this.audio.sfx("chime_down");
        taskMsg("somewhere in the building, a speaker clicks on, and then off again.");
        if (g.meta.native) g.meta.native.writeFile("retention.cfg", cfg()).catch(() => {});
        return "extend_week = false\nallow_ending = true\n\n(the lights flicker. every speaker in the school takes a breath and doesn't let it out.)";
      };
      const restore = () => {
        if (st.restoredK) return "nothing to restore.";
        st.restoredK = true;
        persist.set("restoredK", true);
        this.audio.sfx("pencil");
        taskMsg("k_diary restored. something in the classroom just pulled out a chair.");
        return `restored ${spec.bin.length} files to /students/k/.`;
      };
      const run = (line, admin = st.admin) => {
        const [cmd, ...args] = line.trim().split(/\s+/);
        const arg = args.join(" ");
        const c = (cmd || "").toLowerCase();
        const f = files();
        if (!c) return "";
        if (c === "help") return "commands: help, ls, cat <file>, open <app>, whoami, date, sudo <command>, set <key> <value>, restore <name>, rm <name>, clear, exit";
        if (c === "ls") {
          const dir = arg.replace(/\/?$/, "/");
          const names = Object.keys(f).filter(p => arg ? p.startsWith(dir) : !p.slice(0, -1).includes("/"));
          return names.length ? names.join("\n") : `ls: ${arg}: no such directory`;
        }
        if (c === "cat" || c === "type" || c === "less" || c === "more") {
          const key = Object.keys(f).find(p => p === arg || p.split("/").pop() === arg);
          if (!arg) return "cat: which file?";
          if (!key) return `cat: ${arg}: no such file`;
          if (key.endsWith("/")) return `cat: ${arg}: is a directory`;
          return f[key];
        }
        if (c === "open" || c === "start") { if (apps[arg]) { setTimeout(() => apps[arg](), 300); return `opening ${arg}…`; } return `open: no app called '${arg}'. try mail, files, bin, board, settings.`; }
        if (c === "clear" || c === "cls") { $(".term-out", body).innerHTML = ""; return ""; }
        if (c === "exit" || c === "logout" || c === "logoff") return st.mail && st.bin && st.changed ? (setTimeout(finish, 600), "logging off…") : "not yet. check sayo's note.";
        if (c === "sudo") {
          if (!arg) return "usage: sudo <command>";
          if (admin) return run(arg, true);
          pending = arg;
          return "[sudo] password for office:";
        }
        if (c === "set") {
          const [k, v] = args;
          if (!k) return "usage: set <key> <value>";
          if (!admin) return "set: permission denied. (try sudo.)";
          if (k === "extend_week" && /^(false|0|off|no)$/i.test(v || "")) return doChange("terminal");
          if (k === "allow_ending" && /^(true|1|on|yes)$/i.test(v || "")) return doChange("terminal");
          if (k === "smile_hold") return "smile_hold is locked by another process: the title screen.";
          if (k === "extend_week" || k === "allow_ending") return `set: ${k} can only be turned the other way. that's the point.`;
          return `set: ${k}: no such setting`;
        }
        if (c === "restore") return /^k\b|k_|diary|all/i.test(arg) ? restore() : `restore: nothing called '${arg}' in the bin.`;
        if (c === "rm" || c === "del") return /office/i.test(arg) ? "rm: cannot remove 'office': it's still talking." : `rm: ${arg || "what"}: the girls asked you not to delete anything.`;
        const extra = spec.extra && (spec.extra[c] || spec.extra[line.trim().toLowerCase()]);
        if (extra) return typeof extra === "function" ? extra(st) : extra;
        return `${cmd}: command not found`;
      };

      const finish = () => {
        clearInterval(clockTimer);
        clearInterval(poll);
        this._close(el);
        resolve({ restoredK: st.restoredK, outside: st.outside, admin: st.admin, how: st.how, fails: st.fails });
      };

      // In the .exe, the real file sits in the game folder. Change it there and it changes here.
      let poll = 0;
      if (g.meta.native) {
        g.meta.native.writeFile("retention.cfg", cfg()).catch(() => {});
        poll = setInterval(async () => {
          if (st.changed) return;
          const t = await g.meta.native.readFile("retention.cfg").catch(() => null);
          if (t && /extend_week\s*=\s*(false|0|off|no)\b/i.test(t)) {
            st.outside = true;
            doChange("outside");
            taskMsg("you changed it from outside. it couldn't see you do it.");
          }
        }, 2000);
      }

      el.addEventListener("keydown", e => {
        const input = e.target.closest(".term-in input");
        if (!input || e.key !== "Enter") return;
        const line = input.value;
        input.value = "";
        if (pending) {
          termOut("[sudo] ********");
          const cmd = pending;
          pending = null;
          input.type = "text";
          if (tryPassword(line)) termOut(run(cmd, true));
          else termOut("sudo: incorrect password.", "bad");
          return;
        }
        termOut("$ " + line, "cmd");
        const out = run(line);
        if (out) termOut(out, /denied|not found|cannot|incorrect/.test(out) ? "bad" : "");
        if (pending) input.type = "password";
      });

      el.addEventListener("click", e => {
        const app = e.target.closest("[data-app]");
        if (app) return apps[app.dataset.app]();
        const a = e.target.closest("[data-a]");
        const act = a && a.dataset.a;
        if (act === "x") { win.classList.add("hidden"); return; }
        if (act === "logoff") return finish();
        if (act === "restore") { taskMsg(restore()); return apps.bin(); }
        if (act === "toggle") {
          if (st.changed) return;
          // The settings app asks for the same password the terminal does.
          const box = document.createElement("div");
          box.className = "pw-box";
          box.innerHTML = `<p>Administrator password:</p><input type="password" spellcheck="false"><div class="row"><button data-a="pw-ok">OK</button><button data-a="pw-no">Cancel</button></div>`;
          body.appendChild(box);
          setTimeout(() => $("input", box).focus(), 30);
          $("input", box).addEventListener("keydown", ev => { if (ev.key === "Enter") $('[data-a="pw-ok"]', box).click(); });
          return;
        }
        if (act === "pw-no") { e.target.closest(".pw-box").remove(); return; }
        if (act === "pw-ok") {
          const box = e.target.closest(".pw-box");
          if (tryPassword($("input", box).value)) { doChange("settings"); apps.settings(); }
          else { $("p", box).textContent = "Incorrect password. (Hint from the Office: 'You will never guess it. Nobody ever says it to me.')"; $("input", box).value = ""; }
          return;
        }
        const m = e.target.closest("[data-mail]");
        if (m) {
          const i = Number(m.dataset.mail), mail = spec.mail[i];
          st.openMail.add(i);
          m.classList.remove("unread");
          if (mail.clue) award(mail.clue);
          if (mail.goal) { st.mail = true; note(); }
          $(".mail-read", body).innerHTML = `<h4>${esc(this.fill(mail.subject))}</h4><p class="dim">from ${esc(this.fill(mail.from))} · ${esc(this.fill(mail.date))}</p>${text(mail.body)}`;
          return;
        }
        const fl = e.target.closest("[data-file]");
        if (fl) {
          const p = fl.dataset.file, f = files();
          $(".file-view", body).innerHTML = p.endsWith("/") ? text(Object.keys(f).filter(k => k.startsWith(p) && k !== p).join("\n") || "(empty)") : text(f[p]);
          return;
        }
        const b = e.target.closest("[data-bin]");
        if (b) { $(".file-view", body).innerHTML = text(spec.bin[Number(b.dataset.bin)].body); return; }
        const t = e.target.closest("[data-thread]");
        if (t) {
          const th = spec.board[Number(t.dataset.thread)];
          if (th.clue) award(th.clue);
          open("Hoshimi Board — " + this.fill(th.title), `<div class="thread"><h4>${esc(this.fill(th.title))}</h4>${th.posts.map(p => `<div class="post"><b>${esc(this.fill(p.by))}</b><small>${esc(this.fill(p.when))}</small><p>${esc(this.fill(p.text))}</p></div>`).join("")}</div><div class="row left"><button data-app="board">Back</button></div>`);
        }
      });
    });
  }

  /**
   * Just the terminal, full screen, for the end. Resolves "rm" if the player deletes the Office, "exit" otherwise.
   */
  terminal({ motd = "", prompt = "you@hoshimi:~$" } = {}) {
    return new Promise(resolve => {
      const el = this._overlay("mg-term", `<div class="term full"><div class="term-out"></div><div class="term-in"><span class="term-ps"></span><input spellcheck="false" autocomplete="off"></div></div>`);
      $(".term-ps", el).textContent = prompt;
      const out = (s, cls = "") => { const p = document.createElement("pre"); p.className = cls; p.textContent = this.fill(s); $(".term-out", el).appendChild(p); $(".term-out", el).scrollTop = 1e6; };
      out(motd);
      const input = $("input", el);
      setTimeout(() => input.focus(), 50);
      el.addEventListener("click", () => input.focus());
      input.addEventListener("keydown", e => {
        if (e.key !== "Enter") return;
        const line = input.value.trim();
        input.value = "";
        out("$ " + line, "cmd");
        if (/^(sudo\s+)?(rm|del)\b.*office/i.test(line)) { out("removing office… done.", "bad"); setTimeout(() => { this._close(el); resolve("rm"); }, 1400); return; }
        if (/^(exit|logout|quit|close)$/i.test(line)) { this._close(el); resolve("exit"); return; }
        if (/^help$/i.test(line)) return out("the only commands left are 'rm office' and 'exit'.");
        out(line ? `${line.split(" ")[0]}: you don't need that anymore.` : "");
      });
    });
  }
}
