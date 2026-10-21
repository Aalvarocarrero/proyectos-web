# Inicio rápido en Mac

1. Descomprime el paquete en una carpeta del usuario.
2. Abre Terminal y entra en esa carpeta.
3. Ejecuta `python3 app/server.py`.
4. Visita `http://127.0.0.1:8765`.
5. La pantalla **Red de proyectos** muestra primero el mapa radial: un núcleo de partículas se conecta por brazos curvos a cada proyecto guardado. Elige un nodo con clic o teclado; también puedes usar la lista accesible. Dentro verás la conversación vinculada a ese proyecto, su memoria filtrada y cronología.
6. Los mensajes escritos en **Conversación local** se guardan como notas ligadas al proyecto y sobreviven al reinicio. La pantalla indica **Sin modelo conectado**. No hay asistente que responda ni ejecución de tareas. Los controles **Pulsar para hablar** y **Detener** están visibles, pero deshabilitados: no se solicita acceso al micrófono y no hay transcripción disponible. Si se corta el guardado de una nota, el borrador y su ID quedan guardados localmente en este navegador y proyecto.
7. Si vuelves tras un error, la app compara el ID del intento con el almacén local. Si ya existe, muestra el registro y no lo reenvía; si no aparece, **Reintentar** conserva el mismo ID. No reintenta automáticamente. Una tarea nueva recibe otro ID aunque repitas el mismo texto.
8. Pulsa **Importar** para cargar tu exportación JSON validada. Esta distribución no contiene datos. Si hay una configuración diferente, haz respaldo y resuelve el conflicto; también puedes iniciar un almacén vacío con `--data-dir "$HOME/Documents/CerebroDatos"`.
9. Crea un respaldo antes de mover o reemplazar archivos.
10. Detén el servidor con Control-C. El almacén permanece en `~/.cerebro-portable`.

Requiere Python 3.10 o posterior. No instala herramientas ni pide claves.

La interfaz incorpora navegación de teclado, foco visible, controles táctiles amplios, una lista accesible alternativa al gráfico, diseño móvil y respeto a **Reducir movimiento**. Consulta [criterios UX y accesibilidad](DISEÑO-UX.md); el ZIP incluye capturas con proyectos de demostración ficticios.

Abre **Proveedores IA** desde el menú para revisar requisitos y estados. Los tres proveedores siguen Desactivados. El botón de simulación usa únicamente datos sintéticos y un transporte falso; no verifica modelos ni conexión. No introduzcas claves aquí: no hay campos de credenciales. Antes de cualquier uso real de Cloudflare, hace falta confirmar el plan y saldo diario; la aplicación no consulta facturación. No se llamó a proveedores. La voz y la transcripción continúan pendientes. Consulta [estado y límites](PROVEEDORES.md).

La nueva vista **Herramientas y capacidades** muestra qué partes están probadas localmente, preparadas, simuladas, desactivadas o pendientes. Dentro de un proyecto usa **Consulta estructurada de memoria** para filtrar por texto o tipo de registro; la búsqueda se restringe al ID del proyecto seleccionado. No genera respuestas de IA ni envía datos fuera del equipo. Consulta el [inventario y sus límites](CAPACIDADES.md).
