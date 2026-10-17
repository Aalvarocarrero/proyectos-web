# Respaldo fuente v19 autorizado

El usuario aprobó expresamente respaldar v19 en una nueva rama de su GitHub privado y actualizar la misma previsualización privada, sin servicios de pago. El hilo principal verificó la aprobación a esa solicitud concreta el 17 de octubre de 2026. Este respaldo no publica Sites; su transferencia y despliegue oficial corresponden al hilo principal.

- Repositorio: Aalvarocarrero/proyectos-web.
- Rama: feat/education-guidance-v19-source.
- Carpeta: aprendizaje-razonamiento.
- Commit de implementación: b4e44bf01702ce7565e651ea673bea0bc4125f94.
- Base v18 exacta: 8d30a3d7e70afe4f009eb70aad4b93599ab8d2b7.
- Manifiesto: DELIVERY-V19-SHA256.json, 28 archivos de aplicación; branch conserva su procedencia local.
- Informe: docs/ENTREGA_V19.md. Capturas e informes: docs/evidence-v19.
- Validación de la implementación: 139 pruebas de lógica, 63 DOM, 32 estáticas y 901 comprobaciones de navegador.

Las referencias del informe a una entrega exclusivamente local describen el cierre previo a esta autorización posterior. No se afirma que la previsualización Sites esté actualizada.

Antes del respaldo se comprobaron todos los archivos modificados: cambios limitados a la carpeta educativa, hashes del manifiesto, ausencia de ZIP, parches, dependencias instaladas y patrones comunes de secretos. Los registros y capturas proceden de pruebas sintéticas de la aplicación. Esta revisión no es una auditoría del historial completo. No se modifica main, workflows, seguridad ni permisos ni se ejecutan Actions. No existen workflows en el árbol de esta rama.

Tras el envío se verificará con un clon independiente la referencia remota, los 28 hashes del manifiesto y la igualdad byte a byte de todos los archivos modificados respecto a la base v18, incluyendo este informe y las capturas. El resultado y commit remoto se comunicarán al hilo principal.
