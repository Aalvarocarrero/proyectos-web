# Administración persistente de ROHO · rama de preparación

## Estado

Implementada localmente en una rama aislada. No se ha publicado, aplicado una migración remota, configurado una identidad administradora ni creado credenciales. La rama publicada v10 permanece intacta.

El sitio conserva su identidad `appgprj_6aa0af44ba0c81918121290e049cb256`. Se ha convertido al starter Vinext/Worker soportado; el contenido estático y todos sus activos se conservan en `public/`. La configuración elimina `static` y declara D1 `DB` y R2 `BUCKET`.

## Qué hace

- `/admin`: panel de productos, fotografías, textos de tienda, categorías, filtros y cosechas.
- Edición mediante campos de productos, categorías, filtros y cosechas, con validación de servidor. El inicio dispone de 37 campos editoriales y biblioteca de fotografías; alcance exacto en `CONTENT_ADMIN_REPORT.md`. Los nuevos productos parten como borrador de una ficha existente: deben revisarse todos sus datos antes de publicarlos.
- D1 conserva un borrador, una versión publicada y un historial auditado por identidad/fecha. Guarda y publica son operaciones distintas.
- Control de versión optimista: dos sesiones no pueden sobrescribirse silenciosamente. Restaurar una versión crea un borrador nuevo, sin alterar de inmediato la tienda.
- `/api/catalog-script` sirve solo la instantánea publicada y excluye productos borrador/archivados. Los filtros se derivan de sus datos. Sin registros iniciales, utiliza las cuatro presentaciones verificadas existentes; no inventa productos de ejemplo.
- R2 almacena imágenes verificadas por tipo MIME, firma raster, dimensiones y tamaño (PNG/JPEG/WebP estático, hasta 5 MB, máximo 6000 px por lado y 24 megapíxeles). No acepta SVG/HTML. La ruta pública de imágenes comprueba que estén referenciadas por un producto publicado; las vistas previas administrativas exigen identidad autorizada.
- Los endpoints de administración requieren una identidad de Sites autorizada; las mutaciones requieren origen exacto y encabezado propio para evitar solicitudes cruzadas. No hay OAuth propio, contraseñas, claves en el cliente ni almacenamiento local presentado como base de datos.
- La tienda mantiene precios de referencia COP y prelanzamiento sin inventario. No se implementan pagos, pedidos, newsletter real o gestión de clientes.

## Qué falta para activar, exactamente

1. Mantener audiencia e identidad actuales del Site. Publicar esta rama mediante el flujo nativo de Sites cuando el propietario decida activarla. Sites debe provisionar/enlazar `DB` (D1) y `BUCKET` (R2) y aplicar la migración de esquema generada `drizzle/0000_nice_gladiator.sql`. No ejecutar migraciones remotas manuales ni SQL de creación durante peticiones.
2. Mantener `ROHO_ADMIN_USER_IDS` ausente o `[]` hasta verificar la identidad del administrador. Ese es el valor predeterminado cerrado: un visitante anónimo recibe 401 y uno identificado sin configuración recibe 503; ningún primer visitante se convierte en administrador.
3. El propietario inicia sesión con ChatGPT desde `/admin`, usando `/signin-with-chatgpt?return_to=%2Fadmin` como navegación superior. `/api/identity` devuelve únicamente la identidad de la sesión actual. El panel muestra su `userId` estable para ESTE Site y el correo de esa misma sesión. Un ID de otro Site no sirve; el correo es solo identificativo y no concede acceso.
4. Tras verificar cuenta e ID con el propietario y obtener la confirmación correspondiente para este acceso persistente, configurar el valor de runtime `ROHO_ADMIN_USER_IDS` mediante la herramienta nativa de secretos/configuración de Sites, como JSON con exactamente ese ID: `["ID_VERIFICADO_DE_ESTE_SITE"]`. No se ha configurado ningún ID real en esta entrega. No añadir identidades de colaboradores sin autorización explícita.
5. Comprobar entrada del propietario, denegación de anónimos/otras cuentas, guardado de borrador, publicación y persistencia entre dispositivos. Crear la primera instantánea usando «Guardar borrador» conserva los datos existentes sin un seed remoto separado.

### Confirmación que se puede agrupar

Una vez identificada la sesión correcta: «¿Autorizas activar la administración de ROHO para tu cuenta [correo verificado / ID de este sitio], con permiso persistente para editar y publicar el catálogo, textos e imágenes? Mantendré la audiencia actual del sitio». La aprobación debe cubrir la configuración de acceso cuando se ejecute; la herramienta puede requerir su confirmación nativa. No solicitar contraseñas ni un OAuth externo.

## Alcance y límites deliberados

Esta versión administra cafés y kits ligados a una cosecha trazable, las categorías que los agrupan y sus filtros actuales. Los objetos sin café o sin cosecha necesitan ampliar el esquema y su ficha antes de publicarse. No se ha prometido un CMS genérico de todos los contenidos de la marca. Categorías y cosechas ya tienen una interfaz de campos específica; no se requiere editar JSON.

No hay eliminación permanente desde el panel; se archivan productos. Las imágenes no referenciadas no son públicas y se conservan para no romper borradores o historial. Una política futura de limpieza/borrado requiere definir retención y aprobación.

## Verificación local

- Build de producción del Worker completado con el helper oficial.
- TypeScript `tsc --noEmit` sin errores.
- Pruebas con `node --test scripts/test-catalog.mjs scripts/test-admin.mjs`: filtros, autenticación cerrada, CSRF, esquema, imágenes, borrador/publicación, historial, restauración, exclusión pública y conflictos de concurrencia. Las pruebas de persistencia usan SQLite real con adaptador D1 y la migración generada.
- Migración aplicada SOLO a D1 local de Miniflare; comprobaciones HTTP locales: página pública/admin/activos/catalog-script 200, API administrativa anónima 401, identidad no autorizada sin allowlist 503, imagen inexistente 404.
- No se ha realizado inspección visual en navegador ni una prueba con identidad real de Sites. Eso debe comprobarse en la activación protegida.

En este entorno, el instalador necesitó `npm_config_cache=<checkout>/.sites-runtime/npm-cache` y el preview necesitó `XDG_CONFIG_HOME=<checkout>/.sites-runtime/xdg` por rutas de caché no disponibles. No cambian configuración remota ni credenciales.
