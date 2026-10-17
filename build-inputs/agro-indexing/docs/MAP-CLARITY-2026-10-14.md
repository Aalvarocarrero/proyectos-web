# Map clarity and shared public context

The farm geography section now starts open. Selecting Satellite explicitly centers an existing saved image; missing imagery keeps streets visible and says why. Consent and owner/farm isolation for private satellite downloads are unchanged.

Marketplace location now reads the existing same-origin, checksum-verified national PMTiles archive (OpenStreetMap/Protomaps 2026-10-07, detail through z10). Products inside the existing Llanos pilot also receive that existing z14 archive. The inline view and larger dialog share verified public Blobs in memory, without reading private farm workspaces or creating new offline storage. Failed loads can retry when reopening. No new provider, credentials, dataset, or billing resource is introduced.

State outlines remain the same GeoJSON, overlaid independently. Their source names appear on hover or keyboard focus; permanent state tooltips were removed after hosted QA showed collisions at regional zoom. The base cartographic labels retain Protomaps collision handling. Product markers use only declared coordinates. State and municipality text come from the listing; absent parish data remains explicitly undeclared. No administrative geometry or address is fabricated. Labels and roads are limited to what the existing archives contain; this is not complete nationwide street or parish coverage and does not supply routes or live GPS.

Satellite is available in Marketplace only when the declared product point is inside the already hosted public Sentinel sample. It is loaded on explicit mode selection, centered on the declared point, and labeled with its historical date (21 January 2026), original 10 m resolution, and limited rectangle. It is not a parcel boundary. Outside that coverage, Satellite is disabled with an explanation. The enlarged dialog has a 65dvh canvas instead of sharing the original short height. ResizeObserver keeps Leaflet sizing aligned with its container.

Existing offline preparation and optional per-workspace map/image downloads in Mi Finca remain unchanged. Marketplace makes no new guarantee of availability after a reload without connection; the public in-memory map lasts only for the current page session. Existing attributions remain visible.

Verification: TypeScript, focused ESLint, existing geography/storage/consent tests, and five new rendering/loading regressions (coverage-gated satellite, taller dialog, declared names, shared verified bytes, failed-load retry, expanded farm section). Browser and integrated build results are reported separately.
