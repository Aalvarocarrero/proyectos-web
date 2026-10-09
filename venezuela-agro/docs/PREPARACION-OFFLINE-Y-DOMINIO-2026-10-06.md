# Parcela Los Morochos: preparación sin señal y dominio

## Qué está implementado

- Nombre público «Parcela Los Morochos» y atribución «Hecho por Parcela Los Morochos», manteniendo los logos reales, colores, rutas y correo existentes.
- Navegación «Productos Los Morochos» hacia la tienda propia, diferenciada de Mercado Agro. Las herramientas de gestión y la instalación web se presentan como gratuitas; los productos, disponibilidad y entregas se cotizan aparte.
- PWA con instrucciones iPhone/iPad, Android y ordenadores. Detección de iPad con agente de escritorio, bloqueo de clics repetidos de instalación y tolerancia al almacenamiento de sesión deshabilitado.
- Shell `/app-local` con el FarmDashboard real: configuración, animales, pesajes, mapa, inventario, ciclos y demás controles existentes. No incorpora encabezados ni identidad de cuenta en HTML.
- Preparación verificable del shell y de todos los scripts/estilos emitidos por el build. La marca «preparada» solo se escribe cuando terminan todos los recursos requeridos. Una imagen opcional ausente no bloquea, pero un script o shell faltante sí. Los reintentos no duplican la preparación concurrente.
- Las API, rutas de autenticación y HTML privado quedan fuera del caché. Se eliminan solamente cachés de versiones anteriores, nunca IndexedDB. Las páginas públicas se limitan explícitamente; no se promete todo el mercado offline.
- Copia local JSON versionada de entidades, cola y metadatos mediante una transacción consistente. No borra ni envía registros. Contiene información privada; las fotos remotas no están embebidas, pero datos de imagen locales presentes en los payloads sí se conservan.
- Solicitud opcional de almacenamiento persistente, sin prometer que el navegador la conceda ni que evite pérdidas por borrado manual.

## Separación de cuentas y registros anteriores

Cada cuenta verificada y el espacio `device-local` usan bases IndexedDB distintas. La resolución de sesión es de solo lectura, sin caché y con tiempo límite. Sin conexión se puede continuar la identidad ya verificada en la misma pestaña. Ahora también se puede autorizar explícitamente, estando conectado, la reapertura de la cuenta en un dispositivo personal de confianza. En una nueva sesión offline, se muestra una elección entre ese único espacio recordado y el espacio local; nunca se selecciona silenciosamente otra cuenta. Una verificación online de cuenta distinta o sin sesión elimina la asociación recordada. La ruta explícita `/app-local` abre siempre el espacio del dispositivo. No hay cifrado propio ni bloqueo biométrico de los registros: la elección recordada es un permiso para uso local en un dispositivo de confianza, no autenticación de la persona que lo sostiene. Proteger el dispositivo y no compartir un navegador que contiene información privada.

La base antigua sin propietario queda intacta, separada y sin envío automático. La interfaz muestra su número de registros, permite exportarlos y ofrece recuperación explícita únicamente al espacio local. Repetir la recuperación no sobrescribe registros actuales ni mueve los antiguos. Las solicitudes/pedidos antiguos se conservan en la copia, pero no se reenviarán por la recuperación. No hay adopción automática de registros locales por una cuenta: requiere una migración validada y elección del propietario.

Antes del envío se verifica la sesión. El endpoint compara también el propietario del cliente con la sesión del servidor y rechaza cambios de cuenta. La hidratación compara el propietario antes de escribir. Las operaciones privadas del espacio local nunca se envían; solicitudes y sugerencias nuevas pueden enviarse por su flujo existente sin cuenta. Un cliente antiguo sin el nuevo identificador de propietario no puede enviar: conserva su cola y necesita recargar la versión actual.

## Condiciones de funcionamiento

Primera carga y preparación requieren internet. Preparar desde Sincronización (también disponible antes de crear la primera finca), probar recarga y modo avión antes de salir. La aplicación debe seguir abierta o volver a abrirse para los reintentos; no hay garantía de ejecución en segundo plano con iOS o con la app cerrada.

Enviar solicitudes, iniciar sesión, obtener novedades, subir imágenes y publicar en la comunidad/mercado requieren internet, validación de cuenta y moderación cuando corresponda. Guardado local no equivale a copia en servidor ni a publicación.

## Dominio: preparado el código, pendiente activación

El origen actual sigue siendo https://venezuelaagro.aalvarocarrero.chatgpt.site y el Site sigue privado. Ningún dominio definitivo, propiedad, configuración DNS o certificado se da por verificado. No se compró dominio ni se modificó DNS, público, identidad ni servicios externos.

1. Elegir el dominio y verificar titularidad, proveedor y capacidad real del hosting para conectarlo.
2. Confirmar con el usuario el cambio de acceso. Dominio personalizado no significa acceso público automático.
3. Conservar copia del código/versiones, exportaciones del servidor D1 y archivos R2; verificar restauración en ensayo.
4. Revalidar en el proveedor los DNS necesarios, conservar correo/MX y esperar HTTPS. No reutilizar valores DNS antiguos sin confirmarlos.
5. Probar autenticación, consentimiento, permisos, formularios, APIs y moderación bajo el dominio. Si se cambia hosting, sustituir los encabezados de Sites por sesiones verificadas: no confiar en encabezados enviados por visitantes.
6. Los orígenes tienen IndexedDB y service workers independientes. Exportar pendientes en el origen antiguo y preparar una importación validada con propietario, formato, conflictos y adjuntos. La interfaz incluye importación local de copias versión 1 (hasta 15 MB), con vista previa y confirmación del usuario. Valida esquema, tipos de cada entidad, duplicados, profundidad, cantidad y claves peligrosas antes de escribir. La transacción es atómica; lo actual y las bajas pendientes tienen prioridad. No asigna la copia a una cuenta, no transmite nada y no reenvía solicitudes comerciales antiguas. Los adjuntos remotos necesitan su propia migración; esta importación no copia R2.
7. Solo con dominio operativo cambiar `SITE_ORIGIN`, canónicos, Open Graph, sitemap y enlaces. Mantener acceso al origen antiguo para recuperar datos y hacer un cambio con posibilidad de reversión.

