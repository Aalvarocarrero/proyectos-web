export type LibraryResources={ready:boolean;version?:string;resources?:number;bytes?:number;preparedAt?:string;error?:string;cleared?:boolean};
async function message(type:'PREPARE_LIBRARY'|'LIBRARY_STATUS'|'CLEAR_LIBRARY',signal?:AbortSignal,generation?:number):Promise<LibraryResources>{
 if(!('serviceWorker' in navigator))return {ready:false,error:'Este navegador no ofrece almacenamiento offline de páginas.'};
 const registration=await navigator.serviceWorker.getRegistration(),worker=registration?.active;
 if(!worker)return {ready:false,error:'La aplicación todavía se está preparando. Espera con internet y vuelve a comprobar.'};
 if(signal?.aborted)return {ready:false,error:'Descarga cancelada.'};
 return new Promise(resolve=>{
  const channel=new MessageChannel();let settled=false;
  const finish=(result:LibraryResources)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);channel.port1.close();resolve(result);};
  const cancel=()=>{if(type==='PREPARE_LIBRARY')worker.postMessage({type:'CANCEL_LIBRARY'});finish({ready:false,error:'Descarga cancelada. La copia anterior se conserva.'});};
  const timer=setTimeout(()=>{if(type==='PREPARE_LIBRARY')worker.postMessage({type:'CANCEL_LIBRARY'});finish({ready:false,error:'La operación no terminó. Vuelve a comprobarla con internet.'});},120000);
  channel.port1.onmessage=event=>finish(event.data as LibraryResources);
  signal?.addEventListener('abort',cancel,{once:true});
  if(signal?.aborted){cancel();return;}
  worker.postMessage({type,generation},[channel.port2]);
 });
}
export async function libraryResources(prepare=false,signal?:AbortSignal,generation?:number){
 let expected:string|undefined;
 if(navigator.onLine){const controller=new AbortController(),cancel=()=>controller.abort();signal?.addEventListener('abort',cancel,{once:true});if(signal?.aborted)cancel();const timer=setTimeout(cancel,5000);
  try{const response=await fetch('/offline-library-assets.json',{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error();const manifest=await response.json() as {revision?:string};if(typeof manifest.revision!=='string')throw new Error();expected=manifest.revision;}
  catch{return {ready:false,error:'No se pudo verificar la versión actual. Conserva internet y vuelve a comprobar; la copia anterior no se borra.'};}
  finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
 }
 const result=await message(prepare?'PREPARE_LIBRARY':'LIBRARY_STATUS',signal,generation);
 if(result.ready&&expected&&result.version!==expected)return {ready:false,error:'Se está actualizando la aplicación. Espera y vuelve a comprobar antes de salir sin señal.'};return result;
}
export async function removeLibraryResources(){const result=await message('CLEAR_LIBRARY');if(!result.cleared)throw new Error(result.error||'No se confirmó la eliminación de recursos.');return result;}
