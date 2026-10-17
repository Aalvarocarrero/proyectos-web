# Finca Escuela: private learning preview

## Scope and integration

- Based on `54b7897` (v114 checkout); isolated `feat/farm-learning-preview` worktree.
- Adds `/juego-finca`, an iframe wrapper, and `/learning/finca-escuela.html`, the standalone playable document.
- No changes to home, maps, authentication, account data, production farm records, service worker, domains or sharing.
- The current self-contained HTML is approximately 105 KB (the first preview was approximately 67 KB). All artwork is original inline SVG, styles and logic are inline. No new dependency, remote font, third-party media, analytics, or fetch.
- The existing public-library generator does not ingest this HTML. This does not imply the game is part of the existing PWA offline pack.

## Learning flow

Seven validated actions: prepare soil, sow cilantro, gentle watering, light/growth, observe damp soil before watering again, harvest, and record three fictional bunches. Incorrect choices explain and allow retry without score penalties. No real-time countdown, purchase, adverts, or external account. Explore/deepen modes change detail without asking the learner’s age.

The illustrated cattle pathway is explicitly informational and unavailable as a full game. It does not provide drugs, dosage or vaccine schedules. Adult supervision and professional local review are stated.

The harvest notebook is visibly fictional and kept separate from real Mi Finca records. Its bounded fields are quantity/unit/destination, with no names, contact information, school, age, location or free text. Persistence is an allowlisted state saved to a game-only browser storage key; failed writes are disclosed. There is no cloud synchronization.

## Offline contract

“Llevar sin internet” creates a self-contained HTML download containing the current allowlisted progress. A copy-specific local key keeps the downloaded game’s progress separate. All dialogs are closed in the exported file. The game checks persistence failure and offers another downloaded copy.

The UI says download preparation does not establish that the browser saved the file. The user must verify that the file opens in a compatible browser before going offline. Some mobile file viewers do not execute HTML. No claim is made that the game is already installed, cached for repeat navigation, or universally playable from mobile file viewers.

## Source and license review (14 October 2026)

Reviewed repository snapshots:

