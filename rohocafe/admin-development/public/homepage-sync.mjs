import { contentFields } from './content-fields.mjs';
// Published values only. Keep approved markup untouched when values are unchanged.
const content=globalThis.ROHO_PUBLISHED_CATALOG?.homepage;
if(content)for(const field of contentFields){
 const value=content[field.key],node=document.querySelector(field.selector);
 if(!node||typeof value!=='string'||value===field.default)continue;
 if(field.kind==='image'){node.src=value;node.removeAttribute('srcset');}
 else if(field.kind==='alt')node.alt=value;
 else {const lines=value.split('\n');node.replaceChildren();lines.forEach((line,i)=>{if(i)node.append(document.createElement('br'));const text=document.createTextNode(line);if(field.key==='heroTitle'&&i>0){const em=document.createElement('em');em.append(text);node.append(em);}else node.append(text);});}
}
