# Spindeck — Music Review App Mockup

**What it is:** A Letterboxd-for-music app (working name **Spindeck**; the repo/URL still say CSHARP). Plain HTML/CSS/JS — no build tools, no npm, no framework. Designed as a phone UI prototype viewed in a desktop viewer.

**Cache-busting:** assets are loaded with `?v=N` in `index.html` — bump N on every CSS/JS/data change so the browser reloads.

**Live URL:** https://joo-k.github.io/CSHARP-eric/
**Repo:** https://github.com/JOO-K/CSHARP-eric.git

---

## File Structure

| File | Role |
|------|------|
| `index.html` | Shell: desktop viewer + mobile prototype wrapper |
| `data.js` | Album archive, global state, `openAlbum()` helper |
| `screens.js` | All screen HTML (the `SCREENS` array) + helpers |
| `app.js` | Viewer logic, navigation, color extraction, fillet processing, mobile engine |
| `app.css` | App UI styles (screens, components, palette) |
| `style.css` | Desktop viewer chrome (toolbar, phone frame, variant tray) |
| `roadmap.js` | Roadmap board — state, render, export (desktop viewer only) |
| `roadmap.css` | Roadmap board styles |
| `flowchart.html` | Page map / user flow diagram |
| `archive.csv` | Source of truth for artist/album metadata |
| `images/` | Album art (~146 albums, `album-artistslug-albumslug.ext`), playlist covers (`playlist-*.jpg`), and `profile-skin-01.png` (profile theme 01 skin) |
| `share.js` | **Quick share** — renders your rating + review as a 1080×1350 Instagram card on a canvas, and the sheet that offers it. Loads AFTER app.js |
| `dots.js` | **SD_DOTS** — the brand dot-matrix asset generator. Loads FIRST (before `screens.js`) |
| `dot-lab.html` | Design tool for dot assets — paint grid, gooey links, sliders, save library, copy SVG/call. Toolbar → **◌ Dots**; leave via the back link or **Esc**. Not part of the mockup |
| `images/BOTTOM_NAV_FULL_INDENT.svg` | Source silhouette for the docked bottom nav, **as drawn**. Reference only — the code inlines a bled variant of it in `bottomNav()` and in the `.v3-nav-glass` mask |
| `images/topbox.png` | Fillet PNG — black arc at bottom-left, white bg. Used for `v3-fillet-bl` |
| `images/bottombox.png` | Fillet PNG — black arc at top-left, white bg. Used for `v3-fillet-tl` |

**Script load order (important):** `dots.js` → `data.js` → `personas.js` → `screens.js` → `app.js`
⚠️ `dots.js` must be first: the home screen's static markup calls `sdScene()` as `screens.js` parses.

---

## Screens (in order)

The `SCREENS` array holds only the **current** designs — every retired mockup
(the v1/v2 home variants, and the old standalone `search`/`album`/`artist`/`review`
screens) has been deleted. Album / Artist / Search are **no longer standalone
screens**; they're live sub-states of the home shell (see below). "Review" is
not a state at all any more — see *Fullscreen is the album page*.

| ID | Name | Variants |
|----|------|----------|
| `auth` | Auth / Login | Float·Dark, Float·Light |
| `onboarding` | Onboarding | Float·Dark, Float·Light |
| `home` | Home | v3.0 Float·Dark, v3.1 Float·Light |
| `wall` | Album Wall | Float·Dark, Float·Light |
| `song` | Song / Track | Float·Dark, Float·Light |
| `profile` | Profile | Funky·Dark, Funky·Light (theme 01) |
| `profile-edit` | Edit Profile (customising) | Funky·Dark, Funky·Light |
| `playlists` | Playlists | Float·Dark, Float·Light |
| `playlist-new` | New Playlist (creation) | Float·Dark, Float·Light |
| `playlist` | Playlist Page (detail) | Float·Dark, Float·Light |
| `notifications` | Notifications (activity inbox) | Float·Dark, Float·Light |
| `settings` | Settings | Float·Dark, Float·Light |

`auth`/`onboarding`/`song` use the older `.app-screen` component CSS re-skinned to
the current palette via the **`sd-theme-dark` / `sd-theme-light`** scope classes
(defined in `app.css`, built by `sdTheme(light)` in `screens.js`). They render via
`authHtml(light)` / `onboardingHtml(light)` / `songHtml(light)`.

Navigate between screens with `navigate('screen-id')` — called from `onclick`
handlers in screen HTML. `navigate('search'|'album'|'artist'|'review')` is
intercepted and routed to the live in-app flow (`openSearch` / `openAlbumPage` /
`openArtistPageFor`) rather than a standalone screen. `navigate('review')` is a
**legacy id** — the fullscreen review state it named is gone (see *Fullscreen is
the album page*) and it now routes to the album page like `'album'` does.

### Left page nav (desktop viewer)
`NAV_PAGES` (in `app.js`) drives the floating left rail — **decoupled from
`SCREENS`**. Real screens open via `goToScreen`; `flow:true` entries (Search,
Album Page, Artist Page, Review) launch the live in-app interaction through
`navPage(id)` and are flagged with a `↗` in the rail. `activeNavId` tracks the
highlighted entry. The rail is `position:absolute` over `#stage` so the phone
centers in the true middle of the viewport (`#phone-container` fills full width).

---

## Dev Box (`initDevBox` in app.js, `#devbox` in index.html)

A tuning panel floating on the right of `#stage`, behind the toolbar's **⚙ Dev**
button. Desktop viewer only. It live-tunes the **compact bento's info box** —
block gap/padding, plus X · Y · Size for each of the two lines — and prints the
CSS.

- The sliders write a `<style id="devbox-live">` appended to `<head>`, and
  **`devBoxCss()` produces both that and the Copy CSS output**, so what's on
  screen is exactly what gets pasted. No second code path to drift.
- Rules are scoped `.s-home-v3:not(.s-home-v3--review)` — (0,2,0), enough to
  beat the base `.v3-blue-info-row` / `.v3-blue-stars-row` declarations without
  touching the review/album/artist state.
- **The defaults are the live values in app.css**, so an untouched panel emits
  the current layout rather than resetting it. If you change those declarations
  in app.css, update `DEVBOX_FIELDS[].def` to match or the panel will silently
  disagree with the stylesheet.
- Size is a `scale()` on the row (with `transform-origin: left center`), not a
  font-size — the children carry fixed px sizes, so scaling the row is the lever
  that doesn't require converting all of them to `em`.

**The sample-review quote is gone from the bento** (`.v3-blue-quote { display:
none }`). It was already hidden in review mode, so this retires it everywhere;
the markup and the typewriter in app.js remain and just paint into a hidden
node, so deleting that one rule brings it back. With two lines instead of three,
`.v3-blue` moved off `space-between` (which would shove them to the far top and
bottom of the box) onto a centred stack.

## Roadmap (`roadmap.js` + `roadmap.css`, `#roadmap` in index.html)

The planning board behind the toolbar's **🗺 Roadmap** button — an editable
4-month plan meant to be opened live in a meeting. **Left:** an 18-week vertical
timeline (Aug 17 → Dec 14 2026, month rules between). **Right top:** short /
medium / long term goals. **Right bottom:** meeting notes.

- **Self-contained.** Two new files, loaded last in `index.html`; it imports
  nothing from app.js and app.js knows nothing about it. `rmInit()` runs on the
  **first open**, not at load, so it costs nothing until pressed.
- Lives inside **`#stage`** (already `position: relative`) at `z-index: 90` —
  above the dev box's 60 — so it covers the phones but leaves the toolbar
  reachable. `toggleRoadmap` also sets `.rm-open` on `#viewer`, which hides
  `#thumb-tray` and `#recbox`; without it both sit visible *below* the overlay.
- **Editing is contenteditable + one delegated `input` listener** on `#roadmap`,
  because `rmRender()` rebuilds the rows and per-node listeners would leak on
  every structural change. Fields are `plaintext-only` and Enter blurs rather
  than inserting a `<br>` — a `<br>` would defeat the `:empty::before`
  placeholder.
- ⚠️ **Same rendering discipline as `PLNEW`:** input handlers write state and
  **must not re-render** (it destroys the caret mid-keystroke). Only structural
  changes — `rmCycle` / `rmAddGoal` / `rmDelGoal` — call `rmRender()`, and those
  restore both card bodies' `scrollTop` so the reader isn't thrown to the top.
- **State** is one object in `localStorage` under `spindeck-roadmap-v1`, saved
  debounced at 250ms. `RM_WEEKS` (the date labels) is **static and separate from
  the stored state**, which holds only `{t, track, st}` per index — so editing
  the week list re-labels the board instead of orphaning someone's notes
  (`rmLoad` pads/truncates to match).
- ⚠️ **localStorage is per-browser, so a reader's notes never come back on their
  own.** That is what **Copy Markdown** / **Download .md** are for; `rmMarkdown()`
  emits goals + a timeline table (blank weeks omitted, typed `|` escaped) +
  notes. Say this out loud before handing the link over.
- Chips cycle on click: track (Mockup · Website · Both) and status (`–` planned ·
  `▸` doing · `✓` done · `!` at risk, which also colours the spine node).
- The seeded content is a **draft to argue with**, taken from the open threads
  recorded in this file. `rmSeed()` is the single place to change it; **Reset**
  restores it and drops the reader's edits (behind a `confirm`).

## Personas (`personas/` → `personas.js` → `applyPersona` in app.js)

The mockup can be shown as **four different people**, each with their own
catalogue and their own look. The switcher lives in the desktop toolbar and the
mobile bar (`renderPersonaBar()` fills both from one markup string).

| id | who | look |
|----|-----|------|
| `eric` | **Eric** — **the default; the app boots into this one.** Seeded from his real Spotify artist capture (`NEWSPOTIFYARTISTS.png`, the same one behind `tools/artists.txt`), then edited by hand | warm amber |
| `kpop` | **Kpopper** | glossy pink |
| `oldies` | **Hank** — classic rock + oldies | warm paper, serif |
| `hyperpop` | **16yearold** — new-age electronic pop | neon mint, mono |
| `thomas` | **Thomas** — Eric's friend, from his real Apple Music library export | electric blue |

**There is no "Demo" button any more** — `eric` is the demo. `applyPersona('')`
still works and still restores data.js's own catalogue + the random persona; it
just has no entry in the switcher, and `initPersonas` boots into `eric` when
nothing is saved (booting into the unpersona'd data would leave every button
unlit, with no way back).

Each list mixes **hits with deep cuts**, at ~25–30 albums. The home bento
cycles the entire catalogue (`albumSeq()` = featured + all of
`trendingAlbums`), so a short list makes the app look empty — that is what a
9-album persona looked like.

### Where the data comes from
`personas/personas.csv` (identity + skin tokens, one row per persona) and
`personas/taste/<id>.csv` (`artist,album,track,rank`) are **the hand-maintained
source**. `tools/build_personas.py` resolves each row against the **Deezer
public API** and writes `personas.js`. See `personas/README.md`.

