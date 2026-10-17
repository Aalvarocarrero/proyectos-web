/** Adds standalone CSRF proof without changing hosted Sites requests or offline queues. */
const CSRF_TIMEOUT_MS = 10_000;
let csrfPending: Promise<string> | null = null;

/** Cancel this wait, not the operation shared by other callers. */
function waitForSignal<T>(operation: Promise<T>, signal?: AbortSignal | null): Promise<T> {
  if (!signal) return operation;
  return new Promise<T>((resolve, reject) => {
    const cleanup = () => signal.removeEventListener('abort', abort);
    const abort = () => { cleanup(); reject(signal.reason ?? new DOMException('The request was aborted.', 'AbortError')); };
    operation.then(value => { cleanup(); resolve(value); }, error => { cleanup(); reject(error); });
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
  });
}

function getCsrfToken(): Promise<string> {
  if (!csrfPending) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new DOMException('The CSRF request timed out.', 'TimeoutError')), CSRF_TIMEOUT_MS);
    const request = (async () => {
      const response = await fetch('/api/auth/csrf', { cache: 'no-store', credentials: 'same-origin', signal: controller.signal });
      if (!response.ok) throw new Error('No se pudo verificar la sesión. Reconecta e inténtalo de nuevo.');
      const { token } = await response.json() as { token?: unknown };
      if (typeof token !== 'string' || !token) throw new Error('csrf_unavailable');
      return token;
    })();
    // Bound both response headers and body reading, even if the transport stalls.
    // Keep one preflight until it settles so concurrent callers share its cookie/token.
    csrfPending = waitForSignal(request, controller.signal).finally(() => { clearTimeout(timer); csrfPending = null; });
  }
  return csrfPending;
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const standalone=typeof __AUTH_DEPLOYMENT_TARGET__ !== 'undefined' && __AUTH_DEPLOYMENT_TARGET__==='standalone';
  const method=(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  if(!standalone || ['GET','HEAD','OPTIONS'].includes(method))return fetch(input,init);
  const url=new URL(input instanceof Request?input.url:String(input),location.origin);
  if(url.origin!==location.origin || !url.pathname.startsWith('/api/'))return fetch(input,init);
  const signal = init?.signal !== undefined ? init.signal : input instanceof Request ? input.signal : undefined;
  signal?.throwIfAborted();
  const token = await waitForSignal(getCsrfToken(), signal);
  signal?.throwIfAborted();
  const headers=new Headers(init?.headers || (input instanceof Request?input.headers:undefined));headers.set('x-csrf-token',token);
  return fetch(input,{...init,headers,credentials:'same-origin'});
}
