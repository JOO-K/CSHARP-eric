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
| `shop` | Shop — four aisles: General, Events, Themes, Badges | Float·Dark, Float·Light |

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

## Dev Box — TABBED (`DEVBOX_TABS` in app.js, `#devbox` in index.html)

The panel is **tabbed**: one tab per thing you can tune, each owning its own
`fields` and the `css(d)` block it emits. **Adding a tab is adding a row to
`DEVBOX_TABS`** — the strip, the sliders, Reset and Copy CSS all derive from it.
Today: **Bento info** (the compact stats strip) and **Album score** (the album
page's headline number + its vinyls).

- ⚠️ **Field keys share ONE namespace** — `DEVBOX` is flat across tabs. Prefix
  new ones (the album-score tab uses `s*`) or two sliders will silently drive
  one value.
- **Injected: every tab. Shown and copied: the active tab.** All blocks have to
  be in force at once (you can't tune the album score with the bento's block
  switched off), but the textarea and Copy CSS give you just the block you're
  pasting, so "what you see is what you paste" still holds per tab.
- **Reset clears the ACTIVE tab only** — it sits under that tab's sliders, and
  wiping a tune you can't see would be a nasty surprise.
- Switching tabs re-renders the rows from `DEVBOX`, so a tune is never lost by
  looking at something else. The `input` listener is delegated for the same
  reason the roadmap's is: the rows are rebuilt on every switch.
- ⚠️ **The album score's vinyls are sized in CSS, not inline.** `halfStars` grew
  a third argument, `cssSized`, that omits the inline `width`/`height` — an
  inline style beats any rule short of `!important`, which is exactly what stops
  a vinyl row from being tunable. Only `populateBigScore` passes it; every other
  caller keeps inline sizing, which is also what keeps the disc size a whole
  pixel (see the `.hstar` rasterisation note).

## Dev Box — the original notes (`initDevBox` in app.js)

A tuning panel floating on the right of `#stage`, behind the toolbar's **⚙ Dev**
button. Desktop viewer only. It live-tunes the **compact bento's info box** —
the block's column gap + padding, plus X · Y · Size · Row gap for each of the
two columns — and prints the CSS. ("Line 1" and "Line 2" are the left and right
COLUMNS since the two-column rebuild; the labels kept their old names.)

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
- ⚠️ **`<style id="devbox-live">` is injected AT LOAD, not when the panel
  opens**, and it's appended to `<head>` — so at equal specificity it beats
  app.css for every selector it names. **If an edit to the bento info box
  appears to do nothing, look at `devBoxCss()` first.** The two-column rebuild
  spent a full round looking "ignored" because this style was quietly
  re-applying the old `scale()` on top of it.
- ⚠️ **Size is a font-size in px, NOT a `scale()`.** It used to be a scale,
  which worked while the box was two stacked full-width lines. It cannot be one
  now: a transform on a **grid item** is paint-only, so the track is sized from
  the untransformed box and the scaled result spills out of `.v3-blue`
  (`overflow: hidden`) — measured at 11.6px of album title hanging past the
  right edge. Line 1's size rides on `.v3-blue-info-row` with the album/artist
  inheriting it as `1em`; line 2's rides on `.v3-blue-score`.
- **The dev box's output goes into app.css verbatim.** That's the panel's whole
  point — the tune is settled by eye against the live screen, so retyping it as
  "equivalent" numbers changes the thing that was approved. If the output can't
  be shipped as-is, the panel is what needs fixing.

**The sample-review quote is gone from the bento** (`.v3-blue-quote { display:
none }`). It was already hidden in review mode, so this retires it everywhere;
the markup and the typewriter in app.js remain and just paint into a hidden
node, so deleting that one rule brings it back. With two lines instead of three,
`.v3-blue` moved off `space-between` (which would shove them to the far top and
bottom of the box) onto a centred stack.

## Pet Box (`initPetBox` in app.js, `#petbox` in index.html)

The nav pet's whole vocabulary, behind the toolbar's **☺ Pet** button. Desktop
viewer only. One cell per entry in `SCENE_REACTIONS`, each **looping its real
sequence** with the reaction's name and the action that fires it
(`PET_TRIGGERS`). Click a cell to play it on the phone.

- **Sequences, not stills.** These reactions only read as themselves in motion —
  a single frame of `music` is six bars at arbitrary heights and says nothing.
- ⚠️ **Preview cells must NOT carry `.sd-scene`.** `sceneTick` repaints
  everything with that class, so a preview wearing it gets stamped with the live
  frame and the whole grid collapses to one pose. `.pet-stage` exists to be the
  box the face scales into without being picked up by the clock.
- Reuses the dev box's `.db-*` chrome and sits one column to its left, so both
  can be open at once — you can watch the pet while tuning the bento.
- The preview clock only runs while the panel is open.

## Roadmap (`roadmap.js` + `roadmap.css`, `#roadmap` in index.html)

The planning board behind the toolbar's **🗺 Roadmap** button — an editable
project-year plan meant to be opened live in a meeting. **Left column:** a
block calendar (**two months on screen, stepping by one**, Aug 2026 → Apr 2027)
over a **37-week** vertical timeline (Aug 21 2026 → May 6 2027, month rules
between). **Right column:** short / medium / long term goals over meeting
notes.

**The range is two constants** — `RM_START` and `RM_WEEK_COUNT`. The calendar's
month blocks, the year labels, the header line and the export range all derive
from them, so extending the board is one number and nothing to keep in sync.

**Three levels of thing, deliberately kept apart:** a **week** is the
workstream ("Design pass"), a **day event** is a fixed point inside it
("hand-in, 4pm"), a **session** is the record of one meeting. Clicking a day
edits its events; clicking the W-number jumps to the week.

The split is deliberate: the left is what you READ off, the right is what gets
WRITTEN during the meeting — so the right column takes the larger share of the
width (`0.92fr / 1.08fr`) and both its cards grow with it rather than the notes
being pinned to a fixed 34%.

**The board ships near-empty on purpose** — every week but W1 is blank and all
three goal lists start at zero, because it's filled in live during the meeting.
**W1 carries the how-to** (`RM_HOWTO`) instead of a task, so the instructions are
the first thing on screen and get typed over once the plan starts landing.

### Import — a downloaded .md back into a board (`rmParseMarkdown` · `rmUpload`)

The round trip for **Download .md**. Everything the board holds is already in
that document, so **the file IS the save format** — this parses it back rather
than adding a second one. `Upload .md` sits beside Download in the header and
drives a hidden `#rm-file` input.

- ⚠️ **The export now carries the ISO date** as well as the human label:
  ``- **Tue Sep 8** (W3) `2026-09-08` — …``. The label alone is **lossy** — no
  year — so a re-imported board could not tell 2026 from 2027 and every event
  would land on the wrong day. The label stays because it is what a person reads;
  the parser reads the backticked ISO beside it.
- ⚠️ **The writer and the parser have to move together.** Section headings
  (`## Goals` / `## Timeline` / `## Events` / `## Meeting notes`) are the
  parser'''s state machine; change a heading in `rmMarkdown` and change it here.
  Track and status come back through the **same** `RM_TRACK_LBL` /
  `RM_STATUS_LBL` / `RM_TERMS` tables the writer used, so a renamed label cannot
  silently import as the wrong track.
- ⚠️ **It REPLACES the board; it does not merge.** Anything the document does not
  mention comes back empty. Same contract as an incoming share link: it confirms
  first and stashes the old board in `RM_PREV_KEY`.
- ⚠️ **Unparseable input returns `null`** and the button says *✗ Not a board* —
  a half-read board is worse than none, and the existing one is left untouched.
- ⚠️ **The file input is cleared on every open.** Without that, picking the SAME
  file twice fires no `change` event at all and the second import looks like it
  silently failed.
- Cell pipes are escaped on the way out and unescaped on the way back, and the
  table is split on unescaped pipes only — verified with a subject containing
  a literal `|`.
- Verified round trip on a fully populated board: **37/37 weeks identical**,
  goals, events (with dates) and every note body byte-for-byte, blank lines
  inside notes included.

### A week is a SUBJECT plus a detail
Each week holds `{tag, t, track, st}` — `tag` is a couple of words (the subject),
`t` is the full line. The timeline stacks them, subject over detail; **the
calendar prints the subject only**, as a bar spanning that week's seven days.
That split is the reason the calendar is useful at all: a day cell is ~38px and
a full detail line was never going to fit in one.

- ⚠️ **The subject bar is ALWAYS in the DOM, collapsed by
  `.rm-cal-tag:empty { display: none }`.** Typing a subject has to reveal it on
  the calendar *without a re-render* (the caret rule), so `rmCalMark(i)` only
  sets `textContent` and CSS does the rest. Rendering the bar conditionally
  would mean a structural change per keystroke.
- ⚠️ `rmCalMark` writes with **`textContent`, not `innerHTML`** — this is raw
  user input going into the DOM on every keystroke.
- **`rmHasItem` / `rmIsMilestone` / `rmMarkOf` read BOTH fields.** A subject with
  no detail is a legitimate entry (it's the one the calendar can show), so the
  marker dot and the Markdown export must not test `t` alone. `MILESTONE` is
  matched on the subject first, then the text, so older boards keep their flags.
- ⚠️ **`tag` arrived after boards were already saved**, so `rmNormalize` fills it
  in rather than assuming the key exists — a stored board or a share link from
  before it existed would otherwise put `undefined` where a string belongs.
- The subject is faint until its row is hovered (`.rm-week-tag:empty`), or 19
  blank weeks read as 19 unfilled form fields. **Enter in a subject moves to
  that week's detail** instead of blurring — one entry, typed top to bottom —
  and clicking a blank week in the calendar lands on the subject, not the detail.
- Both the subject (timeline and calendar) take the **track's colour**, which is
  what makes a month scannable by workstream at a glance.

### The block calendar (`rmCalHTML` / `rmHi` / `rmCalMark`)
**Two months on screen, stepping by ONE**, as a horizontal filmstrip: all five
are rendered into `.rm-cal-track` and the track is translated, which is what
makes a drag continuous instead of a cut between two renders. Each month is an
8-column grid: a W-number gutter, then seven days.

- ⚠️ **`RM_CAL_SPAN = 2` is how many months are VISIBLE, not how far a step
  moves.** Consecutive pages overlap by `SPAN - 1`, so the month you were
  reading stays on screen beside the one you moved to — that overlap is the
  point of the feature, not a rounding artefact. Everything derives from it:
  `.rm-cal-m` is `flex: 0 0 50%`, the last valid index is `rmCalMax()` =
  `months - SPAN`, and there is one pip per PAGE (4), not per month (5). A pip
  per month would leave the trailing ones permanently unreachable.

- **Paged four ways** — the header's `‹ ›`, the pips, a pointer drag, and a
  trackpad horizontal swipe. `rmCalGo(i)` is the single entry point; the arrows
  disable at the ends and a drag past either end rubber-bands at 0.3×.
- ⚠️ **`rmCalSlide` translates in PIXELS off one SLIDE's width**, not in `%` and
  not off the viewport, because a live drag offset has to be added to it and a
  step is one slide. `rmCalStepPx` **measures a real `.rm-cal-m`** rather than
  computing `clientWidth / SPAN`, so the width lives only in the CSS and a media
  query can change it without the JS sliding to the wrong offset. That is also
  why a **resize listener re-snaps it** — otherwise the strip sits parked
  between two months — and why `rmRender` calls it after rebuilding the slides.
- ⚠️ **A drag that ends on a day must not count as a tap** — the click handler
  bails on `view._rmDragged`, set once a pointer moves more than 6px. Without it
  every swipe also jumped the timeline to whatever day was under the finger.
- **The header names the visible RANGE ("Aug – Sep 2026"); each block names
  ITSELF** (`.rm-cal-mname`). The name used to live only in the header, which was
  right when one month was on screen — with two, a single label cannot say which
  block is which, so it moved back into the slide and the header widened to a
  range. `rmCalLabel()` owns the range, the pips and the arrows' disabled state;
  it must be called from every path that moves `RM_CAL_I`.
- The board opens on the month containing today (`rmCalMonthOfToday`, falling
  back to **index 1 = Sep** when today is outside the range — index 0 is the
  August stub and makes a poor first screen off-season).

- ⚠️ **Weeks run Friday → Thursday and the day columns read `F S S M T W T`.**
  That is not a quirk to "fix": W1 starts Fri Aug 21, and holding every week
  Fri→Thu makes one calendar ROW exactly one roadmap WEEK. That 1:1 alignment is
  what lets a hover in either view light the other, and what makes the block
  read as "which week am I in" at a glance. Move `RM_START` off a Friday and
  `RM_DOW` has to rotate with it.
- **The link is two-way**: hovering a day (or its W-number) lights the matching
  row in the linear list and prints `W6 · Sep 25 – Oct 1 · Design · Planned — item`
  into `.rm-cal-read` in the card header; hovering the list lights the calendar.
- ⚠️ **A day and its W-number HOVER alike but CLICK differently.** A day opens
  its event popover; the W-number gutter (and the subject bar) jumps to the week
  in the timeline, which is what the whole cell used to do. Both still light the
  same week on hover, so the two-way link is unchanged.
- **A week that straddles a month boundary is drawn in BOTH blocks**, with the
  out-of-month days dimmed — the alternative is a week that exists in the list
  but nowhere in the calendar.
- **`RM_CAL_MONTHS` is DERIVED from the week list**, not hand-listed — the two
  were separate constants once and drifted, which is why W1 spent a while with
  no calendar cell at all. It runs from the month of the FIRST week's start to
  the month of the LAST week's start, which gives two useful edges for free:
  **August is a stub block** (W1 Aug 21 is the first start, so nothing before
  the 21st is drawn — the timeline doesn't begin until then), and the final
  week, which starts Apr 30 2027 and runs into May, appears in the **April**
  block with its May days dimmed rather than earning May a block of its own.
  Don't "fix" August's short height: the filmstrip takes its height from the
  tallest slide, so a two-row block costs no layout.
- **The board crosses into 2027**, so blocks are stamped `APR '27` and the
  header spells both years when a page straddles the boundary
  (`Dec 2026 – Jan 2027`, but `Sep – Oct 2026` inside one year). `RM_SPANS_YEARS`
  gates the suffix — on a single-year board it would be noise on every block.
  ⚠️ The timeline's month rules group on **year+month**, not month alone, or two
  different Augusts would fold under one heading.
- ⚠️ **Typing in a week calls `rmCalMark(i)`, not `rmRender()`** — the caret rule
  below applies to the calendar too. `rmCalMark` only re-stamps `data-mark` on
  that week's cells (the dot under the date; gold and larger for a line starting
  `MILESTONE`).
- **Today** gets an accent ring in the calendar and an accent spine + W-number in
  the list, and opening the board scrolls to the current week (`rmScrollToNow`)
  rather than to W1.

### Tracks are workstreams (`RM_TRACKS`)
**Development · Design · Admin · Research.** They replaced `mockup / web / both
/ admin`, which mapped the two Spindeck projects onto a board that only ever
plans one effort — the answer was almost always "Both", so the chip carried no
information.

- ⚠️ **Renaming a track orphans every board already saved under the old value.**
  `RM_TRACK_OLD` maps the retired names forward (`mockup → design`, `web → dev`,
  `both → dev`) and `rmNormalize` runs it **before** the fallback that resets an
  unknown track to `dev` — reverse those two and every old board goes uniformly
  `dev` instead of migrating.
- ⚠️ Colours live in three CSS rules (`.rm-chip`, `.rm-week-tag`, `.rm-cal-tag`)
  and must stay in step with `RM_TRACKS`. **Research took the gold the retired
  "Both" used to**, not a green, because a green subject bar sits directly over
  day cells tinted green for the `done` status.

### Day events (`rmDayOpen` / `rmEvAdd` / `rmEvMark`, `RM.events`)
Clicking a day opens a small editor for **that day's** events. A week says what
the work is; an event is a fixed point inside it — a call, a hand-in, a
deadline.

- **Keyed by ISO date (`{'2026-09-15': ['Hand-in 4pm', …]}`)**, not by week
  index, so moving `RM_START` re-labels the weeks without dragging every event
  to a different date with them.
- ⚠️ **The popover is appended to `#roadmap`, not into the calendar card.**
  `.rm-cal-body` sets `overflow: hidden` to clip the filmstrip and would cut the
  popover in half. It is positioned `absolute` against `#roadmap` (which is
  `position: absolute; inset: 0` and carries no transform) rather than `fixed` —
  `fixed` would silently re-anchor itself if any ancestor ever gained a
  transform. It flips above the day when there is no room below.
- ⚠️ **Opening a day creates a blank row eagerly**, so a day with nothing on it
  is one click from typing. `rmDayClose` therefore **sweeps rows nobody typed
  into**, and `rmEvDel` deletes the key outright when the last event goes —
  otherwise every day anyone merely opened would keep an empty event forever and
  ride along in every share link. `rmNormalize` prunes them again on the way in.
- ⚠️ **Typing calls `rmEvMark(iso)`, not `rmRender()`** — the caret rule again.
  It re-stamps `data-ev` and the title on **every** cell for that day, because a
  week straddling a month boundary is drawn in two blocks at once.
- The marker is `::before` (a corner square), since `::after` is already the
  WEEK's dot and a day can legitimately carry both.
- Events land in `rmMarkdown()` under their own `## Events` heading. They were
  invisible in the export before v3, which meant a board copied out lost every
  date-specific thing on it.

### Meeting notes are per SESSION (`RM.sessions` / `RM.si`)
One tab per meeting, so last week's decisions stay readable while this week's
are being typed. Tabs are named for the day they were opened and are renamable
in place.

- ⚠️ **One textarea, rebound on switch** — not one textarea per tab. `rmTabGo`
  swaps `value`; the single `input` listener writes to `rmSession()`, whichever
  that currently is. Per-tab nodes would leak a listener each.
- ⚠️ **A tab is a `<div>`, not a `<button>`** — the active tab's name is
  contenteditable, and a caret inside a button is unreliable across browsers.
  The `×` calls `event.stopPropagation()` or deleting would also register as
  "switch to this tab".
- ⚠️ **Renaming must not call `rmTabsRender()`** (caret rule), and the last
  session cannot be deleted — the textarea would bind to nothing.
- `rmMarkdown()` emits one `###` per session.

### ⚠️ NEVER ERASE A READER'S BOARD — the standing rule for this file
Every visitor's notes live **only in their own browser**, under `RM_KEY`. We
cannot see them, cannot restore them, and they are overwritten the first time a
new build saves. The user has asked explicitly that updates to this board never
cost their collaborator the notes they have already taken. Treat that as a
constraint on every future change here, not a nice-to-have.

What that means in practice:

- **`RM_KEY` is still `spindeck-roadmap-v2` — the DATES have not moved.** The
  key is bumped only when the week list re-dates, because state is keyed by
  index and reconciling would pin old notes to different dates. Shape changes
  are **migrated** instead: the `v` field (`RM_SHAPE_V`) went to **3** for
  events + sessions, and `rmNormalize` upgrades a v2 board in place — old tracks
  mapped forward, the single `notes` string carried into session 1, `events`
  defaulted. Bumping the key would have thrown away every board and share link
  in circulation for no benefit.
- ⚠️ **Extending the board FORWARD is safe; moving the start is not.** Raising
  `RM_WEEK_COUNT` leaves every existing index on the date it already had and
  pads the new weeks blank — that is exactly how the range went from 19 weeks to
  37 without anyone losing a line. Changing `RM_START`, or shortening the count
  past filled weeks, silently re-dates or drops what people wrote. **Add weeks
  to the end.**
- **`RM_PREV_KEY` (`spindeck-roadmap-prev`) is the safety net.** `rmBackup`
  stashes the stored board's RAW string before anything reshapes it, and
  `rmFromHash` does the same before a share link replaces a local board. It only
  writes when the shape is actually about to change, so ordinary loads don't
  churn the one copy worth keeping. Recover with:
  `JSON.parse(localStorage['spindeck-roadmap-prev'])`.
- Before shipping a change to the state model, ask what happens to a board
  already saved under the old one — and if the answer is "it gets replaced",
  that is a bug, not a migration.

- **Self-contained.** Two new files, loaded last in `index.html`; it imports
  nothing from app.js and app.js knows nothing about it. `rmInit()` runs on the
  **first open**, not at load, so it costs nothing until pressed.
- Lives inside **`#stage`** (already `position: relative`) at `z-index: 90` —
  above the dev box's 60 — so it covers the phones but leaves the toolbar
  reachable. `toggleRoadmap` also sets `.rm-open` on `#viewer`, which hides
  `#thumb-tray` and `#recbox`; without it both sit visible *below* the overlay.
- ⚠️ **The right column is weighted to NOTES, not split evenly** — goals `34%`,
  notes `66%`. Goals are a short standing list that gets read; notes are written
  continuously and are the thing that actually runs out of room.
- ⚠️ **Under 1080px the layout is `display: block`, not a one-column grid.**
  Every `.rm-card` carries `min-height: 0` so it can shrink in the two-column
  flex layout, which makes its content contribution to a grid row effectively
  zero — Chrome split the height evenly between the two rows and both columns
  overflowed theirs, painting the goals card straight over the timeline. Block
  flow has no height to distribute, so cards are content-height and `.rm-grid`
  takes the scrollbar; the per-card caps (`#rm-timeline`, `#rm-goals`,
  `.rm-notes`) are what keep it from running to 19 weeks of full height.
- **Editing is contenteditable + one delegated `input` listener** on `#roadmap`,
  because `rmRender()` rebuilds the rows and per-node listeners would leak on
  every structural change. Fields are `plaintext-only` and Enter blurs rather
  than inserting a `<br>` — a `<br>` would defeat the `:empty::before`
  placeholder.
- ⚠️ **Same rendering discipline as `PLNEW`:** input handlers write state and
  **must not re-render** (it destroys the caret mid-keystroke). Only structural
  changes — `rmCycle` / `rmAddGoal` / `rmDelGoal` — call `rmRender()`, and those
  restore both card bodies' `scrollTop` so the reader isn't thrown to the top.
- **State** is one object in `localStorage` under `spindeck-roadmap-v2`, saved
  debounced at 250ms. `RM_WEEKS` is **derived from `RM_START` + `RM_WEEK_COUNT`**
  (all date maths in UTC — this is a fixed calendar, not a clock) and is separate
  from the stored state, which holds only `{t, track, st}` per index — so editing
  the week list re-labels the board instead of orphaning someone's notes
  (`rmLoad` pads/truncates to match). ⚠️ **Bump the key when the DATES move**, as
  v1→v2 did: reconciling by index would otherwise pin last week's notes to a
  different date. `rmLoad` also resets a `track`/`st` that's fallen out of its
  list, which would break the chip's cycle index.
- ⚠️ **localStorage is per-browser, so a reader's notes never come back on their
  own.** On the live Pages site every visitor gets their own board, saved on
  their own machine — it persists for them across reloads, and it is invisible
  to everyone else. Nothing is shared and nothing syncs between devices.
  `rmMarkdown()` emits goals + a timeline table (Week · Starting · Subject ·
  Track · Status · Detail; blank weeks omitted, typed `|` escaped) + events +
  one section per note session, for **Copy Markdown** / **Download .md**.

### Share links (`rmEncode` / `rmDecode` / `rmCopyLink` / `rmFromHash`)
**Copy link** packs the entire board into the URL hash (`#rm=<url-safe base64
of the JSON>`), so a link is the transport between people. There is no server —
that is the only reason this works on GitHub Pages at all. An empty board is
~1.8k of URL; a meeting's worth of notes stays well inside what a browser takes.

- **Base64 is URL-SAFE** (`+/` → `-_`, padding stripped) — a raw `+` or `/` gets
  mangled passing through chat apps and mail clients.
- ⚠️ **An incoming `#rm=` asks before replacing a board that already exists in
  that browser.** Silently overwriting someone's own notes is the worst possible
  outcome of clicking a link.
- ⚠️ **The hash is stripped via `replaceState` on arrival, decoded or not** — on
  a reload it would otherwise re-import and wipe out everything typed since.
- ⚠️ **`rmNormalize` runs on BOTH paths**, storage and link, so a link from an
  older build can't arrive half-shaped and put a `null` where a string belongs.
  `rmDecode` returns `null` on anything it can't parse (a truncated paste is the
  common case), and the import falls through to the local board.
- Chips cycle on click: track (Mockup · Website · Both · **Admin**) and status
  (`–` planned · `▸` doing · `✓` done · `!` at risk, which also colours the spine
  node **and tints the day cells** in the calendar).
- `rmSeed()` is the single place to change what a blank board contains;
  **Reset** restores it and drops the reader's edits (behind a `confirm`).

## Album Wall — the popular grid (`wallHtml` / `wallGridHtml` / `wallItems`)

Four controls on one row: **Popular · Controversial · Genres ▾ · Week ▾**.
Popular and Controversial are sort modes (`WALL_SORT`, stamped on the chips so
the choice survives the viewer's re-render); Genres and Week are dropdowns.

- ⚠️ **"Controversial" is a STAND-IN and should be replaced when real ratings
  exist.** The mock data contains no disagreement to rank by, and two obvious
  sources are dead ends: `ratingSpreadFor()` floors every bucket at 0.05 and
  suppresses low ratings, so the bottom tail is pinned at exactly 0.20 for all
  100 albums (variance over it ranks the highest-rated records first;
  min-of-tails collapses to `0.4 / total` and rewards the narrowest bell —
  both read as a broken filter), and `album.reviews[]` is `[4.5, 4, 4]` for
  nearly everything, two distinct spreads across the catalogue. It currently
  ranks by proximity to the middle of the scale × `log10(reviewCount)`. Real
  data replaces it with the variance of actual user ratings, at which point the
  wall and the album page's histogram agree by construction.
- `pickWallSort` repaints `.wall2-grid` **in place** on both shells rather than
  calling `renderViewer()`, which would rebuild everything and lose the
  dropdowns' state and the scroll position. That's why `wallGridHtml()` exists
  separately from `wallHtml()`.
- ⚠️ The four chips are sized to FIT (10.5px type, 6px gap, 10px padding);
  "Controversial" sets that budget. Week is no longer pinned right with
  `margin-left: auto`, and `.wall2-menu--time` had to flip from `right: 0` to
  `left: 0` — right-anchoring threw the popup across the screen once its button
  stopped being the last thing on the row.
- ⚠️ **`.wall2-art` is 3px and is NOT a persona knob.** It was in
  `personaSkinCss`'s radius rule; eric's 15px made every cell float as a
  separate card, and no edit to app.css could show otherwise because that rule
  is (0,3,0) and wins. The wall is a dense 3-up grid meant to read as one
  surface, so its corner is a layout decision. Same family of mistake as
  `.v3-album`. `.pl2-card` keeps the token.

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

⚠️ **`s.radius` must never touch `.v3-album`.** It did, and `eric`'s `15px`
rendered the cover's corner at ~27 units against the shell's 20 — a visible
crescent of shell colour at all three corners, and the reason the album "didn't
match the bento". Two things make it wrong: the album's corner is
**structural** (it sits flush inside the silhouette, whose corner is a fixed 20
units of the viewBox and so scales with the phone), and `radius` is a **px**
value, which is the exact trap the comment on `.v3-album` in app.css warns
about — correct at one width, wrong everywhere else. The token still skins
`.wall2-art` and `.pl2-card`, which are free-floating cards.
⚠️ **The lesson generalises: nothing that lines up with a path is a persona
knob.** Before adding a selector to a skin rule, check whether the element
butts against the bento silhouette or the nav.

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
- `dzAdopt` re-deals the queue round-robin by artist so recs interleave with
  your own records instead of stacking behind all ~30 of them — but **only from
  `dzQueueFloor()` onward**, and that boundary is load-bearing. ⚠️ This
  function runs **once per artist per seed — several dozen times** while a deal
  streams in, and it used to re-spread the WHOLE of `trendingAlbums` on every
  call. `_albumIdx` is a *position*, so two bugs fell out of that, both the same
  bug: the **For-You panel lied** (it painted `seq[idx+1]`, the array was
  re-dealt underneath, and the swipe landed on a different record), and the
  queue seemed to **repeat** — swiping never made progress, because each
  re-deal re-randomised the positions just ahead. Simulated over 400 runs of a
  streaming deal: 1.17 repeats and 13.8/15 broken previews before, 0 and 0
  after. The floor is `maxIdx + 3` — the album on screen, the For-You promise,
  and one spare for `albumSeq()` prepending `featuredAlbum`.
  `dzAdopt` also nulls `window.SEARCH_INDEX`, which is memoised and would
  otherwise never see the new albums.
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

### ⚠️ NEVER put a bare backtick inside a screen's template literal

Every screen in `screens.js` is one big `` ` ``-quoted template, and the comments
**inside** the markup are inside that template too. A backtick in one of them —
the `` `.shop-model` `` style this file uses everywhere else — **closes the
template early**. What follows parses as property access and arithmetic on the
string, so the file still loads clean and nothing looks wrong until the screen is
actually rendered:

```
product — see `.shop-model` in app.css. -->      →  ReferenceError: model is not defined
                                                    ("…").shop - model
```

The throw happens inside `navigate()` → `renderViewer()`, so **the whole render
dies and the tap looks like a dead button.** This shipped once and cost the shop
screen entirely. Escape it (`` \` ``) or, better, write the comment without
backticks. Backticks are fine in ordinary `/* */` code comments — only the ones
sitting inside a template literal bite.

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

## ⚠️ The bento viewBox is 689 × 730 (was 689 × 638)

`LeftBento_larger.svg` replaced the shell: the bottom edge moved **637.5 →
729.147** and **nothing else changed** — the album region, the For-You column,
the CD notch and the search corner are byte-identical between the two paths. The
whole gain lands in the stats strip, which went from ~103 units tall to **194.6**.

- ⚠️ **Every Y percentage in the bento is a fraction of 730 now.** X percentages
  are untouched (the width never moved). The cells were re-derived from the
  SVG's own numbers rather than rescaled: album `0.5 → 534.02`, strip
  `534.5 → 729.147`, For-You `105 → 520`, CD `559.074 → 669.074`, pill
  `3.19 → 68.19`. Verified in-page against those units.
- The **strip no longer overshoots**. At 638 it was deliberately 17.5% —
  past the shell's bottom edge, "dipping into the CD-gap below". The new shell
  ends where the strip ends, so it's an exact 26.664%.
- Four copies of the silhouette move together: `bg-left` / `bg-right` in
  `.v3-bg-fill` **and** the same two outlines inside `.v3-master-frame` (painted
  transparent, but they must stay coincident). The right-hand path is a pure
  `x → 689 - x` mirror of the left, same command sequence — that is how the
  original pair was built, so derive it mechanically rather than by eye.
- `.v3-blue` uses `align-content: start`, so the title/rating row stays at the
  top and the new room is one contiguous block underneath.
- ⚠️ **`share.js` still draws the 638 shell.** `BENTO_SHELL` and the cell
  constants it derives from app.css percentages are now wrong on both counts.

## Credits in the bento (`creditsFor` / `populateCredits` in app.js)

"Produced by / Mixed by" in the room the taller shell opened up.

- ⚠️ **Deezer has NO credits.** Verified against the live album endpoint: the
  only people in it are `contributors`, whose `role` is "Main" or "Featured" —
  performers. What it does carry that's credit-adjacent is `label`,
  `release_date` and **`upc`**.
- **MusicBrainz has them, free and keyless**, and Deezer's `upc` matches its
  `barcode` query EXACTLY — no fuzzy title guessing. Chain:
  `dz('album/<deezerId>')` → upc → `release/?query=barcode:` → mbid →
  `release/<mbid>?inc=recordings+artist-rels+recording-level-rels`.
- ⚠️ **All three `inc` values are required.** `recording-level-rels` says WHERE
  to apply relationship includes; `artist-rels` says WHICH kind. Drop the latter
  and the request still returns **200** with every recording missing its
  `relations` key — indistinguishable from "no credits" unless you read the
  payload. Cost an hour.
- ⚠️ **Producers live at RECORDING level, not release level.** Every release's
  own `relations` array tested empty, so the heavy `recordings` include (~100KB)
  is unavoidable — which is why this fetches only for the album on screen,
  debounced 520ms, and re-checks the album before painting.
- ⚠️ **Browser requests get load-shed.** Three identical fetches at 1.5s spacing
  measured **200 / 503 / 200**, while the same URL from curl was 200 every time:
  MusicBrainz squeezes anonymous cross-origin traffic and a browser cannot send
  the descriptive User-Agent their policy asks for. `mb()` retries a 503 up to
  three times (1.5s / 3s / 6s).
- ⚠️ **Never cache a failed lookup.** `creditsFor` caches only definitive
  answers — a 503 that outlived its retries is not "this record has no credits",
  and caching it pins the album blank for the session. Exactly the trap `dz()`
  already documents.
- **Coverage is real but partial: 8 of 10 sampled albums** had producer credits
  (the misses were indie releases — MusicBrainz is volunteer-entered). The row
  stays `hidden` when there's nothing rather than printing an empty label.
### Credits are BAKED — `tools/fetch_credits.py`

```
python tools/fetch_credits.py            # every album missing credits
python tools/fetch_credits.py eric       # one persona
python tools/fetch_credits.py --force    # refetch, including the empties
python tools/fetch_credits.py --limit 20 # smoke test
```

Writes a `credits` array onto each album in `personas.js`; responses cache in
`tools/.credits_cache.json` so a re-run is instant. Same shape as
`build_personas.py` — public APIs, no keys, no scraping.

- **This exists because the browser can't do it reliably** (the 503 measurement
  above). A script sends the descriptive User-Agent MusicBrainz asks for and
  paces at 1.1s, so the credits ship at zero runtime cost.
- ⚠️ **`"credits": []` means "looked, found nothing" and is a real answer.**
  `creditsFor` tests `Array.isArray`, not truthiness — otherwise every
  credit-less album falls through and re-asks the network on every swipe, for a
  question already settled at build time. It's also what makes a re-run skip
  them instead of asking forever; `--force` retries those.
- ⚠️ **A failed request is never recorded as `[]`** — `credits_for` returns
  `None` on network failure and the album is left without the key, so a re-run
  picks it up. Confusing the two bakes "no credits" into the repo permanently.
- The runtime path in app.js now only serves albums the build never saw — the
  recommendation pool Deezer hands us at load.
- ⚠️ **Bump `personas.js?v=N` in index.html after every bake.** It's generated,
  so it's easy to forget it obeys the same cache-busting rule as the hand-edited
  files — the page will happily keep serving the pre-bake copy and every album
  reads as having no credits.
### Three standing rows — Produced by · Mixed by · Label

⚠️ **All three are ALWAYS drawn**, and a missing value leaves its label in place
(faded via `.v3-cred-row.is-empty`) rather than dropping the row. This reverses
the earlier "hide it when empty" rule on purpose: coverage is patchy, so hiding
produced a block that changed height on every swipe, and a strip that changes
shape album to album reads worse than a blank in a standing form. The labels
also double as a statement of what the app thinks is worth crediting.
`Engineered by` is still collected by the bake but not shown — room for three.

⚠️ **Baked albums paint synchronously, skipping the 520ms debounce.** Both
lookups resolve off the record itself for anything the build saw, and routing
those through the timer made the block visibly pop in on every swipe. The
debounce is there to keep the NETWORK quiet, so it should only apply when
there is a request — i.e. the runtime rec pool, which paints its labels
immediately and fills the values in when they land.

The label is one field of the SAME Deezer album call `creditsFor` already makes
for the upc, so it costs nothing extra — and it is a real credit: for a small
act "Independent" is itself the answer.

- **Baked at 100%** — all 159 persona albums have a label, against 52% for
  credits. Runtime recs resolve theirs from one cached `dz()` call (12/12 in a
  sample). Net effect: the row is **never empty**, which is what it needs to be,
  since an empty row in a fixed-height strip reads as a bug rather than as
  absent data.
- ⚠️ `album.label === ''` means "asked, Deezer had none" — `labelFor` tests
  `typeof === 'string'`, not truthiness, for the same reason `credits: []` is a
  real answer. Getting this wrong re-asks the network forever.
- `fetch_credits.py` fills labels and credits **independently** (an album can
  have one and not the other), so a label-only pass doesn't re-hit MusicBrainz
  for credits already settled.

- ⚠️ **In the bento the credits row is rare, and the bake is only half the
  reason.** The swipe queue is the whole of ARCHIVE — 100 albums, of which only
  **33 come from personas.js**. The other **67 are the runtime recommendation
  pool** `expandRecs()` pulls from Deezer at load, which the bake has never seen
  and can't (it's a fresh random deal every session). Measured on one load: 14
  with credits, 19 baked-empty, 67 unbaked. So ~14% of what you swipe past shows
  a credit line, and an album with none looks identical to a bug. The unbaked 67
  fall through to the live lookup, which does work but takes ~5s and is
  503-flaky — fine as a trickle, invisible as a feature.
- **Measured coverage: 83 / 159 albums (52%)**, and it tracks how well
  documented the music is rather than anything about the code — `oldies` 71%,
  `kpop` 55%, `hyperpop` 48%, `thomas` 43%, `eric` 42%. ⚠️ Worth knowing before
  leaning on this feature: MusicBrainz is volunteer-entered, so the credits are
  thinnest for exactly the small and new artists a credits feature is most
  meant to serve. Discogs (needs a token) is the database to add if that
  matters — it also carries the artwork/design credits MusicBrainz mostly lacks.

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
> ⚠️ The markup lives in **`bentoHtml()`** (`screens.js`, above `SCREENS`) —
> one copy, three callers: Float·Dark, Float·Light and the shop's Pro
> showcase. It used to be inlined in both home variants, which were
> byte-identical apart from three comments. Edit it in one place.

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
- `.v3-album` — `3.71747% … / 3.74499% …` (20 units), **bottom-left** square (the
  step junction; the `--left` hand mirror flips that to bottom-right)
  ⚠️ **Its box is derived, not eyeballed**, and every number is now exact: the
  shell's album region is x 0.5→538.5, y 0.5→534.52 (bg-right; the bottom is
  where `.v3-blue` starts), so `left/top/width/height` are `0.5/689`, `0.5/638`,
  `538/689`, `534.02/638` — and `--left`'s `left` is `150.5/689`. The old
  round numbers (78.01%, 21.92%) left the cover half a unit short of the shell,
  which showed as a hairline down one edge. **Change any of these four and the
  two radius percentages have to be recomputed with them** (20 ÷ the box's own
  unit width and height), since a % radius resolves against the box, not the
  viewBox. ⚠️ See also the persona note: `s.radius` must not restyle this.
- **The optical nudge** (`--album-dx` / `--album-dy`, applied as a `transform`
  on `.v3-album`). The derived box lands on the shell's edges to the unit, but
  the two shapes are antialiased curves drawn by different rasterisers — an SVG
  path fill vs. a CSS border-radius — so where they *look* flush isn't where
  they *are* flush. The correction was settled by eye at **-0.5px / -0.2px** on
  the 385px mockup and then **converted to percentages**, so it's a proportion
  of the cover and holds at every phone width. ⚠️ Don't put px back: same trap
  as the radii — right at one size, wrong everywhere else. ⚠️ `translate()`
  percentages resolve against the **element**, not the parent, so these are % of
  the cover's own 538.0 × 534.02, which is why the two axes differ. To turn it
  by eye, 1 phone px = **0.35087%** horizontal / **0.35348%** vertical. It stays
  a transform rather than being folded into `left`/`top` so the box above
  remains a clean derivation and this remains the one thing to turn. Zeroed in
  the `--review` state, where the cover butts against nothing.
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

### The log control — CTA + three quick squares (`.v3-rev-cta-row`)

- ⚠️ **It spans the ALBUM's width.** `.v3-rev-mine` used `align-items: center`
  in the `--album` state, which left the control floating: 268.2px of button
  inside 321.2px of album, 26.5px of air each side, while the cover, the
  histogram and the tracklist all sat flush. It's `stretch` now, with
  `.v3-rev-cta` on `flex: 1` and `width: auto` (it was `fit-content`, which is
  what kept it text-sized) so the button absorbs whatever the three fixed 50px
  squares don't. The base `margin-left: -2px` is zeroed here — an optical nudge
  for a floating button just overhangs an aligned one.
- **The three quick buttons are SQUARE**, and `--sd-q` on `.v3-rev-cta-row` is
  one number doing two jobs: their width and the row's `min-height`.
  `align-items: stretch` hands every child the row's height, so they're square
  only while those two agree — two literals would drift apart.
- **All four share one type treatment**: `--font-main` 600, differing only in
  size (13px / 8px) and case. The captions were mono 400, which made the row
  read as one bold button with three tag-alongs in a different voice.
- **Icons are `SD_ICONS`, built from `SD_DOT_ICONS` through SD_DOTS** — the same
  rounded squares as the pet and the ticker, filling with `currentColor` so they
  inherit hover and `.on` state like a glyph. Don't add `stroke` rules; there's
  nothing to stroke, and a stroke on the rects would fatten the dot off-grid.
- **The CTA's icon is `sdBoxIcon()`** — a frame with an ellipsis of dots inside,
  the three of them breathing on a staggered 2.8s loop. It says "there are words
  to write here" where a pencil said "edit", and it is the only thing on the
  page that moves at rest, which is what marks it as the button to press. Slow
  and shallow on purpose: faster reads as a spinner, i.e. "busy".
  - ⚠️ **Hand-built, not `SD_DOTS.svg()`** — the generator can't mark individual
    cells and the inner dots need their own class. It re-derives the same
    geometry (cell 8, dot 56%, corner 14%); if `dots.js` changes those, this
    follows. `'o'` in its grid means an animated dot.
  - ⚠️ **`transform-box: fill-box` is required** on `.sd-ico-live`. Without it an
    SVG child transforms about the VIEWBOX origin, so `scale()` throws the dot
    across the icon instead of growing it in place.
  - It's 7×5 cells, so it takes an explicit 21×15px rather than the square rule
    the other icons use — a square would squash it.
- ⚠️ **The grids are 5×5.** They render at ~15px, so a 7-wide grid puts each dot
  near 2px and the icon reads as grit — the same budget that governs the pet.
  Shapes are chosen for what survives, not fidelity: **"Listened" is headphones,
  not an ear** (an ear is a curve inside a curve; at 5×5 that's two smudges),
  and the pencil is a plain 45° stroke because a dot matrix only does right
  angles and 45° steps. Redraw them in `dot-lab.html` and paste the rows back.

### Album page — the headline score (`.v3-rev-score`, `populateBigScore`)

Below the "Review, rate, log" row, above the histogram: the album's rating as a
big left-aligned number in **DM Sans 800 / 40px**, with the vinyls on its
baseline.

- ⚠️ **It is deliberately the SAME number as `.v3-blue-score` under the artist,
  printed twice.** They aren't redundant: the one-liner is a label on the record
  (album · year · artist · score), this one is the heading for the ratings
  section beneath it. Keep both — the one-liner was explicitly kept when this
  was added.
- ⚠️ **The one-liner is GONE from the album page entirely** —
  `.s-home-v3--review:not(.s-home-v3--artist) .v3-blue-stars-row { display: none }`.
  The headline score says all of it, and printing the number twice made the page
  read as having two different ratings. The info box here is just album · year
  over the artist, which is why that pair stepped up to **22px / 14.5px** (year
  14px) — it takes the room the row used to hold.
  - ⚠️ **`:not(--artist)` is load-bearing.** The artist page has no score, so
    this row is where its review COUNT lives — "the one stat". Drop the `:not()`
    and the artist page loses it.
  - The compact bento is untouched and keeps number, discs and count.
- It shares its left edge with the **histogram and the tracklist** (the panel's
  content column), not with the CTA button, which is inset inside
  `.v3-rev-mine`. That's what makes the ratings section read as one block.
- ⚠️ `font-family` is declared outright rather than inherited. In this box the
  number under the artist is DM Sans by inheritance and the count beside it is
  mono, so "which family is this?" is a live question — say it.
- Hidden on the artist page, same reason `.v3-blue-score` is: an artist isn't a
  thing you score.
- Light ink in **both** themes, because the album page floods with the album's
  procedural colour (dark in both) — see `applyColorVars`.

### Cell: Blue Box / Reviews (bottom-left)
**The compact bento runs this cell as TWO COLUMNS** (`.s-home-v3:not(--review)`):
album · year over the artist on one side, the score at 27px with the vinyls
under it on the other. **The rating always takes the side away from the CD** —
so it is on the RIGHT in left-hand mode and on the LEFT in right-hand mode,
which is why the mirrored arrangement rides `:not(--left)` and the base block is
the left-hand one. Parking the big number beside the CD read as crowded. In the
mirrored arrangement the text is right-aligned and **the year leads the album**,
a deliberate exception to the app's album-before-year convention so the ragged
edge faces the rating.

The **review count shares row 2 with the vinyls**, on their far side — outward
in the left-hand layout, inward in the right-hand one — in the same faint mono
as before. It is a **bare "12.5k"** in the bento (beside a row of discs the
number reads as a count on its own) and **"12.5k reviews"** on the album page.
⚠️ The word is a `.v3-rc-long` span the state hides, with its leading space
*inside* it so nothing trails when it goes. Branching on `.s-home-v3--review`
in `setMainAlbum` looks equivalent and is **not**: the stars row is painted once
per album while that class is added and removed underneath it, so the text keeps
whichever state it was written in — reproducibly "81k revs" on the album page.

The rating column is therefore a 2×2 grid, not a flex column: DOM order is
score → vinyls → count, and the count has to land *beside* the discs.
- ⚠️ **Done entirely in CSS, on purpose.** These children are shared with the
  fullscreen review state, which stacks the same elements in one column, and
  the artist page sits on top of that — re-nesting them in screens.js means
  re-deriving both. Everything is scoped `:not(--review)`.
- ⚠️ **`grid-row: 1` on both items is load-bearing.** With only a column named,
  sparse auto-placement puts the DOM-first item (the info row, column 2 in the
  mirrored layout) ahead of the cursor, so the stars row — asking for column 1 —
  gets pushed to a *second row*. That is the "rating stacked under the title"
  bug.
- ⚠️ **The title overhangs the rating column, and the artist gives the room
  back.** The rating column's track is sized by its *widest* row — the count
  plus the vinyls — but the title's only neighbour is the compact score above
  them, so a strip beside the title was permanently dead (measured: a 71px
  column against a 28px score). `--sd-title-extra`, set per album by
  `sizeTitleExtra()`, becomes a negative margin on the info row and an equal
  padding on `.v3-blue-artist`. Worth ~34px, a 25% longer title before the
  ellipsis. It has to be measured, not hardcoded: the score is always "N.N" but
  the count is what sets the column's width and it moves ("6k" vs "156k").
  - ⚠️ **The compact row must be `width: auto`.** The base rule says
    `width: 100%`, which resolves against the GRID AREA and pins the row to its
    column — the negative margin then changes nothing and the title gains
    exactly 0px. That was the first version of this fix, and it measured as
    working (the var was set, the margin computed) while doing nothing at all.
  - ⚠️ `sizeTitleExtra` measures **synchronously**, not in a `requestAnimationFrame`.
    rAF doesn't fire in a background tab (same trap as `paintAfterRender`), so
    the callback silently never ran and the title kept its old width. Reading a
    rect forces layout on demand, so the frame bought nothing.
- ⚠️ **Line 1 is three tracks: album, year, and an empty `1fr`.** Two
  content-sized tracks across a `width: 100%` row both stretch, which parks the
  year at the far edge with a hole between it and the title. The flexible track
  also absorbs the artist's span contribution, which would otherwise widen the
  first two tracks and reopen the same hole.
- ⚠️ In the mirrored layout `.v3-blue-title` needs `justify-self: stretch` to
  beat the row's `justify-items: end`. An `end`-aligned grid item is sized to
  its content, so a long album ran left out of its track and over the year
  ("2009 · Man On The Moon…" rendered as "2Man On The Moon…"); stretched, the
  ellipsis in `.v3-blue-album` finally has a box to bite on.
- `.v3-blue-date:empty` is hidden — the year's `·` lives in a `::before`, and
  albums fetched from Deezer arrive `_lite` with no year, which left the dot
  dangling.

Historic geometry, still true of the review state:
- `padding: 17px 12px`
- `border-radius: 0 0 15px 15px`
- Background: `--v3-box2-bg`
- Contains: `.v3-blue-stars-row` with `align-items: baseline` — score number + `halfStars(rating, …)` + review count. Base sizes are score 13px · discs 10px · count 9.5px, with the compact bento scaling the whole row 1.12 (see *Dev Box*). ⚠️ **The two numbers on this line use different families on purpose**: the score is `--font-main` 800 (the headline) and the count is `--font-mono` (metadata). Making them match was tried and flattened the row into one undifferentiated string of digits. `.v3-blue-score` now says `font-family` explicitly rather than inheriting it, so it doesn't read as an oversight.
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
- **The timestamp sits UNDER the avatar** (`.ntf-who` wraps portrait + time),
  not in the copy column. The body is the row's only elastic part and the time
  was the one thing in it that never needed to be. ⚠️ Changed in **both** the
  feed and the inbox — they are one component, and a time in a different place
  on each is exactly the divergence this section warns about.
- **The score is part of the SENTENCE** — "reviewed X by Y **a 4.5**"
  (`.ntf-line-score`). Said out loud that is how the verb ends, so the row reads
  in one pass instead of the eye jumping to the thumbnail to find out what they
  gave it. It keeps the row's own `--sd-ink`, not `--star`, for the reason
  below. `.ntf-obj` is a single child again and `.ntf-score` is retired.
- ⚠️ **The feed's pills run bigger than `.v3-up--sm` elsewhere**
  (`.v3-up--sm.v3-up--feed`). They're the only tap target on a row you're meant
  to scan past, and at the shared size they were the smallest thing on screen.
  Scoped to `--feed` so the review cards' pills, in a denser column, keep theirs.
- **The score used to go UNDER the cover** (retired, see above) — `.ntf-obj` stacks `.ntf-art` over `.ntf-score`, so the row's object is one unit. Parking the number *beside* the thumb was tried first and cost the copy column ~35px on a row that already wraps; below it costs nothing and reads quieter. ⚠️ Only review/rating rows get a number: `FRIEND_ACTIVITY` hands every row a `rating` whether its verb earned one or not, so printing it on all of them would claim a friend rated something they only bookmarked. ⚠️ It takes **`--sd-ink`, not `--star`** — the gold read as an alert on a row whose job is to be scanned past, and collided with the upvote pill's `is-on` gold in the same row. There is **no vinyl** beside it; the avatar's badge already says the act was a review.
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

### Someone else's profile (`openFriendProfile()` · `restoreOwnProfile()`, `app.js`)

**There is no second profile screen.** `profileHtml` reads ONE global object
(`window.PROFILE`), so opening a friend is a temporary overwrite of it: stash
yours, deal theirs into the same object, navigate. Leaving hands yours back.

- ⚠ **The stash is what makes it safe.** Without it your own profile would
  quietly stay whoever you looked at last — the screen has no idea it is showing
  a guest.
- ⚠ **Dealt from the NAME.** `randomizeProfile(seedName)` runs every draw
  through `seedRng(name)` (FNV-1a → mulberry32) instead of `Math.random`, so a
  friend is **the same person every time you open them**. Re-rolling per visit
  reads as the app forgetting who they were. One stray `Math.random()` left in
  that function breaks the guarantee.
- ⚠ **`navigate(id, 'guest')` is a third direction**, beside `'back'`. It is
  what stops `navigate` re-rolling the profile we just dealt *and* restoring the
  one we just stashed. Every other navigation — including a tap on Profile in
  the nav, which means YOURS — calls `restoreOwnProfile()`.
- The edit pencil is hidden while `PROFILE_GUEST` is set.

**The now bar is the way in.** Tapping `.v3-nowbar` opens whoever is currently on
it (`renderNowBar`).

- ⚠ The handler reads **`bar._nowItem`**, not a captured `list[i]`. The ticker
  swaps on a timer, so a closed-over value would open the person who was on the
  bar when the screen was built rather than the one actually tapped.
- `NOW_SWAP_MS` is **10s** (was 4.2). It is a *reading* window now, not just a
  ticker interval — the bar has to sit still long enough to notice a name,
  decide, and reach it.
- The press is the only affordance it gets, and it is a `scale` rather than a
  colour or opacity change: the bar holds a live waveform, and a fade on tap
  reads as the audio doing something.

### Plan — Free vs Pro (`isPro()` · `setPlan()` · `renderPlanBar()`, `app.js`)

**One global: which account is looking at the mockup.** The toolbar's `Free | Pro`
switch sits next to the persona switcher, and is deliberately the same segmented
control — both answer *who is looking at this screen*. Pro lights **gold**, the
app's reserved-for-paid accent, so the viewer chrome agrees with the storefront.

- **The gate is `body.sd-pro`, not a class per screen.** Dark and Light are two
  live phones on stage at once and the mobile prototype has no toolbar at all;
  one write on `body` covers every shell and survives every screen rebuild.
  CSS gates with `body.sd-pro .x`, JS gates with `isPro()`.
- **`setPlan()` re-renders**, it does not patch. Pro changes what screens are
  *made of* — same reason `applyPersona` rebuilds. Persisted to
  `localStorage['spindeck-pro']`; `initPlan()` runs in `init()` **before** the
  first render.
- ⚠ **Buying Pro in the shop routes through `setPlan(true)`.** `sdBuy` special-
  cases `.shop-pro-btn` and returns early — everything else in the shop swaps one
  button, Pro changes the whole app. The row comes back reading "Active" from
  `shopHtml`, so the storefront and the toolbar can never disagree.

**What Pro currently changes**

| Where | Free | Pro |
|-------|------|-----|
| Home bento cover | tap opens the album | tap opens the album, **hold opens the shelf wheel** |
| Shop — Pro row | `$3/mo` button | `Active` pill |

#### The shelf wheel has two hosts now (`proWheelInit`)

`shopProInit` (was the only entry point) is now a thin caller:

- **`shopProInit`** — the storefront demo, inside `#shopPro`. Anyone can hold it,
  Free included; that is what a showcase is for.
- **`homeProInit`** — the real feature, on `.v3-bento` on the home screen.
  Returns early unless `isPro()`.

**Committing a shelf means different things per host** (`commit()` → `commitShelf`):

- **Shop** — *cosmetic*. `setMainAlbum` swaps the cover, tint and text on that
  one bento. A storefront demo must not re-deal the real home screen behind it.
- **Home** — *real*. The shelf becomes the **queue**. `albumSeq()` is built from
  `featuredAlbum` + `trendingAlbums` and the For You box shows `seq[i+1]`, so
  `commitShelf` writes those two globals and then runs `applyAlbumIndex(el, 0,
  …)` on **every** `.s-home-v3:not(.s-shop)`. Writing only the main cover left
  For You and the whole swipe queue on the shelf you had just left.
  ⚠ It is `reshuffleHome` scoped to one shelf — same globals, same `shuffled`
  deal. Change the deal there and it changes here.
- ⚠ **Releasing on the shelf you are already on does nothing.** `commit()`
  compares against `liveIdx`; a hold that ends where it started is a *cancelled*
  gesture, and re-dealing would throw away the album on screen for no reason the
  user can see.

**The shelves** (`shelfPool()` — the one place that knows what a shelf means)

Ordered broad → narrow: the three ways of cutting the whole catalogue, then
genres under them.

| Shelf | Pool |
|-------|------|
| For You | the unfiltered catalogue |
| Friends | albums a friend logged — via `friendRecFor`, the same lookup the feed and the cover's friend tag use, so they cannot disagree |
| Popular USA | top 20 by `reviewCount`, already in the catalogue — no new data |
| *genre* | primary genre only (before the `/`), read from `ARCHIVE`, first 8 |

⚠ Any shelf that cannot field **two** albums is dropped when the wheel is
built, not caught at commit — so an unusable shelf never appears rather than
appearing and doing nothing. Friends is the one that needs this most: it depends
on who the persona follows. `shelfPool` is called at build time *and* at commit,
so a shelf reflects an `ARCHIVE` that `expandRecs` has since widened.

Two ⚠ that only matter on the home host:

- **`touch-action` is CSS and a class, not an inline write** (`.v3-album` /
  `.v3-album--wheel` in `app.css`; `proWheelInit` only adds the class). The
  wheel drags vertically, so it needs `none` where the swipe leaves `pan-y` —
  without it the browser claims the drag for panning and the wheel never moves.
  ⚠ It **used** to be two inline writes racing: `setupAlbumSwipe` wrote `pan-y`,
  `proWheelInit` wrote `none` after it (`populateHomeData` calls the swipe
  first), and inline beat every rule in `app.css` — which is why the old
  `.shop-showcase .v3-album { touch-action: none }` never applied. The browser
  latches `touch-action` at touch-start, before any JS runs, so it has to be
  state rather than a flag left by whoever wired last. As classes it is ordinary
  specificity, and the album page can out-specify both to take the drag back.
- ⚠ **The wheel is tinted by the ALBUM, not by gold.** The lens and the selected
  row read `--v3-accent`, extracted from the cover by `applyAlbumColors` and set
  on the screen element, so it inherits down and the wheel re-tints with every
  album — the bento's "album art drives colour" rule applied to the thing
  sitting on top of the art. Gold is the fallback only. `color-mix()` is what
  gets one variable to two alphas for the lens; a fixed `rgba()` cannot follow a
  var. (`color-mix` is already used elsewhere in `app.css`.)
- ⚠ **A row is a fixed box.** The selected row is set at **24px** against the
  others' 13px — the size step is what makes a list read as a wheel — but
  `height: var(--pick-h)` and `line-height: 1` do not move. Only the glyphs
  scale. Let the row grow with its font and every row below it shifts, so the
  drag arithmetic (whole units of `--pick-h`) walks out of step with what is
  under the lens. Flex + `align-items: center` is what lets 24px type sit in a
  34px box without re-tuning a line-height each time.
- ⚠ **The finger and the list are measured in DIFFERENT units.** `paint()`
  moves the list from inside the box, so it counts in CSS px (`SHOP_PICK_H`);
  the drag happens outside it and counts in **rendered** px (`rowPx()`, the row's
  own `getBoundingClientRect().height`). They are the same number on the home
  screen and are not in the shop, where the model is `transform: scale()`d — nor
  anywhere when the desktop viewer is zoomed. Using the constant for both is
  what made the wheel need a 1.3× longer drag per row inside the shop.
- ⚠ **`--pick-h` (app.css) and `SHOP_PICK_H` (app.js) are ONE number in two
  files** — 34. The CSS var sizes the rows and the lens and centres both via
  `calc(50% - var(--pick-h) / 2)`; the JS constant is what the drag counts in.
  If they disagree, the row under the lens stops being the row you get.
- **Each row carries its album count**, set in **Crimson Text italic** against
  the labels' DM Sans. A different voice reads as an annotation on the list
  rather than as part of a label. The number is the "how much of me is this"
  figure: For You is the whole catalogue, a genre is your slice of it, so
  reading down the wheel shows where your listening actually sits.
- ⚠ **The wheel does NOT use `backdrop-filter`, and must not go back to it.**
  It did, and the blur could not be made to cover the cover: `backdrop-filter`
  samples its backdrop in the coordinate space of its **backdrop root**, and
  `.v3-album` sits under both a `transform` (the sub-pixel optical nudge,
  `--album-dx`) and the viewer's `zoom` on `#phone-container`. Neither is
  accounted for, so the sampled rect landed offset and a strip of cover stayed
  sharp. Growing the box only moved which edge the strip showed on (left, then
  bottom) — the offset is in the *sampling*, not the geometry.
  The blur is a painted layer instead: `.shop-pick-bg`, a copy of the cover with
  `filter: blur()`, filled by `syncBg()` **on every arm** (the cover changes with
  every swipe and commit). `transform: scale(1.14)` overscans so the blur's own
  soft edge is pushed outside the wheel's `overflow: hidden` rather than showing
  as a pale rim. Ancestors clip ordinary content reliably, so it cannot fall short.
- ⚠ **The wash is a layer (`.shop-pick-tint`), not a background on `.shop-pick`.**
  A parent's own background paints *beneath* its children, which would put the
  tint under the very thing it is there to darken.
- `.shop-pick` keeps a symmetric `inset: -4px` as belt and braces for the
  sub-pixel nudge; the parent's `overflow: hidden` trims it. ⚠ Keep it
  **symmetric** — `top: calc(50% - 13px)` centres the wheel on this box, and a
  box grown equally on both sides has the same centre.
- **An armed release has to eat the following click** (`eatNextClick`). On home
  the cover keeps its tap-to-open-album handler, so a shelf change would also
  navigate away from the screen it just changed. The listener goes on
  **`document`**, not the cover: at the *target* phase the DOM fires capture and
  bubble listeners in **registration order**, so a capture listener added to
  `.v3-album` still runs after the `onclick` `setMainAlbum` put there first.
  Only an ancestor's capture listener is guaranteed to go first. Self-removing,
  with a 400ms fallback timer for the release that never produces a click.

⚠ **`.shop-owned` is visible by default now.** It used to be `opacity: 0` until
`sdBuy` added `.is-in` — which meant the tiles you *start* owning (Funky 01,
Hairline, Devotee) rendered blank, because they come straight from `shopHtml`
with no JS to light them. The fade is opt-in via `.shop-owned--new`, which only
the pill `sdBuy` creates carries.

### Shop — the nav scoop's button + the `shop` screen (`sdShopBtn()` · `shopHtml()`)

**The scoop is a shop button now.** `sdScene()` returns `sdShopBtn()` unless
`SD_PET_ENABLED` (top of `screens.js`) is flipped back to `true`.

- **The button** — `.sd-shop-btn` copies `.sd-scene`'s geometry exactly: 63×30,
  `left: 49.1%`, `bottom: 2px`, `z-index: 7`. ⚠️ **Keep the two in step** — if
  the pet ever comes back they have to land on the same spot. The one real
  difference is `pointer-events`: the pet was decorative, this is pressable, so
  it takes the whole scoop as its hit area. The glyph is `SD_ICONS.bag`, a new
  5×5 entry in `SD_DOT_ICONS` (handles over a box), sized **22px against the
  scoop's 63px FLAT TOP, not its 123px opening** — the same narrow-end
  constraint the face was fitted to. `bottomNav(active)` passes `active`
  through `sdScene` so it can light up on the shop screen.
- ⚠️ **`sceneReact` bails when nothing carries `.sd-scene`.** Without that guard
  the first reaction pushes onto `_sceneQ` and starts `sceneFlush`'s 400ms
  interval, which then has no pet to flush to and ticks forever.

#### The four aisles (`SHOP_CATS` · `shopCat` · `data-cat`)

**General is not a category, it is the FRONT of the store** — a little of each of
the other three. Events, Themes and Badges are the full shelf.

| Tab | Shows |
|-----|-------|
| General | Pro showcase · Pro pitch · 2 featured events · 4 themes · 4 badges |
| Events | the Pro pitch + all 6 events |
| Themes | all 6 themes + the 4 frames |
| Badges | all 8 badges |

- **A thing can be in two aisles at once** — `data-cat="general events"`. That's
  how the storefront shows the *same tile* the Events tab does, instead of a
  second copy that drifts. **No `data-cat` at all = never filtered** (the back
  pill, the title, the bar, the footnote).
- ⚠️ **The filter is CSS, not a re-render.** `shopCat` writes one attribute on
  every `.s-shop` and the `.s-shop[data-cat=…]` block does the hiding. A rebuild
  would tear down the Pro showcase — a **live bento with the shelf wheel bound
  to it** — four times a browse, and reset every tile you'd already bought.
- ⚠️ **Every shell, not just the one you clicked.** Float·Dark and Float·Light
  are the same screen in two themes; a filter that moved on one would read as
  two different storefronts side by side. Same reason the plan writes to `body`.
- ⚠️ **The tabs carry `data-go`, not `data-cat`** — they live inside
  `.shop-scroll`, and a tab that could filter itself away is a one-way door.
- ⚠️ **`window.SHOP_CAT`, not a local.** Buying Pro calls `renderViewer()`; a
  tab that snapped back to General every purchase would be its own bug.
- ⚠️ **The bar is `--sd-bg`, never `--bg`.** `--bg` stays dark on both shells
  (`.s-home-v3` hard-codes `#111116`), so it painted a black band across
  Float·Light and swallowed three of the four tabs. `--sd-bg` tracks the shell.
- ⚠️ **Adding a fifth category means a fifth line in that CSS block** — CSS
  can't compare an ancestor's attribute against a descendant's, so each aisle
  has to name itself.
- **Frames live under Themes**, not an aisle of their own: four categories was
  the brief, and a ring around your favourites is the look of your page the same
  way a theme is.

#### Events — tickets, and what Pro actually unlocks (`SHOP_EVENTS`)

The one thing in the shop that **is not a cosmetic**. Everything else dresses up
your page; a ticket gets you into a room — which is why it gets `--list`.

- **`pro: true` renders BOTH states** — the locked `.shop-lock` pill *and* the
  real price button — and **`body.sd-pro` picks one** in CSS. ⚠️ This is the
  point: flipping the toolbar's Free/Pro switch unlocks the whole list in front
  of you, art coming up out of its wash, with **nothing rebuilt**. Gating in JS
  would need a re-render, and a re-render loses the shelf wheel.
- ⚠️ **`.shop-owned` is gated with the button.** Buy as Pro, drop to Free, and
  an ungated "Going" pill would sit on a row you're no longer allowed into.
- **`feat: true` is what General shows — two of them, one of each kind.** The
  storefront gets two rows to say both *there are tickets here* and *some are
  Pro's*, so it can't spend them on two of the same thing.
- **The art is album art already in `images/`** — artists whose records are in
  the archive, so the storefront never bills a record the app has never heard of.
- The Pro pitch row rides along to the Events tab (`data-cat="general events"`):
  that's the one tab where half the list is locked, so it's where the offer
  answers a question the user is already asking.

#### The sheet system — the bento crossed with an app store

The brief was "our bento mixed with the Apple Store". Those pull opposite ways:
the bento is **dense and interlocking**, a store front is **airy and browsable**.
The screen resolves it by scale — **density inside a section, air between them**.

Below the Pro showcase, a section is a **sheet** (`.shop-sheet`): tiles that butt
together over a **3px seam of screen bg**, one outer radius, `overflow: hidden`.

| Sheet | Shape | Holds |
|-------|-------|-------|
| `--shelf` | horizontal rail, bleeds and peeks | Themes |
| `--row` | N equal tiles across | Frames, Badges |
| `--list` | full-width rows, stacked | Events |
| `--pro` | a single row | the Pro pitch + price |

- ⚠️ **`--list` is the only sheet that is not a tray of swatches, and that is
  the bar a fifth type has to clear.** The other three hold things you judge at
  a glance; an event is four facts read **in order** — who, what,
  where-and-when, how much — which is a row, not a square. If a new product can
  be understood by looking at it, it belongs in one of the existing three.

- **`--shelf` is `.v3-aa-row` unchanged** — `margin: 0 -12px` + `padding: 0 12px`
  + `scroll-padding-left: 12px` so a snap doesn't scroll the padding away. The
  last tile peeking off the frame is the point.
- ⚠️ **The sheet casts nothing.** Tiles are what sit proud, via `--sd-card-hi`
  (inset highlight, no cast shadow) like every other card in the app. There is
  no shared tile base class — the two tile kinds have nothing in common past
  that fill.

### Pro · the mix dial (`mixInlineBuild` · `openMixDial` · `beltPath` in `app.js`)

**The logo is a belt drive, so this builds one.** Genres are the holes of a dial;
picking one turns it into a **pulley** and the belt re-wraps to take it in. Pick
one and the shape on screen is the Spindeck logo exactly — big wheel, small
wheel, belt. Pick six and it's a machine you built.

**Where it sits — IN THE BENTO, not in a window.** Pro's cover-hold opens the
shelf wheel: a vertical scroll over the album art that picks **one** shelf. Its
last row is **Custom mix**, which opens the dial instead of committing. The dial
takes the **same square** (`.v3-album`) and its commit sits in **`.v3-blue`**
directly beneath it, so choosing a mix happens on the object it changes.
Confirming calls `commitShelf({kind:'mix', genres:[…]})`.

- ⚠️ **It was a bottom sheet, and must not go back to being one.** A window
  sliding up in front of the bento covered the very thing you were deciding
  about, and added a surface you then had to get out of. `.mix-overlay` /
  `.mix-sheet` are gone; `.mix-inline` + `.v3-blue-mix` replace them.
- ⚠️ **The gesture is a TAP (`mixDialTap`), not a rotary turn.** It *was* a
  turn — press a hole, drag it clockwise to a finger stop, release there to
  commit. That was a lovely gesture in a sheet 340px wide and it does not
  survive the move into a 291px square, where the same travel is a few degrees
  of a much smaller circle. Tapping is also the only thing that lets you add a
  second genre without undoing the first, which is the whole point of a mix.
  Gone with it: `mixDialDrag`, `mixDialFocus`, `dialCW`, `DIAL.stop`,
  `DIAL.commit`, `.ob-dial-stop`, `.ob-dial-plate` (a plate is what a dial turns
  *against*) and the ring's `transform-origin` / spring transition.
- ⚠️ **The belt is untouched by any of that.** It was never the gesture — it is
  the picture of what you built — and it still redraws on every toggle.
- ⚠️ **This was briefly onboarding step 3, and must not go back.** A new user's
  first thirty seconds is the worst place to teach a gesture, and a wall of
  chips is instantly legible where a dial is not. Here the audience is someone
  who already knows to hold the cover — the dial is the reward for knowing the
  app, not the toll to enter it.
- ⚠️ **Only on the real home** (`opts.realShelf`). The shop's showcase commits
  cosmetically to one bento; the demo must not reach out of its case.
- `MIX` lives outside the DOM, so closing and reopening returns you to the mix
  you were building.

#### The geometry is sized to the album cell (`DIAL`)

`.v3-album` is ~**291×289** at the 393px frame, so the 320-unit viewBox renders
at about **0.91px per unit** and everything must fit inside it — labels
included, and they radiate *outward*. The budget from the middle out is
`ring + holeOn + 5 + longest label < 158`:

| | was (sheet) | is (bento) |
|---|---|---|
| `ring` | 120 | **80** |
| `hub` | 44 | **30** |
| `hole` / `holeOn` | 12 / 15 | **10 / 12** |
| `gap` | 7 | **5** |

⚠️ **These five are ONE set.** `ring + holeOn` is what the label budget is left
over from — a corner slice reaches 177.6, a label starts at `ring + holeOn + 5`,
and "Alternative" needs ~77 of what remains. At 80/12 that leaves **80.6**,
about three units of slack; push `ring` past 84 or `holeOn` past 12 and the long
names start condensing again. The other limit is that neighbours must not merge:
holes sit `2·ring·sin(9°)` = **25.0** apart, so a *picked* pair clears by 1.0.
The circles were grown once the corner seating freed the room — the unpicked
hole went 8 → 10 (**+25%**, and it is the state you see most of the time).

##### ⚠️ The box is a SQUARE and the dial is a CIRCLE — so use the corners

How far the middle can reach before it hits the viewBox depends on which way it
points: `vb/2` straight up, and **41% further** (`vb/2 × √2`) into a corner. A
ring that budgets every label for the worst direction throws that away.

`dialRoom(deg)` is that distance; `dialReach(deg)` is what a **slice** may use —
the room at its *narrowest edge*, not along its centre line, because a wedge
drawn to its middle's room would poke out of the square along whichever edge sits
nearer an axis, and take the label with it. Labels start at `ring + holeOn + 5` = **97**, so:

| Holes | Reach | Label budget |
|---|---|---|
| the 8 flanking the diagonals (36°, 54°, 126°, 144°, …) | 178 | **80.6** |
| the other 12 | 160 | **63** |

##### ⚠️ Seating: the longest names get the roomiest slots (`dialSeating`)

The dial walks **holes**, not genres — `DIAL_SEAT[hole] = genreIndex` decides
which name sits where, longest into the roomiest. Verified: all eight of the
longest (*Alternative, Electronic, Dream Pop, Trip-hop, Shoegaze, Ambient,
Country, Hip-Hop*) land in the eight roomy corner slots, and *Pop* / *R&B*
take the axes. Every label then fits at **full width** — condensing becomes the
safety net it should be rather than the thing holding the ring together, and the
room went into **size for everybody**: 10 units → **14** (~9.0px → ~12.6px).

- ⚠️ **This is the one place the dial stops following `SD_GENRES` order**, and it
  is a real trade: that list is editorial (related genres adjacent) and seating
  by length scrambles it around the ring. It became worth it once the dial
  stopped **turning** — adjacency used to mean "a related pick is a short turn",
  and there is no turn any more. `return SD_GENRES.map((_, i) => i)` in
  `dialSeating` puts the editorial order back; nothing else needs to change.
- ⚠️ **Both sorts fall back to the original index on a tie**, so the seating is
  deterministic. The ring must not reshuffle between renders.
- ⚠️ **`data-i` stays the GENRE index**, not the hole — that is what `MIX`,
  `mixToggle` and `mixDialSync` speak in. `dialAngleOfGenre` (via `DIAL_HOLE`,
  the inverse map) is what `dialWheels` uses to put a pulley where its genre
  actually sits; without it the belt wraps the *unseated* positions.
- ⚠️ **There is no `DIAL.hit` any more and don't add one back.** How far a slice
  reaches is not one number.
- ⚠️ **Each label's budget is STAMPED on it** as `data-w` by `mixDialSvg`, where
  the angle is known. A corner has ~81 and an axis ~63, so one shared budget would
  either condense the corners for nothing or let the axes overflow.

##### The labels are a VARIABLE face, condensed per label (`mixDialFitLabels`)

Half the genres are short (Pop, Jazz, R&B, Folk) and a couple are not
(Alternative, Electronic). A fixed face has to be small enough for the **longest**
name, which throws away the space the short ones aren't using — that is why the
labels sat at 10 units on SUSE Mono, rendering about **9px**.

They are now **Roboto Flex** — the same variable face the album title uses
(`.v3-blue-info-row`), already loaded in `index.html` with all three axes at full
range (`opsz 8..144, wdth 25..151, wght 100..900`). Set at **14 units (~12.6px, 40% bigger)** — a size the seating above is what
makes safe — and anything that still overflows gives up **width** rather than
size. With the current twenty genres nothing has to: all projected at `wdth` 100.

- ⚠️ **Measured, not estimated.** `mixDialFitLabels` asks the engine via
  `getComputedTextLength()`, which reports in **user units** — the same units as
  the budget — and the rotate/translate a label sits under preserve length. How
  much a name overflows depends on the face that actually loaded, the axis
  position and the letter-spacing; none of that is safe to guess.
- ⚠️ **Iterated, because width is not linear in `wdth`.** The first guess is
  proportional and two corrections land it. It bails the moment a pass stops
  making the label narrower, so a name that cannot fit even fully condensed
  settles instead of looping.
- ⚠️ **It runs again on `document.fonts.ready`.** Roboto Flex arrives over the
  network; until it does, the first pass measures the **fallback** face, which
  has no `wdth` axis and reports somebody else's widths.
- ⚠️ **Measurable at build time only because `.mix-inline` is `opacity: 0`, never
  `display: none`** — the same reason the shelf wheel's `rowPx()` can measure a
  row before the wheel is armed.
- ⚠️ **`DIAL_WDTH_MIN` is 60, not the axis floor of 25.** Roboto Flex will go to
  a hairline at 25 and the label stops being *readable* long before it stops
  fitting. A genre that needs more than this should be shortened in `SD_GENRES`.
- ⚠️ **`opsz` is pinned to 9, not left on `auto`.** The SVG is scaled by its
  viewBox (~0.9px per unit), so the used font-size `auto` would read is the
  unscaled 13 — an optical size for text half again as big as what lands.
- ⚠️ **The axes arrive as custom properties** (`--lwdth`, `--lwght`), because
  `font-variation-settings` replaces the whole tuple: a plain `font-weight` on
  the picked state is ignored while that property is set, and the JS fit pass
  would wipe the weight if it wrote the tuple itself. One variable each.
- **`.ob-hole-t`'s `font-size` is the one dial to turn** if the labels read too
  small or too tight — raise it and more names get condensed, lower it and fewer
  do. `DIAL.hit` is matched to the same 158, so the far end of a long name is
  inside its own tap wedge rather than a few pixels past it.

#### ⚠️ A genre's tap target is its WEDGE, not its hole (`dialWedge`)

Twenty holes on a 74-unit ring sit **23 units apart**, so a hole grown into a
decent target would touch its neighbours — and the hole itself is ~15px on a
phone, which is not a target at all. Each genre already **owns 18°** of the
dial, so the hit area is that whole slice, from the hub out to `DIAL.hit`, with
its hole *and its label* inside it: a **26×115px** slab instead of a dot.

- ⚠️ **The wedge is painted FIRST** in the `<g>`, so it sits under its own hole
  and label, and it is the **only** thing in the group that takes a pointer —
  `.ob-hole-c` and `.ob-hole-t` are `pointer-events: none`, so every tap in the
  slice reports the same target and there are no dead gaps between them.
- ⚠️ **`mixDialTap` swallows the click whether or not it hit a genre.** The dial
  covers `.v3-album`, which carries `onAlbumArt` — a tap on the empty middle
  would otherwise fall through and navigate to the album page out from under the
  dial. `.mix-inline` stops the bubble too.
- ⚠️ **`bentoGesturesOn` returns false while `--mixing`.** The swipe underneath
  would otherwise change the album out from under the dial, and the cover-hold
  would arm the shelf wheel on top of it — both reading the same drag the taps
  are landing in.

#### The readout moved to the info box (`.v3-blue-mix`)

The hub used to carry the count; a 52-unit record has no room for it, and the
box below already exists to say what you are looking at. So the box that
normally tells you what this **album** is tells you what the **mix** is — album
count in DM Sans, genre count in the same Crimson italic the shelf wheel uses
for its counts, and `Play this mix` on the right.

- ⚠️ **It covers `.v3-blue` completely and stops the bubble**, which is also
  what takes that box's tap-to-open-album off the table while you are choosing.
  Otherwise committing a mix could navigate away from the screen it was
  committed for.
- The box's normal children go `visibility: hidden`, **not** `display: none`, so
  the box keeps the height its own content gives it and nothing below shifts.
- ⚠️ **The dial carries its own dark tokens** (`.mix-inline`), exactly as the
  sheet did. It draws in `var(--text)`, and on a *light* home it would otherwise
  come out as near-black ink on a dark, tinted cover.
- ⚠️ **Tinted by the ALBUM, not by gold** — `--accent: var(--v3-accent, …)`, the
  same rule the shelf wheel follows, so the belt re-tints with the art.
- ⚠️ **The blur is a painted layer** (`.mix-inline-bg`, refilled on every open),
  never `backdrop-filter` — see `.shop-pick` for why that cannot work under the
  bento's transform and the viewer's zoom.

##### ⚠️ The dial's labels are editorial, so `shelfPool` matches them LOOSELY

`SD_GENRES` (screens.js) is a **hand-written list of 20**, unlike the wheel's
rows, which are read back out of `ARCHIVE` and therefore always match. The mix
case used to do an exact, case-sensitive compare — and the archive writes
`Hip-hop` where the dial says `Hip-Hop`, so **the single biggest genre in the
catalogue (44 albums) scored zero**, the hub read "0 albums", and the button sat
dead on the app's most obvious pick.

It now lowercases both sides and asks whether the label is *contained* in the
genre, which fixes the casing and folds the compound names in with it — that is
what a broad genre shelf is supposed to mean:

| Label | Takes | Was → is |
|-------|-------|----------|
| `Hip-Hop` | Hip-hop, Experimental hip-hop, Korean hip-hop | 0 → 44 |
| `Rock` | Alternative rock, Art rock, Noise rock, J-rock… | 3 → 13 |
| `Pop` | Art pop, Indie pop, K-Pop, Hyperpop… (deliberately) | 3 → 11 |
| `Indie` | Indie rock, Indie pop, Indie Folk | 0 → 6 |
| `Soul` | Neo-soul, Electronic soul | 0 → 3 |

- ⚠️ **An album can now match several picked genres**, so the old note that "an
  album has ONE primary genre, so it can match at most one member of the mix" no
  longer holds. `filter` visits each album exactly once so the pool still cannot
  contain a duplicate (verified: Rock+Alternative+Indie = 29, all unique) — but
  **don't** rewrite it as a pass per genre that concatenates. That one can.
- **10 of the 20 holes still can't stand alone**, because those albums are not
  in the catalogue at all: Punk, Metal, Latin, Country, Blues and Funk have
  **zero**; Ambient, Dream Pop, Shoegaze and Jazz have one. They combine fine —
  they just can't be a shelf by themselves, and the button now says so.
- ⚠️ **`dzRecord` sets `genre: ''`** (`expandRecs`'s Deezer records), so the
  hundreds of albums that widen `ARCHIVE` at runtime join **no** genre shelf.
  That is why these counts stay in the tens while the archive grows. Fixing it
  means mapping Deezer's `genre_id`, and it would lift every genre at once.

- `MIX` lives outside the DOM, so closing and reopening returns you to the mix
  you were building.

#### Getting out — the corner pill, not a ✕ (`s-home-v3--mixing`)

**The dial has no close button of its own.** The cover-hold opens it and the
gesture does not resolve until you commit a mix or leave, so you are *held* in
this state and need a way back — and the app already has one dedicated back
affordance: `.v3-live-pill`, the bento's corner notch, which is the hand-layout
switch on the home bento and **Back** in review. The dial borrows it rather than
inventing a second exit.

- `openMixDial` puts `s-home-v3--mixing` on its host and `closeMixDial` takes it
  off; `mixHost` is both "which screen" and "is it open at all", and every
  lookup in `mixDialSync` is scoped to it. Reopening from the other home variant
  clears the old host first — a screen left marked keeps a dial over its cover
  and a pill saying Back with nothing to go back from.
- `onLivePill` checks `--mixing` **before** `--review`: while the dial is up,
  this pill means back ahead of whatever the screen underneath would make it.
- ⚠️ **No z-index lift, and don't add one back.** It was `z-index: 201`, because
  the dial used to be a bottom sheet whose scrim (`.sd-log-overlay`,
  `inset: 0; z-index: 200`) lay over the whole bento and swallowed the tap while
  the pill still looked perfectly clickable. The dial now lives inside
  `.v3-album` — `z-index: 1`, `overflow: hidden` — so it cannot reach the pill
  at 6, let alone cover it.

#### `beltPath()` — the convex hull of a set of CIRCLES

Not the hull of their centres. The wheels have different radii (the hub is three
times a pulley), so an outline offset from a centre-hull cuts through the hub and
floats off the small ones. The real thing is what a belt physically is: an
external tangent between each consecutive pair, joined by the arc each wheel
actually wraps. Gift-wrapping, one wheel at a time — standing on a wheel with the
outward normal at `ang`, the next is whichever needs the least clockwise turn.

- The shared normal of an external tangent satisfies `(c2−c1)·n = r1−r2`, i.e.
  **`φ = atan2(dy,dx) − acos((r1−r2)/d)`**.
- ⚠️ **MINUS, not plus.** The two solutions are the two external tangents, one
  down each side, and only one belongs to a clockwise walk with an outward
  normal. Taking the other still closes the loop **for two wheels** — so the logo
  case passes while everything else is wrong — but from three wheels up the
  least-turn choice skips wheels and the belt runs straight through the hub.
  Sanity check on two equal circles side by side: the top run's normal points
  **up**, i.e. `base − acos`.
- ⚠️ **The iteration cap is not decoration.** A degenerate set (two wheels
  sharing a centre) would wrap forever and hang the tab instead of drawing
  nothing.
- Radii arrive already grown by `DIAL.gap`, so the belt is drawn where a belt
  sits — off the wheels, with the clearance the logo has.
- Verified against nine configurations (none / one / adjacent / opposite /
  spread / cluster / all twenty): every straight run clears every wheel, every
  arc belongs to a real wheel, the path closes, and every wheel ends up wrapped
  or interior.

#### Pro showcase — the real compact bento (`shopProInit` in `app.js`)

The top of the shop is **the actual compact-state bento**, not a drawing of one:
the same `bentoHtml()` the home screen renders, found and filled by the same
`populateHomeData`. Showing the object beats picturing it, and it means the
showcase can never drift from the thing it sells.

- ⚠️ **`bentoHtml()` is new, and it deduplicated the home screen.** The bento
  markup was inlined **twice** — Float·Dark and Float·Light were byte-identical
  apart from three comments. One copy now, three callers. Declared above
  `SCREENS` for the same reason as `sdScene()`: the home `html:` is a static
  template literal evaluated while `screens.js` parses.
- ⚠️ **Style the CASE, never the bento.** `.shop-showcase` only zeroes the
  bento's home-screen margin, and the scale lives on a `.shop-model` wrapper.
  Anything that reaches in and restyles a `.v3-*` will drift from home the first
  time home changes — if the showcase needs the bento to look different, that
  means the bento should change, not that the shop should override it.

##### The bento is shown as a SCALE MODEL (`.shop-model`, 76%)

At full size the showcase reads as the home screen with a shop bolted above it
— you are looking at your phone, not at a product. Shrunk and centred, with air
on every side, the same object reads as the thing on the shelf.

- ⚠️ **A transform, never a width.** Everything inside the bento is px (type,
  radii, the CD) positioned against a `%` frame, so narrowing the box would
  shrink the frame and leave the type at full size — the layout breaks instead
  of scaling. `transform: scale()` is the only thing that takes the whole object
  down uniformly, which is what a scale model *is*.
- ⚠️ **A transform doesn't change the LAYOUT box**, so the model's full-size
  height would leave a hole under it. `.shop-model`'s negative `margin-bottom`
  takes back exactly what the scale removed: a % margin resolves against the
  parent's **width**, and the bento's height is its width × `--v3-bento-hw`.
- ⚠️ **`--v3-bento-hw` (1.0595, on `.s-home-v3`) is `.v3-bento`'s `aspect-ratio`
  written a second time as a number** — `calc()` cannot divide a ratio type.
  Both carry a note; change one and change the other.
- ⚠️ **The Pro tag does not scale.** It is a label on the display, not part of
  the product, so it stays full size and is positioned off the *model's* left
  edge — `calc((1 - var(--shop-model)) / 2 * 100% - 2px)`, half the width the
  model gave up.
- The scale is one number: `--shop-model` on `.shop-showcase`.
- ⚠️ **The showcase's cover must not tap through.** `setMainAlbum` skips its
  `onclick` when the art is inside `.shop-showcase` — there the cover owns a
  HOLD, and a tap-through would navigate the shop screen itself to an album
  page. Re-checked on every album change, because that handler is reassigned
  each time.

**What Pro adds — the shelf wheel.** Hold the cover, a vertical wheel comes up
over the art, drag to pick For You or a genre, release and the bento **moves to
that shelf for real**: `setMainAlbum` re-tints the box, re-runs the typewriter
and swaps the art, exactly as on the home screen.

- ⚠️ **The wheel is built in `shopProInit`, not in `bentoHtml()`.** That
  component is shared with home and stays pristine; the shop is what wants an
  overlay, so the shop is what adds it. It is appended *into* `.v3-album` so it
  inherits the art's rounded corners and covers exactly what you're holding.
- ⚠️ **Hold, not tap.** `SHOP_HOLD_MS` is 240. On the home screen the delay is
  what separates "open this album" from "change shelf", so the demo has to
  teach the delay too.
- ⚠️ **`top: calc(50% - 13px)` on BOTH `.shop-pick-list` and `.shop-pick-lens`**
  centres selection 0 under the lens without either knowing the art's size —
  the art is square and sized by the bento's percentage grid, so there is no
  height to hard-code. 13 is half of `SHOP_PICK_H` (26); change one, change both.
- **Drag down moves down the list** — the row you pull toward the lens is the
  one you get.
- **Shelves are real**, read from `ARCHIVE`: primary genre only (the part before
  the `/`), first album per genre stands for it, `For You` pinned first. No new
  data.

#### The album page's CTA row — clearing the credits

⚠ **`.v3-blue` is absolutely positioned**, and on the album page it is
`height: auto; overflow: visible` — so the three credit rows (Produced by /
Mixed by / Label) grow it **downward out of its own box**, and nothing in normal
flow below knows they are there. The CTA row landed on top of them.

- `--rev-cred-h` (40px) is that overhang, added to `.v3-rev-mine`'s base 26px.
  3 rows × 10px names at line-height 1.28 ≈ 38px. Turn it if the rows are restyled.
- ⚠ **Declared on the SCREEN, not on `.v3-rev-mine`.** Custom properties inherit
  *down*, and `.v3-blue-credits` is a **sibling** of that column — a var set on
  the column is invisible to the block it is measuring.
- Credits coverage is patchy (MusicBrainz is volunteer-entered) and the block is
  `hidden` when nothing came back, so
  `:has(.v3-blue-credits[hidden])` drops the var to `0px` — otherwise the
  reserved space is just a hole. (The one `:has()` in `app.css`.)
- ⚠ **The CTA row is 80% wide, not 100%.** Full width put it on the album's own
  grid, which read as correct beside the histogram and the tracklist — but it
  also made the page's one ACTION the widest element on it, so it stopped
  reading as a button and became another band of layout. The 20% it gives up is
  what makes it look pressable. ⚠ It is CENTRED with `margin-inline: auto` —
  `.v3-rev-mine` is a flex *column*, so `align-items: stretch` is what was
  positioning it, and once the row has an explicit width stretch has nothing to
  stretch and drops it on the left edge.

#### Colour, type, copy

- ⚠️ **Colour comes from the tile, not the sheet.** Frames and badges pass a
  `--tint` as an `"r,g,b"` triple and `.shop-field--tint` washes with
  `rgba(var(--tint), .13)`. This is the **bento's procedural colour moved onto
  products** — the home bento takes its colour from the cover; a shop tile takes
  its colour from what it sells. Themes skip the token and fill the field with
  their own palette inline, because there the swatch **is** the preview.
- **Gold is reserved for what you can act on** — buy buttons, prices, and the
  armed state of the Pro picker. It is not used as decoration anywhere on this
  screen.
- ⚠️ **The title is DRAWN, not set** (`SHOP_WORD` in `screens.js`,
  `.shop-title-mark` in `app.css`). It used to be DM Sans 800 at 34px. There is
  **no wordmark font in this project** — the SPINDECK lockup is
  `images/spindeck-wordmark.png`, a drawn mark with no typeface behind it — so
  the only way for a heading to sound like the brand is to be *built from the
  brand's module*. `SD_DOTS.svg` spells `SHOP` on a 19×5 grid in the same
  rounded square, same 14% corner, same `currentColor` tint as the bag in the
  nav scoop. Size it by **height**; the width follows the viewBox.
  ⚠️ `SD_DOTS` ships its `<svg>` `aria-hidden`, so the word rides beside it in
  a `.shop-sr` span. **Change the pattern, change that text.**
- ⚠️ **There is no lede.** "Make Spindeck yours." is gone and should not come
  back — it told you nothing the shelves say better, and the aisle bar needs the
  room. A store's tagline is the one line a shopper never reads.
- **The price is the button** (`.shop-buy`) — there's no second word to read,
  and no cart to put anything in. `sdBuy` swaps it for a pill of the **same
  footprint** so the row doesn't reflow. The word on that pill is the tile's to
  choose via **`data-owned`**: cosmetics become `Owned`, a ticket becomes
  `Going`, because a night out is not a thing you own. Nothing is charged or
  persisted.
- Everything is placeholder: invented names and prices, art is CSS. Themes reuse
  the `Funky 01` name the Settings row already shows.

### The pet — the face in the notch (`sdScene()` · `paintScene()` · `sceneReact()`) — **PARKED**
> The scoop holds the **shop button** now (see Shop above). Disabled via
> `SD_PET_ENABLED = false` in `screens.js`; the whole engine below — `paintScene`
> / `sceneTick` / `sceneReact` / `SCENE_REACTIONS`, every `.sd-face` rule, the ☺
> Pet box — is intact and untouched. Flip the flag to bring it back. ⚠️ The two
> **cannot share the notch**: it is 63×30 and the face was already sized against
> its worst formation (see `--sd-face-k` below).


**Six dots**, the same six the live pill's arrow is made of, at the same offsets
the retired `.v3-ring--smile` used (they still live in the website proto's
`bento.css` — that is the reference copy). Two eyes over a four-dot mouth arc.
It **reacts to what you do**: favourite, rate, listen, save for later, like,
follow, add to a playlist.

- ⚠️ **Formations, not sprites.** This replaced an SD_DOTS pixel grid that
  swapped a whole 21×10 SVG per frame. A sprite swap is a CUT; these dots
  inherit `.v3-ring-dot`'s 0.4s spring, so a reaction MORPHS out of the smile
  and settles back. A new reaction is six numbers in app.css plus one row in
  `SCENE_REACTIONS` — no engine change.
- ⚠️ **The dots are ROUNDED SQUARES, not circles** — `border-radius: 14%`,
  which is SD_DOTS' `cornerFrac` (dot = 56% of the cell, corner = 14% of the
  dot). They shipped as `50%` because they were copied from `.v3-ring-dot`,
  which was itself circular; **both are now 14%**, so the pill / back-pill /
  follow rings and the pet are the same dot as every generated asset. If the
  rings should go back to circles, it's one declaration.
- ⚠️ **`--sd-face-k` (1.85) is sized against the WORST formation, not the
  resting face.** At 2.1 the smile was a comfortable 25.9 × 20.3 in a 55.4 ×
  26.4 box while the equaliser hit **34.3 tall and broke 7.9px out of the
  scoop**. Shrinking far enough to contain that alone would have left the face
  tiny, so the bars were re-cut too. Measure every formation's ink against the
  box after changing either — the resting face fitting proves nothing.
- ⚠️ **The equaliser grows from a floor** (`transform-origin: center bottom`,
  the one formation that overrides the default centre). Scaled about their
  centres the bars grew in both directions at once — that's what pushed them out
  of the notch, and it read as a bar chart rather than a meter. Every bar shares
  one y and differs only in `scaleY`, so the ceiling is a single number: floor
  4.5 + half-dot 1.5 − 3 × scaleY. **Cap is 4.0**; past that it leaves the notch.
- ⚠️ **The dot must scale WITH the face.** The ring's look is a PROPORTION, not
  a size: 3px of ink across an 11px mouth span, ~27%. Holding the dot at 4.2px
  while scaling the offsets 2.4× dropped it to 16% and the face came out
  spindly and visibly wrong *even though every coordinate was byte-identical to
  the original*. `--sd-face-k` (2.1) scales the whole thing uniformly.
- ⚠️ **Six dots can say EXPRESSIONS and BARS. Nothing else.** The first cut had
  a heart for favourite and a six-point star for rated; on a contact sheet at
  real size both are just a ring of dots — the identical mistake that killed the
  cat mascot and the landscape. Every reaction is now the face emoting, and the
  equaliser is the one object formation that survives. **Build a contact sheet
  at 63×30 before wiring a new formation up**; on paper a heart is obviously fine.
- ⚠️ **The log sheet covers the scoop completely** (hit-tested:
  `elementFromPoint` at its centre returns `.sd-log-song`). Favourite, listen,
  listen-later and the rating all live in there, so a reaction fired from the
  sheet would animate behind it unseen. `sceneReact` therefore **queues when
  covered and replays on close** — which is the better behaviour anyway: you log
  a record, dismiss the sheet, and the pet is waiting to react. Visibility is
  decided by STACKING, not a list of overlay classes: walk to the `.app-screen`
  and compare the highest z-index against the scene's 7 (bare home tops out at
  5, the log sheet at 200). Don't test `el.contains(elementFromPoint(...))` —
  `.sd-scene` is `pointer-events: none`, so that is false even on an open home.
- ⚠️ Anything with class `.sd-scene` gets repainted by the shared clock. A
  static preview of several formations must use a different wrapper class or
  the tick sets them all to the same frame.
- ⚠️ `setLogRating` is called by `openLogSheet` to repaint a saved draft, so the
  reaction there is guarded by `_sdlogRestoring` — otherwise the pet threw a
  rating reaction every time you opened an album you'd already scored.

### The retired sprite scene (`SCENE_FRAMES`)
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

### Progressive cover load (`sdCover` in app.js, `.sd-pix` in app.css)

Covers resolve from big blocks into small ones while they're still on the wire —
the brand's dot-matrix language applied to loading. Used by `setMainAlbum` (the
hero and the CD), the For-You panel, and `slideIn`'s incoming swipe layer.

- ⚠️ **It only runs when the image is actually slow.** Under `PIX_GRACE`
  (190ms) — cache, wifi, a local file — the cover just appears. An effect on
  every load is a gimmick, and on a fast connection it's *added latency*: half a
  second watching pixels resolve over a picture that had already arrived.
  `PIX_SEEN` makes a cover resolve at most once per session, so swiping back and
  forth doesn't re-run it.
- ⚠️ **The placeholder is a real low-resolution FETCH, not a blur of something
  we already have.** Deezer serves every cover at any size off one path
  (`…/<md5>/1000x1000-000000-80-0-0.jpg`), so `pixTinyUrl` rewrites that segment
  for a 56px thumbnail — **1,190 bytes against 46,744**, measured. That is what
  makes it *progressive* rather than decorative: there is genuinely more picture
  on screen sooner, which is the entire point on 5G. All 158 remote covers
  rewrite; the 145 local `images/album-*` files have no variant and never trip
  the grace timer anyway.
- ⚠️ **No `crossOrigin`, unlike `computeAlbumColors`.** That one needs it to
  read pixels back; this one only ever *draws*, and a tainted canvas draws fine.
  Setting it would make covers fail outright on any host without CORS headers.
- ⚠️ **The backing store takes the ELEMENT's aspect, not the artwork's.**
  `.v3-for-single` is 113×415 — stretching a square thumbnail across it smears
  the blocks into tall rectangles — so the thumbnail is cover-cropped into a
  canvas of the box's ratio, exactly like `background-size: cover`.
- ⚠️ `image-rendering: pixelated` **is** the effect (a 5×5 store blown up to the
  box), and `border-radius: inherit` is required: the canvas rides three
  elements with three different corners, one of them the album's derived
  two-axis radius, so any literal value would be wrong on at least two.
- Steps are `PIX_STEPS` on an ease-in-out over `PIX_MS` — it holds the coarse
  blocks a beat, then resolves in a rush — then cross-fades to the sharp image.
  Reduced motion skips the whole thing.

### Procedural Color System
`applyAlbumColors(screenEl)` in `app.js` runs after every render:
1. Reads album art URL from `.v3-album`'s `background-image`
2. Draws to 48×48 canvas, finds most vibrant pixel
3. Sets on `.s-home-v3`: `--v3-accent`, `--v3-box1-bg`, `--v3-box2-bg`

Light theme overrides these with hardcoded values (`background: #999`) — still WIP.

### Music Preview System
30-second Apple Music previews, played via a single reused `<audio>` element. All in `app.js`.
**Previews are OFF** (`PREVIEWS_ENABLED = false`) — see *No autoplay* below.

**Fetching (`fetchPreviewUrl`)** — iTunes Search API over JSONP (no CORS). Two hops: `fetchItunesAlbum` → track lookup. Cached by `"artist – album"` (lowercased):
- `PREVIEW_CACHE` — resolved results (a URL, or `null` for a known miss).
- `PREVIEW_PENDING` — in-flight promises, so concurrent lookups for the same album share one request.
- **`fetchItunesAlbum` / `ITUNES_CACHE`** hold the first hop on its own, because *Listen on* wants the same record's `collectionViewUrl` while the preview wants its `collectionId`. One request, one cache, `null` included.

**State (`PREVIEW`)** — intent is the single source of truth; the UI **never** reads `audio.paused` (it lags while buffering, which made the icon "invert" on 5G):
- `on` — preview mode armed (speaker). `paused` — CD-paused within the mode. Playing ⟺ `on && !paused`.
- `gen` — token bumped on every tap and every album change; a late fetch bails if `gen` (or the album `key`) changed while it was in flight, so a slow result can't hijack the audio.
- `unlocked` — the element is unlocked once, synchronously, inside the first tap gesture (a runtime-built silent WAV). iOS only permits programmatic `play()` after that — this is why previews wouldn't start before.

**No autoplay — a product decision, not a limitation.** Previews were briefly armed by the first touch of the phone and it worked; it was removed because music that starts on its own is a thing users switch off, not a feature. **Don't wire it back up.** The row in the CD's menu is the whole of the preview feature: you ask for one, you get one. (For the record on the constraint itself: no page may start audio before a gesture — `play()` before one is rejected, and iOS additionally requires the `<audio>` **element** to have been played once *inside* a real gesture, which is the job of `unlockAudio` and its runtime-built silent WAV.)

**Warming (`preloadPreviews`)** — **forward-only and staggered**, and neither is arbitrary:
- Forward-only for the same reason as `preloadForYou`: a swipe goes forward, For You shows what's next, and the album behind you is already cached — warming backwards spends a budget you can't get back.
- Staggered (`PREVIEW_WARM_GAP` = 400ms) because iTunes refuses outright when several requests land in the same instant. Measured: a ~120ms gap errors, 400ms+ is clean — and the empty result sets in between are **real catalogue gaps, not throttling** (Blonde and Loveless genuinely aren't in the Search index).
- ⚠️ The album actually making sound is **never in this queue**; `playPreviewFor` fetches it directly, so nothing warm is ever ahead of it.

**Actuation (`playPreviewFor(album, gen)`)** — plays the preview for a **specific album passed in**, resolved through the cache. It must NOT re-query the DOM for "the current album": there are multiple `.s-home-v3` instances (variants + mobile clones) and `querySelector` returns the first, which often isn't the one you swiped — that was the "swipe plays the wrong/stale track" bug. `loadPreview(album)` (called from `setMainAlbum` on every album change) passes the swiped album straight through. Only the tap handlers use `currentBentoAlbum()`, which prefers a **visible** screen.

### Listen on — Spotify / Apple Music / Deezer (`openOnService` in `app.js`, `SD_SERVICES` in `screens.js`)

The three rows under the preview in a CD's menu. Tapping one opens that service
on the album — on a phone these are **universal links**, so the OS hands off to
the installed app; on desktop the same URL opens the web player. Nothing is
mocked. Wired on the **bento's CD** (home *and* the album page) and on the
**profile card's five CDs**; the playlist page's identical-looking menu is left
alone, because a Spindeck playlist is not an album and has nothing to link to.

**Where a link comes from**

| Service | Link | Why |
|---------|------|-----|
| Deezer | the real album page | public API, no key, and `deezerId` is already on anything the rec pool dealt — often no request at all |
| Apple Music | the real album page **when the match is confident**, else a search | iTunes Search indexes the *store*, not all of Apple Music — Blonde and Loveless simply aren't in it |
| Spotify | always a search | its API needs an OAuth token and a static page has nowhere to keep one |

- ⚠️ **The tab is opened INSIDE the gesture.** `window.open` after an `await`
  is a popup and gets blocked — the first tap on every album would silently do
  nothing, which looks exactly like a dead button. A warm link opens directly; a
  cold one opens a **blank tab now** and gets steered when the lookup lands.
  Opening the menu calls `warmServiceLinks`, so by the time a finger travels
  from the CD to a row the tap is nearly always the direct path.
- ⚠️ **`SERVICE_URL_CACHE` caches `null` too.** "Deezer hasn't got this record"
  is worth remembering — otherwise every tap re-asks and the row goes on feeling
  broken in a new way each time. A miss dips the row (`.none`), the same
  language the preview button already speaks.
- **Which album a menu belongs to** (`menuAlbum`): the bento's reads `_album`
  off the **shell it sits in**, never a global — several `.s-home-v3` are in the
  DOM at once and the first is usually not the visible one (the same trap behind
  the old "preview plays the wrong track" bug). The profile's five CDs share one
  screen, so each names its favourite's `slot` instead — which is also why
  `toggleProfCd` now takes a slot.
- ⚠️ **`SD_SERVICES` + `platRowsHtml(slot)` in `screens.js` are the ONE copy of
  those rows**, declared above `SCREENS` (the bento's markup is a template
  literal evaluated as the file parses, so the table cannot be declared after
  it). They used to be two hand-written copies of the same wall of inline SVG.
- **SoundCloud is gone** from these two menus, replaced by Deezer. There is no
  keyless way to resolve an album on it, and a row that opens nothing is worse
  than a row that isn't there.

### Matching a record to a service (`pickItunesAlbum`)

Shared by the preview and the Apple link, and the reason the old one had to go:
searching *"Phoebe Bridgers Punisher"* returns a **cover of Punisher by someone
else** above anything of hers, and the old picker took it — the title contained
the album, so it stopped looking. **The artist has to agree before the title
counts at all.**

Tiers, best first: `0` exact title · `1` same record reissued · `2` right artist,
wrong record · `3` nothing. Within a tier the **shortest** title wins, which is
what keeps a plain album ahead of its own deluxe (SOS over "SOS Deluxe: LANA").

- Two title normalisers, each catching what the other can't. `normFull` keeps
  everything — "Crystal Castles (II)" and "(III)" are different records and
  stripping the numeral would merge them. `normBase` drops parentheses and
  edition suffixes — "In Utero" has to match "In Utero (20th Anniversary
  Edition)", the only one Apple has.
- ⚠️ **`wantB` is guarded against empty.** The archive stores Crystal Castles'
  albums as `"(II)"` / `"(III)"`, which strip to nothing — and an empty string
  would then match every other title that also strips to nothing. Those records
  are caught by comparing **artist + title** as well, which is how `"(II)"`
  meets the service's "Crystal Castles (II)".
- ⚠️ **Tier 2 is returned, not dropped.** The preview wants *something* by this
  artist and has always settled for that; the Apple link refuses it and falls
  back to a search. **The caller decides how much certainty it needs** — don't
  make the picker stricter to fix a link, or previews go quiet.

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

Ten sample lists (data in `plLists()`, shared with the playlist page) carry memey user-typed titles (mixed case, stray symbols — they're personal, not editorial), **custom cover art** (`images/playlist-*.jpg`, sourced from Eric's own images — deliberately NOT album covers), an `edited` stamp, and `plays`. Card click → `openPlaylistPage(name)`.

### The card

Two things were tried and dropped on the way here, and both matter before changing this:

1. **A wall of 80px split rows** (geometry from `PlaylistBox_NEW.svg`, gone along with every `.pl2-list-*` rule). Too small to be anything — a playlist is the one object in the app the user actually *made*, and a row gave it nothing.
2. **Five user-pickable themes** (poster / polaroid / tape / index / classic). ⚠️ Killed deliberately: a wall where every card is a different shape reads as a mess, and most people never open a picker — so the wall gets judged on the default anyway. **Do not reintroduce per-card shapes.**

What is left is **one card**, 3:2, art full-bleed under a scrim with the title set at 24px over it. The variety comes from where it should: the **artwork**, which differs for every playlist because the user chose it, and the badges. The frame stays constant so ten of them stack into a wall instead of a pile.

- ⚠️ **`aspect-ratio`, not a fixed height.** The phone frame is not one width (the viewer zooms; the mobile prototype is the real device), and a card locked to 230px goes squat on a wide frame and cramped on a narrow one.
- ⚠️ **The scrim is a gradient layer, never a `filter` on the art.** Darkening the whole image to make type readable throws away the picture the card exists to show. It has **two** mid stops — a single linear ramp leaves a visible band across the middle at this height.
- ⚠️ **The art is scaled 1.04 and grows on press**, not the card alone. The card is mostly picture, so the press has to happen to the *picture* or it reads as the text moving.
- ⚠️ **No light-theme overrides, on purpose.** Every piece of type sits on a photograph, not on the page, so it stays white in both themes — exactly as album art does everywhere else. The light theme only touches the empty state behind an unloaded image.
- The `·` separators in the meta row come from CSS (`span + span::before`), not the markup — a leading dot before an empty first item is the classic version of that bug.

### Moving covers — GIF and video (`plIsVideo` · `plArtHtml` · `plVideoWatch`)

A cover can be a still, a **GIF** or a **video**. A GIF needs nothing special — it animates as a `background-image` like any other file — so video is the only case worth detecting, and `plArtHtml` returns either a `<div>` with a background or a real `<video>`. The same helper backs the card, the playlist page hero and the upload well, so all three agree.

- ⚠️ **Detect on the `data:` MIME as well as the extension.** An uploaded cover arrives from `FileReader` as a `data:` URL with no filename at all, so an extension test alone renders every uploaded video as a blank box.
- ⚠️ **The markup ships NO `autoplay`, and `preload="none"`.** A wall of ten cards can hold ten videos, and ten decoders at once is what turns a scroll into a slideshow — on a real phone over 5G, the exact case this prototype exists to test. `plVideoWatch` plays them by visibility instead.
- ⚠️ **The observer's root is `.v3-body`, the element that actually scrolls — not the viewport.** In the desktop viewer the phone is a box on a page that never scrolls itself, so a viewport-rooted observer reports every card as permanently visible and plays all ten.
- ⚠️ `muted` + `playsinline` are not optional: without `muted` the browser refuses to play without a gesture, and without `playsinline` iOS takes the video fullscreen the moment it starts.
- ⚠️ `object-fit: cover` on `.pl2-art-vid` is the video equivalent of `background-size: cover`. Without it the frame is letterboxed and the crop stops matching every other cover on the wall.
- **Two sample covers move**: `playlist-car-dash.mp4` (93KB) and `playlist-wildflowers.gif` (283KB), so both paths are exercised by the sample data rather than only by an upload. Both were generated from the stills beside them with ffmpeg — a slow zoom, **mirrored so the loop is seamless** — which is why they are kilobytes rather than megabytes. The upload input accepts `image/*,video/mp4,video/webm`.

### Badges (`PL_BADGES`, up to `PL_BADGE_MAX` = 3)

Emblems the owner pins on a card, drawn in the **dot system** (new 5×5 entries in `SD_DOT_ICONS`: `gem` `flame` `moon` `bolt` `drop` `sun`), so a badge is the same material as the nav and the log buttons rather than a sticker from somewhere else. Each has its own colour: now that the card is fixed, badges and artwork are the *only* things that vary, so a card wearing three should read as three things and not a row of identical chips.

- ⚠️ **Badges survived the theme cull because they cannot break the wall** — they are small, they sit in a slot the design reserves for them, and no arrangement of them makes the page look wrong. That is the test for anything else added here.
- ⚠️ **The cap is the design.** A card wearing six badges says nothing.
- ⚠️ **The editorial tag is a different object from a badge.** Crown = community favourite (favs > 25), candle = staff pick, staff wins. Square not round, top-*left* not top-right — a badge is self-expression, the tag is a verdict from outside, and the two must not be mistaken for each other.

### Customising a card

⚠️ **Nothing here is sold, and nothing is locked.** Themes and badges were briefly products in the shop and it was the wrong call: a playlist is the one place in the app where the user is the *author*, and charging for how they dress their own work turns self-expression into a tier list. The line that came out of it: **cosmetics that dress up YOU** — profile themes, frames, the badge by your name — **are fair game; cosmetics that dress up what you MADE are not.** Don't add a `price` field to `PL_BADGES`, an ownership check to the sheet, or a playlist section back to `shopHtml` — all three were removed on purpose.

- **`plCustom()` / `plSetCustom(name, patch)`** — per-playlist overrides in `localStorage['spindeck-pl-custom']`, merged over the authored defaults at the end of `plLists()`. The authored `badges` exist so the wall is not a column of bare cards on first load.
**Two controls, two scopes** — and deliberately two different glyphs:

| Where | Glyph | Opens |
|-------|-------|-------|
| in the badge row, top-right | `+` | `openPlCustomize(key, triggerEl)` — the badges sheet |
| lower-right corner | pencil | `openEditPlaylist(key)` — the playlist itself |

- ⚠️ Two pencils in two corners would be a coin flip. The `+` sits next to the badges it adds to; the pencil is the whole playlist.
- ⚠️ The badge row **still renders on your own card when there are no badges yet** — otherwise the only way to get a first badge would be a control that appears once you already have one.
- ⚠️ `@media (hover: none) { opacity: 1 }` on the corner handle, or it is unreachable on the device this is designed for.
- **`openEditPlaylist`** re-uses the New Playlist page rather than adding an edit screen — every field is already there, and a second form would drift out of sync with the first. `PLNEW.editing` holds the stable key and is the only thing that tells the two apart; `plnewCreateLabel` swaps the button to *Save changes*. ⚠️ `openNewPlaylist` must clear it, or "+" silently overwrites whatever was edited last.
- Saving branches on where the playlist lives: one you created is a real object in `PLNEW_CREATED` and gets mutated; an authored sample is regenerated on every `plLists()` call, so the change goes to `plCustom` under the **stable key** and is merged back over the literal.
- ⚠️ **`key` is stamped last in `plLists()`, from the literal's own name**, so it cannot be overridden. Everything customisable is stored under it rather than under the displayed name — which is what lets the editor rename a playlist without orphaning its badges.
- ⚠️ **The sheet writes through immediately** — no Save, same as the log sheet and the dev box. Every tap re-renders the wall behind it, so you choose against the real card rather than a preview.
- ⚠️ `PLC.light` remembers which shell the sheet was opened from. Dark and Light are separate screen elements and every change re-renders both, so without it the sheet could jump variants mid-edit.

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
- **Favourite albums:** each `.prof-fav` disc in the rail → `openProfPicker(slot,
  btn)` opens a bottom-sheet album picker (`#prof-picker`); `profPick(name)`
  writes `PROFILE.favs[slot]` and `renderViewer()`s.
- **Social:** `.prof-social` tab → `toggleProfSocial` opens `.prof-soc-menu`;
  `openSocial(id)` deep-links to instagram/x/soundcloud + the stored handle.
- The card's action button (`.prof-act`, Edit on your own page) opens **Edit
  Profile** — see below.
- Being an `.s-home-v3`, `populateHomeData` runs on it (now-playing bar) — the
  bento-only calls no-op just like on wall/playlists.
- **Deploy note:** `images/profile-skin-01.png` is a new asset — `git add` it.

---

### The header's three bubbles (`.v3-bubble`)

Notifications · settings · search — the only always-present controls on the
shell. **34px with 17px glyphs**, up from 30/15: at the old size they were the
smallest tap targets in the app. ⚠️ Kept modest rather than pushed to the 44px
guideline floor — the header is a 60px strip and the brand block sits between
the two groups, so growing them much further crowds the wordmark. ⚠️
`.v3-bubble--notif.has-notif`'s `min-width` tracks this number: the expanded
pill can be narrower than the circle it grew from with a small count, and that
`min-width` is what stops it shrinking as it lights up.

---

## The nav console — where a CD tap goes (`openConsole` in `app.js`)

Tapping a CD used to raise a **popup over the screen**. It doesn't any more, and
it must not go back: a floating panel covered the record you had just tapped, and
it was a second surface to dismiss on a screen that already has a nav. The nav's
plateau is already the app's "what is playing" strip, so the answer to *where do
I hear this?* belongs in it.

**The plateau grows** (`.s-home-v3--console`), the friends ticker gives way to the
album you tapped, and the room that opens up holds the four services.

### ⚠️ The geometry lives in five CSS variables and nowhere else

Four elements share the nav's box — `.v3-bottom-nav`, `.v3-nav-blur`,
`.v3-nav-nest`, `.v3-nav-emboss > i` — and **three of them carry a mask of the
same contour**. They all read `--nav-ar` / `--nav-mask` / `--nav-mask-neg` /
`--nav-mask-scoop` / `--nav-shoulder`, so the console state is **one override
block** rather than eight edits that drift apart.

- ⚠️ **The outline is the one exception.** It is an inline `<svg>` whose
  `viewBox` CSS cannot reach, so `bottomNav()` ships **both** contours and CSS
  toggles which is visible. Change one and change the other.
- **The tall contour is the short one with every point below the plateau pushed
  down 88 units** and a straight wall inserted between the plateau's two fillets,
  where the tangent is already vertical. The fillets are untouched — which is why
  nothing distorts. `preserveAspectRatio="none"` would happily stretch them, and
  `--nav-ar` changes in step so it never has to.
- The shoulder is `34.1217/93` = **36.69%** normally and `(34.1217+88)/181` =
  **67.47%** grown: the same line in absolute terms, a different fraction of a
  taller box. `.v3-nav-items` reads it, or the icons would float.
- Regenerating after a rise change is mechanical — see the derivation in the CSS
  comment; every path is the short one plus the offset.

### ⚠️ The console is a child of the NAV, not a sibling

It was a sibling positioned in **px from the screen bottom**, and that is wrong
here: the nav is `aspect-ratio` driven, so its height follows the frame width. The
two drifted apart the moment the viewer scaled the phone and the panel floated
clean out of the plateau. As a child it is placed as a **% of the nav's own box**,
the only thing that tracks the plateau at every size.

- ⚠️ The ticker stays a sibling — its px offsets ride the viewer's `zoom`, as
  they always did.
- The band is `top: 5%; bottom: 34%`. Measured at the 385px frame: the plateau's
  interior is **81.6px** and the content needs **74px**. It was 72 units of rise
  and a 57px band, which overflowed by 5px and clipped the album title.
- ⚠️ **`.s-home-v3--console .v3-nowbar` hides with `visibility`, not `display`.**
  `renderNowBar`'s swap timer keeps writing to the ticker while the console is up,
  and a `display: none` element has no box to measure.

### Growing, and the background around the grown indent

⚠️ **What animates is `aspect-ratio`**, on all four boxes that share the nav's
geometry. Height is not settable here — it *is* the aspect ratio — and a custom
property cannot be transitioned, but the property that READS it can, so swapping
`--nav-ar` drives a real interpolation.

- ⚠️ **The masks and the outline swap DISCRETELY** — a data-URI mask cannot
  tween. For the ~260ms of the growth the tall contour is squashed into a shorter
  box, and because everything is `preserveAspectRatio="none"` that reads as the
  plateau unfolding rather than as a glitch.
- The **content** is not carried by that: it fades and rises on its own, a beat
  behind, or it appears fully drawn inside a plateau that has not finished
  opening. `prefers-reduced-motion` turns all of it off.
- ⚠️ **`.v3-bottom-fade` HAS TO GROW WITH THE NAV** (`--nav-fade-h` /
  `--nav-fade-solid`). It is sized in px from the screen bottom, and the console
  makes the nav nearly twice as tall — the band tuned for the 62px bar stopped
  **58px short** of the new top edge, so content ran sharp and unfaded straight
  into the raised plateau. The nest still plugs everything INSIDE the nav's box;
  this is about the content above it. Derivation: the nav is docked, so its top
  edge is its own height above the bottom (121px at the 385 frame); the solid
  band must reach just past that, so `121 + 2 − 39` = 84px solid of a 118px box
  = 71%.

### The line, and the marks

**One line: art, album, year, artist.** ⚠️ The album is the only part that may
shrink (`min-width: 0` + ellipsis on it alone) — let the year or the artist flex
and a long title pushes them off the end, losing the two facts that are always
short.

- ⚠️ **No close button.** It closes on the next thing you do, so a persistent ✕
  was a control for something that already puts itself away, and it cost the line
  the width it needs to read as one sentence.

#### Service marks: drop a real icon in and it wins (`svcMarkHtml`)

Two layers per tile — the vector below, an `<img src="images/svc-<id>.png">` over
it — and **the image wins when it is there**. The `<img>` removes itself
`onerror`, so:

- **Adding a real app icon is the whole change**: save it as
  `images/svc-spotify.png`, `svc-apple.png`, `svc-deezer.png`, `svc-ytmusic.png`.
  No code edit, no build step.
- A **missing** file degrades to the drawing rather than leaving an empty tile.
- The image is absolutely positioned over the whole tile, so a real icon covers
  the drawing **and** the brand colour behind it. Verified both ways: with a file
  present the `<img>` survives and matches the tile exactly; with none, all four
  remove themselves and the vectors show.
- ⚠️ **The vectors are approximations drawn from memory. They are the FALLBACK,
  not the goal** — if a tile looks wrong the fix is the real file, not another
  pass at the path data. (Apple Music's was a *star* at one point, which is not
  their mark at all; it is a beamed double-note now. Spotify's waves are black on
  green and YouTube Music is a red disc on white, per the real app icons.)
- `platRowsHtml` uses the same helper, so the CD menus and the console can never
  show different marks.

### It closes on the next thing you do

A scroll, a touch on the bento, the CD again, or the ✕. That is what keeps it
from being a *mode*: you never have to put it away. `closeConsole` is idempotent
so every path can call it blind.

- ⚠️ The scroll listener goes on **`.v3-body`**, the element that actually
  scrolls — in the desktop viewer the phone is a box on a page that never scrolls
  itself, so a window listener would never fire.
- ⚠️ Wired per **open** and torn down on close, not once at build: a permanent
  `pointerdown` on the bento would run on every tap of a screen that is usually
  not in console state at all.
- ⚠️ `capture` on the bento, because the CD, the cover and the For You box all
  stop propagation in their own handlers.
- ⚠️ A tap **inside** the console must not close it — the service buttons live
  there, and the padding between them does not stop propagation on its own.

### ⚠️ The album lives on the SHELL (`_consoleAlbum`)

Several `.s-home-v3` exist at once and the first is often not the visible one —
the same trap that once played previews for the wrong track — and the console can
be showing a **profile favourite**, which is not the shell's bento album and has
no slot index once it is on the nav. `consoleGo` reads it from there;
`openOnService` still goes through `menuAlbum` for the menus that remain.

- `serviceGo` is the one opener both paths share, so the cache, the miss
  behaviour and the open-the-tab-inside-the-gesture trick exist once.
- ⚠️ **`nowBar()` had been inlined into both home variants**, so the console the
  helper ships simply did not exist on the one screen it matters most on: the tap
  set the state and there was nothing in the plateau to show. Both now call the
  helper. Exactly the duplication that made `bentoHtml()` necessary.
- **YouTube Music** joins `SD_SERVICES` (four now). Like Spotify it resolves to a
  **search**: there is no public lookup without an API key, and a keyed call does
  not belong in a static prototype.
- ⚠️ **The profile's per-disc popups are gone.** Tapping a favourite raises the
  console, so the menu that carried *Listen to preview* and the service rows had
  nothing left to offer — previews are off (`PREVIEWS_ENABLED`) and the services
  moved. It also carried **Replace album**, which is now reached only through
  Edit Profile → tap a disc.

---

## Profile — "Regular" theme card (`profCanvasHtml` in `screens.js`)

The other profile theme: a neumorphic card traced from **`ProfileTheme_Regular4
(1).svg`**, shared by the profile page and the Edit Profile screen (which shows
the same card live above its form — building it twice would let the preview
drift from the real thing).

### ⚠️⚠️ The `viewBox` height and the canvas `aspect-ratio` are ONE number

`.prof-base` is `viewBox="0 0 690 460"` and `.prof-canvas` is
`aspect-ratio: 690 / 460`. **Change one without the other and the card breaks in
a way that is very hard to read.** `preserveAspectRatio="xMidYMid meet"` scales
the drawing to fit the *shorter* axis, so a 608-tall viewBox inside a 460-tall
box renders the whole card at **75.7%** and centres it — while every
percentage-positioned element on top stays exactly where it was. Nothing looks
broken on its own; the card is simply wrong everywhere at once. This is exactly
what happened when the favourites moved out.

### The canvas is 690×460, not the file's 690×608

The artwork's bottom ~150 units are the five favourite-album circles, and those
are no longer in the card — they are a swipeable rail in their own section. The
canvas stops where the *card* stops, at y=449, plus a little air.

Every percentage in app.css's `.prof-*` block resolves against **690×460**:
horizontals are `x / 690`, verticals are `y / 460`. **A value copied from an
older revision lands in the wrong place without looking obviously wrong**, which
is the trap every time this changes — it has been 466, then 608, now 460. What
the artwork revision itself changed:

| | old (690×466) | new (690×608) |
|---|---|---|
| card body | y 65.7→328 | y 74.7→**449** |
| picture pane | x 0→262.3 (37.9%) | x 0→**374.5 (54.3%)** |
| right pane | 61.8% of width | **45.6%** |
| name banner | to x 409.9, y→69 | to x **467.5**, y→**74.9** |
| CD row | in the card, 5 wells | **out of the card** — see below |
| action button | bottom-right notch | free-standing, lower right |

- ⚠️ **The stats became a 2×2 grid.** The picture took the width the old row of
  four needed: the right pane is ~153px at the 393px frame, and four columns at
  7.4px do not fit. The pane is tall enough to spend a second row.
- ⚠️ **The bottom-right notch is gone from the silhouette**, so nothing seats in
  it any more — the right edge runs straight from 429 up to 94.7. The action
  button is a free-standing pill resting inside the corner instead.
- ⚠️ **The right pane is ONE flex column (`.prof-right`), not three positioned
  boxes.** Stats / bio / location each carried a hand-computed `top`, and any
  restyle inside one of them silently pushed it into the next — giving the stats
  their inset wells grew that block by ~20px and dropped the bio on top of it. A
  column cannot overlap itself, and `.prof-meta` takes `margin-top: auto` so a
  short bio leaves the gap above the location rather than below it. Only the
  action button stays absolute: it is anchored to the card's corner, not to the
  end of this stack.
- ⚠️ `.prof-info` / `.prof-meta` need `position: relative` now — they are flow
  children, and the `.pfe-slot` badge used to get its containing block for free
  from the slot being absolutely positioned itself.

#### ⚠️ ONE action button, not two (`.prof-act`)

**Edit** on your own profile, **Follow** on someone else's — the same element,
with `PROFILE_GUEST` deciding what it says. They were separate elements once, so
*both* rendered on your own page; giving them a shared box then made the later
one in the DOM hide the other, and **the pencil vanished**. A page offers one
action here, so there is one element.

#### The stats: three figures, STACKED

**Following · Followers · Review score**, down the right pane, and nothing else
in it. Playlists went first (the section below already shows them, with covers),
then the review **count** — it is baked into the score, which is points per
review plus points per like.

- ⚠️ **Stacked, not a row, and that is what buys the size.** Side by side, each
  figure was capped by the width of its own *label* — "Following" at 7px already
  took 40px of the ~45px each column had — so the numbers could not exceed 17px
  however much vertical space the pane had. Down the column each gets the full
  width: measured, the widest text is **62.7px of 131.5**, and height is what
  binds instead (three ~42px blocks in a 161px column, ~14px slack).
- Numbers are **34px** against 9px labels. The label can be a real word again for
  the same reason — the row could only afford "Score".
- ⚠️ **No emboss.** Each figure briefly sat in its own inset well; stacked, three
  wells read as a list of controls rather than as a readout.
- ⚠️ **The bio and the location are OUT of the card, temporarily.** The pane was
  a stat row, a two-line paragraph and a pin all competing in a ~131px column and
  none of them had room to be read. `metaHtml` / `pinIco` in `screens.js` and the
  `.prof-desc` / `.prof-meta*` rules in app.css are deliberately kept so putting
  them back is a few lines. ⚠️ **While they are out, bio and location have no
  edit affordance** — their `pfe-slot`s went with them.

#### ⚠️ The action button is UPPER RIGHT

It sat in the card's lower-right corner and moved. Down there it was *inside* the
card, level with the stats, and read as part of that block rather than as the
page's one action; up here it is on the strip above the card, opposite the name
banner — where the trace puts a pill (x 600→688, y 1→55) and where a profile's
follow control is expected.

- ⚠️ **Wider than the traced pill on purpose.** 12.75% is ~46px at the 393 frame
  and the dots plus "FOLLOW" want ~58. 17% gives ~61px and still starts at 81.5%,
  clear of the name banner, which ends at 67.8% (measured clearance: 43.7px).

#### Favourite albums — a rail of three (`profFavsHtml` · `profFavPaint`)

Five small wells traced into the bottom of the card became **three big discs,
one centred and two peeking**, swipeable, with a panel underneath. At the old
size **the cover was all you got** — no title, no artist, no year — and a cover
is not enough to know an album by. The panel says album, artist, stars, and
year · genre · review count.

- ⚠️ **CSS scroll-snap, not a hand-rolled gesture.** This has to feel native
  under a thumb, and the browser's own momentum, rubber-band and snap beat
  anything written here. The swipe engines elsewhere in this app exist because
  they animate a bento cell; this does not.
- ⚠️⚠️ **The rail must never get horizontal padding.** It was `padding-inline:
  19%` once and **nothing lined up**: percentage `flex-basis` resolves against
  the flex container's **content box**, so side padding of 19% made each disc
  62% of the *remaining* 62% — 38.4% of the rail — while the centring arithmetic
  is written in percentages *of the rail*. Padding silently redefines what a
  percentage means in here.
- **The end spacers (`.prof-fav-pad`) are gone**, along with the ends. They
  existed so the first and last disc could reach the centre; a looping rail has
  neither, and a spacer sitting at a seam would open a hole in the wheel.
- ⚠️ **`.prof-fav-rail` must stay `position: relative`.** That makes it each
  button's `offsetParent`, which is what puts `offsetLeft` in the same
  coordinate space as `scrollLeft` for `profFavPaint`.
- ⚠️ **The menus live AFTER the rail, not beside their disc.** The rail is
  `overflow-x: auto` and would clip a popup. `toggleProfCd` and `profCdPreview`
  therefore find them by `data-slot` rather than by `nextElementSibling` /
  `previousElementSibling` — both lookups were adjacency-based and both broke.
- ⚠️ **A tap on a disc that isn't centred scrolls it to the middle** instead of
  acting on it (`profFavTap`). Opening a menu for an album that is half off the
  screen is the only other option, and it isn't one.
- ⚠️ **The rail opens on the second disc OF THE MIDDLE COPY** (`profFavStart` →
  `profFavHome`). There has to be runway on both sides from the first frame, or
  the first flick left runs straight off the end before the loop can wrap.

##### It LOOPS — there is no end to reach (`profFavLoop` · `profFavSettle`)

`profFavsHtml` emits the five discs **`PROF_FAV_LOOPS` = 5 times over** (25
buttons, `data-n="5"` on the rail), and the scroll is teleported back to the
middle copy by **exactly one set width**. The jump cannot be seen: either side
of a seam is the same five records in the same order, so the pixels are
identical and the disc under your thumb does not move.

- ⚠️⚠️ **The wrap runs when the scroll SETTLES, not the moment you leave the
  middle copy.** Writing `scrollLeft` during a fling **cancels the momentum** in
  Chrome — wrapping eagerly would stop the rail dead in your hand every few
  discs. `profFavSettle` uses `scrollend` where it exists and a 180ms timer
  where it doesn't (the timer also covers a fling that decays without an event).
- ⚠️ **The emergency wrap in `profFavPaint` is a backstop, not the mechanism.**
  If the centred disc has reached the *outermost* copy it jumps immediately — a
  stalled fling beats running out of rail. With five copies it should never fire.
- ⚠️ **Five copies, and the number is set by fling distance.** From the middle
  copy that is ten discs of runway each way, ~2500px. Three copies leaves five,
  and a hard flick would hit the emergency wrap and stop dead. Verified by
  walking 14 discs in each direction: never ran out, wrapped three times going
  forward.
- ⚠️ **`scroll-snap-type` does not fight it** — the jump is a whole number of
  disc pitches, so it lands on an equivalent snap position with nothing to
  correct.
- ⚠️ **`data-i` is the real slot** and repeats across copies (`0123401234…`), so
  `profFavTap` and the edit-mode picker address the right one of five whichever
  copy you tapped.
- ⚠️ **`profFavBoot` retries instead of assuming one frame is enough.** Both
  steps need a laid-out rail, and `profFavStart` sets its once-only flag when it
  runs — so an attempt against a zero-width rail must NOT count as having run,
  or the next paint (triggered by the user's own scroll) yanks the rail back to
  disc 2 under their finger.
- The info panel carries **album + year on one line**, then artist, then stars
  and the review count, then **what they wrote about it**. ⚠️ Genre was dropped:
  it said little at this size, and the archive's genre strings are inconsistent
  enough ("Hip-hop" / "Experimental hip-hop" / "Korean hip-hop") that it read as
  noise.

##### The discs sit on a WHEEL, not a line (`profFavArc`)

The hub is a long way **below** the screen, so a disc leaving the centre swings
**down and away** instead of sliding flat — the side discs end up lower than the
middle one and tilted by however far round they have gone.

- **The radius is derived, not chosen.** `PROF_ARC_DEG` (**24°**) says how far
  a disc has turned by the time it reaches its *neighbour's* slot; `R = spacing
  / θ` falls out of that, re-measured every paint. There is no magic px to go
  stale when the frame width changes.
- ⚠️ **It was 12° and that was too polite** — arithmetically real, visually
  deniable. Halving the radius doubles the tilt but **near-quadruples the drop**
  (26px → 52px), because the fall goes with `1−cos θ`, not with `θ`. That second
  number is the one with a cost, and it is why the padding below moved with it.
- ⚠️ **X is left alone.** A true wheel would also pull the discs horizontally
  in (`x = R·sinθ`, not `R·θ`), but x belongs to scroll-snap, and fighting the
  scroller for it is how a carousel starts feeling slippery under a thumb. At
  12° the two differ by well under a pixel.
- ⚠️ **`u` is clamped to one neighbour.** Past that the drop grows fast and it
  buys nothing: a disc two slots out is entirely outside the rail (near edge at
  383px in a 192px half-width). The clamp is also what bounds the rail's bottom
  padding.
- ⚠️⚠️ **`.prof-fav-rail`'s `padding-bottom: 16%` is the room the arc falls
  into, not spacing.** The rail is `overflow-y: hidden` — it has to be, because
  `overflow-x: auto` forces the other axis to clip — so a dropped disc is cut
  off at the padding edge. It is a **percentage of width** because the drop is:
  `R(1−cos θ)` as a share of the disc spacing, and the spacing is 65% of the
  rail, so the two scale together. **It is PAIRED with `PROF_ARC_DEG` — move
  one, measure, move the other.** Going 12°→24° at the old 8% clipped the bottom
  off both side discs. Measured clearance at 24°/16%: 5.3px.
- ⚠️ **`.prof-fav-info` carries a `-30px` margin, and the arc is why.** That
  ~58px of rail padding is only *used* at the two edges where the side discs
  fall into it; under the middle it is a hole, and it left the album title
  floating a long way from the record it names. The text is centred and the side
  discs are slivers at the extreme left and right, so the two share the band
  without meeting — and the panel is after the rail in the DOM, so it wins the
  overlap on a very long title anyway.
- ⚠️ **`.prof-fav-rail.is-arc .prof-fav { transition: none }`.** The transform
  is written inline every scroll frame; .28s of easing on a value recomputed
  from `scrollLeft` 60×/sec is just smear. The discrete `.prof-fav` /
  `.is-mid` pair stays as the no-JS base, which is why this is a class the arc
  *adds* rather than a blanket `transition: none`.

##### Their own review, under the album (`.prof-fav-rv` · `profFavReview`)

If they wrote something about the centred record, it sits under the stars in the
app's **review voice** — Crimson Text italic, the same face as the composer and
`.ntf-quote` — so a line of someone's writing looks like writing rather than
like one more field of the record's metadata. It is the only thing in that panel
that is theirs and not the album's.

- ⚠️ **Read from `profReviewLog(P)`, the same log the review history below is
  built from.** One source of truth, so the line under the disc and the row
  further down the page can never quote the same person differently.
- ⚠️ **Cached per handle on the section** (`sec._rvKey` / `_rvMap`) — the log
  walks the archive to build itself and this runs on every scroll frame.
- ⚠️ **The line `hidden`s, it does not empty.** An empty box still holds its
  line-height. Paired with `.prof-fav-info`'s `min-height: 96px` (a panel *with*
  a two-line review in it), the block does not grow and shrink as you scroll
  between a record they wrote about and one they didn't. Verified: 84px across
  all five discs.
- **Two lines then ellipsis.** The full text is in the review history; under a
  disc this is a taste, and an unclamped paragraph would shove the rail and the
  next section around as you scroll.
- ⚠️ **`.prof-fav-hole` is 13%, where the small wells were 21%.** A spindle hole
  is a fixed size on a real record — it does not grow with the disc — so a
  percentage that read correctly at 60px is a doughnut at 200px.
- `profFavSync` is **rAF-throttled**: `scroll` fires faster than paint and the
  paint measures every item. The first paint is deferred a frame from
  `applyProfColors`, because a fresh render has no `clientWidth` yet.
- The panel's markup carries **no album**, so it cannot go stale against the
  rail's scroll position — `profFavPaint` is the only writer.
- ⚠️ **The edit screen renders the rail too.** The favourites left the card, so
  without it there is no way to change them any more.

### Review history — the last section (`profReviewLog` in `screens.js`)

Replaces the old **"Recently rated"** strip, which was four covers with four
hardcoded star values and four hardcoded ages. A history has to carry what the
person actually **said** — that is the difference between a list of albums they
touched and a record of their taste, which is what a profile is for.

⚠️ **The rows ARE the home feed's `.ntf-row`, and there is no `.prof-rv-*`
component any more.** Same anatomy (avatar + badge · sentence · quote ·
engagement · trailing thumb), same SUBJECT · VERB · OBJECT order, the same
`upvoteHtml` pill and comment button — because a review is a review, and a
profile that renders one its own way is a second component that will drift from
the first. The only thing that changes is the subject: every row here has the
same author, so the avatar is theirs and the name is the profile's.

- ⚠️ **The pool is `recent` → `favs` (seeded coin flip) → topped up from the
  archive.** The favourites were added because you are far more likely to have
  written about the five records you pinned to your own profile than a random
  one off the shelf — and because the favourites rail reads this same log for
  the line under each disc. Without them the panel had almost nothing to show:
  measured across the five personas it was **1, 2, 0, 1, 1** of five, so one
  persona could never demonstrate the feature at all. It is now 4, 2, 3, 2, 4.
  ⚠️ **A coin flip, not all five** — "no review yet" has to stay a state you
  actually meet while scrolling, or the conditional under the disc is a branch
  that never runs.
- `--sd-*` reaches these rows because the profile screen is itself an
  `.s-home-v3`, which is where those tokens are scoped.
- `upvoteHtml` (a window global) and `CMT_SVG` (a top-level `const`, so global
  *lexical* scope rather than a window property) both live in `app.js`, which
  loads after `screens.js` — fine, because this runs at render time.
- Each entry carries seeded `likes` (0–239) and `comments` (0–8). ⚠️ The floor
  is **0** and the curve is skewed low on purpose: a feed where every row has
  hundreds of likes reads as fake.
- The only thing the profile adds is a bigger tap target, `.v3-up--prof` —
  12.5px type and 17px glyphs against the feed's 11.5/14.5. On home these pills
  sit in a scrolling feed of many verbs; here they are the point of the page.

- ⚠️ **DERIVED, not stored on `PROFILE`.** That object is written from three
  places — the literal in `app.js`, `randomizeProfile` for a random or seeded
  visitor, and a persona — so a field added to one of them is missing from the
  other two. Seeded off the handle instead, which gives the same guarantee
  `randomizeProfile`'s seeded stream gives a friend's page: open a profile twice
  and it says the same things.
- `dzSeed` lives in `app.js`, which loads **after** `screens.js` — fine, because
  this runs at render time, not while the file parses.
- Their own `P.recent` picks come first, then the list tops up from the archive
  to nine, skipping duplicates. Ages are strictly increasing, so it reads
  newest-first without needing real dates.

#### ⚠️ `dzSeed(...) % smallN` is BROKEN, and this is where it showed

`dzSeed` is a rolling hash, `h = h*131 + c`. **131² ≡ 1 (mod 20)** and ≡ 1
(mod 8), so `dzSeed(seed, 'x', i) % 20` collapses to `(C(seed) + i) % 20` —
**linear in the index**. Every profile drew the same review lines in the same
cyclic order, merely rotated by a per-name offset:

```
ericd          17 18 19 0 1 2
moonlit_echo   18 19  0 1 2 3
```

`profMix()` is an avalanche step applied **before** the remainder, and it fixes
it (verified: one profile's sequence is no longer any rotation of another's).
⚠️ **Anywhere else that wants `dzSeed(...) % smallN` needs the same treatment** —
the hash is fine for large moduli and for equality, not for a short pool.

### The name banner grows with the username (`sizeProfName` · `profNameTabPath`)

The banner is a **parametric path**: `profNameTabPath(dx)` slides every point on
its right half out by `dx`, leaving the left edge, the corner radius and the
slant's shape alone, so the tab stretches without deforming. `sizeProfName`
measures the rendered label, converts px → SVG units, and moves the tab path and
the white pill's width by the **same** `dx` so they grow as one shape.

- ⚠️ **Four numbers move together on a retrace** and all four came out of the
  new file: the banner's slant anchor (295.443 → **339.995**), the pill's left
  edge (16.04 → **16**) and its right cap (314.351 → **360**), plus the clamp.
  The pill sits 20 units inside the anchor here exactly as it sat 18.9 inside the
  old one — if that relationship breaks, the pill and the banner drift apart as
  the name gets longer.
- The clamp is **200**: the banner's right edge is 467.5 and `467.5 + 200` is
  still inside the 690 box.

---

## Edit Profile (`profileEditHtml` + `PFEDIT` in `app.js`)

The customising page behind the profile card's action button (`.prof-act`, previously a
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
`.prof-name-tab-lbl`, `.prof-fav`, `.prof-pl`, `.prof-song` each get their own
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
(`.prof-pic`, `.prof-info`, `.prof-meta`, `.prof-name-tab-lbl`) are
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
- **The home feed names the object in full — "*album* by **artist**"**
  (`rec(e)` in `renderFriendFeed`), album first and in the two weights
  `.ntf-text i` / `.ntf-text b` already carry. ⚠️ Guarded twice: a row can
  arrive with no artist ("by undefined"), and a self-titled record would
  otherwise read "Weezer by Weezer" — which nobody says out loud either.
  ⚠️ **Playlist rows are exempt**: they already name two things (the record and
  the playlist) and a third proper noun makes the line unreadable.
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
`obActiveSteps()` drops it otherwise) · `3` genres (plain chips, from
`SD_GENRES`) · `4` artists · `5` albums · `6` people you may know · `7` minimal
profile (the payoff → `Start exploring` → `navigate('home')`).

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
*"View n more comments"*.

⚠️ **Two gestures, two verbs.** Tapping the **card** (`cmtCardTap`) opens the
comments to READ them — reading shouldn't cost a trip to a button — and taps
again to put them away. Tapping the **pill** (`cmtCompose`) starts WRITING one:
it opens the thread if shut and focuses the composer, and it deliberately does
**not** toggle, because "comment" is the wrong label for a button that hides the
comments and toggling it shut mid-sentence threw away what you'd typed.
⚠️ Everything clickable inside the card must `stopPropagation` or it collapses
the thread on its way up: the upvote pill, the comment pill, the share button,
and **`.v3-cmt-wrap` itself** — without that last one, clicking a comment (or
the space beside one) closes the thread you're reading. All four builders wire
`data-k` + `onclick` on the card; the inline-composer one does it in JS. There's a like on every comment and one composer per
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
That middle layer is gone: the review state was an extra level of navigation
showing nearly the same thing — the one visible difference being that the review
state still had the **For You box** (`.v3-for-single`, which `--album` hides).

### No gestures on the cover here (`bentoGesturesOn`, `app.js`)

**The album page's cover is a header, not a deck.** Swipe-for-next-album and
hold-for-the-shelf-wheel are **bento** gestures and stay there — the bento is
the thing we want people handling, and on this page there is exactly one album,
it is the one you just chose, and swiping it away undoes the tap that got you
here.

- ⚠️ **The test is at gesture START, not at wire time.** Both gestures are wired
  **once per element** (`album._swipeInit` in `setupAlbumSwipe`, `box._wired` in
  `proWheelInit`) and the album page is *the same `.v3-album`* in a different
  state — so there is no wiring moment at which the answer is known. `onDown`
  and the wheel's `pointerdown` each ask `bentoGesturesOn(screenEl)` and bail.
- ⚠️ It tests **`s-home-v3--review`**, which is never set without `--album` and
  which `--artist` layers on top of — so one class covers the album page and the
  artist page both. The artist banner is not a deck either.
- **The drag goes back to the page.** `.s-home-v3--review .v3-album` re-declares
  `touch-action: pan-y` (out-specifying `.v3-album--wheel`, which Pro adds for
  the wheel) so a scroll started on the cover scrolls the review panel — the
  cover is the biggest target on the page to start one on. `cursor` drops to
  `default` with it: `enterAlbumPage` early-returns when the shell is already
  fullscreen, so the tap does nothing and shouldn't advertise otherwise.
- The **bento is untouched** — swipe and hold there work exactly as before.

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
- **Previews are OFF** — `PREVIEWS_ENABLED = false` in `app.js` no-ops `togglePreview`/`togglePreviewMode`/`loadPreview`/`playPreviewFor`. The one preview that still plays is the explicit **Listen to preview** row in a CD's menu (`playPreview`, which doesn't read the flag). Autoplay is deliberately gone — see the Music Preview System section.

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
> placeholders · profile theme 02 (angular) not started · ~38 inline `★` glyphs still bypass the vinyl `halfStars` treatment.