A persona can be **seeded from a real Apple Music library export** with
`tools/apple_library_to_taste.py` (that's where `thomas` came from). ⚠️ **Ask for
`Library Tracks.json`, not `Library Albums.json`** — only the tracks file
carries artist names and **play counts**, so it ranks by what someone actually
listened to and needs no network at all. The albums file has neither (just
titles + Apple catalog ids), and the script's fallback path — resolve the ids
via iTunes, rank by date added — produced a visibly *wrong* persona for Thomas:
a recency list of things he'd saved, versus the hip-hop/neo-soul/Seoul-R&B
catalogue his play counts actually describe. `Library Activity.json` is the
library edit log; there's nothing to rank by in it.

The CSV it writes is still meant to be read and cut by hand. **Korean acts are
the usual Deezer miss** — 검정치마 is listed under its Korean name, not "The
Black Skirts"; look the artist up in `search/artist` and use the name Deezer
returns.

- **Only `artist` is required.** Blank `album` → the build picks their
  most-played real album. For K-pop that lands on whatever single is charting,
  so those are pinned by name — same for legacy acts, where the top-tracks tally
  favours compilations.
- **Two traps the matcher exists to dodge:** short group names collide (Deezer
  lists several acts called *Ive*, *BTS*, *f(x)*), so `find_artist` keeps the
  **most-followed exact name match** — search order does not put the famous one
  first. And a global album search returns cover bands ("The Beatles Complete On
  Ukulele" outranked The Beatles), so albums are looked up **within the resolved
  artist's own catalogue**, with a name check on the way out.
- Ratings/reviews are generated in the script, **seeded off the album title**,
  so a rebuild produces identical numbers — no git churn.
- **Artwork is a Deezer CDN URL, never a downloaded file** (`ARTWORK_AT_SCALE.md`).
  77 albums add ~0 bytes to the repo. This is also what makes the planned move
  to Dropbox a re-run of the script rather than a rewrite.

### Personas deal a fresh home every time
A persona's identity is authored and fixed, so it can't get its variety the way
the demo does (`randomizeProfile` re-rolls an entire new person each visit). It
comes from the home page instead: `reshuffleHome()` re-deals the featured album,
the bento's swipe queue and the activity feed on every
switch — and on every page load, since `initPersonas` re-applies the saved one.
The toolbar's **Shuffle** runs the same function.

`personaFeed()` generates the feed rather than remapping data.js's 1:1 (which
produced an identical feed every load): people from the demo's cast, albums
drawn at random from the persona's own shelf, and the **quote taken from that
album's own generated reviews**, so a feed card and its album page agree.

⚠️ `trendingAlbums` takes the **whole** remaining catalogue. The name says five
and data.js's comment says five, but `albumSeq()` is `featured + trendingAlbums`
— slicing it to five silently shrinks the bento's swipe queue to six albums.
`shuffleAlbums` used to do exactly that.

### Switching (`applyPersona(id)`)
Swaps `ARCHIVE` wholesale, then re-derives everything from it —
`featuredAlbum` / `trendingAlbums` / `activeAlbum`, the profile, and the home
feed. ⚠️ **Anything cached off `ARCHIVE` must be cleared here or it serves the
previous persona:** `window._FEED` (the activity feed's deal) and
`_pinnedReview` are, and `FRIEND_ACTIVITY` is rebuilt by `personaFeed()` —
data.js's feed names demo albums by title, so under a persona every card would
point at a record that no longer exists. Add to that list when you add a cache.

⚠️ **The toolbar's persona row overflows its section.** `.tb-section.left` is
`flex: 1` (a quarter of the bar) but the wordmark + mockup chip + persona
buttons are wider than that, and `.tb-section.center` — a later static sibling —
painted over the overflow, so the **last persona button was unclickable** while
looking perfectly normal (found by hit-testing `elementFromPoint`, not by
reading the CSS). The centre section's empty gutter is now `pointer-events:
none` with its own controls back to `auto`. That buys room for a few more
personas; past ~7 the buttons will reach the `‹ Home ›` controls themselves and
the row needs to shrink or scroll instead.

`applyPersonaClass()` re-stamps `.persona-<id>` on every `.app-screen` inside
`renderViewer`, because renderSingle/renderMulti rebuild the screens from
scratch. The skin itself is one injected `<style id="persona-skins">`.

### Skins carry TWO colour sets
`personaSkinCss` emits a dark block on `.persona-<id>` and a light block on
`.persona-<id>.s-home-v3--light, .persona-<id>.sd-theme-light`. **A persona
with one colour set painted both viewer variants the same** and the Dark|Light
pair stopped being a comparison — hence `accentD/bgD/inkD/…` **and**
`accentL/bgL/inkL/…` in the CSV. `font` and `radius` are shared.

⚠️ Build the descendant selectors per base, not by joining bases with a comma:
`"a, b .x"` scopes `.x` under `b` only, silently dropping every light screen but
the last. That's what the `each(bases, kids)` cross-product in
`personaSkinCss` is for.

> **The skin is still a broad first pass.** The screens were built on hard-coded
> hex, so a persona overrides the big surfaces rather than re-declaring a token
> set. Per-persona detail work is open — starting with the header wordmark and
> icons washing out on the light backgrounds.

## Recommendations + search fallback — Deezer at runtime (`app.js`)

A persona ships ~30 albums and the bento cycles the **whole** catalogue, so home
started repeating within a few swipes. `expandRecs()` widens the shelf to `RECS_TARGET` (100)
on every load **without shipping a single extra byte**: it takes
`RECS_SEEDS` (10) of the persona's own artists at random, asks Deezer for each
one's **related artists**, and takes the best few albums from each. Both draws
are random, so a reload deals a genuinely different shelf — measured at **88%
new albums between two consecutive loads**.

- **`artist/<id>/radio` is the wrong endpoint** and was the first cut. Seeded
  off a K-ballad singer it returns forty *"Crash Landing on You (Original
  Television Soundtrack), Pt. 3"* singles. Related-artist **albums** are the
  right source.
- ⚠️ **That endpoint has no `nb_tracks`, and `record_type` says "album" for
  live records and compilations too.** The title is the only usable signal
  (`DZ_JUNK`), plus Deezer's own **`fans`** count — `dzPickAlbums` ranks by fans
  and draws randomly from the head, which is what keeps *Aja* above *A Decade
  Of Steely Dan*.
- **Records arrive `_lite`** — title/artist/cover but no year, genre or track
  count. That is exactly what the compact bento needs (it hides the year), and
  `dzHydrate` fills the rest in one call when the album is opened. Ratings and
  reviews come from `dzSeed`/`dzReviews`, a **port of the generator in
  tools/build_personas.py** — same pool, same seeding, so a fetched album is
  indistinguishable from a built one and never changes its numbers.
- `dzAdopt` **appends** to `trendingAlbums` rather than re-shuffling it: the
  queue is indexed by position and the user may be mid-swipe. It also nulls
  `window.SEARCH_INDEX`, which is memoised and would otherwise never see them.
- Personas carry **`artistId`** (added to `build_personas.py` for this) so the
  seeds need no name lookup.

**Search** used to only know the persona's own ~30 albums, so "steely dan" found
nothing. `sdsRemoteSearch` queries Deezer alongside the local index (debounced
280ms) and appends a **"More on Deezer"** section; local results stay on top.
Tapping an album opens it like any other; tapping an **artist** first pulls
their albums into ARCHIVE, because `openArtistPageFor` builds the page by
filtering ARCHIVE and would otherwise open an empty shell.

**One album per artist** (`RECS_PER_ARTIST = 1`). Four albums by one act in a
row read as the shelf repeating — the exact complaint this feature exists to
answer — so breadth comes from more ARTISTS instead, and `dzSpread` deals the
pool out round-robin by artist so two records by the same act are never
adjacent. (They arrive grouped, one artist's batch at a time; appended raw they
land in consecutive swipes.)

⚠️ **The feed has to be refreshed when a deal lands** (`dzRefreshHome`). It is
built from ARCHIVE at render time — *before* the recs arrive — and `feedEvents`
memoises into `_FEED` while `FRIEND_ACTIVITY` is generated once per persona
switch. Without the refresh the bento swiped through a fresh 100 albums while
everything under it showed the same handful of rows on every single load, which
reads as the whole screen repeating.
`expandRecs` therefore calls it from **one exit point**: the deal loop has
several early returns and hitting `RECS_TARGET` takes one of them, which is
exactly how this broke the first time.

### Rec box (`initRecBox` in app.js, `#recbox` in style.css)
The knobs are live, on a strip along the **bottom of the desktop viewer** — the
numbers are a feel decision and reading them off a diff is useless. Seeds ·
Related/seed · Albums/artist · Max queue, plus an on/off toggle, **Re-deal**,
and a live readout (`97 albums · 64 recommended · 64 new artists · ~88
requests`). It's appended to `#viewer`, which the mobile prototype hides
wholesale, so it never reaches a phone. Sliders re-deal on **release**, not on
input — dragging Seeds 2→14 would otherwise fire a dozen deals at the API.

⚠️ **Deezer allows ~50 requests / 5s and a rec deal is ~45 of them.** `dz()`
paces every call `DZ_GAP` (115ms) apart and retries a failure once. **It caches
only successful responses** — an earlier cut cached the `null` from a throttled
call, which pinned the failure for the whole session: search silently returned
nothing until reload, long after the quota recovered.

## Data Layer (`data.js`)

`data.js` runs first and sets up the global data layer:

```js
window.ARCHIVE        // Array of 54 album objects
window.activeAlbum    // Currently viewed album (set by openAlbum)
window.featuredAlbum  // Today's featured album (daily rotation)
window.trendingAlbums // Array of 5 trending albums (excludes featured)
window.fmtRc(n)       // Formats review counts: 31000 → "31k"
window.openAlbum(a)   // Sets activeAlbum + navigates to 'album' screen
```

Each album object:
```js
{
  artist, album, year, genre, tracks,
  image,           // 'images/album-slug.ext'
  artistDesc, artistBio,
  rating,          // 3.8–4.9 (fictional)
  reviewCount,     // 6000–156000 (fictional)
  reviews: [{ name, init, grad, rating, text }]
}
```

**`featuredAlbum` / `trendingAlbums`** rotate daily (`Math.floor(Date.now() / 86400000) % ARCHIVE.length`).

### Dynamic screens (getter pattern)
Wall, Feed (Albums), and Album Page use `get html()` so content is evaluated fresh each render.

Home screen data is injected post-render by `populateHomeData(el)` in `app.js` (called inside `requestAnimationFrame` after every `renderViewer()`).

---

## Design Language & Aesthetics

### Philosophy
**Editorial-dark meets floating bento** — a music zine digitized. Between Letterboxd, a vinyl record store, and a Tumblr that cares about typography.

Key principles:
- **Floating cards with drop shadow** — cards lift off the background
- **Album art is the hero** — everything orbits the cover
- **Compact, dense information** — stars + rating + count in one row
- **Procedural color** — accent color extracted from album art via canvas

### Dark Theme (Float·Dark / v3.0)
- Screen bg: `#111116`
- Text primary: `#e8e2d6` (warm off-white)
- Empty stars: `rgba(232,226,214,0.14)` — grey, NOT black
- Shadows: dark-on-dark — barely visible; rely on inset top-edge highlight `inset 0 1px 0 rgba(255,255,255,0.06)` for separation
- Accent: procedurally extracted via `applyAlbumColors()`

### Light Theme (Float·Light / v3.1)
- Screen bg: `#f0ece3` (warm cream)
- Text primary: `#1a1208`
- Empty stars: `rgba(26,18,8,0.15)`
- Box backgrounds: currently `#999` placeholder — to be refined
- Shadows: warm-tinted dark shadows, visible on cream bg
- Album shadow: `0 8px 16px rgba(30,20,10,0.18), 0 20px 48px rgba(30,20,10,0.28)`

### Album / Artist / Song typography convention
Wherever these names appear together, order them **song → album → artist** (top to bottom / left to right), with **album name always before artist**. To distinguish the two: **album = regular weight (400), artist = bold (700)**. Song title stays the most prominent element when present. Applied in: album detail (`.album-title`/`.album-artist`), song detail (`.song-*`), home info row (`.v3-blue-album`/`.v3-blue-artist`), friend cards (`.v3-friend-*`), trending/search (`.trending-*`). Exception: `.lfeed-artist` stays a small uppercase mono kicker (editorial eyebrow, not a peer pair).

⚠️ **The home screen now runs the weights the other way: album 700 / artist 400.**
It reads better where the pair is small and dense, so it applies to the **compact
bento info row** (`.s-home-v3:not(.s-home-v3--review)` — the review / album /
artist pages keep the convention above) and to the **friend-feed cards**, which
also moved onto `Roboto Flex` to match the bento. If the flip spreads to the rest
of the app, this section is what changes.

### Global CSS Variables (defined in `:root`)
```css
--star:      #e8a83c
--font-main: 'DM Sans'
--font-mono: 'SUSE Mono'
```

`.s-home-v3` overrides `--text3` to `rgba(232,226,214,0.14)`. `.s-home-v3--light` overrides it to `rgba(26,18,8,0.15)`.

---

## Home Screen v3 — Bento Hero Layout

```
┌──────────────────────────┬──────────┐
│                          │ [🔍] [👤]│  ← search corner (46px tall)
│      ALBUM ART           ├──────────┤
│      (square, 78% wide)  │  [□] [□] │  ← 2 small album thumbs
│                          │ ┌──────┐ │
│                          │ │      │ │  ← main featured album image
├──────────────────────────┤ └──────┘ │
│ 4.4 ★★★★½  19,284 reviews│    ●CD   │  ← spinning CD (absolute)
└──────────────────────────┴──────────┘
         ▼ scroll area (friend feed)
         ▼ bottom nav (Home · Reviews · Playlists · Popular · Profile)
```

### Height constraint — critical
`.screen-content` (the phone frame's content wrapper) is **not a flex container** — it's a block with `overflow-y: auto`. This means `flex: 1` on `.s-home-v3` has no effect. To pin the bottom nav:

```css
.s-home-v3 {
  height: 100%;    /* fills screen-content exactly */
  min-height: 0;   /* overrides .app-screen's min-height: 100% */
  overflow: hidden;
}
```

Without `height: 100%`, the entire screen scrolls inside `screen-content` and the bottom nav floats off the bottom.

### Grid structure
```css
.v3-bento {
  display: grid;
  grid-template-columns: 78% 22%;
  grid-template-rows: auto auto;
  gap: 0;
  margin: 10px 10px 0;
}
```

Grid children (in order): `.v3-album`, `.v3-right-col` (spans row 1 only), `.v3-blue`, `.v3-corner`.

### Cell: Album Art (top-left)
- `aspect-ratio: 1` — always square
- ⚠️ **Corner radii are PERCENTAGES, never px.** Everything else about these
  cells is a % of the 689×638 viewBox, so the boxes rescale with the phone while
  a px radius stays put — correct at exactly one width and wrong everywhere else.
  That is what the **corner gaps** were: `.v3-album` sat at `10px` where the
  frame's 20-unit corner wants **10.60px** (a 0.6px crescent of the box1 fill at
  three corners), and `.v3-for-single` sat at `11px` where its panels' 15-unit
  corner wants **7.95px** — 3px too round on all four. At the 365px bento
  (393 phone − 8 frame − 20 margin) **1 SVG unit = 0.5298px**; divide the frame's
  unit radius by the box's own unit width and height to get the two figures.
  ⚠️ Use the **`a% / b%` two-axis form**. A single percentage resolves against
  *width* horizontally and *height* vertically, so on a non-square box it draws
  an **ellipse** — which is why `.v3-for-single` (tall and narrow) needs
  `13.2748% / 3.6143%` to describe one circular 15-unit corner.
- `.v3-album` — `3.721% … / 3.7451% …` (20 units), **bottom-left** square (the
  step junction; the `--left` hand mirror flips that to bottom-right)
- `position: relative; z-index: 1`
- Light theme: `box-shadow: 0 8px 16px rgba(30,20,10,0.18), 0 20px 48px rgba(30,20,10,0.28)`

### Cell: Right Column (top-right)
`.v3-right-col` is a flex column containing:

**Search corner** (`.v3-search-corner`, 46px tall):
- Two icon buttons: search (→ `navigate('search')`) and profile (→ `navigate('profile')`)
- Background matches screen bg (`#111116` dark / `#f0ece3` light)
- Has `v3-fillet-bl` (arc fillet) at bottom-left

**Red box / Trending** (`.v3-red`, `flex: 1`):
- `border-radius: 0 15px 15px 0`
- Contains: 2 small square album thumbnails (`.v3-red-thumbs` / `.v3-red-thumb`) at top with 9px margin + 5px gap, then one full-width featured album image (`.v3-red-next-img`) filling the rest with 9px margin and 11px border-radius

### Cell: Blue Box / Reviews (bottom-left)
- `padding: 17px 12px`
- `border-radius: 0 0 15px 15px`
- Background: `--v3-box2-bg`
- Contains: `.v3-blue-stars-row` with `align-items: baseline` — score number (16px, 800 weight) + `halfStars(rating, 16)` + review count (9.5px mono)
- `::before` pseudo-element fills the negative space behind the album's bottom-right rounded corner — extends `top: -17px; height: 17px; right: -2px` to close sub-pixel gaps

### Cell: Corner Gap (bottom-right)
- Background matches screen bg
- Contains `v3-fillet-tl` (arc fillet) at top-left
- Contains spinning CD (`.v3-cd`) — **absolutely positioned**, does not affect row height:
  ```css
  .v3-cd {
    position: absolute;
    top: 6px; right: 15px;
    width: 54px; height: 54px;
  }
  ```
- CD click → `togglePreview()`: play/pause the 30s music preview (see **Music Preview System**). The speaker button (`.v3-preview-btn`) is the master arm/disarm.
- Scroll area gets `padding-top: 30px` to give clearance for the CD which overflows below the bento

### Fillet System
Fillets fill the negative space at the two "step" junctions in the bento.

**Dark theme** — PNG mask approach:
- PNG images have a black arc on white background
- `app.js → initFillets()` uses canvas to strip white pixels → transparent alpha
- Result applied as `mask-image` on `::after` via JS-injected `<style id="v3-fillet-mask-style">`
- The `::after` `background` uses the adjacent box's CSS color var
- **Never put `filter: drop-shadow` on fillet elements** — even with mask on `::after`, the browser composites shadows on the full rect before masking, causing GPU black-line artifacts on scroll

**Light theme** — CSS radial-gradient (no PNG mask):
```css
.s-home-v3--light .v3-fillet-bl::after {
  -webkit-mask-image: none; mask-image: none;
  background: radial-gradient(circle at top right, transparent 19px, #999 20px);
}
.s-home-v3--light .v3-fillet-tl::after {
  -webkit-mask-image: none; mask-image: none;
  background: radial-gradient(circle at bottom right, transparent 19px, #999 20px);
}
```
Because there's no mask-image conflict in the light theme, `filter: drop-shadow` CAN be applied to the outer fillet div here.

Fillet positions:
- `.v3-fillet-bl` — `bottom: -1px; left: -0.5px` of `.v3-search-corner` (top junction)
- `.v3-fillet-tl` — `top: -1px; left: -1px` of `.v3-corner` (bottom junction)

### Scroll Area — the activity feed
`.v3-scroll-area` — `flex: 1; overflow-y: auto; padding: 10px 12px 96px` (matched to `.ntf-scroll`). It holds one thing: `.v3-feed-items`, filled by `renderFriendFeed`.

**The feed IS the Notifications component.** Its rows are `.ntf-group` / `.ntf-row` / `.ntf-ava` / `.ntf-badge` / `.ntf-quote` — not a parallel set of classes — and the `--sd-*` token block is scoped to `.s-home-v3` so the home shell inherits the inbox's look whole, in both themes. `--sd-bg` is already exactly the home shell's own background (`#111116` / `#f0ece3`), which is what makes the badge's punch-through ring cut cleanly on all three screens.

⚠️ **Do not add home-only row rules.** The feed first shipped with a star line, an upvote pill and its own row spacing, and the result no longer looked like the screen it was copying — which was the whole point. If a row needs to change, change `.ntf-row` and let both screens move together.

**The one sanctioned divergence: engagement pills on review rows.** A feed row for a `review`/`rating` now carries a like pill and a comment pill, because the feed's job is other people's reviews and you should be able to see that one has traction — and add to it — without leaving home. It is built from the **shared** vocabulary and changes nothing about the row's anatomy: `.ntf-foot` holds the timestamp and the pills on one line, and with no pills it is a flex row of one child, so an inbox row that adopts it looks exactly as it does now. That's the difference from the attempt this warning was written about, which also added a star line and its own spacing. **The inbox's own like/comment rows can take `.ntf-acts` as-is** when they want the same affordance.
- The like pill uses **`feedRevKey(e)`**, the same key the album page's pinned card uses — so liking in the feed and liking on the album page are one act, not two counters. ⚠️ Change one and the other has to follow.
- The comment pill calls `feedOpen(n)` like the row does; it exists for the **count** and the affordance. `openFriendReview` opens that review's thread on the way in, so you land on the album page with the comments already cascading.
- ⚠️ **`.v3-up--feed` re-declares the pill's colours off the `--sd-*` tokens.** Plain `.v3-up` is hard-coded for a dark surface, which is right everywhere else it appears (review cards sit on the album's procedural colour, dark in both themes) and wrong here — the feed sits on the screen bg, which is cream in the light theme. Same trap as `--vinyl-empty`: the value follows the **surface**, not the theme.

The two **"you may know" rails** (`renderKnowRails`, `.v3-rail` / `.v3-kcard`, memoised into `_KNOW`) used to sit above the feed. They're deleted — markup, CSS and JS.

**Content** (`feedEvents`, memoised into `window._FEED`). ⚠️ **This is the line between the two surfaces:** the **inbox is YOUR interactions** — someone liked or replied to your review, followed you, touched your playlist, one of your things hit a milestone — and the **feed is what other people DID**. Nothing systemic belongs in either: `release` ("X is out now") and `trending` ("this is climbing") were about nobody, sat in both, and read as noise between real activity; they're gone from both. The feed's verbs deliberately mirror the log sheet's own toggles — reviewed · rated · favourited · logged · saved for later · added to a playlist · followed an artist — so it shows friends doing exactly the things you can do. Every feed row therefore has a person, which is why the feed has no `isSys` (cover-as-avatar, no trailing thumb) — the inbox still does, for its milestone rows. Events are generated from `FRIEND_ACTIVITY` on a **fixed rhythm** (`FEED_RHYTHM`), not a roll, so it can't deal four follows in a row — reviews are the backbone (a quote is what the app is for) and `release` / `playlist` / `follow` / `trending` punctuate. Rows are sorted newest-first and bucketed into the inbox's sticky Today / This week / Earlier headers off their `ago` string (`agoMins`); the inbox authors its `bucket` by hand, the feed's rows are generated. A feed has no read state, so **"today" stands in for unread** — the newest group gets the filled `.ntf-row--new` treatment, and that contrast against the flat older rows is most of why the screen reads well.

- ⚠️ `trending` is deliberately **not** the inbox's `milestone`. Reusing the name meant reusing the badge (`--star`), and review rows already took the accent — the two golds were indistinguishable in a scroll.
- `feedFace(user)` gives each handle one `rp-*` photo so a person looks like themselves everywhere: `ntfPeople()` pins the community accounts by hand, the generated feed cast hashes into the same pool.
- `_FEED` is memoised for two reasons: the dark and light shells render separately and would otherwise each deal their own feed, and re-rendering home shouldn't reshuffle it under the user.

**Feed row taps** (rows carry an index into `_FEED`, no attribute escaping — the same idiom the old cards used): tapping the **row** → `feedOpen(n)`, which routes by kind (review/rating → the pinned-review flow, playlist → `openPlaylistPage`, follow → `openArtistPageFor`, release/trending → the album). Tapping the **trailing thumb** → `feedOpenArt(n)` → whatever it's a picture *of*: the album, or the artist on a follow row, where the thumb is their photo and rendered round. The pinned-review flow is unchanged: `openFriendReview(i)` → `openAlbumPage(album, pinnedReview)`, the album page opens, `.v3-body` smooth-scrolls to the review list (rect math divided by the phone-wrap scale), and the tapped review renders **pinned first** in `populateReviewList` (`.v3-rev-card--pinned`, star-outlined with a "from your feed" chip; survives filter switches, cleared whenever an album page opens without a pin).

### Bottom Nav — glass shelf, docked to the bottom edge
`bottomNav(active)` in screens.js. Full-bleed and flush against the bottom, with
TWO shaped features: a raised **centre plateau** on the top edge — the bump —
holding the now-playing ticker, and a **scoop** cut out of the bottom edge that
cradles the pet. Silhouette is `images/BOTTOM_NAV_FULL_INDENT.svg` (viewBox
**576×93**, ~62px tall at the 385px mockup). Structure:

- **`.v3-nav-glass`** — the frosted fill, masked to the silhouette via a data-URI.
- **`.v3-nav-emboss`** — makes the scoop read as a **raised pad**: the
  `.plp-back-pill` neumorphic idea applied to the scoop SHAPE, but with an
  **even halo** (zero offset) rather than a directional light, so the shading
  wraps the whole cradle instead of pooling top-left. ⚠️ The two themes use
  opposite colours for it — a light rim on dark, a *shadow* on light, because a
  white halo is invisible against cream. Two nested elements, both load-bearing:
  - ⚠️ **`filter` is applied BEFORE `mask`**, so a drop-shadow on a masked
    element is clipped away by that same mask (verified in-page). The shadow has
    to come from a **parent** of the masked element.
  - ⚠️ **The wrapper is 0-height on purpose.** It needs `background-color:
    inherit` so the fill can inherit the screen colour *through* it — same trick
    as `.v3-nav-nest`, same reason both must be direct children of `.s-home-v3`.
    A zero-height box resolves that colour but paints nothing itself.
  - ⚠️ **z-6, above the nav**, because the highlight falls outside the scoop
    onto the bar and must draw over the glass. That is why **`.sd-scene` moved
    out of `<nav>`** and sits at z-7 — inside, it would be buried by this.
  - An earlier attempt embossed the outline instead: two offset strokes of the
    scoop path, later blurred. It reads as a doubled/glowing line, not a raised
    area — an emboss needs the SHAPE shaded, not its edge.
- **`.v3-nav-shape`** — the hairline outline, as an **OPEN path** (no `Z`).
  ⚠️ **It is NOT the same path as the mask.** It traces the bar's top contour
  only and **deliberately omits the scoop**, so the cradle reads as an opening
  rather than an outlined cut-out. The scoop still exists as a hole in the
  *fill* — that lives in the `.v3-nav-glass` mask, which does carry it.
  So there are now THREE related paths, and a change to the silhouette has to be
  reflected in each: the outline (screens.js), the glass mask and the plug mask
  (both app.css).
- **`.v3-nav-items`** — 4 buttons (Home · Trending → `wall` · Playlists ·
  Profile) in the lower band, which starts at the shoulder, `top: 36.7%`
  (y=34.12 of 93). `padding-bottom` keeps them off the screen edge.
- **`.v3-nav-gap`** — a `flex: 0 0 32%` spacer sitting between Trending and
  Playlists. It reserves the scoop's opening (x 33.1%→65.1%) so the four icons
  are pushed onto the solid bar either side, landing their centres at
  8.5 / 25.5 / 74.5 / 91.5%. ⚠️ Resize the scoop in the SVG and this has to
  follow, or the middle two icons hang over the hole.

### The scene — the face in the notch (`sdScene()` · `paintScene()`)
The scoop holds **two characters in one 21×10 dot grid**, drawn at 63×30px with
SD_DOTS so they are the same rounded-square pixel as every other brand asset:

- **the smile** — the app's face, back from the retired `.v3-ring--smile` dot
  formation. This is the resting state and what the scoop reads as at a glance.
- **the kid** — headphones on, notes drifting off, nodding. A lofi-radio nod. He
  is the **payoff, not the default**: a few seconds at a time in the idle loop,
  and on demand whenever something musical happens.

⚠️ **Two mascots died here, both the same way — too much detail for a 63×30px
box.** First a whole landscape (sun, listener, spectrum bars): a scene made of
small elements reads as *small*. Then a cat with a patch and whiskers: a face
that needs an eye, a nose and a mouth to be legible has nothing left over at a
3px dot. The smile survives because it is **three shapes**. The kid survives
because his eyes and mouth are **unlit holes in a filled head**, not drawn
features — the same trick the original listener sprite used for its headphones.

- **Every frame must be 10 rows of 21.** `paintScene()` swaps the whole SVG per
  frame and nothing re-measures.
- `SCENE_OPTS.dotFrac` is **0.74, above the brand default of 0.56** — at ~3px a
  cell, 0.56 gives sub-2px dots and the face reads as a smudge.
- **Frames:** `smile` · `blink` · `wink` · `kid` · `kidbob`. `SCENE_LOOP` keeps the
  still frames long and the moving ones short — a face that moves constantly
  reads as broken rather than alive — and `wink` exists so the idle isn't a
  two-state flicker between smile and blink.
- `sceneCheer()` **cuts to the kid** for 1.6s and alternates `kid`/`kidbob` to nod
  him, ignoring the loop's place. It's fired from `reactRing`, so the scoop
  reacts to exactly the same events as the live pill (swipe / CD / For You). The
  window is a **timestamp** `sceneTick` checks, so nothing has to clean it up;
  the first call also restarts the tick so he appears immediately instead of
  waiting out a 3-second `smile` hold.
- **One shared clock** (`sceneTick`) paints every scene on screen — the dark and
  light shells sit side by side and two timers would visibly drift. Reduced
  motion gets a single static frame.
- ⚠️ Painting is kicked off from **`paintAfterRender`**, which runs on a
  `requestAnimationFrame`. rAF doesn't fire in a background tab, so an unfocused
  tab shows an empty box (along with unpainted album art) — that's the harness,
  not a bug.
- ⚠️ **The host's width is bounded by the scoop's FLAT TOP (68px), not its
  opening (123px)** — the notch narrows as it rises. Wide and short is the shape
  available, which is why the smile's mouth runs nearly the full width.
- The frames are mirrored as `scene · *` presets in `dot-lab.html`. Redraw one
  there, paste the rows back into `SCENE_FRAMES`.

## Quick share — the bento as an Instagram post (`share.js`)
`buildShareCard(album, review)` draws **1080×1350** (Instagram 4:5): the
**compact bento** — home's resting state — floating on the album's own artwork
blurred into a wallpaper, then your review and a typographic breakdown of the
tracks you scored.

⚠️ **The bento is a FILLED SILHOUETTE, not a stroked frame.** `.v3-master-frame`
still carries the outlines in screens.js but app.css paints them `transparent`;
what you see is **`.v3-bg-fill`'s `bg-right` path** filled with the procedural
`--v3-box1-color`. So the card copies that ONE path (`BENTO_SHELL`) and
re-derives every cell — `BENTO_ALBUM` / `BENTO_FOR` / `BENTO_STRIP` /
`BENTO_CD` / `BENTO_PILL` — from its **app.css percentage** of the 689×638
viewBox. Change a cell's `left/top/width/height` in app.css and the matching
constant has to follow.
⚠️ **One For-You panel, not two.** The two angled panels the master frame draws
are a retired layout (`.v3-for-single` replaced them); drawing them made the
card disagree with the app at a glance. Stroking the frame likewise drew a
hairline the app hasn't shown in months.
⚠️ Approximating it with rounded rects produces a big cover with text under it,
which reads as the **fullscreen album page** — that mistake was made twice.
Shrinking the cover doesn't fix it; the stepped shell is what says "bento".

- **Two coordinate systems, two constants.** Everything structural is a % of
  the viewBox (`K` = card px per unit); the strip's type and the pill's dots are
  sized in **phone px** in app.css, so `U` (= 689/365) converts those to units
  and `PH` converts them to card px. ⚠️ `shadowBlur`/`shadowOffset` are **not**
  transformed — they're device px — so shadows use `PH`, never `K`.
- ⚠️ **`cols.box1` is a `linear-gradient(…)` string** (it feeds `--v3-box1-bg`).
  Canvas silently ignores an unparseable `fillStyle` and keeps the last one, so
  fills using it did nothing at all. The solid colour is **`box1color`**, which
  is what the shell wants anyway.
- ⚠️ **Never punch a hole with `destination-out`** — it erases the card, and the
  vinyls' label holes exported as five transparent dots through the bento. Paint
  the hole in the surface colour behind it instead.
- ⚠️ **The wallpaper blurs by downscaling through a 48px canvas**, not with
  `ctx.filter = 'blur()'`. The filter property is the obvious way and the one
  iOS Safari shipped last — and a card that silently renders the cover SHARP and
  full-bleed is worse than one with no wallpaper. The filter is still applied
  where it exists, but only to smooth what is already soft.
- **The bento is sized last.** The review + breakdown are measured first and the
  bento takes the room that's left (clamped 700–940px wide), so a long review
  can't run the tracklist off the bottom and a short one leaves no void. The type
  column (`TW`) is fixed and independent of it, so the wrap doesn't move.
- The compact bento runs **album 700 / artist 400** — the opposite of the rest of
  the app (see *Album / Artist / Song typography convention*), and the card
  follows the compact rule. Empty vinyls are near-white (`--vinyl-empty` on
  `.s-home-v3`), not a faint grey.

- ⚠️ **Canvas, not html2canvas.** The real bento leans on CSS masks,
  `backdrop-filter`, `aspect-ratio` and SVG masks — all things html2canvas drops
  or mangles — so screenshotting the DOM would export a broken postcard. Canvas
  also gives exact pixel dimensions, which a social export needs.
- ⚠️ **There is no web API that posts to Instagram.** Sharing goes through
  `navigator.share({files})`, which on a phone opens the OS sheet with Instagram
  in it. Desktop and anything without file sharing falls back to saving the PNG;
  the sheet says which you're getting.
- ⚠️ **The PNG blob is built when the sheet OPENS, not on the Share click.**
  Safari drops the user-gesture `navigator.share` requires if you `await`
  anything first, so the handler has to find the file already waiting.
- Covers are loaded with `crossOrigin` for the same reason `computeAlbumColors`
  does: the personas' art is on Deezer's CDN, and without it the canvas is
  tainted and `toBlob()` throws. The sheet degrades to a message if that happens.

**Two entry points, both YOUR review only** — you can post your own take, not
someone else's:
- the **log sheet's footer** (hidden for song/artist subjects, which have no card
  layout), reading live `SDLOG` so the post matches the sheet as it stands;
