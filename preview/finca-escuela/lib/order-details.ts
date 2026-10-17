export type OrderLine = {name:string;quantity:number;presentation?:string;measure?:string;preparation?:string;specifications?:string};
export type OrderDetails = {items:OrderLine[];channel:"personal"|"business";business:Record<string,string>|null};
export function readOrderDetails(value:string):OrderDetails {
 try {
  const raw:unknown=JSON.parse(value);
  const envelope=Array.isArray(raw)?{items:raw}:raw && typeof raw==="object"?raw as Record<string,unknown>:{};
  const items=Array.isArray(envelope.items)?envelope.items.filter((line):line is OrderLine=>!!line&&typeof line==="object"&&typeof line.name==="string"&&typeof line.quantity==="number"):[];
  const business="business" in envelope && envelope.business && typeof envelope.business==="object"?Object.fromEntries(Object.entries(envelope.business).filter((entry):entry is [string,string]=>typeof entry[1]==="string")):null;
  return {items,channel:"channel" in envelope&&envelope.channel==="business"?"business":"personal",business};
 }catch{return {items:[],channel:"personal",business:null};}
}
export function describeOrder(order:OrderDetails & {phone?:string|null;email?:string|null;note?:string|null}):string {
 return [order.phone,order.email,order.channel==="business"?"Cotización empresarial":"Solicitud particular",...order.items.map(item=>[`${item.quantity} ${item.measure||"unidad"} · ${item.name}`,item.presentation,item.preparation,item.specifications].filter(Boolean).join(" · ")),order.business?Object.values(order.business).filter(Boolean).join(" · "):null,order.note].filter(Boolean).join("\n");
}
