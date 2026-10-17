'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { chatGPTSignInPath } from '@/lib/auth-paths';
import { selectVerifiedDashboardOwner } from '@/lib/offline-owner';

const BOUNDARY_KEY = 'venezuela-agro-session-boundary';
type LockState = { blocked: boolean; checking: boolean; message: string; verify: () => Promise<void> };
const OfflineAccountBlocked = createContext<LockState | null>(null);
/** Portalled dialogs retain this context; keep their drafts mounted but hidden/inert. */
export function useOfflineAccountBlocked() { return useContext(OfflineAccountBlocked)?.blocked ?? false; }
function readBoundary(): string | null | undefined {
  try { return localStorage.getItem(BOUNDARY_KEY); } catch { return undefined; }
}

/** Locks the originally mounted account view without removing drafts or its component tree. */
/* eslint-disable react-hooks/refs -- This security boundary intentionally captures identity and the last safe child tree synchronously. Deferring this latch to an effect would render a changed account or discard the old draft tree before it can be hidden. Event-driven state still schedules all boundary updates. */
export function OfflineAccountBoundary({ ownerId, localOnly = false, children }: {
  ownerId: string | null;
  localOnly?: boolean;
  children: ReactNode;
}) {
  const original = useRef<{ ownerId: string; localOnly: boolean } | null>(null);
  const current = useRef({ ownerId, localOnly });
  current.current = { ownerId, localOnly };
  const acceptedBoundary = useRef(readBoundary());
  const observedBoundary = useRef(acceptedBoundary.current);
  if (!original.current && ownerId !== null) {
    original.current = { ownerId, localOnly: localOnly && ownerId === 'device-local' };
    acceptedBoundary.current = readBoundary(); observedBoundary.current = acceptedBoundary.current;
  }
  const retainedChildren = useRef(children);
  const mounted = useRef(false);
  const attempt = useRef(0);
  const request = useRef<AbortController | null>(null);
  const checkingRef = useRef(false);
  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const sameView = !original.current || (ownerId === original.current.ownerId
    && (localOnly && ownerId === 'device-local') === original.current.localOnly);
  const exempt = sameView && !!original.current?.localOnly;
  const blocked = !!original.current && !exempt && (locked || !sameView || readBoundary() !== acceptedBoundary.current);
  const hidden = blocked || !original.current;
  if (!blocked && sameView) retainedChildren.current = children;

  useEffect(() => {
    mounted.current = true;
    const invalidate = () => {
      attempt.current++; request.current?.abort(); request.current = null;
      checkingRef.current = false; setChecking(false); setLocked(true); setMessage('');
    };
    const check = () => {
      if (!mounted.current || !original.current || original.current.localOnly) return;
      const next = readBoundary();
      if (next === observedBoundary.current) return;
      observedBoundary.current = next; invalidate();
    };
    const storage = (event: StorageEvent) => {
      if (event.key !== BOUNDARY_KEY && event.key !== null) return;
      // Read the current value: a queued older storage event must not relock a verified view.
      check();
    };
    const visible = () => { if (document.visibilityState === 'visible') check(); };
    window.addEventListener('storage', storage);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', visible);
    check();
    return () => {
      // Invalidate the latest attempt, not the generation present when this effect subscribed.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      mounted.current = false; attempt.current++; request.current?.abort();
      window.removeEventListener('storage', storage);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', visible);
    };
  }, []);

  useEffect(() => {
    if (sameView) return;
    attempt.current++; request.current?.abort(); request.current = null;
    // A changed owner prop is already hidden synchronously; latch that protection and cancel its in-flight check.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkingRef.current = false; setChecking(false); setLocked(true);
    setMessage('Esta vista pertenece a la cuenta original. Abre la otra cuenta en una pestaña nueva.');
  }, [sameView]);

  async function verifyOriginalAccount() {
    if (checkingRef.current || exempt || !original.current) return;
    const originalOwner = original.current.ownerId;
    const originalLocalOnly = original.current.localOnly;
    checkingRef.current = true; setChecking(true); setMessage('');
    const serial = ++attempt.current;
    const boundary = readBoundary();
    observedBoundary.current = boundary;
    const controller = new AbortController(); request.current = controller;
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      if (boundary === undefined) throw new Error('storage_unavailable');
      const response = await fetch('/api/account-menu', { cache: 'no-store', credentials: 'same-origin', signal: controller.signal });
      if (!response.ok) throw new Error('session_unavailable');
      const session: unknown = await response.json();
      controller.signal.throwIfAborted();
      if (!mounted.current || serial !== attempt.current) return;
      if (readBoundary() !== boundary) throw new Error('session_changed');
      const verifiedOwner = session && typeof session === 'object' && 'owner' in session ? session.owner : undefined;
      if (verifiedOwner !== originalOwner || current.current.ownerId !== originalOwner
        || (current.current.localOnly && current.current.ownerId === 'device-local') !== originalLocalOnly) {
        setMessage('La sesión abierta no coincide con la cuenta original. Inicia sesión con esa cuenta para recuperar esta vista.');
        return;
      }
      selectVerifiedDashboardOwner(originalOwner);
      acceptedBoundary.current = boundary; observedBoundary.current = boundary; setLocked(false);
      setMessage('');
    } catch {
      if (mounted.current && serial === attempt.current) {
        setLocked(true);
        setMessage('No pudimos verificar la cuenta original. Conéctate, inicia sesión con esa cuenta y vuelve a comprobar.');
      }
    } finally {
      clearTimeout(timer);
      if (serial === attempt.current) {
        request.current = null; checkingRef.current = false;
        if (mounted.current) setChecking(false);
      }
    }
  }

  return <OfflineAccountBlocked.Provider value={{ blocked, checking, message, verify: verifyOriginalAccount }}>
    {blocked && <style>{`[data-radix-popper-content-wrapper], [data-slot="select-content"], [data-slot="popover-content"], [data-slot="dropdown-menu-content"], [data-slot="context-menu-content"], [data-slot="tooltip-content"] { display: none !important; visibility: hidden !important; pointer-events: none !important; }`}</style>}
    {blocked && <OfflineAccountLockPanel />}
    {!original.current && <p role="status" className="p-6">Comprobando el espacio de esta cuenta…</p>}
    <div hidden={hidden} inert={hidden} aria-hidden={hidden || undefined} style={hidden ? { display: 'none' } : undefined} data-offline-account-view="">
      {retainedChildren.current}
    </div>
  </OfflineAccountBlocked.Provider>;
}

