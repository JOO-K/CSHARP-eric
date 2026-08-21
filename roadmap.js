/* ============================================================
   ROADMAP — Spindeck planning board (desktop viewer only)

   Behind the toolbar's "Roadmap" button. Top: a block calendar,
   Aug 2026 → Apr 2027, TWO months on screen at a time but stepping
   by one (August is a two-week stub, see RM_CAL_MONTHS/RM_CAL_SPAN).
   Left: the linear week-by-week timeline (Aug 21 2026 → May 6 2027,
   37 weeks). Right top: short / medium / long term goals.
   Right bottom: meeting notes, one tab per session.

   The RANGE is two constants — RM_START and RM_WEEK_COUNT. The month
   blocks, the year labels and the header line all derive from them,
   so extending the board is one number. See the warning on RM_START
   for the one direction that is NOT safe to change.

   Three levels, deliberately: a WEEK is the workstream ("Design
   pass"), a DAY EVENT is a fixed point inside it ("hand-in, 4pm"),
   a SESSION is the record of one meeting. Clicking a day edits its
   events; clicking a W-number jumps to the week.

   ── Why weeks run Friday → Thursday ──
   Week 1 starts Fri Aug 21. Keeping every week Fri→Thu means one
   calendar ROW is exactly one roadmap WEEK, so the block calendar
   and the linear list line up 1:1 and hovering either lights both.
   That is worth more than a conventional Monday-start grid — the
   day-of-week header reads F S S M T W T for the same reason.

   EVERYTHING IS EDITABLE and autosaves to localStorage under
   RM_KEY, so a reader can rewrite it live and it survives a reload.
   localStorage is per-browser, so notes taken on someone else's
   machine never come back on their own — that is what "Copy Markdown"
   and "Download .md" are for. Say so out loud in the meeting.

   ── Rendering discipline (same rule as PLNEW in app.js) ──
   Editable fields write to state on `input` and DO NOT re-render —
   a re-render mid-keystroke destroys the caret. Only STRUCTURAL
   changes (add/delete a goal, cycle a chip) call rmRender(), and
   those preserve scroll position. Don't add a render call to an
   input handler; typing in a week instead calls rmCalMark(), which
   repaints that week's calendar cells without touching the caret.
   ============================================================ */

/* Bumped to v2 when the board moved to an Aug 21 start: the v1 week
   list had different dates, so reusing the key would have pinned old
   notes to the wrong weeks. */
const RM_KEY = 'spindeck-roadmap-v2';

/* ⚠️ RM_START IS FROZEN. Extending the board forward — raising RM_WEEK_COUNT —
   is SAFE: every existing index keeps the date it already had, rmLoad pads the
   new weeks with blanks, and nobody's notes move. Changing RM_START (or
   SHORTENING the count past filled weeks) is NOT safe: stored state is keyed by
   index, so week 5's notes would silently re-date, and readers keep their board
   in their own browser where we cannot fix it afterwards. Add weeks to the end;
   don't move the start. */
const RM_START = '2026-08-21';   // Friday
const RM_WEEK_COUNT = 37;        // through the week of Apr 30 → May 6 2027

const RM_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const RM_DOW = ['F', 'S', 'S', 'M', 'T', 'W', 'T'];   // Friday-start, see header comment

/* How many month blocks are on screen at once. The strip still STEPS by one
   month, so consecutive pages overlap by SPAN-1 and you can follow a thread
   across a month boundary instead of losing it to a page turn. Everything
   else derives from this: slide width is 100/SPAN %, the last valid index is
   RM_CAL_MAX(), and there is one pip per page rather than per month. */
const RM_CAL_SPAN = 2;
function rmCalMax() { return Math.max(0, RM_CAL_MONTHS.length - RM_CAL_SPAN); }

/* All date maths in UTC — the board is a fixed calendar, not a clock, and
   local-midnight Dates would drift a day either side of the date line. */
function rmDayMs(iso) { const p = iso.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
function rmAddDays(ms, n) { return ms + n * 86400000; }
function rmFmt(ms) { const d = new Date(ms); return RM_MON[d.getUTCMonth()] + ' ' + d.getUTCDate(); }
function rmTodayMs() { const n = new Date(); return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()); }

/* Week starts, derived rather than hand-listed so the dates can't fall out of
   sync with each other. Stored state holds only text/track/status per index,
   so changing RM_START or RM_WEEK_COUNT re-labels the board without orphaning
   anyone's notes (rmLoad pads / truncates to match). */
const RM_WEEKS = (function () {
  const out = [];
  for (let i = 0; i < RM_WEEK_COUNT; i++) {
    const ms = rmAddDays(rmDayMs(RM_START), i * 7);
    const d = new Date(ms);
    // `y` matters now that the board crosses a new year: the timeline's month
    // rules are grouped on year+month, or Aug 2026 and a future Aug would
    // collapse into one heading.
    out.push({ ms: ms, label: rmFmt(ms), month: d.getUTCMonth(), y: d.getUTCFullYear() });
  }
  return out;
})();

/* Months drawn in the block calendar, DERIVED from the week list rather than
   hand-listed — the two used to be separate constants and drifted, which is why
   W1 spent a while with no calendar cell at all. Runs from the month of the
   first week's START to the month of the last week's START, so:
     · August is a short leading block (W1 Aug 21 is the first start, and
       nothing before the 21st is drawn — the timeline doesn't begin until then)
     · the final week, which starts Apr 30 and runs into May, shows in the APRIL
       block with its May days dimmed, and May gets no block of its own.
   Extending RM_WEEK_COUNT now extends the calendar too, with nothing to keep
   in sync by hand. */
const RM_CAL_MONTHS = (function () {
  const first = RM_WEEKS[0], last = RM_WEEKS[RM_WEEKS.length - 1];
  const out = [];
  let y = first.y, m = first.month;
  while (y < last.y || (y === last.y && m <= last.month)) {
    out.push([y, m]);
    if (++m > 11) { m = 0; y++; }
  }
  return out;
})();

/* Tracks are WORKSTREAMS, not the two Spindeck projects — the board plans one
   effort and the old mockup/web/both split forced a choice that was almost
   always "both". ⚠️ Renaming a track ORPHANS every board already saved under
   the old value, so RM_TRACK_OLD maps the retired names forward; rmNormalize
   runs it before the fallback that would otherwise reset them all to dev. */
const RM_TRACKS = ['dev', 'design', 'admin', 'research'];
const RM_TRACK_LBL = { dev: 'Development', design: 'Design', admin: 'Admin', research: 'Research' };
const RM_TRACK_OLD = { mockup: 'design', web: 'dev', both: 'dev' };

const RM_STATUS = ['planned', 'doing', 'done', 'risk'];
const RM_STATUS_GLYPH = { planned: '–', doing: '▸', done: '✓', risk: '!' };
const RM_STATUS_LBL = { planned: 'Planned', doing: 'In progress', done: 'Done', risk: 'At risk' };

