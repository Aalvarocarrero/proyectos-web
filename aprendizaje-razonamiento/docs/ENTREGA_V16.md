# Entrega local v16 · 17 de octubre de 2026

Implementación terminada en la nube, sin Mac. Base comprobada: `d673ead2dd9b5c9a279f83d3d9395b68fdebe604` de `feat/education-multiarea-v15-source`. Rama local `feat/education-languages-v16-local`. No se ha subido rama, abierto PR ni publicado Sites; la v15 publicada sigue intacta. El SHA publicado de referencia comunicado por el padre es `b6fa4a1ee1f664d0d1fa8cca117a3add7361deaa`; la base usada es la fuente v15 exacta solicitada.

## Qué se puede utilizar

- Inicio y navegación priorizan conocerte, emociones, imaginación y preguntas. Se conservan siete áreas anteriores, y se añade Idiomas. Las disciplinas son rutas transversales, no categorías duplicadas.
- Español, inglés, portugués, chino mandarín, italiano y francés: seis rutas visibles; tres asociaciones escritas por idioma (gato, perro, agua); guía previa, opciones con pictograma/texto, explicación, reintento, continuación voluntaria, pausa y cierre. Pinyin con tonos, sin audio ni evaluación de pronunciación.
- «La torre de Dani», 6–8 con adulto: una escena ficticia completa, cuatro perspectivas posibles, pregunta abierta sobre ayudar/esperar, opción de pasar, cierre y dos finales para dibujar. No es el itinerario completo «Historias para imaginar». Las elecciones de perspectivas no se guardan.
- Biología y química: preparación explícita, sin botón que simule actividad. Física enlaza puente y comparación/rampa; razonamiento enlaza actividades pertinentes. Filosofía y psicología conectan explícitamente con la misma primera escena, sin presentarla como dos cursos.
- Acompañante opcional: tres formas y tres colores originales en CSS, guardar apariencia, ocultar/mostrar, personalizar y olvidar. Pistas fijas según contexto. Sin nombres, fotos, chat, voz, presión emocional o inteligencia adaptativa. Preferencias visuales en clave local separada.
- Progreso compatible con v1/v2: lectura no destructiva y escritura v3 en la misma clave. Se conserva protección entre pestañas de la app existente. Mismo CSP, sin nuevas dependencias de ejecución ni red de contenido.

## Evidencia ejecutada

| Batería | Resultado |
|---|---:|
| Lógica | 119/119 |
| DOM jsdom | 52/52 |
| Estática/accesibilidad | 32/32 |
| Navegador heredado | 227 comprobaciones |
| Navegación | 219 comprobaciones; 54 combinaciones etapa/área; 20 entradas |
| Idiomas/historia/avatar | 77 comprobaciones |
| Total comprobaciones navegador | 523 |

Chromium headless real en Linux: 320, 375, 768 y 1440 píxeles; texto al 200 %, teclado, controles táctiles de al menos 44 px, ausencia de desbordamiento horizontal, pausa/recarga y conflicto entre pestañas. Sin errores JS ni solicitudes externas en baterías que las registran. Se inspeccionaron capturas reales. `git diff --check` correcto. Logs y JSON en `docs/evidence-v16`.

Las pruebas iniciales detectaron y permitieron corregir una colisión de clase con la cuadrícula existente, un error de sintaxis, desbordamiento con texto al 200 % y una espera del test durante guardado asíncrono. Los resultados de la tabla son las últimas ejecuciones aprobadas, no esos intentos fallidos. El test previo que esperaba versión 2 se actualizó a la versión del codec; el inventario de 13 a 20 entradas. Las regresiones originales se mantienen.

## Vista revisable

- `evidence-v16/overview-desktop.png`: portada real.
- `evidence-v16/six-languages.png`: seis rutas visibles.
- `evidence-v16/reflection-tablet.png`: escena en anchura de tablet.
- `evidence-v16/mandarin-375.png`: recorrido en móvil.
- `evidence-v16/companion.png`: apariencia personalizada.
- `evidence-v16/navigation-text-200.png`: texto ampliado.

`npm run serve` sirve `dist` en `http://127.0.0.1:4186`. Esta dirección solo es local al entorno; no es un enlace de prueba para iOS ni se supone que el usuario haya probado la nueva entrega. La visualización pública/privada de Sites no se ha actualizado.

## Límites y siguiente autorización

Sin pruebas en Safari, iOS/iPadOS, WebKit, Firefox, dispositivos físicos, lectores de pantalla reales o hardware modesto. No es certificación WCAG ni validación pedagógica/por edad. No se han simulado redes lentas ni medido rendimiento de dispositivos modestos. Recursos de ejecución ligeros, sin activos multimedia descargables, pero no se afirma disponibilidad offline. Las grafías de pictogramas dependen del sistema.

Solo seis pilotos escritos de tres palabras y una escena emocional/filosófica, sin currículo profundo completo, diagnóstico, terapia, perfiles, diarios, cursos de química/biología o resultados garantizados. Las fuentes no avalan el producto. Preferencias visuales usan coordinación optimista; el progreso educativo conserva Web Locks y su alternativa documentada.

No hay bloqueos técnicos pendientes. Para subir esta rama a GitHub se necesita autorización concreta todavía no solicitada ni asumida; no era necesaria para completar la entrega local. Publicar Sites es otra acción fuera de esta entrega. Ver `FUENTES_V16.md`, `ARQUITECTURA_V16.md` y `DELIVERY-V16-SHA256.json`.
