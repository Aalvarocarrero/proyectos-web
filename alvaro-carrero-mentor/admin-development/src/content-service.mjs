import {SCHEMA_VERSION, FIELDS, DEFAULT_CONTENT, IMAGE_ASSETS} from './content-fields.mjs';

export class ContentError extends Error {
 constructor(code, status=400) { super(code); this.status=status; }
}
const invalid = () => { throw new ContentError('invalid_content'); };
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
function exactKeys(value, keys) {
 if (!isObject(value) || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value,key))) invalid();
}
/** @typedef {import('./content-contract').HomepageContent} HomepageContent */
/** @param {unknown} value @returns {HomepageContent} */
export function validateContent(value) {
 exactKeys(value,FIELDS.map(field=>field.key));
 const result={};
 for (const field of FIELDS) {
  const text=value[field.key];
  if (typeof text !== 'string' || text !== text.trim() || !text || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) invalid();
  if (field.type==='image' ? !IMAGE_ASSETS.includes(text) : text.length>field.maxLength) invalid();
  result[field.key]=text;
 }
 return result;
}
export function validateCommand(value,action) {
 exactKeys(value,action==='save'?['expectedVersion','content']:['expectedVersion']);
 if (!Number.isSafeInteger(value.expectedVersion) || value.expectedVersion<0 || value.expectedVersion>=Number.MAX_SAFE_INTEGER) invalid();
 return {expectedVersion:value.expectedVersion,...(action==='save'?{content:validateContent(value.content)}:{})};
}
/** Identity is injected by Sites dispatch, never inferred from email/service bearer/client data. */
export function authorizeAdmin(request,env) {
 const configured=env.ALVARO_ADMIN_USER_IDS;
 if (typeof configured!=='string' || !configured.trim()) throw new ContentError('admin_setup_required',503);
 const entries=configured.split(',').map(value=>value.trim());
 if (!entries.length || entries.some(value=>!value || value==='*' || value.length>256 || /[\s\u0000-\u001f]/u.test(value))) throw new ContentError('admin_setup_required',503);
 const actor=request.headers.get('oai-authenticated-user-id');
 if (!actor) throw new ContentError('sign_in_required',401);
 if (!entries.includes(actor)) throw new ContentError('forbidden',403);
 return actor;
}
export function assertMutationRequest(request) {
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin || request.headers.get('x-alvaro-admin')!=='content-v1') throw new ContentError('origin_not_allowed',403);
 const site=request.headers.get('sec-fetch-site');
 if(site && site!=='same-origin') throw new ContentError('origin_not_allowed',403);
 if((request.headers.get('content-type')??'').split(';')[0].trim().toLowerCase()!=='application/json') throw new ContentError('invalid_content_type',415);
}
export async function readContentBody(request) {
 const limit=65536;
 if(Number(request.headers.get('content-length'))>limit) throw new ContentError('payload_too_large',413);
 if(!request.body) invalid();
 const reader=request.body.getReader(),chunks=[];let size=0;
 try {
  while(true) {
   const {done,value}=await reader.read();if(done)break;
   size+=value.byteLength;if(size>limit){await reader.cancel();throw new ContentError('payload_too_large',413);}chunks.push(value);
  }
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 }catch(error){if(error instanceof ContentError)throw error;invalid();}
}
function database(env) {if(!env.DB)throw new ContentError('storage_unavailable',503);return env.DB;}
function parseState(row) {
 if(!row) return {version:0,draft:{...DEFAULT_CONTENT},published:null,publishedVersion:null,updatedAt:null};
 if(row.schema_version!==SCHEMA_VERSION || !Number.isSafeInteger(row.version) || row.version<1) throw new ContentError('content_schema_unavailable',503);
 try {
  return {version:row.version,draft:validateContent(JSON.parse(row.draft)),published:row.published===null?null:validateContent(JSON.parse(row.published)),publishedVersion:row.published_version,updatedAt:row.updated_at};
 } catch {throw new ContentError('content_schema_unavailable',503);}
}
export async function loadState(env) {
 return parseState(await database(env).prepare('SELECT schema_version, version, draft, published, published_version, updated_at FROM content_state WHERE id = ?').bind('homepage').first());
}
export async function loadPublished(env) {
 if(!env.DB)return null;
 try {
  const row=await env.DB.prepare('SELECT schema_version, published FROM content_state WHERE id = ?').bind('homepage').first();
  if(!row || row.schema_version!==SCHEMA_VERSION || row.published===null)return null;
  return validateContent(JSON.parse(row.published));
 }catch{return null;}
}
export async function mutateContent(env,actor,action,input) {
 const DB=database(env),command=validateCommand(input,action),current=await loadState(env);
 if(current.version!==command.expectedVersion)throw new ContentError('version_conflict',409);
 if(action==='publish' && current.version===0)throw new ContentError('save_before_publish',409);
 const content=action==='save'?command.content:current.draft;
 const snapshot=JSON.stringify(content),version=current.version+1,now=Date.now(),operation=crypto.randomUUID();
 let statement;
 if(action==='save' && current.version===0) {
  statement=DB.prepare('INSERT INTO content_state (id, schema_version, version, draft, published, published_version, updated_at, updated_by, operation_id) VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?) ON CONFLICT(id) DO NOTHING').bind('homepage',SCHEMA_VERSION,version,snapshot,now,actor,operation);
 } else if(action==='save') {
  statement=DB.prepare('UPDATE content_state SET version = ?, draft = ?, updated_at = ?, updated_by = ?, operation_id = ? WHERE id = ? AND version = ? AND schema_version = ?').bind(version,snapshot,now,actor,operation,'homepage',command.expectedVersion,SCHEMA_VERSION);
 } else {
  statement=DB.prepare('UPDATE content_state SET version = ?, published = draft, published_version = ?, updated_at = ?, updated_by = ?, operation_id = ? WHERE id = ? AND version = ? AND schema_version = ?').bind(version,version,now,actor,operation,'homepage',command.expectedVersion,SCHEMA_VERSION);
 }
 // D1 batch is transactional. The operation token ties the audit row to the winning CAS.
 const audit=DB.prepare('INSERT INTO content_revisions (id, action, version, snapshot, actor_id, created_at) SELECT ?, ?, version, ?, ?, ? FROM content_state WHERE id = ? AND operation_id = ?').bind(operation,action,snapshot,actor,now,'homepage',operation);
 const results=await DB.batch([statement,audit]);
 if(!results?.[0]?.success || !results?.[1]?.success)throw new ContentError('storage_unavailable',503);
 if(results[0].meta?.changes===0)throw new ContentError('version_conflict',409);
 if(results[0].meta?.changes!==1 || results[1].meta?.changes!==1)throw new ContentError('storage_unavailable',503);
 return loadState(env);
}
