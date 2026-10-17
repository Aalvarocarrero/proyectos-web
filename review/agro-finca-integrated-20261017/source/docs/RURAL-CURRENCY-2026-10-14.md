# Rural UX and official currency reference

## Delivered locally

- The existing seller-controlled USD / VES / COP prices are preserved. The form now links the price to the selected selling unit and adds explicit animal / lot choices. The original amount/currency remain authoritative; optional conversions never rewrite the listing.
- Price cards and product details show the selling unit and the listing's actual server update date. No update date is invented for demonstrations or missing/invalid timestamps.
- The existing product-details envelope accepts a bounded, explicitly public rural landmark. It is stored and retrieved through the existing contact envelope, with no database migration or private farm/GPS inference.
- Contextual WhatsApp already existed, with public-contact opt-in and a final send controlled in WhatsApp. It is preserved, including non-actionable demo contacts.
- The existing first-start card gains three short steps. Offline preparation now puts the basic app first, optional 3D under a separate disclosure, and a downloaded private backup last. It does not claim that recording farm data requires optional 3D assets.
- Build output records the actual uncompressed bytes of code and required static assets. Server-rendered page bytes remain unmeasured, explicitly disclosed, and transfer size is not falsely equated with storage size. The 3D manifest's measured assets are displayed before download. Failed size checks display an unknown-size warning.

## Exchange-rate implementation

`GET /api/exchange-rates` queries two fixed public HTTPS origins; callers cannot supply a URL. Requests are read-only, unauthenticated, time-bounded (12 seconds per source), capped at 1.5 MB, and reject redirects. No certificate-validation exception, paid provider, proxy fallback, seeded rate, private user data or account credential is involved.

The server shares concurrent lookups and retains responses for up to one hour in the current Worker isolate. Source-local midnight invalidates successful rates when their effective interval ends. This is not a persistent scheduled service or a promised SLA. A fresh isolate may consult again. The browser makes lookups only when the optional currency panel is open, on reconnection/return to the visible page, and hourly while visible.

Browser storage retains only validated successful public rates and their original observation timestamps. Failed updates never retimestamp the previous copy. A per-source failure still permits conversions using the other source. Missing required rates produce no number. Offline/stale/failed-refresh use is labelled estimated, with the source-effective date/interval and exact last successful source consultation (displayed in Venezuela time). VES/COP conversions are clearly labelled as calculated through USD, not a directly published pair.

### Colombia: verified public official dataset

- Official publisher: Superintendencia Financiera de Colombia (SUPERFINANCIERA).
- Dataset metadata read successfully: https://www.datos.gov.co/api/views/32sa-8pi3.json
- Observed metadata: `provenance: official`, `licenseId: CC_40_BY_SA`, public audience, attribution SUPERFINANCIERA.
- Dataset page: https://www.datos.gov.co/Econom-a-y-Finanzas/Tasa-de-Cambio-Representativa-del-Mercado-TRM/32sa-8pi3
- Public API read successfully without credentials: https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=15&$order=vigenciadesde%20DESC
- Required fields: `valor`, `unidad` (COP), `vigenciadesde`, `vigenciahasta`.
- The source already included a following-day record during research. The implementation selects the row whose effective interval contains today's date in America/Bogota. It never assumes that the first/newest row applies now, and supports multi-day holiday/weekend validity.
- Daily calculation/certification and links to official history: https://www.superfinanciera.gov.co/publicaciones/60819/informes-y-cifrascifrasestablecimientos-de-creditoinformacion-periodicadiariatasa-de-cambio-representativa-del-mercado-trm-60819/
- API access without an application token is supported but subject to shared-IP throttling. No token or paid service was created: https://dev.socrata.com/docs/app-tokens.html
- Dataset attribution and CC BY-SA 4.0 link appear alongside the displayed rate. The dataset license differs from the developer-documentation website's license.

### Venezuela: official source remains unavailable in this environment

- Public official source attempted: https://www.bcv.org.ve/
- Official reference page also attempted: https://www.bcv.org.ve/estadisticas/tipo-cambio-de-referencia-smc
- Both returned HTTP 502 during the research. No source data was successfully retrieved from BCV, and there is no verified live VES rate in this deliverable.
- A strict adapter is prepared for the public HTML dollar block and its effective-date metadata. It requires a positive numeric value and today's effective date in America/Caracas, and refuses future, previous-day, changed/missing markup or unavailable responses. Parser fixtures are synthetic tests, not claimed observations of the live page.
- No documented official JSON API, current reuse license, contractual free API allowance or guaranteed publication schedule could be verified from the unavailable BCV pages. This adapter must not be represented as a certified or SLA-backed BCV API. The public data is treated only as factual reference with attribution.
- If BCV publishes a next-working-day value early, this conservative adapter refuses to call it today's rate. An existing client copy may still be shown with its original date and a stale/failure warning. Without a valid local copy, VES conversions stay unavailable. A verified official historical endpoint would be needed to improve this case reliably.

## Checks and boundaries

- No edits to the approved homepage, map rendering/navigation, service-worker data isolation, authentication branch, legal agreements, payments or payment commitments.
- No production deployment or external publication performed by this worker.
- Tests cover effective dates, source time zones, future records, holiday intervals, malformed/invalid/zero rates, BCV source failures, all six currency directions, partial source availability, cache timestamps, public rural-reference envelope, explicit units/update date and honest offline copy.
- Local visual checks and aggregate results are recorded in the task handoff. BCV live data could not be verified; visual checks do not remove this external limitation.


## Hosted fetch compatibility follow-up

The first private deployment returned unavailable rates for both sources. Bounded server diagnostics in the integration deployment established immediate fetch TypeErrors before any HTTP response, parsing or timeout. A fresh direct official TRM response still passed the committed parser and selected the current effective date correctly.

The loader now resolves `globalThis.fetch` inside the active request instead of retaining a module-initialization reference. It preserves the global receiver and uses standard `Cache-Control: no-cache` / `Pragma: no-cache` request headers instead of relying on the optional `cache` request property. Fixed HTTPS destinations, redirect rejection, timeout, size limit, effective-date validation and honest missing-rate behavior remain unchanged. A regression test covers a host that replaces its fetch after module initialization and requires its global receiver.

This is a bounded runtime-compatibility repair. Hosted verification is still required before claiming that Colombia conversions work. BCV's separate upstream certificate problem was observed during direct research and is not bypassed by this change.

### Confirmed edge-runtime cause and redirect handling

Private v117 runtime diagnostics established the concrete failure: its edge fetch rejects `redirect: 'error'` and only implements `follow` or `manual`. The adapter now uses `manual`, explicitly rejects all 3xx responses and any already-redirected response, and never follows an upstream Location. This preserves the original fixed-origin security boundary. Host fetch resolution and portable request cache headers alone did not solve the failure. Live verification remains required after this correction.
