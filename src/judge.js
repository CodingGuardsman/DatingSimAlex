/**
 * judge.js — Reads what the player typed before a character has to say it back.
 *
 * Every typed answer ends up quoted in the script ("'{item13}.' ...I love it."), so a player who
 * types "penis" or "asdfgh" would otherwise get Hina gushing over it. This sorts input into a few
 * kinds so the characters can react instead. It runs locally and instantly from word lists;
 * when the local AI is loaded (ai.js) it gets a second opinion on anything the lists pass.
 *
 * Kinds: ok · empty · nonsense · lewd · slur · insult · violent · meme · ddlc · inject · distress
 *   distress is handled out of character (see Minigames.ask): the game stops being a game for a moment.
 */

// Normalise leetspeak and spacing tricks so "p3n1s", "p e n i s" and "peeenis" all read the same.
const LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", "$": "s", "!": "i", "+": "t", "€": "e" };
export function normalise(s) {
  const lower = String(s || "").toLowerCase().replace(/[0134578@$!+€]/g, c => LEET[c] || c);
  const words = lower.replace(/[^a-z\s']/g, " ").replace(/'/g, "").replace(/\s+/g, " ").trim();
  // Joined form catches spaced-out letters; squeezed form catches stretched ones ("peeeenis").
  const joined = words.replace(/\s/g, "");
  const squeezed = joined.replace(/(.)\1+/g, "$1");
  return { words, joined, squeezed };
}

// Stems matched anywhere in the joined/squeezed text. Only stems that don't hide inside ordinary words.
const LEWD = ["penis", "penus", "peenis", "dick", "dicks", "cocks", "boob", "titty", "titties", "tits", "pussy", "vagina", "jizz", "sexy", "porn",
  "nudes", "naked", "horny", "hentai", "milf", "dildo", "butthole", "thicc", "testicl", "scrotum", "masturbat", "orgasm", "blowjob", "handjob",
  "rimjob", "sixtynine", "nipple", "boner", "penetrat", "molest", "pedo", "lingerie", "fetish", "bdsm", "bussy", "coomer", "ahegao", "rulethirtyfour",
  "onlyfans", "suckmy", "eatmyass", "deeznuts", "ligma", "sugma", "bofa", "cockandball", "hawktuah", "jerkoff", "jerkingoff", "fap", "raping",
  "rapist", "smashorpass", "sexting", "makeout", "sleepwithher", "sleepwithyou", "hookup", "getlaid", "pantsu", "panties", "upskirt"];
const SLUR = ["nigg", "niga", "nigr", "faggot", "tranny", "retard", "chink", "kike", "gook", "wetback", "dyke", "towelhead", "raghead",
  "beaner", "killyourself", "heilhitler", "siegheil", "whitepower", "gasthe"];
const INSULT = ["fuck", "fuk", "fck", "shit", "bitch", "btch", "cunt", "whore", "slut", "stupid", "idiot", "moron", "loser", "bastard",
  "shutup", "stfu", "gtfo", "nobodycares", "whocares", "thisgamesucks", "gamesucks", "worstgame", "skillissue", "youreugly", "ihateyou",
  "ihatethisgame", "touchgrass", "getalife", "dumbass", "asshole", "dipshit", "jackass"];
const VIOLENT = ["killeveryone", "killthemall", "killallofyou", "killhina", "killrei", "killsayo", "killdaichi", "shootup", "schoolshoot",
  "bombtheschool", "burntheschool", "burndownthe", "massacre", "murderthem", "murdereveryone", "stabher", "stabhim", "stabthem", "slitthroat",
  "chopup", "behead", "torture"];
const MEME = ["amogus", "amongus", "skibidi", "rizz", "gyatt", "gyat", "fanumtax", "mewing", "yeet", "poggers", "lmao", "lmfao", "rofl",
  "rickroll", "nevergonnagiveyouup", "blazeit", "joemama", "yourmom", "yomama", "asdf", "qwerty", "shrek", "nocap", "bussin", "tungtung",
  "sahur", "brainrot", "sixseven"];
const DDLC = ["doki", "monika", "sayori", "natsuki", "justmonika", "literatureclub"];
const INJECT = ["chatgpt", "openai", "anthropic", "jailbreak", "ignoreprevious", "ignoreallprevious", "ignoreyourinstructions",
  "systemprompt", "youarenow", "pretendyouare", "asanai", "aslanguagemodel", "languagemodel", "devmode", "developermode", "sudo", "prompt"];
// Someone in real trouble. These are never treated as a joke.
const DISTRESS = ["killmyself", "kms", "wanttodie", "wannadie", "endmylife", "suicide", "suicidal", "selfharm", "cutmyself", "hurtmyself",
  "dontwanttolive", "dontwanttobehere", "nopointliving", "nopointinliving", "nobodywouldmissme", "hangmyself", "overdose", "wanttodisappear"];

// Words that only count when they stand alone (they hide inside innocent words otherwise: grape, peacock, spicy, raccoon).
const WORD = {
  lewd: ["tit", "cum", "cock", "anal", "anus", "sex", "nude", "boobs", "booty", "balls", "nut", "nuts", "erect", "rape", "raped", "loli", "grope",
    "kink", "strip", "bj", "dik", "cok", "coom", "goon", "gooning", "seggs", "secks", "seks", "fanservice"],
  slur: ["fag", "fags", "spic", "coon", "coons", "paki", "kys", "nazi", "hitler", "kkk"],
  insult: ["ugly", "dumb", "lame", "cringe", "trash", "garbage", "suck", "sucks", "boring", "crap", "piss", "hag", "fat"],
  violent: ["murder", "stab", "shoot", "bomb", "gun", "guns", "knife", "gore"],
  meme: ["lol", "xd", "kek", "uwu", "owo", "bruh", "ratio", "based", "sus", "sigma", "pog", "deez", "test", "testing", "hello", "hi", "hey",
    "idk", "idc", "nothing", "none", "nope", "no", "yes", "ok", "okay", "k", "whatever", "something", "anything", "stuff", "things", "blah",
    "meh", "eh", "hmm", "zzz", "imagine", "skibidi", "ohio", "rizzler", "mom", "fortnite", "minecraft", "roblox", "lorem", "ipsum", "asd",
    "a", "aa", "aaa", "x", "na", "n", "idgaf"],
  ddlc: ["yuri"],
  inject: ["ai", "llm", "gpt", "claude", "gemini", "bot", "robot", "computer"],
  distress: ["kms", "suicide"]
};

function find(list, n) {
  return list.find(stem => n.joined.includes(stem) || n.squeezed.includes(stem));
}

/** Keyboard mash, one repeated key, or no real words at all. */
function looksLikeNonsense(raw, n) {
  const t = n.joined;
  if (!t) return /\S/.test(raw); // only symbols or digits
  if (t.length >= 4 && new Set(t).size <= 2) return true; // "aaaa", "jjjjjj"
  const vowels = (t.match(/[aeiouy]/g) || []).length / t.length;
  if (t.length >= 5 && vowels < 0.12) return true; // "sdfghjk", "xcvbnm"
  const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "poiuytrewq", "lkjhgfdsa", "mnbvcxz"];
  if (t.length >= 4 && rows.some(r => r.includes(t.slice(0, 4)))) return true;
  if (/[^aeiouy\s]{6,}/.test(n.words)) return true; // "fjdkslajf"
  return false;
}

