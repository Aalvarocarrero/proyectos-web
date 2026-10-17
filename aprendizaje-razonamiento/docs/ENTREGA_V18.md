# Corrección local v18

Base exacta: `222e11d003d515a099e422661a8e75101b31286a`. Rama local: `fix/education-gameplay-v18-local`. Sin publicación, subida de rama, Actions ni cambios de permisos.

## Tres defectos corregidos

1. **Orden de idiomas:** v17 construía las opciones empezando después del concepto correcto, por lo que lo dejaba siempre tercero. El módulo `language-order.mjs` asigna al azar una permutación de las tres posiciones correctas y mezcla los distractores. Cada piloto de tres preguntas usa una vez cada posición: los 18 ítems iniciales distribuyen seis respuestas correctas por posición. El orden se conserva durante selección, revisión y pausa de la sesión. Un reintento rota las opciones y mueve la posición correcta. No cambia ningún concepto ni criterio de corrección.
2. **Nombre de lengua en catálogo:** las seis tarjetas mostraban solo el título de unidad compartido. Ahora su encabezado visible incluye Español/Inglés/Portugués/Chino mandarín/Italiano/Francés; el nombre accesible del botón contiene ese mismo texto. Se conservan los IDs, rutas y contenido de las unidades.
3. **Pausa de Dani:** se elimina la promesa genérica de conservar elecciones en esta historia. El aviso explica que las decisiones ya se descartaron, que solo se conserva la fase en pausa y que volver inicia otra versión. El botón dice «Empezar otra versión de la historia». Las aclaraciones del área y catálogo también expresan la excepción de Dani. El comportamiento de privacidad sigue igual: no guardar respuestas narrativas. Las demás actividades conservan sus mensajes de recuperación.

## Persistencia y accesibilidad

Sin cambio de esquema ni versión del codec (sigue v4), claves, permisos, vocabulario, pedagogía, actividades ni avatar. El orden visual se mantiene solo en un WeakMap asociado al estado de idioma, nunca en localStorage. Una recarga genera otro orden equilibrado; la selección y explicación se recuperan por ID de concepto, no por índice. No se asignan identificadores personales ni semillas de perfil. Math.random sirve solo para presentación pedagógica, no para seguridad criptográfica.

El reordenamiento no sucede mientras se elige o revisa. El reintento es explícito y devuelve foco al título de pregunta. Botones nativos conservan teclado, texto y aria-pressed. No se añade arrastre.

## Pruebas y evidencias

Las pruebas nuevas cubren 200 semillas deterministas, todas las identidades de respuesta, equilibrio por piloto, estabilidad del intento, rotación al reintentar y ausencia de campos nuevos en estado. DOM: nombres visibles del catálogo, orden estable en selección/revisión/pausa y copia coherente de Dani con reinicio real. Navegador: 18 ítems, distribución agregada, teclado, recarga por ID, catálogo y pausa en 320/375/768/1440. Se conservan las baterías completas de idiomas, ciencia, historia, avatar y pestañas rivales.

Resultados finales y logs: `docs/evidence-v18/`. Capturas específicas: `language-catalog-desktop.png`, `language-catalog-mobile.png`, `dani-pause-1440.png`, `dani-pause-375.png`.

No se ha probado Safari/iPad físico ni lectores de pantalla reales. Chromium Linux con tamaños de dispositivo no constituye certificación WCAG. La corrección elimina el atajo sistemático «siempre la tercera», no convierte estos tres ítems por idioma en una evaluación de dominio.

La versión publicada permanece sin cambios. Para respaldar v18 en una nueva rama remota o actualizar Sites se requiere autorización posterior. El informe y los archivos se entregan localmente; 127.0.0.1 del entorno no es una URL accesible desde el dispositivo del usuario.

## Resultado final ejecutado

- Lógica: 137/137.
- DOM: 63/63.
- Estática: 32/32.
- Navegador heredado 227; navegación 219; rutas/idiomas 77; ciencia 110; historia/avatar 118; correcciones v18 110. Total: **861 comprobaciones de navegador**.
- Total lógica/DOM/estática: **232**.
- Distribución real del recorrido de 18 ítems iniciales: **[6, 6, 6]**, sin errores JavaScript. Orden por idioma registrado en corrections-browser.json. Capturas inspeccionadas visualmente.
- `git diff --check` correcto. Sin cambios en local-progress.mjs, progress-session.mjs ni la versión del codec.