const RM_TERMS = [
  { id: 'short',  name: 'Short term',  when: 'now → 4 weeks' },
  { id: 'medium', name: 'Medium term', when: '1 → 3 months' },
  { id: 'long',   name: 'Long term',   when: '3 months +' },
];

/* Deliberately near-empty: the board is filled in live during the meeting.
   W1 carries the how-to instead of a task so the instructions are the first
   thing on screen and can simply be typed over once the plan starts landing. */
const RM_HOWTO =
  'Type a short SUBJECT on the line above — that is what shows on the calendar, ' +
  'so keep it to a couple of words — then the full detail here. ' +
  'The left chip cycles status (planned / doing / done / at risk), the right ' +
  'chip cycles track (Development / Design / Admin / Research). Hover a day to ' +
  'light up its week down here; CLICK a day to put an event on it, or click the ' +
  'W-number to jump. Notes are tabbed — one tab per meeting, + for a new one. ' +
  'Start a subject with MILESTONE to flag it. Everything saves in THIS browser ' +
  'only — hit Copy link or Copy Markdown before you close the tab.';

function rmSeed() {
  const weeks = RM_WEEKS.map(function () {
    return { tag: '', t: '', track: 'dev', st: 'planned' };
  });
  weeks[0] = { tag: 'HOW TO USE', t: RM_HOWTO, track: 'dev', st: 'doing' };
  return {
    v: RM_SHAPE_V,
    weeks: weeks,
    goals: { short: [], medium: [], long: [] },
    // Day events, keyed by ISO date — see the rmEv* block. An object rather
    // than a per-week array so a day keeps its events if the week list moves.
    events: {},
    // Meeting notes are per SESSION: one tab per meeting, so last week's
    // decisions stay readable while this week's are being typed.
    sessions: [rmNewSession(rmTodayMs())],
    si: 0,
  };
}

let RM = null;
let RM_BUILT = false;

/* ── State ──────────────────────────────────────────────── */
/* Reconcile any board — from storage or from a share link — against the
   current RM_WEEKS, so editing the week list can't orphan state and a link
   from an older build can't arrive half-shaped. */
function rmNormalize(s) {
  const seed = rmSeed();
  s.weeks = RM_WEEKS.map(function (_, i) {
    const w = s.weeks[i] || { tag: '', t: '', track: 'dev', st: 'planned' };
    // Retired track names map forward FIRST — the reset below is the last
    // resort for a genuinely unknown value, not the migration path.
    if (RM_TRACK_OLD[w.track]) w.track = RM_TRACK_OLD[w.track];
    // A value dropped from the lists would break the chip's cycle index.
    if (RM_TRACKS.indexOf(w.track) < 0) w.track = 'dev';
    if (RM_STATUS.indexOf(w.st) < 0) w.st = 'planned';
    if (typeof w.t !== 'string') w.t = '';
    // `tag` arrived after the first boards were saved, so it has to be filled
    // in rather than assumed — a board from before it existed has no key.
    if (typeof w.tag !== 'string') w.tag = '';
    return w;
  });
  s.goals = s.goals || seed.goals;
  RM_TERMS.forEach(function (t) {
    if (!Array.isArray(s.goals[t.id])) s.goals[t.id] = [];
    s.goals[t.id] = s.goals[t.id].map(function (x) { return String(x == null ? '' : x); });
  });

  // Events: {ISO: [text, …]}. Drop empty days so the share link doesn't carry
  // a key for every day someone opened and closed without typing.
  const ev = {};
  if (s.events && typeof s.events === 'object') {
    Object.keys(s.events).forEach(function (k) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !Array.isArray(s.events[k])) return;
      const list = s.events[k]
        .map(function (x) { return String(x == null ? '' : x); })
        .filter(function (x) { return x.trim(); });
      if (list.length) ev[k] = list;
    });
  }
  s.events = ev;

  // Sessions replaced the single `notes` string in v3. A v2 board carries its
  // notes forward as the first session rather than losing them.
  if (!Array.isArray(s.sessions) || !s.sessions.length) {
    s.sessions = [rmNewSession(rmTodayMs())];
    if (typeof s.notes === 'string' && s.notes.trim()) s.sessions[0].body = s.notes;
  }
  s.sessions = s.sessions.map(function (x, i) {
    const o = (x && typeof x === 'object') ? x : {};
    return {
      id: typeof o.id === 'string' && o.id ? o.id : 's' + i + '-' + (o.name || ''),
      name: typeof o.name === 'string' && o.name.trim() ? o.name : 'Session ' + (i + 1),
      body: typeof o.body === 'string' ? o.body : '',
    };
  });
  // An out-of-range index would render a tab strip with nothing selected and
  // bind the textarea to undefined.
  s.si = (typeof s.si === 'number' && s.si >= 0 && s.si < s.sessions.length) ? s.si : 0;
  delete s.notes;

  s.v = RM_SHAPE_V;
  return s;
}

/* ── Never lose a reader's board ────────────────────────
   Every visitor's notes live only in THEIR browser: we cannot see them, cannot
   restore them, and they are overwritten the first time a new build saves. So
   before anything reshapes a stored board, keep the raw string exactly as it
   was under a second key. It costs one write on the one load after a deploy
   that changes the shape, and it is the difference between "recoverable from
   the console" and "gone".
   Recover with:  JSON.parse(localStorage['spindeck-roadmap-prev'])
   ────────────────────────────────────────────────────── */
const RM_PREV_KEY = 'spindeck-roadmap-prev';

/* The SHAPE version, separate from RM_KEY. RM_KEY is bumped only when the week
   DATES move (which orphans notes by index); the shape version tracks added
   fields, which rmNormalize migrates in place instead of discarding. */
const RM_SHAPE_V = 3;

function rmBackup(raw, stored) {
  // Only when the shape is actually about to change — otherwise every ordinary
  // load would churn the backup and overwrite the copy worth keeping.
  if (stored && stored.v === RM_SHAPE_V) return;
  try { localStorage.setItem(RM_PREV_KEY, raw); } catch (e) { /* quota / private mode */ }
}

function rmLoad() {
  let raw = null, s = null;
  try { raw = localStorage.getItem(RM_KEY); s = JSON.parse(raw || 'null'); } catch (e) { s = null; }
  if (!s || !Array.isArray(s.weeks)) return rmSeed();
  rmBackup(raw, s);
  return rmNormalize(s);
}

let rmSaveTimer = null;
function rmSave() {
  clearTimeout(rmSaveTimer);
  rmSaveTimer = setTimeout(function () {
    try { localStorage.setItem(RM_KEY, JSON.stringify(RM)); } catch (e) { /* quota / private mode */ }
  }, 250);
}

/* ── Helpers ────────────────────────────────────────────── */
function rmEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* rmEsc is for TEXT between tags; it leaves quotes alone, which is fine there
   and fatal inside an attribute. Anything user-typed going into title="…"
   goes through this instead. */
