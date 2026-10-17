import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const originals=new Map();
function install(name,value){if(!originals.has(name))originals.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});}
const vite=await createServer({appType:'custom',configFile:false,root,cacheDir:'/tmp/agro-ux-flow-guards-tests',resolve:{alias:{'@':root}},plugins:[{
 name:'ux-flow-handler-tests',enforce:'pre',
 transform(code,id){
  if(!id.includes('?ux-flow-test'))return;
  code=code.replace(/from (['"])react\1;/g,'from "virtual:ux-flow-hooks";');
  if(id.includes('store-catalog.tsx'))code=code.replace("from '@/lib/offline-db';","from 'virtual:ux-flow-db';").replace("from 'sonner';","from 'virtual:ux-flow-toast';");
  if(id.includes('farm-dashboard.tsx'))code+='\nexport {Animals,WeightDialog};';
  return code;
 },
 resolveId(id){if(id.startsWith('virtual:ux-flow-'))return '\0'+id;},
 load(id){
  if(id==='\0virtual:ux-flow-hooks')return `export const useState=v=>globalThis.__uxHooks.useState(v);export const useRef=v=>globalThis.__uxHooks.useRef(v);export const useEffect=(f,d)=>globalThis.__uxHooks.useEffect(f,d);export const useMemo=(f,d)=>globalThis.__uxHooks.useMemo(f,d);export const useCallback=(f,d)=>globalThis.__uxHooks.useMemo(()=>f,d);`;
  if(id==='\0virtual:ux-flow-db')return `export const getCachedEntity=(...a)=>globalThis.__uxDb.getCachedEntity(...a);export const cacheEntity=(...a)=>globalThis.__uxDb.cacheEntity(...a);export const queueMutation=(...a)=>globalThis.__uxDb.queueMutation(...a);export const syncNow=()=>globalThis.__uxDb.syncNow();export const createLocalId=()=>"synthetic-order";`;
  if(id==='\0virtual:ux-flow-toast')return 'export const toast={loading:()=>"synthetic-toast",success:()=>{},error:()=>{}};';
 },
}],server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
after(async()=>{await vite.close();for(const [name,descriptor]of originals){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}delete globalThis.__uxHooks;delete globalThis.__uxDb;});
const {StoreCatalog}=await vite.ssrLoadModule('/components/store-catalog.tsx?ux-flow-test');
const {CompanyManager,CompanyForm}=await vite.ssrLoadModule('/components/company-manager.tsx?ux-flow-test');
const {Animals,WeightDialog}=await vite.ssrLoadModule('/components/farm-dashboard.tsx?ux-flow-test');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const text=node=>typeof node==='string'?node:Array.isArray(node)?node.map(text).join(''):node?.props?text(node.props.children):'';
function nodes(node){if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(nodes);return [node,...nodes(node.props?.children),...nodes(node.props?.action)];}

// Exercises production handlers and hook state without replacing their logic.
// Browser focus, native validity UI, layout and portal behavior need live QA.
function harness(Component,props={}){
 let slots=[],cursor=0,tree,changed=false,effects=[];
 const hooks={
  useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],next=>{const value=typeof next==='function'?next(slots[i]):next;if(!Object.is(value,slots[i])){slots[i]=value;changed=true;}}];},
  useRef(initial){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];},
  useMemo(factory,deps){const i=cursor++;if(!(i in slots)||!deps||deps.some((v,n)=>!Object.is(v,slots[i].deps?.[n])))slots[i]={value:factory(),deps};return slots[i].value;},
  useEffect(effect,deps){const i=cursor++;if(!(i in slots)||!deps||deps.some((v,n)=>!Object.is(v,slots[i]?.[n]))){slots[i]=deps;effects.push(effect);}},
 };
 function render(){globalThis.__uxHooks=hooks;let runs=0;do{changed=false;cursor=0;tree=Component(props);assert.ok(++runs<20,'render converges');}while(changed);const pending=effects;effects=[];for(const effect of pending)effect();return tree;}
 const all=predicate=>nodes(tree).filter(predicate);
 const find=predicate=>{const match=all(predicate)[0];assert.ok(match,'requested component element exists');return match;};
 const button=label=>find(n=>typeof n.props?.onClick==='function'&&text(n).trim()===label);
 render();return {render,all,find,button,props,get tree(){return tree;}};
}
class TestFormData{
 constructor(form){this.values=form.values;}
 get(name){const value=this.values[name];return Array.isArray(value)?value[0]??null:value??null;}
 getAll(name){const value=this.values[name];return value===undefined?[]:Array.isArray(value)?value:[value];}
}
install('FormData',TestFormData);
const memory=new Map();
install('sessionStorage',{getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)});

