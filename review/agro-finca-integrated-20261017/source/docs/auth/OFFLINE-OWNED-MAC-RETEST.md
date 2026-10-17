# Mac retest: owned-only offline scope and preserved drafts

Use the normal production origin. Keep DevTools Network set to Online before login tests. Do not clear all site data, IndexedDB or browser storage, and do not submit/delete real records. Record test results without cookies, tokens, provider payloads or screenshots of private records.

## 1. Login diagnostic first

After installing the matching release, reload `/auth/signin?return_to=%2Fapp`, complete a fresh approved challenge and submit once. Record UTC time and the fixed visible diagnostic code only. `provider_http_400/401/403/429/5xx/other` distinguish HTTP failure from `provider_internal_error`; they are evidence, not a resolution. Do not rotate, reveal or change secrets to experiment. A successful challenge should reach Google selection, then return to the requested page after the owner's verified login. Administration must remain unavailable.

## 2. Download scope, no account required

1. In a clean separate browser profile, prepare essential offline tools. Record manifest revision and storage estimate; estimates include that profile's browsing.
2. In Network, prepare the optional library once. Confirm static pages/resources are requested but `/api/offline-public`, `/api/red`, marketplace/directories and private bootstrap are not bulk-downloaded by this action.
3. Reopen the library and toggle Offline/Online. It must not refresh a third-party feed snapshot.
4. Offline, reopen the prepared basic tools and optional guides. Dynamic Mercado/Comunidad/directories must show their connection-required state; built-in examples may remain. Existing bookmarked IDs are references, not a promise of downloaded bodies or photos.
5. Restore Network to Online when finished. Own records are additional variable storage; library byte totals overlap essential code and must not be added wholesale.

## 3. Cross-tab account lock with synthetic UNSAVED input

Requires a functioning Google session. If login is still blocked, mark this section pending. Use an already available farm or an authorized test fixture; do not create production data merely for this check.

1. Open Mi Finca in tab A. Open an add-record dialog and type the synthetic unsaved marker `OFFLINE-PRIVACY-CHECK-DO-NOT-SAVE` into a free-text field. Do not submit. Note another harmless field value. Keep A open throughout.
2. Open tab B on the same origin and sign out normally. Return to A. Its private view must be hidden. If a dialog/sheet was open, it must show the account-check panel; the original field must not remain visible or reachable by keyboard. Escape/outside-click must not discard the draft.
3. Click the sign-in link from that panel. It must open another tab. Sign in as the SAME original account, return to A and press “Comprobar mi cuenta”. Verify the original dialog and exact marker/field values return without a page reload or record submission. Check keyboard focus, scrolling and buttons remain usable.
4. Repeat while a select/dropdown menu is open. Its old account options must disappear on lock; the verification controls must remain clickable and keyboard-reachable. Repeat once with a mobile-width sheet.
5. With a separately authorized second test account if available, repeat B's account switch. A must stay blocked when “Comprobar mi cuenta” sees a different owner. Do not inspect another person's data or create a second account for this test.
6. Repeat with an unsent Comunidad text draft. Its text and own pending/private rows must be hidden on logout and restored only for the original owner. Anonymous Community browsing must not acquire a sign-in lock.
7. After confirming the marker is unchanged, explicitly discard only that synthetic unsaved form. Never clear or reset the account database.

## 4. Owned storage boundaries

With the original account verified, prepare its normal offline access only if the owner wants this browser trusted. Offline Mi Finca should read its own saved records and drafts. Private API responses must not appear in CacheStorage. Do not claim full social posting, all remote photos, or all publication screens work offline; their complete interfaces still require connectivity. Sign-out/account switch must not delete either account's records or queued work.

Any inaccessible lock controls, lost draft, foreign-owner record, private API cache entry or automatic public-feed download is a release verification failure. Preserve evidence and coordinate rollback; do not repair by clearing user storage.
