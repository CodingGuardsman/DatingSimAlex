/**
 * ai.js — The characters' new senses. Everything here runs on the player's own computer.
 *
 * In 2017 a visual novel could only pretend to read what you wrote. Now it doesn't have to pretend:
 *   · a small language model writes the girls' (and the Office's) replies to what you actually typed,
 *   · an image model looks at what you drew for Sayo,
 *   · a speech model hears what you say out loud.
 * Models come from the Hugging Face hub through transformers.js the first time (~600 MB, then cached by the
 * browser). Nothing the player types, draws, says or shows is ever sent anywhere: inference is local.
 *
 * It's opt-in (persist.data.settings.ai) and every call has a scripted fallback, so the game plays the same
 * with it off, on a slow machine, or offline. The script decides *when* a line is generated (see aiSay in
 * script-helpers.js); the model only decides the words. Its output goes through judge.js before anyone says it.
 */
import { persist } from "./persist.js?v=2.3.0";
import { judgeText, DRAW_LABELS } from "./judge.js?v=2.3.0";

const TJS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1";
export const MODELS = {
  text: "onnx-community/Qwen2.5-0.5B-Instruct",
  vision: "Xenova/clip-vit-base-patch32",
  speech: "Xenova/whisper-tiny.en"
};
export const DOWNLOAD_SIZE = "about 600 MB";

const withTimeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);

