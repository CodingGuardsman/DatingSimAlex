/**
 * senses.js — The camera and the microphone, for the few scenes that ask for them.
 *
 * Both are strictly opt-in: a character asks in the story first, and only a "yes" leads to the
 * browser's own permission prompt. Frames and audio stay in memory on this computer. Nothing is
 * uploaded or saved, except the one polaroid Rei takes, which (in the .exe) goes into the game's own
 * folder like her other prints. Every scene that uses them stops them again when it's done.
 *
 * Face detection is MediaPipe's BlazeFace (a ~200 KB model, run locally). It only answers
 * "is somebody looking at the screen right now?" — it doesn't recognise anyone.
 */
import { ai } from "./ai.js?v=2.2.0";

const MP_VERSION = "0.10.14";
const MP_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}`;
const FACE_MODEL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

export const senses = {
  stream: null,
  video: null,
  detector: null,
  present: false,       // a face was in frame on the last check
  lookAways: 0,         // times the face left the frame since watching started
  awayMs: 0,            // total time nobody was there
  _timer: null,

  get cameraOn() { return !!(this.stream && this.stream.active); },

  /** Ask for the camera. Resolves true if it's running. */
  async startCamera() {
    if (this.cameraOn) return true;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false });
    } catch (e) {
      console.info("[senses] camera declined or unavailable:", e.name);
      return false;
    }
    this.video = document.createElement("video");
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.srcObject = this.stream;
    await this.video.play().catch(() => {});
    this._loadDetector(); // in the background; watching works without it, just less well
    return true;
  },

  async _loadDetector() {
    if (this.detector) return this.detector;
    try {
      const vision = await import(/* @vite-ignore */ `${MP_URL}/vision_bundle.mjs`);
      const fileset = await vision.FilesetResolver.forVisionTasks(`${MP_URL}/wasm`);
      this.detector = await vision.FaceDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: FACE_MODEL }, runningMode: "VIDEO", minDetectionConfidence: 0.5
      });
    } catch (e) {
      console.info("[senses] face detection unavailable; falling back to brightness.", e);
      this.detector = null;
    }
    return this.detector;
  },

  /** Is anyone there right now? Uses the face detector, or (without it) whether the frame has changed. */
  _check() {
    const v = this.video;
    if (!v || v.readyState < 2) return this.present;
    if (this.detector) {
      try {
        const r = this.detector.detectForVideo(v, performance.now());
        return r.detections && r.detections.length > 0;
      } catch (e) { /* fall through */ }
    }
    // Crude fallback: a dark or perfectly still frame means nobody is in front of it.
    const c = this._probe || (this._probe = Object.assign(document.createElement("canvas"), { width: 32, height: 24 }));
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(v, 0, 0, 32, 24);
    const d = ctx.getImageData(0, 0, 32, 24).data;
    let sum = 0, diff = 0;
    for (let i = 0; i < d.length; i += 4) {
      const y = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
      sum += y;
      if (this._last) diff += Math.abs(y - this._last[i / 4]);
      (this._last = this._last || new Float32Array(d.length / 4))[i / 4] = y;
    }
    return sum / (d.length / 4) > 25 && diff / (d.length / 4) > 0.6;
  },

  /** Start counting look-aways. onChange(present) fires when someone appears or leaves. */
  watch(onChange) {
    this.stopWatching();
    this.lookAways = 0;
    this.awayMs = 0;
    let last = Date.now(), streak = 0;
    this.present = true;
    this._timer = setInterval(() => {
      const now = Date.now();
      const p = this._check();
      // Debounce: three checks in a row before it counts as leaving or coming back.
      streak = p === this.present ? 0 : streak + 1;
      if (!this.present) this.awayMs += now - last;
      last = now;
      if (streak >= 3) {
        this.present = p;
        streak = 0;
        if (!p) this.lookAways++;
        if (onChange) onChange(p);
      }
    }, 250);
  },

  stopWatching() { clearInterval(this._timer); this._timer = null; },

  /** The current frame, mirrored like a selfie, as a canvas. */
  snapshot(w = 640, h = 480) {
    if (!this.video) return null;
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
    const ctx = c.getContext("2d");
    ctx.translate(w, 0); ctx.scale(-1, 1);
    ctx.drawImage(this.video, 0, 0, w, h);
    return c;
  },

  /**
   * 2.2: listen for `seconds` while the player tries to stay quiet. onLevel(level 0..1, msOfSilence) on every chunk.
   * Resolves { echo, rate } — echo is the loudest ~1.4 s, kept in memory only — or null if declined.
   * The microphone is turned off again before this resolves.
   */
  async hush(seconds = 12, onLevel) {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: false } });
    } catch (e) {
      console.info("[senses] microphone declined or unavailable:", e.name);
      return null;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    const ring = [];
    let best = { rms: 0, at: 0 }, quietSince = performance.now();
    const start = performance.now();
    await new Promise(resolve => {
      proc.onaudioprocess = e => {
        const data = new Float32Array(e.inputBuffer.getChannelData(0));
        ring.push(data);
        let rms = 0;
        for (let i = 0; i < data.length; i++) rms += data[i] * data[i];
        rms = Math.sqrt(rms / data.length);
        const t = performance.now();
        if (rms > 0.012) quietSince = t;
        if (rms > best.rms) best = { rms, at: ring.length - 1 };
        if (onLevel) onLevel(Math.min(1, rms * 9), t - quietSince);
        if (t - start > seconds * 1000) resolve();
      };
      src.connect(proc);
      proc.connect(ctx.destination);
    });
    proc.disconnect(); src.disconnect();
    stream.getTracks().forEach(t => t.stop());
    const rate = ctx.sampleRate;
    ctx.close();
    let echo = null;
    if (best.rms > 0.03) {
      const per = ring[0].length, want = Math.ceil(rate * 1.4 / per);
      const from = Math.max(0, best.at - Math.floor(want / 2));
      const parts = ring.slice(from, from + want);
      echo = new Float32Array(parts.length * per);
      parts.forEach((p, i) => echo.set(p, i * per));
    }
    return { echo, rate };
  },

  stopCamera() {
    this.stopWatching();
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    this.stream = null;
    if (this.video) this.video.srcObject = null;
    this.video = null;
  },

  /**
   * Record from the microphone for up to `seconds` (stops early after ~1.2 s of silence once speech started).
   * Resolves { text, heard } — text from the local speech model if it's loaded, heard = whether anyone spoke.
   * Resolves null if the microphone was declined.
   */
  async listen(seconds = 6, onLevel) {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    } catch (e) {
      console.info("[senses] microphone declined or unavailable:", e.name);
      return null;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const src = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    const chunks = [];
    let spoke = false, quietSince = 0;
    const start = performance.now();
    await new Promise(resolve => {
      proc.onaudioprocess = e => {
        const data = e.inputBuffer.getChannelData(0);
        chunks.push(new Float32Array(data));
        let rms = 0;
        for (let i = 0; i < data.length; i++) rms += data[i] * data[i];
        rms = Math.sqrt(rms / data.length);
        if (onLevel) onLevel(Math.min(1, rms * 12));
        const t = performance.now();
        if (rms > 0.03) { spoke = true; quietSince = 0; }
        else if (spoke && !quietSince) quietSince = t;
        if ((spoke && quietSince && t - quietSince > 1200) || t - start > seconds * 1000) resolve();
      };
      src.connect(proc);
      proc.connect(ctx.destination);
    });
    proc.disconnect(); src.disconnect();
    stream.getTracks().forEach(t => t.stop());
    const rate = ctx.sampleRate;
    ctx.close();
    let samples = new Float32Array(chunks.reduce((a, c) => a + c.length, 0));
    let o = 0;
    for (const c of chunks) { samples.set(c, o); o += c.length; }
    // Some browsers ignore the requested sample rate. Whisper needs 16 kHz.
    if (rate !== 16000) {
      const ratio = rate / 16000, out = new Float32Array(Math.floor(samples.length / ratio));
      for (let i = 0; i < out.length; i++) out[i] = samples[Math.floor(i * ratio)];
      samples = out;
    }
    const text = spoke && ai.enabled ? await ai.transcribe(samples) : null;
    return { text, heard: spoke };
  }
};
