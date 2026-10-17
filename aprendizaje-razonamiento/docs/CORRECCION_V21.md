# Estabilización de la voz local v21

Fecha: 17 de octubre de 2026. Base exacta: `7b40b2e3ffd9906a72299812bceee74fd806d666`, rama privada `feat/education-local-speech-v21-source`.

Esta corrección acotada se realiza dentro de la actualización v21 autorizada. No cambia palabras, idiomas, selección de voz local, contenido educativo, progreso, permisos ni servicios.

## Dos condiciones simuladas corregidas

1. Si la API lanza una excepción al cancelar, reset conserva el estado de fallo y la referencia pendiente, incluso si el motor informa indicadores vacíos. Una petición nueva no puede añadir otra palabra mientras siga fallando la cancelación. La interfaz muestra una advertencia visible fuera del panel de idioma al cambiar de palabra, actividad o pantalla; solo un intento de cancelación aceptado la elimina. No se afirma que se haya escuchado audio ni que un navegador real haya presentado esta excepción.
2. Al terminar un enunciado, su identificador se invalida. Los eventos tardíos de inicio, error o final de ese mismo enunciado no vuelven a marcar reproducción ni alteran una petición posterior. El caso de prueba fin→inicio es sintético; el fallo anterior solo cambiaba el indicador y no reiniciaba sonido.

## Validación del código final

- 155 pruebas de lógica, incluidas tres regresiones nuevas.
- 77 pruebas DOM, incluidas dos regresiones nuevas para la advertencia persistente y el intento de repetir cuando falla la cancelación. Suite intacta ejecutada en lotes aislados de 25, 25, 25 y 2.
- 32 comprobaciones estáticas.
- Total: 264 pruebas/comprobaciones locales aprobadas.
- Revisión independiente con API simulada del ciclo de vida, las 18 palabras, aislamiento de progreso y rechazo de voces remotas. Se conserva por separado su resultado final.
- Manifiesto actualizado: 31 archivos de aplicación, 292107 bytes.

Los 692 checks de regresión Chromium y 186 con API de voz simulada de `docs/evidence-v21` corresponden a la base anterior a estas dos correcciones, y se conservan como evidencia previa. No se presentan como una nueva ejecución del código corregido. Tampoco se repitió un navegador en este entorno.

## Límites

No se ha escuchado audio real. Chromium nativo de la ejecución previa devolvió cero voces; las pruebas de reproducción usan API simulada. Safari/iOS, iPad o móvil físico, calidad acústica, pronunciación y tonos siguen sin verificar. La aplicación depende de que el navegador declare y respete una voz `localService === true`; no certifica el tráfico interno del sistema operativo. La aceptación de cancelación por la API no garantiza por sí sola silencio audible.

La selección estricta de voz e idioma, ausencia de reproducción automática y de fallback remoto, y módulos de progreso v4, coordinación entre pestañas y preferencias permanecen iguales. No hay micrófono ni nuevas dependencias. La observación previa sobre restablecer preferencias de bienvenida corruptas sigue fuera de alcance.

La rama conserva la evidencia original y esta corrección. Sites solo se actualizará mediante el flujo oficial después de verificar este respaldo.
