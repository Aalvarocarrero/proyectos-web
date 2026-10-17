import {PerspectiveCamera,Vector3} from 'three';
/** Fit the actual projected parcel corners, not a sphere around its diagonal. */
export function farmFitDistance(points:ReadonlyArray<Vector3>,direction:Vector3,aspect:number,fov=42,padding=1.12){
 const forward=direction.clone().normalize(),right=new Vector3().crossVectors(new Vector3(0,1,0),forward).normalize(),up=new Vector3().crossVectors(forward,right).normalize();
 const vertical=Math.tan(fov*Math.PI/360),horizontal=vertical*Math.max(.1,aspect);
 return Math.max(8,...points.map(p=>p.dot(forward)+Math.max(Math.abs(p.dot(right))/horizontal,Math.abs(p.dot(up))/vertical)*padding));
}
export function focusFarmPoint(camera:PerspectiveCamera,target:Vector3,point:Vector3,width:number,aspect:number){
 const direction=camera.position.clone().sub(target).normalize();if(!Number.isFinite(direction.x)||direction.lengthSq()<.5)direction.set(.92,.93,1.05).normalize();
 // Preserve azimuth while keeping a useful elevated inspection angle.
 direction.y=Math.max(.45,direction.y);direction.normalize();
 const distance=Math.max(4,width/(2*Math.tan(camera.fov*Math.PI/360)*Math.min(1,Math.max(.1,aspect))));
 target.copy(point);camera.position.copy(point).addScaledVector(direction,distance);return distance;
}

/** Exact worst-heading fit for a constant-height circular aerial orbit.
 * Maximize each corner's horizontal/vertical projection over every azimuth,
 * so a portrait viewport cannot crop the parcel halfway through the flight.
 * The radius stays constant: fitting each frame would create a zoom pulse.
 */
export function farmOrbitFitDistance(points:ReadonlyArray<Vector3>,aspect:number,elevation=Math.PI/4,fov=42,padding=1.18){
 const vertical=Math.tan(fov*Math.PI/360),horizontal=vertical*Math.max(.1,aspect);
 const sine=Math.sin(elevation),cosine=Math.cos(elevation),h=padding/horizontal,v=padding/vertical;
 return Math.max(8,...points.flatMap(p=>{const r=Math.hypot(p.x,p.z);return [
  p.y*sine+r*Math.hypot(cosine,h),
  p.y*(sine+v*cosine)+r*Math.abs(cosine-v*sine),
  p.y*(sine-v*cosine)+r*Math.abs(cosine+v*sine),
 ];}));
}
