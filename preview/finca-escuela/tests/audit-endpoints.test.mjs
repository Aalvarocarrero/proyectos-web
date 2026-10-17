import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const sqlite=new DatabaseSync(':memory:');for(const file of readdirSync(root+'drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync(root+'drizzle/'+file,'utf8'));
const objects=new Map();
globalThis.__auditUser=null;
globalThis.__auditEnv={DB:{prepare(query){const stmt=sqlite.prepare(query);const bind=(values=[])=>({bind(...args){return bind(args);},async run(){return {success:true,meta:stmt.run(...values)};},async all(){return {results:stmt.all(...values)};},async raw(){stmt.setReturnArrays(true);return stmt.all(...values);}});return bind();}},BUCKET:{async head(key){const value=objects.get(key);return value?{size:value.bytes.byteLength}:null;},async put(key,bytes,options){objects.set(key,{bytes,options});},async get(key){const value=objects.get(key);return value?{body:value.bytes,httpEtag:'test',writeHttpMetadata(headers){headers.set('content-type',value.options?.httpMetadata?.contentType||'image/png');}}:null;}}};
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},plugins:[{name:'audit-env',enforce:'pre',resolveId(id){if(id==='cloudflare:workers')return '\0audit-env';if(id.endsWith('/app/chatgpt-auth')||id.endsWith('/app/chatgpt-auth.ts'))return '\0audit-auth';},load(id){if(id==='\0audit-env')return 'export const env=globalThis.__auditEnv';if(id==='\0audit-auth')return 'export async function getChatGPTUser(){return globalThis.__auditUser;}';}}],server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
const market=await vite.ssrLoadModule('/app/api/marketplace/route.ts');const sync=await vite.ssrLoadModule('/app/api/sync/route.ts');const admin=await vite.ssrLoadModule('/app/api/admin/route.ts');const bootstrap=await vite.ssrLoadModule('/app/api/bootstrap/route.ts');const media=await vite.ssrLoadModule('/app/api/media/[...key]/route.ts');const consent=await vite.ssrLoadModule('/app/api/security/consent/route.ts');const {serializeJsonLd}=await vite.ssrLoadModule('/lib/json-ld.ts');const {isAdminIdentity}=await vite.ssrLoadModule('/lib/admin-access.ts');
after(async()=>{await vite.close();sqlite.close();delete globalThis.__auditEnv;delete globalThis.__auditUser;});
const time='2026-10-07T03:00:00.000Z';let sequence=0;
function user(id,publicConsent=true){const email=id==='admin'?'alimentosparcelalosmorochos@gmail.com':id+'@example.test';globalThis.__auditUser={id,email,displayName:id,fullName:id};sqlite.prepare('insert or ignore into users(id,email,phone_e164,created_at,updated_at) values(?,?,?,?,?)').run(id,email,'+584121234567',time,time);sqlite.prepare('insert or replace into user_consents(id,user_id,policy_version,essential_accepted,public_content_accepted,security_signals_accepted,accepted_at) values(?,?,?,?,?,?,?)').run('consent-'+id,id,'2026-10-04.v3',1,publicConsent?1:0,0,time);}
function request(path,method='GET',body,owner=globalThis.__auditUser?.id??'device-local'){const req=new Request('https://audit.test'+path,{method,headers:{origin:'https://audit.test','content-type':'application/json','x-local-owner':owner},...(body?{body:JSON.stringify(body)}:{})});Object.defineProperty(req,'nextUrl',{value:new URL(req.url)});req.cookies={get(){return undefined;}};return req;}
function op(entityType,entityId,payload={},action='upsert',baseRevision=null){return {id:'audit_op_'+(++sequence),entityType,entityId,payload,action,baseRevision,clientUpdatedAt:time};}
async function send(operation){const response=await sync.POST(request('/api/sync','POST',{operations:Array.isArray(operation)?operation:[operation]}));return {status:response.status,...await response.json()};}
const farm={name:'Finca de prueba',location:'Zona de ensayo',areaSqM:10000,objective:'Prueba'};
const listing={sellerName:'Productor de prueba',title:'Oferta de prueba',description:'Descripción completa de un producto de prueba.',category:'Bovinos',location:'Apure, Venezuela',state:'Apure',shortIntro:'Ejemplo de prueba para el mercado',photoContext:'Imagen de prueba',currency:'USD'};
let farmRevision;
test('private farm creates, conflicts preserve newer data, and last-operation replay survives receipt interruption',async()=>{
 user('owner-a');const create=op('farm','farm_a',farm);let result=await send(create);assert.deepEqual(result.accepted,[create.id]);farmRevision=result.revisions[create.id];assert.ok(farmRevision);
 const edit=op('farm','farm_a',{...farm,name:'Nueva versión'},'upsert',farmRevision);result=await send(edit);const newer=result.revisions[edit.id];assert.ok(newer&&newer!==farmRevision);
 const stale=await send(op('farm','farm_a',{...farm,name:'Vieja versión'},'upsert',farmRevision));assert.equal(stale.rejected[0].reason,'version_conflict');assert.equal(sqlite.prepare('select name from farms where id=?').get('farm_a').name,'Nueva versión');
 sqlite.prepare("update sync_receipts set receipt_status='pending' where id=?").run(edit.id);const replay=await send(edit);assert.deepEqual(replay.accepted,[edit.id]);assert.equal(replay.revisions[edit.id],newer);farmRevision=newer;
});
test('tombstones block stale resurrection and bootstrap returns deletion evidence',async()=>{
 user('owner-a');const deletion=op('farm','farm_a',{},'delete',farmRevision);const result=await send(deletion);assert.deepEqual(result.accepted,[deletion.id]);const stale=await send(op('farm','farm_a',farm,'upsert',farmRevision));assert.equal(stale.rejected[0].reason,'version_conflict');
 const body=await (await bootstrap.GET()).json();assert.equal(body.farms.find(row=>row.id==='farm_a').deleted,true);
 const record=await send(op('farm-record','orphan_record',{farmId:'farm_a',recordType:'animal',category:'Bovino',title:'Animal',data:{}}));assert.equal(record.rejected[0].reason,'farm_not_found');
});
test('concurrent cross-owner creation cannot transfer ownership and receipt collisions mutate nothing',async()=>{
 const {revisionWrite}=await vite.ssrLoadModule('/lib/revision-write.ts');const {farms}=await vite.ssrLoadModule('/db/schema.ts');
 user('owner-a');user('owner-b');const values={...farm,boundaryShape:'Irregular / polígono',boundaryJson:'{}',clientUpdatedAt:time,serverUpdatedAt:time,deleted:false};
 const results=await Promise.allSettled([revisionWrite(farms,op('farm','race_farm',farm),'owner-a',values,values),revisionWrite(farms,op('farm','race_farm',farm),'owner-b',values,values)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 user('owner-a');const first=op('farm','receipt_farm',farm);assert.ok((await send(first)).accepted.includes(first.id));user('owner-b');const collision=await send({...first,entityId:'unwritten_farm'});assert.equal(collision.rejected[0].reason,'operation_id_reused');assert.equal(sqlite.prepare('select count(*) n from farms where id=?').get('unwritten_farm').n,0);
});
test('image namespaces are independent and unapproved/withdrawn media is not public',async()=>{
 const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jCrkAAAAASUVORK5CYII=';
 user('owner-a');const l=op('listing','shared_image_id',{...listing,imageDataUrl:image});const lr=await send(l);assert.ok(lr.accepted.includes(l.id));
 user('owner-b');const p=op('professional','shared_image_id',{name:'Persona de prueba',profession:'Veterinaria',specialties:'Bovinos',state:'Apure',serviceMode:'Presencial',introduction:'Profesional ficticio para comprobar el sistema.',contact:'+584121234567',profileDetails:{imageDataUrl:image}});const pr=await send(p);assert.ok(pr.accepted.includes(p.id));
 const keys=[...objects.keys()];assert.equal(keys.length,2);assert.notEqual(keys[0],keys[1]);assert.ok(keys.some(k=>k.includes('/listing/')));assert.ok(keys.some(k=>k.includes('/professional/')));
 const listingKey=keys.find(k=>k.includes('/listing/'));globalThis.__auditUser=null;assert.equal((await media.GET(request('/api/media/x'),{params:Promise.resolve({key:listingKey.split('/')})})).status,404);
 sqlite.prepare("update marketplace_listings set status='active' where id=?").run('shared_image_id');assert.equal((await media.GET(request('/api/media/x'),{params:Promise.resolve({key:listingKey.split('/')})})).status,200);
 sqlite.prepare("update marketplace_listings set deleted=1 where id=?").run('shared_image_id');assert.equal((await media.GET(request('/api/media/x'),{params:Promise.resolve({key:listingKey.split('/')})})).status,404);
});
test('older public consent cannot override current refusal',async()=>{
 user('consent-owner',false);sqlite.prepare('insert into user_consents(id,user_id,policy_version,essential_accepted,public_content_accepted,accepted_at) values(?,?,?,?,?,?)').run('old-consent','consent-owner','2026-01-01',1,1,time);
 const result=await send(op('listing','refused_listing',listing));assert.equal(result.rejected[0].reason,'public_content_consent_required');
});
test('business quote survives submission to administrative view with every requested detail',async()=>{
 globalThis.__auditUser=null;const order=op('order','quote_a',{customerName:'Cliente de prueba',phone:'+584121234567',channel:'business',business:{companyName:'Restaurante de prueba',deliveryLocation:'Apure',frequency:'Semanal'},items:[{id:'pollos',name:'Pollo',quantity:2,measure:'kg',presentation:'Alitas',preparation:'Sin piel',specifications:'Bolsas de 1 kg'}],note:'Llamar antes de entregar'});const result=await send(order);assert.ok(result.accepted.includes(order.id));
 user('admin');const response=await admin.GET();const body=await response.json();const quote=body.orders.find(row=>row.id==='quote_a');assert.equal(quote.items[0].presentation,'Alitas');assert.equal(quote.items[0].quantity,2);assert.equal(quote.business.companyName,'Restaurante de prueba');assert.equal(quote.note,'Llamar antes de entregar');
});
test('moderation rejects withdrawn content and stale reviewed revisions',async()=>{
 user('owner-a');const p=op('public-farm','public_farm_a',{name:'Finca de prueba',responsibleName:'Responsable de prueba',phone:'+584121234567',state:'Apure',description:'Descripción de prueba para el directorio público.',rubrics:'Cacao y bovinos',purposes:['Producción'],actingUserId:'owner-a'});const result=await send(p);assert.ok(result.accepted.includes(p.id));const revision=result.revisions[p.id];
 const withdrawn=await send(op('public-farm','public_farm_a',{},'delete',revision));assert.equal(withdrawn.accepted.length,1);user('admin');const response=await admin.PATCH(request('/api/admin','PATCH',{entityType:'public-farm',id:'public_farm_a',status:'active',expectedVersion:revision}));assert.equal(response.status,409);assert.equal(sqlite.prepare('select status from public_farm_profiles where id=?').get('public_farm_a').status,'deleted');
});
test('JSON-LD safely contains hostile closing tags without executing markup',()=>{const encoded=serializeJsonLd({name:'</script><img src=x onerror=alert(1)>'});assert.ok(!encoded.includes('<'));assert.equal(JSON.parse(encoded).name,'</script><img src=x onerror=alert(1)>');});

test('only the two expressly approved server identities have administrative access',async()=>{
 for(const email of ['alimentosparcelalosmorochos@gmail.com','alvarojuniorcarrerovasquez@gmail.com']){globalThis.__auditUser={id:'verified-admin',email,displayName:'Authorized',fullName:null};assert.equal(isAdminIdentity(globalThis.__auditUser),true);assert.equal((await admin.GET()).status,200);}
 for(const identity of [null,{id:'ordinary-user',email:'outsider@example.test',displayName:'Other',fullName:null}]){globalThis.__auditUser=identity;assert.equal((await admin.GET()).status,403);}
 assert.equal(isAdminIdentity({id:'',email:'alvarojuniorcarrerovasquez@gmail.com'}),false);
});
test('professional photo-free details and current immutable media paths survive bootstrap/validation',async()=>{
 user('profile-details');const operation=op('professional','profile_details',{name:'Empresa de prueba',profession:'Servicios agrícolas',specialties:'Riego',state:'Apure',serviceMode:'Presencial',introduction:'Empresa ficticia para comprobar la edición del perfil.',contact:'+584121234567',credentialNote:'Declaración de prueba',profileDetails:{profileType:'Empresa',corporateName:'Empresa de prueba',services:'Riego y mantenimiento',email:'test@example.test'}});
 assert.ok((await send(operation)).accepted.includes(operation.id));const data=await (await bootstrap.GET()).json();const profile=data.entities.find(row=>row.id==='profile_details');assert.equal(profile.payload.credentialNote,'Declaración de prueba');assert.equal(profile.payload.profileDetails.services,'Riego y mantenimiento');assert.equal(profile.payload.profileDetails.imageKey,undefined);
});
test('idea feedback is durably acknowledged once and visible to the approved administrator',async()=>{
 globalThis.__auditUser=null;const idea=op('feedback','idea_a',{area:'Otro',role:'Visitante de Venezuela Agro',message:'Esta es una idea sintética para comprobar el almacenamiento.',contact:''});const first=await send(idea),retry=await send(idea);assert.ok(first.accepted.includes(idea.id));assert.ok(retry.accepted.includes(idea.id));assert.equal(sqlite.prepare('select count(*) n from feedback_submissions where id=?').get('idea_a').n,1);
 globalThis.__auditUser={id:'personal-admin',email:'alvarojuniorcarrerovasquez@gmail.com',displayName:'Admin',fullName:null};const data=await (await admin.GET()).json();assert.ok(data.feedback.some(row=>row.id==='idea_a'));
});

test('private geometry roundtrips and older clients preserve additive fields until explicitly cleared',async()=>{
 user('geometry-owner');
 const propertySketch={version:1,coordinateSpace:'normalized-100',vertices:[{id:'a',x:0,y:0},{id:'b',x:100,y:0},{id:'c',x:70,y:80},{id:'d',x:0,y:100}]};
 const geographicReference={version:1,source:'regven-utm19n-point',easting:500000,northing:900000};
 const create=op('farm','geometry_farm',{...farm,propertySketch,geographicReference});
 let result=await send(create);assert.deepEqual(result.accepted,[create.id]);
 const revision=result.revisions[create.id];
 let body=await (await bootstrap.GET()).json();
 let saved=body.farms.find(row=>row.id==='geometry_farm');
 assert.deepEqual(saved.propertySketch,propertySketch);assert.deepEqual(saved.geographicReference,geographicReference);
 const oldClient=op('farm','geometry_farm',{...farm,name:'Older prepared client'},'upsert',revision);
 result=await send(oldClient);assert.deepEqual(result.accepted,[oldClient.id]);
 let boundary=JSON.parse(sqlite.prepare('select boundary_json from farms where id=?').get('geometry_farm').boundary_json);
 assert.deepEqual(boundary.propertySketch,propertySketch);assert.deepEqual(boundary.geographicReference,geographicReference);
 const stale=await send(op('farm','geometry_farm',{...farm,propertySketch:null,geographicReference:null},'upsert',revision));
 assert.equal(stale.rejected[0].reason,'version_conflict');
 const clear=op('farm','geometry_farm',{...farm,propertySketch:null,geographicReference:null},'upsert',result.revisions[oldClient.id]);
 result=await send(clear);assert.deepEqual(result.accepted,[clear.id]);
 boundary=JSON.parse(sqlite.prepare('select boundary_json from farms where id=?').get('geometry_farm').boundary_json);
 assert.equal(boundary.propertySketch,null);assert.equal(boundary.geographicReference,null);
 user('geometry-other');body=await (await bootstrap.GET()).json();assert.equal(body.farms.some(row=>row.id==='geometry_farm'),false);
});

test('publication requires a stored available photograph and keeps incomplete drafts unchanged',async()=>{
 user('photo-owner');const draft=op('listing','photo_required_draft',listing);let result=await send(draft);assert.ok(result.accepted.includes(draft.id));let revision=result.revisions[draft.id];user('admin');
 let response=await admin.PATCH(request('/api/admin','PATCH',{entityType:'listing',id:'photo_required_draft',status:'active',expectedVersion:revision}));assert.equal(response.status,422);assert.equal((await response.json()).error,'listing_photo_required');assert.equal(sqlite.prepare('select status from marketplace_listings where id=?').get('photo_required_draft').status,'pending');
 sqlite.prepare("update marketplace_listings set status='active' where id=?").run('photo_required_draft');assert.ok(!(await (await market.GET(request('/api/marketplace'))).json()).listings.some(row=>row.id==='photo_required_draft'));sqlite.prepare("update marketplace_listings set status='pending' where id=?").run('photo_required_draft');
 const key='marketplace/listing/photo-owner/photo_required_draft/verified/cover.webp';sqlite.prepare('update marketplace_listings set image_key=? where id=?').run(key,'photo_required_draft');
 response=await admin.PATCH(request('/api/admin','PATCH',{entityType:'listing',id:'photo_required_draft',status:'active',expectedVersion:revision}));assert.equal(response.status,422);assert.equal((await response.json()).error,'listing_photo_unavailable');
 objects.set(key,{bytes:readFileSync(root+'public/photos/vacas-llano.webp')});response=await admin.PATCH(request('/api/admin','PATCH',{entityType:'listing',id:'photo_required_draft',status:'active',expectedVersion:revision}));assert.equal(response.status,200);assert.equal(sqlite.prepare('select status from marketplace_listings where id=?').get('photo_required_draft').status,'active');
 response=await admin.PATCH(request('/api/admin','PATCH',{entityType:'listing',id:'photo_required_draft',status:'active',expectedVersion:revision}));assert.equal(response.status,409);
});
test('area references enforce owner and farm boundaries, preserve legacy omission and allow explicit unlink',async()=>{
 user('area-link-owner');let r=await send(op('farm','link_farm',farm));assert.equal(r.accepted.length,1);await send(op('farm','link_other_farm',farm));
 const areaPayload={farmId:'link_farm',recordType:'area',category:'Potrero',title:'Área sintética',data:{areaSqM:100}};let areaOp=op('farm-record','link_area',areaPayload);r=await send(areaOp);const areaRevision=r.revisions[areaOp.id];await send(op('farm-record','other_farm_area',{...areaPayload,farmId:'link_other_farm'}));
 const record={farmId:'link_farm',recordType:'inventory',category:'Insumo',title:'Registro sintético',data:{quantity:3,areaId:'link_area'}};let create=op('farm-record','linked_record',record);r=await send(create);assert.deepEqual(r.accepted,[create.id]);let revision=r.revisions[create.id];
 const legacy=op('farm-record','linked_record',{...record,data:{quantity:4}},'upsert',revision);r=await send(legacy);assert.equal(r.accepted.length,1);revision=r.revisions[legacy.id];assert.equal(JSON.parse(sqlite.prepare('select data_json from farm_records where id=?').get('linked_record').data_json).areaId,'link_area');
 r=await send(op('farm-record','linked_record',{...record,recordType:'area',data:{areaSqM:100}},'upsert',revision));assert.equal(r.rejected[0].reason,'area_cannot_reference_area');
 r=await send(op('farm-record','cross_farm_record',{...record,data:{areaId:'other_farm_area'}}));assert.equal(r.rejected[0].reason,'area_not_available');
 user('foreign-area-owner');await send(op('farm','foreign_link_farm',farm));await send(op('farm-record','foreign_link_area',{...areaPayload,farmId:'foreign_link_farm'}));user('area-link-owner');r=await send(op('farm-record','cross_owner_record',{...record,data:{areaId:'foreign_link_area'}}));assert.equal(r.rejected[0].reason,'area_not_available');
 await send(op('farm-record','link_area',{},'delete',areaRevision));const edit=op('farm-record','linked_record',{...record,data:{quantity:5}},'upsert',revision);r=await send(edit);assert.equal(r.accepted.length,1);revision=r.revisions[edit.id];assert.equal(JSON.parse(sqlite.prepare('select data_json from farm_records where id=?').get('linked_record').data_json).areaId,'link_area');
 const unlink=op('farm-record','linked_record',{...record,data:{quantity:5,areaId:null}},'upsert',revision);r=await send(unlink);assert.equal(r.accepted.length,1);assert.equal(JSON.parse(sqlite.prepare('select data_json from farm_records where id=?').get('linked_record').data_json).areaId,null);
});
test('animal diagram placements retain old-client omission, clear explicitly and reject new movement to removed area',async()=>{
 user('placement-owner');await send(op('farm','placement_farm',farm));const area={farmId:'placement_farm',recordType:'area',category:'Potrero',title:'Área sintética',data:{areaSqM:100}};const a=op('farm-record','placement_area',area);let result=await send(a),areaRevision=result.revisions[a.id];
 const position={version:1,source:'user-placed',coordinateSpace:'area-percent',areaId:'placement_area',x:50,y:50};const animal={farmId:'placement_farm',recordType:'animal',category:'Bovino',title:'Animal sintético',data:{areaId:'placement_area',planPlacement:position}};let operation=op('farm-record','placed_animal',animal);result=await send(operation);assert.equal(result.accepted.length,1);let revision=result.revisions[operation.id];
 operation=op('farm-record','placed_animal',{...animal,data:{notes:'Older prepared client'}},'upsert',revision);result=await send(operation);assert.equal(result.accepted.length,1);revision=result.revisions[operation.id];let stored=JSON.parse(sqlite.prepare('select data_json from farm_records where id=?').get('placed_animal').data_json);assert.deepEqual(stored.planPlacement,position);assert.equal(stored.areaId,position.areaId);
 await send(op('farm-record','placement_area',{},'delete',areaRevision));operation=op('farm-record','placed_animal',{...animal,data:{...animal.data,planPlacement:{...position,x:60}}},'upsert',revision);result=await send(operation);assert.equal(result.rejected[0].reason,'area_not_available');
 operation=op('farm-record','placed_animal',{...animal,data:{notes:'unchanged after area deletion'}},'upsert',revision);result=await send(operation);assert.equal(result.accepted.length,1);revision=result.revisions[operation.id];
 operation=op('farm-record','placed_animal',{...animal,data:{areaId:null,planPlacement:null}},'upsert',revision);result=await send(operation);assert.equal(result.accepted.length,1);stored=JSON.parse(sqlite.prepare('select data_json from farm_records where id=?').get('placed_animal').data_json);assert.equal(stored.planPlacement,null);assert.equal(stored.areaId,null);
});

test('endpoint-only publication lifecycle enforces owner boundaries, reviewed versions, public projection and private withdrawal',async()=>{
 const id='lifecycle_listing';
 const photo='data:image/webp;base64,'+readFileSync(root+'public/photos/vacas-llano.webp').toString('base64');
 const payload={...listing,imageDataUrl:photo};
 const publicListing=async()=>((await (await market.GET(request('/api/marketplace'))).json()).listings.find(row=>row.id===id));
 const imageResponse=key=>media.GET(request('/api/media/'+key),{params:Promise.resolve({key:key.split('/')})});
 const ownListing=async()=>((await (await bootstrap.GET()).json()).listings.find(row=>row.id===id));
 const review=(status,expectedVersion)=>admin.PATCH(request('/api/admin','PATCH',{entityType:'listing',id,status,expectedVersion}));

 user('lifecycle-owner-a');
 const create=op('listing',id,{...payload,status:'active',ownerId:'lifecycle-owner-b'});
 const created=await send(create);assert.deepEqual(created.accepted,[create.id]);
 const pending=await ownListing();
 assert.equal(pending.ownerId,'lifecycle-owner-a','untrusted payload cannot assign another owner');
 assert.equal(pending.status,'pending','user payload cannot self-publish');
 assert.equal(pending.revision,created.revisions[create.id]);
 const key=pending.imageKey;assert.ok(objects.has(key),'photo persisted through the actual sync path');
 let response=await imageResponse(key);assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');
 assert.equal(await publicListing(),undefined);

 user('lifecycle-owner-b');
 assert.equal(await ownListing(),undefined,'another owner bootstrap excludes private pending content');
 assert.equal((await imageResponse(key)).status,404);
 for(const action of ['upsert','delete']){
  const denied=await send(op('listing',id,action==='upsert'?{...listing,title:'Unauthorized change'}:{},action,pending.revision));
  assert.equal(denied.accepted.length,0);assert.equal(denied.rejected[0].reason,'forbidden');
 }
 assert.equal((await review('active',pending.revision)).status,403);
 assert.equal((await admin.GET()).status,403);
 globalThis.__auditUser=null;
 assert.equal(await publicListing(),undefined);assert.equal((await imageResponse(key)).status,404);

 user('admin');
 const queue=(await (await admin.GET()).json()).listings.find(row=>row.id===id);
 assert.equal(queue.status,'pending');assert.equal(queue.revision,pending.revision);
 assert.equal((await review('active',queue.revision)).status,200);
 assert.equal((await review('rejected',queue.revision)).status,409,'old review cannot overwrite a newer moderation decision');
 globalThis.__auditUser=null;
 const published=await publicListing();assert.ok(published);assert.equal(published.status,'active');assert.equal(published.imageUrl,'/api/media/'+key);
 for(const privateField of ['ownerId','revision','lastOperationId','lastOperationHash','imageDataUrl'])assert.equal(Object.hasOwn(published,privateField),false,privateField);
 response=await imageResponse(key);assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'public, no-cache, must-revalidate');
 assert.equal(response.headers.get('x-content-type-options'),'nosniff');

 user('lifecycle-owner-a');
 const approved=await ownListing();assert.notEqual(approved.revision,pending.revision);
 const stale=await send(op('listing',id,listing,'upsert',pending.revision));assert.equal(stale.rejected[0].reason,'version_conflict');
 const edit=op('listing',id,{...listing,description:'Descripción revisada que debe pasar de nuevo por moderación.'},'upsert',approved.revision);
 const edited=await send(edit);assert.deepEqual(edited.accepted,[edit.id]);
 const revised=await ownListing();assert.equal(revised.status,'pending');assert.equal(revised.imageKey,key,'photo survives a photo-free owner edit');
 globalThis.__auditUser=null;assert.equal(await publicListing(),undefined);assert.equal((await imageResponse(key)).status,404,'editing removes media from anonymous access until approval');
 user('admin');assert.equal((await review('active',approved.revision)).status,409,'a review from before the owner edit is stale');
 assert.equal((await review('active',revised.revision)).status,200);
 user('lifecycle-owner-a');const active=await ownListing();
 const remove=op('listing',id,{},'delete',active.revision);assert.deepEqual((await send(remove)).accepted,[remove.id]);
 const tombstone=await ownListing();assert.equal(tombstone.deleted,true);
 globalThis.__auditUser=null;assert.equal(await publicListing(),undefined);assert.equal((await imageResponse(key)).status,404,'withdrawal makes a formerly public image private');
 user('lifecycle-owner-b');assert.equal((await imageResponse(key)).status,404);
 user('lifecycle-owner-a');response=await imageResponse(key);assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');
 user('admin');assert.equal((await review('active',tombstone.revision)).status,409,'even the latest tombstone cannot be reapproved');
});

test('actual sync rejects mismatched or anonymous owners before writing records, receipts or media',async()=>{
 const id='preflight_identity_farm';
 user('preflight-owner-b');const operation=op('farm',id,farm);
 const receiptsBefore=sqlite.prepare('select count(*) n from sync_receipts').get().n;
 const photosBefore=objects.size;
 let response=await sync.POST(request('/api/sync','POST',{operations:[operation]},'preflight-owner-a'));
 assert.equal(response.status,409);assert.equal((await response.json()).error,'local_owner_mismatch');
 globalThis.__auditUser=null;
 response=await sync.POST(request('/api/sync','POST',{operations:[operation]},'device-local'));
 assert.equal(response.status,401);assert.equal((await response.json()).error,'authentication_required');
 assert.equal(sqlite.prepare('select count(*) n from farms where id=?').get(id).n,0);
 assert.equal(sqlite.prepare('select count(*) n from sync_receipts').get().n,receiptsBefore);
 assert.equal(objects.size,photosBefore);
});


test('market gallery and seller images persist with optional attributes and obey active owner media rules',async()=>{
 user('market-gallery-owner');
 const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jCrkAAAAASUVORK5CYII=';
 const operation=op('listing','market_gallery_listing',{...listing,contactProfile:{responsibleName:'Productor de prueba',phone:'+584121234567',farmName:'Finca sintética',whatsapp:true},imageDataUrl:image,additionalImageDataUrls:[image,image],sellerImageDataUrl:image,productDetails:{attributes:{age:'18 meses',weight:'320 kg'},publicLocation:{latitude:8,longitude:-66,precision:'approximate',label:'Zona sintética elegida'}}});
 let receipt=await send(operation);assert.deepEqual(receipt.accepted,[operation.id]);
 let row=sqlite.prepare('select * from marketplace_listings where id=?').get('market_gallery_listing');
 const envelope=JSON.parse(row.contact);assert.equal(envelope.version,2);assert.equal(envelope.productDetails.attributes.age,'18 meses');assert.equal(envelope.productDetails.attributes.color,'');assert.equal(envelope.productDetails.galleryKeys.length,2);assert.equal(envelope.productDetails.publicLocation.label,'Zona sintética elegida');
 const key=envelope.productDetails.galleryKeys[0],seller=envelope.productDetails.sellerImageKey;
 const read=key=>media.GET(request('/api/media/'+key),{params:Promise.resolve({key:key.split('/')})});
 assert.equal((await read(key)).status,200);assert.equal((await read(seller)).status,200);
 user('market-other-owner');assert.equal((await read(key)).status,404);assert.equal((await read(seller)).status,404);
 sqlite.prepare("update marketplace_listings set status='active' where id=?").run('market_gallery_listing');globalThis.__auditUser=null;assert.equal((await read(key)).status,200);
 const publicRows=await (await market.GET(request('/api/marketplace'))).json();const published=publicRows.listings.find(r=>r.id==='market_gallery_listing');assert.equal(published.ownerId,undefined);assert.equal(published.lastOperationHash,undefined);assert.ok(!JSON.stringify(published).includes('imageDataUrl'));
 user('market-gallery-owner');const retry=await send(operation);assert.deepEqual(retry.accepted,[operation.id]);assert.equal(JSON.parse(sqlite.prepare('select contact from marketplace_listings where id=?').get('market_gallery_listing').contact).productDetails.galleryKeys.length,2);
 receipt=await send(op('listing','market_gallery_listing',{...listing,title:'Versión antigua compatible'},'upsert',receipt.revisions[operation.id]));assert.equal(receipt.accepted.length,1);row=sqlite.prepare('select * from marketplace_listings where id=?').get('market_gallery_listing');assert.equal(JSON.parse(row.contact).productDetails.galleryKeys[0],key);assert.equal(JSON.parse(row.contact).productDetails.attributes.weight,'320 kg');
 sqlite.prepare("update marketplace_listings set status='active',deleted=1 where id=?").run('market_gallery_listing');globalThis.__auditUser=null;assert.equal((await read(key)).status,404);
});


test('untrusted legacy contact cannot forge gallery or seller image ownership',async()=>{
 user('media-victim');const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jCrkAAAAASUVORK5CYII=';let result=await send(op('listing','victim_listing',{...listing,imageDataUrl:image,additionalImageDataUrls:[image],sellerImageDataUrl:image}));assert.equal(result.accepted.length,1);
 const victim=sqlite.prepare('select * from marketplace_listings where id=?').get('victim_listing'),details=JSON.parse(victim.contact).productDetails;const target=details.galleryKeys[0];
 user('media-attacker');const forged=JSON.stringify({productDetails:{galleryKeys:[target]}});assert.ok(forged.length<=180);result=await send(op('listing','attacker_listing',{...listing,contact:forged,imageDataUrl:image}));assert.equal(result.accepted.length,1);const attacker=sqlite.prepare('select contact from marketplace_listings where id=?').get('attacker_listing');assert.deepEqual(JSON.parse(attacker.contact).productDetails.galleryKeys,[]);
 const read=key=>media.GET(request('/api/media/'+key),{params:Promise.resolve({key:key.split('/')})});assert.equal((await read(target)).status,404);
 // Model a preexisting poisoned record: lookup must bind the key to its real row, not the alias.
 sqlite.prepare("update marketplace_listings set contact=?,status='active' where id=?").run(forged,'attacker_listing');assert.equal((await read(target)).status,404);globalThis.__auditUser=null;assert.equal((await read(target)).status,404);
 user('media-victim');assert.equal((await read(target)).status,200);assert.equal((await read(details.sellerImageKey)).status,200);
});


test('removed listing images cannot be reauthorized by professional or farm JSON aliases',async()=>{
 user('alias-victim');const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jCrkAAAAASUVORK5CYII=';let result=await send(op('listing','alias_victim_listing',{...listing,imageDataUrl:image,additionalImageDataUrls:[image]}));assert.equal(result.accepted.length,1);const row=sqlite.prepare('select * from marketplace_listings where id=?').get('alias_victim_listing');const key=JSON.parse(row.contact).productDetails.galleryKeys[0];
 // Withdraw membership while the immutable R2 object remains, as after replacing photographs.
 sqlite.prepare('update marketplace_listings set contact=? where id=?').run(JSON.stringify({version:2,productDetails:{galleryKeys:[]}}),'alias_victim_listing');
 user('alias-attacker');result=await send(op('professional','alias_professional',{name:'Perfil sintético',profession:'Servicios',specialties:'Prueba',state:'Apure',serviceMode:'Presencial',introduction:'Perfil sintético para probar el aislamiento.',contact:'+584121234567',credentialNote:JSON.stringify({details:{imageKey:key}})}));assert.equal(result.accepted.length,1);
 const read=()=>media.GET(request('/api/media/'+key),{params:Promise.resolve({key:key.split('/')})});assert.equal((await read()).status,404);sqlite.prepare("update professionals set status='active' where id=?").run('alias_professional');globalThis.__auditUser=null;assert.equal((await read()).status,404);
});

test('raster validation rejects forged image labels before storage or a listing write',async()=>{
 user('image-validation-owner');
 const before=objects.size;
 const valid='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jCrkAAAAASUVORK5CYII=';
 const bad='data:image/png;base64,'+btoa('<html>not a raster image, do not store</html>');
 const result=await send(op('listing','invalid_raster_listing',{...listing,imageDataUrl:valid,additionalImageDataUrls:[valid,bad]}));
 assert.equal(result.accepted.length,0);assert.equal(result.rejected[0].reason,'invalid_image_dimensions');
 assert.equal(objects.size,before);assert.equal(sqlite.prepare('select count(*) n from marketplace_listings where id=?').get('invalid_raster_listing').n,0);
});

test('internal storage errors are not returned verbatim and identical operations can retry safely',async()=>{
 user('storage-error-owner');
 const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jCrkAAAAASUVORK5CYII=';
 const operation=op('listing','storage_error_listing',{...listing,imageDataUrl:image});
 const original=globalThis.__auditEnv.BUCKET.put;
 globalThis.__auditEnv.BUCKET.put=async()=>{throw new Error('INTERNAL SECRET error details');};
 try{const result=await send(operation);assert.equal(result.rejected[0].reason,'sync_failed');assert.ok(!JSON.stringify(result).includes('SECRET'));}
 finally{globalThis.__auditEnv.BUCKET.put=original;}
 assert.deepEqual((await send(operation)).accepted,[operation.id]);
});

test('admin snapshots are private and malformed legacy project lists do not break bootstrap',async()=>{
 user('legacy-list-owner');
 const project=op('project','legacy_project',{title:'Proyecto de prueba',sector:'Agrícola',state:'Apure',summary:'Un proyecto sintético con información suficiente para la prueba.',has:['Terreno'],needs:['Asesoría'],impact:'Beneficio sintético para productores.',requestedSupport:'Asesoría de prueba',contact:'+584121234567'});
 assert.deepEqual((await send(project)).accepted,[project.id]);
 sqlite.prepare('update project_proposals set has_json=?,needs_json=? where id=?').run('{broken','["Asesoría",null]','legacy_project');
 const response=await bootstrap.GET();assert.equal(response.status,200);const body=await response.json();
 const item=body.entities.find(item=>item.id==='legacy_project');assert.deepEqual(item.payload.has,[]);assert.deepEqual(item.payload.needs,['Asesoría']);
 user('admin');assert.equal((await admin.GET()).headers.get('cache-control'),'private, no-store');
});

test('invalid anonymous submissions and unsupported deletes do not persist receipt spam',async()=>{
 globalThis.__auditUser=null;
 const receipts=sqlite.prepare('select count(*) n from sync_receipts').get().n;
 const operations=Array.from({length:100},(_,index)=>op(index%2?'order':'feedback','invalid_public_'+index,{}));
 let response=await sync.POST(request('/api/sync','POST',{operations}));let result=await response.json();
 assert.equal(response.status,200);assert.equal(result.accepted.length,0);assert.equal(result.rejected.length,100);
 assert.ok(result.rejected.every(item=>item.reason==='invalid_payload'));
 assert.equal(sqlite.prepare('select count(*) n from sync_receipts').get().n,receipts);
 response=await sync.POST(request('/api/sync','POST',{operations:[op('feedback','unsupported_delete',{},'delete')]}));result=await response.json();
 assert.equal(result.rejected[0].reason,'unsupported_operation');
 assert.equal(sqlite.prepare('select count(*) n from sync_receipts').get().n,receipts);
});

test('immutable order IDs confirm identical retries and reject changed content rather than falsely accepting it',async()=>{
 globalThis.__auditUser=null;
 const payload={customerName:'Persona sintética',phone:'+584121234567',items:[{id:'pollos',name:'Pollo',quantity:2}],note:'Pedido sintético sin envío'};
 const first=op('order','immutable_order_test',payload);assert.deepEqual((await send(first)).accepted,[first.id]);
 const retry=op('order','immutable_order_test',payload);assert.deepEqual((await send(retry)).accepted,[retry.id]);
 const changed=await send(op('order','immutable_order_test',{...payload,items:[{...payload.items[0],quantity:3}]}));
 assert.equal(changed.accepted.length,0);assert.equal(changed.rejected[0].reason,'immutable_record');
 assert.equal(JSON.parse(sqlite.prepare('select items_json from order_requests where id=?').get('immutable_order_test').items_json).items[0].quantity,2);
 user('another-order-owner');assert.equal((await send(op('order','immutable_order_test',payload))).rejected[0].reason,'forbidden');
});

test('concurrent different order or feedback content cannot both receive accepted acknowledgements',async()=>{
 globalThis.__auditUser=null;
 for(const kind of ['order','feedback']){
  const base=kind==='order'?{customerName:'Persona sintética',phone:'+584121234567',items:[{id:'pollos',name:'Pollo',quantity:2}],note:'Nota original'}:{area:'Otro',role:'Prueba',message:'Mensaje original de prueba',contact:''};
  const changed=kind==='order'?{...base,note:'Nota diferente'}:{...base,message:'Otro mensaje distinto de prueba'};
  const results=await Promise.all([send(op(kind,'concurrent_'+kind,base)),send(op(kind,'concurrent_'+kind,changed))]);
  assert.equal(results.flatMap(item=>item.accepted).length,1,kind);
  assert.deepEqual(results.flatMap(item=>item.rejected).map(item=>item.reason),['immutable_record'],kind);
 }
});

test('diagnostic: valid anonymous bursts currently have no application rate limiter',async()=>{
 // Deliberate release-risk characterization, not proof that abuse is prevented.
 // This runs only against the synthetic in-memory database, never the live Site.
 globalThis.__auditUser=null;
 const before=sqlite.prepare('select count(*) n from feedback_submissions').get().n;
 let accepted=0;
 for(let batch=0;batch<3;batch++){
  const operations=Array.from({length:100},(_,index)=>op('feedback',`synthetic_burst_${batch}_${index}`,{area:'Otro',role:'Ensayo local',message:'Prueba sintética de límite de frecuencia sin comunicación real.',contact:''}));
  const response=await sync.POST(request('/api/sync','POST',{operations}));assert.equal(response.status,200);accepted+=(await response.json()).accepted.length;
 }
 assert.equal(accepted,300,'document the absent persistent frequency guard until a scoped policy is implemented');
 assert.equal(sqlite.prepare('select count(*) n from feedback_submissions').get().n-before,300);
});
