/* eslint-disable @next/next/no-html-link-for-pages -- Offline fallback links require document navigation, not uncached RSC. */
import {ConnectionIndicator} from "@/components/connection-indicator";
import {VenezuelaAgroLogo} from "@/components/venezuelaagro-logo";
import { CloudOff, Home, RefreshCw } from "lucide-react";

export const metadata = {title:"Sin conexión",robots:{index:false,follow:false},alternates:{canonical:"/offline"}};

export default function OfflinePage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#211d1a] px-5 text-white">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl sm:p-12">
        <header className="flex flex-wrap items-center justify-between gap-3"><VenezuelaAgroLogo/><ConnectionIndicator/></header>
        <CloudOff className="mx-auto mt-8 text-[#b7d79a]" size={34} />
        <h1 className="font-display mt-5 text-4xl sm:text-5xl">Estás trabajando sin conexión.</h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/62">
          Puedes abrir Mi Finca si preparaste este dispositivo con internet. Los registros locales no se envían ni se publican sin conexión. No borres los datos del navegador; guarda una copia desde Sincronización.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/app" className="button-light"><RefreshCw size={17} /> Abrir Mi Finca</a>
          <a href="/biblioteca-local" className="button-light">Biblioteca descargada</a>
          <a href="/" className="button-glass"><Home size={17} /> Ir al inicio</a>
        </div>
      </section>
    </main>
  );
}
