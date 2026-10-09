import { SiteImage as Image } from "@/components/site-image";
import {institutionMarks} from "@/lib/institution-marks";
import { pageMetadata } from "@/lib/indexing-policy";
import { PhotoCredit } from "@/components/photo-credit";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  Info,
  Landmark,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { PublicFooter } from "@/components/public-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata:Metadata=pageMetadata('/guia-institucional','Guía institucional para el productor venezolano','Ruta orientativa hacia instituciones oficiales de tierras, registro, sanidad, movilización, acuicultura e investigación agrícola en Venezuela.');

const institutions = [
  {
    icon: Landmark,
    name: "INTI",
    mark: institutionMarks.find(mark=>mark.id==="inti")!,
    area: "Tierras con vocación agraria",
    copy: "Su Gerencia de Registro Agrario administra, controla e inventaría tierras con vocación de uso agrario. Consulta la Oficina Regional de Tierras correspondiente antes de asumir que un documento aplica a tu predio.",
    href: "https://www.inti.gob.ve/ra",
    action: "Registro Agrario",
  },
  {
    icon: FileCheck2,
    name: "SAREN · Registro Público",
    mark: institutionMarks.find(mark=>mark.id==="saren")!,
    area: "Documentos sobre inmuebles",
    copy: "El Registro Público recibe documentos sobre declaración, transmisión, limitación o gravámenes de la propiedad, entre otros actos. La revisión debe hacerse en la circunscripción y con asesoría jurídica cuando corresponda.",
    href: "https://www.saren.gob.ve/registro-publico/",
    action: "Ir al Registro Público",
  },
  {
    icon: ShieldCheck,
    name: "INSAI · RUNSAI",
    mark: institutionMarks.find(mark=>mark.id==="insai")!,
    area: "Salud animal, vegetal e insumos",
    copy: "RUNSAI gestiona registros vinculados con empresas, productos e insumos de origen animal y vegetal. Los requisitos dependen de la actividad.",
    href: "https://www.insai.gob.ve/runsai",
    action: "Consultar RUNSAI",
  },
  {
    icon: Building2,
    name: "INSAI · SIGESAI",
    mark: institutionMarks.find(mark=>mark.id==="insai")!,
    area: "Movilización animal y vegetal",
    copy: "SIGESAI permite tramitar permisos para trasladar animales, vegetales, productos y subproductos. También publica manuales para registro de animales y certificados.",
    href: "https://www.insai.gob.ve/manual",
    action: "Ver manuales",
  },
  {
    icon: Scale,
    name: "INSOPESCA",
    mark: institutionMarks.find(mark=>mark.id==="insopesca")!,
    area: "Pesca y acuicultura",
    copy: "Publica recaudos para registro y permisos de unidades de producción acuícola, incluida documentación de tenencia, inspección técnica y proyecto según el caso.",
    href: "https://insopesca.gob.ve/?page_id=978",
    action: "Recaudos de acuicultura",
  },
  {
    icon: Building2,
    name: "INIA",
    mark: institutionMarks.find(mark=>mark.id==="inia")!,
    area: "Investigación y apoyo técnico",
    copy: "Desarrolla investigación agrícola, sanidad animal, protección vegetal, laboratorios, semillas, razas y formación relacionada con el sector productivo.",
    href: "https://www.inia.gob.ve/",
    action: "Visitar INIA",
  },
];

