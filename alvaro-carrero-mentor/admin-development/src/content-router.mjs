import {authorizeAdmin,assertMutationRequest,ContentError,readContentBody,loadState,loadPublished,mutateContent} from './content-service.mjs';
import {renderContent,previewDocument} from './content-renderer.mjs';
import {adminDocument,adminErrorDocument} from './admin-view.mjs';
const privateHeaders={
 'cache-control':'private, no-store, max-age=0',
 'x-content-type-options':'nosniff',
 'x-robots-tag':'noindex, nofollow, noarchive',
 'referrer-policy':'same-origin',
 'vary':'oai-authenticated-user-id',
 'content-security-policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
};
const contentJSON=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{...privateHeaders,'content-type':'application/json; charset=utf-8'}});
const privateHTML=(html,status=200)=>new Response(html,{status,headers:{...privateHeaders,'content-type':'text/html; charset=utf-8'}});
async function homepageResponse(request,env,content,language,previewVersion=null) {
 if(!env.ASSETS)throw new ContentError('storage_unavailable',503);
 const url=new URL(request.url),templateURL=new URL(language==='en'?'/en/':'/',url);
 // Private preview always reads the public template; no private path reaches the asset service.
 const assetRequest=new Request(previewVersion===null?request.url:templateURL,{method:'GET',headers:request.headers});
 const original=await env.ASSETS.fetch(assetRequest);
 if(original.status!==200)return previewVersion===null?original:privateHTML(adminErrorDocument('storage_unavailable',503),503);
 const headers=new Headers(original.headers);
 for(const header of ['etag','last-modified','content-length','content-encoding'])headers.delete(header);
 headers.set('cache-control',previewVersion===null?'no-store, max-age=0':'private, no-store, max-age=0');
 headers.set('content-type','text/html; charset=utf-8');
 headers.set('x-content-type-options','nosniff');
 if(previewVersion!==null)for(const [name,value] of Object.entries(privateHeaders))headers.set(name,value);
 let html=await original.text();
 if(content)html=renderContent(html,content,language,url.origin);
 if(previewVersion!==null)html=previewDocument(html,previewVersion,language);
 return new Response(request.method==='HEAD'?null:html,{status:200,headers});
}
export async function routeContent(request,env) {
 const url=new URL(request.url),path=url.pathname;
 const adminPage=path==='/admin'||path.startsWith('/admin/');
 const adminAPI=path==='/api/admin'||path.startsWith('/api/admin/');
 if(adminPage||adminAPI) {
  try {
   const actor=authorizeAdmin(request,env);
   if(adminPage) {
    if(!['GET','HEAD'].includes(request.method))throw new ContentError('method_not_allowed',405);
    if(path==='/admin'||path==='/admin/') {
     const state=await loadState(env);
     return privateHTML(request.method==='HEAD'?null:adminDocument(state));
    }
    if(path==='/admin/preview') {
     const language=url.searchParams.get('lang')??'es';
     if(!['es','en'].includes(language)||[...url.searchParams.keys()].some(key=>key!=='lang'))throw new ContentError('invalid_preview',400);
     const state=await loadState(env);
     return await homepageResponse(request,env,state.draft,language,state.version);
    }
    throw new ContentError('not_found',404);
   }
   if(path==='/api/admin/content' && request.method==='GET')return contentJSON({ok:true,state:await loadState(env)});
   const action=path==='/api/admin/content'?'save':path==='/api/admin/content/publish'?'publish':null;
   if(!action)throw new ContentError('not_found',404);
   if(request.method!==(action==='save'?'PUT':'POST'))throw new ContentError('method_not_allowed',405);
   assertMutationRequest(request);
   const state=await mutateContent(env,actor,action,await readContentBody(request));
   return contentJSON({ok:true,state});
  } catch(error) {
   const known=error instanceof ContentError;
   const status=known?error.status:503,code=known?error.message:'storage_unavailable';
   return adminAPI?contentJSON({ok:false,error:code},status):privateHTML(request.method==='HEAD'?null:adminErrorDocument(code,status),status);
  }
 }
 if(['/', '/index.html','/en/','/en/index.html'].includes(path)&&['GET','HEAD'].includes(request.method)) {
  const language=path.startsWith('/en/')?'en':'es';
  try{return await homepageResponse(request,env,await loadPublished(env),language);}
  catch{return new Response('Temporarily unavailable',{status:503,headers:{'cache-control':'no-store'}});}
 }
 return null;
}
