import { E as __toESM, b as require_react, n as require_jsx_runtime, t as require_react_dom } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-OtKWZ-kp.js";
import { t as X } from "./x-DB9nLDwG.js";
import { a as getInstallGuidance, c as isInstalledDisplayMode, i as dismissInstallOffer, l as scheduleInstallOffer, n as createInstallCountdown, o as isInstallOfferSuppressed, r as detectInstallEnvironment, s as isInstallPromptEvent, t as claimInstallOffer } from "./install-guidance-Dq4s3ddC.js";
import { t as startOrbMorph } from "./orb-morph-BBTjMrt3.js";
import { t as Download } from "./download--Qph51NC.js";
import { t as Smartphone } from "./smartphone-BOJeizY8.js";
import { r as registerInstallAction } from "./install-action-C1mhv1ba.js";
//#region node_modules/lucide-react/dist/esm/icons/monitor.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Monitor = createLucideIcon("monitor", [
	["rect", {
		width: "20",
		height: "14",
		x: "2",
		y: "3",
		rx: "2",
		key: "48i651"
	}],
	["line", {
		x1: "8",
		x2: "16",
		y1: "21",
		y2: "21",
		key: "1svkeh"
	}],
	["line", {
		x1: "12",
		x2: "12",
		y1: "17",
		y2: "21",
		key: "vw1qmm"
	}]
]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Share = createLucideIcon("share", [
	["path", {
		d: "M12 2v13",
		key: "1km8f5"
	}],
	["path", {
		d: "m16 6-4-4-4 4",
		key: "13yo43"
	}],
	["path", {
		d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",
		key: "1b2hhj"
	}]
]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Tablet = createLucideIcon("tablet", [["rect", {
	width: "16",
	height: "20",
	x: "4",
	y: "2",
	rx: "2",
	ry: "2",
	key: "76otgf"
}], ["line", {
	x1: "12",
	x2: "12.01",
	y1: "18",
	y2: "18",
	key: "1dp563"
}]]);
//#endregion
//#region components/install-app-banner.tsx
var import_jsx_runtime = require_jsx_runtime();
function storage(kind) {
	try {
		return window[kind];
	} catch {
		return null;
	}
}
function hasOpenDialog() {
	return Boolean(document.querySelector("[role='dialog'][data-state='open'], [role='alertdialog']"));
}
function installedDisplay() {
	return isInstalledDisplayMode({
		navigatorStandalone: navigator.standalone,
		standalone: window.matchMedia("(display-mode: standalone)").matches,
		minimalUi: window.matchMedia("(display-mode: minimal-ui)").matches,
		windowControlsOverlay: window.matchMedia("(display-mode: window-controls-overlay)").matches
	});
}
var focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b7d79a]";
function InstallAppBanner() {
	const [environment] = (0, import_react.useState)(() => detectInstallEnvironment(typeof navigator === "undefined" ? {} : navigator));
	const [promptEvent, setPromptEvent] = (0, import_react.useState)(null);
	const [phase, setPhase] = (0, import_react.useState)("waiting");
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [pageHidden, setPageHidden] = (0, import_react.useState)(false);
	const [showHelp, setShowHelp] = (0, import_react.useState)(false);
	const [userInteracted, setUserInteracted] = (0, import_react.useState)(false);
	const [installing, setInstalling] = (0, import_react.useState)(false);
	const [hovered, setHovered] = (0, import_react.useState)(false);
	const [touching, setTouching] = (0, import_react.useState)(false);
	const [focused, setFocused] = (0, import_react.useState)(false);
	const [promptError, setPromptError] = (0, import_react.useState)("");
	const phaseRef = (0, import_react.useRef)("waiting");
	const installedRef = (0, import_react.useRef)(false);
	const installingRef = (0, import_react.useRef)(false);
	const aliveRef = (0, import_react.useRef)(false);
	const introCompleteRef = (0, import_react.useRef)(false);
	const bannerRef = (0, import_react.useRef)(null);
	const orbRef = (0, import_react.useRef)(null);
	const animationRef = (0, import_react.useRef)(null);
	const countdownRef = (0, import_react.useRef)(null);
	const visible = (phase === "expanded" || phase === "minimizing") && !dialogOpen;
	const guidance = getInstallGuidance(environment, Boolean(promptEvent));
	const changePhase = (0, import_react.useCallback)((next) => {
		phaseRef.current = next;
		setPhase(next);
	}, []);
	const completeIntro = (0, import_react.useCallback)(() => {
		if (!aliveRef.current || introCompleteRef.current) return;
		introCompleteRef.current = true;
		document.body.dataset.installIntro = "complete";
		window.dispatchEvent(new Event("venezuela-agro:install-intro-complete"));
	}, []);
	const minimize = (0, import_react.useCallback)(async (explicit = false) => {
		if (phaseRef.current !== "expanded" || installedRef.current) return;
		countdownRef.current?.cancel();
		if (explicit) dismissInstallOffer(storage("sessionStorage"), storage("localStorage"), Date.now());
		const banner = bannerRef.current, orb = orbRef.current;
		const restoreFocus = Boolean(banner?.contains(document.activeElement));
		changePhase("minimizing");
		let animation = null;
		if (banner && orb) {
			animation = startOrbMorph({
				source: banner,
				target: orb,
				duration: 600,
				reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
			});
			animationRef.current = animation;
			const outcome = await animation.finished;
			if (outcome === "cancelled") return;
			if (outcome === "reversed") {
				animation.release();
				animationRef.current = null;
				if (aliveRef.current && !installedRef.current) changePhase("expanded");
				return;
			}
		}
		if (!aliveRef.current || installedRef.current) return;
		animation?.retire();
		(0, import_react_dom.flushSync)(() => {
			changePhase("compact");
			setHovered(false);
			setTouching(false);
			setFocused(false);
		});
		requestAnimationFrame(() => {
			if (!aliveRef.current) return;
			animation?.release();
			if (animationRef.current === animation) animationRef.current = null;
			if (restoreFocus) (document.querySelector("[data-mobile-more]") ?? orbRef.current)?.focus();
			completeIntro();
		});
	}, [changePhase, completeIntro]);
	(0, import_react.useEffect)(() => {
		aliveRef.current = true;
		document.body.dataset.installIntro = "pending";
		const session = storage("sessionStorage"), persistent = storage("localStorage");
		installedRef.current = installedDisplay();
		const initiallyQuiet = isInstallOfferSuppressed(session, persistent, Date.now(), installedRef.current);
		const stopOffer = scheduleInstallOffer({
			now: Date.now,
			setTimer: (callback, delay) => window.setTimeout(callback, delay),
			clearTimer: (id) => window.clearTimeout(id),
			isSuppressed: () => isInstallOfferSuppressed(session, persistent, Date.now(), installedRef.current),
			isBlocked: () => document.hidden || hasOpenDialog(),
			skip: () => {
				if (phaseRef.current === "waiting") {
					changePhase(installedRef.current ? "installed" : "compact");
					requestAnimationFrame(completeIntro);
				}
			},
			offer: () => {
				if (phaseRef.current !== "waiting" || installedRef.current) return;
				if (claimInstallOffer(session, persistent, Date.now())) changePhase("expanded");
				else {
					changePhase("compact");
					requestAnimationFrame(completeIntro);
				}
			}
		});
		const hideInstalled = () => {
			installedRef.current = true;
			stopOffer();
			countdownRef.current?.cancel();
			animationRef.current?.cancel();
			dismissInstallOffer(session, persistent, Date.now());
			changePhase("installed");
			setPromptEvent(null);
			requestAnimationFrame(completeIntro);
		};
		const onBeforeInstall = (event) => {
			if (!isInstallPromptEvent(event) || installedRef.current) return;
			event.preventDefault();
			setPromptEvent(event);
		};
		const onDisplayChange = () => {
			if (installedDisplay()) hideInstalled();
		};
		const modes = [
			"standalone",
			"minimal-ui",
			"window-controls-overlay"
		].map((mode) => window.matchMedia(`(display-mode: ${mode})`));
		for (const mode of modes) mode.addEventListener("change", onDisplayChange);
		window.addEventListener("beforeinstallprompt", onBeforeInstall);
		window.addEventListener("appinstalled", hideInstalled);
		const updateVisibility = () => {
			setDialogOpen(hasOpenDialog());
			setPageHidden(document.hidden);
		};
		const initialFrame = requestAnimationFrame(() => {
			updateVisibility();
			if (initiallyQuiet) {
				changePhase(installedRef.current ? "installed" : "compact");
				requestAnimationFrame(completeIntro);
			}
		});
		const observer = new MutationObserver(updateVisibility);
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["data-state", "role"]
		});
		document.addEventListener("visibilitychange", updateVisibility);
		return () => {
			aliveRef.current = false;
			stopOffer();
			observer.disconnect();
			cancelAnimationFrame(initialFrame);
			countdownRef.current?.cancel();
			animationRef.current?.cancel();
			for (const mode of modes) mode.removeEventListener("change", onDisplayChange);
			window.removeEventListener("beforeinstallprompt", onBeforeInstall);
			window.removeEventListener("appinstalled", hideInstalled);
			document.removeEventListener("visibilitychange", updateVisibility);
		};
	}, [changePhase, completeIntro]);
	(0, import_react.useEffect)(() => {
		if (phase !== "expanded") return;
		const countdown = createInstallCountdown({
			now: Date.now,
			finish: () => {
				minimize();
			},
			setTimer: (callback, delay) => window.setTimeout(callback, delay),
			clearTimer: (id) => window.clearTimeout(id)
		});
		countdownRef.current = countdown;
		return () => {
			countdown.cancel();
			if (countdownRef.current === countdown) countdownRef.current = null;
		};
	}, [phase, minimize]);
	(0, import_react.useEffect)(() => {
		if (userInteracted || hovered || touching || focused || showHelp || installing || dialogOpen || pageHidden) countdownRef.current?.pause();
		else countdownRef.current?.resume();
	}, [
		phase,
		userInteracted,
		hovered,
		touching,
		focused,
		showHelp,
		installing,
		dialogOpen,
		pageHidden
	]);
	(0, import_react.useEffect)(() => {
		if (visible) document.body.dataset.installPrompt = "visible";
		else delete document.body.dataset.installPrompt;
		if (visible || installing) document.body.dataset.installInteraction = "active";
		else delete document.body.dataset.installInteraction;
		return () => {
			delete document.body.dataset.installPrompt;
			delete document.body.dataset.installInteraction;
		};
	}, [visible, installing]);
	function stopInstallCountdown(event) {
		setUserInteracted(true);
		countdownRef.current?.cancel();
		const target = event?.target instanceof Element ? event.target : null;
		if (phaseRef.current === "minimizing" && event?.key !== "Escape" && !target?.closest("[data-orb-morph-close]")) animationRef.current?.reverse();
	}
	function reopen() {
		if (installedRef.current) return;
		setUserInteracted(true);
		setShowHelp(false);
		setPromptError("");
		setHovered(false);
		setTouching(false);
		setFocused(false);
		changePhase("expanded");
	}
	async function install() {
		if (installingRef.current) return;
		if (!promptEvent) {
			setShowHelp(true);
			return;
		}
		const event = promptEvent;
		installingRef.current = true;
		setInstalling(true);
		setPromptError("");
		setPromptEvent(null);
		try {
			await event.prompt();
			const choice = await event.userChoice;
			if (aliveRef.current && (choice.outcome === "accepted" || choice.outcome === "dismissed")) await minimize(true);
		} catch {
			if (aliveRef.current && !installedRef.current) {
				setPromptError("El navegador no pudo abrir la instalación. Puedes seguir los pasos manuales.");
				setShowHelp(true);
			}
		} finally {
			installingRef.current = false;
			if (aliveRef.current) setInstalling(false);
		}
	}
	(0, import_react.useEffect)(() => registerInstallAction({
		ready: true,
		nativePrompt: Boolean(promptEvent),
		installed: phase === "installed",
		environment
	}, () => {
		if (installedRef.current) return;
		stopInstallCountdown();
		reopen();
		if (promptEvent) install();
		else setShowHelp(true);
	}));
	const DeviceIcon = environment.device === "computer" ? Monitor : environment.device === "tablet" ? Tablet : Smartphone;
	if (phase === "installed") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		ref: orbRef,
		type: "button",
		className: `application-orb glass-action-orb ${phase === "compact" && !dialogOpen ? "" : "invisible pointer-events-none"} ${focusRing}`,
		"aria-label": "Aplicación: ver instalación o acceso directo",
		"aria-hidden": phase !== "compact" || dialogOpen,
		tabIndex: phase === "compact" && !dialogOpen ? 0 : -1,
		onClick: reopen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviceIcon, {
			"aria-hidden": "true",
			size: 20
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aplicación" })]
	}), visible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		ref: bannerRef,
		"data-show-help": showHelp,
		className: `install-banner ${phase === "minimizing" ? "install-banner-minimizing" : ""} fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-[100] mx-auto max-h-[calc(100dvh-2rem)] max-w-xl overflow-y-auto overscroll-contain rounded-[1.35rem] border border-white/12 bg-[#211d1a]/97 p-3 text-white shadow-[0_24px_80px_rgba(0,0,0,.4)] backdrop-blur-2xl sm:bottom-5 sm:left-auto sm:right-5 sm:mx-0 sm:max-w-sm sm:p-4`,
		"aria-label": "Instalación y acceso directo",
		onPointerDownCapture: stopInstallCountdown,
		onKeyDownCapture: (event) => {
			if (event.key === "Escape" && !installing) {
				event.preventDefault();
				minimize(true);
			} else stopInstallCountdown(event);
		},
		onPointerEnter: (event) => {
			if (event.pointerType !== "touch") setHovered(true);
		},
		onPointerLeave: () => setHovered(false),
		onTouchStart: () => setTouching(true),
		onTouchEnd: () => setTouching(false),
		onTouchCancel: () => setTouching(false),
		onFocusCapture: () => setFocused(true),
		onBlurCapture: (event) => {
			if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-orb-morph-content": true,
			className: "flex items-start gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "install-banner-device flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3ebdd] text-[#3e2a19]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviceIcon, {
						"aria-hidden": "true",
						size: 21
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "install-banner-title text-sm font-bold",
							children: guidance.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "install-banner-intro mt-1 text-xs leading-5 text-white/75",
							children: "Vuelve al campo con menos pasos. Antes de trabajar sin señal, abre Mi Finca → Sincronización y prepara este dispositivo."
						}),
						promptError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "status",
							className: "mt-2 text-xs leading-5 text-[#f3d8a5]",
							children: promptError
						}),
						showHelp && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "install-banner-help mt-3 rounded-xl bg-white/8 p-3 text-xs leading-5 text-white/85",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "install-banner-help-title flex items-center gap-2 font-bold text-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, {
										"aria-hidden": "true",
										size: 15
									}), environment.os === "ios" ? "Desde Safari en iPhone o iPad" : "Pasos en tu navegador"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
									className: "mt-2 list-decimal space-y-2 pl-4",
									children: guidance.steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: step }, step))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-white/70",
									children: "Estos pasos los completas tú en el navegador o sistema; la página no crea el acceso automáticamente."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowHelp(false),
									className: `mt-2 min-h-11 underline underline-offset-4 ${focusRing}`,
									children: "Ocultar pasos"
								})
							]
						}),
						(!showHelp || promptEvent) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: installing,
							onClick: () => void install(),
							className: `install-banner-action mt-3 inline-flex min-h-11 max-w-full items-center gap-2 whitespace-normal rounded-full bg-[#f3ebdd] px-4 py-2 text-xs font-bold text-[#211d1a] disabled:cursor-wait disabled:opacity-70 ${focusRing}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
								"aria-hidden": "true",
								size: 15
							}), installing ? "Abriendo el navegador…" : guidance.action]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-orb-morph-close": true,
					onClick: () => {
						minimize(true);
					},
					"aria-label": "Minimizar aviso de instalación",
					className: `install-banner-close sticky top-0 z-20 flex min-h-11 min-w-11 shrink-0 self-start items-center justify-center rounded-full border border-white/30 bg-[#f3ebdd] text-[#3e2a19] shadow-md hover:bg-white ${focusRing}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						"aria-hidden": "true",
						size: 20
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-orb-morph-glyph": true,
			className: "orb-morph-glyph",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviceIcon, { size: 20 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aplicación" })]
		})]
	})] });
}
//#endregion
export { InstallAppBanner };
