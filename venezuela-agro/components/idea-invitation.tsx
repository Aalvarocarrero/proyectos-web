"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { ArrowRight, Check, Lightbulb, Loader2, Send, Sprout, X } from "lucide-react";
import { SiteImage } from "@/components/site-image";
import { createLocalId, getOperationStatus, queueMutation, subscribeOfflineChanges, syncNow } from "@/lib/offline-db";
import {
  claimIdeaVisit, IDEA_CONTACT_MAX, IDEA_INVITATION_COPY, IDEA_INVITATION_DELAY_MS,
  IDEA_MESSAGE_MAX, ideaReceiptText, markIdeaVisit, validateIdeaFields,
  type IdeaFieldErrors, type IdeaOperationStatus,
} from "@/lib/idea-invitation";
import {createInstallCountdown} from "@/lib/install-guidance";
import {scheduleIdeaInvitation} from "@/lib/idea-invitation-scheduler";
import { ideaInvitationPhoto as photo } from "@/lib/idea-invitation-photo";
import { IDEA_ORB_MORPH_MS, startOrbMorph, type OrbMorph } from "@/lib/orb-morph";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4c6b3a]";
const primaryButton = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#4c6b3a] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#365026] disabled:cursor-wait disabled:opacity-65 motion-reduce:transition-none ${focusRing}`;
const quietButton = `inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-[#5b4530] underline decoration-[#5b4530]/30 underline-offset-4 hover:bg-[#3e2a19]/5 ${focusRing}`;

