# Production offline/login correction,2026-10-15

Base804bf70. This patch does not deploy or change any remote binding, credential, domain or database.

## Offline root causes and boundaries

The production allowlist omitted the generated `/offline-library-assets.json`, redirecting anonymous library preparation to login. Only this exact pathname is added for GET/HEAD. The manifest contains public resource paths, byte counts and build revision, no account data. Arbitrary JSON, similarly named subpaths, APIs, mutations and private staging remain protected.

`/aprende` reads published knowledge and uses framework force-dynamic, which emits `no-store, must-revalidate`. The worker previously normalized only the published homepage. `/aprende` is optional precache, so its failure alone does not prevent core readiness, but it cannot be saved. The worker now normalizes only audited account-neutral, query-free GET/HEAD HTML200 responses to `public, no-cache, must-revalidate`. Explicit private, Set-Cookie, Cookie/Authorization/wildcard Vary, errors, redirects, APIs and RSC are never relaxed. Service worker cache rejection remains intact.

The compiled smoke checks the public manifest and its entire generated asset list, plus all library HTML, optional /aprende and required offline HTML, with anonymous and owner cookies. Existing private reads, ordinary-vs-owner administration, CSRF, expired sessions and spoofed headers remain covered.

## Login diagnosis

A visible successful Turnstile widget does not prove backend Siteverify acceptance. The original verifier collapsed missing/expired/reused tokens, provider errors, host/action mismatch and transport failure into `challenge_rejected`. Frontend action=login and server hostname/action checks align. Credential mismatch remains a possibility, not an established cause. The companion change exposes only allowlisted diagnostic categories and preserves exact hostname/action and fail-closed verification. No token, secret or raw provider response belongs in logs or errors. Live fresh-challenge testing after an authorized deployment is still required.
