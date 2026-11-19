import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-AyioadWc.js";
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Play = createLucideIcon("play", [["path", {
	d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
	key: "10ikf1"
}]]);
var HISTORY_REEL_EMBED = "https://www.instagram.com/reel/DXA0ynSk30U/embed/";
var import_jsx_runtime = require_jsx_runtime();
function HomeHistoryVideo() {
	const [playing, setPlaying] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		"aria-labelledby": "home-history-title",
		className: "border-b border-[#365026]/15 bg-[#f4eddf] px-5 py-10 sm:px-8 lg:px-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-[1280px] items-center gap-7 md:grid-cols-[.8fr_1.2fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-kicker",
					children: "VOCES DE NUESTRA TIERRA"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "home-history-title",
					className: "font-display mt-3 text-4xl",
					children: "Nuestra historia"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-lg text-base leading-7 text-[#5f574f]",
					children: "Raíces en Playitas de Betania, Apure. Un testimonio sobre la historia de la comunidad que nos inspira."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-6 text-[#71685f]",
					children: "Entrevista de Radio Fe y Alegría El Nula 106.1 FM · 5 min 57 s. El reproductor de Instagram solo se carga cuando lo eliges."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-2xl bg-[#171713] shadow-lg",
				children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
					src: HISTORY_REEL_EMBED,
					title: "Testimonio sobre Playitas de Betania en Instagram",
					referrerPolicy: "no-referrer",
					sandbox: "allow-same-origin allow-scripts",
					allow: "fullscreen; encrypted-media; picture-in-picture",
					allowFullScreen: true,
					loading: "lazy",
					className: "block aspect-video min-h-[320px] w-full border-0"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setPlaying(true),
					className: "group relative block aspect-video w-full text-white focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#365026]",
					"aria-label": "Reproducir Nuestra historia: Playitas de Betania",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/historia/playitas-betania-poster.webp",
						alt: "Portada del testimonio de Playitas de Betania",
						width: "636",
						height: "360",
						loading: "lazy",
						className: "h-full w-full object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-3 rounded-full bg-[#f4eddf] px-5 py-3 font-semibold text-[#203e2d]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
								size: 22,
								"aria-hidden": "true"
							}), "Ver nuestra historia"]
						})
					})]
				}), playing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-center gap-4 px-4 py-3 text-sm text-[#f4eddf]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "https://www.instagram.com/reel/DXA0ynSk30U/",
						target: "_blank",
						rel: "noopener noreferrer",
						className: "underline underline-offset-4",
						children: "Abrir en Instagram"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "underline underline-offset-4",
						onClick: () => setPlaying(false),
						children: "Volver a la portada"
					})]
				})]
			})]
		})
	});
}
export { HomeHistoryVideo };
