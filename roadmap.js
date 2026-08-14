/* ============================================================
   ROADMAP — Spindeck planning board (desktop viewer only)

   Behind the toolbar's "Roadmap" button. Left: an 18-week vertical
   timeline (Aug 17 → Dec 14 2026). Right top: short / medium / long
   term goals. Right bottom: meeting notes.

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
   input handler.
   ============================================================ */

const RM_KEY = 'spindeck-roadmap-v1';

/* Week starts, Mondays. Static — the stored state holds only the text,
   track and status per index, so editing this list re-labels the board
   without orphaning anyone's notes (rmLoad pads / truncates to match). */
const RM_WEEKS = [
  ['Aug 17', 'Aug'], ['Aug 24', ''], ['Aug 31', ''],
  ['Sep 7',  'Sep'], ['Sep 14', ''], ['Sep 21', ''], ['Sep 28', ''],
  ['Oct 5',  'Oct'], ['Oct 12', ''], ['Oct 19', ''], ['Oct 26', ''],
  ['Nov 2',  'Nov'], ['Nov 9',  ''], ['Nov 16', ''], ['Nov 23', ''], ['Nov 30', ''],
  ['Dec 7',  'Dec'], ['Dec 14', ''],
];

const RM_TRACKS = ['mockup', 'web', 'both'];
const RM_TRACK_LBL = { mockup: 'Mockup', web: 'Website', both: 'Both' };

const RM_STATUS = ['planned', 'doing', 'done', 'risk'];
const RM_STATUS_GLYPH = { planned: '–', doing: '▸', done: '✓', risk: '!' };
const RM_STATUS_LBL = { planned: 'Planned', doing: 'In progress', done: 'Done', risk: 'At risk' };

const RM_TERMS = [
  { id: 'short',  name: 'Short term',  when: 'now → 4 weeks' },
  { id: 'medium', name: 'Medium term', when: '1 → 3 months' },
  { id: 'long',   name: 'Long term',   when: '3 months +' },
];

/* The seed is a DRAFT for the meeting to argue with, not a plan of record.
   Items are drawn from the open threads already recorded in CLAUDE.md. */
function rmSeed() {
  const w = (t, track, st) => ({ t: t, track: track || 'mockup', st: st || 'planned' });
  const weeks = [
    w('Light theme: replace the #999 bento placeholders with a real token set', 'mockup'),
    w('Persona skins pass 2 — header wordmark + icons wash out on light backgrounds', 'mockup'),
    w('Vinyl sweep: route the ~38 remaining inline ★ glyphs through halfStars', 'mockup'),
    w('MILESTONE — design language locked; hand the token set to the website proto', 'both'),
    w('Website proto: shell + routing, ported from the mockup screen list', 'web'),
    w('Social (08) screen — first of the two page-map gaps', 'mockup'),
    w('Live Stream (09) screen — closes the page map', 'mockup'),
    w('Website proto: home + album pages against the shared tokens', 'web'),
    w('MILESTONE — parity review: what the proto still owes the mockup', 'both'),
    w('Profile theme 02 (angular)', 'mockup'),
    w('Re-enable previews (PREVIEWS_ENABLED) + retest the iOS unlock gesture', 'mockup'),
    w('Website proto: auth + onboarding', 'web'),
    w('Move artwork to Dropbox — re-run build_personas.py, no rewrite', 'both'),
    w('Website proto: playlists + profile', 'web'),
    w('MILESTONE — end-to-end clickable demo across both projects', 'both'),
    w('', 'mockup'),
    w('', 'mockup'),
    w('MILESTONE — beta candidate + year-end review', 'both'),
  ];
  return {
    v: 1,
    weeks: weeks,
    goals: {
      short: [
        'Close the light theme — one token set, no #999 placeholders left',
        'Every persona legible on every background, light and dark',
        'One rating component app-wide; no inline ★ survives',
      ],
      medium: [
        'No gaps in the page map — Social (08) and Live Stream (09) built',
        'Website proto reaches home + album + auth on the shared tokens',
        'Previews back on; profile theme 02 shipped',
      ],
      long: [
        'Mockup and website read ONE token source instead of two hand-synced sets',
        'Real data behind the proto — retire the runtime Deezer recommendation layer',
        'Beta candidate: end-to-end clickable, ready for testers outside the team',
      ],
    },
    notes: '',
  };
}

