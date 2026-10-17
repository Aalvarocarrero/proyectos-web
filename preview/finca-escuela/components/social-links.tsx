"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Share2, X } from "lucide-react";
import { Popover } from "radix-ui";
import { OFFICIAL_HANDLE, OFFICIAL_SOCIAL_LINKS } from "@/lib/official-links";
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon, ThreadsIcon } from "@/components/brand-icons";
import { chooseSocialPosition, createSocialLayoutScheduler, type SocialRect } from "@/lib/social-position";
import styles from "./social-links.module.css";

const icons = { Instagram: InstagramIcon, TikTok: TikTokIcon, Facebook: FacebookIcon, YouTube: YouTubeIcon, Threads: ThreadsIcon };
const socialLinks = OFFICIAL_SOCIAL_LINKS.map(link => ({ ...link, icon: icons[link.label as keyof typeof icons] }));
const avoidSelector = ".button-primary, .button-dark, .button-light, .button-glass, .store-request-trigger, .application-orb, .idea-orb, .project-orb, .site-header, .install-banner, button[type=submit], [data-slot=button], [data-social-avoid]";
const dialogSelector = "[role='dialog'][data-state='open']:not([data-social-panel]), [role='alertdialog']";

export function SocialFloatingMenu() {
  const pathname = usePathname();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<ReturnType<typeof chooseSocialPosition> | null>(null);
  const [obscured, setObscured] = useState(false);
  const positionRef=useRef<ReturnType<typeof chooseSocialPosition>|null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const safeAreaRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const measure = () => {
      const button = triggerRef.current;
      if (!button) return;
      const visual = window.visualViewport;
      const viewport = { left: visual?.offsetLeft ?? 0, top: visual?.offsetTop ?? 0, width: visual?.width ?? window.innerWidth, height: visual?.height ?? window.innerHeight };
      const safe = safeAreaRef.current ? getComputedStyle(safeAreaRef.current) : null;
      const obstacles: SocialRect[] = [];
      for (const element of document.querySelectorAll<HTMLElement>(avoidSelector)) {
        const style = getComputedStyle(element);
        if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) continue;
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) obstacles.push({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom });
      }
      const next = chooseSocialPosition({
        previous:positionRef.current??undefined,
        viewport, button: { width: button.offsetWidth || 56, height: button.offsetHeight || 56 }, obstacles,
        panel: open ? { width: 224, height: Math.max(280, panelRef.current?.scrollHeight ?? 320) } : undefined,
        insets: { top: parseFloat(safe?.paddingTop ?? "0") || 0, right: parseFloat(safe?.paddingRight ?? "0") || 0, bottom: parseFloat(safe?.paddingBottom ?? "0") || 0, left: parseFloat(safe?.paddingLeft ?? "0") || 0 },
      });
      positionRef.current=next;
      setPosition(previous => previous && Object.keys(next).every(key => previous[key as keyof typeof next] === next[key as keyof typeof next]) ? previous : next);
      const blockedByDialog = Boolean(document.querySelector(dialogSelector));
      setObscured(blockedByDialog);
      // An explicit close stays available whenever the panel fits; never move an underlying CTA.
      if (open && (next.hidden || blockedByDialog)) setOpen(false);
    };
    const scheduler=createSocialLayoutScheduler({measure,setTimer:(fn,ms)=>window.setTimeout(fn,ms),clearTimer:id=>window.clearTimeout(id),requestFrame:fn=>requestAnimationFrame(fn),cancelFrame:id=>cancelAnimationFrame(id)});
    const {schedule,onScroll}=scheduler;
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    if (triggerRef.current) resize.observe(triggerRef.current);
    if (panelRef.current) resize.observe(panelRef.current);
    for (const element of document.querySelectorAll(avoidSelector)) resize.observe(element);
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "data-state", "role"] });
    schedule();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", onScroll);
    return () => {
      scheduler.stop(); resize.disconnect(); mutations.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", onScroll, true);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", onScroll);
    };
  }, [open, pathname]);

  const hidden = !position || position.hidden || obscured;
  const panelStyle = { width: position?.panelWidth ?? 224, "--social-panel-max-height": `${position?.panelMaxHeight ?? 320}px` } as CSSProperties;

  return <>
    <span ref={safeAreaRef} className={styles.safeAreaProbe} aria-hidden="true" />
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button ref={triggerRef} type="button" className={`glass-action-orb ${styles.trigger}`} data-social-control style={{ left: position?.left ?? 0, top: position?.top ?? 0, visibility: hidden ? "hidden" : "visible" }} aria-label={open ? "Cerrar redes de Venezuela Agro" : "Abrir redes de Venezuela Agro"}>
          {open ? <X aria-hidden="true" size={20} /> : <Share2 aria-hidden="true" size={19} />}<span>Redes</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content ref={panelRef} data-social-panel data-slot="popover-content" side={position?.panelSide ?? "left"} align="end" sideOffset={10} collisionPadding={12} avoidCollisions sticky="always" className={styles.panel} style={panelStyle} aria-labelledby={titleId} onOpenAutoFocus={event => { event.preventDefault(); closeRef.current?.focus(); }} onCloseAutoFocus={event => { event.preventDefault(); if (!obscured) triggerRef.current?.focus(); }}>
          <header className={styles.header}>
            <div><p className={styles.kicker}>VENEZUELA AGRO</p><h2 id={titleId} className={styles.title}>Nuestras redes</h2></div>
            <Popover.Close asChild><button ref={closeRef} type="button" className={styles.close} aria-label="Cerrar redes sociales"><X aria-hidden="true" size={20} /></button></Popover.Close>
          </header>
          <nav aria-label="Redes oficiales de Venezuela Agro">
            {socialLinks.map(({ label, href, icon: Icon }) => <a key={label} href={href} target="_blank" rel="noreferrer" className={styles.link}><Icon className={styles.linkIcon} /><span>{label}</span><ArrowUpRight className={styles.external} aria-hidden="true" size={14} /><span className="sr-only"> (abre otra pestaña)</span></a>)}
          </nav>
          <p className={styles.handle}>{OFFICIAL_HANDLE}</p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  </>;
}
