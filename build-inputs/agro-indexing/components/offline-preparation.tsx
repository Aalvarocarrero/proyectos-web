'use client';
import { OfflineDownloadSize } from '@/components/offline-download-size';
import { useCallback, useEffect, useRef, useState } from 'react';
import { checkOfflineReadiness, type OfflineStatus } from '@/lib/offline-readiness';

/** Shareable public app preparation. No record storage, account selection or synchronization. */
export function OfflinePreparation({ onReady }: { onReady?: (ready: boolean) => void }) {
  const [status, setStatus] = useState<OfflineStatus>({ ready: false });
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const current = useRef(0);
  const mounted = useRef(false);
  const running = useRef(false);
  const update = useCallback((next: OfflineStatus) => { setStatus(next); onReady?.(next.ready); }, [onReady]);
  const check = useCallback(async (prepare = false) => {
    if (running.current) return;
    running.current = true;
    const sequence = ++current.current;
    if (mounted.current) { setBusy(prepare); setChecking(!prepare); }
    try {
      const result = await checkOfflineReadiness(prepare, next => { if (mounted.current && sequence === current.current) update(next); });
      if (mounted.current && sequence === current.current) update(result);
    } catch { if (mounted.current && sequence === current.current) update({ ready: false, error: 'No se pudo preparar el dispositivo. Conecta y vuelve a intentar.' }); }
    finally { if (sequence === current.current) { running.current = false; if (mounted.current) { setBusy(false); setChecking(false); } } }
  }, [update]);
  useEffect(() => {
    mounted.current = true;
    const sequence = current;
    void check();
    const refresh = () => { void check(); };
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    navigator.serviceWorker?.addEventListener('controllerchange', refresh);
    document.addEventListener('visibilitychange', visible);
    return () => { mounted.current = false; running.current = false; ++sequence.current; navigator.serviceWorker?.removeEventListener('controllerchange', refresh); document.removeEventListener('visibilitychange', visible); };
  }, [check]);
  const progress = status.total ? Math.floor(100 * (status.completed ?? 0) / status.total) : 0;
  return <div aria-label="Preparación del código sin conexión" aria-busy={busy||checking}>
    <p className="text-sm font-bold text-[#365026]" role="status" aria-live="polite">{checking ? 'Comprobando la preparación de este dispositivo…' : busy ? status.phase === 'verifying' ? 'Verificando la descarga…' : 'Preparando los recursos de la app…' : status.ready ? 'Mi Finca y la finca modelo preparadas sin señal en este navegador' : 'Comprueba la preparación antes de salir sin señal'}</p>
    {busy && <><progress aria-label="Recursos de la aplicación preparados" className="mt-2 h-2 w-full accent-[#4c6b3a]" value={status.total ? progress : undefined} max={100} /><p className="mt-1 text-xs tabular-nums">{status.total ? `${status.completed ?? 0} de ${status.total} recursos preparados` : "Leyendo el manifiesto de recursos…"}</p></>}
    {status.ready && status.version && <p className="mt-1 break-words text-xs text-[#71685f]">Versión {status.version.replace('morochos-v', '')} verificada</p>}
    <OfflineDownloadSize/>
    <p className="mt-2 text-sm leading-6 text-[#71685f]">Primero prepara lo necesario para abrir Mi Finca y llevar tus registros. La primera descarga requiere internet y debe terminar. Guarda las herramientas de Mi Finca y la finca modelo. Por ahora, la descarga básica también incluye las herramientas del plano 3D y el mapa nacional de referencia. Los modelos y texturas se preparan con «Descargar paquete 3D». No descarga el catálogo de Mercado ni la Comunidad de otras personas. Tus registros y publicaciones propias sincronizadas se guardan aparte, por cuenta; su tamaño depende de tus datos. La biblioteca de referencias es opcional y comparte parte del código básico. El navegador puede borrar la copia si falta espacio.</p>
    {status.error && <p className="mt-2 text-sm text-[#8d372a]" role="status">{status.error}</p>}
    <button type="button" disabled={busy||checking} onClick={() => void check(true)} className="mt-3 min-h-11 rounded-full bg-[#4c6b3a] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{checking ? 'Comprobando…' : busy ? 'Preparando…' : status.error ? 'Reintentar / comprobar sin señal' : 'Preparar / comprobar sin señal'}</button>
  </div>;
}