1. Masahiro Sakuta, `msakuta/farmsim`, branch `no-pixi`, commit `645d6d63e93512bc24bfb5af890c687f8caf4812`.
   - [Repository](https://github.com/msakuta/farmsim)
   - [MIT license](https://github.com/msakuta/farmsim/blob/645d6d63e93512bc24bfb5af890c687f8caf4812/LICENSE), copyright 2014, 2018 Masahiro Sakuta. It permits reuse subject to retaining the copyright and permission notices.
   - [FarmGame.js](https://github.com/msakuta/farmsim/blob/645d6d63e93512bc24bfb5af890c687f8caf4812/FarmGame.js): useful general ideas include per-cell soil/crop state, stage-based harvest checks, hydration, serializing progress and separating state from rendering.
   - The tree has a single root LICENSE and no separate asset credit/provenance manifest. `assets/` contains plant stages, soil, tools and weather PNGs. A root MIT license is present; third-party origin and per-image rights were not independently established. We do not claim the assets are unlicensed, only that provenance has not been established for this reuse review.
   - Older global JavaScript architecture and bundled legacy i18next/Pixi files are unnecessary for this small modern preview. Its numeric gardening model is not treated as agronomic authority.
2. Elliot Fontaine, `elliotfontaine/untitled-farming-sim` (Seasons Gone), main commit `c509cab1614eab245e5bc7a4c27034cfa318f7e8`.
   - [Repository](https://github.com/elliotfontaine/untitled-farming-sim)
   - [MIT license](https://github.com/elliotfontaine/untitled-farming-sim/blob/c509cab1614eab245e5bc7a4c27034cfa318f7e8/LICENSE), copyright 2023 Elliot Fontaine, with notice-retention condition.
   - [crop.gd](https://github.com/elliotfontaine/untitled-farming-sim/blob/c509cab1614eab245e5bc7a4c27034cfa318f7e8/crops/crop.gd): visual stages, plant-family information and maturity indicators are useful conceptual references. Harvest contains unfinished `pass` placeholders in this snapshot.
   - Godot 4/GDScript requires a separate engine/export integration; adopting it adds unnecessary weight for this standalone educational cycle.
   - Repository includes named cow sprites, Kenney Pixel font, player sprites, music and sound assets. Inspected `common/assets/README.md`, `common/assets/tracks/README.md` and `ui/assets/README.md` explain organization or future needs, without a complete origin/rights manifest. The tree also has a separate add-on LICENSE for Panku Console.
   - No inference that root MIT conclusively clears every external-looking asset. Individual source/attribution must be verified before any future reuse.

Decision: both codebases have permissive MIT licenses, but neither is necessary to deliver this lightweight accessible preview. We created original code and SVG artwork from scratch, informed only by general farming-game concepts. No code, sprites, music, fonts or sounds from either repository were copied or distributed. Therefore the prototype does not include their licenses as if their code were incorporated. Any later actual reuse must preserve notices and review relevant asset licenses first.

## Educational source

[Utah State University Extension: Cilantro/Coriander in the Garden](https://extension.usu.edu/yardandgarden/research/cilantro-coriander-in-the-garden), by Colt Miller and Dan Drost, published August 2018; consulted 14 October 2026. General principles used: drainage, appropriate moisture, light, growth and leaf harvest. The prototype does not apply Utah seasonal dates, fertilizer quantities, pesticide instructions or exact crop timelines to Venezuela. Climate, variety, local conditions and professional review remain important. Text is an original concise Spanish educational adaptation, not copied guidance.

## Development and verification

Source files:
- `lib/farm-learning-engine.mjs`: pure validated state machine and local-save contract
- `learning/farm-learning.template.html`: original illustration and responsive layout
- `learning/farm-learning-ui.js`: DOM interactions and offline download
- `scripts/build-farm-learning.mjs`: generates the self-contained public artifact
- `tests/farm-learning.test.mjs`: acceptance, misuse, persistence, privacy, self-contained output and safety tests

Regenerate with `node scripts/build-farm-learning.mjs`. The focused test compares generated and committed HTML byte-for-byte, preventing drift. Check with `node --test tests/farm-learning.test.mjs`, `tsc --noEmit`, and the normal project build/tests.

The first preview was browser-tested end to end on private v116: the full cilantro cycle, incorrect choices, record validation, save/reload, navigation, dialogs and both actual downloads passed. Overlay and milestone-icon issues found during QA were corrected and rechecked. Physical mobile and downloaded-file offline reopening were not tested. The second preview requires new hosted QA after integration; its responsive review harness supports narrow CSS layout checks, not physical-device claims.

## Second educational preview: 14 October 2026

The approved farm perspective and original illustration are preserved. Added a current-goal strip, seven-step mission overview, two-level contextual hints, direct relevant-tool actions, a mobile shortcut to the mission, and a plain-language glossary. All actions are buttons or labelled fields; no dragging, speed test or custom shortcut is required.

Three new hands-on challenges:

1. Detective del suelo: inspect two labelled soil examples before deciding. Decisions remain disabled until inspection; dry-below-surface and still-moist examples require different responses. The UI states that color alone is not a moisture measurement and that real watering depends on plant stage, soil, drainage and weather. No quantities or calendar are prescribed.
2. Espacio para crecer: place/remove three seeds across seven numbered positions, then test spacing. Every placement is reversible. The empty-position rule is explicitly a schematic puzzle, not a real planting distance. Real spacing depends on the crop/variety; pulling real seedlings is not taught.
3. Mirar y avisar: observe water, shade and the closed gate from outside a fictitious cattle enclosure, then choose a safe next action. The recorded learning fact is “Bebedero vacío”; no diagnosis or treatment is inferred. Children are directed to stay accompanied and notify the responsible adult. The full cattle pathway remains in preparation.

The notebook adds a recap of explored challenges. Replaying a challenge keeps its explored status but repeats the actual interaction; replaying the cilantro cycle does not erase challenges. The app does not award expert qualifications, certificates or assessment claims.

### Progress migration

Schema version 2 uses a new `venezuela-agro-learning-v2` storage key. It reads and validates old v1 saves if a usable v2 save is absent, preserving the previous crop stage, mode and fictional record. Migration never overwrites the original v1 key. Downloaded copies use the same allowlisted state and copy-specific storage suffix. No personal fields were added.

### Additional educational sources

- [Oregon State University Extension: Watering Basics](https://extension.oregonstate.edu/imported-publication/watering-basics): inspect moisture below the surface; needs differ with conditions. No local planting season or numeric dose is transferred.
- [University of Minnesota Extension: Starting seeds indoors](https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/starting-seeds-indoors): seedlings need appropriate room; crop-specific guidance matters. The puzzle is not a universal sowing prescription.
- [WOAH: Animal welfare and beef cattle production systems, chapter 7.9](https://www.woah.org/fileadmin/Home/eng/Health_standards/tahc/current/chapitre_aw_beef_cattle.pdf): general welfare basis for access to water, heat protection and observation. The retrieved edition was 2022; this is not presented as the latest Venezuelan law, a clinical guide or a vaccination program.

All teaching copy and artwork are original. Minor-supervision framing is a conservative product-safety choice, not a direct quotation of these sources.

### Responsive QA harness

`public/learning/revision-responsive.html` is an unlinked noindex review page with fixed same-origin iframe widths of 390, 768 and 1180 CSS pixels. It enables real narrow-layout checks through the available cloud browser without modifying the browser or other tabs. It is not hardware/touch emulation and not evidence of physical-device or offline file support.

## Visible crops and animals expansion (15 October 2026)

The original cilantro perspective and seven-step cycle are preserved. A new initial hub and four always-visible navigation choices expose Cultivos and Animales. Six selectable species lead to working activities: cilantro, maize, tomato, bovines, pigs and poultry. The five added modules are explicitly three-step educational activities, not full production cycles or professional qualifications.

### New factual sources and scope

- University of Maryland Extension, [Growing Sweet Corn](https://www.extension.umd.edu/resource/growing-sweet-corn-home-garden): wind pollination and grouped plantings. The six-position 2×3/3×2 puzzle is an original schematic comparison, not a real spacing/density recommendation. No yield or calendar predictions are derived from it.
- University of Minnesota Extension, [Trellises and cages](https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/trellises-and-cages): supports matched to plant growth. The tomato example is explicitly continuous-growing; support installation belongs to responsible adults.
- University of Minnesota Extension, [Growing tomatoes](https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-tomatoes): harvest considers usable size/color; varieties and intended use differ. The game labels two illustrated fruits as ready, defines its red-fruited example, and states red is not universal. Counted fruits are not converted to kilograms.
- WOAH, [Animal welfare in dairy cattle systems, 2024 edition](https://www.woah.org/fileadmin/Home/eng/Health_standards/tahc/2024/en_chapitre_aw_dairy_cattle.htm), plus the prior beef-cattle welfare reference: adequate water and protection from heat. New bovine activity distinguishes seeing shade from being able to access it and factual observations from diagnosis. No production figures or dairy-specific requirements are applied to all bovines.
- WOAH, [Animal welfare and pig production](https://www.woah.org/fileadmin/Home/eng/Health_standards/tahc/current/en_chapitre_aw_pigs.htm), particularly7.13.9–12: water/thermal environment and opportunities for exploratory/rooting behavior. The game uses a virtual resource plan; no particular real enrichment material, food waste, handling method, water dose or universal housing dimension is recommended.
- USDA APHIS, [Control What Comes In](https://www.aphis.usda.gov/livestock-poultry-disease/avian/defend-the-flock/biosecurity-basics/control-what-comes), and CDC, [Backyard Poultry](https://www.cdc.gov/healthy-pets/about/backyard-poultry.html): hygiene and respecting access rules. The visit-order puzzle uses adult accompaniment and observation only, no kissing/touching animals, eating/drinking in animal areas, disinfectant use or handling sick animals. Egg counting is an original visual numeracy exercise, not real handling or a claim that an egg is safe to consume.

All wording and vector scenes are original. The sources support general educational principles, not approval of the game. Conditions in Venezuela require appropriate local adult/technical guidance; no regional dates, doses, treatment schedules or crop distances are generalized from these sources.

### State and privacy

Schema3 writes only `venezuela-agro-learning-v3`; it reads valid v3, then v2, then v1, leaving earlier keys untouched. Crop progress, detail mode, the simulated cilantro record and all original challenges migrate. Each added module has allowlisted progress and an explored flag. Replaying one module resets only its activity, retaining its explored flag and leaving every other module/crop unchanged. Crop reset leaves modules unchanged. No names, ages, contacts, account linkage, analytics or network writes are collected. Offline export uses `restoreGame` to strip unknown fields.

### Verification targets

Automated cases cover all five complete paths, wrong and out-of-order actions, repeat presses, each module's gates, all924 six-position maize arrangements (seven valid compact rectangles), independent replay, v1/v2 migration and corrupted-data filtering. Final hosted QA should exercise every module, resume through reload and navigation, inspect a fresh v3 download, and verify the real390px CSS frame. Physical touch hardware and file:// offline reopening remain separate from the cloud browser's available checks.
