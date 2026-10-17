"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AGRO_ANALYTICS_CONSENT_KEY,
  AGRO_ANALYTICS_ENABLED,
  AGRO_ANALYTICS_ID,
  agroAnalyticsPage,
  createAgroAnalyticsController,
  isAgroAnalyticsHost,
  type AgroAnalyticsChoice,
  type AgroAnalyticsTransportFactory,
} from "@/lib/agro-analytics-policy";

/** In-flow footer panel. No timer, modal, floating overlay, focus grab, or Google loader. */
export function AgroAnalyticsConsent({
  enabled = AGRO_ANALYTICS_ENABLED,
  createTransport,
}: {
  enabled?: boolean;
  createTransport?: AgroAnalyticsTransportFactory;
}) {
  const pathname = usePathname();
  const titleId = useId();
  const [choice, setChoice] = useState<AgroAnalyticsChoice | null>(null);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const controller = useRef<ReturnType<typeof createAgroAnalyticsController> | null>(null);

  useEffect(() => {
    if (!enabled || !createTransport || !isAgroAnalyticsHost(window.location)) return;
    const instance = createAgroAnalyticsController({
      location: () => window.location,
      storage: () => window.localStorage,
      cookies: () => document.cookie,
      writeCookie: value => { document.cookie = value; },
      setGoogleDisabled: disabled => {
        (window as unknown as Record<string, unknown>)[`ga-disable-${AGRO_ANALYTICS_ID}`] = disabled;
      },
    }, { enabled, createTransport });
    controller.current = instance;
    let mounted = true;
    const refresh = () => {
      if (!mounted) return;
      instance.sync();
      setChoice(instance.choice());
      // Keep revocation reachable on private pages without initializing a transport there.
      setVisible(!!agroAnalyticsPage(window.location) || instance.choice() === "granted");
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === AGRO_ANALYTICS_CONSENT_KEY || event.key === null) refresh();
    };
    const onPageHide = () => instance.suspend();
    // Initialize outside the effect's synchronous body; no UI or tracking before these guards.
    queueMicrotask(refresh);
    window.addEventListener("storage", onStorage);
    window.addEventListener("popstate", refresh);
    window.addEventListener("hashchange", refresh);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", refresh);
    return () => {
      mounted = false;
      instance.dispose();
      controller.current = null;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("popstate", refresh);
      window.removeEventListener("hashchange", refresh);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", refresh);
    };
  }, [enabled, createTransport]);

  useEffect(() => {
    const instance = controller.current;
    if (!instance) return;
    instance.sync();
    queueMicrotask(() => setVisible(!!agroAnalyticsPage(window.location) || instance.choice() === "granted"));
  }, [pathname]);

  function choose(next: AgroAnalyticsChoice) {
    const instance = controller.current;
    if (!instance) return;
    const result = instance.choose(next);
    setChoice(result.saved ? next : next === "denied" ? "denied" : null);
    setMessage(result.saved
      ? next === "granted" ? "Preferencia guardada en este navegador." : "Estadísticas desactivadas. Tus datos de finca se conservan."
      : "Las estadísticas están desactivadas en esta página. El navegador no permitió guardar tu elección; revísala al volver.");
  }

  if (!enabled || !createTransport || !visible) return null;
  const button = "min-h-11 rounded-full border border-[#4c6b3a]/35 px-5 py-2 text-sm font-semibold text-[#365026] hover:bg-[#4c6b3a]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4c6b3a]";
  return (
    <section aria-labelledby={titleId} className="mx-auto my-6 w-full max-w-5xl rounded-2xl border border-[#4c6b3a]/20 bg-[#faf8f1] p-5 text-[#30291f]">
      <h2 id={titleId} className="text-base font-semibold">Estadísticas opcionales</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed">
        Con tu permiso, Google Analytics puede medir visitas a las secciones públicas, sesiones e interacción básica usando cookies de este navegador.
        Google también recibe información técnica del navegador y la IP de la conexión.
        No incluimos información de tu finca, formularios, búsquedas ni datos de contacto. Puedes rechazar o retirar tu permiso aquí.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {choice === "granted" ? (
          <button type="button" className={button} onClick={() => choose("denied")}>Retirar permiso</button>
        ) : (
          <>
            <button type="button" className={button} onClick={() => choose("granted")}>Permitir estadísticas</button>
            <button type="button" className={button} onClick={() => choose("denied")}>Rechazar estadísticas</button>
          </>
        )}
        <a href="/legal/privacidad" className={`${button} inline-flex items-center underline underline-offset-4`}>Privacidad</a>
      </div>
      <p role="status" className="mt-3 text-sm" aria-live="polite">
        {message || (choice === "denied" ? "Estadísticas desactivadas en este navegador." : choice === "granted" ? "Puedes retirar tu permiso cuando quieras." : "No se activa la medición hasta que la permitas.")}
      </p>
    </section>
  );
}
