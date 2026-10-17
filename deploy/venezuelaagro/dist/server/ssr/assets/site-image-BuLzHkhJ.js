import { n as require_jsx_runtime } from "../index.js";
import { t as Image } from "./image-t1ScfuA_.js";
//#region components/site-image.tsx
var import_jsx_runtime = require_jsx_runtime();
/** Serve pre-compressed assets directly so they also work from the offline cache. */
function SiteImage({ alt, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
		...props,
		alt,
		unoptimized: true
	});
}
//#endregion
export { SiteImage as t };
