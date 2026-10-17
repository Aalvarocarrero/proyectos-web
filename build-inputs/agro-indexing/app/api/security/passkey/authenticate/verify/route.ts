import {NextResponse} from "next/server";
export function GET(){return NextResponse.json({error:"feature_disabled"},{status:410});}
export const POST=GET;
