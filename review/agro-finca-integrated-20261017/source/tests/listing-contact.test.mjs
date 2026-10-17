import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true}});
after(()=>vite.close());
const {listingContactSchema,encodeListingContact,readListingContact,phoneDigits}=await vite.ssrLoadModule('/lib/listing-contact.ts');
test('requires only responsible name and phone in contact profile',()=>{
 assert.equal(listingContactSchema.safeParse({}).success,false);
 const profile=listingContactSchema.parse({responsibleName:'Productor ejemplo',phone:'0414 1234567'});
 assert.equal(profile.farmName,'');
 assert.deepEqual(readListingContact(encodeListingContact(profile)),profile);
 assert.equal(readListingContact('Contacto anterior'),null);
 assert.equal(phoneDigits(profile.phone),'584141234567');
});
test('rejects unsafe or wrong-platform social links',()=>{
 const base={responsibleName:'Productor ejemplo',phone:'+58 414 1234567'};
 for(const facebook of ['javascript:alert(1)','https://facebook.com.evil.test','https://example.com']) assert.equal(listingContactSchema.safeParse({...base,facebook}).success,false);
 assert.equal(listingContactSchema.safeParse({...base,facebook:'https://www.facebook.com/share/1cRzP5WPSk/',googleBusiness:'https://maps.app.goo.gl/2g9zTQHEQS6pwX1R6'}).success,true);
});
test('renders real contact actions and keeps demonstration anonymous',async()=>{
 const {ListingContactCard}=await vite.ssrLoadModule('/components/listing-contact-card.tsx');
 const contact=encodeListingContact(listingContactSchema.parse({responsibleName:'Productor ejemplo',phone:'0414 1234567',whatsapp:true,farmName:'Finca de ejemplo',instagram:'https://instagram.com/ejemplo'}));
 const html=renderToStaticMarkup(React.createElement(ListingContactCard,{sellerName:'Usuario',contact,location:'Apure'}));
 assert.match(html,/tel:\+584141234567/);assert.match(html,/wa.me\/584141234567/);assert.match(html,/Finca de ejemplo/);assert.match(html,/noopener noreferrer/);
 const demo=renderToStaticMarkup(React.createElement(ListingContactCard,{sellerName:'Demostración',location:'Apure',demo:true}));
 assert.doesNotMatch(demo,/href="tel:/);assert.match(demo,/no contiene datos personales reales/);
 const contaminated=renderToStaticMarkup(React.createElement(ListingContactCard,{sellerName:'Demostración',location:'Apure',demo:true,contact}));
 assert.doesNotMatch(contaminated,/Productor ejemplo|Finca de ejemplo|instagram.com|0414|1234567|wa\.me|href="tel:/);
 assert.match(contaminated,/WhatsApp · Ejemplo/);
});
test('WhatsApp CTA stays visible in demos without creating a recipient or external action',async()=>{
 const {ListingWhatsAppContact}=await vite.ssrLoadModule('/components/listing-whatsapp-contact.tsx');
 const html=renderToStaticMarkup(React.createElement(ListingWhatsAppContact,{productTitle:'Lote de ejemplo',demo:true,contactProfile:{responsibleName:'No publicar',phone:'0414 1234567',whatsapp:true}}));
 assert.match(html,/>WhatsApp · Ejemplo<\/button>/);
 assert.match(html,/aria-haspopup="dialog"/);
 assert.match(html,/No hay un vendedor real ni se envía nada/);
 assert.doesNotMatch(html,/href=|wa\.me|tel:|584141234567|No publicar/);
});
test('real WhatsApp CTA uses only an opted-in valid registered number and encodes the product message',async()=>{
 const {ListingWhatsAppContact}=await vite.ssrLoadModule('/components/listing-whatsapp-contact.tsx');
 const {availabilityMessage}=await vite.ssrLoadModule('/lib/marketplace-details.ts');
 const props={productTitle:'Bovinos & cría / lote',contactProfile:{responsibleName:'Productor ejemplo',phone:'0414 1234567',whatsapp:true}};
 const html=renderToStaticMarkup(React.createElement(ListingWhatsAppContact,props));
 assert.match(html,/Hablar con el vendedor por WhatsApp/);
 assert.ok(html.includes('https://wa.me/584141234567?text='+encodeURIComponent(availabilityMessage(props.productTitle))));
 assert.match(html,/target="_blank" rel="noopener noreferrer"/);
 assert.match(html,/Tú decides si lo envías/);
 for(const contactProfile of [undefined,{...props.contactProfile,whatsapp:false},{...props.contactProfile,phone:'1234567'},{...props.contactProfile,phone:'<script>'}]){
  const unavailable=renderToStaticMarkup(React.createElement(ListingWhatsAppContact,{...props,contactProfile}));
  assert.match(unavailable,/WhatsApp no disponible/);assert.match(unavailable,/<button[^>]*disabled=""/);assert.doesNotMatch(unavailable,/href=|wa\.me/);
 }
});
test('product detail leads with gallery, then compact title price and WhatsApp on every width',async()=>{
 const {MarketplaceDetail}=await vite.ssrLoadModule('/components/marketplace-detail.tsx');
 const {demoMarketplaceListings}=await vite.ssrLoadModule('/lib/marketplace-demo.ts');
 for(const id of ['demo-bovinos','demo-porcinos-engorde']){
  const listing=demoMarketplaceListings.find(row=>row.id===id);
  const html=renderToStaticMarkup(React.createElement(MarketplaceDetail,{listing,heading:false}));
  const header=html.match(/<header[\s\S]*?<\/header>/)?.[0];assert.ok(header);
  assert.match(header,/WhatsApp · Ejemplo/);assert.match(header,/Precio y disponibilidad por consultar|USD/);
  assert.match(header,/<h2[^>]*>/);assert.ok(header.includes(listing.title));
  assert.ok(html.indexOf('aria-label="Fotografías de')<html.indexOf('<header'));
  assert.ok(html.indexOf('data-marketplace-contact="whatsapp"')>html.indexOf('aria-label="Fotografías de'));
  assert.ok(html.indexOf('</header>')<html.indexOf('>Preparar oferta<'));
  assert.match(html,/max-h-\[420px\]/);assert.match(html,/object-contain/);
  assert.doesNotMatch(html,/https:\/\/wa\.me/);
  const fullPage=renderToStaticMarkup(React.createElement(MarketplaceDetail,{listing}));
  assert.equal((fullPage.match(/<h1\b/g)||[]).length,1);
  assert.ok(fullPage.indexOf('aria-label="Fotografías de')<fullPage.indexOf('<h1'));
 }
});
