# Corrección de formularios y capas móviles

Incidencias confirmadas por capturas y fuente de v39:

- Los menús desplegables estaban en la capa50, detrás de los diálogos111 y sus fondos110.
- El panel lateral móvil cambiaba su marcador de sheet-content a sidebar, quedando en la capa50 y detrás de su propio fondo oscuro.
- Cinco formularios de registros y dos financieros/sanitarios consultaban event.currentTarget después de guardar asincrónicamente. El registro podía persistir, pero el reset fallaba y la ventana no cerraba ni notificaba; nuevas pulsaciones creaban registros nuevos.
- El selector de fecha de Safari desbordaba el ancho disponible.

Cambios acotados:

- Menús por encima del diálogo, panel móvil por encima de su fondo y cierre del panel después de seleccionar una sección.
- Referencia al formulario capturada antes del primer await; protección síncrona de envío y bloqueo visual con Guardando.
- Campos deshabilitados y cierre temporalmente bloqueado mientras persiste el registro; una finalización antigua no puede cerrar una ficha nueva.
- Notificación inmediata después de la transacción local; errores visibles dentro del formulario. El estado local no se presenta como respaldo central confirmado.
- Actualización/sincronización posterior separada del éxito local, sin pedir que se duplique un registro ya guardado.
- Campos de fecha y sus etiquetas acotados al ancho del diálogo.

Verificación: compilación de producción, TypeScript,202/202 pruebas y ESLint sin errores (28 advertencias existentes). Prueba sintética con IndexedDB confirma un único animal ante envío repetido, permanencia después de reabrir el módulo y recuperación del bloqueo tras un fallo. Revisión independiente de código y5 pruebas enfocadas aprobada. No equivale a prueba física de la nueva versión en Safari; el usuario debe verificar la actualización.

No se borró ni modificó ningún registro real o duplicado previo. No cambió esquema, autenticación, backend ni público del sitio. La propuesta anterior de optimización de fotografías y otras mejoras sigue aislada y no forma parte de esta corrección.
