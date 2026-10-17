'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
/** Public app resources only. Never mounts account selection or synchronization. */
export function OfflineWorkerRegistration() {
  const path=usePathname();
  const isLearning=path==='/juego-finca'||path.startsWith('/juego-finca/');
  useEffect(() => { if(!isLearning)navigator.serviceWorker?.register('/sw.js').catch(() => undefined); }, [isLearning]);
  return null;
}
