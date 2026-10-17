# Respaldo fuente v21 autorizado

El usuario aprobó expresamente respaldar los controles de voz local para las 18 palabras en una nueva rama de su GitHub privado y actualizar la misma previsualización privada, sin servicios de pago. El hilo principal verificó la aprobación a esa solicitud concreta el 17 de octubre de 2026. Este respaldo no despliega Sites; la transferencia y publicación oficial corresponden al hilo principal.

- Repositorio: Aalvarocarrero/proyectos-web.
- Rama: feat/education-local-speech-v21-source.
- Carpeta: aprendizaje-razonamiento.
- Commit de implementación: 3005a4748f88ef18aba1c48a1b566a5e852d83de.
- Base v20 corregida: a0abaa966d13e9a7fa5ad9450c687f1f2b77cee6.
- Manifiesto: DELIVERY-V21-SHA256.json, 31 archivos de aplicación; branch conserva la procedencia local.
- Informe y fuentes: docs/ENTREGA_V21.md. Evidencias: docs/evidence-v21.
- Validación: 152 pruebas de lógica, 75 DOM, 32 estáticas y 878 comprobaciones de navegador.

**El audio real todavía no se ha escuchado.** Chromium nativo en nube devolvió cero voces. La reproducción se comprobó mediante simulaciones explícitas de la API; no es una validación acústica ni fonética. Sigue pendiente escuchar las voces en dispositivos reales y revisar pronunciación, variantes y tonos, además de probar Safari/iOS. La selección local depende de lo que declara el navegador.

Las referencias del informe a una entrega exclusivamente local describen el cierre previo a esta autorización posterior. No se afirma que Sites esté actualizado.

Se revisaron los archivos modificados: cambios limitados a la carpeta educativa, hashes del manifiesto, ausencia de ZIP, parches de distribución, dependencias instaladas y patrones comunes de secretos. Capturas y registros proceden de pruebas sintéticas, sin datos de usuarios. Esta revisión no audita todo el historial. No se modifica main, seguridad, permisos ni workflows ni se ejecutan Actions. No existen workflows en el árbol de esta rama.

Después del envío se verifica con un clon independiente el commit remoto, los 31 hashes y la igualdad byte a byte de todos los archivos modificados respecto a la base, incluidos informes y capturas. El resultado se comunica al hilo principal.
