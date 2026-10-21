import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createWorker } from '../src/worker.mjs';

class SQLiteD1 {
  constructor(path) {
    this.db = new DatabaseSync(path);
    this.db.exec('PRAGMA foreign_keys = ON');
  }
  prepare(sql) {
    const db = this.db;
    return { bind(...args) {
      const statement = db.prepare(sql);
      return {
        first: async () => statement.get(...args),
        all: async () => ({ results: statement.all(...args) }),
        run: async () => statement.run(...args),
      };
    }};
  }
  async batch(statements) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = [];
      for (const statement of statements) result.push(await statement.run());
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
  close() { this.db.close(); }
}

const owners = new Map([['Bearer alpha-fixture', 'owner-alpha-fixture'], ['Bearer beta-fixture', 'owner-beta-fixture']]);
const worker = createWorker({ authenticateOwner: request => owners.get(request.headers.get('authorization')) ?? null });
const project = (id, title = 'Proyecto ficticio') => ({
  id, kind: 'project', projectId: '', title, body: 'Contenido sintético', status: 'pendiente', priority: 'alta', nextAction: 'Revisar fixture',
});
const event = (id, projectId, title = 'Tarea ficticia') => ({
  id, at: '2026-10-21T09:00:00.000Z', op: 'create',
  entity: { id, kind: 'task', projectId, title, body: 'Evidencia sintética', status: 'preparado', priority: 'media', nextAction: 'Próximo paso ficticio' }, evidence: [],
});

