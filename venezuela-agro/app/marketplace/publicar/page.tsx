import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import {
  chatGPTSignInPath,
  getChatGPTUser,
} from "@/app/chatgpt-auth";
import { ListingForm } from "@/components/listing-form";
import { PublicFooter } from "@/components/public-footer";
import { SiteHeader } from "@/components/site-header";
import { SecurityCenter } from "@/components/security-center";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publicar en Mercado Agro",
  description: "Crea una publicación agropecuaria y guárdala incluso sin conexión.",
  robots: { index: false, follow: false },
};

export default async function PublishPage() {
  const user = await getChatGPTUser();
  return (
    <main className="min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      {user && <SecurityCenter mode="gate" requirePublic />}
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-32 sm:px-8 lg:pt-40">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-[#71685f] hover:text-[#211d1a]">
          <ArrowLeft size={16} /> Volver al mercado
        </Link>
        <p className="section-kicker mt-10">NUEVA PUBLICACIÓN</p>
        <h1 className="font-display mt-4 text-5xl leading-none sm:text-7xl">Vende con información clara.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#675f57]">
          Agrega los datos que ayudarán a un comprador real a decidir. Toda
          publicación se revisa antes de aparecer en el mercado.
        </p>

        <div className="mt-10 rounded-[2rem] border border-[#3e2a19]/10 bg-[#ede1cd] p-6 sm:p-9">
          {user ? (
            <ListingForm sellerName={user.displayName} userId={user.id} />
          ) : (
            <div className="py-10 text-center">
              <LockKeyhole className="mx-auto text-[#4c6b3a]" size={38} />
              <h2 className="font-display mt-5 text-3xl">Inicia sesión para publicar</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#71685f]">
                El acceso protege tus publicaciones, tus borradores y el historial de sincronización.
              </p>
              <a
                href={chatGPTSignInPath("/marketplace/publicar")}
                target="_top"
                className="button-dark mt-7"
              >
                Continuar de forma segura
              </a>
            </div>
          )}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
