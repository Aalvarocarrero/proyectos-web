import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import postcss from 'postcss';
const css=await readFile(new URL('../app/globals.css',import.meta.url),'utf8');
// Approved production 995d205 closed-control rules, excluding media queries.
const approvedDesktopHash='03e85765d99e2d10df779d310ba1d2604ac1f77694416a5d09d6d8b114ac2bce';
const desktopFamily = source => { const result=[]; postcss.parse(source).walkRules(rule=>{if(rule.parent.type==='root'&&rule.selector.startsWith('.glass-action-orb'))result.push(rule.toString());});return result; };
test('approved desktop closed controls remain byte-for-byte unchanged',()=>assert.equal(createHash('sha256').update(JSON.stringify(desktopFamily(css))).digest('hex'),approvedDesktopHash));
test('mobile targets and social clearance fit 320, 390 and 430px including safe-area edges',()=>{
 for(const width of [320,390,430])for(const safe of [12,34,44]){
  const app={left:safe,right:safe+48};
  const project={left:width-safe-120-48,right:width-safe-120};
  const idea={left:width-safe-60-48,right:width-safe-60};
  const social={left:width-safe-48,right:width-safe};
  assert.ok(app.right<=project.left);
  assert.ok(idea.left-project.right>=12);
  assert.ok(social.left-idea.right>=12);
  assert.ok(social.right<=width-safe);
  for(const height of [568,844,932])assert.ok(height-safe-48>height*.7);
 }
 assert.match(css,/top: auto; bottom: max\(12px, env\(safe-area-inset-bottom\)\)/);
 assert.match(css,/\.glass-action-orb > span \{ padding: 0; background: transparent/);
 assert.match(css,/\.glass-action-orb > svg \{ width: 18px; height: 18px; background: transparent/);
});
test('opened surfaces share readable material while form content and focus are retained',async()=>{
 assert.match(css,/\.idea-invitation-dialog, \.install-banner, \[data-social-panel\]\[data-slot="popover-content"\] \{\s+background: var\(--agro-panel-surface\); color: var\(--agro-panel-ink\)/);
 assert.match(css,/--agro-panel-surface: rgba\(247,243,236,\.96\)/);
 assert.match(css,/\.install-banner :focus-visible \{ outline: 3px solid #4c6b3a/);
 const idea=await readFile(new URL('../components/idea-invitation.tsx',import.meta.url),'utf8');
 assert.match(idea,/<form onSubmit=\{submit\}/);
 assert.match(idea,/onOpenAutoFocus/);
 assert.match(idea,/onCloseAutoFocus/);
});
