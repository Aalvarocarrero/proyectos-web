"use client";
import { lazy, Suspense, useState } from 'react';
const Listing=lazy(()=>import('@/components/listing-form').then(m=>({default:m.ListingForm})));
const Professional=lazy(()=>import('@/components/community-forms').then(m=>({default:m.ProfessionalForm})));
export function LearningFormPreview({kind}:{kind:'listing'|'professional'}){
 const [open,setOpen]=useState(false);
 return <details onToggle={e=>setOpen(e.currentTarget.open)} className="mt-7 rounded-2xl border bg-white p-5"><summary className="cursor-pointer text-sm font-semibold">Explorar el formulario real · muestra sin envío</summary><p className="mt-3 text-xs leading-6 text-[#71685f]">Esta vista utiliza los mismos campos de la plataforma. Está deshabilitada para evitar crear registros de prueba. Para guardar tus datos, usa el botón que abre el área correspondiente.</p>{open&&<div className="mt-5 max-h-[60dvh] overflow-y-auto overscroll-contain rounded-xl bg-[#f8f3ea] p-4"><fieldset disabled className="min-w-0 pointer-events-none"><Suspense fallback={<p>Cargando formulario…</p>}>{kind==='listing'?<Listing sellerName="Nombre del responsable"/>:<Professional name="Tu nombre profesional"/>}</Suspense></fieldset></div>}</details>;
}
