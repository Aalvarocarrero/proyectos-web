import {orderPayloadSchema} from "./sync-validation";
import {readOrderDetails} from "./order-details";

type OrderPayload=ReturnType<typeof orderPayloadSchema.parse>;
type StoredOrder={customerName:string;email:string|null;phone:string|null;note:string|null;itemsJson:string};
function canonicalOrder(payload:OrderPayload) {
 return JSON.stringify({customerName:payload.customerName,email:payload.email||"",phone:payload.phone||"",items:payload.items,note:payload.note,channel:payload.channel,business:payload.business??null});
}
/** An idempotent acknowledgement confirms these exact details, never an unrelated order with the same ID. */
export function matchesStoredOrder(row:StoredOrder,payload:OrderPayload):boolean {
 const details=readOrderDetails(row.itemsJson);
 const parsed=orderPayloadSchema.safeParse({customerName:row.customerName,email:row.email||"",phone:row.phone||"",note:row.note||"",items:details.items,channel:details.channel,business:details.business??undefined});
 return parsed.success && canonicalOrder(parsed.data)===canonicalOrder(payload);
}