function rmAttr(s) { return rmEsc(s).replace(/"/g, '&quot;'); }

/* A week counts as "has something" if EITHER field is filled — the subject
   alone is a legitimate entry, and it's the one the calendar can show. */
function rmHasItem(d) { return !!((d.tag || '') + (d.t || '')).trim(); }

/* MILESTONE is flagged off the subject first, since that's the field the
   calendar prints; the text is still checked so an older board keeps its flags. */
function rmIsMilestone(d) {
  return /^\s*milestone/i.test(d.tag || '') || /^\s*milestone/i.test(d.t || '');
}

function rmMarkOf(d) { return rmHasItem(d) ? (rmIsMilestone(d) ? 'ms' : 'item') : ''; }

/* Which week contains a given day, or -1 outside the board. */
function rmWeekOf(ms) {
  const i = Math.floor((ms - RM_WEEKS[0].ms) / 604800000);
  return (i >= 0 && i < RM_WEEKS.length) ? i : -1;
}

/* ── Day events ─────────────────────────────────────────
   A week says what the WORK is; an event says what happens on one DAY —
   a call, a deadline, a hand-in. Keyed by ISO date rather than by week
   index so moving RM_START re-labels the weeks without dragging every
   event to a different date with them.
   ────────────────────────────────────────────────────── */
function rmIso(ms) {
  const d = new Date(ms);
  const p = function (n) { return (n < 10 ? '0' : '') + n; };
  return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate());
}

/* Always an array, never undefined — every caller iterates it. */
function rmEvOn(iso) {
  const list = RM.events[iso];
  return Array.isArray(list) ? list : [];
}

/* The board crosses into 2027, so a bare "APR" on a calendar block is ambiguous
   in a way "APR '27" is not. Only stamped when the range actually spans more
   than one year — on a single-year board the suffix is noise on every block. */
const RM_SPANS_YEARS = RM_WEEKS[0].y !== RM_WEEKS[RM_WEEKS.length - 1].y;
function RM_YR_SUFFIX(y) { return RM_SPANS_YEARS ? " '" + String(y).slice(2) : ''; }

/* Long-form day label for the popover header: "Mon Aug 24". */
const RM_DOW_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function rmDayLabel(ms) {
  return RM_DOW_FULL[new Date(ms).getUTCDay()] + ' ' + rmFmt(ms);
}

/* ── Note sessions ──────────────────────────────────────
   One tab per meeting. Named for the day it was opened, because that is how
   anyone looks a meeting back up; the name is editable for the ones that
   want a subject instead.
   ────────────────────────────────────────────────────── */
let RM_SID = 0;
function rmNewSession(ms) {
  RM_SID++;
  return { id: 's' + RM_SID + '-' + ms, name: rmFmt(ms), body: '' };
}

function rmSession() { return RM.sessions[RM.si] || RM.sessions[0]; }

/* ── Render: block calendar ─────────────────────────────
   ONE month on screen at a time, in a horizontal filmstrip. All four are
   rendered into .rm-cal-track and the track is translated — that is what
   makes the drag/swipe continuous rather than a cut between two renders.
   ────────────────────────────────────────────────────── */
let RM_CAL_I = 0;

function rmCalHTML() {
  const today = rmTodayMs();
  let h = '';

  RM_CAL_MONTHS.forEach(function (ym) {
    const y = ym[0], m = ym[1];
    const first = Date.UTC(y, m, 1);
    const last = Date.UTC(y, m + 1, 0);

    // ⚠️ The month name is back IN the slide. It used to live only in the card
    // header beside the arrows, which was right when one month was on screen —
    // with RM_CAL_SPAN of them visible, a single header label can't say which
    // block is which. The header now names the visible RANGE; this names the
    // block.
    h += '<div class="rm-cal-m">' +
           '<div class="rm-cal-mname">' + RM_MON[m] + RM_YR_SUFFIX(y) + '</div>' +
           '<div class="rm-cal-grid">' +
             '<span class="rm-cal-cnr"></span>' +
             RM_DOW.map(function (d) { return '<span class="rm-cal-dow">' + d + '</span>'; }).join('');

    RM_WEEKS.forEach(function (wk, i) {
      // Any week that touches this month gets a row, so a week straddling the
      // month boundary appears in both blocks with the outside days dimmed.
      if (rmAddDays(wk.ms, 6) < first || wk.ms > last) return;
      const d = RM.weeks[i];
      const mark = rmMarkOf(d);
      h += '<button class="rm-cal-wk" data-w="' + i + '" data-track="' + d.track + '" ' +
                   'data-mark="' + mark + '">W' + (i + 1) + '</button>';
      for (let k = 0; k < 7; k++) {
        const ms = rmAddDays(wk.ms, k);
        const iso = rmIso(ms);
        const evs = rmEvOn(iso);
        const cls = 'rm-cal-d' +
          ((ms < first || ms > last) ? ' is-out' : '') +
          ((ms === today) ? ' is-today' : '');
        // data-d carries the day's identity so the click handler doesn't have
        // to re-derive it from the week index and the column.
        h += '<button class="' + cls + '" data-w="' + i + '" data-d="' + iso + '" ' +
                     'data-st="' + d.st + '" data-mark="' + mark + '" ' +
                     'data-ev="' + (evs.length ? '1' : '') + '" ' +
                     'title="' + (evs.length ? rmAttr(evs.join(' · ')) : 'Click to add an event') + '">' +
               new Date(ms).getUTCDate() + '</button>';
      }
      // The subject bar, under the week's days and spanning them. ALWAYS
      // emitted, even empty: typing a subject must reveal it without a
      // re-render (the caret rule), and `.rm-cal-tag:empty { display: none }`
      // collapses it for free while rmCalTag() only sets textContent.
      h += '<span class="rm-cal-tag" data-w="' + i + '" data-track="' + d.track + '" ' +
                 'data-mark="' + mark + '">' + rmEsc(d.tag) + '</span>';
    });

    h += '</div></div>';
  });
  return h;
}

/* ── Calendar paging ────────────────────────────────────── */

/* Which page holds today, so the board opens on the right one. Clamped to
   rmCalMax() — the last page starts SPAN months from the end, so December
   can never be the leading block with blank space beside it.
   Outside the range we land on Sep, not on index 0 — August is a two-week
   stub and makes a poor leading block for anyone arriving off-season. */
function rmCalMonthOfToday() {
  const n = new Date();
  const i = RM_CAL_MONTHS.findIndex(function (ym) {
    return ym[0] === n.getFullYear() && ym[1] === n.getMonth();
  });
  return Math.min(i < 0 ? 1 : i, rmCalMax());
}

/* One page-step in pixels. The strip steps by ONE month while SPAN of them are
   on screen, so a step is a SLIDE's width, not the viewport's — that single
   distinction is what makes the pages overlap.
   MEASURED off a real slide rather than computed as clientWidth / SPAN, so the
   width lives in one place (the CSS) and a media query can change it without
   this silently sliding to the wrong offset. Falls back only before the first
   render, when there is no slide to measure. */
function rmCalStepPx(view) {
  const slide = view.querySelector('.rm-cal-m');
  return (slide && slide.offsetWidth) || view.clientWidth / RM_CAL_SPAN;
}

/* Position the filmstrip. `px` is a live drag offset; omit it to snap. */
function rmCalSlide(px, animate) {
  const view = document.getElementById('rm-cal');
  const track = document.getElementById('rm-cal-track');
  if (!view || !track) return;
  track.style.transition = animate ? '' : 'none';
  track.style.transform =
    'translateX(' + (-RM_CAL_I * rmCalStepPx(view) + (px || 0)) + 'px)';
}

/* The header names the visible RANGE ("Aug – Sep 2026"); each block carries its
   own month name in the slide, since one header label can't identify two. */
function rmCalLabel() {
  const a = RM_CAL_MONTHS[RM_CAL_I];
  const b = RM_CAL_MONTHS[Math.min(RM_CAL_I + RM_CAL_SPAN - 1, RM_CAL_MONTHS.length - 1)];
  const name = document.getElementById('rm-cal-name');
  if (name) {
    // "Aug – Sep 2026" inside a year, "Dec 2026 – Jan 2027" across one: sharing
    // the trailing year is only legible while both halves are in it.
    name.textContent =
      a === b ? RM_MON[a[1]] + ' ' + a[0]
      : a[0] === b[0] ? RM_MON[a[1]] + ' – ' + RM_MON[b[1]] + ' ' + b[0]
      : RM_MON[a[1]] + ' ' + a[0] + ' – ' + RM_MON[b[1]] + ' ' + b[0];
  }

  const prev = document.getElementById('rm-cal-prev');
  const next = document.getElementById('rm-cal-next');
  if (prev) prev.disabled = RM_CAL_I === 0;
  if (next) next.disabled = RM_CAL_I === rmCalMax();

  // One pip per PAGE, not per month — with SPAN months visible there are
  // fewer pages than months, and a pip per month would leave the trailing
  // ones permanently unreachable.
  const pips = document.getElementById('rm-cal-pips');
  if (pips) {
    let p = '';
    for (let i = 0; i <= rmCalMax(); i++) {
      p += '<button class="rm-pip' + (i === RM_CAL_I ? ' is-on' : '') + '" ' +
           'onclick="rmCalGo(' + i + ')" title="' + RM_MON[RM_CAL_MONTHS[i][1]] + '"></button>';
    }
    pips.innerHTML = p;
  }
}

window.rmCalGo = function (i, animate) {
  RM_CAL_I = Math.max(0, Math.min(rmCalMax(), i));
  rmCalLabel();
  rmCalSlide(0, animate !== false);
};

window.rmCalStep = function (d) { window.rmCalGo(RM_CAL_I + d); };

/* Pointer drag + trackpad swipe. The arrows are the obvious control; this is
   for people who reach for the gesture first. */
function rmCalSwipe() {
  const view = document.getElementById('rm-cal');
  if (!view) return;

  let x0 = 0, dx = 0, down = false;
  // Set on a real drag so the click handler below doesn't ALSO jump the
  // timeline to whatever day happened to be under the finger on release.
  view._rmDragged = false;

  view.addEventListener('pointerdown', function (e) {
    if (e.button != null && e.button !== 0) return;
    down = true; x0 = e.clientX; dx = 0;
    view._rmDragged = false;
    view.setPointerCapture(e.pointerId);
    view.classList.add('is-grabbing');
  });

  view.addEventListener('pointermove', function (e) {
    if (!down) return;
    dx = e.clientX - x0;
    if (Math.abs(dx) > 6) view._rmDragged = true;
    // Rubber-band at the two ends rather than sliding into blank space.
    const atEnd = (RM_CAL_I === 0 && dx > 0) ||
                  (RM_CAL_I === rmCalMax() && dx < 0);
    rmCalSlide(atEnd ? dx * 0.3 : dx, false);
  });

  const end = function () {
    if (!down) return;
    down = false;
    view.classList.remove('is-grabbing');
    // Measured against ONE STEP, not the viewport — a drag half a slide wide
    // is a full page now that a page is a slide.
    const w = rmCalStepPx(view);
    // A short flick counts as much as a long drag — 60px, or a fifth of the way.
    if (Math.abs(dx) > Math.min(60, w * 0.2)) window.rmCalStep(dx < 0 ? 1 : -1);
    else rmCalSlide(0, true);
  };
  view.addEventListener('pointerup', end);
  view.addEventListener('pointercancel', end);

  // Trackpad two-finger horizontal. Throttled, or one flick pages all four
  // months at once; preventDefault stops the browser taking it as Back.
  let wheelAt = 0;
  view.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
    e.preventDefault();
    const now = Date.now();
    if (now - wheelAt < 380) return;
    wheelAt = now;
    window.rmCalStep(e.deltaX > 0 ? 1 : -1);
  }, { passive: false });
}

