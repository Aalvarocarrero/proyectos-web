import {NextRequest,NextResponse} from 'next/server';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {networkSnapshot,getPublicPost} from '@/lib/community-network-db';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const user=await getChatGPTUser();const id=request.nextUrl.searchParams.get('post');
 if(id){const detail=await getPublicPost(id,user?.id);if(!detail)return NextResponse.json({error:'not_found'},{status:404});return NextResponse.json({owner:user?.id??null,farms:[detail.farm],mine:[],posts:[detail.post]},{headers:{'cache-control':'private, no-store'}});}
 return NextResponse.json({owner:user?.id??null,...await networkSnapshot(user?.id)},{headers:{'cache-control':'private, no-store'}});
}
