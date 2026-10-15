import config from './content-config.json' with {type:'json'};
import template from './home-template.mjs';
import {adminIdentity,requireMutation,loadState,saveState,renderContent,defaultsFor,escapeHTML,htmlResponse,json,HttpError} from './content-service.mjs';
export async function publicHome(env,request){
 if(request && new URL(request.url).searchParams.get("content-preview")==="1")return adminRequest(request,env);
 let content=defaultsFor(config);try{content=(await loadState(env,config)).published;}catch(error){console.error('Published content unavailable; original homepage served.');}
 // Preserve the source robots and canonical decisions, including private-preview noindex.
 return new Response(renderContent(template,content,config),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
function panel(state){
 const fields=config.fields.map(f=>`<label>${escapeHTML(f.label)}${f.kind==='image'?`<select name="${f.key}">${config.imagePaths.map(path=>`<option value="${escapeHTML(path)}"${state.draft[f.key]===path?' selected':''}>${escapeHTML(path)}</option>`).join('')}</select>`:`<textarea name="${f.key}" maxlength="${f.max}" rows="${f.kind==='text'?3:2}" required>${escapeHTML(state.draft[f.key])}</textarea>`}</label>`).join('');
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Contenido · ${escapeHTML(config.name)}</title>${config.brand==='draco'?'<link rel="stylesheet" href="/fonts.css">':''}<style>*{box-sizing:border-box}body{margin:0;background:${config.background};color:${config.foreground};font:16px ${config.font};line-height:1.6}main{max-width:1000px;margin:auto;padding:clamp(20px,5vw,60px)}a{color:${config.color}}h1{font-size:clamp(30px,5vw,56px);line-height:1.1}p{max-width:70ch;color:${config.muted}}form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}label{display:grid;gap:8px;font-weight:bold;color:${config.color}}textarea,select{width:100%;min-height:60px;padding:12px;background:${config.surface};border:1px solid #555;border-radius:4px;color:${config.foreground};font:inherit;font-weight:normal}button{background:${config.color};border:0;border-radius:4px;padding:14px 20px;cursor:pointer;font:inherit;color:#fff}button:disabled{opacity:.5;cursor:wait}.actions,#status{grid-column:1/-1}.actions{display:flex;gap:16px;flex-wrap:wrap;align-items:center}#status{min-height:2em;color:${config.foreground}}small{color:${config.muted}}@media(max-width:650px){form{grid-template-columns:1fr}}</style></head><body><main><a href="/">← ${escapeHTML(config.name)}</a><h1>Contenido de portada</h1><p>Edita los textos, la imagen y el SEO de las secciones incluidas. Los cambios guardados son privados hasta que publiques. El catálogo, las otras páginas y sus funciones se conservan.</p><small>Versión ${state.version} · Publicada ${state.publishedVersion}</small><form id="editor" data-version="${state.version}">${fields}<div class="actions"><button type="submit" ${state.configured?'':'disabled'}>Guardar borrador</button><button type="button" id="publish" ${state.configured?'':'disabled'}>Publicar contenido</button><a href="/admin/preview" target="_blank" rel="noopener">Vista privada del borrador guardado ↗</a></div><p id="status" role="status" aria-live="polite">${state.configured?'Los campos no guardados todavía no aparecen en la vista privada.':'Almacenamiento pendiente de configurar. No se pueden guardar cambios.'}</p></form><script src="/content-admin.js" defer></script></main></body></html>`;
}
export async function adminRequest(request,env){
 try{
  const actor=adminIdentity(request,env,config),url=new URL(request.url);
  if(request.method==='GET'){
   const state=await loadState(env,config);
   if(url.pathname==='/admin/preview')return new Response(null,{status:302,headers:{Location:'/?content-preview=1','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
   if(['/','/index.html'].includes(url.pathname)&&url.searchParams.get('content-preview')==='1')return htmlResponse(renderContent(template,state.draft,config));
   if(url.pathname==='/api/admin/content')return json(state);
   if(['/admin','/admin/'].includes(url.pathname))return htmlResponse(panel(state));
   throw new HttpError(404,'No encontrado.');
  }
  if(request.method!=='POST'||url.pathname!=='/api/admin/content')throw new HttpError(405,'Método no permitido.');
  requireMutation(request);if(Number(request.headers.get('content-length')||0)>24000)throw new HttpError(413,'Contenido demasiado grande.');
  const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'Falta contenido.');const chunks=[];let bytes=0;while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>24000){await reader.cancel();throw new HttpError(413,'Contenido demasiado grande.');}chunks.push(part.value);}const raw=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){raw.set(chunk,offset);offset+=chunk.byteLength;}const text=new TextDecoder().decode(raw);let body;try{body=JSON.parse(text);}catch{throw new HttpError(400,'JSON inválido.');}
  if(!body||Object.keys(body).sort().join(',')!=='action,content,expectedVersion')throw new HttpError(400,'Solicitud inválida.');
  return json(await saveState(env,config,actor,body.expectedVersion,body.content,body.action));
 }catch(error){
  const status=error instanceof HttpError?error.status:503,message=error instanceof HttpError?error.message:'No se pudo acceder al contenido. Inténtalo de nuevo.';
  if(request.method==='GET'&&new URL(request.url).pathname.startsWith('/admin'))return htmlResponse(`<html lang="es"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Administración · ${escapeHTML(config.name)}</title><body><h1>${escapeHTML(message)}</h1>${status===401?'<a href="/signin-with-chatgpt?return_to=%2Fadmin" target="_top">Iniciar sesión con ChatGPT</a>':''}</body></html>`,status);
  return json({error:message},status);
 }
}
