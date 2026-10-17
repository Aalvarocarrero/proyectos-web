# Mobile layout correction and audit

7 October 2026. Starting source: deployed v41, d44fba461db9a0d3615a2022a813cfc5c420e426. User screenshot IMG_3111 showed Puntos de coordenadas and Distancias y rumbos cut off at the right edge. The screenshot was inspected before editing.

## Diagnosis and changes

The technical sheet had minimum-width520px tables inside grid items with automatic minimum widths. The grid item expanded to its content, while the outer card clipped it; the inner overflow scroller therefore did not provide the expected useful viewport. Empty-state text also inherited the wide table. Mobile now uses labelled record cards with all four values. At sm and wider, comparable tables remain inside bounded, keyboard-focusable horizontal scrollers. Empty states wrap without a table. Grid children and long technical values can shrink and wrap.

The broader component audit found and corrected:
- Accessibility panel positioned outside a small viewport: now uses existing Radix collision-aware Popover, bounded width/height, keyboard dismissal/focus behavior and pressed-state semantics.
- Farm settings/onboarding area+unit controls crowded by sidebar and nested grids: controls now share a full-width row with proportional tracks. Settings and store date controls have explicit intrinsic-width constraints.
- Polygon toolbar labels overflow in narrow nested editors: wrapping actions and44px minimum targets; numeric inputs use mobile16px text. No geometry/persistence schema change.
- Long marketplace and professional strings, prices and filenames: shrinkable/wrapping containers; filename field can grow. Category controls wrap and expose selected state.
- Existing close icons:44px hit targets with header and direct-title clearance. Store footer reserves space above its higher fixed request control; other public footers clear the lower orbs.
- Distribution-map touch behavior: default mode permits vertical page scrolling and selection. Explicit Mover elementos del plano enables drag/pan. Keyboard changes require that mode. Taps/no movement do not save; pointer identity, cancellation, lost capture, repeated release and pending save are guarded. True storage failures show an error and restore the preview. Successful durable local saves are separated from background refresh/sync so a later network failure cannot misleadingly roll back the displayed position.

## Audit matrix

Widths320/375/390/768 were evaluated against the actual component breakpoints, spacing and intrinsic-width constraints. These are source/SSR and event-handler checks, NOT measured browser screenshots or physical-device passes.

| Surface | Controls reviewed | Result and evidence | Remaining device check |
|---|---|---|---|
| Technical farm sheet | Coordinates, segments, empty state, long labels, metrics | Corrected; SSR retains every mobile and desktop field; bounded scroller | Actual horizontal touch at tablet widths; large text |
| Farm settings/onboarding | Shape, surface/unit, survey rows, inspection date | Corrected source constraints; existing geometry tests | Safari date picker/keyboard at320–768 |
| Animals, weights, areas, production, inventory, money, health | Forms, categories, date fields, Save/close/retry | Existing synchronous form gates retained; regression suite | Native picker rendering, keyboard-open Save reachability |
| Polygon editor and farm map | Point list/actions, taps, drag, cancel, secondary pointer, keyboard | Polygon regressions retained;5 new actual map-handler tests | Real touch scrolling and drag performance |
| Offline readiness, backup/import | Long origin strings, action rows, explicit statuses | Read-only audit found wrapping controls; storage/import tests retained | Native file chooser and low-space device |
| Header/navigation/accessibility | Menu positioning, options, focus/close | Accessibility corrected with existing primitive | Collision placement and enlarged text in browser |
| Store | Categories, presentations, units/quantity, cart, business date, request sheet | Date/close/footer constraints corrected; existing cart tests retained | Keyboard-open sheet and actual date control |
| Marketplace/detail/publication | Categories, long data, price, photo filename, portal selects | Corrected; source/SSR checks | Radix collision/focus and real long-option display |
| Professionals/company profiles | Search/filter/cards/detail/forms | Long-data wrapping corrected; profile validation tests retained | Long company names and open dialog |
| Public Fincas/Red | Filters, cards, profile/post/comment controls | Source review; no new definite width defect | Mobile interaction and keyboard flow |
| Aprende/projects/rubros/institutional/about/legal/home | Navigation, guide links, cards, footer | Source review; existing route/render tests | Representative narrow-width visual review |
| Shared dialogs/sheets/selects | Bounded height, scrolling, portal stacking, close targets | Existing z130 menu over z111 dialogs retained; width/target safeguards | Safari keyboard, touch, Escape/focus restoration |

Unused primitives are not represented as tested live features. No real records, submissions, customer messages, auth, CSP or permission settings were changed. The held image/decoder work remains excluded; only the existing file-picker label layout changed.

## Verification

New tests: tests/mobile-layout.test.mjs (SSR/source layout contracts) and tests/farm-map-gestures.test.mjs (actual component handlers with synthetic fixtures). Existing offline/form/geometry/route coverage runs in the full suite. Build updates the offline fingerprint so reconnecting and preparing the current app obtains the new code. Exact aggregate results are reported with deployment, not inferred from static review.

Real iPhone/iPad/Android rendering, native date/select UI and virtual-keyboard behavior remain unverified in this environment. No claim of universal device or100% mobile correctness is made. After online update, review the two technical sections, open accessibility, select dates/categories, move/cancel an area, and retry prepared offline use on the physical device.
