# URL-free shared images · v97 update

The user clarified that the exported social image should retain telephone, seller name, description and useful product details, and remove URLs and photo-credit text. This change is limited to sharing; ordinary page photography, attribution pages, account data, site privacy and the v96 tour are unchanged.

## Public details and image rendering

- All share surfaces continue to produce an actual PNG file. Native share still receives files only, without an automatic URL/text fallback. Copy-link remains a separate explicit action.
- Public-contact adapters select published profile fields only. Marketplace phone/name comes from the validated listing-contact schema; legacy free text, account/owner contact fields and private coordinates are not inferred. Public farm/company/professional contacts are selected from the same data already displayed in their public profiles. Demos and explicitly inactive records do not export phones. The store uses its known seller name without inventing a phone.
- The shared image retains the title, public seller/contact, value/location, description and available product facts. Long text uses a layout-safe excerpt and visible summary notice instead of overflowing. Chosen format dimensions are unchanged.
- The pixel renderer removes URL strings from every dynamic text field, including scheme-less domains and URLs entered in descriptions. Ordinary phone/email contact text and non-URL brand words remain intact. No source URLs, licensing links or author credits are painted into the export.

## Licensed example photographs

Some old example/stock photographs use CC BY/BY-SA, which requires attribution and a license link. Stripping these required notices is not used as a workaround, and metadata-only attribution is not relied on because receiving apps can remove metadata.

`lib/share-photo-replacements.ts` maps 30 specific bundled example/stock source paths to approved export-only alternatives. Original website images are not replaced. Actual uploaded user photographs have no general substitution rule.

14 newly downloaded real photos (CC0, public-domain or Pexels) are individually recorded with verified source, license, pixel observations and byte hashes in:
- `share-photo-animal-sources.json`
- `share-photo-farm-sources.json`

Permitted existing local pineapple, tomato and rural-landscape photographs are also reused. New photograph subjects are cattle, adult pigs, beef, pork ribs, sheep, poultry, horse, tilapia, rice, maize kernels, nitrogen tank, rural fence, farm tools and compost. They are explicitly reference photos and do not certify the demo lot, breed, age, weight, place or product specification.

Four niche examples use original project SVG artwork showing the exact subject: honey extractor, pellet feed, empty sample containers, and disk harrow. They are labelled illustrative, not photographs, and have been rendered and visually reviewed. See `share-original-illustrations.json`. No third-party asset was incorporated into these SVGs. No wrong-species or medicine-labelled photo was selected merely to fill a gap.

Replacement images use contain framing, preserving the object instead of cropping steaks or animals out of a short banner. The sharing panel explains when a reference alternative is being used, and the image retains a concise illustrative/reference disclosure. The public directory contains only the chosen 18 alternative files, about 1.1MiB; rejected research candidates are not shipped.

Sources for the permission distinction, checked 13 October 2026:
- https://creativecommons.org/licenses/by/3.0/
- https://creativecommons.org/licenses/by-sa/4.0/
- https://creativecommons.org/publicdomain/zero/1.0/
- https://www.pexels.com/license/

## Verification

Focused suites cover file-only sharing/activation/cancel/repeat/fallback, URL sanitization, retention of public contacts and descriptions, demo/private guards, layout-safe excerpts, every existing photo export, preservation of original page-photo data, selected alternative files, license/permission manifests and their byte hashes. Native API calls are mocked; no real post or message is sent. Final aggregate checks and deployed-browser PNG inspection are owned by release QA.
