import {
  AGRO_ANALYTICS_CONFIG,
  AGRO_ANALYTICS_DENIED_CONSENT,
  AGRO_ANALYTICS_ENABLED,
  AGRO_ANALYTICS_GRANTED_CONSENT,
  AGRO_ANALYTICS_ID,
  agroAnalyticsPage,
  readAgroAnalyticsConsent,
  type AgroAnalyticsPage,
  type AgroAnalyticsTransport,
  type AgroAnalyticsTransportFactory,
} from "@/lib/agro-analytics-policy";

/** Remains false until the actual GA4 web stream's enhanced measurement is verified off. */
export const AGRO_ENHANCED_MEASUREMENT_OFF_VERIFIED: boolean = false;
export const AGRO_GOOGLE_SCRIPT_ID = "venezuela-agro-google-analytics";
export const AGRO_GOOGLE_LAYER = "venezuelaAgroAnalyticsLayer";
export const AGRO_GOOGLE_SCRIPT_SRC = `https://www.googletagmanager.com/gtag/js?id=${AGRO_ANALYTICS_ID}&l=${AGRO_GOOGLE_LAYER}`;
const disableKey = `ga-disable-${AGRO_ANALYTICS_ID}`;

type StartOptions = Parameters<AgroAnalyticsTransport["start"]>[0];
type Browser = { window: Window; document: Document };
type ActivePage = {
  token: object;
  options: StartOptions;
  page: AgroAnalyticsPage;
  pendingView: boolean;
  configured: boolean;
  sent: boolean;
};
type Runtime = {
  browser: Browser;
  globals: Record<string, unknown>;
  layer: unknown[];
  command: (...args: unknown[]) => void;
  script: HTMLScriptElement | null;
  active: ActivePage | null;
  loaded: boolean;
  interrupted: boolean;
  manualDisabled: boolean;
  ready: boolean;
};
const runtimes = new WeakMap<Window, Runtime>();

function currentPage(runtime: Runtime): AgroAnalyticsPage | null {
  try {
    if (readAgroAnalyticsConsent(runtime.browser.window.localStorage) !== "granted") return null;
    return agroAnalyticsPage(runtime.browser.window.location);
  } catch { return null; }
}

function maySend(runtime: Runtime): boolean {
  const active = runtime.active;
  return !!active && active.options.canSend() && currentPage(runtime)?.page_path === active.page.page_path;
}

function disable(runtime: Runtime) {
  runtime.manualDisabled = true;
  runtime.ready = false;
}

function stopRuntime(runtime: Runtime) {
  disable(runtime);
  runtime.active = null;
  // Only this integration's queue is touched. Requests already dispatched cannot be recalled.
  runtime.layer.length = 0;
  runtime.command("consent", "update", AGRO_ANALYTICS_DENIED_CONSENT);
  if (runtime.script) {
    // Removing a script does not unload code or guarantee cancellation of an in-flight fetch.
    if (!runtime.loaded) runtime.interrupted = true;
    runtime.script.onload = null;
    runtime.script.onerror = null;
    runtime.script.remove();
    runtime.script = null;
  }
  // The consent controller deletes owned cookies on withdrawal. A temporary public
  // navigation suspension must not erase an already-consented browser session.
}

function configureAndFlush(runtime: Runtime) {
  const active = runtime.active;
  if (!runtime.loaded || !active) return;
  if (!maySend(runtime)) { stopRuntime(runtime); return; }
  if (!active.configured) {
    disable(runtime);
    // Override context globally as well as per stream before allowing any GA4 dispatch.
    runtime.command("set", {
      ...AGRO_ANALYTICS_CONFIG,
      ...active.page,
      ads_data_redaction: true,
      url_passthrough: false,
    });
    runtime.command("consent", "update", AGRO_ANALYTICS_GRANTED_CONSENT);
    runtime.command("config", AGRO_ANALYTICS_ID, { ...AGRO_ANALYTICS_CONFIG, ...active.page });
    active.configured = true;
    runtime.ready = true;
    runtime.manualDisabled = false;
  }
  if (active.pendingView && !active.sent && maySend(runtime)) {
    active.pendingView = false;
    active.sent = true;
    runtime.command("event", "page_view", { ...active.page, send_to: AGRO_ANALYTICS_ID });
  }
}

