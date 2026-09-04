// ============================================================
//  SCREENS
// ============================================================

/* The three log toggles — listened · listen later · favourite.
   Defined HERE, not in app.js, because the home screen's `html:` is a static
   template literal evaluated while screens.js parses; app.js hasn't run yet, so
   anything it defines is unavailable to it. app.js's SDLOG_ICONS aliases this,
   which is what keeps the album page's quick buttons and the log sheet's own
   options drawing the same glyphs. */
/* The log controls' icons, drawn in the DOT SYSTEM (SD_DOTS) so the buttons you
   press are the same material as the pet, the ticker and every generated asset —
   rounded squares at 56% of the cell, 14% corner.

   ⚠️ 5×5, not the 7×7 or 24×24 these replaced. They render at ~15px, so a 7-wide
   grid puts each dot near 2px and the icon reads as grit. Five across is the
   most a glyph this size can carry — the same budget that governs the nav pet.
   ⚠️ Shapes chosen for what SURVIVES the grid, not for fidelity: "Listened" is
   headphones rather than an ear (an ear is a curve with an inner curve, and at
   5×5 that is two grey smudges), and the pencil is a plain 45° stroke because
   the doc's rule is that a dot matrix only does right angles and 45° steps.
   Redraw any of them in dot-lab.html and paste the rows back. */
const SD_DOT_ICONS = {
  // Pencil — a 45° stroke with a blunt tip at the bottom-left.
  pencil: ['...xx',
           '..xx.',
           '.xx..',
           'xx...',
           'x....'],
  // Headphones — the band over two ear cups. Reads where an ear doesn't.
  ear:    ['.xxx.',
           'x...x',
           'x...x',
           'x...x',
           'xx.xx'],
  // Clock — a ring with the hands meeting at the centre.
  clock:  ['.xxx.',
           'x.x.x',
           'x.xxx',
           'x...x',
           '.xxx.'],
  // Heart — two lobes, shoulders, point.
  heart:  ['.x.x.',
           'xxxxx',
           'xxxxx',
           '.xxx.',
           '..x..'],
  // Shopping bag — two handles over a box. The shop button in the nav scoop.
  bag:    ['.x.x.',
           'xxxxx',
           'x...x',
           'x...x',
           'xxxxx'],
  /* ── Four more profile badges ── added for the shop's Badges aisle, which
     needed more than one row of stock to be worth a tab of its own. Same 5×5
     budget and the same rule as everything above: right angles and 45° steps,
     nothing that needs an inner curve to read at 15px. */
  // Ticket — two stubs either side of a perforation. Front Row.
  ticket: ['xxxxx',
           'x.x.x',
           'x.x.x',
           'x.x.x',
           'xxxxx'],
  // Crown — three points, a band, and a hollow the head goes in. Patron.
  crown:  ['x.x.x',
           'xxxxx',
           'xxxxx',
           'x...x',
           'xxxxx'],
  // Equalizer — five bars at four heights. Loud.
  wave:   ['...x.',
           '.x.x.',
           '.xxx.',
           'xxxxx',
           'xxxxx'],
  // Microphone — capsule over a stand. Encore.
  mic:    ['.xxx.',
           '.xxx.',
           '.xxx.',
           'x.x.x',
           '.xxx.'],

  /* ── Playlist badges ── the emblems you pin on a playlist card. Same 5×5
     budget and the same right-angle / 45° rule as everything above: these sit
     at ~13px on a card, smaller than the log icons, so anything with an inner
     curve turns to mush. Each one is a MOOD, not a category — a playlist is
     aesthetic expression, so the vocabulary is weather and feeling rather than
     genre, which the track list already says. */
  gem:    ['..x..',          // a cut stone — the free one everybody starts with
           '.xxx.',
           'xxxxx',
           '.xxx.',
           '..x..'],
  flame:  ['..x..',          // heat / heavy rotation
           '..xx.',
           '.xxx.',
           'xxxxx',
           '.xxx.'],
  moon:   ['.xxx.',          // a crescent, open to the right — night listening
           'xx...',
           'xx...',
           'xx...',
           '.xxx.'],
  bolt:   ['...xx',          // a 45° slash that swells in the middle — energy
           '..xx.',
           '.xxx.',
           '.xx..',
           'xx...'],
  drop:   ['..x..',          // a teardrop, point up — the sad ones
           '..x..',
           '.xxx.',
           'xxxxx',
           '.xxx.'],
  sun:    ['x.x.x',          // body with rays at the corners — bright / summer
           '.xxx.',
           'xxxxx',
           '.xxx.',
           'x.x.x'],
};

/* ⚠️ Built at parse time, which is why dots.js has to load before screens.js —
   the same reason sdScene() is declared up here. */
const SD_ICONS = Object.keys(SD_DOT_ICONS).reduce((out, k) => {
  out[k] = SD_DOTS.svg(SD_DOT_ICONS[k], { cls: 'sd-dot-ico' });
  return out;
}, {});

/* The log CTA's icon — a box with an ellipsis of dots inside, the three of them
   breathing slowly. It says "there are words to write here" where a pencil said
   "edit", and the motion is the only thing on the page that moves at rest, so
   the button reads as the one you're meant to press.

   ⚠️ Hand-built rather than `SD_DOTS.svg()`, because the generator has no way to
   mark individual cells and the three inner dots need their own class to
   animate. It emits the SAME geometry — cell 8, dot 56% of the cell, corner 14%
   of the dot — so it stays the brand's dot; if `dots.js` ever changes those
   fractions, this has to follow. 'o' marks an animated dot, 'x' a static one. */
function sdBoxIcon() {
  const CELL = 8, FRAC = 0.56, CORNER = 0.14;      // mirrors SD_DOTS' defaults
  const d = +(CELL * FRAC).toFixed(2);
  const rx = +(d * CORNER).toFixed(2);
  const off = +((CELL - d) / 2).toFixed(2);
  const rows = ['xxxxxxx',
                'x.....x',
                'x.ooo.x',
                'x.....x',
                'xxxxxxx'];
  let n = 0, out = '';
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === '.') return;
    const live = ch === 'o';
    // Staggered so they roll left-to-right instead of pulsing as one blob.
    const delay = live ? ` style="animation-delay:${(n++ * 0.26).toFixed(2)}s"` : '';
    out += `<rect x="${(x * CELL + off).toFixed(2)}" y="${(y * CELL + off).toFixed(2)}"`
         + ` width="${d}" height="${d}" rx="${rx}" ry="${rx}"`
         + ` fill="currentColor"${live ? ' class="sd-ico-live"' : ''}${delay}/>`;
  }));
  return `<svg viewBox="0 0 ${7 * CELL} ${5 * CELL}" class="sd-dot-ico sd-dot-ico--box">${out}</svg>`;
}
SD_ICONS.logbox = sdBoxIcon();

/* The pet — the face cradled in the bottom bar's scoop.
   SIX DOTS, the same six the live pill's arrow is made of: two eyes and a
   four-dot mouth arc. It reacts to what you do — favourite, rate, listen, save
   for later — by moving those six into a different formation.

   ⚠️ Six dots and a CSS transform each, NOT an SD_DOTS pixel grid. The grid
   swaps a whole sprite per frame, so every change is a cut; these dots inherit
   `.v3-ring-dot`'s 0.4s spring transition, so a reaction MORPHS out of the
   smile and settles back into it. The morph is the character. It also means a
   new reaction is six numbers, not a hand-drawn 21×10 sprite.
   ⚠️ Only six. A reaction that can't be said in six dots doesn't go in — that
   constraint is what keeps this legible at 63×30px, where a cat mascot and a
   whole landscape both died.

   ⚠️ Declared up here for the same reason as SD_ICONS: the home screen's `html:`
   is a static template literal evaluated while this file parses, and it calls
   sdScene() inline. Declared below the SCREENS array, the `const` would still be
   in its temporal dead zone at that moment. */
/* ⚠️ PARKED, and now HOMELESS: the nav is the floating bubble again
   (2026-09-03) and has no scoop, so `sdScene()` is not emitted by anything —
   `bottomNav()` stopped calling it. The whole engine (paintScene / sceneTick /
   sceneReact / SCENE_REACTIONS, all the .sd-face CSS, the ☺ Pet box) is intact
   behind this flag; putting the pet back means giving it a place on the bubble
   first, then calling sdScene() from bottomNav() again. */
const SD_PET_ENABLED = false;

function sdScene(active) {
  if (!SD_PET_ENABLED) return sdShopBtn(active);
  return `<div class="sd-scene" aria-hidden="true"><span class="sd-face sd-face--smile">${
    '<i class="sd-face-dot"></i>'.repeat(6)}</span></div>`;
}

/* The scoop's shop button — ⚠️ NOT EMITTED any more. The floating bubble has
   no scoop; the shop is the middle of its five nav items (see bottomNav), with
   the same dot-language bag. Kept with sdScene() so the docked layout can be
   rebuilt from these two if it is ever wanted back. */
function sdShopBtn(active) {
  return `<button class="sd-shop-btn${active === 'shop' ? ' active' : ''}" onclick="navigate('shop')" title="Shop" aria-label="Shop">
            ${SD_ICONS.bag}
          </button>`;
}

/* The COMPACT-STATE BENTO — the home hero, and now also the Pro showcase at
   the top of the shop (`shopHtml`). It was inlined TWICE: Float·Dark and
   Float·Light were byte-identical apart from three comments, so this is one
   copy with three callers rather than two copies drifting apart.
   ⚠️ Declared up here for the same reason as sdScene(): the home screen's
   `html:` is a static template literal evaluated while this file parses, so a
   `const` declared below SCREENS would still be in its temporal dead zone. */
/* ── Listen on — the three services a CD hands you off to ───────────────
   ONE table and ONE row builder. These same three rows are emitted by the
   bento's CD menu and by every CD on the profile card; they used to be two
   copies of the same wall of inline SVG, which is exactly how two menus that
   are meant to be the same menu drift apart.
   `openOnService` (app.js) is what a row DOES — see the block there for why
   Spotify is a search where the other two are real album links.
   ⚠️ SoundCloud used to sit where Deezer does. It went because there is no
   keyless way to resolve an album on it, and a row that opens nothing is worse
   than a row that isn't there. Add one back only with a link to go with it. */
/* Each service's mark. Two layers, and the IMAGE WINS when it is there:
   `svcMarkHtml` draws the vector below and an <img> over it, and the <img>
   removes itself `onerror`. So dropping a real app icon at
   `images/svc-<id>.png` is the whole change -- no code edit, no build step,
   and a missing file degrades to the drawing instead of an empty tile.
   WARNING: the vectors below are approximations drawn from memory. They are
   the FALLBACK, not the goal -- if a tile looks wrong, the fix is the real
   file, not another pass at the path data. */
