> Current state, 2026-10-15: production and owner administration are active. The coordinator verified owner email `alvarojuniorcarrerovasquez@gmail.com`, Google subject `113186509837584939227`, and user UUID `06917f08-baaf-4677-8e50-3b791b263cf3` in production D1 after real Google login and direct user approval. Owner activation version: `d7804fcb-59f9-4252-94d1-02bbc8af7ad2`. The owner panel/API worked; anonymous API requests remained401. Preserve this exact owner pair in future builds. Historical preparation/activation steps below are retained as history, not instructions to blank the now-active grant. See `PRODUCTION-OWNER-PRESERVATION.md`.

# Production authentication preparation (local review, 2026-10-15)

This code does not deploy, create credentials, apply migrations, transfer accounts, change DNS, configure Cloudflare, or authorize a launch. The checked-in production Worker is an intentionally unconfigured local build template. Passing local tests is not evidence of live Google/Turnstile, DNS, TLS, D1, R2, or mobile-browser readiness.

## Independent modes and fail-closed controls

- Default Sites build: existing platform authentication. The administrator email is now exclusively `alvarojuniorcarrerovasquez@gmail.com`, per the owner's updated instruction. Public business contact addresses are not changed.
- `npm run build:staging`: standalone Google authentication, with `AUTH_ACCESS_POLICY=private-staging`, an explicit nonempty `STAGING_ALLOWED_EMAILS`, and no admin grants. Assets/documents stay behind the tester gate except the existing minimum login assets. Configuring an owner grant in this mode fails closed.
- `npm run build:production:review`: standalone Google, compiled `public-production` policy, production canonical origin, and indexing still OFF. Runtime policy must match the compiled policy; changing the staging binding alone cannot turn the staging build public. Production requires exact `APP_ORIGIN=https://venezuelaagro.com`. Unknown modes, missing secrets, origin mismatch, and partial owner config fail closed.
- No public Worker route/custom domain exists in `wrangler.production.jsonc`. Its DB UUID and bucket name are placeholders and its Worker name is explicitly unconfigured. A future launch must replace these with the separately approved production resources, never staging resources. Review `dist/server/wrangler.json` after the build and before any deployment.

## Exact production configuration, after approval

Build-time:

- `AUTH_DEPLOYMENT_TARGET=standalone`
- `AUTH_RELEASE_MODE=production`
- `PUBLIC_SITE_ORIGIN=https://venezuelaagro.com`
- `PUBLIC_INDEXING_ENABLED=false` initially. Set `true` only in a later reviewed build after domain, HTTPS, real auth callbacks and public access have been verified. This changes the robots metadata, sitemap/robots route behavior and edge indexing policy together. Private routes remain excluded.

Worker variables:

- `AUTH_MODE=google`
- `AUTH_ACCESS_POLICY=public-production`
- `APP_ORIGIN=https://venezuelaagro.com`
- `GOOGLE_CLIENT_ID`: approved Web-application OAuth client
- `TURNSTILE_SITE_KEY`: approved challenge allowing `venezuelaagro.com`
- `OWNER_ADMIN_EMAIL`: empty until the owner grant is explicitly activated; approved value is `alvarojuniorcarrerovasquez@gmail.com`
- `OWNER_GOOGLE_SUBJECT`: empty until the exact Google subject is verified; never use a Sites ID, user-supplied profile value, first user, or inferred subject
- `STAGING_ALLOWED_EMAILS` is not used for production and must not be broadened as a launch workaround

Worker secrets (entered securely by the owner, never retrieved/copied to source or chat): `GOOGLE_CLIENT_SECRET`, `AUTH_SESSION_SECRET` (43+ characters, cryptographically generated), `TURNSTILE_SECRET_KEY`.

Bindings: production `DB` (D1), `BUCKET` (R2), and `ASSETS` with `run_worker_first=true`. No Images binding is required for normal images because `images.unoptimized=true`; the old direct `/_vinext/image` endpoint is not a production public route. Provider configuration must allow exact redirect URI `https://venezuelaagro.com/api/auth/google/callback`. No broad callback wildcard or refresh-token scope is needed.

## Minimum owner activation procedure

1. Keep BOTH owner fields empty. Complete a real Google login with the approved owner email. This creates only an ordinary account after issuer, audience, authorized party, nonce, time, signature and `email_verified=true` checks. A tester account from staging does not migrate automatically.
2. In an authorized read-only inspection of the actual production DB, join `auth_identities` (provider=`google`) to `users`, verify the exact approved email and matching Google subject produced by that login. Do not infer the subject from an email or copy an unrelated platform's user ID. An already verified staging subject can be compared for identity, but production ownership/data still requires separate review.
3. After explicit approval to activate the grant, configure the exact email AND that subject as the two owner bindings. They must match simultaneously on every valid server-session lookup. Removing either requires removing both; a partially populated pair fails closed. For a clean rollback, clear both fields, which disables administration without changing account data.
4. Confirm the owner account can open `/admin`, save and publish a harmless reversible CMS test, and see its account-menu link. Confirm a separate ordinary Google account and an anonymous browser cannot access ANY admin page/API or unpublished home media. Expiry/revocation must remove administration immediately.

No email-based account linking occurs. If an old Sites account with the same email already exists in the selected database, login rejects `account_link_required`. Stop and review explicit account/data ownership migration rather than reassignment or automatic merge. Neither local IndexedDB data nor prior hosted Sites farm ownership is moved by this code.

## Route and data boundary

