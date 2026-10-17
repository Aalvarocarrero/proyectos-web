import assert from 'node:assert/strict';
import test, { before, beforeEach, afterEach, after } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

// LOCAL SYNTHETIC DRILL ONLY. These helpers are deliberately test-only: they are
// not a Sites/D1 export implementation, a production restore command, or proof
// of provider snapshots, live pagination, simultaneous D1/R2 consistency or RPO.
// Hashes detect corruption against a separately retained digest, not authenticity.
const root = fileURLToPath(new URL('..', import.meta.url));
const time = '2026-10-14T00:00:00.000Z';
const sha256 = value => createHash('sha256').update(value).digest('hex');
const digest = value => sha256(JSON.stringify(value));
const plain = value => JSON.parse(JSON.stringify(value));
const migrations = readdirSync(root + 'drizzle').filter(name => name.endsWith('.sql')).sort()
  .map(name => ({ name, sql: readFileSync(root + 'drizzle/' + name, 'utf8') }));
const migrationManifest = migrations.map(({ name, sql }) => ({ name, sha256: sha256(sql) }));
const directory = mkdtempSync(join(tmpdir(), 'agro-synthetic-restore-'));
const databases = new Set();
let database;
let objects = new Map();
let archive;
let archiveDigest;
let fixture;
let sequence = 0;

