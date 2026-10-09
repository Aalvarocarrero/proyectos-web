# Venezuela Agro: matriz funcional y alcance de verificación

Fecha de revisión: 7 de octubre de 2026. Documento del código de trabajo local; no es una certificación de producción, publicación del Site ni aceptación en dispositivos físicos.

## Actualización verificada: versión privada 50

A las 23:19:39 UTC del 7 de octubre se publicó correctamente la versión 50 en `https://venezuelaagro.aalvarocarrero.chatgpt.site`, commit `a5d06a1da4f7a41bb03faba23c8a5483d2e06c69`. La lectura posterior del hosting confirmó versión 50 y un único usuario permitido. El código de esa entrega pasó 359/359 pruebas, compilación, TypeScript y lint sin errores (27 advertencias). Esta evidencia reemplaza el estado histórico «publicación pendiente» de la primera auditoría; no convierte las pruebas sintéticas en pruebas físicas.

| Área añadida o corregida | Estado comprobado | Límite pendiente |
| --- | --- | --- |
| Mi Finca, formularios y mapa | Guardado único, avisos tras persistencia, selectores/diálogos, separación de cuentas, geometría de 3–200 vértices y referencia geográfica tienen pruebas de código. | Repetir los flujos completos en los dispositivos reales del usuario; no todos los controles han tenido QA físico posterior. |
| `/finca-demo` | Espacio de práctica independiente, CRUD de ocho tipos, reinicio explícito, copia propia, conflictos entre pestañas y preservación de fincas reales modelados. El conjunto actual contiene 56 registros y dos borradores. | Los ejemplos nuevos solo sustituyen datos de práctica mediante un reinicio confirmado. No se convierten en registros reales. |
| Historial animal | Una ficha por animal y mediciones fechadas ordenadas; el porcino nuevo muestra 60/70/80/120 kg como caso ficticio. | No son un límite biológico ni un calendario técnico de pesaje. |
| Mercado y categorías | 21 ejemplos diferenciados separados de ofertas reales; unidades compatibles con formulario; familias y subrubros filtrables. | Precios, existencias, contactos y confirmación comercial dependen de publicaciones reales. |
| Directorios y registro | 12 perfiles ficticios completos y seis ejemplos de ficha pública; imágenes y contactos ficticios identificados. | No acreditan personas, títulos, fincas ni ofertas reales. |
| Proyectos | Vista ficticia completa de los campos, separada de propuestas reales aprobadas. | No envía ni contrata; los detalles de contacto adicionales de propuestas existentes no se han ampliado públicamente. |
| `/stickers` | Diez ilustraciones terminadas, filtros, vistas ampliadas, PNG y ZIP reales; archivos/tamaños/miembros verificados. | Nueva revisión solicitada: personajes humanos en parejas mujer/hombre con diversidad y estética llanera. La ampliación está detenida hasta recibir sus reemplazos aprobados. Guardado en iPhone/Android pendiente de comprobación física. |
| Biblioteca sin señal | Recursos de aplicación y lectura pública preparados con límites y estados; caché privada no indiscriminada. | Requiere primera preparación con conexión, espacio y conservación del almacenamiento. Imágenes de stickers se descargan aparte. |
| Satélite | Una muestra pública delimitada, fechada y descargable, con capa privada independiente. | No existe todavía cobertura detallada automática para la zona de cada finca. |
| Dominio/hosting externo | Código, taxonomía y notas de portabilidad disponibles. | No se ha migrado identidad, D1/R2, archivos ni datos locales a otro origen; DNS y despliegue externo no forman parte de estas publicaciones privadas. |

La revisión avanzada previamente bloqueada del procesamiento de imágenes subidas sigue excluida. Las fotografías estáticas y los nuevos PNG de stickers no son una finalización de aquel trabajo.

## 1. Cómo leer esta auditoría

Se separan cuatro cosas que no son equivalentes:

