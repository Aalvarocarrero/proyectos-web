import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,watch:null}});
after(()=>vite.close());
const {storeProducts,validStoreQuantity,restoreStoreLine}=await vite.ssrLoadModule('/lib/store-products.ts');
const {orderPayloadSchema}=await vite.ssrLoadModule('/lib/sync-validation.ts');
const base={customerName:'Productor ejemplo',phone:'04121234567',items:[{id:'pollos',name:'Pollo',quantity:.5,measure:'kg',presentation:'Filete de pechuga',preparation:'Sin piel',specifications:'Empaque de 500 g'}]};
test('cuts and crop presentations support common Venezuelan purchases',()=>{
 for(const [id,presentation] of [['pollos','Alitas'],['carne-bovina','Punta trasera'],['carne-porcina','Pernil'],['cafe','Café tostado y molido'],['cacao','Plántula / mata de cacao']])assert.ok(storeProducts.find(p=>p.id===id).presentations.includes(presentation));
 assert.equal(validStoreQuantity(.5,'kg'),true);assert.equal(validStoreQuantity(200,'g'),true);assert.equal(validStoreQuantity(.5,'animal'),false);assert.equal(validStoreQuantity(Infinity,'kg'),false);
});
test('order processing preserves cuts and notes; requires business identity and whole plants',()=>{
 const parsed=orderPayloadSchema.parse(base);assert.equal(parsed.items[0].specifications,'Empaque de 500 g');assert.equal(parsed.items[0].preparation,'Sin piel');
 assert.equal(orderPayloadSchema.safeParse({...base,channel:'business'}).success,false);
 assert.equal(orderPayloadSchema.safeParse({...base,channel:'business',business:{companyName:'Restaurante ejemplo'}}).success,true);
 assert.equal(orderPayloadSchema.safeParse({...base,items:[{id:'cacao',name:'Cacao',quantity:1,measure:'kg',presentation:'Plántula / mata de cacao'}]}).success,false);
 assert.equal(orderPayloadSchema.safeParse({...base,items:[{id:'bovinos',name:'Bovino',quantity:.5,measure:'animal'}]}).success,false);
});
test('existing device carts and queued legacy orders retain their data',()=>{
 const old={id:'pollos',quantity:2,presentation:'Presentación anterior',measure:'kg'};
 assert.equal(restoreStoreLine(old).presentation,old.presentation);
 assert.equal(restoreStoreLine({...old,id:'unknown'}),null);
 assert.equal(orderPayloadSchema.safeParse({...base,items:[{id:'pollos',name:'Pollo',quantity:2}]}).success,true);
});
test('sitemap remains available during database interruption and excludes private workspaces',async()=>{
 const {default:sitemap,publicSitemapCandidates}=await vite.ssrLoadModule('/app/sitemap.ts');assert.deepEqual(await sitemap(),[]);const pages=await publicSitemapCandidates();
 assert.ok(pages.some(p=>p.url.endsWith('/tienda')));assert.ok(pages.some(p=>p.url.endsWith('/aprende/trabajar-sin-internet')));assert.equal(pages.some(p=>p.url.endsWith('/app')),false);
});
