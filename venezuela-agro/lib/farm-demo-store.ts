import fixture from "@/lib/farm-demo-fixture.json";
import type {FarmPayload,FarmRecordPayload,ListingPayload} from "@/lib/farm-types";
import {farmPayloadSchema,farmRecordPayloadSchema} from "@/lib/sync-validation";

export const DEMO_DB_NAME="venezuela-agro-demonstration-v1";
export type DemoRow<T>={id:string;payload:T};
export type DemoState={version:1;fixtureVersion?:number;revision:number;generation:number;updatedAt:string;farms:DemoRow<FarmPayload>[];records:DemoRow<FarmRecordPayload>[];listings:DemoRow<ListingPayload>[]};
const EVENT="venezuela-agro-demo-change";
const key="workspace";
function initial():DemoState{return {version:1,fixtureVersion:fixture.metadata.version,revision:0,generation:0,updatedAt:new Date().toISOString(),farms:structuredClone(fixture.farms) as DemoRow<FarmPayload>[],records:structuredClone(fixture.records) as DemoRow<FarmRecordPayload>[],listings:structuredClone(fixture.listings)}};
function open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open(DEMO_DB_NAME,1);r.onupgradeneeded=()=>r.result.createObjectStore("demo");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function announce(){if(typeof window!=="undefined")window.dispatchEvent(new Event(EVENT));}
export function subscribeDemo(callback:()=>void){window.addEventListener(EVENT,callback);return()=>window.removeEventListener(EVENT,callback);}
/** One transaction reads and writes the isolated demo. No outbox, identity or server API exists here. */
async function transaction(change?:(state:DemoState)=>DemoState):Promise<DemoState>{
 const db=await open();return new Promise((resolve,reject)=>{
  const tx=db.transaction("demo","readwrite"),store=tx.objectStore("demo"),request=store.get(key);let result:DemoState;let failure:unknown;
  request.onsuccess=()=>{try{const existing=request.result as DemoState|undefined;const state=existing??initial();result=change?change(structuredClone(state)):state;if(!existing||change)store.put(result,key);}catch(error){failure=error;tx.abort();}};
  tx.oncomplete=()=>{db.close();if(change)announce();resolve(structuredClone(result));};
  tx.onerror=tx.onabort=()=>{db.close();reject(failure??tx.error??new Error("No se pudo guardar la demostración en este dispositivo."));};
 });
}
export const loadDemo=()=>transaction();
export async function resetDemo(expectedRevision:number){return transaction(state=>{if(state.revision!==expectedRevision)throw new Error("Revisa: la demostración cambió en otra pestaña. Actualiza antes de restablecerla.");return {...initial(),revision:state.revision+1,generation:state.generation+1};});}
export async function mutateDemo(expectedRevision:number,change:(state:DemoState)=>void){return transaction(state=>{if(state.revision!==expectedRevision)throw new Error("Revisa: la demostración cambió. Vuelve a abrir el registro antes de guardar.");change(state);validateState(state);state.revision++;state.updatedAt=new Date().toISOString();return state;});}
function validateState(state:DemoState){
 if(state.farms.length>1||state.records.length>2000||state.listings.length>100)throw new Error("Revisa: se alcanzó el límite de ejemplos.");
 state.farms=state.farms.map(row=>({...row,payload:normalizedDemoFarm(row.payload)}));
 state.records=state.records.map(row=>({...row,payload:normalizedDemoRecord(row.payload)}));
 const ids=new Set(state.records.map(row=>row.id));if(ids.size!==state.records.length)throw new Error("Revisa: un identificador de ejemplo está repetido.");
 const farm=state.farms[0];
 if(state.records.some(r=>r.payload.farmId!==farm?.id))throw new Error("Revisa: el registro no pertenece a la finca de demostración.");
 for(const row of state.records)if(row.payload.recordType==="weight"&&!state.records.some(a=>a.id===row.payload.data.animalId&&a.payload.recordType==="animal"))throw new Error("Revisa: el pesaje necesita un animal de la demostración.");
 const allocated=state.records.filter(r=>r.payload.recordType==="area").reduce((n,r)=>n+Number(r.payload.data.areaSqM??0),0);
 if(farm&&allocated>farm.payload.areaSqM)throw new Error("Revisa: la suma de áreas supera la superficie de la finca ficticia.");
 for(const row of state.listings){if(!row.payload.title.trim()||row.payload.title.length>160||row.payload.category.length>80)throw new Error("Revisa: completa el título y la categoría del borrador.");row.payload.status="draft";}
}
export function normalizedDemoRecord(payload:FarmRecordPayload):FarmRecordPayload{
 const row=farmRecordPayloadSchema.parse(payload) as FarmRecordPayload;
 for(const value of Object.values(row.data)){if(typeof value==="number"&&(!Number.isFinite(value)||Math.abs(value)>2_000_000_000))throw new Error("Revisa: hay una cantidad fuera de rango.");if(typeof value==="string"&&value.length>3000)throw new Error("Revisa: una nota es demasiado larga.");}
 for(const [key,value] of Object.entries(row.data))if(typeof value==="number"&&value<0)throw new Error(`Revisa: ${key} no puede ser negativo.`);
 if(row.recordType==="area"&&Number(row.data.areaSqM??0)<=0)throw new Error("Revisa: el área debe ser mayor que cero.");
 if(row.recordType==="weight"&&Number(row.data.weightKg??0)<=0)throw new Error("Revisa: el peso debe ser mayor que cero.");
 if(row.recordType==="plan"){
  const n=(k:string)=>Number(row.data[k]??0);const quantity=n("quantity"),days=n("days"),cost=n("costPerUnit");
  row.data.totals={feed:quantity*n("feedPerUnit"),water:quantity*days*n("waterPerUnitDay"),area:quantity*n("areaPerUnit"),variableCost:quantity*cost,margin:n("expectedRevenue")-quantity*cost};
 }
 return row;
}
export function normalizedDemoFarm(payload:FarmPayload):FarmPayload{const farm=farmPayloadSchema.parse(payload) as FarmPayload;if(farm.areaSqM<=0)throw new Error("Revisa: la superficie debe ser mayor que cero.");return farm;}
export function demoTemplate(type:FarmRecordPayload["recordType"]):FarmRecordPayload{
 const record=fixture.records.find(r=>r.payload.recordType===type);if(!record)throw new Error("Tipo de ejemplo desconocido");const payload=structuredClone(record.payload) as FarmRecordPayload;delete payload.data.areaId;delete payload.data.demoPlanPlacement;delete payload.data.planPlacement;return payload;
}
export function demoId(){return `practice_${crypto.randomUUID()}`;}
export function deleteDemoRecord(state:DemoState,id:string){const animal=state.records.find(r=>r.id===id)?.payload.recordType==="animal";state.records=state.records.filter(r=>r.id!==id&&!(animal&&r.payload.recordType==="weight"&&r.payload.data.animalId===id));}
export function newDemoFarm():DemoRow<FarmPayload>{return structuredClone(fixture.farms[0]) as DemoRow<FarmPayload>;}
export function demoBackup(state:DemoState){return {format:"venezuela-agro-demo-backup",version:1,exportedAt:new Date().toISOString(),workspace:state};}
