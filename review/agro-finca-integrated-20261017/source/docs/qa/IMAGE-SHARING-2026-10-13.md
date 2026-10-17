# Image-first sharing · 13 October 2026

## Regression and fix

The community handler passed only `title`, `text` and `url` to Web Share; its social links also sent URLs. The marketplace's main share action also sent a URL, while its PNG export was a separate download. The checked Git history already contained this URL-first behavior; this review does not establish which previous deployed version last sent image files.

A single reusable share panel now prepares a real PNG locally before the final tap. It previews the artifact and offers native file sharing, explicit PNG download, and a separately labeled copy-link action. There is no URL/text payload in the image share call and no automatic link fallback. Missing-photo content generates a text card instead of failing.

Wired into marketplace details, each store product, community posts, public farm directory/detail, professional profiles, company profiles and company products. Profiles are explicit projections of visible public content: no record spreading, personal contact objects, exact coordinates or private Mi Finca data. Existing image attribution catalogs are embedded in the exported PNG; demonstration and AI disclosures are retained. Image loads are restricted to same-origin images or raster data URLs. No image is uploaded to a third-party rendering service.

## Browser behavior

- PNG generation happens before the native-share tap, preserving transient activation.
- Capability detection uses `navigator.canShare({files:[file]})` and native sharing receives only `{files:[file]}`.
- Abort/cancel leaves the image ready and performs no fallback action.
- Double taps/native sheet concurrency are locked. Failure releases the lock for another explicit tap.
- Closing/changing the panel aborts old preparation and revokes preview URLs. Stale callbacks cannot replace newer content.
- Unsupported or blocked native sharing exposes preview/download instructions, with a separate user-selected copy-link action.
- Choosing WhatsApp, a contact, Status, Instagram or another destination remains up to the system share sheet and installed app. Aspect-ratio labels do not promise a specific destination. Native share resolution is not proof of final publication.
- HTTPS, embedded-view permissions, OS/browser support and the receiving app can constrain file sharing. Actual mobile WhatsApp/Status delivery is not verified by mocked tests.
- Website access remains private. Downloaded/shared images are independently visible to the recipient selected by the user; copying a link grants no website access.

Primary references checked on 13 October 2026:
- W3C Web Share API: https://www.w3.org/TR/web-share/ (file data, user activation, destination selection, permissions policy)
- MDN Navigator.share: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share (file capability check, cancellation/failure behavior)

## Verification

Focused automated coverage lives in `tests/image-share.test.mjs`, `tests/public-image-sharing.test.mjs` and existing marketplace/profile/store/community suites. It tests file-only data, synchronous share invocation, missing/throwing capability detection, unsupported/empty files, expired activation, cancellation, retries, concurrent attempts, exceptions, failed generation, late image/canvas callbacks, all image formats, text-only output, attribution wrapping and public-only projections. Native API behavior is mocked; these tests send no messages or posts.

Final build, aggregate tests and UI QA are run by the combined release verification step. No deployment is performed by the sharing implementation worker.
