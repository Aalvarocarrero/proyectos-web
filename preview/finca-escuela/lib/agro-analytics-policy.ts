/** Staged only. Activation also requires an independently reviewed transport. */
export const AGRO_ANALYTICS_ENABLED: boolean = false;
export const AGRO_ANALYTICS_ID = "G-LGQE3RP9DJ";
export const AGRO_ANALYTICS_HOST = "venezuelaagro.com";
export const AGRO_ANALYTICS_ORIGIN = `https://${AGRO_ANALYTICS_HOST}`;
export const AGRO_ANALYTICS_CONSENT_KEY = "venezuela-agro:analytics-consent";
export const AGRO_ANALYTICS_CONSENT_VERSION = 1;
export const AGRO_ANALYTICS_COOKIE_PREFIX = "vagro_ga4";
export const AGRO_ANALYTICS_COOKIE_NAMES = Object.freeze([
  `${AGRO_ANALYTICS_COOKIE_PREFIX}_ga`,
  `${AGRO_ANALYTICS_COOKIE_PREFIX}_ga_LGQE3RP9DJ`,
]);

/** Exact roots only: never expand this into a startsWith/prefix match. */
export const AGRO_ANALYTICS_PUBLIC_SECTIONS: Readonly<Record<string, string>> = Object.freeze({
  "/": "Venezuela Agro",
  "/plataforma": "Plataforma | Venezuela Agro",
  "/tienda": "Tienda | Venezuela Agro",
  "/marketplace": "Mercado | Venezuela Agro",
  "/rubros": "Rubros | Venezuela Agro",
  "/fincas": "Fincas | Venezuela Agro",
  "/profesionales": "Profesionales | Venezuela Agro",
  "/red": "Comunidad | Venezuela Agro",
  "/proyectos": "Proyectos | Venezuela Agro",
  "/aprende": "Aprende | Venezuela Agro",
  "/nosotros": "Nosotros | Venezuela Agro",
  "/guia-institucional": "Guía institucional | Venezuela Agro",
});

export type AgroAnalyticsChoice = "granted" | "denied";
export type AgroAnalyticsStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type AgroAnalyticsLocation = Pick<Location, "protocol" | "hostname" | "port" | "pathname" | "search" | "hash">;
export type AgroAnalyticsPage = Readonly<{
  page_location: string;
  page_path: string;
  page_title: string;
  page_referrer: "";
}>;

export const AGRO_ANALYTICS_DENIED_CONSENT = Object.freeze({
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  personalization_storage: "denied",
} as const);

export const AGRO_ANALYTICS_GRANTED_CONSENT = Object.freeze({
  ...AGRO_ANALYTICS_DENIED_CONSENT,
  analytics_storage: "granted",
} as const);

/** These documented options are necessary but do not suppress all GA4 automatic events. */
export const AGRO_ANALYTICS_CONFIG = Object.freeze({
  send_page_view: false,
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
  ignore_referrer: true,
  page_referrer: "",
  cookie_prefix: AGRO_ANALYTICS_COOKIE_PREFIX,
  cookie_domain: "none",
  cookie_path: "/",
  cookie_flags: "SameSite=Lax;Secure",
  cookie_expires: 60 * 60 * 24 * 30,
  cookie_update: false,
} as const);

export function isAgroAnalyticsHost(location: AgroAnalyticsLocation): boolean {
  return location.protocol === "https:" && location.hostname === AGRO_ANALYTICS_HOST && location.port === "";
}

export function agroAnalyticsPage(location: AgroAnalyticsLocation): AgroAnalyticsPage | null {
  // Even public searches/fragments are excluded, rather than passing their URL to a vendor library.
  if (!isAgroAnalyticsHost(location) || location.search || location.hash) return null;
  if (!Object.hasOwn(AGRO_ANALYTICS_PUBLIC_SECTIONS, location.pathname)) return null;
  return Object.freeze({
    page_location: AGRO_ANALYTICS_ORIGIN + location.pathname,
    page_path: location.pathname,
    page_title: AGRO_ANALYTICS_PUBLIC_SECTIONS[location.pathname],
    page_referrer: "",
  });
}

export function readAgroAnalyticsConsent(storage: AgroAnalyticsStorage | null): AgroAnalyticsChoice | null {
  try {
    const raw = storage?.getItem(AGRO_ANALYTICS_CONSENT_KEY);
    if (!raw) return null;
    const record: unknown = JSON.parse(raw);
    if (!record || typeof record !== "object" || Array.isArray(record)) return null;
    const value = record as Record<string, unknown>;
    if (Object.keys(value).length !== 2 || value.version !== AGRO_ANALYTICS_CONSENT_VERSION) return null;
    return value.choice === "granted" || value.choice === "denied" ? value.choice : null;
  } catch {
    return null;
  }
}

export function writeAgroAnalyticsConsent(storage: AgroAnalyticsStorage | null, choice: AgroAnalyticsChoice): boolean {
  if (choice !== "granted" && choice !== "denied") return false;
  try {
    if (!storage) return false;
    storage.setItem(AGRO_ANALYTICS_CONSENT_KEY, JSON.stringify({ version: AGRO_ANALYTICS_CONSENT_VERSION, choice }));
    return readAgroAnalyticsConsent(storage) === choice;
  } catch {
    return false;
  }
}

