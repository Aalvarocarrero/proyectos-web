import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({configFile:false,appType:'custom',root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(()=>vite.close());
const image=await vite.ssrLoadModule('/lib/social-image.ts'),content=await vite.ssrLoadModule('/lib/public-image-content.ts'),{SHARE_PHOTO_REPLACEMENTS:mapping}=await vite.ssrLoadModule('/lib/share-photo-replacements.ts');
const {demoMarketplaceListings}=await vite.ssrLoadModule('/lib/marketplace-demo.ts'),{storeProducts}=await vite.ssrLoadModule('/lib/store-products.ts'),{demoPublicFarms,demoPosts}=await vite.ssrLoadModule('/lib/network-profile.ts'),{veterinaryCompanyDemo}=await vite.ssrLoadModule('/lib/company-demo.ts');
test('every existing public sample photo has a ready allowed export without changing its page photo',async()=>{
 const cards=[...demoMarketplaceListings.map(row=>content.marketplaceImageContent(row)),...storeProducts.map(row=>content.storeImageContent(row)),...demoPublicFarms.map(row=>content.farmImageContent(row)),...demoPosts.map(row=>content.postImageContent(row,demoPublicFarms.find(farm=>farm.id===row.farmId))),...veterinaryCompanyDemo.products.map(row=>content.companyProductImageContent(veterinaryCompanyDemo,row))];
 for(const card of cards){const before=structuredClone(card);const choice=image.urlFreeSocialPhoto(card.photo);assert.equal(choice.omitted,false,card.id);assert.deepEqual(card,before);if(card.photo){assert.ok(choice.photo,card.id);assert.ok((await readFile(root+'public'+choice.photo.src)).length,card.id);assert.deepEqual(image.socialImageAttribution(choice.photo),[]);}}
});
test('only known sample/stock paths substitute photos; uploaded private or public media is not silently replaced',()=>{
 for(const src of ['/api/media/marketplace/user/photo.webp','data:image/png;base64,AAAA']){const photo={src,alt:'La foto de mi anuncio'};const choice=image.urlFreeSocialPhoto(photo);assert.equal(choice.photo,photo);assert.equal(choice.replacement,undefined);}
 for(const alternate of Object.values(mapping)){assert.ok(alternate.src.startsWith('/share-photos/')||alternate.src.startsWith('/photos/'));assert.equal(alternate.fit,'contain');assert.ok(alternate.alt.length>20);}
 assert.equal(mapping['/photos/market-examples/demo-porcinos-engorde.webp'].src,'/share-photos/farm-pigs-pexels.webp');
 assert.equal(mapping['/products/pescado.webp'].src,'/share-photos/fish-pexels.webp');
});
test('every newly shipped alternative is selected and has a verified permission/provenance record',async()=>{
 const records=[];for(const name of ['share-photo-animal-sources.json','share-photo-farm-sources.json','share-original-illustrations.json']){const data=JSON.parse(await readFile(root+'docs/qa/'+name,'utf8'));records.push(...(Array.isArray(data)?data:data.assets).map(entry=>({...entry,src:entry.src||entry.localPath,visuallyInspected:entry.visuallyInspected??entry.pixelsInspected})));}
 const selected=new Set(Object.values(mapping).map(item=>item.src));
 for(const filename of await readdir(root+'public/share-photos')){
  const path='/share-photos/'+filename;assert.ok(selected.has(path),'Unused candidate should not ship: '+path);
  const entry=records.find(item=>item.src===path);assert.ok(entry,'Missing provenance: '+path);assert.equal(entry.attributionRequired,false,path);assert.equal(entry.visuallyInspected,true,path);
  const bytes=await readFile(root+'public'+path);assert.equal(bytes.length,entry.bytes,path);assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,path);
 }
});
test('an export loads the permitted alternative, preserves public contact and never paints credits or URLs',async()=>{
 const previous={document:global.document,Image:global.Image,location:global.location};const painted=[],loaded=[];let draws=0;
 try{global.location={origin:'https://private.example'};global.Image=class{naturalWidth=1080;naturalHeight=720;set src(value){loaded.push(value);if(value)queueMicrotask(()=>this.onload?.());}};
 const ctx={fillStyle:'',font:'',fillRect(){},fillText:text=>painted.push(text),measureText:text=>({width:[...text].length*7}),save(){},beginPath(){},rect(){},clip(){},drawImage(){draws++;},restore(){}};
 global.document={createElement:()=>({width:0,height:0,getContext:()=>ctx,toBlob:callback=>callback(new Blob(['image'],{type:'image/png'}))})};
 await image.buildSocialImage({id:'real',title:'Novillas',category:'Bovinos',detail:'USD 500',description:'Animales en buen estado. https://no-print.example',publicContact:{name:'Ana Pérez',phone:'+58 414 1234567'},path:'/marketplace/real',photo:{src:'/photos/market-examples/demo-bovinos.webp',alt:'Foto ilustrativa'}},image.socialImageFormats[0]);
 assert.deepEqual(loaded,['https://private.example/share-photos/cattle-cc0.webp']);assert.equal(draws,1);const text=painted.join(' ');
 for(const expected of ['Ana Pérez','+58 414 1234567','USD 500','Animales en buen estado','Fotografía de referencia'])assert.ok(text.includes(expected),expected);
 assert.doesNotMatch(text,/https?:|www\.|creativecommons|Mammalwatcher|CC0|Pexels|CC BY/);
 }finally{global.document=previous.document;global.Image=previous.Image;global.location=previous.location;}
});
