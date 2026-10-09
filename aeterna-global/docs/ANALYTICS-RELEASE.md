# Aeterna GA4 — STAGED, NOT ACTIVE
Measurement ID: G-Z38KJGKPSV. Stream: 4638983778.
Target: https://aeternaglobalstudio.com
Base: existing Aeterna Sites version 17, commit 74c6f5f6eb4b07ad2cc826e02563c641a8a4bd0e.

## Release requirements
- Turn Enhanced measurement OFF in GA Admin > Data streams > this stream. Verify automatic user-provided data collection is OFF if offered. No GA account settings were changed.
- Confirm production uses this source before replacing anything. Its actual architecture/content/headers have not been verified. This source is static HTML/CSS/JS with no Worker and no CSP/_headers file.
- Only after confirming those points, change `const ENABLED = false;` to `const ENABLED = true;` in dist/analytics-consent.js, rerun tests and rebuild the ZIP. The supplied build is deliberately inactive.
- If production has CSP, obtain approval for exact minimum Google origins needed before modifying it. No security headers were changed.
- Use the existing hosting project and method. The nested static ZIP has index.html at its root, not a Worker bundle. Preserve current production-specific configuration. Do not blindly replace a different production build. Alternatively merge only analytics-consent.js, analytics-consent.css and their two references in each HTML page.
- Verify real-browser network behaviour on production: no Google calls before a choice or after Reject; one tag after Accept; withdrawal stops collection and removes _ga cookies; no preview tracking. Confirm GA Realtime receives a consenting visit. These checks have NOT been performed.

## Behaviour
Equal Accept/Reject controls; reversible Cookie preferences; device-local choice lasts 180 days. No requests to Google until opt-in AND release activation. Ads consent stays denied; Google signals and ad personalisation disabled. Exact HTTPS hostname gate excludes www and Sites previews. Only home and public photography pages allowlisted; booking/quote/unknown routes excluded. One manual page_view per load. No custom form/click/conversion events. Fixed page titles; configured URL excludes query strings and fragments, referrer and campaign fields are blank, Google loader uses no-referrer. GA collects its standard device/session data after activation and opt-in; this is not an anonymity or legal-compliance guarantee.

## Checks
Run `node --check dist/analytics-consent.js` and `node --test tests/analytics-consent.test.cjs` from the source root.
7 automated checks passed: release gate, unknown/rejected consent, one sanitised page view, excluded hosts/routes, withdrawal/cookies, unavailable storage, and one local loader per HTML page. Tests use JavaScript/DOM mocks and static checks; browser visual/network QA and real GA receipt remain unverified.

Pre-existing robots.txt blocks all crawling (Disallow: /); unchanged. Review indexing separately before using the whole source as production.

References:
https://developers.google.com/tag-platform/security/concepts/consent-mode
https://developers.google.com/analytics/devguides/collection/ga4/reference/config
https://support.google.com/analytics/answer/9216061
