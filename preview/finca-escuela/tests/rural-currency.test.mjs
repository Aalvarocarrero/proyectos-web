import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const rates=await vite.ssrLoadModule('/lib/exchange-rates.ts');
const source=await vite.ssrLoadModule('/lib/exchange-rate-sources.ts');
const details=await vite.ssrLoadModule('/lib/marketplace-details.ts');
const {listingPayloadSchema}=await vite.ssrLoadModule('/lib/sync-validation.ts');
const now=new Date('2026-10-14T22:00:00Z');
const trm=(date='2026-10-14',value='4000',end=date)=>({valor:value,unidad:'COP',vigenciadesde:date+'T00:00:00.000',vigenciahasta:end+'T00:00:00.000'});
const ecb=(date='2026-10-14',value='1.25')=>`<gesmes:Envelope xmlns="http://www.ecb.int/vocabulary/2002-08-01/eurofxref"><gesmes:Sender><gesmes:name>European Central Bank</gesmes:name></gesmes:Sender><Cube><Cube time='${date}'><Cube currency='USD' rate='${value}'/></Cube></Cube></gesmes:Envelope>`;
const bcv=(date='2026-10-14',value='50,0000')=>`<div id="dolar"><div class="col-sm-6"><span>USD</span></div><div><strong> ${value} </strong></div></div><span class="date-display-single" property="dc:date" datatype="xsd:dateTime" content="${date}T00:00:00-04:00">Fecha</span>`;
const rate=(currency,perUsd,date='2026-10-14')=>({currency,perUsd,validFrom:date,validTo:date,fetchedAt:now.toISOString()});
const snapshot={version:1,rates:[rate('VES',50),rate('COP',4000)]};
test('official TRM selects effective local day, not the first future rate, including midnight and holidays',()=>{
 assert.equal(source.parseTrm([trm('2026-10-15','5000'),trm()],now).perUsd,4000);
 assert.equal(source.parseTrm([trm('2026-10-15','5000'),trm()],new Date('2026-10-15T02:00:00Z')).perUsd,4000);
 assert.equal(source.parseTrm([trm('2026-10-10','3000','2026-10-13')],new Date('2026-10-12T15:00:00Z')).perUsd,3000);
 assert.throws(()=>source.parseTrm([trm('2026-10-15')],now));
 assert.throws(()=>source.parseTrm([trm('2026-10-13')],now));
});
test('rates reject missing, zero, NaN, invalid calendar dates, invalid currency and malformed data',()=>{
 for(const value of ['0','-12','NaN','Infinity','1,200'])assert.throws(()=>source.parseTrm([trm('2026-10-14',value)],now));
 assert.throws(()=>source.parseTrm([{...trm(),unidad:'USD'}],now));
 assert.throws(()=>source.parseTrm({},now));
 assert.equal(rates.officialRateSchema.safeParse(rate('COP',2,'2026-02-30')).success,false);
 assert.equal(rates.rateSnapshotSchema.safeParse({version:1,rates:[rate('VES',2),rate('VES',3)]}).success,false);
});
test('BCV parser requires USD block, exact effective date and safe numeric markup; never takes tomorrow or old data',()=>{
 assert.equal(source.parseBcv(bcv(),now).perUsd,50);
 assert.equal(source.parseBcv(bcv('2026-10-14','1.234,5678'),now).perUsd,1234.5678);
 for(const html of [bcv('2026-10-15'),bcv('2026-10-13'),bcv().replace('id="dolar"','id="euro"'),bcv().replace('date-display-single','unknown'),bcv('2026-10-14','0,0000'),'<h1>Unavailable</h1>'])assert.throws(()=>source.parseBcv(html,now));
});
test('all currency directions and cross-rates retain original price and need only the necessary official rates',()=>{
 assert.equal(rates.convertPrice(10,'USD','VES',snapshot),500);
 assert.equal(rates.convertPrice(500,'VES','USD',snapshot),10);
 assert.equal(rates.convertPrice(10,'USD','COP',snapshot),40000);
 assert.equal(rates.convertPrice(40000,'COP','USD',snapshot),10);
 assert.equal(rates.convertPrice(500,'VES','COP',snapshot),40000);
 assert.equal(rates.convertPrice(40000,'COP','VES',snapshot),500);
 assert.equal(rates.convertPrice(0,'USD','VES',snapshot),0);
 assert.equal(rates.convertPrice(10,'USD','COP',{version:1,rates:[rate('COP',4000)]}),40000);
 assert.equal(rates.convertPrice(10,'USD','VES',{version:1,rates:[]}),null);
 assert.equal(rates.convertPrice(NaN,'USD','VES',snapshot),null);
 assert.equal(snapshot.rates[0].perUsd,50);
});
test('offline cache retains successful timestamps on upstream failure and rejects invalid snapshots',()=>{
 const merged=rates.mergeRateSnapshots(snapshot,{version:1,rates:[]});assert.deepEqual(merged,snapshot);
 const fresh={...rate('COP',4100),fetchedAt:'2026-10-14T23:00:00.000Z'};
 assert.equal(rates.mergeRateSnapshots(snapshot,{version:1,rates:[fresh]}).rates[0].fetchedAt,now.toISOString());
 assert.equal(rates.mergeRateSnapshots(snapshot,{version:1,rates:[fresh]}).rates[1].perUsd,4100);
 assert.deepEqual(rates.readRateSnapshot({getItem:()=>'{oops'}),{version:1,rates:[]});
 assert.deepEqual(rates.readRateSnapshot({getItem:()=>JSON.stringify({...snapshot,unexpected:'x'})}),{version:1,rates:[]});
 assert.equal(rates.rateIsCurrent(rate('COP',4000),now),true);
 assert.equal(rates.rateIsCurrent(rate('COP',4000),new Date('2026-10-15T15:00:00Z')),false);
 assert.equal(rates.rateResponseSchema.safeParse({...snapshot,unavailable:[]}).success,true);
});
test('official loader isolates BCV failure, limits endpoints, uses HTTPS and reuses successful hourly fetches',async()=>{
 const calls=[];let clock=new Date(now);
 const loader=source.createOfficialRateLoader(async(url,options)=>{calls.push({url,options});if(url===source.BCV_ENDPOINT)throw new Error('TLS failure');return url===source.ECB_ENDPOINT?new Response(ecb()):Response.json([trm()]);},()=>clock);
 const [one,two]=await Promise.all([loader(),loader()]);
 assert.deepEqual(one,two);assert.equal(calls.length,3);assert.deepEqual(one.unavailable,['VES']);assert.equal(one.rates[0].currency,'COP');
 assert.equal((await loader()).rates[0].fetchedAt,now.toISOString());assert.equal(calls.length,3);
 for(const call of calls){assert.match(call.url,/^https:\/\/(www\.bcv\.org\.ve|www\.datos\.gov\.co|www\.ecb\.europa\.eu)\//);assert.equal(call.options.redirect,'manual');assert.equal(call.options.headers.authorization,undefined);}
 clock=new Date('2026-10-14T23:01:00Z');await loader();assert.equal(calls.length,6);
});
test('provider HTTP failures and changed documents return honest missing rates, with no numeric fallback',async()=>{
 for(const fetcher of [async()=>new Response('No',{status:502}),async()=>new Response('<h1>Changed</h1>')]){
  const result=await source.createOfficialRateLoader(fetcher,()=>now)();assert.deepEqual(result,{version:1,rates:[],unavailable:['VES','COP','EUR']});
 }
});
test('public rural reference is bounded and survives the existing envelope without a database migration',()=>{
 const value=details.productDetailsSchema.parse({ruralReference:'Sector El Palmar, cerca de la escuela'});
 assert.equal(details.readProductDetails(details.encodeListingEnvelope(undefined,{...value,galleryKeys:[]})).ruralReference,value.ruralReference);
 assert.equal(details.productDetailsSchema.safeParse({ruralReference:'a'.repeat(241)}).success,false);
 assert.equal(details.productDetailsSchema.parse({privateFarmLocation:'private'}).privateFarmLocation,undefined);
 for(const currency of ['USD','VES','COP','EUR'])for(const supplyUnit of ['kg','animal','lote'])assert.equal(listingPayloadSchema.safeParse({sellerName:'Finca',title:'Producto real',description:'Descripción real del producto',category:'Bovinos',state:'Apure',location:'Apure',shortIntro:'Resumen del producto',photoContext:'Animal en potrero',currency,supplyUnit,priceCents:1200}).success,true);
});
test('price UI explicitly labels seller currency, per-animal unit, update date and visible base references',async()=>{
 const {ListingPrice,listingUpdateLabel}=await vite.ssrLoadModule('/components/listing-price.tsx');
 const listing={id:'real',sellerName:'Productor',title:'Res',location:'Apure',category:'Bovinos',description:'Animal',priceCents:125000,currency:'COP',supplyUnit:'animal',serverUpdatedAt:now.toISOString()};
 const html=renderToStaticMarkup(React.createElement(ListingPrice,{listing,conversion:true}));
 for(const text of ['COP','por animal','Anuncio actualizado','Precio declarado por el vendedor','Dólares (USD)','Bolívares (VES)','Fuentes y otras monedas','aria-expanded="false"'])assert.ok(html.includes(text),text);
 assert.equal(listingUpdateLabel({...listing,serverUpdatedAt:'invalid'}),'Fecha de actualización no indicada');
 assert.equal(listingUpdateLabel({...listing,demo:true}),'Datos ficticios');
});
test('offline UX is essential-first and transparent about size and the existing bundled 3D engine',async()=>{
 const readiness=await readFile(root+'components/offline-readiness.tsx','utf8');
 const base=await readFile(root+'components/offline-preparation.tsx','utf8');
 const size=await readFile(root+'components/offline-download-size.tsx','utf8');
 assert.match(readiness,/1\. Prepara lo básico/);assert.match(readiness,/Opcional: modelos y texturas/);
 assert.match(base,/descarga básica también incluye las herramientas del plano 3D/);assert.match(size,/sin confirmar/);assert.match(size,/sin comprimir, más las páginas/);
});


test('default loader resolves host fetch at request time with its global receiver and portable no-cache headers',async()=>{
 const original=globalThis.fetch;let calls=0;
 try {
  globalThis.fetch=()=>{throw new TypeError('Startup fetch cannot be used in a request');};
  const loader=source.createOfficialRateLoader(undefined,()=>now);
  globalThis.fetch=function(url,options){
   assert.equal(this,globalThis);assert.equal(options.cache,undefined);
   assert.equal(options.headers['Cache-Control'],'no-cache');assert.equal(options.headers.Pragma,'no-cache');
   assert.equal(options.redirect,'manual');calls++;
   return Promise.resolve(url===source.BCV_ENDPOINT?new Response(bcv()):url===source.ECB_ENDPOINT?new Response(ecb()):Response.json([trm()]));
  };
  const result=await loader();assert.equal(calls,3);assert.deepEqual(result.unavailable,[]);assert.equal(result.rates.length,3);
 }finally{globalThis.fetch=original;}
});

test('edge-compatible manual redirect policy refuses every redirect without following its Location',async()=>{
 for(const status of [301,302,303,307,308]){
  const calls=[];
  const loader=source.createOfficialRateLoader(async(url,options)=>{
   calls.push(url);assert.equal(options.redirect,'manual');
   return new Response(null,{status,headers:{Location:'https://unapproved.example/rates'}});
  },()=>now);
  assert.deepEqual(await loader(),{version:1,rates:[],unavailable:['VES','COP','EUR']});
  assert.deepEqual(calls,[source.BCV_ENDPOINT,source.TRM_ENDPOINT,source.ECB_ENDPOINT]);
 }
});
test('even a successful response flagged as redirected cannot provide an official rate',async()=>{
 const result=await source.createOfficialRateLoader(async(url,options)=>{
  assert.equal(options.redirect,'manual');
  const response=url===source.BCV_ENDPOINT?new Response(bcv()):url===source.ECB_ENDPOINT?new Response(ecb()):Response.json([trm()]);
  Object.defineProperty(response,'redirected',{value:true});return response;
 },()=>now)();
 assert.deepEqual(result,{version:1,rates:[],unavailable:['VES','COP','EUR']});
});

test('BCV diagnostics distinguish a global date from the bounded currency-local date without accepting either',()=>{
 const prefix='<span class="date-display-single" content="2026-10-01T00:00:00-04:00">News date</span>';
 const html=prefix+bcv().replace('</div><span','</div>Fecha Valor: <span');
 const diagnostic=source.bcvPageDiagnostics(html,now);
 assert.equal(diagnostic.dollarBlockFound,true);assert.equal(diagnostic.numericPatternValid,true);
 assert.equal(diagnostic.firstGlobalDate,'2026-10-01');assert.equal(diagnostic.caracasDay,'2026-10-14');
 assert.equal(diagnostic.fechaValorAfterDollar,true);assert.deepEqual(diagnostic.nearbyDates,['2026-10-14']);
 assert.equal(diagnostic.matchingDateCountCappedAtFive,2);assert.throws(()=>source.parseBcv(html,now));
 assert.doesNotMatch(JSON.stringify(diagnostic),/News|strong|50,0000|<|>/);
});
test('BCV diagnostics retain future dates as diagnostics, cap counts and never accept a future rate',()=>{
 const diagnostic=source.bcvPageDiagnostics(bcv('2026-10-15').repeat(10),now);
 assert.equal(diagnostic.firstGlobalDate,'2026-10-15');assert.equal(diagnostic.matchingDateCountCappedAtFive,5);
 assert.ok(diagnostic.nearbyDates.length<=5);assert.throws(()=>source.parseBcv(bcv('2026-10-15'),now));
 assert.equal(source.bcvPageDiagnostics('<h1>Unavailable</h1>',now).dollarBlockFound,false);
 assert.equal(source.bcvPageDiagnostics('<h1>Just a moment</h1><div class="cf-chl-container"></div>',now).challengeLike,true);
 assert.equal(source.bcvPageDiagnostics(bcv(),now).challengeLike,false);
});


test('ECB daily XML is normalized from USD per EUR with exact source date and rejects untrusted structure',()=>{
 const parsed=source.parseEcb(ecb(),now);assert.equal(parsed.currency,'EUR');assert.equal(parsed.perUsd,.8);assert.equal(parsed.validFrom,'2026-10-14');
 for(const xml of [ecb('2026-10-16'),ecb('2026-10-01'),ecb('2026-02-30'),ecb('2026-10-14','0'),ecb('2026-10-14','-1'),ecb('2026-10-14','1,25'),ecb().replace('European Central Bank','Other source'),ecb().replace('http://www.ecb.int/vocabulary/2002-08-01/eurofxref','unknown'),ecb().replace("currency='USD'","currency='GBP'"),ecb().replace("<Cube currency='USD' rate='1.25'/>","<Cube currency='USD' rate='1.25'/><Cube currency='USD' rate='1.30'/>"),'<!DOCTYPE foo>'+ecb()])assert.throws(()=>source.parseEcb(xml,now));
});
test('ECB holiday reference keeps its publication date and remains visibly older rather than inventing validity',()=>{
 const sunday=new Date('2026-10-18T12:00:00Z'),parsed=source.parseEcb(ecb('2026-10-16'),sunday);
 assert.equal(parsed.validFrom,'2026-10-16');assert.equal(parsed.validTo,'2026-10-16');assert.equal(rates.rateIsCurrent(parsed,sunday),false);
});
test('EUR supports all pair directions and previous USD/VES/COP caches remain valid',()=>{
 const extended={version:1,rates:[...snapshot.rates,rate('EUR',.8)]};
 assert.equal(rates.convertPrice(100,'USD','EUR',extended),80);assert.equal(rates.convertPrice(80,'EUR','USD',extended),100);
 assert.equal(rates.convertPrice(80,'EUR','COP',extended),400000);assert.equal(rates.convertPrice(400000,'COP','EUR',extended),80);
 assert.equal(rates.convertPrice(80,'EUR','VES',extended),5000);assert.equal(rates.convertPrice(5000,'VES','EUR',extended),80);
 assert.equal(rates.convertPrice(80,'EUR','COP',snapshot),null);
 assert.deepEqual(rates.readRateSnapshot({getItem:()=>JSON.stringify(snapshot)}),snapshot);
 assert.equal(rates.rateSnapshotSchema.safeParse(extended).success,true);assert.equal(rates.currencySchema.parse('EUR'),'EUR');
 assert.deepEqual(rates.currencies,['USD','VES','COP','EUR']);
 assert.equal(rates.mergeRateSnapshots(snapshot,{version:1,rates:[rate('EUR',.8)]}).rates.length,3);
});
test('ECB errors remain isolated and do not prevent available COP or VES conversions',async()=>{
 const result=await source.createOfficialRateLoader(async url=>url===source.ECB_ENDPOINT?new Response('unavailable',{status:503}):url===source.BCV_ENDPOINT?new Response(bcv()):Response.json([trm()]),()=>now)();
 assert.deepEqual(result.unavailable,['EUR']);assert.equal(result.rates.length,2);assert.equal(rates.convertPrice(1,'USD','COP',result),4000);
});
test('ECB prior-business-day publication uses hourly caching rather than repeated fetch on each view',async()=>{
 let calls=0;const date=new Date('2026-10-18T12:00:00Z');
 const loader=source.createOfficialRateLoader(async url=>{calls++;return url===source.ECB_ENDPOINT?new Response(ecb('2026-10-16')):new Response('unavailable',{status:502});},()=>date);
 await loader();await loader();assert.equal(calls,3);
});
test('conversion supports an initially open calculator and neutral cost/service language',async()=>{
 const {PriceConversion}=await vite.ssrLoadModule('/components/price-conversion.tsx');
 const html=renderToStaticMarkup(React.createElement(PriceConversion,{amount:100,currency:'EUR',initiallyOpen:true}));
 assert.match(html,/aria-expanded="true"/);assert.match(html,/compra o el servicio/);assert.match(html,/El importe conserva su moneda original/);
 assert.doesNotMatch(html,/value="EUR"/);
 const reference=renderToStaticMarkup(React.createElement(PriceConversion,{reference:true,initiallyOpen:true}));assert.match(reference,/Euros \(EUR\)/);
});

test('changing original currency keeps the conversion target available in the selector',()=>{
 for(const from of rates.currencies)for(const preferred of rates.currencies){
  const target=rates.conversionTarget(from,preferred);
  assert.notEqual(target,from);assert.ok(rates.currencies.includes(target));
  if(preferred!==from)assert.equal(target,preferred);
 }
 assert.equal(rates.conversionTarget('VES','VES'),'USD');
 assert.equal(rates.conversionTarget('USD','USD'),'VES');
});

test('BCV next-day publication activates only at Caracas midnight and invalidates the hourly cache',async()=>{
 let clock=new Date('2026-10-15T03:50:00Z'),calls=0;
 const loader=source.createOfficialRateLoader(async url=>{
  calls++;return url===source.BCV_ENDPOINT?new Response(bcv('2026-10-15')):url===source.ECB_ENDPOINT?new Response(ecb('2026-10-14')):Response.json([trm('2026-10-14')]);
 },()=>clock);
 const before=await loader();assert.ok(before.unavailable.includes('VES'));assert.equal(before.rates.find(r=>r.currency==='VES'),undefined);
 clock=new Date('2026-10-15T03:59:59Z');await loader();assert.equal(calls,3);
 clock=new Date('2026-10-15T04:00:00Z');const after=await loader();assert.equal(calls,6);
 assert.equal(after.rates.find(r=>r.currency==='VES').validFrom,'2026-10-15');assert.equal(after.unavailable.includes('VES'),false);
});
