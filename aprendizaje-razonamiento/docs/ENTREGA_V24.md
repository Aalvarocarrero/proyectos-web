# v24 · Observar, comparar y contar de otra manera

Base exacta: v23 publicada, rama `feat/education-depth-v23-source`, commit `4ce886a72bce98dded299b10450b00736bc49b73`. Entrega local en `feat/education-science-creativity-v24-local`, sin subida ni publicación.

## Mejoras

**Ciencias, 9–12 años:** «Una comparación más justa» incorpora un taller con cuatro registros ilustrados. Se eligen dos, se observan sus cifras ficticias y las condiciones que cambian, y se revisa la selección cuando la pregunta pasa de forma a grosor. Una selección que mezcla condiciones recibe explicación y se puede cambiar. El cierre propone dibujar un diseño comparativo en papel; no pide experimentar con materiales. Las cifras se declaran inventadas antes y después de observar. Fuente primaria, correspondencia y límites en `FUENTES_V24.md`.

**Creatividad, guía del adulto para 24–35 meses:** «Dos pasos, muchas historias» permite preparar un comienzo y un final, conservar esa primera versión y compararla con otra contada solo mediante gestos. Cambiar el final modifica el guion y la vista. No hay respuestas correctas ni obligaciones de imitación. La preparación acaba indicando guardar la pantalla y jugar presencialmente, o parar. No se ha creado un juego digital autónomo para menores de tres años ni se amplía aún creatividad para edades mayores.

**Accesos claros:** el inicio destaca los cuatro talleres de v23/v24 con edades y acompañamiento. Las entradas a cada taller aparecen antes de los ejemplos existentes, con un botón explícito. Se puede volver a los ejemplos o a la guía breve conservando la exploración. Los atajos del dashboard y las áreas anteriores siguen disponibles.

## Implementación y progreso

Nuevo módulo `dist/exploration.mjs`: registros fijos, comparación derivada, guiones, validación y vistas. `app.mjs` integra la entrada opcional en dos actividades; `dashboard.mjs` muestra sus accesos junto a los talleres existentes. `styles.css` aporta paneles, dibujos SVG originales y barras decorativas; los valores y diferencias también están en texto. No requiere color, arrastre, animación ni sonido.

`local-progress.mjs` acepta un campo opcional `exploration`, limitado a `7y:extra` y `2y:original`, con valores enumerados. Solo guarda selección de registros o guion del adulto, página y estado de vista. No guarda datos personales, explicaciones, conducta infantil, audio o texto libre. Se conservan registros anteriores y estado de construcción v23; no se borran ni se migran destructivamente. La protección entre pestañas sigue usando el mismo mecanismo.

El formato conserva la versión 4 con extensión opcional, como v23. **Un retroceso a v23 o anterior no podrá interpretar los nuevos registros que incluyan `exploration`; su lector estricto los conserva sin sobrescribir, pero no ofrece ese progreso.** No se promete compatibilidad de lectura por versiones antiguas. La versión actual acepta registros anteriores sin el campo nuevo.

No cambian voz local, cancelación, avisos fuera del catálogo, foco del logotipo, permisos, CSP, servicios, micrófono, cuentas, analítica o gastos. Fuente de ciencias, guía de adulto y matriz de pendientes incluidos. La app sigue siendo un prototipo educativo sin eficacia validada.

## Validación final

| Suite | Resultado |
| --- | ---: |
| Lógica y persistencia | 161/161 |
| DOM | 82/82 |
| Estática | 32/32 |
| Nuevas exploraciones y descubrimiento | 155 comprobaciones |
| Talleres de construcción v23 | 127 comprobaciones |
| Dashboard | 245 comprobaciones |
| Navegación | 219 comprobaciones |
| Voz local | 186 comprobaciones |

**275 pruebas y 932 comprobaciones de navegador aprobadas.** Se cuentan solo las suites ejecutadas. Recorridos en 320, 375, 768 y 1440 px con toque emulado y teclado; selección, comparación, cambio de pregunta/guion, pista contextual, cierre, retorno, pausa y recarga. Se verificaron foco, texto al 200 %, ausencia de desbordamiento y controles de al menos 44 px. El escenario de dos pestañas confirma que una selección desactualizada no sobrescribe el registro científico de la otra. La suite de construcción repite su propia protección entre pestañas.

No se detectaron errores JavaScript ni violaciones CSP en los recorridos nuevos. Las barras se implementaron con clases locales, sin permitir estilos en línea ni cambiar la política. Se revisaron visualmente capturas finales móvil y escritorio. La suite DOM conserva los casos heredados de foco por logotipo y aviso de cancelación de voz. Los diez módulos enumerados en `base-preservation.json` son idénticos a v23, incluidos voz, sesión de progreso y construcción.

Chromium no ofreció voces nativas: la suite de voz usa dobles explícitos de la API. No hubo escucha ni validación de pronunciación. Las pruebas de accesibilidad son comprobaciones técnicas, no una certificación ni pruebas con usuarios de lectores de pantalla.

## Evidencia y ejecución

Resultados JSON y logs: `docs/evidence-v24/`. Capturas finales: `home-375.png`, `home-1440.png`, `comparison-375.png`, `comparison-1440.png`, `creative-375.png`, `creative-1440.png`. Manifiesto: `DELIVERY-V24-SHA256.json`.

Abrir con `npm run serve`, `http://127.0.0.1:4186`. Pruebas nuevas: `npm test` y `npm run test:exploration`. DOM: `NODE_PATH=/tmp/education-test-deps/node_modules npm run test:dom`. Playwright y Chromium pertenecen al entorno de pruebas; no se incluyen dependencias instaladas en la entrega.

## Riesgos y límites

No se ha probado con niños, familias, lectores de pantalla reales ni Safari/iPad físico. Los cuatro registros científicos fijos ofrecen exploración acotada; no modelan incertidumbre, ensayos repetidos ni resistencia real. La preparación creativa debe ser breve y del adulto: guardar la pantalla antes de interactuar con el pequeño. El inicio es más largo en móvil; mantiene atajos de sección. Voz real pendiente de escucha, sin nueva promesa de disponibilidad o pronunciación. Las áreas continúan con profundidad desigual, detallada en `REVISION_AREAS_V24.md`.
