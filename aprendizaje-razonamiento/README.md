# Aprendizaje y razonamiento

Prototipo local 0.1 · 15 de octubre de 2026

Una primera demostración original de la plataforma educativa de 18 meses a 18 años. Es un proyecto independiente; no forma parte de Finca Escuela. No está publicado, no tiene repositorio remoto y no es un producto educativo validado.

## Abrir

Se necesita Python 3 para servir archivos estáticos:

```sh
cd aprendizaje-razonamiento-prototipo
python3 -m http.server 4177 --directory dist
```

Abrir `http://localhost:4177` en el mismo ordenador. Un servidor en otra máquina no crea automáticamente un enlace para el usuario. Los módulos JavaScript requieren servidor HTTP; no abrir el HTML directamente con `file://`.

## Probar

```sh
node --test tests/logic.test.mjs
python3 tests/static_a11y.py
```

Sin dependencias de producción, compilación, credenciales ni servicios de pago. Para el recorrido opcional de navegador se necesita Playwright y Chromium instalados, servidor activo y permisos de sockets:

```sh
CHROMIUM_PATH=/usr/bin/chromium node tests/browser.cjs
```

El entorno utilizado bloqueó el lanzamiento de Chromium; ese recorrido está preparado pero **no ha pasado**. No se han verificado iPad, Android, Mac, Safari ni lectores de pantalla.

## Qué puedes probar

- **18–24 meses:** guía para el cuidador, juego presencial con pelota grande y blanda.
- **2–3 años:** guía presencial de dos pasos con muñeco.
- **3–5 años:** elegir piezas por color, recibir pistas respetuosas, cambiar la regla a forma y explicar por qué.
- **5–7 años:** propuesta de expansión, explícitamente no implementada.
- **7–11 años:** planear una salida ficticia, distinguir necesidades y extras, usar 8 fichas y revisar el plan cuando bajan a 5. Se aceptan múltiples soluciones.
- **12–18 años:** propuesta de expansión, explícitamente no implementada.

Las edades son orientativas y siguen el plan. La interfaz no debe usarse para decidir capacidades o diagnosticar. Un adulto lee y acompaña el reto preescolar. No incluye lectura en voz alta todavía.

## Datos y seguridad

No existen perfiles reales ni campos de datos personales. Todo el escenario es ficticio. No hay cuentas, rastreadores, cookies de aplicación, almacenamiento persistente, conexiones de red de la app ni analítica. Las elecciones solo existen en memoria de la pestaña. Cambiar de etapa las conserva durante la sesión; recargar las elimina.

El servidor de desarrollo puede producir registros HTTP técnicos locales (rutas, hora e IP del cliente); no es seguimiento de aprendizaje. No exponer ese servidor a Internet ni usarlo con datos reales de menores.

La política CSP impide conexiones de aplicación y recursos externos. No hay evaluación mediante IA ni tutor automático. Las reglas deterministas comprueban únicamente el encaje de selecciones en una consigna ficticia.

## Documentación

- `docs/DECISIONES.md`: alcance, decisiones y registro para Notion.
- `docs/EXPANSION.md`: plan de edades y capacidades.
- `docs/VERIFICACION.md`: pruebas completadas y límites.
- `docs/ENTREGA_NOTION.md`: resumen listo para incorporar al proyecto.
- `docs/static-a11y-report.json`: comprobaciones estáticas reproducibles.

## Próxima decisión

Revisar este piloto con el usuario y especialistas. Después, acordar la etapa prioritaria y el acceso/ubicación del repositorio privado. Publicar, abrir acceso o recopilar datos requiere un paso separado. Este paquete no lo hace.
