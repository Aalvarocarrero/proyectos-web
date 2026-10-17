# Respaldo fuente v20 autorizado

El usuario aprobó expresamente respaldar el nuevo inicio guiado en una rama de su GitHub privado y actualizar la misma previsualización privada, sin servicios de pago. El hilo principal verificó la aprobación a esa solicitud concreta el 17 de octubre de 2026. Este respaldo no despliega Sites; su transferencia y despliegue oficial corresponden al hilo principal.

- Repositorio: Aalvarocarrero/proyectos-web.
- Rama: feat/education-welcome-v20-source.
- Carpeta: aprendizaje-razonamiento.
- Commit de implementación: dfd477ec57d0abd71bbe9304878b20c8905f04bb.
- Base v19 corregida: 984b611a6e3d93934450054d9cb7c1b091a5fc4f.
- Manifiesto: DELIVERY-V20-SHA256.json, 29 archivos de aplicación; branch conserva la procedencia local.
- Informe: docs/ENTREGA_V20.md. Capturas e informes: docs/evidence-v20.
- Validación: 142 pruebas de lógica, 72 DOM, 32 estáticas y 1.116 comprobaciones de navegador.

Las referencias del informe a una entrega local corresponden al cierre previo a esta autorización posterior. No se afirma que Sites esté actualizado. Siguen pendientes pruebas con familias, lectores de pantalla y Safari/iPad físico; no se presenta la propuesta UX como validación científica.

Antes del respaldo se comprobaron los archivos modificados: cambios limitados a la carpeta educativa, hashes del manifiesto, ausencia de ZIP, parches de distribución, dependencias instaladas y patrones comunes de secretos. Capturas y registros proceden de pruebas sintéticas, sin datos de usuarios. Esta revisión no audita todo el historial. No se modifica main, seguridad, permisos ni workflows ni se ejecutan Actions. No existen workflows en el árbol de esta rama.

Después del envío se verifica mediante un clon independiente el commit remoto, los 29 hashes del manifiesto y la igualdad byte a byte de todos los archivos modificados respecto a la base, incluidos informes y capturas. El resultado se comunica al hilo principal.
