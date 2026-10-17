import { mergeRateSnapshots, RATE_REFRESH_MS, rateResponseSchema, readRateSnapshot, saveRateSnapshot, sourceCurrencies, sourceDay, type RateSnapshot, type SourceCurrency } from './exchange-rates';

type ClientState = { snapshot: RateSnapshot; offline: boolean; busy: boolean; failed: SourceCurrency[]; storageWarning: boolean };
const emptyState: ClientState = { snapshot: {version:1,rates:[]}, offline:false, busy:false, failed:[], storageWarning:false };
type Options = { fetcher?: typeof fetch; now?: () => Date; getStorage?: () => Storage; isOnline?: () => boolean };

/** One public request/cache per browser tab, activated by an open converter or visible price references.
 * The same-origin endpoint receives normal cookies, never the amount/product.
 * It sends no user information to the external official-rate providers. */
export function createExchangeRateClient({fetcher=(...args)=>globalThis.fetch(...args),now=()=>new Date(),getStorage=()=>localStorage,isOnline=()=>navigator.onLine}: Options = {}) {
  let state=emptyState,hydrated=false,lastAttempt:number|null=null,lastDay='',request:Promise<void>|null=null;
  const listeners=new Set<()=>void>();
  let cleanup:(()=>void)|null=null;
  const update=(patch:Partial<ClientState>)=>{state={...state,...patch};listeners.forEach(listener=>listener());};
  const dayKey=()=>sourceCurrencies.map(currency=>sourceDay(currency,now())).join('|');
  function hydrate(){
    if(hydrated)return;
    hydrated=true;
    try{update({snapshot:mergeRateSnapshots(state.snapshot,readRateSnapshot(getStorage()))});}
    catch{update({storageWarning:true});}
  }
  function refresh(force=false):Promise<void>{
    hydrate();
    const offline=!isOnline();
    if(state.offline!==offline)update({offline});
    if(offline)return Promise.resolve();
    if(request)return request;
    // Opening fifty cards is not fifty requests, including during an outage.
    const cooldown=RATE_REFRESH_MS;
    if(!force&&lastAttempt!==null&&now().getTime()-lastAttempt<cooldown&&lastDay===dayKey())return Promise.resolve();
    lastAttempt=now().getTime();lastDay=dayKey();
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),16_000);
    update({busy:true});
    request=(async()=>{
      try{
        const response=await Promise.resolve().then(()=>fetcher('/api/exchange-rates',{cache:'no-store',signal:controller.signal,credentials:'same-origin'}));
        if(!response.ok)throw new Error('unavailable');
        const value=rateResponseSchema.parse(await response.json());
        const snapshot=mergeRateSnapshots(state.snapshot,{version:1,rates:value.rates});
        update({snapshot,failed:value.unavailable});
        try{saveRateSnapshot(getStorage(),snapshot);update({storageWarning:false});}catch{update({storageWarning:true});}
      }catch{update({failed:[...sourceCurrencies]});}
      finally{clearTimeout(timeout);request=null;update({busy:false,offline:!isOnline()});}
    })();
    return request;
  }
  function subscribe(listener:()=>void){
    listeners.add(listener);
    if(listeners.size===1){
      hydrate();void refresh();
      if(typeof window!=='undefined'){
        const online=()=>{void refresh(true);},offline=()=>update({offline:true});
        const visible=()=>{if(document.visibilityState==='visible')void refresh();};
        const timer=setInterval(visible,60_000);
        window.addEventListener('online',online);window.addEventListener('offline',offline);document.addEventListener('visibilitychange',visible);
        cleanup=()=>{clearInterval(timer);window.removeEventListener('online',online);window.removeEventListener('offline',offline);document.removeEventListener('visibilitychange',visible);};
      }
    }
    return ()=>{listeners.delete(listener);if(!listeners.size){cleanup?.();cleanup=null;}};
  }
  return {subscribe,refresh,getSnapshot:()=>state,getServerSnapshot:()=>emptyState};
}

export const exchangeRateClient=createExchangeRateClient();
