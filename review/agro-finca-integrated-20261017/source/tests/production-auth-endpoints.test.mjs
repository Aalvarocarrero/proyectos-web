import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const sqlite=new DatabaseSync(':memory:');
for(const file of readdirSync(root+'drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync(root+'drizzle/'+file,'utf8'));
const DB={prepare(query){const bind=(values=[])=>({bind(...args){return bind(args);},async run(){return {success:true,meta:sqlite.prepare(query).run(...values)};},async first(){return sqlite.prepare(query).get(...values)??null;},async all(){return {results:sqlite.prepare(query).all(...values)};},async raw(){const statement=sqlite.prepare(query);statement.setReturnArrays(true);return statement.all(...values);}});return bind();},async batch(statements){sqlite.exec('BEGIN');try{const result=await Promise.all(statements.map(x=>x.run()));sqlite.exec('COMMIT');return result;}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
globalThis.__productionEnv={DB};
let token=null;
const vite=await createServer({define:{__AUTH_DEPLOYMENT_TARGET__:JSON.stringify('standalone')},appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},plugins:[{name:'production-test-env',enforce:'pre',resolveId(id){if(id==='cloudflare:workers')return '\0production-env';if(id.endsWith('/app/chatgpt-auth')||id.endsWith('/app/chatgpt-auth.ts'))return '\0production-auth';},load(id){if(id==='\0production-env')return 'export const env=globalThis.__productionEnv';if(id==='\0production-auth')return 'export async function getChatGPTUser(){return globalThis.__productionGetUser();}';}}],server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(async()=>{await vite.close();sqlite.close();delete globalThis.__productionEnv;delete globalThis.__productionGetUser;});
const {parseAuthConfig}=await vite.ssrLoadModule('/lib/auth/config.ts');
const config=parseAuthConfig({AUTH_MODE:'google',AUTH_ACCESS_POLICY:'public-production',APP_ORIGIN:'https://venezuelaagro.com',GOOGLE_CLIENT_ID:'synthetic-client',GOOGLE_CLIENT_SECRET:'synthetic-secret',AUTH_SESSION_SECRET:'s'.repeat(64),TURNSTILE_SITE_KEY:'synthetic-key',TURNSTILE_SECRET_KEY:'synthetic-secret',OWNER_ADMIN_EMAIL:'owner@example.test',OWNER_GOOGLE_SUBJECT:'owner-subject'});
const {getSession,createSession}=await vite.ssrLoadModule('/lib/auth/session.ts');
const {findOrCreateGoogleUser}=await vite.ssrLoadModule('/lib/auth/store.ts');
globalThis.__productionGetUser=()=>getSession(DB,config,token);
const admin=await vite.ssrLoadModule('/app/api/admin/route.ts');
const cms=await vite.ssrLoadModule('/app/api/admin/home-content/route.ts');
const bootstrap=await vite.ssrLoadModule('/app/api/bootstrap/route.ts');
const sync=await vite.ssrLoadModule('/app/api/sync/route.ts');
const {HOME_DEFAULTS}=await vite.ssrLoadModule('/lib/home-content.ts');
const owner=await findOrCreateGoogleUser(DB,'owner-subject','owner@example.test','Owner');
const ordinary=await findOrCreateGoogleUser(DB,'ordinary-subject','ordinary@example.test','Ordinary');
const other=await findOrCreateGoogleUser(DB,'other-subject','other@example.test','Other');
const sessions=new Map();for(const user of [owner,ordinary,other])sessions.set(user.id,(await createSession(DB,config,user.id)).sessionToken);
const time=new Date().toISOString();let seq=0;
for(const user of [owner,ordinary,other]){sqlite.prepare('UPDATE users SET phone_e164=? WHERE id=?').run('+584121234567',user.id);sqlite.prepare('INSERT INTO user_consents(id,user_id,policy_version,essential_accepted,public_content_accepted,security_signals_accepted,accepted_at) VALUES(?,?,?,?,?,?,?)').run('consent-'+user.id,user.id,'2026-10-04.v3',1,1,0,time);}
function request(path,method='GET',body,actingId=ordinary.id){const req=new Request(config.origin+path,{method,headers:{origin:config.origin,'content-type':'application/json','x-local-owner':actingId,'oai-authenticated-user-id':owner.id,'oai-authenticated-user-email':owner.email},...(body?{body:JSON.stringify(body)}:{})});Object.defineProperty(req,'nextUrl',{value:new URL(req.url)});req.cookies={get(){return undefined;}};return req;}
function operation(id,payload,revision=null){return {id:'prod-op-'+(++seq),entityType:'farm',entityId:id,payload,action:'upsert',baseRevision:revision,clientUpdatedAt:time};}
const farm={name:'Private farm',location:'Zona de ensayo',areaSqM:10000,objective:'Prueba'};
let revision;
test('anonymous and ordinary Google sessions cannot access administration despite owner headers',async()=>{
 for(const session of [null,sessions.get(ordinary.id),sessions.get(other.id)]){
  token=session;assert.equal((await admin.GET()).status,403);assert.equal((await cms.GET()).status,403);
  assert.equal((await cms.POST(request('/api/admin/home-content','POST',{action:'save',expectedRevision:null,content:HOME_DEFAULTS}))).status,403);
 }
 token=null;assert.equal((await bootstrap.GET()).status,401);
 const write=await sync.POST(request('/api/sync','POST',{operations:[operation('anonymous-farm',farm)]},'device-local'));assert.equal(write.status,401);
 assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM farms').get().n,0);
});
test('ordinary session writes and reads only its owned farm and cannot switch ownership through headers',async()=>{
 token=sessions.get(ordinary.id);let response=await sync.POST(request('/api/sync','POST',{operations:[operation('private-farm',farm)]}));let body=await response.json();assert.equal(body.accepted.length,1,JSON.stringify(body));revision=Object.values(body.revisions)[0];
 assert.equal((await (await bootstrap.GET()).json()).farms[0].ownerId,ordinary.id);
 token=sessions.get(other.id);assert.equal((await (await bootstrap.GET()).json()).farms.length,0);
 response=await sync.POST(request('/api/sync','POST',{operations:[operation('private-farm',{...farm,name:'Stolen'},revision)]},ordinary.id));assert.equal(response.status,409);
 response=await sync.POST(request('/api/sync','POST',{operations:[operation('private-farm',{...farm,name:'Stolen'},revision)]},other.id));body=await response.json();assert.equal(body.accepted.length,0);
 assert.equal(sqlite.prepare('SELECT owner_id,name FROM farms WHERE id=?').get('private-farm').owner_id,ordinary.id);
});
test('configured owner has functional CMS save/publish but private farm ownership is unchanged',async()=>{
 token=sessions.get(owner.id);assert.equal((await admin.GET()).status,200);assert.equal((await cms.GET()).status,200);
 const save=await cms.POST(request('/api/admin/home-content','POST',{action:'save',expectedRevision:null,content:HOME_DEFAULTS},owner.id));assert.equal(save.status,200);const {revision}=await save.json();
 const publish=await cms.POST(request('/api/admin/home-content','POST',{action:'publish',expectedRevision:revision},owner.id));assert.equal(publish.status,200);
 assert.ok(sqlite.prepare('SELECT published_json FROM website_content WHERE id=?').get('home').published_json);
 assert.equal((await (await bootstrap.GET()).json()).farms.length,0);
 sqlite.exec('UPDATE auth_sessions SET expires_at=0');assert.equal((await admin.GET()).status,403);assert.equal((await bootstrap.GET()).status,401);
});
