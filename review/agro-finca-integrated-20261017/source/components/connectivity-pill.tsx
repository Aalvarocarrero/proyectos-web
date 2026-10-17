"use client";

import { useSyncExternalStore } from "react";
import { Cloud, CloudOff } from "lucide-react";

export function ConnectivityPill() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-semibold tracking-normal text-white/80 backdrop-blur-xl"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      title={online ? "El navegador detecta red. Esto no confirma acceso al servidor, sincronización ni copia de seguridad." : "Solo podrás consultar recursos preparados y registros guardados en este navegador."}
    >
      {online ? <Cloud size={15} aria-hidden="true" /> : <CloudOff size={15} aria-hidden="true" />}
      {online ? "Red detectada · no confirma sincronización" : "Sin conexión · solo lo guardado aquí"}
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
