import {productionEnv} from './fixtures/production-worker.mjs';
import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,cacheDir:'/tmp/agro-land-water-tests',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {landWaterGuides}=await vite.ssrLoadModule('/lib/land-water-guides.ts');
const {articles}=await vite.ssrLoadModule('/lib/articles.ts');
test('five source-grounded guides are included once with dated primary references and exercises',()=>{
 assert.equal(landWaterGuides.length,5);
 assert.equal(new Set(articles.map(a=>a.slug)).size,articles.length);
 for(const guide of landWaterGuides){
  assert.ok(articles.some(a=>a.slug===guide.slug));assert.ok(guide.sections.length>=5);
  assert.ok(guide.sections.some(s=>s.heading.startsWith('Ejercicio')));
  assert.equal(guide.updatedAt,'2026-10-07');assert.ok(guide.sources.length);
  for(const source of guide.sources){const u=new URL(source.url);assert.equal(u.protocol,'https:');assert.ok(['www.fao.org','faolex.fao.org','www.woah.org'].includes(u.hostname));assert.ok(source.note.length>30);}
 }
});
test('online and downloaded guides show sources; library logo has an explicit cream-surface tone',async()=>{
 const online=await readFile(new URL('../app/aprende/[slug]/page.tsx',import.meta.url),'utf8');
 const offline=await readFile(new URL('../components/offline-library.tsx',import.meta.url),'utf8');
 const sources=await readFile(new URL('../components/article-sources.tsx',import.meta.url),'utf8');
 assert.match(online,/<ArticleSources sources=\{article.sources\}/);
 assert.match(offline,/<ArticleSources sources=\{article.sources\} offline/);
 assert.match(offline,/<VenezuelaAgroLogo compact tone="dark"/);
 assert.match(sources,/Abrir los documentos originales requiere internet/);
});
test('all five built article routes render full text, source links, and canonical production metadata',async()=>{
 const {default:worker}=await import(new URL('../dist/server/index.js',import.meta.url));
 for(const guide of landWaterGuides){
  const response=await worker.fetch(new Request('https://venezuelaagro.com/aprende/'+guide.slug,{headers:{accept:'text/html'}}),productionEnv(),{waitUntil(){},passThroughOnException(){}});
  assert.equal(response.status,200,guide.slug);
  const html=await response.text();assert.ok(html.includes(guide.title));assert.ok(html.includes('Fuentes y alcance'));
  for(const source of guide.sources) assert.ok(html.includes(source.url),source.url);
  assert.doesNotMatch(response.headers.get('x-robots-tag')||'',/noindex/);assert.match(html.split('</head>')[0],/name="robots"[^>]*content="index,\s*follow"/);assert.match(html,/Contenido educativo general/);
 }
});
