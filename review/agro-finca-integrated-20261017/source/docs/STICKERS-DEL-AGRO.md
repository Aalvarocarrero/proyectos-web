# Stickers del agro

The `/stickers` gallery lists only entries in the delivered asset registry. Planned illustrations are not represented as available downloads. Search supports Spanish accents, aliases and multiple terms; category choices derive solely from available entries. A dialog provides a larger preview, and same-origin download links offer transparent PNG files and actual ZIP packs with measured sizes.

`lib/sticker-assets.json` records IDs, names, family labels, aliases, dimensions, paths and byte counts. Publication tests require at least one actual asset and verify every advertised file/pack exists with the recorded size. Pack membership must refer exclusively to available sticker IDs. Source masters stay outside the public bundle; only reviewed thumbnails and download files are copied into `public/sticker-packs`.

These raster illustrations are separate from the 24-unit functional SVG icons used by the interface. Personal use is offered as requested; no Creative Commons, commercial redistribution or platform-store publication license is invented.

The public page can be cached, but sticker binaries are excluded from the automatic core/public-library resource manifests and generic service-worker asset caching. Downloads are explicit browser/OS files. This does not install a messaging sticker pack or keyboard automatically. Offline UI directs users to files already saved on their device and disables new-download links; missing thumbnails/previews show a readable state. Real farm storage, authentication and public catalog APIs are not involved.

Physical iPhone/Android save-image/download behavior remains a device check. Browser and messaging applications may offer different import steps.

## Human character revision

The user requested paired woman/man interpretations of every human concept, diverse faces/hair/skin tones, and an appropriate Venezuelan plains-style hat rather than a repeated caricature. The catalog supports explicit creator-supplied `characterVariant` and `pairId`; identity is not inferred by computer vision. Filters can select women, men or nonhuman subjects, and a preview can switch between the two available variants.

The importer now excludes superseded human entries without this metadata and holds incomplete pairs. Only two reviewed members of the same concept/category are imported together. Previous generated files remain recoverable; they are not presented as new paired artwork. Nonhuman illustrations can advance independently. Download counts always reflect actual available files, not the much larger planned catalog.

Shared dialog/sheet focus handling also preserves native Radix trigger restoration when a trigger exists. Only known triggerless roots restore their previously active connected element, and caller-managed focus retains priority.

## Revisión de WhatsApp y colección ampliada

Colección preparada: 34 archivos disponibles, 18 animales/objetos y ocho parejas completas mujer/hombre. Los personajes sin pareja terminada permanecen fuera del catálogo.

La descarga es una imagen PNG transparente. La ayuda contextual explica guardar en Fotos/Galería y utilizar Crear dentro de WhatsApp; no hay importación de pack ni envío directo desde la web. Un ZIP no es un pack nativo de WhatsApp. El envío final requiere una prueba en el dispositivo y la aplicación del usuario.

Verificación real de v51 en Chromium cloud: búsqueda y filtro de personaje, vista ampliada y cambio mujer/hombre funcionaron. El PNG descargado de Agricultora con yuca fue idéntico al publicado: 34.045 bytes, SHA256 997a1b50ee962315efd91403e948c5f768506c009dfd059a13e7621ce525af85, 512×512, transparencia por paleta y 209.813 píxeles completamente transparentes. No se inspeccionó el archivo concreto enviado por el usuario ni un mensaje recibido en WhatsApp. La observación posterior del cierre fue bloqueada por aprobación del navegador; no se reintentó. No equivale a una prueba física en iPhone/Android.

## Colección con marca, 8 de octubre

Los34 archivos revisados tienen versiones completa y compacta de512×512, ambas con la marca autorizada Venezuela Agro. Se reutilizó el lockup del Site autorizado para esta composición, con fallback Noto Serif documentado por el creador; no se presenta como el archivo maestro inaccesible. Los originales generados permanecen archivados fuera del bundle.

Vista previa alternable, dos enlaces de descarga por ilustración y dos ZIPs de34PNG con bytes reales. Los68PNG son menores de100KB cada uno. Transparencia y hashes verificados contra la entrega revisada; marca con pequeña base oscura únicamente bajo el logotipo. La compacta tiene más margen; no garantiza un tamaño final equivalente a tres emojis ni legibilidad del logotipo a72px en aplicaciones externas. Se recomienda la completa para conservar detalles.

La ampliación siguiente reúne50 ilustraciones reales disponibles:18 animales/objetos y16 parejas completas. Las nuevas incluyen maíz, café, cacao, tomate, cerdos, caprinos, gallinas y acuicultura. Se ofrecen dos colecciones de50PNG y dos versiones por ilustración; no se anuncian como terminados los demás conceptos planificados.

## Entrega v125: 15 de octubre de 2026

La entrega v125 contiene **58 ilustraciones**: 18 animales/objetos y 20 parejas completas (40 personajes). Cada ilustración tiene PNG completo y compacto de 512 × 512, además de una miniatura WebP de 256 × 256. Los ocho nuevos personajes son cosechadora/cosechador de apio criollo, perejil, cilantro y fresa. La colección prevista a futuro no se presenta como terminada.

