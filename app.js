// ============================================================
//  APP.JS — Viewer (desktop) + Prototype (mobile) + Variants
// ============================================================

const SVG_SIGNAL = `<svg viewBox="0 0 17 12" width="17" height="12" fill="currentColor"><rect x="0" y="9" width="3" height="3" rx="1"/><rect x="4.5" y="6" width="3" height="6" rx="1"/><rect x="9" y="3" width="3" height="9" rx="1"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>`;
const SVG_WIFI   = `<svg viewBox="0 0 16 12" width="16" height="12" fill="none" stroke="currentColor" stroke-linecap="round"><circle cx="8" cy="11" r="1.2" fill="currentColor" stroke="none"/><path d="M5.2 8.2 Q8 6 10.8 8.2" stroke-width="1.4"/><path d="M2.5 5.5 Q8 1.5 13.5 5.5" stroke-width="1.4"/></svg>`;
const SVG_BATTERY= `<svg viewBox="0 0 25 12" width="25" height="12" fill="currentColor"><rect x="0" y="1.5" width="21" height="9" rx="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="22" y="4" width="2.5" height="4" rx="1"/><rect x="2" y="3.5" width="15" height="5" rx="1.5"/></svg>`;

// ── State ─────────────────────────────────────────────────────
let currentIdx   = 2;
let viewMode     = 'single';
let isMobile     = false;
let navHistory   = [];
let variantState = { home: 0 };      // v3.0 dark, index 0 after filter
let _dragActive  = false;

// ── Helpers ───────────────────────────────────────────────────
function currentScreen()  { return SCREENS[currentIdx]; }
function getVariantIdx(s) { return variantState[s.id] || 0; }
function getVariant(s)    { const i = getVariantIdx(s); return s.variants[Math.min(i, s.variants.length-1)]; }

// ── Init ─────────────────────────────────────────────────────
// ── Fillet PNG masks ──────────────────────────────────────────
let filletBLUrl = null, filletTLUrl = null;

function stripWhite(src) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < d.data.length; i += 4) {
        if (d.data[i] > 200 && d.data[i+1] > 200 && d.data[i+2] > 200) d.data[i+3] = 0;
      }
      ctx.putImageData(d, 0, 0);
      res(c.toDataURL());
    };
    img.onerror = () => res(null);
    img.src = src;
  });
}

async function initFillets() {
  try {
    [filletBLUrl, filletTLUrl] = await Promise.all([
      stripWhite('images/topbox.png'),
      stripWhite('images/bottombox.png'),
    ]);
    applyFilletMasks();
  } catch(e) {}
}

function applyFilletMasks() {
  if (!filletBLUrl || !filletTLUrl) return;
  let styleEl = document.getElementById('v3-fillet-mask-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'v3-fillet-mask-style';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    .v3-fillet-bl::after {
      -webkit-mask-image: url(${filletBLUrl});
      mask-image: url(${filletBLUrl});
    }
    .v3-fillet-tl::after {
      -webkit-mask-image: url(${filletTLUrl});
      mask-image: url(${filletTLUrl});
    }
  `;
}

function init() {
  // Show only v3.x home variants (v1/v2 retired)
  const homeScreen = SCREENS.find(s => s.id === 'home');
  if (homeScreen) {
    homeScreen.variants = homeScreen.variants.filter(
      v => v.version && v.version >= 'v3.0'
    );
  }

  isMobile = window.matchMedia('(max-width: 767px)').matches;

  const params = new URLSearchParams(window.location.search);
  const p = params.get('screen');
  if (p) { const i = SCREENS.findIndex(s => s.id === p); if (i !== -1) currentIdx = i; }

  if (isMobile) { initMobile(); } else { initViewer(); }
  initFillets();
  // After the first render: fills the persona switcher and, if one was in use
  // last visit, swaps the catalogue over to it (which re-renders).
  initPersonas();
  if (!isMobile) { initDevBox(); initRecBox(); }
}

// ============================================================
//  DESKTOP VIEWER
// ============================================================
function initViewer() {
  renderViewer();
  bindViewerEvents();
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  navigatePrev();
    if (e.key === 'ArrowRight') navigateNext();
  });
  /* ⚠️ Must be renderViewer, NOT renderSingle. renderSingle only rebuilds the
     phones from their static templates — every screen comes back with the
     placeholder cover baked into the markup and no data. Calling it alone left
     the album art stuck on `images/album-crystalcastles1.png` and `_albumIdx`
     undefined, which looked exactly like the colour extraction being broken. */
  window.addEventListener('resize', debounce(() => {
    if (viewMode === 'single') renderViewer();
  }, 100));
}

function renderViewer() {
  if (viewMode === 'single') renderSingle();
  else                        renderMulti();
  renderThumbs();
  updateToolbar();
  // renderSingle/renderMulti rebuild the screens from scratch, so the active
  // persona's class has to be stamped back on before anything paints.
  if (typeof applyPersonaClass === 'function') applyPersonaClass();
  requestAnimationFrame(paintAfterRender);
}

/* Everything that has to run against the freshly-built screens. Kept separate
   so any path that rebuilds the DOM can re-run it — a rebuild without this is
   a screen full of placeholder markup. */
function paintAfterRender() {
  document.querySelectorAll('.s-home-v3').forEach(el => populateHomeData(el));
  document.querySelectorAll('.s-onboarding').forEach(obInit);
  applyFilletMasks();
  initScenes();   // the nav scoop's face — repainted whenever the shells are rebuilt
}

// ── Home screen data population ───────────────────────────────
function reloadCD(cdEl, newUrl) {
  cdEl.style.transition = 'top 0.14s ease-in';
  cdEl.style.top = '62%';
  setTimeout(() => {
    cdEl.style.backgroundImage = `url('${newUrl}')`;
    cdEl.style.transition = 'top 0.22s cubic-bezier(0.34,1.28,0.64,1)';
    cdEl.style.top = '87.62%';
    setTimeout(() => { cdEl.style.top = ''; cdEl.style.transition = ''; }, 230);
  }, 150);
}

function slideIn(el, newUrl, reverse) {
  // Left-hand layout is mirrored, so images travel left→right instead of right→left.
  // `reverse` flips it again for backward navigation (swiping to a previous album).
  let flip = !!el.closest('.s-home-v3--left');
  if (reverse) flip = !flip;
  const enterFrom = flip ? '-100%' : '100%';
  const oldExit   = flip ? '28%'   : '-28%';
  const old = document.createElement('div');
  old.style.cssText = `position:absolute;inset:0;background:${el.style.backgroundImage} center/cover no-repeat;z-index:1;transform:translateX(0);will-change:transform;transition:transform 0.42s cubic-bezier(0.4,0,0.2,1)`;
  const next = document.createElement('div');
  next.style.cssText = `position:absolute;inset:0;background:url('${newUrl}') center/cover no-repeat;z-index:2;transform:translateX(${enterFrom});will-change:transform;transition:transform 0.42s cubic-bezier(0.4,0,0.2,1)`;
  el.appendChild(old);
  el.appendChild(next);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    old.style.transform = `translateX(${oldExit})`;
    next.style.transform = 'translateX(0)';
    next.addEventListener('transitionend', () => {
      el.style.backgroundImage = `url('${newUrl}')`;
      old.remove();
      next.remove();
    }, { once: true });
  }));
}

function typewrite(el, text, speed = 16) {
  el.textContent = '';
  if (!text) return;
  let i = 0;
  const tick = () => {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, speed);
  };
  setTimeout(tick, speed);
}

function setMainAlbum(screenEl, album, animate = false, animateText = animate) {
  screenEl._album = album;   // track the album currently shown in the bento
  const albumEl = screenEl.querySelector('.v3-album');
  if (albumEl) {
    if (animate) slideIn(albumEl, album.image);
    else albumEl.style.backgroundImage = `url('${album.image}')`;
    albumEl.onclick = (e) => {
      if (albumEl._swiped) { if (e) e.stopPropagation(); return; }  // a swipe, not a tap
      if (e) e.stopPropagation();   // don't let the tap bubble and undo the fullscreen state
      window.activeAlbum = album;
      enterAlbumPage(screenEl);   // tap the hero → straight to the album page
    };
  }
  const cdEl = screenEl.querySelector('.v3-cd');
  if (cdEl) {
    if (animate) reloadCD(cdEl, album.image);
    else cdEl.style.backgroundImage = `url('${album.image}')`;
  }

  const infoRow = screenEl.querySelector('.v3-blue-info-row');
  if (infoRow && album.artist && album.album) {
    const combined = album.artist.length + album.album.length;
    const wdth = combined <= 22 ? 100 : combined <= 30 ? 88 : combined <= 38 ? 76 : combined <= 46 ? 64 : 52;
    infoRow.style.fontVariationSettings = `'wdth' ${wdth}`;
  }
  const artistEl = screenEl.querySelector('.v3-blue-artist');
  const albumNameEl = screenEl.querySelector('.v3-blue-album');
  if (animateText) {
    if (artistEl) typewrite(artistEl, album.artist, 16);
    if (albumNameEl) typewrite(albumNameEl, album.album, 14);
  } else {
    if (artistEl) artistEl.textContent = album.artist;
    if (albumNameEl) albumNameEl.textContent = album.album;
  }
  // Release year — inline after the artist (bento) / beside the album (fullscreen)
  screenEl.querySelectorAll('.v3-blue-date').forEach(el => { el.textContent = album.year || ''; });

  // On the album page, a 2-line album title needs the CTA pushed down a line
  if (albumNameEl && screenEl.classList.contains('s-home-v3--review')) {
    albumNameEl.textContent = album.album;                 // full text for a sync measure
    // .v3-blue-album is display:inline in review — its bounding box spans all line boxes,
    // so height > 1.5 lines means the title wrapped to two lines (offsetHeight would lie).
    const lh2 = parseFloat(getComputedStyle(albumNameEl).lineHeight) || 20;
    screenEl.classList.toggle('v3-rev-title-2line', albumNameEl.getBoundingClientRect().height > lh2 * 1.5);
    if (animateText) albumNameEl.textContent = '';         // let the typewrite refill from empty
  }

  const starsRow = screenEl.querySelector('.v3-blue-stars-row');
  if (starsRow) {
    const html = `<span class="v3-blue-score">${album.rating.toFixed(1)}</span>${halfStars(album.rating, 14)}<span class="v3-blue-count">${window.fmtRc(album.reviewCount)} reviews</span>`;
    if (animateText) {
      starsRow.style.cssText += ';transition:opacity 0.18s;opacity:0';
      setTimeout(() => { starsRow.innerHTML = html; starsRow.style.opacity = '1'; }, 200);
    } else {
      starsRow.innerHTML = html;
    }
    starsRow.parentElement.onclick = (e) => {
      e.stopPropagation();
      window.activeAlbum = album;
      enterAlbumPage(screenEl);
    };
  }

  const quoteTextEl = screenEl.querySelector('.v3-blue-quote-text');
  if (quoteTextEl) {
    const quoteContainer = quoteTextEl.parentElement;
    quoteContainer.classList.remove('v3-blue-quote--scroll');
    quoteTextEl.style.removeProperty('--quote-scroll');
    if (album.reviews && album.reviews.length) {
      const text = `"${album.reviews[0].text}"`;
      if (animateText) {
        typewrite(quoteTextEl, text, 11);
        setTimeout(() => {
          if (quoteTextEl.scrollWidth > quoteContainer.offsetWidth) {
            const overflow = quoteTextEl.scrollWidth - quoteContainer.offsetWidth;
            quoteTextEl.style.setProperty('--quote-scroll', `-${overflow}px`);
            quoteContainer.classList.add('v3-blue-quote--scroll');
          }
        }, text.length * 11 + 80);
      } else {
        quoteTextEl.textContent = text;
        requestAnimationFrame(() => {
          if (quoteTextEl.scrollWidth > quoteContainer.offsetWidth) {
            const overflow = quoteTextEl.scrollWidth - quoteContainer.offsetWidth;
            quoteTextEl.style.setProperty('--quote-scroll', `-${overflow}px`);
            quoteContainer.classList.add('v3-blue-quote--scroll');
          }
        });
      }
    }
  }

  applyAlbumColorsUrl(screenEl, album.image);
  loadPreview(album);

  // If we're in fullscreen review mode, refresh reviews for the new album
  if (screenEl.classList.contains('s-home-v3--review')) populateReviewPanel(screenEl);
}

// ── Fullscreen review mode ────────────────────────────────────
// ══════════════════════════════════════════════════════════════
//  BACK-NAVIGATION HISTORY
//  A single global stack of view snapshots. Every forward transition pushes the view it
//  leaves; Back pops one and restores it atomically (no flashing through in-between states).
//  A snapshot is either a home-shell state {review,album,artist,albumRef} or {screenId}.
// ══════════════════════════════════════════════════════════════
let backStack = [];

function homeShells() {
  // the home-shell instances currently in the DOM (dark + light on desktop; one on mobile)
  return [...document.querySelectorAll('.s-home-v3')].filter(el => el.querySelector('.v3-album'));
}
// Capture the current PLAIN screen plus any sub-state needed to restore it faithfully
// (a profile's exact persona, the open playlist) — so Back returns you to the same view,
// not a freshly-randomised one.
function captureScreenSnap() {
  const id = currentScreen().id;
  const snap = { review: false, screenId: id };
  if (id === 'profile')  snap.profile  = { ...window.PROFILE };
  if (id === 'playlist') snap.playlist = window.activePlaylist;
  return snap;
}
function snapView(scr) {
  if (scr && scr.classList.contains('s-home-v3--review')) {
    return {
      review: true,
      album:  scr.classList.contains('s-home-v3--album'),
      artist: scr.classList.contains('s-home-v3--artist'),
      albumRef: scr._album,
    };
  }
  return captureScreenSnap();   // bento home, or a plain screen (profile / playlist / …)
}
// The current view, whether a fullscreen home shell or a plain screen.
function captureLocation() { return snapView(homeShells()[0]); }
function pushBack() { backStack.push(captureLocation()); }
function measure2Line(scr) {
  const alb = scr.querySelector('.v3-blue-album');
  if (!alb) return;
  alb.style.transition = 'none'; alb.style.fontSize = '18px';
  const lh = parseFloat(getComputedStyle(alb).lineHeight) || 20;
  scr.classList.toggle('v3-rev-title-2line', alb.getBoundingClientRect().height > lh * 1.5);
  alb.style.transition = ''; alb.style.fontSize = '';
}
// Drop straight into the album page for `album`, all classes set at once (no review flash).
function enterAlbumPageState(scr, album) {
  setMainAlbum(scr, album, false);
  scr.classList.remove('s-home-v3--artist');
  scr.classList.add('s-home-v3--review', 's-home-v3--album');
  populateReviewPanel(scr);
  measure2Line(scr);
  const body = scr.querySelector('.v3-body'); if (body) body.scrollTop = 0;
}
// Restore an arbitrary home-shell snapshot in one shot.
function applyShellState(scr, snap) {
  if (snap.albumRef) setMainAlbum(scr, snap.albumRef, false);   // restores cover/name (undoes artist)
  scr.classList.toggle('s-home-v3--review', !!snap.review);
  scr.classList.toggle('s-home-v3--album',  !!snap.album);
  scr.classList.toggle('s-home-v3--artist', !!snap.artist);
  scr.classList.remove('v3-rev-title-2line');
  if (snap.review) {
    populateReviewPanel(scr);
    if (snap.artist) populateArtistPage(scr);
    else measure2Line(scr);
  }
  const body = scr.querySelector('.v3-body'); if (body) body.scrollTop = 0;
}
window.goBack = function (fallbackId) {
  const snap = backStack.pop();
  const shells = homeShells();
  if (!snap) {                                                         // nothing recorded
    if (fallbackId) { navigate(fallbackId, 'back'); return; }         // caller's default (e.g. Library)
    shells.forEach(s => exitToBento(s)); return;                       // else the bento home
  }
  if (snap.review) { shells.forEach(s => applyShellState(s, snap)); return; }   // an earlier shell state
  // A plain-screen snapshot — restore its sub-state, then go there WITHOUT re-randomising.
  if (snap.profile)  Object.assign(window.PROFILE, snap.profile);
  if (snap.playlist) window.activePlaylist = snap.playlist;
  if (snap.screenId && snap.screenId !== currentScreen().id) {        // a different screen
    navigate(snap.screenId, 'back');
    return;
  }
  shells.forEach(s => exitToBento(s));                                  // back to the bento home
};

// ── Bento → album page ────────────────────────────────────────
// There used to be a plain fullscreen "review" state in between: tapping the
// bento opened it, and tapping the album title *inside* it stepped up to the
// album page. That middle layer is gone. The album page is swipeable in its own
// right, so the review state was a whole extra level of navigation that showed
// nearly the same thing (plus the For You box) — going straight there is the
// same screen one tap sooner.
//
// ⚠️ `--review` is therefore never set without `--album`. The class pair is kept
// because the CSS is tuned for the combination, but there is no longer any way
// to reach `--review` alone, and `.s-home-v3--review:not(.s-home-v3--album)`
// styles nothing.
window.enterAlbumPage = function (scr) {
  if (!scr) return;
  if (scr.classList.contains('s-home-v3--review')) return;   // already fullscreen
  pushBack();                                                // record the bento before entering
  const album = scr.querySelector('.v3-blue-album');
  const albumText = album ? album.textContent : '';

  // 1. Album fades out of the (small, inline) line it currently shares with the artist
  if (album) album.style.opacity = '0';

  // 2. After the fade, expand fullscreen: flood + artist grows + title stacks (CSS)
  setTimeout(() => {
    scr.classList.add('s-home-v3--review', 's-home-v3--album');
    populateReviewPanel(scr);
    const body = scr.querySelector('.v3-body');
    if (body) body.scrollTop = 0;
    // 3. Album typewrites back in below the artist, at the larger 18px size
    if (album) {
      album.style.opacity = '1';
      album.textContent = albumText;
      // The review font-size (18px) is still mid-transition here, so force it (no tween) to
      // measure wrapping at the FINAL size. An inline element's bounding box spans all its
      // line boxes, so height > 1.5 lines ⇒ the title wrapped to two lines.
      album.style.transition = 'none';
      album.style.fontSize = '18px';
      const lh2 = parseFloat(getComputedStyle(album).lineHeight) || 20;
      scr.classList.toggle('v3-rev-title-2line', album.getBoundingClientRect().height > lh2 * 1.5);
      album.style.transition = '';
      album.style.fontSize = '';
      typewrite(album, albumText, 24);
    }
  }, 170);
};
// `onAlbumTitle` is gone with the review state — the album title no longer has
// a step to take you up to. The title span simply lets its tap bubble to
// `.v3-blue`, which opens the album page like the rest of the box.
window.onAlbumArt = function (el) {
  const scr = el && el.closest('.s-home-v3');
  if (!scr || scr.classList.contains('s-home-v3--review')) return;   // in-shell handled by setMainAlbum's tap
  navigate('album');
};

// ── Artist page — an --artist variation of the album page: banner instead of the
//    square cover, no CD / tracklist, artist + genre text, and a grid of albums below.
const ARTIST_IMG = {
  'Crystal Castles': 'images/artist-crystalcastles.jpg',
  'Phoebe Bridgers': 'images/artist-phoebe.jpg',
  '100 gecs': 'images/artist-100gecs.jpg',
  'Carpenter Brut': 'images/artist-carpenterbrut.jpg',
};
window.onArtistName = function (el) {
  const scr = el && el.closest('.s-home-v3');
  if (!scr) return;
  pushBack();   // record the current view (review or album page) before the artist page
  homeShells().forEach(s => {
    s.classList.add('s-home-v3--review', 's-home-v3--album', 's-home-v3--artist');
    populateReviewPanel(s);
    populateArtistPage(s);
    const body = s.querySelector('.v3-body'); if (body) body.scrollTop = 0;
  });
};
function populateArtistPage(scr) {
  const a = scr._album || window.activeAlbum || window.featuredAlbum;
  if (!a) return;
  const banner = ARTIST_IMG[a.artist] || a.image;
  const albumEl = scr.querySelector('.v3-album');
  if (albumEl) albumEl.style.backgroundImage = `url('${banner}')`;
  const nameEl = scr.querySelector('.v3-blue-album');     // now the artist name
  if (nameEl) nameEl.textContent = a.artist;
  const genreEl = scr.querySelector('.v3-blue-artist');   // now the genre
  if (genreEl) genreEl.textContent = a.genre || '';
  const box = scr.querySelector('.v3-artist-albums');
  if (box) box.innerHTML = artistAlbumsHtml(a);
}

/* The artist's albums — replaces the rating histogram (an artist has no single
   score). Two views of the same cells: a horizontal rail or the trending grid.
   ARTIST_ALBUM_VIEW is module-global so both the dark and light instances agree
   and the choice survives a re-render. */
let ARTIST_ALBUM_VIEW = 'grid';

function artistAlbumsFor(a) {
  const arch = window.ARCHIVE || [];
  let albums = arch.filter(x => x.artist === a.artist);
  // The archive holds one album per artist, so pad with the rest of the shelf —
  // a one-cell "discography" reads as a bug rather than as a short catalogue.
  if (albums.length < 3) albums = albums.concat(arch.filter(x => x.artist !== a.artist)).slice(0, 6);
  return albums;
}

function artistAlbumsHtml(a) {
  const albums = artistAlbumsFor(a);
  const row = ARTIST_ALBUM_VIEW === 'row';
  const cells = albums.map(al => `
      <div class="wall2-cell" onclick="event.stopPropagation(); openAlbumPage(ARCHIVE.find(x=>x.album==='${al.album.replace(/'/g, "\\'")}')||ARCHIVE[0])">
        <div class="wall2-art" style="background-image:url('${al.image}')"></div>
        <div class="wall2-meta"><span class="wall2-album">${al.album}</span><span class="wall2-artist">${al.artist}</span></div>
        <div class="wall2-rating">${halfStars(al.rating, 11)}<span class="wall2-score">${al.rating.toFixed(1)}</span></div>
      </div>`).join('');
  const icoRow  = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="7" width="5.5" height="10" rx="1.4"/><rect x="9.25" y="7" width="5.5" height="10" rx="1.4"/><rect x="16.5" y="7" width="5.5" height="10" rx="1.4"/></svg>`;
  const icoGrid = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.6"/><rect x="13" y="3" width="8" height="8" rx="1.6"/><rect x="3" y="13" width="8" height="8" rx="1.6"/><rect x="13" y="13" width="8" height="8" rx="1.6"/></svg>`;
  return `
      <div class="v3-aa-hd">
        <span class="v3-aa-title">Albums</span>
        <span class="v3-aa-n">${albums.length}</span>
        <div class="v3-aa-seg">
          <button class="${row ? 'active' : ''}" title="Row" onclick="event.stopPropagation(); setArtistAlbumView('row')">${icoRow}</button>
          <button class="${row ? '' : 'active'}" title="Grid" onclick="event.stopPropagation(); setArtistAlbumView('grid')">${icoGrid}</button>
        </div>
      </div>
      <div class="${row ? 'v3-aa-row' : 'wall2-grid'}">${cells}</div>
      <div class="v3-aa-hd v3-aa-hd--rev"><span class="v3-aa-title">Popular reviews</span></div>`;
}

// Both home shells hold an artist page, so repaint every one of them — a
// document-wide toggle that only redrew the clicked copy would leave the
// dark/light pair disagreeing (same rule as plTab / ntfTab).
window.setArtistAlbumView = function (mode) {
  ARTIST_ALBUM_VIEW = mode;
  homeShells().forEach(s => {
    if (!s.classList.contains('s-home-v3--artist')) return;
    const a = s._album || window.activeAlbum || window.featuredAlbum;
    const box = s.querySelector('.v3-artist-albums');
    if (a && box) box.innerHTML = artistAlbumsHtml(a);
  });
};

// Album / artist page → back to the bento home.
window.exitToBento = function (scr) {
  if (!scr) return;
  // Freeze the For You box's geometry transition on the way back to the bento —
  // it should already be sitting in its spot, not slide into it (same trick as toggleHand).
  // (The For You box is hidden on the album page, so this is the transition it
  // makes on the way *in* to view, not out.)
  scr.classList.add('v3-hand-swapping');
  requestAnimationFrame(() => requestAnimationFrame(() => scr.classList.remove('v3-hand-swapping')));
  scr.classList.remove('s-home-v3--review');
  scr.classList.remove('s-home-v3--album');
  scr.classList.remove('s-home-v3--artist');
  scr.classList.remove('v3-rev-title-2line');
  // Restore the album name in full (in case Back was hit mid-typewriter) + reset fade
  const album = scr.querySelector('.v3-blue-album');
  if (album) {
    album.style.opacity = '1';
    if (scr._album) album.textContent = scr._album.album;
  }
  const body = scr.querySelector('.v3-body');
  if (body) body.scrollTop = 0;
};
// Trending page — Genres / time-range filter panels (in-flow so they don't clip in the scroller).
function closeWallMenus(scr) {
  scr.querySelectorAll('.wall2-menu').forEach(m => (m.hidden = true));
  scr.querySelectorAll('.wall2-drop-btn').forEach(b => b.classList.remove('open'));
}
window.toggleWallPanel = function (btn) {
  const scr = btn.closest('.app-screen');
  if (!scr) return;
  const wrap = btn.closest('.wall2-menuwrap');
  const menu = wrap && wrap.querySelector('.wall2-menu');
  const wasOpen = menu && !menu.hidden;
  closeWallMenus(scr);
  if (menu && !wasOpen) { menu.hidden = false; btn.classList.add('open'); }
};
window.pickWallGenre = function (el) {
  const menu = el.closest('.wall2-menu');
  if (menu) menu.querySelectorAll('.wall2-menu-item').forEach(g => g.classList.remove('active'));
  el.classList.add('active');
  closeWallMenus(el.closest('.app-screen'));
};
window.pickWallTime = function (el) {
  const scr = el.closest('.app-screen');
  const menu = el.closest('.wall2-menu');
  if (menu) menu.querySelectorAll('.wall2-menu-item').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  const lbl = scr.querySelector('.wall2-time-label');
  if (lbl) lbl.textContent = el.textContent.replace(/^(This |Past )/, '');
  closeWallMenus(scr);
};

/* ── Notifications (s-ntf) ──────────────────────────────────────
   Every handler scopes to the clicked `.app-screen` — the viewer shows the
   dark and light variants side by side, so a document-wide query would
   drive both copies at once. */

// Filter pills. Rows carry data-tab; a time-bucket group hides itself when
// all of its rows filter out, and the empty state shows if nothing is left.
// CURRENTLY UNUSED — the pill row was removed from the page (the rows still
// carry data-tab, so re-adding a `.ntf-bar` of pills brings this straight back).
window.ntfTab = function (btn, tab) {
  const scr = btn.closest('.app-screen');
  if (!scr) return;
  scr.querySelectorAll('.ntf-bar .wall2-cat').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  let shown = 0;
  scr.querySelectorAll('.ntf-row').forEach(r => {
    r.hidden = tab !== 'all' && r.dataset.tab !== tab;
    if (!r.hidden) shown++;
  });
  scr.querySelectorAll('.ntf-group').forEach(g => {
    g.hidden = !g.querySelector('.ntf-row:not([hidden])');
  });
  const empty = scr.querySelector('.ntf-empty');
  if (empty) empty.hidden = shown > 0;
};

// "Mark all read" — drops the unread treatment and the header count chip.
window.ntfMarkAll = function (btn) {
  const scr = btn.closest('.app-screen');
  if (!scr) return;
  scr.querySelectorAll('.ntf-row--new').forEach(r => r.classList.remove('ntf-row--new'));
  const chip = scr.querySelector('.ntf-count');
  if (chip) chip.remove();
  btn.disabled = true;
};

// Follow back from a follow notification.
window.ntfFollowBack = function (btn) {
  const on = btn.classList.toggle('is-on');
  btn.textContent = on ? 'Following' : 'Follow';
};

/* ── Settings (s-set) ───────────────────────────────────────── */

// Switch row.
window.sdToggle = function (btn) {
  const on = btn.classList.toggle('is-on');
  btn.setAttribute('aria-checked', String(on));
};

// Segmented picker (Theme) — active moves within its own group.
window.sdSeg = function (btn) {
  const seg = btn.closest('.set-seg');
  if (!seg) return;
  seg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
};

// Connected-service row — flips the trailing pill between the two states.
window.sdConnect = function (row) {
  const pill = row.querySelector('.set-pill');
  if (!pill) return;
  // The pill alone carries the state; the sub-label stays the description of
  // what the service gives you, connected or not.
  const on = pill.classList.toggle('set-pill--on');
  pill.textContent = on ? 'Connected' : 'Connect';
};

// Playlists page — in-page tab switching (Lists / Artists / Albums / Songs / Genres).
window.plTab = function (btn, tab) {
  const scr = btn.closest('.app-screen');
  if (!scr) return;
  // Discover (outside the pill bar) acts as a tab too — clear/set active on both
  scr.querySelectorAll('.pl2-bar .wall2-cat, .pl2-discover').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  scr.querySelectorAll('.pl2-sec').forEach(s => { s.hidden = s.dataset.tab !== tab; });
};
// Open a playlist's page from the Lists tab. plLists() (screens.js) is the
// shared data source; the playlist screen's getter renders window.activePlaylist.
window.openPlaylistPage = function (name) {
  const pl = plLists().find(l => l.name === name);
  if (!pl) return;
  backStack.push(captureLocation());   // remember where we came from (profile / Library / …)
  window.activePlaylist = pl;
  navigate('playlist');
};
// Favorite the playlist — heart toggle; count follows, and the change is kept
// on activePlaylist so it survives a re-render of this screen.
window.togglePlFav = function (btn) {
  const on = btn.classList.toggle('on');
  const n = btn.querySelector('.plp-fav-n');
  const v = (parseInt(n && n.textContent, 10) || 0) + (on ? 1 : -1);
  if (n) n.textContent = v;
  if (window.activePlaylist) { window.activePlaylist.favs = v; window.activePlaylist.faved = on; }
};
/* The back pill used to grin — `plRingSmile` morphed its arrow dots into a
   smiley on every favourite and on an 11s timer. Gone: the nav's pet carries the
   app's personality now, so Back is purely a control. */

/* ============================================================
   NEW PLAYLIST — the creation page behind the Playlists "+"
   ------------------------------------------------------------
   Same multi-instance discipline as the onboarding wizard: ALL state lives in
   PLNEW, every action mutates it and then plnewSync() re-applies the whole
   thing to EVERY .s-plnew on the page. That matters because the desktop viewer
   renders the dark and light variants side by side — mutating only the clicked
   instance would leave the other one stale.

   Finished playlists land in PLNEW_CREATED, which plLists() (screens.js) spreads
   in at the FRONT of the library, so a new one shows up top of the Playlists tab
   and its detail page renders the real tracks you picked.
   ============================================================ */
window.PLNEW_CREATED = [];
// mode: 'search' (type to find anything) | 'library' (browse your own playlists)
// libOpen: the playlist name being browsed inside library mode, or null for the
// list of playlists. cover is a data: URL once the user uploads one.
const PLNEW = { name: '', cover: null, privacy: 'public', songs: [], q: '', mode: 'search', libOpen: null };
const PLNEW_FALLBACK_COVER = 'images/spindeck-appicon.png';

// Every song in the archive, flattened once — songsFor() is deterministic per
// album, so the pool is stable across renders and a row keeps its identity.
let _plnewPool = null;
function plnewPool() {
  if (_plnewPool) return _plnewPool;
  _plnewPool = [];
  (window.ARCHIVE || []).forEach(a => {
    (typeof songsFor === 'function' ? songsFor(a) : []).forEach(t => {
      _plnewPool.push({
        // Track number is part of the key on purpose: songsFor() picks titles
        // from a word list, so one album can end up with two tracks of the same
        // name. Keying on album+title alone would make them one row.
        key: a.album + '::' + t.n + '::' + t.title,
        title: t.title, dur: t.dur, rating: t.rating,
        album: a.album, artist: a.artist, image: a.image, genre: a.genre,
      });
    });
  });
  return _plnewPool;
}

window.openNewPlaylist = function () {
  PLNEW.name = ''; PLNEW.cover = null; PLNEW.privacy = 'public';
  PLNEW.songs = []; PLNEW.q = ''; PLNEW.mode = 'search'; PLNEW.libOpen = null;
  backStack.push(captureLocation());
  navigate('playlist-new');
};
window.plnewCancel = function () { goBack('playlists'); };

window.plnewSetName = function (v) { PLNEW.name = v;  plnewSync(); };
window.plnewSetPriv = function (p) { PLNEW.privacy = p; plnewSync(); };
// Typing switches back out of library mode — you're searching now.
window.plnewSearch  = function (q) { PLNEW.q = q; if (q.trim()) PLNEW.mode = 'search'; plnewSync(); };

// Cover is a real upload: the well is a <label> wrapping a file input, so the
// picker opens natively. The image is read to a data: URL and lives in PLNEW,
// which means it survives re-renders (the file input's own value does not).
window.plnewUpload = function (input) {
  const f = input && input.files && input.files[0];
  if (!f) return;
  const fr = new FileReader();
  fr.onload = () => { PLNEW.cover = fr.result; plnewSync(); };
  fr.readAsDataURL(f);
};

// ── "Add from library" — pull songs in from playlists you already have.
// (In this app the Playlists screen IS the library, hence the name.)
window.plnewToggleLib = function () {
  PLNEW.mode = PLNEW.mode === 'library' ? 'search' : 'library';
  PLNEW.libOpen = null;
  plnewSync();
};
window.plnewOpenList  = function (name) { PLNEW.libOpen = name; plnewSync(); };
window.plnewCloseList = function ()     { PLNEW.libOpen = null; plnewSync(); };
window.plnewAddAll = function (name) {
  const pl = plLists().find(l => l.name === name);
  if (!pl) return;
  const have = new Set(PLNEW.songs.map(s => s.key));
  plTracksFor(pl).forEach(t => { if (!have.has(t.key)) { PLNEW.songs.push(t); have.add(t.key); } });
  plnewSync();
};
window.plnewAddSong = function (key) {
  if (PLNEW.songs.some(s => s.key === key)) return;
  // The pool covers every archive track; a playlist row resolves there too,
  // since plTracksFor() builds its keys the same way.
  const t = plnewPool().find(s => s.key === key)
         || (PLNEW.libOpen ? plTracksFor(plLists().find(l => l.name === PLNEW.libOpen) || {}).find(s => s.key === key) : null);
  if (t) PLNEW.songs.push(t);
  plnewSync();
};
window.plnewRemoveSong = function (key) {
  PLNEW.songs = PLNEW.songs.filter(s => s.key !== key);
  plnewSync();
};

