/* eslint-disable @next/next/no-html-link-for-pages -- Retry must reload the failed server response, not reuse the current route. */
import { SectionGuide } from "@/components/section-guide";
import { pageMetadata } from "@/lib/indexing-policy";
import {publicProfessionalRow} from "@/lib/public-records";
import { ProfessionalDirectory } from "@/components/professional-directory";
import { professionalExamples } from "@/lib/professional-examples";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { ProfessionalManager } from "@/components/professional-manager";
import { PublicFooter } from "@/components/public-footer";
import { SiteHeader } from "@/components/site-header";
import { getDb } from "@/db";
import { professionals } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata:Metadata=pageMetadata('/profesionales','Profesionales del agro venezolano','Directorio de veterinarios, ingenieros agrónomos y especialistas que prestan servicios al productor venezolano.');

export default async function ProfessionalsPage() {
  const user = await getChatGPTUser();
  let rows:Array<typeof professionals.$inferSelect>=[];
  let unavailable=false;
  try {
    const db=await getDb();
    rows=await db.select().from(professionals).where(eq(professionals.status,"active")).limit(100);
  } catch { unavailable=true; console.warn("Public profesionales records temporarily unavailable."); }
  return (
    <main className="interior-page min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <header className="hero-photo-digital bg-[#211d1a] px-5 pb-10 pt-28 text-white sm:px-8 lg:px-12 lg:pb-14 lg:pt-32">
        <div className="mx-auto max-w-[1344px]">
          <p className="section-kicker text-[#b7d79a]">
            RED TÉCNICA VENEZOLANA
          </p>
          <h1 className="font-display mt-4 max-w-5xl text-4xl leading-[1.08] sm:text-6xl lg:text-7xl">
            El conocimiento también se cultiva.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            Encuentra especialistas por rubro, estado y modalidad de atención.
            Desde recién graduados hasta especialistas con trayectoria. Los perfiles pasan por revisión antes de hacerse públicos.
          </p>
          <div className="mt-7 flex flex-wrap gap-3"><a href="#buscar-profesionales" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#b7d79a] px-6 text-sm font-bold text-[#211d1a]">Buscar especialistas ↓</a><a href="#registro-profesional" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-6 text-sm font-semibold">Registrar mi perfil</a></div>
        </div>
      </header>
      <SectionGuide title="Conecta con el especialista adecuado." steps={["Filtra por especialidad", "Revisa su perfil", "Acuerda el servicio"]} action="Registrar mi perfil" href="#registro-profesional" help="/aprende"/>
      <section className="mx-auto max-w-[1344px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        {unavailable&&<div className="mb-6 rounded-2xl border bg-white p-5 text-sm leading-7"><p role="status">No pudimos cargar los registros publicados en este momento. Vuelve a intentarlo cuando tengas conexión. El contenido de ejemplo está identificado como demostración.</p><a href="/profesionales" className="button-light mt-3">Volver a intentar</a></div>}
        <ProfessionalDirectory initial={rows.map(publicProfessionalRow)} examples={professionalExamples} />
        <div id="registro-profesional" className="scroll-mt-28 mt-16 grid gap-8 rounded-[2rem] bg-[#eadfcd] p-6 sm:p-9 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="section-kicker">ÚNETE A LA GUÍA</p>
            <h2 className="font-display mt-3 text-4xl">
              Ofrece tu experiencia al campo.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#5f574f]">
              Veterinaria, agronomía, zootecnia, suelos, riego, genética,
              sanidad, maquinaria, comercialización y otras especialidades.
            </p>
          </div>
          <div>
            {user ? (
              <ProfessionalManager name={user.displayName} userId={user.id} />
            ) : (
              <div className="rounded-2xl bg-white p-8 text-center">
                <p className="text-sm leading-7 text-[#5f574f]">
                  Inicia sesión para proteger y editar tu solicitud.
                </p>
                <a
                  href={chatGPTSignInPath("/profesionales")}
                  target="_top"
                  className="button-dark mt-5"
                >
                  Registrar mi perfil
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
