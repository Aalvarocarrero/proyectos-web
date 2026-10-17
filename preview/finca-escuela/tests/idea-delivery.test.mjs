import assert from 'node:assert/strict';
import test, { after, beforeEach } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';

const root = fileURLToPath(new URL('..', import.meta.url));
const names = ['indexedDB', 'IDBKeyRange', 'location', 'navigator', 'sessionStorage', 'localStorage', 'window', 'fetch'];
const saved = Object.fromEntries(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
const memoryStorage = () => { const entries = new Map(); return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) }; };
for (const [name, value] of Object.entries({ indexedDB: new IDBFactory(), IDBKeyRange, location: { pathname: '/app-local', origin: 'https://idea-test.invalid' }, navigator: { onLine: true }, sessionStorage: memoryStorage(), localStorage: memoryStorage(), window: new EventTarget() })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
const vite = await createServer({ appType: 'custom', configFile: false, root, cacheDir: `${root}/.test-vite-cache`, resolve: { alias: { '@': root } }, server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
const db = await vite.ssrLoadModule('/lib/offline-db.ts');
const owner = await vite.ssrLoadModule('/lib/offline-owner.ts');
const helper = await vite.ssrLoadModule('/lib/idea-invitation.ts');
const syncedAt = '2026-10-07T12:00:00Z';
let send;
let posts;
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  navigator.onLine = true;
  location.pathname = '/app-local';
  posts = 0;
  send = async operations => ({ accepted: operations.map(operation => operation.id), syncedAt });
  globalThis.fetch = async (url, options) => {
    if (url === '/api/offline-session') return new Response(JSON.stringify({ owner: 'device-local' }));
    if (url !== '/api/sync') throw new Error(`Unexpected request blocked: ${url}`);
    posts += 1;
    return new Response(JSON.stringify(await send(JSON.parse(options.body).operations)));
  };
});
after(async () => { await vite.close(); for (const name of names) { if (saved[name]) Object.defineProperty(globalThis, name, saved[name]); else delete globalThis[name]; } });
async function queue(label) {
  const valid = helper.validateIdeaFields(`Necesidad de prueba sintética: ${label}`, '');
  assert.equal(valid.ok, true);
  return db.queueMutation({ id: `idea_test_${label}`, entityType: 'feedback', entityId: `feedback_test_${label}`, action: 'upsert', payload: valid.payload });
}

test('offline idea stays pending without a receipt and is confirmed only after the exact acknowledgement', async () => {
  const operation = await queue('offline');
  navigator.onLine = false;
  assert.equal((await db.syncNow()).ok, false);
  assert.equal(posts, 0);
  assert.equal((await db.getOperationStatus(operation.id)).state, 'pending');
  navigator.onLine = true;
  await db.syncNow();
  assert.deepEqual(await db.getOperationStatus(operation.id), { state: 'confirmed', confirmedAt: syncedAt });
  assert.match(helper.ideaReceiptText(await db.getOperationStatus(operation.id)), /^Idea recibida/);
  await db.syncNow();
  assert.equal(posts, 1, 'checking an accepted idea never submits a second copy');
});

test('an unrelated accepted operation must not produce a received receipt for the pending idea', async () => {
  const other = await queue('other');
  const target = await queue('target');
  send = async operations => ({ accepted: operations.filter(operation => operation.id === other.id).map(operation => operation.id), syncedAt });
  await db.syncNow();
  assert.equal((await db.getOperationStatus(other.id)).state, 'confirmed');
  const targetStatus = await db.getOperationStatus(target.id);
  assert.equal(targetStatus.state, 'pending');
  assert.doesNotMatch(helper.ideaReceiptText(targetStatus), /^Idea recibida/);
});

test('the idea can be confirmed even when a different operation was rejected and the batch is not fully synced', async () => {
  const target = await queue('accepted');
  const other = await queue('rejected');
  send = async operations => ({ accepted: operations.filter(operation => operation.id === target.id).map(operation => operation.id), rejected: operations.filter(operation => operation.id === other.id).map(operation => ({ id: operation.id, reason: 'invalid_payload' })), syncedAt });
  assert.equal((await db.syncNow()).ok, false);
  assert.equal((await db.getOperationStatus(target.id)).state, 'confirmed');
  assert.equal((await db.getOperationStatus(other.id)).state, 'blocked');
});

test('server failures and a different account scope never claim receipt', async () => {
  const operation = await queue('server_failure');
  send = async () => { throw new TypeError('Synthetic network failure'); };
  await db.syncNow();
  assert.equal((await db.getOperationStatus(operation.id)).state, 'pending');
  location.pathname = '/app';
  owner.selectVerifiedDashboardOwner('different-synthetic-account');
  assert.deepEqual(await db.getOperationStatus(operation.id), { state: 'unknown' });
  assert.doesNotMatch(helper.ideaReceiptText(await db.getOperationStatus(operation.id)), /^Idea recibida/);
});
