# Usability increment v38 (local)

This increment shortens the first-time guided path: age is selected before support mode, and ages under 9 go directly to the adult-supported age route. Ages 9–18 retain an explicit choice between exploring with an adult and independently. The same activity routes remain available, and selecting a journey does not clear local progress.

Activity help now opens text-first. Its launcher names the function, the panel offers one main action (“Dame una pista”), and showing Luma is an explicit choice. Opening help does not write a preference or alter activity progress. Existing saved avatar visibility preferences continue to apply.

Offline activities for the youngest bands no longer show the child-facing companion launcher; their screen stays focused on the adult guide. The first-time path to the primary 18-month activity is three taps from the welcome screen, down from four (one fewer; 25% fewer taps). This is a count of interface actions, not a study of perceived effort or usability. Chromium checks include 320, 390, 768 and 1440 px, reduced motion, keyboard navigation, touch-target sizes, no network requests and progress integrity. No children or caregivers tested this version; the copy, illustrations and activity suitability still need human review.

Validation scripts: `npm test`, `npm run test:static`, `npm run test:dom`, `npm run test:welcome`, `npm run test:welcome-fixes`, `npm run test:visual-v37`, and `npm run test:usability-v38`. Browser checks use Chromium, not Safari or mobile-device certification.


The UI review used the public Synthesis Tutor page only as a high-level reference for concise task framing and active guidance; no assets or proprietary text were reused: https://www.synthesis.com/tutor. Accessibility checks follow relevant WCAG 2.2 criteria as implementation guidance, not a conformance claim: https://www.w3.org/WAI/WCAG22/quickref/.
