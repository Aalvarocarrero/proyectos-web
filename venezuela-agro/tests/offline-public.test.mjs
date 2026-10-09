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
let failTable = '', queries = [];
globalThis.__offlinePublicEnv = {
  DB: {
    prepare(query) {
      assert.match(query, /^select\s/i, 'the endpoint must be read-only');
      queries.push(query);
      const bind = (values = []) => ({
        bind(...args) { return bind(args); },
        async raw() {
          if (failTable && query.includes(failTable)) throw new Error('Synthetic database outage');
          const statement = sqlite.prepare(query); statement.setReturnArrays(true);
          return statement.all(...values);
        },
        async all() {
          if (failTable && query.includes(failTable)) throw new Error('Synthetic database outage');
          return { success: true, results: sqlite.prepare(query).all(...values) };
        },
      });
      return bind();
    },
  },
};
const vite = await createServer({
  appType: 'custom', configFile: false, root, resolve: { alias: { '@': root } },
  plugins: [{
    name: 'offline-public-test-env', enforce: 'pre',
    resolveId(id) {
      if (id === 'cloudflare:workers') return '\0offline-public-env';
      if (id.includes('chatgpt-auth')) throw new Error('The public snapshot must not import authentication');
    },
    load(id) { if (id === '\0offline-public-env') return 'export const env = globalThis.__offlinePublicEnv;'; },
  }], server: { middlewareMode: true, hmr: false, watch: null },
});
const route = await vite.ssrLoadModule('/app/api/offline-public/route.ts');
const { parseOfflinePublicSnapshot, OFFLINE_PUBLIC_KINDS, OFFLINE_PUBLIC_MAX_BYTES } = await vite.ssrLoadModule('/lib/offline-public-types.ts');
after(async () => { await vite.close(); sqlite.close(); delete globalThis.__offlinePublicEnv; });
const time = '2026-10-07T00:00:00.000Z';
const secret = 'PRIVATE_SENTINEL_NEVER_EXPORT';
const kinds = ['marketplace', 'professional', 'project', 'farm', 'post'];
function insert(table, fields) {
  const columns = Object.keys(fields);
  sqlite.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`).run(...Object.values(fields));
}
function seed(kind, id = kind + '_active', status = 'active', extra = {}) {
  const common = { id, owner_id: 'fixture-owner', status, revision: secret, last_operation_id: secret, last_operation_hash: secret };
  if (kind === 'marketplace') insert('marketplace_listings', {
    ...common, seller_name: secret, title: 'Venta de cacao', category: 'Cacao', description: 'Cacao público de muestra.',
    location: 'Sucre', contact: secret, image_key: secret, client_updated_at: time, server_updated_at: time, ...extra,
  });
  if (kind === 'professional') insert('professionals', {
    ...common, name: 'Profesional público', profession: 'Agronomía', specialties: 'Cacao', state: 'Sucre',
    service_mode: 'Presencial', introduction: 'Asesoría agrícola de muestra.', contact: secret,
    credential_note: JSON.stringify({ private: secret }), created_at: time, updated_at: time, ...extra,
  });
  if (kind === 'project') insert('project_proposals', {
    ...common, title: 'Proyecto de cacao', sector: 'Agrícola', state: 'Sucre', summary: 'Proyecto público de muestra.',
    has_json: JSON.stringify([secret]), needs_json: JSON.stringify([secret]), impact: secret, requested_support: secret,
    contact: secret, created_at: time, updated_at: time, ...extra,
  });
  if (kind === 'farm') insert('public_farm_profiles', {
    ...common, name: 'Finca pública', state: 'Sucre', profile_json: JSON.stringify({
      description: 'Descripción pública de la finca.', rubrics: 'Cacao y café',
      ownerId: secret, actingUserId: secret, phone: secret, responsibleName: secret,
      imageKey: secret, imageDataUrl: secret, socials: { email: secret }, private: secret,
    }), created_at: time, updated_at: time, ...extra,
  });
  if (kind === 'post') insert('community_posts', {
    ...common, farm_id: 'farm_active', body: 'Novedad pública de la finca.', created_at: time, updated_at: time, ...extra,
  });
}
beforeEach(() => {
  sqlite.exec(`DELETE FROM community_reactions; DELETE FROM community_comments; DELETE FROM community_posts;
    DELETE FROM public_farm_profiles; DELETE FROM marketplace_listings; DELETE FROM professionals;
    DELETE FROM project_proposals; DELETE FROM farm_records; DELETE FROM farms; DELETE FROM users;`);
  insert('users', { id: 'fixture-owner', email: secret + '@example.test', phone_e164: secret, created_at: time, updated_at: time });
  failTable = ''; queries = [];
});
async function download() {
  const response = await route.GET();
  return { response, body: await response.json() };
}
function allActive() { for (const kind of kinds) seed(kind); }

test('anonymous public projection includes only the explicit text allowlist and existing public routes', async () => {
  allActive();
  const { response, body } = await download();
  assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(body.schemaVersion, 1); assert.ok(Number.isFinite(Date.parse(body.generatedAt)));
  assert.deepEqual(body.truncatedKinds, []); assert.equal(body.items.length, 5);
  assert.deepEqual(parseOfflinePublicSnapshot(body), body);
  assert.deepEqual(body.items.map((item) => item.href), [
    '/marketplace/marketplace_active', '/profesionales/professional_active', '/proyectos', '/fincas/farm_active', '/red/post_active',
  ]);
  for (const item of body.items) {
    assert.deepEqual(Object.keys(item).sort(), ['kind', 'id', 'title', 'summary', 'location', 'category', 'href', 'updatedAt'].sort());
    assert.equal(item.updatedAt, time);
  }
  assert.equal(body.items.find((item) => item.kind === 'post').title, 'Finca pública');
  assert.equal(body.items.find((item) => item.kind === 'farm').summary, 'Descripción pública de la finca.');
  assert.equal(body.items.find((item) => item.kind === 'farm').category, 'Cacao y café');
  assert.equal(queries.length, 5);
  for (const query of queries) {
    assert.doesNotMatch(query, /\bselect\s+\*/i);
    assert.doesNotMatch(query, /owner_id|user_id|contact|credential_note|last_operation|revision/);
    assert.doesNotMatch(query.split(/\sfrom\s/i)[0],/image_key/);
  }
});

test('ownership, authentication, contacts, private records, raw JSON and personalized reactions never enter the snapshot', async () => {
  allActive();
  insert('farms', { id: 'private_farm', owner_id: 'fixture-owner', name: secret, client_updated_at: time, server_updated_at: time });
  insert('farm_records', { id: 'private_animal', owner_id: 'fixture-owner', farm_id: 'private_farm', record_type: 'animal', title: secret, data_json: JSON.stringify({ secret }), client_updated_at: time, server_updated_at: time });
  insert('community_reactions', { id: 'reaction_private', owner_id: 'fixture-owner', post_id: 'post_active', liked: 1, updated_at: time });
  insert('community_comments', { id: 'comment_private', owner_id: 'fixture-owner', post_id: 'post_active', author_name: secret, body: secret, status: 'active', created_at: time, updated_at: time });
  const { body } = await download();
  const encoded = JSON.stringify(body);
  assert.ok(!encoded.includes(secret));
  assert.doesNotMatch(encoded, /ownerId|userId|actingUserId|owner_id|user_id|"mine"|"liked"|contact|credential|profileJson|dataJson|imageKey|imageUrl|hasJson|needsJson/);
  assert.ok(!body.items.some((item) => item.id === 'private_farm' || item.id === 'private_animal'));
});

test('pending, rejected and deleted content is excluded in every category', async () => {
  allActive();
  for (const kind of kinds) for (const status of ['pending', 'rejected', 'deleted']) seed(kind, kind + '_' + status, status);
  seed('marketplace', 'active_but_deleted', 'active', { deleted: 1 });
  const { body } = await download();
  assert.deepEqual(body.items.map((item) => item.id), kinds.map((kind) => kind + '_active'));
});

test('posts require an active parent and post; missing, withdrawn or pending parents cannot leak posts', async () => {
  seed('farm'); seed('post');
  for (const status of ['pending', 'rejected', 'deleted']) {
    seed('farm', 'parent_' + status, status);
    seed('post', 'post_parent_' + status, 'active', { farm_id: 'parent_' + status });
  }
  seed('post', 'post_orphan', 'active', { farm_id: 'missing_parent' });
  const { body } = await download();
  assert.deepEqual(body.items.filter((item) => item.kind === 'post').map((item) => item.id), ['post_active']);
});

test('each category fetches at most 101 and returns its newest 100 with explicit truncation', async () => {
  seed('farm');
  for (const kind of kinds) {
    for (let index = 0; index < 103; index++) {
      const stamp = new Date(Date.parse(time) + index * 1000).toISOString();
      seed(kind, `${kind}_${String(index).padStart(3, '0')}`, 'active', kind === 'marketplace' ? { server_updated_at: stamp } : { updated_at: stamp });
    }
  }
  const { response, body } = await download();
  assert.equal(response.status, 200); assert.equal(body.items.length, 500);
  assert.deepEqual(body.truncatedKinds, kinds);
  for (const kind of kinds) {
    const items = body.items.filter((item) => item.kind === kind);
    assert.equal(items.length, 100); assert.equal(items[0].id, kind + '_102');
    assert.equal(items.at(-1).id, kind + '_003');
  }
  assert.ok(queries.every((query) => /limit \?/i.test(query)));
  assert.ok(Buffer.byteLength(JSON.stringify(body)) < OFFLINE_PUBLIC_MAX_BYTES);
});

test('exactly 100 rows are complete rather than incorrectly marked as truncated', async () => {
  for (let index = 0; index < 100; index++) seed('marketplace', 'listing_' + index);
  const { body } = await download(); assert.equal(body.items.length, 100); assert.deepEqual(body.truncatedKinds, []);
});

test('long public text is bounded and malformed or nontext farm JSON never becomes raw text', async () => {
  seed('marketplace', 'long_listing', 'active', { title: 'T'.repeat(300), description: 'S'.repeat(5000), location: 'L'.repeat(300), category: 'C'.repeat(700) });
  seed('farm', 'bad_json', 'active', { profile_json: '{broken:' + secret });
  seed('farm', 'object_json', 'active', { profile_json: JSON.stringify({ description: { secret }, rubrics: [secret] }) });
  const { response, body } = await download(); assert.equal(response.status, 200);
  const listing = body.items.find((item) => item.kind === 'marketplace');
  assert.equal(listing.title.length, 180); assert.equal(listing.summary.length, 2000);
  assert.equal(listing.location.length, 180); assert.equal(listing.category.length, 500);
  for (const farm of body.items.filter((item) => item.kind === 'farm')) {
    assert.equal(farm.summary, ''); assert.equal(farm.category, '');
  }
  assert.ok(!JSON.stringify(body).includes(secret));
});

test('a database failure reports 503 without partial or empty successful items', async () => {
  allActive(); failTable = 'professionals';
  const { response, body } = await download();
  assert.equal(response.status, 503); assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(body, { error: 'offline_public_unavailable' });
  failTable = ''; assert.equal((await download()).response.status, 200);
});

test('an actually empty public database returns a valid empty snapshot', async () => {
  const { response, body } = await download(); assert.equal(response.status, 200);
  assert.equal(body.schemaVersion, 1); assert.deepEqual(body.items, []); assert.deepEqual(body.truncatedKinds, []);
});

test('shared parser refuses private fields, wrong or external hrefs, duplicate entries, unknown versions and excess content', async () => {
  allActive(); const { body } = await download();
  const item = body.items[0];
  for (const invalid of [
    { ...body, mine: [] }, { ...body, ownerId: 'anything' }, { ...body, schemaVersion: 2 },
    { ...body, generatedAt: 'not-a-date' },
    { ...body, items: [{ ...item, contact: secret }] },
    { ...body, items: [{ ...item, href: 'https://outside.test/path' }] },
    { ...body, items: [{ ...item, href: '/admin' }] },
    { ...body, items: [item, item] },
    { ...body, truncatedKinds: ['marketplace', 'marketplace'] },
    { ...body, items: [{ ...item, summary: 'x'.repeat(2001) }] },
    { ...body, items: Array.from({ length: 101 }, (_, index) => ({ ...item, id: 'id_' + index, href: '/marketplace/id_' + index })) },
  ]) assert.throws(() => parseOfflinePublicSnapshot(invalid));
  const huge = OFFLINE_PUBLIC_KINDS.flatMap((kind) => Array.from({ length: 100 }, (_, index) => {
    const id = 'id_' + index;
    const path = { marketplace: '/marketplace/', professional: '/profesionales/', project: '/proyectos', farm: '/fincas/', post: '/red/' }[kind];
    return { ...item, kind, id, title: '🟢'.repeat(90), summary: '🟢'.repeat(1000), category: '🟢'.repeat(250), location: '🟢'.repeat(90), href: kind === 'project' ? path : path + id };
  }));
  assert.ok(Buffer.byteLength(JSON.stringify({ ...body, items: huge })) > OFFLINE_PUBLIC_MAX_BYTES);
  assert.throws(() => parseOfflinePublicSnapshot({ ...body, items: huge }));
});

test('new public snapshots omit missing-photo offers without deleting their records',async()=>{seed('marketplace','no_photo','active',{image_key:null});seed('marketplace','empty_photo','active',{image_key:''});const {body}=await download();assert.ok(!body.items.some(row=>['no_photo','empty_photo'].includes(row.id)));assert.equal(sqlite.prepare('select count(*) n from marketplace_listings where id in (?,?)').get('no_photo','empty_photo').n,2);});
