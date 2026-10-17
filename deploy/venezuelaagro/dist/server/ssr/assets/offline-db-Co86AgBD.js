import { t as authFetch } from "./auth-fetch-BggIZaGf.js";
import { a as discriminatedUnionType, c as numberType, d as stringType, i as coerce, l as objectType, m as ZodIssueCode, n as arrayType, o as enumType, p as unknownType, s as literalType, t as NEVER, u as recordType } from "./types-O06YnHo2.js";
import { c as currencySchema } from "./exchange-rates-cDoWbx0h.js";
import { t as productPhotos } from "./product-photos-SgvyNbFN.js";
import { i as professionalDetailsSchema } from "./professional-profile-k05LGMn7.js";
import { r as listingContactSchema } from "./whatsapp-contact-DNnrmW1P.js";
import { a as marketplaceImageInputSchema, c as productDetailsSchema } from "./marketplace-details-DR9jbXb7.js";
import { C as validateSurveyVertices, S as validateNormalizedSketchPolygon, f as edgeClearance, g as outlineExceedsProperty, p as inside, s as exactPlanLayout, x as hasCustomAreaOutline } from "./farm-plan-catalog-7z5TuNyx.js";
import { a as databaseNameForOwner, p as verifySyncOwner, s as localOwner } from "./offline-account-boundary-hnu6xdcm.js";
//#region lib/animal-records.ts
/** Stable, explicitly selected event types. Labels are presentation only. */
var HEALTH_EVENT_TYPES = [
	{
		value: "vaccination",
		label: "Vacunación"
	},
	{
		value: "deworming",
		label: "Desparasitación"
	},
	{
		value: "illness",
		label: "Enfermedad"
	},
	{
		value: "review",
		label: "Revisión"
	},
	{
		value: "other",
		label: "Otro"
	}
];
var REPRODUCTION_EVENT_TYPES = [
	{
		value: "mating",
		label: "Monta"
	},
	{
		value: "insemination",
		label: "Inseminación"
	},
	{
		value: "pregnancy-check",
		label: "Diagnóstico de gestación"
	},
	{
		value: "birth",
		label: "Parto"
	},
	{
		value: "other",
		label: "Otro"
	}
];
var ANIMAL_HISTORY_TYPES = [
	"weight",
	"health",
	"reproduction"
];
function isAnimalHistoryType(value) {
	return ANIMAL_HISTORY_TYPES.some((type) => type === value);
}
/** Calendar dates have no timezone and must not silently roll into another month. */
function isAnimalRecordDate(value) {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [year, month, day] = value.split("-").map(Number);
	if (year < 1 || month < 1 || month > 12 || day < 1) return false;
	return day <= [
		31,
		year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	][month - 1];
}
var isValidAnimalRecordDate = isAnimalRecordDate;
function objectData(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
/** Omission by an older client cannot erase an identity, link, or unknown detail.
* Explicit null/empty values still replace data. Area placement retains its own
* move/clear semantics. Callers must compare revisions before merging server data.
*/
function preserveAnimalRecordData(current, previous) {
	const data = objectData(current.data), old = objectData(previous?.data);
	if (!data || !old || current.farmId !== previous?.farmId || current.recordType !== previous?.recordType || current.recordType !== "animal" && !isAnimalHistoryType(current.recordType)) return data;
	const retained = { ...old };
	delete retained.areaId;
	delete retained.planPlacement;
	return {
		...retained,
		...data
	};
}
/** A pre-existing missing/deleted target remains historical. Known foreign or
* wrong-kind targets never become valid, even for an unchanged link.
*/
function assertAnimalLinkTarget(target, farmId, owner, unchanged) {
	if (target && (target.recordType !== "animal" || target.farmId !== farmId || typeof target.ownerId === "string" && owner !== void 0 && target.ownerId !== owner)) throw new Error("animal_not_available");
	if ((!target || target.deleted === true) && !unchanged) throw new Error("animal_not_available");
}
function animalRecordDate(record) {
	const value = record.payload.data[record.payload.recordType === "weight" ? "measuredAt" : "date"];
	return isAnimalRecordDate(value) ? value : null;
}
function animalRecordEventLabel(record) {
	const { recordType, data, title } = record.payload;
	if (recordType === "weight") return "Pesaje";
	return (recordType === "health" ? HEALTH_EVENT_TYPES : recordType === "reproduction" ? REPRODUCTION_EVENT_TYPES : []).find((option) => option.value === data.eventType)?.label ?? (typeof data.event === "string" && data.event.trim() ? data.event : title || "Registro");
}
function linkedAnimalRecords(animal, records) {
	const history = animal.payload.recordType === "animal" ? records.filter((record) => record.payload.farmId === animal.payload.farmId && isAnimalHistoryType(record.payload.recordType) && record.payload.data.animalId === animal.id) : [];
	const compare = (a, b, direction) => {
		const first = animalRecordDate(a), second = animalRecordDate(b);
		if (!first || !second) return first ? -1 : second ? 1 : a.id.localeCompare(b.id);
		return direction * first.localeCompare(second) || a.id.localeCompare(b.id);
	};
	history.sort((a, b) => compare(a, b, -1));
	return {
		weights: history.filter((record) => record.payload.recordType === "weight").sort((a, b) => compare(a, b, 1)),
		health: history.filter((record) => record.payload.recordType === "health"),
		reproduction: history.filter((record) => record.payload.recordType === "reproduction"),
		history
	};
}
//#endregion
//#region lib/store-products.ts
var meatUnits = [
	"kg",
	"g",
	"tonelada",
	"arroba"
];
var crops = [
	"kg",
	"g",
	"tonelada",
	"arroba"
];
var storeProducts = [
	{
		id: "pollos",
		emoji: "🐓",
		name: "Pollo y sus cortes",
		category: "Carnicería",
		description: "Selecciona las piezas y la cantidad que necesitas para tu casa o negocio.",
		stage: "Disponible por confirmar",
		image: "/demo-poultry-product.webp",
		presentations: [
			"Pollo entero",
			"Pollo despresado",
			"Pechuga entera",
			"Filete de pechuga",
			"Muslo",
			"Contramuslo",
			"Muslo y contramuslo",
			"Alitas",
			"Carcasa / espinazo",
			"Menudencias",
			"Otro corte de pollo"
		],
		units: meatUnits,
		preparations: [
			"Entero",
			"Con hueso y piel",
			"Sin hueso",
			"Sin piel",
			"Porcionado",
			"A convenir"
		],
		hint: "Indica el corte, peso solicitado y preparación. Imagen ilustrativa; existencia y peso final por confirmar."
	},
	{
		id: "carne-bovina",
		emoji: "🥩",
		name: "Carne de res",
		category: "Carnicería",
		description: "Cortes para bistec, guisos, parrilla, asados o abastecimiento comercial.",
		stage: "Disponible por confirmar",
		presentations: [
			"Bistec · corte a convenir",
			"Carne molida",
			"Lomito",
			"Solomo",
			"Punta trasera",
			"Muchacho redondo",
			"Muchacho cuadrado",
			"Pulpa negra",
			"Ganso",
			"Falda",
			"Pecho",
			"Lagarto",
			"Costilla",
			"Huesos para caldo",
			"Vísceras · especificar",
			"Media res / canal",
			"Otro corte de res"
		],
		units: meatUnits,
		preparations: [
			"Pieza entera",
			"Bistec / fileteado",
			"En cubos",
			"Molida",
			"Con hueso",
			"Sin hueso",
			"A convenir"
		],
		hint: "Los nombres de cortes pueden variar por zona. Describe el uso y el corte para confirmar la cotización."
	},
	{
		id: "carne-porcina",
		emoji: "🍖",
		name: "Carne de cerdo",
		category: "Carnicería",
		description: "Elige cortes, preparación y peso por separado en tu solicitud.",
		stage: "Disponible por confirmar",
		presentations: [
			"Chuleta",
			"Costilla",
			"Pernil",
			"Paleta",
			"Lomo",
			"Solomillo",
			"Panceta / tocino fresco",
			"Pulpa de cerdo",
			"Carne molida de cerdo",
			"Patas",
			"Cabeza",
			"Vísceras · especificar",
			"Cerdo entero beneficiado",
			"Media canal",
			"Otro corte de cerdo"
		],
		units: meatUnits,
		preparations: [
			"Pieza entera",
			"En chuletas",
			"En cubos",
			"Molida",
			"Con hueso",
			"Sin hueso",
			"A convenir"
		],
		hint: "Puedes cotizar varias piezas en una misma solicitud: cada corte mantiene su propia cantidad."
	},
	{
		id: "peces",
		emoji: "🐟",
		name: "Pescado de cultivo",
		category: "Pescadería",
		description: "Presentaciones de pescado sujetas al ciclo, especie y disponibilidad.",
		stage: "En desarrollo",
		presentations: [
			"Pescado entero",
			"Entero eviscerado",
			"Filete",
			"Ruedas / rodajas",
			"Porciones",
			"Otro formato de pescado"
		],
		units: meatUnits,
		preparations: [
			"Fresco",
			"Congelado · por confirmar",
			"Con piel",
			"Sin piel",
			"A convenir"
		],
		hint: "Especifica especie, tamaño, formato y destino. Conservación y entrega requieren confirmación."
	},
	{
		id: "cafe",
		emoji: "☕",
		name: "Café",
		category: "Café y cacao",
		description: "Desde el cultivo hasta la taza: cotiza la presentación que buscas.",
		stage: "En desarrollo",
		presentations: [
			"Café verde en grano",
			"Café tostado en grano",
			"Café tostado y molido",
			"Café pergamino",
			"Semilla para siembra",
			"Plántula / mata de café",
			"Otro formato de café"
		],
		units: [...crops, "unidad"],
		preparations: [
			"Sin procesamiento adicional",
			"Molienda fina",
			"Molienda media",
			"Molienda gruesa",
			"Tueste a convenir",
			"A convenir"
		],
		hint: "200 g, 500 g, 1 kg o volumen empresarial. Para plantas elige unidades; origen, tueste y molienda se confirman."
	},
	{
		id: "cacao",
		emoji: "🍫",
		name: "Cacao",
		category: "Café y cacao",
		description: "Grano, derivados y material de siembra para familias y transformadores.",
		stage: "En desarrollo",
		image: "/demo-cacao.webp",
		presentations: [
			"Grano fermentado y seco",
			"Grano seco sin fermentar",
			"Cacao tostado en grano",
			"Nibs de cacao",
			"Cacao molido / polvo",
			"Pasta de cacao",
			"Semilla para siembra",
			"Plántula / mata de cacao",
			"Mazorcas",
			"Otro formato de cacao"
		],
		units: [...crops, "unidad"],
		preparations: [
			"Sin procesamiento adicional",
			"Tostado · por confirmar",
			"Molido · por confirmar",
			"A convenir"
		],
		hint: "Indica lote, procesamiento requerido y cantidad. Cada derivado se cotiza solo si está disponible."
	},
	{
		id: "frutas",
		emoji: "🍍",
		name: "Frutas de cosecha",
		category: "Frutas y hortalizas",
		description: "Consulta cosechas y cantidades para consumo, reventa o transformación.",
		stage: "En desarrollo",
		presentations: [
			"Piña",
			"Naranja",
			"Mandarina",
			"Mango",
			"Cambur / banano",
			"Lechosa",
			"Limón",
			"Aguacate",
			"Guayaba",
			"Fresa",
			"Otra fruta · especificar"
		],
		units: [
			...crops,
			"unidad",
			"lote"
		],
		preparations: [
			"Entera",
			"Seleccionada por tamaño",
			"Por madurez a convenir",
			"Para procesamiento",
			"A convenir"
		],
		hint: "Indica madurez, calibre y empaque. Son rubros para consulta, no cosechas confirmadas de nuestra finca."
	},
	{
		id: "hortalizas",
		emoji: "🥬",
		name: "Hortalizas, verduras y raíces",
		category: "Frutas y hortalizas",
		description: "Solicita el rubro y presentación con el detalle que necesita tu cocina o comercio.",
		stage: "En desarrollo",
		presentations: [
			"Tomate",
			"Cebolla",
			"Pimentón",
			"Ají dulce",
			"Lechuga",
			"Zanahoria",
			"Papa",
			"Yuca",
			"Auyama",
			"Plátano",
			"Otra hortaliza o raíz"
		],
		units: [
			...crops,
			"unidad",
			"lote"
		],
		preparations: [
			"Producto fresco",
			"Selección por calibre",
			"Lote para comercio",
			"A convenir"
		],
		hint: "Consulta variedad, cantidad, fecha, empaque y entrega. La oferta propia se confirma antes de vender."
	},
	{
		id: "bovinos",
		emoji: "🐄",
		name: "Bovinos en pie",
		category: "Animales en pie",
		description: "Animales para cría, reproducción, ordeño o engorde.",
		stage: "Disponible por confirmar",
		image: "/photos/arreo-guarico.webp",
		presentations: [
			"Becerro / ternero",
			"Novilla",
			"Vaca de ordeño",
			"Toro reproductor",
			"Res para engorde",
			"Lote de bovinos",
			"Otro bovino"
		],
		units: ["animal", "lote"],
		preparations: [
			"Cría",
			"Ordeño",
			"Reproducción",
			"Engorde",
			"Venta / a convenir"
		],
		hint: "Cantidad de animales, raza, edad y rango de peso. No se admiten fracciones de un animal."
	},
	{
		id: "porcinos",
		emoji: "🐖",
		name: "Porcinos en pie",
		category: "Animales en pie",
		description: "Lechones y cerdos por unidad o lote para distintas etapas de producción.",
		stage: "Disponible por confirmar",
		presentations: [
			"Lechón",
			"Cerdo para engorde",
			"Cerda reproductora",
			"Verraco reproductor",
			"Cerdo para beneficio",
			"Lote de porcinos"
		],
		units: ["animal", "lote"],
		preparations: [
			"Cría",
			"Reproducción",
			"Engorde",
			"A convenir"
		],
		hint: "Consulta peso, edad y fecha de salida. Para carne, selecciona la categoría Carnicería."
	},
	{
		id: "aves-en-pie",
		emoji: "🐣",
		name: "Aves en pie",
		category: "Animales en pie",
		description: "Consulta aves por unidad o lote con información del ciclo.",
		stage: "Disponible por confirmar",
		presentations: [
			"Pollo en pie",
			"Pollito · disponibilidad por consultar",
			"Lote de pollos",
			"Gallina · disponibilidad por consultar"
		],
		units: ["animal", "lote"],
		preparations: [
			"Engorde",
			"Postura · por consultar",
			"A convenir"
		],
		hint: "Indica número de aves, edad, peso y fecha requerida. No se confirma inventario automáticamente."
	},
	{
		id: "genetica-bovina",
		emoji: "🧬",
		name: "Genética bovina",
		category: "Genética",
		description: "Consultas sobre material reproductivo y acompañamiento técnico.",
		stage: "En desarrollo",
		presentations: [
			"Dosis de semen",
			"Embrión",
			"Programa genético",
			"Asesoría reproductiva"
		],
		units: ["dosis", "unidad"],
		preparations: [
			"Raza y objetivo a convenir",
			"Reproducción",
			"Mejoramiento genético"
		],
		hint: "Raza, respaldo técnico, cadena de frío y disponibilidad se revisan antes de cualquier entrega."
	}
].map((product) => {
	const photo = productPhotos.find((item) => item.productId === product.id);
	return photo ? {
		...product,
		image: photo.src,
		imageAlt: photo.alt,
		imageCreditId: photo.id,
		imageWidth: photo.width,
		imageHeight: photo.height
	} : product;
});
var storeCategories = [
	"Todo",
	"Carnicería",
	"Pescadería",
	"Café y cacao",
	"Frutas y hortalizas",
	"Animales en pie",
	"Genética"
];
function unitRule(unit) {
	return [
		"animal",
		"unidad",
		"lote",
		"dosis",
		"g"
	].includes(unit) ? {
		min: 1,
		step: 1
	} : {
		min: .001,
		step: .001
	};
}
function defaultQuantity(unit) {
	return unit === "g" ? 200 : 1;
}
function validStoreQuantity(quantity, unit) {
	const r = unitRule(unit);
	return Number.isFinite(quantity) && quantity >= r.min && quantity <= 1e6 && (r.step !== 1 || Number.isInteger(quantity));
}
function restoreStoreLine(raw) {
	const product = storeProducts.find((p) => p.id === raw.id);
	if (!product) return null;
	const measure = String(raw.measure || product.units[0]);
	const quantity = Number(raw.quantity);
	if (!Number.isFinite(quantity) || quantity <= 0) return null;
	return {
		id: product.id,
		name: product.name,
		quantity,
		presentation: String(raw.presentation || product.presentations[0]),
		measure,
		preparation: String(raw.preparation || ""),
		specifications: String(raw.specifications || "")
	};
}
/** Suggestions use the submitted categories, never imply available inventory. */
function relatedStoreProducts(requestedIds, limit = 3) {
	const selected = new Set(requestedIds), categories = new Set(storeProducts.filter((p) => selected.has(p.id)).map((p) => p.category));
	return storeProducts.filter((p) => !selected.has(p.id)).sort((a, b) => Number(categories.has(b.category)) - Number(categories.has(a.category))).slice(0, limit);
}
//#endregion
//#region lib/sync-validation.ts
var id = stringType().min(3).max(160).regex(/^[a-zA-Z0-9_-]+$/);
var isoDate = stringType().datetime({ offset: true }).or(stringType().datetime());
objectType({ operations: arrayType(objectType({
	id,
	entityType: enumType([
		"farm",
		"farm-record",
		"listing",
		"order",
		"professional",
		"project",
		"feedback",
		"public-farm",
		"social-post",
		"social-comment",
		"social-reaction"
	]),
	entityId: id,
	action: enumType(["upsert", "delete"]),
	payload: recordType(stringType(), unknownType()),
	clientUpdatedAt: isoDate,
	baseRevision: stringType().max(160).nullable().optional()
})).min(1).max(100) });
var legacySurveyVertexSchema = objectType({
	id: stringType().trim().min(1).max(24),
	easting: coerce.number().finite().min(-1e9).max(1e9),
	northing: coerce.number().finite().min(-1e9).max(1e9)
});
/** Compatibility reader for historical data; new writes use surveyPlanSchema. */
var legacySurveyPlanSchema = objectType({
	version: literalType(1),
	state: stringType().trim().max(80).default(""),
	municipality: stringType().trim().max(100).default(""),
	parish: stringType().trim().max(100).default(""),
	sector: stringType().trim().max(140).default(""),
	lot: stringType().trim().max(40).default("1"),
	northBoundary: stringType().trim().max(220).default(""),
	eastBoundary: stringType().trim().max(220).default(""),
	southBoundary: stringType().trim().max(220).default(""),
	westBoundary: stringType().trim().max(220).default(""),
	datum: stringType().trim().max(40).default(""),
	utmZone: stringType().trim().max(20).default(""),
	scaleDenominator: coerce.number().int().min(0).max(1e8).default(0),
	procedureType: stringType().trim().max(140).default(""),
	applicationReference: stringType().trim().max(140).default(""),
	fileReference: stringType().trim().max(140).default(""),
	status: stringType().trim().max(100).default(""),
	inspectionDate: stringType().trim().max(30).default(""),
	technicalResponsible: stringType().trim().max(160).default(""),
	sourceNote: stringType().trim().max(220).default(""),
	observations: stringType().trim().max(3e3).default(""),
	vertices: arrayType(legacySurveyVertexSchema).max(200).default([])
});
var surveyPlanSchema = legacySurveyPlanSchema.extend({ vertices: arrayType(objectType({
	id: stringType({ required_error: "Indica el identificador del punto." }).min(1, "Indica el identificador del punto.").max(24, "El identificador del punto admite hasta 24 caracteres.").refine((value) => value.trim().length > 0, "Indica el identificador del punto."),
	easting: numberType({
		required_error: "Completa la coordenada Este.",
		invalid_type_error: "Completa la coordenada Este con un número."
	}).finite("La coordenada Este debe ser un número finito.").min(-1e9, "Revisa el rango de la coordenada Este.").max(1e9, "Revisa el rango de la coordenada Este."),
	northing: numberType({
		required_error: "Completa la coordenada Norte.",
		invalid_type_error: "Completa la coordenada Norte con un número."
	}).finite("La coordenada Norte debe ser un número finito.").min(-1e9, "Revisa el rango de la coordenada Norte.").max(1e9, "Revisa el rango de la coordenada Norte.")
}).strict()).max(201, "El plano admite hasta 200 puntos distintos y una repetición explícita de cierre.").default([]) }).superRefine((plan, ctx) => {
	if (plan.vertices.length === 0) return;
	const result = validateSurveyVertices(plan.vertices);
	if (!result.ok) ctx.addIssue({
		code: ZodIssueCode.custom,
		path: ["vertices"],
		message: result.error
	});
});
var normalizedSketchPolygonSchema = unknownType().transform((input, ctx) => {
	const result = validateNormalizedSketchPolygon(input);
	if (!result.ok) {
		ctx.addIssue({
			code: ZodIssueCode.custom,
			message: result.error
		});
		return NEVER;
	}
	return result.polygon;
});
var geographicReferenceSchema = discriminatedUnionType("source", [
	objectType({
		version: literalType(1),
		source: literalType("wgs84-point"),
		latitude: numberType().finite().min(-90).max(90),
		longitude: numberType().finite().min(-180).max(180)
	}).strict(),
	objectType({
		version: literalType(1),
		source: literalType("regven-utm19n-point"),
		easting: numberType().finite().min(1e5).max(9e5),
		northing: numberType().finite().min(0).max(1e7)
	}).strict(),
	objectType({
		version: literalType(1),
		source: literalType("regven-utm19n-survey")
	}).strict()
]);
var farmPayloadSchema = objectType({
	name: stringType().trim().min(2).max(120),
	location: stringType().trim().max(180).optional().default(""),
	areaSqM: coerce.number().int().min(0).max(2e9).optional(),
	boundaryShape: enumType([
		"Irregular / polígono",
		"Rectángulo",
		"Triángulo",
		"Óvalo"
	]).optional().default("Irregular / polígono"),
	boundaryMeasurements: recordType(stringType(), coerce.number().min(0).max(1e7)).optional().default({}),
	surveyPlan: surveyPlanSchema.optional(),
	propertySketch: normalizedSketchPolygonSchema.nullable().optional(),
	geographicReference: geographicReferenceSchema.nullable().optional(),
	objective: stringType().trim().max(500).optional().default("")
});
var farmRecordPayloadSchema = objectType({
	farmId: id,
	recordType: enumType([
		"animal",
		"weight",
		"area",
		"crop",
		"inventory",
		"task",
		"production-cycle",
		"finance",
		"health",
		"reproduction",
		"plan",
		"document"
	]),
	category: stringType().trim().max(80).optional().default(""),
	title: stringType().trim().min(1).max(160),
	data: objectType({
		animalId: id.nullable().optional(),
		areaId: stringType().trim().min(1).max(160).nullable().optional(),
		typedAreaOutline: normalizedSketchPolygonSchema.optional(),
		planPlacement: objectType({
			version: literalType(1),
			source: literalType("user-placed"),
			coordinateSpace: literalType("area-percent"),
			areaId: stringType().trim().min(1).max(160),
			x: numberType().finite().gt(0).lt(100),
			y: numberType().finite().gt(0).lt(100)
		}).strict().nullable().optional()
	}).catchall(unknownType())
}).superRefine((payload, ctx) => {
	const { data, recordType } = payload;
	const issue = (field, message) => ctx.addIssue({
		code: "custom",
		path: ["data", field],
		message
	});
	if (recordType === "finance" || recordType === "plan") {
		if (data.currency !== void 0 && !currencySchema.safeParse(data.currency).success) issue("currency", "Selecciona una moneda válida: USD, EUR, COP o VES.");
		for (const field of recordType === "finance" ? ["amount"] : ["costPerUnit", "expectedRevenue"]) {
			const value = data[field];
			if (value !== void 0 && (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 2e9)) issue(field, "Indica un importe válido, igual o mayor que cero y dentro del límite permitido.");
		}
	}
	const placement = data.planPlacement;
	if (placement && (recordType !== "animal" || data.areaId !== placement.areaId)) issue("planPlacement", "La ubicación necesita un animal y el mismo identificador de área.");
	if (data.animalId != null && !isAnimalHistoryType(recordType)) issue("animalId", "Solo los pesajes y eventos sanitarios o reproductivos se vinculan a un animal.");
	if (recordType === "reproduction" && !data.animalId) issue("animalId", "Selecciona el animal del registro reproductivo.");
	if (recordType === "reproduction" || recordType === "health" && data.animalId) {
		if (!(recordType === "health" ? HEALTH_EVENT_TYPES : REPRODUCTION_EVENT_TYPES).some((option) => option.value === data.eventType)) issue("eventType", "Selecciona un tipo de evento válido.");
		if (!isAnimalRecordDate(data.date)) issue("date", "Indica una fecha válida (AAAA-MM-DD).");
		if (data.nextDate !== void 0 && data.nextDate !== null && data.nextDate !== "" && !isAnimalRecordDate(data.nextDate)) issue("nextDate", "Indica una próxima fecha válida (AAAA-MM-DD).");
		for (const [field, limit] of [
			["notes", 5e3],
			["professional", 240],
			["outcome", 1e3]
		]) if (data[field] !== void 0 && data[field] !== null && (typeof data[field] !== "string" || data[field].length > limit)) issue(field, "Revisa el texto de este campo.");
	}
});
var listingPayloadSchema = objectType({
	sellerName: stringType().trim().min(2).max(120),
	contactProfile: listingContactSchema.optional(),
	productDetails: productDetailsSchema.optional(),
	additionalImageDataUrls: arrayType(marketplaceImageInputSchema).max(5).optional(),
	sellerImageDataUrl: marketplaceImageInputSchema.optional(),
	title: stringType().trim().min(3).max(160),
	description: stringType().trim().min(10).max(3e3),
	category: stringType().trim().min(2).max(100),
	priceCents: coerce.number().int().min(0).max(2e9).nullable().optional(),
	currency: currencySchema.default("USD"),
	location: stringType().trim().min(2).max(180),
	state: stringType().trim().min(2).max(80),
	municipality: stringType().trim().max(100).optional().default(""),
	shortIntro: stringType().trim().min(8).max(240),
	photoContext: stringType().trim().min(5).max(300),
	saleFormat: stringType().trim().min(2).max(120).optional().default("A convenir"),
	supplyUnit: stringType().trim().min(1).max(40).optional().default("unidad"),
	minimumOrder: stringType().trim().max(80).optional().default(""),
	buyerType: enumType([
		"Personas y empresas",
		"Solo empresas",
		"Personas"
	]).optional().default("Personas y empresas"),
	contact: stringType().trim().max(180).optional().default(""),
	imageDataUrl: stringType().max(3e6).optional()
});
var professionalPayloadSchema = objectType({
	name: stringType().trim().min(3).max(120),
	profession: stringType().trim().min(2).max(100),
	specialties: stringType().trim().min(3).max(500),
	state: stringType().trim().min(2).max(80),
	municipality: stringType().trim().max(100).optional().default(""),
	serviceMode: enumType([
		"Presencial",
		"Remoto",
		"Presencial y remoto",
		"Visitas programadas",
		"Jornadas de campo",
		"Capacitación presencial o virtual"
	]),
	introduction: stringType().trim().min(20).max(1200),
	contact: stringType().trim().min(5).max(180),
	credentialNote: stringType().trim().max(500).optional().default(""),
	profileDetails: professionalDetailsSchema.optional()
}).superRefine((payload, ctx) => {
	if (payload.profileDetails && (!/^[+\d\s().-]+$/.test(payload.contact) || payload.contact.replace(/\D/g, "").length < 7 || payload.contact.replace(/\D/g, "").length > 15)) ctx.addIssue({
		code: ZodIssueCode.custom,
		path: ["contact"],
		message: "Introduce un teléfono válido con código de país."
	});
});
var projectPayloadSchema = objectType({
	title: stringType().trim().min(4).max(160),
	sector: stringType().trim().min(2).max(100),
	state: stringType().trim().min(2).max(80),
	summary: stringType().trim().min(30).max(2e3),
	has: arrayType(stringType().trim().min(1).max(120)).max(20),
	needs: arrayType(stringType().trim().min(1).max(120)).max(20),
	impact: stringType().trim().min(20).max(1500),
	requestedSupport: stringType().trim().min(10).max(1e3),
	contact: stringType().trim().min(5).max(180)
});
var feedbackPayloadSchema = objectType({
	area: enumType([
		"Sitio web",
		"Mercado Agro",
		"Mi Finca",
		"Profesionales",
		"Proyectos",
		"Otro"
	]),
	role: stringType().trim().min(2).max(100),
	message: stringType().trim().min(10).max(1500),
	contact: stringType().trim().max(180).optional().default("")
});
var orderPayloadSchema = objectType({
	customerName: stringType().trim().min(2).max(120),
	email: stringType().email().max(180).optional().or(literalType("")),
	phone: stringType().trim().max(60).refine((value) => /^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15, "Teléfono inválido").optional().or(literalType("")),
	items: arrayType(objectType({
		id,
		name: stringType().min(1).max(160),
		quantity: coerce.number().min(.001).max(1e6),
		presentation: stringType().trim().max(120).optional().default(""),
		measure: stringType().trim().max(80).optional().default(""),
		preparation: stringType().trim().max(120).optional().default(""),
		specifications: stringType().trim().max(600).optional().default("")
	})).min(1).max(100),
	note: stringType().trim().max(1200).optional().default(""),
	channel: enumType(["personal", "business"]).optional().default("personal"),
	business: objectType({
		companyName: stringType().trim().max(180).optional().default(""),
		companyType: stringType().trim().max(100).optional().default(""),
		taxId: stringType().trim().max(80).optional().default(""),
		deliveryLocation: stringType().trim().max(220).optional().default(""),
		frequency: stringType().trim().max(100).optional().default(""),
		requiredDate: stringType().regex(/^$|^\d{4}-\d{2}-\d{2}$/).optional().default(""),
		deliveryMode: stringType().trim().max(100).optional().default("")
	}).optional()
}).refine((value) => Boolean(value.email || value.phone), { message: "Se requiere un correo o teléfono de contacto." }).superRefine((p, ctx) => {
	if (p.channel === "business" && !p.business?.companyName.trim()) ctx.addIssue({
		code: ZodIssueCode.custom,
		path: ["business", "companyName"],
		message: "Indica el nombre de la empresa."
	});
	p.items.forEach((line, i) => {
		if (!validStoreQuantity(line.quantity, line.measure)) ctx.addIssue({
			code: ZodIssueCode.custom,
			path: [
				"items",
				i,
				"quantity"
			],
			message: "Las unidades, animales, lotes y dosis necesitan cantidades enteras."
		});
		if (/Plántula/.test(line.presentation) && line.measure !== "unidad") ctx.addIssue({
			code: ZodIssueCode.custom,
			path: [
				"items",
				i,
				"measure"
			],
			message: "Las plantas se solicitan por unidad."
		});
	});
});
//#endregion
//#region lib/farm-tap-placement.ts
/** A visual footprint only. Never converts an illustration into a measured surface. */
function placementAt(point, property, viewport) {
	if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || viewport.scale <= 0) return null;
	const radius = Math.min(edgeClearance(point, property) * .88, 6 * viewport.scale);
	if (radius < 5 * viewport.scale) return null;
	const width = radius * 1.6 / viewport.scale, height = radius * 1.1 / viewport.scale;
	const result = {
		x: (point.x - viewport.x) / viewport.scale - width / 2,
		y: (point.y - viewport.y) / viewport.scale - height / 2,
		width,
		height
	};
	return result.x >= 1 && result.y >= 1 && result.x + width <= 99 && result.y + height <= 69 ? result : null;
}
function placementFits(placement, property, viewport) {
	const { x, y, width, height } = placement;
	if (![
		x,
		y,
		width,
		height
	].every(Number.isFinite) || width < 8 || height < 5 || x < 1 || y < 1 || x + width > 99 || y + height > 69) return false;
	return !outlineExceedsProperty([
		{
			x,
			y
		},
		{
			x: x + width,
			y
		},
		{
			x: x + width,
			y: y + height
		},
		{
			x,
			y: y + height
		}
	].map((p) => ({
		x: viewport.x + p.x * viewport.scale,
		y: viewport.y + p.y * viewport.scale
	})), property);
}
function animalPlacementAt(point, areaId, outline, layout, viewport) {
	if (!inside(point, outline) || edgeClearance(point, outline) < .9 * viewport.scale || layout.width <= 0 || layout.height <= 0) return null;
	const x = ((point.x - viewport.x) / viewport.scale - layout.x) / layout.width * 100, y = ((point.y - viewport.y) / viewport.scale - layout.y) / layout.height * 100;
	if (!Number.isFinite(x) || !Number.isFinite(y) || x <= 0 || x >= 100 || y <= 0 || y >= 100) return null;
	return {
		version: 1,
		source: "user-placed",
		coordinateSpace: "area-percent",
		areaId,
		x,
		y
	};
}
function isTap(start, end) {
	return !!start && start.pointerId === end.pointerId && Math.hypot(start.x - end.x, start.y - end.y) <= 8;
}
function validAnimalPlanPlacement(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	const p = value;
	return p.version === 1 && p.source === "user-placed" && p.coordinateSpace === "area-percent" && typeof p.areaId === "string" && p.areaId.length > 0 && p.areaId.length <= 160 && typeof p.x === "number" && typeof p.y === "number" && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x > 0 && p.x < 100 && p.y > 0 && p.y < 100;
}
/** A draft belongs to the workspace in which the user opened it. */
function assertPlanDraftContext(opened, current) {
	if (!opened || opened.owner !== current.owner || opened.farmId !== current.farmId) throw new Error("Revisa: la cuenta o finca cambió. Cierra esta ficha y vuelve a elegir el lugar.");
}
//#endregion
//#region lib/area-split-payload.ts
/** Pure layout operation; preserves the exact allocated area, including decimals. */
function deriveAreaSplit(payload) {
	if (hasCustomAreaOutline(payload.data)) throw new Error("custom_polygon_split_unsupported");
	if (payload.data.waterTrough) throw new Error("No se puede dividir automáticamente un área con un bebedero guardado; conserva el área y revisa su infraestructura primero.");
	if (payload.data.boundaryPlanting) throw new Error("No se puede dividir automáticamente un área con vegetación ilustrativa guardada; conserva el área y revisa su distribución primero.");
	const area = Number(payload.data.areaSqM);
	if (payload.recordType !== "area" || !Number.isFinite(area) || area < 2) throw new Error("area_too_small");
	const first = area / 2, second = area - first;
	const exact = exactPlanLayout(payload.data);
	if (payload.data.mapLayoutVersion === 2 && !exact) throw new Error("area_layout_invalid");
	const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
	const x = exact?.x ?? Math.max(0, Math.min(99, finite(payload.data.mapX, 10))), y = exact?.y ?? Math.max(0, Math.min(99, finite(payload.data.mapY, 10)));
	const width = exact?.width ?? Math.max(1, Math.min(100 - x, finite(payload.data.mapWidth, 20))), height = exact?.height ?? Math.max(1, Math.min(100 - y, finite(payload.data.mapHeight, 12))), across = width >= height;
	const a = across ? {
		mapX: x,
		mapY: y,
		mapWidth: width / 2,
		mapHeight: height
	} : {
		mapX: x,
		mapY: y,
		mapWidth: width,
		mapHeight: height / 2
	};
	const b = across ? {
		...a,
		mapX: x + a.mapWidth
	} : {
		...a,
		mapY: y + a.mapHeight
	};
	if (exact && (!exactPlanLayout({
		...payload.data,
		...a
	}) || !exactPlanLayout({
		...payload.data,
		...b
	}))) throw new Error("area_layout_split_out_of_range");
	const title = payload.title.replace(/\s+[AB]$/i, "").slice(0, 158);
	return [{
		...payload,
		title: `${title} A`,
		data: {
			...payload.data,
			areaSqM: first,
			...a
		}
	}, {
		...payload,
		title: `${title} B`,
		data: {
			...payload.data,
			areaSqM: second,
			...b
		}
	}];
}
//#endregion
//#region lib/legacy-recovery.ts
/** Pure selection: neither the legacy export nor current records are changed. */
function legacyRecoveryCandidates(legacy, currentKeys, pending) {
	const protectedKeys = new Set([...currentKeys, ...pending.map((operation) => `${operation.entityType}:${operation.entityId}`)]);
	return legacy.filter((entity) => !protectedKeys.has(entity.key));
}
//#endregion
//#region lib/sync-reconciliation.ts
/** Preserve the last local intent, including deletes, while a batch is in flight. */
function latestPendingOperations(operations) {
	const latest = /* @__PURE__ */ new Map();
	for (const operation of [...operations].sort((a, b) => a.clientUpdatedAt.localeCompare(b.clientUpdatedAt))) latest.set(`${operation.entityType}:${operation.entityId}`, operation);
	return [...latest.values()];
}
//#endregion
//#region lib/offline-db.ts
var DB_NAME = "los-morochos-offline";
var DB_VERSION = 1;
var CACHE_STORE = "entities";
var OUTBOX_STORE = "outbox";
var META_STORE = "meta";
var syncPromise = null;
async function openDb(name) {
	const databaseName = name ?? databaseNameForOwner(await localOwner());
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(databaseName, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(CACHE_STORE)) db.createObjectStore(CACHE_STORE, { keyPath: "key" }).createIndex("entityType", "entityType", { unique: false });
			if (!db.objectStoreNames.contains(OUTBOX_STORE)) db.createObjectStore(OUTBOX_STORE, { keyPath: "id" });
			if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE, { keyPath: "key" });
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
function requestValue(request) {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
function transactionDone(transaction) {
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
}
function createLocalId(prefix) {
	return `${prefix}_${crypto.randomUUID()}`;
}
async function cacheEntity(entityType, id, payload, syncState = "synced") {
	const db = await openDb();
	const tx = db.transaction(CACHE_STORE, "readwrite");
	tx.objectStore(CACHE_STORE).put({
		key: `${entityType}:${id}`,
		id,
		entityType,
		payload,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		syncState
	});
	await transactionDone(tx);
	db.close();
	notifyChange();
}
async function getCachedEntities(entityType) {
	const db = await openDb();
	const tx = db.transaction(CACHE_STORE, "readonly");
	const values = await requestValue(tx.objectStore(CACHE_STORE).index("entityType").getAll(entityType));
	await transactionDone(tx);
	db.close();
	return values;
}
async function getCachedEntity(entityType, id) {
	const db = await openDb();
	const tx = db.transaction(CACHE_STORE, "readonly");
	const value = await requestValue(tx.objectStore(CACHE_STORE).get(`${entityType}:${id}`));
	await transactionDone(tx);
	db.close();
	return value;
}
async function queueMutation(operation) {
	const { expectedOwner, expectedLocalUpdatedAt, expectedAreaUpdatedAt, ...fields } = operation;
	const item = {
		...fields,
		id: operation.id ?? createLocalId("sync"),
		clientUpdatedAt: operation.clientUpdatedAt ?? (/* @__PURE__ */ new Date()).toISOString()
	};
	const owner = await localOwner();
	if (expectedOwner && expectedOwner !== owner) throw new Error("account_changed_reopen_form");
	const db = await openDb(databaseNameForOwner(owner));
	const tx = db.transaction([CACHE_STORE, OUTBOX_STORE], "readwrite");
	const done = transactionDone(tx);
	try {
		const previous = await requestValue(tx.objectStore(CACHE_STORE).get(`${item.entityType}:${item.entityId}`));
		if (expectedLocalUpdatedAt !== void 0 && previous?.updatedAt !== expectedLocalUpdatedAt) {
			tx.abort();
			db.close();
			throw new Error("local_record_changed_reopen_form");
		}
		if (item.entityType === "farm-record" && item.action === "upsert") {
			if (previous?.payload.recordType === "animal" && (item.payload.recordType !== "animal" || item.payload.farmId !== previous.payload.farmId)) {
				if ((await requestValue(tx.objectStore(CACHE_STORE).getAll())).some((record) => record.entityType === "farm-record" && record.payload.farmId === previous.payload.farmId && isAnimalHistoryType(record.payload.recordType) && record.payload.data?.animalId === item.entityId)) throw new Error("animal_has_linked_records");
			}
			const merged = preserveAnimalRecordData({
				farmId: item.payload.farmId,
				recordType: item.payload.recordType,
				data: item.payload.data
			}, previous ? {
				farmId: previous.payload.farmId,
				recordType: previous.payload.recordType,
				data: previous.payload.data
			} : void 0);
			if (merged) item.payload = {
				...item.payload,
				data: merged
			};
			const data = item.payload.data, old = previous?.payload.data;
			if (data && typeof data === "object") {
				if (!Object.prototype.hasOwnProperty.call(data, "areaId") && item.payload.farmId === previous?.payload.farmId && old && Object.prototype.hasOwnProperty.call(old, "areaId")) item.payload = {
					...item.payload,
					data: {
						...data,
						areaId: old.areaId
					}
				};
				if (!Object.prototype.hasOwnProperty.call(data, "planPlacement") && item.payload.recordType === "animal" && item.payload.farmId === previous?.payload.farmId && old && Object.prototype.hasOwnProperty.call(old, "planPlacement")) item.payload = {
					...item.payload,
					data: {
						...item.payload.data,
						planPlacement: item.payload.data.areaId === old.planPlacement?.areaId ? old.planPlacement : null
					}
				};
				const areaId = item.payload.data.areaId;
				const placement = item.payload.data.planPlacement;
				if (placement && (item.payload.recordType !== "animal" || !validAnimalPlanPlacement(placement) || placement.areaId !== areaId)) {
					tx.abort();
					db.close();
					throw new Error("invalid_animal_plan_placement");
				}
				const moved = !!placement && JSON.stringify(placement) !== JSON.stringify(old?.planPlacement);
				if (areaId && item.payload.recordType === "area") {
					tx.abort();
					db.close();
					throw new Error("area_cannot_reference_area");
				}
				if (typeof areaId === "string" && (areaId !== old?.areaId || item.payload.farmId !== previous?.payload.farmId || moved || expectedAreaUpdatedAt !== void 0)) {
					const area = await requestValue(tx.objectStore(CACHE_STORE).get(`farm-record:${areaId}`));
					if (expectedAreaUpdatedAt !== void 0 && area?.updatedAt !== expectedAreaUpdatedAt) {
						tx.abort();
						db.close();
						throw new Error("local_area_changed_reopen_form");
					}
					if (item.payload.recordType === "area" || !area || area.payload.recordType !== "area" || area.payload.farmId !== item.payload.farmId) {
						tx.abort();
						db.close();
						throw new Error("area_not_available");
					}
				}
			}
			const parsed = farmRecordPayloadSchema.safeParse(item.payload);
			if (!parsed.success) throw new Error("invalid_animal_record_payload");
			const animalId = parsed.data.data.animalId;
			if (typeof animalId === "string") {
				if (animalId === item.entityId) throw new Error("animal_not_available");
				const animal = await requestValue(tx.objectStore(CACHE_STORE).get(`farm-record:${animalId}`));
				const unchanged = previous?.payload.farmId === item.payload.farmId && previous?.payload.recordType === item.payload.recordType && old?.animalId === animalId;
				assertAnimalLinkTarget(animal?.payload, item.payload.farmId, owner === "device-local" ? void 0 : owner, unchanged);
			}
		}
		const same = (await requestValue(tx.objectStore(OUTBOX_STORE).getAll())).filter((op) => op.entityType === item.entityType && op.entityId === item.entityId);
		const latest = latestPendingOperations(same)[0];
		if (item.baseRevision === void 0) item.baseRevision = previous?.serverRevision ?? latest?.baseRevision ?? null;
		for (const old of same) tx.objectStore(OUTBOX_STORE).delete(old.id);
		if (item.action === "delete") tx.objectStore(CACHE_STORE).delete(`${item.entityType}:${item.entityId}`);
		else tx.objectStore(CACHE_STORE).put({
			key: `${item.entityType}:${item.entityId}`,
			id: item.entityId,
			entityType: item.entityType,
			payload: item.payload,
			updatedAt: item.clientUpdatedAt,
			syncState: "pending",
			serverRevision: item.baseRevision
		});
		tx.objectStore(OUTBOX_STORE).put(item);
		await done;
	} catch (error) {
		try {
			tx.abort();
		} catch {}
		await done.catch(() => void 0);
		throw error;
	} finally {
		db.close();
	}
	notifyChange();
	if (typeof navigator !== "undefined" && "serviceWorker" in navigator) navigator.serviceWorker.ready.then((registration) => {
		return registration.sync?.register("morochos-sync");
	}).catch(() => void 0);
	return item;
}
/** Both local areas and pending intents commit together. Never assigns them to an account. */
async function splitDeviceLocalArea(source) {
	const owner = await localOwner();
	if (owner !== "device-local") throw new Error("account_split_requires_connection");
	const db = await openDb(databaseNameForOwner(owner));
	const tx = db.transaction([CACHE_STORE, OUTBOX_STORE], "readwrite");
	const done = transactionDone(tx);
	try {
		const cache = tx.objectStore(CACHE_STORE), outbox = tx.objectStore(OUTBOX_STORE);
		const current = await requestValue(cache.get(source.key));
		if (!current || current.updatedAt !== source.updatedAt || JSON.stringify(current.payload) !== JSON.stringify(source.payload)) throw new Error("area_changed_refresh");
		if ((await requestValue(cache.getAll())).some((row) => row.entityType === "farm-record" && row.payload.farmId === current.payload.farmId && row.payload.data?.areaId === source.id)) throw new Error("area_has_linked_records");
		const [first, second] = deriveAreaSplit(current.payload);
		const childId = createLocalId("area"), time = (/* @__PURE__ */ new Date()).toISOString();
		const pending = await requestValue(outbox.getAll());
		for (const op of pending) if (op.entityType === "farm-record" && op.entityId === source.id) outbox.delete(op.id);
		for (const [id, payload, baseRevision] of [[
			source.id,
			first,
			current.serverRevision ?? null
		], [
			childId,
			second,
			null
		]]) {
			const value = {
				key: `farm-record:${id}`,
				id,
				entityType: "farm-record",
				payload,
				updatedAt: time,
				syncState: "pending",
				serverRevision: baseRevision
			};
			if (id === source.id) cache.put(value);
			else cache.add(value);
			outbox.put({
				id: createLocalId("sync"),
				entityType: "farm-record",
				entityId: id,
				action: "upsert",
				payload,
				clientUpdatedAt: time,
				baseRevision
			});
		}
		await done;
	} catch (error) {
		try {
			tx.abort();
		} catch {}
		await done.catch(() => void 0);
		throw error;
	} finally {
		db.close();
	}
	notifyChange();
}
/** Prevents a stale rendered card from splitting over an unconfirmed local edit. */
async function assertAreaReadyForOnlineSplit(source, owner, farm) {
	if (!navigator.onLine) throw new Error("account_split_requires_connection");
	if (await localOwner() !== owner || owner === "device-local") throw new Error("account_changed_reopen_form");
	const db = await openDb(databaseNameForOwner(owner));
	const tx = db.transaction([CACHE_STORE, OUTBOX_STORE], "readonly");
	const done = transactionDone(tx);
	const current = await requestValue(tx.objectStore(CACHE_STORE).get(source.key));
	const parent = await requestValue(tx.objectStore(CACHE_STORE).get(`farm:${source.payload.farmId}`));
	const related = await requestValue(tx.objectStore(CACHE_STORE).getAll());
	const pending = await requestValue(tx.objectStore(OUTBOX_STORE).getAll());
	await done;
	db.close();
	if (related.some((row) => row.entityType === "farm-record" && row.payload.farmId === source.payload.farmId && row.payload.data?.areaId === source.id)) throw new Error("area_has_linked_records");
	if (!parent || parent.id !== farm.id || parent.syncState !== "synced" || parent.updatedAt !== farm.updatedAt || parent.serverRevision !== farm.serverRevision || pending.some((op) => op.entityType === "farm" && op.entityId === farm.id)) throw new Error("area_pending_sync");
	if (!current || current.syncState !== "synced" || current.updatedAt !== source.updatedAt || current.serverRevision !== source.serverRevision || pending.some((op) => op.entityType === "farm-record" && op.entityId === source.id)) throw new Error("area_pending_sync");
}
async function getPendingCount(owner) {
	const db = await openDb(owner ? databaseNameForOwner(owner) : void 0);
	const tx = db.transaction(OUTBOX_STORE, "readonly");
	const count = await requestValue(tx.objectStore(OUTBOX_STORE).count());
	await transactionDone(tx);
	db.close();
	return count;
}
async function getLastSync(owner) {
	const db = await openDb(owner ? databaseNameForOwner(owner) : void 0);
	const tx = db.transaction(META_STORE, "readonly");
	const value = await requestValue(tx.objectStore(META_STORE).get("lastSync"));
	await transactionDone(tx);
	db.close();
	return value?.value ?? null;
}
/** Result describes refresh only; it does not acknowledge pending local writes. */
async function hydrateFromServer() {
	if (!navigator.onLine) return { status: "offline" };
	const owner = await localOwner();
	const beforeDb = await openDb(databaseNameForOwner(owner));
	const beforeTx = beforeDb.transaction([CACHE_STORE, META_STORE], "readonly");
	const beforeDone = transactionDone(beforeTx);
	const [beforeRows, beforeMeta] = await Promise.all([requestValue(beforeTx.objectStore(CACHE_STORE).getAll()), requestValue(beforeTx.objectStore(META_STORE).getAll())]);
	await beforeDone;
	beforeDb.close();
	const stamp = (row) => row ? row.syncState === "synced" && typeof row.serverRevision === "string" ? JSON.stringify([row.serverRevision, row.syncState]) : JSON.stringify([
		row.serverRevision,
		row.updatedAt,
		row.syncState,
		row.payload
	]) : "missing";
	const before = new Map(beforeRows.map((row) => [row.key, stamp(row)]));
	const serverStamp = (value) => value ? JSON.stringify([value.revision, !!value.deleted]) : "missing";
	const beforeServer = new Map(beforeMeta.filter((row) => row.key.startsWith("server:")).map((row) => [row.key, serverStamp(row.value)]));
	for (const row of beforeRows) if (row.syncState === "synced" && typeof row.serverRevision === "string" && !beforeServer.has(`server:${row.key}`)) beforeServer.set(`server:${row.key}`, JSON.stringify([row.serverRevision, false]));
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 15e3);
	let data;
	try {
		const response = await authFetch("/api/bootstrap", {
			headers: { accept: "application/json" },
			cache: "no-store",
			signal: controller.signal
		});
		if (response.status === 401 || response.status === 403) return { status: "account_changed" };
		if (!response.ok) return {
			status: "error",
			reason: "server"
		};
		try {
			data = await response.json();
		} catch {
			return {
				status: "error",
				reason: "invalid_response"
			};
		}
	} catch {
		return {
			status: "error",
			reason: "network"
		};
	} finally {
		clearTimeout(timer);
	}
	if (!data || typeof data !== "object" || typeof data.user?.id !== "string") return {
		status: "error",
		reason: "invalid_response"
	};
	if (data.user.id !== owner) return { status: "account_changed" };
	for (const key of [
		"farms",
		"records",
		"listings",
		"entities"
	]) {
		const collection = data[key];
		if (collection !== void 0 && (!Array.isArray(collection) || collection.some((row) => !row || typeof row !== "object" || typeof row.id !== "string" || row.revision !== null && typeof row.revision !== "string"))) return {
			status: "error",
			reason: "invalid_response"
		};
	}
	const rows = [
		...(data.farms ?? []).map((row) => ({
			entityType: "farm",
			id: row.id,
			revision: row.revision,
			deleted: row.deleted,
			payload: row
		})),
		...(data.records ?? []).map((row) => ({
			entityType: "farm-record",
			id: row.id,
			revision: row.revision,
			deleted: row.deleted,
			payload: row
		})),
		...(data.listings ?? []).map((row) => ({
			entityType: "listing",
			id: row.id,
			revision: row.revision,
			deleted: row.deleted,
			payload: row
		})),
		...data.entities ?? []
	];
	const db = await openDb(databaseNameForOwner(owner));
	const tx = db.transaction([
		CACHE_STORE,
		OUTBOX_STORE,
		META_STORE
	], "readwrite");
	const done = transactionDone(tx);
	const pending = await requestValue(tx.objectStore(OUTBOX_STORE).getAll());
	const protectedKeys = new Set(pending.map((op) => `${op.entityType}:${op.entityId}`));
	const currentRows = await requestValue(tx.objectStore(CACHE_STORE).getAll());
	const current = new Map(currentRows.map((row) => [row.key, stamp(row)]));
	const currentMeta = await requestValue(tx.objectStore(META_STORE).getAll());
	const currentServer = new Map(currentMeta.filter((row) => row.key.startsWith("server:")).map((row) => [row.key, serverStamp(row.value)]));
	for (const row of currentRows) if (row.syncState === "synced" && typeof row.serverRevision === "string" && !currentServer.has(`server:${row.key}`)) currentServer.set(`server:${row.key}`, JSON.stringify([row.serverRevision, false]));
	for (const row of rows) {
		const key = `${row.entityType}:${row.id}`;
		if ((current.get(key) ?? "missing") !== (before.get(key) ?? "missing") || (currentServer.get(`server:${key}`) ?? "missing") !== (beforeServer.get(`server:${key}`) ?? "missing")) continue;
		tx.objectStore(META_STORE).put({
			key: `server:${key}`,
			value: row
		});
		if (protectedKeys.has(key)) continue;
		if (row.deleted) tx.objectStore(CACHE_STORE).delete(key);
		else tx.objectStore(CACHE_STORE).put({
			key,
			id: row.id,
			entityType: row.entityType,
			payload: row.payload,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			serverRevision: row.revision,
			syncState: "synced"
		});
	}
	await done;
	db.close();
	notifyChange();
	return { status: "success" };
}
/** Validate the whole acknowledgement before it can remove any local intent. */
function validSyncReceipt(value, operations) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	const receipt = value;
	if (!Array.isArray(receipt.accepted) || typeof receipt.syncedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(receipt.syncedAt) || !Number.isFinite(Date.parse(receipt.syncedAt)) || (/* @__PURE__ */ new Date(`${receipt.syncedAt.slice(0, 10)}T00:00:00Z`)).toISOString().slice(0, 10) !== receipt.syncedAt.slice(0, 10)) return false;
	const sent = new Set(operations.map((operation) => operation.id));
	const acknowledged = /* @__PURE__ */ new Set();
	for (const id of receipt.accepted) {
		if (typeof id !== "string" || !sent.has(id) || acknowledged.has(id)) return false;
		acknowledged.add(id);
	}
	if (receipt.revisions !== void 0) {
		if (!receipt.revisions || typeof receipt.revisions !== "object" || Array.isArray(receipt.revisions)) return false;
		for (const [id, revision] of Object.entries(receipt.revisions)) if (!acknowledged.has(id) || revision !== null && typeof revision !== "string") return false;
	}
	if (receipt.rejected !== void 0) {
		if (!Array.isArray(receipt.rejected)) return false;
		for (const rejected of receipt.rejected) {
			if (!rejected || typeof rejected !== "object" || Array.isArray(rejected)) return false;
			if (typeof rejected.id !== "string" || !sent.has(rejected.id) || acknowledged.has(rejected.id) || typeof rejected.reason !== "string" || !rejected.reason.trim() || rejected.serverRevision !== void 0 && rejected.serverRevision !== null && typeof rejected.serverRevision !== "string") return false;
			acknowledged.add(rejected.id);
		}
	}
	return true;
}
async function runSync() {
	const owner = await localOwner();
	if (!navigator.onLine) return {
		ok: false,
		pending: await getPendingCount(owner),
		lastSync: await getLastSync(owner),
		reason: "offline"
	};
	if (!await verifySyncOwner(owner).catch(() => false)) return {
		ok: false,
		pending: await getPendingCount(owner),
		lastSync: await getLastSync(owner),
		reason: "account_changed"
	};
	const db = await openDb(databaseNameForOwner(owner));
	const readTx = db.transaction(OUTBOX_STORE, "readwrite");
	const allOperations = (await requestValue(readTx.objectStore(OUTBOX_STORE).getAll())).filter((operation) => !operation.blockedReason && (owner !== "device-local" || ["order", "feedback"].includes(operation.entityType))).sort((left, right) => {
		const priority = {
			farm: 0,
			"farm-record": 1,
			listing: 2,
			professional: 3,
			project: 4,
			feedback: 5,
			order: 6,
			"public-farm": 7,
			"social-post": 8,
			"social-comment": 9,
			"social-reaction": 10
		};
		return priority[left.entityType] - priority[right.entityType] || left.clientUpdatedAt.localeCompare(right.clientUpdatedAt);
	});
	const latest = latestPendingOperations(allOperations);
	const latestIds = new Set(latest.map((op) => op.id));
	for (const old of allOperations) if (!latestIds.has(old.id)) readTx.objectStore(OUTBOX_STORE).delete(old.id);
	const operations = [];
	let bytes = 0;
	for (const op of allOperations.filter((op) => latestIds.has(op.id))) {
		const size = new TextEncoder().encode(JSON.stringify(op)).length;
		if (operations.length >= 100 || operations.length > 0 && bytes + size > 4 * 1024 * 1024) break;
		operations.push(op);
		bytes += size;
	}
	await transactionDone(readTx);
	if (operations.length === 0) {
		db.close();
		const pending = await getPendingCount(owner);
		return {
			ok: pending === 0,
			pending,
			lastSync: await getLastSync(owner),
			...pending ? { reason: "needs_attention" } : {}
		};
	}
	let response;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 2e4);
	try {
		response = await authFetch("/api/sync", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-local-owner": owner
			},
			body: JSON.stringify({ operations }),
			signal: controller.signal
		});
	} catch {
		db.close();
		return {
			ok: false,
			pending: operations.length,
			lastSync: await getLastSync(owner),
			reason: "network"
		};
	} finally {
		clearTimeout(timeout);
	}
	if (!response.ok) {
		db.close();
		return {
			ok: false,
			pending: operations.length,
			lastSync: await getLastSync(owner),
			reason: response.status === 401 ? "authentication_required" : "server"
		};
	}
	let result;
	try {
		const receipt = await response.json();
		if (!validSyncReceipt(receipt, operations)) throw new Error();
		result = {
			...receipt,
			revisions: receipt.revisions ? Object.assign(Object.create(null), receipt.revisions) : void 0
		};
	} catch {
		db.close();
		return {
			ok: false,
			pending: await getPendingCount(owner),
			lastSync: await getLastSync(owner),
			reason: "invalid_response"
		};
	}
	const writeTx = db.transaction([
		OUTBOX_STORE,
		CACHE_STORE,
		META_STORE
	], "readwrite");
	const writeDone = transactionDone(writeTx);
	try {
		const outbox = writeTx.objectStore(OUTBOX_STORE);
		const cache = writeTx.objectStore(CACHE_STORE);
		for (const operation of operations) {
			if (!result.accepted.includes(operation.id)) continue;
			const stillPending = await requestValue(outbox.get(operation.id));
			outbox.delete(operation.id);
			writeTx.objectStore(META_STORE).put({
				key: `ack:${operation.id}`,
				value: {
					confirmedAt: result.syncedAt,
					serverRevision: result.revisions?.[operation.id]
				}
			});
			if (!stillPending) continue;
			writeTx.objectStore(META_STORE).put({
				key: `server:${operation.entityType}:${operation.entityId}`,
				value: {
					entityType: operation.entityType,
					id: operation.entityId,
					revision: result.revisions?.[operation.id] ?? null,
					deleted: operation.action === "delete",
					payload: operation.action === "delete" ? null : operation.payload
				}
			});
			if (operation.action === "delete") cache.delete(`${operation.entityType}:${operation.entityId}`);
			else cache.put({
				key: `${operation.entityType}:${operation.entityId}`,
				id: operation.entityId,
				entityType: operation.entityType,
				payload: operation.payload,
				updatedAt: result.syncedAt,
				syncState: "synced",
				serverRevision: result.revisions?.[operation.id] ?? null
			});
		}
		for (const rejected of result.rejected ?? []) {
			const op = await requestValue(outbox.get(rejected.id));
			if (op) {
				outbox.put({
					...op,
					blockedReason: rejected.reason,
					conflictServerRevision: rejected.serverRevision
				});
				if (rejected.reason === "version_conflict" && rejected.serverRevision === null) writeTx.objectStore(META_STORE).put({
					key: `server:${op.entityType}:${op.entityId}`,
					value: {
						entityType: op.entityType,
						id: op.entityId,
						revision: null,
						deleted: true,
						payload: null
					}
				});
			}
		}
		const successors = await requestValue(outbox.getAll());
		for (const successor of successors) {
			const sent = operations.find((op) => op.entityType === successor.entityType && op.entityId === successor.entityId && result.accepted.includes(op.id));
			if (sent && (successor.baseRevision ?? null) === (sent.baseRevision ?? null) && result.revisions?.[sent.id] !== void 0) outbox.put({
				...successor,
				baseRevision: result.revisions[sent.id]
			});
		}
		const remaining = await requestValue(outbox.getAll());
		for (const operation of latestPendingOperations(remaining)) {
			const key = `${operation.entityType}:${operation.entityId}`;
			if (operation.action === "delete") cache.delete(key);
			else cache.put({
				key,
				id: operation.entityId,
				entityType: operation.entityType,
				payload: operation.payload,
				updatedAt: operation.clientUpdatedAt,
				syncState: "pending",
				serverRevision: operation.baseRevision
			});
		}
		const priorSync = await requestValue(writeTx.objectStore(META_STORE).get("lastSync"));
		writeTx.objectStore(META_STORE).put({
			key: "lastSync",
			value: priorSync?.value > result.syncedAt ? priorSync.value : result.syncedAt
		});
		await writeDone;
	} catch (error) {
		try {
			writeTx.abort();
		} catch {}
		await writeDone.catch(() => void 0);
		throw error;
	} finally {
		db.close();
	}
	notifyChange();
	const pending = await getPendingCount(owner);
	return {
		ok: pending === 0,
		pending,
		processed: result.accepted.length + (result.rejected?.length ?? 0),
		lastSync: result.syncedAt,
		...pending ? { reason: result.rejected?.[0]?.reason ?? "more_pending" } : {}
	};
}
function syncNow() {
	if (!syncPromise) syncPromise = (async () => {
		let result = await runSync();
		while (result.pending > 0 && (result.processed ?? 0) > 0) {
			const next = await runSync();
			if (next.pending >= result.pending && next.reason === "more_pending") return next;
			result = next;
		}
		return result;
	})().finally(() => {
		syncPromise = null;
	});
	return syncPromise;
}
async function getSyncIssues() {
	const db = await openDb();
	const tx = db.transaction([OUTBOX_STORE, META_STORE], "readonly");
	const done = transactionDone(tx);
	const ops = await requestValue(tx.objectStore(OUTBOX_STORE).getAll());
	const issues = [];
	for (const operation of ops.filter((op) => op.blockedReason)) {
		const entry = await requestValue(tx.objectStore(META_STORE).get(`server:${operation.entityType}:${operation.entityId}`));
		issues.push({
			operation,
			server: entry?.value ?? null
		});
	}
	await done;
	db.close();
	return issues;
}
async function resolveSyncIssue(id, choice, expectedRevision) {
	const db = await openDb();
	const tx = db.transaction([
		OUTBOX_STORE,
		CACHE_STORE,
		META_STORE
	], "readwrite");
	const done = transactionDone(tx);
	try {
		const op = await requestValue(tx.objectStore(OUTBOX_STORE).get(id));
		if (!op?.blockedReason) throw new Error("El registro cambió. Actualiza la lista antes de decidir.");
		const server = (await requestValue(tx.objectStore(META_STORE).get(`server:${op.entityType}:${op.entityId}`)))?.value;
		if (op.blockedReason === "version_conflict" && (!server || server.revision !== expectedRevision)) throw new Error("Actualiza la copia del servidor antes de resolver este conflicto.");
		tx.objectStore(META_STORE).put({
			key: `resolved:${op.id}`,
			value: {
				operation: op,
				server,
				choice,
				resolvedAt: (/* @__PURE__ */ new Date()).toISOString()
			}
		});
		const key = `${op.entityType}:${op.entityId}`;
		tx.objectStore(OUTBOX_STORE).delete(op.id);
		if (choice === "server") if (!server || server.deleted) tx.objectStore(CACHE_STORE).delete(key);
		else tx.objectStore(CACHE_STORE).put({
			key,
			id: op.entityId,
			entityType: op.entityType,
			payload: server.payload,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			serverRevision: server.revision,
			syncState: "synced"
		});
		else tx.objectStore(OUTBOX_STORE).put({
			...op,
			id: createLocalId("retry"),
			baseRevision: server?.revision ?? op.baseRevision,
			blockedReason: void 0,
			conflictServerRevision: void 0
		});
		await done;
		notifyChange();
	} catch (error) {
		try {
			tx.abort();
		} catch {}
		await done.catch(() => void 0);
		throw error;
	} finally {
		db.close();
	}
}
function subscribeOfflineChanges(callback) {
	window.addEventListener("morochos-offline-change", callback);
	return () => window.removeEventListener("morochos-offline-change", callback);
}
function notifyChange() {
	if (typeof window !== "undefined") window.dispatchEvent(new Event("morochos-offline-change"));
}
/** A consistent, versioned recovery copy. It does not remove or send pending changes. */
async function exportLocalBackup(legacy = false) {
	const owner = legacy ? "legacy-unassigned" : await localOwner();
	const db = await openDb(legacy ? DB_NAME : databaseNameForOwner(owner));
	const tx = db.transaction([
		CACHE_STORE,
		OUTBOX_STORE,
		META_STORE
	], "readonly");
	const done = transactionDone(tx);
	const [entities, outbox, meta] = await Promise.all([
		requestValue(tx.objectStore(CACHE_STORE).getAll()),
		requestValue(tx.objectStore(OUTBOX_STORE).getAll()),
		requestValue(tx.objectStore(META_STORE).getAll())
	]);
	await done;
	db.close();
	return {
		format: "venezuela-agro-local-backup",
		version: 1,
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		origin: location.origin,
		owner,
		entities,
		outbox,
		meta
	};
}
async function getLegacyRecordCount() {
	const db = await openDb(DB_NAME);
	const tx = db.transaction([CACHE_STORE, OUTBOX_STORE], "readonly");
	const done = transactionDone(tx);
	const [records, pending] = await Promise.all([requestValue(tx.objectStore(CACHE_STORE).count()), requestValue(tx.objectStore(OUTBOX_STORE).count())]);
	await done;
	db.close();
	return records + pending;
}
/** Explicit local-only recovery; never moves legacy records into an authenticated account. */
async function recoverLegacyOnDevice() {
	if (await localOwner() !== "device-local") throw new Error("Abre la copia local del dispositivo para recuperar estos registros.");
	const backup = await exportLocalBackup(true);
	const db = await openDb(databaseNameForOwner("device-local"));
	const tx = db.transaction([CACHE_STORE, OUTBOX_STORE], "readwrite");
	const done = transactionDone(tx);
	const [existing, pending] = await Promise.all([requestValue(tx.objectStore(CACHE_STORE).getAllKeys()), requestValue(tx.objectStore(OUTBOX_STORE).getAll())]);
	const candidates = legacyRecoveryCandidates(backup.entities, existing.map(String), pending);
	let recovered = 0;
	for (const entity of candidates) {
		tx.objectStore(CACHE_STORE).put({
			...entity,
			syncState: "pending"
		});
		if (![
			"cart",
			"order",
			"feedback"
		].includes(entity.entityType)) tx.objectStore(OUTBOX_STORE).put({
			id: createLocalId("recovery"),
			entityType: entity.entityType,
			entityId: entity.id,
			action: "upsert",
			payload: entity.payload,
			clientUpdatedAt: entity.updatedAt
		});
		recovered++;
	}
	await done;
	db.close();
	notifyChange();
	return recovered;
}
/** Reviewed backups are imported only into the device workspace, never an account or server. */
async function importBackupToDevice(text) {
	const { parseLocalBackup, validateBackupAnimalLinks } = await import("./backup-import-D4Je3feO.js").then((n) => n.n);
	const backup = parseLocalBackup(text);
	const db = await openDb(databaseNameForOwner("device-local"));
	const tx = db.transaction([
		CACHE_STORE,
		OUTBOX_STORE,
		META_STORE
	], "readwrite");
	const done = transactionDone(tx);
	try {
		const [existing, pending] = await Promise.all([requestValue(tx.objectStore(CACHE_STORE).getAll()), requestValue(tx.objectStore(OUTBOX_STORE).getAll())]);
		const protectedKeys = new Set([...existing.map((row) => row.key), ...pending.map((op) => `${op.entityType}:${op.entityId}`)]);
		const incoming = new Map(backup.entities.map((entity) => [entity.key, entity]));
		const latest = latestPendingOperations(backup.outbox);
		for (const operation of latest) {
			const key = `${operation.entityType}:${operation.entityId}`;
			if (operation.action === "delete") incoming.delete(key);
			else incoming.set(key, {
				key,
				id: operation.entityId,
				entityType: operation.entityType,
				payload: operation.payload,
				updatedAt: operation.clientUpdatedAt,
				syncState: "pending"
			});
		}
		const combined = new Map(existing.map((entity) => [entity.key, entity]));
		for (const operation of latestPendingOperations(pending)) if (operation.action === "upsert") {
			const key = `${operation.entityType}:${operation.entityId}`;
			combined.set(key, {
				key,
				id: operation.entityId,
				entityType: operation.entityType,
				payload: operation.payload,
				updatedAt: operation.clientUpdatedAt,
				syncState: "pending"
			});
		}
		const sourceOwner = backup.owner && !["device-local", "legacy-unassigned"].includes(backup.owner) ? backup.owner : void 0;
		for (const entity of incoming.values()) if (!protectedKeys.has(entity.key)) combined.set(entity.key, {
			...entity,
			payload: {
				...entity.payload,
				...sourceOwner && entity.payload.ownerId === void 0 ? { ownerId: sourceOwner } : {}
			}
		});
		validateBackupAnimalLinks([...combined.values()]);
		let imported = 0, skipped = 0, deletions = 0;
		for (const entity of incoming.values()) {
			if (protectedKeys.has(entity.key)) {
				skipped++;
				continue;
			}
			tx.objectStore(CACHE_STORE).put({
				...entity,
				syncState: "pending"
			});
			if (![
				"cart",
				"order",
				"feedback"
			].includes(entity.entityType)) tx.objectStore(OUTBOX_STORE).put({
				id: createLocalId("import"),
				entityType: entity.entityType,
				entityId: entity.id,
				action: "upsert",
				payload: entity.payload,
				clientUpdatedAt: entity.updatedAt
			});
			imported++;
		}
		for (const operation of latest) {
			const key = `${operation.entityType}:${operation.entityId}`;
			if (operation.action !== "delete" || ["order", "feedback"].includes(operation.entityType)) continue;
			if (protectedKeys.has(key)) {
				skipped++;
				continue;
			}
			tx.objectStore(OUTBOX_STORE).put({
				...operation,
				id: createLocalId("import-delete")
			});
			deletions++;
		}
		tx.objectStore(META_STORE).put({
			key: "lastLocalImport",
			value: {
				at: (/* @__PURE__ */ new Date()).toISOString(),
				sourceOrigin: backup.origin,
				sourceExportedAt: backup.exportedAt,
				imported,
				skipped,
				deletions
			}
		});
		await done;
		notifyChange();
		return {
			imported,
			skipped,
			deletions
		};
	} catch (error) {
		try {
			tx.abort();
		} catch {}
		await done.catch(() => void 0);
		throw error;
	} finally {
		db.close();
	}
}
async function getOperationStatus(id) {
	const db = await openDb();
	const tx = db.transaction([OUTBOX_STORE, META_STORE], "readonly");
	const done = transactionDone(tx);
	const [ack, operation] = await Promise.all([requestValue(tx.objectStore(META_STORE).get(`ack:${id}`)), requestValue(tx.objectStore(OUTBOX_STORE).get(id))]);
	await done;
	db.close();
	if (ack) return {
		state: "confirmed",
		confirmedAt: ack.value.confirmedAt,
		...ack.value.serverRevision !== void 0 ? { serverRevision: ack.value.serverRevision } : {}
	};
	if (operation) return {
		state: operation.blockedReason ? "blocked" : "pending",
		reason: operation.blockedReason
	};
	return { state: "unknown" };
}
//#endregion
export { geographicReferenceSchema as A, storeCategories as B, assertPlanDraftContext as C, farmPayloadSchema as D, placementFits as E, projectPayloadSchema as F, REPRODUCTION_EVENT_TYPES as G, unitRule as H, surveyPlanSchema as I, isAnimalHistoryType as J, animalRecordDate as K, defaultQuantity as L, listingPayloadSchema as M, orderPayloadSchema as N, farmRecordPayloadSchema as O, professionalPayloadSchema as P, relatedStoreProducts as R, animalPlacementAt as S, placementAt as T, validStoreQuantity as U, storeProducts as V, HEALTH_EVENT_TYPES as W, linkedAnimalRecords as X, isValidAnimalRecordDate as Y, preserveAnimalRecordData as Z, splitDeviceLocalArea as _, getCachedEntities as a, latestPendingOperations as b, getLegacyRecordCount as c, getSyncIssues as d, hydrateFromServer as f, resolveSyncIssue as g, recoverLegacyOnDevice as h, exportLocalBackup as i, legacySurveyPlanSchema as j, feedbackPayloadSchema as k, getOperationStatus as l, queueMutation as m, cacheEntity as n, getCachedEntity as o, importBackupToDevice as p, animalRecordEventLabel as q, createLocalId as r, getLastSync as s, assertAreaReadyForOnlineSplit as t, getPendingCount as u, subscribeOfflineChanges as v, isTap as w, deriveAreaSplit as x, syncNow as y, restoreStoreLine as z };
