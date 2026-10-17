import assert from 'node:assert/strict';
import fs from 'node:fs';
const {default:worker}=await import('../dist/server/index.js');
const env={APP_ORIGIN:'https://venezuelaagro.com',AUTH_MODE:'google',AUTH_ACCESS_POLICY:'public-production',GOOGLE_CLIENT_ID:'ci-synthetic-client',GOOGLE_CLIENT_SECRET:'ci-synthetic-secret',AUTH_SESSION_SECRET:'synthetic-ci-only-not-a-real-secret-'.repeat(3),TURNSTILE_SITE_KEY:'ci-synthetic-key',TURNSTILE_SECRET_KEY:'ci-synthetic-secret',OWNER_ADMIN_EMAIL:'owner@example.test',OWNER_GOOGLE_SUBJECT:'ci-owner',ASSETS:{fetch:async()=>new Response('missing',{status:404})}};
const ctx={waitUntil(){},passThroughOnException(){}};
const results=[];
async function request(path,origin='https://venezuelaagro.com'){const r=await worker.fetch(new Request(origin+path),env,ctx);const body=await r.text();results.push({path,origin,status:r.status,robots:r.headers.get('x-robots-tag'),bytes:body.length});return {r,body};}
try{
 for(const path of ['/','/tienda','/plataforma','/rubros','/nosotros']){
  const {r,body}=await request(path);assert.equal(r.status,200,path);assert.doesNotMatch(r.headers.get('x-robots-tag')||'',/noindex/,path);const head=body.split('</head>')[0];assert.match(head,/<meta[^>]*name="robots"[^>]*content="index,\s*follow"/,path);assert.ok(head.includes('https://venezuelaagro.com'),path+' canonical origin');
 }
 for(const path of ['/admin','/app','/api/bootstrap','/auth/signin','/finca-modelo']){const {r}=await request(path);assert.match(r.headers.get('x-robots-tag')||'',/noindex/,path);}
 const alias=await request('/','https://preview.invalid');assert.equal(alias.r.status,403);assert.match(alias.r.headers.get('x-robots-tag')||'',/noindex/);
 const {r:robots,body:robotsBody}=await request('/robots.txt');assert.equal(robots.status,200);assert.ok(robotsBody.includes('Sitemap: https://venezuelaagro.com/sitemap.xml'));
 const {r:site,body:sitemap}=await request('/sitemap.xml');assert.equal(site.status,200);assert.ok(sitemap.includes('<loc>https://venezuelaagro.com'));assert.doesNotMatch(sitemap,/<loc>[^<]*(?:\/admin|\/app|\/auth|\/finca-modelo|\/fincas|\/red|\/proyectos|\/profesionales)(?:\/|<)/);
}finally{fs.writeFileSync('.ci-output/production-http-results.json',JSON.stringify(results,null,2));}
console.log('Production build canonical HTML, headers, private-route exclusions, robots and sitemap checks passed.');