- **Código revisado:** existe una implementación identificable en el checkout actual.
- **Prueba sintética:** hay casos automatizados con datos ficticios, SQLite en memoria, R2 simulado, `fake-indexeddb`, sesión simulada o cachés de prueba. No usa registros comerciales ni fincas reales.
- **Renderizado:** se ejecutó el Worker compilado y se inspeccionó su HTML/respuesta. No significa que se hayan pulsado los controles en Safari o Chrome.
- **Pendiente real:** requiere hosting, sesión, DNS, navegador interactivo o dispositivo físico. No se marca aprobado por inferencia.

Resultado histórico de la primera auditoría: **build aprobado; 118/118 pruebas aprobadas, cero fallos, cancelaciones u omitidas; TypeScript aprobado; ESLint con 0 errores y 28 advertencias; 73 recursos offline generados**. Evidencia conservada en `docs/audit-evidence/tests-2026-10-07.txt`, `verification-2026-10-07.txt`, `lint-2026-10-07.txt` y `routes-2026-10-07.txt`. Estos resultados no equivalen a pruebas físicas de navegador ni confirman despliegue. Al cerrar este documento, la publicación privada final seguía pendiente de su propia verificación.

### Evidencia anterior conservada

En la primera pasada del 7 de octubre se ejecutaron 19 pruebas focalizadas de tienda, profesionales, comunidad, contactos y HTML renderizado, todas aprobadas. Un recorrido adicional del **build que existía entonces** siguió 44 páginas de aplicación con respuesta 200 y no encontró destinos de fragmento internos ausentes. También se inspeccionaron robots, sitemap y páginas demostrativas. Estas cifras son antecedentes, no resultados del código posterior a las correcciones.

El recorrido utilizó un sustituto de `ASSETS` que respondía 404: los enlaces a SVG no se validaron como entrega HTTP, aunque los archivos de guías estaban presentes y no vacíos. `/signin-with-chatgpt` depende de la pasarela de Sites; su respuesta en ese ensayo local no prueba que el inicio de sesión del hosting falle.

## 2. Origen privado actual y futuro dominio

| Aspecto | Estado y límite |
| --- | --- |
| Origen conservado | `https://venezuelaagro.aalvarocarrero.chatgpt.site`, usado por `SITE_ORIGIN`, enlaces canónicos y enlaces compartidos. |
| Alcance actual | Se mantiene la fase privada del Site. No se ha autorizado mediante este documento abrir acceso a terceros. La ACL del hosting debe comprobarse separadamente: `noindex` no es autenticación ni control de acceso. |
| Dominio candidato | `https://venezuelaagro.com`, guardado como `FUTURE_ORIGIN` y candidato de producción. `DOMAIN_STATUS` es `domain-unverified`. |
| DNS, titularidad y HTTPS | No verificados en esta auditoría. No se compró dominio, cambió DNS, emitió certificado ni modificó correo/MX. |
| Indexación actual | `PUBLIC_INDEXING_ENABLED=false`. El Worker añade `X-Robots-Tag: noindex, nofollow`; la política de metadata también deshabilita indexación. El sitemap servido permanece vacío. |
| Robots actual | Permite rastrear para que se pueda leer `noindex`; no anuncia sitemap de producción. Esto no publica por sí mismo un Site privado. |
| Preparación SEO futura | Existe una taxonomía y generador separado de candidatos públicos. Al activarse, deben incluirse solo contenidos reales activos/publicados y excluir espacios privados y demostraciones. |
| Migración de datos | Cada origen posee su propio IndexedDB y service worker. Cambiar dominio no traslada datos locales, sesión, cola ni imágenes R2 automáticamente. |

Fuentes: `lib/site-identity.ts`, `lib/indexing-policy.ts`, `app/robots.ts`, `app/sitemap.ts`, `worker/index.ts`, `tests/indexing-policy.test.mjs`.

## 3. Matriz de rutas y navegación

La palabra «pública» describe la función del contenido dentro de la aplicación, no una afirmación de que el hosting privado permita acceso anónimo desde Internet.