export default function InstitutionalGuidePage() {
  return (
    <main className="min-h-screen bg-[#f3ebdd]">
      <SiteHeader />
      <header className="hero-photo-institutions bg-[#211d1a] px-5 pb-16 pt-32 text-white sm:px-8 lg:px-12 lg:pb-24 lg:pt-40">
        <div className="mx-auto max-w-[1344px]">
          <p className="section-kicker text-[#b7d79a]">
            RUTA OFICIAL DEL PRODUCTOR
          </p>
          <h1 className="font-display mt-4 max-w-5xl text-5xl leading-[.96] sm:text-7xl lg:text-8xl">
            Saber a dónde ir también ahorra campo.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/62">
            Una guía sencilla para ubicar la institución correcta. Los trámites
            cambian según actividad, ubicación y tipo de tenencia: confirma
            siempre el requisito vigente en la fuente oficial.
          </p>
        </div>
        <div className="mx-auto max-w-[1344px]"><PhotoCredit id="faena-arrozal" /></div>
      </header>
      <section className="mx-auto max-w-[1344px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <p className="mb-6 text-xs leading-6 text-[#71685f]">Los logotipos se muestran para identificar a cada institución y conservan sus derechos. No implican afiliación ni respaldo a Venezuela Agro. <Link href="/creditos-fotograficos#marcas-institucionales" className="underline">Fuentes oficiales</Link>.</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {institutions.map((item) => (
            <article
              key={item.name}
              className="relative flex min-w-0 flex-col rounded-[1.6rem] border border-[#3e2a19]/10 bg-white p-6"
            >
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_5.5rem] items-start gap-3">
                <div className="min-w-0"><item.icon className="text-[#4c6b3a]" aria-hidden="true"/><p className="mt-5 text-xs font-bold uppercase tracking-[.13em] text-[#6b4a2f] [overflow-wrap:anywhere]">{item.area}</p><h2 className="font-display mt-2 text-2xl [overflow-wrap:anywhere] sm:text-3xl">{item.name}</h2></div>
                <div className={`flex min-h-20 items-center justify-center rounded-xl p-2 ${item.mark.dark?"bg-[#17362c]":"bg-white"}`}><Image src={item.mark.src} alt={`Logo oficial de ${item.mark.name}`} width={item.mark.width} height={item.mark.height} sizes="88px" className="h-auto max-h-20 w-full object-contain"/></div>
              </div>
              <p className="mt-4 flex-1 text-sm leading-7 text-[#5f574f]">
                {item.copy}
              </p>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="stretched-card-action mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold"
              >
                {item.action}
                <ArrowUpRight size={16} />
              </a>
            </article>
          ))}
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.8rem] bg-[#3e2a19] p-7 text-white">
            <p className="section-kicker text-[#b7d79a]">
              ANTES DE COMPRAR O VENDER UNA FINCA
            </p>
            <h2 className="font-display mt-3 text-4xl">
              Lista de verificación inicial.
            </h2>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-white/66">
              {[
                "Identifica si se trata de propiedad privada, adjudicación, carta agraria u otra forma de tenencia.",
                "Solicita documentos legibles y revisa titulares, linderos, superficie, tradición y posibles gravámenes.",
                "Contrasta la información en Registro Público y, cuando corresponda, ante INTI y catastro municipal.",
                "Verifica identidad y capacidad de quien firma. No pagues solo por fotografías o mensajes.",
                "Usa un abogado competente para la revisión documental y el instrumento definitivo.",
              ].map((text) => (
                <li key={text} className="flex gap-3">
                  <CheckCircle2
                    className="mt-1 shrink-0 text-[#b7d79a]"
                    size={18}
                  />
                  {text}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-[1.8rem] border border-[#3e2a19]/10 bg-white p-7">
            <Info className="text-[#e5927c]" />
            <h2 className="font-display mt-4 text-4xl">
              Esta guía orienta; no certifica.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#5f574f]">
              Parcela Los Morochos no valida títulos, permisos ni la
              legitimidad de una venta. La autoridad competente y la asesoría
              jurídica determinan qué documento aplica. No publiques cédulas,
              títulos completos, coordenadas sensibles ni firmas en el
              marketplace.
            </p>
            <Link href="/marketplace" className="button-dark mt-6">
              Volver al Mercado Agro
            </Link>
          </section>
        </div>
        <p className="mt-8 text-xs leading-6 text-[#71685f]">
          Fuentes oficiales consultadas y verificadas el 7 de septiembre de
          2026. Revisa la fecha, oficina y recaudos antes de desplazarte.
        </p>
      </section>
      <PublicFooter />
    </main>
  );
}
