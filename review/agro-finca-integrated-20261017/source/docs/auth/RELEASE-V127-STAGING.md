# Venezuela Agro: release v127 con Google portable

Preparación local intermedia del 15 de octubre de 2026. **No desplegada; no es un lanzamiento definitivo.** No se han escrito recursos remotos, migraciones, DNS, secretos ni permisos.

## Qué contiene

Base publicada v127 `2f4897c` con CMS de portada, Finca Escuela, guías, monedas, precios y stickers; autenticación portable integrada desde la preparación v125 `8d69098`. La rama aislada es `release/staging-v127-auth`. Los checkouts originales se conservan.

- Incluye la corrección Explorar/Profundizar `fa464ec` (integrada como `96ab5e5`): diferencias visibles en las seis rutas, estados completados y conservación de entradas. HTML autocontenido: 179.408 bytes, dentro del límite de 180.000.
- Se preservan los bloqueos de edición de empresas de v127 y se usa el transporte CSRF de autenticación portable.
- La redirección de acceso en la portada conserva `private, no-store`; la nueva política CMS no puede convertirla en pública.
- La carga inicial del editor CMS es cancelable y no provoca actualizaciones sincrónicas desde el efecto.
- Worker-first y ASSETS protegen HTML estático, descargas y manifiestos offline antes de entregarlos.
- El acceso de prueba sigue limitado al propietario ya aprobado. No se añade ningún correo ni se guarda ningún secreto en el código.

Se conservan los **76 stickers ya publicados**. Los ocho stickers nuevos aún en preparación no se incluyen: esa tanda y cualquier ajuste posterior requieren actualizar y volver a validar el paquete.

## CMS y administración: bloqueo intencionado

**El CMS NO es utilizable en standalone.** La identidad Google permitida para probar no obtiene administración. `isAdminIdentity` continúa devolviendo false en standalone para todas las cuentas. Antes de usar el CMS allí hace falta que el propietario apruebe una política administrativa explícita y que se implemente por identidad Google verificada/ID interno, con pruebas de autorización. La coincidencia de correo no concede roles ni vincula cuentas históricas.

## Migraciones: resolver la colisión antes de tocar D1

La cadena canónica de este paquete es:

- `0000`–`0007`: intactas.
- `0008_wild_sinister_six.sql`: CMS original de main, intacto; añade `website_content`.
- `0009_even_blue_shield.sql`: SQL de autenticación portable intacto, con numeración nueva en esta rama que aún no se ha desplegado.
- Snapshot `0008` original preservado; snapshot `0009` incluye ambos esquemas y referencia correctamente el anterior. Journal ordenado de diez migraciones.

No conocemos el historial aplicado remoto. Antes de ejecutar, inspeccionar esquema y ledger reales, con autorización vigente:

1. Base realmente vacía: las diez migraciones en orden.
2. Esquema e historial exactos hasta `0007`: CMS `0008` y auth `0009`.
3. Esquema e historial v127 con CMS `0008_wild_sinister_six`: solo auth `0009`.
4. Historial con la antigua auth `0008_even_blue_shield`: **DETENERSE** y preparar una reconciliación específica revisada. No ejecutar automáticamente esta cadena, renombrar migraciones aplicadas, borrar tablas, inventar historial ni repetir auth.
5. Tablas sin historial coherente, esquemas parciales o cualquier divergencia: detenerse y revisar.

La prueba local de un esquema antiguo con auth demuestra que añadir solo CMS puede preservar registros, pero NO autoriza ni demuestra cómo corregir un ledger remoto. No se han migrado identidades, propietarios ni datos locales de usuario.

## Destino que debe comprobarse de nuevo

- Worker: `venezuelaagro-staging`
- Cuenta: `5ce31d22b086645c67dab913699edd3f`
- Origen: https://venezuelaagro-staging.alvarojuniorcarrerovasquez.workers.dev
- D1: `95ad0e14-ad7f-4385-bb4e-a869197d30c7`, binding `DB`
- R2: `venezuelaagro-staging-files`, binding `BUCKET`, privado
- Configuración de migraciones: `wrangler.staging.jsonc`
- Configuración de despliegue standalone: `dist/server/wrangler.json`
- Callback OAuth: origen anterior + `/api/auth/google/callback`

