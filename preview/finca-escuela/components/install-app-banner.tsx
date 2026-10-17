"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {registerInstallAction} from "@/lib/install-action";
import { Download, Monitor, Share, Smartphone, Tablet, X } from "lucide-react";
import { startOrbMorph, type OrbMorph } from "@/lib/orb-morph";
import {
  claimInstallOffer, createInstallCountdown, detectInstallEnvironment, dismissInstallOffer, getInstallGuidance,
  INSTALL_MORPH_MS, isInstalledDisplayMode, isInstallOfferSuppressed, isInstallPromptEvent, scheduleInstallOffer,
  type InstallPromptEvent,
} from "@/lib/install-guidance";

declare global { interface Navigator { standalone?: boolean; } }

type Phase = "waiting" | "expanded" | "minimizing" | "compact" | "installed";
function storage(kind: "localStorage" | "sessionStorage"): Storage | null { try { return window[kind]; } catch { return null; } }
function hasOpenDialog() { return Boolean(document.querySelector("[role='dialog'][data-state='open'], [role='alertdialog']")); }
function installedDisplay() {
  return isInstalledDisplayMode({ navigatorStandalone: navigator.standalone, standalone: window.matchMedia("(display-mode: standalone)").matches, minimalUi: window.matchMedia("(display-mode: minimal-ui)").matches, windowControlsOverlay: window.matchMedia("(display-mode: window-controls-overlay)").matches });
}
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7d79a]";

