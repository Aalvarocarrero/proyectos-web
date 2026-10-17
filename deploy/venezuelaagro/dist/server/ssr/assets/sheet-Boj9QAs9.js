import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { n as OfflineAccountLockPanel, r as useOfflineAccountBlocked } from "./offline-account-boundary-hnu6xdcm.js";
import { t as createLucideIcon } from "./createLucideIcon-OtKWZ-kp.js";
import { t as X } from "./x-DB9nLDwG.js";
import { d as DialogContent, f as DialogDescription, g as DialogTrigger, h as DialogTitle, l as Dialog, m as DialogPortal, p as DialogOverlay, u as DialogClose } from "./dialog-CBD8GOFt.js";
import { t as cn } from "./utils-B3xYltDT.js";
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Trash2 = createLucideIcon("trash-2", [
	["path", {
		d: "M10 11v6",
		key: "nco0om"
	}],
	["path", {
		d: "M14 11v6",
		key: "outv1u"
	}],
	["path", {
		d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
		key: "miytrc"
	}],
	["path", {
		d: "M3 6h18",
		key: "d0wm0j"
	}],
	["path", {
		d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
		key: "e791ji"
	}]
]);
//#endregion
//#region components/ui/sheet.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SheetFocusContext = import_react.createContext(null);
function Sheet({ ...props }) {
	const triggersRef = import_react.useRef(0);
	const focusRegistry = import_react.useMemo(() => ({
		hasTrigger: () => triggersRef.current > 0,
		registerTrigger: () => {
			triggersRef.current++;
			return () => {
				triggersRef.current--;
			};
		}
	}), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetFocusContext.Provider, {
		value: focusRegistry,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			"data-slot": "sheet",
			...props
		})
	});
}
function SheetTrigger({ ...props }) {
	const focusRegistry = import_react.useContext(SheetFocusContext);
	import_react.useEffect(() => focusRegistry?.registerTrigger(), [focusRegistry]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
		"data-slot": "sheet-trigger",
		...props
	});
}
function SheetPortal({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogPortal, {
		"data-slot": "sheet-portal",
		...props
	});
}
function SheetOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
		"data-slot": "sheet-overlay",
		className: cn("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", className),
		...props
	});
}
function SheetContent({ className, children, side = "right", showCloseButton = true, onOpenAutoFocus, onCloseAutoFocus, onEscapeKeyDown, onInteractOutside, ...props }) {
	const accountBlocked = useOfflineAccountBlocked();
	const opener = import_react.useRef(null);
	const focusRegistry = import_react.useContext(SheetFocusContext);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		"data-slot": "sheet-content",
		className: cn("fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500", side === "right" && "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm", side === "left" && "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm", side === "top" && "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top", side === "bottom" && "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom", className),
		...props,
		"aria-label": accountBlocked ? "Verificar la cuenta original" : props["aria-label"],
		...accountBlocked ? {
			"aria-labelledby": void 0,
			"aria-describedby": void 0
		} : {},
		onEscapeKeyDown: (event) => {
			if (accountBlocked) event.preventDefault();
			else onEscapeKeyDown?.(event);
		},
		onInteractOutside: (event) => {
			if (accountBlocked) event.preventDefault();
			else onInteractOutside?.(event);
		},
		onOpenAutoFocus: (event) => {
			opener.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
			onOpenAutoFocus?.(event);
		},
		onCloseAutoFocus: (event) => {
			onCloseAutoFocus?.(event);
			if (!event.defaultPrevented && focusRegistry && !focusRegistry.hasTrigger() && opener.current?.isConnected) {
				event.preventDefault();
				opener.current.focus({ preventScroll: true });
			}
		},
		children: [accountBlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineAccountLockPanel, { withinModal: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			hidden: accountBlocked,
			inert: accountBlocked,
			"aria-hidden": accountBlocked || void 0,
			style: { display: accountBlocked ? "none" : "contents" },
			"data-account-modal-draft": "",
			children: [showCloseButton && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-slot": "sheet-close-rail",
				className: "sticky top-0 z-40 -mb-11 flex h-11 shrink-0 justify-end px-2 pt-2 pointer-events-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
					"data-slot": "sheet-close",
					"aria-label": "Cerrar",
					className: "pointer-events-auto relative flex size-11 shrink-0 items-center justify-center rounded-full border border-[#3e2a19]/30 bg-[#fffdf8] text-[#3e2a19] opacity-100 shadow-md hover:bg-[#f3ebdd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c6b3a] disabled:pointer-events-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-5",
						strokeWidth: 2.5
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Cerrar"
					})]
				})
			}), children]
		})]
	})] });
}
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "sheet-header",
		className: cn("flex flex-col gap-1.5 p-4", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
		"data-slot": "sheet-title",
		className: cn("font-semibold text-foreground", className),
		...props
	});
}
function SheetDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
		"data-slot": "sheet-description",
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
//#endregion
export { SheetTitle as a, SheetHeader as i, SheetContent as n, SheetTrigger as o, SheetDescription as r, Trash2 as s, Sheet as t };