let RM = null;
let RM_BUILT = false;

/* ── State ──────────────────────────────────────────────── */
function rmLoad() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(RM_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || !Array.isArray(s.weeks)) return rmSeed();

  // Reconcile against RM_WEEKS so editing the week list can't orphan state.
  const seed = rmSeed();
  s.weeks = RM_WEEKS.map((_, i) => s.weeks[i] || { t: '', track: 'mockup', st: 'planned' });
  s.goals = s.goals || seed.goals;
  RM_TERMS.forEach(t => { if (!Array.isArray(s.goals[t.id])) s.goals[t.id] = []; });
  if (typeof s.notes !== 'string') s.notes = '';
  return s;
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

/* ── Render ─────────────────────────────────────────────── */
function rmRender() {
  const tl = document.getElementById('rm-timeline');
  const gl = document.getElementById('rm-goals');
  if (!tl || !gl) return;

  // Structural re-renders must not throw the reader back to the top.
  const tlTop = tl.scrollTop, glTop = gl.scrollTop;

  let h = '';
  RM_WEEKS.forEach(function (wk, i) {
    const d = RM.weeks[i];
    if (wk[1]) h += '<div class="rm-month">' + wk[1] + ' 2026</div>';
    h +=
      '<div class="rm-week" data-st="' + d.st + '">' +
        '<div class="rm-week-lbl"><span class="rm-week-no">W' + (i + 1) + '</span><br>' + wk[0] + '</div>' +
        '<div class="rm-week-text" contenteditable="plaintext-only" spellcheck="false" ' +
             'data-ph="—" data-rm-week="' + i + '">' + rmEsc(d.t) + '</div>' +
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
function rmMarkdown() {
  let out = '# Spindeck — Roadmap\n\nAug 17 – Dec 14 2026 (18 weeks)\n\n## Goals\n';
  RM_TERMS.forEach(function (t) {
    out += '\n### ' + t.name + ' (' + t.when + ')\n';
    const items = RM.goals[t.id].filter(function (x) { return x.trim(); });
    out += items.length ? items.map(function (x) { return '- ' + x; }).join('\n') + '\n'
                        : '_(none)_\n';
  });

  out += '\n## Timeline\n\n| Week | Starting | Track | Status | Item |\n|---|---|---|---|---|\n';
  RM_WEEKS.forEach(function (wk, i) {
    const d = RM.weeks[i];
    if (!d.t.trim()) return;
    // Escape pipes so a typed "|" can't break the table.
    out += '| W' + (i + 1) + ' | ' + wk[0] + ' | ' + RM_TRACK_LBL[d.track] + ' | ' +
           RM_STATUS_LBL[d.st] + ' | ' + d.t.replace(/\|/g, '\\|') + ' |\n';
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

window.rmCopy = function (btn) {
  const md = rmMarkdown();
  const done = function () { rmFlash(btn, '✓ Copied'); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(md).then(done, function () { rmCopyFallback(md, done); });
  } else {
    rmCopyFallback(md, done);
  }
};

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
  if (!confirm('Reset the roadmap to the seeded draft? Your edits and notes will be lost.')) return;
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
};

function rmInit() {
  RM = rmLoad();
  rmRender();

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
      RM.weeks[+t.dataset.rmWeek].t = t.textContent;
      rmSave();
    } else if (t.dataset.rmGoal != null) {
      const parts = t.dataset.rmGoal.split(':');
      RM.goals[parts[0]][+parts[1]] = t.textContent;
      rmSave();
    }
  });

  // Enter commits rather than opening a second line — the rows are one-liners,
  // and a stray <br> would break the :empty placeholder.
  root.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.hasAttribute('contenteditable')) {
      e.preventDefault();
      e.target.blur();
    }
  });
}

// Esc closes, matching the rest of the viewer's overlays.
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  const el = document.getElementById('roadmap');
  // Route through the toggle so the #viewer class is unwound too.
  if (el && !el.hidden) { window.toggleRoadmap(); e.stopPropagation(); }
}, true);
