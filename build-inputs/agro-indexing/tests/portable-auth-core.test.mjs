import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,watch:null}});
after(()=>vite.close());
const google=await vite.ssrLoadModule('/lib/auth/google.ts');
const sessions=await vite.ssrLoadModule('/lib/auth/session.ts');
const store=await vite.ssrLoadModule('/lib/auth/store.ts');
const authCrypto=await vite.ssrLoadModule('/lib/auth/crypto.ts');
const config={origin:'https://app.example',clientId:'test-client',clientSecret:'local-test-only',sessionSecret:'local-test-only-secret-with-sufficient-length',allowedEmails:['test@example.com'],turnstileSiteKey:'test',turnstileSecret:'test'};
function database() {
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec('CREATE TABLE users (id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,display_name TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)');
 sqlite.exec(readFileSync(new URL('../drizzle/0009_even_blue_shield.sql',import.meta.url),'utf8'));
 function prepare(sql) {
  let values=[];
  return {bind(...args){values=args;return this},async run(){return sqlite.prepare(sql).run(...values)},async first(){return sqlite.prepare(sql).get(...values)??null}};
 }
 return {sqlite,prepare,async batch(statements){sqlite.exec('BEGIN');try {const result=await Promise.all(statements.map(x=>x.run()));sqlite.exec('COMMIT');return result}catch(error){sqlite.exec('ROLLBACK');throw error}}};
}
const cookieValue=header=>header.split(';')[0].split('=')[1];
test('login creates S256 PKCE, nonce, safe return path and host-only bound cookie',async()=>{
 const db=database();
 const result=await google.startGoogleLogin(db,config,'//evil.example');
 const url=new URL(result.authorizationUrl);
 assert.equal(url.origin,'https://accounts.google.com');assert.equal(url.searchParams.get('code_challenge_method'),'S256');
 assert.ok(url.searchParams.get('nonce'));assert.equal(url.searchParams.get('redirect_uri'),'https://app.example/api/auth/google/callback');
 assert.match(result.transactionCookie,/^__Host-va_oauth=.*; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=600$/);
 const row=db.sqlite.prepare('SELECT * FROM auth_transactions').get();assert.equal(row.return_to,'/');assert.notEqual(row.state_hash,url.searchParams.get('state'));assert.notEqual(row.browser_hash,cookieValue(result.transactionCookie));
 for(const path of ['https://evil.example','//evil.example','/\\evil.example','/api/auth/logout','/\n/evil.example'])assert.equal(google.safeReturnTo(path),'/');
 assert.equal(google.safeReturnTo('/farms?q=1#view'),'/farms?q=1#view');
 db.sqlite.close();
});
test('transaction consumption is browser-bound, expiry checked, and exactly once',async()=>{
 const db=database();await store.saveTransaction(db,{state_hash:'state',browser_hash:'browser',nonce:'nonce',verifier:'verifier',return_to:'/',expires_at:200});
 assert.equal(await store.takeTransaction(db,'state','wrong',100),null);
 const results=await Promise.all([store.takeTransaction(db,'state','browser',100),store.takeTransaction(db,'state','browser',100)]);assert.equal(results.filter(Boolean).length,1);
 await store.saveTransaction(db,{state_hash:'expired',browser_hash:'browser',nonce:'nonce',verifier:'verifier',return_to:'/',expires_at:100});
 assert.equal(await store.takeTransaction(db,'expired','browser',100),null);db.sqlite.close();
});
test('new identities use UUIDs, never email-link existing accounts, preserve old data',async()=>{
 const db=database();db.sqlite.exec("INSERT INTO users VALUES ('legacy-owner','Test@Example.com','Legacy','old','old')");
 await assert.rejects(store.findOrCreateGoogleUser(db,'subject','test@example.com','Test'),{code:'account_link_required'});
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS count FROM auth_identities').get().count,0);
 assert.equal(db.sqlite.prepare('SELECT id FROM users').get().id,'legacy-owner');
 const user=await store.findOrCreateGoogleUser(db,'new-subject','different@example.com','Other');assert.match(user.id,/^[0-9a-f-]{36}$/);
 await assert.rejects(store.findOrCreateGoogleUser(db,'new-subject','changed@example.com','Other'),{code:'identity_email_changed'});db.sqlite.close();
});
test('opaque sessions store only keyed hashes, expire, honor allowlist, and revoke',async()=>{
 const db=database();const user=await store.findOrCreateGoogleUser(db,'subject','test@example.com','Test');
 const session=await sessions.createSession(db,config,user.id);assert.match(session.sessionCookie,/^__Host-va_session=.*Secure; HttpOnly; SameSite=Lax/);
 assert.notEqual(db.sqlite.prepare('SELECT token_hash FROM auth_sessions').get().token_hash,session.sessionToken);
 assert.deepEqual(await sessions.getSession(db,config,session.sessionToken),user);
 assert.equal(await sessions.getSession(db,{...config,allowedEmails:[]},session.sessionToken),null);
 assert.equal(await sessions.getSession(db,config,'bad'),null);
 assert.equal(await sessions.getSession(db,{...config,sessionSecret:'rotated'},session.sessionToken),null);
 await sessions.revokeSession(db,config,session.sessionToken);assert.equal(await sessions.getSession(db,config,session.sessionToken),null);
 const idle=await sessions.createSession(db,config,user.id);db.sqlite.exec(`UPDATE auth_sessions SET last_seen_at=${Date.now()-sessions.SESSION_IDLE_TIMEOUT*1000-1}`);assert.equal(await sessions.getSession(db,config,idle.sessionToken),null);
 const second=await sessions.createSession(db,config,user.id);db.sqlite.exec('UPDATE auth_sessions SET expires_at=0');assert.equal(await sessions.getSession(db,config,second.sessionToken),null);db.sqlite.close();
});
const keys=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk={...await crypto.subtle.exportKey('jwk',keys.publicKey),kid:'test-key',alg:'RS256',use:'sig'};
const base64=value=>Buffer.from(typeof value==='string'?value:JSON.stringify(value)).toString('base64url');
async function callbackFixture(overrides={},badSignature=false){
 const db=database();const start=await google.startGoogleLogin(db,config,'/farms');const authorize=new URL(start.authorizationUrl);
 const claims={iss:'https://accounts.google.com',aud:config.clientId,sub:'google-subject',exp:Math.floor(Date.now()/1000)+300,iat:Math.floor(Date.now()/1000),nonce:authorize.searchParams.get('nonce'),email:'test@example.com',email_verified:true,name:'Test',...overrides};
 const input=`${base64({alg:'RS256',kid:'test-key'})}.${base64(claims)}`;
 const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',keys.privateKey,new TextEncoder().encode(input));
 const idToken=`${input}.${badSignature?Buffer.alloc(256).toString('base64url'):Buffer.from(signature).toString('base64url')}`;
 const previous=globalThis.fetch;
 globalThis.fetch=async(url,options)=>{
  if(String(url)==='https://oauth2.googleapis.com/token'){
   const body=new URLSearchParams(options.body);assert.equal(body.get('grant_type'),'authorization_code');assert.equal(body.get('code_verifier'),db.lastVerifier);
   return Response.json({access_token:'test-access-token',token_type:'Bearer',expires_in:300,id_token:idToken});
  }
  assert.equal(String(url),'https://www.googleapis.com/oauth2/v3/certs');return Response.json({keys:[jwk]});
 };
 const transaction=db.sqlite.prepare('SELECT * FROM auth_transactions').get();
 db.lastVerifier=await authCrypto.decryptVerifier(config.sessionSecret,transaction.state_hash,transaction.verifier);
 assert.notEqual(db.lastVerifier,transaction.verifier);
 const url=new URL(`${config.origin}${google.GOOGLE_CALLBACK_PATH}?code=test-code&state=${authorize.searchParams.get('state')}`);
 return {db,url,cookie:cookieValue(start.transactionCookie),restore(){globalThis.fetch=previous;db.sqlite.close()}};
}
test('real signed callback validates, creates session, and rejects replay',async()=>{
 const f=await callbackFixture();try{
  const result=await google.consumeGoogleCallback(f.db,config,f.url,f.cookie);assert.equal(result.user.email,'test@example.com');assert.equal(result.returnTo,'/farms');
  assert.equal((await sessions.getSession(f.db,config,result.sessionToken)).id,result.user.id);
  await assert.rejects(google.consumeGoogleCallback(f.db,config,f.url,f.cookie),{code:'expired_or_used_transaction'});
 }finally{f.restore()}
});
test('callback rejects invalid signature, nonce, issuer, audience, expiry, unverified email and disallowed account',async()=>{
 const cases=[[{},true],[{nonce:'wrong'},false],[{iss:'https://evil.example'},false],[{aud:'wrong'},false],[{azp:'other-client'},false],[{aud:[config.clientId,'other'],azp:'other-client'},false],[{aud:[config.clientId,'other']},false],[{exp:1},false],[{iat:Math.floor(Date.now()/1000)+120},false],[{email_verified:false},false],[{email:'other@example.com'},false]];
 for(const [claims,badSignature] of cases){const f=await callbackFixture(claims,badSignature);try{
  await assert.rejects(google.consumeGoogleCallback(f.db,config,f.url,f.cookie));assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM auth_sessions').get().n,0);assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM users').get().n,0);
 }finally{f.restore()}}
});

