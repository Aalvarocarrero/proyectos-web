import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const database = new DatabaseSync(':memory:');
for (const name of readdirSync(root + 'drizzle').filter(name => name.endsWith('.sql')).sort()) database.exec(readFileSync(root + 'drizzle/' + name, 'utf8'));
const objects = new Map();
globalThis.__companyUser = null;
globalThis.__companyEnv = {
  DB: { prepare(sql) { const statement = database.prepare(sql); const bound = (values = []) => ({ bind(...items) { return bound(items); }, async run() { return { success: true, meta: statement.run(...values) }; }, async all() { return { results: statement.all(...values) }; }, async raw() { statement.setReturnArrays(true); return statement.all(...values); } }); return bound(); } },
  BUCKET: { async head(key) { return objects.has(key) ? { size: objects.get(key).bytes.length } : null; }, async put(key, bytes, options) { objects.set(key, { bytes, options }); }, async delete(keys) { for (const key of Array.isArray(keys) ? keys : [keys]) objects.delete(key); }, async get(key) { const value = objects.get(key); return value ? { body: value.bytes, httpEtag: 'company-test', writeHttpMetadata(headers) { headers.set('content-type', value.options.httpMetadata.contentType); } } : null; } },
};
const vite = await createServer({ configFile: false, appType: 'custom', root, resolve: { alias: { '@': root } }, plugins: [{ name: 'company-test-env', enforce: 'pre', resolveId(id) { if (id === 'cloudflare:workers') return '\0company-env'; if (id.endsWith('/app/chatgpt-auth') || id.endsWith('/app/chatgpt-auth.ts')) return '\0company-auth'; }, load(id) { if (id === '\0company-env') return 'export const env=globalThis.__companyEnv;'; if (id === '\0company-auth') return 'export async function getChatGPTUser(){return globalThis.__companyUser;}'; } }], server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
const api = await vite.ssrLoadModule('/app/api/companies/route.ts');
const admin = await vite.ssrLoadModule('/app/api/admin/route.ts');
const media = await vite.ssrLoadModule('/app/api/media/[...key]/route.ts');
const { companySchema, companyImageUrl } = await vite.ssrLoadModule('/lib/company.ts');
const { decodeCompanyImage, listCompanies, findCompany } = await vite.ssrLoadModule('/lib/company-db.ts');
const { CURRENT_POLICY_VERSION } = await vite.ssrLoadModule('/lib/policy-version.ts');
after(async () => { await vite.close(); database.close(); delete globalThis.__companyEnv; delete globalThis.__companyUser; });
const time = '2026-10-11T23:00:00Z';
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jCrkAAAAASUVORK5CYII=';
const valid = { name: 'Empresa de prueba', category: 'Ferretería y construcción', state: 'Apure', municipality: 'San Fernando', description: 'Empresa sintética para comprobar el directorio y sus permisos.', phone: '+584121234567', products: [{ id: 'product-test', name: 'Herramienta de prueba', category: 'Herramientas y cercas', priceCents: 1250 }] };
function login(id, { consent = true, contact = true } = {}) { const email = id === 'admin' ? 'alvarojuniorcarrerovasquez@gmail.com' : `${id}@example.test`; globalThis.__companyUser = { id, email, displayName: id, fullName: id }; database.prepare('insert or ignore into users(id,email,phone_e164,created_at,updated_at) values(?,?,?,?,?)').run(id, email, contact ? '+584121234567' : null, time, time); database.prepare('insert or replace into user_consents(id,user_id,policy_version,essential_accepted,public_content_accepted,security_signals_accepted,accepted_at) values(?,?,?,?,?,?,?)').run('consent-' + id, id, CURRENT_POLICY_VERSION, 1, consent ? 1 : 0, 0, time); }
function request(path = '/api/companies', method = 'GET', body, origin = 'https://company.test') { const req = new Request('https://company.test' + path, { method, headers: { origin, 'content-type': 'application/json', 'x-local-owner': globalThis.__companyUser?.id || 'device-local' }, ...(body ? { body: JSON.stringify(body) } : {}) }); Object.defineProperty(req, 'nextUrl', { value: new URL(req.url) }); return req; }
async function create(value = valid) { const response = await api.POST(request('/api/companies', 'POST', value)); return { status: response.status, ...await response.json() }; }
async function approve(company) { login('admin'); const response = await admin.PATCH(request('/api/admin', 'PATCH', { entityType: 'company', id: company.id, expectedVersion: company.revision, status: 'active' })); assert.equal(response.status, 200); }
function photo(key) { return media.GET(request(), { params: Promise.resolve({ key: key.split('/') }) }); }

test('business registration requires authenticated identity, same origin, confirmed contact and current public consent', async () => {
  assert.equal((await create()).status, 401);
  login('no-contact', { contact: false }); assert.equal((await create()).error, 'account_contact_required');
  login('no-consent', { consent: false }); assert.equal((await create()).error, 'public_content_consent_required');
  login('owner-a'); assert.equal((await api.POST(request('/api/companies', 'POST', valid, 'https://attacker.test'))).status, 403);
  const noJson = request('/api/companies', 'POST', valid); noJson.headers.set('content-type', 'text/plain'); assert.equal((await api.POST(noJson)).status, 415);
  assert.equal(database.prepare('select count(*) as count from companies').get().count, 0);
});

test('input validation rejects restricted catalogue items, unsafe links, duplicated IDs, money and oversize photos', () => {
  assert.equal(companySchema.safeParse(valid).success, true);
  assert.equal(companySchema.safeParse({ ...valid, category: 'unknown' }).success, false);
  assert.equal(companySchema.safeParse({ ...valid, website: 'javascript:alert(1)' }).success, false);
  assert.equal(companySchema.safeParse({ ...valid, instagram: 'https://attacker.test/instagram.com' }).success, false);
  assert.equal(companySchema.safeParse({ ...valid, logoDataUrl: 'data:image/svg+xml;base64,AAAA' }).success, false);
  assert.equal(companySchema.safeParse({ ...valid, logoDataUrl: 'data:image/png;base64,' + 'A'.repeat(650000) }).success, false);
  for (const name of ['Ivermectina para ganado', 'Antibióticos inyectables', 'Vacuna de prueba', 'Herbicida de prueba']) assert.equal(companySchema.safeParse({ ...valid, products: [{ ...valid.products[0], name }] }).success, false);
  assert.equal(companySchema.safeParse({ ...valid, products: [valid.products[0], valid.products[0]] }).success, false);
  assert.equal(companySchema.safeParse({ ...valid, products: [{ ...valid.products[0], priceCents: -1 }] }).success, false);
  assert.equal(companySchema.safeParse({ ...valid, galleryDataUrls: Array(7).fill(png) }).success, false);
  assert.equal(companyImageUrl('https://attacker.test/a.png'), null);
  assert.ok(decodeCompanyImage(png).bytes.length > 0);
  assert.throws(() => decodeCompanyImage('data:image/png;base64,' + btoa('<html>this is not an image</html>')));
});

let first;
test('new businesses and photographs are private until moderation, with no fake seed companies', async () => {
  assert.deepEqual(await listCompanies(), []);
  login('owner-a'); const created = await create({ ...valid, logoDataUrl: png, galleryDataUrls: [png], products: [{ ...valid.products[0], imageDataUrl: png }] });
  assert.equal(created.status, 201); first = created.company;
  assert.equal(first.status, 'pending'); assert.ok(first.revision); assert.equal(first.galleryUrls.length, 1); assert.ok(first.products[0].imageUrl); assert.equal(first.logoDataUrl, undefined);
  assert.equal(objects.size, 3); assert.equal((await photo(first.logoKey)).status, 200);
  assert.equal((await (await api.GET(request('/api/companies?mine=1'))).json()).companies.length, 1);
  globalThis.__companyUser = null; assert.equal((await photo(first.logoKey)).status, 404); assert.equal(await findCompany(first.id), null);
  const publicData = await (await api.GET(request())).json(); assert.deepEqual(publicData.companies, []);
  assert.equal((await api.GET(request('/api/companies?mine=1'))).status, 401);
  login('owner-b'); assert.deepEqual((await (await api.GET(request('/api/companies?mine=1'))).json()).companies, []);
  assert.equal((await api.PATCH(request('/api/companies', 'PATCH', { ...valid, id: first.id, expectedRevision: first.revision }))).status, 404);
});

test('approved directory data is public and searchable without owner or revision leakage', async () => {
  await approve(first); globalThis.__companyUser = null;
  const result = await (await api.GET(request('/api/companies?q=Empresa&estado=Apure&categoria=Ferreter%C3%ADa%20y%20construcci%C3%B3n'))).json();
  assert.equal(result.companies.length, 1); assert.equal(result.companies[0].ownerId, undefined); assert.equal(result.companies[0].revision, undefined);
  assert.equal(result.companies[0].profileJson, undefined); assert.equal(result.companies[0].logoDataUrl, undefined);
  assert.equal((await photo(first.logoKey)).status, 200); assert.equal((await photo(first.logoKey)).headers.get('cache-control'), 'public, no-cache, must-revalidate');
  assert.equal((await listCompanies({ state: 'Lara' })).length, 0);
  assert.equal((await findCompany(first.id)).name, valid.name);
});

test('owner edits reset moderation, stale writes preserve newest content and old media paths stop resolving', async () => {
  login('owner-a'); let own = (await (await api.GET(request('/api/companies?mine=1&id=' + first.id))).json()).company;
  const changed = await api.PATCH(request('/api/companies', 'PATCH', { ...valid, name: 'Empresa actualizada', id: own.id, expectedRevision: own.revision, logoDataUrl: png }));
  assert.equal(changed.status, 200); const updated = (await changed.json()).company; assert.equal(updated.status, 'pending'); assert.notEqual(updated.logoKey, first.logoKey);
  const stale = await api.PATCH(request('/api/companies', 'PATCH', { ...valid, id: own.id, expectedRevision: own.revision })); assert.equal(stale.status, 409);
  assert.equal(database.prepare('select name from companies where id=?').get(first.id).name, 'Empresa actualizada');
  assert.equal((await photo(first.logoKey)).status, 404);
  globalThis.__companyUser = null; assert.equal(await findCompany(first.id), null); assert.equal((await photo(updated.logoKey)).status, 404);
  login('admin'); const staleApproval = await admin.PATCH(request('/api/admin', 'PATCH', { entityType: 'company', id: own.id, expectedVersion: own.revision, status: 'active' })); assert.equal(staleApproval.status, 409);
  first = updated;
});

test('foreign or unreferenced media keys cannot be adopted by a different company', async () => {
  login('owner-b'); const before = objects.size; const result = await create({ ...valid, logoKey: first.logoKey }); assert.equal(result.status, 403); assert.equal(objects.size, before);
  login('owner-a'); const own = await create({ ...valid, logoKey: first.logoKey }); assert.equal(own.status, 403);
});

test('marketplace links must be active and owned, and disappear if that listing is later withdrawn', async () => {
  login('owner-link');
  database.prepare("insert into marketplace_listings(id,owner_id,seller_name,title,description,category,location,status,client_updated_at,server_updated_at) values(?,?,?,?,?,?,?,?,?,?)").run('owned-listing', 'owner-link', 'Test seller', 'Herramienta', 'Herramienta general de prueba', 'Herramientas y cercas', 'Apure', 'active', time, time);
  let result = await create({ ...valid, products: [{ ...valid.products[0], marketplaceId: 'owned-listing' }] }); assert.equal(result.status, 201); const linked = result.company;
  await approve(linked); assert.equal((await findCompany(linked.id)).products[0].marketplaceId, 'owned-listing');
  login('owner-b'); result = await create({ ...valid, products: [{ ...valid.products[0], marketplaceId: 'owned-listing' }] }); assert.equal(result.status, 422);
  database.prepare("update marketplace_listings set status='rejected' where id='owned-listing'").run(); assert.equal((await findCompany(linked.id)).products[0].marketplaceId, '');
});

test('moderation checks referenced photographs and withdrawal is revision-checked and owner-only', async () => {
  const saved = objects.get(first.logoKey); objects.delete(first.logoKey); login('admin');
  let response = await admin.PATCH(request('/api/admin', 'PATCH', { entityType: 'company', id: first.id, expectedVersion: first.revision, status: 'active' })); assert.equal(response.status, 422);
  objects.set(first.logoKey, saved); await approve(first);
  login('owner-a'); const own = (await (await api.GET(request('/api/companies?mine=1&id=' + first.id))).json()).company;
  login('owner-b'); response = await api.DELETE(request('/api/companies', 'DELETE', { id: first.id, expectedRevision: own.revision })); assert.equal(response.status, 409);
  login('owner-a'); response = await api.DELETE(request('/api/companies', 'DELETE', { id: first.id, expectedRevision: own.revision })); assert.equal(response.status, 200);
  assert.equal(await findCompany(first.id), null); assert.equal((await photo(first.logoKey)).status, 404);
  assert.equal((await api.PATCH(request('/api/companies', 'PATCH', { ...valid, id: first.id, expectedRevision: own.revision }))).status, 404);
  login('admin'); response = await admin.PATCH(request('/api/admin', 'PATCH', { entityType: 'company', id: first.id, expectedVersion: own.revision, status: 'active' })); assert.equal(response.status, 409);
});

test('untrusted ownership/status are ignored, oversized requests and spoofed rasters never persist', async () => {
  login('guard-owner');
  const created = await create({ ...valid, ownerId: 'another-owner', status: 'active', revision: 'forged' });
  assert.equal(created.status, 201); assert.equal(created.company.status, 'pending');
  assert.equal(database.prepare('select owner_id from companies where id=?').get(created.company.id).owner_id, 'guard-owner');
  const count = database.prepare('select count(*) n from companies').get().n;
  const tooLarge = request('/api/companies', 'POST', valid); tooLarge.headers.set('content-length', String(9 * 1024 * 1024));
  assert.equal((await api.POST(tooLarge)).status, 413);
  const spoof = await create({ ...valid, logoDataUrl: 'data:image/png;base64,' + btoa('<html>not a real photograph</html>') });
  assert.equal(spoof.status, 400);
  assert.equal(database.prepare('select count(*) n from companies').get().n, count);
});

test('partial storage failure cleans new objects and leaves database unchanged', async () => {
  login('storage-owner'); const before = objects.size;
  const count = database.prepare('select count(*) n from companies').get().n;
  const put = globalThis.__companyEnv.BUCKET.put;
  let calls = 0;
  globalThis.__companyEnv.BUCKET.put = async (...args) => { if (++calls === 2) throw new Error('storage interrupted'); return put(...args); };
  try {
    const result = await create({ ...valid, logoDataUrl: png, galleryDataUrls: [png] });
    assert.equal(result.status, 503); assert.equal(objects.size, before);
    assert.equal(database.prepare('select count(*) n from companies').get().n, count);
  } finally { globalThis.__companyEnv.BUCKET.put = put; }
});

test('an edit race after uploads cannot overwrite a more recent revision or delete its images', async () => {
  login('race-owner'); const created = await create({ ...valid, logoDataUrl: png }); assert.equal(created.status, 201);
  const company = created.company; const before = objects.size;
  const put = globalThis.__companyEnv.BUCKET.put;
  globalThis.__companyEnv.BUCKET.put = async (...args) => { await put(...args); database.prepare('update companies set revision=?, name=? where id=?').run('newer-concurrent-revision', 'Concurrent company name', company.id); };
  try {
    const response = await api.PATCH(request('/api/companies', 'PATCH', { ...valid, id: company.id, expectedRevision: company.revision, logoDataUrl: png }));
    assert.equal(response.status, 409); assert.equal(objects.size, before); assert.ok(objects.has(company.logoKey));
    assert.equal(database.prepare('select name from companies where id=?').get(company.id).name, 'Concurrent company name');
  } finally { globalThis.__companyEnv.BUCKET.put = put; }
});


test('account changes cannot submit an old draft or hydrate the previous account panel', async () => {
  login('switched-owner');
  const mutation = request('/api/companies', 'POST', valid); mutation.headers.set('x-local-owner', 'previous-owner');
  assert.equal((await api.POST(mutation)).status, 409);
  const missing = request('/api/companies', 'POST', valid); missing.headers.delete('x-local-owner');
  assert.equal((await api.POST(missing)).status, 409);
  const mine = request('/api/companies?mine=1'); mine.headers.set('x-local-owner', 'previous-owner');
  assert.equal((await api.GET(mine)).status, 409);
  const current = await (await api.GET(request('/api/companies?mine=1'))).json();
  assert.equal(current.owner, 'switched-owner'); assert.deepEqual(current.companies, []);
});
