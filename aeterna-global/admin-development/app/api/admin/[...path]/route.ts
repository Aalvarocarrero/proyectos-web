import {env} from 'cloudflare:workers';
import {adminRequest} from '../../../../server/content-handler.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){return adminRequest(request,env);}
export async function POST(request:Request){return adminRequest(request,env);}
