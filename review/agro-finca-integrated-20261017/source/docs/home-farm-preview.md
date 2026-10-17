# Home: Mi Finca preview

The home banner previews the existing read-only 10 ha model and links to `/finca-modelo` and `/app`. The published fixture and the v105 aerial controller, animal geometry and placements are unchanged. This is not a video or aerial photograph: it is the existing real Three.js scene, reused through a visual-only lazy entry.

## Loading and motion

- Initial preview controller is approximately 4.5 KB raw / 2.1 KB gzip. Its static production import closure contains only shared React/runtime code; no Three.js, demo fixture, scene or editable workspace.
- The 11,647-byte lazy SVG is generated from the same 41 areas and 101 animal positions by `node scripts/generate-home-farm-poster.mjs`. It is explicitly labelled a 2D plan, not a 3D screenshot.
- The scene begins loading only after the section has been visible for 800 ms in an active tab, or following explicit activation. No root margin preloading.
- Save-Data, 2G/3G and reduced motion leave the lightweight plan until explicit activation. Reduced motion keeps the 3D view stationary, even after activation.
- The deferred renderer is approximately 766 KB raw / 202 KB gzip. Other deferred dependencies include approximately 131 KB raw / 12 KB gzip of fixture data. It reuses existing local model/material files (the complete existing v1 asset folder is 2,434,312 bytes); it adds no heavy assets or external services. This is deferred 3D, not a claim of video-sized total bandwidth.
- Pause/resume, leaving the section, hiding the tab and returning preserve the mounted scene. No repeated geometry construction on intersection changes. No audio, pointer capture or interactive canvas in the home banner.
- A first-render callback reveals the scene only when it has drawn. Any import, renderer or context failure preserves the static plan and the navigation links.

## Verification

TypeScript, production build, lint (existing warnings), full regression suite and focused preview policies. A renderer-stub integration exercises the real scene and tour controller, first-frame callback, pause/resume and offscreen state without rebuilding. Bundle-manifest assertions check the lazy boundary and controller budget.

Chromium/WebGL capture is unavailable in this executor: browser startup is blocked by the sandbox. No pixel screenshot or real GPU mobile rendering is claimed. Responsive layout uses a single column below lg, a two-column desktop grid, a stable 8:5 preview, wrapping controls and 44px minimum targets. Hosted visual QA remains necessary; the 2D fallback is deliberately honest when WebGL is unavailable.

Final local checks: 1003/1003 tests passed; production build and TypeScript passed. The final controller is 4,457 bytes raw / 2,093 gzip, and the SVG is 11,647 raw / 2,225 gzip. No deployment performed by the implementation task.

Hosted QA follow-up: corrected the 2D fallback painter order. Perimeter fencing is now a transparent dashed outline, gates are narrow lines, and land uses, roads and structures retain their layers. The fallback was rendered with Inkscape and visually checked at 1000px wide. Kicker and heading use explicit contrast colors to override the shared section CSS. The 3D renderer and camera were not changed by this fix.
The layer/contrast follow-up passed the production build, TypeScript, focused lint (0 warnings/errors), and 1004/1004 full tests. Poster: 11,647 bytes / 2,225 gzip.

Cache follow-up: the current poster URL is content-hashed (`finca-modelo-plan-ab2acb14cfee.svg`), referenced through generated `lib/home-farm-poster.json`. The generator derives the name from SHA-256 and writes the metadata alongside the asset. Existing clients receive a new image URL through the new hashed component bundle; clearing browser caches is unnecessary. The former unversioned file remains only for older clients. The existing build automatically catalogs the new SVG for offline use; no global service-worker policy was changed. Tests verify filename/content integrity, actual component wiring, byte metadata and offline catalog inclusion.
Cache follow-up verification: build and TypeScript passed; focused lint clean; full suite 1005/1005. Offline library contains the hashed asset (11,647 bytes) and remains below its 20 MiB budget.