function setupStore(){
 const writes=[],requests=[];
 globalThis.__uxDb={getCachedEntity:async type=>type==='cart'?null:{syncState:'pending'},cacheEntity:async(...args)=>writes.push(structuredClone(args)),queueMutation:async mutation=>requests.push(structuredClone(mutation)),syncNow:async()=>{}};
 const h=harness(StoreCatalog);
 const add=()=>{h.all(n=>typeof n.props?.onClick==='function'&&text(n).startsWith('Elegir presentación'))[0].props.onClick();h.render();const configuration=h.find(n=>n.props?.draft&&n.props?.onSave);const p=configuration.props.draft.product;configuration.props.onSave({id:p.id,name:p.name,quantity:2,measure:p.units[0],presentation:p.presentations[0]});h.render();};
 const field=name=>h.find(n=>n.props?.name===name&&typeof n.props?.onChange==='function');
 const fill=values=>{for(const [name,value]of Object.entries(values)){field(name).props.onChange({currentTarget:{value}});h.render();}};
 const form=()=>h.find(n=>n.type==='form'&&n.props.className.includes('store-request-form'));
 const submit=()=>form().props.onSubmit({preventDefault(){},currentTarget:{values:Object.fromEntries(h.all(n=>n.props?.name&&typeof n.props.value==='string').map(n=>[n.props.name,n.props.value]))}});
 return {h,add,field,fill,form,submit,writes,requests};
}
const contact={name:'Comprador de prueba',phone:'+584120000000',email:'prueba@example.invalid',note:'Recoger el jueves. Solo prueba.',companyName:'Empresa de prueba',companyType:'Restaurante',taxId:'Dato ficticio',deliveryLocation:'Apure · prueba',frequency:'Semanal',requiredDate:'2026-11-20',deliveryMode:'Retiro en finca'};

test('store contact survives editing a cut, closing/reopening, channel switches and removing all products',async()=>{
 const s=setupStore();await tick();s.h.render();s.h.button('Para mi negocioRestaurantes, carnicerías, tiendas, supermercados y distribuidores.').props.onClick();s.h.render();s.add();s.fill(contact);
 s.h.button('Editar corte y cantidad').props.onClick();s.h.render();assert.equal(s.h.find(n=>n.type?.name==='Sheet').props.open,false);
 const editor=s.h.find(n=>n.props?.draft&&n.props?.onSave);editor.props.onSave({...editor.props.draft.line,quantity:3},editor.props.draft.index);s.h.render();
 const sheet=()=>s.h.find(n=>n.type?.name==='Sheet');sheet().props.onOpenChange(false);s.h.render();sheet().props.onOpenChange(true);s.h.render();
 for(const [name,value]of Object.entries(contact))assert.equal(s.field(name).props.value,value,name);
 s.h.button('Para mi hogarPedidos particulares, pequeñas cantidades y cortes a tu gusto.').props.onClick();s.h.render();s.h.button('Para mi negocioRestaurantes, carnicerías, tiendas, supermercados y distribuidores.').props.onClick();s.h.render();
 for(const [name,value]of Object.entries(contact))assert.equal(s.field(name).props.value,value,name);
 s.h.find(n=>n.props?.['aria-label']?.startsWith('Eliminar ')).props.onClick();s.h.render();s.add();
 for(const [name,value]of Object.entries(contact))assert.equal(s.field(name).props.value,value,name);
 await tick();assert.ok(s.writes.every(([, ,payload])=>Object.keys(payload).sort().join(',')==='channel,items'),'cart never persists contact');
});

