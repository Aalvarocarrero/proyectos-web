# Venezuela Agro / Parcela Los Morochos

Copia de fuente preparada el 9 de octubre de 2026.

Requiere Node.js >=22.13.0 y GNU timeout. Comandos existentes: npm run install:ci; npm run dev; npm run build; npm run lint; npm test. No se ejecutaron instalaciones ni compilaciones al preparar esta copia.

Conservar build/sites-vite-plugin.ts: es código fuente necesario, no una carpeta de salida prescindible. El despliegue necesita autenticación Sites, D1 (DB) y R2 (BUCKET). Esta copia NO incluye registros de la base de datos, archivos subidos por usuarios ni secretos de ejecución.

Conservar créditos fotográficos y licencias en lib/site-photos.ts, app/creditos-fotograficos, public/licenses y vendor. Los mapas conservan atribución OpenStreetMap/ODbL y Protomaps. Algunas fotografías son CC BY-SA: conservar sus avisos y los cambios documentados.

BACKUP-INVENTORY.json documenta el commit original, archivos, tamaños, huellas SHA-256 y exclusiones. Sin historial Git.
