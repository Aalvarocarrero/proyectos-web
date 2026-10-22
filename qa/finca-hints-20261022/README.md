# Finca Escuela: continuidad de pistas

El flujo verificado conserva la pista abierta al cambiar entre Explorar y Profundizar, mantiene el paso al salir hacia Retos, y vuelve a la misma observación sin alterar el estado guardado. Durante la pestaña abierta, el nivel de pista sobrevive a una recarga; al avanzar a la siguiente misión, se reinicia.

- Chromium móvil emulado, 390×844: cambio de modo, entrada al reto de humedad, «Volver a observar», regreso a la misión, recarga, foco restaurado en el botón de pista y progreso persistido. Cero errores JavaScript.
- `cd preview/finca-escuela && node --test tests/farm-learning*.test.mjs`: 55/55 pruebas.
- `node scripts/build-farm-learning.mjs`: HTML autónomo de 209.989 bytes (límite estricto 210.000; margen 11 bytes).
- Captura: `mobile-hint-reload.png`.

La prueba con lector de pantalla real sigue pendiente. Pruebas locales solamente; sin publicación ni despliegue.
