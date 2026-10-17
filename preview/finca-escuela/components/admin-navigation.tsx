import { ConnectionIndicator } from "@/components/connection-indicator";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { VenezuelaAgroLogo } from "@/components/venezuelaagro-logo";
import { SessionMenu, type Session } from "@/components/session-menu";

export const adminSections = [
  ["resumen", "Resumen"],
  ["contenido", "Inicio y SEO"],
  ["public-farm", "Fincas"],
  ["social-post", "Comunidad"],
  ["social-comment", "Comentarios"],
  ["aprende", "Aprende"],
  ["mercado", "Mercado"],
  ["empresas", "Empresas"],
  ["profesionales", "Profesionales"],
  ["proyectos", "Proyectos"],
  ["ideas", "Ideas"],
  ["solicitudes", "Solicitudes"],
  ["personas", "Personas"],
] as const;

export function AdminNavigation({ email, session }: { email: string; session: Session }) {
  return <header className="sticky top-0 z-40 border-b border-[#3e2a19]/10 bg-[#211d1a] text-white shadow-sm">
    <div className="mx-auto max-w-[1344px] px-4 py-3 sm:px-8 lg:px-12">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <Link href="/" aria-label="Venezuela Agro, ir al inicio" className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><VenezuelaAgroLogo compact /></Link>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:justify-start">
          <div className="min-w-0 text-right sm:text-left">
            <p className="flex flex-wrap items-center justify-end gap-2 text-xs font-semibold text-[#b7d79a] sm:justify-start"><ShieldCheck aria-hidden="true" className="size-4 shrink-0" />Administración</p>
            <p className="mt-1 break-all text-xs text-white/70">{email}</p>
          </div>
          <ConnectionIndicator />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#211d1a] hover:bg-[#f3ebdd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><ArrowLeft className="size-4 shrink-0" aria-hidden="true" />Volver al sitio</Link>
          <SessionMenu variant="admin" initialSession={session} />
        </div>
      </div>
    </div>
    <nav aria-label="Secciones de administración" className="border-t border-white/10">
      <div className="mx-auto flex max-w-[1344px] gap-1 overflow-x-auto px-4 py-2 sm:px-8 lg:px-12">
        {adminSections.map(([id, label]) => <a key={id} href={`#${id}`} className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white">{label}</a>)}
      </div>
    </nav>
  </header>;
}
