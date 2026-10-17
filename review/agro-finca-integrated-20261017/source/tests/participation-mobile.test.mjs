import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');

test('mobile contribution shortcuts keep fixed circular geometry along the lower edge at every scroll position', async () => {
  const css = await read('app/globals.css');
  const mobile = css.slice(css.indexOf('/* Public contribution shortcuts'), css.indexOf('/* Keep phone map gestures'));
  assert.match(css, /\.glass-action-orb \{ position:fixed/);
  assert.match(mobile, /@media \(max-width: 767px\)/);
  assert.match(mobile, /width: 48px; height: 48px; min-width: 44px; min-height: 44px/);
  assert.match(mobile, /env\(safe-area-inset-bottom\)/);
  assert.match(mobile, /safe-area-inset-right\)\) \+ 120px/);
  assert.doesNotMatch(mobile, /position: static|position: relative/);
  assert.match(mobile, /idea-orb-waiting \{ visibility: visible; pointer-events: auto/);
  assert.match(mobile, /body:has\(\[role="dialog"\]\[data-state="open"\]/);
  assert.match(mobile, /input:focus, textarea:focus, select:focus/);
  assert.match(mobile, /visibility: hidden; pointer-events: none/);
});
test('both contribution actions remain reachable from the mobile navigation without losing the idea dialog', async () => {
  const header = await read('components/site-header.tsx');
  const invitation = await read('components/idea-invitation.tsx');
  assert.match(header, /href="#participar" onClick=\{\(\) => setMenuOpen\(false\)\}/);
  assert.match(invitation, /id="participar" className="participation-actions"/);
  assert.match(invitation, /<Dialog.Trigger asChild>/);
  assert.match(invitation, /href="\/proyectos#presentar-proyecto"/);
  assert.match(invitation, /source && target && !window.matchMedia\("\(max-width: 767px\)"\).matches/);
  assert.match(invitation, /triggerRef.current\?\.focus\(\{ preventScroll: true \}\)/);
});
