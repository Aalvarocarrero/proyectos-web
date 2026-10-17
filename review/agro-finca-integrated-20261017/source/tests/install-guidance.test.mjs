import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({ appType: 'custom', configFile: false, root, cacheDir: '/tmp/agro-install-guidance-vite', resolve: { alias: { '@': root } }, server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
after(async () => { await vite.close(); });
const guide = await vite.ssrLoadModule('/lib/install-guidance.ts');
const now = Date.parse('2026-10-07T12:00:00Z');
const storage = (initial = {}) => { const entries = new Map(Object.entries(initial)); return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), entries }; };
const ios = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 Version/26.0 Mobile/15E148 Safari/604.1';
const chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36';

function clock() {
  let time = now, id = 0;
  const timers = new Map();
  return { now: () => time, setTimer: (callback, delay) => { timers.set(++id, { callback, due: time + delay }); return id; }, clearTimer: id => timers.delete(id), timers,
    advance(ms) { const end = time + ms; while (true) { const entry = [...timers.entries()].sort((a,b) => a[1].due-b[1].due)[0]; if (!entry || entry[1].due > end) break; timers.delete(entry[0]); time = entry[1].due; entry[1].callback(); } time = end; },
  };
}

test('detects iPhone Safari and a desktop-user-agent iPad without treating a Mac as an iPad', () => {
  assert.deepEqual(guide.detectInstallEnvironment({ userAgent: ios, platform: 'iPhone' }), { device: 'phone', os: 'ios', browser: 'safari' });
  assert.equal(guide.detectInstallEnvironment({ userAgent: 'Macintosh Version/26.0 Safari/605.1', platform: 'MacIntel', maxTouchPoints: 5 }).device, 'tablet');
  assert.deepEqual(guide.detectInstallEnvironment({ userAgent: 'Macintosh Version/26.0 Safari/605.1', platform: 'MacIntel', maxTouchPoints: 0 }), { device: 'computer', os: 'mac', browser: 'safari' });
});

test('detects Android phones/tablets and desktop Chrome/Edge', () => {
  assert.equal(guide.detectInstallEnvironment({ userAgent: 'Android 15 Mobile Chrome/140 Safari/537' }).device, 'phone');
  assert.equal(guide.detectInstallEnvironment({ userAgent: 'Android 15 Chrome/140 Safari/537' }).device, 'tablet');
  assert.equal(guide.detectInstallEnvironment({ userAgent: chrome, platform: 'Win32' }).browser, 'chrome');
  assert.equal(guide.detectInstallEnvironment({ userAgent: `${chrome} Edg/140.0`, platform: 'Win32' }).browser, 'edge');
  assert.equal(guide.detectInstallEnvironment({ userAgent: ios.replace('Version/26.0', 'CriOS/140.0') }).browser, 'chrome');
});

test('installed modes and appinstalled hide install guidance while ordinary browsing does not', () => {
  for (const flag of ['navigatorStandalone', 'standalone', 'minimalUi', 'windowControlsOverlay', 'appInstalled']) assert.equal(guide.isInstalledDisplayMode({ [flag]: true }), true);
  assert.equal(guide.isInstalledDisplayMode({}), false);
  assert.equal(guide.isInstallOfferSuppressed(storage(), storage(), now, true), true);
});

test('native installation requires the actual prompt capability, not a Chrome-looking user agent', () => {
  assert.equal(guide.isInstallPromptEvent(new Event('beforeinstallprompt')), false);
  assert.equal(guide.isInstallPromptEvent(Object.assign(new Event('beforeinstallprompt'), { prompt() {} })), false);
  const native = Object.assign(new Event('beforeinstallprompt'), { prompt: async () => undefined, userChoice: Promise.resolve({ outcome: 'dismissed' }) });
  assert.equal(guide.isInstallPromptEvent(native), true);
});

test('legacy session dismissal is preserved and is never reset when recording a quiet choice', () => {
  const session = storage({ [guide.INSTALL_DISMISS_KEY]: 'true' }); const persistent = storage();
  assert.equal(guide.claimInstallOffer(session, persistent, now), false);
  guide.dismissInstallOffer(session, persistent, now);
  assert.equal(session.getItem(guide.INSTALL_DISMISS_KEY), 'true');
  assert.equal(guide.isInstallOfferSuppressed(session, persistent, now + guide.INSTALL_QUIET_PERIOD_MS + 1), true);
});

test('a displayed intro stays quiet in this session but returns in a new session despite the old seven-day timestamp', () => {
  const session = storage(), persistent = storage();
  assert.equal(guide.claimInstallOffer(session, persistent, now), true);
  assert.equal(guide.claimInstallOffer(session, persistent, now), false);
  assert.equal(guide.isInstallOfferSuppressed(storage(), persistent, now + guide.INSTALL_QUIET_PERIOD_MS - 1), false);
  assert.equal(guide.isInstallOfferSuppressed(storage(), persistent, now + guide.INSTALL_QUIET_PERIOD_MS), false);
  assert.equal(guide.isInstallOfferSuppressed(storage(), persistent, now - 1), false);
});

test('broken browser storage and corrupt records do not throw or modify the old choice', () => {
  const denied = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  assert.equal(guide.claimInstallOffer(denied, denied, now), true);
  assert.doesNotThrow(() => guide.dismissInstallOffer(denied, denied, now));
  assert.equal(guide.isInstallOfferSuppressed(storage(), storage({ [guide.INSTALL_LAST_SHOWN_KEY]: 'corrupt' }), now), false);
  assert.equal(guide.isInstallOfferSuppressed(storage(), storage(), NaN), true);
});

