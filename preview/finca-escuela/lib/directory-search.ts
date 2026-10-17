/** Public search accepts the way people type on a phone, with or without accents. */
export function normalizeDirectorySearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

export function matchesDirectorySearch(values: Array<unknown>, query: string): boolean {
  const search = normalizeDirectorySearch(query);
  return !search || normalizeDirectorySearch(values.filter(value => value != null).join(" ")).includes(search);
}
