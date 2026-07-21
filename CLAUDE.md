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
| `flowchart.html` | Page map / user flow diagram |
| `archive.csv` | Source of truth for artist/album metadata |
| `images/` | Album art (~146 albums, `album-artistslug-albumslug.ext`), playlist covers (`playlist-*.jpg`), and `profile-skin-01.png` (profile theme 01 skin) |
| `images/topbox.png` | Fillet PNG — black arc at bottom-left, white bg. Used for `v3-fillet-bl` |
| `images/bottombox.png` | Fillet PNG — black arc at top-left, white bg. Used for `v3-fillet-tl` |

**Script load order (important):** `data.js` → `screens.js` → `app.js`

---

## Screens (in order)

The `SCREENS` array holds only the **current** designs — every retired mockup
(the v1/v2 home variants, and the old standalone `search`/`album`/`artist`/`review`
screens) has been deleted. Album / Artist / Review / Search are **no longer
standalone screens**; they're live sub-states of the home shell (see below).

| ID | Name | Variants |
|----|------|----------|
| `auth` | Auth / Login | Float·Dark, Float·Light |
| `onboarding` | Onboarding | Float·Dark, Float·Light |
| `home` | Home | v3.0 Float·Dark, v3.1 Float·Light |
| `wall` | Album Wall | Float·Dark, Float·Light |
| `song` | Song / Track | Float·Dark, Float·Light |
| `profile` | Profile | Funky·Dark, Funky·Light (theme 01) |
| `playlists` | Playlists | Float·Dark, Float·Light |
| `playlist` | Playlist Page (detail) | Float·Dark, Float·Light |

`auth`/`onboarding`/`song` use the older `.app-screen` component CSS re-skinned to
the current palette via the **`sd-theme-dark` / `sd-theme-light`** scope classes
(defined in `app.css`, built by `sdTheme(light)` in `screens.js`). They render via
`authHtml(light)` / `onboardingHtml(light)` / `songHtml(light)`.

Navigate between screens with `navigate('screen-id')` — called from `onclick`
handlers in screen HTML. `navigate('search'|'album'|'artist'|'review')` is
intercepted and routed to the live in-app flow (`openSearch` / `openAlbumPage` /
`openArtistPageFor` / `enterReview`) rather than a standalone screen.

### Left page nav (desktop viewer)
`NAV_PAGES` (in `app.js`) drives the floating left rail — **decoupled from
`SCREENS`**. Real screens open via `goToScreen`; `flow:true` entries (Search,
Album Page, Artist Page, Review) launch the live in-app interaction through
`navPage(id)` and are flagged with a `↗` in the rail. `activeNavId` tracks the
highlighted entry. The rail is `position:absolute` over `#stage` so the phone
centers in the true middle of the viewport (`#phone-container` fills full width).

---

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
- `border-radius: 15px 15px 15px 0` — bottom-right corner is 0 (step junction)
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

### Scroll Area
`.v3-scroll-area` — `flex: 1; overflow-y: auto; padding: 30px 12px 8px`

Contains brand row ("CHARP / music, reviewed."), friend activity feed header, and `.v3-friend-card` items.

**Feed card taps** (`renderFriendFeed` in app.js — cards carry an index into `FRIEND_ACTIVITY`, no attribute escaping): tapping the **art** → `openFriendAlbum(i)` → that album's page from the top; tapping the **card** (the review) → `openFriendReview(i)` → `openAlbumPage(album, pinnedReview)` — the album page opens, `.v3-body` smooth-scrolls to the review list (rect math divided by the phone-wrap scale), and the tapped review renders **pinned first** in `populateReviewList` (`.v3-rev-card--pinned`, star-outlined with a "from your feed" chip; survives filter switches, cleared whenever an album page opens without a pin). The old `navigate('album')` (deprecated standalone album screen) is no longer used by the feed.

