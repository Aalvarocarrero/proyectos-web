/** Fixed, versioned homepage editing contract. No arbitrary HTML, URLs or fields. */
export const SCHEMA_VERSION = 1;
export const IMAGE_ASSETS = Object.freeze(["/assets/alvaro.jpg", "/assets/claridad.webp", "/assets/cuidado.webp", "/assets/progreso.webp", "/assets/crecimiento.webp", "/assets/habitos.webp"]);
/** @type {ReadonlyArray<Readonly<import('./content-contract').FieldDescriptor>>} */
export const FIELDS = Object.freeze([
  {
    "key": "es.hero.title",
    "lang": "es",
    "slot": "hero.title",
    "label": "Título principal",
    "group": "Inicio",
    "type": "text",
    "maxLength": 160,
    "default": "Aprender\na vivir."
  },
  {
    "key": "es.hero.intro",
    "lang": "es",
    "slot": "hero.intro",
    "label": "Introducción",
    "group": "Inicio",
    "type": "text",
    "maxLength": 600,
    "default": "Conecta mente, alma y cuerpo.\nEncuentra una dirección con sentido.\nHaz de tu pasión parte de tu día a día."
  },
  {
    "key": "es.approach.title",
    "lang": "es",
    "slot": "approach.title",
    "label": "Título del enfoque",
    "group": "Enfoque",
    "type": "text",
    "maxLength": 180,
    "default": "No necesitas tener\ntodas las respuestas\npara comenzar."
  },
  {
    "key": "es.approach.body",
    "lang": "es",
    "slot": "approach.body",
    "label": "Propósito del enfoque",
    "group": "Enfoque",
    "type": "text",
    "maxLength": 1200,
    "default": "¿Estás vivo o creyendo que vives? Mi misión es que las personas aprendan a vivir con propósito y se sientan realmente vivas, más allá de la monotonía: reconocer lo que les apasiona y darle un lugar real en su día a día."
  },
  {
    "key": "es.approach.details",
    "lang": "es",
    "slot": "approach.details",
    "label": "Descripción del enfoque",
    "group": "Enfoque",
    "type": "text",
    "maxLength": 1200,
    "default": "Las áreas física, mental y espiritual son la base de mi enfoque. A través de la reflexión, la orientación y herramientas prácticas, exploramos cómo vivir con mayor conciencia y coherencia."
  },
  {
    "key": "es.community.title",
    "lang": "es",
    "slot": "community.title",
    "label": "Título de comunidad",
    "group": "Comunidad",
    "type": "text",
    "maxLength": 180,
    "default": "Una práctica pequeña.\nUn paso con sentido."
  },
  {
    "key": "es.community.body",
    "lang": "es",
    "slot": "community.body",
    "label": "Texto de comunidad",
    "group": "Comunidad",
    "type": "text",
    "maxLength": 1000,
    "default": "Explora siete días de reflexión y acciones cotidianas, sin registro. Estamos preparando la comunidad y los espacios de mentoría individual y grupal."
  },
  {
    "key": "es.mentoring.title",
    "lang": "es",
    "slot": "mentoring.title",
    "label": "Título de mentorías",
    "group": "Mentorías",
    "type": "text",
    "maxLength": 180,
    "default": "Un espacio para encontrar\ntu dirección."
  },
  {
    "key": "es.mentoring.body",
    "lang": "es",
    "slot": "mentoring.body",
    "label": "Disponibilidad de mentorías",
    "group": "Mentorías",
    "type": "text",
    "maxLength": 1000,
    "default": "Las nuevas modalidades individual y grupal están en preparación. Puedes conocer el enfoque o proponer una conversación; no hay inscripciones de pago abiertas."
  },
  {
    "key": "es.about.title",
    "lang": "es",
    "slot": "about.title",
    "label": "Título sobre Álvaro",
    "group": "Sobre Álvaro",
    "type": "text",
    "maxLength": 180,
    "default": "Mi foco:\nque aprendas\na vivir."
  },
  {
    "key": "es.about.body",
    "lang": "es",
    "slot": "about.body",
    "label": "Presentación personal",
    "group": "Sobre Álvaro",
    "type": "text",
    "maxLength": 1200,
    "default": "Creo en el valor de mirar hacia dentro y hacer espacio para una vida más consciente. Por eso comparto reflexiones que conectan lo que piensas y sientes con las decisiones que tomas cada día."
  },
  {
    "key": "es.about.details",
    "lang": "es",
    "slot": "about.details",
    "label": "Trayectoria",
    "group": "Sobre Álvaro",
    "type": "text",
    "maxLength": 1200,
    "default": "Más de quince años de aprendizaje y formación personal. Mi propuesta empieza en lo cotidiano: escucharte, cuidar tus hábitos y reconocer lo que de verdad importa para ti."
  },
  {
    "key": "es.contact.title",
    "lang": "es",
    "slot": "contact.title",
    "label": "Título de contacto",
    "group": "Contacto",
    "type": "text",
    "maxLength": 180,
    "default": "Empecemos una\nconversación."
  },
  {
    "key": "es.contact.body",
    "lang": "es",
    "slot": "contact.body",
    "label": "Texto de contacto",
    "group": "Contacto",
    "type": "text",
    "maxLength": 600,
    "default": "Elige una fecha preferida para una sesión virtual.\nConversaremos sobre tu objetivo y confirmaremos los detalles."
  },
  {
    "key": "es.about.image",
    "lang": "es",
    "slot": "about.image",
    "label": "Imagen de presentación",
    "group": "Sobre Álvaro",
    "type": "image",
    "default": "/assets/alvaro.jpg"
  },
  {
    "key": "es.about.imageAlt",
    "lang": "es",
    "slot": "about.imageAlt",
    "label": "Descripción accesible de la imagen",
    "group": "Sobre Álvaro",
    "type": "text",
    "maxLength": 200,
    "default": "Álvaro Carrero"
  },
  {
    "key": "es.seo.title",
    "lang": "es",
    "slot": "seo.title",
    "label": "Título SEO",
    "group": "SEO",
    "type": "text",
    "maxLength": 120,
    "default": "Álvaro Carrero | Mentor de transformación personal"
  },
  {
    "key": "es.seo.description",
    "lang": "es",
    "slot": "seo.description",
    "label": "Descripción SEO",
    "group": "SEO",
    "type": "text",
    "maxLength": 320,
    "default": "Mente, alma y cuerpo para aprender a vivir con propósito. Álvaro Carrero, mentor de transformación personal: mentorías personales y empresariales."
  },
  {
    "key": "es.seo.socialTitle",
    "lang": "es",
    "slot": "seo.socialTitle",
    "label": "Título al compartir",
    "group": "SEO",
    "type": "text",
    "maxLength": 120,
    "default": "Álvaro Carrero · Aprender a vivir"
  },
  {
    "key": "es.seo.socialDescription",
    "lang": "es",
    "slot": "seo.socialDescription",
    "label": "Descripción al compartir",
    "group": "SEO",
    "type": "text",
    "maxLength": 320,
    "default": "Mente, alma y cuerpo. Mentorías personales y empresariales para explorar propósito, enfoque y pasión."
  },
  {
    "key": "es.seo.image",
    "lang": "es",
    "slot": "seo.image",
    "label": "Imagen al compartir",
    "group": "SEO",
    "type": "image",
    "default": "/assets/claridad.webp"
  },
  {
    "key": "en.hero.title",
    "lang": "en",
    "slot": "hero.title",
    "label": "Título principal",
    "group": "Inicio",
    "type": "text",
    "maxLength": 160,
    "default": "Learning\nto live."
  },
  {
    "key": "en.hero.intro",
    "lang": "en",
    "slot": "hero.intro",
    "label": "Introducción",
    "group": "Inicio",
    "type": "text",
    "maxLength": 600,
    "default": "Connect mind, soul and body.\nFind a meaningful direction.\nMake your passion part of everyday life."
  },
  {
    "key": "en.approach.title",
    "lang": "en",
    "slot": "approach.title",
    "label": "Título del enfoque",
    "group": "Enfoque",
    "type": "text",
    "maxLength": 180,
    "default": "You do not need\nall the answers\nto begin."
  },
  {
    "key": "en.approach.body",
    "lang": "en",
    "slot": "approach.body",
    "label": "Propósito del enfoque",
    "group": "Enfoque",
    "type": "text",
    "maxLength": 1200,
    "default": "Are you truly living, or just going through the motions? My mission is to help people learn to live with purpose and feel truly alive, beyond the everyday routine: to recognize what they are passionate about and make real space for it in daily life."
  },
  {
    "key": "en.approach.details",
    "lang": "en",
    "slot": "approach.details",
    "label": "Descripción del enfoque",
    "group": "Enfoque",
    "type": "text",
    "maxLength": 1200,
    "default": "The physical, mental and spiritual dimensions of life form the foundation of my approach. Through reflection, guidance and practical tools, we explore how to live with greater awareness and in closer alignment with what matters to you."
  },
  {
    "key": "en.community.title",
    "lang": "en",
    "slot": "community.title",
    "label": "Título de comunidad",
    "group": "Comunidad",
    "type": "text",
    "maxLength": 180,
    "default": "One small practice.\nOne meaningful step."
  },
  {
    "key": "en.community.body",
    "lang": "en",
    "slot": "community.body",
    "label": "Texto de comunidad",
    "group": "Comunidad",
    "type": "text",
    "maxLength": 1000,
    "default": "Explore seven days of reflection and everyday actions, with no sign-up needed. Our community and individual and group mentoring spaces are in preparation."
  },
  {
    "key": "en.mentoring.title",
    "lang": "en",
    "slot": "mentoring.title",
    "label": "Título de mentorías",
    "group": "Mentorías",
    "type": "text",
    "maxLength": 180,
    "default": "A space to find\nyour direction."
  },
  {
    "key": "en.mentoring.body",
    "lang": "en",
    "slot": "mentoring.body",
    "label": "Disponibilidad de mentorías",
    "group": "Mentorías",
    "type": "text",
    "maxLength": 1000,
    "default": "The new individual and group formats are in preparation. You can explore the approach or request a conversation; paid enrollment is not open."
  },
  {
    "key": "en.about.title",
    "lang": "en",
    "slot": "about.title",
    "label": "Título sobre Álvaro",
    "group": "Sobre Álvaro",
    "type": "text",
    "maxLength": 180,
    "default": "My focus:\nhelping you learn\nto live."
  },
  {
    "key": "en.about.body",
    "lang": "en",
    "slot": "about.body",
    "label": "Presentación personal",
    "group": "Sobre Álvaro",
    "type": "text",
    "maxLength": 1200,
    "default": "I believe in the value of looking within and making room for a more conscious life. That is why I share reflections that connect what you think and feel with the decisions you make each day."
  },
  {
    "key": "en.about.details",
    "lang": "en",
    "slot": "about.details",
    "label": "Trayectoria",
    "group": "Sobre Álvaro",
    "type": "text",
    "maxLength": 1200,
    "default": "More than fifteen years of my own learning and personal development. My approach starts with everyday life: listening to yourself, nurturing your habits and recognizing what truly matters to you."
  },
  {
    "key": "en.contact.title",
    "lang": "en",
    "slot": "contact.title",
    "label": "Título de contacto",
    "group": "Contacto",
    "type": "text",
    "maxLength": 180,
    "default": "Let’s start a\nconversation."
  },
  {
    "key": "en.contact.body",
    "lang": "en",
    "slot": "contact.body",
    "label": "Texto de contacto",
    "group": "Contacto",
    "type": "text",
    "maxLength": 600,
    "default": "Choose your preferred date for an online session.\nWe will discuss your goal and confirm the details."
  },
  {
    "key": "en.about.image",
    "lang": "en",
    "slot": "about.image",
    "label": "Imagen de presentación",
    "group": "Sobre Álvaro",
    "type": "image",
    "default": "/assets/alvaro.jpg"
  },
  {
    "key": "en.about.imageAlt",
    "lang": "en",
    "slot": "about.imageAlt",
    "label": "Descripción accesible de la imagen",
    "group": "Sobre Álvaro",
    "type": "text",
    "maxLength": 200,
    "default": "Álvaro Carrero"
  },
  {
    "key": "en.seo.title",
    "lang": "en",
    "slot": "seo.title",
    "label": "Título SEO",
    "group": "SEO",
    "type": "text",
    "maxLength": 120,
    "default": "Álvaro Carrero | Personal Transformation Mentor"
  },
  {
    "key": "en.seo.description",
    "lang": "en",
    "slot": "seo.description",
    "label": "Descripción SEO",
    "group": "SEO",
    "type": "text",
    "maxLength": 320,
    "default": "Mind, soul and body: learning to live with purpose. Álvaro Carrero, personal transformation mentor: personal and business mentoring."
  },
  {
    "key": "en.seo.socialTitle",
    "lang": "en",
    "slot": "seo.socialTitle",
    "label": "Título al compartir",
    "group": "SEO",
    "type": "text",
    "maxLength": 120,
    "default": "Álvaro Carrero · Learning to Live"
  },
  {
    "key": "en.seo.socialDescription",
    "lang": "en",
    "slot": "seo.socialDescription",
    "label": "Descripción al compartir",
    "group": "SEO",
    "type": "text",
    "maxLength": 320,
    "default": "Mind, soul and body. Personal and business mentoring to explore purpose, focus and passion."
  },
  {
    "key": "en.seo.image",
    "lang": "en",
    "slot": "seo.image",
    "label": "Imagen al compartir",
    "group": "SEO",
    "type": "image",
    "default": "/assets/claridad.webp"
  }
].map(Object.freeze));
export const DEFAULT_CONTENT = Object.freeze(Object.fromEntries(FIELDS.map(field => [field.key, field.default])));
