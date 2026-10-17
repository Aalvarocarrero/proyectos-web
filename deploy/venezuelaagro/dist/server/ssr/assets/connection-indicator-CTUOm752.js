import { E as __toESM, b as require_react, l as usePathname, n as require_jsx_runtime } from "../index.js";
import { u as getPendingCount, v as subscribeOfflineChanges } from "./offline-db-Co86AgBD.js";
import { f as subscribeOfflineChoice, r as useOfflineAccountBlocked, s as localOwner } from "./offline-account-boundary-hnu6xdcm.js";
import { t as createLucideIcon } from "./createLucideIcon-OtKWZ-kp.js";
import { t as cn } from "./utils-B3xYltDT.js";
import { t as Link } from "./link-BIjyqzpN.js";
import { t as WifiOff } from "./wifi-off-DXR946Lj.js";
import { a as Trigger, i as Root2, n as Content2, r as Portal } from "./dist-DdxLtTHE.js";
//#region node_modules/lucide-react/dist/esm/icons/wifi.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Wifi = createLucideIcon("wifi", [
	["path", {
		d: "M12 20h.01",
		key: "zekei9"
	}],
	["path", {
		d: "M2 8.82a15 15 0 0 1 20 0",
		key: "dnpr2z"
	}],
	["path", {
		d: "M5 12.859a10 10 0 0 1 14 0",
		key: "1x1e6c"
	}],
	["path", {
		d: "M8.5 16.429a5 5 0 0 1 7 0",
		key: "1bycff"
	}]
]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CircleQuestionMark = createLucideIcon("circle-question-mark", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",
		key: "1u773s"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}]
]);
//#endregion
//#region components/ui/popover.tsx
var import_jsx_runtime = require_jsx_runtime();
function Popover({ open, defaultOpen = false, onOpenChange, ...props }) {
	const accountBlocked = useOfflineAccountBlocked();
	const [localOpen, setLocalOpen] = import_react.useState(defaultOpen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, {
		"data-slot": "popover",
		...props,
		open: !accountBlocked && (open ?? localOpen),
		onOpenChange: (next) => {
			if (accountBlocked && next) return;
			setLocalOpen(next);
			onOpenChange?.(next);
		}
	});
}
function PopoverTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		"data-slot": "popover-trigger",
		...props
	});
}
function PopoverContent({ className, align = "center", sideOffset = 4, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		"data-slot": "popover-content",
		align,
		sideOffset,
		className: cn("z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", className),
		...props
	}) });
}
//#endregion
//#region lib/connection-indicator.ts
function connectionIndicator({ online, pending, mode }) {
	const network = online === null ? "Comprobando conexión" : online ? "Con conexión" : "Sin conexión";
	return {
		short: online === false ? "Sin conexión · modo local" : network,
		network,
		networkDetail: online === null ? "Todavía no se ha comprobado la conexión del navegador." : online ? "El navegador detecta red. No garantiza acceso al servidor ni que tus cambios estén sincronizados." : "Sin conexión · modo local. Solo están disponibles los datos y recursos preparados en este navegador.",
		detail: mode === "demo" ? "Demostración: no consulta ni modifica tus registros reales." : mode === "local" ? "Estás trabajando en este dispositivo, sin respaldo central confirmado." : mode === "account" ? "Espacio de la cuenta seleccionada. El respaldo solo se confirma al recibir respuesta del servidor." : "Todavía no se ha comprobado el espacio de trabajo.",
		queue: mode === "demo" ? "Sin cola de registros reales." : pending === null ? "No se pudo comprobar la cola local." : pending > 0 ? `${pending} cambio${pending === 1 ? "" : "s"} pendiente${pending === 1 ? "" : "s"} de sincronizar` : "No se detectan cambios pendientes en este espacio. Esto no acredita una copia de seguridad.",
		pending: mode === "demo" ? 0 : pending
	};
}
//#endregion
//#region components/connection-indicator.tsx
function subscribeNetwork(callback) {
	window.addEventListener("online", callback);
	window.addEventListener("offline", callback);
	return () => {
		window.removeEventListener("online", callback);
		window.removeEventListener("offline", callback);
	};
}
/** In-flow header control. The learning game never reads real workspace state. */
function ConnectionIndicator({ tone = "dark" }) {
	const path = usePathname() ?? "";
	if (path === "/juego-finca" || path.startsWith("/juego-finca/")) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionIndicatorForRoute, {
		path,
		tone
	}, path);
}
function ConnectionIndicatorForRoute({ path, tone }) {
	const isDemo = [
		"/finca-demo",
		"/finca-modelo",
		"/modelos-finca"
	].some((route) => path === route || path.startsWith(`${route}/`));
	const online = (0, import_react.useSyncExternalStore)(subscribeNetwork, () => navigator.onLine, () => null);
	const [pending, setPending] = (0, import_react.useState)(null);
	const [mode, setMode] = (0, import_react.useState)(isDemo ? "demo" : "unknown");
	const titleId = (0, import_react.useId)();
	(0, import_react.useEffect)(() => {
		let active = true, revision = 0;
		if (isDemo) return;
		async function refresh() {
			const current = ++revision;
			try {
				const owner = await localOwner();
				const count = await getPendingCount(owner);
				if (!active || current !== revision) return;
				setMode(owner === "device-local" ? "local" : "account");
				setPending(count);
			} catch {
				if (active && current === revision) {
					setMode("unknown");
					setPending(null);
				}
			}
		}
		refresh();
		const off = subscribeOfflineChanges(() => void refresh());
		const choice = subscribeOfflineChoice(() => void refresh());
		window.addEventListener("online", refresh);
		window.addEventListener("offline", refresh);
		return () => {
			active = false;
			revision++;
			off();
			choice();
			window.removeEventListener("online", refresh);
			window.removeEventListener("offline", refresh);
		};
	}, [isDemo]);
	const info = connectionIndicator({
		online,
		pending,
		mode
	});
	const Icon = online === null ? CircleQuestionMark : online ? Wifi : WifiOff;
	const hasPending = !!info.pending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "connection-indicator-trigger",
			"data-tone": tone,
			"data-network": online === null ? "unknown" : online ? "online" : "offline",
			"aria-label": `${info.short}. ${hasPending ? `${info.pending} cambios pendientes de sincronizar. ` : ""}Ver estado de conexión y guardado`,
			title: info.short,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "connection-indicator-icon",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 17 }), hasPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "connection-pending-dot" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "connection-indicator-label",
				"aria-hidden": "true",
				children: online === false ? "Sin red" : "Conexión"
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
		side: "bottom",
		align: "end",
		sideOffset: 8,
		collisionPadding: 12,
		"aria-labelledby": titleId,
		className: "z-[120] max-h-[var(--radix-popover-content-available-height)] w-80 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl bg-[#f8f3ea] p-5 text-[#3e2a19]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: titleId,
				className: "text-base font-bold",
				children: info.network
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-[#675f57]",
				children: info.networkDetail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-6",
				children: info.detail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 rounded-xl border bg-white p-3 text-xs leading-5",
				role: "status",
				"aria-live": "polite",
				children: info.queue
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				href: "/app",
				className: "mt-3 inline-flex min-h-11 items-center text-sm font-bold text-[#365026] underline",
				children: isDemo ? "Volver a Mi Finca real" : "Abrir Mi Finca y revisar el estado"
			})
		]
	})] });
}
//#endregion
export { ConnectionIndicator, PopoverContent as n, PopoverTrigger as r, Popover as t };
