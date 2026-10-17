# Aprendizaje y razonamiento

Prototipo 0.10.0 · navegación multiarea v15 · 17 de octubre de 2026

Una demostración original de la plataforma educativa de 18 meses a 18 años. Proyecto independiente de Finca Escuela. Esta revisión mejora la vista privada existente; no es un producto educativo validado.

La navegación permite elegir etapa, área y propuesta. Inventario: 10 retos digitales, 2 guías de adulto y 1 unidad familiar, sin doble conteo. Ver [entrega v15](docs/ENTREGA_V15.md) para alcance, pruebas, referencias y límites. Candidato local pendiente de revisión; no publicado.

## Abrir y probar

```sh
npm run serve
# Abrir http://127.0.0.1:4186 en el mismo ordenador.
npm test
npm run test:static
```

Python 3 y Node son suficientes. No hay dependencias de producción, compilación, credenciales ni servicios de pago. Los módulos JavaScript necesitan servidor HTTP; no abrir el HTML con `file://`.

Las pruebas DOM opcionales necesitan `jsdom` ya instalado y resoluble por Node. Si está en otra carpeta, proporcionar su carpeta `node_modules` en `NODE_PATH`:

```sh
NODE_PATH=/ruta/a/node_modules npm run test:dom
```

El recorrido de navegador opcional necesita Playwright y Chromium instalados, el servidor activo y un entorno con permisos de sockets:

```sh
CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
```

Las cifras de pruebas y el alcance visual se registran por versión en los informes de entrega. La revisión transversal v11 está en `docs/AREA_AUDIT_V11.md`. Las pruebas DOM no simulan disposición visual; no certifican lector de pantalla, Safari/iPad o Android.

## Qué puedes probar

| Etapa orientativa | Propuesta funcional | Ventana provisional |
|---|---|---|
| 18–24 meses | Guía para el adulto: turnos con pelota grande y blanda | 3–5 min de juego sin pantalla |
| 2 años | Guía para el adulto: secuencia con muñeco | 3–8 min de juego sin pantalla |
| 3–5 años | Agrupar por color/forma o descubrir secuencias repetidas | 3–8 min |
| 6–8 años | Ordenar una historia o revisar instrucciones de un recorrido | 5–10 min |
| 9–12 años | Planificar con fichas o diseñar una comparación justa | 8–15 min |
| 13–18 años | Comparar evidencia o detectar sesgo en una encuesta | 10–20 min |

Son ventanas de diseño aprobadas provisionalmente, orientativas y ajustables. No son tiempos óptimos validados, límites diarios de pantalla ni recomendaciones clínicas. Terminar antes está previsto. El adulto consulta las dos primeras guías y aparta la pantalla; no se pide que el niño complete una sesión digital. Las edades no evalúan capacidades.

Antes de cada propuesta se muestran objetivo, acompañamiento y tiempo orientativo. Hay inicio explícito, pausa sin reloj, reanudación y cierre en cualquier momento. Una ronda puede terminar sin obligar a otro reto. Agrupación y planificación conservan las mecánicas anteriores. Se añaden cuatro propuestas originales con dos pasos cada una, pistas progresivas y explicaciones específicas. El catálogo permite elegir entre dos retos por etapa desde 3 años, sin iniciar automáticamente ninguno. En la entrada de 9–12 años se añade la unidad piloto «Comparar para explicar»: conectar, ejemplo trabajado, práctica con ayuda, nuevo contexto, ficha fuera de pantalla y regreso opcional en otro momento. Todas sus partes están disponibles desde el inicio; no hay puntuación ni pasos bloqueados. Está pensada provisionalmente para exploración familiar en español, con entrada flexible y sin alineación con un currículo nacional. Las elecciones se conservan de forma independiente al cambiar de propuesta.

## Acompañamiento y siguiente unidad

Cada propuesta incluye una guía opcional con un ejemplo previo distinto, más apoyo, retirada de ayuda y una pregunta para conversar. Las guías no cambian las misiones ni evalúan capacidades.

- `docs/GUIA_ACOMPANAMIENTO_Y_SIGUIENTE_HITO.md`: guía para familias y educadores, matriz de cobertura, fuentes primarias y especificación de una unidad completa para el siguiente hito.
- `docs/VERIFICACION_ACOMPANAMIENTO.md`: resultados del primer hito de acompañamiento.
- `docs/UNIDAD_COMPARAR_ENTREGA.md`: alcance, criterios y verificación del candidato combinado.

## Datos y seguridad

