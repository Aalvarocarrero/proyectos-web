import {validAnimalPlanPlacement} from "@/lib/farm-tap-placement";
import {deriveAreaSplit} from "@/lib/area-split-payload";
import type {FarmRecordPayload} from "@/lib/farm-types";
import { legacyRecoveryCandidates } from "@/lib/legacy-recovery";
import { databaseNameForOwner, localOwner, verifySyncOwner } from "@/lib/offline-owner";
import { latestPendingOperations } from "@/lib/sync-reconciliation";

export type OfflineEntityType =
  | "public-farm"
  | "social-post"
  | "social-comment"
  | "social-reaction"
  | "farm"
  | "farm-record"
  | "listing"
  | "order"
  | "professional"
  | "project"
  | "feedback"
  | "cart";

export type CachedEntity<T = Record<string, unknown>> = {
  key: string;
  id: string;
  entityType: OfflineEntityType;
  payload: T;
  updatedAt: string;
  syncState: "synced" | "pending";
  serverRevision?: string | null;
};

export type SyncOperation = {
  id: string;
  entityType: Exclude<OfflineEntityType, "cart">;
  entityId: string;
  action: "upsert" | "delete";
  payload: Record<string, unknown>;
  clientUpdatedAt: string;
  baseRevision?: string | null;
  blockedReason?: string;
  conflictServerRevision?: string | null;
};

const DB_NAME = "los-morochos-offline";
const DB_VERSION = 1;
const CACHE_STORE = "entities";
const OUTBOX_STORE = "outbox";
const META_STORE = "meta";
let syncPromise: Promise<SyncResult> | null = null;

export type SyncResult = {
  ok: boolean;
  pending: number;
  lastSync: string | null;
  reason?: string;
  processed?:number;
};

async function openDb(name?: string): Promise<IDBDatabase> {
  const databaseName = name ?? databaseNameForOwner(await localOwner());
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        const store = db.createObjectStore(CACHE_STORE, { keyPath: "key" });
        store.createIndex("entityType", "entityType", { unique: false });
      }
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        db.createObjectStore(OUTBOX_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export function createLocalId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function cacheEntity<T>(
  entityType: OfflineEntityType,
  id: string,
  payload: T,
  syncState: CachedEntity["syncState"] = "synced",
): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(CACHE_STORE, "readwrite");
  tx.objectStore(CACHE_STORE).put({
    key: `${entityType}:${id}`,
    id,
    entityType,
    payload,
    updatedAt: new Date().toISOString(),
    syncState,
  } satisfies CachedEntity<T>);
  await transactionDone(tx);
  db.close();
  notifyChange();
}

export async function getCachedEntities<T>(
  entityType: OfflineEntityType,
): Promise<Array<CachedEntity<T>>> {
  const db = await openDb();
  const tx = db.transaction(CACHE_STORE, "readonly");
  const index = tx.objectStore(CACHE_STORE).index("entityType");
  const values = await requestValue(index.getAll(entityType));
  await transactionDone(tx);
  db.close();
  return values as Array<CachedEntity<T>>;
}

export async function getCachedEntity<T>(
  entityType: OfflineEntityType,
  id: string,
): Promise<CachedEntity<T> | undefined> {
  const db = await openDb();
  const tx = db.transaction(CACHE_STORE, "readonly");
  const value = await requestValue(
    tx.objectStore(CACHE_STORE).get(`${entityType}:${id}`),
  );
  await transactionDone(tx);
  db.close();
  return value as CachedEntity<T> | undefined;
}

