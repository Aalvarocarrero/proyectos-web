# Free regional imagery: scope still open

## Verified today

The hosted pilot combines a567,939-byte public Protomaps/OSM cutout with a1,768,170-byte Sentinel RGB crop of the same~11×11km zone. Imagery date21January2026; native source resolution10m. Both can be stored independently as verified owner-scoped local copies. This is not nationwide satellite coverage or high-resolution imagery of buildings/fences.

A separately validated Venezuela context PMTiles file is ready outside the current release:9,790,298bytes, z0–10,1,310tiles, hash6932fce5754d60a3c8674451d03a7523a8aa3324a912fa250a22f582732a487c. It contains major cities/roads, not all farm tracks or named parish boundaries. Its Geofabrik extraction polygon is a data-coverage region, not an authoritative legal boundary.

Cloudflare documents25MiB per Workers Static Asset, but that alone does not establish the managed Sites product's effective limit. The actual10MB asset must pass normal Sites packaging/deployment and a served-byte check before claiming support. No paid resources, accounts or credentials are authorized for this expansion.

## Bounded next implementation

1. Add a reviewed catalog of public map/image zones. Each entry carries fixed public bounds, byte count, checksum, source/date, zoom or resolution, cloud/quality note and attribution. Farm coordinates remain an independent private overlay.
2. Prefer national z10 context when no detailed regional vector package covers the view. Use regional z14 only within its actual coverage. Never stretch the existing satellite crop to another region.
3. Keep full-file Blob/FileSource storage for these bounded packages. Use per-owner AND per-package download generations, preserving the legacy pilot generation key so old-client cancellation/removal cannot be bypassed by a pending commit. Hash/size verification and one transaction precede readiness.
4. Expose size/coverage before the explicit download, estimate local quota, preserve the previous complete copy after failure/cancellation, and remove map data independently from farm records. Do not add these optional files to automatic core/PWA caching.
5. Produce additional satellite packages from public Sentinel scenes using a trusted offline GDAL preparation step, crop/reproject to north-up WebMercator, visually inspect clouds and registration, then package the result. The Workers request path should not download/decode a300MB source image in memory.

## Privacy and capacity boundary

Start with predefined public regions; publication and source retrieval can then be independent of any owner's coordinates. A later user-specific crop pipeline must first identify the exact destination/data transmitted and obtain any missing approval. It must not silently send private polygons to a tile provider or catalog service.

A free public data license does not establish unlimited free compute/storage/egress. Use existing authorized capacity with measured per-package limits; do not enable billing or provision accounts. Automatic nationwide high-resolution satellite preparation remains unimplemented. Optional10m regional coverage is feasible, but not a substitute for Google-style sub-metre aerial detail or certified cadastral work.

## References

- https://docs.protomaps.com/basemaps/downloads
- https://docs.protomaps.com/pmtiles/leaflet
- https://www.openstreetmap.org/copyright
- https://registry.opendata.aws/sentinel-2-l2a-cogs/
- https://github.com/Element84/earth-search/blob/main/README.md
- https://sentinels.copernicus.eu/documents/247904/690755/Sentinel_Data_Legal_Notice
- https://developers.cloudflare.com/workers/platform/limits/
