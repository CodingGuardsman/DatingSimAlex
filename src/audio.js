/**
 * audio.js — All sound is generated live with Web Audio (no audio files):
 * looping music, sound effects, per-character text blips, and the Office's synthesized voice.
 */

const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

// Chord tables use MIDI note numbers. Melody "0" is a rest.
const F = [53, 57, 60, 64], Am = [57, 60, 64, 67], Bb = [58, 62, 65, 69], C = [48, 55, 60, 64];
const Dm = [50, 57, 60, 65], Gm = [55, 58, 62, 65], Bbmaj = [58, 62, 65, 69], Csus = [48, 55, 60, 65];

const TRACKS = {
  // Bright after-school theme. Plays during Act 1 days.
  day: {
    bpm: 86, wave: "triangle", arp: true,
    chords: [F, Am, Bb, C, Dm, Bb, Gm, C],
    melody: [
      77, 0, 76, 74, 72, 0, 74, 76,  76, 0, 74, 72, 69, 0, 0, 0,
      70, 0, 72, 74, 77, 0, 76, 74,  72, 0, 0, 74, 72, 0, 0, 0,
      74, 0, 72, 69, 77, 0, 76, 74,  70, 0, 69, 70, 72, 0, 74, 0,
      70, 0, 69, 67, 69, 0, 72, 0,   67, 0, 0, 0, 0, 0, 0, 0
    ]
  },
  // Slower sunset theme for the walk home and confessions.
  evening: {
    bpm: 66, wave: "sine", arp: true,
    chords: [Dm, Bbmaj, F, Csus, Dm, Bbmaj, Gm, C],
    melody: [
      74, 0, 0, 72, 69, 0, 0, 0,  70, 0, 69, 67, 65, 0, 0, 0,
      69, 0, 0, 72, 77, 0, 76, 0, 72, 0, 0, 0, 0, 0, 0, 0,
      74, 0, 0, 72, 69, 0, 72, 0, 70, 0, 69, 67, 65, 0, 67, 0,
      69, 0, 70, 0, 67, 0, 0, 0,  65, 0, 0, 0, 0, 0, 0, 0
    ]
  },
  // The day theme, but something is wrong with the tape.
  wrong: { base: "day", bpm: 64, wave: "triangle", arp: true, wrong: true },
  // Music box version for the credits and the true ending.
  musicbox: { base: "evening", bpm: 60, wave: "sine", arp: false, octave: 12, box: true },
  drone: { drone: true },
  hum: { hum: true }
};
for (const t of Object.values(TRACKS)) {
  if (t.base) { t.chords = TRACKS[t.base].chords; t.melody = TRACKS[t.base].melody; }
}

const VOICES = {
  hina: { freq: 640, wave: "triangle", gain: 0.05 },
  rei: { freq: 420, wave: "square", gain: 0.025 },
  sayo: { freq: 330, wave: "sine", gain: 0.07 },
  k: { freq: 180, wave: "sawtooth", gain: 0.02 }
};

