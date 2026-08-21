#!/usr/bin/env python3
"""
Bake producer / mix / engineer credits into personas.js.

  python tools/fetch_credits.py               # every album missing credits
  python tools/fetch_credits.py eric kpop     # just these personas
  python tools/fetch_credits.py --force       # refetch even where credits exist
  python tools/fetch_credits.py --limit 20    # stop after N lookups (a smoke test)

WHY THIS IS A BUILD STEP AND NOT A RUNTIME FETCH
------------------------------------------------
The app can do this lookup live (`creditsFor` in app.js) but it can't do it
*reliably*. Measured from the page, three identical MusicBrainz requests at 1.5s
spacing returned 200 / 503 / 200, while the same URLs from a script were 200
every time: MusicBrainz load-sheds anonymous cross-origin traffic, and a browser
cannot send the descriptive User-Agent their policy asks for. A script can, and
can pace itself honestly — so the credits ship in personas.js at zero runtime
cost, and the live path stays as a fallback for albums fetched at runtime.

Same shape as build_personas.py: Deezer + MusicBrainz public APIs, no keys, no
scraping, responses cached in tools/.credits_cache.json so a re-run is instant.
Delete that file (or pass --force) to refetch.

WHERE THE DATA COMES FROM
-------------------------
Deezer has NO credits — its `contributors` are performers, role "Main" or
"Featured". What it does have is `upc`, and MusicBrainz indexes releases by
`barcode`, so the two join EXACTLY with no fuzzy title matching:

    deezer album/<deezerId>  ->  upc
    mb release/?query=barcode:<upc>  ->  mbid
    mb release/<mbid>?inc=recordings+artist-rels+recording-level-rels  ->  credits

⚠️ All three `inc` values are required. `recording-level-rels` says WHERE to
apply relationship includes, `artist-rels` says WHICH kind. Drop the latter and
the request still returns 200 with every recording missing its `relations` key,
which is indistinguishable from "this album has no credits".

⚠️ The producers are at RECORDING level, not release level — every release's own
`relations` array tested empty. That is why the heavy `recordings` include
(~100KB per album) is unavoidable.

Coverage is real but partial: 8 of 10 sampled albums had producer credits. The
misses were indie releases; MusicBrainz is volunteer-entered, so smaller acts
are thinner. Albums with nothing get `"credits": []` so a re-run skips them
instead of asking again forever — pass --force to retry those too.
"""
import json, os, re, sys, time, urllib.parse, urllib.request

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "personas.js")
CACHE_PATH = os.path.join(ROOT, "tools", ".credits_cache.json")

# ⚠️ MusicBrainz asks for a descriptive User-Agent with contact info. Sending a
# browser-ish one is what gets anonymous traffic throttled; this is the whole
# reason the build step exists.
UA = "Spindeck-mockup/1.0 ( https://github.com/JOO-K/CSHARP-eric )"
MB = "https://musicbrainz.org/ws/2/"
MB_GAP = 1.1          # their documented ceiling is 1 request/second
DZ_GAP = 0.12

# Roles kept, and the label each becomes in the bento. Order is display order.
ROLES = [("producer", "Produced by"), ("mix", "Mixed by"), ("engineer", "Engineered by")]
MAX_NAMES = 4         # the strip has room for a line, not a liner-notes dump

CACHE = {}
if os.path.exists(CACHE_PATH):
    try:
        CACHE = json.load(open(CACHE_PATH, encoding="utf-8"))
    except Exception:
        CACHE = {}


def save_cache():
    json.dump(CACHE, open(CACHE_PATH, "w", encoding="utf-8"), ensure_ascii=False)


def get(url, gap, tries=4):
    """GET + parse JSON, memoised. Retries 503 (MusicBrainz load-shedding)."""
    if url in CACHE:
        return CACHE[url]
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.load(r)
            CACHE[url] = data
            time.sleep(gap)
            return data
        except urllib.error.HTTPError as e:
            # 503 here means "busy", not "missing" — back off and try again.
            if e.code == 503 and i < tries - 1:
                time.sleep(2.0 * (i + 1))
                continue
            if i == tries - 1:
                print("    ! HTTP %s %s" % (e.code, url), file=sys.stderr)
                return None
            time.sleep(1.5)
        except Exception as e:
            if i == tries - 1:
                print("    ! %s" % e, file=sys.stderr)
                return None
            time.sleep(1.5)
    return None


def deezer_meta(album):
    """-> (upc, label). One cached Deezer call; both fields come from it."""
    did = album.get("deezerId")
    if not did:
        return None, None
    d = get("https://api.deezer.com/album/%s" % did, DZ_GAP)
    if not d:
        return None, None
    return d.get("upc"), (d.get("label") or "").strip() or None


