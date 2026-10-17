# El jardín de los caminos · piloto jugable

17 de octubre de 2026. Diseño y gráficos originales; sin copiar interfaces ni materiales de las referencias.

## Qué se implementa

Juego destacado de 6–8 años orientativos. Construir instrucciones y ver sus consecuencias, no elegir respuestas de un cuestionario.

1. Mueve: dos desplazamientos hasta una flor, con flechas que significan una casilla en una dirección fija del tablero.
2. Construye: crea y ejecuta una ruta con una piedra, aceptando distintas soluciones.
3. Repara: aparece una piedra nueva; conserva una copia del plan anterior (o un ejemplo explícito cuando se entra directamente), detiene el personaje antes del bloqueo y permite quitar flechas o rehacer la ruta.
4. Juega en papel: inventa un jardín dibujado, da instrucciones, cambia una condición e intercambia el papel de creador con quien acompaña.

Todas las partes están disponibles desde el inicio. Cada movimiento requiere un clic: sin autoplay, cronómetro, puntos, premios, rachas ni exigencia de completar. Se puede pausar y terminar en cualquier parte. El límite de 12 flechas es una restricción explícita del tablero, no una puntuación. Editar devuelve el personaje al inicio y conserva el resto del plan; reiniciar la ejecución no borra las flechas. Al llegar se explican las flechas que no hicieron falta.

## Niño y adulto

El tablero visible, las flechas y el movimiento constituyen la actividad principal. Las ayudas son opcionales, graduadas y contextuales. Cada parte tiene una nota breve para el adulto: modelar una acción, preguntar antes de corregir y retirar apoyo. Puede señalar y otra persona pulsar. La actividad física se propone en papel y con el dedo, sin caminar mirando una pantalla ni objetos pequeños.

Conserva la ventana orientativa de 5–10 minutos del prototipo. No es una duración ideal ni recomendación clínica. Las rutas de menores de tres años siguen dirigidas al adulto y al juego presencial. No se amplía todavía el currículo de 18 meses a 18 años.

## Integración y privacidad

El juego es el punto de entrada de 6–8 años y tiene acceso destacado en portada. Se mantienen los ocho retos, las guías y la unidad de comparación. El estado de cada actividad es independiente y temporal en la pestaña. Recargar lo elimina. No hay nuevos campos de datos, almacenamiento persistente, analítica, llamadas de red, cuentas infantiles ni evaluación de capacidades.

## Verificación y límites

Se añaden seis pruebas puras del motor y tres recorridos DOM. Cubren movimiento unitario, distintas rutas válidas, bloqueo y borde, edición, repetición, flechas sobrantes, ausencia de ruta, todas las partes accesibles, copia no destructiva del plan, límites, nombres, foco, estados independientes, pausa y salida. El recorrido automático antiguo selecciona explícitamente la historia conservada para no confundir el nuevo punto de entrada con una regresión.

Validación final del código: 46 pruebas de lógica/contenido, 25 recorridos DOM y 31 comprobaciones estáticas. La evidencia visual del despliegue se entrega por separado tras observarlo; estas pruebas no demuestran disposición visual ni certifican WCAG, dispositivos o pedagogía.

Se consideró una revisión de diseño independiente centrada en representación inequívoca de flechas, bloqueo explicativo, edición reversible, apoyo lector, agencia y transferencia segura. No constituye revisión de un profesional educativo ni ensayo de eficacia. Fundamentos generales ya consultados: NAEYC (apoyo graduado y participación diversa) e IES/WWC (representaciones concretas, explicaciones y práctica), enlazados en GUIA_ACOMPANAMIENTO_Y_SIGUIENTE_HITO.md.
