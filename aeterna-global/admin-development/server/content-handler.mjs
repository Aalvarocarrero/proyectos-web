import config from './content-config.json' with {type:'json'};
import template from './home-template.mjs';
import {adminIdentity,requireMutation,loadState,saveState,renderContent,defaultsFor,escapeHTML,htmlResponse,json,HttpError,readLimitedBody,isUploadedImage,storedContent,verifyImages,validateContent} from './content-service.mjs';
import {inspectImage} from './image-validation.mjs';
import {panel} from './admin-panel.mjs';
export async function publicHome(env,request){
 if(request && new URL(request.url).searchParams.get('content-preview')==='1')return adminRequest(request,env);
 let content=defaultsFor(config);try{content=(await loadState(env,config)).published;}catch{console.error('Published content unavailable; original homepage served.');}
 return new Response(renderContent(template,content,config),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
export async function mediaResponse(request,env,privateMode=false){
 const path=new URL(request.url).pathname.replace(/^\/api\/admin/,'');
 if(!isUploadedImage(path)||!env.DB||!env.BUCKET)throw new HttpError(404,'Imagen no encontrada.');
 if(!privateMode){const state=await loadState(env,config);if(!config.fields.some(f=>f.kind==='image'&&state.published[f.key]===path))throw new HttpError(404,'Imagen no encontrada.');}
 const key=path.slice(7),row=await env.DB.prepare('SELECT content_type FROM content_media WHERE key=?').bind(key).first();
 if(!row)throw new HttpError(404,'Imagen no encontrada.');const object=await env.BUCKET.get(key);if(!object)throw new HttpError(404,'Imagen no encontrada.');
 return new Response(object.body,{headers:{'Content-Type':row.content_type,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'X-Robots-Tag':'noindex, nofollow'}});
}
export async function publicMedia(request,env){try{return await mediaResponse(request,env);}catch(error){return json({error:'Imagen no encontrada.'},error instanceof HttpError?error.status:503);}}
async function body(request){if(!(request.headers.get('content-type')||'').startsWith('application/json'))throw new HttpError(415,'Se requiere JSON.');try{return JSON.parse(new TextDecoder().decode(await readLimitedBody(request,250000)));}catch(error){if(error instanceof HttpError)throw error;throw new HttpError(400,'JSON inválido.');}}
const exact=(value,keys)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!==keys.sort().join(','))throw new HttpError(400,'Solicitud inválida.');};
export async function adminRequest(request,env){
 try{
  const actor=adminIdentity(request,env,config),url=new URL(request.url),path=url.pathname;
  if(request.method==='GET'){
   if(path.startsWith('/api/admin/media/'))return await mediaResponse(request,env,true);
   const state=await loadState(env,config);
   if(path==='/admin/preview')return new Response(null,{status:302,headers:{Location:'/?content-preview=1','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
   if(['/','/index.html'].includes(path)&&url.searchParams.get('content-preview')==='1')return htmlResponse(renderContent(template,state.draft,config).replaceAll('/media/','/api/admin/media/'));
   if(path==='/api/admin/content')return json(state);
   if(path==='/api/admin/revisions')return json(env.DB?(await env.DB.prepare('SELECT version,action,created_at FROM content_revisions ORDER BY version DESC LIMIT 50').all()).results:[]);
   if(path==='/api/admin/media')return json({assets:config.imagePaths,uploads:env.DB?(await env.DB.prepare('SELECT key,content_type,bytes,width,height,created_at FROM content_media ORDER BY created_at DESC LIMIT 100').all()).results:[]});
   if(['/admin','/admin/'].includes(path)){const uploads=env.DB?(await env.DB.prepare('SELECT key FROM content_media ORDER BY created_at DESC').all()).results:[];return htmlResponse(panel({...state,mediaConfigured:!!env.DB&&!!env.BUCKET},uploads));}
   throw new HttpError(404,'No encontrado.');
  }
  if(request.method!=='POST')throw new HttpError(405,'Método no permitido.');
  requireMutation(request);
  if(path==='/api/admin/media'){
   if(!env.DB||!env.BUCKET)throw new HttpError(503,'Falta configurar D1 y R2 para cargar imágenes.');
   const bytes=await readLimitedBody(request,5*1024*1024),image=inspectImage(bytes.buffer,request.headers.get('content-type')),key=`${crypto.randomUUID()}.${image.extension}`;
   await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:image.type}});
   try{await env.DB.prepare('INSERT INTO content_media (key,content_type,bytes,width,height,actor,created_at) VALUES (?,?,?,?,?,?,?)').bind(key,image.type,bytes.byteLength,image.width,image.height,actor,new Date().toISOString()).run();}catch(error){await env.BUCKET.delete(key);throw error;}
   return json({image:'/media/'+key,preview:'/api/admin/media/'+key,...image},201);
  }
  if(path==='/api/admin/restore'){
   const input=await body(request);exact(input,['version','expectedVersion']);if(!Number.isSafeInteger(input.version)||input.version<0)throw new HttpError(400,'Versión inválida.');if(!env.DB)throw new HttpError(503,'Almacenamiento pendiente.');
   let content=defaultsFor(config);if(input.version!==0){const revision=await env.DB.prepare('SELECT data FROM content_revisions WHERE version=?').bind(input.version).first();if(!revision)throw new HttpError(404,'Versión no encontrada.');content=storedContent(JSON.parse(revision.data),config);}
   await verifyImages(content,env,config);return json(await saveState(env,config,actor,input.expectedVersion,content,'restore'));
  }
  if(path!=='/api/admin/content')throw new HttpError(404,'No encontrado.');
  const input=await body(request);exact(input,['action','content','expectedVersion']);if(!['save','publish'].includes(input.action))throw new HttpError(400,'Acción inválida.');
  // Validation and asset existence are checked before the atomic content write.
  const content=validateContent(input.content,config);await verifyImages(content,env,config);
  return json(await saveState(env,config,actor,input.expectedVersion,content,input.action));
 }catch(error){
  const status=error instanceof HttpError?error.status:503,message=error instanceof HttpError?error.message:'No se pudo acceder al contenido. Inténtalo de nuevo.';
  if(request.method==='GET'&&new URL(request.url).pathname.startsWith('/admin'))return htmlResponse(`<html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Administración · Aeterna Global</title><link rel="stylesheet" href="/content-admin.css"><main><h1>${escapeHTML(message)}</h1>${status===401?'<a href="/signin-with-chatgpt?return_to=%2Fadmin" target="_top">Iniciar sesión con ChatGPT</a>':''}</main></html>`,status);
  return json({error:message},status);
 }
}
