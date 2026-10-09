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
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},plugins:[{name:'audit-env',enforce:'pre',resolveId(id){if(id==='cloudflare:workers')return '\0audit-env';if(id.endsWith('/app/chatgpt-auth')||id.endsWith('/app/chatgpt-auth.ts'))return '\0audit-auth';},load(id){if(id==='\0audit-env')return 'export const env=globalThis.__auditEnv';if(id==='\0audit-auth')return 'export async function getChatGPTUser(){return globalThis.__auditUser;}';}}],server:{middlewareMode:true,hmr:false,watch:null}});
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
 const image='data:image/png;base64,iVBORw0KGgo=';
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