## Pendientes reales antes de abrir a terceros

- Pruebas de modo avión, cerrar/reabrir, actualización y poco espacio en Safari/iOS y Chrome/Android reales; instalación en escritorio/tablet.
- Adopción voluntaria de registros locales/antiguos por una cuenta y migración de adjuntos remotos. La importación al espacio local de un nuevo origen ya está implementada; no se ha aplicado a datos reales.
- Conflictos entre dispositivos, tombstones de bajas remotas e hidratación completa de todas las entidades. La protección de ediciones nuevas durante un envío no resuelve por sí sola concurrencia entre dispositivos.
- Las colas envían hasta 100 operaciones por intento; vaciado progresivo/backoff y estados detallados de rechazo para cargas grandes siguen pendientes.
- Verificación real de correo si se exige públicamente; escribir el email y teléfono no verifica su propiedad ni implica envío de códigos.
- Autenticación independiente y prueba de D1/R2 si se sale de Sites. Cuotas/proveedores/dominio pueden tener costos: gratuidad de herramientas no promete alojamiento o servicios externos ilimitados.

## Verificación

Consultar el resultado final de la entrega para número de pruebas y despliegue. El navegador cloud bloqueó el preview localhost con `ERR_BLOCKED_BY_CLIENT`; no se presenta como una prueba de dispositivo. Las pruebas de service worker son ejecutables de lógica con solicitudes/cachés simulados, junto a renderizado real del Worker compilado. No se han manipulado registros del usuario para probar.

### Resultado de la revisión v27

- Build de producción: aprobado; manifiesto offline con 66 recursos de código/estilo.
- Suite secuencial: 45 pruebas aprobadas, cero fallos/cancelaciones. Incluye 17 pruebas específicas de caché, namespaces, recuperación, cambios de ruta durante operaciones y conservación de ediciones durante el envío. Pruebas IndexedDB usan fake-indexeddb y datos sintéticos, no registros reales.
- Revisión independiente: 17/17 pruebas offline/almacenamiento aprobadas; sin nuevo bloqueo grave identificado.
- `node --check public/sw.js` y `git diff --check`: aprobados.
- Lint global conserva 4 errores existentes en administración, comunidad y directorio, además de 24 advertencias. No se presenta como aprobado.
- Typecheck global conserva 10 errores de tipos de Cloudflare y ejemplos D1 existentes. No se presenta como aprobado.
- No se verificaron físicamente Safari/iOS, Chrome/Android, tamaños móviles ni reinicio de PWA. El bloqueo del preview cloud impidió la QA visual; siguen siendo criterios de aceptación del lanzamiento público.


## Revisión v28: uso sin señal después de cerrar

1. Instala la aplicación si tu navegador lo permite y ábrela desde su icono. Prepara el uso offline en esa misma ventana/navegador donde trabajarás.
2. Con internet, abre Mi Finca y pulsa «Preparar / comprobar sin señal». Se verifica la versión desplegada y cada recurso esencial; un marcador antiguo o recursos eliminados no bastan para decir que está preparada.
3. Si trabajas con cuenta y es tu dispositivo personal, pulsa «Preparar mi cuenta para reabrir sin señal» y acepta solo si entiendes el acceso local y la ausencia de cifrado propio. Para equipos compartidos, no actives esta opción.
4. Al reabrir sin internet después de cerrar la app, elige «Abrir mi espacio guardado». El espacio local sin cuenta tiene un botón diferente y no se mezcla con la cuenta.
5. Crea/edita registros y conserva copias. Al reconectar, se verifica nuevamente la misma cuenta antes del envío. Si cambió, los pendientes permanecen y no se envían como otra persona.
6. Para otro dominio/dispositivo, descarga tu JSON y usa «Restaurar mi copia». Revisa el origen y conteos; confirma importar únicamente al espacio local. Conserva el archivo original.

El build ahora genera una versión del service worker basada en el código de cliente, shell compilado y propio worker. Cada revisión prepara su shell/código antes de activarse, conservando IndexedDB. No se requiere borrar datos para actualizar.

La revisión estrecha de errores previos dejó lint sin errores (24 advertencias existentes) y typecheck sin errores: tipos oficiales de Cloudflare, esperas correctas en ejemplos D1 y lectura de cachés con un almacén externo de React. Los tests usan IndexedDB simulado y datos sintéticos. No equivalen a certificación física de iOS/Android.

### Resultado v28

Build de producción aprobado; 69 recursos de aplicación preparados. Suite completa: 57/57 pruebas aprobadas. Revisión independiente: 29/29 pruebas offline/importación/almacenamiento aprobadas. Lint: cero errores, 24 advertencias. Typecheck: aprobado. El ensayo de cierre/reapertura es un modelo con IndexedDB y sesiones simuladas; la comprobación de instalación y modo avión en teléfonos reales sigue pendiente.
