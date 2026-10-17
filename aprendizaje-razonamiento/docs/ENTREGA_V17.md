# Entrega local v17 · 17 de octubre de 2026

Base fuente exacta `21bf6cc800ff6d09e03f4ea526018a8dd31a54ac`. Rama LOCAL `feat/education-science-v17-local`. No se ha subido una rama, publicado Sites, ejecutado Actions ni modificado permisos. La aplicación v16 publicada sigue intacta. No se empleó main antiguo.

## Correcciones prioritarias

**Dani ya progresa:** cuatro momentos, tres caminos (pausa, compañía o nueva base), dos decisiones específicas por camino y dos maneras de cerrar: doce combinaciones de final. Cada elección cambia la escena o su consecuencia. Se puede volver, explorar otro camino, pasar o terminar. No se evalúan emociones, personalidad ni moralidad. No se promete mantener la atención ni se compara atención infantil/adulta. Las decisiones se descartan al pausar, salir o recargar, con aviso; los tests comprueban que no entran en almacenamiento.

**Avatar accesible dentro de la partida:** v16 no dibujaba figura antes de crear una apariencia; además ocultaba el bloque en modo concentrado. Se reprodujeron esas condiciones de código, no el dispositivo particular del usuario. v17 presenta una muestra neutral sin guardarla automáticamente. Respeta la preferencia explícita de ocultar y mantiene el control para mostrar/personalizar. El mismo panel se integra como sección desplegable compacta en la actividad, con miniatura y pistas. Jardín y Palabra escondida permanecen en su vista concentrada mientras se usa. No tapa controles, no resetea progreso y no es chat generativo.

## Nuevos pilotos de Ciencia

- **Biología · Explora los seres vivos:** cuatro misiones, planta/caracol/hoja muerta/juguete. Conecta el caso con un grupo y una evidencia. Movimiento, tamaño o color no se usan como criterios suficientes de vida.
- **Química · Detectives de materiales:** cuatro misiones sobre transparencia, absorción, opacidad y flexibilidad en muestras concretas. Conecta objetivo, muestra y propiedad. Sin mezclas, calor, recetas ni sustancias reales.
- SVG originales ligeros que muestran cambios o propiedades, con descripciones textuales completas. Selección por toque o teclado, sin arrastre obligatorio; tutorial, explicación de cada elección, pista, reintento, navegación libre y cierre físico seguro opcional.
- Ambos para 6–8 años con lectura acompañada, como organización editorial provisional. Cada uno aparece SOLO en su disciplina y área Ciencia. Las tarjetas anuncian un juego piloto, no una materia completa.
- Se conservan los idiomas, el foco general en emociones/imaginación, las actividades anteriores y las preferencias del avatar. Total de catálogo: 22 entradas.

## Verificación final

| Batería | Resultado |
|---|---:|
| Lógica | 134/134 |
| DOM | 60/60 |
| Estática | 32/32 |
| Navegador heredado | 227 |
| Navegación de catálogo | 219 |
| Rutas v16 / idiomas | 77 |
| Ciencia | 110 |
| Historia y acompañante | 118 |
| Total navegador | **751** |

Chromium real en Linux, anchuras 320/375/768/1440; texto al 200 %, teclado, objetivos táctiles mínimos de 44 px, simulación de toque a 768×1024, respuestas, reintentos, cierre, recarga y pestañas rivales. Sin errores JavaScript ni solicitudes externas en baterías que registran esos eventos. Los doce caminos de Dani mantienen exactamente el mismo registro de progreso durante las decisiones. Se probaron todas las conexiones posibles de ficha/evidencia en los ocho retos de Ciencia. `git diff --check` correcto.

Pruebas heredadas ajustadas con motivo explícito: catálogo 20→22, digitales 17→19; la combinación vacía usada por el test cambia de Ciencia a Creatividad porque Ciencia 6–8 ahora tiene dos pilotos. No se elimina la prueba de recuperación desde un área vacía. Informes previos v16 se preservan; las ejecuciones actuales escriben en evidence-v17.

## Capturas reales

Dentro de `docs/evidence-v17/`:
- `biology-768.png`: Biología en tablet.
- `chemistry-1440.png`: las tres muestras y conexión razonada en escritorio.
- `chemistry-375.png`: Química móvil.
- `dani-ending-768.png`: final de una rama de Dani.
- `dani-ending-375.png`: final en móvil.
- `companion-first-visit.png`: muestra inicial sin escritura automática.
- `companion-garden.png` y `companion-words.png`: ayuda dentro de los modos concentrados.
- `companion-mobile.png`: mostrar/personalizar en móvil tras una preferencia oculta.

## Datos y límites

Codec de progreso v4 compatible en lectura con v1/v2/v3. Se conserva la misma clave y la protección entre pestañas; no se escribe al leer. Solo IDs acotados de Ciencia, nunca diarios, nombres o elecciones emocionales. La clave de apariencia no cambia. La muestra predeterminada no crea un registro hasta una decisión explícita de apariencia/visibilidad.

No probado en Safari, iOS/iPadOS, WebKit, Firefox, dispositivos físicos, lectores de pantalla reales ni hardware modesto. Toque simulado no equivale a iPad real. No se afirma funcionamiento offline, certificación WCAG, aval de GOV.UK/NGSS o aprendizaje validado. Las misiones de materiales no cubren reacciones químicas ni un currículo completo.

Fuentes verificadas y alcance en `FUENTES_V17.md`; implementación y diagnóstico en `ARQUITECTURA_V17.md`; sumas en `DELIVERY-V17-SHA256.json`.

## Entrega y siguiente paso

`npm run serve` permite revisión en el entorno a través de 127.0.0.1:4186, no constituye un enlace accesible desde el iPad del usuario. Se entregan ZIP y parche locales. No hay bloqueos técnicos pendientes. Respaldar una nueva rama remota y actualizar Sites requieren autorización posterior; esta entrega no realiza ninguna de esas acciones.