/* Repaint just one week's calendar cells — the marker dot, and the subject
   bar's text. Called from the typing handler, which must never re-render
   (see the caret rule at the top of the file). */
function rmCalMark(i) {
  const d = RM.weeks[i];
  const mark = rmMarkOf(d);
  document.querySelectorAll('#rm-cal [data-w="' + i + '"]').forEach(function (el) {
    el.dataset.mark = mark;
    // textContent, not innerHTML — this is raw user input going straight
    // into the DOM on every keystroke.
    if (el.classList.contains('rm-cal-tag')) el.textContent = d.tag;
  });
}

/* Repaint one DAY's cells — the event indicator and its hover title. Same
   rule as rmCalMark: called from the typing handler, so it must not render.
   A day can appear in two blocks at once (a week straddling a month boundary
   is drawn in both), hence querySelectorAll rather than querySelector. */
function rmEvMark(iso) {
  const evs = rmEvOn(iso);
  document.querySelectorAll('#rm-cal [data-d="' + iso + '"]').forEach(function (el) {
    el.dataset.ev = evs.length ? '1' : '';
    el.title = evs.length ? evs.join(' · ') : 'Click to add an event';
  });
}

/* ── The day popover ────────────────────────────────────
   Clicking a day opens a small editor for THAT day's events. It is appended to
   #roadmap and positioned absolutely against it — not into .rm-cal-body, whose
   `overflow: hidden` (the filmstrip's clip) would cut it in half. #roadmap is
   `position: absolute; inset: 0` and carries no transform, so it is a reliable
   containing block; `position: fixed` would not be, since any transformed
   ancestor the viewer grows later would silently re-parent it.
   ────────────────────────────────────────────────────── */
let RM_DAY = null;      // ISO of the day whose popover is open, or null

function rmDayEl() {
  let el = document.getElementById('rm-day');
  if (!el) {
    el = document.createElement('div');
    el.id = 'rm-day';
    el.className = 'rm-day';
    el.hidden = true;
    document.getElementById('roadmap').appendChild(el);
  }
  return el;
}

