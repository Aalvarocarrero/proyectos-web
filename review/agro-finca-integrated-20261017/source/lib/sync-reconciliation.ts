import type { SyncOperation } from "@/lib/offline-db";

/** Preserve the last local intent, including deletes, while a batch is in flight. */
export function latestPendingOperations(operations: SyncOperation[]): SyncOperation[] {
  const latest = new Map<string, SyncOperation>();
  for (const operation of [...operations].sort((a, b) => a.clientUpdatedAt.localeCompare(b.clientUpdatedAt))) {
    latest.set(`${operation.entityType}:${operation.entityId}`, operation);
  }
  return [...latest.values()];
}
