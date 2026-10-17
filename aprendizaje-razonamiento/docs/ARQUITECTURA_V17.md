# Arquitectura y privacidad v17

Base fuente exacta: `21bf6cc800ff6d09e03f4ea526018a8dd31a54ac`. La referencia Sites `d6025c28a74792c23b5f6ebe70b09afb7093e4b2` se conserva únicamente como dato comunicado, no se usa como base distinta. Rama local: `feat/education-science-v17-local`.

## Ciencia

- `science-games.mjs`: dos juegos, cuatro misiones cada uno, opciones, evidencias, evaluador y metadatos del catálogo. Claves estables `5y:biology` y `5y:chemistry` (5y es el identificador heredado de la etapa rotulada 6–8).
- `science-art.mjs`: SVG originales sin recursos externos, eventos, scripts ni IDs duplicables.
- `science-games-ui.mjs`: tutorial, mapa de misiones, selección de ficha/razón, explicación por elección, pista, reintento y cambio de misión sin obligación de acertar. Utiliza pausa y cierre existentes.
- Se añaden solo al área Ciencia y a su propia disciplina. No duplican las actividades de lenguaje, razonamiento o física. Biología y Química muestran «Juego piloto disponible», con el itinerario completo aún pendiente.
- Catálogo total: 22 entradas, 19 digitales (10 heredadas + 6 idiomas + Dani + 2 ciencias), 2 guías adultas y 1 unidad familiar.
- Codec v4, misma clave de progreso. Lee v1/v2/v3 sin escribir; migra al guardar. Estado science: página/índice y cuatro pares de IDs de ficha/razón con revisión booleana; rechaza texto libre, campos desconocidos, IDs cruzados y estados fuera de rango. `progress-session.mjs` no cambia: preserva protección Web Locks y límite de coordinación optimista alternativo.

## Dani: cuatro momentos y decisiones transitorias

1. Explorar una emoción posible (opcional, sin evaluación).
2. Elegir pausa, compañía o nueva base.
3. Elegir una de dos acciones propias de ese camino; aparece su consecuencia narrativa.
4. Elegir compartir o parar; doce combinaciones de final. Volver y explorar otro camino son opcionales.

Los datos de `storyBranches`, `storyClosings` y `storyEnding` son contenido fijo. Las elecciones de una partida viven exclusivamente en el cierre JavaScript de `renderReflection`: no se añaden a `states`, codec, URL, almacenamiento ni mensajes analíticos. Pausar, salir o recargar descarta esas elecciones, con aviso visible. Se guarda solo el estado ordinario de sesión. Las pruebas comparan el registro completo de localStorage antes y después de los doce caminos.

## Avatar: diagnóstico y corrección

Hallazgos de código v16: sin preferencia guardada no se renderizaba figura; «Crear acompañante» era necesario. El panel estaba después de la portada. La clase `garden-focus` ocultaba el bloque entero en Jardín y Palabra escondida. No se inspeccionó el navegador personal del usuario: esto explica condiciones reproducibles, no demuestra qué condición concreta tenía su dispositivo.

v17 presenta una muestra neutral en la primera visita, sin escritura automática. Respeta `visible:false`: no fuerza una figura ni la miniatura. Mostrar/personalizar permanece accesible. El mismo nodo del acompañante se traslada a un panel `details` compacto dentro de cada actividad activa; su miniatura, pistas y apariencia no tapan controles. No es un segundo perfil ni un segundo almacenamiento. Al rerenderizar la actividad, primero se recupera el nodo en `companion-home` para conservar su controlador; después se inserta en el nuevo panel. Se puede usar la ayuda sin abandonar los juegos concentrados ni reconstruir la historia transitoria.

La apariencia sigue en la clave separada v1, validada. Ocultar, mostrar, olvidar y personalizar no borran progreso. La navegación «Mi acompañante» abre el panel dentro del juego sin salir de su modo concentrado. No se añade chat libre, inferencia psicológica, cuentas, nombres, fotos ni adaptación automática por edad. Las pistas siguen siendo deterministas y ahora incluyen la misión científica actual.

## Ejecución y límites

`npm test`; `NODE_PATH=/tmp/education-test-deps/node_modules npm run test:dom`; `npm run test:static`; `npm run test:browser`; `npm run test:navigation`; `npm run test:routes`; `npm run test:science`; `npm run test:story`. Servidor local: `npm run serve`, 127.0.0.1:4186. Evidencias nuevas en `docs/evidence-v17`.

Sin dependencias nuevas de ejecución, red de contenidos, cambios de CSP, permisos, workflows, servicios o gastos. Chromium Linux con tamaños de pantalla y toque simulados no equivale a Safari/iPad físico. No se afirma funcionamiento offline ni validación pedagógica o certificación WCAG.
