import type { PublicFarm } from "@/lib/network-profile";

const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim().replace(/\s+/g, " ");

/** Search the same public production and activity fields described by the directory. */
export function filterPublicFarms(farms: readonly PublicFarm[], query: string, state: string): PublicFarm[] {
  const search = normalized(query);
  return farms.filter(farm => (!state || farm.state === state) && normalized([farm.name, farm.rubrics, farm.state, farm.municipality, farm.description, ...farm.purposes].join(" ")).includes(search));
}
