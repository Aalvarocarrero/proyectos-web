# Fotografías reales de contexto · revisión v29

Se retiraron todas las referencias activas a la vaca marrón repetida (`photo-cattle.webp`) y al bovino demostrativo compartido (`demo-novillas.webp`), sin eliminar los archivos históricos ni alterar datos de productores.

Cinco fondos antes idénticos tienen escenas propias: producción, tienda, directorio de fincas, guía institucional y Mercado Agro. El panel bovino, catálogo en pie y ejemplos de comunidad/propiedades también usan escenas distintas. No se repite ninguna de las 14 fotografías nuevas entre esos usos. Se evita mostrar dos veces la misma foto como portada y avatar dentro de una tarjeta de finca.

Las fotografías documentales fueron obtenidas de Wikimedia Commons; fuente, autor, ubicación declarada y licencia constan en `lib/site-photos.ts` y se publican en `/creditos-fotograficos`, enlazado desde el pie y los encabezados correspondientes. Son contexto visual del agro venezolano: no se atribuyen a Parcela Los Morochos ni representan inventario, instalaciones, trabajadores o respaldo de las personas retratadas.

Se conservaron las escenas reales y se redujo el tamaño a un máximo de 1600 px de ancho/1400 px de alto, con compresión WebP; no se generaron ni sustituyeron objetos mediante IA. Cada derivado pesa menos de 650 KB; total aproximado 3.6 MB. Los encuadres se adaptan con CSS. Los derivados CC BY-SA mantienen sus licencias de origen, con aviso de cambios.

La tarjeta de carne de res conserva sus cortes, unidades, estado y solicitud; se retiró su fotografía de ganado y se usa el indicador neutro de producto, ya que no se obtuvo una foto de cortes adecuada. No se presenta un rebaño como foto del corte ofrecido.

No se cambiaron lógica offline, bases de datos, autorización, precios, solicitudes, dominio ni acceso del Site. Build, 59 pruebas, lint sin errores y typecheck aprobados. Revisión independiente comprobó 14 imágenes distintas, dimensiones, límites de tamaño, créditos y respuesta 200 de las rutas afectadas. La comprobación visual publicada se realiza por separado; no representa pruebas de teléfonos reales.
