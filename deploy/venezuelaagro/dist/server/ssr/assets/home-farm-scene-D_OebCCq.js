import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import FarmMasterplanWebGL from "./farm-masterplan-webgl-DA0OgueF.js";
import { t as createFarmShowcase } from "./farm-showcase-DiJbFLMk.js";
//#region components/home-farm-scene.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var noop = () => {};
/** Lazy visual-only entry: no workspace, persistence, dossier or record-list imports. */
function HomeFarmScene({ paused, onReady, onUnavailable }) {
	const [model] = (0, import_react.useState)(createFarmShowcase);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmMasterplanWebGL, {
		propertyOutline: model.boundary.points,
		areas: model.illustrated.areas,
		animals: model.illustrated.animals,
		farmName: model.farm.payload.name,
		physicalAreaSqM: model.farm.payload.areaSqM,
		surveyBased: model.boundary.basis === "survey",
		onSelect: noop,
		onReturn: noop,
		onUnavailable,
		autoTour: true,
		readOnly: true,
		preview: true,
		onPreviewReady: onReady,
		tourPaused: paused,
		interactionBlocked: paused
	});
}
//#endregion
export { HomeFarmScene as default };
