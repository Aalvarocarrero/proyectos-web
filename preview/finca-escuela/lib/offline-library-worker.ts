export type LibraryResources={ready:boolean;version?:string;resources?:number;bytes?:number;preparedAt?:string;error?:string;code?:'update_required';cleared?:boolean};
const updateMessage='Hay una versión nueva preparada o en descarga. Mantén internet; cuando termine, cierra todas las pestañas de VenezuelaAgro y vuelve a abrir para comprobarla. La copia anterior y tus registros se conservan.';
const updateRequired=():LibraryResources=>({ready:false,code:'update_required',error:updateMessage});
async function message(type:'PREPARE_LIBRARY'|'LIBRARY_STATUS'|'CLEAR_LIBRARY'|'OFFLINE_STATUS',signal?:AbortSignal,generation?:number):Promise<LibraryResources>{
 if(!('serviceWorker' in navigator))return {ready:false,error:'Este navegador no ofrece almacenamiento offline de páginas.'};
 const registration=await navigator.serviceWorker.getRegistration(),worker=registration?.active;
 if(!worker)return {ready:false,error:'La aplicación todavía se está preparando. Espera con internet y vuelve a comprobar.'};
 if(signal?.aborted)return {ready:false,error:'Descarga cancelada.'};
 // A waiting update must not take over an old tab or mix its cached bundles.
 if(type!=='CLEAR_LIBRARY'&&(registration?.waiting||registration?.installing))return updateRequired();
 return new Promise(resolve=>{
  const channel=new MessageChannel();let settled=false;
  const finish=(result:LibraryResources)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);channel.port1.close();resolve(result);};
  const cancel=()=>{if(type==='PREPARE_LIBRARY')worker.postMessage({type:'CANCEL_LIBRARY'});finish({ready:false,error:'Descarga cancelada. La copia anterior se conserva.'});};
  const timer=setTimeout(()=>{if(type==='PREPARE_LIBRARY')worker.postMessage({type:'CANCEL_LIBRARY'});finish({ready:false,error:'La operación no terminó. Vuelve a comprobarla con internet.'});},type==='OFFLINE_STATUS'?15000:120000);
  channel.port1.onmessage=event=>finish(event.data as LibraryResources);
  signal?.addEventListener('abort',cancel,{once:true});
  if(signal?.aborted){cancel();return;}
  try{worker.postMessage({type,generation},[channel.port2]);}catch{finish({ready:false,error:'No se pudo comprobar la preparación. Recarga con internet y vuelve a intentarlo; no borres tus datos.'});}
 });
}
export async function libraryResources(prepare=false,signal?:AbortSignal,generation?:number){
 let expected:string|undefined;
 if(navigator.onLine){const controller=new AbortController(),cancel=()=>controller.abort();signal?.addEventListener('abort',cancel,{once:true});if(signal?.aborted)cancel();const timer=setTimeout(cancel,5000);
  try{const response=await fetch('/offline-library-assets.json',{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error();const manifest=await response.json() as {revision?:string};if(typeof manifest.revision!=='string')throw new Error();expected=manifest.revision;}
  catch{return {ready:false,error:'No se pudo verificar la versión actual. Conserva internet y vuelve a comprobar; la copia anterior no se borra.'};}
  finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
 }
 // v98 already reports its core version. Check it before asking that worker to
 // download a newer library manifest, whose mismatch used to become generic failure.
 if(expected){
  const core=await message('OFFLINE_STATUS',signal);
  if(core.code==='update_required'||(core.version&&core.version!==expected))return updateRequired();
  if(signal?.aborted)return {ready:false,error:'Descarga cancelada.'};
 }
 const result=await message(prepare?'PREPARE_LIBRARY':'LIBRARY_STATUS',signal,generation);
 if(expected&&(result.ready||result.version)&&result.version!==expected)return updateRequired();return result;
}
export async function removeLibraryResources(){const result=await message('CLEAR_LIBRARY');if(!result.cleared)throw new Error(result.error||'No se confirmó la eliminación de recursos.');return result;}
