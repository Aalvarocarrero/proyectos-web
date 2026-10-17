# Map layers and explicit area references

The map filters Potreros, Cultivos, Agua, Instalaciones, and Terreno y accesos. Filters alter visibility only. Selecting an area exposes its record panel (bottom sheet on narrow layouts, adjacent panel on desktop).

`farm-record.data.areaId` is optional and nullable. A new/changed reference must resolve to an active area in the same farm and owner namespace. References are created only by an explicit user choice. Textual location/group matches appear separately as unconfirmed suggestions. Animal weighing history is reached through its existing animalId; it does not prove the weighing happened in the assigned area.

Older client writes that omit areaId retain the prior reference only within the same farm. Explicit null removes a reference. A deleted area's unchanged reference remains readable as unavailable; no automatic reassignment occurs. An area cannot reference another area. Existing owner/revision and local stale-edit protections remain in force. No SQL migration is needed: the value uses the existing JSON record column.

Division is blocked while records reference the source area, including locally pending links. The server checks references again in the atomic update to prevent a link arriving between preflight and the write. Users must decide how to remove/reassign links before dividing; the system never guesses which half owns records.

Demo fixture4 has58 records including two clearly fictional tasks and explicit area links. Fresh practice spaces use this fixture. Existing edited practice spaces remain intact and can voluntarily reset; real records are never seeded or reset.

Validation uses synthetic SQLite/IndexedDB and modeled component events, plus static responsive SVG renderings. Physical device interactions and live account data mutation are not exercised by these tests.
