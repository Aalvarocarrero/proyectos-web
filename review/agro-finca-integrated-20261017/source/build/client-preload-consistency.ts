import {getPluginApi, type PluginApi} from '@vitejs/plugin-rsc';
import type {Plugin, Rollup} from 'vite';

type CssPlaceholder = {fileName:string; css:string[]};

/** Vite removes JS placeholders for CSS-only chunks after the RSC manifest is
 * collected. Keep the style dependency, but never preload the deleted JS file.
 * No application JavaScript dependency may be silently removed here. */
export function cssOnlyPlaceholders(bundle:Rollup.OutputBundle):CssPlaceholder[] {
 return Object.values(bundle).flatMap(chunk=>{
  if(chunk.type!=='chunk'||!chunk.moduleIds.length||!chunk.moduleIds.every(id=>/\.(?:css|scss|sass|less|styl|stylus)(?:\?|$)/.test(id)))return [];
  const css=[...(chunk.viteMetadata?.importedCss??[])];
  return css.length?[{fileName:chunk.fileName,css}]:[];
 });
}

export function reconcileClientPreloads(api:PluginApi|undefined,bundle:Rollup.OutputBundle,placeholders:CssPlaceholder[],base:string):number {
 const manifest=api?.manager.buildAssetsManifest;
 if(!manifest)throw new Error('RSC asset manifest unavailable during client validation');
 const removed=new Map(placeholders.filter(item=>!bundle[item.fileName]&&item.css.every(file=>bundle[file]?.type==='asset')).map(item=>[base+item.fileName,item]));
 let repaired=0;
 for(const deps of Object.values(manifest.clientReferenceDeps)){
  deps.js=deps.js.filter(url=>{if(typeof url!=='string'||!removed.has(url))return true;const item=removed.get(url)!;for(const css of item.css){const href=base+css;if(!deps.css.includes(href))deps.css.push(href);}repaired++;return false;});
  for(const url of [...deps.js,...deps.css]){
   if(typeof url==='string'&&url.startsWith(base)&&!bundle[url.slice(base.length)])throw new Error(`RSC preload points to a missing client asset: ${url}`);
  }
 }
 return repaired;
}

export function clientPreloadConsistency():Plugin[] {
 let api:PluginApi|undefined,base='/',placeholders:CssPlaceholder[]=[];
 return [{
  name:'sites:capture-css-placeholders',apply:'build',
  configResolved(config){api=getPluginApi(config);base=config.base;},
  generateBundle:{order:'pre',handler(_options,bundle){if(this.environment.name==='client')placeholders=cssOnlyPlaceholders(bundle);}},
 },{
  name:'sites:validate-client-preloads',apply:'build',enforce:'post',
  generateBundle:{order:'post',handler(_options,bundle){if(this.environment.name!=='client')return;const count=reconcileClientPreloads(api,bundle,placeholders,base);if(count)this.info(`Removed ${count} stale CSS-only module preload hints; stylesheet dependencies preserved.`);}},
 }];
}