def mb_credits(album, upc):
    """-> list of {'label':…, 'names':[…]}; [] = looked and found nothing;
       None = the request failed, so the caller must NOT record it as 'none'."""
    if upc:
        q = "barcode:%s" % upc
    else:
        # No upc (hand-authored row): fall back to an artist+title search.
        q = 'release:"%s" AND artist:"%s"' % (album.get("album", ""), album.get("artist", ""))
    srch = get(MB + "release/?query=%s&limit=1&fmt=json" % urllib.parse.quote(q), MB_GAP)
    if srch is None:
        return None
    rels = srch.get("releases") or []
    if not rels:
        return []

    full = get(MB + "release/%s?inc=recordings+artist-rels+recording-level-rels&fmt=json"
               % rels[0]["id"], MB_GAP)
    if not full:
        return None

    seen = {}
    for m in full.get("media", []):
        for t in m.get("tracks", []):
            for rel in (t.get("recording") or {}).get("relations", []):
                name = (rel.get("artist") or {}).get("name")
                if not name:
                    continue
                bucket = seen.setdefault(rel.get("type"), [])
                if name not in bucket:
                    bucket.append(name)

    out = []
    for key, label in ROLES:
        if seen.get(key):
            out.append({"label": label, "names": seen[key][:MAX_NAMES]})
    return out


def load_personas():
    txt = open(OUT, encoding="utf-8").read()
    m = re.search(r"window\.PERSONAS\s*=\s*", txt)
    if not m:
        raise SystemExit("personas.js: couldn't find `window.PERSONAS =`")
    body = txt[m.end():].rstrip()
    if body.endswith(";"):
        body = body[:-1]
    return json.loads(body), txt[:m.start()]


def main():
    args = [a for a in sys.argv[1:]]
    force = "--force" in args
    limit = None
    if "--limit" in args:
        limit = int(args[args.index("--limit") + 1])
        del args[args.index("--limit"):args.index("--limit") + 2]
    wanted = [a for a in args if not a.startswith("--")]

    personas, header = load_personas()
    todo = []
    for p in personas:
        if wanted and p.get("id") not in wanted:
            continue
        for a in p.get("albums", []):
            # ⚠️ Two independent gaps. An album can have credits but no label
            # (it was baked before labels existed), so asking for BOTH keys is
            # what lets a label-only pass run without re-hitting MusicBrainz for
            # credits that are already settled.
            if force or "credits" not in a or "label" not in a:
                todo.append((p.get("id"), a))

    if not todo:
        print("nothing to do — every album already has credits (use --force to refetch)")
        return 0
    if limit:
        todo = todo[:limit]

    print("looking up %d album(s)… ~%.0fs at %.1fs/request\n" % (
        len(todo), len(todo) * MB_GAP * 2, MB_GAP))

    hits = misses = failed = 0
    try:
        for i, (pid, a) in enumerate(todo, 1):
            need_lbl = force or "label" not in a
            need_cr = force or "credits" not in a
            upc = None
            if need_lbl or need_cr:
                upc, lbl = deezer_meta(a)
                if need_lbl:
                    a["label"] = lbl or ""     # "" = asked, Deezer has none
            mark = []
            if need_cr:
                got = mb_credits(a, upc)
                if got is None:
                    failed += 1
                    mark.append("!! network")
                elif got:
                    a["credits"] = got
                    hits += 1
                    mark.append("; ".join("%s %s" % (c["label"], ", ".join(c["names"][:2]))
                                          for c in got[:2]))
                else:
                    a["credits"] = []
                    misses += 1
                    mark.append("— no credits")
            if need_lbl:
                mark.append("[%s]" % (a.get("label") or "no label"))
            print("%3d/%d  %-10s %-30s %s" % (
                i, len(todo), pid, (a.get("album") or "")[:30], "  ".join(mark)))
            if i % 10 == 0:
                save_cache()
    except KeyboardInterrupt:
        print("\ninterrupted — writing what we have")

    save_cache()
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(header)
        f.write("window.PERSONAS = " + json.dumps(personas, ensure_ascii=False, indent=1) + ";\n")

    total = hits + misses
    print("\nwrote %s" % OUT)
    print("  %d with credits, %d with none%s  (%.0f%% coverage)" % (
        hits, misses, (", %d failed" % failed) if failed else "",
        (100.0 * hits / total) if total else 0))
    if failed:
        print("  re-run to retry the %d that failed — failures are not cached" % failed)
    return 0


if __name__ == "__main__":
    sys.exit(main())
