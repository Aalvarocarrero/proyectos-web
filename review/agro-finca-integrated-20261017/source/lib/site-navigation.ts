/** Ordered by the producer's next task; account-only actions remain in SessionMenu. */
export const primaryNavigation = [
  ["Mi finca", "/app"],
  ["Mercado Agro", "/marketplace"],
  ["Profesionales", "/profesionales"],
  ["Aprende", "/aprende"],
  ["Comunidad", "/red"],
] as const;

// Mi finca is already the persistent account/workspace CTA in the desktop bar.
export const desktopNavigation = primaryNavigation.filter(([, href]) => href !== "/app");

export const navigationGroups = [
  { label: "Gestionar mi finca", links: [
    ["Descargar sin señal", "/biblioteca-local"],
    ["Fincas de Venezuela", "/fincas"],
  ] },
  { label: "Comprar y buscar apoyo", links: [
    ["Productos Parcela Los Morochos", "/tienda"],
    ["Empresas e insumos", "/empresas"],
    ["Instituciones", "/guia-institucional"],
  ] },
  { label: "Conocer y participar", links: [
    ["Proyectos", "/proyectos"],
    ["Stickers del agro", "/stickers"],
    ["Nuestra producción", "/#produccion"],
    ["Nosotros", "/nosotros"],
  ] },
] as const;
