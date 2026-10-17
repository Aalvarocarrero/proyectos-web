import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { SiteHeader } from "@/components/site-header";

export type LegalSection = { title: string; paragraphs: string[]; bullets?: string[] };

export function LegalPage({ kicker, title, summary, sections }: { kicker: string; title: string; summary: string; sections: LegalSection[] }) {
  return (
    <main className="min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <header className="bg-[#211d1a] px-5 pb-16 pt-32 text-white sm:px-8 lg:px-12 lg:pb-20 lg:pt-40">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"><ArrowLeft size={16} /> Inicio</Link>
          <p className="section-kicker mt-10 text-[#b7d79a]">{kicker}</p>
          <h1 className="font-display mt-4 text-5xl leading-[.98] sm:text-7xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/62">{summary}</p>
          <p className="mt-8 text-xs text-white/38">Última actualización: 7 de septiembre de 2026</p>
        </div>
      </header>
      <article className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mb-12 flex items-start gap-3 rounded-2xl border border-[#3e2a19]/8 bg-white p-5 text-sm leading-7 text-[#5f574f]"><Info className="mt-1 shrink-0 text-[#4c6b3a]" size={18} /><p>Este texto establece las reglas actuales del prototipo y debe recibir revisión jurídica local antes de habilitar cobros, contratación automática o una operación comercial pública a gran escala.</p></div>
        <div className="space-y-12">
          {sections.map((section, index) => (
            <section key={section.title} className={index ? "border-t border-[#3e2a19]/10 pt-10" : ""}>
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">{index + 1}. {section.title}</h2>
              <div className="mt-5 space-y-4">{section.paragraphs.map((paragraph) => <p key={paragraph} className="text-base leading-8 text-[#5f574f]">{paragraph}</p>)}</div>
              {section.bullets && <ul className="mt-6 space-y-3 rounded-2xl bg-[#e9ddca] p-5">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-3 text-sm leading-7 text-[#5f574f]"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4c6b3a]" />{bullet}</li>)}</ul>}
            </section>
          ))}
        </div>
        <div className="mt-14 rounded-[1.7rem] bg-[#3e2a19] p-7 text-white"><h2 className="font-display text-3xl">¿Tienes una consulta?</h2><p className="mt-3 text-sm leading-7 text-white/55">Escribe a alimentosparcelalosmorochos@gmail.com e indica el asunto relacionado con privacidad, plataforma o comercio.</p><a className="button-light mt-6" href="mailto:alimentosparcelalosmorochos@gmail.com">Contactar</a></div>
      </article>
      <PublicFooter />
    </main>
  );
}
