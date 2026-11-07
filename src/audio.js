/**
 * audio.js — Music, sound effects and text blips are generated live with Web Audio.
 * The only audio files are the Office's recorded PA lines (assets/voice/office).
 */

const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

// Chord tables use MIDI note numbers. Melody "0" is a rest.
const F = [53, 57, 60, 64], Am = [57, 60, 64, 67], Bb = [58, 62, 65, 69], C = [48, 55, 60, 64];
const Dm = [50, 57, 60, 65], Gm = [55, 58, 62, 65], Bbmaj = [58, 62, 65, 69], Csus = [48, 55, 60, 65];
const G = [55, 59, 62, 67], D = [50, 54, 57, 62], Em = [52, 55, 59, 64], Cmaj = [48, 52, 55, 60];
const Eb = [51, 55, 58, 63], Cm = [48, 51, 55, 60], Ab = [44, 48, 51, 56], Bb7 = [46, 50, 53, 56], Gm7 = [43, 50, 53, 58];
const A = [45, 52, 57, 61], Fmaj = [41, 53, 57, 60], E = [40, 52, 56, 59];
const Dmaj7 = [50, 54, 57, 61], Bm = [47, 54, 59, 62], Fsm = [42, 54, 57, 61], G2 = [43, 55, 59, 62];

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
  hum: { hum: true },

  // 2.1: new tracks. Drum patterns are one bar of eighth notes (x = hit).
  // Bouncy morning theme: the bakery, the 7:42 train, the courtyard.
  morning: {
    bpm: 112, wave: "triangle", arp: true,
    chords: [G, D, Em, Cmaj, G, D, Cmaj, D],
    melody: [
      79, 0, 78, 76, 74, 0, 76, 78,  79, 0, 0, 74, 71, 0, 0, 0,
      76, 0, 74, 72, 71, 0, 72, 74,  76, 0, 0, 0, 72, 0, 0, 0,
      79, 0, 81, 79, 78, 0, 76, 74,  76, 0, 78, 79, 81, 0, 79, 0,
      76, 0, 74, 72, 74, 0, 76, 0,   74, 0, 0, 0, 0, 0, 0, 0
    ],
    drums: { k: "x...x...", s: "..x...x.", h: "xxxxxxxx" }, bass: "x..x.x..", bassWave: "triangle"
  },
  // Soft piano for evenings, confessions and the last night.
  romance: {
    bpm: 70, wave: "triangle", arp: true, pluckLead: true,
    chords: [Eb, Cm, Ab, Bb7, Eb, Gm7, Ab, Bb7],
    melody: [
      75, 0, 0, 74, 72, 0, 70, 0,  72, 0, 0, 0, 67, 0, 0, 0,
      68, 0, 72, 0, 75, 0, 77, 0,  75, 0, 0, 0, 74, 0, 0, 0,
      75, 0, 0, 74, 72, 0, 74, 75, 79, 0, 77, 0, 75, 0, 74, 0,
      72, 0, 70, 0, 68, 0, 72, 0,  70, 0, 0, 0, 0, 0, 0, 0
    ]
  },
  // The engagement hearing: a driving trial theme.
  hearing: {
    bpm: 138, wave: "square", arp: false, leadVol: 0.035,
    chords: [Dm, Dm, Bb, A, Dm, Gm, A, A],
    melody: [
      74, 0, 74, 0, 77, 0, 76, 74,  0, 0, 72, 0, 74, 0, 0, 0,
      70, 0, 70, 0, 74, 0, 72, 70,  69, 0, 0, 0, 73, 0, 0, 0,
      74, 0, 77, 0, 81, 0, 79, 77,  79, 0, 77, 0, 74, 0, 72, 0,
      73, 0, 76, 0, 79, 0, 76, 73,  69, 0, 0, 0, 0, 0, 0, 0
    ],
    drums: { k: "x..x.x..", s: "....x..x", h: "xxxxxxxx" }, bass: "xxxxxxxx", bassWave: "sawtooth"
  },
  // The Office thinking: a cold, stuttering loop. It repeats itself on purpose.
  office: {
    bpm: 100, wave: "square", arp: true, arpAll: true, leadVol: 0.03, stutter: true,
    chords: [Am, Am, Fmaj, E],
    melody: [81, 0, 0, 0, 80, 0, 0, 0,  76, 0, 0, 0, 72, 0, 0, 0,  77, 0, 0, 0, 76, 0, 0, 0,  68, 0, 0, 0, 71, 0, 0, 0],
    drums: { k: "x.......", h: "..x...x." }, bass: "x...x...", bassWave: "square"
  },
  // Act 3. Bittersweet: the same school, a little older.
  secondterm: {
    bpm: 90, wave: "triangle", arp: true,
    chords: [Dmaj7, A, Bm, Fsm, G2, Dmaj7, G2, A],
    melody: [
      78, 0, 76, 74, 73, 0, 0, 0,  76, 0, 74, 73, 71, 0, 0, 0,
      74, 0, 73, 71, 69, 0, 71, 73, 69, 0, 0, 0, 0, 0, 0, 0,
      74, 0, 76, 78, 79, 0, 78, 76, 78, 0, 0, 74, 0, 0, 73, 0,
      71, 0, 73, 74, 76, 0, 74, 73, 74, 0, 0, 0, 0, 0, 0, 0
    ],
    drums: { k: "x.....x.", h: "..x...x." }, bass: "x...x.x.", bassWave: "triangle"
  },
  // A music box someone wound too tight. For the worst rooms.
  lullaby: {
    bpm: 52, wave: "sine", arp: false, octave: 12, box: true, creep: true,
    chords: [Am, Dm, E, Am, Fmaj, Dm, E, Am],
    melody: [
      81, 0, 79, 0, 76, 0, 72, 0,  74, 0, 77, 0, 76, 0, 74, 0,
      71, 0, 76, 0, 75, 0, 71, 0,  69, 0, 0, 0, 0, 0, 0, 0,
      72, 0, 76, 0, 77, 0, 81, 0,  77, 0, 74, 0, 72, 0, 71, 0,
      68, 0, 71, 0, 76, 0, 74, 0,  69, 0, 0, 0, 0, 0, 0, 0
    ]
  },
  // Nothing but a pulse in a dark room.
  heartbeat: { heartbeat: true }
};
for (const t of Object.values(TRACKS)) {
  if (t.base) { t.chords = TRACKS[t.base].chords; t.melody = TRACKS[t.base].melody; }
}