window.plnewCreate = function () {
  const name = PLNEW.name.trim();
  if (!name) return;                               // the button is disabled anyway
  const pl = {
    name,
    creator: 'you',
    tracks:  PLNEW.songs.length,
    favs: 0, plays: 0,
    edited: 'just now',
    // No upload? borrow the first track's album art, and only fall back to the
    // app mark if the playlist is empty too — so a card is never a broken image.
    image:  PLNEW.cover || (PLNEW.songs[0] && PLNEW.songs[0].image) || PLNEW_FALLBACK_COVER,
    private: PLNEW.privacy === 'private',
    songs:  PLNEW.songs.slice(),                   // the real picks, for the detail page
  };
  window.PLNEW_CREATED.unshift(pl);
  window.activePlaylist = pl;
  navigate('playlist');                            // straight into the thing you just made
};

/* The three list bodies. These are shared: playlistNewHtml() calls them so a
   FRESH render already paints the current PLNEW (the getter pattern the rest of
   the dynamic screens use), and plnewSync() calls them again to patch the live
   instances between renders without a full re-render — which would blow away
   the focus/caret of whatever field is being typed in. */
// The chosen list sits directly under the search, so songs stack up beneath it
// as you add them. Empty renders NOTHING (not an empty-state line) — the results
// hint below already says what to do, and a placeholder here would just push the
// results down for no reason.
window.plnewChosenHtml = function () {
  if (!PLNEW.songs.length) return '';
  return PLNEW.songs.map((t, i) => `
    <div class="plp-song plnew-row">
      <div class="plp-song-num">${i + 1}</div>
      <div class="plp-song-line"><span class="plp-song-title">${obEsc(t.title)}</span><span class="plp-song-album">${obEsc(t.album)}</span> · <span class="plp-song-artist">${obEsc(t.artist)}</span></div>
      <div class="plp-song-dur">${t.dur}</div>
      <button class="plnew-x" title="Remove" aria-label="Remove"
              onclick="plnewRemoveSong('${obOc(t.key)}')">×</button>
    </div>`).join('');
};

// One track row with an add / remove control, shared by search and library.
function plnewTrackRow(t, picked) {
  const has = picked.has(t.key);
  return `
    <div class="plp-song plnew-row plnew-res${has ? ' plnew-res--on' : ''}">
      <div class="plnew-res-art" style="background-image:url('${t.image}')"></div>
      <div class="plp-song-line"><span class="plp-song-title">${obEsc(t.title)}</span><span class="plp-song-album">${obEsc(t.album)}</span> · <span class="plp-song-artist">${obEsc(t.artist)}</span></div>
      <div class="plp-song-dur">${t.dur}</div>
      <button class="plnew-plus" title="${has ? 'Added' : 'Add to playlist'}" aria-label="Add"
              onclick="plnew${has ? 'RemoveSong' : 'AddSong'}('${obOc(t.key)}')">${has ? '✓' : '+'}</button>
    </div>`;
}

window.plnewResultsHtml = function () {
  const picked = new Set(PLNEW.songs.map(s => s.key));

  // ── library mode: your own playlists, then one opened to its tracks ──
  if (PLNEW.mode === 'library') {
    if (!PLNEW.libOpen) {
      const lists = plLists().filter(l => l.name !== PLNEW.name.trim());
      if (!lists.length) return `<div class="plnew-empty">No playlists to pull from yet.</div>`;
      return lists.map(l => `
        <button class="plnew-liblist" onclick="plnewOpenList('${obOc(l.name)}')">
          <span class="plnew-lib-art" style="background-image:url('${l.image}')"></span>
          <span class="plnew-lib-meta">
            <span class="plnew-lib-name">${obEsc(l.name)}</span>
            <span class="plnew-lib-sub">${l.tracks} songs · by ${obEsc(l.creator)}</span>
          </span>
          <span class="plnew-lib-chev">›</span>
        </button>`).join('');
    }
    const pl = plLists().find(l => l.name === PLNEW.libOpen);
    if (!pl) return `<div class="plnew-empty">That playlist is gone.</div>`;
    const tracks = plTracksFor(pl);
    const left = tracks.filter(t => !picked.has(t.key)).length;
    return `
      <div class="plnew-libhead">
        <button class="plnew-libback" onclick="plnewCloseList()" aria-label="Back to playlists">‹</button>
        <span class="plnew-libhead-t">${obEsc(pl.name)}</span>
        <button class="plnew-liball" onclick="plnewAddAll('${obOc(pl.name)}')" ${left ? '' : 'disabled'}>
          ${left ? `Add all · ${left}` : 'All added'}
        </button>
      </div>
      ${tracks.map(t => plnewTrackRow(t, picked)).join('')}`;
  }

  // ── search mode: nothing until you actually type ──
  const term = PLNEW.q.trim().toLowerCase();
  if (!term) {
    return `<div class="plnew-empty">Search for a song, album or artist — or pull one in from <b>Library</b>.</div>`;
  }
  const list = plnewPool().filter(t =>
    t.title.toLowerCase().includes(term) ||
    t.album.toLowerCase().includes(term) ||
    t.artist.toLowerCase().includes(term)).slice(0, 40);
  if (!list.length) return `<div class="plnew-empty">Nothing matches “${obEsc(PLNEW.q)}”.</div>`;
  return list.map(t => plnewTrackRow(t, picked)).join('');
};

window.plnewCountLabel  = function () { const n = PLNEW.songs.length; return n === 1 ? '1 song' : `${n} songs`; };
window.plnewCreateLabel = function () {
  const n = PLNEW.songs.length;
  return n ? `Create playlist · ${n} song${n === 1 ? '' : 's'}` : 'Create playlist';
};

// Patch every live .s-plnew after an edit. The screen's own getter already
// paints the initial state, so this only has to keep the two side-by-side
// variants agreeing once the user starts interacting.
function plnewSync() { document.querySelectorAll('.s-plnew').forEach(plnewSyncOne); }

function plnewSyncOne(root) {
  const q = sel => root.querySelector(`[data-plnew="${sel}"]`);
  const cover = PLNEW.cover;

  const coverEl = q('cover');
  if (coverEl) {
    coverEl.style.backgroundImage = cover ? `url('${cover}')` : '';
    coverEl.classList.toggle('plnew-cover--set', !!cover);
  }
  const cd = q('cd');
  if (cd) cd.style.backgroundImage = cover ? `url('${cover}')` : '';

  // Only write an input when it actually differs — assigning .value on the field
  // being typed in would jump the caret to the end. The typing instance already
  // matches, so this only ever touches the OTHER variant.
  const nameEl = q('name');
  if (nameEl && nameEl.value !== PLNEW.name) nameEl.value = PLNEW.name;
  const qEl = q('q');
  if (qEl && qEl.value !== PLNEW.q) qEl.value = PLNEW.q;

  const countEl = q('count');
  if (countEl) countEl.textContent = plnewCountLabel();

  root.querySelectorAll('.plnew-priv-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.priv === PLNEW.privacy);
  });
  const libBtn = q('libbtn');
  if (libBtn) libBtn.classList.toggle('active', PLNEW.mode === 'library');

  const chosen = q('chosen');  if (chosen)  chosen.innerHTML  = plnewChosenHtml();
  const results = q('results'); if (results) results.innerHTML = plnewResultsHtml();

  const create = q('create');
  if (create) {
    create.disabled = !PLNEW.name.trim();
    create.textContent = plnewCreateLabel();
  }
}

/* The live pill has NO face any more. It used to greet you with a smile+wink on
   the first home render (greetRing) and reform into the smiley every ~10s
   (homeRingPeek). Both are gone — the nav's pet carries the app's personality
   now, and these two buttons are controls. The dots keep only their arrow
   formation and the swipe / For-You / CD reactions. */
// CD tap → pick a streaming platform to open this playlist on (prototype menu).
window.togglePlPlat = function (cd) {
  const hero = cd.closest('.plp-hero');
  const menu = hero && hero.querySelector('.plp-plat');
  if (menu) menu.hidden = !menu.hidden;
};
// Playlists song row → log sheet for that song. Subject is passed inline from
// data-attrs: the playlists screen has no _album, so openSongLog's fallback
// (activeAlbum/featuredAlbum) would caption the sheet with the wrong album.
window.plSongTap = function (el) {
  openLogSheet(el, { image: el.dataset.image, title: el.dataset.title, subtitle: el.dataset.sub, isSong: true });
};
// Open the artist page for an artist by name, arriving from another screen
// (e.g. the playlists Artists tab) — mirrors openAlbumPage: go home, enter the
// --artist state, and Back returns to the origin screen.
window.openArtistPageFor = function (artistName) {
  const album = (window.ARCHIVE || []).find(a => a.artist === artistName);
  if (!album) return;
  window.activeAlbum = album;
  const enter = s => {
    setMainAlbum(s, album, false);
    s.classList.add('s-home-v3--review', 's-home-v3--album', 's-home-v3--artist');
    populateReviewPanel(s);
    populateArtistPage(s);
    const body = s.querySelector('.v3-body'); if (body) body.scrollTop = 0;
  };
  if (currentScreen().id === 'home' && homeShells().length) {
    pushBack();
    homeShells().forEach(enter);
    return;
  }
  const originSnap = captureScreenSnap();              // origin screen + its sub-state (persona/…)
  navigate('home');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    backStack.push(originSnap);                        // Back → that origin screen
    homeShells().forEach(enter);
  }));
};

// Open the official album page (the fullscreen --album state on the home shell) for a given
// album, arriving from another screen (e.g. trending). Back returns to that origin screen.
window.openAlbumPage = function (album, pinnedReview) {
  if (!album) return;
  // A review tapped in a feed rides along and gets pinned atop the album's
  // review list; any other path into an album page clears the pin.
  window._pinnedReview = pinnedReview || null;
  window.activeAlbum = album;
  const shells = homeShells();
  // Already on the home shell (e.g. tapping an album on the artist page) → transition in place.
  if (currentScreen().id === 'home' && shells.length) {
    pushBack();                                        // remember the current view (artist page, etc.)
    shells.forEach(s => enterAlbumPageState(s, album));
    return;
  }
  // Coming from another screen (e.g. trending): remember it, then go home + straight to album page.
  const originSnap = captureScreenSnap();              // origin screen + its sub-state (persona/…)
  navigate('home');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    backStack.push(originSnap);                        // Back → that origin screen
    homeShells().forEach(s => enterAlbumPageState(s, album));
  }));
};

// Live-pill ring reactions — swipe / For You / CD each fire a distinct animation;
// idle it spins slowly. (Later this can become a real music visualizer.)
function reactRing(screenEl, type) {
  const ring = screenEl && screenEl.querySelector('.v3-ring');
  if (!ring) return;
  ring.classList.remove('v3-ring--swipe', 'v3-ring--foryou', 'v3-ring--cd');
  void ring.offsetWidth;                       // restart the animation if re-triggered
  ring.classList.add('v3-ring--' + type);
  if (window.sceneCheer) sceneCheer();         // the scoop reacts to the same events
  clearTimeout(ring._reactT);
  ring._reactT = setTimeout(() => ring.classList.remove('v3-ring--' + type), type === 'foryou' ? 340 : 650);
}
window.reactRing = reactRing;

// CD tap — react the ring and toggle the compact CD popup (preview + streaming
// platforms), anchored above the CD like the playlist page's plat menu.
window.onCdTap = function (el, e) {
  if (e) e.stopPropagation();
  const scr = el.closest('.s-home-v3');
  if (!scr) return;
  reactRing(scr, 'cd');
  const menu = scr.querySelector('.v3-cd-menu');
  if (menu) menu.hidden = !menu.hidden;
};

// Play a 30s preview from the stream sheet — toggles play/pause on the button itself.
window.playPreview = function (el, e) {
  if (e) e.stopPropagation();
  const album = (window.currentBentoAlbum && currentBentoAlbum()) || window.activeAlbum || window.featuredAlbum;
  if (!album) return;
  const a = previewAudioEl();
  unlockAudio(a);                          // iOS: unlock inside the tap gesture
  if (el.classList.contains('playing')) { a.pause(); el.classList.remove('playing'); return; }
  a.onended = () => el.classList.remove('playing');
  const start = (url) => {
    if (!url) { el.classList.add('none'); setTimeout(() => el.classList.remove('none'), 1400); return; }
    if (a.src !== url) { a.src = url; a.currentTime = 0; }
    a.play().then(() => { PREVIEW.unlocked = true; el.classList.add('playing'); }).catch(() => {});
  };
  const cached = PREVIEW_CACHE.get(albumKey(album).toLowerCase());
  if (cached !== undefined) start(cached);
  else fetchPreviewUrl(album).then(start);
};

