import { landWaterGuides } from "@/lib/land-water-guides";

export type KnowledgeArticle = {
  slug: string;
  category: string;
  emoji: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  readMinutes: number;
  keywords: string[];
  sources?: Array<{label: string; url: string; note: string}>;
  tutorial?: {targetHref:string;targetLabel:string;visual:string;screen:string;fields:Array<[string,string]>;tip:string;form?:"listing"|"professional"|"plan"};
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
};

export const articles: KnowledgeArticle[] = [
  ...landWaterGuides,
  {
    slug: "guardar-pesaje-mi-finca-sin-senal",
    category: "Mi Finca",
    emoji: "📱",
    title: "Cómo guardar un pesaje en Mi Finca cuando no hay señal",
    description: "Una ruta corta para preparar el teléfono, registrar el peso en el potrero y comprobar después que el cambio quedó respaldado.",
    publishedAt: "2026-09-11",
    updatedAt: "2026-09-11",
    readMinutes: 4,
    keywords: ["pesaje sin señal", "Mi Finca", "registro de ganado offline", "software ganadero Venezuela"],
    sections: [
      {
        heading: "Prepara el dispositivo antes de ir al potrero",
        paragraphs: [
          "Abre Mi Finca una vez con conexión y, si usas iPhone o iPad, añade el sitio a la pantalla de inicio desde Safari. Esto permite abrir la experiencia como una aplicación y conserva los archivos necesarios en el dispositivo.",
          "Comprueba que puedes identificar el animal por su arete, código o nombre interno. Llevar una identificación estable evita mezclar historiales cuando existen animales parecidos.",
        ],
        bullets: ["Teléfono con batería suficiente", "Animal identificado", "Báscula preparada", "Fecha y observaciones disponibles"],
      },
      {
        heading: "Registra el dato aunque no haya internet",
        paragraphs: [
          "Entra en Animales, selecciona el animal y abre la opción de pesaje. Introduce el peso en kilogramos, la fecha y cualquier observación útil. Al guardar, Mi Finca escribe primero el registro en el dispositivo.",
          "El estado de sincronización indica si el cambio continúa pendiente. No es necesario crear el mismo pesaje una segunda vez cuando regrese la señal.",
        ],
      },
      {
        heading: "Confirma el respaldo cuando vuelva la conexión",
        paragraphs: [
          "Al recuperar internet, mantén la aplicación abierta unos instantes. Mi Finca intenta sincronizar al volver la conexión, al regresar a la aplicación y cada cinco minutos mientras permanece abierta.",
          "Revisa el centro de sincronización. Cuando el contador llegue a cero y el registro figure como sincronizado, el dato ya no depende únicamente de ese dispositivo.",
        ],
      },
    ],
  },
  {
    slug: "registro-peso-ganado-sin-internet",
    category: "Manejo animal",
    emoji: "⚖️",
    title: "Cómo llevar el registro de peso del ganado, incluso sin internet",
    description: "Una guía práctica para convertir cada pesaje en decisiones de alimentación, salud, reproducción y venta.",
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-07",
    readMinutes: 7,
    keywords: ["peso del ganado", "registro bovino", "ganadería Venezuela", "software ganadero sin internet"],
    sections: [
      {
        heading: "Por qué un peso aislado no cuenta toda la historia",
        paragraphs: [
          "El valor de pesar un animal aparece cuando el dato se compara con su edad, su alimentación, su estado sanitario y un pesaje anterior. Esa secuencia permite reconocer si el crecimiento avanza como se esperaba o si hace falta revisar el manejo.",
          "Un registro útil identifica al animal con un código estable. Puede ser un arete, un número interno o una combinación de finca y lote. El nombre ayuda, pero no debe ser la única forma de identificación cuando el rebaño crece.",
        ],
        bullets: ["Código o arete", "Fecha y peso en kilogramos", "Edad o fecha de nacimiento", "Lote y propósito productivo", "Observaciones de alimentación y salud"],
      },
      {
        heading: "Calcula la ganancia entre dos pesajes",
        paragraphs: [
          "Resta el peso anterior al peso actual para conocer la ganancia total. Si quieres comparar periodos de distinta duración, divide esa diferencia entre los días transcurridos. Así obtienes una ganancia diaria promedio que puede revisarse por animal o por lote.",
          "No interpretes el resultado sin contexto. Cambios de báscula, horario, llenado digestivo, clima y manejo pueden alterar una medición. Mantener una rutina similar mejora la comparabilidad.",
        ],
      },
      {
        heading: "Cómo registrar cuando falla la señal",
        paragraphs: [
          "En la plataforma Mi Finca, el registro se escribe primero en el dispositivo. Puedes identificar el animal y guardar el pesaje mientras estás en el potrero. Cuando vuelve una conexión estable, los cambios pendientes se envían al respaldo central.",
          "Antes de salir a una zona sin cobertura, abre la aplicación una vez y confirma que indique que la copia local está activa. Mantén el dispositivo cargado y, cuando sea posible, utiliza una batería externa.",
        ],
      },
      {
        heading: "Convierte el historial en decisiones",
        paragraphs: [
          "Compara animales de edad, sexo y manejo semejantes. Una caída sostenida merece una revisión del alimento, agua, parásitos, movilidad y salud general. Para diagnósticos o tratamientos, consulta a un médico veterinario que conozca el sistema productivo.",
        ],
      },
    ],
  },
  {
    slug: "dividir-finca-potreros-plano-digital",
    category: "Territorio",
    emoji: "🗺️",
    title: "Cómo dividir una finca en potreros con un plano digital",
    description: "Organiza superficie, usos, agua, vías e instalaciones antes de tomar decisiones sobre el terreno.",
    publishedAt: "2026-08-28",
    updatedAt: "2026-09-07",
    readMinutes: 8,
    keywords: ["dividir finca en potreros", "plano de finca", "manejo de potreros", "software para fincas"],
    sections: [
      {
        heading: "Comienza con la superficie que realmente conoces",
        paragraphs: [
          "El primer plano puede ser proporcional. Registra la superficie total en hectáreas o metros cuadrados y crea divisiones según el uso: potreros, siembras, instalaciones, fuentes de agua, bosque o vías.",
          "Si todavía no cuentas con coordenadas precisas, evita presentar el dibujo como un levantamiento topográfico. La representación inicial sirve para organizar decisiones; los linderos legales deben apoyarse en documentos y mediciones profesionales.",
        ],
      },
      {
        heading: "Describe cada división con información útil",
        paragraphs: ["Un nombre claro permite encontrar rápidamente cada área. Añade su superficie, uso actual, acceso al agua, tipo de cerca, observaciones del suelo y cualquier restricción estacional."],
        bullets: ["Nombre reconocible en campo", "Uso productivo", "Superficie", "Acceso y agua", "Notas de mantenimiento", "Cultivo o grupo animal asignado"],
      },
      {
        heading: "Evita asignar más terreno del disponible",
        paragraphs: [
          "La suma de todas las divisiones no debe superar la superficie total configurada. Mi Finca calcula el área todavía sin asignar y bloquea una división que exceda el terreno disponible.",
          "Si una mensura posterior cambia la superficie, actualiza primero la configuración general y revisa las divisiones. Conserva los documentos técnicos fuera del sistema hasta contar con un módulo de archivos y permisos adecuado.",
        ],
      },
      {
        heading: "El plano como punto de partida",
        paragraphs: ["Al relacionar áreas con animales, cultivos, tareas y periodos, el plano deja de ser una imagen estática. Se convierte en una estructura para observar ocupación, rotación, mantenimiento y próximos trabajos."],
      },
    ],
  },
  {
    slug: "organizar-registros-finca-desde-cero",
    category: "Gestión",
    emoji: "📋",
    title: "Cómo organizar los registros de una finca desde cero",
    description: "Una estructura sencilla para identificar animales, cultivos, inventario, tareas y objetivos sin duplicar información.",
    publishedAt: "2026-08-22",
    updatedAt: "2026-09-07",
    readMinutes: 6,
    keywords: ["registro de finca", "control de granja", "administración agropecuaria", "aplicación para finca"],
    sections: [
      {
        heading: "Define qué decisión debe ayudar a tomar cada dato",
        paragraphs: [
          "Registrar por registrar crea trabajo y no necesariamente claridad. Antes de abrir una ficha, pregunta qué decisión apoyará: identificar un animal, comparar crecimiento, planificar un ciclo, evitar que falte un insumo o conocer qué área está ocupada.",
          "Comienza con pocos campos consistentes. Es mejor completar cinco datos cada semana que diseñar una planilla extensa que nadie puede mantener.",
        ],
      },
      {
        heading: "Crea una base común",
        paragraphs: ["Configura el nombre, ubicación, superficie y objetivo principal de tu finca. Luego registra las divisiones del terreno. Esa base permite relacionar los demás movimientos con un lugar y un propósito."],
        bullets: ["Identidad de la finca", "Áreas y potreros", "Animales o lotes", "Cultivos y ciclos", "Inventario", "Tareas y responsables"],
      },
      {
        heading: "Usa nombres y códigos que sobrevivan al tiempo",
        paragraphs: [
          "Un código debe ser corto, único y comprensible. Evita depender de posiciones como ‘el becerro del corral’, porque cambian. Para inventario, separa el nombre del producto, la unidad de medida y la ubicación.",
          "Acuerda una convención con las personas que registran datos. La consistencia facilita buscar, filtrar y comparar más adelante.",
        ],
      },
      {
        heading: "Revisa lo pendiente cuando regrese internet",
        paragraphs: ["La copia local permite continuar en campo. Al recuperar conexión, comprueba el centro de sincronización hasta que no queden cambios pendientes. Ese hábito reduce el riesgo de que un teléfono sea el único lugar donde existe un registro."],
      },
    ],
  },
  {
    slug: "bioseguridad-granja-lista-practica",
    category: "Bienestar y sanidad",
    emoji: "🛡️",
    title: "Bioseguridad en una granja: una lista práctica para empezar",
    description: "Principios básicos para ordenar entradas, aislamientos, limpieza, observación y respuesta ante cambios sanitarios.",
    publishedAt: "2026-08-15",
    updatedAt: "2026-09-07",
    readMinutes: 7,
    keywords: ["bioseguridad granja", "sanidad animal", "manejo de animales", "prevención agropecuaria"],
    sections: [
      {
        heading: "La bioseguridad es una rutina, no un documento guardado",
        paragraphs: ["El objetivo es reducir la entrada y circulación de agentes que puedan afectar animales, personas o producción. Las medidas cambian según especie, tamaño, clima y riesgos locales, por lo que el plan debe revisarse con profesionales sanitarios."],
      },
      {
        heading: "Controla movimientos y separa riesgos",
        paragraphs: ["Registra entradas de animales, visitantes, vehículos y equipos. Cuando ingresa un animal nuevo o uno presenta signos inusuales, evita mezclarlo inmediatamente con el resto y solicita orientación veterinaria."],
        bullets: ["Zona de recepción o aislamiento", "Ropa y calzado de trabajo", "Limpieza de herramientas compartidas", "Control de alimento y agua", "Manejo seguro de residuos", "Registro de observaciones y fechas"],
      },
      {
        heading: "Observa cambios de manera consistente",
        paragraphs: ["Apetito, consumo de agua, comportamiento, desplazamiento y condición corporal pueden advertir que algo cambió. Una ficha con fecha, grupo, signos observados y acción tomada ayuda a explicar el caso a un profesional."],
      },
      {
        heading: "Cuándo escalar",
        paragraphs: ["Mortalidad inesperada, signos neurológicos, dificultad respiratoria, abortos agrupados o propagación rápida requieren atención profesional. No utilices una guía general para diagnosticar ni medicar. Contacta a un médico veterinario y sigue las exigencias sanitarias aplicables."],
      },
    ],
  },
  {
    slug: "comprar-genetica-semen-embriones-ganado",
    category: "Genética",
    emoji: "🧬",
    title: "Qué revisar antes de comprar semen, embriones o genética animal",
    description: "Preguntas para evaluar identidad, trazabilidad, sanidad, conservación, compatibilidad y respaldo técnico.",
    publishedAt: "2026-08-08",
    updatedAt: "2026-09-07",
    readMinutes: 9,
    keywords: ["semen bovino Venezuela", "embriones bovinos", "genética animal", "comprar ganado genética"],
    sections: [
      {
        heading: "Parte del objetivo productivo",
        paragraphs: ["La genética no se elige por una cifra aislada o una fotografía. Define primero si buscas fertilidad, adaptación, producción de leche, crecimiento, habilidad materna, calidad de canal u otro objetivo medible dentro de tu sistema."],
      },
      {
        heading: "Solicita evidencia verificable",
        paragraphs: ["Pide identificación del donante, genealogía cuando aplique, evaluaciones disponibles, fecha y centro de procesamiento, condiciones de conservación y documentación sanitaria. La información debe corresponder exactamente a la unidad ofrecida."],
        bullets: ["Identidad y lote", "Origen y trazabilidad", "Pruebas o evaluaciones", "Condición sanitaria", "Cadena de frío", "Responsable técnico", "Condiciones de entrega y reclamación"],
      },
      {
        heading: "La logística forma parte del producto",
        paragraphs: ["Semen y embriones dependen de conservación, manipulación y transporte especializados. Confirma quién asume cada etapa, cómo se verifica la temperatura y qué ocurre si la entrega se retrasa o el contenedor presenta una incidencia."],
      },
      {
        heading: "Marketplace con responsabilidad",
        paragraphs: ["Una publicación ayuda a descubrir una oferta, pero no sustituye la verificación. Antes de negociar, confirma identidad del vendedor, documentos, condiciones sanitarias y acompañamiento de un profesional acreditado. No realices pagos basados únicamente en mensajes o capturas."],
      },
    ],
  },
  {
    slug: "trazabilidad-cacao-cafe-finca",
    category: "Cultivos",
    emoji: "🌱",
    title: "Trazabilidad sencilla para cacao y café desde la finca",
    description: "Cómo relacionar lote, fechas, labores, cosecha y poscosecha para aprender de cada ciclo productivo.",
    publishedAt: "2026-08-01",
    updatedAt: "2026-09-07",
    readMinutes: 6,
    keywords: ["trazabilidad cacao", "registro cultivo café", "cacao Venezuela", "control de cultivos"],
    sections: [
      {
        heading: "La historia del producto comienza en el lote",
        paragraphs: ["Asigna un nombre estable a cada área de cultivo y conserva su superficie. A partir de allí puedes relacionar material de siembra, fecha, labores, observaciones del clima, cosecha y manejo posterior."],
      },
      {
        heading: "Registra hitos, no cada minuto",
        paragraphs: ["El sistema debe ser viable durante una jornada real. Prioriza los eventos que cambian el estado del cultivo o permiten explicar un resultado."],
        bullets: ["Siembra o establecimiento", "Material o variedad", "Fertilización y manejo", "Incidencias sanitarias", "Inicio y volumen de cosecha", "Fermentación o beneficio", "Secado y almacenamiento"],
      },
      {
        heading: "Conecta cantidad con calidad",
        paragraphs: ["Un volumen de cosecha es más útil cuando se relaciona con el lote y las condiciones de poscosecha. Esa comparación ayuda a reconocer prácticas que conviene repetir y etapas que requieren ajuste."],
      },
      {
        heading: "Trabaja sin conexión y respalda después",
        paragraphs: ["Registra la labor desde el área productiva aunque no exista cobertura. Al recuperar internet, la aplicación envía los cambios al respaldo. Revisa siempre el indicador de sincronización antes de cambiar de dispositivo."],
      },
    ],
  },
];

export function getArticle(slug: string): KnowledgeArticle | undefined {
  return articles.find((article) => article.slug === slug);
}
