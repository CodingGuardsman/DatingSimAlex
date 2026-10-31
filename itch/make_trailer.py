"""Builds the deceptively cute itch.io trailer (1920x1080, ~45 s).

Cute scenes over a music box, the Office's announcement, one split-second
glitch, then a sweet end card where the music box is very slightly out of tune.

usage: python itch/make_trailer.py <pa_voice.wav> <out.mp4>
  Stills come from itch/screenshots and itch/trailer-stills (made by capture_shots.mjs).
  pa_voice.wav: the announcement, "Summer break begins in five days. Please enjoy your last
    week.", recorded with the same Kokoro voice as the game (af_heart, speed 0.9; see
    tools/make_office_voice.py) and run through a PA filter:
    ffmpeg -i raw.wav -af "highpass=f=320,lowpass=f=3800,acrusher=bits=12:mix=0.15,aecho=0.8:0.6:70|160|290:0.32|0.2|0.12,apad=pad_dur=0.8" pa.wav
Needs numpy, Pillow and imageio-ffmpeg.
"""
import os, sys, wave, subprocess
import numpy as np
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
A = os.path.join(PROJ, "assets")
PA_WAV, OUT = sys.argv[1], sys.argv[2]
SHOT_DIRS = [os.path.join(HERE, "screenshots"), os.path.join(HERE, "trailer-stills")]

