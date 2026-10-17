import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,cacheDir:root+'.test-vite-cache/price-conversion',optimizeDeps:{noDiscovery:true},resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {createExchangeRateClient}=await vite.ssrLoadModule('/lib/exchange-rate-client.ts');
const {RATE_STORAGE_KEY}=await vite.ssrLoadModule('/lib/exchange-rates.ts');
const rate={currency:'COP',perUsd:4000,validFrom:'2026-10-14',validTo:'2026-10-14',fetchedAt:'2026-10-14T20:00:00.000Z'};
const response={version:1,rates:[rate],unavailable:['VES','EUR']};
function storage(initial){const map=new Map(initial?[[RATE_STORAGE_KEY,JSON.stringify(initial)]]:[]);return {getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,value)};}
const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props));

test('rate client is idle until requested, deduplicates fifty concurrent panels and reuses results after remount',async()=>{
 let calls=0,clock=new Date('2026-10-14T20:00:00Z');const options=[];
 const client=createExchangeRateClient({getStorage:()=>storage(),now:()=>clock,isOnline:()=>true,fetcher:async(url,config)=>{calls++;options.push({url,config});return Response.json(response);}});
 assert.equal(calls,0);
 const releases=Array.from({length:50},()=>client.subscribe(()=>{}));
 await Promise.all(Array.from({length:50},()=>client.refresh()));
 assert.equal(calls,1);assert.equal(client.getSnapshot().snapshot.rates[0].perUsd,4000);
 releases.forEach(release=>release());
 const release=client.subscribe(()=>{});await client.refresh();assert.equal(calls,1);
 await Promise.all([client.refresh(true),client.refresh(true),client.refresh(true)]);assert.equal(calls,2);
 clock=new Date('2026-10-14T21:01:00Z');await client.refresh();assert.equal(calls,3);
 for(const {url,config} of options){assert.equal(url,'/api/exchange-rates');assert.equal(config.body,undefined);assert.equal(config.method,undefined);assert.equal(config.credentials,'same-origin');}
 release();
});

test('shared rate freshness rolls over when an official source changes date, before hourly expiry',async()=>{
 let calls=0,clock=new Date('2026-10-15T03:50:00Z');
 const client=createExchangeRateClient({getStorage:()=>storage(),now:()=>clock,isOnline:()=>true,fetcher:async()=>{calls++;return Response.json(response);}});
 await client.refresh();clock=new Date('2026-10-15T03:59:59Z');await client.refresh();assert.equal(calls,1);
 clock=new Date('2026-10-15T04:00:00Z');await client.refresh();assert.equal(calls,2);
});

test('offline/error states preserve original official dates and cache; no synthetic rate on missing source',async()=>{
 let online=false,calls=0;const saved=storage({version:1,rates:[rate]});
 const client=createExchangeRateClient({getStorage:()=>saved,isOnline:()=>online,fetcher:async()=>{calls++;throw new Error('offline');}});
 await client.refresh();assert.equal(calls,0);assert.equal(client.getSnapshot().offline,true);
 assert.deepEqual(client.getSnapshot().snapshot.rates,[rate]);
 online=true;await client.refresh(true);assert.equal(calls,1);assert.deepEqual(client.getSnapshot().snapshot.rates,[rate]);
 assert.deepEqual(client.getSnapshot().failed,['VES','COP','EUR']);assert.equal(client.getSnapshot().busy,false);
 await client.refresh();assert.equal(calls,1);
 const empty=createExchangeRateClient({getStorage:()=>storage(),isOnline:()=>true,fetcher:async()=>Response.json({...response,rates:[{...rate,validFrom:'2026-02-30'}]})});
 await empty.refresh();assert.deepEqual(empty.getSnapshot().snapshot.rates,[]);
});

test('synchronous fetch/storage failures can be retried without stranding the shared promise',async()=>{
 let calls=0;
 const client=createExchangeRateClient({getStorage:()=>{throw new Error('denied');},isOnline:()=>true,fetcher:()=>{calls++;throw new Error('failed');}});
 await client.refresh();await client.refresh(true);assert.equal(calls,2);assert.equal(client.getSnapshot().busy,false);assert.equal(client.getSnapshot().storageWarning,true);
});

