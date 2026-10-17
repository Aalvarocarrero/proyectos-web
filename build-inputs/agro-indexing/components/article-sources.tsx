import type { KnowledgeArticle } from "@/lib/articles";

export function ArticleSources({sources, offline = false}: {sources?: KnowledgeArticle["sources"]; offline?: boolean}) {
  if (!sources?.length) return null;
  return <section className="mt-12 rounded-2xl border border-[#3e2a19]/15 bg-white p-5 text-[#3e2a19]" aria-label="Fuentes y alcance">
    <h2 className="font-display text-2xl">Fuentes y alcance</h2>
    <p className="mt-3 text-sm leading-6">Referencias para ampliar la lectura. Confirma las condiciones de tu finca con profesionales locales antes de aplicar una decisión técnica.</p>
    {offline && <p className="mt-2 text-sm leading-6">Las notas se incluyen en esta descarga. Abrir los documentos originales requiere internet.</p>}
    <ul className="mt-4 space-y-5">{sources.map(source => <li key={source.url}>
      <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-block min-h-11 py-2 font-bold underline decoration-[#4c6b3a] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">{source.label}</a>
      <p className="text-sm leading-6 text-[#655542]">{source.note}</p>
    </li>)}</ul>
  </section>;
}
