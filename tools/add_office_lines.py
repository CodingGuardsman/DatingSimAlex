"""Records only the Office lines that don't have a clip yet, and appends them to the manifest.

make_office_voice.py re-records everything with kokoro-onnx. This one uses the `kokoro` package
(hexgrad/Kokoro-82M, same af_heart voice) and writes MP3 straight from soundfile, so it needs no ffmpeg.
It reads pa("...") lines from every story file, splits them the same way the game does,
and skips any chunk already in assets/voice/office/manifest.json.

usage (needs: pip install kokoro soundfile):
  python tools/add_office_lines.py
"""
import os, re, json
import numpy as np
import soundfile as sf
from kokoro import KPipeline

VOICE, SPEED = "af_heart", 0.9
PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(PROJ, "assets", "voice", "office")
STORY_FILES = ["story.js", "story_act3.js"]


def key(text):
    """Must match officeKey() in src/audio.js."""
    return re.sub(r"\s+", " ", re.sub(r"^[\s.,;:!?]+|[\s,;:]+$", "", text)).lower()


def story_chunks():
    chunks = []
    for name in STORY_FILES:
        src = open(os.path.join(PROJ, "src", name), encoding="utf-8").read()
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
    path = os.path.join(OUT, "manifest.json")
    manifest = json.load(open(path, encoding="utf-8"))
    clips = manifest["clips"]
    n = max(int(f[1:4]) for f in clips.values()) + 1
    todo, seen = [], set(clips)
    for t in story_chunks():
        if key(t) not in seen:
            seen.add(key(t))
            todo.append(t)
    if not todo:
        print("nothing new to record")
        return
    pipe = KPipeline(lang_code="a")
    for text in todo:
        audio = np.concatenate([np.asarray(a, dtype=np.float32) for _, _, a in pipe(text, voice=VOICE, speed=SPEED)])
        x = trim(audio, 24000)
        name = f"o{n:03d}.mp3"
        sf.write(os.path.join(OUT, name), x, 24000, format="MP3")
        clips[key(text)] = name
        print(name, round(len(x) / 24000, 2), "s", repr(text))
        n += 1
    with open(path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=1, ensure_ascii=False)


main()
