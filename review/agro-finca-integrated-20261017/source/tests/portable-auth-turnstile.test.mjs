import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
import ts from 'typescript';

const root = fileURLToPath(new URL('..', import.meta.url));
const env = {
  AUTH_MODE: 'google', APP_ORIGIN: 'https://venezuelaagro.com', AUTH_ACCESS_POLICY: 'public-production',
  GOOGLE_CLIENT_ID: 'synthetic-client', GOOGLE_CLIENT_SECRET: 'synthetic-client-secret',
  AUTH_SESSION_SECRET: 's'.repeat(64), TURNSTILE_SITE_KEY: 'synthetic-site', TURNSTILE_SECRET_KEY: 'synthetic-secret',
};
let writes = 0;
const database = {prepare() { return {bind() {return this;}, async run() {writes++;}}; }};
globalThis.__turnstileTestEnv = {...env, DB: database};
const vite = await createServer({
  root, configFile: false, appType: 'custom', resolve: {alias: {'@': root}},
  define: {__AUTH_DEPLOYMENT_TARGET__: JSON.stringify('standalone')},
  plugins: [{name: 'synthetic-auth-env', resolveId(id) {if (id === 'cloudflare:workers') return '\0synthetic-auth-env';}, load(id) {if (id === '\0synthetic-auth-env') return 'export const env = globalThis.__turnstileTestEnv;';}}],
  server: {middlewareMode: true, hmr: false, ws: false, watch: null},
});
after(async () => {await vite.close(); delete globalThis.__turnstileTestEnv;});
const {parseAuthConfig} = await vite.ssrLoadModule('/lib/auth/config.ts');
const {verifyTurnstileDetailed, verifyTurnstile, isTurnstileFailureReason} = await vite.ssrLoadModule('/lib/auth/turnstile.ts');
const {issueCsrf} = await vite.ssrLoadModule('/lib/auth/csrf.ts');
const {POST} = await vite.ssrLoadModule('/app/api/auth/google/start/route.ts');
const config = parseAuthConfig(env);
const valid = {success: true, hostname: 'venezuelaagro.com', action: 'login'};
const transport = value => async () => Response.json(value);

test('Turnstile diagnostics accept only success on the exact origin and login action', async () => {
  assert.deepEqual(await verifyTurnstileDetailed('synthetic-token', config, transport(valid)), {ok: true});
  for (const [value, reason] of [
    [{...valid, hostname: 'staging.venezuelaagro.com'}, 'hostname_mismatch'],
    [{...valid, hostname: 'www.venezuelaagro.com'}, 'hostname_mismatch'],
    [{...valid, hostname: undefined}, 'hostname_mismatch'],
    [{...valid, action: 'signup'}, 'action_mismatch'],
    [{...valid, action: undefined}, 'action_mismatch'],
    [{...valid, success: 'true'}, 'verification_response_invalid'],
    [{}, 'verification_response_invalid'], [null, 'verification_response_invalid'], [[], 'verification_response_invalid'],
  ]) {
    assert.deepEqual(await verifyTurnstileDetailed('synthetic-token', config, transport(value)), {ok: false, reason});
    assert.equal(await verifyTurnstile('synthetic-token', config, transport(value)), false);
  }
});

test('provider failures map to fixed categories without echoing untrusted or sensitive values', async () => {
  for (const [code, reason] of [
    ['missing-input-secret', 'secret_rejected'], ['invalid-input-secret', 'secret_rejected'],
    ['missing-input-response', 'token_rejected'], ['invalid-input-response', 'token_rejected'],
    ['timeout-or-duplicate', 'token_expired_or_used'], ['bad-request', 'request_rejected'],
    ['internal-error', 'provider_internal_error'], ['unknown-provider-value', 'provider_rejected'],
  ]) {
    const result = await verifyTurnstileDetailed('private-token', config, transport({success: false, 'error-codes': [code, 'private-token'], secret: config.turnstileSecret, hostname: 'private-host', cdata: 'private-data'}));
    assert.deepEqual(result, {ok: false, reason});
    assert.equal(isTurnstileFailureReason(reason), true);
    assert.doesNotMatch(JSON.stringify(result), /private-|synthetic-secret|unknown-provider/);
  }
  for (const value of [undefined, null, [], 'token', '<script>', ['secret_rejected']]) assert.equal(isTurnstileFailureReason(value), false);
});

