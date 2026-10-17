# Visible Mercado Agro reference prices

The seller's original amount, currency and supply unit remain the prominent declared price. Cards, listing details and related cards use the same ListingPrice component. A priced listing now shows USD and VES reference rows without requiring expansion, with EUR/COP one-tap choices. The listing form preview matches that presentation before submission.

All references subscribe to the existing tab-wide rate client: one in-flight request, shared hourly TTL (including partial failures), official-date rollover and reconnect checks. The amount, listing and seller are not sent to rate providers. Closed ordinary calculators remain idle. No provider, parser, rate-validation, amount-storage or source-provenance logic changed.

Identity conversions use the declared amount without requiring a source rate. Missing official data is explicitly unavailable. Saved/failed/offline or previous-date references are visibly estimates and keep the original official source date. Cross-currency references use USD as the intermediate unit. No price is invented for quote-only listings.

Focused regressions cover both base currencies, EUR/COP pairs, units, zero, invalid/negative amounts, missing sources, offline/stale/failure warnings, one-tap actions and automatic/idle subscriptions. Existing 50-panel shared-request tests remain in use. Hosted visual verification is recorded separately after integration.