function rmDayHTML(iso) {
  const evs = rmEvOn(iso);
  const wi = rmWeekOf(rmDayMs(iso));
  let h = '<div class="rm-day-hd">' +
            '<span class="rm-day-date">' + rmDayLabel(rmDayMs(iso)) + '</span>' +
            (wi >= 0 ? '<button class="rm-day-w" onclick="rmDayToWeek(' + wi + ')" ' +
                       'title="Jump to this week in the timeline">W' + (wi + 1) + '</button>' : '') +
            '<span class="rm-day-sp"></span>' +
            '<button class="rm-day-x" onclick="rmDayClose()" title="Close (Esc)">×</button>' +
          '</div><div class="rm-day-list">';

  evs.forEach(function (txt, i) {
    h += '<div class="rm-ev">' +
           '<span class="rm-ev-dot">•</span>' +
           '<div class="rm-ev-text" contenteditable="plaintext-only" spellcheck="false" ' +
                'data-ph="Event…" data-rm-ev="' + i + '">' + rmEsc(txt) + '</div>' +
           '<button class="rm-del" title="Delete" onclick="rmEvDel(' + i + ')">×</button>' +
         '</div>';
  });

  h += '</div><button class="rm-add rm-day-add" onclick="rmEvAdd()">+ add event</button>';
  return h;
}

/* Re-render the popover body in place. Structural only (add / delete) — typing
   goes through the delegated input handler and must never land here. */
function rmDayPaint() {
  if (RM_DAY == null) return;
  rmDayEl().innerHTML = rmDayHTML(RM_DAY);
}

window.rmDayOpen = function (iso, anchor) {
  RM_DAY = iso;
  const el = rmDayEl();
  el.innerHTML = rmDayHTML(iso);
  el.hidden = false;

  // Position under the day, then pull back inside the overlay. Measured after
  // the content is in and `hidden` is off, or offsetWidth/Height read zero.
  const root = document.getElementById('roadmap').getBoundingClientRect();
  const a = anchor.getBoundingClientRect();
  const w = el.offsetWidth, h = el.offsetHeight;
  let left = a.left - root.left + a.width / 2 - w / 2;
  let top = a.bottom - root.top + 6;
  // Flip above the day when there isn't room below, so a popover opened on the
  // last row isn't pinned half off the bottom of the overlay.
  if (top + h > root.height - 8) top = a.top - root.top - h - 6;
  el.style.left = Math.max(8, Math.min(left, root.width - w - 8)) + 'px';
  el.style.top = Math.max(8, top) + 'px';

  // Straight into the first empty row so a day with nothing on it is one
  // click from typing; otherwise leave the caret out of existing text.
  const rows = el.querySelectorAll('[data-rm-ev]');
  if (!rows.length) window.rmEvAdd();
};

window.rmDayClose = function () {
  // A blank row is created eagerly on open (and by "+ add"), so closing has to
  // sweep the ones nobody typed into — otherwise an opened-and-closed day keeps
  // an empty event forever and rides along in every share link.
  if (RM_DAY != null && RM.events[RM_DAY]) {
    const kept = RM.events[RM_DAY].filter(function (x) { return x.trim(); });
    if (kept.length) RM.events[RM_DAY] = kept; else delete RM.events[RM_DAY];
    rmSave();
    rmEvMark(RM_DAY);
  }
  RM_DAY = null;
  const el = document.getElementById('rm-day');
  if (el) { el.hidden = true; el.innerHTML = ''; }
};

window.rmDayToWeek = function (i) {
  window.rmDayClose();
  const row = document.querySelector('.rm-week[data-w="' + i + '"]');
  if (!row) return;
  row.scrollIntoView({ block: 'center', behavior: 'smooth' });
  const tag = row.querySelector('.rm-week-tag');
  const cell = (tag && !tag.textContent.trim()) ? tag : row.querySelector('.rm-week-text');
  if (cell) cell.focus();
};

window.rmEvAdd = function () {
  if (RM_DAY == null) return;
  if (!Array.isArray(RM.events[RM_DAY])) RM.events[RM_DAY] = [];
  RM.events[RM_DAY].push('');
  rmDayPaint();
  const rows = document.querySelectorAll('#rm-day [data-rm-ev]');
  const last = rows[rows.length - 1];
  if (last) last.focus();
};

window.rmEvDel = function (i) {
  if (RM_DAY == null) return;
  const list = RM.events[RM_DAY];
  if (!list) return;
  list.splice(i, 1);
  // Drop the key outright when the last one goes, so an emptied day doesn't
  // keep its marker dot or ride along in every share link from here on.
  if (!list.length) delete RM.events[RM_DAY];
  rmSave();
  rmEvMark(RM_DAY);
  rmDayPaint();
};

/* The readout beside the Calendar title — the "what's due here" line that
   answers a hover without making anyone read the timeline below. */
function rmReadout(i) {
  const el = document.getElementById('rm-cal-read');
  if (!el) return;
  if (i == null || i < 0) {
    const now = rmWeekOf(rmTodayMs());
    el.innerHTML = now < 0
      ? '<em>hover a day for its week</em>'
      : '<span class="rm-read-w">now · W' + (now + 1) + '</span> ' + RM_WEEKS[now].label;
    return;
  }
  const wk = RM_WEEKS[i], d = RM.weeks[i];
  el.innerHTML =
    '<span class="rm-read-w">W' + (i + 1) + '</span> ' +
    wk.label + ' – ' + rmFmt(rmAddDays(wk.ms, 6)) +
    ' <span class="rm-read-sep">·</span> ' + RM_TRACK_LBL[d.track] +
    ' <span class="rm-read-sep">·</span> ' + RM_STATUS_LBL[d.st] +
    // The subject leads the detail here too, so the readout reads the same
    // way the timeline row does.
    (d.tag.trim() ? ' <span class="rm-read-sep">—</span> <b>' + rmEsc(d.tag) + '</b>' : '') +
    (d.t.trim() ? ' <span class="rm-read-sep">' + (d.tag.trim() ? '·' : '—') + '</span> ' + rmEsc(d.t)
                : (d.tag.trim() ? '' : ' <em>— nothing set</em>'));
}

/* Light the hovered week in BOTH views at once. */
function rmHi(i) {
  // Scoped to #roadmap: `data-w` and `.is-hi` are ours today, but this overlay
  // lives inside the app's own DOM and a document-wide sweep is one collision
  // away from stripping a class off something else.
  const root = document.getElementById('roadmap');
  if (!root) return;
  root.querySelectorAll('.is-hi').forEach(function (el) { el.classList.remove('is-hi'); });
  if (i != null && i >= 0) {
    root.querySelectorAll('[data-w="' + i + '"]')
      .forEach(function (el) { el.classList.add('is-hi'); });
  }
  rmReadout(i);
}

