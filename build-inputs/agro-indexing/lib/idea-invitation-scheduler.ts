/** Retry temporary UI interruptions without consuming the weekly invitation claim. */
export function scheduleIdeaInvitation(options:{delayMs:number;isBlocked:()=>boolean;claim:()=>boolean;open:()=>void;setTimer:(callback:()=>void,delay:number)=>number;clearTimer:(id:number)=>void}){
 let stopped=false,timer:number|undefined;
 const attempt=()=>{if(stopped)return;if(options.isBlocked()){timer=options.setTimer(attempt,2000);return;}stopped=true;if(options.claim())options.open();};
 timer=options.setTimer(attempt,options.delayMs);
 return ()=>{stopped=true;if(timer!==undefined)options.clearTimer(timer);};
}
