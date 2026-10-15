import { contentFields,defaultHomepage } from '../public/content-fields.mjs';
import { HttpError,json,adminIdentity,requireMutation,validateCatalog,loadState,saveState,readLimitedBody,contentImages } from './catalog-service.mjs';
import { inspectImage } from './image-validation.mjs';
async function body(request) {
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new HttpError(415,'Se requiere JSON.');
  const raw=new TextDecoder().decode(await readLimitedBody(request,450000));
  try{return JSON.parse(raw);}catch{throw new HttpError(400,'JSON inválido.');}
}
export async function verifyImages(catalog,env,knownAssets) {
  for(const image of contentImages(catalog)) {
    if(image.startsWith('./assets/')&&!knownAssets.has(image)) throw new HttpError(400,`El activo de ${image} no existe.`);
    if(image.startsWith('/media/')) {
      const key=image.slice(7);
      if(!env.BUCKET || !await env.DB.prepare('SELECT key FROM catalog_media WHERE key = ?').bind(key).first() || !await env.BUCKET.head(key)) throw new HttpError(400,`La imagen de ${image} no está cargada.`);
    }
  }
}
export async function handleAdmin(request,env,defaults,knownAssets) {
 try {
  const actor=adminIdentity(request,env);
  if(!env.DB)throw new HttpError(503,'Falta el almacenamiento D1.');
  const path=new URL(request.url).pathname.replace('/api/admin/','');
  if(request.method==='GET') {
    if(path==='content-fields')return json(contentFields);
    if(path==='catalog'){const state=await loadState(env,defaults);return json({...state,draft:{...state.draft,homepage:{...defaultHomepage,...state.draft.homepage}}});}
    if(path==='media')return json({assets:[...knownAssets],uploads:(await env.DB.prepare('SELECT key,content_type,bytes,width,height,created_at FROM catalog_media ORDER BY created_at DESC LIMIT 100').all()).results});
    if(path==='revisions')return json((await env.DB.prepare('SELECT version,action,actor,created_at FROM catalog_revisions ORDER BY version DESC LIMIT 50').all()).results);
    if(/^revisions\/\d+$/.test(path)) {const row=await env.DB.prepare('SELECT * FROM catalog_revisions WHERE version = ?').bind(Number(path.split('/')[1])).first();if(!row)throw new HttpError(404,'Versión no encontrada.');return json({...row,data:JSON.parse(row.data)});}
    if(path.startsWith('media/')) {const key=path.slice(6);if(!/^[a-f0-9-]{36}\.(png|jpg|webp)$/.test(key)||!env.BUCKET)throw new HttpError(404,'Imagen no encontrada.');const object=await env.BUCKET.get(key);if(!object)throw new HttpError(404,'Imagen no encontrada.');return new Response(object.body,{headers:{'Content-Type':object.httpMetadata.contentType,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});}
  }
  if(request.method==='POST') {
    requireMutation(request);
    if(path==='media') {
      if(!env.BUCKET)throw new HttpError(503,'Falta el almacenamiento de imágenes R2.');
      const length=Number(request.headers.get('content-length'));if(length>5*1024*1024)throw new HttpError(413,'Máximo 5 MB.');
      const buffer=(await readLimitedBody(request,5*1024*1024)).buffer;const image=inspectImage(buffer,request.headers.get('content-type'));
      const key=`${crypto.randomUUID()}.${image.extension}`;
      await env.BUCKET.put(key,buffer,{httpMetadata:{contentType:image.type}});
      try {await env.DB.prepare('INSERT INTO catalog_media (key,content_type,bytes,width,height,actor,created_at) VALUES (?,?,?,?,?,?,?)').bind(key,image.type,buffer.byteLength,image.width,image.height,actor,new Date().toISOString()).run();}
      catch(error){await env.BUCKET.delete(key);throw error;}
      return json({image:`/media/${key}`,preview:`/api/admin/media/${key}`,width:image.width,height:image.height},201);
    }
    if(['save','publish','restore'].includes(path)) {
      const input=await body(request);let catalog;
      if(path==='save') catalog=validateCatalog(input.catalog);
      if(path==='publish') {const state=await loadState(env,defaults);if(state.version!==input.expectedVersion)throw new HttpError(409,'El borrador cambió. Recarga antes de publicar.');catalog=validateCatalog(state.draft);}
      if(path==='restore') {if(!Number.isInteger(input.version))throw new HttpError(400,'Versión inválida.');const old=await env.DB.prepare('SELECT data FROM catalog_revisions WHERE version = ?').bind(input.version).first();if(!old)throw new HttpError(404,'Versión no encontrada.');catalog=validateCatalog(JSON.parse(old.data));}
      await verifyImages(catalog,env,knownAssets);
      return json(await saveState(env,actor,input.expectedVersion,catalog,path,defaults));
    }
  }
  throw new HttpError(404,'Operación no encontrada.');
 } catch(error) { return json({error:error instanceof HttpError?error.message:'No se pudo completar la operación. Revisa la configuración y vuelve a intentar.'},error instanceof HttpError?error.status:503); }
}