/* ── Render ─────────────────────────────────────────────── */
function rmRender() {
  const track = document.getElementById('rm-cal-track');
  const tl = document.getElementById('rm-timeline');
  const gl = document.getElementById('rm-goals');
  if (!tl || !gl) return;

  // Close the popover FIRST — it is anchored to a cell this render is about to
  // throw away, and closing it prunes the blank row it opens with, so the grid
  // below is built from already-clean state.
  if (RM_DAY != null) window.rmDayClose();

  // Structural re-renders must not throw the reader back to the top.
  const tlTop = tl.scrollTop, glTop = gl.scrollTop;

  if (track) {
    track.innerHTML = rmCalHTML();
    rmCalLabel();
    rmCalSlide(0, false);   // rebuilt slides start unpositioned — re-snap
  }

  const today = rmTodayMs();
  // ⚠️ Grouped on year+month, not month alone. The board runs into 2027, and a
  // bare month index would fold two different Augusts under one rule.
  let h = '', lastKey = '';
  RM_WEEKS.forEach(function (wk, i) {
    const d = RM.weeks[i];
    const key = wk.y + '-' + wk.month;
    if (key !== lastKey) {
      h += '<div class="rm-month">' + RM_MON[wk.month] + ' ' + wk.y + '</div>';
      lastKey = key;
    }
    const now = (today >= wk.ms && today <= rmAddDays(wk.ms, 6)) ? ' is-now' : '';
    h +=
      '<div class="rm-week' + now + '" data-w="' + i + '" data-st="' + d.st + '">' +
        '<div class="rm-week-lbl"><span class="rm-week-no">W' + (i + 1) + '</span><br>' + wk.label + '</div>' +
        // Subject above the detail: it's the short label the calendar prints,
        // so it reads as the heading for the line rather than a second field.
        '<div class="rm-week-main">' +
          '<div class="rm-week-tag" contenteditable="plaintext-only" spellcheck="false" ' +
               'data-ph="+ subject" data-track="' + d.track + '" ' +
               'data-rm-tag="' + i + '">' + rmEsc(d.tag) + '</div>' +
          '<div class="rm-week-text" contenteditable="plaintext-only" spellcheck="false" ' +
               'data-ph="—" data-rm-week="' + i + '">' + rmEsc(d.t) + '</div>' +
        '</div>' +
        '<div class="rm-week-side">' +
          '<button class="rm-chip rm-st" title="' + RM_STATUS_LBL[d.st] + ' — click to cycle" ' +
                  'onclick="rmCycle(' + i + ',\'st\')">' + RM_STATUS_GLYPH[d.st] + '</button>' +
          '<button class="rm-chip" data-track="' + d.track + '" title="Click to cycle track" ' +
                  'onclick="rmCycle(' + i + ',\'track\')">' + RM_TRACK_LBL[d.track] + '</button>' +
        '</div>' +
      '</div>';
  });
  tl.innerHTML = h;

  let g = '';
  RM_TERMS.forEach(function (term) {
    const items = RM.goals[term.id];
    g += '<div class="rm-term" data-term="' + term.id + '">' +
           '<div class="rm-term-hd">' +
             '<span class="rm-term-name">' + term.name + '</span>' +
             '<span class="rm-term-when">' + term.when + '</span>' +
           '</div>';
    items.forEach(function (txt, i) {
      g += '<div class="rm-goal">' +
             '<span class="rm-goal-dot">•</span>' +
             '<div class="rm-goal-text" contenteditable="plaintext-only" spellcheck="false" ' +
                  'data-ph="New goal…" data-rm-goal="' + term.id + ':' + i + '">' + rmEsc(txt) + '</div>' +
             '<button class="rm-del" title="Delete" onclick="rmDelGoal(\'' + term.id + '\',' + i + ')">×</button>' +
           '</div>';
    });
    g += '<button class="rm-add" onclick="rmAddGoal(\'' + term.id + '\')">+ add</button></div>';
  });
  gl.innerHTML = g;

  tl.scrollTop = tlTop;
  gl.scrollTop = glTop;
  rmReadout(null);
}

/* ── Note sessions: tab strip + textarea binding ────────
   The textarea is a single element bound to whichever session is active, not
   one textarea per tab — switching swaps `value` rather than swapping nodes,
   so the browser's own undo stack is the only thing that resets and nothing
   leaks per tab.
   ────────────────────────────────────────────────────── */
function rmTabsRender() {
  const bar = document.getElementById('rm-tabs');
  if (!bar) return;
  let h = '';
  RM.sessions.forEach(function (s, i) {
    const on = i === RM.si;
    // A <div>, not a <button>: the active tab's name is contenteditable, and a
    // caret inside a button is unreliable across browsers. The × stops
    // propagation or the delete would also register as "switch to this tab".
    h += '<div class="rm-tab' + (on ? ' is-on' : '') + '" onclick="rmTabGo(' + i + ')" ' +
              'title="' + rmAttr(s.name) + (on ? ' — click the name to rename' : '') + '">' +
           '<span class="rm-tab-name"' + (on ? ' contenteditable="plaintext-only" spellcheck="false" ' +
             'data-rm-sname="' + i + '"' : '') + '>' + rmEsc(s.name) + '</span>' +
           (on && RM.sessions.length > 1
             ? '<span class="rm-tab-x" onclick="event.stopPropagation();rmTabDel(' + i + ')" ' +
               'title="Delete this session">×</span>'
             : '') +
         '</div>';
  });
  h += '<div class="rm-tab rm-tab--add" onclick="rmTabAdd()" title="New session">+</div>';
  bar.innerHTML = h;
}

/* Bind the textarea to the active session. Called on every switch and once at
   init; nothing else may write `value`, or a keystroke races the render. */
function rmTabBind() {
  const ta = document.getElementById('rm-notes');
  if (!ta) return;
  ta.value = rmSession().body;
}

window.rmTabGo = function (i) {
  if (i === RM.si) return;      // a click on the active tab is a rename target
  RM.si = Math.max(0, Math.min(RM.sessions.length - 1, i));
  rmSave();
  rmTabsRender();
  rmTabBind();
};

window.rmTabAdd = function () {
  RM.sessions.push(rmNewSession(rmTodayMs()));
  RM.si = RM.sessions.length - 1;
  rmSave();
  rmTabsRender();
  rmTabBind();
  const ta = document.getElementById('rm-notes');
  if (ta) ta.focus();
};

window.rmTabDel = function (i) {
  // Never leave the card with no session — the textarea would bind to nothing.
  if (RM.sessions.length < 2) return;
  const s = RM.sessions[i];
  if (s.body.trim() &&
      !confirm('Delete "' + s.name + '"? Its notes go with it.')) return;
  RM.sessions.splice(i, 1);
  if (RM.si >= RM.sessions.length) RM.si = RM.sessions.length - 1;
  rmSave();
  rmTabsRender();
  rmTabBind();
};

