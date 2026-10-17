import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type SectionGuideProps = { title: string; steps: readonly [string,string,string]; action: string; href: string; help?: string };
/** Compact, crawlable next steps for real product areas, never fake workflow progress. */
export function SectionGuide({title,steps,action,href,help='/aprende'}:SectionGuideProps) {
  return <section className="section-guide" aria-label={`Cómo usar esta sección: ${title}`}>
    <div className="section-guide-inner">
      <div><p className="section-kicker">TU SIGUIENTE PASO</p><h2 className="mt-2 text-lg font-semibold text-[#3e2a19]">{title}</h2><ol className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#675f57]">{steps.map((step,i)=><li key={step} className="flex items-center gap-2"><span className="section-guide-number" aria-hidden="true">{i+1}</span>{step}</li>)}</ol></div>
      <div className="flex flex-wrap items-center gap-3"><Link href={href} className="button-dark">{action}<ArrowRight size={16} aria-hidden="true"/></Link><Link href={help} className="section-guide-help">Ver la guía</Link></div>
    </div>
  </section>;
}
