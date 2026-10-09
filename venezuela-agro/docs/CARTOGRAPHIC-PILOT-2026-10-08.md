# Optional cartographic pilot

A real OpenStreetMap/Protomaps PMTiles cutout is hosted as a fixed same-origin asset:567,939bytes,62tiles,zoom0–14, source build20261007 (OSM timestamp2026-10-07T04:00Z), schema4.15.2. Bounds W/S/E/N:−68.4,9.3999566,−68.3000175,9.5. SHA256:10044fa6c78d798d1d1130b659cdb7defcc6589e9864fe27284b93f3cfeeaf0d.

It contains roads, water and named places in this public~11km cutout. It is not national coverage, a complete locality gazetteer, surveyed parcel data, or complete named municipal/parish boundaries. Tile buffers extend outside the AOI; drawing panes are clipped to its geographic rectangle.

Users explicitly explore/download the public area. Complete bytes+hash are checked before an owner-partitioned IndexedDB transaction marks the copy usable. A newer download/clear invalidates older generations. Failure preserves prior complete bytes. The map copy never opens farm entities or sync outbox storage. Demo imagery uses a dedicated public-demonstration namespace.

The renderer uses pinned protomaps-leaflet5.1.0 and pmtiles3.2.1 from npm. This is an existing Leaflet-based app, the narrow legacy use for which the maintainer retains the renderer in maintenance mode. Local FileSource serves ranges from the verified Blob; no external map URLs or private coordinates are sent. Map paints cartography plus labels; Satellite can paint the same labels over the separately downloaded Sentinel image. Private polygons remain above both. Overzoom does not add data.

Optional PMTiles bytes are excluded from core/public-library automatic copies and generic service-worker caching. Runtime JS stays in the prepared app shell. Satellite and cartographic packages have independent readiness and removal. Farm backup JSON does not embed either image/map package.

Sources/licenses: https://docs.protomaps.com/basemaps/downloads ; https://docs.protomaps.com/pmtiles/leaflet ; https://www.openstreetmap.org/copyright . Protomaps is an ODbL Produced Work; OpenStreetMap attribution remains visible. Renderer source license is retained in installed dependency/package metadata. No new provider account, key, paid service, CSP relaxation or geolocation permission was introduced.
