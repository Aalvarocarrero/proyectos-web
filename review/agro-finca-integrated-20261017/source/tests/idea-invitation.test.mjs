import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({
  appType: 'custom', configFile: false, root, cacheDir: `${root}/.test-vite-cache`,
  resolve: { alias: { '@': root } },
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
});
after(async () => { await vite.close(); });
const idea = await vite.ssrLoadModule('/lib/idea-invitation.ts');
const photo = (await vite.ssrLoadModule('/lib/idea-invitation-photo.ts')).ideaInvitationPhoto;
const {scheduleIdeaInvitation}=await vite.ssrLoadModule('/lib/idea-invitation-scheduler.ts');
const now = Date.parse('2026-10-07T12:00:00Z');

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
}

test('first invitation is eligible; exactly seven days must pass before it repeats', () => {
  assert.equal(idea.isIdeaInvitationDue(null, now), true);
  assert.equal(idea.isIdeaInvitationDue(String(now), now), false);
  assert.equal(idea.isIdeaInvitationDue(String(now), now + idea.IDEA_INVITATION_INTERVAL_MS - 1), false);
  assert.equal(idea.isIdeaInvitationDue(String(now), now + idea.IDEA_INVITATION_INTERVAL_MS), true);
  assert.equal(idea.isIdeaInvitationDue(String(now + 60_000), now), false, 'backwards clock must not repeat a popup');
});

test('corrupt frequency records recover, while invalid current time cannot claim an invitation', () => {
  for (const invalid of ['', 'invalid', '-1', 'Infinity', 'NaN']) assert.equal(idea.isIdeaInvitationDue(invalid, now), true);
  for (const invalid of [NaN, Infinity, 0, -1]) assert.equal(idea.isIdeaInvitationDue(null, invalid), false);
});

test('a durable claim suppresses automatic repeats, including after a simulated reload', () => {
  const local = storage();
  assert.equal(idea.claimIdeaInvitation(local, now), true);
  assert.equal(local.getItem(idea.IDEA_INVITATION_SEEN_KEY), String(now));
  assert.equal(idea.claimIdeaInvitation(local, now + 30_000), false);
  const reopened = storage(Object.fromEntries(local.values));
  assert.equal(idea.claimIdeaInvitation(reopened, now + 86_400_000), false);
  assert.equal(idea.claimIdeaInvitation(reopened, now + idea.IDEA_INVITATION_INTERVAL_MS), true);
});

test('opening manually also starts the quiet period and stores only a timestamp', () => {
  const local = storage();
  idea.markIdeaInvitationSeen(local, now);
  assert.deepEqual([...local.values], [[idea.IDEA_INVITATION_SEEN_KEY, String(now)]]);
  assert.equal(idea.claimIdeaInvitation(local, now + 1), false);
});

test('unavailable, quota-exceeded, or silently failing storage suppresses automatic opening safely', () => {
  const denied = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('SecurityError'); } };
  const full = { getItem() { return null; }, setItem() { throw new Error('QuotaExceededError'); } };
  const ignored = { getItem() { return null; }, setItem() {} };
  for (const local of [denied, full, ignored]) {
    assert.equal(idea.claimIdeaInvitation(local, now), false);
    assert.doesNotThrow(() => idea.markIdeaInvitationSeen(local, now));
  }
});

test('minimal feedback uses the existing backend schema and does not invent a visitor role', () => {
  const result = idea.validateIdeaFields('  Necesito registrar mis cosechas.  ', '  agricultor@example.invalid  ');
  assert.equal(result.ok, true);
  assert.deepEqual(result.payload, { area: 'Otro', role: 'Persona interesada', message: 'Necesito registrar mis cosechas.', contact: 'agricultor@example.invalid' });
  assert.equal(idea.validateIdeaFields('1234567890', '').ok, true);
  assert.equal(idea.validateIdeaFields('a'.repeat(1500), 'b'.repeat(180)).ok, true);
});

