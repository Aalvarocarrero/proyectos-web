"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getPendingCount } from "@/lib/offline-db";
import { prepareOfflineSignOut } from "@/lib/offline-owner";

export type Session = { owner: string; canAdmin: boolean; signOutPath: string };
function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<Session>;
  return typeof session.owner === "string" && !!session.owner && session.owner !== "device-local"
    && typeof session.canAdmin === "boolean" && session.signOutPath === "/signout-with-chatgpt?return_to=%2F";
}
const itemClass = "nav-link block w-full rounded-xl px-4 py-3 text-left text-base text-white/85 hover:bg-white/8 hover:text-white";

/** The server decides menu visibility; /admin and its API still authorize each request. */
export function SessionMenu({ onNavigate = () => {}, variant = "menu", initialSession }: { onNavigate?: () => void; variant?: "menu" | "admin"; initialSession?: Session }) {
  const [session, setSession] = useState<Session | null>(() => isSession(initialSession) ? initialSession : null);
  const [checking, setChecking] = useState(false);
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState("");
  useEffect(() => {
    if (initialSession && isSession(initialSession)) return;
    const controller = new AbortController();
    fetch("/api/account-menu", { cache: "no-store", signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(value => { if (!controller.signal.aborted) setSession(isSession(value) ? value : null); })
      .catch(() => undefined);
    return () => controller.abort();
  }, [initialSession]);

  async function reviewSignOut() {
    if (!session || checking) return;
    setChecking(true);
    try {
      const [accountPending, devicePending] = await Promise.all([
        getPendingCount(session.owner), getPendingCount("device-local"),
      ]);
      setWarning(accountPending + devicePending > 0
        ? `Hay ${accountPending} cambios pendientes de esta cuenta y ${devicePending} del espacio local. Se conservarán en este navegador. Vuelve a entrar con la misma cuenta para revisar sus pendientes.`
        : "Tus registros guardados se conservarán en este navegador.");
    } catch {
      setWarning("No pudimos comprobar los cambios pendientes. No se borrarán los registros locales. Puedes cancelar y revisar Mi finca antes de salir.");
    } finally { setChecking(false); setReady(true); }
  }

  if (!session) return null;
  const confirmation = <div className="space-y-3" role="group" aria-label="Confirmar cierre de sesión">
    <p className="text-sm leading-6" role="status">{warning}</p>
    <p className="text-sm leading-6 text-white/70">Guarda cualquier formulario abierto antes de continuar. El acceso sin señal de esta cuenta se desactivará; necesitarás internet para volver a entrar. Cerrar sesión requiere conexión.</p>
    <a href={session.signOutPath} target="_top" className="block rounded-lg bg-white px-3 py-3 text-center font-semibold text-[#211d1a]" onClick={event => {
      if (!navigator.onLine) { event.preventDefault(); setWarning("Conéctate a internet para cerrar la sesión de forma segura."); return; }
      prepareOfflineSignOut();
    }}>Confirmar cierre de sesión</a>
    <button type="button" onClick={() => setReady(false)} className="min-h-11 w-full rounded-lg border border-white/25 px-3 py-2">Cancelar y seguir aquí</button>
  </div>;
  if (variant === "admin") return <>
    <button type="button" onClick={reviewSignOut} disabled={checking} aria-haspopup="dialog" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:opacity-60"><LogOut className="size-4 shrink-0" aria-hidden="true" />{checking ? "Revisando…" : "Cerrar sesión"}</button>
    <Dialog open={ready} onOpenChange={setReady}>
      <DialogContent className="border-white/15 bg-[#211d1a] text-white">
        <DialogTitle className="text-xl">Cerrar sesión</DialogTitle>
        <DialogDescription className="text-white/70">Revisa tus pendientes antes de salir de Venezuela Agro.</DialogDescription>
        {confirmation}
      </DialogContent>
    </Dialog>
  </>;
  return <div className="mt-2 border-t border-white/15 pt-2">
    {session.canAdmin && <Link href="/admin" onClick={onNavigate} className={itemClass}>Administración</Link>}
    {!ready ? <button type="button" onClick={reviewSignOut} disabled={checking} className={itemClass}>{checking ? "Revisando pendientes…" : "Cerrar sesión"}</button> : <div className="px-4 py-3">{confirmation}</div>}
  </div>;
}