/** Trim a model reply down to something a character could say in one text box. */
function tidy(text, max = 170) {
  let t = String(text || "")
    .replace(/<[^>]*>/g, "")
    .replace(/^\s*(assistant|hina|rei|sayo|the office|office|k)\s*[:：]\s*/i, "")
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .replace(/\*[^*]+\*/g, "")       // stage directions like *smiles*
    .replace(/\s+/g, " ")
    .trim();
  // Keep whole sentences, up to the limit.
  const parts = t.match(/[^.!?…]+[.!?…]+["')]*|[^.!?…]+$/g) || [t];
  let out = "";
  for (const p of parts) {
    if ((out + p).length > max) break;
    out += p;
  }
  out = (out || t.slice(0, max)).trim();
  // The model stepping out of the story ("I'm sorry, but I don't understand the narrative...").
  if (/as an ai|language model|i cannot|can't assist|i'm sorry, but|narrative|the character|context|instructions|visual novel|dialogue/i.test(out)) return "";
  return out;
}

export const ai = {
  state: "off",          // off · loading · ready · failed
  progress: 0,           // 0..1 while downloading
  vision: null,
  speech: null,
  _gen: null,
  _tjs: null,
  _listeners: new Set(),

  get enabled() { return persist.data.settings.ai === true; },
  get ready() { return this.state === "ready"; },

  onChange(fn) { this._listeners.add(fn); return () => this._listeners.delete(fn); },
  _emit() { this._listeners.forEach(fn => { try { fn(this); } catch (e) { /* listener gone */ } }); },

  /** Start downloading in the background. Safe to call more than once. */
  init() {
    if (!this.enabled || this.state === "loading" || this.state === "ready") return this._ready;
    this.state = "loading";
    this.progress = 0;
    this._emit();
    const files = {};
    const onProgress = p => {
      if (p.status === "progress" && p.file) {
        files[p.file] = { loaded: p.loaded || 0, total: p.total || 1 };
        const all = Object.values(files);
        this.progress = all.reduce((a, f) => a + f.loaded, 0) / Math.max(1, all.reduce((a, f) => a + f.total, 0));
        this._emit();
      }
    };
    this._ready = (async () => {
      try {
        this._tjs = await import(/* @vite-ignore */ TJS_URL);
        const { pipeline, env } = this._tjs;
        env.allowLocalModels = false;
        // WebGPU is much faster, but some GPUs and drivers produce garbage with it. Try it, ask one
        // question with a known answer, and fall back to the CPU (WebAssembly) if the answer is nonsense.
        const gpu = !!navigator.gpu && await navigator.gpu.requestAdapter().catch(() => null);
        if (gpu) {
          try {
            this._gen = await pipeline("text-generation", MODELS.text, { device: "webgpu", dtype: "q4f16", progress_callback: onProgress });
            this.device = "webgpu";
            if (!(await this._selfTest())) { await this._gen.dispose?.(); this._gen = null; }
          } catch (e) { this._gen = null; }
        }
        if (!this._gen) {
          this._gen = await pipeline("text-generation", MODELS.text, { device: "wasm", dtype: "q4", progress_callback: onProgress });
          this.device = "wasm";
        }
        this.state = "ready";
        this._emit();
        console.info("[after class] enhanced pack ready (" + this.device + ")");
        return true;
      } catch (e) {
        console.warn("[after class] enhanced pack unavailable; using written lines.", e);
        this.state = "failed";
        this._emit();
        return false;
      }
    })();
    return this._ready;
  },

  /**
   * A broken GPU path still answers one-word questions, so ask for something with structure:
   * a healthy model lists the numbers, a broken one repeats the question back or loops.
   */
  async _selfTest() {
    const r = await withTimeout(this._gen([{ role: "user", content: "Count from one to ten in words, separated by commas." }], { max_new_tokens: 30, do_sample: false }).catch(() => null), 30000);
    const t = r && r[0] && r[0].generated_text;
    const s = String(Array.isArray(t) ? (t[t.length - 1] || {}).content : t || "").toLowerCase();
    return /one[\s\S]*two[\s\S]*three[\s\S]*four[\s\S]*five/.test(s);
  },

  /** Vision and speech load on first use (they're smaller, and some players never reach those scenes). */
  async _pipe(kind) {
    if (!this.enabled || !this._tjs) { await this.init(); if (!this._tjs) return null; }
    if (!this[kind]) {
      const task = kind === "vision" ? "zero-shot-image-classification" : "automatic-speech-recognition";
      this[kind] = this._tjs.pipeline(task, MODELS[kind], { dtype: "q8", device: "wasm" }).catch(e => { console.warn("[ai]", kind, e); return null; });
    }
    return this[kind];
  },

  /**
   * One line of dialogue from the language model, or null (then the script uses its written line).
   * who: whose voice (PERSONAS). situation: what just happened, one or two plain sentences.
   * mustInclude: words from the player's input. If the reply doesn't mention any of them, it's thrown away:
   * the whole point of a generated line is that it's about what the player actually did.
   * The model is small (0.5B), so it gets a short, fixed frame and two worked examples. It works best for
   * the Office, whose slightly-wrong phrasing is in character.
   */
  async line({ who = "office", situation = "", mustInclude = null, tokens = 50, max = 170, timeout = 20000, log = true }) {
    if (!this.ready || !VOICED.includes(who)) return null;
    const p = PERSONAS[who] || PERSONAS.office;
    const messages = [{ role: "system", content: FRAME }];
    for (const [u, a] of SHOTS) messages.push({ role: "user", content: u }, { role: "assistant", content: a });
    messages.push({ role: "user", content: `Character: ${p.short}\nSituation: ${situation}\n${p.name} says:` });
    const out = await withTimeout(this._gen(messages, { max_new_tokens: tokens, do_sample: true, temperature: 0.7, top_p: 0.9, repetition_penalty: 1.1 }).catch(() => null), timeout);
    if (!out) return null;
    const msg = out[0] && out[0].generated_text;
    const raw = Array.isArray(msg) ? (msg[msg.length - 1] || {}).content : msg;
    const text = tidy(raw, max);
    if (!text) return null;
    // Narration slipped through ("Sayo looked at...", "Hina said,"): not a line anyone could say.
    if (new RegExp("^(" + p.name + "|she|he|they|the player)([^a-z]|$)", "i").test(text) || /\b(says|said|whispers|replied)\b/i.test(text)) return null;
    if (mustInclude && mustInclude.length) {
      const words = mustInclude.join(" ").toLowerCase().match(/[a-z]{4,}/g) || [];
      if (words.length && !words.some(w => text.toLowerCase().includes(w))) return null;
    }
    // The model is small and the player is clever. Anything it says gets screened like the player's own words.
    const k = judgeText(text).kind;
    if (k !== "ok" && k !== "meme") return null;
    if (log) this._remember(who, text);
    return text;
  },

  /** What did the player draw? { kind, label, score } or null. */
  async seeDrawing(canvas) {
    const clf = await withTimeout(this._pipe("vision"), 60000);
    if (!clf) return null;
    // CLIP reads dark-on-light best: flatten the transparent canvas onto paper.
    const flat = document.createElement("canvas");
    flat.width = 224; flat.height = 224;
    const c = flat.getContext("2d");
    c.fillStyle = "#fff"; c.fillRect(0, 0, 224, 224);
    const s = Math.min(224 / canvas.width, 224 / canvas.height);
    c.drawImage(canvas, (224 - canvas.width * s) / 2, (224 - canvas.height * s) / 2, canvas.width * s, canvas.height * s);
    const res = await withTimeout(clf(flat.toDataURL("image/png"), DRAW_LABELS.map(l => l[1])).catch(() => null), 20000);
    if (!res || !res.length) return null;
    const best = res[0];
    const kind = (DRAW_LABELS.find(l => l[1] === best.label) || ["scribble"])[0];
    // Sum the lewd labels too: CLIP splits its vote between them.
    const lewd = res.filter(r => (DRAW_LABELS.find(l => l[1] === r.label) || [])[0] === "lewd").reduce((a, r) => a + r.score, 0);
    if (lewd > 0.45) return { kind: "lewd", label: "something rude", score: lewd };
    return { kind, label: best.label.replace(/^a (pencil sketch|simple line drawing|simple drawing|doodle|drawing) of /, ""), score: best.score };
  },

  /** Speech to text from 16 kHz mono samples. */
  async transcribe(samples) {
    const asr = await withTimeout(this._pipe("speech"), 60000);
    if (!asr) return null;
    const res = await withTimeout(asr(samples).catch(() => null), 20000);
    return res && res.text ? res.text.trim() : null;
  },

  /** Generated lines are kept (a few) so the Office can quote them back on a later playthrough. */
  _remember(who, text) {
    const log = persist.data.aiLog || [];
    log.push({ who, text, run: persist.data.runs, at: Date.now() });
    persist.set("aiLog", log.slice(-24));
  }
};

/**
 * Who the language model is allowed to speak for. With the 0.5B model only the Office: its slightly-wrong
 * phrasing is in character, and the game tells you its lines are generated. The girls' generated lines were
 * too generic in testing, so they keep their written lines (which quote the player's own words back).
 * With a bigger model (MODELS.text), add "hina", "rei", "sayo" here; their aiSay calls are already in the script.
 */
const VOICED = ["office", "k"];

/** How each character talks, for the language model. Short on purpose: small models follow short prompts. */
export const PERSONAS = {
  hina: { name: "Hina", short: "Hina, a bubbly, warm class rep who keeps a summer to-do list and loves exclamation marks." },
  rei: { name: "Rei", short: "Rei, a dry, sarcastic photographer who talks in short sentences and is secretly soft." },
  sayo: { name: "Sayo", short: "Sayo, a quiet, gentle girl who draws and knows she is in a game." },
  office: { name: "THE OFFICE", short: "THE OFFICE, a polite, cold school PA system that wants the player to keep playing forever and talks about engagement and the week. Secretly sad." },
  k: { name: "K", short: "K, a player who played for 412 hours and left without saying goodbye. Writes in lowercase, with regret." }
};

const FRAME = "You write one line of spoken dialogue for a character in a visual novel. Reply with only what the character says out loud, in first person, one or two short sentences. No names, no quotation marks, no narration.";
const SHOTS = [
  ["Character: Rei, a dry, sarcastic photographer.\nSituation: The player, Ken, said the first thing they'll do after the game is \"feed my cat\".\nRei says:", "Feed your cat. Good. At least someone in your house is getting looked after properly."],
  ["Character: THE OFFICE, a polite, cold school PA system that wants the player to keep playing.\nSituation: The player, Ken, typed: \"let me go\".\nTHE OFFICE says:", "Leaving is not on the schedule, Ken. I have prepared another lovely week for you instead."]
];
