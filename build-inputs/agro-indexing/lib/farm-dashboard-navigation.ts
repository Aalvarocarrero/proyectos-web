export const farmDashboardViews = ['overview', 'animals', 'land', 'production', 'intelligence', 'inventory', 'marketplace', 'sync', 'security', 'settings'] as const;
export type FarmDashboardView = typeof farmDashboardViews[number];

/** Only known workspace views can be selected by a guide link; all other input opens the map. */
export function farmDashboardViewFromSearch(search: string): FarmDashboardView {
  const view = new URLSearchParams(search).get('vista');
  return farmDashboardViews.includes(view as FarmDashboardView) ? view as FarmDashboardView : 'land';
}
