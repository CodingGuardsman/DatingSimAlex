/**
 * persist.js — Save slots and cross-playthrough memory.
 * Everything lives under the "ac2_" prefix so the game never touches other data on the origin.
 */
const PREFIX = "ac2_";
const PERSIST_KEY = PREFIX + "persistent";
export const SLOT_COUNT = 6;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
}

const DEFAULTS = {
  name: "",
  runs: 0,            // finished playthroughs (any ending)
  endings: [],        // ending ids seen
  firstPlayed: 0,
  lastPlayed: 0,
  totalMs: 0,         // real time spent with the game, across sessions
  clicks: 0,
  tabouts: 0,
  readK: false,       // opened the K save slot
  sayoLetter: false,
  summer: false,      // true ending reached: the girls are on vacation
  titleMs: 0,         // time the title screen has been left open: they stand there, posed, the whole time
  quitHovers: 0,      // times the cursor rested on Quit
  caught: 0,          // times the player moved and caught them out of pose on the title screen
  behind: false,      // went through Sayo's door behind the menu
  mem: {},            // the scrapbook: memories kept, by id. Survives forgetAll().
  lastEnding: "",     // the most recent ending, in the order they were seen
  item13: "",         // what the player wrote at the bottom of Hina's summer list
  survey: "",         // the comment the player left on the Office's five-star survey
  door: "",           // the door the player drew for Sayo, as an SVG path in a 120x170 box
  loads: 0,           // times a save was loaded. Taking something back is still something they remember.
  forgets: 0,         // times "Forget them" was used. Survives forgetAll(): Sayo doesn't forget.
  legacy: false,      // played a 1.x build before this one
  version: "",
  act3: false,        // the second term has started
  restoredK: false,   // K's files came back out of the Office's recycle bin
  graduated: false,   // the final ending: the title becomes a graduation photo
  settings: { textSpeed: 32, music: 0.55, sfx: 0.7, voice: true }
};

export const VERSION = "2.0.0";

export const persist = {
  data: { ...DEFAULTS, ...read(PERSIST_KEY, {}) },

  save() { write(PERSIST_KEY, this.data); },

  /** Note which build this is. Anyone who played before 2.0 gets remembered as having been here before the update. */
  stampVersion() {
    const d = this.data;
    if (!d.version && (d.runs > 0 || d.firstPlayed)) d.legacy = true;
    d.version = VERSION;
    this.save();
  },

  set(key, value) { this.data[key] = value; this.save(); },

  addEnding(id) {
    if (!this.data.endings.includes(id)) this.data.endings.push(id);
    this.save();
  },

  /** Wipe the girls' memory of you. Used by the "Detention" ending's reset and the settings screen. */
  forgetAll() {
    Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
    // The scrapbook is the one thing that survives. They forget; it doesn't. (Neither does Sayo.)
    const d = this.data;
    this.data = { ...DEFAULTS, settings: d.settings, mem: d.mem || {}, door: d.door, item13: d.item13,
      forgets: (d.forgets || 0) + 1, legacy: d.legacy, version: d.version, warned: d.warned };
    this.save();
  }
};

/** The slot that was here before you. It always exists. */
export const K_SLOT = {
  id: "K",
  label: "K",
  day: "Day 7",
  playtime: "412:13:09",
  note: "i'm sorry",
  isK: true
};

export function saveSlot(n, state) {
  write(PREFIX + "slot_" + n, { ...state, savedAt: Date.now() });
}

export function loadSlot(n) {
  return read(PREFIX + "slot_" + n, null);
}

export function listSlots() {
  const out = [];
  for (let i = 1; i <= SLOT_COUNT; i++) out.push({ n: i, data: loadSlot(i) });
  return out;
}

/** Like formatDuration, but says seconds when it's under a minute. */
export function formatShort(ms) {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s} second${s === 1 ? "" : "s"}` : formatDuration(ms);
}

export function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h} hour${h === 1 ? "" : "s"} and ${m} minute${m === 1 ? "" : "s"}` : `${m} minute${m === 1 ? "" : "s"}`;
}
