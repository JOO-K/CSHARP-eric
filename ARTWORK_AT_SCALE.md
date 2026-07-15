# Artwork & metadata at scale (production plan)

The prototype bundles images locally under `images/` for offline testing. That does **not**
scale to a real catalog of many artists/songs. This is the plan to make artwork procedural.

## Core principle
**Never store image bytes. Store IDs + a resolved image-URL string** (a few bytes each). The
music provider hosts the actual image on its CDN; your app just renders the URL. The UI is
already URL-agnostic — everything uses `background-image:url('${x.image}')`, so a remote URL
works with zero UI changes.

## Provider choice
| Provider | Auth | Notes |
|---|---|---|
| **Spotify Web API** (recommended) | OAuth Client-Credentials (needs a tiny backend for the secret) | Best fit — the library is sourced from Spotify. Album/artist objects return `images[]` (CDN URLs on `i.scdn.co`) you're permitted to display. Free. |
| MusicBrainz + Cover Art Archive | none | Fully open fallback. Coverage/quality varies; rate-limited ~1 req/s. Good for filling gaps. |
| iTunes Search API | none (JSONP) | Already used in-app for audio previews. `artworkUrl100` → swap `100x100`→`600x600`. No artist photos. |
| Deezer public API | none (JSONP) | What the prototype's fetch scripts use (`cover_xl`/`picture_xl`). Fine for testing; weaker ToS/stability for a shipped product. |

## Data model (store, don't cache bytes)
```
album  { id, spotifyId, title, artistId, year, genre, imageUrl }   // imageUrl = resolved string
artist { id, spotifyId, name, imageUrl }
```
`imageUrl` is filled in by the backend the first time the record is seen, then reused.

## Flow
1. **Ingest** — when an album/artist enters your DB, the **backend** calls Spotify
   (`GET /v1/search`, `/v1/albums/{id}`, `/v1/artists/{id}`), reads `images[0].url`, and
   **stores that URL string** on the record. Do this once, not per page view.
2. **Serve** — the client fetches your DB records, which already contain `imageUrl`. No
   per-user calls to Spotify → you never hit rate limits from the browser, and the secret
   stays server-side.
3. **Render** — `<img src="{imageUrl}">` / `background-image:url("{imageUrl}")`. Unchanged UI.
4. **Refresh (optional)** — re-resolve stale URLs lazily (e.g., on 404) or on a slow cron.

## Why a backend
- **Secret**: Spotify client secret can't live in browser JS.
- **Rate limits**: Deezer ~50 req/5s, iTunes ~20/min *per IP* — fine for one tester, not for
  many users. Centralizing + caching on the server sidesteps this.
- **CORS**: displaying an image URL needs nothing; the JSON *lookups* need a proxy (Spotify)
  or JSONP (Deezer/iTunes). A backend makes this a non-issue.

## Migrating this prototype later
Introduce one indirection and the rest stays put:
```js
// today: return the local path. later: return record.imageUrl (a CDN URL).
function imgFor(x){ return x.imageUrl || x.image; }
```
Swap `${a.image}` → `${imgFor(a)}` at the ~handful of render sites (home bento, album page,
artist page grid, feed cards). Then the data layer can serve local paths (testing) or remote
URLs (production) with no template changes.

## Prototype fetch scripts (reference)
`tools/fetch_music.py` + `tools/build_data.py` already pull real data via Deezer (no scraping,
no key). To go URL-only for testing, change the scripts to keep `cover_xl`/`picture_xl` in the
data instead of `download()`-ing to `images/`. See CLAUDE.md and the git history for the
current local-image approach.
