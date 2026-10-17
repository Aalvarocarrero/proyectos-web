import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {LocationCanvas,MarketplaceLocation}=await vite.ssrLoadModule('/components/marketplace-location.tsx');
const {publicMapContext}=await vite.ssrLoadModule('/lib/public-map-context.ts');
const {NATIONAL_MAP_PACK,MAP_PACK}=await vite.ssrLoadModule('/lib/offline-map-pack.ts');
const point={latitude:9.45,longitude:-68.35,label:'Referencia de prueba',precision:'approximate'};
test('declared point is first and selected; satellite always responds without claiming missing coverage',()=>{
 const inside=renderToStaticMarkup(React.createElement(LocationCanvas,{point}));assert.match(inside,/>Satélite<\/button>/);assert.doesNotMatch(inside,/No hay imagen satelital/);
 const outside=renderToStaticMarkup(React.createElement(LocationCanvas,{point:{...point,latitude:10,longitude:-65}}));assert.doesNotMatch(outside,/disabled="">Satélite<\/button>/);assert.match(outside,/aria-pressed="true">Ver punto declarado<\/button>/);assert.ok(outside.indexOf('Ver punto declarado')<outside.indexOf('>Calles<'));assert.ok(outside.indexOf('>Calles<')<outside.indexOf('>Satélite<'));
});
test('expanded canvas is taller and declared administrative names remain honest',()=>{
 const full=renderToStaticMarkup(React.createElement(LocationCanvas,{point,expanded:true}));assert.match(full,/h-\[65dvh\]/);
 const card=renderToStaticMarkup(React.createElement(MarketplaceLocation,{point,location:'Zona declarada',state:'Estado declarado',municipality:'Municipio declarado'}));assert.match(card,/Estado declarado/);assert.match(card,/Municipio declarado/);assert.match(card,/Parroquia<\/dt><dd>No declarado/);assert.match(card,/no se deducen del punto/);assert.match(card,/Ubicación aproximada/);
});
test('public context shares checksum-verified same-origin bytes without private storage',async()=>{
 const previous=globalThis.fetch;let calls=0;globalThis.fetch=async path=>{calls++;assert.equal(path,NATIONAL_MAP_PACK.path);return new Response(await readFile(root+'/public'+path));};
 try{const [a,b]=await Promise.all([publicMapContext(NATIONAL_MAP_PACK),publicMapContext(NATIONAL_MAP_PACK)]);assert.equal(calls,1);assert.equal(a,b);assert.equal(a.size,NATIONAL_MAP_PACK.bytes);}finally{globalThis.fetch=previous;}
});
test('a failed cartography load is evicted so reopening can retry',async()=>{
 const previous=globalThis.fetch;let calls=0;globalThis.fetch=async path=>{calls++;if(calls===1)return new Response('missing',{status:503});return new Response(await readFile(root+'/public'+path));};
 try{await assert.rejects(publicMapContext(MAP_PACK));assert.equal((await publicMapContext(MAP_PACK)).size,MAP_PACK.bytes);assert.equal(calls,2);}finally{globalThis.fetch=previous;}
});
test('farm geography starts expanded and satellite controls focus existing imagery only',async()=>{
 const editor=await readFile(root+'/components/farm-map-editor.tsx','utf8'),locator=await readFile(root+'/components/private-farm-locator.tsx','utf8');assert.match(editor,/<details open[^>]*><summary[^>]*>Ubicación y mapas/);assert.match(locator,/chooseMode\(mode,true\)/);assert.match(locator,/focusSatelliteZone\(instance,L.latLngBounds/);assert.match(locator,/No hay una imagen satelital preparada/);
});

test('state names appear on hover or keyboard focus without permanent crowded overlays',async()=>{
 const source=await readFile(root+'/components/marketplace-location.tsx','utf8');assert.match(source,/permanent:false/);assert.doesNotMatch(source,/permanent:true/);assert.match(source,/setAttribute\('tabindex','0'\)/);assert.match(source,/addEventListener\('focus',\(\)=>layer.openTooltip\(\)/);assert.match(source,/addEventListener\('blur',\(\)=>layer.closeTooltip\(\)/);assert.match(source,/if\(name!=='market-boundaries'\)/);
});

test('initial framing uses declared coordinates and actual available detail',async()=>{
 const {declaredPointView}=await vite.ssrLoadModule('/lib/marketplace-map-view.ts');
 assert.deepEqual(declaredPointView(point),{center:[9.45,-68.35],zoom:14});
 assert.deepEqual(declaredPointView({...point,latitude:7.88,longitude:-67.47}),{center:[7.88,-67.47],zoom:10});
 assert.deepEqual(declaredPointView(),{center:[7,-66],zoom:5});
});
test('optional satellite distinguishes sample from product and has a route back',async()=>{
 const source=await readFile(root+'/components/marketplace-location.tsx','utf8');
 assert.match(source,/setView\(view.center,view.zoom\)/);
 assert.match(source,/onClick={choosePoint}>Ver punto declarado/);
 assert.match(source,/onClick={chooseSatellite}>Satélite/);
 assert.match(source,/No hay imagen satelital alojada para este punto/);
 assert.match(source,/Ver muestra satelital de los Llanos/);
 assert.match(source,/No representa la ubicación de este producto/);
 assert.match(source,/if\(sample\)m.fitBounds/);
 assert.match(source,/raster\?\.remove\(\)/);
 assert.match(source,/setSatelliteRequest\(v=>v\+1\)/);
 assert.match(source,/\[mode,satelliteAvailable,sample,satelliteRequest,epoch,point\]/);
});
