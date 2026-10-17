import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Compile the real helper with process-local transport and clocks; no network calls.
const source = readFileSync(new URL('../lib/auth-fetch.ts', import.meta.url), 'utf8')
  .replace('export async function authFetch', 'async function authFetch');
const javascript = ts.transpile(source, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext });
const origin = 'https://synthetic.invalid';
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const tick = async () => { for (let index = 0; index < 8; index++) await Promise.resolve(); };
function harness(transport, target = 'standalone') {
  const calls = [], timers = new Map(); let nextTimer = 0;
  const fetch = (input, init) => { calls.push({ input, init }); return transport(input, init); };
  const authFetch = new Function('__AUTH_DEPLOYMENT_TARGET__', 'fetch', 'location', 'setTimeout', 'clearTimeout', `${javascript}; return authFetch;`)(
    target, fetch, { origin },
    (callback, milliseconds) => { const id = ++nextTimer; timers.set(id, { callback, milliseconds }); return id; },
    id => timers.delete(id),
  );
  return { authFetch, calls, timers, expire() { for (const timer of [...timers.values()]) timer.callback(); } };
}

test('a stalled shared preflight times out for all callers and the next attempt can recover', async () => {
  let attempts = 0;
  const h = harness(input => input === '/api/auth/csrf'
    ? ++attempts === 1 ? new Promise(() => {}) : Promise.resolve(Response.json({ token: 'fresh-token' }))
    : Promise.resolve(Response.json({ ok: true })));
  const first = assert.rejects(h.authFetch('/api/sync', { method: 'POST' }), { name: 'TimeoutError' });
  const second = assert.rejects(h.authFetch('/api/farm/split', { method: 'POST' }), { name: 'TimeoutError' });
  assert.equal(h.calls.length, 1);
  assert.equal([...h.timers.values()][0].milliseconds, 10_000);
  h.expire();
  await Promise.all([first, second]);
  assert.equal(h.calls[0].init.signal.aborted, true);
  assert.equal(h.timers.size, 0);
  assert.equal((await h.authFetch('/api/sync', { method: 'POST' })).ok, true);
  assert.equal(attempts, 2);
  assert.equal(h.calls.at(-1).init.headers.get('x-csrf-token'), 'fresh-token');
});

test('the preflight deadline also bounds a stalled response body', async () => {
  const h = harness(() => Promise.resolve({ ok: true, json: () => new Promise(() => {}) }));
  const pending = assert.rejects(h.authFetch('/api/sync', { method: 'POST' }), { name: 'TimeoutError' });
  await tick(); h.expire(); await pending;
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].init.signal.aborted, true);
  assert.equal(h.timers.size, 0);
});

test('canceling a single waiter promptly rejects without canceling its shared preflight', async () => {
  const csrf = deferred();
  const h = harness(() => csrf.promise);
  const controller = new AbortController();
  const pending = assert.rejects(h.authFetch('/api/sync', { method: 'POST', signal: controller.signal }), { name: 'AbortError' });
  controller.abort(); await pending;
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].init.signal.aborted, false);
  csrf.resolve(Response.json({ token: 'unused-token' })); await tick();
  assert.equal(h.calls.length, 1);
  assert.equal(h.timers.size, 0);
});

test('a concurrent surviving waiter uses the same CSRF response after another caller cancels', async () => {
  const csrf = deferred();
  const h = harness(input => input === '/api/auth/csrf' ? csrf.promise : Promise.resolve(Response.json({ ok: true })));
  const controller = new AbortController();
  const canceled = assert.rejects(h.authFetch('/api/sync', { method: 'POST', signal: controller.signal }), { name: 'AbortError' });
  const survivor = h.authFetch('/api/farm/split', { method: 'POST', headers: { 'x-local-owner': 'synthetic-owner' } });
  controller.abort(); await canceled;
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].init.signal.aborted, false);
  csrf.resolve(Response.json({ token: 'shared-token' }));
  assert.equal((await survivor).ok, true);
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls[1].input, '/api/farm/split');
  assert.equal(h.calls[1].init.headers.get('x-csrf-token'), 'shared-token');
  assert.equal(h.calls[1].init.headers.get('x-local-owner'), 'synthetic-owner');
  assert.equal(h.calls[1].init.credentials, 'same-origin');
  assert.equal(h.timers.size, 0);
});

test('Request signal cancellation is honored and an already aborted caller starts no preflight', async () => {
  const h = harness(() => new Promise(() => {}));
  const controller = new AbortController();
  const request = new Request(origin + '/api/sync', { method: 'POST', signal: controller.signal });
  const pending = assert.rejects(h.authFetch(request), { name: 'AbortError' });
  controller.abort(); await pending;
  assert.equal(h.calls[0].init.signal.aborted, false);
  await assert.rejects(h.authFetch('/api/sync', { method: 'POST', signal: controller.signal }), { name: 'AbortError' });
  assert.equal(h.calls.length, 1);
  h.expire(); await tick();
  assert.equal(h.timers.size, 0);
});

test('Sites, safe methods and external requests remain direct fetches', async () => {
  const h = harness(() => Promise.resolve(new Response('ok')));
  for (const method of ['GET', 'HEAD', 'OPTIONS']) await h.authFetch('/api/sync', { method });
  await h.authFetch('https://external.invalid/api/action', { method: 'POST' });
  await h.authFetch('/non-api', { method: 'POST' });
  assert.equal(h.calls.length, 5);
  assert.equal(h.timers.size, 0);
  const sites = harness(() => Promise.resolve(new Response('ok')), 'sites');
  await sites.authFetch('/api/sync', { method: 'POST' });
  assert.equal(sites.calls.length, 1);
  assert.equal(sites.calls[0].input, '/api/sync');
  assert.equal(sites.timers.size, 0);
});
