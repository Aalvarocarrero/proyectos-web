import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,watch:null}});
const {sitePhotos}=await vite.ssrLoadModule('/lib/site-photos.ts');
after(()=>vite.close());
test('replacement photographs are distinct, optimized and have complete licensing provenance',async()=>{
 assert.equal(sitePhotos.length,14);assert.equal(new Set(sitePhotos.map(p=>p.source)).size,14);assert.equal(new Set(sitePhotos.map(p=>p.src)).size,14);
 for(const photo of sitePhotos){assert.ok(photo.author);assert.ok(photo.license);assert.ok(photo.licenseUrl.startsWith('https://'));assert.ok(photo.source.startsWith('https://commons.wikimedia.org/'));assert.match(photo.changes,/WebP/);assert.ok(photo.width<=1600);assert.ok((await stat(root+'public'+photo.src)).size<650000);}
});
test('all formerly repeated brown-cow contexts use distinct scenes or an honest product placeholder',async()=>{
 for(const path of ['app/page.tsx','app/tienda/page.tsx','app/fincas/page.tsx','app/guia-institucional/page.tsx','app/marketplace/page.tsx','app/globals.css','lib/store-products.ts','lib/network-profile.ts','components/marketplace-browser.tsx'])assert.doesNotMatch(await readFile(root+path,'utf8'),/photo-cattle|hero-photo-cattle|demo-novillas/);
 const css=await readFile(root+'app/globals.css','utf8');const photos=[];
 for(const role of ['production','store','farms','institutions','market']){const block=css.match(new RegExp('\\.hero-photo-'+role+' \\{([^}]+)\\}'))?.[1];assert.ok(block,role);photos.push(block.match(/url\("([^\"]+)"\)/)?.[1]);}
 assert.equal(new Set(photos).size,5);
 const footer=await readFile(root+'components/public-footer.tsx','utf8');assert.match(footer,/creditos-fotograficos/);
});
