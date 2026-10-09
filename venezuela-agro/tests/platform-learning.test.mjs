import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,watch:null}});
after(()=>vite.close());
const {agroEntries,cropNames,animalNames}=await vite.ssrLoadModule('/lib/agro-catalog.ts');
const {categoryMatches,marketplaceCategories}=await vite.ssrLoadModule('/lib/marketplace-categories.ts');
const {platformGuides}=await vite.ssrLoadModule('/lib/platform-guides.ts');
test('expanded rubric selections preserve old entries and group specific products in market filters',()=>{
 for(const name of ['Maíz','Arroz','Cacao','Café','Mapuey','Quinchoncho','Sisal','Ocumo','Vainita'])assert.ok(cropNames.includes(name),name);
 for(const name of ['Bovino','Porcino','Ave','Pez','Equino','Ovino / caprino','Colmena'])assert.ok(animalNames.includes(name),name);
 assert.equal(categoryMatches('Maíz blanco','Granos y forrajes'),true);
 assert.equal(categoryMatches('Novillo','Bovinos'),true);
 assert.equal(categoryMatches('Tilapia','Piscicultura'),true);
 assert.equal(categoryMatches('Arroz','Bovinos'),false);
 assert.equal(categoryMatches('Rubro personalizado','Rubro personalizado'),true);
 const values=marketplaceCategories.map(c=>c.value);
 assert.equal(new Set(values).size,values.length,'unique options');
 assert.ok(agroEntries.length>200);
});
test('every platform guide has a lightweight accessible visual and direct action',async()=>{
 assert.equal(platformGuides.length,12);
 assert.equal(new Set(platformGuides.map(g=>g.slug)).size,12);
 for(const guide of platformGuides){
  assert.equal(guide.sections.length,4);
  assert.ok(guide.tutorial.targetHref.startsWith('/'));
  const svg=await readFile(`${root}/public${guide.tutorial.visual}`,'utf8');
  assert.ok(Buffer.byteLength(svg)<6000);
  assert.match(svg,/viewBox="0 0 960 640"/);
  assert.match(svg,/<title/);
  for(const [label] of guide.tutorial.fields)assert.ok(svg.includes(label));
 }
 const offline=platformGuides.find(g=>g.slug==='trabajar-sin-internet');
 assert.match(offline.tutorial.tip,/cerrada no garantiza/);
});
