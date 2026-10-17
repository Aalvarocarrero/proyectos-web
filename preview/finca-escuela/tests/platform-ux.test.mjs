import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},plugins:[{
 name:'community-interaction-harness',enforce:'pre',transform(code,id){
  if(!id.includes('/components/agro-network.tsx?ux-state'))return;
  return code.replace("import {FormEvent,useEffect,useState,useRef,useSyncExternalStore} from 'react';", "import type {FormEvent} from 'react'; const {useEffect,useState,useRef,useSyncExternalStore}=globalThis.__uxHooks;")
   .replace('import { useOfflineSnapshot } from "@/hooks/use-offline-snapshot";', 'const useOfflineSnapshot=(initial)=>initial;');
 }
}],server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(async()=>{await vite.close();delete globalThis.__uxHooks;});
const {demoPublicFarms,demoPosts}=await vite.ssrLoadModule('/lib/network-profile.ts');
const {filterPublicFarms}=await vite.ssrLoadModule('/lib/network-search.ts');
const render=(Component,props={})=>renderToStaticMarkup(React.createElement(Component,props));
const nodes=value=>!value||typeof value!=='object'?[]:Array.isArray(value)?value.flatMap(nodes):[value,...nodes(value.props?.children)];
const text=value=>value==null||typeof value==='boolean'?'':typeof value==='string'||typeof value==='number'?String(value):Array.isArray(value)?value.map(text).join(''):text(value.props?.children);
let state=[],cursor=0,online=true;
globalThis.__uxHooks={useEffect(){},useRef:initial=>({current:initial}),useSyncExternalStore:()=>online,useState(initial){const index=cursor++;if(!(index in state))state[index]=initial;return[state[index],value=>{state[index]=typeof value==='function'?value(state[index]):value;}];}};
const {AgroNetwork:InteractiveNetwork}=await vite.ssrLoadModule('/components/agro-network.tsx?ux-state');
const initial={farms:demoPublicFarms,mine:[],posts:demoPosts};
function mount(props={}){state=[];online=true;return()=>{cursor=0;return InteractiveNetwork({initial,...props});};}
function search(tree){return nodes(tree).find(n=>n.props?.type==='search');}
function button(tree,label){return nodes(tree).find(n=>n.type==='button'&&text(n)===label);}

