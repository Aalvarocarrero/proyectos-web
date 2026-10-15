# Preparación de alvarocarreromentor.com

El usuario identifica este dominio como suyo. No se ha verificado el registrador, DNS, certificado ni alojamiento. Este documento prepara una migración; no autoriza ni ejecuta cambios de DNS, compras, cuentas, credenciales, acceso público o Search Console.

## Estado y taxonomía

`config/site.mjs` es la fuente de dominio, base de recursos `/` y once pares de rutas ES/EN (22 páginas). El español sigue como matriz y `x-default`. Se conservan las rutas existentes; no cambiar los slugs sin plan de redirecciones. Las categorías son inicio, comunidad, recurso, perfil, mentoría individual, mentoría grupal, contacto, privacidad, condiciones, solicitud de conversación y comentarios privados.

- Modo predeterminado `private`: origen actual de Sites, `noindex,nofollow` en todas las páginas y robots bloqueado. El dominio futuro nunca sustituye el canonical de la publicación privada.
- Modo `production`: origen `https://alvarocarreromentor.com`; genera canonical, Open Graph URL, hreflang recíproco ES/EN/x-default y sitemap del mismo origen. Las páginas de comentarios y solicitud quedan fuera del sitemap y siguen con noindex.
- Recursos, fuentes, imágenes, scripts y PDF usan rutas relativas a la raíz; no necesitan un CDN nuevo. Los enlaces externos de redes se conservan.
- Los metadatos se generan en `dist`, sin reescribir la matriz `public`.

## Construcción y controles de lanzamiento

`npm run build` siempre utiliza el modo privado por defecto. `SITE_BUILD_MODE=production` falla hasta que todos los controles de `resolveBuild` se reconozcan explícitamente con `yes`: aprobación de lanzamiento, dominio/TLS, privacidad/condiciones, retención, backend destino, estado inactivo de Kit y aceptación de comentarios desactivados. Son comprobaciones para un operador autorizado, no pruebas automáticas ni sustitutos de la aprobación del usuario.

El modo producción desactiva obligatoriamente POST de comentarios y muestra un aviso de indisponibilidad. No existe un interruptor para hacer público el formulario actual: primero se necesita un diseño revisado de autorización/abuso para el nuevo alojamiento. La publicación privada actual conserva su formulario funcional.

Antes del lanzamiento real: verificar DNS/TLS y titularidad con el usuario, elegir y autorizar alojamiento, comprobar todas las rutas y descargas, revisar privacidad/retención y probar cualquier servicio que se pretenda activar. No apuntar Search Console ni enviar sitemaps antes de verificar y autorizar el dominio público. La redirección de www/HTTP debe decidirse y probarse en el proveedor, nunca inventarse desde el sitio privado.

## La migración incluye servidor y datos

No basta con copiar HTML. `scripts/build.mjs` produce `dist/client` (páginas/recursos) y `dist/server/index.js` (Worker). El servidor necesita un binding de recursos `ASSETS` y una base D1 `DB`. El manifiesto de Sites conserva su identidad para las revisiones actuales; un proveedor distinto necesita su configuración propia, no reutilizar credenciales ni el ID de Sites como si fuera una cuenta de Cloudflare.

La tabla `feedback` y su índice están definidos en `db/schema.ts`; las migraciones generadas inmutables y sus metadatos viven en `drizzle/`. En un destino nuevo se aplican primero esas migraciones mediante la ruta aprobada del proveedor. Un alojamiento sin D1 necesitaría un adaptador probado que mantenga prepared statements, transacciones/atomicidad, límites y duplicados. No se ha contratado ni configurado ese destino.

## Exportación privada y traslado de comentarios

No se ha exportado ningún comentario real. Nunca colocar datos en `public`, `dist`, repositorio, JSON público ni adjuntos de acceso abierto. `exports/` y `*.private.sql` están excluidos del repositorio.

