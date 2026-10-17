import type {GoogleAuthConfig} from './config';
const COOKIE = '__Host-va_csrf';
function encode(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'); }
export function cookieValue(request: Request, name: string): string | undefined {
  const matches = (request.headers.get('cookie') || '').split(';').map(part=>part.trim()).filter(part=>part.startsWith(name+'='));
  return matches.length===1 ? matches[0].slice(name.length+1) : undefined;
}
async function signature(config: GoogleAuthConfig, payload: string, session: string) {
  const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(config.sessionSecret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return encode(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`csrf-v1:${session}:${payload}`))));
}
export async function issueCsrf(request: Request, config: GoogleAuthConfig) {
  const existing=cookieValue(request,COOKIE);
  if(existing && await validToken(existing,request,config))return {token:existing,cookie:`${COOKIE}=${existing}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=3600`};
  const nonce=encode(crypto.getRandomValues(new Uint8Array(32)));
  const payload=`${Math.floor(Date.now()/1000)}.${nonce}`;
  const token=`${payload}.${await signature(config,payload,cookieValue(request,'__Host-va_session') || '')}`;
  return {token,cookie:`${COOKIE}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=3600`};
}
export function sameOriginMutation(request: Request, config: GoogleAuthConfig) {
  return request.headers.get('origin')===config.origin && request.headers.get('sec-fetch-site')!=='cross-site' && new URL(request.url).origin===config.origin;
}
export async function verifyCsrf(request: Request, config: GoogleAuthConfig, submitted?: string): Promise<boolean> {
  if (!sameOriginMutation(request,config)) return false;
  const token=submitted || request.headers.get('x-csrf-token');
  if (!token || token.length>200 || token!==cookieValue(request,COOKIE)) return false;
  return validToken(token,request,config);
}
async function validToken(token:string,request:Request,config:GoogleAuthConfig):Promise<boolean> {
  const pieces=token.split('.');
  if(pieces.length!==3 || !/^\d+$/.test(pieces[0]) || !/^[A-Za-z0-9_-]{43}$/.test(pieces[1]))return false;
  const age=Date.now()/1000-Number(pieces[0]);if(age<0 || age>3600)return false;
  const expected=await signature(config,`${pieces[0]}.${pieces[1]}`,cookieValue(request,'__Host-va_session') || '');
  if(expected.length!==pieces[2].length)return false;
  let difference=0;for(let i=0;i<expected.length;i++)difference|=expected.charCodeAt(i)^pieces[2].charCodeAt(i);
  return difference===0;
}
