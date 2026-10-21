# Finca Escuela: pistas accesibles

La actualización de pistas modifica el mismo nodo `aria-live="polite"` en lugar de volver a renderizar la misión. Así se conserva el foco en el botón, se anuncian los cambios y no se altera el progreso guardado.

## Verificación de esta rama

- `cd preview/finca-escuela && node scripts/build-farm-learning.mjs`: compilación autónoma local completada.
- `cd preview/finca-escuela && node --test tests/farm-learning*.test.mjs`: 47/47 pruebas pasaron.
- Chromium, móvil emulado 390×844: se probaron las dos pistas y el estado oculto; se verificaron `aria-live`, `aria-expanded`, foco, progreso idéntico y cero errores JavaScript. Captura: `mobile-hint-live.png`.
- El HTML resultante mide 209.808 bytes de un máximo estricto de 210.000 (margen 192 bytes). Se retiraron cuatro comentarios CSS sin efecto; las reglas y el comportamiento se conservaron.

La prueba con lector de pantalla y dispositivo físico sigue pendiente. Esto valida una ejecución local, no el servicio publicado.