Cuando el usuario autorice trasladar los datos, identificar primero el destino y sus permisos. En Sites, usar la vista/herramientas de base de datos del propietario: confirmar binding y tabla, leer páginas acotadas con el cursor/offset devuelto y conservar todos los campos exactos en un JSON privado `{"rows":[...]}`. Revisar el límite de paginación de la herramienta; si se alcanza, obtener una exportación completa por una vía soportada, no asumir que terminaron los datos. El acceso a Sites no demuestra tener credenciales directas para la cuenta Cloudflare que aloja su D1.

`scripts/prepare-feedback-import.py entrada.json salida.private.sql` convierte ese archivo local autorizado en INSERT SQL, valida esquema y claves duplicadas y crea el archivo con permisos 0600 sin sobrescribir. No accede a la red ni escribe en la base. Aplicar esquema y luego datos en una base destino vacía aprobada; comparar número de filas, IDs, fechas y NULL de contactos anónimos. No usar reemplazos silenciosos. Eliminar o mantener la fila sintética QA solo según la decisión de datos de prueba acordada.

Si existe acceso directo autorizado a una cuenta D1, Cloudflare soporta exportar SQL e importarlo con `wrangler d1 export ... --remote --output=...` y `wrangler d1 execute ... --remote --file=...`. No se ejecutan aquí y no se presume acceso al D1 administrado por Sites. [Referencia oficial de exportación/importación](https://developers.cloudflare.com/d1/best-practices/import-export-data/).

## Seguridad, privacidad y continuidad

El formulario actual se apoya en el acceso exclusivo del propietario en Sites. No publica lecturas de comentarios. Un cambio de audiencia requiere revisión nueva: autorización de escritura, límites por origen/actor adecuados, abuso, control del área de lectura y datos mínimos. Un Origin HTTP no es autenticación. Antes de habilitar comentarios en el nuevo dominio, revisar el control de origen del Worker y probar escritura real, duplicados, errores y acceso denegado a lecturas.

La retención está pendiente de decisión, sin purga ficticia. Mantener consentimiento de respuesta separado de cualquier newsletter y no convertir opiniones en testimonios sin permiso específico. Los registros técnicos del alojamiento pueden existir incluso cuando no se pide nombre/correo.

Kit permanece inactivo en ambos idiomas hasta verificar confirmación, entrega ES/EN, bajas y preferencias. El PDF directo no exige newsletter. Las solicitudes de conversación siguen siendo borradores mailto y archivos ICS tentativos, no reservas ni pagos. No introducir fechas, precios o plazas disponibles al migrar.

Conservar una copia privada autorizada y verificable de los datos antes del corte. Definir ventana de cambio, impedir escrituras simultáneas no coordinadas, comprobar filas finales y planificar una vuelta atrás al despliegue previo sin perder comentarios nuevos. Nunca volver a aplicar una migración ya aplicada ni modificar su historial para reparar datos.

## Entrega manual solicitada

La entrega actual incluye un ZIP estático con `index.html` en la raíz para Cloudflare Pages Direct Upload y un ZIP independiente con el código editable. `SITE_BUILD_MODE=static-export STATIC_EXPORT_APPROVED=yes npm run build` prepara metadatos públicos para el dominio sin afirmar que DNS/TLS ya estén activos; ese modo no despliega nada y siempre desactiva comentarios. Solo `dist/client` pertenece al ZIP de carga estática. No incluir fuentes, esquemas, pruebas, manifiestos de backend ni exportaciones de datos en la raíz pública.

Para un Worker futuro, la plantilla `docs/wrangler.example.jsonc` muestra ASSETS y DB pero no tiene una cuenta/base real ni credenciales. Revisar el proveedor y completar valores reales autorizados antes de usarla. Instalar dependencias con `npm ci`, construir, verificar bindings y migraciones, y mantener el bloqueo de comentarios hasta aprobar su seguridad/retención. No activar el endpoint cambiando solo un booleano.