test('message limits and optional contact limits match server validation after trimming', () => {
  for (const message of ['', '          ', '123456789', '  123456789  ', 'a'.repeat(1501)]) {
    const result = idea.validateIdeaFields(message, '');
    assert.equal(result.ok, false);
    assert.ok(result.errors.message);
  }
  assert.equal(idea.validateIdeaFields('  1234567890  ', '').ok, true);
  const overlong = idea.validateIdeaFields('1234567890', 'b'.repeat(181));
  assert.equal(overlong.ok, false);
  assert.ok(overlong.errors.contact);
});

test('only exact-operation confirmed state can say the idea was received', () => {
  assert.match(idea.ideaReceiptText({ state: 'confirmed' }), /^Idea recibida\./);
  for (const state of ['pending', 'blocked', 'unknown']) assert.doesNotMatch(idea.ideaReceiptText({ state }), /^Idea recibida\./);
  assert.match(idea.ideaReceiptText({ state: 'pending' }), /pendiente de envío/);
  assert.match(idea.ideaReceiptText({ state: 'blocked' }), /no la aceptó/);
  assert.match(idea.ideaReceiptText({ state: 'unknown' }), /No tenemos confirmación/);
});

test('the approved invitation wording is preserved exactly', () => {
  assert.equal([idea.IDEA_INVITATION_COPY.title, idea.IDEA_INVITATION_COPY.emphasis, idea.IDEA_INVITATION_COPY.invitation, idea.IDEA_INVITATION_COPY.together].join(' '), 'Tu experiencia puede mejorar el agro venezolano. Cada productor cuenta. Comparte qué necesitas o qué idea te gustaría ver en Venezuela Agro. Juntos podemos construir mejores herramientas para el campo.');
  assert.equal(idea.IDEA_INVITATION_COPY.button, 'Compartir mi idea');
  assert.ok(idea.IDEA_INVITATION_DELAY_MS > 0 && idea.IDEA_INVITATION_DELAY_MS <= 1000, "brief handoff after install animation");
});

test('the image is an available licensed derivative with documented attribution', async () => {
  assert.equal(photo.author, 'Wilfredor');
  assert.equal(photo.license, 'CC BY-SA 3.0');
  assert.match(photo.source, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:Campesino_/);
  assert.match(photo.changes, /Sin cambios de tono/);
  const asset = await readFile(new URL(`../public${photo.src}`, import.meta.url));
  assert.equal(asset.subarray(0, 4).toString(), 'RIFF');
  assert.equal(asset.subarray(8, 12).toString(), 'WEBP');
  assert.ok(asset.length < 150_000, 'the invitation image remains lightweight');
});

test('component contract retains text, allows explicit dismissal, and never trusts batch success', async () => {
  const source = await readFile(new URL('../components/idea-invitation.tsx', import.meta.url), 'utf8');
  assert.match(source, /<Dialog\.Root open=\{open\} onOpenChange=\{changeOpen\}/);
  assert.match(source, /<Dialog\.Close asChild>/);
  assert.match(source, /Cerrar invitación; se conserva lo escrito/);
  assert.match(source, /onCloseAutoFocus/);
  assert.match(source, /getOperationStatus\(operation\.id\)/);
  assert.doesNotMatch(source, /result\.ok|formElement\.reset|setOpen\(false\)/);
  assert.match(source, /pathname !== "\/"/);
  assert.match(source, /motion-reduce:animate-none/);
  assert.match(source, /value=\{message\}/);
  assert.match(source, /value=\{contact\}/);
});

