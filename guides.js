/* ── Guides — draggable alignment lines over the stage ─────────────────────
   Toolbar → ┼ Guides. Drop a horizontal or vertical hairline on the stage and
   drag it over the phones to see whether two things line up. For checking
   baselines, edges and gutters by eye, and for showing someone else exactly
   which two things don't.

   Self-contained: nothing in app.js knows about it, and it knows nothing of
   app.js beyond `#stage`. Desktop viewer only — the mobile prototype hides
   the toolbar wholesale.

   - Lines live in `#guides`, an overlay filling #stage with pointer-events
     off; only the lines themselves take the pointer, so the app under them
     stays usable while they're up.
   - A line's hit area is 9px (the `::before`), the ink 1px. Drag to move;
     arrow keys nudge the last-touched line by 1px (Shift: 10px), which is
     what you want when a screen pixel matters. Double-click a line to delete
     just that one; Clear takes them all.
   - Positions are in stage px and printed on the line's tag, so "the album
     baseline is at 431 and the number's at 433" is a thing you can say. */
(function () {
  const Z = 95;   // above the roadmap (90) and the dev box (60)
  let overlay = null, panel = null, live = null;

  function stage() { return document.getElementById('stage'); }

  function ensure() {
    if (overlay) return;
    const st = stage(); if (!st) return;
    overlay = document.createElement('div');
    overlay.id = 'guides';
    st.appendChild(overlay);

    panel = document.createElement('div');
    panel.id = 'guides-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <button class="gd-btn" data-gd="h" title="Add a horizontal line (H)">＋ Horizontal</button>
      <button class="gd-btn" data-gd="v" title="Add a vertical line (V)">＋ Vertical</button>
      <button class="gd-btn gd-btn--clear" data-gd="clear" title="Remove every line">Clear lines</button>
      <span class="gd-hint">drag · arrows nudge · dbl-click removes</span>
      <button class="gd-x" data-gd="close" title="Close (lines stay)">×</button>`;
    st.appendChild(panel);
    panel.addEventListener('click', e => {
      const b = e.target.closest('[data-gd]'); if (!b) return;
      const k = b.dataset.gd;
      if (k === 'h' || k === 'v') add(k);
      else if (k === 'clear') clear();
      else if (k === 'close') panel.hidden = true;
    });

    // Keys: H / V add a line while the panel is open; arrows nudge the
    // last-touched line. All ignored while typing anywhere.
    document.addEventListener('keydown', e => {
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!panel.hidden && (e.key === 'h' || e.key === 'v')) { add(e.key); return; }
      if (!live || !live.isConnected) return;
      const step = e.shiftKey ? 10 : 1;
      const h = live.classList.contains('gd-line--h');
      let d = 0;
      if (h && e.key === 'ArrowUp') d = -step; else if (h && e.key === 'ArrowDown') d = step;
      else if (!h && e.key === 'ArrowLeft') d = -step; else if (!h && e.key === 'ArrowRight') d = step;
      if (!d) return;
      e.preventDefault();
      place(live, pos(live) + d);
    });
  }

  function pos(line) { return parseFloat(line.dataset.pos) || 0; }

  function place(line, p) {
    const r = overlay.getBoundingClientRect();
    const h = line.classList.contains('gd-line--h');
    const max = h ? r.height : r.width;
    p = Math.max(0, Math.min(max, Math.round(p)));
    line.dataset.pos = p;
    line.style[h ? 'top' : 'left'] = p + 'px';
    line.querySelector('.gd-tag').textContent = (h ? 'y ' : 'x ') + p;
  }

  function add(kind) {
    ensure();
    const r = overlay.getBoundingClientRect();
    const line = document.createElement('div');
    line.className = 'gd-line gd-line--' + kind;
    line.innerHTML = '<span class="gd-tag"></span>';
    overlay.appendChild(line);
    // Spawn just off the middle, and stagger repeats so two new lines don't
    // land on top of each other and read as one.
    const n = overlay.querySelectorAll('.gd-line--' + kind).length - 1;
    place(line, (kind === 'h' ? r.height : r.width) / 2 + n * 24);
    select(line);

    line.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      select(line);
      const h = kind === 'h';
      const start = h ? e.clientY : e.clientX;
      const from = pos(line);
      line.setPointerCapture(e.pointerId);
      line.classList.add('is-drag');
      const move = ev => place(line, from + ((h ? ev.clientY : ev.clientX) - start));
      const up = () => {
        line.classList.remove('is-drag');
        line.removeEventListener('pointermove', move);
        line.removeEventListener('pointerup', up);
        line.removeEventListener('pointercancel', up);
      };
      line.addEventListener('pointermove', move);
      line.addEventListener('pointerup', up);
      line.addEventListener('pointercancel', up);
    });
    line.addEventListener('dblclick', () => { if (live === line) live = null; line.remove(); });
    return line;
  }

  function select(line) {
    overlay.querySelectorAll('.gd-line.is-live').forEach(l => l.classList.remove('is-live'));
    line.classList.add('is-live');
    live = line;
  }

  function clear() {
    if (!overlay) return;
    overlay.innerHTML = '';
    live = null;
  }

  // Toolbar entry: opens the little panel (and drops a first horizontal line
  // if there are none yet, so the button does something visible on press).
  window.toggleGuides = function () {
    ensure();
    if (!panel) return;
    panel.hidden = !panel.hidden;
    if (!panel.hidden && !overlay.querySelector('.gd-line')) add('h');
  };
})();
