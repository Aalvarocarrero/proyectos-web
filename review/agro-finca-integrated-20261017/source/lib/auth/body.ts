/** Read bounded urlencoded login input before contacting either identity provider. */
export async function readLoginForm(request:Request):Promise<URLSearchParams> {
  if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/x-www-form-urlencoded')throw new Error('form_required');
  const reader=request.body?.getReader();if(!reader)throw new Error('form_required');
  let size=0,text='';const decoder=new TextDecoder('utf-8',{fatal:true});
  try {
    while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>8192){await reader.cancel().catch(()=>undefined);throw new Error('form_too_large');}text+=decoder.decode(chunk.value,{stream:true});}
    const form=new URLSearchParams(text+decoder.decode());
    for(const key of ['csrfToken','turnstileToken','returnTo'])if(form.getAll(key).length!==1)throw new Error('invalid_form');
    return form;
  } finally {reader.releaseLock();}
}
