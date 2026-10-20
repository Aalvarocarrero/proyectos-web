# Revisión técnica

- Se validan Host, Origin y `Sec-Fetch-Site` antes de aceptar peticiones; las escrituras requieren token local y JSON. El proceso escucha exclusivamente en loopback.
- Los eventos y evidencias se validan antes de persistir. Una referencia de transcripción debe existir; las entradas importadas se tratan como datos y nunca se ejecutan.
- Si `fsync` falla, se congela la escritura hasta reiniciar y reconciliar el resultado. Al reiniciar se recupera una transacción completa; un sufijo incompleto se aparta para revisión. Los respaldos también se sincronizan.
- El outbox conserva IDs con prefijo por flujo. Los conflictos importados se rechazan antes de sobrescribir datos.
- La cola registra intención inmutable antes del inicio, estados con resultado incierto, checkpoints, evidencia y dependencias. Tras reiniciar, recomienda la primera tarea pendiente con dependencias completadas; tareas inciertas no se reintentan y registros antiguos sin dependencias quedan apartados para revisión manual.
- La suite tiene 30 pruebas aprobadas para recuperación, reinicio, deduplicación, inmutabilidad, atomicidad, conflictos, incertidumbre, migración de cola antigua, origen/host, traversal y entrada que parece código. Playwright/Chromium verificó la interfaz, recuperación de tarea independiente, XSS, búsqueda, transcripciones, exportación, respaldo, reinicio real y vista móvil. La captura incluida utiliza datos ficticios.

El intercambio entre almacenes es manual y local. No hay hosting, sincronización Internet, runner de acciones ni captura automática de voz. El almacén tiene un límite exportable de 8 MiB. Los respaldos están bajo permisos del usuario del sistema, sin cifrado propio; la durabilidad física también depende del sistema de archivos y dispositivo.
