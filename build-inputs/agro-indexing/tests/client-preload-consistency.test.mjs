import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({configFile:false,root,server:{middlewareMode:true,hmr:false,watch:null}});
after(()=>vite.close());
const {cssOnlyPlaceholders,reconcileClientPreloads}=await vite.ssrLoadModule('/build/client-preload-consistency.ts');
const chunk=(fileName,moduleIds,css=[])=>({type:'chunk',fileName,moduleIds,viteMetadata:{importedCss:new Set(css)}});
test('only CSS-only placeholders with preserved styles are eligible for reconciliation',()=>{
 const bundle={'css.js':chunk('css.js',['/leaflet.css'],['leaflet.css']),'mixed.js':chunk('mixed.js',['/map.ts','/map.css'],['map.css']),'app.js':chunk('app.js',['/app.ts'])};
 assert.deepEqual(cssOnlyPlaceholders(bundle),[{fileName:'css.js',css:['leaflet.css']}]);
});
test('deleted CSS placeholder preload is removed while its stylesheet remains',()=>{
 const deps={js:['/assets/map.js','/assets/leaflet.js'],css:[]};
 const api={manager:{buildAssetsManifest:{clientReferenceDeps:{map:deps}}}};
 const bundle={'assets/map.js':chunk('assets/map.js',['/map.ts']),'assets/leaflet.css':{type:'asset'}};
 assert.equal(reconcileClientPreloads(api,bundle,[{fileName:'assets/leaflet.js',css:['assets/leaflet.css']}],'/'),1);
 assert.deepEqual(deps.js,['/assets/map.js']);assert.deepEqual(deps.css,['/assets/leaflet.css']);
});
test('missing real JavaScript or missing CSS makes the build fail closed',()=>{
 for(const placeholders of [[],[{fileName:'assets/missing.js',css:['assets/absent.css']}]]){
  const api={manager:{buildAssetsManifest:{clientReferenceDeps:{map:{js:['/assets/missing.js'],css:[]}}}}};
  assert.throws(()=>reconcileClientPreloads(api,{},placeholders,'/'),/missing client asset/);
 }
});
test('existing placeholders and subpath bases retain valid dependencies',()=>{
 const deps={js:['/preview/assets/style.js'],css:['/preview/assets/style.css']};
 const api={manager:{buildAssetsManifest:{clientReferenceDeps:{map:deps}}}};
 const bundle={'assets/style.js':chunk('assets/style.js',['/style.css'],['assets/style.css']),'assets/style.css':{type:'asset'}};
 assert.equal(reconcileClientPreloads(api,bundle,cssOnlyPlaceholders(bundle),'/preview/'),0);
 assert.deepEqual(deps.js,['/preview/assets/style.js']);
});
test('rendered routes preload only files present in the packaged client',async()=>{
 const {default:worker}=await import(new URL('../dist/server/index.js',import.meta.url));
 const manifest=JSON.parse(await readFile(new URL('../dist/client/offline-assets.json',import.meta.url),'utf8'));
 for(const path of ['/','/marketplace','/finca-demo','/app-local','/profesionales','/empresas','/tienda','/aprende']){
  const response=await worker.fetch(new Request('http://localhost'+path),{ASSETS:{fetch:async()=>new Response('missing',{status:404})}},{waitUntil(){},passThroughOnException(){}});
  assert.equal(response.status,200,path);const html=await response.text();
  const links=[...html.matchAll(/<link\b[^>]*rel="(?:modulepreload|stylesheet)"[^>]*>/g)].map(x=>x[0]);
  assert.ok(links.length,path+' should have asset hints');
  for(const link of links){const href=link.match(/href="([^"]+)"/)?.[1];if(!href?.startsWith('/assets/'))continue;assert.ok(manifest.assets.includes(href),`${path}: ${href} is not in deployment manifest`);await access(new URL('../dist/client'+href,import.meta.url));}
 }
});
