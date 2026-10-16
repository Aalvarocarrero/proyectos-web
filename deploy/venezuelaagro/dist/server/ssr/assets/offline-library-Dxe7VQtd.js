import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { m as queueMutation, r as createLocalId } from "./offline-db-BE3xVTyb.js";
import { d as stringType, l as objectType, m as ZodIssueCode, n as arrayType, o as enumType, s as literalType } from "./types-nz7Y6Ylx.js";
import { n as agroFamilies } from "./agro-catalog-DV8tudCB.js";
import { s as localOwner } from "./offline-account-boundary-hnu6xdcm.js";
import { t as PublicFarmForm } from "./agro-network-Cj1LW5xk.js";
import { n as ProjectForm, t as ProfessionalForm } from "./community-forms-DQzipyaL.js";
import { ConnectionIndicator } from "./connection-indicator-DpEs-ntT.js";
import { t as OfflineDownloadSize } from "./offline-download-size-Kf0EnICD.js";
import { t as VenezuelaAgroLogo } from "./venezuelaagro-logo-DvpF7I67.js";
import { t as ListingForm } from "./listing-form-jy8c_mFj.js";
import { StoreCatalog } from "./store-catalog-6FFK-fJf.js";
//#region lib/offline-library-navigation.ts
var offlineSections = [
	"inicio",
	"tienda",
	"rubros",
	"aprende",
	"marketplace",
	"professional",
	"farm",
	"post",
	"project",
	"borradores"
];
/** A namespaced hash keeps offline routes intact and supports native Back/Forward. */
function readLibraryLocation(hash) {
	if (!hash.startsWith("#biblioteca?")) return null;
	const params = new URLSearchParams(hash.slice(12));
	const section = params.get("seccion");
	if (!offlineSections.includes(section)) return null;
	return {
		section,
		detail: params.get("guia") || ""
	};
}
function libraryLocation(section, detail = "") {
	const params = new URLSearchParams({ seccion: section });
	if (detail) params.set("guia", detail);
	return `#biblioteca?${params}`;
}
//#endregion
//#region components/article-sources.tsx
var import_jsx_runtime = require_jsx_runtime();
function ArticleSources({ sources, offline = false }) {
	if (!sources?.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-12 rounded-2xl border border-[#3e2a19]/15 bg-white p-5 text-[#3e2a19]",
		"aria-label": "Fuentes y alcance",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Fuentes y alcance"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-6",
				children: "Referencias para ampliar la lectura. Confirma las condiciones de tu finca con profesionales locales antes de aplicar una decisión técnica."
			}),
			offline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6",
				children: "Las notas se incluyen en esta descarga. Abrir los documentos originales requiere internet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-5",
				children: sources.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: source.url,
					target: "_blank",
					rel: "noopener noreferrer",
					className: "inline-block min-h-11 py-2 font-bold underline decoration-[#4c6b3a] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4",
					children: source.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-6 text-[#655542]",
					children: source.note
				})] }, source.url))
			})
		]
	});
}
//#endregion
//#region lib/land-water-guides.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
//#endregion
//#region lib/articles.ts
var articles = [
	...[
		{
			"slug": "preparar-terreno-cultivos-instalaciones",
			"title": "Antes de preparar el terreno para cultivos o instalaciones",
			"description": "Una revisión inicial para conversar con el agrónomo o el profesional de diseño antes de mover tierra.",
			"category": "Suelo y agua",
			"emoji": "🌱",
			"publishedAt": "2026-10-07",
			"updatedAt": "2026-10-07",
			"readMinutes": 3,
			"keywords": [
				"preparación de terreno",
				"cultivos Venezuela",
				"instalaciones rurales",
				"conservación de suelo"
			],
			"sections": [
				{
					"heading": "Empieza por el uso que quieres darle",
					"paragraphs": ["Escribe qué actividad estás evaluando y en qué parte del predio. Un área para sembrar y una instalación para animales requieren decisiones distintas. Esta guía ayuda a ordenar información para una visita técnica; no define qué obra o cultivo conviene en tu finca.", "Anota qué sabes y qué falta comprobar. Evita convertir una idea de producción en una fecha de inicio antes de revisar sus necesidades. Un croquis sencillo puede servir para explicar la propuesta sin presentarlo como un plano aprobado."]
				},
				{
					"heading": "Observa el lugar y conserva el contexto",
					"paragraphs": ["Recorre únicamente zonas accesibles y seguras. Registra dónde se acumula agua, por dónde escurre y qué sectores muestran suelo descubierto o deteriorado. Anota la fecha y si ha llovido: una observación de un día no describe todas las condiciones del año.", "Pregunta por los usos anteriores del terreno. Lleva al especialista fotografías propias y observaciones identificadas por sector, sin publicar datos privados de la finca. La evaluación de suelo y relieve debe ajustarse al proyecto."]
				},
				{
					"heading": "Decide las labores después del diagnóstico",
					"paragraphs": ["La FAO presenta la mínima alteración mecánica, la cobertura del suelo y la diversidad de cultivos como principios de agricultura de conservación. Son una referencia para discutir el manejo; no indican que la misma preparación funcione en todos los suelos.", "Consulta si necesitas un análisis de suelo y solicita el protocolo de muestreo al laboratorio o al agrónomo. Pregunta cómo influyen humedad, drenaje, pendiente y antecedentes del lote en la labor propuesta. No fijes fertilización, profundidad de trabajo ni número de pases a partir de una recomendación genérica."]
				},
				{
					"heading": "Si habrá animales, revisa también el funcionamiento",
					"paragraphs": ["Antes de construir, plantea cómo llegarán agua, alimento, personas y animales, y cómo se atenderán limpieza y residuos. Para instalaciones porcinas, la OMSA recomienda diseño profesional que considere sanidad y bienestar.", "Pide que el proyecto explique accesos, superficies, refugio y mantenimiento. Confirma qué consultas o autorizaciones corresponden al lugar y a la actividad. Una lista educativa no sustituye el diseño, la revisión ambiental ni los requisitos aplicables."]
				},
				{
					"heading": "Ejercicio: una hoja para la visita técnica",
					"paragraphs": ["Prepara una ficha con cuatro columnas: observación, duda, profesional que puede revisarla y próximo paso. Marca cada dato como comprobado o pendiente. El objetivo es llegar a la consulta con preguntas claras, no resolver por tu cuenta una excavación o una obra.", "Referencias revisadas el 7 de octubre de 2026. Los manuales históricos enlazados aportan criterios generales y requieren adaptación al sitio."],
					"bullets": [
						"¿Qué uso quiero darle a esta zona?",
						"¿Qué necesito medir antes de intervenir?",
						"¿Qué decisión debe esperar la evaluación técnica?"
					]
				}
			],
			"sources": [
				{
					"label": "FAO · Agricultura de conservación",
					"url": "https://www.fao.org/conservation-agriculture/es/",
					"note": "Página institucional consultada el 7 de octubre de 2026; principios generales."
				},
				{
					"label": "FAO · Selección del sitio y planificación",
					"url": "https://www.fao.org/fishery/static/FAO_Training/FAO_Training/General/x6708e/x6708e02.htm",
					"note": "Manual técnico histórico: suelo, agua y topografía; no es norma venezolana."
				},
				{
					"label": "OMSA · Bienestar y sistemas de producción porcina",
					"url": "https://www.woah.org/fileadmin/Home/esp/Health_standards/tahc/current/es_chapitre_aw_pigs.htm",
					"note": "Capítulo 7.13 consultado el 7 de octubre de 2026; referencia internacional."
				}
			]
		},
		{
			"slug": "agua-finca-viabilidad-estanque",
			"title": "Fuentes de agua y viabilidad de un estanque",
			"description": "Qué información reunir sobre agua, suelo y permisos antes de proyectar un estanque para peces.",
			"category": "Suelo y agua",
			"emoji": "💧",
			"publishedAt": "2026-10-07",
			"updatedAt": "2026-10-07",
			"readMinutes": 3,
			"keywords": [
				"agua rural",
				"estanque peces",
				"acuicultura Venezuela",
				"evaluación del sitio"
			],
			"sections": [
				{
					"heading": "Define el proyecto antes de buscar una solución",
					"paragraphs": ["Aclara qué uso necesita el agua: bebida animal, riego o cultivo de peces. Para un estanque, también hace falta discutir especie, sistema y escala con asistencia acuícola. Tener un espacio disponible no demuestra que el proyecto sea viable.", "Esta guía propone una evaluación inicial. No recomienda una especie ni atribuye estanques productivos a ninguna finca. La elección final depende de condiciones técnicas, ambientales y administrativas comprobadas."]
				},
				{
					"heading": "Conoce la fuente y su variación",
					"paragraphs": ["Los manuales FAO de selección de sitios consideran fundamentales la cantidad y la calidad del abastecimiento. Registra la fuente, la época y cómo se obtuvo cada medición. Un caudal observado en lluvias no asegura suministro durante la sequía.", "Si se estudia un pozo, pide evaluación hidrogeológica y consulta los requisitos antes de perforar. No tomes como prueba de disponibilidad una intuición, una varilla o la sola presencia de vegetación. Anota también los otros usos del agua que podrían verse afectados."]
				},
				{
					"heading": "Pregunta qué análisis corresponden",
					"paragraphs": ["La calidad no se determina solo por el color o la transparencia. La FAO explica que temperatura, oxígeno disuelto, pH y turbidez ayudan a comprender el agua de un estanque, y que sus condiciones cambian con el tiempo.", "El especialista debe indicar qué medir para la fuente y el sistema propuesto. Si interviene un laboratorio, sigue sus instrucciones de muestreo, recipiente, conservación y entrega. Guarda fecha, lugar, método y resultados. No apliques dosis de cal, desinfectantes u otros productos por una receta general."]
				},
				{
					"heading": "Revisa terreno, abastecimiento y salida",
					"paragraphs": ["Suelo y topografía influyen en el diseño. Solicita revisión de infiltración, estabilidad, inundaciones y posibilidades de abastecimiento y drenaje. Un dibujo conceptual sirve para conversar; no sustituye el proyecto de ingeniería.", "Incluye accesos, seguridad y manejo de efluentes. La entrada y la salida de agua deben estudiarse junto con la protección de otras fuentes. No hay una profundidad o pendiente única que pueda recomendarse para toda finca venezolana."]
				},
				{
					"heading": "Ejercicio: prepara la consulta técnica y administrativa",
					"paragraphs": ["Haz una ficha del proyecto y entrega al profesional los datos disponibles y las dudas pendientes. Pregunta qué debe resolverse antes de comprar materiales o animales."],
					"bullets": [
						"Fuente y mediciones disponibles, con fecha y época.",
						"Suelo, relieve y antecedentes de inundación por revisar.",
						"Análisis necesarios y responsable de interpretarlos.",
						"Consultas de agua, ambiente y acuicultura que correspondan."
					]
				},
				{
					"heading": "Alcance de las referencias legales",
					"paragraphs": ["Se consultaron la Ley de Aguas publicada en 2007 y el texto de Pesca y Acuicultura de 2014, reproducidos por FAOLEX. Son antecedentes del marco regulatorio; esta guía no certifica todos los requisitos vigentes. Confirma las reglas aplicables a la ubicación, especie y actividad con las autoridades competentes. Revisión editorial: 7 de octubre de 2026."]
				}
			],
			"sources": [
				{
					"label": "FAO · Consideraciones para seleccionar sitios acuícolas",
					"url": "https://www.fao.org/4/x5744e/x5744e02.htm",
					"note": "Manual histórico; usar criterios, no caudales universales."
				},
				{
					"label": "FAO · Calidad de agua en estanques",
					"url": "https://www.fao.org/fishery/static/FAO_Training/FAO_Training/General/x6709s/x6709s02.htm",
					"note": "Manual técnico histórico; medición e interpretación según el sistema."
				},
				{
					"label": "Venezuela · Ley de Aguas",
					"url": "https://faolex.fao.org/docs/pdf/ven69647.pdf",
					"note": "Gaceta Oficial 38.595, 2 de enero de 2007; texto primario alojado por FAOLEX, sin certificación exhaustiva de vigencia."
				},
				{
					"label": "Venezuela · Ley de Pesca y Acuicultura",
					"url": "https://faolex.fao.org/docs/pdf/ven147977.pdf",
					"note": "Decreto 1.408, 13 de noviembre de 2014; Gaceta 6.150 extraordinaria, 18 de noviembre de 2014. Revalidar normas posteriores."
				}
			]
		},
		{
			"slug": "instalacion-porcina-bienestar-bioseguridad",
			"title": "Preparar una instalación porcina con bienestar y bioseguridad",
			"description": "Preguntas para revisar agua, descanso, accesos y cuidado antes de recibir cerdos.",
			"category": "Manejo animal",
			"emoji": "🐖",
			"publishedAt": "2026-10-07",
			"updatedAt": "2026-10-07",
			"readMinutes": 3,
			"keywords": [
				"instalaciones porcinas",
				"bienestar cerdos",
				"agua para animales",
				"bioseguridad"
			],
			"sections": [
				{
					"heading": "Describe los animales y el trabajo previsto",
					"paragraphs": ["Empieza por identificar etapa productiva, cantidad prevista y sistema de manejo. Una propuesta para engorde no debe copiarse automáticamente para madres y lechones. Lleva esos datos a un veterinario y al profesional responsable de las instalaciones.", "La guía sirve para preparar preguntas. No calcula capacidad, presupuesto, crecimiento ni resultados reproductivos, y tampoco acredita que una finca cumpla una certificación. Si todavía faltan datos, consérvalos como pendientes."]
				},
				{
					"heading": "Revisa el acceso al agua y al alimento",
					"paragraphs": ["La OMSA recomienda agua apta y suficiente para las necesidades de los animales. El equipo debe responder a edad, etapa y ambiente. Comprueba su funcionamiento real: disponer de un depósito no demuestra que cada animal pueda beber.", "Pide que el diseño contemple acceso y mantenimiento. Anota quién revisará bebederos y qué hará ante una interrupción. Evita fijar litros o caudales universales sin evaluación. Incluye en la consulta dónde se almacenará el alimento y cómo se protegerá."]
				},
				{
					"heading": "Considera descanso, clima y superficies",
					"paragraphs": ["El bienestar requiere instalaciones que reduzcan lesiones y estrés. La referencia de la OMSA incluye refugio frente al clima, descanso cómodo y manejo de superficies y drenaje. Un sistema al aire libre también necesita atención a esas condiciones.", "Recorre con el profesional el trayecto de los animales y del personal. Pregunta qué puntos podrían dificultar limpieza, inspección o movimiento seguro. Solicita que las recomendaciones queden explicadas para el sistema concreto, en lugar de copiar dimensiones de otra explotación."]
				},
				{
					"heading": "Planifica las entradas y la respuesta sanitaria",
					"paragraphs": ["La bioseguridad debe contemplar animales nuevos, personas, vehículos y equipos. La información de la OMSA sobre peste porcina africana muestra por qué esos contactos importan. Citarla aquí no significa afirmar que exista un brote actual en Venezuela.", "Acuerda con el veterinario el procedimiento de ingreso, vigilancia y atención de animales enfermos. No improvises tratamientos ni un periodo de separación aplicable a todos los casos. Ordena también limpieza y residuos para que el funcionamiento diario pueda revisarse."]
				},
				{
					"heading": "Ejercicio: revisa responsabilidades antes de iniciar",
					"paragraphs": ["Dibuja un esquema sencillo con las áreas que propones y lleva una lista de dudas a la visita técnica. No lo uses como plano de construcción. Para cada tarea, escribe responsable, evidencia de revisión y problema pendiente.", "Las fuentes internacionales se consultaron el 7 de octubre de 2026. Aportan criterios de bienestar y prevención, no una lista verificada de permisos venezolanos. Confirma por separado los requisitos locales de la actividad."],
					"bullets": [
						"¿Quién comprobará el agua y los equipos?",
						"¿Cómo se observarán descanso, conducta y lesiones?",
						"¿A quién se avisará ante un cambio sanitario?",
						"¿Qué falta resolver antes de recibir animales?"
					]
				}
			],
			"sources": [{
				"label": "OMSA · Bienestar animal y producción de cerdos",
				"url": "https://www.woah.org/fileadmin/Home/esp/Health_standards/tahc/current/es_chapitre_aw_pigs.htm",
				"note": "Capítulo 7.13; referencia internacional consultada el 7 de octubre de 2026."
			}, {
				"label": "OMSA · Peste porcina africana",
				"url": "https://www.woah.org/es/enfermedad/peste-porcina-africana/",
				"note": "Consulta del 7 de octubre de 2026, utilizada solo para principios de bioseguridad; sin afirmar situación epidemiológica venezolana."
			}]
		},
		{
			"slug": "patos-agua-refugio-rutina",
			"title": "Patos: agua, refugio y rutina de cuidado",
			"description": "Una lista inicial para planificar el alojamiento y conversar con el veterinario antes de criar patos.",
			"category": "Manejo animal",
			"emoji": "🦆",
			"publishedAt": "2026-10-07",
			"updatedAt": "2026-10-07",
			"readMinutes": 3,
			"keywords": [
				"cría de patos",
				"agua limpia",
				"alojamiento aves",
				"manejo rural"
			],
			"sections": [
				{
					"heading": "Aclara qué sistema estás considerando",
					"paragraphs": ["Anota especie o tipo de pato, edad, cantidad prevista y propósito de la crianza. Si alguno de esos datos falta, resuélvelo con asesoría antes de definir instalaciones. La palabra pato no describe por sí sola todas las necesidades de un grupo.", "Esta es una guía de planificación. No promete producción ni recomienda una densidad, una dieta o un programa reproductivo. Tampoco afirma que Parcela Los Morochos críe o venda patos."]
				},
				{
					"heading": "Planifica el agua y la limpieza",
					"paragraphs": ["La FAO destaca la importancia del agua limpia en la producción avícola. En sus referencias de alojamiento de patos también se considera el efecto de la humedad sobre la cama y el manejo. Conviene revisar bebida, limpieza y drenaje como partes del mismo problema.", "Pregunta cómo podrán acceder las aves al agua y cómo se mantendrán limpios los equipos. Pide asesoría sobre las necesidades de comportamiento y aseo de la especie elegida. No supongas que tener un estanque cercano resuelve por sí solo el cuidado de las aves."]
				},
				{
					"heading": "Revisa refugio, zonas de descanso y recorridos",
					"paragraphs": ["Prepara un croquis con las áreas que imaginas y úsalo para conversar sobre clima, ventilación, protección y mantenimiento. Identifica dónde se mojaría la cama y por dónde circularía el agua de limpieza.", "Solicita que el profesional revise superficies, refugio y acceso para observar y atender a los animales. Un esquema de internet no demuestra que el alojamiento funcione en tu terreno. Evita copiar medidas sin considerar el grupo, el clima y el sistema."]
				},
				{
					"heading": "Define la rutina antes de recibir las aves",
					"paragraphs": ["Propón un registro sencillo de agua, alimento, limpieza y observaciones. Pide al veterinario qué cambios de consumo, conducta o aspecto deben motivar consulta y cómo actuar mientras recibes orientación. No uses la lista para diagnosticar o medicar.", "Si también habrá peces u otros animales, evalúa cada actividad por separado. La combinación de especies requiere un diseño específico; esta guía no recomienda llevar residuos avícolas a un estanque ni compartir agua sin evaluación técnica."]
				},
				{
					"heading": "Ejercicio: transforma el croquis en preguntas",
					"paragraphs": ["Marca en tu dibujo los lugares que todavía no sabes resolver. Para cada uno, escribe una pregunta y quién podría responderla. Añade una tarea de revisión del equipo y una alternativa ante una interrupción del agua.", "Las fuentes FAO enlazadas son manuales técnicos históricos, consultados el 7 de octubre de 2026. Ofrecen antecedentes generales y no fijan requisitos venezolanos actuales. Usa la guía junto con asesoría veterinaria y confirma las condiciones ambientales y administrativas aplicables."],
					"bullets": [
						"¿Dónde beberán y cómo se limpiará el equipo?",
						"¿Qué zona permanecerá adecuada para descansar?",
						"¿Cómo se recogerá y manejará el agua usada?",
						"¿Quién observará las aves y atenderá una incidencia?"
					]
				}
			],
			"sources": [{
				"label": "FAO · Farm structures: alojamiento de aves y patos",
				"url": "https://www.fao.org/4/s1250e/S1250E16.htm",
				"note": "Manual histórico para contextos africanos; se usan principios generales, no diseños ni densidades como norma local."
			}, {
				"label": "FAO · Small-scale poultry production",
				"url": "https://www.fao.org/4/y5169e/y5169e05.htm",
				"note": "Manual técnico histórico; referencia general de agua y manejo avícola, no prescripción específica para cada pato."
			}]
		},
		{
			"slug": "conejos-agua-alojamiento-clima",
			"title": "Conejos: agua, alojamiento y cuidado en el clima local",
			"description": "Cómo ordenar las preguntas sobre alojamiento, agua y observación antes de iniciar una crianza.",
			"category": "Manejo animal",
			"emoji": "🐇",
			"publishedAt": "2026-10-07",
			"updatedAt": "2026-10-07",
			"readMinutes": 3,
			"keywords": [
				"conejos",
				"alojamiento",
				"agua animal",
				"planificación de crianza"
			],
			"sections": [
				{
					"heading": "Prepara la consulta antes de comprar animales",
					"paragraphs": ["Describe el lugar, el clima y el tipo de actividad que estás evaluando. Anota qué animales piensas mantener, quién los cuidaría y qué dudas tienes. No conviertas esa primera idea en un calendario de reproducción ni en una promesa de ingresos.", "Pide asesoría veterinaria para elegir un sistema que contemple salud y bienestar. Esta guía no fija capacidad, dimensiones de alojamiento o metas productivas. Tampoco presenta la cría de conejos como una actividad confirmada de Parcela Los Morochos."]
				},
				{
					"heading": "Revisa agua y equipos desde el inicio",
					"paragraphs": ["La referencia FAO de alojamiento incluye la provisión de agua como parte del cuidado. Pregunta cómo comprobar que el equipo sea accesible y funcione para los animales previstos. Revisa con el especialista cómo se limpiará y qué ocurrirá si falla el suministro.", "Organiza una hoja para registrar revisión, problema detectado y acción tomada. No des por hecho que un recipiente lleno equivale a un sistema adecuado. Las necesidades concretas de alimentación y agua deben evaluarse según los animales y sus condiciones."]
				},
				{
					"heading": "Considera ventilación, protección y descanso",
					"paragraphs": ["Los manuales técnicos consultados tratan la ventilación, la limpieza y la protección del alojamiento. Usa esas cuestiones como punto de partida para discutir el clima del lugar. Las soluciones históricas de otros países no son mínimos actuales de bienestar para Venezuela.", "Lleva un dibujo o fotografías del sitio al profesional. Pregunta cómo se evitarían superficies que causen lesiones y cómo podrían descansar, moverse y ser observados los animales. No construyas únicamente a partir de una medida encontrada en una imagen."]
				},
				{
					"heading": "Acuerda una rutina de observación",
					"paragraphs": ["Solicita al veterinario una lista breve de aspectos que convenga revisar y de situaciones que requieran atención. En tu registro, separa lo observado de lo interpretado: escribe qué cambió y cuándo, sin convertirlo en un diagnóstico.", "No uses consejos antiguos para medicar, intervenir dientes o realizar otros procedimientos. Ante una preocupación sanitaria o de bienestar, busca valoración profesional. Una instalación limpia y un registro ordenado no garantizan ausencia de enfermedad."]
				},
				{
					"heading": "Ejercicio: identifica tres decisiones pendientes",
					"paragraphs": [
						"Elige tres dudas que impidan evaluar el proyecto. Para cada una, anota la información disponible, lo que falta comprobar y la persona a quien consultar. Puedes empezar por suministro de agua, protección climática y rutina de cuidado.",
						"Conserva las respuestas junto a la fecha de consulta. Si cambian el número o las características de los animales, vuelve a revisar el planteamiento. El ejercicio ayuda a organizar la decisión y no autoriza obras, tratamientos o una actividad comercial.",
						"Fuente técnica histórica de FAO revisada el 7 de octubre de 2026. Se utiliza para orientar preguntas sobre alojamiento y agua; no se adoptan recomendaciones antiguas de tratamiento, reproducción intensiva o manejo invasivo."
					],
					"bullets": [
						"¿Qué necesito confirmar sobre el alojamiento?",
						"¿Cómo se revisarán agua y limpieza?",
						"¿Quién atenderá los animales si el responsable se ausenta?"
					]
				}
			],
			"sources": [{
				"label": "FAO · Farm structures: alojamiento de conejos",
				"url": "https://www.fao.org/4/s1250e/S1250E17.htm",
				"note": "Manual técnico histórico; uso limitado a principios generales de alojamiento y agua. Requiere revisión veterinaria actual; no trasladar medidas ni tratamientos."
			}]
		}
	],
	{
		slug: "guardar-pesaje-mi-finca-sin-senal",
		category: "Mi Finca",
		emoji: "📱",
		title: "Cómo guardar un pesaje en Mi Finca cuando no hay señal",
		description: "Una ruta corta para preparar el teléfono, registrar el peso en el potrero y comprobar después que el cambio quedó respaldado.",
		publishedAt: "2026-09-11",
		updatedAt: "2026-09-11",
		readMinutes: 4,
		keywords: [
			"pesaje sin señal",
			"Mi Finca",
			"registro de ganado offline",
			"software ganadero Venezuela"
		],
		sections: [
			{
				heading: "Prepara el dispositivo antes de ir al potrero",
				paragraphs: ["Abre Mi Finca una vez con conexión y, si usas iPhone o iPad, añade el sitio a la pantalla de inicio desde Safari. Esto permite abrir la experiencia como una aplicación y conserva los archivos necesarios en el dispositivo.", "Comprueba que puedes identificar el animal por su arete, código o nombre interno. Llevar una identificación estable evita mezclar historiales cuando existen animales parecidos."],
				bullets: [
					"Teléfono con batería suficiente",
					"Animal identificado",
					"Báscula preparada",
					"Fecha y observaciones disponibles"
				]
			},
			{
				heading: "Registra el dato aunque no haya internet",
				paragraphs: ["Entra en Animales, selecciona el animal y abre la opción de pesaje. Introduce el peso en kilogramos, la fecha y cualquier observación útil. Al guardar, Mi Finca escribe primero el registro en el dispositivo.", "El estado de sincronización indica si el cambio continúa pendiente. No es necesario crear el mismo pesaje una segunda vez cuando regrese la señal."]
			},
			{
				heading: "Confirma el respaldo cuando vuelva la conexión",
				paragraphs: ["Al recuperar internet, mantén la aplicación abierta unos instantes. Mi Finca intenta sincronizar al volver la conexión, al regresar a la aplicación y cada cinco minutos mientras permanece abierta.", "Revisa el centro de sincronización. Cuando el contador llegue a cero y el registro figure como sincronizado, el dato ya no depende únicamente de ese dispositivo."]
			}
		]
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
		keywords: [
			"peso del ganado",
			"registro bovino",
			"ganadería Venezuela",
			"software ganadero sin internet"
		],
		sections: [
			{
				heading: "Por qué un peso aislado no cuenta toda la historia",
				paragraphs: ["El valor de pesar un animal aparece cuando el dato se compara con su edad, su alimentación, su estado sanitario y un pesaje anterior. Esa secuencia permite reconocer si el crecimiento avanza como se esperaba o si hace falta revisar el manejo.", "Un registro útil identifica al animal con un código estable. Puede ser un arete, un número interno o una combinación de finca y lote. El nombre ayuda, pero no debe ser la única forma de identificación cuando el rebaño crece."],
				bullets: [
					"Código o arete",
					"Fecha y peso en kilogramos",
					"Edad o fecha de nacimiento",
					"Lote y propósito productivo",
					"Observaciones de alimentación y salud"
				]
			},
			{
				heading: "Calcula la ganancia entre dos pesajes",
				paragraphs: ["Resta el peso anterior al peso actual para conocer la ganancia total. Si quieres comparar periodos de distinta duración, divide esa diferencia entre los días transcurridos. Así obtienes una ganancia diaria promedio que puede revisarse por animal o por lote.", "No interpretes el resultado sin contexto. Cambios de báscula, horario, llenado digestivo, clima y manejo pueden alterar una medición. Mantener una rutina similar mejora la comparabilidad."]
			},
			{
				heading: "Cómo registrar cuando falla la señal",
				paragraphs: ["En la plataforma Mi Finca, el registro se escribe primero en el dispositivo. Puedes identificar el animal y guardar el pesaje mientras estás en el potrero. Cuando vuelve una conexión estable, los cambios pendientes se envían al respaldo central.", "Antes de salir a una zona sin cobertura, abre la aplicación una vez y confirma que indique que la copia local está activa. Mantén el dispositivo cargado y, cuando sea posible, utiliza una batería externa."]
			},
			{
				heading: "Convierte el historial en decisiones",
				paragraphs: ["Compara animales de edad, sexo y manejo semejantes. Una caída sostenida merece una revisión del alimento, agua, parásitos, movilidad y salud general. Para diagnósticos o tratamientos, consulta a un médico veterinario que conozca el sistema productivo."]
			}
		]
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
		keywords: [
			"dividir finca en potreros",
			"plano de finca",
			"manejo de potreros",
			"software para fincas"
		],
		sections: [
			{
				heading: "Comienza con la superficie que realmente conoces",
				paragraphs: ["El primer plano puede ser proporcional. Registra la superficie total en hectáreas o metros cuadrados y crea divisiones según el uso: potreros, siembras, instalaciones, fuentes de agua, bosque o vías.", "Si todavía no cuentas con coordenadas precisas, evita presentar el dibujo como un levantamiento topográfico. La representación inicial sirve para organizar decisiones; los linderos legales deben apoyarse en documentos y mediciones profesionales."]
			},
			{
				heading: "Describe cada división con información útil",
				paragraphs: ["Un nombre claro permite encontrar rápidamente cada área. Añade su superficie, uso actual, acceso al agua, tipo de cerca, observaciones del suelo y cualquier restricción estacional."],
				bullets: [
					"Nombre reconocible en campo",
					"Uso productivo",
					"Superficie",
					"Acceso y agua",
					"Notas de mantenimiento",
					"Cultivo o grupo animal asignado"
				]
			},
			{
				heading: "Evita asignar más terreno del disponible",
				paragraphs: ["La suma de todas las divisiones no debe superar la superficie total configurada. Mi Finca calcula el área todavía sin asignar y bloquea una división que exceda el terreno disponible.", "Si una mensura posterior cambia la superficie, actualiza primero la configuración general y revisa las divisiones. Conserva los documentos técnicos fuera del sistema hasta contar con un módulo de archivos y permisos adecuado."]
			},
			{
				heading: "El plano como punto de partida",
				paragraphs: ["Al relacionar áreas con animales, cultivos, tareas y periodos, el plano deja de ser una imagen estática. Se convierte en una estructura para observar ocupación, rotación, mantenimiento y próximos trabajos."]
			}
		]
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
		keywords: [
			"registro de finca",
			"control de granja",
			"administración agropecuaria",
			"aplicación para finca"
		],
		sections: [
			{
				heading: "Define qué decisión debe ayudar a tomar cada dato",
				paragraphs: ["Registrar por registrar crea trabajo y no necesariamente claridad. Antes de abrir una ficha, pregunta qué decisión apoyará: identificar un animal, comparar crecimiento, planificar un ciclo, evitar que falte un insumo o conocer qué área está ocupada.", "Comienza con pocos campos consistentes. Es mejor completar cinco datos cada semana que diseñar una planilla extensa que nadie puede mantener."]
			},
			{
				heading: "Crea una base común",
				paragraphs: ["Configura el nombre, ubicación, superficie y objetivo principal de tu finca. Luego registra las divisiones del terreno. Esa base permite relacionar los demás movimientos con un lugar y un propósito."],
				bullets: [
					"Identidad de la finca",
					"Áreas y potreros",
					"Animales o lotes",
					"Cultivos y ciclos",
					"Inventario",
					"Tareas y responsables"
				]
			},
			{
				heading: "Usa nombres y códigos que sobrevivan al tiempo",
				paragraphs: ["Un código debe ser corto, único y comprensible. Evita depender de posiciones como ‘el becerro del corral’, porque cambian. Para inventario, separa el nombre del producto, la unidad de medida y la ubicación.", "Acuerda una convención con las personas que registran datos. La consistencia facilita buscar, filtrar y comparar más adelante."]
			},
			{
				heading: "Revisa lo pendiente cuando regrese internet",
				paragraphs: ["La copia local permite continuar en campo. Al recuperar conexión, comprueba el centro de sincronización hasta que no queden cambios pendientes. Ese hábito reduce el riesgo de que un teléfono sea el único lugar donde existe un registro."]
			}
		]
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
		keywords: [
			"bioseguridad granja",
			"sanidad animal",
			"manejo de animales",
			"prevención agropecuaria"
		],
		sections: [
			{
				heading: "La bioseguridad es una rutina, no un documento guardado",
				paragraphs: ["El objetivo es reducir la entrada y circulación de agentes que puedan afectar animales, personas o producción. Las medidas cambian según especie, tamaño, clima y riesgos locales, por lo que el plan debe revisarse con profesionales sanitarios."]
			},
			{
				heading: "Controla movimientos y separa riesgos",
				paragraphs: ["Registra entradas de animales, visitantes, vehículos y equipos. Cuando ingresa un animal nuevo o uno presenta signos inusuales, evita mezclarlo inmediatamente con el resto y solicita orientación veterinaria."],
				bullets: [
					"Zona de recepción o aislamiento",
					"Ropa y calzado de trabajo",
					"Limpieza de herramientas compartidas",
					"Control de alimento y agua",
					"Manejo seguro de residuos",
					"Registro de observaciones y fechas"
				]
			},
			{
				heading: "Observa cambios de manera consistente",
				paragraphs: ["Apetito, consumo de agua, comportamiento, desplazamiento y condición corporal pueden advertir que algo cambió. Una ficha con fecha, grupo, signos observados y acción tomada ayuda a explicar el caso a un profesional."]
			},
			{
				heading: "Cuándo escalar",
				paragraphs: ["Mortalidad inesperada, signos neurológicos, dificultad respiratoria, abortos agrupados o propagación rápida requieren atención profesional. No utilices una guía general para diagnosticar ni medicar. Contacta a un médico veterinario y sigue las exigencias sanitarias aplicables."]
			}
		]
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
		keywords: [
			"semen bovino Venezuela",
			"embriones bovinos",
			"genética animal",
			"comprar ganado genética"
		],
		sections: [
			{
				heading: "Parte del objetivo productivo",
				paragraphs: ["La genética no se elige por una cifra aislada o una fotografía. Define primero si buscas fertilidad, adaptación, producción de leche, crecimiento, habilidad materna, calidad de canal u otro objetivo medible dentro de tu sistema."]
			},
			{
				heading: "Solicita evidencia verificable",
				paragraphs: ["Pide identificación del donante, genealogía cuando aplique, evaluaciones disponibles, fecha y centro de procesamiento, condiciones de conservación y documentación sanitaria. La información debe corresponder exactamente a la unidad ofrecida."],
				bullets: [
					"Identidad y lote",
					"Origen y trazabilidad",
					"Pruebas o evaluaciones",
					"Condición sanitaria",
					"Cadena de frío",
					"Responsable técnico",
					"Condiciones de entrega y reclamación"
				]
			},
			{
				heading: "La logística forma parte del producto",
				paragraphs: ["Semen y embriones dependen de conservación, manipulación y transporte especializados. Confirma quién asume cada etapa, cómo se verifica la temperatura y qué ocurre si la entrega se retrasa o el contenedor presenta una incidencia."]
			},
			{
				heading: "Marketplace con responsabilidad",
				paragraphs: ["Una publicación ayuda a descubrir una oferta, pero no sustituye la verificación. Antes de negociar, confirma identidad del vendedor, documentos, condiciones sanitarias y acompañamiento de un profesional acreditado. No realices pagos basados únicamente en mensajes o capturas."]
			}
		]
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
		keywords: [
			"trazabilidad cacao",
			"registro cultivo café",
			"cacao Venezuela",
			"control de cultivos"
		],
		sections: [
			{
				heading: "La historia del producto comienza en el lote",
				paragraphs: ["Asigna un nombre estable a cada área de cultivo y conserva su superficie. A partir de allí puedes relacionar material de siembra, fecha, labores, observaciones del clima, cosecha y manejo posterior."]
			},
			{
				heading: "Registra hitos, no cada minuto",
				paragraphs: ["El sistema debe ser viable durante una jornada real. Prioriza los eventos que cambian el estado del cultivo o permiten explicar un resultado."],
				bullets: [
					"Siembra o establecimiento",
					"Material o variedad",
					"Fertilización y manejo",
					"Incidencias sanitarias",
					"Inicio y volumen de cosecha",
					"Fermentación o beneficio",
					"Secado y almacenamiento"
				]
			},
			{
				heading: "Conecta cantidad con calidad",
				paragraphs: ["Un volumen de cosecha es más útil cuando se relaciona con el lote y las condiciones de poscosecha. Esa comparación ayuda a reconocer prácticas que conviene repetir y etapas que requieren ajuste."]
			},
			{
				heading: "Trabaja sin conexión y respalda después",
				paragraphs: ["Registra la labor desde el área productiva aunque no exista cobertura. Al recuperar internet, la aplicación envía los cambios al respaldo. Revisa siempre el indicador de sincronización antes de cambiar de dispositivo."]
			}
		]
	}
];
var platformGuides = [
	{
		"slug": "fincas-comunidad",
		"title": "Presenta tu finca y participa en la comunidad",
		"description": "Distingue tu ficha pública del registro privado y comparte novedades del campo.",
		"emoji": "🌿",
		"target": "/fincas#registrar-finca",
		"label": "Registrar mi ficha pública",
		"screen": "Ficha pública de la finca",
		"fields": [
			["Nombre de la finca", "Tu finca"],
			["Responsable y teléfono", "Contacto que autorizas publicar"],
			["Actividades", "Producción / Visitas / Capacitaciones"]
		],
		"steps": [
			["Registra tu ficha pública", "Abre Fincas y completa nombre, responsable, teléfono, estado, municipio, descripción, rubros y actividades. Añade fotografía o logo y redes si quieres. Tu plano privado, inventario y costos no se copian a la ficha pública."],
			["Espera la revisión", "Guarda la ficha y autoriza el contenido público. Si estás sin señal queda en este dispositivo. Después de recuperar conexión y acceso se enviará para revisión. Publicar una ficha no verifica titularidad ni sustituye trámites oficiales."],
			["Comparte una novedad", "Después de que tu finca esté publicada, entra en Comunidad y selecciónala como autora. Escribe hasta 500 caracteres sobre cosechas, jornadas o aprendizajes. Las publicaciones y comentarios pasan por revisión. Puedes retirar tu ficha y publicaciones."],
			["Conversa y comercializa", "En publicaciones reales puedes dar Me gusta, comentar y compartir enlaces. Las muestras no reciben interacciones reales. Para vender productos, animales o la propiedad crea además un anuncio en Mercado Agro. Coordina visitas directamente con el responsable."]
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
			["Accesos principales", "Mi finca · Mercado Agro · Profesionales"],
			["También a mano", "Aprende · Comunidad"],
			["Menú agrupado", "Gestionar · Comprar y buscar apoyo · Participar"],
			["Estado de red", "Icono Wi-Fi / Conexión en la cabecera"]
		],
		"steps": [
			["Encuentra la herramienta que necesitas", "La cabecera da acceso a Mi finca, Mercado Agro, Profesionales, Aprende y Comunidad. En el teléfono, abre el botón de menú: esas cinco opciones aparecen primero. Debajo puedes desplegar Gestionar mi finca, Comprar y buscar apoyo y Conocer y participar. Allí están Descargar sin señal, Fincas de Venezuela, Productos Parcela Los Morochos, Empresas e insumos, Instituciones, Proyectos, Stickers del agro, Nuestra producción y Nosotros. Accesibilidad, las opciones de cuenta y las redes oficiales siguen en el menú."],
			["Decide cómo empezar", "Mi Finca puede abrir en modo local para guardar en este dispositivo. Para publicar en Mercado Agro, enviar tu perfil profesional y usar respaldo central, inicia sesión con la cuenta de ChatGPT mediante el acceso disponible. El acceso de cuenta inicial necesita internet."],
			["Revisa Seguridad y privacidad", "Lee el aviso de datos, confirma el correo de tu cuenta y agrega tu celular obligatorio. Esta confirmación compara el dato; no envía códigos por correo o SMS. Autoriza el contenido público si deseas publicar un anuncio o un perfil profesional. Los registros internos de la finca y el contacto público tienen usos diferentes; completa únicamente lo que quieres mostrar."],
			["Distingue conexión y guardado", "Toca el icono Wi-Fi o Conexión junto a Mi finca en la cabecera pública para ver red y detalles de guardado. Con conexión solo significa que el navegador detecta red: no confirma el envío ni una copia central. Dentro de Mi Finca usa su control de estado y Sincronización para comprobar pendientes, incidencias y confirmaciones del servidor. Finca Escuela es una práctica separada y no consulta estos registros."]
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
			["Cabecera pública", "Icono Wi-Fi / Conexión"],
			["Sin conexión", "Solo datos y recursos preparados"],
			["Cambios pendientes", "No equivalen a un respaldo confirmado"],
			["Mi Finca", "Abrir Sincronización y revisar el estado"]
		],
		"steps": [
			["Prepara el equipo con señal", "Abre la plataforma, Mi Finca y Descargar sin señal antes de salir al campo. En la biblioteca, prepara los recursos y comprueba el resultado de la descarga en ese navegador. Instalar la app web no descarga por sí solo todos los contenidos. Haz una prueba breve sin señal antes de depender de ella."],
			["Registra como siempre", "Puedes crear animales, pesajes, áreas, ciclos e inventario sin señal. Los formularios de anuncios y perfiles pueden quedar pendientes de envío si ya estaban cargados. Guardar escribe primero en el dispositivo."],
			["Recupera señal y conserva la app abierta", "Al recuperar internet, mantén la app abierta y la sesión disponible si usas una cuenta. Mi Finca intenta sincronizar al volver la señal, al regresar a la aplicación y periódicamente mientras está abierta. En modo local no se confirma un respaldo de cuenta. Las publicaciones públicas también requieren autorización y revisión."],
			["Comprueba el estado real", "El icono de conexión está en la cabecera pública, junto a Mi finca; ya no ocupa el centro inferior de la pantalla. Tócalo para leer los detalles. Dentro de Mi Finca abre Sincronización y comprueba pendientes, conflictos y confirmaciones. Con conexión o cero cambios pendientes no bastan para demostrar que exista una copia central. Si hay un error de acceso o consentimiento, resuélvelo antes de dar el envío por terminado."]
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
			["iPhone / iPad", "Safari → Compartir → Agregar a Inicio"],
			["Android", "Chrome → Menú → Instalar aplicación"],
			["Ordenador", "Navegador → Instalar app"]
		],
		"steps": [
			["En iPhone o iPad", "Abre el sitio en Safari, toca Compartir y elige Agregar a Inicio o Añadir a pantalla de inicio, según tu versión. Si aparece la opción Abrir como app web, actívala y confirma Agregar. Abre después el nuevo icono."],
			["En Android", "Abre el sitio en Chrome. Acepta Instalar aplicación si se ofrece; también puedes abrir el menú y buscar Agregar a la pantalla principal o Instalar. Sigue los pasos del navegador."],
			["En computador", "En Chrome o Edge busca la opción de instalar en el menú o barra de direcciones. En Safari para Mac, si está disponible, utiliza Añadir al Dock. Si tu navegador no instala apps, puedes usar la web normalmente."],
			["Prueba antes de ir al campo", "Entra a Mi Finca, consulta los recursos necesarios y luego haz una prueba breve sin señal. Usa siempre el mismo navegador o la app instalada para acceder al espacio que preparaste."]
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
			["Nombre de la finca", "Nombre de tu propiedad"],
			["Forma del perímetro", "Irregular / polígono"],
			["Estado", "Apure · ejemplo"],
			["Coordenadas", "Este y Norte de cada vértice"]
		],
		"steps": [
			["Pon nombre y ubicación", "Abre Mi Finca. Completa el nombre, ubicación y objetivo de tu unidad productiva. Selecciona el estado correspondiente; el mapa resaltará esa ubicación."],
			["Elige la forma real", "Selecciona Irregular / polígono, Rectángulo, Triángulo u Óvalo. Introduce las medidas que correspondan a tu propiedad. Un terreno irregular necesita datos de su perímetro; una superficie total no describe por sí sola todos sus lados."],
			["Transcribe el plano que tienes", "En los datos técnicos puedes agregar vértices, coordenadas Este y Norte, datum, zona UTM, linderos, ubicación y otras referencias. Mantén el orden de los vértices y el mismo sistema de coordenadas. El sistema calcula el área cuando hay un polígono válido."],
			["Guarda y revisa el dibujo", "Toca Crear plano y espacio de trabajo. Abre Territorio / planos y compara el perímetro con tu documento. Puedes corregir los datos desde Configurar finca."]
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
			["Tipo de área", "Potrero / Cultivo / Laguna"],
			["Nombre", "Potrero norte · ejemplo"],
			["Cultivo", "Cacao · ejemplo"],
			["Superficie", "Medida de tu área"]
		],
		"steps": [
			["Abre Territorio / planos", "Después de crear la finca, entra en el plano. Verás el área total, las divisiones registradas y la superficie disponible. No hay animales ni cultivos precargados en tu finca."],
			["Agrega un área", "Elige potrero, cultivo, laguna / agua, casa, vaquera / corrales, galpón, depósito, bosque, vía u otro uso. Pon un nombre y su superficie. Si es cultivo, selecciona el rubro o escribe otro y añade la variedad si la conoces."],
			["Colócala donde corresponde", "Mueve el área en el plano con el ratón o con el dedo. Ajusta la distribución para representar su ubicación aproximada. Selecciona una división para revisar o editar sus datos; utiliza Dividir cuando necesites separar un área."],
			["Revisa antes de planificar", "Comprueba las superficies y las áreas disponibles antes de agregar más divisiones. Usa nombres fáciles de reconocer: Potrero norte, Cacao 1 o Laguna principal. Guarda los cambios en tu dispositivo."]
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
			["Animal", "Selecciona la identificación correcta"],
			["Peso (kg)", "Kilogramos medidos"],
			["Fecha", "Fecha de la medición"],
			["Observaciones", "Contexto útil del pesaje"]
		],
		"steps": [
			["Crea la identificación", "En Animales toca registrar animal. Selecciona especie o escribe otra y utiliza un arete, código o nombre que no se confunda con otros."],
			["Completa lo que sabes", "Añade raza, sexo, nacimiento, peso inicial, propósito y observaciones según los campos disponibles. No inventes una fecha ni un peso si no lo conoces."],
			["Elige el animal antes de pesar", "El botón general Registrar pesaje abre la selección de Animal vacía: elige el arete, código o nombre correcto, aunque hayas usado el buscador. El botón de peso de una fila conserva la selección de ese animal. Completa Peso (kg), Fecha y Observaciones; Guardar pesaje se habilita cuando hay un animal elegido. Revisa la identidad antes de guardar."],
			["Consulta y corrige", "Abre la ficha para comprobar los datos. Si registraste un ejemplo por error, utiliza la opción de eliminar y comprueba después el estado de sincronización."]
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
			["Nombre del ciclo", "Cosecha de maíz · ejemplo"],
			["Categoría", "Maíz"],
			["Estado", "Planificado / Activo / Finalizado"],
			["Fecha prevista de cierre", "Tu planificación"]
		],
		"steps": [
			["Crea un ciclo", "En Producción toca nuevo ciclo productivo, pon un nombre y rubro, fechas, estado y objetivo. Abre luego el registro guardado para revisar o editarlo. Los cultivos y especies del catálogo son sugerencias; puedes usar otros."],
			["Lleva el inventario", "En Inventario registra artículo, categoría, cantidad, unidad, mínimo y ubicación. Consulta cada registro y documenta los cambios de existencias."],
			["Anota costos y controles", "En Planificación y costos registra cantidades y supuestos de alimento, agua, área y costos. En finanzas anota movimientos y referencias de factura; en sanidad registra eventos, fechas y profesional responsable."],
			["Interpreta tus resultados", "Revisa los totales y gráficas basados en tus propios datos. Ajusta supuestos antes de tomar decisiones. Una estimación de ingreso no es una promesa de rentabilidad."]
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
			["Precio por unidad (opcional)", "Vacío si todavía está por acordar"],
			["Moneda original", "USD · VES · COP · EUR"],
			["Referencia visible", "Dólares y bolívares cuando hay tasa"],
			["Fuentes y otras monedas", "Consulta EUR o COP y la fecha de la tasa"],
			["Contacto público", "Responsable y teléfono con código de país"]
		],
		"steps": [
			["Accede y autoriza la publicación", "Abre Mercado Agro y toca Publicar un producto. Inicia sesión y revisa Seguridad y privacidad para autorizar el contenido público."],
			["Describe el producto y su precio", "Completa rubro, ubicación, presentación, unidad y pedido mínimo. Precio por unidad es opcional: déjalo vacío si aún no hay un importe acordado; no escribas cero para decir a consultar. Si indicas un precio, elige su moneda original: USD, VES, COP o EUR. Los equivalentes en dólares y bolívares son referencias; los botones EUR y COP y Fuentes y otras monedas permiten consultar más detalle. El precio y la unidad originales no se cambian."],
			["Revisa imagen, contacto y referencias", "Añade una fotografía propia y describe disponibilidad y condiciones. Completa responsable y teléfono; publica solo referencias de ubicación que quieras mostrar. Antes de comparar importes, revisa la fuente, Fecha de la tasa y Última consulta a la fuente: BCV para bolívares, BCE para euros y TRM Colombia para pesos. Una tasa anterior o sin conexión se presenta como estimada; si falta una tasa verificada, la conversión no está disponible. Sin precio publicado puedes convertir un importe recibido, pero eso no fija el precio del anuncio."],
			["Guarda y espera la revisión", "El anuncio se envía a revisión con internet. Sin conexión queda guardado y pendiente. Cuando esté publicado, los compradores podrán abrir la ficha y contactar. Acuerda disponibilidad, pago y transporte con la otra parte; publicar no completa por sí solo una venta."]
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
			["Modalidad", "Activa solo la que tenga un costo definido"],
			["Importe", "Tarifa original que quieres publicar"],
			["Moneda", "USD · VES · COP · EUR"],
			["Precio por", "sesión · hora · visita · jornada · curso"],
			["Condiciones", "Alcance, traslados, materiales e impuestos"]
		],
		"steps": [
			["Abre Profesionales", "Consulta las tarjetas y toca Ver perfil completo. Las muestras están identificadas. Para registrar el tuyo, inicia sesión y autoriza el contenido público."],
			["Explica cómo ayudas", "Completa nombre, profesión, especialidades, estado, municipio, modalidad, etapa y años de experiencia. Puedes comenzar con cero años. Elige rubros y otros estados donde atiendes. Puedes registrarte como persona natural o empresa; para una empresa añade razón social, nombre comercial y registro declarado."],
			["Añade trayectoria y tarifas opcionales", "Completa fotografía, formación, servicios y proyectos sin datos privados de clientes. Abre Tarifas por modalidad (opcional) y activa solo las modalidades para las que quieras publicar un costo. Para cada una indica Importe, Moneda y Precio por; también existen proyecto y hectárea. Las modalidades sin tarifa quedan a consultar. En ¿Cómo se reserva tu servicio? explica alcance, traslados, materiales, impuestos y condiciones."],
			["Revisa y envía tu perfil", "Comprueba contacto, trayectoria y cada tarifa antes de enviar a revisión. Las conversiones en USD, VES, COP y EUR son referencias: consulta fuente y fecha, conserva el importe original y confirma el acuerdo directamente. Si el perfil no tiene tarifas, se muestra Precio a consultar y puedes convertir un importe recibido sin publicarlo como tarifa. Tras la aprobación, comparte el enlace de tu ficha; la plataforma no contrata ni cobra el servicio por ti."]
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
			["Para quién compras", "Para mi hogar / Para mi negocio"],
			["Producto", "Elegir presentación"],
			["Detalle", "Corte, cantidad, unidad y preparación"],
			["Contacto", "Responsable, celular y correo opcional"],
			["Envío", "Solicitar disponibilidad / cotización"]
		],
		"steps": [
			["Elige hogar o negocio", "En el menú abre Comprar y buscar apoyo y después Productos Parcela Los Morochos. La tienda corresponde a la finca; Mercado Agro reúne anuncios de otros productores. Selecciona Para mi hogar o Para mi negocio antes de preparar la consulta. Los productos, fotos y líneas en desarrollo no confirman existencias."],
			["Personaliza cada producto", "Toca Elegir presentación, elige corte o presentación, cantidad, unidad y preparación. Puedes combinar varios cortes. Abre Solicitud o Cotización para revisarlos; Editar corte y cantidad permite corregir una línea. El contacto, los datos del negocio, la entrega y las notas permanecen al editar o cerrar y reabrir la solicitud mientras sigas en esta página; recargar o salir puede perder ese texto todavía no enviado."],
			["Completa contacto y logística", "Indica Nombre del responsable, Celular / WhatsApp y correo opcional. Para un negocio añade nombre, tipo, ciudad y estado de entrega; puedes indicar frecuencia, fecha y modalidad de entrega. Usa Destino, fecha y otras indicaciones para precisar lo necesario. No se calcula un total porque los precios se confirman después. Si recibes una cotización, Convertir un importe recibido convierte exactamente esa cifra: no la multiplica por la cantidad ni fija un precio por unidad."],
			["Guarda y comprueba el resultado", "Pulsa Solicitar disponibilidad o Solicitar cotización empresarial. El formulario se bloquea mientras guarda y conserva los datos si el guardado falla. Tras guardar la solicitud correctamente, el contacto del formulario se vacía. Lee si quedó enviada o guardada en este dispositivo y pendiente de envío; después la finca confirmará cortes, disponibilidad, precio, peso final y entrega. No se hace un cobro automático."]
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
			["Nombre del proyecto", "Tu idea para el agro"],
			["Qué tienes", "Recursos disponibles"],
			["Qué necesitas", "Apoyo o alianzas"],
			["Aporte a Venezuela", "Impacto esperado"]
		],
		"steps": [
			["Presenta un proyecto", "En el menú, despliega Conocer y participar y abre Proyectos. Responde de qué se trata, qué tienes, qué necesitas, aporte a tu comunidad y apoyo solicitado. La propuesta necesita revisión antes de hacerse pública."],
			["Encuentra orientación", "En Comprar y buscar apoyo abre Instituciones y consulta temas y enlaces de registros, tierra, sanidad y movilización. Leer una guía no inicia un trámite. Verifica requisitos vigentes directamente con la entidad antes de actuar."],
			["Propón una mejora", "Usa Tu idea para decir en qué área hace falta una herramienta, explicar tu sugerencia y añadir contacto opcional. Lee el resultado del formulario para distinguir guardado local y envío; no des por recibida una propuesta solo porque el navegador tenga conexión."],
			["Conecta con la comunidad", "Explora Profesionales, Mercado Agro y alianzas. Las propuestas no garantizan inversión o asistencia; ayudan a hacer visible una necesidad y abrir conversaciones."]
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
			["Inicio", "Elige qué quieres descubrir"],
			["Cultivos", "Cilantro · Maíz · Tomate"],
			["Animales", "Bovinos · Porcinos · Aves"],
			["Cuaderno", "Progreso y registros ficticios de práctica"]
		],
		"result": "Progreso educativo local, sin registros reales",
		"steps": [
			["Elige Cultivos o Animales", "Abre Finca Escuela. En Inicio verás dos grupos: Cultivos y Animales. También puedes usar esos nombres en la navegación superior. Elige cilantro, maíz o tomate; en animales, bovinos, porcinos o aves. Cada recorrido conserva su propio progreso y puedes cambiar de actividad."],
			["Sigue el objetivo del recorrido", "El cilantro tiene siete pasos; maíz, nueve; tomate, bovinos, porcinos y aves, ocho. Son ciclos simulados con tiempo acelerado, no calendarios universales ni una certificación. Explorar muestra instrucciones breves; Profundizar añade explicaciones y preguntas para comparar tu razonamiento, conservando el avance. En móvil, la escena queda junto al área de decisiones, que puedes desplazar; los botones Explorar y Profundizar siguen disponibles dentro de la actividad. En Laboratorio: suelo y espacio, Volver a observar permite revisar la misma muestra y regresar a su vista completa sin reiniciar el progreso."],
			["Consulta tu cuaderno", "Toca Cuaderno o Ver mi cuaderno para revisar lo aprendido. La cosecha del cilantro y los recorridos de cultivos y animales aparecen en apartados distintos. Un aviso de que aún no cosechaste cilantro se refiere solo a ese cultivo; no significa que perdiste los otros recorridos. Los registros son ficticios y se conservan en este navegador, separados de Mi Finca y de cualquier cuenta."],
			["Practica con seguridad", "Puedes volver a explorar un recorrido a tu ritmo. No introduzcas datos personales ni registros reales: el juego no publica, cobra ni sincroniza información con tu finca. En el campo real, una persona menor debe estar acompañada por una persona adulta responsable y observar a los animales desde un lugar seguro. Ante problemas de salud, consulta a un profesional; la actividad no indica medicamentos ni dosis."]
		],
		"tip": "Esta es una vista previa educativa ilustrada. El progreso depende del almacenamiento de este navegador; si lo borras o cambias de navegador, puede no estar disponible. Las escenas y los ejemplos no sustituyen orientación técnica local."
	}
].map((input) => ({
	slug: input.slug,
	category: "Usa la plataforma",
	emoji: input.emoji,
	title: input.title,
	description: input.description,
	publishedAt: input.slug === "finca-escuela-cultivos-animales" ? "2026-10-15" : "2026-10-04",
	updatedAt: "2026-10-15",
	readMinutes: 5,
	keywords: [
		"Venezuela Agro",
		input.title,
		"plataforma agropecuaria Venezuela",
		"guía paso a paso",
		...input.fields.map(([label]) => label)
	],
	sections: input.steps.map(([heading, text]) => ({
		heading,
		paragraphs: [text]
	})),
	tutorial: {
		targetHref: input.target,
		targetLabel: input.label,
		visual: `/guias/${input.slug}.svg`,
		screen: input.screen,
		fields: input.fields,
		tip: input.tip,
		result: input.result,
		form: input.form
	}
}));
//#endregion
//#region components/offline-public-drafts.tsx
function OfflinePublicDrafts() {
	const [owner, setOwner] = (0, import_react.useState)(null), [kind, setKind] = (0, import_react.useState)("listing"), [message, setMessage] = (0, import_react.useState)(""), [dirty, setDirty] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!dirty) return;
		const warn = (event) => {
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [dirty]);
	async function start() {
		try {
			setOwner(await localOwner());
		} catch {
			setMessage("No se pudo identificar un espacio local seguro. Abre Mi Finca y elige tu espacio.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl bg-white p-5 sm:p-7",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Prepara una publicación"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 leading-7",
				children: "Guarda el formulario antes de cerrar. Los campos sin guardar no se conservan. Una copia local no está publicada ni recibida: necesita una cuenta verificada, permisos y conexión para enviarse y pasar revisión."
			}),
			!owner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => void start(),
				className: "mt-4 rounded-full bg-[#4c6b3a] px-5 py-3 font-bold text-white",
				children: "Elegir espacio para guardar"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "my-4 rounded-xl bg-[#eee6d8] p-4 text-sm",
					children: owner === "device-local" ? "Espacio solo de este dispositivo. Estos borradores no se asignarán automáticamente a ninguna cuenta. Conserva una copia; para publicarlos inicia sesión y traslada los datos de forma explícita." : "Espacio de cuenta elegido en este dispositivo. Esto no equivale a iniciar sesión en el servidor; si cambias de cuenta se impedirá guardar en la anterior."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block font-bold",
					children: ["Qué quieres preparar", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: kind,
						onChange: (event) => {
							if (dirty && !window.confirm("¿Cambiar de formulario? Guarda primero si quieres conservar los campos todavía no guardados.")) return;
							setKind(event.target.value);
							setDirty(false);
						},
						className: "my-3 block w-full rounded-lg border p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "listing",
								children: "Anuncio de mercado"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "professional",
								children: "Perfil profesional o empresa"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "farm",
								children: "Ficha pública de finca"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "project",
								children: "Proyecto o alianza"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					onChangeCapture: () => setDirty(true),
					onResetCapture: () => setDirty(false),
					children: kind === "listing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingForm, {
						sellerName: "",
						draftOwner: owner
					}) : kind === "professional" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfessionalForm, {
						name: "",
						draftOwner: owner
					}) : kind === "project" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectForm, { draftOwner: owner }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicFarmForm, {
						name: "",
						userId: owner,
						onSave: async (type, payload) => {
							try {
								await queueMutation({
									expectedOwner: owner,
									entityType: type,
									entityId: createLocalId("public_farm"),
									action: "upsert",
									payload
								});
								setMessage("Ficha guardada en este espacio. Está pendiente de conexión, cuenta y revisión; no es pública.");
								return true;
							} catch {
								setMessage("No se pudo guardar. Revisa tu espacio y el almacenamiento; el formulario conserva sus datos.");
								return false;
							}
						}
					})
				}, owner + kind)
			] }),
			message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-4 text-sm",
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "/app",
				className: "mt-5 inline-block text-sm font-bold underline",
				children: "Abrir Sincronización y descargar copia de estos datos"
			})
		]
	});
}
//#endregion
//#region lib/offline-public-types.ts
var OFFLINE_PUBLIC_KINDS = [
	"marketplace",
	"professional",
	"project",
	"farm",
	"post"
];
/** Only these existing public routes can be opened from a downloaded snapshot. */
function offlinePublicHref(kind, id) {
	const path = {
		marketplace: "/marketplace/",
		professional: "/profesionales/",
		project: "/proyectos",
		farm: "/fincas/",
		post: "/red/"
	}[kind];
	return kind === "project" ? path : path + encodeURIComponent(id);
}
var itemSchema = objectType({
	kind: enumType(OFFLINE_PUBLIC_KINDS),
	id: stringType().min(1).max(160).regex(/^[a-zA-Z0-9_-]+$/),
	title: stringType().max(180),
	summary: stringType().max(2e3),
	location: stringType().max(180),
	category: stringType().max(500),
	href: stringType().max(512),
	updatedAt: stringType().max(40)
}).strict().refine((item) => item.href === offlinePublicHref(item.kind, item.id), {
	message: "The snapshot link must reference its matching public route.",
	path: ["href"]
});
objectType({
	schemaVersion: literalType(1),
	generatedAt: stringType().datetime({ offset: true }),
	items: arrayType(itemSchema).max(OFFLINE_PUBLIC_KINDS.length * 100),
	truncatedKinds: arrayType(enumType(OFFLINE_PUBLIC_KINDS)).max(OFFLINE_PUBLIC_KINDS.length)
}).strict().superRefine((snapshot, ctx) => {
	if (new TextEncoder().encode(JSON.stringify(snapshot)).byteLength > 2e6) ctx.addIssue({
		code: ZodIssueCode.custom,
		message: "The public snapshot exceeds the download size limit."
	});
	if (new Set(snapshot.truncatedKinds).size !== snapshot.truncatedKinds.length) ctx.addIssue({
		code: ZodIssueCode.custom,
		path: ["truncatedKinds"],
		message: "Duplicate content kinds."
	});
	const seen = /* @__PURE__ */ new Set();
	for (const [index, item] of snapshot.items.entries()) {
		const key = `${item.kind}:${item.id}`;
		if (seen.has(key)) ctx.addIssue({
			code: ZodIssueCode.custom,
			path: ["items", index],
			message: "Duplicate public item."
		});
		seen.add(key);
	}
	for (const kind of OFFLINE_PUBLIC_KINDS) if (snapshot.items.filter((item) => item.kind === kind).length > 100) ctx.addIssue({
		code: ZodIssueCode.custom,
		path: ["items"],
		message: "Too many items in a content kind."
	});
});
//#endregion
//#region lib/offline-public-store.ts
var PUBLIC_LIBRARY_DB = "venezuela-agro-public-library-v1";
function open() {
	return new Promise((resolve, reject) => {
		const r = indexedDB.open(PUBLIC_LIBRARY_DB, 1);
		r.onupgradeneeded = () => r.result.createObjectStore("library");
		r.onsuccess = () => resolve(r.result);
		r.onerror = () => reject(r.error);
	});
}
function request(r) {
	return new Promise((resolve, reject) => {
		r.onsuccess = () => resolve(r.result);
		r.onerror = () => reject(r.error);
	});
}
function done(tx) {
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onabort = () => reject(tx.error ?? /* @__PURE__ */ new Error("storage_aborted"));
		tx.onerror = () => reject(tx.error ?? /* @__PURE__ */ new Error("storage_failed"));
	});
}
async function clearPublicLibrary() {
	const db = await open();
	try {
		const tx = db.transaction("library", "readwrite"), finished = done(tx);
		const generation = await request(tx.objectStore("library").get("generation"));
		tx.objectStore("library").put((generation ?? 0) + 1, "generation");
		tx.objectStore("library").delete("current");
		await finished;
	} finally {
		db.close();
	}
}
async function beginPublicDownload() {
	const db = await open();
	try {
		const tx = db.transaction("library", "readonly"), finished = done(tx);
		const generation = await request(tx.objectStore("library").get("generation")) ?? 0;
		await finished;
		return generation;
	} finally {
		db.close();
	}
}
//#endregion
//#region lib/offline-library-worker.ts
var updateMessage = "Hay una versión nueva preparada o en descarga. Mantén internet; cuando termine, cierra todas las pestañas de VenezuelaAgro y vuelve a abrir para comprobarla. La copia anterior y tus registros se conservan.";
var updateRequired = () => ({
	ready: false,
	code: "update_required",
	error: updateMessage
});
async function message(type, signal, generation) {
	if (!("serviceWorker" in navigator)) return {
		ready: false,
		error: "Este navegador no ofrece almacenamiento offline de páginas."
	};
	const registration = await navigator.serviceWorker.getRegistration(), worker = registration?.active;
	if (!worker) return {
		ready: false,
		error: "La aplicación todavía se está preparando. Espera con internet y vuelve a comprobar."
	};
	if (signal?.aborted) return {
		ready: false,
		error: "Descarga cancelada."
	};
	if (type !== "CLEAR_LIBRARY" && (registration?.waiting || registration?.installing)) return updateRequired();
	return new Promise((resolve) => {
		const channel = new MessageChannel();
		let settled = false;
		const finish = (result) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			signal?.removeEventListener("abort", cancel);
			channel.port1.close();
			resolve(result);
		};
		const cancel = () => {
			if (type === "PREPARE_LIBRARY") worker.postMessage({ type: "CANCEL_LIBRARY" });
			finish({
				ready: false,
				error: "Descarga cancelada. La copia anterior se conserva."
			});
		};
		const timer = setTimeout(() => {
			if (type === "PREPARE_LIBRARY") worker.postMessage({ type: "CANCEL_LIBRARY" });
			finish({
				ready: false,
				error: "La operación no terminó. Vuelve a comprobarla con internet."
			});
		}, type === "OFFLINE_STATUS" ? 15e3 : 12e4);
		channel.port1.onmessage = (event) => finish(event.data);
		signal?.addEventListener("abort", cancel, { once: true });
		if (signal?.aborted) {
			cancel();
			return;
		}
		try {
			worker.postMessage({
				type,
				generation
			}, [channel.port2]);
		} catch {
			finish({
				ready: false,
				error: "No se pudo comprobar la preparación. Recarga con internet y vuelve a intentarlo; no borres tus datos."
			});
		}
	});
}
async function libraryResources(prepare = false, signal, generation) {
	let expected;
	if (navigator.onLine) {
		const controller = new AbortController(), cancel = () => controller.abort();
		signal?.addEventListener("abort", cancel, { once: true });
		if (signal?.aborted) cancel();
		const timer = setTimeout(cancel, 5e3);
		try {
			const response = await fetch("/offline-library-assets.json", {
				cache: "no-store",
				signal: controller.signal
			});
			if (!response.ok) throw new Error();
			const manifest = await response.json();
			if (typeof manifest.revision !== "string") throw new Error();
			expected = manifest.revision;
		} catch {
			return {
				ready: false,
				error: "No se pudo verificar la versión actual. Conserva internet y vuelve a comprobar; la copia anterior no se borra."
			};
		} finally {
			clearTimeout(timer);
			signal?.removeEventListener("abort", cancel);
		}
	}
	if (expected) {
		const core = await message("OFFLINE_STATUS", signal);
		if (core.code === "update_required" || core.version && core.version !== expected) return updateRequired();
		if (signal?.aborted) return {
			ready: false,
			error: "Descarga cancelada."
		};
	}
	const result = await message(prepare ? "PREPARE_LIBRARY" : "LIBRARY_STATUS", signal, generation);
	if (expected && (result.ready || result.version) && result.version !== expected) return updateRequired();
	return result;
}
async function removeLibraryResources() {
	const result = await message("CLEAR_LIBRARY");
	if (!result.cleared) throw new Error(result.error || "No se confirmó la eliminación de recursos.");
	return result;
}
//#endregion
//#region components/offline-library.tsx
var guides = [...platformGuides, ...articles];
var sections = [
	["inicio", "Biblioteca"],
	["tienda", "Tienda y solicitudes"],
	["rubros", "Rubros"],
	["aprende", "Guías"],
	["marketplace", "Mercado"],
	["professional", "Profesionales"],
	["farm", "Fincas"],
	["post", "Comunidad"],
	["project", "Proyectos"],
	["borradores", "Preparar publicación"]
];
var routeKinds = {
	marketplace: "marketplace",
	profesionales: "professional",
	fincas: "farm",
	red: "post",
	proyectos: "project",
	aprende: "aprende",
	tienda: "tienda",
	rubros: "rubros"
};
var button = "min-h-11 rounded-full border border-[#4c6b3a]/25 px-4 py-3 text-sm font-bold disabled:opacity-50";
function OfflineLibrary() {
	const [section, setSection] = (0, import_react.useState)("inicio"), [detail, setDetail] = (0, import_react.useState)("");
	const [resources, setResources] = (0, import_react.useState)({ ready: false });
	const [online, setOnline] = (0, import_react.useState)(true), [busy, setBusy] = (0, import_react.useState)(false), [message, setMessage] = (0, import_react.useState)(""), [estimate, setEstimate] = (0, import_react.useState)(""), [size, setSize] = (0, import_react.useState)(null);
	const controller = (0, import_react.useRef)(null), resourceCheck = (0, import_react.useRef)(0);
	const content = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const frame = requestAnimationFrame(() => {
			const parts = location.pathname.split("/").filter(Boolean);
			setSection(parts[1] === "publicar" ? "borradores" : routeKinds[parts[0]] ?? "inicio");
			try {
				setDetail(parts[1] && parts[1] !== "publicar" ? decodeURIComponent(parts[1]) : "");
			} catch {
				setDetail("");
			}
			setOnline(navigator.onLine);
			const navigation = readLibraryLocation(location.hash);
			if (navigation) {
				setSection(navigation.section);
				setDetail(navigation.detail);
			}
		});
		let active = true;
		const connectivity = () => setOnline(navigator.onLine);
		const check = ++resourceCheck.current;
		libraryResources().then((result) => {
			if (active && check === resourceCheck.current) setResources(result);
		});
		if (navigator.onLine) fetch("/offline-library-assets.json", { cache: "no-store" }).then((r) => r.json()).then((data) => {
			if (active && data && typeof data === "object" && "bytes" in data && typeof data.bytes === "number") setSize(data.bytes);
		}).catch(() => void 0);
		navigator.storage?.estimate?.().then((info) => {
			if (active && info.quota) setEstimate(`${Math.round((info.quota - (info.usage ?? 0)) / 1024 / 1024)} MB estimados disponibles`);
		}).catch(() => void 0);
		const navigate = () => {
			const next = readLibraryLocation(location.hash);
			const parts = location.pathname.split("/").filter(Boolean);
			setSection(next?.section ?? (parts[1] === "publicar" ? "borradores" : routeKinds[parts[0]] ?? "inicio"));
			let originalDetail = "";
			try {
				originalDetail = parts[1] && parts[1] !== "publicar" ? decodeURIComponent(parts[1]) : "";
			} catch {}
			setDetail(next?.detail ?? originalDetail);
			requestAnimationFrame(() => content.current?.focus({ preventScroll: true }));
		};
		window.addEventListener("hashchange", navigate);
		window.addEventListener("online", connectivity);
		window.addEventListener("offline", connectivity);
		return () => {
			active = false;
			cancelAnimationFrame(frame);
			controller.current?.abort();
			window.removeEventListener("online", connectivity);
			window.removeEventListener("offline", connectivity);
			window.removeEventListener("hashchange", navigate);
		};
	}, []);
	async function download() {
		if (busy) return;
		const check = ++resourceCheck.current;
		setBusy(true);
		setMessage("Descargando páginas, guías y recursos. Mantén esta página abierta.");
		controller.current = new AbortController();
		try {
			const generation = await beginPublicDownload();
			const ready = await libraryResources(true, controller.current.signal, generation);
			if (check === resourceCheck.current) setResources(ready);
			if (!ready.ready) {
				setMessage(ready.error || "No se pudieron preparar todos los recursos. Mantén internet y vuelve a comprobar; la copia anterior se conserva.");
				return;
			}
			if (controller.current.signal.aborted) throw new Error("Descarga cancelada; no se reemplazó tu copia pública.");
			setMessage("Biblioteca opcional preparada. No se descargaron catálogos ni publicaciones de otras personas. Tus datos propios se preparan en Mi Finca.");
		} catch (error) {
			setMessage(error instanceof Error && error.name === "QuotaExceededError" ? "No hay espacio suficiente. La copia anterior y tus registros privados se conservan." : "La descarga no terminó o se canceló. Mantén internet y vuelve a intentarlo; la copia anterior se conserva.");
		} finally {
			setBusy(false);
			controller.current = null;
		}
	}
	async function clear() {
		if (busy || !window.confirm("¿Eliminar solo la descarga pública? Tus fincas, solicitudes, borradores y pendientes no se borrarán.")) return;
		++resourceCheck.current;
		setBusy(true);
		try {
			controller.current?.abort();
			await clearPublicLibrary();
			await removeLibraryResources();
			setResources({ ready: false });
			setMessage("Descarga pública eliminada. Tus datos privados no cambiaron.");
		} catch {
			setMessage("No se confirmó toda la limpieza de recursos públicos. Tus registros privados no se han modificado; vuelve a comprobar o repite esta limpieza.");
		} finally {
			setBusy(false);
		}
	}
	function choose(next, nextDetail = "") {
		setSection(next);
		setDetail(nextDetail);
		const hash = libraryLocation(next, nextDetail);
		if (location.hash !== hash) window.location.assign(hash);
		requestAnimationFrame(() => {
			content.current?.focus({ preventScroll: true });
			content.current?.scrollIntoView({
				block: "start",
				behavior: "instant"
			});
		});
	}
	const article = guides.find((item) => item.slug === detail);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "interior-page min-h-screen bg-[#f3ebdd] px-4 py-6 text-[#3e2a19] sm:px-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-wrap items-center justify-between gap-4 border-b border-[#3e2a19]/15 pb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/biblioteca-local",
						"aria-label": "Venezuela Agro, biblioteca descargada",
						className: "font-display text-2xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VenezuelaAgroLogo, {
							compact: true,
							tone: "dark"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionIndicator, { tone: "light" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/app",
								className: button,
								children: "Mi Finca"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/",
								className: button,
								children: "Sitio principal"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-7 text-xs font-bold uppercase tracking-widest text-[#4c6b3a]",
					children: "Tu plataforma preparada"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-3 text-4xl sm:text-5xl",
					children: "Información cerca, con o sin señal."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-3xl leading-7",
					children: "Consulta guías, rubros y catálogo; prepara solicitudes en este navegador. Esta biblioteca opcional contiene referencias del sitio, no los directorios de otras personas. Enviar, publicar, iniciar sesión, consultar stock vigente y recibir confirmaciones requieren internet."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "my-6 rounded-2xl border bg-white p-5",
					"aria-label": "Descargar biblioteca",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							role: "status",
							className: "font-bold",
							children: [
								online ? "Conexión detectada" : "Sin conexión",
								" · ",
								resources.ready ? "Páginas y recursos preparados" : "Preparación de páginas pendiente"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineDownloadSize, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-6",
							children: "La preparación básica guarda las herramientas comunes. Tus registros y publicaciones propias se sincronizan por cuenta en Mi Finca; su tamaño varía con lo que guardes. No se descarga el Mercado ni la Comunidad de otras personas."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm leading-6",
							children: [
								"Biblioteca opcional: guías incorporadas, páginas de referencia e imágenes del sitio. ",
								size !== null ? `Paquete completo de recursos: ${(size / 1024 / 1024).toFixed(1)} MiB sin comprimir, más páginas HTML. Incluye código compartido con la base: no sumes ambos tamaños como descargas independientes.` : "Conecta para comprobar su tamaño.",
								" ",
								estimate,
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-6",
							children: "No se actualizan catálogos ajenos al reconectar. Las imágenes remotas que no estén guardadas y las pantallas sociales completas requieren internet. Las copias automáticas antiguas no se muestran ni se renuevan; puedes quitarlas con «Eliminar descarga pública». Tus borradores, favoritos y datos privados se conservan."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: !online || busy,
									onClick: () => void download(),
									className: `${button} bg-[#4c6b3a] text-white`,
									children: busy ? "Descargando…" : "Descargar / actualizar biblioteca opcional"
								}),
								busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										controller.current?.abort();
										setMessage("Se cancelará la copia pública. Los recursos ya descargados pueden conservarse.");
									},
									className: button,
									children: "Cancelar"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: busy,
									onClick: () => void clear(),
									className: button,
									children: "Eliminar descarga pública"
								})
							]
						}),
						message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "status",
							className: "mt-3 text-sm",
							children: message
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					"aria-label": "Biblioteca y acceso a directorios",
					className: "mb-6 flex flex-wrap gap-2",
					children: sections.map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						"aria-pressed": section === id,
						onClick: () => choose(id),
						className: `${button} ${section === id ? "bg-[#3e2a19] text-white" : "bg-white"}`,
						children: label
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					ref: content,
					tabIndex: -1,
					"aria-label": sections.find(([id]) => id === section)?.[1],
					className: "min-w-0 scroll-mt-6",
					children: [
						section === "inicio" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-2xl bg-white p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-xl font-bold",
										children: "Tus registros privados"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "my-3 leading-7",
										children: "Mi Finca conserva animales, áreas, inventario, ciclos y planes en el espacio que elijas. Prepara ese espacio y descarga también una copia de seguridad. En una cuenta, dividir áreas requiere conexión; en espacio local la división se guarda conjuntamente."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: "/app",
										className: "font-bold underline",
										children: "Abrir Mi Finca y Sincronización"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-2xl bg-white p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-xl font-bold",
										children: "Referencias y condiciones"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "my-3 leading-7",
										children: "Se descargan las páginas de referencia del sitio. Los sitios externos y trámites oficiales necesitan conexión."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-3",
										children: [
											["/plataforma", "Plataforma"],
											["/nosotros", "Nuestra historia"],
											["/guia-institucional", "Guía institucional"],
											["/legal/privacidad", "Privacidad"],
											["/legal/terminos", "Términos"],
											["/legal/comercio", "Comercio"],
											["/creditos-fotograficos", "Fotografías"]
										].map(([href, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href,
											className: "underline",
											children: label
										}, href))
									})
								]
							})]
						}),
						section === "borradores" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflinePublicDrafts, {}),
						section === "tienda" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-5 rounded-xl bg-white p-4 text-sm",
							children: "Catálogo de referencia. Ninguna cantidad o imagen confirma existencias. La solicitud queda pendiente hasta recibir confirmación del servidor; precio, disponibilidad y entrega se acuerdan después."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreCatalog, {})] }),
						section === "rubros" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: agroFamilies.map((family) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-xl bg-white p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "text-xl font-bold",
									children: [
										family.emoji,
										" ",
										family.name
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 leading-7",
									children: family.items.join(" · ")
								})]
							}, family.name))
						}),
						section === "aprende" && (detail ? article ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "mx-auto max-w-3xl rounded-2xl bg-white p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 px-2 font-semibold underline",
									onClick: () => choose("aprende"),
									children: "Volver a guías"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display my-5 text-3xl",
									children: article.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: article.description }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "my-3 text-xs",
									children: [
										"Edición incorporada: ",
										article.updatedAt,
										". Ejemplos didácticos; no son registros de tu finca."
									]
								}),
								article.sections.map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "mt-7",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-xl font-bold",
											children: part.heading
										}),
										part.paragraphs.map((paragraph, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 leading-7",
											children: paragraph
										}, index)),
										part.bullets && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-3 list-disc space-y-2 pl-5",
											children: part.bullets.map((text) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: text }, text))
										})
									]
								}, part.heading)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArticleSources, {
									sources: article.sources,
									offline: true
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-white p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Esta guía no está incluida en tu descarga. Vuelve a conectarte para consultar su versión publicada." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mt-3 min-h-11 font-semibold underline",
								onClick: () => choose("aprende"),
								children: "Ver guías incluidas"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: guides.map((guide) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => choose("aprende", guide.slug),
								className: "rounded-xl bg-white p-5 text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "text-xl font-bold",
										children: [
											guide.emoji,
											" ",
											guide.title
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 leading-6",
										children: guide.description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-3 block text-sm font-bold underline",
										children: "Leer guía descargada"
									})
								]
							}, guide.slug))
						})),
						[
							"marketplace",
							"professional",
							"farm",
							"post",
							"project"
						].includes(section) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-xl bg-white p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-xl font-bold",
									children: "Esta sección necesita conexión"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 leading-7",
									children: "Los directorios y las publicaciones de otras personas no se descargan automáticamente. Los favoritos que marcaste se conservan como referencias; abrir sus fichas requiere internet."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 leading-7",
									children: "Tus anuncios y borradores propios están en Mi Finca. Los datos propios de comunidad se conservan al sincronizar, pero la pantalla social completa todavía necesita internet; no se promete acceso sin señal a fotos remotas."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/app",
									className: "mt-4 inline-block min-h-11 font-bold underline",
									children: "Abrir mis datos en Mi Finca"
								}),
								online && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: {
										marketplace: "/marketplace",
										professional: "/profesionales",
										farm: "/fincas",
										post: "/red",
										project: "/proyectos"
									}[section],
									className: "ml-4 mt-4 inline-block min-h-11 font-bold underline",
									children: "Consultar con internet"
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "mt-10 border-t pt-5 text-sm",
					children: "Hecho por Parcela Los Morochos · Las copias públicas no sustituyen un respaldo de tus registros privados."
				})
			]
		})
	});
}
//#endregion
export { OfflineLibrary };