export async function queueMutation(
  operation: Omit<SyncOperation, "id" | "clientUpdatedAt"> & {
    id?: string;
    clientUpdatedAt?: string;
    expectedOwner?:string;
    expectedLocalUpdatedAt?:string;
    expectedAreaUpdatedAt?:string;
  },
): Promise<SyncOperation> {
  const {expectedOwner,expectedLocalUpdatedAt,expectedAreaUpdatedAt,...fields}=operation;
  const item: SyncOperation = {
    ...fields,
    id: operation.id ?? createLocalId("sync"),
    clientUpdatedAt: operation.clientUpdatedAt ?? new Date().toISOString(),
  };

  const owner=await localOwner();
  if(expectedOwner&&expectedOwner!==owner)throw new Error("account_changed_reopen_form");
  const db = await openDb(databaseNameForOwner(owner));
  const tx = db.transaction([CACHE_STORE, OUTBOX_STORE], "readwrite");
  const previous=await requestValue(tx.objectStore(CACHE_STORE).get(`${item.entityType}:${item.entityId}`)) as CachedEntity|undefined;
  if(expectedLocalUpdatedAt!==undefined&&previous?.updatedAt!==expectedLocalUpdatedAt){tx.abort();db.close();throw new Error("local_record_changed_reopen_form");}
  if(item.entityType==="farm-record"&&item.action==="upsert"){
    const data=item.payload.data as Record<string,unknown>|undefined,old=previous?.payload.data as Record<string,unknown>|undefined;
    if(data&&typeof data==="object"){
      if(!Object.prototype.hasOwnProperty.call(data,"areaId")&&item.payload.farmId===previous?.payload.farmId&&old&&Object.prototype.hasOwnProperty.call(old,"areaId"))item.payload={...item.payload,data:{...data,areaId:old.areaId}};
      if(!Object.prototype.hasOwnProperty.call(data,"planPlacement")&&item.payload.recordType==="animal"&&item.payload.farmId===previous?.payload.farmId&&old&&Object.prototype.hasOwnProperty.call(old,"planPlacement"))item.payload={...item.payload,data:{...item.payload.data as Record<string,unknown>,planPlacement:(item.payload.data as Record<string,unknown>).areaId===(old.planPlacement as Record<string,unknown>|null)?.areaId?old.planPlacement:null}};
      const areaId=(item.payload.data as Record<string,unknown>).areaId;
      const placement=(item.payload.data as Record<string,unknown>).planPlacement;
      if(placement&&(item.payload.recordType!=="animal"||!validAnimalPlanPlacement(placement)||placement.areaId!==areaId)){tx.abort();db.close();throw new Error("invalid_animal_plan_placement");}
      const moved=!!placement&&JSON.stringify(placement)!==JSON.stringify(old?.planPlacement);
      if(areaId&&item.payload.recordType==="area"){tx.abort();db.close();throw new Error("area_cannot_reference_area");}
      if(typeof areaId==="string"&&(areaId!==old?.areaId||item.payload.farmId!==previous?.payload.farmId||moved||expectedAreaUpdatedAt!==undefined)){
        const area=await requestValue(tx.objectStore(CACHE_STORE).get(`farm-record:${areaId}`)) as CachedEntity|undefined;
        if(expectedAreaUpdatedAt!==undefined&&area?.updatedAt!==expectedAreaUpdatedAt){tx.abort();db.close();throw new Error("local_area_changed_reopen_form");}
        if(item.payload.recordType==="area"||!area||area.payload.recordType!=="area"||area.payload.farmId!==item.payload.farmId){tx.abort();db.close();throw new Error("area_not_available");}
      }
    }
  }
  const queued=await requestValue(tx.objectStore(OUTBOX_STORE).getAll()) as SyncOperation[];
  const same=queued.filter(op=>op.entityType===item.entityType&&op.entityId===item.entityId);
  const latest=latestPendingOperations(same)[0];
  if(item.baseRevision===undefined)item.baseRevision=previous?.serverRevision??latest?.baseRevision??null;
  for(const old of same)tx.objectStore(OUTBOX_STORE).delete(old.id);
  if (item.action === "delete") {
    tx.objectStore(CACHE_STORE).delete(`${item.entityType}:${item.entityId}`);
  } else {
    tx.objectStore(CACHE_STORE).put({
      key: `${item.entityType}:${item.entityId}`,
      id: item.entityId,
      entityType: item.entityType,
      payload: item.payload,
      updatedAt: item.clientUpdatedAt,
      syncState: "pending",
      serverRevision:item.baseRevision,
    } satisfies CachedEntity);
  }
  tx.objectStore(OUTBOX_STORE).put(item);
  await transactionDone(tx);
  db.close();
  notifyChange();
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    void navigator.serviceWorker.ready
      .then((registration) => {
        const backgroundSync = registration as ServiceWorkerRegistration & {
          sync?: { register: (tag: string) => Promise<void> };
        };
        return backgroundSync.sync?.register("morochos-sync");
      })
      .catch(() => undefined);
  }
  return item;
}

