import { z } from "zod";
import { deriveAreaSplit } from "@/lib/area-split-payload";
import type { FarmRecordPayload } from "@/lib/farm-types";
import { sha256 } from "@/lib/security";
import { farmRecordPayloadSchema } from "@/lib/sync-validation";

const identifier = z.string().min(3).max(160).regex(/^[a-zA-Z0-9_-]+$/);
export const areaSplitRequestSchema = z.object({
  sourceId: identifier,
  baseRevision: z.string().max(160).regex(/^[a-zA-Z0-9_-]*$/),
  baseFarmRevision: z.string().max(160).regex(/^[a-zA-Z0-9_-]*$/),
  operationId: identifier,
  newAreaId: identifier,
}).strict().refine((value) => value.sourceId !== value.newAreaId, {
  message: "The new area must have a different ID.", path: ["newAreaId"],
});

export type AreaSplitRequest = z.infer<typeof areaSplitRequestSchema>;
type SplitDatabase = Pick<D1Database, "prepare" | "batch">;
type StoredArea = {
  id: string; owner_id: string; farm_id: string; record_type: string;
  category: string | null; title: string; data_json: string;
  revision: string; last_operation_id: string | null; last_operation_hash: string | null;
  deleted: number; server_updated_at: string; parent_active?: number; parent_revision?: string;
};
type SplitReceipt = {
  owner_key: string; entity_type: string; entity_id: string; operation_hash: string | null;
  receipt_status: string; server_revision: string | null;
};
export type SplitAreaRecord = {
  id: string; payload: FarmRecordPayload; revision: string; updatedAt: string;
};
export type AreaSplitResult = {
  ok: true; records: [SplitAreaRecord, SplitAreaRecord]; replayed: boolean;
};

export class AreaSplitError extends Error {
  constructor(message: string, public status: number, public serverRevision?: string | null) {
    super(message);
  }
}

function payloadFor(row: StoredArea): FarmRecordPayload {
  try {
    return farmRecordPayloadSchema.parse({
      farmId: row.farm_id, recordType: row.record_type, category: row.category ?? "",
      title: row.title, data: JSON.parse(row.data_json),
    });
  } catch {
    throw new AreaSplitError("invalid_area_payload", 400);
  }
}

function returnedRecord(row: StoredArea): SplitAreaRecord {
  return { id: row.id, payload: payloadFor(row), revision: row.revision, updatedAt: row.server_updated_at };
}

async function readSource(db: SplitDatabase, sourceId: string): Promise<StoredArea | null> {
  return db.prepare(`SELECT r.*, EXISTS (
    SELECT 1 FROM farms f WHERE f.id = r.farm_id AND f.owner_id = r.owner_id AND f.deleted = 0
  ) AS parent_active, (SELECT f.revision FROM farms f WHERE f.id = r.farm_id) AS parent_revision
    FROM farm_records r WHERE r.id = ?`).bind(sourceId).first<StoredArea>();
}

async function replayResult(
  db: SplitDatabase, ownerId: string, request: AreaSplitRequest, hash: string,
): Promise<AreaSplitResult | null> {
  const receipt = await db.prepare("SELECT * FROM sync_receipts WHERE id = ?")
    .bind(request.operationId).first<SplitReceipt>();
  if (!receipt) return null;
  if (receipt.owner_key !== ownerId || receipt.entity_type !== "farm-area-split" ||
      receipt.entity_id !== request.sourceId || receipt.operation_hash !== hash) {
    throw new AreaSplitError("operation_id_reused", 409);
  }
  const { results } = await db.prepare(`SELECT r.* FROM farm_records r
    JOIN farms f ON f.id = r.farm_id AND f.owner_id = r.owner_id AND f.deleted = 0
    WHERE r.id IN (?, ?) AND r.owner_id = ? AND r.deleted = 0 AND r.record_type = 'area'`)
    .bind(request.sourceId, request.newAreaId, ownerId).all<StoredArea>();
  const source = results.find((row) => row.id === request.sourceId);
  const child = results.find((row) => row.id === request.newAreaId);
  if (receipt.receipt_status !== "accepted" || !source || !child ||
      source.farm_id !== child.farm_id || source.revision !== receipt.server_revision ||
      [source, child].some((row) => row.last_operation_id !== request.operationId || row.last_operation_hash !== hash)) {
    // A later edit/delete never causes a replay to split again or resurrect a half.
    throw new AreaSplitError("version_conflict", 409, source?.revision ?? null);
  }
  return { ok: true, records: [returnedRecord(source), returnedRecord(child)], replayed: true };
}

/**
 * One D1 batch is the transaction boundary: a child/receipt constraint failure
 * rolls back the source update as well. Never replace INSERT with conflict-ignore.
 * https://developers.cloudflare.com/d1/worker-api/d1-database/#batch
 */
