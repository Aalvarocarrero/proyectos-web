# Decisiones · 0.2

Fecha: 2026-10-15. Base del proyecto: [plan de Notion](https://app.notion.com/p/3fa30479a7368161b25df3732810491e?pvs=204). Esta revisión no escribe en Notion ni modifica otros proyectos.

## Alcance

Mejorar interfaz y sesiones breves para la plataforma educativa de 18 meses a 18 años. Se conservan las dos actividades existentes y se incorporan dos interacciones originales completas. Las ventanas de producto fueron aceptadas provisionalmente por el usuario el 15 de octubre de 2026. No se presentan como resultados clínicos ni evidencia de eficacia.

## Cambios

- Elección explícita de etapa, sin cargar por defecto una actividad infantil.
- Antes de empezar: objetivo, acompañamiento, ventana ajustable y posibilidad de terminar antes.
- Etapas adaptadas a los rangos aprobados: 18–24 meses, 2 años, 3–5, 6–8, 9–12 y 13–18. Las edades orientan y no clasifican capacidades; el extremo de 24 meses puede entrar en cualquiera de las dos guías según el apoyo.
- Menores de 3: guía para el adulto y juego presencial, sin bucle de interacción dirigido al niño. La duración indica juego sin pantalla.
- Inicio, pausa, reanudación y cierre explícitos, sin reloj, castigo ni avance automático. Las elecciones se conservan solo en la pestaña.
- Agrupación por color/forma y planificación con presupuesto conservadas. La ampliación de cada reto es opcional y puede cerrarse tras una primera solución.
- Nuevo reto 6–8: tres momentos de una historia, reordenables con botones, feedback de secuencia y comprobación de la variable que cambió. Sin exigir arrastrar.
- Nuevo reto 13–18: fuentes ficticias, conteos 120/200 y 84/140, media idéntica de 0,6, límites de inferencia causal y mejor comparación. No confunde satisfacción, conteo bruto y causalidad.
- Mejor legibilidad, botones nativos y grandes, foco visible, estados de selección, regiones de estado, alternativa conversada/física y movimiento reducido.
- Sin perfiles, respuestas persistentes, datos personales, analítica o llamadas de aplicación a la red.
- Currículo, más niveles, audio y adaptación real siguen declarados como no implementados.

## Estado de verificación

28 pruebas de lógica, 10 recorridos DOM y 31 comprobaciones estáticas pasan. El navegador real está bloqueado por una restricción de sockets; no se ha hecho validación visual ni se ha afirmado conformidad WCAG. Véase `VERIFICACION.md`.

## Contenido y propiedad intelectual

Textos, mecánicas y geometría CSS son originales para el proyecto. Se mantiene una dirección cálida con crema y verde bosque, sin recursos gráficos remotos. No se copiaron ejercicios o personajes de otros productos.

## Puerta de publicación

Preparado localmente para revisión. No hay push ni publicación en esta fase. Mantener la audiencia privada del sitio existente y no recopilar datos reales sin una decisión separada.


## Hito 0.3 · 16 de octubre de 2026

Se conserva íntegra la oferta anterior y se amplía a ocho retos y dos guías. Cada etapa interactiva tiene un catálogo de dos propuestas, con objetivo, duración estimada y estado de sesión. No es un itinerario obligatorio ni un registro de logros.

Nuevas propuestas originales: patrones repetidos (3–5), instrucciones y recorrido con obstáculo (6–8), comparación controlada e interpretación limitada (9–12), selección de una muestra y límites de generalización (13–18). Cada una tiene dos situaciones, feedback explicativo, dos pistas graduadas y cierre disponible tras la primera respuesta correcta o en cualquier momento con “Terminar por hoy”.

El estado se indexa por etapa y propuesta. Cambiar no borra ni mezcla respuestas; reiniciar afecta solo a la propuesta elegida. Ningún estado se escribe en almacenamiento ni se transmite. Las elecciones exponen aria-pressed y una marca visible; la elección en la reflexión del puente ahora se conserva. No se añaden afirmaciones de eficacia ni recomendaciones clínicas: son decisiones de diseño pendientes de revisión pedagógica.

Resultado actual: 33 pruebas de lógica, 15 recorridos DOM y 31 controles estáticos. El navegador sigue bloqueado por sockets antes de cargar la app; no hay revisión visual real ni capturas de este hito. Sin publicación.
