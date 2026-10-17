# Conversión contextual de importes

## Alcance

La conversión es opcional junto al importe original. USD, EUR, COP y VES conservan las fuentes oficiales, fechas de vigencia y último acceso verificable existentes. No se cambia el importe de productos, solicitudes, tarifas, registros o contabilidad. No se modifica autenticación, visibilidad del sitio ni datos reales.

| Área | Cobertura |
| --- | --- |
| Mercado Agro | Precio en cada tarjeta, ficha permanente/modal y relacionado. Los ejemplos con importes conservan el aviso ficticio y permiten convertir. Sin precio: estado explícito y calculadora de cotización contextual. |
| Ofertas Mercado | Conversión del importe escrito, sin enviar ni cambiar la propuesta. El botón original de revisión/contacto permanece. |
| Publicar Mercado | Vista de conversión del precio original escrito y su moneda/unidad, sin añadir campos al envío. |
| Parcela Los Morochos | Calculadora en cada producto, configuración de presentación/cantidad y línea de la solicitud. Se conserva «precio por consultar»; no se presume precio ni total. La cifra introducida no se multiplica por cantidad, no se guarda como precio y no forma parte del pedido. La calculadora de configuración está fuera del formulario para que una cifra de consulta inválida no impida guardar la presentación. |
| Profesionales | Tarifa de la modalidad filtrada (consulta contextual si esa modalidad no tiene precio) o primera publicada cuando no hay filtro, en cada tarjeta, nunca un mínimo entre monedas diferentes. Todas las modalidades con tarifa del perfil/modal tienen su conversor. Sin tarifa: consulta contextual sin precio inventado. Campos de tarifas conservan su conversor. |
| Empresas | Catálogo dentro de cada ficha: conversor de precios publicados; cotización contextual para productos sin precio y muestras sin venta. Editor: conversor de precio informado, sin modificar el payload. |
| Mi Finca | Planes: costo unitario, ingreso esperado, costo variable y margen. Portafolio: ingresos, costos y resultado por moneda separada. Movimientos y formulario de registro. Detalles de registros, finca modelo de lectura y demo editable, incluidos totales monetarios anidados. Resultado/margen admite signo negativo explícitamente; precios siguen siendo no negativos. |

## Áreas sin importe

El directorio de empresas presenta identidad y número de productos; sus importes están en el catálogo de la ficha. «Mis guardados» presenta títulos y abre la ficha correspondiente. Los mapas/áreas, animales, pesajes e inventario presentan superficies, pesos o cantidades y no reciben conversiones monetarias. Los enlaces a productos sugeridos de Parcela abren la configuración con su consulta contextual. Las imágenes para compartir y los datos estructurados SEO conservan únicamente el precio original; una tasa cambiante no se inserta en una imagen o publicación persistida.

## Consumo y funcionamiento sin conexión

- Un cliente de tasas compartido por pestaña, activado solo con un conversor abierto y un importe.
- Una sola petición concurrente aunque se abran muchas tarjetas; reaperturas usan el resultado por una hora, también cuando falta una fuente.
- Cambios de fecha oficial invalidan esa reutilización; reconexión o «Consultar de nuevo» permiten consultar otra vez.
- Cerrar una tarjeta no cancela la petición de otra; no quedan intervalos/eventos activos al cerrar el último conversor.
- El importe y nombre de producto no se envían al endpoint propio de tasas. La petición del mismo origen conserva las cookies normales; el servidor no transmite identidad ni importes a los proveedores oficiales externos.
- La copia local mantiene fechas originales; datos ausentes, antiguos, errores y almacenamiento denegado se indican sin inventar tasas.
- Las cotizaciones manuales no activan la consulta mientras su panel esté cerrado.

## Comprobaciones

- `tests/price-conversion-coverage.test.mjs`: inactividad inicial, 50 paneles concurrentes, reapertura, refresco forzado, cambio de día, copia sin conexión, fallos de fuente/almacenamiento, desmontaje compartido, precios reales/demo, ausencia de precio, tarifa por modalidad y cobertura comercial.
- `tests/farm-money-conversion-coverage.test.mjs`: importes tipados de Mi Finca, signos, monedas separadas y detalles de planes/demos.
- `tests/rural-currency.test.mjs`: parsers oficiales, fechas exactas, EUR/USD/COP/VES, política de redirección y conservación de copias anteriores.
- Compilación, tipos, lint y suite completa se verifican antes de integrar. La revisión visual y publicación privada corresponden al integrador.
