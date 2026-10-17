/** Small bounded queue: paint basic geometry first, then enrich at most two asset groups. */
export async function runFarmAssetQueue(tasks:Array<()=>Promise<void>>,signal:AbortSignal,concurrency=2){
 const results:PromiseSettledResult<void>[]=new Array(tasks.length);let next=0;
 async function worker(){while(next<tasks.length){const index=next++;try{if(signal.aborted)throw new DOMException('Asset load cancelled','AbortError');await tasks[index]();results[index]={status:'fulfilled',value:undefined};}catch(reason){results[index]={status:'rejected',reason};}}}
 await Promise.all(Array.from({length:Math.min(tasks.length,Math.max(1,concurrency))},worker));return results;
}
