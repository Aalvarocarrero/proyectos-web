import { LearningCatalog } from "@/components/learning-catalog";
import { SectionGuide } from "@/components/section-guide";
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
  const categories = [["Primeros pasos","primeros-pasos-registro"],["Mi Finca","crear-plano-de-mi-finca"],["Sin internet","trabajar-sin-internet"],["Mercado Agro","publicar-vender-mercado-agro"],["Profesionales","perfil-profesional-agro"],["Tienda","comprar-tienda-los-morochos"],["Finca Escuela","finca-escuela-cultivos-animales"]];
  return (
    <main className="interior-page min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <section className="hero-photo-digital bg-[#211d1a] px-5 pb-20 pt-32 text-white sm:px-8 lg:px-12 lg:pb-28 lg:pt-40">
        <div className="mx-auto max-w-[1344px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8 text-[#b7d79a]"><BookOpen /></div>
          <p className="section-kicker mt-10 text-[#b7d79a]">APRENDE A USAR VENEZUELA AGRO</p>
          <h1 className="font-display mt-4 max-w-5xl text-5xl leading-[.98] tracking-[-.045em] sm:text-7xl lg:text-8xl">Tu plataforma, paso a paso.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/62">Guías sencillas para empezar, organizar tu finca, comercializar y ofrecer servicios. Sin palabras complicadas; con ejemplos visuales y acceso directo a cada herramienta.</p>
          <div className="mt-9 flex flex-wrap gap-2">
            {categories.map(([category,slug]) => <Link key={category} href={`/aprende/${slug}`} className="min-h-11 rounded-full border border-white/12 bg-white/5 px-4 py-3 text-xs text-white/65">{category}</Link>)}
          </div>
        </div>
      </section>
      <SectionGuide title="Aprende haciendo, sin perderte." steps={["Elige tu objetivo", "Sigue los pasos", "Abre la herramienta"]} action="Elegir una guía" href="#guias" help="/plataforma"/>

      <section id="guias" className="scroll-mt-24 mx-auto max-w-[1344px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="section-kicker">GUÍA DE LA PLATAFORMA</p><h2 className="font-display mt-3 text-4xl sm:text-5xl">¿Qué quieres hacer?</h2></div>
          <p className="flex max-w-md items-start gap-2 text-sm leading-6 text-[#71685f]"><Search className="mt-0.5 shrink-0" size={17} />Empieza por la primera guía o ve directamente al proceso que necesitas.</p>
        </div>
        <LearningCatalog articles={articles.map(({slug,title,description,category,emoji,readMinutes,keywords,tutorial})=>({slug,title,description,category,emoji,readMinutes,keywords,tutorial}))}/>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#e9ddca] p-5"><p className="max-w-2xl text-sm leading-7">¿Vas a salir sin señal? Prepara las guías en este dispositivo y comprueba la descarga antes de ir al campo.</p><Link href="/biblioteca-local" className="button-dark">Preparar biblioteca <ArrowRight size={17} aria-hidden="true"/></Link></div>
      </section>

      <section className="border-y border-[#3e2a19]/10 bg-[#e9ddca]">
        <div className="mx-auto grid max-w-[1344px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12">
          <div className="flex items-start gap-4"><ShieldCheck className="mt-1 shrink-0 text-[#4c6b3a]" /><div><h2 className="font-display text-3xl sm:text-4xl">Información responsable</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#675f57]">Estas guías son educativas. La sanidad, la genética, el uso de insumos y las decisiones técnicas deben confirmarse con profesionales calificados y las normas aplicables.</p></div></div>
          <Link href="/app" className="button-dark">Usar Mi Finca <ArrowRight size={17} /></Link>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
