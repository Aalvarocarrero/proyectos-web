# Taxonomía e indexación de VenezuelaAgro

Fecha: 7 de octubre de 2026.

## Estado y alcance

La estructura SEO está preparada sobre las rutas existentes, pero la indexación pública permanece desactivada: `PUBLIC_INDEXING_ENABLED=false` en `lib/indexing-policy.ts`.

- Origen vigente: `https://venezuelaagro.aalvarocarrero.chatgpt.site`.
- Dominio candidato: `https://venezuelaagro.com`.
- Estado del dominio: `domain-unverified`.
- El dominio candidato no sustituye al origen vigente en las URL canónicas, el sitemap ni los datos estructurados.
- Esta preparación no implica activar DNS, acreditar propiedad del dominio, cambiar el acceso privado, publicar en el dominio candidato ni solicitar indexación.

El objetivo es distinguir contenido público potencial, ejemplos y herramientas privadas, evitando páginas artificiales por cada combinación de estado y rubro. Poder ser rastreado e indexado no garantiza aparecer en Google ni obtener resultados enriquecidos.

## Familias de rutas

`INDEXING_TAXONOMY` es el registro de clasificación implementado. Los patrones con `[id]` o `[slug]` describen familias; no son URL literales que deban enviarse al sitemap.

| Familia | Rutas existentes | Contenido candidato tras un lanzamiento autorizado |
| --- | --- | --- |
| Plataforma | `/`, `/plataforma` | Presentación de VenezuelaAgro, funciones de Mi Finca, instalación y condiciones de uso local |
| Comercio | `/tienda`, `/marketplace`, `/marketplace/[id]` | Catálogo de Los Morochos, mercado y fichas reales activas, no eliminadas |
| Taxonomía agropecuaria | `/rubros` | Familias y productos del catálogo nacional de la plataforma |
| Directorio de fincas | `/fincas`, `/fincas/[id]` | Fichas públicas activas, separadas de los registros privados de Mi Finca |
| Directorio profesional | `/profesionales`, `/profesionales/[id]` | Perfiles activos de profesionales y empresas; incluye el perfil fundador real |
| Comunidad | `/red`, `/red/[id]` | Publicaciones activas de fincas que también continúan activas |
| Colaboración | `/proyectos` | Propuestas y alianzas revisadas |
| Conocimiento | `/aprende`, `/aprende/[slug]` | Guías incorporadas y artículos publicados |
| Institucional | `/nosotros`, `/guia-institucional` | Identidad, contacto y orientación con fuentes oficiales |
| Legal | `/legal/privacidad`, `/legal/terminos`, `/legal/comercio` | Políticas y condiciones |
| Créditos | `/creditos-fotograficos` | Autorías, fuentes y licencias fotográficas |

### Rubros y filtros

`lib/agro-catalog.ts` organiza el catálogo en **Cultivos, Animales, Productos, Insumos y Servicios**, con familias y elementos concretos. Esta clasificación sirve para navegar y filtrar; no afirma que todos los rubros se produzcan en todos los estados.

- `/rubros` concentra la clasificación, sus enlaces y referencias.
- `/marketplace?categoria=...` es una vista filtrada cuyo canonical sigue siendo `/marketplace`; los filtros no generan entradas del sitemap.
- Los filtros de estado, profesión y modalidad no constituyen páginas geográficas independientes.
- No existen rutas de detalle `/tienda/[slug]` o `/proyectos/[id]`, ni páginas separadas para cada categoría de artículos. No se anuncian como si existieran.
- No se crean combinaciones masivas de municipio, estado, categoría y producto sin contenido propio.

## Exclusión de contenido privado y demostrativo

`PRIVATE_PATHS` identifica `/app`, `/app-local`, `/admin`, `/offline`, `/marketplace/publicar`, `/signin-with-chatgpt`, `/signout-with-chatgpt` y `/callback`, junto con sus subrutas. `isPrivatePath` también considera privados los endpoints `/api/`, excepto los recursos `/api/media/`.

Las herramientas privadas y operativas permanecen fuera del sitemap y con `noindex`. La protección de datos depende de autenticación, autorización y controles de acceso; robots y metadatos no sustituyen esas medidas.

Las fichas demostrativas de fincas, profesionales y publicaciones de comunidad mantienen `noindex` incluso si se habilita posteriormente la indexación pública. Sus páginas no emiten los datos estructurados de perfil reservados para registros reales. Los ejemplos del mercado no se incorporan como ofertas reales al sitemap.

Los registros pendientes, rechazados o retirados no deben exponerse como fichas públicas activas. El sitemap selecciona profesionales y fincas activos, anuncios activos no eliminados y publicaciones activas asociadas a fincas activas. `/profesionales/alvaro-carrero` es un perfil fundador real incluido expresamente entre los candidatos, no una ficha demostrativa.

La excepción `/api/media/` permite servir imágenes públicas de registros publicados. La ruta mantiene sus propias comprobaciones de publicación o autorización; permitir el rastreo de ese prefijo no concede acceso a imágenes privadas.

## Canonical, metadatos sociales y datos estructurados

### URL canónicas y tarjetas sociales

- `metadataBase` utiliza `SITE_ORIGIN`, que continúa siendo el origen vigente.
- Las páginas públicas tienen títulos, descripciones y canonical propios; los detalles emplean su identificador o slug real.
- `pageMetadata` y `decoratePublicMetadata` añaden política de robots y metadatos Open Graph/Twitter a las páginas que los utilizan. El `og:url` de esas páginas se construye con el origen vigente.
- Las páginas de detalle conservan sus generadores específicos. No debe interpretarse la existencia del helper como prueba de que todos los campos opcionales de cada detalle ya están completos.
- La página principal aporta los valores generales de marca. Ninguna referencia al dominio candidato debe presentarse como canonical activo antes del cambio autorizado.

