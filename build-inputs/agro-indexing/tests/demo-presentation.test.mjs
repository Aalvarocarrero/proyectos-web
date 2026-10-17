import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(()=>vite.close());
const {visibleDemoRows}=await vite.ssrLoadModule('/lib/demo-presentation.ts');
test('default sample limit preserves every real and founder row without modifying data',()=>{
 const rows=[{id:'sample-1',demo:true},{id:'real-1'},{id:'sample-2',demo:true},{id:'founder',founder:true},{id:'real-2'}],before=structuredClone(rows);
 assert.deepEqual(visibleDemoRows(rows).map(r=>r.id),['sample-1','real-1','founder','real-2']);
 assert.deepEqual(visibleDemoRows(rows,true),rows);assert.deepEqual(rows,before);
});
test('matching examples are selected after filters, even when the default sample does not match',()=>{
 const rows=[{id:'a',demo:true,state:'Apure'},{id:'b',demo:true,state:'Sucre'},{id:'c',demo:true,state:'Sucre'},{id:'real',state:'Sucre'}];
 assert.deepEqual(visibleDemoRows(rows.filter(r=>r.state==='Sucre')).map(r=>r.id),['b','real']);
 assert.deepEqual(visibleDemoRows([]),[]);
});
test('professional directory starts with one sample and preserves founder plus real entries',async()=>{
 const {ProfessionalDirectory}=await vite.ssrLoadModule('/components/professional-directory.tsx');
 const {professionalExamples}=await vite.ssrLoadModule('/lib/professional-examples.ts');
 const real={...professionalExamples[0],id:'real-professional',name:'Real profile fixture',demo:false};
 const html=renderToStaticMarkup(React.createElement(ProfessionalDirectory,{initial:[real],examples:professionalExamples}));
 assert.equal((html.match(/Perfil ficticio de demostración/g)||[]).length,1);
 assert.match(html,/Álvaro Carrero/);assert.match(html,/Real profile fixture/);assert.match(html,/Explorar más ejemplos/);
 assert.equal(professionalExamples.filter(p=>p.demo).length,12);
});
test('finca and community lists start with one sample while preserving real rows',async()=>{
 const {AgroNetwork}=await vite.ssrLoadModule('/components/agro-network.tsx');
 const {demoPublicFarms,demoPosts}=await vite.ssrLoadModule('/lib/network-profile.ts');
 const realFarm={...demoPublicFarms[0],id:'real-farm',name:'Real farm fixture',demo:false};
 const realPost={...demoPosts[0],id:'real-post',farmId:'real-farm',authorName:'Real author fixture',demo:false};
 const initial={farms:[...demoPublicFarms,realFarm],posts:[...demoPosts,realPost],mine:[]};
 const directory=renderToStaticMarkup(React.createElement(AgroNetwork,{initial,directory:true}));
 assert.equal((directory.match(/>Conocer la finca</g)||[]).length,2);
 assert.match(directory,/Real farm fixture/);assert.doesNotMatch(directory,/Ver ficha de ejemplo/);
 const feed=renderToStaticMarkup(React.createElement(AgroNetwork,{initial}));
 assert.equal((feed.match(/Ejemplo demostrativo/g)||[]).length,1);
 assert.match(feed,/Real author fixture/);assert.match(feed,/Explorar más ejemplos/);
 assert.equal(demoPublicFarms.length,6);assert.equal(demoPosts.length,6);
});
