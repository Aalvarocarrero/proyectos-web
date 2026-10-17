import type { HomeContent } from "@/lib/home-content";
import { HomeStickerBanner } from "@/components/home-sticker-banner";
import { HomeFarmPreview } from "@/components/home-farm-preview";
import { SectionGuide } from "@/components/section-guide";
import { PhotoCredit } from "@/components/photo-credit";
import { OFFICIAL_SOCIAL_LINKS } from "@/lib/official-links";
import { PLATFORM_NAME, SITE_ORIGIN } from "@/lib/site-identity";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Boxes,
  CloudOff,
  Leaf,
  Handshake,
  Map,
  MessageCircle,
  Sprout,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tractor,
  UsersRound,
  WifiOff,
} from "lucide-react";
import { ConnectivityPill } from "@/components/connectivity-pill";
import { PublicFooter } from "@/components/public-footer";
import { SiteImage as Image } from "@/components/site-image";
import { SiteHeader } from "@/components/site-header";

const productionAreas = [
  { emoji: "🐄", title: "Ganadería bovina", note: "Manejo, ordeño, reproducción y engorde." },
  { emoji: "🐖", title: "Porcicultura", note: "Cría responsable y libre pastoreo." },
  { emoji: "🐓", title: "Pollos de engorde", note: "Bienestar, nutrición y ciclos productivos." },
  { emoji: "🐟", title: "Piscicultura", note: "Producción acuícola planificada." },
  { emoji: "🍫", title: "Cacao", note: "Cultivo tropical y valor de origen." },
  { emoji: "☕", title: "Café", note: "Siembra, trazabilidad y calidad." },
  { emoji: "🐝", title: "Apicultura", note: "Polinización, biodiversidad y miel." },
  { emoji: "🧬", title: "Genética", note: "Bovinos, porcinos, semen y embriones." },
];

const marketplaceCategories = [
  { emoji: "🐄", value: "Bovinos" },
  { emoji: "🥩", value: "Cárnicos" },
  { emoji: "🧬", value: "Genética y reproducción" },
  { emoji: "🥬", value: "Verduras y hortalizas" },
  { emoji: "🍍", value: "Frutas" },
  { emoji: "🌱", value: "Semillas y plantas" },
  { emoji: "💊", value: "Vitaminas y medicinas" },
  { emoji: "🧂", value: "Nutrición animal" },
  { emoji: "🚜", value: "Maquinaria agrícola" },
  { emoji: "🚁", value: "Drones y tecnología" },
  { emoji: "🛠️", value: "Herramientas y cercas" },
  { emoji: "🏡", value: "Fincas y terrenos" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "#organizacion",
      name: "Parcela Los Morochos",
      email: "alimentosparcelalosmorochos@gmail.com",
      url:SITE_ORIGIN,logo:`${SITE_ORIGIN}/logo-morochos.webp`,sameAs:OFFICIAL_SOCIAL_LINKS.map(link => link.href),
      description:
        "Finca familiar venezolana con más de 40 años de trayectoria en producción agropecuaria, educación rural e innovación.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "El Nula",
        addressRegion: "Apure",
        addressCountry: "VE",
      },
    },
    {
      "@type": "Brand",
      "@id": `${SITE_ORIGIN}/#venezuelaagro`,
      name: "VenezuelaAgro",
      url: SITE_ORIGIN,
      description: "Plataforma del agro venezolano para gestión de fincas, comercialización y colaboración profesional.",
    },
    {
      "@type": "WebSite",
      "@id": "#sitio",
      name: PLATFORM_NAME,
      url: SITE_ORIGIN,
      inLanguage: "es-VE",
      publisher: { "@id": "#organizacion" },
    },
  ],
};

