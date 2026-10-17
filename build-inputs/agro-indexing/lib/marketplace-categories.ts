import { agroFamilies, agroEntries, findAgroEntry } from "@/lib/agro-catalog";
export const marketplaceRootCategories = [
  { value: "Bovinos", emoji: "🐄", group: "Animales" },
  { value: "Porcinos", emoji: "🐖", group: "Animales" },
  { value: "Aves", emoji: "🐓", group: "Animales" },
  { value: "Equinos", emoji: "🐎", group: "Animales" },
  { value: "Ovinos y caprinos", emoji: "🐐", group: "Animales" },
  { value: "Piscicultura", emoji: "🐟", group: "Animales" },
  { value: "Apicultura", emoji: "🐝", group: "Producción" },
  { value: "Cárnicos", emoji: "🥩", group: "Alimentos" },
  { value: "Genética y reproducción", emoji: "🧬", group: "Genética" },
  { value: "Verduras y hortalizas", emoji: "🥬", group: "Cultivos" },
  { value: "Frutas", emoji: "🍍", group: "Cultivos" },
  { value: "Granos y forrajes", emoji: "🌾", group: "Cultivos" },
  { value: "Semillas y plantas", emoji: "🌱", group: "Insumos" },
  { value: "Nutrición animal", emoji: "🧂", group: "Insumos" },
  { value: "Vitaminas y medicinas", emoji: "💊", group: "Insumos" },
  { value: "Fertilizantes y control", emoji: "🧪", group: "Insumos" },
  { value: "Maquinaria agrícola", emoji: "🚜", group: "Equipos" },
  { value: "Drones y tecnología", emoji: "🚁", group: "Equipos" },
  { value: "Herramientas y cercas", emoji: "🛠️", group: "Equipos" },
  { value: "Fincas y terrenos", emoji: "🏡", group: "Propiedades" },
  { value: "Servicios agropecuarios", emoji: "🤝", group: "Servicios" },
] as const;

export const marketplaceCategories = [
  ...marketplaceRootCategories,
  ...agroFamilies.filter(f=>!marketplaceRootCategories.some(r=>r.value===f.name)).map(f=>({value:f.name,emoji:f.emoji,group:f.kind})),
  ...agroEntries.filter(e=>!marketplaceRootCategories.some(r=>r.value===e.name)&&!agroFamilies.some(f=>f.name===e.name)).map(e=>({value:e.name,emoji:e.emoji,group:e.parent})),
];
export function categoryEmoji(value: string): string {
  return marketplaceCategories.find(category => category.value === value)?.emoji ?? "🌿";
}
export function categoryMatches(category:string,selected:string) {
  const parent=findAgroEntry(category)?.parent;
  if(category===selected||parent===selected)return true;
  if(selected==='Granos y forrajes')return ['Cereales','Leguminosas','Pastos, viveros y forestales'].includes(parent||category);
  if(selected==='Apicultura')return (parent||category)==='Apicultura y crías alternativas';
  return false;
}
