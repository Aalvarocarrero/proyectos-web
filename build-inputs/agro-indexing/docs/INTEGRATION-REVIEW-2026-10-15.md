# Integrated Agro changes · 2026-10-15

## Source and scope

Isolated integration branch `integrate-agro-verified`, based on main `84a36492ed121ae7ee36c8f428bf1e2af12c8147`. No edits to the main or staging worktrees. Original changesets:

- `bd41dea17b063f62cc78ce1cc2fa2367e821cf9e`: 76 downloadable stickers, including 18 new animals, crops and tools.
- `e6cceb03b0cf1f4e6490e619b83ca96cf6c10ed2`: 13 platform guides with 65 explicitly identified teaching schematics; these are not videos or application screenshots.
- `29ae439fa323dd30dc10952540cd8aaec7a61e9a`: six educational cycles (cilantro, maize, tomato, bovine dairy, pigs and laying hens). Species listings beyond these are illustrative, non-exhaustive catalog entries, not additional playable cycles.
- `fb6e3b0`: protected homepage content administration, media and additive storage schema.

All four cherry-picks applied without conflicts. Site identity, hosting bindings, administrative identities, source branding and baseline public UX configuration remain unchanged. The existing homepage renderer was extracted without unrelated layout changes; original strings and hero image are its fallback defaults.

## Behavioral review

- Finca Escuela retains old saved stages and achievements; newly extended cycles have independent progress so old short activities are not represented as completed long cycles. The engine tests run all interactive phases, wrong choices, reloads, completion and independent replay. The self-contained HTML is generated from matching source.
- Sticker asset tests inspect actual PNG transparency/dimensions and ZIP member bytes, CRCs and hashes. Sticker packs are separate downloads and remain excluded from the offline library.
- CMS endpoints retain the existing admin identity checks, reject cross-site mutations, validate bounded strict payloads, and use revision compare-and-swap for save and publication. The publication action copies only a saved draft. Anonymous access cannot retrieve draft or superseded images; public rendering falls back safely during missing schema or storage outages.
- CMS scope is only homepage hero text and button labels, Mi Finca introduction, hero image and SEO title/description. Navigation, destination URLs, articles and other sections are not general-purpose CMS fields. No version history, one-click rollback, media cleanup or full-site CMS is provided.
- CMS-uploaded images remain online resources. Offline text can reflect the last downloaded homepage snapshot, while the original bundled image remains in the pack. Custom CMS image download is not implemented.

## Deployment and verification limits

No Sites save/deploy calls, credentials, remote migrations or production content mutations were made during integration. Local tests do not establish live administrator authentication, D1/R2 bindings or browser layout. Supported preview and hosted mobile/desktop checks remain necessary; no browser workaround was used. Published database articles may override bundled guide prose and require a hosted comparison before declaring those guide texts current.

The CMS migration is `0008_wild_sinister_six.sql`. The independent staging/auth worktree has `0008_even_blue_shield.sql` (and its own preceding migration history). This numbering/journal divergence must be reconciled deliberately if those branches are later combined; neither branch's migrations were renumbered or merged here. Do not treat this integration as including staging/auth work.

## Integrated regression correction

The first full run passed 1,180 of 1,181 tests. Its only failure was an obsolete rendered-guide assertion for the words “cada cinco minutos”. The refreshed guide correctly says synchronization runs periodically while open. Source review confirms `OfflineSyncManager` still attempts sync on online/visibility events and every five minutes; this integration does not change that behavior. The rendered-page check now asserts the current local-first, periodic-attempt, pending/conflict/confirmation guidance and the warning that connectivity or zero pending operations does not prove a central backup. Existing executable sync receipt tests continue to verify that only valid acknowledgements confirm operations and failures preserve pending writes.

## Final integrated verification

Run serially after the feature workers finished:

- `node_modules/.bin/tsc --noEmit`: exit 0.
- `npm run build`: exit 0, all Vinext build phases complete, followed by offline manifest generation. The earlier isolated Finca SSR build failure is superseded by this successful integrated build.
- `node --test --test-concurrency=1 tests/*.test.mjs`: 1,181 passed, 0 failed, 0 skipped, including the dist-dependent rendered routes, after the regression correction above.
- `git diff --check`: clean.

The final build's offline library is 20,458,200 bytes across 477 assets, within 20,971,520 bytes (20 MiB), with 513,320 bytes remaining. All 65 guide SVGs are included (108,832 bytes). No sticker-pack assets or CMS API media appear in this manifest. Offline revision: `morochos-v261515025316512`.

Only tests and this document changed after the successful application build. Built output is in the integration checkout's `dist/`; serial check logs and artifact checksums are in the sibling `agro-integrated-evidence/` folder. There is no remotely saved or deployed version of this integrated commit as part of this task.
