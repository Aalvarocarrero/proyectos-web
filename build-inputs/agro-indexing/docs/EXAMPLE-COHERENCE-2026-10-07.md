# Example coverage and original category icons

## Delivered coverage

- Marketplace: 21 distinct fictional examples, one per root category. Each has a specific quantity/capacity, unit, minimum and sale format. Prices and contacts are deliberately absent. The explicit Examples view remains reachable even when real offers exist; examples are never added to real offer counts. A family name matches the same root filter as its child entries.
- Mi Finca: the current fixture has 56 records, one animal per sample species and dated weight history. Fixture version 3 also covers all ten land-use choices without changing the 68,500 m² allocated total, and gives the eight hypothetical cycles distinct dates. Dates are examples, not agronomic timelines. Existing local practice data is preserved until an explicit reset.
- Public farms: six existing demo identities remain separate from actual public records. The former vineyard-themed sample is now an explicitly fictional rice example matching its contextual Turén photograph; tourism uses a Mérida contextual photograph. Old cached demo rows are refreshed only by their known demo IDs; real rows are not rewritten.
- Registration: six nonoperative public-farm previews show the complete form structure. Twelve fictional professional profiles retain complete content and generated portraits; the real founder is not fictionalized.
- Projects: one clearly fictional planning preview explains all collected fields without contact, submission, donation or investment controls. The approved-project list continues to show only real approved records. Expanding visibility of existing project contact/details is not part of this change.
- Store: all twelve existing product categories retain licensed, distinct illustrative product photographs and truthful availability conditions.

## Icon provenance

38 original functional SVG geometries are authored in `lib/agro-icon-paths.ts`, exported by the shared category component and packaged under `public/icons/agro` with a manifest. Animal glyphs, land-use glyphs and market glyphs share a 24-unit canvas and rounded 1.8-unit stroke. These are interface symbols, not Apple emoji, SF Symbols or sticker illustrations. Existing general UI components may still use the installed open-source Lucide library. No new dependency or blanket public license was added.

## Boundaries

The classification has 27 families and 276 entries. Root-category example coverage does not claim 276 individual worked examples. Blank real prices, contacts, coordinates and clinical-treatment details are intentional. No real user records or edited practice records were replaced. Automatic tests cover data relationships, category matching, source separation, asset existence/provenance and rendering contracts; physical Safari layout and touch checks remain distinct.
