import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteImage } from "@/components/site-image";
import { stickers } from "@/lib/sticker-catalog";

const previewIds = [
  "agricultores-animales-agricultor-con-vaca--mujer",
  "animales-vaca",
  "herramientas-tractor",
];
const previews = previewIds.flatMap(id => {
  const sticker = stickers.find(item => item.id === id);
  return sticker ? [sticker] : [];
});

export function HomeStickerBanner() {
  return (
    <aside aria-labelledby="home-stickers-title" className="mx-auto max-w-[1440px] px-5 pb-3 pt-6 sm:px-8 lg:px-12">
      <div className="grid min-w-0 gap-5 rounded-3xl border border-[#4c6b3a]/20 bg-[#edf2e7] p-5 sm:p-6 md:grid-cols-[auto_1fr] md:items-center xl:grid-cols-[auto_1fr_auto]">
        <div className="flex items-center gap-1" aria-hidden="true">
          {previews.map((sticker, index) => (
            <div key={sticker.id} className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/80 p-1 shadow-sm sm:h-20 sm:w-20 ${index === 1 ? "rotate-3" : "-rotate-3"}`}>
              <SiteImage src={sticker.thumbnail.src} alt="" width={sticker.thumbnail.width} height={sticker.thumbnail.height} loading="lazy" sizes="80px" className="h-full w-full object-contain" />
            </div>
          ))}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#4c6b3a]">STICKERS DE VENEZUELA AGRO</p>
          <h2 id="home-stickers-title" className="font-display mt-2 text-2xl leading-tight text-[#3e2a19] sm:text-3xl">Lleva el campo a tus conversaciones.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#5f574f]">Productores, animales y cultivos. Descarga tus favoritos en PNG y consulta cómo usarlos como stickers.</p>
        </div>
        <Link href="/stickers" prefetch={false} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#3e2a19] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4c6b3a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3e2a19] md:col-start-2 md:justify-self-start xl:col-start-auto xl:whitespace-nowrap">
          Ver y descargar stickers <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