### Bottom Nav — filleted shelf (Sony-VAIO / MP3 vibe)
`.v3-bottom-nav` is a redesigned shelf, not a flat tab row. Structure:
- **`.v3-nav-shape`** — an SVG silhouette (from `BOTTOM_NAV.svg`) that only spans the **left ~83%** (`.v3-nav-shelf`): a tall left logo column, a concave fillet swoop down to a shorter icon strip, and a rounded top-right. Filled with the screen bg + hairline stroke.
- **`.v3-nav-hi`** — the "home is on" highlight: solid `--v3-box1-color` (the bento box color) across the logo cell, feathering ~5% into the next section. Masked to the shelf shape (data-URI mask) so it clips cleanly and uses live CSS vars.
- **Cells:** logo (= Home, `navigate('home')`) · Trending (3×3 grid → `wall`) · Playlists (3 lines → `playlists`) · Profile. Divided by soft inset hairlines; each lights up on hover with an accent sheen.
- **`.v3-nav-toggle`** — the hand-layout switch, floating in the empty ~17% to the right of the shelf. Fires the existing `toggleHand()` (localStorage `spindeck-hand`, toggles `.s-home-v3--left`); the knob/track react purely in CSS to that class.

Pinned to the bottom because `.s-home-v3` is `height: 100%; overflow: hidden` (constrains the flex column).

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

## Playlist Page (`playlistPageHtml(light)` in screens.js)

The detail page for one song playlist. Geometry from Eric's `PlaylistPageBox.svg` (688×303): the hero is an `aspect-ratio: 688/303` box — image panel + CD are positioned divs (percent coords straight from the SVG); the info panel and Popular dog-ear are **his exact SVG paths inlined** (`.plp-shape-panel`/`.plp-shape-tag`, filled via CSS per theme). The info panel has a concave swoop carved from its bottom-right; the spinning CD (reuses `v3spin` + `.v3-cd-hole`) seats in it and overflows below the panel.

