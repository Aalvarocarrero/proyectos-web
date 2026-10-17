'use client';
import { useCallback, useId, useState, useSyncExternalStore } from 'react';
import { currencies, currencyLabels, conversionTarget, conversionRates, convertPrice, formatMoney, formatRateConsultation, formatRateDay, RATE_SOURCES, rateIsCurrent, type Currency, type SourceCurrency, type RateSnapshot } from '@/lib/exchange-rates';

import { exchangeRateClient } from '@/lib/exchange-rate-client';

type ReferenceState = {snapshot:RateSnapshot;offline:boolean;busy:boolean;failed:SourceCurrency[]};
/** Read-only price presentation. Identity conversions need no exchange rate. */
export function PriceReferenceSummary({amount,currency,unit,allowNegative=false,snapshot,offline,busy,failed}:{amount:number;currency:string;unit?:string;allowNegative?:boolean}&ReferenceState) {
  const from=currencies.includes(currency as Currency)?currency as Currency:null;
  const rows=(['USD','VES'] as const).map(target=>{
    const unsigned=from?convertPrice(allowNegative?Math.abs(amount):amount,from,target,snapshot):null;
    return {target,value:unsigned!==null&&allowNegative&&amount<0?-unsigned:unsigned};
  });
  const needed=[...new Set(rows.flatMap(({target})=>from&&target!==from?[from,target].filter(value=>value!=='USD') as SourceCurrency[]:[]))];
  const rates=needed.map(value=>snapshot.rates.find(rate=>rate.currency===value));
  const outdated=rates.some(rate=>rate&&!rateIsCurrent(rate));
  const failedUpdate=needed.some(value=>failed.includes(value));
  const hasEstimate=rows.some(row=>row.target!==from&&row.value!==null);
  return <div data-visible-base-prices aria-label="Equivalentes en dólares y bolívares" className="min-w-0 space-y-2">
    <p className="text-xs font-semibold text-[#365026]">Referencia{unit?` por ${unit}`:''}</p>
    <dl className="grid min-w-0 gap-2" aria-live="polite" aria-atomic="true">{rows.map(({target,value})=><div key={target} className="min-w-0 rounded-lg bg-white/80 px-3 py-2"><dt className="text-xs text-[#675f57]">{currencyLabels[target]}{from===target?' · original':''}</dt><dd className="mt-1 text-sm font-bold leading-6">{value!==null?`${from===target?'':'≈ '}${formatMoney(value,target)}`:busy?'Consultando tasa…':'Sin tasa verificada'}</dd></div>)}</dl>
    {hasEstimate&&(offline||outdated||failedUpdate)&&<p className="rounded-lg bg-[#fff0d5] px-3 py-2 text-xs leading-5 text-[#714811]">{offline?'Sin conexión: equivalencias estimadas con la última tasa guardada.':outdated?'Tasa con fecha anterior: equivalencias estimadas.':'No se pudo actualizar: equivalencias estimadas con la última tasa guardada.'}</p>}
    <div className="space-y-1 text-xs leading-5 text-[#675f57]">{needed.map((value,index)=>{const rate=rates[index];return <p key={value}><a href={RATE_SOURCES[value].url} target="_blank" rel="noreferrer" className="underline">{value==='VES'?'BCV':value==='EUR'?'BCE':'TRM Colombia'}</a>{rate?` · ${formatRateDay(rate.validFrom)}${rate.validTo!==rate.validFrom?` al ${formatRateDay(rate.validTo)}`:''}`:' · tasa verificada no disponible'}</p>;})}</div>
    {from&&from!=='USD'&&from!=='VES'&&hasEstimate&&<p className="text-xs leading-5 text-[#675f57]">Equivalencia entre monedas calculada a través del dólar con ambas fuentes.</p>}
    <p className="text-xs leading-5 text-[#675f57]">El precio original no cambia. Equivalencias informativas.</p>
  </div>;
}

