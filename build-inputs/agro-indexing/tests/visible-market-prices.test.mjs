import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,cacheDir:root+'.test-vite-cache/visible-market',optimizeDeps:{noDiscovery:true},resolve:{alias:{'@':root}},plugins:[{name:'visible-price-hooks',enforce:'pre',transform(code,id){if(id.includes('price-conversion.tsx?interaction'))return code.replace("from 'react'","from 'virtual:price-hooks'");},resolveId(id){if(id==='virtual:price-hooks')return '\0price-hooks';},load(id){if(id==='\0price-hooks')return `export const useState=v=>globalThis.__priceHooks.state(v);export const useId=()=>"price-test";export const useCallback=f=>f;export const useSyncExternalStore=(subscribe,get,getServer)=>{globalThis.__priceSubscribe=subscribe;return globalThis.__priceState;};`;}}],server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {PriceReferenceSummary}=await vite.ssrLoadModule('/components/price-conversion.tsx');
const {sourceDay,formatMoney}=await vite.ssrLoadModule('/lib/exchange-rates.ts');
const {exchangeRateClient}=await vite.ssrLoadModule('/lib/exchange-rate-client.ts');
const rates=Object.entries({VES:879.1225,COP:3181.74,EUR:1/1.1195}).map(([currency,perUsd])=>({currency,perUsd,validFrom:sourceDay(currency),validTo:sourceDay(currency),fetchedAt:new Date().toISOString()}));
const snapshot={version:1,rates};
const base={amount:100,currency:'USD',unit:'kg',snapshot,offline:false,busy:false,failed:[]};
const render=props=>renderToStaticMarkup(React.createElement(PriceReferenceSummary,{...base,...props}));

test('USD and VES references are visible with original price and unchanged unit',()=>{
 const usd=render({});assert.match(usd,/Dólares \(USD\) · original/);assert.match(usd,/USD 100,00/);assert.match(usd,/≈ VES 87.912,25/);assert.match(usd,/Referencia por kg/);assert.match(usd,/https:\/\/www.bcv.org.ve\//);assert.doesNotMatch(usd,/estimadas/);
 const ves=render({amount:87912.25,currency:'VES',unit:'caja'});assert.match(ves,/Bolívares \(VES\) · original/);assert.match(ves,/≈ USD 100,00/);assert.match(ves,/Referencia por caja/);
});
test('EUR and COP originals derive both references through verified source pairs',()=>{
 const eur=render({currency:'EUR'});assert.match(eur,/≈ USD 111,95/);assert.ok(eur.includes(formatMoney(111.95*879.1225,'VES')));assert.match(eur,/BCE/);assert.match(eur,/BCV/);assert.match(eur,/a través del dólar con ambas fuentes/);
 const cop=render({currency:'COP',amount:318174});assert.match(cop,/≈ USD 100,00/);assert.match(cop,/≈ VES 87.912,25/);assert.match(cop,/TRM Colombia/);
});
test('missing rate never invents an equivalent and identity price remains visible',()=>{
 const missing=render({snapshot:{version:1,rates:[]}});assert.match(missing,/USD 100,00/);assert.match(missing,/Sin tasa verificada/);assert.match(missing,/tasa verificada no disponible/);assert.doesNotMatch(missing,/≈|VES 0,00/);
 const loading=render({snapshot:{version:1,rates:[]},busy:true});assert.match(loading,/Consultando tasa…/);assert.match(loading,/USD 100,00/);
 const ves=render({currency:'VES',snapshot:{version:1,rates:[]}});assert.match(ves,/VES 100,00/);assert.doesNotMatch(ves,/USD 0,00|≈/);
});
test('cached/offline, old dated, and failed refresh references carry explicit warnings',()=>{
 assert.match(render({offline:true}),/Sin conexión: equivalencias estimadas/);
 assert.match(render({failed:['VES']}),/No se pudo actualizar: equivalencias estimadas/);
 const stale=render({snapshot:{version:1,rates:rates.map(rate=>({...rate,validFrom:'2020-01-01',validTo:'2020-01-03'}))}});assert.match(stale,/Tasa con fecha anterior/);assert.match(stale,/01\/01\/2020 al 03\/01\/2020/);assert.match(stale,/VES 87.912,25/);
});
test('zero is valid; invalid inputs never become fake money and large figures can wrap',()=>{
 const zero=render({amount:0});assert.match(zero,/USD 0,00/);assert.match(zero,/≈ VES 0,00/);
 for(const props of [{amount:-1},{amount:Infinity},{currency:'UNKNOWN'}])assert.doesNotMatch(render(props),/≈|(?:USD|VES) [0-9]/);
 assert.match(render({amount:-100,allowNegative:true}),/≈ VES -87.912,25/);
 assert.match(render({amount:1e12}),/min-w-0/);
});
test('EUR/COP one-tap actions select and open conversion without replacing original currency',async()=>{
 const {PriceConversion}=await vite.ssrLoadModule('/components/price-conversion.tsx?interaction');
 const slots=[];let cursor=0;globalThis.__priceHooks={state(v){const i=cursor++;if(!(i in slots))slots[i]=typeof v==='function'?v():v;return[slots[i],next=>slots[i]=typeof next==='function'?next(slots[i]):next];}};globalThis.__priceState={snapshot,offline:false,busy:false,failed:[],storageWarning:false};
 const nodes=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(nodes):[n,...nodes(n.props?.children)];
 const draw=(props={})=>{cursor=0;return PriceConversion({...base,showBasePrices:true,...props});};
 const originalSubscribe=exchangeRateClient.subscribe;let subscriptions=0;exchangeRateClient.subscribe=()=>{subscriptions++;return()=>{};};
 try{
  let tree=draw();globalThis.__priceSubscribe(()=>{});assert.equal(subscriptions,1);assert.ok(nodes(tree).some(n=>n.type?.name==='PriceReferenceSummary'));
  nodes(tree).find(n=>n.type==='button'&&n.props.children==='EUR').props.onClick();tree=draw();assert.equal(nodes(tree).find(n=>n.type==='select').props.value,'EUR');assert.equal(nodes(tree).find(n=>n.type?.name==='PriceReferenceSummary').props.currency,'USD');
  nodes(tree).find(n=>n.type==='button'&&n.props.children==='COP').props.onClick();tree=draw();assert.equal(nodes(tree).find(n=>n.type==='select').props.value,'COP');
  slots[0]=false;tree=draw({currency:'EUR'});assert.ok(!nodes(tree).some(n=>n.type==='button'&&n.props.children==='EUR'));assert.ok(nodes(tree).some(n=>n.type==='span'&&Array.isArray(n.props.children)&&n.props.children[0]==='EUR'));
  slots[0]=false;tree=draw({showBasePrices:false});globalThis.__priceSubscribe(()=>{});assert.equal(subscriptions,1);assert.ok(!nodes(tree).some(n=>n.type?.name==='PriceReferenceSummary'));
 }finally{exchangeRateClient.subscribe=originalSubscribe;delete globalThis.__priceHooks;delete globalThis.__priceState;delete globalThis.__priceSubscribe;}
});