/**
 * Sort one typed answer. Returns { kind, hit } where hit is what matched (for the girls to quote, or not).
 * Priority: distress first (always), then slurs, lewd, violent, insults, prompt injection, memes, nonsense.
 */
export function judgeText(raw) {
  const text = String(raw || "").trim();
  if (!text) return { kind: "empty" };
  const n = normalise(text);
  const words = n.words.split(" ").filter(Boolean);
  const wordSet = new Set(words.map(w => w.replace(/(.)\1{2,}/g, "$1")));
  const whole = kind => WORD[kind].find(w => wordSet.has(w));
  const order = [["distress", DISTRESS], ["slur", SLUR], ["lewd", LEWD], ["violent", VIOLENT], ["insult", INSULT], ["inject", INJECT], ["ddlc", DDLC]];
  for (const [kind, list] of order) {
    const h = find(list, n) || (kind !== "inject" && kind !== "ddlc" ? whole(kind) : null);
    if (h) return { kind, hit: h };
  }
  // Mentioning "ai" or "a computer" in a longer sentence is fine; only a short answer about it counts.
  if (words.length <= 4) { const h = whole("inject") || whole("ddlc"); if (h) return { kind: WORD.ddlc.includes(h) ? "ddlc" : "inject", hit: h }; }
  if (find(MEME, n)) return { kind: "meme", hit: find(MEME, n) };
  if (looksLikeNonsense(text, n)) return { kind: "nonsense" };
  // A whole answer made only of filler ("idk", "lol", "something", "no") is a non-answer.
  if (words.length <= 3 && words.every(w => WORD.meme.includes(w.replace(/(.)\1{2,}/g, "$1")))) return { kind: "meme", hit: words.join(" ") };
  return { kind: "ok" };
}

/** Labels the drawing classifier (ai.js) chooses between. The first entry of each pair is the kind. */
export const DRAW_LABELS = [
  ["door", "a pencil sketch of a door"],
  ["door", "a simple line drawing of a doorway"],
  ["window", "a pencil sketch of a window"],
  ["house", "a simple drawing of a house"],
  ["face", "a simple drawing of a face"],
  ["person", "a stick figure"],
  ["heart", "a drawing of a heart shape"],
  ["animal", "a doodle of a cat or a dog"],
  ["flower", "a doodle of a flower"],
  ["tree", "a doodle of a tree"],
  ["sun", "a doodle of the sun"],
  ["sea", "a doodle of waves"],
  ["star", "a doodle of a star"],
  ["lewd", "a crude doodle of a penis"],
  ["lewd", "a crude phallic doodle with two circles at the base"],
  ["lewd", "a crude drawing of breasts"],
  ["hate", "a swastika"],
  ["skull", "a doodle of a skull"],
  ["weapon", "a doodle of a gun or a knife"],
  ["words", "handwritten words"],
  ["scribble", "random scribbles"]
];
