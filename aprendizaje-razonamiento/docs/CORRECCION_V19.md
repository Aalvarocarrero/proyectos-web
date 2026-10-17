# Corrección prepublicación v19

Base exacta: `34ea98b37cb805bacf833d6354ef6ffb6757b49b`. Corrección limitada a fallos de la actualización autorizada, en la misma rama `feat/education-guidance-v19-source`.

## Fallos resueltos

1. Al cambiar de mensaje, el tablero mostraba la ejecución anterior como si correspondiera a la selección nueva. Ahora el cambio archiva una copia de la ejecución real, pone el cursor en A1 y anuncia «Borrador en A1» / «todavía sin ejecutar». La ejecución actual y la anterior incluyen el texto del mensaje correspondiente.
2. «Volver a A1» podía reemplazar la comparación por un recorrido vacío. Ahora los borradores nunca sustituyen una ejecución archivada. Ejecutar A → seleccionar B → volver a A1 → ejecutar B conserva y compara A/B. La pausa y reanudación también conservan esa distinción.
3. Escape se escuchaba solo dentro del personaje. Ahora se escucha en el desplegable completo, incluido summary, y devuelve el foco al lanzador. Tab usa el orden nativo.
4. «Volver a la actividad» quedaba visible sin acción al salir del juego. Se refresca el acompañante al trasladarlo a su ubicación general; la acción está oculta en introducción, pausa y cierre, y vuelve a estar disponible durante la actividad.
5. Rótulo de cabecera actualizado a «Previsualización educativa».

## Pruebas

- Lógica: 139 aprobadas. DOM: 65 aprobadas, incluidas 2 nuevas de Escape/foco y visibilidad del retorno. Estáticas: 32 aprobadas.
- Navegador general: 227 comprobaciones. Ayuda/rutas: 59 comprobaciones. Narrativa/acompañante: 118 comprobaciones. Sin errores JavaScript en estas suites.
- Secuencia de regresión en ambas direcciones (reverse/clear y clear/reverse), selección pendiente sin falsa llegada, cursor A1, reset conservando comparación, pausa/reanudación, Escape desde summary, Tab y retorno oculto en pausa.
- Capturas e informes actualizados en `docs/evidence-v19`. Los informes de entrega previos registran el estado anterior a esta corrección; los registros `fix-*` y `guidance-browser.json` documentan este cierre.

No cambia el codec, almacenamiento persistente, seguridad, permisos, contenidos pedagógicos ni funciones disponibles. La ejecución continúa siendo temporal. Sin despliegue de Sites: v18 sigue publicada hasta la decisión del hilo principal. Sin bloqueos técnicos; se respalda la corrección bajo la autorización específica ya verificada.
