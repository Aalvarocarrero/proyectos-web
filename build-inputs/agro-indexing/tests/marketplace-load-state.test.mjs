import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,server:{middlewareMode:true,hmr:false,watch:null}});after(()=>vite.close());
const {readPublishedMarketplaceRows,marketplaceLoadMessage,marketplaceCountLabel,marketplacePreviewRows}=await vite.ssrLoadModule('/lib/marketplace-load-state.ts');
const valid={id:'test',sellerName:'Producer',title:'Cacao',description:'Prueba',category:'Cultivos',location:'Apure',status:'active'};
test('published market rejects malformed responses rather than replacing cached content',()=>{for(const input of [null,[],{}, {listings:null}])assert.throws(()=>readPublishedMarketplaceRows(input));});
test('published market keeps only active non-demo correctly shaped rows',()=>{assert.deepEqual(readPublishedMarketplaceRows({listings:[valid,null,{...valid,demo:true},{...valid,status:'pending'},{...valid,title:1}]}),[valid]);});
test('network and server errors remain distinct and never certify synchronization',()=>{assert.match(marketplaceLoadMessage('error',true),/última consulta/);assert.match(marketplaceLoadMessage('offline',false),/No hay ofertas guardadas/);assert.match(marketplaceLoadMessage('loading',false),/Comprobando/);assert.match(marketplaceLoadMessage('ready',true),/se acuerdan/);});
test('real market supports abort-safe retry, reset and labelled counts',async()=>{const s=await readFile(root+'components/marketplace-browser.tsx','utf8');assert.match(s,/controller.signal.aborted/);assert.match(s,/signal:controller.signal/);assert.match(s,/Actualizar ofertas/);assert.match(s,/Limpiar filtros/);assert.match(s,/aria-live="polite"/);assert.doesNotMatch(s,/setOffline\(true\);\s*\}\s*\}/);});
test('eight real areas have crawlable contextual next steps',async()=>{for(const route of ['marketplace','profesionales','empresas','fincas','red','tienda','aprende','plataforma']){const s=await readFile(root+'app/'+route+'/page.tsx','utf8');assert.match(s,/<SectionGuide /,route);}const guide=await readFile(root+'components/section-guide.tsx','utf8');assert.match(guide,/<Link href=\{href\}/);assert.match(guide,/<ol/);});

test("result counts use singular and plural for examples and real offers",()=>{assert.equal(marketplaceCountLabel(1,true),"1 ejemplo");assert.equal(marketplaceCountLabel(0,true),"0 ejemplos");assert.equal(marketplaceCountLabel(2,true),"2 ejemplos");assert.equal(marketplaceCountLabel(1,false),"1 oferta");assert.equal(marketplaceCountLabel(2,false),"2 ofertas");});

test("collapsed examples preserve every real listing and every fixture when expanded",()=>{const rows=[{id:"real1"},{id:"demo1",demo:true},{id:"real2",demo:false},{id:"demo2",demo:true}];assert.deepEqual(marketplacePreviewRows(rows,false).map(x=>x.id),["real1","demo1","real2","demo2"]);assert.deepEqual(marketplacePreviewRows(rows,true),rows);assert.deepEqual(marketplacePreviewRows([{id:"demo2",demo:true}],false),[{id:"demo2",demo:true}]);});
