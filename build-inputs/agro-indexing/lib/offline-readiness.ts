export type OfflineStatus = {
  ready: boolean;
  phase?: 'idle' | 'checking' | 'downloading' | 'verifying' | 'ready' | 'error';
  completed?: number;
  total?: number;
  version?: string;
  preparedAt?: string;
  error?: string;
};
const updateMessage = 'Hay una versión nueva preparada o en descarga. Mantén internet; cuando termine, cierra todas las pestañas de VenezuelaAgro y vuelve a abrir para comprobarla.';

async function waitForActivation(worker: ServiceWorker): Promise<boolean> {
  if (worker.state === 'activated') return true;
  if (worker.state === 'redundant') return false;
  return new Promise(resolve => {
    const finish = (ready: boolean) => { clearTimeout(timer); worker.removeEventListener('statechange', changed); resolve(ready); };
    const changed = () => { if (worker.state === 'activated') finish(true); else if (worker.state === 'redundant') finish(false); };
    const timer = setTimeout(() => finish(false), 30000);
    worker.addEventListener('statechange', changed); changed();
  });
}

/** Public resources only; a readiness check never identifies or sends a workspace. */
export async function checkOfflineReadiness(prepare = false, onProgress?: (status: OfflineStatus) => void): Promise<OfflineStatus> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return { ready: false, error: 'Este navegador no permite preparar la app sin conexión.' };
  let expectedVersion: string | undefined;
  if (navigator.onLine) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('/offline-assets.json', { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error();
      const manifest = await response.json() as { revision?: string };
      expectedVersion = manifest.revision;
      if (!expectedVersion) throw new Error();
    } catch { return { ready: false, error: 'No se pudo verificar la versión actual. Mantén la conexión y vuelve a comprobar.' }; }
    finally { clearTimeout(timer); }
  }
  let registration = await navigator.serviceWorker.getRegistration();
  if (!registration && prepare && navigator.onLine) registration = await navigator.serviceWorker.register('/sw.js');
  // First install can report real progress before it is active. Never take over an old tab.
  const worker = navigator.serviceWorker.controller ?? registration?.active ?? registration?.installing ?? registration?.waiting;
  if (!worker) return { ready: false, error: 'La preparación inicial sigue pendiente. Mantén internet y pulsa preparar para reintentar.' };
  const status = await new Promise<OfflineStatus>(resolve => {
    const channel = new MessageChannel();
    let settled = false;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (status: OfflineStatus) => {
      if (settled) return;
      settled = true; clearTimeout(timer); channel.port1.close();
      resolve(status.ready && expectedVersion && status.version !== expectedVersion ? { ready: false, error: updateMessage } : status);
    };
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => finish({ ready: false, error: 'La preparación dejó de responder. Conserva internet y vuelve a intentar; no borres tus datos.' }), prepare ? 240000 : 30000);
    };
    channel.port1.onmessage = event => {
      const reply = event.data;
      if (reply?.type === 'OFFLINE_PROGRESS' && typeof reply.status?.ready === 'boolean') {
        arm(); onProgress?.({ ...reply.status, ready: false });
      } else if (typeof reply?.ready === 'boolean') finish(reply as OfflineStatus);
    };
    arm();
    try { worker.postMessage({ type: prepare ? 'PREPARE_OFFLINE' : 'OFFLINE_STATUS' }, [channel.port2]); }
    catch { finish({ ready: false, error: 'No se pudo comprobar la preparación. Recarga con internet e inténtalo de nuevo.' }); }
  });
  if (status.ready && !await waitForActivation(worker)) return { ready: false, error: updateMessage };
  return status;
}