/** Both local areas and pending intents commit together. Never assigns them to an account. */
export async function splitDeviceLocalArea(source:CachedEntity<FarmRecordPayload>):Promise<void>{
 const owner=await localOwner();if(owner!=="device-local")throw new Error("account_split_requires_connection");
 const db=await openDb(databaseNameForOwner(owner));
 const tx=db.transaction([CACHE_STORE,OUTBOX_STORE],"readwrite");const done=transactionDone(tx);
 try{
  const cache=tx.objectStore(CACHE_STORE),outbox=tx.objectStore(OUTBOX_STORE);
  const current=await requestValue(cache.get(source.key)) as CachedEntity<FarmRecordPayload>|undefined;
  if(!current||current.updatedAt!==source.updatedAt||JSON.stringify(current.payload)!==JSON.stringify(source.payload))throw new Error("area_changed_refresh");
  const related=await requestValue(cache.getAll()) as CachedEntity<FarmRecordPayload>[];
  if(related.some(row=>row.entityType==="farm-record"&&row.payload.farmId===current.payload.farmId&&row.payload.data?.areaId===source.id))throw new Error("area_has_linked_records");
  const [first,second]=deriveAreaSplit(current.payload);const childId=createLocalId("area"),time=new Date().toISOString();
  const pending=await requestValue(outbox.getAll()) as SyncOperation[];
  for(const op of pending)if(op.entityType==="farm-record"&&op.entityId===source.id)outbox.delete(op.id);
  for(const [id,payload,baseRevision] of [[source.id,first,current.serverRevision??null],[childId,second,null]] as const){
   const value={key:`farm-record:${id}`,id,entityType:"farm-record",payload,updatedAt:time,syncState:"pending",serverRevision:baseRevision};
   if(id===source.id)cache.put(value);else cache.add(value);
   outbox.put({id:createLocalId("sync"),entityType:"farm-record",entityId:id,action:"upsert",payload,clientUpdatedAt:time,baseRevision});
  }
  await done;
 }catch(error){try{tx.abort();}catch{}await done.catch(()=>undefined);throw error;}finally{db.close();}
 notifyChange();
}

/** Prevents a stale rendered card from splitting over an unconfirmed local edit. */
export async function assertAreaReadyForOnlineSplit(source:CachedEntity<FarmRecordPayload>,owner:string,farm:CachedEntity):Promise<void>{
 if(!navigator.onLine)throw new Error("account_split_requires_connection");
 if(await localOwner()!==owner||owner==="device-local")throw new Error("account_changed_reopen_form");
 const db=await openDb(databaseNameForOwner(owner));const tx=db.transaction([CACHE_STORE,OUTBOX_STORE],"readonly");const done=transactionDone(tx);
 const current=await requestValue(tx.objectStore(CACHE_STORE).get(source.key)) as CachedEntity|undefined;
 const parent=await requestValue(tx.objectStore(CACHE_STORE).get(`farm:${source.payload.farmId}`)) as CachedEntity|undefined;
 const related=await requestValue(tx.objectStore(CACHE_STORE).getAll()) as CachedEntity<FarmRecordPayload>[];
 const pending=await requestValue(tx.objectStore(OUTBOX_STORE).getAll()) as SyncOperation[];await done;db.close();
 if(related.some(row=>row.entityType==="farm-record"&&row.payload.farmId===source.payload.farmId&&row.payload.data?.areaId===source.id))throw new Error("area_has_linked_records");
 if(!parent||parent.id!==farm.id||parent.syncState!=="synced"||parent.updatedAt!==farm.updatedAt||parent.serverRevision!==farm.serverRevision||pending.some(op=>op.entityType==="farm"&&op.entityId===farm.id))throw new Error("area_pending_sync");
 if(!current||current.syncState!=="synced"||current.updatedAt!==source.updatedAt||current.serverRevision!==source.serverRevision||pending.some(op=>op.entityType==="farm-record"&&op.entityId===source.id))throw new Error("area_pending_sync");
}

