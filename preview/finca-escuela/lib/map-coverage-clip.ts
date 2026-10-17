import type {Map as LeafletMap} from 'leaflet';
/** Public pilot tiles contain buffers. Keep their pixels inside the declared AOI, including zoom transitions. */
export function clipMapPanes(map:LeafletMap,bounds:[number,number,number,number]|null|(()=>[number,number,number,number]|null),names:string[]){
 const clip=()=>{const current=typeof bounds==="function"?bounds():bounds;if(current===null){for(const name of names){const pane=map.getPane(name);if(pane)pane.style.clipPath='';}return;}const [w,s,e,n]=current;const nw=map.latLngToLayerPoint([n,w]),se=map.latLngToLayerPoint([s,e]);for(const name of names){const pane=map.getPane(name);if(pane)pane.style.clipPath=`polygon(${nw.x}px ${nw.y}px,${se.x}px ${nw.y}px,${se.x}px ${se.y}px,${nw.x}px ${se.y}px)`;}};
 const hide=()=>{for(const name of names){const pane=map.getPane(name);if(pane)pane.style.visibility='hidden';}};
 const show=()=>{clip();for(const name of names){const pane=map.getPane(name);if(pane)pane.style.visibility='';}};
 show();map.on('zoomstart',hide);map.on('zoomend',show);map.on('moveend viewreset resize',clip);
 const dispose=()=>{map.off('zoomstart',hide);map.off('zoomend',show);map.off('moveend viewreset resize',clip);for(const name of names){const pane=map.getPane(name);if(pane)pane.style.visibility='';}};
 return Object.assign(dispose,{update:clip});
}