- the **`.v3-rev-card--mine`** card, which `populateReviewList` now builds from
  the album's saved draft (see *Log Sheet*) and leads the list with.

## SD_DOTS — the brand dot language (`dots.js`)
**THE Spindeck asset primitive**: a grid of **rounded-square dots** — dot = 56%
of the cell, corner radius = 14% of the dot. Same family as the live-pill
dot-face. `SD_DOTS.svg(pattern, opts)` turns a text pattern (`'x'`/`'#'` = dot,
`'.'`/`' '` = empty, one string per row) into an SVG string; dots fill with
`currentColor`, so CSS `color` tints the asset like a glyph.

Opts: `cell` (viewBox units/cell, default 8) · `dotFrac` · `cornerFrac` ·
`spacing` (pitch multiplier — adds air *without* resizing the dots) · `links`
(`[[x1,y1,x2,y2],…]` — chosen neighbouring pairs melt together through a pinched
surface-tension bridge) · `color` · `cls`.

- **Design patterns in `dot-lab.html`** (toolbar → **◌ Dots**): paint grid, link
  mode for picking which pairs melt, dotFrac/cornerFrac/spacing sliders, a
  localStorage save library, and Copy SVG / Copy call. Its preset dropdown is
  built from `PRESETS` at boot — **don't hardcode `<option>`s**, that's how the
  pet poses went missing from it once already.
