# Respaldo fuente v22 autorizado

El hilo principal verificó el 17 de octubre de 2026 la aprobación del usuario para guardar el nuevo inicio en una rama nueva de su GitHub privado y actualizar la misma previsualización privada, sin servicios de pago. Esta operación respalda exclusivamente la fuente; el despliegue oficial Sites queda a cargo del hilo principal.

- Repositorio: Aalvarocarrero/proyectos-web.
- Rama nueva: feat/education-dashboard-v22-source.
- Commit de implementación aprobado: c5b1bfe57e28533df4409c993dc01f4c25f162b2.
- Base exacta v21 corregida: d4933c5fae7955cb64adc917f553f2696670a529.
- Aplicación: aprendizaje-razonamiento.
- Manifiesto: DELIVERY-V22-SHA256.json, 32 archivos. Conserva la referencia a la rama local de procedencia.
- Informe: docs/ENTREGA_V22.md. Capturas, resultados y logs: docs/evidence-v22.
- Validación: 155 pruebas de lógica, 79 DOM, 32 estáticas y 1.068 comprobaciones de navegador.

Las referencias a una entrega exclusivamente local en el informe describen el cierre anterior a esta autorización. No se afirma que Sites esté actualizado.

Se revisaron los 36 archivos de la implementación modificados frente a la base: alcance limitado a la carpeta educativa, hashes válidos, sin ZIP, dependencias instaladas ni patrones comunes de secretos. Las capturas y registros contienen pruebas sintéticas, no datos de usuarios. Esta revisión no audita todo el historial del repositorio. El único cambio posterior a la implementación es este documento de respaldo.

No se cambia main, workflows, permisos, seguridad o servicios. No existen workflows en este árbol y no se ejecutan Actions. Después del envío se verifican mediante un clon independiente el commit remoto, el SHA del árbol raíz, los 32 hashes y la igualdad byte a byte de todos los archivos cambiados frente a la base, incluidos documentos y capturas.

Limitaciones conservadas: falta probar lectores de pantalla reales, Safari/iPad físico y escuchar voces locales. Chromium nativo no ofreció voces; las pruebas de reproducción emplearon dobles explícitos de la API.