/* ── Edits ──────────────────────────────────────────────── */
window.rmCycle = function (i, field) {
  const list = field === 'st' ? RM_STATUS : RM_TRACKS;
  const cur = RM.weeks[i][field];
  RM.weeks[i][field] = list[(list.indexOf(cur) + 1) % list.length];
  rmSave(); rmRender();
};

window.rmAddGoal = function (term) {
  RM.goals[term].push('');
  rmSave(); rmRender();
  // Drop the caret straight into the row that was just created.
  const rows = document.querySelectorAll('[data-rm-goal^="' + term + ':"]');
  const last = rows[rows.length - 1];
  if (last) last.focus();
};

window.rmDelGoal = function (term, i) {
  RM.goals[term].splice(i, 1);
  rmSave(); rmRender();
};

/* ── Export ─────────────────────────────────────────────── */
/* "Aug 21 2026 – May 6 2027". Both years spelled out once the board crosses
   one — a single trailing year would have been wrong, not just terse. */
function rmRange() {
  const a = RM_WEEKS[0].ms;
  const b = rmAddDays(RM_WEEKS[RM_WEEKS.length - 1].ms, 6);
  const yr = function (ms) { return ' ' + new Date(ms).getUTCFullYear(); };
  return RM_SPANS_YEARS
    ? rmFmt(a) + yr(a) + ' – ' + rmFmt(b) + yr(b)
    : rmFmt(a) + ' – ' + rmFmt(b) + yr(b);
}

function rmMarkdown() {
  let out = '# Spindeck — Roadmap\n\n' + rmRange() + ' (' + RM_WEEKS.length + ' weeks)\n\n## Goals\n';
  RM_TERMS.forEach(function (t) {
    out += '\n### ' + t.name + ' (' + t.when + ')\n';
    const items = RM.goals[t.id].filter(function (x) { return x.trim(); });
    out += items.length ? items.map(function (x) { return '- ' + x; }).join('\n') + '\n'
                        : '_(none)_\n';
  });

  out += '\n## Timeline\n\n| Week | Starting | Subject | Track | Status | Detail |\n' +
         '|---|---|---|---|---|---|\n';
  RM_WEEKS.forEach(function (wk, i) {
    const d = RM.weeks[i];
    if (!rmHasItem(d)) return;
    // Escape pipes so a typed "|" can't break the table.
    const cell = function (s) { return String(s || '').replace(/\|/g, '\\|'); };
    out += '| W' + (i + 1) + ' | ' + wk.label + ' | ' + (cell(d.tag) || '—') + ' | ' +
           RM_TRACK_LBL[d.track] + ' | ' + RM_STATUS_LBL[d.st] + ' | ' +
           (cell(d.t) || '—') + ' |\n';
  });

  // Events are the other half of the calendar and were invisible in the export
  // until v3 — a board copied out without them lost every date-specific thing
  // on it. Sorted by ISO, which sorts chronologically for free.
  const days = Object.keys(RM.events).sort();
  if (days.length) {
    out += '\n## Events\n\n';
    days.forEach(function (iso) {
      const wi = rmWeekOf(rmDayMs(iso));
      out += '- **' + rmDayLabel(rmDayMs(iso)) + '**' + (wi >= 0 ? ' (W' + (wi + 1) + ')' : '') +
             ' — ' + rmEvOn(iso).join('; ') + '\n';
    });
  }

  out += '\n## Meeting notes\n';
  RM.sessions.forEach(function (s) {
    out += '\n### ' + s.name + '\n\n' + (s.body.trim() || '_(none)_') + '\n';
  });
  return out;
}

function rmFlash(btn, label) {
  const old = btn.textContent;
  btn.textContent = label;
  btn.classList.add('is-ok');
  setTimeout(function () { btn.textContent = old; btn.classList.remove('is-ok'); }, 1400);
}

function rmToClipboard(text, done) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () { rmCopyFallback(text, done); });
  } else {
    rmCopyFallback(text, done);
  }
}

window.rmCopy = function (btn) {
  rmToClipboard(rmMarkdown(), function () { rmFlash(btn, '✓ Copied'); });
};

/* ── Share link ─────────────────────────────────────────
   localStorage is per-browser, so a board only ever exists on the machine it
   was typed on — the live site can't hand someone else's notes back, and it
   can't hand yours to them. This packs the WHOLE board into the URL hash, so
   a link is the transport: paste it to anyone and their board becomes yours.
   No server, which is the only reason this works on GitHub Pages at all.
   ────────────────────────────────────────────────────── */
