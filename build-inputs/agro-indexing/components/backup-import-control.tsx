"use client";
import { useRef, useState } from "react";
import { MAX_BACKUP_BYTES, parseLocalBackup, type LocalBackup } from "@/lib/backup-import";
import { importBackupToDevice } from "@/lib/offline-db";
export function BackupImportControl(){
 const [preview,setPreview]=useState<{text:string;data:LocalBackup}|null>(null);
 const [notice,setNotice]=useState("");
 const [busy,setBusy]=useState(false);
 const generation=useRef(0);
 async function read(file?:File){const current=++generation.current;setPreview(null);setNotice("");if(!file)return;try{if(file.size>MAX_BACKUP_BYTES)throw new Error("El archivo supera 15 MB.");const text=await file.text();const data=parseLocalBackup(text);if(current===generation.current)setPreview({text,data});}catch(error){if(current===generation.current)setNotice(error instanceof Error?error.message:"No se pudo leer la copia.");}}
 async function apply(){if(!preview||busy)return;setBusy(true);try{const result=await importBackupToDevice(preview.text);setNotice(`${result.imported} registros y ${result.deletions} bajas pendientes importados solo al espacio local. ${result.skipped} elementos actuales conservados sin sobrescribir. No se ha enviado ni publicado nada.`);setPreview(null);}catch(error){setNotice(error instanceof Error?error.message:"No se pudo importar la copia.");}finally{setBusy(false);}}
 return <details className="mt-5 rounded-xl border border-[#3e2a19]/15 p-4"><summary className="cursor-pointer text-sm font-bold">Restaurar mi copia en este dispositivo o dominio</summary>
  <p className="mt-3 text-xs leading-5 text-[#71685f]">Selecciona una copia JSON de Venezuela Agro (hasta 15 MB). Se revisa antes de importar. Siempre se restaura en el espacio local sin cuenta, aunque hayas iniciado sesión. Conservamos registros actuales y bajas pendientes; no enviamos pedidos, publicaciones ni datos a una cuenta.</p>
  <label className="mt-4 block text-sm font-semibold">Elegir copia JSON<input type="file" accept="application/json,.json" disabled={busy} onChange={event=>void read(event.target.files?.[0])} className="mt-2 block w-full min-w-0 text-xs"/></label>
  {preview&&<div className="mt-4 rounded-xl bg-[#f3ebdd] p-4 text-sm leading-6"><p>{preview.data.entities.length} registros · {preview.data.outbox.length} cambios pendientes.</p><p className="break-all text-xs">Copia del {preview.data.exportedAt} · origen: {preview.data.origin}</p><p className="mt-2">Confirma únicamente si esta copia te pertenece o estás autorizado a usar sus datos. Los registros existentes tendrán prioridad. Las fotos remotas necesitan seguir disponibles en su origen.</p><div className="mt-3 flex flex-wrap gap-3"><button disabled={busy} onClick={()=>void apply()} className="rounded-full bg-[#4c6b3a] px-4 py-3 font-bold text-white">{busy?"Importando…":"Importar solo al espacio local"}</button><button disabled={busy} onClick={()=>{generation.current++;setPreview(null);setNotice("Importación cancelada. No se cambió ningún registro.");}} className="rounded-full border px-4 py-3">Cancelar</button></div></div>}
  {notice&&<p role="status" className="mt-3 text-sm leading-6">{notice}</p>}
  <a href="/app-local" className="mt-3 inline-block text-sm font-bold underline">Abrir el espacio local</a>
 </details>;
}
