import { createOfficialRateLoader } from '@/lib/exchange-rate-sources';
export const dynamic = 'force-dynamic';
const load = createOfficialRateLoader();
export async function GET() {
  return Response.json(await load(),{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
