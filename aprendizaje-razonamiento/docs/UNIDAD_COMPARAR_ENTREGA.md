# Candidato combinado 0.4: acompañamiento y una unidad completa

16 de octubre de 2026 · solo revisión privada · no publicado

## Qué se implementó

A las diez propuestas existentes se añaden sus guías opcionales y una unidad piloto accesible desde la etapa orientativa de 9–12 años. La entrada de edad es flexible. Supuesto de trabajo: exploración familiar en español; no se atribuye alineación a un currículo nacional.

«Comparar para explicar» organiza un objetivo coherente: diseñar una comparación, reconocer explicaciones alternativas y limitar las conclusiones a lo observado.

1. **Conectar:** pregunta sobre una torre y aclaración de los conocimientos de entrada, sin prueba ni captura de respuesta.
2. **Ver un ejemplo:** comparación de aviones, explicación del problema, mejora del diseño y límites. Es distinto al ejercicio siguiente.
3. **Probar con ayuda:** dos preguntas sobre puentes, con pistas graduadas y explicación específica de las tres opciones de cada pregunta.
4. **Otro contexto:** dos preguntas sobre superficies de rampas, una de diseño y otra de interpretación de un conjunto pequeño de datos ficticios. No se exige calcular medias y hay menos pistas.
5. **Fuera de pantalla:** plantilla de pregunta, cambio, condiciones y observación. Se puede conversar o dibujar, sin realizar pruebas reales. Enlace local a una ficha HTML imprimible, con hoja de estilos de impresión y sin JavaScript ni captura de datos.
6. **Volver otro día:** caso nuevo sobre altura y base de torres, con explicación desplegable. No hay avisos, plazo ni intervalo recomendado.

Las seis partes se pueden abrir en cualquier orden, sin responder ni acertar antes. Pausa, cierre y reinicio siguen siendo explícitos. Cambiar de actividad conserva las elecciones de cada una por separado mientras siga abierta la pestaña. Recargar elimina todo. No se envían respuestas.

Se cambió «os resulten» por «les resulten» en la guía común. Se conservaron las correcciones previas de pistas tras reanudar y descripción de B1 bloqueada. No se modificó el manifiesto de alojamiento ni se escribió en Notion.

## Qué revisar del contenido

- Las prácticas del puente ahora explican cada distractor dentro de la unidad; el reto original independiente se conserva.
- Las rampas ofrecen transferencia propuesta, no demostrada: acertar las opciones no certifica comprensión fuera de este caso.
- «Mantener parecido» reconoce que las condiciones pueden variar. Repetir aporta información, pero no convierte un mal diseño en una prueba causal definitiva.
- Los experimentos son ficticios y no se solicita realizarlos. La ficha no sustituye una evaluación adulta de seguridad de una actividad real.
- La unidad usa «A tu ritmo»; conserva sin cambios las ventanas provisionales de los otros retos. No hay una nueva afirmación médica sobre duración.

## Criterios verificados en código y DOM

- Un objetivo, ejemplo distinto, práctica apoyada y aplicación en otro contexto.
- Cuatro preguntas con retroalimentación específica para cada opción, sin etiquetas de capacidad.
- Navegación libre y explícita, incluso tras error o sin respuesta.
- Ayuda, respuestas y retroalimentación se conservan al volver atrás, pausar y cambiar de actividad.
- Elegir otra opción limpia la retroalimentación antigua; no muestra un éxito anterior como actual.
- Reinicio limpio, ausencia de respuestas al recargar y almacenamiento persistente vacío.
- Identificadores únicos, botones nativos con nombre, selección expuesta, foco al título al cambiar de parte y regiones de estado para explicaciones.
- Ficha local sin campos, formularios, scripts ni recursos remotos.
- Las otras actividades y sus regresiones continúan pasando.

## Pruebas del candidato

- **39/39** pruebas de lógica y contenido: `npm test`.
- **21/21** recorridos DOM: `NODE_PATH=/workspace/scratch/1cce691d0fde/alvaro-content-admin/node_modules npm run test:dom`.
- **31** comprobaciones estáticas: `npm run test:static`.
- Comprobación de sintaxis de todos los módulos de `dist` y del test de navegador, y `git diff --check`.

Informes guardados: `pilot-unit-results.txt`, `pilot-dom-results.txt`, `pilot-static-results.txt`.

El recorrido opcional de navegador ahora incluye navegación de la unidad con teclado, pausa, conservación de pistas, todas sus partes en 320/375/768/1440 px y una previsualización PDF de la ficha. **No ha pasado en este entorno:** el arranque de Chromium falla por permisos de sockets, ya confirmado en este mismo candidato de trabajo. No se generó un PDF ni se verificó el número de páginas impresas. No hay revisión visual nueva, prueba con lector de pantalla ni validación en dispositivos. Los resultados DOM no sustituyen esas pruebas.

## Puertas pendientes antes de afirmar validación

Revisión del responsable y navegador real antes de actualizar la vista privada; revisión profesional educativa y prueba formativa consentida antes de presentar el producto como validado. No se contactó con usuarios ni profesionales. No hay evaluación de eficacia.

La base de diseño y sus fuentes primarias siguen en `GUIA_ACOMPANAMIENTO_Y_SIGUIENTE_HITO.md`. Son principios generales, no evidencia de efectividad de esta unidad.

## Próxima decisión de producto

Revisar si esta unidad es una plantilla útil para otros objetivos antes de ampliar todas las edades. El alcance posterior debería elegirse por una necesidad concreta de las familias, y el marco curricular debe definirse antes de prometer cobertura nacional o escolar. No añadir perfiles o seguimiento infantil para resolver esta decisión.