async function setup(t) {
  const folder = await mkdtemp(join(tmpdir(), 'cerebro-d1-test-'));
  const path = join(folder, 'state.sqlite');
  const db = new SQLiteD1(path);
  db.db.exec(await readFile(new URL('../migrations/0001_initial.sql', import.meta.url), 'utf8'));
  const env = { DB: db };
  let activeDb = db;
  const call = (url, { method = 'GET', owner = 'alpha-fixture', body, headers = {} } = {}) => worker.fetch(new Request(`https://fixture.invalid${url}`, {
    method,
    headers: { Authorization: `Bearer ${owner}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }), env);
  t.after(() => { activeDb.close(); return rm(folder, { recursive: true, force: true }); });
  return { call, env, path, reopen: () => { activeDb.close(); activeDb = new SQLiteD1(path); activeDb.db.exec('PRAGMA foreign_keys = ON'); env.DB = activeDb; return activeDb; } };
}

test('fail closed: no Site auth adapter, missing owner and client-supplied owner are rejected', async t => {
  const { call } = await setup(t);
  const unavailable = await createWorker().fetch(new Request('https://fixture.invalid/api/projects'), { DB: {} });
  assert.equal(unavailable.status, 503);
  const noOwner = createWorker({ authenticateOwner: () => null });
  assert.equal((await noOwner.fetch(new Request('https://fixture.invalid/api/projects'), { DB: {} })).status, 401);
  const extraOwner = await call('/api/projects', { method: 'POST', body: { ownerId: 'attacker', operationId: 'o1', project: project('p1') } });
  assert.equal(extraOwner.status, 400);
  assert.equal((await call('/api/projects', { headers: { Origin: 'https://other.invalid' } })).status, 403);
});

test('create project and append memory are durable across worker/store restart', async t => {
  const { call, env, reopen } = await setup(t);
  const created = await call('/api/projects', { method: 'POST', body: { operationId: 'create-project-a', project: project('project-a') } });
  assert.equal(created.status, 200);
  assert.equal((await created.json()).accepted, true);
  const appended = await call('/api/projects/project-a/memory', { method: 'POST', body: { operationId: 'append-event-a', event: event('event-a', 'project-a') } });
  assert.equal(appended.status, 200);
  const body = await appended.json();
  assert.equal(body.recordId, 'event-a');
  env.DB = reopen();
  assert.equal((await (await call('/api/projects')).json()).projects[0].id, 'project-a');
  const memory = await call('/api/projects/project-a/memory');
  assert.equal((await memory.json()).records[0].id, 'event-a');
});

test('idempotent write receipt survives a lost ACK and explicit replay', async t => {
  const { call, env, reopen } = await setup(t);
  await call('/api/projects', { method: 'POST', body: { operationId: 'create-project-a', project: project('project-a') } });
  const message = { id: 'message-attempt-1', projectId: 'project-a', text: 'Pregunta sintética' };
  const ignoredAck = await call('/api/messages', { method: 'POST', body: message });
  assert.equal(ignoredAck.status, 200); // Simulate response loss by discarding its body before restarting.
  env.DB = reopen();
  const receipt = await call('/api/messages/message-attempt-1');
  assert.equal(receipt.status, 200);
  assert.equal((await receipt.json()).verified, true);
  const retry = await call('/api/messages', { method: 'POST', body: message });
  assert.equal((await retry.json()).duplicate, true);
  const memory = await call('/api/projects/project-a/memory');
  const rows = (await memory.json()).records;
  assert.equal(rows.filter(row => row.id === message.id).length, 1);
});

test('dedupes the same operation, rejects ID reuse with changed text, and permits a new identical message', async t => {
  const { call } = await setup(t);
  await call('/api/projects', { method: 'POST', body: { operationId: 'create-project-a', project: project('project-a') } });
  const first = { id: 'message-1', projectId: 'project-a', text: 'Mismo texto ficticio' };
  assert.equal((await (await call('/api/messages', { method: 'POST', body: first })).json()).duplicate, false);
  assert.equal((await (await call('/api/messages', { method: 'POST', body: first })).json()).duplicate, true);
  assert.equal((await call('/api/messages', { method: 'POST', body: { ...first, text: 'Contenido cambiado' } })).status, 409);
  assert.equal((await (await call('/api/messages', { method: 'POST', body: { ...first, id: 'message-2' } })).json()).duplicate, false);
  const rows = (await (await call('/api/projects/project-a/memory')).json()).records;
  assert.equal(rows.filter(row => row.text === first.text).length, 2);
});

test('owner and project scoping are enforced on list, memory and receipts', async t => {
  const { call } = await setup(t);
  await call('/api/projects', { method: 'POST', body: { operationId: 'alpha-project', project: project('same-project-id', 'Proyecto alfa') } });
  await call('/api/projects/same-project-id/memory', { method: 'POST', body: { operationId: 'alpha-event', event: event('same-event-id', 'same-project-id', 'Dato alfa') } });
  assert.equal((await (await call('/api/projects')).json()).projects.length, 1);
  assert.equal((await (await call('/api/projects', { owner: 'beta-fixture' })).json()).projects.length, 0);
  assert.equal((await call('/api/projects/same-project-id/memory', { owner: 'beta-fixture' })).status, 404);
  assert.equal((await call('/api/messages/alpha-event', { owner: 'beta-fixture' })).status, 404);
  const betaCreate = await call('/api/projects', { method: 'POST', owner: 'beta-fixture', body: { operationId: 'beta-project', project: project('same-project-id', 'Proyecto beta') } });
  assert.equal(betaCreate.status, 200);
  assert.equal((await (await call('/api/projects', { owner: 'beta-fixture' })).json()).projects[0].title, 'Proyecto beta');
  assert.equal((await call('/api/projects/same-project-id/memory', { owner: 'beta-fixture' })).status, 200);
  assert.equal((await call('/api/projects/unknown/memory')).status, 404);
});

test('memory pagination and schema validation reject foreign project records', async t => {
  const { call } = await setup(t);
  await call('/api/projects', { method: 'POST', body: { operationId: 'create-project-a', project: project('project-a') } });
  for (const id of ['event-a', 'event-b', 'event-c']) {
    await call('/api/projects/project-a/memory', { method: 'POST', body: { operationId: `op-${id}`, event: event(id, 'project-a') } });
  }
  const first = await call('/api/projects/project-a/memory?limit=2');
  const page1 = await first.json();
  assert.equal(page1.records.length, 2);
  assert.equal(page1.hasMore, true);
  const page2 = await call(`/api/projects/project-a/memory?limit=2&cursor=${encodeURIComponent(page1.nextCursor)}`);
  assert.equal((await page2.json()).records.length, 1);
  assert.equal((await call('/api/projects/project-a/memory?limit=201')).status, 400);
  assert.equal((await call('/api/projects/project-a/memory', { method: 'POST', body: { operationId: 'foreign', event: event('foreign-event', 'another-project') } })).status, 400);
});

test('concurrent duplicate posts leave one record and one immutable receipt', async t => {
  const { call, env } = await setup(t);
  await call('/api/projects', { method: 'POST', body: { operationId: 'create-project-a', project: project('project-a') } });
  const message = { id: 'concurrent-attempt', projectId: 'project-a', text: 'Escritura concurrente ficticia' };
  const responses = await Promise.all([
    call('/api/messages', { method: 'POST', body: message }),
    call('/api/messages', { method: 'POST', body: message }),
  ]);
  assert.deepEqual(responses.map(response => response.status), [200, 200]);
  const records = await env.DB.prepare('SELECT record_id FROM memory_records WHERE owner_id = ? AND project_id = ?').bind('owner-alpha-fixture', 'project-a').all();
  const receipts = await env.DB.prepare('SELECT operation_id FROM operations WHERE owner_id = ? AND operation_id = ?').bind('owner-alpha-fixture', message.id).all();
  assert.equal(records.results.length, 1);
  assert.equal(receipts.results.length, 1);
  assert.throws(() => env.DB.db.exec("DELETE FROM memory_records WHERE record_id = 'concurrent-attempt'"), /append-only/);
});
