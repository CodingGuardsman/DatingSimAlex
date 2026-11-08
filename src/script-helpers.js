/**
 * script-helpers.js — The little functions every story file uses to write commands.
 * See the top of story.js for the line format.
 */
export const bg = (id, fade = true) => ({ t: "bg", id, fade });
export const music = id => ({ t: "music", id });
export const sfx = id => ({ t: "sfx", id });
export const show = (who, expr = "neutral", pos) => ({ t: "show", who, expr, pos });
export const hide = who => ({ t: "hide", who });
export const clear = { t: "clear" };
export const wait = ms => ({ t: "wait", ms });
export const jump = to => ({ t: "jump", to });
export const set = (k, v) => ({ t: "set", k, v });
export const love = (k, n = 1) => ({ t: "add", k, n });
export const pset = (k, v) => ({ t: "pset", k, v });
export const mem = id => ({ t: "mem", id });
/** Note a clue for the "What we know" page that has no scrapbook memory of its own. */
export const know = id => ({ t: "js", run: g => g._know(id) });
export const fx = (fn, ...args) => ({ t: "fx", fn, args });
export const pa = (text, broken = false) => ({ t: "js", run: g => g.meta.pa(g._fill(text), { broken, template: text }) });
export const day = (text, sub, wrong = false) => ({ t: "day", text, sub, wrong });
export const menu = (items, opts = {}) => ({ t: "menu", items, ...opts });
export const when = (fn, then, otherwise) => ({ t: "if", when: fn, then, else: otherwise });
export const say = (who, expr, text, opts = {}) => ({ t: "say", who, expr, text, ...opts });
export const watch = (name, on) => ({ t: "js", run: g => g.meta.setWatch(name, on) });
export const log = (who, text) => ({ t: "js", run: g => g.meta.console(who, g._fill(text)) });
export const noskip = on => ({ t: "noskip", on });
export const end = (id, name, kind) => ({ t: "end", id, name, kind });
export const phone = (title, msgs, note = "") => ({ t: "js", run: g => g.meta.phone({ title, msgs: typeof msgs === "function" ? msgs(g) : msgs, note }) });
export const credits = (lines, opts) => ({ t: "js", run: g => g.meta.credits(lines.map(l => g._fill(l)), opts) });
export const js = run => ({ t: "js", run });
/** Run one of the minigames in minigames.js; its result lands in v[into] (default v.result). */
export const mini = (name, opts = {}, into = "result") => ({ t: "js", run: async g => { g.v[into] = await g.mini[name](opts); } });
/** The Office narrates in Act 3: it tells you what you do, in the second person. */
export const office = (text, opts = {}) => ({ t: "say", who: "office", text, ...opts });
export const achieve = text => ({ t: "fx", fn: "achievement", args: [text] });
export const title = { t: "title" };
export const call = to => ({ t: "call", to });

/**
 * Spend a slot with someone: plays their next scene for that slot ("" = afternoon, "m" = morning).
 * order.sweet / order.until: while v.day <= until, pick from the sweet scenes first (so the early week stays happy).
 * Every scene still plays once before any repeats.
 */
export const visit = (who, slot = "", max = 4, order = null) => ({
  t: "js",
  run: g => {
    const key = slot + who;
    const n = (g.v.seen[key] || 0) + 1;
    g.v.seen[key] = n;
    if (!slot) g.v.picked.push(who);
    let pick = Math.min(n, max);
    if (order) {
      g.v.scenesDone = g.v.scenesDone || {};
      // Older saves have no list: assume scenes 1..n-1 already played, in order.
      const done = g.v.scenesDone[key] = g.v.scenesDone[key] || Array.from({ length: n - 1 }, (_, i) => i + 1);
      const all = Array.from({ length: max }, (_, i) => i + 1);
      const early = (g.v.day || 1) <= order.until;
      pick = (early && order.sweet.find(i => !done.includes(i))) || all.find(i => !done.includes(i)) || max;
      done.push(pick);
    }
    g.frames.push({ id: `${who}${slot}${pick}`, i: 0 });
  }
});

/* ---------- 2.1 ---------- */

/** A full-screen illustration from assets/cg/. cg(null) puts the stage back. */
export const cg = id => ({ t: "cg", id });
/** A jumpscare. Only ever placed by hand, at one exact moment. */
export const scare = (id, ms = 700) => ({ t: "fx", fn: "scare", args: [id, ms] });
/** An image for a few frames, then gone. */
export const subliminal = (id, ms = 90) => ({ t: "fx", fn: "subliminal", args: [id, ms] });
/** Red running down from the top of the screen, until blood(false). */
export const blood = (on = true) => ({ t: "fx", fn: "blood", args: [on] });

/**
 * A line the local language model writes live (see ai.js), from what's happened so far.
 * `task` is a function (g) => string describing what the character should say right now.
 * `fallback` is the written line used when the AI is off, still loading, slow, or says something it shouldn't.
 * opts.live shows the Office's "generating…" indicator (only the Office admits it's being written).
 */
export const aiSay = (who, expr, task, fallback, opts = {}) => ({ t: "aisay", who, expr, task, fallback, ...opts });