// Live pill doubles as the Back button in the fullscreen states — pops the history stack.
window.onLivePill = function (btn) {
  const scr = btn.closest('.s-home-v3');
  if (!scr) return;
  if (scr.classList.contains('s-home-v3--review')) { goBack(); return; }
  toggleHand();   // regular bento state: the pill is the hand-layout switch
};
// Tap a star to set your own rating — left half = .5, right half = whole
window.setMyRating = function (starEl, e) {
  const wrap = starEl.parentElement;
  const base = parseInt(starEl.dataset.v);
  const rect = starEl.getBoundingClientRect();
  const isHalf = e && (e.clientX - rect.left) < rect.width / 2;
  const val = isHalf ? base - 0.5 : base;
  wrap.dataset.rating = String(val);
  paintMyStars(wrap, val);
};
function paintMyStars(wrap, val) {
  if (!wrap) return;
  wrap.querySelectorAll('.v3-rev-star').forEach(s => {
    const i = parseInt(s.dataset.v);
    s.classList.remove('on', 'half');
    if (val >= i)            s.classList.add('on');
    else if (val >= i - 0.5) s.classList.add('half');
  });
}
// Grow the review box to fit its content; reveal Post only once there's text
window.autoGrowReview = function (ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
  const mine = ta.closest('.v3-rev-mine');
  const btn = mine && mine.querySelector('.v3-rev-submit');
  if (btn && !btn.disabled) btn.style.display = ta.value.trim() ? 'inline-block' : 'none';
};
// Post the review — prepends it as a "You" card, then resets the form
window.submitReview = function (btn) {
  const scr = btn.closest('.s-home-v3');
  if (!scr) return;
  const ta = scr.querySelector('.v3-rev-write');
  const wrap = scr.querySelector('.v3-rev-stars');
  const rating = parseFloat(wrap && wrap.dataset.rating) || 0;
  const text = (ta && ta.value.trim()) || '';
  if (!rating && !text) return;
  const list = scr.querySelector('.v3-rev-list');
  if (list) {
    // Same key the saved-draft "mine" card uses — it's the same review, so a
    // comment left here survives the next populateReviewList.
    const alb = scr._album || window.featuredAlbum || {};
    const myKey = 'mine::' + (alb.album || '');
    const card = document.createElement('div');
    card.className = 'v3-rev-card v3-rev-card--mine';
    card.innerHTML = `
      <div class="v3-rev-card-top">
        <div class="v3-rev-av" style="background:linear-gradient(135deg,var(--v3-accent,#e8a83c),#c76b2a)">Y</div>
        <span class="v3-rev-name">You</span>
        <span class="v3-rev-acts">
          <span class="v3-rev-likes">♥ 0</span>
          ${cmtBtnHtml(myKey, 0, 'v3-up--sm')}
        </span>
        <span class="v3-rev-time">just now</span>
      </div>
      <div class="v3-rev-meta">
        <span class="v3-rev-verb">rated</span>
        ${halfStars(rating, 10)}
        <span class="v3-rev-score">${rating.toFixed(1)}</span>
      </div>
      <div class="v3-rev-text">${text}</div>
      ${cmtWrapHtml(myKey, 0)}`;
    list.insertBefore(card, list.firstChild);
  }
  btn.textContent = 'Posted ✓';
  btn.disabled = true;
  btn.style.display = 'inline-block';
  if (ta) { ta.value = ''; ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
  if (wrap) { wrap.dataset.rating = '0'; paintMyStars(wrap, 0); }
  setTimeout(() => {
    btn.textContent = 'Post review';
    btn.disabled = false;
    btn.style.display = 'none';
  }, 1500);
};
// Listen-later / Favorite toggle buttons in the action grid, and the album
// page's quick-log squares.
window.toggleRevAction = function (btn, e) {
  if (e) e.stopPropagation();
  btn.classList.toggle('on');
  // A quick-log square IS the log sheet's own toggle, so it writes straight
  // into that album's draft — otherwise the square and the sheet would
  // disagree about whether you'd favourited the record.
  if (!btn.classList.contains('v3-rev-q')) return;
  const k = btn.dataset.k;
  const scr = btn.closest('.s-home-v3');
  const a = shellAlbum(scr);
  if (!k || !a) return;
  const on = btn.classList.contains('on');
  writeDraftFlag({ title: a.album, subtitle: a.artist }, k, on);
  // The dark/light shells show the SAME album, and this is state about the
  // record rather than about the screen — so the twin follows. (Deliberate
  // exception to the usual "scope handlers to the clicked shell" rule.)
  homeShells().forEach(s => {
    if (s === scr || s._album !== a) return;
    const twin = s.querySelector(`.v3-rev-q[data-k="${k}"]`);
    if (twin) twin.classList.toggle('on', on);
  });
};

/* The album a home shell is showing. ⚠️ `_album` is set by setMainAlbum, which
   only runs on the swipe and openAlbumPage paths — tapping the bento into the
   album page never calls it, so on that route `_album` is undefined and the
   fallback is what resolves the record. Anything reading the current album off
   a shell has to go through here or it silently gets nothing. */
function shellAlbum(scr) {
  return (scr && scr._album) || window.activeAlbum || window.featuredAlbum || null;
}

// Paint a shell's quick-log squares from the saved draft for its album.
// `album` is passed in where the caller already resolved one, so the squares
// can never disagree with the panel they sit in.
function syncQuickLog(scr, album) {
  if (!scr) return;
  const d = albumDraft(album || shellAlbum(scr));
  scr.querySelectorAll('.v3-rev-q').forEach(b => b.classList.toggle('on', !!d[b.dataset.k]));
}
// Friends / Popular / New filter tabs
window.setReviewFilter = function (btn) {
  const bar = btn.parentElement;
  bar.querySelectorAll('.v3-rev-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  populateReviewList(btn.closest('.s-home-v3'), btn.dataset.f);
};

function populateReviewPanel(scr) {
  const a = scr._album || window.featuredAlbum;
  if (!a) return;
  const nameEl = scr.querySelector('.v3-rev-album-name');
  if (nameEl) nameEl.textContent = a.album;
  // reset your draft (rating + text) when the album changes
  const stars = scr.querySelector('.v3-rev-stars');
  if (stars) { stars.dataset.rating = '0'; paintMyStars(stars, 0); }
  const ta = scr.querySelector('.v3-rev-write');
  if (ta) { ta.value = ''; autoGrowReview(ta); }
  scr.querySelectorAll('.v3-rev-btn.on').forEach(b => b.classList.remove('on'));
  // The quick-log squares are your state on THIS record, so they don't carry
  // across a swipe — they're re-read from the new album's saved draft instead
  // of just cleared, which is what makes a favourite survive a reload.
  syncQuickLog(scr, a);
  populateRecTag(scr, a);
  populateHist(scr, a);
  populateSongList(scr);
  const active = scr.querySelector('.v3-rev-filter.active');
  populateReviewList(scr, active ? active.dataset.f : 'popular');
}

// ── Tracklist under the review CTA ────────────────────────────
// Titles/durations/ratings are deterministic placeholders (seeded per album)
// until real per-song data exists. Each row opens the log sheet for that song.
const SONG_WORDS = ['Ceremony','Glass','Velvet','Static','Halcyon','Ember','Marrow','Neon','Pale','Drift','Saints','Cinder','Vermilion','Lull','Fathom','Wax','Ghost','Iron','Petals','Sable','Hollow','Aurora','Mercury','Slow','Cobalt','Fever','Tundra','Opal','Riptide','Lantern','Cavern','Dial','Salt','Bloom','Anthem','Dusk','Vessel','Crown','Signal','Amber'];

function seedRand(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6D2B79F5; let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function songsFor(album) {
  const n = Math.max(1, album.tracks || 10);
  const rnd = seedRand(album.album || 'x');
  const out = [];
  for (let i = 0; i < n; i++) {
    const w1 = SONG_WORDS[Math.floor(rnd() * SONG_WORDS.length)];
    const w2 = rnd() < 0.35 ? ' ' + SONG_WORDS[Math.floor(rnd() * SONG_WORDS.length)] : '';
    const secs = 150 + Math.floor(rnd() * 210);                 // 2:30–6:00
    const dur = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
    const rating = Math.round((3.5 + rnd() * 1.5) * 2) / 2;      // 3.5–5.0 in half steps
    out.push({ n: i + 1, title: w1 + w2, dur, rating });
  }
  return out;
}
// Rating-distribution histogram — 10 buckets (½★ … 5★), seeded per album and
// peaked around the album's own score so each album has a distinct, stable spread.
function ratingSpreadFor(album) {
  const rnd = seedRand((album.album || 'x') + '::spread');
  const peak = Math.min(10, Math.max(1, Math.round((album.rating || 4) * 2)));
  const w = [];
  for (let i = 1; i <= 10; i++) {
    const d = i - peak;
    let v = Math.exp(-(d * d) / 5.5);       // bell curve centered on the score
    v *= 0.6 + rnd() * 0.75;                // per-bucket jitter
    if (i <= 2) v *= 0.35 + rnd() * 0.3;    // very low ratings are rarer
    w.push(v);
  }
  const max = Math.max(...w) || 1;
  return w.map(v => Math.max(0.05, v / max));   // normalize 0–1, keep a visible floor
}
function populateHist(scr, album) {
  const box = scr && scr.querySelector('.v3-rev-hist');
  if (!box || !album) return;
  const bars = ratingSpreadFor(album);
  const barsEl = box.querySelector('.v3-rev-hist-bars');
  if (barsEl) barsEl.innerHTML = bars.map((h, i) =>
    `<span class="v3-rev-hist-bar" title="${(i + 1) / 2}★"><span style="height:${Math.round(h * 100)}%"></span></span>`
  ).join('');
  const sub = box.querySelector('.v3-rev-hist-sub');
  if (sub) sub.textContent = (window.fmtRc ? fmtRc(album.reviewCount || 0) : (album.reviewCount || 0)) + ' reviews';
}
function populateSongList(scr) {
  const wrap = scr && scr.querySelector('.v3-rev-songs');
  if (!wrap) return;
  const a = scr._album || window.featuredAlbum;
  if (!a) { wrap.innerHTML = ''; return; }
  const songs = songsFor(a);
  // Every track is listed — the list used to cap at ~8.5 rows and scroll inside
  // itself, which hid the back half of a long album behind a nested scroller.
  // The header row reuses the row's own three cell classes so the labels can
  // only ever sit over the columns they name (see .v3-song-head in app.css).
  wrap.innerHTML = `
    <div class="v3-song-head">
      <span class="v3-song-title">Song</span>
      <span class="v3-song-dur">Length</span>
      <span class="v3-song-rate">Rating</span>
    </div>
    <div class="v3-rev-songs-scroll">` + songs.map(s => `
    <button class="v3-song-row" onclick="event.stopPropagation(); openSongLog(this)" data-title="${s.title}">
      <span class="v3-song-title">${s.title}</span>
      <span class="v3-song-dur">${s.dur}</span>
      <span class="v3-song-rate">${s.rating.toFixed(1)}</span>
    </button>`).join('') + `</div>`;
}
window.openSongLog = function(el) {
  const scr = el.closest('.app-screen');
  const a = (scr && scr._album) || window.activeAlbum || window.featuredAlbum;
  openLogSheet(el, { image: a ? a.image : '', title: el.dataset.title, subtitle: a ? a.album : '', isSong: true });
};

// Friend-rec tag at the top of the review panel — populated only when a friend
// has activity on this album; otherwise it's algo-served and stays hidden.
function populateRecTag(scr, album) {
  const rec = scr && scr.querySelector('.v3-rev-rec');
  if (!rec) return;
  const f = (window.friendRecFor && window.friendRecFor(album)) || null;
  if (!f) { rec.hidden = true; return; }
  rec.hidden = false;
  const av = rec.querySelector('.v3-rev-rec-av');
  if (av) { av.style.background = f.grad; av.textContent = f.init; }
  const nm = rec.querySelector('.v3-rev-rec-name');
  if (nm) nm.textContent = f.user;
}

// Deterministic engagement meta (time / likes / comments) for a review, so the
// numbers stay put across filter re-renders instead of reshuffling.
const REV_TIMES = ['just now', '2h', '5h', '9h', '1d', '2d', '4d', '1w', '2w', '3w'];
function revMeta(r, i) {
  const seed = (r.name || '').length * 3 + (r.text || '').length + i * 7;
  return {
    ago: REV_TIMES[seed % REV_TIMES.length],
    likes: 3 + (seed * 13) % 140,
    comments: (seed * 7) % 18,
  };
}

// ── Review upvotes ────────────────────────────────────────────
// Counts are seeded per review so they're stable across re-renders and filter
// switches. Most reviews sit in the ordinary 5–50 band; a thin tail gets the
// "this one blew up" treatment.
function revUpvotes(r, i) {
  const rnd = seedRand('up::' + (r.name || '') + '::' + (r.text || '').slice(0, 24) + '::' + i);
  const roll = rnd();
  if (roll > 0.985) return 8000 + Math.floor(rnd() * 4500);   // ~1.5% — viral
  if (roll > 0.94)  return 700 + Math.floor(rnd() * 900);     // ~4.5% — big hit
  return 5 + Math.floor(rnd() * 46);                          // the usual 5–50
}

// Your own votes, keyed per review so a re-render (or a filter switch) keeps them.
const REV_VOTES = Object.create(null);
function _revAttr(s) { return _sdsEsc(s).replace(/"/g, '&quot;'); }

const THUMB_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 22V11m0 0 4.2-8.4a2 2 0 0 1 2.9 2.5L12.8 9H19a2 2 0 0 1 2 2.4l-1.6 8A2 2 0 0 1 17.4 21H7"/><path d="M3 22h4V11H3z"/></svg>`;

// One upvote pill. `key` must be stable for the same review across renders.
function upvoteHtml(key, base, extraClass = '') {
  const on = !!REV_VOTES[key];
  return `<button class="v3-up${extraClass ? ' ' + extraClass : ''}${on ? ' is-on' : ''}"
    data-k="${_revAttr(key)}" data-n="${base}"
    aria-pressed="${on}" aria-label="Upvote review"
    onclick="event.stopPropagation(); toggleRevUp(this)">${THUMB_SVG}<span class="v3-up-n">${window.fmtRc(base + (on ? 1 : 0))}</span></button>`;
}

window.toggleRevUp = function (btn) {
  const k = btn.dataset.k;
  const base = +btn.dataset.n || 0;
  const on = !REV_VOTES[k];
  if (on) REV_VOTES[k] = true; else delete REV_VOTES[k];
  btn.classList.toggle('is-on', on);
  btn.setAttribute('aria-pressed', String(on));
  const n = btn.querySelector('.v3-up-n');
  if (n) n.textContent = window.fmtRc(base + (on ? 1 : 0));
};

/* ── Review comments ──────────────────────────────────────────
   A review's replies, as a Reddit-shaped tree: top-level comments with nested
   children behind an indent rail, `CMT_DEFAULT` threads shown and the rest
   behind "View n more comments".

   ⚠️ **The `💬 n` count is the INPUT to the generator, not a second seeded
   number.** Every card already advertised a count (`revMeta`, or the feed
   event's own `comments`), and a thread dealt independently of it would
   disagree with the button that opened it — a thread of five under a badge
   saying nine is the kind of detail that reads as broken.

   ⚠️ **One KEY per review, used by every map here and by the upvote pill.**
   The same review shows up in three places — the home feed row, the pinned
   card and the list card — and they only reach the same thread (and the same
   like state) if they compute the same string. `feedRevKey` and the pinned
   card's key are deliberately identical for this reason.

   Everything is cached per key, so opening a thread, liking a comment or
   switching the review filter never re-deals it. */
const CMT_DEFAULT = 3;                   // top-level threads shown before "view more"
const CMT_CACHE = Object.create(null);   // key → root nodes
const CMT_OPEN  = Object.create(null);   // key → thread expanded?
const CMT_ALL   = Object.create(null);   // key → past the first CMT_DEFAULT?
const CMT_LIKED = Object.create(null);   // key::id → your like
const CMT_MINE  = Object.create(null);   // key → BASE-level comments you posted, newest first
const CMT_REPLY_TO = Object.create(null);// key → id of the comment you're replying to
const CMT_SEQ   = Object.create(null);   // key → id counter for your comments
/* ⚠️ Past this, a reply attaches to its target's PARENT rather than the target.
   Each level costs 17px of a ~360px column, so a fifth indent leaves the text
   too narrow to read — Reddit stops the same way rather than marching off the
   right edge. Generated comments cap at depth 2; this is the ceiling for the
   ones you write. */
const CMT_MAX_DEPTH = 3;

// Same handles the inbox pins and the feed casts, so a commenter has the same
// face here as everywhere else (feedFace hashes anything it doesn't know).
const CMT_CAST = ['velvetblast', 'staticfog', 'echoplex', 'moonwire', 'tapehiss',
                  'glassmoth', 'kira_m', 'nova_wr', 'drumkid', 'helio',
                  'vxblank', 'marshmist'];

// Two pools, because a top-level comment answers the REVIEW and a nested one
// answers a COMMENT — one pool for both gives you replies that agree with
// nothing and openers that read as non-sequiturs.
const CMT_OPEN_LINES = [
  'this is the review that finally made me put it on',
  'the second half of this record never gets talked about and it should',
  'genuinely a grower — took me four listens to get there',
  'the mixing on this is doing so much heavy lifting',
  'saw them play it front to back last year and it changed how i hear it',
  'had this on repeat for a whole winter, can barely listen to it now',
  'the drums alone are worth the rating tbh',
  'coming back to this a year later and you were right',
  'perfect album to walk home to at 2am',
  'you and i heard two completely different records lol',
  'track 4 is the whole thesis of the album',
  'aged better than anything else that came out that year',
];
const CMT_REPLY_LINES = [
  'hard agree',
  'nah i think you’re underselling side b',
  'this exactly',
  'the deluxe tracks wreck the pacing though',
  'came here to say the same thing',
  'literally what i tell everyone',
  'respectfully, no',
  'the vinyl master fixes most of that',
  'wait i never noticed that until now',
  'this is the take',
  'give it another spin on headphones',
  'you’re describing my exact experience with it',
];
// Oldest → newest. Indexed by the node's position, never rolled — see below.
const CMT_AGOS = ['3w', '2w', '1w', '5d', '3d', '2d', '1d', '16h',
                  '9h', '5h', '2h', '1h', '35m', '12m', '4m'];

/* Draws from a shuffled queue and reshuffles when it runs dry, rather than
   rolling each time. ⚠️ A plain roll put the SAME line in two adjacent rows —
   with a dozen lines and up to 13 top-level comments that's near-certain, and
   two identical comments in a row reads as a bug, not as coincidence. The
   reshuffle also refuses to lead with the line it just dealt, which is the only
   place a repeat could still land next to itself. */
function cmtDealer(pool, rnd) {
  let q = [];
  let last = null;
  return () => {
    if (!q.length) {
      q = pool.slice();
      for (let i = q.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [q[i], q[j]] = [q[j], q[i]];
      }
      if (q.length > 1 && q[0] === last) [q[0], q[1]] = [q[1], q[0]];
    }
    return (last = q.shift());
  };
}

function revThread(key, total) {
  if (CMT_CACHE[key]) return CMT_CACHE[key];
  const n = Math.max(0, Math.min(24, Number(total) || 0));
  const rnd = seedRand('cmt::' + key);
  const pick = a => a[Math.floor(rnd() * a.length)];
  const dealOpen = cmtDealer(CMT_OPEN_LINES, rnd);
  const dealReply = cmtDealer(CMT_REPLY_LINES, rnd);
  const roots = [], flat = [];
  for (let i = 0; i < n; i++) {
    /* ⚠️ `ago` comes from the node's ORDER, not a roll. A node is always
       created after its parent, so walking the pool oldest→newest is what
       stops a reply predating the comment it answers. */
    const node = {
      id: 'c' + i, kids: [], depth: 0,
      user: pick(CMT_CAST),
      ago: CMT_AGOS[Math.min(CMT_AGOS.length - 1, Math.floor(i / n * CMT_AGOS.length))],
      likes: Math.floor(rnd() * 24),
      text: '',
    };
    // Reddit's shape is mostly top-level with a few deep pockets — and a reply
    // needs something to answer, hence the 45% split and the depth cap at 2.
    const parents = flat.filter(c => c.depth < 2);
    if (i && parents.length && rnd() < 0.45) {
      const p = parents[Math.floor(rnd() * parents.length)];
      node.depth = p.depth + 1;
      node.text = dealReply();
      p.kids.push(node);
    } else {
      node.text = dealOpen();
      roots.push(node);
    }
    flat.push(node);
  }
  return (CMT_CACHE[key] = roots);
}

// A subtree's size — what "view n more" has to promise, since a hidden thread
// takes its replies down with it.
function cmtSize(c) { return 1 + c.kids.reduce((s, k) => s + cmtSize(k), 0); }

// Everything in the thread, yours included. ⚠️ Counting CMT_MINE.length instead
// would miss every reply you nested — those live in their parent's `kids`, not
// in the base-level list.
function cmtRoots(key, total) {
  return (CMT_MINE[key] || []).concat(CMT_CACHE[key] || revThread(key, total));
}
function cmtCount(key, total) {
  return cmtRoots(key, total).reduce((s, c) => s + cmtSize(c), 0);
}

/* Locate a node and its parent across BOTH root lists — your base-level
   comments live in CMT_MINE, everyone else's in CMT_CACHE, and Reply can
   target either. */
function cmtFind(key, id) {
  const walk = (list, parent) => {
    for (const c of list) {
      if (c.id === id) return { node: c, parent };
      const hit = walk(c.kids, c);
      if (hit) return hit;
    }
    return null;
  };
  return walk(CMT_MINE[key] || [], null) || walk(CMT_CACHE[key] || [], null);
}

const CMT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.6a8 8 0 0 1-8.6 8 9 9 0 0 1-3.2-.6L3.5 20.5l1.7-4.4a7.9 7.9 0 0 1-1.7-4.5 8 8 0 0 1 8.6-8 8 8 0 0 1 8.4 8Z"/></svg>`;

// The comment pill. Same object as the upvote pill (`.v3-up`) so the pair reads
// as one control; this one toggles the thread under the card.
function cmtBtnHtml(key, total, extraClass = '') {
  const open = !!CMT_OPEN[key];
  return `<button class="v3-up v3-cmt-btn${extraClass ? ' ' + extraClass : ''}${open ? ' is-open' : ''}"
    type="button" data-k="${_revAttr(key)}" data-n="${Math.max(0, Number(total) || 0)}"
    aria-expanded="${open}" aria-label="Comments"
    onclick="event.stopPropagation(); cmtToggle(this)">${CMT_SVG}<span class="v3-up-n">${cmtCount(key, total)}</span></button>`;
}

/* One comment. ⚠️ The indent is REAL NESTING — `.v3-cmt-kids` wraps a node's
   children and carries the offset and the rail, so depth needs no class, no
   inline style and no arithmetic: a child of a child indents twice because it
   sits inside two wrappers. */
function cmtNodeHtml(key, c) {
  const lk = !!CMT_LIKED[key + '::' + c.id];
  const kids = c.kids.length
    ? `<div class="v3-cmt-kids">${c.kids.map(k => cmtNodeHtml(key, k)).join('')}</div>` : '';
  return `
        <div class="v3-cmt${c.mine ? ' v3-cmt--mine' : ''}">
          <div class="v3-cmt-av" style="background-image:url('${c.face || feedFace(c.user)}')"></div>
          <div class="v3-cmt-main">
            <div class="v3-cmt-hd">
              <span class="v3-cmt-user">${c.user}</span>
              <span class="v3-cmt-ago">${c.ago}</span>
            </div>
            <div class="v3-cmt-text">${c.text}</div>
            <div class="v3-cmt-acts">
              <button class="v3-cmt-like${lk ? ' is-on' : ''}" type="button"
                data-k="${_revAttr(key)}" data-i="${c.id}" data-n="${c.likes}"
                aria-pressed="${lk}"
                onclick="event.stopPropagation(); cmtLike(this)">♥ <span>${c.likes + (lk ? 1 : 0)}</span></button>
              <button class="v3-cmt-reply" type="button"
                data-k="${_revAttr(key)}" data-i="${c.id}"
                onclick="event.stopPropagation(); cmtReply(this)">Reply</button>
            </div>
          </div>
        </div>${kids}`;
}

function cmtThreadHtml(key, total) {
  if (!CMT_OPEN[key]) return '';
  const roots = cmtRoots(key, total);
  const shown = CMT_ALL[key] ? roots : roots.slice(0, CMT_DEFAULT);
  const rest = roots.slice(shown.length).reduce((s, c) => s + cmtSize(c), 0);
  /* The composer is one box that does both jobs: with a target it posts a
     nested reply, without one it posts at the base of the thread. The chip is
     the only thing that says which — so it doubles as the way out of reply
     mode. */
  const to = CMT_REPLY_TO[key] ? cmtFind(key, CMT_REPLY_TO[key]) : null;
  return `
      <div class="v3-cmt-thread">
        ${shown.map(c => cmtNodeHtml(key, c)).join('')
          || `<div class="v3-cmt-none">No comments yet — start it off.</div>`}
        ${rest > 0 ? `<button class="v3-cmt-more" type="button" data-k="${_revAttr(key)}"
          onclick="event.stopPropagation(); cmtMore(this)">View ${rest} more comment${rest > 1 ? 's' : ''}</button>` : ''}
        <form class="v3-cmt-add" data-k="${_revAttr(key)}" onsubmit="return cmtAdd(this)">
          ${to ? `<button class="v3-cmt-to" type="button" data-k="${_revAttr(key)}"
            onclick="event.stopPropagation(); cmtReplyCancel(this)">replying to @${to.node.user}<span>✕</span></button>` : ''}
          <div class="v3-cmt-add-row">
            <input class="v3-cmt-input" type="text" maxlength="180"
                   placeholder="${to ? 'Write a reply…' : 'Add a comment…'}"
                   onclick="event.stopPropagation()">
            <button class="v3-cmt-post" type="submit">${to ? 'Reply' : 'Post'}</button>
          </div>
        </form>
      </div>`;
}

// The slot a thread renders into. Always emitted (and empty while collapsed) so
// re-rendering never has to touch the card around it.
function cmtWrapHtml(key, total) {
  return `<div class="v3-cmt-wrap" data-cmt="${_revAttr(key)}" data-n="${Math.max(0, Number(total) || 0)}">${cmtThreadHtml(key, total)}</div>`;
}

/* ⚠️ Repaint EVERY wrap carrying this key, not the one that was clicked. The
   dark and light shells render side by side in the viewer and both hold a copy
   of the same review — updating one leaves the other showing a stale thread.
   Same reason `setArtistAlbumView` repaints every shell. */
function cmtRender(key) {
  document.querySelectorAll('.v3-cmt-wrap').forEach(w => {
    if (w.dataset.cmt !== key) return;
    w.innerHTML = cmtThreadHtml(key, +w.dataset.n || 0);
  });
  document.querySelectorAll('.v3-cmt-btn').forEach(b => {
    if (b.dataset.k !== key) return;
    const open = !!CMT_OPEN[key];
    b.classList.toggle('is-open', open);
    b.setAttribute('aria-expanded', String(open));
    const n = b.querySelector('.v3-up-n');
    if (n) n.textContent = cmtCount(key, +b.dataset.n || 0);
  });
}

window.cmtToggle = function (btn) {
  const k = btn.dataset.k;
  CMT_OPEN[k] = !CMT_OPEN[k];
  if (!CMT_OPEN[k]) CMT_ALL[k] = false;   // collapsing resets the expansion
  cmtRender(k);
};
window.cmtMore = function (btn) {
  CMT_ALL[btn.dataset.k] = true;
  cmtRender(btn.dataset.k);
};
/* Updated in place rather than through cmtRender: a re-render would wipe
   whatever the user had half-typed in the composer below. */
window.cmtLike = function (btn) {
  const k = btn.dataset.k + '::' + btn.dataset.i;
  const on = !CMT_LIKED[k];
  if (on) CMT_LIKED[k] = true; else delete CMT_LIKED[k];
  btn.classList.toggle('is-on', on);
  btn.setAttribute('aria-pressed', String(on));
  const n = btn.querySelector('span');
  if (n) n.textContent = (+btn.dataset.n || 0) + (on ? 1 : 0);
};
/* Reply AIMS the thread's one composer at a comment; posting then nests under
   it. There's still a single box per thread rather than one per comment —
   what changes is where its output lands.
   ⚠️ Hold the WRAP, not the thread: cmtRender replaces the thread's markup, so
   a reference into it is stale by the time we want to focus the input. The
   wrap element itself survives. */
window.cmtReply = function (btn) {
  const k = btn.dataset.k;
  const wrap = btn.closest('.v3-cmt-wrap');
  CMT_REPLY_TO[k] = btn.dataset.i;
  cmtRender(k);
  const input = wrap && wrap.querySelector('.v3-cmt-input');
  if (input) input.focus();
};
window.cmtReplyCancel = function (btn) {
  delete CMT_REPLY_TO[btn.dataset.k];
  cmtRender(btn.dataset.k);
};

window.cmtAdd = function (form) {
  const k = form.dataset.k;
  const input = form.querySelector('.v3-cmt-input');
  const text = ((input && input.value) || '').trim();
  if (text) {
    const P = window.PROFILE || {};
    const mine = CMT_MINE[k] || (CMT_MINE[k] = []);
    /* ⚠️ ids can't come from `mine.length` any more — a nested reply lives in
       its parent's `kids`, never in that list, so two replies in a row would
       both be "me0" and cmtFind/CMT_LIKED would confuse them. */
    const node = {
      id: 'me' + (CMT_SEQ[k] = (CMT_SEQ[k] || 0) + 1),
      kids: [], depth: 0, mine: true,
      user: P.handle || 'you', face: P.pic || feedFace('you'),
      ago: 'now', likes: 0, text: _sdsEsc(text),
    };
    // Aimed at a comment → nest under it. Aimed at nothing → base of the thread.
    const to = CMT_REPLY_TO[k] ? cmtFind(k, CMT_REPLY_TO[k]) : null;
    if (to) {
      const host = (to.node.depth >= CMT_MAX_DEPTH && to.parent) ? to.parent : to.node;
      node.depth = host.depth + 1;
      host.kids.push(node);
      CMT_ALL[k] = true;   // a reply is no use hidden behind "view more"
    } else {
      mine.unshift(node);
    }
    delete CMT_REPLY_TO[k];
    cmtRender(k);
  }
  return false;    // never submit — there is no server behind this
};

function populateReviewList(scr, filter) {
  const a = scr._album || window.featuredAlbum;
  const list = scr && scr.querySelector('.v3-rev-list');
  if (!a || !list) return;
  let revs = (a.reviews || []).slice();
  if (filter === 'popular') revs.sort((x, y) => (y.rating || 0) - (x.rating || 0));
  else if (filter === 'new') revs.reverse();
  const countEl = scr.querySelector('.v3-rev-count');
  if (countEl) countEl.textContent = `${window.fmtRc(a.reviewCount || revs.length)} reviews`;
  // A review arrived pinned from the home feed → it leads the list, regardless of filter
  const pin = (window._pinnedReview && window._pinnedReview.album === a.album) ? window._pinnedReview : null;
  // ⚠️ Must match `feedRevKey` exactly — the feed row's like and this card's
  // like are the same act, and its comment button opens THIS thread.
  const pinKey = 'pin::' + a.album + '::' + (pin ? pin.name || '' : '');
  const pinHtml = pin ? `
    <div class="v3-rev-card v3-rev-card--pinned">
      <div class="v3-rev-card-top">
        <div class="v3-rev-av" style="background:${pin.grad || '#555'}">${pin.init || '?'}</div>
        <span class="v3-rev-name">${pin.name || 'Listener'}</span>
        <span class="v3-rev-pin-chip">from your feed</span>
        <span class="v3-rev-acts">
          ${upvoteHtml(pinKey, pin.likes || revUpvotes(pin, 0), 'v3-up--sm')}
          ${cmtBtnHtml(pinKey, pin.comments || 0, 'v3-up--sm')}
        </span>
        <span class="v3-rev-time">${pin.ago || ''}</span>
      </div>
      <div class="v3-rev-meta">
        <span class="v3-rev-verb">rated</span>
        ${halfStars(pin.rating || 4, 10)}
        <span class="v3-rev-score">${(pin.rating || 4).toFixed(1)}</span>
      </div>
      <div class="v3-rev-text">${pin.text || ''}</div>
      ${cmtWrapHtml(pinKey, pin.comments || 0)}
    </div>` : '';
  // Identify each review by its position in the album's OWN list, not its
  // position in the filtered array — otherwise switching filter reshuffles the
  // seeded timestamps/counts and orphans your upvotes.
  /* YOUR review, from the log-sheet draft for this album. It leads the list —
     above even a pinned one — and is the only card that gets a share button:
     you can post your own take, not someone else's. */
  const mine = (window.albumDraft && albumDraft(a)) || {};
  const myText = (mine.text || '').trim();
  const myKey = 'mine::' + a.album;
  const mineHtml = (mine.rating || myText) ? `
    <div class="v3-rev-card v3-rev-card--mine">
      <div class="v3-rev-card-top">
        <div class="v3-rev-av" style="background:linear-gradient(135deg,var(--v3-accent,#e8a83c),#c76b2a)">Y</div>
        <span class="v3-rev-name">You</span>
        <span class="v3-rev-acts">
          ${cmtBtnHtml(myKey, 0, 'v3-up--sm')}
          <button class="v3-rev-share" type="button" title="Share to Instagram"
                  onclick="event.stopPropagation(); shareMyReview(this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>
            Share
          </button>
        </span>
        <span class="v3-rev-time">your review</span>
      </div>
      <div class="v3-rev-meta">
        <span class="v3-rev-verb">rated</span>
        ${halfStars(mine.rating || 0, 10)}
        <span class="v3-rev-score">${(mine.rating || 0).toFixed(1)}</span>
      </div>
      ${myText ? `<div class="v3-rev-text">${myText}</div>` : ''}
      ${cmtWrapHtml(myKey, 0)}
    </div>` : '';

  const order = a.reviews || [];
  list.innerHTML = mineHtml + pinHtml + revs.map((r) => {
    const i = Math.max(0, order.indexOf(r));
    const m = revMeta(r, i);
    const key = a.album + '::' + (r.name || '') + '::' + i;
    return `
    <div class="v3-rev-card">
      <div class="v3-rev-card-top">
        <div class="v3-rev-av" style="background:${r.grad || '#555'}">${r.init || '?'}</div>
        <span class="v3-rev-name">${r.name || 'Listener'}</span>
        <span class="v3-rev-acts">
          ${upvoteHtml(key, revUpvotes(r, i), 'v3-up--sm')}
          ${cmtBtnHtml(key, m.comments, 'v3-up--sm')}
        </span>
        <span class="v3-rev-time">${m.ago}</span>
      </div>
      <div class="v3-rev-meta">
        <span class="v3-rev-verb">rated</span>
        ${halfStars(r.rating || 4, 10)}
        <span class="v3-rev-score">${(r.rating || 4).toFixed(1)}</span>
      </div>
      <div class="v3-rev-text">${r.text || ''}</div>
      ${cmtWrapHtml(key, m.comments)}
    </div>`;
  }).join('') || `<div class="v3-rev-empty">No reviews yet — be the first.</div>`;
}

// Friend-feed card taps: the card is the review → album page scrolled to the
// review section with that review pinned on top; the art is the album → album
// page from the top. (i indexes window.FRIEND_ACTIVITY — no attr-escaping woes.)
function friendAlbumFor(f) {
  return (window.ARCHIVE || []).find(x => x.album === f.album && x.artist === f.artist)
      || (window.ARCHIVE || []).find(x => x.album === f.album) || null;
}
window.openFriendAlbum = function (i) {
  const f = (window.FRIEND_ACTIVITY || [])[i];
  const album = f && friendAlbumFor(f);
  if (album) openAlbumPage(album);
};
// The key a review carries from the feed into the album page. ⚠️ Must stay in
// step with `pinKey` in populateReviewList — it's how a like in the feed and
// the pinned card's like are the same act, and how the feed's comment button
// knows which thread to open.
function feedRevKey(e) { return 'pin::' + e.album + '::' + e.user; }

window.openFriendReview = function (i) {
  const f = (window.FRIEND_ACTIVITY || [])[i];
  const album = f && friendAlbumFor(f);
  if (!album) return;
  // You came here for this review — its thread is already open when you land.
  CMT_OPEN[feedRevKey(f)] = true;
  openAlbumPage(album, {
    album: f.album, name: f.user, init: f.init, grad: f.grad,
    rating: f.rating, text: f.quote, ago: f.ago, likes: f.likes, comments: f.comments,
  });
  // After the album state renders, glide each shell down to the review list.
  // Rect deltas are visually scaled by the phone-wrap transform → divide it out.
  setTimeout(() => {
    homeShells().forEach(s => {
      const body = s.querySelector('.v3-body');
      const target = s.querySelector('.v3-rev-list');
      if (!body || !target) return;
      const scale = body.getBoundingClientRect().width / body.offsetWidth || 1;
      const top = (target.getBoundingClientRect().top - body.getBoundingClientRect().top) / scale + body.scrollTop - 130;
      body.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    });
  }, 150);
};

// ── Home activity feed ────────────────────────────────────────
// The homepage feed is built out of the NOTIFICATIONS row (`.ntf-*`): avatar +
// kind badge · copy · time · trailing album thumb. Same component, different
// content — the inbox is what happened *to you*, this is what the people you
// follow are doing. Both sides read the shared `--sd-*` tokens, so the row
// styling lives in one place.
//
// The deal is memoised into `window._FEED` (the idiom the retired "you may
// know" rails used) for two reasons: the dark and light shells render
// separately and would otherwise each deal their own feed, and re-rendering the
// home screen shouldn't reshuffle it under the user. `reshuffleHome` and
// `applyPersona` clear it.
const FEED_N = 9;

// Row rhythm. Reviews are the backbone — a quote is the thing the app is
// actually for — and the other kinds punctuate. It's a fixed pattern rather
// than a roll so the feed can never deal four follows in a row.
/* ⚠️ Every type here is something a PERSON YOU FOLLOW DID. That is the line
   between this and the inbox: the feed is other people's activity, the inbox is
   things that happened to YOU. Nothing systemic belongs here — `release` ("X is
   out now") and `trending` ("this is climbing") used to sit in this rhythm and
   were neither, so they read as noise between real friend activity.
   The verbs deliberately mirror the log sheet's own toggles — reviewed, rated,
   favourited, logged, saved for later — so the feed shows friends doing exactly
   the things you can do. */
const FEED_RHYTHM = ['review', 'review', 'fav',    'review', 'playlist',
                     'review', 'follow', 'listened', 'review', 'rating', 'later'];

// One photo per handle so a person looks like themselves wherever they appear.
// ntfPeople() pins the community accounts by hand; the feed cast is generated,
// so it hashes into the same rp-* pool instead.
function feedFace(user) {
  const pinned = (typeof ntfPeople === 'function') ? ntfPeople() : {};
  if (pinned[user]) return pinned[user];
  let h = 7;
  for (const c of String(user)) h = (h * 31 + c.charCodeAt(0)) | 0;
  return `images/rp-${String(Math.abs(h) % 64 + 1).padStart(2, '0')}.jpg`;
}

// "12m" / "3h" / "2d" / "1w" → minutes, for sorting and time-bucketing. The
// feed's ago strings are generated (personaFeed) rather than authored, so the
// buckets have to be derived from them.
const AGO_UNIT = { m: 1, h: 60, d: 1440, w: 10080 };
function agoMins(ago) {
  const m = /^(\d+)\s*([mhdw])/.exec(String(ago || ''));
  return m ? Number(m[1]) * AGO_UNIT[m[2]] : 1e9;
}

function feedEvents() {
  if (window._FEED) return window._FEED;
  const src = window.FRIEND_ACTIVITY || [];
  if (!src.length) return (window._FEED = []);

  // Playlists someone else made — "you added to your own playlist" is not news.
  const lists = (typeof plLists === 'function' ? plLists() : [])
    .filter(p => p.creator && p.creator !== 'you');

  // `idx` indexes FRIEND_ACTIVITY and travels with the event, so review rows
  // still open the pinned-review flow (openFriendReview) — same escaping-free
  // idiom as before.
  // Sorted newest-first after the shuffle so the time buckets below come out
  // contiguous and in order, the way the inbox's hand-authored list already is.
  const order = src.map((_, i) => i)
    .sort(() => Math.random() - 0.5)
    .slice(0, FEED_N)
    .sort((a, b) => agoMins(src[a].ago) - agoMins(src[b].ago));

  window._FEED = order.map((idx, n) => {
    const f = src[idx];
    // A row with no quote has nothing to say as a review, so it falls back to
    // the bare rating rather than rendering an empty blockquote.
    let type = FEED_RHYTHM[n % FEED_RHYTHM.length];
    if (type === 'review' && !f.quote) type = 'rating';
    const list = lists.length ? lists[(idx + n) % lists.length] : null;
    if (type === 'playlist' && !list) type = 'rating';

    return {
      type, idx,
      user: f.user, face: feedFace(f.user),
      album: f.album, artist: f.artist, image: f.image,
      // A follow row is about the artist, so its trailing slot wants the artist
      // photo. The cover stands in only when there isn't one.
      thumb: type === 'follow'
        ? ((window.ARTIST_IMG && window.ARTIST_IMG[f.artist]) || f.image)
        : f.image,
      playlist: list ? list.name : '',
      rating: f.rating, quote: f.quote, ago: f.ago, likes: f.likes || 0,
      // The inbox fills its unread rows and leaves the rest flat on the bg —
      // that contrast is most of why the screen reads as well as it does. A
      // feed has no read state, so "today" stands in for it: the newest group
      // is the filled one.
      fresh: agoMins(f.ago) <= 60 * 24,
    };
  });
  return window._FEED;
}

// Where a row takes you. Routed through the event index rather than inlined
// names so nothing needs quote-escaping into an onclick.
window.feedOpen = function (n) {
  const e = feedEvents()[n];
  if (!e) return;
  if (e.type === 'review' || e.type === 'rating') return openFriendReview(e.idx);
  if (e.type === 'playlist') return window.openPlaylistPage && window.openPlaylistPage(e.playlist);
  if (e.type === 'follow')   return window.openArtistPageFor && window.openArtistPageFor(e.artist);
  return openFriendAlbum(e.idx);          // release / milestone → the album page
};
// The trailing thumb goes straight to whatever it is a picture OF — the album,
// or the artist on a follow row, where the thumb is their photo.
window.feedOpenArt = function (n) {
  const e = feedEvents()[n];
  if (!e) return;
  if (e.type === 'follow') return window.openArtistPageFor && window.openArtistPageFor(e.artist);
  openFriendAlbum(e.idx);
};

function renderFriendFeed(screenEl) {
  const container = screenEl.querySelector('.v3-feed-items');
  if (!container) return;
  const events = feedEvents();
  if (!events.length) { container.innerHTML = ''; return; }

  // Kind glyph, clipped to the avatar's bottom-right — says what happened
  // before you've read a word of the copy. `rating` borrows the milestone star;
  // the rest reuse the inbox's badges so the two screens stay one vocabulary.
  const BADGE = {
    review:    '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    rating:    '<path d="m12 3.5 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.9l6.1-.8Z"/>',
    follow:    '<path d="M10 11a3.4 3.4 0 1 0 0-6.8A3.4 3.4 0 0 0 10 11Z"/><path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h4a4.5 4.5 0 0 1 4.5 4.5V20Z"/><path d="M19 6.5v5M21.5 9h-5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
    playlist:  '<path d="M4 6h12v2H4zM4 11h12v2H4zM4 16h8v2H4z"/><path d="M18.5 11.5v6.2a2 2 0 1 1-1.6-2V10l3.6-.9v2Z"/>',
    // The three log-sheet verbs, drawn (not filled) — same glyphs as SD_ICONS.
    fav:       '<path d="M12 21s-7.5-4.9-9.5-9C1 8.5 3 5 6.5 5 9 5 12 8 12 8s3-3 5.5-3C21 5 23 8.5 21.5 12c-2 4.1-9.5 9-9.5 9z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
    listened:  '<path d="M7 8a5 5 0 0 1 10 0c0 3-2.2 4.1-3.4 5.3-.8.8-1.2 1.5-1.2 2.7A2.4 2.4 0 0 1 7.6 17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
    later:     '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M12 7.4V12l3 1.8" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
  };

  /* Every row is a person now, so there is no system variant: all of them get an
     avatar and a trailing album thumb. `isSys` (cover-as-avatar, no thumb) went
     with `release`/`trending` — the inbox still needs it, the feed doesn't. */

  /* ⚠️ Every line is SUBJECT · VERB · OBJECT, in that order, and so is every
     line in the inbox — a row reads as a sentence, with the round avatar as its
     subject and the square thumb as its object. Keep new verbs in that shape;
     an object-first line ("Loveless was rated by…") breaks the scan even though
     it says the same thing. Album regular weight, people/artists bold, per the
     app-wide convention. */
  const line = e => {
    if (e.type === 'follow')   return `<b>${e.user}</b> started following <b>${e.artist}</b>`;
    if (e.type === 'playlist') return `<b>${e.user}</b> added <i>${e.album}</i> to <i>${e.playlist}</i>`;
    if (e.type === 'rating')   return `<b>${e.user}</b> rated <i>${e.album}</i>`;
    if (e.type === 'fav')      return `<b>${e.user}</b> favourited <i>${e.album}</i>`;
    if (e.type === 'listened') return `<b>${e.user}</b> logged <i>${e.album}</i>`;
    if (e.type === 'later')    return `<b>${e.user}</b> saved <i>${e.album}</i> for later`;
    return `<b>${e.user}</b> reviewed <i>${e.album}</i>`;
  };

  /* Engagement, on the row itself. ⚠️ This is the ONE place a feed row diverges
     from an inbox row, and it is deliberate: the point of the feed is other
     people's reviews, so you should be able to see that a review has traction —
     and add to it — without leaving home. It's still built from the SHARED
     vocabulary (`.ntf-foot` / `.ntf-acts` / `.v3-up`), not a home-only
     restyling of the row, so the two screens stay one component. The earlier
     attempt that "broke the resemblance" also added a star line and its own row
     spacing; this changes nothing about the row's anatomy.
     Only review/rating rows get it — there is nothing to comment on when
     someone favourited a record. */
  const acts = (e, n) => {
    if (e.type !== 'review' && e.type !== 'rating') return '';
    return `<div class="ntf-acts">
                      ${upvoteHtml(feedRevKey(e), e.likes || 0, 'v3-up--sm v3-up--feed')}
                      <button class="v3-up v3-up--sm v3-up--feed" type="button" aria-label="Comments"
                        onclick="event.stopPropagation(); feedOpen(${n})">${CMT_SVG}<span class="v3-up-n">${e.comments || 0}</span></button>
                    </div>`;
  };

  /* Row anatomy is the inbox's — avatar + badge · copy · time · trailing thumb.
     `.ntf-foot` holds the timestamp and (on review rows) the pills on one line;
     with no pills it's a flex row of one child, so an inbox row that adopts it
     looks exactly as it does now. */
  const row = (e, n) => {
    const face = e.face;
    return `
              <div class="ntf-row${e.fresh ? ' ntf-row--new' : ''}" onclick="event.stopPropagation(); feedOpen(${n})">
                <div class="ntf-ava" style="background-image:url('${face}')">
                  <span class="ntf-badge ntf-badge--${e.type}">
                    <svg viewBox="0 0 24 24" fill="currentColor">${BADGE[e.type]}</svg>
                  </span>
                </div>
                <div class="ntf-body">
                  <div class="ntf-text">${line(e)}</div>
                  ${e.type === 'review' && e.quote ? `<div class="ntf-quote">${e.quote}</div>` : ''}
                  <div class="ntf-foot">
                    <div class="ntf-time">${e.ago}</div>
                    ${acts(e, n)}
                  </div>
                </div>
                ${`<div class="ntf-art${e.type === 'follow' ? ' ntf-art--round' : ''}" style="background-image:url('${e.thumb}')" onclick="event.stopPropagation(); feedOpenArt(${n})"></div>`}
              </div>`;
  };

  // Same sticky time buckets as the inbox. The inbox authors its `bucket` by
  // hand; the feed's rows are generated, so they're bucketed off `ago`.
  const BUCKETS = [
    ['Today',     60 * 24],
    ['This week', 60 * 24 * 7],
    ['Earlier',   Infinity],
  ];
  let lo = -1;
  container.innerHTML = BUCKETS.map(([label, hi]) => {
    const rows = events
      .map((e, n) => [e, n])
      .filter(([e]) => agoMins(e.ago) > lo && agoMins(e.ago) <= hi);
    lo = hi;
    if (!rows.length) return '';
    return `
            <div class="ntf-group">
              <div class="ntf-group-hd">${label}</div>
              ${rows.map(([e, n]) => row(e, n)).join('')}
            </div>`;
  }).join('');
}

/* ── The scene — the face in the nav's scoop ────────────────
   Two characters in one 21×10 dot grid, drawn with SD_DOTS so they are the same
   rounded-square pixel as every other brand asset:

     · **the smile** — the app's face, back from the retired `.v3-ring--smile`
       dot formation. It is the resting state and what the scoop reads as at a
       glance.
     · **the kid** — headphones on, notes drifting off, nodding. A lofi-radio
       nod. He is the PAYOFF, not the default: he surfaces for a few seconds at a
       time and whenever something musical happens (`sceneCheer`).

   ⚠️ This replaced a cat mascot, which replaced a whole landscape. Both lost the
   same way — too much detail for a 63×30px box. The smile survives because it is
   three shapes; the kid survives because his eyes and mouth are unlit HOLES in a
   filled head rather than drawn features.

   ⚠️ Every frame must be 10 rows of 21 — paintScene() swaps the whole SVG per
   frame and nothing re-measures. Design new ones in dot-lab.html (toolbar →
   ◌ Dots); its `scene · *` presets carry these. */
const SCENE_FRAMES = {
  smile:   ['.....................',
            '.....xx.......xx.....',
            '.....xx.......xx.....',
            '.....................',
            '..x...............x..',
            '...x.............x...',
            '....x...........x....',
            '.....xx........xx....',
            '.......xxxxxxxx......',
            '.....................'],
  // eyes shut to a line
  blink:   ['.....................',
            '.....................',
            '.....xx.......xx.....',
            '.....................',
            '..x...............x..',
            '...x.............x...',
            '....x...........x....',
            '.....xx........xx....',
            '.......xxxxxxxx......',
            '.....................'],
  // one eye — keeps the idle from being a two-state flicker
  wink:    ['.....................',
            '.....xx..............',
            '.....xx.......xx.....',
            '.....................',
            '..x...............x..',
            '...x.............x...',
            '....x...........x....',
            '.....xx........xx....',
            '.......xxxxxxxx......',
            '.....................'],
  // The lofi kid: headphones on, notes drifting off. ⚠️ The head is 7 wide
  // so the eyes and mouth can be unlit HOLES in a filled shape — drawn
  // detail does not survive a 3px dot.
  kid:     ['..................x..',
            '..x...............x..',
            '..x..xxxxxxxxxxx.xx..',
            '.xx..x.xxxxxxx.x.....',
            '.....x.xx.x.xx.x.....',
            '.......xxx.xxx.......',
            '........xxxxx........',
            '.........xxx.........',
            '......xxxxxxxxx......',
            '.....xxxxxxxxxxx.....'],
  // …and the nod. The head drops a row and the neck goes with it.
  kidbob:  ['.................x...',
            '.................x...',
            '..x..............xx..',
            '.xx..xxxxxxxxxxx.....',
            '.....x.xxxxxxx.x.....',
            '.....x.xx.x.xx.x.....',
            '.......xxx.xxx.......',
            '........xxxxx........',
            '......xxxxxxxxx......',
            '.....xxxxxxxxxxx.....'],
};

/* Above the brand default of 0.56: at ~3px a cell, 0.56 gives sub-2px dots and
   the face reads as a smudge. Retune in dot-lab.html and paste back. */
const SCENE_OPTS = { cell: 8, dotFrac: 0.74, cornerFrac: 0.14, cls: 'sd-scene-svg' };

/* The idle rhythm. Mostly the smile, blinking now and then, and every third
   pass or so the kid puts his headphones on and nods for a few beats before the
   smile comes back. A face that moves constantly reads as broken rather than
   alive, so the still frames are long and the moving ones are short. */
const SCENE_LOOP = [
  ['smile', 3200], ['blink', 170], ['smile', 2600], ['wink', 260], ['smile', 3000],
  ['blink', 170], ['blink', 150], ['smile', 2400],
  // …and he tunes in
  ['kid', 620], ['kidbob', 300], ['kid', 560], ['kidbob', 300], ['kid', 620],
  ['kidbob', 300], ['kid', 700],
  ['smile', 3400], ['blink', 170], ['smile', 2800], ['wink', 260],
];
let _sceneStep = 0, _sceneT = null, _sceneBop = 0;

function paintScene(el, frame) {
  if (!window.SD_DOTS) return;
  el.innerHTML = SD_DOTS.svg(SCENE_FRAMES[frame] || SCENE_FRAMES.smile, SCENE_OPTS);
}

/* One shared clock paints every scene on screen — the viewer shows the dark and
   light shells side by side and two timers would visibly drift apart. */
function sceneTick() {
  clearTimeout(_sceneT);
  let frame, hold;
  if (Date.now() < _sceneBop) {
    // Reacting: hold the kid and alternate the nod, ignoring the loop's place.
    frame = (_sceneStep++ % 2) ? 'kidbob' : 'kid';
    hold = 260;
  } else {
    [frame, hold] = SCENE_LOOP[_sceneStep++ % SCENE_LOOP.length];
  }
  document.querySelectorAll('.sd-scene').forEach(el => paintScene(el, frame));
  _sceneT = setTimeout(sceneTick, Math.max(hold, 120));
}

/* Something musical happened (album swiped, CD tapped, For You picked) — the kid
   tunes in for a moment. Fired from reactRing, so the scoop reacts to exactly
   the same events as the live pill. The window is a TIMESTAMP the tick checks,
   so nothing has to clean it up. */
window.sceneCheer = function () {
  const first = Date.now() >= _sceneBop;
  _sceneBop = Date.now() + 1600;
  if (first) { _sceneStep = 0; sceneTick(); }   // cut to him now, don't wait out the current hold
};

function initScenes() {
  const els = document.querySelectorAll('.sd-scene');
  if (!els.length) return;
  els.forEach(el => paintScene(el, 'smile'));   // paint at once — never a blank box
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!_sceneT) sceneTick();
}

// ── Now-playing ticker: what friends are listening to right now ──
const NOW_WAVE_BARS = 5;

// Build the colorful waveform once per bar (structure is static; CSS animates it).
function buildNowWave(waveEl) {
  if (!waveEl || waveEl._built) return;
  waveEl._built = true;
  let html = '';
  for (let i = 0; i < NOW_WAVE_BARS; i++) {
    const delay = (i * 0.06).toFixed(2);
    const dur = (0.7 + (i % 5) * 0.13).toFixed(2);
    html += `<span class="v3-now-bar" style="animation-delay:${delay}s;animation-duration:${dur}s"></span>`;
  }
  waveEl.innerHTML = html;
}

// A shuffled handful of friends "currently listening" — song title is generated
// deterministically from the album (no real per-song data; mirrors songsFor()).
function nowFriends() {
  const src = window.FRIEND_ACTIVITY || [];
  return [...src].sort(() => Math.random() - 0.5).slice(0, 4).map(f => ({
    name: f.user,
    song: (songsFor({ album: f.album, tracks: 10 })[0] || {}).title || 'Untitled',
    album: f.album,
    artist: f.artist,
  }));
}

function paintNow(textEl, item) {
  if (!textEl || !item) return;
  textEl.innerHTML =
    `<span class="v3-now-name">${item.name}</span>` +
    `<span class="v3-now-song">${item.song}</span>` +
    `<span class="v3-now-album">${item.album}</span>` +
    `<span class="v3-now-artist">${item.artist}</span>`;
  fitNowText(textEl);
}

// Grow the ticker text to fill the pill when the names are short: bump font-size
// (and raise opsz alongside it) until the line nearly spans the available width.
// Long entries stay at the base size and just condense/ellipsize as before.
function fitNowText(textEl) {
  const MIN = 11.5, MAX = 16;
  const avail = textEl.clientWidth;
  if (!avail) return;                        // hidden instance — leave at base size
  let size = MIN;
  textEl.style.fontSize = size + 'px';
  while (size < MAX && textEl.scrollWidth < avail - 2) {
    size += 0.5;
    textEl.style.fontSize = size + 'px';
  }
  if (textEl.scrollWidth > avail && size > MIN) {
    size -= 0.5;
    textEl.style.fontSize = size + 'px';
  }
  const opsz = Math.max(25, Math.min(48, Math.round(size * 2.6)));
  textEl.style.fontVariationSettings = `'wdth' 25, 'opsz' ${opsz}`;
}

function renderNowBar(screenEl) {
  const bar = screenEl.querySelector('.v3-nowbar');
  if (!bar) return;
  const textEl = bar.querySelector('.v3-now-text');
  const waveEl = bar.querySelector('.v3-now-wave');
  buildNowWave(waveEl);

  const list = nowFriends();
  if (!list.length) return;

  if (screenEl._nowTimer) { clearInterval(screenEl._nowTimer); screenEl._nowTimer = null; }
  let i = 0;
  paintNow(textEl, list[i]);

  // Shuffle through friends if more than one is listening at once.
  if (list.length > 1) {
    screenEl._nowTimer = setInterval(() => {
      bar.classList.add('is-swapping');            // fade + lift out
      setTimeout(() => {
        i = (i + 1) % list.length;
        paintNow(textEl, list[i]);
        bar.classList.remove('is-swapping');       // fade back in
      }, 300);
    }, 4200);
  }
}

// ── Hand layout (left/right) ──────────────────────────────────
function getHand() { return localStorage.getItem('spindeck-hand') || 'left'; }
function applyHand(screenEl) {
  const left = getHand() === 'left';
  screenEl.classList.toggle('s-home-v3--left', left);
  const lbl = screenEl.querySelector('.v3-hand-label');
  if (lbl) lbl.textContent = left ? 'Left' : 'Right';
}
window.toggleHand = function () {
  localStorage.setItem('spindeck-hand', getHand() === 'left' ? 'right' : 'left');
  document.querySelectorAll('.s-home-v3').forEach(scr => {
    scr.classList.add('v3-hand-swapping');   // freeze the For You slide so it snaps, not floats
    applyHand(scr);                           // mirror the cells (instant) + morph the arrow dots
    requestAnimationFrame(() => requestAnimationFrame(() => scr.classList.remove('v3-hand-swapping')));
  });
};

// The album carousel: featured first, then trending. Main + For You are one apart.
function albumSeq() {
  const t = window.trendingAlbums || (window.ARCHIVE || []).slice(1, 6);
  const f = window.featuredAlbum || (window.ARCHIVE || [])[0];
  return f ? [f, ...t.filter(x => x !== f)] : t.slice();
}

// Move the main album to a sequence index; For You always shows the next one up.
function applyAlbumIndex(screenEl, idx, animateMain, animateForYou, backward, animateText = animateMain) {
  const seq = albumSeq();
  if (!seq.length) return;
  idx = ((idx % seq.length) + seq.length) % seq.length;
  preloadColors(seq, idx);   // this album ±2

  screenEl._albumIdx = idx;
  setMainAlbum(screenEl, seq[idx], animateMain, animateText);
  const forSingle = screenEl.querySelector('.v3-for-single');
  if (forSingle) {
    const nextIdx = (idx + 1) % seq.length;
    if (animateForYou) slideIn(forSingle, seq[nextIdx].image, backward);
    else forSingle.style.backgroundImage = `url('${seq[nextIdx].image}')`;
    preloadForYou(seq, nextIdx);
  }
}

function populateHomeData(screenEl) {
  applyProfColors(screenEl);   // no-op unless this is the profile card
  // Handle under the wordmark. Set here rather than in the markup because two of
  // the three headers live in static templates (see the note in screens.js), and
  // because this runs on every render — so it follows a persona switch.
  const handleEl = screenEl.querySelector('.v3-header-handle');
  if (handleEl) handleEl.textContent = '@' + ((window.PROFILE && window.PROFILE.handle) || 'you');

  const seq = albumSeq();
  if (!seq.length) return;
  preloadColors(seq, screenEl._albumIdx || 0);
  // Fresh render: the markup is right-handed and the stored hand pref lands a
  // frame after first paint — freeze the For You geometry transition so the box
  // appears in its spot instead of sliding across (Eric's #1 pet peeve).
  screenEl.classList.add('v3-hand-swapping');
  applyHand(screenEl);
  requestAnimationFrame(() => requestAnimationFrame(() => screenEl.classList.remove('v3-hand-swapping')));

  if (screenEl._albumIdx == null) screenEl._albumIdx = 0;
  const idx = ((screenEl._albumIdx % seq.length) + seq.length) % seq.length;
  screenEl._albumIdx = idx;

  setMainAlbum(screenEl, seq[idx], false);
  renderFriendFeed(screenEl);
  renderNowBar(screenEl);

  const forSingle = screenEl.querySelector('.v3-for-single');
  if (forSingle) {
    const nextIdx = (idx + 1) % seq.length;
    forSingle.style.backgroundImage = `url('${seq[nextIdx].image}')`;
    preloadForYou(seq, nextIdx);
    // Tapping For You promotes the queued album — same as swiping forward
    forSingle.onclick = (e) => { e.stopPropagation(); reactRing(screenEl, 'foryou'); applyAlbumIndex(screenEl, (screenEl._albumIdx || 0) + 1, true, true); };
  }

  setupAlbumSwipe(screenEl);
}

// Swipe the album art to move through albums: drag-left = next, drag-right = previous.
// The image follows the finger; past 45% of the album width it commits, else snaps back.
function setupAlbumSwipe(screenEl) {
  const album = screenEl.querySelector('.v3-album');
  if (!album || album._swipeInit) return;
  album._swipeInit = true;
  album.style.touchAction = 'pan-y';   // vertical scroll works normally; horizontal is cancelled below

  let startX = 0, startY = 0, progress = 0, width = 1;
  let active = false, decided = false, horizontal = false, dir = 0, targetIdx = 0, stepDir = 1;
  let cur = null, peek = null, fy = null, fyCur = null, fyPeek = null;

  // Ring (in the Live pill) reacts LIVE to the swipe: dots form a ring and partially rotate
  // as you drag, then complete a full spin on commit (or unwind on cancel) — tactile.
  let ringAngle = 0;
  function ringDrag(p) {
    const ring = screenEl.querySelector('.v3-ring');
    const spin = screenEl.querySelector('.v3-ring-spin');
    if (!ring) return;
    ring.classList.add('v3-ring--swipe');            // dots separate into the ring
    ringAngle = p * 210;                             // partial rotation tracks the finger
    if (spin) { spin.style.transition = 'none'; spin.style.transform = `rotate(${ringAngle}deg)`; }
  }
  function ringRelease(committed) {
    const ring = screenEl.querySelector('.v3-ring');
    const spin = screenEl.querySelector('.v3-ring-spin');
    if (!ring) return;
    if (spin) {
      spin.style.transition = 'transform 0.34s cubic-bezier(0.2,0.85,0.25,1)';
      spin.style.transform = `rotate(${committed ? ringAngle + (ringAngle >= 0 ? 360 : -360) : 0}deg)`;
    }
    setTimeout(() => {
      ring.classList.remove('v3-ring--swipe');       // dots reform the arrow the instant the spin lands
      if (spin) { spin.style.transition = ''; spin.style.transform = ''; }
    }, committed ? 340 : 300);
  }

  function buildLayers() {
    const seq = albumSeq();
    const idx = screenEl._albumIdx || 0;
    dir = progress < 0 ? -1 : 1;   // drag direction only (visual follows the finger): -1=left, +1=right
    // Which album the drag lands on depends on hand mode, since For You sits on the CD side:
    //   left-hand  (For You on the left):  drag-right → next, drag-left → previous
    //   right-hand (For You on the right): drag-left → next, drag-right → previous
    const leftHand = screenEl.classList.contains('s-home-v3--left');
    const step = leftHand ? (dir < 0 ? -1 : 1) : (dir < 0 ? 1 : -1);
    stepDir = step;   // +1 = forward/next, -1 = backward/previous (for the commit slide direction)
    targetIdx = (((idx + step) % seq.length) + seq.length) % seq.length;
    const basePct = dir < 0 ? 100 : -100;
    cur = document.createElement('div');
    cur.style.cssText = `position:absolute;inset:0;background:${album.style.backgroundImage} center/cover no-repeat;z-index:2;will-change:transform`;
    peek = document.createElement('div');
    peek.style.cssText = `position:absolute;inset:0;background:url('${seq[targetIdx].image}') center/cover no-repeat;z-index:3;will-change:transform;transform:translateX(${basePct}%)`;
    album.appendChild(cur);
    album.appendChild(peek);

    // For You box gets the same filmstrip: its own next-queued cover peeks in from the same
    // side as the drag, so you see its edge slide in live instead of it swapping after release.
    fy = screenEl.querySelector('.v3-for-single');
    if (fy) {
      const fyNextImg = seq[(targetIdx + 1) % seq.length].image;
      fyCur = document.createElement('div');
      fyCur.style.cssText = `position:absolute;inset:0;background:${fy.style.backgroundImage} center/cover no-repeat;z-index:2;will-change:transform`;
      fyPeek = document.createElement('div');
      fyPeek.style.cssText = `position:absolute;inset:0;background:url('${fyNextImg}') center/cover no-repeat;z-index:3;will-change:transform;transform:translateX(${basePct}%)`;
      fy.appendChild(fyCur);
      fy.appendChild(fyPeek);
    }
  }

  function render() {
    if (!cur) return;
    const basePct = dir < 0 ? 100 : -100;
    cur.style.transform  = `translateX(${progress * 100}%)`;
    peek.style.transform = `translateX(${basePct + progress * 100}%)`;
    if (fyCur) {
      fyCur.style.transform  = `translateX(${progress * 100}%)`;
      fyPeek.style.transform = `translateX(${basePct + progress * 100}%)`;
    }
  }

  function finish(committed) {
    if (!cur) { cleanup(); return; }
    const t = 'transform 0.28s cubic-bezier(0.4,0,0.2,1)';
    cur.style.transition = t; peek.style.transition = t;
    if (fyCur) { fyCur.style.transition = t; fyPeek.style.transition = t; }
    const basePct = dir < 0 ? 100 : -100;
    const offPct = dir < 0 ? -100 : 100;
    if (committed) {
      ringRelease(true);   // finish the full spin
      cur.style.transform  = `translateX(${offPct}%)`;
      peek.style.transform = 'translateX(0%)';
      if (fyCur) { fyCur.style.transform = `translateX(${offPct}%)`; fyPeek.style.transform = 'translateX(0%)'; }
      // recolour now (from cache), so the accent transitions in as the cover slides — no lag
      const ta = albumSeq()[targetIdx];
      if (ta) applyAlbumColorsUrl(screenEl, ta.image);
    } else {
      ringRelease(false);   // unwind back to the arrow
      cur.style.transform  = 'translateX(0%)';
      peek.style.transform = `translateX(${basePct}%)`;
      if (fyCur) { fyCur.style.transform = 'translateX(0%)'; fyPeek.style.transform = `translateX(${basePct}%)`; }
    }
    let done = false;
    const end = () => {
      if (done) return; done = true;
      const c = cur, p = peek, fc = fyCur, fp = fyPeek;
      cur = peek = fyCur = fyPeek = null;
      // animateForYou=false: we already filmstripped the For You box, so just set its final image.
      // animateText=true: still typewrite the new title/quote — the art was filmstripped, not the text.
      if (committed) applyAlbumIndex(screenEl, targetIdx, false, false, stepDir < 0, true);
      if (c) c.remove(); if (p) p.remove();
      if (fc) fc.remove(); if (fp) fp.remove();
    };
    peek.addEventListener('transitionend', end, { once: true });
    setTimeout(end, 380);
  }

  function cleanup() {
    active = decided = horizontal = false;
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onUp);
  }

  function onDown(e) {
    if (e.button != null && e.button > 0) return;
    if (cur) return;   // a previous swipe is still animating
    active = true; decided = false; horizontal = false; progress = 0;
    startX = e.clientX; startY = e.clientY;
    width = album.getBoundingClientRect().width || 1;   // rendered width (scale-safe)
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  }

  function onMove(e) {
    if (!active) return;
    const mx = e.clientX - startX, my = e.clientY - startY;
    if (!decided) {
      if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
      decided = true;
      horizontal = Math.abs(mx) > Math.abs(my) * 1.2;
      if (!horizontal) { cleanup(); return; }   // vertical → let it scroll
      progress = mx / width;
      buildLayers();
      album._swiped = true;
    }
    if (e.cancelable) e.preventDefault();
    progress = Math.max(-1, Math.min(1, mx / width));
    render();
    ringDrag(progress);
  }

  function onUp() {
    if (horizontal && cur) finish(Math.abs(progress) >= 0.33);
    setTimeout(() => { album._swiped = false; }, 60);   // let a real tap through afterwards
    cleanup();
  }

  album.addEventListener('pointerdown', onDown);
  album.addEventListener('mousedown', (e) => e.stopPropagation());  // don't start the viewer's drag-scroll
  // Cancel the browser's vertical scroll the moment a gesture is horizontal-dominant, so a
  // diagonal swipe doesn't drift the page down (and doesn't fire pointercancel, killing the
  // swipe). Vertical-dominant drags fall through and scroll natively.
  album.addEventListener('touchmove', (e) => {
    if (!active) return;
    const tt = e.touches && e.touches[0];
    if (!tt) return;
    const mx = tt.clientX - startX, my = tt.clientY - startY;
    if (Math.abs(mx) > 5 && Math.abs(mx) > Math.abs(my) * 1.2 && e.cancelable) e.preventDefault();
  }, { passive: false });
}

// Forward-only on purpose: For You always shows the album AFTER the current
// one, so there is nothing behind it to warm.
function preloadForYou(trending, fromIdx, count = 3) {
  for (let i = 1; i <= count; i++) {
    const img = new Image();
    img.src = trending[(fromIdx + i) % trending.length].image;
  }
}

// ── Apple Music 30-second previews (iTunes Search API via JSONP) ──────
// The iTunes Search API doesn't send CORS headers, so we use JSONP. Playing the
// returned previewUrl in an <audio> element needs no CORS. Browsers block autoplay
// with sound until a user gesture, so playback starts on the first tap.
const PREVIEW_CACHE = new Map();   // "artist – album" (lowercased) → previewUrl | null (miss)
let __jsonpSeq = 0;
function jsonp(url, timeout = 6000) {
  return new Promise((resolve) => {
    const cb = '__itp' + (++__jsonpSeq);
    const s = document.createElement('script');
    let settled = false;
    const done = (v) => { if (settled) return; settled = true; delete window[cb]; s.remove(); resolve(v); };
    window[cb] = (data) => done(data);
    s.onerror = () => done(null);
    s.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cb;
    document.head.appendChild(s);
    setTimeout(() => done(null), timeout);
  });
}

// In-flight dedupe: concurrent lookups for the same album share one request instead of
// firing parallel JSONP calls (mirrors COLOR_PENDING). Completed results land in PREVIEW_CACHE.
const PREVIEW_PENDING = new Map();
function fetchPreviewUrl(album) {
  const key = (album.artist + ' – ' + album.album).toLowerCase();
  if (PREVIEW_CACHE.has(key))   return Promise.resolve(PREVIEW_CACHE.get(key));
  if (PREVIEW_PENDING.has(key)) return PREVIEW_PENDING.get(key);
  const p = (async () => {
    let url = null;
    try {
      const term = encodeURIComponent(album.artist + ' ' + album.album);
      const ad = await jsonp(`https://itunes.apple.com/search?term=${term}&entity=album&limit=6`);
      const results = (ad && ad.results) || [];
      const wantAlbum = album.album.toLowerCase(), wantArtist = album.artist.toLowerCase();
      const pick = results.find(a => (a.collectionName || '').toLowerCase().includes(wantAlbum))
                || results.find(a => (a.artistName || '').toLowerCase().includes(wantArtist))
                || results[0];
      if (pick && pick.collectionId) {
        const sd = await jsonp(`https://itunes.apple.com/lookup?id=${pick.collectionId}&entity=song&limit=4`);
        const track = ((sd && sd.results) || []).find(s => s.wrapperType === 'track' && s.previewUrl);
        if (track) url = track.previewUrl;
      }
    } catch (e) { /* leave url null */ }
    PREVIEW_CACHE.set(key, url);
    PREVIEW_PENDING.delete(key);
    return url;
  })();
  PREVIEW_PENDING.set(key, p);
  return p;
}

// Previews are OFF by default. The speaker button arms "preview mode": the current album
// plays and each album previews as you swipe. The CD button pauses/resumes within the mode.
//
// Robustness model (the old version desynced on slow networks):
//   • PREVIEW.on / PREVIEW.paused are the ONLY source of truth for what the user wants.
//     The UI reflects INTENT, never <audio>.paused — that flag lags while buffering, which
//     is what made the speaker icon "invert" on 5G.
//   • PREVIEW.gen is a token bumped on every tap and every album change. A slow preview-URL
//     fetch captures the gen it started under and bails if the user has since tapped or
//     swiped — so a late fetch can't "come back" and start audio you already muted.
//   • The <audio> element is unlocked once, synchronously, inside the first tap gesture.
//     iOS only permits programmatic play() after that, so a URL that arrives later can
//     still start playing (this is why the first song refused to play before).
const PREVIEW = { audio: null, on: false, paused: false, gen: 0, unlocked: false, key: null };

function previewAudioEl() {
  if (!PREVIEW.audio) {
    const a = new Audio();
    a.loop = true; a.volume = 0.5; a.preload = 'auto';
    a.setAttribute('playsinline', '');   // iOS: stay inline, never go fullscreen
    PREVIEW.audio = a;
  }
  return PREVIEW.audio;
}

// A tiny silent WAV built at runtime (no risk of a bad base64 literal). Playing it inside a
// user gesture unlocks the element so later programmatic play() calls are allowed on iOS.
let __silentUrl = null;
function silentClipUrl() {
  if (__silentUrl) return __silentUrl;
  const sr = 8000, n = 400, buf = new ArrayBuffer(44 + n * 2), dv = new DataView(buf);
  const wr = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  wr(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); wr(8, 'WAVE');
  wr(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
  wr(36, 'data'); dv.setUint32(40, n * 2, true);   // sample bytes stay zero → silence
  return (__silentUrl = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
}
function unlockAudio(a) {
  if (PREVIEW.unlocked) return;
  try {
    a.src = silentClipUrl();
    const p = a.play();
    if (p) p.then(() => { PREVIEW.unlocked = true; }).catch(() => {});
    else PREVIEW.unlocked = true;
  } catch (e) { /* ignore */ }
}

function setPreviewUI() {
  const playing = PREVIEW.on && !PREVIEW.paused;   // intent, not audio.paused
  document.querySelectorAll('.s-home-v3').forEach(s => {
    s.classList.toggle('v3-preview-on', PREVIEW.on);   // speaker lit while armed
    s.classList.toggle('v3-cd-paused', !playing);      // CD frozen when off or paused
  });
}
// Only the tap handlers use this (a swipe passes its album explicitly). Prefer a VISIBLE
// home screen over whichever happens to be first in the DOM, so on mobile / multi-variant
// layouts the tap acts on the album the user is actually looking at.
function currentBentoAlbum() {
  const screens = document.querySelectorAll('.s-home-v3');
  for (const s of screens) if (s._album && s.offsetParent !== null) return s._album;
  return screens[0] && screens[0]._album;
}
function albumKey(album) { return album ? album.artist + ' – ' + album.album : null; }

// The single audio actuator. Plays the preview for a SPECIFIC album — a swipe passes the
// album it landed on, a tap passes the visible album — so it never guesses via the DOM and
// switching albums always loads the matching track. Everything that changes intent bumps gen
// and calls this; a stale fetch bails on the gen/key check instead of fighting current state.
const PREVIEWS_ENABLED = false;   // 30s previews disabled for now

async function playPreviewFor(album, gen) {
  const a = previewAudioEl();
  if (!PREVIEWS_ENABLED) { a.pause(); return; }
  if (!PREVIEW.on || PREVIEW.paused || !album) { a.pause(); return; }
  const key = albumKey(album);
  PREVIEW.key = key;
  // Resolve through the cache: a hit plays synchronously (best case: inside the tap gesture);
  // only a genuine miss (undefined) hits the network — a known miss (null) means no preview.
  let url = PREVIEW_CACHE.get(key.toLowerCase());
  if (url === undefined) url = await fetchPreviewUrl(album);
  // Bail if the user swiped again / muted / paused while the fetch was in flight (gen changed),
  // or a newer album change moved the target (key changed) — so a late result can't hijack audio.
  if (gen !== PREVIEW.gen || PREVIEW.key !== key || !PREVIEW.on || PREVIEW.paused) return;
  if (!url) { a.pause(); a.removeAttribute('src'); return; }
  if (a.src !== url) { a.src = url; a.currentTime = 0; }
  a.play().then(() => { PREVIEW.unlocked = true; }).catch(() => {});
  preloadPreviews(albumSeq(), album);
}

/* Warm the preview cache across the SAME window as preloadColors.
   ⚠️ This used to take the WHOLE queue — `seq.forEach(fetchPreviewUrl)` — which
   against a 100-album rec deal is 100 iTunes JSONP lookups fired at once. Its
   own comment claimed it mirrored preloadColors; it didn't, and the difference
   only stayed invisible because PREVIEWS_ENABLED is false. It would have landed
   the moment previews came back on. */
function preloadPreviews(seq, current) {
  if (!PREVIEW.on) return;
  const list = seq || [];
  if (!list.length) return;
  windowAround(list, Math.max(0, list.indexOf(current))).forEach(a => { if (a) fetchPreviewUrl(a); });
}
// Called on every album change (swipe). While muted it just warms the cache so a later
// unmute is instant; while armed it plays THIS album's preview (tied to the album passed in,
// not a DOM lookup — this is what makes swiping switch to the right track every time).
function loadPreview(album) {
  if (!PREVIEWS_ENABLED) return;
  if (!album) return;
  if (!PREVIEW.on) { fetchPreviewUrl(album); return; }   // muted: warm the cache for later
  playPreviewFor(album, ++PREVIEW.gen);
}

// Speaker → arm / disarm preview mode.
window.togglePreviewMode = function (e) {
  if (e) e.stopPropagation();
  if (!PREVIEWS_ENABLED) return;
  const a = previewAudioEl();
  if (PREVIEW.on) {                    // → OFF
    PREVIEW.on = false; PREVIEW.paused = false; PREVIEW.gen++;
    a.pause();
  } else {                             // → ON
    PREVIEW.on = true; PREVIEW.paused = false;
    unlockAudio(a);                    // must run inside this gesture
    playPreviewFor(currentBentoAlbum(), ++PREVIEW.gen);
  }
  setPreviewUI();
};
// CD → pause / resume within preview mode (arms the mode if it's off).
window.togglePreview = function (e) {
  if (e) e.stopPropagation();
  if (!PREVIEWS_ENABLED) return;
  if (!PREVIEW.on) { window.togglePreviewMode(); return; }
  PREVIEW.paused = !PREVIEW.paused;
  playPreviewFor(currentBentoAlbum(), ++PREVIEW.gen);
  setPreviewUI();
};

// ── Album colour extraction + cache ───────────────────────────
// Palettes are cached by image URL and precomputed for the whole album window
// (mirroring the image preload), so swiping applies a ready palette synchronously
// instead of extracting on arrival — no fallback flash.
const COLOR_CACHE   = new Map();   // image url → { accent, box1, box2, box1color }
const COLOR_PENDING = new Map();   // image url → in-flight Promise (dedupe concurrent loads)

// ROYGBIV hue buckets — perceptual ranges (not equal 360/7 slices), index 0=red … 6=violet.
// Red wraps around 0°. Used to vote for the album's dominant hue family by pixel area.
function hueBucket(h) {
  if (h < 15 || h >= 345) return 0;   // red
  if (h < 45)  return 1;              // orange
  if (h < 70)  return 2;              // yellow
  if (h < 165) return 3;             // green
  if (h < 255) return 4;             // blue
  if (h < 290) return 5;             // indigo
  return 6;                          // violet
}
// HSV → RGB.  h∈[0,360)  s,v∈[0,1]  →  [r,g,b] in 0..255
function hsv2rgb(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  let r, g, b;
  if (h < 60)       [r,g,b] = [c,x,0];
  else if (h < 120) [r,g,b] = [x,c,0];
  else if (h < 180) [r,g,b] = [0,c,x];
  else if (h < 240) [r,g,b] = [0,x,c];
  else if (h < 300) [r,g,b] = [x,0,c];
  else              [r,g,b] = [c,0,x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// Extract the palette for one image URL. Resolves from cache instantly if present,
// dedupes concurrent extractions, and never rejects: on a tainted canvas (file://) or
// load error it resolves null so callers keep the CSS defaults.
function computeAlbumColors(url) {
  if (!url) return Promise.resolve(null);
  if (COLOR_CACHE.has(url))   return Promise.resolve(COLOR_CACHE.get(url));
  if (COLOR_PENDING.has(url)) return COLOR_PENDING.get(url);

  const p = new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(null);
    img.onload = () => {
      try {
        const sz = 48;
        const cv = document.createElement('canvas');
        cv.width = cv.height = sz;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0, sz, sz);
        const d = ctx.getImageData(0, 0, sz, sz).data;

        // Pass 1: greyscale stats + a 7-bucket ROYGBIV hue histogram of the COLOURED pixels.
        // The dominant hue is chosen by AREA ALONE (no saturation/brightness weighting) — that
        // is what stops mixed covers collapsing into one homogenous brown. Saturation/brightness
        // only come in afterwards, to shape the representative colour inside the winning bucket.
        let tR = 0, tG = 0, tB = 0, n = 0;   // overall average (greyscale detection)
        let satSum = 0, darkCount = 0;         // colourfulness + how much of the cover is near-black
        const SATFLOOR = 0.12;                 // below this a pixel is near-grey → hue is noise, no vote
        const NB = 7;
        const hCount = new Array(NB).fill(0);              // AREA vote per hue bucket
        const hSin = new Array(NB).fill(0), hCos = new Array(NB).fill(0);   // count-weighted hue (circular mean)
        const sW = new Array(NB).fill(0), s2 = new Array(NB).fill(0), vW = new Array(NB).fill(0); // sat/val, sat-weighted
        for (let i = 0; i < d.length; i += 4) {
          if (d[i+3] < 120) continue;
          const r = d[i], g = d[i+1], b = d[i+2];
          const mx = Math.max(r,g,b), mn = Math.min(r,g,b), dd = mx - mn;
          const sat = mx ? dd/mx : 0;
          const val = mx / 255;
          const lum = (mx+mn)/510;
          tR += r; tG += g; tB += b; n++;
          satSum += sat;
          if (lum <= 0.05 || (sat < SATFLOOR && lum < 0.22)) darkCount++;   // near-black / very-dark neutral
          if (sat < SATFLOOR || lum <= 0.05 || lum >= 0.97) continue;   // only vivid-enough pixels vote a hue
          let h = 0;
          if (dd) { h = (mx===r) ? ((g-b)/dd)%6 : (mx===g) ? (b-r)/dd+2 : (r-g)/dd+4; h *= 60; if (h < 0) h += 360; }
          const bk = hueBucket(h), rad = h * Math.PI/180;
          hCount[bk] += 1;                     // pure area — one pixel, one vote
          hSin[bk] += Math.sin(rad); hCos[bk] += Math.cos(rad);
          sW[bk] += sat; s2[bk] += sat*sat; vW[bk] += val*sat;
        }
        if (!n) { resolve(null); return; }

        const meanSat = satSum / n;                  // ~0 greyscale · ~0.3+ colourful
        const votes = hCount.reduce((a,c)=>a+c, 0);  // how many pixels had a real hue
        const darkFrac = darkCount / n;              // black-dominant covers → neutral grey, not mud
        const cl  = v => Math.max(0, Math.min(255, Math.round(v)));
        const hex = v => cl(v).toString(16).padStart(2,'0');

        let accent, b1r, b1g, b1b, box1, box2;

        if (meanSat < 0.10 || votes < n * 0.02) {
        // ── Near-greyscale cover → stay dark, but carry the cover's subtle tint ──
        // B&W covers still lean faintly warm (sepia/film) or cool (silver/cyanotype).
        // Pull that cast out of the mean colour and amplify it onto a FIXED dark box,
        // rather than tracking brightness — everything stays dark-themed, just tinted.
        const aR = tR / n, aG = tG / n, aB = tB / n;      // mean colour (near-grey)
        const grey = (aR + aG + aB) / 3;
        const rawR = aR - grey, rawG = aG - grey, rawB = aB - grey;   // signed tint direction

        const darkBase = 34;                       // constant dark box — no brightness tracking
        const boxAmp = 3.4;                        // exaggerate the faint cast so it reads
        b1r = darkBase + rawR * boxAmp;
        b1g = darkBase + rawG * boxAmp;
        b1b = darkBase + rawB * boxAmp;
        box1 = `linear-gradient(155deg,rgb(${cl(b1r)},${cl(b1g)},${cl(b1b)}),rgb(${cl(b1r+8)},${cl(b1g+8)},${cl(b1b+8)}))`;
        box2 = `linear-gradient(155deg,rgb(${cl(18+rawR*1.3)},${cl(18+rawG*1.3)},${cl(22+rawB*1.3)}),rgb(${cl(24+rawR*1.3)},${cl(24+rawG*1.3)},${cl(30+rawB*1.3)}))`;

        const aBase = 172;                         // fixed readable lightness, tinted to match
        const accAmp = 4.6;
        accent = `#${hex(aBase + rawR * accAmp)}${hex(aBase + rawG * accAmp)}${hex(aBase + rawB * accAmp)}`;
      } else if (darkFrac >= 0.33) {
        // ── Black-dominant / high-contrast cover → NEUTRAL grey ──
        // e.g. a black cover with a vivid accent (black + yellow). The dark tone dominates,
        // and averaging it WITH the accent is exactly what made the muddy brown — so render a
        // clean neutral grey bento with no hue tint at all.
        b1r = 42; b1g = 42; b1b = 46;
        box1 = `linear-gradient(155deg,rgb(42,42,46),rgb(50,50,55))`;
        box2 = `linear-gradient(155deg,rgb(22,22,26),rgb(28,28,33))`;
        accent = '#b9b9c1';
      } else {
        // ── Colourful cover → dominant ROYGBIV hue → representative accent ──
        // Winning bucket = most pixel area. On a tie, >= resolves to the HIGHER bucket
        // (violet-ward), per spec ("in even numbers take the highest one").
        let dom = 0;
        for (let k = 1; k < NB; k++) if (hCount[k] >= hCount[dom]) dom = k;
        // Representative colour of that hue family:
        //   hue  = circular mean of the bucket's pixels
        //   sat  = Σsat²/Σsat  (leans toward the family's more vivid pixels, not the muddy ones)
        //   val  = Σ(val·sat)/Σsat  (brightness of the coloured pixels, not the dark background)
        let Hd = Math.atan2(hSin[dom], hCos[dom]) * 180/Math.PI; if (Hd < 0) Hd += 360;
        let Sd = sW[dom] ? s2[dom]/sW[dom] : 0.5;
        let Vd = sW[dom] ? vW[dom]/sW[dom] : 0.6;
        Sd = Math.max(0.42, Math.min(1, Sd));       // floors keep the bento from sliding back to mud
        Vd = Math.max(0.45, Math.min(1, Vd));
        const rep = hsv2rgb(Hd, Sd, Vd);
        const ar = rep[0], ag = rep[1], ab = rep[2];
        let bAR = ar, bAG = ag, bAB = ab;
        const aLum = (Math.max(bAR,bAG,bAB) + Math.min(bAR,bAG,bAB)) / 510;
        if (aLum < 0.55) {                          // boost so the score reads on dark
          const scale = 0.65 / Math.max(aLum, 0.05);
          bAR = Math.min(255, bAR*scale); bAG = Math.min(255, bAG*scale); bAB = Math.min(255, bAB*scale);
        }
        accent = `#${hex(bAR)}${hex(bAG)}${hex(bAB)}`;
        b1r = Math.min(90, ar*0.30+22);
        b1g = Math.min(72, ag*0.22+14);
        b1b = Math.min(80, ab*0.28+16);
        const b2r = Math.min(35, (255-ar)*0.10+4);
        const b2g = Math.min(35, (255-ag)*0.10+4);
        const b2b = Math.min(55, (255-ab)*0.15+8);
        box1 = `linear-gradient(155deg,rgb(${cl(b1r)},${cl(b1g)},${cl(b1b)}),rgb(${cl(Math.min(b1r+12,65))},${cl(Math.min(b1g+8,45))},${cl(Math.min(b1b+8,45))}))`;
        box2 = `linear-gradient(155deg,rgb(${cl(b2r)},${cl(b2g)},${cl(b2b)}),rgb(${cl(Math.min(b2r+6,40))},${cl(Math.min(b2g+6,40))},${cl(Math.min(b2b+14,65))}))`;
      }

        // ── Light-theme palette: same extracted hue, but tinted onto the cream bg ──
        // instead of a dark box. Mix the accent toward #f0ece3 so the box reads as a
        // pale wash of the album colour — a slight lift over the dark theme's boxes.
        const ah = accent.replace('#','');
        const AR = parseInt(ah.slice(0,2),16), AG = parseInt(ah.slice(2,4),16), AB = parseInt(ah.slice(4,6),16);
        const CR = 240, CG = 236, CB = 227;              // #f0ece3 cream
        const mixC = (c, a, t) => Math.round(c*(1-t) + a*t);
        const t1 = 0.44;                                  // box1 — the visible tint
        const L1r = mixC(CR,AR,t1), L1g = mixC(CG,AG,t1), L1b = mixC(CB,AB,t1);
        const t2 = 0.25;                                  // box2 — subtler, cooler wash
        const L2r = mixC(CR,AR,t2), L2g = mixC(CG,AG,t2), L2b = mixC(CB,AB,t2);
        const box1L = `linear-gradient(155deg,rgb(${cl(L1r+6)},${cl(L1g+6)},${cl(L1b+6)}),rgb(${cl(L1r-6)},${cl(L1g-6)},${cl(L1b-6)}))`;
        const box2L = `linear-gradient(155deg,rgb(${cl(L2r+5)},${cl(L2g+5)},${cl(L2b+7)}),rgb(${cl(L2r-4)},${cl(L2g-4)},${cl(L2b-2)}))`;

        /* The RATING colour, separate from the bento accent. A greyscale or
           black-dominant cover deliberately extracts to a neutral (the
           darkFrac branch hard-codes #b9b9c1) — right for the box, dreadful for
           the vinyls, which just go grey. So the star falls back to the house
           gold whenever the accent has too little colour in it to read as a
           deliberate choice. `accent` itself is left alone: the boxes still want
           the neutral. */
        const star = (() => {
          const h = accent.replace('#', '');
          const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
          const sat = mx ? (mx - mn) / mx : 0;
          return sat < 0.22 ? '#e8a83c' : accent;
        })();

        const colors = {
          accent, star, box1, box2,
          box1color: `rgb(${cl(b1r)},${cl(b1g)},${cl(b1b)})`,
          box1L, box2L,
          box1colorL: `rgb(${L1r},${L1g},${L1b})`,
        };
        COLOR_CACHE.set(url, colors);
        resolve(colors);
      } catch (e) { resolve(null); /* CORS / tainted canvas — keep CSS defaults */ }
    };
    /* Personas serve their covers from Deezer's CDN. Reading pixels back out of
       a canvas that has drawn a cross-origin image throws SecurityError, so the
       extraction silently failed and every persona album fell back to the
       hard-coded flood colour. Request CORS for absolute URLs; the CDN sends
       Access-Control-Allow-Origin. If it ever doesn't, the load errors and we
       resolve(null) — the artwork itself still renders, because CSS
       background-image never needed CORS in the first place. */
    if (/^https?:/i.test(url)) img.crossOrigin = 'anonymous';
    img.src = url;
  });
  COLOR_PENDING.set(url, p);
  p.then(() => COLOR_PENDING.delete(url));
  return p;
}

function applyColorVars(screenEl, c) {
  if (!screenEl || !c) return;
  screenEl.style.setProperty('--v3-accent', c.accent);
  // Ratings read --v3-star, not --v3-accent — see the `star` note in computeAlbumColors.
  screenEl.style.setProperty('--v3-star', c.star || c.accent);
  // Bento + fullscreen use the SAME album-derived color in both themes (dark values),
  // so the light theme no longer lightens the bento/review flood.
  screenEl.style.setProperty('--v3-box1-bg', c.box1);
  screenEl.style.setProperty('--v3-box2-bg', c.box2);
  screenEl.style.setProperty('--v3-box1-color', c.box1color);
}

// Apply the palette for a KNOWN image URL. Uses the album's own (relative) image, which
// matches the preload cache key — so it lands synchronously instead of re-extracting under
// the absolute URL getComputedStyle returns (that mismatch is what made colours lag a swipe).
function applyAlbumColorsUrl(screenEl, url) {
  if (!screenEl || !url) return;
  if (COLOR_CACHE.has(url)) { applyColorVars(screenEl, COLOR_CACHE.get(url)); return; }
  computeAlbumColors(url).then(c => { if (c) applyColorVars(screenEl, c); });
}

// Colour the bento from the cover on .v3-album. A cached palette applies synchronously
// (the common case after preload — no flash); a cold cover extracts once, then applies,
// guarding against the album changing mid-extract.
function applyAlbumColors(screenEl) {
  const albumEl = screenEl && screenEl.querySelector('.v3-album');
  if (!albumEl) return;
  const bg = getComputedStyle(albumEl).backgroundImage;
  const m  = bg.match(/url\(['"]?([^'"]+?)['"]?\)/);
  if (!m) return;
  const url = m[1];
  if (COLOR_CACHE.has(url)) { applyColorVars(screenEl, COLOR_CACHE.get(url)); return; }
  computeAlbumColors(url).then(c => {
    if (!c) return;
    const now = getComputedStyle(albumEl).backgroundImage;   // still the same cover?
    if (now.indexOf(url) !== -1) applyColorVars(screenEl, c);
  });
}

// Procedurally colour the profile base to match the profile image. Reuses the
// album-cover extractor to get a representative accent, takes its hue, and feeds
// profBaseColors() so the embossed card echoes the picture's colour scheme.
// Applied to every .s-prof2 instance so the dark + light variants stay matched.
// Rebuild the name-banner path with its right-side anchor points shifted by `dx`
// SVG units (the move Eric described as "drag the right points to the right").
function profNameTabPath(dx) {
  const x = n => (n + dx).toFixed(3);
  return `M0.500122 69H${x(409.862)}H${x(386.803)}C${x(369.967)} 69 ${x(354.261)} 57.1754 ${x(345.016)} 43.105L${x(328.872)} 18.5347C${x(321.476)} 7.27835 ${x(308.911)} 0.5 ${x(295.443)} 0.5H35.5001C16.1702 0.5 0.500122 16.17 0.500122 35.5V69Z`;
}

// Size the pill (and the banner around it) so the right edge clears the username.
// Measures the rendered label, converts px → SVG units, then slides the banner's
// right edge (path) and the pill's right edge (div width) out together via one `dx`.
function sizeProfName(screenEl) {
  const canvas = screenEl && screenEl.querySelector('.prof-canvas');
  const lbl  = screenEl && screenEl.querySelector('.prof-name-tab-lbl');
  const tab  = screenEl && screenEl.querySelector('.prof-name-tab');
  const pill = screenEl && screenEl.querySelector('.prof-name-pill');
  if (!canvas || !lbl || !tab || !pill) return;
  const cw = canvas.offsetWidth;
  if (!cw) return;
  const u = 690 / cw;                              // px → SVG units
  const textUnits = lbl.offsetWidth * u;
  const labelLeft = 0.06 * 690;                    // .prof-name-tab-lbl left (6%) in units
  const padR = 18;                                 // gap from text end to the pill's straight-edge point
  // The pill's right straight point sits at 295.502 by default; push it to
  // labelLeft + text + padR when wider. The banner's anchor (295.443) shares the
  // same dx, so tab + pill grow together. Clamp so the slanted tab stays on-canvas.
  const dx = Math.max(0, Math.min(270, labelLeft + textUnits + padR - 295.502));
  tab.setAttribute('d', profNameTabPath(dx));
  // Pill div: left is 16.0403u, right cap reaches 314.351u+dx → width in %.
  pill.style.width = ((314.351 + dx - 16.0403) / 690 * 100).toFixed(2) + '%';
}

function applyProfColors(screenEl) {
  sizeProfName(screenEl);
  const pic = screenEl && screenEl.querySelector('.prof-pic');
  if (!pic) return;
  const bg = getComputedStyle(pic).backgroundImage;
  const m = bg.match(/url\(['"]?([^'"]+?)['"]?\)/);
  if (!m) return;
  const url = m[1];
  computeAlbumColors(url).then(c => {
    if (!c || !c.accent) return;
    if (getComputedStyle(pic).backgroundImage.indexOf(url) === -1) return;   // still same pic?
    const hx = c.accent.replace('#', '');
    const r = parseInt(hx.slice(0, 2), 16) / 255, g = parseInt(hx.slice(2, 4), 16) / 255, b = parseInt(hx.slice(4, 6), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dd = mx - mn;
    if (mx === 0 || dd / mx < 0.12) return;   // near-greyscale → keep the neutral default base
    let h = 0;
    if (dd) { h = (mx === r) ? ((g - b) / dd) % 6 : (mx === g) ? (b - r) / dd + 2 : (r - g) / dd + 4; h *= 60; if (h < 0) h += 360; }
    const cols = window.profBaseColors(Math.round(h));
    document.querySelectorAll('.s-prof2').forEach(el => { for (const k in cols) el.style.setProperty(k, cols[k]); });
  });
}

// Warm the palette cache for every album in the window (mirrors preloadForYou).
/* Extract the accent colour for a WINDOW of the sequence, not all of it.
   Each call loads the image and runs it through a canvas; with a persona's
   ~28 remote Deezer covers, doing the whole sequence on every swipe meant 28
   fetches per index change. computeAlbumColors memoises, so a 5-wide window
   walking forward still has every cover ready by the time you reach it. */
/* ── The loaded window ────────────────────────────────────────
   The rec queue is ~100 albums, but only ever a handful are LOADED: the queue
   carries identity (title / artist / cover url / deezerId), and the expensive
   parts — the cover bitmap, its extracted palette, the preview lookup, the rest
   of the metadata — are pulled in a small window around the current index. That
   is what keeps a 100-album shelf usable on a low-end phone; you only hit it by
   swiping faster than the window can refill.

   ⚠️ The window is SYMMETRIC. It used to run `idx … idx+4` — five ahead, none
   behind — so swiping BACKWARD always landed on a cold palette and flashed the
   fallback colour. Same budget, spread either side. */
const PRELOAD_BACK = 2, PRELOAD_FWD = 2;

// Window helper: the albums around `at`, wrapped. Shared so the colour and
// preview warmers can't drift apart again.
function windowAround(list, at, back = PRELOAD_BACK, fwd = PRELOAD_FWD) {
  const out = [];
  if (!list || !list.length) return out;
  for (let d = -back; d <= fwd; d++) {
    out.push(list[(((at + d) % list.length) + list.length) % list.length]);
  }
  return out;
}

function preloadColors(seq, fromIdx = 0) {
  windowAround(seq, fromIdx).forEach(a => { if (a && a.image) computeAlbumColors(a.image); });
}

function renderSingle() {
  const c = document.getElementById('phone-container');
  const s = currentScreen();

  // Always lay out as a 2-up (dark + light) so the phone is the SAME size on every page
  // and doesn't jump when switching. Pages with one variant just fill the left slot.
  c.className = 'multi-variant';
  const n      = Math.max(s.variants.length, 2);
  const scaleH = (c.clientHeight - 70) / 852;
  const scaleW = (c.clientWidth  / n - 20) / 393;
  const scale  = Math.min(scaleH, scaleW, 0.88);
  const dead   = 852 * (scale - 1);
  const curr   = getVariantIdx(s);

  c.innerHTML = s.variants.map((v, i) => `
    <div class="var-col ${i === curr ? 'var-active' : ''}" onclick="pickVariant('${s.id}',${i})">
      <div class="var-label">${v.version || v.label}</div>
      <div class="phone-wrap" style="transform:scale(${scale});margin-top:${dead/2}px;margin-bottom:${dead/2}px">
        ${buildPhoneHTML(s, v)}
      </div>
      <div class="var-sublabel">${v.label}</div>
    </div>`
  ).join('');
  initDragScroll(c);
}

// ── Drag-to-scroll for multi-variant view ────────────────────
function initDragScroll(el) {
  if (el._dragInit) return;
  el._dragInit = true;

  el.addEventListener('mousedown', e => {
    const startX     = e.clientX;
    const scrollLeft = el.scrollLeft;
    _dragActive = false;

    const move = e2 => {
      const dx = e2.clientX - startX;
      if (Math.abs(dx) > 4) _dragActive = true;
      if (_dragActive) el.scrollLeft = scrollLeft - dx;
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      el.style.userSelect = '';
      el.classList.remove('is-grabbing');
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    el.style.userSelect = 'none';
    el.classList.add('is-grabbing');
  });

  el.addEventListener('click', e => {
    if (_dragActive) { e.stopPropagation(); _dragActive = false; }
  }, true);
}

window.pickVariant = function(screenId, idx) {
  if (_dragActive) return;
  // No-op when the clicked column is already the active variant — a bubbled
  // click would otherwise re-render the screen and wipe in-page state
  // (open menus, tab selection).
  const s = SCREENS.find(x => x.id === screenId);
  if (s && getVariantIdx(s) === idx) return;
  setVariant(screenId, idx);
};

function renderMulti() {
  const container = document.getElementById('phone-container');
  container.className = 'multi';
  const cols   = Math.min(SCREENS.length, Math.floor(container.clientWidth / 220));
  const scaleH = (container.clientHeight - 80) / 852;
  const scaleW = (container.clientWidth / cols - 32) / 393;
  const scale  = Math.min(scaleH, scaleW, 0.55);
  const dead   = 852 * (scale - 1);

  container.innerHTML = SCREENS.map((s, i) => `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div class="phone-wrap" style="transform:scale(${scale});margin-top:${dead/2}px;margin-bottom:${dead/2}px"
           onclick="goToScreen(${i})">
        ${buildPhoneHTML(s)}
      </div>
      <div class="phone-multi-label">${s.name}</div>
    </div>
  `).join('');
}

function buildPhoneHTML(screen, variant) {
  const v = variant || getVariant(screen);
  return `
  <div class="phone-frame">
    <div class="side-btn action"></div>
    <div class="side-btn vol-up"></div>
    <div class="side-btn vol-dn"></div>
    <div class="side-btn power"></div>
    <div class="phone-screen">
      <div class="status-bar ${screen.statusTheme === 'dark' ? 'dark-icons' : ''}">
        <div class="sb-time">9:41</div>
        <div class="dynamic-island"></div>
        <div class="sb-icons">${SVG_SIGNAL}${SVG_WIFI}${SVG_BATTERY}</div>
      </div>
      <div class="screen-content">${v.html}</div>
      <div class="home-indicator"></div>
    </div>
  </div>`;
}

function setPhoneScale() {
  if (viewMode !== 'single') return;
  const container = document.getElementById('phone-container');
  const wrap = document.querySelector('.phone-wrap');
  if (!wrap || !container) return;
  const scale = Math.min((container.clientHeight - 32) / 852, (container.clientWidth - 40) / 393, 1.0);
  const dead  = 852 * (scale - 1);
  wrap.style.transform    = `scale(${scale})`;
  wrap.style.marginTop    = dead / 2 + 'px';
  wrap.style.marginBottom = dead / 2 + 'px';
}

function renderThumbs() {
  renderPageNav();
  renderVariantBar();
}

// The demo nav is decoupled from SCREENS: some entries are real screens, others
// (search / album / artist / review) launch the live in-app flow they now live
// in (they're no longer standalone screens). `flow:true` marks the latter.
const NAV_PAGES = [
  { id: 'auth',       label: 'Auth / Login'  },
  { id: 'onboarding', label: 'Onboarding'    },
  { id: 'home',       label: 'Home'          },
  { id: 'wall',       label: 'Album Wall'    },
  { id: 'search',     label: 'Search',        flow: true },
  { id: 'album',      label: 'Album Page',    flow: true },
  { id: 'artist',     label: 'Artist Page',   flow: true },
  { id: 'song',       label: 'Song / Track'  },
  // No 'Review' entry: the fullscreen review state it opened is gone, so it
  // would just be a second button for Album Page.
  { id: 'profile',      label: 'Profile'       },
  { id: 'profile-edit', label: 'Edit Profile'  },
  { id: 'playlists',    label: 'Playlists'     },
  { id: 'playlist-new', label: 'New Playlist'  },
  { id: 'playlist',     label: 'Playlist Page' },
  { id: 'notifications',label: 'Notifications' },
  { id: 'settings',     label: 'Settings'      },
];
let activeNavId = 'home';

function renderPageNav() {
  const nav = document.getElementById('page-nav');
  if (!nav) return;
  nav.innerHTML = NAV_PAGES.map(p =>
    `<button class="pnav-btn ${p.id === activeNavId ? 'active' : ''}${p.flow ? ' pnav-flow' : ''}" onclick="navPage('${p.id}')">${p.label}</button>`
  ).join('') + `
    <div class="pnav-divider"></div>
    <button class="pnav-btn pnav-multi ${viewMode === 'multi' ? 'multi-active' : ''}" onclick="toggleMulti()">⊞ Multi</button>
  `;
}

// Left-nav click: open a real screen, or fire the live flow for the pages that
// are now sub-states of the home shell.
window.navPage = function (id) {
  activeNavId = id;
  const goScreen = sid => { const i = SCREENS.findIndex(s => s.id === sid); if (i !== -1) goToScreen(i); };
  const arc = window.ARCHIVE || [];
  const feat = window.featuredAlbum || arc[0];
  switch (id) {
    case 'search':
      goScreen('home');
      requestAnimationFrame(() => window.openSearch(document.querySelector('#phone-container .app-screen')));
      break;
    case 'album':
      if (feat) window.openAlbumPage(feat);
      break;
    case 'artist':
      if (feat) window.openArtistPageFor(feat.artist);
      break;
    case 'review':                       // legacy id — the album page is what it meant
      if (feat) window.openAlbumPage(feat);
      break;
    default:
      goScreen(id);
  }
  renderPageNav();   // reflect the active state now (live flows re-render async)
};

// Ensure the home shell is showing, then run fn on each home-shell instance.
function goHomeThenShells(fn) {
  if (currentScreen().id === 'home' && homeShells().length) { homeShells().forEach(fn); return; }
  navigate('home');
  requestAnimationFrame(() => requestAnimationFrame(() => homeShells().forEach(fn)));
}

function updateToolbar() {
  const s = currentScreen();
  document.getElementById('lbl-name').textContent = s.name;
  document.getElementById('lbl-idx').textContent  = `${currentIdx + 1} / ${SCREENS.length}`;
  document.getElementById('btn-prev').disabled = currentIdx === 0;
  document.getElementById('btn-next').disabled = currentIdx === SCREENS.length - 1;
}

// ── Variant switcher (bottom tray) ───────────────────────────
function renderVariantBar() {
  const bar = document.getElementById('thumb-tray');
  if (!bar) return;
  const s   = currentScreen();
  const curr = getVariantIdx(s);
  if (s.variants.length <= 1) { bar.innerHTML = ''; return; }
  bar.innerHTML = s.variants.map((v, i) =>
    `<button class="vpill ${i === curr ? 'active' : ''}" onclick="setVariant('${s.id}',${i})">${v.label}</button>`
  ).join('');
}

window.setVariant = function(screenId, idx) {
  variantState[screenId] = idx;
  renderViewer();
};

// ── Navigation ───────────────────────────────────────────────
function navigatePrev() { if (currentIdx > 0) { currentIdx--; activeNavId = currentScreen().id; renderViewer(); } }
function navigateNext() { if (currentIdx < SCREENS.length - 1) { currentIdx++; activeNavId = currentScreen().id; renderViewer(); } }

function goToScreen(idx) {
  if (viewMode === 'multi') viewMode = 'single';
  currentIdx = idx;
  activeNavId = SCREENS[idx] ? SCREENS[idx].id : activeNavId;
  // A persona has an AUTHORED profile — re-rolling the random one would wipe it.
  if (SCREENS[idx] && SCREENS[idx].id === 'profile' && !window.ACTIVE_PERSONA) randomizeProfile();
  renderViewer();
}

window.toggleMulti = function() {
  viewMode = viewMode === 'multi' ? 'single' : 'multi';
  renderViewer();
};

// ── Zoom ─────────────────────────────────────────────────────
let zoomLevel = 1;
const ZOOM_STEP = 0.25;
const ZOOM_MIN  = 0.25;
const ZOOM_MAX  = 4;

function setZoom(level) {
  zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, level));
  document.getElementById('phone-container').style.zoom = zoomLevel;
  document.getElementById('lbl-zoom').textContent = Math.round(zoomLevel * 100) + '%';
}

function shuffleAlbums() {
  reshuffleHome();
  renderViewer();
}

function bindViewerEvents() {
  document.getElementById('btn-prev').addEventListener('click', navigatePrev);
  document.getElementById('btn-next').addEventListener('click', navigateNext);
  document.getElementById('btn-export').addEventListener('click', exportPNG);
  document.getElementById('btn-shuffle').addEventListener('click', shuffleAlbums);
  document.getElementById('btn-zoom-in').addEventListener('click', () => setZoom(zoomLevel + ZOOM_STEP));
  document.getElementById('btn-zoom-out').addEventListener('click', () => setZoom(zoomLevel - ZOOM_STEP));

  document.getElementById('stage').addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(zoomLevel + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  }, { passive: false });
}

// ── PNG Export ───────────────────────────────────────────────
async function exportPNG() {
  const btn  = document.getElementById('btn-export');
  const wrap = document.querySelector('.phone-wrap');
  if (!wrap || typeof html2canvas === 'undefined') {
    alert('html2canvas not loaded — check your internet connection.'); return;
  }
  btn.textContent = '…'; btn.disabled = true;

  const prev = wrap.style.transform;
  wrap.style.transform = 'scale(1)'; wrap.style.marginTop = '0'; wrap.style.marginBottom = '0';

  try {
    const canvas = await html2canvas(wrap.querySelector('.phone-frame'), {
      scale: 2, backgroundColor: null, useCORS: true, logging: false,
    });
    const name = currentScreen().name.toLowerCase().replace(/[\s/]+/g, '-');
    const v    = getVariant(currentScreen()).label;
    const link = document.createElement('a');
    link.download = `c-sharp-${name}-${v}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } finally {
    wrap.style.transform = prev; setPhoneScale();
    btn.textContent = '⬇ PNG'; btn.disabled = false;
  }
}

// ============================================================
//  MOBILE PROTOTYPE
// ============================================================
const SVG_EXPAND   = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"/></svg>`;
const SVG_COMPRESS = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 1v4H1M9 5V1h4M9 13v-4h4M5 9v4H1"/></svg>`;

let mobileViewMode = 'single';

function initMobile() {
  document.getElementById('mb-fs').innerHTML = SVG_EXPAND;
  bindMobileBarEvents();
  window.addEventListener('resize', debounce(scaleMobilePhone, 100));
  setMobileView('single');
}

function bindMobileBarEvents() {
  document.getElementById('mb-seg').addEventListener('click', e => {
    const btn = e.target.closest('.mb-btn');
    if (!btn) return;
    setMobileView(btn.dataset.mview);
  });

  document.getElementById('mb-prev').addEventListener('click', () => {
    if (currentIdx > 0) { currentIdx--; renderMobileSingle(); }
  });
  document.getElementById('mb-next').addEventListener('click', () => {
    if (currentIdx < SCREENS.length - 1) { currentIdx++; renderMobileSingle(); }
  });

  const fsBtn = document.getElementById('mb-fs');
  fsBtn.addEventListener('click', () => {
    const el = document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    document.getElementById('mb-fs').innerHTML =
      document.fullscreenElement ? SVG_COMPRESS : SVG_EXPAND;
  });
}

function setMobileView(mode) {
  mobileViewMode = mode;
  document.querySelectorAll('.mb-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mview === mode)
  );
  document.querySelectorAll('.mb-view').forEach(v => { v.style.display = 'none'; });
  const view = document.getElementById('mb-' + mode);
  if (view) view.style.display = 'flex';

  if (mode === 'single') renderMobileSingle();
  else if (mode === 'multi') renderMobileMultiGrid();
  else if (mode === 'live') renderMobileLive(currentIdx);
}

function renderMobileSingle() {
  const center = document.getElementById('mb-phone-center');
  center.innerHTML = `<div class="phone-wrap">${buildPhoneHTML(currentScreen())}</div>`;
  document.getElementById('mb-screen-name').textContent = currentScreen().name;
  document.getElementById('mb-prev').disabled = currentIdx === 0;
  document.getElementById('mb-next').disabled = currentIdx === SCREENS.length - 1;
  requestAnimationFrame(() => {
    scaleMobilePhone();
    center.querySelectorAll('.s-home-v3').forEach(el => populateHomeData(el));
    center.querySelectorAll('.s-onboarding').forEach(obInit);
    applyFilletMasks();
  });
}

function scaleMobilePhone() {
  const center = document.getElementById('mb-phone-center');
  const wrap   = center && center.querySelector('.phone-wrap');
  if (!wrap) return;
  const scale  = Math.min((center.clientWidth - 8) / 393, (center.clientHeight - 8) / 852, 1.0);
  const dead   = 852 * (scale - 1);
  wrap.style.transform    = `scale(${scale})`;
  wrap.style.marginTop    = dead / 2 + 'px';
  wrap.style.marginBottom = dead / 2 + 'px';
}

function renderMobileMultiGrid() {
  const grid  = document.getElementById('mb-multi-grid');
  const stage = document.getElementById('mb-multi');
  const colW  = (stage.clientWidth - 40) / 2;
  const scale = Math.min(colW / 393, 0.42);
  const dead  = 852 * (scale - 1);

  grid.innerHTML = SCREENS.map((s, i) => `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div class="phone-wrap" style="transform:scale(${scale});margin-top:${dead/2}px;margin-bottom:${dead/2}px;cursor:pointer"
           onclick="goToMobileScreen(${i})">
        ${buildPhoneHTML(s)}
      </div>
      <div class="phone-multi-label" style="display:block">${s.name}</div>
    </div>
  `).join('');
}

function renderMobileLive(idx) {
  const content = document.getElementById('mobile-content');
  content.innerHTML = getVariant(SCREENS[idx]).html;
  currentIdx = idx;
  requestAnimationFrame(() => {
    content.querySelectorAll('.s-home-v3').forEach(el => populateHomeData(el));
    content.querySelectorAll('.s-onboarding').forEach(obInit);
    applyFilletMasks();
  });
}

window.goToMobileScreen = function(idx) {
  currentIdx = idx;
  setMobileView('single');
};

// ── navigate() — called from screen HTML onclick ─────────────
window.navigate = function(targetId, direction) {
  // search / album / artist / review are no longer standalone screens — any
  // onclick that still asks for them routes to the live in-app flow instead.
  // 'review' is a legacy id: the state it named is gone, and the album page is
  // what it was reaching for.
  if (targetId === 'search' || targetId === 'album' || targetId === 'artist' || targetId === 'review') {
    const arc = window.ARCHIVE || [];
    const a = window.activeAlbum || window.featuredAlbum || arc[0];
    activeNavId = targetId;
    if (targetId === 'search') window.openSearch();
    else if ((targetId === 'album' || targetId === 'review') && a) window.openAlbumPage(a);
    else if (targetId === 'artist' && a) window.openArtistPageFor(a.artist);
    renderPageNav();
    return;
  }

  const idx = SCREENS.findIndex(s => s.id === targetId);
  if (idx === -1) return;
  activeNavId = targetId;
  // New personality on a fresh visit, but NOT when Back restores an earlier profile.
  if (targetId === 'profile' && direction !== 'back' && !window.ACTIVE_PERSONA) randomizeProfile();

  if (isMobile) {
    if (mobileViewMode !== 'live') {
      currentIdx = idx;
      if (mobileViewMode === 'single') renderMobileSingle();
      return;
    }

    const content = document.getElementById('mobile-content');
    const isBack  = direction === 'back' || (navHistory.length && navHistory[navHistory.length-1] === idx);
    if (isBack) navHistory.pop(); else navHistory.push(currentIdx);

    const oldEl = content.firstElementChild;
    const temp  = document.createElement('div');
    temp.innerHTML = getVariant(SCREENS[idx]).html;
    const newEl = temp.firstElementChild;
    content.appendChild(newEl);
    requestAnimationFrame(() => {
      if (newEl.classList.contains('s-home-v3')) populateHomeData(newEl);
      applyFilletMasks();
    });

    if (oldEl) {
      const fwd = !isBack;
      oldEl.classList.add(fwd ? 'slide-exit' : 'slide-back-exit');
      newEl.classList.add(fwd ? 'slide-enter' : 'slide-back-enter');
      setTimeout(() => {
        oldEl.remove();
        newEl.classList.remove('slide-enter','slide-exit','slide-back-enter','slide-back-exit');
      }, 300);
    }
    currentIdx = idx;
  } else {
    currentIdx = idx;
    renderViewer();
  }
};

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

// ══════════════════════════════════════════════════════════════
//  LOG SHEET — Letterboxd-style bottom sheet for rating & logging.
//  Reusable from anywhere: openLogSheet(triggerEl) resolves the album
//  from the bento context and mounts a singleton sheet inside the
//  triggering phone screen (.app-screen) so it stays in the frame.
// ══════════════════════════════════════════════════════════════
// Aliased from screens.js (SD_ICONS) rather than redefined — the album page's
// quick-log squares are built into static screen markup there, and the two sets
// of buttons have to draw the same glyphs.
const SDLOG_ICONS = SD_ICONS;
// A single vinyl record used as the rating unit (label punched in the sheet bg colour)
const SDLOG_REC = `<svg class="sd-rec" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor"/><circle cx="12" cy="12" r="8" fill="none" stroke="rgba(0,0,0,0.28)" stroke-width="0.8"/><circle cx="12" cy="12" r="4.4" fill="#1c1c22"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>`;
const SDLOG_RECS = SDLOG_REC.repeat(5);
const SDLOG_PENCIL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>`;
let SDLOG = null;   // { subject, rating, listened, later, fav, text, songs:[{title,rating,text}] }

/* ── Log drafts — autosaved, never explicitly "saved" ──────────
   The sheet has no Save button. Every change writes through to localStorage, so
   a half-typed review survives closing the sheet, swiping to another album, and
   a reload. Typing is debounced (~400ms) so a keystroke isn't a storage write;
   taps (rating, toggles) write immediately, and closing the sheet flushes
   whatever is still pending. */
const SDLOG_STORE = 'spindeck-logs';
const SDLOG_DEBOUNCE = 400;
let _sdlogT = null;
// Set while openLogSheet is repainting the sheet from a saved draft. The paint
// helpers (setLogRating / setSongRating) are the same ones the user's taps go
// through, so without this, restoring a draft would immediately re-save it.
let _sdlogRestoring = false;

function logDrafts() {
  try { return JSON.parse(localStorage.getItem(SDLOG_STORE)) || {}; }
  catch (e) { return {}; }        // corrupt or blocked storage → behave as empty
}
// Subject identity. The title alone collides — two albums can share a name, and
// a song title is not unique across the catalogue — so kind and subtitle ride along.
function logKey(subj) {
  const kind = subj.isSong ? 'song' : subj.isArtist ? 'artist' : 'album';
  return `${kind}::${subj.title}::${subj.subtitle || ''}`;
}
// Write one draft, or drop it if nothing is left in it — an opened-and-abandoned
// sheet must not leave an empty draft behind that reads as "in progress".
function putDraft(key, d) {
  const all = logDrafts();
  const empty = !d.rating && !d.listened && !d.later && !d.fav
             && !(d.text || '').trim() && !(d.songs || []).length;
  if (empty) delete all[key]; else all[key] = { ...d, updated: Date.now() };
  try { localStorage.setItem(SDLOG_STORE, JSON.stringify(all)); } catch (e) {}
}
function saveLog(now) {
  if (_sdlogRestoring || !SDLOG || !SDLOG.subject) return;
  clearTimeout(_sdlogT);
  const write = () => {
    putDraft(logKey(SDLOG.subject), {
      rating: SDLOG.rating, listened: SDLOG.listened, later: SDLOG.later, fav: SDLOG.fav,
      text: SDLOG.text || '',
      // only tracks the user actually touched — the rest is just the tracklist
      songs: (SDLOG.songs || []).filter(s => s.rating > 0 || (s.text || '').trim()),
    });
    flashLogSaved();
  };
  if (now) write(); else _sdlogT = setTimeout(write, SDLOG_DEBOUNCE);
}
// With the Save button gone, this is the only signal that the work is kept.
// The wording is swapped in JS rather than cross-faded between two stacked
// labels in CSS — one label, one source of truth, nothing to get out of step.
function flashLogSaved() {
  const el = document.querySelector('#sd-log .sd-log-status');
  const txt = el && el.querySelector('.sd-log-status-txt');
  if (!el || !txt) return;
  el.classList.add('on');
  txt.textContent = 'Draft saved';
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.classList.remove('on');
    txt.textContent = 'Saves as you type';
  }, 1500);
}
// Flip one flag on a subject's draft WITHOUT opening the sheet — the album
// page's quick-log squares write through here, so the two surfaces agree.
function writeDraftFlag(subj, k, on) {
  const key = logKey(subj);
  const d = logDrafts()[key] || { rating: 0, listened: false, later: false, fav: false, text: '', songs: [] };
  d[k] = on;
  putDraft(key, d);
}
// The saved draft for an album, as the quick-log squares need it.
function albumDraft(a) {
  return a ? (logDrafts()[logKey({ title: a.album, subtitle: a.artist })] || {}) : {};
}

function ensureLogSheet() {
  let ov = document.getElementById('sd-log');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'sd-log';
  ov.className = 'sd-log-overlay';
  ov.innerHTML = `
    <div class="sd-log-sheet" role="dialog" aria-modal="true">
      <div class="sd-log-grab"></div>
      <div class="sd-log-head">
        <div class="sd-log-cover"></div>
        <div class="sd-log-meta">
          <div class="sd-log-album"></div>
          <div class="sd-log-artist"></div>
        </div>
        <button class="sd-log-share" type="button">Share</button>
        <button class="sd-log-x" aria-label="Close">✕</button>
      </div>
      <div class="sd-log-rate">
        <span class="sd-log-stars-track">
          <span class="sd-log-stars-empty">${SDLOG_RECS}</span>
          <span class="sd-log-stars-fill">${SDLOG_RECS}</span>
        </span>
        <span class="sd-log-rate-val"></span>
      </div>
      <div class="sd-log-opts">
        <button class="sd-log-opt" data-k="listened"><span class="sd-log-opt-ico">${SDLOG_ICONS.ear}</span><span>Listened</span></button>
        <button class="sd-log-opt" data-k="later"><span class="sd-log-opt-ico">${SDLOG_ICONS.clock}</span><span>Listen later</span></button>
        <button class="sd-log-opt" data-k="fav"><span class="sd-log-opt-ico">${SDLOG_ICONS.heart}</span><span>Favorite</span></button>
      </div>
      <div class="sd-log-review">
        <textarea class="sd-log-write" rows="3" placeholder="Write a review…"></textarea>
      </div>
      <div class="sd-log-songs" hidden>
        <div class="sd-log-songs-hd">Songs <span class="sd-log-songs-sub">optional — only rated songs get logged</span></div>
        <div class="sd-log-songs-list"></div>
      </div>
      <!-- No Save button: the sheet autosaves. This line is the only feedback
           that the draft is kept, so it says so at rest and lights up on write. -->
      <div class="sd-log-foot">
        <span class="sd-log-status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 7"/></svg>
          <span class="sd-log-status-txt">Saves as you type</span>
        </span>
      </div>
    </div>`;

  ov.addEventListener('click', e => { e.stopPropagation(); if (e.target === ov) closeLogSheet(); });
  ov.addEventListener('mousedown', e => e.stopPropagation());
  ov.querySelector('.sd-log-sheet').addEventListener('click', e => e.stopPropagation());
  ov.querySelector('.sd-log-x').addEventListener('click', closeLogSheet);
  /* Share what you just wrote. Reads live SDLOG rather than the saved draft so
     the post reflects the sheet as it stands, debounce or no debounce. */
  ov.querySelector('.sd-log-share').addEventListener('click', function (e) {
    if (!SDLOG || !SDLOG.subject) return;
    const arch = window.ARCHIVE || [];
    const album = arch.find(x => x.album === SDLOG.subject.title);
    if (!album) return;                       // songs / artists have no card yet
    openShareSheet(e.currentTarget, album, {
      rating: SDLOG.rating, text: SDLOG.text,
      songs: (SDLOG.songs || []).filter(x => x.rating > 0),   // only what you actually scored
    });
  });
  ov.querySelectorAll('.sd-log-opt').forEach(b => b.addEventListener('click', () => toggleLogOpt(b.dataset.k, b)));
  // The review itself — debounced autosave on every keystroke.
  ov.querySelector('.sd-log-write').addEventListener('input', e => {
    if (!SDLOG) return;
    SDLOG.text = e.target.value;
    saveLog();
  });

  const track = ov.querySelector('.sd-log-stars-track');
  const rateFrom = e => {
    const r = track.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    setLogRating(Math.max(0.5, Math.min(5, Math.ceil((x / r.width) * 10) / 2)));
  };
  track.addEventListener('click', rateFrom);

  // Per-song rating + note (event-delegated over the song list)
  const songs = ov.querySelector('.sd-log-songs-list');
  songs.addEventListener('click', e => {
    const rt = e.target.closest('.sd-log-song-rate-track');
    if (rt) {
      const row = rt.closest('.sd-log-song');
      const r = rt.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      setSongRating(+row.dataset.i, Math.max(0.5, Math.min(5, Math.ceil((x / r.width) * 10) / 2)));
      return;
    }
    const nb = e.target.closest('.sd-log-song-note-btn');
    if (nb) {
      const row = nb.closest('.sd-log-song');
      row.classList.toggle('open-note');
      const inp = row.querySelector('.sd-log-song-note');
      if (row.classList.contains('open-note') && inp) inp.focus();
    }
  });
  songs.addEventListener('input', e => {
    const inp = e.target.closest('.sd-log-song-note');
    if (!inp || !SDLOG) return;
    const row = inp.closest('.sd-log-song');
    const i = +row.dataset.i;
    if (SDLOG.songs[i]) { SDLOG.songs[i].text = inp.value; markSongLogged(row, i); saveLog(); }
  });
  return ov;
}

window.openLogSheet = function(triggerEl, subject) {
  const album = (window.currentBentoAlbum && currentBentoAlbum()) || window.activeAlbum || window.featuredAlbum;
  const scrEl = triggerEl && triggerEl.closest && triggerEl.closest('.s-home-v3');
  const artistMode = scrEl && scrEl.classList.contains('s-home-v3--artist');
  // subject lets a song / artist reuse the sheet; falls back to the album
  let subj = subject;
  if (!subj) {
    if (artistMode && album) subj = { image: ARTIST_IMG[album.artist] || album.image, title: album.artist, subtitle: album.genre || '', isArtist: true };
    else if (album) subj = { image: album.image, title: album.album, subtitle: album.artist };
  }
  if (!subj) return;
  const host = (triggerEl && triggerEl.closest && triggerEl.closest('.app-screen'))
             || document.querySelector('.app-screen') || document.body;
  const ov = ensureLogSheet();
  host.appendChild(ov);   // mount into the triggering phone screen so it stays in-frame

  // Reopen where you left off — the sheet never starts blank if there's a draft.
  const saved = logDrafts()[logKey(subj)] || {};
  _sdlogRestoring = true;
  SDLOG = {
    subject: subj,
    rating: saved.rating || 0,
    listened: !!saved.listened, later: !!saved.later, fav: !!saved.fav,
    text: saved.text || '',
    songs: [],
  };
  ov.querySelector('.sd-log-cover').style.backgroundImage = `url("${subj.image}")`;
  ov.querySelector('.sd-log-album').textContent = subj.title;
  ov.querySelector('.sd-log-artist').textContent = subj.subtitle;
  ov.querySelector('.sd-log-write').value = SDLOG.text;
  ov.querySelectorAll('.sd-log-opt').forEach(b => b.classList.toggle('on', !!SDLOG[b.dataset.k]));
  setLogRating(SDLOG.rating);
  // Album mode → per-song rows below; single-song mode → no nested song list,
  // and no text review (songs are vinyl-rated only).
  const reviewBox = ov.querySelector('.sd-log-review');
  if (subj.isSong) {
    const box = ov.querySelector('.sd-log-songs'); if (box) box.hidden = true;
    if (reviewBox) reviewBox.hidden = true;                 // song: vinyl only
  } else if (subj.isArtist) {
    const box = ov.querySelector('.sd-log-songs'); if (box) box.hidden = true;
    if (reviewBox) reviewBox.hidden = false;                // artist: vinyl + text review, no songs
  } else {
    if (reviewBox) reviewBox.hidden = false;
    fillLogSongs(ov, album);
  }
  const shareBtn = ov.querySelector('.sd-log-share');
  if (shareBtn) shareBtn.hidden = !!(subj.isSong || subj.isArtist);
  const sheet = ov.querySelector('.sd-log-sheet');
  if (sheet) sheet.scrollTop = 0;
  _sdlogRestoring = false;              // paints done — live edits save from here
  requestAnimationFrame(() => ov.classList.add('open'));
};

// Build the per-song rating/review rows for an album's log sheet.
function fillLogSongs(ov, album) {
  const box = ov.querySelector('.sd-log-songs');
  const list = ov.querySelector('.sd-log-songs-list');
  if (!box || !list) return;
  const songs = album ? songsFor(album) : [];
  if (!songs.length) { box.hidden = true; list.innerHTML = ''; if (SDLOG) SDLOG.songs = []; return; }
  // Merge any saved per-song ratings back in, keyed by TITLE rather than index:
  // the draft only stores the tracks that were touched, so its indices are not
  // the tracklist's.
  const savedSongs = (SDLOG && logDrafts()[logKey(SDLOG.subject)] || {}).songs || [];
  const byTitle = new Map(savedSongs.map(s => [s.title, s]));
  if (SDLOG) SDLOG.songs = songs.map(s => {
    const prev = byTitle.get(s.title);
    return { title: s.title, rating: (prev && prev.rating) || 0, text: (prev && prev.text) || '' };
  });
  box.hidden = false;
  list.innerHTML = songs.map((s, i) => `
    <div class="sd-log-song" data-i="${i}">
      <span class="sd-log-song-title">${s.title}</span>
      <span class="sd-log-song-val"></span>
      <span class="sd-log-song-rate-track">
        <span class="sd-log-song-empty">${SDLOG_RECS}</span>
        <span class="sd-log-song-fill" style="width:0">${SDLOG_RECS}</span>
      </span>
    </div>`).join('');
  // Repaint whatever came back from the draft (rows render empty).
  if (SDLOG) SDLOG.songs.forEach((s, i) => { if (s.rating) setSongRating(i, s.rating); });
}

function setSongRating(i, v) {
  if (!SDLOG || !SDLOG.songs[i]) return;
  SDLOG.songs[i].rating = v;
  const ov = document.getElementById('sd-log');
  const row = ov && ov.querySelector(`.sd-log-song[data-i="${i}"]`);
  if (!row) return;
  const fill = row.querySelector('.sd-log-song-fill');
  if (fill) fill.style.width = (v / 5 * 100) + '%';
  const val = row.querySelector('.sd-log-song-val');
  if (val) val.textContent = v ? String(v).replace(/\.0$/, '') : '';
  markSongLogged(row, i);
  saveLog(true);
}

// A song is "logged" once it has a rating or a note; reflected as a highlight.
function markSongLogged(row, i) {
  const s = SDLOG && SDLOG.songs[i];
  const logged = !!s && (s.rating > 0 || (s.text && s.text.trim().length > 0));
  row.classList.toggle('is-logged', logged);
}

window.closeLogSheet = function() {
  saveLog(true);          // flush a pending debounce — closing must never drop keystrokes
  const ov = document.getElementById('sd-log');
  if (ov) ov.classList.remove('open');
  // Whatever was just logged may light the album page's quick-log squares.
  homeShells().forEach(syncQuickLog);
};

function setLogRating(v) {
  if (!SDLOG) return;
  SDLOG.rating = v;
  const ov = document.getElementById('sd-log');
  if (!ov) return;
  ov.querySelector('.sd-log-stars-fill').style.width = (v / 5 * 100) + '%';
  ov.querySelector('.sd-log-rate-val').textContent = v ? String(v).replace(/\.0$/, '') : '';
  saveLog(true);          // a tap, not typing — no reason to debounce it
}

function toggleLogOpt(k, btn) {
  if (!SDLOG) return;
  SDLOG[k] = !SDLOG[k];
  btn.classList.toggle('on', SDLOG[k]);
  saveLog(true);
}

/* ============================================================
   SEARCH — fullscreen overlay over the current phone screen.
   TikTok-style: a search field, live autocomplete suggestions on
   top (top 5, per keystroke), then Artists / Albums / Songs result
   sections. Tabs below the field funnel results into one category.
   All data comes from the local catalogue (ARCHIVE + songsFor).
   ============================================================ */
function buildSearchIndex() {
  if (window.SEARCH_INDEX) return window.SEARCH_INDEX;
  const arch = window.ARCHIVE || [];
  const artistMap = new Map();
  const albums = [], songs = [];
  arch.forEach(a => {
    albums.push({ album: a.album, artist: a.artist, image: a.image, genre: a.genre, year: a.year, rating: a.rating, ref: a });
    if (!artistMap.has(a.artist)) {
      artistMap.set(a.artist, { name: a.artist, image: (window.ARTIST_IMG && ARTIST_IMG[a.artist]) || a.image, genre: a.genre, count: 0 });
    }
    artistMap.get(a.artist).count++;
    songsFor(a).forEach(s => songs.push({ title: s.title, album: a.album, artist: a.artist, image: a.image, dur: s.dur, rating: s.rating, ref: a }));
  });
  window.SEARCH_INDEX = { artists: [...artistMap.values()], albums, songs };
  return window.SEARCH_INDEX;
}
// Match rank: prefix (0) beats word-start (1) beats anywhere (2); -1 = no match.
function _sdsRank(text, q) {
  const t = String(text).toLowerCase();
  const i = t.indexOf(q);
  if (i < 0) return -1;
  if (i === 0) return 0;
  if (t[i - 1] === ' ') return 1;
  return 2;
}
function _sdsEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
// Bold the matched substring within a result/suggestion label.
function _sdsHi(text, q) {
  const lo = String(text).toLowerCase(), i = lo.indexOf(q);
  if (i < 0) return _sdsEsc(text);
  return _sdsEsc(text.slice(0, i)) + '<b>' + _sdsEsc(text.slice(i, i + q.length)) + '</b>' + _sdsEsc(text.slice(i + q.length));
}

// ── Search zero state ─────────────────────────────────────────
// Trending searches + a rail of trending covers, shown whenever the field is
// empty. Typing replaces it (runSearch rebuilds .sds-results every keystroke),
// clearing the field brings it back.

// A blend of archive artists and albums, ranked by a day-seeded "heat" so the
// chart rotates daily like featuredAlbum but stays put within a session.
function sdsTrendingSearches(n = 8) {
  const idx = buildSearchIndex();
  const rnd = seedRand('trend::' + Math.floor(Date.now() / 86400000));
  const pool = [
    ...idx.artists.map(a => ({ term: a.name, kind: 'Artist' })),
    ...idx.albums.map(a => ({ term: a.album, kind: 'Album', sub: a.artist })),
  ];
  pool.forEach(p => { p.heat = rnd(); });
  pool.sort((a, b) => b.heat - a.heat);

  const seen = new Set(), out = [];
  for (const p of pool) {
    const k = p.term.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
    if (out.length >= n) break;
  }
  // Fictional search volume. The jitter band (±800) stays under the step
  // (3200) so the chart is always strictly descending.
  out.forEach((p, i) => {
    p.count = Math.max(900, Math.round(34000 - i * 3200 + (p.heat - 0.5) * 1600));
  });
  return out;
}

const SDS_RAIL_N = 10;   // covers in the "Trending now" rail

function sdsZeroHtml(ov) {
  // trendingAlbums is the whole rotated archive, not a short list — take the
  // head of it, and fall back to the most-reviewed albums if it's ever empty.
  const source = (window.trendingAlbums || []).length
    ? window.trendingAlbums
    : (window.ARCHIVE || []).slice().sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  const cards = source.slice(0, SDS_RAIL_N);

  // sdsOpenResult resolves taps through ov._last.albums[i].ref — index the
  // rail the same way so the existing open path works unchanged.
  ov._last = { artists: [], albums: cards.map(a => ({ ref: a })), songs: [] };

  const rows = sdsTrendingSearches(8).map((t, i) => `
    <button class="sds-trend${i < 3 ? ' sds-trend--top' : ''}" data-pick="${_sdsEsc(t.term).replace(/"/g, '&quot;')}">
      <span class="sds-trend-n">${i + 1}</span>
      <span class="sds-row-main">
        <span class="sds-row-t">${_sdsEsc(t.term)}</span>
        <span class="sds-row-s">${t.kind}${t.sub ? ' · <b>' + _sdsEsc(t.sub) + '</b>' : ''}</span>
      </span>
      <span class="sds-trend-ct">${window.fmtRc(t.count)}</span>
    </button>`).join('');

  const railCards = cards.map((a, i) => `
    <button class="sds-tcard" data-type="album" data-i="${i}">
      <span class="sds-tcard-art" style="background-image:url('${a.image}')"></span>
      <span class="sds-tcard-t">${_sdsEsc(a.album)}</span>
      <span class="sds-tcard-s">${_sdsEsc(a.artist)}</span>
    </button>`).join('');

  return `
    <div class="sds-sec">
      <div class="sds-sec-hd">Trending searches</div>
      ${rows}
    </div>
    <div class="sds-sec">
      <div class="sds-sec-hd">Trending now</div>
      <div class="sds-rail">${railCards}</div>
    </div>`;
}

function runSearch() {
  const ov = document.getElementById('sd-search');
  if (!ov) return;
  const q = ov.querySelector('.sds-input').value.trim().toLowerCase();
  const cat = ov._cat || 'all';
  const idx = buildSearchIndex();
  const sugEl = ov.querySelector('.sds-suggest');
  const resEl = ov.querySelector('.sds-results');
  ov.querySelector('.sds-clear').classList.toggle('show', !!q);

  if (!q) {
    sugEl.innerHTML = '';
    resEl.innerHTML = sdsZeroHtml(ov);   // sets ov._last for the rail
    return;
  }

  const rank = (arr, key) => arr
    .map(o => ({ o, r: _sdsRank(o[key], q) }))
    .filter(x => x.r >= 0)
    .sort((a, b) => a.r - b.r || String(a.o[key]).length - String(b.o[key]).length)
    .map(x => x.o);
  const artists = rank(idx.artists, 'name');
  const albums  = rank(idx.albums, 'album');
  const songs   = rank(idx.songs, 'title');
  ov._last = { artists, albums, songs };

  // ── Autocomplete suggestions (top 5) — only on the All tab ──
  if (cat === 'all') {
    const seen = new Set(), sug = [];
    [...artists.map(a => a.name), ...albums.map(a => a.album), ...songs.map(s => s.title)].forEach(n => {
      const r = _sdsRank(n, q); if (r < 0) return;
      const k = n.toLowerCase(); if (seen.has(k)) return; seen.add(k);
      sug.push({ n, r });
    });
    sug.sort((a, b) => a.r - b.r || a.n.length - b.n.length);
    sugEl.innerHTML = sug.slice(0, 5).map(s => `
      <button class="sds-sug" data-pick="${_sdsEsc(s.n).replace(/"/g, '&quot;')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <span class="sds-sug-t">${_sdsHi(s.n, q)}</span>
        <svg class="sds-sug-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
      </button>`).join('');
  } else {
    sugEl.innerHTML = '';
  }

  // ── Result rows ──
  const artHtml = (a, i) => `
    <button class="sds-row" data-type="artist" data-i="${i}">
      <span class="sds-thumb sds-thumb--round" style="background-image:url('${a.image}')"></span>
      <span class="sds-row-main"><span class="sds-row-t">${_sdsHi(a.name, q)}</span><span class="sds-row-s">Artist · ${a.count} album${a.count > 1 ? 's' : ''}</span></span>
    </button>`;
  const albHtml = (a, i) => `
    <button class="sds-row" data-type="album" data-i="${i}">
      <span class="sds-thumb" style="background-image:url('${a.image}')"></span>
      <span class="sds-row-main"><span class="sds-row-t">${_sdsHi(a.album, q)}</span><span class="sds-row-s">Album · <b>${_sdsEsc(a.artist)}</b>${a.year ? ' · ' + a.year : ''}</span></span>
    </button>`;
  const sngHtml = (s, i) => `
    <button class="sds-row" data-type="song" data-i="${i}">
      <span class="sds-thumb" style="background-image:url('${s.image}')"></span>
      <span class="sds-row-main"><span class="sds-row-t">${_sdsHi(s.title, q)}</span><span class="sds-row-s">Song · ${_sdsEsc(s.album)} · <b>${_sdsEsc(s.artist)}</b></span></span>
      <span class="sds-row-dur">${s.dur}</span>
    </button>`;
  // All tab shows a compact top-3 per category; typing narrows it and the
  // tabs above open the full per-category list. No "see all" rows.
  const section = (title, items, render) => {
    if (!items.length) return '';
    return `<div class="sds-sec"><div class="sds-sec-hd">${title}</div>${items.slice(0, 3).map(render).join('')}</div>`;
  };

  let html = '';
  if (cat === 'all') {
    html += section('Artists', artists, artHtml);
    html += section('Albums', albums, albHtml);
    html += section('Songs', songs, sngHtml);
  } else if (cat === 'artists') { html = artists.map(artHtml).join(''); }
  else if (cat === 'albums')   { html = albums.map(albHtml).join(''); }
  else if (cat === 'songs')    { html = songs.map(sngHtml).join(''); }
  if (!html.trim()) html = `<div class="sds-empty">No matches for &ldquo;${_sdsEsc(q)}&rdquo;.</div>`;
  resEl.innerHTML = html;
  // …then let Deezer fill in underneath (debounced, appends its own section).
  // The index only holds the persona's ~30 albums, so anything outside their
  // shelf — "steely dan" — has no local match at all.
  if (typeof sdsRemoteSearch === 'function') sdsRemoteSearch(q, ov);
}

// Result tap → browse to it (artist / album page), then close the overlay.
function sdsOpenResult(type, i) {
  const ov = document.getElementById('sd-search');
  const last = (ov && ov._last) || {};
  closeSearch();
  if (type === 'artist') { const a = (last.artists || [])[i]; if (a) window.openArtistPageFor(a.name); }
  else if (type === 'album') { const a = (last.albums || [])[i]; if (a && a.ref) window.openAlbumPage(a.ref); }
  else if (type === 'song') { const s = (last.songs || [])[i]; if (s && s.ref) window.openAlbumPage(s.ref); }
}

function ensureSearchOverlay() {
  let ov = document.getElementById('sd-search');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'sd-search';
  ov.className = 'sds-overlay';
  ov.innerHTML = `
    <div class="sds-panel" role="dialog" aria-modal="true" aria-label="Search">
      <div class="sds-top">
        <button class="sds-back" aria-label="Close search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="sds-inputwrap">
          <svg class="sds-input-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input class="sds-input" type="text" placeholder="Artists, albums, songs" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">
          <button class="sds-clear" aria-label="Clear search">✕</button>
        </div>
      </div>
      <div class="sds-tabs">
        <button class="sds-tab active" data-cat="all">All</button>
        <button class="sds-tab" data-cat="artists">Artists</button>
        <button class="sds-tab" data-cat="albums">Albums</button>
        <button class="sds-tab" data-cat="songs">Songs</button>
      </div>
      <div class="sds-body">
        <div class="sds-suggest"></div>
        <div class="sds-results"></div>
      </div>
    </div>`;

  ov.querySelector('.sds-back').addEventListener('click', closeSearch);
  const inp = ov.querySelector('.sds-input');
  inp.addEventListener('input', runSearch);
  inp.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
  ov.querySelector('.sds-clear').addEventListener('click', () => { inp.value = ''; inp.focus(); runSearch(); });
  ov.querySelectorAll('.sds-tab').forEach(t => t.addEventListener('click', () => {
    ov._cat = t.dataset.cat;
    ov.querySelectorAll('.sds-tab').forEach(x => x.classList.toggle('active', x === t));
    ov.querySelector('.sds-body').scrollTop = 0;
    runSearch();
  }));
  // Delegated taps, matched on data attributes rather than class so the zero
  // state's trending rows (.sds-trend) and cover rail (.sds-tcard) ride the
  // same two paths as .sds-sug / .sds-row.
  ov.addEventListener('click', e => {
    const pick = e.target.closest('[data-pick]');       // fill the field + search
    if (pick) { inp.value = pick.dataset.pick; inp.focus(); runSearch(); return; }
    const row = e.target.closest('[data-type][data-i]'); // browse to the result
    if (row) sdsOpenResult(row.dataset.type, +row.dataset.i);
  });
  return ov;
}

window.openSearch = function (triggerEl) {
  const host = (triggerEl && triggerEl.closest && triggerEl.closest('.app-screen'))
             || document.querySelector('.app-screen') || document.body;
  const ov = ensureSearchOverlay();
  ov.classList.toggle('sds-overlay--light', !!host.querySelector('.s-home-v3--light'));
  host.appendChild(ov);   // mount into the current phone screen so it stays in-frame
  ov._cat = 'all';
  ov.querySelectorAll('.sds-tab').forEach(x => x.classList.toggle('active', x.dataset.cat === 'all'));
  const inp = ov.querySelector('.sds-input');
  inp.value = '';
  ov.querySelector('.sds-body').scrollTop = 0;
  runSearch();
  requestAnimationFrame(() => { ov.classList.add('open'); setTimeout(() => inp.focus(), 80); });
};

window.closeSearch = function () {
  const ov = document.getElementById('sd-search');
  if (!ov) return;
  ov.classList.remove('open');
  const inp = ov.querySelector('.sds-input'); if (inp) inp.blur();
};

// ══════════════════════════════════════════════════════════════
//  ONBOARDING WIZARD
//  8 steps: username · connect · tracking · genres · artists ·
//  albums · people you may know · profile. State lives in OB and is
//  synced onto every rendered .s-onboarding instance (the viewer shows
//  the dark + light variants side by side).
// ══════════════════════════════════════════════════════════════
const OB = {
  step: 0,
  username: '',
  service: null,        // 'spotify' | 'apple' | 'soundcloud'
  tracking: null,       // null = undecided, then true/false
  genres:   new Set(),
  artists:  new Set(),  // artist names
  albums:   new Set(),  // "artist – album" keys
  following:new Set(),  // handles
  q: { artists: '', albums: '' },
};

// The tracking step only appears once a service is connected.
function obActiveSteps() { return OB.service ? [0,1,2,3,4,5,6,7] : [0,1,3,4,5,6,7]; }

const obEsc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
// onclick-safe: survives HTML-decode then JS single-quote parse.
const obOc  = s => String(s).replace(/\\/g,'\\\\').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,"\\'");
const obUserValid = () => /^[a-zA-Z0-9_]{3,20}$/.test(OB.username);
// (albumKey() — "artist – album" — is defined above, reused here for album selection.)

// Kick off a fresh signup (from the auth screen).
window.obStart = function () {
  OB.step = 0; OB.username = ''; OB.service = null; OB.tracking = null;
  OB.genres.clear(); OB.artists.clear(); OB.albums.clear(); OB.following.clear();
  OB.q.artists = ''; OB.q.albums = '';
  navigate('onboarding');
};

// ── Derived data ──────────────────────────────────────────────
let _obArtists = null;
function obArtistList() {
  if (_obArtists) return _obArtists;
  const seen = new Map();
  (window.ARCHIVE || []).forEach(a => {
    if (!seen.has(a.artist)) seen.set(a.artist, { name: a.artist, image: a.image, genre: a.genre });
  });
  _obArtists = [...seen.values()];
  return _obArtists;
}
function obAlbumList() { return (window.ARCHIVE || []); }

let _obPeople = null;
function obPeopleList() {
  if (_obPeople) return _obPeople;
  const base = (window.FRIEND_ACTIVITY || []).map(f => ({ user: f.user, init: f.init, grad: f.grad }));
  const extra = [
    { user:'lena.fm',  init:'LF', grad:'linear-gradient(135deg,#334155,#0ea5e9)' },
    { user:'toshi_x',  init:'TX', grad:'linear-gradient(135deg,#3f2d1a,#d97706)' },
    { user:'rrrei',    init:'R',  grad:'linear-gradient(135deg,#3b0764,#a21caf)' },
    { user:'mono.no',  init:'MN', grad:'linear-gradient(135deg,#052e2b,#14b8a6)' },
  ];
  _obPeople = [...base, ...extra].map((p, i) => ({ ...p, mutual: (i * 7 + 3) % 11 + 1 }));
  return _obPeople;
}

// ── Init / sync ───────────────────────────────────────────────
function obInit(root) {
  if (typeof OB.step !== 'number') OB.step = 0;
  obSyncOne(root);
}
function obSync() { document.querySelectorAll('.s-onboarding').forEach(obSyncOne); }

function obSyncOne(root) {
  const active = obActiveSteps();
  const idx = Math.max(0, active.indexOf(OB.step));
  const num = idx + 1, total = active.length;

  const bar = root.querySelector('.ob-prog-bar'); if (bar) bar.style.width = (num / total * 100) + '%';
  const nEl = root.querySelector('.ob-step-n');   if (nEl) nEl.textContent = num;
  const tEl = root.querySelector('.ob-step-t');   if (tEl) tEl.textContent = total;

  root.querySelectorAll('.ob-panel').forEach(p => p.classList.toggle('ob-panel--on', +p.dataset.step === OB.step));

  const back = root.querySelector('.ob-back'); if (back) back.style.visibility = num <= 1 ? 'hidden' : 'visible';

  const ui = root.querySelector('.ob-user-input');
  if (ui && document.activeElement !== ui && ui.value !== OB.username) ui.value = OB.username;
  obUserHint(root);

  root.querySelectorAll('.ob-svc').forEach(b => b.classList.toggle('ob-svc--on', b.dataset.svc === OB.service));
  root.querySelectorAll('.ob-track-opt').forEach(b =>
    b.classList.toggle('ob-track-opt--on', OB.tracking !== null && ((+b.dataset.track === 1) === OB.tracking)));
  root.querySelectorAll('.ob-panel[data-step="3"] .chip').forEach(c =>
    c.classList.toggle('selected', OB.genres.has(c.textContent)));

  obRenderWall(root, 'artists');
  obRenderWall(root, 'albums');
  obRenderPeople(root);
  obRenderProfile(root);
  obSyncFooter(root);
}

function obUserHint(root) {
  const uh = root.querySelector('.ob-user-hint'); if (!uh) return;
  const ok = obUserValid();
  uh.classList.toggle('ob-user-hint--ok', ok);
  uh.textContent = ok ? '@' + OB.username + ' is available' : '3–20 characters · letters, numbers, underscores';
}

function obSyncFooter(root) {
  const skip = root.querySelector('.ob-skip');
  const next = root.querySelector('.ob-next');
  const step = OB.step;
  if (skip) skip.style.visibility = [1,2,4,5,6].includes(step) ? 'visible' : 'hidden';
  if (!next) return;
  if (step === 7)      { next.textContent = 'Start exploring';                       next.disabled = false; }
  else if (step === 0) { next.textContent = 'Continue';                              next.disabled = !obUserValid(); }
  else if (step === 4) { next.textContent = OB.artists.size   ? `Continue · ${OB.artists.size}`   : 'Continue'; next.disabled = false; }
  else if (step === 5) { next.textContent = OB.albums.size    ? `Continue · ${OB.albums.size}`    : 'Continue'; next.disabled = false; }
  else if (step === 6) { next.textContent = OB.following.size ? `Continue · ${OB.following.size}` : 'Continue'; next.disabled = false; }
  else                 { next.textContent = 'Continue';                              next.disabled = false; }
}

// ── Walls (artists / albums) ──────────────────────────────────
function obCard(type, key, image, sub, on, title) {
  const fn    = type === 'artist' ? 'obToggleArtist' : 'obToggleAlbum';
  const label = type === 'artist' ? key : title;
  const round = type === 'artist' ? ' ob-card-img--round' : '';
  return `<button class="ob-card${on ? ' ob-card--on' : ''}" onclick="${fn}('${obOc(key)}')">
    <span class="ob-card-img${round}" style="background-image:url('${image}')">
      <span class="ob-card-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
    </span>
    <span class="ob-card-t">${obEsc(label)}</span>
    <span class="ob-card-s">${obEsc(sub)}</span>
  </button>`;
}
function obChip(type, key, image, label) {
  const fn    = type === 'artist' ? 'obToggleArtist' : 'obToggleAlbum';
  const round = type === 'artist' ? ' ob-chip-img--round' : '';
  return `<button class="ob-chip" onclick="${fn}('${obOc(key)}')">
    <span class="ob-chip-img${round}" style="background-image:url('${image}')"></span>
    <span class="ob-chip-t">${obEsc(label)}</span>
    <span class="ob-chip-x">×</span>
  </button>`;
}
function obRenderWall(root, kind) {
  const wall   = root.querySelector(`.ob-wall[data-wall="${kind}"]`);
  const pinned = root.querySelector(`.ob-pinned[data-pinned="${kind}"]`);
  if (!wall) return;
  const q = OB.q[kind];
  if (kind === 'artists') {
    const sel = OB.artists, list = obArtistList();
    const match  = list.filter(a => !q || a.name.toLowerCase().includes(q));
    const chosen = list.filter(a => sel.has(a.name));
    if (pinned) pinned.innerHTML = chosen.map(a => obChip('artist', a.name, a.image, a.name)).join('');
    wall.innerHTML = match.map(a => obCard('artist', a.name, a.image, a.genre, sel.has(a.name))).join('')
      || `<div class="ob-empty">No artists match “${obEsc(q)}”.</div>`;
  } else {
    const sel = OB.albums, list = obAlbumList();
    const match  = list.filter(a => !q || a.album.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q));
    const chosen = list.filter(a => sel.has(albumKey(a)));
    if (pinned) pinned.innerHTML = chosen.map(a => obChip('album', albumKey(a), a.image, a.album)).join('');
    wall.innerHTML = match.slice(0, 60).map(a => obCard('album', albumKey(a), a.image, a.artist, sel.has(albumKey(a)), a.album)).join('')
      || `<div class="ob-empty">No albums match “${obEsc(q)}”.</div>`;
  }
}

function obRenderPeople(root) {
  const box = root.querySelector('.ob-people'); if (!box) return;
  box.innerHTML = obPeopleList().map(p => {
    const on = OB.following.has(p.user);
    return `<div class="ob-person">
      <span class="ob-person-av" style="background:${p.grad}">${obEsc(p.init)}</span>
      <span class="ob-person-main">
        <span class="ob-person-user">@${obEsc(p.user)}</span>
        <span class="ob-person-mutual">${p.mutual} mutual${p.mutual > 1 ? 's' : ''}</span>
      </span>
      <button class="ob-follow${on ? ' ob-follow--on' : ''}" onclick="obToggleFollow('${obOc(p.user)}')">${on ? 'Following' : 'Follow'}</button>
    </div>`;
  }).join('');
}

function obRenderProfile(root) {
  const box = root.querySelector('.ob-profile'); if (!box) return;
  const u = OB.username || 'you';
  const init = (u[0] || '?').toUpperCase();
  const svc = OB.service ? OB.service[0].toUpperCase() + OB.service.slice(1) : null;
  const stat = (n, l) => `<div class="ob-stat"><div class="ob-stat-n">${n}</div><div class="ob-stat-l">${l}</div></div>`;
  box.innerHTML = `
    <div class="ob-pf-hero">
      <div class="ob-pf-av">${obEsc(init)}</div>
      <div class="ob-pf-name">@${obEsc(u)}</div>
      <div class="ob-pf-tagline">fresh on Spindeck</div>
      ${svc ? `<div class="ob-pf-badge"><span class="ob-pf-badge-dot"></span>${obEsc(svc)} connected${OB.tracking ? ' · sharing' : ''}</div>` : ''}
    </div>
    <div class="ob-pf-stats">
      ${stat(OB.genres.size, 'genres')}
      ${stat(OB.artists.size, 'artists')}
      ${stat(OB.albums.size, 'albums')}
      ${stat(OB.following.size, 'following')}
    </div>
    <div class="ob-pf-note">You can refine all of this any time from your profile.</div>`;
}

// ── Actions ───────────────────────────────────────────────────
window.obSetUsername = function (v) {
  OB.username = String(v).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);
  document.querySelectorAll('.s-onboarding').forEach(r => {
    const ui = r.querySelector('.ob-user-input');
    if (ui && ui.value !== OB.username) ui.value = OB.username;   // echo the sanitized value
    obUserHint(r);
    obSyncFooter(r);
  });
};
window.obConnect      = function (id)  { OB.service = OB.service === id ? null : id; obSync(); };
window.obSetTracking  = function (v)   { OB.tracking = v; obSync(); setTimeout(() => obNext(), 240); };
window.obToggleGenre  = function (el, name) { OB.genres.has(name) ? OB.genres.delete(name) : OB.genres.add(name); obSync(); };
window.obToggleArtist = function (name){ OB.artists.has(name) ? OB.artists.delete(name) : OB.artists.add(name); obSync(); };
window.obToggleAlbum  = function (key) { OB.albums.has(key) ? OB.albums.delete(key) : OB.albums.add(key); obSync(); };
window.obToggleFollow = function (user){ OB.following.has(user) ? OB.following.delete(user) : OB.following.add(user); obSync(); };
window.obSearch       = function (kind, v) { OB.q[kind] = String(v).toLowerCase(); document.querySelectorAll('.s-onboarding').forEach(r => obRenderWall(r, kind)); };

window.obNext = function () {
  if (OB.step === 0 && !obUserValid()) return;   // username required
  const active = obActiveSteps();
  const i = active.indexOf(OB.step);
  if (i >= active.length - 1) { obFinish(); return; }
  OB.step = active[i + 1];
  obSync();
  obScrollTop();
};
window.obBack = function () {
  const active = obActiveSteps();
  const i = active.indexOf(OB.step);
  if (i <= 0) { navigate('auth'); return; }
  OB.step = active[i - 1];
  obSync();
  obScrollTop();
};
function obScrollTop() { document.querySelectorAll('.s-onboarding .ob-stage').forEach(s => s.scrollTop = 0); }
window.obFinish = function () { navigate('home'); };

// ══════════════════════════════════════════════════════════════
//  PROFILE — "Funky" theme 01 (5 favourite albums · social · info)
// ══════════════════════════════════════════════════════════════
window.PROFILE = {
  name:   'Eric',
  handle: 'ericd',
  bio:    'Shoegaze apologist and lifelong crate-digger. I review mostly ambient, dream-pop and hip-hop, but I\'ll give anything one honest listen. Half my week is spent building playlists like mixtapes for people I haven\'t met yet.',
  location:   'South Korea',
  occupation: 'Motion Designer',
  pic:    'images/playlist-statue-night.jpg',
  favs:   ['Punisher', 'Loveless', 'Blonde', 'Currents', 'To Pimp a Butterfly'],
  socials:{ instagram: 'ericd', x: 'ericd', soundcloud: 'ericd' },
  // Prototype stats (fictional)
  reviews:   328,
  playlists: 12,
  followers: 1900,
  following: 214,
  since:     '2023',
  // Favourite artists (4) and songs (5). Album names supply the artwork.
  favArtists: ['Phoebe Bridgers', 'Frank Ocean', 'My Bloody Valentine', 'Tame Impala'],
  favSongs: [
    { title: 'Scott Street',                 artist: 'Phoebe Bridgers', album: 'Punisher' },
    { title: 'Ivy',                          artist: 'Frank Ocean',     album: 'Blonde' },
    { title: 'Only Shallow',                 artist: 'My Bloody Valentine', album: 'Loveless' },
    { title: 'The Less I Know the Better',   artist: 'Tame Impala',     album: 'Currents' },
    { title: 'Alright',                      artist: 'Kendrick Lamar',  album: 'To Pimp a Butterfly' },
  ],
};

// Curated photo pool (lo-fi / Y2K / nature / surreal) used for random profile
// pictures and playlist covers. 64 web-optimised crops from Eric's set, plus
// the existing playlist photos.
const PROFILE_PHOTOS = [
  'images/rp-01.jpg', 'images/rp-02.jpg', 'images/rp-03.jpg', 'images/rp-04.jpg', 'images/rp-05.jpg', 'images/rp-06.jpg', 'images/rp-07.jpg', 'images/rp-08.jpg',
  'images/rp-09.jpg', 'images/rp-10.jpg', 'images/rp-11.jpg', 'images/rp-12.jpg', 'images/rp-13.jpg', 'images/rp-14.jpg', 'images/rp-15.jpg', 'images/rp-16.jpg',
  'images/rp-17.jpg', 'images/rp-18.jpg', 'images/rp-19.jpg', 'images/rp-20.jpg', 'images/rp-21.jpg', 'images/rp-22.jpg', 'images/rp-23.jpg', 'images/rp-24.jpg',
  'images/rp-25.jpg', 'images/rp-26.jpg', 'images/rp-27.jpg', 'images/rp-28.jpg', 'images/rp-29.jpg', 'images/rp-30.jpg', 'images/rp-31.jpg', 'images/rp-32.jpg',
  'images/rp-33.jpg', 'images/rp-34.jpg', 'images/rp-35.jpg', 'images/rp-36.jpg', 'images/rp-37.jpg', 'images/rp-38.jpg', 'images/rp-39.jpg', 'images/rp-40.jpg',
  'images/rp-41.jpg', 'images/rp-42.jpg', 'images/rp-43.jpg', 'images/rp-44.jpg', 'images/rp-45.jpg', 'images/rp-46.jpg', 'images/rp-47.jpg', 'images/rp-48.jpg',
  'images/rp-49.jpg', 'images/rp-50.jpg', 'images/rp-51.jpg', 'images/rp-52.jpg', 'images/rp-53.jpg', 'images/rp-54.jpg', 'images/rp-55.jpg', 'images/rp-56.jpg',
  'images/rp-57.jpg', 'images/rp-58.jpg', 'images/rp-59.jpg', 'images/rp-60.jpg', 'images/rp-61.jpg', 'images/rp-62.jpg', 'images/rp-63.jpg', 'images/rp-64.jpg',
  'images/playlist-cyano-birds.jpg', 'images/playlist-car-dash.jpg', 'images/playlist-misty-lake.jpg', 'images/playlist-chrome-ooh.jpg', 'images/playlist-city-red.jpg',
  'images/playlist-wildflowers.jpg', 'images/playlist-hibiscus.jpg', 'images/playlist-statue-night.jpg', 'images/playlist-ink-alley.jpg', 'images/playlist-cyano-horse.jpg',
];

// ── Random persona: rolled once on load so every visit shows a new profile ──
// (image · nickname/handle · bio · location · job · numbers · favourite albums ·
//  artists · playlists · recently-rated). Edits (picker) still persist per visit.
function randomizeProfile() {
  const A = window.ARCHIVE || [];
  if (!A.length) return;
  const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
  const sample = (arr, n) => {
    const c = arr.slice();
    for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
    return c.slice(0, n);
  };
  const ri = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

  const nicks = ['Mira', 'Dev', 'Sasha', 'Ken', 'Luca', 'Noa', 'Remy', 'Yuki', 'Ira', 'Theo', 'Juno', 'Cass', 'Wren', 'Sol', 'Nadia', 'Bram', 'Pax', 'Indie', 'Roan', 'Suki', 'Milo', 'Fern', 'Dae', 'Otis', 'Vera', 'Kai',
    // Long-username examples — the pill + banner stretch to fit these, no overflow
    'Konstantina', 'Alexandrina', 'Bartholomew', 'Maximiliano', 'Anastasiya', 'Persephone', 'shoegazer_fm', 'vinyl_goblin', 'moonlit_echo', 'reverb_witch'];
  const sfx = ['', '', '_', 'xo', '.wav', '_fm', 'core', 'zzz', '.mp3', 'beats', 'fm', '_hifi', '777'];
  const bios = [
    'shoegaze apologist. i will make you a playlist whether you asked or not',
    '19 | i make beats in my closet | do not perceive me',
    'certified yapper. i will review your favorite album and hurt your feelings <3',
    'bassist for a band you haven\'t heard of (yet). we play basements only.',
    '23, gemini, emotionally distributed across four streaming services',
    'music is just vibes with extra steps',
    'i peaked musically in 2016 and honestly i\'m okay with that',
    'drummer 🥁 yes i heard you talking during the quiet part',
    'put a song on aux and watch me make it everyone\'s problem',
    'former emo → current emo → future emo. it\'s a cycle.',
    'i don\'t have a personality, i have a rate-your-music account',
    'lead singer of Wet Sockets 🎤 stream our EP or don\'t (please do)',
    '17 y/o aspiring producer. my mom says i\'m talented.',
    'will trade playlists for emotional support',
    'professional overthinker, amateur guitarist',
    'if it\'s not shoegaze i\'m asleep 💤',
    '26 | dog dad | i cry to jazz and i\'m not ashamed',
    'here to rate albums and touch grass. mostly the albums.',
    'i listen to everything and remember absolutely nothing',
    'sad girl autumn, all year round',
    'synth hoarder. i own more cables than friends.',
    'my toxic trait is thinking i could\'ve produced that better',
    '31, dad of two, still think about that one breakcore set weekly',
    'aux cord dictator. benevolent, mostly.',
    'i made my whole personality one obscure band and i regret nothing',
    'ur honor, i was simply feeling the music',
    'vinyl guy at parties (insufferable). digital everywhere else.',
    'screamo for breakfast, ambient for dinner',
    'i rate everything 4 stars because commitment is scary',
    'guitarist in three group chats and zero actual bands',
    '20 | film photography + slowcore | ask me about my tote bags',
    'heard it before it was cool and i WILL bring it up',
  ];
  const countries = ['South Korea', 'Japan', 'United States', 'United Kingdom', 'Germany', 'Brazil', 'Canada', 'France', 'Australia', 'Mexico', 'Sweden', 'Netherlands', 'Spain', 'Italy', 'Nigeria', 'Philippines', 'Poland', 'Portugal'];
  const jobs = ['Motion Designer', 'Barista', 'Software Engineer', 'Illustrator', 'Student', 'Music Teacher', 'Photographer', 'DJ', 'Producer', 'Bookseller', 'Architect', 'Nurse', 'Sound Engineer', 'Freelance Writer', 'Game Dev', 'Line Cook', 'Librarian', 'Tattoo Artist'];
  const pics = PROFILE_PHOTOS;

  const nick = rnd(nicks);
  const handle = nick.toLowerCase() + rnd(sfx);
  const artists = [...new Set(A.map(a => a.artist))];
  const pls = (typeof plLists === 'function') ? plLists() : [];

  const P = window.PROFILE;
  P.name = nick;
  P.handle = handle;
  P.bio = rnd(bios);
  P.location = rnd(countries);
  P.occupation = rnd(jobs);
  P.pic = rnd(pics);
  P.favs = sample(A, 5).map(a => a.album);
  P.favArtists = sample(artists, 4);
  // Favourite songs — one track pulled from each fav album (deterministic titles)
  P.favSongs = P.favs.map(albName => {
    const a = A.find(x => x.album === albName);
    if (!a) return null;
    const tr = (typeof songsFor === 'function') ? songsFor(a) : [];
    const t = tr.length ? tr[Math.floor(Math.random() * tr.length)] : null;
    return { title: t ? t.title : a.album, artist: a.artist, album: a.album };
  }).filter(Boolean);
  P.reviews = ri(12, 940);
  P.playlists = ri(3, 48);
  P.followers = ri(30, 48000);
  P.following = ri(20, 1400);
  P.socials = { instagram: handle, x: handle, soundcloud: handle };
  P.playlistNames = sample(pls, Math.min(3, pls.length)).map(p => p.name);
  P.playlistCovers = sample(pics, 3);   // photo covers for the shown playlists
  P.recent = sample(A, 4).map(a => a.album);
}
randomizeProfile();

/* ══════════════════════════════════════════════════════════════════════════
   PERSONAS — the mockup, shown as four different people
   ══════════════════════════════════════════════════════════════════════════
   window.PERSONAS comes from personas.js, GENERATED by tools/build_personas.py
   out of personas/personas.csv + personas/taste/*.csv. Each persona carries
   its own catalogue (real albums + Deezer CDN artwork), its own profile, and a
   skin. Switching one swaps ARCHIVE wholesale, so every screen — home bento,
   wall, playlists, artist pages — re-derives from that person's taste.

   `null` is a real state: the built-in data.js archive with the random persona,
   i.e. the mockup as it was before any of this. The switcher calls it "Demo".  */

const BASE_ARCHIVE = window.ARCHIVE;          // data.js's hand-authored catalogue
const BASE_ARTIST_IMG = Object.assign({}, window.ARTIST_IMG || {});
const BASE_FRIEND_ACTIVITY = (window.FRIEND_ACTIVITY || []).slice();
window.ACTIVE_PERSONA = null;

function personaById(id) {
  return (window.PERSONAS || []).find(p => p.id === id) || null;
}

// One persona album → an ARCHIVE-shaped record. The build script already emits
// rating/reviewCount/reviews in data.js's shape; this only fills the artist
// blurbs, which Deezer has no field for.
function personaAlbums(p) {
  return p.albums.map(a => Object.assign({}, a, {
    artistDesc: a.artistDesc || `${a.genre} artist`,
    artistBio: a.artistBio ||
      `${a.artist} is an artist working in ${String(a.genre).toLowerCase()}. ${a.album} came out in ${a.year || 'recent years'}.`,
  }));
}

/* The skin. The app's screens were built on hard-coded hex, so a persona can't
   simply re-declare a handful of tokens — it overrides the surfaces carrying
   most of the look (page, cards, accent, type, corner radius) through one
   injected stylesheet scoped to `.persona-<id>` on the screen. Deliberately a
   broad first pass: enough that four personas read as four different apps,
   with per-persona detailing still to come. */
/* Elements a persona may re-ink: page CHROME only — headings and labels that sit
   on the persona's own background.
   ⚠️ Nothing from the bento stats block or the review panel belongs here
   (`.v3-blue-album`, `.v3-blue-count`, `.v3-rev-name`, `.v3-rev-text`, …). Those
   sit on the album's PROCEDURAL flood colour, which is dark in both themes, and
   they already carry theming that accounts for it. Re-inking them from the
   persona's light set put dark text on a dark album and made it unreadable. */
const PERSONA_INK1 = ['.v3-brand-name', '.wall2-title', '.pl2-title',
  '.set-title', '.v3-aa-title'];
const PERSONA_INK2 = ['.v3-brand-tag', '.wall2-sub'];

function personaSkinCss(p) {
  const s = p.skin, k = `.app-screen.persona-${p.id}`;
  // A screen is the LIGHT variant when it carries --light (home-shell screens)
  // or sd-theme-light (auth / onboarding / song). Both sets are emitted so the
  // viewer's side-by-side Dark|Light pair stays a real comparison — a persona
  // that declared one background painted both variants the same.
  const darkBases = [k];
  const lightBases = [`${k}.s-home-v3--light`, `${k}.sd-theme-light`];

  // Each base selector needs its OWN descendant — "a, b .x" would only scope
  // .x under b, silently dropping the rule for every light screen but the last.
  const each = (bases, kids) => bases.flatMap(b => kids.map(c => `${b} ${c}`)).join(',\n');

  /* ⚠️ NOT set here, deliberately:
     - `--v3-accent` / `--v3-box*` — the accent is EXTRACTED FROM THE ALBUM ART
       (`applyAlbumColors`). "Album art drives colour" is a core rule; a persona
       tinting it would flatten every album to the same hue.
     - `--star` — the rating gold now RESOLVES from `--v3-accent` first (see
       app.css), so setting it here would pin the vinyls to one colour and stop
       them following the album. The persona only supplies `--persona-accent`,
       which is the fallback for screens that have no cover to extract from.
     - `--text3` — the empty-vinyl grey, already themed per variant. */
  const tokens = (t) => `
  --persona-accent: ${t.accent};
  --sd-bg: ${t.bg};     --sd-ink: ${t.ink};   --sd-ink2: ${t.ink2};
  --sd-ink3: ${t.ink2}; --sd-card: ${t.card}; --sd-well: ${t.card};`;

  /* The page fill, held OFF the review/album/artist states. Those flood the
     screen with the album's procedural colour via `.s-home-v3--review`, which is
     only (0,1,0) specificity — a plain `.app-screen.persona-x` rule is (0,2,0)
     and silently beat it, killing the fullscreen fill. */
  const bg = (bases, t) =>
    bases.map(b => `${b}:not(.s-home-v3--review)`).join(',\n') + ` { background: ${t.bg}; }`;

  const block = (bases, t) => `
${each(bases, PERSONA_INK1)} { color: ${t.ink}; }
${each(bases, PERSONA_INK2)} { color: ${t.ink2}; }`;

  return `
${k} {${tokens(s.dark)}
  font-family: ${s.font}, var(--font-main), sans-serif;
}
${lightBases.join(',\n')} {${tokens(s.light)}}
${bg(darkBases, s.dark)}
${bg(lightBases, s.light)}
${block(darkBases, s.dark)}
${block(lightBases, s.light)}
${each([k], ['.v3-album', '.wall2-art', '.pl2-card'])} { border-radius: ${s.radius}; }`;
}

function applyPersonaSkins() {
  let el = document.getElementById('persona-skins');
  if (!el) {
    el = document.createElement('style');
    el.id = 'persona-skins';
    document.head.appendChild(el);
  }
  el.textContent = (window.PERSONAS || []).map(personaSkinCss).join('\n');
}

/* Swap the whole app over to one persona (or back to the demo data with null).
   Order matters: ARCHIVE first, because featuredAlbum/trendingAlbums and the
   profile are all derived FROM it. */
window.applyPersona = function (id) {
  const p = id ? personaById(id) : null;
  window.ACTIVE_PERSONA = p ? p.id : null;
  try { localStorage.setItem('spindeck-persona', p ? p.id : ''); } catch (e) {}

  if (p && p.albums.length) {
    window.ARCHIVE = personaAlbums(p);
    window.ARTIST_IMG = Object.assign({}, BASE_ARTIST_IMG, p.artistImg || {});
  } else {
    window.ARCHIVE = BASE_ARCHIVE;
    window.ARTIST_IMG = Object.assign({}, BASE_ARTIST_IMG);
  }
  const A = window.ARCHIVE;
  window._pinnedReview = null;
  if (p) {
    /* A persona's identity is authored and fixed, so it can't get its variety
       the way the demo does (randomizeProfile re-rolls a whole new person each
       visit). It comes from the HOME instead: every switch — and every page
       load, since initPersonas re-applies — deals a fresh featured album, swipe
       queue, rails and feed. */
    reshuffleHome();
    personaProfile(p);
  } else {
    window.featuredAlbum = A[Math.floor(Date.now() / 86400000) % A.length];
    window.trendingAlbums = A.filter(x => x !== window.featuredAlbum);
    window.activeAlbum = window.featuredAlbum;
    window.FRIEND_ACTIVITY = BASE_FRIEND_ACTIVITY.slice();
    // feedEvents() memoises its deal into window._FEED, which would otherwise
    // keep serving the PREVIOUS persona's activity after the swap.
    window._FEED = null;
    randomizeProfile();
  }

  applyPersonaClass();
  renderPersonaBar();
  renderViewer();
  // Widen the shelf in the background. ~30 albums cycled fast enough that the
  // bento started repeating; expandRecs pulls a few hundred off Deezer radios
  // seeded by this persona's own artists. Deliberately NOT awaited — the home
  // paints from the persona's records immediately and the rest arrive under it.
  if (typeof expandRecs === 'function') expandRecs();
};

// Every screen instance carries the persona class so the skin sheet can bite.
// Re-applied after each render, since renderViewer rebuilds the screens.
function applyPersonaClass() {
  const id = window.ACTIVE_PERSONA;
  document.querySelectorAll('.app-screen').forEach(el => {
    el.classList.forEach(c => { if (c.startsWith('persona-')) el.classList.remove(c); });
    if (id) el.classList.add('persona-' + id);
  });
}

function shuffled(arr) {
  const c = arr.slice();
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

/* Re-deal the home page: featured album, the bento's swipe queue, the
   you-may-know rails and (for a persona) the friend feed.
   ⚠️ `trendingAlbums` gets the WHOLE remaining catalogue. It reads like it
   should be five — the name says so and data.js's comment says so — but
   `albumSeq()` is `featured + trendingAlbums`, so slicing it to five silently
   shrinks the bento's swipe queue to six albums. */
function reshuffleHome() {
  const A = window.ARCHIVE;
  if (!A || !A.length) return;
  const order = shuffled(A);
  window.featuredAlbum = order[0];
  window.trendingAlbums = order.slice(1);
  window.activeAlbum = window.featuredAlbum;
  window._FEED = null;            // feedEvents() deals a fresh activity feed
  const p = window.ACTIVE_PERSONA && personaById(window.ACTIVE_PERSONA);
  if (p) window.FRIEND_ACTIVITY = personaFeed(p);
}

/* The home feed for a persona, generated fresh each deal.
   data.js's FRIEND_ACTIVITY names demo albums by title, so under a persona
   every card would point at a record no longer in ARCHIVE (broken art, dead
   taps). Rather than remap it 1:1 — which produced the same feed every load —
   this deals a new one: people from the demo's cast, albums drawn at random
   from the persona's own shelf, and the QUOTE taken from that album's own
   generated reviews, so the card and the album page agree with each other. */
function personaFeed(p) {
  const A = window.ARCHIVE;
  if (!A.length) return [];
  const cast = BASE_FRIEND_ACTIVITY;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const ago = () => {
    const h = 1 + Math.floor(Math.random() * 47);
    return h < 24 ? `${h}h` : `${Math.round(h / 24)}d`;
  };
  return shuffled(A).slice(0, Math.min(cast.length, A.length)).map(a => {
    const who = pick(cast);
    const rev = (a.reviews && a.reviews.length) ? pick(a.reviews) : null;
    return {
      user: who.user, init: who.init, grad: who.grad,
      album: a.album, artist: a.artist, year: a.year, image: a.image,
      rating: rev ? rev.rating : a.rating,
      quote: rev ? `"${rev.text}"` : '',
      likes: 3 + Math.floor(Math.random() * 60),
      comments: Math.floor(Math.random() * 14),
      ago: ago(),
    };
  });
}

// The persona's profile: authored identity from the CSV, taste from their
// catalogue — so the favourites shown are always albums they actually have.
function personaProfile(p) {
  const A = window.ARCHIVE, P = window.PROFILE;
  Object.assign(P, p.profile);
  P.pic = p.profile.pic || PROFILE_PHOTOS[
    Math.abs([...p.id].reduce((h, c) => h * 31 + c.charCodeAt(0), 7)) % PROFILE_PHOTOS.length];
  P.favs = A.slice(0, 5).map(a => a.album);
  P.favArtists = [...new Set(A.map(a => a.artist))].slice(0, 4);
  P.favSongs = A.slice(0, 5).map(a => ({
    // favTrack is the CSV's `track` column when filled in; otherwise a
    // deterministic stand-in from the same generator the tracklist uses.
    title: a.favTrack || ((typeof songsFor === 'function') ? ((songsFor(a)[0] || {}).title || '') : '') || a.album,
    artist: a.artist, album: a.album,
  }));
  P.socials = { instagram: p.profile.handle, x: p.profile.handle, soundcloud: p.profile.handle };
  P.playlistNames = (typeof plLists === 'function') ? plLists().slice(0, 3).map(x => x.name) : [];
  P.playlistCovers = A.slice(5, 8).map(a => a.image);
  P.recent = A.slice(5, 9).map(a => a.album);
}

/* The switcher. Two presentations of one list:
   - desktop toolbar: a segmented control, all options visible at once;
   - mobile bar: a <select>, because five names will not fit beside the
     Single/Multi/Flow/Live segment on a phone. */
function renderPersonaBar() {
  const list = window.PERSONAS || [];
  if (!list.length) return;
  // No "Demo" entry: `eric` IS the demo now — a real person's catalogue reads
  // better than the random one, and the slot was the widest button in a row
  // that had already outgrown its section. `applyPersona('')` still works and
  // still restores data.js's catalogue; it just has no button.
  const opts = list.map(p => ({ id: p.id, name: p.profile.name }));
  const active = window.ACTIVE_PERSONA || '';

  const bar = document.getElementById('persona-bar');
  if (bar) {
    bar.innerHTML = opts.map(o =>
      `<button class="tb-pers${active === o.id ? ' active' : ''}"` +
      ` onclick="applyPersona('${o.id}')" title="${o.id}">${o.name}</button>`).join('');
  }

  const mb = document.getElementById('persona-bar-mb');
  if (mb) {
    mb.innerHTML = `<select class="tb-pers-sel" aria-label="Persona"
        onchange="applyPersona(this.value)">${opts.map(o =>
      `<option value="${o.id}"${active === o.id ? ' selected' : ''}>${o.name}</option>`).join('')}</select>`;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   DEV BOX — tune the compact bento's two info lines, then copy the CSS
   ══════════════════════════════════════════════════════════════════════════
   Sliders write a <style> block; the SAME string is what "Copy CSS" hands over,
   so what you see is exactly what you paste. Rules are scoped
   `.s-home-v3:not(.s-home-v3--review)` — (0,2,0), which beats the base
   `.v3-blue-info-row` declarations without touching the review/album state.
   Defaults below are the CURRENT values in app.css, so an untouched panel emits
   the layout as it already stands. */

const DEVBOX_FIELDS = [
  { grp: 'Block' },
  { k: 'gap',  label: 'Gap',   min: 0,   max: 24, step: 0.5, def: 3 },
  { k: 'padT', label: 'Pad T', min: 0,   max: 24, step: 0.5, def: 9 },
  { k: 'padL', label: 'Pad L', min: 0,   max: 32, step: 0.5, def: 12 },
  { grp: 'Line 1 — album · artist' },
  { k: 'l1x', label: 'X',     min: -20, max: 20, step: 0.5, def: 0 },
  { k: 'l1y', label: 'Y',     min: -20, max: 20, step: 0.5, def: -4.5 },
  { k: 'l1s', label: 'Size',  min: 0.6, max: 1.8, step: 0.01, def: 1 },
  { grp: 'Line 2 — rating' },
  { k: 'l2x', label: 'X',     min: -20, max: 20, step: 0.5, def: 0 },
  { k: 'l2y', label: 'Y',     min: -20, max: 20, step: 0.5, def: -0.5 },
  { k: 'l2s', label: 'Size',  min: 0.6, max: 1.8, step: 0.01, def: 1 },
];

const DEVBOX = {};
DEVBOX_FIELDS.forEach(f => { if (f.k) DEVBOX[f.k] = f.def; });

function devBoxCss() {
  const d = DEVBOX, n = v => (Math.round(v * 100) / 100);
  return `/* Compact bento info box — tuned in the dev box */
.s-home-v3:not(.s-home-v3--review) .v3-blue {
  gap: ${n(d.gap)}px;
  padding: ${n(d.padT)}px ${n(d.padL)}px 8px;
}
.s-home-v3:not(.s-home-v3--review) .v3-blue-info-row {
  left: ${n(d.l1x)}px;
  top: ${n(d.l1y)}px;
  transform: scale(${n(d.l1s)});
  transform-origin: left center;
}
.s-home-v3:not(.s-home-v3--review) .v3-blue-stars-row {
  left: ${n(d.l2x)}px;
  top: ${n(d.l2y)}px;
  transform: scale(${n(d.l2s)});
  transform-origin: left center;
}`;
}

function devBoxApply() {
  let el = document.getElementById('devbox-live');
  if (!el) {
    el = document.createElement('style');
    el.id = 'devbox-live';
    document.head.appendChild(el);   // last in head → wins ties with app.css
  }
  const css = devBoxCss();
  el.textContent = css;
  const out = document.getElementById('db-out');
  if (out) out.value = css;
  document.querySelectorAll('#db-body input[type=range]').forEach(inp => {
    const lbl = inp.parentElement.querySelector('.db-val');
    if (lbl) lbl.textContent = DEVBOX[inp.dataset.k];
  });
}

function initDevBox() {
  const body = document.getElementById('db-body');
  if (!body) return;
  body.innerHTML = DEVBOX_FIELDS.map(f => f.grp
    ? `<div class="db-grp">${f.grp}</div>`
    : `<label class="db-row"><span>${f.label}</span>
         <input type="range" data-k="${f.k}" min="${f.min}" max="${f.max}" step="${f.step}" value="${f.def}">
         <span class="db-val">${f.def}</span></label>`).join('');
  body.addEventListener('input', e => {
    const inp = e.target.closest('input[type=range]');
    if (!inp) return;
    DEVBOX[inp.dataset.k] = parseFloat(inp.value);
    devBoxApply();
  });
  devBoxApply();
}

window.toggleDevBox = function () {
  const el = document.getElementById('devbox');
  if (el) el.hidden = !el.hidden;
};

window.devBoxReset = function () {
  DEVBOX_FIELDS.forEach(f => { if (f.k) DEVBOX[f.k] = f.def; });
  document.querySelectorAll('#db-body input[type=range]').forEach(inp => {
    inp.value = DEVBOX[inp.dataset.k];
  });
  devBoxApply();
};

window.devBoxCopy = function (btn) {
  const css = devBoxCss();
  const done = () => {
    const was = btn.textContent;
    btn.textContent = 'Copied ✓';
    setTimeout(() => { btn.textContent = was; }, 1200);
  };
  // The textarea is the fallback path when the clipboard API is unavailable
  // (it is, on file:// in some browsers) — select it so Ctrl+C still works.
  const out = document.getElementById('db-out');
  if (navigator.clipboard) navigator.clipboard.writeText(css).then(done, () => { if (out) out.select(); });
  else if (out) { out.select(); document.execCommand('copy'); done(); }
};

// Boot: restore the last-used persona, else open as `eric` — with the Demo
// button gone there is no way back to the unpersona'd data.js catalogue from
// the UI, so booting into it would leave every button unlit.
function initPersonas() {
  if (!(window.PERSONAS || []).length) return;
  applyPersonaSkins();
  let saved = '';
  try { saved = localStorage.getItem('spindeck-persona') || ''; } catch (e) {}
  const start = (saved && personaById(saved)) ? saved
              : (personaById('eric') ? 'eric' : window.PERSONAS[0].id);
  applyPersona(start);
}

/* ── The category-aware content editor ────────────────────────
   ONE bottom sheet behind every "+" / slot on the profile. What it searches is
   decided by the KIND it's opened with, so filling an album disc, a playlist
   row, a favourite song, the photo or a text field all use the same popup:

     album | song | playlist | photo   → a searchable grid
     name  | text                      → a small form (the only non-search kinds)

   Everything writes through profFavTarget(), which is the Edit Profile DRAFT
   when that page is open and PROFILE otherwise — so an unsaved change on the
   edit page can still be thrown away by Cancel.
   ───────────────────────────────────────────────────────────── */
const PFE_TEXT = {
  bio:        { label: 'Bio',        ph: 'Tell people what you are into.', max: 240, multi: true },
  location:   { label: 'Location',   ph: 'Country or city', max: 30 },
  occupation: { label: 'Occupation', ph: 'What you do',     max: 30 },
};
const PFE_KIND = {
  album:    { title: 'Choose an album',   ph: 'Search albums' },
  song:     { title: 'Choose a song',     ph: 'Search songs, albums, artists' },
  playlist: { title: 'Choose a playlist', ph: 'Search your playlists' },
  photo:    { title: 'Choose a photo',    ph: '' },
};
let _profSlot = 0;
let _profKind = 'album';

window.openProfEditor = function (kind, slot) {
  _profKind = kind || 'album';
  _profSlot = (slot == null) ? 0 : (isNaN(slot) ? slot : Number(slot));
  const host = document.querySelector('.app-screen.s-pfedit')
            || document.querySelector('.app-screen.s-prof2')
            || document.querySelector('.app-screen') || document.body;
  const ov = ensureProfPicker();
  host.appendChild(ov);   // inherits the panel/home palette vars from .s-prof2
  profPickerBuild();
  requestAnimationFrame(() => {
    ov.classList.add('open');
    const f = ov.querySelector('.pp-input, .pp-text');
    setTimeout(() => f && f.focus(), 80);
  });
};
// Back-compat: the profile card's album discs still call openProfPicker(slot).
window.openProfPicker = function (slot) { openProfEditor('album', slot); };

function ensureProfPicker() {
  let ov = document.getElementById('prof-picker');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'prof-picker';
  ov.className = 'prof-picker';
  ov.addEventListener('click', e => { if (e.target === ov) closeProfPicker(); });
  return ov;
}

// Build the sheet for the current kind — search kinds get a searchbar + grid,
// the text kinds get a small form — then fill it.
function profPickerBuild() {
  const ov = document.getElementById('prof-picker'); if (!ov) return;
  const T = profFavTarget();
  const isText = _profKind === 'name' || _profKind === 'text';
  let body;
  if (_profKind === 'name') {
    body = `
      <div class="pp-form">
        <label class="pp-flabel">Display name</label>
        <input class="pp-text" type="text" maxlength="24" value="${obEsc(T.name || '')}" placeholder="Your name" spellcheck="false">
        <label class="pp-flabel">Handle</label>
        <div class="pp-handle"><span>@</span><input class="pp-text pp-text2" type="text" maxlength="20" value="${obEsc(T.handle || '')}" placeholder="handle" spellcheck="false"></div>
        <button class="pp-done" onclick="profTextDone()">Done</button>
      </div>`;
  } else if (_profKind === 'text') {
    const cfg = PFE_TEXT[_profSlot] || { label: _profSlot, ph: '', max: 120 };
    body = `
      <div class="pp-form">
        <label class="pp-flabel">${cfg.label}</label>
        ${cfg.multi
          ? `<textarea class="pp-text pp-textarea" rows="5" maxlength="${cfg.max}" placeholder="${cfg.ph}" spellcheck="false">${obEsc(T[_profSlot] || '')}</textarea>`
          : `<input class="pp-text" type="text" maxlength="${cfg.max}" value="${obEsc(T[_profSlot] || '')}" placeholder="${cfg.ph}" spellcheck="false">`}
        <button class="pp-done" onclick="profTextDone()">Done</button>
      </div>`;
  } else {
    const k = PFE_KIND[_profKind] || PFE_KIND.album;
    body = `
      ${_profKind === 'photo' ? `
      <label class="pp-upload">
        <input type="file" accept="image/*" onchange="profPhotoUpload(this)">
        Upload your own
      </label>` : `
      <div class="pp-searchbar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
        <input class="pp-input" type="text" placeholder="${k.ph}" autocomplete="off" spellcheck="false" oninput="profPickerRender(this.value)">
      </div>`}
      <div class="pp-grid"></div>`;
  }
  const title = isText
    ? (_profKind === 'name' ? 'Name & handle' : ((PFE_TEXT[_profSlot] || {}).label || 'Edit'))
    : (PFE_KIND[_profKind] || PFE_KIND.album).title;
  ov.innerHTML = `
    <div class="pp-sheet${isText ? ' pp-sheet--form' : ''}">
      <div class="pp-handle-bar"></div>
      <div class="pp-top">
        <div class="pp-title">${title}</div>
        <button class="pp-close" onclick="closeProfPicker()" aria-label="Close">×</button>
      </div>
      ${body}
    </div>`;
  if (!isText) profPickerRender('');
}

// The searchable kinds, normalised to one row shape.
function profPickerItems(q) {
  q = String(q || '').toLowerCase();
  const T = profFavTarget();
  if (_profKind === 'album') {
    const cur = (T.favs || [])[_profSlot];
    return (window.ARCHIVE || [])
      .filter(a => !q || a.album.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q))
      .slice(0, 60)
      .map(a => ({ img: a.image, t: a.album, s: a.artist, on: a.album === cur, pick: `profPick('${obOc(a.album)}')` }));
  }
  if (_profKind === 'song') {
    const cur = (T.favSongs || [])[_profSlot];
    return plnewPool()
      .filter(x => !q || x.title.toLowerCase().includes(q) || x.album.toLowerCase().includes(q) || x.artist.toLowerCase().includes(q))
      .slice(0, 60)
      .map(x => ({ img: x.image, t: x.title, s: x.album + ' · ' + x.artist,
                   on: !!cur && cur.title === x.title && cur.album === x.album,
                   pick: `profPickSong('${obOc(x.key)}')` }));
  }
  if (_profKind === 'playlist') {
    const cur = (T.playlistNames || [])[_profSlot];
    return plLists()
      .filter(p => !q || p.name.toLowerCase().includes(q) || String(p.creator).toLowerCase().includes(q))
      .map(p => ({ img: p.image, t: p.name, s: p.tracks + ' songs', on: p.name === cur,
                   pick: `profPickPlaylist('${obOc(p.name)}')` }));
  }
  // photo
  return PROFILE_PHOTOS.map(src => ({ img: src, t: '', s: '', on: src === T.pic, pick: `profPickPhoto('${src}')` }));
}

function profPickerRender(q) {
  const ov = document.getElementById('prof-picker'); if (!ov) return;
  const grid = ov.querySelector('.pp-grid'); if (!grid) return;
  const items = profPickerItems(q);
  grid.className = 'pp-grid' + (_profKind === 'photo' ? ' pp-grid--photo' : '');
  grid.innerHTML = items.map(it => `
    <button class="pp-item${it.on ? ' pp-item--on' : ''}" onclick="${it.pick}">
      <span class="pp-img" style="background-image:url('${it.img}')"></span>
      ${it.t ? `<span class="pp-t">${obEsc(it.t)}</span>` : ''}
      ${it.s ? `<span class="pp-s">${obEsc(it.s)}</span>` : ''}
    </button>`).join('') || `<div class="pp-empty">Nothing matches “${obEsc(q)}”.</div>`;
}

// On the Edit Profile page everything edits the DRAFT, so an unsaved change can
// still be thrown away by Cancel; elsewhere it edits PROFILE directly.
function profFavTarget() { return window.PFEDIT || window.PROFILE; }
function profAfterPick() { closeProfPicker(); renderViewer(); }

window.profPick = function (name) {
  const T = profFavTarget();
  if (!T.favs) T.favs = [];
  T.favs[_profSlot] = name;
  profAfterPick();
};
window.profPickSong = function (key) {
  const t = plnewPool().find(x => x.key === key); if (!t) return;
  const T = profFavTarget();
  if (!T.favSongs) T.favSongs = [];
  T.favSongs[_profSlot] = { title: t.title, album: t.album, artist: t.artist };
  profAfterPick();
};
window.profPickPlaylist = function (name) {
  const T = profFavTarget();
  if (!T.playlistNames || !T.playlistNames.length) {
    // Seed from what the profile is currently showing, so replacing one slot
    // doesn't silently drop the other two.
    T.playlistNames = plLists().filter(p => p.creator === 'you')
      .sort((a, b) => b.favs - a.favs).slice(0, 3).map(p => p.name);
  }
  T.playlistNames[_profSlot] = name;
  profAfterPick();
};
window.profPickPhoto = function (src) {
  profFavTarget().pic = src;
  profAfterPick();
};
window.profPhotoUpload = function (input) {
  const f = input && input.files && input.files[0]; if (!f) return;
  const T = profFavTarget();
  const fr = new FileReader();
  fr.onload = () => { T.pic = fr.result; profAfterPick(); };
  fr.readAsDataURL(f);
};
window.profTextDone = function () {
  const ov = document.getElementById('prof-picker'); if (!ov) return;
  const T = profFavTarget();
  if (_profKind === 'name') {
    const [a, b] = ov.querySelectorAll('.pp-text');
    if (a) T.name = a.value.trim() || T.name;
    if (b) T.handle = b.value.trim().replace(/^@/, '') || T.handle;
  } else {
    const el = ov.querySelector('.pp-text');
    if (el) T[_profSlot] = el.value;
  }
  profAfterPick();
};

/* ============================================================
   EDIT PROFILE — the customising page behind the card's pencil
   ------------------------------------------------------------
   PFEDIT is a DRAFT copied from PROFILE when the page opens, so Cancel can
   genuinely throw the changes away and Save is the only thing that commits.

   There is deliberately NO form on the page and no sync layer: every edit goes
   through the content editor popup (openProfEditor), which writes into the draft
   and then re-renders. Nothing is being typed into on the page itself, so a full
   re-render can't steal a caret — the only inputs live inside the popup, which
   survives because it's rebuilt only when it opens.
   ============================================================ */
window.PFEDIT = null;

// Seed the draft on demand, so the screen also works when it's opened straight
// from the viewer's left rail rather than through the pencil.
window.pfeditDraft = function () {
  if (!window.PFEDIT) {
    const P = window.PROFILE || {};
    window.PFEDIT = { ...P, socials: { ...(P.socials || {}) }, favs: (P.favs || []).slice() };
  }
  return window.PFEDIT;
};

window.openProfileEdit = function () {
  window.PFEDIT = null;
  pfeditDraft();
  backStack.push(captureLocation());
  navigate('profile-edit');
};

window.pfeditCancel = function () {
  window.PFEDIT = null;          // draft dies here — PROFILE was never touched
  goBack('profile');
};

window.pfeditSave = function () {
  const D = pfeditDraft();
  // Commit only the fields this page owns; the stats and generated persona bits
  // on PROFILE are left alone.
  Object.assign(window.PROFILE, {
    name: (D.name || '').trim() || window.PROFILE.name,
    handle: (D.handle || '').trim().replace(/^@/, '') || window.PROFILE.handle,
    bio: D.bio,
    location: (D.location || '').trim(),
    occupation: (D.occupation || '').trim(),
    pic: D.pic,
    favs: (D.favs || []).slice(),
    socials: { ...(D.socials || {}) },
    // The slots below the card. These MUST be listed here — the page edits them
    // on the draft, so anything missing from this whitelist is silently dropped
    // on save even though the edit page showed it working.
    favSongs: (D.favSongs || []).slice(),
    playlistNames: (D.playlistNames || []).slice(),
    playlistCovers: (D.playlistCovers || []).slice(),
  });
  window.PFEDIT = null;
  if (window.__sdToast) window.__sdToast('Profile updated');
  // NOT goBack(): the snapshot it pops holds a copy of PROFILE from before the
  // edit and goBack Object.assign()s it back, which would silently revert the
  // save. Drop that snapshot and go forward-as-back instead — the 'back'
  // direction is what stops navigate() from re-rolling the random persona.
  backStack.pop();
  navigate('profile', 'back');
};

window.closeProfPicker = function () {
  const ov = document.getElementById('prof-picker'); if (!ov) return;
  ov.classList.remove('open');
  setTimeout(() => { if (ov.parentElement) ov.parentElement.removeChild(ov); }, 220);
};

// ── Social links ──────────────────────────────────────────────
window.toggleProfSocial = function (btn) {
  const menu = btn.parentElement.querySelector('.prof-soc-menu');
  if (!menu) return;
  const willOpen = menu.hidden;
  document.querySelectorAll('.prof-soc-menu').forEach(m => m.hidden = true);
  menu.hidden = !willOpen;
  if (willOpen) {
    const close = e => {
      if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.hidden = true;
        document.removeEventListener('click', close, true);
      }
    };
    setTimeout(() => document.addEventListener('click', close, true), 0);
  }
};
window.openSocial = function (id) {
  document.querySelectorAll('.prof-soc-menu').forEach(m => m.hidden = true);
  const handle = (window.PROFILE.socials || {})[id] || '';
  const base = { instagram: 'https://instagram.com/', x: 'https://x.com/', soundcloud: 'https://soundcloud.com/' }[id];
  if (base) window.open(base + handle, '_blank', 'noopener');
};

// ── Profile base colour (hand slider, prototype) ──────────────
// Recolours the embossed base + inner face live from a single hue. Dark and
// light instances get theme-appropriate saturation/lightness. Persisted on
// PROFILE.hue so it survives re-renders (applied inline in profileHtml).
// One hue drives a full token set so the card looks the SAME in dark and light
// (a colourful embossed panel, not a theme-tinted one). Ink is kept light so it
// reads on the mid-dark base regardless of the page theme.
window.profBaseColors = function (hue) {
  return {
    '--pf-base':    `hsl(${hue}, 22%, 30%)`,
    '--pf-face':    `hsl(${hue}, 24%, 25%)`,
    '--pf-ink':     `hsl(${hue}, 32%, 93%)`,
    '--pf-ink2':    `hsla(${hue}, 24%, 90%, 0.62)`,
    '--pf-lt':      'rgba(255,255,255,0.07)',
    '--pf-dk':      'rgba(0,0,0,0.5)',
    '--pf-well-dk': 'rgba(0,0,0,0.6)',
    '--pf-well-lt': 'rgba(255,255,255,0.12)',
  };
};

// ── Favourite CD → preview / platforms popup (like the homepage) ──
window.toggleProfCd = function (btn, e) {
  if (e) e.stopPropagation();
  const menu = btn.nextElementSibling;
  if (!menu || !menu.classList.contains('prof-cd-menu')) return;
  const willOpen = menu.hidden;
  const scope = btn.closest('.app-screen') || document;
  scope.querySelectorAll('.prof-cd-menu').forEach(m => { if (m !== menu) m.hidden = true; });
  menu.hidden = !willOpen;
  if (willOpen) {
    const close = ev => {
      if (!menu.contains(ev.target) && !btn.contains(ev.target)) {
        menu.hidden = true;
        document.removeEventListener('click', close, true);
      }
    };
    setTimeout(() => document.addEventListener('click', close, true), 0);
  }
};

// Play/pause a CD's 30s preview; the tapped CD spins while it plays.
window.profCdPreview = function (prevBtn, slot) {
  const name = (window.PROFILE.favs || [])[slot];
  const album = name && (window.ARCHIVE || []).find(a => a.album === name);
  if (!album) return;
  const menu = prevBtn.closest('.prof-cd-menu');
  const cdBtn = menu && menu.previousElementSibling;         // the .prof-alb
  const img = cdBtn && cdBtn.querySelector('.prof-alb-img');
  const a = previewAudioEl();
  unlockAudio(a);                                            // iOS: unlock in-gesture
  const stop = () => { prevBtn.classList.remove('playing'); if (img) img.classList.remove('prof-alb--spin'); };
  if (prevBtn.classList.contains('playing')) { a.pause(); stop(); return; }
  // stop any other CD that was spinning
  (cdBtn.closest('.app-screen') || document).querySelectorAll('.prof-cd-prev.playing').forEach(b => b.classList.remove('playing'));
  (cdBtn.closest('.app-screen') || document).querySelectorAll('.prof-alb-img.prof-alb--spin').forEach(x => x.classList.remove('prof-alb--spin'));
  a.onended = stop;
  const start = (url) => {
    if (!url) { prevBtn.classList.add('none'); setTimeout(() => prevBtn.classList.remove('none'), 1400); return; }
    if (a.src !== url) { a.src = url; a.currentTime = 0; }
    a.play().then(() => { PREVIEW.unlocked = true; prevBtn.classList.add('playing'); if (img) img.classList.add('prof-alb--spin'); }).catch(() => {});
  };
  const cached = PREVIEW_CACHE.get(albumKey(album).toLowerCase());
  if (cached !== undefined) start(cached);
  else fetchPreviewUrl(album).then(start);
};

// ── Follow (the dot-mascot button) ────────────────────────────
/* Toggles Follow ⇄ Following. The wink that used to fire here went with the
   rest of the face — and it only ever half-worked: it added `--wink` without
   `--smile`, so it animated dots that were still in the ARROW formation. */
window.toggleProfFollow = function (btn) {
  const on = btn.classList.toggle('is-following');
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  const lbl = btn.querySelector('.prof-follow-lbl');
  if (lbl) lbl.textContent = on ? 'Following' : 'Follow';
};

/* ══════════════════════════════════════════════════════════════════════════
   DEEZER AT RUNTIME — the recommendation pool + the search fallback
   ══════════════════════════════════════════════════════════════════════════
   A persona ships ~30 albums and the bento cycles the whole catalogue, so the
   home screen ran out of records and started repeating. This widens it to a few
   hundred WITHOUT shipping them: on every load a handful of the persona's own
   artists seed `artist/<id>/radio`, and what comes back is folded into ARCHIVE.
   Deezer's radio is itself randomised and the seeds are re-drawn each load, so
   a reload genuinely deals a different shelf.

   The same client backs search. The local index only knows the persona's own
   albums, so "steely dan" found nothing; Deezer is queried as a fallback and
   its hits open like any other album.

   Records arrive LITE — radio carries title / artist / cover but no year, genre
   or track count. That is everything the compact bento needs (it hides the
   year), and `dzHydrate` fills the rest in one call when the album is opened.
   Ratings and reviews come from the same seeded algorithm as
   tools/build_personas.py, so a fetched album renders identically to a built-in
   one and always shows the same numbers. */

/* Tunable live from the rec box at the bottom of the desktop viewer, so these
   are `let`. One album per artist by default: four in a row by the same act
   read as the shelf repeating, which is the thing this feature exists to fix.
   The fan-out is wider to compensate — breadth now comes from more ARTISTS. */
let RECS_ENABLED    = true;
let RECS_SEEDS      = 10;  // of the persona's own artists, re-drawn each load
let RECS_PER_SEED   = 10;  // related artists taken per seed
let RECS_PER_ARTIST = 1;   // albums taken per related artist — never two in a row
let RECS_TARGET     = 100; // ceiling on the queue
let   RECS_GEN        = 0;   // bumped on persona switch; in-flight deals bail

/* Deezer allows roughly 50 requests / 5s per client. Filling the rec pool is
   ~45 calls, which sat right on that line and starved whatever came next — the
   search fallback would come back empty seconds after a page load, looking
   like a broken feature. So every call is PACED, and a failure is retried once.

   ⚠️ Only successful responses are cached. Caching the `null` from a throttled
   call pinned the failure for the rest of the session: search stayed broken
   until reload even once the quota had recovered. */
const DZ_CACHE = new Map();
const DZ_GAP = 115;          // ms between requests → ~43 per 5s, inside the limit
let DZ_NEXT = 0;
function dz(path, retry) {
  if (DZ_CACHE.has(path)) return Promise.resolve(DZ_CACHE.get(path));
  const url = 'https://api.deezer.com/' + path +
              (path.indexOf('?') >= 0 ? '&' : '?') + 'output=jsonp';
  const now = Date.now();
  const at = Math.max(now, DZ_NEXT);
  DZ_NEXT = at + DZ_GAP;
  return new Promise(function (res) { setTimeout(res, at - now); })
    .then(function () { return jsonp(url, 8000); })
    .then(function (d) {
      if (d && !d.error) { DZ_CACHE.set(path, d); return d; }
      if (retry) return d;                        // one retry, then give up
      DZ_NEXT = Date.now() + 1200;                // back off past the window
      return dz(path, true);
    });
}

// ── The generated-review algorithm, ported from tools/build_personas.py ──
const DZ_QUOTES = [
  'the kind of record you finish and immediately restart',
  'front to back, not a single skip on this one',
  'i was not emotionally prepared for the back half',
  'production is immaculate, lyrics cut deeper every listen',
  'grew on me. first listen confused me, tenth listen floored me',
  'this is the one i put on when i want to feel something',
  'genuinely reshaped what i thought this genre could do',
  'overrated by half a star but still a great time',
  'the sequencing alone deserves an award',
  "sounds like a memory i haven't had yet",
  'perfect headphones album, sounds thin on speakers though',
  'everyone talks about the singles, the deep cuts are the real thing',
  'criminally short. i wanted twenty more minutes',
  "a mood more than an album, and that's a compliment",
  'played this on a night drive and understood it completely',
  'the mixing is doing so much heavy lifting here',
  'not their best but their most honest',
  "i've recommended this to six people and lost two friends",
  'every song earns its place, which is rarer than it should be',
  'the closer justifies the entire tracklist'
];
const DZ_NAMES = [['echoplex', 'EP'], ['staticfog', 'SF'], ['velvetblast', 'VB'],
                  ['noisegate', 'NG'], ['dustpan', 'DP'], ['kira.wav', 'KW'], ['vxblank', 'VX']];
const DZ_GRADS = ['linear-gradient(135deg,#e05a6b,#8a2f52)', 'linear-gradient(135deg,#2f7fe0,#1c3f8a)',
                  'linear-gradient(135deg,#3fae7a,#1d6b4a)', 'linear-gradient(135deg,#b06ae0,#5f2f8a)',
                  'linear-gradient(135deg,#e0a53f,#8a5f1d)', 'linear-gradient(135deg,#e05aa8,#8a2f6b)',
                  'linear-gradient(135deg,#4fc3d0,#1d6b7a)'];
const DZ_GEN = { 'Rap/Hip Hop': 'Hip-Hop', 'Electro': 'Electronic', 'Films/Games': 'Soundtrack',
                 'Dance': 'Electronic', 'Soul & Funk': 'Soul', 'Asian Music': 'K-Pop' };

function dzSeed() {
  let h = 0;
  for (let i = 0; i < arguments.length; i++) {
    const p = String(arguments[i]);
    for (let j = 0; j < p.length; j++) h = (h * 131 + p.charCodeAt(j)) & 0x7FFFFFFF;
  }
  return h;
}
function dzReviews(title, rating) {
  const idxs = [], used = {};
  for (let i = 0; i < 12 && idxs.length < 3; i++) {
    const k = dzSeed(title, i) % DZ_QUOTES.length;
    if (!used[k]) { used[k] = 1; idxs.push(k); }
  }
  while (idxs.length < 3) idxs.push((idxs[idxs.length - 1] + 1) % DZ_QUOTES.length);
  const scale = rating >= 4.4 ? [5, 4.5, 4] : [4.5, 4, 4];
  return idxs.map(function (pi, k) {
    const u = dzSeed(title, 'u', k) % DZ_NAMES.length;
    return { name: DZ_NAMES[u][0], init: DZ_NAMES[u][1], grad: DZ_GRADS[u],
             rating: scale[k], text: DZ_QUOTES[pi] };
  });
}

/* One Deezer album object (from radio, search or an artist's list) → an app
   record. `_lite` marks the fields that endpoint did not carry. */
function dzRecord(al, artist) {
  const title = (al && al.title) || '';
  const ar = artist || (al && al.artist) || {};
  const rating = Math.round((3.8 + (dzSeed(ar.name, title) % 11) * 0.1) * 10) / 10;
  return {
    album: title, artist: ar.name || '',
    year: parseInt((al.release_date || '').slice(0, 4), 10) || 0,
    genre: '', tracks: al.nb_tracks || 10,
    image: al.cover_xl || al.cover_big || al.cover_medium || '',
    rating: rating,
    reviewCount: 4000 + (dzSeed(title, 'rc') % 86) * 1000,
    reviews: dzReviews(title, rating),
    deezerId: al.id, artistId: ar.id,
    _rec: true, _lite: true
  };
}

// Fill year / genre / track count. One call, only when an album is opened.
function dzHydrate(a) {
  if (!a || !a._lite || a._hydrating || !a.deezerId) return Promise.resolve(a);
  a._hydrating = true;
  return dz('album/' + a.deezerId).then(function (d) {
    if (d && !d.error) {
      a.year   = parseInt((d.release_date || '').slice(0, 4), 10) || a.year;
      const g  = (((d.genres || {}).data || [{}])[0] || {}).name || '';
      a.genre  = DZ_GEN[g] || g || a.genre || 'Alternative';
      a.tracks = d.nb_tracks || a.tracks;
      a._lite  = false;
    }
    a._hydrating = false;
    return a;
  });
}

function dzKey(artist, album) { return String(artist || '').toLowerCase() + '::' + String(album || '').toLowerCase(); }

/* Round-robin a list by artist: take one album from each artist in turn, so two
   records by the same act are as far apart as the list allows. */
function dzSpread(list) {
  const byArtist = new Map();
  list.forEach(function (a) {
    const k = String(a.artist || '').toLowerCase();
    if (!byArtist.has(k)) byArtist.set(k, []);
    byArtist.get(k).push(a);
  });
  const lanes = shuffled([...byArtist.values()]);
  const out = [];
  for (let i = 0; out.length < list.length; i++) {
    let placed = false;
    lanes.forEach(function (lane) { if (lane[i]) { out.push(lane[i]); placed = true; } });
    if (!placed) break;
  }
  return out;
}

/* Fold new albums into ARCHIVE + the bento queue. APPENDS to trendingAlbums
   rather than re-shuffling it — the queue is indexed by position and the user
   may be part-way through swiping it. */
function dzAdopt(records) {
  const A = window.ARCHIVE || [];
  const have = new Set(A.map(function (a) { return dzKey(a.artist, a.album); }));
  const fresh = [];
  records.forEach(function (r) {
    const k = dzKey(r.artist, r.album);
    if (!r.artist || !r.album || !r.image || have.has(k)) return;
    have.add(k); fresh.push(r);
  });
  if (!fresh.length) return 0;
  window.ARCHIVE = A.concat(fresh);
  /* Re-deal the WHOLE queue round-robin by artist — the persona's own records
     and the fetched ones together, not recs appended behind them. Appending
     meant swiping all ~30 of your own albums before a single recommendation
     appeared, which is the same wall of familiar covers this feature was
     meant to break up. Round-robin also keeps two records by one act apart;
     they arrive grouped, one artist's batch at a time. */
  const queue = (window.trendingAlbums || []).concat(fresh);
  window.trendingAlbums = dzSpread(queue);
  window.SEARCH_INDEX = null;   // memoised — must be dropped or search misses them
  return fresh.length;
}

/* Releases that are not the thing a review app wants to show. `artist/<id>/
   radio` was the first cut and it is a trap: seeded off a K-ballad singer it
   comes back as forty "Crash Landing on You (Original Television Soundtrack),
   Pt. 3" singles. Related-artist ALBUMS carry `record_type` and `nb_tracks`,
   which is what makes real filtering possible. */
/* ⚠️ Two things this endpoint does NOT give you: `nb_tracks` is absent
   entirely, and `record_type` reads "album" for live records and compilations
   just the same as for studio LPs. The title is the only real signal, so the
   filter has to be generous — a raw Steely Dan list is Alive In America, Gold,
   A Decade Of…, Showbiz Kids and Citizen 1972-1980 before it is Aja. */
const DZ_JUNK = new RegExp([
  'original (television |motion picture )?soundtrack', '\\bost\\b',
  'karaoke', 'tribute', '\\bcovers?\\b', '\\bremix(es|ed)?\\b',
  'greatest hits', '\\bbest of\\b', 'the essential', 'anthology', '\\bcollection\\b',
  '\\bhits\\b', '\\blive\\b', '\\bunplugged\\b', '\\bdemos\\b', '\\bkaraoke\\b',
  '(19|20)\\d{2}\\s*[-–]\\s*(19|20)\\d{2}',      // "1972 - 1980" — a compilation span
  '\\bthe .{2,30} story\\b',
].join('|'), 'i');
function dzGoodAlbum(al) {
  return !!al && !!al.title && (al.record_type || 'album') === 'album'
      && !DZ_JUNK.test(al.title);
}
/* Rank an artist's releases by Deezer's own `fans` count and keep the head of
   the list — the records people actually listen to — then draw randomly from
   that shortlist so two loads don't pick the same ones. */
function dzPickAlbums(list, n) {
  const good = (list || []).filter(dzGoodAlbum)
    .sort(function (a, b) { return (b.fans || 0) - (a.fans || 0); });
  return shuffled(good.slice(0, Math.max(n, n * 2))).slice(0, n);
}

/* Deal a fresh shelf: a few of the persona's own artists → Deezer's RELATED
   artists → the records those artists actually released. Two levels of
   randomness (which seeds, which of their neighbours) is what makes a reload
   feel like a different day rather than the same twenty albums. */
async function expandRecs() {
  if (!RECS_ENABLED) return 0;
  const gen = ++RECS_GEN;
  const added = await dzDeal(gen);
  /* ⚠️ Refresh from the ONE exit point. This used to sit at the bottom of the
     deal loop, which has several early returns — and hitting RECS_TARGET took
     one of them, so with a target the rails and feed were never refreshed and
     stayed on the persona's own albums. That is the actual "everything below
     the bento repeats" bug. */
  if (added) dzRefreshHome();
  return added;
}

// The deal itself. Returns how many albums it adopted; may bail early.
async function dzDeal(gen) {
  const own = (window.ARCHIVE || []).filter(function (a) { return a.artistId && !a._rec; });
  if (!own.length) return 0;
  let added = 0;
  const seen = {};
  const seeds = shuffled(own).slice(0, RECS_SEEDS);
  for (const s of seeds) {
    if (gen !== RECS_GEN) return added;                  // persona switched under us
    if ((window.ARCHIVE || []).length >= RECS_TARGET) return added;
    const rel = await dz('artist/' + s.artistId + '/related?limit=12');
    if (gen !== RECS_GEN) return added;
    const near = shuffled((((rel || {}).data) || []).filter(function (a) {
      if (!a.id || seen[a.id]) return false;
      seen[a.id] = 1; return true;
    })).slice(0, RECS_PER_SEED);

    // One seed's neighbours are fetched in PARALLEL — serially this took ~12s
    // to fill the shelf, which is long enough that the first swipes still see
    // the short catalogue. Deezer's limit is ~50 requests / 5s and a seed is
    // only RECS_PER_SEED of them, so the burst is well inside it.
    const lists = await Promise.all(near.map(function (ar) {
      return dz('artist/' + ar.id + '/albums?limit=20').then(function (r) { return { ar: ar, r: r }; });
    }));
    if (gen !== RECS_GEN) return added;
    lists.forEach(function (x) {
      const room = RECS_TARGET - (window.ARCHIVE || []).length;
      if (room <= 0) return;
      const good = dzPickAlbums(((x.r || {}).data) || [], RECS_PER_ARTIST);
      // Adopted per seed rather than in one batch at the end, so the queue
      // grows while the rest is still in flight.
      added += dzAdopt(good.map(function (al) { return dzRecord(al, x.ar); }).slice(0, room));
    });
  }
  return added;
}

/* The bento swipes through the widened shelf, but the feed UNDER it was built
   before the deal landed and stayed on the persona's own ~30 albums: it memoises
   into `_FEED`, and FRIEND_ACTIVITY is generated once per switch. So without
   this the part of home you see WITHOUT swiping showed the same handful of rows
   every single load — which reads as the whole screen repeating even though the
   queue behind it is fresh.
   Called once when a deal finishes, not per batch, so the feed doesn't churn
   under the user while it fills. */
function dzRefreshHome() {
  window._FEED = null;
  const p = window.ACTIVE_PERSONA && personaById(window.ACTIVE_PERSONA);
  if (p && typeof personaFeed === 'function') window.FRIEND_ACTIVITY = personaFeed(p);
  homeShells().forEach(function (s) {
    if (s.classList.contains('s-home-v3--review')) return;   // don't repaint an open album
    renderFriendFeed(s);
  });
}
window.expandRecs = expandRecs;

/* ── Search fallback ──────────────────────────────────────────────────────
   Runs alongside the local index, not instead of it: the persona's own records
   stay on top and Deezer fills in underneath. */
let SDS_REMOTE_T = 0;
function sdsRemoteSearch(q, ov) {
  clearTimeout(SDS_REMOTE_T);
  if (!q || q.length < 2) return;
  SDS_REMOTE_T = setTimeout(function () {
    Promise.all([
      dz('search/artist?limit=4&q=' + encodeURIComponent(q)),
      dz('search/album?limit=8&q=' + encodeURIComponent(q))
    ]).then(function (res) {
      const ar = res[0], al = res[1];
      const inp = ov.querySelector('.sds-input');
      if (!inp || inp.value.trim().toLowerCase() !== q) return;   // typed on since
      const resEl = ov.querySelector('.sds-results');
      if (!resEl) return;

      const last = ov._last || (ov._last = { artists: [], albums: [], songs: [] });
      const known = new Set((last.albums || []).map(function (a) {
        return dzKey(a.artist || (a.ref || {}).artist, a.album || (a.ref || {}).album);
      }));
      const knownArtists = new Set((last.artists || []).map(function (a) {
        return String(a.name || '').toLowerCase();
      }));

      const artists = (((ar || {}).data) || [])
        .filter(function (a) { return a.name && !knownArtists.has(a.name.toLowerCase()); })
        .map(function (a) {
          return { name: a.name, image: a.picture_xl || a.picture_big || '',
                   count: a.nb_album || 0, _dzArtist: { id: a.id, name: a.name } };
        });
      const albums = (((al || {}).data) || [])
        .filter(function (a) { return a.title && a.artist && !known.has(dzKey(a.artist.name, a.title)); })
        .map(function (a) {
          const rec = dzRecord(a, a.artist);
          return { album: rec.album, artist: rec.artist, image: rec.image, year: rec.year, ref: rec };
        });
      if (!artists.length && !albums.length) return;

      const aOff = (last.artists || []).length, bOff = (last.albums || []).length;
      last.artists = (last.artists || []).concat(artists);
      last.albums  = (last.albums || []).concat(albums);

      const rows =
        artists.map(function (a, i) {
          return '<button class="sds-row" data-type="artist" data-i="' + (aOff + i) + '">' +
            '<span class="sds-thumb sds-thumb--round" style="background-image:url(\'' + a.image + '\')"></span>' +
            '<span class="sds-row-main"><span class="sds-row-t">' + _sdsEsc(a.name) + '</span>' +
            '<span class="sds-row-s">Artist' + (a.count ? ' · ' + a.count + ' albums' : '') + '</span></span></button>';
        }).join('') +
        albums.map(function (a, i) {
          return '<button class="sds-row" data-type="album" data-i="' + (bOff + i) + '">' +
            '<span class="sds-thumb" style="background-image:url(\'' + a.image + '\')"></span>' +
            '<span class="sds-row-main"><span class="sds-row-t">' + _sdsEsc(a.album) + '</span>' +
            '<span class="sds-row-s">Album · <b>' + _sdsEsc(a.artist) + '</b>' +
            (a.year ? ' · ' + a.year : '') + '</span></span></button>';
        }).join('');

      const old = resEl.querySelector('.sds-sec--remote');
      if (old) old.remove();
      const empty = resEl.querySelector('.sds-empty');
      if (empty) empty.remove();
      resEl.insertAdjacentHTML('beforeend',
        '<div class="sds-sec sds-sec--remote"><div class="sds-sec-hd">More on Deezer</div>' + rows + '</div>');
    });
  }, 280);
}

/* Wrap the two openers so a fetched record behaves like a built-in one: an
   album fills in its missing metadata, and an artist we have never seen has
   their albums pulled into ARCHIVE first — openArtistPageFor builds the page by
   filtering ARCHIVE, so without that it would open an empty shell. */
const _sdsOpenResult = sdsOpenResult;
sdsOpenResult = function (type, i) {
  const ov = document.getElementById('sd-search');
  const last = (ov && ov._last) || {};
  const a = type === 'artist' ? (last.artists || [])[i] : null;
  if (a && a._dzArtist) {
    closeSearch();
    dz('artist/' + a._dzArtist.id + '/albums?limit=40').then(function (r) {
      // Same junk filter as the rec pool — a legacy act's raw album list is
      // half live records and compilations ("A Decade Of Steely Dan", "Gold").
      const raw = (((r || {}).data) || []);
      const good = raw.filter(dzGoodAlbum)
        .sort(function (x, y) { return (y.fans || 0) - (x.fans || 0); });
      dzAdopt((good.length ? good : raw).slice(0, 12)
        .map(function (al) { return dzRecord(al, a._dzArtist); }));
      window.openArtistPageFor(a._dzArtist.name);
    });
    return;
  }
  return _sdsOpenResult.call(this, type, i);
};

const _openAlbumPage = window.openAlbumPage;
window.openAlbumPage = function (album, pinnedReview) {
  const out = _openAlbumPage.apply(this, arguments);
  if (album && album._lite) {
    dzHydrate(album).then(function () {
      if (window.activeAlbum !== album) return;
      homeShells().forEach(function (s) { if (s._album === album) populateReviewPanel(s); });
    });
  }
  return out;
};

/* ── Rec box: the recommendation knobs, live ──────────────────────────────
   A strip along the bottom of the desktop viewer. It lives inside #viewer, so
   it is desktop-only for free — the mobile prototype hides that whole element.
   Changing a knob re-deals immediately, which is the point: the numbers are a
   feel decision and reading them off a diff is useless. */
const RECBOX_FIELDS = [
  { k: 'seeds',    label: 'Seeds',        min: 1, max: 20, get: () => RECS_SEEDS,      set: v => RECS_SEEDS = v,
    hint: 'your own artists used as starting points' },
  { k: 'perSeed',  label: 'Related /seed', min: 1, max: 20, get: () => RECS_PER_SEED,   set: v => RECS_PER_SEED = v,
    hint: 'neighbours pulled per seed artist' },
  { k: 'perArt',   label: 'Albums /artist', min: 1, max: 6, get: () => RECS_PER_ARTIST, set: v => RECS_PER_ARTIST = v,
    hint: 'keep at 1 for one album per artist' },
  { k: 'target',   label: 'Max queue',    min: 40, max: 400, step: 10, get: () => RECS_TARGET, set: v => RECS_TARGET = v,
    hint: 'ceiling on the whole shelf' },
];

function recBoxCounts() {
  const A = window.ARCHIVE || [];
  const recs = A.filter(function (a) { return a._rec; });
  const artists = new Set(recs.map(function (a) { return a.artist; }));
  return A.length + ' albums · ' + recs.length + ' recommended · ' +
         artists.size + ' new artists · ~' +
         (RECS_SEEDS * (1 + RECS_PER_SEED)) + ' requests';
}

function recBoxSync() {
  const el = document.getElementById('recbox');
  if (!el) return;
  el.querySelector('.rb-count').textContent = recBoxCounts();
  RECBOX_FIELDS.forEach(function (f) {
    const inp = el.querySelector('[data-k="' + f.k + '"]');
    if (inp && document.activeElement !== inp) inp.value = f.get();
    const out = el.querySelector('[data-v="' + f.k + '"]');
    if (out) out.textContent = f.get();
  });
  const t = el.querySelector('.rb-toggle');
  if (t) t.classList.toggle('on', !!RECS_ENABLED);
}

/* Drop everything fetched and deal again from scratch. `RECS_GEN` is bumped by
   expandRecs, so any deal still in flight drops its results on the floor
   instead of racing this one. */
async function recBoxRedeal(btn) {
  RECS_GEN++;
  const A = window.ARCHIVE || [];
  window.ARCHIVE = A.filter(function (a) { return !a._rec; });
  window.trendingAlbums = (window.trendingAlbums || []).filter(function (a) { return !a._rec; });
  if (window.featuredAlbum && window.featuredAlbum._rec) {
    window.featuredAlbum = window.ARCHIVE[0];
    window.activeAlbum = window.featuredAlbum;
  }
  window.SEARCH_INDEX = null;
  if (btn) btn.classList.add('rb-busy');
  recBoxSync();
  await expandRecs();
  if (btn) btn.classList.remove('rb-busy');
  recBoxSync();
  renderViewer();
}

function initRecBox() {
  const viewer = document.getElementById('viewer');
  if (!viewer || document.getElementById('recbox')) return;
  const el = document.createElement('div');
  el.id = 'recbox';
  el.innerHTML =
    '<button class="rb-toggle" title="Turn the recommendation pool on or off">Recs</button>' +
    RECBOX_FIELDS.map(function (f) {
      return '<label class="rb-field" title="' + f.hint + '">' +
        '<span class="rb-lbl">' + f.label + '</span>' +
        '<input type="range" data-k="' + f.k + '" min="' + f.min + '" max="' + f.max +
        '" step="' + (f.step || 1) + '" value="' + f.get() + '">' +
        '<span class="rb-val" data-v="' + f.k + '">' + f.get() + '</span></label>';
    }).join('') +
    '<button class="rb-go">Re-deal</button>' +
    '<span class="rb-count"></span>';
  viewer.appendChild(el);

  el.querySelectorAll('input[type="range"]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      const f = RECBOX_FIELDS.find(function (x) { return x.k === inp.dataset.k; });
      if (!f) return;
      f.set(+inp.value);
      recBoxSync();
    });
    // Re-deal on release rather than on every tick of the slider — dragging
    // Seeds from 2 to 14 would otherwise fire a dozen deals at the API.
    inp.addEventListener('change', function () { recBoxRedeal(el.querySelector('.rb-go')); });
  });
  el.querySelector('.rb-toggle').addEventListener('click', function () {
    RECS_ENABLED = !RECS_ENABLED;
    recBoxSync();
    recBoxRedeal(el.querySelector('.rb-go'));
  });
  el.querySelector('.rb-go').addEventListener('click', function (e) { recBoxRedeal(e.currentTarget); });
  recBoxSync();
  setInterval(recBoxSync, 1200);   // the first deal lands a few seconds in
}

document.addEventListener('DOMContentLoaded', init);
