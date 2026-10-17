import { readLoginForm } from '@/lib/auth/body';
import { getAuthConfig } from '@/lib/auth/config';
import { verifyCsrf } from '@/lib/auth/csrf';
import { verifyTurnstileDetailed, type TurnstileFailureReason } from '@/lib/auth/turnstile';
import { startGoogleLogin } from '@/lib/auth/google';
import { safeRelativeReturnPath } from '@/lib/auth-paths';
export const dynamic = 'force-dynamic';
const PRIVATE_HEADERS = { 'cache-control': 'private, no-store', 'referrer-policy': 'no-referrer' };

function rejectLogin(request: Request, error: 'csrf_rejected' | 'challenge_rejected' | 'authentication_unavailable', status: number, returnTo: string, reason?: TurnstileFailureReason) {
  // A document navigation gets a new widget, never a page that resubmits a spent
  // token on reload. API callers retain the status and a bounded diagnostic code.
  if (request.headers.get('accept')?.includes('text/html')) {
    const params = new URLSearchParams({ error, return_to: safeRelativeReturnPath(returnTo) });
    if (reason) params.set('reason', reason);
    return new Response(null, { status: 303, headers: { ...PRIVATE_HEADERS, location: `/auth/signin?${params}` } });
  }
  return Response.json({ error, ...(reason ? { reason } : {}) }, { status, headers: PRIVATE_HEADERS });
}

export async function POST(request: Request) {
  let returnTo = '/';
  try {
    const config = await getAuthConfig();
    const form = await readLoginForm(request);
    returnTo = safeRelativeReturnPath(form.get('returnTo') || '/');
    if (!await verifyCsrf(request, config, form.get('csrfToken') || '')) return rejectLogin(request, 'csrf_rejected', 403, returnTo);
    const challenge = await verifyTurnstileDetailed(form.get('turnstileToken') || '', config);
    if (!challenge.ok) return rejectLogin(request, 'challenge_rejected', 403, returnTo, challenge.reason);
    const { env } = await import('cloudflare:workers');
    const result = await startGoogleLogin(env.DB, config, returnTo);
    return new Response(null, { status: 303, headers: { ...PRIVATE_HEADERS, location: result.authorizationUrl, 'set-cookie': result.transactionCookie } });
  } catch { return rejectLogin(request, 'authentication_unavailable', 503, returnTo); }
}
