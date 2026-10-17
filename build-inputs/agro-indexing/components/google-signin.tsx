"use client";

import { useEffect, useRef, useState } from "react";
import { safeRelativeReturnPath } from "@/lib/auth-paths";

type Turnstile = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: Turnstile } }
// Refresh well before the provider's five-minute, single-use token deadline.
const TOKEN_REFRESH_MS = 4 * 60 * 1000;
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function GoogleSignIn({ siteKey, returnTo }: { siteKey: string; returnTo: string }) {
  const container = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const tokenCreatedAt = useRef(0);
  const [csrfToken, setCsrfToken] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let widget: string | undefined;
    let tokenTimeout: number | undefined;
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
    function fail(message: string) {
      if (controller.signal.aborted) return;
      tokenCreatedAt.current = 0;
      window.clearTimeout(tokenTimeout);
      setTurnstileToken(""); setError(message);
    }
    function render() {
      if (controller.signal.aborted || widget !== undefined || !container.current || !window.turnstile) return;
      try {
        widget = window.turnstile.render(container.current, {
          sitekey: siteKey, action: "login", theme: "light", size: "flexible", "response-field": false,
          callback: (token: string) => {
            if (controller.signal.aborted || submittingRef.current) return;
            tokenCreatedAt.current = Date.now();
            window.clearTimeout(tokenTimeout);
            setTurnstileToken(token); setError("");
            tokenTimeout = window.setTimeout(() => fail("La verificación venció. Vuelve a intentarlo."), TOKEN_REFRESH_MS);
          },
          "expired-callback": () => fail("La verificación venció. Vuelve a intentarlo."),
          "error-callback": () => fail("No pudimos completar la verificación. Comprueba tu conexión y vuelve a intentarlo."),
          "timeout-callback": () => fail("La verificación tardó demasiado. Vuelve a intentarlo."),
        });
      } catch { fail("No pudimos iniciar la verificación. Vuelve a intentarlo."); }
    }
    const scriptError = () => fail("No pudimos cargar la verificación. Comprueba tu conexión y vuelve a intentarlo.");
    // Obtain a fresh signed, same-origin CSRF cookie before enabling submission.
    fetch("/api/auth/csrf", { credentials: "same-origin", cache: "no-store", signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error("csrf"); return response.json() as Promise<{ token?: unknown }>; })
      .then(value => {
        if (typeof value?.token !== "string" || !value.token) throw new Error("csrf");
        if (!controller.signal.aborted) setCsrfToken(value.token);
      }).catch(() => { if (!controller.signal.aborted) { setCsrfToken(""); setError("No pudimos preparar el acceso seguro. Vuelve a intentarlo."); } });
    if (!script) {
      script = document.createElement("script"); script.src = SCRIPT_URL; script.async = true; script.defer = true;
      script.addEventListener("load", render); script.addEventListener("error", scriptError);
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", render); script.addEventListener("error", scriptError);
      render();
    }
    // A failed or blocked script must not leave the page waiting forever.
    const timeout = window.setTimeout(() => { if (widget === undefined) scriptError(); }, 15000);
    return () => {
      controller.abort(); window.clearTimeout(timeout); window.clearTimeout(tokenTimeout);
      tokenCreatedAt.current = 0;
      script?.removeEventListener("load", render); script?.removeEventListener("error", scriptError);
      if (widget !== undefined) window.turnstile?.remove(widget);
      if (!window.turnstile) script?.remove();
    };
  }, [siteKey, attempt]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) { submittingRef.current = false; setSubmitting(false); setCsrfToken(""); setTurnstileToken(""); setAttempt(value => value + 1); }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return <form method="post" action="/api/auth/google/start" className="space-y-5" onSubmit={event => {
    if (!csrfToken || !turnstileToken || submittingRef.current || !navigator.onLine) {
      event.preventDefault();
      if (!navigator.onLine) setError("Conéctate a internet para entrar con Google.");
      return;
    }
    // Also check the clock at submit: background tabs can delay expiry timers.
    const tokenAge = Date.now() - tokenCreatedAt.current;
    if (!tokenCreatedAt.current || tokenAge < 0 || tokenAge >= TOKEN_REFRESH_MS) {
      event.preventDefault(); tokenCreatedAt.current = 0; setTurnstileToken("");
      setError("La verificación venció. Vuelve a intentarlo.");
      return;
    }
    submittingRef.current = true; setSubmitting(true);
  }}>
    <input type="hidden" name="csrfToken" value={csrfToken} />
    <input type="hidden" name="turnstileToken" value={turnstileToken} />
    <input type="hidden" name="returnTo" value={safeRelativeReturnPath(returnTo)} />
    <div ref={container} aria-label="Verificación de seguridad" className="min-h-16" />
    {error && <div className="space-y-2"><p role="alert" className="text-sm text-red-800">{error}</p><button type="button" disabled={submitting} className="min-h-11 underline" onClick={() => { setError(""); setCsrfToken(""); setTurnstileToken(""); setAttempt(value => value + 1); }}>Volver a intentar</button></div>}
    <button type="submit" disabled={!csrfToken || !turnstileToken || submitting} className="min-h-12 w-full rounded-xl bg-[#211d1a] px-5 py-3 font-semibold text-white disabled:opacity-50">{submitting ? "Abriendo Google…" : "Continuar con Google"}</button>
    <noscript><p>Activa JavaScript para completar la verificación de seguridad e iniciar sesión.</p></noscript>
  </form>;
}
