/** Match a page and its descendants, never a similarly named sibling or anchor. */
export function isNavigationActive(pathname: string | null, href: string): boolean {
  if (!pathname || href.includes('#')) return false;
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
}
