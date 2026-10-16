import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { t as authFetch } from "./auth-fetch-BggIZaGf.js";
import { o as currencies, s as currencyLabels } from "./exchange-rates-Dh445WGD.js";
import { t as venezuelanStates } from "./venezuela-Cj1crq10.js";
import { t as createLucideIcon } from "./createLucideIcon-ZIVktEBq.js";
import { i as DialogDescription, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BB9AB3vt.js";
import { t as LoaderCircle } from "./loader-circle-Be8OWdZ5.js";
import { t as RefreshCw } from "./refresh-cw-oXiIaqnM.js";
import { t as PriceConversion } from "./price-conversion-RjpQe0IX.js";
import { t as Link } from "./link-CTsUsqTe.js";
import { t as Building2 } from "./building-2-BNaf1wUO.js";
import { t as CompanyProfileView } from "./company-profile-view-CTX6rQso.js";
import { n as PublicFormGuide, t as FormFeedback } from "./form-feedback-C28cLJou.js";
import { i as companyServiceModes, n as companyProductCategories, r as companySchema, t as companyCategories } from "./company-D3GlpNfY.js";
import { t as Plus } from "./plus-D6_6wvlQ.js";
//#region ../venezuela-agro-auth/node_modules/lucide-react/dist/esm/icons/save.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Save = createLucideIcon("save", [
	["path", {
		d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
		key: "1c8476"
	}],
	["path", {
		d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",
		key: "1ydtos"
	}],
	["path", {
		d: "M7 3v4a1 1 0 0 0 1 1h7",
		key: "t51u73"
	}]
]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ImagePlus = createLucideIcon("image-plus", [
	["path", {
		d: "M16 5h6",
		key: "1vod17"
	}],
	["path", {
		d: "M19 2v6",
		key: "4bpg5p"
	}],
	["path", {
		d: "M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5",
		key: "1ue2ih"
	}],
	["path", {
		d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",
		key: "1xmnt7"
	}],
	["circle", {
		cx: "9",
		cy: "9",
		r: "2",
		key: "af1f0g"
	}]
]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Package = createLucideIcon("package", [
	["path", {
		d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
		key: "1a0edw"
	}],
	["path", {
		d: "M12 22V12",
		key: "d0xqtd"
	}],
	["polyline", {
		points: "3.29 7 12 12 20.71 7",
		key: "ousv84"
	}],
	["path", {
		d: "m7.5 4.27 9 5.15",
		key: "1c824w"
	}]
]);
//#endregion
//#region components/company-manager.tsx
var import_jsx_runtime = require_jsx_runtime();
var input = "mt-2 min-h-12 w-full rounded-xl border border-[#3e2a19]/15 bg-white px-3 py-2 text-sm";
var label = "text-sm font-semibold";
function Field({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: label,
		children: [title, children]
	});
}
async function optimizePhoto(file) {
	if (![
		"image/jpeg",
		"image/png",
		"image/webp"
	].includes(file.type) || file.size > 12e6) throw new Error("Elige una imagen JPG, PNG o WebP de hasta 12 MB.");
	const url = URL.createObjectURL(file);
	try {
		const image = await new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(/* @__PURE__ */ new Error("No pudimos abrir esa imagen."));
			img.src = url;
		});
		if (image.naturalWidth * image.naturalHeight > 8e7) throw new Error("La imagen es demasiado grande. Reduce su resolución.");
		const scale = Math.min(1, 960 / Math.max(image.naturalWidth, image.naturalHeight));
		const canvas = document.createElement("canvas");
		canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
		canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("No pudimos optimizar la imagen.");
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		let quality = .82, data = "";
		do {
			data = canvas.toDataURL("image/webp", quality);
			quality -= .1;
		} while (data.length > 65e4 && quality > .3);
		if (data.length > 65e4) throw new Error("La imagen sigue siendo muy pesada. Prueba con otra.");
		return data;
	} finally {
		URL.revokeObjectURL(url);
	}
}
function CompanyManager({ userId }) {
	const [rows, setRows] = (0, import_react.useState)([]), [loading, setLoading] = (0, import_react.useState)(true), [error, setError] = (0, import_react.useState)(""), [notice, setNotice] = (0, import_react.useState)(""), [editing, setEditing] = (0, import_react.useState)(void 0), [preview, setPreview] = (0, import_react.useState)(null), [working, setWorking] = (0, import_react.useState)(false);
	const editorStatus = (0, import_react.useRef)({
		dirty: false,
		busy: false
	}), editorSelection = (0, import_react.useRef)(void 0), editorEpoch = (0, import_react.useRef)(0), managementLock = (0, import_react.useRef)(false);
	const [editorBusy, setEditorBusy] = (0, import_react.useState)(false);
	const generation = editorEpoch.current;
	function reportEditorState(state) {
		if (generation !== editorEpoch.current) return;
		editorStatus.current = state;
		setEditorBusy(state.busy);
	}
	function changeEditor(next) {
		if (managementLock.current || editorStatus.current.busy) return;
		const current = editorSelection.current;
		if (current === next || current && next && current.id === next.id) return;
		if (current !== void 0 && editorStatus.current.dirty && !window.confirm("Tienes cambios sin enviar. ¿Salir de este formulario y descartarlos? Si guardaste un borrador, podrás recuperarlo en esta pestaña.")) return;
		editorEpoch.current++;
		editorSelection.current = next;
		editorStatus.current = {
			dirty: false,
			busy: false
		};
		setEditorBusy(false);
		setEditing(next);
		setNotice("");
	}
	async function load() {
		setError("");
		setLoading(true);
		try {
			const response = await authFetch("/api/companies?mine=1", {
				cache: "no-store",
				headers: { "x-local-owner": userId }
			});
			if (!response.ok) throw new Error(response.status === 401 ? "Tu sesión ha terminado. Vuelve a iniciar sesión para ver tus empresas." : "No pudimos cargar tus empresas. Puedes reintentar.");
			setRows((await response.json()).companies);
		} catch (e) {
			setError(e instanceof Error ? e.message : "No hay conexión.");
		} finally {
			setLoading(false);
		}
	}
	(0, import_react.useEffect)(() => {
		let active = true;
		authFetch("/api/companies?mine=1", {
			cache: "no-store",
			headers: { "x-local-owner": userId }
		}).then(async (r) => {
			if (!r.ok) throw new Error("No pudimos cargar tus empresas. Reintenta o inicia sesión otra vez.");
			const result = await r.json();
			if (active) setRows(result.companies);
		}).catch((e) => {
			if (active) setError(e instanceof Error ? e.message : "No hay conexión.");
		}).finally(() => {
			if (active) setLoading(false);
		});
		return () => {
			active = false;
		};
	}, [userId]);
	async function withdraw(c) {
		if (managementLock.current || editorStatus.current.busy) return;
		if (!window.confirm(`¿Retirar ${c.name} del directorio? La ficha dejará de estar disponible en el directorio y en este panel.`)) return;
		managementLock.current = true;
		setWorking(true);
		try {
			if (!(await authFetch("/api/companies", {
				method: "DELETE",
				headers: {
					"content-type": "application/json",
					"x-local-owner": userId
				},
				body: JSON.stringify({
					id: c.id,
					expectedRevision: c.revision
				})
			})).ok) throw new Error("No se pudo retirar. Actualiza el panel y vuelve a intentarlo.");
			setNotice("Empresa retirada del directorio.");
			await load();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Error de conexión.");
		} finally {
			managementLock.current = false;
			setWorking(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Mis empresas"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-sm leading-7 text-[#71685f]",
				children: "Administra tus datos y catálogo. Cada solicitud y cada cambio pasan por revisión antes de verse en el directorio. Solo tú puedes editar tus empresas."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "button-dark",
				disabled: working || editorBusy,
				onClick: () => changeEditor(null),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 17 }), "Añadir empresa"]
			})]
		}),
		notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			className: "mt-5 rounded-xl bg-[#e8efdf] p-4 text-sm",
			children: notice
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "alert",
			className: "mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm",
			children: [
				error,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "ml-3 min-h-11 underline",
					onClick: () => {
						setError("");
						load();
					},
					children: "Reintentar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/signin-with-chatgpt?return_to=%2Fempresas%2Fregistro",
					target: "_top",
					className: "ml-3 min-h-11 underline",
					children: "Iniciar sesión"
				})
			]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			role: "status",
			className: "flex items-center gap-2 py-8 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "animate-spin",
				size: 18
			}), "Cargando empresas…"]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 sm:grid-cols-2",
			children: [rows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-2xl border bg-white p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, {
							size: 23,
							className: "text-[#4c6b3a]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-[#f3ebdd] px-3 py-1 text-xs",
							children: {
								pending: "En revisión",
								active: "Publicada",
								rejected: "Requiere cambios",
								deleted: "Retirada"
							}[c.status] || c.status
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-4 text-xl font-bold",
						children: c.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-[#71685f]",
						children: [
							c.category,
							" · ",
							c.state
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs",
						children: [c.products.length, " productos"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: working || editorBusy,
								className: "min-h-11 text-sm font-semibold underline",
								onClick: () => changeEditor(c),
								children: "Editar datos y catálogo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "min-h-11 text-sm underline",
								onClick: () => setPreview(c),
								children: "Vista previa"
							}),
							c.status === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								href: `/empresas/${c.id}`,
								className: "min-h-11 py-3 text-sm underline",
								children: "Ver ficha"
							}),
							c.status !== "deleted" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: working || editorBusy,
								className: "min-h-11 text-sm underline",
								onClick: () => void withdraw(c),
								children: "Retirar"
							})
						]
					})
				]
			}, c.id)), !error && !rows.length && editing === void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl border border-dashed p-6 text-sm leading-7 sm:col-span-2",
				children: "Todavía no has registrado una empresa. Empieza con su identidad, ubicación y contacto; puedes ampliar el catálogo después."
			})]
		}),
		editing !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 rounded-[1.6rem] border bg-[#ede5d6] p-5 sm:p-7",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: editing ? "Editar empresa" : "Nueva empresa"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 text-sm underline",
					disabled: working || editorBusy,
					onClick: () => changeEditor(void 0),
					children: "Cerrar formulario"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanyForm, {
				userId,
				company: editing,
				onDraftStateChange: reportEditorState,
				onSaved: async () => {
					if (generation !== editorEpoch.current) return;
					editorEpoch.current++;
					editorSelection.current = void 0;
					editorStatus.current = {
						dirty: false,
						busy: false
					};
					setEditorBusy(false);
					setEditing(void 0);
					setNotice("Solicitud guardada y enviada a revisión. Aún no está publicada.");
					await load();
				}
			}, editing?.id || "new")]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: !!preview,
			onOpenChange: (open) => {
				if (!open) setPreview(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-h-[90dvh] overflow-y-auto bg-white p-5 sm:max-w-4xl sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "sr-only",
						children: ["Vista previa de ", preview?.name]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "mb-4",
						children: "Vista previa de tu solicitud. Esto no publica la ficha."
					}),
					preview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanyProfileView, { company: preview })
				]
			})
		})
	] });
}
function CompanyForm({ company, userId, onSaved, onDraftStateChange }) {
	const [products, setProducts] = (0, import_react.useState)(company?.products || []), [logo, setLogo] = (0, import_react.useState)(""), [logoKey, setLogoKey] = (0, import_react.useState)(company?.logoKey || ""), [gallery, setGallery] = (0, import_react.useState)([]), [galleryKeys, setGalleryKeys] = (0, import_react.useState)(company?.galleryKeys || []), [processing, setProcessing] = (0, import_react.useState)(false), [saving, setSaving] = (0, import_react.useState)(false), [message, setMessage] = (0, import_react.useState)(""), [restore, setRestore] = (0, import_react.useState)(null), [formKey, setFormKey] = (0, import_react.useState)(0);
	const submitLock = (0, import_react.useRef)(false), processingLock = (0, import_react.useRef)(false), dirty = (0, import_react.useRef)(false);
	function reportDraftState() {
		onDraftStateChange?.({
			dirty: dirty.current,
			busy: submitLock.current || processingLock.current
		});
	}
	function markDirty(event) {
		if (event && event.target instanceof Element && event.target.closest("[data-price-conversion]")) return;
		dirty.current = true;
		reportDraftState();
	}
	const [tone, setTone] = (0, import_react.useState)("info");
	const draftKey = `venezuela-agro-company-draft:${userId}:${company?.id || "new"}`;
	const value = (key) => String(restore?.[key] ?? company?.[key] ?? "");
	async function photo(file, target) {
		if (!file || submitLock.current || processingLock.current) return;
		processingLock.current = true;
		setProcessing(true);
		reportDraftState();
		setTone("info");
		setMessage("");
		try {
			const data = await optimizePhoto(file);
			if (target === "logo") setLogo(data);
			else if (target === "gallery") setGallery((v) => [...v, data]);
			else setProducts((v) => v.map((p, i) => i === target ? {
				...p,
				imageDataUrl: data
			} : p));
			markDirty();
			setMessage("Imagen optimizada y lista para guardar.");
		} catch (e) {
			setTone("error");
			setMessage(e instanceof Error ? e.message : "No pudimos procesar la imagen.");
		} finally {
			processingLock.current = false;
			setProcessing(false);
			reportDraftState();
		}
	}
	function collect(form) {
		const f = new FormData(form), text = (key) => String(f.get(key) || "").trim();
		return {
			name: text("name"),
			legalName: text("legalName"),
			category: text("category"),
			description: text("description"),
			productsSummary: text("productsSummary"),
			state: text("state"),
			municipality: text("municipality"),
			address: text("address"),
			coverageStates: f.getAll("coverageStates"),
			contactName: text("contactName"),
			phone: text("phone"),
			email: text("email"),
			website: text("website"),
			instagram: text("instagram"),
			facebook: text("facebook"),
			whatsapp: f.get("whatsapp") === "on",
			serviceMode: text("serviceMode"),
			hours: text("hours"),
			delivery: text("delivery"),
			logoKey: logoKey || void 0,
			galleryKeys,
			logoDataUrl: logo || void 0,
			galleryDataUrls: gallery,
			products
		};
	}
	function saveDraft(form) {
		setTone("info");
		try {
			sessionStorage.setItem(draftKey, JSON.stringify(collect(form)));
			setMessage("Borrador guardado solo en esta pestaña y para tu cuenta. No se ha enviado ni publicado.");
			return true;
		} catch {
			setTone("error");
			setMessage("No pudimos guardar el borrador en este navegador. Mantén la pestaña abierta.");
			return false;
		}
	}
	function restoreDraft() {
		setTone("info");
		try {
			const raw = sessionStorage.getItem(draftKey);
			if (!raw) {
				setMessage("No hay un borrador guardado en esta pestaña.");
				return;
			}
			const d = JSON.parse(raw);
			markDirty();
			setRestore(d);
			setProducts(d.products || []);
			setLogo(d.logoDataUrl || "");
			setLogoKey(d.logoKey || "");
			setGallery(d.galleryDataUrls || []);
			setGalleryKeys(d.galleryKeys || []);
			setFormKey((k) => k + 1);
			setMessage("Borrador recuperado. Revísalo antes de enviar.");
		} catch {
			setMessage("No pudimos recuperar el borrador.");
			setTone("error");
		}
	}
	async function submit(event) {
		event.preventDefault();
		if (submitLock.current || processingLock.current) return;
		submitLock.current = true;
		reportDraftState();
		const form = event.currentTarget;
		const draftSaved = saveDraft(form);
		const validation = companySchema.safeParse(collect(form));
		if (!validation.success) {
			const issue = validation.error.issues[0];
			const field = {
				name: "nombre",
				description: "descripción (mínimo 30 caracteres)",
				phone: "teléfono con código de país",
				state: "estado",
				category: "rubro",
				email: "correo",
				website: "sitio web",
				instagram: "Instagram",
				facebook: "Facebook",
				unit: "unidad",
				marketplaceId: "ID de la publicación",
				priceCents: "precio"
			}[String(issue.path.at(-1))] || "datos e imágenes";
			const section = issue.path[0] === "products" ? `producto ${Number(issue.path[1]) + 1}: ` : "";
			setTone("error");
			setMessage(`Revisa ${section}${field}. ${issue.code === "custom" ? issue.message : "Comprueba el formato y completa los campos obligatorios."} Tus datos siguen en el formulario.`);
			submitLock.current = false;
			reportDraftState();
			return;
		}
		setSaving(true);
		setMessage("");
		try {
			const r = await authFetch("/api/companies", {
				method: company ? "PATCH" : "POST",
				headers: {
					"content-type": "application/json",
					"x-local-owner": userId
				},
				body: JSON.stringify({
					...collect(form),
					...company ? {
						id: company.id,
						expectedRevision: company.revision
					} : {}
				})
			});
			const result = await r.json().catch(() => ({}));
			if (!r.ok) {
				const explanation = r.status === 401 ? draftSaved ? "Tu sesión ha terminado. El borrador está guardado en esta pestaña. Inicia sesión y recupéralo." : "Tu sesión ha terminado. No se pudo guardar una copia local. Mantén este formulario abierto y copia tus datos antes de iniciar sesión." : r.status === 409 && result.error === "local_owner_mismatch" ? "La cuenta abierta cambió. Inicia sesión con la cuenta original antes de recuperar este borrador." : r.status === 409 ? "La empresa cambió desde que abriste el formulario. Cierra y vuelve a editar la versión actual antes de combinar tus cambios." : r.status === 403 ? "Completa primero la verificación y los permisos de publicación en el centro de seguridad." : result.error === "company_marketplace_link_unavailable" ? "El enlace de Mercado Agro debe ser una publicación activa, permitida y de tu cuenta." : result.error === "invalid_company" ? "Revisa los campos obligatorios, las longitudes y los productos. No se admiten medicamentos ni productos regulados." : result.error === "company_request_too_large" ? "El conjunto de imágenes es demasiado grande. Retira alguna imagen y vuelve a enviar." : draftSaved ? "No pudimos guardar la solicitud. Tus cambios están guardados como borrador; reintenta en unos momentos." : "No pudimos guardar la solicitud ni una copia local. Tus datos siguen en este formulario; mantén la pestaña abierta y reintenta.";
				throw new Error(explanation);
			}
			try {
				sessionStorage.removeItem(draftKey);
			} catch {}
			dirty.current = false;
			await onSaved();
		} catch (e) {
			setTone("error");
			setMessage(e instanceof Error ? e.message : "Se interrumpió la conexión. Tu borrador permanece en esta pestaña. Reintenta cuando vuelva.");
		} finally {
			submitLock.current = false;
			setSaving(false);
			reportDraftState();
		}
	}
	const updateProduct = (index, change) => {
		markDirty();
		setProducts((v) => v.map((p, i) => i === index ? {
			...p,
			...change
		} : p));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onChangeCapture: markDirty,
		onSubmit: submit,
		"aria-busy": saving || processing,
		className: "space-y-7",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicFormGuide, { local: false }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				disabled: saving || processing,
				className: "min-w-0 space-y-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-7 text-[#71685f]",
						children: "Los campos con * son obligatorios. Incluye únicamente información comercial que quieras mostrar públicamente. No añadas documentos de identidad ni datos de pago."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: (e) => saveDraft(e.currentTarget.form),
							className: "inline-flex min-h-11 items-center gap-2 text-sm underline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 16 }), "Guardar borrador"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: restoreDraft,
							className: "inline-flex min-h-11 items-center gap-2 text-sm underline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 16 }), "Recuperar borrador"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "rounded-2xl bg-white/60 p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "px-2 font-bold",
							children: "1. Identidad de la empresa"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: "Nombre comercial *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "name",
										required: true,
										minLength: 3,
										maxLength: 140,
										defaultValue: value("name"),
										className: input
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: "Razón social (opcional)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "legalName",
										maxLength: 180,
										defaultValue: value("legalName"),
										className: input
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: "Rubro principal *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										name: "category",
										required: true,
										defaultValue: value("category"),
										className: input,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Selecciona un rubro"
										}), companyCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: "Modalidad de atención",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										name: "serviceMode",
										defaultValue: value("serviceMode") || companyServiceModes[0],
										className: input,
										children: companyServiceModes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: `${label} sm:col-span-2`,
									children: ["Descripción de la empresa *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										name: "description",
										required: true,
										minLength: 30,
										maxLength: 2400,
										defaultValue: value("description"),
										className: `${input} min-h-32`,
										placeholder: "Qué ofrece tu empresa, a quién atiende y qué la distingue."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: `${label} sm:col-span-2`,
									children: ["Resumen de productos y servicios", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										name: "productsSummary",
										maxLength: 800,
										defaultValue: value("productsSummary"),
										className: `${input} min-h-24`
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "rounded-2xl bg-white/60 p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "px-2 font-bold",
							children: "2. Ubicación, horarios y contacto"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: "Estado *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										name: "state",
										required: true,
										defaultValue: value("state"),
										className: input,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Selecciona un estado"
										}), venezuelanStates.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: "Municipio o localidad *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "municipality",
										required: true,
										maxLength: 100,
										defaultValue: value("municipality"),
										className: input
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: `${label} sm:col-span-2`,
									children: ["Dirección comercial", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "address",
										maxLength: 300,
										defaultValue: value("address"),
										className: input,
										placeholder: "Dirección de atención al público, sin datos privados del responsable"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: "Horario de atención",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										name: "hours",
										maxLength: 400,
										defaultValue: value("hours"),
										className: input,
										placeholder: "Lun–vie 8:00 a. m.–5:00 p. m.; sáb 8:00 a. m.–12:00 m."
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: "Entregas y recogida",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										name: "delivery",
										maxLength: 600,
										defaultValue: value("delivery"),
										className: input,
										placeholder: "Zonas de entrega, retiro en tienda y condiciones"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: "Persona de contacto comercial",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "contactName",
										maxLength: 120,
										defaultValue: value("contactName"),
										className: input
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: "Teléfono comercial *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "phone",
										type: "tel",
										required: true,
										maxLength: 40,
										pattern: "[+0-9 ().-]{7,40}",
										defaultValue: value("phone"),
										className: input,
										placeholder: "+58 412 123 4567"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex min-h-11 items-center gap-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "whatsapp",
										type: "checkbox",
										defaultChecked: Boolean(restore?.whatsapp ?? company?.whatsapp),
										className: "size-5"
									}), "Este número recibe WhatsApp"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: "Correo comercial público",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "email",
										type: "email",
										maxLength: 180,
										defaultValue: value("email"),
										className: input
									})
								}),
								[
									["website", "Sitio web"],
									["instagram", "Instagram"],
									["facebook", "Facebook"]
								].map(([key, title]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: `${title} (URL completa)`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: key,
										type: "url",
										maxLength: 500,
										defaultValue: value(key),
										className: input,
										placeholder: "https://…"
									})
								}, key)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: `${label} sm:col-span-2`,
									children: [
										"Estados de cobertura adicional",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											name: "coverageStates",
											multiple: true,
											defaultValue: restore?.coverageStates ?? company?.coverageStates ?? [],
											className: `${input} min-h-36`,
											children: venezuelanStates.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-2 block text-xs font-normal",
											children: "Puedes seleccionar varios estados. Si no eliges ninguno, se mostrará el estado de la empresa."
										})
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "rounded-2xl bg-white/60 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "px-2 font-bold",
								children: "3. Logo y fotografías"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-4 text-sm leading-6 text-[#71685f]",
								children: "JPG, PNG o WebP, hasta 12 MB de entrada. Optimizamos las imágenes a un máximo de 960 px antes de enviarlas. Usa imágenes propias o autorizadas."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								title: "Logo o imagen principal",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "image/jpeg,image/png,image/webp",
									disabled: processing || saving,
									onChange: (e) => void photo(e.target.files?.[0], "logo"),
									className: "mt-3 block max-w-full text-xs"
								})
							}),
							(logo || logoKey) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: logo || company?.logoUrl || void 0,
									width: 90,
									height: 90,
									alt: "Vista previa del logo",
									className: "size-24 rounded-xl bg-white object-contain"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 text-sm underline",
									onClick: () => {
										markDirty();
										setLogo("");
										setLogoKey("");
									},
									children: "Quitar logo"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									title: `Galería (${galleryKeys.length + gallery.length}/6)`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "image/jpeg,image/png,image/webp",
										disabled: processing || saving || galleryKeys.length + gallery.length >= 6,
										onChange: (e) => void photo(e.target.files?.[0], "gallery"),
										className: "mt-3 block max-w-full text-xs"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3",
									children: [galleryKeys.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: `/api/media/${key}`,
										width: 240,
										height: 180,
										alt: "Fotografía actual de la empresa",
										className: "aspect-[4/3] w-full rounded-xl object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 text-xs underline",
										onClick: () => {
											markDirty();
											setGalleryKeys((v) => v.filter((k) => k !== key));
										},
										children: "Quitar"
									})] }, key)), gallery.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src,
										width: 240,
										height: 180,
										alt: `Nueva fotografía ${i + 1}`,
										className: "aspect-[4/3] w-full rounded-xl object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 text-xs underline",
										onClick: () => {
											markDirty();
											setGallery((v) => v.filter((_, j) => i !== j));
										},
										children: "Quitar"
									})] }, i))]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "rounded-2xl bg-white/60 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "px-2 font-bold",
								children: "4. Catálogo de productos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-7 text-[#71685f]",
								children: "Hasta 12 productos informativos. No se procesan pagos. No añadas medicamentos regulados, agroquímicos restringidos ni otros productos prohibidos. Puedes enlazar una publicación activa de Mercado Agro que pertenezca a tu cuenta."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5 space-y-5",
								children: products.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border bg-white p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
											className: "flex items-center gap-2 text-sm font-bold",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { size: 17 }),
												"Producto ",
												i + 1
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "min-h-11 text-xs underline",
											onClick: () => {
												markDirty();
												setProducts((v) => v.filter((_, j) => j !== i));
											},
											children: "Quitar producto"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 grid gap-4 sm:grid-cols-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												title: "Nombre del producto *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													required: true,
													minLength: 3,
													maxLength: 140,
													value: p.name,
													onChange: (e) => updateProduct(i, { name: e.target.value }),
													className: input
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												title: "Categoría",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
													value: p.category,
													onChange: (e) => updateProduct(i, { category: e.target.value }),
													className: input,
													children: companyProductCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: `${label} sm:col-span-2`,
												children: ["Descripción", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
													maxLength: 800,
													value: p.description,
													onChange: (e) => updateProduct(i, { description: e.target.value }),
													className: input
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												title: "Precio orientativo (vacío = consultar)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													inputMode: "decimal",
													min: "0",
													max: "99999999",
													step: "0.01",
													value: p.priceCents === null ? "" : p.priceCents / 100,
													onChange: (e) => updateProduct(i, { priceCents: e.target.value === "" ? null : Math.round(Number(e.target.value) * 100) }),
													className: input
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												title: "Moneda",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
													value: p.currency,
													onChange: (e) => updateProduct(i, { currency: e.target.value }),
													className: input,
													children: currencies.map((currency) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: currency,
														children: currencyLabels[currency]
													}, currency))
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "sm:col-span-2",
												children: p.priceCents !== null && Number.isFinite(p.priceCents) && p.priceCents >= 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceConversion, {
													amount: p.priceCents / 100,
													currency: p.currency,
													unit: p.unit
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												title: "Unidad",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													maxLength: 60,
													value: p.unit,
													onChange: (e) => updateProduct(i, { unit: e.target.value }),
													placeholder: "unidad, saco de 40 kg, kg…",
													className: input
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												title: "Disponibilidad",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													value: p.availability,
													onChange: (e) => updateProduct(i, { availability: e.target.value }),
													className: input,
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Por confirmar" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Disponible" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Bajo pedido" })
													]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												title: "ID de tu publicación en Mercado Agro (opcional)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													maxLength: 160,
													value: p.marketplaceId || "",
													onChange: (e) => updateProduct(i, { marketplaceId: e.target.value }),
													className: input
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												title: "Imagen del producto",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "file",
													accept: "image/jpeg,image/png,image/webp",
													disabled: processing || saving,
													onChange: (e) => void photo(e.target.files?.[0], i),
													className: "mt-3 block max-w-full text-xs"
												})
											}),
											(p.imageDataUrl || "imageUrl" in p && p.imageUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: p.imageDataUrl || String(p.imageUrl || ""),
												width: 160,
												height: 120,
												alt: `Vista previa de ${p.name || "producto"}`,
												className: "mt-3 aspect-[4/3] w-40 rounded-xl object-cover"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "min-h-11 text-xs underline",
												onClick: () => updateProduct(i, {
													imageDataUrl: void 0,
													imageKey: void 0,
													imageUrl: void 0
												}),
												children: "Quitar imagen nueva"
											})] })
										]
									})]
								}, p.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								disabled: products.length >= 12 || saving,
								type: "button",
								className: "mt-5 inline-flex min-h-12 items-center gap-2 rounded-full border px-5 text-sm font-semibold",
								onClick: () => {
									markDirty();
									setProducts((v) => [...v, {
										id: crypto.randomUUID(),
										name: "",
										description: "",
										category: companyProductCategories[0],
										priceCents: null,
										currency: "USD",
										unit: "unidad",
										marketplaceId: "",
										availability: "Por confirmar"
									}]);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 17 }), "Añadir producto"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								href: "/marketplace/publicar",
								target: "_blank",
								className: "ml-4 inline-flex min-h-12 items-center text-sm underline",
								children: "Crear publicación en Mercado Agro ↗"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-start gap-3 text-sm leading-7",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							required: true,
							className: "mt-1 size-5 shrink-0"
						}), "Confirmo que represento a esta empresa, que los datos e imágenes pueden publicarse y que el catálogo cumple la política comercial de Venezuela Agro."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs leading-6 text-[#71685f]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								href: "/legal/comercio",
								target: "_blank",
								className: "underline",
								children: "Política comercial"
							}),
							" · ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								href: "/legal/privacidad",
								target: "_blank",
								className: "underline",
								children: "Privacidad"
							}),
							" · La ficha y el catálogo se envían juntos a revisión. Si modificas una ficha publicada, dejará de mostrarse hasta la nueva aprobación."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormFeedback, {
				message,
				tone
			}),
			processing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "flex items-center gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { size: 17 }), "Optimizando imagen…"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "submit",
				disabled: saving || processing,
				className: "button-dark disabled:opacity-50",
				children: [
					saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						size: 17,
						className: "animate-spin"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 17 }),
					" ",
					saving ? "Guardando solicitud…" : "Guardar y enviar a revisión"
				]
			})
		]
	}, formKey);
}
//#endregion
export { CompanyManager };
