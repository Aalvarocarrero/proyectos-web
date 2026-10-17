import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({ appType: 'custom', configFile: false, root, resolve: { alias: { '@': root } }, server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
const lib = await vite.ssrLoadModule('/lib/farm-asset-pack.ts');
const originals = Object.fromEntries(['navigator', 'MessageChannel', 'setTimeout', 'clearTimeout'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const channels = []; let timeout;
class Channel {
  constructor() {
    this.port1 = { closed: false, onmessage: null, close() { this.closed = true; } };
    this.port2 = { postMessage: value => { if (!this.port1.closed) this.port1.onmessage?.({ data: value }); } };
    channels.push(this);
  }
}
Object.defineProperty(globalThis, 'MessageChannel', { value: Channel, configurable: true });
const realTimer = globalThis.setTimeout;
globalThis.setTimeout = (callback, ms, ...rest) => ms === 240000 || ms === 30000 ? (timeout = callback, 98765432) : realTimer(callback, ms, ...rest);
after(async () => { for (const [key, value] of Object.entries(originals)) { if (value) Object.defineProperty(globalThis, key, value); else delete globalThis[key]; } await vite.close(); });
let posts = [], registration;
function setup() {
  posts = [];
  registration = { active: { postMessage: (data, ports) => posts.push({ data, port: ports?.[0] }) } };
  Object.defineProperty(globalThis, 'navigator', { value: { serviceWorker: { getRegistration: async () => registration } }, configurable: true });
}
const tick = () => new Promise(resolve => setImmediate(resolve));

test('local status reads use only the worker and never start a download', async () => {
  setup(); const job = lib.getFarmAssetPackStatus(); await tick();
  assert.equal(posts[0].data.type, 'FARM_ASSETS_STATUS');
  posts[0].port.postMessage({ type: 'FARM_ASSETS_RESULT', status: { ready: true, phase: 'ready', version: 'version' } });
  assert.equal((await job).ready, true); assert.equal(channels.at(-1).port1.closed, true);
});

test('progress does not resolve the promise; only a final verified worker result does', async () => {
  setup(); let finished = false; const seen = [];
  const job = lib.downloadFarmAssetPack(status => seen.push(status)).then(result => (finished = true, result)); await tick();
  posts[0].port.postMessage({ type: 'FARM_ASSETS_PROGRESS', status: { ready: false, phase: 'downloading', completedFiles: 2, totalFiles: 10 } }); await tick();
  assert.equal(finished, false); assert.equal(seen[0].completedFiles, 2);
  posts[0].port.postMessage({ type: 'FARM_ASSETS_RESULT', status: { ready: true, phase: 'ready' } });
  assert.equal((await job).ready, true);
});

test('already-aborted and cancelled registration cannot start a download', async () => {
  setup(); const controller = new AbortController(); controller.abort();
  assert.equal((await lib.downloadFarmAssetPack(undefined, controller.signal)).phase, 'cancelled'); assert.equal(posts.length, 0);
  const delayed = new AbortController(); let release;
  navigator.serviceWorker.getRegistration = () => new Promise(resolve => { release = resolve; });
  const job = lib.downloadFarmAssetPack(undefined, delayed.signal); delayed.abort(); release(registration);
  assert.equal((await job).phase, 'cancelled'); assert.equal(posts.length, 0);
});

test('active cancellation targets the exact attempt and closes the reply port', async () => {
  setup(); const controller = new AbortController(); const job = lib.downloadFarmAssetPack(undefined, controller.signal); await tick();
  const requestId = posts[0].data.requestId; controller.abort();
  assert.equal((await job).phase, 'cancelled'); assert.equal(posts.at(-1).data.type, 'CANCEL_FARM_ASSETS');
  assert.equal(posts.at(-1).data.requestId, requestId); assert.equal(channels.at(-1).port1.closed, true);
});

test('inactivity timeout requests cancellation and never manufactures a ready state', async () => {
  setup(); const job = lib.downloadFarmAssetPack(); await tick(); timeout();
  assert.equal((await job).ready, false); assert.equal(posts.at(-1).data.type, 'CANCEL_FARM_ASSETS'); assert.equal(channels.at(-1).port1.closed, true);
});

test('public cancellation helper cancels active operations and cannot reach completed attempts', async () => {
  setup(); const job = lib.downloadFarmAssetPack(); await tick(); lib.cancelFarmAssetPackDownload();
  assert.equal((await job).phase, 'cancelled'); const count = posts.length;
  lib.cancelFarmAssetPackDownload(); assert.equal(posts.length, count);
});

test('worker controller takes precedence over a different registration active worker', async () => {
  setup(); const controlled = [];
  navigator.serviceWorker.controller = { postMessage: (data, ports) => controlled.push({ data, port: ports[0] }) };
  const job = lib.getFarmAssetPackStatus(); await tick(); assert.equal(posts.length, 0); assert.equal(controlled.length, 1);
  controlled[0].port.postMessage({ type: 'FARM_ASSETS_RESULT', status: { ready: false, phase: 'idle' } }); await job;
});

test('compact Spanish control exposes explicit download, cancel, retry, progress and storage honesty without requesting permissions', async () => {
  const source = await readFile(root + 'components/farm-asset-pack.tsx', 'utf8');
  for (const text of ['Descargar paquete 3D', 'Cancelar descarga', 'Reintentar descarga', '<progress', 'role="status"', 'min-h-11', 'primera vez no descarga todo', 'puede borrar esta copia', 'Fuentes y licencias']) assert.ok(source.includes(text), text);
  assert.doesNotMatch(source, /\.persist\(|requestPermission\(|localStorage|offline-db/);
  const effect = source.slice(source.indexOf('useEffect(() =>'), source.indexOf('async function download()'));
  assert.doesNotMatch(effect, /downloadFarmAssetPack/);
});

test('unresponsive old worker status gives an update/reload instruction rather than an asset-download failure', async () => {
  setup(); const job = lib.getFarmAssetPackStatus(); await tick(); timeout();
  const result = await job;
  assert.equal(result.ready, false); assert.equal(result.diagnostic.code, 'worker_timeout');
  assert.match(result.error, /versión anterior/); assert.match(result.error, /recarga/);
  assert.equal(posts.length, 1, 'a read-only status timeout does not start or cancel a download');
});

test('structured worker diagnostics remain available in the page for browser QA without exposing raw exception text', async () => {
  setup(); const job = lib.downloadFarmAssetPack(); await tick();
  const diagnostic = { code: 'http', path: '/offline-assets.json', httpStatus: 401, deployment: 'morochos-v18', phase: 'checking' };
  posts[0].port.postMessage({ type: 'FARM_ASSETS_RESULT', status: { ready: false, phase: 'error', diagnostic, error: 'No se pudo descargar /offline-assets.json (HTTP 401).' } });
  const result = await job; assert.deepEqual(result.diagnostic, diagnostic); assert.match(result.error, /HTTP 401/);
});
