# Recorrido cinematográfico de la finca modelo

## Referencia y alcance

Referencia visual: https://www.instagram.com/reel/DeZTZqLu3SA/ (Agrobull, marcado por Instagram como contenido de IA). Se tomó su secuencia de aproximación aérea, descenso, pasillo y vista cercana de animales, seguida de salida elevada. No se presenta como un render navegable de referencia ni se promete reproducir su realismo.

La finca modelo conserva dos modos seleccionables: **Cinemático** y **Aéreo 360°**. El cinematográfico comienza con la finca completa, se aproxima al módulo porcino, entra por el pasillo libre, mira un cerdo registrado, sale y muestra animales en el exterior y un cultivo antes del panorama. Las áreas, el contorno, los animales y sus posiciones son los registros existentes. No se introducen animales, corrales ni seguimiento GPS.

## Cámara y seguridad

- La ruta se admite por segmentos contra cajas conservadoras de cada sólido: edificios, piezas individuales del galpón, árboles y animales. El volumen de seguridad de la cámara es de 0,35 m.
- Las piezas del galpón conservan sus cajas anteriores a la unión por material; una sola caja agregada habría bloqueado incorrectamente el pasillo.
- Si un pasillo no es viable se prueba una aproximación exterior. No se atraviesan techos ni se eliminan muros para simular una entrada.
- Las transiciones usan una curva quíntica con continuidad de posición, velocidad y aceleración en cada unión. No se añaden esperas en puntos idénticos.
- El toque, los gestos, los controles y las fichas interrumpen el vuelo. La reanudación comienza después de dos segundos sin interacción. Si está bajo techo, busca primero una salida y una columna de ascenso comprobadas.
- Cambiar a Aéreo 360° mantiene el modo anterior disponible. Pausa manual, movimiento reducido, pestaña oculta, ventana inactiva y escena fuera de pantalla siguen bloqueando la reproducción. Un punto manual incrustado en un sólido se queda en pausa y ofrece «Ver toda»; no se teletransporta.

## Detalle visual y coste

Los nueve modelos GLB conservan su anatomía, colores, marcas y archivos originales. Se añade microrelieve muy sutil de piel, pelo, lana o pluma a materiales conocidos, sin alterar ojos, pezuñas, picos ni hocicos. Se comparten como máximo cuatro texturas procedurales de 64 × 64: 64 KiB base, menos de 86 KiB con mipmaps. No hay nuevas descargas ni mallas por esta mejora.

Las sombras concentran la misma resolución alrededor del sujeto próximo; se conserva exactamente la dirección del sol. Durante el vuelo su reencuadre queda limitado a cuatro veces por segundo. La cama y el comedero ilustrativos del módulo porcino se bajan a proporciones de ganado menor, manteniendo cubierta, postes y distribución.

La cámara escribe aproximadamente a 30 Hz. El recorrido no añade animación esquelética: los modelos siguen siendo ilustrativos y el movimiento de animales existente sigue siendo representativo, no medido.

## Comprobaciones

Se comprobaron la ruta completa de la plantilla real de 101 animales durante dos vueltas, cada segmento de cámara y de regreso, la ausencia de puntos duplicados, el pasillo porcino y su plano cercano, salida sin atravesar cubierta, cambio de modo, ajuste al ancho, pausa, gestos, accesibilidad, límites de recursos, sombras y conservación de datos. Se conservan las pruebas del giro aéreo completo y seis relaciones de aspecto.

Las pruebas de escena usan Three.js con un adaptador de render sin GPU. Las previsualizaciones de materiales se revisaron con Blender CPU. No equivalen a una verificación de shaders WebGL, fluidez o FPS en Safari/iOS/Android reales. El navegador disponible no permite WebGL; ese límite debe mantenerse explícito en la entrega técnica.
