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
  const scoreH = review.rating ? 96 : 0;         // the big score row (2026-09-11) — see below
  const below = scoreH + (revH ? GAP1 + revH : 0) + (bdH ? GAP2 + bdH : 0);

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
  // ⚠️ These are the compact bento's app.css px — album/artist, score, count —
  // with the dev box's row scales FOLDED IN, because the card has no transform
  // to inherit them from: 10.5 × 1.13, and 13 / 9.5 × 1.12. Re-tune the rows and
  // these have to be re-multiplied, or the card stops being a picture of the app.
  const f1 = 11.9 * U, f2 = 14.5 * U, f3 = 10.5 * U;
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

  // MAIN, not MONO — the score is the headline and the count beside it is
  // metadata; see the note on `.v3-blue-score` in app.css for why they differ.
  g.font = '800 ' + f2.toFixed(2) + 'px ' + MAIN;
  g.fillStyle = 'rgba(232,226,214,0.82)';
  const scoreTxt = rating ? rating.toFixed(1) : '—';
  g.fillText(scoreTxt, padX, y2);
  // `.hstar` is a 10px box × the row's 1.12 scale, `.hstars` gaps 2px, and the
  // disc fills 91% of the box. The 8 is `.v3-blue-stars-row`'s 7px gap scaled;
  // 5.5 is half a box.
  const vr = 5.5 * U * 0.91, vstep = 11 * U + 2 * U;
  let vx = padX + g.measureText(scoreTxt).width + 8 * U + 5.5 * U;
  for (let i = 0; i < 5; i++) {
    shVinyl(g, vx, y2 - f2 * 0.30, vr, gold, empty, box1, rating - i);
    vx += vstep;
  }
  g.font = '400 ' + f3.toFixed(2) + 'px ' + MONO;
  g.fillStyle = faint;
  g.fillText(review.by ? '@' + review.by : 'your rating', vx - vstep + 12 * U, y2);   // past the last disc's edge (5.5 + 6.5)

  g.restore();

  let flow = BY + BH;

  /* THE SCORE, big, between the bento and the review (2026-09-11). The strip
     inside the bento already prints it, but at bento scale it is a footnote —
     and the score is the thing a shared review is for. Same shape as the album
     page's headline: the number at 800, the records on its baseline. */
  if (review.rating) {
    flow += 72;
    const sTxt = review.rating.toFixed(1);
    g.font = '800 72px ' + MAIN;
    g.fillStyle = 'rgba(232,226,214,0.94)';
    g.fillText(sTxt, M, flow);
    let vx = M + g.measureText(sTxt).width + 30 + 15;
    for (let i = 0; i < 5; i++) { shVinyl(g, vx, flow - 24, 15, gold, empty, '#111116', review.rating - i); vx += 37; }
    g.font = '400 19px ' + MONO;
    g.fillStyle = faint;
    g.letterSpacing = '3px';
    g.fillText(review.by ? ('@' + review.by).toUpperCase() : 'MY RATING', vx - 37 + 26, flow - 2);
    g.letterSpacing = '0px';
    flow += 24;
  }

  // Review, flowing out of the bento
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
  g.fillText('@' + (review.by || P.handle || 'you'), M, FOOT_Y);
  g.font = '800 24px ' + MAIN;
  g.fillStyle = gold;
  g.textAlign = 'right';
  g.letterSpacing = '3px';
  g.fillText('SPINDECK', SHARE_W - M, FOOT_Y);
  g.textAlign = 'left';
  g.letterSpacing = '0px';

  return cv;
}

