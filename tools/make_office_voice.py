"""Records the Office's PA announcements with Kokoro, a free neural TTS (Apache-2.0).

Every pa("...") line in src/story.js is split on its {variables}. Each fixed part
becomes one clip, and numbers/time words are recorded separately, so the game
can splice "It is" + "four" + "thirty-two" + "P.M." like a real automated PA.
The player's name is the only part the browser still synthesizes itself.

usage (needs: pip install kokoro-onnx soundfile; ffmpeg on PATH or FFMPEG=path):
  python tools/make_office_voice.py <kokoro-v1.0.onnx> <voices-v1.0.bin>
Model files: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
Writes assets/voice/office/*.mp3 and manifest.json.
"""
import os, re, sys, json, subprocess, tempfile
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

VOICE, SPEED = "af_heart", 0.9

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(PROJ, "assets", "voice", "office")
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")

ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven",
        "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
TENS = {2: "twenty", 3: "thirty", 4: "forty", 5: "fifty"}


def number_words(n):
    if n < 20:
        return ONES[n]
    t, o = divmod(n, 10)
    return TENS[t] + ("" if o == 0 else "-" + ONES[o])


def key(text):
    """Must match officeKey() in src/audio.js."""
    return re.sub(r"\s+", " ", re.sub(r"^[\s.,;:!?]+|[\s,;:]+$", "", text)).lower()


def story_chunks():
    src = open(os.path.join(PROJ, "src", "story.js"), encoding="utf-8").read()
    chunks = []
    for line in re.findall(r'\bpa\("((?:[^"\\]|\\.)*)"', src):
        for part in re.split(r"\{\w+\}", line):
            if key(part):
                chunks.append(re.sub(r"^[\s.,;:!?]+", "", part).rstrip(" ,"))
    return chunks


def trim(x, sr, thresh=0.01, pad=0.04):
    idx = np.where(np.abs(x) > thresh)[0]
    if not len(idx):
        return x
    a, b = max(0, idx[0] - int(pad * sr)), min(len(x), idx[-1] + int(pad * sr))
    return x[a:b]


def main():
    kokoro = Kokoro(sys.argv[1], sys.argv[2])
    texts = story_chunks()
    texts += [number_words(n) for n in range(60)]
    texts += ["oh", "o'clock", "A.M.", "P.M.", "hour", "hours", "minute", "minutes", "and"]
    os.makedirs(OUT, exist_ok=True)
    manifest, seen = {}, set()
    for i, text in enumerate(t for t in texts if not (key(t) in seen or seen.add(key(t)))):
        samples, sr = kokoro.create(text, voice=VOICE, speed=SPEED, lang="en-us")
        x = trim(np.asarray(samples, dtype=np.float32), sr)
        name = f"o{i:03d}.mp3"
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            sf.write(tmp.name, x, sr)
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", tmp.name, "-ac", "1", "-b:a", "64k",
                        os.path.join(OUT, name)], check=True)
        os.remove(tmp.name)
        manifest[key(text)] = name
        print(name, round(len(x) / sr, 2), "s", repr(text))
    with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump({"voice": f"Kokoro {VOICE}", "clips": manifest}, f, indent=1, ensure_ascii=False)


main()
