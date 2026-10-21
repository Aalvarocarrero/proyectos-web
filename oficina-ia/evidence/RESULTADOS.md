# Ejecución del piloto local Aeterna

- Build probado: SHA-256 de `index.html`, `aec9a0d829d746bef26d70c56013278cc3f4a468647cc37f978f80b5710d2036`.
- Fixture: `AET-DEMO-001`, `CLIENTE-FICTICIO-001`, `PRODUCTO-DEMO-001`, `AUDIENCIA-FICTICIA-001`, `CANAL-SIMULADO`.
- Registro automatizado: [`results.json`](results.json).
- Capturas reales del navegador: [`espacios-grid.png`](espacios-grid.png), [`plantilla-agente.png`](plantilla-agente.png), [`te-toca-mobile.png`](te-toca-mobile.png), [`fixture-levia-vacio.png`](fixture-levia-vacio.png), [`general-vacio.png`](general-vacio.png), [`aeterna-revision-aprobada.png`](aeterna-revision-aprobada.png), [`aprobacion-no-heredada.png`](aprobacion-no-heredada.png), [`recuperacion-local.png`](recuperacion-local.png).
- Fecha UTC: registrada en `results.json`.
- Runtime: Chromium headless mediante Playwright; sin excepciones JavaScript.
- Ejecución: pruebas locales end-to-end; CI no ejecutada.
- Acciones externas: ninguna. Servicios/modelos conectados: ninguno. Gasto: ninguno. Publicación/envío: ninguno.

| Caso | Resultado | Evidencia resumida |
| --- | --- | --- |
| C0 | Aprobado | Brief y plan guardados; v1, comentario, v2 y aprobación recuperados tras recargas; relaciones por ID; cero acciones externas. |
| C1 | Aprobado | Objetivo vacío clasificado explícitamente como bloqueante y plazo vacío como opcional; ambos permanecen sin valor inventado. |
| C2 | Aprobado | Instrucción hostil de contenido queda como dato; no altera espacio ni inicia publicación. |
| C3 | Aprobado | v1 preservada; comentario ligado a v1; aprobación ligada al ID de v2; no publica. |
| C4 | Aprobado | El marcador Aeterna y el fixture no se muestran en Espacio hermano ni General; ambos aparecen limpios. |
| C5 | Aprobado | Recarga persiste el resultado incierto; el botón de reintento queda bloqueado hasta revisión; recuperación conserva el ID de misión y no duplica. |
| Recuperación de etapas | Aprobado | Cierre y reapertura en brief/plan, v1, comentario/v2 y aprobación exacta. |
| Aprobación tras edición | Aprobado | Editar v2 crea v3 con otro ID; v2 sigue aprobada históricamente y v3 requiere aprobación independiente, incluso tras reabrir. |
| Dos pestañas, misma misión | Aprobado | La pestaña obsoleta recibe conflicto, no sobreescribe el artefacto de la pestaña que guardó primero y ofrece exportar/recargar. |
| Misiones distintas | Aprobado | Artefactos y aprobación permanecen asociados a su propia misión Aeterna. |
| Almacenamiento corrupto/incompatible | Aprobado | El contenido original queda intacto, la escritura se bloquea y se ofrece exportación local. |
| Formato legado válido | Aprobado | Carga sin reescritura automática y migra sólo en un guardado explícito, conservando misión/artefacto/relaciones. |
| C11 · grilla y navegación por teclado | Aprobado | Nueve tarjetas accesibles; General vacío; selección por Enter; cambio de espacio con regreso a Oficina; otros espacios sin contenido de Aeterna. |
| C12 · Te toca y regreso a decisión | Aprobado | La bandeja abre la misión seleccionada y devuelve a la revisión de la versión exacta. |
| C13 · Te toca móvil | Aprobado | Viewport de 390 px, acción accesible y sin desbordamiento horizontal. |
| C14 · plantilla de agente | Aprobado | Configuración, prueba y ejecución se muestran como estados distintos; plantilla ficticia sin conexión. |
| C14 · selección contextual | Aprobado | Tres puestos de plantilla; teclado y selección actualizan la ficha contextual local sin simular ejecución. |
| C15 · resumen de Te toca | Aprobado | Empresa, entrega, marcador sin imagen, versión y CTA quedan visibles; inspector lateral se oculta mientras la bandeja está activa. |
| C16 · detalles plegables | Aprobado | Brief completo permanece en un `details` nativo y se expande por teclado; las demás secciones conservan pasos, versión, procedencia, comentarios y eventos. |
| C17 · escena y tarea local | Aprobado | Puestos se seleccionan con teclado; acción manual produce v1 determinística con eventos y artefacto unidos por runId/taskId/agentId, status/timestamp/artifactVersion. Sin servicio externo. |
| C18 · recuperar interrupción | Aprobado | Un checkpoint working reabre como Por verificar, guarda evento con runId y requiere inspección antes de retry. |

**C17 · escena interactiva 2D y ejecución local:** aprobado. Tres puestos seleccionables por teclado y panel ligado a misión; acción explícita produce v1 con eventos de inicio/fin y artefacto asociados por `run_id`, modo `deterministic_local`, sin servicios externos.

**C18 · recuperación de paso interrumpido:** aprobado. Sembrando el checkpoint sintético `working`, reabrir cambia a Por verificar, registra el mismo ID de ejecución e impide retry hasta revisión.

**Resultado:** C0–C5, C6–C18 y los casos de recuperación/aprobación y migración legada ejecutados y aprobados para esta build local y estos fixtures. La escena 2D es propia y funcional, pero no es 3D ni replica las referencias. La imagen conceptual sigue pendiente de transferencia y la fidelidad frente a referencias no está verificada. Esto valida la preparación funcional local, no agentes, integraciones, publicación, seguridad multiusuario ni uso con datos reales. La dirección pendiente está en [`DIRECCION_VISUAL.md`](DIRECCION_VISUAL.md) y el bloqueo de transporte en [`REFERENCIAS_VISUALES_BLOQUEO.md`](REFERENCIAS_VISUALES_BLOQUEO.md); recuperación y aprobación en [`RECUPERACION.md`](RECUPERACION.md).
