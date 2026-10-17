import assert from 'node:assert/strict';import test,{after} from 'node:test';import {fileURLToPath} from 'node:url';import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));const saved=Object.fromEntries(['document','HTMLElement'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));class Element{isConnected=true;calls=[];focus(options){this.calls.push(options);}}const body=new Element();Object.defineProperty(globalThis,'HTMLElement',{value:Element,configurable:true});Object.defineProperty(globalThis,'document',{value:{body,activeElement:body},configurable:true});
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},plugins:[{name:'shared-focus-hooks',enforce:'pre',transform(code,id){if(/components\/ui\/(dialog|sheet)\.tsx\?focus-test/.test(id))return code.replace('from "react"','from "virtual:focus-hooks"').replace('from "@/components/offline-account-boundary"','from "virtual:focus-boundary"');},resolveId(id){if(id==='virtual:focus-hooks')return '\0focus-hooks';if(id==='virtual:focus-boundary')return '\0focus-boundary';},load(id){if(id==='\0focus-boundary')return 'export const useOfflineAccountBlocked=()=>globalThis.__focusBlocked??false;export function OfflineAccountLockPanel(){return null;}';if(id==='\0focus-hooks')return 'export const useRef=initial=>({current:initial});export const createContext=value=>({value});export const useContext=()=>({hasTrigger:()=>globalThis.__focusTriggers.current>0,registerTrigger:()=>()=>{}});export const useEffect=()=>{};';}}],server:{middlewareMode:true,hmr:false,ws:false,watch:null}});after(async()=>{await vite.close();delete globalThis.__focusTriggers;delete globalThis.__focusBlocked;for(const[k,v]of Object.entries(saved)){if(v)Object.defineProperty(globalThis,k,v);else delete globalThis[k];}});
globalThis.__focusTriggers={current:0};
const {DialogContent}=await vite.ssrLoadModule('/components/ui/dialog.tsx?focus-test');const {SheetContent}=await vite.ssrLoadModule('/components/ui/sheet.tsx?focus-test');const nodes=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(nodes):[n,...nodes(n.props?.children)];
for(const Component of [DialogContent,SheetContent]){
 test(`${Component.name} preserves native focus restoration when a real trigger exists`,()=>{const opener=new Element();document.activeElement=opener;globalThis.__focusTriggers.current=1;const content=nodes(Component({})).find(n=>n.props?.onOpenAutoFocus);content.props.onOpenAutoFocus(new Event("open",{cancelable:true}));const close=new Event("close",{cancelable:true});content.props.onCloseAutoFocus(close);assert.equal(close.defaultPrevented,false);assert.equal(opener.calls.length,0);globalThis.__focusTriggers.current=0;});
 test(`${Component.name} restores an ordinary button opener without scrolling`,()=>{const opener=new Element();document.activeElement=opener;const content=nodes(Component({})).find(n=>n.props?.onOpenAutoFocus);content.props.onOpenAutoFocus(new Event('open',{cancelable:true}));document.activeElement=new Element();const close=new Event('close',{cancelable:true});content.props.onCloseAutoFocus(close);assert.equal(close.defaultPrevented,true);assert.deepEqual(opener.calls,[{preventScroll:true}]);});
 test(`${Component.name} preserves caller-managed focus and ignores disconnected or body openers`,()=>{for(const mode of ['caller','disconnected','body']){const opener=mode==='body'?body:new Element();document.activeElement=opener;const content=nodes(Component({onCloseAutoFocus:mode==='caller'?e=>e.preventDefault():undefined})).find(n=>n.props?.onOpenAutoFocus);content.props.onOpenAutoFocus(new Event('open',{cancelable:true}));if(mode==='disconnected')opener.isConnected=false;content.props.onCloseAutoFocus(new Event('close',{cancelable:true}));assert.equal(opener.calls.length,0);}});
}

for (const Component of [DialogContent, SheetContent]) {
 test(`${Component.name} keeps blocked modal drafts mounted and makes only account recovery controls available`, () => {
  globalThis.__focusBlocked = true;
  let delegated = 0;
  const draft = { type: 'input', props: { defaultValue: 'Unsaved value' } };
  const tree = Component({ children: draft, 'aria-label': 'Private title', 'aria-labelledby': 'private-title', 'aria-describedby': 'private-description', onEscapeKeyDown: () => delegated++, onInteractOutside: () => delegated++ });
  const all = nodes(tree); const content = all.find(node => node.props?.onOpenAutoFocus);
  assert.equal(content.props['aria-label'], 'Verificar la cuenta original'); assert.equal(content.props['aria-labelledby'], undefined); assert.equal(content.props['aria-describedby'], undefined);
  const retained = all.find(node => node.props?.['data-account-modal-draft'] !== undefined);
  assert.equal(retained.props.hidden, true); assert.equal(retained.props.inert, true); assert.equal(retained.props['aria-hidden'], true); assert.equal(retained.props.style.display, 'none'); assert.ok(nodes(retained).includes(draft));
  assert.ok(all.some(node => node.type?.name === 'OfflineAccountLockPanel' && node.props.withinModal));
  for (const handler of ['onEscapeKeyDown', 'onInteractOutside']) { const event = new Event(handler, { cancelable: true }); content.props[handler](event); assert.equal(event.defaultPrevented, true); }
  assert.equal(delegated, 0); assert.equal(content.props.open, undefined, 'the modal is not closed or remounted to disable its focus trap');
  globalThis.__focusBlocked = false;
  const normal = nodes(Component({ children: draft, onEscapeKeyDown: () => delegated++ })).find(node => node.props?.onOpenAutoFocus);
  normal.props.onEscapeKeyDown(new Event('escape', { cancelable: true })); assert.equal(delegated, 1);
 });
}