Los ocho originales revisados de 1254 × 1254 se prepararon mediante edición gráfica determinista, sin nueva generación: sustitución del interior de la placa por la geometría del archivo oficial `Logo_Principal.png`, variante blanco cálido y verde del Site, reducción, centrado y codificación. No se regeneraron rostros, sombreros, ropa, cultivos ni cuerpos. `docs/qa/STICKER-ADDITIONS-2026-10-15.json` registra los hashes originales y finales; `scripts/prepare-reviewed-sticker-additions.py` reproduce la preparación con esos archivos de entrada. Los originales quedan fuera del bundle público.

La galería distingue completa/compacta con controles de estado visibles, muestra una referencia a 72 px sobre transparencia y da a cada descarga individual un nombre accesible. Las dos colecciones ZIP incluyen los 58 PNG correspondientes y una guía LEEME; la compacta reduce el tamaño visible, no necesariamente los bytes. Se explica que no son caracteres Unicode ni un paquete nativo instalable de WhatsApp. La ayuda enlaza a https://faq.whatsapp.com/1056840314992666 (título y destino oficial verificados el 15 de octubre).

Los ZIP actuales se generan con fecha y permisos deterministas y se nombran con el SHA-256 de sus propios bytes. Los dos ZIP publicados en v124 se conservan sin cambios para no romper las descargas de pestañas antiguas. Los ocho PNG nuevos completos pesan 33–43 KB cada uno y los compactos 18–24 KB. Ningún recurso de stickers se añade a la biblioteca offline automática.

Verificación: pruebas de PNG decodificado, transparencia, márgenes, WebP, hashes, ZIP/CRC y correspondencia byte a byte; parejas, búsquedas, filtros, descargas, estado sin conexión y foco del diálogo. La compatibilidad física con WhatsApp/iPhone/Android sigue dependiendo de la aplicación y no se presenta como probada en dispositivos reales.

Comprobaciones locales finales de esta entrega: build de producción correcto, 1.135/1.135 pruebas, TypeScript sin errores y lint de los archivos afectados sin advertencias. Biblioteca offline pública medida: 20.407.606 bytes (límite de 20 MiB), sin imágenes ni ZIP de stickers. Dos generaciones consecutivas de los ZIP dieron los mismos nombres y bytes. La revisión visual de la UI desplegada queda a cargo del paso de integración: el navegador cloud no pudo abrir el servidor local aislado.


## Ampliación solicitada: 18 ilustraciones nuevas

La colección reúne ahora **76 ilustraciones reales**: 36 animales/cultivos/objetos y las mismas 20 parejas completas (40 personajes). Esta tanda añade seis animales (cerdo, cabra, conejo, pato, tilapia y abeja), seis cultivos (maíz, yuca, cacao, café, plátano y aguacate), y seis herramientas/equipos (machete, pala, rastrillo, regadera, carretilla y botas de trabajo). Los cultivos se pueden filtrar en su propia categoría; búsquedas como cochino, chivo, polinizador y botas de caucho encuentran los nuevos archivos. No se anuncian como terminados los restantes conceptos históricos previstos.

Las 18 ilustraciones originales se generaron individualmente con imagegen. Se revisaron anatomía y silueta; la abeja final tiene seis patas y cuatro alas. La preparación gráfica autorizada elimina únicamente motas de alfa desconectadas, conserva las ilustraciones, ajusta tamaños y compone el archivo oficial del logo en blanco cálido/verde. Los originales y prompts de generación se conservan fuera del bundle. `docs/qa/STICKER-EXPANSION-2026-10-15.json` fija sus hashes y los de los derivados; `scripts/prepare-sticker-expansion.py` reproduce la composición con esos originales y el logo verificado.

Cada pieza nueva tiene PNG completo y compacto de 512 × 512 y miniatura WebP de 256 × 256. Los 36 PNG nuevos pesan de 12.240 a 68.561 bytes por archivo. Las 54 imágenes derivadas suman 1.463.419 bytes. La vista a 72 px mantiene reconocibles los sujetos; la compacta deja más margen y el logo no tiene legibilidad garantizada a ese tamaño.

Las dos colecciones descargables incluyen los 76 PNG correspondientes y LEEME: completa 2.808.541 bytes, compacta 3.398.843 bytes. Sus nombres verifican el SHA-256 de los bytes ZIP, con extracción y CRC comprobados contra cada PNG original. Los cuatro ZIP publicados en v124/v125 se conservan byte a byte para las pestañas antiguas; sus hashes están fijados en `docs/qa/STICKER-LEGACY-PACKS-2026-10-15.json`. Dos generaciones sucesivas de los nuevos ZIP dan idénticos nombres y bytes. Todos los medios siguen excluidos de la descarga offline automática.

Verificación local de la ampliación sobre v125: build correcto, 1.138/1.138 pruebas, TypeScript sin errores y lint afectado limpio. Biblioteca offline medida: 20.416.341 bytes para 473 recursos, por debajo del límite de 20 MiB. La integración posterior debe repetir build/medición con los cambios independientes de portada y realizar el QA público de galería, búsqueda, tamaños y descargas.
