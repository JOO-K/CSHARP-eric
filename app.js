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
      applyAlbumColors(el);
    });
    applyFilletMasks();
  });
}

// ── Home screen data population ───────────────────────────────
function populateHomeData(screenEl) {
  const a = window.featuredAlbum || (window.ARCHIVE && window.ARCHIVE[0]);
  if (!a) return;

  const albumEl = screenEl.querySelector('.v3-album');
  if (albumEl) {
    albumEl.style.backgroundImage = `url('${a.image}')`;
    albumEl.onclick = () => window.openAlbum(a);
  }

  const cdEl = screenEl.querySelector('.v3-cd');
  if (cdEl) cdEl.style.backgroundImage = `url('${a.image}')`;

  const trending = window.trendingAlbums || (window.ARCHIVE || []).slice(0, 5);
  screenEl.querySelectorAll('.v3-stripe-item').forEach((el, i) => {
    if (trending[i]) {
      el.style.backgroundImage = `url('${trending[i].image}')`;
      el.onclick = () => window.openAlbum(trending[i]);
    }
  });

  const starsRow = screenEl.querySelector('.v3-blue-stars-row');
  if (starsRow) {
    starsRow.innerHTML = `
      <span class="v3-blue-score">${a.rating.toFixed(1)}</span>
      ${halfStars(a.rating, 18)}
      <span class="v3-blue-count">${window.fmtRc(a.reviewCount)} reviews</span>`;
    starsRow.parentElement.onclick = () => window.openAlbum(a);
  }

  const quoteTextEl = screenEl.querySelector('.v3-blue-quote-text');
  if (quoteTextEl && a.reviews && a.reviews.length) {
    const rev = a.reviews[0];
    quoteTextEl.textContent = `"${rev.text}"`;
    const quoteContainer = quoteTextEl.parentElement;
    requestAnimationFrame(() => {
      if (quoteTextEl.scrollWidth > quoteContainer.offsetWidth) {
        const overflow = quoteTextEl.scrollWidth - quoteContainer.offsetWidth;
        quoteTextEl.style.setProperty('--quote-scroll', `-${overflow}px`);
        quoteContainer.classList.add('v3-blue-quote--scroll');
      }
    });
  }
}

// ── Album color extraction ────────────────────────────────────
function applyAlbumColors(screenEl) {
  const albumEl = screenEl.querySelector('.v3-album');
  if (!albumEl) return;
  const bg = getComputedStyle(albumEl).backgroundImage;
  const m  = bg.match(/url\(['"]?([^'"]+?)['"]?\)/);
  if (!m) return;

  const img = new Image();
  img.onload = () => {
    try {
      const sz = 48;
      const cv = document.createElement('canvas');
      cv.width = cv.height = sz;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0, sz, sz);
      const d = ctx.getImageData(0, 0, sz, sz).data;

      let maxSat = 0, ar = 200, ag = 120, ab = 60;
      let tR = 0, tG = 0, tB = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i+3] < 120) continue;
        const r = d[i], g = d[i+1], b = d[i+2];
        tR += r; tG += g; tB += b; n++;
        const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
        const sat = mx ? (mx-mn)/mx : 0;
        const lum = (mx+mn)/510;
        if (sat > maxSat && lum > 0.15 && lum < 0.88) {
          maxSat = sat; ar = r; ag = g; ab = b;
        }
      }
      if (!n) return;

      const hex = v => v.toString(16).padStart(2,'0');
      // Boost accent luminance so score is readable on the dark bento surface
      let bAR = ar, bAG = ag, bAB = ab;
      const aLum = (Math.max(bAR,bAG,bAB) + Math.min(bAR,bAG,bAB)) / 510;
      if (aLum < 0.55) {
        const scale = 0.65 / Math.max(aLum, 0.05);
        bAR = Math.min(255, Math.round(bAR * scale));
        bAG = Math.min(255, Math.round(bAG * scale));
        bAB = Math.min(255, Math.round(bAB * scale));
      }
      const accent = `#${hex(bAR)}${hex(bAG)}${hex(bAB)}`;

      // Box 1 bg: dark tint towards accent hue — bright enough to read against #111116 bg
      const b1r = Math.min(90, Math.round(ar*0.30+22));
      const b1g = Math.min(72, Math.round(ag*0.22+14));
      const b1b = Math.min(80, Math.round(ab*0.28+16));
      // Box 2 bg: very dark complementary
      const b2r = Math.min(35, Math.round((255-ar)*0.10+4));
      const b2g = Math.min(35, Math.round((255-ag)*0.10+4));
      const b2b = Math.min(55, Math.round((255-ab)*0.15+8));

      const box1 = `linear-gradient(155deg,rgb(${b1r},${b1g},${b1b}),rgb(${Math.min(b1r+12,65)},${Math.min(b1g+8,45)},${Math.min(b1b+8,45)}))`;
      const box2 = `linear-gradient(155deg,rgb(${b2r},${b2g},${b2b}),rgb(${Math.min(b2r+6,40)},${Math.min(b2g+6,40)},${Math.min(b2b+14,65)}))`;

      screenEl.style.setProperty('--v3-accent', accent);
      screenEl.style.setProperty('--v3-box1-bg', box1);
      screenEl.style.setProperty('--v3-box2-bg', box2);
      screenEl.style.setProperty('--v3-box1-color', `rgb(${b1r},${b1g},${b1b})`);
    } catch(e) { /* CORS / tainted canvas — keep CSS defaults */ }
  };
  img.src = m[1];
}

function renderSingle() {
  const c = document.getElementById('phone-container');
  const s = currentScreen();

  if (s.variants.length <= 1) {
    c.className = '';
    c.innerHTML = `
      <div class="var-col">
        ${s.variants[0].version ? `<div class="var-label">${s.variants[0].version}</div>` : ''}
        <div class="phone-wrap">${buildPhoneHTML(s)}</div>
      </div>`;
    setPhoneScale();
    return;
  }

  c.className = 'multi-variant';
  const n      = s.variants.length;
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

function renderPageNav() {
  const nav = document.getElementById('page-nav');
  if (!nav) return;
  nav.innerHTML = SCREENS.map((s, i) =>
    `<button class="pnav-btn ${i === currentIdx ? 'active' : ''}" onclick="goToScreen(${i})">${s.name}</button>`
  ).join('') + `
    <div class="pnav-divider"></div>
    <button class="pnav-btn pnav-multi ${viewMode === 'multi' ? 'multi-active' : ''}" onclick="toggleMulti()">⊞ Multi</button>
  `;
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
function navigatePrev() { if (currentIdx > 0) { currentIdx--; renderViewer(); } }
function navigateNext() { if (currentIdx < SCREENS.length - 1) { currentIdx++; renderViewer(); } }

function goToScreen(idx) {
  if (viewMode === 'multi') viewMode = 'single';
  currentIdx = idx;
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
  requestAnimationFrame(scaleMobilePhone);
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
  document.getElementById('mobile-content').innerHTML = getVariant(SCREENS[idx]).html;
  currentIdx = idx;
}

window.goToMobileScreen = function(idx) {
  currentIdx = idx;
  setMobileView('single');
};

// ── navigate() — called from screen HTML onclick ─────────────
window.navigate = function(targetId, direction) {
  const idx = SCREENS.findIndex(s => s.id === targetId);
  if (idx === -1) return;

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

document.addEventListener('DOMContentLoaded', init);
