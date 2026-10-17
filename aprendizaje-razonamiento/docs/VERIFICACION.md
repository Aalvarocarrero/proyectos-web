# Verificación · prototipo 0.3

Fecha: 2026-10-16.

## Resultado ejecutado

- `node --check dist/logic.mjs`, `node --check dist/app.mjs` y `node --check tests/browser.cjs`: pasan.
- `npm test`: 33 pruebas pasan. Incluye las 16 originales, invariantes de presupuesto, ventanas aprobadas, fases, secuencia y cada respuesta del caso de evidencia.
- `npm run test:static`: 31 comprobaciones pasan. Idioma, estructura, CSP, ausencia de red/persistencia/temporizadores, botones, etiquetas, estados, contraste de las combinaciones medidas, foco y estilos responsivos/reduced-motion. No es una auditoría WCAG.
- `NODE_PATH=/workspace/scratch/1cce691d0fde/alvaro-content-admin/node_modules npm run test:dom`: 16 recorridos pasan usando una copia preinstalada de jsdom; no se modificó ese otro proyecto. Incluye onboarding, todas las actividades, respuestas incorrectas y correctas, pausa/reanudar, cambio de etapa, cierre anticipado, reinicio, IDs únicos y ausencia de almacenamiento.
- No hay compilación ni dependencias de producción.

Los resultados de lógica y DOM están en `unit-test-results.txt` y `dom-test-results.txt`; el resultado estático en `static-a11y-report.json`.

## Navegador: bloqueado, no pasado

Chromium instalado falla al arrancar antes de cargar la página: `socket() failed: Operation not permitted`. Se comprobó una vez en el entorno normal y una vez mediante el intento permitido con permisos ampliados. Ambos fallaron en la revisión anterior. Un nuevo intento normal durante 0.3 confirmó el mismo bloqueo; no se intentó evadirlo. La restricción es de ejecución, no un fallo conocido de la aplicación.

`tests/browser.cjs` se ha actualizado para los nuevos flujos y está listo para un entorno autorizado con sockets. No ha sido ejecutado con éxito. Generará capturas y `browser-report.json` solo tras una ejecución real. No se generaron capturas ni se simularon resultados de navegador.

## Límites pendientes

Las pruebas DOM no renderizan CSS, no comprueban orden visual ni simulan un lector de pantalla. Quedan sin verificar visualmente: desbordamiento a 320/375/768/1440 px, zoom 200–400 %, tamaño real de elementos, foco/teclado en navegador y tecnologías de asistencia, Safari/iPad y Android. El CSS declara tamaños de objetivo de al menos 44 px y movimiento reducido; eso es evidencia de fuente, no prueba de comportamiento real.

La lógica no demuestra resultados educativos, diagnóstico, adecuación clínica ni validez del currículo. Hace falta revisión pedagógica, de materiales y pruebas de comprensión con el consentimiento adecuado.

## Publicación

No se ha hecho push, guardado remoto ni despliegue de esta revisión. El sitio existente no cambia hasta revisar y autorizar el siguiente paso.

## Revisión independiente de fuente

La revisión independiente no encontró bloqueos críticos o altos en actividades, estado, privacidad o tiempos. Detectó que el feedback vacío estaba oculto con `display:none`, con riesgo de que un lector de pantalla no anunciara la primera respuesta. Se corrigió para mantener la región viva expuesta al estar vacía y se añadió una comprobación estática. La confirmación con tecnología de asistencia sigue pendiente. Los documentos se actualizaron a 0.2 y a los rangos aprobados.


## Cobertura añadida en 0.3

- Se comprueban todas las opciones correctas e incorrectas de los ocho nuevos pasos, límites y entradas inválidas.
- Catálogo: selección explícita, memoria aislada, ida y vuelta entre propuestas, pausa y reinicio sin afectar a otras actividades.
- Hints: primer nivel, segundo nivel, límite de pistas, persistencia al pausar y limpieza al pasar a la siguiente idea.
- Cambiar de respuesta elimina el éxito previo y oculta la continuación.
- Todos los retos nuevos: cierre natural, transferencia específica, foco tras siguiente paso, IDs únicos, controles nativos y ausencia de almacenamiento.
- La selección de la reflexión del puente conserva aria-pressed incluso tras una respuesta incorrecta y una pausa.
- La inspección estática incluye ahora todos los módulos JavaScript de dist, no solo el controlador.
- El script de navegador incorpora los cuatro nuevos recorridos y comprobaciones móviles; sigue sin ejecutar con éxito. Los resultados estáticos/DOM no equivalen a capturas ni prueban contraste de todo estado nuevo.

## Revisión independiente del candidato 0.3

Se revisó bb8b48c frente a 702019b. Las ocho actividades mantienen cierre voluntario, ventanas breves y ausencia de premios por permanencia; las dos guías para menores de tres años siguen dirigidas al adulto y al juego sin pantalla. No se detectó un bloqueo de lógica o contenido. Se corrigieron dos inconsistencias menores: la etiqueta de pista agotada tras pausa/reanudación y la descripción accesible de B1 bloqueada. Se añadió una regresión DOM específica.

Resultado: aprobación de código y contenido para revisión privada, con reserva de verificación visual. Pasan 33 pruebas de lógica, 16 recorridos DOM y 31 comprobaciones estáticas. El navegador de nube también se intentó mediante sus herramientas admitidas; la creación/selección de la pestaña falló con `Emulation.setFocusEmulationEnabled timed out`, antes de cargar el candidato. No hay capturas nuevas ni verificación móvil real. No se repitió ni se intentó evitar la restricción del Chromium local. No se publicó ni desplegó.
