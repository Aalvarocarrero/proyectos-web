import { env } from 'cloudflare:workers';
import defaults from '../../../server/default-catalog.json';
import { loadState,publicCatalog,contentImages } from '../../../server/catalog-service.mjs';
export const dynamic='force-dynamic';
export async function GET(request: Request) {
 const key=new URL(request.url).pathname.slice('/media/'.length);
 if(!/^[a-f0-9-]{36}\.(png|jpg|webp)$/.test(key) || !env.BUCKET)return new Response('Not found',{status:404});
 try {
  const state=await loadState(env,defaults);
  if(!contentImages(publicCatalog(state.published)).includes(`/media/${key}`))return new Response('Not found',{status:404});
  const object=await env.BUCKET.get(key);
  if(!object)return new Response('Not found',{status:404});
  return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
 } catch {return new Response('Unavailable',{status:503});}
}
