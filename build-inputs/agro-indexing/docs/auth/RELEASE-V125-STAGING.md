> HISTÓRICO: resultados de la preparación v125. No usar sus números de migración para esta release. Véase RELEASE-V127-STAGING.md.

# Venezuela Agro v125 + autenticación portable

Preparación local del 15 de octubre de 2026. No constituye un despliegue ni una autorización para escribir en Cloudflare.

## Procedencia y alcance

- Base actual de Sites: `f803f42a4cb121c1bbad68118038fa5d2ad7221a` (v125).
- Autenticación portable: `85eacc2356ae12c8ee9604e23c5efff1063309cc` y `aaa495c47fd4958a13534694029890d1e7322a17`, reconciliadas en `release/staging-v125-auth`.
- Único conflicto de integración: imports de `components/farm-dashboard.tsx`. Se conservaron la presentación reciente de importes y `authFetch`.
- Conservadas monedas, detalles de precios, aprendizaje, especies y colección actual de stickers. Las migraciones `0000`–`0007` y la configuración `.openai/hosting.json` no cambiaron.
- No se modificaron los checkouts originales, datos remotos, secretos, DNS, acceso de Sites ni permisos administrativos.

## Correcciones adicionales verificadas

1. La petición CSRF compartida tiene un límite de diez segundos, incluida la lectura del cuerpo. Cada llamada puede cancelar su espera sin interrumpir a otra. No se envía la mutación del solicitante cancelado.
2. La configuración de staging fija `account_id`, `assets.binding=ASSETS` y `assets.run_worker_first=true`. HTML estático y descargas pasan por la autenticación antes de ser servidos.
3. El Worker entrega los assets mediante el binding después de verificar la sesión. Esto incluye los chunks generados por Vite y los manifiestos offline creados después del build, que no aparecen en el listado de archivos públicos de vinext. Los recursos mínimos del login siguen disponibles sin sesión.
4. La comprobación local verifica tanto el destino/configuración como las funciones compiladas que seleccionan la frontera standalone. Un build de Sites no pasa esta comprobación.

## Comprobaciones

- Build normal de Sites y suite completa: 1.166 pruebas, sin fallos.
- TypeScript: sin errores. ESLint completo: sin errores, 46 advertencias existentes.
- Build standalone: correcto, con Worker-first, `ASSETS`, `keep_vars`, cuenta, D1, R2 y origen previstos en la configuración generada.
- `0000`–`0008`: aplicación sobre SQLite local vacío, integridad/llaves foráneas y preservación íntegra de usuarios/fincas/registros anteriores. `0008` solo añade las tres tablas de autenticación; no vincula ni migra identidades.
- `npm run db:generate`: sin diferencias de esquema.
- Smoke del Worker compilado con D1/R2 efímeros y credenciales sintéticas: cabeceras Sites falsificadas rechazadas; página de login y CSS accesibles; HTML y manifiestos protegidos; acceso con sesión sintética; administración denegada; mutación sin CSRF denegada; sesión revocada denegada. Proveedores externos bloqueados en el transporte de prueba.

### Límites de las comprobaciones

El workerd instalado solo admite fechas hasta `2026-05-22`. El smoke local usa explícitamente esa fecha; el artefacto conserva `2026-10-14`. No es una prueba de paridad con el runtime remoto exacto.

La suite completa está diseñada para la variante Sites. Una ejecución exploratoria contra standalone obtuvo 1.156 aprobadas y 10 fallidas: eran comprobaciones de renderizado anónimo que esperaban contenido público sin configuración/sesión. El staging lo deniega deliberadamente. No se eliminaron ni debilitaron esas pruebas; se ejecutan sobre su build Sites y el staging usa comprobaciones de autenticación y smoke independientes.

No se ha verificado Google/Turnstile real, permisos del cliente OAuth, valores o fortaleza de secretos, esquema/historial remoto D1, privacidad remota R2 ni pruebas reales con dos cuentas y móviles. La advertencia de secreto Google expuesto y no rotado se describe en `CONTINUAR-STAGING-ES.md`, sin reproducir su valor.

