# EUR official reference extension · 2026-10-14

## Source and permitted reuse

- Public fixed HTTPS XML: https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml
- Publisher and publication schedule: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
- Free-use and attribution conditions: https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html

The ECB publishes reference rates on working days around 16:00 CET, except TARGET closing days. It describes them as informational and discourages their use for transactions. The data is openly retrievable without a key or paid service. ECB information may be reused free with accurate attribution and explicit disclosure of calculated changes. The panel identifies the ECB, links its full website and conditions, shows the original USD-per-EUR reference, and identifies the conversion as calculated by Venezuela Agro. This is not an executable payment quote.

## Implementation

- Add EUR once to the shared currency enum; retain USD/VES/COP and compatible version-1 local snapshots.
- Retrieve the ECB feed server-side beside BCV and Colombia TRM. Providers fail independently.
- Preserve strict HTTPS origins, bounded response size/time, manual redirects with explicit refusal, and runtime-bound fetch. No credentials, proxy service, TLS override or synthetic fallback rate.
- Validate ECB namespace, publisher, a single dated USD observation, numeric value and calendar date. Reject future publications, ambiguous/malformed XML, DTD/entities and observations over seven calendar days old.
- Normalize `perUsd = 1 / ECB USD-per-EUR` for the existing shared converter. EUR/COP and EUR/VES are explicitly calculated through USD using their respective official sources, rather than claimed direct quotations.
- Retain the exact ECB publication date, including during weekends. Do not invent an end date. Older references receive a visible estimated-value warning. Cached rates retain the original source consultation timestamp when a refresh fails or the device is offline.
- Cache for one hour per isolate and refresh when a source's local calendar day changes. A prior-business-day ECB reference does not cause requests on every listing.
- Export shared currency labels and `initiallyOpen` converter mode for tariff/budget/calculator consumers. When the original currency changes, the target remains selectable and cannot equal it.

## Evidence

- Secure no-redirect public XML retrieval succeeded with HTTP 200 at approximately 2026-10-14 23:17 UTC.
- The production parser accepted that actual XML at 23:28 UTC: source date `2026-10-14`, original `1 EUR = 1.1195 USD`, normalized `0.8932559178204557 EUR per USD`. This is a verified source observation, not a rate hardcoded into the application.
- Focused suite: 22/22 passing, including all six EUR pair directions, legacy cache compatibility, independent provider failure, publication-date/holiday handling, redirects and target changes.
- Complete existing suite: 1,084 tests passed.
- TypeScript: passed. Production build: passed. Offline public bundle: 20,375,843 bytes, under the 20 MiB cap.
- Hosted EUR conversion still requires integration/deployment verification. Local source validation alone is not reported as hosted success.

## BCV status at this commit

The existing strict parser and the integrator's bounded diagnostics are unchanged. Hosted v119 evidence at 23:32:38 UTC established the exact cause: the USD block and numeric format are valid, there is no challenge page, and both the global and nearby Fecha Valor are `2026-10-15`, while the Caracas day is still `2026-10-14`. Refusing this future rate is correct. There is no verified current-day BCV observation available from this response. A previously saved valid observation remains available as an explicitly dated estimate; a new device without one cannot calculate VES. The loader refreshes after Caracas midnight and accepts the publication only once its date matches. Local certificate-chain failure is a separate observation and does not explain the hosted result. No BCV number is invented or accepted from an unofficial substitute.

## Company catalog follow-on

Company product prices now use the same four-currency enum in both the client form and server validation. The public company catalog preserves the stated amount and unit, adding the same optional converter only when a real price exists. Demonstration products and “consultar precio” entries do not receive invented amounts or conversion panels. Existing USD/VES catalog records retain their currency. The company UI regression checks all four options, unsupported-currency rejection, unchanged price cents, and demo/null-price exclusions.

Follow-on validation: 18 company-focused tests and all 1,085 existing tests passed; TypeScript and production build passed. Public offline library after the company change: 20,376,594 bytes.
