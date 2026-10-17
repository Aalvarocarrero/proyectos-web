import { currencySchema } from "./exchange-rates";
import { HEALTH_EVENT_TYPES, REPRODUCTION_EVENT_TYPES, isAnimalHistoryType, isAnimalRecordDate } from "@/lib/animal-records";
import {validStoreQuantity} from "@/lib/store-products";
import { professionalDetailsSchema } from "@/lib/professional-profile";
import { z } from "zod";
import {productDetailsSchema,marketplaceImageInputSchema} from "./marketplace-details";
import { listingContactSchema } from "./listing-contact";
import { validateNormalizedSketchPolygon, validateSurveyVertices } from "./polygon-geometry";

const id = z.string().min(3).max(160).regex(/^[a-zA-Z0-9_-]+$/);
const isoDate = z.string().datetime({ offset: true }).or(z.string().datetime());

export const syncOperationSchema = z.object({
  id,
  entityType: z.enum(["farm", "farm-record", "listing", "order", "professional", "project", "feedback", "public-farm", "social-post", "social-comment", "social-reaction"]),
  entityId: id,
  action: z.enum(["upsert", "delete"]),
  payload: z.record(z.string(), z.unknown()),
  clientUpdatedAt: isoDate,
  baseRevision: z.string().max(160).nullable().optional(),
});

export const syncBatchSchema = z.object({
  operations: z.array(syncOperationSchema).min(1).max(100),
});

const legacySurveyVertexSchema = z.object({
  id: z.string().trim().min(1).max(24),
  easting: z.coerce.number().finite().min(-1_000_000_000).max(1_000_000_000),
  northing: z.coerce.number().finite().min(-1_000_000_000).max(1_000_000_000),
});

/** Compatibility reader for historical data; new writes use surveyPlanSchema. */
export const legacySurveyPlanSchema = z.object({
  version: z.literal(1),
  state: z.string().trim().max(80).default(""),
  municipality: z.string().trim().max(100).default(""),
  parish: z.string().trim().max(100).default(""),
  sector: z.string().trim().max(140).default(""),
  lot: z.string().trim().max(40).default("1"),
  northBoundary: z.string().trim().max(220).default(""),
  eastBoundary: z.string().trim().max(220).default(""),
  southBoundary: z.string().trim().max(220).default(""),
  westBoundary: z.string().trim().max(220).default(""),
  datum: z.string().trim().max(40).default(""),
  utmZone: z.string().trim().max(20).default(""),
  scaleDenominator: z.coerce.number().int().min(0).max(100_000_000).default(0),
  procedureType: z.string().trim().max(140).default(""),
  applicationReference: z.string().trim().max(140).default(""),
  fileReference: z.string().trim().max(140).default(""),
  status: z.string().trim().max(100).default(""),
  inspectionDate: z.string().trim().max(30).default(""),
  technicalResponsible: z.string().trim().max(160).default(""),
  sourceNote: z.string().trim().max(220).default(""),
  observations: z.string().trim().max(3000).default(""),
  vertices: z.array(legacySurveyVertexSchema).max(200).default([]),
});

export const surveyPlanSchema = legacySurveyPlanSchema.extend({
  vertices: z.array(z.object({
    id: z.string({ required_error: "Indica el identificador del punto." }).min(1, "Indica el identificador del punto.").max(24, "El identificador del punto admite hasta 24 caracteres.").refine((value) => value.trim().length > 0, "Indica el identificador del punto."),
    easting: z.number({ required_error: "Completa la coordenada Este.", invalid_type_error: "Completa la coordenada Este con un número." }).finite("La coordenada Este debe ser un número finito.").min(-1_000_000_000, "Revisa el rango de la coordenada Este.").max(1_000_000_000, "Revisa el rango de la coordenada Este."),
    northing: z.number({ required_error: "Completa la coordenada Norte.", invalid_type_error: "Completa la coordenada Norte con un número." }).finite("La coordenada Norte debe ser un número finito.").min(-1_000_000_000, "Revisa el rango de la coordenada Norte.").max(1_000_000_000, "Revisa el rango de la coordenada Norte."),
  }).strict()).max(201, "El plano admite hasta 200 puntos distintos y una repetición explícita de cierre.").default([]),
}).superRefine((plan, ctx) => {
  if (plan.vertices.length === 0) return;
  const result = validateSurveyVertices(plan.vertices);
  if (!result.ok) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["vertices"], message: result.error });
});

export const normalizedSketchPolygonSchema = z.unknown().transform((input, ctx) => {
  const result = validateNormalizedSketchPolygon(input);
  if (!result.ok) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error });
    return z.NEVER;
  }
  return result.polygon;
});

