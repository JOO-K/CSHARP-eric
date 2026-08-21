/* ============================================================
   ROADMAP — Spindeck planning board (desktop viewer only)

   Behind the toolbar's "Roadmap" button. Top: a block calendar,
   Aug → Dec 2026 (August is a two-week stub, see RM_CAL_MONTHS).
   Left: the linear week-by-week timeline (Aug 21 → Dec 31 2026,
   19 weeks). Right top: short / medium / long term goals.
   Right bottom: meeting notes.

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

const RM_START = '2026-08-21';   // Friday
const RM_WEEK_COUNT = 19;        // through the week of Dec 25 → Dec 31

/* Months drawn in the block calendar. August leads with a short block —
   only the two weeks the timeline actually covers (W1 Aug 21–27, W2 Aug 28
   with its Sep days dimmed) — so every week in the list has a calendar cell
   and the board can open on today. Sep → Dec are the four development months. */
const RM_CAL_MONTHS = [[2026, 7], [2026, 8], [2026, 9], [2026, 10], [2026, 11]];  // month is 0-based
const RM_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const RM_DOW = ['F', 'S', 'S', 'M', 'T', 'W', 'T'];   // Friday-start, see header comment

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
    out.push({ ms: ms, label: rmFmt(ms), month: new Date(ms).getUTCMonth() });
  }
  return out;
})();

const RM_TRACKS = ['mockup', 'web', 'both', 'admin'];
const RM_TRACK_LBL = { mockup: 'Mockup', web: 'Website', both: 'Both', admin: 'Admin' };

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
  'chip cycles track (Mockup / Website / Both / Admin). Hover a day in the ' +
  'calendar to light up its week down here, or click it to jump. ' +
  'Start a subject with MILESTONE to flag it. Everything saves in THIS browser ' +
  'only — hit Copy link or Copy Markdown before you close the tab.';

