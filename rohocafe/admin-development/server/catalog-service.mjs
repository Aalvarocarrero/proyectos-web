import { contentFields, defaultHomepage } from '../public/content-fields.mjs';
// Only dispatch-provided identity is trusted. Never expose this module to browser bundles.
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' } });
export function adminIdentity(request, env) {
  const id = request.headers.get('oai-authenticated-user-id');
  if (!id) throw new HttpError(401, 'Inicia sesión con ChatGPT.');
  let allowed;
  try { allowed = JSON.parse(env.ROHO_ADMIN_USER_IDS || '[]'); } catch { throw new HttpError(503, 'Configuración administrativa inválida.'); }
  if (!Array.isArray(allowed) || !allowed.length || allowed.some(x => typeof x !== 'string' || !x.trim())) throw new HttpError(503, 'La administración aún no tiene identidades autorizadas.');
  if (!allowed.includes(id)) throw new HttpError(403, 'Esta cuenta no tiene acceso de administración.');
  return id;
}
export function requireMutation(request) {
  if (request.headers.get('origin') !== new URL(request.url).origin || request.headers.get('x-roho-admin') !== '1') throw new HttpError(403,'Origen de solicitud no autorizado.');
}
function text(value, name, max=500, required=true) {
  if(typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new HttpError(400, `Campo inválido: ${name}.`);
  return value;
}
export function validImagePath(value) {
  return typeof value==='string' && (/^\.\/assets\/[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg)$/.test(value) || /^\/media\/[a-f0-9-]{36}\.(png|jpg|webp)$/.test(value));
}
export function contentImages(catalog) {
  return [...Object.values(catalog.products).map(p=>p.image), ...contentFields.filter(f=>f.kind==='image').map(f=>catalog.homepage?.[f.key] ?? f.default)];
}
export function validateHomepage(input) {
  if(input===undefined)return {...defaultHomepage};
  if(!input||typeof input!=='object'||Array.isArray(input))throw new HttpError(400,'Contenido de inicio inválido.');
  return Object.fromEntries(contentFields.map(f=>{
    const value=input[f.key] ?? f.default;
    text(value,f.label,f.kind==='image'?200:2000);
    if(f.kind==='image'&&!validImagePath(value))throw new HttpError(400,'Imagen de inicio inválida.');
    return [f.key,value];
  }));
}
export function validateCatalog(input) {
  if(!input || typeof input!=='object' || Array.isArray(input)) throw new HttpError(400,'El catálogo debe ser un objeto.');
  const serialized=JSON.stringify(input);
  if(serialized.length>400000) throw new HttpError(413,'El catálogo supera el tamaño permitido.');
  if(input.schemaVersion!==1) throw new HttpError(400,'Versión de esquema no admitida.');
  if(!Array.isArray(input.categories)||input.categories.length>50||!input.categories.length) throw new HttpError(400,'Revisa las categorías.');
  const categoryIds=new Set();
  for(const c of input.categories) { text(c.id,'ID de categoría',60); if(!/^[a-z0-9-]+$/.test(c.id)||categoryIds.has(c.id)) throw new HttpError(400,'ID de categoría inválido o duplicado.'); text(c.label,'Nombre de categoría',80); categoryIds.add(c.id); }
  const supported=['coffeeType','process','variety','presentation','origin','edition','availability'];
  if(!Array.isArray(input.facets)||input.facets.length>supported.length) throw new HttpError(400,'Filtros inválidos.');
  const facetKeys=new Set();
  for(const f of input.facets) { if(!supported.includes(f.key)||facetKeys.has(f.key)) throw new HttpError(400,'Filtro no admitido o duplicado.'); text(f.label,'Nombre de filtro',80); facetKeys.add(f.key); }
  if(!input.products||typeof input.products!=='object'||Array.isArray(input.products)||Object.keys(input.products).length>200) throw new HttpError(400,'Productos inválidos.');
  if(!input.harvests||typeof input.harvests!=='object'||Array.isArray(input.harvests)) throw new HttpError(400,'Cosechas inválidas.');
  for(const [key,h] of Object.entries(input.harvests)) {
    text(key,'Edición',80);
    for(const field of ['location','farm','producer','altitude','roastDate','cupping','plannedUnits']) text(h[field],field,500);
    if(!Number.isFinite(h.latitude)||Math.abs(h.latitude)>90||!Number.isFinite(h.longitude)||Math.abs(h.longitude)>180) throw new HttpError(400,'Coordenadas inválidas.');
    for(const field of ['mapUrl','mapEmbed']) { let url; try{url=new URL(h[field]);}catch{throw new HttpError(400,'Mapa inválido.');} if(url.protocol!=='https:'||url.hostname!=='www.openstreetmap.org'||url.username||url.password) throw new HttpError(400,'Los mapas deben usar OpenStreetMap HTTPS.'); }
  }
  for(const [id,p] of Object.entries(input.products)) {
    if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)||p.id!==id) throw new HttpError(400,'ID de producto inválido.');
    if(!categoryIds.has(p.categoryId)) throw new HttpError(400,`Categoría inexistente: ${id}.`);
    if(!['draft','published','archived'].includes(p.publicationStatus)) throw new HttpError(400,'Estado de publicación inválido.');
    for(const field of ['name','detail','eyebrow','description','category','edition','variety','process','origin','format','coffeeType','presentation']) text(p[field],`${id}: ${field}`,field==='description'?2000:300);
    if(!Object.hasOwn(input.harvests,p.edition)) throw new HttpError(400,`Falta la cosecha de ${id}.`);
    if(!Array.isArray(p.includes)||p.includes.length>30||!p.includes.length) throw new HttpError(400,'Componentes inválidos.');
    p.includes.forEach(v=>text(v,'Componente',200));
    if(!validImagePath(p.image)) throw new HttpError(400,'Imagen inválida; usa un activo existente o una carga verificada.');
    if(!Number.isInteger(p.price)||p.price<0||p.price>100000000||p.currency!=='COP'||p.priceType!=='reference'||p.stock!==null||p.availability!=='Prelanzamiento') throw new HttpError(400,'Esta versión admite solo precios de referencia COP y prelanzamiento sin inventario.');
    if(typeof p.conceptImage!=='boolean') throw new HttpError(400,'Indica si la imagen es conceptual.');
  }
  if(!input.texts||typeof input.texts!=='object') throw new HttpError(400,'Faltan los textos de tienda.');
  for(const key of ['title','subtitle','description']) text(input.texts[key],key,key==='description'?1000:120);
  // This safety notice is not editable into a false checkout promise.
  text(input.texts.notice,'Aviso de prelanzamiento',1000);
  if(!/prelanzamiento/i.test(input.texts.notice)||!/referencia/i.test(input.texts.notice)) throw new HttpError(400,'El aviso debe conservar prelanzamiento y precios de referencia.');
  const pick = (record,keys) => Object.fromEntries(keys.map(key=>[key,record[key]]));
  return {
    schemaVersion:1,
    homepage:validateHomepage(input.homepage),
    categories:input.categories.map(c=>pick(c,['id','label'])),
    facets:input.facets.map(f=>pick(f,['key','label'])),
    products:Object.fromEntries(Object.entries(input.products).map(([id,p])=>[id,pick(p,['id','name','detail','eyebrow','description','category','edition','variety','process','origin','format','includes','price','image','categoryId','coffeeType','presentation','availability','publicationStatus','priceType','currency','stock','conceptImage'])])),
    harvests:Object.fromEntries(Object.entries(input.harvests).map(([id,h])=>[id,pick(h,['location','latitude','longitude','mapEmbed','mapUrl','farm','producer','altitude','roastDate','cupping','plannedUnits'])])),
    texts:pick(input.texts,['title','subtitle','description','notice']),
  };
}
export function publicCatalog(catalog) {
  const products=Object.fromEntries(Object.entries(catalog.products).filter(([,p])=>p.publicationStatus==='published'));
  const used=new Set(Object.values(products).map(p=>p.edition));
  return {schemaVersion:catalog.schemaVersion,products,harvests:Object.fromEntries(Object.entries(catalog.harvests).filter(([edition])=>used.has(edition))),categories:catalog.categories,facets:catalog.facets,texts:catalog.texts,homepage:validateHomepage(catalog.homepage)};
}
export async function loadState(env, defaults) {
  if(!env.DB) return {version:0,publishedVersion:0,draft:defaults,published:defaults,configured:false};
  const row=await env.DB.prepare('SELECT * FROM catalog_state WHERE id = 1').first();
  return row ? {version:row.version,publishedVersion:row.published_version,draft:JSON.parse(row.draft),published:JSON.parse(row.published),configured:true} : {version:0,publishedVersion:0,draft:defaults,published:defaults,configured:true};
}
export async function saveState(env, actor, expected, catalog, action, defaults) {
  if(!env.DB) throw new HttpError(503,'Falta el almacenamiento D1.');
  if(!Number.isInteger(expected)||expected<0) throw new HttpError(400,'Versión requerida.');
  const current=await loadState(env,defaults);
  if(current.version!==expected) throw new HttpError(409,'Otra sesión modificó el catálogo. Recarga antes de guardar.');
  const version=expected+1, operation=crypto.randomUUID(), now=new Date().toISOString();
  const draft=JSON.stringify(catalog), published=JSON.stringify(action==='publish'?catalog:current.published), publishedVersion=action==='publish'?version:current.publishedVersion;
  const mutation=expected===0 ? env.DB.prepare('INSERT OR IGNORE INTO catalog_state (id,version,draft,published,published_version,operation_id,updated_at) VALUES (1,?,?,?,?,?,?)').bind(version,draft,published,publishedVersion,operation,now) : env.DB.prepare('UPDATE catalog_state SET version=?,draft=?,published=?,published_version=?,operation_id=?,updated_at=? WHERE id=1 AND version=?').bind(version,draft,published,publishedVersion,operation,now,expected);
  const results=await env.DB.batch([mutation,env.DB.prepare('INSERT INTO catalog_revisions (version,data,action,actor,created_at) SELECT version,draft,?,?,? FROM catalog_state WHERE id=1 AND operation_id=?').bind(action,actor,now,operation)]);
  if(results[0].meta.changes!==1) throw new HttpError(409,'Otra sesión modificó el catálogo. Recarga antes de guardar.');
  return {version,publishedVersion};
}

export async function readLimitedBody(request, maximum) {
  if(Number(request.headers.get('content-length')) > maximum) throw new HttpError(413, 'Solicitud demasiado grande.');
  if(!request.body) return new Uint8Array();
  const reader=request.body.getReader(), chunks=[]; let size=0;
  while(true) { const {done,value}=await reader.read(); if(done)break; size+=value.byteLength; if(size>maximum){await reader.cancel();throw new HttpError(413,'Solicitud demasiado grande.');} chunks.push(value); }
  const output=new Uint8Array(size);let offset=0;for(const chunk of chunks){output.set(chunk,offset);offset+=chunk.byteLength;}return output;
}
