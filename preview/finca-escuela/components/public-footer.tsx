import Link from "next/link";
import { VenezuelaAgroLogo } from "@/components/venezuelaagro-logo";
import { MapPinned } from "lucide-react";
import { SiteImage as Image } from "@/components/site-image";
import { OFFICIAL_SOCIAL_LINKS, GOOGLE_BUSINESS_URL } from "@/lib/official-links";
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon, ThreadsIcon } from "@/components/brand-icons";

const icons = { Instagram: InstagramIcon, TikTok: TikTokIcon, Facebook: FacebookIcon, YouTube: YouTubeIcon, Threads: ThreadsIcon };
const socialLinks = OFFICIAL_SOCIAL_LINKS.map(link => ({...link, icon: icons[link.label as keyof typeof icons]}));

export function PublicFooter({ storeRequest = false }: { storeRequest?: boolean }) {
  return (
    <footer className="bg-[#171512] text-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-4">
            <Image src="/logo-morochos.webp" alt="Logo oficial de Parcela Los Morochos" width={78} height={78} className="h-[78px] w-[78px] rounded-full border-2 border-[#b9946b] bg-[#f3ebdd] object-contain" />
            <div className="max-w-[230px] text-base font-bold leading-5">
              <VenezuelaAgroLogo />
              <span className="mt-2 block text-xs font-normal text-white/60">Hecho por Parcela Los Morochos</span>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
            Tecnología para la producción, el comercio y la colaboración del agro venezolano.
            Raíces en El Nula, Apure. Alcance nacional y visión internacional.
          </p>
          <a href={GOOGLE_BUSINESS_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-white/80 transition hover:bg-white/8 hover:text-white"><MapPinned size={17} /> Ver ubicación y reseñas en Google</a>
          <div className="mt-5 flex gap-2" aria-label="Redes sociales oficiales">
            {socialLinks.map(({ label, href, icon: Icon }) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"><Icon className="h-[19px] w-[19px]" /></a>)}
          </div>
        </div>
        <div>
          <p className="footer-title">Explora</p>
          <div className="footer-links">
            <Link href="/tienda">Tienda</Link>
            <Link href="/marketplace">Mercado Agro</Link>
            <Link href="/fincas">Fincas de Venezuela</Link>
            <Link href="/red">Comunidad del agro</Link>
            <Link href="/stickers">Stickers del agro</Link>
            <Link href="/aprende">Aprende a usar la plataforma</Link>
            <Link href="/rubros">Rubros del agro</Link>
            <Link href="/guia-institucional">Guía institucional</Link>
            <Link href="/app">Mi Finca</Link>
          </div>
        </div>
        <div>
          <p className="footer-title">Información</p>
          <div className="footer-links">
            <Link href="/nosotros">Nuestra historia</Link>
            <Link href="/profesionales">Profesionales</Link>
            <Link href="/empresas">Empresas y proveedores</Link>
            <Link href="/proyectos">Proyectos y alianzas</Link>
            <Link href="/legal/privacidad">Privacidad</Link>
            <Link href="/legal/terminos">Términos</Link>
            <Link href="/legal/comercio">Política comercial</Link>
            <Link href="/creditos-fotograficos">Créditos de fotografías reales</Link>
            <a href="mailto:alimentosparcelalosmorochos@gmail.com">Contacto</a>
          </div>
        </div>
      </div>
      <div style={{paddingBottom:`calc(${storeRequest?"13rem":"7rem"} + env(safe-area-inset-bottom))`}} className="mx-auto flex max-w-[1440px] flex-col gap-3 border-t border-white/10 px-5 pt-6 text-xs text-white/40 sm:px-8 md:flex-row md:justify-between lg:px-12">
        <p>© 2026 Venezuela Agro · Parcela Los Morochos.</p>
        <p>Finca impulsora: RIF V056414890 · Plataforma: @venezuelaagro</p>
      </div>
    </footer>
  );
}
