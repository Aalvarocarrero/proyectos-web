# Entrega local · Matemáticas 6–8 · v34

**Estado:** implementación local probada, pendiente de revisión de vocabulario y de evaluación con niñas y niños. No publicada ni subida al remoto.

**Base preservada:** rama `feat/education-maths-v34-local`, commit v33 `362f13cc9e0f1f3fa28f96f6b047d1b99e917cff`. Se trabajó sobre esa carpeta y ese árbol ya existente; no se volvió a v25 ni se reemplazó el progreso local anterior.

## Qué incluye

- Nueva ruta explícita de Matemáticas «Un número, varias formas» para 6–8, conservando las rutas anteriores. Se agregó al mapa de talleres y al resumen/facilitación; la ficha indica adulto disponible y edad orientativa.
- Piloto interactivo de dos partes con colección activa, reserva visible, guardado de una imagen anterior, redistribución, transferencia compensada, deshacer, comparación bajo solicitud, ayuda y cierre/papel fuera de pantalla.
- Acepta todas las parejas ordenadas completas de 6 y 8, incluido cero; identifica fichas pendientes fuera de A/B. El intercambio `(2,4) ↔ (4,2)` se reconoce como intercambio, no como pareja nueva.
- La comparación no revela igualdad antes de pedirla. Feedback de transferir solo anuncia las cantidades y la reserva; la explicación aparece tras «Comparar mis formas».
- La ronda de ocho empieza con colección nueva sin distribución modelo. Representa explícitamente `6 + 2 = 8` como llegada de fichas nuevas y explica que mover dentro de A/B conserva el total.
- Estado de la sesión persiste con la infraestructura local existente y el validador estricto. El registro guardado no se mezcla con las fichas activas.
- Botones por nombre, sin arrastrar, fichas visualmente idénticas, texto legible, controles táctiles de 48 px, foco conservado al editar y rejilla adaptable.

## Verificación ejecutada

- `npm test`: 264 pruebas lógicas, todas aprobadas (incluye 18 casos propios de v34).
- `npm run test:static`: 32 comprobaciones estáticas aprobadas.
- `npm run test:dashboard`: 245 recorridos en 320, 375, 768 y 1440 px; navegación, áreas, rutas y persistencia previas conservadas.
- `npm run test:welcome-fixes`: 145 comprobaciones en 375 y 1440 px.
- `npm run test:navigation`: 228 comprobaciones; `npm run test:routes`: 77; `npm run test:reliability`: 38; `npm run test:privacy`: cinco escenarios sin cambios en los controles de privacidad.
- `npm run test:number-parts`: 88 comprobaciones Chromium en 320, 375, 768 y 1440 px; teclado, guardado anterior/colección activa, transferir, incompleto, pista, ronda ocho y recarga.
- `V32_DIST=/tmp/v33-baseline/aprendizaje-razonamiento/dist npm run test:compat-v32`: fixture v32/v33, 34 rutas históricas y protección de lectura/escritura anterior aprobados. El fixture demuestra el rollback v32↔v33 ya existente; no cubre el estado nuevo de v34.
- `NODE_PATH=<jsdom ya preinstalado en el entorno> npm run test:dom`: 102 pruebas DOM aprobadas; no se instaló ni modificó otra dependencia.

Los recorridos de Chromium son pruebas de software en este entorno, no pruebas editoriales de criterio educativo ni evaluación de aprendizaje.

## Evidencia visual

Capturas reales de Chromium, 375 px y 1440 px, están en `docs/evidence-v34/`: estado de seis antes de comparar y estado de ocho sin reparto modelo. El informe automático registra 88 comprobaciones y cero errores de página.

## Límites y revisión pendiente

La edad 6–8 es orientativa. El vocabulario y la secuencia proceden del brief v34 pendiente de revisión; todavía requieren revisión con padre/familias y profesionales. No se observó alumnado ni se midió aprendizaje. No se infiere comprensión, diagnóstico o capacidad por clics. No hay certificación curricular, de accesibilidad, compatibilidad con lector de pantalla real, Safari o dispositivos táctiles físicos. No hay audio presentado como pronunciación validada.

Se mantuvo la clave y versión del almacenamiento existentes; el nuevo campo es opcional para esta versión. La prueba `V33_DIST=/tmp/v33-baseline/aprendizaje-razonamiento/dist npm run test:compat-v33` confirma que v34 abre el fixture previo sin cambios de bytes y que v33 rechaza un registro con `numberParts` como corrupto, sin sobrescribirlo. Por tanto, regresar el código a v33 deja ese nuevo estado sin leer, aunque se conserva intacto. No limpiar datos para hacer rollback.

**Fuentes curriculares primarias y criterios detallados:** [FUENTES_MATEMATICAS_V34.md](FUENTES_MATEMATICAS_V34.md). La referencia curricular no valida el producto.