### JSON-LD

La implementación incluye Organization, Brand y WebSite en el inicio, Article en las guías, ProfilePage para fichas reales y datos de la publicación comercial en los detalles del mercado.

La exclusión de indexación se aplica mediante robots y cabeceras. No elimina necesariamente el JSON-LD del HTML de la vista previa: la presencia de datos estructurados no activa por sí misma la indexación. Las fichas demostrativas mantienen su exclusión específica.

Los datos deben representar el contenido visible y real. No deben añadirse precios, existencias, certificaciones, valoraciones, autores o fechas inexistentes para completar un esquema. La elegibilidad de un resultado enriquecido requiere revisar también las condiciones específicas del tipo de contenido; un servicio, inmueble o presupuesto sin precio no debe prometerse como resultado de producto.

## Robots, cabeceras y sitemap

### Configuración vigente: vista previa privada

1. El layout incorpora `robotsPolicy()`, que produce `noindex, nofollow` con la bandera desactivada.
2. Los detalles que antes podían habilitar `index:true` utilizan la política común y su condición de demostración.
3. `worker/index.ts` añade `X-Robots-Tag: noindex, nofollow` mientras la indexación pública está desactivada. También conserva esa exclusión para rutas privadas o respuestas marcadas como privadas.
4. `/sitemap.xml` devuelve una lista vacía de URL; no se consultan sus candidatos desde la función predeterminada mientras la bandera está apagada.
5. `/robots.txt` no anuncia un sitemap y permite rastreo a nivel de robots. Esto permite leer la directiva `noindex` si el recurso es accesible; no cambia la privacidad del alojamiento ni evita una autenticación requerida.

Un `Disallow` no equivale a `noindex`: si un robot no puede obtener la página, tampoco puede leer esa instrucción. Mantener la vista previa privada sigue siendo una decisión independiente del archivo robots.

### Preparación para un futuro modo público

`publicSitemapCandidates()` reúne las páginas principales, créditos fotográficos, perfil fundador, artículos publicados y registros públicos elegibles. Todas las URL usan el mismo origen que los canonical.

- Los contenidos privados, ejemplos y parámetros de filtros quedan fuera.
- Las páginas estáticas no reciben una fecha de modificación inventada común a todas.
- Los registros y artículos utilizan sus fechas guardadas.
- Ante indisponibilidad de la base de datos se conservan las páginas principales y las guías incorporadas que puedan recuperarse.
- Las consultas actuales tienen límites de 1.000 registros por colección dinámica y 200 artículos de base de datos. Antes de superar esos límites debe revisarse la paginación; no se promete cobertura ilimitada.
- Google ignora `priority` y `changefreq`; la selección de URL y las fechas fiables son más importantes.

El modo público preparado anuncia `/sitemap.xml`, conserva exclusiones de rutas privadas/API y permite específicamente `/api/media/`. Esa rama no está activada.

## Requisitos antes de activar Venezuelaagro.com

La activación exige una decisión posterior explícita y verificaciones independientes:

1. Autorización del responsable para el dominio y el lanzamiento público.
2. Verificación de control del dominio, configuración DNS, destino del alojamiento y certificado HTTPS válido.
3. Comprobación de autenticación, callbacks, cookies, enlaces y servicios que dependan del origen.
4. Definición de host canónico y redirecciones necesarias, sin enviar usuarios o robots a un dominio no verificado.
5. Cambio coordinado de `SITE_ORIGIN`, metadatos, referencias estructuradas y sitemap; revisión del tratamiento del origen anterior.
6. Confirmación del acceso público autorizado y pruebas de que los datos privados siguen protegidos.
7. Habilitación deliberada de la indexación solo después de las comprobaciones anteriores.
8. Validación del HTML servido, cabeceras, HTTP 404, recursos e imágenes, robots y sitemap; después, si se autoriza, verificación del sitio y envío del sitemap mediante Search Console.

No basta con construir en modo producción ni con cambiar una constante. La vista previa debe continuar excluida aunque el futuro sitio público utilice la misma base de código.

## Verificación y límites de esta documentación

El comportamiento de la política puede probarse en modo público simulado sin activar el sitio desplegado. `tests/indexing-policy.test.mjs` y las pruebas de HTML deben comprobar la exclusión predeterminada, las ramas públicas elegibles y la permanencia de las exclusiones privadas/demostrativas.

Este documento describe el código inspeccionado; no acredita por sí solo la ejecución de pruebas, el estado del despliegue, la propiedad del dominio, la visibilidad en Search Console ni indexación real. La validación final debe registrar sus resultados por separado.

## Fuentes oficiales

Consultadas el 7 de octubre de 2026:

- [Google: bloquear la indexación con noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google: URL canónicas y consolidación de duplicados](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: construcción y envío de sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: enlaces rastreables](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: navegación por filtros](https://developers.google.com/crawling/docs/faceted-navigation)
- [Google: títulos descriptivos](https://developers.google.com/search/docs/appearance/title-link)
- [Google: descripciones y fragmentos](https://developers.google.com/search/docs/appearance/snippet)
- [Google: reglas generales de datos estructurados](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google: Article](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google: ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Google: requisitos de resultados de producto](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [Google: funcionamiento de la búsqueda y ausencia de garantía de indexación](https://developers.google.com/search/docs/fundamentals/how-search-works)