export async function getPendingCount(owner?: string): Promise<number> {
  const db = await openDb(owner ? databaseNameForOwner(owner) : undefined);
  const tx = db.transaction(OUTBOX_STORE, "readonly");
  const count = await requestValue(tx.objectStore(OUTBOX_STORE).count());
  await transactionDone(tx);
  db.close();
  return count;
}

export async function getLastSync(owner?: string): Promise<string | null> {
  const db = await openDb(owner ? databaseNameForOwner(owner) : undefined);
  const tx = db.transaction(META_STORE, "readonly");
  const value = (await requestValue(
    tx.objectStore(META_STORE).get("lastSync"),
  )) as { key: string; value: string } | undefined;
  await transactionDone(tx);
  db.close();
  return value?.value ?? null;
}

type ServerEntity={entityType:OfflineEntityType;id:string;revision:string|null;deleted?:boolean;payload:Record<string,unknown>|null};
export async function hydrateFromServer():Promise<void>{
 if(!navigator.onLine)return;const owner=await localOwner();
 const beforeDb=await openDb(databaseNameForOwner(owner));const beforeTx=beforeDb.transaction([CACHE_STORE,META_STORE],"readonly");const beforeDone=transactionDone(beforeTx);const [beforeRows,beforeMeta]=await Promise.all([requestValue(beforeTx.objectStore(CACHE_STORE).getAll()) as Promise<CachedEntity[]>,requestValue(beforeTx.objectStore(META_STORE).getAll())]);await beforeDone;beforeDb.close();
 const stamp=(row:CachedEntity|undefined)=>row?(row.syncState==="synced"&&typeof row.serverRevision==="string"?JSON.stringify([row.serverRevision,row.syncState]):JSON.stringify([row.serverRevision,row.updatedAt,row.syncState,row.payload])):"missing";const before=new Map(beforeRows.map(row=>[row.key,stamp(row)]));
 const serverStamp=(value:ServerEntity|undefined)=>value?JSON.stringify([value.revision,!!value.deleted]):"missing";const beforeServer=new Map(beforeMeta.filter(row=>row.key.startsWith("server:")).map(row=>[row.key,serverStamp(row.value)]));
 for(const row of beforeRows)if(row.syncState==="synced"&&typeof row.serverRevision==="string"&&!beforeServer.has(`server:${row.key}`))beforeServer.set(`server:${row.key}`,JSON.stringify([row.serverRevision,false]));
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
 let data:{user?:{id:string};farms?:Array<Record<string,unknown>&{id:string;revision:string;deleted?:boolean}>;records?:Array<Record<string,unknown>&{id:string;revision:string;deleted?:boolean}>;listings?:Array<Record<string,unknown>&{id:string;revision:string;deleted?:boolean}>;entities?:ServerEntity[]};
 try{const response=await fetch("/api/bootstrap",{headers:{accept:"application/json"},cache:"no-store",signal:controller.signal});if(!response.ok)return;data=await response.json();}catch{return;}finally{clearTimeout(timer);}
 if(data.user?.id!==owner)return;
 const rows:ServerEntity[]=[...(data.farms??[]).map(row=>({entityType:"farm" as const,id:row.id,revision:row.revision,deleted:row.deleted,payload:row})),...(data.records??[]).map(row=>({entityType:"farm-record" as const,id:row.id,revision:row.revision,deleted:row.deleted,payload:row})),...(data.listings??[]).map(row=>({entityType:"listing" as const,id:row.id,revision:row.revision,deleted:row.deleted,payload:row})),...(data.entities??[])];
 const db=await openDb(databaseNameForOwner(owner));const tx=db.transaction([CACHE_STORE,OUTBOX_STORE,META_STORE],"readwrite");const done=transactionDone(tx);
 const pending=await requestValue(tx.objectStore(OUTBOX_STORE).getAll()) as SyncOperation[];const protectedKeys=new Set(pending.map(op=>`${op.entityType}:${op.entityId}`));
 const currentRows=await requestValue(tx.objectStore(CACHE_STORE).getAll()) as CachedEntity[];const current=new Map(currentRows.map(row=>[row.key,stamp(row)]));
 const currentMeta=await requestValue(tx.objectStore(META_STORE).getAll());const currentServer=new Map(currentMeta.filter(row=>row.key.startsWith("server:")).map(row=>[row.key,serverStamp(row.value)]));
 for(const row of currentRows)if(row.syncState==="synced"&&typeof row.serverRevision==="string"&&!currentServer.has(`server:${row.key}`))currentServer.set(`server:${row.key}`,JSON.stringify([row.serverRevision,false]));
 for(const row of rows){const key=`${row.entityType}:${row.id}`;if((current.get(key)??"missing")!==(before.get(key)??"missing")||(currentServer.get(`server:${key}`)??"missing")!==(beforeServer.get(`server:${key}`)??"missing"))continue;tx.objectStore(META_STORE).put({key:`server:${key}`,value:row});if(protectedKeys.has(key))continue;if(row.deleted)tx.objectStore(CACHE_STORE).delete(key);else tx.objectStore(CACHE_STORE).put({key,id:row.id,entityType:row.entityType,payload:row.payload,updatedAt:new Date().toISOString(),serverRevision:row.revision,syncState:"synced"});}
 await done;db.close();notifyChange();
}

