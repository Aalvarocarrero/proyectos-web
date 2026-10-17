import { E as __toESM, b as require_react, l as usePathname, n as require_jsx_runtime } from "../index.js";
import { t as X } from "./x-DB9nLDwG.js";
import { t as Share2 } from "./share-2-5se2SQb9.js";
import { a as YouTubeIcon, i as TikTokIcon, n as InstagramIcon, r as ThreadsIcon, t as FacebookIcon } from "./brand-icons-VNAOb6KX.js";
import { t as ArrowUpRight } from "./arrow-up-right-CFz5Ndmb.js";
import { a as Trigger, i as Root2, n as Content2, r as Portal, t as Close } from "./dist-DdxLtTHE.js";
import { n as OFFICIAL_SOCIAL_LINKS, t as OFFICIAL_HANDLE } from "./official-links-CA05kvbk.js";
//#region lib/social-position.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** Position the social control, never the page's primary actions. All coordinates are layout-viewport pixels. */
function chooseSocialPosition(options) {
	const { viewport, button, panel, obstacles } = options;
	const inset = options.insets ?? {};
	const left = viewport.left + Math.max(12, inset.left ?? 0);
	const right = viewport.left + viewport.width - Math.max(12, inset.right ?? 0);
	const top = viewport.top + Math.max(12, inset.top ?? 0);
	const bottom = viewport.top + viewport.height - Math.max(12, inset.bottom ?? 0);
	const width = Math.max(0, right - left), height = Math.max(0, bottom - top);
	const gap = 10, clearance = 10;
	const side = width >= button.width + gap + 160 ? "left" : "top";
	const panelWidth = Math.max(0, Math.min(panel?.width ?? 224, side === "left" ? width - button.width - gap : width));
	const combinedLeft = right - (panel ? side === "left" ? button.width + gap + panelWidth : Math.max(button.width, panelWidth) : button.width);
	const intervals = obstacles.filter((rect) => rect.right + clearance > combinedLeft && rect.left - clearance < right && rect.bottom + clearance > top && rect.top - clearance < bottom).map((rect) => ({
		top: Math.max(top, rect.top - clearance),
		bottom: Math.min(bottom, rect.bottom + clearance)
	})).filter((rect) => rect.bottom > rect.top).sort((a, b) => a.top - b.top);
	const free = [];
	let cursor = top;
	for (const interval of intervals) {
		if (interval.top > cursor) free.push({
			top: cursor,
			bottom: interval.top
		});
		cursor = Math.max(cursor, interval.bottom);
	}
	if (cursor < bottom) free.push({
		top: cursor,
		bottom
	});
	const panelExtra = panel && side === "top" ? button.height + gap : 0;
	const preferredMinimum = panel ? Math.max(button.height, panelExtra + Math.min(120, panel.height)) : button.height;
	const absoluteMinimum = panel ? Math.max(button.height, panelExtra + 72) : button.height;
	const selected = [...free].reverse().find((rect) => rect.bottom - rect.top >= preferredMinimum) ?? [...free].sort((a, b) => b.bottom - b.top - (a.bottom - a.top)).find((rect) => rect.bottom - rect.top >= absoluteMinimum);
	const hidden = !selected || width < button.width || height < button.height;
	const previous = options.previous;
	const selectedBottom = (!panel && previous ? free.find((rect) => previous.top >= rect.top && previous.top + button.height <= rect.bottom) : void 0) && previous ? previous.top + button.height : selected?.bottom ?? bottom;
	return {
		left: Math.round(Math.max(left, right - button.width)),
		top: Math.round(Math.max(top, selectedBottom - button.height)),
		hidden,
		panelSide: side,
		panelWidth,
		panelMaxHeight: Math.max(0, panel ? Math.min(panel.height, Math.max(0, (selected?.bottom ?? bottom) - (selected?.top ?? top) - panelExtra)) : height)
	};
}
/** Moving content is sampled after scrolling settles, not on every animation frame. */
function createSocialLayoutScheduler(options) {
	let frame, timer, scrolling = false, stopped = false;
	const schedule = () => {
		if (stopped || scrolling) return;
		if (frame !== void 0) options.cancelFrame(frame);
		frame = options.requestFrame(() => {
			frame = void 0;
			if (!stopped) options.measure();
		});
	};
	const onScroll = () => {
		if (stopped) return;
		scrolling = true;
		if (frame !== void 0) {
			options.cancelFrame(frame);
			frame = void 0;
		}
		if (timer !== void 0) options.clearTimer(timer);
		timer = options.setTimer(() => {
			timer = void 0;
			scrolling = false;
			schedule();
		}, 160);
	};
	return {
		schedule,
		onScroll,
		stop() {
			stopped = true;
			if (frame !== void 0) options.cancelFrame(frame);
			if (timer !== void 0) options.clearTimer(timer);
		}
	};
}
var social_links_module_default = {
	trigger: "_trigger_1re6l_1",
	close: "_close_1re6l_2",
	link: "_link_1re6l_2",
	panel: "_panel_1re6l_3",
	slideOpen: "_slideOpen_1re6l_1",
	slideClosed: "_slideClosed_1re6l_1",
	header: "_header_1re6l_23",
	kicker: "_kicker_1re6l_24",
	title: "_title_1re6l_25",
	linkIcon: "_linkIcon_1re6l_30",
	external: "_external_1re6l_32",
	handle: "_handle_1re6l_33",
	safeAreaProbe: "_safeAreaProbe_1re6l_34"
};
//#endregion
//#region components/social-links.tsx
var import_jsx_runtime = require_jsx_runtime();
var icons = {
	Instagram: InstagramIcon,
	TikTok: TikTokIcon,
	Facebook: FacebookIcon,
	YouTube: YouTubeIcon,
	Threads: ThreadsIcon
};
var socialLinks = OFFICIAL_SOCIAL_LINKS.map((link) => ({
	...link,
	icon: icons[link.label]
}));
var avoidSelector = ".button-primary, .button-dark, .button-light, .button-glass, .store-request-trigger, .application-orb, .idea-orb, .project-orb, .site-header, .install-banner, button[type=submit], [data-slot=button], [data-social-avoid]";
var dialogSelector = "[role='dialog'][data-state='open']:not([data-social-panel]), [role='alertdialog']";
function SocialFloatingMenu() {
	const pathname = usePathname();
	const titleId = (0, import_react.useId)();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [position, setPosition] = (0, import_react.useState)(null);
	const [obscured, setObscured] = (0, import_react.useState)(false);
	const positionRef = (0, import_react.useRef)(null);
	const triggerRef = (0, import_react.useRef)(null);
	const panelRef = (0, import_react.useRef)(null);
	const closeRef = (0, import_react.useRef)(null);
	const safeAreaRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const measure = () => {
			const button = triggerRef.current;
			if (!button) return;
			const visual = window.visualViewport;
			const viewport = {
				left: visual?.offsetLeft ?? 0,
				top: visual?.offsetTop ?? 0,
				width: visual?.width ?? window.innerWidth,
				height: visual?.height ?? window.innerHeight
			};
			const safe = safeAreaRef.current ? getComputedStyle(safeAreaRef.current) : null;
			const obstacles = [];
			for (const element of document.querySelectorAll(avoidSelector)) {
				const style = getComputedStyle(element);
				if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) continue;
				const rect = element.getBoundingClientRect();
				if (rect.width > 0 && rect.height > 0) obstacles.push({
					left: rect.left,
					top: rect.top,
					right: rect.right,
					bottom: rect.bottom
				});
			}
			const next = chooseSocialPosition({
				previous: positionRef.current ?? void 0,
				viewport,
				button: {
					width: button.offsetWidth || 56,
					height: button.offsetHeight || 56
				},
				obstacles,
				panel: open ? {
					width: 224,
					height: Math.max(280, panelRef.current?.scrollHeight ?? 320)
				} : void 0,
				insets: {
					top: parseFloat(safe?.paddingTop ?? "0") || 0,
					right: parseFloat(safe?.paddingRight ?? "0") || 0,
					bottom: parseFloat(safe?.paddingBottom ?? "0") || 0,
					left: parseFloat(safe?.paddingLeft ?? "0") || 0
				}
			});
			positionRef.current = next;
			setPosition((previous) => previous && Object.keys(next).every((key) => previous[key] === next[key]) ? previous : next);
			const blockedByDialog = Boolean(document.querySelector(dialogSelector));
			setObscured(blockedByDialog);
			if (open && (next.hidden || blockedByDialog)) setOpen(false);
		};
		const scheduler = createSocialLayoutScheduler({
			measure,
			setTimer: (fn, ms) => window.setTimeout(fn, ms),
			clearTimer: (id) => window.clearTimeout(id),
			requestFrame: (fn) => requestAnimationFrame(fn),
			cancelFrame: (id) => cancelAnimationFrame(id)
		});
		const { schedule, onScroll } = scheduler;
		const resize = new ResizeObserver(schedule);
		resize.observe(document.body);
		if (triggerRef.current) resize.observe(triggerRef.current);
		if (panelRef.current) resize.observe(panelRef.current);
		for (const element of document.querySelectorAll(avoidSelector)) resize.observe(element);
		const mutations = new MutationObserver(schedule);
		mutations.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [
				"class",
				"data-state",
				"role"
			]
		});
		schedule();
		window.addEventListener("resize", schedule);
		window.addEventListener("scroll", onScroll, {
			passive: true,
			capture: true
		});
		window.visualViewport?.addEventListener("resize", schedule);
		window.visualViewport?.addEventListener("scroll", onScroll);
		return () => {
			scheduler.stop();
			resize.disconnect();
			mutations.disconnect();
			window.removeEventListener("resize", schedule);
			window.removeEventListener("scroll", onScroll, true);
			window.visualViewport?.removeEventListener("resize", schedule);
			window.visualViewport?.removeEventListener("scroll", onScroll);
		};
	}, [open, pathname]);
	const hidden = !position || position.hidden || obscured;
	const panelStyle = {
		width: position?.panelWidth ?? 224,
		"--social-panel-max-height": `${position?.panelMaxHeight ?? 320}px`
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		ref: safeAreaRef,
		className: social_links_module_default.safeAreaProbe,
		"aria-hidden": "true"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root2, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				ref: triggerRef,
				type: "button",
				className: `glass-action-orb ${social_links_module_default.trigger}`,
				"data-social-control": true,
				style: {
					left: position?.left ?? 0,
					top: position?.top ?? 0,
					visibility: hidden ? "hidden" : "visible"
				},
				"aria-label": open ? "Cerrar redes de Venezuela Agro" : "Abrir redes de Venezuela Agro",
				children: [open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
					"aria-hidden": "true",
					size: 20
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {
					"aria-hidden": "true",
					size: 19
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Redes" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content2, {
			ref: panelRef,
			"data-social-panel": true,
			"data-slot": "popover-content",
			side: position?.panelSide ?? "left",
			align: "end",
			sideOffset: 10,
			collisionPadding: 12,
			avoidCollisions: true,
			sticky: "always",
			className: social_links_module_default.panel,
			style: panelStyle,
			"aria-labelledby": titleId,
			onOpenAutoFocus: (event) => {
				event.preventDefault();
				closeRef.current?.focus();
			},
			onCloseAutoFocus: (event) => {
				event.preventDefault();
				if (!obscured) triggerRef.current?.focus();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: social_links_module_default.header,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: social_links_module_default.kicker,
						children: "VENEZUELA AGRO"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: titleId,
						className: social_links_module_default.title,
						children: "Nuestras redes"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Close, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							ref: closeRef,
							type: "button",
							className: social_links_module_default.close,
							"aria-label": "Cerrar redes sociales",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								"aria-hidden": "true",
								size: 20
							})
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					"aria-label": "Redes oficiales de Venezuela Agro",
					children: socialLinks.map(({ label, href, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href,
						target: "_blank",
						rel: "noreferrer",
						className: social_links_module_default.link,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: social_links_module_default.linkIcon }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
								className: social_links_module_default.external,
								"aria-hidden": "true",
								size: 14
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: " (abre otra pestaña)"
							})
						]
					}, label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: social_links_module_default.handle,
					children: OFFICIAL_HANDLE
				})
			]
		}) })]
	})] });
}
//#endregion
export { SocialFloatingMenu };
