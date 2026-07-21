// ============================================================
//  SCREENS
// ============================================================

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
                      onclick="this.classList.toggle('has-notif')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="v3-bubble-count">+5</span>
              </button>
            </div>
            <div class="v3-header-logo">spindeck</div>
            <div class="v3-header-right">
              <!-- Settings (inner) -->
              <button class="v3-bubble v3-bubble--settings" title="Settings" aria-label="Settings">
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
                <span class="v3-blue-artist" onclick="event.stopPropagation(); onArtistName(this)"></span>
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
              <div class="v3-cd-menu-sep"></div>
              <button class="wall2-menu-item plp-plat-item" onclick="event.stopPropagation(); this.closest('.v3-cd-menu').hidden = true">
                <span class="plp-plat-ico" style="background:#1DB954"><svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.72 13.5 1.56.36.24.54.84.24 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/></svg></span>
                Spotify
              </button>
              <button class="wall2-menu-item plp-plat-item" onclick="event.stopPropagation(); this.closest('.v3-cd-menu').hidden = true">
                <span class="plp-plat-ico" style="background:linear-gradient(135deg,#fc3c44,#fc6f32)"><svg width="9" height="11" viewBox="0 0 13 16" fill="white"><path d="M6.5 0L8 3.5 13 4.3l-3.5 3.4.8 4.8L6.5 10.5 2.2 12.5l.8-4.8L0 4.3l5-.8z"/></svg></span>
                Apple Music
              </button>
              <button class="wall2-menu-item plp-plat-item" onclick="event.stopPropagation(); this.closest('.v3-cd-menu').hidden = true">
                <span class="plp-plat-ico" style="background:linear-gradient(135deg,#ff5500,#ff8800)"><svg width="12" height="8" viewBox="0 0 24 16" fill="white"><rect x="2" y="7" width="1.8" height="6" rx=".9"/><rect x="6" y="4" width="1.8" height="9" rx=".9"/><rect x="10" y="6" width="1.8" height="7" rx=".9"/><rect x="14" y="2" width="1.8" height="11" rx=".9"/><rect x="18" y="8" width="1.8" height="5" rx=".9"/></svg></span>
                SoundCloud
              </button>
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

          </div>

          <!-- SCROLL: app name + friends feed -->
          <div class="v3-scroll-area">

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

              <!-- Media column — album photos flow vertically down the CD side, fading out.
                   (Streaming icons removed — streaming now lives behind the CD tap.) -->
              <div class="v3-rev-media"></div>

              <!-- Your rating + written review + submit — aligned to the stats text -->
              <div class="v3-rev-mine">
                <button class="v3-rev-cta" onclick="event.stopPropagation(); openLogSheet(this);">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                  <span>Review, rate, log</span>
                </button>
              </div>

            </div><!-- /v3-rev-top -->

            <!-- Rating distribution bars (header text removed, bars kept) -->
            <div class="v3-rev-hist">
              <div class="v3-rev-hist-bars"></div>
              <div class="v3-rev-hist-axis"><span>½</span><span>5</span></div>
            </div>

            <!-- Tracklist — rate individual songs; scrolls after ~8 rows, 9th fades to hint more -->
            <div class="v3-rev-songs"></div>

            <!-- Artist page — grid of the artist's albums (trending style; shown only in --artist state) -->
            <div class="v3-artist-albums"></div>

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

          <!-- NOW-PLAYING TICKER — a friend's live listen (name · song · album · artist)
               with a waveform on the right. Sits just above the bottom nav, left-aligned
               by the nav's left curve. app.js fills it and cycles through listeners. -->
          <div class="v3-nowbar">
            <div class="v3-now-text"></div>
            <div class="v3-now-wave" aria-hidden="true"></div>
          </div>

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
                      onclick="this.classList.toggle('has-notif')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="v3-bubble-count">+5</span>
              </button>
            </div>
            <div class="v3-header-logo">spindeck</div>
            <div class="v3-header-right">
              <!-- Settings (inner) -->
              <button class="v3-bubble v3-bubble--settings" title="Settings" aria-label="Settings">
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
                <span class="v3-blue-artist" onclick="event.stopPropagation(); onArtistName(this)"></span>
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
              <div class="v3-cd-menu-sep"></div>
              <button class="wall2-menu-item plp-plat-item" onclick="event.stopPropagation(); this.closest('.v3-cd-menu').hidden = true">
                <span class="plp-plat-ico" style="background:#1DB954"><svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.72 13.5 1.56.36.24.54.84.24 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/></svg></span>
                Spotify
              </button>
              <button class="wall2-menu-item plp-plat-item" onclick="event.stopPropagation(); this.closest('.v3-cd-menu').hidden = true">
                <span class="plp-plat-ico" style="background:linear-gradient(135deg,#fc3c44,#fc6f32)"><svg width="9" height="11" viewBox="0 0 13 16" fill="white"><path d="M6.5 0L8 3.5 13 4.3l-3.5 3.4.8 4.8L6.5 10.5 2.2 12.5l.8-4.8L0 4.3l5-.8z"/></svg></span>
                Apple Music
              </button>
              <button class="wall2-menu-item plp-plat-item" onclick="event.stopPropagation(); this.closest('.v3-cd-menu').hidden = true">
                <span class="plp-plat-ico" style="background:linear-gradient(135deg,#ff5500,#ff8800)"><svg width="12" height="8" viewBox="0 0 24 16" fill="white"><rect x="2" y="7" width="1.8" height="6" rx=".9"/><rect x="6" y="4" width="1.8" height="9" rx=".9"/><rect x="10" y="6" width="1.8" height="7" rx=".9"/><rect x="14" y="2" width="1.8" height="11" rx=".9"/><rect x="18" y="8" width="1.8" height="5" rx=".9"/></svg></span>
                SoundCloud
              </button>
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

          </div>

          <!-- SCROLL: app name + friends feed -->
          <div class="v3-scroll-area">

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

              <!-- Media column — album photos flow vertically down the CD side, fading out.
                   (Streaming icons removed — streaming now lives behind the CD tap.) -->
              <div class="v3-rev-media"></div>

              <!-- Your rating + written review + submit — aligned to the stats text -->
              <div class="v3-rev-mine">
                <button class="v3-rev-cta" onclick="event.stopPropagation(); openLogSheet(this);">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                  <span>Review, rate, log</span>
                </button>
              </div>

            </div><!-- /v3-rev-top -->

            <!-- Rating distribution bars (header text removed, bars kept) -->
            <div class="v3-rev-hist">
              <div class="v3-rev-hist-bars"></div>
              <div class="v3-rev-hist-axis"><span>½</span><span>5</span></div>
            </div>

            <!-- Tracklist — rate individual songs; scrolls after ~8 rows, 9th fades to hint more -->
            <div class="v3-rev-songs"></div>

            <!-- Artist page — grid of the artist's albums (trending style; shown only in --artist state) -->
            <div class="v3-artist-albums"></div>

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

          <!-- NOW-PLAYING TICKER — a friend's live listen (name · song · album · artist)
               with a waveform on the right. Sits just above the bottom nav, left-aligned
               by the nav's left curve. app.js fills it and cycles through listeners. -->
          <div class="v3-nowbar">
            <div class="v3-now-text"></div>
            <div class="v3-now-wave" aria-hidden="true"></div>
          </div>

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

  // ── 12b. PLAYLIST PAGE (detail) ─────────────────────────────
  {
    id: 'playlist', name: 'Playlist Page', statusTheme: 'light',
    variants: [
      { label: 'Float·Dark',  version: 'v1', thumb: ['accent','w80','w60','w70','w50'], get html() { return playlistPageHtml(false); } },
      { label: 'Float·Light', version: 'v1', thumb: ['accent','w80','w60','w70','w50'], get html() { return playlistPageHtml(true);  } },
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

// ─── Constant app furniture (shared across pages) ───────────────
// The header, now-playing ticker, and bottom nav are the same on every page
// that opts into the .s-home-v3 shell. Keep these as the single source of truth.

function appHeader() {
  return `
          <div class="v3-header">
            <div class="v3-header-bubbles">
              <button class="v3-bubble v3-bubble--notif has-notif" title="Notifications" aria-label="Notifications"
                      onclick="this.classList.toggle('has-notif')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="v3-bubble-count">+5</span>
              </button>
            </div>
            <div class="v3-header-logo">spindeck</div>
            <div class="v3-header-right">
              <button class="v3-bubble v3-bubble--settings" title="Settings" aria-label="Settings">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
              <button class="v3-bubble v3-bubble--search" title="Search" aria-label="Search" onclick="openSearch(this)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              </button>
            </div>
          </div>`;
}

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

function onboardingHtml(light) {
  const genres = ['Electronic','Indie','Hip-Hop','Jazz','R&amp;B / Soul','Alternative',
    'Classical','Pop','Metal','Folk','Ambient','Latin','Country','Punk','Funk','Blues',
    'Shoegaze','Soul','Trip-hop','Dream Pop'];
  return `
      <div class="app-screen s-onboarding ${sdTheme(light)}">
        <div class="ob-top">
          <button class="ob-back" onclick="obBack()" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="ob-progress"><div class="ob-prog-bar"></div></div>
          <div class="ob-stepcount"><span class="ob-step-n">1</span>/<span class="ob-step-t">8</span></div>
        </div>

        <div class="ob-stage">

          <!-- 0 · USERNAME -->
          <section class="ob-panel" data-step="0">
            <div class="ob-h">
              <div class="ob-title">Claim your handle</div>
              <div class="ob-sub">This is how friends find you on Spindeck.</div>
            </div>
            <div class="ob-userwrap">
              <span class="ob-at">@</span>
              <input class="ob-user-input" type="text" placeholder="username" maxlength="20"
                     autocomplete="off" spellcheck="false" oninput="obSetUsername(this.value)">
            </div>
            <div class="ob-user-hint">3–20 characters · letters, numbers, underscores</div>
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

          <!-- 3 · GENRES -->
          <section class="ob-panel" data-step="3">
            <div class="ob-h">
              <div class="ob-title">What do you listen to?</div>
              <div class="ob-sub">Pick a few — we'll personalise your feed.</div>
            </div>
            <div class="ob-body">
              <div class="genre-chips">
                ${genres.map(g => `<button class="chip" onclick="obToggleGenre(this,'${g.replace(/&amp;/g,'&').replace(/'/g,"\\'")}')">${g}</button>`).join('')}
              </div>
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
            <div class="ob-pinned" data-pinned="artists"></div>
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
            <div class="ob-pinned" data-pinned="albums"></div>
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

        <div class="ob-footer">
          <button class="ob-skip" onclick="obNext(true)">Skip</button>
          <button class="ob-next btn-primary" onclick="obNext()">Continue</button>
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

// Profile — "Funky" theme 01. The emboss base (main outline + info blob + social
// tab) + the profile picture and 5 favourite-album wells, in the 744×889 layout
// traced from Profile_Theme_01.svg. Eric's textured skin PNG
// (images/profile-skin-01.png) is laid OVER the base part (scaled+offset so its
// holes register on the pic/CD positions — see .prof-skin in app.css) for the
// grungy old-school look; it's pointer-events:none so the holes stay clickable.
// Home shell (header · v3-body · nowBar · bottomNav); username in the top gap;
// info blob carries the bio; social tab opens the social menu.
function profileHtml(light) {
  const P = window.PROFILE || {};
  const findAlb = name => (window.ARCHIVE || []).find(a => a.album === name);
  // Album-circle centres (r=55) as % of the 744×889 base canvas → bbox left/top.
  // The skin PNG is laid over this base, scaled+offset so its holes register on
  // these exact positions (see .prof-skin transform in app.css).
  const slots = [
    { l: 57.03, t: 64.54 }, { l: 70.23, t: 55.89 }, { l: 78.90, t: 44.03 },
    { l: 81.99, t: 30.58 }, { l: 79.30, t: 17.01 },
  ];
  const slotHtml = slots.map((s, i) => {
    const a = findAlb((P.favs || [])[i]);
    return `<button class="prof-alb${a ? '' : ' prof-alb--empty'}" style="left:${s.l}%;top:${s.t}%" onclick="openProfPicker(${i}, this)" title="Favourite ${i + 1}">
      ${a ? `<span class="prof-alb-img" style="background-image:url('${a.image}')"></span>` : `<span class="prof-alb-add">+</span>`}
    </button>`;
  }).join('');

  const socialRow = (id, label, brand, ico) =>
    `<button class="prof-soc-item" onclick="openSocial('${id}')">
      <span class="prof-soc-ico" style="background:${brand}">${ico}</span>${label}
      <span class="prof-soc-go">↗</span>
    </button>`;
  const igIco = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none"/></svg>`;
  const xIco  = `<svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M18.9 2H22l-7.6 8.7L23.3 22h-6.9l-5.4-7-6.2 7H1.7l8.1-9.3L1 2h7l4.9 6.5L18.9 2Zm-2.4 18h1.9L7.6 3.9H5.6L16.5 20Z"/></svg>`;
  const scIco = `<svg width="13" height="9" viewBox="0 0 24 16" fill="#fff"><rect x="2" y="7" width="1.8" height="6" rx=".9"/><rect x="6" y="4" width="1.8" height="9" rx=".9"/><rect x="10" y="6" width="1.8" height="7" rx=".9"/><rect x="14" y="2" width="1.8" height="11" rx=".9"/><rect x="18" y="8" width="1.8" height="5" rx=".9"/></svg>`;

  return `
      <div class="app-screen s-home-v3 s-prof2${light ? ' s-home-v3--light' : ''}">
        ${appHeader()}
        <div class="v3-body">
          <div class="prof2-scroll">
            <div class="prof2-userbar">
              <div class="prof2-id">
                <span class="prof2-name">${P.name || 'Your name'}</span>
                <span class="prof2-handle">@${P.handle || 'handle'}</span>
              </div>
              <button class="prof2-editbtn" title="Edit profile" onclick="event.stopPropagation()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
            </div>

            <div class="prof-canvas">
              <!-- Emboss base panel (main outline + info blob + social tab) -->
              <svg class="prof-base" viewBox="0 0 744 889" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <path d="M321 1.89282C448.526 1.89282 529.085 64.0207 567.481 112.844C580.295 129.138 602.061 137.867 621.409 130.732L622.328 130.38C654.33 117.69 691.63 128.852 706.925 159.694C731.258 208.759 743.727 259.317 743.727 322.893C743.727 494.15 641.241 644.691 517.824 706.877L516.84 707.365C475.469 727.531 428.178 708.031 400.693 670.918L400.043 670.031L382.222 645.506C371.109 630.213 352.274 622.794 333.436 624.372L331.101 624.56C132.87 639.921 0 491.01 0 322.893C0 145.609 143.717 1.89282 321 1.89282Z"/>
                <path d="M238.113 654.795C174.226 644.916 105.541 608.331 55.4474 558.286C41.0139 543.867 10.0794 553.733 10.0794 574.135V853.121C10.0794 872.451 25.7495 888.121 45.0794 888.121H390.908C407.461 888.121 421.751 876.525 425.159 860.326L439.579 791.767C442.053 780.007 439.108 767.758 431.559 758.407L364.784 675.693C356.103 664.939 342.49 659.576 328.681 660.152C299.511 661.37 265.762 659.071 238.113 654.795Z"/>
                <path d="M585.432 94.5524C562.377 66.0677 521.265 37.0414 492.888 17.8749C484.843 12.441 488.519 0.5 498.227 0.5H680.269C690.232 0.5 698.675 7.83187 700.072 17.6957L710.861 93.887C712.049 102.276 702.311 109.271 694.096 107.197C669.812 101.067 637.104 101.507 615.199 105.324C604.477 107.192 592.278 103.012 585.432 94.5524Z"/>
              </svg>

              <!-- Pic + CD covers sit under the skin; its holes reveal them -->
              <div class="prof-pic" style="background-image:url('${P.pic || ''}')"></div>
              ${slotHtml}

              <!-- Textured skin laid over the base, aligned to the holes -->
              <img class="prof-skin" src="images/profile-skin-01.png?v=1" alt="" aria-hidden="true" draggable="false">

              <div class="prof-fav-tag">favs</div>

              <button class="prof-social" onclick="toggleProfSocial(this)" aria-label="Social links">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              </button>
              <div class="wall2-menu prof-soc-menu" hidden>
                ${socialRow('instagram','Instagram','linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)', igIco)}
                ${socialRow('x','X · Twitter','#111', xIco)}
                ${socialRow('soundcloud','SoundCloud','linear-gradient(135deg,#ff5500,#ff8800)', scIco)}
              </div>

              <div class="prof-info">
                <div class="prof-bio">${P.bio || 'Tell people what you are into.'}</div>
              </div>
            </div>
          </div>
        </div>
        ${nowBar()}
        ${bottomNav('profile')}
      </div>`;
}

// Album wall (Trending) — themed so it can render as a dark + light pair.
function wallHtml(light) {
  const items = (window.ARCHIVE || []).slice().sort((a, b) => b.rating - a.rating);
  return `
      <div class="app-screen s-home-v3 s-wall2${light ? ' s-home-v3--light' : ''}">
        ${appHeader()}
        <div class="v3-body">
          <div class="wall2-scroll">
            <div class="wall2-bar">
              <button class="wall2-cat active" onclick="event.stopPropagation()">Popular</button>
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
              <div class="wall2-menuwrap wall2-menuwrap--right">
                <button class="wall2-cat wall2-drop-btn" onclick="event.stopPropagation(); toggleWallPanel(this)"><span class="wall2-time-label">Week</span> <span class="wall2-chev">▾</span></button>
                <div class="wall2-menu wall2-menu--time" hidden>
                  <button class="wall2-menu-item wall2-time-opt active" onclick="event.stopPropagation(); pickWallTime(this)">This Week</button>
                  <button class="wall2-menu-item wall2-time-opt" onclick="event.stopPropagation(); pickWallTime(this)">This Month</button>
                  <button class="wall2-menu-item wall2-time-opt" onclick="event.stopPropagation(); pickWallTime(this)">Past 3 Months</button>
                </div>
              </div>
            </div>
            <div class="wall2-grid">
              ${items.slice(0, 24).map((a, i) => `
              <div class="wall2-cell" onclick="openAlbumPage(ARCHIVE.find(x=>x.album==='${a.album.replace(/'/g, '\\\'')}')||ARCHIVE[0])">
                <div class="wall2-art" style="background-image:url('${a.image}')">${i < 3 ? `<span class="wall2-rank">${i + 1}</span>` : ''}</div>
                <div class="wall2-meta">
                  <span class="wall2-album">${a.album}</span>
                  <span class="wall2-artist">${a.artist}</span>
                </div>
                <div class="wall2-rating">${halfStars(a.rating, 11)}<span class="wall2-score">${a.rating.toFixed(1)}</span></div>
              </div>`).join('')}
            </div>
          </div>
        </div>
        ${nowBar()}
        ${bottomNav('wall')}
      </div>`;
}

// Song playlists — the shared data for the Lists tab and the playlist page.
// Each has ONE custom image (archive covers stand in for uploads), a free-form
// title, a creator, a track count and a favorites count. favs > 25 → "Popular"
// (--hl box + dog-ear, and the Popular category tab). Array order = chronological
// (most recently updated first) — that's the load-in order of the Lists tab.
// Custom playlists — memey user-typed titles (mixed case, stray symbols: they're
// personal, not editorial), custom cover art (images/playlist-*.jpg — Eric's own
// images, NOT album covers), and a last-edited stamp shown on the card by-line.
function plLists() {
  return [
    { name: 'desert island picks ✧',        creator: 'you',         tracks: 24, favs: 87,  plays: 12400, edited: '2h ago', image: 'images/playlist-cyano-birds.jpg' },
    { name: 'nite drives ~ no destination', creator: 'you',         tracks: 18, favs: 12,  plays: 2100,  edited: '1d ago', image: 'images/playlist-car-dash.jpg' },
    { name: '3am and raining',              creator: 'staticfog',   tracks: 31, favs: 24,  plays: 8900,  edited: '3d ago', image: 'images/playlist-misty-lake.jpg', staff: true },
    { name: 'gym but make it sad :(',       creator: 'echoplex',    tracks: 15, favs: 9,   plays: 1400,  edited: '4d ago', image: 'images/playlist-chrome-ooh.jpg' },
    { name: 'HEAVY ROTATION™',              creator: 'velvetblast', tracks: 42, favs: 138, plays: 31000, edited: '1w ago', image: 'images/playlist-city-red.jpg' },
    { name: 'sunday reset ✿',               creator: 'you',         tracks: 21, favs: 4,   plays: 800,   edited: '1w ago', image: 'images/playlist-wildflowers.jpg' },
    { name: 'first date jitters ♡',         creator: 'moonwire',    tracks: 13, favs: 18,  plays: 3200,  edited: '2w ago', image: 'images/playlist-hibiscus.jpg' },
    { name: 'crying in the club (derogatory)', creator: 'staticfog', tracks: 27, favs: 22, plays: 5600,  edited: '3w ago', image: 'images/playlist-statue-night.jpg' },
    { name: 'headphones on, world off.',    creator: 'echoplex',    tracks: 36, favs: 19,  plays: 7300,  edited: '1mo ago', image: 'images/playlist-ink-alley.jpg', staff: true },
    { name: 'songs my dad showed me',       creator: 'velvetblast', tracks: 17, favs: 21,  plays: 4100,  edited: '2mo ago', image: 'images/playlist-cyano-horse.jpg' },
  ];
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
  const listCard = l => {
    const tag = l.staff ? 'staff' : (l.favs > 25 ? 'fav' : '');   // staff pick wins the corner slot
    const tagTitle = l.staff ? 'Staff pick' : 'Community favorite — 25+ favorites';
    return `
              <div class="pl2-list-card${tag ? ' pl2-list-card--hl' : ''}" onclick="openPlaylistPage('${esc(l.name)}')">
                <div class="pl2-list-img" style="background-image:url('${l.image}')"></div>
                <div class="pl2-list-body">
                  <div class="pl2-list-name">${l.name}</div>
                  <div class="pl2-list-by">by <b>${l.creator}</b>${l.edited ? ` · edited ${l.edited}` : ''}</div>
                  <div class="pl2-list-meta">${l.tracks} songs · ♥ ${l.favs}</div>
                  ${tag ? `
                  <svg class="pl2-list-carve" viewBox="579.759 93.4336 106.904 63.2844" aria-hidden="true"><path fill="currentColor" d="M686.663 93.4336C686.663 98.6801 682.409 102.933 677.163 102.934H633.543C607.275 102.934 585.981 124.228 585.981 150.495C585.981 153.932 583.195 156.718 579.759 156.718H686.663V93.4336Z"/></svg>
                  <svg class="pl2-list-tag2 pl2-list-tag2--${tag}" viewBox="601.196 116.923 85.466 39.795"><title>${tagTitle}</title><path fill="currentColor" d="M636.958 116.923H666.764C677.753 116.923 686.662 125.831 686.662 136.821C686.662 147.81 677.753 156.718 666.764 156.718H605.229C603.002 156.718 601.196 154.912 601.196 152.685C601.196 132.934 617.207 116.923 636.958 116.923Z"/><g class="pl2-tag-ico" transform="translate(650 137.5) scale(0.9) translate(-12 -12)">${TAG_ICONS[tag]}</g></svg>` : ''}
                </div>
              </div>`;
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
              <button class="pl2-add" title="New playlist" aria-label="New playlist" onclick="event.stopPropagation()">
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
  // Deterministic tracklist: seeded pick of archive albums, one generated song each
  const rnd = seedRand(pl.name + '::pl');
  const songs = Array.from({ length: pl.tracks }, () => {
    const a = arch[Math.floor(rnd() * arch.length)] || arch[0];
    const t = songsFor(a);
    return { s: t[Math.floor(rnd() * t.length)], album: a };
  });
  // Ratings hover near 4.0 (±0.35), with 1–2 seeded outliers (a dud or a banger)
  const outliers = new Set();
  const oCount = Math.min(1 + Math.floor(rnd() * 2), songs.length);
  while (outliers.size < oCount) outliers.add(Math.floor(rnd() * songs.length));
  songs.forEach((row, i) => {
    let r = 4.0 + (rnd() - 0.5) * 0.7;
    if (outliers.has(i)) r = rnd() < 0.5 ? 2.4 + rnd() * 0.7 : 4.7 + rnd() * 0.25;
    row.rating = (Math.round(r * 10) / 10).toFixed(1);
  });
  // Majority genres — counted across the tracklist's albums, top 3 by share
  const gCount = new Map();
  songs.forEach(row => { const g = row.album.genre; if (g) gCount.set(g, (gCount.get(g) || 0) + 1); });
  const topGenres = [...gCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
  return `
      <div class="app-screen s-home-v3 s-plp${light ? ' s-home-v3--light' : ''}">
        ${appHeader()}
        <div class="v3-body">
          <div class="plp-scroll">
            <button class="plp-back-pill" onclick="navigate('playlists')" title="Back to Library">
              <span class="v3-ring plp-ring"><span class="v3-ring-spin"><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i><i class="v3-ring-dot"></i></span></span>
            </button>
            <div class="plp-hero${hot ? ' plp-hero--hl' : ''}">
              <div class="plp-hero-img" style="background-image:url('${pl.image}')"></div>
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
            <div class="plp-songs">
              ${songs.map((row, i) => `
              <div class="plp-song" onclick="event.stopPropagation(); plSongTap(this)" data-image="${row.album.image}" data-title="${row.s.title}" data-sub="${row.album.album}">
                <div class="plp-song-num">${i + 1}</div>
                <div class="plp-song-line"><span class="plp-song-title">${row.s.title}</span><span class="plp-song-album">${row.album.album}</span> · <span class="plp-song-artist">${row.album.artist}</span></div>
                <div class="plp-song-rate">${row.rating}</div>
                <div class="plp-song-dur">${row.s.dur}</div>
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
function bottomNav(active = 'home') {
  const on = id => active === id ? ' active' : '';
  return `
          <nav class="v3-bottom-nav">
            <div class="v3-nav-glass" aria-hidden="true"></div>
            <svg class="v3-nav-shape" viewBox="0 0 553 126" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M517.5 125H35.5C16.17 125 0.5 109.33 0.5 90V79.7942C0.5 60.4642 16.17 44.7942 35.5 44.7942L47.3137 44.7942C58.1862 44.7942 67 35.9803 67 25.1079C67 11.5173 78.0173 0.5 91.6079 0.5L460.892 0.500022C474.483 0.500023 485.5 11.5174 485.5 25.1079C485.5 35.9804 494.314 44.7942 505.186 44.7942H517.5C536.83 44.7942 552.5 60.4642 552.5 79.7942V90C552.5 109.33 536.83 125 517.5 125Z"/></svg>
            <div class="v3-nav-items">
              <button class="v3-nav-item${on('home')}" onclick="navigate('home')" title="Home"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/></svg></button>
              <button class="v3-nav-item${on('wall')}" onclick="navigate('wall')" title="Trending"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="2.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="16.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="2.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="16.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="2.5" y="16.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="16.5" width="5" height="5" rx="1.2"/><rect x="16.5" y="16.5" width="5" height="5" rx="1.2"/></svg></button>
              <button class="v3-nav-item${on('playlists')}" onclick="navigate('playlists')" title="Playlists"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg></button>
              <button class="v3-nav-item${on('profile')}" onclick="navigate('profile')" title="Profile"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
            </div>
          </nav>`;
}
