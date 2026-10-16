import { E as __toESM, b as require_react, l as usePathname, n as require_jsx_runtime } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-ZIVktEBq.js";
import { t as Check } from "./check-D7kn-cfT.js";
import { t as Link } from "./link-CTsUsqTe.js";
import { ConnectionIndicator, n as PopoverContent, r as PopoverTrigger, t as Popover } from "./connection-indicator-DpEs-ntT.js";
import { t as VenezuelaAgroLogo } from "./venezuelaagro-logo-DvpF7I67.js";
import { t as ChevronDown } from "./chevron-down-CVMRqVWl.js";
import { t as UserRound } from "./user-round-BrCc97k9.js";
import { n as OFFICIAL_SOCIAL_LINKS } from "./official-links-CA05kvbk.js";
import { SessionMenu } from "./session-menu-CN6OlFhc.js";
//#region lib/navigation-state.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** Match a page and its descendants, never a similarly named sibling or anchor. */
function isNavigationActive(pathname, href) {
	if (!pathname || href.includes("#")) return false;
	return pathname === href || href !== "/" && pathname.startsWith(`${href}/`);
}
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Menu = createLucideIcon("menu", [
	["path", {
		d: "M4 5h16",
		key: "1tepv9"
	}],
	["path", {
		d: "M4 12h16",
		key: "1lakjw"
	}],
	["path", {
		d: "M4 19h16",
		key: "1djgab"
	}]
]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Accessibility = createLucideIcon("accessibility", [
	["circle", {
		cx: "16",
		cy: "4",
		r: "1",
		key: "1grugj"
	}],
	["path", {
		d: "m18 19 1-7-6 1",
		key: "r0i19z"
	}],
	["path", {
		d: "m5 8 3-3 5.5 3-2.36 3.5",
		key: "9ptxx2"
	}],
	["path", {
		d: "M4.24 14.5a5 5 0 0 0 6.88 6",
		key: "10kmtu"
	}],
	["path", {
		d: "M13.76 17.5a5 5 0 0 0-6.88-6",
		key: "2qq6rc"
	}]
]);
//#endregion
//#region components/accessibility-menu.tsx
var import_jsx_runtime = require_jsx_runtime();
var defaults = {
	largeText: false,
	highContrast: false,
	reduceMotion: false
};
function AccessibilityMenu({ variant = "icon" }) {
	const [prefs, setPrefs] = (0, import_react.useState)(defaults);
	(0, import_react.useEffect)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("morochos-accessibility") || "null");
			if (saved) {
				apply(saved);
				requestAnimationFrame(() => setPrefs(saved));
			}
		} catch {}
	}, []);
	function update(key) {
		const next = {
			...prefs,
			[key]: !prefs[key]
		};
		setPrefs(next);
		apply(next);
		try {
			localStorage.setItem("morochos-accessibility", JSON.stringify(next));
		} catch {}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: variant === "menu" ? "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-base text-white/85 hover:bg-white/8" : "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/85",
			"aria-label": "Opciones de accesibilidad",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accessibility, {
				size: 18,
				"aria-hidden": "true"
			}), variant === "menu" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Accesibilidad" })]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
		align: "end",
		sideOffset: 8,
		collisionPadding: 12,
		className: "z-[130] max-h-[var(--radix-popover-content-available-height)] w-72 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl border border-white/10 bg-[#211d1a] p-3 text-white shadow-2xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-2 pb-2 text-xs font-bold tracking-wider text-white/45",
			children: "LECTURA Y MOVIMIENTO"
		}), [
			["largeText", "Texto más grande"],
			["highContrast", "Mayor contraste"],
			["reduceMotion", "Reducir movimientos"]
		].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-pressed": prefs[key],
			onClick: () => update(key),
			className: "flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm hover:bg-white/8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), prefs[key] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
				size: 17,
				className: "text-[#b7d79a]"
			})]
		}, key))]
	})] });
}
function apply(prefs) {
	const root = document.documentElement;
	root.dataset.largeText = String(prefs.largeText);
	root.dataset.highContrast = String(prefs.highContrast);
	root.dataset.reduceMotion = String(prefs.reduceMotion);
}
//#endregion
//#region lib/site-navigation.ts
/** Ordered by the producer's next task; account-only actions remain in SessionMenu. */
var primaryNavigation = [
	["Mi finca", "/app"],
	["Mercado Agro", "/marketplace"],
	["Profesionales", "/profesionales"],
	["Aprende", "/aprende"],
	["Comunidad", "/red"]
];
var desktopNavigation = primaryNavigation.filter(([, href]) => href !== "/app");
var navigationGroups = [
	{
		label: "Gestionar mi finca",
		links: [["Descargar sin señal", "/biblioteca-local"], ["Fincas de Venezuela", "/fincas"]]
	},
	{
		label: "Comprar y buscar apoyo",
		links: [
			["Productos Parcela Los Morochos", "/tienda"],
			["Empresas e insumos", "/empresas"],
			["Instituciones", "/guia-institucional"]
		]
	},
	{
		label: "Conocer y participar",
		links: [
			["Proyectos", "/proyectos"],
			["Stickers del agro", "/stickers"],
			["Nuestra producción", "/#produccion"],
			["Nosotros", "/nosotros"]
		]
	}
];
//#endregion
//#region components/site-header.tsx
function SiteHeader() {
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const pathname = usePathname();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "site-header fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5",
		children: [pathname !== "/" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "interior-skip-link",
			onClick: () => {
				const heading = document.querySelector("main h1");
				if (heading) {
					heading.tabIndex = -1;
					heading.focus({ preventScroll: true });
					heading.scrollIntoView({
						block: "center",
						behavior: "instant"
					});
				}
			},
			children: "Saltar al contenido"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "brand-toolbar mx-auto flex min-h-[64px] sm:min-h-[72px] max-w-[1420px] items-center justify-between gap-2 rounded-2xl border border-white/15 bg-[#171512]/88 px-2.5 py-2 text-white shadow-[0_14px_48px_rgba(0,0,0,.2)] backdrop-blur-2xl sm:px-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					href: "/",
					className: "flex min-w-0 items-center gap-2.5",
					"aria-label": "Venezuela Agro, hecho por Parcela Los Morochos — inicio",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 leading-tight",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VenezuelaAgroLogo, { compact: true })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden items-center gap-5 min-[1200px]:flex",
					"aria-label": "Navegación principal",
					children: desktopNavigation.map(([label, href]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						href,
						"aria-current": isNavigationActive(pathname, href) ? "page" : void 0,
						className: "nav-link inline-flex min-h-11 items-center text-sm text-white/80 transition hover:text-white",
						children: label
					}, label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-1 sm:gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionIndicator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							href: "/app",
							"aria-label": "Abrir Mi finca",
							"aria-current": isNavigationActive(pathname, "/app") || pathname === "/app-local" ? "page" : void 0,
							className: "pressable inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-[#f3ebdd] px-3 text-xs font-semibold text-[#211d1a] sm:gap-2 sm:px-4 sm:text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {
								size: 16,
								className: "min-[360px]:hidden sm:block",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden min-[360px]:inline",
								children: "Mi finca"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
							open: menuOpen,
							onOpenChange: setMenuOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/90",
									"aria-label": menuOpen ? "Cerrar navegación" : "Abrir navegación",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { size: 19 })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
								align: "end",
								sideOffset: 16,
								collisionPadding: 12,
								className: "brand-menu z-[100] w-80 max-w-[calc(100vw-1.5rem)] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto rounded-2xl border-white/15 bg-[#211d1a] p-2 text-white shadow-2xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
									"aria-label": "Navegación del menú",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "px-4 pb-2 pt-3 text-xs font-bold uppercase tracking-wider text-[#b7d79a]",
											children: "¿Qué necesitas hacer?"
										}),
										primaryNavigation.map(([label, href]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											href,
											onClick: () => setMenuOpen(false),
											"aria-current": isNavigationActive(pathname, href) ? "page" : void 0,
											className: "nav-link block rounded-xl px-4 py-3 text-base text-white/85 hover:bg-white/8 hover:text-white",
											children: label
										}, label)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "my-2 border-y border-white/15 py-2",
											children: navigationGroups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
												className: "group/navigation",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
													className: "flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/8 [&::-webkit-details-marker]:hidden",
													children: [group.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
														size: 16,
														className: "shrink-0 transition-transform group-open/navigation:rotate-180",
														"aria-hidden": "true"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "pb-2 pl-2",
													children: group.links.map(([label, href]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														href,
														onClick: () => setMenuOpen(false),
														"aria-current": isNavigationActive(pathname, href) ? "page" : void 0,
														className: "nav-link block min-h-11 rounded-xl px-4 py-3 text-sm leading-6 text-white/75 hover:bg-white/8 hover:text-white",
														children: label
													}, href))
												})]
											}, group.label))
										}),
										pathname !== "/finca-demo" && !pathname?.startsWith("/finca-demo/") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: "#participar",
											onClick: () => setMenuOpen(false),
											className: "participation-menu-link nav-link rounded-xl px-4 py-3 text-base text-white/85 hover:bg-white/8 hover:text-white",
											children: "Compartir idea o proyecto"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessibilityMenu, { variant: "menu" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionMenu, { onNavigate: () => setMenuOpen(false) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 border-t border-white/15 px-4 pt-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-bold text-white/60",
												children: "Redes oficiales"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-2 flex flex-wrap gap-3",
												children: OFFICIAL_SOCIAL_LINKS.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
													href: link.href,
													target: "_blank",
													rel: "noreferrer",
													className: "min-h-11 py-2 text-sm text-white underline",
													children: link.label
												}, link.label))
											})]
										})
									]
								})
							})]
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { SiteHeader };
