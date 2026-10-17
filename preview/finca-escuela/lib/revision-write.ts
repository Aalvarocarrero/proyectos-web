import { and, eq } from "drizzle-orm";
import type { AnySQLiteColumn, AnySQLiteTable } from "drizzle-orm/sqlite-core";
import { getDb } from "@/db";
import { sha256 } from "@/lib/security";
export type VersionedOperation={id:string;entityType:string;entityId:string;action:"upsert"|"delete";payload:Record<string,unknown>;clientUpdatedAt:string;baseRevision?:string|null};
export type RevisionTable=AnySQLiteTable & {id:AnySQLiteColumn;ownerId:AnySQLiteColumn;revision:AnySQLiteColumn;lastOperationId:AnySQLiteColumn;lastOperationHash:AnySQLiteColumn};
export class RevisionConflict extends Error { constructor(public serverRevision:string|null){super("version_conflict");} }
export async function operationHash(op:VersionedOperation){return sha256(JSON.stringify([op.entityType,op.entityId,op.action,op.payload,op.clientUpdatedAt,op.baseRevision??null]));}
/** Atomic owner/revision predicate prevents a read-then-write race. No caller may set owner on update. */
export async function revisionWrite(table:RevisionTable,op:VersionedOperation,ownerId:string,insert:Record<string,unknown>,update:Record<string,unknown>):Promise<string>{
 const db=await getDb();
 const [row]=await db.select({ownerId:table.ownerId,revision:table.revision,lastOperationId:table.lastOperationId,lastOperationHash:table.lastOperationHash}).from(table).where(eq(table.id,op.entityId)).limit(1);
 if(row && row.ownerId!==ownerId)throw new Error("forbidden");
 const hash=await operationHash(op);
 if(row?.lastOperationId===op.id){if(row.lastOperationHash!==hash)throw new Error("operation_id_reused");return String(row.revision);}
 if(row && op.baseRevision!==row.revision)throw new RevisionConflict(String(row.revision));
 if(!row && (op.baseRevision!=null || op.action==="delete"))throw new RevisionConflict(null);
 const revision=crypto.randomUUID();
 const metadata={revision,lastOperationId:op.id,lastOperationHash:hash};
 const changed=row
  ?await db.update(table).set({...update,...metadata}).where(and(eq(table.id,op.entityId),eq(table.ownerId,ownerId),eq(table.revision,String(row.revision)))).returning({revision:table.revision})
  :await db.insert(table).values({...insert,id:op.entityId,ownerId,...metadata}).onConflictDoNothing().returning({revision:table.revision});
 if(!changed.length){
  const [latest]=await db.select({ownerId:table.ownerId,revision:table.revision,lastOperationId:table.lastOperationId,lastOperationHash:table.lastOperationHash}).from(table).where(eq(table.id,op.entityId)).limit(1);
  if(latest?.ownerId!==ownerId)throw new Error("forbidden");
  if(latest?.lastOperationId===op.id && latest.lastOperationHash===hash)return String(latest.revision);
  throw new RevisionConflict(latest?String(latest.revision):null);
 }
 return revision;
}