test('encrypted PKCE verifier is confidential and bound to secret plus transaction',async()=>{
 const sealed=await authCrypto.encryptVerifier(config.sessionSecret,'state-one','private-verifier');
 assert.equal(await authCrypto.decryptVerifier(config.sessionSecret,'state-one',sealed),'private-verifier');
 await assert.rejects(authCrypto.decryptVerifier(config.sessionSecret,'state-two',sealed));
 await assert.rejects(authCrypto.decryptVerifier('wrong-secret','state-one',sealed));
});

test('callback accepts matching authorized party with single and multiple audiences',async()=>{
 for(const aud of [config.clientId,[config.clientId,'other']]){const f=await callbackFixture({aud,azp:config.clientId});try{const result=await google.consumeGoogleCallback(f.db,config,f.url,f.cookie);assert.ok(result.user.id);}finally{f.restore();}}
});

test('production accepts verified ordinary Google accounts but only a configured email/subject pair grants owner admin',async()=>{
 const production={...config,accessPolicy:'public-production',allowedEmails:[],ownerAdmin:{email:'owner@example.com',subject:'owner-subject'}};
 const db=database();
 const owner=await store.findOrCreateGoogleUser(db,'owner-subject','owner@example.com','Owner');
 const ordinary=await store.findOrCreateGoogleUser(db,'ordinary-subject','ordinary@example.com','Ordinary');
 const ownerSession=await sessions.createSession(db,production,owner.id);
 const ordinarySession=await sessions.createSession(db,production,ordinary.id);
 assert.equal((await sessions.getSession(db,production,ownerSession.sessionToken)).googleOwnerAdmin,true);
 assert.equal((await sessions.getSession(db,production,ordinarySession.sessionToken)).googleOwnerAdmin,undefined);
 for(const changed of [{ownerAdmin:undefined},{ownerAdmin:{email:'owner@example.com',subject:'wrong-subject'}},{ownerAdmin:{email:'wrong@example.com',subject:'owner-subject'}},{accessPolicy:'private-staging',allowedEmails:['owner@example.com']}])assert.equal((await sessions.getSession(db,{...production,...changed},ownerSession.sessionToken)).googleOwnerAdmin,undefined);
 assert.equal(await sessions.getSession(db,production,owner.id),null,'internal id cannot impersonate an opaque session');
 assert.equal(await sessions.getSession(db,production,'owner@example.com'),null,'email cannot impersonate a session');
 db.sqlite.exec('UPDATE auth_sessions SET expires_at=0');assert.equal(await sessions.getSession(db,production,ownerSession.sessionToken),null);db.sqlite.close();
});
test('public login never relaxes Google signature or verified-email checks and cannot claim owner through profile name',async()=>{
 const production={...config,accessPolicy:'public-production',allowedEmails:[],ownerAdmin:{email:'owner@example.com',subject:'owner-subject'}};
 for(const [claims,badSignature] of [[{email_verified:false},false],[{email:'owner@example.com',sub:'owner-subject'},true]]){
  const f=await callbackFixture(claims,badSignature);try{await assert.rejects(google.consumeGoogleCallback(f.db,production,f.url,f.cookie));assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM auth_sessions').get().n,0);}finally{f.restore()}
 }
 const f=await callbackFixture({email:'ordinary@example.com',name:'owner@example.com'});try{
  const result=await google.consumeGoogleCallback(f.db,production,f.url,f.cookie);
  assert.equal(result.user.email,'ordinary@example.com');assert.equal((await sessions.getSession(f.db,production,result.sessionToken)).googleOwnerAdmin,undefined);
 }finally{f.restore()}
});
