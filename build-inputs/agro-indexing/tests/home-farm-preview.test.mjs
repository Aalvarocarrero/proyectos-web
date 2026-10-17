import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {createHash} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
const posterMetadata=JSON.parse(await readFile(new URL('../lib/home-farm-poster.json',import.meta.url),'utf8'));
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {shouldLoadHomeFarmPreview:load,stopHomeFarmPreview:stop}=await vite.ssrLoadModule('/lib/home-farm-preview.ts');
const state={loaded:false,failed:false,pageVisible:true,visible:false,requested:false,constrained:false,paused:false};
test('initial and offscreen home never load 3D; visible normal connection can load',()=>{
 assert.equal(load(state),false);assert.equal(load({...state,visible:true}),true);
 assert.equal(load({...state,visible:true,pageVisible:false}),false);
 assert.equal(load({...state,visible:true,loaded:true}),false);
 assert.equal(load({...state,visible:true,failed:true}),false);
});
test('save-data, slow connection and reduced motion require explicit opt-in for any 3D download',()=>{
 assert.equal(load({...state,visible:true,constrained:true}),false);
 assert.equal(load({...state,visible:true,constrained:true,requested:true}),true);
 assert.equal(load({...state,requested:true,pageVisible:false}),false);
});
test('pause, offscreen and hidden tabs stop playback without unloading or rebuilding',()=>{
 const playing={...state,visible:true,loaded:true};assert.equal(stop(playing),false);
 for(const change of [{paused:true},{visible:false},{pageVisible:false},{constrained:true}])assert.equal(stop({...playing,...change}),true);
 assert.equal(stop({...playing,constrained:true,requested:true}),false);
 assert.equal(stop({...playing,paused:true,requested:true}),true);
 assert.equal(load({...playing,visible:false}),false);
 assert.equal(load({...playing,visible:true}),false);
});
test('banner reuses real scene and fixture through a lazy isolated entry, never editable workspace',async()=>{
 const page=await readFile(root+'components/home-page-content.tsx','utf8'),preview=await readFile(root+'components/home-farm-preview.tsx','utf8'),scene=await readFile(root+'components/home-farm-scene.tsx','utf8');
 assert.match(page,/HomeFarmPreview/);assert.match(page,/href="\/finca-modelo" prefetch=\{false\}/);assert.match(page,/tu finca empieza con tus propios datos/);
 assert.match(preview,/lazy\(\(\)=>import\('\.\/home-farm-scene'\)\)/);
 assert.match(preview,/loaded&&!failed&&/);assert.doesNotMatch(preview,/loaded&&visible/);
 assert.match(preview,/loading="lazy"/);assert.match(preview,/prefers-reduced-motion/);assert.match(preview,/saveData/);assert.match(preview,/visibilitychange/);assert.match(preview,/clearTimeout/);
 assert.match(scene,/createFarmShowcase/);assert.match(scene,/FarmMasterplanWebGL/);assert.match(scene,/interactionBlocked=\{paused\}/);
 assert.doesNotMatch(scene,/components\/farm-showcase|farm-map-editor|offline-preparation|indexedDB|animal-dossier|fetch\(/);
});
test('static fallback is honest and bounded, generated from the 41 areas and 101 actual model animals',async()=>{
 const poster=await readFile(root+'public'+posterMetadata.src,'utf8');
 assert.ok((await stat(root+'public'+posterMetadata.src)).size<12000);
 assert.equal((poster.match(/<polygon /g)||[]).length,34);assert.equal((poster.match(/<circle /g)||[]).length,101);
 assert.match(poster,/vista ligera 2D/);assert.doesNotMatch(poster,/https?:\/\/(?!www.w3.org)/);
});

test('production bundle leaves the complete 3D scene and fixture behind the lazy boundary',async()=>{
 const manifest=JSON.parse(await readFile(root+'dist/client/.vite/manifest.json','utf8'));
 const entry='components/home-farm-preview.tsx',seen=new Set();
 const visit=key=>{if(seen.has(key))return;seen.add(key);for(const dependency of manifest[key]?.imports??[])visit(dependency);};visit(entry);
 assert.ok(manifest[entry].dynamicImports.includes('components/home-farm-scene.tsx'));
 assert.equal([...seen].some(key=>/farm-masterplan|farm-demo-fixture|farm-showcase|home-farm-scene/.test(key)),false);
 assert.ok((await stat(root+'dist/client/'+manifest[entry].file)).size<6000,'preview controller stays below 6 KB raw');
});


test('poster fences do not cover the farm and gates are linear overlays above areas',async()=>{
 const poster=await readFile(root+'public'+posterMetadata.src,'utf8');
 const fence=poster.match(/<polygon data-kind="fence"[^>]+>/)?.[0];
 assert.ok(fence);assert.match(fence,/fill="none"/);assert.match(fence,/stroke-dasharray/);
 assert.equal((poster.match(/data-kind="gate"/g)||[]).length,8);
 assert.ok(poster.indexOf('data-kind="fence"')>poster.lastIndexOf('fill="#448a93"'));
 assert.ok(poster.indexOf('data-kind="gate"')>poster.indexOf('data-kind="fence"'));
 const page=await readFile(root+'components/home-page-content.tsx','utf8');
 assert.match(page,/style=\{\{color:"#c4d8b2"\}\}>MI FINCA/);
 assert.match(page,/id="mi-finca-preview-title"[^>]+style=\{\{color:"#ffffff"\}\}/);
});


test('poster URL is immutable content-hashed and included in the offline library',async()=>{
 const bytes=await readFile(root+'public'+posterMetadata.src);
 const hash=createHash('sha256').update(bytes).digest('hex').slice(0,12);
 assert.equal(posterMetadata.src,`/previews/finca-modelo-plan-${hash}.svg`);
 assert.equal(posterMetadata.bytes,bytes.length);
 const preview=await readFile(root+'components/home-farm-preview.tsx','utf8');
 assert.match(preview,/src=\{poster.src\}/);assert.doesNotMatch(preview,/src="\/previews\/finca-modelo-plan.svg"/);
 const library=JSON.parse(await readFile(root+'dist/client/offline-library-assets.json','utf8'));
 assert.ok(library.assets.some(asset=>asset.path===posterMetadata.src&&asset.bytes===bytes.length));
});

test('normal loading never shows a transient 2D plan, including server render and hydration preferences',async()=>{
 const {homeFarmPreviewMode:mode}=await vite.ssrLoadModule('/lib/home-farm-preview.ts');
 const initial={preferencesKnown:false,chosen2D:false,constrained:true,requested:false,ready:false,failed:false};
 assert.equal(mode(initial),'loading');
 assert.equal(mode({...initial,preferencesKnown:true,constrained:false}),'loading');
 assert.equal(mode({...initial,preferencesKnown:true,constrained:false,ready:true}),'3d');
 for(const change of [{failed:true},{chosen2D:true},{preferencesKnown:true}])assert.equal(mode({...initial,...change}),'2d');
 assert.equal(mode({...initial,preferencesKnown:true,requested:true}),'loading');
 assert.equal(mode({...initial,preferencesKnown:true,requested:true,ready:true}),'3d');
 const {renderToStaticMarkup}=await import('react-dom/server');
 const {createElement}=await import('react');
 const {HomeFarmPreview}=await vite.ssrLoadModule('/components/home-farm-preview.tsx');
 const markup=renderToStaticMarkup(createElement(HomeFarmPreview));
 assert.doesNotMatch(markup,/<img|<canvas|plano 2D|preload/);
 assert.match(markup,/Preparando vista 3D/);
 assert.match(markup,/También disponible en 2D/);
 assert.match(markup,/aspect-\[8\/5\]/);
});

test('preview reveal requires a rendered frame after assets or a bounded material budget; cleanup and failure remain available',async()=>{
 const preview=await readFile(root+'components/home-farm-preview.tsx','utf8');
 const scene=await readFile(root+'components/farm-masterplan-webgl.tsx','utf8');
 assert.match(preview,/mode==='2d'&&<img/);
 assert.match(preview,/stopped=!ready\|\|mode==='2d'/);
 assert.match(preview,/setTimeout\(\(\)=>setFailed\(true\),20000\)/);
 assert.match(preview,/if\(!loaded\|\|ready\|\|failed\|\|!pageVisible\|\|!visible\)return/);
 assert.match(preview,/setChosen2D\(true\);setRequested\(false\)/);
 assert.match(scene,/renderer.render\(scene,camera\).*if\(previewAssetsReady&&!previewNotified\)/);
 assert.match(scene,/if\(props.preview\)previewRevealTimer=setTimeout\(allowPreview,2500\)/);
 assert.match(scene,/clearTimeout\(previewRevealTimer\);allowPreview\(\)/);
 assert.match(scene,/cancelAnimationFrame\(assetStart\);clearTimeout\(previewRevealTimer\)/);
});