| Ruta o grupo | Función y datos | Evidencia disponible | Pendiente o restricción |
| --- | --- | --- | --- |
| `/` | Presentación de Venezuela Agro, producción y accesos principales. Invitación de ideas en la portada. | HTML previo 200; código y pruebas de renderizado/invitación. | Revisión visual e interacción del build final en móvil. |
| `/tienda` | Catálogo propio de Los Morochos, carrito local, solicitud particular o cotización empresarial. | HTML previo 200; validación de unidades/cortes; prueba sintética de envío a vista administrativa. | No hay pago, inventario en tiempo real, precio final ni entrega confirmada. |
| `/marketplace` | Consulta/filtros de publicaciones activas; caché local y ejemplos identificados. | HTML previo 200; contratos de categorías/contactos y código revisados. | Caché no garantiza actualidad, disponibilidad ni descarga íntegra del mercado. |
| `/marketplace/[id]` | Detalle de una publicación activa no eliminada, contacto y datos estructurados. | Renderizado sintético del detalle y regresión de JSON-LD. | Sesión, oferta y negociación real no ensayadas. Una caída de D1 no equivale a detalle disponible. |
| `/marketplace/publicar` | Formulario de publicación, contacto e imagen; requiere cuenta para envío. | HTML previo 200; validación completa del payload en código actual. | La recepción no equivale a publicación: pasa por moderación. Ruta excluida de indexación. |
| `/profesionales` | Directorio filtrable de personas y empresas; gestión de perfiles propios con edición/retirada. | HTML previo 200; schemas, perfiles demostrativos, bootstrap y control de versiones cubiertos por pruebas. | Edición, cierre, repetición y retirada deben recorrerse en navegador real. |
| `/profesionales/[id]` | Perfil activo real, fundador o ejemplo claramente marcado; contacto autorizado. | Detalle demostrativo previo 200 y pruebas de presentación/contactos. | La plataforma no certifica títulos, experiencia ni registro mercantil. |
| `/fincas` | Directorio de fichas públicas y formulario de productor/finca. | HTML previo 200; aislamiento de datos privados y moderación en SQLite de prueba. | La ficha no certifica propiedad o titularidad. No hereda planos/inventarios privados. |
| `/fincas/[id]` | Producción, procesos, actividades y contacto público de la finca. | Seis detalles demostrativos recorridos; pruebas de publicación/retirada. | Demos no son ofertas ni fincas verificadas. Las reales necesitan estado activo. |
| `/red` | Novedades, comentarios y reacciones asociadas a fincas publicadas. | HTML previo 200; autorización, revisión y reintentos de reacción modelados. | Moderación y actividad reales no realizadas. |
| `/red/[id]` | Enlace directo a una publicación activa de una finca activa. | Detalle de ejemplo renderizado; código actual usa consulta específica por publicación al actualizar. | Falta recorrido interactivo de reconexión sobre un post antiguo fuera del feed reciente. |
| `/proyectos` | Propuestas revisadas y formulario de colaboración. | HTML previo 200; schema aplicado antes de encolar en código actual. | No promete inversión, contrato ni respuesta automática. |
| `/aprende`, `/aprende/[slug]` | Guías integradas y artículos publicados; acciones hacia herramientas. | Índice y guías recorridos; fallback sin D1 y recursos de guías incluidos en pruebas. | Lectura no sustituye asesoría especializada ni asegura acceso a vínculos externos. |
| `/rubros` | Taxonomía de animales, cultivos, productos, insumos y servicios. | HTML previo 200; compatibilidad de categorías y filtros en pruebas. | Enumerar un rubro no confirma oferta propia ni existencia comercial. |
| `/plataforma` | Explicación de Mi Finca, instalación y uso local. | HTML previo 200; metadata/código revisados. | Instalación PWA real por sistema operativo pendiente. |
| `/nosotros` | Historia e identidad de la marca. | HTML previo 200; navegación revisada. | No se inventaron nuevas credenciales o verificaciones externas. |
| `/guia-institucional` | Orientación y enlaces institucionales. | HTML previo 200. | No se verificó en esta pasada la disponibilidad/actualidad de cada web externa. |
| `/legal/privacidad`, `/legal/terminos`, `/legal/comercio` | Información de privacidad, condiciones y funcionamiento comercial. | HTML previo 200; metadata revisada. | No constituye revisión jurídica local ni autorización para cobrar. |
| `/creditos-fotograficos` | Procedencia, autores, licencias y distinción contextual de imágenes. | HTML previo 200; pruebas de metadatos/procedencia y archivos. | Fotografía contextual no acredita que se tomara en una finca anunciada. |
| `/app` | Mi Finca con cuenta o espacio local según identidad verificada. | HTML y bucle offline modelado con CRUD, cierre/reapertura y reconexión. | La prueba modelada no certifica ciclo de vida de iOS/Android. |
| `/app-local` | Shell completo sin identidad autenticada; fuerza espacio del dispositivo. | Prueba de HTML sin ID/email de cuenta y pruebas de separación local. | No mezcla ni adopta datos automáticamente en una cuenta. |
| `/offline` | Orientación y acceso a Mi Finca preparada. | Código revisado y prueba de metadata/indexación. | Solo puede usar recursos que se hayan preparado y sigan almacenados. |
| `/admin` | Revisión comercial/editorial y consulta de ideas, solicitudes y usuarios. | Autorización y endpoints modelados con identidades ficticias. | Solo identidades administrativas autorizadas; no se moderaron datos reales. |
| `/robots.txt`, `/sitemap.xml` | Política de indexación actual y futura. | Pruebas de política y renderizado disponibles. | No usar el sitemap de candidatos como prueba de dominio operativo. |

