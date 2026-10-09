import {professionalDemoPortraits} from "./professional-demo-portraits";
import { agroFamilies } from "@/lib/agro-catalog";
import { socialSchema } from "@/lib/network-profile";
import { z } from "zod";
import { venezuelanStates } from "@/lib/venezuela";
export const serviceModes = ["Presencial", "Remoto", "Presencial y remoto", "Visitas programadas", "Jornadas de campo", "Capacitación presencial o virtual"] as const;
export const agroSectors = [...new Set(["Bovinos", "Porcinos", "Aves", "Equinos", "Piscicultura", "Apicultura", "Cacao", "Café", "Pastos y forrajes", "Suelos y riego", "Maquinaria y drones", "Gestión y comercialización", ...agroFamilies.map(f=>f.name)])];
const link = z.string().trim().max(500).default("").refine(v=> !v || (()=>{try {const u=new URL(v);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}})(),"Usa un enlace completo https://…");
export const professionalDetailsSchema = z.object({
 profileType:z.enum(["Persona natural","Empresa"]).default("Persona natural"),
 corporateName:z.string().trim().max(180).default(""),tradeName:z.string().trim().max(180).default(""),
 registrationBody:z.string().trim().max(180).default(""),registrationReference:z.string().trim().max(180).default(""),
 taxId:z.string().trim().max(80).default(""),responsibleName:z.string().trim().max(120).default(""),
 bookingProcess:z.string().trim().max(1200).default(""),availability:z.string().trim().max(500).default(""),
 socials:socialSchema.default({}),
 yearsExperience: z.number().int().min(0).max(80).default(0),
 careerStage: z.enum(["Recién graduado", "En ejercicio", "Especialista", "Consultor / trayectoria avanzada"]).default("En ejercicio"),
 university: z.string().trim().max(180).default(""), degree: z.string().trim().max(180).default(""),
 graduationYear: z.string().regex(/^$|^(19|20)\d{2}$/).default(""),
 training: z.string().trim().max(1800).default(""), trajectory: z.string().trim().max(2400).default(""),
 projects: z.string().trim().max(2400).default(""), services: z.string().trim().max(1800).default(""),
 coverageStates: z.array(z.enum(venezuelanStates)).max(24).default([]),
 sectors: z.array(z.string().trim().min(1).max(80)).max(40).default([]),
 email: z.union([z.literal(""),z.string().email()]).default(""),
 whatsapp: z.boolean().default(false), website:link, linkedin:link, instagram:link,
 imageKey:z.string().regex(/^marketplace\/(?:[a-zA-Z0-9_%.-]+\/){1,4}cover\.(webp|jpg|png)$/).optional(),
 imageDataUrl:z.string().max(650000).regex(/^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/).optional(),
}).superRefine((d,ctx)=>{if(d.profileType==="Empresa"&&!d.corporateName)ctx.addIssue({code:z.ZodIssueCode.custom,path:["corporateName"],message:"Escribe el nombre corporativo de la empresa."});});
export type ProfessionalDetails = z.infer<typeof professionalDetailsSchema>;
export type ProfessionalRecord = {id:string;name:string;profession:string;specialties:string;state:string;municipality:string;serviceMode:string;introduction:string;contact:string;credentialNote:string;updatedAt?:string;demo?:boolean;founder?:boolean;details?:ProfessionalDetails;};
export function professionalDetails(row:ProfessionalRecord):ProfessionalDetails {
 if(row.details) return professionalDetailsSchema.parse(row.details);
 try {const parsed=JSON.parse(row.credentialNote);return professionalDetailsSchema.parse(parsed.details);}catch{return professionalDetailsSchema.parse({});}
}
export function professionalCredential(row:ProfessionalRecord) {try {return JSON.parse(row.credentialNote).credentialNote || "";}catch{return row.credentialNote;}}
export function professionalKeywords(row:ProfessionalRecord) {
 const d=professionalDetails(row);
 return [...new Set([row.profession,...row.specialties.split(/[,;·]/),...d.sectors,row.state,...d.coverageStates,"agro venezolano"].map(x=>x.trim()).filter(Boolean))].slice(0,24);
}
export function professionalSeo(row:ProfessionalRecord) {return {title:`${row.name} · ${row.profession} en ${row.state}`,description:`${row.name}: ${row.profession}. ${row.introduction} Atención ${row.serviceMode.toLowerCase()} en ${[row.state,...professionalDetails(row).coverageStates].filter((x,i,a)=>a.indexOf(x)===i).join(', ')}.`.slice(0,160),keywords:professionalKeywords(row)};}
export function professionalImage(row:ProfessionalRecord) {const key=professionalDetails(row).imageKey;return key?`/api/media/${key}`:row.demo?(professionalDemoPortraits.find(photo=>photo.id===row.id)?.src??null):null;}
