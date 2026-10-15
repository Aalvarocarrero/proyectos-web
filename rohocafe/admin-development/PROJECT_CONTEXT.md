# Rohocafé — contexto permanente del proyecto

## Dirección de marca

- Nombre principal: Rohocafé / ROHO.
- Promesa: café colombiano de especialidad con origen, humanidad y propósito.
- Diferenciador: cada cosecha se presenta como una edición limitada, numerada, trazable y coleccionable.
- Personalidad: íntima, pausada, minimalista, sensorial, editorial, humana y contemplativa.
- Lenguaje visual: rojo profundo, blanco mineral, tonos tierra, fotografía de campo y amplios espacios.
- Primera edición documentada: ROHO 001 Tabi Honey, Pinchote (Santander), 250 g, 40 unidades.

## Canales oficiales entregados por Álvaro

- Google Maps Colombia: https://maps.app.goo.gl/f5BPCxAHcmCdo28C7?g_st=ic
- Google Maps Australia: https://maps.app.goo.gl/ZiKbPE3jWdjBkTCj8?g_st=ic
- Pinterest: https://pin.it/1ESTdlq18
- Facebook: https://www.facebook.com/share/1buUEvPS82/?mibextid=wwXIfr
- Threads: https://www.threads.com/@rohocafe.co?igshid=NTc4MTIwNjQ2YQ==
- YouTube: https://youtube.com/@rohocafe?si=y2kgjr-odRNTDjJV
- Instagram: https://www.instagram.com/rohocafe.co?igsh=dmFwYjFhaHltNmN1&wa_status_inline=true
- TikTok: https://www.tiktok.com/@rohocafe.co?_r=1&_t=ZS-98onzexh6Bx

## Datos pendientes para próximas versiones

- Confirmar el nombre público y la dirección completa de cada ficha de Google Maps.
- Definir correo oficial de atención y newsletter.
- Confirmar dominio definitivo y plataforma de pagos/logística.
- Incorporar finca, nombre del productor, altitud, lote, fecha de tueste y ficha de catación cuando estén validados.

## Versión responsive · septiembre de 2026

- Rojo digital oficial unificado: `#A91919`.
- Hero móvil reducido y reorganizado como cápsula editorial de producto.
- Fotografías de kits demasiado comprimidas retiradas de la interfaz; se utiliza el activo nítido del empaque ROHO 001 hasta disponer de fotografías finales verificadas de cada kit.
- Recortes de catálogo normalizados sin deformación y con tamaños responsivos declarados.
- Redes sociales optimizadas en cuadrícula móvil de dos columnas.
- Movimiento de interfaz limitado a transformaciones y opacidad breves, con hover exclusivo para puntero fino y compatibilidad con reducción de movimiento, transparencia y mayor contraste.
- PWA conservada y caché actualizada a `rohocafe-v3`.

## Revisión del catálogo · octubre de 2026

- Tres mockups fotorrealistas propios para Origen, Camino y Pausa, generados a partir del empaque ROHO existente; todos se comunican como conceptos de prelanzamiento.
- Activos WebP en 600 y 1200 px, con `srcset`, proporción reservada, carga diferida y textos alternativos descriptivos.
- Filtros accesibles de colección y fichas desplegables de producto.
- Logo del encabezado sin recortes; contraste y foco del menú móvil corregidos; texto y precio pueden crecer sin superponerse.
- Pop-up pausa su cierre al escribir; compartir en redes usa una imagen Open Graph.
- Caché PWA `rohocafe-v4`.
- Lineamientos aplicados: Apple Design y Emil Design Engineering del repositorio https://github.com/emilkowalski/skills.
- El sitio sigue en prelanzamiento: no hay pasarela de pagos ni suscripción conectada a un proveedor real.

## Corrección de proporciones · versión 5

- Se corrige la altura intrínseca del empaque en el hero de escritorio y se equilibra la composición de texto y producto.
- La fotografía de la mano recolectando café (con anillo visible) tiene una altura limitada a 520 px en escritorio y 380 px en móvil, sin deformación.
- El banner móvil conserva su diseño aprobado.
- Caché PWA actualizada a `rohocafe-v5`.

## Corrección de encuadre · versión 6

- Hero de escritorio ajustado al alto disponible; variante específica para pantallas de menos de 720 px de alto.
- Bolsa completa con `object-fit: contain` y alto explícito de 220 a 310 px; ficha compacta.
- Foto de cosecha limitada a 360 px en escritorio y 320 px en móvil.
- Unidad `250 g` inseparable.
- CSS y JavaScript con versión en URL; navegación PWA usa red primero para evitar HTML desactualizado al volver al sitio.

