import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({ appType: 'custom', configFile: false, root,
  cacheDir: `${root}/.test-vite-cache`, resolve: { alias: { '@': root } },
  server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
after(() => vite.close());
const policy = await vite.ssrLoadModule('/lib/agro-analytics-policy.ts');

function harness({ url = 'https://venezuelaagro.com/', enabled = true, prior = null, withTransport = true } = {}) {
  let location = new URL(url);
  const values = new Map([['farm-data', 'keep'], ['unrelated-preference', 'keep']]);
  if (prior) values.set(policy.AGRO_ANALYTICS_CONSENT_KEY, JSON.stringify({ version: 1, choice: prior }));
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const cookies = new Map([['session', 'keep'], ['_ga_OTHER', 'keep'], ...policy.AGRO_ANALYTICS_COOKIE_NAMES.map(name => [name, 'owned'])]);
  const calls = [], starts = [], events = [];
  const environment = {
    location: () => location, storage: () => storage, cookies: () => [...cookies].map(([key, value]) => `${key}=${value}`).join('; '),
    writeCookie(value) { calls.push(['cookie', value]); cookies.delete(value.split('=')[0]); },
    setGoogleDisabled(value) { calls.push(['disable', value]); },
  };
  let factoryCalls = 0;
  const createTransport = () => {
    factoryCalls++;
    return {
      start(options) { starts.push(options); calls.push(['start']); },
      pageView(page) { events.push(page); calls.push(['event']); },
      stop() { calls.push(['stop']); },
    };
  };
  const controller = policy.createAgroAnalyticsController(environment, { enabled, createTransport: withTransport ? createTransport : undefined });
  return { controller, environment, storage, values, cookies, calls, starts, events, factoryCalls: () => factoryCalls,
    navigate(url) { location = new URL(url); } };
}

test('disabled release and absent transport never load or send, including a saved grant', () => {
  assert.equal(policy.AGRO_ANALYTICS_ENABLED, false);
  assert.equal(policy.AGRO_ANALYTICS_ID, 'G-LGQE3RP9DJ');
  for (const options of [{ enabled: false, prior: 'granted' }, { withTransport: false, prior: 'granted' }]) {
    const h = harness(options);
    assert.equal(h.controller.sync(), false);
    assert.deepEqual(h.controller.choose('granted'), { saved: true, active: false });
    assert.equal(h.factoryCalls(), 0);
    assert.equal(h.events.length, 0);
  }
});

test('basic consent: absence and refusal make zero transport calls, and explicit opt-in starts one canonical page view', () => {
  const h = harness();
  h.controller.sync();
  h.controller.choose('denied');
  h.controller.sync();
  assert.equal(h.factoryCalls(), 0);
  assert.deepEqual(h.controller.choose('granted'), { saved: true, active: true });
  assert.equal(h.factoryCalls(), 1);
  assert.deepEqual(h.events, [{ page_location: 'https://venezuelaagro.com/', page_path: '/', page_title: 'Venezuela Agro', page_referrer: '' }]);
  h.controller.sync();
  h.controller.choose('granted');
  assert.equal(h.events.length, 1, 'a repeated render or same-path sync cannot duplicate the view');
  assert.deepEqual(JSON.parse(h.values.get(policy.AGRO_ANALYTICS_CONSENT_KEY)), { version: 1, choice: 'granted' });
});

test('versioned browser preference restores; malformed, historical and tampered values never grant', () => {
  const h = harness({ prior: 'granted' });
  assert.equal(h.controller.sync(), true);
  for (const raw of ['true', 'null', '[]', '"granted"', '{', '{"version":0,"choice":"granted"}', '{"version":1,"choice":true}', '{"version":1,"choice":"granted","user_id":"private"}']) {
    h.values.set(policy.AGRO_ANALYTICS_CONSENT_KEY, raw);
    assert.equal(policy.readAgroAnalyticsConsent(h.storage), null, raw);
  }
  assert.equal(policy.readAgroAnalyticsConsent(null), null);
});

test('only exact HTTPS production host and section roots are eligible; previews and private/detail paths always fail closed', () => {
  const blocked = [
    'https://preview.chatgpt.com/', 'https://example.chatgpt.site/', 'https://venezuelaagro.com.evil.test/',
    'https://www.venezuelaagro.com/', 'http://venezuelaagro.com/', 'https://venezuelaagro.com:8443/',
    ...['/app', '/app/private', '/app-local', '/admin', '/api', '/api/media/id', '/signin-with-chatgpt',
      '/signout-with-chatgpt', '/callback', '/security', '/offline', '/biblioteca-local', '/marketplace/publicar',
      '/marketplace/secret-id', '/fincas/private-id', '/red/private-id', '/profesionales/alvaro-carrero',
      '/aprende/article', '/constructor', '/tienda/', '/tienda?email=private', '/?q=private', '/#coordinates',
      '/legal/privacidad', '/%74ienda', '//tienda'].map(path => `https://venezuelaagro.com${path}`),
  ];
  for (const url of blocked) {
    const h = harness({ url, prior: 'granted' });
    assert.equal(h.controller.sync(), false, url);
    assert.equal(h.factoryCalls(), 0, url);
    assert.equal(h.events.length, 0, url);
  }
  for (const path of Object.keys(policy.AGRO_ANALYTICS_PUBLIC_SECTIONS)) {
    assert.equal(policy.agroAnalyticsPage(new URL(`https://venezuelaagro.com${path}`)).page_path, path);
  }
});

test('payload contains only canonical public page fields and advertisements stay denied', () => {
  const h = harness({ url: 'https://venezuelaagro.com/tienda', prior: 'granted' });
  h.controller.sync();
  const start = h.starts[0];
  assert.equal(start.measurementId, 'G-LGQE3RP9DJ');
  assert.equal(start.defaultConsent.analytics_storage, 'denied');
  assert.equal(start.consent.analytics_storage, 'granted');
  for (const name of ['ad_storage', 'ad_user_data', 'ad_personalization', 'personalization_storage']) assert.equal(start.consent[name], 'denied');
  assert.equal(start.config.send_page_view, false);
  assert.equal(start.config.allow_google_signals, false);
  assert.equal(start.config.allow_ad_personalization_signals, false);
  assert.equal(start.config.page_referrer, '');
  assert.equal(start.config.cookie_domain, 'none');
  assert.deepEqual(Object.keys(h.events[0]).sort(), ['page_location', 'page_path', 'page_referrer', 'page_title']);
  assert.equal(h.events[0].page_title, 'Tienda | Venezuela Agro');
  assert.equal('user_id' in start.config, false);
});

test('revocation blocks pending work first, stops transport and removes only owned cookies; consent can be granted again', () => {
  const h = harness({ prior: 'granted' });
  h.controller.sync();
  const pending = h.starts[0].canSend;
  assert.equal(pending(), true);
  const before = h.calls.length;
  assert.deepEqual(h.controller.choose('denied'), { saved: true, active: false });
  assert.deepEqual(h.calls.slice(before, before + 2), [['disable', true], ['stop']]);
  assert.equal(pending(), false);
  assert.deepEqual([...h.cookies], [['session', 'keep'], ['_ga_OTHER', 'keep']]);
  assert.equal(h.values.get('farm-data'), 'keep');
  assert.equal(h.values.get('unrelated-preference'), 'keep');
  h.controller.sync();
  assert.equal(h.events.length, 1);
  h.controller.choose('granted');
  assert.equal(h.events.length, 2);
  assert.equal(pending(), false, 'old callbacks cannot revive after later consent');
});

test('private navigation, URL queries and cross-tab revocation invalidate callbacks even before the next React update', () => {
  for (const url of ['https://venezuelaagro.com/app-local', 'https://venezuelaagro.com/?email=private', 'https://preview.chatgpt.com/']) {
    const h = harness({ prior: 'granted' });
    h.controller.sync();
    h.navigate(url);
    assert.equal(h.starts[0].canSend(), false, url);
    assert.equal(h.controller.sync(), false, url);
    assert.equal(h.events.length, 1, url);
  }
  const h = harness({ prior: 'granted' });
  h.controller.sync();
  h.values.set(policy.AGRO_ANALYTICS_CONSENT_KEY, '{"version":1,"choice":"denied"}');
  assert.equal(h.starts[0].canSend(), false);
  h.controller.sync();
  assert.equal(h.events.length, 1);
  assert.equal(h.cookies.has(policy.AGRO_ANALYTICS_COOKIE_NAMES[0]), false);
});

test('public route changes refresh canonical context and cancel the previous page lifetime', () => {
  const h = harness({ prior: 'granted' });
  h.controller.sync();
  h.navigate('https://venezuelaagro.com/rubros');
  assert.equal(h.starts[0].canSend(), false);
  assert.equal(h.controller.sync(), true);
  assert.equal(h.starts[1].canSend(), true);
  assert.equal(h.events[1].page_path, '/rubros');
  h.controller.dispose();
  assert.equal(h.starts[1].canSend(), false);
  assert.equal(h.controller.sync(), false);
});

test('storage failures never grant; revocation shuts down even when persistence fails', () => {
  for (const failure of ['throw', 'ignore']) {
    const h = harness();
    h.storage.setItem = () => { if (failure === 'throw') throw new Error('QuotaExceededError'); };
    assert.deepEqual(h.controller.choose('granted'), { saved: false, active: false });
    assert.equal(h.factoryCalls(), 0);
  }
  const h = harness({ prior: 'granted' });
  h.controller.sync();
  h.storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.deepEqual(h.controller.choose('denied'), { saved: false, active: false });
  assert.equal(h.starts[0].canSend(), false);
  assert.equal(h.values.has(policy.AGRO_ANALYTICS_CONSENT_KEY), false);
  assert.equal(h.controller.sync(), false);
  const unreadable = harness();
  unreadable.environment.storage = () => { throw new Error('SecurityError'); };
  assert.doesNotThrow(() => unreadable.controller.sync());
  assert.equal(unreadable.factoryCalls(), 0);
});

test('late initialization cannot outlive revocation or unmount, and adapter failures fail closed', () => {
  const h = harness({ prior: 'granted' });
  h.controller.sync();
  h.controller.dispose();
  assert.equal(h.starts[0].canSend(), false);
  assert.equal(h.controller.choose('granted').active, false);
  const failed = policy.createAgroAnalyticsController(h.environment, { enabled: true, createTransport() { throw new Error('blocked'); } });
  assert.equal(failed.sync(), false);
  assert.equal(failed.sync(), false);
});

test('staged component is in normal document flow and cannot interfere with installation or ideas', async () => {
  const source = await readFile(new URL('../components/agro-analytics-consent.tsx', import.meta.url), 'utf8');
  assert.match(source, /if \(!enabled \|\| !createTransport \|\| !visible\) return null/);
  assert.match(source, /Retirar permiso/);
  assert.match(source, /Rechazar estadísticas/);
  assert.match(source, /Permitir estadísticas/);
  assert.match(source, /addEventListener\("storage"/);
  assert.doesNotMatch(source, /setTimeout|setInterval|Dialog|createPortal|\bfixed\b|\bsticky\b|autoFocus|fetch\(|sendBeacon|createElement\("script"/);
});

test('server rendering emits no consent panel, preload or external tag before browser checks', async () => {
  const { AgroAnalyticsConsent } = await vite.ssrLoadModule('/components/agro-analytics-consent.tsx');
  assert.equal(renderToStaticMarkup(React.createElement(AgroAnalyticsConsent)), '');
  assert.equal(renderToStaticMarkup(React.createElement(AgroAnalyticsConsent, { enabled: true, createTransport() { throw new Error('must not run during SSR'); } })), '');
});