async function runSync(): Promise<SyncResult> {
  const owner = await localOwner();
  if (!navigator.onLine) {
    return { ok: false, pending: await getPendingCount(owner), lastSync: await getLastSync(owner), reason: "offline" };
  }

  if (!await verifySyncOwner(owner).catch(() => false)) return { ok:false, pending:await getPendingCount(owner), lastSync:await getLastSync(owner), reason:"account_changed" };
  const db = await openDb(databaseNameForOwner(owner));
  const readTx = db.transaction(OUTBOX_STORE, "readwrite");
  const allOperations = ((await requestValue(
    readTx.objectStore(OUTBOX_STORE).getAll(),
  )) as SyncOperation[])
    .filter(operation => !operation.blockedReason && (owner !== "device-local" || ["order", "feedback"].includes(operation.entityType)))
    .sort((left, right) => {
      const priority = { farm: 0, "farm-record": 1, listing: 2, professional: 3, project: 4, feedback: 5, order: 6, "public-farm":7,"social-post":8,"social-comment":9,"social-reaction":10 } as const;
      return priority[left.entityType] - priority[right.entityType]
        || left.clientUpdatedAt.localeCompare(right.clientUpdatedAt);
    })
    ;
  const latest=latestPendingOperations(allOperations);const latestIds=new Set(latest.map(op=>op.id));
  for(const old of allOperations)if(!latestIds.has(old.id))readTx.objectStore(OUTBOX_STORE).delete(old.id);
  const operations:SyncOperation[]=[];let bytes=0;
  for(const op of allOperations.filter(op=>latestIds.has(op.id))){const size=new TextEncoder().encode(JSON.stringify(op)).length;if(operations.length>=100 || (operations.length>0&&bytes+size>4*1024*1024))break;operations.push(op);bytes+=size;}
  await transactionDone(readTx);

  if (operations.length === 0) {
    db.close();
    const pending = await getPendingCount(owner);
    return { ok: pending === 0, pending, lastSync: await getLastSync(owner), ...(pending ? {reason:"needs_attention"} : {}) };
  }

  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    response = await fetch("/api/sync", {
      method: "POST",
      headers: { "content-type": "application/json", "x-local-owner": owner },
      body: JSON.stringify({ operations }),
      signal: controller.signal,
    });
  } catch {
    db.close();
    return { ok: false, pending: operations.length, lastSync: await getLastSync(owner), reason: "network" };
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    db.close();
    return { ok: false, pending: operations.length, lastSync: await getLastSync(owner), reason: "server" };
  }

  let result:{accepted:string[];rejected?:Array<{id:string;reason:string;serverRevision?:string|null}>;syncedAt:string;revisions?:Record<string,string|null>};
  try{result=await response.json();if(!Array.isArray(result.accepted)||typeof result.syncedAt!=="string")throw new Error();}catch{db.close();return {ok:false,pending:await getPendingCount(owner),lastSync:await getLastSync(owner),reason:"invalid_response"};}
  const writeTx = db.transaction([OUTBOX_STORE, CACHE_STORE, META_STORE], "readwrite");
  const outbox = writeTx.objectStore(OUTBOX_STORE);
  const cache = writeTx.objectStore(CACHE_STORE);
  for (const operation of operations) {
    if (!result.accepted.includes(operation.id)) continue;
    const stillPending=await requestValue(outbox.get(operation.id));
    outbox.delete(operation.id);
    writeTx.objectStore(META_STORE).put({key:`ack:${operation.id}`,value:{confirmedAt:result.syncedAt,serverRevision:result.revisions?.[operation.id]}});
    if(!stillPending)continue;
    writeTx.objectStore(META_STORE).put({key:`server:${operation.entityType}:${operation.entityId}`,value:{entityType:operation.entityType,id:operation.entityId,revision:result.revisions?.[operation.id]??null,deleted:operation.action==="delete",payload:operation.action==="delete"?null:operation.payload}});
    if (operation.action === "delete") {
      cache.delete(`${operation.entityType}:${operation.entityId}`);
    } else {
      cache.put({
        key: `${operation.entityType}:${operation.entityId}`,
        id: operation.entityId,
        entityType: operation.entityType,
        payload: operation.payload,
        updatedAt: result.syncedAt,
        syncState: "synced",
        serverRevision:result.revisions?.[operation.id]??null,
      } satisfies CachedEntity);
    }
  }
  for(const rejected of result.rejected??[]){
    const op=await requestValue(outbox.get(rejected.id)) as SyncOperation|undefined;
    if(op){outbox.put({...op,blockedReason:rejected.reason,conflictServerRevision:rejected.serverRevision});if(rejected.reason==="version_conflict"&&rejected.serverRevision===null)writeTx.objectStore(META_STORE).put({key:`server:${op.entityType}:${op.entityId}`,value:{entityType:op.entityType,id:op.entityId,revision:null,deleted:true,payload:null}});}
  }
  // Rebase only successors of this device's acknowledged write, never arbitrary remote changes.
  const successors=await requestValue(outbox.getAll()) as SyncOperation[];
  for(const successor of successors){const sent=operations.find(op=>op.entityType===successor.entityType&&op.entityId===successor.entityId&&result.accepted.includes(op.id));if(sent && (successor.baseRevision??null)===(sent.baseRevision??null) && result.revisions?.[sent.id]!==undefined)outbox.put({...successor,baseRevision:result.revisions[sent.id]});}
  // A local edit made during the request must remain visible and pending.
  const remaining = await requestValue(outbox.getAll()) as SyncOperation[];
  for (const operation of latestPendingOperations(remaining)) {
    const key = `${operation.entityType}:${operation.entityId}`;
    if (operation.action === "delete") cache.delete(key);
    else cache.put({ key, id: operation.entityId, entityType: operation.entityType, payload: operation.payload, updatedAt: operation.clientUpdatedAt, syncState: "pending",serverRevision:operation.baseRevision });
  }
  const priorSync=await requestValue(writeTx.objectStore(META_STORE).get("lastSync"));
  writeTx.objectStore(META_STORE).put({ key: "lastSync", value:priorSync?.value>result.syncedAt?priorSync.value:result.syncedAt });
  await transactionDone(writeTx);
  db.close();
  notifyChange();
  const pending = await getPendingCount(owner);
  return { ok: pending === 0, pending, processed:result.accepted.length+(result.rejected?.length??0), lastSync: result.syncedAt, ...(pending ? { reason: result.rejected?.[0]?.reason ?? "more_pending" } : {}) };
}