Navegación común: cabecera adaptable, menú desplegable, pie, enlaces entre directorios/comunidad/mercado y acceso a Mi Finca. La revisión HTML anterior encontró los fragmentos usados; no cubre foco, teclado, menú abierto durante navegación, Atrás/Adelante, cierre de diálogos ni áreas táctiles del build final.

## 4. Matriz de funciones, persistencia y comunicaciones

| Función | Destino efectivo | Qué confirma el código | Qué no confirma |
| --- | --- | --- | --- |
| Carrito | IndexedDB del espacio seleccionado. | Producto, corte/presentación, cantidad, unidad y especificaciones se conservan localmente. | No reserva stock ni crea deuda/pago. |
| Solicitud particular | Cola local → `/api/sync` → `order_requests` en D1 → `/api/admin`. | Aceptación de solicitud y lectura administrativa; compatibilidad con pedidos antiguos. | No envía correo/SMS/WhatsApp al comprador ni notificación externa al operador. |
| Cotización empresarial | Misma ruta, conservando `channel`, `business`, líneas y nota. | Parser y vista administrativa preservan cortes, unidades, preparación, logística y empresa. | No calcula una oferta vinculante ni confirma frecuencia de abastecimiento. |
| Publicación de mercado | Cola → D1; foto a R2 bajo namespace/versionado propio. | Recepción por operación, propietario, validación y estado pendiente. | Sin revisión administrativa no se vuelve oferta pública. |
| Perfil profesional/empresa | Cola → D1 y R2 si incluye foto; bootstrap para perfiles propios. | Crear, cargar, editar y retirar; los cambios vuelven a revisión. | Declaraciones y enlaces no prueban habilitación profesional ni identidad registral. |
| Ficha pública de productor | Cola → perfil D1 separado de Mi Finca. | Campos públicos explícitos, propietario y consentimiento vigente. | No transmite automáticamente plano, costos, inventarios ni datos privados de gestión. |
| Proyectos | Cola → `project_proposals`, pendiente de revisión. | Validación antes de encolar y conservación de propuesta. | No contratación, inversión ni contacto automático. |
| Comentarios/posts | Cola → D1 pendiente; reacciones asociadas a cuenta/post. | Propiedad, estado de finca/post e idempotencia de reacciones. | No publicación instantánea de texto sin revisión. |
| Ideas/sugerencias | Cola → `feedback_submissions` → panel administrativo. | Solo un acuse persistido de la operación concreta permite «Idea recibida». | No crea boletín, no publica la idea, no envía email/SMS ni promete respuesta. |
| Datos de contacto de cuenta | Endpoints de consentimiento/seguridad y D1. | Coincidencia escrita de correo y teléfono válido; consentimiento versionado. | Escribir/repetir un email o teléfono no verifica su posesión por código. |
| Contactar un anuncio/perfil | Enlace `tel:`, `mailto:` o web/WhatsApp declarado. | Construye un enlace para que la persona decida continuar. | No equivale a enviar un mensaje desde el servidor de Venezuela Agro. |

