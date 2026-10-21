# Aprendizaje y razonamiento — paquete portable v38

Snapshot estático completo v38 desde el respaldo privado v37. Reduce un paso en la entrada por edad, conserva el selector de acompañamiento para edades mayores, oculta el avatar en las guías sin pantalla para menores y presenta ayuda textual opcional con un solo botón principal. Se conservan las rutas, el guardado local y la preferencia de avatar existente.

## Ejecución

Requiere Node.js 20+, Python 3 y Chromium en `/usr/bin/chromium` para pruebas de navegador.

```sh
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci
npm test
npm run test:dom
npm run test:static
npm run serve
```

En otra terminal usa el puerto que muestra el servidor y configúralo como `BASE_URL`. Las pruebas de navegador pueden guardar capturas de prueba fuera del repositorio por medio de `TEST_EVIDENCE_DIR` o `V38_EVIDENCE_DIR`.

```sh
BASE_URL=http://127.0.0.1:4186 npm run test:welcome
BASE_URL=http://127.0.0.1:4186 npm run test:welcome-fixes
BASE_URL=http://127.0.0.1:4186 npm run test:visual-v37
BASE_URL=http://127.0.0.1:4186 npm run test:usability-v38
```

Las pruebas son automatizadas. No se ha realizado validación con niños o cuidadores y Chromium no certifica Safari, hardware táctil, lector de pantalla ni conformidad WCAG.
