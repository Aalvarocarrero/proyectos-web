# Approved v131 brand actions for production

Source f6b3b5ec1757702dcdc4f743df522faf6a8f5a1f ports the exact four-file UI patch from approved Sites v131 e50c0272ede42a784cc071a2112b668d73e47e3f onto deployed production source 724c5ca. WhatsApp is green; Explorar is cream/olive. The shared bar applies to mobile and desktop. Existing navigation, install focus, social destinations and collision protection are retained. No preview backend or config was copied.

Production owner pair, auth implementation, D1/R2 and secret names are unchanged. The compiled promotion config is byte-identical to the approved 724c5ca artifact. The included verifier checks every dist file and exact owner/resource values. Deployment wrapper preserves remote secret bindings with --keep-vars. Do not use old blank-owner bundles. No migrations are required.

## Status
Production and default builds, TypeScript, 28 targeted UI tests, 11 targeted UI/auth/owner tests, owner-preserving packaging, compiled production smoke and Wrangler dry-run passed. Local smoke uses synthetic ephemeral D1 and disabled outbound providers; compatibility is locally overridden to 2026-05-22, while production artifact remains 2026-10-14. This is not a live Google/Turnstile test or new real-browser review.

Lint reports a pre-existing set-state-in-effect error at components/mobile-public-actions.tsx:21 and 50 warnings. Full-suite results are recorded in release.json and attached logs. No source was changed to conceal existing failures.

## Later authorized deployment
From a clean extracted artifact with Node 22+ and the appropriate approved account, use bash deployment/promotion.sh dry-run before bash deployment/promotion.sh deploy. Do not deploy until authorized. Recheck current production version and owner/resource bindings immediately before upload. Never insert secret values or env files into the bundle. Verify public pages, shared action bar, anonymous admin denial and authenticated owner access after release. Rollback must retain corrected secrets and active owner pair.

Full suite on its expected Sites build: 1319 passed, 1 pre-existing stale admin layout regex failed. The unchanged baseline reproduces this mismatch because MobilePublicActions is already in the layout. The production-build suite also had 10 fixture-environment render failures; these all passed against the default build.

## Secret-free GitHub packaging

The two dist/server[/ssr]/vinext-server.json build-only Node prerender authentication metadata files are deliberately excluded. They are not referenced by emitted Worker modules and are not included by the approved Wrangler module rules. All Worker JS/MJS, all 740 client assets, and runtime Wrangler configurations remain byte-identical to the approved f6b3b5e release. The dist hash manifest excludes these two metadata files, and the verifier rejects their presence. No secret values are included. The original approved archive is retained unchanged locally.
