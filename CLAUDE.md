# ENOCH — Music Review App Mockup

**What it is:** A Letterboxd-for-music app mockup. Plain HTML/CSS/JS — no build tools, no npm, no framework. Designed as a phone UI prototype.

**Live URL:** https://joo-k.github.io/CSHARP-eric/
**Repo:** https://github.com/JOO-K/CSHARP-eric.git

---

## File Structure

| File | Role |
|------|------|
| `index.html` | Shell: desktop viewer + mobile prototype wrapper |
| `screens.js` | All screen HTML (the `SCREENS` array) + helpers |
| `app.js` | Viewer logic, navigation, mobile prototype engine |
| `app.css` | App UI styles (screens, components, palette) |
| `style.css` | Desktop viewer chrome (toolbar, phone frame, thumbtray) |
| `flowchart.html` | Page map / user flow diagram |
| `images/` | Album art + artist photos (JPG/PNG) |

---

## Screens (in order)

| ID | Name | Variants |
|----|------|----------|
| `auth` | Auth / Login | 1 |
| `onboarding` | Onboarding | 1 |
| `home` | Home (bento) | 1 |
| `feed` | Live Feed | Albums, Songs |
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

## How Screens Work

`screens.js` exports a `SCREENS` array. Each entry:

```js
{
  id: 'home',
  name: 'Home',
  statusTheme: 'light',   // or 'dark'
  variants: [{
    label: 'v1',
    thumb: ['w70','accent','w80','w60','w80'],  // thumbnail preview lines
    html: `<div class="app-screen s-home-bento">...</div>`
  }]
}
```

Two helper functions in `screens.js` (hoisted function declarations — safe to call inside the array):

```js
topNav(active)         // 'playlists' | 'feed' | 'home'
halfStars(rating, size) // e.g. halfStars(4.5, 13) → star span HTML
```

---

## Color Palette (CSS custom properties)

```css
--accent:   #c8c2b8   /* warm grey, used for links/highlights */
--bg:       #0c0b0a   /* near-black background */
--surface:  #161514   /* cards */
--surface2: #1e1c1b   /* elevated cards */
--border:   #252320
--text:     #e8e4dc   /* primary text */
--text2:    #706860   /* secondary text */
--text3:    #302e2c   /* muted / empty stars */
--star:     #e8a83c   /* star rating gold */
--font-main: 'DM Sans'
--font-mono: 'SUSE Mono'
```

No blue. Dark charcoal / warm grey aesthetic. Album art squares are central to the design language.

---

## Key Design Decisions

- **Top nav** (not bottom tab bar) for the 3 main screens: Playlists | Live Feed | Home
- **Live Feed** is TikTok-style: `scroll-snap-type: y mandatory`, one full-height card per scroll
- **Album Wall** is a 4-column grid (`repeat(4,1fr)`) with a swipeable category chip strip at top
- **Home** uses CSS Grid bento layout with small margins; social-first (friends' reviews prominent)
- **Playlists Artists tab** shows visual half-star ratings (gradient-clip trick) + review count as primary metric
- **Half stars** use: `background: linear-gradient(90deg, var(--star) 50%, var(--text3) 50%); -webkit-background-clip: text; -webkit-text-fill-color: transparent`
- `btn-primary` is inverted: white bg + dark text (editorial feel)

---

## Mobile Prototype Modes

On mobile (`≤767px`), the viewer becomes a live prototype with 4 modes:
- **Single** — one phone frame, prev/next nav
- **Multi** — all screens in a 2-col grid
- **Flow** — embeds `flowchart.html` in an iframe
- **Live** — raw screen HTML rendered directly (interactive prototype with transitions)

Fullscreen button uses `requestFullscreen()` + `webkitRequestFullscreen()` fallback.

---

## Adding a New Screen

1. Add an entry to the `SCREENS` array in `screens.js`
2. Add any new CSS classes to `app.css`
3. Use `onclick="navigate('screen-id')"` for links between screens
4. Use `${topNav('active-id')}` and `${halfStars(rating, size)}` helpers as needed

---

## Deployment

GitHub Pages from `main` branch root. Push to deploy:
```
git add <files>
git commit -m "message"
git push
```
