import {DeviceInstallAction} from "@/components/device-install-action";
import { pageMetadata } from "@/lib/indexing-policy";
import type { Metadata } from "next";
import { SiteImage as Image } from "@/components/site-image";
import Link from "next/link";
import { ArrowRight, Cloud, CloudOff, Database, Dna, Download, Map, RefreshCw, ShieldCheck, Smartphone, Store } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata:Metadata=pageMetadata('/plataforma','Mi Finca: planos, producción y gestión agropecuaria offline','Crea un plano poligonal por coordenadas, organiza potreros, lagunas y cultivos, y administra animales e inventario desde una aplicación agropecuaria que funciona sin internet.');

const modules = [
  ["🐄", "Animales y pesajes", "Identificación, nacimiento, raza, propósito, estado e historial de peso."],
  ["🗺️", "Plano poligonal y divisiones", "Coordenadas, vértices, superficie, rumbos, potreros, cultivos, instalaciones, agua, reserva y vías."],
  ["🌱", "Ciclos productivos", "Objetivos, etapas, fechas y observaciones para animales o cultivos."],
  ["📦", "Inventario", "Insumos, unidades, entradas, consumos, mínimos y ubicación."],
  ["🛒", "Marketplace", "Prepara publicaciones en campo y envíalas cuando regrese la conexión."],
  ["☁️", "Centro de sincronización", "Estado de la copia local, cambios pendientes y último respaldo."],
];

