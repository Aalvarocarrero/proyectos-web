//#region lib/agro-catalog.ts
var agroFamilies = [
	{
		name: "Cereales",
		emoji: "🌾",
		kind: "Cultivos",
		items: [
			"Arroz",
			"Maíz",
			"Maíz blanco",
			"Maíz amarillo",
			"Maíz dulce",
			"Sorgo",
			"Trigo",
			"Avena",
			"Cebada"
		]
	},
	{
		name: "Leguminosas",
		emoji: "🫘",
		kind: "Cultivos",
		items: [
			"Caraota",
			"Caraota negra",
			"Caraota blanca",
			"Caraota roja",
			"Frijol",
			"Frijol chino",
			"Frijol bayo",
			"Frijol pico negro",
			"Quinchoncho",
			"Arveja",
			"Haba",
			"Tapiramo",
			"Chivata",
			"Garbanzo",
			"Lenteja"
		]
	},
	{
		name: "Raíces y tubérculos",
		emoji: "🥔",
		kind: "Cultivos",
		items: [
			"Papa",
			"Yuca",
			"Apio",
			"Batata",
			"Mapuey",
			"Ñame",
			"Ocumo",
			"Ocumo chino"
		]
	},
	{
		name: "Verduras y hortalizas",
		emoji: "🥬",
		kind: "Cultivos",
		items: [
			"Cebolla",
			"Zanahoria",
			"Tomate",
			"Pimentón",
			"Repollo",
			"Lechuga",
			"Remolacha",
			"Pepino",
			"Ajo",
			"Berenjena",
			"Coliflor",
			"Vainita",
			"Ají dulce",
			"Ají picante",
			"Auyama",
			"Calabacín",
			"Chayota",
			"Brócoli",
			"Cilantro",
			"Perejil",
			"Cebollín",
			"Ajoporro",
			"Apio España",
			"Espinaca",
			"Acelga",
			"Berro",
			"Rábano",
			"Nabo",
			"Quimbombó",
			"Espárrago",
			"Alcachofa"
		]
	},
	{
		name: "Frutas",
		emoji: "🍍",
		kind: "Cultivos",
		items: [
			"Cambur",
			"Plátano",
			"Naranja",
			"Mandarina",
			"Limón",
			"Lima",
			"Toronja",
			"Piña",
			"Mango",
			"Aguacate",
			"Uva",
			"Patilla",
			"Lechosa",
			"Melón",
			"Fresa",
			"Guayaba",
			"Guanábana",
			"Parchita",
			"Níspero",
			"Merey",
			"Mamón",
			"Tamarindo",
			"Ciruela",
			"Durazno",
			"Manzana",
			"Pera",
			"Higo",
			"Granada",
			"Semeruco",
			"Caimito",
			"Anón",
			"Pijiguao",
			"Tomate de árbol"
		]
	},
	{
		name: "Oleaginosas y fibras",
		emoji: "🌻",
		kind: "Cultivos",
		items: [
			"Palma aceitera",
			"Coco",
			"Soya",
			"Girasol",
			"Algodón",
			"Sisal",
			"Ajonjolí",
			"Maní",
			"Ricino"
		]
	},
	{
		name: "Cultivos tropicales",
		emoji: "☕",
		kind: "Cultivos",
		items: [
			"Caña de azúcar",
			"Café",
			"Cacao",
			"Tabaco",
			"Caucho"
		]
	},
	{
		name: "Pastos, viveros y forestales",
		emoji: "🌱",
		kind: "Cultivos",
		items: [
			"Pasto",
			"Forrajes",
			"Pasto de corte",
			"Pasto de pastoreo",
			"Leucaena",
			"Moringa",
			"Bambú",
			"Teca",
			"Pino",
			"Eucalipto",
			"Plantas ornamentales",
			"Flores",
			"Plantas aromáticas",
			"Plantas medicinales",
			"Plántulas",
			"Árboles frutales"
		]
	},
	{
		name: "Bovinos",
		emoji: "🐄",
		kind: "Animales",
		items: [
			"Bovino",
			"Novilla",
			"Novillo",
			"Vaca",
			"Toro",
			"Becerro",
			"Búfalo",
			"Becerra"
		]
	},
	{
		name: "Porcinos",
		emoji: "🐖",
		kind: "Animales",
		items: [
			"Porcino",
			"Lechón",
			"Cerdo de engorde",
			"Cerda reproductora",
			"Verraco"
		]
	},
	{
		name: "Aves",
		emoji: "🐓",
		kind: "Animales",
		items: [
			"Ave",
			"Pollo de engorde",
			"Gallina ponedora",
			"Pollita",
			"Gallo",
			"Codorniz",
			"Pavo",
			"Pato",
			"Ganso"
		]
	},
	{
		name: "Equinos",
		emoji: "🐎",
		kind: "Animales",
		items: [
			"Equino",
			"Caballo",
			"Yegua",
			"Potro",
			"Burro",
			"Mula"
		]
	},
	{
		name: "Ovinos y caprinos",
		emoji: "🐐",
		kind: "Animales",
		items: [
			"Ovino / caprino",
			"Ovino",
			"Caprino",
			"Oveja",
			"Carnero",
			"Cordero",
			"Cabra",
			"Chivo"
		]
	},
	{
		name: "Piscicultura",
		emoji: "🐟",
		kind: "Animales",
		items: [
			"Pez",
			"Tilapia",
			"Cachama",
			"Trucha",
			"Bagre",
			"Bocachico",
			"Coporo",
			"Alevines",
			"Camarón",
			"Langostino"
		]
	},
	{
		name: "Apicultura y crías alternativas",
		emoji: "🐝",
		kind: "Animales",
		items: [
			"Colmena",
			"Abejas",
			"Núcleos de abejas",
			"Reinas",
			"Conejo",
			"Lombrices"
		]
	},
	{
		name: "Cárnicos",
		emoji: "🥩",
		kind: "Productos",
		items: [
			"Carne bovina",
			"Carne porcina",
			"Carne de pollo",
			"Carne ovina",
			"Carne caprina",
			"Pescado",
			"Canales",
			"Cortes",
			"Vísceras"
		]
	},
	{
		name: "Lácteos, huevos y derivados",
		emoji: "🥛",
		kind: "Productos",
		items: [
			"Leche",
			"Leche de vaca",
			"Leche de búfala",
			"Leche de cabra",
			"Queso",
			"Yogur",
			"Mantequilla",
			"Huevos",
			"Miel",
			"Polen",
			"Propóleo",
			"Cera de abejas",
			"Café tostado",
			"Cacao fermentado",
			"Chocolate",
			"Panela",
			"Papelón",
			"Azúcar",
			"Harinas",
			"Aceites vegetales",
			"Pulpa de frutas",
			"Casabe"
		]
	},
	{
		name: "Genética y reproducción",
		emoji: "🧬",
		kind: "Insumos",
		items: [
			"Semen",
			"Embriones",
			"Reproductores",
			"Huevos fértiles",
			"Material vegetal",
			"Esquejes",
			"Injertos"
		]
	},
	{
		name: "Semillas y plantas",
		emoji: "🌱",
		kind: "Insumos",
		items: [
			"Semillas",
			"Semillas de pasto",
			"Semillas de hortalizas",
			"Semillas de cereales",
			"Semillas de leguminosas",
			"Viveros",
			"Sustratos"
		]
	},
	{
		name: "Nutrición animal",
		emoji: "🧂",
		kind: "Insumos",
		items: [
			"Alimento balanceado",
			"Heno",
			"Ensilaje",
			"Melaza",
			"Sal mineral",
			"Suplementos",
			"Materia prima para alimento"
		]
	},
	{
		name: "Vitaminas y medicinas",
		emoji: "💊",
		kind: "Insumos",
		items: [
			"Vitaminas",
			"Suplementos veterinarios",
			"Medicamentos veterinarios",
			"Vacunas",
			"Material veterinario"
		]
	},
	{
		name: "Fertilizantes y control",
		emoji: "🧪",
		kind: "Insumos",
		items: [
			"Fertilizantes",
			"Abonos orgánicos",
			"Bioinsumos",
			"Control biológico",
			"Control fitosanitario",
			"Compost"
		]
	},
	{
		name: "Maquinaria agrícola",
		emoji: "🚜",
		kind: "Servicios",
		items: [
			"Tractores",
			"Implementos agrícolas",
			"Cosechadoras",
			"Repuestos",
			"Desmalezadoras",
			"Motosierras",
			"Bombas",
			"Riego",
			"Silos",
			"Equipos de ordeño"
		]
	},
	{
		name: "Drones y tecnología",
		emoji: "🚁",
		kind: "Servicios",
		items: [
			"Drones agrícolas",
			"Sensores",
			"Automatización",
			"Software agropecuario",
			"Cartografía"
		]
	},
	{
		name: "Herramientas y cercas",
		emoji: "🛠️",
		kind: "Insumos",
		items: [
			"Alambre",
			"Cercas",
			"Postes",
			"Alicates",
			"Herramientas manuales",
			"Cercas eléctricas"
		]
	},
	{
		name: "Fincas y terrenos",
		emoji: "🏡",
		kind: "Servicios",
		items: [
			"Fincas",
			"Terrenos",
			"Arrendamiento rural",
			"Instalaciones productivas"
		]
	},
	{
		name: "Servicios agropecuarios",
		emoji: "🤝",
		kind: "Servicios",
		items: [
			"Veterinaria",
			"Agronomía",
			"Zootecnia",
			"Transporte agropecuario",
			"Logística",
			"Almacenamiento",
			"Secado",
			"Asistencia técnica",
			"Capacitación",
			"Marketing agropecuario"
		]
	}
];
var cropNames = [...new Set(agroFamilies.filter((f) => f.kind === "Cultivos").flatMap((f) => f.items))];
var animalNames = [...new Set(agroFamilies.filter((f) => f.kind === "Animales").flatMap((f) => f.items))];
var productionRubrics = [...new Set([...cropNames, ...animalNames])];
var agroEntries = agroFamilies.flatMap((f) => f.items.map((name) => ({
	name,
	parent: f.name,
	emoji: f.emoji,
	kind: f.kind
})));
function findAgroEntry(name) {
	return agroEntries.find((entry) => entry.name === name);
}
//#endregion
export { findAgroEntry as a, cropNames as i, agroFamilies as n, productionRubrics as o, animalNames as r, agroEntries as t };
