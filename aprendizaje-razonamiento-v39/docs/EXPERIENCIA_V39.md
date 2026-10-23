# Experiencia por edades · fase v39

La portada anterior mezclaba el inicio guiado con talleres, áreas, idiomas y utilidades. Esta fase separa el inicio de la biblioteca sin retirar actividades. La acción principal conduce a una etapa orientativa y una propuesta concreta; la tarjeta indica objetivo y primer paso. En las primeras edades la persona adulta conduce una actividad presencial. Las escenas de 3–5 años muestran objetos y formas; las de adolescentes usan registros y evidencia, sin personaje obligatorio.

La biblioteca mantiene las ocho áreas de la interfaz (siete originales más Idiomas), seis idiomas, disciplinas y talleres. Las opciones adicionales siguen disponibles mediante controles explícitos. El panel de ayuda muestra primero la pista; la apariencia de Luma se abre por separado. Se conserva la preferencia anterior si existía. Se eliminó la afirmación general de que ninguna pista revela respuestas, porque los pilotos de vocabulario ya ofrecen etiquetas explícitas.

Atrás y Adelante del navegador recuperan las pantallas del recorrido guiado y la actividad. El historial guarda solo una referencia opaca; edad, acompañamiento y destino se resuelven en memoria de la pestaña. El esquema, claves, validación y coordinación del progreso guardado no cambian.

## Evidencia

En Chromium, a 390 px, la portada pasó de 47 a 5 acciones visibles y de 5.690 a 1.269 px de alto. Esto mide la interfaz, no comprensión, satisfacción ni aprendizaje. Las comprobaciones nuevas recorren las seis edades en 320, 390, 768 y 1440 px, verifican todos los destinos de cada etapa, teclado, objetivos táctiles de 44 px, texto al 200%, movimiento reducido y alternativa sin transparencia.

Comprobaciones completadas:

- 265 pruebas de lógica.
- 106 pruebas DOM.
- 32 comprobaciones estáticas; sintaxis de 45 módulos JavaScript.
- 302 comprobaciones del nuevo recorrido en Chromium.
- 196 de entrada guiada y 145 de salida al catálogo/idiomas.
- 88 de Matemáticas y 19 de comparación de planes A/B.
- Dos escenarios de guardado entre pestañas con operaciones en espera; no reaparecen datos borrados.

La aplicación es estática y no tiene una compilación de framework ni un script de lint. Se verificó sintaxis con Node y el resultado real en Chromium. El paquete declara las versiones de jsdom y Playwright ya utilizadas; no añade dependencias de ejecución de la app ni servicios.

## Límites y revisión pendiente

No se ha probado esta fase con niños, cuidadores o docentes. Las pruebas automatizadas y la emulación de tacto/preferencias no equivalen a hardware móvil, lector de pantalla, Safari ni certificación WCAG. Se mantiene el carácter acotado de los pilotos, sin promesas de eficacia. “CEL” sigue sin definición confirmada y no se ha convertido en una función inventada.

La referencia comunitaria apple-design de emilkowalski se utilizó para jerarquía, respuesta, materiales y legibilidad; no es código oficial de Apple. La transparencia se limita a la navegación y tiene alternativa sólida. Synthesis Tutor se usó como referencia general de claridad de tareas, sin copiar recursos, marcas o resultados comerciales.

Esta fase se prepara para revisión. El sitio privado publicado conserva v38; no se despliega v39 en este paso.