test('fallback opens promptly without waiting for a native event', () => {
  const time = clock(); let opens = 0;
  guide.scheduleInstallOffer({ ...time, isBlocked: () => false, isSuppressed: () => false, offer: () => opens++ });
  time.advance(guide.INSTALL_OFFER_DELAY_MS - 1); assert.equal(opens, 0);
  time.advance(1); assert.equal(opens, 1); time.advance(100_000); assert.equal(opens, 1);
  assert.ok(guide.INSTALL_OFFER_DELAY_MS <= 1_000);
});

test('fallback waits for another dialog, then opens only once; cleanup prevents late appearance', () => {
  const time = clock(); let blocked = true, opens = 0;
  const stop = guide.scheduleInstallOffer({ ...time, isBlocked: () => blocked, isSuppressed: () => false, offer: () => opens++ });
  time.advance(guide.INSTALL_OFFER_DELAY_MS); assert.equal(opens, 0);
  blocked = false; time.advance(2_000); assert.equal(opens, 1);
  stop(); assert.equal(time.timers.size, 0);
  const other = clock(); const cancel = guide.scheduleInstallOffer({ ...other, isBlocked: () => false, isSuppressed: () => false, offer: () => opens++ });
  cancel(); other.advance(10_000); assert.equal(opens, 1);
});

test('a long background interruption preserves installation-first ordering until visible',()=>{
 const time=clock();let blocked=true,skipped=0,opened=0;
 guide.scheduleInstallOffer({...time,isBlocked:()=>blocked,isSuppressed:()=>false,offer:()=>opened++,skip:()=>skipped++});
 time.advance(120000);assert.equal(skipped,0);assert.equal(opened,0);
 blocked=false;time.advance(2000);assert.equal(opened,1);assert.equal(skipped,0);
 const quiet=clock();guide.scheduleInstallOffer({...quiet,isBlocked:()=>true,isSuppressed:()=>true,offer:()=>opened++,skip:()=>skipped++});quiet.advance(1000);assert.equal(skipped,1);assert.equal(quiet.timers.size,0);
});

test('five-second countdown pauses for reading/help/focus and resumes only the remaining quiet time', () => {
  const time = clock(); let finished = 0;
  const countdown = guide.createInstallCountdown({ ...time, finish: () => finished++ });
  countdown.resume(); time.advance(2_000); countdown.pause();
  assert.equal(countdown.remaining(), 3_000);
  time.advance(60_000); assert.equal(finished, 0);
  countdown.resume(); countdown.resume(); assert.equal(time.timers.size, 1);
  time.advance(2_999); assert.equal(finished, 0); time.advance(1); assert.equal(finished, 1);
  countdown.resume(); time.advance(10_000); assert.equal(finished, 1);
});

test('cancelled countdown cannot minimize a completed installation or an unmounted banner', () => {
  const time = clock(); let finished = 0;
  const countdown = guide.createInstallCountdown({ ...time, finish: () => finished++ });
  countdown.resume(); time.advance(500); countdown.cancel(); countdown.resume(); time.advance(20_000);
  assert.equal(finished, 0); assert.equal(time.timers.size, 0);
  assert.equal(guide.INSTALL_MORPH_MS, 600);
});

test('guidance names the correct device and preserves truthful manual fallback', () => {
  const mobile = guide.getInstallGuidance({ device: 'phone', os: 'ios', browser: 'safari' }, false);
  assert.match(mobile.title, /teléfono/); assert.match(mobile.steps.join(' '), /Compartir.*Añadir a pantalla de inicio/); assert.doesNotMatch(mobile.action, /^Instalar/);
  const tablet = guide.getInstallGuidance({ device: 'tablet', os: 'ios', browser: 'chrome' }, false);
  assert.match(tablet.title, /tableta/); assert.match(tablet.steps[0], /Safari/);
  const desktop = guide.getInstallGuidance({ device: 'computer', os: 'windows', browser: 'chrome' }, false);
  assert.match(desktop.title, /computadora/); assert.match(desktop.action, /acceso directo/); assert.match(desktop.steps.join(' '), /Enviar, guardar y compartir/);
  const native = guide.getInstallGuidance({ device: 'computer', os: 'windows', browser: 'edge' }, true);
  assert.equal(native.action, 'Instalar en esta computadora'); assert.match(native.steps.join(' '), /Más herramientas/);
  assert.match(guide.getInstallGuidance({ device: 'computer', os: 'mac', browser: 'safari' }, false).steps.join(' '), /Añadir al Dock.*si esa opción aparece/);
});

test('component exposes the coordinated circle and signals readiness only once after animation', async () => {
  const source = await readFile(new URL('../components/install-app-banner.tsx', import.meta.url), 'utf8');
  assert.match(source, /application-orb glass-action-orb/); assert.match(source, /<span>Aplicación<\/span>/);
  assert.match(source, /dataset\.installIntro = "pending"/); assert.match(source, /dataset\.installIntro = "complete"/);
  assert.match(source, /venezuela-agro:install-intro-complete/); assert.match(source, /introCompleteRef\.current\) return/);
  assert.match(source, /await animation\.finished/); assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /hovered \|\| touching \|\| focused \|\| showHelp \|\| installing \|\| dialogOpen \|\| pageHidden/);
  assert.match(source, /appinstalled/); assert.match(source, /dataset\.installInteraction = "active"/);
  assert.doesNotMatch(source, /data-idea-banner-trigger|venezuela-agro:open-idea/);
});

test('a quiet-choice race between scheduling and claiming advances to compact readiness', async () => {
  const source = await readFile(new URL('../components/install-app-banner.tsx', import.meta.url), 'utf8');
  assert.match(source, /if \(claimInstallOffer\(session, persistent, Date\.now\(\)\)\) changePhase\("expanded"\);\s*else \{ changePhase\("compact"\); requestAnimationFrame\(completeIntro\); \}/);
});