/** Replaces the old feedback trigger. Automatic invitation is homepage-only. */
export function IdeaInvitation() {
  const pathname = usePathname();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [introComplete,setIntroComplete]=useState(false);
  const [showOrb,setShowOrb]=useState(false);
  const [viewport,setViewport]=useState<{height:number;top:number}|null>(null);
  const [stage, setStage] = useState<"invitation" | "form" | "receipt">("invitation");
  // Keep these above the portal: Close, Escape and backdrop dismissal never erase text.
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<IdeaFieldErrors>({});
  const [saveError, setSaveError] = useState("");
  const [working, setWorking] = useState(false);
  const [operationId, setOperationId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<IdeaOperationStatus>({ state: "pending" });
  const inFlight = useRef(false);
  const autoOffered = useRef(false);
  const autoDismissAllowed=useRef(false),invitationTouched=useRef(false);
  const passiveCountdown=useRef<ReturnType<typeof createInstallCountdown>|null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const morphRef = useRef<OrbMorph | null>(null);
  const closingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; morphRef.current?.cancel(); morphRef.current = null; closingRef.current = false; };
  }, []);

  const sampleViewport = useCallback(() => {
    // A keyboard resize must not overwrite the fixed box owned by the running FLIP.
    if (!mountedRef.current || closingRef.current) return;
    const visual = window.visualViewport;
    if (!visual) return;
    const next = { height: visual.height, top: visual.offsetTop };
    setViewport(previous => closingRef.current || (previous?.height === next.height && previous.top === next.top) ? previous : next);
  }, []);

  const closeToOrb = useCallback(async () => {
    if (closingRef.current) return;
    closingRef.current = true;
    passiveCountdown.current?.cancel();
    const source = dialogRef.current, target = triggerRef.current;
    let animation: OrbMorph | null = null;
    if (source && target) {
      animation = startOrbMorph({ source, target, backdrop: overlayRef.current, duration: IDEA_ORB_MORPH_MS, reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches });
      morphRef.current = animation;
      const outcome = await animation.finished;
      if (outcome === "cancelled" || outcome === "reversed") {
        animation.release();
        if (morphRef.current === animation) morphRef.current = null;
        closingRef.current = false;
        // Restore responsive geometry only after the animation has released its inline styles.
        sampleViewport();
        return;
      }
    }
    if (!mountedRef.current) return;
    animation?.retire();
    flushSync(() => {
      setShowOrb(true);
      setOpen(() => false);
    });
    requestAnimationFrame(() => {
      animation?.release();
      if (morphRef.current === animation) morphRef.current = null;
      closingRef.current = false;
    });
  }, [sampleViewport]);

  useEffect(()=>{
    const complete=()=>setIntroComplete(true);
    if(document.body.dataset.installIntro==="complete")complete();
    window.addEventListener("venezuela-agro:install-intro-complete",complete);
    return ()=>window.removeEventListener("venezuela-agro:install-intro-complete",complete);
  },[]);

  useEffect(() => {
    if(!introComplete)return;
    if (pathname !== "/" || open || autoOffered.current) return;
    return scheduleIdeaInvitation({
      delayMs:IDEA_INVITATION_DELAY_MS,
      setTimer:(callback,delay)=>window.setTimeout(callback,delay),clearTimer:id=>window.clearTimeout(id),
      isBlocked:()=>{
        if(document.hidden||window.location.pathname!=="/")return true;
        const active=document.activeElement;
        if(active instanceof HTMLElement&&active.closest("input, textarea, select, [contenteditable='true']"))return true;
        // A passive install banner must not suppress the invitation on iPhone.
        return !!document.querySelector("[role='dialog'][data-state='open'], [role='alertdialog']")||document.body.dataset.installInteraction==="active";
      },
      claim:()=>{let eligible=false;try{eligible=claimIdeaVisit(window.sessionStorage);}catch{}if(!eligible)setShowOrb(true);return eligible;},
      open:()=>{autoDismissAllowed.current=true;invitationTouched.current=false;autoOffered.current=true;returnFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setOpen(true);},
    });
  }, [pathname, open,introComplete]);

  useEffect(()=>{
    if(!open||stage!=="invitation"||!autoDismissAllowed.current||invitationTouched.current)return;
    const countdown=createInstallCountdown({now:Date.now,finish:()=>{if(!invitationTouched.current)void closeToOrb();},setTimer:(callback,delay)=>window.setTimeout(callback,delay),clearTimer:id=>window.clearTimeout(id)});
    passiveCountdown.current=countdown;
    const visibility=()=>{if(document.hidden)countdown.pause();else if(!invitationTouched.current)countdown.resume();};visibility();
    document.addEventListener("visibilitychange",visibility);
    return ()=>{countdown.cancel();passiveCountdown.current=null;document.removeEventListener("visibilitychange",visibility);};
  },[open,stage,closeToOrb]);
  function stopPassiveCountdown(event?: { target: EventTarget | null; key?: string }) {
    invitationTouched.current=true;passiveCountdown.current?.cancel();
    const target = event?.target instanceof Element ? event.target : null;
    if (closingRef.current && event?.key !== "Escape" && !target?.closest("[data-orb-morph-close]")) morphRef.current?.reverse();
  }

  useEffect(()=>{
    if(!open)return;
    const visual=window.visualViewport;
    if(!visual)return;
    const update=()=>sampleViewport();
    update();visual.addEventListener("resize",update);visual.addEventListener("scroll",update);
    return ()=>{visual.removeEventListener("resize",update);visual.removeEventListener("scroll",update);};
  },[open,sampleViewport]);

  useEffect(() => {
    if (!operationId) return;
    let current = true;
    const refresh = async () => {
      const next = await getOperationStatus(operationId).catch(() => ({ state: "unknown" as const }));
      if (current) setReceipt(next);
    };
    const unsubscribe = subscribeOfflineChanges(() => { void refresh(); });
    void refresh();
    return () => { current = false; unsubscribe(); };
  }, [operationId]);

  function changeOpen(next: boolean) {
    if(!next)setShowOrb(true);
    if (!next) { void closeToOrb(); return; }
    if (closingRef.current) { morphRef.current?.reverse(); return; }
    if (next) {
      autoDismissAllowed.current=false;invitationTouched.current=true;
      autoOffered.current = true;
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      try { markIdeaVisit(window.sessionStorage); } catch { /* Private browsers retain manual access. */ }
    }
    setOpen(next);
  }


  function showForm() {
    setStage("form");
    requestAnimationFrame(() => messageRef.current?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || operationId) return;
    const validated = validateIdeaFields(message, contact);
    if (!validated.ok) {
      setErrors(validated.errors);
      if (validated.errors.message) messageRef.current?.focus();
      else contactRef.current?.focus();
      return;
    }
    inFlight.current = true;
    setWorking(true);
    setSaveError("");
    setErrors({});
    let queuedId: string | null = null;
    try {
      const operation = await queueMutation({
        entityType: "feedback", entityId: createLocalId("feedback"), action: "upsert", payload: validated.payload,
      });
      queuedId = operation.id;
      setOperationId(operation.id);
      setReceipt({ state: "pending" });
      setStage("receipt");
      // A batch can succeed without this idea, or fail while this idea was accepted.
      // Only the operation-specific, persisted acknowledgement controls the receipt.
      await syncNow().catch(() => undefined);
      setReceipt(await getOperationStatus(operation.id).catch(() => ({ state: "unknown" as const })));
    } catch {
      if (queuedId) setReceipt({ state: "unknown" });
      else setSaveError("No pudimos guardar tu idea. El texto sigue en el formulario; revisa el espacio disponible y vuelve a intentarlo.");
    } finally {
      inFlight.current = false;
      setWorking(false);
    }
  }

  async function retry() {
    if (inFlight.current || !operationId) return;
    inFlight.current = true;
    setWorking(true);
    try {
      await syncNow().catch(() => undefined);
      setReceipt(await getOperationStatus(operationId).catch(() => ({ state: "unknown" as const })));
    } finally {
      inFlight.current = false;
      setWorking(false);
    }
  }

  function newIdea() {
    if (inFlight.current) return;
    // Clearing is explicit; closing the dialog never calls this function.
    setMessage(""); setContact(""); setErrors({}); setSaveError("");
    setOperationId(null); setReceipt({ state: "pending" }); showForm();
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger asChild>
        <button ref={triggerRef} type="button" aria-label="Compartir mi idea" title="Compartir mi idea" className={`idea-orb glass-action-orb ${!open&&(showOrb||pathname!=="/")?"idea-orb-visible":"idea-orb-waiting"} ${focusRing}`}>
          <Lightbulb aria-hidden="true" size={21} /><span>Tu idea</span>
        </button>
      </Dialog.Trigger>
      <a href="/proyectos#presentar-proyecto" className={`project-orb glass-action-orb ${focusRing}`} aria-label="Cuéntanos tu proyecto: abrir formulario" title="Cuéntanos tu proyecto"><Sprout aria-hidden="true" size={21}/><span>Tu proyecto</span></a>
      <Dialog.Portal>
        {/* Keep modal focus/outside-click protection without pulsing the brightness of the entire page. */}
        <Dialog.Overlay ref={overlayRef} data-slot="dialog-overlay" className="fixed inset-0 z-[110] bg-transparent" />
        <Dialog.Content
          ref={dialogRef}
          data-slot="dialog-content"
          onPointerDownCapture={stopPassiveCountdown}
          onKeyDownCapture={stopPassiveCountdown}
          onFocusCapture={()=>{if(document.activeElement!==closeRef.current)stopPassiveCountdown();}}
          style={viewport?{top:viewport.top+viewport.height/2,maxHeight:Math.max(80,viewport.height-24)}:undefined}
          className="idea-invitation-dialog fixed left-1/2 top-1/2 z-[111] flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-[820px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.5rem] border border-[#ded1bd] bg-[#f7f1e7] text-[#3e2a19] shadow-2xl outline-none"
          onOpenAutoFocus={(event) => { event.preventDefault(); closeRef.current?.focus(); }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const previous = returnFocus.current;
            if (previous?.isConnected && previous !== document.body && getComputedStyle(previous).visibility !== "hidden") previous.focus();
            else triggerRef.current?.focus();
          }}
        >
          <div data-orb-morph-content className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#3e2a19]/10 px-4 py-2 sm:px-6">
            <span className="text-[.65rem] font-bold tracking-[.16em] text-[#4c6b3a]">VENEZUELA AGRO · TU VOZ CUENTA</span>
            <Dialog.Close asChild>
              <button ref={closeRef} type="button" data-orb-morph-close className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-[#3e2a19]/25 bg-[#fffdf8] px-3 text-sm font-bold hover:bg-[#f3ebdd] ${focusRing}`} aria-label="Cerrar invitación; se conserva lo escrito">
                <span>Cerrar</span><X aria-hidden="true" size={19} />
              </button>
            </Dialog.Close>
          </header>
          <div className="min-h-0 overflow-y-auto overscroll-contain">
            <div className="grid sm:grid-cols-[.82fr_1.18fr]">
              <figure className={`${stage === "invitation" ? "flex" : "hidden sm:flex"} min-w-0 flex-col border-b border-[#3e2a19]/10 bg-[#eae0ce] sm:border-b-0 sm:border-r`}>
                <div className="relative h-40 overflow-hidden sm:h-auto sm:min-h-64 sm:flex-1">
                  <SiteImage src={photo.src} width={photo.width} height={photo.height} sizes="(max-width: 639px) calc(100vw - 24px), 340px" alt="Hombre junto a frutas en un puesto de Yaracuy, Venezuela" className="h-full w-full object-cover object-[36%_35%] sm:absolute sm:inset-0" />
                </div>
                <figcaption className="px-4 py-3 text-[.65rem] leading-[1.6] text-[#5b4530]">
                  Fotografía de contexto · Yaracuy<br />
                  <a href={photo.source} target="_blank" rel="noreferrer" className={`underline underline-offset-2 ${focusRing}`}>{photo.author}</a>
                  {" · "}<a href={photo.licenseUrl} target="_blank" rel="noreferrer" className={`underline underline-offset-2 ${focusRing}`}>{photo.license}</a>
                  <span className="mt-1 block">Adaptada en tamaño y encuadre. No implica afiliación ni respaldo a la plataforma.</span>
                </figcaption>
              </figure>
              <section className="min-w-0 p-5 sm:p-7">
                {stage === "invitation" ? <>
                  <Dialog.Title className="font-display text-[1.8rem] leading-[1.08] tracking-tight sm:text-[2.4rem]">{IDEA_INVITATION_COPY.title}</Dialog.Title>
                  <Dialog.Description asChild>
                    <div className="mt-5 space-y-3 text-sm leading-6 text-[#655542] sm:text-[.95rem]">
                      <p className="font-bold text-[#4c6b3a]">{IDEA_INVITATION_COPY.emphasis}</p>
                      <p>{IDEA_INVITATION_COPY.invitation}</p>
                      <p>{IDEA_INVITATION_COPY.together}</p>
                    </div>
                  </Dialog.Description>
                  <div className="mt-6 flex flex-col gap-1">
                    <button type="button" onClick={showForm} className={primaryButton}>{IDEA_INVITATION_COPY.button}<ArrowRight aria-hidden="true" size={18} /></button>
                    <Dialog.Close asChild><button type="button" data-orb-morph-close className={quietButton}>Seguir explorando</button></Dialog.Close>
                  </div>
                </> : stage === "form" ? <>
                  <Dialog.Title className="font-display text-3xl leading-tight">Tu idea para mejorar Venezuela Agro.</Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm leading-6 text-[#655542]">¿Qué cambiarías o añadirías a la plataforma para trabajar mejor? Si buscas apoyo para una iniciativa productiva, visita Proyectos y alianzas.</Dialog.Description>
                  <form onSubmit={(event) => { void submit(event); }} noValidate className="mt-5 space-y-4">
                    <div>
                      <label htmlFor={`${id}-message`} className="text-sm font-bold">Mejora o herramienta que propones</label>
                      <textarea ref={messageRef} id={`${id}-message`} name="message" disabled={working} required minLength={10} maxLength={IDEA_MESSAGE_MAX} value={message} onChange={(event) => setMessage(event.target.value)} aria-invalid={Boolean(errors.message)} aria-describedby={`${id}-message-hint${errors.message ? ` ${id}-message-error` : ""}`} className="mt-2 min-h-32 w-full resize-y rounded-xl border border-[#bfae93] bg-[#fffdf8] p-3 text-base leading-6" placeholder="Me ayudaría poder…" />
                      <p id={`${id}-message-hint`} className="mt-1 text-xs text-[#655542]">Mínimo 10 caracteres · {message.length.toLocaleString("es-VE")}/1.500</p>
                      {errors.message && <p id={`${id}-message-error`} role="alert" className="mt-2 text-sm text-[#943d26]">{errors.message}</p>}
                    </div>
                    <div>
                      <label htmlFor={`${id}-contact`} className="text-sm font-bold">Contacto <span className="font-normal">(opcional)</span></label>
                      <input ref={contactRef} id={`${id}-contact`} name="contact" type="text" disabled={working} maxLength={IDEA_CONTACT_MAX} value={contact} onChange={(event) => setContact(event.target.value)} aria-invalid={Boolean(errors.contact)} aria-describedby={`${id}-contact-hint${errors.contact ? ` ${id}-contact-error` : ""}`} className="mt-2 min-h-12 w-full rounded-xl border border-[#bfae93] bg-[#fffdf8] px-3 text-base" placeholder="Correo o teléfono" />
                      <p id={`${id}-contact-hint`} className="mt-1 text-xs leading-5 text-[#655542]">Solo si quieres que podamos contactarte. No te suscribe a boletines.</p>
                      {errors.contact && <p id={`${id}-contact-error`} role="alert" className="mt-2 text-sm text-[#943d26]">{errors.contact}</p>}
                    </div>
                    <p className="text-xs leading-5 text-[#655542]">Al enviar, compartes la idea y el contacto que incluyas con el equipo de Venezuela Agro. No se publican automáticamente. <a href="/legal/privacidad" target="_blank" rel="noreferrer" className={`underline underline-offset-2 ${focusRing}`}>Privacidad</a>.</p>
                    {saveError && <p role="alert" className="rounded-xl border border-[#943d26]/20 bg-[#943d26]/5 p-3 text-sm leading-6 text-[#943d26]">{saveError}</p>}
                    <button type="submit" disabled={working} className={`${primaryButton} w-full`}>{working ? <Loader2 aria-hidden="true" size={17} className="animate-spin motion-reduce:animate-none" /> : <Send aria-hidden="true" size={17} />}{working ? "Guardando…" : "Enviar mi idea"}</button>
                    <p className="text-center text-[.7rem] leading-5 text-[#655542]">Cerrar conserva lo escrito mientras esta página siga abierta.</p>
                  </form>
                </> : <>
                  <Dialog.Title className="font-display text-3xl leading-tight">{receipt.state === "confirmed" ? "Gracias por tu aporte." : "Tu idea sigue aquí."}</Dialog.Title>
                  <Dialog.Description className="sr-only">Estado del envío de tu idea a Venezuela Agro.</Dialog.Description>
                  <div role="status" aria-live="polite" aria-atomic="true" className={`mt-5 rounded-xl border p-4 text-sm leading-6 ${receipt.state === "confirmed" ? "border-[#4c6b3a]/20 bg-[#e8efdf]" : "border-[#bfae93] bg-[#eee5d5]"}`}>
                    {receipt.state === "confirmed" && <Check aria-hidden="true" size={21} className="mb-2 text-[#4c6b3a]" />}
                    {ideaReceiptText(receipt)}
                  </div>
                  <details className="mt-4 rounded-xl border border-[#3e2a19]/15 p-3 text-sm">
                    <summary className={`cursor-pointer font-semibold ${focusRing}`}>Ver mi idea</summary>
                    <p className="mt-3 max-h-44 overflow-y-auto whitespace-pre-wrap break-words leading-6">{message}</p>
                    {contact && <p className="mt-3 break-words text-xs leading-5 text-[#655542]">Contacto: {contact}</p>}
                  </details>
                  <div className="mt-5 flex flex-col gap-2">
                    {receipt.state !== "confirmed" && <button type="button" disabled={working} onClick={() => { void retry(); }} className={primaryButton}>{working && <Loader2 aria-hidden="true" size={17} className="animate-spin motion-reduce:animate-none" />}{working ? "Comprobando…" : "Comprobar envío"}</button>}
                    <Dialog.Close asChild><button type="button" data-orb-morph-close className={receipt.state === "confirmed" ? primaryButton : quietButton}>Cerrar</button></Dialog.Close>
                    {receipt.state === "confirmed" && <button type="button" onClick={newIdea} disabled={working} className={quietButton}>Escribir otra idea</button>}
                  </div>
                </>}
              </section>
            </div>
          </div>
          </div>
          <div data-orb-morph-glyph className="orb-morph-glyph" aria-hidden="true"><Lightbulb size={21} /><span>Tu idea</span></div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
