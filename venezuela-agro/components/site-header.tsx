"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {OFFICIAL_SOCIAL_LINKS} from "@/lib/official-links";
import { Menu, UserRound } from "lucide-react";
import { AccessibilityMenu } from "@/components/accessibility-menu";
import { VenezuelaAgroLogo } from "@/components/venezuelaagro-logo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const links = [
  ["Producción", "/#produccion"],
  ["Productos Parcela Los Morochos", "/tienda"],
  ["Fincas", "/fincas"],
  ["Comunidad", "/red"],
  ["Mercado Agro", "/marketplace"],
  ["Aprende", "/aprende"],
  ["Stickers del agro", "/stickers"],
  ["Descargar sin señal", "/biblioteca-local"],
  ["Instituciones", "/guia-institucional"],
  ["Profesionales", "/profesionales"],
  ["Proyectos", "/proyectos"],
  ["Nosotros", "/nosotros"],
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="brand-toolbar mx-auto flex min-h-[64px] sm:min-h-[72px] max-w-[1420px] items-center justify-between gap-2 rounded-2xl border border-white/15 bg-[#171512]/88 px-2.5 py-2 text-white shadow-[0_14px_48px_rgba(0,0,0,.2)] backdrop-blur-2xl sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Venezuela Agro, hecho por Parcela Los Morochos — inicio">
          <span className="min-w-0 leading-tight">
            <VenezuelaAgroLogo compact />
          </span>
        </Link>

        <nav className="hidden items-center gap-4 min-[1440px]:flex" aria-label="Navegación principal">
          {links.filter(([,href])=>["/tienda","/marketplace","/fincas","/red","/profesionales","/aprende"].includes(href)).map(([label, href]) => (
            <Link key={label} href={href} aria-current={pathname === href ? "page" : undefined} className="nav-link inline-flex min-h-11 items-center text-sm text-white/80 transition hover:text-white">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <AccessibilityMenu />
          <Link
            href="/app"
            aria-label="Abrir Mi finca"
            className="pressable inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f3ebdd] text-sm font-semibold text-[#211d1a] sm:w-auto sm:gap-2 sm:px-4"
          >
            <UserRound size={16} />
            <span className="hidden sm:inline">Mi finca</span>
          </Link>
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
            <button className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/90" aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}>
              <Menu size={19} />
            </button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={16} collisionPadding={12} className="brand-menu z-[100] w-72 max-w-[calc(100vw-1.5rem)] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto rounded-2xl border-white/15 bg-[#211d1a] p-2 text-white shadow-2xl">
            <nav aria-label="Navegación del menú">
              {links.map(([label, href]) => (
                <Link key={label} href={href} onClick={() => setMenuOpen(false)} aria-current={pathname === href ? "page" : undefined} className="nav-link block rounded-xl px-4 py-3 text-base text-white/85 hover:bg-white/8 hover:text-white">
                  {label}
                </Link>
              ))}
              <div className="mt-2 border-t border-white/15 px-4 pt-3"><p className="text-xs font-bold text-white/60">Redes oficiales</p><div className="mt-2 flex flex-wrap gap-3">{OFFICIAL_SOCIAL_LINKS.map(link=><a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="min-h-11 py-2 text-sm text-white underline">{link.label}</a>)}</div></div>
            </nav>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
