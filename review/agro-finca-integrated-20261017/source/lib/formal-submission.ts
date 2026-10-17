import {chatGPTSignInPath,isStandaloneAuth,safeRelativeReturnPath} from '@/lib/auth-paths';
export type FormalDraftKind='order'|'idea'|'feedback';
export const FORMAL_DRAFT_TTL=60*60*1000;
const PREFIX='venezuela-agro-formal-draft:';
export class FormalSubmissionAuthError extends Error {
 constructor(public code='authentication_required'){super(code);this.name='FormalSubmissionAuthError';}
}
export function requiresFormalSession(){return isStandaloneAuth();}
/** UI preflight only. The server still authenticates and checks every operation. */
export async function requireFormalSubmissionSession(expectedOwner?:string):Promise<string|null>{
 if(!requiresFormalSession())return null;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);
 try{
  const response=await fetch('/api/account-menu',{cache:'no-store',credentials:'same-origin',signal:controller.signal});
  if(response.status===401)throw new FormalSubmissionAuthError();
  if(!response.ok)throw new Error('submission_session_unavailable');
  const session=await response.json() as {owner?:unknown};
  if(typeof session?.owner!=='string'||!session.owner)throw new FormalSubmissionAuthError();
  if(expectedOwner&&session.owner!==expectedOwner)throw new FormalSubmissionAuthError('submission_account_mismatch');
  return session.owner;
 }finally{clearTimeout(timer);}
}
export function formalSubmissionNeedsLogin(result:{reason?:string}|undefined){return result?.reason==='authentication_required'||result?.reason==='account_changed';}
export function isFormalSubmissionAuthError(error:unknown){return error instanceof FormalSubmissionAuthError;}
export function formalSubmissionError(error:unknown){return error instanceof FormalSubmissionAuthError&&error.code==='submission_account_mismatch'
 ? 'Esta solicitud pertenece a otra sesión. Vuelve a entrar con la cuenta original; el borrador se conserva y no se ha vuelto a enviar.'
 : 'Necesitas iniciar sesión para enviar. Conservamos tu borrador; el servidor no ha confirmado el envío.';}
/** Only invoked for an explicit login handoff, never auto-submitted or moved between account queues. */
export function saveFormalDraft(kind:FormalDraftKind,payload:unknown):boolean{
 try{const data=JSON.stringify({version:1,savedAt:Date.now(),payload});if(data.length>80000)return false;sessionStorage.setItem(PREFIX+kind,data);return sessionStorage.getItem(PREFIX+kind)===data;}catch{return false;}
}
export function loadFormalDraft<T>(kind:FormalDraftKind):T|null{
 try{const raw=sessionStorage.getItem(PREFIX+kind);if(!raw)return null;const data=JSON.parse(raw);if(data.version!==1||typeof data.savedAt!=='number'||Date.now()-data.savedAt<0||Date.now()-data.savedAt>FORMAL_DRAFT_TTL){sessionStorage.removeItem(PREFIX+kind);return null;}return data.payload as T;}catch{return null;}
}
export function clearFormalDraft(kind:FormalDraftKind){try{sessionStorage.removeItem(PREFIX+kind);}catch{/* A later load still expires the draft. */}}
export function formalSubmissionReturnPath(kind:FormalDraftKind,path:string):string{
 const url=new URL(safeRelativeReturnPath(path),'https://app.local');url.searchParams.set('resume',kind);return url.pathname+url.search+url.hash;
}
export function formalSubmissionLoginPath(kind:FormalDraftKind,path:string){return chatGPTSignInPath(formalSubmissionReturnPath(kind,path));}