- Rendered from `window.activePlaylist` (set by `openPlaylistPage(name)` in app.js; falls back to `plLists()[0]`).
- Info panel text: title / `by creator` / `N songs · edited Xd ago` / **majority genres** (`.plp-genres`, top 3 genres counted across the tracklist's albums, faint light letters).
- Tracklist: seeded (`seedRand(name + '::pl')`) pick of archive albums, one `songsFor()` track each — deterministic per playlist. Rows are **one line** (song title boldest → album mid → artist lightest — deliberate exception to the artist-bold convention) that **fades out via mask** when too long, plus a numeric rating and duration. Ratings cluster near 4.0 (±0.35) with 1–2 seeded outliers (dud or banger). Row click → log sheet via `plSongTap`.
- **Back pill** (`.plp-back-pill`, above the hero): styled like the home live pill (same `.v3-search-pill` neu-emboss — solid bg, dual shadow, no border) and reuses its 6-dot ring — arrow points **left** (back) regardless of hand mode; the formation rules sit before the reaction/smile formations in app.css so those still win. `.v3-ring--smile` morphs the dots into a mascot smiley (2 eyes + 4-dot smile): flashed by `plRingSmile()` when you favorite the playlist, and intermittently on an 11s timer.
- **Home-load greeting** (`greetRing()` in app.js, called from `populateHomeData`, once per session): on the first home render the live-pill dots start as the smiley for ~10s, do a `.v3-ring--wink` (right eye squints + mouth corners lift, via keyframes that out-specific the smile's `animation: none`) at ~8.7s, then morph into the arrow.
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
- The pencil in the userbar is a placeholder edit affordance (no handler yet).
- Being an `.s-home-v3`, `populateHomeData` runs on it (now-playing bar) — the
  bento-only calls no-op just like on wall/playlists.
- **Deploy note:** `images/profile-skin-01.png` is a new asset — `git add` it.

---

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

`halfStars(rating, size)` now renders **vinyl records, not stars** — every rating across the app routes through it. Each unit is a `.hstar` span masked by `--vinyl-mask` (a disc-with-center-hole SVG); `full`/`empty`/`half` just set the background (half = a 50/50 `--star`/`--text3` gradient under the mask). Sizes are scaled ×0.72 so a vinyl matches the old ★ glyph's footprint (its top lines up with an adjacent number's cap height). `--text3` still controls the empty color per screen.

> Note: ~38 inline plain `★` glyphs in text bits (e.g. "4.4 ★" labels, `.star-pick`, `.dorf-act-rating`) do **not** go through `halfStars` and are still literal stars.

---

## Log Sheet — Letterboxd-style logging (`app.js`)

`openLogSheet(triggerEl, subject?)` builds a **singleton** bottom sheet (`#sd-log`) lazily and mounts it into the triggering `.app-screen` so it stays inside the phone frame. Reusable from anywhere.
- **Subject:** defaults to the current bento album (`currentBentoAlbum()`); pass a `{ image, title, subtitle }` to log something else (a song does this via `openSongLog`).
- **Contents:** cover + title/subtitle header · large centered **vinyl rate** control (drag/tap for half-record ratings, `setLogRating`) · one-line **Listened (ear) · Listen later · Favorite** toggles (`toggleLogOpt`) · a review textarea whose **Save** button only appears once there's text (`.has-text`) and floats bottom-right · the sheet floats with 10px margins (matches the bento).
- The old inline compose block (`.v3-rev-mine` stars + textarea + Post) was replaced by a single `.v3-rev-cta` "Review, rate, log" button that opens this sheet.

## Tracklist (`populateSongList` / `songsFor`)

`.v3-rev-songs` sits below the CTA in review mode: a full-width table of **# · title · duration · rating (number + vinyls)**. Clicking a row → `openSongLog(this)` → the log sheet for that song. Song titles/durations/ratings are **deterministic placeholders** (`songsFor` seeds a PRNG from the album name; there's no real per-song data — `album.tracks` is only a count). Caps at ~8.5 rows (`.v3-rev-songs--scroll` → `max-height` + bottom mask fade) so the 9th peeks to signal scroll.

**2-line title handling:** a long album name wraps to two lines in review mode; `enterReview`/`setMainAlbum` measure it synchronously (full text → `offsetHeight`) and toggle `.v3-rev-title-2line`, which drops the CTA down a line.

---

## Variant System

Desktop viewer shows a screen's variants side by side (single view is a Dark+Light 2-up, centered — see the floating left nav note). The retired v1/v2 home mockups and the old standalone search/album/artist/review screens were **deleted** from `SCREENS`; the `init()` v3-filter is now a harmless no-op. `variantState` defaults to `{ home: 0 }` (Float·Dark).

---

## Mobile Prototype Modes

On mobile (`≤767px`): Single / Multi / Flow / Live modes via header segmented control.

---

## Key Design Decisions

- **No top nav bar on home** — search and profile icons live in the 46px search corner of the bento
- **Bottom nav is pinned** — requires `height: 100%` on `.s-home-v3`, not just `flex: 1`
- **CD is absolutely positioned** — decoupled from row height so it can be any size without pushing the blue box taller
- **Stars are never plain black when empty** — always `rgba` grey
- **Album art drives color** — don't hardcode accent on home screen
- **Fillet shadows**: dark theme cannot use `filter: drop-shadow` on fillets (GPU artifact); light theme CAN since it uses CSS gradient, not mask-image
- **Previews follow the album, not the DOM** — `playPreviewFor(album)` plays the album it's handed; never re-query `querySelector('.s-home-v3')` for "the current album" (multiple instances → wrong track). Intent (`PREVIEW.on/paused`) drives the UI, never `audio.paused`
- **Art vs text animation are separate** — `setMainAlbum`'s `animate` (cover/CD) is independent of `animateText` (typewriter); swipes animate text only, since the filmstrip already moves the art
- **Fullscreen review** — the `.v3-blue` stats block (album/date · artist · stars) is nudged down 3px via `transform`. The compose UI is now just a `.v3-rev-cta` button → **Log Sheet** (see above), followed by the **Tracklist**. The streaming action grid (`.v3-rev-actions`) reserves a fixed **58px** column so the review box never shifts as icons change; fav/later/shop moved into the log sheet, leaving Spotify/Apple/YouTube.
- **Previews are currently OFF** — `PREVIEWS_ENABLED = false` in `app.js` no-ops `togglePreview`/`togglePreviewMode`/`loadPreview`/`playPreviewFor`, and `.v3-preview-btn` is hidden. Flip the flag to re-enable.

---

## Deployment

GitHub Pages from `main` branch root:
```
git add app.css app.js screens.js style.css index.html
git commit -m "description"
git push
```
When a change adds an asset (e.g. `images/profile-skin-01.png`), `git add` it too.

> **Last deploy (2026-07-21):** the left-nav relink + centered mockups, dark/light
> for auth/onboarding/song, the 8-step onboarding wizard, and the Funky profile
> (theme 01 + skin PNG) are live. Assets at `app.css?v=165 · screens.js?v=158 ·
> app.js?v=158 · style.css?v=141 · data.js?v=143`.
>
> Open threads: light-theme bento boxes are still `#999` placeholders · profile
> theme 02 (angular) not started · `PREVIEWS_ENABLED = false` · ~38 inline `★`
> glyphs still bypass the vinyl `halfStars` treatment.
