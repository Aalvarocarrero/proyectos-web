import {inside,edgeClearance,type Point} from './illustrated-geometry';
export type WaterTroughView={position:Point;lengthM:number;widthM:number;heightM:number;planWidth:number;planHeight:number};
/** Explicit fixture accessories only; never infer water infrastructure on real land. */
export function waterTroughView(data:Record<string,unknown>,layout:{x:number;y:number;width:number;height:number},outline:ReadonlyArray<Point>,viewport:{x:number;y:number;scale:number},demonstration:boolean):WaterTroughView|undefined{
 const value=data.waterTrough;if(!demonstration||!value||typeof value!=='object'||Array.isArray(value))return;const t=value as Record<string,unknown>;
 if(t.version!==1||t.source!=='fictional-demo'||!['x','y','lengthM','widthM','heightM'].every(k=>typeof t[k]==='number'&&Number.isFinite(t[k])))return;
 const x=t.x as number,y=t.y as number,lengthM=t.lengthM as number,widthM=t.widthM as number,heightM=t.heightM as number,landLength=Number(data.lengthM),landWidth=Number(data.widthM);
 if(x<=0||x>=100||y<=0||y>=100||lengthM<=0||lengthM>10||widthM<=0||widthM>5||heightM<=0||heightM>2||!Number.isFinite(landLength)||landLength<=0||!Number.isFinite(landWidth)||landWidth<=0)return;
 const point={x:layout.x+layout.width*x/100,y:layout.y+layout.height*y/100},pw=layout.width*lengthM/landLength,ph=layout.height*widthM/landWidth;
 if(!inside(point,outline)||edgeClearance(point,outline)<Math.hypot(pw,ph)/2)return;
 return {position:{x:viewport.x+point.x*viewport.scale,y:viewport.y+point.y*viewport.scale},lengthM,widthM,heightM,planWidth:pw*viewport.scale,planHeight:ph*viewport.scale};
}
