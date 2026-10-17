import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { indexedDB, IDBKeyRange, IDBObjectStore } from 'fake-indexeddb';

// All accounts, databases and responses in this suite are synthetic and process-local.
const root = fileURLToPath(new URL('..', import.meta.url));
const storage = () => { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; };
const globals = { indexedDB, IDBKeyRange, location: { pathname: '/app', origin: 'https://synthetic.invalid' }, navigator: { onLine: true }, localStorage: storage(), sessionStorage: storage(), window: new EventTarget(), fetch: async () => { throw new Error('Unexpected network call'); } };
const originals = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
const vite = await createServer({ appType: 'custom', configFile: false, root, resolve: { alias: { '@': root } }, server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
const db = await vite.ssrLoadModule('/lib/offline-db.ts');
const owner = await vite.ssrLoadModule('/lib/offline-owner.ts');
after(async () => { await vite.close(); for (const [key, value] of originals) { if (value) Object.defineProperty(globalThis, key, value); else delete globalThis[key]; } });

const operationId = 'synthetic_receipt_operation';
const syncedAt = '2026-10-13T00:00:00.000Z';
const valid = () => ({ accepted: [operationId], rejected: [], revisions: { [operationId]: 'confirmed-revision' }, syncedAt });
async function prepare(account) {
  owner.selectVerifiedDashboardOwner(account);
  await db.queueMutation({ id: operationId, entityType: 'farm', entityId: 'synthetic_receipt_farm', action: 'upsert', payload: { name: 'Synthetic pending farm', location: '', areaSqM: 100, objective: '' } });
  return db.exportLocalBackup();
}
function respond(account, receipt) {
  globalThis.fetch = async url => {
    assert.ok(url === '/api/offline-session' || url === '/api/sync');
    return new Response(JSON.stringify(url === '/api/offline-session' ? { owner: account } : receipt));
  };
}
async function unchanged(before) {
  const after = await db.exportLocalBackup();
  assert.deepEqual(after.entities, before.entities);
  assert.deepEqual(after.outbox, before.outbox);
  assert.deepEqual(after.meta, before.meta);
}

const malformed = [
  ['null response', () => null],
  ['accepted is not an array', () => ({ ...valid(), accepted: {} })],
  ['accepted contains a non-string', () => ({ ...valid(), accepted: [null] })],
  ['accepted contains a foreign operation', () => ({ ...valid(), accepted: ['other_operation'] })],
  ['accepted repeats an operation', () => ({ ...valid(), accepted: [operationId, operationId] })],
  ['rejected is null', () => ({ ...valid(), rejected: null })],
  ['rejected is not an array', () => ({ ...valid(), rejected: {} })],
  ['rejected contains null after accepted writes', () => ({ ...valid(), rejected: [null] })],
  ['rejected lacks a reason', () => ({ ...valid(), accepted: [], revisions: {}, rejected: [{ id: operationId }] })],
  ['rejected has an empty reason', () => ({ ...valid(), accepted: [], revisions: {}, rejected: [{ id: operationId, reason: '' }] })],
  ['rejected contains a foreign operation', () => ({ ...valid(), rejected: [{ id: 'other_operation', reason: 'version_conflict' }] })],
  ['accepted and rejected overlap', () => ({ ...valid(), rejected: [{ id: operationId, reason: 'version_conflict' }] })],
  ['rejected repeats an operation', () => ({ ...valid(), accepted: [], revisions: {}, rejected: [{ id: operationId, reason: 'version_conflict' }, { id: operationId, reason: 'version_conflict' }] })],
  ['rejected has a malformed revision', () => ({ ...valid(), accepted: [], revisions: {}, rejected: [{ id: operationId, reason: 'version_conflict', serverRevision: {} }] })],
  ['revisions is null', () => ({ ...valid(), revisions: null })],
  ['revisions is an array', () => ({ ...valid(), revisions: [] })],
  ['revisions has an invalid value', () => ({ ...valid(), revisions: { [operationId]: {} } })],
  ['revisions names an unacknowledged operation', () => ({ ...valid(), revisions: { other_operation: 'revision' } })],
  ['syncedAt is not a string', () => ({ ...valid(), syncedAt: 42 })],
  ['syncedAt is invalid', () => ({ ...valid(), syncedAt: 'not-a-date' })],
  ['syncedAt is an ambiguous numeric date', () => ({ ...valid(), syncedAt: '1' })],
  ['syncedAt has an impossible calendar day', () => ({ ...valid(), syncedAt: '2026-02-30T00:00:00Z' })],
  ['syncedAt has an out-of-range hour', () => ({ ...valid(), syncedAt: '2026-10-13T24:00:00Z' })],
];
for (const [index, [label, receipt]] of malformed.entries()) test(`malformed receipt: ${label} preserves the entire local write`, async () => {
  const account = `malformed-receipt-${index}`, before = await prepare(account);
  respond(account, receipt());
  const result = await db.syncNow();
  assert.equal(result.reason, 'invalid_response');
  assert.equal(result.pending, 1);
  await unchanged(before);
});

test('valid acknowledgement confirms once and remains compatible with legacy optional fields', async () => {
  for (const [index, receipt] of [valid(), { accepted: [operationId], syncedAt: '2026-10-13T00:00:00Z' }, { ...valid(), revisions: { [operationId]: null } }].entries()) {
    const account = `valid-receipt-${index}`; await prepare(account); respond(account, receipt);
    assert.equal((await db.syncNow()).ok, true);
    assert.equal(await db.getPendingCount(), 0);
    assert.equal((await db.getCachedEntity('farm', 'synthetic_receipt_farm')).syncState, 'synced');
    assert.equal((await db.getOperationStatus(operationId)).state, 'confirmed');
    assert.equal((await db.syncNow()).ok, true);
  }
});

test('valid conflict remains pending with a usable conflict reason and server revision', async () => {
  const account = 'valid-conflict-receipt'; await prepare(account);
  respond(account, { accepted: [], rejected: [{ id: operationId, reason: 'version_conflict', serverRevision: null }], revisions: {}, syncedAt });
  assert.equal((await db.syncNow()).ok, false);
  assert.equal(await db.getPendingCount(), 1);
  const issue = (await db.getSyncIssues())[0];
  assert.equal(issue.operation.blockedReason, 'version_conflict');
  assert.equal(issue.server.deleted, true);
});

test('an operation ID matching an object property cannot inherit an unconfirmed revision', async () => {
  const account = 'receipt-object-key'; owner.selectVerifiedDashboardOwner(account);
  await db.queueMutation({ id: '__proto__', entityType: 'farm', entityId: 'prototype_receipt_farm', action: 'upsert', payload: { name: 'Synthetic farm' } });
  respond(account, { accepted: ['__proto__'], revisions: {}, syncedAt });
  assert.equal((await db.syncNow()).ok, true);
  assert.equal((await db.getCachedEntity('farm', 'prototype_receipt_farm')).serverRevision, null);
});

test('failure after starting acknowledgement writes aborts rather than partially deleting the outbox', async () => {
  const account = 'interrupted-receipt', before = await prepare(account); respond(account, valid());
  const originalPut = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value, ...args) {
    if (this.name === 'meta' && value?.key === `ack:${operationId}`) throw new Error('Synthetic interrupted acknowledgement');
    return originalPut.call(this, value, ...args);
  };
  try { await assert.rejects(db.syncNow(), /Synthetic interrupted acknowledgement/); }
  finally { IDBObjectStore.prototype.put = originalPut; }
  await unchanged(before);
});