test('store save failure retains the form; successful queueing clears contact only after confirmation',async()=>{
 const s=setupStore();await tick();s.h.render();s.add();s.fill({name:contact.name,phone:contact.phone,note:contact.note});
 globalThis.__uxDb.queueMutation=async()=>{throw new Error('synthetic storage failure');};await s.submit();s.h.render();assert.equal(s.field('name').props.value,contact.name);assert.equal(s.field('note').props.value,contact.note);
 let release;globalThis.__uxDb.queueMutation=mutation=>new Promise(resolve=>{s.requests.push(mutation);release=resolve;});
 const pending=s.submit();s.h.render();assert.equal(s.h.find(n=>n.type==='fieldset'&&n.props.className==='min-w-0 space-y-4').props.disabled,true);s.h.find(n=>n.type?.name==='Sheet').props.onOpenChange(false);s.h.render();assert.equal(s.h.find(n=>n.type?.name==='Sheet').props.open,true);assert.equal(s.field('name').props.value,contact.name);
 await s.submit();assert.equal(s.requests.length,1,'repeated click cannot create a second request');release();await pending;s.h.render();assert.equal(s.requests[0].payload.customerName,contact.name);s.add();assert.equal(s.field('name').props.value,'');assert.equal(s.field('note').props.value,'');
});

const company=id=>({id,name:`Empresa ${id}`,status:'pending',category:'Ferretería y construcción',state:'Apure',products:[],revision:1});
async function setupManager(){
 const confirmations=[];let approve=false;install('window',{confirm:message=>{confirmations.push(message);return approve;}});install('fetch',async()=>({ok:true,json:async()=>({companies:[company('uno'),company('dos')]})}));
 const h=harness(CompanyManager,{userId:'synthetic-owner'});await tick();h.render();
 const editors=()=>h.all(n=>n.type===CompanyForm),edit=i=>h.all(n=>n.type==='button'&&text(n)==='Editar datos y catálogo')[i];
 return {h,edit,editors,confirmations,setApprove:value=>{approve=value;}};
}

test('company clean add/switch/close needs no prompt; cancel protects restored fields, images and products',async()=>{
 const m=await setupManager();m.edit(0).props.onClick();m.h.render();m.edit(1).props.onClick();m.h.render();m.h.button('Añadir empresa').props.onClick();m.h.render();m.h.button('Cerrar formulario').props.onClick();m.h.render();assert.equal(m.editors().length,0);assert.equal(m.confirmations.length,0);
 m.edit(0).props.onClick();m.h.render();const props=m.editors()[0].props;
 const draft={name:'Nombre sin enviar',logoDataUrl:'data:image/webp;base64,cHJ1ZWJh',galleryDataUrls:['data:image/webp;base64,Z2FsZXJpYQ=='],products:[{id:'synthetic-product',name:'Producto sin enviar',description:'Prueba',category:'Herramientas y cercas',priceCents:null,currency:'USD',unit:'unidad',availability:'Por confirmar'}]};
 memory.set('venezuela-agro-company-draft:synthetic-owner:uno',JSON.stringify(draft));
 const f=harness(CompanyForm,props);f.button('Recuperar borrador').props.onClick();f.render();
 for(const action of [()=>m.h.button('Cerrar formulario'),()=>m.h.button('Añadir empresa'),()=>m.edit(1)]){action().props.onClick();m.h.render();assert.equal(m.editors()[0].props.company.id,'uno');}
 f.render();assert.equal(f.find(n=>n.props?.name==='name').props.defaultValue,draft.name);assert.ok(f.all(n=>n.type==='img').some(n=>n.props.src===draft.logoDataUrl));assert.ok(f.all(n=>n.type==='img').some(n=>n.props.src===draft.galleryDataUrls[0]));assert.ok(f.all(n=>n.type==='input').some(n=>n.props.value==='Producto sin enviar'));
 assert.equal(m.confirmations.length,3);m.setApprove(true);m.edit(1).props.onClick();m.h.render();assert.equal(m.editors()[0].props.company.id,'dos');m.edit(1).props.onClick();m.h.render();assert.equal(m.confirmations.length,4,'same-editor repeat does not discard or confirm twice');
});

