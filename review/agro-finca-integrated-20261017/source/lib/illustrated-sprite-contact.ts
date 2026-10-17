/** Original 256px assets visually inspected. Contacts are illustration anchors, not surveyed dimensions. */
export type P={x:number;y:number};
export type Box={x:number;y:number;width:number;height:number};
export const SPRITE_CONTACTS:Record<string,{alpha:[number,number,number,number];anchor:P;footprint:P[]}>= {
 'rural-house':{alpha:[8,42,251,208],anchor:{x:130/256,y:171/256},footprint:[[22,170],[178,206],[240,164],[86,135]].map(([x,y])=>({x:x/256,y:y/256}))},
 'open-shed':{alpha:[14,61,247,205],anchor:{x:131/256,y:170/256},footprint:[[22,171],[176,203],[239,170],[90,137]].map(([x,y])=>({x:x/256,y:y/256}))},
 'wood-cabin':{alpha:[13,34,247,227],anchor:{x:130/256,y:177/256},footprint:[[23,174],[145,219],[234,177],[108,136]].map(([x,y])=>({x:x/256,y:y/256}))},
 'chicken-coop':{alpha:[7,41,250,210],anchor:{x:133/256,y:169/256},footprint:[[22,165],[132,208],[246,172],[132,139]].map(([x,y])=>({x:x/256,y:y/256}))},
 greenhouse:{alpha:[13,23,246,233],anchor:{x:129/256,y:178/256},footprint:[[16,201],[130,231],[244,151],[129,126]].map(([x,y])=>({x:x/256,y:y/256}))},
 'cacao-tree':{alpha:[5,8,251,247],anchor:{x:.5,y:.95},footprint:[{x:.46,y:.93},{x:.54,y:.93},{x:.54,y:.97},{x:.46,y:.97}]},
 'banana-plant':{alpha:[9,10,249,248],anchor:{x:.5,y:.96},footprint:[{x:.44,y:.92},{x:.56,y:.92},{x:.56,y:.97},{x:.44,y:.97}]},
 'coffee-shrub':{alpha:[9,18,247,248],anchor:{x:.5,y:.96},footprint:[{x:.44,y:.92},{x:.56,y:.92},{x:.56,y:.97},{x:.44,y:.97}]},
};
export function spriteLayout(asset:string,ground:P,visibleWidth:number){const m=SPRITE_CONTACTS[asset],side=visibleWidth*256/(m.alpha[2]-m.alpha[0]),x=ground.x-side*m.anchor.x,y=ground.y-side*m.anchor.y;
 return {imageBox:{x,y,width:side,height:side},visibleBox:{x:x+side*m.alpha[0]/256,y:y+side*m.alpha[1]/256,width:side*(m.alpha[2]-m.alpha[0])/256,height:side*(m.alpha[3]-m.alpha[1])/256},footprint:m.footprint.map(p=>({x:x+p.x*side,y:y+p.y*side})),ground,side};}
/** Contact shadow follows the visible ground footprint, not a detached ellipse beyond the front edge. */
export function footprintPath(points:P[]){return points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join('')+'Z';}
/** A complete upright cylinder. y=ground contact center; no projected-ground clipping. */
export function tankGeometry(p:P,r:number){const height=r*1.45,ry=r*.38,top=p.y-height;return {body:`M${p.x-r},${top}L${p.x-r},${p.y}A${r},${ry} 0 0 0 ${p.x+r},${p.y}L${p.x+r},${top}Z`,top:{cx:p.x,cy:top,rx:r,ry},base:{cx:p.x,cy:p.y,rx:r,ry},bounds:{x:p.x-r,y:top-ry,width:r*2,height:height+ry*2}};}
export function overlaps(a:Box,b:Box,gap=0){return a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;}
/** Use ACTUAL animal image anchor/size, not a square around its ground point. */
export function animalVisibleBox(p:P,size:number,anchor:{u:number;v:number},alpha:[number,number,number,number]):Box{return {x:p.x-size*anchor.u+size*alpha[0]/256,y:p.y-size*anchor.v+size*alpha[1]/256,width:size*(alpha[2]-alpha[0])/256,height:size*(alpha[3]-alpha[1])/256};}
export function unionBoxes(boxes:Box[]):Box{const x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y));return {x,y,width:Math.max(...boxes.map(b=>b.x+b.width))-x,height:Math.max(...boxes.map(b=>b.y+b.height))-y};}
