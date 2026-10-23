// Strict data-only records and dense arrays for the optional studio states.
export function ownRecord(value,fields){
 if(value===null||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw Error('Invalid record');
 const keys=Reflect.ownKeys(value);
 if(keys.length!==fields.length||keys.some(k=>!fields.includes(k))||fields.some(k=>!Object.hasOwn(value,k)||!Object.hasOwn(Object.getOwnPropertyDescriptor(value,k),'value')))throw Error('Invalid fields');
 return value;
}
export function denseValues(value,allowed,max,exact=false){
 if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype||value.length>max||(exact&&value.length!==max)||Reflect.ownKeys(value).length!==value.length+1)throw Error('Invalid array');
 const copy=[];
 for(let i=0;i<value.length;i++){const descriptor=Object.getOwnPropertyDescriptor(value,String(i));if(!descriptor||!Object.hasOwn(descriptor,'value')||!allowed.includes(descriptor.value))throw Error('Invalid item');copy[i]=descriptor.value;}
 return copy;
}
