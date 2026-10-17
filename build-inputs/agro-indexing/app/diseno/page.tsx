import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Leaf, ShoppingBasket, Store, Users, WifiOff, BriefcaseBusiness, Building2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PublicFooter } from "@/components/public-footer";
import { ConnectivityPill } from "@/components/connectivity-pill";
import { DesignFormExample } from "@/components/design-form-example";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Vista de diseño y componentes",
  description: "Revisión visual de la identidad y los estados de interfaz de Venezuela Agro.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/diseno" },
};
const sections = [
  { title: "Mi Finca", label: "GESTIÓN LOCAL", copy: "Organiza potreros, animales y registros. Consulta el ejemplo antes de comenzar con tus propios datos.", href: "/finca-modelo", action: "Explorar finca de ejemplo", Icon: Leaf },
  { title: "Mercado Agro", label: "OFERTAS DEL CAMPO", copy: "Explora productos y servicios. Las publicaciones requieren revisión antes de mostrarse al público.", href: "/marketplace", action: "Ver Mercado Agro", Icon: Store },
  { title: "Parcela Los Morochos", label: "TIENDA POR SOLICITUD", copy: "Conoce el catálogo y solicita disponibilidad. Una solicitud no confirma una compra ni un pago.", href: "/tienda", action: "Explorar productos", Icon: ShoppingBasket },
  { title: "Comunidad", label: "PERSONAS Y PROYECTOS", copy: "Encuentra productores, profesionales, empresas y proyectos en la red agropecuaria.", href: "/red", action: "Conocer la comunidad", Icon: Users },
  { title: "Profesionales", label: "CONOCIMIENTO ESPECIALIZADO", copy: "Consulta el directorio de profesionales y sus servicios. Revisa el perfil y acuerda directamente el alcance del trabajo.", href: "/profesionales", action: "Ver profesionales", Icon: BriefcaseBusiness },
  { title: "Empresas", label: "ALIADOS DEL AGRO", copy: "Explora los perfiles empresariales del sector, sus productos y formas de contacto.", href: "/empresas", action: "Ver empresas", Icon: Building2 },
  { title: "Aprende", label: "PASO A PASO", copy: "Guías para usar la plataforma, preparar tu dispositivo y cuidar tus registros.", href: "/aprende", action: "Abrir las guías", Icon: BookOpen },
];
export default function DesignPreviewPage() {
  return <main className="min-h-screen bg-[#f3ebdd]">
    <SiteHeader />
    <section className="hero-photo-production px-5 pb-16 pt-36 text-white sm:px-8 lg:px-12 lg:pt-44">
      <div className="mx-auto max-w-6xl">
        <p className="section-kicker">VENEZUELA AGRO · VISTA DE DISEÑO</p>
        <h1 className="font-display mt-5 max-w-3xl text-5xl leading-[1.08] sm:text-7xl">La misma tierra.<br />Una experiencia más clara.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">Crema, café y verde. La identidad de siempre, con acciones coherentes, formularios claros y estados que explican qué está pasando.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="#recorrido" className="button-primary">Explorar la vista <ArrowRight size={18} aria-hidden="true" /></Link><Link href="/" className="button-glass">Ir a la plataforma</Link></div>
        <div className="mt-7 max-w-xl"><ConnectivityPill /></div>
        <p className="mt-4 max-w-xl text-xs leading-5 text-white/75">Vista de revisión visual. Los ejemplos no acreditan sincronización, disponibilidad comercial ni funcionamiento de servicios externos.</p>
      </div>
    </section>
    <div className="mx-auto max-w-6xl space-y-16 px-5 py-14 sm:px-8">
      <section id="recorrido" aria-labelledby="areas-heading">
        <p className="section-kicker">UN PUNTO DE PARTIDA POR ÁREA</p><h2 id="areas-heading" className="font-display mt-3 text-4xl">Todo el campo, conectado.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-[#675f57]">Estas tarjetas llevan a las áreas existentes. La finca de ejemplo está identificada como demostración; tus registros siguen separados.</p>
        <div className="design-preview-grid mt-7">{sections.map(({ title, label, copy, href, action, Icon }) => <article key={href} className="design-preview-card flex flex-col"><span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#e7dbc7] text-[#4c6b3a]"><Icon aria-hidden="true" /></span><p className="section-kicker text-[.65rem]">{label}</p><h3 className="font-display mt-3 text-3xl">{title}</h3><p className="mb-6 mt-4 flex-1 text-sm leading-7 text-[#675f57]">{copy}</p><Link href={href} className="text-link min-h-11 text-[#3e2a19]">{action}<ArrowRight size={16} aria-hidden="true" /></Link></article>)}</div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2" aria-labelledby="form-heading">
        <div className="design-preview-card"><p className="section-kicker">FORMULARIOS QUE ORIENTAN</p><h2 id="form-heading" className="font-display mb-6 mt-3 text-4xl">Prueba sin compromiso.</h2><DesignFormExample /></div>
        <div className="design-preview-card"><p className="section-kicker">ESTADOS SIN CONFUSIÓN</p><h2 className="font-display mt-3 text-4xl">Lo local y lo enviado.</h2><div className="mt-6 space-y-4"><div className="rounded-xl border bg-[#f3ebdd] p-4"><p className="flex items-center gap-2 font-bold"><WifiOff size={18} aria-hidden="true" />Ejemplo: sin conexión</p><p className="mt-2 text-sm leading-6 text-[#675f57]">Solo están disponibles los recursos preparados y los registros conservados en este navegador.</p></div><div className="rounded-xl border border-[#4c6b3a]/30 bg-[#edf2e7] p-4"><p className="font-bold text-[#365026]">Ejemplo: guardado en el dispositivo</p><p className="mt-2 text-sm leading-6 text-[#675f57]">Un guardado local no confirma envío al servidor. Revisa los pendientes y descarga una copia.</p></div></div><Link href="/biblioteca-local" className="text-link mt-5 min-h-11">Preparar la consulta sin señal<ArrowRight size={16} aria-hidden="true" /></Link></div>
      </section>
      <section className="design-preview-card" aria-labelledby="identity-heading"><p className="section-kicker">UN LENGUAJE VISUAL COMPARTIDO</p><h2 id="identity-heading" className="font-display mt-3 text-4xl">Nuestra identidad, cuidada.</h2><div className="mt-6 flex flex-wrap gap-4">{[["Crema", "#f3ebdd"], ["Café", "#3e2a19"], ["Verde", "#4c6b3a"]].map(([name, color]) => <div key={name} className="flex min-w-40 items-center gap-3 rounded-xl border bg-white p-3"><span aria-hidden="true" className="size-10 rounded-full border" style={{ backgroundColor: color }} /><div><p className="text-sm font-bold">{name}</p><p className="text-xs text-[#675f57]">{color}</p></div></div>)}</div><div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link href="/app">Abrir Mi Finca</Link></Button><Button variant="outline" asChild><Link href="/aprende">Consultar ayuda</Link></Button><Button disabled>Ejemplo no disponible</Button></div><p className="mt-5 text-sm leading-6 text-[#675f57]">Navega con Tab para ver el foco. En pantallas táctiles, los controles compartidos tienen un área mínima de 44 píxeles. Se respeta la preferencia de movimiento reducido.</p></section>
    </div>
    <PublicFooter />
  </main>;
}
