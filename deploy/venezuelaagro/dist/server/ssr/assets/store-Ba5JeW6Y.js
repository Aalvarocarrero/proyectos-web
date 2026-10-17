import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-OtKWZ-kp.js";
//#region components/marketplace-photo.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function MarketplacePhoto({ src, alt, className = "", compact = false, fit = "cover" }) {
	const [failed, setFailed] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const retry = () => setFailed(null);
		window.addEventListener("online", retry);
		return () => window.removeEventListener("online", retry);
	}, []);
	if (!src || failed === src) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		className: `flex h-full flex-col w-full items-center justify-center text-center font-semibold text-[#6b4a2f] ${compact ? "min-h-0 p-1 text-xs leading-4" : "min-h-36 p-5 text-sm leading-6"} ${className}`,
		children: [compact ? src ? "Foto no disponible" : "Falta fotografía" : src ? "No se pudo cargar la fotografía. Revisa la conexión; no la sustituimos por un dibujo." : "Falta la fotografía del producto. Esta ficha necesita una foto real antes de publicarse.", src && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setFailed(null),
			className: "relative z-10 mt-3 min-h-11 rounded-full border px-4",
			children: compact ? "Reintentar" : "Reintentar fotografía"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt,
		loading: "lazy",
		decoding: "async",
		onError: () => setFailed(src),
		className: `h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} ${className}`
	});
}
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Store = createLucideIcon("store", [
	["path", {
		d: "M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5",
		key: "slp6dd"
	}],
	["path", {
		d: "M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244",
		key: "o0xfot"
	}],
	["path", {
		d: "M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05",
		key: "wn3emo"
	}]
]);
//#endregion
export { MarketplacePhoto as n, Store as t };
