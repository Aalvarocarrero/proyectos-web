import { z } from "zod";

const publicLink = (hosts?: string[]) => z.string().trim().max(500).default("").refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password && (!hosts || hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)));
  } catch { return false; }
}, "Introduce un enlace completo y válido de esta plataforma (https://…).");

export const listingContactSchema = z.object({
  responsibleName: z.string().trim().min(2, "Indica el nombre del responsable.").max(120),
  phone: z.string().trim().max(40).refine((value) => /^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15, "Introduce un teléfono válido, incluyendo el código de país."),
  farmName: z.string().trim().max(160).default(""),
  whatsapp: z.boolean().default(false),
  advertiserType: z.enum(["", "Productor agropecuario", "Finca familiar", "Cooperativa", "Distribuidor", "Profesional / servicios", "Otro"]).default(""),
  contactHours: z.string().trim().max(120).default(""),
  deliveryMode: z.enum(["", "Retiro en finca", "Entrega a convenir", "Retiro o entrega"]).default(""),
  instagram: publicLink(["instagram.com"]),
  facebook: publicLink(["facebook.com", "fb.com", "fb.me"]),
  tiktok: publicLink(["tiktok.com"]),
  youtube: publicLink(["youtube.com", "youtu.be"]),
  googleBusiness: publicLink(["google.com", "maps.app.goo.gl", "g.page"]),
  website: publicLink(),
});
export type ListingContact = z.infer<typeof listingContactSchema>;

// Keep the existing contact column and older records compatible; no data migration is required.
export function encodeListingContact(profile: ListingContact) {
  return JSON.stringify({ version: 1, ...profile });
}
export function readListingContact(contact?: string | null, profile?: unknown): ListingContact | null {
  if (profile) {
    const parsed = listingContactSchema.safeParse(profile);
    if (parsed.success) return parsed.data;
  }
  if (!contact?.startsWith("{")) return null;
  try {
    const parsed = listingContactSchema.safeParse(JSON.parse(contact));
    return parsed.success ? parsed.data : null;
  } catch { return null; }
}
export function phoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("0") ? `58${digits.slice(1)}` : digits;
}