W, H, FPS, SR = 1920, 1080, 30, 44100
XF = 0.35  # crossfade seconds
PINK_BG = (255, 232, 241)
PINK, DEEP, WHITE, INK = (255, 120, 170), (226, 72, 128), (255, 255, 255), (91, 61, 76)
FONTS = "C:/Windows/Fonts"


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def heart(d, cx, cy, r, fill):
    d.ellipse((cx - r, cy - r, cx, cy), fill=fill)
    d.ellipse((cx, cy - r, cx + r, cy), fill=fill)
    d.polygon([(cx - r + 1, cy - r // 2 + 2), (cx + r - 1, cy - r // 2 + 2), (cx, cy + r)], fill=fill)


def centered(d, y, text, f, fill, stroke=0, stroke_fill=None):
    w = d.textlength(text, font=f)
    d.text(((W - w) / 2, y), text, font=f, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill)
    return (W - w) / 2, w


def sprite(path, h):
    im = Image.open(os.path.join(A, "sprites", path + ".webp")).convert("RGBA")
    return im.resize((int(im.width * h / im.height), h), Image.LANCZOS)


def bg(name, bright=1.0):
    im = Image.open(os.path.join(A, "bg", name + ".webp")).convert("RGB")
    s = max(W / im.width, H / im.height)
    im = im.resize((int(im.width * s) + 1, int(im.height * s) + 1), Image.LANCZOS)
    im = im.crop(((im.width - W) // 2, (im.height - H) // 2, (im.width - W) // 2 + W, (im.height - H) // 2 + H))
    return ImageEnhance.Brightness(im).enhance(bright)


# ---------- still frames ----------

def text_card(lines, small=None, hearts=True):
    im = Image.new("RGB", (W, H), PINK_BG)
    d = ImageDraw.Draw(im)
    f = font("Candarab.ttf", 92)
    y = H / 2 - len(lines) * 62 - (30 if small else 0)
    for line in lines:
        x, w = centered(d, y, line, f, PINK, 8, WHITE)
        y += 124
    if hearts:
        heart(d, int(W / 2), int(y + 36), 26, DEEP)
    if small:
        centered(d, y + 90, small, font("Inkfree.ttf", 48), DEEP)
    return im


def title_card():
    im = bg("beach", 1.05).convert("RGBA")
    wash = Image.new("RGBA", (W, H), (255, 214, 232, 46))
    im.alpha_composite(wash)
    # Someone at the end of the pier, as on the banner.
    fig = sprite("rei/neutral", 120)
    sil = Image.new("RGBA", fig.size, (40, 44, 58, 0))
    sil.putalpha(fig.split()[3].point(lambda v: int(v * 0.8)))
    hh = int(H * 0.98)
    for path, cx, scale in (("rei/laugh", 0.2, 0.94), ("sayo/blank", 0.8, 0.94), ("hina/happy", 0.5, 1.0)):
        s = sprite(path, int(hh * scale))
        im.alpha_composite(s, (int(W * cx - s.width / 2), int(H * 0.2 + hh * (1 - scale) * 0.6)))
    im.alpha_composite(sil.filter(ImageFilter.GaussianBlur(0.8)), (int(W * 0.06), int(H * 0.47)))
    fade = Image.new("L", (1, H))
    for y in range(H):
        fade.putpixel((0, y), int(max(0, (y - H * 0.55) / (H * 0.45)) ** 1.5 * 210))
    pink = Image.new("RGBA", (W, H), (255, 228, 240, 255))
    pink.putalpha(fade.resize((W, H)))
    im.alpha_composite(pink)
    d = ImageDraw.Draw(im)
    f = font("Candarab.ttf", 170)
    x, w = centered(d, H - 330, "After Class", f, PINK, 16, WHITE)
    heart(d, int(x + w + 70), int(H - 330 + 75), 38, DEEP)
    f2 = font("Inkfree.ttf", 64)
    x2, w2 = centered(d, H - 130, "five days until summer", f2, DEEP, 4, WHITE)
    return im.convert("RGB")


def end_card():
    im = Image.new("RGB", (W, H), PINK_BG)
    d = ImageDraw.Draw(im)
    x, w = centered(d, 330, "See you after class!", font("Candarab.ttf", 120), PINK, 10, WHITE)
    heart(d, int(x + w + 60), 400, 34, DEEP)
    centered(d, 560, "Out now on itch.io", font("Candara.ttf", 64), INK)
    centered(d, 650, "stagworks.itch.io/after-class", font("Candara.ttf", 52), DEEP)
    centered(d, 760, "free demo playable in your browser", font("Inkfree.ttf", 44), INK)
    return im


def sting_frames():
    """A few frames of something that isn't cute at all: the uncanny UI, and Hina, corrupted."""
    base = bg("classroom", 0.35).convert("RGBA")
    s = sprite("hina/corrupt", int(H * 1.05))
    base.alpha_composite(s, (int(W / 2 - s.width / 2), int(H * 0.08)))
    corrupt = np.asarray(base.convert("RGB")).copy()
    uncanny = np.asarray(shot("t-uncanny")).copy()
    rng = np.random.default_rng(7)
    out = []
    for k in range(4):
        a = (uncanny if k % 2 == 0 else corrupt).copy()
        for _ in range(14):
            y0 = rng.integers(0, H - 40); h = rng.integers(8, 60); dx = rng.integers(-160, 160)
            a[y0:y0 + h] = np.roll(a[y0:y0 + h], dx, axis=1)
        a[..., 0] = np.clip(a[..., 0].astype(int) + 60, 0, 255)
        a[..., 2] = np.roll(a[..., 2], 12 * (k + 1), axis=1)
        out.append(Image.fromarray(a))
    return out


def shot(name):
    path = next(os.path.join(d, name + ".png") for d in SHOT_DIRS if os.path.exists(os.path.join(d, name + ".png")))
    return Image.open(path).convert("RGB").resize((W, H))


# ---------- timeline ----------
# (kind, payload, seconds)
cute = [
    ("card", text_card(["Stagworks presents"], hearts=False), 2.4),
    ("card", text_card(["Summer break is only", "five days away!"]), 2.8),
    ("kb", shot("02-hina"), 2.6),
    ("kb", shot("03-rei"), 2.6),
    ("kb", shot("t-lunch"), 2.4),
    ("kb", shot("04-river"), 2.6),
    ("kb", shot("05-phone"), 3.0),
    ("kb", shot("06-sayo"), 2.6),
    ("card", text_card(["Five afternoons.", "Three girls.", "One summer."]), 3.0),
    ("kb", shot("07-scrapbook"), 2.6),
    ("kb", shot("t-choice"), 2.0),
    ("kb", shot("t-rooftop"), 2.2),
    ("kb", shot("t-rei-roof"), 2.0),
    ("kb", shot("t-sayo-roof"), 2.0),
    ("kb", shot("t-pa"), 7.0),
    ("kb", title_card(), 4.0),
]
PA_INDEX = 14  # the Office's announcement: music ducks under the voice here
STING, BLACK, END = 0.6, 0.9, 5.0


def kb_frame(im, u, i):
    """Slow Ken Burns zoom; alternate direction per segment."""
    z = 1.0 + 0.06 * (u if i % 2 == 0 else 1 - u)
    cw, ch = W / z, H / z
    x0 = (W - cw) * (0.5 + 0.25 * (u - 0.5) * (1 if i % 3 else -1))
    y0 = (H - ch) * 0.5
    return im.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))


def frames():
    starts, t = [], 0.0
    for kind, im, dur in cute:
        starts.append(t); t += dur
    total_cute = t
    n = int(round(total_cute * FPS))
    for f in range(n):
        tt = f / FPS
        i = max(k for k in range(len(cute)) if starts[k] <= tt)
        kind, im, dur = cute[i]
        u = (tt - starts[i]) / dur
        fr = kb_frame(im, u, i) if kind == "kb" else im
        # crossfade into the next segment
        left = starts[i] + dur - tt
        if left < XF and i + 1 < len(cute):
            k2, im2, d2 = cute[i + 1]
            fr2 = kb_frame(im2, 0, i + 1) if k2 == "kb" else im2
            fr = Image.blend(fr, fr2, 1 - left / XF)
        if tt < 0.5:
            fr = Image.blend(Image.new("RGB", (W, H), PINK_BG), fr, tt / 0.5)
        yield fr
    st = sting_frames()
    for f in range(int(STING * FPS)):
        yield st[(f // 2) % len(st)] if f % 5 != 4 else Image.new("RGB", (W, H), (0, 0, 0))
    black = Image.new("RGB", (W, H), (0, 0, 0))
    for f in range(int(BLACK * FPS)):
        yield black
    end = end_card()
    for f in range(int(END * FPS)):
        tt = f / FPS
        a = min(1, tt / 0.8)
        fr = Image.blend(black, end, a)
        if tt > END - 0.8:
            fr = Image.blend(fr, Image.new("RGB", (W, H), PINK_BG), (tt - (END - 0.8)) / 0.8)
        yield fr
    return total_cute


# ---------- audio ----------

def note_hz(n):
    names = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}
    return 440 * 2 ** ((names[n[0]] + 12 * (int(n[1]) - 4)) / 12)


def bell(freq, dur, amp=0.3, detune_cents=0):
    t = np.arange(int(dur * SR)) / SR
    f = freq * 2 ** (detune_cents / 1200)
    env = np.exp(-t * 3.2) * np.minimum(1, t * 400)
    return amp * env * (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6)
                        + 0.12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 9))


def pad(freq, dur, amp=0.05):
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.6)
    return amp * env * (np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(2 * np.pi * freq * 1.5 * t))


MELODY = ["E5", "G5", "C6", "B5", "A5", "G5", "E5", "G5", "F5", "A5", "C6", "A5", "G5", "E5", "D5", "C5"]
CHORDS = ["C3", "C3", "F3", "G3"]


def music(seconds, step=0.3, detune=0, amp=1.0):
    buf = np.zeros(int((seconds + 3) * SR))
    i = 0
    while i * step < seconds:
        s = int(i * step * SR)
        b = bell(note_hz(MELODY[i % len(MELODY)]), 2.0, 0.22 * amp, detune * (1 + 0.6 * np.sin(i)))
        buf[s:s + len(b)] += b
        if i % 4 == 0:
            p = pad(note_hz(CHORDS[(i // 4) % 4]), step * 4 + 0.6, 0.045 * amp)
            buf[s:s + len(p)] += p
        i += 1
    return buf


def load_wav(path):
    with wave.open(path) as w:
        sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(float) / 32768
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    return np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)


def soundtrack(total_cute):
    total = total_cute + STING + BLACK + END
    out = np.zeros(int((total + 1) * SR))
    m = music(total_cute)[: int(total_cute * SR)]
    # Duck the music under the announcement.
    pa_start = sum(d for _, _, d in cute[:PA_INDEX])
    env = np.ones(len(m))
    a, b = int((pa_start - 0.2) * SR), int((pa_start + 6.8) * SR)
    ramp = int(0.4 * SR)
    env[a:b] = 0.22
    env[a:a + ramp] = np.linspace(1, 0.22, ramp)
    env[b - ramp:b] = np.linspace(0.22, 1, ramp)
    m *= env
    m[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))  # hard cut into the sting
    out[: len(m)] += m
    # School chime, then the Office.
    s = int((pa_start + 0.15) * SR)
    for k, n in enumerate(["E5", "C5"]):
        c = bell(note_hz(n), 1.4, 0.28)
        out[s + int(k * 0.45 * SR): s + int(k * 0.45 * SR) + len(c)] += c
    v = load_wav(PA_WAV) * 0.9
    s = int((pa_start + 1.2) * SR)
    out[s:s + len(v)] += v[: len(out) - s]
    # Sting: noise, a low hit, and a wrong chord.
    s = int(total_cute * SR)
    n = int(STING * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(3)
    sting = 0.35 * rng.standard_normal(n) * np.exp(-t * 2)
    sting += 0.6 * np.sin(2 * np.pi * 42 * t) * np.exp(-t * 4)
    for f in (233, 247, 330):
        sting += 0.12 * np.sign(np.sin(2 * np.pi * f * t)) * np.exp(-t * 3)
    out[s:s + n] += sting
    # End card: the music box again, slower, and just slightly out of tune.
    s = int((total_cute + STING + BLACK + 0.4) * SR)
    e = music(END - 0.6, step=0.42, detune=-35, amp=0.8)
    e = e[: len(out) - s]
    e *= np.minimum(1, np.linspace(END + 2.4, 0, len(e)) / 2.0)
    out[s:s + len(e)] += e
    out = np.tanh(out * 1.1) * 0.9
    return out[: int(total * SR)]


def main():
    tmp_wav = OUT + ".wav"
    total_cute = sum(d for _, _, d in cute)
    audio = soundtrack(total_cute)
    with wave.open(tmp_wav, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((audio * 32767).astype(np.int16).tobytes())
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    p = subprocess.Popen([ff, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-i", tmp_wav, "-c:v", "libx264", "-preset", "medium",
                          "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest",
                          "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
    count = 0
    for fr in frames():
        p.stdin.write(fr.tobytes()); count += 1
    p.stdin.close(); p.wait()
    os.remove(tmp_wav)
    print("frames", count, "seconds", round(count / FPS, 1), "->", OUT)


main()
