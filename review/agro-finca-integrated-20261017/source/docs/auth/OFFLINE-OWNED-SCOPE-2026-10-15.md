# Offline scope: common tools, owned records and optional references

User direction2026-10-15: downloading offline tools must not also download growing Mercado/Comunidad/directories of other users. This patch follows2d1a105 and does not deploy, change credentials, or purge user data.

## Actual prior behavior

The core already downloaded only built application resources and neutral HTML, not API responses. The optional library also fetched `/api/offline-public`: up to100 text summaries for each of five public kinds (500 total,2MB maximum) into a browser-wide IndexedDB snapshot, then refreshed it on opening/reconnection. Mercado, Comunidad/Fincas and Profesionales separately persisted broad browsing results in localStorage. Those automatic feed caches exceeded the new scope.

## Corrected behavior

- Core: common app code, essential images/map references and neutral offline HTML.
- Account data: private `/api/bootstrap` remains no-store. It selects only the server-authenticated owner's farms, farm records, listings, professional profiles, projects, public-farm profiles, posts and comments. Hydration validates returned owner and writes to that account's IndexedDB namespace, retaining pending local changes. No private API response enters CacheStorage.
- Optional library: static site references, built-in guides and images only. It neither reads nor refreshes the historical feed snapshot and never requests `/api/offline-public` during preparation/open/reconnection.
- Browsing third-party feeds: live online results stay in memory only. On offline transitions real listings/posts/directory rows are hidden, with connection-required messaging. Clearly marked bundled demonstrations remain available.
- Existing bookmarked IDs are retained; they are references, not downloaded listing bodies/photos. No new individual-item offline saving feature is claimed. Historical auto-snapshots are left untouched but no longer read or refreshed; public cleanup remains an explicit user-confirmed operation. No private database reset or automatic deletion occurs.
- Own marketplace listings/borradors remain usable in Mi Finca. Own social/publication records are stored by account, but the full social interface and remote photos are not promised offline. Publish/sync/current availability still require connectivity and verified ownership.

## Size accounting

`scripts/measure-offline-scope.mjs` measures built manifests without reading private data or making network calls. On the prior2d1a105 build:

- Core known files7,997,376bytes (7.63MiB), plus5 unmeasured HTML documents.
- Optional library known files20,476,827bytes (19.53MiB),13 HTML pages.
- Shared known bytes7,995,642; extra library known bytes12,481,185 (11.90MiB).
- Combined unique known bytes20,478,561, not the sum of both package totals.

These are uncompressed logical bytes, not a promise of network transfer or physical browser storage: compression, reused files and separate CacheStorage caches affect actual usage. Account record size varies with the user's own data and is excluded. Final release measurements must come from its matching build.

## Separate login diagnostic refinement

The prior `provider_unavailable` category combined non2xx HTTP with Siteverify's explicit internal-error. The patch splits fixed HTTP400/401/403/429/5xx/other categories from `provider_internal_error`. No provider payload, exception, token or secret is surfaced. Exact success, hostname and action checks remain unchanged. This gathers evidence, not a claimed fix for live Turnstile failure. No speculative Content-Type change is made.

## Open-tab account boundary

Mi Finca retains the original workspace component and its form state when a logout/session boundary is observed from another tab, on focus, or on visibility restoration. The old account view is hidden and inert. Late local reads check both captured owner and session-boundary generation before updating rendered arrays; background synchronization does not start while the view is blocked. Device-local practice remains independent.

A user with an unsaved form must keep this tab open, sign in to the original account in a new tab, then explicitly recheck here. Only a fresh no-store server response identifying that original owner, with no concurrent boundary change, can restore the view. A different account cannot unlock it. This does not encrypt browser storage or replace server ownership checks. Device access remains important, and unsaved in-memory forms have no durable backup until saved.

The same retained-view boundary covers signed-in Comunidad views and their pending publications; anonymous browsing remains available. Component tests cover the boundary, delayed responses, owner namespace restoration and modal handler behavior. A real Chromium focus/pointer test could not launch in the preparation environment (`socket() EPERM`), so cross-tab modal interaction remains a required Mac check, not a claimed browser pass.
