# Content administration foundation

Local implementation only. No permissions, runtime environment, storage or hosted deployment has been changed. The original published checkout remains unchanged.

## Implemented
- `/admin`: branded editor for selected homepage sections, SEO title/description/social metadata, and a presentation image plus alt text.
- Existing image selection only; no external image URLs, uploads, R2 or catalog/product editing in this slice.
- D1 persistent drafts and published content, version-checked atomic writes and revision audit records.
- `/admin/preview` redirects to the authenticated `/?content-preview=1` root rendering so all relative assets retain their original behavior. The preview is private, no-store and noindex. Public requests only receive published content.
- Empty storage uses the original homepage. Public storage failures preserve the original page, while administrative operations return errors rather than pretend to save.
- Exact Sites-dispatch user ID allowlist, no email/first-user/URL roles. Same-origin + custom-header writes and bounded streamed JSON bodies. No browser-local data used as content storage.
- All original pages, assets, catalog, animations, timing, forms, links and publication/robots defaults retained. Fixed fields escape HTML. Editing a rich heading flattens its original inline typography to text and line breaks; unedited headings are unchanged. The existing about-founder link on Aeterna is deliberately not editable.

## Architecture and local checks
Supported Sites Vinext starter prepared separately, original static `dist` assets moved to `public`, original homepage retained as `server/home-template.mjs`, root served via Worker route. Sites build integration retained. Manifest preserves project identity and proposes a new DB binding; no remote provisioning occurred.

Run `npm run test:content`, `npx tsc --noEmit`, and the installed Sites `build-site.mjs` helper. Tests use ephemeral in-memory SQLite, not hosted storage; cover authorization, validation, escaping, concurrency, draft/public separation, fallback, API round trips, and SHA-256 preservation of every original asset/page. Generated schema-only SQL and Drizzle metadata are committed but not applied anywhere.

## Activation still required
1. Review migration, source diff and supported hosted Worker output.
2. Confirm actual administrators and obtain this Site's own stable authenticated user IDs. Configure the `AETERNA_ADMIN_USER_IDS` environment key as a JSON string array only with the required approval. Never reuse another Site's IDs or place IDs/secrets in client code.
3. Review and authorize the D1 binding/schema activation and deployment while preserving the current audience.
4. Verify real hosted dispatch authentication, admin denial, D1 save/reload/publish, private preview and unchanged public pages.
5. Browser/mobile visual QA remains unverified. No preview server/browser workaround was used.

This is a bounded homepage-editor foundation, not a complete page builder. Section ordering/visibility, arbitrary pages, catalog edits, media uploading, history UI and rollback UI remain future work. Audit revisions are retained server-side. Existing static generator scripts are historical; do not run them as the production build after this Worker migration.
