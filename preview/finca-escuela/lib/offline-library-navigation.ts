export const offlineSections = ['inicio','tienda','rubros','aprende','marketplace','professional','farm','post','project','borradores'] as const;
export type OfflineLibrarySection = typeof offlineSections[number];
/** A namespaced hash keeps offline routes intact and supports native Back/Forward. */
export function readLibraryLocation(hash: string): { section: OfflineLibrarySection; detail: string } | null {
  if (!hash.startsWith('#biblioteca?')) return null;
  const params = new URLSearchParams(hash.slice('#biblioteca?'.length));
  const section = params.get('seccion');
  if (!offlineSections.includes(section as OfflineLibrarySection)) return null;
  return { section: section as OfflineLibrarySection, detail: params.get('guia') || '' };
}
export function libraryLocation(section: OfflineLibrarySection, detail = '') {
  const params = new URLSearchParams({ seccion: section });
  if (detail) params.set('guia', detail);
  return `#biblioteca?${params}`;
}
