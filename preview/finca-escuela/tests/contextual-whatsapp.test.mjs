import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,watch:null}});after(()=>vite.close());
const {publicWhatsAppUrl,contextualContactMessage}=await vite.ssrLoadModule('/lib/whatsapp-contact.ts');
const {ContextualWhatsAppContact}=await vite.ssrLoadModule('/components/contextual-whatsapp-contact.tsx');
const {CompanyProfileView}=await vite.ssrLoadModule('/components/company-profile-view.tsx');
const {veterinaryCompanyDemo}=await vite.ssrLoadModule('/lib/company-demo.ts');
const render=(component,props)=>renderToStaticMarkup(React.createElement(component,props));
const contact={phone:'+58 414 1234567',enabled:true};
const urls=html=>[...html.matchAll(/href="(https:\/\/wa\.me\/[^\"]+)"/g)].map(m=>new URL(m[1].replaceAll('&amp;','&')));

test('one safely encoded contextual message preserves domain, interest, Unicode and punctuation',()=>{
 const subject='Café & cacao / «cosecha»? #1';
 assert.equal(contextualContactMessage(subject),`Hola, vengo de VenezuelaAgro.com. Estoy interesado en ${subject}.`);
 const url=new URL(publicWhatsAppUrl(contact,subject));assert.equal(url.pathname,'/584141234567');assert.equal(url.searchParams.get('text'),contextualContactMessage(subject));
 assert.equal(new URL(publicWhatsAppUrl({...contact,phone:'0414 1234567'},subject)).pathname,url.pathname);
});
test('missing opt-in, malformed number, private-shaped data and demos never produce destinations',()=>{
 for(const c of [{},{phone:contact.phone},{...contact,enabled:false},{...contact,demo:true},{...contact,phone:'1234567'},{...contact,phone:'javascript:584141234567'},{...contact,phone:'584141234567?token=abc'},{...contact,phone:'0000000000'},{accountPhone:contact.phone,enabled:true}])assert.equal(publicWhatsAppUrl(c,'área'),null);
 for(const props of [{context:'área'},{context:'área',...contact,enabled:false},{context:'área',...contact,demo:true}]){const html=render(ContextualWhatsAppContact,props);assert.doesNotMatch(html,/href=|wa\.me|584141234567/);assert.match(html,/WhatsApp/);}
 const demo=render(ContextualWhatsAppContact,{context:'perfil',demo:true});assert.match(demo,/aria-haspopup="dialog"/);assert.match(demo,/bg-\[#176b3b\]/);
});
test('company and product contacts refer to exact visible context; photo comes before CTA',()=>{
 const c={...veterinaryCompanyDemo,demo:false,phone:contact.phone,whatsapp:true,logoUrl:'/logo.webp',instagram:'https://instagram.com/example',facebook:'https://facebook.com/example'};
 const html=render(CompanyProfileView,{company:c}),links=urls(html);
 assert.equal(links.length,1+c.products.length);assert.equal(links[0].searchParams.get('text'),contextualContactMessage(`${c.name} · ${c.category}`));
 for(const p of c.products)assert.ok(links.some(u=>u.searchParams.get('text')===contextualContactMessage(`${p.name} · ${c.name}`)));
 assert.ok(html.indexOf('alt="Logo de')<html.indexOf('data-contextual-contact'));
 assert.match(html,/href="https:\/\/instagram.com\/example"/);assert.match(html,/href="https:\/\/facebook.com\/example"/);
 const demo=render(CompanyProfileView,{company:{...c,demo:true}});assert.equal(urls(demo).length,0);assert.doesNotMatch(demo,/href="(?:tel:|https:\/\/(?:instagram|facebook)\.com)/);assert.match(demo,/WhatsApp · Ejemplo/);
});
test('professional profile CTA follows photo and carries service plus name',async()=>{
 const {ProfessionalProfileView}=await vite.ssrLoadModule('/components/professional-profile-view.tsx');
 const {professionalDetailsSchema}=await vite.ssrLoadModule('/lib/professional-profile.ts');
 const p={id:'test',name:'Perfil de prueba',profession:'Asesoría agrícola',specialties:'Cacao',state:'Apure',municipality:'Localidad',serviceMode:'Remoto',introduction:'Descripción',contact:contact.phone,credentialNote:'',details:professionalDetailsSchema.parse({whatsapp:true})};
 const html=render(ProfessionalProfileView,{profile:p});assert.equal(urls(html)[0].searchParams.get('text'),contextualContactMessage(`${p.profession} · ${p.name}`));assert.ok(html.indexOf('Sin fotografía de perfil')<html.indexOf('data-contextual-contact'));
 assert.equal(urls(render(ProfessionalProfileView,{profile:{...p,demo:true}})).length,0);
});
test('social controls validate recorded URLs and never make demo placeholders actionable',async()=>{
 const {ProfileSocials}=await vite.ssrLoadModule('/components/profile-socials.tsx');
 const html=render(ProfileSocials,{socials:{instagram:'javascript:alert(1)',facebook:'https://evil.test',website:'https://user:secret@example.com',youtube:'https://youtube.com/example'}});
 assert.doesNotMatch(html,/javascript:|evil.test|secret/);assert.match(html,/href="https:\/\/youtube.com\/example"/);
 assert.doesNotMatch(render(ProfileSocials,{socials:{instagram:'https://instagram.com/example'},demo:true}),/href=/);
});
test('farm opt-in is optional for legacy records and community uses only public opted-in contacts',async()=>{
 const {publicFarmSchema,demoPublicFarms}=await vite.ssrLoadModule('/lib/network-profile.ts');
 const f={...demoPublicFarms[0],demo:false,phone:contact.phone};
 assert.equal(publicFarmSchema.parse(f).whatsapp,undefined);assert.equal(publicFarmSchema.parse({...f,whatsapp:true}).whatsapp,true);
 const {CommunityWhatsAppContact}=await vite.ssrLoadModule('/components/agro-network.tsx');
 const post={text:'Cosecha de cacao lista',authorName:f.name,likes:0,comments:[]};
 assert.equal(urls(render(CommunityWhatsAppContact,{post,farm:f})).length,0);
 const html=render(CommunityWhatsAppContact,{post,farm:{...f,whatsapp:true}});assert.match(urls(html)[0].searchParams.get('text'),/Cosecha de cacao lista/);
 assert.equal(urls(render(CommunityWhatsAppContact,{post:{...post,demo:true},farm:{...f,whatsapp:true}})).length,0);
});
test('store and projects expose honest unavailable contact without leaking order or proposal phones',async()=>{
 const store=await readFile(root+'components/store-catalog.tsx','utf8'),projects=await readFile(root+'app/proyectos/page.tsx','utf8');
 assert.match(store,/WhatsApp comercial publicado/);assert.match(projects,/teléfono público habilitado para WhatsApp/);assert.doesNotMatch(projects,/phone=\{project\.contact\}/);assert.doesNotMatch(store,/phone=\{(?:payload|cart|f)\./);
 const share=await readFile(root+'lib/public-image-content.ts','utf8');assert.doesNotMatch(share,/contextualContactMessage/);
});
