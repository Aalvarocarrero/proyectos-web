import {decoratePublicMetadata} from "@/lib/indexing-policy";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, ShieldCheck } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedKnowledgeArticles } from "@/lib/knowledge-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = decoratePublicMetadata("/aprende",{
  title: "Aprende a usar Venezuela Agro, paso a paso",
  description: "Aprende a registrarte, crear el plano de tu finca, dividir potreros, publicar productos, ofrecer servicios e instalar la app para trabajar sin internet.",
  alternates: { canonical: "/aprende" },
});

export default async function LearnPage() {
  const articles = await getPublishedKnowledgeArticles();
  const guides = articles.filter(article => article.tutorial);
  const library = articles.filter(article => !article.tutorial);
  const categories = [["Primeros pasos","primeros-pasos-registro"],["Mi Finca","crear-plano-de-mi-finca"],["Sin internet","trabajar-sin-internet"],["Mercado Agro","publicar-vender-mercado-agro"],["Profesionales","perfil-profesional-agro"]];
  return (
    <main className="min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <section className="hero-photo-digital bg-[#211d1a] px-5 pb-20 pt-32 text-white sm:px-8 lg:px-12 lg:pb-28 lg:pt-40">
        <div className="mx-auto max-w-[1344px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8 text-[#b7d79a]"><BookOpen /></div>
          <p className="section-kicker mt-10 text-[#b7d79a]">APRENDE A USAR VENEZUELA AGRO</p>
          <h1 className="font-display mt-4 max-w-5xl text-5xl leading-[.98] tracking-[-.045em] sm:text-7xl lg:text-8xl">Tu plataforma, paso a paso.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/62">Guías sencillas para empezar, organizar tu finca, comercializar y ofrecer servicios. Sin palabras complicadas; con ejemplos visuales y acceso directo a cada herramienta.</p>
          <div className="mt-9 flex flex-wrap gap-2">
            {categories.map(([category,slug]) => <a key={category} href={`#${slug}`} className="min-h-11 rounded-full border border-white/12 bg-white/5 px-4 py-3 text-xs text-white/65">{category}</a>)}
          </div>
        </div>
      </section>

      <section id="guias" className="scroll-mt-24 mx-auto max-w-[1344px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="section-kicker">GUÍA DE LA PLATAFORMA</p><h2 className="font-display mt-3 text-4xl sm:text-5xl">¿Qué quieres hacer?</h2></div>
          <p className="flex max-w-md items-start gap-2 text-sm leading-6 text-[#71685f]"><Search className="mt-0.5 shrink-0" size={17} />Empieza por la primera guía o ve directamente al proceso que necesitas.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {guides.map((article) => (
            <article id={article.slug} key={article.slug} className="scroll-mt-28 group flex min-h-[370px] flex-col rounded-[1.7rem] border border-[#3e2a19]/8 bg-white p-6 shadow-[0_20px_60px_rgba(62,42,25,.05)] transition hover:-translate-y-1 hover:border-[#4c6b3a]/30">
              <img src={article.tutorial!.visual} alt={`Guía visual: ${article.tutorial!.screen}`} width={960} height={640} loading="lazy" decoding="async" className="mb-5 w-full rounded-xl border bg-[#f8f3ea]"/>
              <div className="flex items-start justify-between"><span className="text-3xl">{article.emoji}</span><span className="rounded-full bg-[#edf3e7] px-3 py-1 text-[.68rem] font-bold text-[#365026]">{article.category}</span></div>
              <h2 className="font-display mt-8 text-3xl leading-[1.04]">{article.title}</h2>
              <p className="mt-4 flex-1 text-sm leading-7 text-[#71685f]">{article.description}</p>
              <div className="mt-6 flex items-center justify-between border-t border-[#3e2a19]/8 pt-4">
                <span className="text-xs text-[#837a71]">{article.readMinutes} min de lectura</span>
                <Link href={`/aprende/${article.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#3e2a19]">Ver paso a paso <ArrowRight size={16} /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1344px] px-5 pb-16 sm:px-8 lg:px-12"><p className="section-kicker">TAMBIÉN CONSERVAMOS LA BIBLIOTECA DEL CAMPO</p><h2 className="font-display mt-3 text-4xl">Conocimiento para producir mejor.</h2><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{library.map(article=><Link key={article.slug} href={`/aprende/${article.slug}`} className="rounded-2xl border bg-white p-6"><p className="text-xs font-semibold text-[#4c6b3a]">{article.emoji} {article.category}</p><h3 className="font-display mt-4 text-2xl">{article.title}</h3><p className="mt-3 text-sm leading-7 text-[#71685f]">{article.description}</p><span className="mt-4 inline-block text-sm font-semibold">Leer guía →</span></Link>)}</div></section>
      <section className="border-y border-[#3e2a19]/10 bg-[#e9ddca]">
        <div className="mx-auto grid max-w-[1344px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12">
          <div className="flex items-start gap-4"><ShieldCheck className="mt-1 shrink-0 text-[#4c6b3a]" /><div><h2 className="font-display text-3xl sm:text-4xl">Información responsable</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#675f57]">Estas guías son educativas. La sanidad, la genética, el uso de insumos y las decisiones técnicas deben confirmarse con profesionales calificados y las normas aplicables.</p></div></div>
          <Link href="/plataforma" className="button-dark">Usar Mi Finca <ArrowRight size={17} /></Link>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
