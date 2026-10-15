import { env } from 'cloudflare:workers';
import defaults from '../../../../server/default-catalog.json';
import assets from '../../../../server/known-assets.json';
import { handleAdmin } from '../../../../server/admin-handler.mjs';
export const dynamic = 'force-dynamic';
export function GET(request: Request) { return handleAdmin(request,env,defaults,new Set(assets)); }
export function POST(request: Request) { return handleAdmin(request,env,defaults,new Set(assets)); }
