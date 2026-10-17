# Venezuela Agro: revisión de backend, privacidad y trabajo sin señal

Fecha: 14 de octubre de 2026. Base revisada: versión privada 98, commit `57d04a52ea9c6f16e43f8922961c1abe342bd182`.

## Alcance y límites

Revisión de código de identidad, administración, propiedad de registros, sincronización, publicación/moderación, imágenes, respuestas públicas, almacenamiento local y service worker. Los ensayos utilizan datos sintéticos, SQLite en memoria, IndexedDB simulado y R2 simulado. La consulta de alojamiento confirmó acceso exclusivo del propietario. No se modificaron permisos, identidad, secretos, DNS ni datos reales, ni se abrió el sitio al público.

Esto es una revisión funcional y de controles, no una certificación de seguridad ni un ensayo de penetración completo. La integración final debe incorporar el resultado del build, suite completa y revisión visual de la versión desplegada.

## Defectos corregidos

1. **Metadatos privados en perfiles públicos.** El directorio y detalle profesional pasaban filas completas de base de datos a componentes del navegador. Se sustituyeron por una proyección explícita: no serializa propietario, revisión ni identificadores/hashes de sincronización. Los endpoints públicos de mercado y comunidad también usan listas explícitas de campos.
2. **Validación desigual de imágenes.** Mercado, profesionales y fincas públicas aceptaban el tipo declarado sin comprobar cabeceras de imagen. Ahora se valida base64, tamaño de bytes, firma raster, dimensiones y cantidad máxima de píxeles antes de R2. SVG, datos HTML disfrazados, cabeceras truncadas y dimensiones excesivas se rechazan. Se validan todas las imágenes del anuncio antes de subir ninguna. Se conserva la funcionalidad de fotografías reales y galerías.
3. **Límites aplicados demasiado tarde.** Sincronización y división de áreas leían el cuerpo completo antes de medirlo. Ahora el lector de JSON limita bytes durante la lectura, cancela entradas excesivas aunque no declaren longitud y devuelve errores controlados para JSON, UTF-8 o tipo de contenido inválido.
4. **Caché de respuestas personalizadas.** Se añadió `private, no-store` a todas las API salvo medios, que conservan su verificación individual de publicación. Administración lo declara también en el propio endpoint. Las páginas que incluyen identidad o controles personalizados tampoco se almacenan en cachés HTTP. El shell neutro `/app-local` sigue siendo almacenable para uso sin señal.
5. **Detalles internos en errores.** Sincronización ya no devuelve mensajes arbitrarios del almacenamiento o base de datos; utiliza códigos de protocolo permitidos y un error genérico para el resto.
6. **Datos antiguos dañados bloqueaban el respaldo.** Listas JSON malformadas de un proyecto podían impedir la respuesta completa de bootstrap de la cuenta. Se leen de forma tolerante, sin reescribir datos históricos.
7. **Comunidad sin señal mostraba el formato interno.** La copia pública descargada ahora extrae el texto visible de las publicaciones, en lugar del sobre JSON interno de su anuncio adjunto.
8. **Subidas inútiles por conflicto conocido.** Se rechazan revisiones desactualizadas antes de subir imágenes cuando el conflicto ya es observable. La escritura final sigue comprobando la revisión atómicamente.

La comprobación raster valida cabeceras y límites, no sustituye un antivirus ni un decodificador completo de imagen. Los límites protegen la aplicación y mantienen la compresión del navegador existente.

## Comprobaciones realizadas

- 59 pruebas dirigidas de seguridad/backend: aprobadas, cero fallos. Incluyen propietarios distintos, rechazos anónimos, moderación y retirada, fotografías privadas/publicadas, galerías, datos públicos permitidos, solicitudes comerciales, errores de R2, límites de JSON e imágenes y listas históricas dañadas.
- 124 pruebas dirigidas de funcionamiento local/sincronización/división/comunidad: 122 aprobadas. Dos comprobaciones del manifiesto compilado quedaron pendientes del build del integrador porque todavía no existía `dist/client/offline-assets.json`; no fueron fallos de comportamiento ejecutado.
- Las pruebas locales ejercitan copias/restauraciones, aislamiento por cuenta, cambios durante un envío, reintentos con el mismo ID, conflictos, bajas, respuestas malformadas, fallos transaccionales, preparación incompleta, cachés y conservación de la copia anterior.
- No se han probado físicamente Safari/iOS ni Chrome/Android, suspensión prolongada, instalación real, poco espacio ni reinicio de PWA en un teléfono. Los resultados simulados no acreditan esos casos.

## Condiciones para decidir la apertura

### Si se mantiene el alojamiento Sites

La identidad actual depende de los encabezados autenticados y las rutas de inicio/cierre de sesión que gestiona Sites. Cambiar el acceso a público permite visitantes anónimos; los endpoints privados mantienen su validación de cuenta y propietario. Deben verificarse en un ensayo autorizado una sesión real, cierre y cambio de cuenta, consentimiento, escritura/lectura, moderación y recuperación de pendientes. No se abrió el acceso para realizarlo.

Antes de una apertura amplia conviene resolver o comprobar:

