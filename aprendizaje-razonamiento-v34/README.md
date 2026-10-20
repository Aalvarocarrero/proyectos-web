# Aprendizaje y razonamiento — snapshot portable v34

Copia autónoma para revisión y respaldo del prototipo educativo. La aplicación es estática: no necesita cuentas, servicios externos ni dependencias de ejecución. El progreso de la sesión se queda en el almacenamiento local del navegador.

## Vista local

Desde esta carpeta, inicia un servidor estático:

```sh
python3 -m http.server 4186 --bind 127.0.0.1 --directory dist
```

Abre `http://127.0.0.1:4186/`.

## Pruebas incluidas

Con Node.js 18 o posterior, ejecuta la lógica del piloto:

```sh
node --test tests/number-parts.test.mjs
```

La prueba integrada de navegador requiere Playwright 1.62.1, Chromium instalado como `/usr/bin/chromium` y el servidor estático anterior:

```sh
node tests/number-parts-browser.cjs
```

Las dos capturas incluidas en `docs/evidence-v34/` son capturas reales de Chromium. El JSON de comprobaciones y la prueba de compatibilidad están en la misma carpeta. Las pruebas de software no son una evaluación pedagógica ni pruebas con niñas y niños.

El informe del incremento, sus límites y las fuentes primarias están en `docs/ENTREGA_MATEMATICAS_V34.md` y `docs/FUENTES_MATEMATICAS_V34.md`.
