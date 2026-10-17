# v23 · Construir, probar y revisar

Base exacta publicada: `8d4da886c73b4aa483cdf37a1d39cfd8fe7c4755`, rama `feat/education-dashboard-v22-source`. Trabajo exclusivamente local en `feat/education-depth-v23-local`. No hay subida remota ni publicación Sites.

## Dos actividades ampliadas

**¿Qué viene después? · Matemáticas · 3–5 años con adulto.** Además de los ejemplos existentes, se elige una pareja círculo/triángulo y se construyen tres grupos. El orden elegido tiene efecto en la regla; ambas variantes son válidas. La segunda parte cambia el motivo a tres piezas conservando la fila anterior: hay que probar y revisar. Una pista contextual explica el grupo; los errores indican dónde mirar, sin puntuación ni castigos. El cierre recupera la construcción propia y propone gestos fuera de pantalla.

**Un mensaje que se entiende · Lenguaje · 6–8 años con adulto.** Se construye un mensaje de hasta seis direcciones. Al probar, se muestra el recorrido real y dónde acaba; salir del tablero o entrar en una casilla bloqueada conserva la última posición válida. Después aparece un bloqueo en B1 y se conserva el plan para revisarlo. Se admiten caminos distintos; si un plan ya evita B1, sigue siendo válido. El cierre muestra el mensaje elegido y propone explicarlo a otra persona sobre papel.

Acceso: inicio → Matemáticas/Lenguaje → actividad → «Abrir el taller de construcción». Entrada visible antes de los ejemplos; no exige respuestas correctas previas. Se puede volver a los ejemplos sin perder la construcción. Pausa y terminar siguen siempre arriba. El recorrido no añade arrastre, temporizadores, animaciones ni requisitos de precisión motora.

La revisión de las 22 entradas y los pendientes por área están en `REVISION_AREAS_V23.md`. No se afirma que todas las áreas estén completas o tengan igual profundidad.

## Archivos y compatibilidad

- `dist/construction.mjs`: reglas, evaluación derivada, validación acotada y renderizado de ambos talleres.
- `dist/app.mjs`: entrada opcional dentro de las actividades y ayuda de Luma ajustada al contexto de construcción.
- `dist/local-progress.mjs`: campo opcional `construction`, permitido solo para estas dos actividades; valida símbolos, longitudes, pasos y cierre. No almacena mensajes derivados, nombres, texto libre ni audio.
- `dist/activities.mjs`: objetivos editoriales de las dos actividades actualizados.
- `dist/styles.css`: controles y disposición adaptable sin movimiento.
- Pruebas nuevas de lógica/persistencia y recorridos de navegador; evidencia histórica preservada en su carpeta original.

Los registros anteriores siguen siendo válidos sin migración destructiva; las elecciones de los ejemplos no se sustituyen. Se conserva la protección entre pestañas. El formato sigue siendo una extensión opcional de la versión 4 actual. **Compatibilidad hacia atrás de la app:** una v22 antigua no entiende el campo nuevo; si se retrocede de versión, su lector estricto rechazará ese registro y lo conservará sin sobrescribirlo. No se promete lectura de construcciones v23 por versiones anteriores.

Se mantienen las correcciones heredadas de foco al volver mediante el logotipo y del aviso de cancelación de voz fuera del catálogo. Los módulos de voz local no cambian. Tampoco cambian permisos, CSP, servicios, cuentas, analítica, gastos o contenido científico. Los menores de tres años conservan sus guías de adulto fuera de pantalla.

## Validación final

| Suite | Resultado |
| --- | ---: |
| Lógica y persistencia | 158/158 |
| DOM, incluidas correcciones heredadas v22 | 82/82 |
| Estática | 32/32 |
| Talleres de construcción | 127 comprobaciones |
| Navegación | 219 comprobaciones |
| Voz local | 186 comprobaciones |
| Dashboard | 245 comprobaciones |

**272 pruebas y 777 comprobaciones de navegador aprobadas.** Solo se cuentan las suites ejecutadas para v23. Los talleres se recorrieron en 320, 375, 768 y 1440 px, con teclado, toque emulado, foco, reintento, regla nueva, pausa/recarga, vuelta a ejemplos e inicio y cierre. Se verificaron texto al 200 %, controles de al menos 44 px, ausencia de desbordamiento horizontal y protección de la construcción frente a una pestaña desactualizada. Revisión visual de capturas móvil y escritorio. El entorno informó cero voces nativas: la suite de voz usa dobles explícitos y no valida acústica.

Los diez módulos indicados en `base-preservation.json` son idénticos byte por byte a la base corregida, incluidos voz local, aviso externo, sesión de progreso y bienvenida. El cambio de `app.mjs` añade el taller y su ayuda; conserva el retorno por logotipo heredado, cubierto por la suite DOM.

## Evidencia

Resultados finales y comandos en `docs/evidence-v23/`; manifiesto SHA-256 en `DELIVERY-V23-SHA256.json`. Las capturas `patterns-375.png`, `patterns-1440.png`, `message-375.png` y `message-1440.png` muestran las construcciones revisadas.

Para abrir: `npm run serve` y `http://127.0.0.1:4186`. Pruebas: `npm test`, `npm run test:static`, `npm run test:construction`; DOM con `NODE_PATH=/tmp/education-test-deps/node_modules npm run test:dom`. Navegador: Playwright con Chromium de nube; dependencias de prueba fuera de la entrega.

## Límites

Revisión editorial y automatizada, no evaluación de eficacia con niños o familias. Pendientes lectores de pantalla reales, Safari/iPad físico y escucha de voces locales. No se ha añadido vocabulario ni se ha validado pronunciación. El número de piezas puede necesitar ajuste tras observación acompañada de niños de 3–5 años; el adulto puede pulsar, señalar o parar en cualquier momento. Los talleres conservan una representación y un cambio de condición por recorrido; no son un currículo completo.
