# Revisión ECC: preparación offline y actualización segura

Alcance: descarga inicial, navegación sin señal, código diferido y conservación de cambios locales. Se aplicó el flujo de diagnóstico, regresión y verificación de ECC sin instalar su runtime, hooks, MCP ni dependencias adicionales.

## Defectos corregidos

- La ruta de solo lectura `/finca-modelo` no estaba incluida en la preparación ni en el fallback de navegación y no registraba el service worker al llegar directamente. Ahora la registra un componente público independiente, sin selección de cuenta ni sincronización. Se conserva la exclusión de AccountServices para las demostraciones.
- La preparación muestra recursos completados, verificación, versión y reintento. No declara lista una primera instalación hasta que el service worker termina de activarse. Los modelos/texturas 3D conservan su descarga explícita, hashes, licencias y marcador independiente; el motor y sus chunks forman parte del código preparado.
- Las actualizaciones esperan al cierre de las pestañas antiguas. Solo los archivos exactos de código inmutable `/assets/` de manifiestos comprometidos pueden reutilizarse entre generaciones; el HTML privado y las APIs permanecen fuera de ese intercambio.
- Los recibos de sincronización se validan íntegramente antes de modificar IndexedDB. Una respuesta JSON inválida o un error de procesamiento no puede retirar parcialmente operaciones pendientes ni marcar registros como confirmados.

## Uso

1. Con internet, abre Mi Finca o despliega «Preparar esta finca modelo sin conexión».
2. Pulsa «Preparar / comprobar sin señal» y espera la confirmación de la versión. Si hay una actualización pendiente, cierra todas las pestañas de VenezuelaAgro y vuelve a abrir con internet.
3. Para los recursos 3D, pulsa «Descargar paquete 3D» y espera «Paquete 3D listo sin conexión».
4. El trabajo local no equivale a copia en el servidor. Publicar, iniciar sesión, consultar novedades o enviar cambios necesitan conexión. Una cuenta debe autorizar por separado su acceso local en un dispositivo de confianza.
5. El almacenamiento sigue sujeto a límites y borrado del navegador; conserva copia de seguridad.

## Verificación y límites

Las regresiones de service worker, recibos y bases de datos usan respuestas y datos sintéticos. Cubren descarga incompleta, reintentos, cambios de versión, rutas offline, aislamiento entre cuentas y conservación transaccional de cambios.

La comprobación con red realmente desactivada está bloqueada en el navegador de la nube: Chromium mostró «DevTools not allowed on this page» por política de la organización. No se eludió ese bloqueo ni se cambió la red del sistema. Este navegador también deshabilita WebGL y muestra la alternativa 2D. Una recarga normal y la existencia de archivos en CacheStorage no se presentan como prueba de modo avión. Safari/iOS y Chrome/Android reales siguen pendientes.

Consultar el informe de entrega para los resultados del build, tipos, lint y suite completa del snapshot publicado.