export class AudioSys {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.trackId = null;
    this._timer = null;
    this._nodes = [];
    this._blipCount = 0;
  }

  /** Must be called from a user gesture before anything can play. */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.sfxBus = this.ctx.createGain();
      // A cheap feedback delay gives everything a little room.
      const delay = this.ctx.createDelay(1);
      delay.delayTime.value = 0.28;
      const fb = this.ctx.createGain();
      fb.gain.value = 0.28;
      const wet = this.ctx.createGain();
      wet.gain.value = 0.22;
      this.musicBus.connect(this.master);
      this.musicBus.connect(delay);
      delay.connect(fb); fb.connect(delay);
      delay.connect(wet); wet.connect(this.master);
      this.sfxBus.connect(this.master);
      this.applyVolumes();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  applyVolumes() {
    if (!this.ctx) return;
    this.musicBus.gain.value = this.settings.music;
    this.sfxBus.gain.value = this.settings.sfx;
  }

  /* ---------- music ---------- */

  play(id) {
    if (!this.ctx || id === this.trackId) return;
    this.stop();
    this.trackId = id;
    const t = TRACKS[id];
    if (!t) return;
    if (t.drone) return this._drone();
    if (t.hum) return this._hum();
    this._sequence(t);
  }

  stop(fade = 0.6) {
    clearInterval(this._timer);
    this._timer = null;
    const now = this.ctx ? this.ctx.currentTime : 0;
    for (const n of this._nodes) {
      try {
        if (n.gain) { n.gain.gain.cancelScheduledValues(now); n.gain.gain.setTargetAtTime(0, now, fade / 3); }
        n.osc && n.osc.stop(now + fade + 0.1);
      } catch (e) { /* already stopped */ }
    }
    this._nodes = [];
    this.trackId = null;
  }

  _sequence(t) {
    const ctx = this.ctx;
    const stepLen = 60 / t.bpm / 2; // eighth notes
    const stepsPerBar = 8;
    let step = 0;
    let next = ctx.currentTime + 0.1;
    let bpm = t.bpm;
    const oct = t.octave || 0;

    const tick = () => {
      while (next < ctx.currentTime + 0.25) {
        const bar = Math.floor(step / stepsPerBar) % t.chords.length;
        const inBar = step % stepsPerBar;
        const chord = t.chords[bar];
        const drop = t.wrong && Math.random() < 0.18;
        const det = t.wrong ? (Math.random() - 0.5) * 70 : 0;

        if (inBar === 0 && !drop) {
          chord.forEach(n => this._note(midiHz(n + oct), next, stepLen * 8, t.box ? 0 : 0.035, "sine", det));
          this._note(midiHz(chord[0] - 12), next, stepLen * 3, 0.09, "sine", det);
        }
        if (inBar === 4 && !drop && !t.box) this._note(midiHz(chord[0] - 12), next, stepLen * 3, 0.07, "sine", det);
        if (t.arp && inBar % 2 === 1 && !drop) {
          const n = chord[(inBar >> 1) % chord.length] + 12 + oct;
          this._note(midiHz(n), next, stepLen * 0.9, 0.022, "sine", det, true);
        }
        const mel = t.melody[step % t.melody.length];
        if (mel && !drop) this._note(midiHz(mel + oct), next, stepLen * (t.box ? 3 : 1.7), t.box ? 0.07 : 0.05, t.wave, det, true);

        // The wrong tape slowly loses speed.
        if (t.wrong) bpm = Math.max(46, bpm - 0.05);
        next += t.wrong ? 60 / bpm / 2 : stepLen;
        step++;
      }
    };
    tick();
    this._timer = setInterval(tick, 60);
  }

  _note(freq, when, dur, vol, wave = "sine", detune = 0, pluck = false) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    const atk = pluck ? 0.008 : 0.12;
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(vol, when + atk);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(gain); gain.connect(this.musicBus);
    osc.start(when);
    osc.stop(when + dur + 0.05);
    const rec = { osc, gain };
    this._nodes.push(rec);
    osc.onended = () => { const i = this._nodes.indexOf(rec); if (i >= 0) this._nodes.splice(i, 1); };
  }

  _drone() {
    const ctx = this.ctx, now = ctx.currentTime;
    [55, 55.7, 82.4].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 2 ? "triangle" : "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(i === 2 ? 0.03 : 0.12, now + 3);
      osc.connect(gain); gain.connect(this.musicBus);
      osc.start();
      this._nodes.push({ osc, gain });
    });
    // Filtered noise that breathes in and out.
    const noise = this._noiseSource(4);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 400; bp.Q.value = 2;
    const lfo = ctx.createOscillator(); const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07; lfoGain.gain.value = 300;
    lfo.connect(lfoGain); lfoGain.connect(bp.frequency); lfo.start();
    const gain = ctx.createGain(); gain.gain.value = 0.05;
    noise.connect(bp); bp.connect(gain); gain.connect(this.musicBus);
    noise.start();
    this._nodes.push({ osc: noise, gain }, { osc: lfo });
  }

  _hum() {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth"; osc.frequency.value = 60;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 180;
    gain.gain.value = 0.04;
    osc.connect(lp); lp.connect(gain); gain.connect(this.musicBus);
    osc.start();
    this._nodes.push({ osc, gain });
  }

  _noiseSource(seconds) {
    const ctx = this.ctx;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    return src;
  }

  /* ---------- sound effects ---------- */

  sfx(name) {
    if (!this.ctx) return;
    const ctx = this.ctx, now = ctx.currentTime;
    const tone = (f, t, d, v, w = "sine", bus = this.sfxBus) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = w; o.frequency.value = f;
      g.gain.setValueAtTime(0, now + t);
      g.gain.linearRampToValueAtTime(v, now + t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + t + d);
      o.connect(g); g.connect(bus); o.start(now + t); o.stop(now + t + d + 0.05);
      return o;
    };
    const noise = (t, d, v, freq = 2000) => {
      const n = this._noiseSource(1), g = ctx.createGain(), f = ctx.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = freq;
      g.gain.setValueAtTime(v, now + t);
      g.gain.exponentialRampToValueAtTime(0.0001, now + t + d);
      n.connect(f); f.connect(g); g.connect(this.sfxBus); n.start(now + t); n.stop(now + t + d + 0.05);
    };
    switch (name) {
      case "chime": // PA system: ding-dong
        tone(784, 0, 1.4, 0.25); tone(1568, 0, 0.6, 0.05);
        tone(659, 0.55, 1.8, 0.25); tone(1318, 0.55, 0.7, 0.05);
        break;
      case "chime_down": // the same chime, slowed and flat
        tone(740, 0, 2.2, 0.25); tone(587, 0.9, 2.8, 0.25);
        break;
      case "bell": // school bell, four notes
        [[659, 0], [523, 0.5], [587, 1], [392, 1.5]].forEach(([f, t]) => { tone(f, t, 1.6, 0.18); tone(f * 2.01, t, 0.5, 0.04); });
        break;
      case "shutter":
        noise(0, 0.05, 0.5, 3000); noise(0.09, 0.07, 0.35, 1800);
        break;
      case "static":
        noise(0, 0.8, 0.35, 1200);
        break;
      case "glitch":
        for (let i = 0; i < 6; i++) tone(200 + Math.random() * 1800, i * 0.04, 0.05, 0.12, "square");
        break;
      case "heartbeat":
        tone(55, 0, 0.25, 0.6); tone(50, 0.28, 0.3, 0.45);
        break;
      case "page":
        noise(0, 0.25, 0.18, 5000);
        break;
      case "thud":
        tone(40, 0, 0.6, 0.7); noise(0, 0.2, 0.2, 300);
        break;
      case "rewind":
        for (let i = 0; i < 14; i++) tone(1400 - i * 80, i * 0.05, 0.06, 0.06, "sawtooth");
        noise(0, 0.8, 0.15, 3500);
        break;
      case "click":
        tone(1200, 0, 0.03, 0.06, "square");
        break;
      case "error":
        tone(330, 0, 0.18, 0.2, "square"); tone(262, 0.2, 0.3, 0.2, "square");
        break;
    }
  }

  /** A short pitched blip for each few characters of dialogue: the girls' "voices". */
  blip(who, corrupted = false) {
    const v = VOICES[who];
    if (!this.ctx || !v || !this.settings.voice) return;
    if (this._blipCount++ % 2) return;
    const ctx = this.ctx, now = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = corrupted ? "sawtooth" : v.wave;
    const base = corrupted ? v.freq * 0.5 : v.freq;
    o.frequency.value = base * (0.92 + Math.random() * 0.16);
    if (corrupted) o.frequency.linearRampToValueAtTime(base * 0.3, now + 0.08);
    g.gain.setValueAtTime(v.gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    o.connect(g); g.connect(this.sfxBus);
    o.start(now); o.stop(now + 0.09);
  }

  /** The Office speaks with the browser's own synthesized voice. Resolves when it finishes. */
  speak(text, { pitch = 0.55, rate = 0.88 } = {}) {
    return new Promise(resolve => {
      const synth = window.speechSynthesis;
      if (!synth || !this.settings.voice) return resolve();
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const voices = synth.getVoices();
        u.voice = voices.find(v => /en[-_](US|GB)/i.test(v.lang) && /female|zira|samantha|serena|google us/i.test(v.name))
          || voices.find(v => /^en/i.test(v.lang)) || null;
        u.pitch = pitch; u.rate = rate; u.volume = Math.min(1, this.settings.sfx + 0.2);
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        u.onend = finish; u.onerror = finish;
        // Some browsers never fire onend; fall back to an estimate.
        setTimeout(finish, 1500 + text.length * 85);
        synth.speak(u);
      } catch (e) { resolve(); }
    });
  }
}
