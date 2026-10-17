# Aerial-only automatic tour

## Scope

The demonstration starts with the entire farm and runs only an aerial orbit with broad, smooth lateral approaches. Barn interiors are separate, explicit cutaway controls. Closing inspection restores the previous aerial view. Nothing changes farm records or saved animal positions.

## Audit

- `FarmShowcase` is the only component enabling `autoTour`; it no longer owns a cinematic-mode state.
- `FarmMasterplanWebGL` always constructs the controller in aerial mode, with no shot route. Legacy cinematic props/API values cannot enable an interior itinerary, including after a rebuild, resize, pause or resume.
- The previous version already defaulted to aerial. It nevertheless still constructed and supplied the barn-entry sequence and retained a selected cinematic mode across renderer reconstruction. This audit does not establish which state the user's browser had when the reported entry happened.
- `FarmMapEditor` does not enable automatic flight. The vector fallback has no automatic camera controller.
- No tour mode is stored in localStorage or IndexedDB. The service worker uses network-first document navigation and hashed script URLs. Browser cache state was not inspected; it is not asserted as the cause.

## Camera envelope

The minimum flight height measures every scene mesh and every instanced transform, including crops, roofs, exterior terrain and trees, rather than relying only on selected collision tags. Clearance is at least four scene-scaled metres above the highest geometry and eighteen metres above the base. The envelope is refreshed after local model loading and never decreases during cutaways or LOD changes.

Opening framing satisfies that envelope. Joining and orbit interpolation preserve it even with no focus subjects. Automatic playback from a manually lowered camera fails closed instead of executing a lateral escape through a barn. “Ver toda” / “Vista aérea” provide the explicit reset. Interior buttons suspend automatic movement until inspection closes.

## Regression coverage

`farm-immersive-review.test.mjs` constructs the actual scene and controller around the 101-animal showcase fixture. It independently measures all mesh/instance bounds and checks the post-OrbitControls camera for three complete revolutions across phone, desktop and narrow-phone layouts, including repeated pause/resume and resize. It supplies the old cinematic mode deliberately, verifies closed roofs and unchanged records, and checks explicit cutaway/exit behavior.

The harness uses real Three.js geometry/camera/controls with a renderer stub. It establishes trajectories and controller wiring, not visual pixel quality in a physical browser. No deployment is included in this change.
