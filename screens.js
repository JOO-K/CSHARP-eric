// ============================================================
//  SCREENS
//  Each screen has a variants array: [{ label, thumb, html }]
//  Add more variants to compare different visual directions.
//  navigate('screenId') works in both desktop viewer + mobile.
// ============================================================

const SCREENS = [

  // ── 1. AUTH / LOGIN ─────────────────────────────────────
  {
    id: 'auth',
    name: 'Auth / Login',
    statusTheme: 'light',
    variants: [
      {
        label: 'v1',
        thumb: ['w50', 'w80', 'accent', 'w80', 'accent'],
        html: `
        <div class="app-screen s-auth">

          <div class="auth-hero">
            <div class="auth-logo-circle">
              <svg viewBox="0 0 48 48" width="36" height="36" fill="none" stroke="white" stroke-width="2">
                <circle cx="24" cy="24" r="20"/><circle cx="24" cy="24" r="8"/>
                <circle cx="24" cy="24" r="3" fill="white" stroke="none"/>
              </svg>
            </div>
            <div class="auth-appname">ENOCH</div>
          </div>

          <div class="auth-body">
            <div class="field-group">
              <div class="field">
                <label>Email address</label>
                <input type="email" placeholder="you@example.com">
              </div>
              <div class="field">
                <label>Password</label>
                <input type="password" placeholder="••••••••">
              </div>
            </div>
            <button class="btn-primary" style="margin-top:8px" onclick="navigate('onboarding')">Sign In</button>
            <div class="divider" style="margin:16px 0">or continue with</div>
            <button class="btn-outline" onclick="navigate('onboarding')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button class="link-btn" style="margin-top:20px" onclick="navigate('onboarding')">
              Don't have an account? <span style="color:var(--accent)">Sign Up</span>
            </button>
          </div>

        </div>
        `
      }
    ]
  },

  // ── 2. ONBOARDING ────────────────────────────────────────
  {
    id: 'onboarding',
    name: 'Onboarding',
    statusTheme: 'light',
    variants: [
      {
        label: 'v1',
        thumb: ['w70', 'accent', 'w80', 'w60', 'w70'],
        html: `
        <div class="app-screen s-onboarding">

          <div class="ob-header">
            <div class="ob-progress">
              <div class="ob-prog-bar" style="width:33%"></div>
            </div>
            <div class="ob-step">Step 1 of 3</div>
            <div class="ob-title">What do you listen to?</div>
            <div class="ob-sub">Pick all that apply — we'll personalise your feed.</div>
          </div>

          <div class="ob-body">
            <div class="genre-chips">
              <button class="chip selected">Electronic</button>
              <button class="chip">Indie</button>
              <button class="chip selected">Hip-Hop</button>
              <button class="chip">Jazz</button>
              <button class="chip">R&amp;B / Soul</button>
              <button class="chip selected">Alternative</button>
              <button class="chip">Classical</button>
              <button class="chip">Pop</button>
              <button class="chip">Metal</button>
              <button class="chip">Folk</button>
              <button class="chip">Ambient</button>
              <button class="chip">Latin</button>
              <button class="chip">Country</button>
              <button class="chip selected">Punk</button>
              <button class="chip">Funk</button>
              <button class="chip">Blues</button>
            </div>
          </div>

          <div class="ob-footer">
            <button class="btn-primary" onclick="navigate('home')">Next →</button>
            <button class="link-btn" onclick="navigate('home')">Skip for now</button>
          </div>

        </div>
        `
      }
    ]
  },

  // ── 3. HOME FEED ─────────────────────────────────────────
  {
    id: 'home',
    name: 'Home Feed',
    statusTheme: 'light',
    variants: [
      {
        label: 'v1',
        thumb: ['w70', 'accent', 'w80', 'accent', 'w80'],
        html: `
        <div class="app-screen s-home">

          <div class="home-header">
            <div class="home-logo">ENOCH</div>
            <div class="home-header-right">
              <button class="icon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="seg-tabs">
            <button class="seg-tab active">Following</button>
            <button class="seg-tab">For You</button>
            <button class="seg-tab">Trending</button>
          </div>

          <!-- Featured card -->
          <div class="feed-feature" onclick="navigate('album')" style="background-image:url('images/album-punisher.png');background-size:cover;background-position:center">
            <div class="ff-art"></div>
            <div class="ff-info">
              <div class="ff-label">Featured Review</div>
              <div class="ff-album">Punisher</div>
              <div class="ff-artist">Phoebe Bridgers</div>
              <div class="stars"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span></div>
            </div>
          </div>

          <div class="feed">

            <div class="review-card" onclick="navigate('album')">
              <div class="rc-user">
                <div class="avatar" style="width:32px;height:32px"><div class="avatar-placeholder" style="font-size:13px;background:linear-gradient(135deg,#1c1c3e,#3b1fa8)">EP</div></div>
                <div class="rc-user-info">
                  <div class="rc-username">echoplex</div>
                  <div class="rc-action">logged an album</div>
                </div>
                <div class="rc-time">3h</div>
              </div>
              <div class="rc-body">
                <div class="album-art rc-art" style="background-image:url('images/album-crystalcastles1.png');background-size:cover;background-position:center"></div>
                <div class="rc-info">
                  <div class="rc-album">Crystal Castles</div>
                  <div class="rc-artist">Crystal Castles</div>
                  <div class="stars" style="margin-bottom:4px"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star empty">★</span></div>
                  <div class="rc-excerpt">"chaotic and beautiful. alice's vocals hit like static shock"</div>
                </div>
              </div>
            </div>

            <div class="review-card" onclick="navigate('album')">
              <div class="rc-user">
                <div class="avatar" style="width:32px;height:32px"><div class="avatar-placeholder" style="font-size:13px;background:linear-gradient(135deg,#0c4a1e,#16a34a)">SF</div></div>
                <div class="rc-user-info">
                  <div class="rc-username">staticfog</div>
                  <div class="rc-action">reviewed an album</div>
                </div>
                <div class="rc-time">7h</div>
              </div>
              <div class="rc-body">
                <div class="album-art rc-art" style="background:linear-gradient(135deg,#052e16,#86efac)"></div>
                <div class="rc-info">
                  <div class="rc-album">1000 gecs</div>
                  <div class="rc-artist">100 gecs</div>
                  <div class="stars" style="margin-bottom:4px"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span></div>
                  <div class="rc-excerpt">"this album rewired my brain. nothing before or after sounds like it"</div>
                </div>
              </div>
            </div>

            <div class="review-card" onclick="navigate('album')">
              <div class="rc-user">
                <div class="avatar" style="width:32px;height:32px"><div class="avatar-placeholder" style="font-size:13px;background:linear-gradient(135deg,#450a0a,#dc2626)">VB</div></div>
                <div class="rc-user-info">
                  <div class="rc-username">velvetblast</div>
                  <div class="rc-action">logged an album</div>
                </div>
                <div class="rc-time">1d</div>
              </div>
              <div class="rc-body">
                <div class="album-art rc-art" style="background:linear-gradient(135deg,#1a0533,#7e22ce)"></div>
                <div class="rc-info">
                  <div class="rc-album">Leather Teeth</div>
                  <div class="rc-artist">Carpenter Brut</div>
                  <div class="stars" style="margin-bottom:4px"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span></div>
                  <div class="rc-excerpt">"pure retro horror synth bliss. plays like a 80s slasher soundtrack"</div>
                </div>
              </div>
            </div>

          </div>

          ${tabBar('home')}
        </div>
        `
      }
    ]
  },

  // ── 4. SEARCH ────────────────────────────────────────────
  {
    id: 'search',
    name: 'Search',
    statusTheme: 'light',
    variants: [
      {
        label: 'v1',
        thumb: ['accent', 'w80', 'w50', 'w70', 'w40'],
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
              <div class="genre-card" style="background:linear-gradient(135deg,#1a1a4e,#6d28d9)" onclick="navigate('album')">Electronic</div>
              <div class="genre-card" style="background:linear-gradient(135deg,#1b4332,#15803d)" onclick="navigate('album')">Indie</div>
              <div class="genre-card" style="background:linear-gradient(135deg,#450a0a,#b91c1c)" onclick="navigate('album')">Rock</div>
              <div class="genre-card" style="background:linear-gradient(135deg,#1e3a5f,#1d4ed8)" onclick="navigate('album')">Jazz</div>
              <div class="genre-card" style="background:linear-gradient(135deg,#4a1942,#9d174d)" onclick="navigate('album')">R&amp;B / Soul</div>
              <div class="genre-card" style="background:linear-gradient(135deg,#1c1917,#78350f)" onclick="navigate('album')">Hip-Hop</div>
            </div>

            <div class="section-title">Trending This Week</div>
            <div class="trending-list">
              <div class="trending-item" onclick="navigate('album')">
                <div class="trending-num">1</div>
                <div class="album-art trending-art" style="background-image:url('images/album-punisher.png');background-size:cover;background-position:center"></div>
                <div class="trending-info"><div class="trending-album">Punisher</div><div class="trending-artist">Phoebe Bridgers</div></div>
                <span style="font-size:12px;color:var(--text2)">★ 4.7</span>
              </div>
              <div class="trending-item" onclick="navigate('album')">
                <div class="trending-num">2</div>
                <div class="album-art trending-art" style="background-image:url('images/album-crystalcastles1.png');background-size:cover;background-position:center"></div>
                <div class="trending-info"><div class="trending-album">Crystal Castles</div><div class="trending-artist">Crystal Castles</div></div>
                <span style="font-size:12px;color:var(--text2)">★ 4.4</span>
              </div>
              <div class="trending-item" onclick="navigate('artist')">
                <div class="trending-num">3</div>
                <div class="album-art trending-art" style="background:linear-gradient(135deg,#052e16,#86efac)"></div>
                <div class="trending-info"><div class="trending-album">1000 gecs</div><div class="trending-artist">100 gecs</div></div>
                <span style="font-size:12px;color:var(--text2)">★ 4.6</span>
              </div>
              <div class="trending-item" onclick="navigate('album')">
                <div class="trending-num">4</div>
                <div class="album-art trending-art" style="background:linear-gradient(135deg,#1a0533,#7e22ce)"></div>
                <div class="trending-info"><div class="trending-album">Leather Teeth</div><div class="trending-artist">Carpenter Brut</div></div>
                <span style="font-size:12px;color:var(--text2)">★ 4.5</span>
              </div>
            </div>
          </div>

          ${tabBar('search')}
        </div>
        `
      }
    ]
  },

  // ── 5. ALBUM PAGE ────────────────────────────────────────
  {
    id: 'album',
    name: 'Album Page',
    statusTheme: 'light',
    variants: [
      {
        label: 'v1',
        thumb: ['accent', 'w80', 'w60', 'w80', 'w80'],
        html: `
        <div class="app-screen s-album" style="--accent:#8bb0ff">

          <div class="album-hero">
            <div class="album-art album-cover-full" style="height:210px;border-radius:0;background-image:url('images/album-punisher.png');background-size:cover;background-position:center">
            </div>
            <div class="album-hero-overlay"></div>
            <button class="album-back-btn" onclick="navigate('search')">‹</button>
          </div>

          <div class="album-info">
            <div class="album-title">Punisher</div>
            <div class="album-artist" onclick="navigate('artist')">Phoebe Bridgers</div>
            <div class="album-meta">2020 · Indie Folk · 10 tracks</div>
          </div>

          <div class="album-stats">
            <div class="album-stat"><div class="album-stat-val">4.7</div><div class="album-stat-lbl">avg rating</div></div>
            <div class="album-stat"><div class="album-stat-val">—</div><div class="album-stat-lbl">your rating</div></div>
            <div class="album-stat"><div class="album-stat-val">89k</div><div class="album-stat-lbl">logged</div></div>
            <div class="album-stat"><div class="album-stat-val">3.2k</div><div class="album-stat-lbl">reviews</div></div>
          </div>

          <div class="album-actions">
            <button class="btn-primary" onclick="navigate('review')">Log / Review</button>
            <button class="btn-small">+ List</button>
            <button class="btn-small">♥</button>
          </div>

          <div class="reviews-section">
            <div class="reviews-title">Popular Reviews</div>
            <div class="mini-review">
              <div class="mr-header">
                <div class="avatar mr-avatar"><div class="avatar-placeholder" style="font-size:10px">EP</div></div>
                <div class="mr-username">echoplex</div>
                <div class="stars" style="gap:1px"><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span></div>
              </div>
              <div class="mr-text">"funeral is the most heartbreaking song ive heard in years. she ruins you gently"</div>
            </div>
            <div class="mini-review">
              <div class="mr-header">
                <div class="avatar mr-avatar"><div class="avatar-placeholder" style="font-size:10px;background:linear-gradient(135deg,#164e63,#0284c7)">SF</div></div>
                <div class="mr-username">staticfog</div>
                <div class="stars" style="gap:1px"><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span></div>
              </div>
              <div class="mr-text">"garden song alone deserves a 5/5. the whole album feels like a lucid dream"</div>
            </div>
            <div class="mini-review">
              <div class="mr-header">
                <div class="avatar mr-avatar"><div class="avatar-placeholder" style="font-size:10px;background:linear-gradient(135deg,#450a0a,#dc2626)">VB</div></div>
                <div class="mr-username">velvetblast</div>
                <div class="stars" style="gap:1px"><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star empty" style="font-size:12px">★</span></div>
              </div>
              <div class="mr-text">"i've listened to savior complex on repeat for an hour straight and i'm not even sorry"</div>
            </div>
          </div>

        </div>
        `
      }
    ]
  },

  // ── 6. ARTIST PAGE ───────────────────────────────────────
  {
    id: 'artist',
    name: 'Artist Page',
    statusTheme: 'light',
    variants: [
      {
        label: 'v1',
        thumb: ['accent', 'w70', 'w80', 'w50', 'w80'],
        html: `
        <div class="app-screen s-artist" style="--accent:#8bb0ff">

          <div class="artist-hero">
            <div class="artist-hero-img" style="background-image:url('images/artist-phoebe.jpg');background-size:cover;background-position:center top"></div>
            <div class="artist-hero-overlay"></div>
            <button class="album-back-btn" onclick="navigate('search')">‹</button>
            <div class="artist-hero-name">Phoebe Bridgers</div>
          </div>

          <div class="artist-meta">Indie Folk · American · 2014–present</div>

          <div class="artist-stats">
            <div class="album-stat"><div class="album-stat-val">2.8K</div><div class="album-stat-lbl">Reviews</div></div>
            <div class="album-stat"><div class="album-stat-val">4.6</div><div class="album-stat-lbl">Avg Rating</div></div>
            <div class="album-stat"><div class="album-stat-val">156K</div><div class="album-stat-lbl">Listeners</div></div>
          </div>

          <div style="padding:0 20px">
            <div class="section-title" style="margin-top:16px;margin-bottom:12px">Top Albums</div>
            <div class="artist-albums-grid">
              <div class="artist-album-item" onclick="navigate('album')">
                <div class="album-art" style="width:100%;aspect-ratio:1;border-radius:8px;background-image:url('images/album-punisher.png');background-size:cover;background-position:center"></div>
                <div style="font-size:12px;font-weight:600;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Punisher</div>
                <div style="font-size:11px;color:var(--text2)">★ 4.7</div>
              </div>
              <div class="artist-album-item" onclick="navigate('album')">
                <div class="album-art" style="width:100%;aspect-ratio:1;border-radius:8px;background:linear-gradient(135deg,#1e3a5f,#374151)"></div>
                <div style="font-size:12px;font-weight:600;margin-top:5px">Stranger in the Alps</div>
                <div style="font-size:11px;color:var(--text2)">★ 4.5</div>
              </div>
              <div class="artist-album-item" onclick="navigate('album')">
                <div class="album-art" style="width:100%;aspect-ratio:1;border-radius:8px;background:linear-gradient(135deg,#1c1917,#44403c)"></div>
                <div style="font-size:12px;font-weight:600;margin-top:5px">boygenius EP</div>
                <div style="font-size:11px;color:var(--text2)">★ 4.6</div>
              </div>
              <div class="artist-album-item" onclick="navigate('album')">
                <div class="album-art" style="width:100%;aspect-ratio:1;border-radius:8px;background:linear-gradient(135deg,#0f172a,#1e293b)"></div>
                <div style="font-size:12px;font-weight:600;margin-top:5px">the record</div>
                <div style="font-size:11px;color:var(--text2)">★ 4.4</div>
              </div>
            </div>
          </div>

        </div>
        `
      }
    ]
  },

  // ── 7. SONG / TRACK ──────────────────────────────────────
  {
    id: 'song',
    name: 'Song / Track',
    statusTheme: 'light',
    variants: [
      {
        label: 'v1',
        thumb: ['w80', 'accent', 'w60', 'w80', 'w70'],
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
              <div class="song-artist" onclick="navigate('artist')">Phoebe Bridgers</div>
              <div class="song-album" onclick="navigate('album')">Punisher · 2020</div>
            </div>
          </div>

          <div class="song-stats">
            <div class="album-stat"><div class="album-stat-val">4.9</div><div class="album-stat-lbl">avg</div></div>
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
                <div class="stars" style="gap:1px"><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span></div>
              </div>
              <div class="mr-text">"grew the garden where i lay. she is absolutely unwell and so am i now"</div>
            </div>
            <div class="mini-review">
              <div class="mr-header">
                <div class="avatar mr-avatar"><div class="avatar-placeholder" style="font-size:10px;background:linear-gradient(135deg,#164e63,#0284c7)">SF</div></div>
                <div class="mr-username">staticfog</div>
                <div class="stars" style="gap:1px"><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span><span class="star" style="font-size:12px">★</span></div>
              </div>
              <div class="mr-text">"the opening track that sets the whole album's tone. devastating in the best way"</div>
            </div>
          </div>

        </div>
        `
      }
    ]
  },

  // ── 8. REVIEW PAGE ───────────────────────────────────────
  {
    id: 'review',
    name: 'Review Page',
    statusTheme: 'light',
    variants: [
      {
        label: 'v1',
        thumb: ['w70', 'accent', 'w80', 'w60', 'accent'],
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
              <div style="font-size:11px;color:var(--text3);margin-top:5px">half stars supported · tap to rate</div>
            </div>

            <div>
              <div class="write-section-label">WRITE A REVIEW <span style="font-weight:400;text-transform:none">(optional)</span></div>
              <div class="field">
                <textarea placeholder="Share your thoughts on this album…" rows="5"></textarea>
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

        </div>
        `
      }
    ]
  },

  // ── 9. PROFILE ───────────────────────────────────────────
  {
    id: 'profile',
    name: 'Profile',
    statusTheme: 'light',
    variants: [
      {
        label: 'v1',
        thumb: ['accent', 'w50', 'w80', 'w80', 'w70'],
        html: `
        <div class="app-screen s-profile">

          <div class="app-nav">
            <div></div>
            <div class="app-nav-title">Profile</div>
            <button class="app-nav-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>

          <div class="profile-header">
            <div class="avatar profile-avatar">
              <div class="avatar-placeholder" style="font-size:26px;font-weight:700">E</div>
            </div>
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
              <div class="rg-item" onclick="navigate('album')"><div class="album-art rg-art" style="background-image:url('images/album-punisher.png');background-size:cover;background-position:center"></div><div class="rg-title">Punisher</div><div class="rg-rating"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span></div></div>
              <div class="rg-item" onclick="navigate('album')"><div class="album-art rg-art" style="background-image:url('images/album-crystalcastles1.png');background-size:cover;background-position:center"></div><div class="rg-title">CC I</div><div class="rg-rating"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star empty">★</span></div></div>
              <div class="rg-item" onclick="navigate('album')"><div class="album-art rg-art" style="background:linear-gradient(135deg,#052e16,#86efac)"></div><div class="rg-title">1000 gecs</div><div class="rg-rating"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span></div></div>
            </div>
            <div class="rg-row">
              <div class="rg-item" onclick="navigate('album')"><div class="album-art rg-art" style="background:linear-gradient(135deg,#1a0533,#7e22ce)"></div><div class="rg-title">Leather Teeth</div><div class="rg-rating"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span></div></div>
              <div class="rg-item" onclick="navigate('album')"><div class="album-art rg-art" style="background:linear-gradient(135deg,#1e3a5f,#374151)"></div><div class="rg-title">Stranger Alps</div><div class="rg-rating"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star empty">★</span></div></div>
              <div class="rg-item" onclick="navigate('album')"><div class="album-art rg-art" style="background:linear-gradient(135deg,#1c1c3e,#3b1fa8)"></div><div class="rg-title">Crystal Castles</div><div class="rg-rating"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star empty">★</span></div></div>
            </div>
          </div>

          ${tabBar('profile')}
        </div>
        `
      }
    ]
  },

  // ── 10. PLAYLISTS ─────────────────────────────────────────
  {
    id: 'playlists',
    name: 'Playlists',
    statusTheme: 'light',
    variants: [
      {
        label: 'v1',
        thumb: ['w80', 'accent', 'w60', 'w80', 'w70'],
        html: `
        <div class="app-screen s-playlists">

          <div class="home-header">
            <div class="home-logo">My Playlists</div>
            <button class="icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          <div class="feed" style="gap:10px">

            <div class="playlist-card">
              <div class="pl-art-stack">
                <div class="album-art" style="width:52px;height:52px;border-radius:6px;background:linear-gradient(135deg,#0f172a,#4338ca)"></div>
                <div class="album-art" style="width:52px;height:52px;border-radius:6px;background:linear-gradient(135deg,#1a1a4e,#4a0e8f)"></div>
                <div class="album-art" style="width:52px;height:52px;border-radius:6px;background:linear-gradient(135deg,#1b4332,#40916c)"></div>
              </div>
              <div class="pl-info">
                <div class="pl-name">Desert Island Picks</div>
                <div class="pl-meta">12 albums · Updated 2d ago</div>
              </div>
              <button class="pl-export-btn" title="Export to Spotify">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </button>
            </div>

            <div class="playlist-card">
              <div class="pl-art-stack">
                <div class="album-art" style="width:52px;height:52px;border-radius:6px;background:linear-gradient(135deg,#450a0a,#991b1b)"></div>
                <div class="album-art" style="width:52px;height:52px;border-radius:6px;background:linear-gradient(135deg,#0f172a,#7c3aed)"></div>
              </div>
              <div class="pl-info">
                <div class="pl-name">Late Night Drives</div>
                <div class="pl-meta">8 albums · Updated 1w ago</div>
              </div>
              <button class="pl-export-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </button>
            </div>

            <div class="playlist-card">
              <div class="pl-art-stack">
                <div class="album-art" style="width:52px;height:52px;border-radius:6px;background:linear-gradient(135deg,#1e3a5f,#0ea5e9)"></div>
              </div>
              <div class="pl-info">
                <div class="pl-name">Jazz Essentials</div>
                <div class="pl-meta">5 albums · Updated 3w ago</div>
              </div>
              <button class="pl-export-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </button>
            </div>

          </div>

          ${tabBar('playlists')}
        </div>
        `
      }
    ]
  },

  // ── 11. LIVE STREAM ───────────────────────────────────────
  {
    id: 'live',
    name: 'Live Stream',
    statusTheme: 'light',
    variants: [
      {
        label: 'v1',
        thumb: ['accent', 'w80', 'w70', 'accent', 'w60'],
        html: `
        <div class="app-screen s-live">

          <div class="live-header">
            <button class="app-nav-btn" onclick="navigate('home')"><span class="app-nav-back">‹</span></button>
            <div style="display:flex;align-items:center;gap:6px">
              <div class="live-badge">LIVE</div>
              <span style="font-size:13px;color:var(--text2)">312 listening</span>
            </div>
            <button class="icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
          </div>

          <div class="live-player">
            <div class="live-art" style="background-image:url('images/album-punisher.png');background-size:cover;background-position:center"></div>
            <div class="live-info">
              <div class="live-now">NOW PLAYING</div>
              <div class="live-track">Motion Sickness</div>
              <div class="live-artist">Phoebe Bridgers</div>
            </div>
            <div class="live-controls">
              <button class="live-ctrl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
              </button>
              <button class="live-ctrl live-ctrl-main">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              </button>
              <button class="live-ctrl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
              </button>
            </div>
          </div>

          <div class="live-chat-header">
            <span>Live Chat</span>
            <span style="font-size:12px;color:var(--text2)">312 in here</span>
          </div>

          <div class="live-chat">
            <div class="chat-msg"><span class="chat-user">echoplex</span><span class="chat-text">she plays this song live and everyone loses it</span></div>
            <div class="chat-msg"><span class="chat-user">staticfog</span><span class="chat-text">the key change at the end destroys me every time</span></div>
            <div class="chat-msg"><span class="chat-user">velvetblast</span><span class="chat-text">phoebe was robbed of every grammy she's ever been nominated for</span></div>
            <div class="chat-msg"><span class="chat-user">coldplaylist</span><span class="chat-text">punisher top 3 albums of the decade no debate</span></div>
            <div class="chat-msg"><span class="chat-user">echoplex</span><span class="chat-text">agreed ★★★★★</span></div>
          </div>

          <div class="live-chat-input">
            <input type="text" placeholder="Say something…">
            <button class="btn-primary" style="width:auto;padding:10px 14px;border-radius:8px;font-size:13px">Send</button>
          </div>

        </div>
        `
      }
    ]
  },

  // ── 12. SWIPE REVIEW ─────────────────────────────────────────
  {
    id: 'swipe',
    name: 'Swipe Review',
    statusTheme: 'dark',
    variants: [
      {
        label: 'v1',
        thumb: ['accent', 'w80', 'accent', 'w60', 'w80'],
        html: `
        <div class="app-screen s-swipe">
          <div class="swipe-feed">

            <!-- CARD 1 · Punisher / Phoebe Bridgers ──────────── -->
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
                  <div class="swipe-score">4.5 / 5 · tap star to rate · half stars on</div>
                </div>
                <div class="swipe-actions">
                  <button class="swipe-skip" onclick="navigate('home')">Skip</button>
                  <button class="swipe-log" onclick="navigate('review')">Log Album ↗</button>
                </div>
                <div class="swipe-up-hint">↑ &nbsp; swipe for next</div>
              </div>
            </div>

            <!-- CARD 2 · Crystal Castles (I) ───────────────── -->
            <div class="swipe-card">
              <div class="swipe-bg" style="background-image:url('images/album-crystalcastles1.png')"></div>
              <div class="swipe-overlay"></div>
              <div class="swipe-content">
                <div class="swipe-cover-wrap">
                  <div class="swipe-cover" style="background-image:url('images/album-crystalcastles1.png')"></div>
                </div>
                <div class="swipe-info">
                  <div class="swipe-album-name">Crystal Castles</div>
                  <div class="swipe-artist-name">Crystal Castles</div>
                  <div class="swipe-meta">2008 · Electronic / Lo-Fi · Last Gang</div>
                </div>
                <div class="swipe-rating-section" style="border-color:rgba(192,132,252,0.2)">
                  <div class="swipe-rating-label">rate this album</div>
                  <div class="swipe-stars">
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full">★</div></div>
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full">★</div></div>
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full">★</div></div>
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full">★</div></div>
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill">★</div></div>
                  </div>
                  <div class="swipe-score">4.0 / 5 · tap star to rate · half stars on</div>
                </div>
                <div class="swipe-actions">
                  <button class="swipe-skip" onclick="navigate('home')">Skip</button>
                  <button class="swipe-log" style="background:#c084fc" onclick="navigate('review')">Log Album ↗</button>
                </div>
                <div class="swipe-up-hint">↑ &nbsp; swipe for next</div>
              </div>
            </div>

            <!-- CARD 3 · 1000 gecs / 100 gecs ───────────────── -->
            <div class="swipe-card">
              <div class="swipe-bg" style="background:linear-gradient(135deg,#021a0b,#1a4a1a);filter:blur(0) brightness(0.3)"></div>
              <div class="swipe-overlay"></div>
              <div class="swipe-content">
                <div class="swipe-cover-wrap">
                  <div class="swipe-cover" style="background:linear-gradient(135deg,#042a10,#6aff3a 120%);display:flex;align-items:center;justify-content:center">
                    <span style="font-size:52px;font-weight:800;color:#000;font-family:var(--font-main);letter-spacing:-3px;opacity:0.85">gecs</span>
                  </div>
                </div>
                <div class="swipe-info">
                  <div class="swipe-album-name">1000 gecs</div>
                  <div class="swipe-artist-name">100 gecs</div>
                  <div class="swipe-meta">2019 · Hyperpop · Dog Show Records</div>
                </div>
                <div class="swipe-rating-section" style="border-color:rgba(132,250,90,0.2)">
                  <div class="swipe-rating-label">rate this album</div>
                  <div class="swipe-stars">
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full" style="color:#84fa5a">★</div></div>
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full" style="color:#84fa5a">★</div></div>
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full" style="color:#84fa5a">★</div></div>
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full" style="color:#84fa5a">★</div></div>
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full" style="color:#84fa5a">★</div></div>
                  </div>
                  <div class="swipe-score">5.0 / 5 · tap star to rate · half stars on</div>
                </div>
                <div class="swipe-actions">
                  <button class="swipe-skip" onclick="navigate('home')">Skip</button>
                  <button class="swipe-log" style="background:#5adf1a" onclick="navigate('review')">Log Album ↗</button>
                </div>
                <div class="swipe-up-hint">↑ &nbsp; swipe for next</div>
              </div>
            </div>

            <!-- CARD 4 · Leather Teeth / Carpenter Brut ────── -->
            <div class="swipe-card">
              <div class="swipe-bg" style="background:linear-gradient(135deg,#1a0030,#4a0066);filter:blur(0) brightness(0.25)"></div>
              <div class="swipe-overlay"></div>
              <div class="swipe-content">
                <div class="swipe-cover-wrap">
                  <div class="swipe-cover" style="background:linear-gradient(135deg,#2a0044,#ff1a6e 200%);display:flex;align-items:center;justify-content:center">
                    <span style="font-size:13px;font-weight:800;color:rgba(255,255,255,0.9);font-family:var(--font-main);letter-spacing:3px;text-transform:uppercase;text-align:center;line-height:1.5;padding:0 20px">LEATHER<br>TEETH</span>
                  </div>
                </div>
                <div class="swipe-info">
                  <div class="swipe-album-name">Leather Teeth</div>
                  <div class="swipe-artist-name">Carpenter Brut</div>
                  <div class="swipe-meta">2018 · Darksynth · Nuclear Blast</div>
                </div>
                <div class="swipe-rating-section" style="border-color:rgba(255,77,158,0.2)">
                  <div class="swipe-rating-label">rate this album</div>
                  <div class="swipe-stars">
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full" style="color:#ff4d9e">★</div></div>
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full" style="color:#ff4d9e">★</div></div>
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill full" style="color:#ff4d9e">★</div></div>
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill half" style="color:#ff4d9e">★</div></div>
                    <div class="swipe-star-wrap"><div class="swipe-star-bg">★</div><div class="swipe-star-fill">★</div></div>
                  </div>
                  <div class="swipe-score">3.5 / 5 · tap star to rate · half stars on</div>
                </div>
                <div class="swipe-actions">
                  <button class="swipe-skip" onclick="navigate('home')">Skip</button>
                  <button class="swipe-log" style="background:#ff4d9e" onclick="navigate('review')">Log Album ↗</button>
                </div>
                <div class="swipe-up-hint" style="opacity:0">&nbsp;</div>
              </div>
            </div>

          </div>
        </div>
        `
      }
    ]
  },

];

// ── Tab bar (5 tabs matching Figma wireframes) ───────────────
function tabBar(active) {
  const tabs = [
    { id: 'home',      label: 'Home',      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { id: 'search',    label: 'Search',    icon: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>' },
    { id: 'review',    label: '+',         icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>', plus: true },
    { id: 'home',      label: 'Activity',  icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' },
    { id: 'profile',   label: 'Profile',   icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
  ];
  return `
  <nav class="tab-bar">
    ${tabs.map(t => `
    <button class="tab-item ${t.id === active && !t.plus ? 'active' : ''}" onclick="navigate('${t.id}')">
      <svg viewBox="0 0 24 24" fill="${t.plus ? 'currentColor' : 'none'}" stroke="${t.plus ? 'none' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${t.icon}
      </svg>
      <span>${t.label}</span>
    </button>`).join('')}
  </nav>
  `;
}
