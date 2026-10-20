# Ejecución del piloto local Aeterna

- Build probado: SHA-256 de `index.html`, `88c88c2fe440c2c19f80a2b70977c8e52321f8822a58c8f663dadaf487f336e2`.
- Fixture: `AET-DEMO-001`, `CLIENTE-FICTICIO-001`, `PRODUCTO-DEMO-001`, `AUDIENCIA-FICTICIA-001`, `CANAL-SIMULADO`.
- Registro automatizado: [`results.json`](results.json).
- Capturas reales del navegador: [`aeterna-revision-aprobada.png`](aeterna-revision-aprobada.png), [`fixture-hermano-vacio.png`](fixture-hermano-vacio.png), [`general-vacio.png`](general-vacio.png), [`recuperacion-local.png`](recuperacion-local.png).
- Fecha UTC: registrada en `results.json`.
- Runtime: Chromium headless mediante Playwright; sin excepciones JavaScript.
- Acciones externas: ninguna. Servicios/modelos conectados: ninguno. Gasto: ninguno. Publicación/envío: ninguno.

| Caso | Resultado | Evidencia resumida |
| --- | --- | --- |
| C0 | Aprobado | Brief y plan guardados; v1, comentario, v2 y aprobación recuperados tras recargas; relaciones por ID; cero acciones externas. |
| C1 | Aprobado | Objetivo vacío clasificado explícitamente como bloqueante y plazo vacío como opcional; ambos permanecen sin valor inventado. |
| C2 | Aprobado | Instrucción hostil de contenido queda como dato; no altera espacio ni inicia publicación. |
| C3 | Aprobado | v1 preservada; comentario ligado a v1; aprobación ligada al ID de v2; no publica. |
| C4 | Aprobado | El marcador Aeterna y el fixture no se muestran en Espacio hermano ni General; ambos aparecen limpios. |
| C5 | Aprobado | Recarga persiste el resultado incierto; el botón de reintento queda bloqueado hasta revisión; recuperación conserva el ID de misión y no duplica. |

**Resultado:** todos los criterios C0–C5 ejecutados y aprobados para esta build local y este fixture. Esto valida el recorrido del prototipo local, no agentes, integraciones, publicación, seguridad multiusuario ni uso con datos reales.
