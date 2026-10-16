import { T as __exportAll } from "../index.js";
import { D as farmPayloadSchema, F as projectPayloadSchema, I as surveyPlanSchema, J as isAnimalHistoryType, N as orderPayloadSchema, O as farmRecordPayloadSchema, P as professionalPayloadSchema, Z as preserveAnimalRecordData, b as latestPendingOperations, j as legacySurveyPlanSchema, k as feedbackPayloadSchema } from "./offline-db-BE3xVTyb.js";
import { c as numberType, d as stringType, l as objectType, n as arrayType, o as enumType, p as unknownType, s as literalType, u as recordType } from "./types-nz7Y6Ylx.js";
import { g as socialCommentSchema, m as publicFarmSchema, v as socialPostSchema, y as socialReactionSchema } from "./professional-profile-Bdu_R75C.js";
//#region lib/backup-import.ts
var backup_import_exports = /* @__PURE__ */ __exportAll({
	MAX_BACKUP_BYTES: () => MAX_BACKUP_BYTES,
	parseLocalBackup: () => parseLocalBackup,
	validateBackupAnimalLinks: () => validateBackupAnimalLinks
});
var MAX_BACKUP_BYTES = 15 * 1024 * 1024;
var entityType = enumType([
	"public-farm",
	"social-post",
	"social-comment",
	"social-reaction",
	"farm",
	"farm-record",
	"listing",
	"order",
	"professional",
	"project",
	"feedback",
	"cart"
]);
var id = stringType().min(1).max(200).regex(/^[a-zA-Z0-9_.:-]+$/);
var date = stringType().max(50).refine((value) => Number.isFinite(Date.parse(value)), "Fecha inválida");
var payload = recordType(stringType(), unknownType());
var entity = objectType({
	key: stringType().min(1).max(240),
	id,
	entityType,
	payload,
	updatedAt: date,
	syncState: enumType(["synced", "pending"]),
	serverRevision: stringType().max(160).nullable().optional()
}).strict().refine((value) => value.key === `${value.entityType}:${value.id}`, "Clave inválida");
var operation = objectType({
	id,
	entityType: entityType.refine((value) => value !== "cart"),
	entityId: id,
	action: enumType(["upsert", "delete"]),
	payload,
	clientUpdatedAt: date,
	baseRevision: stringType().max(160).nullable().optional(),
	blockedReason: stringType().max(2e3).optional(),
	conflictServerRevision: stringType().max(160).nullable().optional()
}).strict();
var schema = objectType({
	format: literalType("venezuela-agro-local-backup"),
	version: literalType(1),
	exportedAt: date,
	origin: stringType().min(1).max(500),
	owner: stringType().min(1).max(220).optional(),
	entities: arrayType(entity).max(1e4),
	outbox: arrayType(operation).max(2e4),
	meta: arrayType(objectType({
		key: stringType().max(500),
		value: unknownType()
	}).strict()).max(3e4)
}).strict();
var listingShape = objectType({
	title: stringType().min(1).max(300),
	category: stringType().max(200),
	description: stringType().max(5e3).optional().default(""),
	sellerName: stringType().max(200).optional().default(""),
	location: stringType().max(300).optional().default(""),
	priceCents: numberType().finite().nullable().optional(),
	currency: stringType().max(20).optional(),
	imageUrl: stringType().max(1e3).nullable().optional(),
	imageDataUrl: stringType().max(3e6).optional(),
	imageAlt: stringType().max(1e3).optional(),
	status: stringType().max(100).optional(),
	contact: stringType().max(1e3).optional(),
	state: stringType().max(200).optional(),
	municipality: stringType().max(200).optional(),
	saleFormat: stringType().max(200).optional(),
	supplyUnit: stringType().max(100).optional(),
	minimumOrder: stringType().max(100).optional(),
	buyerType: stringType().max(100).optional()
});
var payloadSchemas = {
	"farm": farmPayloadSchema.extend({ surveyPlan: surveyPlanSchema.or(legacySurveyPlanSchema).optional() }),
	"farm-record": farmRecordPayloadSchema,
	"listing": listingShape,
	"order": orderPayloadSchema,
	"professional": professionalPayloadSchema,
	"project": projectPayloadSchema,
	"feedback": feedbackPayloadSchema,
	"public-farm": publicFarmSchema,
	"social-post": socialPostSchema,
	"social-comment": socialCommentSchema,
	"social-reaction": socialReactionSchema,
	"cart": objectType({
		items: arrayType(recordType(stringType(), unknownType())).max(1e3),
		channel: enumType(["personal", "business"]).optional()
	})
};
function validatedPayload(type, raw) {
	const result = payloadSchemas[type].safeParse(raw);
	if (!result.success) throw new Error(`La copia contiene un registro ${type} con campos incompatibles. No se importó ningún dato.`);
	const data = result.data;
	if (type === "farm" && raw.surveyPlan && typeof raw.surveyPlan === "object" && Array.isArray(raw.surveyPlan.vertices)) data.surveyPlan = {
		...data.surveyPlan,
		vertices: raw.surveyPlan.vertices
	};
	return {
		...raw,
		...data,
		...type === "farm" && raw.areaSqM === void 0 ? { areaSqM: 0 } : {}
	};
}
function checkTree(value, depth = 0, budget = { count: 0 }) {
	if (++budget.count > 3e5 || depth > 25) throw new Error("La copia supera los límites de estructura permitidos.");
	if (value === null || typeof value !== "object") return;
	if (Array.isArray(value)) {
		if (value.length > 2e4) throw new Error("Lista demasiado grande.");
		for (const item of value) checkTree(item, depth + 1, budget);
		return;
	}
	for (const [key, item] of Object.entries(value)) {
		if ([
			"__proto__",
			"prototype",
			"constructor"
		].includes(key)) throw new Error("La copia contiene una clave insegura.");
		checkTree(item, depth + 1, budget);
	}
}
function parseLocalBackup(text) {
	if (new TextEncoder().encode(text).byteLength > 15728640) throw new Error("La copia supera 15 MB. No se ha importado ningún registro.");
	let raw;
	try {
		raw = JSON.parse(text);
	} catch {
		throw new Error("El archivo no es una copia JSON válida.");
	}
	checkTree(raw);
	const result = schema.safeParse(raw);
	if (!result.success) throw new Error("La copia no tiene el formato o la versión compatible de Venezuela Agro.");
	for (const [items, key] of [[result.data.entities, "key"], [result.data.outbox, "id"]]) {
		const seen = /* @__PURE__ */ new Set();
		for (const item of items) {
			const value = String(item[key]);
			if (seen.has(value)) throw new Error("La copia contiene registros duplicados.");
			seen.add(value);
		}
	}
	for (const row of result.data.entities) row.payload = validatedPayload(row.entityType, row.payload);
	for (const row of result.data.outbox) if (row.action === "upsert") row.payload = validatedPayload(row.entityType, row.payload);
	const records = new Map(result.data.entities.map((row) => [row.key, row]));
	for (const operation of latestPendingOperations(result.data.outbox)) if (operation.action === "upsert") {
		const key = `${operation.entityType}:${operation.entityId}`, previous = records.get(key)?.payload;
		if (operation.entityType === "farm-record") {
			const merged = preserveAnimalRecordData({
				farmId: operation.payload.farmId,
				recordType: operation.payload.recordType,
				data: operation.payload.data
			}, previous ? {
				farmId: previous.farmId,
				recordType: previous.recordType,
				data: previous.data
			} : void 0);
			if (merged) operation.payload = validatedPayload(operation.entityType, {
				...operation.payload,
				data: merged
			});
		}
		records.set(key, {
			key,
			id: operation.entityId,
			entityType: operation.entityType,
			payload: operation.payload,
			updatedAt: operation.clientUpdatedAt,
			syncState: "pending"
		});
	}
	validateBackupAnimalLinks([...records.values()], result.data.owner);
	return result.data;
}
/** Missing historical animals are retained; known incompatible links reject the
* entire import. Owner metadata is provenance, not account authentication.
*/
function validateBackupAnimalLinks(rows, sourceOwner) {
	const defaultOwner = sourceOwner && !["device-local", "legacy-unassigned"].includes(sourceOwner) ? sourceOwner : void 0;
	const records = new Map(rows.filter((row) => row.entityType === "farm-record").map((row) => [row.key, row]));
	for (const row of records.values()) {
		const record = row.payload;
		if (!isAnimalHistoryType(record.recordType)) continue;
		const animalId = record.data?.animalId;
		if (typeof animalId !== "string") continue;
		const target = records.get(`farm-record:${animalId}`)?.payload;
		const recordOwner = typeof record.ownerId === "string" ? record.ownerId : defaultOwner;
		const targetOwner = typeof target?.ownerId === "string" ? target.ownerId : defaultOwner;
		if (defaultOwner && typeof record.ownerId === "string" && record.ownerId !== defaultOwner || target && (target.recordType !== "animal" || target.farmId !== record.farmId || recordOwner !== void 0 && targetOwner !== void 0 && targetOwner !== recordOwner)) throw new Error("La copia contiene un vínculo a un animal de otra finca o cuenta. No se importó ningún dato.");
	}
}
//#endregion
export { backup_import_exports as n, parseLocalBackup as r, MAX_BACKUP_BYTES as t };