function getRuntime(browser: Browser): Runtime {
  const owned = runtimes.get(browser.window);
  if (owned) return owned;
  const globals = browser.window as unknown as Record<string, unknown>;
  if (globals[AGRO_GOOGLE_LAYER] !== undefined || globals.gtag !== undefined || globals.google_tag_manager !== undefined || browser.document.getElementById(AGRO_GOOGLE_SCRIPT_ID)) {
    throw new Error("Existing Google integration requires review before adding this tag.");
  }
  const layer: unknown[] = [];
  const runtime: Runtime = {
    browser, globals, layer,
    command: function () {
      // Google's public gtag queue protocol uses the arguments object, not custom events.
      // eslint-disable-next-line prefer-rest-params
      layer.push(arguments);
    },
    script: null, active: null, loaded: false, interrupted: false, manualDisabled: true, ready: false,
  };
  // Google checks this flag before writes/sends. Reading it rechecks the live URL and
  // stored consent, so SPA navigation is blocked even before a React effect runs.
  Object.defineProperty(globals, disableKey, {
    configurable: true,
    enumerable: false,
    get: () => runtime.manualDisabled || !runtime.ready || !maySend(runtime),
    set: value => { runtime.manualDisabled = value !== false; },
  });
  globals[AGRO_GOOGLE_LAYER] = layer;
  runtimes.set(browser.window, runtime);
  return runtime;
}

/**
 * No side effects until start(), then only after all release + consent + URL guards.
 * Production remains off: both flags default false. Basic GA4 automatic session and
 * engagement events are expected after opt-in; enhanced measurement must be off.
 */
export function createAgroGoogleTransportFactory({
  enabled = AGRO_ANALYTICS_ENABLED,
  enhancedMeasurementOffVerified = AGRO_ENHANCED_MEASUREMENT_OFF_VERIFIED,
  browser = () => ({ window, document }),
}: {
  enabled?: boolean;
  enhancedMeasurementOffVerified?: boolean;
  browser?: () => Browser;
} = {}): AgroAnalyticsTransportFactory {
  return () => {
    const token = {};
    let runtime: Runtime | null = null;
    let stopped = false;
    return {
      start(options) {
        if (!enabled || !enhancedMeasurementOffVerified) throw new Error("Analytics activation prerequisites have not been verified.");
        if (stopped || runtime) throw new Error("This analytics page lifetime has already been used.");
        const context = browser();
        const page = agroAnalyticsPage(context.window.location);
        if (!page || !options.canSend() || readAgroAnalyticsConsent(context.window.localStorage) !== "granted" || page.page_path !== options.page.page_path) {
          throw new Error("Analytics requires current consent on an eligible public production page.");
        }
        runtime = getRuntime(context);
        disable(runtime);
        if (runtime.interrupted) throw new Error("An interrupted tag load remains disabled until the document is reloaded.");
        runtime.active = { token, options, page, pendingView: false, configured: false, sent: false };
        if (runtime.loaded) { configureAndFlush(runtime); return; }
        // Defaults are queued locally, then the only script request starts after explicit consent.
        runtime.command("consent", "default", AGRO_ANALYTICS_DENIED_CONSENT);
        runtime.command("set", { ...AGRO_ANALYTICS_CONFIG, ...page, ads_data_redaction: true, url_passthrough: false });
        runtime.command("js", new Date());
        const script = context.document.createElement("script");
        script.id = AGRO_GOOGLE_SCRIPT_ID;
        script.async = true;
        script.referrerPolicy = "no-referrer";
        script.src = AGRO_GOOGLE_SCRIPT_SRC;
        runtime.script = script;
        const loading = runtime;
        script.onload = () => {
          if (loading.script !== script || loading.active?.token !== token) return;
          loading.loaded = true;
          configureAndFlush(loading);
        };
        script.onerror = () => { if (loading.script === script) stopRuntime(loading); };
        if (!maySend(runtime)) { stopRuntime(runtime); return; }
        context.document.head.appendChild(script);
      },
      pageView(page) {
        if (stopped || !runtime || runtime.active?.token !== token) return;
        if (!maySend(runtime)) { stopRuntime(runtime); return; }
        if (page.page_path !== runtime.active.page.page_path) return;
        runtime.active.pendingView = true;
        configureAndFlush(runtime);
      },
      stop() {
        stopped = true;
        if (runtime?.active?.token === token) stopRuntime(runtime);
      },
    };
  };
}
