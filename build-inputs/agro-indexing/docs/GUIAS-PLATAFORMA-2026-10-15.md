# Revisión de guías de la plataforma · 15 de octubre de 2026

## Alcance verificado en fuente

Base de interfaz: `84a36492ed121ae7ee36c8f428bf1e2af12c8147`.

- Navegación principal y menú agrupado; Conexión en la cabecera pública y Sincronización propia de Mi Finca.
- Registro general de pesajes sin animal seleccionado; acceso individual conserva el animal.
- Mercado: precio opcional, importe y unidad originales, referencias USD/VES, otras monedas EUR/COP, fuentes y fechas.
- Profesionales: tarifas opcionales por modalidad y unidad; consulta comercial sin contratación automática.
- Tienda: selección hogar/negocio, edición de cortes, borrador de contacto temporal y estados reales al guardar.
- Guía 13 de Finca Escuela: Cultivos/Animales, seis recorridos, cuaderno y progreso educativo local separado de la finca real.
- 65 SVG ligeros, rotulados como esquemas didácticos. No son capturas ni vídeos de la aplicación.

## Comprobaciones realizadas

- 39/39 regresiones de contenido, nombres del menú, esquemas, invitación contextual y navegación; pruebas del motor de Finca Escuela.
- TypeScript correcto y lint focalizado sin errores; tres advertencias de `<img>` ya existentes.
- Build completo correcto; el manifiesto de biblioteca contiene los 65 SVG (108.832 bytes), incluidos los cinco de Finca Escuela. Biblioteca total: 20.437.735 bytes, bajo el límite de 20 MiB.
- Render local de los esquemas de acceso, Mercado, Profesionales, tienda y Finca Escuela, incluido el paso de seguridad.

## Cotejo pendiente en el sitio alojado

La revisión de fuente no equivale a verificación del despliegue. Al preparar este cambio, la publicación de la interfaz v126 estaba bloqueada por el límite de previews y el sitio público seguía en v125. No se han realizado grabaciones ni pruebas visuales de v126 alojada.

Cuando la interfaz y las guías estén publicadas:

1. Confirmar la versión que sirve el sitio antes de juzgar textos o capturas.
2. Abrir Aprende a 390 px y en escritorio, filtrar las guías y entrar desde los siete accesos rápidos, incluyendo Tienda y Finca Escuela.
3. Cotejar la prosa servida de cada guía cambiada con `lib/platform-guides.ts`. Revisar la fecha, las cuatro secciones, los destinos y los SVG del mismo slug.
4. Comprobar los nombres exactos del menú, estado Conexión, controles de precio y tarifas, edición de solicitud y selección de pesaje en la interfaz servida. No enviar solicitudes reales ni cambiar datos de usuarios durante esta comprobación.
5. Verificar foco, ampliación de esquemas, lectura móvil, búsqueda sin tildes y retorno a Aprende. Confirmar que los esquemas sigan identificados y que no haya vídeos o capturas anunciados sin existir.
6. Preparar la biblioteca sin señal y comprobar que incluya las 13 guías y sus 65 SVG con la revisión de recursos vigente; conservar la distinción entre descarga local y respaldo de registros.

## Precedencia editorial de la base de datos

`lib/knowledge-db.ts` conserva intencionalmente su comportamiento: un artículo con estado `published` y el mismo slug en la base de datos sustituye título, descripción, cuerpo y fechas de la guía incorporada; mantiene su configuración `tutorial`. Esto puede producir prosa anterior junto a esquemas nuevos. Las pruebas de `platform-guides` no prueban que la base de datos alojada carezca de esos overrides.

No se ha modificado la precedencia ni el contenido publicado de la base de datos. Si el cotejo detecta un override desactualizado, registrar el slug, texto servido, fecha y diferencia concreta. Revisar esa pieza antes de proponer la actualización editorial correspondiente. No sobrescribir en bloque artículos del usuario ni asumir que todo contenido de base de datos es obsoleto.
