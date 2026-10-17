"use client";

import {useEffect, useId, useRef, useState, useSyncExternalStore} from "react";
import {usePathname} from "next/navigation";
import {Popover} from "radix-ui";
import {Compass, MessageCircle, X, Lightbulb, Sprout, Download, ArrowUpRight} from "lucide-react";
import {OFFICIAL_SOCIAL_LINKS} from "@/lib/official-links";
import {installActionSnapshot, installActionServerSnapshot, subscribeInstallAction, requestInstallAction} from "@/lib/install-action";

/** Shared responsive entry points; existing dialogs and submission handlers own all work. */
export function MobilePublicActions() {
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  const trigger=useRef<HTMLButtonElement>(null);
  const dock=useRef<HTMLDivElement>(null);
  const [contentOverlap,setContentOverlap]=useState(false);
  const firstAction=useRef<HTMLButtonElement>(null);
  const pendingIdea=useRef(false);
  const titleId=useId();
  const install=useSyncExternalStore(subscribeInstallAction,installActionSnapshot,installActionServerSnapshot);
  useEffect(()=>{setOpen(false);},[pathname]);
  useEffect(()=>{
    let frame=0;
    const measure=()=>{
      frame=0;
      if(!dock.current){setContentOverlap(false);return;}
      const target=dock.current.getBoundingClientRect();
      const overlaps=Array.from(document.querySelectorAll("#home-title, .home-hero .button-primary, .home-hero .button-glass")).some(element=>{
        const rect=element.getBoundingClientRect();
        return rect.left<target.right+8&&rect.right>target.left-8&&rect.top<target.bottom+8&&rect.bottom>target.top-8;
      });
      setContentOverlap(overlaps);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure);};
    schedule();window.addEventListener("scroll",schedule,{passive:true,capture:true});window.addEventListener("resize",schedule);
    window.visualViewport?.addEventListener("resize",schedule);
    const observer=new ResizeObserver(schedule);const hero=document.querySelector(".home-hero");if(hero)observer.observe(hero);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("scroll",schedule,true);window.removeEventListener("resize",schedule);window.visualViewport?.removeEventListener("resize",schedule);};
  },[pathname]);
  const excluded=["/admin","/juego-finca","/finca-demo","/finca-modelo"].some(route=>pathname===route||pathname.startsWith(route+"/"));
  if(excluded)return null;
  const whatsapp="https://wa.me/584264263601?text="+encodeURIComponent("Hola, quisiera información sobre Venezuela Agro.");
  return <div ref={dock} className="mobile-public-actions" data-mobile-public-actions data-content-overlap={contentOverlap&&!open}>
    <a className="mobile-public-action" data-action-tone="primary" href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Contactar al equipo de Venezuela Agro por WhatsApp (abre otra pestaña)"><MessageCircle aria-hidden="true" size={21}/><span>WhatsApp</span></a>
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild><button ref={trigger} data-mobile-more type="button" className="mobile-public-action" data-action-tone="secondary" aria-label="Explorar opciones de Venezuela Agro" aria-expanded={open}><Compass aria-hidden="true" size={18}/><span>Explorar</span></button></Popover.Trigger>
      <Popover.Portal><Popover.Content className="mobile-public-menu" data-mobile-public-menu side="top" align="end" sideOffset={12} collisionPadding={12} aria-labelledby={titleId}
        onOpenAutoFocus={event=>{event.preventDefault();firstAction.current?.focus();}}
        onCloseAutoFocus={event=>{event.preventDefault();trigger.current?.focus();if(pendingIdea.current){pendingIdea.current=false;setTimeout(()=>document.querySelector<HTMLButtonElement>(".idea-orb")?.click(),0);}}}>
        <header><h2 id={titleId}>Venezuela Agro</h2><Popover.Close asChild><button type="button" aria-label="Cerrar opciones"><X size={20} aria-hidden="true"/></button></Popover.Close></header>
        <button ref={firstAction} type="button" onClick={()=>{pendingIdea.current=true;setOpen(false);}}><Lightbulb size={18} aria-hidden="true"/>Compartir mi idea</button>
        <a href="/proyectos#presentar-proyecto" onClick={()=>setOpen(false)}><Sprout size={18} aria-hidden="true"/>Presentar mi proyecto</a>
        <button type="button" disabled={!install.ready||install.installed} onClick={()=>{requestInstallAction();setOpen(false);}}><Download size={18} aria-hidden="true"/>{install.installed?"Aplicación ya instalada":"Instalar o añadir aplicación"}</button>
        <p className="mobile-public-menu-label">Redes oficiales</p>
        <nav aria-label="Redes oficiales de Venezuela Agro">{OFFICIAL_SOCIAL_LINKS.map(link=><a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={15} aria-hidden="true"/><span className="sr-only"> (abre otra pestaña)</span></a>)}</nav>
      </Popover.Content></Popover.Portal>
    </Popover.Root>
  </div>;
}
