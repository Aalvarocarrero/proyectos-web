import { n as require_jsx_runtime } from "../index.js";
import { b as socialSchema, h as publicSocialFields } from "./professional-profile-k05LGMn7.js";
import { t as createLucideIcon } from "./createLucideIcon-OtKWZ-kp.js";
import { a as YouTubeIcon, i as TikTokIcon, n as InstagramIcon, t as FacebookIcon } from "./brand-icons-VNAOb6KX.js";
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Globe = createLucideIcon("globe", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",
		key: "13o1zl"
	}],
	["path", {
		d: "M2 12h20",
		key: "9i4pu4"
	}]
]);
//#endregion
//#region components/profile-socials.tsx
var import_jsx_runtime = require_jsx_runtime();
var icons = {
	instagram: InstagramIcon,
	tiktok: TikTokIcon,
	facebook: FacebookIcon,
	youtube: YouTubeIcon,
	website: Globe
};
function ProfileSocials({ socials, demo = false }) {
	const safe = Object.fromEntries(publicSocialFields.map(([key]) => {
		const result = socialSchema.safeParse({ [key]: socials[key] || "" });
		return [key, result.success ? result.data[key] : ""];
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: publicSocialFields.filter(([key]) => demo || safe[key]).map(([key, label]) => {
			const Icon = icons[key];
			return demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				title: `${label} · ejemplo sin enlace`,
				className: "flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs text-[#71685f]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), label]
			}, key) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: safe[key],
				target: "_blank",
				rel: "noopener noreferrer",
				className: "flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), label]
			}, key);
		})
	});
}
//#endregion
export { Globe as n, ProfileSocials as t };
