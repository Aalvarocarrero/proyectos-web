// Explicit allowlist. No arbitrary HTML, selectors, links, or scripts are editable.
export const contentFields = [
  {
    "key": "heroIntro",
    "label": "Portada · Encabezado",
    "selector": ".hero-copy .eyebrow",
    "default": "Café colombiano de especialidad · Est. 2026",
    "kind": "text"
  },
  {
    "key": "heroTitle",
    "label": "Portada · Título",
    "selector": "#hero-title",
    "default": "El origen no se fabrica.\nSe cultiva.",
    "kind": "text"
  },
  {
    "key": "heroLead",
    "label": "Portada · Descripción",
    "selector": ".hero-lead",
    "default": "Ediciones limitadas que convierten cada cosecha en una historia de altura, manos campesinas y carácter irrepetible.",
    "kind": "text"
  },
  {
    "key": "collectionTitle",
    "label": "Colección · Título",
    "selector": "#collection-title",
    "default": "Una cosecha.\nCuatro formas de vivirla.",
    "kind": "text"
  },
  {
    "key": "collectionLead",
    "label": "Colección · Introducción",
    "selector": "#coleccion .section-heading > p",
    "default": "ROHO 001 reúne una selección Tabi con proceso Honey. Cada presentación conserva el mismo origen y amplía el ritual.",
    "kind": "text"
  },
  {
    "key": "originTitle",
    "label": "Origen · Título",
    "selector": "#origin-title",
    "default": "Antes de ser café,\nfue paisaje.",
    "kind": "text"
  },
  {
    "key": "originLead",
    "label": "Origen · Historia",
    "selector": ".origin-copy > p:not(.eyebrow)",
    "default": "ROHO nace para volver visible lo que una taza suele ocultar: la semilla elegida, el cuidado diario, las decisiones del productor y el tiempo preciso de cada proceso.",
    "kind": "text"
  },
  {
    "key": "processTitle",
    "label": "Proceso · Título",
    "selector": "#process-title",
    "default": "La calidad se construye\nmucho antes del tueste.",
    "kind": "text"
  },
  {
    "key": "processLead",
    "label": "Proceso · Introducción",
    "selector": ".process-intro > p:not(.eyebrow)",
    "default": "Cada etapa protege el potencial genético del grano y reconoce el criterio de quienes lo cultivan.",
    "kind": "text"
  },
  {
    "key": "qualityTitle",
    "label": "Calidad · Título",
    "selector": "#quality-title",
    "default": "“Premium” no será un adjetivo.\nSerá evidencia.",
    "kind": "text"
  },
  {
    "key": "qualityLead",
    "label": "Calidad · Introducción",
    "selector": ".quality-heading > p:not(.eyebrow)",
    "default": "Cada edición publicará la información que permite comprender su valor: genética, origen, proceso y catación del lote.",
    "kind": "text"
  },
  {
    "key": "producerTitle",
    "label": "Productor · Título",
    "selector": ".producer-copy h2",
    "default": "El productor no es una nota al pie.",
    "kind": "text"
  },
  {
    "key": "producerLead",
    "label": "Productor · Relato",
    "selector": ".producer-copy > p:not(.eyebrow)",
    "default": "Es quien interpreta el clima, cuida la planta y decide el instante exacto de cada etapa. Por eso, cada futura ficha de ROHO hará visible la finca, el productor, el lote, la variedad, el proceso, la fecha de tueste y el perfil de catación.",
    "kind": "text"
  },
  {
    "key": "producerQuote",
    "label": "Productor · Cita",
    "selector": ".producer-copy blockquote",
    "default": "“El alma del café está en las decisiones humanas que acompañan su origen.”",
    "kind": "text"
  },
  {
    "key": "producerCaption",
    "label": "Productor · Pie de foto",
    "selector": ".producer-image figcaption",
    "default": "La selección empieza en el árbol.",
    "kind": "text"
  },
  {
    "key": "numberedTitle",
    "label": "Edición · Título",
    "selector": "#numbered-title",
    "default": "Ninguna cosecha vuelve a ocurrir de la misma manera.",
    "kind": "text"
  },
  {
    "key": "numberedLead",
    "label": "Edición · Historia",
    "selector": ".numbered-copy > p:not(.eyebrow)",
    "default": "Por eso no repetimos ediciones. Las numeramos, documentamos y dejamos que cada una cuente el momento exacto del que proviene.",
    "kind": "text"
  },
  {
    "key": "communityTitle",
    "label": "Comunidad · Título",
    "selector": "#community-title",
    "default": "Dos lugares.\nUn mismo origen.",
    "kind": "text"
  },
  {
    "key": "communityLead",
    "label": "Comunidad · Introducción",
    "selector": "#comunidad .section-heading > p",
    "default": "Sigue la construcción de la primera edición desde Colombia y Australia. Cada canal abre una parte distinta de la historia.",
    "kind": "text"
  },
  {
    "key": "step1Title",
    "label": "Proceso 1 · Nombre",
    "selector": ".process-grid li:nth-child(1) h3",
    "default": "Selección",
    "kind": "text"
  },
  {
    "key": "step1Description",
    "label": "Proceso 1 · Descripción",
    "selector": ".process-grid li:nth-child(1) p",
    "default": "Variedad y semilla se eligen por adaptación, sanidad y potencial de taza.",
    "kind": "text"
  },
  {
    "key": "step2Title",
    "label": "Proceso 2 · Nombre",
    "selector": ".process-grid li:nth-child(2) h3",
    "default": "Cultivo",
    "kind": "text"
  },
  {
    "key": "step2Description",
    "label": "Proceso 2 · Descripción",
    "selector": ".process-grid li:nth-child(2) p",
    "default": "Suelo, sombra y nutrición se cuidan respetando el ritmo de la montaña.",
    "kind": "text"
  },
  {
    "key": "step3Title",
    "label": "Proceso 3 · Nombre",
    "selector": ".process-grid li:nth-child(3) h3",
    "default": "Cosecha",
    "kind": "text"
  },
  {
    "key": "step3Description",
    "label": "Proceso 3 · Descripción",
    "selector": ".process-grid li:nth-child(3) p",
    "default": "Las cerezas se recolectan a mano en su punto correcto de maduración.",
    "kind": "text"
  },
  {
    "key": "step4Title",
    "label": "Proceso 4 · Nombre",
    "selector": ".process-grid li:nth-child(4) h3",
    "default": "Proceso",
    "kind": "text"
  },
  {
    "key": "step4Description",
    "label": "Proceso 4 · Descripción",
    "selector": ".process-grid li:nth-child(4) p",
    "default": "Selección, despulpado y fermentación definen limpieza y complejidad.",
    "kind": "text"
  },
  {
    "key": "step5Title",
    "label": "Proceso 5 · Nombre",
    "selector": ".process-grid li:nth-child(5) h3",
    "default": "Secado",
    "kind": "text"
  },
  {
    "key": "step5Description",
    "label": "Proceso 5 · Descripción",
    "selector": ".process-grid li:nth-child(5) p",
    "default": "El control de humedad preserva la estabilidad y el carácter del lote.",
    "kind": "text"
  },
  {
    "key": "step6Title",
    "label": "Proceso 6 · Nombre",
    "selector": ".process-grid li:nth-child(6) h3",
    "default": "Tueste",
    "kind": "text"
  },
  {
    "key": "step6Description",
    "label": "Proceso 6 · Descripción",
    "selector": ".process-grid li:nth-child(6) p",
    "default": "Un perfil creado en origen revela el café sin cubrir su identidad.",
    "kind": "text"
  },
  {
    "key": "originImage",
    "label": "Origen · Fotografía",
    "selector": ".origin-image img",
    "default": "./assets/origen.webp",
    "kind": "image"
  },
  {
    "key": "originAlt",
    "label": "Origen · Texto alternativo",
    "selector": ".origin-image img",
    "default": "Cafetal colombiano entre árboles y montañas",
    "kind": "alt"
  },
  {
    "key": "producerImage",
    "label": "Productor · Fotografía",
    "selector": ".producer-image img",
    "default": "./assets/cosecha.webp",
    "kind": "image"
  },
  {
    "key": "producerAlt",
    "label": "Productor · Texto alternativo",
    "selector": ".producer-image img",
    "default": "Mano campesina seleccionando cerezas de café en una planta",
    "kind": "alt"
  },
  {
    "key": "traceImage",
    "label": "Pasaporte · Fotografía",
    "selector": ".producer-commerce-card img",
    "default": "./assets/cosecha.webp",
    "kind": "image"
  },
  {
    "key": "traceAlt",
    "label": "Pasaporte · Texto alternativo",
    "selector": ".producer-commerce-card img",
    "default": "Manos seleccionando cerezas de café maduras en el cafetal",
    "kind": "alt"
  }
];
export const defaultHomepage = Object.fromEntries(contentFields.map(f => [f.key, f.default]));