test('missing/oversized tokens never reach the provider; network, HTTP and JSON failures remain closed', async () => {
  let calls = 0;
  const noFetch = async () => {calls++; throw new Error('must-not-fetch');};
  assert.deepEqual(await verifyTurnstileDetailed('', config, noFetch), {ok: false, reason: 'token_missing'});
  assert.deepEqual(await verifyTurnstileDetailed('x'.repeat(2049), config, noFetch), {ok: false, reason: 'token_oversized'});
  assert.equal(calls, 0);
  assert.deepEqual(await verifyTurnstileDetailed('token', config, async () => {throw new Error('private-error');}), {ok: false, reason: 'verification_unavailable'});
  assert.deepEqual(await verifyTurnstileDetailed('token', config, async () => new Response('private-body', {status: 502})), {ok: false, reason: 'provider_http_5xx'});
  assert.deepEqual(await verifyTurnstileDetailed('token', config, async () => new Response('private-body')), {ok: false, reason: 'verification_response_invalid'});
  let providerCalls = 0;
  await verifyTurnstileDetailed('synthetic-token', config, async (url, init) => {
    providerCalls++;
    assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.equal(init.method, 'POST');
    assert.equal(init.body.get('response'), 'synthetic-token');
    assert.equal(init.body.get('secret'), config.turnstileSecret);
    assert.ok(init.signal instanceof AbortSignal);
    return Response.json({success: false, 'error-codes': ['timeout-or-duplicate']});
  });
  assert.equal(providerCalls, 1, 'never retry a spent token automatically');
});

async function loginRequest({accept = 'application/json', returnTo = '/app?tab=campo', csrf = true} = {}) {
  const issued = await issueCsrf(new Request(config.origin), config);
  return new Request(`${config.origin}/api/auth/google/start`, {
    method: 'POST', headers: {accept, origin: config.origin, cookie: issued.cookie.split(';')[0]},
    body: new URLSearchParams({csrfToken: csrf ? issued.token : 'bad-csrf', turnstileToken: 'private-token', returnTo}),
  });
}

async function withProvider(value, run, status = 200) {
  const oldFetch = globalThis.fetch;
  let calls = 0;
  writes = 0;
  globalThis.fetch = async () => {calls++; if (value instanceof Error) throw value; return Response.json(value, {status});};
  try {await run(() => calls);} finally {globalThis.fetch = oldFetch;}
}

test('login POST exposes only bounded diagnostics, stays private and never creates OAuth state on challenge failure', async () => {
  for (const status of [200, 400]) await withProvider({success: false, 'error-codes': ['invalid-input-secret', 'private-token'], secret: config.turnstileSecret}, async calls => {
    const response = await POST(await loginRequest());
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), {error: 'challenge_rejected', reason: 'secret_rejected'});
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
    assert.equal(response.headers.get('set-cookie'), null);
    assert.equal(writes, 0); assert.equal(calls(), 1);
  }, status);
});

test('failed browser navigation returns to a fresh challenge without tokens or unsafe return paths', async () => {
  await withProvider({success: false, 'error-codes': ['timeout-or-duplicate']}, async () => {
    for (const returnTo of ['/app?tab=campo', '//evil.test', '/api/auth/google/start']) {
      const response = await POST(await loginRequest({accept: 'text/html,application/xhtml+xml', returnTo}));
      assert.equal(response.status, 303);
      const location = response.headers.get('location');
      assert.ok(location.startsWith('/auth/signin?'));
      const url = new URL(location, config.origin);
      assert.equal(url.searchParams.get('error'), 'challenge_rejected');
      assert.equal(url.searchParams.get('reason'), 'token_expired_or_used');
      assert.equal(url.searchParams.get('return_to'), returnTo.startsWith('/app?') ? returnTo : '/');
      assert.doesNotMatch(location, /private-token|synthetic-secret|csrfToken/);
      assert.equal(response.headers.get('set-cookie'), null);
    }
    assert.equal(writes, 0);
  });
});

test('CSRF rejection precedes verification; valid challenge preserves Google redirect and secure cookie', async () => {
  await withProvider(valid, async calls => {
    const denied = await POST(await loginRequest({csrf: false}));
    assert.equal(denied.status, 403); assert.equal(calls(), 0); assert.equal(writes, 0);
    const accepted = await POST(await loginRequest({accept: 'text/html'}));
    assert.equal(accepted.status, 303); assert.equal(calls(), 1); assert.equal(writes, 1);
    assert.equal(new URL(accepted.headers.get('location')).origin, 'https://accounts.google.com');
    assert.match(accepted.headers.get('set-cookie'), /^__Host-va_oauth=.*; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=600$/);
  });
});

