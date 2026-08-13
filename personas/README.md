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
