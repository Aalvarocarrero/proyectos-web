import { json } from '../../../server/catalog-service.mjs';
export const dynamic='force-dynamic';
export function GET(request: Request) {
 const userId=request.headers.get('oai-authenticated-user-id');
 return userId ? json({userId,email:request.headers.get('oai-authenticated-user-email')}) : json({error:'Inicia sesión con ChatGPT.'},401);
}
