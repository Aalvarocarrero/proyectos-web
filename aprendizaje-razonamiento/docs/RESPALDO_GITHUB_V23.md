# Respaldo fuente v23 autorizado

El hilo principal verificó el 17 de octubre de 2026 la aprobación del usuario para respaldar los talleres de patrones y lenguaje en una rama nueva de su GitHub privado y actualizar la misma previsualización privada, sin servicios de pago. Esta operación respalda exclusivamente la fuente. La publicación oficial Sites corresponde al hilo principal.

- Repositorio: Aalvarocarrero/proyectos-web.
- Rama nueva: feat/education-depth-v23-source.
- Implementación aprobada: e7bf4c0eedcfef0f5f3a81c6854d74babefc8441.
- Base publicada corregida: 8d4da886c73b4aa483cdf37a1d39cfd8fe7c4755.
- Carpeta: aprendizaje-razonamiento.
- Manifiesto: DELIVERY-V23-SHA256.json, 33 archivos; conserva la rama local de procedencia.
- Informe: docs/ENTREGA_V23.md. Matriz: docs/REVISION_AREAS_V23.md. Evidencias: docs/evidence-v23.
- Validación: 158 pruebas de lógica, 82 DOM, 32 estáticas y 777 comprobaciones de navegador.

Tras una notificación de desconexión se comprobó mediante lectura que la rama, el commit, los 33 hashes y 52 archivos de fuente, manifiesto, informes y evidencias seguían idénticos a la implementación original. No se reconstruyó ni sustituyó la entrega. Antes del respaldo se verificaron de nuevo los hashes y el árbol limpio.

Se revisaron los 38 archivos modificados frente a la base: alcance limitado a la aplicación educativa, sin ZIP, dependencias instaladas ni patrones comunes de secretos. Capturas y registros proceden de pruebas sintéticas, no datos de usuarios. Esta revisión no audita todo el historial del repositorio. El único cambio posterior a la implementación es este documento de respaldo.

No se modifica main, workflows, permisos, seguridad o servicios. No hay workflows en este árbol ni se ejecutan Actions. El respaldo se verifica mediante un clon independiente: commit remoto, SHA del árbol raíz, 33 hashes e igualdad byte a byte de todos los archivos cambiados frente a la base.

Las referencias a una entrega local en el informe describen el cierre anterior a la autorización. No se afirma que Sites esté actualizado. Persisten los límites de revisión con familias, lectores de pantalla reales, Safari/iPad y escucha de voces. Una app v22 antigua no entiende el nuevo campo de construcción: conserva el registro sin sobrescribirlo, pero no permite leer ese progreso v23.
