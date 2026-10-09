import {VenezuelaAgroLogo} from "@/components/venezuelaagro-logo";
import {isAdminIdentity} from "@/lib/admin-access";
import type { Metadata } from "next";
import { SiteImage as Image } from "@/components/site-image";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const user = await getChatGPTUser();
  if (!user) return <Access title="Administración protegida" copy="Inicia sesión con una cuenta administradora autorizada para revisar publicaciones y solicitudes." href={chatGPTSignInPath("/admin")} action="Iniciar sesión" />;
  if (!isAdminIdentity(user)) return <Access title="Acceso restringido" copy="Esta cuenta no tiene permisos de administración." href="/" action="Volver al sitio" />;
  return <main className="min-h-screen bg-[#f3ebdd]"><header className="border-b border-[#3e2a19]/10 bg-[#211d1a] px-5 py-5 text-white sm:px-8"><div className="mx-auto flex max-w-[1344px] items-center justify-between"><Link href="/" className="flex items-center gap-3"><VenezuelaAgroLogo compact/><span className="text-sm font-bold">Administración</span></Link><span className="text-xs text-white/45">{user.email}</span></div></header><div className="mx-auto max-w-[1344px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16"><h1 className="font-display text-5xl sm:text-6xl">Operación y confianza.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[#71685f]">Aprueba publicaciones del Mercado Agro y gestiona las solicitudes de la tienda.</p><div className="mt-12"><AdminDashboard /></div></div></main>;
}

function Access({ title, copy, href, action }: { title: string; copy: string; href: string; action: string }) {
  return <main className="flex min-h-svh items-center justify-center bg-[#211d1a] px-5 text-white"><section className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-9 text-center"><Image src="/icon-192.png" alt="" width={76} height={76} className="mx-auto rounded-full"/><LockKeyhole className="mx-auto mt-7 text-[#b7d79a]"/><h1 className="font-display mt-5 text-4xl">{title}</h1><p className="mt-4 text-sm leading-7 text-white/55">{copy}</p><a href={href} target={href.startsWith("/signin") ? "_top" : undefined} className="button-light mt-7">{action}</a></section></main>;
}
