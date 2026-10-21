# Oficina IA · piloto local Aeterna

Aplicación estática local para el recorrido de misión Aeterna. No tiene paquetes de ejecución ni dependencias externas.

## Ejecutar

Desde esta carpeta: `npm start` y abre http://localhost:4173. Los datos permanecen en el `localStorage` de ese navegador. Usa “Borrar datos locales” solo desde las herramientas del navegador si quieres reiniciar el fixture.

El espacio Aeterna tiene el recorrido funcional. General y Espacio hermano son fixtures aislados vacíos. El rótulo persistente `DEMO / FICTICIO · SIMULACIÓN LOCAL · sin modelo ni servicios conectados` aparece en la interfaz y en cada artefacto. Los roles son plantillas sin conexión; el chat está deshabilitado. Aprobar una versión guarda una decisión ligada al ID exacto de artefacto; no envía ni publica. Editar crea otro ID y vuelve a revisión; la aprobación previa no autoriza ese contenido.

La app reconoce cambios hechos por otra pestaña y conserva el guardado más reciente: muestra el conflicto, permite descargar la copia local de esa pestaña y recargar. Requiere Web Locks; si el navegador no lo ofrece, bloquea la escritura. Un formato roto o no compatible permanece intacto y abre en lectura segura con opción de exportación. Esto evita sobrescritura accidental; `localStorage` sigue siendo almacenamiento de un solo navegador y no constituye seguridad multiusuario.

## Verificar

`npm test` corre los casos C0–C10 en Chromium con Playwright, escribe `evidence/results.json` y conserva capturas reales de los estados probados. El servidor de prueba se inicia y detiene automáticamente. Se requiere Chromium disponible y el módulo Playwright en el entorno. La suite reabre la app en cada checkpoint, prueba una edición después de aprobar, conflicto entre pestañas, aislamiento entre misiones y espacios y recuperación de almacenamiento corrupto/incompatible y legado.

Toda la generación del borrador es determinística y local. No uses datos reales, credenciales ni servicios externos en este piloto.
