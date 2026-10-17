# Venezuela Agro: marca, aprendizaje y lanzamiento

Decisión de producto · 4 octubre 2026

## Arquitectura de marca

Venezuela Agro es la plataforma nacional. Firma permanente: **Creado por Alimentos Parcela Los Morochos**. La finca mantiene su logo circular oficial, Morochito, identidad marrón/crema/verde, tipografía existente, tienda, historia familiar y ubicación. Los 40 años describen la experiencia de la finca; no la edad del software. No atribuir premios, liderazgo nacional ni certificaciones de velocidad sin evidencia.

No renombrar por ahora las redes de Los Morochos: contienen la historia y actividad comercial de la finca. Crear posteriormente cuentas propias de Venezuela Agro, si se decide, con biografía que identifique al creador y enlaces entre ambas marcas. La tienda de Los Morochos y el marketplace nacional permanecen diferenciados.

## Aprendizaje

Once guías explican acceso, instalación, trabajo sin internet, plano, potreros/lagunas/cultivos, animales/pesajes, producción/inventario/costos, marketplace, profesionales, tienda empresarial y proyectos. Los SVG son ilustraciones didácticas, no capturas certificadas. Los formularios demostrativos reutilizan los componentes del producto, deshabilitados y cargados solo al abrirlos. La biblioteca técnica anterior se conserva; el CMS sigue administrando artículos.

El catálogo central integra cultivos, animales, productos, genética, insumos, maquinaria, tecnología, herramientas, propiedades y servicios. Referencias: INIA/FAO 2008, censo agropecuario 2008 y resultados FEDEAGRO 2025; las ampliaciones son categorías de plataforma. No es una lista gubernamental exhaustiva vigente ni una afirmación de producción comercial de todos los rubros en cada estado. Se puede escribir una categoría adicional sin perder los registros antiguos.

## Dominio madre y SEO

Actualización 6 octubre 2026: el dominio definitivo y su propiedad no están verificados. No se ha modificado DNS ni acceso. Los valores de conexión consignados anteriormente se retiraron por no estar revalidados. El origen canónico sigue siendo el Site privado actual.

La guía vigente de preparación y requisitos de dominio está en `PREPARACION-OFFLINE-Y-DOMINIO-2026-10-06.md`. Conectar un dominio al mismo proyecto y migrar a otro hosting son operaciones diferentes; ninguna se ha ejecutado.

## App y modo local

La entrega actual es web/PWA para iPhone, iPad, Android y computadores compatibles, no binarios nativos de App Store/Google Play. Primera preparación e inicio de cuenta requieren internet. Registros locales funcionan con el dispositivo encendido; novedades del mercado y contacto en línea requieren conexión. La sincronización se intenta cada cinco minutos mientras está abierta, al recuperar conexión y al regresar a la app. Sesión, consentimiento, validación y revisión condicionan la publicación. No prometer sincronización con la app cerrada en iOS.

El service worker actual prepara el shell local y todos los scripts/estilos de la versión. Descarta los cachés antiguos de páginas/API por seguridad, sin eliminar IndexedDB. Solo conserva páginas públicas permitidas; las API y las rutas de autenticación no se cachean.

## Antes de lanzamiento nacional

Pruebas en móviles reales con red rural; validación de la migración de dominio y datos locales; medición PageSpeed real; prueba de almacenamiento/cuota/recuperación; revisión de permisos de publicación; prueba de sincronización con interrupciones y conflictos; políticas y moderación; catálogo revisable por especialistas; contacto de soporte y responsables editoriales. No anunciar disponibilidad ilimitada ni liderazgo nacional antes de verificarlos.
