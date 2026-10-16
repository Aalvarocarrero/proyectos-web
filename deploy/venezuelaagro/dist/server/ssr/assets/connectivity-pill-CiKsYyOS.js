import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as Cloud } from "./cloud-vh94nK20.js";
import { t as CloudOff } from "./cloud-off-BFgsW-OX.js";
//#region components/connectivity-pill.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function ConnectivityPill() {
	const online = (0, import_react.useSyncExternalStore)(subscribe, () => navigator.onLine, () => true);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-semibold tracking-normal text-white/80 backdrop-blur-xl",
		role: "status",
		"aria-live": "polite",
		"aria-atomic": "true",
		title: online ? "El navegador detecta red. Esto no confirma acceso al servidor, sincronización ni copia de seguridad." : "Solo podrás consultar recursos preparados y registros guardados en este navegador.",
		children: [online ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, {
			size: 15,
			"aria-hidden": "true"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudOff, {
			size: 15,
			"aria-hidden": "true"
		}), online ? "Red detectada · no confirma sincronización" : "Sin conexión · solo lo guardado aquí"]
	});
}
function subscribe(callback) {
	window.addEventListener("online", callback);
	window.addEventListener("offline", callback);
	return () => {
		window.removeEventListener("online", callback);
		window.removeEventListener("offline", callback);
	};
}
//#endregion
export { ConnectivityPill };
