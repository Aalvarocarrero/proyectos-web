import type {InstallEnvironment} from './install-guidance';
export type InstallActionState={ready:boolean;nativePrompt:boolean;installed:boolean;environment:InstallEnvironment};
const initial:InstallActionState={ready:false,nativePrompt:false,installed:false,environment:{device:'computer',os:'other',browser:'other'}};
let snapshot=initial,request:(()=>void)|null=null;const listeners=new Set<()=>void>();
export function installActionSnapshot(){return snapshot;}
export function installActionServerSnapshot(){return initial;}
export function subscribeInstallAction(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function registerInstallAction(state:InstallActionState,handler:()=>void){request=handler;snapshot=state;listeners.forEach(listener=>listener());return()=>{if(request===handler){request=null;snapshot=initial;listeners.forEach(listener=>listener());}};}
/** Direct synchronous forwarding keeps native prompting within the user's click. */
export function requestInstallAction(){if(!request||snapshot.installed)return false;request();return true;}
