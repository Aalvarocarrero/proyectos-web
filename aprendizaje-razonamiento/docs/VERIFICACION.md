# Verificación · 2026-10-15

## Completado

- 16 pruebas unitarias de lógica, todas aprobadas con Node 24.
- Incluyen conjunto vacío, piezas incorrectas, duplicados, reglas inválidas, alternativas válidas, presupuesto exacto, exceso y requisitos faltantes.
- Enumeración completa de 64 combinaciones de suministros con presupuestos de 5 y 8 fichas (128 evaluaciones).
- Sintaxis de ambos módulos JavaScript comprobada con `node --check`.
- 24 comprobaciones estáticas de semántica, accesibilidad básica, CSP, ausencia de persistencia y contraste de pares principales; véase informe JSON.
- Corrección del contraste de números de pasos tras detectar relación inicial inferior a 4,5:1.

## No completado

El script `tests/browser.cjs` contiene recorridos de ambos retos, reinicio, guías, etapas futuras, teclado, nombres accesibles y desbordamiento a 320, 375, 768 y 1440 píxeles. **No se ejecutó satisfactoriamente**: Chromium falla al crear sockets del entorno, incluso después de la ejecución escalada autorizada. El servidor local tampoco produjo una página verificable desde este entorno.

No hay capturas finales, inspección visual, auditoría WCAG completa, prueba de lectores de pantalla ni compatibilidad real iPad/Android/Mac. Las comprobaciones estáticas no sustituyen esas verificaciones. No se debe presentar como un producto listo para familias.

## Criterios de aceptación antes de publicar

- Ejecutar y aprobar el recorrido del navegador sin errores de consola ni peticiones externas.
- Revisar capturas móvil y escritorio, zoom y orientación horizontal.
- Revisión manual con teclado y lector de pantalla.
- Probar Safari/iPad, Chrome/Android y Mac reales o documentar claramente los no cubiertos.
- Revisar las guías de objetos/materiales con especialista y los objetivos con el usuario.
- Confirmar destino, acceso y registro técnico antes de la publicación.
