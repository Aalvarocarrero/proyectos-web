/** Shared policy keeps downloads and playback independent: hide/pause never remounts the scene. */
export function shouldLoadHomeFarmPreview(state:{loaded:boolean;failed:boolean;pageVisible:boolean;visible:boolean;requested:boolean;constrained:boolean}) {
 return !state.loaded&&!state.failed&&state.pageVisible&&(state.visible||state.requested)&&(!state.constrained||state.requested);
}
export function stopHomeFarmPreview(state:{paused:boolean;visible:boolean;pageVisible:boolean;constrained:boolean;requested:boolean}) {
 return state.paused||!state.visible||!state.pageVisible||(state.constrained&&!state.requested);
}

/** Unknown browser preferences and ordinary loading never expose the 2D alternative. */
export function homeFarmPreviewMode(state:{preferencesKnown:boolean;chosen2D:boolean;constrained:boolean;requested:boolean;ready:boolean;failed:boolean}):'loading'|'2d'|'3d' {
 if(state.failed||state.chosen2D||(state.preferencesKnown&&state.constrained&&!state.requested))return '2d';
 return state.ready?'3d':'loading';
}