/* eslint-enable react-hooks/refs */

function focusLockPanel(node: HTMLElement | null) { node?.focus({ preventScroll: true }); }
/** Render inside an already-open modal to keep its focus trap and original draft nodes intact. */
export function OfflineAccountLockPanel({ withinModal = false }: { withinModal?: boolean }) {
  const state = useContext(OfflineAccountBlocked);
  if (!state?.blocked) return null;
  return <section style={{ pointerEvents: 'auto' }} ref={focusLockPanel} tabIndex={-1} role="alert" data-offline-account-lock="" className={withinModal ? 'p-3 outline-none' : 'mx-auto my-8 max-w-2xl rounded-2xl border bg-white p-6 text-[#3e2a19] outline-none'}>
    <h2 className="text-xl font-bold">La sesión cambió en este navegador</h2>
    <p className="mt-3 text-sm leading-6">Ocultamos esta vista para proteger la cuenta original. Los registros guardados siguen en el dispositivo; los formularios abiertos se mantienen en esta pestaña, pero sus cambios sin guardar todavía no tienen copia.</p>
    <p className="mt-2 text-sm leading-6">No cierres ni recargues esta pestaña si tienes cambios sin guardar. Inicia sesión con la cuenta original en una pestaña nueva y después compruébala aquí.</p>
    {state.message && <p className="mt-3 text-sm" role="status">{state.message}</p>}
    <div className="mt-4 flex flex-wrap gap-3">
      <a href={chatGPTSignInPath('/app')} target="_blank" rel="noopener noreferrer" className="button-light">Abrir inicio de sesión en otra pestaña</a>
      <button type="button" onClick={() => void state.verify()} disabled={state.checking} className="button-dark">{state.checking ? 'Comprobando…' : 'Comprobar mi cuenta'}</button>
    </div>
  </section>;
}
