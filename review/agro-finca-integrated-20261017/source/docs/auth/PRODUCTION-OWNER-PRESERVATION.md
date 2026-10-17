# Preserve the activated production owner

Coordinator-verified state on2026-10-15 after real Google login, D1 identity verification and direct user approval in the Mac task:

- Active owner configuration version: `d7804fcb-59f9-4252-94d1-02bbc8af7ad2`
- OWNER_ADMIN_EMAIL: `alvarojuniorcarrerovasquez@gmail.com`
- OWNER_GOOGLE_SUBJECT: `113186509837584939227`
- Internal user UUID: `06917f08-baaf-4677-8e50-3b791b263cf3` (not a replacement for the Google subject)
- Owner panel/API opened successfully; anonymous API requests returned401.

These are approved identifiers, not credentials. Future local production and promotion configs must preserve the exact email AND verified subject. Staging remains independently fail-closed with no grant. Never infer identity from first login, a Sites ID or an email match alone.

Canonical tracked configurations are `wrangler.production.jsonc` for source builds and `deployment/wrangler.promotion.json` for deploy-only output. After a matching production build, `node scripts/stage-production-config.mjs` stages the reviewed compiled config locally and asserts the owner pair. It does not invoke deployment. Copy no configuration from an old archive. Generate artifact hashes only after staging the final reviewed config.

Keep `--keep-vars` with the pinned reviewed Wrangler behavior so the SAME Worker's existing encrypted credential bindings are preserved. GOOGLE_CLIENT_ID is still stored remotely as secret_text and must remain omitted from plain vars, along with GOOGLE_CLIENT_SECRET, AUTH_SESSION_SECRET and TURNSTILE_SECRET_KEY. No secret values belong in source, archive, chat or logs. This configuration update makes no remote changes.

## Obsolete bundles: never re-upload unchanged

All prior deploy-only archives through `agro-mobile-deploy-c213657.tar.gz` explicitly contain blank OWNER_* vars. They would revoke the activated administration if re-uploaded. This includes the804bf70 promotion package and2d1a105, e50dc78,4082eb9 andc213657 patch packages. Their binaries and tests remain historical evidence; their deployment configs are obsolete. Do not use their promotion scripts for another upload or treat their owner-disabled verification scripts as current.

Existing Library files are immutable historical deliveries; no user files were deleted or silently replaced. A separately reviewed new artifact must include this owner-preserving configuration before deployment. Always record the actual current version and bindings before a future authorized upload. Rollback to older code can restore an older binding snapshot, potentially losing both the corrected Turnstile secret and this owner grant; coordinate rollback rather than selecting an old version blindly. Never retrieve or retransmit secret values to reconcile it.
