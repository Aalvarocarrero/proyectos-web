import {getAuthConfig} from '@/lib/auth/config';
import {cookieValue} from '@/lib/auth/csrf';
import {revokeSession} from '@/lib/auth/session';
import {consumeGoogleCallback} from '@/lib/auth/google';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
  try {
    const config=await getAuthConfig();
    if(new URL(request.url).origin!==config.origin)return new Response(null,{status:403});
    const {env}=await import('cloudflare:workers');
    const result=await consumeGoogleCallback(env.DB,config,new URL(request.url),cookieValue(request,'__Host-va_oauth'));
    const oldToken=cookieValue(request,'__Host-va_session');
    if(oldToken)await revokeSession(env.DB,config,oldToken);
    const headers=new Headers({location:result.returnTo,'cache-control':'private, no-store','referrer-policy':'no-referrer'});
    headers.append('set-cookie',result.sessionCookie);
    headers.append('set-cookie','__Host-va_oauth=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0');
    return new Response(null,{status:303,headers});
  } catch { return new Response('No se pudo completar el acceso. Vuelve a iniciar sesión.',{status:401,headers:{'cache-control':'private, no-store','referrer-policy':'no-referrer','content-type':'text/plain; charset=utf-8','set-cookie':'__Host-va_oauth=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0'}}); }
}
