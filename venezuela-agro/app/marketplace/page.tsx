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
    <main className="min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <section className="hero-photo-market border-b border-[#3e2a19]/10 px-5 pb-14 pt-32 text-white sm:px-8 lg:px-12 lg:pb-20 lg:pt-40">
        <div className="mx-auto max-w-[1344px]">
          <p className="section-kicker text-[#b7d79a]">MERCADO AGRO</p>
          <h1 className="font-display mt-4 max-w-5xl text-[2.8rem] leading-[1.06] tracking-[-.025em] sm:text-7xl sm:leading-[1.02] lg:text-8xl">
            El campo encuentra mercado.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">
            Publicaciones agropecuarias claras, organizadas y disponibles aun
            cuando tu conexión sea intermitente.
          </p>
          <PhotoCredit id="mercado-caracas" />
        </div>
      </section>
      <section className="mx-auto max-w-[1344px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <MarketplaceBrowser initialCategory={categoria ?? "Todo"} />
      </section>
      <PublicFooter />
    </main>
  );
}
