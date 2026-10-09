import type {FarmRecordPayload} from '@/lib/farm-types';
import {hasCustomAreaOutline} from '@/lib/polygon-geometry';
/** Pure layout operation; preserves the exact allocated area, including decimals. */
export function deriveAreaSplit(payload:FarmRecordPayload):[FarmRecordPayload,FarmRecordPayload]{
 // The legacy layout splitter cannot clip an arbitrary polygon. Never copy a
 // custom ring into two rectangular halves, even when that ring is malformed.
 if(hasCustomAreaOutline(payload.data))throw new Error('custom_polygon_split_unsupported');
 const area=Number(payload.data.areaSqM);
 if(payload.recordType!=='area'||!Number.isFinite(area)||area<2)throw new Error('area_too_small');
 const first=area/2,second=area-first;
 const finite=(value:unknown,fallback:number)=>Number.isFinite(Number(value))?Number(value):fallback;
 const x=Math.max(0,Math.min(99,finite(payload.data.mapX,10))),y=Math.max(0,Math.min(99,finite(payload.data.mapY,10)));
 const width=Math.max(1,Math.min(100-x,finite(payload.data.mapWidth,20))),height=Math.max(1,Math.min(100-y,finite(payload.data.mapHeight,12))),across=width>=height;
 const a=across?{mapX:x,mapY:y,mapWidth:width/2,mapHeight:height}:{mapX:x,mapY:y,mapWidth:width,mapHeight:height/2};
 const b=across?{...a,mapX:x+a.mapWidth}:{...a,mapY:y+a.mapHeight};
 const title=payload.title.replace(/\s+[AB]$/i,'').slice(0,158);
 return [{...payload,title:`${title} A`,data:{...payload.data,areaSqM:first,...a}},{...payload,title:`${title} B`,data:{...payload.data,areaSqM:second,...b}}];
}
