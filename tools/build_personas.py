#!/usr/bin/env python3
"""
Build personas.js from the CSVs in personas/.

  personas/personas.csv     identity + aesthetic tokens, one row per persona
  personas/taste/<id>.csv   artist,album,track,rank

For every taste row we ask the Deezer public API (no key, no scraping) for the
artist and the album, and keep the **CDN image URL** rather than downloading the
file — see ARTWORK_AT_SCALE.md. Four personas' worth of covers would otherwise
add hundreds of images to the repo, and the whole point of the coming Dropbox
move is to keep them out of it.

  python tools/build_personas.py            # all personas
  python tools/build_personas.py eric kpop  # just these

Writes personas.js at the repo root. Responses are cached in
tools/.persona_cache.json so a re-run is instant and offline-friendly; delete it
to force a refetch.
"""
import csv, json, os, re, sys, time, urllib.parse, urllib.request

# Album/artist names are full of non-latin-1 characters (and the Windows console
# defaults to cp1252), so force the stream instead of mangling the data.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDIR = os.path.join(ROOT, "personas")
CACHE_PATH = os.path.join(ROOT, "tools", ".persona_cache.json")
UA = "Spindeck-mockup/1.0 (personal prototype)"
OUT = os.path.join(ROOT, "personas.js")

CACHE = {}
if os.path.exists(CACHE_PATH):
    try:
        CACHE = json.load(open(CACHE_PATH, encoding="utf-8"))
    except Exception:
        CACHE = {}


def save_cache():
    json.dump(CACHE, open(CACHE_PATH, "w", encoding="utf-8"), ensure_ascii=False)


def get(url, tries=3):
    """GET + parse JSON, memoised. Deezer allows ~50 req/5s; we sleep between misses."""
    if url in CACHE:
        return CACHE[url]
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=20) as r:
                data = json.load(r)
            CACHE[url] = data
            time.sleep(0.12)
            return data
        except Exception as e:
            if i == tries - 1:
                print(f"    ! {e}", file=sys.stderr)
                return None
            time.sleep(1.0)


def q(s):
    return urllib.parse.quote(str(s))


