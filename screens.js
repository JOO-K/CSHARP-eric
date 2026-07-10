// ============================================================
//  SCREENS
// ============================================================

const SCREENS = [

  // ── 1. AUTH ─────────────────────────────────────────────────
  {
    id: 'auth', name: 'Auth / Login', statusTheme: 'light',
    variants: [{
      label: 'v1',
      thumb: ['w50','w80','accent','w80','accent'],
      html: `
      <div class="app-screen s-auth">
        <div class="auth-hero">
          <div class="auth-logo-circle" style="background:linear-gradient(135deg,#2a2820,#4a4640)">
            <svg viewBox="0 0 48 48" width="36" height="36" fill="none" stroke="white" stroke-width="2">
              <circle cx="24" cy="24" r="20"/><circle cx="24" cy="24" r="8"/>
              <circle cx="24" cy="24" r="3" fill="white" stroke="none"/>
            </svg>
          </div>
          <div class="auth-appname">Spindeck</div>
        </div>
        <div class="auth-body">
          <div class="field-group">
            <div class="field"><label>Email</label><input type="email" placeholder="you@example.com"></div>
            <div class="field"><label>Password</label><input type="password" placeholder="••••••••"></div>
          </div>
          <button class="btn-primary" style="margin-top:8px" onclick="navigate('onboarding')">Sign In</button>
          <div class="divider" style="margin:16px 0">or</div>
          <button class="btn-outline" onclick="navigate('onboarding')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <button class="link-btn" style="margin-top:20px" onclick="navigate('onboarding')">Don't have an account? <span style="color:var(--accent)">Sign Up</span></button>
        </div>
      </div>`
    }]
  },

  // ── 2. ONBOARDING ───────────────────────────────────────────
  {
    id: 'onboarding', name: 'Onboarding', statusTheme: 'light',
    variants: [{
      label: 'v1',
      thumb: ['w70','accent','w80','w60','w70'],
      html: `
      <div class="app-screen s-onboarding">
        <div class="ob-header">
          <div class="ob-progress"><div class="ob-prog-bar" style="width:33%"></div></div>
          <div class="ob-step">Step 1 of 3</div>
          <div class="ob-title">What do you listen to?</div>
          <div class="ob-sub">Pick all that apply — we'll personalise your feed.</div>
        </div>
        <div class="ob-body">
          <div class="genre-chips">
            <button class="chip selected">Electronic</button><button class="chip">Indie</button>
            <button class="chip selected">Hip-Hop</button><button class="chip">Jazz</button>
            <button class="chip">R&amp;B / Soul</button><button class="chip selected">Alternative</button>
            <button class="chip">Classical</button><button class="chip">Pop</button>
            <button class="chip">Metal</button><button class="chip">Folk</button>
            <button class="chip">Ambient</button><button class="chip">Latin</button>
            <button class="chip">Country</button><button class="chip selected">Punk</button>
            <button class="chip">Funk</button><button class="chip">Blues</button>
          </div>
        </div>
        <div class="ob-footer">
          <button class="btn-primary" onclick="navigate('home')">Next →</button>
          <button class="link-btn" onclick="navigate('home')">Skip for now</button>
        </div>
      </div>`
    }]
  },

  // ── 3. HOME ──────────────────────────────────────────────────
  {
    id: 'home', name: 'Home', statusTheme: 'light',
    variants: [

      // ── 3a. Bento (Charcoal look) ───────────────────────────
      {
        label: 'Bento', version: 'v1.0',
        thumb: ['w70','accent','w80','accent','w80'],
        html: `
        <div class="app-screen s-home-bento">
          ${topNav('home')}

          <div class="home-bento-bar">
            <div class="hbb-logo">Spindeck</div>
            <div class="hbb-icons">
              <button class="icon-btn" onclick="navigate('search')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
              </button>
              <button class="icon-btn" onclick="navigate('profile')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
            </div>
          </div>

          <div class="bento-wrap">
          <div class="bento-grid">

            <div class="bento-card bc-hero" style="grid-row:span 2" onclick="navigate('album')">
              <div class="bc-hero-art" style="background-image:url('images/album-crystalcastles1.png')"></div>
              <div class="bc-hero-body">
                <div class="bc-hero-who">
                  <div class="bc-hero-av" style="background:linear-gradient(135deg,#1c1c3e,#3b1fa8)">E</div>
                  <span class="bc-hero-name">echoplex</span>
                  <span class="bc-hero-verb">reviewed</span>
                </div>
                <div class="bc-hero-album">Crystal Castles</div>
                <div style="margin-bottom:3px">${halfStars(4, 12)}</div>
                <div class="bc-hero-quote">"chaotic and beautiful. alice's vocals hit like static shock"</div>
              </div>
            </div>

            <div class="bento-card bc-mini" onclick="navigate('album')">
              <div class="bc-mini-art" style="background-image:url('images/album-punisher.png')"></div>
              <div class="bc-mini-body">
                <div class="bc-mini-user">staticfog</div>
                <div class="bc-mini-title">Punisher</div>
                <div>${halfStars(5, 10)}</div>
              </div>
            </div>

            <div class="bento-card bc-stat">
              <div class="bc-stat-num">3</div>
              <div class="bc-stat-label">friends reviewed</div>
              <div class="bc-stat-sub">this week</div>
            </div>

            <div class="bento-card bc-pymk span2">
              <div class="pymk-hd">
                <span class="pymk-title">People You May Know</span>
                <span class="pymk-sub">from contacts</span>
              </div>
              <div class="pymk-row">
                <div class="pymk-person"><div class="pymk-av" style="background:linear-gradient(135deg,#0c4a1e,#16a34a)">JK</div><div class="pymk-name">josekm</div><div class="pymk-count">24 reviews</div></div>
                <div class="pymk-person"><div class="pymk-av" style="background:linear-gradient(135deg,#164e63,#0284c7)">SF</div><div class="pymk-name">staticfog</div><div class="pymk-count">89 reviews</div></div>
                <div class="pymk-person"><div class="pymk-av" style="background:linear-gradient(135deg,#450a0a,#dc2626)">VB</div><div class="pymk-name">velvetblast</div><div class="pymk-count">212 reviews</div></div>
                <div class="pymk-person"><div class="pymk-av" style="background:linear-gradient(135deg,#3b0764,#9333ea)">KM</div><div class="pymk-name">kira_m</div><div class="pymk-count">41 reviews</div></div>
                <div class="pymk-person"><div class="pymk-add-btn">+</div><div class="pymk-name">find more</div><div class="pymk-count">&nbsp;</div></div>
              </div>
            </div>

            <div class="bento-card bc-trend span2" onclick="navigate('album')">
              <div class="bc-tr-label">Trending Review</div>
              <div class="bc-tr-quote">"this album rewired my brain. nothing before or after sounds like it"</div>
              <div class="bc-tr-by">
                <span>staticfog on <strong style="color:var(--text)">1000 gecs</strong></span>
                <span>${halfStars(5, 11)}</span>
              </div>
              <div class="bc-tr-ghost-art" style="background:linear-gradient(135deg,#042a10,#6aff3a 120%)"></div>
            </div>

            <div class="bento-card bc-disc span2" onclick="navigate('wall')">
              <div class="bc-disc-thumbs">
                <div class="bc-disc-thumb" style="background-image:url('images/album-punisher.png')"></div>
                <div class="bc-disc-thumb" style="background-image:url('images/album-crystalcastles1.png')"></div>
                <div class="bc-disc-thumb" style="background:linear-gradient(135deg,#052e16,#86efac)"></div>
                <div class="bc-disc-thumb" style="background:linear-gradient(135deg,#1a0533,#7e22ce)"></div>
              </div>
              <div class="bc-disc-text">
                <div class="bc-disc-label">Popular Albums</div>
                <div class="bc-disc-sub">89k logged this month</div>
              </div>
              <div class="bc-disc-arr">›</div>
            </div>

          </div>
          </div>
        </div>`
      },

      // ── 3b. TikTok Swipe (Editorial look) ──────────────────
      {
        label: 'TikTok', version: 'v1.1',
        thumb: ['accent','w80','accent','w60','w80'],
        html: `
        <div class="app-screen s-home-tiktok">
          ${topNav('home')}

          <div class="htok-scroll">

            <div class="htok-card">
              <div class="htok-bg" style="background-image:url('images/album-punisher.png')"></div>
              <div class="htok-overlay"></div>
              <div class="htok-content">
                <div class="htok-who">
                  <div class="htok-av" style="background:linear-gradient(135deg,#1c1c3e,#3b1fa8)">E</div>
                  <span class="htok-name">echoplex</span>
                  <span class="htok-verb">just reviewed</span>
                </div>
                <div class="htok-art-wrap">
                  <div class="htok-art" style="background-image:url('images/album-punisher.png')"></div>
                </div>
                <div class="htok-info">
                  <div class="htok-album">Punisher</div>
                  <div class="htok-artist">PHOEBE BRIDGERS · 2020</div>
                  <div style="margin-bottom:6px">${halfStars(5, 15)}</div>
                  <div class="htok-quote">"funeral is the most heartbreaking song ive heard in years. she ruins you gently"</div>
                </div>
                <div class="htok-actions">
                  <button class="htok-skip" onclick="navigate('home')">Skip</button>
                  <button class="htok-log" onclick="navigate('review')">Log This Too ↗</button>
                </div>
                <div class="htok-hint">↑ · next friend's pick</div>
              </div>
            </div>

            <div class="htok-card">
              <div class="htok-bg" style="background-image:url('images/album-crystalcastles1.png')"></div>
              <div class="htok-overlay"></div>
              <div class="htok-content">
                <div class="htok-who">
                  <div class="htok-av" style="background:linear-gradient(135deg,#164e63,#0284c7)">SF</div>
                  <span class="htok-name">staticfog</span>
                  <span class="htok-verb">just reviewed</span>
                </div>
                <div class="htok-art-wrap">
                  <div class="htok-art" style="background-image:url('images/album-crystalcastles1.png')"></div>
                </div>
                <div class="htok-info">
                  <div class="htok-album">Crystal Castles</div>
                  <div class="htok-artist">CRYSTAL CASTLES · 2008</div>
                  <div style="margin-bottom:6px">${halfStars(4.5, 15)}</div>
                  <div class="htok-quote">"chaotic and beautiful. alice's vocals hit like static shock every single time"</div>
                </div>
                <div class="htok-actions">
                  <button class="htok-skip" onclick="navigate('home')">Skip</button>
                  <button class="htok-log" onclick="navigate('review')">Log This Too ↗</button>
                </div>
                <div class="htok-hint">↑ · next friend's pick</div>
              </div>
            </div>

            <div class="htok-card">
              <div class="htok-bg" style="background:linear-gradient(135deg,#021a0b,#0f4a1a)"></div>
              <div class="htok-overlay"></div>
              <div class="htok-content">
                <div class="htok-who">
                  <div class="htok-av" style="background:linear-gradient(135deg,#3b0764,#9333ea)">KM</div>
                  <span class="htok-name">kira_m</span>
                  <span class="htok-verb">just reviewed</span>
                </div>
                <div class="htok-art-wrap">
                  <div class="htok-art" style="background:linear-gradient(135deg,#042a10,#6aff3a 130%);display:flex;align-items:center;justify-content:center">
                    <span style="font-size:40px;font-weight:800;color:#000;letter-spacing:-3px;opacity:0.8;font-family:var(--font-main)">gecs</span>
                  </div>
                </div>
                <div class="htok-info">
                  <div class="htok-album">1000 gecs</div>
                  <div class="htok-artist">100 GECS · 2019</div>
                  <div style="margin-bottom:6px">${halfStars(5, 15)}</div>
                  <div class="htok-quote">"this album rewired my brain. nothing before or after sounds like it"</div>
                </div>
                <div class="htok-actions">
                  <button class="htok-skip" onclick="navigate('home')">Skip</button>
                  <button class="htok-log" style="background:#5adf1a;color:#000" onclick="navigate('review')">Log This Too ↗</button>
                </div>
                <div class="htok-hint">&nbsp;</div>
              </div>
            </div>

          </div>
        </div>`
      },

      // ── 3c. Dorfic / Frutiger Aero Orange (Dorfic look) ────
      {
        label: 'Dorfic', version: 'v1.2',
        thumb: ['accent','accent','w70','accent','w60'],
        html: `
        <div class="app-screen s-home-dorf">

          <div class="dorf-topbar">
            <div class="dorf-wordmark">Spindeck</div>
            <div style="display:flex;gap:6px">
              <button class="icon-btn" onclick="navigate('search')" style="background:var(--surface);border:1px solid var(--border)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
              </button>
              <button class="icon-btn" onclick="navigate('profile')" style="background:var(--surface);border:1px solid var(--border)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
            </div>
          </div>

          <div class="dorf-scroll">

            <!-- BIG GLOWING PLAYER HERO -->
            <div class="dorf-player" onclick="navigate('album')">
              <div class="dorf-player-aura"></div>
              <div class="dorf-player-art" style="background-image:url('images/album-punisher.png')"></div>
              <div class="dorf-player-label">Rec. of the Day</div>
              <div class="dorf-player-title">Punisher</div>
              <div class="dorf-player-artist">PHOEBE BRIDGERS · 2020</div>
              <div class="dorf-player-stars">${halfStars(4.5, 14)}</div>
              <button class="dorf-player-btn" onclick="event.stopPropagation();navigate('review')">Log It</button>
            </div>

            <!-- PILL TABS -->
            <div class="dorf-tabs">
              <button class="dorf-tab active">For You</button>
              <button class="dorf-tab">Friends</button>
              <button class="dorf-tab">New Releases</button>
            </div>

            <!-- HORIZONTAL BUBBLE CAROUSEL -->
            <div class="dorf-carousel-row">
              <div class="dorf-bubble" onclick="navigate('album')">
                <div class="dorf-bubble-art" style="background-image:url('images/album-crystalcastles1.png')"></div>
                <div class="dorf-bubble-body"><div class="dorf-bubble-title">CC I</div><div class="dorf-bubble-meta">★ 4.4 · 19k</div></div>
              </div>
              <div class="dorf-bubble" onclick="navigate('album')">
                <div class="dorf-bubble-art" style="background:linear-gradient(135deg,#042a10,#6aff3a 130%)"></div>
                <div class="dorf-bubble-body"><div class="dorf-bubble-title">1000 gecs</div><div class="dorf-bubble-meta">★ 4.6 · 50k</div></div>
              </div>
              <div class="dorf-bubble" onclick="navigate('album')">
                <div class="dorf-bubble-art" style="background:linear-gradient(135deg,#2a0044,#ff1a6e 200%)"></div>
                <div class="dorf-bubble-body"><div class="dorf-bubble-title">Leather Teeth</div><div class="dorf-bubble-meta">★ 4.5 · 9.8k</div></div>
              </div>
              <div class="dorf-bubble" onclick="navigate('album')">
                <div class="dorf-bubble-art" style="background:linear-gradient(135deg,#1a1a3e,#4c1d95)"></div>
                <div class="dorf-bubble-body"><div class="dorf-bubble-title">Untrue</div><div class="dorf-bubble-meta">★ 4.8 · 32k</div></div>
              </div>
              <div class="dorf-bubble" onclick="navigate('album')">
                <div class="dorf-bubble-art" style="background:linear-gradient(135deg,#3a0000,#cc0000)"></div>
                <div class="dorf-bubble-body"><div class="dorf-bubble-title">Merriweather</div><div class="dorf-bubble-meta">★ 4.7 · 41k</div></div>
              </div>
            </div>

            <!-- FRIEND ACTIVITY — notification pills -->
            <div class="dorf-act-hd">
              <span class="dorf-act-label">Friend Activity</span>
              <button class="dorf-act-seeall" onclick="navigate('feed')">See all ›</button>
            </div>
            <div class="dorf-act-list">
              <div class="dorf-act-pill" onclick="navigate('album')">
                <div class="dorf-act-av" style="background:linear-gradient(135deg,#1c1c3e,#3b1fa8)">E</div>
                <div class="dorf-act-text">
                  <div class="dorf-act-who">echoplex</div>
                  <span class="dorf-act-album">Crystal Castles</span>
                </div>
                <div class="dorf-act-rating">★★★★½</div>
              </div>
              <div class="dorf-act-pill" onclick="navigate('album')">
                <div class="dorf-act-av" style="background:linear-gradient(135deg,#164e63,#0284c7)">SF</div>
                <div class="dorf-act-text">
                  <div class="dorf-act-who">staticfog</div>
                  <span class="dorf-act-album">1000 gecs</span>
                </div>
                <div class="dorf-act-rating">★★★★★</div>
              </div>
              <div class="dorf-act-pill" onclick="navigate('album')">
                <div class="dorf-act-av" style="background:linear-gradient(135deg,#3b0764,#9333ea)">KM</div>
                <div class="dorf-act-text">
                  <div class="dorf-act-who">kira_m</div>
                  <span class="dorf-act-album">Leather Teeth</span>
                </div>
                <div class="dorf-act-rating">★★★★</div>
              </div>
              <div class="dorf-act-pill" onclick="navigate('album')">
                <div class="dorf-act-av" style="background:linear-gradient(135deg,#0c4a1e,#16a34a)">JK</div>
                <div class="dorf-act-text">
                  <div class="dorf-act-who">josekm</div>
                  <span class="dorf-act-album">Punisher</span>
                </div>
                <div class="dorf-act-rating">★★★★½</div>
              </div>
            </div>

          </div>
        </div>`
      },

      // ── 3d. Float·Light (version2 light theme) ─────────────
      {
        label: 'Float·Light', version: 'v2.0',
        thumb: ['w80','w80','w80','w80','w80'],
        html: `
        <div class="app-screen s-home-v2 s-home-v2--light">

          <div class="v2-topbar">
            <div class="v2-wordmark">Spindeck</div>
            <div class="v2-icons">
              <button class="v2-icon-btn" onclick="navigate('search')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
              </button>
              <button class="v2-icon-btn" onclick="navigate('profile')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
            </div>
          </div>

          <div class="v2-scroll">
            <div class="v2-grid">

              <div class="v2-card v2-hero" onclick="navigate('album')">
                <div class="v2-hero-art" style="background-image:url('images/album-crystalcastles1.png')"></div>
                <div class="v2-hero-body">
                  <div class="v2-who">
                    <div class="v2-av">E</div>
                    <span>echoplex</span>
                    <span style="opacity:.6">reviewed</span>
                  </div>
                  <div class="v2-hero-album">Crystal Castles</div>
                  <div style="margin-bottom:3px">${halfStars(4, 11)}</div>
                  <div class="v2-hero-quote">"chaotic and beautiful. alice's vocals hit like static shock"</div>
                </div>
              </div>

              <div class="v2-card v2-mini" onclick="navigate('album')">
                <div class="v2-mini-art" style="background-image:url('images/album-punisher.png')"></div>
                <div class="v2-mini-body">
                  <div class="v2-mini-user">staticfog</div>
                  <div class="v2-mini-title">Punisher</div>
                  <div style="margin-top:3px">${halfStars(5, 10)}</div>
                </div>
              </div>

              <div class="v2-card v2-stat">
                <div class="v2-stat-num">3</div>
                <div class="v2-stat-label">friends reviewed</div>
                <div class="v2-stat-sub">this week</div>
              </div>

              <div class="v2-card v2-pymk v2-span2">
                <div class="v2-pymk-hd">
                  <span class="v2-pymk-title">People You May Know</span>
                  <span class="v2-pymk-sub">from contacts</span>
                </div>
                <div class="v2-pymk-row">
                  <div class="v2-person"><div class="v2-person-av" style="background:linear-gradient(135deg,#0c4a1e,#16a34a)">JK</div><div class="v2-person-name">josekm</div><div class="v2-person-count">24 rev.</div></div>
                  <div class="v2-person"><div class="v2-person-av" style="background:linear-gradient(135deg,#164e63,#0284c7)">SF</div><div class="v2-person-name">staticfog</div><div class="v2-person-count">89 rev.</div></div>
                  <div class="v2-person"><div class="v2-person-av" style="background:linear-gradient(135deg,#450a0a,#dc2626)">VB</div><div class="v2-person-name">velvetblast</div><div class="v2-person-count">212 rev.</div></div>
                  <div class="v2-person"><div class="v2-person-av" style="background:linear-gradient(135deg,#3b0764,#9333ea)">KM</div><div class="v2-person-name">kira_m</div><div class="v2-person-count">41 rev.</div></div>
                </div>
              </div>

              <div class="v2-card v2-trend v2-span2" onclick="navigate('album')">
                <div class="v2-trend-ghost"></div>
                <div class="v2-trend-label">Trending Review</div>
                <div class="v2-trend-quote">"this album rewired my brain. nothing before or after sounds like it"</div>
                <div class="v2-trend-by">
                  <span>staticfog on <strong>1000 gecs</strong></span>
                  <span>${halfStars(5, 11)}</span>
                </div>
              </div>

              <div class="v2-card v2-disc v2-span2" onclick="navigate('wall')">
                <div class="v2-disc-thumbs">
                  <div class="v2-disc-thumb" style="background-image:url('images/album-punisher.png')"></div>
                  <div class="v2-disc-thumb" style="background-image:url('images/album-crystalcastles1.png')"></div>
                  <div class="v2-disc-thumb" style="background:linear-gradient(135deg,#052e16,#86efac)"></div>
                  <div class="v2-disc-thumb" style="background:linear-gradient(135deg,#1a0533,#7e22ce)"></div>
                </div>
                <div class="v2-disc-text">
                  <div class="v2-disc-label">Popular Albums</div>
                  <div class="v2-disc-sub">89k logged this month</div>
                </div>
                <div class="v2-disc-arr">›</div>
              </div>

            </div>
          </div>
        </div>`
      },

      // ── 3e. Float·Dark (version2 dark theme) ───────────────
      {
        label: 'Float·Dark', version: 'v2.1',
        thumb: ['w50','w50','w60','w50','w50'],
        html: `
        <div class="app-screen s-home-v2 s-home-v2--dark">

          <div class="v2-topbar">
            <div class="v2-wordmark">Spindeck</div>
            <div class="v2-icons">
              <button class="v2-icon-btn" onclick="navigate('search')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
              </button>
              <button class="v2-icon-btn" onclick="navigate('profile')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
            </div>
          </div>

          <div class="v2-scroll">
            <div class="v2-grid">

              <div class="v2-card v2-hero" onclick="navigate('album')">
                <div class="v2-hero-art" style="background-image:url('images/album-crystalcastles1.png')"></div>
                <div class="v2-hero-body">
                  <div class="v2-who">
                    <div class="v2-av">E</div>
                    <span>echoplex</span>
                    <span style="opacity:.5">reviewed</span>
                  </div>
                  <div class="v2-hero-album">Crystal Castles</div>
                  <div style="margin-bottom:3px">${halfStars(4, 11)}</div>
                  <div class="v2-hero-quote">"chaotic and beautiful. alice's vocals hit like static shock"</div>
                </div>
              </div>

              <div class="v2-card v2-mini" onclick="navigate('album')">
                <div class="v2-mini-art" style="background-image:url('images/album-punisher.png')"></div>
                <div class="v2-mini-body">
                  <div class="v2-mini-user">staticfog</div>
                  <div class="v2-mini-title">Punisher</div>
                  <div style="margin-top:3px">${halfStars(5, 10)}</div>
                </div>
              </div>

              <div class="v2-card v2-stat">
                <div class="v2-stat-num">3</div>
                <div class="v2-stat-label">friends reviewed</div>
                <div class="v2-stat-sub">this week</div>
              </div>

              <div class="v2-card v2-pymk v2-span2">
                <div class="v2-pymk-hd">
                  <span class="v2-pymk-title">People You May Know</span>
                  <span class="v2-pymk-sub">from contacts</span>
                </div>
                <div class="v2-pymk-row">
                  <div class="v2-person"><div class="v2-person-av" style="background:linear-gradient(135deg,#0c4a1e,#16a34a)">JK</div><div class="v2-person-name">josekm</div><div class="v2-person-count">24 rev.</div></div>
                  <div class="v2-person"><div class="v2-person-av" style="background:linear-gradient(135deg,#164e63,#0284c7)">SF</div><div class="v2-person-name">staticfog</div><div class="v2-person-count">89 rev.</div></div>
                  <div class="v2-person"><div class="v2-person-av" style="background:linear-gradient(135deg,#450a0a,#dc2626)">VB</div><div class="v2-person-name">velvetblast</div><div class="v2-person-count">212 rev.</div></div>
                  <div class="v2-person"><div class="v2-person-av" style="background:linear-gradient(135deg,#3b0764,#9333ea)">KM</div><div class="v2-person-name">kira_m</div><div class="v2-person-count">41 rev.</div></div>
                </div>
              </div>

              <div class="v2-card v2-trend v2-span2" onclick="navigate('album')">
                <div class="v2-trend-ghost"></div>
                <div class="v2-trend-label">Trending Review</div>
                <div class="v2-trend-quote">"this album rewired my brain. nothing before or after sounds like it"</div>
                <div class="v2-trend-by">
                  <span>staticfog on <strong>1000 gecs</strong></span>
                  <span>${halfStars(5, 11)}</span>
                </div>
              </div>

              <div class="v2-card v2-disc v2-span2" onclick="navigate('wall')">
                <div class="v2-disc-thumbs">
                  <div class="v2-disc-thumb" style="background-image:url('images/album-punisher.png')"></div>
                  <div class="v2-disc-thumb" style="background-image:url('images/album-crystalcastles1.png')"></div>
                  <div class="v2-disc-thumb" style="background:linear-gradient(135deg,#052e16,#86efac)"></div>
                  <div class="v2-disc-thumb" style="background:linear-gradient(135deg,#1a0533,#7e22ce)"></div>
                </div>
                <div class="v2-disc-text">
                  <div class="v2-disc-label">Popular Albums</div>
                  <div class="v2-disc-sub">89k logged this month</div>
                </div>
                <div class="v2-disc-arr">›</div>
              </div>

            </div>
          </div>
        </div>`
      },

      // ── 3f. Bento Hero v3.0 ─────────────────────────────────
      {
        label: 'Bento Hero', version: 'v3.0',
        thumb: ['accent','w60','w80','w60','w80'],
        html: `
        <div class="app-screen s-home-v3">

          <!-- Scrollable body: bento + feed scroll together -->
          <div class="v3-body">

          <!-- BENTO: all children absolutely positioned in 690×670 SVG coordinate space -->
          <div class="v3-bento">

            <!-- Background fill: paints album color inside the bento frame shape.
                 Two silhouettes (right/left hand) — CSS shows one via .s-home-v3--left -->
            <svg class="v3-bg-fill" viewBox="0 0 689 638" xmlns="http://www.w3.org/2000/svg">
              <path class="bg-right" fill="currentColor" d="M518.5 0.5H20.5C9.4543 0.5 0.5 9.4543 0.5 20.5V617.5C0.5 628.546 9.4543 637.5 20.5 637.5H518.5C529.546 637.5 538.5 628.546 538.5 617.5V609C538.5 570.34 569.84 539 608.5 539H668.5C679.546 539 688.5 530.046 688.5 519V107.5C688.5 96.4543 679.546 87.5 668.5 87.5H558.5C547.454 87.5 538.5 78.5457 538.5 67.5V20.5C538.5 9.45431 529.546 0.5 518.5 0.5Z"/>
              <path class="bg-left" fill="currentColor" d="M170.5 0.5H668.5C679.546 0.5 688.5 9.4543 688.5 20.5V617.5C688.5 628.546 679.546 637.5 668.5 637.5H170.5C159.454 637.5 150.5 628.546 150.5 617.5V609C150.5 570.34 119.16 539 80.5 539H20.5C9.45428 539 0.5 530.046 0.5 519V107.5C0.5 96.4543 9.45428 87.5 20.5 87.5H130.5C141.546 87.5 150.5 78.5457 150.5 67.5V20.5C150.5 9.45431 159.454 0.5 170.5 0.5Z"/>
            </svg>

            <!-- Master SVG frame — viewBox matches bento aspect-ratio exactly -->
            <svg class="v3-master-frame" viewBox="0 0 689 638" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M518 0.5H21C9.9543 0.5 1 9.4543 1 20.5V534.5H518C529.046 534.5 538 525.546 538 514.5V451.927V73.4325V20.5C538 9.45431 529.046 0.5 518 0.5Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <path d="M518.5 0.5H20.5C9.4543 0.5 0.5 9.4543 0.5 20.5V617.5C0.5 628.546 9.4543 637.5 20.5 637.5H518.5C529.546 637.5 538.5 628.546 538.5 617.5V609C538.5 570.34 569.84 539 608.5 539H668.5C679.546 539 688.5 530.046 688.5 519V107.5C688.5 96.4543 679.546 87.5 668.5 87.5H558.5C547.454 87.5 538.5 78.5457 538.5 67.5V20.5C538.5 9.45431 529.546 0.5 518.5 0.5Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <path d="M654.409 517H571.806C563.403 517 556.64 510.098 556.81 501.697L558.617 412.351C558.703 408.077 560.609 404.044 563.855 401.263L654.756 323.394C661.282 317.804 671.354 322.504 671.261 331.097L669.408 502.162C669.319 510.383 662.63 517 654.409 517Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <path d="M664.035 291.857L569.72 373.062C564.534 377.527 556.5 373.843 556.5 367V123C556.5 114.716 563.216 108 571.5 108H654.247C662.532 108 669.247 114.716 669.247 123V280.49C669.247 284.857 667.344 289.007 664.035 291.857Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <circle cx="615.5" cy="614" r="55" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <path d="M557 35.5V30.5C557 13.9315 570.431 0.5 587 0.5H659C675.569 0.5 689 13.9315 689 30.5V35.5C689 52.0685 675.569 65.5 659 65.5H587C570.431 65.5 557 52.0685 557 35.5Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
            </svg>

            <!-- Album art: SVG x=1–538, y=0.5–534.5 → left 0.14% top 0.07% w 77.83% h 79.70% -->
            <div class="v3-album" onclick="onAlbumArt(this)"
                 style="background-image:url('images/album-crystalcastles1.png')"></div>

            <!-- Stats strip: expanded to top 77% h 22.92% to fit album/artist name -->
            <div class="v3-blue" onclick="event.stopPropagation(); enterReview(this.closest('.s-home-v3'))">
              <div class="v3-blue-info-row">
                <span class="v3-blue-title"><span class="v3-blue-album" onclick="event.stopPropagation(); onAlbumTitle(this)"></span><span class="v3-blue-date v3-blue-date--fs"></span></span>
                <span class="v3-blue-sep">·</span>
                <span class="v3-blue-artist"></span>
                <span class="v3-blue-date v3-blue-date--inline"></span>
              </div>
              <div class="v3-blue-stars-row">
                <span class="v3-blue-score">4.4</span>
                ${halfStars(4.4, 16)}
                <span class="v3-blue-count">19,284 reviews</span>
              </div>
              <div class="v3-blue-quote"><span class="v3-blue-quote-text"></span></div>
            </div>

            <!-- ForYou: single panel, cycles through trending albums on click -->
            <div class="v3-for-single"></div>

            <!-- CD: SVG cx=615.5 cy=614 r=55 → left 81.23% top 83.43% w 15.94% h 16.42% -->
            <div class="v3-cd"
                 style="background-image:url('images/album-crystalcastles1.png')"
                 title="Play / pause preview"
                 onclick="togglePreview(event)">
              <div class="v3-cd-hole"></div>
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
              <span class="v3-live-content"><span class="v3-live-dot"></span><span class="v3-live-label">Live</span></span>
              <span class="v3-back-content"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>Back</span>
            </button>

          </div>

          <!-- SCROLL: app name + friends feed -->
          <div class="v3-scroll-area">

            <div class="v3-feed-hd">
              <span class="v3-feed-title">Friend Activity</span>
              <button class="v3-feed-seeall" onclick="navigate('feed')">See all ›</button>
            </div>

            <div class="v3-feed-items"></div>

          </div><!-- /v3-scroll-area -->

          <!-- REVIEW PANEL: replaces the feed when the stats box is tapped.
               stopPropagation keeps clicks from bubbling to the viewer's variant-switch wrapper -->
          <div class="v3-review-panel" onclick="event.stopPropagation()" onmousedown="event.stopPropagation()">

            <!-- Friend rec tag — shown only when a friend has activity on this album (else algo-served: no tag) -->
            <div class="v3-rev-rec" hidden>
              <span class="v3-rev-rec-av"></span>
              <span class="v3-rev-rec-txt"><b class="v3-rev-rec-name"></b> listened to this</span>
            </div>

            <!-- Top row: streaming links (centered under CD) + your review (aligned to stats text).
                 Uses the bento's 78/22 split so it mirrors with the hand layout. -->
            <div class="v3-rev-top">

              <!-- Action grid — 2×3: streaming (left col) · save/fav/shop (right col) -->
              <div class="v3-rev-actions">
                <a class="v3-rev-btn v3-rev-btn--spotify" title="Spotify" onclick="event.stopPropagation()">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.72 13.5 1.56.36.24.54.84.24 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/></svg>
                </a>
                <a class="v3-rev-btn v3-rev-btn--apple" title="Apple Music" onclick="event.stopPropagation()">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-2.7 2.2-4 2.3-4.06-1.25-1.83-3.2-2.08-3.9-2.11-1.66-.17-3.24.97-4.08.97-.84 0-2.14-.95-3.52-.92-1.81.03-3.48 1.05-4.41 2.67-1.88 3.27-.48 8.1 1.35 10.76.9 1.3 1.97 2.76 3.38 2.71 1.36-.05 1.87-.88 3.51-.88 1.64 0 2.1.88 3.53.85 1.46-.03 2.38-1.33 3.27-2.63 1.03-1.51 1.46-2.97 1.48-3.05-.03-.01-2.84-1.09-2.87-4.32zM14.53 4.37c.74-.9 1.24-2.15 1.1-3.4-1.07.04-2.36.71-3.13 1.61-.69.8-1.29 2.07-1.13 3.29 1.19.09 2.42-.6 3.16-1.5z"/></svg>
                </a>
                <a class="v3-rev-btn v3-rev-btn--yt" title="YouTube Music" onclick="event.stopPropagation()">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 14V8l6 4-6 4z"/></svg>
                </a>
              </div>

              <!-- Your rating + written review + submit — aligned to the stats text -->
              <div class="v3-rev-mine">
                <button class="v3-rev-cta" onclick="event.stopPropagation(); openLogSheet(this);">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                  <span>Review, rate, log</span>
                </button>
              </div>

            </div><!-- /v3-rev-top -->

            <!-- Review-spread histogram — distribution of ratings across ½→5 vinyls -->
            <div class="v3-rev-hist">
              <div class="v3-rev-hist-hd">Ratings <span class="v3-rev-hist-sub"></span></div>
              <div class="v3-rev-hist-bars"></div>
              <div class="v3-rev-hist-axis"><span>½</span><span>5</span></div>
            </div>

            <!-- Tracklist — rate individual songs; scrolls after ~8 rows, 9th fades to hint more -->
            <div class="v3-rev-songs"></div>

            <!-- Photos / media — small horizontal strip; right edge fades to hint you can swipe -->
            <div class="v3-rev-media"></div>

            <!-- Other users' reviews — full width -->
            <div class="v3-rev-filters">
              <button class="v3-rev-filter active" data-f="friends" onclick="setReviewFilter(this)">Friends</button>
              <button class="v3-rev-filter" data-f="popular" onclick="setReviewFilter(this)">Popular</button>
              <button class="v3-rev-filter" data-f="new" onclick="setReviewFilter(this)">New</button>
              <span class="v3-rev-count"></span>
            </div>

            <div class="v3-rev-list"></div>

          </div><!-- /v3-review-panel -->
          </div><!-- /v3-body -->

          <!-- BOTTOM NAV — filleted shelf: logo · Home · Trending · Playlists · hand-toggle -->
          <nav class="v3-bottom-nav">
            <div class="v3-nav-shelf">
            <svg class="v3-nav-shape" viewBox="0 0 553 169" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.721208 168.043V0.0429077C-1.40921 24.7832 10.9472 74.2638 77.4163 74.2638C89.2853 74.2638 107.897 74.2638 131.21 74.2638C232.131 74.2638 421.145 74.2638 532.526 74.2638C543.572 74.2638 552.5 83.2181 552.5 94.2638V168.043H0.721208Z"/></svg>
            <div class="v3-nav-hi" aria-hidden="true"></div>
            <button class="v3-nav-logo" onclick="navigate('home')" title="Home"><img src="images/spindeck-logo.png" alt="Spindeck"/></button>
            <div class="v3-nav-items">
              <button class="v3-nav-item" onclick="navigate('wall')" title="Trending">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="2.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="16.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="2.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="16.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="2.5" y="16.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="16.5" width="5" height="5" rx="1.2"/><rect x="16.5" y="16.5" width="5" height="5" rx="1.2"/></svg>
              </button>
              <button class="v3-nav-item" onclick="navigate('playlists')" title="Playlists">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              </button>
              <button class="v3-nav-item" onclick="navigate('profile')" title="Profile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
            </div>
            </div><!-- /v3-nav-shelf -->
            <button class="v3-nav-toggle" onclick="toggleHand()" title="Flip left/right layout">
              <span class="v3-nav-switch"><span class="v3-nav-knob"></span></span>
            </button>
          </nav>

          <!-- Streaming service action sheet -->
          <div class="v3-stream-overlay"
               style="display:none"
               onclick="this.style.display='none'">
            <div class="v3-stream-sheet" onclick="event.stopPropagation()">
              <div class="v3-stream-handle"></div>
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

          <!-- Scrollable body: bento + feed scroll together -->
          <div class="v3-body">

          <!-- BENTO: all children absolutely positioned in 690×670 SVG coordinate space -->
          <div class="v3-bento">

            <!-- Background fill: paints album color inside the bento frame shape.
                 Two silhouettes (right/left hand) — CSS shows one via .s-home-v3--left -->
            <svg class="v3-bg-fill" viewBox="0 0 689 638" xmlns="http://www.w3.org/2000/svg">
              <path class="bg-right" fill="currentColor" d="M518.5 0.5H20.5C9.4543 0.5 0.5 9.4543 0.5 20.5V617.5C0.5 628.546 9.4543 637.5 20.5 637.5H518.5C529.546 637.5 538.5 628.546 538.5 617.5V609C538.5 570.34 569.84 539 608.5 539H668.5C679.546 539 688.5 530.046 688.5 519V107.5C688.5 96.4543 679.546 87.5 668.5 87.5H558.5C547.454 87.5 538.5 78.5457 538.5 67.5V20.5C538.5 9.45431 529.546 0.5 518.5 0.5Z"/>
              <path class="bg-left" fill="currentColor" d="M170.5 0.5H668.5C679.546 0.5 688.5 9.4543 688.5 20.5V617.5C688.5 628.546 679.546 637.5 668.5 637.5H170.5C159.454 637.5 150.5 628.546 150.5 617.5V609C150.5 570.34 119.16 539 80.5 539H20.5C9.45428 539 0.5 530.046 0.5 519V107.5C0.5 96.4543 9.45428 87.5 20.5 87.5H130.5C141.546 87.5 150.5 78.5457 150.5 67.5V20.5C150.5 9.45431 159.454 0.5 170.5 0.5Z"/>
            </svg>

            <!-- Master SVG frame — viewBox matches bento aspect-ratio exactly -->
            <svg class="v3-master-frame" viewBox="0 0 689 638" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M518 0.5H21C9.9543 0.5 1 9.4543 1 20.5V534.5H518C529.046 534.5 538 525.546 538 514.5V451.927V73.4325V20.5C538 9.45431 529.046 0.5 518 0.5Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <path d="M518.5 0.5H20.5C9.4543 0.5 0.5 9.4543 0.5 20.5V617.5C0.5 628.546 9.4543 637.5 20.5 637.5H518.5C529.546 637.5 538.5 628.546 538.5 617.5V609C538.5 570.34 569.84 539 608.5 539H668.5C679.546 539 688.5 530.046 688.5 519V107.5C688.5 96.4543 679.546 87.5 668.5 87.5H558.5C547.454 87.5 538.5 78.5457 538.5 67.5V20.5C538.5 9.45431 529.546 0.5 518.5 0.5Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <path d="M654.409 517H571.806C563.403 517 556.64 510.098 556.81 501.697L558.617 412.351C558.703 408.077 560.609 404.044 563.855 401.263L654.756 323.394C661.282 317.804 671.354 322.504 671.261 331.097L669.408 502.162C669.319 510.383 662.63 517 654.409 517Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <path d="M664.035 291.857L569.72 373.062C564.534 377.527 556.5 373.843 556.5 367V123C556.5 114.716 563.216 108 571.5 108H654.247C662.532 108 669.247 114.716 669.247 123V280.49C669.247 284.857 667.344 289.007 664.035 291.857Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <circle cx="615.5" cy="614" r="55" stroke="currentColor" vector-effect="non-scaling-stroke"/>
              <path d="M557 35.5V30.5C557 13.9315 570.431 0.5 587 0.5H659C675.569 0.5 689 13.9315 689 30.5V35.5C689 52.0685 675.569 65.5 659 65.5H587C570.431 65.5 557 52.0685 557 35.5Z" stroke="currentColor" vector-effect="non-scaling-stroke"/>
            </svg>

            <!-- Album art -->
            <div class="v3-album" onclick="onAlbumArt(this)"
                 style="background-image:url('images/album-crystalcastles1.png')"></div>

            <!-- Stats strip -->
            <div class="v3-blue" onclick="event.stopPropagation(); enterReview(this.closest('.s-home-v3'))">
              <div class="v3-blue-info-row">
                <span class="v3-blue-title"><span class="v3-blue-album" onclick="event.stopPropagation(); onAlbumTitle(this)"></span><span class="v3-blue-date v3-blue-date--fs"></span></span>
                <span class="v3-blue-sep">·</span>
                <span class="v3-blue-artist"></span>
                <span class="v3-blue-date v3-blue-date--inline"></span>
              </div>
              <div class="v3-blue-stars-row">
                <span class="v3-blue-score">4.4</span>
                ${halfStars(4.4, 16)}
                <span class="v3-blue-count">19,284 reviews</span>
              </div>
              <div class="v3-blue-quote"><span class="v3-blue-quote-text"></span></div>
            </div>

            <!-- ForYou: single panel, cycles through trending albums on click -->
            <div class="v3-for-single"></div>

            <!-- CD -->
            <div class="v3-cd"
                 style="background-image:url('images/album-crystalcastles1.png')"
                 title="Play / pause preview"
                 onclick="togglePreview(event)">
              <div class="v3-cd-hole"></div>
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
              <span class="v3-live-content"><span class="v3-live-dot"></span><span class="v3-live-label">Live</span></span>
              <span class="v3-back-content"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>Back</span>
            </button>

          </div>

          <!-- SCROLL: app name + friends feed -->
          <div class="v3-scroll-area">

            <div class="v3-feed-hd">
              <span class="v3-feed-title">Friend Activity</span>
              <button class="v3-feed-seeall" onclick="navigate('feed')">See all ›</button>
            </div>

            <div class="v3-feed-items"></div>

          </div><!-- /v3-scroll-area -->

          <!-- REVIEW PANEL: replaces the feed when the stats box is tapped.
               stopPropagation keeps clicks from bubbling to the viewer's variant-switch wrapper -->
          <div class="v3-review-panel" onclick="event.stopPropagation()" onmousedown="event.stopPropagation()">

            <!-- Friend rec tag — shown only when a friend has activity on this album (else algo-served: no tag) -->
            <div class="v3-rev-rec" hidden>
              <span class="v3-rev-rec-av"></span>
              <span class="v3-rev-rec-txt"><b class="v3-rev-rec-name"></b> listened to this</span>
            </div>

            <!-- Top row: streaming links (centered under CD) + your review (aligned to stats text).
                 Uses the bento's 78/22 split so it mirrors with the hand layout. -->
            <div class="v3-rev-top">

              <!-- Action grid — 2×3: streaming (left col) · save/fav/shop (right col) -->
              <div class="v3-rev-actions">
                <a class="v3-rev-btn v3-rev-btn--spotify" title="Spotify" onclick="event.stopPropagation()">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.72 13.5 1.56.36.24.54.84.24 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/></svg>
                </a>
                <a class="v3-rev-btn v3-rev-btn--apple" title="Apple Music" onclick="event.stopPropagation()">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-2.7 2.2-4 2.3-4.06-1.25-1.83-3.2-2.08-3.9-2.11-1.66-.17-3.24.97-4.08.97-.84 0-2.14-.95-3.52-.92-1.81.03-3.48 1.05-4.41 2.67-1.88 3.27-.48 8.1 1.35 10.76.9 1.3 1.97 2.76 3.38 2.71 1.36-.05 1.87-.88 3.51-.88 1.64 0 2.1.88 3.53.85 1.46-.03 2.38-1.33 3.27-2.63 1.03-1.51 1.46-2.97 1.48-3.05-.03-.01-2.84-1.09-2.87-4.32zM14.53 4.37c.74-.9 1.24-2.15 1.1-3.4-1.07.04-2.36.71-3.13 1.61-.69.8-1.29 2.07-1.13 3.29 1.19.09 2.42-.6 3.16-1.5z"/></svg>
                </a>
                <a class="v3-rev-btn v3-rev-btn--yt" title="YouTube Music" onclick="event.stopPropagation()">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 14V8l6 4-6 4z"/></svg>
                </a>
              </div>

              <!-- Your rating + written review + submit — aligned to the stats text -->
              <div class="v3-rev-mine">
                <button class="v3-rev-cta" onclick="event.stopPropagation(); openLogSheet(this);">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                  <span>Review, rate, log</span>
                </button>
              </div>

            </div><!-- /v3-rev-top -->

            <!-- Review-spread histogram — distribution of ratings across ½→5 vinyls -->
            <div class="v3-rev-hist">
              <div class="v3-rev-hist-hd">Ratings <span class="v3-rev-hist-sub"></span></div>
              <div class="v3-rev-hist-bars"></div>
              <div class="v3-rev-hist-axis"><span>½</span><span>5</span></div>
            </div>

            <!-- Tracklist — rate individual songs; scrolls after ~8 rows, 9th fades to hint more -->
            <div class="v3-rev-songs"></div>

            <!-- Photos / media — small horizontal strip; right edge fades to hint you can swipe -->
            <div class="v3-rev-media"></div>

            <!-- Other users' reviews — full width -->
            <div class="v3-rev-filters">
              <button class="v3-rev-filter active" data-f="friends" onclick="setReviewFilter(this)">Friends</button>
              <button class="v3-rev-filter" data-f="popular" onclick="setReviewFilter(this)">Popular</button>
              <button class="v3-rev-filter" data-f="new" onclick="setReviewFilter(this)">New</button>
              <span class="v3-rev-count"></span>
            </div>

            <div class="v3-rev-list"></div>

          </div><!-- /v3-review-panel -->
          </div><!-- /v3-body -->

          <!-- BOTTOM NAV — filleted shelf: logo · Home · Trending · Playlists · hand-toggle -->
          <nav class="v3-bottom-nav">
            <div class="v3-nav-shelf">
            <svg class="v3-nav-shape" viewBox="0 0 553 169" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.721208 168.043V0.0429077C-1.40921 24.7832 10.9472 74.2638 77.4163 74.2638C89.2853 74.2638 107.897 74.2638 131.21 74.2638C232.131 74.2638 421.145 74.2638 532.526 74.2638C543.572 74.2638 552.5 83.2181 552.5 94.2638V168.043H0.721208Z"/></svg>
            <div class="v3-nav-hi" aria-hidden="true"></div>
            <button class="v3-nav-logo" onclick="navigate('home')" title="Home"><img src="images/spindeck-logo.png" alt="Spindeck"/></button>
            <div class="v3-nav-items">
              <button class="v3-nav-item" onclick="navigate('wall')" title="Trending">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="2.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="16.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="2.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="16.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="2.5" y="16.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="16.5" width="5" height="5" rx="1.2"/><rect x="16.5" y="16.5" width="5" height="5" rx="1.2"/></svg>
              </button>
              <button class="v3-nav-item" onclick="navigate('playlists')" title="Playlists">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              </button>
              <button class="v3-nav-item" onclick="navigate('profile')" title="Profile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
            </div>
            </div><!-- /v3-nav-shelf -->
            <button class="v3-nav-toggle" onclick="toggleHand()" title="Flip left/right layout">
              <span class="v3-nav-switch"><span class="v3-nav-knob"></span></span>
            </button>
          </nav>

          <!-- Streaming sheet -->
          <div class="v3-stream-overlay" style="display:none" onclick="this.style.display='none'">
            <div class="v3-stream-sheet" onclick="event.stopPropagation()">
              <div class="v3-stream-handle"></div>
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
              <button class="v3-stream-cancel" onclick="this.closest('.v3-stream-overlay').style.display='none'">Cancel</button>
            </div>
          </div>

        </div>`
      }

    ]
  },

  // ── 4. LIVE FEED (TikTok-style) ─────────────────────────────
  {
    id: 'feed', name: 'Live Feed', statusTheme: 'light',
    variants: [
      {
        label: 'Albums', version: 'v1.0',
        thumb: ['accent','w80','accent','w60','w80'],
        get html() {
          const items = (window.ARCHIVE || []).slice(0, 8);
          return `
        <div class="app-screen s-livefeed">
          ${topNav('feed')}
          <div class="lfeed-toggle">
            <button class="lft-btn active">Albums</button>
            <button class="lft-btn">Songs</button>
          </div>
          <div class="lfeed-scroll">
            ${items.map((a, i) => `
            <div class="lfeed-card">
              <div class="lfeed-bg" style="background-image:url('${a.image}')"></div>
              <div class="lfeed-overlay"></div>
              <div class="lfeed-content">
                <div class="lfeed-art-wrap">
                  <div class="lfeed-art" style="background-image:url('${a.image}')"></div>
                </div>
                <div class="lfeed-meta">
                  <div class="lfeed-artist">${a.artist.toUpperCase()}</div>
                  <div class="lfeed-title">${a.album}</div>
                  <div class="lfeed-genre">${a.year} · ${a.genre}</div>
                </div>
                <div class="lfeed-rating">
                  <span class="lfeed-score">${a.rating.toFixed(1)}</span>
                  <span class="lfeed-score-sub">/ 5</span>
                  ${halfStars(a.rating, 13)}
                </div>
                <div class="lfeed-rc"><strong>${window.fmtRc ? window.fmtRc(a.reviewCount) : a.reviewCount}</strong> reviews</div>
                <div class="lfeed-today">↑ ${Math.max(18, Math.round(a.reviewCount * 0.003))} reviewed today</div>
                <div class="lfeed-actions">
                  <button class="lfeed-skip" onclick="navigate('home')">Skip</button>
                  <button class="lfeed-log" onclick="openAlbum(ARCHIVE.find(x=>x.album==='${a.album.replace(/'/g,"\\'")}')||ARCHIVE[0]);navigate('review')">Log Album ↗</button>
                </div>
                <div class="lfeed-hint">${i < items.length - 1 ? '↑ &nbsp; scroll for next' : '&nbsp;'}</div>
              </div>
            </div>`).join('')}
          </div>
        </div>`;
        }
      },
      {
        label: 'Songs', version: 'v1.1',
        thumb: ['w80','accent','w60','accent','w70'],
        html: `
        <div class="app-screen s-livefeed">
          ${topNav('feed')}

          <div class="lfeed-toggle">
            <button class="lft-btn">Albums</button>
            <button class="lft-btn active">Songs</button>
          </div>

          <div class="lfeed-scroll">

            <!-- Song Card 1: Garden Song -->
            <div class="lfeed-card">
              <div class="lfeed-bg" style="background-image:url('images/album-punisher.png')"></div>
              <div class="lfeed-overlay"></div>
              <div class="lfeed-content">
                <div class="lfeed-art-wrap">
                  <div class="lfeed-art" style="background-image:url('images/album-punisher.png')"></div>
                </div>
                <div class="lfeed-meta">
                  <div class="lfeed-artist">PHOEBE BRIDGERS · Punisher</div>
                  <div class="lfeed-title">Garden Song</div>
                  <div class="lfeed-genre">Track 1 · 3:58 · Indie Folk</div>
                </div>
                <div class="lfeed-rating">
                  <span class="lfeed-score">4.9</span>
                  <span class="lfeed-score-sub">/ 5</span>
                  ${halfStars(5, 13)}
                </div>
                <div class="lfeed-rc"><strong>48,200</strong> reviews</div>
                <div class="lfeed-today">↑ 312 reviewed today</div>
                <div class="lfeed-actions">
                  <button class="lfeed-skip" onclick="navigate('home')">Skip</button>
                  <button class="lfeed-log" onclick="navigate('review')">Log Track ↗</button>
                </div>
                <div class="lfeed-hint">↑ &nbsp; scroll for next</div>
              </div>
            </div>

            <!-- Song Card 2: Crimewave -->
            <div class="lfeed-card">
              <div class="lfeed-bg" style="background-image:url('images/album-crystalcastles1.png')"></div>
              <div class="lfeed-overlay"></div>
              <div class="lfeed-content">
                <div class="lfeed-art-wrap">
                  <div class="lfeed-art" style="background-image:url('images/album-crystalcastles1.png')"></div>
                </div>
                <div class="lfeed-meta">
                  <div class="lfeed-artist">CRYSTAL CASTLES · Crystal Castles</div>
                  <div class="lfeed-title">Crimewave</div>
                  <div class="lfeed-genre">Track 3 · 3:28 · Electronic</div>
                </div>
                <div class="lfeed-rating">
                  <span class="lfeed-score">4.8</span>
                  <span class="lfeed-score-sub">/ 5</span>
                  ${halfStars(5, 13)}
                </div>
                <div class="lfeed-rc"><strong>22,841</strong> reviews</div>
                <div class="lfeed-today">↑ 94 reviewed today</div>
                <div class="lfeed-actions">
                  <button class="lfeed-skip" onclick="navigate('home')">Skip</button>
                  <button class="lfeed-log" onclick="navigate('review')">Log Track ↗</button>
                </div>
                <div class="lfeed-hint">↑ &nbsp; scroll for next</div>
              </div>
            </div>

          </div>
        </div>`
      }
    ]
  },

  // ── 5. WALL OF ALBUMS ───────────────────────────────────────
  {
    id: 'wall', name: 'Album Wall', statusTheme: 'light',
    variants: [{
      label: 'v1',
      thumb: ['w80','w80','w80','w80','w80'],
      get html() {
        const items = (window.ARCHIVE || []).slice().sort((a,b) => b.rating - a.rating);
        return `
      <div class="app-screen s-wall">
        <div class="wall-header">
          <button class="app-nav-btn" onclick="navigate('home')" style="margin-right:8px"><span class="app-nav-back">‹</span></button>
          <div class="wall-title">Albums</div>
        </div>
        <div class="wall-cats-wrap">
          <button class="wall-cat active">Popular</button>
          <button class="wall-cat">New Releases</button>
          <button class="wall-cat">Top Reviewed</button>
          <button class="wall-cat">Your Taste</button>
          <button class="wall-cat">Electronic</button>
          <button class="wall-cat">Indie</button>
          <button class="wall-cat">Hip-Hop</button>
          <button class="wall-cat">J / K</button>
        </div>
        <div class="wall-grid">
          ${items.slice(0,20).map((a,i) => `
          <div class="wall-cell" onclick="openAlbum(ARCHIVE.find(x=>x.album==='${a.album.replace(/'/g,'\\\'')}')||ARCHIVE[0])">
            <div class="wall-cell-art" style="background-image:url('${a.image}')"></div>
            <div class="wall-cell-info">
              <div class="wall-cell-rating">★${a.rating.toFixed(1)}</div>
              <div class="wall-cell-name">${a.album.length > 13 ? a.album.slice(0,12)+'…' : a.album}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>`;
      }
    }]
  },

  // ── 6. SEARCH ───────────────────────────────────────────────
  {
    id: 'search', name: 'Search', statusTheme: 'light',
    variants: [{
      label: 'v1',
      thumb: ['accent','w80','w50','w70','w40'],
      html: `
      <div class="app-screen s-search">
        <div class="search-bar-wrap">
          <div class="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
            <input type="text" placeholder="Albums, artists, songs, reviews…">
          </div>
        </div>
        <div class="search-body">
          <div class="section-title">Browse Genres</div>
          <div class="genre-grid">
            <div class="genre-card" style="background:linear-gradient(135deg,#1a1a3e,#4c1d95)">Electronic</div>
            <div class="genre-card" style="background:linear-gradient(135deg,#1b2e05,#15803d)">Indie</div>
            <div class="genre-card" style="background:linear-gradient(135deg,#3b0000,#991b1b)">Rock</div>
            <div class="genre-card" style="background:linear-gradient(135deg,#0a1f3e,#1d4ed8)">Jazz</div>
            <div class="genre-card" style="background:linear-gradient(135deg,#2d0a2e,#9d174d)">R&amp;B / Soul</div>
            <div class="genre-card" style="background:linear-gradient(135deg,#1c1917,#78350f)">Hip-Hop</div>
          </div>
          <div class="section-title">Trending This Week</div>
          <div class="trending-list">
            <div class="trending-item" onclick="navigate('album')">
              <div class="trending-num">1</div>
              <div class="album-art trending-art" style="background-image:url('images/album-punisher.png');background-size:cover;background-position:center"></div>
              <div class="trending-info"><div class="trending-album">Punisher</div><div class="trending-artist">Phoebe Bridgers</div></div>
              <span style="font-size:11px;color:var(--text2);font-family:var(--font-mono)">4.7 ★</span>
            </div>
            <div class="trending-item" onclick="navigate('album')">
              <div class="trending-num">2</div>
              <div class="album-art trending-art" style="background-image:url('images/album-crystalcastles1.png');background-size:cover;background-position:center"></div>
              <div class="trending-info"><div class="trending-album">Crystal Castles</div><div class="trending-artist">Crystal Castles</div></div>
              <span style="font-size:11px;color:var(--text2);font-family:var(--font-mono)">4.4 ★</span>
            </div>
            <div class="trending-item" onclick="navigate('album')">
              <div class="trending-num">3</div>
              <div class="album-art trending-art" style="background:linear-gradient(135deg,#042a10,#6aff3a 130%)"></div>
              <div class="trending-info"><div class="trending-album">1000 gecs</div><div class="trending-artist">100 gecs</div></div>
              <span style="font-size:11px;color:var(--text2);font-family:var(--font-mono)">4.6 ★</span>
            </div>
          </div>
        </div>
      </div>`
    }]
  },

  // ── 7. ALBUM PAGE ───────────────────────────────────────────
  {
    id: 'album', name: 'Album Page', statusTheme: 'light',
    variants: [{
      label: 'v1',
      thumb: ['accent','w80','w60','w80','w80'],
      get html() {
        const a = window.activeAlbum || (window.ARCHIVE && window.ARCHIVE[0]) || {
          artist:'Phoebe Bridgers', album:'Punisher', year:2020, genre:'Indie Folk', tracks:10,
          image:'images/album-phoebebridgers-punisher.png', rating:4.7, reviewCount:31000,
          artistBio:'Phoebe Bridgers is an American singer-songwriter from Los Angeles.',
          reviews:[
            {init:'EP',grad:'linear-gradient(135deg,#1c1c3e,#3b1fa8)',name:'echoplex',rating:5,text:'funeral is the most heartbreaking song i\'ve heard in years.'},
            {init:'SF',grad:'linear-gradient(135deg,#164e63,#0284c7)',name:'staticfog',rating:5,text:'garden song alone deserves a 5/5. the whole album feels like a lucid dream'},
            {init:'VB',grad:'linear-gradient(135deg,#450a0a,#dc2626)',name:'velvetblast',rating:4,text:'savior complex on repeat for an hour. not sorry about it'},
          ]
        };
        const logged = window.fmtRc ? window.fmtRc(Math.round(a.reviewCount * 2.8)) : '—';
        const rc     = window.fmtRc ? window.fmtRc(a.reviewCount) : a.reviewCount;
        return `
      <div class="app-screen s-album">
        <div class="album-hero">
          <div class="album-art album-cover-full" style="height:220px;border-radius:0;background-image:url('${a.image}');background-size:cover;background-position:center"></div>
          <div class="album-hero-overlay"></div>
          <button class="album-back-btn" onclick="navigate('home')">‹</button>
        </div>
        <div class="album-info">
          <div class="album-title">${a.album}</div>
          <div class="album-artist" style="color:var(--accent)" onclick="navigate('artist')">${a.artist}</div>
          <div class="album-meta">${a.year} · ${a.genre}${a.tracks ? ' · ' + a.tracks + ' tracks' : ''}</div>
        </div>
        <div class="album-stats">
          <div class="album-stat">
            <div class="album-stat-val">${halfStars(a.rating, 13)}</div>
            <div class="album-stat-lbl">avg ${a.rating.toFixed(1)}</div>
          </div>
          <div class="album-stat"><div class="album-stat-val">—</div><div class="album-stat-lbl">your rating</div></div>
          <div class="album-stat"><div class="album-stat-val">${logged}</div><div class="album-stat-lbl">logged</div></div>
          <div class="album-stat"><div class="album-stat-val">${rc}</div><div class="album-stat-lbl">reviews</div></div>
        </div>
        <div class="album-actions">
          <button class="btn-primary" onclick="navigate('review')">Log / Review</button>
          <button class="btn-small">+ List</button>
          <button class="btn-small">♥</button>
        </div>
        ${a.artistBio ? `<div style="padding:4px 20px 0;font-size:11px;color:var(--text2);line-height:1.5">${a.artistBio}</div>` : ''}
        <div class="reviews-section">
          <div class="reviews-title">Popular Reviews</div>
          ${(a.reviews || []).map(rv => `
          <div class="mini-review">
            <div class="mr-header">
              <div class="avatar mr-avatar"><div class="avatar-placeholder" style="font-size:10px;background:${rv.grad}">${rv.init}</div></div>
              <div class="mr-username">${rv.name}</div>
              <div>${halfStars(rv.rating, 11)}</div>
            </div>
            <div class="mr-text">"${rv.text}"</div>
          </div>`).join('')}
        </div>
      </div>`;
      }
    }]
  },

  // ── 8. ARTIST PAGE ──────────────────────────────────────────
  {
    id: 'artist', name: 'Artist Page', statusTheme: 'light',
    variants: [{
      label: 'v1',
      thumb: ['accent','w70','w80','w50','w80'],
      html: `
      <div class="app-screen s-artist">
        <div class="artist-hero">
          <div class="artist-hero-img" style="background-image:url('images/artist-phoebe.jpg');background-size:cover;background-position:center top"></div>
          <div class="artist-hero-overlay"></div>
          <button class="album-back-btn" onclick="navigate('search')">‹</button>
          <div class="artist-hero-name">Phoebe Bridgers</div>
        </div>

        <div class="artist-meta">Indie Folk · American · 2014–present</div>

        <div class="artist-stats">
          <div class="album-stat">
            <div class="album-stat-val" style="display:flex;flex-direction:column;align-items:center;gap:3px">
              <span style="font-size:18px;font-weight:800;letter-spacing:-0.5px">2.8K</span>
              <div>${halfStars(4.5, 12)}</div>
            </div>
            <div class="album-stat-lbl">Reviews</div>
          </div>
          <div class="album-stat">
            <div class="album-stat-val" style="display:flex;flex-direction:column;align-items:center;gap:3px">
              <span style="font-size:18px;font-weight:800;letter-spacing:-0.5px">156K</span>
            </div>
            <div class="album-stat-lbl">Listeners</div>
          </div>
          <div class="album-stat">
            <div class="album-stat-val" style="font-size:18px;font-weight:800;letter-spacing:-0.5px">4.6</div>
            <div class="album-stat-lbl">Avg Rating</div>
          </div>
        </div>

        <div style="padding:0 20px">
          <div class="section-title" style="margin-top:16px;margin-bottom:12px">Top Albums</div>
          <div class="artist-albums-grid">
            <div class="artist-album-item" onclick="navigate('album')">
              <div class="album-art" style="width:100%;aspect-ratio:1;border-radius:8px;background-image:url('images/album-punisher.png');background-size:cover;background-position:center"></div>
              <div style="font-size:12px;font-weight:600;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Punisher</div>
              <div style="display:flex;align-items:center;gap:4px;margin-top:2px">${halfStars(4.5, 10)}<span style="font-size:9px;color:var(--text2);font-family:var(--font-mono)">(3.2k)</span></div>
            </div>
            <div class="artist-album-item" onclick="navigate('album')">
              <div class="album-art" style="width:100%;aspect-ratio:1;border-radius:8px;background:linear-gradient(135deg,#1e3a5f,#374151)"></div>
              <div style="font-size:12px;font-weight:600;margin-top:5px">Stranger in the Alps</div>
              <div style="display:flex;align-items:center;gap:4px;margin-top:2px">${halfStars(4.5, 10)}<span style="font-size:9px;color:var(--text2);font-family:var(--font-mono)">(1.8k)</span></div>
            </div>
            <div class="artist-album-item" onclick="navigate('album')">
              <div class="album-art" style="width:100%;aspect-ratio:1;border-radius:8px;background:linear-gradient(135deg,#1c1917,#44403c)"></div>
              <div style="font-size:12px;font-weight:600;margin-top:5px">boygenius EP</div>
              <div style="display:flex;align-items:center;gap:4px;margin-top:2px">${halfStars(4.5, 10)}<span style="font-size:9px;color:var(--text2);font-family:var(--font-mono)">(2.1k)</span></div>
            </div>
            <div class="artist-album-item" onclick="navigate('album')">
              <div class="album-art" style="width:100%;aspect-ratio:1;border-radius:8px;background:linear-gradient(135deg,#0f172a,#1e293b)"></div>
              <div style="font-size:12px;font-weight:600;margin-top:5px">the record</div>
              <div style="display:flex;align-items:center;gap:4px;margin-top:2px">${halfStars(4.5, 10)}<span style="font-size:9px;color:var(--text2);font-family:var(--font-mono)">(904)</span></div>
            </div>
          </div>
        </div>
      </div>`
    }]
  },

  // ── 9. SONG / TRACK ─────────────────────────────────────────
  {
    id: 'song', name: 'Song / Track', statusTheme: 'light',
    variants: [{
      label: 'v1',
      thumb: ['w80','accent','w60','w80','w70'],
      html: `
      <div class="app-screen s-song">
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
      </div>`
    }]
  },

  // ── 10. REVIEW PAGE ─────────────────────────────────────────
  {
    id: 'review', name: 'Review Page', statusTheme: 'light',
    variants: [{
      label: 'v1',
      thumb: ['w70','accent','w80','w60','accent'],
      html: `
      <div class="app-screen s-write">
        <div class="app-nav">
          <button class="app-nav-btn" onclick="navigate('album')"><span class="app-nav-back">✕</span></button>
          <div class="app-nav-title">Log This Album</div>
          <button class="app-nav-btn" style="color:var(--text2);font-size:14px">Post</button>
        </div>
        <div class="write-album-strip">
          <div class="album-art was-art" style="background-image:url('images/album-punisher.png');background-size:cover;background-position:center"></div>
          <div>
            <div class="was-name">Punisher</div>
            <div class="was-artist">Phoebe Bridgers · 2020</div>
          </div>
        </div>
        <div class="write-body">
          <div>
            <div class="write-section-label">YOUR RATING</div>
            <div class="star-picker">
              <span class="star-pick filled">★</span><span class="star-pick filled">★</span>
              <span class="star-pick filled">★</span><span class="star-pick">★</span>
              <span class="star-pick">★</span>
            </div>
            <div style="font-size:11px;color:var(--text3);margin-top:5px">half stars supported</div>
          </div>
          <div>
            <div class="write-section-label">WRITE A REVIEW <span style="font-weight:400;text-transform:none">(optional)</span></div>
            <div class="field">
              <textarea placeholder="Share your thoughts…" rows="5"></textarea>
              <div class="char-count">0 / 2000</div>
            </div>
          </div>
          <div>
            <div class="write-section-label">LISTENING CONTEXT</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn-small" style="border-radius:99px">First Listen</button>
              <button class="btn-small" style="border-radius:99px;border-color:var(--accent);color:var(--accent)">Deep Listen</button>
              <button class="btn-small" style="border-radius:99px">Revisit</button>
            </div>
          </div>
        </div>
        <div class="write-footer">
          <button class="btn-primary" onclick="navigate('album')">Log This Album</button>
        </div>
      </div>`
    }]
  },

  // ── 11. PROFILE ─────────────────────────────────────────────
  {
    id: 'profile', name: 'Profile', statusTheme: 'light',
    variants: [{
      label: 'v1',
      thumb: ['accent','w50','w80','w80','w70'],
      html: `
      <div class="app-screen s-profile">
        <div class="app-nav">
          <button class="app-nav-btn" onclick="navigate('home')"><span class="app-nav-back">‹</span></button>
          <div class="app-nav-title">Profile</div>
          <button class="app-nav-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
        </div>
        <div class="profile-header">
          <div class="avatar profile-avatar"><div class="avatar-placeholder" style="font-size:26px;font-weight:700">E</div></div>
          <div class="profile-meta">
            <div class="profile-username">ericd</div>
            <div class="profile-handle">@ericd</div>
            <div class="profile-bio">Every album tells a story.</div>
          </div>
        </div>
        <div class="profile-stats">
          <div class="pstat"><div class="pstat-val">284</div><div class="pstat-lbl">Reviews</div></div>
          <div class="pstat"><div class="pstat-val">1.2K</div><div class="pstat-lbl">Following</div></div>
          <div class="pstat"><div class="pstat-val">892</div><div class="pstat-lbl">Followers</div></div>
        </div>
        <div class="profile-tabs">
          <button class="ptab active">Reviews</button>
          <button class="ptab">Lists</button>
          <button class="ptab">Likes</button>
          <button class="ptab">Activity</button>
        </div>
        <div class="reviews-grid">
          <div class="rg-row">
            <div class="rg-item" onclick="navigate('album')"><div class="album-art rg-art" style="background-image:url('images/album-punisher.png');background-size:cover;background-position:center"></div><div class="rg-title">Punisher</div><div class="rg-rating">${halfStars(5, 10)}</div></div>
            <div class="rg-item" onclick="navigate('album')"><div class="album-art rg-art" style="background-image:url('images/album-crystalcastles1.png');background-size:cover;background-position:center"></div><div class="rg-title">CC I</div><div class="rg-rating">${halfStars(4, 10)}</div></div>
            <div class="rg-item" onclick="navigate('album')"><div class="album-art rg-art" style="background:linear-gradient(135deg,#042a10,#6aff3a 130%)"></div><div class="rg-title">1000 gecs</div><div class="rg-rating">${halfStars(5, 10)}</div></div>
          </div>
          <div class="rg-row">
            <div class="rg-item" onclick="navigate('album')"><div class="album-art rg-art" style="background:linear-gradient(135deg,#2a0044,#ff1a6e 200%)"></div><div class="rg-title">Leather Teeth</div><div class="rg-rating">${halfStars(5, 10)}</div></div>
            <div class="rg-item" onclick="navigate('album')"><div class="album-art rg-art" style="background:linear-gradient(135deg,#1e3a5f,#374151)"></div><div class="rg-title">Str. Alps</div><div class="rg-rating">${halfStars(4.5, 10)}</div></div>
            <div class="rg-item" onclick="navigate('album')"><div class="album-art rg-art" style="background:linear-gradient(135deg,#1c1c3e,#3b1fa8)"></div><div class="rg-title">CC II</div><div class="rg-rating">${halfStars(4, 10)}</div></div>
          </div>
        </div>
      </div>`
    }]
  },

  // ── 12. PLAYLISTS (Expanded, multi-variant) ─────────────────
  {
    id: 'playlists', name: 'Playlists', statusTheme: 'light',
    variants: [
      {
        label: 'My Lists', version: 'v1.0',
        thumb: ['w80','accent','w60','w80','w70'],
        html: `
        <div class="app-screen s-playlists">
          ${topNav('playlists')}
          <div class="home-header" style="padding:10px 16px 8px">
            <div class="home-logo" style="font-size:16px">My Library</div>
            <button class="icon-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
          </div>
          <div class="pl-exp-tabs">
            <button class="pl-exp-tab active">My Lists</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Artists</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Albums</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Songs</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Genres</button>
          </div>

          <!-- Trending review highlight -->
          <div style="padding:12px 16px 0">
            <div class="pl-trending-review" onclick="navigate('album')">
              <div class="pl-tr-badge">Trending Review · from your network</div>
              <div class="pl-tr-quote">"this album rewired my brain. nothing before or after sounds like it"</div>
              <div class="pl-tr-meta">
                <div class="pl-tr-av" style="background:linear-gradient(135deg,#164e63,#0284c7)">SF</div>
                <span class="pl-tr-by-text">staticfog on 1000 gecs &nbsp;${halfStars(5, 10)}</span>
              </div>
            </div>
          </div>

          <div class="feed" style="padding:8px 16px 16px;gap:10px">
            <div class="playlist-card">
              <div class="pl-art-stack">
                <div class="album-art" style="width:52px;height:52px;border-radius:6px;background:linear-gradient(135deg,#0f172a,#4338ca)"></div>
                <div class="album-art" style="width:52px;height:52px;border-radius:6px;background:linear-gradient(135deg,#1a1a4e,#4a0e8f)"></div>
                <div class="album-art" style="width:52px;height:52px;border-radius:6px;background:linear-gradient(135deg,#1b4332,#40916c)"></div>
              </div>
              <div class="pl-info"><div class="pl-name">Desert Island Picks</div><div class="pl-meta">12 albums · Updated 2d ago</div></div>
            </div>
            <div class="playlist-card">
              <div class="pl-art-stack">
                <div class="album-art" style="width:52px;height:52px;border-radius:6px;background:linear-gradient(135deg,#3b0000,#991b1b)"></div>
                <div class="album-art" style="width:52px;height:52px;border-radius:6px;background:linear-gradient(135deg,#0f172a,#7c3aed)"></div>
              </div>
              <div class="pl-info"><div class="pl-name">Late Night Drives</div><div class="pl-meta">8 albums · Updated 1w ago</div></div>
            </div>
            <div class="playlist-card">
              <div class="pl-art-stack">
                <div class="album-art" style="width:52px;height:52px;border-radius:6px;background:linear-gradient(135deg,#1e3a5f,#0ea5e9)"></div>
              </div>
              <div class="pl-info"><div class="pl-name">Jazz Essentials</div><div class="pl-meta">5 albums · Updated 3w ago</div></div>
            </div>
          </div>
        </div>`
      },
      {
        label: 'Artists', version: 'v1.1',
        thumb: ['accent','w70','w80','w60','w80'],
        html: `
        <div class="app-screen s-playlists">
          ${topNav('playlists')}
          <div class="home-header" style="padding:10px 16px 8px">
            <div class="home-logo" style="font-size:16px">My Library</div>
          </div>
          <div class="pl-exp-tabs">
            <button class="pl-exp-tab" onclick="navigate('playlists')">My Lists</button>
            <button class="pl-exp-tab active">Artists</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Albums</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Songs</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Genres</button>
          </div>
          <div style="flex:1;overflow-y:auto;padding:0 16px;scrollbar-width:none">
            <div class="pl-artist-row" onclick="navigate('artist')">
              <div class="pla-art" style="background-image:url('images/artist-phoebe.jpg')"></div>
              <div class="pla-info">
                <div class="pla-name">Phoebe Bridgers</div>
                <div class="pla-genre">Indie Folk · American</div>
                <div class="pla-star-row">${halfStars(4.5, 13)}<span class="pla-rc">(2,847 reviews)</span></div>
              </div>
            </div>
            <div class="pl-artist-row" onclick="navigate('artist')">
              <div class="pla-art" style="background-image:url('images/artist-crystalcastles.jpg')"></div>
              <div class="pla-info">
                <div class="pla-name">Crystal Castles</div>
                <div class="pla-genre">Electronic · Canadian</div>
                <div class="pla-star-row">${halfStars(4.5, 13)}<span class="pla-rc">(1,892 reviews)</span></div>
              </div>
            </div>
            <div class="pl-artist-row" onclick="navigate('artist')">
              <div class="pla-art" style="background-image:url('images/artist-100gecs.jpg')"></div>
              <div class="pla-info">
                <div class="pla-name">100 gecs</div>
                <div class="pla-genre">Hyperpop · American</div>
                <div class="pla-star-row">${halfStars(4.5, 13)}<span class="pla-rc">(5,014 reviews)</span></div>
              </div>
            </div>
            <div class="pl-artist-row" onclick="navigate('artist')">
              <div class="pla-art" style="background-image:url('images/artist-carpenterbrut.jpg')"></div>
              <div class="pla-info">
                <div class="pla-name">Carpenter Brut</div>
                <div class="pla-genre">Darksynth · French</div>
                <div class="pla-star-row">${halfStars(4, 13)}<span class="pla-rc">(981 reviews)</span></div>
              </div>
            </div>
            <div class="pl-artist-row" onclick="navigate('artist')">
              <div class="pla-art" style="background:linear-gradient(135deg,#1a1a3e,#4c1d95)"></div>
              <div class="pla-info">
                <div class="pla-name">Burial</div>
                <div class="pla-genre">UK Garage / Ambient · UK</div>
                <div class="pla-star-row">${halfStars(5, 13)}<span class="pla-rc">(3,221 reviews)</span></div>
              </div>
            </div>
          </div>
        </div>`
      },
      {
        label: 'Albums', version: 'v1.2',
        thumb: ['w70','accent','w80','accent','w60'],
        html: `
        <div class="app-screen s-playlists">
          ${topNav('playlists')}
          <div class="home-header" style="padding:10px 16px 8px">
            <div class="home-logo" style="font-size:16px">My Library</div>
          </div>
          <div class="pl-exp-tabs">
            <button class="pl-exp-tab" onclick="navigate('playlists')">My Lists</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Artists</button>
            <button class="pl-exp-tab active">Albums</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Songs</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Genres</button>
          </div>
          <div style="flex:1;overflow-y:auto;padding:8px 16px 16px;scrollbar-width:none">
            <div class="pl-album-grid">
              <div class="pl-album-item" onclick="navigate('album')">
                <div class="pl-album-art" style="background-image:url('images/album-punisher.png')"></div>
                <div class="pl-album-title">Punisher</div>
                <div class="pl-album-rc">3.2k reviews · ${halfStars(4.5, 9)}</div>
              </div>
              <div class="pl-album-item" onclick="navigate('album')">
                <div class="pl-album-art" style="background-image:url('images/album-crystalcastles1.png')"></div>
                <div class="pl-album-title">Crystal Castles</div>
                <div class="pl-album-rc">1.9k reviews · ${halfStars(4.5, 9)}</div>
              </div>
              <div class="pl-album-item" onclick="navigate('album')">
                <div class="pl-album-art" style="background:linear-gradient(135deg,#042a10,#6aff3a 130%)"></div>
                <div class="pl-album-title">1000 gecs</div>
                <div class="pl-album-rc">5.0k reviews · ${halfStars(4.5, 9)}</div>
              </div>
              <div class="pl-album-item" onclick="navigate('album')">
                <div class="pl-album-art" style="background:linear-gradient(135deg,#2a0044,#ff1a6e 200%)"></div>
                <div class="pl-album-title">Leather Teeth</div>
                <div class="pl-album-rc">981 reviews · ${halfStars(4, 9)}</div>
              </div>
              <div class="pl-album-item" onclick="navigate('album')">
                <div class="pl-album-art" style="background:linear-gradient(135deg,#1e3a5f,#374151)"></div>
                <div class="pl-album-title">Stranger Alps</div>
                <div class="pl-album-rc">1.8k reviews · ${halfStars(4.5, 9)}</div>
              </div>
              <div class="pl-album-item" onclick="navigate('album')">
                <div class="pl-album-art" style="background:linear-gradient(135deg,#1a1a3e,#4c1d95)"></div>
                <div class="pl-album-title">Untrue</div>
                <div class="pl-album-rc">3.2k reviews · ${halfStars(5, 9)}</div>
              </div>
            </div>
          </div>
        </div>`
      },
      {
        label: 'Songs', version: 'v1.3',
        thumb: ['w60','w80','accent','w70','w80'],
        html: `
        <div class="app-screen s-playlists">
          ${topNav('playlists')}
          <div class="home-header" style="padding:10px 16px 8px">
            <div class="home-logo" style="font-size:16px">My Library</div>
          </div>
          <div class="pl-exp-tabs">
            <button class="pl-exp-tab" onclick="navigate('playlists')">My Lists</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Artists</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Albums</button>
            <button class="pl-exp-tab active">Songs</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Genres</button>
          </div>
          <div style="flex:1;overflow-y:auto;padding:0 16px;scrollbar-width:none">
            <div class="pl-song-row" onclick="navigate('song')">
              <div class="pls-num">1</div>
              <div class="pls-art" style="background-image:url('images/album-punisher.png')"></div>
              <div class="pls-info"><div class="pls-title">Garden Song</div><div class="pls-artist">Phoebe Bridgers</div></div>
              <div class="pls-right"><div class="pls-dur">3:58</div><div class="pls-rating">4.9 ★</div></div>
            </div>
            <div class="pl-song-row" onclick="navigate('song')">
              <div class="pls-num">2</div>
              <div class="pls-art" style="background-image:url('images/album-crystalcastles1.png')"></div>
              <div class="pls-info"><div class="pls-title">Crimewave</div><div class="pls-artist">Crystal Castles</div></div>
              <div class="pls-right"><div class="pls-dur">3:28</div><div class="pls-rating">4.8 ★</div></div>
            </div>
            <div class="pl-song-row" onclick="navigate('song')">
              <div class="pls-num">3</div>
              <div class="pls-art" style="background:linear-gradient(135deg,#042a10,#6aff3a 130%)"></div>
              <div class="pls-info"><div class="pls-title">xXXi_wud_nvrstøp_ÿ (1)</div><div class="pls-artist">100 gecs</div></div>
              <div class="pls-right"><div class="pls-dur">2:04</div><div class="pls-rating">4.7 ★</div></div>
            </div>
            <div class="pl-song-row" onclick="navigate('song')">
              <div class="pls-num">4</div>
              <div class="pls-art" style="background-image:url('images/album-punisher.png')"></div>
              <div class="pls-info"><div class="pls-title">Savior Complex</div><div class="pls-artist">Phoebe Bridgers</div></div>
              <div class="pls-right"><div class="pls-dur">4:16</div><div class="pls-rating">4.9 ★</div></div>
            </div>
            <div class="pl-song-row" onclick="navigate('song')">
              <div class="pls-num">5</div>
              <div class="pls-art" style="background:linear-gradient(135deg,#2a0044,#ff1a6e 200%)"></div>
              <div class="pls-info"><div class="pls-title">Hairpray Queen</div><div class="pls-artist">Carpenter Brut</div></div>
              <div class="pls-right"><div class="pls-dur">5:12</div><div class="pls-rating">4.6 ★</div></div>
            </div>
            <div class="pl-song-row" onclick="navigate('song')">
              <div class="pls-num">6</div>
              <div class="pls-art" style="background:linear-gradient(135deg,#1a1a3e,#4c1d95)"></div>
              <div class="pls-info"><div class="pls-title">Archangel</div><div class="pls-artist">Burial</div></div>
              <div class="pls-right"><div class="pls-dur">5:01</div><div class="pls-rating">5.0 ★</div></div>
            </div>
            <div class="pl-song-row" onclick="navigate('song')">
              <div class="pls-num">7</div>
              <div class="pls-art" style="background-image:url('images/album-crystalcastles1.png')"></div>
              <div class="pls-info"><div class="pls-title">Courtship Dating</div><div class="pls-artist">Crystal Castles</div></div>
              <div class="pls-right"><div class="pls-dur">4:01</div><div class="pls-rating">4.7 ★</div></div>
            </div>
          </div>
        </div>`
      },
      {
        label: 'Genres', version: 'v1.4',
        thumb: ['w80','w60','w80','accent','w70'],
        html: `
        <div class="app-screen s-playlists">
          ${topNav('playlists')}
          <div class="home-header" style="padding:10px 16px 8px">
            <div class="home-logo" style="font-size:16px">My Library</div>
          </div>
          <div class="pl-exp-tabs">
            <button class="pl-exp-tab" onclick="navigate('playlists')">My Lists</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Artists</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Albums</button>
            <button class="pl-exp-tab" onclick="navigate('playlists')">Songs</button>
            <button class="pl-exp-tab active">Genres</button>
          </div>
          <div style="flex:1;overflow-y:auto;padding:10px 16px 16px;scrollbar-width:none">
            <div class="pl-genre-card" style="background:linear-gradient(135deg,#12103a,#2d1b69)" onclick="navigate('album')">
              <div class="plg-name">Electronic</div>
              <div class="plg-stats">12,441 reviews · avg 4.4 ★</div>
              <div class="plg-tr-label">Trending Review</div>
              <div class="plg-tr-text">"chaotic and beautiful. alice's vocals hit like static shock every single time"</div>
              <div class="plg-tr-by">— echoplex on Crystal Castles</div>
            </div>
            <div class="pl-genre-card" style="background:linear-gradient(135deg,#071a0e,#134d22)" onclick="navigate('album')">
              <div class="plg-name">Indie Folk</div>
              <div class="plg-stats">8,892 reviews · avg 4.5 ★</div>
              <div class="plg-tr-label">Trending Review</div>
              <div class="plg-tr-text">"funeral is the most heartbreaking song ive heard in years. phoebe ruins you gently"</div>
              <div class="plg-tr-by">— echoplex on Punisher</div>
            </div>
            <div class="pl-genre-card" style="background:linear-gradient(135deg,#1a0d00,#4a2000)" onclick="navigate('album')">
              <div class="plg-name">Hip-Hop</div>
              <div class="plg-stats">22,310 reviews · avg 4.3 ★</div>
              <div class="plg-tr-label">Trending Review</div>
              <div class="plg-tr-text">"every bar lands different depending on where you are in life. album of the decade"</div>
              <div class="plg-tr-by">— velvetblast on To Pimp a Butterfly</div>
            </div>
            <div class="pl-genre-card" style="background:linear-gradient(135deg,#0a0a0a,#2a2a2a)" onclick="navigate('album')">
              <div class="plg-name">Hyperpop</div>
              <div class="plg-stats">5,014 reviews · avg 4.6 ★</div>
              <div class="plg-tr-label">Trending Review</div>
              <div class="plg-tr-text">"this album rewired my brain. nothing before or after sounds like it"</div>
              <div class="plg-tr-by">— staticfog on 1000 gecs</div>
            </div>
          </div>
        </div>`
      }
    ]
  },

  // ── 13. SWIPE REVIEW ────────────────────────────────────────
  {
    id: 'swipe', name: 'Swipe Review', statusTheme: 'dark',
    variants: [{
      label: 'v1',
      thumb: ['accent','w80','accent','w60','w80'],
      html: `
      <div class="app-screen s-swipe">
        <div class="swipe-feed">
          <div class="swipe-card">
            <div class="swipe-bg" style="background-image:url('images/album-punisher.png')"></div>
            <div class="swipe-overlay"></div>
            <div class="swipe-content">
              <div class="swipe-cover-wrap">
                <div class="swipe-cover" style="background-image:url('images/album-punisher.png')"></div>
              </div>
              <div class="swipe-info">
                <div class="swipe-album-name">Punisher</div>
                <div class="swipe-artist-name">Phoebe Bridgers</div>
                <div class="swipe-meta">2020 · Indie Folk · Dead Oceans</div>
              </div>
              <div class="swipe-rating-section">
                <div class="swipe-rating-label">rate this album</div>
                <div class="swipe-stars">
                  <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full">★</div></div>
                  <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full">★</div></div>
                  <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full">★</div></div>
                  <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full">★</div></div>
                  <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill half">★</div></div>
                </div>
                <div class="swipe-score">4.5 / 5 · half stars on</div>
              </div>
              <div class="swipe-actions">
                <button class="swipe-skip" onclick="navigate('home')">Skip</button>
                <button class="swipe-log" onclick="navigate('review')">Log Album ↗</button>
              </div>
              <div class="swipe-up-hint">↑ &nbsp; swipe for next</div>
            </div>
          </div>
        </div>
      </div>`
    }]
  },

];

// ── Helpers ──────────────────────────────────────────────────
function topNav(active) {
  return `
  <div class="top-nav">
    <button class="tn-tab${active==='playlists'?' active':''}" onclick="navigate('playlists')">Playlists</button>
    <button class="tn-tab tn-center${active==='feed'?' active':''}" onclick="navigate('feed')">Live Feed</button>
    <button class="tn-tab${active==='home'?' active':''}" onclick="navigate('home')">Home</button>
  </div>`;
}

function halfStars(rating, size) {
  const sz = (size || 14) * 0.72;   // match the old ★ glyph's visual footprint so the vinyl top lines up with the number's cap height
  let out = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i)            out += `<span class="hstar full"  style="width:${sz}px;height:${sz}px"></span>`;
    else if (rating >= i - 0.5) out += `<span class="hstar half"  style="width:${sz}px;height:${sz}px"></span>`;
    else                         out += `<span class="hstar empty" style="width:${sz}px;height:${sz}px"></span>`;
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