No se encontró integración de correo transaccional, proveedor SMS o envío de WhatsApp en los endpoints revisados. Los estados «guardado», «recibido», «en revisión», «publicado» y «contactado» no son intercambiables. Un estado administrativo «contactado» es un registro de gestión, no evidencia técnica de entrega de un mensaje.

### Registro, validación y moderación

- **Profesional:** nombre, profesión, especialidades, estado, modalidad, presentación y teléfono; admite cero años de experiencia. El formulario exige correo público confirmado por repetición. Los enlaces admitidos se validan y las redes deben corresponder a su plataforma.
- **Empresa:** usa el mismo flujo con tipo «Empresa» y nombre corporativo obligatorio; los datos registrales son declarados y opcionales donde lo indica el formulario. No existe una verificación mercantil externa.
- **Productor/finca pública:** valida nombre, responsable, teléfono, estado, descripción, rubros y al menos una actividad; la declaración de autorización del formulario no equivale a certificación de propiedad.
- **Marketplace/proyectos:** se aplica el schema completo antes de encolar, además de validación servidor. Los errores permanentes se conservan para revisión y no se presentan como aceptación confirmada.
- **Moderación:** la petición incluye la versión revisada. Una aprobación desactualizada o una ficha retirada no debe resucitar contenido; el servidor responde conflicto. El panel muestra el contenido disponible para revisión, con vista completa de perfiles y detalles de las solicitudes.
- **Fotos:** claves independientes por tipo/operación; el endpoint comprueba el registro vinculado y el estado. Una imagen pendiente/retirada no se sirve al visitante público; propietario y administrador conservan acceso autorizado. El servidor exige revalidar el estado en cada descarga.
- **JSON-LD:** serialización que escapa `<` antes de insertarse en HTML. No se confía en la moderación como mecanismo de sanitización.

Fuentes principales: `components/store-catalog.tsx`, `lib/order-details.ts`, `components/community-forms.tsx`, `components/professional-manager.tsx`, `components/listing-form.tsx`, `lib/sync-validation.ts`, `lib/network-profile.ts`, `app/api/sync/route.ts`, `app/api/admin/route.ts`, `app/api/media/[...key]/route.ts`, `lib/json-ld.ts`.

## 5. Endpoints: alcance y dependencias

| Endpoint | Contrato revisado | Dependencias / límite de ensayo |
| --- | --- | --- |
| `GET /api/offline-session` | Identifica propietario actual o espacio local; lectura sin caché. | Identidad de Sites; cambio de cuenta modelado. |
| `GET /api/bootstrap` | Datos propios, revisiones y evidencia de bajas; incluye profesionales, proyectos y comunidad propios. | Cuenta y D1. No sustituye exportación íntegra del servidor. |
| `POST /api/sync` | Valida lote, propietario, consentimiento, payload y versión; devuelve aceptados/rechazados por operación. | D1 y R2 para fotos; pruebas actuales son sintéticas. |
| `GET /api/marketplace` | Publicaciones activas no eliminadas; sin metadatos internos de propiedad/revisión. | D1; límites de resultados, no exportación completa. |
| `GET /api/community` | Profesionales/proyectos activos con proyección pública. | D1; consulta pública no es gestión de solicitud propia. |
| `GET /api/red` y `?post=…` | Feed o detalle específico, con estado de reacción del usuario. | D1/sesión; respuesta privada sin caché por personalización. |
| `GET /api/media/[...key]` | Comprueba publicación o acceso de propietario/administrador antes de entregar el objeto. | D1 + R2. No hay migración automática de adjuntos entre orígenes. |
| `GET /api/security/status` | Estado de contacto/consentimiento/dispositivo. | Sesión y D1; no prueba recepción de código. |
| `/api/security/consent`, `/api/security/device` | Actualizaciones de consentimiento/dispositivo con controles de sesión y petición. | Solo se ensayaron contratos sintéticos; no se revocaron dispositivos reales. |
| Rutas antiguas de passkey | Devuelven 410. | Biometría/llaves de acceso no activas. |
| `GET/PATCH/POST /api/admin` | Lectura administrativa, moderación versionada y contenido editorial. | Dos identidades expresamente autorizadas en código; resto 403 en pruebas. No confundir un mock con autenticación real del hosting. |

