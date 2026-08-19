/* ============================================================
   QUICK SHARE — the bento as an Instagram post
   ============================================================
   Turns YOUR rating + review of an album into a 1080×1350 image
   (Instagram's 4:5 portrait): the home screen's COMPACT bento,
   floating on the album's own artwork blurred into a wallpaper,
   then your words and the tracks you scored.

   ⚠️ Drawn on a CANVAS, not html2canvas. The real bento leans on
   CSS masks, backdrop-filter, aspect-ratio and SVG masks — all
   things html2canvas either drops or mangles — so screenshotting
   the DOM would produce a broken postcard. Canvas also gives
   exact pixel dimensions, which is what a social export needs.

   Sharing itself goes through the Web Share API with a real file,
   which on a phone opens the OS sheet with Instagram in it. There
   is no web API that posts to Instagram directly — nobody has
   one — so desktop (and any browser without file sharing) falls
   back to saving the PNG.

   Entry points: the log sheet's footer, and your own review card
   in an album's review list (`.v3-rev-card--mine`).
   ============================================================ */

const SHARE_W = 1080, SHARE_H = 1350;

/* ── canvas helpers ─────────────────────────────────────────── */
function shRoundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y,     x + w, y + h, r);
  g.arcTo(x + w, y + h, x,     y + h, r);
  g.arcTo(x,     y + h, x,     y,     r);
  g.arcTo(x,     y,     x + w, y,     r);
  g.closePath();
}

/* One rating vinyl: a disc with a label hole — the same object the app draws in
   `halfStars`, whose radial mask is transparent to 20%, opaque 21→91% of the
   box. `fill` 0..1 lets a half rating render as a half disc.

   ⚠️ The hole is PAINTED in the surface colour behind it, never punched with
   `destination-out`. That erases the card itself, so the exported PNG came out
   with five transparent dots straight through the bento. */
function shVinyl(g, cx, cy, r, colour, empty, hole, fill = 1) {
  const disc = (col, x0, x1) => {
    if (x1 <= x0) return;
    g.save();
    g.beginPath(); g.rect(x0, cy - r, x1 - x0, r * 2); g.clip();
    g.fillStyle = col;
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    g.restore();
  };
  const lit = Math.max(0, Math.min(1, fill));
  const split = cx - r + r * 2 * lit;
  disc(colour, cx - r, split);
  disc(empty, split, cx + r);
  g.fillStyle = hole;
  g.beginPath(); g.arc(cx, cy, r * 0.225, 0, Math.PI * 2); g.fill();
}

// Wrap `text` to `max` lines at `width`, ellipsing the last line if it overruns.
function shWrap(g, text, width, max) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (g.measureText(t).width <= width) { line = t; continue; }
    if (line) lines.push(line);
    line = w;
    if (lines.length === max) break;
  }
  if (lines.length < max && line) lines.push(line);
  if (lines.length === max && words.length) {
    let last = lines[max - 1];
    if (g.measureText(last).width > width || line !== lines[max - 1]) {
      while (last.length && g.measureText(last + '…').width > width) last = last.slice(0, -1);
      lines[max - 1] = last.replace(/[\s,.]+$/, '') + '…';
    }
  }
  return lines;
}

/* Per-corner rounded rect. The album's bottom-left is SQUARE (it's the step
   junction), so the single-radius helper above can't draw it. */
function shRoundRect4(g, x, y, w, h, r) {
  const [tl, tr, br, bl] = r;
  g.beginPath();
  g.moveTo(x + tl, y);
  g.lineTo(x + w - tr, y);       if (tr) g.arcTo(x + w, y,     x + w, y + tr, tr);
  g.lineTo(x + w, y + h - br);   if (br) g.arcTo(x + w, y + h, x + w - br, y + h, br);
  g.lineTo(x + bl, y + h);       if (bl) g.arcTo(x,     y + h, x,     y + h - bl, bl);
  g.lineTo(x, y + tl);           if (tl) g.arcTo(x,     y,     x + tl, y, tl);
  g.closePath();
}

