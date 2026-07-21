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
  window.addEventListener('resize', debounce(() => {
    if (viewMode === 'single') renderSingle();
  }, 100));
}

function renderViewer() {
  if (viewMode === 'single') renderSingle();
  else                        renderMulti();
  renderThumbs();
  updateToolbar();
  requestAnimationFrame(() => {
    document.querySelectorAll('.s-home-v3').forEach(el => {
      populateHomeData(el);
    });
    document.querySelectorAll('.s-onboarding').forEach(obInit);
    applyFilletMasks();
  });
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
      if (e) e.stopPropagation();   // don't let the tap bubble and undo the review state
      window.activeAlbum = album;
      enterReview(screenEl);   // tap the hero → fullscreen review (not the separate album page)
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

  // In fullscreen review, a 2-line album title needs the CTA pushed down a line
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
      enterReview(screenEl);
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
function snapView(scr) {
  if (scr && scr.classList.contains('s-home-v3--review')) {
    return {
      review: true,
      album:  scr.classList.contains('s-home-v3--album'),
      artist: scr.classList.contains('s-home-v3--artist'),
      albumRef: scr._album,
    };
  }
  return { review: false, screenId: currentScreen().id };   // bento home, or a plain screen
}
function pushBack() {
  const scr = homeShells()[0];
  if (scr) backStack.push(snapView(scr));
}
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
window.goBack = function () {
  const snap = backStack.pop();
  const shells = homeShells();
  if (!snap) { shells.forEach(s => exitReview(s)); return; }          // nothing recorded → bento
  if (snap.review) { shells.forEach(s => applyShellState(s, snap)); return; }   // an earlier shell state
  if (snap.screenId && snap.screenId !== currentScreen().id) {        // a different screen
    navigate(snap.screenId, 'back');
    return;
  }
  shells.forEach(s => exitReview(s));                                  // the bento home
};

window.enterReview = function (scr) {
  if (!scr) return;
  if (!scr.classList.contains('s-home-v3--review')) pushBack();   // record the bento before entering
  const album = scr.querySelector('.v3-blue-album');
  const albumText = album ? album.textContent : '';

  // 1. Album fades out of the (small, inline) line it currently shares with the artist
  if (album) album.style.opacity = '0';

  // 2. After the fade, expand fullscreen: flood + artist grows + title stacks (CSS)
  setTimeout(() => {
    scr.classList.add('s-home-v3--review');
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
// ── Album page — a variation of the fullscreen review state ──
// Reached by tapping the album title once you're in the review state; the cover
// blows up to a large square, the back button drops, everything below stays.
window.onAlbumTitle = function (el) {
  const scr = el && el.closest('.s-home-v3');
  if (!scr) return;
  if (!scr.classList.contains('s-home-v3--review')) { enterReview(scr); return; }
  if (!scr.classList.contains('s-home-v3--album')) {   // review → album page (forward)
    pushBack();
    homeShells().forEach(s => s.classList.add('s-home-v3--album'));
  }
};
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
  const grid = scr.querySelector('.v3-artist-albums');
  if (grid) {
    const arch = window.ARCHIVE || [];
    let albums = arch.filter(x => x.artist === a.artist);
    if (albums.length < 3) albums = albums.concat(arch.filter(x => x.artist !== a.artist)).slice(0, 6);
    grid.innerHTML = '<div class="wall2-grid">' + albums.map(al => `
      <div class="wall2-cell" onclick="event.stopPropagation(); openAlbumPage(ARCHIVE.find(x=>x.album==='${al.album.replace(/'/g, "\\'")}')||ARCHIVE[0])">
        <div class="wall2-art" style="background-image:url('${al.image}')"></div>
        <div class="wall2-meta"><span class="wall2-album">${al.album}</span><span class="wall2-artist">${al.artist}</span></div>
        <div class="wall2-rating">${halfStars(al.rating, 11)}<span class="wall2-score">${al.rating.toFixed(1)}</span></div>
      </div>`).join('') + '</div>';
  }
}

window.exitReview = function (scr) {
  if (!scr) return;
  // Freeze the For You box's geometry transition on the way back to the bento —
  // it should already be sitting in its spot, not slide into it (same trick as toggleHand).
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
  if (on) plRingSmile(btn.closest('.app-screen'));   // the back-pill dots grin about it
};
// Morph the back pill's arrow dots into the smiley face for a beat, then back.
function plRingSmile(scope) {
  (scope || document).querySelectorAll('.plp-ring').forEach(ring => {
    ring.classList.add('v3-ring--smile');
    clearTimeout(ring._smT);
    ring._smT = setTimeout(() => ring.classList.remove('v3-ring--smile'), 1800);
  });
}
// The mascot peeks intermittently — every so often the arrow reforms into the
// smiley for a moment, purely for personality. No-ops when no playlist page is up.
setInterval(() => plRingSmile(document), 11000);

// First home render of the session: the live-pill dots greet you. Smiley for
// ~5 seconds, then a wink + grin, then they morph into the arrow and get to work.
let ringGreeted = false;
function greetRing() {
  if (ringGreeted) return;
  const rings = [...document.querySelectorAll('.v3-live-pill .v3-ring')];
  if (!rings.length) return;
  ringGreeted = true;
  rings.forEach(r => r.classList.add('v3-ring--smile'));
  setTimeout(() => rings.forEach(r => r.classList.add('v3-ring--wink')), 3700);
  setTimeout(() => rings.forEach(r => r.classList.remove('v3-ring--wink', 'v3-ring--smile')), 5000);
}

// Home live-pill personality: every ~10s the arrow reforms into the smiley,
// holds ~5s, winks (1s), then morphs back into the arrow. Skips the pill when
// the home shell is in a fullscreen state (review/album/artist), and no-ops on
// other screens (the live pill isn't in the DOM there).
function homeRingPeek() {
  const rings = [...document.querySelectorAll('.v3-live-pill .v3-ring')].filter(r => {
    const shell = r.closest('.s-home-v3');
    return shell
      && !shell.classList.contains('s-home-v3--review')
      && !shell.classList.contains('s-home-v3--album')
      && !shell.classList.contains('s-home-v3--artist');
  });
  if (!rings.length) return;
  rings.forEach(r => {
    clearTimeout(r._peekWinkT); clearTimeout(r._peekEndT);
    r.classList.add('v3-ring--smile');
    r._peekWinkT = setTimeout(() => r.classList.add('v3-ring--wink'), 5000);         // stays 5s, then winks
    r._peekEndT  = setTimeout(() => r.classList.remove('v3-ring--wink', 'v3-ring--smile'), 6100); // wink (1s) done → back to arrow
  });
}
setInterval(homeRingPeek, 10000);
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
  const originSnap = { review: false, screenId: currentScreen().id };
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
  const originSnap = { review: false, screenId: currentScreen().id };
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
    const card = document.createElement('div');
    card.className = 'v3-rev-card v3-rev-card--mine';
    card.innerHTML = `
      <div class="v3-rev-card-top">
        <div class="v3-rev-av" style="background:linear-gradient(135deg,var(--v3-accent,#e8a83c),#c76b2a)">Y</div>
        <span class="v3-rev-name">You</span>
        <span class="v3-rev-time">just now</span>
      </div>
      <div class="v3-rev-meta">
        ${halfStars(rating, 10)}
        <span class="v3-rev-likes">♥ 0</span>
        <span class="v3-rev-likes">💬 0</span>
      </div>
      <div class="v3-rev-text">${text}</div>`;
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
// Listen-later / Favorite toggle buttons in the action grid
window.toggleRevAction = function (btn, e) {
  if (e) e.stopPropagation();
  btn.classList.toggle('on');
};
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
  // clear listen-later / favorite toggles when the album changes
  scr.querySelectorAll('.v3-rev-btn.on').forEach(b => b.classList.remove('on'));
  populateRecTag(scr, a);
  populateHist(scr, a);
  populateSongList(scr);
  populateComposeMedia(scr);
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
  wrap.classList.toggle('v3-rev-songs--scroll', songs.length > 8);
  wrap.innerHTML = `<div class="v3-rev-songs-scroll">` + songs.map(s => `
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

// Generic behind-the-scenes / press photos (not album covers) — the media column is
// meant to be BTS shots. Only artist photos exist so far; swap in a real `album.photos`
// array per album to show genuine media.
const BTS_PHOTOS = [
  'images/artist-phoebe.jpg',
  'images/artist-crystalcastles.jpg',
  'images/artist-100gecs.jpg',
  'images/artist-carpenterbrut.jpg',
];
function populateComposeMedia(scr) {
  const strip = scr && scr.querySelector('.v3-rev-media');
  if (!strip) return;
  const a = scr._album || window.featuredAlbum;
  const arch = window.ARCHIVE || [];
  let imgs;
  if (a && Array.isArray(a.photos) && a.photos.length) {
    imgs = a.photos;                                   // real media once it's wired up
  } else {
    // Rotate the generic BTS pool by album index so different albums vary.
    const off = Math.max(0, arch.indexOf(a));
    imgs = BTS_PHOTOS.map((_, i) => BTS_PHOTOS[(i + off) % BTS_PHOTOS.length]);
  }
  // The top item is the music video — gets a play button to signal it's playable.
  strip.innerHTML = imgs.map((src, i) =>
    `<div class="v3-rev-photo${i === 0 ? ' v3-rev-photo--video' : ''}" style="background-image:url('${src}')">${i === 0 ? '<span class="v3-rev-play"></span>' : ''}</div>`).join('');
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
  const pinHtml = pin ? `
    <div class="v3-rev-card v3-rev-card--pinned">
      <div class="v3-rev-card-top">
        <div class="v3-rev-av" style="background:${pin.grad || '#555'}">${pin.init || '?'}</div>
        <span class="v3-rev-name">${pin.name || 'Listener'}</span>
        <span class="v3-rev-pin-chip">from your feed</span>
        <span class="v3-rev-time">${pin.ago || ''}</span>
      </div>
      <div class="v3-rev-meta">
        ${halfStars(pin.rating || 4, 10)}
        <span class="v3-rev-likes">♥ ${pin.likes || 0}</span>
        <span class="v3-rev-likes">💬 ${pin.comments || 0}</span>
      </div>
      <div class="v3-rev-text">${pin.text || ''}</div>
    </div>` : '';
  list.innerHTML = pinHtml + revs.map((r, i) => {
    const m = revMeta(r, i);
    return `
    <div class="v3-rev-card">
      <div class="v3-rev-card-top">
        <div class="v3-rev-av" style="background:${r.grad || '#555'}">${r.init || '?'}</div>
        <span class="v3-rev-name">${r.name || 'Listener'}</span>
        <span class="v3-rev-time">${m.ago}</span>
      </div>
      <div class="v3-rev-meta">
        ${halfStars(r.rating || 4, 10)}
        <span class="v3-rev-likes">♥ ${m.likes}</span>
        <span class="v3-rev-likes">💬 ${m.comments}</span>
      </div>
      <div class="v3-rev-text">${r.text || ''}</div>
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
window.openFriendReview = function (i) {
  const f = (window.FRIEND_ACTIVITY || [])[i];
  const album = f && friendAlbumFor(f);
  if (!album) return;
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

function renderFriendFeed(screenEl) {
  const container = screenEl.querySelector('.v3-feed-items');
  if (!container || !window.FRIEND_ACTIVITY) return;
  const picked = [...window.FRIEND_ACTIVITY].sort(() => Math.random() - 0.5).slice(0, 6);
  container.innerHTML = picked.map(f => {
    const idx = window.FRIEND_ACTIVITY.indexOf(f);
    const artStyle = f.image ? `background-image:url('${f.image}')` : `background:#444`;
    return `<div class="v3-friend-card" onclick="event.stopPropagation(); openFriendReview(${idx})">
      <div class="v3-friend-art" style="${artStyle}" onclick="event.stopPropagation(); openFriendAlbum(${idx})"></div>
      <div class="v3-friend-body">
        <div class="v3-friend-who">
          <div class="v3-friend-av" style="background:${f.grad}">${f.init}</div>
          <span class="v3-friend-name">${f.user}</span>
          <span class="v3-friend-time">${f.ago}</span>
        </div>
        <div class="v3-friend-meta">
          <span class="v3-friend-album">${f.album}</span>
          <span class="v3-friend-sep">·</span>
          <span class="v3-friend-artist">${f.artist}</span>
          <span class="v3-friend-date">${f.year}</span>
        </div>
        <div class="v3-friend-row">
          ${halfStars(f.rating, 10)}
          <span class="v3-friend-likes">♥ ${f.likes}</span>
          <span class="v3-friend-likes">💬 ${f.comments}</span>
        </div>
        <div class="v3-friend-quote">${f.quote}</div>
      </div>
    </div>`;
  }).join('');
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
  preloadColors(seq);
  idx = ((idx % seq.length) + seq.length) % seq.length;
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
  const seq = albumSeq();
  if (!seq.length) return;
  preloadColors(seq);
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
  greetRing();   // first home render of the session → the dots say hi
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
  preloadPreviews(albumSeq());
}

// Warm the preview cache for the whole album window (mirrors preloadColors / preloadForYou)
function preloadPreviews(seq) {
  if (!PREVIEW.on) return;
  (seq || []).forEach(a => { if (a) fetchPreviewUrl(a); });
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

        const colors = {
          accent, box1, box2,
          box1color: `rgb(${cl(b1r)},${cl(b1g)},${cl(b1b)})`,
          box1L, box2L,
          box1colorL: `rgb(${L1r},${L1g},${L1b})`,
        };
        COLOR_CACHE.set(url, colors);
        resolve(colors);
      } catch (e) { resolve(null); /* CORS / tainted canvas — keep CSS defaults */ }
    };
    img.src = url;
  });
  COLOR_PENDING.set(url, p);
  p.then(() => COLOR_PENDING.delete(url));
  return p;
}

function applyColorVars(screenEl, c) {
  if (!screenEl || !c) return;
  screenEl.style.setProperty('--v3-accent', c.accent);
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

// Warm the palette cache for every album in the window (mirrors preloadForYou).
function preloadColors(seq) {
  (seq || []).forEach(a => { if (a && a.image) computeAlbumColors(a.image); });
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
  // (open menus, tab selection, the back-pill smile).
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
  { id: 'review',     label: 'Review',        flow: true },
  { id: 'profile',    label: 'Profile'       },
  { id: 'playlists',  label: 'Playlists'     },
  { id: 'playlist',   label: 'Playlist Page' },
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
    case 'review':
      goHomeThenShells(scr => window.enterReview(scr));
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
  const arc = window.ARCHIVE;
  if (!arc || arc.length < 6) return;
  const idx = Math.floor(Math.random() * arc.length);
  window.featuredAlbum = arc[idx];
  const others = arc.filter((_, i) => i !== idx);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  window.trendingAlbums = others.slice(0, 5);
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
  if (targetId === 'search' || targetId === 'album' || targetId === 'artist' || targetId === 'review') {
    const arc = window.ARCHIVE || [];
    const a = window.activeAlbum || window.featuredAlbum || arc[0];
    activeNavId = targetId;
    if (targetId === 'search') window.openSearch();
    else if (targetId === 'album'  && a) window.openAlbumPage(a);
    else if (targetId === 'artist' && a) window.openArtistPageFor(a.artist);
    else if (targetId === 'review') goHomeThenShells(scr => window.enterReview(scr));
    renderPageNav();
    return;
  }

  const idx = SCREENS.findIndex(s => s.id === targetId);
  if (idx === -1) return;
  activeNavId = targetId;

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
const SDLOG_ICONS = {
  ear:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8a5 5 0 0 1 10 0c0 3-2.2 4.1-3.4 5.3-.8.8-1.2 1.5-1.2 2.7A2.4 2.4 0 0 1 7.6 17"/><path d="M9.6 8.5a2.6 2.6 0 0 1 4.9-.6"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.5-4.9-9.5-9C1 8.5 3 5 6.5 5 9 5 12 8 12 8s3-3 5.5-3C21 5 23 8.5 21.5 12c-2 4.1-9.5 9-9.5 9z"/></svg>`,
};
// A single vinyl record used as the rating unit (label punched in the sheet bg colour)
const SDLOG_REC = `<svg class="sd-rec" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor"/><circle cx="12" cy="12" r="8" fill="none" stroke="rgba(0,0,0,0.28)" stroke-width="0.8"/><circle cx="12" cy="12" r="4.4" fill="#1c1c22"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>`;
const SDLOG_RECS = SDLOG_REC.repeat(5);
const SDLOG_PENCIL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>`;
let SDLOG = null;   // { subject, rating, listened, later, fav, songs:[{title,rating,text}] }

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
      <div class="sd-log-foot">
        <button class="sd-log-save">Save log</button>
      </div>
    </div>`;

  ov.addEventListener('click', e => { e.stopPropagation(); if (e.target === ov) closeLogSheet(); });
  ov.addEventListener('mousedown', e => e.stopPropagation());
  ov.querySelector('.sd-log-sheet').addEventListener('click', e => e.stopPropagation());
  ov.querySelector('.sd-log-x').addEventListener('click', closeLogSheet);
  ov.querySelector('.sd-log-save').addEventListener('click', commitLog);
  ov.querySelectorAll('.sd-log-opt').forEach(b => b.addEventListener('click', () => toggleLogOpt(b.dataset.k, b)));

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
    if (SDLOG.songs[i]) { SDLOG.songs[i].text = inp.value; markSongLogged(row, i); }
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

  SDLOG = { subject: subj, rating: 0, listened: false, later: false, fav: false, songs: [] };
  ov.querySelector('.sd-log-cover').style.backgroundImage = `url("${subj.image}")`;
  ov.querySelector('.sd-log-album').textContent = subj.title;
  ov.querySelector('.sd-log-artist').textContent = subj.subtitle;
  ov.querySelector('.sd-log-write').value = '';
  ov.querySelectorAll('.sd-log-opt').forEach(b => b.classList.remove('on'));
  setLogRating(0);
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
  const sheet = ov.querySelector('.sd-log-sheet');
  if (sheet) sheet.scrollTop = 0;
  requestAnimationFrame(() => ov.classList.add('open'));
};

// Build the per-song rating/review rows for an album's log sheet.
function fillLogSongs(ov, album) {
  const box = ov.querySelector('.sd-log-songs');
  const list = ov.querySelector('.sd-log-songs-list');
  if (!box || !list) return;
  const songs = album ? songsFor(album) : [];
  if (!songs.length) { box.hidden = true; list.innerHTML = ''; if (SDLOG) SDLOG.songs = []; return; }
  if (SDLOG) SDLOG.songs = songs.map(s => ({ title: s.title, rating: 0, text: '' }));
  box.hidden = false;
  list.innerHTML = songs.map((s, i) => `
    <div class="sd-log-song" data-i="${i}">
      <span class="sd-log-song-num">${i + 1}</span>
      <span class="sd-log-song-title">${s.title}</span>
      <span class="sd-log-song-val"></span>
      <span class="sd-log-song-rate-track">
        <span class="sd-log-song-empty">${SDLOG_RECS}</span>
        <span class="sd-log-song-fill" style="width:0">${SDLOG_RECS}</span>
      </span>
    </div>`).join('');
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
}

// A song is "logged" once it has a rating or a note; reflected as a highlight.
function markSongLogged(row, i) {
  const s = SDLOG && SDLOG.songs[i];
  const logged = !!s && (s.rating > 0 || (s.text && s.text.trim().length > 0));
  row.classList.toggle('is-logged', logged);
}

// Save: keep only songs the user actually rated or reviewed, then close.
function commitLog() {
  if (SDLOG && SDLOG.songs) {
    SDLOG.loggedSongs = SDLOG.songs.filter(s => s.rating > 0 || (s.text && s.text.trim().length > 0));
  }
  closeLogSheet();
}

window.closeLogSheet = function() {
  const ov = document.getElementById('sd-log');
  if (ov) ov.classList.remove('open');
};

function setLogRating(v) {
  if (!SDLOG) return;
  SDLOG.rating = v;
  const ov = document.getElementById('sd-log');
  if (!ov) return;
  ov.querySelector('.sd-log-stars-fill').style.width = (v / 5 * 100) + '%';
  ov.querySelector('.sd-log-rate-val').textContent = v ? String(v).replace(/\.0$/, '') : '';
}

function toggleLogOpt(k, btn) {
  if (!SDLOG) return;
  SDLOG[k] = !SDLOG[k];
  btn.classList.toggle('on', SDLOG[k]);
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
    resEl.innerHTML = `<div class="sds-empty">Search artists, albums and songs across the catalogue.</div>`;
    ov._last = { artists: [], albums: [], songs: [] };
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
  // Delegated taps: suggestion → fill field; "see all" → switch tab; row → open.
  ov.addEventListener('click', e => {
    const sug = e.target.closest('.sds-sug');
    if (sug) { inp.value = sug.dataset.pick; inp.focus(); runSearch(); return; }
    const row = e.target.closest('.sds-row');
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
  bio:    'Shoegaze apologist. I will make you a playlist whether you asked for one or not.',
  pic:    'images/playlist-statue-night.jpg',
  favs:   ['Punisher', 'Loveless', 'Blonde', 'Currents', 'To Pimp a Butterfly'],
  socials:{ instagram: 'ericd', x: 'ericd', soundcloud: 'ericd' },
};
let _profSlot = 0;

// ── Favourite-album picker (bottom sheet mounted in the tapped profile) ──
window.openProfPicker = function (slot, btn) {
  _profSlot = slot;
  const host = (btn && btn.closest && btn.closest('.app-screen'))
             || document.querySelector('.app-screen.s-prof2') || document.querySelector('.app-screen') || document.body;
  const ov = ensureProfPicker();
  host.appendChild(ov);   // inherits the panel/home palette vars from .s-prof2
  const inp = ov.querySelector('.pp-input'); if (inp) inp.value = '';
  profPickerRender('');
  requestAnimationFrame(() => { ov.classList.add('open'); setTimeout(() => inp && inp.focus(), 80); });
};
function ensureProfPicker() {
  let ov = document.getElementById('prof-picker');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'prof-picker';
  ov.className = 'prof-picker';
  ov.innerHTML = `
    <div class="pp-sheet">
      <div class="pp-handle-bar"></div>
      <div class="pp-top">
        <div class="pp-title">Choose a favourite</div>
        <button class="pp-close" onclick="closeProfPicker()" aria-label="Close">×</button>
      </div>
      <div class="pp-searchbar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
        <input class="pp-input" type="text" placeholder="Search albums" autocomplete="off" spellcheck="false" oninput="profPickerRender(this.value)">
      </div>
      <div class="pp-grid"></div>
    </div>`;
  ov.addEventListener('click', e => { if (e.target === ov) closeProfPicker(); });
  return ov;
}
function profPickerRender(q) {
  const ov = document.getElementById('prof-picker'); if (!ov) return;
  q = String(q || '').toLowerCase();
  const cur = (window.PROFILE.favs || [])[_profSlot];
  const list = (window.ARCHIVE || []).filter(a => !q || a.album.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q));
  ov.querySelector('.pp-grid').innerHTML = list.slice(0, 60).map(a => `
    <button class="pp-item${a.album === cur ? ' pp-item--on' : ''}" onclick="profPick('${obOc(a.album)}')">
      <span class="pp-img" style="background-image:url('${a.image}')"></span>
      <span class="pp-t">${obEsc(a.album)}</span>
      <span class="pp-s">${obEsc(a.artist)}</span>
    </button>`).join('') || `<div class="pp-empty">No albums match “${obEsc(q)}”.</div>`;
}
window.profPick = function (name) {
  if (!window.PROFILE.favs) window.PROFILE.favs = [];
  window.PROFILE.favs[_profSlot] = name;
  closeProfPicker();
  renderViewer();
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

document.addEventListener('DOMContentLoaded', init);
