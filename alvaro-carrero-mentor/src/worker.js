const ORIGIN='https://alvaro-carrero-mentor.aalvarocarrero.chatgpt.site';
const FEEDBACK_WRITES_ENABLED=true;
const PUBLIC_FEEDBACK=false;
const MAX_BYTES=8192, HOURLY_LIMIT=60;
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
function validate(body){
 if(!body||typeof body!=='object'||Array.isArray(body))throw Error('invalid');
 const allowed=new Set(['id','language','useful','improve','support','replyRequested','name','email','website']);
 if(Object.keys(body).some(k=>!allowed.has(k)))throw Error('invalid');
 if(typeof body.id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id))throw Error('invalid');
 if(!['es','en'].includes(body.language)||typeof body.replyRequested!=='boolean')throw Error('invalid');
 const clean=(value,max)=>{if(typeof value!=='string'||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw Error('invalid');return value.trim()};
 const useful=clean(body.useful,800),improve=clean(body.improve,800),support=clean(body.support,800);
 if(!useful&&!improve&&!support)throw Error('invalid');
 if(body.website!==undefined&&body.website!=='')throw Error('invalid');
 let name=null,email=null;
 if(body.replyRequested){name=clean(body.name??'',100)||null;email=clean(body.email??'',254);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('invalid')}
 else if((body.name??'')!==''||(body.email??'')!=='')throw Error('invalid');
 return {id:body.id.toLowerCase(),language:body.language,useful,improve,support,reply_requested:body.replyRequested?1:0,name,email};
}
async function readBody(request){
 if(Number(request.headers.get('content-length'))>MAX_BYTES)throw Error('large');
 if(!request.body)throw Error('invalid');
 const reader=request.body.getReader();let size=0;const chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw Error('large')}chunks.push(value)}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return JSON.parse(new TextDecoder().decode(bytes));
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname==='/api/feedback/status'){
  if(request.method!=='GET')return json({ready:false},405);
  if(url.origin!==ORIGIN)return json({ready:false,reason:'domain_required'},503);
  if(!FEEDBACK_WRITES_ENABLED||!env.DB||env.RETENTION_JOB_READY!=='yes')return json({ready:false,reason:'setup_required'},503);
  try{await env.DB.prepare('SELECT id FROM feedback LIMIT 0').all();await env.DB.prepare('SELECT bucket FROM feedback_rate_limits LIMIT 0').all();await env.DB.prepare('SELECT ran_at FROM retention_runs LIMIT 0').all();return json({ready:true})}catch{return json({ready:false,reason:'schema_required'},503)}
 }
 if(url.pathname==='/api/feedback'){
  if(request.method!=='POST')return json({ok:false,error:'method_not_allowed'},405);
  if(!FEEDBACK_WRITES_ENABLED)return json({ok:false,error:'storage_unavailable'},503);
  // Public writes are intentional; Origin/Fetch Metadata protect browsers, not bot authentication.
  // No feedback data is ever exposed by an HTTP read route.
  if(url.origin!==ORIGIN||request.headers.get('origin')!==ORIGIN)return json({ok:false,error:'origin_not_allowed'},403);
  const fetchSite=request.headers.get('sec-fetch-site');if(fetchSite&&fetchSite!=='same-origin')return json({ok:false,error:'origin_not_allowed'},403);
  if((request.headers.get('content-type')??'').split(';')[0].trim().toLowerCase()!=='application/json')return json({ok:false,error:'invalid_content_type'},415);
  let item;try{item=validate(await readBody(request))}catch(e){return json({ok:false,error:e.message==='large'?'payload_too_large':'invalid_feedback'},e.message==='large'?413:400)}
  if(!env.DB||env.RETENTION_JOB_READY!=='yes')return json({ok:false,error:'setup_required'},503);
  try{
   await env.DB.prepare('DELETE FROM feedback WHERE created_at <= ?').bind(Date.now()-90*24*60*60*1000).run();
   const existing=await env.DB.prepare('SELECT id, language, useful, improve, support, reply_requested, name, email FROM feedback WHERE id = ?').bind(item.id).first();
   if(existing){if(Object.keys(item).some(k=>existing[k]!==item[k]))return json({ok:false,error:'request_conflict'},409);return json({ok:true,id:item.id})}
   const now=Date.now(),hour=Math.floor(now/3600000);
   const ip=request.headers.get('cf-connecting-ip');
   if(PUBLIC_FEEDBACK&&(!ip||! /^[0-9a-f:.]{3,45}$/i.test(ip)))return json({ok:false,error:'edge_context_unavailable'},503);
   const actor=ip||(request.headers.get('oai-authenticated-user-id')||'private-service');
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ORIGIN+'|'+hour+'|'+actor));
   const bucket=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
   await env.DB.prepare('DELETE FROM feedback_rate_limits WHERE expires_at < ?').bind(now).run();
   const counter=env.DB.prepare('INSERT INTO feedback_rate_limits (bucket, expires_at, requests) SELECT ?, ?, 1 WHERE (SELECT COUNT(*) FROM feedback WHERE created_at >= ?) < ? AND NOT EXISTS (SELECT 1 FROM feedback WHERE id = ?) ON CONFLICT(bucket) DO UPDATE SET requests = MIN(feedback_rate_limits.requests + 1, 6)').bind(bucket,(hour+2)*3600000,now-3600000,HOURLY_LIMIT,item.id);
   const insert=env.DB.prepare('INSERT INTO feedback (id, created_at, language, useful, improve, support, reply_requested, name, email) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT requests FROM feedback_rate_limits WHERE bucket = ?) <= 5 AND (SELECT COUNT(*) FROM feedback WHERE created_at >= ?) < ? ON CONFLICT(id) DO NOTHING').bind(item.id,now,item.language,item.useful,item.improve,item.support,item.reply_requested,item.name,item.email,bucket,now-3600000,HOURLY_LIMIT);
   const results=await env.DB.batch([counter,insert]);
   const result=results[1];
   if(!result.success)return json({ok:false,error:'storage_unavailable'},503);
   if(result.meta?.changes===0){const retry=await env.DB.prepare('SELECT id, language, useful, improve, support, reply_requested, name, email FROM feedback WHERE id = ?').bind(item.id).first();if(retry&&Object.keys(item).every(k=>retry[k]===item[k]))return json({ok:true,id:item.id});if(retry)return json({ok:false,error:'request_conflict'},409);return json({ok:false,error:'temporarily_limited'},429)}
   if(result.meta?.changes!==1)return json({ok:false,error:'storage_unavailable'},503);
   return json({ok:true,id:item.id},201);
  }catch{return json({ok:false,error:'storage_unavailable'},503)}
 }
 if(url.pathname.startsWith('/api/'))return json({ok:false,error:'not_found'},404);
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 if(!env.ASSETS)return new Response('Temporarily unavailable',{status:503});
 return env.ASSETS.fetch(request);
}};
export {validate};
