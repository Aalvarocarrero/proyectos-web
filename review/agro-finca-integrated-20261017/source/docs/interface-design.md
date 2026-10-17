# Los Morochos: interface standards

Reference: https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md

Apply the reference as design guidance, not a runtime dependency or a replacement for the brand.

- Preserve the established brown/cream/green palette, existing wordmark, mascot and editorial serif headings.
- Keep body copy near-neutral tracking; use balanced headings with sufficient leading. Respect enlarged text and avoid fixed-height text containers.
- Give press feedback immediately; commit actions on click/release. Never disable inputs merely to finish a decorative animation.
- Keep reversible, non-gesture transitions brief. Use velocity-preserving springs if direct dragging is introduced; do not add gesture libraries for static menus.
- Menus retain keyboard navigation, Escape/outside dismissal and focus restoration through existing Radix primitives.
- Layer order: navigation 50, floating actions 89–93, navigation menu 100, modal backdrop 110, modal content 111.
- The store request action clears the measured social popover, including resize and enlarged text; do not replace this with a hardcoded offset.
- Respect reduced motion, reduced transparency and increased contrast. No decorative looping animation, sound or haptics.
- Validate at 320, 390, 768, 1024 and 1440 CSS pixels and enlarged text when browser QA is requested. Compilation is not visual or interaction verification.

## Repository review and web application

Reference repository: https://github.com/emilkowalski/skills/tree/main/skills
Reviewed revision: d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7.
These are development instructions, not runtime features or an Apple certification.

| Guide | Treatment in this web project |
| --- | --- |
| apple-design | Brand-preserving typography, legibility, touch navigation and layering from the preceding pass. |
| emil-design-eng | Shared timing curves, hover capability gating, precise transition properties and clear form feedback. |
| animate | Brief CSS transitions for buttons, social/request repositioning, menus and sheets. |
| improve-animations | Source audit identified excessive card movement, shadow animation and slow request repositioning; addressed in shared CSS. |
| review-animations | Source-level review; no claim of browser or device verification. |
| find-animation-opportunities | Applied restraint: leave production records and frequent data entry stable. |
| animation-vocabulary | Reference terminology for motion; no runtime installation required. |
| ask-sonner | Existing Sonner component reused for one updating request notification, paired with persistent inline feedback. |
| pick-ui-library | Keep existing Radix/shadcn components; no competing library added. |
| prototype | Reserved for a requested comparison of alternate designs; no variant picker added to the production site. |
| animate-expo | Native React Native/Expo guidance; not implemented in this web/PWA project. |
| write-swift | Native Swift guidance; not implemented in this web/PWA project. |

Store request improvements: capture the form before awaiting; reject repeated submissions while saving; retain entered data if local queue storage fails; keep saved/sent feedback visible after the cart clears. Offline queue architecture and producer records are unchanged.

Additional recommendations: test request/social-menu overlap on an iPhone with enlarged text; test actual offline/reconnect journeys; measure large inventory lists before introducing virtualization; consider a separate native-app project only when native capabilities are required. Do not promise performance scores or flawless offline delivery based on a successful build.
