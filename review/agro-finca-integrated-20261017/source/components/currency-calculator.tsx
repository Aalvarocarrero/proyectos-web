'use client';

import { useState } from 'react';
import { PriceConversion } from '@/components/price-conversion';
import { currencies, currencyLabels, type Currency } from '@/lib/exchange-rates';

/** A local calculator for amounts supplied by the user; it never creates a product price. */
export function CurrencyCalculator({title='Convertir un importe',description,compact=false}:{title?:string;description:string;compact?:boolean}) {
  const [open,setOpen]=useState(false);
  const [amount,setAmount]=useState(''),[currency,setCurrency]=useState<Currency>('USD');
  const value=Number(amount);
  const valid=amount.trim()!==''&&Number.isFinite(value)&&value>0&&value<=20_000_000;
  return <details open={open} onToggle={event=>setOpen(event.currentTarget.open)} className={`relative z-10 min-w-0 [overflow-wrap:anywhere] rounded-2xl border border-[#4c6b3a]/20 bg-white text-[#3e2a19] ${compact?"mt-3 p-3":"mt-6 p-4 sm:p-5"}`}>
    <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold text-[#365026]">{title}</summary>
    <p className="mt-2 text-sm leading-6 text-[#675f57]">{description}</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold">Importe original<input type="number" inputMode="decimal" min="0.01" max="20000000" step="0.01" value={amount} onChange={event=>setAmount(event.target.value)} placeholder="Escribe el importe recibido" className="mt-2 min-h-12 w-full min-w-0 rounded-md border bg-white px-3"/></label>
      <label className="text-sm font-semibold">Moneda original<select value={currency} onChange={event=>setCurrency(event.target.value as Currency)} className="mt-2 min-h-12 w-full min-w-0 rounded-md border bg-white px-3">{currencies.map(code=><option key={code} value={code}>{currencyLabels[code]}</option>)}</select></label>
    </div>
    {open&&valid?<PriceConversion key={currency} amount={value} currency={currency} initiallyOpen/>:<p role="status" className="mt-3 text-xs leading-6 text-[#675f57]">{amount?'Introduce un importe mayor que cero y de hasta 20.000.000.':'Introduce un importe para elegir a qué moneda convertirlo.'}</p>}
    <p className="mt-3 text-xs leading-6 text-[#675f57]">Este cálculo es informativo y no modifica tu solicitud ni confirma precios, disponibilidad o pagos.</p>
  </details>;
}