export async function atomicAreaSplit(
  db: SplitDatabase, ownerId: string, input: AreaSplitRequest,
): Promise<AreaSplitResult> {
  if (!ownerId || ownerId === "device-local") throw new AreaSplitError("authentication_required", 401);
  const parsed = areaSplitRequestSchema.safeParse(input);
  if (!parsed.success) throw new AreaSplitError("invalid_area_split", 400);
  const request = parsed.data;
  const hash = await sha256(JSON.stringify([
    "farm-area-split", ownerId, request.sourceId, request.baseRevision, request.baseFarmRevision, request.newAreaId,
  ]));
  const replay = await replayResult(db, ownerId, request, hash);
  if (replay) return replay;
  const source = await readSource(db, request.sourceId);
  if (source && source.owner_id !== ownerId) throw new AreaSplitError("forbidden", 403);
  if (!source || source.deleted || !source.parent_active || source.revision !== request.baseRevision || source.parent_revision !== request.baseFarmRevision) {
    throw new AreaSplitError("version_conflict", 409, source?.revision ?? null);
  }
  if (source.last_operation_id === request.operationId) throw new AreaSplitError("operation_id_reused", 409);
  const linked=await db.prepare("SELECT id FROM farm_records WHERE owner_id=? AND farm_id=? AND deleted=0 AND CASE WHEN json_valid(data_json) THEN json_extract(data_json, '$.areaId') ELSE NULL END = ? LIMIT 1").bind(ownerId,source.farm_id,source.id).first();
  if(linked)throw new AreaSplitError("area_has_linked_records",409);
  let halves: [FarmRecordPayload, FarmRecordPayload];
  try { halves = deriveAreaSplit(payloadFor(source)); }
  catch { throw new AreaSplitError("invalid_area_payload", 400); }
  const [first, second] = halves;
  const sourceRevision = crypto.randomUUID(), childRevision = crypto.randomUUID();
  const now = new Date().toISOString();

  const statements = [
    db.prepare(`UPDATE farm_records SET title = ?, data_json = ?, client_updated_at = ?,
      server_updated_at = ?, revision = ?, last_operation_id = ?, last_operation_hash = ?
      WHERE id = ? AND owner_id = ? AND revision = ? AND farm_id = ? AND deleted = 0 AND record_type = 'area'
      AND EXISTS (SELECT 1 FROM farms f WHERE f.id = farm_records.farm_id AND f.owner_id = ? AND f.deleted = 0 AND f.revision = ?)
      AND NOT EXISTS (SELECT 1 FROM farm_records linked WHERE linked.owner_id=farm_records.owner_id AND linked.farm_id=farm_records.farm_id AND linked.deleted=0 AND CASE WHEN json_valid(linked.data_json) THEN json_extract(linked.data_json, '$.areaId') ELSE NULL END = farm_records.id)
      AND NOT EXISTS (SELECT 1 FROM sync_receipts WHERE id = ?)`)
      .bind(first.title, JSON.stringify(first.data), now, now, sourceRevision, request.operationId, hash,
        request.sourceId, ownerId, request.baseRevision, source.farm_id, ownerId, request.baseFarmRevision, request.operationId),
    // The fresh per-attempt revision means a zero-row CAS can never insert a child.
    db.prepare(`INSERT INTO farm_records
      (id, owner_id, farm_id, record_type, category, title, data_json, client_updated_at,
       server_updated_at, deleted, revision, last_operation_id, last_operation_hash)
      SELECT ?, r.owner_id, r.farm_id, 'area', r.category, ?, ?, ?, ?, 0, ?, ?, ?
      FROM farm_records r WHERE r.id = ? AND r.owner_id = ? AND r.revision = ?
      AND r.last_operation_id = ? AND r.last_operation_hash = ? AND r.deleted = 0 AND r.record_type = 'area'
      AND EXISTS (SELECT 1 FROM farms f WHERE f.id = r.farm_id AND f.owner_id = ? AND f.deleted = 0 AND f.revision = ?)`)
      .bind(request.newAreaId, second.title, JSON.stringify(second.data), now, now, childRevision,
        request.operationId, hash, request.sourceId, ownerId, sourceRevision, request.operationId, hash, ownerId, request.baseFarmRevision),
    db.prepare(`INSERT INTO sync_receipts
      (id, owner_key, entity_type, entity_id, operation_hash, receipt_status, server_revision, created_at)
      SELECT ?, ?, 'farm-area-split', ?, ?, 'accepted', ?, ?
      FROM farm_records r JOIN farm_records child ON child.id = ? AND child.owner_id = r.owner_id
      AND child.farm_id = r.farm_id AND child.revision = ? AND child.last_operation_id = ? AND child.last_operation_hash = ?
      WHERE r.id = ? AND r.owner_id = ? AND r.revision = ? AND r.last_operation_id = ? AND r.last_operation_hash = ?`)
      .bind(request.operationId, ownerId, request.sourceId, hash, sourceRevision, now,
        request.newAreaId, childRevision, request.operationId, hash,
        request.sourceId, ownerId, sourceRevision, request.operationId, hash),
  ];

  let results: D1Result[];
  try { results = await db.batch(statements); }
  catch (error) {
    // An overlapping retry may have committed first. Read its receipt before classifying failure.
    const committed = await replayResult(db, ownerId, request, hash);
    if (committed) return committed;
    if (error instanceof Error && /UNIQUE constraint failed: farm_records\.id/i.test(error.message)) {
      throw new AreaSplitError("new_area_id_conflict", 409, source.revision);
    }
    throw error;
  }
  if (results.length !== statements.length || results.some((result) => !result.success)) {
    throw new Error("area_split_failed");
  }
  if (results.some((result) => result.meta.changes !== 1)) {
    const committed = await replayResult(db, ownerId, request, hash);
    if (committed) return committed;
    const latest = await readSource(db, request.sourceId);
    if (latest && latest.owner_id !== ownerId) throw new AreaSplitError("forbidden", 403);
    throw new AreaSplitError("version_conflict", 409, latest?.revision ?? null);
  }
  return {
    ok: true, replayed: false,
    records: [
      { id: request.sourceId, payload: first, revision: sourceRevision, updatedAt: now },
      { id: request.newAreaId, payload: second, revision: childRevision, updatedAt: now },
    ],
  };
}