/* ═══ SHARE — one button, one sheet, several things to share ══════════════
   `shareBtnHtml(kind, arg)` is the ONE share control, compact enough to sit
   anywhere (a 28px round icon), and `sdShare(btn)` turns its kind into a JOB —
   { title, sub, build(), text, url, file } — that the sheet renders. Adding a
   place to share from is one `shareBtnHtml` call; adding a KIND is one branch
   in `shareJob` and one card builder.

   Kinds today: `review` (your draft on an album — the arg is the album name,
   or blank for the shell's album), `playlist` (arg: the playlist's name),
   `favs` (the profile's five favourite albums; no arg).

   The sheet is 95% tall like the log sheet: the card large on top, then the
   apps (Instagram · X · Messages · Copy link · Save image), then the TEXT
   version of the same thing with Copy / Text it — so a review can go out as a
   picture, as a link, or as words. ⚠️ Every app button is a real gesture:
   `navigator.share` where the browser has it (that is where Instagram lives —
   the OS sheet), intent URLs where it doesn't, the clipboard for links and
   text, `sms:` for a message. Nothing here pretends to post. */
const SHARE_URL = 'https://joo-k.github.io/CSHARP-eric/';
const SHARE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v11"/><path d="m7.5 8 4.5-4.5L16.5 8"/><path d="M5 13.5v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg>';
const SHARE_APPS = {
  ig:   { label: 'Instagram', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>' },
  x:    { label: 'X',         svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M4.5 4.5 19.5 19.5"/><path d="M19.5 4.5 4.5 19.5"/></svg>' },
  sms:  { label: 'Messages',  svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.6a8 8 0 0 1-8.6 8 9 9 0 0 1-3.2-.6L3.5 20.5l1.7-4.4a7.9 7.9 0 0 1-1.7-4.5 8 8 0 0 1 8.6-8 8 8 0 0 1 8.4 8Z"/></svg>' },
  link: { label: 'Copy link', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/></svg>' },
  copytext: { label: 'Copy text', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>' },
  save: { label: 'Save image', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M5 18.5h14"/></svg>' },
};

window.shareBtnHtml = function (kind, arg, cls) {
  const a = String(arg == null ? '' : arg).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<button class="sd-share-btn${cls ? ' ' + cls : ''}" type="button" title="Share" aria-label="Share"
    data-kind="${kind}" data-arg="${a}" onclick="event.stopPropagation(); sdShare(this)">${SHARE_ICON}</button>`;
};

function shareSlug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function shareLink(kind, id) { return SHARE_URL + '#' + kind + '=' + encodeURIComponent(shareSlug(id)); }
function shareFilename(album) { return 'spindeck-' + shareSlug(album && album.album || album || 'card') + '.png'; }
function shareStars(r) { const f = Math.floor(r || 0), h = (r || 0) - f >= 0.5; return '●'.repeat(f) + (h ? '◐' : '') + '○'.repeat(5 - f - (h ? 1 : 0)); }

/* A job per kind. `text` is the words-only version; `build` paints the card. */
function shareJob(kind, arg, btn) {
  const P = window.PROFILE || {};
  const handle = '@' + (P.handle || 'you');
  if (kind === 'review') {
    const arch = window.ARCHIVE || [];
    const scr = btn && btn.closest && btn.closest('.s-home-v3');
    const album = (arg && arch.find(a => a.album === arg)) || (window.shellAlbum ? shellAlbum(scr) : null);
    if (!album) return null;
    const d = (window.albumDraft && albumDraft(album)) || {};
    return shareJobReview(album, { rating: d.rating || 0, text: d.text || '', songs: d.songs || [] });
  }
  if (kind === 'rev') {
    // The review page's own card: the REVIEW as it looks there (photo, name,
    // score, the words), not the bento — see buildReviewCard.
    const R = (typeof REV_INDEX !== 'undefined') && REV_INDEX[arg];
    if (!R || !R.album) return null;
    const P = window.PROFILE || {};
    const handle = R.handle || (R.mine ? (P.handle || 'you') : shareSlug(R.name).replace(/-/g, '_'));
    const job = shareJobReview(R.album, { rating: R.rating || 0, text: R.text || '', songs: [], by: R.mine ? '' : handle });
    job.build = () => buildReviewCard(R, handle);
    if (!R.mine) job.title = 'Share ' + R.name + "'s review";
    return job;
  }
  if (kind === 'playlist') {
    const pl = (typeof plLists === 'function' ? plLists() : []).find(l => l.name === arg || l.key === arg);
    if (!pl) return null;
    const tracks = (typeof plTracksFor === 'function' ? plTracksFor(pl) : []).slice(0, 6);
    return {
      title: 'Share playlist', sub: pl.name + ' · ' + pl.tracks + ' songs',
      build: () => buildPlaylistCard(pl, tracks),
      text: pl.name + ' — ' + pl.tracks + ' songs by ' + (pl.creator === 'you' ? handle : pl.creator) + ' on Spindeck',
      url: shareLink('playlist', pl.name), file: 'spindeck-playlist-' + shareSlug(pl.name) + '.png',
    };
  }
  if (kind === 'favs') {
    const arch = window.ARCHIVE || [];
    const favs = (P.favs || []).map(n => arch.find(a => a.album === n)).filter(Boolean);
    if (!favs.length) return null;
    return {
      title: 'Share favourites', sub: handle + ' · ' + favs.length + ' albums',
      build: () => buildFavsCard(P, favs),
      text: handle + "'s favourite albums on Spindeck: " + favs.map(a => a.album + ' by ' + a.artist).join(' · '),
      url: shareLink('profile', P.handle || 'you'), file: 'spindeck-favourites-' + shareSlug(P.handle) + '.png',
    };
  }
  return null;
}
function shareJobReview(album, review) {
  const P = window.PROFILE || {};
  const who = review.by || P.handle || 'you';                 // whose review this is
  const r = review.rating ? review.rating.toFixed(1).replace(/\.0$/, '') + '/5 ' + shareStars(review.rating) : '';
  const quote = (review.text || '').trim() ? '“' + review.text.trim() + '” — ' : '';
  return {
    title: 'Share your review', sub: album.album + ' · ' + album.artist,
    build: () => buildShareCard(album, review),
    text: quote + (r ? r + ' for ' : 'On ') + album.album + ' by ' + album.artist + ' · @' + who + ' on Spindeck',
    url: shareLink('review', who + '/' + album.album), file: shareFilename(album),
  };
}

window.sdShare = function (btn) {
  const job = shareJob(btn.dataset.kind, btn.dataset.arg, btn);
  if (job) openShareSheet(btn, job);
};

/* ── the review card: the page's hero, as a picture ─────────────
   Photo · name / @handle on the left, the score big with the records under
   it on the right, the words at reading size, and the record named at the
   foot — on the album's wallpaper. What you see on the review page is what
   goes out. */
async function buildReviewCard(R, handle) {
  const MAIN = "'DM Sans', system-ui, sans-serif", MONO = "'SUSE Mono', 'Courier New', monospace";
  const a = R.album || {};
  const { cv, g, img, gold } = await shBase(a.image);
  const P = window.PROFILE || {};
  const faceSrc = R.mine ? (P.pic || 'images/rp-01.jpg') : (R.pic || (typeof feedFace === 'function' ? feedFace(R.name) : ''));
  const face = faceSrc ? await shLoadImage(faceSrc) : null;
  const M = 90, ink = 'rgba(232,226,214,0.94)', dim = 'rgba(232,226,214,0.55)', empty = 'rgba(255,255,255,0.85)';
  // photo
  const FR = 66, FX = M + FR, FY = 150 + FR;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 26; g.shadowOffsetY = 10;
  g.fillStyle = '#333'; g.beginPath(); g.arc(FX, FY, FR, 0, Math.PI * 2); g.fill(); g.restore();
  if (face) { g.save(); g.beginPath(); g.arc(FX, FY, FR, 0, Math.PI * 2); g.clip(); shCover(g, face, FX - FR, FY - FR, FR * 2, FR * 2); g.restore(); }
  // name / handle
  g.textAlign = 'left';
  g.font = '800 46px ' + MAIN; g.fillStyle = ink;
  g.fillText(shWrap(g, R.name || 'Listener', 520, 1)[0] || '', M + FR * 2 + 28, FY - 6);
  g.font = '400 24px ' + MONO; g.fillStyle = dim;
  g.fillText('@' + handle + (R.ago ? '  ·  ' + R.ago : ''), M + FR * 2 + 28, FY + 34);
  // score, right
  const rating = R.rating || 0;
  g.textAlign = 'right';
  g.font = '800 112px ' + MAIN; g.fillStyle = ink;
  g.fillText(rating.toFixed(1), SHARE_W - M, FY + 22);
  const vr = 15, vstep = 38;
  let vx = SHARE_W - M - vr;
  for (let i = 4; i >= 0; i--) { shVinyl(g, vx, FY + 62, vr, gold, empty, '#111116', rating - i); vx -= vstep; }
  g.textAlign = 'left';
  // the words
  g.font = '400 36px ' + MAIN; g.fillStyle = 'rgba(232,226,214,0.9)';
  const lines = shWrap(g, R.text || '', SHARE_W - M * 2, 16);
  let y = FY + FR + 96;
  lines.forEach(ln => { g.fillText(ln, M, y); y += 50; });
  // the record, named — under the words, not pinned to the foot
  const RY = Math.min(SHARE_H - 200, y + 40), C = 96;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 22; g.shadowOffsetY = 8;
  shRoundRect(g, M, RY, C, C, 14); g.fillStyle = '#222'; g.fill(); g.restore();
  if (img) { g.save(); shRoundRect(g, M, RY, C, C, 14); g.clip(); shCover(g, img, M, RY, C, C); g.restore(); }
  g.font = '700 30px ' + MAIN; g.fillStyle = ink;
  g.fillText(shWrap(g, a.album || '', 760, 1)[0] || '', M + C + 24, RY + 40);
  g.font = '400 26px ' + MAIN; g.fillStyle = dim;
  g.fillText(shWrap(g, (a.artist || '') + (a.year ? '  ·  ' + a.year : ''), 760, 1)[0] || '', M + C + 24, RY + 78);
  shFooter(g, MAIN, MONO, gold, handle);
  return cv;
}

/* ── the two other cards ────────────────────────────────────── */
function shFooter(g, MAIN, MONO, gold, handle) {
  const P = window.PROFILE || {};
  const M = 90, FOOT_Y = SHARE_H - 56;
  g.font = '400 24px ' + MONO; g.fillStyle = 'rgba(232,226,214,0.55)'; g.textAlign = 'left';
  g.fillText('@' + (handle || P.handle || 'you'), M, FOOT_Y);   // whose card this is
  g.font = '800 24px ' + MAIN; g.fillStyle = gold; g.textAlign = 'right'; g.letterSpacing = '3px';
  g.fillText('SPINDECK', SHARE_W - M, FOOT_Y);
  g.textAlign = 'left'; g.letterSpacing = '0px';
}
async function shBase(imgSrc) {
  const cv = document.createElement('canvas');
  cv.width = SHARE_W; cv.height = SHARE_H;
  const g = cv.getContext('2d');
  const img = imgSrc ? await shLoadImage(imgSrc) : null;
  const cols = (imgSrc && (await computeAlbumColors(imgSrc))) || {};
  g.fillStyle = '#111116'; g.fillRect(0, 0, SHARE_W, SHARE_H);
  if (img) shWallpaper(g, img);
  return { cv, g, img, gold: cols.star || cols.accent || '#e8a83c' };
}
/* Playlist: the cover big and square, the name under it, then the first
   tracks as a typographic list — the playlist card's own hierarchy. */
async function buildPlaylistCard(pl, tracks) {
  const MAIN = "'DM Sans', system-ui, sans-serif", MONO = "'SUSE Mono', 'Courier New', monospace";
  // A moving cover (mp4) cannot be drawn; fall back to the first track's art.
  const src = (typeof plIsVideo === 'function' && plIsVideo(pl.image)) ? (tracks[0] && tracks[0].image) : pl.image;
  const { cv, g, img, gold } = await shBase(src);
  const S = 640, X = (SHARE_W - S) / 2, Y = 110;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 60; g.shadowOffsetY = 24;
  shRoundRect(g, X, Y, S, S, 28); g.fillStyle = '#222'; g.fill(); g.restore();
  if (img) { g.save(); shRoundRect(g, X, Y, S, S, 28); g.clip(); shCover(g, img, X, Y, S, S); g.restore(); }
  let y = Y + S + 92;
  g.textAlign = 'center';
  g.font = '800 54px ' + MAIN; g.fillStyle = 'rgba(232,226,214,0.94)';
  const nm = shWrap(g, pl.name, 900, 2);
  nm.forEach((ln, i) => g.fillText(ln, SHARE_W / 2, y + i * 62));
  y += nm.length * 62 + 10;
  g.font = '400 24px ' + MONO; g.fillStyle = 'rgba(232,226,214,0.5)';
  g.fillText(pl.tracks + ' SONGS  ·  BY ' + String(pl.creator === 'you' ? '@' + ((window.PROFILE || {}).handle || 'you') : pl.creator).toUpperCase(), SHARE_W / 2, y);
  g.textAlign = 'left';
  y += 70;
  tracks.forEach((t, i) => {
    const ry = y + i * 44;
    g.font = '400 26px ' + MONO; g.fillStyle = 'rgba(232,226,214,0.35)';
    g.fillText(String(i + 1).padStart(2, '0'), 90, ry);
    g.font = '700 26px ' + MAIN; g.fillStyle = 'rgba(232,226,214,0.9)';
    const title = shWrap(g, t.title, 560, 1)[0] || '';
    g.fillText(title, 150, ry);
    g.font = '400 24px ' + MAIN; g.fillStyle = 'rgba(232,226,214,0.5)';
    g.textAlign = 'right'; g.fillText(shWrap(g, t.artist || '', 300, 1)[0] || '', SHARE_W - 90, ry); g.textAlign = 'left';
  });
  shFooter(g, MAIN, MONO, gold);
  return cv;
}
/* Favourites: the five records as CDs on a ring around the handle — the
   profile's own wheel, flattened onto a card — clockwise from the top, and
   the same five named in that order beneath. */
async function buildFavsCard(P, favs) {
  const MAIN = "'DM Sans', system-ui, sans-serif", MONO = "'SUSE Mono', 'Courier New', monospace";
  const { cv, g, gold } = await shBase(favs[0] && favs[0].image);
  const CX = SHARE_W / 2, CY = 470, RING = 262, R = 104;
  const imgs = await Promise.all(favs.map(a => shLoadImage(a.image)));
  favs.forEach((a, i) => {
    const ang = -Math.PI / 2 + i * (Math.PI * 2 / favs.length);
    const x = CX + Math.cos(ang) * RING, y = CY + Math.sin(ang) * RING;
    // disc: shadow, cover clipped to the circle, then the label hole
    g.save(); g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 34; g.shadowOffsetY = 14;
    g.fillStyle = '#222'; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill(); g.restore();
    if (imgs[i]) { g.save(); g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.clip(); shCover(g, imgs[i], x - R, y - R, R * 2, R * 2); g.restore(); }
    g.fillStyle = 'rgba(17,17,22,0.92)'; g.beginPath(); g.arc(x, y, R * 0.19, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, R * 0.19, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, R - 1, 0, Math.PI * 2); g.stroke();
    // the order, small, at the disc's foot
    g.font = '700 22px ' + MONO; g.fillStyle = 'rgba(232,226,214,0.55)'; g.textAlign = 'center';
    g.fillText(String(i + 1), x, y + R + 34); g.textAlign = 'left';
  });
  // the handle in the middle of the ring
  g.textAlign = 'center';
  g.font = '800 40px ' + MAIN; g.fillStyle = 'rgba(232,226,214,0.94)';
  g.fillText('@' + (P.handle || 'you'), CX, CY + 4);
  g.font = '400 19px ' + MONO; g.fillStyle = 'rgba(232,226,214,0.45)'; g.letterSpacing = '4px';
  g.fillText('FAVOURITE ALBUMS', CX, CY + 40);
  g.letterSpacing = '0px'; g.textAlign = 'left';
  // the five, named, in ring order
  const y0 = CY + RING + R + 110, ROW = 62, M = 110;
  favs.forEach((a, i) => {
    const y = y0 + i * ROW;
    g.font = '700 24px ' + MONO; g.fillStyle = 'rgba(232,226,214,0.35)';
    g.fillText(String(i + 1), M, y);
    g.font = '700 30px ' + MAIN; g.fillStyle = 'rgba(232,226,214,0.92)';
    const alb = shWrap(g, a.album, 520, 1)[0] || '';
    g.fillText(alb, M + 46, y);
    g.font = '400 26px ' + MAIN; g.fillStyle = 'rgba(232,226,214,0.55)';
    g.textAlign = 'right'; g.fillText(shWrap(g, a.artist + (a.year ? '  ·  ' + a.year : ''), 360, 1)[0] || '', SHARE_W - M, y); g.textAlign = 'left';
  });
  shFooter(g, MAIN, MONO, gold);
  return cv;
}
/* ── the sheet ──────────────────────────────────────────────── */
function ensureShareSheet() {
  let ov = document.getElementById('sd-share');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'sd-share';
  ov.className = 'sd-log-overlay sd-share-overlay';
  const apps = Object.keys(SHARE_APPS).map(k => `
        <button class="sd-share-app" type="button" data-app="${k}">${SHARE_APPS[k].svg}<span>${SHARE_APPS[k].label}</span></button>`).join('');
  /* The card, as large as the sheet allows, and the buttons at the bottom —
     nothing else (2026-09-11: the title, the "share to / as text" labels and
     the text block came out; the words are still what Copy text / Messages
     send). The note is a toast OVER the card, so it costs no height. */
  ov.innerHTML = `
    <div class="sd-log-sheet sd-share-sheet" role="dialog" aria-modal="true">
      <div class="sd-log-grab"></div>
      <button class="sd-log-x sd-share-x" aria-label="Close">✕</button>
      <div class="sd-share-preview"><canvas></canvas><div class="sd-share-note"></div></div>
      <div class="sd-share-apps">${apps}</div>
    </div>`;
  ov.addEventListener('click', e => { e.stopPropagation(); if (e.target === ov) closeShareSheet(); });
  ov.querySelector('.sd-log-sheet').addEventListener('click', e => e.stopPropagation());
  ov.querySelector('.sd-log-x').addEventListener('click', closeShareSheet);
  ov.querySelectorAll('[data-app]').forEach(b => b.addEventListener('click', () => shareAct(ov, b.dataset.app, b)));
  if (typeof wireSheetGrab === 'function') wireSheetGrab(ov, '.sd-share-sheet', closeShareSheet);
  return ov;
}
window.closeShareSheet = function () {
  const ov = document.getElementById('sd-share');
  if (ov) ov.classList.remove('open');
};

/* openShareSheet(el, job) — or the old (el, album, review), which becomes a
   review job so the log sheet's Share and shareMyReview keep working. */
window.openShareSheet = async function (triggerEl, job, review) {
  if (job && job.album && !job.build) job = shareJobReview(job, review || {});
  if (!job) return;
  const host = (triggerEl && triggerEl.closest && triggerEl.closest('.app-screen'))
             || document.querySelector('.app-screen') || document.body;
  const ov = ensureShareSheet();
  host.appendChild(ov);
  ov._job = job; ov._file = null;
  shareNote(ov, 'Building your card…', true);
  const shown = ov.querySelector('.sd-share-preview canvas');
  shown.getContext('2d').clearRect(0, 0, shown.width, shown.height);
  ov.querySelector('.sd-log-sheet').scrollTop = 0;
  requestAnimationFrame(() => ov.classList.add('open'));

  const cv = await job.build();
  if (ov._job !== job) return;                    // another share opened meanwhile
  shown.width = cv.width; shown.height = cv.height;
  shown.getContext('2d').drawImage(cv, 0, 0);
  /* The blob is made HERE, not on the tap. Safari drops the user gesture that
     navigator.share needs if you await anything first, so the tap has to find
     the file already waiting. */
  try {
    const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
    if (blob) ov._file = new File([blob], job.file || 'spindeck.png', { type: 'image/png' });
  } catch (e) { /* tainted canvas — the image buttons say so below */ }
  ov.querySelector('[data-app="save"]').disabled = !ov._file;
  if (!ov._file) shareNote(ov, "Couldn't build the image — the cover blocked the canvas read. Text and links still work.", true);
  else shareNote(ov, '', false);
};

/* A toast over the card. `sticky` keeps it up (building, or a failure that
   the buttons need explaining); otherwise it shows for a beat and goes. */
function shareNote(ov, msg, sticky) {
  const n = ov.querySelector('.sd-share-note');
  clearTimeout(n._t);
  n.textContent = msg;
  n.classList.toggle('is-on', !!msg);
  if (msg && !sticky) n._t = setTimeout(() => n.classList.remove('is-on'), 1500);
}
function shareCopy(text) {
  try { return navigator.clipboard.writeText(text); } catch (e) { return Promise.reject(e); }
}
function shareAct(ov, app, btn) {
  const job = ov._job; if (!job) return;
  const words = job.text + (job.url ? ' ' + job.url : '');
  const nav = (data) => navigator.share ? navigator.share(data).catch(() => {}) : null;
  if (app === 'ig') {
    if (ov._file && navigator.canShare && navigator.canShare({ files: [ov._file] })) nav({ files: [ov._file], title: 'Spindeck', text: job.text });
    else shareNote(ov, ov._file ? 'Save the image below, then post it to Instagram.' : 'No image to share yet.');
  } else if (app === 'x') {
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(words), '_blank', 'noopener');
  } else if (app === 'sms') {
    if (navigator.share) nav({ text: job.text, url: job.url });
    else window.location.href = 'sms:?&body=' + encodeURIComponent(words);
  } else if (app === 'link') {
    shareCopy(job.url || SHARE_URL).then(() => shareNote(ov, 'Link copied.'), () => shareNote(ov, job.url));
  } else if (app === 'save') {
    shareSave(ov);
  } else if (app === 'copytext') {
    shareCopy(words).then(() => shareNote(ov, 'Text copied.'), () => shareNote(ov, 'Select the text above to copy it.'));
  } else if (app === 'sendtext') {
    if (navigator.share) nav({ text: words });
    else window.location.href = 'sms:?&body=' + encodeURIComponent(words);
  }
}
function shareSave(ov) {
  if (!ov._file) return;
  const url = URL.createObjectURL(ov._file);
  const a = document.createElement('a');
  a.href = url; a.download = ov._file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  shareNote(ov, 'Saved.');
}

/* Resolve the album + your saved draft behind a share button, wherever it sits. */
window.shareMyReview = function (btn, albumName) {
  const arch = window.ARCHIVE || [];
  const scr = btn && btn.closest('.s-home-v3');
  const album = (albumName && arch.find(a => a.album === albumName))
             || (window.shellAlbum ? shellAlbum(scr) : null);
  if (!album) return;
  const d = (window.albumDraft && albumDraft(album)) || {};
  openShareSheet(btn, shareJobReview(album, { rating: d.rating || 0, text: d.text || '', songs: d.songs || [] }));
};