/** Optional and public: sends neither listing price nor account information to rate providers. */
export function PriceConversion({amount=1,currency='USD',unit,reference=false,initiallyOpen=false,allowNegative=false,showBasePrices=false}:{amount?:number;currency?:string;unit?:string;reference?:boolean;initiallyOpen?:boolean;allowNegative?:boolean;showBasePrices?:boolean}) {
  const [open,setOpen]=useState(initiallyOpen),[targetPreference,setTarget]=useState<Currency>(currency==='VES'?'USD':'VES');
  const id=useId();
  const active=open||showBasePrices;
  const subscribe=useCallback((listener:()=>void)=>active?exchangeRateClient.subscribe(listener):()=>{},[active]);
  const {snapshot,offline,busy,failed,storageWarning}=useSyncExternalStore(subscribe,exchangeRateClient.getSnapshot,exchangeRateClient.getServerSnapshot);
  const from=currencies.includes(currency as Currency)?currency as Currency:null;
  const target=conversionTarget(from,targetPreference);
  const required=from?conversionRates(from,target,snapshot):[];
  const unsigned=from?convertPrice(allowNegative?Math.abs(amount):amount,from,target,snapshot):null;
  const converted=unsigned!==null&&allowNegative&&amount<0?-unsigned:unsigned;
  const outdated=required.some(rate=>rate&&!rateIsCurrent(rate));
  const unavailable=required.some(rate=>!rate) || required.some(rate=>rate&&failed.includes(rate.currency));
  const estimate=offline||outdated||unavailable;
  return <section className={`relative z-10 mt-3 min-w-0 [overflow-wrap:anywhere] rounded-xl text-[#3e2a19] border border-[#4c6b3a]/20 ${reference?'bg-white p-4':'bg-[#f3f6ee] p-3'}`} aria-label="Cambio oficial de referencia" data-price-conversion>
    {showBasePrices&&<><PriceReferenceSummary amount={amount} currency={currency} unit={unit} allowNegative={allowNegative} snapshot={snapshot} offline={offline} busy={busy} failed={failed}/><div className="mt-3 flex flex-wrap gap-2" aria-label="Consultar euros o pesos">{(['EUR','COP'] as const).map(value=>value===from?<span key={value} className="px-3 py-2 text-xs font-semibold">{value} · moneda original</span>:<button key={value} type="button" aria-controls={id} aria-label={`Ver equivalente en ${currencyLabels[value]}`} onClick={()=>{setTarget(value);setOpen(true);}} className="min-h-11 rounded-full border border-[#4c6b3a]/30 bg-white px-4 text-sm font-semibold text-[#365026]">{value}</button>)}</div></>}
    <button type="button" onClick={()=>setOpen(value=>!value)} aria-expanded={open} aria-controls={id} className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm font-semibold text-[#365026]">{reference?'Cambio de referencia · dólares, euros, bolívares y pesos':showBasePrices?'Fuentes y otras monedas':'Ver precio aproximado en otra moneda'}<span aria-hidden="true">{open?'−':'+'}</span></button>
    {open&&<div id={id} className="mt-2 space-y-3 text-sm leading-6">
      {reference&&<p>Consulta cuánto equivale 1 dólar. La tasa es diaria; puede mantenerse durante fines de semana y feriados.</p>}
      <label className="block font-semibold">Ver en<select value={target} onChange={event=>setTarget(event.target.value as Currency)} className="mt-1 min-h-11 w-full min-w-0 rounded-lg border bg-white px-3">{currencies.filter(value=>value!==from).map(value=><option key={value} value={value}>{currencyLabels[value]}</option>)}</select></label>
      <p role="status" aria-live="polite" className="font-bold text-[#3e2a19]">{converted!==null?`${formatMoney(amount,currency)} ≈ ${formatMoney(converted,target)}${unit?` por ${unit}`:''}`:busy?'Consultando la fuente oficial…':'Conversión no disponible: falta una tasa oficial verificada.'}</p>
      {converted!==null&&estimate&&<p className="rounded-lg bg-[#fff0d5] p-3 text-[#714811]">{offline?'Sin conexión. Este es un precio estimado con la última tasa consultada con internet.':outdated?'La referencia tiene una fecha anterior. Este importe es solo estimado; revisa abajo la fecha de cada fuente.':'No pudimos actualizar la fuente oficial. Se muestra un estimado con la última tasa consultada.'}</p>}
      {converted===null&&offline&&<p className="rounded-lg bg-[#fff0d5] p-3">Sin conexión y sin una tasa guardada para estas monedas. Conservamos el precio original.</p>}
      {required.map((rate,index)=>rate?<div key={rate.currency} className="text-xs leading-5 text-[#675f57]"><p><a href={RATE_SOURCES[rate.currency].url} target="_blank" rel="noreferrer" className="underline">{RATE_SOURCES[rate.currency].name}</a> · {rate.currency==='EUR'?`1 EUR = USD ${(1/rate.perUsd).toLocaleString('es-VE',{maximumFractionDigits:8})}`:`1 USD = ${rate.currency} ${rate.perUsd.toLocaleString('es-VE',{maximumFractionDigits:8})}`}</p><p>Fecha de la tasa: {formatRateDay(rate.validFrom)}{rate.validTo!==rate.validFrom?` al ${formatRateDay(rate.validTo)}`:''}.</p><p>Última consulta a la fuente: {formatRateConsultation(rate.fetchedAt)}.</p>{rate.currency==='COP'&&<p>Datos TRM: <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="underline">CC BY-SA 4.0</a>. Conversión calculada por Venezuela Agro.</p>}{rate.currency==='EUR'&&<p>Referencia informativa del BCE, normalmente publicada en días laborables. Equivalencia calculada por Venezuela Agro; no es una cotización para ejecutar pagos. <a href="https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html" target="_blank" rel="noreferrer" className="underline">Fuente gratuita y condiciones de reutilización</a>.</p>}</div>:<p key={`missing-${index}`} className="text-xs text-[#8d372a]">{RATE_SOURCES[[...new Set([from,target].filter(value=>value&&value!=='USD'))][index] as SourceCurrency]?.name||'Fuente oficial'}: no hay una tasa verificada disponible.</p>)}
      {from&&from!=='USD'&&target!=='USD'&&from!==target?<p className="text-xs">Equivalencia calculada a través del dólar usando ambas fuentes; no es una cotización directa {from}/{target}.</p>:null}
      <p className="text-xs text-[#675f57]">{reference?'Consulta informativa.':'El importe conserva su moneda original.'} Confirma moneda, precio y condiciones antes de acordar la compra o el servicio. Los convertidores comparten una consulta automática por hora mientras hay precios visibles o un convertidor abierto y hay conexión. También se revisan al recuperar señal o cambiar la fecha oficial; las fuentes pueden retrasarse.</p>
      {storageWarning&&<p className="text-xs text-[#8d372a]">El navegador no pudo guardar la tasa. Puede no estar disponible al cerrar o perder la conexión.</p>}
      <button type="button" disabled={busy||offline} onClick={()=>void exchangeRateClient.refresh(true)} className="min-h-11 rounded-full border border-[#4c6b3a]/30 bg-white px-4 font-semibold disabled:opacity-50">{busy?'Consultando…':'Consultar de nuevo'}</button>
    </div>}
  </section>;
}