- **Abuso y cuotas:** la aplicación permite nuevas solicitudes de tienda y sugerencias sin cuenta; no se identificó un límite persistente por emisor en ese endpoint. No se ha verificado una protección equivalente del alojamiento. Se necesita un control acordado de frecuencia/volumen y seguimiento de costes/moderación antes de promocionar públicamente esos formularios. No se añadió un proveedor externo ni CAPTCHA.
- **Recuperación operativa:** comprobar una exportación/restauración de D1 y R2 en ensayo y definir responsable de moderación, atención y privacidad. Las pruebas locales no son un respaldo del servicio real.
- **Dispositivos y offline:** realizar preparación, modo avión, cierre/reapertura, actualización y reconexión en un iPhone/iPad y Android reales. Los datos locales no tienen cifrado propio; el acceso recordado es para dispositivos de confianza. Los adjuntos y mapas tienen mecanismos separados; una copia JSON no es una copia de todos los archivos R2.
- **Aprobación del acceso:** el propietario decide cuándo abrir. El código conserva la indexación pública desactivada; no basta con cambiar la visibilidad para que aparezca en buscadores.

### Si se migra a un Worker Cloudflare independiente

**Bloqueo técnico:** no publicar esta base tal cual fuera de Sites. `getChatGPTUser()` confía en encabezados que solo son autoridad detrás del control de Sites. En un Worker independiente un visitante podría enviarlos si no existe una capa de autenticación verificada que los elimine y reemplace. Las rutas `/signin-with-chatgpt`, `/signout-with-chatgpt` y `/callback` también pertenecen a Sites.

La migración requiere primero identidad/sesión verificable, permisos de usuario/administración, D1/R2 y restauración, HTTPS y pruebas de acceso anónimo y de dos propietarios. Un dominio diferente crea otro almacenamiento local; deben recuperarse los pendientes del origen antiguo de manera explícita. No cambiar DNS, cerrar el origen antiguo ni prometer migración automática de IndexedDB.

## Mejoras posteriores, sin bloquear esta vista privada

- Reducir progresivamente scripts inline mediante nonces/hashes compatibles con el framework. La CSP actual conserva `unsafe-inline` para el renderizado existente; no se añadió `unsafe-eval` ni comodines.
- Paginación de consultas y límites documentados para cuentas con grandes historiales; bootstrap carga las colecciones completas del propietario.
- Limpieza programada de objetos R2 huérfanos y recibos antiguos con política de conservación aprobada. Ningún archivo histórico se borró en esta revisión.
- Observabilidad de errores, cuotas, reintentos y respaldo, manteniendo fuera de registros técnicos datos privados de fincas y contactos.
- Verificación externa de titularidad de teléfonos/correos solo si el producto decide exigirla. Escribir el email coincidente y un celular válido no prueba propiedad del teléfono.

## Ampliación posterior a la vista privada v99

La integración v99 pasó TypeScript, ESLint sin errores, build y 943/943 pruebas. Las dos comprobaciones de manifiesto que antes esperaban build quedaron resueltas. La biblioteca se preparó correctamente en el navegador cloud después de cerrar las pestañas antiguas de ensayo y reabrir, sin borrar cachés ni datos. Esto no equivale a un ensayo físico de modo avión/reinicio en teléfonos. El mensaje genérico ante un worker antiguo se está afinando por separado.

### Ensayo concreto de abuso anónimo

Se ejecutó exclusivamente contra SQLite y R2 sintéticos en memoria:

- Tres peticiones consecutivas de 100 sugerencias válidas cada una: 300/300 aceptadas. El código no incluye un límite persistente de frecuencia entre peticiones. El máximo de 100 operaciones por lote y de 8 MiB por cuerpo sí limita cada petición, pero no la frecuencia ni el crecimiento total. No se consultó ni se atacó el endpoint de producción.
- Se corrigió la amplificación por entradas inválidas: 100 operaciones públicas inválidas generan cero recibos nuevos. Las bajas no admitidas de solicitudes/sugerencias tampoco dejan recibos.
- Se corrigió una falsa confirmación de pedidos: el servidor solo reconoce como repetición un ID con el mismo contenido normalizado. Cambios de cantidades, notas u otros datos se rechazan sin sobrescribir el original.
- Se probó la carrera de dos envíos distintos con el mismo ID, tanto pedidos como sugerencias. Solo uno recibe aceptación; el otro devuelve `immutable_record`. La verificación ocurre después del intento atómico de inserción.
- Una respuesta externa HTTP 429 conserva la cola y los mismos identificadores y no produce un bucle dentro de una llamada de sincronización. La aplicación todavía no establece un enfriamiento persistente basado en `Retry-After`; no debe confundirse la conservación de datos con una defensa antiabuso completa.

**Decisión concreta pendiente antes de tráfico público amplio:** definir un presupuesto de solicitudes/sugerencias por intervalo y el criterio de emisor que lo hará cumplir. La identidad de una cuenta verificada puede servir para envíos autenticados. Los formularios anónimos necesitan una protección de borde verificada o un mecanismo acordado; un identificador inventado por el navegador es evadible. La configuración efectiva de límites de Sites no fue expuesta ni verificada por esta auditoría. No se añadió rastreo por IP, cookies identificadoras, CAPTCHA, secretos, servicios pagos ni una cuota global que pudiera cerrar los formularios a todos los visitantes.
