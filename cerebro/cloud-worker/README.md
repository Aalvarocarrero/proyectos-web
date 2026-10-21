# Cloud storage adapter (prepared, not active)

This is a dependency-free Worker/D1 backend adapter for the existing Cerebro local contract. It is deliberately separate from the local Python app and the current Sites preview. It does not import the private local journal, create a D1 database, configure hosting, or deploy anything.

## Routes

- `GET /api/projects` lists projects belonging to the authenticated owner.
- `POST /api/projects` creates a project from `{operationId, project}`.
- `GET /api/projects/:id/memory?limit=&cursor=` reads only that owner's project records.
- `POST /api/projects/:id/memory` appends one local-contract event from `{operationId, event}`.
- `POST /api/messages` appends a user text message from `{id, projectId, text}`; the message ID is also its durable operation ID.
- `GET /api/messages/:id` and `GET /api/operations/:id` read the saved operation receipt after a lost response.

All owner/project keys are included in SQL predicates and primary keys. Requests never accept an `owner_id`. JSON writes and receipts are committed with D1 `batch()` so the record and operation receipt are one transaction. Retrying the same operation ID and content returns its receipt; reusing the ID with different content returns HTTP 409. A new message ID permits an intentional repeated message. Memory records are append-only.

## Authentication integration is intentionally fail-closed

`createWorker({ authenticateOwner })` requires a trusted identity resolver supplied by the official Sites/Vinext integration. It must call the verified `getChatGPTUser()` helper and return that authenticated user's injected `oai-authenticated-user-id`; it must never take identity from the request body, a user-controlled header, or a hard-coded account UUID. The default export has no resolver and returns HTTP 503. This prevents the adapter from being accidentally exposed before Sites authentication is connected. The authenticated owner ID comes from the hosting platform; this code does not presume the remaining starter API.

The Sites reviewer has confirmed the intended final manifest entry is `d1: "DB"`, with existing `project_id` preserved, but no D1 binding or tables exist yet. Pricing for this account is unresolved. Do not provision or migrate a remote database until cost is confirmed. The initial cloud database must be empty; data arrives later only through an explicit, separately reviewed synchronization flow.

## Local tests

Run `node --test cloud-worker/test/worker.test.mjs`. Tests use Node's built-in SQLite and synthetic fixtures to exercise the same schema and SQL. They are local tests, not Cloudflare-hosted D1 tests and not evidence of Site deployment. A real D1 test still requires the approved Sites/Vinext starter and binding. The SQLite schema is `migrations/0001_initial.sql`.

Cloudflare documents that D1 `batch()` runs statements sequentially as a transaction and rolls back the batch on failure ([D1 binding API](https://developers.cloudflare.com/d1/worker-api/d1-database/)); local D1 testing normally uses Miniflare/Wrangler ([local D1 development](https://developers.cloudflare.com/d1/best-practices/local-development/)). No Wrangler or Miniflare packages were installed in this change.
