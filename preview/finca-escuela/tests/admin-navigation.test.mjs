import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({root,configFile:false,appType:'custom',resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(()=>vite.close());
const {AdminNavigation,adminSections}=await vite.ssrLoadModule('/components/admin-navigation.tsx');
const read=path=>readFile(root+path,'utf8');

test('authorized admin header renders explicit home and logout controls before any client fetch',()=>{
 const html=renderToStaticMarkup(React.createElement(AdminNavigation,{email:'admin@example.invalid',session:{owner:'synthetic-admin',canAdmin:true,signOutPath:'/signout-with-chatgpt?return_to=%2F'}}));
 assert.match(html,/Volver al sitio/);assert.match(html,/Cerrar sesión/);assert.match(html,/href="\/"/);
 assert.match(html,/admin@example.invalid/);assert.match(html,/aria-haspopup="dialog"/);
 assert.match(html,/sticky top-0/);assert.match(html,/grid-cols-2/);assert.match(html,/overflow-x-auto/);
 assert.doesNotMatch(html,/href="\/signout/,'logout must require a review before exposing the final sign-out action');
 assert.match(html,/aria-label="Secciones de administración"/);
 for(const [id,label] of adminSections){assert.ok(html.includes(`href="#${id}"`));assert.ok(html.includes(label));}
});

test('each shortcut targets an offset section and headings wrap at narrow widths',async()=>{
 const dashboard=await read('components/admin-dashboard.tsx'),page=await read('app/admin/page.tsx');
 assert.equal(new Set(adminSections.map(([id])=>id)).size,adminSections.length);
 for(const [id] of adminSections){
  if(['public-farm','social-post','social-comment'].includes(id)){assert.ok(dashboard.includes(`"${id}"`));assert.match(dashboard,/id=\{kind\}/);}
  else assert.ok((dashboard+page).includes(`id="${id}"`),`Missing anchor ${id}`);
 }
 assert.match(dashboard,/scroll-mt-56/);assert.match(page,/scroll-mt-56/);
 assert.match(dashboard,/flex flex-wrap items-end/);assert.match(dashboard,/text-3xl sm:text-4xl/);
 assert.match(page,/if \(!isAdminIdentity\(user\)\) return/);
 assert.match(page,/owner: user.id/);assert.match(page,/chatGPTSignOutPath\("\/"\)/);
});

test('admin signout reuses offline safety and a cancellable focus-managed dialog',async()=>{
 const menu=await read('components/session-menu.tsx');
 assert.match(menu,/variant === "admin"/);assert.match(menu,/<Dialog open=\{ready\} onOpenChange=\{setReady\}/);
 assert.match(menu,/getPendingCount\(session.owner\)/);assert.match(menu,/getPendingCount\("device-local"\)/);
 assert.match(menu,/if \(!navigator.onLine\)/);assert.match(menu,/prepareOfflineSignOut\(\)/);
 assert.match(menu,/Cancelar y seguir aquí/);assert.match(menu,/if \(initialSession && isSession\(initialSession\)\) return/);
 assert.doesNotMatch(menu,/deleteDatabase|localStorage.clear|syncNow/);
});

test('only public promotional overlays are suppressed on admin, while connection and account services remain',async()=>{
 const boundary=await read('components/public-workspace-controls.tsx'),layout=await read('app/layout.tsx'),services=await read('components/account-services.tsx');
 assert.match(boundary,/pathname === "\/admin" \|\| pathname.startsWith\("\/admin\/"\)/);
 assert.match(layout,/<PublicWorkspaceControls>\s*<InstallAppBanner \/>\s*<SocialFloatingMenu \/>\s*<\/PublicWorkspaceControls>/);
 assert.doesNotMatch(layout,/<ConnectionIndicator/);
 assert.match(await read('components/admin-navigation.tsx'),/<ConnectionIndicator \/>/);
 assert.match(services,/<OfflineSyncManager\/><OfflineWorkspaceGate\/><PublicWorkspaceControls><IdeaInvitation\/><\/PublicWorkspaceControls>/);
});
