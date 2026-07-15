#!/usr/bin/env python3
"""
Populate CHARP with real artist/album data via the Deezer public API (no key, no scraping).

For each artist name:
  - search artist  -> id, name, picture_xl  (artist photo)
  - top tracks     -> tally albums by frequency = most popular albums
  - album details  -> year, genre, track count, cover_xl

Downloads images into images/ and writes a manifest JSON we turn into data.js entries.

Usage:
  python tools/fetch_music.py --n 3 "Kanye West" "Men I Trust" "death's dynamic shroud"
  python tools/fetch_music.py --n 3 --file tools/artists.txt --out tools/manifest.json
"""
import argparse, json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "images")
UA = "CHARP-mockup/1.0 (personal prototype)"

def slug(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

def album_slug(title):
    # drop parenthetical/bracket qualifiers, then alnum-only, cap length
    t = re.sub(r'[\(\[].*?[\)\]]', '', title)
    return slug(t)[:22] or slug(title)[:22]

def get(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.load(r)
        except Exception as e:
            if i == tries - 1:
                print(f"    ! request failed: {e}", file=sys.stderr)
                return None
            time.sleep(1.0)

def download(url, path, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
            if len(data) < 1500:   # Deezer placeholder / empty
                return False
            with open(path, "wb") as f:
                f.write(data)
            return True
        except Exception:
            if i == tries - 1:
                return False
            time.sleep(1.0)

def norm_title(t):
    # collapse deluxe/remaster/edition variants so we don't pick the same album twice
    t = re.sub(r'[\(\[].*?[\)\]]', '', t)
    t = re.sub(r'\b(deluxe|remaster(ed)?|edition|version|expanded|anniversary|bonus).*$', '', t, flags=re.I)
    return re.sub(r'\s+', ' ', t).strip().lower()

def fetch_artist(name, n_albums, delay, force_id=None, display=None):
    print(f"→ {name}")
    if force_id:
        a = get(f"https://api.deezer.com/artist/{force_id}")
        if not a or a.get("error"):
            print("    ! bad forced id"); return None
    else:
        s = get("https://api.deezer.com/search/artist?limit=1&q=" + urllib.parse.quote(name))
        if not s or not s.get("data"):
            print("    ! no artist match"); return None
        a = s["data"][0]
    aid, pic = a["id"], a.get("picture_xl")
    aname = display or a["name"]     # keep the screenshot's spelling when we override
    aslug = slug(aname)
    artist_img = None
    if pic:
        p = os.path.join(IMG_DIR, f"artist-{aslug}.jpg")
        if download(pic, p):
            artist_img = f"images/artist-{aslug}.jpg"
    print(f"    matched: {a['name']}  (id {aid})  photo={'ok' if artist_img else 'MISSING'}")
    time.sleep(delay)

    # most popular albums via top-track frequency
    top = get(f"https://api.deezer.com/artist/{aid}/top?limit=50")
    tally = {}
    order = []
    for tr in (top or {}).get("data", []):
        al = tr.get("album") or {}
        alid = al.get("id")
        if not alid: continue
        if alid not in tally:
            tally[alid] = {"count": 0, "title": al.get("title", ""), "cover": al.get("cover_xl")}
            order.append(alid)
        tally[alid]["count"] += 1
    ranked = sorted(order, key=lambda i: -tally[i]["count"])

    # fall back to discography if top tracks were sparse
    if len(ranked) < n_albums:
        disc = get(f"https://api.deezer.com/artist/{aid}/albums?limit=100")
        for al in (disc or {}).get("data", []):
            if al.get("record_type") != "album": continue
            alid = al["id"]
            if alid not in tally:
                tally[alid] = {"count": 0, "title": al.get("title",""), "cover": al.get("cover_xl")}
                ranked.append(alid)

    albums, seen_titles = [], set()
    for alid in ranked:
        if len(albums) >= n_albums: break
        nt = norm_title(tally[alid]["title"])
        if nt in seen_titles: continue
        det = get(f"https://api.deezer.com/album/{alid}")
        time.sleep(delay)
        if not det or det.get("error"): continue
        title = det.get("title", tally[alid]["title"])
        cover = det.get("cover_xl") or tally[alid]["cover"]
        year = (det.get("release_date") or "")[:4]
        genre = ""
        gl = (det.get("genres") or {}).get("data") or []
        if gl: genre = gl[0].get("name", "")
        tracks = det.get("nb_tracks")
        aslg = album_slug(title)
        img_rel = None
        if cover:
            fp = os.path.join(IMG_DIR, f"album-{aslug}-{aslg}.jpg")
            if download(cover, fp):
                img_rel = f"images/album-{aslug}-{aslg}.jpg"
        if not img_rel:
            print(f"      - skip '{title}' (no cover)"); continue
        seen_titles.add(nt)
        albums.append({"album": title, "year": year, "genre": genre,
                       "tracks": tracks, "image": img_rel})
        print(f"      + {title} ({year}) [{genre}] {tracks}tr")

    return {"artist": aname, "artistImg": artist_img, "albums": albums}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("artists", nargs="*")
    ap.add_argument("--file")
    ap.add_argument("--n", type=int, default=3, help="albums per artist")
    ap.add_argument("--delay", type=float, default=0.25)
    ap.add_argument("--ids", nargs="*", default=[], help='force matches: "Display Name=deezerId"')
    ap.add_argument("--out", default=os.path.join(ROOT, "tools", "manifest.json"))
    args = ap.parse_args()

    names = list(args.artists)
    if args.file:
        with open(args.file, encoding="utf-8") as f:
            names += [l.strip() for l in f if l.strip() and not l.startswith("#")]

    os.makedirs(IMG_DIR, exist_ok=True)
    out = []
    for nm in names:
        r = fetch_artist(nm, args.n, args.delay)
        if r: out.append(r)
        time.sleep(args.delay)
    for spec in args.ids:
        disp, _, fid = spec.rpartition("=")
        r = fetch_artist(disp, args.n, args.delay, force_id=fid.strip(), display=disp.strip())
        if r: out.append(r)
        time.sleep(args.delay)

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    tot = sum(len(a["albums"]) for a in out)
    print(f"\n== {len(out)} artists, {tot} albums -> {args.out} ==")

if __name__ == "__main__":
    main()
