"use client";

import { useSyncExternalStore } from "react";
import { Cloud, CloudOff } from "lucide-react";

export function ConnectivityPill() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-semibold tracking-normal text-white/80 backdrop-blur-xl"
      aria-live="polite"
    >
      {online ? <Cloud size={15} /> : <CloudOff size={15} />}
      {online ? "Conexión detectada" : "Sin conexión · consulta tu copia local"}
    </span>
  );
}

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}