- The lab **loads `dots.js`** rather than inlining a copy, so there is one
  generator. (The marketing site's copy of the lab does inline it — that page
  has to run standalone.)
- ⚠️ **Rotate dot assets in RIGHT ANGLES ONLY.** A dot matrix at an off-axis
  angle smears its dots off the pixel grid and reads as mush — let the artwork's
  own 45° steps supply any diagonal.
- Shared with the marketing site (`../spindeck_website_proto`), where the same
  generator is `main.js` §0. Keep them in step if either changes.
- **New icons and assets should use this language** rather than stroked paths.
- **`.v3-nowbar`** sits in the bump, inset to the plateau (x 98.5→480.7 of 576
  = 17.1%→83.5%) — see *Now-playing ticker*. It is a **sibling** of the nav, not
  a child, so its `bottom` is a px offset tuned to the docked bar's 62px height.

Pinned to the bottom because `.s-home-v3` is `height: 100%; overflow: hidden`
(constrains the flex column).

### The scoop plug, the blur and the bottom fade
- **`.v3-nav-blur`** (z-3) — an **unmasked** `backdrop-filter` across the nav's
  whole box. ⚠️ The glass's own blur is masked to the BAR shape, so it stops at
  the scoop and at the corners beside the bump: content passing behind those
  regions was never blurred, only covered — so any coverage gap showed as *sharp
  text*. This makes the worst case soft instead of legible. Belt and braces
  under the plug, not a replacement for it.

The scoop is a real hole — `.v3-nav-glass` is masked to the bar shape, so the
scoop falls outside it and content scrolling behind the nav showed through it
sharp and unblurred. Two sibling layers fix that, both at `z-index: 4` (over
content, under the nav at 5 and the pet):

- **`.v3-nav-nest`** — the **negative of the bar**: an enclosing rect MINUS the
  bar path via `fill-rule='evenodd'`. So it plugs the scoop *and* the two corner
  gaps either side of the bump, and **by construction every pixel inside the
  nav's box is covered by either the glass or the plug**.
  ⚠️ **This is the fix for the "artifacts" — feed text leaking through
  sub-pixel seams** wherever the bar's fill ended and nothing else began. It
  showed as a mottled, dashed-looking hairline along the scoop's flat top and
  along the fillets. Two things were needed and neither alone was enough:
  masking the *whole* negative (patching just the scoop left the corners), and
  **stroking the mask path** (`stroke-width='2'`) so the plug dilates 1 unit into
  the bar and the two overlap instead of butting edge-to-edge.
  ⚠️ Curved edges hide this class of bug — their mask edge crosses pixels
  diagonally. Flat runs expose it. So a seam can look fine on the fillets and
  still be obvious on the scoop's flat top.
- **`.v3-bottom-fade`** — content runs out of road instead of being chopped off
  by the bar. ⚠️ Its opaque band must reach the nav's **top edge** (46% of its
  height ≈ 63px, just past the 62px bar). Stop it short and content steps from
  part-faded straight to the plug's flat colour, drawing a visible line along the
  top of the bar in the corners beside the bump.

⚠️ **Both fill with `background-color: inherit`, and that is deliberate.** The
screen background comes from SIX places — the dark base, the light variant, the
review flood, the artist override, and the persona skins — so mirroring it into
a variable would rot the first time a seventh appears. Inheriting tracks
whatever is actually painted, the album flood's transition included. Verified
matching on the bento, the album page and a persona.

- This only works because they are **direct children of `.s-home-v3`**. Move
  them inside `.v3-bottom-nav` and they inherit its transparent background.
- The fade is a solid block revealed by a **mask** gradient, not a colour-stop
  gradient — a gradient can't say "whatever the background happens to be".

### Silhouette geometry — how to rescale it
At the 385px mockup: bar **62px**, plateau **17.1%→83.5%** (255px), scoop
**33.1%→65.1%** (123px at its opening, 68px at its flat top), **33px deep** with
softly rounded lips where it meets the bottom edge.

⚠️ **The scoop no longer reaches the shoulder.** Its flat top is y=43.12 while
the shoulder — the level the bar's flat runs sit at — is y=34.12, so it stops
9 units (6px) short. The first two indent drafts had them on the same line;
anything that assumed that is wrong for this one.

⚠️ **The scoop is drawn 2 units LOWER than the .svg**, in both the outline path
and the plug mask. The bar's bottom edge is bled to y=101 (below the clip), so
the path has to jog up to the scoop's drawn mouth at y=92.01 — and the last
~1 unit of that jog lands *inside* the viewBox, painting a **1px vertical tick
at each bottom corner of the scoop**. Tiny, but very visible against the plug.
Dropping the scoop's mouth to y=94 clips the jog away with everything else.
Verify with `path.isPointInStroke()` at x=190.777 and x=375.209 — both should
return nothing between y=86 and the viewBox bottom.

Each side transition is a **concave fillet (r=14.22) into a convex corner
(r=17.78)** — together a 32-unit 45° S-curve, since r1+r2 equals the rise and
also the horizontal run. ⚠️ **Keep the r1:r2 ratio (0.444 : 0.556) if you
rescale**, or the swoop changes character. Control points are at `0.5523 × r`
from each end along the tangent (the circular-arc constant) — eyeballing them
gives a visibly non-circular curve. The two independent dials are the **viewBox
height** (bar thickness) and the **plateau x-bounds** (bump width vs. flat run);
regenerate rather than hand-editing coordinates.

⚠️ **The left, right and bottom edges are drawn 8 units OUTSIDE the viewBox**
(x −8→542, bottom y 87). The `<svg>` and the mask both clip to the viewBox, so
those three strokes are cut away and only the top contour — shoulders and bump —
is outlined. Pull them back inside and a hairline reappears down both screen
edges.

**History:** it first floated — 72% wide, centred, 24px off the bottom, every
corner rounded (`BOTTOM_NAV.svg`, viewBox 553×126). Docking it full-bleed
(534×117) overshot at 84px; 534×90, then 534×79, shrank it with longer flats;
534×94 took it back to 68px. The current 576×93 is a **hand redraw** that adds
the scoop — so the earlier "keep the r1:r2 ratio" arithmetic describes how the
generated versions were built, not this one. Edit the drawing, not the numbers.

- ⚠️ **`aspect-ratio: 576 / 93` is load-bearing.** The SVG is
  `preserveAspectRatio="none"` and the mask is sized `100% 100%`, so both *will*
  stretch — the aspect-ratio is the only thing keeping the fillet curves true.
  Don't swap it for a fixed height.
- The glass shadow casts **upward** (`0 -8px 28px`); there's nothing below the
  bar to catch a downward one any more.
- Every screen's scroller clears it with `padding-bottom: 75px` (62px bar + 13).
  A new screen on this shell needs the same.

