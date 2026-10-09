import {planAreaUse,type PlanAreaUse} from './farm-plan-presentation';
export type AerialUse=PlanAreaUse|'tank'|'compost'|'nursery';
export type Vegetation='canopy'|'coffee'|'banana'|'leafy'|null;
const normal=(value:unknown)=>typeof value==='string'?value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase():'';
export function aerialDescriptor(category:string,title:string,data:Record<string,unknown>={}){
 const usage=normal(category)+(category==='Otro'?' '+normal(data.usage):'');let use:AerialUse=planAreaUse(category,title);
 if(/cabana/.test(usage))use='house';else if(/gallinero|porqueriza|establo|porcinera/.test(usage))use='barn';else if(/estanque|jaguey/.test(usage))use='water';else if(/tanque|captacion/.test(usage))use='tank';else if(/compost|lombric/.test(usage))use='compost';else if(/vivero|almacigo/.test(usage))use='nursery';else if(/invernadero|casa de cultivo/.test(usage))use='greenhouse';else if(category==='Otro'&&data.usage)use=planAreaUse(String(data.usage));
 const crop=normal(data.crop);let vegetation:Vegetation=null;
 if(use==='forest')vegetation='canopy';else if(use==='crop'||use==='nursery'){
  if(/cafe/.test(crop))vegetation='coffee';else if(/platano|cambur|banano/.test(crop))vegetation='banana';else if(/cacao|frutal|mango|aguacate|naranja|mandarina|limon|citric/.test(crop))vegetation='canopy';else if(/lechuga|acelga|espinaca|repollo|hortaliza.*hoja/.test(crop))vegetation='leafy';
 }
 return {use,vegetation};
}
export type Point={x:number;y:number};
export function insidePolygon(point:Point,vertices:ReadonlyArray<Point>){let inside=false;for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){const a=vertices[i],b=vertices[j];if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
function distanceToEdge(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
/** A sampled interior circle keeps a compact facility symbol inside a concave saved outline. */
export function aerialAnchor(layout:{x:number;y:number;width:number;height:number},vertices?:ReadonlyArray<Point>){
 if(!vertices||vertices.length<3)return {x:layout.x+layout.width/2,y:layout.y+layout.height/2,radius:Math.min(layout.width,layout.height)*.65};
 let best:{x:number;y:number;radius:number}|null=null;
 for(let r=0;r<13;r++)for(let c=0;c<13;c++){const p={x:layout.x+(c+.5)/13*layout.width,y:layout.y+(r+.5)/13*layout.height};if(!insidePolygon(p,vertices))continue;const radius=Math.min(...vertices.map((a,i)=>distanceToEdge(p,a,vertices[(i+1)%vertices.length])))*.9;if(!best||radius>best.radius)best={...p,radius};}
 return best;
}
export function seededVariation(id:string,index:number){let hash=2166136261;for(const char of id)hash=Math.imul(hash^char.charCodeAt(0),16777619);return ((hash>>>0)+index*2654435761>>>0)%1000/1000;}
export function aerialAreaName(title:string,width:number,height:number,pixelsPerUnit:number,customOutline=false,category=''){
 const w=width*pixelsPerUnit,h=height*pixelsPerUnit;if(customOutline||w<60||h<55)return null;
 const plain=title.replace(/\s*·\s*ejemplo\b/gi,'').trim(),limit=Math.floor((w-12)/6.5);
 const labels:Record<string,string>={'Otro':'Por definir','Casa':'Casa','Galpón':'Galpón','Depósito':'Depósito','Laguna / agua':'Laguna','Vaquera / corrales':'Corral','Bosque / reserva':'Bosque','Vías':'Acceso','Tanque de agua':'Tanque','Compostera':'Compostera','Invernadero':'Invernadero','Vivero':'Vivero'};
 if(category==='Laguna / agua'&&limit>=6)return 'Laguna';if(plain.length<=limit)return plain;const short=labels[category];if(!short)return null;if(short.length<=limit)return short;
 const words=short.split(' ');if(words.length===2&&words.every(word=>word.length<=limit)&&h>=75)return words.join('\n');return null;
}
