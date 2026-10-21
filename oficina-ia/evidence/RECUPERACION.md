# Persistencia y validez de aprobaciones · revisión 21 octubre 2026

## Antes · build del respaldo `14b59e97b9243afab674a39da2b0d1f87a74f2a8`

La revisión del código de esa build confirmó que las pruebas C0–C5 existentes pasaban, pero la capa de guardado no protegía esos datos frente a conflictos o almacenamiento dañado:

- `save()` serializaba siempre el estado de la pestaña en el mismo `localStorage`, sin revisar si otra pestaña lo había cambiado. Un escritor obsoleto podía borrar del guardado la modificación más nueva.
- `load()` devolvía `null` al fallar `JSON.parse`; la inicialización sustituía ese resultado en memoria por un espacio vacío. La siguiente acción guardada podía reemplazar el contenido original sin advertir el problema.
- El inspector abría el artefacto en modo lectura. No había un flujo para editar después de aprobar y comprobar que esa edición necesitaba una aprobación nueva.
- La versión aprobada sí se guardaba por ID de artefacto, pero no existía una ruta de revisión posterior que pusiera a prueba esa relación.

El código fuente de la build respaldada mostraba esos caminos; la suite de referencia no incluía los casos nuevos de pestañas, daño de almacenamiento ni edición posterior.

## Después · casos ejecutados en Chromium local

Build: SHA-256 `6b2d1dec49d9e58164b1d5f7dc584a600eb2bf2d569ae12f2d9bde4487bab0c0` de `index.html`. El registro con hora, fixture, resultado y detalle de cada caso está en [`results.json`](results.json).

- C0–C5: siguen aprobados. El runner cierra y vuelve a abrir la página en los checkpoints de brief/plan, v1, comentario/v2 y aprobación.
- Edición posterior a aprobación: al editar v2 se crea v3 con ID padre; v1/v2 y la aprobación exacta de v2 permanecen. La revisión indica que v2 no autoriza v3, y v3 sobrevive al cierre y reapertura pendiente de su propia aprobación.
- Dos pestañas, misma misión: una revisión se escribe; la otra detecta base obsoleta, no sobrescribe el ID aceptado, anuncia el conflicto y ofrece descargar su copia local o recargar.
- Dos misiones en Aeterna: sus artefactos y aprobación siguen unidos a sus propios IDs. General y el fixture hermano siguen vacíos.
- Datos corruptos e incompatibles: el texto dañado permanece byte por byte; un esquema futuro queda intacto. Ambos muestran lectura segura y opción de exportar sin sustituir el original. Un formato legado válido migra sólo en guardado explícito y conserva la misión, el artefacto y la aprobación ligada a su ID.
- Consola del navegador: sin excepciones JavaScript. Acciones externas: cero.

Captura de la revisión posterior a editar y antes de aprobar la nueva versión: [`aprobacion-no-heredada.png`](aprobacion-no-heredada.png). Las capturas sólo contienen fixture sintético.

## Límites

La coordinación entre pestañas usa Web Locks del navegador y una comparación de revisión bajo ese lock. Si Web Locks no está disponible, la app bloquea la escritura. El almacenamiento sigue siendo `localStorage` en un navegador: no proporciona seguridad multiusuario, sincronización entre dispositivos, backup automático ni un servicio de recuperación. CI no se ejecutó; toda la verificación indicada aquí es local.