### Procedural Color System
`applyAlbumColors(screenEl)` in `app.js` runs after every render:
1. Reads album art URL from `.v3-album`'s `background-image`
2. Draws to 48×48 canvas, finds most vibrant pixel
3. Sets on `.s-home-v3`: `--v3-accent`, `--v3-box1-bg`, `--v3-box2-bg`

Light theme overrides these with hardcoded values (`background: #999`) — still WIP.

### Music Preview System
30-second Apple Music previews, played via a single reused `<audio>` element. All in `app.js`.

**Fetching (`fetchPreviewUrl`)** — iTunes Search API over JSONP (no CORS). Two hops: album search → track lookup. Cached by `"artist – album"` (lowercased):
- `PREVIEW_CACHE` — resolved results (a URL, or `null` for a known miss).
- `PREVIEW_PENDING` — in-flight promises, so concurrent lookups for the same album share one request.

**State (`PREVIEW`)** — intent is the single source of truth; the UI **never** reads `audio.paused` (it lags while buffering, which made the icon "invert" on 5G):
- `on` — preview mode armed (speaker). `paused` — CD-paused within the mode. Playing ⟺ `on && !paused`.
- `gen` — token bumped on every tap and every album change; a late fetch bails if `gen` (or the album `key`) changed while it was in flight, so a slow result can't hijack the audio.
- `unlocked` — the element is unlocked once, synchronously, inside the first tap gesture (a runtime-built silent WAV). iOS only permits programmatic `play()` after that — this is why previews wouldn't start before.

**Actuation (`playPreviewFor(album, gen)`)** — plays the preview for a **specific album passed in**, resolved through the cache. It must NOT re-query the DOM for "the current album": there are multiple `.s-home-v3` instances (variants + mobile clones) and `querySelector` returns the first, which often isn't the one you swiped — that was the "swipe plays the wrong/stale track" bug. `loadPreview(album)` (called from `setMainAlbum` on every album change) passes the swiped album straight through. Only the tap handlers use `currentBentoAlbum()`, which prefers a **visible** screen.

### Album Swipe & Text Animation
`setMainAlbum(screenEl, album, animate, animateText = animate)` splits two concerns:
- `animate` → **art** motion (cover `slideIn`, CD reload).
- `animateText` → **type** motion (artist/album typewriter, stars fade, quote typewriter).

They're decoupled because a **swipe** already filmstrips the cover art itself, so it passes `animate:false, animateText:true` (via `applyAlbumIndex(..., animateText)`) — the art slides through the swipe layers while the title/quote still typewrite in. A **"For You" tap** passes both `true`.

---

## Playlists / Library v2 (`playlistsHtml(light)` in screens.js)

Adapted to the home shell like the wall: `.s-home-v3 .s-pl2` + `appHeader()` + `.v3-body > .pl2-scroll` + `nowBar()` + `bottomNav('playlists')`, rendered as a Float·Dark/Float·Light getter pair. **Playlists only** — no page title (the pills ARE the header; the old "Library / yours, catalogued" heading and the Artists/Albums/Songs/Genres tabs are gone). The top bar (`.pl2-topbar`) is two sort pills, then on the right an embossed **Discover** button and an embossed **"+" (new playlist) button** (both share the `.v3-search-pill` neu-emboss; "+" is prototype-only, no handler). Pills reuse the wall's `.wall2-bar`/`.wall2-cat`, switched client-side by `plTab(btn, tab)` in app.js (toggles `hidden` on `.pl2-sec[data-tab]` sections; no re-navigation — `plTab` also clears/sets `.active` on `.pl2-discover`, which acts as a third tab and fills `var(--star)` when active); the pill row scrolls horizontally and **fades out at the right edge** (CSS mask) when it overflows:
- **All Playlists** — chronological (the `plLists()` order)
- **Popularity** — favs desc
- **Discover** — community playlists (`creator !== 'you'`), most-loved first (`plays` still lives in `plLists()` data, currently unused)

