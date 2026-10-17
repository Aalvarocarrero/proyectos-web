import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const navigationSource = await read('lib/navigation-state.ts');
// This pure helper has only a string/null signature; exercise it without a build runtime.
const { isNavigationActive } = await import('data:text/javascript,' + encodeURIComponent(navigationSource.replace('pathname: string | null, href: string): boolean', 'pathname, href)')));
test('navigation marks descendants without marking similarly named routes or anchors', () => {
  assert.equal(isNavigationActive('/marketplace', '/marketplace'), true);
  assert.equal(isNavigationActive('/marketplace/ganado', '/marketplace'), true);
  assert.equal(isNavigationActive('/marketplace-extra', '/marketplace'), false);
  assert.equal(isNavigationActive('/', '/#produccion'), false);
  assert.equal(isNavigationActive(null, '/app'), false);
  assert.equal(isNavigationActive('/app', '/'), false);
});
test('preview is non-indexed, labels examples and does not persist or transmit its sample form', async () => {
  const page = await read('app/diseno/page.tsx');
  const form = await read('components/design-form-example.tsx');
  assert.match(page, /index: false, follow: false/);
  for (const route of ['/finca-modelo', '/marketplace', '/tienda', '/red', '/aprende', '/profesionales', '/empresas']) assert.ok(page.includes(`"${route}"`));
  assert.match(form, /no guarda registros, no envía información/);
  assert.doesNotMatch(form, /fetch\(|localStorage|indexedDB|queueMutation/);
  assert.match(form, /aria-invalid=\{!!error\}/);
  assert.match(form, /role="alert"/);
  assert.match(form, /input.current\?\.focus\(\)/);
  assert.match(form, /type="reset"/);
});
test('connection indicator never equates browser connectivity with confirmed sync', async () => {
  const source = await read('components/connectivity-pill.tsx');
  assert.match(source, /no confirma sincronización/);
  assert.match(source, /solo lo guardado aquí/);
  assert.match(source, /aria-atomic="true"/);
});
test('shared controls preserve the brand and expose active, invalid and touch states', async () => {
  const css = await read('app/globals.css');
  for (const color of ['#f3ebdd', '#3e2a19', '#4c6b3a']) assert.ok(css.includes(color));
  assert.match(css, /--agro-control-min: 2\.75rem/);
  assert.match(css, /nav-link\[aria-current="page"\]/);
  assert.match(css, /:user-invalid/);
});