// Aspect-fill: cover the box, crop the overhang, like `background-size: cover`.
function shCover(g, img, x, y, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  const dw = img.width * s, dh = img.height * s;
  g.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function shLoadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    // Same reason computeAlbumColors sets it: the personas' covers are Deezer
    // CDN URLs, and without CORS the canvas is tainted and toBlob() throws.
    if (/^https?:/i.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* ── the card ───────────────────────────────────────────────
   The COMPACT bento — home's resting state — floating on the album's own
   artwork, blurred out into a wallpaper.

   ⚠️ The bento is a FILLED SILHOUETTE, not a stroked frame. `.v3-master-frame`
   still carries the outlines in screens.js, but app.css paints them
   `transparent`: what you actually see is `.v3-bg-fill`'s **`bg-right`** path
   filled with the procedural `--v3-box1-color`, with the cover, the For-You
   panel, the CD and the live pill sitting on top of it. So this file copies
   that ONE path and re-derives every cell from its app.css percentage of the
   689×638 viewBox — each box below is `left/top/width/height` × 689 or 638.
   Stroking the master frame here drew a hairline the app hasn't shown in
   months.

   ⚠️ There is ONE For-You panel (`.v3-for-single`). The two angled panels the
   old master frame draws belong to a retired layout — putting them on the card
   makes it disagree with the app at a glance.

   ⚠️ Approximating the whole thing with rounded rects gives you a big cover
   with text under it, which reads as the FULLSCREEN album page — that mistake
   was made twice. The stepped shell is what says "bento". */
const BENTO_VB = { w: 689, h: 638 };

// `.v3-bg-fill .bg-right` — the stepped shell, verbatim from screens.js.
// It steps around the For-You column and notches out for the CD and the pill.
const BENTO_SHELL = 'M518.5 0.5H20.5C9.4543 0.5 0.5 9.4543 0.5 20.5V617.5C0.5 628.546 9.4543 637.5 20.5 637.5H518.5C529.546 637.5 538.5 628.546 538.5 617.5V609C538.5 570.34 569.84 539 608.5 539H668.5C679.546 539 688.5 530.046 688.5 519V107.5C688.5 96.4543 679.546 87.5 668.5 87.5H558.5C547.454 87.5 538.5 78.5457 538.5 67.5V20.5C538.5 9.45431 529.546 0.5 518.5 0.5Z';

const BENTO_ALBUM = { x: 0.48, y: 0.51, w: 537.49, h: 534.01, r: 20 }; // bottom-left square
const BENTO_FOR   = { x: 556.99, y: 105.01, w: 112.99, h: 415.02, r: 15 };
const BENTO_STRIP = { x: 0.48, y: 534.52, w: 537.97, h: 102.98 };  // under the cover, inside the shell
const BENTO_CD    = { cx: 615.52, cy: 614.02, r: 55 };
const BENTO_PILL  = { x: 556.51, y: 3.19, w: 132.01, h: 65.01 };

/* app.css sizes the strip's type and the pill's dots in PHONE px, everything
   else in % of the viewBox. At the 385px mockup the bento is 365px wide, so
   one px is 689/365 units — that constant converts the two systems. */
const U = 689 / 365;

/* The cover, blurred into a wallpaper. Downscale-then-upscale rather than
   `ctx.filter = 'blur()'`: the filter property is the obvious way and it's the
   one iOS Safari shipped last, and a card that silently renders the cover
   SHARP and full-bleed is worse than one with no wallpaper at all. Going
   through a 48px canvas blurs on every engine; the filter, where it exists,
   only smooths what is already soft. */
function shWallpaper(g, img) {
  const small = document.createElement('canvas');
  small.width = 48; small.height = 60;                  // the card's own 4:5
  const sg = small.getContext('2d');
  sg.imageSmoothingQuality = 'high';
  shCover(sg, img, 0, 0, 48, 60);

  g.save();
  g.imageSmoothingQuality = 'high';
  try { g.filter = 'blur(30px)'; } catch (e) { /* pre-17 Safari: the downscale carries it */ }
  // Overdraw the edges — a blur samples past them and would otherwise fade out.
  const o = 0.12;
  g.drawImage(small, -SHARE_W * o, -SHARE_H * o, SHARE_W * (1 + o * 2), SHARE_H * (1 + o * 2));
  g.restore();

  // Scrim: flat knock-down, then a vertical ramp so the review type below the
  // bento always has something dark under it whatever the cover looks like.
  g.fillStyle = 'rgba(17,17,22,0.55)';
  g.fillRect(0, 0, SHARE_W, SHARE_H);
  const ramp = g.createLinearGradient(0, 0, 0, SHARE_H);
  ramp.addColorStop(0,    'rgba(17,17,22,0.30)');
  ramp.addColorStop(0.45, 'rgba(17,17,22,0.45)');
  ramp.addColorStop(1,    'rgba(17,17,22,0.90)');
  g.fillStyle = ramp;
  g.fillRect(0, 0, SHARE_W, SHARE_H);
}

async function buildShareCard(album, review) {
  const cv = document.createElement('canvas');
  cv.width = SHARE_W; cv.height = SHARE_H;
  const g = cv.getContext('2d');

  const cols  = (await computeAlbumColors(album.image)) || {};
  const gold  = cols.star || cols.accent || '#e8a83c';
  /* ⚠️ `box1color`, NOT `box1`. `box1` is a `linear-gradient(…)` STRING — it's
     what `--v3-box1-bg` takes — and canvas silently ignores an unparseable
     fillStyle, so every fill using it kept whatever colour was set last. The
     shell wants the solid `--v3-box1-color` anyway; that's `box1color`. */
  const box1  = cols.box1color || '#2a2520';
  const ink   = 'rgba(232,226,214,0.88)';   // .v3-blue-album, compact
  const dim   = 'rgba(232,226,214,0.55)';   // .v3-blue-artist, compact
  const faint = 'rgba(232,226,214,0.35)';
  // ⚠️ NOT a faint grey — `.s-home-v3` sets --vinyl-empty to near-white, so an
  // unlit disc reads as part of the rating rather than as background texture.
  const empty = 'rgba(255,255,255,0.85)';
  const MAIN  = "'DM Sans', system-ui, sans-serif";
  const MONO  = "'SUSE Mono', 'Courier New', monospace";

  /* Art first — the background IS the cover, so nothing can be painted under it. */
  const cover = await shLoadImage(album.image);
  const seq   = (typeof albumSeq === 'function' ? albumSeq() : []) || [];
  const next  = seq.filter(a => a && a.album !== album.album)[0] || null;
  const nextA = next ? await shLoadImage(next.image) : null;

  g.fillStyle = '#111116';
  g.fillRect(0, 0, SHARE_W, SHARE_H);
  if (cover) shWallpaper(g, cover);

  /* Measure what goes UNDER the bento first, then give the bento whatever room
     is left — a fixed size either left a void above the breakdown or ran the
     tracklist off the bottom of the card. The type column is independent of
     the bento's width so the wrap doesn't move when the bento resizes. */
  const TW = 900, M = (SHARE_W - TW) / 2;
  const FOOT_Y = SHARE_H - 56, TOP = 70, BOTTOM = FOOT_Y - 86;
  const GAP1 = 58, GAP2 = 54, REV_LH = 42, BD_ROW = 38;
  g.font = 'italic 400 30px ' + MAIN;
  const revLines = (review.text || '').trim() ? shWrap(g, review.text.trim(), TW, 3) : [];
  const songs = (review.songs || []).filter(x => x && x.rating > 0).slice(0, 5);
  const revH = revLines.length * REV_LH;
  const bdH  = songs.length ? 28 + songs.length * BD_ROW : 0;
  const below = (revH ? GAP1 + revH : 0) + (bdH ? GAP2 + bdH : 0);

  const ar = BENTO_VB.h / BENTO_VB.w;
  const BH = Math.max(700 * ar, Math.min(940 * ar, BOTTOM - TOP - below));
  const BW = BH / ar, BX = (SHARE_W - BW) / 2;
  const K  = BW / BENTO_VB.w;                    // one SVG unit → card px
  const PH = BW / 365;                           // one PHONE px → card px
  const BY = TOP + Math.max(0, (BOTTOM - TOP - (BH + below)) / 2);

  // Everything bento-shaped is drawn in SVG units inside this transform.
  g.save();
  g.translate(BX, BY);
  g.scale(K, K);

  /* The shell, floating on the wallpaper. `.v3-bg-fill` casts two drop-shadows
     sized in phone px, so they scale with the bento.
     ⚠️ shadowBlur/shadowOffset are NOT transformed — they're device px — so
     these use PH (phone px → card px), never the unit scale K. */
  const shell = new Path2D(BENTO_SHELL);
  g.save();
  g.fillStyle = box1;
  g.shadowColor = 'rgba(0,0,0,0.5)';
  g.shadowBlur = 14 * PH; g.shadowOffsetY = 6 * PH;
  g.fill(shell);
  g.shadowColor = 'rgba(0,0,0,0.55)';
  g.shadowBlur = 34 * PH; g.shadowOffsetY = 16 * PH;
  g.fill(shell);
  g.restore();

  // Cover — bottom-left corner SQUARE, it's the step junction (`.v3-album`)
  const A = BENTO_ALBUM;
  g.save();
  shRoundRect4(g, A.x, A.y, A.w, A.h, [A.r, A.r, A.r, 0]);
  g.clip();
  g.fillStyle = box1; g.fillRect(A.x, A.y, A.w, A.h);
  if (cover) shCover(g, cover, A.x, A.y, A.w, A.h);
  g.restore();

  // For You — ONE panel, showing what's up next (`.v3-for-single`)
  const F = BENTO_FOR;
  g.save();
  shRoundRect(g, F.x, F.y, F.w, F.h, F.r);
  g.clip();
  g.fillStyle = '#2a2520'; g.fillRect(F.x, F.y, F.w, F.h);
  if (nextA) shCover(g, nextA, F.x, F.y, F.w, F.h);
  g.restore();
  g.save();                                  // `::after`'s inset emboss, as a hairline
  shRoundRect(g, F.x + 1, F.y + 1, F.w - 2, F.h - 2, F.r);
  g.strokeStyle = 'rgba(255,255,255,0.07)';
  g.lineWidth = 2; g.stroke();
  g.restore();

  // CD — sits in the shell's bottom-right notch, so it's over the wallpaper
  const C = BENTO_CD;
  g.save();
  g.fillStyle = box1;
  g.shadowColor = 'rgba(0,0,0,0.32)';
  g.shadowBlur = 12 * PH; g.shadowOffsetY = 4 * PH;
  g.beginPath(); g.arc(C.cx, C.cy, C.r, 0, Math.PI * 2); g.fill();
  g.restore();
  g.save();
  g.beginPath(); g.arc(C.cx, C.cy, C.r, 0, Math.PI * 2); g.clip();
  if (cover) shCover(g, cover, C.cx - C.r, C.cy - C.r, C.r * 2, C.r * 2);
  g.restore();
  g.fillStyle = '#111116';                   // `.v3-cd-hole` — 10 phone px
  g.beginPath(); g.arc(C.cx, C.cy, 5 * U, 0, Math.PI * 2); g.fill();

  /* The live pill. In the app it's filled with the SCREEN colour, because it's
     a hole in the shell — but here the screen is the wallpaper, so it takes the
     shell's own fill and the bento reads as one object instead of a panel with
     a bite out of its corner. The dots are `.v3-ring`'s idle ARROW formation
     (six 3px dots pointing left); the offsets are app.css's, in phone px. */
  const PI = BENTO_PILL;
  g.fillStyle = box1;
  shRoundRect(g, PI.x, PI.y, PI.w, PI.h, PI.h / 2);
  g.fill();
  const rx = PI.x + PI.w / 2, ry = PI.y + PI.h / 2 + 2 * U;   // the ring sits 2px low in the pill
  g.fillStyle = 'rgba(232,226,214,0.92)';
  [[5, 0], [1, 0], [-3, 0], [-7, 0], [-5, -4], [-5, 4]].forEach(function (d) {
    g.beginPath();
    g.arc(rx + d[0] * U, ry + d[1] * U, 1.5 * U, 0, Math.PI * 2);
    g.fill();
  });

  /* The stats strip, inside the shell under the cover.
     ⚠️ The compact bento runs the weights the OTHER WAY to the rest of the app:
     album 700 leading, artist 400 receding (`.s-home-v3:not(--review)
     .v3-blue-album`). Type is sized in phone px, like the stylesheet. */
  const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));
  const S = BENTO_STRIP, padX = S.x + 12 * U;
  const f1 = 10.5 * U, f2 = 13 * U, f3 = 9.5 * U;
  const top = S.y + (S.h - (f1 + 3 * U + f2)) / 2;
  const y1  = top + f1 * 0.80;
  const y2  = top + f1 + 3 * U + f2 * 0.80;
  const SEP = '  ·  ';

  g.textBaseline = 'alphabetic';
  let tx = padX;
  g.font = '700 ' + f1.toFixed(2) + 'px ' + MAIN;
  g.fillStyle = ink;
  g.fillText(album.album, tx, y1);
  tx += g.measureText(album.album).width;
  g.font = '400 ' + f1.toFixed(2) + 'px ' + MAIN;
  g.fillStyle = 'rgba(232,226,214,0.22)';
  g.fillText(SEP, tx, y1);
  tx += g.measureText(SEP).width;
  g.fillStyle = dim;
  g.fillText(album.artist, tx, y1);
  if (album.year) {
    tx += g.measureText(album.artist).width;
    g.fillStyle = 'rgba(232,226,214,0.42)';
    g.fillText(SEP + album.year, tx, y1);
  }

  g.font = '800 ' + f2.toFixed(2) + 'px ' + MAIN;
  g.fillStyle = 'rgba(232,226,214,0.82)';
  const scoreTxt = rating ? rating.toFixed(1) : '—';
  g.fillText(scoreTxt, padX, y2);
  // `.hstar` is a 12px box, `.hstars` gaps 2px, and the disc fills 91% of the box
  const vr = 6 * U * 0.91, vstep = 12 * U + 2 * U;
  let vx = padX + g.measureText(scoreTxt).width + 7 * U + 6 * U;
  for (let i = 0; i < 5; i++) {
    shVinyl(g, vx, y2 - f2 * 0.30, vr, gold, empty, box1, rating - i);
    vx += vstep;
  }
  g.font = '400 ' + f3.toFixed(2) + 'px ' + MONO;
  g.fillStyle = faint;
  g.fillText('your rating', vx - vstep + 13 * U, y2);   // past the last disc's edge

  g.restore();

  // Review, flowing out of the bento
  let flow = BY + BH;
  if (revLines.length) {
    flow += GAP1;
    g.font = 'italic 400 30px ' + MAIN;
    g.fillStyle = 'rgba(232,226,214,0.82)';
    revLines.forEach(function (ln, i) {
      const open  = i === 0 ? '“' : '';
      const close = i === revLines.length - 1 ? '”' : '';
      g.fillText(open + ln + close, M, flow + i * REV_LH);
    });
    flow += revH;
  }

  // Typographic breakdown of the tracks you actually scored
  if (songs.length) {
    const BD_Y = flow + GAP2;
    g.font = '400 18px ' + MONO;
    g.fillStyle = faint;
    g.letterSpacing = '3px';
    g.fillText('YOUR BREAKDOWN', M, BD_Y);
    g.letterSpacing = '0px';
    songs.forEach(function (sg, i) {
      const ry = BD_Y + 28 + i * BD_ROW;
      const sc = sg.rating.toFixed(1);
      g.font = '400 24px ' + MONO;
      const tw = g.measureText(sg.title).width, scW = g.measureText(sc).width;
      g.fillStyle = ink;
      g.fillText(sg.title, M, ry);
      g.fillStyle = gold;
      g.textAlign = 'right';
      g.fillText(sc, M + TW, ry);
      g.textAlign = 'left';
      const gap = TW - tw - scW - 20;
      if (gap > 12) {
        const dot = g.measureText('·').width || 6;
        g.fillStyle = 'rgba(232,226,214,0.20)';
        g.fillText('·'.repeat(Math.floor(gap / dot)), M + tw + 10, ry);
      }
    });
  }

  // Footer
  const P = window.PROFILE || {};
  g.font = '400 24px ' + MONO;
  g.fillStyle = dim;
  g.fillText('@' + (P.handle || 'you'), M, FOOT_Y);
  g.font = '800 24px ' + MAIN;
  g.fillStyle = gold;
  g.textAlign = 'right';
  g.letterSpacing = '3px';
  g.fillText('SPINDECK', SHARE_W - M, FOOT_Y);
  g.textAlign = 'left';
  g.letterSpacing = '0px';

  return cv;
}

