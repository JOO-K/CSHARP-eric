/* ============================================================
   SD_DOTS — the brand dot-matrix asset generator
   ============================================================
   THE Spindeck asset primitive: a grid of ROUNDED SQUARES —
   dot = 56% of the cell, corner radius = 14% of the dot. Same
   geometry as the live-pill dot-face and the site's dither
   speckle, so everything drawn this way reads as one family.

   Turn a text pattern into an SVG of those dots:

     SD_DOTS.svg([
       '.x.',
       'xxx',      // 'x' (or '#') = dot · '.' / ' ' = empty
       '.x.',
     ], { cls: 'my-icon' })

   → '<svg viewBox="0 0 24 24" class="my-icon">…rects…</svg>'.
   Dots fill with currentColor, so CSS `color` tints the asset
   like any glyph.

   DESIGN NEW PATTERNS IN dot-lab.html (paint grid + link mode +
   sliders + save library + copy buttons — the toolbar's "◌ Dots"
   button opens it), then paste the copied call into code. The lab
   loads THIS file, so there is only one generator to maintain.

   ⚠️ Rotate dot assets in RIGHT ANGLES ONLY. A dot matrix turned
   to an off-axis angle smears its dots off the pixel grid and
   reads as mush — let the artwork's own 45° steps supply any
   diagonal instead.

   Shared with the marketing site (../spindeck_website_proto),
   where the same generator is main.js §0.
   ============================================================ */
window.SD_DOTS = (function () {
  const DEF = {
    cell:       8,              // grid cell in viewBox units (display size is CSS's job)
    dotFrac:    0.56,           // dot size as a fraction of the cell
    cornerFrac: 0.14,           // corner radius as a fraction of the dot
    spacing:    1,              // pitch multiplier — >1 adds air WITHOUT resizing the dots
    links:      null,           // [[x1,y1,x2,y2],…] — pairs melted by a gooey bridge
    color:      'currentColor',
    cls:        '',
  };

  const parse = pattern => pattern.map(row => [...row].map(ch => ch === 'x' || ch === '#'));

  /* Surface-tension bridge between two dot centres: a quad strip whose sides bow
     INWARD to a pinched waist (the metaball/goo neck), drawn under the dots in
     the same fill so the union reads as two dots melting together. Which pairs
     get one is the designer's call — pass them per-asset via opts.links
     (orthogonal or diagonal neighbours; pick them visually in dot-lab.html). */
  function bridge(x1, y1, x2, y2, pitch, d, color) {
    const cx1 = (x1 + 0.5) * pitch, cy1 = (y1 + 0.5) * pitch;
    const cx2 = (x2 + 0.5) * pitch, cy2 = (y2 + 0.5) * pitch;
    const len = Math.hypot(cx2 - cx1, cy2 - cy1) || 1;
    const nx  = -(cy2 - cy1) / len, ny = (cx2 - cx1) / len;   // unit normal to the axis
    // hourglass tunables: w0 = half-width where the neck meets each dot; wc =
    // the cubic control half-width (waist lands ≈ 0.14·d) — narrow attach +
    // deep pinch reads liquid rather than chunky
    const w0  = d * 0.36;
    const wc  = d * 0.07;
    const ax1 = cx1 + (cx2 - cx1) * 0.35, ay1 = cy1 + (cy2 - cy1) * 0.35;   // control anchors
    const ax2 = cx1 + (cx2 - cx1) * 0.65, ay2 = cy1 + (cy2 - cy1) * 0.65;   // along the axis
    const p   = (x, y) => x.toFixed(2) + ' ' + y.toFixed(2);
    return `<path d="M${p(cx1 + nx * w0, cy1 + ny * w0)}`
         + ` C${p(ax1 + nx * wc, ay1 + ny * wc)} ${p(ax2 + nx * wc, ay2 + ny * wc)} ${p(cx2 + nx * w0, cy2 + ny * w0)}`
         + ` L${p(cx2 - nx * w0, cy2 - ny * w0)}`
         + ` C${p(ax2 - nx * wc, ay2 - ny * wc)} ${p(ax1 - nx * wc, ay1 - ny * wc)} ${p(cx1 - nx * w0, cy1 - ny * w0)} Z"`
         + ` fill="${color}"/>`;
  }

  function svg(pattern, opts = {}) {
    const o     = { ...DEF, ...opts };
    const grid  = parse(pattern);
    const rows  = grid.length;
    const cols  = Math.max(...grid.map(r => r.length));
    const pitch = o.cell * o.spacing;
    const d     = o.cell * o.dotFrac;
    const rx    = +(d * o.cornerFrac).toFixed(2);
    const off   = (pitch - d) / 2;

    let body = '';
    (o.links || []).forEach(([x1, y1, x2, y2]) => body += bridge(x1, y1, x2, y2, pitch, d, o.color));
    grid.forEach((row, gy) => row.forEach((on, gx) => {
      if (!on) return;
      body += `<rect x="${(gx * pitch + off).toFixed(2)}" y="${(gy * pitch + off).toFixed(2)}"`
            + ` width="${d.toFixed(2)}" height="${d.toFixed(2)}" rx="${rx}" fill="${o.color}"/>`;
    }));

    return `<svg${o.cls ? ` class="${o.cls}"` : ''} viewBox="0 0 ${cols * pitch} ${rows * pitch}"`
         + ` xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
  }

  return { svg, DEF };
})();
