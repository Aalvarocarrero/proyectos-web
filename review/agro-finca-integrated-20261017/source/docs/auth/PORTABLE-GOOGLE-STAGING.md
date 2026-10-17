# Portable Google login: local implementation, not a live deployment

The default build remains the Sites variant, with its existing hosting/access settings unchanged. `npm run build:staging` selects the standalone trust boundary and separate `wrangler.staging.jsonc`; `.openai/hosting.json` is unchanged. Never deploy a default Sites build to a directly reachable Worker: Sites identity headers are trusted only behind the Sites platform.

## Configuration

- Google OAuth client type: Web application.
- Exact redirect URI: `https://venezuelaagro-staging.alvarojuniorcarrerovasquez.workers.dev/api/auth/google/callback`.
- Server-redirect flow uses no Google JavaScript client and needs no JavaScript origin registration.
- Scopes are only `openid email profile`; no offline Google access or refresh token is requested.
- Worker Text variables: `AUTH_MODE=google`, `APP_ORIGIN`, `GOOGLE_CLIENT_ID`, `TURNSTILE_SITE_KEY`, `STAGING_ALLOWED_EMAILS`.
- `STAGING_ALLOWED_EMAILS` is a comma-separated, explicit tester allowlist. It is intentionally absent from the checked-in staging config until approved; no wildcard and no empty allowlist is accepted.
- Worker Secrets: `GOOGLE_CLIENT_SECRET`, `AUTH_SESSION_SECRET`, `TURNSTILE_SECRET_KEY`.
- Generate the session secret with a cryptographic password-manager generator: 32 random bytes, represented as 64 hexadecimal characters, is accepted. Never place secrets in a file committed to Git, frontend environment, chat, screenshot, or logs.
- The app fails closed on missing configuration, wrong origin, missing database migration, invalid sessions, provider verification failure, or failed Turnstile.

The standalone configuration sets `keep_vars=true` to preserve dashboard-managed variables. Existing encrypted Worker secrets are retained by Wrangler and must not be supplied again or retrieved. `GOOGLE_CLIENT_ID` may remain a `secret_text` binding; the application accepts it unchanged. Before any authorized deployment, verify binding names/types, supply the approved tester allowlist, and reconcile the three non-secret variables explicitly declared in the config. Do not deploy with a plaintext session secret. See [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/) and [deploy keep-vars](https://developers.cloudflare.com/workers/wrangler/commands/workers/).

## Database and identity

The canonical v127 release chain is `0000` through `0009`: CMS `0008_wild_sinister_six.sql`, then authentication `0009_even_blue_shield.sql`. Only apply it after inspecting the actual schema and migration ledger with renewed authorization. An empty database requires all ten migrations; a matching v125 `0000`–`0007` ledger requires both new migrations; a matching v127 CMS ledger requires only auth `0009`. A ledger containing the older standalone `0008_even_blue_shield.sql` is divergent: STOP and prepare a separately reviewed reconciliation. Never replay or rename an applied migration, infer history from empty rows, drop tables, or fabricate ledger entries. No remote migration has been performed. Tables: `auth_identities`, `auth_sessions`, `auth_transactions`. Existing users and owner IDs remain unchanged. A new Google subject receives a new internal UUID; an email collision with a prior account is rejected rather than linked. No D1, R2, consent, account, or IndexedDB migration is performed by login.

Transactions expire in ten minutes and are atomically consumed, browser-bound, and protected with state/nonce/PKCE. The verifier is encrypted using AES-GCM with an HKDF-derived key. Google ID tokens are validated by oauth4webapi including an explicit RS256 signature check. Opaque session tokens are only in secure HttpOnly cookies; D1 stores keyed hashes. Sessions expire after twelve hours idle or seven days total, and logout revokes the server row. Google tokens are not retained.

The owner's 2026-10-15 instruction makes the Sites administrator exclusively `alvarojuniorcarrerovasquez@gmail.com`. Standalone private-staging still denies all administration; the tester allowlist does not grant it. A separate opt-in public-production mode supports an explicit verified Google email/subject owner binding; see [Production auth review](PRODUCTION-AUTH-REVIEW.md). The staging build cannot be opened by changing the runtime mode alone.

Standalone requests ignore inbound `oai-authenticated-*` headers. The staging configuration runs the Worker before static-asset serving, so static HTML and downloads also pass through the tester gate. Documents and APIs require an allowed authenticated tester, with a small login exception for `/auth/signin`, `/api/auth/*`, `/assets/*`, `/_next/*` and `/favicon.ico`. This is app access control, not a promise that downloaded JavaScript or previously cached public assets are secret. Mutations require same-origin evidence and session-bound CSRF proof; the callback has its own OIDC transaction proof. Turnstile checks success, exact hostname and `login` action. A challenge does not grant account access.

## Required verification before launch

1. Reconcile approved tester list and Text variables, and check that all three secrets exist without exposing values.
2. Apply the staging-only migration after authorization, build the standalone variant, inspect its generated Worker config, and deploy only after authorization.
3. Confirm the existing `images.unoptimized=true` setting remains in `next.config.ts`; normal image rendering then needs no Images binding. This config deliberately does not provision that service; the unused direct `/_vinext/image` transformation endpoint still expects it.
4. Exercise real Google login/cancel/retry, Turnstile success/expiry/failure, POST logout, forged Sites headers, unavailable provider/D1, and two accounts on real mobile browsers.
5. Verify queues and records remain account-partitioned, failed sync preserves pending changes, and the default Sites login/logout still work.
6. Do not change DNS, Sites access, public indexing, production data or admin allowlist as part of this code review.

Tests use synthetic credentials and in-process simulated provider endpoints. They are not evidence of successful live Google/Turnstile integration or a deployed Worker.

## Continuar en español

La guía operativa y los pasos manuales están en [Continuar staging](CONTINUAR-STAGING-ES.md). La comprobación `node scripts/check-staging-local.mjs` es exclusivamente local y no autoriza ni ejecuta operaciones remotas.
