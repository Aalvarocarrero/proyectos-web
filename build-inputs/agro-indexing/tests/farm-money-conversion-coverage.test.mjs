import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const cacheDir = await mkdtemp('/tmp/agro-farm-money-coverage-');
const vite = await createServer({
  root, cacheDir, optimizeDeps: { noDiscovery: true }, appType: 'custom', configFile: false, resolve: { alias: { '@': root } },
  plugins: [{
    name: 'farm-money-coverage-hooks', enforce: 'pre',
    transform(code, id) {
      if (/farm-(intelligence|demo-workspace)\.tsx\?money-test/.test(id)) return code.replace('from "react";', 'from "virtual:farm-money-hooks";');
      if (id.endsWith('/components/site-image.tsx')) return `import React from 'react'; export function SiteImage({priority,fill,unoptimized,...props}){return React.createElement('img',props)}`;
    },
    resolveId(id) { if (id === 'virtual:farm-money-hooks') return '\0farm-money-hooks'; if (id === 'next/link') return '\0farm-money-link'; },
    load(id) {
      if (id === '\0farm-money-link') return `import React from 'react'; export default function Link({children,...props}){return React.createElement('a',props,children)}`;
      if (id === '\0farm-money-hooks') return `export const useState=initial=>globalThis.__farmMoneyStates.length?[globalThis.__farmMoneyStates.shift(),()=>{}]:[typeof initial==='function'?initial():initial,()=>{}];export const useEffect=()=>{};export const useCallback=f=>f;export const useMemo=f=>f();export const useRef=initial=>({current:initial});`;
    },
  }], server: { middlewareMode: true, hmr: false, ws: false, watch: null },
});
after(async () => { delete globalThis.__farmMoneyStates; await vite.close(); await rm(cacheDir, { recursive: true, force: true }); });
const { FarmRecordValue, FarmMoneyValue, farmMoneyAmount, isFarmMoneyField, farmMoneyDetailClass } = await vite.ssrLoadModule('/components/farm-record-money.tsx');
const { currencies, formatMoney } = await vite.ssrLoadModule('/lib/exchange-rates.ts');
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));
const count = html => (html.match(/aria-label="Cambio oficial de referencia"/g) || []).length;
const payload = (recordType, data) => ({ farmId: 'farm-test', recordType, data, title: 'Registro', category: 'General' });
const field = (record, name) => render(FarmRecordValue, { record, field: name, value: record.data[name] });

test('every supported original currency retains its real finance, per-unit and expected-revenue amount', () => {
  for (const currency of currencies) {
    for (const [recordType, name] of [['finance', 'amount'], ['plan', 'costPerUnit'], ['plan', 'expectedRevenue']]) {
      for (const amount of [0, 12.5, '12.5']) {
        const html = field(payload(recordType, { currency, [name]: amount }), name);
        assert.ok(html.includes(formatMoney(Number(amount), currency)));
        assert.equal(count(html), 1);
        assert.match(html, /aria-expanded="false"/);
      }
    }
  }
  assert.match(field(payload('finance', { amount: 17 }), 'amount'), /USD/);
});

test('only actual monetary fields are eligible; weights, animals, water and surface remain unconverted', () => {
  for (const [recordType, name] of [['animal', 'amount'], ['inventory', 'quantity'], ['weight', 'weightKg'], ['plan', 'quantity'], ['plan', 'days'], ['plan', 'feedPerUnit'], ['plan', 'waterPerUnitDay'], ['plan', 'areaPerUnit'], ['area', 'areaSqM']]) {
    assert.equal(isFarmMoneyField(recordType, name), false);
    assert.equal(count(field(payload(recordType, { [name]: 31 }), name)), 0);
  }
});

test('empty, malformed, negative unsigned and unknown-currency records do not invent an equivalent', () => {
  for (const value of [null, undefined, '', ' ', NaN, Infinity, {}, [], 'invalid']) {
    assert.equal(farmMoneyAmount(value), null);
    const html = field(payload('finance', { currency: 'USD', amount: value }), 'amount');
    assert.equal(count(html), 0);
    assert.match(html, /pendiente de revisión/);
  }
  assert.equal(count(field(payload('finance', { currency: 'USD', amount: -10 }), 'amount')), 0);
  assert.equal(count(field(payload('finance', { currency: 'unknown', amount: 25 }), 'amount')), 0);
  assert.equal(count(render(FarmMoneyValue, { amount: -10, currency: 'USD', allowNegative: true })), 1);
});

