import { pageMetadata } from "@/lib/indexing-policy";
import { ProfessionalDirectory } from "@/components/professional-directory";
import { professionalExamples } from "@/lib/professional-examples";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { BadgeCheck, BriefcaseBusiness, MapPin } from "lucide-react";
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
    <main className="min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <header className="hero-photo-digital bg-[#211d1a] px-5 pb-16 pt-32 text-white sm:px-8 lg:px-12 lg:pb-24 lg:pt-40">
        <div className="mx-auto max-w-[1344px]">
          <p className="section-kicker text-[#b7d79a]">
            RED TÉCNICA VENEZOLANA
          </p>
          <h1 className="font-display mt-4 max-w-5xl text-5xl leading-[.96] sm:text-7xl lg:text-8xl">
            El conocimiento también se cultiva.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
            Encuentra especialistas por rubro, estado y modalidad de atención.
            Desde recién graduados hasta especialistas con trayectoria. Los perfiles pasan por revisión antes de hacerse públicos.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-[1344px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        {unavailable&&<p role="status" className="mb-6 rounded-2xl border bg-white p-5 text-sm leading-7">No pudimos cargar los registros publicados en este momento. Intenta nuevamente al recuperar la conexión. El contenido de ejemplo está identificado como demostración.</p>}
        <ProfessionalDirectory initial={rows} examples={professionalExamples} />
        <div className="mt-16 grid gap-8 rounded-[2rem] bg-[#eadfcd] p-6 sm:p-9 lg:grid-cols-[.7fr_1.3fr]">
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
