# Aeterna content administration

Local implementation for the current cinematic Sites project `appgprj_6ac86aeb3dd48191ae3e9bb8b2576156`. No hosted source, audience, environment, database, bucket, credentials or publication was changed.

## Included

- `/admin`: responsive dark Aeterna editor with section navigation, unsaved-change protection, image thumbnails and explicit publish confirmation.
- 75 controlled fields: existing homepage copy, all nine existing services (title, summary and detail), portfolio and menu presentation, SEO/social metadata, five image/alt pairs. Original values come directly from the approved site. No services, prices, claims or contact destinations were invented.
- D1 persisted draft and published snapshots, strict full-field validation, atomic optimistic concurrency (CAS) and audit revisions. Existing eleven-field snapshots receive only the newly added default fields at read/restore time.
- Private authenticated draft preview at `/?content-preview=1`; public home only reads the published snapshot. Relative assets retain their original root resolution. Public data failures serve the preserved original homepage.
- History lists the latest 50 revisions. Restore creates a new audited draft revision and never changes the public snapshot. The baseline can be restored as version zero. Stale saves, publications and restorations are rejected with HTTP 409.
- Existing image selection plus binary uploads to R2. Uploads require a valid static PNG/JPEG/WebP signature, matching MIME, dimensions up to 6000 px per side, 24 megapixels and 5 MB. SVG/HTML, animation where detected, invalid magic, missing dimensions and truncation are rejected. This is bounded structural inspection, not a full image decoder or malware scanner.
- Upload metadata lives in D1. A failed metadata insert attempts compensating R2 deletion. Saving/publishing/restoring uploaded references checks both D1 and the R2 object. Orphaned uploads never become public.
- Private media uses authenticated `/api/admin/media/:key`; `/media/:key` serves only images referenced by the current published content. Responses are no-store and nosniff, with sandbox CSP. Public object-store access must remain disabled.
- Portfolio creative-direction cards update their two gallery entries without replacing the original gallery scripts. Image natural dimensions refresh in the browser. The original maternity albums, campaign collection and actual menu pages remain intact.
- All original public assets and pages are byte-for-byte retained. Default homepage rendering is byte-for-byte identical to the original. Existing maternity, booking/quote previews, contact flows, menus, approved dark theme, motion, photos and author credits remain.

This is a controlled content editor, not an arbitrary page builder. It does not add/delete services, reorder layouts, edit prices in menu artwork, replace album sequences, enable the currently disabled booking submissions, or change analytics, contact destinations, access settings or legal copy. Those require separate implementation and review. Uploaded images are selected for presentation fields; no existing originals are deleted.

## Security and deployment boundary

`AETERNA_ADMIN_USER_IDS` must contain exactly one verified, Site-scoped stable ID corresponding to the intended owner, alvarojuniorcarrerovasquez@gmail.com. Do not put the email address, another Site's identity, a guessed ID, a generic account ID, or a second administrator in that setting. No first-visitor bootstrap and no client-provided role or email authorization exists.

`AETERNA_TRUSTED_SITES_DISPATCH=1` is additionally required. This is an operator attestation, not authentication by itself. Set it only after verifying that the supported Sites dispatch strips incoming identity headers and supplies the authenticated ID. Never expose this Worker through a standalone workers.dev URL, custom direct Worker route, or other origin where a visitor can supply `oai-authenticated-user-id`. A standalone deployment needs real verified session/token authentication and is not supported by this implementation. The missing flag and missing/malformed/multiple-owner allowlists fail closed.

All writes require authenticated ownership, same-origin `Origin`, `X-Content-Admin: 1`, request size limits, and typed JSON or a validated image payload. Identity checks occur before storage reads. Rendered text and attributes are escaped; gallery data escapes `<` before HTML embedding. Secrets or owner IDs are never included in client code.

## Local validation

- `npm run test:content`: 27 passing tests, using real in-memory SQLite plus a local R2 test double. Covers original byte preservation, every editable field, exact identity/trust boundary, escaping, CAS, concurrent first writers, old-state compatibility, history/restore, upload privacy, missing objects, cleanup, request limits, gallery synchronization and UI controls.
- `npx tsc --noEmit`: passes.
- `npm run build`: production Vinext build passes with all five Worker routes and retained Sites integration.
- `tests/runtime-smoke.mjs`: passed against the compiled Worker using isolated real local D1/R2, including public routes, anonymous/non-owner denial, save/reload, private preview, CAS, upload privacy, publish and draft-only restoration. The synthetic fixture identity is loopback-only and never a production administrator. A reusable `npm run test:runtime` wrapper is included; its repeat run could not be confirmed because the tool approval review was cancelled when polling its process. That cancelled verification was not retried.
- Cloud Chromium visual/E2E launch is blocked by the environment's Unix-socket restriction (`socket() failed: Operation not permitted`). No bypass or escalation was attempted. Actual desktop/mobile browser rendering and hosted dispatch remain activation checks, not verified claims.

## Exact activation checklist

1. Review the source change and generated migrations; retain a rollback copy of the current cinematic Site, source and any existing content.
2. Verify the owner’s email-to-this-Site authenticated-ID mapping through an approved Sites session. Obtain the exact ID; do not infer it from other projects or accounts.
3. Under the necessary authorization, activate the `DB` D1 and private `BUCKET` R2 bindings for this exact project. Apply `0000_rapid_spacker_dave.sql` only if absent, then additive `0001_organic_jocasta.sql`. Preserve existing data. The committed hosting manifest proposes the bindings; no remote provisioning has occurred.
4. Verify the trusted Sites ingress boundary, then configure the single-owner `AETERNA_ADMIN_USER_IDS` JSON array and `AETERNA_TRUSTED_SITES_DISPATCH=1`. Do not provision credentials or expand audience as part of this without approval.
5. Deploy an authorized private version of this exact current project, preserving its audience and existing published version. Verify real anonymous/non-owner denial, owner authentication, no direct untrusted origin, D1 save/reload, two-tab stale-write conflicts, media privacy and upload validation.
6. Complete actual desktop/mobile visual QA, gallery dimensions, portfolio cards, menus, maternity, booking/quote previews and inquiry links. Test baseline/history restore and confirm it leaves public content unchanged until publication.
7. Publish only after approval of the preview and any binding/access changes. Retain the previous deployment for rollback. Restoring CMS content is draft-only; reverting deployed code is a separate operation.
