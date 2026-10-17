import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import postcss from 'postcss';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const [css,ui,layout,home]=await Promise.all(['app/globals.css','components/mobile-public-actions.tsx','app/layout.tsx','components/home-page-content.tsx'].map(read));
test('two mobile controls consolidate existing actions without substituting seller contact',()=>{
 assert.match(ui,/https:\/\/wa.me\/584264263601\?text=/);
 assert.match(ui,/Hola, quisiera información sobre Venezuela Agro/);
 assert.equal((ui.match(/className="mobile-public-action"/g)||[]).length,2);
 for(const token of ['Compartir mi idea','Presentar mi proyecto','Instalar o añadir aplicación','OFFICIAL_SOCIAL_LINKS.map','requestInstallAction()'])assert.ok(ui.includes(token));
 assert.match(ui,/\.idea-orb/);assert.match(ui,/\/proyectos#presentar-proyecto/);
 assert.match(layout,/<MobilePublicActions \/>/);
 assert.match(css,/body:has\(\[data-mobile-public-actions\]\) \.glass-action-orb \{ display: none !important/);
});
test('popover delegates Escape/outside dismissal to Radix and explicitly restores focus',()=>{
 assert.match(ui,/Popover.Root open=\{open\} onOpenChange=\{setOpen\}/);
 assert.match(ui,/aria-expanded=\{open\}/);
 assert.match(ui,/aria-labelledby=\{titleId\}/);
 assert.match(ui,/firstAction.current\?\.focus\(\)/);
 assert.match(ui,/onCloseAutoFocus/);assert.match(ui,/trigger.current\?\.focus\(\)/);
 for(const route of ['/admin','/juego-finca','/finca-demo','/finca-modelo'])assert.ok(ui.includes(route));
 assert.match(css,/\[data-masterplan-immersive\]/);
 assert.match(css,/input:focus, textarea:focus, select:focus/);
});
test('hero preserves complete CMS wording and only mobile receives typography overrides',()=>{
 assert.match(home,/\{content.heroTitle\}<span[^>]*>\{content.heroSubtitle\}<\/span>/);
 const additions=css.slice(css.indexOf('/* Mobile reading:'));
 assert.match(additions,/height: auto; max-height: none; overflow: visible/);
 assert.match(additions,/white-space: normal; word-break: normal; overflow-wrap: break-word/);
 assert.match(additions,/line-height: 1.2/);
 postcss.parse(additions).walkRules(rule=>{if(rule.selector.includes('.home-hero'))assert.ok(rule.parent.params?.includes('max-width:767px'));});
 assert.doesNotMatch(additions,/line-clamp|text-overflow:\s*ellipsis/);
});
test('compact labeled targets fit safe areas at 320/390/430 and avoid title/CTA intersections',()=>{
 for(const width of [320,390,430])for(const inset of [12,34,44]){
  const barWidth=Math.min(228,width-inset*2);const left=width-inset-barWidth;assert.ok(left>=inset);assert.ok(48>=44);
  for(const height of [320,480,568,844,932])assert.ok(height-inset-48>=0);
 }
 assert.match(ui,/#home-title, \.home-hero \.button-primary, \.home-hero \.button-glass/);
 assert.match(ui,/data-content-overlap=\{contentOverlap&&!open\}/);
 assert.match(ui,/ResizeObserver/);assert.match(ui,/cancelAnimationFrame\(frame\)/);
 assert.match(css,/padding-bottom: calc\(5.5rem \+ env\(safe-area-inset-bottom\)\)/);
});

test('closing installation returns keyboard focus to the visible mobile More control',async()=>{
 const install=await read('components/install-app-banner.tsx');
 assert.match(ui,/data-mobile-more/);
 assert.match(install,/mobileMore \?\? orbRef.current/);
 assert.doesNotMatch(install,/const mobileMore = window.matchMedia/);
});

test('desktop and mobile use the same two-control dock, menu and hero collision checks',()=>{
 const root=postcss.parse(css);const rules=[];root.walkRules(rule=>rules.push(rule));
 for(const selector of ['.mobile-public-actions','.mobile-public-action','.mobile-public-menu','body:has([data-mobile-public-actions]) .glass-action-orb']){
  const rule=rules.find(rule=>rule.selector===selector&&rule.parent.type==='root');assert.ok(rule,selector);
 }
 assert.doesNotMatch(ui,/min-width:768px|max-width:767px/);
 for(const width of [320,390,430,1280,1440])for(const inset of [12,34,44]){
  const barWidth=Math.min(228,width-inset*2);const left=width-inset-barWidth;assert.ok(left>=inset);assert.ok(left+barWidth<=width-inset);
 }
});

test('branded action hierarchy uses readable labels, solid contrast and compact 48px targets',()=>{
 assert.match(ui,/data-action-tone="primary"/);assert.match(ui,/data-action-tone="secondary"/);
 assert.match(ui,/<span>WhatsApp<\/span>/);assert.match(ui,/<span>Explorar<\/span>/);
 assert.match(css,/font-size: 12px; font-weight: 750/);
 assert.match(css,/min-height: 48px; padding: 10px 12px/);
 assert.match(css,/\.mobile-public-action\[data-action-tone="primary"\] \{ background: #365026; color: #fff/);
 const luminance=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 assert.ok(1.05/(luminance([54,80,38])+.05)>4.5);
 assert.ok((luminance([232,239,223])+.05)/(luminance([54,80,38])+.05)>4.5);
});