const VOICES = {
  hina: { freq: 640, wave: "triangle", gain: 0.05 },
  rei: { freq: 420, wave: "square", gain: 0.025 },
  sayo: { freq: 330, wave: "sine", gain: 0.07 },
  k: { freq: 180, wave: "sawtooth", gain: 0.02 },
  daichi: { freq: 250, wave: "square", gain: 0.022 },
  sensei: { freq: 300, wave: "triangle", gain: 0.045 },
  nurse: { freq: 540, wave: "sine", gain: 0.06 },
  okada: { freq: 400, wave: "triangle", gain: 0.045 }
};

/** Clip lookup key. Must match key() in tools/make_office_voice.py. */
const officeKey = t => t.replace(/^[\s.,;:!?]+|[\s,;:]+$/g, "").replace(/\s+/g, " ").toLowerCase();

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven",
  "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = { 2: "twenty", 3: "thirty", 4: "forty", 5: "fifty" };
const numberWords = n => n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");

/** "4:32 PM" -> ["four", "thirty-two", "p.m."]; null if it doesn't look like a time. */
function clockWords(s) {
  const m = s.match(/(\d{1,2}):(\d{2})\s*([ap])?/i);
  if (!m) return null;
  const h = +m[1], min = +m[2], words = [numberWords(h)];
  if (min === 0) words.push("o'clock");
  else if (min < 10) words.push("oh", numberWords(min));
  else words.push(numberWords(min));
  if (m[3]) words.push(m[3].toLowerCase() === "a" ? "a.m." : "p.m.");
  return words;
}

