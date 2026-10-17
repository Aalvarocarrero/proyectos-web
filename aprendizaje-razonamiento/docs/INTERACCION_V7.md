# Estudio de juego · versión 0.6

Piloto original de programación de caminos para 6–8 años. Conserva las propuestas anteriores y la sesión en memoria; recargar cierra la sesión. No recopila datos infantiles, no usa puntuaciones, rachas ni avance automático.

## Decisiones basadas en investigación ya reunida
Fuente de trabajo: [histórico de investigación del proyecto](https://app.notion.com/p/3f930479a73681b08e66f3bdacaef198?pvs=204).
- ScratchJr: construir instrucciones y observar consecuencias → secuencia editable, ejecución de una casilla, siguiente destino y revisión del paso bloqueado.
- Harvard: ayuda ajustada que pueda retirarse → ejemplo opcional independiente, pistas progresivas y acompañamiento breve situado.
- DREME: relación con representaciones concretas → continuación libre con papel, dibujo y conversación.
- NRICH: entrada accesible y distintas soluciones → cualquier ruta válida, navegación libre y explicación por voz, señal o dibujo.
- Synthesis/onebillion: interacción visual y acompañamiento → tablero y programa integrados y retroalimentación por acción. No se trasladan resultados de esos productos a este prototipo.

## Cambios verificables
- Catálogo oculto mientras se juega; botón explícito de ida y vuelta sin reiniciar.
- Ejemplo de dos movimientos independiente del programa del participante.
- Seleccionar, cambiar o quitar un paso; borrar y deshacer un cambio (restaura también posición y ejecución anterior).
- Controles nativos con nombres accesibles, foco conservado y sin arrastre obligatorio.
- Bloqueo selecciona el paso problemático; llegar permite volver a probar o terminar libremente.
- Tablero, flechas y programa en una tarjeta móvil; escritorio en dos columnas.
- Sin cambios de almacenamiento, duración por edad o acceso privado.

## Límites
Pruebas de software no equivalen a validación pedagógica ni conformidad WCAG. Falta pilotaje con familias y evaluación especializada; se mantiene el alcance de un recorrido 6–8, no un currículo completo de 18 meses a 18 años. La sesión continúa al pausar/cambiar de actividad; no persiste tras recarga.
