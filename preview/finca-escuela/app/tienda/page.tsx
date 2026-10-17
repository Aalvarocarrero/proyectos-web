import { SectionGuide } from "@/components/section-guide";
import { pageMetadata } from "@/lib/indexing-policy";
import { PhotoCredit } from "@/components/photo-credit";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Info, ShieldCheck } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreCatalog } from "@/components/store-catalog";

export const metadata:Metadata=pageMetadata('/tienda','Tienda Parcela Los Morochos · cortes, productos y cotizaciones','Productos de Parcela Los Morochos para compras personales y abastecimiento empresarial: animales, alimentos, cultivos y genética.');

export default function StorePage() {
  return (
    <main className="interior-page min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <section className="hero-photo-store bg-[#211d1a] px-5 pb-20 pt-32 text-white sm:px-8 lg:px-12 lg:pb-28 lg:pt-40">
        <div className="mx-auto max-w-[1344px]">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white">
            <ArrowLeft size={16} /> Inicio
          </Link>
          <p className="section-kicker mt-12 text-[#a9c48f]">TIENDA PARCELA LOS MOROCHOS</p>
          <h1 className="font-display mt-4 max-w-5xl text-5xl leading-[.98] tracking-[-.045em] sm:text-7xl lg:text-8xl">
            Del campo a tu mesa. A tu manera.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/62">
            Compra productos de Parcela Los Morochos. Elige animal en pie, corte, kilo,
            arroba, tonelada o presentación especial. La disponibilidad,
            precio y logística se confirman antes de cerrar una compra.
          </p>
          <PhotoCredit id="cowboys" />
        </div>
      </section>
      <SectionGuide title="Prepara una solicitud; confirma antes de comprar." steps={["Elige el producto", "Indica la cantidad", "Consulta disponibilidad"]} action="Ver catálogo" href="#catalogo" help="/aprende"/>
      <section id="catalogo" className="scroll-mt-28 mx-auto max-w-[1344px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mb-10 grid gap-3 md:grid-cols-2">
          <div className="flex gap-3 rounded-2xl border border-[#3e2a19]/10 bg-white p-4 text-sm leading-6 text-[#665e56]">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#4c6b3a]" size={19} />
            La tienda diferencia productos actuales de líneas en desarrollo para
            no presentar proyecciones como inventario confirmado.
          </div>
          <div className="flex gap-3 rounded-2xl border border-[#3e2a19]/10 bg-white p-4 text-sm leading-6 text-[#665e56]">
            <Info className="mt-0.5 shrink-0 text-[#4c6b3a]" size={19} />
            Después de preparar este dispositivo, puedes guardar una solicitud sin señal. Enviarla y confirmar disponibilidad requieren internet.
          </div>
        </div>
        <StoreCatalog />
      </section>
      <PublicFooter storeRequest />
    </main>
  );
}