## 6. Mi Finca sin señal, propiedad y concurrencia

| Aspecto | Implementación / evidencia de código y pruebas | Límite que permanece |
| --- | --- | --- |
| Primera preparación | Verifica shell local y recursos esenciales de la versión; fallo de código esencial impide declarar preparación. | Requiere primera carga online y espacio suficiente. |
| Instalación/actualización | Service worker versionado; limpieza de cachés antiguos sin borrar IndexedDB. | Instalación, expulsión de caché y actualización real deben ensayarse por navegador. |
| Separación de cuentas | Namespace IndexedDB por propietario; `device-local` separado; validación de propietario antes de enviar/hidratar. | No es cifrado del dispositivo ni biometría. |
| Cerrar/reabrir sin señal | Cuenta recordada solo tras preparación explícita online y elección al reabrir; cancelar abre el espacio local. | Modelo de sesión/almacenamiento aprobado en hitos previos; cierre forzado real aún pendiente. |
| CRUD local | Finca, registros, animales, pesajes, áreas, ciclos, inventario, finanzas, sanidad y tareas usan datos locales/cola. | Datos guardados solo localmente pueden perderse si el navegador o usuario los borra. |
| Reintentos | Aplicación abierta: al recuperar conexión, volver a visible y cada cinco minutos; lotes de hasta 100 operaciones y control de tamaño. | No garantía de ejecución con la PWA cerrada ni en segundo plano iOS. |
| Cola larga/rechazos | Drenaje progresivo; operaciones rechazadas se separan para no bloquear posteriores; acuses por operación. | Red/servidor caídos siguen pendientes; no deben contarse como confirmados. |
| Conflicto por registro | Revisiones comparadas atómicamente en servidor, idempotencia y rechazo de identificador reutilizado. | No constituye una transacción de negocio entre varios registros. |
| Bajas | Evidencia de eliminación y revisión impiden que una copia antigua vuelva a crear el mismo registro por accidente. | Recuperar/adoptar datos de otro origen requiere decisión y flujo explícito. |
| Cambios en vuelo | Cola y caché conservan la intención local más reciente; pruebas de respuestas/bootstrap tardíos entre pestañas. | No certifica todas las combinaciones de pestañas/dispositivos reales. |
| Resolver conflictos | Compara copias; usuario elige reintentar local o conservar servidor; historial incluido en copia local. | Requiere revisión consciente. No fusiona automáticamente campos contradictorios. |
| División automática de áreas | Restaurada mediante escritura atómica de ambas áreas. En espacio local: una transacción IndexedDB; en cuenta: endpoint D1 con versiones, recibo e inserción conjunta. 20 pruebas servidor más regresiones de almacenamiento y actualización concurrente. | En cuenta requiere conexión, finca y área sincronizadas. No es levantamiento topográfico certificado ni autorización para asumir invariantes globales de todas las ediciones de superficie. |

La pausa evita que la división automática produzca escrituras parciales. La mejora acotada pendiente es diseñar una operación transaccional de división/asignación con invariante de superficie y pruebas concurrentes antes de reactivarla. La seguridad de versiones por registro no autoriza afirmar que todas las asignaciones multirregistro están resueltas.

