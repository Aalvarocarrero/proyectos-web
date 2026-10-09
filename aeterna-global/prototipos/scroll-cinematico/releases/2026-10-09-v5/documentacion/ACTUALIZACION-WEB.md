# Guía de actualización manual

## Alcance

El paquete es un sitio estático de varias páginas. El código editable está en `dist/`: no existe una fase de compilación ni un servidor propio incluido. Las fotografías, los menús y los vídeos de la campaña se sirven como archivos locales del mismo sitio.

## Alojamiento estático convencional

1. Hacer una copia de seguridad recuperable del destino actual.
2. Preparar primero un entorno de revisión o una carpeta de alojamiento independiente.
3. Copiar **el contenido de `dist/`** a la raíz pública del alojamiento elegido.
4. Comprobar que las rutas de carpetas resuelven su `index.html`: `/maternity-gold-coast/`, `/booking-preview/`, `/quote-preview/`, `/campaigns/2026-10-06/` y `/menus/`.
5. Comprobar que el servidor entrega correctamente HTML, JavaScript, CSS, WebP, JPG, SVG, PDF y MP4.
6. Revisar enlaces, visores y descargas mediante HTTP/HTTPS antes de sustituir el sitio vigente.

Los recursos usan rutas absolutas como `/assets/` y `/menus/`. No se garantiza que funcionen al poner todo el sitio bajo una subcarpeta sin adaptar esas rutas. No es necesario añadir una reescritura de aplicación de página única; las páginas tienen archivos propios.

Si el destino actual es WordPress, Wix u otro constructor, esta carpeta no sustituye directamente su tema o estructura. Hará falta una integración específica o un alojamiento estático separado. No se ha realizado esa integración.

## Si se continúa con Sites

La previsualización actual utiliza acceso privado gestionado por Sites. Ese control de acceso no forma parte del JavaScript descargado: al trasladar los archivos a otro alojamiento, el acceso dependerá de la configuración de ese alojamiento.

`configuracion/hosting.preview.reference.json` identifica exclusivamente la previsualización privada. **No copiarlo como configuración del sitio de producción ni asumir que autoriza su publicación.** Para usar Sites se debe elegir el proyecto de destino, crear su configuración propia `.openai/hosting.json` y mantener `static.directory` en `dist`.

La plantilla `configuracion/hosting.static.example.json` describe la salida estática, pero no contiene una identidad de proyecto. Debe completarse mediante la configuración del destino real.

## Funciones deliberadamente inactivas

- Reserva de sesión: el formulario permite revisar pasos, fecha y detalles, pero no envía ni guarda una solicitud.
- Presupuesto: la selección de servicios y el resumen funcionan en el navegador, pero el envío está bloqueado.
- Pagos: no se incluye ni se activa ninguna pasarela.
- Analítica: el archivo original mantiene la función desactivada y su restricción de dominio. No se ha habilitado seguimiento.
- Indexación: se conservan las directivas de previsualización `noindex` y el bloqueo en `robots.txt`.

No retirar las advertencias de demostración ni activar funciones sin preparar y comprobar su servicio real. Los botones de WhatsApp y redes sociales sí conservan los destinos originales de Aeterna; la decisión de enviar un mensaje queda en la plataforma que abra el visitante.

## Comprobación mínima antes del cambio definitivo

- Portada, navegación y pie de página a 320–430 px, tableta y escritorio.
- Fotografías verticales, horizontales y cuadradas completas y centradas.
- Apertura y cierre desde las imágenes y los textos de exploración; retorno a la posición anterior.
- Desplazamiento continuo, capítulos, lectura en detalle y movimiento reducido.
- Los dos PDF de menús y sus precios de muestra.
- Los 22 retratos y las 30 piezas de campaña, incluidos enlaces verticales y vídeos.
- Enlaces de contacto, controles flotantes y navegación por teclado.
- Copia de seguridad y procedimiento de reversión del alojamiento elegido.

Las comprobaciones automatizadas incluidas en esta entrega no sustituyen esta revisión visual del navegador ni la prueba del alojamiento final.

## Licencias antes de publicar comercialmente

La entrega conserva los PDF y las imágenes aprobados, pero no acredita todos los derechos comerciales o de incrustación de sus fuentes originales. En particular, el aviso del autor de Austria limita el uso gratuito y solicita licencia para uso comercial. No se ha aportado aquí un comprobante de esa licencia. También permanecen familias originales cuyo permiso no se ha documentado.

Antes de publicar los menús comercialmente, confirmar que se dispone de las licencias correspondientes o aprobar una sustitución permitida. No se han comprado licencias ni modificado de nuevo las fuentes aprobadas. Las fuentes comerciales no se entregan como archivos instalables. Ver `licencias/LEEME-FUENTES.md`.