export interface AgroAnalyticsEnvironment {
  location(): AgroAnalyticsLocation;
  storage(): AgroAnalyticsStorage | null;
  cookies(): string;
  writeCookie(value: string): void;
  setGoogleDisabled(disabled: boolean): void;
}

/** Delete only our two configured GA cookies; never touch unrelated cookies, farm data or IndexedDB. */
export function clearAgroAnalyticsCookies(environment: AgroAnalyticsEnvironment): void {
  if (!isAgroAnalyticsHost(environment.location())) return;
  for (const name of AGRO_ANALYTICS_COOKIE_NAMES) {
    for (const domain of ["", `; Domain=${AGRO_ANALYTICS_HOST}`, `; Domain=.${AGRO_ANALYTICS_HOST}`]) {
      try {
        environment.writeCookie(`${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure${domain}`);
      } catch {
        // Cookie restrictions must not undo the synchronous tracking shutdown.
      }
    }
  }
}

/**
 * Integration boundary. An approved adapter must exclude private page/identity/form
 * data and must not replay app events after stop(). Its factory has no import-time effects.
 * Every app-triggered asynchronous send must call canSend() immediately before dispatch.
 * The optional Google adapter separately requires verified enhanced-measurement settings;
 * standard GA4 session/engagement events and browser/network metadata remain part of GA4.
 */
export interface AgroAnalyticsTransport {
  start(options: {
    measurementId: typeof AGRO_ANALYTICS_ID;
    defaultConsent: typeof AGRO_ANALYTICS_DENIED_CONSENT;
    consent: typeof AGRO_ANALYTICS_GRANTED_CONSENT;
    config: typeof AGRO_ANALYTICS_CONFIG;
    page: AgroAnalyticsPage;
    canSend: () => boolean;
  }): void;
  pageView(page: AgroAnalyticsPage): void;
  stop(): void;
}
export type AgroAnalyticsTransportFactory = () => AgroAnalyticsTransport;

export function createAgroAnalyticsController(
  environment: AgroAnalyticsEnvironment,
  { enabled = AGRO_ANALYTICS_ENABLED, createTransport }: { enabled?: boolean; createTransport?: AgroAnalyticsTransportFactory } = {},
) {
  let transport: AgroAnalyticsTransport | null = null;
  let lastPath: string | null = null;
  let blockedInMemory = false;
  let disposed = false;
  let generation = 0;

  function storage() {
    try { return environment.storage(); } catch { return null; }
  }

  function currentPage() {
    if (!enabled || !createTransport || blockedInMemory || disposed) return null;
    if (readAgroAnalyticsConsent(storage()) !== "granted") return null;
    try { return agroAnalyticsPage(environment.location()); } catch { return null; }
  }

  function suspend() {
    generation += 1;
    environment.setGoogleDisabled(true);
    const previous = transport;
    transport = null;
    lastPath = null;
    try { previous?.stop(); } catch { /* The disable flag and stale-generation guard already block sends. */ }
  }

  function sync(): boolean {
    const page = currentPage();
    if (!page) {
      suspend();
      if (readAgroAnalyticsConsent(storage()) !== "granted") clearAgroAnalyticsCookies(environment);
      return false;
    }
    if (page.page_path === lastPath) return true;
    // Each public page gets a fresh lifetime: callbacks for the previous page become stale.
    if (transport) suspend();
    try {
      if (!transport) {
        const token = ++generation;
        const candidate = createTransport!();
        transport = candidate;
        // The factory cannot grant consent or create authority to send.
        if (!currentPage()) { suspend(); return false; }
        environment.setGoogleDisabled(false);
        candidate.start({
          measurementId: AGRO_ANALYTICS_ID,
          defaultConsent: AGRO_ANALYTICS_DENIED_CONSENT,
          consent: AGRO_ANALYTICS_GRANTED_CONSENT,
          config: AGRO_ANALYTICS_CONFIG,
          page,
          canSend: () => generation === token && currentPage()?.page_path === page.page_path,
        });
      }
      // Fresh consent, location and cancellation check for each explicit page view.
      if (currentPage()?.page_path !== page.page_path || !transport) { suspend(); return false; }
      transport.pageView(page);
      lastPath = page.page_path;
      return true;
    } catch {
      blockedInMemory = true;
      suspend();
      return false;
    }
  }

  function choose(choice: AgroAnalyticsChoice): { saved: boolean; active: boolean } {
    if (choice === "granted" && !blockedInMemory && readAgroAnalyticsConsent(storage()) === "granted") {
      return { saved: true, active: sync() };
    }
    // Revoke before any fallible localStorage access or adapter callback.
    blockedInMemory = true;
    suspend();
    if (choice === "denied") clearAgroAnalyticsCookies(environment);
    const saved = writeAgroAnalyticsConsent(storage(), choice);
    if (!saved && choice === "denied") {
      // Best effort invalidation of a previous grant if replacing it failed.
      try { storage()?.removeItem(AGRO_ANALYTICS_CONSENT_KEY); } catch { /* Keep this document blocked. */ }
    }
    blockedInMemory = choice !== "granted" || !saved;
    return { saved, active: choice === "granted" && saved ? sync() : false };
  }

  environment.setGoogleDisabled(true);
  return {
    sync,
    choose,
    suspend,
    choice: () => readAgroAnalyticsConsent(storage()),
    dispose() { disposed = true; suspend(); },
  };
}
