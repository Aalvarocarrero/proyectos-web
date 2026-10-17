import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({ appType: 'custom', configFile: false, root,
  cacheDir: `${root}/.test-vite-cache`, resolve: { alias: { '@': root } },
  server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
after(() => vite.close());
const policy = await vite.ssrLoadModule('/lib/agro-analytics-policy.ts');
const google = await vite.ssrLoadModule('/lib/agro-google-transport.ts');
const disableKey = `ga-disable-${policy.AGRO_ANALYTICS_ID}`;

// This fake DOM only records script URLs. It cannot fetch or execute remote JavaScript.
function harness({ url = 'https://venezuelaagro.com/', consent = null, enabled = true, verified = true } = {}) {
  const values = new Map([['farm-data', 'keep']]);
  const cookies = new Map([['session', 'keep'], ...policy.AGRO_ANALYTICS_COOKIE_NAMES.map(name => [name, 'owned'])]);
  if (consent) values.set(policy.AGRO_ANALYTICS_CONSENT_KEY, JSON.stringify({ version: 1, choice: consent }));
  const localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const window = { location: new URL(url), localStorage };
  const scripts = [], removed = [];
  const document = {
    get cookie() { return [...cookies].map(([key, value]) => `${key}=${value}`).join('; '); },
    set cookie(value) { cookies.delete(value.split('=')[0]); },
    getElementById(id) { return scripts.find(script => script.id === id && !removed.includes(script)) ?? null; },
    createElement(tag) {
      assert.equal(tag, 'script');
      return { onload: null, onerror: null, remove() { removed.push(this); } };
    },
    head: { appendChild(script) { scripts.push(script); } },
  };
  let browserCalls = 0;
  const factory = google.createAgroGoogleTransportFactory({ enabled, enhancedMeasurementOffVerified: verified, browser() { browserCalls++; return { window, document }; } });
  const environment = { location: () => window.location, storage: () => localStorage,
    cookies: () => document.cookie, writeCookie: value => { document.cookie = value; },
    setGoogleDisabled: value => { window[disableKey] = value; } };
  const controller = policy.createAgroAnalyticsController(environment, { enabled: true, createTransport: factory });
  return { window, document, values, cookies, scripts, removed, factory, controller, browserCalls: () => browserCalls,
    commands: () => (window[google.AGRO_GOOGLE_LAYER] ?? []).map(args => Array.from(args)),
    navigate(url) { window.location = new URL(url); },
    load(index = scripts.length - 1) { scripts[index].onload?.(); } };
}

test('release and verified-enhanced-measurement gates default off and prevent script creation', () => {
  assert.equal(policy.AGRO_ANALYTICS_ENABLED, false);
  assert.equal(google.AGRO_ENHANCED_MEASUREMENT_OFF_VERIFIED, false);
  for (const options of [{ enabled: false, verified: true }, { enabled: true, verified: false }, { enabled: false, verified: false }]) {
    const h = harness({ ...options, consent: 'granted' });
    assert.equal(h.controller.sync(), false);
    assert.equal(h.scripts.length, 0);
    assert.equal(h.browserCalls(), 0);
  }
});

test('script is requested only after opt-in; manual page view waits for mocked load', () => {
  const h = harness();
  h.controller.sync();
  h.controller.choose('denied');
  assert.equal(h.scripts.length, 0);
  h.controller.choose('granted');
  assert.equal(h.scripts.length, 1);
  assert.equal(h.scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=G-LGQE3RP9DJ&l=${google.AGRO_GOOGLE_LAYER}`);
  assert.equal(h.scripts[0].referrerPolicy, 'no-referrer');
  assert.equal(h.scripts[0].async, true);
  assert.equal(h.window[disableKey], true, 'a pending tag stays disabled');
  assert.equal(h.commands().filter(command => command[0] === 'event').length, 0);
  assert.deepEqual(h.commands()[0], ['consent', 'default', policy.AGRO_ANALYTICS_DENIED_CONSENT]);
  h.load();
  assert.equal(h.window[disableKey], false);
  const events = h.commands().filter(command => command[0] === 'event');
  assert.deepEqual(events, [['event', 'page_view', {
    page_location: 'https://venezuelaagro.com/', page_path: '/', page_title: 'Venezuela Agro', page_referrer: '', send_to: 'G-LGQE3RP9DJ',
  }]]);
  h.controller.choose('granted');
  h.controller.sync();
  assert.equal(h.commands().filter(command => command[0] === 'event').length, 1);
});

test('global and stream configuration enforce fixed context, manual page views, denied Ads and prefixed host-only cookies', () => {
  const h = harness({ consent: 'granted', url: 'https://venezuelaagro.com/tienda' });
  h.controller.sync();
  h.load();
  const commands = h.commands();
  const config = commands.find(command => command[0] === 'config');
  assert.equal(config[1], 'G-LGQE3RP9DJ');
  assert.equal(config[2].send_page_view, false);
  assert.equal(config[2].allow_google_signals, false);
  assert.equal(config[2].allow_ad_personalization_signals, false);
  assert.equal(config[2].page_referrer, '');
  assert.equal(config[2].page_location, 'https://venezuelaagro.com/tienda');
  assert.equal(config[2].page_title, 'Tienda | Venezuela Agro');
  assert.equal(config[2].cookie_prefix, 'vagro_ga4');
  assert.equal(config[2].cookie_domain, 'none');
  assert.equal('user_id' in config[2], false);
  const granted = commands.find(command => command[0] === 'consent' && command[1] === 'update');
  for (const key of ['ad_storage', 'ad_user_data', 'ad_personalization']) assert.equal(granted[2][key], 'denied');
  assert.ok(commands.filter(command => command[0] === 'set').every(command => command[1].url_passthrough === false && command[1].ads_data_redaction === true));
});

test('all excluded hosts, private/detail pages, queries and hashes make zero Google script requests', () => {
  for (const url of ['https://preview.chatgpt.com/', 'https://venezuelaagro.com/app', 'https://venezuelaagro.com/app-local',
    'https://venezuelaagro.com/fincas/identifier', 'https://venezuelaagro.com/tienda?q=private',
    'https://venezuelaagro.com/#coordinates', 'https://venezuelaagro.com/api/sync', 'https://venezuelaagro.com/signin-with-chatgpt']) {
    const h = harness({ consent: 'granted', url });
    assert.equal(h.controller.sync(), false, url);
    assert.equal(h.scripts.length, 0, url);
  }
});

test('live Google disable flag blocks automatic sends immediately when URL or stored consent changes', () => {
  for (const url of ['https://venezuelaagro.com/app-local', 'https://venezuelaagro.com/tienda?search=private', 'https://venezuelaagro.com/fincas/private']) {
    const h = harness({ consent: 'granted' });
    h.controller.sync(); h.load();
    assert.equal(h.window[disableKey], false);
    h.navigate(url);
    assert.equal(h.window[disableKey], true, 'no React update is needed to activate the opt-out flag');
    h.window[disableKey] = false;
    assert.equal(h.window[disableKey], true, 'a flag assignment cannot bypass the live URL guard');
  }
  const h = harness({ consent: 'granted' });
  h.controller.sync(); h.load();
  h.values.set(policy.AGRO_ANALYTICS_CONSENT_KEY, '{"version":1,"choice":"denied"}');
  assert.equal(h.window[disableKey], true, 'cross-tab choice is read before a storage event arrives');
});

test('revocation disables first, denies consent, discards app queue, removes only owned script and cookies', () => {
  const h = harness({ consent: 'granted' });
  h.controller.sync(); h.load();
  h.controller.choose('denied');
  assert.equal(h.window[disableKey], true);
  assert.deepEqual(h.commands(), [['consent', 'update', policy.AGRO_ANALYTICS_DENIED_CONSENT]]);
  assert.deepEqual(h.removed, [h.scripts[0]]);
  assert.deepEqual([...h.cookies], [['session', 'keep']]);
  assert.equal(h.values.get('farm-data'), 'keep');
  assert.equal(h.scripts[0].onload, null);
  h.controller.sync();
  assert.equal(h.scripts.length, 1);
});

test('revocation or private navigation during load prevents late configuration and queued views', () => {
  for (const revoke of [true, false]) {
    const h = harness({ consent: 'granted' });
    h.controller.sync();
    const late = h.scripts[0].onload;
    if (revoke) h.controller.choose('denied');
    else h.navigate('https://venezuelaagro.com/app-local');
    late();
    assert.equal(h.window[disableKey], true);
    assert.equal(h.commands().some(command => command[0] === 'config' || command[0] === 'event'), false);
    assert.equal(h.removed.length, 1);
  }
});

test('interrupted script load cannot silently retry in the same document; a new document is required', () => {
  const h = harness({ consent: 'granted' });
  h.controller.sync();
  h.scripts[0].onerror();
  assert.equal(h.window[disableKey], true);
  h.controller.choose('denied');
  assert.equal(h.controller.choose('granted').active, false);
  assert.equal(h.scripts.length, 1);
  const reloaded = harness({ consent: 'granted' });
  reloaded.controller.sync(); reloaded.load();
  assert.equal(reloaded.window[disableKey], false);
});

test('loaded Google runtime is reused across approved public navigation without reloading or clearing session cookies', () => {
  const h = harness({ consent: 'granted' });
  h.controller.sync(); h.load();
  h.navigate('https://venezuelaagro.com/rubros');
  assert.equal(h.window[disableKey], true);
  h.controller.sync();
  assert.equal(h.window[disableKey], false);
  assert.equal(h.scripts.length, 1);
  assert.ok(h.cookies.has(policy.AGRO_ANALYTICS_COOKIE_NAMES[0]));
  const event = h.commands().find(command => command[0] === 'event');
  assert.equal(event[2].page_path, '/rubros');
  assert.equal(event[2].page_title, 'Rubros | Venezuela Agro');
  assert.equal(event[2].page_referrer, '');
});

test('another pre-existing Google integration is not adopted or overwritten', () => {
  const h = harness({ consent: 'granted' });
  const existing = () => {};
  h.window.gtag = existing;
  assert.equal(h.controller.sync(), false);
  assert.equal(h.window.gtag, existing);
  assert.equal(h.scripts.length, 0);
});

test('stale adapter stop cannot disable a newer page lifetime and direct fake payloads cannot add private fields', () => {
  const h = harness({ consent: 'granted' });
  const first = h.factory();
  const options = { measurementId: 'G-LGQE3RP9DJ', page: policy.agroAnalyticsPage(h.window.location), canSend: () => true };
  first.start(options); h.load(); first.stop();
  const second = h.factory();
  second.start(options);
  first.stop();
  assert.equal(h.window[disableKey], false);
  second.pageView({ page_path: '/', page_title: 'private identity', page_location: 'https://venezuelaagro.com/app?email=secret', email: 'secret', coordinates: [1, 2] });
  const payload = h.commands().find(command => command[0] === 'event')[2];
  assert.equal(payload.page_title, 'Venezuela Agro');
  assert.equal(payload.page_location, 'https://venezuelaagro.com/');
  assert.equal('email' in payload, false);
  assert.equal('coordinates' in payload, false);
});