test('nested plan totals convert cost and signed margin without converting physical totals or mutating records', () => {
  const record = payload('plan', { currency: 'EUR', totals: { feed: 10, water: 20, area: 30, variableCost: 40, margin: -15 } });
  const before = structuredClone(record);
  const html = field(record, 'totals');
  assert.equal(count(html), 2);
  assert.ok(html.includes(formatMoney(-15, 'EUR')));
  for (const label of ['Insumo total (kg)', 'Agua estimada (L)', 'Área estimada (m²)', 'Costo variable', 'Margen preliminar']) assert.ok(html.includes(label));
  assert.doesNotMatch(html, /\[object Object\]/);
  assert.deepEqual(record, before);
});

const finances = [
  { id: 'income-usd', payload: payload('finance', { currency: 'USD', amount: 80, kind: 'Ingreso' }) },
  { id: 'cost-usd', payload: payload('finance', { currency: 'USD', amount: 120, kind: 'Costo' }) },
  { id: 'income-eur', payload: payload('finance', { currency: 'EUR', amount: 90000, kind: 'Ingreso' }) },
];

test('live planning places a converter at each input, cost, signed margin, portfolio total and movement', async () => {
  const { FarmIntelligence } = await vite.ssrLoadModule('/components/farm-intelligence.tsx?money-test');
  globalThis.__farmMoneyStates = [structuredClone(finances), 'Bovinos', 20, 30, 1, 1, 1, 'COP', 'USD', 4, 50];
  const html = render(FarmIntelligence, { farmId: 'farm-test' });
  assert.equal(count(html), 10); // four scenario amounts, three USD summary amounts, three original movements
  for (const [amount, currency] of [[80, 'COP'], [-30, 'COP'], [80, 'USD'], [120, 'USD'], [-40, 'USD'], [90000, 'EUR']]) assert.ok(html.includes(formatMoney(amount, currency)));
  assert.match(html, /Los totales de monedas distintas se consultan por separado y no se suman/);
  assert.ok(!html.includes(formatMoney(90080, 'USD')));
});

test('editable demo covers every currency-specific summary and every nested record amount', async () => {
  const { FarmDemoWorkspace } = await vite.ssrLoadModule('/components/farm-demo-workspace.tsx?money-test');
  const plan = { id: 'plan', payload: payload('plan', { currency: 'COP', costPerUnit: 4, expectedRevenue: 50, totals: { feed: 20, water: 600, area: 20, variableCost: 80, margin: -30 } }) };
  const state = { version: 1, revision: 0, generation: 0, updatedAt: '2026-10-14T00:00:00Z', farms: [], records: [...structuredClone(finances), plan], listings: [] };
  const before = structuredClone(state);
  globalThis.__farmMoneyStates = [state, 'Planificación y costos'];
  const html = render(FarmDemoWorkspace);
  assert.equal(count(html), 13); // six grouped totals, three movements, four plan values
  assert.ok(html.includes(formatMoney(-40, 'USD')));
  assert.ok(html.includes(formatMoney(-30, 'COP')));
  assert.ok(html.includes('USD · moneda original'));
  assert.ok(html.includes('EUR · moneda original'));
  assert.deepEqual(state, before);
});

