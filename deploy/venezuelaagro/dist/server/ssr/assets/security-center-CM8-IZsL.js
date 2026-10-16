import { E as __toESM, T as __exportAll, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as authFetch } from "./auth-fetch-BggIZaGf.js";
import { t as createLucideIcon } from "./createLucideIcon-ZIVktEBq.js";
import { d as useControllableState, h as composeEventHandlers, i as Presence, m as createContextScope, u as Primitive } from "./es2015-BDbqYqHm.js";
import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BB9AB3vt.js";
import { t as cn } from "./utils-8qBjT-XH.js";
import { t as Button } from "./button-D3WpGtsB.js";
import { t as Check } from "./check-D7kn-cfT.js";
import { t as LoaderCircle } from "./loader-circle-Be8OWdZ5.js";
import { t as Mail } from "./mail-BCfpLZJj.js";
import { t as Smartphone } from "./smartphone-C3Wo9C5C.js";
import { t as useSize } from "./dist-C5VmNqSD.js";
//#region ../venezuela-agro-auth/node_modules/lucide-react/dist/esm/icons/shield-check.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ShieldCheck = createLucideIcon("shield-check", [["path", {
	d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
	key: "oel41y"
}], ["path", {
	d: "m9 12 2 2 4-4",
	key: "dzmm74"
}]]);
//#endregion
//#region ../venezuela-agro-auth/node_modules/@radix-ui/react-checkbox/node_modules/@radix-ui/react-compose-refs/dist/index.mjs
var __defProp$1 = Object.defineProperty;
var __name$1 = (target, value) => __defProp$1(target, "name", {
	value,
	configurable: true
});
function setRef(ref, value) {
	if (typeof ref === "function") return ref(value);
	else if (ref !== null && ref !== void 0) ref.current = value;
}
__name$1(setRef, "setRef");
function composeRefs(...refs) {
	return (node) => {
		let hasCleanup = false;
		const cleanups = refs.map((ref) => {
			const cleanup = setRef(ref, node);
			if (!hasCleanup && typeof cleanup == "function") hasCleanup = true;
			return cleanup;
		});
		if (hasCleanup) return () => {
			for (let i = 0; i < cleanups.length; i++) {
				const cleanup = cleanups[i];
				if (typeof cleanup == "function") cleanup();
				else setRef(refs[i], null);
			}
		};
	};
}
__name$1(composeRefs, "composeRefs");
function useComposedRefs(...refs) {
	return import_react.useCallback(composeRefs(...refs), refs);
}
__name$1(useComposedRefs, "useComposedRefs");
//#endregion
//#region ../venezuela-agro-auth/node_modules/@radix-ui/react-checkbox/dist/index.mjs
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", {
	value,
	configurable: true
});
var CHECKBOX_NAME = "Checkbox";
var [createCheckboxContext, createCheckboxScope] = createContextScope(CHECKBOX_NAME);
var [CheckboxProviderImpl, useCheckboxContext] = createCheckboxContext(CHECKBOX_NAME);
function CheckboxProvider(props) {
	const { __scopeCheckbox, checked: checkedProp, children, defaultChecked, disabled, form, name, onCheckedChange, required, value = "on", internal_do_not_use_render } = props;
	const [checked, setChecked] = useControllableState({
		prop: checkedProp,
		defaultProp: defaultChecked ?? false,
		onChange: onCheckedChange,
		caller: CHECKBOX_NAME
	});
	const [control, setControl] = import_react.useState(null);
	const [bubbleInput, setBubbleInput] = import_react.useState(null);
	const hasConsumerStoppedPropagationRef = import_react.useRef(false);
	const [userInteractionCount, onUserInteraction] = import_react.useReducer((count) => count + 1, 0);
	const isFormControl = control ? !!form || !!control.closest("form") : true;
	const context = {
		checked,
		disabled,
		setChecked,
		control,
		setControl,
		name,
		form,
		value,
		hasConsumerStoppedPropagationRef,
		userInteractionCount,
		onUserInteraction,
		required,
		defaultChecked: isIndeterminate(defaultChecked) ? false : defaultChecked,
		isFormControl,
		bubbleInput,
		setBubbleInput
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxProviderImpl, {
		scope: __scopeCheckbox,
		...context,
		children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children
	});
}
__name(CheckboxProvider, "CheckboxProvider");
var TRIGGER_NAME = "CheckboxTrigger";
var CheckboxTrigger = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function CheckboxTrigger2({ __scopeCheckbox, onKeyDown, onClick, ...checkboxProps }, forwardedRef) {
	const { control, value, disabled, checked, required, setControl, setChecked, hasConsumerStoppedPropagationRef, onUserInteraction, isFormControl, bubbleInput } = useCheckboxContext(TRIGGER_NAME, __scopeCheckbox);
	const composedRefs = useComposedRefs(forwardedRef, setControl);
	const initialCheckedStateRef = import_react.useRef(checked);
	import_react.useEffect(() => {
		const form = control?.form;
		if (form) {
			const reset = /* @__PURE__ */ __name(() => setChecked(initialCheckedStateRef.current), "reset");
			form.addEventListener("reset", reset);
			return () => form.removeEventListener("reset", reset);
		}
	}, [control, setChecked]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.button, {
		type: "button",
		role: "checkbox",
		"aria-checked": isIndeterminate(checked) ? "mixed" : checked,
		"aria-required": required,
		"data-state": getState(checked),
		"data-disabled": disabled ? "" : void 0,
		disabled,
		value,
		...checkboxProps,
		ref: composedRefs,
		onKeyDown: composeEventHandlers(onKeyDown, (event) => {
			if (event.key === "Enter") event.preventDefault();
		}),
		onClick: composeEventHandlers(onClick, (event) => {
			onUserInteraction();
			setChecked((prevChecked) => isIndeterminate(prevChecked) ? true : !prevChecked);
			if (bubbleInput && isFormControl) {
				hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
				if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
			}
		})
	});
}, "CheckboxTrigger"));
var Checkbox$1 = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function Checkbox2(props, forwardedRef) {
	const { __scopeCheckbox, name, checked, defaultChecked, required, disabled, value, onCheckedChange, form, ...checkboxProps } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxProvider, {
		__scopeCheckbox,
		checked,
		defaultChecked,
		disabled,
		required,
		onCheckedChange,
		name,
		form,
		value,
		internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxTrigger, {
			...checkboxProps,
			ref: forwardedRef,
			__scopeCheckbox
		}), isFormControl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxBubbleInput, { __scopeCheckbox })] })
	});
}, "Checkbox"));
var INDICATOR_NAME = "CheckboxIndicator";
var CheckboxIndicator = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function CheckboxIndicator2(props, forwardedRef) {
	const { __scopeCheckbox, forceMount, ...indicatorProps } = props;
	const context = useCheckboxContext(INDICATOR_NAME, __scopeCheckbox);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presence, {
		present: forceMount || isIndeterminate(context.checked) || context.checked === true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.span, {
			"data-state": getState(context.checked),
			"data-disabled": context.disabled ? "" : void 0,
			...indicatorProps,
			ref: forwardedRef,
			style: {
				pointerEvents: "none",
				...props.style
			}
		})
	});
}, "CheckboxIndicator"));
var BUBBLE_INPUT_NAME = "CheckboxBubbleInput";
var CheckboxBubbleInput = /* @__PURE__ */ import_react.forwardRef(/* @__PURE__ */ __name(function CheckboxBubbleInput2({ __scopeCheckbox, onClick, ...props }, forwardedRef) {
	const { control, hasConsumerStoppedPropagationRef, userInteractionCount, checked, defaultChecked, required, disabled, name, value, form, bubbleInput, setBubbleInput } = useCheckboxContext(BUBBLE_INPUT_NAME, __scopeCheckbox);
	const composedRefs = useComposedRefs(forwardedRef, setBubbleInput);
	const controlSize = useSize(control);
	const shouldStopClickPropagationRef = import_react.useRef(false);
	const prevCheckedRef = import_react.useRef(checked);
	const prevUserInteractionCountRef = import_react.useRef(userInteractionCount);
	import_react.useEffect(() => {
		const input = bubbleInput;
		if (!input) return;
		const inputProto = window.HTMLInputElement.prototype;
		const setChecked = Object.getOwnPropertyDescriptor(inputProto, "checked").set;
		const isUserInteraction = userInteractionCount !== prevUserInteractionCountRef.current;
		prevUserInteractionCountRef.current = userInteractionCount;
		const checkedChanged = prevCheckedRef.current !== checked;
		prevCheckedRef.current = checked;
		const bubbles = !(isUserInteraction && hasConsumerStoppedPropagationRef.current);
		if (checkedChanged && setChecked) {
			shouldStopClickPropagationRef.current = !isUserInteraction;
			const event = new Event("click", { bubbles });
			input.indeterminate = isIndeterminate(checked);
			setChecked.call(input, isIndeterminate(checked) ? false : checked);
			input.dispatchEvent(event);
			shouldStopClickPropagationRef.current = false;
		}
	}, [
		bubbleInput,
		checked,
		hasConsumerStoppedPropagationRef,
		userInteractionCount
	]);
	const defaultCheckedRef = import_react.useRef(isIndeterminate(checked) ? false : checked);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primitive.input, {
		type: "checkbox",
		"aria-hidden": true,
		defaultChecked: defaultChecked ?? defaultCheckedRef.current,
		required,
		disabled,
		name,
		value,
		form,
		...props,
		tabIndex: -1,
		ref: composedRefs,
		onClick: composeEventHandlers(onClick, (event) => {
			if (shouldStopClickPropagationRef.current) event.stopPropagation();
		}),
		style: {
			...props.style,
			...controlSize,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0,
			transform: "translateX(-100%)"
		}
	});
}, "CheckboxBubbleInput"));
function isFunction(value) {
	return typeof value === "function";
}
__name(isFunction, "isFunction");
function isIndeterminate(checked) {
	return checked === "indeterminate";
}
__name(isIndeterminate, "isIndeterminate");
function getState(checked) {
	return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
__name(getState, "getState");
//#endregion
//#region components/ui/checkbox.tsx
function Checkbox({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
		"data-slot": "checkbox",
		className: cn("peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" })
		})
	});
}
//#endregion
//#region components/security-center.tsx
var security_center_exports = /* @__PURE__ */ __exportAll({ SecurityCenter: () => SecurityCenter });
function SecurityCenter({ mode = "full", requirePublic = false }) {
	const [status, setStatus] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [working, setWorking] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [publicConsent, setPublicConsent] = (0, import_react.useState)(false);
	const [phone, setPhone] = (0, import_react.useState)("");
	const [emailConfirmation, setEmailConfirmation] = (0, import_react.useState)("");
	const [securityConsent, setSecurityConsent] = (0, import_react.useState)(false);
	const load = (0, import_react.useCallback)(async () => {
		const response = await authFetch("/api/security/status", { cache: "no-store" });
		if (response.ok) setStatus(await response.json());
		setLoading(false);
	}, []);
	(0, import_react.useEffect)(() => {
		let active = true;
		authFetch("/api/security/status", { cache: "no-store" }).then(async (response) => {
			if (active && response.ok) setStatus(await response.json());
			if (active) setLoading(false);
		}).catch(() => {
			if (active) {
				setLoading(false);
				setMessage("Sin conexión. Tus registros locales siguen disponibles.");
			}
		});
		return () => {
			active = false;
		};
	}, []);
	async function acceptConsent() {
		setWorking("consent");
		try {
			if ((await authFetch("/api/security/consent", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					publicContentAccepted: publicConsent,
					securitySignalsAccepted: securityConsent,
					phone,
					emailConfirmation
				})
			})).ok) {
				setMessage("Preferencias de privacidad guardadas.");
				await load();
			} else setMessage("No pudimos guardar tus preferencias. Intenta nuevamente con conexión.");
		} catch {
			setMessage("Sin conexión. Completa este primer paso cuando tengas acceso a internet.");
		} finally {
			setWorking("");
		}
	}
	async function trustDevice() {
		setWorking("device");
		const connection = navigator.connection?.effectiveType ?? "no disponible";
		const platform = navigator.userAgentData?.platform ?? navigator.platform ?? "dispositivo";
		const response = await authFetch("/api/security/device", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				label: deviceLabel(),
				platform,
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				connectionClass: connection
			})
		});
		const result = await response.json().catch(() => ({}));
		setMessage(response.ok ? "Este dispositivo quedó reconocido por 90 días. Puedes revocarlo cuando quieras." : result.error === "security_signal_consent_required" ? "Activa primero el permiso de señales técnicas en privacidad." : "No pudimos reconocer este dispositivo.");
		await load();
		setWorking("");
	}
	async function removeDevice() {
		setWorking("device");
		await authFetch("/api/security/device", { method: "DELETE" });
		setMessage("Se eliminó la confianza de este dispositivo.");
		await load();
		setWorking("");
	}
	const needsConsent = !loading && status && (!status.phone || !status.consent || status.consent.policyVersion !== status.policyVersion || requirePublic && !status.consent.publicContentAccepted);
	if (mode === "gate") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: Boolean(needsConsent),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-xl border-[#3e2a19]/10 bg-[#f3ebdd]",
			showCloseButton: false,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display text-3xl",
					children: "Tus datos, bajo tu control."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-sm leading-6 text-[#5f574f]",
					children: "Para guardar y sincronizar tu finca necesitamos los datos esenciales de tu cuenta y los registros que tú decidas crear. Nada privado se convierte en publicación sin tu acción."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 text-sm leading-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "break-all text-sm",
							children: ["Correo de tu cuenta: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: status?.email })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block font-semibold",
							children: ["Confirma ese correo *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								value: emailConfirmation,
								onChange: (e) => setEmailConfirmation(e.target.value),
								required: true,
								className: "mt-2 block h-12 w-full rounded-xl border px-3",
								autoComplete: "email"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block font-semibold",
							children: ["Celular de contacto *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "tel",
								value: phone,
								onChange: (e) => setPhone(e.target.value),
								required: true,
								className: "mt-2 block h-12 w-full rounded-xl border px-3",
								autoComplete: "tel",
								placeholder: "+58 412 123 4567"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs",
							children: "El correo y el celular se guardan en nuestra base de datos para tu cuenta. No enviamos códigos SMS ni tomamos datos biométricos."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex gap-3 rounded-xl bg-white p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "mt-1 shrink-0 text-[#4c6b3a]",
								size: 18
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Necesario:" }), " cuenta, finca, registros locales y sincronización."] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex cursor-pointer gap-3 rounded-xl bg-white p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								checked: publicConsent,
								onCheckedChange: (value) => setPublicConsent(Boolean(value))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Contenido público:" }), " autorizo publicar los datos que yo envíe al marketplace, directorio o proyectos después de revisión."] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex cursor-pointer gap-3 rounded-xl bg-white p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								checked: securityConsent,
								onCheckedChange: (value) => setSecurityConsent(Boolean(value))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Seguridad opcional:" }), " autorizo guardar nombre del dispositivo, zona horaria, clase de conexión y una señal de red transformada, nunca la IP completa."] })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-[#71685f]",
					children: "Puedes cambiar o revocar estas opciones en Seguridad y privacidad. Consulta la política completa antes de publicar información sensible."
				}),
				message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-sm leading-6 text-[#6b4a2f]",
					children: message
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => void acceptConsent(),
					disabled: working === "consent" || !phone || emailConfirmation.trim().toLowerCase() !== status?.email.toLowerCase() || requirePublic && !publicConsent,
					className: "h-12 rounded-full bg-[#3e2a19] text-white",
					children: [
						working === "consent" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }),
						" ",
						"Aceptar y continuar"
					]
				})
			]
		})
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-52 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin text-[#4c6b3a]" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SecurityCard, {
				icon: Mail,
				title: "Correo y contacto de tu cuenta",
				status: status?.phone ? "Datos guardados" : "Completa tu contacto",
				copy: "Confirma el correo de tu cuenta y registra tu celular. Este contacto se guarda de forma privada; no se publica en tu ficha automáticamente.",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "break-all text-sm font-semibold",
						children: status?.email
					}),
					status?.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: status.phone
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-6",
						children: "El acceso se gestiona con tu cuenta de ChatGPT. Repetir el correo confirma el dato; no sustituye una verificación por mensaje."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityCard, {
				icon: Smartphone,
				title: "Dispositivo reconocido",
				status: status?.trustedDevice?.label ?? "No reconocido",
				copy: "Reduce avisos repetitivos durante 90 días. Guardamos señales técnicas mínimas y transformadas, con tu permiso.",
				children: status?.trustedDevice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => void removeDevice(),
					disabled: Boolean(working),
					variant: "outline",
					className: "rounded-full bg-white",
					children: "Revocar dispositivo"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => void trustDevice(),
					disabled: Boolean(working) || !status?.consent?.securitySignalsAccepted,
					className: "rounded-full bg-[#4c6b3a] text-white",
					children: [
						working === "device" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }),
						" ",
						"Reconocer este dispositivo"
					]
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-5 rounded-[1.6rem] border border-[#3e2a19]/10 bg-white p-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-1 shrink-0 text-[#4c6b3a]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-bold",
					children: "Qué comprobamos y qué no"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-7 text-[#5f574f]",
					children: "La sesión identifica tu cuenta. El dispositivo reconocido compara un token protegido y señales mínimas. La ubicación de red o la IP por sí solas nunca se usan como prueba de identidad ni se guarda la IP completa."
				})] })]
			})
		}),
		message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			className: "mt-5 rounded-2xl bg-[#e8f0df] p-4 text-sm font-semibold text-[#365026]",
			children: message
		})
	] });
}
function SecurityCard({ icon: Icon, title, status, copy, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-[1.6rem] border border-[#3e2a19]/10 bg-white p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-11 w-11 items-center justify-center rounded-xl bg-[#3e2a19] text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 21 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-[#f3ebdd] px-3 py-1 text-xs font-bold",
					children: status
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-5 text-lg font-bold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 min-h-20 text-sm leading-6 text-[#71685f]",
				children: copy
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children
			})
		]
	});
}
function deviceLabel() {
	if (/iPhone/i.test(navigator.userAgent)) return "Mi iPhone";
	if (/iPad/i.test(navigator.userAgent)) return "Mi iPad";
	if (/Macintosh/i.test(navigator.userAgent)) return "Mi Mac";
	if (/Android/i.test(navigator.userAgent)) return "Mi Android";
	return "Mi dispositivo";
}
//#endregion
export { security_center_exports as n, ShieldCheck as r, SecurityCenter as t };
