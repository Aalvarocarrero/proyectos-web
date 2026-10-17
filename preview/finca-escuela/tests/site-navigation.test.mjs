import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {primaryNavigation,desktopNavigation,navigationGroups}=await vite.ssrLoadModule('/lib/site-navigation.ts');
const read=path=>readFile(root+path,'utf8');
test('primary tasks prioritize farm, market, professionals, learning and community',()=>{
 assert.deepEqual(primaryNavigation.map(([,href])=>href),['/app','/marketplace','/profesionales','/aprende','/red']);
 assert.deepEqual(desktopNavigation.map(([,href])=>href),['/marketplace','/profesionales','/aprende','/red']);
 assert.ok(!desktopNavigation.some(([,href])=>href==='/app'));
});
test('purpose groups preserve every prior destination without duplicating menu routes',()=>{
 const routes=[...primaryNavigation,...navigationGroups.flatMap(group=>group.links)].map(([,href])=>href);
 assert.equal(new Set(routes).size,routes.length);
 assert.deepEqual([...routes].sort(),['/app','/#produccion','/tienda','/fincas','/red','/marketplace','/aprende','/stickers','/biblioteca-local','/guia-institucional','/profesionales','/empresas','/proyectos','/nosotros'].sort());
 assert.equal(navigationGroups.length,3);
 assert.ok(navigationGroups.every(group=>group.label&&group.links.length));
});
test('keyboard-expandable menu preserves gated account, accessibility and social controls',async()=>{
 const header=await read('components/site-header.tsx'),accessibility=await read('components/accessibility-menu.tsx'),session=await read('components/session-menu.tsx');
 assert.match(header,/<details key=\{group.label\}/);assert.match(header,/<summary className="[^"]*min-h-11/);assert.match(header,/primaryNavigation.map/);assert.match(header,/navigationGroups.map/);
 assert.match(header,/<AccessibilityMenu variant="menu"/);assert.match(accessibility,/Accesibilidad/);assert.match(accessibility,/z-\[130\]/);
 assert.match(header,/<SessionMenu onNavigate=/);assert.match(header,/OFFICIAL_SOCIAL_LINKS.map/);assert.match(session,/session.canAdmin && <Link href="\/admin"/);assert.match(session,/Cancelar y seguir aquí/);
 assert.match(header,/max-h-\[var\(--radix-popover-content-available-height\)\]/);assert.match(header,/overflow-y-auto/);
 const toolbar=header.slice(header.indexOf('<header'),header.indexOf('<Popover open='));
 assert.equal((toolbar.match(/href="\/app"/g)||[]).length,1);
});
