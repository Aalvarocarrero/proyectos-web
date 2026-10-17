import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const sqlite=new DatabaseSync(':memory:');
for(const file of readdirSync(root+'/drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync(root+'/drizzle/'+file,'utf8'));
globalThis.__networkTestEnv={DB:{prepare(query){const stmt=sqlite.prepare(query);const bind=(values=[])=>({bind(...args){return bind(args);},async run(){return {success:true,meta:stmt.run(...values)};},async all(){return {results:stmt.all(...values)};},async raw(){stmt.setReturnArrays(true);return stmt.all(...values);}});return bind();}}};
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},plugins:[{name:'test-d1-env',resolveId(id){if(id==='cloudflare:workers')return '\0test-cloudflare';},load(id){if(id==='\0test-cloudflare')return 'export const env=globalThis.__networkTestEnv;';}}],server:{middlewareMode:true,hmr:false,watch:null}});
after(async()=>{await vite.close();sqlite.close();delete globalThis.__networkTestEnv;});
const {syncNetworkOperation,networkSnapshot,getPublicFarm,getPublicPost}=await vite.ssrLoadModule('/lib/community-network-db.ts');
const {professionalDetailsSchema}=await vite.ssrLoadModule('/lib/professional-profile.ts');
const {publicFarmSchema}=await vite.ssrLoadModule('/lib/network-profile.ts');
const time='2026-10-04T00:00:00Z';
const farm={name:'Finca de prueba',responsibleName:'Responsable de prueba',phone:'+58 412 1234567',state:'Apure',description:'Producción agropecuaria de prueba para validar permisos.',rubrics:'Cacao y bovinos',purposes:['Producción'],actingUserId:'owner-a'};
const op=(entityType,entityId,payload,action='upsert',date=time)=>{const table={'public-farm':'public_farm_profiles','social-post':'community_posts','social-comment':'community_comments'}[entityType];const row=table?sqlite.prepare('select revision from '+table+' where id=?').get(entityId):null;return {id:'test_'+crypto.randomUUID(),entityType,entityId,payload,action,clientUpdatedAt:date,baseRevision:row?.revision??null};};
test('legacy professionals remain valid; companies require corporate identity; unsafe links are rejected',()=>{
 assert.equal(professionalDetailsSchema.parse({}).profileType,'Persona natural');
 assert.equal(professionalDetailsSchema.safeParse({profileType:'Empresa'}).success,false);
 assert.equal(professionalDetailsSchema.safeParse({profileType:'Empresa',corporateName:'Servicios del agro',socials:{website:'javascript:alert(1)'}}).success,false);
 assert.equal(publicFarmSchema.safeParse({...farm,phone:'bad-number'}).success,false);
});
test('private registration fields never appear in the published farm; ownership and review are enforced',async()=>{
 await syncNetworkOperation(op('public-farm','farm-test',{...farm,privatePlan:'secret coordinates'}),'owner-a','Persona',time);
 assert.equal(await getPublicFarm('farm-test'),undefined);
 assert.equal((await networkSnapshot('owner-b')).mine.length,0);
 await assert.rejects(()=>syncNetworkOperation(op('public-farm','farm-test',{...farm,actingUserId:'owner-b'}),'owner-b','Otra persona',time),/forbidden/);
 await assert.rejects(()=>syncNetworkOperation(op('social-post','post-test',{farmId:'farm-test',text:'Publicación de prueba',actingUserId:'owner-a'}),'owner-a','Persona',time),/published_owned_farm_required/);
 sqlite.prepare("update public_farm_profiles set status='active' where id=?").run('farm-test');
 const published=await getPublicFarm('farm-test');assert.equal(published.privatePlan,undefined);assert.equal(published.actingUserId,undefined);
 await syncNetworkOperation(op('social-post','post-test',{farmId:'farm-test',text:'Publicación de prueba',actingUserId:'owner-a'}),'owner-a','Persona',time);
 assert.equal(await getPublicPost('post-test'),undefined);
 sqlite.prepare("update community_posts set status='active' where id=?").run('post-test');
 await syncNetworkOperation(op('social-comment','comment-test',{postId:'post-test',text:'Una pregunta del productor',actingUserId:'owner-b'}),'owner-b','Productor B',time);
 assert.equal((await getPublicPost('post-test')).post.comments.length,0);
 sqlite.prepare("update community_comments set status='active' where id=?").run('comment-test');
 assert.equal((await getPublicPost('post-test')).post.comments.length,1);
});
test('retries do not multiply likes and a stale retry cannot restore a removed like',async()=>{
 const like=op('social-reaction','reaction-test',{postId:'post-test',liked:true,actingUserId:'owner-b'});
 await syncNetworkOperation(like,'owner-b','Productor',time);await syncNetworkOperation(like,'owner-b','Productor',time);
 assert.equal((await getPublicPost('post-test')).post.likes,1);
 await syncNetworkOperation(op('social-reaction','reaction-new',{postId:'post-test',liked:false,actingUserId:'owner-b'},'upsert','2026-10-04T00:01:00Z'),'owner-b','Productor',time);
 await syncNetworkOperation(like,'owner-b','Productor',time);
 assert.equal((await getPublicPost('post-test')).post.likes,0);
 await assert.rejects(()=>syncNetworkOperation(like,'different-account','Persona',time),/account_changed/);
 await syncNetworkOperation(op('public-farm','farm-test',{actingUserId:'owner-a'},'delete'),'owner-a','Persona',time);
 assert.equal(await getPublicPost('post-test'),undefined);
 await assert.rejects(()=>syncNetworkOperation(like,'owner-b','Productor',time),/published_farm_required/);
});


test('shared marketplace announcements require an active listing and active owned farm, then keep moderation and safe removal',async()=>{
 const secondFarm='farm-sharing';await syncNetworkOperation(op('public-farm',secondFarm,{...farm}),'owner-a','Persona',time);sqlite.prepare("update public_farm_profiles set status='active' where id=?").run(secondFarm);
 const payload={farmId:secondFarm,text:'Comparto esta oferta para consultar disponibilidad.',listingId:'listing-sharing',actingUserId:'owner-a'};
 await assert.rejects(()=>syncNetworkOperation(op('social-post','post-sharing',payload),'owner-a','Persona',time),/published_listing_required/);
 sqlite.prepare("insert into marketplace_listings(id,owner_id,seller_name,title,description,category,location,contact,status,image_key,client_updated_at,server_updated_at) values(?,?,?,?,?,?,?,?,?,?,?,?)").run('listing-sharing','seller-b','Vendedor sintético','Anuncio sintético','Descripción sintética','Bovinos','Zona sintética','', 'active','marketplace/listing/seller-b/listing-sharing/op-1/cover.png',time,time);
 const share=op('social-post','post-sharing',payload);await syncNetworkOperation(share,'owner-a','Persona',time);await syncNetworkOperation(share,'owner-a','Persona',time);assert.equal(await getPublicPost('post-sharing'),undefined);
 sqlite.prepare("update community_posts set status='active' where id=?").run('post-sharing');let published=await getPublicPost('post-sharing');assert.equal(published.post.text,payload.text);assert.equal(published.post.listing.id,'listing-sharing');assert.equal(published.post.listing.ownerId,undefined);
 sqlite.prepare("update marketplace_listings set deleted=1 where id=?").run('listing-sharing');published=await getPublicPost('post-sharing');assert.equal(published.post.listing,undefined);assert.equal(published.post.listingId,'listing-sharing');assert.equal(sqlite.prepare("select count(*) n from community_posts where id='post-sharing'").get().n,1);
});