test('sign-in submit rejects stale tokens, delayed expiry timers, clock reversal, offline and double submit', async () => {
  const source = await readFile(new URL('../components/google-signin.tsx', import.meta.url), 'utf8');
  const body = source.slice(source.indexOf('onSubmit={event => {') + 'onSubmit={event => {'.length, source.indexOf('\n  }}>'));
  const js = ts.transpile(body, {target: ts.ScriptTarget.ES2022});
  function submit({age = 0, online = true, submitting = false} = {}) {
    const events = [];
    const ref = {current: submitting}, createdAt = {current: Date.now() - age};
    const run = new Function('event', 'csrfToken', 'turnstileToken', 'submittingRef', 'navigator', 'tokenCreatedAt', 'TOKEN_REFRESH_MS', 'setTurnstileToken', 'setError', 'setSubmitting', js);
    run({preventDefault: () => events.push('prevented')}, 'csrf', 'token', ref, {onLine: online}, createdAt, 240000, () => events.push('cleared'), () => events.push('error'), () => events.push('submitting'));
    return {events, ref};
  }
  assert.deepEqual(submit().events, ['submitting']);
  for (const age of [240000, 300000, -60000]) assert.deepEqual(submit({age}).events, ['prevented', 'cleared', 'error']);
  assert.deepEqual(submit({online: false}).events, ['prevented', 'error']);
  assert.deepEqual(submit({submitting: true}).events, ['prevented']);
  assert.match(source, /tokenCreatedAt.current = Date.now\(\)/);
  assert.match(source, /window.clearTimeout\(tokenTimeout\)/);
  const page = await readFile(new URL('../app/auth/signin/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /isTurnstileFailureReason\(params.reason\)/, 'never echo arbitrary query diagnostics');
});

test('provider HTTP failures remain distinct from valid internal-error responses without exposing raw bodies',async()=>{
 for(const [status,reason] of [[400,'provider_http_400'],[401,'provider_http_401'],[403,'provider_http_403'],[429,'provider_http_429'],[500,'provider_http_5xx'],[503,'provider_http_5xx'],[404,'provider_http_other']]){
  const result=await verifyTurnstileDetailed('private-token',config,async()=>new Response('private-body-secret',{status}));assert.deepEqual(result,{ok:false,reason});assert.equal(isTurnstileFailureReason(reason),true);assert.doesNotMatch(JSON.stringify(result),/private-body-secret/);
 }
 assert.deepEqual(await verifyTurnstileDetailed('token',config,transport({success:false,'error-codes':['internal-error']})),{ok:false,reason:'provider_internal_error'});
});

test('HTTP400 parses only documented error codes and never accepts an error-status success envelope',async()=>{
 for(const [code,reason] of [['invalid-input-secret','secret_rejected'],['missing-input-secret','secret_rejected'],['bad-request','request_rejected'],['timeout-or-duplicate','token_expired_or_used'],['invalid-input-response','token_rejected'],['internal-error','provider_internal_error']]){
  const result=await verifyTurnstileDetailed('private-token',config,async()=>Response.json({success:false,'error-codes':[code],private:'untrusted-secret'},{status:400}));
  assert.deepEqual(result,{ok:false,reason});assert.doesNotMatch(JSON.stringify(result),/untrusted-secret|private-token/);
 }
 for(const payload of [{...valid},{success:'false','error-codes':['invalid-input-secret']},{success:false,'error-codes':['arbitrary-secret-injected']},{success:false,'error-codes':'invalid-input-secret'},null,[]]){
  assert.deepEqual(await verifyTurnstileDetailed('token',config,async()=>Response.json(payload,{status:400})),{ok:false,reason:'provider_http_400'});
 }
});
test('provider body parsing is byte-bounded, preserves HTTP fallback, and rejects malformed successful responses',async()=>{
 for(const status of [200,400]){
  const reason=status===200?'verification_response_invalid':'provider_http_400';
  for(const body of ['not JSON',JSON.stringify({success:false,'error-codes':['invalid-input-secret'],padding:'x'.repeat(17000)})]){
   assert.deepEqual(await verifyTurnstileDetailed('token',config,async()=>new Response(body,{status})),{ok:false,reason});
  }
  let cancelled=false;
  const stream=new ReadableStream({start(controller){controller.enqueue(new Uint8Array(17000));},cancel(){cancelled=true;}});
  assert.deepEqual(await verifyTurnstileDetailed('token',config,async()=>new Response(stream,{status})),{ok:false,reason});
  assert.equal(cancelled,true);
 }
});
