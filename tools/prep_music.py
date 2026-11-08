"""Prepares a recorded music track (e.g. from Suno) for the game and registers it.

The game's music is synthesized by default. If assets/music/manifest.json has an
entry for a track id, src/audio.js plays that recording instead. This script turns
any audio file into a game-ready MP3 (silence trimmed, ~-16 LUFS, 128 kbps stereo,
44.1 kHz) at assets/music/<track_id>.mp3 and writes the manifest entry.

usage (needs ffmpeg and ffprobe on PATH; or FFMPEG=path, and optionally FFPROBE=path):
  python tools/prep_music.py <track_id> <input_audio> [--loop-start S] [--loop-end S] [--gain G] [--no-trim]
  python tools/prep_music.py --remove <track_id>

Loop points are in seconds. With no --loop-end, it suggests loopStart 0 and
loopEnd = duration - 2.0 (room for the ending fade); tune them by ear. --remove
deletes the manifest entry only (the mp3 stays), so the track goes back to the synth.
Use only music you may ship commercially (Suno: a paid plan). List it in assets/music/README.md.
"""
import argparse, json, os, shutil, subprocess, sys
from pathlib import Path

TRACKS = ["day", "evening", "wrong", "musicbox", "drone", "hum", "morning", "romance",
          "hearing", "office", "secondterm", "lullaby", "heartbeat"]

PROJ = Path(__file__).resolve().parent.parent
OUT = PROJ / "assets" / "music"
MANIFEST = OUT / "manifest.json"
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")


def ffprobe_path():
    if os.environ.get("FFPROBE"):
        return os.environ["FFPROBE"]
    p = Path(FFMPEG)
    if p.parent != Path("."):  # FFMPEG was given as a path: look beside it
        name = p.name.replace("ffmpeg", "ffprobe") if "ffmpeg" in p.name else "ffprobe"
        return str(p.with_name(name))
    return "ffprobe"


def need(tool):
    if shutil.which(tool) is None:
        sys.exit(f"error: '{tool}' not found. Install ffmpeg (includes ffprobe) and put it on PATH, "
                 f"or set FFMPEG=/path/to/ffmpeg (and FFPROBE if it is elsewhere).")


def load_manifest():
    if MANIFEST.exists():
        try:
            data = json.loads(MANIFEST.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            sys.exit(f"error: {MANIFEST} is not valid JSON ({e})")
    else:
        data = {}
    if not isinstance(data.get("tracks"), dict):
        data["tracks"] = {}
    return data


def save_manifest(data):
    OUT.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def duration_of(path):
    probe = ffprobe_path()
    need(probe)
    r = subprocess.run([probe, "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", str(path)], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        sys.exit(f"error: ffprobe could not read the duration of {path}\n{r.stderr}")


def main():
    ap = argparse.ArgumentParser(description="Prepare a recorded music track for the game.")
    ap.add_argument("track_id", nargs="?", help="one of: " + ", ".join(TRACKS))
    ap.add_argument("input", nargs="?", help="source audio file (mp3, wav, flac, ...)")
    ap.add_argument("--loop-start", type=float, help="loop start in seconds")
    ap.add_argument("--loop-end", type=float, help="loop end in seconds (default: suggests duration - 2.0)")
    ap.add_argument("--gain", type=float, help="extra gain multiplier stored in the manifest (e.g. 0.8)")
    ap.add_argument("--no-trim", action="store_true", help="do not trim leading/trailing silence")
    ap.add_argument("--remove", metavar="TRACK_ID", help="remove a track's manifest entry (keeps the mp3)")
    a = ap.parse_args()

    if a.remove:
        if a.remove not in TRACKS:
            sys.exit(f"error: unknown track id '{a.remove}'. Valid: {', '.join(TRACKS)}")
        data = load_manifest()
        if data["tracks"].pop(a.remove, None) is None:
            print(f"No manifest entry for '{a.remove}'; nothing to do.")
        else:
            save_manifest(data)
            print(f"Removed '{a.remove}' from {MANIFEST}. It will use the synth again.")
        return

    if not a.track_id or not a.input:
        ap.error("track_id and input_audio are required (or use --remove <track_id>)")
    if a.track_id not in TRACKS:
        sys.exit(f"error: unknown track id '{a.track_id}'. Valid: {', '.join(TRACKS)}")
    src = Path(a.input)
    if not src.is_file():
        sys.exit(f"error: input file not found: {src}")
    if a.gain is not None and a.gain <= 0:
        sys.exit("error: --gain must be greater than 0")
    need(FFMPEG)

    OUT.mkdir(parents=True, exist_ok=True)
    dst = OUT / f"{a.track_id}.mp3"
    filters = []
    if not a.no_trim:
        # strip leading silence, then reverse / strip / reverse to strip the tail
        sr = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.1"
        filters.append(f"{sr},areverse,{sr},areverse")
    filters.append("loudnorm=I=-16:TP=-1.5:LRA=11")
    cmd = [FFMPEG, "-y", "-v", "error", "-i", str(src), "-vn", "-af", ",".join(filters),
           "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "128k", str(dst)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0 or not dst.exists():
        sys.exit(f"error: ffmpeg failed\n{r.stderr}")

    dur = duration_of(dst)
    entry = {"file": dst.name}
    if a.gain is not None:
        entry["gain"] = round(a.gain, 2)

    start, end, suggested = a.loop_start, a.loop_end, False
    if end is None:
        end = round(dur - 2.0, 2)
        if start is None:
            start = 0.0
        suggested = True
    elif start is None:
        start = 0.0
    if 0 <= start < end <= dur:
        entry["loopStart"] = round(start, 2)
        entry["loopEnd"] = round(end, 2)
    else:
        print(f"warning: loop points {start}..{end} are not valid for a {dur:.2f}s track; "
              f"loopStart/loopEnd not written (whole file will loop).", file=sys.stderr)
        suggested = False

    data = load_manifest()
    data["tracks"][a.track_id] = entry
    save_manifest(data)

    print(f"Output:   {dst}")
    print(f"Size:     {dst.stat().st_size / 1024:.0f} KB")
    print(f"Duration: {dur:.2f} s")
    print(f"Manifest: {a.track_id} = {json.dumps(entry)}")
    if suggested:
        print("Note: loop points were suggested (start 0, end = duration - 2.0). "
              "Tune loopStart/loopEnd by ear in the manifest.")


if __name__ == "__main__":
    main()