Card geometry comes from Eric's `PlaylistBox_NEW.svg` / `PlaylistHLBox_NEW.svg` (688×158, scaled ~0.51): a split card — custom image panel (left) flush against the info panel (right: large title / `by creator · edited Xd ago` / `N songs · ♥ favs`). The `--hl` variant carves a concave scoop from the info panel's **lower-right** corner (screen-bg carve path, theme-specific color) and seats Eric's rounded tag in it with an icon centered inside; the tag recolors per type — **yellow + crown = community favorite (favs > 25)**, **blue + candle = staff pick (`staff: true` in `plLists()`)**; staff pick wins the slot if both apply. Ten sample lists (data in `plLists()`, shared with the playlist page) carry memey user-typed titles (mixed case, stray symbols — they're personal, not editorial), **custom cover art** (`images/playlist-*.jpg`, sourced from Eric's own images — deliberately NOT album covers), an `edited` stamp, and `plays`. Card click → `openPlaylistPage(name)`.

Apostrophes in names are escaped with the same inline `replace(/'/g, '\\\'')` idiom the wall uses. (`openArtistPageFor` in app.js and the `.pl2-artist`/`.pl2-song`/`.pl2-genre` CSS survive from the removed tabs, currently unused.)

## New Playlist (`playlistNewHtml(light)` + `PLNEW` in `app.js`)

The creation page behind the Playlists **"+"** (`.pl2-add`, which was a dead
`event.stopPropagation()` stub) — `openNewPlaylist()` resets state, pushes the
back stack and navigates to `playlist-new`.

**The concept:** it's built on the *same geometry as the playlist detail page* —
Eric's `PlaylistPageBox.svg` panel path, the image panel, the CD in its swoop —
so the form reads as the page you're filling in. Pick a cover and the panel + CD
both take it; type a name and it lands in the title; add songs and the count
ticks up. By the time you press Create you've already seen the result.

- **Fields:** cover · name (inline input styled as an editable `.plp-name`) ·
  **Public / Private** pills in the slot the detail page gives the heart ·
  add-songs (search **or** library) + a removable chosen list. No description
  field — the data model and the detail page have nowhere to show one.
- **Layout order** (deliberate, don't shuffle it): hero → **Create** → search +
  Library → **chosen songs** → results. Create sits at the top so it stays
  reachable no matter how many songs get added, and the chosen list sits directly
  under the search so picks stack up beneath it as you go. There's no "Songs"
  heading, and `plnewChosenHtml()` returns **nothing** when the list is empty
  (`.plnew-chosen:empty` collapses) — the results hint already says what to do,
  so a placeholder there would only push the results down.
- **Cover is a real upload.** The well is a `<label>` wrapping a hidden
  `<input type="file">`, so the whole panel opens the native picker;
  `plnewUpload()` reads it to a `data:` URL into `PLNEW.cover` (which survives
  re-renders — the file input's own value does not). There is deliberately **no
  cover suggestion strip**; covers are custom art, per the sample data.
- **Two ways to add songs**, side by side under the chosen list:
  - **Search** (`plnew-searchbar`) over `plnewPool()` — every `songsFor()` track
    across `ARCHIVE`, flattened once. Keyed `album::trackNo::title`; **the track
    number matters**, because `songsFor` picks titles from a word list and one
    album can end up with two tracks of the same name, which keying on
    album+title alone would merge into one row.
  - **Library** (`plnew-libbtn` → `PLNEW.mode = 'library'`) — pulls from the
    playlists you already have, since the Playlists screen *is* the library in
    this app. Lists `plLists()`, tap one to open its tracks, add individually or
    **Add all** (`plnewAddAll`, deduped by key). Typing in search switches the
    mode back.
- **Nothing is listed until you act** — no query and no library selection shows a
  one-line hint, not a suggestion list. (An earlier cut pre-filled suggestions
  from `featuredAlbum` + `trendingAlbums`; note if you ever reinstate that,
  **`trendingAlbums` is the whole archive minus the feature — ~145, not five,
  despite the name** — unsliced it renders hundreds of rows and janks the page.)
- **Create** (`plnewCreate`) builds a real playlist object, `unshift`es it onto
  `window.PLNEW_CREATED`, and navigates to its detail page. `plLists()` spreads
  `PLNEW_CREATED` in at the **front** of the library, and `playlistPageHtml`
  renders `pl.songs` when present instead of its seeded stand-in tracklist — so a
  playlist you build shows the actual songs you picked. Disabled until it has a
  name; 0 songs is allowed and the detail page shows a `.plp-empty` state.
  No upload? the cover falls back to the **first track's album art**, and only to
  `images/spindeck-appicon.png` if the playlist is empty too, so a library card
  is never a broken image.
- **`plTracksFor(pl)`** (screens.js) is the single source of a playlist's
  tracklist — real `pl.songs` if it has them, else the seeded stand-in. Both the
  detail page and the library browser call it, so they can't drift; its keys
  match `plnewPool()`'s so the picker knows what's already added.

**Rendering discipline — read this before touching it.** State lives in `PLNEW`;
the screen paints it two ways:
1. `playlistNewHtml()` renders the current state **directly** (the getter pattern
   the other dynamic screens use), so a fresh render is always correct on its own.
2. `plnewSync()` patches the **live** instances after an edit, rather than
   re-rendering — a full re-render would blow away the caret of the field being
   typed in. It also keeps the viewer's side-by-side dark/light variants agreeing
   (the same problem the onboarding wizard solves with `obSync`). Inputs are only
   written when the value actually differs, so the instance being typed in is
   never touched. The markup builders (`plnewCoversHtml` / `plnewChosenHtml` /
   `plnewResultsHtml` / `plnewCountLabel` / `plnewCreateLabel`) are shared by both
   paths.

An earlier cut relied on a post-render `plnewInit` hook alongside the `obInit`
calls in `renderViewer`'s rAF; it silently never fired when arriving via the "+"
(the screen rendered as a bare shell with empty containers) and was removed.
**Don't reintroduce a render hook here** — the getter is what makes it reliable.

## Playlist Page (`playlistPageHtml(light)` in screens.js)

The detail page for one song playlist. Geometry from Eric's `PlaylistPageBox.svg` (688×303): the hero is an `aspect-ratio: 688/303` box — image panel + CD are positioned divs (percent coords straight from the SVG); the info panel and Popular dog-ear are **his exact SVG paths inlined** (`.plp-shape-panel`/`.plp-shape-tag`, filled via CSS per theme). The info panel has a concave swoop carved from its bottom-right; the spinning CD (reuses `v3spin` + `.v3-cd-hole`) seats in it and overflows below the panel.

- Rendered from `window.activePlaylist` (set by `openPlaylistPage(name)` in app.js; falls back to `plLists()[0]`).
- Info panel text: title / `by creator` / `N songs · edited Xd ago` / **majority genres** (`.plp-genres`, top 3 genres counted across the tracklist's albums, faint light letters).
- Tracklist: seeded (`seedRand(name + '::pl')`) pick of archive albums, one `songsFor()` track each — deterministic per playlist. Rows are **one line** (song title boldest → album mid → artist lightest — deliberate exception to the artist-bold convention) that **fades out via mask** when too long, plus a numeric rating and duration. Ratings cluster near 4.0 (±0.35) with 1–2 seeded outliers (dud or banger). Row click → log sheet via `plSongTap`.
- **Back pill** (`.plp-back-pill`, above the hero): styled like the home live pill (same `.v3-search-pill` neu-emboss — solid bg, dual shadow, no border) and reuses its 6-dot ring — arrow points **left** (back) regardless of hand mode; the formation rules sit before the reaction formations in app.css so those still win.

**⚠️ The dot FACE is retired.** The 6-dot ring used to double as a mascot: a
`.v3-ring--smile` formation (2 eyes + a 4-dot mouth) and a `.v3-ring--wink`
keyframe, flashed from four places — `plRingSmile()` on the back pill (playlist
favourite + an 11s timer), `greetRing()` on the first home render, and
`homeRingPeek()` every ~10s on the bento, plus a half-broken wink on the
profile's Follow button that added `--wink` *without* `--smile`, so it animated
dots still in the ARROW formation. All gone, along with the formations and
keyframes: **the nav's pet carries the app's personality now**, and these are
controls. The dots keep the arrow plus the swipe / For-You / CD reactions.
- **CD click** → `togglePlPlat`: streaming-platform menu (Spotify / Apple Music / SoundCloud, same icons as the review page's stream sheet), reusing `.wall2-menu` styling.
- **Favorite**: `.plp-fav` heart pill → `togglePlFav` — toggles, adjusts the count, and persists `favs`/`faved` onto `activePlaylist` so re-renders keep the state.
- `‹ Library` back button → `navigate('playlists')`; bottom nav stays on the playlists tab.

---

## Profile — "Funky" theme 01 (`profileHtml` + `PROFILE` in `app.js`)

744×889 layout traced from `Profile_Theme_01.svg`, with Eric's **textured skin
PNG** (`images/profile-skin-01.png`, 800×800) laid **over the base part** for the
old-school/Winamp look. Layers (low→high z):
1. **Emboss base panel** (`.prof-base`, z1) — main outline + info blob + social
   tab, filled `--pf-base` and embossed OUT (dual `drop-shadow`).
2. **Profile picture + 5 favourite-album wells** (z2) — embossed IN (inset
   shadows), positioned in the 744×889 coords.
3. **The skin** (`.prof-skin`, z3, `pointer-events:none`) — scaled/offset
   (`left:-3.79%; top:-4.65%; width:107.74%`) so the PNG's holes register exactly
   on the pic + CD circles. Its edges frame them; clicks pass through to the
   wells. **If the skin art changes, re-derive that transform** (align the big
   pic-hole to the base pic circle; every CD then lines up).
4. **Labels/controls on top** (z4-6) — `.prof-fav-tag`, `.prof-social` (+
   `.prof-soc-menu`), `.prof-info` bio. Elements over the brown skin use fixed
   light ink; the bio sits below the skin's lobe on the emboss panel.

Wrapped in the **home shell**: `.s-home-v3 .s-prof2` + `appHeader()` +
`.v3-body > .prof2-scroll` + `nowBar()` + `bottomNav('profile')`. **Username in the
top gap** (`.prof2-userbar`). Rendered **Funky·Dark / Funky·Light**; tokens
(`--pf-base/-lt/-dk/-ink/-well-*/-fg/-surface/...`) scoped to `.s-prof2` and
`.s-prof2.s-home-v3--light`. (An angular theme 02 is planned.)

- **State** in `window.PROFILE` (`name`, `handle`, `bio`, `pic`, `favs` = 5 album
  names, `socials`). Pic currently borrows `images/playlist-statue-night.jpg`.
- **Favourite albums:** each `.prof-alb` (under a CD hole) → `openProfPicker(slot,
  btn)` opens a bottom-sheet album picker (`#prof-picker`); `profPick(name)`
  writes `PROFILE.favs[slot]` and `renderViewer()`s.
- **Social:** `.prof-social` tab → `toggleProfSocial` opens `.prof-soc-menu`;
  `openSocial(id)` deep-links to instagram/x/soundcloud + the stored handle.
- The card's pencil (`.prof-edit`) opens **Edit Profile** — see below.
- Being an `.s-home-v3`, `populateHomeData` runs on it (now-playing bar) — the
  bento-only calls no-op just like on wall/playlists.
- **Deploy note:** `images/profile-skin-01.png` is a new asset — `git add` it.

---

## Edit Profile (`profileEditHtml` + `PFEDIT` in `app.js`)

The customising page behind the profile card's pencil (`.prof-edit`, previously a
dead `event.stopPropagation()` stub). `openProfileEdit()` seeds the draft, pushes
the back stack and navigates to `profile-edit`.

**There is no form.** The page *is* the profile — the same card plus the same
Playlists and Favourite-songs sections — drawn from the draft, with every
editable region turned into a **slot**:

- a **filled** slot carries `.pfe-slot`: a persistent gold **"+" badge**
  (`::before`) so it reads as swappable without having to hover, plus a dashed
  outline (`::after`) on hover. Tapping swaps its content;
- an **empty** one renders a `.pfe-add` "+" tile instead of collapsing;
- both open the same popup, so nothing extra is added to the page.

The top bar reads **back pill · "Editing profile" · Save changes**, so the mode is
labelled rather than implied.

Badge placement is per-slot (`.prof-pic`, `.prof-info`, `.prof-meta`,
`.prof-name-tab-lbl`, `.prof-alb`, `.prof-pl`, `.prof-song` each get their own
offsets) because the card's regions butt right up against each other — a badge
hung off a generic corner lands on a neighbour or covers its own text. Note the
discs get `pfe-slot` from `profCanvasHtml`'s slot branch, **not** from the `ed()`
helper the other card regions use; they're built separately.

### The content editor (`openProfEditor(kind, slot)`)
One bottom sheet, reskinned by the **kind** it's opened with — that's what makes
"search depending on the category" work:

| kind | opened from | popup |
|------|-------------|-------|
| `album` | the five CDs on the card | searches `ARCHIVE` |
| `song` | Favourite songs rows | searches `plnewPool()` (every archive track) |
| `playlist` | Playlists tiles | searches `plLists()` |
| `photo` | the card's picture | grid of `PROFILE_PHOTOS` + a real upload tile |
| `name` | the name banner | small form (display name + handle) |
| `text` | bio / location | small form; config in `PFE_TEXT` |

`openProfPicker(slot)` is kept as a thin wrapper (`→ openProfEditor('album')`)
because the *non-edit* profile card's discs still call it.

### State
`PFEDIT` is a **draft** copied from `PROFILE` on open, so **Cancel genuinely
discards** and Save is the only thing that commits. Every pick writes through
`profFavTarget()` — the draft when the edit page is open, `PROFILE` otherwise.
`pfeditDraft()` seeds it lazily so the screen also works opened straight from the
viewer's left rail.

No sync layer and no post-render hook: each pick re-renders, and since nothing on
the page itself is typed into (the only inputs live inside the popup) a full
re-render can't steal a caret.

### Two traps
⚠️ **`pfeditSave` must NOT call `goBack()`.** `captureScreenSnap()` stores
`{...window.PROFILE}` for the `profile` screen and `goBack` does
`Object.assign(window.PROFILE, snap.profile)` — going back after a save would
restore the pre-edit copy and **silently revert it**. Save drops that snapshot
(`backStack.pop()`) and calls `navigate('profile', 'back')`; the `back` direction
is also what stops `navigate` re-rolling the random persona (`randomizeProfile`).
Cancel *does* use `goBack`, where restoring the snapshot is exactly right.

⚠️ **`pfeditSave`'s `Object.assign` is a whitelist** — a field the page edits but
the list omits is silently dropped on save even though the UI looked like it
worked. It currently covers name/handle/bio/location/occupation/pic/favs/socials
**plus `favSongs`, `playlistNames`, `playlistCovers`**. Add to it when you add a
slot.

### CSS gotcha
`.pfe-slot` must **not** set `position: relative`. The card's regions
(`.prof-pic`, `.prof-info`, `.prof-meta`, `.prof-name-tab-lbl`, `.prof-alb`) are
absolutely positioned from the traced SVG coordinates, and relative drops them
back into normal flow and wrecks the card. They already establish a containing
block for `::after`; only the flow-level rows (`.prof-pl`, `.prof-song`) get
`position: relative` added.

### Shared card
**`profCanvasHtml(P, opts)`** (screens.js) is the profile CARD, extracted so the
profile screen and the edit page can't drift apart. `opts.edit` drops the Follow
button and the pencil (it's your own page), turns each region into a slot, and
sends every album disc straight to the picker instead of the listen/platforms
menu. It takes the record to draw, so the edit page passes the **draft**.

**Not editable here:** the stats (generated persona data), Recently-rated (that's
activity, not customisation), and socials — the profile card doesn't render them,
so per the "no extra UI" rule they get no slot. **Not built:** a theme picker;
"theme 02 (angular)" doesn't exist yet and a control for it would just be another
dead affordance.

## Notifications (`notificationsHtml` + `ntfItems` in `screens.js`)

The activity inbox behind the header's **bell** bubble. Standard `.s-home-v3`
shell (`appHeader` · `v3-body` · `nowBar` · `bottomNav('home')`), back pill →
Home. Shares its scoped colour tokens with Settings (see below).

- **Data** — `ntfItems()` is a hand-authored array, not generated: the copy
  carries the app's voice and each row names a real `ARCHIVE` album so the art
  resolves. `ntfPeople()` maps each community handle (the same accounts that
  author the sample playlists in `plLists`) to ONE `rp-*` photo, so a person
  looks like themselves everywhere they appear.
- **Row anatomy** — avatar + kind badge · copy · time · trailing slot. The
  trailing slot is an album thumb, or a **Follow** button on a follow row
  (`ntfFollowBack`). **System rows** (`release` / `milestone`) have no person,
  so the album cover becomes the avatar — and they get *no* trailing thumb,
  which would just be the same cover twice (`isSys` guards both).
- ⚠️ **A row is a sentence, and its shapes are its grammar.** Round avatar =
  the **subject**, and it is a **person**; rounded-square = a **record**. Read
  left to right: round subject · verb in the copy · square object. The two
  apparent exceptions both obey it — a follow row's trailing art is the
  **artist's photo**, so it goes round (`.ntf-art--round`), and a milestone has
  no person, so the cover stands in as the subject and stays square
  (`.ntf-ava--art`). ⚠️ `.ntf-badge` moved from `-5px` to `-2px` with the
  circle: a corner offset tuned for a square leaves the badge floating off a
  round avatar.
- ⚠️ **Copy is SUBJECT · VERB · OBJECT everywhere**, in the inbox and in the
  home feed, so the screens read as sentences instead of as a log. Keep new
  verbs in that shape — an object-first line says the same thing and destroys
  the scan. `milestone` was the one row that broke it (it rendered "Your review
  of" unstyled and let the album take the emphasis, so it read object-first);
  it now carries an explicit **`subj`** + optional **`link`** + object + `tail`.
  The object (album / playlist) is still optional — a follow row has none, so
  `line()` must not interpolate it blindly. Album names render regular weight,
  people/artists bold, per the app-wide convention.
- **No page title and no filter pills** — both were removed; the rows start
  straight under the top row (back pill · unread chip · Mark all read), which is
  what the screen looked best as. `ntfTab` (the pill handler) and the rows'
  `data-tab` attributes survive unused, so a `.ntf-bar` of `.wall2-cat` pills
  brings filtering straight back.
- **Unread** — `.ntf-row--new` fills the row and draws an accent **left rail**
  (`::after`). It is deliberately not a top-right dot: the right edge is
  occupied by the trailing thumb / Follow button. `ntfMarkAll` strips the class,
  removes the `.ntf-count` chip (now in the top row, beside its own button) and
  disables the button.
- Group headers are `position: sticky` against `.v3-body` (the scroller) and
  need the opaque `--sd-bg` fill so rows don't ghost through them.

## Settings (`settingsHtml` in `screens.js`)

Behind the header's **gear** bubble; back pill → Profile. A grouped list built
from small local helpers inside `settingsHtml`: `setRow(label, sub, control,
onclick)` · `section(title, rows)` · `service(...)`, with four control types —
switch (`sdToggle`), segmented picker (`sdSeg`), status pill (`sdConnect`), and
a chevron link. Sections: Appearance · Connected services · Playback ·
Notifications · Privacy · About.

- The account card up top reads `window.PROFILE` (so it follows the random
  persona) and taps through to Edit Profile. **Sign out** (`navigate('auth')`)
  sits directly beneath it — account actions together at the top, not buried
  under six sections of preferences — so the card's `margin-bottom` is tight
  (9px) and `.set-signout` carries the 20px gap down to Appearance.
- **Show listening activity** heads the *Connected services* card rather than
  living in Privacy: it governs what those services broadcast, so it reads as
  the master switch above them.
- The Theme segment's initial active option follows the variant being rendered
  (Dark variant → "Dark"), so the two mockups don't contradict their own chrome.
  It's presentational — it does not re-theme the screen.
- On a service row the **pill alone** carries connect state; the sub-label stays
  the description of what the service gives you either way.

### Shared tokens
`.s-home-v3, .s-ntf, .s-set` define `--sd-bg / --sd-ink / --sd-ink2 / --sd-ink3
/ --sd-card / --sd-card-hi / --sd-line / --sd-well / --sd-hover`, and
`.s-home-v3--light, .s-ntf.s-home-v3--light, .s-set.s-home-v3--light` redefine
just those nine. That's the `--pf-*` pattern from the profile screens — **light
theme is one variable block, not a parallel rule tree.** Prefer it for new
screens.

Scoped to the whole `.s-home-v3` shell rather than just these two screens
because **the home activity feed reuses the `.ntf-*` row** (see *Scroll Area*).
`.s-ntf` / `.s-set` are themselves `.s-home-v3`, so they survive in the selector
lists only to carry the more specific light block. `--sd-bg` is already exactly
the home shell's own background in both themes, which is what lets the badge's
punch-through ring read as a clean cut-out on all three screens.

⚠️ Because the rows are shared, **anything you change in `.ntf-row` and friends
changes the homepage too** — which is the point; resist adding a home-only
override.

### Both screens render twice
The viewer shows Dark and Light side by side, so every handler
(`ntfTab`/`ntfMarkAll`/`sdToggle`/`sdSeg`/`sdConnect`) scopes to
`btn.closest('.app-screen')`. A document-wide query would drive both copies at
once — same rule as `plTab`.

## Onboarding Wizard (`onboardingHtml` + `OB` state in `app.js`)

An 8-step signup flow, entered from the Auth screen's buttons (`obStart()` resets
state then `navigate('onboarding')`). All panels live in one `.s-onboarding` DOM;
JS shows one at a time.

**Steps:** `0` username · `1` connect service (Spotify/Apple/SoundCloud) · `2`
allow listening-tracking (**only shown if a service was connected** —
`obActiveSteps()` drops it otherwise) · `3` genres · `4` artists · `5` albums ·
`6` people you may know · `7` minimal profile (the payoff → `Start exploring` →
`navigate('home')`).

- **State** lives in the module-global `OB` object (username, service, tracking,
  and `Set`s for genres/artists/albums/following, plus per-wall search query).
  It persists across re-renders; `obStart()` resets it.
- **Multi-instance:** the viewer shows the dark + light variant side by side, so
  every action mutates `OB` then `obSync()` re-applies state to **all**
  `.s-onboarding` instances. `obInit(root)` is called per instance after each
  render (wired into `renderViewer`'s rAF + the mobile paths).
- **Artists/Albums walls** (`obRenderWall`): data derived from `ARCHIVE`
  (`obArtistList()` = unique artists w/ album-art avatar; albums = the archive).
  Search filters the wall; tapping a card toggles selection — selected items get
  a checkmark overlay **and** are pinned as chips in the `.ob-pinned` row above
  the wall. Skippable, but 3+ is encouraged (copy only; no hard gate).
- **People you may know** (`obPeopleList`): `FRIEND_ACTIVITY` handles + a few
  extras, each with a fake mutual count and a Follow toggle.
- **Footer** is contextual (`obSyncFooter`): Continue is disabled until a valid
  username (step 0); Skip shows only on the optional steps (1,2,4,5,6); Continue
  shows a live selection count on the pick steps.
- Onclick args are escaped with `obOc()` (HTML-attr + JS-quote safe) / `obEsc()`.

---

## How Screens Work

`screens.js` exports a `SCREENS` array. Two helper functions:
```js
topNav(active)           // 'playlists' | 'feed' | 'home'
halfStars(rating, size)  // halfStars(4.4, 16) → star span HTML
```

### Three traps in the vinyls (all found the hard way)

1. **Draw the disc with a gradient mask, never an SVG `mask-image`.** An SVG mask is rasterised once and then *sampled*. At ~10px, with a fractional size and gap, every disc in a row lands on a different sub-pixel offset and samples that bitmap differently — so they render at visibly different weights and **the first one looks bigger than the other four**. `.hstar` now uses `radial-gradient(circle closest-side, transparent 0 20%, #000 21% 91%, transparent 92%)`, resolved at paint time at device resolution. Stops map 1:1 onto the old artwork (hole radius 10% of the box, outer edge 45.5%). `halfStars` also **rounds** its size and `.hstars` uses a whole-pixel `gap`; the old `×0.72` gave `10.08px` and the gap was `1.5px`.
2. **`--vinyl-empty` follows the SURFACE, not the theme.** Light mode is mostly cream, so the default flips to dark ink — but the bento stats block and the review panel sit on the album's **procedural colour, which is dark in both themes**. Theming those by variant put dark ink on a dark album and the empty vinyls vanished. `.s-home-v3--light .v3-blue-stars-row, .v3-rev-card, .v3-rev-hist` override back to the light value. (`--text3` remains the fallback for everything else that uses it.)
3. **`vertical-align` does nothing on `.hstars`** — it's a flex item of `.v3-blue-stars-row`, and flex items ignore it. Alignment there comes from the row's `align-items: baseline`, which already puts the disc **boxes** exactly on the number's text baseline (measured: 0.00px off). A disc is still taller than the digits' cap height, so it looms; `.hstars` carries `transform: translateY(10%)` as an *optical* correction, scale-relative so it holds at every rating size.

`halfStars(rating, size)` now renders **vinyl records, not stars** — every rating across the app routes through it. Each unit is a `.hstar` span masked by `--vinyl-mask` (a disc-with-center-hole SVG); `full`/`empty`/`half` just set the background (half = a 50/50 `--star`/`--text3` gradient under the mask). Sizes are scaled ×0.72 so a vinyl matches the old ★ glyph's footprint (its top lines up with an adjacent number's cap height). `--text3` still controls the empty color per screen.

> Note: ~38 inline plain `★` glyphs in text bits (e.g. "4.4 ★" labels, `.star-pick`, `.dorf-act-rating`) do **not** go through `halfStars` and are still literal stars.

---

## Log Sheet — Letterboxd-style logging (`app.js`)

`openLogSheet(triggerEl, subject?)` builds a **singleton** bottom sheet (`#sd-log`) lazily and mounts it into the triggering `.app-screen` so it stays inside the phone frame. Reusable from anywhere.
- **Subject:** defaults to the current bento album (`currentBentoAlbum()`); pass a `{ image, title, subtitle }` to log something else (a song does this via `openSongLog`).
- **Contents:** cover + title/subtitle header · large centered **vinyl rate** control (drag/tap for half-record ratings, `setLogRating`) · one-line **Listened (ear) · Listen later · Favorite** toggles (`toggleLogOpt`) · a review textarea · a footer status line. The sheet floats with 10px margins (matches the bento).

### There is no Save button — it autosaves
Every change writes through to `localStorage['spindeck-logs']`, so a half-typed
review survives closing the sheet, swiping to another album, and a reload. The
sheet **reopens where you left off** rather than blank.

- `saveLog()` debounces (~400ms) so typing isn't a write per keystroke; taps
  (rating, toggles, per-song ratings) pass `true` and write immediately.
  `closeLogSheet` flushes a pending debounce — closing must never drop the last
  few characters.
- ⚠️ **`_sdlogRestoring` guards the restore.** `openLogSheet` repaints through
  the same helpers the user's taps go through (`setLogRating` / `setSongRating`),
  so without the flag, loading a draft would immediately re-save it.
- `putDraft` **drops a draft that has nothing left in it**, so opening a sheet
  and touching nothing doesn't leave an empty record that reads as "in progress".
- `logKey(subj)` is `kind::title::subtitle` — the title alone collides (two
  albums can share a name; song titles are not unique across the catalogue).
- Per-song ratings are merged back **by title, not index**: the draft only
  stores tracks that were touched, so its indices aren't the tracklist's.
- With no Save button, the footer `.sd-log-status` is the *only* signal the work
  is kept. It reads "Saves as you type" at rest and flashes a green "Draft
  saved" for 1.5s on each write. The wording is swapped in JS; the `.on` class
  only carries colour and the tick.
- ⚠️ **Debugging note:** CSS transitions don't advance on a closed sheet (it
  isn't rendered), so `getComputedStyle` there returns frozen values from the
  previous state. Verify the status line with the sheet actually open, or you'll
  chase a cascade bug that isn't there.

The album page's **quick-log squares read and write these same drafts**
(`syncQuickLog` / `writeDraftFlag`), so the square and the sheet can't disagree
about whether you favourited a record — and a favourite survives a reload.
- The old inline compose block (`.v3-rev-mine` stars + textarea + Post) was replaced by a single `.v3-rev-cta` "Review, rate, log" button that opens this sheet.

### Quick log — the squares beside the CTA
The album page carries the **same three toggles** as a row of squares attached
to the CTA (`.v3-rev-cta-row` › `.v3-rev-quick` › `.v3-rev-q`), so marking
something listened / later / favourite costs one tap instead of opening the
sheet. They butt directly onto the button and each other — a `-1px` left margin
collapses the shared border, and only the outer corners are rounded, so the four
read as one cascading control. `align-items: stretch` gives them their height
from the CTA rather than hard-coding one.

Each is an **icon over a tiny label** (`.v3-rev-q-lbl`, 7.5px mono uppercase) —
the same stack as `.sd-log-opt` in the sheet. The glyphs alone were unreadable
at this size. ⚠️ **The label sets the button width**, not the icon: "LISTENED"
and "FAVORITE" are 8 mono characters, which is what 50px is for. All three share
that width so the cascade stays even. The whole row is ~260px of the ~310px
available, so there is room to grow the type before anything clips.

- **The glyphs are shared, not copied.** `SD_ICONS` (ear · clock · heart) is
  defined at the top of **screens.js**, and app.js's `SDLOG_ICONS` is an alias
  of it. It has to live there: the home screen's `html:` is a static template
  literal evaluated while screens.js parses, so anything app.js defines doesn't
  exist yet.
- ⚠️ **The toggles are your state on THIS record**, so `populateReviewPanel`
  re-reads them from the new album's saved draft (`syncQuickLog`) whenever the
  album changes — without that they'd persist across a bento swipe and claim you
  favourited the next record. They're re-read rather than merely cleared, which
  is what makes a favourite survive a reload.
- ⚠️ **Resolve the shell's album through `shellAlbum(scr)`, never `scr._album`.**
  `_album` is set by `setMainAlbum`, which only runs on the swipe and
  `openAlbumPage` paths — tapping the bento into the album page never calls it,
  so on that route `_album` is undefined and the fallback is what finds the
  record. Reading it raw silently gets nothing.
- Toggling one **syncs the twin shell** (dark ↔ light): they show the same album
  and this is state about the record, not the screen. Deliberate exception to
  the usual "scope handlers to the clicked shell" rule.
- They also render on the **artist page**, which inherits the CTA. Favouriting an
  artist reads fine; "listened" is looser. Split them if that ever grates.

## Tracklist (`populateSongList` / `songsFor`)

`.v3-rev-songs` sits below the CTA in review mode: a full-width table of **# · title · duration · rating (number + vinyls)**. Clicking a row → `openSongLog(this)` → the log sheet for that song. Song titles/durations/ratings are **deterministic placeholders** (`songsFor` seeds a PRNG from the album name; there's no real per-song data — `album.tracks` is only a count).

**Every track is listed, in flow.** It used to cap at ~8.5 rows and scroll inside itself (`.v3-rev-songs--scroll` → `max-height` + mask fade); that nested scroller hid the back half of a long album inside a page that already scrolls. Don't reinstate it.

**Column labels** (`.v3-song-head` — SONG · LENGTH · RATING, small mono uppercase) sit above the rows. The header is the *same flex row* as `.v3-song-row` and reuses its three cell classes, so labels track their columns instead of being positioned twice. ⚠️ The two right-hand columns are therefore a **fixed width** (`--song-dur-w` / `--song-rate-w` on `.v3-rev-songs`) sized to the *labels*, which are wider than the values they head — let them size to content and "LENGTH"/"RATING" each overflow the column and the header slides off its own list.

**2-line title handling:** a long album name wraps to two lines on the album page; `enterAlbumPage`/`setMainAlbum` measure it synchronously (full text → `offsetHeight`) and toggle `.v3-rev-title-2line`, which drops the CTA down a line.

## Review panel order

Top to bottom: CTA (`.v3-rev-mine`) · histogram · **tracklist** · artist albums
(artist page only) · **friend-rec pill** · filter tabs · review list.

- **The friend-rec pill (`.v3-rev-rec`, "X listened to this") sits with the
  reviews**, directly above the filter tabs — it's social proof, so it belongs to
  that section, not up beside the CTA where it used to push the whole panel down.
  Its old neighbours (`.v3-rev-rec:not([hidden]) + .v3-rev-top` and the hand-mode
  `margin-left: 90px`) are gone; it now aligns to the review list's 12px gutter.
- **The CTA is centred** (`.s-home-v3--review.s-home-v3--album .v3-rev-mine {
  align-items: center }`) — the art is full-width on the album and artist pages
  and there's no CD column to align against. The `:not(--album)` half of that
  rule pair styled the retired plain review state and is dead.

## Review cards (`populateReviewList` in app.js)

One card = `.v3-rev-card-top` (avatar · name · **`.v3-rev-acts`** · time) then
`.v3-rev-meta` (rating) then `.v3-rev-text`.

- **The social actions live top-right, the timestamp hard right.** `.v3-rev-acts`
  (upvote pill + comment count) carries `margin-left: auto`; `.v3-rev-time` is
  just `flex-shrink: 0` after it. They used to sit in the meta row pressed
  against the rating vinyls, which read as one crowded cluster.
- **The meta row is the rating, led by its verb** — `.v3-rev-verb` ("rated") +
  vinyls + `.v3-rev-score`. The card therefore reads **down** as one sentence:
  name (subject) → rated 4.0 (verb + object) → what they said. It's the same
  subject-verb-object rule the feed and inbox rows follow across, and the verb
  is what turns a bare row of vinyls into something you read rather than decode.
- **Four** builders emit this markup — the **pinned** card, the **list** card,
  and two **"mine"** cards (the inline composer's and the saved-draft one).
  Change all four together.
- ⚠️ **The pinned card is a HIGHLIGHTED ROW, not a card in a box.** It first
  shipped outlined in `--star`, inset 10px and rounded, and read as stifled — a
  panel sitting *on top of* the list rather than the first item *in* it. Now
  the tint bleeds past `.v3-rev-list`'s 12px gutter (negative margin) while the
  padding puts its text back on the same left edge as every other review, so
  the list reads as continuous with one row lit. Its `.v3-rev-pin-chip` says
  why it's lit; it needs no border to explain itself. ⚠️ The negative margin
  has to match the list's gutter — change one and change the other.

### Comments (`revThread` / `cmtThreadHtml` in app.js)

Every review card carries a **threaded comment section**, collapsed behind the
comment pill in `.v3-rev-acts` and expanded under `.v3-rev-text`. Replies nest
Reddit-style; **`CMT_DEFAULT` (3)** top-level threads show, the rest sit behind
*"View n more comments"*. There's a like on every comment and one composer per
thread — **Reply aims that composer at a comment** (`CMT_REPLY_TO`) so the post
nests under it; posting with nothing aimed lands at the **base** of the thread.
The gold *"replying to @handle ✕"* chip is the only thing that says which, so
it doubles as the way out of reply mode.

- ⚠️ **`CMT_MAX_DEPTH` (3).** Past it a reply attaches to its target's
  **parent** instead of the target — each level costs 17px of a ~360px column,
  so a fifth indent leaves the text too narrow to read. Generated comments cap
  at depth 2; this is the ceiling for the ones you write.
- ⚠️ **`cmtReply` holds the WRAP, not the thread.** `cmtRender` replaces the
  thread's markup, so a reference into it is stale by the time the input wants
  focus; the wrap element survives the repaint.
- ⚠️ **Your comment ids come from `CMT_SEQ`, not `CMT_MINE.length`.** A nested
  reply lives in its parent's `kids` and never joins that list, so two replies
  in a row would both be `me0` and `cmtFind` / `CMT_LIKED` would confuse them.
  For the same reason the badge counts through `cmtRoots`/`cmtSize` rather than
  `CMT_MINE.length`, which would miss every nested reply.
- ⚠️ **The thread's type runs a step LARGER than the card above it.** It first
  shipped at the card's own scale (10px body, 8.5px actions) and that is too
  small once you're reading a conversation rather than scanning a list — the
  card is a summary, the thread is the thing you came for. The `.v3-up` pills
  were bumped with it; at 9px with a 10px glyph they read as decoration rather
  than as controls. ⚠️ That growth is also why `.v3-rev-name` now ellipses:
  it's the only elastic thing in the card's top row, which on the pinned card
  also carries the "from your feed" chip and the timestamp.

- ⚠️ **The `💬 n` count is the INPUT to the generator, not a second seeded
  number.** Every card already advertised a count (`revMeta`, or the feed
  event's own `comments`), and a thread dealt independently of it would
  disagree with the button that opened it — five replies under a badge saying
  nine reads as broken.
- ⚠️ **One KEY per review, shared with the upvote pill.** The same review
  appears in three places — the feed row, the pinned card, the list card — and
  they only reach the same thread *and the same like state* if they compute the
  same string. `feedRevKey(e)` and `populateReviewList`'s `pinKey` are
  deliberately identical; **change one and change the other.**
- ⚠️ **The indent is REAL NESTING, not a depth class.** `.v3-cmt-kids` wraps a
  node's children and carries the offset and the rail, so a child of a child
  indents twice because it sits inside two wrappers. Nothing computes a depth,
  and adding a level needs no new rule.
- ⚠️ **`cmtRender(key)` repaints EVERY wrap with that key, not the clicked
  one.** The dark and light shells render side by side and both hold a copy of
  the review; updating one leaves the other stale. Same reason
  `setArtistAlbumView` repaints every shell.
- ⚠️ **A comment's `ago` comes from its position, never a roll.** A node is
  always created after its parent, so walking `CMT_AGOS` oldest→newest is what
  stops a reply predating the comment it answers.
- **Two line pools.** A top-level comment answers the *review*, a nested one
  answers a *comment*. One pool for both gave replies that agreed with nothing
  and openers that read as non-sequiturs.
- `cmtLike` updates **in place** rather than through `cmtRender` — a re-render
  would wipe whatever was half-typed in the composer below. `cmtAdd` does
  re-render, which is how the composer clears.
- ⚠️ The thread sits on the review panel, dark in **both** themes — so its ink
  is hard-coded like every `.v3-rev-*` around it, and **every `.v3-cmt-*` rule
  needs a `--light.--artist` counterpart** for the artist page's cream panel.
  They're grouped together below the `.v3-rev-*` ones.

## Fullscreen is the album page

**There is one fullscreen state, not two.** Tapping the bento — the album art or
the `.v3-blue` info/stats box — goes straight to the **album page**
(`enterAlbumPage`, `--review` + `--album`), and Back returns to the bento in one
step.

There used to be a plain fullscreen **review** state in between: the bento
opened it, and tapping the album title *inside* it stepped up to the album page.
That middle layer is gone. The album page is swipeable in its own right, so the
review state was an extra level of navigation showing nearly the same thing —
the one visible difference being that the review state still had the **For You
box** (`.v3-for-single`, which `--album` hides).

- ⚠️ **`--review` is never set without `--album`.** The class pair survives
  because the CSS is tuned for the combination, but nothing can reach `--review`
  alone, so `.s-home-v3--review:not(.s-home-v3--album)` styles nothing — treat
  any such rule as dead.
- `onAlbumTitle` is **gone**; `.v3-blue-album` carries no handler and lets its
  tap bubble to `.v3-blue`.
- The left rail's **Review** entry is gone too — it would just be a second
  button for Album Page. `navigate('review')` / `navPage('review')` survive as
  legacy ids that route to the album page.
- `enterAlbumPage` early-returns when the shell is already fullscreen, so a tap
  on the stats box in the artist state doesn't re-run the entry animation.

## Artist Page (`populateArtistPage` / `artistAlbumsHtml` in app.js)

Not a screen — an `--artist` sub-state of the home shell layered on the album
page (`s-home-v3--review` + `--album` + `--artist`), entered via
`openArtistPageFor(name)`. `.v3-album` becomes the banner and `.v3-blue-album`
the artist name. `populateArtistPage` still writes the genre into
`.v3-blue-artist`, but **it and `.v3-blue-sep` are hidden** — the name stands
alone under the banner.

- **Banner:** full-bleed (`left:-10px; width:calc(100% + 20px)`), **top flush
  with the bento's top edge** — exactly where the album cover starts — and
  masked so only the *bottom* fades into the page. It used to be lifted `-20px`
  with a fade at both ends; the top fade read as a harsh cut-off floating under
  the header.
- **No artist rating.** `.v3-blue-score` and the stars-row vinyls are hidden, as
  is the `.v3-rev-hist` histogram — an artist isn't a thing you score. The
  review count survives as the one stat; the ratings live on the albums below.
- **Albums** (`.v3-artist-albums`) replace the histogram: a `.v3-aa-hd` head
  with a **row/grid toggle**, then either a `.v3-aa-row` rail or the trending
  `.wall2-grid`. `ARTIST_ALBUM_VIEW` is module-global and `setArtistAlbumView`
  repaints **every** home shell, so the dark/light pair can't disagree.
  ⚠️ The rail's `scroll-snap-align: start` snaps to the scrollport edge and
  would scroll its own left padding away — `scroll-padding-left` matches it.
- The **Popular reviews** heading is emitted as the last block of
  `artistAlbumsHtml`, so it hides with the container when the page leaves the
  artist state (there's no artist-only markup in either home variant to
  maintain).
- ⚠️ **Light theme:** the album page keeps the album's dark procedural colour
  behind the review panel in *both* themes, so every `.s-home-v3--light
  .v3-rev-*` rule is light ink. The artist page forces the cream bg instead, so
  it needs its own `--light.--artist` block re-inking the panel dark — without
  it the whole lower half is invisible. **Any new `--light .v3-rev-*` rule needs
  an artist counterpart.**

---

## Variant System

Desktop viewer shows a screen's variants side by side (single view is a Dark+Light 2-up, centered — see the floating left nav note). The retired v1/v2 home mockups and the old standalone search/album/artist/review screens were **deleted** from `SCREENS`; the `init()` v3-filter is now a harmless no-op. `variantState` defaults to `{ home: 0 }` (Float·Dark).

---

## Mobile Prototype Modes

On mobile (`≤767px`): Single / Multi / Flow / Live modes via header segmented control.

---

## Key Design Decisions

- **The handle sits under the wordmark** — `.v3-header-brand` stacks `.v3-header-logo` + `.v3-header-handle`. It's filled by `populateHomeData`, **not interpolated into the markup**: two of the three headers live in static `html:` templates that are evaluated once at load, so an inline `${PROFILE.handle}` would freeze at page-load and never follow a persona switch. (Also: no backticks inside those templates, even in comments — they terminate the literal.)
- **The header bubbles are real entry points** — `appHeader()`'s bell → `navigate('notifications')` and gear → `navigate('settings')`. The bell used to just toggle its own unread dot. Note the header exists in **three** places: `appHeader()` plus an inline copy in each of the two home v3 variants — change all three together.
- **The trending wall keeps its margins** — `.wall2-scroll` is inset `12px` and the grid keeps its gutters, rounded tiles, shadows and hung-off rank badges (the generic `.wall2-grid`, shared with the artist page). An edge-to-edge flush mosaic (no side inset, `column-gap: 0`, square tiles, badge moved inside) was tried in `c4c77a5` and reverted — the artwork ran into the frame and read as one ugly slab. Don't reintroduce it.
- **No top nav bar on home** — search and profile icons live in the 46px search corner of the bento
- **Bottom nav is pinned** — requires `height: 100%` on `.s-home-v3`, not just `flex: 1`
- **CD is absolutely positioned** — decoupled from row height so it can be any size without pushing the blue box taller
- **The rating gold follows the album** — `--star` resolves `var(--v3-star, var(--persona-accent, #e8a83c))`, so the vinyls and the review histogram re-tint on every album switch. ⚠️ **Nothing may set `--star` directly** — a persona doing so pinned the vinyls to one colour and stopped them tracking the album.
- **Ratings read `--v3-star`, not `--v3-accent`.** A greyscale or black-dominant cover deliberately extracts to a neutral (the `darkFrac` branch hard-codes `#b9b9c1`) — correct for the bento box, dreadful for the vinyls, which just went grey. `computeAlbumColors` therefore also emits `star`: the accent unless its saturation is under 0.22, in which case the house gold. `accent` itself is untouched — the boxes still want the neutral.
- **`renderSingle()` alone is never enough.** It rebuilds the phones from their static templates, so every screen comes back with the placeholder cover baked into the markup and no data. Anything that rebuilds must follow with `paintAfterRender()` — which is why the resize handler calls `renderViewer()`, not `renderSingle()`.
- **Colour extraction needs CORS** — `computeAlbumColors` sets `img.crossOrigin = 'anonymous'` for absolute URLs. Without it, `getImageData` throws a tainted-canvas error on the personas' Deezer CDN covers, the `catch` swallows it, and every album silently falls back to the hard-coded flood colour.
- **Stars are never plain black when empty** — always `rgba` grey
- **Album art drives color** — don't hardcode accent on home screen
- **Fillet shadows**: dark theme cannot use `filter: drop-shadow` on fillets (GPU artifact); light theme CAN since it uses CSS gradient, not mask-image
- **Previews follow the album, not the DOM** — `playPreviewFor(album)` plays the album it's handed; never re-query `querySelector('.s-home-v3')` for "the current album" (multiple instances → wrong track). Intent (`PREVIEW.on/paused`) drives the UI, never `audio.paused`
- **Art vs text animation are separate** — `setMainAlbum`'s `animate` (cover/CD) is independent of `animateText` (typewriter); swipes animate text only, since the filmstrip already moves the art
- **Fullscreen** — the `.v3-blue` stats block (album/date · artist · stars) is nudged down 3px via `transform`. The compose UI is a `.v3-rev-cta` button → **Log Sheet** (see above) with three **quick-log squares** attached to its right (`.v3-rev-cta-row` › `.v3-rev-quick` › `.v3-rev-q` — listened · listen later · favourite), followed by the **Tracklist**. The streaming action grid (`.v3-rev-actions`) reserves a fixed **58px** column so the review box never shifts as icons change; fav/later/shop moved into the log sheet, leaving Spotify/Apple/YouTube.
- **Previews are currently OFF** — `PREVIEWS_ENABLED = false` in `app.js` no-ops `togglePreview`/`togglePreviewMode`/`loadPreview`/`playPreviewFor`, and `.v3-preview-btn` is hidden. Flip the flag to re-enable.

---

## Deployment

GitHub Pages from `main` branch root:
```
git add app.css app.js screens.js style.css index.html data.js flowchart.html CLAUDE.md roadmap.js roadmap.css
git commit -m "description"
git push
```
When a change adds an asset (e.g. `images/profile-skin-01.png`), `git add` it too.
`flowchart.html` and `data.js` are easy to forget — a screen added to the page
map or the archive ships broken without them.

> **Shipped 2026-08-13 (commit `3b12ae5`):** Notifications + Settings
> (dark & light each), the header bell/gear wired to them, both added to
> `NAV_PAGES` and the page map. Then a styling pass: Notifications lost its page
> title and filter pills (the unread chip moved up beside "Mark all read"),
> Settings moved **Sign out** up under the account card (and "Show listening
> activity" up to head Connected services), and the trending wall's
> edge-to-edge mosaic was reverted to the inset grid. Then the **artist page**
> rework: flush-top full-bleed banner, no artist rating, histogram replaced by
> the albums row/grid toggle, a Popular-reviews heading, a legible light theme,
> and review cards with the upvote/comment moved to the card's top-right.
> Finally, across the album + artist pages: the friend-rec pill moved down to
> the reviews, the tracklist un-capped to every track, and the CTA centred.
> Then the **persona system**: `personas/` (CSVs) · `tools/build_personas.py` ·
> the generated `personas.js` · `applyPersona` + the toolbar/mobile switcher.
> Touches `screens.js · app.js · app.css · style.css · index.html ·
> flowchart.html · CLAUDE.md` and adds `personas/ · personas.js ·
> tools/build_personas.py · .gitignore`. Verified in-browser (all four personas
> swap catalogue + feed + profile; both variants), then committed and
> deployed.
> Plus the **dev box**, the album-tracking `--star`, the cross-origin colour
> fix, the bento quote retired, the handle under the wordmark, and the vinyl
> rendering rebuilt (see the three traps above).
> Assets bumped to `app.css?v=228 · screens.js?v=200 · app.js?v=200 ·
> style.css?v=145 · personas.js?v=3`.
>
> Open on the personas: (G)I-DLE, Leessang, J. Rawls and Jan Panenka find no
> usable Deezer match · the skins are a first pass (header wordmark/icons wash
> out on the light persona backgrounds) · `eric` is built from the old
> `NEWSPOTIFYARTISTS.png` capture and should be re-cut when the Top Songs
> screenshots arrive.

> **Last deploy (2026-07-21):** the left-nav relink + centered mockups, dark/light
> for auth/onboarding/song, the 8-step onboarding wizard, and the Funky profile
> (theme 01 + skin PNG) are live. Assets at `app.css?v=165 · screens.js?v=158 ·
> app.js?v=158 · style.css?v=141 · data.js?v=143`.
>
> Open threads: **Social (08) and Live Stream (09) are on the page map but have
> no screen** — the remaining gap · light-theme bento boxes are still `#999`
> placeholders · profile theme 02 (angular) not started · `PREVIEWS_ENABLED =
> false` · ~38 inline `★` glyphs still bypass the vinyl `halfStars` treatment.
