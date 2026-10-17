"use client";
import {ContextualWhatsAppContact} from '@/components/contextual-whatsapp-contact';
import {useState} from "react";
import {AgroCategoryIcon} from "@/components/agro-category-icon";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog";
export const projectExampleFields=[
 ["Nombre del proyecto","Huerto piloto comunitario · ejemplo ficticio"],
 ["Rubro","Hortalizas · planificación de un proyecto"],
 ["Estado","Lara · contexto hipotético, sin ubicación real"],
 ["Contacto","Sin contacto operativo. Un proyecto real necesita los datos de su responsable."],
 ["Objetivo","Comparar alternativas para un huerto piloto de 500 m² antes de decidir una inversión. La superficie es un supuesto didáctico, no una propiedad ni una instalación disponible."],
 ["Qué tiene hoy","Un equipo ficticio de 3 personas y una lista de preguntas sobre suelo, agua, acceso y organización. No hay infraestructura, títulos ni permisos acreditados en esta muestra."],
 ["Qué necesita","Una visita técnica por acordar, evaluación del agua y suelo, y un presupuesto basado en condiciones locales. No se propone una receta de cultivo."],
 ["Aporte a la comunidad","Explorar formación y colaboración entre productores. El ejemplo no promete puestos de trabajo, cosechas ni ingresos."],
 ["Colaboración solicitada","Orientación para definir viabilidad, responsables y próximos pasos. No es una solicitud activa de dinero ni una oferta de inversión."],
] as const;
export function ProjectExample(){const[open,setOpen]=useState(false);return <section className="mt-10 rounded-2xl border border-[#4c6b3a]/20 bg-white p-5"><h2 className="flex items-center gap-3 text-xl font-bold"><AgroCategoryIcon category="Planificación"/>Cómo se presenta un proyecto</h2><p className="mt-3 text-sm leading-7">Revisa una propuesta totalmente ficticia para entender los campos. Está separada de los proyectos publicados y no completa ni envía tu formulario.</p><button className="button-light mt-4" type="button" onClick={()=>setOpen(true)}>Ver proyecto de ejemplo</button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Proyecto ficticio de demostración</DialogTitle><DialogDescription>No es una iniciativa activa ni permite contactar, donar o invertir.</DialogDescription></DialogHeader><dl className="grid gap-4">{projectExampleFields.map(([label,value])=><div key={label} className="min-w-0 border-b pb-3"><dt className="text-sm font-bold">{label}</dt><dd className="mt-1 break-words text-sm leading-7">{value}</dd></div>)}</dl><ContextualWhatsAppContact context="el proyecto Huerto piloto comunitario · ejemplo ficticio" demo/><button className="button-dark" type="button" onClick={()=>setOpen(false)}>Cerrar ejemplo</button></DialogContent></Dialog></section>;}
