# Animales reconocibles y detalle adaptativo · 2026-10-14

## Hallazgos

- Solo los primeros 18 registros seleccionados recibían GLB. Los demás conservaban primitivas incluso al acercarse a ellos.
- El porcino GLB tenía piel muy pálida, ojos desproporcionados, orejas pequeñas y patas relativamente largas. El bovino tenía rostro corto y orejas poco legibles.
- La microtextura por sí sola no corrige anatomía ni silueta. No se cambió la exposición global ACES (.95), que también afecta al resto de la finca.

## Cambios

- Ajuste único previo al instancing de las mallas CC0 existentes: cuerpo porcino más ancho, piernas más cortas, hocico más largo; ojos más pequeños, orejas amplias afinadas y rosado natural más visible. Bovino con rostro más largo e inclinado, orejas laterales y ojos menores. Geometría de ojos/hocico/piel se transforma en el mismo campo espacial.
- Materiales biológicos sin metalicidad. Se conservan mapas embebidos, UV, licencias y bytes originales. Orejas se fusionan con la piel, sin draw calls nuevos.
- Fallback porcino/bovino reconstruido con proporciones diferenciadas, morro plano con narinas, pezuñas partidas, cola rizada/cola con mechón, orejas y manchas. Sigue siendo deliberadamente ligero e ilustrativo.
- Todos los registros de especies con GLB son elegibles al acercarse, conservando las 20 especies y hasta128 posiciones. Selección por cercanía <=90m con máximo18 detalles en equipos modestos,48 desconocidos/intermedios,128 equipos con >=8GiB y >=8hilos. Los restantes usan fallback.
- El contador real `InstancedMesh.count` se compacta por especie/material: no basta con matrices cero, que aún ejecutarían todos los vértices del GLB. El picking se remapea al id correcto y el movimiento omite representaciones inactivas. No hay animaciones adicionales ni bucles nuevos; recálculo con desplazamiento de cámara >=.5m o nueva carga.

## Presupuesto y límites

- GLB bovino: 5.664→6.000 triángulos; porcino5.131→5.467. Máximo animal GLB6.000, <=8 materiales. Hasta108k/288k/768k triángulos de detalle según nivel, además de fallback y paisaje. En101 animales, máximo606k si todos están cerca en equipo superior. La carga total sí aumenta frente al antiguo tope18, por eso se conserva degradación por equipo/distancia.
- Transferencia del paquete: sin cambios; mismos16 recursos, hashes y cache offline. Geometría/materiales compartidos; sin nuevos paquetes, descargas externas o pagos.
- No se ha medido FPS/temperatura/memoria GPU en móviles. Los renders CPU no equivalen a WebGL de producción ni demuestran hiperrealismo; las mallas siguen mostrando simplificación.

## Evidencia

- `comparison.webp`: render CPU de buffers y materiales exactos exportados desde Three, con comparativa antes/después y fallback. Blender Cycles20 muestras, sin denoiser (no disponible); iluminación propia y AgX, diferentes del renderer de la app. Revisión visual permitió corregir una primera piel demasiado oscura y unas primeras orejas demasiado ovaladas.
- Reproducir: `node scripts/export-animal-review.mjs /tmp/farm-animal-review`; `blender -b -t 4 --python scripts/render-animal-review.py -- /tmp/farm-animal-review`.
- 63 pruebas focalizadas de modelos, materiales, activos, catálogo de escena, movimiento y nuevo LOD aprobadas. TypeScript sin errores.
- Ningún despliegue realizado por esta tarea.

La corrida paralela amplia `tests/farm-*.test.mjs` mostró una carrera en la prueba existente de cancelación offline; repetida aisladamente aprobó (1/1). No se modificó ese flujo. La corrida amplia también identificó dos expectativas antiguas de material de paisaje y una expectativa de ocultación global incompatible con el nuevo LOD por instancia; se coordinó su actualización.
