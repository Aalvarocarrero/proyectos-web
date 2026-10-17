import type { KnowledgeArticle } from '@/lib/articles';

type GuideInput = {
  slug: string; title: string; description: string; emoji: string;
  target: string; label: string; screen: string; fields: Array<[string, string]>;
  steps: Array<[string, string]>; tip: string; result: string;
  form?: 'listing' | 'professional' | 'plan';
};

// Labels match the source interface reviewed on 15 October 2026.
// These are educational diagrams, not screenshots or recorded demonstrations.
const inputs: GuideInput[] = [
  {
    "slug": "fincas-comunidad",
    "title": "Presenta tu finca y participa en la comunidad",
    "description": "Distingue tu ficha pública del registro privado y comparte novedades del campo.",
    "emoji": "🌿",
    "target": "/fincas#registrar-finca",
    "label": "Registrar mi ficha pública",
    "screen": "Ficha pública de la finca",
    "fields": [
      [
        "Nombre de la finca",
        "Tu finca"
      ],
      [
        "Responsable y teléfono",
        "Contacto que autorizas publicar"
      ],
      [
        "Actividades",
        "Producción / Visitas / Capacitaciones"
      ]
    ],
    "steps": [
      [
        "Registra tu ficha pública",
        "Abre Fincas y completa nombre, responsable, teléfono, estado, municipio, descripción, rubros y actividades. Añade fotografía o logo y redes si quieres. Tu plano privado, inventario y costos no se copian a la ficha pública."
      ],
      [
        "Espera la revisión",
        "Guarda la ficha y autoriza el contenido público. Si estás sin señal queda en este dispositivo. Después de recuperar conexión y acceso se enviará para revisión. Publicar una ficha no verifica titularidad ni sustituye trámites oficiales."
      ],
      [
        "Comparte una novedad",
        "Después de que tu finca esté publicada, entra en Comunidad y selecciónala como autora. Escribe hasta 500 caracteres sobre cosechas, jornadas o aprendizajes. Las publicaciones y comentarios pasan por revisión. Puedes retirar tu ficha y publicaciones."
      ],
      [
        "Conversa y comercializa",
        "En publicaciones reales puedes dar Me gusta, comentar y compartir enlaces. Las muestras no reciben interacciones reales. Para vender productos, animales o la propiedad crea además un anuncio en Mercado Agro. Coordina visitas directamente con el responsable."
      ]
    ],
    "tip": "Las fichas y conversaciones públicas necesitan conexión para recibir novedades. Puedes guardar cambios e interacciones pendientes sin señal después de preparar tu dispositivo e iniciar sesión.",
    "result": "Ficha pendiente de envío o revisión"
  },
  {
    "slug": "primeros-pasos-registro",
    "title": "Comienza: acceso, cuenta y tus datos",
    "description": "Ubica las herramientas, consulta la conexión y distingue el trabajo local de tu cuenta.",
    "emoji": "👋",
    "target": "/app",
    "label": "Abrir Mi Finca",
    "screen": "Menú y primer acceso",
    "fields": [
      [
        "Accesos principales",
        "Mi finca · Mercado Agro · Profesionales"
      ],
      [
        "También a mano",
        "Aprende · Comunidad"
      ],
      [
        "Menú agrupado",
        "Gestionar · Comprar y buscar apoyo · Participar"
      ],
      [
        "Estado de red",
        "Icono Wi-Fi / Conexión en la cabecera"
      ]
    ],
    "steps": [
      [
        "Encuentra la herramienta que necesitas",
        "La cabecera da acceso a Mi finca, Mercado Agro, Profesionales, Aprende y Comunidad. En el teléfono, abre el botón de menú: esas cinco opciones aparecen primero. Debajo puedes desplegar Gestionar mi finca, Comprar y buscar apoyo y Conocer y participar. Allí están Descargar sin señal, Fincas de Venezuela, Productos Parcela Los Morochos, Empresas e insumos, Instituciones, Proyectos, Stickers del agro, Nuestra producción y Nosotros. Accesibilidad, las opciones de cuenta y las redes oficiales siguen en el menú."
      ],
      [
        "Decide cómo empezar",
        "Mi Finca puede abrir en modo local para guardar en este dispositivo. Para publicar en Mercado Agro, enviar tu perfil profesional y usar respaldo central, inicia sesión con la cuenta de ChatGPT mediante el acceso disponible. El acceso de cuenta inicial necesita internet."
      ],
      [
        "Revisa Seguridad y privacidad",
        "Lee el aviso de datos, confirma el correo de tu cuenta y agrega tu celular obligatorio. Esta confirmación compara el dato; no envía códigos por correo o SMS. Autoriza el contenido público si deseas publicar un anuncio o un perfil profesional. Los registros internos de la finca y el contacto público tienen usos diferentes; completa únicamente lo que quieres mostrar."
      ],
      [
        "Distingue conexión y guardado",
        "Toca el icono Wi-Fi o Conexión junto a Mi finca en la cabecera pública para ver red y detalles de guardado. Con conexión solo significa que el navegador detecta red: no confirma el envío ni una copia central. Dentro de Mi Finca usa su control de estado y Sincronización para comprobar pendientes, incidencias y confirmaciones del servidor. Finca Escuela es una práctica separada y no consulta estos registros."
      ]
    ],
    "tip": "No necesitas una cuenta para consultar las áreas públicas. La cuenta es necesaria para enviar publicaciones y respaldos al servidor.",
    "result": "Espacio local o cuenta: comprueba cuál usas"
  },
  {
    "slug": "trabajar-sin-internet",
    "title": "Trabaja sin internet y entiende la sincronización",
    "description": "Prepara tu dispositivo, guarda en campo y comprueba el envío cuando vuelva la señal.",
    "emoji": "📶",
    "target": "/app?vista=sync",
    "label": "Abrir Sincronización",
    "screen": "Sincronización",
    "fields": [
      [
        "Cabecera pública",
        "Icono Wi-Fi / Conexión"
      ],
      [
        "Sin conexión",
        "Solo datos y recursos preparados"
      ],
      [
        "Cambios pendientes",
        "No equivalen a un respaldo confirmado"
      ],
      [
        "Mi Finca",
        "Abrir Sincronización y revisar el estado"
      ]
    ],
    "steps": [
      [
        "Prepara el equipo con señal",
        "Abre la plataforma, Mi Finca y Descargar sin señal antes de salir al campo. En la biblioteca, prepara los recursos y comprueba el resultado de la descarga en ese navegador. Instalar la app web no descarga por sí solo todos los contenidos. Haz una prueba breve sin señal antes de depender de ella."
      ],
      [
        "Registra como siempre",
        "Puedes crear animales, pesajes, áreas, ciclos e inventario sin señal. Los formularios de anuncios y perfiles pueden quedar pendientes de envío si ya estaban cargados. Guardar escribe primero en el dispositivo."
      ],
      [
        "Recupera señal y conserva la app abierta",
        "Al recuperar internet, mantén la app abierta y la sesión disponible si usas una cuenta. Mi Finca intenta sincronizar al volver la señal, al regresar a la aplicación y periódicamente mientras está abierta. En modo local no se confirma un respaldo de cuenta. Las publicaciones públicas también requieren autorización y revisión."
      ],
      [
        "Comprueba el estado real",
        "El icono de conexión está en la cabecera pública, junto a Mi finca; ya no ocupa el centro inferior de la pantalla. Tócalo para leer los detalles. Dentro de Mi Finca abre Sincronización y comprueba pendientes, conflictos y confirmaciones. Con conexión o cero cambios pendientes no bastan para demostrar que exista una copia central. Si hay un error de acceso o consentimiento, resuélvelo antes de dar el envío por terminado."
      ]
    ],
    "tip": "Sin internet puedes trabajar con datos locales y contenidos guardados. No puedes consultar novedades ni contactar por servicios en línea hasta recuperar conexión. El dispositivo necesita batería; una app cerrada no garantiza sincronización en segundo plano.",
    "result": "Revisa pendientes y respuesta del servidor"
  },
  {
    "slug": "instalar-iphone-android",
    "title": "Instala la app web en iPhone, Android o computador",
    "description": "Usa la misma plataforma desde un icono, sin descargarla de una tienda de aplicaciones.",
    "emoji": "📱",
    "target": "/plataforma#instalar",
    "label": "Ver opciones de instalación",
    "screen": "Venezuela Agro · app web",
    "fields": [
      [
        "iPhone / iPad",
        "Safari → Compartir → Agregar a Inicio"
      ],
      [
        "Android",
        "Chrome → Menú → Instalar aplicación"
      ],
      [
        "Ordenador",
        "Navegador → Instalar app"
      ]
    ],
    "steps": [
      [
        "En iPhone o iPad",
        "Abre el sitio en Safari, toca Compartir y elige Agregar a Inicio o Añadir a pantalla de inicio, según tu versión. Si aparece la opción Abrir como app web, actívala y confirma Agregar. Abre después el nuevo icono."
      ],
      [
        "En Android",
        "Abre el sitio en Chrome. Acepta Instalar aplicación si se ofrece; también puedes abrir el menú y buscar Agregar a la pantalla principal o Instalar. Sigue los pasos del navegador."
      ],
      [
        "En computador",
        "En Chrome o Edge busca la opción de instalar en el menú o barra de direcciones. En Safari para Mac, si está disponible, utiliza Añadir al Dock. Si tu navegador no instala apps, puedes usar la web normalmente."
      ],
      [
        "Prueba antes de ir al campo",
        "Entra a Mi Finca, consulta los recursos necesarios y luego haz una prueba breve sin señal. Usa siempre el mismo navegador o la app instalada para acceder al espacio que preparaste."
      ]
    ],
    "tip": "La versión disponible es una aplicación web progresiva (PWA). No estamos ofreciendo todavía archivos nativos ni una descarga en App Store o Google Play.",
    "result": "Acceso desde el icono de la app web"
  },
  {
    "slug": "crear-plano-de-mi-finca",
    "title": "Crea tu finca y su plano inicial",
    "description": "Registra tu propia ubicación, linderos y coordenadas sin copiar datos de otra finca.",
    "emoji": "🗺️",
    "target": "/app?vista=settings",
    "label": "Crear mi finca",
    "screen": "Configura tu finca",
    "fields": [
      [
        "Nombre de la finca",
        "Nombre de tu propiedad"
      ],
      [
        "Forma del perímetro",
        "Irregular / polígono"
      ],
      [
        "Estado",
        "Apure · ejemplo"
      ],
      [
        "Coordenadas",
        "Este y Norte de cada vértice"
      ]
    ],
    "steps": [
      [
        "Pon nombre y ubicación",
        "Abre Mi Finca. Completa el nombre, ubicación y objetivo de tu unidad productiva. Selecciona el estado correspondiente; el mapa resaltará esa ubicación."
      ],
      [
        "Elige la forma real",
        "Selecciona Irregular / polígono, Rectángulo, Triángulo u Óvalo. Introduce las medidas que correspondan a tu propiedad. Un terreno irregular necesita datos de su perímetro; una superficie total no describe por sí sola todos sus lados."
      ],
      [
        "Transcribe el plano que tienes",
        "En los datos técnicos puedes agregar vértices, coordenadas Este y Norte, datum, zona UTM, linderos, ubicación y otras referencias. Mantén el orden de los vértices y el mismo sistema de coordenadas. El sistema calcula el área cuando hay un polígono válido."
      ],
      [
        "Guarda y revisa el dibujo",
        "Toca Crear plano y espacio de trabajo. Abre Territorio / planos y compara el perímetro con tu documento. Puedes corregir los datos desde Configurar finca."
      ]
    ],
    "tip": "El plano digital sirve para organización interna. No constituye un plano legal certificado ni sustituye un levantamiento topográfico.",
    "form": "plan",
    "result": "Plano guardado en tu espacio de Mi Finca"
  },
  {
    "slug": "dividir-potreros-lagunas-cultivos",
    "title": "Divide potreros, ubica lagunas y agrega cultivos",
    "description": "Distribuye las áreas de la finca en un plano movible y personalizable.",
    "emoji": "🌱",
    "target": "/app?vista=land",
    "label": "Abrir Plano y potreros",
    "screen": "Agregar al plano",
    "fields": [
      [
        "Tipo de área",
        "Potrero / Cultivo / Laguna"
      ],
      [
        "Nombre",
        "Potrero norte · ejemplo"
      ],
      [
        "Cultivo",
        "Cacao · ejemplo"
      ],
      [
        "Superficie",
        "Medida de tu área"
      ]
    ],
    "steps": [
      [
        "Abre Territorio / planos",
        "Después de crear la finca, entra en el plano. Verás el área total, las divisiones registradas y la superficie disponible. No hay animales ni cultivos precargados en tu finca."
      ],
      [
        "Agrega un área",
        "Elige potrero, cultivo, laguna / agua, casa, vaquera / corrales, galpón, depósito, bosque, vía u otro uso. Pon un nombre y su superficie. Si es cultivo, selecciona el rubro o escribe otro y añade la variedad si la conoces."
      ],
      [
        "Colócala donde corresponde",
        "Mueve el área en el plano con el ratón o con el dedo. Ajusta la distribución para representar su ubicación aproximada. Selecciona una división para revisar o editar sus datos; utiliza Dividir cuando necesites separar un área."
      ],
      [
        "Revisa antes de planificar",
        "Comprueba las superficies y las áreas disponibles antes de agregar más divisiones. Usa nombres fáciles de reconocer: Potrero norte, Cacao 1 o Laguna principal. Guarda los cambios en tu dispositivo."
      ]
    ],
    "tip": "La posición movible es una referencia de organización; no convierte una laguna o un potrero en un lindero legal ni garantiza precisión geográfica.",
    "result": "Áreas organizadas en tu plano privado"
  },
  {
    "slug": "registrar-animales-pesajes",
    "title": "Registra animales y su historial de peso",
    "description": "Identifica cada animal y conserva fecha de nacimiento, propósito y pesajes.",
    "emoji": "🐄",
    "target": "/app?vista=animals",
    "label": "Abrir Animales",
    "screen": "Registrar pesaje",
    "fields": [
      [
        "Animal",
        "Selecciona la identificación correcta"
      ],
      [
        "Peso (kg)",
        "Kilogramos medidos"
      ],
      [
        "Fecha",
        "Fecha de la medición"
      ],
      [
        "Observaciones",
        "Contexto útil del pesaje"
      ]
    ],
    "steps": [
      [
        "Crea la identificación",
        "En Animales toca registrar animal. Selecciona especie o escribe otra y utiliza un arete, código o nombre que no se confunda con otros."
      ],
      [
        "Completa lo que sabes",
        "Añade raza, sexo, nacimiento, peso inicial, propósito y observaciones según los campos disponibles. No inventes una fecha ni un peso si no lo conoces."
      ],
      [
        "Elige el animal antes de pesar",
        "El botón general Registrar pesaje abre la selección de Animal vacía: elige el arete, código o nombre correcto, aunque hayas usado el buscador. El botón de peso de una fila conserva la selección de ese animal. Completa Peso (kg), Fecha y Observaciones; Guardar pesaje se habilita cuando hay un animal elegido. Revisa la identidad antes de guardar."
      ],
      [
        "Consulta y corrige",
        "Abre la ficha para comprobar los datos. Si registraste un ejemplo por error, utiliza la opción de eliminar y comprueba después el estado de sincronización."
      ]
    ],
    "tip": "Registra medidas reales. Las estimaciones de manejo y sanidad se deben ajustar con el profesional que acompaña tu producción.",
    "result": "Pesaje asociado al animal que elegiste"
  },
  {
    "slug": "produccion-inventario-costos",
    "title": "Organiza producción, inventario, sanidad y costos",
    "description": "Une tus ciclos, insumos y movimientos para entender mejor tu finca.",
    "emoji": "📊",
    "target": "/app?vista=production",
    "label": "Abrir el centro de control",
    "screen": "Nuevo ciclo productivo",
    "fields": [
      [
        "Nombre del ciclo",
        "Cosecha de maíz · ejemplo"
      ],
      [
        "Categoría",
        "Maíz"
      ],
      [
        "Estado",
        "Planificado / Activo / Finalizado"
      ],
      [
        "Fecha prevista de cierre",
        "Tu planificación"
      ]
    ],
    "steps": [
      [
        "Crea un ciclo",
        "En Producción toca nuevo ciclo productivo, pon un nombre y rubro, fechas, estado y objetivo. Abre luego el registro guardado para revisar o editarlo. Los cultivos y especies del catálogo son sugerencias; puedes usar otros."
      ],
      [
        "Lleva el inventario",
        "En Inventario registra artículo, categoría, cantidad, unidad, mínimo y ubicación. Consulta cada registro y documenta los cambios de existencias."
      ],
      [
        "Anota costos y controles",
        "En Planificación y costos registra cantidades y supuestos de alimento, agua, área y costos. En finanzas anota movimientos y referencias de factura; en sanidad registra eventos, fechas y profesional responsable."
      ],
      [
        "Interpreta tus resultados",
        "Revisa los totales y gráficas basados en tus propios datos. Ajusta supuestos antes de tomar decisiones. Una estimación de ingreso no es una promesa de rentabilidad."
      ]
    ],
    "tip": "Los parámetros deben adaptarse al lugar, especie y sistema productivo. No se generan recetas de medicamentos ni rendimientos garantizados.",
    "result": "Registros basados en tus propios datos"
  },
  {
    "slug": "publicar-vender-mercado-agro",
    "title": "Publica y comercializa en Mercado Agro",
    "description": "Publica con precio opcional y compara importes conservando moneda, unidad, fuente y fecha.",
    "emoji": "🛒",
    "target": "/marketplace/publicar",
    "label": "Crear una publicación",
    "screen": "Precio y moneda del anuncio",
    "fields": [
      [
        "Precio por unidad (opcional)",
        "Vacío si todavía está por acordar"
      ],
      [
        "Moneda original",
        "USD · VES · COP · EUR"
      ],
      [
        "Referencia visible",
        "Dólares y bolívares cuando hay tasa"
      ],
      [
        "Fuentes y otras monedas",
        "Consulta EUR o COP y la fecha de la tasa"
      ],
      [
        "Contacto público",
        "Responsable y teléfono con código de país"
      ]
    ],
    "steps": [
      [
        "Accede y autoriza la publicación",
        "Abre Mercado Agro y toca Publicar un producto. Inicia sesión y revisa Seguridad y privacidad para autorizar el contenido público."
      ],
      [
        "Describe el producto y su precio",
        "Completa rubro, ubicación, presentación, unidad y pedido mínimo. Precio por unidad es opcional: déjalo vacío si aún no hay un importe acordado; no escribas cero para decir a consultar. Si indicas un precio, elige su moneda original: USD, VES, COP o EUR. Los equivalentes en dólares y bolívares son referencias; los botones EUR y COP y Fuentes y otras monedas permiten consultar más detalle. El precio y la unidad originales no se cambian."
      ],
      [
        "Revisa imagen, contacto y referencias",
        "Añade una fotografía propia y describe disponibilidad y condiciones. Completa responsable y teléfono; publica solo referencias de ubicación que quieras mostrar. Antes de comparar importes, revisa la fuente, Fecha de la tasa y Última consulta a la fuente: BCV para bolívares, BCE para euros y TRM Colombia para pesos. Una tasa anterior o sin conexión se presenta como estimada; si falta una tasa verificada, la conversión no está disponible. Sin precio publicado puedes convertir un importe recibido, pero eso no fija el precio del anuncio."
      ],
      [
        "Guarda y espera la revisión",
        "El anuncio se envía a revisión con internet. Sin conexión queda guardado y pendiente. Cuando esté publicado, los compradores podrán abrir la ficha y contactar. Acuerda disponibilidad, pago y transporte con la otra parte; publicar no completa por sí solo una venta."
      ]
    ],
    "tip": "Los equivalentes son informativos. Confirma moneda de pago, cantidad, unidad, precio final, transporte y condiciones con la otra parte. Una publicación o una conversión no completa una compra.",
    "form": "listing",
    "result": "Anuncio pendiente de envío o revisión"
  },
  {
    "slug": "perfil-profesional-agro",
    "title": "Crea tu perfil profesional del agro",
    "description": "Presenta tu experiencia y, si quieres, publica tarifas separadas por modalidad y unidad.",
    "emoji": "🤝",
    "target": "/profesionales#registro-profesional",
    "label": "Registrar mi perfil profesional",
    "screen": "Tarifas por modalidad (opcional)",
    "fields": [
      [
        "Modalidad",
        "Activa solo la que tenga un costo definido"
      ],
      [
        "Importe",
        "Tarifa original que quieres publicar"
      ],
      [
        "Moneda",
        "USD · VES · COP · EUR"
      ],
      [
        "Precio por",
        "sesión · hora · visita · jornada · curso"
      ],
      [
        "Condiciones",
        "Alcance, traslados, materiales e impuestos"
      ]
    ],
    "steps": [
      [
        "Abre Profesionales",
        "Consulta las tarjetas y toca Ver perfil completo. Las muestras están identificadas. Para registrar el tuyo, inicia sesión y autoriza el contenido público."
      ],
      [
        "Explica cómo ayudas",
        "Completa nombre, profesión, especialidades, estado, municipio, modalidad, etapa y años de experiencia. Puedes comenzar con cero años. Elige rubros y otros estados donde atiendes. Puedes registrarte como persona natural o empresa; para una empresa añade razón social, nombre comercial y registro declarado."
      ],
      [
        "Añade trayectoria y tarifas opcionales",
        "Completa fotografía, formación, servicios y proyectos sin datos privados de clientes. Abre Tarifas por modalidad (opcional) y activa solo las modalidades para las que quieras publicar un costo. Para cada una indica Importe, Moneda y Precio por; también existen proyecto y hectárea. Las modalidades sin tarifa quedan a consultar. En ¿Cómo se reserva tu servicio? explica alcance, traslados, materiales, impuestos y condiciones."
      ],
      [
        "Revisa y envía tu perfil",
        "Comprueba contacto, trayectoria y cada tarifa antes de enviar a revisión. Las conversiones en USD, VES, COP y EUR son referencias: consulta fuente y fecha, conserva el importe original y confirma el acuerdo directamente. Si el perfil no tiene tarifas, se muestra Precio a consultar y puedes convertir un importe recibido sin publicarlo como tarifa. Tras la aprobación, comparte el enlace de tu ficha; la plataforma no contrata ni cobra el servicio por ti."
      ]
    ],
    "tip": "Incluye solo formación y experiencia que puedas respaldar. La publicación no equivale a una certificación de títulos o permisos.",
    "form": "professional",
    "result": "Perfil pendiente de envío o revisión"
  },
  {
    "slug": "comprar-tienda-los-morochos",
    "title": "Compra a Parcela Los Morochos o solicita suministro empresarial",
    "description": "Elige hogar o negocio, personaliza cortes y conserva tu contacto mientras revisas la solicitud.",
    "emoji": "🥩",
    "target": "/tienda",
    "label": "Abrir la tienda Parcela Los Morochos",
    "screen": "Tu solicitud de productos",
    "fields": [
      [
        "Para quién compras",
        "Para mi hogar / Para mi negocio"
      ],
      [
        "Producto",
        "Elegir presentación"
      ],
      [
        "Detalle",
        "Corte, cantidad, unidad y preparación"
      ],
      [
        "Contacto",
        "Responsable, celular y correo opcional"
      ],
      [
        "Envío",
        "Solicitar disponibilidad / cotización"
      ]
    ],
    "steps": [
      [
        "Elige hogar o negocio",
        "En el menú abre Comprar y buscar apoyo y después Productos Parcela Los Morochos. La tienda corresponde a la finca; Mercado Agro reúne anuncios de otros productores. Selecciona Para mi hogar o Para mi negocio antes de preparar la consulta. Los productos, fotos y líneas en desarrollo no confirman existencias."
      ],
      [
        "Personaliza cada producto",
        "Toca Elegir presentación, elige corte o presentación, cantidad, unidad y preparación. Puedes combinar varios cortes. Abre Solicitud o Cotización para revisarlos; Editar corte y cantidad permite corregir una línea. El contacto, los datos del negocio, la entrega y las notas permanecen al editar o cerrar y reabrir la solicitud mientras sigas en esta página; recargar o salir puede perder ese texto todavía no enviado."
      ],
      [
        "Completa contacto y logística",
        "Indica Nombre del responsable, Celular / WhatsApp y correo opcional. Para un negocio añade nombre, tipo, ciudad y estado de entrega; puedes indicar frecuencia, fecha y modalidad de entrega. Usa Destino, fecha y otras indicaciones para precisar lo necesario. No se calcula un total porque los precios se confirman después. Si recibes una cotización, Convertir un importe recibido convierte exactamente esa cifra: no la multiplica por la cantidad ni fija un precio por unidad."
      ],
      [
        "Guarda y comprueba el resultado",
        "Pulsa Solicitar disponibilidad o Solicitar cotización empresarial. El formulario se bloquea mientras guarda y conserva los datos si el guardado falla. Tras guardar la solicitud correctamente, el contacto del formulario se vacía. Lee si quedó enviada o guardada en este dispositivo y pendiente de envío; después la finca confirmará cortes, disponibilidad, precio, peso final y entrega. No se hace un cobro automático."
      ]
    ],
    "tip": "La solicitud es una consulta comercial: no representa un cobro automático ni una confirmación de inventario.",
    "result": "Solicitud guardada; disponibilidad por confirmar"
  },
  {
    "slug": "proyectos-alianzas-instituciones",
    "title": "Propón proyectos, alianzas y mejoras",
    "description": "Encuentra la sección indicada para compartir una idea o pedir orientación.",
    "emoji": "💡",
    "target": "/proyectos#presentar-proyecto",
    "label": "Crear una propuesta",
    "screen": "Cuéntanos tu proyecto",
    "fields": [
      [
        "Nombre del proyecto",
        "Tu idea para el agro"
      ],
      [
        "Qué tienes",
        "Recursos disponibles"
      ],
      [
        "Qué necesitas",
        "Apoyo o alianzas"
      ],
      [
        "Aporte a Venezuela",
        "Impacto esperado"
      ]
    ],
    "steps": [
      [
        "Presenta un proyecto",
        "En el menú, despliega Conocer y participar y abre Proyectos. Responde de qué se trata, qué tienes, qué necesitas, aporte a tu comunidad y apoyo solicitado. La propuesta necesita revisión antes de hacerse pública."
      ],
      [
        "Encuentra orientación",
        "En Comprar y buscar apoyo abre Instituciones y consulta temas y enlaces de registros, tierra, sanidad y movilización. Leer una guía no inicia un trámite. Verifica requisitos vigentes directamente con la entidad antes de actuar."
      ],
      [
        "Propón una mejora",
        "Usa Tu idea para decir en qué área hace falta una herramienta, explicar tu sugerencia y añadir contacto opcional. Lee el resultado del formulario para distinguir guardado local y envío; no des por recibida una propuesta solo porque el navegador tenga conexión."
      ],
      [
        "Conecta con la comunidad",
        "Explora Profesionales, Mercado Agro y alianzas. Las propuestas no garantizan inversión o asistencia; ayudan a hacer visible una necesidad y abrir conversaciones."
      ]
    ],
    "tip": "Puedes sugerir nuevos rubros y herramientas. La plataforma se amplía con el conocimiento de productores, técnicos y especialistas.",
    "result": "Propuesta pendiente; consulta requisitos vigentes"
  },
  {
    "slug": "finca-escuela-cultivos-animales",
    "title": "Explora Cultivos y Animales en Finca Escuela",
    "description": "Elige un recorrido, completa actividades de práctica y revisa un cuaderno separado de tu finca real.",
    "emoji": "🌱",
    "target": "/juego-finca",
    "label": "Abrir Finca Escuela",
    "screen": "Cultivos y Animales · Finca Escuela",
    "fields": [
      [
        "Inicio",
        "Elige qué quieres descubrir"
      ],
      [
        "Cultivos",
        "Cilantro · Maíz · Tomate"
      ],
      [
        "Animales",
        "Bovinos · Porcinos · Aves"
      ],
      [
        "Cuaderno",
        "Progreso y registros ficticios de práctica"
      ]
    ],
    "result": "Progreso educativo local, sin registros reales",
    "steps": [
      [
        "Elige Cultivos o Animales",
        "Abre Finca Escuela. En Inicio verás dos grupos: Cultivos y Animales. También puedes usar esos nombres en la navegación superior. Elige cilantro, maíz o tomate; en animales, bovinos, porcinos o aves. Cada recorrido conserva su propio progreso y puedes cambiar de actividad."
      ],
      [
        "Sigue el objetivo del recorrido",
        "El cilantro tiene siete pasos; maíz, nueve; tomate, bovinos, porcinos y aves, ocho. Son ciclos simulados con tiempo acelerado, no calendarios universales ni una certificación. Explorar muestra instrucciones breves; Profundizar añade explicaciones y preguntas para comparar tu razonamiento, conservando el avance. En móvil, la escena queda junto al área de decisiones, que puedes desplazar; los botones Explorar y Profundizar siguen disponibles dentro de la actividad. En Laboratorio: suelo y espacio, Volver a observar permite revisar la misma muestra y regresar a su vista completa sin reiniciar el progreso."
      ],
      [
        "Consulta tu cuaderno",
        "Toca Cuaderno o Ver mi cuaderno para revisar lo aprendido. La cosecha del cilantro y los recorridos de cultivos y animales aparecen en apartados distintos. Un aviso de que aún no cosechaste cilantro se refiere solo a ese cultivo; no significa que perdiste los otros recorridos. Los registros son ficticios y se conservan en este navegador, separados de Mi Finca y de cualquier cuenta."
      ],
      [
        "Practica con seguridad",
        "Puedes volver a explorar un recorrido a tu ritmo. No introduzcas datos personales ni registros reales: el juego no publica, cobra ni sincroniza información con tu finca. En el campo real, una persona menor debe estar acompañada por una persona adulta responsable y observar a los animales desde un lugar seguro. Ante problemas de salud, consulta a un profesional; la actividad no indica medicamentos ni dosis."
      ]
    ],
    "tip": "Esta es una vista previa educativa ilustrada. El progreso depende del almacenamiento de este navegador; si lo borras o cambias de navegador, puede no estar disponible. Las escenas y los ejemplos no sustituyen orientación técnica local."
  }
];

export const platformGuides: KnowledgeArticle[] = inputs.map(input => ({
  slug: input.slug, category: 'Usa la plataforma', emoji: input.emoji,
  title: input.title, description: input.description,
  publishedAt: input.slug === 'finca-escuela-cultivos-animales' ? '2026-10-15' : '2026-10-04',
  updatedAt: '2026-10-15', readMinutes: 5,
  keywords: ['Venezuela Agro', input.title, 'plataforma agropecuaria Venezuela', 'guía paso a paso', ...input.fields.map(([label]) => label)],
  sections: input.steps.map(([heading, text]) => ({heading, paragraphs: [text]})),
  tutorial: {targetHref: input.target, targetLabel: input.label, visual: `/guias/${input.slug}.svg`, screen: input.screen, fields: input.fields, tip: input.tip, result: input.result, form: input.form},
}));
