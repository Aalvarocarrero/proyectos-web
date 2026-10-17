import {getAuthConfig} from '@/lib/auth/config';
import {cookieValue,verifyCsrf} from '@/lib/auth/csrf';
import {revokeSession,clearSessionCookie} from '@/lib/auth/session';
export const dynamic='force-dynamic';
export async function POST(request:Request) {
  try {
    const config=await getAuthConfig();
    if(!await verifyCsrf(request,config))return Response.json({error:'csrf_rejected'},{status:403});
    const {env}=await import('cloudflare:workers');
    const token=cookieValue(request,'__Host-va_session');
    if(token)await revokeSession(env.DB,config,token);
    const headers=new Headers({'cache-control':'private, no-store'});
    headers.append('set-cookie',clearSessionCookie());
    headers.append('set-cookie','__Host-va_csrf=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0');
    return Response.json({ok:true},{headers});
  } catch { return Response.json({error:'authentication_unavailable'},{status:503}); }
}