Fuentes: `lib/offline-owner.ts`, `lib/offline-db.ts`, `lib/revision-write.ts`, `components/offline-readiness.tsx`, `components/offline-workspace-gate.tsx`, `components/offline-sync-manager.tsx`, `components/sync-issues.tsx`, `public/sw.js`.

## 7. Copias, recuperación y cambio de origen

- Exportación JSON versión 1 de entidades, cola y metadatos mediante lectura consistente. Incluye información privada; debe conservarse de forma segura.
- Importación local de hasta 15 MB con vista previa y confirmación; valida estructura, tipos, fechas, duplicados, claves peligrosas, profundidad y límites antes de escribir.
- Importación atómica e idempotente: conserva registros actuales y bajas pendientes. Siempre restaura al espacio local sin cuenta, aunque haya una sesión iniciada.
- Recuperación antigua explícita: preserva la base original; no asigna automáticamente registros a una cuenta.
- No reenvía solicitudes comerciales históricas por importar/recuperar. No comunica datos a un servidor por el mero acto de importar.
- Imágenes remotas no quedan embebidas por una exportación de JSON. Los adjuntos remotos/R2 necesitan copia y migración propias; los datos de imagen ya presentes en payloads locales se conservan según formato/límite.
- Se modelan interrupción y repetición de importación; falta ensayo real de archivos grandes, cuota baja y cambio de origen con dispositivos del usuario.

Fuentes: `lib/backup-import.ts`, `lib/legacy-recovery.ts`, `components/backup-import-control.tsx`, funciones de exportación/importación en `lib/offline-db.ts`, `tests/backup-import.test.mjs`, `tests/offline-storage.test.mjs`.

## 8. Invitación de ideas

La invitación automática se limita a la portada, espera nueve segundos y no se repite durante siete días en el almacenamiento de ese navegador. Evita interrumpir escritura, otro diálogo, invitación de instalación o pestaña oculta. El disparador manual sigue disponible. Si no se puede conservar el registro de frecuencia, se suprime la apertura automática.

El formulario valida 10–1.500 caracteres de idea y hasta 180 de contacto opcional. Cerrar/Escape no borra lo escrito mientras el componente/página continúe abierto; no se promete supervivencia del texto aún no enviado después de recargar. Una idea ya encolada sí se conserva en el almacenamiento local.

El recibo usa el identificador exacto de operación y su acuse persistido. Ni éxito de otro envío ni fracaso de otra operación del mismo lote permiten inferir el estado de esta idea. Los estados pendiente, bloqueado y desconocido mantienen un mensaje explícito de recepción no confirmada.

La fotografía es una adaptación WebP de una imagen documental de Yaracuy atribuida a Wilfredor, con origen/licencia CC BY-SA 3.0 registrados en `lib/idea-invitation-photo.ts`. No se atribuye al retratado respaldo a la plataforma. La revisión automatizada de archivo/créditos no reemplaza evaluación visual de legibilidad, recorte, contraste y foco en móvil.

Pruebas relacionadas: `tests/idea-invitation.test.mjs`, `tests/idea-delivery.test.mjs` y caso de persistencia/administración en `tests/audit-endpoints.test.mjs`.

## 9. Correcciones incorporadas y verificación pendiente

| Hallazgo de la primera pasada | Estado en el código actual | Evidencia a conservar en cierre |
| --- | --- | --- |
| Admin perdía líneas y empresa por interpretar el sobre de pedido como array. | Parser compatible y descripción completa de solicitud. | Caso de cotización desde sync a admin, cortes/unidades/notas/empresa intactos. |
| JSON-LD de marketplace admitía cierre de script. | Serializador seguro compartido. | Payload hostil conserva texto sin crear etiquetas. |
| Aprobación antigua podía reactivar ficha retirada. | Condición de no eliminado + versión esperada. | Respuesta 409 y estado eliminado intacto. |
| Proyectos/listings podían encolar payload inválido sin corrección clara. | Schema completo antes de guardar; estados/errores por operación. | Validación e interacción real del formulario; no limitarse al schema. |
| Teléfono de tienda permitía solo puntuación. | Comprobación de 7–15 dígitos. | Casos de entrada y compatibilidad con solicitudes antiguas. |
| Actualizar un permalink antiguo lo filtraba fuera del feed. | Consulta específica `?post=` en endpoint y cliente. | Probar reconexión/Actualizar sobre post fuera del feed reciente. |
| No había gestión propia de perfiles profesionales. | `ProfessionalManager` con carga, edición y retirada. | Recorrido de cuenta real de prueba, revisión, cambios posteriores y cancelación. |

