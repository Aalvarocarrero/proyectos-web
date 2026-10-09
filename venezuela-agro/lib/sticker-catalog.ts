import assets from "@/lib/sticker-assets.json";
import labels from "@/lib/sticker-labels.json";
export type StickerAsset={id:string;name:string;familyId:string;familyName:string;aliases:string[];pairId?:string;characterVariant?:"woman"|"man";thumbnail:{src:string;width:number;height:number;bytes:number};download:{src:string;width:number;height:number;bytes:number};compactDownload?:{src:string;width:number;height:number;bytes:number}};
export type StickerPack={id:string;name:string;src:string;bytes:number;itemIds:string[]};
const approvedLabels:Record<string,{name:string;aliases:string[]}>=labels;
export const stickers:StickerAsset[]=(assets.items as StickerAsset[]).map(item=>{const label=approvedLabels[item.id];return {...item,...(label?{name:label.name,aliases:Array.from(new Set([...item.aliases,item.name,...label.aliases]))}:{}),familyName:item.familyId==="agricultores-animales"?"Productores de animales":item.familyId==="agricultores-cosecha"?"Cosechadores del campo":item.familyName};});
export const stickerPacks=assets.packs as StickerPack[];
export function normalizedStickerSearch(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es").trim();}
export function filterStickers(items:StickerAsset[],query:string,family:string,variant:""|"woman"|"man"|"none"=""){const terms=normalizedStickerSearch(query).split(/\s+/).filter(Boolean);return items.filter(item=>(!family||item.familyId===family)&&(!variant||(variant==="none"?!item.characterVariant:item.characterVariant===variant))&&terms.every(term=>normalizedStickerSearch([item.name,item.familyName,...item.aliases].join(" ")).includes(term)));}
export function stickerSize(bytes:number){return bytes<1024*1024?`${Math.ceil(bytes/1024)} KB`:`${(bytes/1024/1024).toLocaleString("es-VE",{maximumFractionDigits:1})} MB`;}
