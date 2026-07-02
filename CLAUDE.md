# CHARP — Music Review App Mockup

**What it is:** A Letterboxd-for-music app. Plain HTML/CSS/JS — no build tools, no npm, no framework. Designed as a phone UI prototype viewed in a desktop viewer.

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
| `images/` | Album art — ~54 images, naming: `album-artistslug-albumslug.ext` |
| `images/topbox.png` | Fillet PNG — black arc at bottom-left, white bg. Used for `v3-fillet-bl` |
| `images/bottombox.png` | Fillet PNG — black arc at top-left, white bg. Used for `v3-fillet-tl` |

**Script load order (important):** `data.js` → `screens.js` → `app.js`

---

## Screens (in order)

| ID | Name | Variants |
|----|------|----------|
| `auth` | Auth / Login | 1 |
| `onboarding` | Onboarding | 1 |
| `home` | Home | v3.0 Float·Dark, v3.1 Float·Light |
| `feed` | Live Feed | Albums v1.0, Songs v1.1 |
| `wall` | Album Wall | 1 |
| `search` | Search | 1 |
| `album` | Album Page | 1 |
| `artist` | Artist Page | 1 |
| `song` | Song / Track | 1 |
| `review` | Review Page | 1 |
| `profile` | Profile | 1 |
| `playlists` | Playlists | My Lists, Artists, Albums, Songs, Genres |
| `swipe` | Swipe Review | 1 |

Navigate between screens with `navigate('screen-id')` — called from `onclick` handlers in screen HTML.

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
- CD click → streaming service action sheet (`.v3-stream-overlay`)
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

### Bottom Nav
`.v3-bottom-nav` — `flex-shrink: 0`, 5 tabs: Home · Reviews · Playlists · Popular · Profile

Stays pinned to the bottom because `.s-home-v3` has `height: 100%; overflow: hidden` which constrains the flex column — without this it would scroll off-screen.

### Procedural Color System
`applyAlbumColors(screenEl)` in `app.js` runs after every render:
1. Reads album art URL from `.v3-album`'s `background-image`
2. Draws to 48×48 canvas, finds most vibrant pixel
3. Sets on `.s-home-v3`: `--v3-accent`, `--v3-box1-bg`, `--v3-box2-bg`

Light theme overrides these with hardcoded values (`background: #999`) — still WIP.

---

## How Screens Work

`screens.js` exports a `SCREENS` array. Two helper functions:
```js
topNav(active)           // 'playlists' | 'feed' | 'home'
halfStars(rating, size)  // halfStars(4.4, 16) → star span HTML
```

`halfStars` uses gradient-clip for partial stars. `--text3` controls empty star color.

---

## Variant System

Desktop viewer shows all variants side by side. Only `v3.x` variants are shown for the home screen (v1/v2 filtered in `app.js → init()`). `variantState` defaults to `{ home: 0 }` (Float·Dark).

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

---

## Deployment

GitHub Pages from `main` branch root:
```
git add app.css app.js screens.js style.css index.html
git commit -m "description"
git push
```