def norm(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


# ── Deezer lookups ────────────────────────────────────────────────────────
def find_artist(name):
    """Resolve one Deezer artist.

    Short group names collide badly — Deezer lists several acts called "Ive",
    "BTS", "f(x)" and "Itzy", and search order does NOT put the famous one
    first. So: take the exact-name matches and keep the one with the most fans;
    that is reliably the act people mean. Punctuation-heavy names ("(G)I-DLE")
    get a second pass with the punctuation stripped.

    ESCAPE HATCH: write the artist in the CSV as `Name#<deezer artist id>` to
    skip the search entirely. Most-fans is the right default but it is still a
    guess, and some acts lose it — Deezer carries two "bsd.u" entries and the
    popular one holds a single album while the bracketed `[bsd.u]` has the whole
    lo-fi catalogue. Find the id with search/artist and pin it.
    """
    m = re.match(r"^(.*?)\s*#(\d+)$", name)
    if m:
        art = get(f"https://api.deezer.com/artist/{m.group(2)}")
        if art and art.get("id"):
            return art
        print(f"    -- pinned id {m.group(2)} not found, falling back to search")
        name = m.group(1)

    cands = []
    for query in (name, re.sub(r"[^\w\s-]", " ", name).strip()):
        r = get(f"https://api.deezer.com/search/artist?limit=25&q={q(query)}")
        cands += (r or {}).get("data", [])
        if cands:
            break
    if not cands:
        return None
    exact = [a for a in cands if norm(a.get("name")) == norm(name)]
    pool = exact or cands
    return max(pool, key=lambda a: a.get("nb_fan") or 0)


# Compilations, karaoke and tribute records dominate Deezer search for legacy
# acts. A persona's shelf should hold the ALBUMS, so these are filtered out.
JUNK = re.compile(
    r"\b(very best|greatest hits|the best of|best of|essential|collection|anthology|"
    r"compilation|complete|tribute|karaoke|covers?|remixes?|remixed|instrumental|"
    r"live at|live in|in concert|unplugged|soundtrack|originally performed)\b", re.I)


def artist_albums(artist_id):
    """The artist's OWN album list — searching globally pulls in cover bands."""
    r = get(f"https://api.deezer.com/artist/{artist_id}/albums?limit=200")
    out = []
    for a in (r or {}).get("data", []):
        title = (a.get("title") or "").strip()
        # d0llywood1 has a release titled entirely in invisible unicode
        if not re.search(r"[A-Za-z0-9ㄱ-힝一-鿿]", title):
            continue
        out.append(a)
    return out


def pick_album(artist_id, artist_name, want_title):
    """Resolve one album id for this artist. Named title wins; else their
    most-played real album, judged by how often it shows up in their top tracks."""
    albums = artist_albums(artist_id)
    if want_title:
        w = norm(want_title)
        # exact → startswith (catches "Rumours (2004 Remaster)") → contains
        for test in (lambda t: t == w, lambda t: t.startswith(w) or w.startswith(t), lambda t: w in t or t in w):
            for a in albums:
                if test(norm(a.get("title"))):
                    return a["id"]
        # Not in their catalogue (Deezer regional gaps) — fall back to a global
        # search, but only accept a hit whose ARTIST actually matches.
        r = get(f"https://api.deezer.com/search/album?limit=15&q={q(artist_name + ' ' + want_title)}")
        for a in (r or {}).get("data", []):
            if norm((a.get("artist") or {}).get("name")) == norm(artist_name) \
               and norm(want_title) in norm(a.get("title")):
                return a["id"]
        return None

    ok = {a["id"]: a for a in albums
          if a.get("record_type") == "album" and not JUNK.search(a.get("title") or "")}
    if not ok:
        ok = {a["id"]: a for a in albums if not JUNK.search(a.get("title") or "")}
    if not ok:
        return None

    top = get(f"https://api.deezer.com/artist/{artist_id}/top?limit=50")
    tally = {}
    for t in (top or {}).get("data", []):
        aid = ((t.get("album") or {}).get("id"))
        if aid in ok:
            tally[aid] = tally.get(aid, 0) + 1
    if tally:
        return max(tally, key=tally.get)
    # No usable top tracks (happens for artists with regional gaps) — take their
    # earliest LP, which for a legacy act is the one people mean.
    return sorted(ok.values(), key=lambda a: a.get("release_date") or "9999")[0]["id"]


# ── Fictional review data ────────────────────────────────────────────────
# Same shape and voice as the hand-authored ARCHIVE entries in data.js, so a
# persona album renders identically to a built-in one. Everything is seeded off
# the album title, so a rebuild produces the SAME numbers — no churn in git.
GEN = {"Rap/Hip Hop": "Hip-Hop", "Electro": "Electronic", "Alternative": "Alternative",
       "Pop": "Pop", "Rock": "Rock", "Films/Games": "Soundtrack", "Classical": "Classical",
       "R&B": "R&B", "Dance": "Electronic", "Folk": "Folk", "Reggae": "Reggae",
       "Country": "Country", "Jazz": "Jazz", "Metal": "Metal", "Blues": "Blues",
       "Soul & Funk": "Soul", "Asian Music": "K-Pop", "": "Alternative"}

POOL = [
    "the kind of record you finish and immediately restart",
    "front to back, not a single skip on this one",
    "i was not emotionally prepared for the back half",
    "production is immaculate, lyrics cut deeper every listen",
    "grew on me. first listen confused me, tenth listen floored me",
    "this is the one i put on when i want to feel something",
    "genuinely reshaped what i thought this genre could do",
    "overrated by half a star but still a great time",
    "the sequencing alone deserves an award",
    "sounds like a memory i haven't had yet",
    "perfect headphones album, sounds thin on speakers though",
    "everyone talks about the singles, the deep cuts are the real thing",
    "criminally short. i wanted twenty more minutes",
    "a mood more than an album, and that's a compliment",
    "played this on a night drive and understood it completely",
    "the mixing is doing so much heavy lifting here",
    "not their best but their most honest",
    "i've recommended this to six people and lost two friends",
    "every song earns its place, which is rarer than it should be",
    "the closer justifies the entire tracklist",
]
NAMES = [("echoplex", "EP"), ("staticfog", "SF"), ("velvetblast", "VB"),
         ("noisegate", "NG"), ("dustpan", "DP"), ("kira.wav", "KW"), ("vxblank", "VX")]
GRADS = ["linear-gradient(135deg,#e05a6b,#8a2f52)", "linear-gradient(135deg,#2f7fe0,#1c3f8a)",
         "linear-gradient(135deg,#3fae7a,#1d6b4a)", "linear-gradient(135deg,#b06ae0,#5f2f8a)",
         "linear-gradient(135deg,#e0a53f,#8a5f1d)", "linear-gradient(135deg,#e05aa8,#8a2f6b)",
         "linear-gradient(135deg,#4fc3d0,#1d6b7a)"]


def seed(*parts):
    h = 0
    for p in parts:
        for ch in str(p):
            h = (h * 131 + ord(ch)) & 0x7FFFFFFF
    return h


def fake_reviews(title, rating):
    idxs, used = [], set()
    for i in range(12):
        k = seed(title, i) % len(POOL)
        if k not in used:
            used.add(k); idxs.append(k)
        if len(idxs) == 3:
            break
    while len(idxs) < 3:
        idxs.append((idxs[-1] + 1) % len(POOL))
    out = []
    for k, pi in enumerate(idxs):
        u = seed(title, "u", k) % len(NAMES)
        rr = ([5, 4.5, 4] if rating >= 4.4 else [4.5, 4, 4])[k]
        out.append({"name": NAMES[u][0], "init": NAMES[u][1], "grad": GRADS[u],
                    "rating": rr, "text": POOL[pi]})
    return out


def album_detail(album_id):
    a = get(f"https://api.deezer.com/album/{album_id}")
    if not a or a.get("error"):
        return None
    title = a.get("title") or ""
    raw_genre = ((a.get("genres") or {}).get("data") or [{}])[0].get("name", "")
    try:
        year = int((a.get("release_date") or "")[:4])
    except ValueError:
        year = 0
    rating = round(3.8 + (seed(a.get("artist", {}).get("name"), title) % 11) * 0.1, 1)
    return {
        "album": title,
        "artist": (a.get("artist") or {}).get("name"),
        "year": year,
        "genre": GEN.get(raw_genre, raw_genre or "Alternative"),
        "tracks": a.get("nb_tracks") or 10,
        "image": a.get("cover_xl") or a.get("cover_big") or "",
        "rating": rating,
        "reviewCount": 4000 + (seed(title, "rc") % 86) * 1000,
        "reviews": fake_reviews(title, rating),
        "deezerId": a.get("id"),
        # The ARTIST id, not just the album's. app.js seeds its runtime
        # recommendation pool off `artist/<id>/radio`, and looking each one up
        # by name at load time would be an extra network round trip per seed.
        "artistId": (a.get("artist") or {}).get("id"),
    }


# ── CSV loading ───────────────────────────────────────────────────────────
def read_csv(path):
    """Rows as dicts. Lines whose first cell starts with '#' are comments."""
    with open(path, encoding="utf-8-sig", newline="") as f:
        rows = []
        for row in csv.DictReader(f):
            first = (row.get("artist") or row.get("id") or "").strip()
            if not first or first.startswith("#"):
                continue
            rows.append({k: (v.strip() if isinstance(v, str) else v) for k, v in row.items()})
        return rows


def build_persona(meta):
    pid = meta["id"]
    taste_path = os.path.join(PDIR, "taste", f"{pid}.csv")
    if not os.path.exists(taste_path):
        print(f"  ! no taste file: {taste_path}")
        return None
    rows = read_csv(taste_path)
    rows.sort(key=lambda r: int(r["rank"]) if (r.get("rank") or "").isdigit() else 9999)
    print(f"  {pid}: {len(rows)} rows")

    albums, artist_img, seen = [], {}, set()
    for r in rows:
        name = r["artist"]
        art = find_artist(name)
        if not art:
            print(f"    -- no artist: {name}")
            continue
        if art.get("picture_xl"):
            artist_img[art["name"]] = art["picture_xl"]

        alb_id = pick_album(art["id"], art["name"], r.get("album"))
        if not alb_id:
            print(f"    -- no album:  {name}")
            continue
        det = album_detail(alb_id)
        if not det or not det["image"]:
            print(f"    -- no detail: {name}")
            continue
        # Guard against a cover band / tribute act sneaking through the search
        # fallback ("The Beatles Complete On Ukulele" outranked The Beatles).
        if norm(det["artist"]) != norm(art["name"]):
            print(f"    -- artist mismatch: asked {art['name']}, got {det['artist']}")
            continue
        key = (norm(det["artist"]), norm(det["album"]))
        if key in seen:
            continue
        seen.add(key)
        # The artist NAME on the album is Deezer's, which can differ from the CSV
        # ("Charli xcx" vs "Charli XCX"); keep Deezer's so it matches the photo map.
        det["favTrack"] = r.get("track") or ""
        albums.append(det)
        print(f"    ok {det['artist']} — {det['album']} ({det['year'] or '????'})")

    return {
        "id": pid,
        "profile": {
            "name": meta["name"], "handle": meta["handle"], "bio": meta["bio"],
            "location": meta["location"], "occupation": meta["occupation"],
            "since": meta["since"],
            "followers": int(meta["followers"]), "following": int(meta["following"]),
            "reviews": int(meta["reviews"]), "playlists": int(meta["playlists"]),
        },
        # Two token sets, not one. The viewer shows a Dark and a Light variant
        # side by side, so a persona that declared a single background painted
        # both the same and the pair stopped being a comparison.
        "skin": {
            "font": meta["font"], "radius": meta["radius"],
            "dark":  {"accent": meta["accentD"], "bg": meta["bgD"], "ink": meta["inkD"],
                      "ink2": meta["ink2D"], "card": meta["cardD"]},
            "light": {"accent": meta["accentL"], "bg": meta["bgL"], "ink": meta["inkL"],
                      "ink2": meta["ink2L"], "card": meta["cardL"]},
        },
        "albums": albums,
        "artistImg": artist_img,
    }


def main():
    wanted = [a for a in sys.argv[1:] if not a.startswith("-")]
    metas = read_csv(os.path.join(PDIR, "personas.csv"))
    if wanted:
        metas = [m for m in metas if m["id"] in wanted]
    if not metas:
        print("no personas matched"); return 1

    out = []
    for m in metas:
        p = build_persona(m)
        if p:
            out.append(p)
    save_cache()

    # Merge with any personas we did not rebuild this run, so a single-persona
    # run does not drop the others out of personas.js.
    existing = {}
    if os.path.exists(OUT) and wanted:
        txt = open(OUT, encoding="utf-8").read()
        m = re.search(r"window\.PERSONAS\s*=\s*(\[.*\]);", txt, re.S)
        if m:
            try:
                for p in json.loads(m.group(1)):
                    existing[p["id"]] = p
            except Exception:
                pass
    for p in out:
        existing[p["id"]] = p
    order = [m["id"] for m in read_csv(os.path.join(PDIR, "personas.csv"))]
    final = [existing[i] for i in order if i in existing]

    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("/* GENERATED by tools/build_personas.py — do not hand-edit.\n")
        f.write("   Source of truth: personas/personas.csv + personas/taste/*.csv\n")
        f.write("   Images are Deezer CDN URLs, not local files (ARTWORK_AT_SCALE.md). */\n")
        f.write("window.PERSONAS = " + json.dumps(final, ensure_ascii=False, indent=1) + ";\n")
    print(f"\nwrote {OUT}: {len(final)} personas, "
          f"{sum(len(p['albums']) for p in final)} albums")
    return 0


if __name__ == "__main__":
    sys.exit(main())
