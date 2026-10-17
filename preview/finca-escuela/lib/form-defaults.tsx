import {Children,cloneElement,isValidElement,type ReactNode,type ReactElement} from "react";
/** Populate the existing uncontrolled form from an immutable editing snapshot. */
export function withFormDefaults(children:ReactNode,values?:Record<string,unknown>):ReactNode {
 if(!values)return children;
 return Children.map(children,child=>{if(!isValidElement(child))return child;const element=child as ReactElement<Record<string,unknown>>;const props=element.props;const patch:Record<string,unknown>={};
 if(typeof props.name==="string"&&Object.hasOwn(values,props.name)){const value=values[props.name];if(props.type==="checkbox")patch.defaultChecked=Array.isArray(value)?value.includes(props.value):Boolean(value);else if(value!==undefined&&value!==null&&props.type!=="file")patch.defaultValue=Array.isArray(value)?value.join("\n"):String(value);}
 if(props.children)patch.children=withFormDefaults(props.children as ReactNode,values);return cloneElement(element,patch);
 });
}
