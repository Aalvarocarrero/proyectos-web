# Irregular boundaries and private geographic context

Prepared 7 October 2026. This release extends the existing owner-scoped farm JSON; it requires no database migration.

## Available flows

- Mi Finca → farm configuration → irregular shape: create a 3–200 vertex sketch, add or insert points, select and drag a point, enter values, undo, cancel, or clear. Coordinates in this editor are normalized drawing units, never metres.
- Plano y potreros → Agregar al plano → Irregular: save a separate internal-area outline. Existing areas offer Editar contorno. Automatic division is unavailable for custom polygon outlines because rectangular division would duplicate their geometry.
- Metric survey coordinates remain a separate ordered list. Partial rows, duplicate vertices, crossings and zero-area polygons are rejected before saving. Concave polygons and either winding are supported. Original coordinates, declared area and calculated estimate remain distinct.
- Private location can use an explicitly selected WGS84 point, REGVEN / UTM 19N point, or confirmed REGVEN / UTM 19N survey. A single point is a locator, not a surveyed boundary. REGVEN conversion is approximate and does not certify boundary accuracy.
- The interactive locator downloads only the existing same-origin Venezuelan state boundaries and application code. It provides geographic context, zoom and private overlays, with no satellite imagery, roads, detailed terrain, live GPS or external tile requests. The source note identifies the public boundary dataset and disputed-area limitation.

## Persistence and compatibility

All saves retain existing owner isolation, revision checks, durable local cache/outbox, sync conflicts and backup contracts. Older prepared clients that omit newly introduced geometry preserve it during the revision-checked server update. New clients explicitly clear it with null. Farm settings preserve optional controls when absent and retain edits while an accordion is collapsed. Existing original user records are not migrated, reassigned or deleted by this release.

Prepare the updated application online before using the new controls without a connection. Download readiness verifies the current build's code/style resources and same-origin geography asset. Browser storage can still be cleared or evicted; maintain exports. Detailed offline regional basemaps remain future work requiring an appropriately licensed packaged dataset and verified storage/hosting capacity. Standard OpenStreetMap tile bulk/offline downloads are not used.

## Verification

The production build, TypeScript and 274 automated tests passed. These include actual synthetic SQLite sync/bootstrap roundtrips, older-client field preservation, stale clear conflicts and account isolation; polygon validation; backup compatibility; pointer/keyboard/cancellation handlers; projection control points and roundtrips; and existing offline storage/sync coverage. Lint has zero errors and 28 existing warnings.

Independent read-only review covered geometry, private storage, split guards and the same-origin map. Actual iPhone/iPad/Android touch performance and the new prepared-app airplane-mode workflow still need physical testing. No real farm data was used for tests.

Analytics preparation remains inactive. Enhanced-measurement property verification and later live runtime verification are outstanding. The approved three-host CSP exception applies only to eligible production public roots; private Sites preview and private application routes retain self-only connections.

## Dependencies and primary references

- Leaflet 1.9.4, BSD-2-Clause; license in public/licenses/leaflet.txt.
- proj4 2.22.0, MIT; license in public/licenses/proj4.txt.
- https://proj4js.org/
- https://raw.githubusercontent.com/OSGeo/PROJ/master/data/sql/projected_crs.sql (EPSG:2202)
- https://raw.githubusercontent.com/OSGeo/PROJ/master/data/sql/helmert_transformation.sql (EPSG:1768, approximate REGVEN to WGS84)
- https://operations.osmfoundation.org/policies/tiles/
