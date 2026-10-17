const KEY = "venezuela-agro-last-local-owner";
const SIGN_OUT_KEY = "venezuela-agro-session-boundary";
let seenSignOut = readSignOutBoundary();
function readSignOutBoundary() { try { return localStorage.getItem(SIGN_OUT_KEY); } catch { return null; } }
const TRUST_KEY = "venezuela-agro-trusted-offline-workspace";
let choiceOwner: string | null = null;
let resolveChoice: ((owner: string) => void) | null = null;
function announceChoice() { if (typeof window !== "undefined") window.dispatchEvent(new Event("venezuela-agro-offline-choice")); }
export function offlineChoiceRequired() { return choiceOwner !== null; }
export function subscribeOfflineChoice(callback: () => void) {
 window.addEventListener("venezuela-agro-offline-choice",callback);
 return () => window.removeEventListener("venezuela-agro-offline-choice",callback);
}
function trustedOwner(): string | null {
 try { const record=JSON.parse(localStorage.getItem(TRUST_KEY)||"null");return record?.version===1 && typeof record.owner==="string" && record.owner.length<220 && record.owner!=="device-local" ? record.owner : null; } catch { return null; }
}
function reconcileTrustedOwner(owner: string) {
 try { if (trustedOwner() && trustedOwner()!==owner) localStorage.removeItem(TRUST_KEY); } catch {}
}
export function chooseOfflineWorkspace(useSaved: boolean) {
 const owner=useSaved && choiceOwner ? choiceOwner : "device-local";
 const resolver=resolveChoice;resolveChoice=null;choiceOwner=null;
 try { sessionStorage.setItem(KEY,owner); } catch {}
 resolver?.(owner);announceChoice();
}
export async function rememberOfflineWorkspace() {
 const owner=await localOwner();
 if(owner==="device-local")throw new Error("El espacio local ya se puede reabrir sin cuenta. Para preparar una cuenta, ábrela primero con internet.");
 if(!navigator.onLine || !await verifySyncOwner(owner))throw new Error("Reconecta y verifica la cuenta antes de preparar su acceso sin señal.");
 localStorage.setItem(TRUST_KEY,JSON.stringify({version:1,owner}));
 if(trustedOwner()!==owner)throw new Error("El navegador no permitió guardar este acceso. Usa una copia descargada.");
 return owner;
}
export function forgetOfflineWorkspace() { localStorage.removeItem(TRUST_KEY); }

let ownerPromise: Promise<string> | null = null;
let ownerMode = "";
let ownerRevision = 0;
export function databaseNameForOwner(owner: string) { return `los-morochos-offline-v2:${encodeURIComponent(owner)}`; }
async function resolveOwner(revision: number) {
  if (location.pathname === "/app-local") return "device-local";
  if (navigator.onLine) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    try {
      const response = await fetch("/api/offline-session", {cache:"no-store",signal:controller.signal});
      if (!response.ok) throw new Error("session_unavailable");
      const result = await response.json() as {owner?:string};
      if (!result.owner) throw new Error("session_unavailable");
      try { if (revision === ownerRevision) { sessionStorage.setItem(KEY,result.owner); reconcileTrustedOwner(result.owner); } } catch {}
      return result.owner;
    } catch { /* Offline use can reuse only this tab's last verified identity. */ }
    finally { clearTimeout(timer); }
  }
  try { const active=sessionStorage.getItem(KEY); if(active)return active; } catch {}
  const saved=trustedOwner();
  if(saved && revision===ownerRevision) {
   choiceOwner=saved;announceChoice();
   return new Promise<string>(resolve=>{resolveChoice=resolve;});
  }
  return "device-local";
}
/** Forget access hints only, never IndexedDB records, attachments, or queued changes. */
export function prepareOfflineSignOut() {
 if(resolveChoice)chooseOfflineWorkspace(false);
 try { sessionStorage.removeItem(KEY); } catch {}
 try { localStorage.removeItem(TRUST_KEY); } catch {}
 try { localStorage.setItem(SIGN_OUT_KEY, String(Date.now()) + Math.random()); } catch {}
 seenSignOut=readSignOutBoundary();
 ownerRevision++;
 ownerPromise=null;
 ownerMode="";
}
function reconcileSignOutBoundary() {
 const current=readSignOutBoundary();
 if(current===seenSignOut)return;
 seenSignOut=current;
 if(resolveChoice)chooseOfflineWorkspace(false);
 try { sessionStorage.removeItem(KEY); } catch {}
 ownerRevision++;ownerPromise=null;ownerMode="";
}
export function localOwner() {
 reconcileSignOutBoundary();
 const mode = location.pathname === "/app-local" ? "device" : "session";
 if (mode !== ownerMode) { if(resolveChoice)chooseOfflineWorkspace(false); ownerMode=mode; ownerPromise=null; ownerRevision++; }
 return ownerPromise ??= resolveOwner(ownerRevision);
}
export async function verifySyncOwner(owner:string) {
 const controller = new AbortController();
 const timer = setTimeout(() => controller.abort(), 4500);
 try {
  const response = await fetch("/api/offline-session",{cache:"no-store",signal:controller.signal});
  if (!response.ok) return false;
  const current=(await response.json() as {owner?:unknown}).owner;
  if(typeof current!=="string")return false;
  reconcileTrustedOwner(current);
  return current === owner;
 } finally { clearTimeout(timer); }
}

/** A server-rendered account change starts a new namespace, never adopts device records. */
export function selectVerifiedDashboardOwner(owner: string) {
 if (owner === "device-local" || location.pathname === "/app-local") return;
 if(resolveChoice)chooseOfflineWorkspace(false);
 reconcileTrustedOwner(owner);
 ownerMode = "session";
 ownerRevision++;
 ownerPromise = Promise.resolve(owner);
 try { sessionStorage.setItem(KEY, owner); } catch {}
}
