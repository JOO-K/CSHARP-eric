# Personas

Four different people using Spindeck, each with their **own taste and their own
look**. The viewer's toolbar switches between them so the mockup can be shown as
more than one person's app.

| id | who | aesthetic |
|----|-----|-----------|
| `eric` | **Eric** — the real one, from his Spotify artist capture | warm amber, off-white ink |
| `kpop` | **Kpopper** — K-pop enthusiast | glossy pink, pastel |
| `oldies` | **Hank** — old-school rock + oldies | warm paper, sepia, serif |
| `hyperpop` | **16yearold** — new-age electronic pop (underscores, Tiffany Day, Jane Remover…) | neon mint, mono type |
| `thomas` | **Thomas** — Eric's friend, built from his real Apple Music library | electric blue, cool grey |

## Building one from an Apple Music export

`tools/apple_library_to_taste.py` turns an Apple Media Services export into a
`taste/<id>.csv`. **Ask for `Apple Music Library Tracks.json`** — the request
ships several files and they are not equal:

| file | what it gives | verdict |
|------|---------------|---------|
| **Library Tracks.json** | one row per track: Artist, Album, Genre, Year, **Track Play Count** | ✅ use this — real listening, no network calls |
| Library Albums.json | album titles + Apple catalog ids. **No artist, no plays** | fallback — ids get resolved via the iTunes Lookup API and ranked by *date added* |
| Library Activity.json | the library **edit** log (`addItems` transactions) | nothing to rank by; ignored |

The script detects which one it was handed. In tracks mode it ranks albums by
**total plays**, caps 2 per artist, drops obvious compilations (logged, so you
can put a Greatest Hits back if it really is their record), and fills the
`track` column with each album's **most-played song** — which is what the
profile's Favourite-songs rows show.

```
python tools/apple_library_to_taste.py --json "Apple Music Library Tracks.json" \
       --id thomas --n 28 --since 2025-01-01 --min-year 2019
python tools/build_personas.py thomas
```

**Use `--since` and `--min-year`.** Play counts are lifetime, so unfiltered they
describe someone's whole decade — Thomas's raw top 28 was Kanye, Common and
Madvillain, records he hasn't touched in years. `--since` keeps only albums
still in rotation (proxied by the later of *last skip* and *date added* — the
export has no last-played date) and `--min-year` keeps the releases recent.

Artists Deezer files under another name (Korean acts under their Korean name,
collab billings under the lead) go in the script's `ALIASES` map — **not** in
the CSV, which a regenerate would overwrite.

Then **read the CSV and cut what doesn't belong** — a library is full of things
someone saved once. Rows Deezer can't match are reported by the build; blanking
the `album` (so it takes the artist's top record) fixes most of them.

Each persona carries **hits and deep cuts** — the recognisable records plus the
ones that show the taste is real. Aim for ~25–30 albums each: the home bento
cycles the whole catalogue, so a short list makes the app feel empty.

## Files

```
personas/
  personas.csv        identity + aesthetic tokens — ONE ROW PER PERSONA
  taste/<id>.csv      what they listen to — artist,album,track,rank
```

`taste/*.csv` is the **hand-maintained** part. Everything else about an album
(year, genre, track count, cover art, artist photo) is resolved from the
**Deezer public API** by `tools/build_personas.py` — never typed by hand and
never scraped.

### `personas.csv` columns
`id, name, handle, bio, location, occupation, since, followers, following,
reviews, playlists, font, radius,` then **two colour sets**:

| dark | light | is |
|------|-------|----|
| `accentD` | `accentL` | the highlight — ratings, active states |
| `bgD` | `bgL` | the page |
| `inkD` | `inkL` | primary text |
| `ink2D` | `ink2L` | muted text |
| `cardD` | `cardL` | card / well surfaces |

**Every persona needs both.** The viewer shows a Dark and a Light variant side
by side; a persona with one colour set paints both the same and the pair stops
being a comparison. `font` and `radius` are shared — they're the persona's
character, not its lighting.

### `taste/<id>.csv` columns
`artist, album, track, rank`

- `artist` is required — it's the only field the Deezer lookup truly needs.
  Write it as **`Name#<deezer artist id>`** to skip the search when the matcher
  picks the wrong act. Deezer carries two `bsd.u` entries and the popular one
  holds a single album, while the bracketed `[bsd.u]` (id `9150544`) has the
  whole lo-fi catalogue — the build has no way to know which you meant. Find
  the id with `api.deezer.com/search/artist?q=<name>`.
- ⚠️ **Check the artist the build reports back.** An album credited to a
  collaborator is dropped with `artist mismatch` — `bluntscraps` is filed under
  "Jetson" even on bsd.u's own page, so the row was pinned to `pook` instead.
- `album` optional. Blank → the build script takes the artist's most-played
  album (tallied from their Deezer top tracks), which is usually the right one.
- `track` optional — a specific song for the profile's Favourite-songs rows.
- `rank` optional integer; lower = higher on the page. Blank sorts last.

## Rebuilding

```
python tools/build_personas.py           # all personas
python tools/build_personas.py eric      # just one
```

Writes `personas.js` at the repo root (loaded after `data.js`). Bump the `?v=`
on it in `index.html` afterwards.

## Artwork — URLs, not files

The build stores Deezer's **CDN URL** (`cover_xl` / `picture_xl`) on each record
rather than downloading the image into `images/`. That's the plan in
`ARTWORK_AT_SCALE.md`, and it's what keeps four personas' worth of catalogue
from bloating the repo — which is the whole reason for moving assets to Dropbox
later. Any host swap is one string change per record, so a later migration to
Dropbox links is a re-run of the script, not a re-write of the app.