`lib/auth/route-policy.ts` is the explicit anonymous GET/HEAD allowlist: public pages, reviewed directories/details, published-media handlers, exchange rates, offline public projections, and public static asset directories. `/app-local`, demos and the offline library remain accessible without a login; local records remain in the browser. Unknown routes are protected by default. `/app`, publication/registration forms, account/bootstrap/sync/security APIs and all admin paths require a valid Google session. Public directory/media handlers keep their existing publication, ownership and field-projection checks. Private reads and writes continue to scope by the server user UUID, never client-provided owner values.

Standalone strips all incoming `oai-authenticated-*` headers, rejects encoded routing aliases, checks exact origin, and requires same-origin, session-bound CSRF for unsafe methods. Login start has its own CSRF/Turnstile check; OAuth callback is browser-bound and one-use. Cookies remain Secure, HttpOnly, host-only and same-site; server-rendered responses bearing a session cookie are private/no-store except an explicit audited account-agnostic offline-page allowlist; responses setting cookies are always private/no-store. Private APIs, admin, auth, and account pages are not cacheable. Public media publication status is revalidated on every fetch. No credentials or Google tokens are exposed to browser bundles or saved in the database.

## Known integration gaps and remaining launch decisions

- Formal production quotations and comments explicitly require a Google session; the notice appears before submission. Existing WhatsApp contact remains available without an app account. The user can compose locally, choose login, and return to the same form with a one-hour, tab-scoped draft. Contact text is not placed in redirect URLs. Login return never submits automatically. Storage failure prevents navigation rather than silently losing the draft.
- A missing/expired session or sync 401 retains fields and any queued operation; the UI does not show success until that exact operation has a persisted server acknowledgement. Retry preserves its ID and original account ownership, preventing duplicate submission or adoption by another account. `/api/sync` remains protected; an anonymous submission endpoint would need separate abuse/security review. Sites-mode legacy behavior is preserved.
- The implemented CMS currently manages the homepage and existing moderation surfaces. It is NOT a complete panel for adding/modifying every application or every website. That broader work remains open.
- Real provider login/cancel/retry, challenge expiration/failure, two-account isolation, uploads/publish/withdrawal, logout, local-owner transitions, offline reopen and reconnect need production-like browser verification. Existing synthetic provider and in-memory DB tests do not replace these checks.
- Reconcile the actual migration ledger before launch (`0000`–`0009` in this release). No new schema is introduced here. Any divergent older auth migration chain requires separately reviewed reconciliation.
- Confirm production database and bucket binding names/IDs, quota/billing expectations, domain/DNS/TLS, provider consent-screen publishing status and free-tier suitability. This patch adds no billing plan, external resource or ongoing credential.
- Decide/verify edge abuse/rate limiting and periodic cleanup of expired auth transactions/sessions for public traffic. Turnstile alone is not a complete production abuse-control or database-retention strategy. No scheduled job or remote rule was created.
- Canonical/indexing transition is intentionally separate. Inspect HTML canonicals, robots.txt, sitemap.xml, redirects from alternate hosts, and private noindex headers against the actual deployment; do not assume an environment setting proves domain ownership or TLS.

## Local verification

Tests cover default-private config, missing/partial owner grants, wrong origins, signed Google callbacks, unverified/forged identities, expired/revoked sessions, ordinary-vs-owner admin routes, CSRF, header spoofing, public route vs private API access, real in-memory cross-account farm isolation, and owner CMS save/publish. The release report records actual build/test outcomes; this document makes no unrun live-test claims.

References reviewed: [Cloudflare Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/), [Worker-first static asset routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/), and the repository's portable-auth staging guide. Existing Sites hosting metadata is unchanged.

## Earlier auth-only verification (before v128/UI integration)

- Fresh Sites/default build completed; the complete final regression suite passed 1,229 tests, zero failures. The targeted auth/ownership/CMS regression set passed 91 tests.
- Staging build, read-only generated-config check and compiled-Worker smoke also passed; anonymous static documents remain gated, tester administration remains denied, and revoked sessions are rejected. This smoke has the same local compatibility-date limitation below.
- Production review build completed with canonical `https://venezuelaagro.com`, indexing disabled, owner fields empty and resource placeholders retained.
- `npx tsc --noEmit` and focused ESLint completed without errors.
- `scripts/smoke-production-local.mjs` exercised the actual compiled Worker using ephemeral D1, synthetic sessions, and outbound provider traffic disabled. Public/local browsing, private boundaries, owner-only CMS save/publish, CSRF, duplicate cookies, canonical/noindex, and session expiry passed.
- Exact-date local runtime execution was blocked: installed workerd supports only compatibility dates through `2026-05-22`; the artifact requires `2026-10-14`. The successful smoke used the explicit test-only `PRODUCTION_LOCAL_COMPATIBILITY_DATE=2026-05-22` override. This is NOT exact-runtime parity; no deployment compatibility date was changed.
- Run the local smoke through `bash scripts/sites-env.sh -- node scripts/smoke-production-local.mjs` so logs/state stay project-local. An older local workerd needs the explicit override noted above. Real production verification remains mandatory.

Never upload a default Sites build to a directly reachable Worker. A future standalone deployment must rebuild the merged reviewed source with the production release flags and inspect the generated config. The template's empty owner bindings deliberately disable administration; reconcile them with the approved activation values before subsequent deployments rather than inadvertently replacing an activated grant with blanks.

## Integrated release verification

The final release includes main v128 (`51bef19a1ab351dc67c76dfc13f4068dd2cba3e9`) as merge ancestry, including mobile/laboratory learning source and generated learning HTML, rather than duplicate cherry-picks. See the packaged release report for final commit, artifact hashes, and rerun results. Draft/session/401 tests exercise handlers and synthetic IndexedDB; live browser/provider checks remain pending.