/* ── the sheet ──────────────────────────────────────────────── */
function ensureShareSheet() {
  let ov = document.getElementById('sd-share');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'sd-share';
  ov.className = 'sd-log-overlay sd-share-overlay';
  ov.innerHTML = `
    <div class="sd-log-sheet sd-share-sheet" role="dialog" aria-modal="true">
      <div class="sd-log-grab"></div>
      <div class="sd-log-head">
        <div class="sd-log-meta">
          <div class="sd-log-album">Share to Instagram</div>
          <div class="sd-log-artist sd-share-sub"></div>
        </div>
        <button class="sd-log-x" aria-label="Close">✕</button>
      </div>
      <div class="sd-share-preview"><canvas></canvas></div>
      <div class="sd-share-foot">
        <button class="sd-share-save">Save image</button>
        <button class="sd-share-go">Share</button>
      </div>
      <div class="sd-share-note"></div>
    </div>`;
  ov.addEventListener('click', e => { e.stopPropagation(); if (e.target === ov) closeShareSheet(); });
  ov.querySelector('.sd-log-sheet').addEventListener('click', e => e.stopPropagation());
  ov.querySelector('.sd-log-x').addEventListener('click', closeShareSheet);
  ov.querySelector('.sd-share-save').addEventListener('click', () => shareSave(ov));
  ov.querySelector('.sd-share-go').addEventListener('click', () => shareNow(ov));
  return ov;
}
window.closeShareSheet = function () {
  const ov = document.getElementById('sd-share');
  if (ov) ov.classList.remove('open');
};

