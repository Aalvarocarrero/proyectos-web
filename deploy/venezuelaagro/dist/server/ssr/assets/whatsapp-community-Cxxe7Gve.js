import { l as usePathname, n as require_jsx_runtime } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-AyioadWc.js";
import { t as ArrowUpRight } from "./arrow-up-right-Br5pp3RE.js";
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Users = createLucideIcon("users", [
	["path", {
		d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
		key: "1yyitq"
	}],
	["path", {
		d: "M16 3.128a4 4 0 0 1 0 7.744",
		key: "16gr8j"
	}],
	["path", {
		d: "M22 21v-2a4 4 0 0 0-3-3.87",
		key: "kshegd"
	}],
	["circle", {
		cx: "9",
		cy: "7",
		r: "4",
		key: "nufk8"
	}]
]);
var import_jsx_runtime = require_jsx_runtime();
var WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/KKJrfkL2li758KqbtJyJiW";
var topics = {
	"/financiamiento": "proyectos y opciones de financiamiento",
	"/guia-institucional": "orientación y trámites para tu finca",
	"/red": "tus experiencias y los retos del campo",
	"/plataforma": "organización y tecnología para tu finca",
	"/marketplace": "comercialización y oportunidades para el agro",
	"/aprende": "lo que estás aprendiendo y cómo aplicarlo en tu finca",
	"/profesionales": "asistencia técnica y conocimientos para el campo",
	"/fincas": "producción y gestión de tu finca",
	"/nosotros": "la experiencia de producir en Venezuela",
	"/proyectos": "ideas y proyectos para el agro"
};
function WhatsAppCommunity() {
	const topic = topics[usePathname()] ?? "producción, tecnología y los retos del campo";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "agro-community",
		"aria-label": "Comunidad de WhatsApp",
		"data-social-avoid": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "agro-community-inner",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "agro-community-copy",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "agro-community-kicker",
						children: "CAMPO + TECNOLOGÍA · COMUNIDAD"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "El campo crece cuando compartimos." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Únete ahora para conversar con otros productores sobre este tema: ",
						topic,
						"."
					] })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "agro-community-action",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: WHATSAPP_COMMUNITY_URL,
					target: "_blank",
					rel: "noopener noreferrer",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
							size: 23,
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Únete a la comunidad de WhatsApp" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
							size: 18,
							"aria-hidden": "true"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Grupo de conversación. Para atención privada, utiliza ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "agro-community-private",
						href: "https://wa.me/584264263601",
						target: "_blank",
						rel: "noopener noreferrer",
						children: "Contacto directo"
					}),
					"."
				] })]
			})]
		})
	});
}
export { WHATSAPP_COMMUNITY_URL, WhatsAppCommunity };
