import assert from 'node:assert/strict';
import test, {after} from 'node:test';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({appType: 'custom', configFile: false, root, resolve: {alias: {'@': root}}, server: {middlewareMode: true, hmr: false, ws: false, watch: null}});
after(() => vite.close());
const content = await vite.ssrLoadModule('/lib/public-image-content.ts');
const {storeProducts} = await vite.ssrLoadModule('/lib/store-products.ts');
const {demoPublicFarms, demoPosts} = await vite.ssrLoadModule('/lib/network-profile.ts');
const {professionalExamples} = await vite.ssrLoadModule('/lib/professional-examples.ts');
const {veterinaryCompanyDemo} = await vite.ssrLoadModule('/lib/company-demo.ts');
const {demoMarketplaceListings} = await vite.ssrLoadModule('/lib/marketplace-demo.ts');

const publishedContact = {responsibleName: 'Ana Productora', phone: '+58 (414) 123-4567', farmName: 'Finca La Cosecha', contactHours: 'Lunes a viernes', deliveryMode: 'Retiro en finca'};
const publishedListing = {
  id: 'public-listing', title: 'Cacao seco de cosecha', sellerName: 'Finca La Cosecha', description: 'Lote público de cacao, listo para consultar disponibilidad.',
  category: 'Cacao', location: 'Sucre', priceCents: 12950, currency: 'USD', status: 'active',
  contactProfile: publishedContact, imageUrl: '/public-cacao.webp',
  contact: JSON.stringify({version: 2, ...publishedContact, productDetails: {attributes: {weight: '50 kg', breed: 'Criollo'}, publicLocation: {latitude: 10, longitude: -64, precision: 'approximate', label: 'Punto público'}}}),
  saleFormat: 'Sacos', supplyUnit: 'kg', minimumOrder: '50 kg', buyerType: 'Personas y empresas',
};

const sensitive = {
  phone: 'private-phone-marker', contact: 'private-contact-marker', email: 'private-email-marker',
  responsibleName: 'private-responsible-marker', contactName: 'private-company-contact-marker',
  address: 'private-address-marker', ownerId: 'private-owner-marker', latitude: 'private-latitude-marker',
  longitude: 'private-longitude-marker', inventory: 'private-inventory-marker', taxId: 'private-tax-id-marker',
};
function assertPublicOnly(value) {
  const json = JSON.stringify(value);
  for (const marker of Object.values(sensitive)) assert.ok(!json.includes(marker), `Sharing must exclude ${marker}`);
  for (const key of Object.keys(sensitive)) assert.ok(!(key in value), `Sharing must not expose ${key}`);
}

test('store sharing preserves illustrative attribution, stage and product anchor', () => {
  for (const product of storeProducts) {
    const card = content.storeImageContent({...product, ...sensitive});
    assert.equal(card.title, product.name);
    assert.equal(card.path, `/tienda#producto-${product.id}`);
    assert.match(card.detail, /por confirmar/);
    assert.deepEqual(card.publicContact, {name: 'Parcela Los Morochos'});
    assertPublicOnly(card);
    if (product.image) {
      assert.equal(card.photo.src, product.image);
      assert.match(card.photo.caption, /No representa inventario confirmado/);
      if (product.imageCreditId) assert.equal(card.photo.creditHref, `/creditos-fotograficos#producto-${product.imageCreditId}`);
    }
  }
});

test('farm demos retain public description and photos without contact data', () => {
  for (const farm of demoPublicFarms) {
    const card = content.farmImageContent({...farm, ...sensitive});
    assert.equal(card.demo, true);
    assert.equal(card.path, `/fincas/${farm.id}`);
    assert.equal(card.description, farm.description);
    assert.ok(card.photo.caption);
    assertPublicOnly(card);
  }
  assert.equal(content.farmImageContent({...demoPublicFarms[0], demo: false, demoImage: undefined}).photo, undefined);
});

