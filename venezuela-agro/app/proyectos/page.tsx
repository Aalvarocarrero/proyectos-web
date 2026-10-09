import { pageMetadata } from "@/lib/indexing-policy";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { ArrowUpRight, Handshake, Lightbulb, MapPin } from "lucide-react";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { ProjectForm } from "@/components/community-forms";
import {ProjectExample} from "@/components/project-example";
import { PublicFooter } from "@/components/public-footer";
import { SiteHeader } from "@/components/site-header";
import { getDb } from "@/db";
import { projectProposals } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata:Metadata=pageMetadata('/proyectos','Proyectos y alianzas del agro','Proyectos agropecuarios venezolanos que buscan alianzas, profesionales, logística, inversión o visibilidad.');

export default async function ProjectsPage() {
  const user = await getChatGPTUser();
  let rows:Array<typeof projectProposals.$inferSelect>=[];
  let unavailable=false;
  try {
    const db=await getDb();
    rows=await db.select().from(projectProposals).where(eq(projectProposals.status,"active")).limit(100);
  } catch { unavailable=true; console.warn("Public proyectos records temporarily unavailable."); }
  return (
    <main className="min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <header className="hero-photo-cacao relative overflow-hidden bg-[#3e2a19] px-5 pb-16 pt-32 text-white sm:px-8 lg:px-12 lg:pb-24 lg:pt-40">
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full border border-white/10" />
        <div className="mx-auto max-w-[1344px]">
          <p className="section-kicker text-[#f7b7a8]">PROYECTOS Y ALIANZAS</p>
          <h1 className="font-display mt-4 max-w-5xl text-5xl leading-[.96] sm:text-7xl lg:text-8xl">
            Cuéntanos tu proyecto agropecuario.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
            Presenta tu iniciativa productiva, lo que ya tienes y el apoyo que
            necesitas. Las propuestas aprobadas forman una vitrina pública de
            colaboración.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-[1344px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        {unavailable&&<p role="status" className="mb-6 rounded-2xl border bg-white p-5 text-sm leading-7">No pudimos cargar los registros publicados en este momento. Intenta nuevamente al recuperar la conexión. El contenido de ejemplo está identificado como demostración.</p>}
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            [
              "Marketing y sitio web",
              "Identidad, presencia digital y captación.",
            ],
            ["Genética y profesionales", "Conexión con conocimiento técnico."],
            [
              "Inversión y logística",
              "Estructuración para alianzas responsables.",
            ],
          ].map(([title, copy]) => (
            <div
              key={title}
              className="rounded-[1.5rem] bg-[#211d1a] p-6 text-white"
            >
              <Handshake className="text-[#b7d79a]" />
              <h2 className="mt-5 text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/52">{copy}</p>
            </div>
          ))}
        </div>
        <div className="mt-16">
          <div className="flex items-end justify-between">
            <div>
              <p className="section-kicker">VITRINA DE PROPUESTAS</p>
              <h2 className="font-display mt-3 text-4xl sm:text-6xl">
                Proyectos abiertos.
              </h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {rows.length ? (
              rows.map((project) => (
                <article
                  key={project.id}
                  className="rounded-[1.7rem] border border-[#3e2a19]/10 bg-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#e8f0df] px-3 py-1 text-xs font-bold text-[#365026]">
                      {project.sector}
                    </span>
                    <ArrowUpRight size={18} />
                  </div>
                  <h3 className="font-display mt-5 text-3xl">
                    {project.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#5f574f]">
                    {project.summary}
                  </p>
                  <p className="mt-5 flex items-center gap-2 text-xs font-semibold">
                    <MapPin size={14} />
                    {project.state}
                  </p>
                  <div className="mt-5 rounded-xl bg-[#f3ebdd] p-4">
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Apoyo solicitado
                    </p>
                    <p className="mt-2 text-sm leading-6">
                      {project.requestedSupport}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="md:col-span-2 rounded-[1.7rem] border border-dashed border-[#3e2a19]/20 p-10 text-center">
                <Lightbulb className="mx-auto text-[#4c6b3a]" />
                <p className="font-display mt-4 text-3xl">
                  La primera edición está abierta.
                </p>
                <p className="mt-3 text-sm text-[#71685f]">
                  Publicaremos únicamente propuestas reales y revisadas.
                </p>
              </div>
            )}
          </div>
        </div>
        <ProjectExample/>
        <div id="presentar-proyecto" tabIndex={-1} className="scroll-mt-28 mt-16 grid gap-8 rounded-[2rem] bg-[#eadfcd] p-6 sm:p-9 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="section-kicker">CUÉNTANOS TU PROYECTO</p>
            <h2 className="font-display mt-3 text-4xl">
              Presenta tu iniciativa y el apoyo que necesitas.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#5f574f]">
              Este espacio reúne iniciativas del agro que buscan apoyo o colaboración. No es el formulario para sugerir mejoras de la plataforma. La publicación no promete inversión. Permite presentar mejor la
              oportunidad y conectar con personas interesadas.
            </p>
          </div>
          <div>
            {user ? (
              <ProjectForm userId={user.id} />
            ) : (
              <div className="rounded-2xl bg-white p-8 text-center">
                <p className="text-sm leading-7">
                  Inicia sesión para guardar el borrador y enviarlo a revisión.
                </p>
                <a
                  href={chatGPTSignInPath("/proyectos")}
                  target="_top"
                  className="button-dark mt-5"
                >
                  Presentar un proyecto
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
