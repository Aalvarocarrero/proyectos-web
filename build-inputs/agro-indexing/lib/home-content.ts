import { z } from "zod";

const copy = (max: number) => z.string().trim().min(1, "Escribe un texto.").max(max).refine(value => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value), "Usa texto sin etiquetas HTML.");
export const homeImagePath = z.string().regex(/^(?:\/hero-apure-1200\.webp|\/api\/home-media\/[a-f0-9-]{36}\.(?:webp|jpg|png))$/);
export const homeContentSchema = z.object({
  heroEyebrow: copy(90), heroTitle: copy(90), heroSubtitle: copy(90), heroDescription: copy(360),
  heroPrimaryLabel: copy(60), heroSecondaryLabel: copy(60), heroHint: copy(160),
  heroImage: homeImagePath, heroImageAlt: copy(180),
  farmEyebrow: copy(90), farmTitle: copy(150), farmDescription: copy(360),
  seoTitle: copy(100), seoDescription: copy(320),
}).strict();
export type HomeContent = z.infer<typeof homeContentSchema>;
export const HOME_DEFAULTS: HomeContent = {
  heroEyebrow: "HECHO PARA EL PRODUCTOR VENEZOLANO", heroTitle: "Tu finca, organizada.", heroSubtitle: "Tu campo, conectado.",
  heroDescription: "Lleva tus animales, cultivos y cuentas con Mi Finca. Encuentra productos, conocimiento y personas para seguir creciendo.",
  heroPrimaryLabel: "Explorar finca modelo", heroSecondaryLabel: "Crear mi finca", heroHint: "Primero conoce la herramienta con una finca de ejemplo.",
  heroImage: "/hero-apure-1200.webp", heroImageAlt: "Paisaje productivo tropical de los llanos venezolanos al amanecer",
  farmEyebrow: "MI FINCA · TU HERRAMIENTA DE CADA DÍA", farmTitle: "Del terreno a los registros. Todo en su lugar.",
  farmDescription: "Visualiza tu terreno y organiza lo que pasa en él. Menos datos dispersos, más claridad para el trabajo de cada día.",
  seoTitle: "VenezuelaAgro | Gestión de fincas y mercado agropecuario en Venezuela",
  seoDescription: "VenezuelaAgro conecta productores, profesionales y empresas de Venezuela. Gestión local de fincas sin señal, mercado agropecuario y comunidad. Hecho por Parcela Los Morochos.",
};
export function parseHomeContent(json: string | null | undefined): HomeContent | null {
  try { const result = homeContentSchema.safeParse(JSON.parse(json || "null")); return result.success ? result.data : null; } catch { return null; }
}
export const homeMutationSchema = z.discriminatedUnion("action", [
  z.object({action: z.literal("save"), expectedRevision: z.string().uuid().nullable(), content: homeContentSchema}).strict(),
  z.object({action: z.literal("publish"), expectedRevision: z.string().uuid()}).strict(),
]);
