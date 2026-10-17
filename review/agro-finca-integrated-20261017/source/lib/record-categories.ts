/** Preserve every stored category in navigable lists, including older empty categories. */
export function includeRecordedCategories(defaults:string[][],categories:Array<string|undefined>):string[][]{
 const known=new Set(defaults.map(row=>row[1]));const result=defaults.map(row=>[...row]);
 for(const raw of categories){const name=typeof raw==='string'?raw:'';if(!known.has(name)){known.add(name);result.push(['📋',name,'Categoría registrada']);}}
 return result;
}
