# Homepage content editor: local implementation

## Status and scope

This branch adds a persistent homepage editing slice to the existing Álvaro Carrero Worker ESM site. It does not deploy or change Site identity, audience, credentials, environment values, storage bindings, contact flows or feedback policy. The hosting manifest is unchanged.

The protected panel is `/admin`. Its 42 fields cover Spanish and English separately:

- Hero title and introduction
- Approach title and two paragraphs
- Community title and body
- Mentoring title and availability paragraph
- About title, two paragraphs, portrait image and accessible description
- Contact title and paragraph
- SEO title/description, social title/description and social image

The site retains all current pages, assets, navigation, subscription UI, resource downloads, session requests, social links, feedback, legal notices, canonical URLs, language links and launch gates. Existing rich heading typography is preserved while its field is unchanged; edited text is escaped and line breaks render as `<br>`.

Image editing selects from six already-owned image assets. It does not upload files, accept remote URLs, change R2, edit the SVG hero art or edit the gallery/video. Other pages, individual pillar cards, link destinations and structured-data identity are outside this slice. No user-facing rollback/history browser is included; every successful mutation does create an immutable audit snapshot for later review.

## Authentication and privacy

Sites dispatch supplies `oai-authenticated-user-id`. Only an exact match in `ALVARO_ADMIN_USER_IDS` may access the panel, state API or preview. The setting is a comma-separated list of stable IDs for this specific Site. IDs from another Site are not equivalent. Missing, empty or malformed configuration fails closed with 503; missing identity returns 401 and an ordinary top-level Sites sign-in link; a different identity returns 403. Email, display name and a service bearer do not grant editorial access.

Every admin request is authorized server-side, including unknown descendants and preview routes. There is no anonymous JSON content-state endpoint and no draft token. Preview uses `/admin/preview?lang=es` or `?lang=en` and requires the same editor authorization. Private HTML and API responses use `private, no-store`, no-index headers and a restrictive same-origin CSP. Generic CSS/JS assets contain no identities or saved drafts.

This trust model requires the existing Sites dispatch boundary to strip/spoof-protect identity headers. Do not expose the Worker directly on an independent public host that accepts arbitrary caller-supplied identity headers without replacing that boundary. This branch does not create a second authentication system or alter the current audience.

Mutations additionally require exact request-origin equality, same-origin Fetch Metadata when present, JSON MIME, and `X-Alvaro-Admin: content-v1`. Bodies are streamed with a 64 KiB limit. The full fixed field map is validated: unknown/missing properties, wrong types, empty or overlong strings, control characters, arbitrary asset paths and external URLs are rejected. User text is never treated as HTML. `src/content-contract.d.ts` describes the typed v1 contract; `content-service.mjs` enforces it at runtime.

## Persistence and concurrency

`content_state` stores the `homepage` singleton, schema version, current version, draft JSON, published JSON and publication version. `content_revisions` stores an audit snapshot for each confirmed save or publish. No table is created or altered during HTTP requests.

- `GET /api/admin/content`: authorized current state, or original defaults at version 0 if there is no state row.
- `PUT /api/admin/content`: `{expectedVersion, content}` saves a private draft.
- `POST /api/admin/content/publish`: `{expectedVersion}` publishes only the server's saved draft.

Each successful mutation increments the version. D1 compare-and-swap rejects stale clients with 409. State and audit use one transactional `DB.batch`; the audit insert is tied to a unique operation ID, so a losing concurrent write cannot create a false audit record. Publication never accepts client content. The UI keeps unsaved text on conflicts, blocks stale publication, disables editing during in-flight requests and requires a reload to reconcile a conflict. A lost response is not treated as confirmation of success.

Public homepage requests at `/`, `/index.html`, `/en/` and `/en/index.html` load only the published snapshot and render content/SEO on the server. Drafts do not appear until publication. Dynamic homepage responses are non-cacheable and drop static validators. When DB is missing/unavailable, migration is absent, there is no published snapshot, or published content fails validation, the original static homepage remains available. Admin/preview storage failures fail closed instead of silently pretending a draft was saved.

## Migration and activation boundaries

`0003_sleepy_catseye.sql`, its new Drizzle snapshot and the appended journal entry were generated with `npm run db:generate`. They only add `content_state`, `content_revisions` and the audit timestamp index. All older SQL and snapshots are unchanged. Existing feedback, rate limits, learning notes and retention tables are untouched.

No migration was applied to any persistent local, preview or hosted database. Automated tests run SQL only inside disposable in-memory SQLite fixtures.

Before any separately authorized rollout:

1. Review this local commit and the generated additive migration.
2. Verify the current Site and its actual site-scoped editor identity; separately approve configuration of `ALVARO_ADMIN_USER_IDS`. No identity has been guessed or configured here.
3. Confirm use of the existing Sites D1 binding and supported migration/deployment workflow. Preserve Site audience and identity.
4. Perform a staging/runtime check through real Sites identity and D1, including rejection of an unlisted account, private draft preview, bilingual publishing and concurrent editing.
5. Only then consider a separately authorized publication.

There are no changes to remote state in this deliverable.

## Local verification

- `npm run db:generate`: additive migration generated; no application performed.
- `npm run build`: private-mode Worker output remains self-contained at `dist/server/index.js`; existing production/static launch gates remain enforced.
- `npm test`: original regression suite plus synthetic D1, authorization, CSRF/body/schema validation, CAS races, atomic audit rollback, escaped rendering, SEO/image mapping, persisted draft/public separation, fallback and admin UI simulations.
- `node --check dist/server/index.js`: Worker syntax validation.

No browser/device screenshot, real Cloudflare D1, real Sites login, hosted runtime or live publication is claimed by these checks. UI checks use JSDOM and disposable data; they are not rendered-browser or device QA.
