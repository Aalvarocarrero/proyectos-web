"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Wifi, WifiOff, HelpCircle } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { getPendingCount, subscribeOfflineChanges } from "@/lib/offline-db";
import { localOwner, subscribeOfflineChoice } from "@/lib/offline-owner";
import { connectionIndicator, type ConnectionIndicatorInput } from "@/lib/connection-indicator";

function subscribeNetwork(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

type Props = { tone?: "light" | "dark" };

/** In-flow header control. The learning game never reads real workspace state. */
export function ConnectionIndicator({ tone = "dark" }: Props) {
  const path = usePathname() ?? "";
  if (path === "/juego-finca" || path.startsWith("/juego-finca/")) return null;
  return <ConnectionIndicatorForRoute key={path} path={path} tone={tone} />;
}

function ConnectionIndicatorForRoute({ path, tone }: Props & { path: string }) {
  const isDemo = ["/finca-demo", "/finca-modelo", "/modelos-finca"].some(route => path === route || path.startsWith(`${route}/`));
  const online = useSyncExternalStore(subscribeNetwork, () => navigator.onLine, () => null);
  const [pending, setPending] = useState<number | null>(null);
  const [mode, setMode] = useState<ConnectionIndicatorInput["mode"]>(isDemo ? "demo" : "unknown");
  const titleId = useId();

  useEffect(() => {
    let active = true, revision = 0;
    if (isDemo) return;
    async function refresh() {
      const current = ++revision;
      try {
        const owner = await localOwner();
        const count = await getPendingCount(owner);
        if (!active || current !== revision) return;
        setMode(owner === "device-local" ? "local" : "account");
        setPending(count);
      } catch {
        if (active && current === revision) {
          setMode("unknown");
          setPending(null);
        }
      }
    }
    void refresh();
    const off = subscribeOfflineChanges(() => void refresh());
    const choice = subscribeOfflineChoice(() => void refresh());
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    return () => {
      active = false;
      revision++;
      off();
      choice();
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
    };
  }, [isDemo]);

  const info = connectionIndicator({ online, pending, mode });
  const Icon = online === null ? HelpCircle : online ? Wifi : WifiOff;
  const hasPending = !!info.pending;
  return <Popover>
    <PopoverTrigger asChild>
      <button type="button" className="connection-indicator-trigger" data-tone={tone} data-network={online === null ? "unknown" : online ? "online" : "offline"} aria-label={`${info.short}. ${hasPending ? `${info.pending} cambios pendientes de sincronizar. ` : ""}Ver estado de conexión y guardado`} title={info.short}>
        <span className="connection-indicator-icon" aria-hidden="true"><Icon size={17} />{hasPending && <span className="connection-pending-dot" />}</span>
        <span className="connection-indicator-label" aria-hidden="true">{online === false ? "Sin red" : "Conexión"}</span>
      </button>
    </PopoverTrigger>
    <PopoverContent side="bottom" align="end" sideOffset={8} collisionPadding={12} aria-labelledby={titleId} className="z-[120] max-h-[var(--radix-popover-content-available-height)] w-80 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl bg-[#f8f3ea] p-5 text-[#3e2a19]">
      <h2 id={titleId} className="text-base font-bold">{info.network}</h2>
      <p className="mt-2 text-sm leading-6 text-[#675f57]">{info.networkDetail}</p>
      <p className="mt-3 text-sm leading-6">{info.detail}</p>
      <p className="mt-3 rounded-xl border bg-white p-3 text-xs leading-5" role="status" aria-live="polite">{info.queue}</p>
      <Link href="/app" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-[#365026] underline">{isDemo ? "Volver a Mi Finca real" : "Abrir Mi Finca y revisar el estado"}</Link>
    </PopoverContent>
  </Popover>;
}
