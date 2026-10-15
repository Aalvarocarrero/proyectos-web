# ROHO content administration — prepared, not activated

## Implemented

- Existing four products, reference prices, photos, brand and header remain unchanged by default.
- Categories use named fields, explicit stable IDs and guarded removal. Products retain category references.
- Seven supported filters can be shown/hidden and renamed without JSON editing.
- Harvests have locality, producer, farm, altitude, roast date, cupping, planned-unit wording, coordinates and OpenStreetMap fields. Map links can be generated from confirmed coordinates. Referenced harvests cannot be removed; new incomplete harvests cannot pass server validation.
- Homepage editor exposes 37 allowlisted fields: 31 editorial text fields (including six process steps), three existing editorial photographs and three alternative descriptions. Existing markup, line breaks and hero emphasis remain unchanged until their text is edited.
- Authenticated library includes existing assets and the latest 100 R2 uploads. Images can be selected or uploaded for homepage fields. Existing product upload remains available. Draft R2 images retain authenticated previews; public media access is restricted to the published snapshot's visible products and homepage.
- Homepage, products, categories, filters and harvests share the existing D1 draft, compare-and-swap version check, explicit publish operation, actor-stamped revision history and restore-to-draft behavior. The publish confirmation includes homepage/photos.
- HTML strings are rendered through text nodes. No arbitrary HTML, selectors, links, scripts or executable uploads are editable.
- PWA asset version advanced to v12. Authenticated endpoints/media remain excluded from service-worker caches.

## Data compatibility

No SQL migration is needed: homepage content is an additive field in the existing JSON snapshot envelope. Pre-existing snapshots and revisions without this field normalize to the approved defaults on read/validation/restore. No D1 table or column was replaced and no remote database was touched.

## Verification

- `node --test scripts/test-*.mjs`: 33 passing tests, including actual SQLite schema/CAS, concurrent saves, audit/restore, unauthorized identity, media safety and publication privacy, legacy snapshot normalization, homepage XSS-safe DOM behavior and unchanged defaults.
- `node --check public/admin.js`: passed.
- `node_modules/.bin/tsc --noEmit`: passed.
- `npm run build`: passed, six Worker routes.
- Built Worker local HTTP smoke: home/admin/assets/catalog 200; anonymous admin and identity 401; nonexistent/private media 404; synthetic identity without allowlist 503.
- Headless browser visual checks were attempted but Chromium could not launch because this cloud sandbox disallows its process-singleton socket. Responsive screenshot/manual form verification remains pending. Do not describe it as visually verified.

## Remaining activation and UX boundaries

- No deployment or public publication performed. No admin grant or identity verification performed. The requested exclusive owner's email still needs to be securely mapped to the actual Sites-scoped owner identity, then separately authorized for activation.
- This implementation trusts the Sites dispatch identity boundary only. Never deploy this Worker directly to a public endpoint that trusts client-supplied identity headers.
- Header/logo/layout, hero background images, social links, SEO metadata, newsletter copy, selected static traceability/edition callouts and footer remain fixed. Product-linked presentation fields already synchronize through the catalog; this change does not make every static sentence an editable CMS field.
- Homepage updates are applied client-side from the published snapshot. The initial HTML and search/social metadata remain static.
- No complete draft-page preview, media deletion, upload pagination beyond the latest 100, bulk editing, drag-to-reorder categories, or editable category/harvest IDs after creation. Individual image previews and all saved versions are available.
- Payments, real stock, checkout, customers, orders and newsletter delivery are not implemented or represented as active. New product creation remains an explicit owner action; this work created no products or prices.
