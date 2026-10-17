import {getAuthConfig} from '@/lib/auth/config';
import {issueCsrf} from '@/lib/auth/csrf';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
  try {
    const config=await getAuthConfig();
    if(new URL(request.url).origin!==config.origin || request.headers.get('sec-fetch-site')==='cross-site')return new Response(null,{status:403});
    const {token,cookie}=await issueCsrf(request,config);
    return Response.json({token},{headers:{'set-cookie':cookie,'cache-control':'private, no-store'}});
  } catch { return Response.json({error:'authentication_unavailable'},{status:503}); }
}
