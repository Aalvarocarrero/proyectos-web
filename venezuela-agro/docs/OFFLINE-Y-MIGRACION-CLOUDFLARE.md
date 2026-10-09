> Informe histórico del 5 octubre. Para cambios implementados y límites vigentes, consultar PREPARACION-OFFLINE-Y-DOMINIO-2026-10-06.md. No usar el dominio ni los pendientes de este informe como estado actual.

# VenezuelaAgro: revisión offline y preparación de Cloudflare

Fecha: 5 de octubre de 2026. Revisión del código, pruebas automatizadas y compilación. No certifica funcionamiento en dispositivos reales ni ejecuta una migración de cuentas o bases de datos.

## Estado comprobado

- Frontend React/TypeScript, Vinext/Vite, CSS/Tailwind; servidor Cloudflare Worker.
- D1 con Drizzle y migraciones SQL en `drizzle/`; binding `DB`.
- R2 para fotografías/publicaciones; binding `BUCKET`.
- PWA: `public/manifest.webmanifest` y `public/sw.js`.
- IndexedDB: entidades, bandeja de operaciones pendientes y metadatos. Guardado de entidad y operación en la misma transacción.
- Sincronización de lotes de hasta 100 operaciones. El servidor valida permisos, contacto y consentimiento, y conserva recibos para reintentos.
- Gestor global: intenta sincronizar al abrir, recuperar conexión, volver a primer plano y cada cinco minutos mientras la página esté activa.
- Mi Finca permite trabajo local sin sesión y respaldo central cuando existe una sesión válida. Publicar contenido y recibir novedades requiere conexión y autorización.

## Correcciones de esta revisión

1. Un archivo opcional ausente ya no impide instalar todo el service worker. El documento de emergencia offline sigue siendo obligatorio.
2. Las navegaciones tienen un plazo de 4,5 segundos antes de recurrir a la copia local si la red queda bloqueada.
3. Los mensajes `TRY_SYNC` se atienden también fuera de Mi Finca.
4. El envío de pendientes tiene un plazo de 20 segundos; un intento fallido conserva la bandeja para reintentar.
5. Una respuesta del servidor no pisa la última edición o eliminación local efectuada durante el envío: se vuelve a aplicar la intención pendiente.
6. Tres pruebas cubren precarga parcial, fallo del documento esencial y preservación de ediciones/eliminaciones.

## Lo pendiente antes de lanzamiento

### Preparación offline verificable

La precarga actual guarda documentos e imágenes, pero no descarga explícitamente todo el grafo de módulos JavaScript, importaciones dinámicas y respuestas RSC que cada pantalla necesita. Haber cargado la portada no demuestra que todas las áreas estén disponibles sin red. Crear un shell offline de Mi Finca independiente de SSR, o un mecanismo de preparación que descargue y compruebe todos sus recursos. Mostrar «Lista para trabajar sin señal» solamente tras esa comprobación. Por ahora la copia puede depender de páginas y recursos ya visitados.

### Datos y cuentas

La base local y los cachés no están separados por cuenta. Debe haber partición por usuario, tratamiento explícito de registros locales anónimos, cierre de sesión seguro y prueba de cambio de cuenta sin mezcla de fincas. No borrar pendientes automáticamente. Definir adopción voluntaria de los registros locales por una cuenta.

La hidratación central no reconcilia bajas remotas mediante tombstones ni todas las clases de entidad. Definir conflictos entre dispositivos, revisiones del servidor, bajas y procesamiento transaccional/idempotente. La protección de edición durante envío añadida hoy no resuelve conflictos entre dispositivos.

El envío se limita a un lote por intento. Para colas grandes, añadir vaciado progresivo con pausa, reintentos y backoff, sin bloquear el dispositivo ni repetir permanentemente operaciones rechazadas.

### Respaldo y almacenamiento

Añadir exportación/importación de registros y pendientes con validación, formatos versionados y restauración de adjuntos. Pedir persistencia de almacenamiento cuando sea compatible y mostrar espacio disponible. La caché local no es un respaldo garantizado: el usuario o el sistema pueden eliminarla.

### Autenticación y correo

`app/chatgpt-auth.ts` depende de encabezados y rutas que proporciona Sites. En un Worker independiente esos encabezados no deben aceptarse como prueba de identidad. Sustituirlos por sesiones propias verificadas en el servidor, cookies seguras y controles de acceso por propietario en todos los endpoints.

La comprobación de correo actual compara lo escrito con el correo de la sesión; no envía un enlace de verificación. Implementar realmente la verificación por correo antes del registro público y definir su mecanismo de entrega y coste. Teléfono obligatorio no equivale a teléfono verificado.

### Dispositivos y límites