export function syncNow():Promise<SyncResult>{
 if(!syncPromise)syncPromise=(async()=>{let result=await runSync();while(result.pending>0 && (result.processed??0)>0){const next=await runSync();if(next.pending>=result.pending&&next.reason==="more_pending")return next;result=next;}return result;})().finally(()=>{syncPromise=null;});
 return syncPromise;
}

export type SyncIssue={operation:SyncOperation;server:ServerEntity|null};
export async function getSyncIssues():Promise<SyncIssue[]>{const db=await openDb();const tx=db.transaction([OUTBOX_STORE,META_STORE],"readonly");const done=transactionDone(tx);const ops=await requestValue(tx.objectStore(OUTBOX_STORE).getAll()) as SyncOperation[];const issues:SyncIssue[]=[];for(const operation of ops.filter(op=>op.blockedReason)){const entry=await requestValue(tx.objectStore(META_STORE).get(`server:${operation.entityType}:${operation.entityId}`));issues.push({operation,server:entry?.value??null});}await done;db.close();return issues;}
export async function resolveSyncIssue(id:string,choice:"server"|"local",expectedRevision:string|null){
 const db=await openDb();const tx=db.transaction([OUTBOX_STORE,CACHE_STORE,META_STORE],"readwrite");const done=transactionDone(tx);
 try{const op=await requestValue(tx.objectStore(OUTBOX_STORE).get(id)) as SyncOperation|undefined;if(!op?.blockedReason)throw new Error("El registro cambió. Actualiza la lista antes de decidir.");
 const entry=await requestValue(tx.objectStore(META_STORE).get(`server:${op.entityType}:${op.entityId}`));const server=entry?.value as ServerEntity|undefined;
 if(op.blockedReason==="version_conflict"&&(!server||server.revision!==expectedRevision))throw new Error("Actualiza la copia del servidor antes de resolver este conflicto.");
 tx.objectStore(META_STORE).put({key:`resolved:${op.id}`,value:{operation:op,server,choice,resolvedAt:new Date().toISOString()}});
 const key=`${op.entityType}:${op.entityId}`;tx.objectStore(OUTBOX_STORE).delete(op.id);
 if(choice==="server") {if(!server||server.deleted)tx.objectStore(CACHE_STORE).delete(key);else tx.objectStore(CACHE_STORE).put({key,id:op.entityId,entityType:op.entityType,payload:server.payload,updatedAt:new Date().toISOString(),serverRevision:server.revision,syncState:"synced"});}
 else {tx.objectStore(OUTBOX_STORE).put({...op,id:createLocalId("retry"),baseRevision:server?.revision??op.baseRevision,blockedReason:undefined,conflictServerRevision:undefined});}
 await done;notifyChange();
 }catch(error){try{tx.abort();}catch{}await done.catch(()=>undefined);throw error;}finally{db.close();}
}

