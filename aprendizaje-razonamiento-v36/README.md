# Aprendizaje y razonamiento — snapshot portable v36

Este directorio contiene el snapshot estático completo de la aplicación educativa y las pruebas pertinentes al flujo «Comparar dos planes». Se conserva aislado del resto del repositorio.

## Ejecutar

Requiere Node.js 20 o posterior y Python 3. Desde este directorio:

```sh
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci
npm test
npm run test:dom
npm run test:static
python3 -m http.server 4194 --bind 127.0.0.1 --directory dist
```

En otra terminal, con el servidor activo:

```sh
npm run test:browser
```

La prueba usa Chromium instalado en `/usr/bin/chromium` y verifica 320, 390 y 1024 px. La revisión estática escribe un resumen ignorado en `docs/static-a11y-report.json`; las capturas y resultados de navegador van a `docs/evidence-v36/`, también ignorado por Git. El código de navegador puede usar `BASE_URL` para otra dirección local.

El flujo conserva A y permite construir B con el mismo presupuesto de ocho fichas; solo muestra comparación cuando ambos planes cumplen las reglas del juego. No registra explicaciones. Los precios son ficticios. Este prototipo no se ha validado con estudiantes, cuidadores ni docentes. El módulo de Matemáticas está fuera de este snapshot incremental.