const SD_SERVICES = [
  { id: 'spotify', name: 'Spotify',       bg: '#1ED760',
    ico: `<svg viewBox="0 0 24 24" fill="#000"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.72 13.5 1.56.36.24.54.84.24 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/></svg>` },
  { id: 'apple',   name: 'Apple Music',   bg: 'linear-gradient(135deg,#fa233b,#fb5c74)',
    ico: `<svg viewBox="0 0 24 24" fill="white"><path d="M20.4 3.05a.9.9 0 0 0-.74-.2l-11 2.2a.9.9 0 0 0-.72.89v9.99a3.4 3.4 0 0 0-1.85-.5C4.4 15.43 3 16.6 3 18c0 1.4 1.4 2.57 3.09 2.57 1.7 0 3.09-1.16 3.09-2.57V9.13l9.05-1.81v6.6a3.4 3.4 0 0 0-1.85-.5c-1.7 0-3.09 1.17-3.09 2.57S14.68 18.57 16.38 18.57s3.08-1.17 3.08-2.57V3.75a.9.9 0 0 0-.3-.7z"/></svg>` },
  { id: 'deezer',  name: 'Deezer',        bg: 'linear-gradient(135deg,#a238ff,#ff0092)',
    ico: `<svg viewBox="0 0 24 18" fill="white"><rect x="14.6" y="0" width="9" height="2.7" rx="1"/><rect x="14.6" y="4.6" width="9" height="2.7" rx="1"/><rect x="0.4" y="9.2" width="9" height="2.7" rx="1"/><rect x="14.6" y="9.2" width="9" height="2.7" rx="1"/><rect x="0.4" y="13.8" width="9" height="2.7" rx="1"/><rect x="7.5" y="13.8" width="9" height="2.7" rx="1"/><rect x="14.6" y="13.8" width="9" height="2.7" rx="1"/></svg>` },
  /* Search-only, like Spotify: no public YouTube Music lookup without an API
     key, and a keyed call does not belong in a static prototype. */
  { id: 'ytmusic', name: 'YouTube Music', bg: '#ffffff',
    ico: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.4" fill="#ff0033"/><path d="M9.9 7.9 15.9 12l-6 4.1z" fill="#fff"/></svg>` },
];

/* The tile. `cls` is the class the caller styles the box with; the <img> is
   absolutely positioned over the whole tile, so a real icon covers both the
   drawing and the brand colour behind it. */
function svcMarkHtml(sv, cls) {
  return `<span class="${cls}" style="background:${sv.bg}">${sv.ico}` +
         `<img class="sd-svc-img" src="images/svc-${sv.id}.png" alt="" `+
         `onerror="this.remove()"></span>`;
}
/* `slot` is the profile card's favourite index — that menu belongs to one of
   five pinned albums, so it has to name which. The bento passes nothing and
   `openOnService` reads the album off the shell instead. */
function platRowsHtml(slot) {
  const arg = slot == null ? '' : ', ' + slot;
  return SD_SERVICES.map(s => `
              <button class="wall2-menu-item plp-plat-item" onclick="event.stopPropagation(); openOnService(this, '${s.id}'${arg})">
                ${svcMarkHtml(s, 'plp-plat-ico')}
                ${s.name}
              </button>`).join('');
}

/* ══ BENTO SKINS — bought in the shop, worn by the bento ═══════════════════
   `body.sd-skin-<id>` (setBentoSkin in app.js) is what shows one; nothing is
   drawn until then. Two layers, and it takes both:
   · BACK — inside `.v3-bg-fill`, drawn before the silhouette, so the fill's
     one drop-shadow is cast by the UNION of frame + ears + tail. Separate
     layers each cast their own and the frame's landed on the ears and tail.
   · FRONT — flat copies (no shadow) of only what stands OUTSIDE the frame:
     the ears above the top edge and the tail's curl below the bottom one,
     each in an <svg> whose viewBox is cropped to that band so the tucked
     parts clip away. At z-index 4 they sit over the frame's shadow and over
     the feed's sticky "Today" header (z 2), which was painting across the
     tail. Nothing casts a shadow onto them because nothing is above them.
   FURRY (Eric, 2026-09-04, images/skin-furry-source.svg) was drawn in Figma
   over the real bento: the frame is 891 tall with the ears' flat bases at
   y=86.945 — that line is the bento's top edge — and 86.945 + 729.147 =
   816.09 is the bottom edge, which is where the tail's upper arm ends
   (815.66). So the artwork is at (0, -86.945) in bento units; the arm is
   inside the frame and only the curl shows.
   Hand mode mirrors both layers about the bento's centre (see .v3-skin-* in
   app.css) so the ears and tail swap sides with the album.
   Outer ears and tail take the bento's colour; inner ears the same colour a
   quarter of the way to white. */
function bentoSkinBackHtml() {
  return `<g class="v3-skin-back v3-skin--furry" transform="translate(0 -86.945)"><path class="v3-skin-outer" d="M271.193 27.1351C260.863 45.1685 243.754 86.9451 203.781 86.9451H379.724C391.991 59.0226 360.127 21.9865 338.605 6.95886C328.91 0.188953 292.216 -9.5636 271.193 27.1351Z"/><path class="v3-skin-inner" d="M283.856 39.9244C276.538 54.1016 264.419 86.9451 236.103 86.9451H360.736C369.426 64.9933 346.855 35.8768 331.609 24.0625C324.741 18.7402 298.748 11.0731 283.856 39.9244Z"/><path class="v3-skin-outer" d="M561.782 27.1351C551.452 45.1685 534.343 86.9451 494.37 86.9451H670.312C682.58 59.0226 650.716 21.9865 629.194 6.95886C619.498 0.188953 582.804 -9.5636 561.782 27.1351Z"/><path class="v3-skin-inner" d="M574.445 39.9244C567.127 54.1016 555.008 86.9451 526.692 86.9451H651.325C660.015 64.9933 637.444 35.8768 622.198 24.0625C615.33 18.7402 589.337 11.0731 574.445 39.9244Z"/><path class="v3-skin-outer" d="M46.9079 815.661H179.627C185.261 815.661 189.828 811.093 189.828 805.459C189.828 799.825 185.261 795.257 179.627 795.257H47.6451C21.6076 795.257 0.5 816.365 0.5 842.402C0.5 868.44 21.6076 889.547 47.6451 889.547H136.18C142.256 889.547 147.181 884.622 147.181 878.546C147.181 872.471 142.256 867.545 136.18 867.545H46.9079C32.5803 867.545 20.9655 855.93 20.9655 841.603C20.9655 827.275 32.5803 815.661 46.9079 815.661Z"/></g>`;
}
function bentoSkinFrontHtml() {
  /* The ears: frame y 0→86.945. The curl: frame y 816.09→891, i.e. bento
     y 729.147→804.06 — positioned at 99.88% of the bento, 10.26% tall. */
  return `<svg class="v3-skin-front v3-skin-front--ears v3-skin--furry" viewBox="0 0 689 86.945" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path class="v3-skin-outer" d="M271.193 27.1351C260.863 45.1685 243.754 86.9451 203.781 86.9451H379.724C391.991 59.0226 360.127 21.9865 338.605 6.95886C328.91 0.188953 292.216 -9.5636 271.193 27.1351Z"/><path class="v3-skin-inner" d="M283.856 39.9244C276.538 54.1016 264.419 86.9451 236.103 86.9451H360.736C369.426 64.9933 346.855 35.8768 331.609 24.0625C324.741 18.7402 298.748 11.0731 283.856 39.9244Z"/><path class="v3-skin-outer" d="M561.782 27.1351C551.452 45.1685 534.343 86.9451 494.37 86.9451H670.312C682.58 59.0226 650.716 21.9865 629.194 6.95886C619.498 0.188953 582.804 -9.5636 561.782 27.1351Z"/><path class="v3-skin-inner" d="M574.445 39.9244C567.127 54.1016 555.008 86.9451 526.692 86.9451H651.325C660.015 64.9933 637.444 35.8768 622.198 24.0625C615.33 18.7402 589.337 11.0731 574.445 39.9244Z"/></svg>
            <svg class="v3-skin-front v3-skin-front--tail v3-skin--furry" viewBox="0 816.092 689 74.908" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path class="v3-skin-outer" d="M46.9079 815.661H179.627C185.261 815.661 189.828 811.093 189.828 805.459C189.828 799.825 185.261 795.257 179.627 795.257H47.6451C21.6076 795.257 0.5 816.365 0.5 842.402C0.5 868.44 21.6076 889.547 47.6451 889.547H136.18C142.256 889.547 147.181 884.622 147.181 878.546C147.181 872.471 142.256 867.545 136.18 867.545H46.9079C32.5803 867.545 20.9655 855.93 20.9655 841.603C20.9655 827.275 32.5803 815.661 46.9079 815.661Z"/></svg>`;
}

function bentoHtml() {
  return `<!-- BENTO: all children absolutely positioned in 690×670 SVG coordinate space -->
          <div class="v3-bento">

            <!-- Skin, front layer (ears + tail curl) — see bentoSkinFrontHtml -->
            ${bentoSkinFrontHtml()}

            <!-- Background fill: paints album color inside the bento frame shape.
                 Two silhouettes (right/left hand) — CSS shows one via .s-home-v3--left.
                 The skin's BACK layer is drawn first so the shadow is one union. -->
            <svg class="v3-bg-fill" viewBox="0 0 689 730" xmlns="http://www.w3.org/2000/svg">
              ${bentoSkinBackHtml()}
              <path class="bg-right" fill="currentColor" d="M518.5 0.5H20.5C9.454 0.5 0.5 9.4543 0.5 20.5V709.147C0.5 720.192 9.454 729.147 20.5 729.147H518.5C529.546 729.147 538.5 720.192 538.5 709.147L538.5 609C538.5 570.34 569.84 539 608.5 539H668.5C679.546 539 688.5 530.046 688.5 519V107.5C688.5 96.4543 679.546 87.5 668.5 87.5H558.5C547.454 87.5 538.5 78.5457 538.5 67.5V20.5C538.5 9.4543 529.546 0.5 518.5 0.5Z"/>
              <path class="bg-left" fill="currentColor" d="M170.5 0.5H668.5C679.546 0.5 688.5 9.45432 688.5 20.5V709.147C688.5 720.192 679.546 729.147 668.5 729.147H170.5C159.454 729.147 150.5 720.192 150.5 709.147L150.5 609C150.5 570.34 119.16 539 80.4999 539H20.4999C9.45422 539 0.499939 530.046 0.499939 519V107.5C0.499939 96.4543 9.45422 87.5 20.4999 87.5H130.5C141.546 87.5 150.5 78.5457 150.5 67.5V20.5C150.5 9.45431 159.454 0.5 170.5 0.5Z"/>
            </svg>

            <!-- Master SVG frame — viewBox matches bento aspect-ratio exactly -->
            <svg class="v3-master-frame" viewBox="0 0 689 730" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M518 0.5H21C9.9543 0.5 1 9.4543 1 20.5V534.5H518C529.046 534.5 538 525.546 538 514.5V451.927V73.4325V20.5C538 9.45431 529.046 0.5 518 0.5Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <path d="M518.5 0.5H20.5C9.454 0.5 0.5 9.4543 0.5 20.5V709.147C0.5 720.192 9.454 729.147 20.5 729.147H518.5C529.546 729.147 538.5 720.192 538.5 709.147L538.5 609C538.5 570.34 569.84 539 608.5 539H668.5C679.546 539 688.5 530.046 688.5 519V107.5C688.5 96.4543 679.546 87.5 668.5 87.5H558.5C547.454 87.5 538.5 78.5457 538.5 67.5V20.5C538.5 9.4543 529.546 0.5 518.5 0.5Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <path d="M654.409 517H571.806C563.403 517 556.64 510.098 556.81 501.697L558.617 412.351C558.703 408.077 560.609 404.044 563.855 401.263L654.756 323.394C661.282 317.804 671.354 322.504 671.261 331.097L669.408 502.162C669.319 510.383 662.63 517 654.409 517Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <path d="M664.035 291.857L569.72 373.062C564.534 377.527 556.5 373.843 556.5 367V123C556.5 114.716 563.216 108 571.5 108H654.247C662.532 108 669.247 114.716 669.247 123V280.49C669.247 284.857 667.344 289.007 664.035 291.857Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <circle cx="615.5" cy="614" r="55" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <path d="M557 35.5V30.5C557 13.9315 570.431 0.5 587 0.5H659C675.569 0.5 689 13.9315 689 30.5V35.5C689 52.0685 675.569 65.5 659 65.5H587C570.431 65.5 557 52.0685 557 35.5Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
            </svg>

            <!-- Album art: SVG x=1–538, y=0.5–534.5 → left 0.14% top 0.07% w 77.83% h 79.70% -->
            <div class="v3-album" onclick="onAlbumArt(this)"
                 style="background-image:url('images/album-crystalcastles1.png')"></div>

            <!-- Stats strip: expanded to top 77% h 22.92% to fit album/artist name -->
            <div class="v3-blue" onclick="event.stopPropagation(); enterAlbumPage(this.closest('.s-home-v3'))">
              <div class="v3-blue-info-row">
                <span class="v3-blue-title"><span class="v3-blue-album"></span><span class="v3-blue-date v3-blue-date--fs"></span></span>
                <span class="v3-blue-sep">·</span>
                <span class="v3-blue-artist" onclick="event.stopPropagation(); onArtistName(this)"></span>
                <span class="v3-blue-date v3-blue-date--inline"></span>
              </div>
              <div class="v3-blue-stars-row">
                <span class="v3-blue-score">4.4</span>
                ${halfStars(4.4, 16)}
                <span class="v3-blue-count">19,284 reviews</span>
              </div>
              <div class="v3-blue-quote"><span class="v3-blue-quote-text"></span></div>
              <!-- Producer / engineering credits, filled by populateCredits() from
                   MusicBrainz. Hidden until something comes back. -->
              <div class="v3-blue-credits" hidden></div>
              <!-- Artist page only: label / members / description, filled by
                   populateArtistPage(). Its own node rather than a repaint of
                   the credits box, so nothing has to be put back on the way
                   out — the state class shows one and hides the other. -->
              <div class="v3-artist-info"></div>
            </div>

            <!-- ForYou: single panel, cycles through trending albums on click -->
            <div class="v3-for-single"></div>

            <!-- CD: SVG cx=615.5 cy=614 r=55 → left 81.23% top 83.43% w 15.94% h 16.42% -->
            <div class="v3-cd"
                 style="background-image:url('images/album-crystalcastles1.png')"
                 title="Play / pause preview"
                 onclick="onCdTap(this, event)">
              <div class="v3-cd-hole"></div>
            </div>
            <!-- Compact CD popup — preview + streaming platforms (mirrors the playlist plat menu) -->
            <div class="wall2-menu v3-cd-menu" hidden>
              <button class="v3-stream-preview v3-cd-prev" onclick="event.stopPropagation(); playPreview(this, event)">
                <span class="v3-stream-preview-ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
                <span class="v3-stream-preview-txt">Listen to preview</span>
                <span class="v3-stream-preview-dur">0:30</span>
              </button>
              <div class="v3-cd-menu-sep"></div>${platRowsHtml()}
            </div>

            <!-- Preview autoplay toggle — muted by default; tap to enable autoplay previews -->
            <button class="v3-preview-btn" title="Autoplay music previews" onclick="togglePreviewMode(event)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 5 6 9H2v6h4l5 4z"/>
                <g class="v3-spk-x"><path d="M22 9l-5 6M17 9l5 6"/></g>
                <g class="v3-spk-wave"><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></g>
              </svg>
            </button>

            <!-- Live corner button — sits in the bento's top corner notch; becomes Back in review mode -->
            <button class="v3-search-pill v3-live-pill" onclick="event.stopPropagation(); onLivePill(this)">
              <span class="v3-live-content"><span class="v3-ring v3-arrow"><span class="v3-ring-spin"><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i></span></span></span>
              <span class="v3-back-content"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>Back</span>
            </button>
            <!-- Artist page only: Favorite as the Back pill's twin in the other
                 top corner (mirrors with hand mode). It carries .v3-rev-q and
                 data-k so toggleRevAction / syncQuickLog treat it as the same
                 favourite toggle the album page's quick-log square is. -->
            <button class="v3-search-pill v3-artist-fav v3-rev-q" data-k="fav" title="Favorite" onclick="toggleRevAction(this, event)">${SD_ICONS.heart}</button>

          </div>`;
}

const SCREENS = [

  // ── 1. AUTH ─────────────────────────────────────────────────
  {
    id: 'auth', name: 'Auth / Login', statusTheme: 'light',
    variants: [
      { label: 'Float·Dark',  thumb: ['w50','w80','accent','w80','accent'], get html() { return authHtml(false); } },
      { label: 'Float·Light', thumb: ['w50','w80','accent','w80','accent'], get html() { return authHtml(true);  } },
    ]
  },

  // ── 2. ONBOARDING ───────────────────────────────────────────
  {
    id: 'onboarding', name: 'Onboarding', statusTheme: 'light',
    variants: [
      { label: 'Float·Dark',  thumb: ['w70','accent','w80','w60','w70'], get html() { return onboardingHtml(false); } },
      { label: 'Float·Light', thumb: ['w70','accent','w80','w60','w70'], get html() { return onboardingHtml(true);  } },
    ]
  },

  // ── 3. HOME ──────────────────────────────────────────────────
  {
    id: 'home', name: 'Home', statusTheme: 'light',
    variants: [

      // ── 3f. Bento Hero v3.0 ─────────────────────────────────
      {
        label: 'Float·Dark', version: 'v3.0',
        thumb: ['accent','w60','w80','w60','w80'],
        html: `
        <div class="app-screen s-home-v3">

          <!-- TOP HEADER: bubble cluster (left) · spindeck wordmark (center) · single bubble (right).
               Fixed height pushes the bento + everything below it ~100px down the flex column. -->
          <div class="v3-header">
            <div class="v3-header-bubbles">
              <!-- Notifications: friends adding you, replies to your reviews, etc.
                   .has-notif expands the bubble into a blue pill with the unread count on the right.
                   Click toggles the state (mockup demo). -->
              <button class="v3-bubble v3-bubble--notif has-notif" title="Notifications" aria-label="Notifications"
                      onclick="navigate('notifications')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="v3-bubble-count">+5</span>
              </button>
            </div>
            <div class="v3-header-brand">
              <div class="v3-header-logo" role="img" aria-label="Spindeck"></div>
              <!-- filled by populateHomeData(). The two home variants are static
                   html templates evaluated ONCE at load, so interpolating
                   PROFILE here would freeze the handle and never follow a
                   persona switch. (No backticks in here - this sits inside a
                   template literal.) -->
              <div class="v3-header-handle"></div>
            </div>
            <div class="v3-header-right">
              <!-- Settings (inner) -->
              <button class="v3-bubble v3-bubble--settings" title="Settings" aria-label="Settings" onclick="navigate('settings')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
              <!-- Search (outer/rightmost) -->
              <button class="v3-bubble v3-bubble--search" title="Search" aria-label="Search" onclick="openSearch(this)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              </button>
            </div>
          </div>

          <!-- Scrollable body: bento + feed scroll together -->
          <div class="v3-body">

          ${bentoHtml()}

          <!-- SCROLL: activity feed — notification-style rows, filled by
               renderFriendFeed(). The "you may know" rails used to sit above it. -->
          <div class="v3-scroll-area">

            <div class="v3-feed-items"></div>

          </div><!-- /v3-scroll-area -->

          <!-- REVIEW PANEL: replaces the feed when the stats box is tapped.
               stopPropagation keeps clicks from bubbling to the viewer's variant-switch wrapper -->
          <div class="v3-review-panel" onclick="event.stopPropagation()" onmousedown="event.stopPropagation()">

            <!-- Top row: streaming links (centered under CD) + your review (aligned to stats text).
                 Uses the bento's 78/22 split so it mirrors with the hand layout. -->
            <div class="v3-rev-top">

              <!-- Your rating + written review + submit — aligned to the stats text.
                   The three squares butt straight onto the CTA and each other
                   (shared borders, no gap) so the four read as one cascading
                   control. They are the same three toggles the log sheet opens
                   with — the point is that marking something listened / later /
                   favourite costs one tap instead of opening the sheet. -->
              <div class="v3-rev-mine">
                <div class="v3-rev-cta-row">
                  <button class="v3-rev-cta" onclick="event.stopPropagation(); openLogSheet(this);">
                    ${SD_ICONS.logbox}
                    <span>Review, rate, log</span>
                  </button>
                  <div class="v3-rev-quick">
                    <button class="v3-rev-q" data-k="listened" title="Listened" onclick="toggleRevAction(this, event)">${SD_ICONS.ear}<span class="v3-rev-q-lbl">Listened</span></button>
                    <button class="v3-rev-q" data-k="later" title="Listen later" onclick="toggleRevAction(this, event)">${SD_ICONS.clock}<span class="v3-rev-q-lbl">Later</span></button>
                    <button class="v3-rev-q" data-k="fav" title="Favorite" onclick="toggleRevAction(this, event)">${SD_ICONS.heart}<span class="v3-rev-q-lbl">Favorite</span></button>
                  </div>
                </div>
              </div>

            </div><!-- /v3-rev-top -->

            <!-- The album's score, large. The compact one-liner under the artist
                 stays as it is — that one is a label on the record, this one is
                 the headline for the ratings section it sits on top of. -->
            <div class="v3-rev-score">
              <span class="v3-rev-score-n"></span>
              <span class="v3-rev-score-sub"></span>
            </div>

            <!-- Rating distribution bars (header text removed, bars kept) -->
            <div class="v3-rev-hist">
              <div class="v3-rev-hist-bars"></div>
              <div class="v3-rev-hist-axis"><span>½</span><span>5</span></div>
            </div>

            <!-- Tracklist — every track, in flow; rate one by tapping its row -->
            <div class="v3-rev-songs"></div>

            <!-- Artist page — grid of the artist's albums (trending style; shown only in --artist state) -->
            <div class="v3-artist-albums"></div>

            <!-- Friend rec tag — shown only when a friend has activity on this album
                 (else algo-served: no tag). Sits with the reviews, below the
                 tracklist: it IS social proof, so it reads as part of that section. -->
            <div class="v3-rev-rec" hidden>
              <span class="v3-rev-rec-av"></span>
              <span class="v3-rev-rec-txt"><b class="v3-rev-rec-name"></b> listened to this</span>
            </div>

            <!-- Other users' reviews — full width -->
            <div class="v3-rev-filters">
              <button class="v3-rev-filter active" data-f="popular" onclick="setReviewFilter(this)">Popular</button>
              <button class="v3-rev-filter" data-f="friends" onclick="setReviewFilter(this)">Friends</button>
              <button class="v3-rev-filter" data-f="new" onclick="setReviewFilter(this)">New</button>
              <span class="v3-rev-count"></span>
            </div>

            <div class="v3-rev-list"></div>

          </div><!-- /v3-review-panel -->
          </div><!-- /v3-body -->

          <!-- NOW-PLAYING TICKER + the CD console that replaces it.
               ⚠ ${nowBar()}, NOT the markup inlined again. Both home variants had
               their own copy of the ticker, so the console the helper now also
               ships simply did not exist on the one screen it matters most on —
               the tap set the state and there was nothing in the plateau to show.
               Exactly the duplication that made bentoHtml() necessary. -->
          ${nowBar()}

          <!-- BOTTOM NAV — shared glass console (see bottomNav helper) -->
          ${bottomNav('home')}

          <!-- Streaming service action sheet -->
          <div class="v3-stream-overlay"
               style="display:none"
               onclick="this.style.display='none'">
            <div class="v3-stream-sheet" onclick="event.stopPropagation()">
              <div class="v3-stream-handle"></div>
              <button class="v3-stream-preview" onclick="playPreview(this, event)">
                <span class="v3-stream-preview-ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
                <span class="v3-stream-preview-txt">Listen to preview</span>
                <span class="v3-stream-preview-dur">0:30</span>
              </button>
              <div class="v3-stream-label">Listen on</div>
              <button class="v3-stream-app">
                <div class="v3-stream-icon" style="background:#1DB954">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.72 13.5 1.56.36.24.54.84.24 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/></svg>
                </div>
                Spotify
              </button>
              <button class="v3-stream-app">
                <div class="v3-stream-icon" style="background:linear-gradient(135deg,#fc3c44,#fc6f32)">
                  <svg width="13" height="16" viewBox="0 0 13 16" fill="white"><path d="M6.5 0L8 3.5 13 4.3l-3.5 3.4.8 4.8L6.5 10.5 2.2 12.5l.8-4.8L0 4.3l5-.8z"/></svg>
                </div>
                Apple Music
              </button>
              <button class="v3-stream-app">
                <div class="v3-stream-icon" style="background:linear-gradient(135deg,#ff5500,#ff8800)">
                  <svg width="17" height="11" viewBox="0 0 24 16" fill="white"><rect x="2" y="7" width="1.8" height="6" rx=".9"/><rect x="6" y="4" width="1.8" height="9" rx=".9"/><rect x="10" y="6" width="1.8" height="7" rx=".9"/><rect x="14" y="2" width="1.8" height="11" rx=".9"/><rect x="18" y="8" width="1.8" height="5" rx=".9"/></svg>
                </div>
                SoundCloud
              </button>
              <div class="v3-stream-label">Save</div>
              <button class="v3-stream-save" onclick="event.stopPropagation(); this.classList.toggle('on')">
                <span class="v3-stream-sico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8a5 5 0 0 1 10 0c0 3-2.2 4.1-3.4 5.3-.8.8-1.2 1.5-1.2 2.7A2.4 2.4 0 0 1 7.6 17"/><path d="M9.6 8.5a2.6 2.6 0 0 1 4.9-.6"/></svg></span>
                <span class="v3-stream-stext">Listened</span>
                <span class="v3-stream-check"></span>
              </button>
              <button class="v3-stream-save" onclick="event.stopPropagation(); this.classList.toggle('on')">
                <span class="v3-stream-sico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/></svg></span>
                <span class="v3-stream-stext">Listen later</span>
                <span class="v3-stream-check"></span>
              </button>
              <button class="v3-stream-save" onclick="event.stopPropagation(); this.classList.toggle('on')">
                <span class="v3-stream-sico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="14" y2="7"/><line x1="4" y1="12" x2="11" y2="12"/><line x1="4" y1="17" x2="11" y2="17"/><line x1="17" y1="10" x2="17" y2="18"/><line x1="13" y1="14" x2="21" y2="14"/></svg></span>
                <span class="v3-stream-stext">Add to playlist</span>
                <span class="v3-stream-check"></span>
              </button>
              <button class="v3-stream-cancel"
                      onclick="this.closest('.v3-stream-overlay').style.display='none'">
                Cancel
              </button>
            </div>
          </div>

        </div>`,
      },

      // ── 3g. Bento Hero v3.1 (light) ─────────────────────────
      {
        label: 'Float·Light', version: 'v3.1',
        thumb: ['accent','w60','w80','w60','w80'],
        html: `
        <div class="app-screen s-home-v3 s-home-v3--light">

          <!-- TOP HEADER: bubble cluster (left) · spindeck wordmark (center) · single bubble (right).
               Fixed height pushes the bento + everything below it ~100px down the flex column. -->
          <div class="v3-header">
            <div class="v3-header-bubbles">
              <!-- Notifications: friends adding you, replies to your reviews, etc.
                   .has-notif expands the bubble into a blue pill with the unread count on the right.
                   Click toggles the state (mockup demo). -->
              <button class="v3-bubble v3-bubble--notif has-notif" title="Notifications" aria-label="Notifications"
                      onclick="navigate('notifications')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="v3-bubble-count">+5</span>
              </button>
            </div>
            <div class="v3-header-brand">
              <div class="v3-header-logo" role="img" aria-label="Spindeck"></div>
              <!-- filled by populateHomeData(). The two home variants are static
                   html templates evaluated ONCE at load, so interpolating
                   PROFILE here would freeze the handle and never follow a
                   persona switch. (No backticks in here - this sits inside a
                   template literal.) -->
              <div class="v3-header-handle"></div>
            </div>
            <div class="v3-header-right">
              <!-- Settings (inner) -->
              <button class="v3-bubble v3-bubble--settings" title="Settings" aria-label="Settings" onclick="navigate('settings')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
              <!-- Search (outer/rightmost) -->
              <button class="v3-bubble v3-bubble--search" title="Search" aria-label="Search" onclick="openSearch(this)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              </button>
            </div>
          </div>

          <!-- Scrollable body: bento + feed scroll together -->
          <div class="v3-body">

          ${bentoHtml()}

          <!-- SCROLL: activity feed — notification-style rows, filled by
               renderFriendFeed(). The "you may know" rails used to sit above it. -->
          <div class="v3-scroll-area">

            <div class="v3-feed-items"></div>

          </div><!-- /v3-scroll-area -->

          <!-- REVIEW PANEL: replaces the feed when the stats box is tapped.
               stopPropagation keeps clicks from bubbling to the viewer's variant-switch wrapper -->
          <div class="v3-review-panel" onclick="event.stopPropagation()" onmousedown="event.stopPropagation()">

            <!-- Top row: streaming links (centered under CD) + your review (aligned to stats text).
                 Uses the bento's 78/22 split so it mirrors with the hand layout. -->
            <div class="v3-rev-top">

              <!-- Your rating + written review + submit — aligned to the stats text.
                   The three squares butt straight onto the CTA and each other
                   (shared borders, no gap) so the four read as one cascading
                   control. They are the same three toggles the log sheet opens
                   with — the point is that marking something listened / later /
                   favourite costs one tap instead of opening the sheet. -->
              <div class="v3-rev-mine">
                <div class="v3-rev-cta-row">
                  <button class="v3-rev-cta" onclick="event.stopPropagation(); openLogSheet(this);">
                    ${SD_ICONS.logbox}
                    <span>Review, rate, log</span>
                  </button>
                  <div class="v3-rev-quick">
                    <button class="v3-rev-q" data-k="listened" title="Listened" onclick="toggleRevAction(this, event)">${SD_ICONS.ear}<span class="v3-rev-q-lbl">Listened</span></button>
                    <button class="v3-rev-q" data-k="later" title="Listen later" onclick="toggleRevAction(this, event)">${SD_ICONS.clock}<span class="v3-rev-q-lbl">Later</span></button>
                    <button class="v3-rev-q" data-k="fav" title="Favorite" onclick="toggleRevAction(this, event)">${SD_ICONS.heart}<span class="v3-rev-q-lbl">Favorite</span></button>
                  </div>
                </div>
              </div>

            </div><!-- /v3-rev-top -->

            <!-- The album's score, large. The compact one-liner under the artist
                 stays as it is — that one is a label on the record, this one is
                 the headline for the ratings section it sits on top of. -->
            <div class="v3-rev-score">
              <span class="v3-rev-score-n"></span>
              <span class="v3-rev-score-sub"></span>
            </div>

            <!-- Rating distribution bars (header text removed, bars kept) -->
            <div class="v3-rev-hist">
              <div class="v3-rev-hist-bars"></div>
              <div class="v3-rev-hist-axis"><span>½</span><span>5</span></div>
            </div>

            <!-- Tracklist — every track, in flow; rate one by tapping its row -->
            <div class="v3-rev-songs"></div>

            <!-- Artist page — grid of the artist's albums (trending style; shown only in --artist state) -->
            <div class="v3-artist-albums"></div>

            <!-- Friend rec tag — shown only when a friend has activity on this album
                 (else algo-served: no tag). Sits with the reviews, below the
                 tracklist: it IS social proof, so it reads as part of that section. -->
            <div class="v3-rev-rec" hidden>
              <span class="v3-rev-rec-av"></span>
              <span class="v3-rev-rec-txt"><b class="v3-rev-rec-name"></b> listened to this</span>
            </div>

            <!-- Other users' reviews — full width -->
            <div class="v3-rev-filters">
              <button class="v3-rev-filter active" data-f="popular" onclick="setReviewFilter(this)">Popular</button>
              <button class="v3-rev-filter" data-f="friends" onclick="setReviewFilter(this)">Friends</button>
              <button class="v3-rev-filter" data-f="new" onclick="setReviewFilter(this)">New</button>
              <span class="v3-rev-count"></span>
            </div>

            <div class="v3-rev-list"></div>

          </div><!-- /v3-review-panel -->
          </div><!-- /v3-body -->

          <!-- NOW-PLAYING TICKER + the CD console that replaces it.
               ⚠ ${nowBar()}, NOT the markup inlined again. Both home variants had
               their own copy of the ticker, so the console the helper now also
               ships simply did not exist on the one screen it matters most on —
               the tap set the state and there was nothing in the plateau to show.
               Exactly the duplication that made bentoHtml() necessary. -->
          ${nowBar()}

          <!-- BOTTOM NAV — shared glass console (see bottomNav helper) -->
          ${bottomNav('home')}

          <!-- Streaming sheet -->
          <div class="v3-stream-overlay" style="display:none" onclick="this.style.display='none'">
            <div class="v3-stream-sheet" onclick="event.stopPropagation()">
              <div class="v3-stream-handle"></div>
              <button class="v3-stream-preview" onclick="playPreview(this, event)">
                <span class="v3-stream-preview-ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
                <span class="v3-stream-preview-txt">Listen to preview</span>
                <span class="v3-stream-preview-dur">0:30</span>
              </button>
              <div class="v3-stream-label">Listen on</div>
              <button class="v3-stream-app">
                <div class="v3-stream-icon" style="background:#1DB954">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.72 13.5 1.56.36.24.54.84.24 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/></svg>
                </div>
                Spotify
              </button>
              <button class="v3-stream-app">
                <div class="v3-stream-icon" style="background:linear-gradient(135deg,#fc3c44,#fc6f32)">
                  <svg width="13" height="16" viewBox="0 0 13 16" fill="white"><path d="M6.5 0L8 3.5 13 4.3l-3.5 3.4.8 4.8L6.5 10.5 2.2 12.5l.8-4.8L0 4.3l5-.8z"/></svg>
                </div>
                Apple Music
              </button>
              <button class="v3-stream-app">
                <div class="v3-stream-icon" style="background:linear-gradient(135deg,#ff5500,#ff8800)">
                  <svg width="17" height="11" viewBox="0 0 24 16" fill="white"><rect x="2" y="7" width="1.8" height="6" rx=".9"/><rect x="6" y="4" width="1.8" height="9" rx=".9"/><rect x="10" y="6" width="1.8" height="7" rx=".9"/><rect x="14" y="2" width="1.8" height="11" rx=".9"/><rect x="18" y="8" width="1.8" height="5" rx=".9"/></svg>
                </div>
                SoundCloud
              </button>
              <div class="v3-stream-label">Save</div>
              <button class="v3-stream-save" onclick="event.stopPropagation(); this.classList.toggle('on')">
                <span class="v3-stream-sico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8a5 5 0 0 1 10 0c0 3-2.2 4.1-3.4 5.3-.8.8-1.2 1.5-1.2 2.7A2.4 2.4 0 0 1 7.6 17"/><path d="M9.6 8.5a2.6 2.6 0 0 1 4.9-.6"/></svg></span>
                <span class="v3-stream-stext">Listened</span>
                <span class="v3-stream-check"></span>
              </button>
              <button class="v3-stream-save" onclick="event.stopPropagation(); this.classList.toggle('on')">
                <span class="v3-stream-sico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/></svg></span>
                <span class="v3-stream-stext">Listen later</span>
                <span class="v3-stream-check"></span>
              </button>
              <button class="v3-stream-save" onclick="event.stopPropagation(); this.classList.toggle('on')">
                <span class="v3-stream-sico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="14" y2="7"/><line x1="4" y1="12" x2="11" y2="12"/><line x1="4" y1="17" x2="11" y2="17"/><line x1="17" y1="10" x2="17" y2="18"/><line x1="13" y1="14" x2="21" y2="14"/></svg></span>
                <span class="v3-stream-stext">Add to playlist</span>
                <span class="v3-stream-check"></span>
              </button>
              <button class="v3-stream-cancel" onclick="this.closest('.v3-stream-overlay').style.display='none'">Cancel</button>
            </div>
          </div>

        </div>`
      }

    ]
  },


  // ── 5. WALL OF ALBUMS ───────────────────────────────────────
  {
    id: 'wall', name: 'Album Wall', statusTheme: 'light',
    variants: [
      { label: 'Float·Dark',  version: 'v1', thumb: ['w80','w80','w80','w80','w80'], get html() { return wallHtml(false); } },
      { label: 'Float·Light', version: 'v2', thumb: ['w80','w80','w80','w80','w80'], get html() { return wallHtml(true);  } },
    ]
  },

  // ── 9. SONG / TRACK ─────────────────────────────────────────
  {
    id: 'song', name: 'Song / Track', statusTheme: 'light',
    variants: [
      { label: 'Float·Dark',  thumb: ['w80','accent','w60','w80','w70'], get html() { return songHtml(false); } },
      { label: 'Float·Light', thumb: ['w80','accent','w60','w80','w70'], get html() { return songHtml(true);  } },
    ]
  },

  // ── 11. PROFILE ─────────────────────────────────────────────
  {
    id: 'profile', name: 'Profile', statusTheme: 'light',
    variants: [
      { label: 'Funky·Dark',  thumb: ['accent','w50','w80','w80','w70'], get html() { return profileHtml(false); } },
      { label: 'Funky·Light', thumb: ['accent','w50','w80','w80','w70'], get html() { return profileHtml(true);  } },
    ]
  },

  // ── 12. PLAYLISTS (Expanded, multi-variant) ─────────────────
  {
    id: 'playlists', name: 'Playlists', statusTheme: 'light',
    variants: [
      { label: 'Float·Dark',  version: 'v2', thumb: ['w80','accent','w60','w80','w70'], get html() { return playlistsHtml(false); } },
      { label: 'Float·Light', version: 'v2', thumb: ['w80','accent','w60','w80','w70'], get html() { return playlistsHtml(true);  } },
    ]
  },

  // ── 11b. EDIT PROFILE (customising, behind the card's pencil) ──
  {
    id: 'profile-edit', name: 'Edit Profile', statusTheme: 'light',
    variants: [
      { label: 'Funky·Dark',  thumb: ['accent','w60','w80','w50','w70'], get html() { return profileEditHtml(false); } },
      { label: 'Funky·Light', thumb: ['accent','w60','w80','w50','w70'], get html() { return profileEditHtml(true);  } },
    ]
  },

  // ── 12a. NEW PLAYLIST (creation, behind the Playlists "+") ──
  {
    id: 'playlist-new', name: 'New Playlist', statusTheme: 'light',
    variants: [
      { label: 'Float·Dark',  version: 'v1', thumb: ['accent','w50','w80','w60','w70'], get html() { return playlistNewHtml(false); } },
      { label: 'Float·Light', version: 'v1', thumb: ['accent','w50','w80','w60','w70'], get html() { return playlistNewHtml(true);  } },
    ]
  },

  // ── 12b. PLAYLIST PAGE (detail) ─────────────────────────────
  {
    id: 'playlist', name: 'Playlist Page', statusTheme: 'light',
    variants: [
      { label: 'Float·Dark',  version: 'v1', thumb: ['accent','w80','w60','w70','w50'], get html() { return playlistPageHtml(false); } },
      { label: 'Float·Light', version: 'v1', thumb: ['accent','w80','w60','w70','w50'], get html() { return playlistPageHtml(true);  } },
    ]
  },

  // ── 13. NOTIFICATIONS (behind the header's bell bubble) ─────
  {
    id: 'notifications', name: 'Notifications', statusTheme: 'light',
    variants: [
      { label: 'Float·Dark',  version: 'v1', thumb: ['w60','accent','w80','w70','w80'], get html() { return notificationsHtml(false); } },
      { label: 'Float·Light', version: 'v1', thumb: ['w60','accent','w80','w70','w80'], get html() { return notificationsHtml(true);  } },
    ]
  },

  // ── 14. SETTINGS (behind the header's gear bubble) ──────────
  {
    id: 'settings', name: 'Settings', statusTheme: 'light',
    variants: [
      { label: 'Float·Dark',  version: 'v1', thumb: ['w50','w80','w60','w80','w70'], get html() { return settingsHtml(false); } },
      { label: 'Float·Light', version: 'v1', thumb: ['w50','w80','w60','w80','w70'], get html() { return settingsHtml(true);  } },
    ]
  },

  // ── 15. SHOP (behind the nav scoop's bag button) ────────────
  {
    id: 'shop', name: 'Shop', statusTheme: 'light',
    variants: [
      { label: 'Float·Dark',  version: 'v1', thumb: ['w50','accent','w70','w80','w60'], get html() { return shopHtml(false); } },
      { label: 'Float·Light', version: 'v1', thumb: ['w50','accent','w70','w80','w60'], get html() { return shopHtml(true);  } },
    ]
  },


];

// ── Helpers ──────────────────────────────────────────────────
function topNav(active) {
  return `
  <div class="top-nav">
    <button class="tn-tab${active==='playlists'?' active':''}" onclick="navigate('playlists')">Playlists</button>
    <button class="tn-tab${active==='home'?' active':''}" onclick="navigate('home')">Home</button>
  </div>`;
}

/* `cssSized` omits the inline width/height so a stylesheet can drive the disc
   size instead. ⚠️ Needed because an inline style beats any rule short of
   `!important`, which is what stops the dev box from tuning a vinyl row. Only
   the album page's headline score passes it today; every other caller keeps the
   inline sizing, which is also what keeps `sz` rounded to a whole pixel. */
function halfStars(rating, size, cssSized) {
  // ×0.72 matches the old ★ glyph's footprint; ROUNDED because a fractional
  // size put every disc in the row on a different sub-pixel boundary, which
  // made them rasterise at visibly different weights (see .hstar in app.css).
  const sz = Math.round((size || 14) * 0.72);
  const st = cssSized ? '' : ` style="width:${sz}px;height:${sz}px"`;
  let out = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i)            out += `<span class="hstar full"${st}></span>`;
    else if (rating >= i - 0.5) out += `<span class="hstar half"${st}></span>`;
    else                         out += `<span class="hstar empty"${st}></span>`;
  }
  return `<span class="hstars">${out}</span>`;
}

