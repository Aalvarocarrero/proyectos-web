import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { a as getInstallGuidance } from "./install-guidance-Dq4s3ddC.js";
import { a as subscribeInstallAction, i as requestInstallAction, n as installActionSnapshot, t as installActionServerSnapshot } from "./install-action-C1mhv1ba.js";
//#region components/device-install-action.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function DeviceInstallAction() {
	const state = (0, import_react.useSyncExternalStore)(subscribeInstallAction, installActionSnapshot, installActionServerSnapshot), guidance = getInstallGuidance(state.environment, state.nativePrompt);
	const label = state.installed ? "Aplicación ya instalada" : state.environment.os === "ios" ? "Ver cómo añadir a inicio" : state.ready ? guidance.action : "Ver opciones de instalación";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "my-6 min-w-0 rounded-2xl border border-[#4c6b3a]/20 bg-white p-5 text-[#3e2a19]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			disabled: !state.ready || state.installed,
			onClick: () => requestInstallAction(),
			className: "min-h-12 max-w-full rounded-full bg-[#4c6b3a] px-5 py-3 text-sm font-bold text-white disabled:opacity-50",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-xs leading-6",
			children: [state.nativePrompt ? "El navegador abrirá su confirmación; tú decides si instalar." : "Mostramos los pasos disponibles para tu navegador. En iPhone y iPad, Safari requiere que abras Compartir y confirmes Añadir.", " Instalar el icono no descarga automáticamente tus datos: prepara Mi Finca por separado para usarla sin señal."]
		})]
	});
}
//#endregion
export { DeviceInstallAction };