function invitationClock(){let sequence=0;const timers=new Map();return {timers,setTimer(callback,delay){const id=++sequence;timers.set(id,{callback,delay});return id;},clearTimer(id){timers.delete(id);},tick(){const [id,item]=timers.entries().next().value;timers.delete(id);item.callback();return item.delay;}};}
test('temporary installation interaction or hidden tab defers invitation then opens after interruption ends',()=>{
 const clock=invitationClock();let blocked=true,claims=0,opens=0;
 scheduleIdeaInvitation({...clock,delayMs:9000,isBlocked:()=>blocked,claim:()=>{claims++;return true;},open:()=>opens++});
 assert.equal(clock.tick(),9000);assert.equal(claims,0);assert.equal(opens,0);assert.equal(clock.timers.size,1);
 blocked=false;assert.equal(clock.tick(),2000);assert.equal(opens,1);assert.equal(claims,1);assert.equal(clock.timers.size,0);
});
test('prior dismissal and unavailable storage stop automatic retries; cleanup never opens later',()=>{
 for(const eligible of [false,true]){const clock=invitationClock();let opens=0;
 const stop=scheduleIdeaInvitation({...clock,delayMs:9000,isBlocked:()=>false,claim:()=>eligible,open:()=>opens++});
 if(eligible){stop();assert.equal(clock.timers.size,0);}else{clock.tick();assert.equal(clock.timers.size,0);}assert.equal(opens,0);}
});
test('ideas wait for completed installation introduction and retain a top-right manual orb',async()=>{
 const source=await readFile(new URL('../components/idea-invitation.tsx',import.meta.url),'utf8');
 const css=await readFile(new URL('../app/globals.css',import.meta.url),'utf8');
 const layout=await readFile(new URL('../app/layout.tsx',import.meta.url),'utf8');
 assert.match(source,/if\(!introComplete\)return/);
 assert.match(source,/addEventListener\("venezuela-agro:install-intro-complete"/);
 assert.match(source,/if\(!next\)setShowOrb\(true\)/);
 assert.match(source,/aria-label="Compartir mi idea"/);
 assert.match(source,/idea-orb glass-action-orb/);
 assert.doesNotMatch(source,/feedback-trigger fixed bottom/);
 assert.match(css,/\.idea-orb \{ top:/);assert.match(css,/\.application-orb \{ bottom:/);
 assert.match(layout,/<SocialFloatingMenu/);
 assert.match(source,/min-h-0 overflow-y-auto/);assert.match(source,/visualViewport/);
 assert.match(source,/removeEventListener\("resize",update\)/);
});

test('five-second idea auto-minimize only applies to untouched automatic invitation, never form or manual reopening',async()=>{
 const source=await readFile(new URL('../components/idea-invitation.tsx',import.meta.url),'utf8');
 assert.match(source,/stage!=="invitation"\|\|!autoDismissAllowed.current\|\|invitationTouched.current/);
 assert.match(source,/autoDismissAllowed.current=false;invitationTouched.current=true/);
 assert.match(source,/onPointerDownCapture=\{stopPassiveCountdown\}/);
 assert.match(source,/onKeyDownCapture=\{stopPassiveCountdown\}/);
 assert.match(source,/passiveCountdown.current\?\.cancel\(\)/);
 assert.match(source,/document.hidden\)countdown.pause\(\)/);
});

test('new visits can see ideas once while reloads, internal navigation and manual closure stay quiet in the session',()=>{const session=storage();assert.equal(idea.claimIdeaVisit(session),true);assert.equal(idea.claimIdeaVisit(session),false);const nextVisit=storage();assert.equal(idea.claimIdeaVisit(nextVisit),true);const manuallyOpened=storage();idea.markIdeaVisit(manuallyOpened);assert.equal(idea.claimIdeaVisit(manuallyOpened),false);});
test('live invitation reads session frequency and does not delete old browser choices',async()=>{const source=await readFile(new URL('../components/idea-invitation.tsx',import.meta.url),'utf8');assert.match(source,/claimIdeaVisit\(window.sessionStorage\)/);assert.match(source,/markIdeaVisit\(window.sessionStorage\)/);assert.doesNotMatch(source,/claimIdeaInvitation\(window.localStorage|removeItem|localStorage.clear/);});
