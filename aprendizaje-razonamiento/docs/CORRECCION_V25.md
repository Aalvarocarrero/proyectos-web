# Corrección acotada v25 — 17 de octubre de 2026

Base remota: `7f80cee3c408a276d89ca9f2ae27bca592ee9cc9`, rama `feat/education-creative-studio-v25-source`.

## Defecto y cambio

La auditoría JS independiente encontró que una matriz con prototipo personalizado podía heredar un accesor de `Symbol.iterator`. El validador comprobaba los elementos propios pero después expandía la matriz, invocando ese iterador y copiando valores distintos. En una condición programática simulada, se aceptaba un guardado que después se leía como corrupto. La interfaz y JSON normal no crean estos prototipos.

`denseValues` ahora rechaza prototipos de matriz personalizados y copia únicamente los valores de los descriptores propios ya validados. Es el único archivo de ejecución modificado frente a la candidata inicial. La regresión cubre cells/original/undo y construcción en ambas etapas, sin invocar el accesor, escribir ni alterar el registro anterior. No se cambian funciones, contenidos ni esquema v4.

## Verificación nueva del contenido corregido

- 166 pruebas de lógica, 84 DOM únicas y 32 estáticas: 282 en total.
- DOM se ejecutó en lotes sobre el mismo archivo sin modificaciones. El segundo lote marcó sus 25 pruebas como correctas, pero terminó con un fallo genérico del proceso sin causa específica. La repetición aislada de esas mismas 25 pruebas terminó correctamente; se conserva el resultado inicial y la repetición. No se contabilizan pruebas repetidas dos veces.
- Auditoría independiente: 17 grupos, 16.000 transiciones alcanzables de composición, 48.792 estados anteriores válidos preservados y 26.032 inválidos rechazados. Pausa/recarga, deshacer, aislamiento, conflictos entre sesiones y vuelta v24/v25 comprobados mediante JS/JSDOM.
- Regresión independiente del inicio: 12 grupos, 1.329 comprobaciones. Voz local: 14 grupos con API simulada.
- 36 archivos de ejecución coinciden con el manifiesto SHA-256 actualizado.

## Evidencia anterior y límites

Las 2.156 comprobaciones Chromium del informe original corresponden a la candidata inicial, antes de esta corrección. No son una nueva corrida del contenido corregido. Se revisaron las seis capturas específicas disponibles de composición e inicio, a 375 y 1.440 px. El cambio final no modifica HTML/CSS, pero no sustituye una nueva comprobación visual. No se volvió a intentar el navegador local restringido. Sin audio real escuchado, Safari/iPad físico, familias ni tecnología de asistencia comprobados.

La validación no certifica rechazo de toda combinación lógicamente inalcanzable: todavía admite, por ejemplo, un motivo en página 0 o deshacer/pista en página 2. La interfaz normal no genera esos estados; los requisitos del cierre sí se comprueban. Sin Web Locks la coordinación sigue siendo de mejor esfuerzo.

## Respaldo, empaquetado y vuelta atrás

El respaldo GitHub conserva todos los archivos originales. Se pudieron verificar localmente 82 de los 84 blobs cambiados y los 36 archivos de ejecución. Dos PNG exclusivamente documentales (`docs/evidence-v25/regression/desktop-5y-extra.png` y `desktop-story.png`) no fueron recuperables por el conector y se omiten de la copia fuente para Sites con aprobación del coordinador. Ningún archivo de ejecución los referencia; no forman parte del paquete estático de ejecución. El clon independiente anterior de nube verificó los 84 archivos.

v24 no interpreta el nuevo cartel, pero protege los bytes del registro. Volver a v25 recupera el contenido. Se conserva el respaldo de fuente v24 y su versión privada previa; restaurarlo no convierte el nuevo cartel en una actividad compatible con v24.
