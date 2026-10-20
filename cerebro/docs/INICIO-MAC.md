# Inicio rápido en Mac

1. Descomprime el paquete en una carpeta del usuario.
2. Abre Terminal y entra en esa carpeta.
3. Ejecuta `python3 app/server.py`.
4. Visita `http://127.0.0.1:8765`.
5. Pulsa **Importar** para cargar tu exportación JSON validada. Esta distribución no contiene datos. Si hay una configuración diferente, haz respaldo y resuelve el conflicto; también puedes iniciar un almacén vacío con `--data-dir "$HOME/Documents/CerebroDatos"`.
6. Crea un respaldo antes de mover o reemplazar archivos.
7. Detén el servidor con Control-C. El almacén permanece en `~/.cerebro-portable`.

Requiere Python 3.10 o posterior. No instala herramientas ni pide claves.
