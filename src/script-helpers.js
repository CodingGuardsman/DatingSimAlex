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

/** Spend a slot with someone: plays their next scene for that slot ("" = afternoon, "m" = morning). */
export const visit = (who, slot = "", max = 4) => ({
  t: "js",
  run: g => {
    const key = slot + who;
    const n = (g.v.seen[key] || 0) + 1;
    g.v.seen[key] = n;
    if (!slot) g.v.picked.push(who);
    g.frames.push({ id: `${who}${slot}${Math.min(n, max)}`, i: 0 });
  }
});