## Destino autorizado que debe volver a verificarse al ejecutar

- Cuenta: `5ce31d22b086645c67dab913699edd3f`
- Worker: `venezuelaagro-staging`
- Origen: `https://venezuelaagro-staging.alvarojuniorcarrerovasquez.workers.dev`
- D1: `95ad0e14-ad7f-4385-bb4e-a869197d30c7`, binding `DB`
- R2: `venezuelaagro-staging-files`, binding `BUCKET`, privado
- Build/publicación: `dist/server/wrangler.json`; migración: `wrangler.staging.jsonc`
- Callback Google: el origen anterior más `/api/auth/google/callback`
- Variables del archivo: `AUTH_MODE=google`, `APP_ORIGIN`, `TURNSTILE_SITE_KEY=0x4AAAAAAFWfwMwzdORVkoDe`
- Variables/secretos de panel que deben conservarse: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SESSION_SECRET`, `TURNSTILE_SECRET_KEY`. No obtener sus valores para desplegar.

`STAGING_ALLOWED_EMAILS` queda deliberadamente fuera del archivo: aplicar exclusivamente los correos exactos aprobados al ejecutar. Una lista de testers no concede administración. En esta versión la administración standalone sigue deshabilitada; habilitarla requeriría un alcance y aprobación separados por identidad Google verificada/ID interno, nunca herencia por correo.

## Condiciones de ejecución posterior

1. Confirmar la instrucción vigente de publicar **solo staging**, los correos de prueba y la autorización para crear las tablas pendientes en la D1 exacta. Una pausa posterior invalida el momento de ejecución anterior.
2. Inspeccionar tablas e historial remoto antes de migrar. Aplicar `0000`–`0008` únicamente si la base carece de esquema; aplicar solo lo pendiente si el historial coincide. Tablas sin historial coherente requieren reconciliación, nunca aplicación a ciegas.
3. Usar una vía autenticada de carga que pueda subir Worker y assets completos. El conector describe un PUT multipart para el Worker, pero la carga de assets usa un JWT temporal en Authorization y la firma expuesta de `cloudflare.request` no permite personalizar esa cabecera. No se ha demostrado una vía integral mediante ese conector. Las comprobaciones locales de presencia no encontraron credenciales Wrangler. Cualquier nueva autorización OAuth/token debe hacerse de forma segura y con aprobación específica; nunca por chat ni leyendo secretos existentes.
4. Desplegar el artefacto standalone verificado y preservar bindings/secretos. No desplegar el build Sites directamente en Workers.
5. Verificar versión remota, configuración, login/cancelación/reintento, Turnstile, logout, aislamiento entre cuentas, acceso offline y colas. No llamar terminada la integración antes de esas pruebas.

## Repetir las verificaciones locales

```sh
npm run build
node --test --test-concurrency=2 tests/*.test.mjs
npm run lint
bash scripts/sites-env.sh -- node_modules/.bin/tsc --noEmit
npm run db:generate
npm run build:staging
node scripts/check-staging-local.mjs
node --test tests/portable-auth-*.test.mjs tests/auth-fetch.test.mjs tests/staging-migrations.test.mjs
STAGING_LOCAL_COMPATIBILITY_DATE=2026-05-22 bash scripts/sites-env.sh -- node scripts/smoke-staging-local.mjs
```

El último comando limita el smoke a la compatibilidad del emulador instalado. No cambia el archivo de configuración de despliegue.

## Referencias

- [Enrutamiento Worker antes de assets](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)
- [Configuración de assets](https://developers.cloudflare.com/workers/wrangler/configuration/#assets)
- [Carga directa de assets](https://developers.cloudflare.com/workers/static-assets/direct-upload/)
- [Migraciones D1](https://developers.cloudflare.com/d1/reference/migrations/)
