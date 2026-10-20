# Aprendizaje y razonamiento — paquete portable v37

Snapshot local de la app estática completa en su estado v37, con la suite completa de lógica y las pruebas DOM, estáticas y de navegador para comparación de planes y entrada visual por edad. Las ilustraciones son SVG propio y no necesitan recursos de red. Progreso y preferencias siguen en el almacenamiento local existente.

## Ejecución

Requiere Node.js 20+, Python 3, Chromium en `/usr/bin/chromium` para las pruebas de navegador y conexión para instalar las dependencias fijadas.

```sh
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci
npm test
npm run test:dom
npm run test:static
npm run serve
```

En otra terminal:

```sh
BASE_URL=http://127.0.0.1:4200 npm run test:visual-v37
BASE_URL=http://127.0.0.1:4200 npm run test:browser
```

La prueba visual genera PNG en una carpeta temporal local (o en `V37_EVIDENCE_DIR` si se configura). No los añade al paquete ni al repositorio. El resto de pruebas de navegador heredadas siguen disponibles en `package.json`.

## Cambios v37

La selección muestra seis franjas orientativas con ilustraciones vectoriales distintas. La entrada inicial muestra una propuesta principal por etapa y mantiene el resto en una sección desplegable. La ruta de 18–23 meses explica primero a la persona adulta cómo preparar una actividad presencial, acompañada, breve y opcional; el pequeño no tiene que leer, contar ni completar pasos en pantalla. El recorrido para 3–5 conserva las actividades existentes y una guía de apoyo accesible.

No se modificaron las reglas de las actividades ni la estructura del progreso. El diseño no se ha validado con niños, cuidadores o docentes; los rangos de edad son orientativos. Las pruebas de navegador usan Chromium de escritorio con tacto y movimiento reducido simulado; no certifican Safari, hardware táctil real, lector de pantalla ni conformidad WCAG completa.
