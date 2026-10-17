import test,{after} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(()=>server.close());const {demoLinkForView,demoSectionFromSearch,farmLearningExamples,learningExampleForView}=await server.ssrLoadModule('/lib/farm-demo-navigation.ts');
test('every management view has a direct, whitelisted practice section',()=>{for(const [view,label] of Object.entries({overview:'Resumen',animals:'Animales',land:'Plano y potreros',production:'Producción',intelligence:'Planificación y costos',inventory:'Inventario',marketplace:'Mis publicaciones',sync:'Sincronización',security:'Seguridad y privacidad',settings:'Configurar finca'})){const url=new URL(demoLinkForView(view),'https://example.test');assert.equal(url.pathname,'/finca-demo');assert.equal(demoSectionFromSearch(url.search),label);}assert.equal(demoSectionFromSearch('?area=https://other.test'),'Resumen');assert.equal(demoSectionFromSearch(''),'Resumen');});
test('practice fixtures still cover all data areas and public marketplace keeps explicit examples mode',async()=>{const fixture=JSON.parse(await readFile(new URL('../lib/farm-demo-fixture.json',import.meta.url),'utf8'));const counts={};for(const row of fixture.records)counts[row.payload.recordType]=(counts[row.payload.recordType]??0)+1;assert.deepEqual(counts,{animal:101,weight:10,area:41,'production-cycle':8,plan:2,finance:5,health:6,reproduction:2,inventory:16,task:2});const ui=await readFile(new URL('../components/farm-dashboard.tsx',import.meta.url),'utf8');assert.match(ui,/aria-label="Ejemplos de esta área"/);assert.match(ui,/href=\{demoLinkForView\(view\)\}/);const market=await readFile(new URL('../components/marketplace-browser.tsx',import.meta.url),'utf8');assert.match(market,/Ejemplos por categoría/);});

test("all management areas explain distinct inputs, actions and honest outcomes",()=>{assert.equal(Object.keys(farmLearningExamples).length,10);for(const row of Object.values(farmLearningExamples)){assert.ok(row.input.length>20);assert.ok(row.action.length>20);assert.ok(row.result.length>20);}assert.equal(new Set(Object.values(farmLearningExamples).map(row=>row.action)).size,10);assert.match(learningExampleForView("marketplace").result,/no se publica/);assert.match(learningExampleForView("sync").result,/no equivale a respaldo central/);});

test('the area card opens the complete model and labels editable practice as a separate secondary action',async()=>{
 const dashboard=await readFile(new URL('../components/farm-dashboard.tsx',import.meta.url),'utf8');
 const card=dashboard.match(/<section\b[^>]*aria-label="Ejemplos de esta área"[\s\S]*?<\/section>/)?.[0];
 assert.ok(card,'inspect the area card itself, not the unrelated sidebar model link');
 const links=[...card.matchAll(/<a\b([^>]*)>([^<]*)<\/a>/g)];
 assert.equal(links.length,2);
 assert.match(links[0][1],/href="\/finca-modelo"/);
 assert.match(links[0][1],/className="button-dark"/);
 assert.equal(links[0][2],'Mostrar ejemplos de 10 ha');
 assert.match(links[1][1],/href=\{demoLinkForView\(view\)\}/);
 assert.doesNotMatch(links[1][1],/button-dark/);
 assert.equal(links[1][2],'Abrir práctica editable de esta área');
 assert.match(card,/recorrido 3D, el plano 2D y todos los registros ficticios/);
 assert.match(card,/práctica editable guardada y tus registros reales se conservan/);
 for(const link of links)assert.doesNotMatch(link[1],/onClick|onMouseDown|onPointerDown/,'navigation must not run resets or depend on state writes');
 assert.doesNotMatch(card,/resetDemo|mutateDemo|loadDemo|localStorage|indexedDB|window\.location/);
});
