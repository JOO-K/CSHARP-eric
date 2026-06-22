# CHARP — Music Review App Mockup

**What it is:** A Letterboxd-for-music app. Plain HTML/CSS/JS — no build tools, no npm, no framework. Designed as a phone UI prototype viewed in a desktop viewer.

**Live URL:** https://joo-k.github.io/CSHARP-eric/
**Repo:** https://github.com/JOO-K/CSHARP-eric.git

---

## File Structure

| File | Role |
|------|------|
| `index.html` | Shell: desktop viewer + mobile prototype wrapper |
| `screens.js` | All screen HTML (the `SCREENS` array) + helpers |
| `app.js` | Viewer logic, navigation, color extraction, mobile engine |
| `app.css` | App UI styles (screens, components, palette) |
| `style.css` | Desktop viewer chrome (toolbar, phone frame, variant tray) |
| `flowchart.html` | Page map / user flow diagram |
| `images/` | Album art + artist photos (JPG/PNG) |

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

## Design Language & Aesthetics

### Philosophy
The aesthetic is **editorial-dark meets floating bento** — think a music zine digitized. Not a streaming app, not social media. Somewhere between Letterboxd, a vinyl record store, and a Tumblr that cares about typography.

Key principles:
- **Floating cards with drop shadow** — cards lift off the background. Dark theme uses deep shadows + a 1px inset top-edge highlight (`inset 0 1px 0 rgba(255,255,255,0.07)`). Light theme uses warm drop shadows.
- **Album art is the hero** — everything orbits the album cover. It's large, square, unclipped.
- **No generic gradients** — colors should feel extracted from content, not templated.
- **Compact, dense information** — no wasted vertical space. Text is small but readable. Stars + rating + count in one line.
- **Procedural color** — the home screen extracts a vibrant accent color from the album art via canvas and applies it to stars, box tints, and button colors.

### Dark Theme (Float·Dark / v3.0)
- Screen bg: `#111116` (near-black with 2% blue tint)
- Surface (cards): built per-component, no global surface color in v3
- Text primary: `#e8e2d6` (warm off-white)
- Text muted: `rgba(232,226,214,0.3–0.5)`
- Empty stars: `rgba(232,226,214,0.14)` (grey, NOT black)
- Box shadows: `0 6px 28px rgba(0,0,0,0.45–0.65)` + inset top highlight
- Accent: procedurally extracted from album art via `applyAlbumColors()`

### Light Theme (Float·Light / v3.1)
- Screen bg: `#f0ece3` (warm cream)
- Text primary: `#1a1208`
- Text muted: `rgba(26,18,8,0.3–0.5)`
- Empty stars: `rgba(26,18,8,0.15)`
- Box shadows: warm-tinted (e.g. `0 4px 18px rgba(160,40,40,0.12)`)
- Accent: procedurally extracted (same algorithm, different defaults)

### Global CSS Variables (defined in `:root`)
```css
--accent:    #c8c2b8   /* warm grey */
--bg:        #0c0b0a   /* near-black */
--surface:   #161514
--surface2:  #1e1c1b
--border:    #252320
--text:      #e8e4dc
--text2:     #706860
--text3:     #302e2c   /* overridden per-theme in v3 screens */
--star:      #e8a83c   /* gold star rating */
--font-main: 'DM Sans'
--font-mono: 'SUSE Mono'
```

**Important:** `.s-home-v3` overrides `--text3` to `rgba(232,226,214,0.14)` for grey empty stars. `.s-home-v3--light` overrides it to `rgba(26,18,8,0.15)`.

---

## Home Screen v3 — Bento Hero Layout

The home screen (id: `home`) uses a **2×2 bento grid** with no gaps between cells:

```
┌──────────────────────────┬──────────┐
│                          │ TRENDING │  ← candy-stripe album covers
│      ALBUM ART           │ (red box)│    diagonal strips, 5 albums
│      (square, 78% wide)  │          │    top+bottom slightly larger
│                          │          │
├──────────────────────────┤          │
│ BLUE BOX                 │  ● CD    │  ← spinning CD, click = stream
│ 4.4 ★★★★½  19,284 reviews│  (corner)│    modal (Spotify / Apple)
└──────────────────────────┴──────────┘
```

### Grid structure
```css
.v3-bento {
  display: grid;
  grid-template-columns: 78% 22%;
  grid-template-rows: auto auto;
  margin: 0 10px;   /* breathing room from phone edges */
}
```

### Cell: Album Art (top-left)
- `aspect-ratio: 1` — always square
- `border-radius: 15px 0 0 0` — only top-left corner rounded
- Background image = album art, `background-size: cover`
- `box-shadow: 0 6px 28px rgba(0,0,0,0.65)`

### Cell: Red Box / Trending (top-right)
- Same height as album (shares grid row 1)
- `border-radius: 0 15px 15px 0` — top-right and bottom-right rounded
- Background: CSS var `--v3-box1-bg` (procedural dark tint of album accent)
- Contains: "TRENDING" label (top), candy-stripe album stack (middle), "More options ›" (bottom)
- **Candy stripe:** 5 `div.v3-stripe-item` with `clip-path: polygon(...)` creating diagonal parallelogram bands. Uses `margin-top: -8px` + descending z-index so each strip peeks below the previous diagonal cut. First and last strips have `flex: 1.35` (slightly taller).

