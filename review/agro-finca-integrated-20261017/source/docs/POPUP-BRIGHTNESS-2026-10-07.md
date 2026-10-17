# Popup brightness correction, 7 October 2026

v38 removes the full-viewport 65% dark Ideas overlay and its opacity animation. The transparent Radix modal hit-area retains focus trapping, outside-click protection and close behavior. The measured surface morph no longer interpolates backdrop-filter; glass remains on local controls. Positions, five-second passive sequence, interaction pauses, photo, copy, draft retention, and reduced-motion behavior are unchanged.

Verification: bounded-heap production build, 192/192 full tests, TypeScript passed; independent review 41/41 focused tests. This addresses a reproduced source-level page-brightness transition. Physical iPhone rendering and frame performance require user confirmation; no claim of measured Safari compositor behavior.

## Subsequent physical feedback and v39 correction

The user retested v38 and clarified that a closed card briefly reappeared at its expanded size. The v38 overlay correction alone did not resolve that symptom. Both closing components previously queued state changes then restored animation styles inside requestAnimationFrame; that callback is not a React/Presence unmount guarantee.

The new terminal `retire()` hides the source with important visibility and pointer-events before cancelling fill-mode animations/restoring geometry. A synchronous React close commit follows, so neither a delayed retained node nor animation cleanup can paint the expanded card again. Reversal before terminal close retains its original behavior; manual reopen mounts a new source. Late automatic install offers are accepted only in the waiting phase.

Tests explicitly retain the retired source for repeated cleanup/frame-model checks, with and without reduced motion, and assert close ordering and the automatic-reentry guard. Full suite197/197, TypeScript and production build pass. These are source/state-model checks, not a captured physical iPhone frame trace; user verification remains required.
