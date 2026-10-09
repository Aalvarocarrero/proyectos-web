import { pageMetadata } from "@/lib/indexing-policy";
import { GOOGLE_BUSINESS_URL } from "@/lib/official-links";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, Mail, MapPin, Sprout } from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { SiteImage as Image } from "@/components/site-image";
import { SiteHeader } from "@/components/site-header";

export const metadata:Metadata=pageMetadata('/nosotros','Nuestra historia','Conoce la historia familiar de Parcela Los Morochos en El Nula, Apure, y su visión de unir campo, educación y tecnología.');

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <section className="relative min-h-[760px] overflow-hidden bg-[#211d1a] text-white">
        <Image src="/legado-familiar.webp" alt="Trabajo familiar en una finca venezolana" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(25,21,17,.94),rgba(25,21,17,.58)_55%,rgba(25,21,17,.22)),linear-gradient(0deg,rgba(25,21,17,.85),transparent_50%)]" />
        <div className="relative mx-auto flex min-h-[760px] max-w-[1344px] flex-col justify-end px-5 pb-20 pt-32 sm:px-8 lg:px-12 lg:pb-24">
          <p className="section-kicker text-[#b7d79a]">DESDE EL NULA, APURE</p>
          <h1 className="font-display mt-4 max-w-5xl text-5xl leading-[.94] tracking-[-.045em] sm:text-7xl lg:text-[6.5rem]">Una familia que eligió construir futuro en el campo.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">Más de 40 años de trabajo, aprendizaje y perseverancia alrededor de la finca.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:px-12 lg:py-32">
        <div><p className="section-kicker">LOS FUNDADORES</p><h2 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">Andrés Abelino Vásquez y Flor Elba Ibañez</h2></div>
        <div className="space-y-6 text-lg leading-9 text-[#5f574f]"><p>Parcela Los Morochos nace de una pareja apasionada por el campo y por dejar un legado familiar. En El Nula, estado Apure, Andrés y Flor construyeron su vida con constancia: atendiendo vacas de ordeño, trabajando las siembras y resolviendo cada jornada con los recursos disponibles.</p><p>Ese recorrido no se presenta como una historia terminada. Es el origen de una marca que quiere documentar lo aprendido, fortalecer su producción y acercar herramientas útiles a otras personas del agro venezolano.</p><p className="font-display text-3xl leading-tight text-[#3e2a19]">“Tradición que enseña, campo que evoluciona.”</p></div>
      </section>

      <section className="bg-[#211d1a] py-24 text-white lg:py-32"><div className="mx-auto max-w-[1344px] px-5 sm:px-8 lg:px-12"><p className="section-kicker text-[#b7d79a]">LO QUE NOS MUEVE</p><div className="mt-10 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 md:grid-cols-3">{[[Heart,"Familia","Proteger el esfuerzo de quienes comenzaron y convertirlo en una oportunidad para las próximas generaciones."],[Leaf,"Campo","Producir con atención al territorio, al bienestar y a la realidad de cada ciclo."],[Sprout,"Futuro","Integrar educación, trazabilidad y tecnología sin perder la identidad rural."]].map(([Icon,title,text])=>{const PillarIcon=Icon as typeof Heart;return <article key={String(title)} className="bg-[#211d1a] p-8 sm:p-10"><PillarIcon className="text-[#b7d79a]"/><h2 className="font-display mt-10 text-4xl">{String(title)}</h2><p className="mt-4 text-sm leading-7 text-white/52">{String(text)}</p></article>})}</div></div></section>

      <section className="mx-auto max-w-[1344px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"><div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><p className="section-kicker">UNA VISIÓN ABIERTA</p><h2 className="section-title">Producir, enseñar y conectar.</h2><p className="section-copy">La plataforma reúne tres propósitos: presentar el origen de Parcela Los Morochos, abrir un mercado especializado para el agro y ofrecer una herramienta que cada finca pueda personalizar con sus propios datos.</p><Link href="/plataforma" className="button-dark mt-8">Conocer la plataforma <ArrowRight size={17}/></Link></div><div className="grid grid-cols-2 gap-3">{["🐄 Ganadería","🐖 Porcicultura","🐓 Avicultura","🐟 Piscicultura","🐝 Apicultura","🍫 Cacao","☕ Café","🧬 Genética"].map(item=><div key={item} className="flex min-h-28 items-end rounded-2xl border border-[#3e2a19]/8 bg-white p-5 text-sm font-bold">{item}</div>)}</div></div></section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8"><p className="section-kicker">VENEZUELAAGRO · NUESTRA DIRECCIÓN</p><h2 className="section-title">Raíces venezolanas. Visión internacional.</h2><p className="section-copy">Nacemos de la experiencia de Parcela Los Morochos para acercar tecnología útil a productores, profesionales y empresas de todo el país. Nuestra visión es conectar el potencial del agro venezolano con nuevas oportunidades de colaboración, conocimiento y comercio.</p><div className="mt-8 grid gap-4 md:grid-cols-3">{[["Misión","Facilitar la organización de la finca y el acceso a mercados y servicios especializados."],["Visión","Construir un ecosistema nacional que pueda crecer hacia conexiones internacionales."],["Compromiso","Diseñar para la realidad del campo: claridad, accesibilidad y registros locales cuando falta la señal."]].map(([title,text])=><article key={title} className="rounded-2xl border bg-white p-6"><h3 className="text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-[#5f574f]">{text}</p></article>)}</div></section>
      <section id="contacto" className="border-y border-[#3e2a19]/10 bg-[#e9ddca] px-5 py-20 sm:px-8 lg:px-12"><div className="mx-auto max-w-[1100px]"><p className="section-kicker">CONTACTO Y ALIANZAS</p><h2 className="font-display mt-3 text-4xl sm:text-5xl">Conectemos nuevas oportunidades.</h2><p className="mt-5 text-sm">El Nula, Apure, Venezuela</p><a href="mailto:alimentosparcelalosmorochos@gmail.com" className="mt-4 inline-flex min-h-11 break-all text-sm font-semibold">alimentosparcelalosmorochos@gmail.com</a><div className="mt-6 flex flex-wrap gap-3"><a href={GOOGLE_BUSINESS_URL} target="_blank" rel="noreferrer" className="button-dark"><MapPin size={17}/> Ver en Google Maps</a><Link href="/proyectos" className="button-dark">Proponer una alianza <ArrowRight size={17}/></Link></div></div></section>
      <PublicFooter />
    </main>
  );
}
