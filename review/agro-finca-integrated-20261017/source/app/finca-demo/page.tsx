import type {Metadata} from "next";
import {FarmDemoWorkspace} from "@/components/farm-demo-workspace";
export const metadata:Metadata={title:"Finca de demostración editable",robots:{index:false,follow:false}};
export default function DemoPage(){return <FarmDemoWorkspace/>;}
