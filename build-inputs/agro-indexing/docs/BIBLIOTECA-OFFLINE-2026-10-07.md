# Venezuela Agro: descarga ampliada sin señal

## Qué se prepara

Desde «Descargar sin señal» en el menú o desde Mi Finca → Sincronización se abre una biblioteca neutral, sin identidad de cuenta incrustada en el HTML.

La descarga explícita incluye aproximadamente 7,6 MiB de recursos: imágenes propias del sitio, diagramas, páginas de referencia y su versión exacta de JavaScript, estilos y fuentes. Una segunda fase descarga hasta 2 MB de texto público: como máximo 100 registros activos por cada sección. La interfaz muestra fecha, número de registros, tamaño y límites; una colección parcial no se presenta como toda la plataforma.

| Área | Disponible localmente | Condición o límite |
| --- | --- | --- |
| Mi Finca | Animales, pesajes, áreas, ciclos, inventario, planes y costos guardados; copias/importación; cola y conflictos | Preparar previamente el dispositivo. Cuenta recordada solo por elección explícita. División de cuenta requiere conexión; división solo-dispositivo es atómica local. |
| Aprende | Todas las guías y artículos incorporados a esta versión, con texto y navegación local | Un artículo nuevo no incluido requiere conexión. No se inventa su contenido. |
| Rubros | Familias y listado de referencia | No representa producción o stock actual. |
| Tienda | Catálogo, presentaciones, carrito y preparación de solicitudes | Envío confirmado, precios, existencias y entrega necesitan conexión/confirmación comercial. |
| Mercado, profesionales, fincas, comunidad y proyectos | Búsqueda en fichas/posts públicos seleccionados y fechados | Hasta 100 por sección; texto sin agendas de contactos, fotos subidas por usuarios ni datos privados. Hilos completos, nuevos resultados e interacciones remotas necesitan conexión. |
| Borradores de publicación | Formularios existentes de anuncio, perfil profesional/empresa, ficha de finca y proyecto | Guardar antes de cerrar. Se respeta el espacio local elegido. Sin una cuenta preparada quedan en el dispositivo y no se adoptan automáticamente al iniciar otra cuenta. |
| Ideas | Formulario y cola local existentes | «Recibida» requiere el acuse real de esa operación. |
| Historia, plataforma, guía institucional, políticas y créditos | Páginas de referencia e imágenes del sitio | Sitios externos y trámites necesitan conexión. |
| Administración, acceso, permisos y confirmaciones externas | No se simulan sin conexión | Necesitan servidor y autenticación válida. |

## Preparación y conservación

1. Con internet, abrir la biblioteca y pulsar «Descargar / actualizar Venezuela Agro».
2. Esperar las dos fases y comprobar por separado páginas/recursos y directorio público. Una fase fallida no se presenta como descarga completa.
3. Revisar la fecha antes de salir. El directorio se actualiza al volver a abrir la biblioteca con internet; se oculta tras siete días sin renovación. Un perfil puede haber sido retirado después de la última copia.
4. Para datos privados, descargar además la copia de Mi Finca. El navegador puede liberar almacenamiento; ningún icono de instalación garantiza que los datos estén preparados.

Los recursos nuevos se guardan en una generación provisional. Solo una generación completa puede utilizarse como biblioteca; conserva su código correspondiente. Una interrupción o falta de espacio no reemplaza la generación anterior. La reparación de la app también se prepara antes de confirmar, sin reescribir una copia válida durante la descarga pública. La huella de versión incluye los contenidos de las imágenes, no solo sus nombres.

Cancelar detiene la preparación y cierra su canal de respuesta. Eliminar la descarga pública espera confirmación del worker y utiliza un contador de generación para impedir que una actualización antigua la vuelva a crear. No borra bases de cuentas, fincas, borradores ni pendientes. Esa limpieza también está disponible si solo quedaron recursos parciales y nunca llegó el directorio.

Las APIs privadas, autenticación y respuestas RSC no se guardan indiscriminadamente. Los enlaces internos de las áreas cubiertas usan navegación de documento para poder recurrir al shell neutral incluso cuando el navegador indica erróneamente que aún tiene conexión.

## Verificación y límites

Pruebas con SQLite/IndexedDB sintéticos, worker simulado y rutas compiladas cubren proyección pública, datos pendientes/eliminados excluidos, cuota, cancelación, repetición, respuestas tardías, limpieza entre fases, versiones de código, interrupción por nuevo despliegue, cachés incompletas y aislamiento de registros privados. La matriz funcional original sigue separando muestras de datos reales y persistencia de notificaciones externas.

Esto no certifica todas las versiones de iOS/Android ni sustituye la prueba física: preparar, activar modo avión, cerrar, reabrir y comprobar los datos y pendientes al reconectar. El stock remoto, pagos, mensajes de terceros y decisiones administrativas no pueden confirmarse offline.
