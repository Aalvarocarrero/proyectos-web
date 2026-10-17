# Verificación del candidato de acompañamiento

16 de octubre de 2026. Revisión aislada sobre d626a127b5b9843ad281f4fb634c958c59650a82. No publicado.

## Cambios

- Guía opcional específica para las diez propuestas existentes, antes y durante la actividad.
- Cuatro apartados: ejemplo diferente del reto, más apoyo, retirada de ayuda y observación sin examen.
- Elemento nativo details/summary, sin alterar estado de respuestas, controles o misiones.
- Material de currículo y siguiente unidad listo para copiar en Notion; no se escribió en servicios externos.

## Ejecutado

- npm test: 36/36 (33 previas y 3 de contenido).
- npm run test:static: 31 comprobaciones.
- NODE_PATH=/workspace/scratch/1cce691d0fde/alvaro-content-admin/node_modules npm run test:dom: 18/18 (16 previas y 2 nuevas que recorren las diez propuestas).
- node --check dist/app.mjs y dist/facilitation.mjs.
- git diff --check.

Resultados detallados: facilitation-unit-results.txt, facilitation-dom-results.txt y facilitation-static-results.txt.

## Bloqueado o no realizado

Chromium se intentó iniciar y cerró con `socket() failed: Operation not permitted (1)` en process_singleton_posix.cc. No se sortea esa restricción. No hay verificación visual nueva, capturas nuevas, prueba con lector de pantalla ni certificación de dispositivos. Las pruebas DOM comprueban estructura, contenido y estados; no disposición visual ni toda la interacción real del teclado.

Antes de publicar este candidato: ejecutar el recorrido de navegador y revisar también el panel abierto en las cuatro anchuras. El recorrido incluye comprobaciones nuevas para abrir/cerrar con teclado sin iniciar una actividad. Hacer revisión visual humana de los textos largos y del foco.

No hay revisión pedagógica profesional, prueba con familias o estudio de eficacia. Las fuentes son un fundamento de diseño, no una aprobación del producto.
