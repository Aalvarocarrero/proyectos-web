> ACTUALIZACIÓN v127: usar RELEASE-V127-STAGING.md como guía principal. Esta preparación no está desplegada. El CMS standalone sigue deshabilitado.

# Venezuela Agro: continuar la prueba privada

Preparación local del 15 de octubre de 2026. Rama `release/staging-v127-auth`: base Sites v127 `2f4897c` más autenticación portable y reconciliación de CMS. Conserva las funciones de monedas, aprendizaje y stickers. Este documento y la comprobación local no publican la aplicación ni cambian Cloudflare.

## Lo que queda para ti

1. En Google Cloud, comprobar el cliente OAuth de tipo **Aplicación web** y registrar exactamente esta URI de redirección:
   `https://venezuelaagro-staging.alvarojuniorcarrerovasquez.workers.dev/api/auth/google/callback`
   El cliente debe ser el que corresponde a `GOOGLE_CLIENT_ID`. Si el consentimiento está en modo de prueba, añadir allí exclusivamente la cuenta de propietario ya aprobada. Este flujo de redirección no necesita un origen JavaScript de Google. Solo solicita `openid email profile`.
2. En Cloudflare → Workers & Pages → **venezuelaagro-staging** → Settings → Variables and Secrets:
   - Añadir `GOOGLE_CLIENT_SECRET` como **Secret** con el secreto de ese mismo cliente OAuth.
   - Mantener `AUTH_SESSION_SECRET` como **Secret**. La comprobación de metadatos del 15 de octubre confirmó ese tipo, sin leer el valor. Usar 32 bytes aleatorios seguros, por ejemplo 64 caracteres hexadecimales generados por un gestor de contraseñas. Cambiarlo invalida las sesiones y los intentos de acceso anteriores.
   - Mantener `TURNSTILE_SECRET_KEY` como **Secret**. `GOOGLE_CLIENT_ID` ya puede permanecer como Secret; la aplicación lo admite.
   - No enviar los valores por chat, pegarlos en código ni incluirlos en capturas.
3. Conservar exclusivamente el correo de propietario ya aprobado en `STAGING_ALLOWED_EMAILS`; comprobar su coincidencia exacta sin ampliar la lista. Cualquier tester adicional requiere aprobación nueva. No usar `*`. Las cuentas que agregues en Google y las permitidas por la app deben coincidir para la prueba.
4. Comprobar Turnstile: sitekey pública `0x4AAAAAAFWfwMwzdORVkoDe`, hostname exacto `venezuelaagro-staging.alvarojuniorcarrerovasquez.workers.dev` y secreto correspondiente. Comprobar que el R2 `venezuelaagro-staging-files` conserva acceso público desactivado.
5. Cuando termines, confirmar que los secretos están guardados y que sigue autorizada únicamente la cuenta de propietario. La migración remota y el despliegue de staging quedan pendientes de ejecución autorizada; todavía no se han realizado en esta preparación.

La lista de testers solo permite entrar en la prueba. **No concede administración.** La administración standalone permanece deshabilitada. Si la necesitas, requiere una decisión separada y una implementación de permisos por identidad Google verificada/ID interno; nunca se concede por correo.

## Destino fijado para el operador

- Cuenta Cloudflare: `5ce31d22b086645c67dab913699edd3f`
- Worker: `venezuelaagro-staging`
- D1: `venezuelaagro-staging`, UUID `95ad0e14-ad7f-4385-bb4e-a869197d30c7`, binding `DB`
- R2 privado: `venezuelaagro-staging-files`, binding `BUCKET`
- Configuración fuente: `wrangler.staging.jsonc`, con `keep_vars=true`
- Variables explícitas en el archivo: `AUTH_MODE=google`, `APP_ORIGIN` igual al origen HTTPS anterior sin barra final, `TURNSTILE_SITE_KEY` igual a la clave pública anterior.

Antes de cualquier operación real, comprobar estos destinos y los nombres/tipos de secretos, sin leer sus valores. `keep_vars` conserva las variables de panel, pero las tres variables explícitas del archivo deben coincidir con el panel. No crear otra base ni otro bucket. No cambiar DNS, acceso de Sites ni producción.

## Comprobación local preparada

Desde la raíz del checkout de autenticación:

```sh
node scripts/check-staging-local.mjs
```

Solo lee configuración, archivos del build y nombres de migraciones. No usa red, no lee credenciales, no migra y no despliega. Su resultado positivo no certifica que el build esté actualizado, que los secretos existan ni que Google funcione en vivo. Usar únicamente el artefacto standalone y su manifiesto de esta preparación reconciliada, nunca el build antiguo de autenticación.

## D1: inspeccionar antes de migrar

Los siguientes comandos son instrucciones para una operación posterior, no un registro de ejecución. Requieren una sesión de Wrangler ya autorizada en la cuenta correcta. No crear tokens ni iniciar nuevas autorizaciones automáticamente.

