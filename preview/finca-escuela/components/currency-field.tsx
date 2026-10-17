'use client';
import { currencies, currencyLabels, type Currency } from '@/lib/exchange-rates';
export function CurrencyField({name='currency',value,defaultValue='USD',onChange,label='Moneda original'}:{name?:string;value?:Currency;defaultValue?:Currency;onChange?:(currency:Currency)=>void;label?:string}) {
  return <label className="block min-w-0 text-sm font-semibold">{label}<select name={name} {...(value===undefined?{defaultValue}:{value})} onChange={event=>onChange?.(event.target.value as Currency)} className="mt-2 min-h-12 w-full rounded-md border bg-white px-3 text-[#3e2a19]">{currencies.map(currency=><option key={currency} value={currency}>{currencyLabels[currency]}</option>)}</select></label>;
}
