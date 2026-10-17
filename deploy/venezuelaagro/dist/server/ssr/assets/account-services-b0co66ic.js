import { E as __toESM, b as require_react, l as usePathname, n as require_jsx_runtime, t as require_react_dom } from "../index.js";
import { PublicWorkspaceControls } from "./public-workspace-controls-OU9fKSzS.js";
import { k as feedbackPayloadSchema, l as getOperationStatus, m as queueMutation, r as createLocalId, v as subscribeOfflineChanges, y as syncNow } from "./offline-db-Co86AgBD.js";
import { c as offlineChoiceRequired, d as selectVerifiedDashboardOwner, f as subscribeOfflineChoice, i as chooseOfflineWorkspace } from "./offline-account-boundary-hnu6xdcm.js";
import { a as formalSubmissionLoginPath, c as loadFormalDraft, d as saveFormalDraft, i as formalSubmissionError, l as requireFormalSubmissionSession, n as FormalSubmissionAuthError, o as formalSubmissionNeedsLogin, r as clearFormalDraft, s as isFormalSubmissionAuthError, t as FormalSubmissionNotice, u as requiresFormalSession } from "./formal-submission-notice-Dhskdcco.js";
import { t as createLucideIcon } from "./createLucideIcon-OtKWZ-kp.js";
import { t as X } from "./x-DB9nLDwG.js";
import { d as DialogContent$1, f as DialogDescription$1, g as DialogTrigger, h as DialogTitle$1, i as DialogDescription, l as Dialog$1, m as DialogPortal, p as DialogOverlay, r as DialogContent, s as DialogTitle, t as Dialog, u as DialogClose } from "./dialog-CBD8GOFt.js";
import { t as ArrowRight } from "./arrow-right-BEaoe4OM.js";
import { t as Check } from "./check-Dmm_dyPA.js";
import { t as Lightbulb } from "./lightbulb--Zoyb-wI.js";
import { t as LoaderCircle } from "./loader-circle-C6swcBn0.js";
import { t as Sprout } from "./sprout-5lHK7vA9.js";
import { t as SiteImage } from "./site-image-BuLzHkhJ.js";
import { n as createInstallCountdown } from "./install-guidance-Dq4s3ddC.js";
import { t as startOrbMorph } from "./orb-morph-BBTjMrt3.js";
//#region components/offline-sync-manager.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function OfflineSyncManager() {
	(0, import_react.useEffect)(() => {
		if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => void 0);
		const synchronize = () => {
			if (requiresFormalSession() && [
				"order",
				"idea",
				"feedback"
			].includes(new URLSearchParams(window.location.search).get("resume") ?? "")) return;
			if (navigator.onLine) syncNow().catch(() => void 0);
		};
		const onVisibility = () => {
			if (document.visibilityState === "visible") synchronize();
		};
		const onWorkerMessage = (event) => {
			if (event.data?.type === "TRY_SYNC") synchronize();
		};
		navigator.serviceWorker?.addEventListener("message", onWorkerMessage);
		window.addEventListener("online", synchronize);
		document.addEventListener("visibilitychange", onVisibility);
		const interval = window.setInterval(synchronize, 300 * 1e3);
		synchronize();
		return () => {
			window.clearInterval(interval);
			navigator.serviceWorker?.removeEventListener("message", onWorkerMessage);
			window.removeEventListener("online", synchronize);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, []);
	return null;
}
//#endregion
//#region components/offline-workspace-gate.tsx
var import_jsx_runtime = require_jsx_runtime();
function OfflineWorkspaceGate() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: (0, import_react.useSyncExternalStore)(subscribeOfflineChoice, offlineChoiceRequired, () => false),
		onOpenChange: (open) => {
			if (!open) chooseOfflineWorkspace(false);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			showCloseButton: false,
			className: "z-[200] rounded-3xl bg-[#f3ebdd] p-6 text-[#211d1a] shadow-2xl sm:p-8",
			onPointerDownOutside: (event) => event.preventDefault(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display text-3xl",
					children: "¿Qué espacio quieres abrir?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-sm leading-6 text-[#5f574f]",
					children: "No pudimos comprobar la cuenta con internet. En este dispositivo autorizaste conservar un espacio de cuenta para trabajar sin señal. Ábrelo solo si eres su titular y este sigue siendo tu dispositivo de confianza."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => chooseOfflineWorkspace(true),
						className: "rounded-full bg-[#4c6b3a] px-5 py-3 font-bold text-white",
						children: "Abrir mi espacio guardado"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => chooseOfflineWorkspace(false),
						className: "rounded-full border border-[#3e2a19]/25 px-5 py-3 font-bold",
						children: "Usar el espacio local sin cuenta"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-[#71685f]",
					children: "Esta elección no inicia sesión ni publica datos. Antes de enviar cambios se verificará la misma cuenta. El navegador conserva los datos localmente: protege tu teléfono con su bloqueo de pantalla."
				})
			]
		})
	});
}
//#endregion
//#region node_modules/lucide-react/dist/esm/icons/send.mjs
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Send = createLucideIcon("send", [["path", {
	d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
	key: "1ffxy3"
}], ["path", {
	d: "m21.854 2.147-10.94 10.939",
	key: "12cjpa"
}]]);
//#endregion
//#region lib/idea-invitation.ts
var IDEA_MESSAGE_MAX = 1500;
var IDEA_INVITATION_COPY = {
	title: "Tu experiencia puede mejorar el agro venezolano.",
	emphasis: "Cada productor cuenta.",
	invitation: "Comparte qué necesitas o qué idea te gustaría ver en Venezuela Agro.",
	together: "Juntos podemos construir mejores herramientas para el campo.",
	button: "Compartir mi idea"
};
/** Reuse the backend's feedback contract; this is not a second validation schema. */
function validateIdeaFields(message, contact) {
	const parsed = feedbackPayloadSchema.safeParse({
		area: "Otro",
		role: "Persona interesada",
		message,
		contact
	});
	if (parsed.success) return {
		ok: true,
		payload: parsed.data
	};
	const errors = {};
	for (const issue of parsed.error.issues) {
		if (issue.path[0] === "message") errors.message = "Escribe entre 10 y 1.500 caracteres, sin contar espacios al principio o al final.";
		if (issue.path[0] === "contact") errors.contact = "El contacto puede tener hasta 180 caracteres.";
	}
	return {
		ok: false,
		errors
	};
}
/** Only an acknowledgement of this exact operation permits a received receipt. */
function ideaReceiptText(status) {
	switch (status.state) {
		case "confirmed": return "Idea recibida. Evaluaremos tu propuesta para mejorar Venezuela Agro; no implica una implementación garantizada.";
		case "blocked": return "Tu idea se guardó en este dispositivo, pero el servidor no la aceptó. Su recepción no está confirmada.";
		case "unknown": return "Tu idea se guardó en este dispositivo. No tenemos confirmación de recepción en el espacio actual. Tu texto sigue aquí.";
		default: return "Idea guardada en este dispositivo, pendiente de envío. Todavía no tenemos confirmación del servidor. Puedes reintentar aquí cuando tengas conexión.";
	}
}
/** Once per browser session; historical seven-day localStorage choices stay untouched. */
var IDEA_VISIT_SHOWN_KEY = "venezuela-agro:idea-invitation:session:v1";
function claimIdeaVisit(storage) {
	try {
		if (storage.getItem("venezuela-agro:idea-invitation:session:v1") === "true") return false;
		storage.setItem(IDEA_VISIT_SHOWN_KEY, "true");
		return storage.getItem(IDEA_VISIT_SHOWN_KEY) === "true";
	} catch {
		return false;
	}
}
function markIdeaVisit(storage) {
	try {
		storage.setItem(IDEA_VISIT_SHOWN_KEY, "true");
	} catch {}
}
//#endregion
//#region lib/idea-invitation-scheduler.ts
/** Retry temporary UI interruptions without consuming the weekly invitation claim. */
function scheduleIdeaInvitation(options) {
	let stopped = false, timer;
	const attempt = () => {
		if (stopped) return;
		if (options.isBlocked()) {
			timer = options.setTimer(attempt, 2e3);
			return;
		}
		stopped = true;
		if (options.claim()) options.open();
	};
	timer = options.setTimer(attempt, options.delayMs);
	return () => {
		stopped = true;
		if (timer !== void 0) options.clearTimer(timer);
	};
}
//#endregion
//#region lib/idea-invitation-photo.ts
/** Source: the reviewed photo-bank-r3 manifest. No endorsement is implied. */
var ideaInvitationPhoto = {
	id: "campesino-yaracuy",
	src: "/photos/campesino-yaracuy-idea.webp",
	title: "Campesino Venezolano, Edo. Yaracuy crop.jpg",
	author: "Wilfredor",
	geography: "Yaracuy, Venezuela",
	source: "https://commons.wikimedia.org/wiki/File:Campesino_Venezolano%2C_Edo._Yaracuy_crop.jpg",
	license: "CC BY-SA 3.0",
	licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
	width: 960,
	height: 702,
	changes: "Reducción a 960 × 702 píxeles y compresión WebP. El encuadre se adapta en pantalla. Sin cambios de tono ni elementos añadidos o eliminados. La fotografía adaptada conserva CC BY-SA 3.0."
};
//#endregion
//#region components/idea-invitation.tsx
var focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4c6b3a]";
var primaryButton = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#4c6b3a] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#365026] disabled:cursor-wait disabled:opacity-65 motion-reduce:transition-none ${focusRing}`;
var quietButton = `inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-[#5b4530] underline decoration-[#5b4530]/30 underline-offset-4 hover:bg-[#3e2a19]/5 ${focusRing}`;
/** Replaces the old feedback trigger. Automatic invitation is homepage-only. */
function IdeaInvitation() {
	const pathname = usePathname();
	const id = (0, import_react.useId)();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [introComplete, setIntroComplete] = (0, import_react.useState)(false);
	const [showOrb, setShowOrb] = (0, import_react.useState)(false);
	const [viewport, setViewport] = (0, import_react.useState)(null);
	const [stage, setStage] = (0, import_react.useState)("invitation");
	const [message, setMessage] = (0, import_react.useState)("");
	const [contact, setContact] = (0, import_react.useState)("");
	const [errors, setErrors] = (0, import_react.useState)({});
	const [saveError, setSaveError] = (0, import_react.useState)("");
	const [working, setWorking] = (0, import_react.useState)(false);
	const [operationId, setOperationId] = (0, import_react.useState)(null);
	const [expectedOwner, setExpectedOwner] = (0, import_react.useState)();
	const [loginNeeded, setLoginNeeded] = (0, import_react.useState)(false);
	const resumed = (0, import_react.useRef)(false);
	const [receipt, setReceipt] = (0, import_react.useState)({ state: "pending" });
	const inFlight = (0, import_react.useRef)(false);
	const autoOffered = (0, import_react.useRef)(false);
	const autoDismissAllowed = (0, import_react.useRef)(false), invitationTouched = (0, import_react.useRef)(false);
	const passiveCountdown = (0, import_react.useRef)(null);
	const triggerRef = (0, import_react.useRef)(null);
	const closeRef = (0, import_react.useRef)(null);
	const messageRef = (0, import_react.useRef)(null);
	const contactRef = (0, import_react.useRef)(null);
	const returnFocus = (0, import_react.useRef)(null);
	const dialogRef = (0, import_react.useRef)(null);
	const overlayRef = (0, import_react.useRef)(null);
	const morphRef = (0, import_react.useRef)(null);
	const closingRef = (0, import_react.useRef)(false);
	const mountedRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			morphRef.current?.cancel();
			morphRef.current = null;
			closingRef.current = false;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!requiresFormalSession() || resumed.current || new URLSearchParams(window.location.search).get("resume") !== "idea") return;
		let current = true;
		queueMicrotask(() => {
			if (!current || resumed.current) return;
			resumed.current = true;
			const draft = loadFormalDraft("idea");
			if (draft && typeof draft.message === "string" && typeof draft.contact === "string") {
				setMessage(draft.message);
				setContact(draft.contact);
				setOperationId(typeof draft.operationId === "string" ? draft.operationId : null);
				setExpectedOwner(typeof draft.expectedOwner === "string" ? draft.expectedOwner : void 0);
				setSaveError("Borrador recuperado. Revisa tu idea y confirma el envío; volver de Google no la envía automáticamente.");
			}
			autoOffered.current = true;
			autoDismissAllowed.current = false;
			invitationTouched.current = true;
			setShowOrb(true);
			setStage("form");
			setOpen(true);
		});
		return () => {
			current = false;
		};
	}, [pathname]);
	const sampleViewport = (0, import_react.useCallback)(() => {
		if (!mountedRef.current || closingRef.current) return;
		const visual = window.visualViewport;
		if (!visual) return;
		const next = {
			height: visual.height,
			top: visual.offsetTop
		};
		setViewport((previous) => closingRef.current || previous?.height === next.height && previous.top === next.top ? previous : next);
	}, []);
	const closeToOrb = (0, import_react.useCallback)(async () => {
		if (closingRef.current) return;
		closingRef.current = true;
		passiveCountdown.current?.cancel();
		const source = dialogRef.current, target = triggerRef.current;
		let animation = null;
		if (source && target && !window.matchMedia("(max-width: 767px)").matches) {
			animation = startOrbMorph({
				source,
				target,
				backdrop: overlayRef.current,
				duration: 520,
				reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
			});
			morphRef.current = animation;
			const outcome = await animation.finished;
			if (outcome === "cancelled" || outcome === "reversed") {
				animation.release();
				if (morphRef.current === animation) morphRef.current = null;
				closingRef.current = false;
				sampleViewport();
				return;
			}
		}
		if (!mountedRef.current) return;
		animation?.retire();
		(0, import_react_dom.flushSync)(() => {
			setShowOrb(true);
			setOpen(() => false);
		});
		requestAnimationFrame(() => {
			animation?.release();
			if (morphRef.current === animation) morphRef.current = null;
			closingRef.current = false;
		});
	}, [sampleViewport]);
	(0, import_react.useEffect)(() => {
		const complete = () => setIntroComplete(true);
		if (document.body.dataset.installIntro === "complete") complete();
		window.addEventListener("venezuela-agro:install-intro-complete", complete);
		return () => window.removeEventListener("venezuela-agro:install-intro-complete", complete);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!introComplete) return;
		if (pathname !== "/" || open || autoOffered.current) return;
		return scheduleIdeaInvitation({
			delayMs: 300,
			setTimer: (callback, delay) => window.setTimeout(callback, delay),
			clearTimer: (id) => window.clearTimeout(id),
			isBlocked: () => {
				if (document.hidden || window.location.pathname !== "/") return true;
				const active = document.activeElement;
				if (active instanceof HTMLElement && active.closest("input, textarea, select, [contenteditable='true']")) return true;
				return !!document.querySelector("[role='dialog'][data-state='open'], [role='alertdialog']") || document.body.dataset.installInteraction === "active";
			},
			claim: () => {
				let eligible = false;
				try {
					eligible = claimIdeaVisit(window.sessionStorage);
				} catch {}
				if (!eligible) setShowOrb(true);
				return eligible;
			},
			open: () => {
				autoDismissAllowed.current = true;
				invitationTouched.current = false;
				autoOffered.current = true;
				returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
				setOpen(true);
			}
		});
	}, [
		pathname,
		open,
		introComplete
	]);
	(0, import_react.useEffect)(() => {
		if (!open || stage !== "invitation" || !autoDismissAllowed.current || invitationTouched.current) return;
		const countdown = createInstallCountdown({
			now: Date.now,
			finish: () => {
				if (!invitationTouched.current) closeToOrb();
			},
			setTimer: (callback, delay) => window.setTimeout(callback, delay),
			clearTimer: (id) => window.clearTimeout(id)
		});
		passiveCountdown.current = countdown;
		const visibility = () => {
			if (document.hidden) countdown.pause();
			else if (!invitationTouched.current) countdown.resume();
		};
		visibility();
		document.addEventListener("visibilitychange", visibility);
		return () => {
			countdown.cancel();
			passiveCountdown.current = null;
			document.removeEventListener("visibilitychange", visibility);
		};
	}, [
		open,
		stage,
		closeToOrb
	]);
	function stopPassiveCountdown(event) {
		invitationTouched.current = true;
		passiveCountdown.current?.cancel();
		const target = event?.target instanceof Element ? event.target : null;
		if (closingRef.current && event?.key !== "Escape" && !target?.closest("[data-orb-morph-close]")) morphRef.current?.reverse();
	}
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const visual = window.visualViewport;
		if (!visual) return;
		const update = () => sampleViewport();
		update();
		visual.addEventListener("resize", update);
		visual.addEventListener("scroll", update);
		return () => {
			visual.removeEventListener("resize", update);
			visual.removeEventListener("scroll", update);
		};
	}, [open, sampleViewport]);
	(0, import_react.useEffect)(() => {
		if (!operationId) return;
		let current = true;
		const refresh = async () => {
			try {
				if (requiresFormalSession()) {
					if (!expectedOwner) throw new FormalSubmissionAuthError("submission_account_mismatch");
					const owner = await requireFormalSubmissionSession(expectedOwner);
					if (!current) return;
					if (owner) selectVerifiedDashboardOwner(owner);
				}
				const next = await getOperationStatus(operationId).catch(() => ({ state: "unknown" }));
				if (current) {
					setReceipt(next);
					if (formalSubmissionNeedsLogin(next)) setLoginNeeded(true);
				}
			} catch (error) {
				if (current && isFormalSubmissionAuthError(error)) {
					setLoginNeeded(true);
					setSaveError(formalSubmissionError(error));
				}
			}
		};
		const unsubscribe = subscribeOfflineChanges(() => {
			refresh();
		});
		refresh();
		return () => {
			current = false;
			unsubscribe();
		};
	}, [operationId, expectedOwner]);
	function changeOpen(next) {
		if (!next) setShowOrb(true);
		if (!next) {
			closeToOrb();
			return;
		}
		if (closingRef.current) {
			morphRef.current?.reverse();
			return;
		}
		if (next) {
			autoDismissAllowed.current = false;
			invitationTouched.current = true;
			autoOffered.current = true;
			returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			try {
				markIdeaVisit(window.sessionStorage);
			} catch {}
		}
		setOpen(next);
	}
	function showForm() {
		setStage("form");
		requestAnimationFrame(() => messageRef.current?.focus());
	}
	function login() {
		if (inFlight.current) return;
		if (!saveFormalDraft("idea", {
			message,
			contact,
			operationId,
			expectedOwner
		})) {
			setSaveError("El navegador no pudo conservar el borrador. Copia tu texto antes de iniciar sesión; no salimos del formulario.");
			return;
		}
		window.location.assign(formalSubmissionLoginPath("idea", window.location.pathname + window.location.search + window.location.hash));
	}
	function handleSubmissionError(error) {
		const authError = error instanceof Error && error.message === "account_changed_reopen_form" ? new FormalSubmissionAuthError("submission_account_mismatch") : error;
		if (isFormalSubmissionAuthError(authError)) {
			setLoginNeeded(true);
			setSaveError(formalSubmissionError(authError));
			setStage("form");
		} else setSaveError("No pudimos comprobar o guardar tu idea. El texto sigue aquí; revisa la conexión y vuelve a intentarlo.");
	}
	async function verifyIdeaOwner() {
		if (requiresFormalSession() && operationId && !expectedOwner) throw new FormalSubmissionAuthError("submission_account_mismatch");
		const owner = await requireFormalSubmissionSession(expectedOwner);
		if (owner) {
			selectVerifiedDashboardOwner(owner);
			setExpectedOwner(owner);
		}
		setLoginNeeded(false);
		return owner;
	}
	async function updateIdeaReceipt(operation) {
		let next = await getOperationStatus(operation.id).catch(() => ({ state: "unknown" }));
		if (next.state === "pending") {
			if (formalSubmissionNeedsLogin(await syncNow().catch(() => ({ reason: "connection_interrupted" })))) {
				setReceipt(next);
				setLoginNeeded(true);
				setSaveError(formalSubmissionError(void 0));
				setStage("form");
				return;
			}
			next = await getOperationStatus(operation.id).catch(() => ({ state: "unknown" }));
		}
		setReceipt(next);
		if (formalSubmissionNeedsLogin(next)) {
			setLoginNeeded(true);
			setSaveError(formalSubmissionError(void 0));
			setStage("form");
			return;
		}
		if (next.state === "confirmed") clearFormalDraft("idea");
		setStage("receipt");
	}
	async function submit(event) {
		event.preventDefault();
		if (inFlight.current) return;
		if (operationId) {
			await retry();
			return;
		}
		const validated = validateIdeaFields(message, contact);
		if (!validated.ok) {
			setErrors(validated.errors);
			if (validated.errors.message) messageRef.current?.focus();
			else contactRef.current?.focus();
			return;
		}
		inFlight.current = true;
		setWorking(true);
		setSaveError("");
		setErrors({});
		try {
			const operation = await queueMutation({
				expectedOwner: await verifyIdeaOwner() ?? void 0,
				entityType: "feedback",
				entityId: createLocalId("feedback"),
				action: "upsert",
				payload: validated.payload
			});
			setOperationId(operation.id);
			setReceipt({ state: "pending" });
			await updateIdeaReceipt(operation);
		} catch (error) {
			handleSubmissionError(error);
		} finally {
			inFlight.current = false;
			setWorking(false);
		}
	}
	async function retry() {
		if (inFlight.current || !operationId) return;
		inFlight.current = true;
		setWorking(true);
		setSaveError("");
		try {
			await verifyIdeaOwner();
			await updateIdeaReceipt({ id: operationId });
		} catch (error) {
			handleSubmissionError(error);
		} finally {
			inFlight.current = false;
			setWorking(false);
		}
	}
	function newIdea() {
		if (inFlight.current) return;
		setMessage("");
		setContact("");
		setErrors({});
		setSaveError("");
		clearFormalDraft("idea");
		setExpectedOwner(void 0);
		setLoginNeeded(false);
		setOperationId(null);
		setReceipt({ state: "pending" });
		showForm();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog$1, {
		open,
		onOpenChange: changeOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			id: "participar",
			className: "participation-actions",
			"aria-label": "Participa en Venezuela Agro",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "participation-actions-heading",
					children: "Tu voz cuenta"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						ref: triggerRef,
						type: "button",
						"aria-label": "Compartir mi idea",
						title: "Compartir mi idea",
						className: `idea-orb glass-action-orb ${!open && (showOrb || pathname !== "/") ? "idea-orb-visible" : "idea-orb-waiting"} ${focusRing}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, {
							"aria-hidden": "true",
							size: 21
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tu idea" })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "/proyectos#presentar-proyecto",
					className: `project-orb glass-action-orb ${focusRing}`,
					"aria-label": "Cuéntanos tu proyecto: abrir formulario",
					title: "Cuéntanos tu proyecto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprout, {
						"aria-hidden": "true",
						size: 21
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tu proyecto" })]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
			ref: overlayRef,
			"data-slot": "dialog-overlay",
			className: "fixed inset-0 z-[110] bg-transparent"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
			ref: dialogRef,
			"data-slot": "dialog-content",
			onPointerDownCapture: stopPassiveCountdown,
			onKeyDownCapture: stopPassiveCountdown,
			onFocusCapture: () => {
				if (document.activeElement !== closeRef.current) stopPassiveCountdown();
			},
			style: viewport ? {
				top: viewport.top + viewport.height / 2,
				maxHeight: Math.max(80, viewport.height - 24)
			} : void 0,
			className: "idea-invitation-dialog fixed left-1/2 top-1/2 z-[111] flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-[820px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.5rem] border border-[#ded1bd] bg-[#f7f1e7] text-[#3e2a19] shadow-2xl outline-none",
			onOpenAutoFocus: (event) => {
				event.preventDefault();
				closeRef.current?.focus();
			},
			onCloseAutoFocus: (event) => {
				event.preventDefault();
				const previous = returnFocus.current;
				if (previous?.isConnected && previous !== document.body && getComputedStyle(previous).visibility !== "hidden") previous.focus();
				else triggerRef.current?.focus({ preventScroll: true });
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-orb-morph-content": true,
				className: "flex min-h-0 flex-1 flex-col overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex shrink-0 items-center justify-between gap-3 border-b border-[#3e2a19]/10 px-4 py-2 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[.65rem] font-bold tracking-[.16em] text-[#4c6b3a]",
						children: "VENEZUELA AGRO · TU VOZ CUENTA"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							ref: closeRef,
							type: "button",
							"data-orb-morph-close": true,
							className: `flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-[#3e2a19]/25 bg-[#fffdf8] px-3 text-sm font-bold hover:bg-[#f3ebdd] ${focusRing}`,
							"aria-label": "Cerrar invitación; se conserva lo escrito",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cerrar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								"aria-hidden": "true",
								size: 19
							})]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 overflow-y-auto overscroll-contain",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid sm:grid-cols-[.82fr_1.18fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
							className: `${stage === "invitation" ? "flex" : "hidden sm:flex"} min-w-0 flex-col border-b border-[#3e2a19]/10 bg-[#eae0ce] sm:border-b-0 sm:border-r`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative h-40 overflow-hidden sm:h-auto sm:min-h-64 sm:flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteImage, {
									src: ideaInvitationPhoto.src,
									width: ideaInvitationPhoto.width,
									height: ideaInvitationPhoto.height,
									sizes: "(max-width: 639px) calc(100vw - 24px), 340px",
									alt: "Hombre junto a frutas en un puesto de Yaracuy, Venezuela",
									className: "h-full w-full object-cover object-[36%_35%] sm:absolute sm:inset-0"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
								className: "px-4 py-3 text-[.65rem] leading-[1.6] text-[#5b4530]",
								children: [
									"Fotografía de contexto · Yaracuy",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: ideaInvitationPhoto.source,
										target: "_blank",
										rel: "noreferrer",
										className: `underline underline-offset-2 ${focusRing}`,
										children: ideaInvitationPhoto.author
									}),
									" · ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: ideaInvitationPhoto.licenseUrl,
										target: "_blank",
										rel: "noreferrer",
										className: `underline underline-offset-2 ${focusRing}`,
										children: ideaInvitationPhoto.license
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block",
										children: "Adaptada en tamaño y encuadre. No implica afiliación ni respaldo a la plataforma."
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: "min-w-0 p-5 sm:p-7",
							children: stage === "invitation" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
									className: "font-display text-[1.8rem] leading-[1.08] tracking-tight sm:text-[2.4rem]",
									children: IDEA_INVITATION_COPY.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-5 space-y-3 text-sm leading-6 text-[#655542] sm:text-[.95rem]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-[#4c6b3a]",
												children: IDEA_INVITATION_COPY.emphasis
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: IDEA_INVITATION_COPY.invitation }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: IDEA_INVITATION_COPY.together })
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 flex flex-col gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: showForm,
										className: primaryButton,
										children: [IDEA_INVITATION_COPY.button, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
											"aria-hidden": "true",
											size: 18
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"data-orb-morph-close": true,
											className: quietButton,
											children: "Seguir explorando"
										})
									})]
								})
							] }) : stage === "form" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
									className: "font-display text-3xl leading-tight",
									children: "Tu idea para mejorar Venezuela Agro."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
									className: "mt-2 text-sm leading-6 text-[#655542]",
									children: "¿Qué cambiarías o añadirías a la plataforma para trabajar mejor? Si buscas apoyo para una iniciativa productiva, visita Proyectos y alianzas."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: submit,
									noValidate: true,
									className: "mt-5 space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormalSubmissionNotice, {
											onLogin: login,
											loginNeeded
										}),
										operationId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs leading-5 text-[#655542]",
											children: "Esta idea ya está guardada. Comprobaremos el mismo envío para evitar duplicados; el texto se conserva sin cambios."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: `${id}-message`,
												className: "text-sm font-bold",
												children: "Mejora o herramienta que propones"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												ref: messageRef,
												id: `${id}-message`,
												name: "message",
												disabled: working || Boolean(operationId),
												required: true,
												minLength: 10,
												maxLength: IDEA_MESSAGE_MAX,
												value: message,
												onChange: (event) => setMessage(event.target.value),
												"aria-invalid": Boolean(errors.message),
												"aria-describedby": `${id}-message-hint${errors.message ? ` ${id}-message-error` : ""}`,
												className: "mt-2 min-h-32 w-full resize-y rounded-xl border border-[#bfae93] bg-[#fffdf8] p-3 text-base leading-6",
												placeholder: "Me ayudaría poder…"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												id: `${id}-message-hint`,
												className: "mt-1 text-xs text-[#655542]",
												children: [
													"Mínimo 10 caracteres · ",
													message.length.toLocaleString("es-VE"),
													"/1.500"
												]
											}),
											errors.message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												id: `${id}-message-error`,
												role: "alert",
												className: "mt-2 text-sm text-[#943d26]",
												children: errors.message
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												htmlFor: `${id}-contact`,
												className: "text-sm font-bold",
												children: ["Contacto ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-normal",
													children: "(opcional)"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												ref: contactRef,
												id: `${id}-contact`,
												name: "contact",
												type: "text",
												disabled: working || Boolean(operationId),
												maxLength: 180,
												value: contact,
												onChange: (event) => setContact(event.target.value),
												"aria-invalid": Boolean(errors.contact),
												"aria-describedby": `${id}-contact-hint${errors.contact ? ` ${id}-contact-error` : ""}`,
												className: "mt-2 min-h-12 w-full rounded-xl border border-[#bfae93] bg-[#fffdf8] px-3 text-base",
												placeholder: "Correo o teléfono"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												id: `${id}-contact-hint`,
												className: "mt-1 text-xs leading-5 text-[#655542]",
												children: "Solo si quieres que podamos contactarte. No te suscribe a boletines."
											}),
											errors.contact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												id: `${id}-contact-error`,
												role: "alert",
												className: "mt-2 text-sm text-[#943d26]",
												children: errors.contact
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs leading-5 text-[#655542]",
											children: [
												"Al enviar, compartes la idea y el contacto que incluyas con el equipo de Venezuela Agro. No se publican automáticamente. ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
													href: "/legal/privacidad",
													target: "_blank",
													rel: "noreferrer",
													className: `underline underline-offset-2 ${focusRing}`,
													children: "Privacidad"
												}),
												"."
											]
										}),
										saveError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											role: "alert",
											className: "rounded-xl border border-[#943d26]/20 bg-[#943d26]/5 p-3 text-sm leading-6 text-[#943d26]",
											children: saveError
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "submit",
											disabled: working,
											className: `${primaryButton} w-full`,
											children: [working ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
												"aria-hidden": "true",
												size: 17,
												className: "animate-spin motion-reduce:animate-none"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {
												"aria-hidden": "true",
												size: 17
											}), working ? "Comprobando…" : operationId ? "Comprobar envío" : "Enviar mi idea"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-center text-[.7rem] leading-5 text-[#655542]",
											children: "Cerrar conserva lo escrito mientras esta página siga abierta."
										})
									]
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
									className: "font-display text-3xl leading-tight",
									children: receipt.state === "confirmed" ? "Gracias por tu aporte." : "Tu idea sigue aquí."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
									className: "sr-only",
									children: "Estado del envío de tu idea a Venezuela Agro."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									role: "status",
									"aria-live": "polite",
									"aria-atomic": "true",
									className: `mt-5 rounded-xl border p-4 text-sm leading-6 ${receipt.state === "confirmed" ? "border-[#4c6b3a]/20 bg-[#e8efdf]" : "border-[#bfae93] bg-[#eee5d5]"}`,
									children: [receipt.state === "confirmed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										"aria-hidden": "true",
										size: 21,
										className: "mb-2 text-[#4c6b3a]"
									}), ideaReceiptText(receipt)]
								}),
								loginNeeded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormalSubmissionNotice, {
										onLogin: login,
										loginNeeded: true
									})
								}),
								saveError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "mt-4 text-sm leading-6 text-[#943d26]",
									children: saveError
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
									className: "mt-4 rounded-xl border border-[#3e2a19]/15 p-3 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
											className: `cursor-pointer font-semibold ${focusRing}`,
											children: "Ver mi idea"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 max-h-44 overflow-y-auto whitespace-pre-wrap break-words leading-6",
											children: message
										}),
										contact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-3 break-words text-xs leading-5 text-[#655542]",
											children: ["Contacto: ", contact]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 flex flex-col gap-2",
									children: [
										loginNeeded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: showForm,
											className: quietButton,
											children: "Volver al formulario"
										}),
										receipt.state !== "confirmed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											disabled: working,
											onClick: () => {
												retry();
											},
											className: primaryButton,
											children: [working && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
												"aria-hidden": "true",
												size: 17,
												className: "animate-spin motion-reduce:animate-none"
											}), working ? "Comprobando…" : "Comprobar envío"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"data-orb-morph-close": true,
												className: receipt.state === "confirmed" ? primaryButton : quietButton,
												children: "Cerrar"
											})
										}),
										receipt.state === "confirmed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: newIdea,
											disabled: working,
											className: quietButton,
											children: "Escribir otra idea"
										})
									]
								})
							] })
						})]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-orb-morph-glyph": true,
				className: "orb-morph-glyph",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { size: 21 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tu idea" })]
			})]
		})] })]
	});
}
//#endregion
//#region components/account-services.tsx
/** Practice mode never mounts services which can read or write a real workspace. */
function AccountServices() {
	const path = usePathname();
	if (path === "/finca-demo" || path.startsWith("/finca-demo/") || path === "/finca-modelo" || path.startsWith("/finca-modelo/") || path === "/juego-finca" || path.startsWith("/juego-finca/")) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineSyncManager, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineWorkspaceGate, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicWorkspaceControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdeaInvitation, {}) })
	] });
}
//#endregion
export { AccountServices };
