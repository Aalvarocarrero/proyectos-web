import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { isAdminIdentity } from "@/lib/admin-access";
import { HomePageContent } from "@/components/home-page-content";
import { HOME_DEFAULTS, parseHomeContent } from "@/lib/home-content";
import { readHomeDocument } from "@/lib/home-content-db";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {title: "Vista previa del inicio", robots: {index: false, follow: false}};
export default async function HomePreview() {
  if (!isAdminIdentity(await getChatGPTUser())) notFound();
  let row;
  try { row = await readHomeDocument(); }
  catch { return <main className="p-8">No pudimos cargar el borrador. Vuelve al panel e inténtalo de nuevo.</main>; }
  return <><aside className="fixed inset-x-0 bottom-0 z-[70] border-t border-amber-300 bg-amber-100 p-3 text-center text-sm text-black">Vista previa del borrador guardado. No está publicado. <a href="/admin#contenido" className="underline">Volver al editor</a></aside><HomePageContent content={parseHomeContent(row?.draftJson) ?? HOME_DEFAULTS} /></>;
}