export function HomePageContent({ content }: { content: HomeContent }) {
  return (
    <main className="home-page overflow-hidden bg-background text-foreground">
      <SiteHeader />

      <section aria-labelledby="home-title" className="platform-hero home-hero relative overflow-hidden bg-[#171713] text-white">
        <picture>
          {content.heroImage === "/hero-apure-1200.webp" && <source type="image/avif" srcSet="/hero-apure-640.avif 640w, /hero-apure-1200.avif 1200w, /hero-apure-1536.avif 1536w" sizes="100vw" />}
          <img src={content.heroImage} srcSet={content.heroImage === "/hero-apure-1200.webp" ? "/hero-apure-640.webp 640w, /hero-apure-1200.webp 1200w, /hero-apure.webp 1536w" : undefined} sizes="100vw" width="1536" height="1024" fetchPriority="high" loading="eager" decoding="async" alt={content.heroImageAlt} className="absolute inset-0 h-full w-full object-cover object-center" />
        </picture>
        <div className="home-hero-shade absolute inset-0" />
        <div className="home-hero-content relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="home-hero-copy">
            <p className="home-eyebrow">{content.heroEyebrow}</p>
            <h1 id="home-title" className="font-display mt-5 text-balance">{content.heroTitle}<span className="block text-[#dbe6c9]">{content.heroSubtitle}</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">{content.heroDescription}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link className="button-primary" href="/finca-modelo" prefetch={false}>{content.heroPrimaryLabel} <ArrowRight aria-hidden="true" size={18} /></Link>
              <Link className="button-glass" href="/app" prefetch={false}>{content.heroSecondaryLabel}</Link>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/80">{content.heroHint}</p>
          </div>
          <div className="home-hero-foot">
            <p className="text-sm leading-6 text-white/85"><span className="block font-semibold text-white">Tecnología con raíces en el campo.</span>Hecho por Parcela Los Morochos, en Apure.</p>
            <a href="#mi-finca" className="home-discover">Conoce Mi Finca <ArrowRight aria-hidden="true" size={17} /></a>
          </div>
        </div>
      </section>

      <section id="mi-finca" aria-labelledby="mi-finca-preview-title" className="home-farm-feature bg-[#203e2d] py-12 text-white lg:py-16">
        <div className="home-farm-layout mx-auto grid max-w-[1440px] gap-7 px-5 sm:px-8 lg:px-12">
          <div className="home-farm-intro max-w-xl">
            <p className="section-kicker" style={{color:"#c4d8b2"}}>{content.farmEyebrow}</p>
            <h2 id="mi-finca-preview-title" className="section-title" style={{color:"#ffffff"}}>{content.farmTitle}</h2>
            <p className="mt-5 text-base leading-7 text-[#d6e0cf]">{content.farmDescription}</p>
          </div>
          <HomeFarmPreview />
          <div className="home-farm-details max-w-xl">
            <ul className="home-farm-benefits">
              <li><Map aria-hidden="true" size={18} /><span><strong>Tu terreno, a la vista.</strong> Potreros, cultivos e instalaciones.</span></li>
              <li><Boxes aria-hidden="true" size={18} /><span><strong>Tu producción, registrada.</strong> Animales, pesajes, inventario y costos.</span></li>
              <li><WifiOff aria-hidden="true" size={18} /><span><strong>También sin señal.</strong> Prepara el dispositivo con internet antes de salir.</span></li>
            </ul>
            <p className="mt-5 text-sm leading-6 text-[#d6e0cf]">Esta finca ficticia de 10 hectáreas muestra cómo funciona. Es un modelo ilustrativo; tu finca empieza con tus propios datos.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/finca-modelo" prefetch={false} className="button-light">Explorar finca modelo <ArrowRight size={17}/></Link>
              <Link href="/app" prefetch={false} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 px-5 py-3 text-sm font-semibold hover:bg-white/10">Crear mi finca</Link>
            </div>
          </div>
        </div>
      </section>

      <SectionGuide title="Tu finca empieza con lo que ya conoces." steps={["Define tu finca", "Añade tu primer registro", "Prepara el uso sin señal"]} action="Comenzar en Mi Finca" href="/app" help="/aprende"/>

      <HomeStickerBanner />

      <section aria-labelledby="home-routes-title" className="home-routes mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="section-kicker">MÁS ALLÁ DE TU FINCA</p><h2 id="home-routes-title" className="font-display mt-3 text-3xl sm:text-4xl">¿Qué necesitas hoy?</h2></div>
          <p className="max-w-sm text-sm leading-6 text-[#675f57]">Un camino directo para cada tarea, en la misma plataforma.</p>
        </div>
        <nav aria-label="Explorar las áreas de VenezuelaAgro" className="home-route-grid mt-7">{[
          {href:'/marketplace',title:'Mercado Agro',text:'Comprar o publicar',Icon:Store},
          {href:'/red',title:'Comunidad',text:'Conectar con productores',Icon:UsersRound},
          {href:'/aprende',title:'Aprende',text:'Guías para poner en práctica',Icon:BookOpen},
          {href:'/profesionales',title:'Profesionales',text:'Encontrar apoyo especializado',Icon:Handshake},
          {href:'/empresas',title:'Empresas',text:'Conocer productos y servicios',Icon:Building2},
        ].map(({href,title,text,Icon})=><Link key={href} href={href} className="home-route-link"><Icon size={22} aria-hidden="true"/><span><strong>{title}</strong><span>{text}</span></span><ArrowRight size={16} aria-hidden="true"/></Link>)}</nav>
        <p className="mt-5 text-xs leading-6 text-[#675f57]">Sin suscripción para usar las herramientas actuales. Preparación inicial con internet en cada dispositivo; comercialización, novedades y envío requieren conexión. Las compras de productos se cotizan aparte.</p>
      </section>

      <section className="relative overflow-hidden bg-[#0f1710] py-24 text-white lg:py-36">
        <div className="absolute inset-0 opacity-45">
          <Image
            src="/tecnologia-campo.webp"
            alt="Tecnología de precisión aplicada a una finca tropical"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0f1710_8%,rgba(15,23,16,.94)_42%,rgba(15,23,16,.35)_100%)]" />
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
              <CloudOff size={27} />
            </div>
            <p className="section-kicker" style={{color:"#c4d8b2"}}>MI FINCA · PREPARADA PARA EL CAMPO</p>
            <h2 className="section-title text-white">
              Cuando se va la señal, el trabajo sigue.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">
              Prepara Mi Finca con internet y comprueba su indicador antes de salir.
              Los registros se guardan en este navegador; al reconectar,
              revisa los pendientes, conflictos y confirmaciones de envío.
            </p>
            <div className="mt-5"><ConnectivityPill /></div>
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {[
                ["Animales y pesajes", ShieldCheck],
                ["Potreros y áreas", Map],
                ["Inventario y ciclos", Tractor],
                ["Anuncios pendientes", WifiOff],
              ].map(([label, Icon]) => (
                <div key={String(label)} className="flex items-center gap-3 rounded-2xl border border-white/12 bg-black/20 px-4 py-4 backdrop-blur">
                  <Icon className="text-[#b7d79a]" size={19} />
                  <span className="text-sm font-medium">{String(label)}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-white/15 bg-black/30 p-5">
              <p className="text-sm font-semibold text-[#dbe6c9]">Ejemplo de un pesaje · datos de demostración</p>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm"><div><dt className="text-white/65">Animal</dt><dd className="mt-1 font-semibold">BOV-001</dd></div><div><dt className="text-white/65">Peso</dt><dd className="mt-1 font-semibold tabular-nums">320 kg</dd></div><div><dt className="text-white/65">Fecha</dt><dd className="mt-1 font-semibold">10 sep. 2026</dd></div></dl>
              <p className="mt-4 text-sm leading-6 text-white/80">Identifica el animal, registra el peso y guarda. El indicador te dirá si el cambio sigue pendiente de envío.</p>
            </div>
            <Link href="/plataforma#instalar" className="button-light mt-9">
              Instalar la aplicación <ArrowRight size={18} />
            </Link>
            <Link href="/plataforma" className="ml-0 mt-4 block text-sm font-semibold underline underline-offset-4 sm:ml-5 sm:inline-block">
              Ver cómo funciona <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-gateways mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="max-w-3xl">
          <p className="section-kicker">PRODUCE, COMPARTE, COMERCIALIZA</p>
          <h2 className="section-title">De tu trabajo a nuevas oportunidades.</h2>
          <p className="section-copy">
            Comprar directamente, conectar con productores o administrar una
            finca completa: tres experiencias, una sola plataforma.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <Link href="/tienda" className="gateway-card group bg-[#3e2a19] text-white">
            <div className="gateway-icon bg-white/10"><ShoppingBag size={26} /></div>
            <div>
              <p className="gateway-label text-white/55">TIENDA PARCELA LOS MOROCHOS</p>
              <h3>Del campo a tu mesa.</h3>
              <p className="text-white/65">
                Animales, alimentos y genética de Parcela Los Morochos. Consulta la disponibilidad.
              </p>
            </div>
            <span className="gateway-link">Explorar tienda <ArrowRight size={18} /></span>
          </Link>

          <Link href="/marketplace" className="gateway-card group bg-[#4c6b3a] text-white">
            <div className="gateway-icon bg-white/10"><Store size={26} /></div>
            <div>
              <p className="gateway-label text-white/55">MERCADO AGRO</p>
              <h3>El campo conectado.</h3>
              <p className="text-white/65">
                Publica, descubre y negocia productos, animales, fincas e insumos.
              </p>
            </div>
            <span className="gateway-link">Abrir mercado <ArrowRight size={18} /></span>
          </Link>

          <Link href="/app" className="gateway-card group bg-[#211d1a] text-white">
            <div className="gateway-icon bg-white/10"><Boxes size={26} /></div>
            <div>
              <p className="gateway-label text-white/55">MI FINCA</p>
              <h3>El registro de tu trabajo.</h3>
              <p className="text-white/65">
                Animales, pesos, potreros y objetivos. Prepara Mi Finca con internet y lleva tus registros al campo.
              </p>
            </div>
            <span className="gateway-link">Gestionar finca <ArrowRight size={18} /></span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="section-kicker">MERCADO AGRO</p>
            <h2 className="section-title">Lo que produces. Lo que necesitas.</h2>
            <p className="section-copy">
              Un espacio para que productores y compradores encuentren lo que
              necesitan, preparen anuncios sin conexión y los envíen para revisión al volver a internet.
            </p>
            <Link href="/marketplace" className="button-dark mt-8">
              Explorar Mercado Agro <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {marketplaceCategories.map((category) => (
              <Link
                key={category.value}
                href={"/marketplace?categoria=" + encodeURIComponent(category.value)}
                className="flex min-h-28 items-end rounded-2xl border border-[#3e2a19]/10 bg-white p-5 text-base font-semibold shadow-[0_18px_50px_rgba(62,42,25,.06)] transition hover:-translate-y-1 hover:border-[#4c6b3a]/35"
              >
                {category.emoji} {category.value}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-learning border-y border-[#3e2a19]/10 bg-[#ede1cd]">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12">
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#3e2a19] text-[#f3ebdd]">
              <BookOpen size={22} />
            </div>
            <p className="section-kicker">APRENDE CON PARCELA LOS MOROCHOS</p>
            <h2 className="font-display max-w-3xl text-4xl leading-tight sm:text-6xl">
              Conocimiento útil, explicado desde una finca real.
            </h2>
            <article className="mt-8 max-w-2xl rounded-2xl border border-[#3e2a19]/10 bg-white p-6">
              <p className="text-sm font-semibold text-[#4c6b3a]">Guía práctica · 4 min de lectura</p>
              <h3 className="mt-3 text-2xl font-semibold leading-snug">Cómo guardar un pesaje en Mi Finca cuando no hay señal</h3>
              <p className="mt-3 text-base leading-7 text-[#5f574f]">Qué preparar antes de salir, cómo guardar el registro y cómo confirmar que llegó al respaldo.</p>
              <Link href="/aprende/guardar-pesaje-mi-finca-sin-senal" className="text-link mt-5">Leer la guía <ArrowRight size={17} /></Link>
            </article>
          </div>
          <div className="home-learning-next max-w-sm lg:self-end"><p className="text-sm font-semibold text-[#3e2a19]">¿Es tu primera vez?</p><p className="mt-2 text-sm leading-7 text-[#675f57]">Aprende a usar Venezuela Agro, paso a paso. Desde crear tu finca hasta publicar y trabajar sin internet.</p><Link href="/aprende" className="button-dark mt-5">Abrir biblioteca <ArrowRight size={18} /></Link></div>
        </div>
      </section>

      <section id="comunidad" className="home-community mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12"><p className="section-kicker">EL CAMPO CONECTA</p><h2 className="font-display mt-4 text-4xl sm:text-5xl">Fincas visibles. Conversaciones útiles.</h2><p className="mt-5 max-w-2xl text-base leading-8 text-[#71685f]">Presenta tu finca, comparte avances y encuentra oportunidades. Una comunidad del agro que crece con la experiencia de sus productores.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/red" className="button-dark">Entrar a la comunidad</Link><Link href="/fincas" className="button-light">Conocer fincas de Venezuela</Link></div></section>

      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="max-w-4xl"><p className="section-kicker">UNA RED PARA EL CAMPO VENEZOLANO</p><h2 className="section-title">Encuentra apoyo para el siguiente paso.</h2><p className="section-copy">Consulta información institucional, encuentra especialistas por estado y presenta proyectos para buscar colaboración.</p></div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/guia-institucional" className="rounded-[1.7rem] border border-[#3e2a19]/10 bg-white p-7 transition hover:-translate-y-1"><Building2 className="text-[#4c6b3a]" /><h3 className="font-display mt-8 text-3xl">Guía institucional</h3><p className="mt-3 text-sm leading-7 text-[#71685f]">Tierras, registro, sanidad, movilización y acuicultura con enlaces oficiales.</p><span className="text-link mt-6">Abrir la guía <ArrowRight size={16} /></span></Link>
          <Link href="/profesionales" className="rounded-[1.7rem] bg-[#4c6b3a] p-7 text-white transition hover:-translate-y-1"><UsersRound className="text-[#dbe6c9]" /><h3 className="font-display mt-8 text-3xl">Profesionales</h3><p className="mt-3 text-sm leading-7 text-white/80">Veterinaria, agronomía, genética, cultivos, suelos y más, por estado.</p><span className="gateway-link mt-6">Conocer la red <ArrowRight size={16} /></span></Link>
          <Link href="/empresas" className="rounded-[1.7rem] border border-[#3e2a19]/10 bg-white p-7 transition hover:-translate-y-1"><Building2 className="text-[#4c6b3a]" /><h3 className="font-display mt-8 text-3xl">Empresas</h3><p className="mt-3 text-sm leading-7 text-[#675f57]">Productos y servicios para la producción. Conoce cada empresa antes de contactar.</p><span className="text-link mt-6">Explorar empresas <ArrowRight size={16} /></span></Link>
          <Link href="/proyectos" className="rounded-[1.7rem] bg-[#211d1a] p-7 text-white transition hover:-translate-y-1"><Handshake className="text-[#f7b7a8]" /><h3 className="font-display mt-8 text-3xl">Proyectos y alianzas</h3><p className="mt-3 text-sm leading-7 text-white/80">Presenta tu proyecto agropecuario, explica sus recursos y solicita apoyo o colaboración.</p><span className="gateway-link mt-6">Ver proyectos <ArrowRight size={16} /></span></Link>
        </div>
        <div className="mt-5 flex flex-col justify-between gap-5 rounded-[1.6rem] border border-[#e5927c]/35 bg-[#fff4ee] p-6 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#9b4f3d]">CONSTRUIDO CON QUIEN PRODUCE</p><h3 className="font-display mt-2 text-3xl">¿Qué mejorarías en Venezuela Agro?</h3><p className="mt-2 text-sm text-[#71685f]">Propón mejoras o herramientas para la plataforma con “Compartir mi idea”. Si el navegador permite guardar datos, tu idea puede quedar pendiente en este dispositivo; al reconectar, revisa su confirmación de recepción.</p></div><span className="rounded-full bg-[#e5927c] px-5 py-3 text-sm font-bold">Tu experiencia cuenta</span></div>
      </section>

      <section id="produccion" className="hero-photo-production bg-[#211d1a] py-24 text-white lg:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="section-kicker" style={{color:"#c4d8b2"}}>PARCELA LOS MOROCHOS · PRODUCCIÓN</p>
              <h2 className="section-title text-white">El campo que nos inspira.</h2>
            </div>
            <p className="max-w-md text-base leading-7 text-white/80">
              Presentamos con transparencia las líneas activas y las que están
              en desarrollo. La disponibilidad se confirma antes de cada compra.
            </p>
          </div>

          <PhotoCredit id="llanos-sunset" />
          <article className="mt-12 grid overflow-hidden rounded-[2rem] border border-white/12 bg-[#171512] md:grid-cols-[.9fr_1.1fr]">
            <div className="relative min-h-72 md:min-h-[360px]">
              <Image src="/photos/llaneros-apure.webp" alt="Llaneros conduciendo un rebaño en Apure; fotografía documental de contexto, no inventario de la finca" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
              <span className="absolute left-5 top-5 rounded-full bg-[#f3ebdd] px-4 py-2 text-xs font-bold text-[#3e2a19]">MUESTRA DE CATÁLOGO</span>
              <div className="absolute inset-x-4 bottom-4 rounded-xl bg-black/65 px-3 pb-2"><PhotoCredit id="llaneros-apure" /></div>
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <p className="text-sm font-semibold text-[#b7d79a]">GANADERÍA BOVINA</p>
              <h3 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">Bovinos doble propósito</h3>
              <p className="readable-copy mt-4 text-base leading-7 text-white/70">Solicitud por animal o lote. La ficha final debe indicar peso, edad, condición, ubicación y datos de movilización disponibles.</p>
              <dl className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-white/8 p-4"><dt className="text-xs text-white/55">Precio referencial</dt><dd className="mt-1 font-semibold">Cotización según peso</dd></div><div className="rounded-xl bg-white/8 p-4"><dt className="text-xs text-white/55">Estado</dt><dd className="mt-1 font-semibold text-[#dbe6c9]">Disponible por confirmar</dd></div></dl>
              <p className="mt-4 text-xs leading-5 text-white/50">Ejemplo de presentación. No confirma inventario ni precio de venta.</p>
              <Link href="/tienda" className="button-light mt-7 w-fit">Consultar producción <ArrowRight size={17} /></Link>
            </div>
          </article>

          <div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {productionAreas.map((area) => (
              <Link href="/tienda" key={area.title} className="min-h-52 bg-[#211d1a] p-7 transition-colors hover:bg-[#2c2722]" aria-label={`Consultar disponibilidad de ${area.title}`}>
                <span className="text-4xl" aria-hidden="true">{area.emoji}</span>
                <h3 className="mt-8 text-xl font-semibold">{area.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{area.note}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#b7d79a]">Consultar producción <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-12 lg:py-36">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#6b4a2f]">
          <Image
            src="/legado-familiar.webp"
            alt="Manos de una pareja de agricultores sobre una cerca de madera"
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
          <div className="absolute bottom-5 left-5 rounded-full bg-[#f3ebdd]/90 px-4 py-2 text-sm font-semibold text-[#3e2a19] backdrop-blur">
            El trabajo también se hereda
          </div>
        </div>
        <div className="max-w-xl lg:pl-8">
          <p className="section-kicker">NUESTRA HISTORIA</p>
          <h2 className="section-title">Un legado que comenzó en familia.</h2>
          <p className="section-copy">
            Andrés Abelino Vásquez y Flor Elba Ibañez construyeron en El Nula
            una vida alrededor del trabajo diario: vacas de ordeño, siembras,
            decisiones difíciles y una convicción sencilla — dejar a su familia
            una tierra con futuro.
          </p>
          <p className="mt-5 text-base leading-8 text-[#675f57]">
            Hoy, más de cuatro décadas después, Parcela Los Morochos
            conserva ese origen mientras incorpora educación, trazabilidad y
            tecnología al servicio del campo.
          </p>
          <Link href="/nosotros" className="text-link mt-8">
            Conocer nuestra historia <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section aria-labelledby="home-closing-title" className="home-closing">
        <div className="home-closing-panel">
          <div className="home-closing-main">
            <div className="home-closing-copy">
              <p className="home-closing-eyebrow"><span aria-hidden="true"><Leaf size={14} /></span> RAÍCES DE CAMPO. VISIÓN DE FUTURO.</p>
              <h2 id="home-closing-title">Somos campo.<br />Somos familia.<br /><span>Somos futuro.</span></h2>
              <p className="home-closing-description">Tu experiencia y la tecnología pueden crecer juntas. Organiza tu finca, aprende y conecta con una comunidad que quiere producir mejor.</p>
              <div className="home-closing-actions">
                <Link href="/app" prefetch={false} className="home-closing-primary">Crear mi finca <ArrowRight size={18} aria-hidden="true" /></Link>
                <Link href="/nosotros#contacto" className="home-closing-secondary"><MessageCircle size={18} aria-hidden="true" /> Conversemos</Link>
              </div>
              <p className="home-closing-note">Hecho en Apure, para el campo venezolano.</p>
            </div>
            <figure className="home-closing-visual">
              <div className="home-closing-grid" aria-hidden="true" />
              <div className="home-closing-orbit home-closing-orbit-outer" aria-hidden="true" />
              <div className="home-closing-orbit home-closing-orbit-inner" aria-hidden="true" />
              <span className="home-closing-spark home-closing-spark-one" aria-hidden="true" />
              <span className="home-closing-spark home-closing-spark-two" aria-hidden="true" />
              <div className="home-closing-visual-label" aria-hidden="true"><Sprout size={14} /> TRADICIÓN QUE ENSEÑA</div>
              <Image src="/morochito-transparent.webp" alt="Morochito, mascota educativa de Parcela Los Morochos" width={759} height={1140} sizes="(max-width: 639px) 152px, (max-width: 899px) 190px, 248px" loading="lazy" className="home-closing-morochito" />
              <figcaption className="home-closing-mascot-caption"><span className="home-closing-mascot-mark" aria-hidden="true"><Leaf size={18} /></span><span><strong>Morochito</strong><span>Tu compañero de campo</span></span></figcaption>
              <span className="home-closing-corner home-closing-corner-start" aria-hidden="true" />
              <span className="home-closing-corner home-closing-corner-end" aria-hidden="true" />
            </figure>
          </div>
          <ul className="home-closing-benefits" aria-label="Un espacio para crecer">
            <li><span aria-hidden="true"><Sprout size={20} /></span><div><strong>Organiza</strong><p>Tu finca, a tu ritmo.</p></div></li>
            <li><span aria-hidden="true"><BookOpen size={20} /></span><div><strong>Aprende</strong><p>Del campo y su gente.</p></div></li>
            <li><span aria-hidden="true"><UsersRound size={20} /></span><div><strong>Conecta</strong><p>Ideas que crecen juntas.</p></div></li>
          </ul>
        </div>
      </section>
      <PublicFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