## Comercio trazable y enlaces externos · versión 7

- Producto principal convertido en una ficha comercial premium con categorización, atributos del lote, precio, disponibilidad de prelanzamiento y CTA.
- Pasaporte de origen con mapa liviano de Pinchote, Santander; el punto representa el municipio y no una finca todavía no confirmada.
- Bloques para productor/finca y control de datos: lo pendiente se comunica como “por validar” para no inventar trazabilidad.
- Enlaces de Instagram, TikTok, Threads, YouTube, Facebook, Pinterest y Google Maps reforzados para funcionar en navegador, vista embebida y PWA.
- Catálogo adaptado a tres kits en escritorio y una columna en tableta/móvil, sin desbordamientos.
- Datos estructurados de producto ampliados con categoría, variedad, proceso, origen y presentación.
- Caché PWA actualizada a `rohocafe-v7`.

## Fichas e-commerce por cosecha · versión 8

- Cada presentación abre una ficha comercial completa mediante “Ver ficha completa”.
- La ficha relaciona producto y cosecha con categoría, edición, variedad, proceso, formato, contenido, precio, disponibilidad, mapa, finca, productor, altitud, fecha de tueste y catación.
- Modelo de datos preparado para que futuras cosechas tengan ubicaciones y atributos propios sin rediseñar la tienda.
- ROHO 001 usa Pinchote como origen municipal; finca, productor, altitud y catación continúan marcados como pendientes de validación.
- Navegación social simplificada a enlaces HTML directos, sin interceptores JavaScript, con usuario unificado `rohocafe.co`.
- Caché PWA actualizada a `rohocafe-v8`.

## Acceso social visible · versión 9

- Tarjetas sociales restauradas a enlaces externos nativos con `target="_blank"`; se evita la navegación `_top` bloqueada por vistas embebidas.
- Toda la superficie de cada tarjeta es clicable y además muestra un CTA visible “Abrir red social”.
- Iconografía reconocible de Instagram, TikTok, Threads, YouTube, Facebook y Pinterest adaptada a rojo ROHO, mineral y carbón.
- Footer ampliado con seis accesos sociales completos, responsivos y bajo el usuario `@rohocafe.co`.
- Caché PWA actualizada a `rohocafe-v9`.

## Tienda categorizada · versión 10

- Ruta compartible `/#tienda`, enlazada desde navegación principal y pie; las páginas editoriales y la colección aprobada se conservan.
- Cuatro presentaciones existentes, separadas en café de origen y kits/regalos. Búsqueda sin distinción de tildes, siete filtros combinables (tipo de café, proceso, variedad, presentación, origen, edición y disponibilidad), orden y estado vacío.
- Prelanzamiento y precios de referencia visibles. Añadir a selección no reserva existencias ni genera pedidos; no se añadió pasarela.
- Modelo central en `dist/catalog.js`; las opciones se derivan de productos publicados y se pueden ampliar con categorías/atributos reales.
- No existe backend administrativo en esta fuente estática. La propuesta persistente y sus condiciones de acceso se documentan en `CATALOG_ADMIN_PLAN.md`; no se presenta un editor local como CMS.
- Caché PWA `rohocafe-v10` y pruebas de catálogo en `scripts/test-catalog.mjs`.

## Administración persistente · rama v11 sin activar

- El contenido fuente estático vive ahora en `public/`; `dist/` es únicamente salida de build Vinext/Worker.
- Catálogo público y textos de tienda provienen de una instantánea D1 publicada; borrador e historial se gestionan en `/admin`.
- `DB` y `BUCKET` declarados, con migración de esquema. Sin configuración de `ROHO_ADMIN_USER_IDS` no hay acceso administrativo. No se configuraron identidades reales ni recursos remotos.
- La activación, alcance y límites están en `CATALOG_ADMIN_PLAN.md`. La rama no habilita ventas, inventario, clientes ni newsletter.

## Administración de contenidos · rama v12 sin activar

- Categorías, filtros y cosechas se editan mediante campos, sin JSON. Retirar referencias utilizadas se bloquea tanto en la interfaz como en la validación del servidor.
- 37 campos editoriales de inicio incluyen textos, seis pasos del proceso, tres fotografías existentes y sus descripciones alternativas. Biblioteca privada de cargas R2; publicación limitada a imágenes referenciadas por la versión pública.
- Los contenidos nuevos comparten el borrador, publicación explícita, historial y control de concurrencia originales. Las versiones anteriores reciben valores de inicio aprobados; no se requieren cambios de esquema SQL.
- Alcance probado y límites de activación/UX: `CONTENT_ADMIN_REPORT.md`. Sin despliegue ni concesión de acceso administrativo.
