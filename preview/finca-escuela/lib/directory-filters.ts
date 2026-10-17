/** Only public search filters belong in the URL. Preserve unrelated route parameters. */
export function readDirectoryFilters<T extends Record<string, string>>(search: string, defaults: T): T {
  const params = new URLSearchParams(search);
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, params.get(key) ?? fallback])) as T;
}

export function updateDirectoryFilters<T extends Record<string, string>>(href: string, defaults: T, changes: Partial<T>): string {
  const url = new URL(href);
  for (const [key, value] of Object.entries(changes)) {
    if (!(key in defaults) || value === undefined) continue;
    if (value === defaults[key] || !value) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Never turn a stored browsing preference into an external or unrelated destination. */
export function safeDirectoryReturn(value: string | null, path: string): string {
  if (!value) return path;
  try {
    const url = new URL(value, "https://directory.invalid");
    return url.origin === "https://directory.invalid" && url.pathname === path ? `${url.pathname}${url.search}` : path;
  } catch { return path; }
}
