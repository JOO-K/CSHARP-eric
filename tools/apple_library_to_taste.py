#!/usr/bin/env python3
"""
Turn an Apple Music library export into a persona taste CSV.

  python tools/apple_library_to_taste.py --json "<Apple Music Library Tracks.json>" --id thomas

Apple's data request ("Apple_Media_Services") ships several files. Two are useful
here, and they are NOT equal:

  Library Tracks.json    ← USE THIS. One row per track, with Artist, Album,
                           Genre, Year and **Track Play Count**. Everything the
                           persona needs, no network calls, real listening.
  Library Albums.json    Album titles + Apple catalog ids only — no artist name
                           and no play counts. Fallback: the ids get resolved
                           through the iTunes Lookup API and the ranking falls
                           back to *date added*, which is a much weaker signal.

  (Library Activity.json is the library EDIT log — addItems transactions, not
  plays. Nothing to rank by; ignored.)

The script detects which file it was handed and picks the matching path.

Ranking, tracks mode: total plays per album, max `--per-artist` albums per
artist so one favourite can't eat the list, obvious compilations dropped (see
COMPILATION), and the album's own most-played song goes in the `track` column —
that's what the profile's Favourite-songs rows use.

Plays are LIFETIME, so on their own they describe someone's teens as much as
their present. Two flags narrow it to who they are now:

  --since 2025-01-01   only albums still in rotation. The export has no
                       "last played" date; the proxy is the later of the last
                       SKIP (which only happens while listening) and the date
                       added.
  --min-year 2019      only records released since then.

Thomas's persona is built with both — without them his list is Kanye's Late
Registration and Common's Be, which he last touched years ago.

Output is `personas/taste/<id>.csv`, the hand-maintained file. Read it, cut what
doesn't belong, then run `tools/build_personas.py <id>` to resolve artwork and
metadata against Deezer.
"""
import argparse, csv, json, os, re, sys, time, urllib.request
from collections import defaultdict, Counter

for _s in (sys.stdout, sys.stderr):          # Windows console is cp1252; the data is not
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_PATH = os.path.join(ROOT, "tools", ".apple_cache.json")
UA = "Spindeck-mockup/1.0 (personal prototype)"

SKIP_SINGLE = re.compile(r"\s-\s Single$".replace(" ", ""), re.I)
# EPs stay — they're a real part of what someone is currently on — but Deezer
# lists them without Apple's suffix, so it comes off the title.
EP_SUFFIX = re.compile(r"\s-\sEP$", re.I)
# Artists Deezer files under a different name than Apple does. Regenerating the
# CSV overwrites hand-fixes, so corrections belong HERE, not in the CSV.
#  - Korean acts are usually under their Korean name (검정치마, not The Black Skirts)
#  - collab billings ("X & Y") are usually filed under the lead artist alone
ALIASES = {
    "the black skirts": "검정치마",
    "boldy james & harry fraud": "Boldy James",
    "freddie gibbs & madlib": "Freddie Gibbs",
}
# A review app wants records, not repackages. Logged when dropped so they can be
# put back by hand — a Greatest Hits can be someone's actual favourite object.
COMPILATION = re.compile(
    r"greatest hits|\bbest of\b|\bthe best\b|essential|anthology|collection|"
    r"soundtrack|\bost\b|\bmixtape\b(?!\s)|now that's what", re.I)

CACHE = {}
if os.path.exists(CACHE_PATH):
    try:
        CACHE = json.load(open(CACHE_PATH, encoding="utf-8"))
    except Exception:
        CACHE = {}


def load(path):
    if os.path.isdir(path):                  # the export unzips to a folder of the same name
        path = os.path.join(path, os.path.basename(path))
    return json.load(open(path, encoding="utf-8"))


# ── tracks mode — real play counts, no network ────────────────────────────────
def from_tracks(rows, args):
    albums = {}
    for t in rows:
        if t.get("Content Type") not in (None, "Song"):
            continue
        artist = (t.get("Album Artist") or t.get("Artist") or "").strip()
        album = (t.get("Album") or "").strip()
        if not artist or not album or SKIP_SINGLE.search(album):
            continue
        album = EP_SUFFIX.sub("", album)      # Deezer lists these without the suffix
        a = albums.setdefault((artist.lower(), album.lower()), {
            "artist": artist, "album": album, "plays": 0, "tracks": 0,
            "genres": Counter(), "year": 0, "touch": "",
            "top": ("", -1), "on_album": t.get("Track Count On Album") or 0,
        })
        plays = t.get("Track Play Count") or 0
        a["plays"] += plays
        a["tracks"] += 1
        a["year"] = max(a["year"], t.get("Track Year") or 0)
        if t.get("Genre"):
            a["genres"][t["Genre"]] += 1
        if plays > a["top"][1]:
            a["top"] = ((t.get("Title") or "").strip(), plays)
        # The export has no "last played" date. The closest thing is the last
        # SKIP — a skip only happens while listening — and the date it was added.
        # Whichever is later is the best "were they still on this?" signal here.
        for f in ("Date of Last Skip", "Date Added To Library"):
            v = (t.get(f) or "")[:10]
            if v > a["touch"]:
                a["touch"] = v

    pool = [a for a in albums.values()
            if a["plays"] > 0 and max(a["tracks"], a["on_album"]) >= args.min_tracks]
    print("albums in library: %d — with plays and long enough: %d"
          % (len(albums), len(pool)))
    if args.since:
        pool = [a for a in pool if a["touch"] >= args.since]
        print("  still in rotation since %s: %d" % (args.since, len(pool)))
    if args.min_year:
        pool = [a for a in pool if a["year"] >= args.min_year]
        print("  released %d or later: %d" % (args.min_year, len(pool)))

    comps = [a for a in pool if COMPILATION.search(a["album"])]
    if comps:
        print("dropped as compilations (add back by hand if wanted):")
        for a in sorted(comps, key=lambda r: -r["plays"])[:8]:
            print("   %5d  %s — %s" % (a["plays"], a["artist"], a["album"]))
    pool = [a for a in pool if not COMPILATION.search(a["album"])]

    pool.sort(key=lambda r: -r["plays"])
    picked, per_artist = [], defaultdict(int)
    for a in pool:
        if per_artist[a["artist"].lower()] >= args.per_artist:
            continue
        per_artist[a["artist"].lower()] += 1
        picked.append(a)
        if len(picked) >= args.n:
            break
    return picked


