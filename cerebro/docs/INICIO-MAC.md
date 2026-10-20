# Inicio rápido en Mac

1. Descomprime el paquete en una carpeta del usuario.
2. Abre Terminal y entra en esa carpeta.
3. Ejecuta `python3 app/server.py`.
4. Visita `http://127.0.0.1:8765`.
5. La pantalla **Red de proyectos** muestra solo los proyectos guardados en este almacén. Elige un nodo con clic o teclado; también puedes usar la lista accesible. Dentro verás la memoria filtrada a ese proyecto y su cronología.
6. Los mensajes escritos en **Conversación local** se guardan ligados al proyecto y sobreviven al reinicio. No hay asistente que responda, ejecución de tareas, captura de voz ni transcripción. Si se corta el envío, el borrador y su ID quedan guardados localmente en este navegador y proyecto.
7. Si vuelves tras un error, la app compara el ID del intento con el almacén local. Si ya existe, muestra el registro y no lo reenvía; si no aparece, **Reintentar** conserva el mismo ID. No reintenta automáticamente. Una tarea nueva recibe otro ID aunque repitas el mismo texto.
8. Pulsa **Importar** para cargar tu exportación JSON validada. Esta distribución no contiene datos. Si hay una configuración diferente, haz respaldo y resuelve el conflicto; también puedes iniciar un almacén vacío con `--data-dir "$HOME/Documents/CerebroDatos"`.
9. Crea un respaldo antes de mover o reemplazar archivos.
10. Detén el servidor con Control-C. El almacén permanece en `~/.cerebro-portable`.

Requiere Python 3.10 o posterior. No instala herramientas ni pide claves.
