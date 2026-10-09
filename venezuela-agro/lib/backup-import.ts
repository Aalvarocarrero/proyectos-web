import { z } from "zod";
import { surveyPlanSchema, legacySurveyPlanSchema, farmPayloadSchema, farmRecordPayloadSchema, orderPayloadSchema, professionalPayloadSchema, projectPayloadSchema, feedbackPayloadSchema } from "@/lib/sync-validation";
import { publicFarmSchema, socialPostSchema, socialCommentSchema, socialReactionSchema } from "@/lib/network-profile";
export const MAX_BACKUP_BYTES = 15 * 1024 * 1024;
const types = ["public-farm","social-post","social-comment","social-reaction","farm","farm-record","listing","order","professional","project","feedback","cart"] as const;
const entityType=z.enum(types);
const id=z.string().min(1).max(200).regex(/^[a-zA-Z0-9_.:-]+$/);
const date=z.string().max(50).refine(value=>Number.isFinite(Date.parse(value)),"Fecha inválida");
const payload=z.record(z.string(),z.unknown());
const entity=z.object({key:z.string().min(1).max(240),id,entityType,payload,updatedAt:date,syncState:z.enum(["synced","pending"]),serverRevision:z.string().max(160).nullable().optional()}).strict().refine(value=>value.key===`${value.entityType}:${value.id}`,"Clave inválida");
const operation=z.object({id,entityType:entityType.refine(value=>value!=="cart"),entityId:id,action:z.enum(["upsert","delete"]),payload,clientUpdatedAt:date,baseRevision:z.string().max(160).nullable().optional(),blockedReason:z.string().max(2000).optional(),conflictServerRevision:z.string().max(160).nullable().optional()}).strict();
const schema=z.object({format:z.literal("venezuela-agro-local-backup"),version:z.literal(1),exportedAt:date,origin:z.string().min(1).max(500),owner:z.string().min(1).max(220).optional(),entities:z.array(entity).max(10000),outbox:z.array(operation).max(20000),meta:z.array(z.object({key:z.string().max(500),value:z.unknown()}).strict()).max(30000)}).strict();
export type LocalBackup = z.infer<typeof schema>;
const listingShape=z.object({title:z.string().min(1).max(300),category:z.string().max(200),description:z.string().max(5000).optional().default(""),sellerName:z.string().max(200).optional().default(""),location:z.string().max(300).optional().default(""),priceCents:z.number().finite().nullable().optional(),currency:z.string().max(20).optional(),imageUrl:z.string().max(1000).nullable().optional(),imageDataUrl:z.string().max(3000000).optional(),imageAlt:z.string().max(1000).optional(),status:z.string().max(100).optional(),contact:z.string().max(1000).optional(),state:z.string().max(200).optional(),municipality:z.string().max(200).optional(),saleFormat:z.string().max(200).optional(),supplyUnit:z.string().max(100).optional(),minimumOrder:z.string().max(100).optional(),buyerType:z.string().max(100).optional()});
const payloadSchemas: Record<typeof types[number], z.ZodType> = {
 "farm":farmPayloadSchema.extend({surveyPlan:surveyPlanSchema.or(legacySurveyPlanSchema).optional()}),"farm-record":farmRecordPayloadSchema,"listing":listingShape,
 "order":orderPayloadSchema,"professional":professionalPayloadSchema,"project":projectPayloadSchema,"feedback":feedbackPayloadSchema,
 "public-farm":publicFarmSchema,"social-post":socialPostSchema,"social-comment":socialCommentSchema,"social-reaction":socialReactionSchema,
 "cart":z.object({items:z.array(z.record(z.string(),z.unknown())).max(1000),channel:z.enum(["personal","business"]).optional()}),
};
function validatedPayload(type:typeof types[number],raw:Record<string,unknown>):Record<string,unknown> {
 const result=payloadSchemas[type].safeParse(raw);
 if(!result.success)throw new Error(`La copia contiene un registro ${type} con campos incompatibles. No se importó ningún dato.`);
 // Keep server/legacy fields, but normalize supported optional defaults for safe rendering.
 const data=result.data as Record<string,unknown>;
 if(type==="farm"&&raw.surveyPlan&&typeof raw.surveyPlan==="object"&&Array.isArray((raw.surveyPlan as Record<string,unknown>).vertices)){data.surveyPlan={...(data.surveyPlan as Record<string,unknown>),vertices:(raw.surveyPlan as Record<string,unknown>).vertices};}
 return {...raw,...data,...(type==="farm" && raw.areaSqM===undefined?{areaSqM:0}:{})};
}

function checkTree(value:unknown, depth=0, budget={count:0}) {
 if(++budget.count>300000 || depth>25)throw new Error("La copia supera los límites de estructura permitidos.");
 if(value===null||typeof value!=="object")return;
 if(Array.isArray(value)){if(value.length>20000)throw new Error("Lista demasiado grande.");for(const item of value)checkTree(item,depth+1,budget);return;}
 for(const [key,item] of Object.entries(value)){
  if(["__proto__","prototype","constructor"].includes(key))throw new Error("La copia contiene una clave insegura.");
  checkTree(item,depth+1,budget);
 }
}
export function parseLocalBackup(text:string):LocalBackup {
 if(new TextEncoder().encode(text).byteLength>MAX_BACKUP_BYTES)throw new Error("La copia supera 15 MB. No se ha importado ningún registro.");
 let raw:unknown;try{raw=JSON.parse(text);}catch{throw new Error("El archivo no es una copia JSON válida.");}
 checkTree(raw);
 const result=schema.safeParse(raw);
 if(!result.success)throw new Error("La copia no tiene el formato o la versión compatible de Venezuela Agro.");
 for(const [items,key] of [[result.data.entities,"key"],[result.data.outbox,"id"]] as const){const seen=new Set<string>();for(const item of items){const value=String((item as Record<string,unknown>)[key]);if(seen.has(value))throw new Error("La copia contiene registros duplicados.");seen.add(value);}}
 for(const row of result.data.entities)row.payload=validatedPayload(row.entityType,row.payload);
 for(const row of result.data.outbox)if(row.action==="upsert")row.payload=validatedPayload(row.entityType,row.payload);
 return result.data;
}
