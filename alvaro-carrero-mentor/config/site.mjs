export const privateOrigin='https://alvaro-carrero-mentor.aalvarocarrero.chatgpt.site';
export const productionOrigin='https://alvarocarreromentor.com';
export const assetBase='/';
// Paused for the requested public launch; reactivation needs an access/privacy review.
export const feedbackWritesEnabled=true;
export const routePairs=[
 ['/', '/en/','home'],['/comunidad/','/en/community/','community'],
 ['/recurso/','/en/resource/','resource'],['/sobre-alvaro/','/en/about/','about'],
 ['/mentoria-individual/','/en/individual-mentoring/','individual-mentoring'],
 ['/mentoria-grupal/','/en/group-mentoring/','group-mentoring'],
 ['/contacto/','/en/contact/','contact'],['/privacidad/','/en/privacy/','privacy'],
 ['/condiciones/','/en/conditions/','conditions'],['/sesion/','/en/session/','conversation-request'],
 ['/feedback/','/en/feedback/','private-feedback']
];
export const nonIndexedCategories=new Set(['conversation-request','private-feedback']);
export function resolveBuild(env=process.env){
 const mode=env.SITE_BUILD_MODE||'private';
 if(!['private','production','static-export','pages-export'].includes(mode))throw Error('Unknown SITE_BUILD_MODE');
 if(['static-export','pages-export'].includes(mode)&&env.STATIC_EXPORT_APPROVED!=='yes')throw Error('Static export requires explicit approval');
 if(mode==='production'){
  const required=['PUBLIC_LAUNCH_APPROVED','DOMAIN_TLS_VERIFIED','PRIVACY_TERMS_APPROVED','RETENTION_DECIDED','TARGET_BACKEND_VERIFIED','KIT_INACTIVE_STATUS_ACKNOWLEDGED','FEEDBACK_DISABLED_ACKNOWLEDGED'];
  const missing=required.filter(key=>env[key]!=='yes');
  if(missing.length)throw Error('Production launch gates not acknowledged: '+missing.join(', '));
 }
 return {mode,origin:mode==='private'?privateOrigin:productionOrigin,assetBase,feedbackWrites:feedbackWritesEnabled && ['private','pages-export'].includes(mode)};
}
