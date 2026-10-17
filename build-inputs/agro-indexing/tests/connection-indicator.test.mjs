import test,{after} from 'node:test';import assert from 'node:assert/strict';import {createServer} from 'vite';import {fileURLToPath} from 'node:url';import {readFile} from 'node:fs/promises';
const root=fileURLToPath(new URL('..',import.meta.url));const vite=await createServer({appType:'custom',configFile:false,root,server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(()=>vite.close());const {connectionIndicator}=await vite.ssrLoadModule('/lib/connection-indicator.ts');
test('offline is visibly local and pending records remain pending',()=>{const r=connectionIndicator({online:false,pending:2,mode:'local'});assert.equal(r.short,'Sin conexión · modo local');assert.match(r.queue,/2 cambios pendientes/);assert.match(r.detail,/sin respaldo central confirmado/);});
test('online never becomes proof of synchronization',()=>{const r=connectionIndicator({online:true,pending:0,mode:'account'});assert.equal(r.short,'Con conexión');assert.match(r.queue,/no acredita una copia/);assert.match(r.detail,/respuesta del servidor/);});
test('unknown queue is not zero and demo reads no real records',()=>{assert.match(connectionIndicator({online:null,pending:null,mode:'unknown'}).queue,/No se pudo comprobar/);assert.equal(connectionIndicator({online:true,pending:99,mode:'demo'}).pending,0);});
test('unknown connection is never described as offline',()=>{const r=connectionIndicator({online:null,pending:null,mode:'unknown'});assert.match(r.network,/Comprobando/);assert.match(r.networkDetail,/Todavía no/);assert.doesNotMatch(r.networkDetail,/Sin conexión|detecta red/);});
test('header control listens to actual events, preserves demo isolation and stays in flow',async()=>{
 const s=await readFile(root+'components/connection-indicator.tsx','utf8'),css=await readFile(root+'app/globals.css','utf8');
 assert.match(s,/subscribeOfflineChanges/);assert.match(s,/getPendingCount\(owner\)/);assert.match(s,/addEventListener\("offline"/);
 assert.ok(s.indexOf("if (isDemo) return")<s.indexOf('async function refresh'));
 for(const route of ['/finca-demo','/finca-modelo','/modelos-finca'])assert.ok(s.includes('"'+route+'"'));
 assert.match(s,/PopoverTrigger asChild/);assert.match(s,/side="bottom" align="end"/);assert.match(s,/max-h-\[var\(--radix-popover-content-available-height\)\]/);assert.match(s,/aria-labelledby=\{titleId\}/);
 const rule=css.match(/\.connection-indicator-trigger \{[^}]+\}/)[0];assert.match(rule,/min-height:44px/);assert.match(rule,/min-width:44px/);assert.doesNotMatch(rule,/position:fixed|left:50%|translateX/);
 assert.doesNotMatch(s,/MutationObserver|visualViewport|setBottom|safe-area-inset-bottom|data-social-avoid/);
 assert.match(css,/connection-indicator-label \{ display:none/);assert.match(css,/connection-indicator-trigger:focus-visible/);
});
test('headers own a single connection control; dashboard and game do not acquire a duplicate',async()=>{
 const layout=await readFile(root+'app/layout.tsx','utf8');assert.doesNotMatch(layout,/ConnectionIndicator/);
 for(const path of ['components/site-header.tsx','components/admin-navigation.tsx','components/farm-demo-workspace.tsx','components/farm-showcase.tsx','components/offline-library.tsx','app/modelos-finca/page.tsx','app/offline/page.tsx','app/admin/page.tsx']){
  const source=await readFile(root+path,'utf8');assert.equal((source.match(/<ConnectionIndicator(?:\s|\/|>)/g)||[]).length,1,path);
 }
 const farm=await readFile(root+'components/farm-dashboard.tsx','utf8'),game=await readFile(root+'app/juego-finca/page.tsx','utf8');
 assert.doesNotMatch(farm,/ConnectionIndicator/);assert.match(farm,/Ver estado de sincronización/);assert.match(farm,/lastSync \? "Sin pendientes" : "Respaldo por comprobar"/);assert.doesNotMatch(game,/ConnectionIndicator|SiteHeader/);
});
