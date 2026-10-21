# Inicio rápido en Mac

1. Descomprime el paquete en una carpeta del usuario.
2. Abre Terminal y entra en esa carpeta.
3. Ejecuta `python3 app/server.py`.
4. Visita `http://127.0.0.1:8765`.
5. Abre **Interfaz Jarvis** o visita `http://127.0.0.1:8765/jarvis/`. En el ZIP portable los archivos de interfaz ya están compilados; en una clonación que no tenga `jarvis-ui-preview/dist`, compílalos una vez con Node.js 22.19 o posterior (`cd jarvis-ui-preview && npm install && npm run build`) y luego inicia de nuevo el servidor Python.
6. La pantalla principal **Red de proyectos** y Jarvis muestran proyectos del almacén. En Jarvis el mapa y la lista seleccionan por ID; la memoria se solicita para el proyecto activo y la búsqueda se limita a ese ID.
7. Escribir una nota en la conversación Jarvis es una acción local explícita. Sobrevive al reinicio. Si se pierde el acuse, la app conserva el ID en el navegador, verifica si ya está en el almacén y solo permite reintento manual si no aparece. Dos notas nuevas con el mismo texto reciben IDs distintos.
8. La pantalla indica **Sin modelo conectado**. No hay respuesta de IA ni ejecución de tareas en Jarvis. **Leer selección** (en la conversación local principal) solo lee texto seleccionado con voces que el navegador reporte `localService=true`; esa marca no equivale a una auditoría independiente del tráfico. Los controles **Pulsar para hablar** siguen deshabilitados: no se solicita micrófono ni hay transcripción.
9. Pulsa **Importar** para cargar tu exportación JSON validada. Esta distribución no contiene datos. Si hay una configuración diferente, haz respaldo y resuelve el conflicto; también puedes iniciar un almacén vacío con `--data-dir "$HOME/Documents/CerebroDatos"`.
10. Crea un respaldo antes de mover o reemplazar archivos.
11. Detén el servidor con Control-C. El almacén permanece en `~/.cerebro-portable`.

Requiere Python 3.10 o posterior. No instala herramientas ni pide claves.

La interfaz incorpora navegación de teclado, foco visible, controles táctiles amplios, una lista accesible alternativa al gráfico, diseño móvil y respeto a **Reducir movimiento**. Consulta [criterios UX y accesibilidad](DISEÑO-UX.md); el ZIP incluye capturas con proyectos de demostración ficticios.

Abre **Proveedores IA** desde el menú para revisar requisitos y estados. Los tres proveedores siguen Desactivados. El botón de simulación usa únicamente datos sintéticos y un transporte falso; no verifica modelos ni conexión. No introduzcas claves aquí: no hay campos de credenciales. Antes de cualquier uso real de Cloudflare, hace falta confirmar el plan y saldo diario; la aplicación no consulta facturación. No se llamó a proveedores. La voz bidireccional y la transcripción continúan pendientes; la lectura de selección está limitada a voces `localService=true` y no tiene audio real verificado. Consulta [estado y límites](PROVEEDORES.md).

La nueva vista **Herramientas y capacidades** muestra qué partes están probadas localmente, preparadas, simuladas, desactivadas o pendientes. Dentro de un proyecto usa **Consulta estructurada de memoria** para filtrar por texto o tipo de registro; la búsqueda se restringe al ID del proyecto seleccionado. No genera respuestas de IA ni envía datos fuera del equipo. Consulta el [inventario y sus límites](CAPACIDADES.md).
