# Revisión para decidir el lanzamiento · 14 octubre 2026

## Alcance y decisión

Revisión integral de código y recorridos web sobre la versión privada v98, conservada como recuperación: `57d04a52ea9c6f16e43f8922961c1abe342bd182`. La actualización mantiene el mismo proyecto, origen y audiencia privada del propietario. No autoriza el lanzamiento público, cambios de dominio, nuevas credenciales ni servicios de pago.

La entrega sirve como **previsualización funcional privada para revisión**. No debe anunciarse como lanzamiento público certificado: siguen pendientes las comprobaciones de dispositivo real, el ciclo real sin conexión/con reconexión, y las decisiones operativas de dominio, autenticación, moderación y soporte.

## Defectos corregidos

- Navegación y formularios: Cancelar conserva la sección y los datos no guardados; los formularios de práctica tienen protección al cerrar y cambiar de sección.
- Demostración: navegación con URL e historial, foco en el encabezado, búsqueda de animales y datos ausentes legibles en lugar de `undefined`.
- Directorios: búsqueda tolerante a tildes/espacios; vacíos con recuperación; errores de servidor distinguidos de una lista sin publicaciones.
- Aviso de instalación: fila compacta en teléfonos, ayuda ampliada mediante toque, cierre de 44 px y presentación de escritorio alineada a la derecha. Se conservan los tiempos y la secuencia aprobados.
- Backend: cuerpos de solicitud acotados, lectura defensiva de JSON histórico, respuestas de error separadas de éxitos, límites de datos públicos y validación binaria de imágenes subidas. Ver `../AUDITORIA-BACKEND-OFFLINE-2026-10-14.md`.
- Integridad de solicitudes: entradas públicas inválidas no crean recibos persistentes; reutilizar un ID de pedido con contenido diferente ya no recibe una falsa confirmación.
- Actualización offline: la biblioteca comprueba la versión del trabajador antes de descargar y explica cuándo conservar internet, cerrar pestañas antiguas y volver a abrir. Conserva la copia anterior sin forzar la activación ni borrar cachés.
- Caché: respuestas de API y HTML dependiente de identidad no se presentan como contenido público cacheable.
- Compilación: el HTML de v98 solicitaba un `modulepreload` Leaflet inexistente. El manifiesto RSC se elaboraba antes de que Vite retirase un fragmento JavaScript vacío generado exclusivamente por CSS. La corrección elimina solo esas referencias vacías comprobadas, conserva el CSS y rechaza cualquier otra dependencia inexistente. No se modifica Leaflet ni se ocultan errores de JavaScript real.

## Verificación del código final

- TypeScript completo: aprobado (896 MiB de heap; el primer intento limitado a 640 MiB agotó memoria).
- ESLint completo: 0 errores, 48 advertencias existentes de imágenes/hooks/variables.
- Compilación de producción con 640 MiB y un solo hilo: aprobada. Se corrigieron seis referencias al fragmento CSS vacío.
- Suite completa serial: 965/965 pruebas aprobadas, ninguna omitida. Incluye comprobación del HTML de ocho rutas frente a los archivos realmente empaquetados.
- Manifiesto offline: 136 recursos de código/estilo; biblioteca pública de 450 archivos y 20.283.187 bytes, dentro del presupuesto de 20 MiB.
- Restauración sintética: 9 pruebas recorren ocho migraciones, 19 tablas pobladas y archivos R2 ficticios, con comprobación de recibos, corrupción y reintentos. No certifican una copia o restauración del servicio vivo.
- `git diff --check`: aprobado.

## Cobertura del navegador de nube

Recorridos de inicio, Tienda, Mercado Agro, Fincas, Comunidad, Profesionales, Empresas, Proyectos, Aprende, Rubros, historia, plataforma/instalación, biblioteca local, stickers, términos, privacidad, política comercial, créditos, Mi Finca y administración. Se abrieron las 24 guías y artículos visibles desde Aprende, con encabezados correctos, sin imágenes cargadas rotas ni desbordamiento horizontal detectado a 1180 px.

Se verificaron búsqueda vacía y recuperación, fichas ficticias, formulario de tienda y campos obligatorios, modal de proyecto, expediente de animal, comentarios de comunidad, vista previa de compartir imagen, información de oferta ficticia y formularios de registro sin envío. Escape y cierre devuelven el foco en los recorridos comprobados. Las confirmaciones de descarte se cancelaron cuando correspondía.

La preparación explícita de biblioteca en v98 y v99 terminó con “Páginas y recursos preparados” y “Directorio descargado”, con cero fichas reales publicadas. Esto prueba la preparación con red del navegador de nube; no equivale a un ensayo sin red en teléfono.

En v99 también se verificaron búsqueda de animales, ausencia de `undefined`, URL/Volver/Adelante y foco, cancelación de un borrador, guardado local y persistencia tras recargar. El título ficticio usado en la prueba se restauró al original. La búsqueda `carnicos` encontró la categoría `CÁRNICOS`. El aviso de instalación de escritorio dejó visibles ambos botones principales; Escape devolvió el foco al acceso de aplicación.

La preparación v99 no terminó mientras persistía una sesión de pestañas v98; al cerrar solo las pestañas de ensayo y reabrir el mismo origen, se completó sin borrar registros ni cachés. La actualización posterior añade la indicación explícita de esos pasos.

No se publicaron anuncios, ofertas, comentarios o fichas, no se aprobaron solicitudes ni se enviaron mensajes externos. No se alteraron permisos ni se borraron registros reales.

## Límites y condiciones previas a abrir al público

1. Comprobar Safari/iPhone, Android e iPad físicos: instalación, teclado, gesto táctil, orientación, ventanas superpuestas y compartir archivos.
2. Ensayar preparación → modo avión → creación/edición → cierre/reapertura → reconexión y confirmación de respaldo, incluyendo sesión vencida, cuota/evicción y conflictos. Los ensayos automatizados usan dobles de almacenamiento/red.
3. Verificar el recorrido 3D con WebGL real y medir fluidez, batería y memoria. Chromium de nube declara `GL_RENDERER = Disabled`; aquí se verifica la alternativa ligera y geometría sin GPU, no rendimiento gráfico de dispositivos.
4. Confirmar dominio definitivo y callbacks de autenticación antes de cambiar origen. Los datos locales pertenecen al origen actual y requieren un plan explícito de traslado/respaldo.
5. Resolver límites antiabuso: un ensayo aislado aceptó 300 sugerencias válidas consecutivas. Hay límites por cuerpo/lote, pero no una política persistente de frecuencia por emisor ni una defensa equivalente del alojamiento verificada. No se añadió rastreo ni una cuota arbitraria.
6. Revisar el proceso real de altas, revisión, contacto, atención a incidentes y responsable de moderación. Los directorios vacíos reflejan el estado actual, no un fallo del listado.
7. Mantener la indexación desactivada y el acceso privado hasta la decisión expresa del propietario. Los textos legales y referencias técnicas requieren revisión especializada antes de operaciones comerciales reales.

La distribución nativa por App Store/Google Play, pagos y verificación por SMS no forman parte de esta entrega web/PWA.

La comprobación HTTP privilegiada alojada no se completó por una restricción de la herramienta. No se reintentó el endpoint. Las pruebas de autorización con identidades sintéticas y la revisión de código sí se completaron.
