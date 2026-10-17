import type {FarmRecordPayload} from '@/lib/farm-types';
import {hasCustomAreaOutline} from '@/lib/polygon-geometry';
import {exactPlanLayout} from '@/lib/farm-plan-catalog';
/** Pure layout operation; preserves the exact allocated area, including decimals. */
export function deriveAreaSplit(payload:FarmRecordPayload):[FarmRecordPayload,FarmRecordPayload]{
 // The legacy layout splitter cannot clip an arbitrary polygon. Never copy a
 // custom ring into two rectangular halves, even when that ring is malformed.
 if(hasCustomAreaOutline(payload.data))throw new Error('custom_polygon_split_unsupported');
 if(payload.data.waterTrough)throw new Error('No se puede dividir automáticamente un área con un bebedero guardado; conserva el área y revisa su infraestructura primero.');
 if(payload.data.boundaryPlanting)throw new Error('No se puede dividir automáticamente un área con vegetación ilustrativa guardada; conserva el área y revisa su distribución primero.');
 const area=Number(payload.data.areaSqM);
 if(payload.recordType!=='area'||!Number.isFinite(area)||area<2)throw new Error('area_too_small');
 const first=area/2,second=area-first;
 const exact=exactPlanLayout(payload.data);
 if(payload.data.mapLayoutVersion===2&&!exact)throw new Error('area_layout_invalid');
 const finite=(value:unknown,fallback:number)=>Number.isFinite(Number(value))?Number(value):fallback;
 const x=exact?.x??Math.max(0,Math.min(99,finite(payload.data.mapX,10))),y=exact?.y??Math.max(0,Math.min(99,finite(payload.data.mapY,10)));
 const width=exact?.width??Math.max(1,Math.min(100-x,finite(payload.data.mapWidth,20))),height=exact?.height??Math.max(1,Math.min(100-y,finite(payload.data.mapHeight,12))),across=width>=height;
 const a=across?{mapX:x,mapY:y,mapWidth:width/2,mapHeight:height}:{mapX:x,mapY:y,mapWidth:width,mapHeight:height/2};
 const b=across?{...a,mapX:x+a.mapWidth}:{...a,mapY:y+a.mapHeight};
 // Never create a v2 half that would silently fall back to a larger legacy box.
 if(exact&&(!exactPlanLayout({...payload.data,...a})||!exactPlanLayout({...payload.data,...b})))throw new Error('area_layout_split_out_of_range');
 const title=payload.title.replace(/\s+[AB]$/i,'').slice(0,158);
 return [{...payload,title:`${title} A`,data:{...payload.data,areaSqM:first,...a}},{...payload,title:`${title} B`,data:{...payload.data,areaSqM:second,...b}}];
}