function shareFilename(album) {
  return 'spindeck-' + String(album.album || 'album').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.png';
}

window.openShareSheet = async function (triggerEl, album, review) {
  if (!album) return;
  const host = (triggerEl && triggerEl.closest && triggerEl.closest('.app-screen'))
             || document.querySelector('.app-screen') || document.body;
  const ov = ensureShareSheet();
  host.appendChild(ov);
  ov.querySelector('.sd-share-sub').textContent = album.album + ' · ' + album.artist;
  const note = ov.querySelector('.sd-share-note');
  note.textContent = 'Building your post…';
  requestAnimationFrame(() => ov.classList.add('open'));

  const cv = await buildShareCard(album, review || {});
  const shown = ov.querySelector('.sd-share-preview canvas');
  shown.width = cv.width; shown.height = cv.height;
  shown.getContext('2d').drawImage(cv, 0, 0);

  /* The blob is made HERE, not on the Share click. Safari drops the user-gesture
     that navigator.share requires if you await anything first, so the click
     handler has to find the file already waiting. */
  ov._file = null;
  try {
    const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
    if (blob) ov._file = new File([blob], shareFilename(album), { type: 'image/png' });
  } catch (e) { /* tainted canvas — save/share stay disabled below */ }

  const canShare = !!(ov._file && navigator.canShare && navigator.canShare({ files: [ov._file] }));
  ov.querySelector('.sd-share-go').disabled = !canShare;
  ov.querySelector('.sd-share-save').disabled = !ov._file;
  note.textContent = !ov._file
    ? "Couldn't build the image — the cover blocked the canvas read."
    : canShare
      ? 'Opens your phone’s share sheet — pick Instagram there.'
      : 'This browser can’t share files. Save the image, then post it.';
};

function shareNow(ov) {
  if (!ov._file) return;
  navigator.share({ files: [ov._file], title: 'Spindeck' }).catch(() => {});
}
function shareSave(ov) {
  if (!ov._file) return;
  const url = URL.createObjectURL(ov._file);
  const a = document.createElement('a');
  a.href = url; a.download = ov._file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Resolve the album + your saved draft behind a share button, wherever it sits. */
window.shareMyReview = function (btn, albumName) {
  const arch = window.ARCHIVE || [];
  const scr = btn && btn.closest('.s-home-v3');
  const album = (albumName && arch.find(a => a.album === albumName))
             || (window.shellAlbum ? shellAlbum(scr) : null);
  if (!album) return;
  const d = (window.albumDraft && albumDraft(album)) || {};
  openShareSheet(btn, album, { rating: d.rating || 0, text: d.text || '', songs: d.songs || [] });
};
