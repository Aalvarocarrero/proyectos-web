import assert from 'node:assert/strict';
import test, { after, beforeEach } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const sqlite = new DatabaseSync(':memory:');
for (const file of readdirSync(root + 'drizzle').filter((name) => name.endsWith('.sql')).sort()) {
  sqlite.exec(readFileSync(root + 'drizzle/' + file, 'utf8'));
}
sqlite.exec('PRAGMA foreign_keys = ON');

// Execute the actual endpoint SQL. D1 batch is a SQLite transaction, including
// rollback if the second insert or receipt fails. No production data is accessed.
const adapter = {
  beforeBatch: null, failAt: -1, batches: 0, sessions: [], changes: [],
  prepare(query) {
    const bind = (values = []) => ({
      bind(...args) { return bind(args); },
      async first() { return sqlite.prepare(query).get(...values) ?? null; },
      async all() { return { success: true, results: sqlite.prepare(query).all(...values) }; },
      execute() {
        const info = sqlite.prepare(query).run(...values);
        return { success: true, meta: { changes: Number(info.changes) }, results: [] };
      },
    });
    return bind();
  },
  withSession(constraint) { this.sessions.push(constraint); return this; },
  async batch(statements) {
    this.batches++;
    const before = this.beforeBatch;
    this.beforeBatch = null;
    if (before) await before();
    sqlite.exec('BEGIN IMMEDIATE');
    try {
      const results = statements.map((statement, index) => {
        if (index === this.failAt) throw new Error('Injected storage failure');
        return statement.execute();
      });
      sqlite.exec('COMMIT');
      this.changes.push(results.map((result) => result.meta.changes));
      return results;
    } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  },
};
globalThis.__areaSplitEnv = { DB: adapter };
globalThis.__areaSplitUser = null;
const vite = await createServer({
  appType: 'custom', configFile: false, root, resolve: { alias: { '@': root } },
  plugins: [{
    name: 'area-split-test-env', enforce: 'pre',
    resolveId(id) {
      if (id === 'cloudflare:workers') return '\0area-split-env';
      if (id.endsWith('/app/chatgpt-auth') || id.endsWith('/app/chatgpt-auth.ts')) return '\0area-split-auth';
    },
    load(id) {
      if (id === '\0area-split-env') return 'export const env = globalThis.__areaSplitEnv;';
      if (id === '\0area-split-auth') return 'export async function getChatGPTUser() { return globalThis.__areaSplitUser; }';
    },
  }],
  server: { middlewareMode: true, hmr: false, watch: null },
});
const route = await vite.ssrLoadModule('/app/api/farm/split/route.ts');
after(async () => {
  await vite.close(); sqlite.close();
  delete globalThis.__areaSplitEnv; delete globalThis.__areaSplitUser;
});
const time = '2026-10-07T00:00:00.000Z';
const operation = {
  sourceId: 'source_area', baseRevision: 'source_v1', baseFarmRevision: 'farm_v1',
  operationId: 'split_operation', newAreaId: 'child_area',
};
const data = {
  areaSqM: 101.25, mapX: 10, mapY: 12, mapWidth: 30, mapHeight: 12,
  usage: 'Pastoreo', notes: 'Synthetic fixture', customField: { preserve: true },
};
function addArea(id = 'source_area', owner = 'owner-a', farm = 'farm_a', customData = data) {
  sqlite.prepare(`INSERT INTO farm_records
    (id,owner_id,farm_id,record_type,category,title,data_json,revision,client_updated_at,server_updated_at)
    VALUES (?,?,?,'area','Pastoreo','Potrero de prueba',?,'source_v1',?,?)`)
    .run(id, owner, farm, JSON.stringify(customData), time, time);
}
beforeEach(() => {
  sqlite.exec('DELETE FROM sync_receipts; DELETE FROM farm_records; DELETE FROM farms; DELETE FROM users;');
  for (const owner of ['owner-a', 'owner-b']) {
    sqlite.prepare('INSERT INTO users(id,email,created_at,updated_at) VALUES (?,?,?,?)')
      .run(owner, owner + '@example.test', time, time);
  }
  for (const [id, owner] of [['farm_a', 'owner-a'], ['farm_b', 'owner-b']]) {
    sqlite.prepare(`INSERT INTO farms(id,owner_id,name,area_sq_m,revision,client_updated_at,server_updated_at)
      VALUES (?,?,'Finca sintética',1000,'farm_v1',?,?)`).run(id, owner, time, time);
  }
  addArea();
  globalThis.__areaSplitUser = { id: 'owner-a', email: 'owner-a@example.test' };
  Object.assign(adapter, { beforeBatch: null, failAt: -1, batches: 0, sessions: [], changes: [] });
});
function request(body = operation, { origin = 'https://split.test', owner = globalThis.__areaSplitUser?.id, fetchSite } = {}) {
  const headers = { 'content-type': 'application/json', origin };
  if (owner !== undefined) headers['x-local-owner'] = owner;
  if (fetchSite) headers['sec-fetch-site'] = fetchSite;
  const req = new Request('https://split.test/api/farm/split', {
    method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  Object.defineProperty(req, 'nextUrl', { value: new URL(req.url) });
  return req;
}
async function send(body = operation, options) {
  const response = await route.POST(request(body, options));
  return { status: response.status, headers: response.headers, ...await response.json() };
}
const rows = () => sqlite.prepare('SELECT * FROM farm_records ORDER BY id').all();
const receiptCount = () => sqlite.prepare('SELECT count(*) AS count FROM sync_receipts').get().count;
const source = () => sqlite.prepare('SELECT * FROM farm_records WHERE id = ?').get('source_area');

test('split derives two owned areas from saved geometry and commits both revisions plus receipt in one transaction', async () => {
  const result = await send();
  assert.equal(result.status, 200); assert.equal(result.ok, true); assert.equal(result.replayed, false);
  assert.equal(adapter.batches, 1); assert.deepEqual(adapter.changes, [[1, 1, 1]]);
  assert.deepEqual(adapter.sessions, ['first-primary']);
  assert.match(result.headers.get('cache-control'), /no-store/);
  assert.equal(rows().length, 2); assert.equal(receiptCount(), 1);
  const [first, second] = result.records;
  assert.deepEqual([first.id, second.id], ['source_area', 'child_area']);
  assert.deepEqual([first.payload.title, second.payload.title], ['Potrero de prueba A', 'Potrero de prueba B']);
  assert.equal(first.payload.data.areaSqM + second.payload.data.areaSqM, data.areaSqM);
  assert.equal(first.payload.data.mapWidth + second.payload.data.mapWidth, data.mapWidth);
  assert.equal(first.payload.data.mapX + first.payload.data.mapWidth, second.payload.data.mapX);
  assert.deepEqual(second.payload.data.customField, data.customField);
  assert.ok(first.revision !== operation.baseRevision && second.revision !== first.revision);
  for (const row of rows()) {
    assert.equal(row.owner_id, 'owner-a'); assert.equal(row.farm_id, 'farm_a');
    assert.equal(row.last_operation_id, operation.operationId);
    assert.equal(JSON.parse(row.data_json).areaSqM, data.areaSqM / 2);
    assert.equal(row.server_updated_at, first.updatedAt);
  }
});

test('identical operation replays without another transaction or a second division', async () => {
  const initial = await send(); const snapshot = rows(); const replay = await send();
  assert.equal(replay.status, 200); assert.equal(replay.replayed, true);
  assert.deepEqual(replay.records, initial.records); assert.deepEqual(rows(), snapshot);
  assert.equal(adapter.batches, 1); assert.equal(receiptCount(), 1);
});

test('operation ID cannot be reused with any altered source, child or revision', async () => {
  await send(); const snapshot = rows();
  for (const change of [
    { sourceId: 'another_area' }, { newAreaId: 'another_child' },
    { baseRevision: 'other_version' }, { baseFarmRevision: 'other_farm_version' },
  ]) {
    const result = await send({ ...operation, ...change });
    assert.equal(result.status, 409); assert.equal(result.error, 'operation_id_reused');
  }
  assert.deepEqual(rows(), snapshot); assert.equal(adapter.batches, 1);
});

test('a later edit cannot be overwritten or divided again by the old operation', async () => {
  await send();
  sqlite.prepare("UPDATE farm_records SET revision='edited_v2', title='Edited later', last_operation_id='other_operation' WHERE id=?")
    .run(operation.sourceId);
  const snapshot = rows();
  const replay = await send(); assert.equal(replay.status, 409); assert.equal(replay.error, 'version_conflict');
  const reuse = await send({ ...operation, baseRevision: 'edited_v2' });
  assert.equal(reuse.error, 'operation_id_reused'); assert.deepEqual(rows(), snapshot);
});

test('replay never resurrects a deleted child or source, or a deleted parent', async () => {
  for (const table of ['child', 'source', 'parent']) {
    if (table === 'child') await send();
    sqlite.exec('UPDATE farm_records SET deleted=0; UPDATE farms SET deleted=0;');
    if (table === 'parent') sqlite.prepare('UPDATE farms SET deleted=1 WHERE id=?').run('farm_a');
    else sqlite.prepare('UPDATE farm_records SET deleted=1 WHERE id=?').run(table === 'child' ? 'child_area' : 'source_area');
    const snapshot = rows(); const result = await send();
    assert.equal(result.status, 409); assert.equal(result.error, 'version_conflict');
    assert.deepEqual(rows(), snapshot); assert.equal(adapter.batches, 1);
  }
});

test('stale source and parent revisions leave all rows unchanged', async () => {
  const snapshot = rows();
  for (const change of [{ baseRevision: 'stale_source' }, { baseFarmRevision: 'stale_farm' }]) {
    const result = await send({ ...operation, ...change });
    assert.equal(result.status, 409); assert.equal(result.error, 'version_conflict');
  }
  assert.deepEqual(rows(), snapshot); assert.equal(adapter.batches, 0); assert.equal(receiptCount(), 0);
});

test('owner mismatch, missing login, and cross-site requests cannot mutate private records', async () => {
  const snapshot = rows();
  assert.equal((await send(operation, { owner: 'owner-b' })).error, 'local_owner_mismatch');
  assert.equal((await send(operation, { origin: 'https://other.test' })).status, 403);
  assert.equal((await send(operation, { fetchSite: 'cross-site' })).status, 403);
  globalThis.__areaSplitUser = null;
  assert.equal((await send()).status, 401);
  globalThis.__areaSplitUser = { id: 'owner-b', email: 'owner-b@example.test' };
  const foreign = await send(); assert.equal(foreign.status, 403); assert.equal(foreign.error, 'forbidden');
  assert.deepEqual(rows(), snapshot); assert.equal(adapter.batches, 0);
});

test('a foreign parent, deleted parent, and source tombstone are rejected', async () => {
  sqlite.prepare('UPDATE farm_records SET farm_id=? WHERE id=?').run('farm_b', 'source_area');
  assert.equal((await send()).status, 409);
  sqlite.prepare('UPDATE farm_records SET farm_id=? WHERE id=?').run('farm_a', 'source_area');
  sqlite.prepare('UPDATE farms SET deleted=1 WHERE id=?').run('farm_a');
  assert.equal((await send()).status, 409);
  sqlite.prepare('UPDATE farms SET deleted=0 WHERE id=?').run('farm_a');
  sqlite.prepare('UPDATE farm_records SET deleted=1 WHERE id=?').run('source_area');
  assert.equal((await send()).status, 409);
  assert.equal(adapter.batches, 0); assert.equal(receiptCount(), 0);
});

test('source changing after preflight makes CAS and both dependent inserts change zero rows', async () => {
  adapter.beforeBatch = () => sqlite.prepare("UPDATE farm_records SET revision='newer_revision', title='Newer edit' WHERE id=?")
    .run('source_area');
  const result = await send();
  assert.equal(result.status, 409); assert.equal(result.serverRevision, 'newer_revision');
  assert.deepEqual(adapter.changes, [[0, 0, 0]]); assert.equal(receiptCount(), 0);
  assert.equal(rows().length, 1); assert.equal(source().title, 'Newer edit');
  assert.equal(JSON.parse(source().data_json).areaSqM, data.areaSqM);
});

test('parent deletion, edit or ownership change after preflight blocks the source CAS itself', async () => {
  const snapshot = rows();
  for (const mutation of ["deleted=1", "revision='new_farm_revision'", "owner_id='owner-b'"]) {
    sqlite.prepare("UPDATE farms SET deleted=0,revision='farm_v1',owner_id='owner-a' WHERE id=?").run('farm_a');
    adapter.beforeBatch = () => sqlite.prepare(`UPDATE farms SET ${mutation} WHERE id=?`).run('farm_a');
    const result = await send(); assert.equal(result.status, 409);
    assert.deepEqual(rows(), snapshot); assert.equal(receiptCount(), 0);
  }
  assert.deepEqual(adapter.changes, [[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
});

test('an existing child ID triggers constraint failure and rolls back the source update', async () => {
  addArea('child_area', 'owner-b', 'farm_b'); const snapshot = rows();
  const result = await send();
  assert.equal(result.status, 409); assert.equal(result.error, 'new_area_id_conflict');
  assert.deepEqual(rows(), snapshot); assert.equal(receiptCount(), 0); assert.equal(adapter.batches, 1);
});

test('injected failure after the source or child write rolls back every write and permits a safe retry', async () => {
  const snapshot = rows();
  for (const failureIndex of [1, 2]) {
    adapter.failAt = failureIndex;
    const failed = await send(); assert.equal(failed.status, 500); assert.equal(failed.error, 'area_split_failed');
    assert.deepEqual(rows(), snapshot); assert.equal(receiptCount(), 0);
  }
  adapter.failAt = -1;
  const retry = await send(); assert.equal(retry.status, 200);
  assert.equal(rows().length, 2); assert.equal(receiptCount(), 1);
});

test('concurrent identical attempts converge to one persisted split', async () => {
  const results = await Promise.all([send(), send()]);
  assert.ok(results.every((result) => result.status === 200));
  assert.deepEqual(results[0].records, results[1].records);
  assert.equal(rows().length, 2); assert.equal(receiptCount(), 1);
  assert.equal(rows().reduce((total, row) => total + JSON.parse(row.data_json).areaSqM, 0), data.areaSqM);
});

test('two different split intents for the same source cannot both succeed', async () => {
  const results = await Promise.all([send(), send({ ...operation, operationId: 'competing_operation', newAreaId: 'competing_child' })]);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
  assert.equal(rows().length, 2); assert.equal(receiptCount(), 1);
  assert.equal(rows().reduce((total, row) => total + JSON.parse(row.data_json).areaSqM, 0), data.areaSqM);
});

test('concurrent reuse of an operation ID with a different child is rejected', async () => {
  const results = await Promise.all([send(), send({ ...operation, newAreaId: 'different_child' })]);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
  assert.equal(results.find((result) => result.status === 409).error, 'operation_id_reused');
  assert.equal(rows().length, 2); assert.equal(receiptCount(), 1);
});

test('an operation ID claimed by ordinary sync before or during preflight cannot be claimed by a split', async () => {
  const snapshot = rows();
  const claim = () => sqlite.prepare(`INSERT INTO sync_receipts
    (id,owner_key,entity_type,entity_id,operation_hash,receipt_status,created_at)
    VALUES (?,'owner-a','farm','farm_a','other-hash','accepted',?)`).run(operation.operationId, time);
  claim();
  const before = await send(); assert.equal(before.status, 409); assert.equal(before.error, 'operation_id_reused');
  assert.equal(adapter.batches, 0); assert.deepEqual(rows(), snapshot);
  sqlite.exec('DELETE FROM sync_receipts');
  adapter.beforeBatch = claim;
  const during = await send(); assert.equal(during.status, 409); assert.equal(during.error, 'operation_id_reused');
  assert.deepEqual(adapter.changes, [[0, 0, 0]]); assert.deepEqual(rows(), snapshot);
  assert.equal(receiptCount(), 1);
  assert.equal(sqlite.prepare('SELECT entity_type FROM sync_receipts').get().entity_type, 'farm');
});

test('a different owner cannot replay an accepted split or read its records', async () => {
  await send(); const snapshot = rows();
  globalThis.__areaSplitUser = { id: 'owner-b', email: 'owner-b@example.test' };
  const foreign = await send();
  assert.equal(foreign.status, 409); assert.equal(foreign.error, 'operation_id_reused');
  assert.equal(foreign.records, undefined); assert.equal(foreign.serverRevision, undefined);
  assert.deepEqual(rows(), snapshot); assert.equal(adapter.batches, 1);
});

test('malformed IDs, untrusted geometry, missing revisions, and oversized JSON are rejected', async () => {
  const snapshot = rows();
  for (const body of [
    { ...operation, sourceId: '../area' }, { ...operation, newAreaId: 'x'.repeat(161) },
    { ...operation, operationId: 'x' }, { ...operation, newAreaId: operation.sourceId },
    { ...operation, baseRevision: null }, { ...operation, baseFarmRevision: undefined },
    { ...operation, data: { areaSqM: 999999 } }, { ...operation, ownerId: 'owner-b' },
    '{broken json',
  ]) assert.equal((await send(body)).status, 400);
  assert.equal((await send('x'.repeat(4097))).status, 413);
  assert.deepEqual(rows(), snapshot); assert.equal(adapter.batches, 0);
});

test('non-area records and invalid or too-small area payloads cannot be divided', async () => {
  for (const value of [0, -1, 1, null, 'not-a-number']) {
    sqlite.prepare('UPDATE farm_records SET data_json=? WHERE id=?').run(JSON.stringify({ ...data, areaSqM: value }), 'source_area');
    assert.equal((await send()).status, 400);
  }
  sqlite.prepare("UPDATE farm_records SET data_json='{broken' WHERE id=?").run('source_area');
  assert.equal((await send()).status, 400);
  sqlite.prepare("UPDATE farm_records SET record_type='animal',data_json=? WHERE id=?").run(JSON.stringify(data), 'source_area');
  assert.equal((await send()).status, 400);
  assert.equal(adapter.batches, 0); assert.equal(rows().length, 1);
});

test('legacy empty revisions remain valid CAS values and titles stay within sync limits', async () => {
  sqlite.prepare("UPDATE farm_records SET revision='',title=? WHERE id=?").run('P'.repeat(160), 'source_area');
  sqlite.prepare("UPDATE farms SET revision='' WHERE id=?").run('farm_a');
  const result = await send({ ...operation, baseRevision: '', baseFarmRevision: '' });
  assert.equal(result.status, 200);
  assert.ok(result.records.every((record) => record.payload.title.length <= 160));
  assert.equal(result.records[0].payload.data.areaSqM + result.records[1].payload.data.areaSqM, data.areaSqM);
});

test('linked records prevent splitting without silently assigning them to a new half',async()=>{sqlite.prepare(`INSERT INTO farm_records(id,owner_id,farm_id,record_type,category,title,data_json,revision,client_updated_at,server_updated_at) VALUES ('linked-animal','owner-a','farm_a','animal','Bovino','Animal de prueba',?,'linked-v1',?,?)`).run(JSON.stringify({areaId:'source_area'}),time,time);const before=sqlite.prepare('select data_json,revision from farm_records where id=?').get('source_area');const result=await send();assert.equal(result.status,409);assert.equal(result.error,'area_has_linked_records');assert.equal(sqlite.prepare('select count(*) n from farm_records where id=?').get('child_area').n,0);assert.deepEqual(sqlite.prepare('select data_json,revision from farm_records where id=?').get('source_area'),before);});

test('a link arriving after split preflight is caught inside the atomic update',async()=>{adapter.beforeBatch=()=>{sqlite.prepare(`INSERT INTO farm_records(id,owner_id,farm_id,record_type,category,title,data_json,revision,client_updated_at,server_updated_at) VALUES ('late-linked','owner-a','farm_a','task','Trabajo','Tarea',?,'task-v1',?,?)`).run(JSON.stringify({areaId:'source_area'}),time,time);};const result=await send();assert.equal(result.status,409);assert.equal(sqlite.prepare('select count(*) n from farm_records where id=?').get('child_area').n,0);assert.equal(source().revision,'source_v1');});