test('community cards keep text-only posts image-free and retain attached image credits', () => {
  const farm = {...demoPublicFarms[0], ...sensitive};
  const textOnly = {...demoPosts[0], ...sensitive, imageUrl: undefined, demo: false};
  const textCard = content.postImageContent(textOnly, farm);
  assert.equal(textCard.photo, undefined);
  assert.equal(textCard.path, `/red/${textOnly.id}`);
  assert.equal(textCard.description, textOnly.text);
  assertPublicOnly(textCard);
  const photo = {src: '/illustration.webp', alt: 'Example photograph', caption: 'Fictitious offer', creditHref: '/creditos-fotograficos#example', credit: {author: 'Original author', source: 'https://example.test/source', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'}};
  const attached = content.postImageContent({...textOnly, listing: {id: 'example-listing', demo: true, demoPhotos: [photo]}}, farm);
  assert.deepEqual(attached.photo, photo);
  assert.equal(attached.demo, true);
  assertPublicOnly(attached);
});

test('professional demo cards exclude contact and credentials while labeling AI portraits', () => {
  for (const profile of professionalExamples.filter(profile => profile.demo)) {
    const card = content.professionalImageContent({...profile, ...sensitive});
    assert.equal(card.demo, true);
    assert.equal(card.path, `/profesionales/${profile.id}`);
    assert.match(card.photo.caption, /generada por IA.*ficticio/);
    assertPublicOnly(card);
    assert.ok(!('credentialNote' in card));
    assert.ok(!('details' in card));
  }
});

test('company and product demo cards exclude contacts and distinguish documentary and AI samples', () => {
  const company = {...veterinaryCompanyDemo, ...sensitive};
  const card = content.companyImageContent(company);
  assert.equal(card.demo, true);
  assert.match(card.photo.caption, /creado con IA/);
  assertPublicOnly(card);
  for (const product of company.products) {
    const productCard = content.companyProductImageContent(company, {...product, ...sensitive});
    assert.equal(productCard.demo, true);
    assert.match(productCard.detail, /sin venta/);
    assert.equal(productCard.path, `/empresas/${company.id}#producto-${product.id}`);
    assertPublicOnly(productCard);
    if (product.id === 'demo-alimento') assert.doesNotMatch(productCard.photo.caption, /IA/);
    else assert.match(productCard.photo.caption, /creada con IA/);
  }
});

test('marketplace cards preserve the validated published phone, seller, price and product facts', () => {
  const card = content.marketplaceImageContent({...publishedListing, ...sensitive, contact: publishedListing.contact, contactProfile: publishedContact});
  assert.deepEqual(card.publicContact, {name: publishedContact.responsibleName, phone: publishedContact.phone});
  assert.equal(card.title, publishedListing.title);
  assert.equal(card.description, publishedListing.description);
  assert.equal(card.detail, 'Sucre · USD 129,5');
  assert.equal(card.path, '/marketplace/public-listing');
  assert.deepEqual(card.photo, {src: '/public-cacao.webp', alt: publishedListing.title, creditHref: undefined});
  for (const fact of ['Peso: 50 kg', 'Raza / variedad: Criollo', 'Presentación: Sacos', 'Unidad de venta: kg', 'Pedido mínimo: 50 kg', 'Dirigido a: Personas y empresas', 'Finca o empresa: Finca La Cosecha', 'Atención: Lunes a viernes', 'Entrega: Retiro en finca']) assert.ok(card.facts.includes(fact), fact);
  assertPublicOnly(card);
  assert.doesNotMatch(JSON.stringify(card), /latitude|longitude|publicLocation|contactProfile|ownerId/);
  const selectedPhoto = {src: '/selected-public.webp', alt: 'Foto seleccionada', creditHref: '/creditos#foto'};
  assert.deepEqual(content.marketplaceImageContent(publishedListing, selectedPhoto).photo, selectedPhoto);
  const stored = content.marketplaceImageContent({...publishedListing, contactProfile: undefined});
  assert.deepEqual(stored.publicContact, card.publicContact);
});

test('marketplace sharing never recovers phones from legacy text, account fields or invalid profiles', () => {
  const account = {phone: '+58 412 9999999', accountPhone: '+58 412 9999999', phoneE164: '+584129999999', owner: {phone: '+58 412 9999999'}};
  for (const contact of ['Llámame al +58 414 1234567', JSON.stringify({version: 2, legacyContact: '+58 414 1234567'}), JSON.stringify({responsibleName: 'Responsable', phone: 'https://private.example/phone'})]) {
    const card = content.marketplaceImageContent({...publishedListing, ...account, contact, contactProfile: undefined});
    assert.deepEqual(card.publicContact, {name: publishedListing.sellerName});
    assert.doesNotMatch(JSON.stringify(card), /412 9999999|584129999999|414 1234567|private\.example|legacyContact|accountPhone|phoneE164/);
  }
  for (const status of ['pending', 'rejected', 'deleted']) {
    const card = content.marketplaceImageContent({...publishedListing, status});
    assert.equal(card.publicContact, undefined);
    assert.ok(!card.facts.some(fact => fact.startsWith('Atención:') || fact.startsWith('Finca o empresa:')));
  }
});

test('real public farms, professionals, companies and products retain only their published contact fields', () => {
  const farm = {...demoPublicFarms[0], ...sensitive, id: 'public-farm', demo: false, status: 'active', responsibleName: 'Responsable público', phone: '+58 416 1234567'};
  const farmCard = content.farmImageContent(farm);
  assert.deepEqual(farmCard.publicContact, {name: farm.responsibleName, phone: farm.phone});
  assertPublicOnly(farmCard);
  const profile = {...professionalExamples[0], ...sensitive, demo: false, name: 'Profesional publicado', contact: '+58 424 1234567'};
  const professionalCard = content.professionalImageContent(profile);
  assert.deepEqual(professionalCard.publicContact, {name: profile.name, phone: profile.contact});
  assertPublicOnly(professionalCard);
  const company = {...veterinaryCompanyDemo, ...sensitive, demo: false, status: 'active', contactName: 'Atención comercial', phone: '+58 212 1234567'};
  for (const card of [content.companyImageContent(company), content.companyProductImageContent(company, company.products[0])]) {
    assert.deepEqual(card.publicContact, {name: company.contactName, phone: company.phone});
    assertPublicOnly(card);
  }
  assert.deepEqual(content.companyImageContent({...company, contactName: ''}).publicContact, {name: company.name, phone: company.phone});
  assert.deepEqual(content.companyImageContent({...company, contactName: '', name: 'A'.repeat(140)}).publicContact, {name: 'A'.repeat(140), phone: company.phone});
  assert.deepEqual(content.companyProductImageContent(company, {...company.products[0], unit: 'saco'}).facts, ['Unidad de venta: saco']);
  for (const contact of ['Contacta la cuenta privada', '123', '+58 414 1234567890123456789', 'https://example.com/contacto']) {
    assert.equal(content.professionalImageContent({...profile, contact}).publicContact.phone, undefined);
    assert.equal(content.farmImageContent({...farm, phone: contact}).publicContact.phone, undefined);
    assert.equal(content.companyImageContent({...company, phone: contact}).publicContact.phone, undefined);
  }
  for (const status of ['pending', 'rejected', 'deleted']) {
    assert.equal(content.farmImageContent({...farm, status}).publicContact, undefined);
    assert.equal(content.professionalImageContent({...profile, status}).publicContact, undefined);
    assert.equal(content.companyImageContent({...company, status}).publicContact, undefined);
    assert.equal(content.companyProductImageContent({...company, status}, company.products[0]).publicContact, undefined);
  }
});

test('community contact is taken only from its matching public farm, never post or attached listing contacts', () => {
  const farm = {...demoPublicFarms[0], id: 'public-farm', demo: false, status: 'active', responsibleName: 'Responsable publicado', phone: '+58 416 1234567'};
  const post = {...demoPosts[0], ...sensitive, farmId: farm.id, demo: false, listing: publishedListing};
  const card = content.postImageContent(post, farm);
  assert.deepEqual(card.publicContact, {name: farm.responsibleName, phone: farm.phone});
  assertPublicOnly(card);
  assert.equal(content.postImageContent({...post, farmId: 'different-farm'}, farm).publicContact, undefined);
  assert.equal(content.postImageContent(post, {...farm, status: 'pending'}).publicContact, undefined);
  assert.equal(content.postImageContent(post, {...farm, demo: true}).publicContact, undefined);
  assert.equal(content.postImageContent({...post, demo: true}, farm).publicContact, undefined);
  assert.equal(content.postImageContent({...post, listing: {...publishedListing, demo: true}}, farm).publicContact, undefined);
});

test('every demo suppresses a valid injected phone without inventing substitute contacts', () => {
  const phone = '+58 414 1234567';
  const demoFarm = {...demoPublicFarms[0], phone};
  const demoCompany = {...veterinaryCompanyDemo, phone};
  const cards = [
    ...demoMarketplaceListings.map(listing => content.marketplaceImageContent({...listing, contactProfile: {...publishedContact, phone}})),
    content.farmImageContent(demoFarm),
    content.postImageContent(demoPosts[0], demoFarm),
    ...professionalExamples.filter(profile => profile.demo).map(profile => content.professionalImageContent({...profile, contact: phone})),
    content.companyImageContent(demoCompany),
    ...demoCompany.products.map(product => content.companyProductImageContent(demoCompany, product)),
  ];
  for (const card of cards) {
    assert.equal(card.publicContact, undefined);
    assert.ok(!JSON.stringify(card).includes(phone));
  }
});

test('all requested public surfaces use image sharing and community no longer exports bare-link share actions', async () => {
  for (const file of ['components/store-catalog.tsx', 'components/agro-network.tsx', 'components/professional-profile-view.tsx', 'components/company-profile-view.tsx', 'app/fincas/[id]/page.tsx']) {
    const source = await readFile(`${root}/${file}`, 'utf8');
    assert.match(source, /ImageShareButton/);
  }
  const community = await readFile(`${root}/components/agro-network.tsx`, 'utf8');
  assert.doesNotMatch(community, /navigator\.share|function ShareLinks|<ShareLinks|twitter\.com\/intent\/tweet|facebook\.com\/sharer/);
  const store = await readFile(`${root}/components/store-catalog.tsx`, 'utf8');
  assert.match(store, /id=\{`producto-\$\{p\.id\}`\}/);
  assert.match(store, /ImageShareButton[^>]+className="button-light relative z-10/);
  const company = await readFile(`${root}/components/company-profile-view.tsx`, 'utf8');
  assert.match(company, /companyProductImageContent\(c,p\)/);
  assert.match(company, /id=\{`producto-\$\{p\.id\}`\}/);
});

test('documentary assets preserve original credit metadata while image text excludes URLs', async () => {
  const {socialImageCredit, socialImageAttribution, urlFreeSocialPhoto} = await vite.ssrLoadModule('/lib/social-image.ts');
  const cards = [
    ...storeProducts.map(content.storeImageContent),
    ...demoPublicFarms.map(content.farmImageContent),
    ...demoPosts.map(post => content.postImageContent(post, demoPublicFarms.find(farm => farm.id === post.farmId))),
    ...veterinaryCompanyDemo.products.map(product => content.companyProductImageContent(veterinaryCompanyDemo, product)),
  ];
  for (const card of cards) {
    if (!card.photo) continue;
    if (card.photo.src.startsWith('/company-examples/') || card.photo.src === '/demo-poultry.webp') {
      assert.match(card.photo.caption, /IA/);
      continue;
    }
    const credit = socialImageCredit(card.photo);
    assert.ok(credit?.author, `Missing author for ${card.photo.src}`);
    assert.ok(credit?.license, `Missing license for ${card.photo.src}`);
    assert.ok(credit?.source.startsWith('https://'), `Missing original source for ${card.photo.src}`);
    assert.ok(credit?.licenseUrl.startsWith('https://'), `Missing license link for ${card.photo.src}`);
    assert.deepEqual(socialImageAttribution(card.photo), []);
    if (/^CC BY/i.test(credit.license)) {const exportPhoto=urlFreeSocialPhoto(card.photo);assert.equal(exportPhoto.omitted,false);assert.notEqual(exportPhoto.photo.src,card.photo.src);}
  }
});

test('rendered public cards expose styled image controls without mounting previews or changing their main action', async () => {
  const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));
  const {StoreCatalog} = await vite.ssrLoadModule('/components/store-catalog.tsx');
  const {FarmCard, AgroNetwork} = await vite.ssrLoadModule('/components/agro-network.tsx');
  const {ProfessionalProfileView} = await vite.ssrLoadModule('/components/professional-profile-view.tsx');
  const {CompanyProfileView} = await vite.ssrLoadModule('/components/company-profile-view.tsx');
  const store = render(StoreCatalog, {});
  assert.equal((store.match(/>Compartir imagen<\/button>/g) || []).length, storeProducts.length);
  assert.match(store, /Elegir presentación/);
  assert.match(store, /class="button-light relative z-10 mt-3 w-full"/);
  const farm = render(FarmCard, {farm: demoPublicFarms[0]});
  assert.match(farm, /Compartir imagen/);
  assert.match(farm, /Conocer la finca/);
  const professional = render(ProfessionalProfileView, {profile: professionalExamples.find(profile => profile.demo)});
  assert.match(professional, /Compartir perfil en imagen/);
  const company = render(CompanyProfileView, {company: veterinaryCompanyDemo});
  assert.match(company, /Compartir empresa en imagen/);
  assert.equal((company.match(/>Compartir imagen<\/button>/g) || []).length, veterinaryCompanyDemo.products.length);
  const community = render(AgroNetwork, {initial: {farms: demoPublicFarms, mine: [], posts: demoPosts}});
  assert.match(community, /Compartir imagen/);
  assert.doesNotMatch(community, /Copiar para Instagram|sharer\.php|intent\/tweet/);
  for (const html of [store, farm, professional, company, community]) {
    assert.doesNotMatch(html, /data-image-share-panel/);
    assert.doesNotMatch(html, /Preparando imagen PNG/);
  }
});
