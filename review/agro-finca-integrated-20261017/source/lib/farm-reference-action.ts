/** Decide the visible reference action without silently ignoring missing coordinates. */
export function farmReferenceAction(positionCount:number,mapReady:boolean){return positionCount===0?'configure':mapReady?'center':'loading';}
