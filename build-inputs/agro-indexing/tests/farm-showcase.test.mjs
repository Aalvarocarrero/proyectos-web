import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({ root, configFile: false, appType: 'custom', resolve: { alias: { '@': root } }, server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
after(() => vite.close());
const { createFarmShowcase } = await vite.ssrLoadModule('/lib/farm-showcase.ts');
const { readLayout } = await vite.ssrLoadModule('/components/farm-map-editor.tsx');
const { inside } = await vite.ssrLoadModule('/lib/illustrated-geometry.ts');
const fixture = JSON.parse(await readFile(root + 'lib/farm-demo-fixture.json', 'utf8'));

test('showcase always presents the complete current 10 ha fixture', () => {
  const model = createFarmShowcase();
  assert.equal(model.templateVersion, 10);
  assert.equal(model.farm.payload.areaSqM, 100000);
  assert.equal(model.areaRecords.length, 41);
  assert.equal(model.animalRecords.length, 101);
  assert.equal(model.cropAreas.length, 6);
  assert.equal(model.illustrated.areas.length, 41);
  assert.equal(model.illustrated.animals.length, 101);
  assert.deepEqual(model.records, fixture.records);
  assert.equal(model.records.length, 193);
});

test('showcase uses the existing exact layouts and canonical geometry adapter without fabricated placements', () => {
  const model = createFarmShowcase();
  assert.equal(model.boundary.basis, 'sketch');
  for (const [index, entry] of model.layouts.entries()) {
    assert.deepEqual(entry.layout, readLayout(entry.area, index, model.farm.payload.areaSqM));
  }
  for (const animal of model.illustrated.animals) {
    const row = model.animalRecords.find(record => record.id === animal.id);
    const area = model.illustrated.areas.find(record => record.id === animal.areaId);
    const placement = row.payload.data.demoPlanPlacement;
    const layout = model.layouts.find(entry => entry.area.id === animal.areaId).layout;
    assert.equal(placement.areaId, animal.areaId);
    assert.equal(animal.position.x, model.viewport.x + (layout.x + layout.width * placement.x / 100) * model.viewport.scale);
    assert.equal(animal.position.y, model.viewport.y + (layout.y + layout.height * placement.y / 100) * model.viewport.scale);
    assert.ok(inside(animal.position, area.outline));
    assert.ok(inside(animal.position, model.boundary.points));
  }
});

test('showcase instances cannot replace or mutate the canonical fixture or one another', () => {
  const first = createFarmShowcase();
  const second = createFarmShowcase();
  first.farm.payload.areaSqM = 9;
  first.records[0].payload.data.name = 'Changed only in this copy';
  first.listings[0].payload.title = 'Changed only in this copy';
  first.illustrated.areas[0].outline[0].x = 999;
  first.records.splice(0, 20);
  assert.deepEqual(second, createFarmShowcase());
  assert.deepEqual(second.records, fixture.records);
  assert.equal(second.farm.payload.areaSqM, 100000);
});

test('all two draft product examples come from the fixture without claiming publication', async () => {
  const model = createFarmShowcase();
  assert.equal(model.listings.length, 2);
  assert.deepEqual(model.listings, fixture.listings);
  assert.ok(model.listings.every(listing => listing.payload.status === 'draft'));
  const component = await readFile(root + 'components/farm-showcase.tsx', 'utf8');
  assert.match(component, /model\.listings\.map/);
  for (const field of ['title', 'category', 'location', 'status']) assert.ok(component.includes(`listing.payload.${field}`));
  assert.match(component, /No son ofertas publicadas ni indican disponibilidad real/);
  assert.match(component, /registros ficticios y \{model\.listings\.length\} borradores de productos/);
  for (const label of ['Pesajes', 'Ciclos productivos', 'Escenarios']) assert.ok(component.includes(`label: '${label}'`));
});

test('route is noindex and the view is fixture-only without demo loading, resets, writes or cache clearing', async () => {
  const [page, component, adapter] = await Promise.all(['app/finca-modelo/page.tsx', 'components/farm-showcase.tsx', 'lib/farm-showcase.ts'].map(path => readFile(root + path, 'utf8')));
  assert.match(page, /index: false, follow: false/);
  assert.match(adapter, /farm-demo-fixture\.json/);
  assert.match(adapter, /propertyOutlinePoints/);
  assert.match(adapter, /planViewport/);
  assert.match(adapter, /illustratedPlan/);
  for (const source of [page, component, adapter]) {
    assert.doesNotMatch(source, /loadDemo|mutateDemo|resetDemo|farm-demo-store|offline-db|localStorage|indexedDB|queueMutation|caches\.delete|Clear-Site-Data|\/api\/sync/);
  }
  assert.doesNotMatch(adapter, /from\s+['"][^'"]*farm-map-editor/);
  assert.match(component, /href="\/finca-demo"/);
  assert.match(component, /href="\/marketplace"/);
  assert.match(component, /Demostración de solo lectura/);
  assert.match(component, /data-masterplan-immersive/);
});

test('real 360 and illustrated 2D share fixture data and readonly area details', async () => {
  const component = await readFile(root + 'components/farm-showcase.tsx', 'utf8');
  assert.match(component, /<FarmMasterplanScene[\s\S]*?autoTour[\s\S]*?readOnly/);
  assert.doesNotMatch(component, /tourMode|cinematic/, 'the showcase cannot retain or restore an interior itinerary');
  assert.doesNotMatch(component, /initialDetail=/, 'the tour starts with the complete farm instead of a close-up');
  assert.match(component, /returnLabel="Ver plano 2D"/);
  assert.match(component, /<FarmIllustratedScene[\s\S]*?readOnly/);
  assert.equal((component.match(/areas=\{model\.illustrated\.areas\}/g) ?? []).length, 2);
  assert.equal((component.match(/animals=\{model\.illustrated\.animals\}/g) ?? []).length, 2);
  assert.match(component, /onReturn=\{\(\) => setView\('illustrated'\)\}/);
  assert.match(component, /<Dialog open=\{!!record\}/);
  assert.match(component, /Fichas vinculadas/);
  assert.match(component, /setOpenRecordId\(undefined\)/);
  assert.doesNotMatch(component, /<form|onSubmit|Guardar|Restablecer|disabled=/);
});

test('account services exclude the readonly route before mounting any real workspace services', async () => {
  const services = await readFile(root + 'components/account-services.tsx', 'utf8');
  assert.match(services, /path==="\/finca-modelo"/);
  assert.match(services, /path\.startsWith\("\/finca-modelo\/"\)/);
  assert.ok(services.indexOf('/finca-modelo') < services.indexOf('return <>'));
});

test('Mi Finca example entrypoints lead to current template without replacing saved practice',async()=>{const [dashboard,start]=await Promise.all(['components/farm-dashboard.tsx','components/farm-first-start.tsx'].map(p=>readFile(new URL('../'+p,import.meta.url),'utf8')));assert.match(dashboard,/<a href="\/finca-modelo"[^>]*>Mostrar ejemplos · finca de 10 ha<\/a>/);assert.match(start,/<a href="\/finca-modelo" className="button-dark">Mostrar ejemplos de 10 ha<\/a>/);assert.doesNotMatch(start,/resetDemo|mutateDemo|window\.location|choose\("demo"\)/);});