function rmEncode(state) {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let bin = '';
  bytes.forEach(function (b) { bin += String.fromCharCode(b); });
  // URL-safe base64 — a raw + or / gets mangled by chat apps and mail clients.
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function rmDecode(s) {
  try {
    let b = s.replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4) b += '=';
    const bin = atob(b);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (e) { return null; }   // truncated paste, old format, anything
}

window.rmCopyLink = function (btn) {
  const url = location.origin + location.pathname + location.search +
              '#rm=' + rmEncode(RM);
  // ~2k of notes lands around 3k of URL. Browsers are fine into the tens of
  // thousands; chat apps are where a very long one gets cut, so say so.
  rmToClipboard(url, function () {
    rmFlash(btn, url.length > 8000 ? '✓ Long link' : '✓ Link copied');
  });
};

/* An incoming #rm= wins over whatever is in this browser — but only with a
   yes, because it silently replacing someone's own notes is the worst
   possible outcome of clicking a link. */
function rmFromHash() {
  const m = location.hash.match(/[#&]rm=([^&]+)/);
  if (!m) return null;
  const s = rmDecode(m[1]);
  // Strip the hash either way: on a reload it would re-import and wipe out
  // whatever they had typed since.
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  if (!s || !Array.isArray(s.weeks)) return null;

  let local = null;
  try { local = localStorage.getItem(RM_KEY); } catch (e) {}
  if (local && !confirm('Open the shared roadmap? It replaces the board saved in this browser.')) return null;
  // They said yes, but "replaces" is doing a lot of work in that sentence —
  // stash what was here so an accidental yes is recoverable.
  if (local) { try { localStorage.setItem(RM_PREV_KEY, local); } catch (e) {} }
  return rmNormalize(s);
}

function rmCopyFallback(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { /* nothing else to try */ }
  document.body.removeChild(ta);
}

window.rmDownload = function (btn) {
  const blob = new Blob([rmMarkdown()], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'spindeck-roadmap.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  rmFlash(btn, '✓ Saved');
};

window.rmReset = function () {
  // Destructive and easy to hit beside Export — confirm() is a browser modal,
  // but this is viewer chrome, never the phone prototype, so it's safe here.
  if (!confirm('Reset the roadmap to a blank board? Your edits, events and notes will be lost.')) return;
  window.rmDayClose();          // it holds an ISO into the state we're replacing
  RM = rmSeed();
  rmSave(); rmRender();
  rmTabsRender(); rmTabBind();
};

/* ── Open / close ───────────────────────────────────────── */
window.toggleRoadmap = function () {
  const el = document.getElementById('roadmap');
  if (!el) return;
  if (!RM_BUILT) { rmInit(); RM_BUILT = true; }
  if (!el.hidden) window.rmDayClose();   // don't leave it open behind a closed board
  el.hidden = !el.hidden;
  // The overlay only covers #stage, so the thumbnail tray and the rec strip
  // would still show under it — hide them for the duration.
  const v = document.getElementById('viewer');
  if (v) v.classList.toggle('rm-open', !el.hidden);
  if (!el.hidden) rmScrollToNow();
};

/* Open on the current week rather than at W1 — by November, scrolling past
   two dead months every time gets old fast. */
function rmScrollToNow() {
  const i = rmWeekOf(rmTodayMs());
  if (i < 1) return;
  const row = document.querySelector('.rm-week[data-w="' + i + '"]');
  if (row) row.scrollIntoView({ block: 'center' });
}

function rmInit() {
  // A shared board beats the local one; rmFromHash returns null if there
  // isn't one, if it won't decode, or if the reader declines to replace theirs.
  const shared = rmFromHash();
  RM = shared || rmLoad();
  if (shared) rmSave();

  // Stamped rather than written into the markup, so the range can't go stale
  // in the header the next time RM_WEEK_COUNT moves.
  const sub = document.getElementById('rm-hd-sub');
  if (sub) sub.textContent = rmRange() + ' · ' + RM_WEEKS.length +
                             ' weeks · click a line to edit, a day to add an event';

  RM_CAL_I = rmCalMonthOfToday();
  rmRender();
  rmCalSwipe();

  rmTabsRender();
  rmTabBind();
  const notes = document.getElementById('rm-notes');
  if (notes) {
    // Writes to whichever session is active at the time — rmTabGo swaps the
    // value under it, so there is no per-tab listener to keep in sync.
    notes.addEventListener('input', function () { rmSession().body = notes.value; rmSave(); });
  }

  // ONE delegated listener for every editable cell — the rows are rebuilt by
  // rmRender, so per-node listeners would leak on each structural change.
  const root = document.getElementById('roadmap');
  root.addEventListener('input', function (e) {
    const t = e.target;
    if (t.dataset.rmWeek != null) {
      const i = +t.dataset.rmWeek;
      RM.weeks[i].t = t.textContent;
      rmSave();
      rmCalMark(i);           // repaint the dot only; a render would eat the caret
    } else if (t.dataset.rmTag != null) {
      const i = +t.dataset.rmTag;
      RM.weeks[i].tag = t.textContent;
      rmSave();
      rmCalMark(i);           // the subject bar on the calendar follows live
    } else if (t.dataset.rmGoal != null) {
      const parts = t.dataset.rmGoal.split(':');
      RM.goals[parts[0]][+parts[1]] = t.textContent;
      rmSave();
    } else if (t.dataset.rmEv != null) {
      // The popover is a child of #roadmap, so it rides this same listener.
      const list = RM_DAY != null ? RM.events[RM_DAY] : null;
      if (list) {
        list[+t.dataset.rmEv] = t.textContent;
        rmSave();
        rmEvMark(RM_DAY);       // the day's marker follows live, no re-render
      }
    } else if (t.dataset.rmSname != null) {
      RM.sessions[+t.dataset.rmSname].name = t.textContent;
      rmSave();                 // no rmTabsRender — it would eat the caret
    }
  });

  // Enter commits rather than opening a second line — the rows are one-liners,
  // and a stray <br> would break the :empty placeholder.
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || !e.target.hasAttribute('contenteditable')) return;
    e.preventDefault();
    // Enter in an event opens the NEXT event on that day — a day usually gets
    // a burst of them typed in one go, and reaching for "+ add" between each
    // one turns a list into a chore.
    if (e.target.dataset.rmEv != null) { window.rmEvAdd(); return; }
    // Enter in a subject moves to that week's detail line — they're one entry
    // typed top to bottom, so it shouldn't cost a second click. Everywhere
    // else Enter commits, since a stray <br> breaks the :empty placeholder.
    const next = e.target.dataset.rmTag != null
      ? e.target.parentNode.querySelector('.rm-week-text') : null;
    if (next) next.focus(); else e.target.blur();
  });

  // Calendar ↔ timeline linking. Delegated for the same reason as above: the
  // grid is thrown away and rebuilt on every structural change.
  const cal = document.getElementById('rm-cal');
  if (cal) {
    cal.addEventListener('mouseover', function (e) {
      const c = e.target.closest('[data-w]');
      if (c) rmHi(+c.dataset.w);
    });
    cal.addEventListener('mouseleave', function () { rmHi(null); });
    // Two different targets, two different jobs. A DAY opens its event editor —
    // that is the day-level thing you'd want from a day. The W-number gutter
    // (and the subject bar over the row) still jumps to the week in the
    // timeline, which is what the whole cell used to do.
    cal.addEventListener('click', function (e) {
      if (cal._rmDragged) return;   // a swipe that ended on a day isn't a tap
      const day = e.target.closest('.rm-cal-d');
      if (day) {
        // A second click on the open day closes it, rather than re-opening
        // the same popover under the caret someone is already typing in.
        if (RM_DAY === day.dataset.d) window.rmDayClose();
        else window.rmDayOpen(day.dataset.d, day);
        return;
      }
      const c = e.target.closest('[data-w]');
      if (!c) return;
      window.rmDayClose();
      window.rmDayToWeek(+c.dataset.w);
    });
  }

  // Clicking anywhere else dismisses the popover. Capture phase, because the
  // calendar's own click handler above would otherwise re-open it in the same
  // gesture; the popover's own clicks are excluded by the contains() test.
  document.addEventListener('pointerdown', function (e) {
    if (RM_DAY == null) return;
    const el = document.getElementById('rm-day');
    if (el && el.contains(e.target)) return;
    if (e.target.closest && e.target.closest('.rm-cal-d')) return;
    window.rmDayClose();
  }, true);

  // Hovering the linear list lights the calendar too — the link works both ways.
  const tl = document.getElementById('rm-timeline');
  if (tl) {
    tl.addEventListener('mouseover', function (e) {
      const r = e.target.closest('.rm-week');
      if (r) rmHi(+r.dataset.w);
    });
    tl.addEventListener('mouseleave', function () { rmHi(null); });
  }

  // The filmstrip is translated in PIXELS off the viewport's width, so a
  // resize leaves it parked between two months until it's re-snapped.
  window.addEventListener('resize', function () { rmCalSlide(0, false); });
}

// Esc closes, matching the rest of the viewer's overlays. The day popover is
// the innermost thing open, so it takes the first Esc and the board takes the
// second — one Esc closing both would lose the board over a stray keypress.
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  const el = document.getElementById('roadmap');
  if (!el || el.hidden) return;
  if (RM_DAY != null) { window.rmDayClose(); e.stopPropagation(); return; }
  // Route through the toggle so the #viewer class is unwound too.
  window.toggleRoadmap();
  e.stopPropagation();
}, true);
