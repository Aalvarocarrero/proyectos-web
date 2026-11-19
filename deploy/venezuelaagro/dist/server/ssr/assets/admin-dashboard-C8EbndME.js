import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as authFetch } from "./auth-fetch-BggIZaGf.js";
import { d as stringType, l as objectType, s as literalType } from "./types-Crhp_NNm.js";
import { h as listingPhotoUrl, m as hasStoredListingPhoto } from "./marketplace-details-BZOo_SaJ.js";
import { t as X } from "./x-BZ4-bwSC.js";
import { t as Button } from "./button-BFmHK2MX.js";
import { t as Check } from "./check-CA_GQtGG.js";
import { t as LoaderCircle } from "./loader-circle-Dm-wmt6M.js";
import "./project-publication-Cxu4iHly.js";
import { n as MarketplacePhoto, t as Store } from "./store-BqoxCqAA.js";
import { t as BookOpen } from "./book-open-DY5Z-kFy.js";
import { t as RefreshCw } from "./refresh-cw-DNHS5fKd.js";
import { t as Input } from "./input-uEflBXLT.js";
import { t as ProfessionalProfileView } from "./professional-profile-view-BIORBc2x.js";
import { t as CompanyProfileView } from "./company-profile-view-LFvXF2VN.js";
import { t as Textarea } from "./textarea-DymFaXc_.js";
/** Damaged legacy lists must not make an otherwise valid account snapshot fail. */
function parseStringListJson(value) {
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
	} catch {
		return [];
	}
}
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var labels = {
	farms: "Fincas",
	records: "Registros por módulo",
	marketplace: "Mercado",
	professionals: "Profesionales",
	projects: "Proyectos",
	companies: "Empresas",
	publicFarms: "Fichas públicas",
	posts: "Publicaciones",
	comments: "Comentarios propios",
	reactions: "Reacciones propias",
	orders: "Solicitudes",
	feedback: "Sugerencias"
};
var projectLabels = {
	title: "Nombre del proyecto",
	sector: "Rubro",
	state: "Estado",
	summary: "Objetivo del proyecto",
	has: "Recursos disponibles",
	needs: "Necesidades del proyecto",
	impact: "Aporte a la comunidad",
	requestedSupport: "Colaboración solicitada",
	contact: "Contacto privado",
	status: "Estado de revisión",
	publicationAuthorized: "Autorización pública"
};
function shownValue(key, value) {
	if (value == null || value === "") return "No indicado";
	if ((key === "has" || key === "needs") && Array.isArray(value)) return value.filter((item) => typeof item === "string").join("\n\n") || "No indicado";
	return typeof value === "object" ? JSON.stringify(value) : typeof value === "boolean" ? value ? "Sí" : "No" : String(value);
}
function AdminPersonDetail({ userId, demo = false }) {
	const [open, setOpen] = (0, import_react.useState)(false), [module, setModule] = (0, import_react.useState)("farms"), [detail, setDetail] = (0, import_react.useState)(null), [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
	async function load(next, page = 0) {
		setBusy(true);
		setError("");
		setDetail(null);
		try {
			const res = await authFetch(`/api/admin/people/${encodeURIComponent(userId)}?module=${next}&page=${page}`, { cache: "no-store" });
			if (!res.ok) throw new Error();
			setDetail(await res.json());
		} catch {
			setError("No se pudo consultar el detalle. Comprueba tu acceso y conexión.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "min-h-11 rounded-xl border px-3 text-sm font-semibold",
			onClick: () => {
				setOpen(!open);
				if (!open) load(module);
			},
			children: open ? "Cerrar detalle" : demo ? "Ver demostración con datos ficticios" : "Consultar registros de esta persona"
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 space-y-3 rounded-xl border bg-white p-3",
			children: [
				demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-bold text-amber-900",
					children: "DEMOSTRACIÓN: datos ficticios en memoria. No son usuarios ni registros reales."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs",
					children: "Consulta privada del administrador. Solo registros vinculados a esta cuenta. Los campos no admitidos, archivos, planos y datos de acceso no se muestran."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm",
					children: ["Área", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "mt-1 block min-h-11 max-w-full rounded border px-2",
						value: module,
						disabled: busy,
						onChange: (e) => {
							setModule(e.target.value);
							load(e.target.value);
						},
						children: Object.entries(labels).map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: key,
							children: label
						}, key))
					})]
				}),
				busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					children: "Consultando…"
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					children: error
				}),
				detail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "break-all text-sm",
						children: [
							detail.person.displayName,
							" · ",
							detail.person.email
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs",
						children: [
							"Página ",
							detail.page + 1,
							" · ",
							detail.rows.length,
							" registros. ",
							detail.hasMore ? "Hay más registros." : "No hay más registros en esta área."
						]
					}),
					!detail.rows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: "Sin registros asociados."
					}),
					detail.rows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "space-y-1 rounded border p-3 text-sm",
						children: Object.entries(row).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "break-words [overflow-wrap:anywhere]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "font-semibold",
								children: module === "projects" ? projectLabels[k] ?? k : k
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "whitespace-pre-wrap [overflow-wrap:anywhere]",
								children: shownValue(k, v)
							})]
						}, k))
					}, String(row.id ?? i))),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy || detail.page === 0,
							onClick: () => void load(module, detail.page - 1),
							className: "min-h-11 rounded border px-3 disabled:opacity-40",
							children: "Anterior"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy || !detail.hasMore,
							onClick: () => void load(module, detail.page + 1),
							className: "min-h-11 rounded border px-3 disabled:opacity-40",
							children: "Siguiente"
						})]
					})
				] })
			]
		})]
	});
}
var PREFIX = "VENEZUELA_AGRO_POST_V1:";
var bodySchema = objectType({
	version: literalType(1),
	text: stringType().min(3).max(500),
	listingId: stringType().regex(/^[a-zA-Z0-9_-]{3,160}$/).optional()
});
function readCommunityListingShare(body) {
	if (body.startsWith(PREFIX)) try {
		const result = bodySchema.safeParse(JSON.parse(body.slice(23)));
		if (result.success) return {
			text: result.data.text,
			...result.data.listingId ? { listingId: result.data.listingId } : {}
		};
	} catch {}
	return { text: body };
}
function describeOrder(order) {
	return [
		order.phone,
		order.email,
		order.channel === "business" ? "Cotización empresarial" : "Solicitud particular",
		...order.items.map((item) => [
			`${item.quantity} ${item.measure || "unidad"} · ${item.name}`,
			item.presentation,
			item.preparation,
			item.specifications
		].filter(Boolean).join(" · ")),
		order.business ? Object.values(order.business).filter(Boolean).join(" · ") : null,
		order.note
	].filter(Boolean).join("\n");
}
function AdminDashboard() {
	const [data, setData] = (0, import_react.useState)(null);
	const [people, setPeople] = (0, import_react.useState)(null);
	const [peopleBusy, setPeopleBusy] = (0, import_react.useState)(false);
	const [peopleError, setPeopleError] = (0, import_react.useState)("");
	async function loadPeople(page, demo = false) {
		setPeopleBusy(true);
		setPeopleError("");
		try {
			const res = await authFetch(`/api/admin/people?page=${page}${demo ? "&demo=1" : ""}`, { cache: "no-store" });
			if (!res.ok) throw new Error();
			setPeople(await res.json());
		} catch {
			setPeopleError("No se pudo consultar la lista. Intenta de nuevo.");
		} finally {
			setPeopleBusy(false);
		}
	}
	const [working, setWorking] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	async function load() {
		const response = await authFetch("/api/admin", { cache: "no-store" });
		if (response.ok) setData(await response.json());
	}
	(0, import_react.useEffect)(() => {
		let active = true;
		authFetch("/api/admin", { cache: "no-store" }).then(async (response) => {
			if (active && response.ok) setData(await response.json());
		});
		return () => {
			active = false;
		};
	}, []);
	async function update(entityType, id, status) {
		setWorking(id);
		const record = data ? [
			data.listings,
			data.orders,
			data.professionals,
			data.companies ?? [],
			data.projects,
			data.feedback,
			data.users,
			data.articles,
			data.publicFarms,
			data.socialPosts,
			data.socialComments
		].flat().find((row) => "id" in row && row.id === id || "slug" in row && row.slug === id) : void 0;
		const expectedVersion = record && ("revision" in record ? record.revision : "serverUpdatedAt" in record ? record.serverUpdatedAt : "updatedAt" in record ? record.updatedAt : void 0);
		const response = await authFetch("/api/admin", {
			method: "PATCH",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				entityType,
				id,
				status,
				expectedVersion
			})
		});
		if (response.ok) {
			setNotice("Cambio guardado.");
			await load();
		} else {
			const result = await response.json().catch(() => ({}));
			setNotice(result.error === "listing_photo_required" || result.error === "listing_photo_unavailable" ? "No se puede publicar: falta una fotografía disponible de la oferta. El registro se conserva." : "El contenido cambió o no se pudo guardar. Actualiza y revisa la versión completa antes de aprobar.");
			await load();
		}
		setWorking("");
	}
	async function saveArticle(event) {
		event.preventDefault();
		const form = event.currentTarget;
		const values = Object.fromEntries(new FormData(form).entries());
		setWorking("new-article");
		if ((await authFetch("/api/admin", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(values)
		})).ok) {
			form.reset();
			await load();
		}
		setWorking("");
	}
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-64 items-center justify-center gap-3 text-[#4c6b3a]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-bold",
			children: "Cargando operación…"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Usuarios registrados",
						value: data.peoplePage.total
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Publicaciones",
						value: data.listings.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Profesionales",
						value: data.professionals.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Proyectos agropecuarios",
						value: data.projects.length
					})
				]
			}),
			[
				[
					"public-farm",
					"Fincas públicas",
					data.publicFarms
				],
				[
					"social-post",
					"Publicaciones de la comunidad",
					data.socialPosts
				],
				[
					"social-comment",
					"Comentarios de la comunidad",
					data.socialComments
				]
			].map(([kind, title, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				id: kind,
				title,
				kicker: "COMUNIDAD",
				onRefresh: load,
				children: items?.length ? items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
					title: item.name || item.authorName || "Publicación",
					meta: item.body ? kind === "social-post" ? `${readCommunityListingShare(item.body).text}${readCommunityListingShare(item.body).listingId ? ` · Anuncio adjunto: ${readCommunityListingShare(item.body).listingId}` : ""}` : item.body : item.state || "Ficha pública",
					status: item.status,
					working: working === item.id,
					onAccept: () => update(kind, item.id, "active"),
					onReject: () => update(kind, item.id, "rejected")
				}), item.profileJson && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "m-4 rounded-xl bg-white p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer text-sm",
						children: "Revisar todos los datos públicos"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-4 whitespace-pre-wrap break-all text-xs",
						children: JSON.stringify(JSON.parse(item.profileJson), null, 2)
					})]
				})] }, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Sin solicitudes por revisar." })
			}, kind)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				id: "aprende",
				title: "Contenido de Aprende",
				kicker: "BIBLIOTECA EDITORIAL",
				onRefresh: load,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: saveArticle,
					className: "grid gap-4 border-b border-[#3e2a19]/8 bg-[#fbf8f2] p-5 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm font-semibold",
							children: ["Título", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "title",
								required: true,
								minLength: 5,
								className: "mt-2 bg-white",
								placeholder: "Título claro para el productor"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm font-semibold",
							children: ["Dirección SEO", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "slug",
								required: true,
								pattern: "[a-z0-9]+(?:-[a-z0-9]+)*",
								className: "mt-2 bg-white",
								placeholder: "ejemplo-guia-cacao"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm font-semibold",
							children: ["Categoría", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "category",
								required: true,
								className: "mt-2 bg-white",
								placeholder: "Ganadería, cultivos, gestión…"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-[6rem_1fr] gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm font-semibold",
								children: ["Emoji", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									name: "emoji",
									defaultValue: "🌿",
									className: "mt-2 bg-white"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm font-semibold",
								children: ["Lectura (min)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									name: "readMinutes",
									type: "number",
									min: "1",
									max: "60",
									defaultValue: "5",
									className: "mt-2 bg-white"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm font-semibold sm:col-span-2",
							children: ["Descripción para buscadores", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								name: "description",
								required: true,
								minLength: 20,
								className: "mt-2 bg-white",
								placeholder: "Resume qué aprenderá la persona."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm font-semibold sm:col-span-2",
							children: ["Título de la sección", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "sectionHeading",
								required: true,
								className: "mt-2 bg-white",
								placeholder: "Guía práctica"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm font-semibold sm:col-span-2",
							children: ["Contenido", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								name: "body",
								required: true,
								minLength: 80,
								className: "mt-2 min-h-48 bg-white",
								placeholder: "Escribe párrafos claros. Deja una línea vacía para separar cada párrafo."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm font-semibold",
							children: ["Palabras clave", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "keywords",
								className: "mt-2 bg-white",
								placeholder: "cacao Venezuela, manejo de cultivo…"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm font-semibold",
							children: ["Estado", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								name: "status",
								defaultValue: "draft",
								className: "mt-2 h-10 w-full rounded-md border bg-white px-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "draft",
									children: "Borrador"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "published",
									children: "Publicar"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: working === "new-article",
							className: "rounded-full bg-[#3e2a19] text-white sm:col-span-2 sm:w-fit",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {}), " Guardar artículo"]
						})
					]
				}), data.articles.length ? data.articles.map((article) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
					title: `${article.emoji} ${article.title}`,
					meta: `${article.category} · /aprende/${article.slug} · ${article.readMinutes} min`,
					status: article.status,
					working: working === article.slug,
					acceptLabel: "Publicar",
					rejectLabel: "Borrador",
					onAccept: () => update("article", article.slug, "published"),
					onReject: () => update("article", article.slug, "draft")
				}, article.slug)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Aún no hay artículos creados desde el panel." })]
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "rounded-xl bg-[#edf3e7] p-4 text-sm",
				children: notice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "my-5 rounded-xl border bg-white p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "cursor-pointer font-semibold",
					children: "Revisar datos completos enviados antes de aprobar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-all text-xs",
					children: JSON.stringify({
						publicaciones: data.listings,
						proyectos: data.projects
					}, null, 2)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				id: "mercado",
				title: "Publicaciones",
				kicker: "MERCADO AGRO",
				onRefresh: load,
				children: data.listings.length ? data.listings.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-5 mt-4 aspect-[4/3] max-w-sm overflow-hidden rounded-xl bg-[#e8dece]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplacePhoto, {
							src: listingPhotoUrl(item.imageKey),
							alt: `Fotografía enviada para ${item.title}`
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-5 mt-2 text-xs leading-6",
						children: "Comprueba que es una fotografía pertinente de la oferta antes de aprobar. Un icono o una imagen ajena no acredita el producto."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
						title: item.title,
						meta: `${item.sellerName} · ${item.category} · ${item.location}\n${"description" in item ? String(item.description) : ""}\n${item.contact || ""}`,
						status: item.status,
						working: working === item.id,
						acceptDisabled: !hasStoredListingPhoto(item.imageKey),
						onAccept: () => update("listing", item.id, "active"),
						onReject: () => update("listing", item.id, "rejected")
					})
				] }, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No hay publicaciones para revisar." })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				id: "empresas",
				title: "Empresas",
				kicker: "DIRECTORIO COMERCIAL",
				onRefresh: load,
				children: data.companies?.length ? data.companies.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
					title: item.name,
					meta: `${item.category} · ${item.state} · ${item.phone}`,
					status: item.status,
					working: working === item.id,
					onAccept: () => update("company", item.id, "active"),
					onReject: () => update("company", item.id, "rejected")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "m-5 rounded-xl border bg-white p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "min-h-11 cursor-pointer text-sm font-semibold",
						children: "Revisar ficha, imágenes y catálogo antes de publicar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanyProfileView, { company: item })]
				})] }, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No hay empresas para revisar." })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				id: "profesionales",
				title: "Profesionales",
				kicker: "DIRECTORIO",
				children: data.professionals.length ? data.professionals.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
					title: `${item.name} · ${item.profession}`,
					meta: `${item.specialties} · ${item.state} · ${item.contact}`,
					status: item.status,
					working: working === item.id,
					onAccept: () => update("professional", item.id, "active"),
					onReject: () => update("professional", item.id, "rejected")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "mb-5 min-w-0 rounded-xl border bg-white p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer text-sm font-semibold",
						children: "Revisar perfil completo antes de publicarlo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfessionalProfileView, { profile: item })
					})]
				})] }, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No hay perfiles profesionales." })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				id: "proyectos",
				title: "Proyectos agropecuarios",
				kicker: "APOYO Y COLABORACIÓN",
				children: data.projects.length ? data.projects.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
					title: item.title,
					meta: `${item.sector} · ${item.state}`,
					detail: [
						["Objetivo", item.summary],
						["Recursos disponibles", parseStringListJson(item.hasJson ?? "[]").join("\n\n")],
						["Necesidades del proyecto", parseStringListJson(item.needsJson ?? "[]").join("\n\n")],
						["Aporte a la comunidad", item.impact],
						["Colaboración solicitada", item.requestedSupport],
						["Contacto privado", item.contact]
					],
					status: item.status,
					working: working === item.id,
					acceptDisabled: !item.publicationAuthorized || !item.publicationAuthorizedAt || item.publicationConsentVersion !== "project-publication-2026-11-19",
					acceptLabel: item.publicationAuthorized ? "Aprobar" : "Sin autorización pública",
					onAccept: () => update("project", item.id, "active"),
					onReject: () => update("project", item.id, "rejected")
				}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No hay proyectos para revisar." })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				id: "ideas",
				title: "Ideas para mejorar Venezuela Agro",
				kicker: "MEJORAS DE LA PLATAFORMA",
				children: data.feedback.length ? data.feedback.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
					title: `${item.area} · ${item.role}`,
					meta: "Propuesta de mejora",
					detail: [["Propuesta completa", item.message], ["Contacto", item.contact ?? void 0]],
					status: item.status,
					working: working === item.id,
					acceptLabel: "Planificar",
					onAccept: () => update("feedback", item.id, "planned"),
					onReject: () => update("feedback", item.id, "closed")
				}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Todavía no hay sugerencias." })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				id: "solicitudes",
				title: "Solicitudes recibidas",
				kicker: "TIENDA",
				children: data.orders.length ? data.orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewRow, {
					title: order.customerName,
					meta: describeOrder(order),
					status: order.status,
					working: working === order.id,
					acceptLabel: "Contactada",
					rejectLabel: "Cerrar",
					onAccept: () => update("order", order.id, "contacted"),
					onReject: () => update("order", order.id, "closed")
				}, order.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Todavía no hay solicitudes." })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				id: "personas",
				title: "Personas registradas",
				kicker: "BASE DE USUARIOS",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://venezuelaagro.com/admin#personas",
							target: "_blank",
							rel: "noopener noreferrer",
							className: "underline",
							children: "Abrir panel real del propietario en Venezuela Agro"
						}),
						data.personDemoAvailable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: peopleBusy,
								onClick: () => void loadPeople(0, true),
								className: "min-h-11 rounded border px-3",
								children: "Ver 10 personas ficticias DEMO"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: peopleBusy,
								onClick: () => void loadPeople(0, false),
								className: "min-h-11 rounded border px-3",
								children: "Volver a cuentas de este entorno"
							})]
						}),
						(people ?? data.peoplePage).demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-amber-900",
							children: "DEMO aislada: 10 personas ficticias, 9 teléfonos simulados y 1 finca en total. No son datos reales ni se guardan en la base de datos."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							(people ?? data.peoplePage).total,
							" cuentas en total · Página ",
							(people ?? data.peoplePage).page + 1,
							" · ",
							(people ?? data.peoplePage).users.length,
							" en esta página."
						] }),
						peopleError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							children: peopleError
						}),
						peopleBusy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "status",
							children: "Consultando personas…"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: peopleBusy || (people ?? data.peoplePage).page === 0,
								onClick: () => void loadPeople((people ?? data.peoplePage).page - 1, (people ?? data.peoplePage).demo),
								className: "min-h-11 rounded border px-3 disabled:opacity-40",
								children: "Anterior"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: peopleBusy || !(people ?? data.peoplePage).hasMore,
								onClick: () => void loadPeople((people ?? data.peoplePage).page + 1, (people ?? data.peoplePage).demo),
								className: "min-h-11 rounded border px-3 disabled:opacity-40",
								children: "Siguiente"
							})]
						})
					]
				}), (people ?? data.peoplePage).users.length ? (people ?? data.peoplePage).users.map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 border-b border-[#3e2a19]/8 p-5 last:border-0 lg:grid-cols-[1fr_auto]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold",
							children: user.displayName || "Sin nombre visible"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-[#71685f]",
							children: user.email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-[#71685f]",
							children: ["Teléfono privado: ", user.phoneE164 || "No registrado"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPersonDetail, {
							userId: user.id,
							demo: (people ?? data.peoplePage).demo
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-semibold",
						children: ["Alta: ", new Date(user.createdAt).toLocaleDateString("es-VE")]
					})]
				}, user.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No hay usuarios registrados." })]
			})
		]
	});
}
function Metric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-[#211d1a] p-5 text-white",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-3xl font-bold",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-white/75",
			children: label
		})]
	});
}
function Section({ id, title, kicker, children, onRefresh }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id,
		"aria-labelledby": `${id}-title`,
		className: "min-w-0 scroll-mt-56 sm:scroll-mt-44",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "section-kicker",
				children: kicker
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: `${id}-title`,
				className: "font-display mt-2 text-3xl sm:text-4xl",
				children: title
			})] }), onRefresh && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => void onRefresh(),
				variant: "outline",
				className: "rounded-full bg-white",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {}), "Actualizar"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 overflow-hidden rounded-[1.6rem] border border-[#3e2a19]/8 bg-white",
			children
		})]
	});
}
function ReviewRow({ title, meta, detail, status, working, onAccept, onReject, acceptDisabled = false, acceptLabel = "Aprobar", rejectLabel = "Rechazar" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 border-b border-[#3e2a19]/8 p-5 last:border-0 lg:grid-cols-[1fr_auto_auto] lg:items-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-[#71685f]",
					children: meta
				}),
				detail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "mt-2 min-w-0 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer font-semibold",
						children: "Leer el envío completo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "mt-2 space-y-3",
						children: detail.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "font-semibold",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "whitespace-pre-wrap [overflow-wrap:anywhere]",
							children: value || "No indicado"
						})] }, label))
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-fit rounded-full bg-[#f3ebdd] px-3 py-1 text-xs font-bold",
				children: status
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: working || acceptDisabled,
					onClick: onAccept,
					size: "sm",
					className: "rounded-full bg-[#4c6b3a] text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}), acceptLabel]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: working,
					onClick: onReject,
					size: "sm",
					variant: "outline",
					className: "rounded-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {}), rejectLabel]
				})]
			})
		]
	});
}
function Empty({ text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-12 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "mx-auto text-[#b4aa9e]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-[#71685f]",
			children: text
		})]
	});
}
export { AdminDashboard };