test('real and demo market amounts expose the converter; absent prices retain explicit quote-only state',async()=>{
 const {ListingPrice}=await vite.ssrLoadModule('/components/listing-price.tsx');
 const base={id:'sample',title:'Cacao',priceCents:1250,currency:'EUR',supplyUnit:'kg'};
 for(const demo of [true,false]){
  const html=render(ListingPrice,{listing:{...base,demo}});
  assert.match(html,/EUR 12,50/);assert.match(html,/por kg/);assert.match(html,/data-visible-base-prices/);assert.match(html,/Dólares \(USD\)/);assert.match(html,/Bolívares \(VES\)/);assert.match(html,/Fuentes y otras monedas/);assert.match(html,/aria-expanded="false"/);
 }
 const html=render(ListingPrice,{listing:{...base,priceCents:null}});
 assert.match(html,/Precio y disponibilidad por consultar/);assert.match(html,/Convertir un importe recibido/);assert.match(html,/Cacao: no hay un precio publicado/);assert.doesNotMatch(html,/EUR 0|USD 0|≈/);
});

test('professional cards use a declared modality rather than comparing different currencies',async()=>{
 const {ProfessionalTariffSummary}=await vite.ssrLoadModule('/components/professional-tariffs.tsx');
 const tariffs=[{mode:'Visitas programadas',amount:100,currency:'EUR',unit:'visita'},{mode:'Jornadas de campo',amount:450000,currency:'COP',unit:'jornada'}];
 const html=render(ProfessionalTariffSummary,{tariffs,mode:'Jornadas de campo',name:'Prueba',demo:true});
 assert.match(html,/COP 450.000,00/);assert.match(html,/Jornadas de campo · tarifa ficticia/);assert.match(html,/Ver precio aproximado en otra moneda/);assert.doesNotMatch(html,/EUR 100/);
 const missingMode=render(ProfessionalTariffSummary,{tariffs,mode:'Asesoría virtual',name:'Prueba'});assert.match(missingMode,/Asesoría virtual de Prueba: no hay un precio publicado/);assert.doesNotMatch(missingMode,/EUR 100|COP 450/);
 const empty=render(ProfessionalTariffSummary,{tariffs:[],name:'Prueba'});assert.match(empty,/no hay un precio publicado/);assert.doesNotMatch(empty,/USD 0/);
});

test('interactive conversion controls sit above stretched card actions, and closed quote calculators do not subscribe',async()=>{
 const price=await readFile(root+'components/price-conversion.tsx','utf8');
 const quote=await readFile(root+'components/currency-calculator.tsx','utf8');
 assert.match(price,/relative z-10/);assert.match(quote,/relative z-10/);
 assert.match(price,/const active=open\|\|showBasePrices/);assert.match(price,/active\?exchangeRateClient.subscribe/);assert.match(quote,/open&&valid\?<PriceConversion/);
 assert.doesNotMatch(price,/fetch\(|setInterval\(/);
});

test('all money-bearing commercial views and forms route through shared price or quote conversion',async()=>{
 const required={
  'marketplace-browser.tsx':['<ListingPrice'],
  'marketplace-detail.tsx':['<ListingPrice'],
  'marketplace-related-card.tsx':['<ListingPrice'],
  'marketplace-actions.tsx':['<PriceConversion amount={Number(amount)}'],
  'store-catalog.tsx':['<QuoteConversion context={p.name}','<QuoteConversion context={`${p.name}','<QuoteConversion context={`${l.name}'],
  'professional-directory.tsx':['<ProfessionalTariffSummary'],
  'professional-profile-view.tsx':['<ProfessionalTariffs'],
  'professional-tariffs.tsx':['<PriceConversion amount={tariff.amount}','<QuoteConversion'],
  'company-profile-view.tsx':['<PriceConversion amount={p.priceCents/100}','<QuoteConversion'],
  'company-manager.tsx':['<PriceConversion amount={p.priceCents/100}'],
  'listing-form.tsx':['<PriceConversion amount={Number(pricePreview)}'],
 };
 for(const [file,needles] of Object.entries(required)){
  const source=await readFile(root+'components/'+file,'utf8');for(const needle of needles)assert.ok(source.includes(needle),`${file}: ${needle}`);
 }
});

test('closing one of several open panels does not abort or duplicate the shared request',async()=>{
 let finish,calls=0,signal;
 const client=createExchangeRateClient({getStorage:()=>storage(),isOnline:()=>true,fetcher:async(_,config)=>{calls++;signal=config.signal;return await new Promise(resolve=>{finish=resolve;});}});
 const releaseOne=client.subscribe(()=>{}),releaseTwo=client.subscribe(()=>{});
 const pending=client.refresh();await Promise.resolve();releaseOne();
 assert.equal(signal.aborted,false);assert.equal(calls,1);
 finish(Response.json(response));await pending;
 assert.equal(client.getSnapshot().snapshot.rates[0].perUsd,4000);releaseTwo();
});
