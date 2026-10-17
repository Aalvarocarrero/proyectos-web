# Venezuela Agro analytics consent preparation

Status: **inactive, Google adapter prepared, not mounted, not production verified**. Measurement ID: `G-LGQE3RP9DJ`. The user approved basic GA4 public-page/session measurement and a specific three-host CSP expansion; the release owner manages that change separately. No security policy, layout, environment, worker, account, or permission changes are part of this preparation. No Google tag was fetched and no measurement was sent during development or testing.

## What is implemented

- `lib/agro-analytics-policy.ts`: fail-closed host/route and consent policy; versioned local preference; a cancellable transport boundary; owned-cookie cleanup; documented consent/configuration values.
- `components/agro-analytics-consent.tsx`: an optional in-flow footer panel with equally accessible allow/reject buttons, later revocation, persistent per-browser choice, cross-tab refresh, and no modal, timer, overlay or focus capture.
- `tests/agro-analytics-consent.test.mjs`: local fake transports and storage, with no external requests.
- `lib/agro-google-transport.ts`: an optional basic-mode Google tag adapter, separately gated by `AGRO_ENHANCED_MEASUREMENT_OFF_VERIFIED = false`.
- `tests/agro-google-transport.test.mjs`: fake DOM/script loading, cancellation, live opt-out flags and Google-command inspection; the fake DOM cannot fetch or execute external JavaScript.

`AGRO_ANALYTICS_ENABLED` defaults to `false`. The component also requires a stable `createTransport` factory supplied from client code. `createAgroGoogleTransportFactory()` is now available, with both activation and enhanced-measurement verification defaulting to false. Importing the adapter or creating its factory has no network side effects. The actual script is created only after every gate passes and a current browser choice grants analytics. Never assert that property settings are verified merely because a flag exists.

The only eligible origin is `https://venezuelaagro.com` on its default port. Preview domains, `www`, HTTP, non-default ports and other hosts are excluded. Only these exact section roots qualify: `/`, `/plataforma`, `/tienda`, `/marketplace`, `/rubros`, `/fincas`, `/profesionales`, `/red`, `/proyectos`, `/aprende`, `/nosotros`, `/guia-institucional`. Nested paths, record/profile IDs, private application routes, authentication, security, APIs, local libraries, legal pages, and any URL query or fragment are excluded entirely.

The app-generated page payload has four fields: a hard-coded canonical public URL, its exact section path, a fixed generic section title, and an empty referrer. It has no access to form values, coordinates, farm/account IDs, emails, feedback, searches, DOM titles, incoming referrers, or arbitrary event properties. Preference storage contains only `{ "version": 1, "choice": "granted" | "denied" }`; invalid versions or records cannot grant consent.

The configured cookie prefix is `vagro_ga4`, with host-only scope, `/` path, Secure, SameSite=Lax, a fixed 30-day expiry and no rolling extension. Revocation first sets the Google disable flag and invalidates pending callbacks, then stops the transport and deletes only `vagro_ga4_ga` and `vagro_ga4_ga_LGQE3RP9DJ`. It never clears unrelated cookies, localStorage, IndexedDB or farm data. If persisting a withdrawal fails, the current document remains blocked and the UI reports that the preference could not be saved; no durability guarantee is made for a browser that refuses all writes.

## Approved basic scope and remaining property blocker