function newDatabase() {
  const db = new DatabaseSync(':memory:');
  databases.add(db);
  db.exec('PRAGMA foreign_keys = ON');
  for (const { sql } of migrations) db.exec(sql);
  return db;
}
function closeDatabase(db) { if (databases.delete(db)) db.close(); }
function tableNames(db) {
  return db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(row => row.name);
}
function columns(db, table) {
  assert.match(table, /^[a-z_]+$/);
  return db.prepare(`PRAGMA table_info("${table}")`).all().map(row => row.name);
}
function schemaDigest(db) {
  return digest(plain(db.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY type, name").all()));
}
function rows(db, table) {
  const order = table === 'knowledge_articles' ? 'slug' : 'id';
  return plain(db.prepare(`SELECT * FROM "${table}" ORDER BY "${order}"`).all());
}
function insert(table, value) {
  const names = Object.keys(value);
  database.prepare(`INSERT INTO "${table}" (${names.map(name => `"${name}"`).join(',')}) VALUES (${names.map(() => '?').join(',')})`).run(...Object.values(value));
}

// The env object remains stable while each test swaps in an independently
// restored SQLite database and fake bucket. Actual application modules run.
globalThis.__restoreUser = null;
globalThis.__restoreEnv = {
  DB: { prepare(sql) {
    const statement = database.prepare(sql);
    const bound = (values = []) => ({
      bind(...items) { return bound(items); },
      async run() { return { success: true, meta: statement.run(...values) }; },
      async all() { return { results: statement.all(...values) }; },
      async raw() { statement.setReturnArrays(true); return statement.all(...values); },
    });
    return bound();
  } },
  BUCKET: {
    async put(key, bytes, options = {}) { objects.set(key, { bytes: Buffer.from(bytes), options: plain(options) }); },
    async head(key) { return objects.has(key) ? { size: objects.get(key).bytes.length } : null; },
    async delete(keys) { for (const key of Array.isArray(keys) ? keys : [keys]) objects.delete(key); },
    async get(key) {
      const object = objects.get(key);
      return object ? {
        body: object.bytes,
        httpEtag: '"' + sha256(object.bytes) + '"',
        writeHttpMetadata(headers) {
          if (object.options.httpMetadata?.contentType) headers.set('content-type', object.options.httpMetadata.contentType);
          if (object.options.httpMetadata?.cacheControl) headers.set('cache-control', object.options.httpMetadata.cacheControl);
        },
      } : null;
    },
  },
};
const vite = await createServer({ configFile: false, appType: 'custom', root,
  resolve: { alias: { '@': root } },
  plugins: [{ name: 'synthetic-restore-env', enforce: 'pre',
    resolveId(id) {
      if (id === 'cloudflare:workers') return '\0restore-env';
      if (id.endsWith('/app/chatgpt-auth') || id.endsWith('/app/chatgpt-auth.ts')) return '\0restore-auth';
    },
    load(id) {
      if (id === '\0restore-env') return 'export const env = globalThis.__restoreEnv;';
      if (id === '\0restore-auth') return 'export async function getChatGPTUser() { return globalThis.__restoreUser; }';
    },
  }], server: { middlewareMode: true, hmr: false, ws: false, watch: null },
});
const sync = await vite.ssrLoadModule('/app/api/sync/route.ts');
const bootstrap = await vite.ssrLoadModule('/app/api/bootstrap/route.ts');
const market = await vite.ssrLoadModule('/app/api/marketplace/route.ts');
const companies = await vite.ssrLoadModule('/app/api/companies/route.ts');
const admin = await vite.ssrLoadModule('/app/api/admin/route.ts');
const media = await vite.ssrLoadModule('/app/api/media/[...key]/route.ts');
const consent = await vite.ssrLoadModule('/app/api/security/consent/route.ts');
const { CURRENT_POLICY_VERSION } = await vite.ssrLoadModule('/lib/policy-version.ts');
const { listingMediaKeys } = await vite.ssrLoadModule('/lib/marketplace-details.ts');

function login(id) {
  globalThis.__restoreUser = id ? { id, email: id === 'admin' ? 'alimentosparcelalosmorochos@gmail.com' : `${id}@example.test`, displayName: id, fullName: id } : null;
}
function request(path, method = 'GET', body) {
  const req = new Request('https://restore.test' + path, {
    method, headers: { origin: 'https://restore.test', 'content-type': 'application/json', 'x-local-owner': globalThis.__restoreUser?.id || 'device-local' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  Object.defineProperty(req, 'nextUrl', { value: new URL(req.url) });
  return req;
}
function operation(entityType, entityId, payload = {}, action = 'upsert', baseRevision = null) {
  return { id: 'restore_op_' + (++sequence), entityType, entityId, payload, action, baseRevision, clientUpdatedAt: time };
}
async function send(op) {
  const response = await sync.POST(request('/api/sync', 'POST', { operations: [op] }));
  return { status: response.status, ...await response.json() };
}
async function accepted(op) {
  const result = await send(op);
  assert.equal(result.status, 200);
  assert.deepEqual(result.rejected, [], JSON.stringify(result));
  assert.deepEqual(result.accepted, [op.id]);
  return result.revisions[op.id];
}
async function approve(entityType, id, expectedVersion) {
  login('admin');
  const response = await admin.PATCH(request('/api/admin', 'PATCH', { entityType, id, expectedVersion, status: 'active' }));
  assert.equal(response.status, 200, await response.text());
}
function photo(key) { return media.GET(request('/api/media/' + key), { params: Promise.resolve({ key: key.split('/') }) }); }
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jCrkAAAAASUVORK5CYII=';
const farmPayload = { name: 'Finca sintética Ávila', location: 'Apure', areaSqM: 10000, objective: 'Ensayo de recuperación' };
const listingPayload = { sellerName: 'Productor sintético', title: 'Herramienta de ensayo', description: 'Herramienta sintética para verificar una restauración local.', category: 'Herramientas y cercas', location: 'Apure, Venezuela', state: 'Apure', shortIntro: 'Herramienta sintética de ensayo', photoContext: 'Imagen sintética', currency: 'USD', priceCents: 1250 };
const companyPayload = { name: 'Empresa sintética de ensayo', category: 'Ferretería y construcción', state: 'Apure', municipality: 'San Fernando', description: 'Empresa sintética para verificar la restauración y sus permisos.', phone: '+584120000000', logoDataUrl: png, galleryDataUrls: [png], products: [{ id: 'tool-test', name: 'Herramienta de ensayo', category: 'Herramientas y cercas', priceCents: 1250, imageDataUrl: png }] };

async function seedFixture() {
  database = newDatabase();
  objects = new Map();
  for (const id of ['owner-a', 'owner-b', 'revoked-owner', 'admin']) {
    login(id);
    insert('users', { id, email: globalThis.__restoreUser.email, display_name: id, phone_e164: '+584120000000', created_at: time, updated_at: time });
    insert('user_consents', { id: 'consent-' + id, user_id: id, policy_version: CURRENT_POLICY_VERSION, essential_accepted: 1, public_content_accepted: 1, security_signals_accepted: 0, accepted_at: time });
  }
  login('revoked-owner');
  assert.equal((await consent.DELETE(request('/api/security/consent', 'DELETE'))).status, 200);
  // Historical consent and retired security rows must survive unchanged. All
  // material here is synthetic, unusable, and never an actual credential.
  insert('user_consents', { id: 'old-consent', user_id: 'owner-a', policy_version: 'synthetic-old-policy', essential_accepted: 1, public_content_accepted: 0, security_signals_accepted: 0, accepted_at: time, revoked_at: time });
  insert('trusted_devices', { id: 'legacy-device', user_id: 'owner-a', token_hash: 'synthetic-noncredential-hash', label: 'Dispositivo de ensayo retirado', created_at: time, expires_at: time, revoked_at: time });
  insert('passkey_credentials', { id: 'legacy-passkey', user_id: 'owner-a', webauthn_user_id: 'synthetic-noncredential-id', public_key: 'synthetic-invalid-public-key', counter: 3, device_type: 'singleDevice', created_at: time });
  insert('security_challenges', { id: 'legacy-challenge', user_id: 'owner-a', purpose: 'synthetic-retired', challenge: 'synthetic-invalid-challenge', created_at: time, expires_at: time, consumed_at: time });

  login('owner-a');
  const liveFarm = operation('farm', 'farm_a', farmPayload);
  await accepted(liveFarm);
  const interrupted = operation('farm', 'farm_a', { ...farmPayload, name: 'Finca con revisión recuperable' }, 'upsert', rows(database, 'farms')[0].revision);
  await accepted(interrupted);
  database.prepare("UPDATE sync_receipts SET receipt_status='pending' WHERE id=?").run(interrupted.id);
  const animal = operation('farm-record', 'animal_a', { farmId: 'farm_a', recordType: 'animal', category: 'Bovino', title: 'Animal sintético', data: { tag: 'TEST-001', notes: 'Texto con acentos: Ñandú; comillas " y saltos\nde línea.' } });
  await accepted(animal);
  await accepted(operation('farm-record', 'weight_a', { farmId: 'farm_a', recordType: 'weight', category: 'Bovino', title: 'Peso sintético', data: { animalId: 'animal_a', weight: 325, date: '2026-10-14' } }));
  const removed = operation('farm-record', 'record_deleted', { farmId: 'farm_a', recordType: 'inventory', title: 'Inventario retirado', data: { quantity: 0 } });
  const removedRevision = await accepted(removed);
  await accepted(operation('farm-record', removed.entityId, {}, 'delete', removedRevision));
  const farmDeleted = operation('farm', 'farm_deleted', { ...farmPayload, name: 'Finca retirada' });
  const farmDeletedRevision = await accepted(farmDeleted);
  await accepted(operation('farm-record', 'inherited_deleted', { farmId: 'farm_deleted', recordType: 'task', title: 'Tarea de finca retirada', data: { complete: false } }));
  await accepted(operation('farm', farmDeleted.entityId, {}, 'delete', farmDeletedRevision));
  const publicOp = operation('listing', 'listing_public', { ...listingPayload, imageDataUrl: png, additionalImageDataUrls: [png], sellerImageDataUrl: png });
  await approve('listing', publicOp.entityId, await accepted(publicOp));
  login('owner-a');
  const deletedListing = operation('listing', 'listing_deleted', { ...listingPayload, imageDataUrl: png });
  const deletedListingRevision = await accepted(deletedListing);
  await accepted(operation('listing', deletedListing.entityId, {}, 'delete', deletedListingRevision));
  login('owner-b');
  await accepted(operation('farm', 'farm_b', { ...farmPayload, name: 'Finca privada de B' }));
  await accepted(operation('listing', 'listing_pending', { ...listingPayload, imageDataUrl: png }));

  const companyIds = {};
  for (const status of ['active', 'pending', 'deleted']) {
    login(status === 'pending' ? 'owner-b' : 'owner-a');
    const response = await companies.POST(request('/api/companies', 'POST', { ...companyPayload,
      ...(status === 'active' ? { products: [{ ...companyPayload.products[0], marketplaceId: 'listing_public' }] } : {}),
    }));
    const body = await response.json();
    assert.equal(response.status, 201, JSON.stringify(body));
    companyIds[status] = body.company.id;
    if (status === 'active') await approve('company', body.company.id, body.company.revision);
    if (status === 'deleted') assert.equal((await companies.DELETE(request('/api/companies', 'DELETE', { id: body.company.id, expectedRevision: body.company.revision }))).status, 200);
  }
  // Populate remaining tables with synthetic historical rows so an accidentally
  // omitted table or nullable field cannot pass an otherwise empty roundtrip.
  insert('professionals', { id: 'professional_a', owner_id: 'owner-a', name: 'Profesional sintético', profession: 'Asesor agropecuario', specialties: 'Manejo de finca', state: 'Apure', service_mode: 'Presencial', introduction: 'Perfil de ensayo de recuperación', contact: 'synthetic@example.test', status: 'pending', revision: 'synthetic-professional-revision', created_at: time, updated_at: time });
  insert('project_proposals', { id: 'project_a', owner_id: 'owner-a', title: 'Proyecto sintético', sector: 'Agricultura', state: 'Apure', summary: 'Proyecto de ensayo', has_json: '["Terreno"]', needs_json: '["Asesoría"]', impact: 'Ensayo', requested_support: 'Asesoría', contact: 'synthetic@example.test', status: 'pending', revision: 'synthetic-project-revision', created_at: time, updated_at: time });
  login(null);
  const feedback = operation('feedback', 'feedback_a', { area: 'Sitio web', role: 'Productor', message: 'Sugerencia sintética para comprobar la recuperación.' });
  await accepted(feedback);
  login('owner-b');
  const order = operation('order', 'order_a', { customerName: 'Cliente sintético', email: 'synthetic@example.test', items: [{ id: 'synthetic-item', name: 'Herramienta sintética', quantity: 2, measure: 'unidad' }], note: 'Solicitud sintética, sin compra ni pago.' });
  await accepted(order);
  insert('knowledge_articles', { slug: 'articulo-sintetico', category: 'Pruebas', title: 'Artículo de ensayo', description: 'Contenido sintético para comprobar persistencia', body_json: '[{"heading":"Ensayo","paragraphs":["Contenido sintético."]}]', status: 'draft', created_at: time, updated_at: time });
  insert('public_farm_profiles', { id: 'public_farm_a', owner_id: 'owner-a', name: 'Perfil sintético', state: 'Apure', profile_json: JSON.stringify({ name: 'Perfil sintético', responsibleName: 'Responsable sintético', phone: '+584120000000', state: 'Apure', description: 'Descripción sintética para un ensayo de recuperación.', rubrics: 'Agricultura', purposes: ['Producción'] }), status: 'active', revision: 'synthetic-public-farm-revision', created_at: time, updated_at: time });
  insert('community_posts', { id: 'post_a', owner_id: 'owner-a', farm_id: 'public_farm_a', body: 'Publicación sintética', status: 'active', revision: 'synthetic-post-revision', created_at: time, updated_at: time });
  insert('community_comments', { id: 'comment_b', owner_id: 'owner-b', post_id: 'post_a', author_name: 'Usuario B sintético', body: 'Comentario sintético', status: 'pending', revision: 'synthetic-comment-revision', created_at: time, updated_at: time });
  insert('community_reactions', { id: 'post_a:owner-b', owner_id: 'owner-b', post_id: 'post_a', liked: 1, updated_at: time });
  const orphanKey = 'marketplace/listing/owner-a/unreferenced/unused/cover.png';
  await globalThis.__restoreEnv.BUCKET.put(orphanKey, Buffer.from(png.split(',')[1], 'base64'), { httpMetadata: { contentType: 'image/png', cacheControl: 'public, max-age=31536000' }, customMetadata: { purpose: 'synthetic-orphan' } });
  return { liveFarm, interrupted, animal, removed, removedRevision, farmDeleted, farmDeletedRevision, deletedListing, deletedListingRevision, publicOp, companyIds, orphanKey, feedback, order };
}

function exportArchive(db, bucket) {
  // The source is quiescent for this drill; a live exporter must establish and
  // document its own application-consistent D1/R2 capture boundary.
  const tables = tableNames(db).map(name => {
    const records = rows(db, name);
    return { name, columns: columns(db, name), rowCount: records.length, sha256: digest(records), rows: records };
  });
  const assets = [...bucket].sort(([a], [b]) => a.localeCompare(b)).map(([key, object]) => ({ key, size: object.bytes.length, sha256: sha256(object.bytes), metadata: plain(object.options), bodyBase64: object.bytes.toString('base64') }));
  return { format: 'venezuela-agro-synthetic-logical-backup', version: 1, capturedAt: time, migrations: migrationManifest, schemaSha256: schemaDigest(db), tables, assets };
}
function requiredMedia(db) {
  const keys = [];
  for (const row of rows(db, 'marketplace_listings')) keys.push(row.image_key, ...listingMediaKeys(row.contact));
  for (const row of rows(db, 'companies')) {
    const p = JSON.parse(row.profile_json);
    keys.push(p.logoKey, ...(p.galleryKeys || []), ...(p.products || []).map(product => product.imageKey));
  }
  for (const row of rows(db, 'professionals')) {
    if (row.credential_note.startsWith('{')) keys.push(JSON.parse(row.credential_note).details?.imageKey);
  }
  for (const row of rows(db, 'public_farm_profiles')) keys.push(JSON.parse(row.profile_json).imageKey);
  return [...new Set(keys.filter(Boolean))];
}
function validateRelationships(db, bucket) {
  assert.deepEqual(plain(db.prepare('PRAGMA foreign_key_check').all()), [], 'foreign key check');
  for (const table of tableNames(db)) {
    if (!columns(db, table).includes('owner_id')) continue;
    const missing = db.prepare(`SELECT id FROM "${table}" WHERE owner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE users.id = "${table}".owner_id)`).all();
    assert.deepEqual(missing, [], 'unknown owner in ' + table);
  }
  assert.equal(db.prepare('SELECT COUNT(*) n FROM farm_records r JOIN farms f ON f.id=r.farm_id WHERE r.owner_id != f.owner_id').get().n, 0, 'farm record owner mismatch');
  assert.equal(db.prepare('SELECT COUNT(*) n FROM community_posts p LEFT JOIN public_farm_profiles f ON f.id=p.farm_id WHERE f.id IS NULL OR p.owner_id != f.owner_id').get().n, 0, 'community farm ownership mismatch');
  for (const table of ['community_comments', 'community_reactions']) assert.equal(db.prepare(`SELECT COUNT(*) n FROM "${table}" c LEFT JOIN community_posts p ON p.id=c.post_id WHERE p.id IS NULL`).get().n, 0, 'missing community post');
  for (const key of requiredMedia(db)) assert.ok(bucket.has(key), 'missing referenced media: ' + key);
}
function restoreArchive(value, expectedDigest, { failAfterAssets = Infinity } = {}) {
  assert.equal(digest(value), expectedDigest, 'archive checksum mismatch');
  assert.equal(value.format, 'venezuela-agro-synthetic-logical-backup');
  assert.equal(value.version, 1);
  assert.deepEqual(value.migrations, migrationManifest, 'migration manifest mismatch');
  const db = newDatabase();
  const bucket = new Map();
  let transaction = false;
  try {
    assert.equal(value.schemaSha256, schemaDigest(db), 'schema mismatch');
    assert.deepEqual(value.tables.map(table => table.name), tableNames(db), 'table inventory mismatch');
    for (const table of value.tables) {
      assert.deepEqual(table.columns, columns(db, table.name), 'column inventory mismatch');
      assert.equal(table.rows.length, table.rowCount, 'row count mismatch');
      assert.equal(digest(table.rows), table.sha256, 'table checksum mismatch');
      for (const row of table.rows) assert.deepEqual(Object.keys(row), table.columns, 'record column mismatch');
    }
    for (const asset of value.assets) {
      assert.equal(typeof asset.key, 'string');
      assert.match(asset.key, /^(marketplace|companies)\/[a-zA-Z0-9_/%.-]+$/);
      assert.ok(!asset.key.includes('..'), 'unsafe asset key');
      assert.ok(!bucket.has(asset.key), 'duplicate asset key');
      const bytes = Buffer.from(asset.bodyBase64, 'base64');
      assert.equal(bytes.toString('base64'), asset.bodyBase64, 'noncanonical asset bytes');
      assert.equal(bytes.length, asset.size, 'asset size mismatch');
      assert.equal(sha256(bytes), asset.sha256, 'asset checksum mismatch');
      assert.ok(['image/png', 'image/jpeg', 'image/webp'].includes(asset.metadata.httpMetadata?.contentType), 'missing raster metadata');
      bucket.set(asset.key, { bytes, options: plain(asset.metadata) });
      if (bucket.size >= failAfterAssets) throw new Error('simulated staging storage interruption');
    }
    db.exec('BEGIN; PRAGMA defer_foreign_keys = ON');
    transaction = true;
    for (const table of value.tables) {
      const statement = db.prepare(`INSERT INTO "${table.name}" (${table.columns.map(name => `"${name}"`).join(',')}) VALUES (${table.columns.map(() => '?').join(',')})`);
      for (const row of table.rows) statement.run(...table.columns.map(name => row[name]));
    }
    validateRelationships(db, bucket);
    db.exec('COMMIT');
    transaction = false;
    assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
    return { database: db, objects: bucket };
  } catch (error) {
    if (transaction) db.exec('ROLLBACK');
    closeDatabase(db);
    throw error;
  }
}
function alteredArchive(change) {
  const changed = plain(archive);
  change(changed);
  return changed;
}
function resealTable(value, name) {
  const table = value.tables.find(table => table.name === name);
  table.rowCount = table.rows.length;
  table.sha256 = digest(table.rows);
}

before(async () => {
  fixture = await seedFixture();
  const { HOME_DEFAULTS } = await vite.ssrLoadModule('/lib/home-content.ts');
  database.prepare('INSERT INTO website_content (id, draft_json, published_json, revision, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?)').run('home', JSON.stringify({...HOME_DEFAULTS, heroTitle: 'Borrador sintético'}), JSON.stringify(HOME_DEFAULTS), crypto.randomUUID(), time, time);
  archive = exportArchive(database, objects);
  archiveDigest = digest(archive);
  writeFileSync(join(directory, 'synthetic-backup.json'), JSON.stringify(archive));
  writeFileSync(join(directory, 'synthetic-backup.sha256'), archiveDigest + '\n');
  closeDatabase(database);
  database = undefined;
  objects.clear();
});
beforeEach(() => {
  const restored = restoreArchive(JSON.parse(readFileSync(join(directory, 'synthetic-backup.json'), 'utf8')), readFileSync(join(directory, 'synthetic-backup.sha256'), 'utf8').trim());
  database = restored.database;
  objects = restored.objects;
  login(null);
});
afterEach(() => { closeDatabase(database); database = undefined; objects = new Map(); });
after(async () => {
  await vite.close();
  for (const db of databases) closeDatabase(db);
  rmSync(directory, { recursive: true, force: true });
  delete globalThis.__restoreEnv;
  delete globalThis.__restoreUser;
});

test('portable records and binary assets roundtrip across all immutable migrations and every populated application table', () => {
  assert.equal(migrations.length, 9);
  assert.equal(archive.tables.length, 20);
  for (const table of archive.tables) {
    assert.ok(table.rowCount > 0, table.name + ' is populated');
    assert.deepEqual(rows(database, table.name), table.rows, table.name + ' preserves every column');
  }
  assert.deepEqual(exportArchive(database, objects), archive, 'fresh export exactly matches the portable source archive');
  assert.equal(database.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
  assert.deepEqual(plain(database.prepare('PRAGMA foreign_key_check').all()), []);
  assert.equal(database.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
  assert.ok(archive.assets.length >= 15);
  for (const migration of migrationManifest) assert.equal(sha256(readFileSync(root + 'drizzle/' + migration.name)), migration.sha256, 'existing migration was not edited');
});

test('restored bootstrap isolates owners, preserves direct and inherited tombstones, and rejects cross-owner writes', async () => {
  assert.equal((await bootstrap.GET()).status, 401);
  login('owner-a');
  const a = await (await bootstrap.GET()).json();
  assert.deepEqual(a.farms.map(row => row.id).sort(), ['farm_a', 'farm_deleted']);
  assert.ok(a.records.find(row => row.id === 'record_deleted').deleted);
  assert.ok(a.records.find(row => row.id === 'inherited_deleted').deleted);
  assert.equal(database.prepare("SELECT deleted FROM farm_records WHERE id='inherited_deleted'").get().deleted, 0, 'parent tombstone survives without mutating its child');
  assert.ok(a.farms.find(row => row.id === 'farm_deleted').deleted);
  const farm = a.farms.find(row => row.id === 'farm_a');
  login('owner-b');
  const b = await (await bootstrap.GET()).json();
  assert.deepEqual(b.farms.map(row => row.id), ['farm_b']);
  assert.deepEqual(b.records, []);
  const denied = await send(operation('farm', farm.id, { ...farmPayload, name: 'Wrong owner' }, 'upsert', farm.revision));
  assert.equal(denied.rejected[0].reason, 'forbidden');
  assert.equal(database.prepare("SELECT owner_id, name FROM farms WHERE id='farm_a'").get().owner_id, 'owner-a');
  assert.equal(database.prepare("SELECT name FROM farms WHERE id='farm_a'").get().name, farm.name);
  const privateCompany = fixture.companyIds.active;
  assert.equal((await companies.GET(request('/api/companies?mine=1&id=' + privateCompany))).status, 404);
});

test('restored publication and R2 bytes obey public, private, withdrawn and unreferenced media boundaries', async () => {
  const publicListings = await (await market.GET(request('/api/marketplace'))).json();
  assert.deepEqual(publicListings.listings.map(row => row.id), ['listing_public']);
  for (const field of ['ownerId', 'revision', 'lastOperationId', 'lastOperationHash']) assert.equal(Object.hasOwn(publicListings.listings[0], field), false, field);
  const publicCompanies = await (await companies.GET(request('/api/companies'))).json();
  assert.deepEqual(publicCompanies.companies.map(row => row.id), [fixture.companyIds.active]);
  assert.equal(publicCompanies.companies[0].products[0].marketplaceId, 'listing_public');
  assert.equal(publicCompanies.companies[0].ownerId, undefined);
  assert.equal(publicCompanies.companies[0].revision, undefined);
  for (const listing of rows(database, 'marketplace_listings')) {
    for (const key of [listing.image_key, ...listingMediaKeys(listing.contact)]) {
      login(null);
      const response = await photo(key);
      const publicAccess = listing.status === 'active' && !listing.deleted;
      assert.equal(response.status, publicAccess ? 200 : 404, key);
      if (publicAccess) {
        assert.equal(response.headers.get('cache-control'), 'public, no-cache, must-revalidate');
        assert.equal(response.headers.get('content-type'), objects.get(key).options.httpMetadata.contentType);
        assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
        assert.equal(sha256(Buffer.from(await response.arrayBuffer())), sha256(objects.get(key).bytes));
      } else {
        login(listing.owner_id === 'owner-a' ? 'owner-b' : 'owner-a');
        assert.equal((await photo(key)).status, 404);
        login(listing.owner_id);
        const own = await photo(key);
        assert.equal(own.status, 200);
        assert.equal(own.headers.get('cache-control'), 'private, no-store');
      }
    }
  }
  for (const company of rows(database, 'companies')) {
    const p = JSON.parse(company.profile_json);
    for (const key of [p.logoKey, ...p.galleryKeys, ...p.products.map(product => product.imageKey)]) {
      login(null);
      assert.equal((await photo(key)).status, company.status === 'active' ? 200 : 404);
      login(company.owner_id);
      assert.equal((await photo(key)).status, company.status === 'deleted' ? 404 : 200);
    }
  }
  login('admin');
  assert.equal((await photo(fixture.orphanKey)).status, 404, 'restored orphan remains inaccessible even with permissive stored cache metadata');
});

test('restored accepted and interrupted sync receipts replay idempotently without losing revisions or resurrecting tombstones', async () => {
  login('owner-a');
  const beforeFarm = rows(database, 'farms');
  const beforeRecords = rows(database, 'farm_records');
  const beforeAssets = objects.size;
  const receiptCount = rows(database, 'sync_receipts').length;
  for (const op of [fixture.animal, fixture.interrupted]) {
    const result = await send(op);
    assert.deepEqual(result.accepted, [op.id]);
    const table = op.entityType === 'farm' ? 'farms' : 'farm_records';
    assert.equal(result.revisions[op.id], rows(database, table).find(row => row.id === op.entityId).revision);
  }
  assert.deepEqual(rows(database, 'farms'), beforeFarm);
  assert.deepEqual(rows(database, 'farm_records'), beforeRecords);
  assert.equal(objects.size, beforeAssets);
  assert.equal(rows(database, 'sync_receipts').length, receiptCount);
  assert.equal(database.prepare('SELECT receipt_status FROM sync_receipts WHERE id=?').get(fixture.interrupted.id).receipt_status, 'accepted');
  const collision = await send({ ...fixture.animal, payload: { ...fixture.animal.payload, title: 'Altered replay' } });
  assert.equal(collision.rejected[0].reason, 'operation_id_reused');
  const staleFarm = await send(operation('farm', 'farm_deleted', farmPayload, 'upsert', fixture.farmDeletedRevision));
  assert.equal(staleFarm.rejected[0].reason, 'version_conflict');
  const staleRecord = await send(operation('farm-record', 'record_deleted', fixture.removed.payload, 'upsert', fixture.removedRevision));
  assert.equal(staleRecord.rejected[0].reason, 'version_conflict');
  const staleListing = await send(operation('listing', 'listing_deleted', listingPayload, 'upsert', fixture.deletedListingRevision));
  assert.equal(staleListing.rejected[0].reason, 'version_conflict');
  assert.equal(database.prepare("SELECT deleted FROM farms WHERE id='farm_deleted'").get().deleted, 1);
  assert.equal(database.prepare("SELECT deleted FROM farm_records WHERE id='record_deleted'").get().deleted, 1);
  assert.equal(database.prepare("SELECT deleted FROM marketplace_listings WHERE id='listing_deleted'").get().deleted, 1);
});

test('restored order and anonymous feedback receipts prevent duplicates, including interrupted acceptance', async () => {
  const beforeOrders = rows(database, 'order_requests');
  const beforeFeedback = rows(database, 'feedback_submissions');
  const count = rows(database, 'sync_receipts').length;
  login('owner-b');
  assert.deepEqual((await send(fixture.order)).accepted, [fixture.order.id]);
  login(null);
  assert.deepEqual((await send(fixture.feedback)).accepted, [fixture.feedback.id]);
  for (const [op, owner] of [[fixture.order, 'owner-b'], [fixture.feedback, null]]) {
    database.prepare("UPDATE sync_receipts SET receipt_status='pending' WHERE id=?").run(op.id);
    login(owner);
    const replay = await send(op);
    assert.deepEqual(replay.accepted, [op.id]);
    assert.deepEqual(replay.rejected, []);
  }
  assert.equal(rows(database, 'sync_receipts').length, count);
  assert.deepEqual(rows(database, 'order_requests'), beforeOrders);
  assert.deepEqual(rows(database, 'feedback_submissions'), beforeFeedback);
});

test('restored consent revocation and retired security history remain effective and unchanged', async () => {
  login('revoked-owner');
  const beforeCount = rows(database, 'marketplace_listings').length;
  const denied = await send(operation('listing', 'revoked_new_listing', listingPayload));
  assert.equal(denied.rejected[0].reason, 'public_content_consent_required');
  assert.equal(rows(database, 'marketplace_listings').length, beforeCount);
  const company = await companies.POST(request('/api/companies', 'POST', companyPayload));
  assert.equal(company.status, 403);
  assert.equal((await company.json()).error, 'account_contact_required');
  for (const table of ['user_consents', 'trusted_devices', 'passkey_credentials', 'security_challenges']) assert.deepEqual(rows(database, table), archive.tables.find(item => item.name === table).rows, table);
});

test('record, ownership, publication and media corruption cannot pass the separately retained archive digest', () => {
  for (const change of [
    value => { value.tables.find(table => table.name === 'farms').rows[0].name = 'Corrupted'; },
    value => { value.tables.find(table => table.name === 'farms').rows[0].owner_id = 'owner-b'; },
    value => { value.tables.find(table => table.name === 'companies').rows.find(row => row.status === 'pending').status = 'active'; },
    value => { value.assets[0].bodyBase64 = Buffer.from('corrupted bytes').toString('base64'); },
    value => { value.assets[0].metadata.httpMetadata.contentType = 'text/html'; },
    value => { value.assets.pop(); },
  ]) assert.throws(() => restoreArchive(alteredArchive(change), archiveDigest), /archive checksum mismatch/);
});

test('structural, relational and asset validation rejects incomplete but rehashed synthetic archives', () => {
  const cases = [
    [value => { value.migrations.pop(); }, /migration manifest mismatch/],
    [value => { value.schemaSha256 = 'incorrect'; }, /schema mismatch/],
    [value => { value.tables.pop(); }, /table inventory mismatch/],
    [value => { value.tables[0].columns.push('unexpected_column'); }, /column inventory mismatch/],
    [value => { value.tables[0].rowCount++; }, /row count mismatch/],
    [value => { value.tables[0].sha256 = 'incorrect'; }, /table checksum mismatch/],
    [value => { value.assets[0].size++; }, /asset size mismatch/],
    [value => { value.assets[0].sha256 = 'incorrect'; }, /asset checksum mismatch/],
    [value => { value.assets[0].metadata = {}; }, /missing raster metadata/],
    [value => { value.assets.push(value.assets[0]); }, /duplicate asset key/],
    [value => { value.assets[0].key = 'companies/../escape.png'; }, /unsafe asset key/],
    [value => { value.assets = value.assets.filter(asset => asset.key !== requiredMedia(database)[0]); }, /missing referenced media/],
    [value => { const table = value.tables.find(item => item.name === 'farm_records'); table.rows[0].farm_id = 'missing-farm'; resealTable(value, table.name); }, /foreign key check/],
    [value => { const table = value.tables.find(item => item.name === 'farm_records'); table.rows[0].owner_id = 'owner-b'; resealTable(value, table.name); }, /farm record owner mismatch/],
    [value => { const table = value.tables.find(item => item.name === 'marketplace_listings'); table.rows[0].owner_id = 'missing-user'; resealTable(value, table.name); }, /unknown owner/],
  ];
  const before = exportArchive(database, objects);
  for (const [change, error] of cases) {
    const value = alteredArchive(change);
    assert.throws(() => restoreArchive(value, digest(value)), error);
    assert.deepEqual(exportArchive(database, objects), before, 'failed staging must not affect active fixture');
    assert.equal(databases.size, 1, 'failed candidate database is closed');
  }
});

test('interrupted staged asset restoration leaves the active database and bucket untouched and supports a clean retry', () => {
  const before = exportArchive(database, objects);
  assert.throws(() => restoreArchive(archive, archiveDigest, { failAfterAssets: 2 }), /simulated staging storage interruption/);
  assert.deepEqual(exportArchive(database, objects), before);
  assert.equal(databases.size, 1);
  const retried = restoreArchive(archive, archiveDigest);
  try { assert.deepEqual(exportArchive(retried.database, retried.objects), archive); }
  finally { closeDatabase(retried.database); }
});