test('company product and image removal handlers mark dirty, and accepted close changes editor once',async()=>{
 const m=await setupManager();m.edit(0).props.onClick();m.h.render();const f=harness(CompanyForm,{...m.editors()[0].props,company:{...company('uno'),logoKey:'synthetic-logo'}});
 f.button('Quitar logo').props.onClick();f.render();m.h.button('Cerrar formulario').props.onClick();m.h.render();assert.equal(m.editors().length,1);assert.equal(m.confirmations.length,1);
 m.setApprove(true);m.h.button('Cerrar formulario').props.onClick();m.h.render();assert.equal(m.editors().length,0);
 m.h.button('Añadir empresa').props.onClick();m.h.render();const newer=harness(CompanyForm,m.editors()[0].props);newer.button('Añadir producto').props.onClick();newer.render();m.setApprove(false);m.edit(1).props.onClick();m.h.render();assert.equal(m.editors()[0].props.company,null);
});

test('company submit synchronously blocks close/add/switch and preserves the form after a server error',async()=>{
 const m=await setupManager();m.edit(0).props.onClick();m.h.render();const f=harness(CompanyForm,m.editors()[0].props);f.tree.props.onChangeCapture();
 let release;install('fetch',()=>new Promise(resolve=>{release=resolve;}));
 const pending=f.tree.props.onSubmit({preventDefault(){},currentTarget:{values:{name:'Empresa sintética',category:'Ferretería y construcción',description:'Empresa sintética utilizada únicamente para esta prueba de componentes.',state:'Apure',municipality:'Localidad ficticia',phone:'+584120000000',serviceMode:'Presencial'}}});
 // Use existing handlers before React's next render to cover the repeat-click window.
 for(const button of [m.h.button('Cerrar formulario'),m.h.button('Añadir empresa'),m.edit(1)])button.props.onClick();
 m.h.render();assert.equal(m.editors()[0].props.company.id,'uno');assert.equal(m.h.button('Cerrar formulario').props.disabled,true);assert.equal(m.confirmations.length,0);assert.equal(typeof release,'function');
 release({ok:false,status:500,json:async()=>({})});await pending;f.render();m.h.render();assert.equal(m.editors()[0].props.company.id,'uno');assert.equal(m.h.button('Cerrar formulario').props.disabled,false);m.h.button('Cerrar formulario').props.onClick();assert.equal(m.confirmations.length,1);
});

test('general weighing opens without an animal even after filtering; row actions retain the right identity',()=>{
 const records=['uno','dos'].map(id=>({id,payload:{farmId:'synthetic-farm',recordType:'animal',title:`Animal ${id}`,category:'Bovino',data:{}}}));const selected=[];
 const h=harness(Animals,{records,weights:[],historyRecords:[],onAdd(){},onWeigh:id=>selected.push(id),onOpen(){}});
 h.find(n=>n.props?.placeholder==='Nombre, arete, especie o raza').props.onChange('Animal dos');h.render();
 h.find(n=>typeof n.props?.onClick==='function'&&text(n).trim()==='Registrar pesaje').props.onClick();assert.deepEqual(selected,['']);
 const rowButton=h.find(n=>n.props?.['aria-label']==='Registrar peso de Animal dos');rowButton.props.onClick();assert.deepEqual(selected,['','dos']);
 const props={open:true,onOpenChange(){},animals:records,animalId:'',onAnimalChange(){},onSubmit(){}};const dialog=harness(WeightDialog,props);assert.equal(dialog.find(n=>n.type?.name==='Select').props.required,true);assert.equal(dialog.find(n=>n.type?.name==='FarmSaveButton').props.disabled,true);props.animalId='dos';dialog.render();assert.equal(dialog.find(n=>n.type?.name==='FarmSaveButton').props.disabled,false);
});

