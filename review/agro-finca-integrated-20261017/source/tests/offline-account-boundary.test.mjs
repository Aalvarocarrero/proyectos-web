import assert from 'node:assert/strict';
import test, { after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = fileURLToPath(new URL('..', import.meta.url));
const originals = new Map();
function install(name, value) {
  if (!originals.has(name)) originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
}
const vite = await createServer({
  appType: 'custom', configFile: false, root, cacheDir: '/tmp/agro-account-boundary-tests', optimizeDeps: { noDiscovery: true },
  resolve: { alias: { '@': root } },
  plugins: [{
    name: 'account-boundary-hooks', enforce: 'pre',
    transform(code, id) {
      if (/components\/ui\/(select|dropdown-menu|popover)\.tsx\?boundary-menu-test/.test(id)) return code.replace('from "react"', 'from "virtual:boundary-menu-hooks"').replace('from "@/components/offline-account-boundary"', 'from "virtual:boundary-menu-context"');
      if (id.includes('offline-account-boundary.tsx?boundary-test')) return code.replace("from 'react';", "from 'virtual:boundary-hooks';").replace("from '@/lib/offline-owner';", "from 'virtual:boundary-owner';");
    },
    resolveId(id) { if (id.startsWith('virtual:boundary-')) return '\0' + id.slice('virtual:'.length); },
    load(id) {
      if (id === '\0boundary-menu-hooks') return 'export const useState=initial=>[initial,value=>globalThis.__menuStateChanges.push(value)];';
      if (id === '\0boundary-menu-context') return 'export const useOfflineAccountBlocked=()=>globalThis.__menuBlocked;';
      if (id === '\0boundary-owner') return 'export const selectVerifiedDashboardOwner=owner=>globalThis.__boundarySelectedOwners.push(owner);';
      if (id === '\0boundary-hooks') return `export {createContext} from 'react'; export const useContext=()=>globalThis.__boundaryContext;
        export const useState=v=>globalThis.__boundaryHooks.useState(v);
        export const useRef=v=>globalThis.__boundaryHooks.useRef(v);
        export const useEffect=(f,d)=>globalThis.__boundaryHooks.useEffect(f,d);`;
    },
  }], server: { middlewareMode: true, hmr: false, ws: false, watch: null },
});
after(async () => {
  await vite.close();
  for (const [key, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
});
const { OfflineAccountBoundary } = await vite.ssrLoadModule('/components/offline-account-boundary.tsx?boundary-test');
const menuModules = Object.fromEntries(await Promise.all(['select', 'dropdown-menu', 'popover'].map(async path => [path, await vite.ssrLoadModule(`/components/ui/${path}.tsx?boundary-menu-test`)])));
const KEY = 'venezuela-agro-session-boundary';
let memory, calls, navigations, writes;
function eventHub(extra = {}) {
  const listeners = new Map();
  return { ...extra, listeners,
    addEventListener(name, callback) { const set = listeners.get(name) ?? new Set(); set.add(callback); listeners.set(name, set); },
    removeEventListener(name, callback) { listeners.get(name)?.delete(callback); },
    emit(name, event = {}) { for (const callback of [...(listeners.get(name) ?? [])]) callback(event); },
  };
}
beforeEach(() => {
  memory = new Map([[KEY, 'initial']]); calls = []; navigations = []; writes = [];
  install('localStorage', { getItem: key => memory.get(key) ?? null, setItem: (...args) => writes.push(['set', ...args]), removeItem: (...args) => writes.push(['remove', ...args]), clear: () => writes.push(['clear']) });
  install('indexedDB', { open() { throw new Error('Boundary must not access records'); }, deleteDatabase() { throw new Error('Boundary must not delete records'); } });
  install('window', eventHub({ location: { reload: () => navigations.push('reload'), assign: href => navigations.push(href) } }));
  install('document', eventHub({ visibilityState: 'visible' }));
  install('fetch', async (url, options) => { calls.push({ url, options }); return new Response(JSON.stringify({ owner: 'account-a' })); });
  install('__boundaryHooks', undefined); install('__boundaryContext', null); install('__boundarySelectedOwners', []); install('__menuBlocked', false); install('__menuStateChanges', []);
});
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (node.type?.name === 'OfflineAccountLockPanel') return [node, ...nodes(node.type(node.props))];
  return [node, ...nodes(node.props?.children)];
}
function text(node) { if (node?.type?.name === 'OfflineAccountLockPanel') return text(node.type(node.props)); return typeof node === 'string' ? node : Array.isArray(node) ? node.map(text).join('') : node?.props ? text(node.props.children) : ''; }
// Runs production event/verification handlers and JSX with controlled hooks.
// Browser focus/portal layout remains a browser-QA responsibility.
function harness(props = {}) {
  let supplied = { ownerId: 'account-a', children: createElement('form', { id: 'unsaved-draft' }, createElement('input', { defaultValue: 'Draft stays mounted' })), ...props };
  const slots = []; let cursor = 0, changed = false, tree, effects = [], updates = 0;
  const hooks = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], next => { const value = typeof next === 'function' ? next(slots[i]) : next; updates++; if (!Object.is(value, slots[i])) { slots[i] = value; changed = true; } }]; },
    useRef(initial) { const i = cursor++; if (!(i in slots)) slots[i] = { current: initial }; return slots[i]; },
    useEffect(effect, deps) { const i = cursor++; if (!(i in slots) || !deps || deps.some((value, index) => !Object.is(value, slots[i].deps?.[index]))) { slots[i]?.cleanup?.(); slots[i] = { deps }; effects.push(() => { slots[i].cleanup = effect(); }); } },
  };
  function render(next) {
    if (next) supplied = { ...supplied, ...next };
    globalThis.__boundaryHooks = hooks;
    let attempts = 0;
    do { changed = false; cursor = 0; tree = OfflineAccountBoundary(supplied); globalThis.__boundaryContext = tree.props.value; const pending = effects; effects = []; for (const effect of pending) effect(); assert.ok(++attempts < 20); } while (changed);
    return tree;
  }
  const find = predicate => { const node = nodes(tree).find(predicate); assert.ok(node, 'expected boundary element'); return node; };
  render();
  return { render, find, get tree() { return tree; }, get updates() { return updates; }, get child() { return find(node => node.props?.['data-offline-account-view'] !== undefined).props.children; }, get blocked() { return find(node => node.props?.['data-offline-account-view'] !== undefined).props.hidden; }, verify() { return find(node => node.type === 'button').props.onClick(); }, unmount() { for (const slot of slots) slot?.cleanup?.(); } };
}
function boundary(value, oldEventValue = value) {
  if (value === null) memory.delete(KEY); else memory.set(KEY, value);
  window.emit('storage', { key: KEY, newValue: oldEventValue });
}
const tick = () => new Promise(resolve => setImmediate(resolve));

