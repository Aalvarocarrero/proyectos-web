'use client';

import { useState } from 'react';
import { QuoteConversion } from '@/components/quote-conversion';
import { PriceConversion } from '@/components/price-conversion';
import { currencyLabels, currencies, formatMoney } from '@/lib/exchange-rates';
import { professionalTariffSchema, serviceModes, tariffUnits, type ProfessionalTariff } from '@/lib/professional-profile';

type TariffDraft = { mode: ProfessionalTariff['mode']; amount: string; currency: ProfessionalTariff['currency']; unit: ProfessionalTariff['unit'] };
export function tariffsToDraft(tariffs: ProfessionalTariff[]): TariffDraft[] {
  return tariffs.map(tariff => ({ ...tariff, amount: String(tariff.amount) }));
}
export function ProfessionalTariffFields({value,onChange}:{value:TariffDraft[];onChange:(value:TariffDraft[])=>void}) {
  const [expanded,setExpanded]=useState(value.length>0);
  function update(mode:ProfessionalTariff['mode'],patch:Partial<TariffDraft>){onChange(value.map(row=>row.mode===mode?{...row,...patch}:row));}
  return <details open={expanded} onToggle={event=>setExpanded(event.currentTarget.open)} className="sm:col-span-2 min-w-0 rounded-2xl border bg-white p-4">
    <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Tarifas por modalidad (opcional)</summary>
    <p className="mt-2 text-sm leading-6 text-[#675f57]">Activa solo las modalidades para las que quieras publicar un costo. Indica el importe original y qué incluye; las demás quedan a consultar.</p>
    <div className="mt-4 space-y-3">{serviceModes.map((mode,index)=>{const tariff=value.find(row=>row.mode===mode);const valid=tariff?professionalTariffSchema.safeParse({...tariff,amount:tariff.amount.trim()?Number(tariff.amount):NaN}):null;return <fieldset key={mode} className="min-w-0 rounded-xl border p-3">
      <label className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" className="size-5" checked={!!tariff} onChange={event=>onChange(event.target.checked?[...value,{mode,amount:'',currency:'USD',unit:mode==='Jornadas de campo'?'jornada':mode==='Visitas programadas'?'visita':mode==='Capacitación presencial o virtual'?'curso':'sesión'}]:value.filter(row=>row.mode!==mode))}/>{mode}</label>
      {tariff&&<div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-semibold">Importe<input name={`tariff-amount-${index}`} type="number" inputMode="decimal" min="0.01" max="20000000" step="0.01" required value={tariff.amount} onChange={event=>update(mode,{amount:event.target.value})} className="mt-2 min-h-12 w-full rounded-md border bg-white px-3"/></label>
        <label className="text-sm font-semibold">Moneda<select name={`tariff-currency-${index}`} value={tariff.currency} onChange={event=>update(mode,{currency:event.target.value as ProfessionalTariff['currency']})} className="mt-2 min-h-12 w-full rounded-md border bg-white px-3">{currencies.map(currency=><option key={currency} value={currency}>{currencyLabels[currency]}</option>)}</select></label>
        <label className="text-sm font-semibold">Precio por<select name={`tariff-unit-${index}`} value={tariff.unit} onChange={event=>update(mode,{unit:event.target.value as ProfessionalTariff['unit']})} className="mt-2 min-h-12 w-full rounded-md border bg-white px-3">{tariffUnits.map(unit=><option key={unit}>{unit}</option>)}</select></label>
        {valid?.success&&<div className="sm:col-span-3"><PriceConversion amount={valid.data.amount} currency={valid.data.currency} unit={valid.data.unit}/></div>}
      </div>}
    </fieldset>;})}</div>
    <p className="mt-4 text-xs leading-6 text-[#675f57]">Las tarifas son declaradas por ti y se publican tras revisión. Detalla traslados, materiales, impuestos y condiciones en «¿Cómo se reserva tu servicio?». El acuerdo y cualquier pago se coordinan directamente.</p>
  </details>;
}

export function ProfessionalTariffs({tariffs,demo=false}:{tariffs:ProfessionalTariff[];demo?:boolean}) {
  return <section className="mt-7 rounded-2xl border bg-white p-4 sm:p-5"><h3 className="text-lg font-bold">Tarifas por modalidad</h3>
    {!tariffs.length?<><p className="mt-3 text-sm leading-6 text-[#675f57]">Precio a consultar. Este perfil no ha publicado tarifas.</p><QuoteConversion context="Servicio profesional" demo={demo}/></>:<><p className="mt-2 text-xs leading-6 text-[#675f57]">{demo?'Importes ficticios de demostración, sin contratación.':'Importes publicados por el profesional. Confirma alcance, traslados, materiales e impuestos antes de acordar el servicio.'}</p><div className="mt-4 space-y-4">{tariffs.map(tariff=><article key={tariff.mode} className="rounded-xl border p-4"><h4 className="text-sm font-semibold">{tariff.mode}</h4><p className="mt-2 text-lg font-bold text-[#365026]">{formatMoney(tariff.amount,tariff.currency)} <span className="text-sm font-normal">por {tariff.unit}</span></p><PriceConversion amount={tariff.amount} currency={tariff.currency} unit={tariff.unit}/></article>)}</div></>}
  </section>;
}

/** The selected modality (or first published one), never a minimum across currencies. */
export function ProfessionalTariffSummary({tariffs,mode,demo=false,name}:{tariffs:ProfessionalTariff[];mode?:string;demo?:boolean;name:string}) {
  const tariff=mode?tariffs.find(row=>row.mode===mode):tariffs[0];
  if(!tariff)return <QuoteConversion context={`${mode||"Servicio"} de ${name}`} demo={demo}/>;
  return <div className="relative z-10 mt-3 min-w-0 rounded-xl bg-[#f8f3ea] p-3 text-[#3e2a19]">
    <p className="text-xs leading-5">{tariff.mode}{demo?' · tarifa ficticia':''}</p>
    <p className="mt-2 font-bold">{formatMoney(tariff.amount,tariff.currency)} <span className="text-sm font-normal">por {tariff.unit}</span></p>
    <PriceConversion amount={tariff.amount} currency={tariff.currency} unit={tariff.unit}/>
  </div>;
}
