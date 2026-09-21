import urllib.request, urllib.parse, re, os, pathlib, sys, json

ROOT = pathlib.Path("c:/Users/admin/dating-sim")
OUT = ROOT / "assets/images/portraits"
OUT.mkdir(parents=True, exist_ok=True)

def get(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    return urllib.request.urlopen(req, timeout=timeout)

# --- Search OpenGameArt ---
print("=== OpenGameArt ===")
for query in ["anime character", "anime sprite", "anime girl portrait"]:
    try:
        url = "https://opengameart.org/search?search=" + urllib.parse.quote(query)
        html = get(url).read().decode("utf-8", errors="ignore")
        # Find content links and titles
        items = re.findall(r'href="(/content/\d+[^"]*)"[^>]*>([^<]+)', html)
        if not items:
            # Try alternate pattern
            items = re.findall(r'<a href="(/content/\d+[^"]*)"[^>]*>([^<]+)</a>', html)
        print(f"\nQuery '{query}': {len(items)} items")
        for link, title in items[:10]:
            print(f"  https://opengameart.org{link} - {title.strip()}")
    except Exception as e:
        print(f"Query '{query}' failed: {e}")

# --- Try direct download from known free sources ---
# OpenGameArt has a direct download pattern
print("\n=== Trying direct asset downloads ===")

# Known free anime assets on OGA (try these IDs)
oga_ids = [46850, 47181, 49136, 51234, 48291, 50123, 45678, 46789, 47890, 48901]
for aid in oga_ids:
    try:
        url = f"https://opengameart.org/content/{aid}"
        html = get(url).read().decode("utf-8", errors="ignore")
        # Find download links
        dl_links = re.findall(r'href="([^"]*\.(?:png|jpg|zip|gif)[^"]*)"', html, re.I)
        title_m = re.search(r'<title>([^<]+)</title>', html)
        title = title_m.group(1).strip() if title_m else f"asset_{aid}"
        print(f"  ID {aid}: {title} - {len(dl_links)} download links")
        for dl in dl_links[:3]:
            print(f"    {dl}")
    except Exception as e:
        print(f"  ID {aid}: failed - {e}")

print("\nDone.")
