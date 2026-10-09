import type {LabelRule,LabelSymbolizer} from 'protomaps-leaflet';
export const MAP_PLACE_LABEL_STYLE={labelProps:['name:es','name'],fill:'#20351a',stroke:'#fffef7',width:3,font:'600 13px sans-serif'};
/** Keep source filters/order, improve locality contrast, and identify only named administrative POIs. */
export function readableMapLabelRules(rules:LabelRule[],symbol:()=>LabelSymbolizer):LabelRule[]{
 return [...rules.map(rule=>rule.dataLayer==='places'?{...rule,symbolizer:symbol()}:rule),{dataLayer:'pois',minzoom:13,symbolizer:symbol(),filter:(_z,feature)=>feature.props.kind==='administrative'&&typeof feature.props.name==='string'&&feature.props.name.trim().length>0}];
}