### Cell: Blue Box / Reviews (bottom-left)
- Same width as album (shares grid column 1)
- `border-radius: 0 0 15px 15px` — both bottom corners rounded
- Background: CSS var `--v3-box2-bg` (procedural dark complementary tint)
- Contains: large score number + halfStars + review count all in one row
- Score uses `--v3-accent` color (from album extraction)

### Cell: Corner Gap (bottom-right)
- No box, no border — background matches screen (`#111116`)
- Contains: spinning CD (58px circle, album art as bg, `animation: v3spin 12s linear infinite`)
- CD click → streaming service action sheet (Spotify / Apple Music)
- CD hole: 13px centered circle

### Procedural Color System
`applyAlbumColors(screenEl)` runs after every render:
1. Reads the album art URL from `.v3-album`'s computed `background-image`
2. Draws it to a 48×48 canvas, samples all pixels
3. Finds the most **vibrant** pixel (highest saturation, mid-range luminance)
4. Derives:
   - `--v3-accent`: the vibrant color hex (used for stars, "More options" text, active dots)
   - `--v3-box1-bg`: very dark gradient tinted towards accent hue (red box bg)
   - `--v3-box2-bg`: very dark gradient tinted complementary (blue box bg)
5. Sets all three as inline CSS custom properties on `.s-home-v3`

If canvas extraction fails (CORS / tainted), CSS fallbacks kick in automatically.

---

## How Screens Work

`screens.js` exports a `SCREENS` array. Each entry:

```js
{
  id: 'home',
  name: 'Home',
  statusTheme: 'dark',
  variants: [{
    label: 'Float·Dark',
    version: 'v3.0',
    thumb: ['accent','w60','w80','w60','w80'],
    html: `<div class="app-screen s-home-v3">...</div>`
  }]
}
```

Two helper functions in `screens.js` (safe to call inside the array):
```js
topNav(active)           // 'playlists' | 'feed' | 'home'
halfStars(rating, size)  // e.g. halfStars(4.4, 18) → star span HTML
```

### halfStars() — how it works
Uses a gradient-clip trick for partial stars:
```css
background: linear-gradient(90deg, var(--star) 50%, var(--text3) 50%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```
`--text3` controls empty star color — override it per-theme for grey vs dark empty stars.

---

## Top Nav (v3 screens)

Left side — three vertical tabs (icon above, small label below):
- ★ **Reviews** — active on home
- ☰ **Playlists** — navigates to `playlists`
- ⊞ **Popular** — navigates to `wall`

Right side — icon-only circle buttons:
- 🔍 Search → `navigate('search')`
- 👤 Profile → `navigate('profile')`

CSS: `.v3-tab` uses `flex-direction: column`, 20×20 SVG icons, 9px label text.

---

## Variant System

The desktop viewer shows all variants of the current screen side by side with:
- Version label above each phone (e.g. `v3.0`, `v3.1`)
- Screen name below
- Click to set as active variant
- Drag to scroll horizontally if variants overflow

`variantState` object tracks the active variant per screen ID. Home defaults to `{ home: 0 }` (Float·Dark).

**Home screen filter:** Only `v3.x` variants are shown (v1 and v2 variants exist in `screens.js` but are filtered out at runtime in `app.js → init()`).

---

## Key Design Decisions

- **No bottom tab bar** — top nav with icon+label columns (not rows) for the 3 main sections
- **Live Feed** is TikTok-style: `scroll-snap-type: y mandatory`, one full-height card per scroll
- **Album Wall** is a 4-column grid with a swipeable category chip strip at top
- **Stars are never plain black when empty** — use `rgba` grey matching the theme
- **Album art drives color** — don't hardcode accent colors on the home screen; let the extraction run
- **Floating cards, not flat** — every major content block has a drop shadow
- `btn-primary` is inverted: white bg + dark text (editorial feel)

---

## Mobile Prototype Modes

On mobile (`≤767px`), the viewer becomes a live prototype with 4 modes:
- **Single** — one phone frame, prev/next nav
- **Multi** — all screens in a 2-col grid
- **Flow** — embeds `flowchart.html` in an iframe
- **Live** — raw screen HTML rendered directly (interactive with transitions)

---

## Adding a New Screen

1. Add entry to `SCREENS` array in `screens.js`
2. Add CSS classes to `app.css`
3. Use `onclick="navigate('screen-id')"` for links
4. Use `${topNav('active-id')}` and `${halfStars(rating, size)}` helpers

For a new home variant:
- Give it `version: 'v3.x'` so the runtime filter includes it
- Add `s-home-v3` class for color extraction to auto-run
- Add `s-home-v3--light` modifier for light theme

---

## Deployment

GitHub Pages from `main` branch root. Push to deploy:
```
git add app.css app.js screens.js style.css index.html
git commit -m "description"
git push
```
