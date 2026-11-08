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
def upload(path):
    import uuid
    b = uuid.uuid4().hex; data = Path(path).read_bytes(); name = Path(path).name
    crlf = chr(13) + chr(10)
    head = crlf.join([f"--{b}", f'Content-Disposition: form-data; name="image"; filename="{name}"', "Content-Type: image/png", "", ""]).encode()
    tail = crlf.join(["", f"--{b}", 'Content-Disposition: form-data; name="overwrite"', "", "true", f"--{b}--", ""]).encode()
    r = urllib.request.Request("http://127.0.0.1:8188/upload/image", head + data + tail, {"Content-Type": f"multipart/form-data; boundary={b}"})
    return json.load(urllib.request.urlopen(r))["name"]
def main():
    ap = argparse.ArgumentParser(); ap.add_argument("name"); ap.add_argument("prompt")
    ap.add_argument("--w", type=int, default=1216); ap.add_argument("--h", type=int, default=832)
    ap.add_argument("--seed", type=int); ap.add_argument("--n", type=int, default=1)
    ap.add_argument("--ref", help="character reference crop in ../_comfy/refs/<ref>.png (IP-Adapter keeps her face, hair and outfit)"); ap.add_argument("--ipw", type=float, default=0.75); ap.add_argument("--end", type=float, default=0.9)
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
    if a.ref:
        wf["3"]["inputs"]["text"] += ", pastel, washed out, flat colors, low contrast, overexposed, faded, white background"
        img = upload(OUT.parent / "refs" / f"{a.ref}.png")
        wf["10"] = {"class_type": "LoadImage", "inputs": {"image": img}}
        wf["11"] = {"class_type": "IPAdapterModelLoader", "inputs": {"ipadapter_file": "ip-adapter-plus_sdxl_vit-h.safetensors"}}
        wf["12"] = {"class_type": "CLIPVisionLoader", "inputs": {"clip_name": "CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors"}}
        wf["13"] = {"class_type": "IPAdapterAdvanced", "inputs": {"model": ["1", 0], "ipadapter": ["11", 0], "image": ["10", 0], "weight": a.ipw, "weight_type": "linear",
                    "combine_embeds": "concat", "start_at": 0.0, "end_at": a.end, "embeds_scaling": "V only", "clip_vision": ["12", 0]}}
        wf["5"]["inputs"]["model"] = ["13", 0]
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