No prometer intervalos exactos de cinco minutos con la app cerrada, en segundo plano o sin batería. Los navegadores pueden suspenderla; Background Sync tiene compatibilidad limitada. Reintentar al abrir y volver a primer plano es necesario, especialmente en iOS. Una PWA instalable no equivale a una aplicación publicada en App Store o Google Play.

## Arquitectura de destino

VenezuelaAgro.com → Worker con frontend y API → D1 (`DB`) + R2 (`BUCKET`).
El dispositivo conserva IndexedDB + service worker y entrega cambios al API cuando hay conexión. CDN y recursos optimizados sirven fotografías, iconos y código. La migración preserva diseños, rutas públicas y lógica del negocio; se adapta despliegue, identidad y configuración.

Workers Static Assets es el destino apropiado para frontend más API. Subir únicamente HTML por el cargador de archivos estáticos no configura D1, R2, sesiones ni endpoints del software.

## Secuencia de migración

1. Congelar una versión y conservar copia del código, exportación de D1 y objetos de R2; comprobar restauración. No asumir que volver al código anterior restaura datos.
2. Cerrar los pendientes anteriores: shell offline, cuentas separadas, respaldo, autenticación propia y correo.
3. Crear entorno de ensayo en la cuenta Cloudflare de la marca, separado de producción; configurar Worker, recursos estáticos, D1 y R2. Reemplazar IDs de ejemplo por recursos reales, conservar bindings `DB` y `BUCKET`. Preparar configuración propia de Wrangler y secretos por entorno sin poner credenciales en Git.
4. Adaptar el build Sites a despliegue independiente. Conservar Sites funcionando; validar primero el Worker de ensayo y la resolución de recursos, rutas e imágenes. Revisar si se requiere el binding `IMAGES` o servir versiones preoptimizadas sin ese servicio.
5. Aplicar migraciones SQL a la base nueva; importar usuarios y datos respetando IDs, relaciones y consentimientos. Copiar R2 preservando claves de archivos. Comparar conteos y muestras antes del cambio.
6. Preparar exportación desde el origen anterior e importación en el nuevo. IndexedDB y service workers pertenecen a un origen: el dominio de prueba y VenezuelaAgro.com no comparten almacenamiento. Sincronizar pendientes o exportarlos antes del cambio; no desactivar la vía de recuperación.
7. Ejecutar la matriz siguiente en dispositivos reales y ensayo; comprobar seguridad, registro, correo, formularios, permisos, imágenes y SEO.
8. Vincular VenezuelaAgro.com al Worker, verificar DNS y HTTPS; después actualizar canonical, Open Graph, sitemap y enlaces compartidos al origen definitivo. Registrar sitemap en Search Console. Mantener el panel privado fuera de indexación.
9. Hacer cambio controlado de dominio, mantener origen anterior para recuperación y redirecciones, vigilar errores y disponer de rollback de código y plan de recuperación de datos.

No se modificó DNS ni se migraron recursos en esta revisión. No es responsable garantizar coste cero sin verificar cuotas, almacenamiento, envío de correo y servicios elegidos en la cuenta real.

## Matriz de aceptación previa al lanzamiento

- iPhone/Safari, PWA iOS, Android/Chrome, PWA Android, laptop y tablet.
- Primera carga con red; preparación confirmada; modo avión; cerrar/reabrir; acceder directamente a Mi Finca y cada formulario.
- Crear plano irregular, mover laguna, registrar animal, pesaje, inventario y ciclo; recargar y verificar todos los datos.
- Crear anuncio con fotografía sin red; ver pendiente; conectar y comprobar que aparece una sola vez en el servidor y en el mercado.
- Cortar la red durante el envío; volver a intentar; confirmar ausencia de duplicados y conservación de nuevos cambios.
- Sesión expirada, contacto faltante, consentimiento ausente, servidor 400/401/500: conservar y explicar el pendiente sin afirmar «publicado».
- Más de 100 operaciones, edición/eliminación concurrente, dos dispositivos, cambio de cuenta y cierre de sesión.
- Migrar por exportación/importación al dominio final y verificar documentos y adjuntos.
- Dispositivo con poco espacio, borrado de caché, actualización del service worker y recuperación desde respaldo.

## Referencias técnicas

- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/use-cases/web-apps/
- https://developers.cloudflare.com/workers/versions-and-deployments/
- https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation

## Resultado de validación

Compilación de producción completada. Suite completa: 30 pruebas aprobadas con `node --test --test-concurrency=1 tests/*.test.mjs`. La ejecución simultánea de las pruebas existentes provocaba contención del puerto HMR; la ejecución secuencial terminó sin fallos. Comprobación sintáctica de `public/sw.js` aprobada. Falta la matriz de modo avión y cierre/reapertura en dispositivos reales y la integración con recursos y cuentas de destino.
