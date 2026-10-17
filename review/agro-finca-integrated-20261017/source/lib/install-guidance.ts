/** Guidance checked against official vendor documentation on 2026-10-07:
 * https://support.apple.com/es-lamr/guide/iphone/iphea86e5236/ios
 * https://support.apple.com/es-lamr/104996
 * https://support.apple.com/en-ca/guide/ipad/ipad8f1f7a29/ipados
 * https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DDesktop&hl=es
 * https://support.microsoft.com/es-es/edge/install-manage-or-uninstall-apps-in-microsoft-edge
 * Menu availability remains conditional; only the browser event enables native prompting.
 */
export const INSTALL_OFFER_DELAY_MS = 800;
export const INSTALL_EXPANDED_MS = 5_000;
export const INSTALL_MORPH_MS = 600;
export const INSTALL_OFFER_WINDOW_MS = 60_000;
export const INSTALL_QUIET_PERIOD_MS = 7 * 24 * 60 * 60 * 1_000;
// Preserve the existing session choice; never migrate it by removing or resetting it.
export const INSTALL_DISMISS_KEY = "morochos-install-dismissed";
export const INSTALL_SESSION_SHOWN_KEY = "venezuela-agro-install-shown:v1";
export const INSTALL_LAST_SHOWN_KEY = "venezuela-agro-install-last-shown:v1";

export type InstallEnvironment = {
  device: "phone" | "tablet" | "computer";
  os: "ios" | "android" | "mac" | "windows" | "other";
  browser: "safari" | "chrome" | "edge" | "other";
};

/** User-agent hints select instructions, never establish install capability. */
export function detectInstallEnvironment(hints: { userAgent?: string; platform?: string; maxTouchPoints?: number; mobile?: boolean }): InstallEnvironment {
  const ua = hints.userAgent ?? "";
  const ipad = /iPad/i.test(ua) || (hints.platform === "MacIntel" && (hints.maxTouchPoints ?? 0) > 1);
  const ios = ipad || /iPhone|iPod/i.test(ua);
  const android = /Android/i.test(ua);
  const device = ipad || (android && !/Mobile/i.test(ua)) ? "tablet" : ios || (android && /Mobile/i.test(ua)) || hints.mobile === true ? "phone" : "computer";
  const os = ios ? "ios" : android ? "android" : /Mac/i.test(hints.platform ?? ua) ? "mac" : /Win/i.test(hints.platform ?? ua) ? "windows" : "other";
  const browser = /Edg(?:e|A|iOS)?\//i.test(ua) ? "edge" : /Chrome|Chromium|CriOS/i.test(ua) ? "chrome" : /Safari/i.test(ua) && !/FxiOS|Firefox|OPiOS|OPR|SamsungBrowser|DuckDuckGo/i.test(ua) ? "safari" : "other";
  return { device, os, browser };
}

export function isInstalledDisplayMode(state: { navigatorStandalone?: boolean; standalone?: boolean; minimalUi?: boolean; windowControlsOverlay?: boolean; appInstalled?: boolean }): boolean {
  return Boolean(state.navigatorStandalone || state.standalone || state.minimalUi || state.windowControlsOverlay || state.appInstalled);
}

