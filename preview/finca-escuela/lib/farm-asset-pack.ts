/** Generic public assets only. This protocol never reads or transmits farm records. */
export type FarmAssetPackStatus = {
  ready: boolean;
  phase: 'idle' | 'checking' | 'downloading' | 'verifying' | 'ready' | 'cancelled' | 'error';
  completedFiles?: number;
  totalFiles?: number;
  completedBytes?: number;
  totalBytes?: number;
  version?: string;
  deployment?: string;
  preparedAt?: string;
  licensesReady?: boolean;
  error?: string;
  diagnostic?: { code: string; path?: string; httpStatus?: number; deployment?: string; phase?: string };
};

type PackMessage = { type: 'FARM_ASSETS_PROGRESS' | 'FARM_ASSETS_RESULT'; status: FarmAssetPackStatus };
type Progress = (status: FarmAssetPackStatus) => void;
const operations = new Set<AbortController>();
const cancelled = (): FarmAssetPackStatus => ({ ready: false, phase: 'cancelled', error: 'Descarga cancelada. La copia anterior se conserva.' });

async function message(prepare: boolean, onProgress?: Progress, signal?: AbortSignal): Promise<FarmAssetPackStatus> {
  if (signal?.aborted) return cancelled();
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { ready: false, phase: 'error', error: 'Este navegador no permite descargar el paquete sin conexión.' };
  }
  const registration = await navigator.serviceWorker.getRegistration();
  // Use the controller that owns this page, avoiding a waiting worker / old-page mix.
  const worker = navigator.serviceWorker.controller ?? registration?.active;
  if (signal?.aborted) return cancelled();
  if (!worker) return { ready: false, phase: 'error', error: 'La aplicación se está preparando. Espera con internet y vuelve a intentar.' };
  return new Promise(resolve => {
    const channel = new MessageChannel();
    const requestId = globalThis.crypto.randomUUID();
    let settled = false;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (status: FarmAssetPackStatus) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
      channel.port1.close();
      if (status.diagnostic) console.warn('Paquete 3D: diagnóstico de descarga', status.diagnostic);
      resolve(status);
    };
    const stop = () => { try { if (prepare) worker.postMessage({ type: 'CANCEL_FARM_ASSETS', requestId }); } catch { /* A replaced worker cannot receive cancellation. */ } };
    const cancel = () => { stop(); finish(cancelled()); };
    // A live progress stream extends the inactivity window; there is no false "ready" timeout.
    const armTimeout = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        stop();
        finish({ ready: false, phase: 'error', diagnostic: { code: 'worker_timeout' }, error: prepare ? 'La descarga dejó de responder. Espera a que se actualice la aplicación, recarga y vuelve a intentar.' : 'El almacenamiento local no respondió. Puede seguir activa una versión anterior. Mantén internet, recarga y vuelve a comprobar.' });
      }, prepare ? 240000 : 30000);
    };
    channel.port1.onmessage = (event: MessageEvent<PackMessage>) => {
      const reply = event.data;
      if (!reply || !['FARM_ASSETS_PROGRESS', 'FARM_ASSETS_RESULT'].includes(reply.type) || typeof reply.status?.ready !== 'boolean') return;
      if (reply.type === 'FARM_ASSETS_PROGRESS') { armTimeout(); onProgress?.(reply.status); }
      else finish(reply.status);
    };
    signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted) { cancel(); return; }
    armTimeout();
    try { worker.postMessage({ type: prepare ? 'PREPARE_FARM_ASSETS' : 'FARM_ASSETS_STATUS', requestId }, [channel.port2]); }
    catch { finish({ ready: false, phase: 'error', error: 'No se pudo hablar con el almacenamiento local. Recarga y vuelve a comprobar.' }); }
  });
}

/** Checks hashes, file completeness, licenses and app shell locally, including when offline. */
export async function getFarmAssetPackStatus(): Promise<FarmAssetPackStatus> {
  try { return await message(false); }
  catch { return { ready: false, phase: 'error', error: 'No se pudo comprobar el almacenamiento local.' }; }
}

/** Call only after an explicit download / retry click. */
export async function downloadFarmAssetPack(onProgress?: Progress, signal?: AbortSignal): Promise<FarmAssetPackStatus> {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  operations.add(controller);
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) cancel();
  try { return await message(true, onProgress, controller.signal); }
  catch { return { ready: false, phase: 'error', error: 'No se pudo iniciar la descarga. Conecta y vuelve a intentar.' }; }
  finally { operations.delete(controller); signal?.removeEventListener('abort', cancel); }
}

export function cancelFarmAssetPackDownload(): void {
  for (const controller of operations) controller.abort();
}

export function formatFarmPackBytes(bytes = 0): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}
