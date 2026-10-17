# Respaldo fuente v17 autorizado

El usuario autorizó expresamente el respaldo de v17 en una rama nueva del repositorio privado y la actualización posterior de la misma previsualización privada. El hilo principal verificó la reacción de aprobación a la solicitud concreta. Esta operación solo respalda GitHub; el despliegue Sites corresponde al hilo principal mediante su transferencia oficial.

- Repositorio: Aalvarocarrero/proyectos-web.
- Rama: feat/education-science-v17-source.
- Carpeta: aprendizaje-razonamiento.
- Commit de implementación: 9da78202b6ab8abdbe694e9c028158b6bec80ce0.
- Base v16 exacta: 21bf6cc800ff6d09e03f4ea526018a8dd31a54ac.
- Manifiesto: DELIVERY-V17-SHA256.json; 26 archivos de aplicación, 258457 bytes. El campo branch conserva la rama local de procedencia.
- Informes y capturas: docs/evidence-v17.

ENTREGA_V17.md y ARQUITECTURA_V17.md registran el cierre local anterior a esta aprobación; sus referencias a autorización pendiente y ausencia de respaldo corresponden a ese momento. Esta nota registra la autorización posterior, sin afirmar que Sites ya esté actualizado.

No se incluyen ZIP, parches de distribución, dependencias instaladas ni datos de usuarios. Los cambios de v17 se limitan a la carpeta educativa. Se verificaron tamaños, extensiones excluidas, patrones comunes de secretos y las sumas exactas de los archivos de aplicación; esto no es una auditoría de todo el historial del repositorio. No se cambia main, permisos ni workflows ni se ejecutan Actions.

Tras el envío se realiza una clonación nueva de la rama remota y se comparan el manifiesto y todos los archivos modificados, incluidos informes y capturas. El resultado y el commit remoto se comunican en la entrega del agente.
