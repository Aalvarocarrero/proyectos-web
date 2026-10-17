"use client";
import {useSyncExternalStore} from 'react';
import {getInstallGuidance} from '@/lib/install-guidance';
import {installActionSnapshot,installActionServerSnapshot,subscribeInstallAction,requestInstallAction} from '@/lib/install-action';
export function DeviceInstallAction(){
 const state=useSyncExternalStore(subscribeInstallAction,installActionSnapshot,installActionServerSnapshot),guidance=getInstallGuidance(state.environment,state.nativePrompt);
 const label=state.installed?'Aplicación ya instalada':state.environment.os==='ios'?'Ver cómo añadir a inicio':state.ready?guidance.action:'Ver opciones de instalación';
 return <div className="my-6 min-w-0 rounded-2xl border border-[#4c6b3a]/20 bg-white p-5 text-[#3e2a19]"><button type="button" disabled={!state.ready||state.installed} onClick={()=>requestInstallAction()} className="min-h-12 max-w-full rounded-full bg-[#4c6b3a] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{label}</button><p className="mt-3 text-xs leading-6">{state.nativePrompt?'El navegador abrirá su confirmación; tú decides si instalar.':'Mostramos los pasos disponibles para tu navegador. En iPhone y iPad, Safari requiere que abras Compartir y confirmes Añadir.'} Instalar el icono no descarga automáticamente tus datos: prepara Mi Finca por separado para usarla sin señal.</p></div>;
}
