import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {DatabaseSync} from 'node:sqlite';
import {adminIdentity,requireMutation,validateCatalog,publicCatalog,loadState,saveState,readLimitedBody} from '../server/catalog-service.mjs';
import {handleAdmin} from '../server/admin-handler.mjs';import {inspectImage} from '../server/image-validation.mjs';
const defaults=JSON.parse(fs.readFileSync(new URL('../server/default-catalog.json',import.meta.url)));
const assets=new Set(JSON.parse(fs.readFileSync(new URL('../server/known-assets.json',import.meta.url))));
const clone=()=>structuredClone(defaults);
class D1 {
 constructor(){this.db=new DatabaseSync(':memory:');for(const file of fs.readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')))this.db.exec(fs.readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));}
 prepare(sql){const db=this.db;return {sql,values:[],bind(...values){this.values=values;return this;},async first(){return db.prepare(sql).get(...this.values)||null;},async all(){return {results:db.prepare(sql).all(...this.values)};},async run(){return {meta:db.prepare(sql).run(...this.values)};}};}
 async batch(statements){this.db.exec('BEGIN IMMEDIATE');try{const results=[];for(const s of statements)results.push(await s.run());this.db.exec('COMMIT');return results;}catch(e){this.db.exec('ROLLBACK');throw e;}}
}
const env=()=>({DB:new D1(),ROHO_ADMIN_USER_IDS:'["owner-id"]'});
function req(path,body,id='owner-id',origin='https://roho.test'){return new Request('https://roho.test/api/admin/'+path,{method:body?'POST':'GET',headers:{...(id?{'oai-authenticated-user-id':id}:{}),...(body?{'Content-Type':'application/json','Origin':origin,'X-Roho-Admin':'1'}:{})},body:body?JSON.stringify(body):undefined});}

test('auth fails closed for anonymous, empty/malformed configuration, and nonmembers',()=>{
 for(const [id,config,status] of [[null,'["owner-id"]',401],['owner-id',undefined,503],['owner-id','garbage',503],['owner-id','{}',503],['stranger','["owner-id"]',403]])assert.throws(()=>adminIdentity(req('catalog',null,id),{ROHO_ADMIN_USER_IDS:config}),e=>e.status===status);
 assert.equal(adminIdentity(req('catalog'),{ROHO_ADMIN_USER_IDS:'["owner-id"]'}),'owner-id');
});
test('mutations require exact same origin and custom header',()=>{
 assert.throws(()=>requireMutation(req('save',{},'owner-id','https://evil.test')),e=>e.status===403);
 assert.throws(()=>requireMutation(new Request('https://roho.test/api/admin/save',{method:'POST',headers:{origin:'https://roho.test'}})),e=>e.status===403);
 assert.doesNotThrow(()=>requireMutation(req('save',{})));
});
test('existing catalog validates without changing prices',()=>{const c=validateCatalog(clone());assert.deepEqual(Object.values(c.products).map(p=>p.price),[48572,59622,111622,176622]);});
test('public catalog excludes draft and archived products and their unused harvests',()=>{
 const c=clone();c.products['roho-001'].publicationStatus='draft';c.products['kit-camino'].publicationStatus='archived';assert.deepEqual(Object.keys(publicCatalog(c).products),['kit-origen','kit-pausa']);for(const p of Object.values(c.products))p.publicationStatus='draft';assert.deepEqual(publicCatalog(c).harvests,{});
});
test('validation rejects unsafe imagery, map URLs, fake inventory, invalid categories and malformed prices',()=>{
 for(const change of [c=>c.products['roho-001'].image='javascript:alert(1)',c=>c.products['roho-001'].stock=40,c=>c.products['roho-001'].price=-1,c=>c.products['roho-001'].categoryId='unknown',c=>c.harvests['ROHO 001'].mapEmbed='https://evil.test/embed',c=>c.products['roho-001'].edition='constructor']){const c=clone();change(c);assert.throws(()=>validateCatalog(c));}
});
test('durable draft, publish, and optimistic conflicts operate against real SQLite schema',async()=>{
 const e=env();const first=await loadState(e,defaults);assert.equal(first.version,0);
 const c=clone();c.products['roho-001'].name='Nombre revisado';
 assert.deepEqual(await saveState(e,'owner-id',0,c,'save',defaults),{version:1,publishedVersion:0});
 let state=await loadState(e,defaults);assert.equal(state.draft.products['roho-001'].name,'Nombre revisado');assert.equal(state.published.products['roho-001'].name,defaults.products['roho-001'].name);
 await assert.rejects(saveState(e,'owner-id',0,c,'save',defaults),x=>x.status===409);
 await saveState(e,'owner-id',1,c,'publish',defaults);state=await loadState(e,defaults);assert.equal(state.published.products['roho-001'].name,'Nombre revisado');assert.equal(state.publishedVersion,2);
 assert.equal((await e.DB.prepare('SELECT * FROM catalog_revisions').all()).results.length,2);
});
test('concurrent saves permit only one winner and one audit entry',async()=>{
 const e=env();const results=await Promise.allSettled([saveState(e,'owner-id',0,clone(),'save',defaults),saveState(e,'owner-id',0,clone(),'save',defaults)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal((await e.DB.prepare('SELECT * FROM catalog_revisions').all()).results.length,1);
});
test('admin API cannot be read or mutated by unauthorized users',async()=>{
 const e=env();assert.equal((await handleAdmin(req('catalog',null,'stranger'),e,defaults,assets)).status,403);assert.equal((await handleAdmin(req('save',{catalog:clone(),expectedVersion:0},null),e,defaults,assets)).status,401);assert.equal((await handleAdmin(req('save',{catalog:clone(),expectedVersion:0},'owner-id','https://evil.test'),e,defaults,assets)).status,403);
});
test('admin API save, publication, history and restore are persistent and versioned',async()=>{
 const e=env(),c=clone();c.texts.title='Texto revisado';
 assert.equal((await handleAdmin(req('save',{catalog:c,expectedVersion:0}),e,defaults,assets)).status,200);
 assert.equal((await handleAdmin(req('publish',{expectedVersion:1}),e,defaults,assets)).status,200);
 c.texts.title='Otro texto';await handleAdmin(req('save',{catalog:c,expectedVersion:2}),e,defaults,assets);
 assert.equal((await handleAdmin(req('restore',{version:1,expectedVersion:3}),e,defaults,assets)).status,200);
 const state=await loadState(e,defaults);assert.equal(state.version,4);assert.equal(state.publishedVersion,2);assert.equal(state.draft.texts.title,'Texto revisado');
 assert.equal((await (await handleAdmin(req('revisions'),e,defaults,assets)).json()).length,4);
});
test('unknown or unuploaded images cannot be persisted',async()=>{
 const e=env(),c=clone();c.products['roho-001'].image='./assets/missing.png';assert.equal((await handleAdmin(req('save',{catalog:c,expectedVersion:0}),e,defaults,assets)).status,400);
 c.products['roho-001'].image='/media/00000000-0000-0000-0000-000000000000.png';assert.equal((await handleAdmin(req('save',{catalog:c,expectedVersion:0}),e,defaults,assets)).status,400);
});
test('raster validation checks real existing images and rejects spoofed SVG and MIME',()=>{
 const data=fs.readFileSync(new URL('../public/assets/icon-192.png',import.meta.url));const buffer=data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength);assert.equal(inspectImage(buffer,'image/png').width,192);assert.throws(()=>inspectImage(buffer,'image/jpeg'));assert.throws(()=>inspectImage(new TextEncoder().encode('<svg onload="alert(1)"></svg>').buffer,'image/png'));
 const webp=fs.readFileSync(new URL('../public/assets/roho-001.webp',import.meta.url));assert.ok(inspectImage(webp.buffer.slice(webp.byteOffset,webp.byteOffset+webp.byteLength),'image/webp').width>0);
});
test('request bodies are bounded even without Content-Length',async()=>{await assert.rejects(readLimitedBody(new Request('https://roho.test',{method:'POST',body:'123456'}),5),e=>e.status===413);});
test('unexpected private metadata is stripped before storing or publishing',()=>{const c=clone();c.internalNotes='private';c.products['roho-001'].supplierSecret='private';const validated=validateCatalog(c);assert.equal(validated.internalNotes,undefined);assert.equal(validated.products['roho-001'].supplierSecret,undefined);});
test('authorized image upload stores R2 bytes and D1 metadata; draft preview requires admin',async()=>{
 const e=env(),files=new Map();e.BUCKET={async put(key,buffer,options){files.set(key,{body:buffer,httpMetadata:options.httpMetadata});},async head(key){return files.has(key)?{}:null;},async get(key){return files.get(key)||null;},async delete(key){files.delete(key);}};
 const file=fs.readFileSync(new URL('../public/assets/icon-192.png',import.meta.url));
 const request=new Request('https://roho.test/api/admin/media',{method:'POST',headers:{'oai-authenticated-user-id':'owner-id',Origin:'https://roho.test','X-Roho-Admin':'1','Content-Type':'image/png'},body:file});
 const uploaded=await handleAdmin(request,e,defaults,assets);assert.equal(uploaded.status,201);const info=await uploaded.json();assert.equal(info.width,192);assert.equal(files.size,1);
 const c=clone();c.products['roho-001'].image=info.image;assert.equal((await handleAdmin(req('save',{catalog:c,expectedVersion:0}),e,defaults,assets)).status,200);
 const previewPath=info.preview.replace('/api/admin/','');assert.equal((await handleAdmin(req(previewPath),e,defaults,assets)).status,200);assert.equal((await handleAdmin(req(previewPath,null,'stranger'),e,defaults,assets)).status,403);
 const state=await loadState(e,defaults);assert.ok(!Object.values(publicCatalog(state.published).products).some(p=>p.image===info.image));
});

test('older snapshots normalize homepage defaults without rewriting products',()=>{
 const c=clone();delete c.homepage;const normalized=validateCatalog(c);assert.equal(normalized.homepage.heroTitle,defaults.homepage.heroTitle);assert.deepEqual(normalized.products,c.products);
});
test('homepage allowlist strips unknown keys, rejects unsafe media and oversized text',()=>{
 const c=clone();c.homepage.internalSecret='private';assert.equal(validateCatalog(c).homepage.internalSecret,undefined);
 c.homepage.originImage='https://untrusted.example/x.png';assert.throws(()=>validateCatalog(c),e=>e.status===400);
 c.homepage.originImage=defaults.homepage.originImage;c.homepage.heroTitle='x'.repeat(2001);assert.throws(()=>validateCatalog(c),e=>e.status===400);
});
test('homepage text and images use the same draft, publish, restore and conflict boundary',async()=>{
 const e=env(),c=clone();c.homepage.heroTitle='Prueba de contenido';c.homepage.originImage='./assets/cosecha.webp';
 assert.equal((await handleAdmin(req('save',{catalog:c,expectedVersion:0}),e,defaults,assets)).status,200);
 let state=await loadState(e,defaults);assert.equal(publicCatalog(state.published).homepage.heroTitle,defaults.homepage.heroTitle);
 assert.equal((await handleAdmin(req('publish',{expectedVersion:0}),e,defaults,assets)).status,409);
 assert.equal((await handleAdmin(req('publish',{expectedVersion:1}),e,defaults,assets)).status,200);
 state=await loadState(e,defaults);assert.equal(publicCatalog(state.published).homepage.heroTitle,'Prueba de contenido');
 const second=clone();second.homepage.heroTitle='Segundo borrador';await handleAdmin(req('save',{catalog:second,expectedVersion:2}),e,defaults,assets);
 assert.equal((await handleAdmin(req('restore',{version:1,expectedVersion:3}),e,defaults,assets)).status,200);state=await loadState(e,defaults);assert.equal(state.draft.homepage.heroTitle,'Prueba de contenido');assert.equal(state.publishedVersion,2);
});
test('homepage media must exist; library and content configuration require authorized identity',async()=>{
 const e=env(),c=clone();c.homepage.originImage='./assets/missing.png';assert.equal((await handleAdmin(req('save',{catalog:c,expectedVersion:0}),e,defaults,assets)).status,400);
 for(const path of ['media','content-fields']){assert.equal((await handleAdmin(req(path,null,null),e,defaults,assets)).status,401);assert.equal((await handleAdmin(req(path,null,'stranger'),e,defaults,assets)).status,403);assert.equal((await handleAdmin(req(path),e,defaults,assets)).status,200);}
});
test('referenced category and harvest removal cannot be saved',()=>{
 for(const change of [c=>c.categories=c.categories.filter(x=>x.id!=='coffee'),c=>delete c.harvests['ROHO 001']]){const c=clone();change(c);assert.throws(()=>validateCatalog(c),e=>e.status===400);}
});
