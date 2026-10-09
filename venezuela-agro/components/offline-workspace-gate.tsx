"use client";
import { useSyncExternalStore } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { chooseOfflineWorkspace, offlineChoiceRequired, subscribeOfflineChoice } from "@/lib/offline-owner";
export function OfflineWorkspaceGate() {
 const required=useSyncExternalStore(subscribeOfflineChoice,offlineChoiceRequired,()=>false);
 return <Dialog open={required} onOpenChange={open=>{if(!open)chooseOfflineWorkspace(false);}}><DialogContent showCloseButton={false} className="z-[200] rounded-3xl bg-[#f3ebdd] p-6 text-[#211d1a] shadow-2xl sm:p-8" onPointerDownOutside={event=>event.preventDefault()}>
  <DialogTitle className="font-display text-3xl">¿Qué espacio quieres abrir?</DialogTitle>
  <DialogDescription className="text-sm leading-6 text-[#5f574f]">No pudimos comprobar la cuenta con internet. En este dispositivo autorizaste conservar un espacio de cuenta para trabajar sin señal. Ábrelo solo si eres su titular y este sigue siendo tu dispositivo de confianza.</DialogDescription>
  <div className="grid gap-3"><button onClick={()=>chooseOfflineWorkspace(true)} className="rounded-full bg-[#4c6b3a] px-5 py-3 font-bold text-white">Abrir mi espacio guardado</button><button onClick={()=>chooseOfflineWorkspace(false)} className="rounded-full border border-[#3e2a19]/25 px-5 py-3 font-bold">Usar el espacio local sin cuenta</button></div>
  <p className="text-xs leading-5 text-[#71685f]">Esta elección no inicia sesión ni publica datos. Antes de enviar cambios se verificará la misma cuenta. El navegador conserva los datos localmente: protege tu teléfono con su bloqueo de pantalla.</p>
 </DialogContent></Dialog>;
}
