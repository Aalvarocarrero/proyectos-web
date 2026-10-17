import assert from 'node:assert/strict';import test from 'node:test';import {readFileSync} from 'node:fs';import ts from 'typescript';
const source=readFileSync(new URL('../components/offline-library.tsx',import.meta.url),'utf8');
const functions=ts.transpile(source.slice(source.indexOf(' async function download()'),source.indexOf(' function choose(')),{target:ts.ScriptTarget.ES2022});
function fixture({ready=true,confirm=true}={}){
 const calls=[],messages=[],resourceCheck={current:0},controller={current:null};
 const names=['busy','resourceCheck','controller','setBusy','setMessage','setResources','beginPublicDownload','libraryResources','clearPublicLibrary','removeLibraryResources','window'];
 const values=[false,resourceCheck,controller,v=>calls.push(['busy',v]),v=>messages.push(v),v=>calls.push(['resources',v]),async()=>{calls.push(['generation']);return 9},async(...args)=>{calls.push(['libraryResources',...args]);return {ready}},async()=>calls.push(['clearPublicOnly']),async()=>calls.push(['removePublicResources']),{confirm:()=>confirm}];
 return {...new Function(...names,functions+';return {download,clear};')(...values),calls,messages};
}
test('optional library download prepares static resources only and never requests a public-feed snapshot',async()=>{
 const f=fixture();await f.download();
 assert.equal(f.calls.filter(x=>x[0]==='libraryResources').length,1);
 const call=f.calls.find(x=>x[0]==='libraryResources');assert.equal(call[1],true);assert.ok(call[2] instanceof AbortSignal);assert.equal(call[3],9);
 assert.match(f.messages.at(-1),/No se descargaron catálogos ni publicaciones de otras personas/);
 assert.doesNotMatch(source,/downloadPublicLibrary|readPublicLibrary|savePublicLibrary|\/api\/offline-public|snapshot\.items/);
 assert.match(source,/const connectivity=\(\)=>setOnline\(navigator.onLine\)/,'reconnect updates connection status without refreshing feeds');
});
test('failed static preparation never claims a finished library; cleanup only runs after explicit confirmation',async()=>{
 const failed=fixture({ready:false});await failed.download();assert.doesNotMatch(failed.messages.at(-1),/Biblioteca opcional preparada/);
 const declined=fixture({confirm:false});await declined.clear();assert.deepEqual(declined.calls,[]);
 const accepted=fixture();await accepted.clear();assert.equal(accepted.calls.filter(x=>x[0]==='clearPublicOnly').length,1);assert.equal(accepted.calls.filter(x=>x[0]==='removePublicResources').length,1);
 assert.doesNotMatch(source,/deleteDatabase|localStorage\.clear|indexedDB\.delete|clearPrivate/);
});
test('offline copy explains account-owned scope, optional overlap, unavailable feeds and stored bookmarks honestly',()=>{
 assert.match(source,/no sumes ambos tamaños/);assert.match(source,/su tamaño varía/);
 assert.match(source,/pantalla social completa todavía necesita internet/);assert.match(source,/Los favoritos que marcaste se conservan como referencias/);
 assert.match(source,/Las copias automáticas antiguas no se muestran ni se renuevan/);
 const basic=readFileSync(new URL('../components/offline-preparation.tsx',import.meta.url),'utf8');assert.match(basic,/No descarga el catálogo de Mercado ni la Comunidad/);
});
