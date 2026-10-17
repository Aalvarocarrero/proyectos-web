# Secuencia de instalación e ideas

Revisión solicitada tras la prueba física del usuario en iPhone. La captura mostró que los antiguos controles inferiores derechos se superponían a las llamadas principales.

1. El aviso de aplicación aparece primero, con instrucciones adecuadas a teléfono, tableta o computadora. Un evento nativo real habilita el botón de instalar; de lo contrario se ofrecen instrucciones condicionales de acceso directo.
2. Permanece cinco segundos de tiempo visible sin interacción. Foco, puntero, toque, instrucciones abiertas, instalación nativa, otro diálogo o pestaña oculta pausan el contador.
3. Se reduce mediante una animación breve de 240 ms al círculo «Aplicación», abajo a la izquierda. El círculo permite volver a abrir el aviso. Movimiento reducido omite la animación.
4. Solo después de terminar se habilita la invitación de ideas. Conserva el texto y la foto aprobados. No se cierra automáticamente.
5. Al cerrarla, se reduce al círculo «Ideas», arriba a la derecha, debajo de la cabecera. Volver a abrir conserva el formulario mientras la página siga abierta.

Las preferencias anteriores de cierre y la frecuencia de siete días se respetan. Una aplicación ya instalada omite el aviso de instalación. Las redes sociales permanecen en el menú principal y el pie, sin otro círculo inferior que tape los botones del inicio.

Verificación sintética: contadores pausados/reanudados, pestaña oculta durante más de dos minutos, carreras entre pestañas, frecuencia, cierre, limpieza de listeners y entrega de eventos. La validación física de posición, teclado y animación en el teléfono del usuario sigue siendo distinta de las pruebas de código.

No se configura la página inicial del navegador ni se instala nada automáticamente. Un icono no implica que los datos o toda la plataforma estén descargados sin conexión.
