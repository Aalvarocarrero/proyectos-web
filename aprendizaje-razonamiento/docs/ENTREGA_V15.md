# Navegación educativa multiarea · v15

Candidato local, sin publicar. Base: `backup/education-v14-20261017`, commit `97eeaa1d233ced0b71b332dcb4fdfbb9d2077eab`. Rama de trabajo: `feat/education-multiarea-v15`. Los 40 archivos del manifiesto BACKUP-V14.json se verificaron por tamaño y SHA-256 antes de editar; cero diferencias. El manifiesto conserva su significado histórico y no describe los archivos modificados de v15.

## Alcance

Elegir etapa, filtrar por área y abrir una propuesta existente. `dist/catalog.mjs` es la única tabla de clasificación: deriva título, objetivo y duración de los contenidos originales. Hay 10 retos digitales, 2 guías presenciales dirigidas al adulto y 1 unidad familiar. Las seis partes de la unidad y las seis escenas de palabras no se cuentan como actividades nuevas. Las claves antiguas siguen siendo identificadores de guardado, no edades.

| Etapa visible | Inventario y área |
|---|---|
| 18–24 meses | Mi turno, tu turno → Convivir y emociones · guía de adulto |
| 2 años | Dos pasos, muchas historias → Creatividad · guía de adulto |
| 3–5 años | Laboratorio de formas; ¿Qué viene después? → Matemáticas |
| 6–8 años | El puente que cambió; Un mensaje que se entiende; La palabra escondida (piloto 7–8) → Lenguaje. El jardín de los caminos → Pensamiento crítico |
| 9–12 años | Una salida, varias soluciones → Desarrollo personal. Comparación más justa; Comparar para explicar (unidad familiar) → Ciencia |
| 13–18 años | ¿Qué podemos concluir?; ¿A quién representa la encuesta? → Pensamiento crítico |

El filtro incluye Todas las áreas y siete áreas, incluso cuando no hay contenido en una etapa. Los vacíos dicen que no hay propuestas y ofrecen volver a todas las áreas; las etapas permanecen accesibles. El orden es editorial y opcional, sin currículo validado, desbloqueos ni métricas académicas. Los estados son Sin empezar, En curso, En pausa y Cerrada por hoy. Se conservan los accesos directos opcionales a los dos juegos.

El área es un filtro transitorio: no añade campos al guardado v2. Las respuestas, migración v1, confirmaciones y coordinación de pestañas conservan sus implementaciones. Cambiar de área no cambia la propuesta guardada ni las respuestas. Cambiar de etapa mantiene los estados independientes como antes. El acceso Para las familias también funciona desde los juegos enfocados. No se añaden servicios, telemetría, cuentas, datos personales ni dependencias de producción.

## Referencias consultadas

- [Duolingo: diseño de inicio](https://blog.duolingo.com/new-duolingo-home-screen-design/): referencia para claridad de entrada y agrupación. Aquí no se reproduce su camino gráfico, mascota o sistema de recompensas.
- [UNICEF: actividades sin pantalla](https://www.unicef.org/parenting/child-care/screen-free-activities): referencia de juego presencial compartido; se mantienen las guías adultas y propuestas físicas existentes.
- [OECD: Learning Compass 2030](https://www.oecd.org/en/data/tools/oecd-learning-compass-2030.html): referencia de desarrollo amplio y agencia; la clasificación no constituye alineación curricular validada.
- [CASEL: marco SEL](https://casel.org/fundamentals-of-sel/what--is-the-casel-framework/): referencia conceptual para convivencia y emociones, sin evaluación de personalidad.

Consultadas el 17 de octubre de 2026. Ninguna de estas instituciones avala este prototipo. No se atribuye eficacia educativa a la interfaz.

## Verificación

Base reproducida: 104 pruebas lógicas, 43 DOM, 32 estáticas. Candidato: 104 lógicas, 47 DOM (incluye matriz completa y los 13 accesos), 32 estáticas, 227 comprobaciones de la suite Chromium histórica y 192 de navegación v15. Los resultados finales se guardan en `docs/evidence-v15/`, `browser-report.json` y `v15-navigation-browser.json`.

La aserción histórica de almacenamiento vacío era incompatible con v14. Se sustituyó por la clave única esperada, ausencia de sessionStorage y recuperación de la pausa tras recarga. Los recorridos reconocen estados persistidos (reanudar/reiniciar explícitamente cuando corresponde). Las comprobaciones de tamaño esperan a que termine el guardado asíncrono para no medir nodos retirados del documento. No se retiraron comprobaciones para ocultar fallos.

Chromium real, teclado Enter/Espacio, focos, tap targets de 44 px, movimiento reducido y anchos 320/375/768/1440. La navegación v15 comprueba las 48 combinaciones (6 etapas × 8 filtros), abre las 13 entradas, conserva una ruta pausada al cambiar filtro/etapa y tras recarga, y completa dos rutas de Matemáticas y Ciencia. Texto al 200% mediante escalado de tamaños computados a 375 px, sin desbordamiento en la vista de catálogo y juego mostrada. Capturas `v15-*.png`; además se conservan las capturas de recorridos históricos y PDF de la ficha familiar.

Límites: no es auditoría WCAG, no hay verificación con lector de pantalla, Safari/iPad o dispositivos Android reales, ni revisión pedagógica o pruebas con familias. El escalado de texto no sustituye todas las implementaciones de zoom de navegadores. No se garantiza exclusión entre pestañas sin Web Locks; sigue el límite de v14. No hay publicación ni push.

## Reproducir

`npm test`, `npm run test:static`, `npm run test:dom`, `npm run serve`; con servidor activo: `npm run test:browser` y `npm run test:navigation`. DOM requiere jsdom: en esta ejecución se instaló jsdom 26 solamente en `/tmp/education-v15-tools`; usar `NODE_PATH=/tmp/education-v15-tools/node_modules`. Playwright y Chromium ya estaban disponibles en el entorno. No se modificó el conjunto de dependencias del proyecto.

El paquete completo y su SHA-256 se entregan fuera de la carpeta de fuente. `DELIVERY-V15-SHA256.json` enumera los hashes de todos los archivos del proyecto salvo el propio manifiesto. El parche y el bundle Git permiten revisar o reconstruir la rama sin ningún push.
