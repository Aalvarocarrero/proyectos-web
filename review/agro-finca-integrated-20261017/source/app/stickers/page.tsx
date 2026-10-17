import type {Metadata} from "next";
import {pageMetadata} from "@/lib/indexing-policy";
import {SiteHeader} from "@/components/site-header";
import {PublicFooter} from "@/components/public-footer";
import {StickerGallery} from "@/components/sticker-gallery";
export const metadata:Metadata=pageMetadata("/stickers","Stickers del agro","Ilustraciones originales de Venezuela Agro para descargar: cosechadores, productores, profesionales, animales, cultivos y herramientas. PNG transparentes y colecciones disponibles.");
export default function StickersPage(){return <main className="interior-page min-h-screen bg-[#f3ebdd] text-[#3e2a19]"><SiteHeader/><header className="mx-auto max-w-7xl px-4 pb-8 pt-32 sm:px-6 sm:pt-40"><p className="section-kicker">CREADOS PARA VENEZUELA AGRO</p><h1 className="font-display mt-4 text-4xl leading-tight sm:text-6xl">Stickers del agro</h1><p className="mt-5 max-w-2xl text-base leading-8 text-[#675a4a]">Personas del campo, animales, cultivos y herramientas con la marca Venezuela Agro. Busca tus favoritos, compara su versión completa y compacta, y descárgalos por separado o en colección.</p></header><section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6"><StickerGallery/></section><PublicFooter/></main>;}
