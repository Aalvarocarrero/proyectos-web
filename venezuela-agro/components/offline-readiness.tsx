"use client";
import { BackupImportControl } from "@/components/backup-import-control";
import { rememberOfflineWorkspace, forgetOfflineWorkspace } from "@/lib/offline-owner";
import { useEffect, useState } from "react";
import { exportLocalBackup, getLegacyRecordCount, recoverLegacyOnDevice } from "@/lib/offline-db";

type Status = {ready:boolean; version?:string; preparedAt?:string; error?:string};
async function workerStatus(prepare=false): Promise<Status> {
  if (!("serviceWorker" in navigator)) return {ready:false,error:"Este navegador no permite preparar la app sin conexión."};
  let expectedVersion:string|undefined;
  if(navigator.onLine){
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);
    try{const response=await fetch("/offline-assets.json",{cache:"no-store",signal:controller.signal});if(!response.ok)throw new Error();const manifest=await response.json() as {revision?:string};expectedVersion=manifest.revision;if(!expectedVersion)throw new Error();}
    catch{return {ready:false,error:"No se pudo verificar la versión actual. Mantén la conexión y vuelve a comprobar."};}
    finally{clearTimeout(timer);}
  }
  const registration = await navigator.serviceWorker.getRegistration();
  const worker = registration?.active;
  if (!worker) return {ready:false,error:"La preparación inicial sigue pendiente. Mantén internet, espera un momento y vuelve a comprobar."};
  return new Promise(resolve=>{
    const channel = new MessageChannel();
    const timeout=setTimeout(()=>{channel.port1.close();resolve({ready:false,error:"La preparación tardó más de lo esperado. Comprueba tu conexión y vuelve a intentarlo."});},120000);
    channel.port1.onmessage=event=>{clearTimeout(timeout);channel.port1.close();const status=event.data as Status;resolve(status.ready && expectedVersion && status.version!==expectedVersion ? {ready:false,error:"Se está instalando una versión nueva. Espera un momento y vuelve a comprobar antes de salir sin señal."} : status);};
    worker.postMessage({type:prepare?"PREPARE_OFFLINE":"OFFLINE_STATUS"},[channel.port2]);
  });
}
export function OfflineReadiness(){
  const [status,setStatus]=useState<Status>({ready:false});
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const [legacyCount,setLegacyCount]=useState(0);
  useEffect(()=>{void getLegacyRecordCount().then(setLegacyCount).catch(()=>undefined);},[]);
  useEffect(()=>{let active=true;const check=()=>{void workerStatus().then(s=>{if(active)setStatus(s);}).catch(()=>{if(active)setStatus({ready:false});});};check();navigator.serviceWorker?.addEventListener("controllerchange",check);return()=>{active=false;navigator.serviceWorker?.removeEventListener("controllerchange",check);};},[]);
  async function prepare(){if(busy)return;setBusy(true);try{setStatus(await workerStatus(true));}catch{setStatus({ready:false,error:"No se pudo preparar el dispositivo."});}finally{setBusy(false);}}
  async function backup(legacy=false){try{const data=await exportLocalBackup(legacy);const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));const link=document.createElement("a");link.href=url;link.download=`venezuela-agro-${legacy?"registros-anteriores":"respaldo"}-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);setNotice("Copia descargada. Contiene datos privados y cambios pendientes: guárdala en un lugar seguro. Las fotos remotas no se descargan en esta copia.");}catch{setNotice("No se pudo leer la copia local. No borres los datos de este navegador.");}}
  async function recover(){if(!window.confirm("¿Recuperar los registros anteriores solo en este dispositivo? Pueden incluir información de cuentas usadas aquí antes. No se enviarán ni se asignarán a una cuenta; no se sobrescriben registros actuales."))return;try{const count=await recoverLegacyOnDevice();setNotice(`${count} registros recuperados en el espacio local. Los anteriores siguen conservados. No se enviarán automáticamente.`);}catch(error){setNotice(error instanceof Error?error.message:"No se pudo recuperar la copia anterior.");}}
  async function trust(){if(!window.confirm("¿Es tu dispositivo personal de confianza? Guardaremos el acceso local a esta cuenta para que puedas elegir abrirla sin internet después de cerrar la app. Los datos no están cifrados por la aplicación. No actives esto en un navegador compartido; protege el dispositivo con su bloqueo de pantalla."))return;try{await rememberOfflineWorkspace();setNotice("Acceso sin señal preparado para esta cuenta. Al reabrir sin internet, elige Abrir mi espacio guardado. Antes de enviar cambios verificaremos la misma cuenta.");}catch(error){setNotice(error instanceof Error?error.message:"No se pudo preparar el acceso.");}}
  function forget(){try{forgetOfflineWorkspace();setNotice("Acceso recordado desactivado. Tus registros no se borraron. Para identificar la cuenta en una nueva sesión necesitarás internet.");}catch{setNotice("No se pudo cambiar el acceso recordado.");}}
  async function protect(){try{const result=await navigator.storage?.persist?.();setNotice(result?"El navegador concedió almacenamiento persistente. Mantén también una copia descargada.":"El navegador no concedió almacenamiento persistente. Descarga una copia y evita borrar los datos del sitio.");}catch{setNotice("Este navegador no permite solicitar persistencia. Descarga una copia de seguridad.");}}
  return <section className="mt-6 rounded-2xl border border-[#4c6b3a]/20 bg-white p-5 sm:p-6" aria-label="Preparación sin conexión">
    {legacyCount > 0 && <div className="mb-4 rounded-xl bg-[#fff7e8] p-4 text-sm leading-6"><strong>{legacyCount} elementos de la versión anterior conservados.</strong><p>Están separados para evitar asignarlos a una cuenta equivocada. No se han borrado ni enviado. Descarga esta copia antes de una migración supervisada; la copia actual usa un espacio separado por cuenta o dispositivo.</p><button className="mt-2 font-bold underline" onClick={()=>void backup(true)}>Descargar registros anteriores</button><div className="mt-2"><a href="/app-local" className="font-bold underline">Abrir espacio local sin cuenta</a><button className="ml-3 font-bold underline" onClick={()=>void recover()}>Recuperar aquí, solo en este dispositivo</button></div></div>}
    <p className="text-sm font-bold text-[#365026]" role="status">{busy?"Preparando los recursos de la app…":status.ready?"Mi Finca preparada para trabajar sin señal en este navegador":"Comprueba la preparación antes de salir sin señal"}</p>
    <p className="mt-2 text-sm leading-6 text-[#71685f]">La primera carga requiere internet. Esta preparación guarda Mi Finca y su código; tus registros se conservan en este navegador. No confirma un respaldo central. Enviar solicitudes, publicar y consultar novedades necesitan conexión.</p>
    {status.error && <p className="mt-2 text-sm text-[#8d372a]">{status.error}</p>}
    <div className="mt-4 flex flex-wrap gap-3">
      <button disabled={busy} onClick={()=>void prepare()} className="rounded-full bg-[#4c6b3a] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?"Preparando…":"Preparar / comprobar sin señal"}</button>
      <button onClick={()=>void backup()} className="rounded-full border px-4 py-3 text-sm font-bold">Descargar copia local</button>
      <button disabled={!status.ready} onClick={()=>void trust()} className="rounded-full border px-4 py-3 text-sm font-bold disabled:opacity-50">Preparar mi cuenta para reabrir sin señal</button>
      <button onClick={forget} className="rounded-full border px-4 py-3 text-sm font-bold">Olvidar acceso sin señal</button>
      <button onClick={()=>void protect()} className="rounded-full border px-4 py-3 text-sm font-bold">Proteger almacenamiento</button>
    </div>
    <p className="mt-3 text-xs leading-5 text-[#71685f]">Para reabrir registros de una cuenta sin internet, prepara también su acceso en este dispositivo de confianza. El espacio local sin cuenta se puede reabrir directamente. Antes de cambiar de dominio, navegador o dispositivo, descarga tu copia y comprueba los pendientes. Puedes importar una copia revisada al espacio local del nuevo dominio, sin asignarla a una cuenta. No compartas este navegador si contiene registros privados.</p>
    {notice && <p role="status" className="mt-3 text-sm leading-6">{notice}</p>}
    <p className="mt-5 text-sm"><a href="/biblioteca-local" className="font-bold underline">Descargar biblioteca, tienda y directorios para consultar sin señal</a></p><BackupImportControl />
  </section>;
}
