"use client";
import {useState} from "react";
import examples from "@/lib/public-registration-examples.json";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog";

export function PublicFarmExamples(){
 const [selected,setSelected]=useState<string|null>(null);
 const [expanded,setExpanded]=useState(false);
 const example=examples.find(row=>row.id===selected);
 return <section className="my-8 rounded-2xl border border-[#4c6b3a]/20 bg-[#edf1e5] p-4 sm:p-6" aria-labelledby="public-farm-examples-title">
  <h2 id="public-farm-examples-title" className="font-display text-2xl sm:text-3xl">Ejemplos para presentar tu finca</h2>
  <p className="mt-3 text-sm leading-7">Elige un tipo y revisa una ficha totalmente ficticia. Son muestras de los campos del registro: no representan fincas disponibles, ofertas ni contactos reales. Abrirlas no completa ni envía tu formulario.</p>
  <button type="button" className="button-light mt-4" aria-expanded={expanded} aria-controls="registration-example-choices" onClick={()=>setExpanded(value=>!value)}>{expanded?"Ocultar ejemplos de registro":"Explorar ejemplos del formulario"}</button>
  {expanded&&<div id="registration-example-choices" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{examples.map(row=><article key={row.id} className="relative min-w-0 rounded-xl bg-white p-4"><p className="text-xs font-bold text-[#4c6b3a]">Ejemplo ficticio</p><h3 className="mt-2 break-words text-lg font-bold">{row.payload.farmType}</h3><p className="mt-2 break-words text-sm leading-6">{row.payload.rubrics}</p><button type="button" onClick={()=>setSelected(row.id)} className="stretched-card-action mt-3 min-h-11 text-sm font-semibold underline">Ver ficha de ejemplo<span className="sr-only">: {row.payload.farmType}</span></button></article>)}</div>}
  <Dialog open={!!example} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>{example?.payload.farmType} · ejemplo ficticio</DialogTitle><DialogDescription>Vista de práctica. No permite contactar, reservar ni publicar esta finca.</DialogDescription></DialogHeader>{example&&<>
   <dl className="grid min-w-0 gap-4">{[
    ["Nombre de la finca",example.payload.name],
    ["Responsable",example.payload.responsibleName],
    ["Teléfono público","Sin teléfono de ejemplo. Al registrar tu finca debes indicar y revisar tu contacto real."],
    ["Estado",example.payload.state],
    ["Municipio o zona",example.payload.municipality],
    ["Tipo de finca",example.payload.farmType],
    ["Rubros",example.payload.rubrics],
    ["Presentación",example.payload.description],
    ["Proceso de producción",example.payload.productionProcess],
    ["Productos y formas de venta",example.payload.saleOptions],
    ["Actividades públicas",example.payload.purposes.join(" · ")],
    ["Condiciones de visitas",example.payload.visitConditions],
    ["Foto o logo","Usa una imagen propia o que tengas permiso para publicar. Esta muestra no atribuye una fotografía a una finca real."],
    ["Redes y sitio web","Sin enlaces operativos de ejemplo. Son opcionales en tu registro."],
   ].map(([label,value])=><div key={label} className="min-w-0 border-b border-[#3e2a19]/10 pb-3"><dt className="text-sm font-bold">{label}</dt><dd className="mt-1 whitespace-pre-line break-words text-sm leading-7">{value}</dd></div>)}</dl>
   <p className="rounded-xl bg-[#fff7e8] p-4 text-sm leading-7">Para presentar tu finca, completa el registro con tus datos reales y confirma que estás autorizado a hacerlos públicos. Guardar una ficha requiere revisión antes de publicarse. Tu plano, inventario y costos privados no se copian a esta ficha.</p>
   <button type="button" className="button-dark" onClick={()=>setSelected(null)}>Cerrar ejemplo</button>
  </>}</DialogContent></Dialog>
 </section>;
}
