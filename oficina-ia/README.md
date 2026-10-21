# Oficina IA · piloto local Aeterna

Aplicación estática local para el recorrido de misión Aeterna. No tiene paquetes de ejecución ni dependencias externas.

## Ejecutar

Desde esta carpeta: `npm start` y abre http://localhost:4173. Los datos permanecen en el `localStorage` de ese navegador. Usa “Borrar datos locales” solo desde las herramientas del navegador si quieres reiniciar el fixture.

La primera vista presenta la grilla General más ocho espacios de demostración: LEVIA, Aeterna, Venezuela Agro, Draco, Álvaro Carrero Mentor, ROHO Café, Educación y Finca Escuela. Sólo Aeterna tiene recorrido funcional y fixture sintético; los otros permanecen sin misiones ni actividad. El espacio hermano histórico se conserva sólo en datos legados, fuera del selector. La grilla y navegación funcionan con teclado y se adaptan a móvil.

La escena conceptual de oficina está pendiente de transferencia y no aparece como fondo. La interfaz señala ese estado de forma visible y accesible, sin intentar cargar imágenes o fuentes externas. Los tokens visuales usan crema y verde profundo. La ficha tipográfica de Coordinación es un ejemplo ficticio, no un retrato ni un agente conectado, y separa configuración, prueba y ejecución. El rótulo persistente `DEMO / FICTICIO · SIMULACIÓN LOCAL · sin modelo ni servicios conectados` aparece en la interfaz y en cada artefacto. El chat no simula una respuesta de modelo. Aprobar una versión guarda una decisión ligada al ID exacto de artefacto; no envía ni publica. Editar crea otro ID y vuelve a revisión; la aprobación previa no autoriza ese contenido.

La app reconoce cambios hechos por otra pestaña y conserva el guardado más reciente: muestra el conflicto, permite descargar la copia local de esa pestaña y recargar. Requiere Web Locks; si el navegador no lo ofrece, bloquea la escritura. Un formato roto o no compatible permanece intacto y abre en lectura segura con opción de exportación. Esto evita sobrescritura accidental; `localStorage` sigue siendo almacenamiento de un solo navegador y no constituye seguridad multiusuario.

## Verificar

`npm test` corre los casos C0–C14 en Chromium con Playwright, escribe `evidence/results.json` y conserva capturas reales de grilla, ficha de ejemplo, revisión, móvil y recuperación. El servidor de prueba se inicia y detiene automáticamente. Se requiere Chromium disponible y el módulo Playwright en el entorno. La suite reabre la app en cada checkpoint, prueba la selección de espacios por teclado, rutas de regreso desde Te toca, viewport móvil, edición después de aprobar, conflicto entre pestañas, aislamiento entre misiones y espacios y recuperación de almacenamiento corrupto/incompatible y legado.

Toda la generación del borrador es determinística y local. No uses datos reales, credenciales ni servicios externos en este piloto.
