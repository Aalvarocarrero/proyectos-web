const clean = (value: string) => value.replace(/\s+/g, " ").trim();

export function buildListingSeo(input: {
  title: string;
  category: string;
  state: string;
  municipality?: string;
  shortIntro: string;
  photoContext: string;
  saleFormat?: string;
  supplyUnit?: string;
}) {
  const place = clean([input.municipality, input.state, "Venezuela"].filter(Boolean).join(", "));
  const title = clean(input.title);
  const category = clean(input.category);
  const seoTitle = clean(`${title} en ${place} | Mercado Agro`).slice(0, 160);
  const availability = [input.saleFormat, input.supplyUnit ? `por ${input.supplyUnit}` : ""].filter(Boolean).join(" · ");
  const seoDescription = clean(`${input.shortIntro} ${category}${availability ? `: ${availability}` : ""} disponible en ${place}. Publicación del Mercado Agro de Parcela Los Morochos.`).slice(0, 300);
  const imageAlt = clean(`${input.photoContext}. ${title}, ${category}, en ${place}.`).slice(0, 300);
  return { seoTitle, seoDescription, imageAlt };
}