export function InstallAppBanner() {
  const [environment] = useState(() => detectInstallEnvironment(typeof navigator === "undefined" ? {} : navigator));
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [userInteracted,setUserInteracted]=useState(false);
  const [installing, setInstalling] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [touching, setTouching] = useState(false);
  const [focused, setFocused] = useState(false);
  const [promptError, setPromptError] = useState("");
  const phaseRef = useRef<Phase>("waiting");
  const installedRef = useRef(false);
  const installingRef = useRef(false);
  const aliveRef = useRef(false);
  const introCompleteRef = useRef(false);
  const bannerRef = useRef<HTMLElement>(null);
  const orbRef = useRef<HTMLButtonElement>(null);
  const animationRef = useRef<OrbMorph | null>(null);
  const countdownRef = useRef<ReturnType<typeof createInstallCountdown> | null>(null);
  const visible = (phase === "expanded" || phase === "minimizing") && !dialogOpen;
  const guidance = getInstallGuidance(environment, Boolean(promptEvent));

  const changePhase = useCallback((next: Phase) => { phaseRef.current = next; setPhase(next); }, []);
  const completeIntro = useCallback(() => {
    if (!aliveRef.current || introCompleteRef.current) return;
    introCompleteRef.current = true;
    document.body.dataset.installIntro = "complete";
    window.dispatchEvent(new Event("venezuela-agro:install-intro-complete"));
  }, []);

  const minimize = useCallback(async (explicit = false) => {
    if (phaseRef.current !== "expanded" || installedRef.current) return;
    countdownRef.current?.cancel();
    if (explicit) dismissInstallOffer(storage("sessionStorage"), storage("localStorage"), Date.now());
    const banner = bannerRef.current, orb = orbRef.current;
    const restoreFocus = Boolean(banner?.contains(document.activeElement));
    changePhase("minimizing");
    let animation: OrbMorph | null = null;
    if (banner && orb) {
      animation = startOrbMorph({ source: banner, target: orb, duration: INSTALL_MORPH_MS, reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches });
      animationRef.current = animation;
      const outcome = await animation.finished;
      if (outcome === "cancelled") return;
      if (outcome === "reversed") {
        animation.release(); animationRef.current = null;
        if (aliveRef.current && !installedRef.current) changePhase("expanded");
        return;
      }
    }
    if (!aliveRef.current || installedRef.current) return;
    animation?.retire();
    flushSync(() => {
      changePhase("compact");
      setHovered(false); setTouching(false); setFocused(false);
    });
    // Wait for the compact state to render before allowing the next invitation.
    requestAnimationFrame(() => {
      if (!aliveRef.current) return;
      animation?.release(); if (animationRef.current === animation) animationRef.current = null;
      if (restoreFocus) {
        const mobileMore = document.querySelector<HTMLButtonElement>("[data-mobile-more]");
        (mobileMore ?? orbRef.current)?.focus();
      }
      completeIntro();
    });
  }, [changePhase, completeIntro]);

  useEffect(() => {
    aliveRef.current = true;
    document.body.dataset.installIntro = "pending";
    const session = storage("sessionStorage"), persistent = storage("localStorage");
    installedRef.current = installedDisplay();
    const initiallyQuiet = isInstallOfferSuppressed(session, persistent, Date.now(), installedRef.current);
    const stopOffer = scheduleInstallOffer({
      now: Date.now,
      setTimer: (callback, delay) => window.setTimeout(callback, delay), clearTimer: id => window.clearTimeout(id),
      isSuppressed: () => isInstallOfferSuppressed(session, persistent, Date.now(), installedRef.current),
      isBlocked: () => document.hidden || hasOpenDialog(),
      skip: () => { if (phaseRef.current === "waiting") { changePhase(installedRef.current ? "installed" : "compact"); requestAnimationFrame(completeIntro); } },
      offer: () => {
        if (phaseRef.current !== "waiting" || installedRef.current) return;
        if (claimInstallOffer(session, persistent, Date.now())) changePhase("expanded");
        else { changePhase("compact"); requestAnimationFrame(completeIntro); }
      },
    });
    const hideInstalled = () => {
      installedRef.current = true;
      stopOffer(); countdownRef.current?.cancel(); animationRef.current?.cancel();
      dismissInstallOffer(session, persistent, Date.now());
      changePhase("installed"); setPromptEvent(null);
      requestAnimationFrame(completeIntro);
    };
    const onBeforeInstall = (event: Event) => {
      if (!isInstallPromptEvent(event) || installedRef.current) return;
      event.preventDefault();
      // Capability may arrive late; it updates manual access without replaying the intro.
      setPromptEvent(event);
    };
    const onDisplayChange = () => { if (installedDisplay()) hideInstalled(); };
    const modes = ["standalone", "minimal-ui", "window-controls-overlay"].map(mode => window.matchMedia(`(display-mode: ${mode})`));
    for (const mode of modes) mode.addEventListener("change", onDisplayChange);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", hideInstalled);
    const updateVisibility = () => { setDialogOpen(hasOpenDialog()); setPageHidden(document.hidden); };
    const initialFrame = requestAnimationFrame(() => {
      updateVisibility();
      if (initiallyQuiet) {
        changePhase(installedRef.current ? "installed" : "compact");
        requestAnimationFrame(completeIntro);
      }
    });
    const observer = new MutationObserver(updateVisibility);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state", "role"] });
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      aliveRef.current = false;
      stopOffer(); observer.disconnect(); cancelAnimationFrame(initialFrame); countdownRef.current?.cancel(); animationRef.current?.cancel();
      for (const mode of modes) mode.removeEventListener("change", onDisplayChange);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", hideInstalled);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, [changePhase, completeIntro]);

  useEffect(() => {
    if (phase !== "expanded") return;
    const countdown = createInstallCountdown({ now: Date.now, finish: () => { void minimize(); }, setTimer: (callback, delay) => window.setTimeout(callback, delay), clearTimer: id => window.clearTimeout(id) });
    countdownRef.current = countdown;
    return () => { countdown.cancel(); if (countdownRef.current === countdown) countdownRef.current = null; };
  }, [phase, minimize]);

  useEffect(() => {
    if (userInteracted || hovered || touching || focused || showHelp || installing || dialogOpen || pageHidden) countdownRef.current?.pause();
    else countdownRef.current?.resume();
  }, [phase, userInteracted, hovered, touching, focused, showHelp, installing, dialogOpen, pageHidden]);

  useEffect(() => {
    if (visible) document.body.dataset.installPrompt = "visible";
    else delete document.body.dataset.installPrompt;
    // Expanded guidance, not the compact circle, pauses the ideas sequence.
    if (visible || installing) document.body.dataset.installInteraction = "active";
    else delete document.body.dataset.installInteraction;
    return () => { delete document.body.dataset.installPrompt; delete document.body.dataset.installInteraction; };
  }, [visible, installing]);

  function stopInstallCountdown(event?: { target: EventTarget | null; key?: string }) {
    setUserInteracted(true); countdownRef.current?.cancel();
    const target = event?.target instanceof Element ? event.target : null;
    if (phaseRef.current === "minimizing" && event?.key !== "Escape" && !target?.closest("[data-orb-morph-close]")) animationRef.current?.reverse();
  }

  function reopen() {
    if (installedRef.current) return;
    setUserInteracted(true);
    setShowHelp(false); setPromptError(""); setHovered(false); setTouching(false); setFocused(false);
    changePhase("expanded");
  }

  async function install() {
    if (installingRef.current) return;
    if (!promptEvent) { setShowHelp(true); return; }
    const event = promptEvent;
    installingRef.current = true;
    setInstalling(true); setPromptError(""); setPromptEvent(null);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (aliveRef.current && (choice.outcome === "accepted" || choice.outcome === "dismissed")) await minimize(true);
    } catch {
      if (aliveRef.current && !installedRef.current) { setPromptError("El navegador no pudo abrir la instalación. Puedes seguir los pasos manuales."); setShowHelp(true); }
    } finally {
      installingRef.current = false;
      if (aliveRef.current) setInstalling(false);
    }
  }

  useEffect(()=>registerInstallAction({ready:true,nativePrompt:Boolean(promptEvent),installed:phase==="installed",environment},()=>{
    if(installedRef.current)return;
    stopInstallCountdown();reopen();
    if(promptEvent)void install();else setShowHelp(true);
  }));

  const DeviceIcon = environment.device === "computer" ? Monitor : environment.device === "tablet" ? Tablet : Smartphone;
  if (phase === "installed") return null;
  return <>
    <button ref={orbRef} type="button" className={`application-orb glass-action-orb ${phase === "compact" && !dialogOpen ? "" : "invisible pointer-events-none"} ${focusRing}`} aria-label="Aplicación: ver instalación o acceso directo" aria-hidden={phase !== "compact" || dialogOpen} tabIndex={phase === "compact" && !dialogOpen ? 0 : -1} onClick={reopen}>
      <DeviceIcon aria-hidden="true" size={20} /><span>Aplicación</span>
    </button>
    {visible && <aside ref={bannerRef} data-show-help={showHelp} className={`install-banner ${phase === "minimizing" ? "install-banner-minimizing" : ""} fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-[100] mx-auto max-h-[calc(100dvh-2rem)] max-w-xl overflow-y-auto overscroll-contain rounded-[1.35rem] border border-white/12 bg-[#211d1a]/97 p-3 text-white shadow-[0_24px_80px_rgba(0,0,0,.4)] backdrop-blur-2xl sm:bottom-5 sm:left-auto sm:right-5 sm:mx-0 sm:max-w-sm sm:p-4`} aria-label="Instalación y acceso directo" onPointerDownCapture={stopInstallCountdown} onKeyDownCapture={event => { if(event.key === "Escape" && !installing) { event.preventDefault(); void minimize(true); } else stopInstallCountdown(event); }} onPointerEnter={event => { if (event.pointerType !== "touch") setHovered(true); }} onPointerLeave={() => setHovered(false)} onTouchStart={() => setTouching(true)} onTouchEnd={() => setTouching(false)} onTouchCancel={() => setTouching(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
      <div data-orb-morph-content className="flex items-start gap-3">
        <span className="install-banner-device flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdd] text-[#3e2a19]"><DeviceIcon aria-hidden="true" size={21} /></span>
        <div className="min-w-0 flex-1">
          <p className="install-banner-title text-sm font-bold">{guidance.title}</p>
          <p className="install-banner-intro mt-1 text-xs leading-5 text-white/75">Vuelve al campo con menos pasos. Antes de trabajar sin señal, abre Mi Finca → Sincronización y prepara este dispositivo.</p>
          {promptError && <p role="status" className="mt-2 text-xs leading-5 text-[#f3d8a5]">{promptError}</p>}
          {showHelp && <div className="install-banner-help mt-3 rounded-xl bg-white/8 p-3 text-xs leading-5 text-white/85">
            <p className="install-banner-help-title flex items-center gap-2 font-bold text-white"><Share aria-hidden="true" size={15} />{environment.os === "ios" ? "Desde Safari en iPhone o iPad" : "Pasos en tu navegador"}</p>
            <ol className="mt-2 list-decimal space-y-2 pl-4">{guidance.steps.map(step => <li key={step}>{step}</li>)}</ol>
            <p className="mt-3 text-white/70">Estos pasos los completas tú en el navegador o sistema; la página no crea el acceso automáticamente.</p>
            <button type="button" onClick={() => setShowHelp(false)} className={`mt-2 min-h-11 underline underline-offset-4 ${focusRing}`}>Ocultar pasos</button>
          </div>}
          {(!showHelp || promptEvent) && <button type="button" disabled={installing} onClick={() => void install()} className={`install-banner-action mt-3 inline-flex min-h-11 max-w-full items-center gap-2 whitespace-normal rounded-full bg-[#f3ebdd] px-4 py-2 text-xs font-bold text-[#211d1a] disabled:cursor-wait disabled:opacity-70 ${focusRing}`}><Download aria-hidden="true" size={15} />{installing ? "Abriendo el navegador…" : guidance.action}</button>}
        </div>
        <button type="button" data-orb-morph-close onClick={() => { void minimize(true); }} aria-label="Minimizar aviso de instalación" className={`install-banner-close sticky top-0 z-20 flex min-h-11 min-w-11 shrink-0 self-start items-center justify-center rounded-full border border-white/30 bg-[#f3ebdd] text-[#3e2a19] shadow-md hover:bg-white ${focusRing}`}><X aria-hidden="true" size={20} /></button>
      </div>
      <div data-orb-morph-glyph className="orb-morph-glyph" aria-hidden="true"><DeviceIcon size={20} /><span>Aplicación</span></div>
    </aside>}
  </>;
}
