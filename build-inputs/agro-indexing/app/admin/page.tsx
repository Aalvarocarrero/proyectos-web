import { HomeContentEditor } from "@/components/home-content-editor";
import { ConnectionIndicator } from "@/components/connection-indicator";
import { AdminNavigation } from "@/components/admin-navigation";
import {isAdminIdentity} from "@/lib/admin-access";
import type { Metadata } from "next";
import { SiteImage as Image } from "@/components/site-image";
import { LockKeyhole } from "lucide-react";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const user = await getChatGPTUser();
  if (!user) return <Access title="Administración protegida" copy="Inicia sesión con una cuenta administradora autorizada para revisar publicaciones y solicitudes." href={chatGPTSignInPath("/admin")} action="Iniciar sesión" />;
  if (!isAdminIdentity(user)) return <Access title="Acceso restringido" copy="Esta cuenta no tiene permisos de administración." href="/" action="Volver al sitio" />;
  return <main className="min-h-screen bg-[#f3ebdd] text-[#3e2a19]">
    <AdminNavigation email={user.email} session={{ owner: user.id, canAdmin: true, signOutPath: chatGPTSignOutPath("/") }} />
    <div className="mx-auto max-w-[1344px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div id="resumen" className="scroll-mt-56 sm:scroll-mt-44">
        <p className="section-kicker">TU CENTRO DE GESTIÓN</p>
        <h1 className="font-display mt-3 text-4xl sm:text-6xl">Panel de administración</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#71685f]">Revisa la comunidad, gestiona publicaciones y atiende solicitudes. Usa las secciones de arriba para ir directamente a lo que necesitas.</p>
      </div>
      <div id="contenido" className="mt-8 scroll-mt-56 sm:scroll-mt-44"><HomeContentEditor /></div>
      <div className="mt-8"><AdminDashboard /></div>
    </div>
  </main>;
}

function Access({ title, copy, href, action }: { title: string; copy: string; href: string; action: string }) {
  return <main className="flex min-h-svh items-center justify-center bg-[#211d1a] px-5 text-white"><section className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-9 text-center"><header className="flex justify-end"><ConnectionIndicator /></header><Image src="/icon-192.png" alt="" width={76} height={76} className="mx-auto rounded-full"/><LockKeyhole className="mx-auto mt-7 text-[#b7d79a]"/><h1 className="font-display mt-5 text-4xl">{title}</h1><p className="mt-4 text-sm leading-7 text-white/55">{copy}</p><a href={href} target={href.startsWith("/signin") ? "_top" : undefined} className="button-light mt-7">{action}</a></section></main>;
}