```sh
export CLOUDFLARE_ACCOUNT_ID=5ce31d22b086645c67dab913699edd3f
export WRANGLER_SEND_METRICS=false
export WRANGLER_WRITE_LOGS=false
./node_modules/.bin/wrangler d1 execute venezuelaagro-staging --config wrangler.staging.jsonc --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Si aparece `d1_migrations`, consultar su historial:

```sh
./node_modules/.bin/wrangler d1 execute venezuelaagro-staging --config wrangler.staging.jsonc --remote --command "SELECT id, name, applied_at FROM d1_migrations ORDER BY id;"
```

- Base realmente vacía, sin tablas de la app: aplicar las **diez** migraciones `0000`–`0009` en orden mediante Wrangler.
- Esquema existente y `0000`–`0007` registrados: aplicar únicamente lo pendiente: CMS `0008_wild_sinister_six.sql` y auth `0009_even_blue_shield.sql`.
- Historial canónico v127 hasta CMS `0008_wild_sinister_six.sql`: falta auth `0009_even_blue_shield.sql`.
- Historial canónico completo hasta `0009`: no repetir migraciones.
- Historial antiguo con auth `0008_even_blue_shield.sql`: detenerse; requiere reconciliación específica revisada, sin renombrar una migración aplicada ni inventar historial.
- Tablas existentes sin historial, historial de otro migrador (`__drizzle_migrations`) o diferencias de nombres/orden: detenerse y reconciliar esquema e historial. No inventar registros de migración, no borrar tablas y no aplicar SQL a ciegas. Tener cero filas no significa que falte el esquema.

**Solo después de autorización de escritura en esta D1 de staging y de la inspección anterior:**

```sh
./node_modules/.bin/wrangler d1 migrations apply venezuelaagro-staging --config wrangler.staging.jsonc --remote
```

Revisar la lista propuesta antes de confirmar. Repetir las consultas de tablas e historial para verificar las nueve entradas y la presencia de `users`, `auth_identities`, `auth_sessions`, `auth_transactions`. Ante un fallo parcial, inspeccionar de nuevo; no borrar ni reejecutar archivos manualmente. El archivo `drizzle/meta/_journal.json` describe migraciones locales, no prueba lo aplicado remotamente.

## Build y publicación posterior de staging

Solo cuando el código/configuración hayan cambiado o falte el artefacto revisado:

```sh
npm run build:staging
node scripts/check-staging-local.mjs
```

Usar siempre el build **standalone**. El build normal es la variante Sites y no debe publicarse como Worker directamente accesible. El código de autenticación no se cambia seleccionando una variable del panel: su frontera de confianza se decide durante el build. El acceso actual de Sites se conserva sin cambios.

El despliegue usa el archivo **generado**, que incluye el Worker compilado y los assets; las migraciones usan la configuración **fuente** para resolver `drizzle` desde la raíz correcta.

**Solo después de autorizar publicar esta versión en staging**, con secretos seguros, testers aprobados y migraciones verificadas:

```sh
export CLOUDFLARE_ACCOUNT_ID=5ce31d22b086645c67dab913699edd3f
./node_modules/.bin/wrangler deploy --config dist/server/wrangler.json --keep-vars
```

No ejecutar un `wrangler deploy` genérico ni desplegar directamente `worker/index.ts`. Si se reemplazó el build con la variante Sites, detenerse y reconstruir standalone. Verificar después el Worker/version desplegado y que DB, BUCKET, variables y nombres/tipos de secretos se conservaron; no inspeccionar los valores secretos.

## Qué falta probar en vivo

- Google: entrar, cancelar, reintentar, cuenta no permitida y colisión de correo con cuenta anterior.
- Turnstile: éxito, caducidad y fallo; logout por POST y sesión realmente revocada.
- Dos cuentas distintas en móviles reales: datos, archivos y cola offline aislados; un fallo de sincronización conserva cambios pendientes.
- Cabeceras Sites falsificadas no autentican; fallos del proveedor o D1 cierran el acceso de forma segura.
- La variante de Sites sigue funcionando con su acceso habitual.

Las pruebas locales usan proveedores simulados y SQLite local, no constituyen una integración real. Los resultados de la versión reconciliada se documentan con el artefacto final. No se ha hecho en esta preparación login real, migración remota, modificación de secretos, despliegue ni concesión de permisos.

## Advertencia conocida sobre el secreto de Google

El secreto de cliente Google fue compartido previamente en la conversación. Se recomendó sustituirlo y desactivar el anterior; el usuario decidió continuar sin rotarlo. No se conserva ni reproduce su valor aquí. Esa decisión no elimina el riesgo de exposición. La comprobación de metadatos solo verifica nombres y tipos, nunca validez, fortaleza o rotación del contenido.

## Referencias

- [Guía técnica del repositorio](PORTABLE-GOOGLE-STAGING.md)
- [Migraciones D1](https://developers.cloudflare.com/d1/reference/migrations/)
- [Comandos D1](https://developers.cloudflare.com/d1/wrangler-commands/)
- [Configuración de Wrangler](https://developers.cloudflare.com/workers/wrangler/configuration/)
