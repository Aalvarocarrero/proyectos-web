# Revisión de interfaz · 12 octubre 2026

Figma editable: https://www.figma.com/design/S7NHyTo05fsdCrJra6dZ82
Vista interactiva de revisión: `/diseno`.

## Implementado en la plataforma

- Navegación activa también al visitar subrutas.
- Foco visible con colores de la identidad existente.
- Controles compartidos con objetivos táctiles de 44 px y estados inválidos.
- Indicador de conexión que distingue detectar red de confirmar sincronización.

La vista `/diseno` reúne siete áreas existentes, la paleta original, estados y un formulario de demostración. Este formulario no guarda ni envía información. La identidad, los archivos de imagen, los datos y los endpoints no se sustituyeron.

## Alcance del archivo Figma

Diseño de controles y estados, editable, en escritorio y móvil. Colores procedentes del CSS; tipografía serif Cormorant Garamond ya contemplada en el sitio. Lato se usa solo para el texto de la lámina porque Avenir no estaba disponible en el catálogo del editor; la web mantiene su pila tipográfica original. Las imágenes de referencia no se importaron. No se considera una copia pixel-perfect de la web.

## Verificación

- Build: correcto.
- TypeScript: correcto.
- Lint: 0 errores y 37 avisos previos.
- Tests: 490/490 con ejecución serial. La ejecución paralela tuvo una colisión de caché Vite; no fue una aserción de producto.
- Figma: escritorio y móvil revisados visualmente tras corregir recortes y un campo desbordado. Capturas finales exportadas. La web todavía requiere revisión visual en el alojamiento privado; el servidor local no fue accesible desde el navegador cloud.
- No acredita registro público, sincronización real ni lanzamiento en dominio propio.
