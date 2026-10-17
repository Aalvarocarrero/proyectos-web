# Optional satellite sample: scope and evidence

This release adds one genuine historical satellite image for a fixed public Venezuelan region. It does not provide satellite coverage for every registered farm or all Venezuela. It does not accept uploaded plans or arbitrary raster files. Farm owners can continue to draw their own contours and enter survey coordinates privately; normalized sketches alone do not supply a geographical location.

## User flow

In Mi Finca → Territorio y producción, the map offers “¿Lo necesitas sin internet? Descarga esta zona”, actual size1.69 MiB and a separate “Explorar zona de muestra” action. It never automatically moves an owner's farm to the sample. Download is disabled unless the entire current map view falls inside the sample's actual bounds. When a selected farm's confirmed geographic coordinates fall within coverage, its private overlay can appear on the downloaded image. An unrelated farm is not overlaid on the public sample during exploration; Ver mi referencia returns to its own map.

The image is optional and independent of ordinary offline app preparation. It saves only after exact byte/hash and known raster dimension verification and an atomic owner-partitioned IndexedDB commit. Interrupted refresh, cancellation and quota failure preserve a prior committed copy. Clear invalidates unfinished downloads and removes only that workspace's image. It does not touch farm entities, pending changes, other owners or the public library. Downloaded data is rechecked before rendering after reopen. No provider requests or private coordinates are transmitted to external imagery services by the app. Source/license links are ordinary explicit user links.

Source image acquisition date, processing change, download date, resolution, coverage, size and attribution remain distinct. The map warns that enlargement adds no detail. Browser storage can be removed or evicted; check preparation before leaving coverage. The15 MiB farm JSON backup does not contain the raster; download the public image separately on a new origin/device.

## Exact provenance

- Scene S2C_T19PEL_20260121T150912_L2A, acquired2026-01-21T15:10:20.540Z.
- https://earth-search.aws.element84.com/v1/collections/sentinel-2-c1-l2a/items/S2C_T19PEL_20260121T150912_L2A
- Public HTTPS source from Element84 Earth Search; no account/keys or requester-pays S3 route.
- Native RGB resolution10m. Crop warped north-up to EPSG:3857, projected output10m/pixel;1113×1129 PNG,1,768,170bytes.
- SHA2561f40baf8574e36c6d81e7a8b39c4be71cf69d3abe0c146d86528218a6035859a.
- WGS84 bounds west−68.4,south9.3999566,east−68.3000175,north9.5 (approximately11×11km).
- Required derivative attribution: Contains modified Copernicus Sentinel data 2026.
- https://sentinels.copernicus.eu/documents/247904/690755/Sentinel_Data_Legal_Notice
- Full-scene cloud percentage1.519968% does not establish crop conditions. Pixel inspection showed rural terrain, fields and roads with possible haze; no cloud-free guarantee. A February candidate was rejected for visible cloud interference.

ROHO's actual map was an online OpenStreetMap iframe. This release borrows a framed map/card presentation, not its external iframe or tiles; the offline renderer stays Leaflet with same-origin/local data. No CSP/auth/GPS permission change, arbitrary upload endpoint, or held image-decoder code is included.

## Verification and remaining work

Tests cover scoped persistence/reopening, quota failure, cancellation, out-of-order generations, clear races, fixed same-origin requests, coverage, native-ready prompt markup, core-cache exclusion and preservation of farm records/outbox. The ordinary PNG was visually inspected; no malformed-image decoder tests were attempted. Final aggregate build/type/lint/test evidence accompanies deployment.

Physical iPhone/Android cold-offline display, real browser Leaflet overlay alignment and memory/performance remain unverified. Core app preparation is still required. A scalable per-farm satellite service needs more dated licensed regional packs, coverage selection, measured storage/hosting capacity, freshness operations and device QA. This one public sample is not completion of that broader requirement.
