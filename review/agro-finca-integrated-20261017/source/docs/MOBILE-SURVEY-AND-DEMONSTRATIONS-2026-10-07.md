# Mobile controls, survey input and fictional profile examples

This release keeps the Site private. It does not change user farm records, permissions, analytics activation or image upload decoders.

## Corrections

- Dialogs and sheets place a contrasting, named 44px close control in a sticky rail before scrollable content. Existing save-in-flight and mandatory-choice guards remain.
- Marketplace, catalog, institution and professional cards have a semantic stretched primary action. Secondary credits/social controls remain above that action. Card action transforms are disabled to preserve its containing block.
- The normalized sketch keeps fixed X/Y columns independent of value length. Both fields reserve equal validation space. Invalid text remains visible; it is not clamped or saved as a coordinate.
- The separate survey table uses Lote, Vértice, Este and Norte. Original labels/order and an explicit final closure row are preserved. Geometry calculations omit a single repeated closing coordinate, while duplicate closures are invalid. Unknown datum remains unknown. Explicit REGVEN/UTM19N confirmation can use complete source metadata; location names alone never create a boundary.
- Administrative suggestions include 24 states/Capital District, 335 municipalities and 1,134 parish records from the OCHA/INE reference. Federal Dependencies remains separately selectable without artificial municipality/parish placeholders. Manual entries and existing values are retained. Reference dates and attribution are shown.
- Twelve static fictional professional examples have complete illustrative fields and AI-generated portraits. Contacts are nonoperative, demos are marked fictitious and excluded from public records, offline directory data and search indexing. The real founder profile remains unchanged.
- Platform chrome and install icons use Venezuela Agro. The creator credit may retain the Parcela Los Morochos mark. Stored farm names remain the owner's values.

## Verification boundaries

Automated tests exercise actual numeric editor handlers, geometry validation/roundtrips, hierarchy counts, profile rendering, nonoperative demo contacts and shared layout contracts. Source review does not establish pixel geometry or sticky behavior on a physical iPhone. Physical Safari scrolling, keyboard and installed-icon refresh remain user-device checks. Existing installed apps may retain an OS-cached icon temporarily.

The separate editable demonstration farm is not part of this release. No demonstration management records have been seeded into real storage.
