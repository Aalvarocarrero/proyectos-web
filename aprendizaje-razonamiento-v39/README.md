# Aprendizaje y razonamiento · revisión v41

Misma app estática, con todos los módulos v40 y progreso compatible. v41 hace visibles los seis idiomas y la etapa antes de entrar, conserva la etapa desde las guías y mantiene el foco de los controles. Añade una guía auditiva para adultos con seis idiomas, cuatro rutinas originales por idioma y etapas flexibles del primer año. El inicio permite entrar directamente a esta guía y consultar propuestas presenciales hasta 18+. La actividad existente de fichas tiene otra vista opcional, con profundidad y alternativa frontal, cargada solo a petición.

La carpeta de fuente conserva su nombre histórico `aprendizaje-razonamiento-v39`; la versión del contenido es v41 (package 0.41.0). No es otro proyecto ni un curso completo. El paquete portable se rotula v41. No incluye progreso, datos de familias, credenciales, capturas ni dependencias instaladas.

## Abrir

Desde esta carpeta, con Python 3:

```sh
python3 -m http.server 4186 --bind 127.0.0.1 --directory dist
```

Abre `http://127.0.0.1:4186` en ese equipo. No hay servicios externos de ejecución. El progreso existente depende del navegador y origen: mover archivos a otro origen no traslada sus datos. No se necesita abrir una cuenta infantil.

## Comprobar

Verificado en Linux, Node 24.19, Python 3 y Chromium `/usr/bin/chromium`. Sin dependencias nuevas de ejecución ni SDK. No hay paso de build; lint está configurado para los diez archivos JS afectados de v41: el contenido de `dist` es la fuente ejecutable.

```sh
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts
npm test
npm run lint
npm run test:dom
npm run test:static
BASE_URL=http://127.0.0.1:4186 TEST_EVIDENCE_DIR=/tmp/education-v41 npm run test:discovery-v41
BASE_URL=http://127.0.0.1:4186 TEST_EVIDENCE_DIR=/tmp/education-v40-regression npm run test:experience-v40
BASE_URL=http://127.0.0.1:4186 TEST_EVIDENCE_DIR=/tmp/education-v39-regression npm run test:experience-v39
```

El servidor debe seguir activo durante las pruebas de navegador. Otros sistemas necesitan adaptar la ruta del ejecutable en los scripts. Las capturas de pruebas van a una carpeta temporal y no al respaldo de código.

## Límites

La pantalla del primer año es para el adulto: su presencia, voz y pausas conducen el juego. No se pide mirar, repetir ni completar nada. No hay reproducción automática. Se usan solo voces que el navegador declara locales y del idioma admitido; portugués se rotula Brasil y exige pt-BR; mandarín exige una variante explícita CN/TW. Sin voz compatible se explica la ausencia y se continúa en persona. El control del navegador no certifica la pronunciación ni garantiza la detención física del dispositivo; un fallo de cancelación deja una advertencia y bloquea nuevas solicitudes.

La guía 18+ ofrece una práctica abierta y enlaza honestamente al taller existente rotulado 13–18: todavía no hay itinerario adulto completo. Este navegador compartido no equivale a una cuenta privada. No se añaden perfiles, puntuación infantil, diagnóstico, micrófono, cámara, grabaciones, proveedor de IA ni evaluación de preferencias.

Consulta `docs/EXPERIENCIA_V41.md` para cambios, fuentes, pruebas y bloqueos. La revisión lingüística/pedagógica y las pruebas con familias siguen pendientes. v40 está publicada privadamente en Sites 28. v41 se ha probado localmente y queda preparada para revisión/publicación privada por el padre.
