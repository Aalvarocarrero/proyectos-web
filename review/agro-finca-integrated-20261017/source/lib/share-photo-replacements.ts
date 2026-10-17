/** Export-only alternatives. Original page photos and attribution records stay untouched.
 * Permissions and pixel QA: docs/qa/share-photo-*-sources.json.
 * SVG alternatives are original project artwork, clearly marked as illustrations.
 */
type Replacement = {src: string; alt: string; kind: 'photo' | 'illustration'; fit: 'contain'};
const photo = (src: string, alt: string): Replacement => ({src, alt, kind:'photo', fit:'contain'});
const illustration = (name: string, alt: string): Replacement => ({src:`/share-photos/${name}-original.svg`,alt,kind:'illustration',fit:'contain'});
const cattle = photo('/share-photos/cattle-cc0.webp','Fotografía de referencia de ganado bovino; no corresponde a los animales de la oferta.');
const pigs = photo('/share-photos/farm-pigs-pexels.webp','Fotografía de referencia de porcinos adultos; no acredita peso ni características de la oferta.');
const beef = photo('/share-photos/beef-pexels.webp','Carne de res de referencia; corte y presentación por confirmar.');
const poultry = photo('/share-photos/chickens-free.webp','Aves de corral adultas de referencia; no corresponden al lote de la oferta.');
const field = photo('/photos/campo-merida.webp','Paisaje rural de referencia; no representa la propiedad anunciada.');
const nitrogen = photo('/share-photos/nitrogen-tank-pd.webp','Tanque de nitrógeno líquido de referencia; no acredita contenido ni características de la oferta.');
export const SHARE_PHOTO_REPLACEMENTS: Record<string, Replacement> = {
 '/photos/market-examples/demo-bovinos.webp':cattle,
 '/products/bovinos.webp':cattle,
 '/photos/ordeno.webp':cattle,
 '/photos/market-examples/demo-porcinos-engorde.webp':pigs,
 '/products/porcinos.webp':pigs,
 '/photos/market-examples/demo-aves-gallinas.webp':poultry,
 '/products/aves.webp':poultry,
 '/photos/market-examples/demo-equinos-yegua.webp':photo('/share-photos/horse-pexels.webp','Caballo de referencia; edad, sexo y alzada de la oferta no se deducen de esta foto.'),
 '/photos/market-examples/demo-ovinos-corderos.webp':photo('/share-photos/sheep-free.webp','Ovinos de referencia; no corresponden al lote de la oferta.'),
 '/photos/market-examples/demo-apicultura-extractor.webp':illustration('extractor','Ilustración original de un extractor de miel; equipo ficticio de referencia.'),
 '/photos/market-examples/demo-carnicos-caja-bovina.webp':beef,
 '/products/res.webp':beef,
 '/products/cerdo.webp':photo('/share-photos/pork-free.webp','Costillas de cerdo de referencia; corte y presentación por confirmar.'),
 '/products/pescado.webp':photo('/share-photos/fish-pexels.webp','Tilapias de referencia; especie y presentación disponibles por confirmar.'),
 '/products/frutas.webp':photo('/photos/market-examples/demo-frutas-pina.webp','Piñas ilustrativas; cosecha y variedad por confirmar.'),
 '/products/hortalizas.webp':photo('/photos/market-examples/demo-hortalizas-tomate.webp','Tomates ilustrativos; cosecha y variedad por confirmar.'),
 '/photos/market-examples/demo-genetica-tanque.webp':nitrogen,
 '/products/genetica.webp':nitrogen,
 '/photos/market-examples/demo-granos-maiz.webp':photo('/share-photos/maize-grains-cc0.webp','Granos de maíz de referencia; no corresponden a la cantidad ni al lote de la oferta.'),
 '/photos/market-examples/demo-nutricion-alimento.webp':illustration('pellets','Ilustración original de alimento peletizado, sin marca ni composición declarada.'),
 '/photos/market-examples/demo-veterinaria-envases.webp':illustration('envases','Ilustración original de envases vacíos de muestra; no son medicamentos.'),
 '/photos/market-examples/demo-fertilizantes-compost.webp':photo('/share-photos/compost-free.webp','Compost de referencia; no corresponde al producto ni la cantidad de la oferta.'),
 '/photos/market-examples/demo-maquinaria-rastra.webp':illustration('rastra','Ilustración original de una rastra de discos; equipo ficticio de referencia.'),
 '/photos/market-examples/demo-cercas-malla.webp':photo('/share-photos/farm-tools-free.webp','Pala, rastrillo y carretilla de referencia; no corresponden al equipo de la oferta.'),
 '/photos/market-examples/demo-finca-doce-hectareas.webp':field,
 '/photos/market-examples/demo-servicios-revision-cercas.webp':photo('/share-photos/rural-fence-pd.webp','Cerca rural de referencia; no representa el lugar del servicio.'),
 '/photos/paramo-siembra.webp':field,
 '/photos/amanecer-trujillo.webp':field,
 '/photos/jornada.webp':field,
 '/photos/faena-arrozal.webp':photo('/share-photos/rice-cc0.webp','Cultivo de arroz de referencia; no corresponde a la finca del ejemplo.'),
};
