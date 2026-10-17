# Entorno inmersivo y exploración de recintos

## Alcance

- Cielo panorámico procedural continuo en todos los giros, con horizonte suave y sin descargar fotografías. Se conserva el sol y la iluminación aprobados.
- Pradera exterior con relieve ilustrativo, hierba, arbustos, árboles y palmeras. El collar contiguo al terreno permanece plano y la malla conserva el agujero exacto del contorno, incluidas formas cóncavas. Las plantas exteriores dejan espacio libre alrededor del límite y de los accesos.
- Línea y pequeñas marcas claras sobre el perímetro guardado. Se identifica expresamente el paisaje exterior como ilustrativo; no hay fincas vecinas identificadas, propietarios inferidos ni áreas exteriores seleccionables.
- Recinto → lista de animales vinculados → expediente individual. También disponible en la vista ligera, para equipos sin WebGL. Un segundo toque sobre un animal del recinto seleccionado abre su expediente en 3D.
- Galpones y vaqueras con interior procedural original y cubierta que puede ocultarse. Suelos, postes, pasillo y comederos son ilustrativos; no crean registros. Cerrar, Escape o restablecer recuperan techo y cámara.
- Movimiento de raíz representativo de hasta 8 animales próximos en el potrero/corral seleccionado. Sus recorridos conservadores, de desplazamiento máximo 0,9 m, permanecen dentro de ambos polígonos y evitan obstáculos y otros animales. No es animación esquelética, comportamiento medido ni seguimiento real. La posición guardada nunca cambia.
- Pausa manual, movimiento reducido, panel abierto, pestaña oculta, ventana inactiva, escena fuera de pantalla o cámara lejana suspenden la animación. El animal inspeccionado vuelve a su posición guardada y queda quieto. El recorrido de cámara se suspende mientras se explora un recinto.

## Datos y acceso

La geometría aprobada de la finca modelo sigue siendo 400 × 250 m (10 ha), con 41 áreas, 101 animales, 6 cultivos y 64 árboles + 21 palmeras interiores/de borde. Los ejemplos de salud y reproducción añadidos por la función de expedientes son ficticios, están etiquetados y no cambian los animales ni el terreno. El exterior no se incorpora al inventario ni al editor.

Se mantiene el sitio privado del propietario. No se añaden servicios de pago, dependencias, fuentes remotas o licencias nuevas obligatorias. Se reutilizan Three.js y los recursos locales ya documentados. La publicación privada no equivale al lanzamiento público de la plataforma.

## Presupuesto y comprobaciones

- Recursos offline 3D: los mismos 16 archivos, 2.434.312 bytes, con los mismos hashes/licencias.
- Exterior: 35.068 triángulos instanciados y 9 mallas dibujables, más la línea de perímetro, según inspección CPU. Sin sombras de la vegetación lejana; hierba y arbustos dejan de dibujarse al alejarse. Panorama generado de 512 × 256 RGBA (512 KiB de datos en memoria, sin descarga).
- Movimiento: como máximo 20 actualizaciones de pose por segundo; refresco de sombras limitado a 4 por segundo. No hay bucle de animales activo en la vista general. La geometría se comparte mediante instancias.
- Pruebas CPU de continuidad del cielo, orientación del terreno, contacto de las plantas con la triangulación real, concavidad, separación exterior/inventario, techo, cámara, pausa/visibilidad, restauración de matrices, cambio tardío de modelos, limpieza y límites de perspectiva. Son pruebas del grafo/contratos, no de una GPU real.
- Se comprobó la composición del terreno y el interior mediante una aproximación renderizada por CPU. Sus materiales, luces, cielo y rasterización no equivalen a WebGL.

El navegador de nube tiene WebGL deshabilitado y la simulación de red bloqueada por la organización. No se eluden esas restricciones ni se certifican FPS, modo avión físico o Safari/iOS/Chrome Android reales. La vista ligera y los expedientes se verifican por separado en ese navegador.
