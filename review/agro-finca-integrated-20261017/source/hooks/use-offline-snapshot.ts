"use client";
import { useSyncExternalStore } from "react";

function subscribeConnection(callback: () => void) {
 window.addEventListener("online", callback);
 window.addEventListener("offline", callback);
 return () => {
  window.removeEventListener("online", callback);
  window.removeEventListener("offline", callback);
 };
}

/** Public feeds are online-only. Only built-in, explicitly labelled demos remain offline. */
export function publicFeedRows<T extends { demo?: boolean }>(rows: T[], online: boolean): T[] {
 return online ? rows : rows.filter(row => row.demo === true);
}

/** No localStorage or IndexedDB feed snapshot is read, written, or deleted. */
export function usePublicConnection() {
 return useSyncExternalStore(subscribeConnection, () => navigator.onLine, () => true);
}
