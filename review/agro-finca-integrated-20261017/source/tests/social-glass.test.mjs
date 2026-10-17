import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({ appType: 'custom', configFile: false, root, cacheDir: '/tmp/agro-social-glass-vite', resolve: { alias: { '@': root } }, server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
after(async () => { await vite.close(); });
const { chooseSocialPosition, createSocialLayoutScheduler } = await vite.ssrLoadModule('/lib/social-position.ts');
const viewport = { left: 0, top: 0, width: 390, height: 844 };
const button = { width: 56, height: 56 };
const rect = (left, top, right, bottom) => ({ left, top, right, bottom });
function box(position) { return rect(position.left, position.top, position.left + button.width, position.top + button.height); }
function overlaps(a,b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
function panelBox(position) {
  return position.panelSide === 'left'
    ? rect(position.left-10-position.panelWidth, position.top+button.height-position.panelMaxHeight, position.left-10, position.top+button.height)
    : rect(position.left+button.width-position.panelWidth, position.top-10-position.panelMaxHeight, position.left+button.width, position.top-10);
}

test('prefers lower-right and respects safe-area bottom', () => {
  const result = chooseSocialPosition({ viewport, button, obstacles: [], insets: { bottom: 34 } });
  assert.equal(result.left, 322); assert.equal(result.top, 754); assert.equal(result.hidden, false);
  assert.equal(box(result).bottom, viewport.height-34);
});

test('actual primary CTA collision lifts only the social control', () => {
  const cta = rect(16, 746, 374, 816), original = structuredClone(cta);
  const result = chooseSocialPosition({ viewport, button, obstacles: [cta] });
  assert.ok(box(result).bottom <= cta.top-10);
  assert.equal(overlaps(box(result), cta), false);
  assert.deepEqual(cta, original, 'the CTA geometry is not modified');
});

test('non-colliding content does not unnecessarily move the lower-right button', () => {
  const baseline = chooseSocialPosition({ viewport, button, obstacles: [] });
  const result = chooseSocialPosition({ viewport, button, obstacles: [rect(10, 730, 90, 820)] });
  assert.equal(result.top, baseline.top);
});

test('overlapping CTA blockers are merged and the lower useful gap is chosen', () => {
  const obstacles = [rect(260, 710, 385, 830), rect(310, 680, 385, 740), rect(0, 0, 390, 90)];
  const result = chooseSocialPosition({ viewport, button, obstacles });
  assert.equal(result.hidden, false); assert.ok(box(result).bottom <= 670);
  for (const obstacle of obstacles) assert.equal(overlaps(box(result), obstacle), false);
});

test('open panel avoids store request and other compact orbs without moving them', () => {
  const obstacles = [rect(210, 660, 378, 716), rect(12, 754, 72, 814), rect(0, 0, 390, 88)];
  const result = chooseSocialPosition({ viewport, button, panel: { width: 224, height: 310 }, obstacles });
  assert.equal(result.hidden, false); assert.equal(result.panelSide, 'left');
  for (const obstacle of obstacles) { assert.equal(overlaps(box(result), obstacle), false); assert.equal(overlaps(panelBox(result), obstacle), false); }
  assert.ok(panelBox(result).left >= 12); assert.ok(panelBox(result).top >= 12);
});

test('short landscape windows cap the panel for internal scrolling', () => {
  const small = { left: 0, top: 0, width: 740, height: 320 };
  const obstacles = [rect(0,0,740,85), rect(500,240,730,308)];
  const result = chooseSocialPosition({ viewport: small, button, panel: { width: 224, height: 330 }, obstacles });
  assert.equal(result.hidden, false); assert.ok(result.panelMaxHeight < 330); assert.ok(result.panelMaxHeight >= 72);
  assert.ok(panelBox(result).top >= 12); assert.ok(box(result).bottom <= 308);
});

test('pinch zoom or a keyboard uses visual viewport offsets and never the old layout height', () => {
  const visual = { left: 45, top: 90, width: 300, height: 410 };
  const result = chooseSocialPosition({ viewport: visual, button, panel: { width: 224, height: 310 }, obstacles: [] });
  assert.ok(box(result).right <= visual.left+visual.width-12); assert.ok(box(result).bottom <= visual.top+visual.height-12);
  assert.ok(panelBox(result).left >= visual.left+12); assert.ok(panelBox(result).top >= visual.top+12);
});

test('very narrow views use a bounded panel above the button', () => {
  const narrow = { left: 0, top: 0, width: 210, height: 600 };
  const result = chooseSocialPosition({ viewport: narrow, button, panel: { width: 224, height: 310 }, obstacles: [] });
  assert.equal(result.panelSide, 'top'); assert.equal(result.hidden, false);
  assert.ok(panelBox(result).left >= 12); assert.ok(panelBox(result).right <= 198); assert.ok(panelBox(result).top >= 12);
});

test('when every safe interval is covered the social control yields instead of covering a CTA', () => {
  const result = chooseSocialPosition({ viewport, button, obstacles: [rect(0,0,390,844)] });
  assert.equal(result.hidden, true);
  assert.ok(result.top >= 12); assert.ok(result.top+56 <= 832);
});

test('geometry is deterministic and does not mutate obstacle or viewport inputs', () => {
  const options = { viewport: Object.freeze({ ...viewport }), button: Object.freeze({ ...button }), panel: Object.freeze({ width: 224, height: 320 }), obstacles: Object.freeze([Object.freeze(rect(200, 690, 380, 760))]) };
  assert.deepEqual(chooseSocialPosition(options), chooseSocialPosition(options));
});

test('component preserves official links, Radix dismissal/focus, and observes viewport geometry', async () => {
  const source = await readFile(new URL('../components/social-links.tsx', import.meta.url), 'utf8');
  assert.match(source, /OFFICIAL_SOCIAL_LINKS\.map/); assert.match(source, /FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon, ThreadsIcon/);
  assert.match(source, /<Popover\.Close asChild>/); assert.match(source, /Cerrar redes sociales/);
  assert.match(source, /onOpenAutoFocus/); assert.match(source, /onCloseAutoFocus/);
  assert.match(source, /getBoundingClientRect/); assert.match(source, /ResizeObserver/);
  assert.match(source, /visualViewport\?\.addEventListener\("scroll"/); assert.match(source, /addEventListener\("scroll", onScroll/);
  assert.doesNotMatch(source, /socialMenuOpen|social-request-lift|request\.style|request\.offsetHeight/);
});

test('glass styling includes readable opaque fallback, proper transform origin, touch targets and reduced motion', async () => {
  const css = await readFile(new URL('../components/social-links.module.css', import.meta.url), 'utf8');
  assert.match(css, /background: #f7f0e3/); assert.match(css, /backdrop-filter: blur\(24px\)/);
  assert.match(css, /transform-origin: var\(--radix-popover-content-transform-origin\)/);
  assert.match(css, /translateX\(12px\)/); assert.match(css, /min-height: 44px/);
  assert.match(css, /overflow-y: auto/); assert.match(css, /prefers-reduced-motion: reduce/); assert.match(css, /prefers-reduced-transparency: reduce/);
});

test('a safe previous social location stays stable when lower content changes',()=>{const base={viewport,button,obstacles:[]};const previous={left:322,top:500};assert.equal(chooseSocialPosition({...base,previous}).top,500);assert.equal(chooseSocialPosition({...base,previous,obstacles:[{left:300,right:390,top:700,bottom:780}]}).top,500);const next=chooseSocialPosition({...base,previous,obstacles:[{left:300,right:390,top:490,bottom:570}]});assert.ok(next.top+56<=480||next.top>=580);});
test('scroll bursts hold placement and schedule one settled measurement; unmount cancels pending work',()=>{let now=0,id=0,calls=0;const timers=new Map(),frames=new Map();const scheduler=createSocialLayoutScheduler({measure:()=>calls++,setTimer:(fn,ms)=>{timers.set(++id,{at:now+ms,fn});return id;},clearTimer:id=>timers.delete(id),requestFrame:fn=>{frames.set(++id,fn);return id;},cancelFrame:id=>frames.delete(id)});const flush=()=>{for(const [id,fn]of frames){frames.delete(id);fn();}};scheduler.schedule();flush();assert.equal(calls,1);for(let i=0;i<10;i++){now+=16;scheduler.onScroll();scheduler.schedule();flush();}assert.equal(calls,1);assert.equal(timers.size,1);now+=160;for(const [id,t]of timers){if(t.at<=now){timers.delete(id);t.fn();}}flush();assert.equal(calls,2);scheduler.onScroll();scheduler.stop();assert.equal(timers.size,0);assert.equal(frames.size,0);});
