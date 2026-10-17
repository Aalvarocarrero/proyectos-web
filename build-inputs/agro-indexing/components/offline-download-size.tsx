'use client';
import { useEffect, useState } from 'react';
import { formatFarmPackBytes } from '@/lib/farm-asset-pack';
/** Reads only a small manifest. Never starts or promises a package download. */
export function OfflineDownloadSize({pack='core'}:{pack?:'core'|'3d'}) {
  const [bytes,setBytes]=useState<number|null>(null);
  useEffect(()=>{
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);
    void fetch(pack==='core'?'/offline-assets.json':'/farm-3d/manifest.json',{cache:'no-store',signal:controller.signal}).then(response=>{if(!response.ok)throw new Error();return response.json();}).then(value=>{
      if(!value || typeof value!=='object')return;
      const manifest=value as {download?:{knownBytes?:unknown};totalBytes?:unknown};
      const size=pack==='core'?manifest.download?.knownBytes:manifest.totalBytes;
      if(typeof size==='number' && Number.isSafeInteger(size)&&size>0&&size<100_000_000)setBytes(size);
    }).catch(()=>undefined).finally(()=>clearTimeout(timer));
    return()=>{clearTimeout(timer);controller.abort();};
  },[pack]);
  return <p className="mt-2 text-xs leading-5 text-[#675f57]">{bytes!==null?`${pack==='core'?'Archivos base':'Modelos y texturas'}: ${formatFarmPackBytes(bytes)}${pack==='core'?' sin comprimir, más las páginas de la app.':' sin comprimir, más un pequeño archivo de licencias.'} La descarga real varía por compresión y archivos ya guardados.`:'Tamaño de descarga sin confirmar. Conecta para consultarlo antes de usar tus datos móviles.'}</p>;
}
