"use client";
import {useId,useState} from 'react';
import locations from '@/lib/venezuela-locations.json';
import {Input} from '@/components/ui/input';
import type {SurveyPlan} from '@/lib/farm-geometry';
export function FarmLocationFields({state,onStateChange,plan}:{state:string;onStateChange:(state:string)=>void;plan?:SurveyPlan}){
 const id=useId(),[municipality,setMunicipality]=useState(plan?.municipality??''),[parish,setParish]=useState(plan?.parish??'');
 const region=locations.states.find(item=>item.name===state),town=region?.municipalities.find(item=>item.name===municipality);
 return <section className="my-5 rounded-2xl border bg-white p-4" aria-label="Ubicación administrativa de la finca"><h3 className="font-display text-xl">Ubicación de tu finca</h3><p className="mt-2 text-xs leading-6 text-[#71685f]">País: Venezuela. El estado, municipio y parroquia describen la ubicación; las coordenadas y su sistema permiten situar el punto o contorno en el mapa.</p>
 <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
  <label className="min-w-0 text-sm font-semibold">Estado o territorio<Input value={state} onChange={e=>onStateChange(e.target.value)} list={`${id}-states`} placeholder="Selecciona o escribe" className="mt-2 min-h-11"/><datalist id={`${id}-states`}>{[...locations.states,...locations.otherTerritories].map(item=><option key={item.code} value={item.name}/>)}</datalist></label>
  <label className="min-w-0 text-sm font-semibold">Municipio<Input name="planMunicipality" value={municipality} onChange={e=>setMunicipality(e.target.value)} list={`${id}-municipalities`} placeholder="Selecciona o escribe el municipio" className="mt-2 min-h-11"/><datalist id={`${id}-municipalities`}>{region?.municipalities.map(item=><option key={item.code} value={item.name}/>)}</datalist></label>
  <label className="min-w-0 text-sm font-semibold">Parroquia<Input name="planParish" value={parish} onChange={e=>setParish(e.target.value)} list={`${id}-parishes`} placeholder="Selecciona o escribe la parroquia" className="mt-2 min-h-11"/><datalist id={`${id}-parishes`}>{town?.parishes.map(item=><option key={item.code} value={item.name}/>)}</datalist></label>
  <label className="min-w-0 text-sm font-semibold">Sector o comunidad<Input name="planSector" defaultValue={plan?.sector??''} placeholder="Sector, comunidad o referencia local" className="mt-2 min-h-11"/></label>
 </div>
 {municipality&&!town&&<p className="mt-3 text-xs leading-6">Conservamos el municipio escrito. Revisa que corresponda al estado; puedes mantener un nombre que no figure en el catálogo.</p>}
 {parish&&(!town||!town.parishes.some(item=>item.name===parish))&&<p className="mt-2 text-xs leading-6">Conservamos la parroquia escrita. Revisa que corresponda al municipio; puedes mantener una denominación no incluida.</p>}
 <p className="mt-3 text-xs leading-6 text-[#71685f]">Catálogo offline de referencia: INE / OCHA, 335 municipios y 1.134 registros parroquiales; base de límites de 2018, revisión de enero de 2025. Puede requerir actualización local. Dependencias Federales permite escritura manual, sin subdivisiones ficticias. <a href={locations.metadata.sourceUrl} target="_blank" rel="noreferrer" className="underline">Fuente</a> · <a href={locations.metadata.licenseUrl} target="_blank" rel="noreferrer" className="underline">CC BY3.0 IGO</a>.</p>
 </section>;
}
