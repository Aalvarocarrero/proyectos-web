# Ejemplos completos y continuidad del recorrido

Base: v100, commit 9e519def556a0efa7fdd38dce3a1003501660213.
Alcance: cambios locales; no despliegue ni cambios de acceso.

## Diagnóstico

- El menú y el primer inicio ya apuntaban a `/finca-modelo`, pero la tarjeta «Ver ejemplos de esta área» abría `/finca-demo?area=...`: un editor de práctica cuyo apartado de terreno muestra el plano, no la presentación completa.
- El recorrido ya tenía salida segura del galpón. Su secuencia de apertura tardaba aproximadamente 46 segundos de tiempo de animación en salir, y pausar/reanudar o suspender/reanudar reiniciaba el vuelo desde el comienzo. No se reprodujo un bloqueo infinito con un renderizador WebGL real.

## Cambios

- Entrada principal de la tarjeta a `/finca-modelo`, conservando un enlace secundario explícito a la práctica editable del área.
- Primer inicio mediante enlace nativo: abrir ejemplos no escribe preferencias ni ejecuta el callback de continuar.
- Se mantiene el modelo de solo lectura de 10 ha: 3D primero, alternativa 2D y consulta de registros. Sin modificaciones a fixtures, stores o prácticas guardadas.
- Apertura cinematográfica más breve: salida del galpón dentro de 26 segundos de tiempo de animación; después animales, dos cultivos distintos y panorama completo.
- Pausa, visibilidad y bloqueos conservan el punto del vuelo cuando la cámara no cambió. Un movimiento manual o un cambio de ruta conserva el retorno comprobado contra obstáculos.
- Notificaciones repetidas de la misma vista general no reinician la secuencia.

## Verificación

- `npm test`: build de producción correcto y 968 pruebas correctas en primera pasada.
- `node --test tests/*.test.mjs`: 972/972 correctas tras incorporar las nuevas pruebas de navegación.
- `tsc --noEmit`: correcto.
- ESLint de los archivos modificados: correcto.
- `git diff --check`: correcto.
- Prueba de escena con Three.js, OrbitControls y controlador reales, renderizador simulado: recorre cada punto del itinerario después de dos pausas; verifica salida, dos cultivos, panorama, colisiones y conservación de datos.
- Pruebas de navegación incluyen almacenamiento vacío y bloqueado; el enlace principal no escribe ni reemplaza la práctica.

La suite paralela emite avisos no fatales de HMR/optimización de caché de Vite (puerto ocupado y ENOTEMPTY); proceso finaliza con código 0 y todas las pruebas pasan.

## Límites

No se validaron píxeles, fluidez ni gestos en GPU/WebGL real; los tests de escena sustituyen el renderizador y la carga de modelos. El tiempo de animación excluye pausas y puede diferir del tiempo de reloj con baja frecuencia de cuadros. No se arrancó otro navegador ni se utilizaron rutas de despliegue con credenciales. La verificación visual en un dispositivo compatible sigue pendiente.
