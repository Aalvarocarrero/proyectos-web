# Aprendizaje y razonamiento · revisión v39

Copia completa de la app estática para revisión local. Incluye todos los módulos anteriores, progreso compatible, inicio y biblioteca separados, rutas por edades, escenas vectoriales propias, ayuda opcional y navegación Atrás/Adelante. No es una publicación de Sites.

## Abrir la app

Desde esta carpeta, con Python 3:

```sh
python3 -m http.server 4186 --bind 127.0.0.1 --directory dist
```

Abre `http://127.0.0.1:4186` en el mismo equipo. El servidor no requiere cuentas ni servicios externos. La app conserva progreso en ese navegador y origen; el ZIP no contiene progreso de usuarios.

## Comprobar el código

Las pruebas se verificaron en Linux con Node 24.19, Python 3 y Chromium instalado en `/usr/bin/chromium`. Las dependencias de desarrollo están fijadas; no hay dependencias de ejecución de la app.

```sh
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts
npm test
npm run test:dom
npm run test:static
BASE_URL=http://127.0.0.1:4186 TEST_EVIDENCE_DIR=/tmp/education-v39 npm run test:experience-v39
```

El servidor anterior debe seguir activo para las pruebas de navegador. En otros sistemas hay que proporcionar la ruta del ejecutable Chromium que usan los scripts. Las capturas de prueba van a una carpeta temporal, no forman parte del código publicado.

Consulta `docs/EXPERIENCIA_V39.md` para alcance y límites. La revisión humana con niños y cuidadores sigue pendiente. No se ha desplegado v39.