[Google's basic consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode) delays Google tags until consent. Advanced mode may send cookieless measurements when consent is denied, so it is not suitable for the requested no-request-before-opt-in policy.

[Google's configuration reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/config) documents `send_page_view: false`, Google signals and ad-personalization disabling, cookie scope, and explicit page fields. The prepared configuration uses these controls. They are not evidence that every vendor-generated event or ambient browser field is disabled.

[Google's automatic-events documentation](https://support.google.com/analytics/answer/9234069) includes `first_visit`, `session_start` and `user_engagement`; default event parameters include language, screen resolution and page context. These basic session/engagement events are within the clarified, approved GA4 scope after opt-in. The prepared consent text acknowledges basic interaction, browser technical information and the connection IP. This is not anonymous or automatic-event-free measurement.

[Enhanced measurement](https://support.google.com/analytics/answer/9216061) is separately configured in the GA4 property. Before any possible tag activation, its forms, search, outbound clicks, downloads, scroll, video and history/page-view collection must be off and verified. Do not rely on an undocumented client-side `enhanced_measurement: false` flag. Also review connected tag destinations and user-provided-data collection. This preparation did not access or change the property.

The adapter uses a separate owned data layer and no global `gtag` function. It rejects an existing Google integration instead of adopting it. Consent defaults, fixed page fields, disabled advertising/signals, disabled URL passthrough and redaction are queued before loading. Stream configuration and the explicit `page_view` wait for a successful script load and a fresh eligibility check. Arbitrary event payloads are not forwarded.

The [official Google privacy guide](https://developers.google.com/tag-platform/security/guides/privacy#turn_off_google_analytics) states that `window['ga-disable-MEASUREMENT_ID']` is checked before cookie writes and Analytics sends, and should be set before `gtag()` calls on excluded pages. The adapter implements this property as a live getter: it returns true for revoked/invalid consent, a private/query/hash/changed page, an unready runtime, or a stopped lifetime, even before React processes navigation. This is grounded in Google's documented check, but its behavior with the real production library remains to be validated.

On stop, the adapter disables first, discards its pending app view, updates all consent states to denied and removes only its owned script element. The controller deletes its two owned cookies on withdrawal, preserving sessions during ordinary public navigation. Script removal does not unload executed code or recall already-dispatched requests. A successfully loaded runtime is reused behind the guard; an interrupted/erroring initial load stays disabled until a full document reload to avoid racing a second Google script against a late first load. No claims are made about canceling a vendor-internal queue or a request already on the network.

Google also documents [coarse geolocation and granular location/device controls](https://support.google.com/analytics/answer/12017362). Omitting farm coordinates is not the same as promising Google will derive no location from network requests. Do not label normal GA4 anonymous or claim the network request has only these four app fields.

## CSP review and inactive release integration

As of 2026-10-07, [Google's current CSP guide](https://developers.google.com/tag-platform/security/guides/csp#google_analytics) (updated 2026-09-18) lists Analytics without Ads as:

| Directive | Google-documented sources |
| --- | --- |
| `script-src-elem` | `https://www.googletagmanager.com` |
| `img-src` | `https://www.googletagmanager.com https://*.google-analytics.com` |
| `connect-src` | `https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com` |

Those are Google's compatibility recommendations, **not the requested policy expansion**. No wildcards, Ads, DoubleClick, Google Syndication, frames, `unsafe-inline`, `unsafe-eval`, preconnect or DNS-prefetch are added here.

A universal fixed minimum cannot be established from Google's wildcard documentation without observing the actual permitted tag. The user approved only these exact sources for the release owner to apply and validate:

| Directive | Exact approved origin scope; owner applies CSP separately |
| --- | --- |
| `script-src-elem` (or its existing fallback `script-src`) | `https://www.googletagmanager.com` |
| `connect-src` | `https://www.googletagmanager.com`, `https://www.google-analytics.com`, `https://region1.google-analytics.com` |
| `img-src`, if needed for permitted image fallback | The same three explicit origins as `connect-src` |

Google's [Analytics data-flow diagram](https://storage.googleapis.com/support-kms-prod/LnQ8X4K0alkkQM5zyK7Wm0gkk1ETJIoSeNNk) also identifies other collector hostnames, including the `analytics.google.com` family. They are outside this approval and must remain blocked. Do not automatically broaden the policy after a blocked request; report it and obtain approval if an additional origin proves necessary. The adapter's script element uses `referrerPolicy = 'no-referrer'`. Actual collector HTTP Referer headers and browser metadata still require verification; overriding `page_referrer` does not itself govern vendor-created HTTP requests.

## Integration and verification still required

1. Verify the actual web stream's enhanced measurement is off and review connected destinations, user-provided-data collection and any additional Google-tag settings. Keep the separate verification flag false until supported by account evidence.
2. The owner applies only the approved three-host CSP change, preserving other restrictions. Private routes and the authenticated preview must remain excluded. Additional hosts require a new approval.
3. Supply a stable Google transport factory from client code and mount the component within the public page's footer flow after the primary content, preserving the existing installation then ideas sequence. Keep withdrawal reachable after a saved grant. Confirm responsive layout and keyboard access before enabling both release gates.
4. Verify synthetic, non-personal fixtures with all external measurement blocked/intercepted first: initial/no choice, denial, reload, opt-in, private navigation, query/hash changes, back/forward, cross-tab withdrawal, unmount during delayed initialization, and repeated clicks.
5. Verify the actual Google script's live disable-property behavior, requests, payloads and cookie behavior on the production hostname, including delayed/batched sends, private navigation, withdrawal during load and bfcache restore. Check for enhanced measurement events and unsupported collector origins. No production measurement validation has been performed here.

Focused validation completed: 23 local behavioral/rendering/adapter tests and targeted ESLint. TypeScript `--noEmit --incremental false` is also run against the final adapter. These validate local logic with fake transports/scripts, not Google's live script or account settings.

Release-owner integration: `lib/site-content-security.ts` and `worker/index.ts` now apply the approved exact origins to eligible production public roots only. This was reviewed with 25 analytics/CSP tests and 9 isolated worker-header checks. Both activation flags remain false and analytics is not mounted. Enhanced-measurement verification is deferred by the owner until tomorrow. SPA navigation retains the document CSP, so eventual activation must verify the live private-route opt-out guard as well as fresh-document policies.
