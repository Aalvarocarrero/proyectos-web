"use client";
import { OfflinePreparation } from "@/components/offline-preparation";
import { FarmAssetPack } from "@/components/farm-asset-pack";
import { BackupImportControl } from "@/components/backup-import-control";
import { rememberOfflineWorkspace, forgetOfflineWorkspace } from "@/lib/offline-owner";
import { useEffect, useState } from "react";
import { exportLocalBackup, getLegacyRecordCount, recoverLegacyOnDevice } from "@/lib/offline-db";

export function OfflineReadiness({localOnly=false}:{localOnly?:boolean}){
  const [ready,setReady]=useState(false);
  const [notice,setNotice]=useState("");
  const [legacyCount,setLegacyCount]=useState(0);
  useEffect(()=>{void getLegacyRecordCount().then(setLegacyCount).catch(()=>undefined);},[]);
  async function backup(legacy=false){try{const data=await exportLocalBackup(legacy);const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));const link=document.createElement("a");link.href=url;link.download=`venezuela-agro-${legacy?"registros-anteriores":"respaldo"}-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);setNotice("Copia descargada. Contiene datos privados y cambios pendientes: guárdala en un lugar seguro. Las fotos remotas no se descargan en esta copia.");}catch{setNotice("No se pudo leer la copia local. No borres los datos de este navegador.");}}
  async function recover(){if(!window.confirm("¿Recuperar los registros anteriores solo en este dispositivo? Pueden incluir información de cuentas usadas aquí antes. No se enviarán ni se asignarán a una cuenta; no se sobrescriben registros actuales."))return;try{const count=await recoverLegacyOnDevice();setNotice(`${count} registros recuperados en el espacio local. Los anteriores siguen conservados. No se enviarán automáticamente.`);}catch(error){setNotice(error instanceof Error?error.message:"No se pudo recuperar la copia anterior.");}}
  async function trust(){if(!window.confirm("¿Es tu dispositivo personal de confianza? Guardaremos el acceso local a esta cuenta para que puedas elegir abrirla sin internet después de cerrar la app. Los datos no están cifrados por la aplicación. No actives esto en un navegador compartido; protege el dispositivo con su bloqueo de pantalla."))return;try{await rememberOfflineWorkspace();setNotice("Acceso sin señal preparado para esta cuenta. Al reabrir sin internet, elige Abrir mi espacio guardado. Antes de enviar cambios verificaremos la misma cuenta.");}catch(error){setNotice(error instanceof Error?error.message:"No se pudo preparar el acceso.");}}
  function forget(){try{forgetOfflineWorkspace();setNotice("Acceso recordado desactivado. Tus registros no se borraron. Para identificar la cuenta en una nueva sesión necesitarás internet.");}catch{setNotice("No se pudo cambiar el acceso recordado.");}}
  async function protect(){try{const result=await navigator.storage?.persist?.();setNotice(result?"El navegador concedió almacenamiento persistente. Mantén también una copia descargada.":"El navegador no concedió almacenamiento persistente. Descarga una copia y evita borrar los datos del sitio.");}catch{setNotice("Este navegador no permite solicitar persistencia. Descarga una copia de seguridad.");}}
  return <section className="mt-6 rounded-2xl border border-[#4c6b3a]/20 bg-white p-5 sm:p-6" aria-label="Preparación sin conexión">
    {legacyCount > 0 && <div className="mb-4 rounded-xl bg-[#fff7e8] p-4 text-sm leading-6"><strong>{legacyCount} elementos de la versión anterior conservados.</strong><p>Están separados para evitar asignarlos a una cuenta equivocada. No se han borrado ni enviado. Descarga esta copia antes de una migración supervisada; la copia actual usa un espacio separado por cuenta o dispositivo.</p><button className="mt-2 font-bold underline" onClick={()=>void backup(true)}>Descargar registros anteriores</button><div className="mt-2"><a href="/app-local" className="font-bold underline">Abrir espacio local sin cuenta</a><button className="ml-3 font-bold underline" onClick={()=>void recover()}>Recuperar aquí, solo en este dispositivo</button></div></div>}
    <h2 className="mb-2 text-lg font-bold text-[#3e2a19]">Prepara tu trabajo sin señal</h2>
    <ol className="mb-4 space-y-2 text-sm leading-6 text-[#5f574f]"><li><strong>1. Prepara lo básico.</strong> Termina la descarga de Mi Finca y comprueba que aparezca «preparadas sin señal».</li><li><strong>2. Elige lo adicional.</strong> Descarga modelos 3D o la biblioteca solo si los vas a usar.</li><li><strong>3. Guarda una copia.</strong> Antes de salir, descarga tus registros y revisa si quedan cambios por enviar.</li></ol>
    <OfflinePreparation onReady={setReady} />
    <details className="mt-4 rounded-xl border border-[#4c6b3a]/20 px-4"><summary className="min-h-11 cursor-pointer py-3 text-sm font-bold">Opcional: modelos y texturas para el plano 3D</summary><FarmAssetPack className="mb-4" /></details>
    <p className="mt-2 text-sm leading-6 text-[#71685f]">Tus registros se conservan en este navegador. Esta descarga no confirma un respaldo central. Enviar solicitudes, publicar y consultar novedades necesitan conexión.</p>
    <div className="mt-5 rounded-2xl border border-[#4c6b3a]/20 bg-[#f3f6ee] p-4">
      <h3 className="font-bold text-[#365026]">Protege una copia de tus registros</h3>
      <p className="mt-2 text-sm leading-6 text-[#5f574f]">Descárgala antes de cambiar de navegador, borrar datos o usar otro dispositivo. Incluye los cambios pendientes; guarda el archivo en un lugar privado.</p>
      <button onClick={()=>void backup()} className="mt-3 min-h-11 rounded-full bg-[#365026] px-5 py-3 text-sm font-bold text-white">Descargar copia local</button>
    </div>
    <details className="mt-4 rounded-xl border border-[#3e2a19]/15 px-4">
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold">{localOnly ? "Opciones de almacenamiento del dispositivo" : "Acceso de cuenta y almacenamiento del dispositivo"}</summary>
      {!localOnly && !ready && <p className="mb-3 text-sm leading-6 text-[#71685f]">Primero termina «Preparar / comprobar sin señal» para habilitar el acceso de tu cuenta.</p>}
      <div className="flex flex-wrap gap-3 pb-4">
        {!localOnly && <button disabled={!ready} onClick={()=>void trust()} className="min-h-11 rounded-full border px-4 py-3 text-sm font-bold disabled:opacity-50">Preparar mi cuenta para reabrir sin señal</button>}
        {!localOnly && <button onClick={forget} className="min-h-11 rounded-full border px-4 py-3 text-sm font-bold">Olvidar acceso sin señal</button>}
        <button onClick={()=>void protect()} className="min-h-11 rounded-full border px-4 py-3 text-sm font-bold">Proteger almacenamiento</button>
      </div>
    </details>
    <p className="mt-3 text-xs leading-5 text-[#71685f]">Para reabrir registros de una cuenta sin internet, prepara también su acceso en este dispositivo de confianza. El espacio local sin cuenta se puede reabrir directamente. Antes de cambiar de dominio, navegador o dispositivo, descarga tu copia y comprueba los pendientes. Puedes importar una copia revisada al espacio local del nuevo dominio, sin asignarla a una cuenta. No compartas este navegador si contiene registros privados.</p>
    {notice && <p role="status" className="mt-3 text-sm leading-6">{notice}</p>}
    <p className="mt-5 text-sm"><a href="/biblioteca-local" className="font-bold underline">Opcional: descargar biblioteca, tienda y directorios para consultar sin señal</a></p><BackupImportControl />
  </section>;
}