export function subscribeOfflineChanges(callback: () => void): () => void {
  window.addEventListener("morochos-offline-change", callback);
  return () => window.removeEventListener("morochos-offline-change", callback);
}

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("morochos-offline-change"));
  }
}

/** A consistent, versioned recovery copy. It does not remove or send pending changes. */
export async function exportLocalBackup(legacy = false) {
  const owner = legacy ? "legacy-unassigned" : await localOwner();
  const db = await openDb(legacy ? DB_NAME : databaseNameForOwner(owner));
  const tx = db.transaction([CACHE_STORE, OUTBOX_STORE, META_STORE], "readonly");
  const done = transactionDone(tx);
  const [entities, outbox, meta] = await Promise.all([
    requestValue(tx.objectStore(CACHE_STORE).getAll()),
    requestValue(tx.objectStore(OUTBOX_STORE).getAll()),
    requestValue(tx.objectStore(META_STORE).getAll()),
  ]);
  await done;
  db.close();
  return { format: "venezuela-agro-local-backup", version: 1, exportedAt: new Date().toISOString(), origin: location.origin, owner, entities, outbox, meta };
}

// Legacy records are kept intact and never silently adopted or transmitted by a new account.
export async function getLegacyRecordCount() {
 const db = await openDb(DB_NAME);
 const tx=db.transaction([CACHE_STORE,OUTBOX_STORE],"readonly");
 const done=transactionDone(tx);
 const [records,pending]=await Promise.all([requestValue(tx.objectStore(CACHE_STORE).count()),requestValue(tx.objectStore(OUTBOX_STORE).count())]);
 await done;db.close();return records+pending;
}