test('real details, editable demo and readonly model all use typed-money rendering and live form previews', async () => {
  for (const path of ['components/farm-dashboard.tsx', 'components/farm-demo-workspace.tsx', 'components/farm-showcase.tsx']) {
    const source = await readFile(root + path, 'utf8');
    assert.match(source, /<FarmRecordValue record=\{/);
  }
  const demo = await readFile(root + 'components/farm-demo-workspace.tsx', 'utf8');
  assert.match(demo, /<CurrencyField value=\{currency\} onChange=\{setCurrency\}/);
  assert.match(demo, /setMoneyDraft\(current=>\(\{\.\.\.current,\[key\]:event.target.value\}\)\)/);
  assert.match(demo, /monetary&&preview!==null&&preview>=0&&<PriceConversion amount=\{preview\} currency=\{currency\}/);
  const live = await readFile(root + 'components/farm-intelligence.tsx', 'utf8');
  assert.match(live, /value=\{amount\} onChange=\{event=>setAmount\(event.target.value\)\}/);
  assert.match(live, /preview!==null&&preview>=0&&<PriceConversion amount=\{preview\} currency=\{currency\}/);
});


test('reference-only target selection is excluded from farm draft dirty-state changes', async () => {
  const form = await readFile(root + 'components/farm-record-form.tsx', 'utf8');
  assert.match(form, /function markEdited\(event:FormEvent<HTMLFormElement>\)\{if\(event.target instanceof Element&&event.target.closest\("\[data-price-conversion\]"\)\)return;dirty.current=true;/);
  const conversion = await readFile(root + 'components/price-conversion.tsx', 'utf8');
  assert.match(conversion, /<section[^>]+data-price-conversion/);
});

test('finance dialog clears money drafts only after an accepted close and retains the successful-save reset', async () => {
  const source = (await readFile(root + 'components/farm-intelligence.tsx', 'utf8')).split('function FinanceDialog(')[1].split('function HealthDialog(')[0];
  const match = source.match(/onOpenChange=\{(next=>\{.*?\})\}><DialogTrigger/);
  assert.ok(match, 'Use the actual close handler so rejected-close and reopen behavior cannot drift');
  for (const [allowed, next, expected] of [
    [true, false, [['open', false], ['amount', ''], ['currency', 'USD']]],
    [false, false, []],
    [true, true, [['open', true]]],
  ]) {
    const changes = [];
    const handler = new Function('canDismiss', 'setOpen', 'setAmount', 'setCurrency', `return (${match[1]});`)(
      () => allowed, value => changes.push(['open', value]), value => changes.push(['amount', value]), value => changes.push(['currency', value]),
    );
    handler(next);
    assert.deepEqual(changes, expected);
  }
  assert.match(source, /await onSubmit\(event\);setOpen\(false\);setAmount\(""\);setCurrency\("USD"\);/);
});


test('money fields use full record width through phone and two-column tablet layouts, restoring desktop at lg', async () => {
  for (const [type,field] of [['finance','amount'],['plan','costPerUnit'],['plan','expectedRevenue'],['plan','totals']]) {
    assert.equal(farmMoneyDetailClass(type,field),'col-span-full lg:col-span-1');
  }
  for (const [type,field] of [['animal','weightKg'],['area','areaSqM'],['inventory','amount'],['finance','currency'],['health','totals'],['plan','quantity']]) {
    assert.equal(farmMoneyDetailClass(type,field),'');
  }
  for (const filename of ['farm-demo-workspace.tsx','farm-showcase.tsx']) {
    const source=await readFile(root+'components/'+filename,'utf8');
    for (const tag of ['dt','dd']) assert.match(source,new RegExp('<'+tag+' className=\\{`[^`]*farmMoneyDetailClass\\('));
  }
  const dashboard=await readFile(root+'components/farm-dashboard.tsx','utf8');
  assert.match(dashboard, /<div key=\{key\} className=\{`[^`]*farmMoneyDetailClass\(record.payload.recordType,key\)/);
  const { FarmDemoWorkspace } = await vite.ssrLoadModule('/components/farm-demo-workspace.tsx?money-test');
  const plan={id:'layout-plan',payload:payload('plan',{currency:'USD',costPerUnit:2,expectedRevenue:50,quantity:4,totals:{variableCost:8,margin:42}})};
  globalThis.__farmMoneyStates=[{version:1,revision:0,generation:0,updatedAt:'2026-10-14T00:00:00Z',farms:[],records:[plan],listings:[]},'Planificación y costos'];
  const html=render(FarmDemoWorkspace);
  assert.equal((html.match(/<dt class="[^"]*col-span-full lg:col-span-1/g)||[]).length,3);
  assert.equal((html.match(/<dd class="[^"]*col-span-full lg:col-span-1/g)||[]).length,3);
});