Las reproducciones originales se realizaron en memoria. La columna «estado» describe cambios de código presentes, no afirma por sí sola que hayan sido desplegados o aprobados en UI real.

## 10. Lista de aceptación antes de abrir o migrar

1. Conservar la evidencia agregada final indicada arriba y verificar el despliegue privado sobre esa versión exacta. Confirmar migraciones de esquema necesarias antes de usar endpoints nuevos; no dar por aplicadas las migraciones locales en D1 real.
2. En Safari/iPhone/iPad y Chrome/Android/ordenador: instalar, preparar, modo avión, crear/editar/eliminar, cerrar completamente, reabrir, elegir espacio y reconectar. Verificar datos, pendientes y acuses después de cada interrupción.
3. Probar dos cuentas y dos pestañas/dispositivos, salida/cambio de cuenta, respuestas tardías, conflicto y resolución, espacio bajo, caché expulsado y actualización del service worker. Nunca limpiar IndexedDB para «resolver» una actualización.
4. Recorrer tienda particular/empresa, perfil natural/empresa, productor, marketplace, proyecto e idea con datos sintéticos acordados; verificar recepción en administración y moderación sin contactar terceros.
5. Revisar teclado/foco/Escape, doble pulsación, Atrás/Adelante, cerrar/cancelar, alturas móviles, contenido largo y formularios con error. Una respuesta HTML 200 no basta.
6. Verificar en los dispositivos finales el flujo de división restaurado. En cuentas necesita conexión y cambios ya sincronizados; ante respuesta incierta, actualizar antes de repetir. La transacción conserva la superficie de las dos mitades.
7. Antes de `venezuelaagro.com`: verificar propiedad, soporte del hosting, DNS, TLS, acceso privado/público elegido, autenticación/callbacks y correo existente. Ensayar exportación/restauración y migración de D1/R2 y datos locales sin borrar el origen anterior.
8. Solo después de aprobación y comprobación de dominio/acceso: cambiar origen canónico e indexación. Revalidar sitemap, robots, contenido real frente a demos y exclusión de `/app`, administración, autenticación y APIs privadas.
9. Si se desean avisos por email/SMS/WhatsApp, diseñar y autorizar expresamente proveedor, destinatarios, contenido y costos. La persistencia actual en D1 no incluye ese servicio.

Este documento no registra compras, mensajes externos, cambios DNS, apertura del Site, publicación de perfiles reales ni moderación real realizada durante las pruebas.

## Verificación del despliegue privado

Versión 31 publicada correctamente el 7 de octubre de 2026 a las 04:48:51 UTC. Commit de aplicación: `ad4a5e42d5073a0f80f9b9eac55b46452eff0aec`.

A las 04:50 UTC se verificó el esquema D1 desplegado mediante las herramientas de lectura de Sites: las ocho tablas mutables contienen `revision`, `last_operation_id` y `last_operation_hash`; `sync_receipts` contiene `operation_hash`, `receipt_status` y `server_revision`. Confirma los efectos de las migraciones 0005 y 0006. No se modificaron registros ni se conservaron valores de filas en la evidencia.

La revisión posterior a v31 restaura la división segura y corrige el rótulo de ideas y las explicaciones de envío sin conexión. Revisión independiente final: 55 pruebas focalizadas aprobadas. Suite agregada actual: 118/118. Captura real de la invitación inicial en cloud Chrome confirma literalmente las cuatro frases aprobadas y los controles de cierre. No se verificó visualmente el retraso automático semanal ni el diseño en teléfono físico.
