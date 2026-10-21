# Referencias visuales y límites de arquitectura

Este apunte conserva sólo hallazgos compartidos y verificados por revisión visual muestreada. No afirma haber procesado la narración completa ni haber ejecutado las demostraciones.

## Observaciones disponibles

- **AI OFFICE BUILDER:** se revisaron 10 fotogramas a lo largo de aproximadamente 80,408 segundos. La edición muestra una oficina 3D azul, tarjetas con modelo/rol/memoria, PostgreSQL, una constitución con evidencia y una aprobación CEO antes de acciones irreversibles; menciona R3F y ElevenLabs. Es una explicación editada, no una prueba end-to-end de 25 agentes.
- **Fábrica Viva:** se revisaron 10 fotogramas de aproximadamente 76,787 segundos. Muestra una oficina 3D cálida, departamentos, zoom y avatares; no demuestra una ruta completa de solicitud a herramienta y artefacto final.
- **Claude-Office:** las notas recibidas describen visualización por hooks/WebSocket y sprites 2D. El núcleo MIT exige conservar avisos, y los recursos TheOffice/DunderMifflin no vienen incluidos para reutilización. No se instaló ni copió código o recursos de ese proyecto.

## Decisiones para el piloto

La UI de este piloto es una escena 2D propia en CSS y lo declara. La tarea disponible se inicia por acción humana, ejecuta una transformación determinística del fixture local y registra `runId`, `agentId`, `taskId`, `status`, `timestamp`, `artifactVersion` y `executionMode`. No se conecta PostgreSQL, R3F, WebSocket, ElevenLabs, modelos, APIs ni agentes autónomos. Las decisiones de versión y aprobaciones siguen en manos de la persona y ligadas a un ID exacto; aprobar no publica.

Estos límites distinguen una señal visual de una capacidad probada. Los videos observados no justifican afirmar que otros sistemas ejecutan agentes en tiempo real, ni que el piloto reproduzca su stack. Una futura integración necesita evidencia de alcance y permisos propios; esta nota no habilita dependencias, servicios o uso de recursos de terceros.
