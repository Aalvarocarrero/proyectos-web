import {env} from 'cloudflare:workers';
import {publicHome} from '../server/content-handler.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){return publicHome(env,request);}
