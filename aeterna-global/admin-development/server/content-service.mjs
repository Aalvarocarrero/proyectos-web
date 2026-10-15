// Server-only: Sites dispatch supplies identity; never trust client role/email claims.
export class HttpError extends Error { constructor(status,message){super(message);this.status=status;} }
export const defaultsFor = config => Object.fromEntries(config.fields.map(f=>[f.key,f.default]));
export function adminIdentity(request,env,config){
 const id=request.headers.get('oai-authenticated-user-id');if(!id)throw new HttpError(401,'Inicia sesión con ChatGPT.');
 let ids;try{ids=JSON.parse(env[config.adminEnv]||'[]');}catch{throw new HttpError(503,'Configuración administrativa inválida.');}
 if(!Array.isArray(ids)||!ids.length||ids.some(x=>typeof x!=='string'||!x.trim()))throw new HttpError(503,'Administración pendiente de autorizar.');
 if(!ids.includes(id))throw new HttpError(403,'Esta cuenta no está autorizada.');return id;
}
export function validateContent(input,config){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new HttpError(400,'Contenido inválido.');
 const keys=new Set(config.fields.map(f=>f.key));if(Object.keys(input).length!==keys.size||Object.keys(input).some(k=>!keys.has(k)))throw new HttpError(400,'Campos desconocidos o incompletos.');
 for(const f of config.fields){const value=input[f.key];if(typeof value!=='string'||value.length>f.max||!value.trim()||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw new HttpError(400,'Revisa '+f.label+'.');if(f.kind==='image'&&!config.imagePaths.includes(value))throw new HttpError(400,'Selecciona una imagen existente.');}
 return Object.fromEntries(config.fields.map(f=>[f.key,input[f.key]]));
}
export function requireMutation(request){if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('x-content-admin')!=='1')throw new HttpError(403,'Origen no autorizado.');if(!(request.headers.get('content-type')||'').startsWith('application/json'))throw new HttpError(415,'Se requiere JSON.');}
export async function loadState(env,config){
 const defaults=defaultsFor(config);if(!env.DB)return {version:0,publishedVersion:0,draft:defaults,published:defaults,configured:false};
 const row=await env.DB.prepare('SELECT * FROM content_state WHERE id = 1').first();
 if(!row)return {version:0,publishedVersion:0,draft:defaults,published:defaults,configured:true};
 return {version:row.version,publishedVersion:row.published_version,draft:validateContent(JSON.parse(row.draft),config),published:validateContent(JSON.parse(row.published),config),configured:true};
}
export async function saveState(env,config,actor,expected,input,action){
 if(!env.DB)throw new HttpError(503,'Almacenamiento D1 pendiente de configurar.');
 if(!Number.isSafeInteger(expected)||expected<0)throw new HttpError(400,'Versión inválida.');
 if(!['save','publish'].includes(action))throw new HttpError(400,'Acción inválida.');const content=validateContent(input,config),current=await loadState(env,config);
 if(current.version!==expected)throw new HttpError(409,'Otra sesión cambió el contenido. Recarga antes de guardar.');
 const version=expected+1,operation=crypto.randomUUID(),at=new Date().toISOString(),draft=JSON.stringify(content),published=JSON.stringify(action==='publish'?content:current.published),pv=action==='publish'?version:current.publishedVersion;
 const mutation=expected===0?env.DB.prepare('INSERT OR IGNORE INTO content_state (id,version,draft,published,published_version,operation_id,updated_at) VALUES (1,?,?,?,?,?,?)').bind(version,draft,published,pv,operation,at):env.DB.prepare('UPDATE content_state SET version=?,draft=?,published=?,published_version=?,operation_id=?,updated_at=? WHERE id=1 AND version=?').bind(version,draft,published,pv,operation,at,expected);
 const result=await env.DB.batch([mutation,env.DB.prepare('INSERT INTO content_revisions (version,data,action,actor,created_at) SELECT version,draft,?,?,? FROM content_state WHERE id=1 AND operation_id=?').bind(action,actor,at,operation)]);
 if(result[0].meta.changes!==1)throw new HttpError(409,'Otra sesión cambió el contenido. Recarga antes de guardar.');return {version,publishedVersion:pv};
}
export function escapeHTML(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
export function renderContent(template,content,config){
 validateContent(content,config);let html=template;
 for(const f of config.fields){if(f.kind==='alt'||f.kind==='image'||content[f.key]===f.default)continue;
 let replacement;if(f.kind==='meta')replacement=f.original.replace(/content="[^"]*"/,()=> 'content="'+escapeHTML(content[f.key])+'"');else replacement=f.original.replace(/(^<[^>]+>)[\s\S]*(<\/[^>]+>$)/,(_,open,close)=>open+escapeHTML(content[f.key]).replaceAll('\n','<br>')+close);
 html=html.replace(f.original,()=>replacement);
 }
 const image=config.fields.find(f=>f.kind==='image'),alt=config.fields.find(f=>f.kind==='alt');
 if(image&&(content[image.key]!==image.default||content[alt.key]!==alt.default)){
 let tag=image.original.replace(/alt="[^"]*"/,()=> 'alt="'+escapeHTML(content[alt.key])+'"');
 if(content[image.key]!==image.default)tag=tag.replace(/src="[^"]*"/,()=> 'src="'+escapeHTML(content[image.key])+'"').replace(/\s(?:srcset|sizes)="[^"]*"/g,'');html=html.replace(image.original,()=>tag);
 }return html;
}
export function htmlResponse(html,status=200){return new Response(html,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});}
export const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