test('cross-tab logout hides and inerts the same mounted draft tree without writes, deletes or navigation', () => {
  const h = harness(); const original = h.child;
  assert.equal(h.blocked, false); boundary('signed-out'); h.render();
  assert.equal(h.blocked, true); assert.equal(h.child, original);
  const view = h.find(node => node.props?.['data-offline-account-view'] !== undefined);
  assert.equal(view.props.inert, true); assert.equal(view.props['aria-hidden'], true); assert.deepEqual(view.props.style, { display: 'none' });
  const html = renderToStaticMarkup(h.tree);
  assert.match(html, /No cierres ni recargues/); assert.match(html, /cambios sin guardar todavía no tienen copia/);
  assert.match(html, /id="unsaved-draft"/); assert.match(html, /hidden="" inert="" aria-hidden="true"/);
  const link = h.find(node => node.type === 'a');
  assert.equal(link.props.target, '_blank'); assert.equal(link.props.rel, 'noopener noreferrer');
  assert.deepEqual(writes, []); assert.deepEqual(calls, []); assert.deepEqual(navigations, []); h.unmount();
});

test('a different owner prop blocks synchronously and retains the original children rather than adopting the new tree', () => {
  const h = harness(); const original = h.child;
  h.render({ ownerId: 'account-b', children: createElement('form', { id: 'other-account' }) });
  assert.equal(h.blocked, true); assert.equal(h.child, original);
  h.render({ ownerId: 'account-a' }); assert.equal(h.blocked, true, 'returning props alone cannot reauthorize the view'); h.unmount();
});

test('explicit device-only workspace ignores account boundaries; account data cannot claim that exemption', () => {
  const local = harness({ ownerId: 'device-local', localOnly: true }); boundary('logout'); local.render();
  assert.equal(local.blocked, false); local.unmount();
  const account = harness({ ownerId: 'account-a', localOnly: true }); boundary('logout-again'); account.render();
  assert.equal(account.blocked, true); account.unmount();
});

test('unrelated and stale storage events do not block; focus and visibility catch missed current changes', () => {
  const h = harness();
  window.emit('storage', { key: 'unrelated', newValue: 'changed' });
  window.emit('storage', { key: KEY, newValue: 'stale-event' }); h.render(); assert.equal(h.blocked, false);
  memory.set(KEY, 'missed-event'); window.emit('focus'); h.render(); assert.equal(h.blocked, true); h.unmount();
  const next = harness(); memory.set(KEY, 'changed-while-background'); document.emit('visibilitychange'); next.render(); assert.equal(next.blocked, true); next.unmount();
});

test('only explicit server verification of the original owner unblocks, preserving the identical draft element', async () => {
  const h = harness(); const original = h.child; boundary('logged-out'); h.render();
  h.verify(); await tick(); h.render();
  assert.equal(h.blocked, false); assert.equal(h.child, original);
  assert.deepEqual(globalThis.__boundarySelectedOwners, ['account-a']);
  assert.equal(calls.length, 1); assert.equal(calls[0].url, '/api/account-menu'); assert.equal(calls[0].options.cache, 'no-store'); assert.equal(calls[0].options.credentials, 'same-origin');
  window.emit('storage', { key: KEY, newValue: 'older-queued-event' }); h.render(); assert.equal(h.blocked, false);
  assert.deepEqual(writes, []); assert.deepEqual(navigations, []); h.unmount();
});

