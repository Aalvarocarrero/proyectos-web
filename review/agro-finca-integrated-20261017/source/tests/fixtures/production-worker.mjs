// Local Worker invocation only. These values are synthetic, never real credentials.
import {after} from 'node:test';
import {registerHooks} from 'node:module';
export const productionOrigin='https://venezuelaagro.com';
export function productionEnv(){return {
 APP_ORIGIN:productionOrigin,AUTH_MODE:'google',AUTH_ACCESS_POLICY:'public-production',
 GOOGLE_CLIENT_ID:'synthetic-test-client',GOOGLE_CLIENT_SECRET:'synthetic-test-secret',
 AUTH_SESSION_SECRET:'synthetic-local-test-only-'.repeat(4),TURNSTILE_SITE_KEY:'synthetic-test-key',TURNSTILE_SECRET_KEY:'synthetic-test-secret',
 OWNER_ADMIN_EMAIL:'owner@example.test',OWNER_GOOGLE_SUBJECT:'synthetic-test-owner',
 ASSETS:{fetch:async()=>new Response('missing',{status:404})},
};}
// Node lacks the Workers runtime module used by server-side session readers.
// Supply the same synthetic configuration; keep all auth validation active.
const bindings=productionEnv();delete bindings.ASSETS;
const workerModule='data:text/javascript,'+encodeURIComponent('export const env='+JSON.stringify(bindings)+';');
const hooks=registerHooks({resolve(specifier,context,nextResolve){
 if(specifier==='cloudflare:workers')return {url:workerModule,shortCircuit:true};
 return nextResolve(specifier,context);
}});
// Fail closed if tested runtime code unexpectedly attempts any network request.
const originalFetch=globalThis.fetch;
globalThis.fetch=async()=>{throw new Error('External fetch forbidden in synthetic Worker tests');};
after(()=>{hooks.deregister();globalThis.fetch=originalFetch;});
