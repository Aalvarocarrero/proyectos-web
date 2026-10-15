# ROHO Café

Vinext/Cloudflare Worker with preserved editorial storefront, versioned D1 catalog administration, R2 image storage, and dispatch-owned Sites identity.

Read `CATALOG_ADMIN_PLAN.md` before activation. No real administrator identity is configured by default. Source assets live under `public/`; `dist/` is generated.

Use the Sites plugin's install/build/publish workflow. Local checks:

- `node --test scripts/test-catalog.mjs scripts/test-admin.mjs`
- `node scripts/validate.mjs`
- `node node_modules/typescript/bin/tsc --noEmit`

The existing storefront project ID must remain unchanged. No credentials belong in source or browser bundles.
