# Correcciones de revisión previa al despliegue v20

Base exacta: `2d3b31f62d5ca718c5c1b69a12a4b8cd2d77041a`. Misma rama autorizada: `feat/education-welcome-v20-source`.

## Fallos corregidos

- **Cierre → Ver otras etapas:** ahora abandona el modo guiado, devuelve la sección de etapas al catálogo abierto y enfoca el botón de la franja actual, visible y operable. No reinicia los tres pasos de la bienvenida ni borra preferencias o partidas. Se reutiliza la misma salida al catálogo que usan el jardín y la pausa.
- **Idiomas en Más propuestas:** cada tarjeta muestra el nombre real de su lengua antes del título compartido, mediante la función común `activityTitle`, reutilizada por el catálogo, las tarjetas de bienvenida y el botón «Continuar». Este último también identifica el idioma al volver al inicio y al recargar. Los seis botones tienen nombres accesibles distintos derivados del texto visible. Sus identificadores no cambian.

## Validación de esta corrección

- 142 pruebas de lógica, 75 DOM (tres nuevas) y 32 comprobaciones estáticas, todas aprobadas.
- 196 comprobaciones de la bienvenida existente en 320, 375, 768 y 1440 px.
- 145 comprobaciones específicas nuevas en Chromium, 375 y 1440 px: cierre de las seis franjas, catálogo visible, foco por teclado, paso de bienvenida conservado, preferencias intactas, estado de partida cerrada conservado y progreso idéntico tras recarga; seis idiomas con texto visible y nombre accesible distinto, también en «Continuar» antes y después de recargar.
- Sin errores JavaScript en los recorridos. Evidencias: `docs/evidence-v20/welcome-fixes-browser.json`, `welcome-fixed-languages-375.png`, `welcome-fixed-languages-1440.png` y registros `fix-*`.

Los módulos del codec v4, coordinación entre pestañas y preferencias de Luma permanecen idénticos a la base v19 corregida. No se añaden funciones educativas, servicios, permisos ni costes. La aplicación cambia únicamente la salida del modo guiado y el título compartido de las actividades (`welcome.mjs`, `catalog.mjs`, `app.mjs`); el manifiesto se actualiza para reflejarlo. Se repitieron además las 110 comprobaciones de correcciones del catálogo/idiomas existente.

El respaldo de esta corrección en la misma rama está autorizado por el hilo principal dentro de la actualización aprobada. Sites no se publica desde este entorno. La observación no bloqueante sobre restablecer preferencias del inicio corruptas queda fuera de esta corrección. No hay bloqueos técnicos pendientes; la revisión y el despliegue oficial corresponden al hilo principal.