# ── albums mode — no artists, no plays; resolve ids, rank by date added ───────
def lookup(ids):
    missing = [i for i in ids if i not in CACHE]
    if missing:
        url = ("https://itunes.apple.com/lookup?id=" + ",".join(missing)
               + "&entity=album&limit=200")
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=25) as r:
                data = json.load(r)
        except Exception as e:
            print("  lookup failed (%s) — skipping batch" % e)
            data = {"results": []}
        found = {}
        for rec in data.get("results", []):
            if rec.get("wrapperType") == "collection":
                found[str(rec.get("collectionId"))] = rec
        for i in missing:
            CACHE[i] = found.get(i)          # None is a cached miss, not a retry
        time.sleep(0.2)
    return {i: CACHE.get(i) for i in ids}


def from_albums(rows, args):
    print("NOTE: this export has no artist names and no play counts — resolving\n"
          "      catalog ids via iTunes and ranking by DATE ADDED. Ask for\n"
          "      'Apple Music Library Tracks.json' instead if you can.")
    pool = []
    for r in rows:
        cid, title = r.get("Catalog Identifiers - Album"), (r.get("Title") or "").strip()
        if not cid or not r.get("Visible") or not title or SKIP_SINGLE.search(title):
            continue
        pool.append({"cid": str(cid), "added": r.get("Date Created In Library") or ""})

    resolved, seen_cid = [], set()
    for i in range(0, len(pool), 100):
        batch = [p for p in pool[i:i + 100] if p["cid"] not in seen_cid]
        seen_cid.update(p["cid"] for p in batch)
        recs = lookup([p["cid"] for p in batch])
        for p in batch:
            rec = recs.get(p["cid"])
            if not rec or rec.get("trackCount", 0) < args.min_tracks:
                continue
            resolved.append({"artist": rec.get("artistName", ""),
                             "album": rec.get("collectionName", ""),
                             "plays": 0, "top": ("", 0), "added": p["added"]})
        json.dump(CACHE, open(CACHE_PATH, "w", encoding="utf-8"), ensure_ascii=False)
        print("  resolved %d/%d" % (min(i + 100, len(pool)), len(pool)))

    resolved.sort(key=lambda r: r["added"], reverse=True)
    dedup, per_artist, seen = [], defaultdict(int), set()
    for r in resolved:
        key = (r["artist"].lower(), re.sub(r"\s*\(.*?\)\s*$", "", r["album"]).lower())
        if key in seen or per_artist[r["artist"].lower()] >= args.per_artist:
            continue
        seen.add(key)
        per_artist[r["artist"].lower()] += 1
        dedup.append(r)

    # 60% newest, 40% swept evenly across everything older, so the list reads as
    # a history rather than only the last few months of saving.
    n_recent = min(len(dedup), int(args.n * 0.6))
    picked, older = dedup[:n_recent], dedup[n_recent:]
    want = args.n - len(picked)
    if older and want > 0:
        picked += older[::max(1, len(older) // want)][:want]
    return picked


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", required=True, help="Library Tracks.json (preferred) or Library Albums.json")
    ap.add_argument("--id", required=True, help="persona id, e.g. thomas")
    ap.add_argument("--n", type=int, default=28)
    ap.add_argument("--per-artist", type=int, default=2)
    ap.add_argument("--since", default="",
                    help="only albums still in rotation since this date, e.g. 2025-01-01 "
                         "(tracks mode only — uses last-skip / date-added)")
    ap.add_argument("--min-year", type=int, default=0,
                    help="only albums released this year or later (tracks mode only)")
    ap.add_argument("--min-tracks", type=int, default=5,
                    help="drop short releases the title didn't flag as an EP")
    args = ap.parse_args()

    rows = load(args.json)
    print("rows: %d" % len(rows))
    tracks_mode = any("Track Play Count" in r for r in rows[:50])
    picked = (from_tracks if tracks_mode else from_albums)(rows, args)

    out = os.path.join(ROOT, "personas", "taste", args.id + ".csv")
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["artist", "album", "track", "rank"])
        for i, r in enumerate(picked, 1):
            w.writerow([ALIASES.get(r["artist"].lower(), r["artist"]),
                        r["album"], r["top"][0], i])
    print("\nwrote %s (%d albums)" % (out, len(picked)))
    for r in picked:
        print("  %6s  %s  %-24s %-32s %s"
              % (r["plays"] or "", r.get("touch", "") or "          ",
                 r["artist"][:24], r["album"][:32], r["top"][0][:24]))


if __name__ == "__main__":
    main()
