import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as Link } from "./link-BIjyqzpN.js";
import { n as safeDirectoryReturn } from "./directory-filters-C0npapi5.js";
//#region components/directory-return-link.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var subscribe = () => () => {};
/** A new visit gets the directory; a detail visit keeps this tab's public filters. */
function DirectoryReturnLink({ href, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		href: (0, import_react.useSyncExternalStore)(subscribe, () => {
			try {
				return safeDirectoryReturn(sessionStorage.getItem(`agro-directory-return:${href}`), href);
			} catch {
				return href;
			}
		}, () => href),
		className,
		children
	});
}
//#endregion
export { DirectoryReturnLink };
