import type { CachedEntity, SyncOperation } from "@/lib/offline-db";
/** Pure selection: neither the legacy export nor current records are changed. */
export function legacyRecoveryCandidates(legacy: CachedEntity[], currentKeys: string[], pending: SyncOperation[]) {
  const protectedKeys = new Set([...currentKeys, ...pending.map(operation => `${operation.entityType}:${operation.entityId}`)]);
  return legacy.filter(entity => !protectedKeys.has(entity.key));
}
