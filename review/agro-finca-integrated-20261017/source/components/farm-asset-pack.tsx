'use client';
import { OfflineDownloadSize } from '@/components/offline-download-size';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { downloadFarmAssetPack, formatFarmPackBytes, getFarmAssetPackStatus, type FarmAssetPackStatus } from '@/lib/farm-asset-pack';

/** Small enough for the phone's plan controls; download is always an explicit action. */
export function FarmAssetPack({ className = '' }: { className?: string }) {
  const [status, setStatus] = useState<FarmAssetPackStatus>({ ready: false, phase: 'checking' });
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  const generation = useRef(0);
  const descriptionId = useId();

  const check = useCallback(async () => {
    if (abort.current) return;
    const current = ++generation.current;
    if (mounted.current) setChecking(true);
    const result = await getFarmAssetPackStatus();
    if (mounted.current && generation.current === current && !abort.current) { setStatus(result); setChecking(false); }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const sequence = generation;
    void check();
    const visible = () => { if (document.visibilityState === 'visible') void check(); };
    document.addEventListener('visibilitychange', visible);
    navigator.serviceWorker?.addEventListener('controllerchange', check);
    return () => {
      mounted.current = false;
      ++sequence.current;
      abort.current?.abort();
      document.removeEventListener('visibilitychange', visible);
      navigator.serviceWorker?.removeEventListener('controllerchange', check);
    };
  }, [check]);

  async function download() {
    if (abort.current) return;
    const controller = new AbortController();
    const current = ++generation.current;
    abort.current = controller;
    setChecking(false);
    setBusy(true);
    setStatus({ ready: false, phase: 'checking' });
    const result = await downloadFarmAssetPack(next => {
      if (mounted.current && generation.current === current) setStatus(next);
    }, controller.signal);
    if (abort.current === controller) abort.current = null;
    if (mounted.current && generation.current === current) { setStatus(result); setBusy(false); }
  }

  const total = status.totalFiles ?? 0;
  const completed = status.completedFiles ?? 0;
  const progress = status.totalBytes ? Math.min(100, Math.floor(100 * (status.completedBytes ?? 0) / status.totalBytes)) : 0;
  const label = busy
    ? status.phase === 'verifying' ? 'Verificando archivos y licencias…' : status.phase === 'checking' ? 'Comprobando la versión…' : 'Descargando modelos 3D…'
    : checking ? 'Comprobando la copia local…' : status.ready ? 'Paquete 3D listo sin conexión' : 'Modelos 3D sin conexión';

  return <section className={`rounded-2xl border border-[#4c6b3a]/20 bg-white/95 p-3 text-xs text-[#365026] ${className}`} aria-label="Paquete local de modelos 3D" aria-describedby={descriptionId}>
    <p className="font-bold" role="status" aria-live="polite">{label}</p>
    {total > 0 && <p className="mt-1 tabular-nums">{completed} de {total} archivos verificados · {formatFarmPackBytes(status.completedBytes)} / {formatFarmPackBytes(status.totalBytes)}</p>}
    {busy && <progress aria-label="Modelos 3D descargados y verificados" className="mt-2 h-2 w-full accent-[#4c6b3a]" value={progress} max={100} />}
    {status.ready && status.version && <p className="mt-1 break-words text-[11px]">Versión {status.version.slice(0, 12)} · licencias guardadas</p>}
    <OfflineDownloadSize pack="3d"/>
    <p id={descriptionId} className="mt-2 leading-relaxed text-[#71685f]">Opcional: descarga los modelos y texturas si vas a usar la vista 3D sin señal. Puedes llevar tus registros sin descargar este paquete. Abrir el plano por primera vez no descarga todo el paquete. El navegador puede borrar esta copia si falta espacio.</p>
    {status.error && <p className="mt-2 leading-relaxed text-[#8d372a]" role="status">{status.error}</p>}
    <div className="mt-2 flex flex-wrap gap-2">
      {busy ? <button type="button" onClick={() => abort.current?.abort()} className="min-h-11 rounded-full border px-4 py-2 font-bold">Cancelar descarga</button>
        : <><button type="button" onClick={() => void download()} className="min-h-11 rounded-full bg-[#4c6b3a] px-4 py-2 font-bold text-white">{status.ready ? 'Actualizar paquete' : status.phase === 'error' || status.phase === 'cancelled' ? 'Reintentar descarga' : 'Descargar paquete 3D'}</button>
          <button type="button" disabled={checking} onClick={() => void check()} className="min-h-11 rounded-full border px-3 py-2 font-bold disabled:opacity-50">Comprobar copia</button></>}
      <a className="inline-flex min-h-11 items-center px-2 py-2 underline" href="/farm-3d/manifest.json" target="_blank" rel="noreferrer">Fuentes y licencias</a>
    </div>
  </section>;
}