test('company photo processing blocks a switch until the image is retained in the draft',async()=>{
 const m=await setupManager();m.edit(0).props.onClick();m.h.render();const f=harness(CompanyForm,m.editors()[0].props);let finishImage;
 install('Image',class {naturalWidth=240;naturalHeight=180;set src(_value){finishImage=()=>this.onload();}});
 install('document',{createElement:()=>({getContext:()=>({drawImage(){}}),toDataURL:()=> 'data:image/webp;base64,cHJ1ZWJh'})});
 const input=f.all(n=>n.type==='input'&&n.props.type==='file')[0];input.props.onChange({target:{files:[new File(['synthetic bytes'],'synthetic.webp',{type:'image/webp'})]}});
 m.edit(1).props.onClick();m.h.render();assert.equal(m.editors()[0].props.company.id,'uno');assert.equal(m.h.button('Cerrar formulario').props.disabled,true);assert.equal(m.confirmations.length,0);
 finishImage();await tick();f.render();m.h.render();assert.ok(f.all(n=>n.type==='img').some(n=>n.props.src==='data:image/webp;base64,cHJ1ZWJh'));assert.equal(m.h.button('Cerrar formulario').props.disabled,false);m.edit(1).props.onClick();m.h.render();assert.equal(m.editors()[0].props.company.id,'uno');assert.equal(m.confirmations.length,1);
});

test('company confirmed save closes once and stale callbacks cannot erase a newer dirty form',async()=>{
 const m=await setupManager();m.edit(0).props.onClick();m.h.render();const oldProps=m.editors()[0].props;const f=harness(CompanyForm,oldProps);
 await f.tree.props.onSubmit({preventDefault(){},currentTarget:{values:{name:'Empresa sintética',category:'Ferretería y construcción',description:'Empresa sintética utilizada únicamente para esta prueba de componentes.',state:'Apure',municipality:'Localidad ficticia',phone:'+584120000000',serviceMode:'Presencial'}}});m.h.render();assert.equal(m.editors().length,0);assert.equal(m.confirmations.length,0);
 m.edit(1).props.onClick();m.h.render();const newer=harness(CompanyForm,m.editors()[0].props);newer.tree.props.onChangeCapture();oldProps.onDraftStateChange({dirty:false,busy:false});
 m.h.button('Cerrar formulario').props.onClick();m.h.render();assert.equal(m.editors()[0].props.company.id,'dos');assert.equal(m.confirmations.length,1);await oldProps.onSaved();m.h.render();assert.equal(m.editors()[0].props.company.id,'dos');
});

test('informational conversion changes keep company clean; original product currency still marks it dirty',async()=>{
 class FormControl {constructor(inConversion){this.inConversion=inConversion;}closest(selector){assert.equal(selector,'[data-price-conversion]');return this.inConversion?{}:null;}}
 install('Element',FormControl);
 const m=await setupManager();m.edit(0).props.onClick();m.h.render();
 const product={id:'synthetic-currency-product',name:'Herramienta de prueba',description:'Solo prueba',category:'Herramientas y cercas',priceCents:1000,currency:'USD',unit:'unidad',availability:'Por confirmar'};
 const f=harness(CompanyForm,{...m.editors()[0].props,company:{...company('uno'),products:[product]}});
 assert.ok(f.find(n=>n.props?.amount===10&&n.props?.currency==='USD'),'product has an informational converter');
 f.tree.props.onChangeCapture({target:new FormControl(true)});m.h.button('Cerrar formulario').props.onClick();m.h.render();assert.equal(m.editors().length,0);assert.equal(m.confirmations.length,0);
 m.edit(0).props.onClick();m.h.render();const editable=harness(CompanyForm,{...m.editors()[0].props,company:{...company('uno'),products:[product]}});
 editable.tree.props.onChangeCapture({target:new FormControl(false)});editable.find(n=>n.type==='select'&&n.props.value==='USD').props.onChange({target:{value:'EUR'}});editable.render();
 assert.equal(editable.find(n=>n.type==='select'&&n.props.value==='EUR').props.value,'EUR');m.h.button('Cerrar formulario').props.onClick();m.h.render();assert.equal(m.editors()[0].props.company.id,'uno');assert.equal(m.confirmations.length,1);
});