Sin nombres, perfiles de menores, campos de datos personales, cuentas infantiles, rastreadores de aprendizaje, cookies de aplicación, conexiones de red de la app ni analítica. Todo el escenario es ficticio. El alojamiento privado utiliza el acceso de ChatGPT y puede generar registros técnicos. Las elecciones se guardan solo en localStorage del navegador, con esquema versionado, validación y borrado voluntario; no se transmiten. El aviso visible informa si se guardaron, se recuperaron o falló el almacenamiento. Un registro corrupto o desconocido no se sobrescribe automáticamente. No hay sincronización, copia de seguridad ni garantía de retención del navegador. Volver a la propuesta tras terminar inicia de nuevo.

El servidor local puede generar registros HTTP técnicos; no exponerlo a Internet ni utilizar datos reales de menores. La CSP bloquea conexiones de la aplicación y recursos externos. No hay evaluación por IA, diagnóstico ni puntuación de capacidades.

## Límites y documentación

El currículo completo, nuevos niveles, audio y adaptación individual siguen pendientes y se indican en la interfaz. Falta revisión pedagógica y pruebas con usuarios antes de usarlo como producto educativo.

- `docs/DECISIONES.md`: decisiones de la revisión.
- `docs/EXPANSION.md`: módulos actuales y pendientes.
- `docs/VERIFICACION.md`: evidencia reproducible y límites.
- `docs/ENTREGA_NOTION.md`: resumen de la actualización preparado, sin escribir en Notion.

## Publicación

El proyecto existente de Sites y su manifiesto se conservan. El acceso debe seguir siendo solo del propietario. La versión efectivamente publicada se verifica mediante el resultado de despliegue de Sites; este documento no sustituye esa confirmación.

## Feedback específico (0.4.1)

Las ocho preguntas de las cuatro actividades adicionales ahora explican cada alternativa incorrecta por separado: 14 explicaciones originales que identifican la diferencia y proponen una revisión concreta. No cambian las respuestas correctas, las pistas, el orden, los tiempos ni el estado de las sesiones. Las pruebas recorren cada alternativa incorrecta, pausan y reanudan, cambian de elección y verifican que el feedback anterior se borra. No se añaden registros ni campos.

## Juego interactivo (0.5)

«El jardín de los caminos» es un juego destacado de 6–8 años: construir flechas, mover un personaje por un tablero, revisar un camino bloqueado y llevar la idea al papel. El acompañamiento se integra como ayuda breve opcional. El juego se abre por defecto en esa etapa; los retos anteriores siguen en el catálogo y conservan estado independiente. Véase `docs/JUEGO_JARDIN.md` para alcance, decisiones y límites.

## Interacción pulida (0.6)
Modo de juego enfocado con retorno al catálogo, tutorial contextual y ejemplo independiente opcional. El programa se edita seleccionando una flecha; reemplazar, quitar y borrar admiten deshacer el último cambio conservando la ejecución anterior. Destino siguiente visible, bloqueo explicado y pausa sin pérdida durante la sesión. Ver `docs/INTERACCION_V7.md`.

## Guardado local (0.7)
Una sola clave propia y sin identificadores personales. Recupera elecciones, etapa, pausa y rutas al recargar; conserva los datos de otras apps al borrar. Rechaza versiones desconocidas, datos fuera de límites y texto libre inyectado. La explicación de respuestas se vuelve a generar con Revisar; el motor reconstruye mensajes de rutas. No transfiere el progreso entre dispositivos.

## La palabra escondida (0.8)
Piloto original para 7–8 dentro de la etapa 6–8. Seis escenas con banco, copa y planta; relaciona sentido y fragmento contextual con explicación específica. Modelo oral opcional oculto inicialmente, papel/gestos fuera de pantalla y ayuda adulta. Sin puntuaciones ni atribución de eficacia institucional. Fuentes y límites: `docs/PALABRA_EVIDENCIA.md`. Guardado v2 migra v1 en la siguiente escritura y preserva juegos anteriores.

## Coordinación de pestañas (v11)

El controlador compara el guardado que esta pestaña conoce con el actual antes de escribir o borrar. Un cambio externo detiene el guardado y ofrece cargar el último estado con confirmación; no mezcla ni sobrescribe en silencio. Con Web Locks, escrituras y borrados de pestañas actualizadas se serializan. Sin esa API la comparación es de mejor esfuerzo: conviene usar una sola pestaña y no se garantiza exclusión ante escrituras exactamente simultáneas. Una pestaña con código antiguo abierto debe recargarse. No se añaden identificadores, relojes, cuentas o datos personales.
