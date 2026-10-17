"use client";
import {useEffect,useRef,useState} from 'react';
import {SATELLITE_SAMPLE as pack,SATELLITE_LICENSE} from '@/lib/satellite-packs';
import {beginSatelliteDownload,readSatellitePack,clearSatellitePack,fetchSatellitePack,commitSatellitePack,type SavedSatellitePack} from '@/lib/offline-satellite-store';

async function verifyKnownRaster(blob:Blob){
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),v=>v.toString(16).padStart(2,'0')).join('');if(hash!==pack.sha256)throw new Error('pack_hash_mismatch');
 const url=URL.createObjectURL(blob);try{const image=new window.Image();image.src=url;await image.decode();if(image.naturalWidth!==pack.width||image.naturalHeight!==pack.height)throw new Error('pack_dimensions_mismatch');}finally{URL.revokeObjectURL(url);}
}
export function SatelliteDownload({owner,coversView,onExplore,onAvailable}:{owner:string;coversView:boolean;onExplore:()=>void;onAvailable:(saved:SavedSatellitePack|null)=>void}){
 const [saved,setSaved]=useState<SavedSatellitePack|null>(null),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[message,setMessage]=useState(''),[storage,setStorage]=useState('');
 const active=useRef(true),flight=useRef<AbortController|null>(null),locked=useRef(false),generation=useRef(0);
 useEffect(()=>{active.current=true;const run=++generation.current;void readSatellitePack(owner,pack).then(async value=>{if(value)await verifyKnownRaster(value.blob);if(active.current&&run===generation.current){setSaved(value);onAvailable(value);}}).catch(()=>{if(active.current)setMessage('No pudimos leer la imagen local. Tus registros de finca no se modificaron.');});return()=>{active.current=false;flight.current?.abort();onAvailable(null);};},[owner,onAvailable]);
 async function download(){
  if(locked.current||!coversView)return;locked.current=true;const run=++generation.current,controller=new AbortController();flight.current=controller;setBusy(true);setProgress(0);setMessage('');const timer=setTimeout(()=>controller.abort(),60000);
  try{
   if(!navigator.onLine)throw new Error('offline');
   if(navigator.storage?.estimate){const estimate=await navigator.storage.estimate();if(estimate.quota!==undefined&&estimate.usage!==undefined){const available=Math.max(0,estimate.quota-estimate.usage);setStorage(`Espacio estimado disponible: ${(available/1048576).toFixed(1)} MB.`);if(available<pack.bytes*2+1048576)throw new Error('storage_low');}}
   const token=await beginSatelliteDownload(owner);if(controller.signal.aborted)throw new Error('cancelled');
   const blob=await fetchSatellitePack(pack,controller.signal,bytes=>{if(active.current&&run===generation.current)setProgress(bytes);});
   await verifyKnownRaster(blob);if(controller.signal.aborted)throw new Error('cancelled');
   const value=await commitSatellitePack(owner,pack,blob,token,controller.signal);
   if(active.current&&run===generation.current){setSaved(value);onAvailable(value);setMessage('Imagen guardada en este dispositivo. Puedes consultarla sin señal dentro de esta zona.');}
  }catch(error){if(active.current&&run===generation.current)setMessage(controller.signal.aborted?'Descarga cancelada o interrumpida. La copia anterior, si existía, se conserva.':error instanceof Error&&error.message==='storage_low'?'No hay espacio suficiente estimado. Libera espacio sin borrar tus registros y vuelve a intentarlo.':'No se pudo completar la descarga. La copia anterior y tus registros se conservan.');}
  finally{clearTimeout(timer);if(flight.current===controller)flight.current=null;locked.current=false;if(active.current&&run===generation.current)setBusy(false);}
 }
 async function remove(){const run=++generation.current;flight.current?.abort();try{await clearSatellitePack(owner,pack.id);if(active.current&&run===generation.current){setSaved(null);onAvailable(null);setBusy(false);setMessage('Imagen local eliminada. Tus polígonos, registros y pendientes siguen guardados.');}}catch{if(active.current)setMessage('No se pudo eliminar la imagen local.');}}
 return <div className="mt-4 min-w-0 rounded-[22px] border border-[#4c6b3a]/20 bg-white p-4 sm:p-6">
  <p className="text-xs font-bold uppercase tracking-wider text-[#4c6b3a]">Satélite · zona disponible</p>
  <h4 className="font-display mt-2 text-xl">¿Lo necesitas sin internet? Descarga esta zona</h4>
  <p className="mt-2 text-sm leading-6">{pack.title} · {(pack.bytes/1048576).toFixed(2)} MB · resolución de origen {pack.resolutionM} m.</p>
  <p className="mt-1 text-xs leading-6 text-[#71685f]">Captura: 21 de enero de 2026. {pack.qualityNote} Es una muestra pública limitada; no cubre todas las fincas de Venezuela.</p>
  {!coversView&&<p className="mt-3 text-sm font-semibold text-[#6b4a2f]">No hay imagen disponible que cubra toda esta vista. Tu mapa y tus datos siguen funcionando.</p>}
  <div className="mt-4 flex flex-wrap gap-2">
   <button type="button" onClick={onExplore} className="min-h-11 max-w-full rounded-full border px-4 py-2 text-sm font-semibold">Explorar zona de muestra</button>
   <button type="button" disabled={busy||!coversView} onClick={()=>void download()} className="min-h-11 max-w-full rounded-full bg-[#4c6b3a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-45">{busy?`Descargando ${Math.round(progress/pack.bytes*100)}%`:saved?'Volver a descargar esta zona':'Descargar esta zona'}</button>
   {busy&&<button type="button" onClick={()=>flight.current?.abort()} className="min-h-11 rounded-full border px-4 py-2 text-sm">Cancelar descarga</button>}
   {saved&&<button type="button" onClick={()=>void remove()} className="min-h-11 rounded-full border px-4 py-2 text-sm">Quitar imagen descargada</button>}
  </div>
  {saved&&<p className="mt-3 text-sm font-semibold text-[#365026]">Copia local guardada el {new Date(saved.downloadedAt).toLocaleDateString('es-VE')}. Solo esta zona está descargada.</p>}
  {message&&<p role="status" aria-live="polite" className="mt-3 text-sm leading-6">{message}</p>}
  {storage&&<p className="mt-2 text-xs text-[#71685f]">{storage}</p>}
  <p className="mt-3 text-xs leading-6 text-[#71685f]">Prepara también Mi Finca antes de salir sin señal. El navegador puede liberar almacenamiento; comprueba tu copia antes de salir. El respaldo JSON de registros no incluye esta imagen; puedes descargarla nuevamente.</p>
  <p className="mt-2 text-xs leading-6"><a href={pack.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Fuente y fecha</a> · <a href={SATELLITE_LICENSE} target="_blank" rel="noopener noreferrer" className="underline">Licencia Copernicus</a><br/>{pack.attribution}. Recorte y reproyección; sin fecha de caducidad de uso definida para esta copia abierta.</p>
 </div>;
}