test('wrong owner, HTTP failure, invalid response and network errors stay blocked without losing the draft', async () => {
  for (const response of [() => new Response(JSON.stringify({ owner: 'account-b' })), () => new Response('', { status: 401 }), () => new Response('{bad'), () => { throw new Error('offline'); }]) {
    const h = harness(); const original = h.child; boundary('blocked-' + Math.random()); h.render();
    install('fetch', async () => response()); h.verify(); await tick(); h.render();
    assert.equal(h.blocked, true); assert.equal(h.child, original); assert.match(text(h.tree), /no coincide|No pudimos verificar/); h.unmount();
  }
});

test('late matching response after another boundary or owner change cannot unlock and duplicate clicks share one request', async () => {
  for (const change of ['storage', 'owner']) {
    const h = harness(); boundary('begin-' + change); h.render(); let release; let sent = 0;
    install('fetch', async () => { sent++; return new Promise(resolve => { release = resolve; }); });
    h.verify(); h.verify(); assert.equal(sent, 1);
    if (change === 'storage') boundary('changed-during-verification');
    else h.render({ ownerId: 'account-b' });
    release(new Response(JSON.stringify({ owner: 'account-a' }))); await tick(); h.render();
    assert.equal(h.blocked, true); assert.deepEqual(globalThis.__boundarySelectedOwners, []); h.unmount();
  }
});

test('boundary changes without an event during verification are still rejected; stale unmounted callbacks do nothing', async () => {
  const h = harness(); boundary('initial-lock'); h.render(); let release;
  install('fetch', async () => new Promise(resolve => { release = resolve; })); h.verify();
  memory.set(KEY, 'silent-concurrent-change'); release(new Response(JSON.stringify({ owner: 'account-a' }))); await tick(); h.render(); assert.equal(h.blocked, true);
  const stale = [...window.listeners.get('storage')][0]; h.unmount(); const updates = h.updates;
  memory.set(KEY, 'after-unmount'); stale({ key: KEY }); assert.equal(h.updates, updates);
  assert.equal(window.listeners.get('storage').size, 0); assert.equal(window.listeners.get('focus').size, 0); assert.equal(document.listeners.get('visibilitychange').size, 0);
});

test('a matching original-owner response cannot override a changed owner prop, and unavailable storage fails closed', async () => {
  const h = harness(); h.render({ ownerId: 'account-b' }); h.verify(); await tick(); h.render(); assert.equal(h.blocked, true); h.unmount();
  const locked = harness(); boundary('storage-failure'); locked.render();
  install('localStorage', { getItem() { throw new Error('denied'); } }); locked.verify(); await tick(); locked.render();
  assert.equal(locked.blocked, true); assert.match(text(locked.tree), /No pudimos verificar/); locked.unmount();
});

test('boundary source contains no destructive record operations, automatic reload or forced dialog close', () => {
  const source = readFileSync(root + 'components/offline-account-boundary.tsx', 'utf8');
  assert.doesNotMatch(source, /deleteDatabase|\.reload\(|location\.assign|removeItem|sessionStorage|indexedDB|setOpen\(false\)/);
  assert.match(source, /OfflineAccountBlocked\.Provider value=\{\{ blocked/);
});


test('unresolved workspace stays hidden without blocking child initialization and captures the first actual owner', () => {
  const h = harness({ ownerId: null, localOnly: false });
  assert.equal(h.blocked, true); assert.equal(h.tree.props.value.blocked, false);
  h.render({ ownerId: 'verified-trusted-account', localOnly: false });
  assert.equal(h.blocked, false); boundary('later-signout'); h.render(); assert.equal(h.tree.props.value.blocked, true); h.unmount();
  const local = harness({ ownerId: null }); local.render({ ownerId: 'device-local', localOnly: true });
  boundary('local-exempt'); local.render(); assert.equal(local.blocked, false); local.unmount();
});

for (const [path, name] of [['select', 'Select'], ['dropdown-menu', 'DropdownMenu'], ['popover', 'Popover']]) {
 const menuModule = menuModules[path];
 test(`${name} closes its transient portal under account lock without changing selected values or parent drafts`, () => {
  const Root = menuModule[name]; const draft = createElement('span', null, 'parent-preserved-child'); const changes = [];
  const props = { defaultOpen: true, value: 'saved-selection', children: draft, onOpenChange: next => changes.push(next) };
  let tree = Root(props); assert.equal(tree.props.open, true); assert.equal(tree.props.value, 'saved-selection'); assert.equal(tree.props.children, draft);
  globalThis.__menuBlocked = true; tree = Root(props); assert.equal(tree.props.open, false); assert.equal(tree.props.value, 'saved-selection'); assert.equal(tree.props.children, draft);
  tree.props.onOpenChange(true); assert.deepEqual(changes, []); assert.deepEqual(globalThis.__menuStateChanges, []);
  assert.equal(Root({ ...props, open: true }).props.open, false, 'even a controlled open menu closes during the lock');
  globalThis.__menuBlocked = false; tree = Root(props); tree.props.onOpenChange(false); assert.deepEqual(changes, [false]); assert.deepEqual(globalThis.__menuStateChanges, [false]);
 });
}