export default function PlatformPage() {
  return (
    <main className="min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <section className="relative min-h-[780px] overflow-hidden bg-[#0f1710] px-5 pb-20 pt-32 text-white sm:px-8 lg:px-12 lg:pt-40">
        <Image src="/tecnologia-campo.webp" alt="Tecnología aplicada a la gestión de una finca" fill priority sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0f1710_0%,rgba(15,23,16,.94)_45%,rgba(15,23,16,.35)_100%),linear-gradient(0deg,#0f1710_0%,transparent_50%)]" />
        <div className="relative mx-auto flex min-h-[620px] max-w-[1344px] flex-col justify-end">
          <p className="section-kicker text-[#b7d79a]">MI FINCA · WEB + APP</p>
          <h1 className="font-display mt-4 max-w-5xl text-5xl leading-[.94] tracking-[-.045em] sm:text-7xl lg:text-[6.7rem]">Control que acompaña al productor, tenga señal o no.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">Herramientas gratuitas para organizar fincas, empresas y procesos agropecuarios: animales, inventario, costos e ingresos. Se instala desde la web en iPhone, iPad, Android y ordenador.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/app" className="button-primary">Configurar mi finca <ArrowRight size={18} /></Link><a href="#instalar" className="button-glass"><Download size={18} /> Cómo instalar</a></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1344px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="max-w-3xl"><p className="section-kicker">CREADO PARA CADA FINCA</p><h2 className="section-title">El sistema comienza contigo.</h2><p className="section-copy">No incluye medidas, inventarios ni animales predeterminados. Cada persona define su superficie, unidades, especies, cultivos y objetivos; después puede modificarlos.</p></div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{modules.map(([emoji, title, text]) => <article key={title} className="min-h-64 rounded-[1.7rem] border border-[#3e2a19]/8 bg-white p-6"><span className="text-4xl">{emoji}</span><h3 className="font-display mt-8 text-3xl">{title}</h3><p className="mt-3 text-sm leading-7 text-[#71685f]">{text}</p></article>)}</div>
      </section>

      <section className="bg-[#211d1a] py-24 text-white lg:py-32">
        <div className="mx-auto max-w-[1344px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl"><p className="section-kicker text-[#b7d79a]">OFFLINE-FIRST</p><h2 className="section-title text-white">Primero en el dispositivo. Después en la nube.</h2><p className="mt-6 text-lg leading-8 text-white/58">La conectividad deja de ser una condición para capturar el trabajo diario.</p></div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 lg:grid-cols-3">
            {[
              [CloudOff, "1. Trabaja sin conexión", "Los nuevos animales, áreas, pedidos y borradores quedan en una base local del dispositivo."],
              [RefreshCw, "2. Detecta la señal", "Al volver internet, la aplicación identifica los cambios que todavía están pendientes."],
              [Cloud, "3. Respalda automáticamente", "La cola se revisa al recuperar señal y cada cinco minutos mientras la aplicación está abierta."],
            ].map(([Icon, title, text]) => { const StepIcon = Icon as typeof CloudOff; return <article key={String(title)} className="bg-[#211d1a] p-7 sm:p-9"><StepIcon className="text-[#b7d79a]" size={29} /><h3 className="font-display mt-10 text-3xl">{String(title)}</h3><p className="mt-4 text-sm leading-7 text-white/50">{String(text)}</p></article>; })}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#b7d79a]/15 bg-[#b7d79a]/7 p-5 text-sm leading-7 text-white/60"><ShieldCheck className="mt-1 shrink-0 text-[#b7d79a]" size={19} /><p>El primer acceso y la autenticación inicial requieren internet. Después de abrir las áreas que utilizarás, sus recursos y datos locales podrán seguir disponibles en ese dispositivo. La sincronización se reanuda al abrir la app o recuperar conexión.</p></div>
        </div>
      </section>

      <section id="instalar" className="mx-auto grid max-w-[1344px] gap-8 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-32"><div className="lg:col-span-2"><h2 className="font-display text-3xl">Lleva Venezuela Agro en tu dispositivo</h2><DeviceInstallAction/></div>
        <article className="rounded-[2rem] bg-white p-7 sm:p-10"><Smartphone className="text-[#4c6b3a]" size={30} /><p className="section-kicker mt-8">IPHONE Y IPAD</p><h2 className="font-display mt-3 text-4xl">Instala desde Safari.</h2><ol className="mt-7 space-y-4 text-sm leading-7 text-[#5f574f]"><li><strong>1.</strong> Abre este sitio en Safari.</li><li><strong>2.</strong> Abre el menú de página junto a la dirección y toca Compartir. Si tu barra ya muestra Compartir, tócalo directamente.</li><li><strong>3.</strong> Elige “Añadir a pantalla de inicio”. Activa “Abrir como app” si aparece.</li><li><strong>4.</strong> Revisa el nombre y confirma “Añadir”. Después abre Venezuela Agro desde el nuevo icono.</li></ol><p className="mt-7 rounded-xl bg-[#f3ebdd] p-4 text-xs leading-6 text-[#71685f]">La instalación web es gratuita. No requiere descargarla de App Store. Abre Mi Finca con internet y comprueba la preparación sin señal antes de salir al campo.</p></article>
        <article className="rounded-[2rem] bg-[#3e2a19] p-7 text-white sm:p-10"><Download className="text-[#f3c0b3]" size={30} /><p className="section-kicker mt-8 text-[#f3c0b3]">ANDROID Y ORDENADOR</p><h2 className="font-display mt-3 text-4xl">Instala desde el navegador.</h2><ol className="mt-7 space-y-4 text-sm leading-7 text-white/62"><li><strong className="text-white">1.</strong> Abre el sitio en Chrome, Edge u otro navegador compatible.</li><li><strong className="text-white">2.</strong> Acepta “Instalar aplicación” cuando aparezca.</li><li><strong className="text-white">3.</strong> Si no aparece, abre el menú y busca “Instalar app”.</li><li><strong className="text-white">4.</strong> Accede desde el icono. Si tu navegador no permite instalar, puedes seguir utilizando la web.</li></ol><Link href="/app" className="button-light mt-8">Abrir Mi Finca <ArrowRight size={17} /></Link></article>
      </section>

      <section className="border-y border-[#3e2a19]/10 bg-[#e9ddca] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1344px]"><p className="section-kicker">ARQUITECTURA PRÁCTICA</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[Dna,"Registro"],[Map,"Territorio"],[Store,"Mercado"],[Database,"Respaldo"]].map(([Icon,label])=>{const FeatureIcon=Icon as typeof Dna;return <div key={String(label)} className="flex items-center gap-3 rounded-2xl bg-white p-5"><FeatureIcon className="text-[#4c6b3a]"/><span className="text-sm font-bold">{String(label)}</span></div>})}</div></div>
      </section>
      <PublicFooter />
    </main>
  );
}
