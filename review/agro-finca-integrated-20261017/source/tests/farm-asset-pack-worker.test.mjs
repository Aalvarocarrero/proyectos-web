import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash, webcrypto } from 'node:crypto';
import vm from 'node:vm';

const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const assets = [
  { path: '/farm-3d/v1/new-species-20.glb', data: Buffer.from('generic public model fixture') },
  { path: '/farm-3d/v1/grass-test.webp', data: Buffer.from('generic public texture fixture') },
];
const fixture = () => ({
  version: 1, totalBytes: assets.reduce((total, item) => total + item.data.length, 0),
  assets: assets.map(item => ({ path: item.path, bytes: item.data.length, sha256: digest(item.data), creator: 'Fixture', license: 'CC0', source: 'https://example.test/model', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' })),
  notices: ['/licenses/ez-tree.txt', '/licenses/ez-tree-textures.md'],
});

function worker() {
  const events = {}, stores = new Map(), requests = [];
  const key = path => new URL(typeof path === 'string' ? path : path.url, 'https://farm.test').href;
  const caches = {
    open: async name => {
      if (!stores.has(name)) stores.set(name, new Map());
      const data = stores.get(name);
      return {
        put: async (path, response) => { data.set(key(path), response.clone()); },
        match: async path => data.get(key(path))?.clone(),
        delete: async path => data.delete(key(path)),
      };
    },
    keys: async () => [...stores.keys()],
    delete: async name => stores.delete(name),
  };
  let manifest = fixture(), online = true, hook = null;
  const context = {
    self: { location: { origin: 'https://farm.test' }, addEventListener(type, fn) { (events[type] ??= []).push(fn); }, skipWaiting: async () => {}, clients: { claim: async () => {} } },
    caches, URL, Response, AbortController, setTimeout, clearTimeout, crypto: webcrypto, TextDecoder, TextEncoder,
    async fetch(input, options = {}) {
      const path = new URL(typeof input === 'string' ? input : input.url, 'https://farm.test').pathname;
      requests.push({ path, options });
      if (!online) throw new Error('Offline');
      if (hook) { const reply = await hook(path, options); if (reply) return reply; }
      if (path === '/farm-3d/manifest.json') return new Response(JSON.stringify(manifest));
      if (path === '/offline-assets.json') return new Response(JSON.stringify({ revision: 'morochos-v18', assets: ['/assets/app.js'] }));
      return new Response(assets.find(item => item.path === path)?.data ?? 'Public fixture');
    },
  };
  vm.runInNewContext(source, context);
  function send(type, requestId = 'attempt-1') {
    const waits = [], messages = [];
    for (const listener of events.message) listener({ data: { type, requestId }, ports: [{ postMessage: value => messages.push(value) }], waitUntil: promise => waits.push(promise) });
    return { messages, done: Promise.all(waits).then(() => messages.at(-1)?.status) };
  }
  async function install() { const waits = []; for (const listener of events.install) listener({ waitUntil: promise => waits.push(promise) }); await Promise.all(waits); }
  async function request(path) { let result; for (const listener of events.fetch) listener({ request: { url: new URL(path, 'https://farm.test').href, method: 'GET', mode: 'cors', destination: '' }, respondWith: value => { result = value; } }); return result; }
  function committed() { return [...stores].filter(([name, data]) => name.startsWith('morochos-farm-pack-v1-') && data.has(key('/farm-3d/pack-ready'))); }
  return { install, requests, stores, key, send, request, committed, fetchPackResource: path => context.farmFetch(path, 1024, new AbortController().signal), setManifest(value) { manifest = value; }, setOnline(value) { online = value; }, setHook(value) { hook = value; } };
}
const tick = () => new Promise(resolve => setImmediate(resolve));
// Crypto/body work can outlive hundreds of immediate turns under parallel load.
// Bound readiness by elapsed time, rather than the machine's event-loop speed.
async function until(predicate) { const deadline = performance.now() + 5000; while (performance.now() < deadline) { if (predicate()) return; await new Promise(resolve => setTimeout(resolve, 1)); } throw new Error('Fixture did not reach expected condition within 5 seconds'); }

test('install does not preload 3D files; download discovers all assets, counts checked bytes and saves notices', async () => {
  const w = worker(); await w.install();
  assert.equal(w.requests.some(item => /^\/farm-3d\/v1\//.test(item.path)), false);
  w.requests.length = 0;
  const job = w.send('PREPARE_FARM_ASSETS');
  const status = await job.done;
  assert.equal(status.ready, true); assert.equal(status.phase, 'ready');
  assert.equal(status.totalFiles, assets.length); assert.equal(status.completedFiles, assets.length);
  assert.equal(status.completedBytes, fixture().totalBytes); assert.equal(status.totalBytes, fixture().totalBytes);
  assert.equal(status.licensesReady, true); assert.match(status.version, /^[0-9a-f]{64}$/);
  assert.ok(job.messages.some(message => message.status.phase === 'downloading' && message.status.completedFiles === 1));
  assert.ok(job.messages.some(message => message.status.phase === 'verifying'));
  const data = w.committed()[0][1];
  for (const path of [...assets.map(item => item.path), ...fixture().notices, '/farm-3d/manifest.json']) assert.ok(data.has(w.key(path)), path);
  for (const request of w.requests) { assert.equal(request.options.credentials, 'same-origin'); assert.equal(request.options.redirect, 'error'); assert.ok(!request.path.startsWith('/api/')); }
});

test('ready is derived from cached index, manifest, every hash and app shell without any network call', async () => {
  const w = worker(); await w.install(); await w.send('PREPARE_FARM_ASSETS').done;
  w.requests.length = 0; w.setOnline(false);
  assert.equal((await w.send('FARM_ASSETS_STATUS').done).ready, true);
  assert.equal(w.requests.length, 0);
  for (const asset of assets) assert.deepEqual(Buffer.from(await (await w.request(asset.path)).arrayBuffer()), asset.data);
  assert.equal((await (await w.request('/farm-3d/manifest.json')).json()).assets.length, assets.length);
  assert.equal(await (await w.request('/licenses/ez-tree.txt')).text(), 'Public fixture');
  assert.equal(w.requests.length, 0, 'completed packs serve models, textures, provenance and licenses offline');
  w.committed()[0][1].delete(w.key(assets[0].path));
  assert.equal((await w.send('FARM_ASSETS_STATUS').done).ready, false, 'an evicted model cannot leave a false ready marker');
});

test('corrupted asset, missing notice, modified manifest and missing code invalidate local readiness', async () => {
  for (const kind of ['asset', 'notice', 'manifest', 'shell']) {
    const w = worker(); await w.install(); await w.send('PREPARE_FARM_ASSETS').done;
    const data = w.committed()[0][1];
    if (kind === 'asset') data.set(w.key(assets[0].path), new Response(Buffer.alloc(assets[0].data.length)));
    if (kind === 'notice') data.delete(w.key('/licenses/ez-tree.txt'));
    if (kind === 'manifest') data.set(w.key('/farm-3d/manifest.json'), new Response('{}'));
    if (kind === 'shell') w.stores.get('morochos-v18-static').delete(w.key('/assets/app.js'));
    assert.equal((await w.send('FARM_ASSETS_STATUS').done).ready, false, kind);
  }
});

test('invalid file hashes and byte lengths never commit and preserve the prior complete pack', async () => {
  for (const response of [Buffer.alloc(assets[0].data.length), Buffer.from('too short'), Buffer.alloc(assets[0].data.length + 1)]) {
    const w = worker(); await w.install(); await w.send('PREPARE_FARM_ASSETS').done;
    const previous = w.committed()[0][0];
    w.setHook(path => path === assets[0].path ? new Response(response) : null);
    const result = await w.send('PREPARE_FARM_ASSETS', 'bad-retry').done;
    assert.equal(result.phase, 'error'); assert.equal(result.ready, true, 'previous verified copy is retained');
    assert.equal(w.committed().length, 1); assert.equal(w.committed()[0][0], previous);
    assert.equal([...w.stores.keys()].filter(name => name.startsWith('morochos-farm-pack-v1-')).length, 1, 'failed stage removed');
  }
});

test('manifest rejects private/API/external/query/traversal paths, arbitrary licenses and duplicate files before fetching them', async () => {
  for (const path of ['/api/private.glb', '/farm-3d/v1/../../api/private.glb', 'https://other.test/cow.glb', '//other.test/cow.glb', '/farm-3d/v1/cow.glb?private=1', '/farm-3d/v1/cow%2eglb']) {
    const w = worker(); await w.install(); const manifest = fixture(); manifest.assets[0].path = path; w.setManifest(manifest); w.requests.length = 0;
    assert.equal((await w.send('PREPARE_FARM_ASSETS').done).ready, false, path);
    assert.equal(w.requests.some(item => item.path === path), false, path); assert.equal(w.committed().length, 0);
  }
  for (const mutate of [manifest => { manifest.notices.push('/api/private.txt'); }, manifest => { manifest.assets.push(manifest.assets[0]); manifest.totalBytes += manifest.assets[0].bytes; }, manifest => { manifest.assets[0].bytes = 1.2; }, manifest => { manifest.assets[0].license = ''; }]) {
    const w = worker(); await w.install(); const manifest = fixture(); mutate(manifest); w.setManifest(manifest);
    assert.equal((await w.send('PREPARE_FARM_ASSETS').done).ready, false); assert.equal(w.committed().length, 0);
  }
});

test('cancellation removes stage, preserves old pack and cannot cancel a later attempt using an old request ID', async () => {
  const w = worker(); await w.install(); await w.send('PREPARE_FARM_ASSETS', 'old-good').done;
  const prior = w.committed()[0][0]; let started = false;
  w.setHook((path, options) => {
    if (path !== assets[0].path) return null;
    started = true;
    return new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true }));
  });
  const cancelled = w.send('PREPARE_FARM_ASSETS', 'cancel-this'); await until(() => started);
  w.send('CANCEL_FARM_ASSETS', 'cancel-this');
  assert.equal((await cancelled.done).phase, 'cancelled'); assert.equal(w.committed()[0][0], prior);
  w.setHook(null); const retry = w.send('PREPARE_FARM_ASSETS', 'new-retry'); w.send('CANCEL_FARM_ASSETS', 'cancel-this');
  assert.equal((await retry.done).ready, true); assert.equal(w.committed().length, 1); assert.notEqual(w.committed()[0][0], prior);
});

test('a stage is never served or reported ready and simultaneous downloads share one download', async () => {
  const w = worker(); await w.install(); let release, started = false;
  w.setHook(path => path === assets[0].path ? (started = true, new Promise(resolve => { release = () => resolve(new Response(assets[0].data)); })) : null);
  const first = w.send('PREPARE_FARM_ASSETS', 'first'); await until(() => started);
  const second = w.send('PREPARE_FARM_ASSETS', 'second');
  assert.equal((await w.send('FARM_ASSETS_STATUS').done).ready, false); assert.equal(w.committed().length, 0);
  assert.equal(w.requests.filter(item => item.path === assets[0].path).length, 1);
  release(); assert.equal((await first.done).ready, true); assert.equal((await second.done).ready, true);
  assert.equal(w.requests.filter(item => item.path === assets[0].path).length, 1);
});

test('changed manifest or deployment during download prevents publishing a mixed version', async () => {
  for (const kind of ['manifest', 'deployment']) {
    const w = worker(); await w.install(); let manifestReads = 0, deploymentReads = 0;
    w.setHook(path => {
      if (path === '/farm-3d/manifest.json' && ++manifestReads === 2 && kind === 'manifest') return new Response(JSON.stringify({ ...fixture(), notice: 'Changed deployment' }));
      if (path === '/offline-assets.json' && ++deploymentReads === 2 && kind === 'deployment') return new Response(JSON.stringify({ revision: 'morochos-v19', assets: ['/assets/app.js'] }));
      return null;
    });
    const result = await w.send('PREPARE_FARM_ASSETS').done;
    assert.equal(result.ready, false); assert.match(result.error, /versión cambió/); assert.equal(w.committed().length, 0);
  }
});

test('no-store, redirected and unavailable resources cannot produce a ready pack', async () => {
  for (const mode of ['no-store', 'redirected', 'unavailable']) {
    const w = worker(); await w.install();
    w.setHook(path => {
      if (path !== assets[0].path) return null;
      const response = new Response(assets[0].data, mode === 'unavailable' ? { status: 503 } : { headers: mode === 'no-store' ? { 'cache-control': 'private, no-store' } : {} });
      if (mode === 'redirected') Object.defineProperty(response, 'redirected', { value: true });
      return response;
    });
    assert.equal((await w.send('PREPARE_FARM_ASSETS').done).ready, false); assert.equal(w.committed().length, 0);
  }
});

test('old deployment pack is not claimed ready by a newer application shell', async () => {
  const w = worker(); await w.install(); await w.send('PREPARE_FARM_ASSETS').done;
  const data = w.committed()[0][1], marker = await data.get(w.key('/farm-3d/pack-ready')).json();
  marker.deployment = 'morochos-v17'; data.set(w.key('/farm-3d/pack-ready'), new Response(JSON.stringify(marker)));
  assert.equal((await w.send('FARM_ASSETS_STATUS').done).ready, false);
});

test('retry clicked immediately after cancellation waits for discarded stage and starts a fresh attempt', async () => {
  const w = worker(); await w.install(); let started = false, rejected = false;
  w.setHook((path, options) => {
    if (path !== assets[0].path || rejected) return null;
    started = true;
    return new Promise((resolve, reject) => options.signal.addEventListener('abort', () => {
      rejected = true;
      setTimeout(() => reject(new Error('Delayed cancellation acknowledgement')), 5);
    }, { once: true }));
  });
  const first = w.send('PREPARE_FARM_ASSETS', 'first'); await until(() => started);
  w.send('CANCEL_FARM_ASSETS', 'first');
  const immediateRetry = w.send('PREPARE_FARM_ASSETS', 'immediate-retry');
  assert.equal((await first.done).phase, 'cancelled'); assert.equal((await immediateRetry.done).ready, true);
  assert.equal(w.committed().length, 1);
});

test('currently shipped asset manifest downloads and serves every real file with exact bytes offline', async () => {
  const root = new URL('../public', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('./farm-3d/manifest.json', root.href + '/'), 'utf8'));
  const w = worker(); await w.install(); w.setManifest(manifest);
  w.setHook(async path => {
    if (!manifest.assets.some(asset => asset.path === path) && !manifest.notices.includes(path)) return null;
    return new Response(await readFile(new URL('.' + path, root.href + '/')));
  });
  const result = await w.send('PREPARE_FARM_ASSETS').done;
  assert.equal(result.ready, true); assert.equal(result.totalFiles, manifest.assets.length);
  assert.equal(result.completedBytes, manifest.totalBytes);
  w.requests.length = 0; w.setOnline(false);
  assert.equal((await w.send('FARM_ASSETS_STATUS').done).ready, true);
  const responses = await Promise.all(manifest.assets.map(asset => w.request(asset.path)));
  for (let index = 0; index < responses.length; index++) {
    const bytes = Buffer.from(await responses[index].arrayBuffer());
    assert.equal(bytes.length, manifest.assets[index].bytes); assert.equal(digest(bytes), manifest.assets[index].sha256);
  }
  assert.equal(w.requests.length, 0);
});

test('private Site access gate receives same-origin credentials for fixed generic files, without allowing external or private URLs', async () => {
  const w = worker(); await w.install(); let gatedRequests = 0;
  w.setHook((path, options) => {
    if (path !== '/offline-assets.json' && path !== '/farm-3d/manifest.json' && !fixture().notices.includes(path) && !assets.some(asset => asset.path === path)) return null;
    gatedRequests++;
    // A private hosting gateway can require the existing access cookie on static files.
    if (options.credentials !== 'same-origin') throw new TypeError('Redirect to private Site access gate');
    assert.equal(options.redirect, 'error');
    return null;
  });
  const result = await w.send('PREPARE_FARM_ASSETS').done;
  assert.equal(result.ready, true); assert.ok(gatedRequests >= assets.length + 4);
});

test('early HTTP, cache-policy, origin, invalid JSON and fetch failures identify the public resource and deployed worker', async () => {
  const scenarios = [
    ['http', () => new Response('Access denied', { status: 401 }), /HTTP 401/],
    ['cache_policy', () => new Response('{}', { headers: { 'cache-control': 'private, no-store' } }), /servidor no permite guardar/],
    ['origin', () => { const reply = new Response('{}'); Object.defineProperty(reply, 'url', { value: 'https://outside.test/login' }); return reply; }, /redirección/],
    ['invalid_json', () => new Response('<html>Private Site access</html>', { headers: { 'content-type': 'text/html' } }), /manifiesto válido/],
    ['network_or_redirect', () => { throw new TypeError('Failed to fetch'); }, /acceso al sitio/],
  ];
  for (const [code, response, message] of scenarios) {
    const w = worker(); await w.install();
    w.setHook(path => path === '/offline-assets.json' ? response() : null);
    const result = await w.send('PREPARE_FARM_ASSETS').done;
    assert.equal(result.ready, false); assert.equal(result.phase, 'error'); assert.equal(result.diagnostic.code, code);
    assert.equal(result.diagnostic.path, '/offline-assets.json'); assert.equal(result.diagnostic.deployment, 'morochos-v18');
    assert.equal(result.diagnostic.phase, 'checking'); assert.match(result.error, message); assert.ok(result.error.includes('/offline-assets.json'));
    assert.equal(w.committed().length, 0);
  }
});

test('private cache directive allows verified generic files in this browser, but no-store still refuses them', async () => {
  for (const [directive, expected] of [['private, max-age=0', true], ['private, no-store', false], ['No-Store', false]]) {
    const w = worker(); await w.install();
    w.setHook(path => {
      const item = assets.find(asset => asset.path === path);
      return item ? new Response(item.data, { headers: { 'cache-control': directive } }) : null;
    });
    const result = await w.send('PREPARE_FARM_ASSETS').done;
    assert.equal(result.ready, expected, directive);
    if (!expected) { assert.equal(result.diagnostic.code, 'cache_policy'); assert.equal(w.committed().length, 0); }
  }
});

test('farm fetch entrypoint itself rejects private, API, external and unlisted paths before sending any request', async () => {
  const w = worker();
  for (const path of ['/api/private.glb', '/app', '/private/farm.json', 'https://outside.test/cow.glb', '//outside.test/cow.glb', '/farm-3d/v1/cow.glb?owner=private', '/licenses/unlisted.txt']) {
    await assert.rejects(w.fetchPackResource(path), /invalid_path/);
  }
  assert.equal(w.requests.length, 0);
});