/** Explicit local-only recovery; never moves legacy records into an authenticated account. */
export async function recoverLegacyOnDevice() {
 if (await localOwner() !== "device-local") throw new Error("Abre la copia local del dispositivo para recuperar estos registros.");
 const backup = await exportLocalBackup(true);
 const db = await openDb(databaseNameForOwner("device-local"));
 const tx=db.transaction([CACHE_STORE,OUTBOX_STORE],"readwrite");
 const done=transactionDone(tx);
 const [existing, pending] = await Promise.all([requestValue(tx.objectStore(CACHE_STORE).getAllKeys()), requestValue(tx.objectStore(OUTBOX_STORE).getAll())]);
 const candidates = legacyRecoveryCandidates(backup.entities as CachedEntity[], existing.map(String), pending as SyncOperation[]);
 let recovered=0;
 for(const entity of candidates) {
  tx.objectStore(CACHE_STORE).put({...entity,syncState:"pending"});
  if(!["cart","order","feedback"].includes(entity.entityType)) {
   tx.objectStore(OUTBOX_STORE).put({id:createLocalId("recovery"),entityType:entity.entityType,entityId:entity.id,action:"upsert",payload:entity.payload,clientUpdatedAt:entity.updatedAt});
  }
  recovered++;
 }
 await done;db.close();notifyChange();return recovered;
}

/** Reviewed backups are imported only into the device workspace, never an account or server. */
export async function importBackupToDevice(text: string) {
 const { parseLocalBackup } = await import("@/lib/backup-import");
 const backup = parseLocalBackup(text);
 const db = await openDb(databaseNameForOwner("device-local"));
 const tx = db.transaction([CACHE_STORE, OUTBOX_STORE, META_STORE], "readwrite");
 const done = transactionDone(tx);
 try {
 const [keys,pending] = await Promise.all([requestValue(tx.objectStore(CACHE_STORE).getAllKeys()),requestValue(tx.objectStore(OUTBOX_STORE).getAll())]);
 const protectedKeys = new Set([...keys.map(String), ...(pending as SyncOperation[]).map(op=>`${op.entityType}:${op.entityId}`)]);
 const incoming = new Map((backup.entities as CachedEntity[]).map(entity=>[entity.key,entity]));
 const latest = latestPendingOperations(backup.outbox as SyncOperation[]);
 for(const operation of latest){
  const key=`${operation.entityType}:${operation.entityId}`;
  if(operation.action==="delete")incoming.delete(key);
  else incoming.set(key,{key,id:operation.entityId,entityType:operation.entityType,payload:operation.payload,updatedAt:operation.clientUpdatedAt,syncState:"pending"});
 }
 let imported=0, skipped=0, deletions=0;
 for(const entity of incoming.values()){
  if(protectedKeys.has(entity.key)){skipped++;continue;}
  tx.objectStore(CACHE_STORE).put({...entity,syncState:"pending"});
  if(!["cart","order","feedback"].includes(entity.entityType))tx.objectStore(OUTBOX_STORE).put({id:createLocalId("import"),entityType:entity.entityType,entityId:entity.id,action:"upsert",payload:entity.payload,clientUpdatedAt:entity.updatedAt});
  imported++;
 }
 for(const operation of latest){
  const key=`${operation.entityType}:${operation.entityId}`;
  if(operation.action!=="delete" || ["order","feedback"].includes(operation.entityType))continue;
  if(protectedKeys.has(key)){skipped++;continue;}
  tx.objectStore(OUTBOX_STORE).put({...operation,id:createLocalId("import-delete")});deletions++;
 }
 tx.objectStore(META_STORE).put({key:"lastLocalImport",value:{at:new Date().toISOString(),sourceOrigin:backup.origin,sourceExportedAt:backup.exportedAt,imported,skipped,deletions}});
 await done;notifyChange();
 return {imported,skipped,deletions};
 } catch(error) {
  try {tx.abort();} catch {}
  await done.catch(()=>undefined);
  throw error;
 } finally {db.close();}
}

export async function getOperationStatus(id:string):Promise<{state:"confirmed"|"pending"|"blocked"|"unknown";confirmedAt?:string;reason?:string;serverRevision?:string|null}>{
 const db=await openDb();const tx=db.transaction([OUTBOX_STORE,META_STORE],"readonly");const done=transactionDone(tx);
 const [ack,operation]=await Promise.all([requestValue(tx.objectStore(META_STORE).get(`ack:${id}`)),requestValue(tx.objectStore(OUTBOX_STORE).get(id))]);await done;db.close();
 if(ack)return {state:"confirmed",confirmedAt:ack.value.confirmedAt,...(ack.value.serverRevision!==undefined?{serverRevision:ack.value.serverRevision}:{})};if(operation)return {state:operation.blockedReason?"blocked":"pending",reason:operation.blockedReason};return {state:"unknown"};
}
