"use client";

import { useState } from "react";
import { ConnectionIndicator } from "@/components/connection-indicator";
import { SessionMenu } from "@/components/session-menu";
import { isNavigationActive } from "@/lib/navigation-state";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {OFFICIAL_SOCIAL_LINKS} from "@/lib/official-links";
import { ChevronDown, Menu, UserRound } from "lucide-react";
import { AccessibilityMenu } from "@/components/accessibility-menu";
import { VenezuelaAgroLogo } from "@/components/venezuelaagro-logo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { desktopNavigation, navigationGroups, primaryNavigation } from "@/lib/site-navigation";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      {pathname !== "/" && <button type="button" className="interior-skip-link" onClick={()=>{const heading=document.querySelector<HTMLElement>("main h1");if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView({block:"center",behavior:"instant"});}}}>Saltar al contenido</button>}
      <div className="brand-toolbar mx-auto flex min-h-[64px] sm:min-h-[72px] max-w-[1420px] items-center justify-between gap-2 rounded-2xl border border-white/15 bg-[#171512]/88 px-2.5 py-2 text-white shadow-[0_14px_48px_rgba(0,0,0,.2)] backdrop-blur-2xl sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Venezuela Agro, hecho por Parcela Los Morochos — inicio">
          <span className="min-w-0 leading-tight">
            <VenezuelaAgroLogo compact />
          </span>
        </Link>

        <nav className="hidden items-center gap-5 min-[1200px]:flex" aria-label="Navegación principal">
          {desktopNavigation.map(([label, href]) => (
            <Link key={label} href={href} aria-current={isNavigationActive(pathname, href) ? "page" : undefined} className="nav-link inline-flex min-h-11 items-center text-sm text-white/80 transition hover:text-white">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ConnectionIndicator />
          <Link
            href="/app"
            aria-label="Abrir Mi finca"
            aria-current={isNavigationActive(pathname, "/app") || pathname === "/app-local" ? "page" : undefined}
            className="pressable inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-[#f3ebdd] px-3 text-xs font-semibold text-[#211d1a] sm:gap-2 sm:px-4 sm:text-sm"
          >
            <UserRound size={16} className="min-[360px]:hidden sm:block" aria-hidden="true" />
            <span className="hidden min-[360px]:inline">Mi finca</span>
          </Link>
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
            <button className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/90" aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}>
              <Menu size={19} />
            </button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={16} collisionPadding={12} className="brand-menu z-[100] w-80 max-w-[calc(100vw-1.5rem)] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto rounded-2xl border-white/15 bg-[#211d1a] p-2 text-white shadow-2xl">
            <nav aria-label="Navegación del menú">
              <p className="px-4 pb-2 pt-3 text-xs font-bold uppercase tracking-wider text-[#b7d79a]">¿Qué necesitas hacer?</p>
              {primaryNavigation.map(([label, href]) => (
                <Link key={label} href={href} onClick={() => setMenuOpen(false)} aria-current={isNavigationActive(pathname, href) ? "page" : undefined} className="nav-link block rounded-xl px-4 py-3 text-base text-white/85 hover:bg-white/8 hover:text-white">
                  {label}
                </Link>
              ))}
              <div className="my-2 border-y border-white/15 py-2">
                {navigationGroups.map(group => <details key={group.label} className="group/navigation">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/8 [&::-webkit-details-marker]:hidden">
                    {group.label}<ChevronDown size={16} className="shrink-0 transition-transform group-open/navigation:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="pb-2 pl-2">
                    {group.links.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={isNavigationActive(pathname, href) ? "page" : undefined} className="nav-link block min-h-11 rounded-xl px-4 py-3 text-sm leading-6 text-white/75 hover:bg-white/8 hover:text-white">{label}</Link>)}
                  </div>
                </details>)}
              </div>
              {pathname !== "/finca-demo" && !pathname?.startsWith("/finca-demo/") && <a href="#participar" onClick={() => setMenuOpen(false)} className="participation-menu-link nav-link rounded-xl px-4 py-3 text-base text-white/85 hover:bg-white/8 hover:text-white">Compartir idea o proyecto</a>}
              <AccessibilityMenu variant="menu" />
              <SessionMenu onNavigate={() => setMenuOpen(false)} />
              <div className="mt-2 border-t border-white/15 px-4 pt-3"><p className="text-xs font-bold text-white/60">Redes oficiales</p><div className="mt-2 flex flex-wrap gap-3">{OFFICIAL_SOCIAL_LINKS.map(link=><a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="min-h-11 py-2 text-sm text-white underline">{link.label}</a>)}</div></div>
            </nav>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