test('farm search tolerates accents, case and outer whitespace and includes activities',()=>{
 assert.deepEqual(filterPublicFarms(demoPublicFarms,'  CAFE  ','').map(f=>f.id),filterPublicFarms(demoPublicFarms,'café','').map(f=>f.id));
 assert.ok(filterPublicFarms(demoPublicFarms,'capacitaciones','').length>0);
 assert.equal(filterPublicFarms(demoPublicFarms,'zzz-no-coincide','').length,0);
 assert.equal(filterPublicFarms(demoPublicFarms,'','Mérida').every(f=>f.state==='Mérida'),true);
 assert.equal(filterPublicFarms(demoPublicFarms,'   ','').length,demoPublicFarms.length);
});
test('unmatched farm search has a recovery state and clears both filters without altering data',()=>{
 const draw=mount({directory:true});let tree=draw();search(tree).props.onChange({target:{value:'zzz-no-coincide'}});
 const select=nodes(tree).find(n=>n.type==='select');select.props.onChange({target:{value:'Mérida'}});tree=draw();
 const empty=nodes(tree).find(n=>n.type?.name==='NetworkEmptyState');assert.equal(empty.props.filtered,true);assert.equal(empty.props.directory,true);
 assert.match(text(tree),/0 fincas publicadas · 0 ejemplos que coinciden/);
 let focused=false;search(tree).props.ref.current={focus:()=>{focused=true;}};
 button(tree,'Limpiar filtros').props.onClick();tree=draw();assert.equal(search(tree).props.value,'');assert.equal(nodes(tree).find(n=>n.type==='select').props.value,'');assert.equal(focused,true);
 assert.ok(nodes(tree).some(n=>n.type?.name==='FarmCard'));assert.equal(initial.farms.length,demoPublicFarms.length);
});
test('community empty search uses the same reset without discarding a typed post',()=>{
 const draw=mount({userId:'qa-only',initial:{...initial,mine:[{...demoPublicFarms[0],status:'active'}]}});let tree=draw();nodes(tree).find(n=>n.props?.name==='text').props.onChange({target:{value:'Borrador que debe conservarse'}});search(tree).props.onChange({target:{value:'zzz-no-coincide'}});tree=draw();
 assert.ok(nodes(tree).some(n=>n.type?.name==='NetworkEmptyState'));button(tree,'Limpiar filtros').props.onClick();tree=draw();assert.equal(nodes(tree).find(n=>n.props?.name==='text').props.value,'Borrador que debe conservarse');
});
test('offline refresh is unavailable and explains the local-only results',()=>{
 const draw=mount({directory:true});online=false;const tree=draw();const refresh=button(tree,'Actualizar');assert.equal(refresh.props.disabled,true);assert.equal(refresh.props['aria-describedby'],'network-offline-help');assert.match(text(tree),/actualizar requiere internet/);
});
test('community fields retain labels and review instructions after typing',async()=>{
 const {AgroNetwork}=await vite.ssrLoadModule('/components/agro-network.tsx');
 const farm={...demoPublicFarms[0],demo:false,id:'qa-farm',status:'active'};
 const post={...demoPosts[0],demo:false,id:'qa-post',farmId: farm.id};
 const html=render(AgroNetwork,{initial:{farms:[farm],mine:[farm],posts:[post]},userId:'qa-only'});
 assert.match(html,/<label[^>]*>Tu novedad \*<textarea[^>]*aria-describedby="community-post-help"/);
 assert.match(html,/<label[^>]*>Tu comentario \*<textarea[^>]*aria-describedby="comment-help-qa-post"/);
 assert.match(html,/Entre 3 y 500 caracteres/);assert.match(html,/Entre 2 y 500 caracteres/);
});
test('empty states offer reset only when filters are active',async()=>{
 const {NetworkEmptyState}=await vite.ssrLoadModule('/components/agro-network.tsx');
 assert.match(render(NetworkEmptyState,{directory:true,filtered:true,onReset(){}}),/No encontramos fincas.*Ver todo/);
 const html=render(NetworkEmptyState,{filtered:false,onReset(){}});assert.match(html,/Todavía no hay publicaciones disponibles/);assert.doesNotMatch(html,/<button/);
});
test('comment shortcut opens and focuses its conversation without creating data',()=>{
 const draw=mount();const tree=draw();const shortcut=nodes(tree).find(n=>n.type==='a'&&n.props?.href?.startsWith('#comentarios-'));
 const previous={document:Object.getOwnPropertyDescriptor(globalThis,'document'),HTMLDetailsElement:Object.getOwnPropertyDescriptor(globalThis,'HTMLDetailsElement')};
 let focused=false,scrolled=false,prevented=false;class Details{open=false;scrollIntoView(){scrolled=true;}querySelector(){return{focus(){focused=true;}};}}const details=new Details();
 Object.defineProperty(globalThis,'HTMLDetailsElement',{value:Details,configurable:true});Object.defineProperty(globalThis,'document',{value:{getElementById:id=>id.startsWith('comentarios-')?details:null},configurable:true});
 try{shortcut.props.onClick({metaKey:true});assert.equal(details.open,false);shortcut.props.onClick({preventDefault(){prevented=true;}});assert.equal(details.open,true);assert.equal(focused,true);assert.equal(scrolled,true);assert.equal(prevented,true);}finally{for(const[key,descriptor]of Object.entries(previous)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
test('sidebar controls use Spanish expanded-state labels and touch-sized targets',async()=>{
 const {SidebarProvider,SidebarTrigger}=await vite.ssrLoadModule('/components/ui/sidebar.tsx');
 for(const open of [true,false]){const html=render(SidebarProvider,{defaultOpen:open,children:React.createElement(SidebarTrigger)});assert.match(html,new RegExp(`aria-expanded="${open}"`));assert.match(html,open?/Cerrar menú de Mi Finca/:/Abrir menú de Mi Finca/);assert.match(html,/size-11/);assert.doesNotMatch(html,/Toggle Sidebar/);}
});
test('learning and professional card actions are specific and the dashboard marks its current view',async()=>{
 const learn=await readFile(`${root}/components/learning-catalog.tsx`,'utf8');assert.match(learn,/className="inline-flex min-h-11[^"\n]*" aria-label=\{`Ver paso a paso: \$\{article.title\}`\}/);
 const professional=await readFile(`${root}/components/professional-directory.tsx`,'utf8');assert.match(professional,/aria-label=\{`Ver perfil completo de \$\{p.name\}`\}/);
 const dashboard=await readFile(`${root}/components/farm-dashboard.tsx`,'utf8');assert.match(dashboard,/aria-current=\{view === item.view \? "page" : undefined\}/);assert.match(dashboard,/<SidebarTrigger className="h-11 w-11/);
 const recovery=await readFile(`${root}/app/profesionales/page.tsx`,'utf8');assert.match(recovery,/<a href="\/profesionales"[^>]*>Volver a intentar<\/a>/);
});

test('new community participants get the prerequisite action instead of an unusable empty composer',()=>{
 for(const mine of [[],[{...demoPublicFarms[0],status:'pending'}]]){const draw=mount({userId:'qa-only',initial:{...initial,mine}});const tree=draw();assert.equal(nodes(tree).some(n=>n.props?.name==='text'),false);assert.match(text(tree),/Tu finca es el primer paso/);assert.match(text(tree),mine.length?/Revisar mi ficha/:/Presentar mi finca/);assert.ok(nodes(tree).some(n=>n.props?.href==='/fincas#registrar-finca'));}
});

test('guide actions keep their destination context and ignore unrecognized workspace views',async()=>{
 const {farmDashboardViewFromSearch,farmDashboardViews}=await vite.ssrLoadModule('/lib/farm-dashboard-navigation.ts');
 for(const view of farmDashboardViews)assert.equal(farmDashboardViewFromSearch('?vista='+view),view);
 for(const query of ['', '?vista=admin', '?vista=https://otro.test', '?vista=ANIMALS'])assert.equal(farmDashboardViewFromSearch(query),'land');
 const {platformGuides}=await vite.ssrLoadModule('/lib/platform-guides.ts');
 for(const [slug,path]of [['registrar-animales-pesajes','/app?vista=animals'],['trabajar-sin-internet','/app?vista=sync'],['fincas-comunidad','/fincas#registrar-finca'],['perfil-profesional-agro','/profesionales#registro-profesional']])assert.equal(platformGuides.find(g=>g.slug===slug).tutorial.targetHref,path);
 const dashboard=await readFile(`${root}/components/farm-dashboard.tsx`,'utf8');assert.match(dashboard,/if\(!initialViewApplied.current\).*farmDashboardViewFromSearch\(window.location.search\)/);
});
test('offline preparation honestly shows its initial check and blocks silent repeat actions',async()=>{
 const {OfflinePreparation}=await vite.ssrLoadModule('/components/offline-preparation.tsx');const html=render(OfflinePreparation);assert.match(html,/aria-busy="true"/);assert.match(html,/Comprobando la preparación de este dispositivo/);assert.match(html,/<button[^>]*disabled=""[^>]*>Comprobando…<\/button>/);
});
