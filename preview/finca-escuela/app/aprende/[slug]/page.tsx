import { ArticleSources } from "@/components/article-sources";
import { learningAction } from "@/lib/learning-action";
import { platformGuides } from "@/lib/platform-guides";
import { LearningFormPreview } from "@/components/learning-form-preview";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Info } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { SiteHeader } from "@/components/site-header";
import { articles as builtInArticles } from "@/lib/articles";
import { getKnowledgeArticleBySlug, getPublishedKnowledgeArticles } from "@/lib/knowledge-db";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...platformGuides, ...builtInArticles].map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getKnowledgeArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/aprende/${article.slug}` },
    openGraph: { type: "article", title: article.title, description: article.description, images: article.tutorial ? [{url:"/tecnologia-campo.webp",alt:article.tutorial.screen}] : [], publishedTime: article.publishedAt, modifiedTime: article.updatedAt },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getKnowledgeArticleBySlug(slug);
  if (!article) notFound();
  const articles = await getPublishedKnowledgeArticles();
  const related = articles.filter((item) => item.slug !== article.slug && !!item.tutorial === !!article.tutorial).slice(0, 3);
  const action = learningAction(article.tutorial);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: "es-VE",
    author: { "@type": "Organization", name: "Parcela Los Morochos" },
    publisher: { "@type": "Organization", name: "Venezuela Agro", parentOrganization:{"@type":"Organization",name:"Parcela Los Morochos"} },
  };

  return (
    <main className="interior-page min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <article>
        <header className="bg-[#211d1a] px-5 pb-20 pt-32 text-white sm:px-8 lg:px-12 lg:pb-28 lg:pt-40">
          <div className="mx-auto max-w-4xl">
            <Link href="/aprende" className="inline-flex min-h-11 items-center gap-2 text-sm text-white/80 hover:text-white"><ArrowLeft size={16} /> Aprende</Link>
            <div className="mt-12 flex flex-wrap items-center gap-3 text-xs text-white/75"><span className="rounded-full bg-white/8 px-3 py-1.5 font-bold text-[#b7d79a]">{article.category}</span><span className="flex items-center gap-1.5"><Clock3 size={14} /> {article.readMinutes} min</span><span className="flex items-center gap-1.5"><CalendarDays size={14} /> Actualizado {formatDate(article.updatedAt)}</span></div>
            <span className="mt-8 block text-5xl">{article.emoji}</span>
            <h1 className="font-display mt-5 text-5xl leading-[.98] tracking-[-.04em] sm:text-7xl">{article.title}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">{article.description}</p>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_17rem] lg:px-12 lg:py-24">
          <div className="min-w-0 max-w-3xl">
            <nav aria-label="Contenido de esta guía" className="mb-10 rounded-2xl border border-[#3e2a19]/15 bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">En esta guía</h2><ol className="mt-3 grid gap-1">{article.sections.map((section,index)=><li key={section.heading}><a href={`#paso-${index+1}`} className="inline-flex min-h-11 items-center gap-3 py-2 text-sm leading-6 text-[#365026] underline decoration-[#4c6b3a]/30 underline-offset-4"><span aria-hidden="true" className="text-xs font-bold">{String(index+1).padStart(2,"0")}</span>{section.heading}</a></li>)}</ol></nav>
            {article.tutorial && <figure className="mb-12"><img src={article.tutorial.visual} alt={`Esquema didáctico del proceso: ${article.tutorial.screen}`} width={960} height={640} loading="lazy" decoding="async" className="w-full rounded-2xl border bg-white"/><figcaption className="mt-3 text-xs leading-6 text-[#71685f]">Esquema didáctico del proceso, no una captura de pantalla ni un vídeo. Los datos son ejemplos; no se guardan en tu finca. <a href={article.tutorial.visual} target="_blank" rel="noopener noreferrer" className="underline">Ampliar guía visual</a></figcaption></figure>}
            {article.sections.map((section, index) => (
              <section id={`paso-${index+1}`} tabIndex={-1} key={section.heading} className={index ? "scroll-mt-28 mt-14 border-t border-[#3e2a19]/10 pt-12" : "scroll-mt-28"}>
                <p className="text-xs font-bold tracking-[.14em] text-[#4c6b3a]">{String(index + 1).padStart(2, "0")}</p>
                <h2 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">{section.heading}</h2>
                <div className="mt-6 space-y-5">{section.paragraphs.map((paragraph) => <p key={paragraph} className="text-base leading-8 text-[#5f574f]">{paragraph}</p>)}</div>
                {article.tutorial&&<figure className="mt-6"><img src={`/guias/${article.slug}-paso-${index+1}.svg`} alt={`Paso ${index+1}: ${section.heading}. Esquema del proceso.`} width={640} height={510} loading="lazy" decoding="async" className="w-full max-w-xl rounded-2xl border bg-white"/><figcaption className="mt-2 text-xs leading-6 text-[#71685f]">Paso {index+1} de {article.sections.length} · esquema orientativo con datos de ejemplo, no una captura ni un vídeo.</figcaption></figure>}{section.bullets && <ul className="mt-6 grid gap-3 rounded-2xl border border-[#3e2a19]/8 bg-white p-5 sm:grid-cols-2">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-2 text-sm leading-6 text-[#5f574f]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4c6b3a]" />{bullet}</li>)}</ul>}
              </section>
            ))}
            <ArticleSources sources={article.sources}/>
            {article.tutorial?.form && article.tutorial.form!=='plan' && <LearningFormPreview kind={article.tutorial.form}/>}
            <div className="mt-14 flex items-start gap-3 rounded-2xl bg-[#e9ddca] p-5 text-sm leading-7 text-[#5f574f]"><Info className="mt-1 shrink-0 text-[#4c6b3a]" size={18}/><p>{article.tutorial?.tip || "Contenido educativo general. No sustituye diagnóstico veterinario, asesoría agronómica, levantamiento topográfico ni orientación legal o sanitaria."}</p></div>
            <div className="mt-6 flex flex-wrap gap-3">{article.tutorial && <Link href={article.tutorial.targetHref} className="button-dark">{article.tutorial.targetLabel}<ArrowRight size={17}/></Link>}<Link href="/aprende#guias" className="button-light"><ArrowLeft size={16} aria-hidden="true"/>Volver a las guías</Link></div>
          </div>
          <aside className="h-fit rounded-[1.5rem] bg-[#211d1a] p-6 text-white lg:sticky lg:top-28">
            <p className="text-xs font-bold tracking-[.14em] text-[#b7d79a]">{action.kicker}</p>
            <h2 className="font-display mt-4 text-3xl">{action.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">{action.description}</p>
            <Link href={article.tutorial?.targetHref || "/app"} className="button-light mt-6 w-full">{article.tutorial?.targetLabel || "Abrir Mi Finca"} <ArrowRight size={16} /></Link>
          </aside>
        </div>
      </article>

      <section className="border-t border-[#3e2a19]/10 bg-[#e9ddca] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1180px]"><p className="section-kicker">SIGUE APRENDIENDO</p><div className="mt-6 grid gap-4 md:grid-cols-3">{related.map((item) => <Link key={item.slug} href={`/aprende/${item.slug}`} className="rounded-2xl bg-white p-5"><span className="text-2xl">{item.emoji}</span><p className="font-display mt-5 text-2xl leading-tight">{item.title}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-bold">Leer <ArrowRight size={14} /></span></Link>)}</div></div>
      </section>
      <PublicFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-VE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
