import { n as require_jsx_runtime } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-ZIVktEBq.js";
import { t as PriceConversion } from "./price-conversion-RjpQe0IX.js";
import { t as QuoteConversion } from "./quote-conversion-Bk1UoxEX.js";
import { t as ContextualWhatsAppContact } from "./contextual-whatsapp-contact-CuE8E_7S.js";
import { t as ImageShareButton } from "./image-share-OFqHbnpR.js";
import { n as companyProductImageContent, t as companyImageContent } from "./public-image-content-8oZuiwD9.js";
import { n as Globe, t as ProfileSocials } from "./profile-socials-CNv5AvhP.js";
import { t as MapPin } from "./map-pin-CLoB_NAM.js";
import { t as Phone } from "./phone-CjU-4AYr.js";
import { t as Mail } from "./mail-BCfpLZJj.js";
import { t as Link } from "./link-CTsUsqTe.js";
import { t as Building2 } from "./building-2-BNaf1wUO.js";
import { t as Clock3 } from "./clock-3-DiuBC-BJ.js";
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Truck = createLucideIcon("truck", [
	["path", {
		d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",
		key: "wrbu53"
	}],
	["path", {
		d: "M15 18H9",
		key: "1lyqi6"
	}],
	["path", {
		d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
		key: "lysw3i"
	}],
	["circle", {
		cx: "17",
		cy: "18",
		r: "2",
		key: "332jqn"
	}],
	["circle", {
		cx: "7",
		cy: "18",
		r: "2",
		key: "19iecd"
	}]
]);
//#endregion
//#region components/company-profile-view.tsx
var import_jsx_runtime = require_jsx_runtime();
function CompanyProfileView({ company: c }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 [overflow-wrap:anywhere]",
		children: [
			c.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "mb-7 rounded-2xl border border-[#9db689] bg-[#edf3e7] p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold tracking-wide text-[#365026]",
					children: "EMPRESA FICTICIA · DEMOSTRACIÓN"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-7 text-[#5f574f]",
					children: "Esta ficha enseña cómo se vería una empresa registrada. El nombre, los horarios y el catálogo son ejemplos. No hay local real, reservas, ventas ni datos de contacto activos."
				})]
			}),
			c.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
				className: "mb-8 overflow-hidden rounded-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/company-examples/veterinaria-ejemplo-local.webp",
					width: 1536,
					height: 1024,
					alt: "Ilustración fotográfica generada con IA de un local veterinario ficticio con estantes de alimentos y accesorios",
					className: "aspect-[16/9] w-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
					className: "bg-[#f3ebdd] px-4 py-3 text-xs leading-6 text-[#71685f]",
					children: "Local de muestra creado con IA. No representa un establecimiento real."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-5 sm:flex-row sm:items-center",
				children: [c.logoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: c.logoUrl,
					alt: `Logo de ${c.name}`,
					width: 104,
					height: 104,
					className: "size-26 rounded-2xl border object-contain p-2"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-26 items-center justify-center rounded-2xl bg-[#e8efdf] text-[#47623b]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { size: 44 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: c.category
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-3 text-4xl sm:text-5xl",
						children: c.name
					}),
					c.legalName && c.legalName !== c.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-[#71685f]",
						children: c.legalName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm",
						children: [c.municipality ? `${c.municipality}, ` : "", c.state]
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid items-start gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextualWhatsAppContact, {
					context: `${c.name} · ${c.category}`,
					phone: c.phone,
					enabled: c.whatsapp,
					demo: c.demo
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm font-semibold",
						children: "Redes y sitio web"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSocials, {
						socials: {
							website: c.website,
							instagram: c.instagram,
							facebook: c.facebook
						},
						demo: c.demo
					}),
					!c.demo && !c.website && !c.instagram && !c.facebook && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-6 text-[#71685f]",
						children: "La empresa todavía no ha publicado sus redes."
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageShareButton, {
				content: companyImageContent(c),
				label: "Compartir empresa en imagen",
				className: "button-light mt-6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-7 whitespace-pre-line text-base leading-8 text-[#5f574f]",
				children: c.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-4 sm:grid-cols-2",
				children: [
					[
						MapPin,
						"Dónde estamos",
						[
							c.address,
							c.municipality,
							c.state
						].filter(Boolean).join(", ")
					],
					[
						Clock3,
						"Horario de atención",
						c.hours || "Consulta el horario directamente con la empresa"
					],
					[
						Truck,
						"Entrega y atención",
						[c.serviceMode, c.delivery].filter(Boolean).join(" · ")
					],
					[
						Globe,
						"Zona de cobertura",
						c.coverageStates.length ? c.coverageStates.join(", ") : c.state
					]
				].map(([Icon, title, value]) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-[#f3ebdd] p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								size: 19,
								className: "text-[#4c6b3a]"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 text-sm font-bold",
								children: String(title)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 whitespace-pre-line text-sm leading-6 text-[#71685f]",
								children: String(value)
							})
						]
					}, String(title));
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-9",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl",
						children: "Hablemos de lo que necesitas."
					}),
					c.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-2xl border border-dashed bg-[#f8f5ef] p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-7",
							children: "En una ficha real aparecerían aquí el teléfono comercial, WhatsApp, correo y redes que la empresa decida publicar."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: true,
								className: "min-h-11 rounded-full border px-5 text-sm opacity-60",
								children: "Llamar · ejemplo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: true,
								className: "min-h-11 rounded-full border px-5 text-sm opacity-60",
								children: "Correo · ejemplo"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap gap-3",
						children: [!c.demo && c.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `tel:${c.phone.replace(/[^+\d]/g, "")}`,
							className: "button-dark",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { size: 16 }), " Llamar a la empresa"]
						}), !c.demo && c.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `mailto:${c.email}`,
							className: "inline-flex min-h-12 items-center gap-2 rounded-full border px-5 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { size: 16 }), "Correo"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs leading-6 text-[#71685f]",
						children: c.demo ? "Todos los contactos están desactivados en esta demostración." : "Datos declarados por la empresa. La revisión del perfil no certifica licencias, productos ni solvencia. Confirma disponibilidad y condiciones directamente."
					})
				]
			}),
			c.galleryUrls.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl",
						children: c.demo ? "Un vistazo al local y sus productos." : "Conoce nuestro espacio."
					}),
					c.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-6 text-[#71685f]",
						children: "Galería ilustrativa: local y accesorios de muestra generados con IA."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3",
						children: c.galleryUrls.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src,
							width: 640,
							height: 480,
							loading: "lazy",
							alt: c.demo ? `Ilustración generada con IA del local veterinario ficticio, imagen ${i + 1}` : `Instalaciones o trabajo de ${c.name}, fotografía ${i + 1}`,
							className: "aspect-[4/3] w-full rounded-2xl object-cover"
						}, src))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 border-t pt-9",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "CATÁLOGO DE LA EMPRESA"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display mt-3 text-3xl",
							children: "Productos para seguir produciendo."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							href: "/marketplace",
							className: "min-h-11 py-3 text-sm font-semibold text-[#4c6b3a] underline",
							children: "Explorar Mercado Agro"
						})]
					}),
					c.productsSummary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm leading-7",
						children: c.productsSummary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-6 text-[#71685f]",
						children: "Catálogo informativo, sin cobros en la plataforma. No se admiten medicamentos regulados ni productos restringidos."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid gap-4 sm:grid-cols-2",
						children: c.products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							id: `producto-${p.id}`,
							className: "scroll-mt-28 overflow-hidden rounded-2xl border",
							children: [p.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: p.imageUrl,
								alt: p.name,
								width: 640,
								height: 480,
								loading: "lazy",
								className: "aspect-[4/3] w-full object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-5",
								children: [
									c.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-3 text-xs leading-6 text-[#71685f]",
										children: p.id === "demo-alimento" ? "Fotografía contextual de alimento bovino; no representa inventario." : "Imagen ilustrativa creada con IA; producto de muestra."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-[#71685f]",
										children: [
											p.category,
											" · ",
											c.demo ? "Muestra ficticia" : p.availability
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-2 text-lg font-bold",
										children: p.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-6 text-[#71685f]",
										children: p.description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-4 font-semibold",
										children: [c.demo ? "Producto de ejemplo · sin venta" : p.priceCents === null ? "Consultar precio" : `${(p.priceCents / 100).toLocaleString("es-VE", { minimumFractionDigits: 2 })} ${p.currency}`, p.unit && !c.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs font-normal",
											children: [" / ", p.unit]
										})]
									}),
									!c.demo && p.priceCents !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceConversion, {
										amount: p.priceCents / 100,
										currency: p.currency,
										unit: p.unit
									}),
									" ",
									(c.demo || p.priceCents === null) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteConversion, {
										context: `${p.name} · ${c.name}`,
										demo: c.demo
									}),
									" ",
									!c.demo && p.marketplaceId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										href: `/marketplace/${p.marketplaceId}`,
										className: "mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#4c6b3a] underline",
										children: "Ver publicación en Mercado Agro ↗"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextualWhatsAppContact, {
										context: `${p.name} · ${c.name}`,
										phone: c.phone,
										enabled: c.whatsapp,
										demo: c.demo,
										className: "mt-4"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageShareButton, {
										content: companyProductImageContent(c, p),
										className: "button-light mt-4 w-full"
									})
								]
							})]
						}, p.id))
					}),
					!c.products.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 rounded-xl bg-[#f3ebdd] p-5 text-sm",
						children: "La empresa aún no ha añadido productos a su catálogo."
					})
				]
			}),
			c.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-xs leading-6 text-[#71685f]",
				children: [
					"Fotografía del alimento bovino: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "https://commons.wikimedia.org/wiki/File:A_view_of_cattle_feed.JPG",
						target: "_blank",
						rel: "noreferrer",
						className: "underline",
						children: "Thamizhpparithi Maari"
					}),
					", ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "https://creativecommons.org/licenses/by-sa/3.0/",
						target: "_blank",
						rel: "noreferrer",
						className: "underline",
						children: "CC BY-SA 3.0"
					}),
					". Reducción y conversión a WebP. El local y los otros accesorios son imágenes generadas con IA para esta demostración."
				]
			}),
			c.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 rounded-2xl bg-[#e8efdf] p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "AHORA PUEDES CREAR LA TUYA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mt-3 text-3xl",
						children: "Una ficha clara, en tres pasos."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-5 list-decimal space-y-3 pl-5 text-sm leading-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Entra con tu cuenta y registra la identidad, ubicación y contacto comercial de tu empresa." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Añade tu logo, fotografías propias y productos de uso general. Guarda un borrador si necesitas continuar después." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Envía la ficha a revisión. Desde tu panel podrás actualizar tus datos y catálogo cuando lo necesites." })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						href: "/empresas/registro",
						className: "button-dark mt-6",
						children: "Crear la ficha de mi empresa"
					})
				]
			})
		]
	});
}
//#endregion
export { CompanyProfileView as t };