function rmSeed() {
  const weeks = RM_WEEKS.map(function () {
    return { tag: '', t: '', track: 'mockup', st: 'planned' };
  });
  weeks[0] = { tag: 'HOW TO USE', t: RM_HOWTO, track: 'both', st: 'doing' };
  return {
    v: 2,
    weeks: weeks,
    goals: { short: [], medium: [], long: [] },
    notes: '',
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
    const w = s.weeks[i] || { tag: '', t: '', track: 'mockup', st: 'planned' };
    // A value dropped from the lists would break the chip's cycle index.
    if (RM_TRACKS.indexOf(w.track) < 0) w.track = 'mockup';
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
  if (typeof s.notes !== 'string') s.notes = '';
  s.v = 2;
  return s;
}

function rmLoad() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(RM_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || !Array.isArray(s.weeks)) return rmSeed();
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

    // No month name in the slide — it lives in the card header beside the
    // arrows, so the control and the label it names stay together.
    h += '<div class="rm-cal-m">' +
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
        const cls = 'rm-cal-d' +
          ((ms < first || ms > last) ? ' is-out' : '') +
          ((ms === today) ? ' is-today' : '');
        h += '<button class="' + cls + '" data-w="' + i + '" data-st="' + d.st + '" ' +
                     'data-mark="' + mark + '">' + new Date(ms).getUTCDate() + '</button>';
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

/* Which month block holds today, so the board opens on the right one.
   Outside the range we land on Sep, not on index 0 — August is a two-week
   stub and makes a poor first screen for anyone arriving off-season. */
function rmCalMonthOfToday() {
  const n = new Date();
  const i = RM_CAL_MONTHS.findIndex(function (ym) {
    return ym[0] === n.getFullYear() && ym[1] === n.getMonth();
  });
  return i < 0 ? 1 : i;
}

/* Position the filmstrip. `px` is a live drag offset; omit it to snap. */
function rmCalSlide(px, animate) {
  const view = document.getElementById('rm-cal');
  const track = document.getElementById('rm-cal-track');
  if (!view || !track) return;
  track.style.transition = animate ? '' : 'none';
  track.style.transform =
    'translateX(' + (-RM_CAL_I * view.clientWidth + (px || 0)) + 'px)';
}

function rmCalLabel() {
  const ym = RM_CAL_MONTHS[RM_CAL_I];
  const name = document.getElementById('rm-cal-name');
  if (name) name.textContent = RM_MON[ym[1]] + ' ' + ym[0];

  const prev = document.getElementById('rm-cal-prev');
  const next = document.getElementById('rm-cal-next');
  if (prev) prev.disabled = RM_CAL_I === 0;
  if (next) next.disabled = RM_CAL_I === RM_CAL_MONTHS.length - 1;

  const pips = document.getElementById('rm-cal-pips');
  if (pips) {
    pips.innerHTML = RM_CAL_MONTHS.map(function (_, i) {
      return '<button class="rm-pip' + (i === RM_CAL_I ? ' is-on' : '') + '" ' +
             'onclick="rmCalGo(' + i + ')" title="' + RM_MON[RM_CAL_MONTHS[i][1]] + '"></button>';
    }).join('');
  }
}

window.rmCalGo = function (i, animate) {
  RM_CAL_I = Math.max(0, Math.min(RM_CAL_MONTHS.length - 1, i));
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
                  (RM_CAL_I === RM_CAL_MONTHS.length - 1 && dx < 0);
    rmCalSlide(atEnd ? dx * 0.3 : dx, false);
  });

  const end = function () {
    if (!down) return;
    down = false;
    view.classList.remove('is-grabbing');
    const w = view.clientWidth;
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

  // Structural re-renders must not throw the reader back to the top.
  const tlTop = tl.scrollTop, glTop = gl.scrollTop;

  if (track) {
    track.innerHTML = rmCalHTML();
    rmCalLabel();
    rmCalSlide(0, false);   // rebuilt slides start unpositioned — re-snap
  }

  const today = rmTodayMs();
  let h = '', lastMonth = -1;
  RM_WEEKS.forEach(function (wk, i) {
    const d = RM.weeks[i];
    if (wk.month !== lastMonth) {
      h += '<div class="rm-month">' + RM_MON[wk.month] + ' 2026</div>';
      lastMonth = wk.month;
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
function rmRange() {
  return rmFmt(RM_WEEKS[0].ms) + ' – ' +
         rmFmt(rmAddDays(RM_WEEKS[RM_WEEKS.length - 1].ms, 6)) + ' 2026';
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

  out += '\n## Meeting notes\n\n' + (RM.notes.trim() || '_(none)_') + '\n';
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
  if (!confirm('Reset the roadmap to a blank board? Your edits and notes will be lost.')) return;
  RM = rmSeed();
  rmSave(); rmRender();
  const n = document.getElementById('rm-notes');
  if (n) n.value = '';
};

/* ── Open / close ───────────────────────────────────────── */
window.toggleRoadmap = function () {
  const el = document.getElementById('roadmap');
  if (!el) return;
  if (!RM_BUILT) { rmInit(); RM_BUILT = true; }
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

  RM_CAL_I = rmCalMonthOfToday();
  rmRender();
  rmCalSwipe();

  const notes = document.getElementById('rm-notes');
  if (notes) {
    notes.value = RM.notes;
    notes.addEventListener('input', function () { RM.notes = notes.value; rmSave(); });
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
    }
  });

  // Enter commits rather than opening a second line — the rows are one-liners,
  // and a stray <br> would break the :empty placeholder.
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || !e.target.hasAttribute('contenteditable')) return;
    e.preventDefault();
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
    cal.addEventListener('click', function (e) {
      if (cal._rmDragged) return;   // a swipe that ended on a day isn't a tap
      const c = e.target.closest('[data-w]');
      if (!c) return;
      const row = document.querySelector('.rm-week[data-w="' + c.dataset.w + '"]');
      if (!row) return;
      row.scrollIntoView({ block: 'center', behavior: 'smooth' });
      // Land on the subject when the week is blank — that's the field you
      // fill first — and on the detail once it already has one.
      const tag = row.querySelector('.rm-week-tag');
      const cell = (tag && !tag.textContent.trim()) ? tag : row.querySelector('.rm-week-text');
      if (cell) cell.focus();
    });
  }

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

// Esc closes, matching the rest of the viewer's overlays.
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  const el = document.getElementById('roadmap');
  // Route through the toggle so the #viewer class is unwound too.
  if (el && !el.hidden) { window.toggleRoadmap(); e.stopPropagation(); }
}, true);
