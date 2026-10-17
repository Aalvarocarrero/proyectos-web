import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = path => readFileSync(new URL('../'+path, import.meta.url), 'utf8');
function load(path, require, globals = {}) {
 const code = ts.transpileModule(source(path), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const exports = {};
 vm.runInNewContext(code, {exports,require,...globals}, {filename:path});
 return exports;
}
const {publicFeedRows} = load('hooks/use-offline-snapshot.ts', () => ({}));
const loadState = load('lib/marketplace-load-state.ts', () => ({}));
const photo = load('lib/listing-photo.ts', () => ({}));
const listing = {id:'public-1',title:'Oferta pública sintética',description:'Solo para prueba',category:'Cultivos',location:'Apure',sellerName:'Productor sintético',status:'active',imageUrl:'/api/media/synthetic.webp'};

test('online public feeds are unchanged; offline only explicit demos survive without mutating source', () => {
 const rows = [{id:'real'}, {id:'demo',demo:true}, {id:'false',demo:false}, {id:'truthy',demo:'yes'}];
 assert.equal(publicFeedRows(rows,true),rows);
 assert.deepEqual(Array.from(publicFeedRows(rows,false),row=>row.id),['demo']);
 assert.equal(rows.length,4);
 assert.deepEqual(Array.from(publicFeedRows([{id:'real'}],false)),[]);
});

test('feed consumers have no persistent broad-feed reads, writes, or cleanup', () => {
 for (const path of ['components/marketplace-browser.tsx','components/agro-network.tsx','components/professional-directory.tsx','hooks/use-offline-snapshot.ts']) {
  const content=source(path).replace('window.localStorage.getItem("venezuela-agro-session-boundary")','sessionBoundaryRead');
  assert.doesNotMatch(content, /localStorage\s*\.|indexedDB\s*\.|useOfflineSnapshot\(/, path);
 }
});

test('community keeps owner-checked drafts and isolates late account data from the current view', () => {
 const network=source('components/agro-network.tsx');
 assert.match(network,/publicFeedRows\(liveData\.farms,online\)/);
 assert.match(network,/publicFeedRows\(liveData\.posts,online\)/);
 assert.match(network,/raw\.owner!==\(userId\?\?null\)/);
 assert.match(network,/feed\.context===context\?feed\.data:initial/);
 assert.match(network,/pendingState\.owner===userId\?pendingState\.rows:\[\]/);
 assert.match(network,/queueMutation\(\{expectedOwner:userId/);
 assert.match(network,/getCachedEntities<Record<string,unknown>>\('social-post'\)/);
 assert.match(network,/if\(!active\|\|accountBlockedRef.current\|\|boundary!==accountBoundary\(\)\|\|await localOwner\(\)!==userId\)return/);
 assert.match(network,/setPending\(\{owner:userId/);
 assert.match(network,/no se descargan sus publicaciones/);
});

test('professional profiles and open real-profile dialogs disappear offline while demos remain', () => {
 const directory=source('components/professional-directory.tsx');
 assert.match(directory,/publicFeedRows\(initial,online\)/);
 assert.match(directory,/publicFeedRows\(examples,online\)/);
 assert.match(directory,/selected&&\(online\|\|selected\.demo\)\?selected:null/);
 assert.match(directory,/El directorio profesional requiere internet y no se descarga/);
});

// Synthetic hook renderer: runs the actual market loading effect, without mounting
// child widgets or using a browser, remote API, storage, or production account.
function marketHarness({online=true,fetcher=async()=>new Response(JSON.stringify({listings:[listing]}))}={}) {
 const slots=[],effects=[],listeners=new Map(); let cursor=0,initialized=false,fetchCalls=0;
 const navigator={onLine:online};
 const react={
  useState(value){const index=cursor++;if(!(index in slots))slots[index]=typeof value==='function'?value():value;return [slots[index],next=>{slots[index]=typeof next==='function'?next(slots[index]):next;}];},
  useRef(value){const index=cursor++;return slots[index]??=( {current:value} );},
  useMemo:fn=>fn(),
  useEffect(fn){if(!initialized)effects.push(fn);},
 };
 const jsx={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:'fragment'};
 const noops=new Proxy({}, {get:()=>()=>null});
 const modules={
  react,'react/jsx-runtime':jsx,
  '@/hooks/use-directory-filters':{useDirectoryFilters:()=>[{q:'',categoria:'Todo',contenido:'published'},()=>{}]},
  '@/lib/marketplace-load-state':loadState,
  '@/lib/listing-photo':photo,
  '@/lib/marketplace-demo':{demoMarketplaceListings:[]},
  '@/lib/marketplace-categories':{marketplaceRootCategories:[],categoryMatches:()=>true},
  '@/lib/directory-search':{matchesDirectorySearch:()=>true},
  '@/components/listing-price':{ListingPrice:()=>null,listingUpdateLabel:()=>''},
 };
 const window={addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);},removeEventListener(name,fn){listeners.get(name)?.delete(fn);}};
 const storage=new Proxy({}, {get(){assert.fail('Public market must never access persistent storage');}});
 const {MarketplaceBrowser}=load('components/marketplace-browser.tsx',name=>modules[name]??noops,{
  navigator,window,localStorage:storage,URL,AbortController,location:{href:'https://synthetic.invalid/marketplace'},
  fetch:async(...args)=>{fetchCalls++;return fetcher(...args);},
 });
 return {
  render(){cursor=0;const tree=MarketplaceBrowser({});initialized=true;return tree;},
  mount(){this.render();for(const effect of effects)effect();},
  connection(value){navigator.onLine=value;for(const fn of listeners.get(value?'online':'offline')??[])fn();},
  calls:()=>fetchCalls,
 };
}
function textContent(value){
 if(value===null||value===undefined||typeof value==='boolean')return '';
 if(typeof value==='string'||typeof value==='number')return String(value);
 if(Array.isArray(value))return value.map(textContent).join(' ');
 return textContent(value.props?.children);
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));

test('cold offline market neither reads old storage nor fetches a public list', async () => {
 const h=marketHarness({online:false});h.mount();await settle();
 assert.equal(h.calls(),0);
 const rendered=textContent(h.render());
 assert.match(rendered,/Mercado Agro requiere conexión/);
 assert.match(rendered,/El mercado público no se descarga/);
 assert.doesNotMatch(rendered,/publicaciones guardadas en este dispositivo/);
});

test('live market renders online, drops public rows offline, and reloads on reconnect', async () => {
 const h=marketHarness();h.mount();await settle();
 assert.match(textContent(h.render()),/Oferta pública sintética/);
 h.connection(false);
 assert.doesNotMatch(textContent(h.render()),/Oferta pública sintética/);
 h.connection(true);await settle();
 assert.match(textContent(h.render()),/Oferta pública sintética/);
 assert.equal(h.calls(),2);
});

test('a public request resolved after going offline cannot repopulate the market', async () => {
 let finish,signal;
 const h=marketHarness({fetcher:(_url,options)=>{signal=options.signal;return new Promise(resolve=>{finish=resolve;});}});
 h.mount();h.connection(false);
 assert.equal(signal.aborted,true);
 finish(new Response(JSON.stringify({listings:[listing]})));await settle();
 assert.doesNotMatch(textContent(h.render()),/Oferta pública sintética/);
 assert.match(textContent(h.render()),/Mercado Agro requiere conexión/);
});
