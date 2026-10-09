# Configuración de referencia

- `hosting.preview.reference.json`: configuración exacta de la previsualización privada aprobada para revisión. Su identificador no corresponde al sitio de producción. Se conserva como referencia de la versión; no debe aplicarse automáticamente a otro destino.
- `hosting.static.example.json`: ejemplo de salida estática. No contiene una identidad de proyecto y no es una autorización ni una configuración completa de publicación.

El sitio de producción no se ha modificado. En otro alojamiento, servir el contenido de `dist/` desde la raíz pública y configurar el acceso y el dominio en ese proveedor.
