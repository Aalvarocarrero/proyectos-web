import { env } from 'cloudflare:workers';
import defaults from '../../../server/default-catalog.json';
import { loadState,publicCatalog } from '../../../server/catalog-service.mjs';
export const dynamic='force-dynamic';
export async function GET() {
 try {
  const state=await loadState(env,defaults);
  const data=JSON.stringify(publicCatalog(state.published)).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return new Response(`globalThis.ROHO_PUBLISHED_CATALOG=${data};`,{headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 } catch {
  return new Response('globalThis.ROHO_CATALOG_UNAVAILABLE=true;',{status:503,headers:{'Content-Type':'application/javascript','Cache-Control':'no-store'}});
 }
}
