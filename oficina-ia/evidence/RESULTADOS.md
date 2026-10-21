# Ejecución del piloto local Aeterna

- Build probado: SHA-256 de `index.html`, `6b2d1dec49d9e58164b1d5f7dc584a600eb2bf2d569ae12f2d9bde4487bab0c0`.
- Fixture: `AET-DEMO-001`, `CLIENTE-FICTICIO-001`, `PRODUCTO-DEMO-001`, `AUDIENCIA-FICTICIA-001`, `CANAL-SIMULADO`.
- Registro automatizado: [`results.json`](results.json).
- Capturas reales del navegador: [`aeterna-revision-aprobada.png`](aeterna-revision-aprobada.png), [`aprobacion-no-heredada.png`](aprobacion-no-heredada.png), [`fixture-hermano-vacio.png`](fixture-hermano-vacio.png), [`general-vacio.png`](general-vacio.png), [`recuperacion-local.png`](recuperacion-local.png).
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

**Resultado:** C0–C5 y los nuevos casos de recuperación/aprobación y migración legada ejecutados y aprobados para esta build local y estos fixtures. Esto valida el recorrido del prototipo local, no agentes, integraciones, publicación, seguridad multiusuario ni uso con datos reales. El antes/después está en [`RECUPERACION.md`](RECUPERACION.md).
