# Comprobaciones de la entrega

## Comprobado

- 50 controles de conservación del contenido original: textos, 183 enlaces originales, seis servicios, oferta de revisión, campos de formularios y archivos.
- 60 controles adicionales de galerías: orden de fotografías, correspondencia de entradas, capítulos y avisos de procedencia.
- 35.250 aserciones de interacción mediante pruebas de DOM simulado: apertura/cierre, detalles, capítulos, cambio de colecciones, teclado, foco, posición, formularios y controles sociales.
- Seis rutas y 443 referencias locales sin destinos ausentes.
- Sintaxis de 16 archivos JavaScript y comprobaciones léxicas/de recursos de 13 archivos CSS.
- Ajuste de 66 imágenes en 110.880 casos geométricos, con anchuras de 320 a 2560 px y distintas alturas de la zona de imagen.
- 411.134 estados de transición: imagen principal centrada, sin giro ni desplazamiento lateral, con escala entre 0,96 y 1 respecto al encuadre ajustado.
- 1.200 eventos simulados de redimensionamiento, incluidos cambios de altura en móvil, orientación y área visible.
- Archivos visuales y PDF conservados sin cambios al corregir el encuadre.

## Límite de esta comprobación

Las pruebas de geometría verifican el resultado después de recalcular el encuadre. Las pruebas de DOM simulado no son una ejecución real en Safari, Chrome o un dispositivo físico.

Se inspeccionó la captura móvil que mostraba el recorte a la derecha y se corrigieron las causas de desbordamiento y movimiento de la imagen principal. No se pudo realizar una nueva comprobación visual autenticada del sitio después del cambio. La revisión en ordenador y móvil por parte del propietario sigue siendo el paso final de aceptación.

No se enviaron formularios, correos ni mensajes de prueba, no se hicieron pagos y no se publicaron cambios en producción.
