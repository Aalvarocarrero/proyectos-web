import { E as __toESM, b as require_react, l as usePathname, n as require_jsx_runtime } from "../index.js";
import { t as X } from "./x-CHtQ2pYl.js";
import { t as Lightbulb } from "./lightbulb-rhOIV-Ui.js";
import { t as Sprout } from "./sprout-DfDNS-vk.js";
import { t as MessageCircle } from "./message-circle-BeenzVnM.js";
import { t as Download } from "./download-CtKUAd8o.js";
import { t as ArrowUpRight } from "./arrow-up-right-4sSx04o4.js";
import { a as Trigger, i as Root2, n as Content2, r as Portal, t as Close } from "./dist-DHGV5ZND.js";
import { a as subscribeInstallAction, i as requestInstallAction, n as installActionSnapshot, t as installActionServerSnapshot } from "./install-action-C1mhv1ba.js";
import { t as Compass } from "./compass-DAVRLU-2.js";
import { n as OFFICIAL_SOCIAL_LINKS } from "./official-links-CA05kvbk.js";
//#region components/mobile-public-actions.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
/** Shared responsive entry points; existing dialogs and submission handlers own all work. */
function MobilePublicActions() {
	const pathname = usePathname();
	const [open, setOpen] = (0, import_react.useState)(false);
	const trigger = (0, import_react.useRef)(null);
	const dock = (0, import_react.useRef)(null);
	const [contentOverlap, setContentOverlap] = (0, import_react.useState)(false);
	const firstAction = (0, import_react.useRef)(null);
	const pendingIdea = (0, import_react.useRef)(false);
	const titleId = (0, import_react.useId)();
	const install = (0, import_react.useSyncExternalStore)(subscribeInstallAction, installActionSnapshot, installActionServerSnapshot);
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [pathname]);
	(0, import_react.useEffect)(() => {
		let frame = 0;
		const measure = () => {
			frame = 0;
			if (!dock.current) {
				setContentOverlap(false);
				return;
			}
			const target = dock.current.getBoundingClientRect();
			setContentOverlap(Array.from(document.querySelectorAll("#home-title, .home-hero .button-primary, .home-hero .button-glass")).some((element) => {
				const rect = element.getBoundingClientRect();
				return rect.left < target.right + 8 && rect.right > target.left - 8 && rect.top < target.bottom + 8 && rect.bottom > target.top - 8;
			}));
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(measure);
		};
		schedule();
		window.addEventListener("scroll", schedule, {
			passive: true,
			capture: true
		});
		window.addEventListener("resize", schedule);
		window.visualViewport?.addEventListener("resize", schedule);
		const observer = new ResizeObserver(schedule);
		const hero = document.querySelector(".home-hero");
		if (hero) observer.observe(hero);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			window.removeEventListener("scroll", schedule, true);
			window.removeEventListener("resize", schedule);
			window.visualViewport?.removeEventListener("resize", schedule);
		};
	}, [pathname]);
	if ([
		"/admin",
		"/juego-finca",
		"/finca-demo",
		"/finca-modelo"
	].some((route) => pathname === route || pathname.startsWith(route + "/"))) return null;
	const whatsapp = "https://wa.me/584264263601?text=" + encodeURIComponent("Hola, quisiera información sobre Venezuela Agro.");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: dock,
		className: "mobile-public-actions",
		"data-mobile-public-actions": true,
		"data-content-overlap": contentOverlap && !open,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			className: "mobile-public-action",
			"data-action-tone": "primary",
			href: whatsapp,
			target: "_blank",
			rel: "noopener noreferrer",
			"aria-label": "Contactar al equipo de Venezuela Agro por WhatsApp (abre otra pestaña)",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
				"aria-hidden": "true",
				size: 21
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "WhatsApp" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root2, {
			open,
			onOpenChange: setOpen,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					ref: trigger,
					"data-mobile-more": true,
					type: "button",
					className: "mobile-public-action",
					"data-action-tone": "secondary",
					"aria-label": "Explorar opciones de Venezuela Agro",
					"aria-expanded": open,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, {
						"aria-hidden": "true",
						size: 18
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Explorar" })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content2, {
				className: "mobile-public-menu",
				"data-mobile-public-menu": true,
				side: "top",
				align: "end",
				sideOffset: 12,
				collisionPadding: 12,
				"aria-labelledby": titleId,
				onOpenAutoFocus: (event) => {
					event.preventDefault();
					firstAction.current?.focus();
				},
				onCloseAutoFocus: (event) => {
					event.preventDefault();
					trigger.current?.focus();
					if (pendingIdea.current) {
						pendingIdea.current = false;
						setTimeout(() => document.querySelector(".idea-orb")?.click(), 0);
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: titleId,
						children: "Venezuela Agro"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Close, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Cerrar opciones",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								size: 20,
								"aria-hidden": "true"
							})
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						ref: firstAction,
						type: "button",
						onClick: () => {
							pendingIdea.current = true;
							setOpen(false);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, {
							size: 18,
							"aria-hidden": "true"
						}), "Compartir mi idea"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "/proyectos#presentar-proyecto",
						onClick: () => setOpen(false),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprout, {
							size: 18,
							"aria-hidden": "true"
						}), "Presentar mi proyecto"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: !install.ready || install.installed,
						onClick: () => {
							requestInstallAction();
							setOpen(false);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
							size: 18,
							"aria-hidden": "true"
						}), install.installed ? "Aplicación ya instalada" : "Instalar o añadir aplicación"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mobile-public-menu-label",
						children: "Redes oficiales"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						"aria-label": "Redes oficiales de Venezuela Agro",
						children: OFFICIAL_SOCIAL_LINKS.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: link.href,
							target: "_blank",
							rel: "noopener noreferrer",
							children: [
								link.label,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
									size: 15,
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: " (abre otra pestaña)"
								})
							]
						}, link.label))
					})
				]
			}) })]
		})]
	});
}
//#endregion
export { MobilePublicActions };
