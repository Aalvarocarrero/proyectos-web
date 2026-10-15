import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const context = vm.createContext({ROHO_PUBLISHED_CATALOG: JSON.parse(fs.readFileSync(path.join(root,'server/default-catalog.json'),'utf8'))});
vm.runInContext(fs.readFileSync(path.join(root,'public/catalog.js'),'utf8'), context);
const catalog = context.RohoCatalog;
const ids = (state) => Array.from(catalog.filterProducts(state), (p) => p.id);

test('preserves the four existing reference prices without stock claims', () => {
  assert.deepEqual(ids(), ['roho-001','kit-origen','kit-camino','kit-pausa']);
  assert.deepEqual(Array.from(Object.values(catalog.products), p=>p.price), [48572,59622,111622,176622]);
  Object.values(catalog.products).forEach(p => { assert.equal(p.stock,null); assert.equal(p.availability,'Prelanzamiento'); assert.equal(p.priceType,'reference'); });
});
test('categories distinguish coffee from kits', () => {
  assert.deepEqual(ids({category:'coffee'}), ['roho-001']);
  assert.equal(ids({category:'kits'}).length,3);
});
test('search is accent/case insensitive and supports multiple words', () => {
  assert.equal(ids({q:'CAFE'}).length,4);
  assert.deepEqual(ids({q:'café CAMISETA'}), ['kit-camino']);
  assert.deepEqual(ids({q:'kit taza'}), ['kit-pausa']);
});
test('filters combine conjunctively and have a true empty state', () => {
  assert.deepEqual(ids({category:'kits',process:'Honey',q:'camiseta',edition:'ROHO 001'}), ['kit-camino']);
  assert.deepEqual(ids({category:'coffee',q:'taza'}), []);
  assert.deepEqual(ids({process:'Lavado'}), []);
});
test('all seven facets match existing records only', () => {
  for (const {key} of catalog.facets) {
    assert.ok(catalog.facetValues(key).length);
    for (const value of catalog.facetValues(key)) assert.ok(catalog.filterProducts({[key]:value}).every(p=>p[key]===value));
  }
});
test('sorting is deterministic and does not mutate the catalog order', () => {
  assert.deepEqual(ids({sort:'price-desc'}), ['kit-pausa','kit-camino','kit-origen','roho-001']);
  assert.equal(ids({sort:'price-asc'})[0],'roho-001');
  assert.equal(ids({sort:'name'})[0],'kit-camino');
  assert.equal(ids()[0],'roho-001');
});
test('future published products automatically populate filters; drafts remain hidden', () => {
  catalog.products['test-future'] = { ...catalog.products['roho-001'], id:'test-future',process:'Proceso de prueba',publicationStatus:'draft' };
  assert.equal(ids().length,4);
  assert.ok(!catalog.facetValues('process').includes('Proceso de prueba'));
  catalog.products['test-future'].publicationStatus = 'published';
  assert.ok(catalog.facetValues('process').includes('Proceso de prueba'));
  assert.deepEqual(ids({process:'Proceso de prueba'}), ['test-future']);
  delete catalog.products['test-future'];
});
test('all product imagery and edition references resolve', () => {
  for(const product of Object.values(catalog.products)) {
    assert.ok(fs.existsSync(path.join(root,'public',product.image)));
    assert.ok(catalog.harvests[product.edition]);
    assert.ok(catalog.categories.some(c=>c.id===product.categoryId));
  }
});
test('store navigation, accessibility hooks, scripts and PWA version are wired', () => {
  const html = fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  const sw = fs.readFileSync(path.join(root,'public/sw.js'),'utf8');
  assert.ok(html.includes('href="#tienda" data-store-nav'));
  assert.ok(html.includes('id="storeCount" role="status" aria-live="polite"'));
  assert.ok(html.indexOf('catalog.js?v=12') < html.indexOf('app.js?v=12'));
  assert.ok(html.indexOf('app.js?v=12') < html.indexOf('store.js?v=12'));
  assert.ok(sw.includes('rohocafe-v12'));
  for(const file of ['catalog.js','app.js','store.js']) assert.ok(sw.includes(`${file}?v=12`));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,'HTML IDs must be unique');
});
