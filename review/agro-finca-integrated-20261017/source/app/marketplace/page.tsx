import Link from "next/link";
import { SectionGuide } from "@/components/section-guide";
import { pageMetadata } from "@/lib/indexing-policy";
import { PhotoCredit } from "@/components/photo-credit";
import type { Metadata } from "next";
import { PublicFooter } from "@/components/public-footer";
import { MarketplaceBrowser } from "@/components/marketplace-browser";
import { SiteHeader } from "@/components/site-header";

export const metadata:Metadata=pageMetadata('/marketplace','Mercado Agro','Marketplace agropecuario para comprar, vender y descubrir animales, genética, alimentos, fincas, maquinaria, insumos y servicios en Venezuela.');

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  return (
    <main className="interior-page min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <section className="hero-photo-market border-b border-[#3e2a19]/10 px-5 pb-10 pt-28 text-white sm:px-8 lg:px-12 lg:pb-14 lg:pt-32">
        <div className="mx-auto max-w-[1344px]">
          <p className="section-kicker text-[#b7d79a]">MERCADO AGRO</p>
          <h1 className="font-display mt-4 max-w-5xl text-[2.8rem] leading-[1.06] tracking-[-.025em] sm:text-6xl sm:leading-[1.06] lg:text-7xl">
            El campo encuentra mercado.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/85">
            Publicaciones agropecuarias claras, organizadas y disponibles aun
            cuando tu conexión sea intermitente.
          </p>
          <div className="mt-7 flex flex-wrap gap-3"><a href="#buscar-mercado" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#b7d79a] px-6 text-sm font-bold text-[#211d1a]">Buscar productos ↓</a><Link href="/marketplace/publicar" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-6 text-sm font-semibold">Publicar un producto</Link></div>
          <PhotoCredit id="mercado-caracas" />
        </div>
      </section>
      <SectionGuide title="Encuentra productos y publica con claridad." steps={["Busca y filtra", "Revisa la ficha", "Acuerda con el anunciante"]} action="Publicar un producto" href="/marketplace/publicar" help="/aprende"/>
      <section className="mx-auto max-w-[1344px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <MarketplaceBrowser initialCategory={categoria?.trim() || "Todo"} />
      </section>
      <PublicFooter />
    </main>
  );
}
