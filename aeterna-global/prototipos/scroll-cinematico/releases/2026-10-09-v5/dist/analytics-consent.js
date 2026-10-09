/* Aeterna analytics: basic consent mode, no Google requests before opt-in. */
(() => {
  'use strict';
  if (window.__aeternaConsentReady) return;
  window.__aeternaConsentReady = true;
  const ID = 'G-Z38KJGKPSV';
  const HOST = 'aeternaglobalstudio.com';
  const KEY = 'aeterna.analytics-consent.v1';
  const TTL = 180 * 24 * 60 * 60 * 1000;
  // Safety release gate: change only after Enhanced Measurement is confirmed OFF.
  const ENABLED = false;
  const PAGES = { '/': 'Aeterna Global', '/index.html': 'Aeterna Global', '/maternity-gold-coast/': 'Aeterna Global photography', '/maternity-gold-coast/index.html': 'Aeterna Global photography' };
  const eligible = location.protocol === 'https:' && location.hostname === HOST && Object.hasOwn(PAGES, location.pathname);
  let started = false;
  let decision = readChoice();
  window['ga-disable-' + ID] = true;
  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY));
      return value && ['accepted', 'rejected'].includes(value.choice) && Number.isFinite(value.at) && Date.now() >= value.at && Date.now() - value.at < TTL ? value.choice : null;
    } catch (_) { return null; }
  }
  function clearAnalyticsCookies() {
    for (const item of document.cookie.split(';')) {
      const name = item.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of ['', HOST, '.' + HOST]) {
        document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax' + (domain ? '; Domain=' + domain : '') + '; Secure';
      }
    }
  }
  function start() {
    if (!ENABLED || !eligible || decision !== 'accepted') return;
    window['ga-disable-' + ID] = false;
    if (started) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    const gtag = (...args) => window.dataLayer.push(args);
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('set', 'ads_data_redaction', true);
    gtag('set', 'url_passthrough', false);
    gtag('js', new Date());
    const cleanPath = location.pathname.replace(/index\.html$/, '');
    gtag('config', ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: HOST,
      cookie_path: '/',
      cookie_expires: 15552000,
      cookie_update: false,
      cookie_flags: 'SameSite=Lax;Secure',
      page_location: 'https://' + HOST + cleanPath,
      page_referrer: '',
      page_title: PAGES[location.pathname],
      campaign_id: '', campaign_source: '', campaign_medium: '', campaign_name: '', campaign_term: '', campaign_content: ''
    });
    gtag('event', 'page_view', { send_to: ID });
    const script = document.createElement('script');
    script.id = 'aeterna-google-tag';
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(script);
  }
  function choose(choice) {
    decision = choice;
    let saved = false;
    try { localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() })); saved = true; } catch (_) { /* Consent lasts for this page only if storage is unavailable. */ }
    panel.hidden = true;
    preferences.focus();
    if (choice === 'accepted') start();
    else {
      window['ga-disable-' + ID] = true;
      clearAnalyticsCookies();
      // Unload the already-loaded Google runtime on withdrawal. The saved rejection prevents reloading it.
      if (started && saved) location.reload();
    }
  }
  const panel = document.createElement('section');
  panel.id = 'aeterna-cookie-panel';
  panel.setAttribute('aria-label', 'Analytics preferences');
  panel.innerHTML = '<h2>Analytics, only with your permission.</h2><p>We use optional Google Analytics cookies to understand visits to our public pages. Google receives basic device and visit information. We do not send enquiry details, form entries or URL query strings. Your choice lasts for six months and you can change it below.</p><div class="aeterna-cookie-actions"><button type="button" data-choice="accepted">Accept analytics</button><button type="button" data-choice="rejected">Reject analytics</button></div><p class="aeterna-cookie-status" aria-live="polite"></p>';
  const preferences = document.createElement('button');
  preferences.type = 'button';
  preferences.id = 'aeterna-cookie-preferences';
  preferences.textContent = 'Cookie preferences';
  preferences.setAttribute('aria-controls', panel.id);
  preferences.addEventListener('click', () => {
    panel.hidden = false;
    panel.querySelector('.aeterna-cookie-status').textContent = !ENABLED || !eligible ? 'Analytics is currently inactive on this page.' : decision === 'accepted' ? 'Your current choice: analytics accepted.' : decision === 'rejected' ? 'Your current choice: analytics rejected.' : 'No analytics choice has been made.';
    panel.querySelector('button').focus();
  });
  panel.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => choose(button.dataset.choice)));
  document.body.appendChild(panel);
  document.body.appendChild(preferences);
  panel.hidden = decision !== null || !eligible || !ENABLED;
  if (!ENABLED || !eligible) panel.querySelector('.aeterna-cookie-status').textContent = 'Analytics is currently inactive on this page.';
  window.addEventListener('storage', event => {
    if (event.key !== KEY) return;
    decision = readChoice();
    if (decision !== 'accepted') {
      window['ga-disable-' + ID] = true;
      clearAnalyticsCookies();
      if (started) location.reload();
    } else start();
    panel.hidden = decision !== null || !eligible || !ENABLED;
  });
  if (decision !== 'accepted') clearAnalyticsCookies();
  start();
})();
