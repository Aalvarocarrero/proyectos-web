import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';

// Real authentication and bootstrap code; all data, sessions, HTTP, and IndexedDB
// are synthetic and process-local. No deployment, build, or external request.
const root = fileURLToPath(new URL('..', import.meta.url));
const sqlite = new DatabaseSync(':memory:');
for (const file of readdirSync(root + 'drizzle').filter(name => name.endsWith('.sql')).sort()) {
  sqlite.exec(readFileSync(root + 'drizzle/' + file, 'utf8'));
}
sqlite.exec('PRAGMA foreign_keys = ON');
const DB = {
  prepare(query) {
    const bind = (values = []) => ({
      bind(...args) { return bind(args); },
      async run() { return { success: true, meta: sqlite.prepare(query).run(...values) }; },
      async first() { return sqlite.prepare(query).get(...values) ?? null; },
      async all() { return { results: sqlite.prepare(query).all(...values) }; },
      async raw() { const statement = sqlite.prepare(query); statement.setReturnArrays(true); return statement.all(...values); },
    });
    return bind();
  },
  async batch(statements) {
    sqlite.exec('BEGIN');
    try { const result = await Promise.all(statements.map(statement => statement.run())); sqlite.exec('COMMIT'); return result; }
    catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  },
};
const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key), clear: () => values.clear() };
};
const browser = {
  indexedDB, IDBKeyRange,
  location: { pathname: '/app', origin: 'https://venezuelaagro.com' },
  navigator: { onLine: true }, sessionStorage: storage(), localStorage: storage(), window: new EventTarget(),
  fetch: async () => { throw new Error('Unmocked network is forbidden'); },
  __ownedOfflineEnv: { DB },
  __ownedOfflineGetUser: undefined,
};
const originals = new Map(Object.keys(browser).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
for (const [key, value] of Object.entries(browser)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
const vite = await createServer({
  define: { __AUTH_DEPLOYMENT_TARGET__: JSON.stringify('standalone') },
  appType: 'custom', configFile: false, root, resolve: { alias: { '@': root } },
  plugins: [{
    name: 'owned-offline-scope-test', enforce: 'pre',
    resolveId(id) {
      if (id === 'cloudflare:workers') return '\0owned-offline-env';
      if (id.endsWith('/app/chatgpt-auth') || id.endsWith('/app/chatgpt-auth.ts')) return '\0owned-offline-auth';
    },
    load(id) {
      if (id === '\0owned-offline-env') return 'export const env = globalThis.__ownedOfflineEnv;';
      if (id === '\0owned-offline-auth') return 'export async function getChatGPTUser() { return globalThis.__ownedOfflineGetUser(); }';
    },
  }],
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
});
after(async () => {
  await vite.close(); sqlite.close();
  for (const [key, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
});
const { parseAuthConfig } = await vite.ssrLoadModule('/lib/auth/config.ts');
const config = parseAuthConfig({
  AUTH_MODE: 'google', AUTH_ACCESS_POLICY: 'public-production', APP_ORIGIN: location.origin,
  GOOGLE_CLIENT_ID: 'synthetic-client', GOOGLE_CLIENT_SECRET: 'synthetic-secret', AUTH_SESSION_SECRET: 's'.repeat(64),
  TURNSTILE_SITE_KEY: 'synthetic-key', TURNSTILE_SECRET_KEY: 'synthetic-secret',
  OWNER_ADMIN_EMAIL: 'admin@example.test', OWNER_GOOGLE_SUBJECT: 'synthetic-admin',
});
const { getSession, createSession } = await vite.ssrLoadModule('/lib/auth/session.ts');
const { findOrCreateGoogleUser } = await vite.ssrLoadModule('/lib/auth/store.ts');
const bootstrap = await vite.ssrLoadModule('/app/api/bootstrap/route.ts');
const db = await vite.ssrLoadModule('/lib/offline-db.ts');
const owner = await vite.ssrLoadModule('/lib/offline-owner.ts');
const secondTab = await vite.ssrLoadModule('/lib/offline-owner.ts?ownedScopeSecondTab=1');
let token = null;
globalThis.__ownedOfflineGetUser = () => getSession(DB, config, token);
const time = '2026-10-15T00:00:00.000Z';
const users = [];
for (const name of ['a', 'b', 'drafts', 'switch', 'late']) {
  const user = await findOrCreateGoogleUser(DB, 'synthetic-' + name, name + '@example.test', 'Synthetic ' + name);
  users.push({ ...user, fixture: name, token: (await createSession(DB, config, user.id)).sessionToken });
}
const [alice, bob, drafts, switching, late] = users;
const publicationTypes = ['listing', 'professional', 'project', 'public-farm', 'social-post', 'social-comment'];
function insert(table, fields) {
  const names = Object.keys(fields);
  sqlite.prepare(`INSERT INTO ${table} (${names.join(',')}) VALUES (${names.map(() => '?').join(',')})`).run(...Object.values(fields));
}
function id(user, type, status = 'active') { return `${user.fixture}_${type}_${status}`; }
function content(user) { return `CONTENT_${user.fixture.toUpperCase()}_ONLY`; }
function seed(user) {
  insert('farms', { id: id(user, 'farm'), owner_id: user.id, name: content(user), revision: 'farm-r1', client_updated_at: time, server_updated_at: time });
  insert('farm_records', { id: id(user, 'farm-record'), owner_id: user.id, farm_id: id(user, 'farm'), record_type: 'inventory', title: content(user), data_json: '{}', revision: 'record-r1', client_updated_at: time, server_updated_at: time });
  for (const status of ['active', 'pending', 'deleted']) {
    const common = { owner_id: user.id, status, revision: `${status}-r1` };
    insert('marketplace_listings', {
      ...common, id: id(user, 'listing', status), seller_name: content(user), title: content(user), description: content(user),
      category: 'Cacao', location: 'Sucre', contact: content(user), deleted: Number(status === 'deleted'),
      client_updated_at: time, server_updated_at: time,
    });
    insert('professionals', {
      ...common, id: id(user, 'professional', status), name: content(user), profession: 'Agronomía', specialties: 'Cacao', state: 'Sucre',
      service_mode: 'Presencial', introduction: content(user), contact: content(user), credential_note: '', created_at: time, updated_at: time,
    });
    insert('project_proposals', {
      ...common, id: id(user, 'project', status), title: content(user), sector: 'Agrícola', state: 'Sucre', summary: content(user),
      has_json: '[]', needs_json: '[]', impact: content(user), requested_support: content(user), contact: content(user), created_at: time, updated_at: time,
    });
    insert('public_farm_profiles', {
      ...common, id: id(user, 'public-farm', status), name: content(user), state: 'Sucre',
      profile_json: JSON.stringify({ name: content(user), description: content(user), phone: content(user) }), created_at: time, updated_at: time,
    });
    insert('community_posts', {
      ...common, id: id(user, 'social-post', status), farm_id: id(user, 'public-farm'), body: content(user), created_at: time, updated_at: time,
    });
    insert('community_comments', {
      ...common, id: id(user, 'social-comment', status), post_id: id(user, 'social-post'), author_name: content(user), body: content(user), created_at: time, updated_at: time,
    });
  }
}
for (const user of users) seed(user);
// A foreign comment on my post is still foreign; my comment on another post is mine.
for (const [writer, target] of [[alice, bob], [bob, alice]]) insert('community_comments', {
  id: id(writer, 'social-comment', 'cross'), owner_id: writer.id, post_id: id(target, 'social-post'), author_name: content(writer),
  body: content(writer), status: 'active', revision: 'cross-r1', created_at: time, updated_at: time,
});
function select(user) {
  location.pathname = '/app'; navigator.onLine = true; token = user.token; owner.selectVerifiedDashboardOwner(user.id);
}
function routeFetch(calls = []) {
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url === '/api/bootstrap') return bootstrap.GET();
    if (url === '/api/offline-session') return new Response(JSON.stringify({ owner: (await globalThis.__ownedOfflineGetUser())?.id ?? 'device-local' }));
    throw new Error('Unexpected request: ' + url);
  };
  return calls;
}
function expectedKeys(user) {
  return [`farm:${id(user, 'farm')}`, `farm-record:${id(user, 'farm-record')}`,
    ...publicationTypes.flatMap(type => ['active', 'pending'].map(status => `${type}:${id(user, type, status)}`)),
    ...([alice.id, bob.id].includes(user.id) ? [`social-comment:${id(user, 'social-comment', 'cross')}`] : [])].sort();
}
function assertOnlyOwnedRows(rows, user) {
  assert.deepEqual(rows.map(row => row.key).sort(), expectedKeys(user));
  for (const other of users.filter(other => other.id !== user.id)) assert.ok(!JSON.stringify(rows).includes(content(other)), 'foreign content must not be stored');
  assert.ok(rows.every(row => row.syncState === 'synced'));
}
async function physicalRows(user, store) {
  const database = await new Promise((resolve, reject) => {
    const request = indexedDB.open(owner.databaseNameForOwner(user.id));
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(store).objectStore(store).getAll();
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
  } finally { database.close(); }
}

test('private bootstrap requires a real session and returns only the authenticated owner in every publication collection', async () => {
  token = null; assert.equal((await bootstrap.GET()).status, 401);
  for (const user of [alice, bob]) {
    select(user);
    const response = await bootstrap.GET(); const body = await response.json();
    assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(body.user.id, user.id);
    assert.deepEqual(body.farms.map(row => row.id), [id(user, 'farm')]);
    assert.deepEqual(body.records.map(row => row.id), [id(user, 'farm-record')]);
    assert.deepEqual(body.listings.map(row => row.id).sort(), ['active', 'pending', 'deleted'].map(status => id(user, 'listing', status)).sort());
    assert.ok([...body.farms, ...body.records, ...body.listings].every(row => row.ownerId === user.id));
    for (const type of publicationTypes.filter(type => type !== 'listing')) {
      const actual = body.entities.filter(row => row.entityType === type);
      const expected = ['active', 'pending', 'deleted'].map(status => id(user, type, status));
      if (type === 'social-comment') expected.push(id(user, type, 'cross'));
      assert.deepEqual(actual.map(row => row.id).sort(), expected.sort(), type);
      assert.equal(actual.find(row => row.id === id(user, type, 'deleted')).deleted, true);
      assert.ok(actual.every(row => (row.payload.ownerId ?? row.payload.actingUserId) === user.id), type);
    }
    const cross = body.entities.find(row => row.id === id(user, 'social-comment', 'cross'));
    assert.equal(cross.payload.postId, id(user.id === alice.id ? bob : alice, 'social-post'));
    for (const other of users.filter(other => other.id !== user.id)) assert.ok(!JSON.stringify(body).includes(content(other)), 'an owned reference never downloads the referenced foreign content');
  }
});

test('private bootstrap hydrates owned publications into separate account databases without using a public feed', async () => {
  for (const user of [alice, bob]) {
    select(user); const calls = routeFetch();
    assert.deepEqual(await db.hydrateFromServer(), { status: 'success' });
    assert.deepEqual(calls.map(call => call.url), ['/api/bootstrap']);
    assert.equal(calls[0].options.cache, 'no-store');
    const backup = await db.exportLocalBackup();
    assert.equal(backup.owner, user.id); assertOnlyOwnedRows(backup.entities, user);
    assert.deepEqual(backup.outbox, []); assert.equal(await db.getLastSync(), null, 'download never acknowledges queued writes');
    assertOnlyOwnedRows(await physicalRows(user, 'entities'), user);
  }
  select(alice); assertOnlyOwnedRows((await db.exportLocalBackup()).entities, alice);
  assert.notEqual(owner.databaseNameForOwner(alice.id), owner.databaseNameForOwner(bob.id));
});

test('private refresh preserves publication drafts, pending deletes, and new local publications exactly', async () => {
  select(drafts); routeFetch(); await db.hydrateFromServer();
  for (const type of publicationTypes) {
    const row = await db.getCachedEntity(type, id(drafts, type));
    await db.queueMutation({
      id: `draft_${type}`, expectedOwner: drafts.id, entityType: type, entityId: row.id, action: 'upsert',
      payload: { ...row.payload, draftOnly: `UNSENT_${type}` }, clientUpdatedAt: '2026-10-15T01:00:00.000Z',
    });
  }
  await db.queueMutation({ id: 'pending_publication_delete', expectedOwner: drafts.id, entityType: 'listing', entityId: id(drafts, 'listing', 'pending'), action: 'delete', payload: {} });
  await db.queueMutation({ id: 'new_unpublished_post', expectedOwner: drafts.id, entityType: 'social-post', entityId: 'new_owned_draft', action: 'upsert', payload: { text: 'Never sent draft', actingUserId: drafts.id } });
  const before = await db.exportLocalBackup();
  assert.deepEqual(await db.hydrateFromServer(), { status: 'success' });
  const after = await db.exportLocalBackup();
  assert.deepEqual(after.outbox, before.outbox);
  assert.deepEqual(after.entities.filter(row => row.syncState === 'pending'), before.entities.filter(row => row.syncState === 'pending'));
  assert.ok(!after.entities.some(row => row.id === id(drafts, 'listing', 'pending')), 'refresh cannot resurrect pending deletion');
  assert.equal(await db.getPendingCount(), 8);
});

test('logout closes access in this tab and another tab without deleting owned drafts or publications', async () => {
  select(drafts); routeFetch();
  await owner.rememberOfflineWorkspace(); secondTab.selectVerifiedDashboardOwner(drafts.id);
  const before = await db.exportLocalBackup();
  owner.prepareOfflineSignOut(); token = null; navigator.onLine = false;
  assert.equal(localStorage.getItem('venezuela-agro-trusted-offline-workspace'), null);
  assert.equal(sessionStorage.getItem('venezuela-agro-last-local-owner'), null);
  assert.equal(await owner.localOwner(), 'device-local');
  assert.equal(await secondTab.localOwner(), 'device-local', 'other tabs observe the sign-out boundary');
  const anonymous = await db.exportLocalBackup();
  assert.equal(anonymous.owner, 'device-local'); assert.deepEqual(anonymous.entities, []); assert.deepEqual(anonymous.outbox, []);
  assert.deepEqual(await physicalRows(drafts, 'entities'), before.entities);
  assert.deepEqual(await physicalRows(drafts, 'outbox'), before.outbox);
  select(drafts); const restored = await db.exportLocalBackup();
  assert.deepEqual(restored.entities, before.entities); assert.deepEqual(restored.outbox, before.outbox);
});

test('account switch drops the saved access hint and rejects a stale publication form while preserving both namespaces', async () => {
  select(drafts); routeFetch(); await owner.rememberOfflineWorkspace();
  const draftsBefore = await db.exportLocalBackup();
  select(switching); routeFetch(); await db.hydrateFromServer();
  assert.equal(localStorage.getItem('venezuela-agro-trusted-offline-workspace'), null);
  assertOnlyOwnedRows((await db.exportLocalBackup()).entities, switching);
  await assert.rejects(db.queueMutation({
    id: 'stale_form_write', expectedOwner: drafts.id, entityType: 'social-post', entityId: 'stale_form_post', action: 'upsert', payload: { text: 'Wrong account', actingUserId: drafts.id },
  }), /account_changed_reopen_form/);
  assert.deepEqual(await db.getPendingCount(), 0);
  assert.deepEqual(await physicalRows(drafts, 'entities'), draftsBefore.entities);
  assert.deepEqual(await physicalRows(drafts, 'outbox'), draftsBefore.outbox);
});

test('late owned-publication bootstrap after switching accounts or logout can only update its captured account', async () => {
  for (const boundary of ['account-switch', 'logout']) {
    select(late); const response = await bootstrap.GET(); const body = await response.json();
    let release;
    globalThis.fetch = async url => { assert.equal(url, '/api/bootstrap'); return new Promise(resolve => { release = resolve; }); };
    const hydration = db.hydrateFromServer();
    while (!release) await new Promise(resolve => setImmediate(resolve));
    if (boundary === 'account-switch') select(switching);
    else { owner.prepareOfflineSignOut(); token = null; navigator.onLine = false; }
    const activeBefore = await db.exportLocalBackup();
    release(new Response(JSON.stringify(body)));
    assert.deepEqual(await hydration, { status: 'success' });
    const activeAfter = await db.exportLocalBackup();
    assert.deepEqual(activeAfter.entities, activeBefore.entities); assert.deepEqual(activeAfter.outbox, activeBefore.outbox);
    assert.ok(!JSON.stringify(activeAfter).includes(content(late)));
    assertOnlyOwnedRows(await physicalRows(late, 'entities'), late);
  }
});

test('wrong-account bootstrap cannot add foreign publications or alter existing unsent drafts', async () => {
  select(bob); const foreign = await (await bootstrap.GET()).json();
  select(drafts); const before = await db.exportLocalBackup();
  globalThis.fetch = async url => { assert.equal(url, '/api/bootstrap'); return new Response(JSON.stringify(foreign)); };
  assert.deepEqual(await db.hydrateFromServer(), { status: 'account_changed' });
  const after = await db.exportLocalBackup();
  assert.deepEqual(after.entities, before.entities); assert.deepEqual(after.outbox, before.outbox); assert.deepEqual(after.meta, before.meta);
});
