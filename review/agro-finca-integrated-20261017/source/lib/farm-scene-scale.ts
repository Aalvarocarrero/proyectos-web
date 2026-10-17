import type {Point} from './illustrated-geometry';
/** Relative model scale from declared surface, never a surveyed elevation or species size. */
export function sceneUnitsPerMetre(outline:ReadonlyArray<Point>,unit:number,areaSqM?:number){
 if(!Number.isFinite(areaSqM)||!areaSqM||areaSqM<=0||!Number.isFinite(unit)||unit<=0||outline.length<3)return 1;
 let twice=0;for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];if(![a.x,a.y,b.x,b.y].every(Number.isFinite))return 1;twice+=a.x*b.y-b.x*a.y;}
 const value=Math.sqrt(Math.abs(twice)/2*unit*unit/areaSqM);return Number.isFinite(value)&&value>0?Math.min(10,Math.max(.005,value)):1;
}
/** Closed ring: includes every corner, excludes duplicate end point; bounded mobile instances. */
export function fencePostPoints(outline:ReadonlyArray<Point>,spacing:number,max=640):Point[]{
 if(outline.length<3||!Number.isFinite(spacing)||spacing<=0)return [];
 const lengths=outline.map((p,i)=>Math.hypot(p.x-outline[(i+1)%outline.length].x,p.y-outline[(i+1)%outline.length].y));const perimeter=lengths.reduce((a,b)=>a+b,0);if(!Number.isFinite(perimeter)||perimeter<=0)return [];
 const step=Math.max(spacing,perimeter/Math.max(outline.length,max-outline.length));const result:Point[]=[];
 outline.forEach((p,i)=>{const q=outline[(i+1)%outline.length],n=Math.max(1,Math.ceil(lengths[i]/step));for(let j=0;j<n;j++)result.push({x:p.x+(q.x-p.x)*j/n,y:p.y+(q.y-p.y)*j/n});});return result;
}
type Rect={x:number;y:number;maxX:number;maxY:number};
/** Remove gate intervals, including partial overlaps at either end of a fence span. */
export function fenceWireSegments(a:Point,b:Point,gates:ReadonlyArray<Rect>):Array<[Point,Point]>{
 const dx=b.x-a.x,dy=b.y-a.y,intervals:Array<[number,number]>=[];
 for(const g of gates){let lo=0,hi=1,valid=true;for(const [origin,delta,min,max]of [[a.x,dx,g.x,g.maxX],[a.y,dy,g.y,g.maxY]]){if(Math.abs(delta)<1e-12){if(origin<min-1e-9||origin>max+1e-9){valid=false;break;}}else{const t1=(min-origin)/delta,t2=(max-origin)/delta;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));}}if(valid&&hi-lo>1e-9)intervals.push([Math.max(0,lo),Math.min(1,hi)]);}
 intervals.sort((u,v)=>u[0]-v[0]);let cursor=0;const result:Array<[Point,Point]>=[],point=(t:number)=>({x:a.x+dx*t,y:a.y+dy*t});for(const [lo,hi]of intervals){if(lo>cursor+1e-9)result.push([point(cursor),point(lo)]);cursor=Math.max(cursor,hi);}if(cursor<1-1e-9)result.push([point(cursor),point(1)]);return result;
}
