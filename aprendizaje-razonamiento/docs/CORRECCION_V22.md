# Estabilización de navegación v22

Base remota: `2733c7a4ddff356caf67a15ca4a1a7da0efa6824`, rama privada `feat/education-dashboard-v22-source`. Corrección acotada dentro de la actualización autorizada del mismo sitio privado, 17 de octubre de 2026.

La revisión reprodujo dos lagunas también presentes en v21; no son nuevas regresiones del dashboard:

1. Al regresar con el logotipo después de tener progreso, un guardado redundante volvía a dibujar el inicio y eliminaba el encabezado que acababa de recibir foco. La navegación del logotipo ahora se trata igual que Volver al inicio: no modifica ni vuelve a guardar respuestas y conserva el foco en el encabezado.
2. Al plegar el catálogo durante una excepción simulada de cancelación de voz, el aviso podía quedar dentro del panel oculto. El resultado de las cancelaciones se refleja ahora en el aviso persistente exterior también desde clics fuera del panel, Detener, revisión de voces y eventos de salida. Se reintenta detener cuando persiste un error, y una nueva reproducción explícita aceptada limpia un aviso anterior ya resuelto. No se afirma que este fallo haya ocurrido en un motor real ni que se haya oído audio.

## Validación

- 155 pruebas de lógica.
- 82 pruebas DOM, incluidas tres nuevas: retorno por logotipo con foco y progreso intactos, plegado nativo de detalles con aviso visible, y limpieza del aviso tras una nueva petición explícita aceptada.
- 32 comprobaciones estáticas.
- Total final: 269 pruebas/comprobaciones aprobadas. DOM se ejecutó en lotes aislados de 25, 25, 25 y 7.
- Revisión independiente de rutas, franjas, materias, idiomas, utilidades, foco y continuidad; además, regresión independiente de voz con API simulada. Resultados finales conservados con la entrega de publicación.

El manifiesto actualizado contiene 32 archivos de aplicación, 302974 bytes. El código funcional cambia solo la exclusión del guardado redundante en app.mjs y la comunicación de cancelación en language-audio.mjs. No cambia local-speech.mjs, vocabulario, estados pedagógicos, codec v4, coordinación de pestañas ni preferencias.

Las 1068 comprobaciones Chromium de `docs/evidence-v22` corresponden a la candidata previa a estos ajustes y se conservan como evidencia anterior, no como navegador recién ejecutado sobre esta corrección. Las capturas también preceden a los ajustes. El dashboard y sus estilos no cambian en esta estabilización.

No hay nuevos servicios, permisos, dependencias, datos personales ni pagos. Audio real, voces del móvil, calidad fonética, Safari/iOS, hardware físico y pruebas con familias siguen sin verificar. Chromium nativo previo devolvió cero voces; la reproducción y los fallos de cancelación se simulan explícitamente.

El respaldo se mantiene en la misma rama privada antes de publicar la fuente idéntica mediante el flujo oficial Sites. El sitio conserva owner-only y rollback v21.