export const geographicReferenceSchema=z.discriminatedUnion("source",[
 z.object({version:z.literal(1),source:z.literal("wgs84-point"),latitude:z.number().finite().min(-90).max(90),longitude:z.number().finite().min(-180).max(180)}).strict(),
 z.object({version:z.literal(1),source:z.literal("regven-utm19n-point"),easting:z.number().finite().min(100000).max(900000),northing:z.number().finite().min(0).max(10000000)}).strict(),
 z.object({version:z.literal(1),source:z.literal("regven-utm19n-survey")}).strict(),
]);

export const farmPayloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  location: z.string().trim().max(180).optional().default(""),
  areaSqM: z.coerce.number().int().min(0).max(2_000_000_000).optional(),
  boundaryShape: z.enum(["Irregular / polígono", "Rectángulo", "Triángulo", "Óvalo"]).optional().default("Irregular / polígono"),
  boundaryMeasurements: z.record(z.string(), z.coerce.number().min(0).max(10_000_000)).optional().default({}),
  surveyPlan: surveyPlanSchema.optional(),
  propertySketch: normalizedSketchPolygonSchema.nullable().optional(),
  geographicReference:geographicReferenceSchema.nullable().optional(),
  objective: z.string().trim().max(500).optional().default(""),
});

export const farmRecordPayloadSchema = z.object({
  farmId: id,
  recordType: z.enum([
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
    "document",
  ]),
  category: z.string().trim().max(80).optional().default(""),
  title: z.string().trim().min(1).max(160),
  data: z.object({ animalId: id.nullable().optional(), areaId:z.string().trim().min(1).max(160).nullable().optional(), typedAreaOutline: normalizedSketchPolygonSchema.optional(), planPlacement:z.object({version:z.literal(1),source:z.literal("user-placed"),coordinateSpace:z.literal("area-percent"),areaId:z.string().trim().min(1).max(160),x:z.number().finite().gt(0).lt(100),y:z.number().finite().gt(0).lt(100)}).strict().nullable().optional() }).catchall(z.unknown()),
}).superRefine((payload, ctx) => {
  const { data, recordType } = payload;
  const issue = (field: string, message: string) => ctx.addIssue({ code: "custom", path: ["data", field], message });
  if (recordType === "finance" || recordType === "plan") {
    if (data.currency !== undefined && !currencySchema.safeParse(data.currency).success) issue("currency", "Selecciona una moneda válida: USD, EUR, COP o VES.");
    for (const field of recordType === "finance" ? ["amount"] : ["costPerUnit", "expectedRevenue"]) {
      const value = data[field];
      if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 2_000_000_000)) issue(field, "Indica un importe válido, igual o mayor que cero y dentro del límite permitido.");
    }
  }
  const placement = data.planPlacement;
  if (placement && (recordType !== "animal" || data.areaId !== placement.areaId)) issue("planPlacement", "La ubicación necesita un animal y el mismo identificador de área.");
  if (data.animalId != null && !isAnimalHistoryType(recordType)) issue("animalId", "Solo los pesajes y eventos sanitarios o reproductivos se vinculan a un animal.");
  if (recordType === "reproduction" && !data.animalId) issue("animalId", "Selecciona el animal del registro reproductivo.");
  // Unlinked legacy health records remain readable, including unknown data fields,
  // without invented dates or links.
  if (recordType === "reproduction" || (recordType === "health" && data.animalId)) {
    const options = recordType === "health" ? HEALTH_EVENT_TYPES : REPRODUCTION_EVENT_TYPES;
    if (!options.some(option => option.value === data.eventType)) issue("eventType", "Selecciona un tipo de evento válido.");
    if (!isAnimalRecordDate(data.date)) issue("date", "Indica una fecha válida (AAAA-MM-DD).");
    if (data.nextDate !== undefined && data.nextDate !== null && data.nextDate !== "" && !isAnimalRecordDate(data.nextDate)) issue("nextDate", "Indica una próxima fecha válida (AAAA-MM-DD).");
    for (const [field, limit] of [["notes", 5000], ["professional", 240], ["outcome", 1000]] as const) {
      if (data[field] !== undefined && data[field] !== null && (typeof data[field] !== "string" || (data[field] as string).length > limit)) issue(field, "Revisa el texto de este campo.");
    }
  }
});