/** "2 hours and 14 minutes" -> ["two", "hours", "and", "fourteen", "minutes"]; null past 59 hours. */
function durationWords(s) {
  const words = [];
  for (const w of s.split(/\s+/)) {
    if (/^\d+$/.test(w)) { if (+w > 59) return null; words.push(numberWords(+w)); }
    else words.push(w.toLowerCase());
  }
  return words;
}

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
      // Music runs through a lowpass so it can be heard "through the wall" behind the menu.
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = "lowpass";
      this.musicFilter.frequency.value = 20000;
      this.musicBus.connect(this.musicFilter);
      this.musicFilter.connect(this.master);
      this.musicFilter.connect(delay);
      delay.connect(fb); fb.connect(delay);
      delay.connect(wet); wet.connect(this.master);
      this.sfxBus.connect(this.master);
      this.applyVolumes();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  /** Muffle the music, as if it were playing in another room. */
  muffle(on) {
    if (!this.ctx) return;
    this.musicFilter.frequency.setTargetAtTime(on ? 420 : 20000, this.ctx.currentTime, 0.4);
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
    if (t.heartbeat) return this._heartbeat();
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
        const det = t.wrong ? (Math.random() - 0.5) * 70 : t.creep ? (Math.random() - 0.5) * 40 : 0;

        if (inBar === 0 && !drop) {
          chord.forEach(n => this._note(midiHz(n + oct), next, stepLen * 8, t.box ? 0 : 0.035, "sine", det));
          if (!t.bass) this._note(midiHz(chord[0] - 12), next, stepLen * 3, 0.09, "sine", det);
        }
        if (inBar === 4 && !drop && !t.box && !t.bass) this._note(midiHz(chord[0] - 12), next, stepLen * 3, 0.07, "sine", det);
        if (t.bass && t.bass[inBar] === "x") {
          // Octave-hopping on the off-beats keeps a driving line from sounding flat.
          const up = inBar % 2 && t.bass === "xxxxxxxx" ? 12 : 0;
          this._note(midiHz(chord[0] - 12 + up), next, stepLen * 0.9, 0.06, t.bassWave || "triangle", det, true, 900);
        }
        if (t.arp && (t.arpAll || inBar % 2 === 1) && !drop) {
          const n = chord[(t.arpAll ? inBar : inBar >> 1) % chord.length] + 12 + oct;
          this._note(midiHz(n), next, stepLen * 0.9, t.arpAll ? 0.016 : 0.022, t.arpAll ? "square" : "sine", det, true, t.arpAll ? 2200 : 0);
        }
        if (t.drums) this._drums(t.drums, inBar, next);
        let mel = t.melody[step % t.melody.length];
        // The Office's loop catches on itself: now and then a note repeats, like a skipping CD.
        if (t.stutter && !mel && t.melody[(step - 1 + t.melody.length) % t.melody.length] && Math.random() < 0.3) mel = t.melody[(step - 1 + t.melody.length) % t.melody.length];
        // The lullaby sometimes lands on the wrong note, a tritone away.
        if (t.creep && mel && Math.random() < 0.08) mel += 6;
        if (mel && !drop) this._note(midiHz(mel + oct), next, stepLen * (t.box ? 3 : t.pluckLead ? 2.6 : 1.7), t.box ? 0.07 : t.leadVol || 0.05, t.wave, det, true);

        // The wrong tape slowly loses speed.
        if (t.wrong) bpm = Math.max(46, bpm - 0.05);
        next += t.wrong ? 60 / bpm / 2 : stepLen;
        step++;
      }
    };
    tick();
    this._timer = setInterval(tick, 60);
  }

  _note(freq, when, dur, vol, wave = "sine", detune = 0, pluck = false, lowpass = 0) {
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
    if (lowpass) {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = lowpass;
      osc.connect(lp); lp.connect(gain);
    } else osc.connect(gain);
    gain.connect(this.musicBus);
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

  /** One step of a drum pattern: k kick, s snare, h hi-hat. All synthesized. */
  _drums(p, inBar, when) {
    const ctx = this.ctx;
    const hit = (key) => p[key] && p[key][inBar] === "x";
    const track = (src, gain) => {
      const rec = { osc: src, gain };
      this._nodes.push(rec);
      src.onended = () => { const i = this._nodes.indexOf(rec); if (i >= 0) this._nodes.splice(i, 1); };
    };
    if (hit("k")) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(130, when);
      o.frequency.exponentialRampToValueAtTime(42, when + 0.12);
      g.gain.setValueAtTime(0.22, when);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.25);
      o.connect(g); g.connect(this.musicBus); o.start(when); o.stop(when + 0.3);
      track(o, g);
    }
    for (const [key, f, type, vol, len] of [["s", 1900, "bandpass", 0.07, 0.14], ["h", 7500, "highpass", 0.02, 0.04]]) {
      if (!hit(key)) continue;
      const n = this._noiseBuffer(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
      fl.type = type; fl.frequency.value = f;
      g.gain.setValueAtTime(vol, when);
      g.gain.exponentialRampToValueAtTime(0.0001, when + len);
      n.connect(fl); fl.connect(g); g.connect(this.musicBus); n.start(when); n.stop(when + len + 0.02);
      track(n, g);
    }
  }

  /** A short shared noise buffer, so drums don't allocate a new one every hit. */
  _noiseBuffer() {
    if (!this._nb) {
      const len = this.ctx.sampleRate * 0.3;
      this._nb = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this._nb.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = this._nb;
    return src;
  }

  /** A low drone with a heartbeat that slowly speeds up. For the rooms you shouldn't be in. */
  _heartbeat() {
    this._drone();
    let gap = 1150;
    const beat = () => {
      if (this.trackId !== "heartbeat") return;
      const ctx = this.ctx, now = ctx.currentTime;
      [[0, 58, 0.5], [0.26, 52, 0.38]].forEach(([t, f, v]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = f;
        g.gain.setValueAtTime(0, now + t);
        g.gain.linearRampToValueAtTime(v, now + t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.28);
        o.connect(g); g.connect(this.musicBus); o.start(now + t); o.stop(now + t + 0.32);
      });
      gap = Math.max(620, gap - 12);
      this._timer = setTimeout(beat, gap);
    };
    beat();
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
      case "pop": // a chat message arriving
        tone(880, 0, 0.08, 0.12); tone(1320, 0.05, 0.1, 0.08);
        break;
      case "sparkle": // a memory kept
        [1568, 2093, 2637].forEach((f, i) => tone(f, i * 0.07, 0.35, 0.06));
        break;
      case "pencil": // Sayo drawing something
        for (let i = 0; i < 9; i++) noise(i * 0.16, 0.12, 0.08, 4200 + Math.random() * 1500);
        break;
      case "door": // a heavy door, slowly
        tone(70, 0, 1.6, 0.35, "sawtooth"); noise(0, 1.4, 0.12, 400);
        for (let i = 0; i < 8; i++) tone(220 + Math.random() * 60, 0.2 + i * 0.12, 0.1, 0.04, "square");
        break;
      case "error":
        tone(330, 0, 0.18, 0.2, "square"); tone(262, 0.2, 0.3, 0.2, "square");
        break;
      case "scare": { // jumpscare: a detuned screech over a hit
        tone(38, 0, 0.9, 0.8); noise(0, 1.1, 0.6, 2600); noise(0, 0.6, 0.4, 600);
        [920, 977, 1310, 1385].forEach((f, i) => {
          const o = tone(f, 0, 1.0, 0.11, "sawtooth");
          o.frequency.linearRampToValueAtTime(f * 0.62, now + 1.0);
        });
        break;
      }
      case "creak": { // a rope under weight, swinging
        for (let i = 0; i < 3; i++) {
          const o = tone(150 + i * 9, i * 1.1, 0.9, 0.07, "sawtooth");
          o.frequency.linearRampToValueAtTime(110 + i * 7, now + i * 1.1 + 0.9);
          noise(i * 1.1, 0.8, 0.05, 900);
        }
        break;
      }
      case "drip":
        [0, 0.9, 1.5].forEach(t => { const o = tone(1500, t, 0.12, 0.12); o.frequency.exponentialRampToValueAtTime(500, now + t + 0.1); });
        break;
      case "whisper":
        for (let i = 0; i < 7; i++) noise(i * 0.22 + Math.random() * 0.1, 0.25, 0.09, 3000 + Math.random() * 3000);
        break;
      case "type": // the Office thinking: keys under a desk
        for (let i = 0; i < 6; i++) noise(i * 0.06 + Math.random() * 0.03, 0.03, 0.12, 2500);
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

  /* ---------- the Office ---------- */

  /**
   * Plays a PA announcement from the recorded clips in assets/voice/office
   * (made by tools/make_office_voice.py). Fixed words are recordings; {clock} and
   * {playtime} are spliced from recorded numbers like a station announcement; the
   * player's name falls back to the browser's synthesized voice.
   * Resolves false if the clips can't be used, so the caller can fall back to speak().
   */
  async announce(template, vars, { broken = false } = {}) {
    if (!this.settings.voice) return true;
    if (!this.ctx) return false;
    const clips = await this._officeClips();
    if (!clips) return false;
    const plan = [];
    for (const tok of template.split(/(\{\w+\})/)) {
      const v = tok.match(/^\{(\w+)\}$/);
      if (!v) { if (officeKey(tok)) plan.push(officeKey(tok)); continue; }
      const value = String(vars[v[1]] ?? "");
      const words = v[1] === "clock" ? clockWords(value) : v[1] === "playtime" ? durationWords(value) : null;
      if (words) plan.push(...words);
      else plan.push({ say: value });
    }
    if (plan.some(p => typeof p === "string" && !clips[p])) return false;
    let buffers;
    try {
      buffers = await Promise.all(plan.map(p => typeof p === "string" ? this._clip(clips[p]) : null));
    } catch (e) { return false; }
    const out = this._paChain(broken);
    for (let i = 0; i < plan.length; i++) {
      if (buffers[i]) await this._playClip(buffers[i], out, broken ? 0.8 : 1);
      else await this.speak(plan[i].say, broken ? { pitch: 0.2, rate: 0.7 } : {});
      await new Promise(r => setTimeout(r, 50));
    }
    setTimeout(() => out.disconnect(), 2500);
    return true;
  }

  _officeClips() {
    if (!this._office) {
      this._office = fetch("assets/voice/office/manifest.json")
        .then(r => r.ok ? r.json() : null).then(m => m && m.clips).catch(() => null);
    }
    return this._office;
  }

  _clip(file) {
    this._buffers = this._buffers || {};
    if (!this._buffers[file]) {
      this._buffers[file] = fetch("assets/voice/office/" + file)
        .then(r => r.arrayBuffer()).then(b => this.ctx.decodeAudioData(b));
    }
    return this._buffers[file];
  }

  _playClip(buffer, out, rate) {
    return new Promise(resolve => {
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = rate;
      src.connect(out);
      src.onended = resolve;
      src.start();
    });
  }

  /** A ceiling speaker in a big room: narrow band, a little grit, a long echo. */
  _paChain(broken) {
    const ctx = this.ctx;
    const input = ctx.createGain();
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = broken ? 500 : 320;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = broken ? 2400 : 3800;
    const drive = ctx.createWaveShaper();
    const k = broken ? 18 : 3, curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) { const x = i / 511.5 - 1; curve[i] = Math.tanh(k * x) / Math.tanh(k); }
    drive.curve = curve;
    const len = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.5);
    }
    const room = ctx.createConvolver(); room.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = broken ? 0.55 : 0.32;
    const dry = ctx.createGain(); dry.gain.value = 1.1;
    input.connect(hp); hp.connect(lp); lp.connect(drive);
    drive.connect(dry); dry.connect(this.sfxBus);
    drive.connect(room); room.connect(wet); wet.connect(this.sfxBus);
    return input;
  }

  /** The browser's own synthesized voice. Resolves when it finishes. */
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