function tabBar(active) {
  const tabs = [
    { id:'home',    label:'Home',    icon:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { id:'search',  label:'Search',  icon:'<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>' },
    { id:'review',  label:'+',       icon:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>', plus:true },
    { id:'home',    label:'Activity',icon:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' },
    { id:'profile', label:'Profile', icon:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
  ];
  return `
  <nav class="tab-bar">
    ${tabs.map(t => `
    <button class="tab-item ${t.id===active&&!t.plus?'active':''}" onclick="navigate('${t.id}')">
      <svg viewBox="0 0 24 24" fill="${t.plus?'currentColor':'none'}" stroke="${t.plus?'none':'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg>
      <span>${t.label}</span>
    </button>`).join('')}
  </nav>`;
}

// ─── Constant app furniture (shared across pages) ───────────────
// The header, now-playing ticker, and bottom nav are the same on every page
// that opts into the .s-home-v3 shell. Keep these as the single source of truth.

function appHeader(subtitle) {
  // Optional `subtitle` renders a left-aligned username in the nav, lowered a
  // little below the logo/bubble row (used by the Profile screen).
  const userEl = subtitle ? `<div class="v3-header-user">${subtitle}</div>` : '';
  return `
          <div class="v3-header">
            <div class="v3-header-bubbles">
              <button class="v3-bubble v3-bubble--notif has-notif" title="Notifications" aria-label="Notifications"
                      onclick="navigate('notifications')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="v3-bubble-count">+5</span>
              </button>
            </div>
            <div class="v3-header-brand">
              <div class="v3-header-logo" role="img" aria-label="Spindeck"></div>
              <!-- filled by populateHomeData(). The two home variants are static
                   html templates evaluated ONCE at load, so interpolating
                   PROFILE here would freeze the handle and never follow a
                   persona switch. (No backticks in here - this sits inside a
                   template literal.) -->
              <div class="v3-header-handle"></div>
            </div>
            <div class="v3-header-right">
              <button class="v3-bubble v3-bubble--settings" title="Settings" aria-label="Settings" onclick="navigate('settings')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
              <button class="v3-bubble v3-bubble--search" title="Search" aria-label="Search" onclick="openSearch(this)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              </button>
            </div>
            ${userEl}
          </div>`;
}

/* The nav's hump holds TWO things, one at a time: the friends ticker, and —
   once you tap a CD — the console. `.s-home-v3--console` on the shell swaps them
   and grows the hump to fit (see app.css).
   ⚠ The console itself is NOT here — it is inside `bottomNav()`, as a child of
   the nav. It has to be placed as a % of the nav's own box to stay in the hump
   at every frame size, and only a child can do that. This ticker stays a
   sibling because its px offsets ride the viewer's zoom, as they always did. */
function nowBar() {
  return `
          <div class="v3-nowbar">
            <div class="v3-now-text"></div>
            <div class="v3-now-wave" aria-hidden="true"></div>
          </div>`;
}

// ── Standalone entry/detail screens, themed as dark + light pairs ──
// They share the older .app-screen component CSS; the sd-theme-* scope class
// re-points --bg/--surface/--text/etc. to the current Spindeck palette.
function sdTheme(light) { return light ? 'sd-theme-light' : 'sd-theme-dark'; }

function authHtml(light) {
  return `
      <div class="app-screen s-auth ${sdTheme(light)}">
        <div class="auth-hero">
          <!-- The turntable icon is 2-tone (black body, light centre dot), so it
               ships as real black/white PNGs rather than a themed CSS mask. -->
          <img class="auth-logo-mark" src="images/spindeck-icon${light ? '' : '-white'}.png" alt="">
          <div class="auth-appname" role="img" aria-label="Spindeck"></div>
        </div>
        <div class="auth-body">
          <div class="field-group">
            <div class="field"><label>Email</label><input type="email" placeholder="you@example.com"></div>
            <div class="field"><label>Password</label><input type="password" placeholder="••••••••"></div>
          </div>
          <button class="btn-primary" style="margin-top:8px" onclick="obStart()">Sign In</button>
          <div class="divider" style="margin:16px 0">or</div>
          <button class="btn-outline" onclick="obStart()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <button class="link-btn" style="margin-top:20px" onclick="obStart()">Don't have an account? <span style="color:var(--accent)">Sign Up</span></button>
        </div>
      </div>`;
}

// Service brand marks (reused from the streaming sheets).
const OB_SVC_ICONS = {
  spotify:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.72 13.5 1.56.36.24.54.84.24 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/></svg>`,
  apple:      `<svg viewBox="0 0 13 16" fill="currentColor"><path d="M6.5 0L8 3.5 13 4.3l-3.5 3.4.8 4.8L6.5 10.5 2.2 12.5l.8-4.8L0 4.3l5-.8z"/></svg>`,
  soundcloud: `<svg viewBox="0 0 24 16" fill="currentColor"><rect x="2" y="7" width="1.8" height="6" rx=".9"/><rect x="6" y="4" width="1.8" height="9" rx=".9"/><rect x="10" y="6" width="1.8" height="7" rx=".9"/><rect x="14" y="2" width="1.8" height="11" rx=".9"/><rect x="18" y="8" width="1.8" height="5" rx=".9"/></svg>`,
};
function obServiceBtn(id, name, brand) {
  return `<button class="ob-svc" data-svc="${id}" onclick="obConnect('${id}')">
    <span class="ob-svc-ico" style="background:${brand}">${OB_SVC_ICONS[id]}</span>
    <span class="ob-svc-name">${name}</span>
    <span class="ob-svc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
    <span class="ob-svc-cta">Connect</span>
  </button>`;
}

/* The ORIGINAL flat genre list. ⚠ NOTHING READS IT ANY MORE: it was the dial's
   twenty holes until the dial grew two levels (`SD_GENRE_TREE`, below), and it
   was onboarding's chips until step 3 went over to the tree as well
   (2026-09-03). Kept as the editorial order it was — related genres adjacent —
   in case a flat picker ever needs one again. Plain strings — the `&` is a
   real ampersand and gets escaped at render, not stored pre-escaped. */
const SD_GENRES = ['Electronic','Ambient','Trip-hop','Dream Pop','Shoegaze','Indie',
  'Alternative','Punk','Metal','Rock','Pop','Latin','Country','Folk','Blues','Jazz',
  'Funk','Soul','R&B','Hip-Hop'];

/* ══════════════════════════════════════════════════════════════════════════
   SD_GENRE_TREE — the mix dial's two levels
   ══════════════════════════════════════════════════════════════════════════
   Sixteen main genres in the first ring; tapping one takes you into a ring of
   its subgenres, where the picking happens. ⚠ It has TWO readers: Pro's dial in
   the bento, and onboarding's step 3 — the same dial (via the `OB_MIX` context
   in app.js) plus a list view of this same tree (`obRenderGenreList`).

   ⚠ EVERY LABEL HERE EARNS ITS PLACE AGAINST THE REAL ARCHIVE. `shelfPool`
   matches a pick by lowercased CONTAINMENT against an album's primary genre, so
   a label nothing contains is a hole in the dial that silently returns zero —
   which is exactly what the flat dial shipped with (ten of its twenty genres
   matched nothing). Checked before writing this: all 40 subs below match at
   least one album, and the mains land at Pop 69 · Hip-Hop 62 · Electronic 52 ·
   Alternative 40 · Rock 38 · R&B 14 · Indie 6 · Jazz 1.
   ⚠ Re-run that count if you edit this list. A sub that matches nothing looks
   identical to one that does until someone picks it.

   ⚠ Subs may belong to more than one main on purpose — Indie rock is under both
   Rock and Indie, Trip-hop under Electronic and Hip-Hop. Picking is a FILTER,
   not a partition, so overlap costs nothing and matches how people actually
   look for music.
   ⚠ Jazz is thin on its own (1). It works because "All Jazz" expands to the
   main PLUS every sub under it (see `mixShelf`), so it reaches Classical, Folk
   and Soundtrack too. Any main can be thin for the same reason.

   ⚠ A LABEL MUST STAY A SUBSTRING OF THE GENRE IT MEANS. Matching is
   containment, so a name can be shortened to fit the dial only along that rule:
   "Experimental hip-hop" → "Experimental" works, "Psychedelic rock" →
   "Psych rock" matches nothing at all. Three are shortened here because they
   overflowed their slice even fully condensed — and they read fine, because
   inside the Hip-Hop ring "Korean" does not need to say hip-hop again. ⚠ The
   one cost: "Psychedelic" under Rock also catches Psychedelic pop.
   ══════════════════════════════════════════════════════════════════════════ */
const SD_GENRE_TREE = {
  'Electronic':  ['Ambient', 'Techno', 'House', 'Trance', 'Drum & Bass', 'Dubstep', 'IDM', 'Downtempo',
                  'Trip-hop', 'UK Garage', 'Breakbeat', 'Synthpop', 'Electro', 'Hyperpop', 'Jungle'],
  'Rock':        ['Alternative rock', 'Art rock', 'Psychedelic', 'Noise rock', 'Indie rock', 'J-rock',
                  'Prog rock', 'Garage rock', 'Grunge', 'Hard rock', 'Surf rock', 'Post-rock',
                  'Blues rock', 'Glam rock', 'Stoner rock'],
  'Alternative': ['Alternative rock', 'Art rock', 'Art pop', 'Shoegaze', 'Dream pop', 'Noise rock',
                  'Post-rock', 'Emo', 'Slowcore', 'Math rock', 'Post-punk', 'Grunge', 'Sadcore',
                  'Noise pop', 'Post-hardcore'],
  'Indie':       ['Indie rock', 'Indie pop', 'Indie Folk', 'Dream pop', 'Shoegaze', 'Bedroom pop',
                  'Jangle pop', 'Lo-fi', 'Slowcore', 'Twee', 'Chamber pop', 'Anti-folk',
                  'Indie electro', 'Baroque pop', 'Sunshine pop'],
  'Pop':         ['K-Pop', 'J-pop', 'Art pop', 'Indie pop', 'Psychedelic pop', 'Hyperpop', 'Synthpop',
                  'Dance pop', 'Bedroom pop', 'Chamber pop', 'Power pop', 'City pop', 'Electropop',
                  'Teen pop', 'Bubblegum'],
  'Hip-Hop':     ['Experimental', 'Korean', 'Grime', 'Trip-hop', 'Boom bap', 'Trap', 'Drill',
                  'Conscious', 'Jazz rap', 'Cloud rap', 'Abstract', 'Gangsta', 'G-funk', 'Horrorcore',
                  'Lo-fi hip-hop'],
  'R&B':         ['Neo-soul', 'Electronic soul', 'Soul', 'Funk', 'Contemporary', 'Quiet storm',
                  'Motown', 'Disco', 'Gospel', 'Doo-wop', 'New jack swing', 'Alternative',
                  'Southern soul', 'Psychedelic soul', 'Boogie'],
  'Jazz':        ['Jazz', 'Bebop', 'Fusion', 'Free jazz', 'Spiritual jazz', 'Nu jazz', 'Lounge',
                  'Swing', 'Cool jazz', 'Hard bop', 'Modal', 'Big band', 'Ragtime', 'Smooth jazz',
                  'Jazz funk'],
  'Metal':       ['Heavy metal', 'Death metal', 'Black metal', 'Doom', 'Sludge', 'Thrash', 'Metalcore',
                  'Post-metal', 'Nu metal', 'Prog metal', 'Power metal', 'Folk metal', 'Grindcore',
                  'Speed metal', 'Symphonic'],
  'Punk':        ['Punk', 'Post-punk', 'Hardcore', 'Pop punk', 'Art punk', 'Proto-punk', 'Skate punk',
                  'Anarcho', 'Oi', 'Egg punk', 'Crust', 'Riot grrrl', 'Garage punk', 'No wave'],
  'Folk':        ['Folk', 'Indie Folk', 'Freak folk', 'Americana', 'Songwriter', 'Bluegrass',
                  'Chamber folk', 'Folk rock', 'Traditional', 'Sea shanty', 'Celtic', 'Appalachian',
                  'Psych folk', 'Nordic folk'],
  'Country':     ['Country', 'Alt-country', 'Americana', 'Bluegrass', 'Outlaw', 'Honky tonk',
                  'Nashville', 'Country rock', 'Bakersfield', 'Western swing', 'Cowpunk',
                  'Country pop', 'Red dirt'],
  'World':       ['Asian Music', 'Afrobeat', 'Latin', 'Reggae', 'Dub', 'Highlife', 'Bossa nova',
                  'Cumbia', 'Ska', 'Soca', 'Samba', 'Flamenco', 'Fado', 'Rai', 'Qawwali'],
  'Classical':   ['Classical', 'Minimalism', 'Opera', 'Chamber', 'Baroque', 'Romantic', 'Choral',
                  'Symphony', 'Concerto', 'Sonata', 'Renaissance', 'Impressionist', 'Serialism',
                  'Neoclassical', 'Requiem'],
  'Soundtrack':  ['Soundtrack', 'Film score', 'Video game', 'Anime', 'Musical', 'TV score', 'Trailer',
                  'Library', 'Orchestral', 'Synth score', 'Jazz score', 'Horror score',
                  'Western score', 'Documentary', 'Ambient score'],
  'Experimental':['Experimental', 'Noise', 'Drone', 'Avant-garde', 'Improvisation', 'Field recording',
                  'Musique concrete', 'Lowercase', 'Plunderphonics', 'Glitch', 'Onkyo', 'Sound art',
                  'Electroacoustic', 'Tape music', 'Harsh noise'],
};



/* ── sdPlate() — a machined plate ──────────────────────────────────────────
   A polygon whose every vertex is a CIRCLE, joined by straight runs: give it
   `[{x, y, r}, …]` clockwise (screen y-down) and it returns the outline `d`.
   Because the runs lie on the polygon's own edges, two vertices sharing an x
   or a y give an exactly vertical / horizontal edge NO MATTER what radii they
   carry — which is the whole point. The corner radius only cuts the corner, it
   never tilts the run, so the shape stays on the grid while the circles vary.
   Concave vertices need no special casing: the sweep flag just flips.        */
function sdPlate(pts) {
  const n = pts.length, f = v => (Math.round(v * 100) / 100);
  const c = pts.map((P, i) => {
    const A = pts[(i - 1 + n) % n], B = pts[(i + 1) % n];
    const h = (a, b) => { const x = a.x - b.x, y = a.y - b.y, l = Math.hypot(x, y); return { x: x / l, y: y / l }; };
    const u1 = h(A, P), u2 = h(B, P);                      // toward the neighbours
    const dot = Math.max(-1, Math.min(1, u1.x * u2.x + u1.y * u2.y));
    const t = P.r / Math.tan(Math.acos(dot) / 2);          // tangent setback
    return {
      in:  { x: P.x + u1.x * t, y: P.y + u1.y * t },
      out: { x: P.x + u2.x * t, y: P.y + u2.y * t },
      // cross < 0 ⇒ the outline turns clockwise through this corner
      sweep: (u1.x * u2.y - u1.y * u2.x) < 0 ? 1 : 0,
    };
  });
  return c.map((k, i) =>
    `${i ? 'L' : 'M'} ${f(k.in.x)} ${f(k.in.y)} A ${pts[i].r} ${pts[i].r} 0 0 ${k.sweep} ${f(k.out.x)} ${f(k.out.y)}`
  ).join(' ') + ' Z';
}

/* The arc CENTRE of every corner, so the construction circles drawn on the
   blueprint are the real ones the outline was cut from — not eyeballed copies.
   Also returns the outward direction, which is what the offset ghosts ride. */
function sdPlateHubs(pts) {
  const n = pts.length;
  return pts.map((P, i) => {
    const A = pts[(i - 1 + n) % n], B = pts[(i + 1) % n];
    const h = (a, b) => { const x = a.x - b.x, y = a.y - b.y, l = Math.hypot(x, y); return { x: x / l, y: y / l }; };
    const u1 = h(A, P), u2 = h(B, P);
    const dot = Math.max(-1, Math.min(1, u1.x * u2.x + u1.y * u2.y));
    let bx = u1.x + u2.x, by = u1.y + u2.y; const bl = Math.hypot(bx, by);
    const d = P.r / Math.sin(Math.acos(dot) / 2);            // hub sits down the bisector
    const cx = P.x + (bx / bl) * d, cy = P.y + (by / bl) * d;
    const ox = P.x - cx, oy = P.y - cy, ol = Math.hypot(ox, oy);
    // ⚠ At a CONCAVE corner the hub sits outside the material — the fillet is
    // cut from the void. Anything solid (a bolt) has to skip those.
    const convex = (u1.x * u2.y - u1.y * u2.x) < 0;
    return { x: cx, y: cy, r: P.r, ox: ox / ol, oy: oy / ol, convex };
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   THE PLATE — onboarding's layout is construction geometry, not decoration
   ══════════════════════════════════════════════════════════════════════════
   Every number the step-0 screen uses lives here, in a 369×424 viewBox that
   renders 1:1 (369 = the 385px screen less an 8px margin each side). Change a
   vertex and the outline, the construction circles, the bolt holes and the
   ghosts all move together — they are all derived from this one list.

   ⚠ The runs stay orthogonal because consecutive vertices SHARE an x or a y.
   The radii are free to vary; a corner radius cuts the corner, it never tilts
   the run. The single exception is D→E, a deliberate 45° — the diagonal of the
   grid square, so it is still on the grid.                                   */
const OB_PLATE = [
  { x:   0, y:   0, r: 44 },   // A  top-left
  { x: 369, y:   0, r: 44 },   // B  top-right
  { x: 369, y: 336, r: 28 },   // C  where the full-width body ends
  { x: 272, y: 336, r: 20 },   // D  notch shoulder — the one CONCAVE corner
  { x: 144, y: 464, r: 28 },   // E  bottom bolt, on the 45° run from D
  { x:   0, y: 464, r: 44 },   // F  bottom-left
];
/* The rig, one level down — drawn in belt-lab.html and saved as
   `Onboarding_Name`, in the PANEL frame, so these already ARE plate
   coordinates. Two equal r26 decks on the x=44 / x=325 rules the top corner
   hubs set (each sits directly under a corner circle — that alignment is the
   whole payoff, so if you move the corner radii move these with them), and a
   big r50 wheel centred on the plate (369/2 ≈ 184) for the belt to hang from.
   Clearance 9 puts the top run at y=213 and the bottom of the loop at y=383.

   ⚠ THE BELT PATH IS SOLVED, NOT PASTED. `belt.js` loads before this file, so
   `obPlateSvg` asks SD_BELT for the shape the same way the lab does — the
   onboarding belt and the lab cannot drift apart, and moving a wheel here is
   one number, not a number and a hand-copied `d`. */
const OB_RIG = {
  gap: 9,
  wheels: [
    { x:  44, y: 248, r: 26, side: 1, pin: true },   // deck
    { x: 325, y: 248, r: 26, side: 1, pin: true },   // idler — its bolt lights when the handle is good
    { x: 184, y: 324, r: 50, side: 1, pin: true },   // the wheel the label hangs inside
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
   ⚠ NOTHING CALLS obPlateSvg ANY MORE — step 0 is plain flow now.
   ══════════════════════════════════════════════════════════════════════════
   The plate, the construction circles and the belt rig are all still here and
   all still correct; the panel simply stopped drawing them. Put
   `${obPlateSvg()}` back inside a `.ob-plate` wrapper in step 0 to bring the
   machine back — and see the plate-on/plate-off table in CLAUDE.md, because the
   overlay positions are absolute percentages of the 369×464 box and have to go
   back with it.
   ══════════════════════════════════════════════════════════════════════════ */

/* ⚠ ONE construction circle per corner, and no second pass.
   There WAS an offset "ghost" layer — every circle drawn again 8px outward —
   and it is what made the screen look busy: it doubled every line, and the
   ghosts collided with the neighbours their originals cleared. With one layer
   the composition is provably clean: no two circles here overlap. If you ever
   move a vertex, that is the property to re-check. */
function obPlateSvg() {
  const hubs = sdPlateHubs(OB_PLATE);
  const R = OB_RIG, n = v => Math.round(v * 100) / 100;
  // The groove is a PROPORTION (19/26), so the big wheel gets the same face as
  // the small ones rather than a hard-coded radius that only suits one size.
  const wheel = (w, hub) => `
        <circle class="obp-wheel"  cx="${w.x}" cy="${w.y}" r="${w.r}"/>
        <circle class="obp-groove" cx="${w.x}" cy="${w.y}" r="${n(w.r * 0.7308)}"/>` +
        (hub ? `
        <circle class="obp-hub" cx="${w.x}" cy="${w.y}" r="4.5"/>` : '');
  /* ⚠ THE PLATE BEHIND THE RIG IS OFF. It was the machined outline, the two
     x rules and the six construction circles — the thing that made this panel a
     drawing rather than a form. It reads as background noise behind the rig, so
     it is switched off rather than deleted: `OB_PLATE`, `sdPlate` and
     `sdPlateHubs` are all still here and still correct, and this one word
     brings the whole thing back. Nothing else needs to change to do it — the
     layout below is derived from the RIG, not the plate. */
  const OB_PLATE_ON = false;
  const plate = !OB_PLATE_ON ? '' : `
        <!-- The grid the circles guide: the two verticals through the top
             corner hubs. x=44 is the text column AND the deck pulley's axis. -->
        <g class="obp-rule">
          <line x1="44" y1="0" x2="44" y2="464"/>
          <line x1="325" y1="0" x2="325" y2="464"/>
        </g>
        <!-- The construction circles, whole — not just the arcs they lent. -->
        <g class="obp-cons">${hubs.map(h =>
          `<circle cx="${n(h.x)}" cy="${n(h.y)}" r="${h.r}"/>`).join('')}</g>

        <path class="obp-edge" d="${sdPlate(OB_PLATE)}"/>

        <g class="obp-bolt">${hubs.filter(h => h.convex).map(h =>
          `<circle cx="${n(h.x)}" cy="${n(h.y)}" r="4.5"/>`).join('')}</g>`;
  return `
      <svg class="obp" viewBox="0 0 369 464" aria-hidden="true">${plate}
        <!-- The rig. The idler carries the bolt that lights when the handle is
             good; the label hangs in the clear band between the top run (213)
             and the big wheel (265). -->
        <path class="obp-belt" d="${SD_BELT.taut(R.wheels, R.gap).d}"/>
        ${wheel(R.wheels[0], false)}
        ${wheel(R.wheels[1], true)}
        ${wheel(R.wheels[2], false)}
      </svg>`;
}


function onboardingHtml(light) {
  return `
      <div class="app-screen s-onboarding ${sdTheme(light)}">
        <!-- The progress BELT. 23px off the top, 8px off left and right, 12px thick,
             stadium caps — the same object as the handle rig below it, at a
             different scale. White as it fills, grey where it hasn't. -->
        <div class="ob-top">
          <div class="ob-progress"><div class="ob-prog-bar"></div></div>
        </div>
        <div class="ob-rail">
          <button class="ob-back" onclick="obBack()" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="ob-stepcount"><span class="ob-step-n">01</span><i>/</i><span class="ob-step-t">08</span></div>
        </div>

        <div class="ob-stage">

          <!-- 0 · USERNAME — the whole panel is one machined plate.
               Geometry: OB_PLATE / OB_RIG above; outline from sdPlate,
               circles from sdPlateHubs, so the drawing and the shape cannot
               drift apart. Text and field are HTML laid over it in the SVG's
               own percentages, on the x=44 rule the corner hubs set. -->
          <section class="ob-panel ob-panel--user" data-step="0">
            <div class="ob-h">
              <div class="ob-eyebrow">01 · Handle</div>
              <div class="ob-title">Claim your handle</div>
              <div class="ob-sub">This is how friends find you on Spindeck.</div>
            </div>

            <!-- ⚠ A <label>, so the whole slot focuses the field natively. It
                 used to be a div with the input stretched over it and
                 pointer-events juggling to stop the @ eating clicks; the
                 element that means "this labels that control" does it for
                 free. -->
            <label class="ob-user-well">
              <span class="ob-at">@</span>
              <input class="ob-user-input" type="text" placeholder="username" maxlength="18"
                     autocomplete="off" spellcheck="false" oninput="obSetUsername(this.value)">
            </label>

            <!-- Budget, rule, reassurance — centred, straight under the field.
                 The note answers the rule directly above it: that line is what
                 makes anyone think but I want a real name. -->
            <div class="ob-user-read">
              <div class="ob-user-meter"><i></i><i></i><i></i><i class="ob-gate"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
              <div class="ob-user-hint">4–18 chars · a–z 0–9 _</div>
              <div class="ob-user-note">Don't worry — you'll be able to pick a nickname too.</div>
            </div>
          </section>

          <!-- 1 · CONNECT -->
          <section class="ob-panel" data-step="1">
            <div class="ob-h">
              <div class="ob-title">Bring your music</div>
              <div class="ob-sub">Connect a service so your library and listening come with you.</div>
            </div>
            <div class="ob-services">
              ${obServiceBtn('spotify','Spotify','#1DB954')}
              ${obServiceBtn('apple','Apple Music','linear-gradient(135deg,#fc3c44,#fc6f32)')}
              ${obServiceBtn('soundcloud','SoundCloud','linear-gradient(135deg,#ff5500,#ff8800)')}
            </div>
            <div class="ob-note">Optional — you can connect later in settings.</div>
          </section>

          <!-- 2 · TRACKING (only shown when a service is connected) -->
          <section class="ob-panel" data-step="2">
            <div class="ob-h">
              <div class="ob-title">Share your listening?</div>
              <div class="ob-sub">Let friends see what you're playing — like a live scrobble on your profile.</div>
            </div>
            <div class="ob-track-card">
              <div class="ob-track-wave"><i></i><i></i><i></i><i></i><i></i></div>
              <div class="ob-track-txt">
                <div class="ob-track-now">Now playing</div>
                <div class="ob-track-song">friends can see this on your profile</div>
              </div>
            </div>
            <div class="ob-track-opts">
              <button class="ob-track-opt" data-track="1" onclick="obSetTracking(true)">Allow · share my activity</button>
              <button class="ob-track-opt" data-track="0" onclick="obSetTracking(false)">Keep it private</button>
            </div>
          </section>

          <!-- 3 · GENRES — Pro's mix dial, and a list of the same tree.
               ⚠ The dial was here once, left for Pro because a first-timer's
               first thirty seconds is no place to teach a gesture, and is BACK
               by decision (2026-09-03) — with the list one switch away as the
               instantly-legible route through. Same SD_GENRE_TREE, same
               OB.genres, whichever view you pick from. The dial itself is
               built by obMixBuild (app.js) into .ob-mix, the way
               mixInlineBuild builds it into the bento; the list is rendered by
               obRenderGenreList into .ob-glist. One row above the views: the
               DIAL's back (left — one ring up, shown only inside a main; it is
               the wheel's own back, NOT the rail's, which is the step's) and
               the Wheel | List switch (right), level with each other. The
               chip row is the .ob-picks-dock between the stage and the footer,
               so it sits against Continue and never moves the wheel. -->
          <section class="ob-panel ob-panel--genres" data-step="3">
            <div class="ob-h">
              <div class="ob-title">What do you listen to?</div>
              <div class="ob-sub">Pick a few — we'll personalise your feed.</div>
            </div>
            <div class="ob-view-row">
              <button class="ob-mix-back" type="button" onclick="obMixBack()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                All genres
              </button>
              <div class="ob-view" role="tablist" aria-label="Genre picker view">
                <button class="ob-view-btn" type="button" data-view="wheel" onclick="obSetGenreView('wheel')">Wheel</button>
                <button class="ob-view-btn" type="button" data-view="list"  onclick="obSetGenreView('list')">List</button>
              </div>
            </div>
            <div class="ob-genres" data-genres="wheel">
              <div class="ob-mix"></div>
            </div>
            <div class="ob-genres" data-genres="list">
              <div class="ob-glist"></div>
            </div>
          </section>

          <!-- 4 · ARTISTS -->
          <section class="ob-panel" data-step="4">
            <div class="ob-h">
              <div class="ob-title">Follow some artists</div>
              <div class="ob-sub">Search or tap to follow. <b>3+</b> makes your feed way better.</div>
            </div>
            <div class="ob-searchbar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
              <input type="text" placeholder="Search artists" autocomplete="off" spellcheck="false" oninput="obSearch('artists', this.value)">
            </div>
            <div class="ob-wall" data-wall="artists"></div>
          </section>

          <!-- 5 · ALBUMS -->
          <section class="ob-panel" data-step="5">
            <div class="ob-h">
              <div class="ob-title">Any favourite albums?</div>
              <div class="ob-sub">The records that made you. <b>3+</b> recommended.</div>
            </div>
            <div class="ob-searchbar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
              <input type="text" placeholder="Search albums" autocomplete="off" spellcheck="false" oninput="obSearch('albums', this.value)">
            </div>
            <div class="ob-wall ob-wall--albums" data-wall="albums"></div>
          </section>

          <!-- 6 · PEOPLE YOU MAY KNOW -->
          <section class="ob-panel" data-step="6">
            <div class="ob-h">
              <div class="ob-title">People you may know</div>
              <div class="ob-sub">From your contacts and services. Follow a few to start.</div>
            </div>
            <div class="ob-people" data-people="1"></div>
          </section>

          <!-- 7 · PROFILE (payoff) -->
          <section class="ob-panel ob-panel--profile" data-step="7">
            <div class="ob-profile" data-profile="1"></div>
          </section>

        </div>

        <!-- THE DOCK — what you have picked on this step, against Continue:
             genres (3), artists (4), albums (5), people (6). Outside the
             scrolling stage, so it is always in reach and never pushes the
             wheel or the walls. Two rows, then a fade (is-over, measured in
             obSyncDock). The walls' .ob-pinned rows moved here. -->
        <!-- .ob-foot: dock + footer as ONE block. On the scrolling steps it is
             an OVERLAY on the stage (.ob-stage-fade), and the stage's mask fades
             the wall out across exactly its height — so cards run under the
             picks and the buttons and reach obscurity at the bottom edge,
             instead of stopping at a line a quarter of the way up the phone. -->
        <div class="ob-foot">
          <div class="ob-picks-dock is-empty"></div>
          <div class="ob-footer">
            <button class="ob-skip" onclick="obNext(true)">Skip</button>
            <button class="ob-next btn-primary" onclick="obNext()">Continue</button>
          </div>
        </div>
      </div>`;
}

function songHtml(light) {
  return `
      <div class="app-screen s-song ${sdTheme(light)}">
        <div class="app-nav">
          <button class="app-nav-btn" onclick="navigate('album')"><span class="app-nav-back">‹</span></button>
          <div class="app-nav-title">Track</div>
          <div style="width:28px"></div>
        </div>
        <div class="song-header">
          <div class="song-art" style="background-image:url('images/album-punisher.png');background-size:cover;background-position:center"></div>
          <div class="song-info">
            <div class="song-title">Garden Song</div>
            <div class="song-album" onclick="navigate('album')">Punisher · 2020</div>
            <div class="song-artist" onclick="navigate('artist')">Phoebe Bridgers</div>
          </div>
        </div>
        <div class="song-stats">
          <div class="album-stat">
            <div class="album-stat-val">${halfStars(5, 13)}</div>
            <div class="album-stat-lbl">avg 4.9</div>
          </div>
          <div class="album-stat"><div class="album-stat-val">—</div><div class="album-stat-lbl">yours</div></div>
          <div class="album-stat"><div class="album-stat-val">48k</div><div class="album-stat-lbl">logged</div></div>
        </div>
        <div style="padding:0 20px 20px">
          <div class="section-title" style="margin:16px 0 10px">Rate This Track</div>
          <div class="star-picker">
            <span class="star-pick filled">★</span><span class="star-pick filled">★</span>
            <span class="star-pick filled">★</span><span class="star-pick filled">★</span>
            <span class="star-pick">★</span>
          </div>
          <div style="font-size:12px;color:var(--text3);margin-top:6px">half stars supported · tap to rate</div>
          <div class="section-title" style="margin:20px 0 10px">Popular Reviews</div>
          <div class="mini-review">
            <div class="mr-header">
              <div class="avatar mr-avatar"><div class="avatar-placeholder" style="font-size:10px">EP</div></div>
              <div class="mr-username">echoplex</div>
              <div>${halfStars(5, 11)}</div>
            </div>
            <div class="mr-text">"grew the garden where i lay. she is absolutely unwell and so am i now"</div>
          </div>
          <div class="mini-review">
            <div class="mr-header">
              <div class="avatar mr-avatar"><div class="avatar-placeholder" style="font-size:10px;background:linear-gradient(135deg,#164e63,#0284c7)">SF</div></div>
              <div class="mr-username">staticfog</div>
              <div>${halfStars(5, 11)}</div>
            </div>
            <div class="mr-text">"the opening track that sets the whole album's tone. devastating"</div>
          </div>
        </div>
      </div>`;
}

// Profile — "Regular" theme. A short, wide embossed card traced from
// ProfileTheme_Regular.svg (690×401): a left pane holding the profile picture,
// a right pane with location/occupation + bio + the four stat numbers, and a
// rounded Follow pill in the card's bottom-right notch. The 5 favourite-album
// wells sit as a horizontal row of embossed-in circles below the card, and a
// review-history feed follows. Home shell (header · v3-body · nowBar ·
// bottomNav). Funky·Dark / Funky·Light.
// The profile CARD itself (the embossed silhouette + name banner + picture +
// bio + stats + the five favourite-album CDs). Shared, because the Edit Profile
// screen shows the very same card live above its form — building it twice would
// let the preview drift from the real thing.
//   P            the record to draw (PROFILE, or the edit screen's draft)
//   opts.edit    true on the edit screen: no Follow button (it's your own page),
//                the pencil is dropped, and a CD goes straight to the album
//                picker instead of the listen/platforms menu.
/* ══ TAGS — the labels under your name ══════════════════════════════════
   ⚠ These REPLACED "occupation", which was a free-text line saying what you do
   for money. A tag says what you are about, it is CHOSEN from a set rather than
   typed, and — the point — it is a thing you COLLECT. The plain ones are free
   and everyone has them; the specific ones are bought in the shop or handed out
   at something you actually went to. "DaisyChainsFestival2026" is only worth
   wearing because not everyone can.

   ⚠ `tint` is an "R,G,B" TRIPLE, not a hex colour — that is the shop's own
   convention (`.shop-field--tint` does `rgba(var(--tint), .13)`), and a tag has
   to look like the same object on a profile and on a storefront tile.
   ⚠ Anything with a `price` has to be earned; everything else is owned by
   definition. Ownership itself lives in `SD_TAG_OWNED` (app.js) and lasts one
   session, deliberately — see the note there. */
window.SD_TAG_MAX = 3;               // how many you can wear at once

/* ⚠ `tex` names a TEXTURE, one of the `.sd-tex--*` classes in app.css. A tag is
   a thing you collect, and a flat coloured pill does not read as one — a metal
   head's tag should look like brushed steel and a festival's should look like
   the field it was handed out in. That is most of what makes a rare one worth
   wearing at a glance.

   ⚠ The textures are CSS GRADIENTS, not image files, and that is deliberate for
   three reasons: a chip is ~26px tall, where a photographic texture is mush; the
   good free tiling sets (Transparent Textures, Subtle Patterns) are CC-BY and
   carry a real attribution obligation on a shipped app; and gradients cost zero
   requests and re-tint themselves per tag from `--tint`.
   ⚠ They are FILLER by intent. Swapping one for a real image later is a single
   `--tex` value per texture (`url(images/tex-metal.png)` + a `--tex-size`) with
   nothing else in the system to change. */
window.SD_TAGS = [
  // ── free: the basics, and they are meant to be a bit funny ──
  { id: 'catlover',   label: 'cat lover',        tint: '224,97,111', tex: 'fur' },
  { id: 'metalhead',  label: 'metal head',       tint: '184,188,198', tex: 'metal' },
  { id: 'vinylonly',  label: 'vinyl only',       tint: '232,168,60',  tex: 'groove' },
  { id: 'nightowl',   label: 'night owl',        tint: '91,124,196',  tex: 'stars' },
  { id: 'shoegazer',  label: 'shoegazer',        tint: '168,124,196', tex: 'haze' },
  { id: 'noskips',    label: 'no skips',         tint: '79,168,160',  tex: 'stripe' },
  { id: 'carcrier',   label: 'cries in the car', tint: '124,168,120', tex: 'rain' },
  { id: 'firstpress', label: 'first press',      tint: '200,73,47',   tex: 'paper' },
  // ── collectible: a place, a night, a year. The whole value is specificity ──
  { id: 'daisychains2026', label: 'DaisyChainsFestival2026', tint: '232,168,60', tex: 'flower',
    note: 'Daisy Chains · Bristol, Jun 2026', price: '$2' },
  { id: 'bluenote85',      label: 'BlueNote85',              tint: '91,124,196', tex: 'halftone',
    note: 'Blue Note, 85th anniversary press',  price: '$2' },
  { id: 'slowdive24',      label: 'SlowdiveTour24',          tint: '168,124,196', tex: 'haze',
    note: 'Slowdive, the 2024 run',             price: '$3' },
  { id: 'basementshow',    label: 'BasementShow',            tint: '200,73,47',  tex: 'concrete',
    note: 'You were at the small one',          price: '$1' },
  { id: 'rsd2026',         label: 'RecordStoreDay2026',      tint: '79,168,160', tex: 'tape',
    note: 'Queued in the rain, apparently',     price: '$2' },
];

/* The texture class for a tag, or ''. ⚠ One helper, used by the profile chip,
   the form chip, the storefront row AND the picker's own `.pp-tag` — a tag that
   is brushed steel on your profile and flat grey in the sheet you picked it from
   is two different objects. */
window.sdTagTex = t => (t && t.tex) ? ' sd-tex--' + t.tex : '';

/* The tags a profile is WEARING, as objects.
   ⚠ Falls back to a seeded pair when `P.tags` is unset. Every profile the
   mockup deals — the personas, a random visitor, a friend's page — arrives
   without the field, and a row that is empty on every page but your own says
   the feature is broken rather than unused. Seeded off the handle so a friend's
   page says the same thing twice running.
   ⚠ profMix before the modulo: dzSeed is linear under a small remainder. */
window.profTags = function (P) {
  const all = window.SD_TAGS || [];
  /* ⚠ COLLECTIBLES LEAD. An event tag is the one thing in the row that nobody
     else can say; sitting third behind two "cat lover"s it may as well not be
     there. Array.sort is stable, so everything else keeps the order it had. */
  const lead = list => list.slice().sort((a, b) => (b.price ? 1 : 0) - (a.price ? 1 : 0));
  const ids = P && P.tags;
  if (ids) return lead(ids.map(id => all.find(t => t.id === id)).filter(Boolean)).slice(0, SD_TAG_MAX);

  const free = all.filter(t => !t.price);
  const paid = all.filter(t => t.price);
  if (!free.length) return [];
  const raw = (typeof dzSeed === 'function') ? dzSeed : ((...a) => a.join('').length);
  const seed = String((P && (P.handle || P.name)) || 'you');
  const out = [];
  /* ⚠ ROUGHLY ONE PROFILE IN THREE wears an event. Not everyone, because a tag
     everyone has is the opposite of a collectible — the row has to be mostly
     plain for the specific ones to mean anything when you scroll past one. Not
     nobody, because a feature you never see in the mockup isn't in the mockup. */
  if (paid.length && profMix(raw(seed, 'ev')) % 3 === 0) {
    out.push(paid[profMix(raw(seed, 'ev2')) % paid.length]);
  }
  for (let i = 0; out.length < 2 && i < free.length * 3; i++) {
    const t = free[profMix(raw(seed, 'tg', i)) % free.length];
    if (out.indexOf(t) < 0) out.push(t);
  }
  return lead(out).slice(0, SD_TAG_MAX);
};

// One chip. Shared by the profile row, the edit form and the storefront, so a
// tag cannot look like three different objects in three places.
window.tagChip = t =>
  `<span class="prof-tag${t.price ? ' prof-tag--rare' : ''}${sdTagTex(t)}" style="--tint:${t.tint}">${t.label}</span>`;

/* The tag strip, INSIDE the card.
   ⚠ It was a row under the card and it moved in, which is why the silhouette
   grew 96 units at the bottom — the tags are part of who you are, and a strip
   floating under the card read as a caption about it. Being in the canvas means
   being positioned in PERCENTAGES OF THE TRACE like everything else in there:
   see `.prof-canvas .prof-tags` in app.css, whose numbers are the compartment
   (y 449.5 → 545) written as a fraction of 556.
   ⚠ It scrolls sideways rather than wrapping. The compartment is one row tall
   by construction; three long collectibles would otherwise silently grow a
   second line inside a fixed-aspect box and fall out of the card. */
function profTagsHtml(P) {
  const tags = profTags(P);
  if (!tags.length) return '';
  return `
              <div class="prof-tags">${tags.map(tagChip).join('')}</div>`;
}

function profCanvasHtml(P) {
  const findAlb = name => (window.ARCHIVE || []).find(a => a.album === name);
  const esc  = s => String(s).replace(/'/g, '\\\'');

  const penIco   = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
  const editIco  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
  const pinIco   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

  /* ⚠ The favourite-album CDs are NO LONGER IN THE CARD. They were five small
     wells traced into the bottom of the artwork; they are now a swipeable rail
     of three big ones in their own section (`profFavsHtml`), because a cover at
     that size is all anyone got — no title, no artist, no year. The canvas
     therefore stops at the card: 690×460, not 690×608. */

  /* ⚠ THE CARD HAS NO EDIT MODE. It used to grow one — every region got a
     `.pfe-slot` class and an openProfEditor() handler when called with
     { edit: true } — because Edit Profile WAS this card. It is a form now
     (`profileEditHtml`), so the card has exactly one job again: draw the record
     it is handed. Nothing here should learn to edit itself a second time. */
  /* Location, at the bottom of the right pane. ⚠ Country or city and no finer:
     the line has ~116px and never wraps (see `.prof-meta-item`), and a street
     is not something a profile should be printing anyway. */
  const metaHtml = P.location
    ? `<span class="prof-meta-item">${pinIco}${P.location}</span>`
    : '';

  return `
            <div class="prof-canvas">
              <!-- Embossed card silhouette — retraced from ProfileTheme_Regular4 (1).svg.
                   ⚠ 690×608, NOT the old 690×466: the card grew and the picture
                   pane grew with it (x 0→374.5 where it used to stop at 262.3),
                   which is the point of the revision. Every percentage in
                   app.css's profile block resolves against THIS box — change
                   the viewBox and they all move. -->
              <!-- WARNING: the viewBox height and .prof-canvas's aspect-ratio are
                   ONE number. preserveAspectRatio=meet scales the drawing to fit
                   the SHORTER axis, so a 608-tall viewBox inside a 460-tall box
                   renders the whole card at 75.7% and centres it, while every
                   percentage-positioned element on top stays where it was. Nothing
                   looks broken on its own and the card is completely wrong.
                   The source file is 608 tall; we crop to 460 because its bottom
                   150 units are the favourite-album circles, and those are their
                   own section now. -->
              <svg class="prof-base" viewBox="0 0 690 556" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <!-- ⚠ The card's bottom edge moved 449 → 545 and the viewBox 460
                     → 556 with it (the 11 units of slack under the card are
                     unchanged). Those 96 units ARE the tag compartment. Every
                     number below is the old one + 96; nothing above y=94.7 moved,
                     which is why the banner and the pill are untouched. -->
                <path class="prof-base-main" d="M668.874 74.6963L0.608337 74.6963L0.608383 525C0.608382 536.045 9.56267 545 20.6084 545L668.875 545C679.92 545 688.875 536.045 688.875 525L688.875 404.987L688.874 94.6963C688.874 83.6506 679.92 74.6963 668.874 74.6963Z"/>
                <!-- The picture pane STOPS at 449.5, where it always did — the
                     card grew underneath it, the photo did not. ⚠ Its bottom-left
                     corner lost its 20-unit arc: it was the CARD's corner, and
                     the card's corner is 96 units lower now. -->
                <path class="prof-divide" d="M374.498 449.5L374.498 94.4995C374.498 83.4538 365.544 74.4995 354.498 74.4995L0.497955 74.4995L0.49794 449.5L374.498 449.5Z"/>
                <!-- The other half of that seam. Together they draw one hairline
                     across the whole card, which is what makes the strip below
                     read as a compartment rather than as empty card. -->
                <path class="prof-divide" d="M374.498 449.5L688.875 449.5"/>
                <!-- Name banner — right edge is resized to the username by sizeProfName().
                     Bottom edge runs a few units into the card so the fill hides the seam. -->
                <path class="prof-name-tab" d="M0.500139 74.9079H467.5H437.414C420.568 74.9079 404.855 66.4255 395.612 52.3422L373.436 18.5525C366.042 7.28593 353.471 0.5 339.995 0.5H35.5001C16.1702 0.5 0.500139 16.17 0.500139 35.5V74.9079Z"/>
              </svg>

              <!-- White username pill inside the banner — width grows with the banner -->
              <div class="prof-name-pill" style="width:49.86%"></div>

              <!-- Username, seated inside the white pill (black text) -->
              <div class="prof-name-tab-lbl">
                <span class="prof-name-nick">${P.name || 'Your name'}</span>
                <span class="prof-name-at">@${P.handle || 'handle'}</span>
              </div>

              <!-- Profile image fills the left pane entirely -->
              <div class="prof-pic" style="background-image:url('${P.pic || ''}')"></div>
              <!-- The right pane: THE BIO, with the location at its foot.
                   ⚠ It held the three stats. They are out of the card now, in a
                   row underneath it (profStatsHtml), because a figure is a
                   figure wherever it sits, while the bio is the only thing on
                   this page that has to be READ -- and reading wants width and
                   line length, which is exactly what a pane to yourself is.
                   The pane was once a stat row, a paragraph and a location pin
                   all competing in a 149px column, and none of them had room.
                   The bio and the location are still EDITABLE — the form on
                   the Edit Profile page owns them now, so dropping the blocks
                   from the card no longer costs them their entry point the way
                   it did when the card was the editor. Put the blocks back (the
                   CSS for both is still in app.css) when they return. -->
              <div class="prof-right">
                <div class="prof-info">
                  <div class="prof-desc">${P.bio || ''}</div>
                </div>
                <!-- Location, pinned to the FOOT of the pane by prof-meta's
                     margin-top:auto. It is the one fact on the card that is not
                     about music, so it sits under everything that is, and it is
                     written no finer than a country or a city. -->
                <div class="prof-meta">${metaHtml}</div>
              </div>

              <!-- The bottom compartment: the tags, in the card. -->
              ${profTagsHtml(P)}

              <!-- ONE action button: Edit on your own page, Follow on someone
                   else's. It sits in the UPPER RIGHT, in the pill the trace puts
                   at x 600-688 / y 1-55 -- above the card, opposite the name
                   banner. It was in the lower right, which put it inside the
                   card's own bottom corner where it read as part of the stats
                   block rather than as the page's one action. -->
              ${(window.PROFILE_GUEST
                ? `<button class="prof-act prof-act--follow" onclick="toggleProfFollow(this)" aria-pressed="false" title="Follow">
                <span class="v3-ring v3-ring--smile prof-act-ring"><span class="v3-ring-spin"><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i></span></span>
                <span class="prof-act-lbl">Follow</span>
              </button>`
                : `<button class="prof-act prof-act--edit" title="Edit profile" onclick="event.stopPropagation(); openProfileEdit()">
                <span class="prof-act-ico">${editIco}</span>
                <span class="prof-act-lbl">Edit</span>
              </button>`)}
            </div>`;
}

/* ── The review history — the feed at the bottom of a profile ─────────────
   ⚠ Replaces "Recently rated", which was four covers, four hardcoded star
   values and four hardcoded ages. A history has to carry what the person
   actually SAID: that is the difference between a list of albums they touched
   and a record of their taste, which is what a profile is for.

   ⚠ DERIVED here rather than stored on `PROFILE`. That object is written from
   three places — the literal in app.js, `randomizeProfile` for a random or
   seeded visitor, and a persona — so a field added to one of them is missing
   from the other two. Seeded off the handle through `dzSeed`, which gives this
   the same guarantee `randomizeProfile`'s seeded stream gives a friend's page:
   open the same profile twice and it says the same things.
   ⚠ `dzSeed` lives in app.js, which loads AFTER this file. That is fine because
   this runs at render time, not while this file parses — the same reason
   `bentoHtml`'s callers can reach `populateHomeData`. */
const PROF_RV_LINES = [
  'first listen did nothing for me. fourth listen rearranged my week.',
  'the sequencing is the whole argument. do not shuffle this one.',
  'i keep coming back to the back half and pretending the front half exists',
  'production so clean it took me a year to notice how sad the words are',
  'this is the one i put on when i need to feel like a person again',
  'genuinely perfect for about thirty minutes and then it forgets what it was',
  'overrated by people who have only heard the singles. underrated by everyone else.',
  'i have no critical distance from this record and i am not seeking any',
  'the drums alone. whoever mixed this deserves a raise and a nap.',
  'grew on me like a slow bruise. now it is in my top five.',
  'you can hear them figuring it out in real time and that is the appeal',
  'my most played of the year and i still could not tell you why',
  'a bit long. cut three tracks and this is a classic.',
  'played this on a night bus once and ruined it for every other context',
  'not their best but their most honest, and i will take that trade',
  'sounds enormous on speakers and tiny on headphones. wild.',
  'i was too young for this when it came out and exactly the right age now',
  'the lyrics are fine, the atmosphere is the point, and the atmosphere is immense',
  'objectively a 4 but personally a 5 and this is my account',
  'came for one song, stayed for the two either side of it',
];

/* ⚠ `dzSeed` is a rolling hash (h = h*131 + c) and is NOT safe to take a small
   remainder of directly. 131² ≡ 1 (mod 20) and ≡ 1 (mod 8), so
   `dzSeed(seed, 'x', i) % 20` collapses to `(C(seed) + i) % 20` — LINEAR in the
   index. Every profile then draws the same review lines in the same cyclic
   order, merely rotated by a per-name offset, and the same goes for the star
   values. Verified: ericd → 17 18 19 0 1 2, moonlit_echo → 18 19 0 1 2 3.
   This is an avalanche step to break that up before the modulo. Anywhere else
   that wants `dzSeed(...) % smallN` needs it too. */
function profMix(n) {
  n = (n ^ 61) ^ (n >>> 16);
  n = (n + (n << 3)) & 0x7FFFFFFF;
  n = n ^ (n >>> 4);
  n = Math.imul(n, 0x27d4eb2d) & 0x7FFFFFFF;
  return (n ^ (n >>> 15)) & 0x7FFFFFFF;
}

const profAgo = d => d < 7   ? d + 'd'
                   : d < 30  ? Math.round(d / 7) + 'w'
                   : d < 365 ? Math.round(d / 30) + 'mo'
                   :           Math.round(d / 365) + 'y';

function profReviewLog(P) {
  const A = window.ARCHIVE || [];
  if (!A.length) return [];
  const seed = String(P.handle || P.name || 'you');
  const raw = (typeof dzSeed === 'function') ? dzSeed : ((...a) => a.join('').length);
  const h = (...a) => profMix(raw(...a));
  // Their own picks first, then topped up from the archive — a history runs
  // longer than the four-item strip it replaces.
  const names = [];
  (P.recent || []).forEach(n => { if (n && names.indexOf(n) < 0) names.push(n); });
  /* Then their FAVOURITES. You are far more likely to have written about the
     five records you pinned to your own profile than about a random one off the
     shelf — and this log is also what the favourites rail reads to put a review
     under a disc (`profFavPaint`), so without this the panel had almost nothing
     to show: measured across the five personas it was 1, 2, 0, 1, 1 of five.
     ⚠ Seeded on a coin flip, NOT all five. "No review yet" has to stay a real state
     that you actually meet while scrolling the rail, or the conditional under
     the disc is a branch that never runs. */
  (P.favs || []).forEach((n, i) => {
    if (n && names.indexOf(n) < 0 && h(seed, 'fv', i) % 2) names.push(n);
  });
  for (let i = 0; i < A.length * 2 && names.length < 9; i++) {
    const nm = A[h(seed, 'a', i) % A.length].album;
    if (names.indexOf(nm) < 0) names.push(nm);
  }
  const STARS = [5, 4.5, 4.5, 4, 4, 3.5, 5, 3];
  let ago = 1 + h(seed, 'd0') % 5;
  return names.map((nm, i) => {
    const a = A.find(x => x.album === nm);
    if (!a) return null;
    const e = { album: a,
                rating: STARS[h(seed, 'r', i) % STARS.length],
                text:   PROF_RV_LINES[h(seed, 't', i) % PROF_RV_LINES.length],
                when:   profAgo(ago),
                /* Engagement. A review with no traction is the common case, so
                   the floor is 0 and the curve is skewed low — a feed where
                   every row has hundreds of likes reads as fake. */
                likes:    h(seed, 'lk', i) % 240,
                comments: h(seed, 'cm', i) % 9 };
    ago += 2 + h(seed, 'g', i) % 38;   // strictly increasing → the list reads newest-first
    return e;
  }).filter(Boolean);
}

/* ── Review score: POINTS, not an average rating ─────────────────────────
   ⚠ It is NOT the mean of their star ratings — that was the wrong reading, and
   a 4.1 next to "Followers 1.9k" also read as a completely different kind of
   quantity from the numbers beside it. The score is what you EARN: points for
   writing reviews, plus points for other people liking them. It lands in the
   tens of thousands, which is why it belongs in a row of counts.

   `PROF_PTS_WRITE` / `PROF_PTS_LIKE` are the rates. Likes are seeded per handle
   at 1–6 per review — a prolific reviewer nobody reads and a rarely-posting one
   everybody likes can reach the same score, which is the point of counting both. */
const PROF_PTS_WRITE = 20;   // per review posted
const PROF_PTS_LIKE  = 5;    // per like received on one

function profLikes(P) {
  const reviews = P.reviews || 0;
  const raw = (typeof dzSeed === 'function') ? dzSeed(String(P.handle || P.name || 'you'), 'lk') : 0;
  return Math.round(reviews * (1 + (profMix(raw) % 500) / 100));
}

function profScore(P) {
  const pts = (P.reviews || 0) * PROF_PTS_WRITE + profLikes(P) * PROF_PTS_LIKE;
  return window.fmtRc ? fmtRc(pts) : String(pts);
}

/* ── Favourite albums — a rail of three, one centred ─────────────────────
   ⚠ This replaces five small wells traced into the bottom of the card. At that
   size the cover was ALL you got — no title, no artist, no year — and a cover
   is not enough to know an album by. Three big ones with the middle one framed
   leaves room under the rail to actually say what you are looking at.

   ⚠ It is CSS scroll-snap, not a custom gesture. This is the one screen element
   that has to feel native under a thumb on a real phone, and the browser's own
   momentum, rubber-band and snap beat anything hand-rolled — the swipe engines
   elsewhere in this app exist because they animate a bento cell, which this
   does not. `padding-inline` on the rail is what lets the FIRST and LAST items
   reach the centre; without it `scroll-snap-align: center` can never centre
   them and the rail looks broken at both ends.
   ⚠ Tapping a disc raises the NAV CONSOLE, not a popup — see `profFavTap`. The
   rail is `overflow-x: auto` and would clip a popup anyway, which is half of why
   the console is the better home for it. */
/* How many times the five discs are repeated to fake an endless rail.
   ⚠ FIVE copies, not three, and the number is set by how far one fling travels.
   The wrap only runs once the scroll SETTLES (writing `scrollLeft` mid-fling
   kills the momentum, see `profFavSettle`), so the buffer either side of the
   middle copy has to outlast the longest gesture a thumb can produce. From the
   middle copy that is ten discs of runway in each direction — about 2500px,
   comfortably past a hard fling. Three copies would leave only five, and a
   determined flick would hit the emergency wrap and stop dead. */
const PROF_FAV_LOOPS = 5;

/* ⚠ The second parameter is gone. It was `o.edit`, which turned every disc into
   a slot when this rail was drawn on the Edit Profile page — that page is a form
   now and does not render the card or the rail at all. */
function profFavsHtml(P) {
  const findAlb = name => (window.ARCHIVE || []).find(a => a.album === name);
  const esc = s2 => String(s2).replace(/'/g, '\'');
  const favs = [0, 1, 2, 3, 4];

  const cds = favs.map(i => {
    const a = findAlb((P.favs || [])[i]);
    if (!a) {
      /* An empty disc fills itself — the last `1` sends the tap to the album
         picker instead of the console. Swapping a FILLED one is Edit Profile's
         job now, so a full disc never takes that route. */
      return `<button class="prof-fav prof-fav--empty" data-i="${i}" data-alb="" onclick="profFavTap(this, event, ${i}, 1)" title="Add favourite ${i + 1}"><span class="prof-fav-add">+</span></button>`;
    }
    return `<button class="prof-fav" data-i="${i}" data-alb="${esc(a.album)}" onclick="profFavTap(this, event, ${i}, 0)" title="${esc(a.album)}">
        <span class="prof-fav-img" style="background-image:url('${a.image}')"></span>
        <span class="prof-fav-hole"></span>
      </button>`;
  }).join('');

  /* ⚠ There are no per-disc popups here any more. Tapping a favourite raises the
     NAV CONSOLE (`profFavTap` → `openConsole`), so the menu that used to carry
     "Listen to preview" and the service rows has nothing left to offer:
     previews are off (`PREVIEWS_ENABLED`), and the services moved into the
     console. Keeping an unreachable popup in the DOM is worse than removing it.
     ⚠ It also carried "Replace album", which is now reached through Edit
     Profile → tap a disc, rather than from the profile in view mode. */

  /* The panel under the rail. Filled by `profFavSync` from whichever CD is
     centred — the markup carries no album, so it cannot go stale against the
     rail's scroll position. */
  return `
            <div class="prof-sec prof-favs">
              <div class="prof-sec-hd">Favourite albums</div>
              <!-- THE RAIL LOOPS. The same five discs are emitted PROF_FAV_LOOPS
                   times over, and profFavLoop teleports the scroll back to the
                   middle copy by exactly one set width once it settles. The jump
                   cannot be seen because what is either side of the seam is the
                   same five records in the same order -- you are always looking
                   at an identical stretch of an endless wheel.
                   ⚠ data-n is the number of REAL favourites. app.js divides the
                   centred index by it to work out which copy you have drifted
                   into, so this is what makes the wrap arithmetic possible.
                   ⚠ The end spacers went with the ends. They existed to let the
                   FIRST and LAST disc reach the middle -- with a loop there is no
                   first or last, and a spacer sitting at a seam would be a hole
                   in the middle of the wheel. The rail still must never get
                   horizontal PADDING (see the rule in app.css): percentage
                   flex-basis resolves against the content box, so side padding
                   silently redefines what every percentage in here means. -->
              <div class="prof-fav-rail" data-n="${favs.length}" onscroll="profFavSync(this)">${
                Array.from({ length: PROF_FAV_LOOPS }, () => cds).join('')}</div>
              <div class="prof-fav-info">
                <!-- The year rides with the title, where it belongs: it is part of
                     naming a record, not a statistic about it. Genre is gone from
                     here -- it said little at this size and the archive's genre
                     strings are inconsistent enough that it read as noise. -->
                <div class="prof-fav-alb"><span class="prof-fav-name"></span><span class="prof-fav-yr"></span></div>
                <div class="prof-fav-artist"></div>
                <div class="prof-fav-sub">
                  <span class="prof-fav-stars"></span>
                  <span class="prof-fav-meta"></span>
                </div>
                <!-- What THEY wrote about it, when they wrote anything. Filled
                     by profFavPaint from the same profReviewLog() the review
                     history below is built from -- one source of truth, so the
                     line under the disc and the row further down the page can
                     never quote the same person differently. Empty and hidden
                     for a record they have not reviewed. -->
                <div class="prof-fav-rv" hidden></div>
              </div>
            </div>`;
}

/* The chips inside the form's Tags row.
   ⚠ Exported because `profTagSync` (app.js) calls it on its own to repaint that
   row WITHOUT a re-render. The tag sheet is multi-select and stays open while
   you assemble a set, and a re-render would tear it out of the DOM mid-pick. */
window.pfeTagChips = function (P) {
  const all = window.SD_TAGS || [];
  const worn = ((P && P.tags) || []).map(id => all.find(t => t.id === id)).filter(Boolean);
  const plus = `<span class="pfe-add-plus">+</span>`;
  return (worn.length
    ? worn.map(tagChip).join('')
    : `<span class="pfe-tags-ph">Choose up to ${SD_TAG_MAX}</span>`) + plus;
};

/* The three figures, OUT of the card and in a clean row under it.
   ⚠ They were stacked down the card's right pane, where the pane's width capped
   how big a number could be set. Out here the row is the full page width, so all
   three can be read at once instead of scanned down a column -- which is how a
   follower count is actually read, and how every other profile on earth prints
   it. The bio took the pane, where line length is worth something.
   ⚠ It is a SIBLING of `.prof-canvas`, not part of it: the canvas is a traced
   SVG whose every child is positioned in percentages of the trace, and anything
   in there has to be drawn to fit the artwork. */
function profStatsHtml(P) {
  const nf = n => (window.fmtRc ? window.fmtRc(n) : String(n));
  const cell = (n, l) => `
                <div class="prof-statb">
                  <span class="prof-statb-n">${n}</span>
                  <span class="prof-statb-l">${l}</span>
                </div>`;
  return `
            <div class="prof-statbar">
              ${cell(nf(P.following || 0), 'Following')}
              ${cell(nf(P.followers || 0), 'Followers')}
              ${cell(profScore(P), 'Review score')}
            </div>`;
}

function profileHtml(light) {
  const P = window.PROFILE || {};
  const findAlb = name => (window.ARCHIVE || []).find(a => a.album === name);
  const esc = s => String(s).replace(/'/g, '\\\'');



  /* Review history — built from the HOME FEED'S row, not a shape of its own.
     ⚠ Same `.ntf-*` anatomy, same sentence order (SUBJECT · VERB · OBJECT), the
     same `upvoteHtml` pill and the same comment button: a review is a review,
     and a profile that renders one differently from the way home renders it is
     two components that will drift. The only thing that changes is the subject
     — every row here has the same author, so the avatar is theirs.
     `upvoteHtml` and `CMT_SVG` live in app.js, which loads after this file;
     fine, because this runs at render time. */
  const rvName  = P.name || 'They';
  const rvFace  = P.pic || '';
  const rvBadge = '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>';
  const logHtml = profReviewLog(P).map(e => {
    const a = e.album;
    const open = `openAlbumPage(ARCHIVE.find(x=>x.album==='${esc(a.album)}')||ARCHIVE[0])`;
    // ⚠ Guarded the same way the feed guards it: "Weezer by Weezer" reads as a
    // bug, and nobody says the artist twice out loud either.
    const rec = `<i>${a.album}</i>` + (a.artist && a.artist !== a.album ? ` by <b>${a.artist}</b>` : '');
    const key = 'prof::' + (P.handle || 'you') + '::' + a.album;
    return `
    <div class="ntf-row" onclick="${open}">
      <div class="ntf-who">
        <div class="ntf-ava" style="background-image:url('${rvFace}')">
          <span class="ntf-badge ntf-badge--review"><svg viewBox="0 0 24 24" fill="currentColor">${rvBadge}</svg></span>
        </div>
        <div class="ntf-time">${e.when}</div>
      </div>
      <div class="ntf-body">
        <div class="ntf-text"><b>${rvName}</b> reviewed ${rec} a <b class="ntf-line-score">${Number(e.rating).toFixed(1)}</b></div>
        <div class="ntf-quote">${e.text}</div>
        <div class="ntf-foot">
          <div class="ntf-acts">
            ${window.upvoteHtml ? upvoteHtml(key, e.likes, 'v3-up--feed v3-up--prof') : ''}
            <button class="v3-up v3-up--feed v3-up--prof" type="button" aria-label="Comments"
              onclick="event.stopPropagation(); ${open}">${typeof CMT_SVG !== 'undefined' ? CMT_SVG : ''}<span class="v3-up-n">${e.comments}</span></button>
          </div>
        </div>
      </div>
      <div class="ntf-obj">
        <div class="ntf-art" style="background-image:url('${a.image}')"
             onclick="event.stopPropagation(); ${open}"></div>
      </div>
    </div>`;
  }).join('');


  /* Favourite songs (5) — artwork borrowed from the song's album cover.
     ⚠ PRO ONLY, and hidden rather than locked on a Free account. A profile is
     someone's page: a greyed-out shelf with a padlock on it advertises to
     everyone who visits that the owner didn't pay, which is not a thing to put
     on a person's profile. The upsell lives on the Edit page instead, where it
     is addressed to the one person it is for. */
  const playIco = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  const favSongsHtml = (P.favSongs || []).slice(0, 5).map(s => {
    const a = findAlb(s.album);
    return `<button class="prof-song" onclick="openAlbumPage(ARCHIVE.find(x=>x.album==='${esc(s.album)}')||ARCHIVE[0])">
      <span class="prof-song-art" style="background-image:url('${a ? a.image : ''}')"></span>
      <span class="prof-song-meta">
        <span class="prof-song-title">${s.title}</span>
        <span class="prof-song-sub">${s.album} · ${s.artist}</span>
      </span>
      <span class="prof-song-play">${playIco}</span>
    </button>`;
  }).join('');


  // Playlists — the persona's 3 picks (falls back to the user's own, most-loved).
  const allPls = plLists();
  const myPls = (P.playlistNames && P.playlistNames.length)
    ? P.playlistNames.map(n => allPls.find(p => p.name === n)).filter(Boolean)
    : allPls.filter(p => p.creator === 'you').sort((a, b) => b.favs - a.favs).slice(0, 3);
  const plsHtml = myPls.map((pl, i) => {
    const cover = (P.playlistCovers && P.playlistCovers[i]) || pl.image;
    return `<button class="prof-pl" onclick="openPlaylistPage('${esc(pl.name)}')">
      <span class="prof-pl-cover" style="background-image:url('${cover}')"></span>
      <span class="prof-pl-nm">${pl.name}</span>
      <span class="prof-pl-meta">${pl.tracks} songs</span>
    </button>`;
  }).join('');

  return `
      <div class="app-screen s-home-v3 s-prof2${light ? ' s-home-v3--light' : ''}"
           style="${window.profSkinCss ? profSkinCss(P) : ''}">
        ${appHeader()}
        <div class="v3-body">
          <div class="prof2-scroll">

            ${profCanvasHtml(P)}

            ${profStatsHtml(P)}

            ${profFavsHtml(P)}

            <!-- Top playlists -->
            <div class="prof-sec">
              <div class="prof-sec-hd">Playlists</div>
              <div class="prof-pls">${plsHtml}</div>
            </div>

            <!-- Favourite songs — Pro only, and absent (not locked) without
                 it; see the note where favSongsHtml is built. -->
            ${(typeof isPro === 'function' && isPro() && favSongsHtml) ? `
            <div class="prof-sec">
              <div class="prof-sec-hd">Favourite songs</div>
              <div class="prof-songs">${favSongsHtml}</div>
            </div>` : ''}

            <!-- Review history — last section on the page, deliberately: it is
                 the longest and the one you scroll INTO, not past. -->
            <div class="prof-feed">
              <div class="prof-feed-hd">Review history</div>
              ${logHtml}
            </div>

          </div>
        </div>
        ${nowBar()}
        ${bottomNav('profile')}
      </div>`;
}

// Edit Profile — a FORM, not the profile.
//
// ⚠ This page used to BE the profile card, with every editable region turned
// into a tappable slot. It isn't any more. Filling in your details by poking at
// a stylised card meant hunting for the region that owned each field, the hit
// targets were whatever the traced SVG happened to leave, and two fields (bio,
// location) had no entry point at all once the card dropped those blocks. The
// page is now an Instagram-style form: your picture, then one labelled row per
// field, typed into directly. The things that aren't text — photo, favourite
// albums, playlists, songs — stay as tap-to-choose slots underneath, because
// there is nothing to type into for those.
//
// ⚠ TEXT IS TYPED STRAIGHT INTO THE DRAFT (`pfeditField`, app.js) on every
// keystroke, and that handler deliberately does NOT re-render — rebuilding the
// screen mid-word would drop the caret. The media slots still go through the
// popup (openProfEditor), which DOES re-render after a pick; that stays safe
// because the inputs are rebuilt from the draft, which already holds every
// keystroke typed so far.
//
// State is window.PFEDIT (app.js), a draft copied from PROFILE on open; Save
// commits it, Cancel throws it away.
function profileEditHtml(light) {
  const D = (typeof window.pfeditDraft === 'function') ? window.pfeditDraft() : (window.PROFILE || {});
  const dots = '<i class="v3-ring-dot"></i>'.repeat(6);
  const findAlb = name => (window.ARCHIVE || []).find(a => a.album === name);
  // Attribute-safe. A value="" is one stray quote away from a broken input.
  const at = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const sfx = light ? 'l' : 'd';
  const lockIco = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10.5" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg>`;   // the viewer draws both shells at once — ids must differ

  /* One labelled text row. `pre` is the fixed prefix the username row needs.
     ⚠ data-k is not decoration — pfeditField mirrors the keystroke into the
     other shell's copy of the same field through it. */
  const field = (k, label, val, ph, max, pre) => `
              <div class="pfe-row">
                <label class="pfe-lbl" for="pfe-${k}-${sfx}">${label}</label>
                <div class="pfe-field">
                  ${pre ? `<span class="pfe-pre">${pre}</span>` : ''}
                  <input class="pfe-in" id="pfe-${k}-${sfx}" data-k="${k}" type="text"
                         maxlength="${max}" value="${at(val)}" placeholder="${at(ph)}"
                         spellcheck="false" autocomplete="off" oninput="pfeditField('${k}', this)">
                </div>
              </div>`;

  const bio = String(D.bio == null ? '' : D.bio);

  /* One colour row: swatch · RGB picker · lightness · reset.
     ⚠ Both inputs write through `profSkinSet`, which patches the CSS variables
     by hand and does NOT re-render. A colour input dragged through its gradient
     fires `input` every frame, and re-rendering per frame would stutter AND
     hand the user a brand-new element halfway through the drag. Reset is a
     click, not a drag, so that one may re-render.
     ⚠ `value` falls back to the theme's own colour so the picker opens on what
     you are actually looking at rather than on black. */
  const skinRow = (k, label, fallback) => {
    const sk = D.skin || {};
    return `
              <div class="pfe-row pfe-skin">
                <span class="pfe-lbl">${label}</span>
                <div class="pfe-field pfe-skin-f">
                  <input class="pfe-color" type="color" value="${at(sk[k] || fallback)}"
                         title="${label}" oninput="profSkinSet('${k}', this.value)">
                  <input class="pfe-range" type="range" min="-45" max="45" step="1"
                         value="${Number(sk[k + 'L']) || 0}" title="Lightness"
                         oninput="profSkinSet('${k}L', this.value)">
                  <button class="pfe-skin-x" title="Back to the theme colour"
                          onclick="profSkinClear('${k}')">&times;</button>
                </div>
              </div>`;
  };

  // An empty media slot: a dashed "+" tile (grid) or row (list).
  const addTile = (kind, slot, label, shape) => `
              <button class="pfe-add pfe-add--${shape}" onclick="openProfEditor('${kind}', '${slot}')">
                <span class="pfe-add-plus">+</span>
                <span class="pfe-add-lbl">${label}</span>
              </button>`;

  /* Favourite albums — 5 discs. On the profile these live in a swipeable rail
     with an info panel under it; here they are five targets in a row, since the
     only question this page asks about them is "which record goes here". */
  const discsHtml = [0, 1, 2, 3, 4].map(i => {
    const a = findAlb((D.favs || [])[i]);
    if (!a) return `<button class="pfe-disc pfe-disc--empty" onclick="openProfEditor('album', '${i}')" title="Add favourite ${i + 1}"><span class="pfe-add-plus">+</span></button>`;
    return `<button class="pfe-disc pfe-slot" onclick="openProfEditor('album', '${i}')" title="Replace ${at(a.album)}">
                <span class="prof-fav-img" style="background-image:url('${a.image}')"></span>
                <span class="prof-fav-hole"></span>
              </button>`;
  }).join('');

  // Playlists — 3 slots
  const allPls = plLists();
  const plNames = (D.playlistNames && D.playlistNames.length)
    ? D.playlistNames.slice(0, 3)
    : allPls.filter(p => p.creator === 'you').sort((a, b) => b.favs - a.favs).slice(0, 3).map(p => p.name);
  const plsHtml = [0, 1, 2].map(i => {
    const pl = allPls.find(p => p.name === plNames[i]);
    if (!pl) return addTile('playlist', i, 'Add playlist', 'tile');
    return `<button class="prof-pl pfe-slot" onclick="openProfEditor('playlist', '${i}')" title="Replace">
      <span class="prof-pl-cover" style="background-image:url('${(D.playlistCovers && D.playlistCovers[i]) || pl.image}')"></span>
      <span class="prof-pl-nm">${pl.name}</span>
      <span class="prof-pl-meta">${pl.tracks} songs</span>
    </button>`;
  }).join('');

  /* Favourite songs — 5 slots, PRO ONLY.
     ⚠ This is where the lock belongs. The profile hides the section outright on
     a Free account (a padlock on someone's page tells every visitor what they
     didn't buy); the edit page is the one screen only its owner sees, so it is
     the only place the offer is addressed to the person who can take it. */
  const pro = typeof isPro === 'function' && isPro();
  const favSongs = D.favSongs || [];
  const songsHtml = [0, 1, 2, 3, 4].map(i => {
    const s = favSongs[i];
    if (!s) return addTile('song', i, 'Add a song', 'row');
    const a = findAlb(s.album);
    return `<button class="prof-song pfe-slot" onclick="openProfEditor('song', '${i}')" title="Replace">
      <span class="prof-song-art" style="background-image:url('${a ? a.image : ''}')"></span>
      <span class="prof-song-meta">
        <span class="prof-song-title">${s.title}</span>
        <span class="prof-song-sub">${s.album} · ${s.artist}</span>
      </span>
      <span class="pfe-song-plus">+</span>
    </button>`;
  }).join('');

  return `
      <div class="app-screen s-home-v3 s-prof2 s-pfedit${light ? ' s-home-v3--light' : ''}"
           style="${window.profSkinCss ? profSkinCss(D) : ''}">
        ${appHeader()}
        <div class="v3-body">
          <div class="prof2-scroll pfe-scroll">

            <div class="pfe-top">
              <button class="plp-back-pill" onclick="pfeditCancel()" title="Discard and go back">
                <span class="v3-ring plp-ring"><span class="v3-ring-spin">${dots}</span></span>
              </button>
              <span class="pfe-editing">Editing profile</span>
              <button class="pfe-save" data-pfe="save" onclick="pfeditSave()">Save changes</button>
            </div>

            <!-- The picture, on its own above the form — the one field you
                 change by looking rather than by reading a label. -->
            <div class="pfe-photo">
              <button class="pfe-avatar" onclick="openProfEditor('photo')" title="Change photo"
                      style="background-image:url('${D.pic || ''}')">
                <span class="pfe-avatar-badge">+</span>
              </button>
              <button class="pfe-photo-btn" onclick="openProfEditor('photo')">Change photo</button>
            </div>

            <div class="pfe-form">
              ${field('name', 'Name', D.name, 'Your name', 24)}
              ${field('handle', 'Username', D.handle, 'handle', 20, '@')}

              <div class="pfe-row pfe-row--tall">
                <label class="pfe-lbl" for="pfe-bio-${sfx}">Bio</label>
                <div class="pfe-field">
                  <textarea class="pfe-in pfe-area" id="pfe-bio-${sfx}" data-k="bio"
                            rows="3" maxlength="240" placeholder="Tell people what you are into."
                            spellcheck="false" oninput="pfeditField('bio', this)">${at(bio)}</textarea>
                  <span class="pfe-count">${bio.length}/240</span>
                </div>
              </div>

              ${field('location', 'Location', D.location, 'Country or city', 30)}

              <!-- Colour. Two pickers, and each is TWO controls: the RGB value
                   and a lightness. Separate on purpose -- "what colour" and
                   "how dark" are different decisions, and one combined picker
                   throws the depth away every time you move the hue.
                   ⚠ The BACKGROUND you are picking is the page you are standing
                   on: profSkinApply writes --sd-bg onto this very screen, so it
                   changes under your thumb as you drag. The card is not on this
                   page (this is a form), which is what the swatch is for. -->
              <!-- ⚠ THE PREVIEW IS DRIVEN BY NOTHING. It paints itself from
                   var(--sd-bg) and var(--pf-base), which profSkinCss has
                   already written inline on this very screen, so it follows the
                   sliders with no JS behind it and cannot disagree with the
                   card it previews. It shows the DERIVED tokens too (the inner
                   pane is --pf-face, the text ticks are --pf-ink), so a colour
                   that makes your own bio unreadable says so here rather than
                   on your profile. -->
              <div class="pfe-row">
                <span class="pfe-lbl">Preview</span>
                <div class="pfe-field">
                  <div class="pfe-prev"><span class="pfe-prev-card"><span class="pfe-prev-pane"></span></span></div>
                </div>
              </div>

              ${skinRow('card', 'Card colour', '#3a3b45')}
              ${skinRow('bg', 'Background', '#111116')}

              <!-- Tags, where Occupation used to be. Not typed: you wear what
                   you own, so the row is a button onto the tag sheet. -->
              <div class="pfe-row">
                <span class="pfe-lbl">Tags</span>
                <div class="pfe-field">
                  <button class="pfe-tags" onclick="openProfEditor('tag')" title="Choose your tags">${pfeTagChips(D)}</button>
                </div>
              </div>
            </div>

            <!-- Everything below is chosen, not typed: each slot opens the same
                 category-aware popup (openProfEditor in app.js). -->
            <div class="prof-sec">
              <div class="prof-sec-hd">Favourite albums</div>
              <div class="pfe-discs">${discsHtml}</div>
            </div>

            <div class="prof-sec">
              <div class="prof-sec-hd">Playlists</div>
              <div class="prof-pls">${plsHtml}</div>
            </div>

            <div class="prof-sec">
              <div class="prof-sec-hd">Favourite songs</div>
              ${pro ? `<div class="prof-songs">${songsHtml}</div>` : `
              <button class="pfe-pro" onclick="navigate('shop')">
                <span class="pfe-pro-ico">${lockIco}</span>
                <span class="pfe-pro-txt">
                  <span class="pfe-pro-t">Pin five songs to your profile</span>
                  <span class="pfe-pro-s">Favourite songs is part of Spindeck Pro</span>
                </span>
                <span class="pfe-pro-go">Get Pro</span>
              </button>`}
            </div>

          </div>
        </div>
        ${nowBar()}
        ${bottomNav('profile')}
      </div>`;
}

// Album wall (Trending) — themed so it can render as a dark + light pair.
/* Which way the wall is sorted. Read by `wallItems()` and stamped onto the two
   sort chips, so the choice survives the re-render the viewer does on every
   variant switch (both shells rebuild from this one value). */
window.WALL_SORT = window.WALL_SORT || 'popular';

/* ⚠️ "Controversial" is DISAGREEMENT, not a low score — an album everyone rates
   2.0 is badly reviewed, not divisive. It reads the album's own rating
   distribution, the same `ratingSpreadFor()` bell the histogram on the album
   page draws, so the wall and that chart can't disagree about which records
   split the room.

   ⚠️ **THE MOCK DATA CONTAINS NO ACTUAL DISAGREEMENT**, so this is a stand-in
   and should be replaced the moment real ratings exist. Two measurements, both
   dead ends:
     · `ratingSpreadFor()` — the histogram's bell — floors every bucket at 0.05
       and suppresses low ratings outright, so the bottom tail is pinned at
       exactly 0.20 for all 100 albums. Variance over it ranks the four
       HIGHEST-rated records first (phantom ½★ weight sitting far from a high
       mean), and min-of-tails collapses to `0.4 / total`, which just rewards
       the narrowest bell. Both read as a broken filter.
     · `album.reviews[]` — nearly every album is `[4.5, 4, 4]`; there are two
       distinct spreads across the whole catalogue.
   So it ranks by **proximity to the middle of the scale, weighted by volume**:
   a record parked at 3.4 with 150k reviews is a fair guess at divisive, and a
   4.9 consensus classic is not. `log10` on the count so volume tilts ties
   without letting one blockbuster own the page.
   ⚠️ Real data replaces this with the variance of actual user ratings — at
   which point the wall and the album page's histogram agree by construction,
   which is the whole point of the filter. */
function wallItems() {
  const all = (window.ARCHIVE || []).slice();
  if (window.WALL_SORT !== 'controversial') return all.sort((a, b) => b.rating - a.rating);
  const controversy = a => {
    const mid = 1 - Math.min(1, Math.abs((+a.rating || 0) - 3.4) / 1.6);
    return mid * Math.log10(Math.max(10, a.reviewCount || 0));
  };
  return all
    .map(a => ({ a, v: controversy(a) }))
    .sort((x, y) => (y.v - x.v) || ((y.a.reviewCount || 0) - (x.a.reviewCount || 0)))
    .map(x => x.a);
}

/* The grid's cells, extracted so `pickWallSort()` can repaint them without
   re-rendering the whole screen (which would drop the dropdowns and the scroll
   position). Reads `wallItems()`, so it always reflects the active sort. */
function wallGridHtml() {
  return wallItems().slice(0, 24).map((a, i) => `
              <div class="wall2-cell" onclick="openAlbumPage(ARCHIVE.find(x=>x.album==='${a.album.replace(/'/g, '\\\'')}')||ARCHIVE[0])">
                <div class="wall2-art" style="background-image:url('${a.image}')">${i < 3 ? `<span class="wall2-rank">${i + 1}</span>` : ''}</div>
                <div class="wall2-meta">
                  <span class="wall2-album">${a.album}</span>
                  <span class="wall2-artist">${a.artist}</span>
                  <div class="wall2-rating">${halfStars(a.rating, 11)}<span class="wall2-score">${a.rating.toFixed(1)}</span></div>
                </div>
              </div>`).join('');
}

function wallHtml(light) {
  return `
      <div class="app-screen s-home-v3 s-wall2${light ? ' s-home-v3--light' : ''}">
        ${appHeader()}
        <div class="v3-body">
          <div class="wall2-scroll">
            <div class="wall2-bar">
              <button class="wall2-cat wall2-sort${WALL_SORT === 'popular' ? ' active' : ''}" data-sort="popular"
                      onclick="event.stopPropagation(); pickWallSort(this)">Popular</button>
              <button class="wall2-cat wall2-sort${WALL_SORT === 'controversial' ? ' active' : ''}" data-sort="controversial"
                      onclick="event.stopPropagation(); pickWallSort(this)">Controversial</button>
              <div class="wall2-menuwrap">
                <button class="wall2-cat wall2-drop-btn" onclick="event.stopPropagation(); toggleWallPanel(this)">Genres <span class="wall2-chev">▾</span></button>
                <div class="wall2-menu wall2-menu--genres" hidden>
                  <button class="wall2-menu-item active" onclick="event.stopPropagation(); pickWallGenre(this)">Electronic</button>
                  <button class="wall2-menu-item" onclick="event.stopPropagation(); pickWallGenre(this)">Hip-Hop</button>
                  <button class="wall2-menu-item" onclick="event.stopPropagation(); pickWallGenre(this)">Indie</button>
                  <button class="wall2-menu-item" onclick="event.stopPropagation(); pickWallGenre(this)">Jazz</button>
                  <button class="wall2-menu-item" onclick="event.stopPropagation(); pickWallGenre(this)">Pop</button>
                  <button class="wall2-menu-item" onclick="event.stopPropagation(); pickWallGenre(this)">R&amp;B / Soul</button>
                  <button class="wall2-menu-item" onclick="event.stopPropagation(); pickWallGenre(this)">Rock</button>
                </div>
              </div>
              <div class="wall2-menuwrap">
                <button class="wall2-cat wall2-drop-btn" onclick="event.stopPropagation(); toggleWallPanel(this)"><span class="wall2-time-label">Week</span> <span class="wall2-chev">▾</span></button>
                <div class="wall2-menu wall2-menu--time" hidden>
                  <button class="wall2-menu-item wall2-time-opt active" onclick="event.stopPropagation(); pickWallTime(this)">This Week</button>
                  <button class="wall2-menu-item wall2-time-opt" onclick="event.stopPropagation(); pickWallTime(this)">This Month</button>
                  <button class="wall2-menu-item wall2-time-opt" onclick="event.stopPropagation(); pickWallTime(this)">Past 3 Months</button>
                </div>
              </div>
            </div>
            <div class="wall2-grid">${wallGridHtml()}</div>
          </div>
        </div>
        ${nowBar()}
        ${bottomNav('wall')}
      </div>`;
}

/* ═══════════════════════════════════════════════════════════════════════
   PLAYLIST THEMES — what a card IS, not what colour it is
   ═══════════════════════════════════════════════════════════════════════
   A playlist is the one thing in the app that is purely YOURS — the archive is
   facts and the reviews are opinions, but a playlist is a made object. So a
   theme changes the card's SHAPE, its type and how it treats the artwork, not
   a tint: five cards in five themes should not look like one card five times.

   ⚠ Every theme is one class on `.pl2-card` and pure CSS from there — no theme
   gets its own markup branch. The card ships the same parts (art, title,
   byline, meta, badges) and each theme decides what to do with them; the moment
   one needs an extra element, every other theme has to carry it too. */
/* ═══════════════════════════════════════════════════════════════════
   PLAYLIST COVERS — a still, a GIF, or a VIDEO (`plIsVideo` · `plArtHtml`)
   ═══════════════════════════════════════════════════════════════════
   The card is mostly picture, so the picture is where the expression lives —
   and a loop says things a still cannot. A GIF needs nothing special: it
   animates as a `background-image` like any other file. Only VIDEO has to
   become a real element, so that is the only case worth detecting.

   ⚠️ Detect on the data: MIME as well as the extension. An uploaded cover
   arrives from `FileReader` as a `data:` URL with no filename on it at all, so
   an extension test alone would render every uploaded video as a blank box. */
function plIsVideo(src) {
  src = String(src || '');
  return /^data:video\//i.test(src) || /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src);
}

/* One art layer, whichever kind of file it is.
   ⚠️ NO `autoplay`, and `preload="none"`. The wall can hold ten of these, and
   ten decoders running at once is what turns a scroll into a slideshow on a
   phone. `plVideoWatch` in app.js starts and stops them by visibility instead.
   ⚠️ `muted` + `playsinline` are not optional: without `muted` a browser will
   refuse to play at all without a gesture, and without `playsinline` iOS takes
   the video fullscreen the moment it starts. */
function plArtHtml(src, cls) {
  return plIsVideo(src)
    ? `<video class="${cls} pl2-art-vid" src="${src}" muted loop playsinline preload="none"></video>`
    : `<div class="${cls}" style="background-image:url('${src}')"></div>`;
}

/* The emblems you pin on a card. ⚠ Up to PL_BADGE_MAX — the cap is the design:
   the badges are meant to read as a chosen few, and a card wearing six of them
   says nothing at all. */
const PL_BADGE_MAX = 3;
const PL_BADGES = [
  { id: 'gem',   name: 'Gem' },
  { id: 'flame', name: 'Hot' },
  { id: 'moon',  name: 'Night' },
  { id: 'bolt',  name: 'Bolt' },
  { id: 'drop',  name: 'Tears' },
  { id: 'sun',   name: 'Sun' },
];

/* Per-playlist customisation, keyed by name. Kept apart from `plLists()` so the
   authored sample data stays readable — and so anything you change survives the
   catalogue being re-dealt under a different persona. */
const PL_CUSTOM_KEY = 'spindeck-pl-custom';
function plCustom() {
  try { return JSON.parse(localStorage.getItem(PL_CUSTOM_KEY)) || {}; } catch (e) { return {}; }
}
window.plSetCustom = function (name, patch) {
  const all = plCustom();
  all[name] = Object.assign({}, all[name], patch);
  try { localStorage.setItem(PL_CUSTOM_KEY, JSON.stringify(all)); } catch (e) {}
};

// Song playlists — the shared data for the Lists tab and the playlist page.
// Each has ONE custom image (archive covers stand in for uploads), a free-form
// title, a creator, a track count and a favorites count. favs > 25 → "Popular"
// (--hl box + dog-ear, and the Popular category tab). Array order = chronological
// (most recently updated first) — that's the load-in order of the Lists tab.
// Custom playlists — memey user-typed titles (mixed case, stray symbols: they're
// personal, not editorial), custom cover art (images/playlist-*.jpg — Eric's own
// images, NOT album covers), and a last-edited stamp shown on the card by-line.
// Playlists the user built on the New Playlist page (window.PLNEW_CREATED, set
// up in app.js) ride at the FRONT — the array is "most recently edited first",
// and one you just made is the most recent thing there is.
function plLists() {
  const custom = plCustom();
  /* The authored `badges` below are DEFAULTS — anything set in the customise
     sheet wins. They exist so the wall is not a column of bare cards on first
     load, and they are chosen to fit the list: the 3am one wears a moon and a
     tear, the gym one just the tear.

     Two covers are MOVING, on purpose — one `.mp4` and one `.gif`, so both
     paths are exercised by the sample data rather than only by an upload:
     `plArtHtml` builds a <video> for the first and a plain background for the
     second. Both were generated from the stills beside them (a slow zoom,
     mirrored so the loop is seamless), which is why they cost 93KB and 283KB
     rather than a megabyte each. */
  return [
    ...(window.PLNEW_CREATED || []),
    { name: 'desert island picks ✧',        creator: 'you',         tracks: 24, favs: 87,  plays: 12400, edited: '2h ago', image: 'images/playlist-cyano-birds.jpg',   badges: ['gem', 'sun'] },
    { name: 'nite drives ~ no destination', creator: 'you',         tracks: 18, favs: 12,  plays: 2100,  edited: '1d ago', image: 'images/playlist-car-dash.mp4',     badges: ['moon', 'bolt'] },
    { name: '3am and raining',              creator: 'staticfog',   tracks: 31, favs: 24,  plays: 8900,  edited: '3d ago', image: 'images/playlist-misty-lake.jpg', badges: ['moon', 'drop'], staff: true },
    { name: 'gym but make it sad :(',       creator: 'echoplex',    tracks: 15, favs: 9,   plays: 1400,  edited: '4d ago', image: 'images/playlist-chrome-ooh.jpg',  badges: ['drop'] },
    { name: 'HEAVY ROTATION™',              creator: 'velvetblast', tracks: 42, favs: 138, plays: 31000, edited: '1w ago', image: 'images/playlist-city-red.jpg',   badges: ['flame', 'bolt', 'gem'] },
    { name: 'sunday reset ✿',               creator: 'you',         tracks: 21, favs: 4,   plays: 800,   edited: '1w ago', image: 'images/playlist-wildflowers.gif', badges: ['sun'] },
    { name: 'first date jitters ♡',         creator: 'moonwire',    tracks: 13, favs: 18,  plays: 3200,  edited: '2w ago', image: 'images/playlist-hibiscus.jpg',  badges: ['gem'] },
    { name: 'crying in the club (derogatory)', creator: 'staticfog', tracks: 27, favs: 22, plays: 5600,  edited: '3w ago', image: 'images/playlist-statue-night.jpg',    badges: ['drop', 'moon'] },
    { name: 'headphones on, world off.',    creator: 'echoplex',    tracks: 36, favs: 19,  plays: 7300,  edited: '1mo ago', image: 'images/playlist-ink-alley.jpg',   badges: ['moon'], staff: true },
    { name: 'songs my dad showed me',       creator: 'velvetblast', tracks: 17, favs: 21,  plays: 4100,  edited: '2mo ago', image: 'images/playlist-cyano-horse.jpg', badges: ['gem', 'flame'] },
  /* ⚠️ `key` is stamped LAST and from the literal's own name, so it cannot be
     overridden. Every customisation is stored under it — `custom[key]`, not
     `custom[displayed name]` — which is what lets the editor rename a playlist
     without orphaning its badges. */
  ].map(l => Object.assign({ badges: [] }, l, custom[l.name] || {}, { key: l.name }));
}

// Playlists / Library — adapted to the home shell like the wall. The old five
// variants (My Lists / Artists / Albums / Songs / Genres) are now in-page pill
// tabs (reusing the wall's .wall2-cat pills) switched client-side by plTab().
// All content is generated fresh from ARCHIVE on each render (getter pattern).
function playlistsHtml(light) {
  const esc = s => String(s).replace(/'/g, '\\\'');

  // Playlists only — data shared with the playlist page via plLists().
  // All Playlists = chronological; Popularity = favs desc;
  // Discover = other people's playlists from the community, most-loved first.
  const lists = plLists();
  const byFavs = lists.slice().sort((a, b) => b.favs - a.favs);
  const community = byFavs.filter(l => l.creator !== 'you');
  // Lower-right tag slot (geometry from PlaylistBox_NEW / PlaylistHLBox_NEW.svg):
  // a screen-bg carve scoops the info panel's lower-right corner and Eric's
  // rounded tag seats in it, recolored per type with a centered icon —
  // yellow + crown = community favorite (favs > 25), blue + candle = staff pick.
  const TAG_ICONS = {
    fav:   '<path d="M3 17.5V8.2L8 12L12 5.2L16 12L21 8.2V17.5H3Z"/>',                                     // crown
    staff: '<path d="M12 3.2C13.6 5.4 14.8 6.8 12 9C9.2 6.8 10.4 5.4 12 3.2Z"/><path d="M9.6 11H14.4V20.4A0.8 0.8 0 0 1 13.6 21.2H10.4A0.8 0.8 0 0 1 9.6 20.4V11Z"/>', // candle
  };
  /* ONE card, for every playlist. This briefly carried five user-pickable themes
     and they came out: a wall where each card is a different shape reads as a
     mess, and most people never open a picker — so the default has to be the
     GOOD one, not the safe one. What varies card to card is the ARTWORK and the
     badges, which is variation the user gets just by making the playlist. */
  /* Badges, and — on your own lists — the control that edits them, sitting in
     the same row. ⚠️ The two edit affordances on a card are deliberately
     different glyphs for different scopes: `+` here adds to the badges it is
     standing next to, and the PENCIL in the opposite corner edits the whole
     playlist. Two pencils in two corners would be a coin flip.
     ⚠️ The row still renders on your own card when there are no badges yet —
     otherwise the only way to get a first badge would be a control that only
     appears once you already have one. */
  const badgeHtml = (ids, mine, key) => {
    const on = (ids || []).slice(0, PL_BADGE_MAX).filter(id => SD_ICONS[id]);
    if (!on.length && !mine) return '';
    return `<div class="pl2-badges">${on.map(id =>
      `<span class="pl2-badge pl2-badge--${id}" title="${(PL_BADGES.find(b => b.id === id) || {}).name || id}">${SD_ICONS[id]}</span>`
    ).join('')}${mine ? `
                  <button class="pl2-badge pl2-badge-add" title="Edit badges" aria-label="Edit badges"
                          onclick="event.stopPropagation(); openPlCustomize('${esc(key)}', this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>
                  </button>` : ''}</div>`;
  };

  const listCard = l => {
    const tag = l.staff ? 'staff' : (l.favs > 25 ? 'fav' : '');   // staff pick wins the corner slot
    const tagTitle = l.staff ? 'Staff pick' : 'Community favorite — 25+ favorites';
    const mine = l.creator === 'you';
    return `
              <article class="pl2-card${tag ? ' is-hl' : ''}" onclick="openPlaylistPage('${esc(l.name)}')">
                ${plArtHtml(l.image, 'pl2-card-art')}
                <div class="pl2-card-body">
                  <h3 class="pl2-card-name">${l.name}</h3>
                  <div class="pl2-card-by">by <b>${l.creator}</b>${l.edited ? ` · ${l.edited}` : ''}</div>
                  <div class="pl2-card-meta"><span>${l.tracks} songs</span><span>♥ ${l.favs}</span></div>
                </div>
                ${badgeHtml(l.badges, mine, l.key)}
                ${tag ? `<span class="pl2-card-tag pl2-card-tag--${tag}" title="${tagTitle}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${TAG_ICONS[tag]}</svg></span>` : ''}
                ${mine ? `<button class="pl2-card-edit" title="Edit this playlist" aria-label="Edit playlist"
                            onclick="event.stopPropagation(); openEditPlaylist('${esc(l.key)}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10a2.6 2.6 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>
                          </button>` : ''}
              </article>`;
  };

  return `
      <div class="app-screen s-home-v3 s-pl2${light ? ' s-home-v3--light' : ''}">
        ${appHeader()}
        <div class="v3-body">
          <div class="pl2-scroll">
            <div class="pl2-topbar">
              <div class="wall2-bar pl2-bar">
                <button class="wall2-cat active" onclick="event.stopPropagation(); plTab(this,'all')">All Playlists</button>
                <button class="wall2-cat" onclick="event.stopPropagation(); plTab(this,'popularity')">Popularity</button>
              </div>
              <button class="pl2-discover" title="Discover community playlists" onclick="event.stopPropagation(); plTab(this,'discover')">Discover</button>
              <button class="pl2-add" title="New playlist" aria-label="New playlist" onclick="event.stopPropagation(); openNewPlaylist()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>

            <section class="pl2-sec" data-tab="all">
              ${lists.map(listCard).join('')}
            </section>

            <section class="pl2-sec" data-tab="popularity" hidden>
              ${byFavs.map(listCard).join('')}
            </section>

            <section class="pl2-sec" data-tab="discover" hidden>
              ${community.map(listCard).join('')}
            </section>
          </div>
        </div>
        ${nowBar()}
        ${bottomNav('playlists')}
      </div>`;
}

// The tracklist for a playlist. A playlist built on the New Playlist page
// carries its REAL picks in pl.songs; every sample list gets a deterministic
// stand-in instead — a seeded pick of archive albums, one generated song each,
// ratings hovering near 4.0 (±0.35) plus 1–2 seeded outliers (a dud or a banger).
// Shared, because the detail page and the New Playlist "Add from library"
// browser have to show the SAME songs for a given playlist.
// Keys match plnewPool()'s `album::trackNo::title` so the picker can tell which
// tracks are already in the new playlist.
function plTracksFor(pl) {
  const arch = window.ARCHIVE || [];
  if (pl.songs && pl.songs.length) return pl.songs.slice();
  const rnd = seedRand(pl.name + '::pl');
  const out = Array.from({ length: pl.tracks || 0 }, () => {
    const a = arch[Math.floor(rnd() * arch.length)] || arch[0];
    const t = songsFor(a);
    const s = t[Math.floor(rnd() * t.length)];
    return { title: s.title, dur: s.dur, n: s.n,
             album: a.album, artist: a.artist, image: a.image, genre: a.genre };
  });
  const outliers = new Set();
  const oCount = Math.min(1 + Math.floor(rnd() * 2), out.length);
  while (outliers.size < oCount) outliers.add(Math.floor(rnd() * out.length));
  out.forEach((row, i) => {
    let r = 4.0 + (rnd() - 0.5) * 0.7;
    if (outliers.has(i)) r = rnd() < 0.5 ? 2.4 + rnd() * 0.7 : 4.7 + rnd() * 0.25;
    row.rating = (Math.round(r * 10) / 10).toFixed(1);
    row.key = row.album + '::' + row.n + '::' + row.title;
  });
  return out;
}

// New Playlist — the creation page behind the Playlists "+" button.
//
// Deliberately built on the SAME geometry as the playlist detail page (Eric's
// PlaylistPageBox.svg path, the image panel, the CD in its swoop) so the form
// reads as the page you are filling in: pick a cover and the panel + CD take it,
// type a name and it lands in the title, add songs and the count ticks up. By
// the time you hit Create you have already seen the result.
//
// State lives in window.PLNEW (app.js). This getter paints it directly — the
// getter pattern the other dynamic screens use — so a fresh render is always
// correct on its own, with no post-render init step to go missing. Once the user
// starts interacting, plnewSync() patches the live instances in place instead of
// re-rendering, so the field being typed in keeps its caret; that also keeps the
// viewer's side-by-side dark and light variants agreeing (same problem the
// onboarding wizard solves with obSync).
function playlistNewHtml(light) {
  const dots = '<i class="v3-ring-dot"></i>'.repeat(6);
  const S    = window.PLNEW || { name:'', cover:null, privacy:'public', songs:[], q:'' };
  const esc  = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  const call = (fn, fallback) => (typeof window[fn] === 'function' ? window[fn]() : fallback);
  const priv = p => `plnew-priv-btn${S.privacy === p ? ' active' : ''}`;
  return `
      <div class="app-screen s-home-v3 s-plnew${light ? ' s-home-v3--light' : ''}">
        ${appHeader()}
        <div class="v3-body">
          <div class="plnew-scroll">
            <button class="plp-back-pill" onclick="plnewCancel()" title="Back">
              <span class="v3-ring plp-ring"><span class="v3-ring-spin">${dots}</span></span>
            </button>

            <div class="plp-hero plnew-hero">
              <label class="plp-hero-img plnew-cover${S.cover ? ' plnew-cover--set' : ''}" data-plnew="cover"
                     title="Upload a cover"
                     style="${S.cover ? `background-image:url('${S.cover}')` : ''}">
                <input type="file" accept="image/*,video/mp4,video/webm" class="plnew-file" onchange="plnewUpload(this)">
                <span class="plnew-cover-hint">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 16V4"/><path d="m7.5 8.5 4.5-4.5 4.5 4.5"/><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"/></svg>
                  <i>upload a cover</i>
                </span>
              </label>
              <svg class="plp-hero-shape" viewBox="0 0 688 303" preserveAspectRatio="none" aria-hidden="true">
                <path class="plp-shape-panel" d="M640.322 0.601501L686.662 48.7753V151.386C686.662 162.155 677.932 170.886 667.162 170.886H608.625C570.514 170.886 539.619 201.781 539.619 239.892C539.619 250.425 531.08 258.965 520.546 258.965H253.095V0.601501H640.322Z"/>
              </svg>
              <div class="plp-info plnew-info">
                <input class="plnew-name" type="text" maxlength="46" placeholder="name it…"
                       autocomplete="off" spellcheck="false" data-plnew="name"
                       value="${esc(S.name)}" oninput="plnewSetName(this.value)">
                <div class="plp-by">by <b>you</b></div>
                <div class="plp-meta" data-plnew="count">${call('plnewCountLabel', '0 songs')}</div>
                <div class="plnew-priv">
                  <button class="${priv('public')}"  data-priv="public"  onclick="plnewSetPriv('public')">Public</button>
                  <button class="${priv('private')}" data-priv="private" onclick="plnewSetPriv('private')">Private</button>
                </div>
              </div>
              <div class="plp-cd plnew-cd" data-plnew="cd"
                   style="${S.cover ? `background-image:url('${S.cover}')` : ''}"><div class="v3-cd-hole"></div></div>
            </div>

            <button class="plnew-create" data-plnew="create" onclick="plnewCreate()"
                    ${S.name.trim() ? '' : 'disabled'}>${call('plnewCreateLabel', 'Create playlist')}</button>

            <div class="plnew-find">
              <div class="plnew-searchbar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
                <input class="plnew-q" type="text" placeholder="Search songs, albums, artists"
                       autocomplete="off" spellcheck="false" data-plnew="q"
                       value="${esc(S.q)}" oninput="plnewSearch(this.value)">
              </div>
              <button class="plnew-libbtn${S.mode === 'library' ? ' active' : ''}" data-plnew="libbtn"
                      title="Add songs from your existing playlists" onclick="plnewToggleLib()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                Library
              </button>
            </div>
            <div class="plnew-chosen" data-plnew="chosen">${call('plnewChosenHtml', '')}</div>
            <div class="plnew-results" data-plnew="results">${call('plnewResultsHtml', '')}</div>
          </div>
        </div>
        ${nowBar()}
        ${bottomNav('playlists')}
      </div>`;
}

// Playlist page — geometry from PlaylistPageBox.svg (688×303): image panel
// (left, ~253×259) · info panel (right) with the Popular dog-ear notch top-right
// and a concave swoop carved from its bottom-right where the CD (r=55) sits,
// overflowing below the panel. The hero is an aspect-ratio box: the image panel
// and CD are plain positioned divs; the info panel + dog-ear are Eric's exact
// SVG paths (fill via CSS so both themes work). CD click → streaming platform
// menu; heart button → togglePlFav.
function playlistPageHtml(light) {
  const arch = window.ARCHIVE || [];
  const pl = window.activePlaylist || plLists()[0];
  if (!pl) return '<div class="app-screen s-home-v3"></div>';
  const hot = pl.favs > 25;
  const songs = plTracksFor(pl).map(t => ({
    s: { title: t.title, dur: t.dur },
    album: arch.find(a => a.album === t.album) || { album: t.album, artist: t.artist, image: t.image, genre: t.genre },
    rating: Number(t.rating || 4).toFixed(1),
  }));
  // Majority genres — counted across the tracklist's albums, top 3 by share
  const gCount = new Map();
  songs.forEach(row => { const g = row.album.genre; if (g) gCount.set(g, (gCount.get(g) || 0) + 1); });
  const topGenres = [...gCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
  return `
      <div class="app-screen s-home-v3 s-plp${light ? ' s-home-v3--light' : ''}">
        ${appHeader()}
        <div class="v3-body">
          <div class="plp-scroll">
            <button class="plp-back-pill" onclick="goBack('playlists')" title="Back">
              <span class="v3-ring plp-ring"><span class="v3-ring-spin"><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i></span></span>
            </button>
            <div class="plp-hero${hot ? ' plp-hero--hl' : ''}">
              ${plArtHtml(pl.image, 'plp-hero-img')}
              <svg class="plp-hero-shape" viewBox="0 0 688 303" preserveAspectRatio="none" aria-hidden="true">
                <path class="plp-shape-panel" d="M640.322 0.601501L686.662 48.7753V151.386C686.662 162.155 677.932 170.886 667.162 170.886H608.625C570.514 170.886 539.619 201.781 539.619 239.892C539.619 250.425 531.08 258.965 520.546 258.965H253.095V0.601501H640.322Z"/>
                ${hot ? '<path class="plp-shape-tag" d="M672.162 0.601501C680.17 0.601501 686.662 7.09337 686.662 15.1015V48.791L640.405 0.601501H672.162Z"><title>Popular — 25+ favorites</title></path>' : ''}
              </svg>
              <div class="plp-info">
                <div class="plp-name">${pl.name}</div>
                <div class="plp-by">by <b>${pl.creator}</b></div>
                <div class="plp-meta">${pl.tracks} songs${pl.edited ? ` · edited ${pl.edited}` : ''}</div>
                ${topGenres.length ? `<div class="plp-genres">${topGenres.join(' · ')}</div>` : ''}
                <button class="plp-fav${pl.faved ? ' on' : ''}" onclick="event.stopPropagation(); togglePlFav(this)" title="Favorite this playlist">
                  <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span class="plp-fav-n">${pl.favs}</span>
                </button>
              </div>
              <div class="plp-cd" onclick="event.stopPropagation(); togglePlPlat(this)" style="background-image:url('${pl.image}')" title="Listen on your platform">
                <div class="v3-cd-hole"></div>
              </div>
              <div class="wall2-menu plp-plat" hidden>
                <button class="wall2-menu-item plp-plat-item" onclick="event.stopPropagation(); this.closest('.plp-plat').hidden = true">
                  <span class="plp-plat-ico" style="background:#1DB954"><svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.72 13.5 1.56.36.24.54.84.24 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/></svg></span>
                  Spotify
                </button>
                <button class="wall2-menu-item plp-plat-item" onclick="event.stopPropagation(); this.closest('.plp-plat').hidden = true">
                  <span class="plp-plat-ico" style="background:linear-gradient(135deg,#fc3c44,#fc6f32)"><svg width="9" height="11" viewBox="0 0 13 16" fill="white"><path d="M6.5 0L8 3.5 13 4.3l-3.5 3.4.8 4.8L6.5 10.5 2.2 12.5l.8-4.8L0 4.3l5-.8z"/></svg></span>
                  Apple Music
                </button>
                <button class="wall2-menu-item plp-plat-item" onclick="event.stopPropagation(); this.closest('.plp-plat').hidden = true">
                  <span class="plp-plat-ico" style="background:linear-gradient(135deg,#ff5500,#ff8800)"><svg width="12" height="8" viewBox="0 0 24 16" fill="white"><rect x="2" y="7" width="1.8" height="6" rx=".9"/><rect x="6" y="4" width="1.8" height="9" rx=".9"/><rect x="10" y="6" width="1.8" height="7" rx=".9"/><rect x="14" y="2" width="1.8" height="11" rx=".9"/><rect x="18" y="8" width="1.8" height="5" rx=".9"/></svg></span>
                  SoundCloud
                </button>
              </div>
            </div>
            <!-- Songs — laid out like the album page's tracklist (.v3-song-*):
                 a SONG / LENGTH / RATING header, then number · title · length ·
                 rating rows on the same 12px gutter, hairlines and column widths.
                 Only the title cell differs: the album and artist follow the
                 song name, since a playlist's rows come from many records.
                 The --album modifier scopes the restyle; the New Playlist page shares
                 these row classes and keeps its own look. -->
            <div class="plp-songs plp-songs--album">
              ${songs.length ? '' : '<div class="plp-empty">No songs yet — this playlist is empty.</div>'}
              ${songs.length ? `
              <div class="plp-song-head">
                <span class="plp-song-num"></span>
                <span class="plp-song-line">Song</span>
                <span class="plp-song-dur">Length</span>
                <span class="plp-song-rate">Rating</span>
              </div>` : ''}
              ${songs.map((row, i) => `
              <div class="plp-song" onclick="event.stopPropagation(); plSongTap(this)" data-image="${row.album.image}" data-title="${row.s.title}" data-sub="${row.album.album}">
                <div class="plp-song-num">${i + 1}</div>
                <div class="plp-song-line"><span class="plp-song-title">${row.s.title}</span><span class="plp-song-album">${row.album.album}</span> · <span class="plp-song-artist">${row.album.artist}</span></div>
                <div class="plp-song-dur">${row.s.dur}</div>
                <div class="plp-song-rate">${row.rating}</div>
              </div>`).join('')}
            </div>
          </div>
        </div>
        ${nowBar()}
        ${bottomNav('playlists')}
      </div>`;
}

// Bottom nav — glass "console" bar: raised center hump (holds the now-playing bubble)
// with 4 buttons in the lower bar. Floats centered, off the bottom, over the content.
/* ============================================================
   NOTIFICATIONS  (`s-ntf`)
   ⚠️ EVERY row is about YOU — someone liked/replied to your review, followed
   you, touched your playlist, or one of your things hit a milestone. That is
   the line between this and the home feed: the inbox is your interactions, the
   feed is what other people did. New-release announcements used to sit here and
   were about nobody, so they went. — behind the header's bell bubble
   ============================================================
   An activity inbox on the standard home shell. One flat list of rows;
   the filter pills (All / Social / Reviews / Releases) hide rows by
   `data-tab` client-side (notifTab in app.js), and a time bucket header
   hides itself when its rows all filter out. Unread rows carry
   `.ntf-row--new` (accent rail + dot); "Mark all read" strips them.

   Every row is: avatar (or album art) + kind badge · copy · time ·
   trailing slot (album thumb, or a Follow-back button for follows). */

// Who shows up in the inbox. Handles are the same community accounts that
// author the sample playlists (plLists) so the prototype stays consistent;
// each keeps ONE photo from the rp-* pool so a person looks like themselves
// wherever they appear.
function ntfPeople() {
  return {
    velvetblast: 'images/rp-07.jpg',
    staticfog:   'images/rp-14.jpg',
    echoplex:    'images/rp-22.jpg',
    moonwire:    'images/rp-31.jpg',
    tapehiss:    'images/rp-40.jpg',
    glassmoth:   'images/rp-49.jpg',
  };
}

// The inbox itself. Hand-authored (not generated) — the copy carries the
// app's voice, and each row names a real archive album so the art resolves.
// `tab` drives the filter pills; `bucket` drives the time grouping.
function ntfItems() {
  return [
    { type:'like',      tab:'reviews',  user:'velvetblast', bucket:'today', unread:true,
      text:'liked your review of', album:'Loveless', time:'12m' },
    { type:'follow',    tab:'social',   user:'moonwire',    bucket:'today', unread:true,
      text:'started following you', time:'40m' },
    { type:'comment',   tab:'social',   user:'staticfog',   bucket:'today', unread:true,
      text:'replied to your review of', album:'Punisher', time:'1h',
      quote:'ok but you gave this a 4.5 and Blonde a 4.0? explain yourself' },
    { type:'like',      tab:'social',   user:'velvetblast', bucket:'today', unread:true,
      text:'favourited your playlist', playlist:'desert island picks ✧', time:'3h' },
    { type:'milestone', tab:'reviews',  bucket:'today',     unread:true,
      subj:'Your review', link:'of', album:'Untrue', tail:'passed 100 upvotes', time:'5h' },

    { type:'like',      tab:'reviews',  user:'echoplex',    bucket:'week',
      text:'liked your review of', album:'Blonde', time:'1d' },
    { type:'playlist',  tab:'social',   user:'staticfog',   bucket:'week',
      text:'added a song you rated to', playlist:'3am and raining', time:'2d' },
    { type:'follow',    tab:'social',   user:'tapehiss',    bucket:'week',
      text:'started following you', time:'2d' },
    { type:'comment',   tab:'social',   user:'glassmoth',   bucket:'week',
      text:'replied to your review of', album:'Mezzanine', time:'4d',
      quote:'the Angel take is correct and you should say it louder' },
    { type:'milestone', tab:'reviews',  bucket:'week',
      subj:'Your review', link:'of', album:'Mezzanine', tail:'is the top review this week', time:'5d' },

    { type:'like',      tab:'reviews',  user:'moonwire',    bucket:'earlier',
      text:'liked your review of', album:'To Pimp a Butterfly', time:'1w' },
    { type:'milestone', tab:'reviews',  bucket:'earlier',
      subj:'Your playlist', playlist:'desert island picks ✧', tail:'hit 87 favorites', time:'2w' },
    { type:'follow',    tab:'social',   user:'velvetblast', bucket:'earlier',
      text:'started following you', time:'3w' },
  ];
}

function notificationsHtml(light) {
  const arch  = window.ARCHIVE || [];
  const pics  = ntfPeople();
  const items = ntfItems();
  const esc   = s => String(s).replace(/'/g, '\\\'');
  const albOf = name => arch.find(a => a.album === name) || arch[0] || {};
  const unread = items.filter(i => i.unread).length;

  // Small glyph clipped to the avatar's bottom-right — says what happened
  // before you've read a word of the copy.
  const BADGES = {
    like:      '<path d="M12 20s-7-4.6-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.4 12 20 12 20Z"/>',
    follow:    '<path d="M10 11a3.4 3.4 0 1 0 0-6.8A3.4 3.4 0 0 0 10 11Z"/><path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h4a4.5 4.5 0 0 1 4.5 4.5V20Z"/><path d="M19 6.5v5M21.5 9h-5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
    comment:   '<path d="M4 5.5h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8.6L7 20v-4.5H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"/>',
    release:   '<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/>',
    milestone: '<path d="m12 3.5 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.9l6.1-.8Z"/>',
    playlist:  '<path d="M4 6h12v2H4zM4 11h12v2H4zM4 16h8v2H4z"/><path d="M18.5 11.5v6.2a2 2 0 1 1-1.6-2V10l3.6-.9v2Z"/>',
  };

  // System rows (release / milestone) already wear the album art as their
  // avatar, so they get no trailing thumb — it would just be the same cover
  // twice. A follow gets the follow-back button instead of art.
  const isSys = it => it.type === 'release' || it.type === 'milestone';
  const trail = it => {
    if (it.type === 'follow')
      return `<button class="ntf-follow" onclick="event.stopPropagation(); ntfFollowBack(this)">Follow</button>`;
    if (it.album && !isSys(it))
      return `<div class="ntf-art" style="background-image:url('${albOf(it.album).image || ''}')"></div>`;
    return '';
  };

  /* Copy line — every row is SUBJECT · VERB · OBJECT, in that order, so the
     screen reads as sentences instead of as a log. The subject is bold and
     matches the avatar beside it; the object is the record or playlist.
     ⚠️ A milestone has no person, so the subject is a THING you own ("Your
     review", "Your playlist") — which is exactly why its avatar is square. It
     used to render that subject unstyled while the album took the emphasis,
     so the row read object-first and broke the pattern. The object (album /
     playlist) is optional: a follow row has none. */
  const line = it => {
    if (it.type === 'release') {
      const a = albOf(it.album);
      return `<b>${a.artist || ''}</b> released <i>${it.album}</i>`;
    }
    const obj = it.playlist || it.album;
    if (it.type === 'milestone')
      return `<b>${it.subj}</b>${it.link ? ` ${it.link}` : ''} <i>${obj}</i> ${it.tail}`;
    return `<b>${it.user}</b> ${it.text}${obj ? ` <i>${obj}</i>` : ''}`;
  };

  // Where a row takes you: an album row opens that album, a person row
  // opens their profile, a playlist row opens the playlist.
  const go = it => {
    if (it.playlist) return `openPlaylistPage('${esc(it.playlist)}')`;
    if (it.album)    return `openAlbumPage(ARCHIVE.find(x=>x.album==='${esc(it.album)}')||ARCHIVE[0])`;
    return `navigate('profile')`;
  };

  const row = it => {
    // System rows have no person, so the album cover stands in for the avatar.
    const face = isSys(it)
      ? `style="background-image:url('${albOf(it.album).image || 'images/spindeck-icon.png'}')"`
      : `style="background-image:url('${pics[it.user] || ''}')"`;
    return `
              <div class="ntf-row${it.unread ? ' ntf-row--new' : ''}" data-tab="${it.tab}" onclick="${go(it)}">
                <div class="ntf-who">
                  <div class="ntf-ava${isSys(it) ? ' ntf-ava--art' : ''}" ${face}>
                    <span class="ntf-badge ntf-badge--${it.type}">
                      <svg viewBox="0 0 24 24" fill="currentColor">${BADGES[it.type]}</svg>
                    </span>
                  </div>
                  <div class="ntf-time">${it.time}</div>
                </div>
                <div class="ntf-body">
                  <div class="ntf-text">${line(it)}</div>
                  ${it.quote ? `<div class="ntf-quote">${it.quote}</div>` : ''}
                </div>
                ${trail(it)}
              </div>`;
  };

  const BUCKETS = [['today', 'Today'], ['week', 'This week'], ['earlier', 'Earlier']];
  const groups = BUCKETS.map(([key, label]) => {
    const rows = items.filter(i => i.bucket === key);
    if (!rows.length) return '';
    return `
            <div class="ntf-group">
              <div class="ntf-group-hd">${label}</div>
              ${rows.map(row).join('')}
            </div>`;
  }).join('');

  return `
      <div class="app-screen s-home-v3 s-ntf${light ? ' s-home-v3--light' : ''}">
        ${appHeader()}
        <div class="v3-body">
          <div class="ntf-scroll">
            <div class="ntf-top">
              <button class="plp-back-pill" onclick="navigate('home')" title="Back">
                <span class="v3-ring plp-ring"><span class="v3-ring-spin">${'<i class="v3-ring-dot"></i>'.repeat(6)}</span></span>
              </button>
              <div class="ntf-top-r">
                ${unread ? `<span class="ntf-count">${unread} new</span>` : ''}
                <button class="ntf-readall" onclick="event.stopPropagation(); ntfMarkAll(this)">Mark all read</button>
              </div>
            </div>

            ${groups}

            <div class="ntf-empty" hidden>Nothing here yet.</div>
          </div>
        </div>
        ${nowBar()}
        ${bottomNav('home')}
      </div>`;
}

/* ============================================================
   SETTINGS  (`s-set`) — behind the header's gear bubble
   ============================================================
   A plain grouped-list settings page on the home shell: an account card
   up top (tap → Edit Profile), then labelled sections of rows. A row is
   built by setRow() and ends in one of four controls — a switch
   (sdToggle), a segmented picker (sdSeg), a status pill, or a chevron
   link. Sign out is the one destructive row and sits alone at the end. */

function settingsHtml(light) {
  const P = window.PROFILE || {};
  const dots = '<i class="v3-ring-dot"></i>'.repeat(6);

  // — controls —
  const sw = (on) => `
                  <button class="set-sw${on ? ' is-on' : ''}" role="switch" aria-checked="${!!on}"
                          onclick="event.stopPropagation(); sdToggle(this)"><span class="set-sw-knob"></span></button>`;
  const seg = (opts, active) => `
                  <div class="set-seg">${opts.map(o =>
                    `<button class="${o === active ? 'active' : ''}" onclick="event.stopPropagation(); sdSeg(this)">${o}</button>`).join('')}</div>`;
  const pill  = (txt, on) => `<span class="set-pill${on ? ' set-pill--on' : ''}">${txt}</span>`;
  const chev  = `<svg class="set-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`;

  // label · optional sub-label · trailing control. `onclick` makes the whole
  // row tappable (link rows); control rows swallow the click on the control.
  const setRow = (label, sub, control, onclick) => `
                <div class="set-row${onclick ? ' set-row--link' : ''}"${onclick ? ` onclick="${onclick}"` : ''}>
                  <div class="set-row-body">
                    <div class="set-row-label">${label}</div>
                    ${sub ? `<div class="set-row-sub">${sub}</div>` : ''}
                  </div>
                  ${control}
                </div>`;

  const section = (title, rows) => `
              <section class="set-sec">
                <div class="set-sec-hd">${title}</div>
                <div class="set-card">${rows}</div>
              </section>`;

  // Connected services — brand dot + name + connect state.
  const service = (name, sub, brand, on) => `
                <div class="set-row set-row--link" onclick="event.stopPropagation(); sdConnect(this)">
                  <span class="set-svc-dot" style="background:${brand}"></span>
                  <div class="set-row-body">
                    <div class="set-row-label">${name}</div>
                    <div class="set-row-sub">${sub}</div>
                  </div>
                  ${pill(on ? 'Connected' : 'Connect', on)}
                </div>`;

  return `
      <div class="app-screen s-home-v3 s-set${light ? ' s-home-v3--light' : ''}">
        ${appHeader()}
        <div class="v3-body">
          <div class="set-scroll">
            <button class="plp-back-pill" onclick="navigate('profile')" title="Back">
              <span class="v3-ring plp-ring"><span class="v3-ring-spin">${dots}</span></span>
            </button>

            <h2 class="set-title">Settings</h2>

            <div class="set-acct" onclick="navigate('profile-edit')">
              <div class="set-acct-pic" style="background-image:url('${P.pic || 'images/rp-01.jpg'}')"></div>
              <div class="set-acct-body">
                <div class="set-acct-name">${P.name || 'You'}</div>
                <div class="set-acct-handle">@${P.handle || 'you'} · since ${P.since || '2023'}</div>
              </div>
              <span class="set-acct-edit">Edit profile ${chev}</span>
            </div>

            <button class="set-signout" onclick="navigate('auth')">Sign out</button>

            ${section('Appearance', [
              setRow('Theme', null, seg(['Dark', 'Light', 'Auto'], light ? 'Light' : 'Dark')),
              setRow('Profile theme', 'Funky 01', chev, "navigate('profile-edit')"),
              setRow('Reduce motion', 'Stops the spinning CD and ticker', sw(false)),
            ].join('')) }

            ${section('Connected services', [
              // Sits above the services because it governs what they broadcast.
              setRow('Show listening activity', 'Friends see what you\'re playing, live', sw(true)),
              service('Spotify',     'Export playlists · scrobble plays', '#1db954', true),
              service('Apple Music', 'Sync your library',                 '#fa2d48', false),
              service('Last.fm',     'Import your listening history',     '#d51007', false),
            ].join('')) }

            ${section('Playback', [
              setRow('30-second previews', 'Tap the CD to play a clip', sw(false)),
              setRow('Autoplay next track', null, sw(true)),
              setRow('Explicit content', null, sw(true)),
              setRow('Audio quality', 'High', chev, 'void 0'),
            ].join('')) }

            ${section('Notifications', [
              setRow('New followers', null, sw(true)),
              setRow('Review likes &amp; replies', null, sw(true)),
              setRow('New releases from artists you follow', null, sw(true)),
              setRow('Weekly recap', 'Your listening, every Sunday', sw(false)),
            ].join('')) }

            ${section('Privacy', [
              setRow('Private profile', 'Only approved followers see your reviews', sw(false)),
              setRow('Blocked accounts', '2', chev, 'void 0'),
            ].join('')) }

            ${section('About', [
              setRow('Version', 'Spindeck 0.9 (prototype)', ''),
              setRow('Terms of service', null, chev, 'void 0'),
              setRow('Privacy policy', null, chev, 'void 0'),
            ].join('')) }
          </div>
        </div>
        ${nowBar()}
        ${bottomNav('profile')}
      </div>`;
}

/* ── SHOP ─────────────────────────────────────────────────────
   Reached from the SHOP BUTTON IN THE NAV SCOOP (sdShopBtn), which took the
   pet's place. In-app goods only — things that change YOUR Spindeck, not
   physical merch.

   THE SYSTEM — "sheets". A section is one `.shop-sheet`: tiles that butt
   together with a 3px seam of screen bg between them, one outer radius, one
   shadow. Bento density INSIDE a sheet, Apple-Store air BETWEEN sheets. Three
   sheet types and no more:

     --bento   the home bento's own silhouette, rebuilt out of products:
               big square + two stacked + a wide tile under the square, leaving
               the bottom-right as a CORNER GAP with a real fillet at its inner
               corner. The one place the shop admits it is the same object as
               the home screen. Used once, for Pro.
     --shelf   a horizontal rail that bleeds to the frame edge and peeks (the
               `.v3-aa-row` idiom, already the app's convention). Used for
               themes, where the swatch IS the preview and browsing beats
               reading.
     --row     N equal tiles across. Used for frames and badges — small things
               where the product is the glyph.

   ⚠️ Every tile carries its own `--tint`. That is the bento's procedural-colour
   idea moved onto products: the home bento takes its colour from the cover, and
   in here each tile takes its colour from what it sells. It is the only source
   of colour on the screen besides the gold. */
/* ════════════════════════════════════════════════════════════════════════════
   SHOP — the four aisles (SHOP_CATS) and the tickets (SHOP_EVENTS)
   ════════════════════════════════════════════════════════════════════════════
   GENERAL is not a category, it is the FRONT of the store — a little of each of
   the other three, in the order you would want to meet them. The other tabs are
   the full shelf. That is why a tile can belong to two aisles at once
   (data-cat="general events"): the storefront shows the same tile the Events tab
   does, rather than a second copy of it that can drift.

   ⚠️ The filter is CSS, not a re-render — see the .s-shop[data-cat=...] block
   in app.css. Switching tabs must not rebuild the screen: the Pro showcase is a
   LIVE bento with a shelf wheel bound to it, and a rebuild would throw that away
   every time you glanced at Themes. */
const SHOP_CATS = [
  { id: 'general', label: 'General' },
  { id: 'events',  label: 'Events'  },
  { id: 'themes',  label: 'Themes'  },
  { id: 'badges',  label: 'Badges'  },
];

/* Which aisle you are standing in. On `window` because it has to survive a
   renderViewer() — buying Pro rebuilds every shell, and a tab that snapped back
   to General each time you bought something would be its own bug. shopCat() in
   app.js writes it; shopHtml reads it back on the way out. */
window.SHOP_CAT = window.SHOP_CAT || 'general';

/* The word SHOP, spelled in the dot language.
   ⚠️ There is no "wordmark font" to set this in — the SPINDECK lockup is
   images/spindeck-wordmark.png, a drawn mark with no typeface behind it. What
   the mark is BUILT from is a kind of typeface though: the rounded-square module
   that draws every icon in here. So the title is spelled in that, by the same
   generator, and picks up the same currentColor tint as the bag in the nav
   scoop. 4-wide letters on a 5-row body with one empty column between them —
   the same 5-row budget SD_DOT_ICONS works to.
   ⚠️ SD_DOTS ships its <svg> aria-hidden, so the actual word rides beside it
   in a .shop-sr span. Change these rows, change that text. */
const SHOP_WORD = ['.xxx.x..x..xx..xxx.',
                   'x....x..x.x..x.x..x',
                   '.xx..xxxx.x..x.xxx.',
                   '...x.x..x.x..x.x...',
                   'xxx..x..x..xx..x...'];

/* ════════════════════════════════════════════════════════════════════════════
   EVENTS — the one thing in the shop that is not a cosmetic
   ════════════════════════════════════════════════════════════════════════════
   Everything else in here dresses up your page. A ticket gets you into a room,
   and that difference is why it gets its own sheet type (--list) instead of
   another tray of swatches: a theme is a picture you judge at a glance, an event
   is four facts you read in ORDER — who, what, where-and-when, how much — and a
   square swatch has nowhere to put them.

   ⚠️ `pro: true` is the exclusive half, and it renders BOTH states — the
   locked pill AND the real price button — with body.sd-pro choosing which one
   shows (app.css). No JS, no rebuild: flipping the toolbar's Free/Pro switch
   unlocks the whole list in front of you, which is the entire demo. Gating it in
   JS would have meant a re-render, and a re-render loses the shelf wheel.

   ⚠️ `feat: true` is what General shows, and it is TWO of them, one of each
   kind. The storefront gets two rows to say both "there are tickets here" and
   "some of these are Pro's", so it cannot spend them on two of the same thing.

   The art is album art already in images/ — these are artists whose records are
   in the archive, so the storefront never bills a record the app has never
   heard of. */
const SHOP_EVENTS = [
  { id: 'bugseed',  feat: true,  pro: false, price: '$28',
    who: 'Bugseed',         what: 'Soundcraft, end to end',     where: 'Zebulon · Los Angeles',   when: 'Oct 04',
    art: 'images/album-bugseed-soundcraft.jpg' },
  { id: 'earl',     feat: true,  pro: true,  price: '$22',
    who: 'Earl Sweatshirt', what: 'Members listening room',     where: 'Lodge Room · Los Angeles', when: 'Nov 02',
    art: 'images/album-earlsweatshirt-doris.jpg' },
  { id: 'floating', feat: false, pro: false, price: '$46',
    who: 'Floating Points', what: 'Crush live, three hours',    where: 'Knockdown · New York',    when: 'Oct 18',
    art: 'images/album-floatingpoints-crush.png' },
  { id: 'burial',   feat: false, pro: false, price: '$34',
    who: 'Burial',          what: 'Untrue, all night',          where: 'Corsica · London',        when: 'Nov 15',
    art: 'images/album-burial-untrue.jpg' },
  { id: 'arca',     feat: false, pro: true,  price: '$52',
    who: 'Arca',            what: 'Soundcheck, twenty people',  where: 'Berghain · Berlin',       when: 'Dec 06',
    art: 'images/album-arca-mutant.jpg' },
  { id: 'epikhigh', feat: false, pro: false, price: '$40',
    who: 'Epik High',       what: 'Shoebox anniversary',        where: 'Olympic Hall · Seoul',    when: 'Dec 20',
    art: 'images/album-epikhigh-shoebox.png' },
];

function shopHtml(light) {
  const dots = '<i class="v3-ring-dot"></i>'.repeat(6);
  const pro  = typeof isPro === 'function' && isPro();
  const skin = typeof bentoSkin === 'function' ? bentoSkin() : null;
  const cat  = window.SHOP_CAT;

  /* Which aisles a thing belongs to. NO attribute at all = never filtered,
     which is what the back pill, the title, the tabs and the footnote want. */
  const at = cats => cats ? ` data-cat="${cats}"` : '';

  /* ⚠ `tag` stamps data-tag on the button. sdBuy reads it to record REAL
     ownership (SD_TAG_OWNED) before doing its usual label swap — everything
     else in this shop only swaps a label, but a tag you bought has to turn up
     in the picker on the edit page or the purchase did nothing. */
  const buy = (price, owned, tag) => owned
    ? `<span class="shop-owned">Owned</span>`
    : `<button class="shop-buy"${tag ? ` data-tag="${tag}"` : ''} onclick="event.stopPropagation(); sdBuy(this)">${price}</button>`;

  const sec = (title, sub, cats) => `
              <div class="shop-sec-hd"${at(cats)}>${title}${sub ? `<span>${sub}</span>` : ''}</div>`;

  // Theme tile — the swatch IS the preview, so it takes most of the card.
  const theme = (name, sub, a, b, c, price, owned, cats) => `
                  <div class="shop-tile shop-tile--theme"${at(cats)}>
                    <div class="shop-field" style="background:linear-gradient(145deg,${a},${b})">
                      <span class="shop-chip" style="background:${c}"></span>
                    </div>
                    <div class="shop-tile-name">${name}</div>
                    <div class="shop-tile-sub">${sub}</div>
                    ${buy(price, owned)}
                  </div>`;

  // Frame tile — a ring on a tinted field. The ring is the product; there is
  // nothing to describe that the shape doesn't already say.
  const frame = (name, ring, tint, price, owned) => `
                  <div class="shop-tile shop-tile--sm" style="--tint:${tint}" data-cat="themes">
                    <div class="shop-field shop-field--tint"><span class="shop-ring" style="${ring}"></span></div>
                    <div class="shop-tile-name">${name}</div>
                    ${buy(price, owned)}
                  </div>`;

  const badge = (glyph, name, tint, price, owned, cats) => `
                  <div class="shop-tile shop-tile--sm" style="--tint:${tint}"${at(cats)}>
                    <div class="shop-field shop-field--tint shop-field--ico">${glyph}</div>
                    <div class="shop-tile-name">${name}</div>
                    ${buy(price, owned)}
                  </div>`;

  /* One event, as a ROW: the art, the three lines that answer who / what /
     where-and-when, then the price. A Pro event ships the locked pill AND the
     price button — see SHOP_EVENTS for why both are in the markup at once.
     data-owned is what sdBuy swaps the button for: a ticket you hold is not
     "Owned", it is somewhere you are Going. */
  const ev = (e, cats) => `
                  <div class="shop-tile shop-tile--event${e.pro ? ' is-pro' : ''}"${at(cats)}>
                    <span class="shop-ev-art" style="background-image:url('${e.art}')">${
                      e.pro ? '<span class="shop-ev-pro">Pro</span>' : ''}</span>
                    <span class="shop-ev-line">
                      <span class="shop-ev-who">${e.who}</span>
                      <span class="shop-ev-what">${e.what}</span>
                      <span class="shop-ev-where">${e.where} · ${e.when}</span>
                    </span>
                    ${e.pro ? `<span class="shop-lock">Pro only</span>` : ''}
                    <button class="shop-buy shop-buy--ev" data-owned="Going"
                            onclick="event.stopPropagation(); sdBuy(this)">${e.price}</button>
                  </div>`;

  /* A tag row: the chip itself is the product shot — there is nothing to
     picture beyond the thing you would be wearing.
     ⚠ Filed under BOTH General and Events, like the tickets above it. Every
     collectible tag is an event or a pressing — DaisyChainsFestival2026 belongs
     beside the ticket to the thing that handed it out, and a shopper in the
     Events aisle who can't see them would think the aisle was only tickets. */
  const tagRow = t => `
                  <div class="shop-tagrow"${at('general events')}>
                    <div class="shop-tagrow-l">
                      ${tagChip(t)}
                      <span class="shop-tagrow-s">${t.note || ''}</span>
                    </div>
                    ${buy(t.price, typeof sdOwnsTag === 'function' && sdOwnsTag(t.id), t.id)}
                  </div>`;

  return `
      <div class="app-screen s-home-v3 s-shop${light ? ' s-home-v3--light' : ''}" data-cat="${cat}">
        ${appHeader()}
        <div class="v3-body">
          <div class="shop-scroll">
            <button class="plp-back-pill" onclick="navigate('home')" title="Back">
              <span class="v3-ring plp-ring"><span class="v3-ring-spin">${dots}</span></span>
            </button>

            <!-- The name of the store, spelled in the dot language rather than
                 set in a face. See SHOP_WORD for why there is no font to use. -->
            <h2 class="shop-title">${SD_DOTS.svg(SHOP_WORD, { cls: 'shop-title-mark' })}<span class="shop-sr">Shop</span></h2>

            <!-- The aisles. Sticky, because the name of the store is a greeting
                 you read once and the aisle you are in is where you ARE. -->
            <div class="shop-cats" role="tablist" aria-label="Shop categories">${SHOP_CATS.map(c => `
              <button class="shop-cat${c.id === cat ? ' is-on' : ''}" type="button" role="tab"
                      aria-selected="${c.id === cat}" data-go="${c.id}"
                      onclick="event.stopPropagation(); shopCat(this, '${c.id}')">${c.label}</button>`).join('')}
            </div>

            <!-- Pro showcase — the REAL compact-state bento, the same
                 bentoHtml() the home screen renders, driven by the same
                 engine (populateHomeData finds it and fills it like any home).
                 Showing the actual object beats drawing a picture of it, and it
                 means the showcase can never drift from the thing it sells.
                 The Pro gesture is wired onto it by shopProInit in app.js. -->
            <div class="shop-showcase" id="shopPro" data-cat="general">
              <span class="shop-pro-tag">Pro</span>
              <!-- The model's own box. The scale lives HERE and not on the
                   bento, so the showcase still styles the case and never the
                   product — see the .shop-model rule in app.css.
                   ⚠ NO BACKTICKS IN HERE. This is plain text inside a template
                   literal, so a backtick ENDS the template: this line used to
                   quote the class name and the parse ran on as
                   "...product - see " . shop - model, which threw
                   "model is not defined" and took the whole Shop screen with
                   it. Quote a name with quotes, or not at all. -->
              <div class="shop-model">${bentoHtml()}</div>
            </div>
            <!-- The pitch row is also the STATUS row. Read from the plan
                 (isPro), so the storefront and the toolbar switch can never
                 disagree — and buying here flips the plan for the whole app
                 rather than just swapping this one button's label.
                 ⚠️ It rides along to Events as well: that is the tab where half
                 the list is locked, so it is the one place the offer answers a
                 question the user is already asking. -->
            <div class="shop-sheet shop-sheet--pro" data-cat="general events">
              <span class="shop-buy-l"><b>Pro</b>${pro
                ? 'Exclusive tickets, and hold the cover<br/>on your home screen to change shelf.'
                : 'Exclusive tickets, and hold the cover<br/>to swipe between For You and genres.'}</span>
              ${pro
                ? `<span class="shop-owned shop-owned--pro">Active</span>`
                : `<button class="shop-pro-btn" onclick="event.stopPropagation(); sdBuy(this)">$3<small>/mo</small></button>`}
            </div>

            ${sec('Events', 'tickets, and rooms only Pro gets into', 'general events')}
            <div class="shop-sheet shop-sheet--list" data-cat="general events">${SHOP_EVENTS.map(e =>
              ev(e, e.feat ? 'general events' : 'events')).join('')}
            </div>

            ${sec('Themes', 'the look of your page', 'general themes')}
            <div class="shop-sheet shop-sheet--shelf" data-cat="general themes">
              ${theme('Funky 01', 'the one you have',    '#2a2119', '#171319', '#e8a83c', '$2', true,  'general themes')}
              ${theme('Midnight', 'ink &amp; deep blue', '#141824', '#0e1018', '#5b7cc4', '$2', false, 'general themes')}
              ${theme('Bleach',   'paper &amp; red',     '#e9e4d8', '#cfc7b6', '#c8492f', '$2', false, 'general themes')}
              ${theme('Chrome',   'silver &amp; glass',  '#2b2d33', '#1a1b20', '#b8bcc6', '$3', false, 'general themes')}
              ${theme('Verdigris','copper &amp; patina', '#1b2a26', '#101a18', '#5fae95', '$3', false, 'themes')}
              ${theme('Ultra',    'black &amp; signal',  '#101014', '#08080a', '#d64dff', '$3', false, 'themes')}
            </div>

            <!-- ⚠️ Playlist themes and badges are NOT sold here, and should not be
                 added back. They dress up what the user MADE, not the user — see
                 PL_BADGES. Everything below dresses up YOU, which is the line.
                 ⚠️ Frames sit under the THEMES tab rather than an aisle of their
                 own: four categories was the brief, and the ring around your
                 favourites is the look of your page the same way a theme is. -->
            ${sec('Frames', 'rings your favourites sit in', 'themes')}
            <div class="shop-sheet shop-sheet--row" data-cat="themes">
              ${frame('Hairline', 'border:2px solid currentColor',  '232,226,214', '&#8212;',  true)}
              ${frame('Gold',     'border:4px solid #e8a83c',       '232,168,60',  '$1')}
              ${frame('Dashed',   'border:3px dashed currentColor', '232,226,214', '$1')}
              ${frame('Double',   'border:2px solid #e8a83c; box-shadow:0 0 0 4px rgba(232,168,60,.28)', '232,168,60', '$2')}
            </div>

            <!-- Skins dress the BENTO — the one thing on your home that is
                 yours to look at all day. The preview is the skin's own ears,
                 cropped, in the tile's tint. data-skin routes the purchase
                 through setBentoSkin, so buying it puts it on straight away. -->
            ${sec('Skins', 'your bento, dressed up', 'general themes')}
            <div class="shop-sheet shop-sheet--row" data-cat="general themes">
              <div class="shop-tile shop-tile--sm" style="--tint:232,168,60" data-cat="general themes">
                <div class="shop-field shop-field--tint shop-field--skin"><svg viewBox="196 -4 494 92" aria-hidden="true"><path fill="currentColor" d="M271.193 27.1351C260.863 45.1685 243.754 86.9451 203.781 86.9451H379.724C391.991 59.0226 360.127 21.9865 338.605 6.95886C328.91 0.188953 292.216 -9.5636 271.193 27.1351Z"/><path fill="currentColor" d="M561.782 27.1351C551.452 45.1685 534.343 86.9451 494.37 86.9451H670.312C682.58 59.0226 650.716 21.9865 629.194 6.95886C619.498 0.188953 582.804 -9.5636 561.782 27.1351Z"/><path fill="currentColor" opacity=".55" d="M283.856 39.9244C276.538 54.1016 264.419 86.9451 236.103 86.9451H360.736C369.426 64.9933 346.855 35.8768 331.609 24.0625C324.741 18.7402 298.748 11.0731 283.856 39.9244Z"/><path fill="currentColor" opacity=".55" d="M574.445 39.9244C567.127 54.1016 555.008 86.9451 526.692 86.9451H651.325C660.015 64.9933 637.444 35.8768 622.198 24.0625C615.33 18.7402 589.337 11.0731 574.445 39.9244Z"/></svg></div>
                <div class="shop-tile-name">Furry</div>
                ${skin === 'furry'
                  ? `<span class="shop-owned">Owned</span>`
                  : `<button class="shop-buy" data-skin="furry" onclick="event.stopPropagation(); sdBuy(this)">$2</button>`}
              </div>
            </div>

            ${sec('Badges', 'they sit next to your name', 'general badges')}
            <div class="shop-sheet shop-sheet--row" data-cat="general badges">
              ${badge(SD_ICONS.heart,  'Devotee',   '224,97,111',  '$1', true,  'general badges')}
              ${badge(SD_ICONS.ear,    'Deep Cuts', '91,124,196',  '$1', false, 'general badges')}
              ${badge(SD_ICONS.clock,  'Day One',   '232,168,60',  '$2', false, 'general badges')}
              ${badge(SD_ICONS.pencil, 'Critic',    '124,168,120', '$2', false, 'general badges')}
              ${badge(SD_ICONS.ticket, 'Front Row', '198,140,232', '$2', false, 'badges')}
              ${badge(SD_ICONS.crown,  'Patron',    '232,168,60',  '$3', false, 'badges')}
              ${badge(SD_ICONS.wave,   'Loud',      '92,186,178',  '$1', false, 'badges')}
              ${badge(SD_ICONS.mic,    'Encore',    '224,97,111',  '$2', false, 'badges')}
            </div>

            ${sec('Tags', 'the plain ones are already yours', 'general events')}
            <div class="shop-sheet shop-sheet--tags" data-cat="general events">
              ${(window.SD_TAGS || []).filter(t => t.price).map(tagRow).join('')}
            </div>

            <p class="shop-note">Prototype storefront — nothing is charged and nothing is kept.</p>
            <p class="shop-note">Prototype storefront — nothing is charged, no ticket is
              real, and nothing is kept.</p>
          </div>
        </div>
        ${nowBar()}
        ${bottomNav('shop')}
      </div>`;
}

function bottomNav(active = 'home') {
  const on = id => active === id ? ' active' : '';
  /* THE FLOATING GLASS CONSOLE — back, by decision (2026-09-03). A wide rounded
     bar with a raised centre hump (the now-playing ticker sits in it) and FIVE
     buttons in the lower bar: Home · Trending · SHOP · Playlists · Profile.
     Floats centred, 14px off the bottom, over the content.
     ⚠️ It was DOCKED from 2026-08-20 to 2026-09-03: full-bleed, with a scoop cut
     from its bottom edge that cradled the pet and then the shop button, and a
     plateau that GREW into a CD console. Eric brought the bubble back, asked
     for the shop as a plain nav icon, and for the console to go. So: no
     siblings (the fade, the blur, the nest, the emboss, the scene), no gap, no
     scoop. `sdScene` / `sdShopBtn` are no longer emitted by anything; the pet
     engine behind SD_PET_ENABLED is untouched.
     ⚠️ THE CD CONSOLE STAYS — it is the same principle on this bar: the hump is
     a plateau too, and a CD tap grows it (`.s-home-v3--console`) into the
     album + services panel. Two contours, as before: the short one and a tall
     one with the hump's walls extended 110 units, swapped by state.
     ⚠️ The shop's glyph is the dot-language bag (SD_ICONS.bag), filled with
     currentColor like the other four, so it lights and dims with them. */
  return `
          <nav class="v3-bottom-nav">
            <div class="v3-nav-glass" aria-hidden="true"></div>
            <svg class="v3-nav-shape" viewBox="0 0 553 126" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M517.5 125H35.5C16.17 125 0.5 109.33 0.5 90V79.7942C0.5 60.4642 16.17 44.7942 35.5 44.7942L47.3137 44.7942C58.1862 44.7942 67 35.9803 67 25.1079C67 11.5173 78.0173 0.5 91.6079 0.5L460.892 0.500022C474.483 0.500023 485.5 11.5174 485.5 25.1079C485.5 35.9804 494.314 44.7942 505.186 44.7942H517.5C536.83 44.7942 552.5 60.4642 552.5 79.7942V90C552.5 109.33 536.83 125 517.5 125Z"/></svg>
            <!-- The same contour with the hump grown 110 units, for the console
                 state. A SECOND svg rather than a class on the first, because
                 the viewBox changes with it and viewBox cannot be set from CSS.
                 Both are preserveAspectRatio=none and the nav's aspect-ratio
                 switches with the state, so whichever is showing always matches
                 its own box. The hump's fillets are untouched; straight walls
                 are inserted at x=67 and x=485.5, where the tangent is already
                 vertical. Change one contour and change the other, plus the two
                 masks in app.css. -->
            <svg class="v3-nav-shape v3-nav-shape--tall" viewBox="0 0 553 236" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M517.5 235H35.5C16.17 235 0.5 219.33 0.5 200V189.7942C0.5 170.4642 16.17 154.7942 35.5 154.7942L47.3137 154.7942C58.1862 154.7942 67 145.9803 67 135.1079L67 25.1079C67 11.5173 78.0173 0.5 91.6079 0.5L460.892 0.5C474.483 0.5 485.5 11.5174 485.5 25.1079L485.5 135.1079C485.5 145.9804 494.314 154.7942 505.186 154.7942H517.5C536.83 154.7942 552.5 170.4642 552.5 189.7942V200C552.5 219.33 536.83 235 517.5 235Z"/></svg>
            <!-- And a THIRD contour, the hump grown 700 units, for the friends
                 panel (.s-home-v3--friends): same construction as the tall
                 one, walls only, fillets untouched. At the 393 frame that is
                 ~423px of nav, i.e. half the screen. Its mask is in app.css. -->
            <svg class="v3-nav-shape v3-nav-shape--friends" viewBox="0 0 553 826" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M517.5 825H35.5C16.17 825 0.5 809.33 0.5 790V779.7942C0.5 760.4642 16.17 744.7942 35.5 744.7942L47.3137 744.7942C58.1862 744.7942 67 735.9803 67 725.1079L67 25.1079C67 11.5173 78.0173 0.5 91.6079 0.5L460.892 0.5C474.483 0.5 485.5 11.5174 485.5 25.1079L485.5 725.1079C485.5 735.9804 494.314 744.7942 505.186 744.7942H517.5C536.83 744.7942 552.5 760.4642 552.5 779.7942V790C552.5 809.33 536.83 825 517.5 825Z"/></svg>
            <div class="v3-nav-items">
              <button class="v3-nav-item${on('home')}" onclick="navigate('home')" title="Home"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/></svg></button>
              <button class="v3-nav-item${on('wall')}" onclick="navigate('wall')" title="Trending"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="2.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="16.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="2.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="16.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="2.5" y="16.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="16.5" width="5" height="5" rx="1.2"/><rect x="16.5" y="16.5" width="5" height="5" rx="1.2"/></svg></button>
              <button class="v3-nav-item v3-nav-item--shop${on('shop')}" onclick="navigate('shop')" title="Shop" aria-label="Shop">${SD_ICONS.bag}</button>
              <button class="v3-nav-item${on('playlists')}" onclick="navigate('playlists')" title="Playlists"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg></button>
              <button class="v3-nav-item${on('profile')}" onclick="navigate('profile')" title="Profile"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
            </div>
            <!-- The CD console. WARNING: it lives INSIDE the nav, not beside it.
                 It was a sibling positioned in px from the screen bottom, and the
                 nav is aspect-ratio driven — its height follows the frame width —
                 so the two drifted apart the moment the viewer scaled the phone
                 and the panel floated out of the plateau it is meant to sit in.
                 As a child it can be placed as a % of the nav's own box, which is
                 the only thing that tracks the plateau at every size. -->
            <div class="v3-console" aria-hidden="true">
              <!-- ONE line: art, album, year, artist. WARNING: no close
                   button. It closes on the next thing you do -- a scroll, a
                   touch on the bento, or the CD again -- so a persistent x was
                   a control for something that already puts itself away, and it
                   cost the line the width it needs to read as one sentence. -->
              <div class="v3-nc-row">
                <span class="v3-nc-art" aria-hidden="true"></span>
                <span class="v3-nc-line">
                  <span class="v3-nc-alb"></span>
                  <span class="v3-nc-yr"></span>
                  <span class="v3-nc-artist"></span>
                </span>
              </div>
              <div class="v3-nc-svcs">${SD_SERVICES.map(sv => `
                <button class="v3-nc-svc" type="button" data-svc="${sv.id}" title="Open in ${sv.name}" aria-label="Open in ${sv.name}"
                        onclick="event.stopPropagation(); consoleGo(this, '${sv.id}')">
                  ${svcMarkHtml(sv, 'v3-nc-ico')}
                </button>`).join('')}</div>
            </div>
            <!-- FRIENDS LISTENING NOW — what a tap on the ticker opens (it used
                 to jump straight to whoever was on the bar). Same principle as
                 the console: the hump grows, this time to half the screen, and
                 the list stands in it. A row opens that friend's profile. The
                 chevron at the top puts it away; so does a scroll, or a touch
                 anywhere outside it (openFriends / closeFriends in app.js). -->
            <div class="v3-friends" aria-hidden="true">
              <button class="v3-fr-close" type="button" title="Close" aria-label="Close"
                      onclick="event.stopPropagation(); closeFriends(this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>
              <div class="v3-fr-hd">Friends listening now</div>
              <div class="v3-fr-list"></div>
            </div>
          </nav>`;
}
