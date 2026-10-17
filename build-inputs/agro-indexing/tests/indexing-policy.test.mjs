import assert from 'node:assert/strict';import test,{after} from 'node:test';import {createServer} from 'vite';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,watch:null}});after(()=>vite.close());
const policy=await vite.ssrLoadModule('/lib/indexing-policy.ts');
test('preview remains noindex while production taxonomy is a distinct unverified candidate',()=>{
 assert.equal(policy.PUBLIC_INDEXING_ENABLED,false);assert.deepEqual(policy.robotsPolicy(),{index:false,follow:false});assert.equal(policy.PRODUCTION_DOMAIN_CANDIDATE,'https://venezuelaagro.com');
 for(const path of ['/app','/app-local','/admin','/api/bootstrap','/marketplace/publicar','/offline'])assert.equal(policy.isPrivatePath(path),true,path);
 for(const [path] of policy.INDEXING_TAXONOMY)assert.equal(policy.isPrivatePath(path),false,path);
 assert.deepEqual(policy.indexingRobots(true,true,false),{index:true,follow:true});assert.deepEqual(policy.indexingRobots(true,true,true),{index:false,follow:false});assert.deepEqual(policy.indexingRobots(true,false,false),{index:false,follow:false});
});
test('rendered preview remains excluded under both preview and production builds',async()=>{
 const {default:worker}=await import(new URL('../dist/server/index.js',import.meta.url));
 for(const path of ['/','/tienda','/profesionales/alvaro-carrero','/app-local','/offline']){const response=await worker.fetch(new Request('https://preview.test'+path),{ASSETS:{fetch:async()=>new Response('missing',{status:404})}},{waitUntil(){},passThroughOnException(){}});if(process.env.PUBLIC_INDEXING_ENABLED==='true'){assert.ok([403,503].includes(response.status),path);assert.match(response.headers.get('x-robots-tag')||'',/noindex/);await response.body?.cancel();continue;}assert.equal(response.status,200,path);assert.match(response.headers.get('x-robots-tag')||'',/noindex/);const html=await response.text();assert.match(html,/name="robots"[^>]*noindex|content="[^"]*noindex[^>]*name="robots"/,path);}
});
