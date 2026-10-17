# v25 · Creatividad para 9–12 años

Base exacta publicada: `3886d442273df2ffebcc9d72af2815b9d3d67947`, rama `feat/education-science-creativity-v24-source`. Entrega exclusivamente local en `feat/education-creative-studio-v25-local`. No se ha subido ni publicado.

## Taller original

«Un cartel, varias versiones» permite componer un cartel imaginario con libro, hoja, estrella y flecha en una cuadrícula de tres por tres. Se elige una pieza y una casilla con botones nativos, se sustituye o borra sin arrastrar y se puede deshacer el último cambio. Las figuras SVG son originales de esta implementación; no se incorporan imágenes, fuentes o materiales de terceros.

La segunda parte cambia la condición: imaginar una impresión sin color. Se conserva la primera versión y se ofrece una alternativa editable en blanco y negro. Se puede cambiar la distribución o conservarla; ambas opciones son válidas. La persona elige una intención de diseño entre frases acotadas, sin texto libre, confesiones o evaluación personal. Editar de nuevo elimina la intención anterior para que no quede asociada accidentalmente a otro diseño.

El cierre muestra ambas versiones y la intención elegida. Permite probar otra alternativa o terminar, y propone dibujar con dos formas fuera de pantalla. No hay puntuación, interpretación de personalidad ni promesa de mejorar capacidades. La franja 9–12 es una decisión editorial pendiente de revisión con usuarios.

## Integración y acceso

Nueva clave estable `7y:composition` (7y es el identificador histórico de la franja 9–12). El dashboard ofrece cinco talleres y abre este directamente. Creatividad muestra dos rutas claramente separadas: guía del adulto 24–35 meses y cartel 9–12. Se añaden ayuda de Luma e ideas de acompañamiento específicas; no se heredan las instrucciones del presupuesto de la otra actividad de 9–12.

`composition.mjs` contiene metadatos, estado, edición, comparación y vistas. `catalog.mjs`, `app.mjs`, `dashboard.mjs`, `facilitation.mjs` y `local-progress.mjs` integran la actividad. `state-validation.mjs` endurece de forma acotada los estados de talleres: detalle y casos reproducidos en `VALIDACION_ESTADOS_V25.md`.

Se conservan las actividades y datos previos. La app pasa de 22 a 23 entradas; se actualizaron las expectativas explícitas de inventario a 20 digitales, dos guías y una unidad, sin retirar la comprobación. La suite de acompañamiento suma la nueva guía. El entorno DOM ahora simula `scrollIntoView`, que jsdom no implementa; las pruebas específicas pueden sobrescribir ese stub y el desplazamiento real se comprueba en Chromium.

## Progreso y rollback

Se guardan únicamente nueve identificadores de piezas, referencia, un nivel de deshacer, herramienta, paso, pista e intención enumerada. No hay nombres, texto libre, grabaciones ni datos de conducta. Pausa, recarga y vuelta al inicio conservan la composición; las pestañas desactualizadas no pueden sobrescribir otra versión guardada. Se mantiene la coordinación existente, incluidos sus límites documentados cuando Web Locks no está disponible.

Los estados válidos v23/v24 siguen siendo legibles. El formato mantiene versión 4 con el campo opcional `composition` y la nueva clave de actividad. **Al guardar un cartel, una v24 o anterior no reconoce ese estado y rechazará el registro completo; lo conserva sin sobrescribirlo, pero no podrá mostrar ese progreso.** No se promete lectura en una versión anterior ni se realiza migración destructiva. Estados inválidos se rechazan sin reparar o borrar datos automáticamente.

Voz local, cancelación, avisos fuera del catálogo, preferencias de bienvenida y privacidad de Dani permanecen. No se cambian permisos, CSP, servicios, cuentas, micrófono, analítica ni gastos.

## Validación final

| Suite | Resultado |
| --- | ---: |
| Lógica y persistencia | 165/165 |
| DOM | 84/84 |
| Estática | 32/32 |
| Navegador general | 227 comprobaciones |
| Navegación | 218 comprobaciones |
| Rutas | 77 comprobaciones |
| Ciencia | 110 comprobaciones |
| Dani y acompañante | 118 comprobaciones |
| Correcciones previas | 110 comprobaciones |
| Ayudas | 59 comprobaciones |
| Bienvenida | 196 comprobaciones |
| Correcciones de bienvenida | 145 comprobaciones |
| Voz local | 186 comprobaciones |
| Dashboard | 245 comprobaciones |
| Construcción v23 | 127 comprobaciones |
| Exploración v24 | 155 comprobaciones |
| Composición v25 e integración de cinco talleres | 183 comprobaciones |

**281 pruebas y 2.156 comprobaciones de navegador aprobadas.** Se ejecutaron todas las suites disponibles, incluida la nueva. La cuenta de navegación pasa de 219 a 218 porque hay una combinación vacía menos y una entrada real más; no se retiraron comprobaciones de recuperación de áreas vacías.

El editor se verificó en 320, 375, 768 y 1440 px, con teclado, toque emulado, foco de casilla/paso/pista, texto al 200 %, controles de al menos 44 px y ausencia de desbordamiento. Se recorrieron creación, alternativa sin color, edición, intención, deshacer, pausa/recarga, inicio/continuación, otra alternativa y cierre. En los cinco talleres se comprobó ayuda, Escape, pausa/continuación y retorno por logotipo. Una pestaña desactualizada no sobrescribió el cartel guardado por otra.

Los diez módulos de `base-preservation.json`, incluidos voz local y sesión de progreso, son idénticos byte por byte a la base. Los validadores de construcción/exploración sí cambian y tienen regresiones específicas. Las capturas finales móvil y escritorio se revisaron visualmente. Las suites finales no presentan errores JavaScript; Chromium nativo sigue sin voces, por lo que las comprobaciones de reproducción usan dobles explícitos de API y no validan pronunciación.

## Evidencias y uso

Capturas móvil/escritorio de creación y comparación en `docs/evidence-v25/composition-create-*.png` y `composition-compare-*.png`; informes JSON y logs en la misma carpeta. Manifiesto SHA-256 en `DELIVERY-V25-SHA256.json`. Matriz de pendientes: `REVISION_AREAS_V25.md`.

Ejecutar `npm run serve` y abrir `http://127.0.0.1:4186`. Pruebas: `npm test`, `npm run test:composition`, `npm run test:static`; DOM con `NODE_PATH=/tmp/education-test-deps/node_modules npm run test:dom`. Las dependencias de prueba están fuera de la entrega.

## Límites

Un solo tema, cuatro figuras y nueve posiciones; no es un curso de arte ni un lienzo libre. Deshacer conserva solo la última edición, no un historial ilimitado. La vista comparativa exige desplazamiento vertical en móvil. Faltan pruebas con familias, lectores de pantalla reales y Safari/iPad físico. La comprobación técnica de accesibilidad no equivale a certificación. Las voces locales siguen pendientes de escucha real; no se añadió audio ni se afirma disponibilidad no verificada. La matriz mantiene pendientes concretos para las demás áreas.
