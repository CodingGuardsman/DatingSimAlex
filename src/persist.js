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
  settings: { textSpeed: 32, music: 0.55, sfx: 0.7, voice: true }
};

export const persist = {
  data: { ...DEFAULTS, ...read(PERSIST_KEY, {}) },

  save() { write(PERSIST_KEY, this.data); },

  set(key, value) { this.data[key] = value; this.save(); },

  addEnding(id) {
    if (!this.data.endings.includes(id)) this.data.endings.push(id);
    this.save();
  },

  /** Wipe the girls' memory of you. Used by the "Detention" ending's reset and the settings screen. */
  forgetAll() {
    Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
    // The scrapbook is the one thing that survives. They forget; it doesn't.
    this.data = { ...DEFAULTS, settings: this.data.settings, mem: this.data.mem || {} };
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
