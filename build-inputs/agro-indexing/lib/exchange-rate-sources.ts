import { officialRateSchema, sourceDay, type OfficialRate, type RateResponse, type SourceCurrency, sourceCurrencies, RATE_REFRESH_MS } from './exchange-rates';

export const BCV_ENDPOINT = 'https://www.bcv.org.ve/';
export const ECB_ENDPOINT = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
export const TRM_ENDPOINT = 'https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=15&$order=vigenciadesde%20DESC';
/** Only trusted, public, HTTPS origins. No credentials, proxy, paid fallback or TLS exception. */
async function officialText(url: string, fetcher: typeof fetch): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(),12_000);
  try {
    const response = await fetcher(url,{signal:controller.signal,redirect:'manual',headers:{accept:'application/json, text/html, application/xml, text/xml','Cache-Control':'no-cache','Pragma':'no-cache'}});
    if (response.redirected || response.status>=300&&response.status<400) throw new Error('Official source redirect refused');
    if (!response.ok) throw new Error(`Official source HTTP ${response.status}`);
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Official source body unavailable');
    let size=0;const chunks:Uint8Array[]=[];
    try { while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>1_500_000){await reader.cancel();throw new Error('Official source response too large');}chunks.push(part.value);} }
    finally { reader.releaseLock(); }
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
    return new TextDecoder().decode(bytes);
  } finally {clearTimeout(timeout);}
}
export function parseTrm(rows: unknown, now = new Date()): OfficialRate {
  if (!Array.isArray(rows)) throw new Error('Invalid TRM response');
  const today=sourceDay('COP',now);
  const valid=rows.flatMap(row=>{
    if(!row || row.unidad!=='COP' || typeof row.valor!=='string' || !/^\d+(?:\.\d+)?$/.test(row.valor))return [];
    const parsed=officialRateSchema.safeParse({currency:'COP',perUsd:Number(row.valor),validFrom:typeof row.vigenciadesde==='string'?row.vigenciadesde.slice(0,10):'',validTo:typeof row.vigenciahasta==='string'?row.vigenciahasta.slice(0,10):'',fetchedAt:now.toISOString()});
    return parsed.success&&parsed.data.validFrom<=today&&parsed.data.validTo>=today?[parsed.data]:[];
  }).sort((a,b)=>b.validFrom.localeCompare(a.validFrom));
  if(!valid.length)throw new Error('No TRM effective for today');
  return valid[0];
}
/** ECB's daily XML is quoted as USD per EUR. Store the reciprocal for the shared USD-based model. */
export function parseEcb(xml:string,now=new Date()):OfficialRate {
  if(/<!DOCTYPE|<!ENTITY/i.test(xml) || !/xmlns=["']http:\/\/www\.ecb\.int\/vocabulary\/2002-08-01\/eurofxref["']/.test(xml) || !/<gesmes:name>\s*European Central Bank\s*<\/gesmes:name>/i.test(xml))throw new Error('ECB reference could not be verified');
  const dated=[...xml.matchAll(/<Cube\b[^>]*\btime=["'](\d{4}-\d{2}-\d{2})["'][^>]*>([\s\S]*?)<\/Cube>/gi)];
  if(dated.length!==1)throw new Error('ECB reference could not be verified');
  const date=dated[0][1],usd=[...dated[0][2].matchAll(/<Cube\b[^>]*\bcurrency=["']USD["'][^>]*\/>/gi)];
  const value=usd.length===1?usd[0][0].match(/\brate=["'](\d+(?:\.\d+)?)["']/i)?.[1]:undefined;
  const today=sourceDay('EUR',now),age=(Date.parse(today)-Date.parse(date))/86400000;
  if(!value || !Number.isFinite(Number(value)) || Number(value)<=0 || date>today || !Number.isFinite(age) || age>7)throw new Error('ECB reference could not be verified');
  // Keep the publication date. Do not invent an end date for holidays or delayed publications.
  return officialRateSchema.parse({currency:'EUR',perUsd:1/Number(value),validFrom:date,validTo:date,fetchedAt:now.toISOString()});
}
/** Bounded public-page metadata only; never includes source HTML or an unverified rate. */
export function bcvPageDiagnostics(html: string, now = new Date()) {
  const dollar=html.match(/<div\b[^>]*\bid=["']dolar["'][^>]*>([\s\S]*?)<\/strong>/i);
  const value=dollar?.[1]?.match(/<strong\b[^>]*>\s*([\d.,]+)\s*$/i)?.[1];
  const dates=(text:string)=>{
    const out:(string|null)[]=[];
    for(const match of text.matchAll(/<[^>]+class=["'][^"']*\bdate-display-single\b[^"']*["'][^>]*>/gi)) {
      out.push(match[0].match(/\bcontent=["'](\d{4}-\d{2}-\d{2})T/i)?.[1]??null);
      if(out.length===5)break;
    }
    return out;
  };
  const afterDollar=dollar?html.slice((dollar.index??0)+dollar[0].length,(dollar.index??0)+dollar[0].length+2048):'';
  const globalDates=dates(html),nearbyDates=dates(afterDollar);
  return {challengeLike:/captcha|cf-chl-|challenge-platform|just a moment/i.test(html),dollarBlockFound:!!dollar,numericPatternValid:!!value&&/^(?:\d{1,3}(?:\.\d{3})+|\d+),\d+$/.test(value),firstGlobalDate:globalDates[0]??null,caracasDay:sourceDay('VES',now),matchingDateCountCappedAtFive:globalDates.length,fechaValorAfterDollar:/Fecha(?:\s|&nbsp;|<[^>]*>)+Valor/i.test(afterDollar),nearbyDates};
}
class BcvUnverifiedError extends Error {
  readonly diagnostic:ReturnType<typeof bcvPageDiagnostics>;
  constructor(html:string,now:Date){super('BCV daily rate could not be verified');this.diagnostic=bcvPageDiagnostics(html,now);}
}
/** BCV has a public HTML table, not a documented JSON API. Refuse changed markup or future dates. */
export function parseBcv(html: string, now = new Date()): OfficialRate {
  const dollar=html.match(/<div\b[^>]*\bid=["']dolar["'][^>]*>([\s\S]*?)<\/strong>/i)?.[1];
  const value=dollar?.match(/<strong\b[^>]*>\s*([\d.,]+)\s*$/i)?.[1];
  const dateBlock=html.match(/<[^>]+class=["'][^"']*\bdate-display-single\b[^"']*["'][^>]*>/i)?.[0];
  const validFrom=dateBlock?.match(/\bcontent=["'](\d{4}-\d{2}-\d{2})T/i)?.[1];
  if(!value || !/^(?:\d{1,3}(?:\.\d{3})+|\d+),\d+$/.test(value) || !validFrom || validFrom!==sourceDay('VES',now))throw new BcvUnverifiedError(html,now);
  return officialRateSchema.parse({currency:'VES',perUsd:Number(value.replaceAll('.','').replace(',','.')),validFrom,validTo:validFrom,fetchedAt:now.toISOString()});
}
/** Isolate-local hourly cache avoids upstream polling on every listing. Inflight requests are shared. */
// Resolve the host's active fetch inside the request, retaining its global receiver.
// Some hosted runtimes replace fetch after module initialization; do not capture the startup implementation.
export function createOfficialRateLoader(fetcher: typeof fetch=(input,init)=>globalThis.fetch(input,init), clock:()=>Date=()=>new Date()) {
  let cached:RateResponse|undefined, expires=0, cachedDayKey='', pending:Promise<RateResponse>|undefined;
  return async function load():Promise<RateResponse>{
    const now=clock();
    // Refresh at each source's midnight, but do not hammer a source whose latest publication is older.
    const dayKey=sourceCurrencies.map(currency=>sourceDay(currency,now)).join('|');
    if(cached&&now.getTime()<expires&&cachedDayKey===dayKey)return cached;
    if(pending)return pending;
    pending=(async()=>{
      const results=await Promise.allSettled([
        officialText(BCV_ENDPOINT,fetcher).then(text=>parseBcv(text,clock())),
        officialText(TRM_ENDPOINT,fetcher).then(text=>parseTrm(JSON.parse(text),clock())),
        officialText(ECB_ENDPOINT,fetcher).then(text=>parseEcb(text,clock())),
      ]);
      const rates:OfficialRate[]=[],unavailable:SourceCurrency[]=[];
      results.forEach((result,index)=>{
        if(result.status==='fulfilled')rates.push(result.value);
        else {
          const currency=sourceCurrencies[index];unavailable.push(currency);
          // Diagnose provider failures without logging response bodies or visitor data.
          const message=result.reason instanceof Error?result.reason.message:'';
          const reason=/^Official source HTTP \d{3}$/.test(message)?message
            :message==='Official source redirect refused'?'redirect_refused'
            :message==='No TRM effective for today'?'no_current_trm'
            :message==='BCV daily rate could not be verified'?'bcv_unverified'
            :message==='ECB reference could not be verified'?'ecb_unverified'
            :message==='Official source response too large'?'response_too_large'
            :message==='Official source body unavailable'?'body_unavailable'
            :message==='Invalid TRM response'?'invalid_trm_shape'
            :result.reason?.name==='AbortError'?'request_timeout'
            :result.reason?.name==='ZodError'?'rate_validation_failed'
            :result.reason instanceof SyntaxError?'invalid_json'
            :result.reason instanceof TypeError?'fetch_type_error':'request_failed';
          const detail=result.reason instanceof TypeError?message.replace(/[\r\n]/g,' ').slice(0,200):undefined;
          console.warn('Official exchange rate unavailable',{currency,reason,...(detail?{detail}:{}),...(result.reason instanceof BcvUnverifiedError?{bcv:result.reason.diagnostic}:{})});
        }
      });
      cached={version:1,rates,unavailable};cachedDayKey=dayKey;expires=clock().getTime()+RATE_REFRESH_MS;return cached;
    })();
    try{return await pending;}finally{pending=undefined;}
  };
}
