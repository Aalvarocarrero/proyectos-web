# Invitación de ideas en móvil

Problema reportado por el usuario en su teléfono: el popup no aparecía, aunque sí se veía en ordenador.

Ruta defectuosa confirmada en v32: en iPhone/iPad el aviso de instalación se muestra al abrir; a los nueve segundos, la invitación de ideas se cancelaba por ese aviso y no reintentaba. En pantallas estrechas el botón flotante también quedaba oculto durante el aviso.

Correcciones:
- El aviso pasivo de instalación ya no impide mostrar la invitación de ideas.
- Si el usuario escribe, hay otro diálogo, la pestaña está oculta o se están consultando instrucciones de instalación, la invitación espera y reintenta sin consumir su frecuencia semanal.
- El aviso de instalación incluye un botón visible «Compartir mi idea», disponible cuando oculta el botón flotante.
- El diálogo sigue el viewport visible al abrir el teclado; mantiene cabecera de cierre y contenido desplazable.
- Foto, texto aprobado, cierre/Escape, texto conservado al cerrar y frecuencia de siete días permanecen iguales. No se borra ninguna preferencia ni dato del navegador.

Verificación: 121/121 pruebas automatizadas aprobadas, incluidas interrupción/reintento, frecuencia, limpieza del temporizador y disponibilidad del acceso manual. Compilación y TypeScript correctos. El worker y manifiesto reciben una nueva huella de despliegue para renovar recursos.

Pendiente: confirmación visual en el teléfono físico del usuario. El navegador cloud disponible no ofrece ajuste documentado de viewport ni emulación iPhone; estas pruebas no sustituyen esa comprobación.

Prueba sugerida tras abrir la versión actual: en la página inicial, esperar unos segundos; si ya se cerró esta invitación recientemente, usar «Compartir mi idea» en el aviso de instalación o el botón flotante. Cerrar debe conservar el texto mientras la página siga abierta. No es necesario enviar una idea de prueba ni borrar cachés.