export type InstallPromptEvent = Event & {
  prompt: () => Promise<unknown>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function isInstallPromptEvent(event: Event): event is InstallPromptEvent {
  const candidate = event as Partial<InstallPromptEvent>;
  return typeof candidate.prompt === "function" && typeof candidate.userChoice?.then === "function";
}

type OfferStorage = Pick<Storage, "getItem" | "setItem"> | null;
function read(storage: OfferStorage, key: string) { try { return storage?.getItem(key) ?? null; } catch { return null; } }
function write(storage: OfferStorage, key: string, value: string) { try { storage?.setItem(key, value); } catch { /* In-memory lifecycle still bounds this visit. */ } }

export function isInstallOfferSuppressed(session: OfferStorage, persistent: OfferStorage, now: number, installed = false): boolean {
  if (installed || !Number.isFinite(now) || now <= 0) return true;
  if (read(session, INSTALL_DISMISS_KEY) === "true" || read(session, INSTALL_SESSION_SHOWN_KEY) === "true") return true;
  // A previous visit must not suppress the approved introduction for seven days.
  // Keep historical timestamps intact; only this session and installed state decide.
  void persistent;
  return false;
}

export function claimInstallOffer(session: OfferStorage, persistent: OfferStorage, now: number): boolean {
  if (isInstallOfferSuppressed(session, persistent, now)) return false;
  write(session, INSTALL_SESSION_SHOWN_KEY, "true");
  write(persistent, INSTALL_LAST_SHOWN_KEY, String(now));
  return true;
}

export function dismissInstallOffer(session: OfferStorage, persistent: OfferStorage, now: number): void {
  write(session, INSTALL_DISMISS_KEY, "true");
  write(persistent, INSTALL_LAST_SHOWN_KEY, String(now));
}

export function getInstallGuidance(environment: InstallEnvironment, nativePromptAvailable: boolean) {
  const { device, os, browser } = environment;
  const title = device === "computer" ? "Un acceso directo en tu computadora" : device === "tablet" ? "Venezuela Agro a mano en tu tableta" : "Venezuela Agro a mano en tu teléfono";
  let steps: string[];
  if (os === "ios") {
    steps = [
      browser === "safari" ? "En Safari, abre el menú de página junto a la dirección y elige Compartir; en otras barras puedes tocar Compartir directamente." : "Abre esta misma dirección en Safari. En el menú de página, elige Compartir; según la barra, Compartir puede aparecer directamente.",
      "Busca «Añadir a pantalla de inicio»; en iPad puede estar dentro de «Más». Si aparece «Abrir como app», puedes activarlo.",
      "Revisa el nombre y confirma «Añadir» en tu dispositivo.",
    ];
  } else if (device === "computer" && os === "mac" && browser === "safari") {
    steps = ["En Safari, abre Archivo → Añadir al Dock, si esa opción aparece en tu versión de macOS.", "Revisa el nombre y confirma «Añadir».", "Si no aparece, guarda esta página en Favoritos para volver a ella desde Safari."];
  } else if (device === "computer" && browser === "edge") {
    steps = ["En Edge, abre ⋯ → Más herramientas → Aplicaciones, según tu versión.", "Si está disponible, elige la opción para instalar este sitio como una aplicación y confirma en Edge.", "Si no aparece, guarda esta página en Favoritos o usa las opciones de acceso directo del navegador o del sistema."];
  } else if (device === "computer" && browser === "chrome") {
    steps = ["En Chrome, abre ⋮ → Enviar, guardar y compartir → Instalar página como aplicación, si está disponible; también puede aparecer un icono de instalación junto a la dirección.", "Si aparece una opción para instalar la página o crear un acceso directo, selecciónala y revisa el diálogo.", "Si no aparece, guarda esta página en los marcadores. Para una aplicación ya instalada, puedes crear un acceso desde chrome://apps."];
  } else if (device !== "computer") {
    steps = ["Abre el menú de tu navegador.", "Si aparece «Instalar aplicación» o «Añadir a pantalla de inicio», elige la opción y confirma en tu dispositivo.", "Si tu navegador no ofrece esa opción, guarda esta página en sus marcadores para encontrarla fácilmente."];
  } else {
    steps = ["Revisa el menú de tu navegador: puede ofrecer instalar este sitio o crear un acceso directo.", "Si no ofrece esas opciones, guarda esta página en los marcadores o Favoritos.", "También puedes usar las opciones de acceso directo que ofrezca tu navegador o sistema, si están disponibles."];
  }
  return {
    title,
    action: nativePromptAvailable ? device === "computer" ? "Instalar en esta computadora" : "Instalar en este dispositivo" : device === "computer" ? "Cómo crear el acceso directo" : "Cómo añadir a inicio",
    nativePromptAvailable,
    steps,
  };
}

/** The fallback does not depend on beforeinstallprompt. Temporary dialogs can delay it. */
export function scheduleInstallOffer(options: {
  now: () => number; isBlocked: () => boolean; isSuppressed: () => boolean; offer: () => void; skip?: () => void;
  setTimer: (callback: () => void, delay: number) => number; clearTimer: (id: number) => void;
}) {
  let stopped = false;
  let timer: number | undefined;
  const attempt = () => {
    if (stopped) return;
    if (options.isSuppressed()) { stopped = true; options.skip?.(); return; }
    if (options.isBlocked()) { timer = options.setTimer(attempt, 2_000); return; }
    stopped = true;
    options.offer();
  };
  timer = options.setTimer(attempt, INSTALL_OFFER_DELAY_MS);
  return () => { stopped = true; if (timer !== undefined) options.clearTimer(timer); };
}

/** Count only quiet, visible time; pointer/focus/help interruptions preserve the remainder. */
export function createInstallCountdown(options: {
  now: () => number; finish: () => void;
  setTimer: (callback: () => void, delay: number) => number; clearTimer: (id: number) => void;
}) {
  let remaining = INSTALL_EXPANDED_MS, startedAt = 0;
  let timer: number | undefined;
  let cancelled = false;
  return {
    resume() {
      if (cancelled || timer !== undefined) return;
      startedAt = options.now();
      timer = options.setTimer(() => { timer = undefined; remaining = 0; cancelled = true; options.finish(); }, remaining);
    },
    pause() {
      if (timer === undefined) return;
      options.clearTimer(timer); timer = undefined;
      remaining = Math.max(0, remaining - Math.max(0, options.now() - startedAt));
    },
    cancel() { cancelled = true; if (timer !== undefined) options.clearTimer(timer); timer = undefined; },
    remaining() { return timer === undefined ? remaining : Math.max(0, remaining - Math.max(0, options.now() - startedAt)); },
  };
}
