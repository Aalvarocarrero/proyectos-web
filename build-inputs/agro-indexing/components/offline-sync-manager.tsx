"use client";

import { useEffect } from "react";
import { syncNow } from "@/lib/offline-db";
import { requiresFormalSession } from "@/lib/formal-submission";

export function OfflineSyncManager() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const synchronize = () => {
      // A Google return restores a formal draft for review. Only its explicit submit may sync here.
      if (requiresFormalSession() && ["order", "idea", "feedback"].includes(new URLSearchParams(window.location.search).get("resume") ?? "")) return;
      if (navigator.onLine) void syncNow().catch(() => undefined);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") synchronize();
    };
    const onWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "TRY_SYNC") synchronize();
    };
    navigator.serviceWorker?.addEventListener("message", onWorkerMessage);
    window.addEventListener("online", synchronize);
    document.addEventListener("visibilitychange", onVisibility);
    const interval = window.setInterval(synchronize, 5 * 60 * 1000);
    synchronize();
    return () => {
      window.clearInterval(interval);
      navigator.serviceWorker?.removeEventListener("message", onWorkerMessage);
      window.removeEventListener("online", synchronize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
