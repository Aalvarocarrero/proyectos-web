import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,watch:null}});
after(()=>vite.close());
const {TechnicalDataTable}=await vite.ssrLoadModule('/components/technical-data-table.tsx');
const read=path=>readFile(root+path,'utf8');
test('technical empty states do not create an intrinsic-width table',()=>{
 const html=renderToStaticMarkup(React.createElement(TechnicalDataTable,{label:'Coordenadas',columns:['Este','Norte'],rows:[],empty:'Aún no hay coordenadas.'}));
 assert.match(html,/Aún no hay coordenadas/);assert.doesNotMatch(html,/<table|min-w-\[/);
});
test('mobile records retain every field while desktop table remains named and keyboard-scrollable',()=>{
 const html=renderToStaticMarkup(React.createElement(TechnicalDataTable,{label:'Puntos de coordenadas',columns:['Lote','Vértice','Este / X','Norte / Y'],rows:[{id:'synthetic',cells:['Lote de prueba muy largo','Punto-A','500000,123456','900000,654321']}],empty:'Vacío'}));
 for(const value of ['Lote','Vértice','Este / X','Norte / Y','500000,123456','900000,654321'])assert.ok(html.includes(value));
 assert.match(html,/<dl/);assert.match(html,/sm:hidden/);assert.match(html,/role="region"/);assert.match(html,/tabindex="0"/);assert.match(html,/overflow-x-auto/);assert.match(html,/scope="col"/);
});
test('narrow editor and date constraints cover settings, records and store without hiding overflow globally',async()=>{
 const css=await read('app/globals.css');assert.match(css,/\.technical-plan-sheet > div[^}]*min-width:0/);assert.match(css,/\.polygon-sketch-editor button \{ min-height:44px/);assert.match(css,/\.store-request-form input\[type="date"\]/);assert.match(css,/\.farm-settings-form input\[type="date"\]/);
 const fields=await read('components/farm-plan-fields.tsx');assert.doesNotMatch(fields,/minmax\(0,1fr\)_7\.5rem/);assert.match(fields,/minmax\(0,1fr\)_minmax\(0,\.8fr\)/);
});
test('public controls retain viewport collision handling, wrapping, close clearance and store footer space',async()=>{
 const accessibility=await read('components/accessibility-menu.tsx');assert.match(accessibility,/<PopoverContent/);assert.match(accessibility,/collisionPadding=\{12\}/);assert.match(accessibility,/aria-pressed/);assert.doesNotMatch(accessibility,/absolute right-0 top-12/);
 const css=await read('app/globals.css');assert.match(css,/padding-inline-end:3\.5rem/);assert.match(css,/> \[data-slot="dialog-title"\]/);
 assert.match(await read('app/tienda/page.tsx'),/<PublicFooter storeRequest/);assert.match(await read('components/public-footer.tsx'),/storeRequest\?"13rem":"7rem"/);
});
test('map browsing permits page scroll and changes require movement with synchronous single-flight protection',async()=>{
 const map=await read('components/farm-map-editor.tsx');assert.match(map,/touchAction:layoutEditing\?"none":"pan-y"/);assert.match(map,/if\(!layoutEditing \|\| movePending.current\)return/);assert.match(map,/next.x===previous.x&&next.y===previous.y/);assert.match(map,/movePending.current=true/);assert.match(map,/onLostPointerCapture=\{cancelAreaDrag\}/);
 const dashboard=await read('components/farm-dashboard.tsx');const save=dashboard.slice(dashboard.indexOf('async function updateAreaLayout'),dashboard.indexOf('const splitInFlight'));assert.match(save,/await queueMutation/);assert.match(save,/void refreshSavedRecord/);assert.doesNotMatch(save,/await loadLocal|await synchronize/);
});