No usar un build Sites como Worker standalone. Conservar `keep_vars`, los bindings y los secretos remotos existentes sin leer sus valores.

## Pasos pendientes del propietario

1. Completar y revisar la web antes de autorizar la subida. Cuando esté lista, dar la instrucción vigente de publicar solamente staging y autorizar expresamente las migraciones que resulten pendientes después de la inspección.
2. Mantener la cuenta de propietario aprobada como única cuenta de prueba tanto en Google como en `STAGING_ALLOWED_EMAILS`. Sin comodines ni nuevas cuentas.
3. Comprobar el cliente Google y su callback exacto. Resolver la advertencia previa de secreto Google expuesto/no rotado mediante el flujo seguro; nunca pegar secretos en chat, código, capturas o este paquete.
4. Comprobar en el panel los secretos Google/sesión/Turnstile y el hostname Turnstile. La preparación local no lee valores ni acredita que sean correctos o estén rotados. Los cambios de credenciales los realiza el propietario mediante el flujo seguro correspondiente.
5. Proporcionar una vía de despliegue autenticada autorizada que suba Worker y assets completos. Este trabajo no crea tokens/OAuth ni configura acceso persistente.
6. Revisar el historial D1 y la privacidad de R2 antes de ejecutar; conservar datos y preparar una copia de seguridad por la vía aprobada.
7. Decidir y aprobar una política administrativa si se necesita usar el CMS en standalone; requiere implementación adicional antes de que sea usable.
8. Tras un despliegue autorizado, verificar Google y Turnstile reales, acceso/cancelación/reintento/logout, rechazo de cuentas no permitidas, aislamiento de datos, móvil, descargas offline y colas. Una segunda cuenta para probar aislamiento exige autorización específica antes de ampliar la lista.

## Resultados locales de esta preparación

- Build Sites: correcto; suite completa **1.218/1.218**.
- Build standalone: correcto; comprobación de destino, bindings, assets y cadena de migraciones aprobada.
- Autenticación, CSRF, Turnstile y migraciones: **34/34**; CMS y restauración poblada: **19/19** (también incluidas en la suite completa).
- Migraciones sobre base vacía, esquema v125, CMS v127 y ensayo de esquema auth antiguo: integridad/llaves foráneas y preservación de filas aprobadas; sin asumir historial remoto.
- `db:generate`: sin diferencias de esquema. TypeScript: sin errores. ESLint: sin errores, 49 advertencias (47 previas y dos funciones del módulo autocontenido nuevo).
- Smoke del Worker standalone compilado: login/CSS accesibles, cabeceras Sites falsificadas rechazadas, redirecciones privadas, HTML/manifest protegidos, acceso con sesión sintética, CMS/administración denegados, CSRF y revocación comprobados.
- Finca Escuela: 32 pruebas, HTML autocontenido 179.408 bytes.
- Offline standalone: 159 recursos de código/estilos/fuentes; biblioteca de 480 assets, 20.465.470 bytes; fingerprint `morochos-v234131265592122`.
- No se verificaron Google/Turnstile reales, secretos remotos, historial D1 remoto, privacidad R2 remota, permisos OAuth ni uso móvil real.

## Verificaciones reproducibles

```sh
npm run build
node --test --test-concurrency=1 tests/*.test.mjs
npm run lint
bash scripts/sites-env.sh -- node_modules/.bin/tsc --noEmit
npm run db:generate
npm run build:staging
node scripts/check-staging-local.mjs
node --test --test-concurrency=1 tests/portable-auth-*.test.mjs tests/auth-fetch.test.mjs tests/staging-migrations.test.mjs
STAGING_LOCAL_COMPATIBILITY_DATE=2026-05-22 bash scripts/sites-env.sh -- node scripts/smoke-staging-local.mjs
```

Ejecutar builds en serie. La suite completa de renderizado está diseñada para el build Sites; el build standalone deniega deliberadamente el renderizado anónimo. El smoke standalone usa D1/R2 efímeros, credenciales sintéticas y transporte externo bloqueado. La fecha de compatibilidad local 2026-05-22 responde al emulador disponible; el artefacto remoto conserva 2026-10-14. No constituye paridad exacta con el runtime remoto.

El paquete final incluye un manifiesto con procedencia, resultado de verificaciones y hashes de archivos. La comprobación de hashes identifica el artefacto local; no demuestra que esté desplegado.