export const listingPayloadSchema = z.object({
  sellerName: z.string().trim().min(2).max(120),
  contactProfile: listingContactSchema.optional(),
  productDetails:productDetailsSchema.optional(),
  additionalImageDataUrls:z.array(marketplaceImageInputSchema).max(5).optional(),
  sellerImageDataUrl:marketplaceImageInputSchema.optional(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(3000),
  category: z.string().trim().min(2).max(100),
  priceCents: z.coerce.number().int().min(0).max(2_000_000_000).nullable().optional(),
  currency: currencySchema.default("USD"),
  location: z.string().trim().min(2).max(180),
  state: z.string().trim().min(2).max(80),
  municipality: z.string().trim().max(100).optional().default(""),
  shortIntro: z.string().trim().min(8).max(240),
  photoContext: z.string().trim().min(5).max(300),
  saleFormat: z.string().trim().min(2).max(120).optional().default("A convenir"),
  supplyUnit: z.string().trim().min(1).max(40).optional().default("unidad"),
  minimumOrder: z.string().trim().max(80).optional().default(""),
  buyerType: z.enum(["Personas y empresas", "Solo empresas", "Personas" ]).optional().default("Personas y empresas"),
  contact: z.string().trim().max(180).optional().default(""),
  imageDataUrl: z.string().max(3_000_000).optional(),
});

export const professionalPayloadSchema = z.object({
  name: z.string().trim().min(3).max(120),
  profession: z.string().trim().min(2).max(100),
  specialties: z.string().trim().min(3).max(500),
  state: z.string().trim().min(2).max(80),
  municipality: z.string().trim().max(100).optional().default(""),
  serviceMode: z.enum(["Presencial", "Remoto", "Presencial y remoto", "Visitas programadas", "Jornadas de campo", "Capacitación presencial o virtual"]),
  introduction: z.string().trim().min(20).max(1200),
  contact: z.string().trim().min(5).max(180),
  credentialNote: z.string().trim().max(500).optional().default(""),
  profileDetails: professionalDetailsSchema.optional(),
}).superRefine((payload, ctx) => {
  if (payload.profileDetails && (!/^[+\d\s().-]+$/.test(payload.contact) || payload.contact.replace(/\D/g, "").length < 7 || payload.contact.replace(/\D/g, "").length > 15)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["contact"], message: "Introduce un teléfono válido con código de país." });
  }
});

export const projectPayloadSchema = z.object({
  title: z.string().trim().min(4).max(160),
  sector: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(80),
  summary: z.string().trim().min(30).max(2000),
  has: z.array(z.string().trim().min(1).max(120)).max(20),
  needs: z.array(z.string().trim().min(1).max(120)).max(20),
  impact: z.string().trim().min(20).max(1500),
  requestedSupport: z.string().trim().min(10).max(1000),
  contact: z.string().trim().min(5).max(180),
});

export const feedbackPayloadSchema = z.object({
  area: z.enum(["Sitio web", "Mercado Agro", "Mi Finca", "Profesionales", "Proyectos", "Otro"]),
  role: z.string().trim().min(2).max(100),
  message: z.string().trim().min(10).max(1500),
  contact: z.string().trim().max(180).optional().default(""),
});

export const orderPayloadSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  email: z.string().email().max(180).optional().or(z.literal("")),
  phone: z.string().trim().max(60).refine(value=>/^[+\d\s().-]+$/.test(value)&&value.replace(/\D/g,"").length>=7&&value.replace(/\D/g,"").length<=15,"Teléfono inválido").optional().or(z.literal("")),
  items: z.array(
    z.object({
      id: id,
      name: z.string().min(1).max(160),
      quantity: z.coerce.number().min(0.001).max(1_000_000),
      presentation: z.string().trim().max(120).optional().default(""),
      measure: z.string().trim().max(80).optional().default(""),
      preparation:z.string().trim().max(120).optional().default(""),
      specifications:z.string().trim().max(600).optional().default(""),
    }),
  ).min(1).max(100),
  note: z.string().trim().max(1200).optional().default(""),
  channel: z.enum(["personal", "business"]).optional().default("personal"),
  business: z.object({
    companyName: z.string().trim().max(180).optional().default(""),
    companyType: z.string().trim().max(100).optional().default(""),
    taxId: z.string().trim().max(80).optional().default(""),
    deliveryLocation: z.string().trim().max(220).optional().default(""),
    frequency: z.string().trim().max(100).optional().default(""),
    requiredDate:z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/).optional().default(""),
    deliveryMode:z.string().trim().max(100).optional().default(""),
  }).optional(),
}).refine((value) => Boolean(value.email || value.phone), {
  message: "Se requiere un correo o teléfono de contacto.",
}).superRefine((p,ctx)=>{
 if(p.channel==='business'&&!p.business?.companyName.trim())ctx.addIssue({code:z.ZodIssueCode.custom,path:['business','companyName'],message:'Indica el nombre de la empresa.'});
 p.items.forEach((line,i)=>{if(!validStoreQuantity(line.quantity,line.measure))ctx.addIssue({code:z.ZodIssueCode.custom,path:['items',i,'quantity'],message:'Las unidades, animales, lotes y dosis necesitan cantidades enteras.'});if(/Plántula/.test(line.presentation)&&line.measure!=='unidad')ctx.addIssue({code:z.ZodIssueCode.custom,path:['items',i,'measure'],message:'Las plantas se solicitan por unidad.'});});
});
