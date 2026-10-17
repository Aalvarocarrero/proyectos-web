"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export type FormFeedbackTone = "error" | "success" | "info";

/** Errors are announced and focused; saved locally is deliberately not a published success. */
export function FormFeedback({ message, tone = "info" }: { message: string; tone?: FormFeedbackTone }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (message && tone === "error") ref.current?.focus(); }, [message, tone]);
  if (!message) return null;
  const Icon = tone === "error" ? AlertCircle : tone === "success" ? CheckCircle2 : Info;
  return <div ref={ref} tabIndex={-1} role={tone === "error" ? "alert" : "status"} aria-atomic="true" className={`flex min-w-0 items-start gap-3 rounded-2xl border p-4 text-sm leading-6 outline-offset-4 ${tone === "error" ? "border-red-200 bg-red-50 text-red-900" : tone === "success" ? "border-[#4c6b3a]/25 bg-[#e8f0df] text-[#365026]" : "border-[#3e2a19]/15 bg-[#faf7ef] text-[#514534]"}`}><Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true"/><span>{message}</span></div>;
}

export function PublicFormGuide({ local = true }: { local?: boolean }) {
  return <aside className="rounded-2xl border border-[#4c6b3a]/20 bg-[#e8f0df]/60 p-4 sm:p-5">
    <p className="font-semibold text-[#365026]">Completa · Revisa · Envía</p>
    <p className="mt-2 text-sm leading-6 text-[#514534]">Los campos con * son obligatorios. Incluye solo datos que quieras hacer públicos. Enviar una solicitud no la publica: primero pasa por revisión.</p>
    <p className="mt-2 text-xs leading-5 text-[#71685f]">{local ? "Al guardar sin conexión, el envío puede quedar pendiente en este dispositivo. Consulta su estado en Mi Finca → Sincronización." : "El envío necesita conexión. Puedes guardar y recuperar un borrador en esta pestaña antes de enviarlo."}</p>
  </aside>;
}
