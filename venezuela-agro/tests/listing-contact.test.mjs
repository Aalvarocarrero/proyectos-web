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
});
