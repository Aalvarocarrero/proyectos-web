# Aprendizaje y razonamiento — snapshot portable v34

Copia autónoma para revisión y respaldo del prototipo educativo. La aplicación es estática: no necesita cuentas, servicios externos ni dependencias de ejecución. El progreso de la sesión se queda en el almacenamiento local del navegador.

## Vista local

Desde esta carpeta, inicia el servidor:

```sh
npm run serve
```

Abre `http://127.0.0.1:4186/`. También puedes usar Python directamente: `python3 -m http.server 4186 --bind 127.0.0.1 --directory dist`.

## Pruebas incluidas

La lógica requiere Node.js 18 o posterior:

```sh
npm test
```

Para la prueba integrada de navegador, instala las dependencias de desarrollo con Node.js 20 o posterior (`npm ci`). Requiere Chromium instalado como `/usr/bin/chromium` y el servidor anterior activo en otra terminal:

```sh
npm run test:browser
```

La única dependencia npm es Playwright 1.62.1, usada sólo para pruebas. No forma parte de la aplicación. Las dos capturas incluidas en `docs/evidence-v34/` son capturas reales de Chromium. El JSON de comprobaciones y la prueba de compatibilidad están en la misma carpeta. Las pruebas de software no son una evaluación pedagógica ni pruebas con niñas y niños.

El informe del incremento, sus límites y las fuentes primarias están en `docs/ENTREGA_MATEMATICAS_V34.md` y `docs/FUENTES_MATEMATICAS_V34.md`.
