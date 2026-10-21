# REA — archivo de código fuente

Fuente: https://github.com/morluto/rea
Commit fijado: 52415975942a4b9c53a817915b313ccc404f280e
Fecha de archivo: 2026-10-21 (UTC)
Licencia raíz: MIT, copyright (c) 2026 morluto.

## Contenido real
Este directorio conserva el snapshot oficial de GitHub de los 5.007 archivos del repositorio principal, completo y comprimido, dividido en dos partes por el límite de transporte de la herramienta. No contiene sólo enlaces o documentación. Los avisos de terceros permanecen dentro del archivo, incluida la carpeta licenses. MANIFEST.json enumera cada archivo y su SHA-256.

Las cinco referencias a submódulos están documentadas en SUBMODULES.json y .gitmodules dentro del snapshot. Sus repositorios externos no están incorporados ni instalados. Tampoco se incluye el historial Git, paquetes descargados o credenciales. No confundir código fuente archivado con una instalación funcional y sus dependencias.

## Recuperar el snapshot
Concatenar en orden rea-source.tar.gz.part01 y rea-source.tar.gz.part02 para obtener rea-source.tar.gz. El tamaño final debe ser 15.168.565 bytes y su SHA-256:
8aca117cfd4552c120e46f76a6cbd0644497552f4c7f2092beb3be665ab2a02a

Después verificar el hash y extraer con una herramienta TAR/GZIP. Extraer no instala ni ejecuta el proyecto.

## Verificación y alcance
Se verificaron los 5.007 blobs contra el árbol del commit fuente; tres fixtures .cmd reciben CRLF en el archivo oficial según .gitattributes y coinciden con Git al normalizarlos a LF. El manifiesto describe los bytes reales del archivo descargado.
No se ejecutó REA, scripts de configuración, npm, MCP, herramientas de ingeniería inversa ni pruebas del programa. Esto es un archivo de conservación, no una skill activada ni un dictamen de seguridad. Revisar licencia y avisos de cada componente antes de adaptar o distribuir. Usar sólo sobre recursos propios o con autorización, respetando accesos y licencias; este archivo no autoriza copiar cualquier plataforma ni eludir protecciones.

La rama de archivo no fusiona, despliega ni modifica la configuración activa del repositorio anfitrión.
