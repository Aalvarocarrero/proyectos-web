import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const servers = [];
after(async () => { for (const server of servers) await server.close(); });
async function paths(target) {
  const server = await createServer({root, configFile: false, appType: 'custom', define: {__AUTH_DEPLOYMENT_TARGET__: JSON.stringify(target)}, server: {middlewareMode: true, hmr: false, ws: false, watch: null}});
  servers.push(server);
  return server.ssrLoadModule('/lib/auth-paths.ts');
}

test('client paths preserve Sites routes and select standalone Google entry and POST logout', async () => {
  const sites = await paths('sites'), standalone = await paths('standalone');
  assert.equal(sites.chatGPTSignInPath('/app?tab=campo#today'), '/signin-with-chatgpt?return_to=%2Fapp%3Ftab%3Dcampo%23today');
  assert.equal(sites.chatGPTSignOutPath(), '/signout-with-chatgpt?return_to=%2F');
  assert.equal(standalone.chatGPTSignInPath('/app'), '/auth/signin?return_to=%2Fapp');
  assert.equal(standalone.chatGPTSignOutPath('/app'), '/api/auth/logout');
  assert.equal(sites.isStandaloneAuth(), false); assert.equal(standalone.isStandaloneAuth(), true);
});

test('return paths reject external destinations, parsing tricks and authentication loops', async () => {
  const auth = await paths('standalone');
  for (const path of ['https://evil.invalid', '//evil.invalid', '/\\evil.invalid', '/\nevil.invalid', '/%2f/evil.invalid', '/%5cevil.invalid', '/%00', '/auth/signin', '/auth/signin/', '/api/auth/google/callback?x=y', '/signin-with-chatgpt', '/signout-with-chatgpt', '/callback', '/%61uth/signin', '/app/../auth/signin', '/%invalid']) {
    assert.equal(auth.safeRelativeReturnPath(path), '/', path);
  }
  for (const path of ['/app', '/app?tab=campo#today', '/mercado?q=caf%C3%A9', '/admin']) assert.equal(auth.safeRelativeReturnPath(path), path);
});

test('path helpers cannot import server-only identity, config, headers or cookies', async () => {
  const source = await readFile(new URL('../lib/auth-paths.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /import\s|process\.env|next\/headers|GOOGLE_CLIENT_SECRET|AUTH_SESSION_SECRET/);
});

test('Google UI has explicit login challenge, fail-closed POST form and navigation recovery', async () => {
  const source = await readFile(new URL('../components/google-signin.tsx', import.meta.url), 'utf8');
  assert.match(source, /challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit/);
  assert.match(source, /action: "login"/);
  for (const callback of ['expired-callback', 'error-callback', 'timeout-callback']) assert.ok(source.includes(callback));
  assert.match(source, /method="post" action="\/api\/auth\/google\/start"/);
  for (const name of ['csrfToken', 'turnstileToken', 'returnTo']) assert.ok(source.includes(`name="${name}"`));
  assert.match(source, /disabled=\{!csrfToken \|\| !turnstileToken \|\| submitting\}/);
  assert.match(source, /submittingRef\.current/);
  assert.match(source, /"pageshow"/); assert.match(source, /event.persisted/);
  assert.match(source, /controller.abort\(\)/); assert.match(source, /turnstile\?\.remove\(widget\)/);
  assert.match(source, /<noscript>/);
});

test('standalone logout only disables offline account access after a successful CSRF POST', async () => {
  const source = await readFile(new URL('../components/session-menu.tsx', import.meta.url), 'utf8');
  assert.match(source, /session.signOutPath === chatGPTSignOutPath\("\/"\)/);
  const standalone = source.slice(source.indexOf('async function confirmStandaloneSignOut'), source.indexOf('if (!session) return null;'));
  assert.match(standalone, /fetch\("\/api\/auth\/csrf"/);
  assert.match(standalone, /fetch\("\/api\/auth\/logout"/);
  assert.match(standalone, /method: "POST"/); assert.match(standalone, /"x-csrf-token": csrf.token/);
  assert.match(standalone, /redirect: "error"/);
  assert.ok(standalone.indexOf('if (!response.ok)') < standalone.indexOf('prepareOfflineSignOut()'));
  assert.ok(standalone.indexOf('prepareOfflineSignOut()') < standalone.indexOf('window.location.assign("/")'));
  assert.match(standalone, /signingOutRef.current/);
  assert.doesNotMatch(source, /deleteDatabase|localStorage.clear|syncNow/);
  assert.match(source, /href=\{session.signOutPath\} target="_top"/);
});

test('logout execution preserves offline access on errors, requires CSRF and blocks repeated clicks', async () => {
  const source = await readFile(new URL('../components/session-menu.tsx', import.meta.url), 'utf8');
  const ts = await import('typescript');
  const body = source.slice(source.indexOf('async function confirmStandaloneSignOut'), source.indexOf('if (!session) return null;'));
  const js = ts.transpile(body, {target: ts.ScriptTarget.ES2022});
  function harness(responses, online = true) {
    const calls = [], events = [], ref = {current: false};
    const run = new Function('session', 'signingOutRef', 'navigator', 'setWarning', 'setSigningOut', 'fetch', 'prepareOfflineSignOut', 'window', `${js}; return confirmStandaloneSignOut;`)(
      {owner: 'account_a'}, ref, {onLine: online}, message => events.push(['warning', message]), value => events.push(['busy', value]),
      async (url, init) => { calls.push([url, init]); const response = responses.shift(); if (response instanceof Error) throw response; return response; },
      () => events.push(['prepare']), {location: {assign: path => events.push(['navigate', path])}},
    );
    return {run, calls, events, ref};
  }
  const csrf = {ok: true, json: async () => ({token: 'synthetic-csrf'})};
  const success = harness([csrf, {ok: true}]);
  await success.run();
  assert.deepEqual(success.calls.map(([url]) => url), ['/api/auth/csrf', '/api/auth/logout']);
  assert.equal(success.calls[1][1].method, 'POST');
  assert.equal(success.calls[1][1].headers['x-csrf-token'], 'synthetic-csrf');
  assert.deepEqual(success.events.filter(([event]) => ['prepare', 'navigate'].includes(event)), [['prepare'], ['navigate', '/']]);
  for (const responses of [[{ok: false}], [{ok: true, json: async () => ({})}], [csrf, {ok: false}], [csrf, new Error('offline')]]) {
    const failed = harness(responses); await failed.run();
    assert.equal(failed.events.some(([event]) => event === 'prepare' || event === 'navigate'), false);
    assert.equal(failed.events.some(([event]) => event === 'warning'), true);
    assert.equal(failed.ref.current, false);
  }
  const offline = harness([], false); await offline.run(); assert.equal(offline.calls.length, 0);
  const double = harness([csrf, {ok: true}]); await Promise.all([double.run(), double.run()]); assert.equal(double.calls.length, 2);
});
