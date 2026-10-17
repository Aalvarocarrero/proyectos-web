import { n as require_jsx_runtime } from "../index.js";
import { a as professionalImage, h as publicSocialFields, n as professionalCredential, o as professionalKeywords, r as professionalDetails } from "./professional-profile-k05LGMn7.js";
import { i as phoneDigits } from "./whatsapp-contact-DNnrmW1P.js";
import { t as createLucideIcon } from "./createLucideIcon-OtKWZ-kp.js";
import { r as ProfessionalTariffs } from "./professional-tariffs-Dfa9yaHh.js";
import { t as ContextualWhatsAppContact } from "./contextual-whatsapp-contact-CQpLkS3Q.js";
import { t as ImageShareButton } from "./image-share-CADXed1d.js";
import { o as professionalImageContent } from "./public-image-content-BTV9mqWc.js";
import { t as ProfileSocials } from "./profile-socials-BTF1UIZ5.js";
import { t as MapPin } from "./map-pin-DX3uixQw.js";
import { t as Phone } from "./phone-CuyS2t-T.js";
import { t as Mail } from "./mail-gj71jmf_.js";
import { t as ArrowUpRight } from "./arrow-up-right-CFz5Ndmb.js";
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var GraduationCap = createLucideIcon("graduation-cap", [
	["path", {
		d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
		key: "j76jl0"
	}],
	["path", {
		d: "M22 10v6",
		key: "1lu8f3"
	}],
	["path", {
		d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5",
		key: "1r8lef"
	}]
]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var BriefcaseBusiness = createLucideIcon("briefcase-business", [
	["path", {
		d: "M12 12h.01",
		key: "1mp3jc"
	}],
	["path", {
		d: "M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
		key: "1ksdt3"
	}],
	["path", {
		d: "M22 13a18.15 18.15 0 0 1-20 0",
		key: "12hx5q"
	}],
	["rect", {
		width: "20",
		height: "14",
		x: "2",
		y: "6",
		rx: "2",
		key: "i6l2r4"
	}]
]);
//#endregion
//#region components/professional-profile-view.tsx
var import_jsx_runtime = require_jsx_runtime();
function ProfessionalProfileView({ profile: p }) {
	const d = professionalDetails(p), image = professionalImage(p);
	const sections = [
		["Reservas y proceso de atención", d.bookingProcess],
		["Horarios y disponibilidad", d.availability],
		["Servicios que ofrece", d.services],
		["Trayectoria", d.trajectory],
		["Proyectos y participación", d.projects],
		["Formación complementaria", d.training]
	];
	const phone = /^[+\d\s().-]+$/.test(p.contact) && phoneDigits(p.contact).length >= 7;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 [overflow-wrap:anywhere]",
		children: [
			p.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-5 rounded-xl bg-[#eadfcd] p-4 text-sm leading-6",
				children: "Perfil ficticio de demostración. Todos los datos, formación, experiencia y proyectos son inventados. Imagen generada por IA · perfil 100 % ficticio. No permite contratar ni contactar a una persona real."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center",
				children: [image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: image,
					alt: p.demo ? `Retrato generado por IA de ${p.name}; identidad ficticia` : `Fotografía de ${p.name}`,
					width: 160,
					height: 160,
					loading: "lazy",
					className: "size-28 shrink-0 rounded-2xl object-cover sm:size-40"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-label": "Sin fotografía de perfil",
					className: "flex size-28 shrink-0 items-center justify-center rounded-2xl bg-[#e8f0df] text-3xl font-bold text-[#365026]",
					children: p.founder ? "AC" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefcaseBusiness, { size: 40 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-wider text-[#4c6b3a]",
							children: p.demo ? "Muestra de la plataforma" : p.founder ? "Perfil fundador" : "Perfil publicado"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 break-words text-2xl font-bold sm:text-3xl",
							children: p.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 break-words font-semibold text-[#4c6b3a]",
							children: p.profession
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 flex items-start gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
								size: 16,
								className: "mt-1 shrink-0"
							}), [p.municipality, p.state].filter(Boolean).join(", ")]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextualWhatsAppContact, {
				context: `${p.profession} · ${p.name}`,
				phone: p.contact,
				enabled: d.whatsapp,
				demo: p.demo,
				className: "mt-6 max-w-xl"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageShareButton, {
				content: professionalImageContent(p),
				label: "Compartir perfil en imagen",
				className: "button-light mt-6"
			}),
			d.profileType === "Empresa" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-2xl border bg-white p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-bold",
						children: ["Empresa · ", d.tradeName || d.corporateName]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm",
						children: ["Razón social: ", d.corporateName]
					}),
					d.responsibleName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm",
						children: ["Responsable: ", d.responsibleName]
					}),
					[
						d.taxId,
						d.registrationBody,
						d.registrationReference
					].filter(Boolean).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 break-words text-sm",
						children: ["Registro declarado: ", [
							d.taxId,
							d.registrationBody,
							d.registrationReference
						].filter(Boolean).join(" · ")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs",
						children: "Datos declarados por la empresa; no representan una verificación registral."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 whitespace-pre-line break-words text-base leading-7 text-[#5f574f]",
				children: p.introduction
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-6 grid gap-4 rounded-2xl bg-[#f3ebdd] p-5 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-[#71685f]",
						children: "Modalidad de atención"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 font-semibold",
						children: p.serviceMode
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-[#71685f]",
						children: "Etapa profesional"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "mt-1 font-semibold",
						children: [d.careerStage, !p.founder && ` · ${d.yearsExperience === 0 ? "Inicio de trayectoria" : `${d.yearsExperience} años de experiencia`}`]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-[#71685f]",
							children: "Estados de cobertura"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 break-words font-semibold",
							children: [p.state, ...d.coverageStates].filter((x, i, a) => a.indexOf(x) === i).join(" · ")
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfessionalTariffs, {
				tariffs: d.tariffs,
				demo: p.demo
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "flex items-center gap-2 text-lg font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { size: 21 }), " Formación académica"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 whitespace-pre-line break-words text-sm leading-7 text-[#5f574f]",
						children: [
							d.degree,
							d.university,
							d.graduationYear && `Año de graduación: ${d.graduationYear}`
						].filter(Boolean).join("\n") || "Formación por completar por el profesional."
					}),
					professionalCredential(p) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 break-words text-sm leading-6",
						children: ["Respaldo declarado: ", professionalCredential(p)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-[#71685f]",
						children: "La publicación del perfil no equivale a certificar títulos ni habilitaciones."
					})
				]
			}),
			sections.map(([title, text]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-bold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 whitespace-pre-line break-words text-sm leading-7 text-[#5f574f]",
					children: text || "El profesional podrá completar esta información."
				})]
			}, title)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-bold",
					children: "Especialidades y rubros"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: professionalKeywords(p).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "max-w-full break-words rounded-full bg-[#e8f0df] px-3 py-2 text-xs font-semibold text-[#365026]",
						children: tag
					}, tag))
				})]
			}),
			p.demo && d.profileType === "Persona natural" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-xs leading-6 text-[#71685f]",
				children: [
					"Razón social, nombre comercial y RIF de empresa: no aplican a esta persona ficticia. Registro profesional de ejemplo: ",
					d.registrationBody,
					" · ",
					d.registrationReference,
					". No constituye una habilitación real."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 text-lg font-bold",
					children: "Redes y sitio web"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSocials, {
					socials: {
						...d.socials,
						instagram: d.socials.instagram || d.instagram,
						website: d.socials.website || d.website
					},
					demo: p.demo
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 rounded-2xl border border-[#3e2a19]/10 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-bold",
					children: "Contactar al profesional"
				}), p.demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm leading-6 text-[#71685f]",
					children: [
						"Contactos de demostración, sin enlaces operativos: ",
						p.contact,
						". Correo de ejemplo: ",
						d.email || "No disponible en esta muestra",
						". No envíes solicitudes a estos datos."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2",
					children: [
						phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							className: "button-dark min-w-0 break-all",
							href: `tel:+${phoneDigits(p.contact)}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { size: 16 }), p.contact]
						}) : p.contact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "break-words rounded-xl bg-[#f3ebdd] p-3 text-sm",
							children: p.contact
						}) : null,
						d.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							className: "flex min-h-11 min-w-0 items-center gap-2 break-all rounded-xl bg-[#f3ebdd] p-3 text-sm",
							href: `mailto:${d.email}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {
								size: 16,
								className: "shrink-0"
							}), d.email]
						}),
						publicSocialFields.map(([key, label]) => [label, d.socials[key] || (key === "instagram" ? d.instagram : key === "website" ? d.website : "")]).filter(([, url]) => url).map(([label, url]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							className: "button-light",
							href: url,
							target: "_blank",
							rel: "noopener noreferrer",
							children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 16 })]
						}, label))
					]
				})]
			})
		]
	});
}
//#endregion
export { BriefcaseBusiness as n, ProfessionalProfileView as t };
