"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { KnowledgeArticle } from "@/lib/articles";
import { filterLearningArticles } from "@/lib/learning-search";

type LearningSummary = Pick<KnowledgeArticle, "slug" | "title" | "description" | "category" | "emoji" | "readMinutes" | "keywords" | "tutorial">;

export function LearningCatalog({ articles }: { articles: LearningSummary[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const categories = [...new Set(articles.map(article => article.category))];
  const matches = filterLearningArticles(articles, query, category);
  const tutorials = matches.filter(article => article.tutorial);
  const library = matches.filter(article => !article.tutorial);
  function clear() { setQuery(""); setCategory(""); search.current?.focus(); }
  return <>
    <div className="learning-search rounded-2xl border border-[#3e2a19]/15 bg-white p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_16rem]">
        <label className="text-sm font-semibold" htmlFor="learning-search">¿Qué necesitas aprender?
          <div className="relative mt-2"><Search aria-hidden="true" size={18} className="pointer-events-none absolute left-3 top-3.5 text-[#675f57]"/><input ref={search} id="learning-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar: pesaje, cacao, sin señal…" className="min-h-12 w-full rounded-xl border border-[#3e2a19]/25 bg-white py-3 pl-10 pr-3 font-normal"/></div>
        </label>
        <label className="text-sm font-semibold" htmlFor="learning-category">Tema<select id="learning-category" value={category} onChange={event => setCategory(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#3e2a19]/25 bg-white px-3 font-normal"><option value="">Todos los temas</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-[#675f57]">{matches.length} {matches.length === 1 ? "guía disponible" : "guías disponibles"}{query.trim() || category ? " con estos filtros" : " para consultar"}.</p>{(query || category) && <button type="button" onClick={clear} className="min-h-11 px-3 text-sm font-bold text-[#365026] underline">Limpiar filtros</button>}</div>
    </div>
    {!matches.length && <section className="my-8 rounded-2xl border border-dashed border-[#3e2a19]/25 p-7"><h3 className="text-xl font-semibold">No encontramos una guía con esos filtros.</h3><p className="mt-3 text-sm leading-7 text-[#675f57]">Prueba una palabra más corta, cambia el tema o vuelve a ver toda la biblioteca.</p><button type="button" onClick={clear} className="button-dark mt-4">Ver todas las guías</button></section>}
    {!!tutorials.length && <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{tutorials.map(article => <article id={article.slug} key={article.slug} className="scroll-mt-28 flex flex-col rounded-2xl border border-[#3e2a19]/10 bg-white p-5 sm:p-6">
      <img src={article.tutorial!.visual} alt={`Esquema didáctico: ${article.tutorial!.screen}`} width={960} height={640} loading="lazy" decoding="async" className="mb-5 w-full rounded-xl border bg-[#f8f3ea]"/>
      <p className="text-xs font-bold text-[#365026]"><span aria-hidden="true">{article.emoji} </span>{article.category}</p><h3 className="font-display mt-4 text-3xl leading-tight">{article.title}</h3><p className="mt-3 flex-1 text-sm leading-7 text-[#675f57]">{article.description}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#3e2a19]/10 pt-3"><span className="text-xs text-[#675f57]">{article.readMinutes} min de lectura</span><Link href={`/aprende/${article.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#365026]" aria-label={`Ver paso a paso: ${article.title}`}>Ver paso a paso <ArrowRight size={16} aria-hidden="true"/></Link></div>
    </article>)}</div>}
    {!!library.length && <section className="mt-12"><p className="section-kicker">BIBLIOTECA DEL CAMPO</p><h2 className="font-display mt-3 text-3xl sm:text-4xl">Conocimiento para producir mejor.</h2><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{library.map(article => <Link key={article.slug} href={`/aprende/${article.slug}`} className="flex flex-col rounded-2xl border border-[#3e2a19]/10 bg-white p-6"><p className="text-xs font-semibold text-[#365026]"><span aria-hidden="true">{article.emoji} </span>{article.category}</p><h3 className="font-display mt-4 text-2xl">{article.title}</h3><p className="mt-3 flex-1 text-sm leading-7 text-[#675f57]">{article.description}</p><span className="mt-4 text-sm font-semibold">Leer guía · {article.readMinutes} min →</span></Link>)}</div></section>}
  </>;
}
