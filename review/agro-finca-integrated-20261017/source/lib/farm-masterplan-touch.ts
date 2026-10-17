import {MathUtils,PerspectiveCamera,Spherical,Vector3} from 'three';
import type {OrbitControls} from 'three/addons/controls/OrbitControls.js';

type Contact={x:number;y:number};
type Snapshot={points:Contact[];target:Vector3;spherical:Spherical;right:Vector3;up:Vector3;pixel:number;height:number;angle:number;turn:number;distance:number};
export const MASTERPLAN_MIN_POLAR=.001;
export const MASTERPLAN_MAX_POLAR=Math.PI/2-.03;
/** Preset changes keep the same scene; initial is the saved opening viewpoint. */
export function setMasterplanView(camera:PerspectiveCamera,controls:OrbitControls,view:'initial'|'aerial',fitDistance:number){
 if(view==='initial'){controls.target.set(0,0,0);camera.position.set(.92,.93,1.05).normalize().multiplyScalar(fitDistance);}
 else {const s=new Spherical().setFromVector3(camera.position.clone().sub(controls.target));s.phi=MASTERPLAN_MIN_POLAR;camera.position.copy(controls.target).add(new Vector3().setFromSpherical(s));}
 controls.update();
}
const MIN_SEPARATION=4;
const midpoint=(a:Contact,b:Contact)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
const separation=(a:Contact,b:Contact)=>Math.hypot(b.x-a.x,b.y-a.y);
const angle=(a:Contact,b:Contact)=>Math.atan2(b.y-a.y,b.x-a.x);
const wrappedAngle=(r:number)=>Math.atan2(Math.sin(r),Math.cos(r));

/** Touch-only orbit + centroid pan + pinch + twist; mouse/wheel stay with OrbitControls.
 * Every transform uses the gesture's original camera basis, rather than integrating
 * sequential fingers against a changing zoom/orientation. A centered pinch or
 * twist therefore has exactly no residual pan when both pointer updates arrive.
 */
export function installMasterplanTouch(element:HTMLElement,camera:PerspectiveCamera,controls:OrbitControls){
 const pointers=new Map<number,Contact>();
 let base:Snapshot|null=null,restoreEnabled=true;
 function rebase(){
  if(!pointers.size||pointers.size>2){base=null;return;}
  camera.updateMatrix();
  const points=[...pointers.values()].map(p=>({...p})),spherical=new Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  const right=new Vector3().setFromMatrixColumn(camera.matrix,0),up=controls.screenSpacePanning?new Vector3().setFromMatrixColumn(camera.matrix,1):new Vector3().crossVectors(camera.up,right);
  const height=Math.max(1,element.clientHeight),distance=points.length===2?separation(points[0],points[1]):0;
  base={points,target:controls.target.clone(),spherical,right,up,pixel:2*spherical.radius*Math.tan(MathUtils.degToRad(camera.fov/2))/height,height,angle:points.length===2?angle(points[0],points[1]):0,turn:0,distance};
 }
 function apply(){
  if(!base||pointers.size!==base.points.length)return;
  const points=[...pointers.values()],s=base.spherical.clone(),target=base.target.clone();
  if(points.length===1){
   if(controls.enableRotate!==false){s.theta-=2*Math.PI*(points[0].x-base.points[0].x)/base.height*controls.rotateSpeed;s.phi-=2*Math.PI*(points[0].y-base.points[0].y)/base.height*controls.rotateSpeed;}
  }else{
   const from=midpoint(base.points[0],base.points[1]),to=midpoint(points[0],points[1]),distance=separation(points[0],points[1]);
   if(controls.enablePan!==false){target.addScaledVector(base.right,-(to.x-from.x)*base.pixel*controls.panSpeed);target.addScaledVector(base.up,(to.y-from.y)*base.pixel*controls.panSpeed);}
   if(base.distance>=MIN_SEPARATION&&distance>=MIN_SEPARATION){
    const next=angle(points[0],points[1]);base.turn+=wrappedAngle(next-base.angle);base.angle=next;
    if(controls.enableRotate!==false)s.theta+=base.turn;
    if(controls.enableZoom!==false)s.radius*=Math.pow(base.distance/distance,controls.zoomSpeed);
   }
  }
  s.phi=MathUtils.clamp(s.phi,controls.minPolarAngle,controls.maxPolarAngle);s.radius=MathUtils.clamp(s.radius,controls.minDistance,controls.maxDistance);
  controls.target.copy(target);camera.position.copy(target).add(new Vector3().setFromSpherical(s));controls.update();
  // Crossing/overlapping contacts have no meaningful angle or scale. Start a
  // fresh baseline on either side of that singularity instead of jumping.
  if(points.length===2&&(base.distance<MIN_SEPARATION||separation(points[0],points[1])<MIN_SEPARATION))rebase();
 }
 function down(e:PointerEvent){
  if(e.pointerType!=='touch'||pointers.has(e.pointerId)||(!pointers.size&&controls.enabled===false))return;
  if(!pointers.size){restoreEnabled=controls.enabled;controls.enabled=false;}
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  // Capture-phase handling prevents OrbitControls from starting its own touch
  // integration while leaving events available for area-tap selection.
  element.setPointerCapture(e.pointerId);rebase();
 }
 function move(e:PointerEvent){
  if(!pointers.has(e.pointerId))return;
  e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});apply();
 }
 function end(e:PointerEvent){
  if(!pointers.delete(e.pointerId))return;
  if(element.hasPointerCapture(e.pointerId))element.releasePointerCapture(e.pointerId);
  if(!pointers.size)controls.enabled=restoreEnabled;
  rebase();
 }
 function reset(){
  const ids=[...pointers.keys()];pointers.clear();base=null;
  if(ids.length)controls.enabled=restoreEnabled;
  for(const id of ids)if(element.hasPointerCapture(id))element.releasePointerCapture(id);
 }
 const view=element.ownerDocument?.defaultView;
 element.addEventListener('pointerdown',down,true);
 element.addEventListener('pointermove',move,{passive:false});
 element.addEventListener('pointerup',end);
 element.addEventListener('pointercancel',end);
 element.addEventListener('lostpointercapture',end);
 view?.addEventListener('blur',reset);
 return {reset,dispose(){reset();element.removeEventListener('pointerdown',down,true);element.removeEventListener('pointermove',move);element.removeEventListener('pointerup',end);element.removeEventListener('pointercancel',end);element.removeEventListener('lostpointercapture',end);view?.removeEventListener('blur',reset);}};
}
