"""Generate an image through a local ComfyUI (http://127.0.0.1:8188) with Animagine XL 4.0.
usage: python tools/comfy_gen.py <name> "<prompt tags>" [--w 1216 --h 832 --seed N --n 4]
Outputs go to ../_comfy/out/<name>_<seed>.png (outside the repo)."""
import argparse, json, time, urllib.request, random
from pathlib import Path
OUT = Path(__file__).resolve().parent.parent.parent / "_comfy" / "out"
NEG = ("lowres, bad anatomy, bad hands, text, error, missing finger, extra digits, fewer digits, cropped, worst quality, "
       "low quality, jpeg artifacts, signature, watermark, username, blurry, 3d, realistic, ugly, deformed, extra limbs")
def post(path, data):
    r = urllib.request.Request("http://127.0.0.1:8188" + path, json.dumps(data).encode(), {"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(r))
def main():
    ap = argparse.ArgumentParser(); ap.add_argument("name"); ap.add_argument("prompt")
    ap.add_argument("--w", type=int, default=1216); ap.add_argument("--h", type=int, default=832)
    ap.add_argument("--seed", type=int); ap.add_argument("--n", type=int, default=1)
    a = ap.parse_args(); OUT.mkdir(parents=True, exist_ok=True)
    seed = a.seed if a.seed is not None else random.randint(0, 2**31)
    wf = {"1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "animagine-xl-4.0.safetensors"}},
          "2": {"class_type": "CLIPTextEncode", "inputs": {"text": a.prompt + ", masterpiece, high score, great score, absurdres", "clip": ["1", 1]}},
          "3": {"class_type": "CLIPTextEncode", "inputs": {"text": NEG, "clip": ["1", 1]}},
          "4": {"class_type": "EmptyLatentImage", "inputs": {"width": a.w, "height": a.h, "batch_size": a.n}},
          "5": {"class_type": "KSampler", "inputs": {"model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0],
                "seed": seed, "steps": 28, "cfg": 5.0, "sampler_name": "euler_ancestral", "scheduler": "normal", "denoise": 1.0}},
          "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
          "7": {"class_type": "SaveImage", "inputs": {"images": ["6", 0], "filename_prefix": f"{a.name}_{seed}"}}}
    pid = post("/prompt", {"prompt": wf})["prompt_id"]
    while True:
        h = json.load(urllib.request.urlopen(f"http://127.0.0.1:8188/history/{pid}"))
        if pid in h: break
        time.sleep(2)
    for node in h[pid]["outputs"].values():
        for im in node.get("images", []):
            u = f"http://127.0.0.1:8188/view?filename={im['filename']}&subfolder={im['subfolder']}&type={im['type']}"
            (OUT / im["filename"]).write_bytes(urllib.request.urlopen(u).read()); print(OUT / im["filename"])
main()
