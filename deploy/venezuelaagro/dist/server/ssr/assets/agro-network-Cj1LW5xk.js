import { E as __toESM, T as __exportAll, b as require_react, n as require_jsx_runtime } from "../index.js";
import { a as getCachedEntities, l as getOperationStatus, m as queueMutation, r as createLocalId, v as subscribeOfflineChanges, y as syncNow } from "./offline-db-BE3xVTyb.js";
import { _ as socialFields, d as demoPosts, f as demoPublicFarms, g as socialCommentSchema, m as publicFarmSchema, p as farmPhoto, v as socialPostSchema } from "./professional-profile-Bdu_R75C.js";
import { t as venezuelanStates } from "./venezuela-Cj1crq10.js";
import { a as readListingContact } from "./whatsapp-contact-D2hkSaZs.js";
import { i as listingPhotos, o as marketplacePath } from "./marketplace-details-Bh_zF0oZ.js";
import { d as selectVerifiedDashboardOwner, r as useOfflineAccountBlocked, s as localOwner, t as OfflineAccountBoundary } from "./offline-account-boundary-hnu6xdcm.js";
import { t as chatGPTSignInPath } from "./auth-paths-DyLjOkUj.js";
import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BB9AB3vt.js";
import { t as RefreshCw } from "./refresh-cw-oXiIaqnM.js";
import { t as Input } from "./input-Coa5XNOy.js";
import { t as MessageCircle } from "./message-circle-BeenzVnM.js";
import { t as ContextualWhatsAppContact } from "./contextual-whatsapp-contact-CuE8E_7S.js";
import { t as ImageShareButton } from "./image-share-OFqHbnpR.js";
import { a as postImageContent, r as farmImageContent } from "./public-image-content-8oZuiwD9.js";
import { t as ArrowUpRight } from "./arrow-up-right-4sSx04o4.js";
import { t as Link } from "./link-CTsUsqTe.js";
import { t as Textarea } from "./textarea-C9uNbx98.js";
import { n as PublicFormGuide, t as FormFeedback } from "./form-feedback-C28cLJou.js";
import { t as publicFormError } from "./public-form-errors-C9Km7-c4.js";
import { n as usePublicConnection, r as visibleDemoRows, t as publicFeedRows } from "./use-offline-snapshot-D9a2gB0u.js";
import { t as Heart } from "./heart-DLhONV2f.js";
import { t as Tractor } from "./tractor-urrd7JYo.js";
import { t as SecurityCenter } from "./security-center-CM8-IZsL.js";
//#region lib/network-search.ts
var normalized = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim().replace(/\s+/g, " ");
/** Search the same public production and activity fields described by the directory. */
function filterPublicFarms(farms, query, state) {
	const search = normalized(query);
	return farms.filter((farm) => (!state || farm.state === state) && normalized([
		farm.name,
		farm.rubrics,
		farm.state,
		farm.municipality,
		farm.description,
		...farm.purposes
	].join(" ")).includes(search));
}
//#endregion
//#region lib/public-registration-examples.json
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var public_registration_examples_default = [
	{
		"id": "demo_v1_public_productora",
		"demo": true,
		"previewOnly": true,
		"missingBeforeSubmission": ["phone"],
		"payload": {
			"name": "Hato Claro · ejemplo ficticio",
			"responsibleName": "Responsable ficticio de ejemplo",
			"phone": "",
			"state": "Apure",
			"municipality": "Zona de ejemplo · sin ubicación real",
			"description": "Ficha ficticia para explorar el registro de una finca de tipo productora. Se pueden editar nombre, rubros y descripción. No representa una finca, actividad, persona u oferta real.",
			"rubrics": "Bovinos y leche",
			"purposes": ["Producción", "Venta de animales"],
			"farmType": "Productora",
			"productionProcess": "Identificación → pesajes → revisión de registros → acuerdo de entrega.",
			"saleOptions": "Animales por unidad o lote. Precio, documentación y disponibilidad por confirmar.",
			"visitConditions": "Ejemplo de condiciones: una visita real requeriría cita y confirmación. Esta ficha no admite reservas.",
			"socials": {}
		}
	},
	{
		"id": "demo_v1_public_turistica",
		"demo": true,
		"previewOnly": true,
		"missingBeforeSubmission": ["phone"],
		"payload": {
			"name": "Senderos del Patio · ejemplo ficticio",
			"responsibleName": "Responsable ficticio de ejemplo",
			"phone": "",
			"state": "Mérida",
			"municipality": "Zona de ejemplo · sin ubicación real",
			"description": "Ficha ficticia para explorar el registro de una finca de tipo turística. Se pueden editar nombre, rubros y descripción. No representa una finca, actividad, persona u oferta real.",
			"rubrics": "Turismo rural y talleres",
			"purposes": ["Visitas", "Capacitaciones"],
			"farmType": "Turística",
			"productionProcess": "Consulta → definición del recorrido → confirmación → visita.",
			"saleOptions": "Experiencias por grupo con reserva. Accesibilidad y condiciones por confirmar.",
			"visitConditions": "Ejemplo de condiciones: una visita real requeriría cita y confirmación. Esta ficha no admite reservas.",
			"socials": {}
		}
	},
	{
		"id": "demo_v1_public_mixta",
		"demo": true,
		"previewOnly": true,
		"missingBeforeSubmission": ["phone"],
		"payload": {
			"name": "Horizonte Mixto · ejemplo ficticio",
			"responsibleName": "Responsable ficticio de ejemplo",
			"phone": "",
			"state": "Barinas",
			"municipality": "Zona de ejemplo · sin ubicación real",
			"description": "Ficha ficticia para explorar el registro de una finca de tipo mixta. Se pueden editar nombre, rubros y descripción. No representa una finca, actividad, persona u oferta real.",
			"rubrics": "Aves, cacao y visitas",
			"purposes": [
				"Producción",
				"Venta de productos",
				"Visitas"
			],
			"farmType": "Mixta",
			"productionProcess": "Registro del lote → seguimiento → cosecha o recolección → presentación.",
			"saleOptions": "Productos por unidad o kilogramo. Formatos y condiciones por confirmar.",
			"visitConditions": "Ejemplo de condiciones: una visita real requeriría cita y confirmación. Esta ficha no admite reservas.",
			"socials": {}
		}
	},
	{
		"id": "demo_v1_public_cultivos",
		"demo": true,
		"previewOnly": true,
		"missingBeforeSubmission": ["phone"],
		"payload": {
			"name": "Cacao del Sendero · ejemplo ficticio",
			"responsibleName": "Responsable ficticio de ejemplo",
			"phone": "",
			"state": "Sucre",
			"municipality": "Zona de ejemplo · sin ubicación real",
			"description": "Ficha ficticia para explorar el registro de una finca de tipo cultivos y cosechas. Se pueden editar nombre, rubros y descripción. No representa una finca, actividad, persona u oferta real.",
			"rubrics": "Cacao y cultivos tropicales",
			"purposes": ["Producción", "Venta de productos"],
			"farmType": "Cultivos y cosechas",
			"productionProcess": "Cosecha → selección → registro del lote → acondicionamiento → pesaje.",
			"saleOptions": "Cacao por kilogramo o saco; muestra y condiciones por acordar.",
			"visitConditions": "Ejemplo de condiciones: una visita real requeriría cita y confirmación. Esta ficha no admite reservas.",
			"socials": {}
		}
	},
	{
		"id": "demo_v1_public_transformacion",
		"demo": true,
		"previewOnly": true,
		"missingBeforeSubmission": ["phone"],
		"payload": {
			"name": "Taller de la Cosecha · ejemplo ficticio",
			"responsibleName": "Responsable ficticio de ejemplo",
			"phone": "",
			"state": "Lara",
			"municipality": "Zona de ejemplo · sin ubicación real",
			"description": "Ficha ficticia para explorar el registro de una finca de tipo transformación de alimentos. Se pueden editar nombre, rubros y descripción. No representa una finca, actividad, persona u oferta real.",
			"rubrics": "Café tostado y presentación de lotes",
			"purposes": ["Producción", "Venta de productos"],
			"farmType": "Transformación de alimentos",
			"productionProcess": "Recepción → registro → transformación habilitada → empaque → entrega.",
			"saleOptions": "Café en presentaciones de ejemplo. Sin certificación ni habilitación acreditada.",
			"visitConditions": "Ejemplo de condiciones: una visita real requeriría cita y confirmación. Esta ficha no admite reservas.",
			"socials": {}
		}
	},
	{
		"id": "demo_v1_public_venta",
		"demo": true,
		"previewOnly": true,
		"missingBeforeSubmission": ["phone"],
		"payload": {
			"name": "La Vega de Papel · ejemplo ficticio",
			"responsibleName": "Responsable ficticio de ejemplo",
			"phone": "",
			"state": "Portuguesa",
			"municipality": "Zona de ejemplo · sin ubicación real",
			"description": "Ficha ficticia para explorar el registro de una finca de tipo propiedad en venta. Se pueden editar nombre, rubros y descripción. No representa una finca, actividad, persona u oferta real.",
			"rubrics": "Propiedad rural de ejemplo",
			"purposes": ["Venta de la propiedad"],
			"farmType": "Propiedad en venta",
			"productionProcess": "Consulta → visita acordada → revisión documental por las partes.",
			"saleOptions": "Ejemplo de venta de propiedad; no hay inmueble en oferta, precio ni título acreditado.",
			"visitConditions": "Ejemplo de condiciones: una visita real requeriría cita y confirmación. Esta ficha no admite reservas.",
			"socials": {}
		}
	}
];
//#endregion
//#region components/public-farm-examples.tsx
var import_jsx_runtime = require_jsx_runtime();
function PublicFarmExamples() {
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const example = public_registration_examples_default.find((row) => row.id === selected);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "my-8 rounded-2xl border border-[#4c6b3a]/20 bg-[#edf1e5] p-4 sm:p-6",
		"aria-labelledby": "public-farm-examples-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "public-farm-examples-title",
				className: "font-display text-2xl sm:text-3xl",
				children: "Ejemplos para presentar tu finca"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-7",
				children: "Elige un tipo y revisa una ficha totalmente ficticia. Son muestras de los campos del registro: no representan fincas disponibles, ofertas ni contactos reales. Abrirlas no completa ni envía tu formulario."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "button-light mt-4",
				"aria-expanded": expanded,
				"aria-controls": "registration-example-choices",
				onClick: () => setExpanded((value) => !value),
				children: expanded ? "Ocultar ejemplos de registro" : "Explorar ejemplos del formulario"
			}),
			expanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "registration-example-choices",
				className: "mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: public_registration_examples_default.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "relative min-w-0 rounded-xl bg-white p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold text-[#4c6b3a]",
							children: "Ejemplo ficticio"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-2 break-words text-lg font-bold",
							children: row.payload.farmType
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 break-words text-sm leading-6",
							children: row.payload.rubrics
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSelected(row.id),
							className: "stretched-card-action mt-3 min-h-11 text-sm font-semibold underline",
							children: ["Ver ficha de ejemplo", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "sr-only",
								children: [": ", row.payload.farmType]
							})]
						})
					]
				}, row.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!example,
				onOpenChange: (open) => {
					if (!open) setSelected(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [example?.payload.farmType, " · ejemplo ficticio"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Vista de práctica. No permite contactar, reservar ni publicar esta finca." })] }), example && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "grid min-w-0 gap-4",
							children: [
								["Nombre de la finca", example.payload.name],
								["Responsable", example.payload.responsibleName],
								["Teléfono público", "Sin teléfono de ejemplo. Al registrar tu finca debes indicar y revisar tu contacto real."],
								["Estado", example.payload.state],
								["Municipio o zona", example.payload.municipality],
								["Tipo de finca", example.payload.farmType],
								["Rubros", example.payload.rubrics],
								["Presentación", example.payload.description],
								["Proceso de producción", example.payload.productionProcess],
								["Productos y formas de venta", example.payload.saleOptions],
								["Actividades públicas", example.payload.purposes.join(" · ")],
								["Condiciones de visitas", example.payload.visitConditions],
								["Foto o logo", "Usa una imagen propia o que tengas permiso para publicar. Esta muestra no atribuye una fotografía a una finca real."],
								["Redes y sitio web", "Sin enlaces operativos de ejemplo. Son opcionales en tu registro."]
							].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 border-b border-[#3e2a19]/10 pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-sm font-bold",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1 whitespace-pre-line break-words text-sm leading-7",
									children: value
								})]
							}, label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-xl bg-[#fff7e8] p-4 text-sm leading-7",
							children: "Para presentar tu finca, completa el registro con tus datos reales y confirma que estás autorizado a hacerlos públicos. Guardar una ficha requiere revisión antes de publicarse. Tu plano, inventario y costos privados no se copian a esta ficha."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "button-dark",
							onClick: () => setSelected(null),
							children: "Cerrar ejemplo"
						})
					] })]
				})
			})
		]
	});
}
//#endregion
//#region components/agro-network.tsx
var agro_network_exports = /* @__PURE__ */ __exportAll({
	AgroNetwork: () => AgroNetwork,
	CommunityWhatsAppContact: () => CommunityWhatsAppContact,
	FarmCard: () => FarmCard,
	NetworkEmptyState: () => NetworkEmptyState,
	PublicFarmForm: () => PublicFarmForm
});
var purposeOptions = [
	"Producción",
	"Venta de animales",
	"Venta de productos",
	"Visitas",
	"Capacitaciones",
	"Venta de la propiedad"
];
function AgroNetwork(props) {
	const [hadAccount, setHadAccount] = (0, import_react.useState)(!!props.userId);
	if (props.userId && !hadAccount) setHadAccount(true);
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroNetworkWorkspace, { ...props });
	return hadAccount || props.userId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineAccountBoundary, {
		ownerId: props.userId ?? null,
		children: content
	}) : content;
}
function accountBoundary() {
	try {
		return window.localStorage.getItem("venezuela-agro-session-boundary");
	} catch {
		return;
	}
}
function AgroNetworkWorkspace({ initial, userId, name = "", directory = false, cacheScope = "feed", sharedListing, shareRequested = false }) {
	const accountBlocked = useOfflineAccountBlocked();
	const accountBlockedRef = (0, import_react.useRef)(accountBlocked);
	(0, import_react.useEffect)(() => {
		accountBlockedRef.current = accountBlocked;
	}, [accountBlocked]);
	const context = JSON.stringify([userId ?? null, cacheScope]);
	const [feed, setFeed] = (0, import_react.useState)({
		context,
		data: initial
	});
	const liveData = feed.context === context ? feed.data : initial;
	function setData(value) {
		setFeed((previous) => ({
			context,
			data: typeof value === "function" ? value(previous.context === context ? previous.data : initial) : value
		}));
	}
	const [query, setQuery] = (0, import_react.useState)(""), [state, setState] = (0, import_react.useState)(""), [message, setMessage] = (0, import_react.useState)(""), [working, setWorking] = (0, import_react.useState)(false), [farmId, setFarmId] = (0, import_react.useState)(""), [pendingState, setPending] = (0, import_react.useState)({
		owner: userId,
		rows: []
	});
	const pending = pendingState.owner === userId ? pendingState.rows : [];
	const saving = (0, import_react.useRef)(false);
	const singlePost = cacheScope.startsWith("post:");
	const searchInput = (0, import_react.useRef)(null);
	const online = usePublicConnection();
	const [moreExamples, setMoreExamples] = (0, import_react.useState)(false);
	const [attachListing, setAttachListing] = (0, import_react.useState)(!!sharedListing), [postText, setPostText] = (0, import_react.useState)(sharedListing ? `Comparto este anuncio: ${sharedListing.title}` : "");
	(0, import_react.useEffect)(() => {
		if (userId && !accountBlockedRef.current) selectVerifiedDashboardOwner(userId);
	}, [userId]);
	const data = {
		...liveData,
		farms: publicFeedRows(liveData.farms, online).map((row) => row.demo ? demoPublicFarms.find((example) => example.id === row.id) ?? row : row),
		posts: publicFeedRows(liveData.posts, online).map((row) => row.demo ? demoPosts.find((example) => example.id === row.id) ?? row : row)
	};
	async function load() {
		if (accountBlockedRef.current) return;
		const boundary = accountBoundary();
		if (!navigator.onLine) {
			setMessage("La comunidad y el directorio requieren internet. Tus datos y borradores propios se conservan; la pantalla social completa necesita internet.");
			return;
		}
		setWorking(true);
		try {
			const response = await fetch(cacheScope.startsWith("post:") ? "/api/red?post=" + encodeURIComponent(cacheScope.slice(5)) : "/api/red", { cache: "no-store" });
			if (!response.ok) throw new Error();
			const raw = await response.json();
			if (raw.owner !== (userId ?? null)) throw new Error("account_changed");
			if (accountBlockedRef.current || userId && boundary !== accountBoundary()) return;
			const next = {
				...raw,
				farms: [...raw.farms, ...demoPublicFarms],
				posts: [...raw.posts, ...demoPosts]
			};
			if (cacheScope.startsWith("post:")) next.posts = next.posts.filter((p) => p.id === cacheScope.slice(5));
			setData(next);
		} catch {
			setMessage("No pudimos actualizar la consulta. Conéctate y vuelve a intentarlo; tus borradores no cambiaron.");
		} finally {
			setWorking(false);
		}
	}
	(0, import_react.useEffect)(() => {
		const online = () => void load();
		window.addEventListener("online", online);
		return () => window.removeEventListener("online", online);
	}, [userId, cacheScope]);
	(0, import_react.useEffect)(() => {
		if (!userId || accountBlocked) return;
		let active = true;
		const update = async () => {
			const boundary = accountBoundary();
			if (accountBlockedRef.current || await localOwner() !== userId) return;
			const rows = await getCachedEntities("social-post");
			if (!active || accountBlockedRef.current || boundary !== accountBoundary() || await localOwner() !== userId) return;
			setPending({
				owner: userId,
				rows: rows.filter((r) => r.payload.actingUserId === userId).map((r) => ({
					id: r.id,
					text: String(r.payload.text),
					syncState: r.syncState
				}))
			});
		};
		update().catch(() => {});
		const unsubscribe = subscribeOfflineChanges(() => void update().catch(() => {}));
		return () => {
			active = false;
			unsubscribe();
		};
	}, [userId, accountBlocked]);
	async function save(type, payload, entityId = createLocalId(type), action = "upsert") {
		if (accountBlockedRef.current) return false;
		const boundary = accountBoundary();
		if (!userId) {
			setMessage("Inicia sesión con internet antes de publicar o reaccionar. Tus datos y borradores propios se conservan; la pantalla social completa necesita internet.");
			return false;
		}
		if (saving.current) return false;
		saving.current = true;
		try {
			setWorking(true);
			const operation = await queueMutation({
				expectedOwner: userId,
				entityType: type,
				entityId,
				action,
				...type === "public-farm" && action === "delete" ? { baseRevision: data.mine.find((row) => row.id === entityId)?.revision ?? null } : {},
				payload: {
					...payload,
					actingUserId: userId
				}
			});
			if (accountBlockedRef.current || boundary !== accountBoundary()) return true;
			setMessage("Guardado en este dispositivo. Pendiente de conexión y, cuando corresponda, revisión.");
			const result = await syncNow().catch(() => ({ reason: "connection_interrupted" }));
			if ((await getOperationStatus(operation.id)).state === "confirmed") {
				setMessage(action === "delete" ? "Retirada confirmada." : type === "social-reaction" ? "Reacción guardada." : "Enviado a revisión. El contenido aún no es público.");
				await load();
			} else if (result.reason === "account_contact_required") setMessage("Guardado localmente. Completa el correo y celular en Seguridad y privacidad para sincronizar.");
			else if (result.reason === "public_content_consent_required") setMessage("Guardado localmente. Autoriza el contenido público en Seguridad y privacidad para enviarlo.");
			return true;
		} catch {
			setMessage("No pudimos guardar. Revisa los campos y el espacio disponible del dispositivo.");
			return false;
		} finally {
			saving.current = false;
			setWorking(false);
		}
	}
	const farms = filterPublicFarms(data.farms, query, state);
	const filtersActive = !!(query.trim() || state);
	function clearFilters() {
		setQuery("");
		setState("");
		searchInput.current?.focus({ preventScroll: true });
	}
	const activeFarms = data.mine.filter((f) => f.status === "active");
	const posts = data.posts.filter((p) => farms.some((f) => f.id === p.farmId));
	const visibleFarms = visibleDemoRows(farms, moreExamples);
	const visiblePosts = visibleDemoRows(posts, moreExamples);
	const exampleCount = (directory ? farms : posts).filter((row) => row.demo).length;
	async function createPost(e) {
		e.preventDefault();
		const form = e.currentTarget;
		try {
			if (await save("social-post", socialPostSchema.parse({
				farmId,
				text: postText,
				actingUserId: userId,
				...attachListing && sharedListing ? { listingId: sharedListing.id } : {}
			}))) {
				form.reset();
				setPostText("");
				setAttachListing(false);
			}
		} catch {
			setMessage("Selecciona una finca publicada y escribe entre 3 y 500 caracteres.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [
			directory && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicFarmExamples, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "mb-7 flex flex-wrap gap-3",
				"aria-label": directory ? "Acciones del directorio" : "Acciones de la comunidad",
				children: directory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "button-dark",
						href: "#registrar-finca",
						children: "Presentar mi finca"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: "button-light",
						href: "/marketplace?categoria=Fincas%20y%20terrenos",
						children: "Propiedades en venta"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: "button-light",
						href: "/red",
						children: "Ver novedades de productores"
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					className: "button-dark",
					href: userId ? singlePost ? "/red#crear-novedad" : "#crear-novedad" : chatGPTSignInPath("/red"),
					target: userId ? void 0 : "_top",
					children: "Compartir una novedad"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					className: "button-light",
					href: "/fincas",
					children: "Buscar una finca"
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-5 text-sm leading-7 text-[#71685f]",
				children: directory ? "Encuentra una finca por producción, estado o actividad. Abre su ficha para conocer productos, procesos y contacto." : "Un espacio para compartir jornadas, avances y aprendizajes. Sigue la conversación y comparte lo que pasa en el campo."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 rounded-2xl bg-white p-5 sm:grid-cols-[1fr_1fr_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs font-semibold",
						children: ["Finca, rubro o actividad", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							ref: searchInput,
							type: "search",
							className: "mt-2",
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Cacao, ganado, capacitaciones…"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs font-semibold",
						children: ["Estado", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: state,
							onChange: (e) => setState(e.target.value),
							className: "mt-2 h-12 w-full min-w-0 rounded-md border bg-white px-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Todos los estados"
							}), venezuelanStates.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void load(),
						disabled: working || !online,
						"aria-describedby": !online ? "network-offline-help" : void 0,
						className: "button-light mt-2 self-end disabled:cursor-not-allowed disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
							size: 16,
							"aria-hidden": "true",
							className: working ? "animate-spin" : ""
						}), working ? "Actualizando…" : "Actualizar"]
					})
				]
			}),
			!online && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: "network-offline-help",
				role: "status",
				className: "mt-3 rounded-xl border border-[#d7c8b2] bg-[#f8f3ea] p-4 text-sm leading-6",
				children: "Sin conexión. La comunidad y el directorio requieren internet; no se descargan sus publicaciones. Puedes usar los ejemplos. Tus datos y borradores propios se conservan; la pantalla social completa necesita internet."
			}),
			filtersActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#d7c8b2] bg-[#f8f3ea] px-4 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "min-w-0 flex-1 break-words text-sm text-[#675f57]",
					children: ["Filtros: ", [query.trim(), state].filter(Boolean).join(" · ")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-full px-3 text-sm font-bold text-[#365026] underline",
					onClick: clearFilters,
					children: "Limpiar filtros"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				"aria-live": "polite",
				"aria-atomic": "true",
				className: "mt-5 text-sm text-[#675f57]",
				children: directory ? `${farms.filter((f) => !f.demo).length} fincas publicadas · ${farms.filter((f) => f.demo).length} ejemplos que coinciden.` : `${posts.filter((p) => !p.demo).length} publicaciones · ${posts.filter((p) => p.demo).length} ejemplos que coinciden.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				"aria-live": "polite",
				className: "my-5 text-sm leading-6 text-[#4c6b3a]",
				children: message || "Los ejemplos están identificados. Tus planos, costos e inventarios siguen siendo privados."
			}),
			exampleCount > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-6 text-[#71685f]",
					children: moreExamples ? `${exampleCount} ejemplos ficticios coinciden con tus filtros.` : `Mostramos 1 de ${exampleCount} ejemplos que coinciden. Los registros reales se muestran completos.`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-expanded": moreExamples,
					onClick: () => setMoreExamples((value) => !value),
					className: "button-light",
					children: moreExamples ? "Mostrar un solo ejemplo" : "Explorar más ejemplos"
				})]
			}),
			directory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-5 md:grid-cols-2 xl:grid-cols-3",
				children: visibleFarms.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmCard, { farm: f }, f.id))
			}), online && !farms.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkEmptyState, {
				directory: true,
				filtered: filtersActive,
				onReset: clearFilters
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl space-y-5",
				children: [
					shareRequested && !sharedListing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "rounded-xl bg-[#f4e3ce] p-4 text-sm",
						children: "El anuncio no está disponible para compartir. Puede estar en revisión o retirado. No publicaremos un enlace a una oferta inexistente."
					}),
					sharedListing && attachListing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-xl border bg-white p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-[#4c6b3a]",
								children: "ANUNCIO QUE VAS A COMPARTIR"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-semibold",
								children: sharedListing.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs",
								children: sharedListing.location
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "button-light mt-3",
								onClick: () => setAttachListing(false),
								children: "Quitar anuncio del borrador"
							}),
							!userId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "button-dark mt-3",
								href: chatGPTSignInPath(`/red?anuncio=${encodeURIComponent(sharedListing.id)}`),
								target: "_top",
								children: "Iniciar sesión para preparar la publicación"
							})
						]
					}),
					userId && !singlePost && (activeFarms.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: createPost,
						id: "crear-novedad",
						"aria-busy": working,
						className: "scroll-mt-32 rounded-2xl border bg-white p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Una novedad desde tu finca."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							disabled: working,
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-4 block text-sm",
									children: ["Publicar como", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: farmId,
										onChange: (e) => setFarmId(e.target.value),
										required: true,
										className: "mt-2 h-12 w-full min-w-0 rounded-md border px-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Elige una finca publicada"
										}), activeFarms.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: f.id,
											children: f.name
										}, f.id))]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-4 block text-sm font-semibold",
									children: ["Tu novedad *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										name: "text",
										"aria-describedby": "community-post-help",
										value: postText,
										onChange: (e) => setPostText(e.target.value),
										required: true,
										minLength: 3,
										maxLength: 500,
										placeholder: "Comparte una cosecha, una jornada, una oportunidad o un aprendizaje…",
										className: "mt-2 min-h-28"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									id: "community-post-help",
									className: "my-3 text-xs leading-6",
									children: "Entre 3 y 500 caracteres. La publicación pasa por revisión; la venta se gestiona en Mercado Agro."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mb-3 text-right text-xs text-[#675f57]",
									children: [postText.length, " / 500 caracteres"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "button-dark",
									disabled: working,
									children: working ? "Guardando…" : "Guardar publicación"
								})
							]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "crear-novedad",
						className: "scroll-mt-32 rounded-2xl border bg-white p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Tu finca es el primer paso."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-7 text-[#675f57]",
								children: data.mine.length ? "Tu ficha todavía no está publicada. Revisa su estado en el directorio; cuando se apruebe, podrás compartir novedades con su nombre." : "Para compartir una novedad, presenta primero tu finca en el directorio. Su ficha pasa por revisión antes de publicarse; tus registros de Mi Finca siguen siendo privados."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								href: "/fincas#registrar-finca",
								className: "button-dark mt-4",
								children: data.mine.length ? "Revisar mi ficha" : "Presentar mi finca"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								href: "/aprende",
								className: "mt-3 inline-flex min-h-11 items-center px-3 text-sm font-semibold text-[#365026] underline",
								children: "Ver las guías"
							})
						]
					})),
					visiblePosts.map((p) => {
						const f = data.farms.find((f) => f.id === p.farmId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							id: p.id,
							className: "rounded-2xl border bg-white p-5 sm:p-7",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmAvatar, { farm: f }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											href: `/fincas/${f.id}`,
											className: "break-words font-semibold",
											children: p.authorName
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-[#71685f]",
											children: [
												f.state,
												" · ",
												new Intl.DateTimeFormat("es-VE", {
													dateStyle: "medium",
													timeZone: "UTC"
												}).format(new Date(p.createdAt)),
												p.demo ? " · Ejemplo demostrativo" : "",
												!p.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													href: `/red/${p.id}`,
													className: "ml-2 underline",
													children: "Ver publicación"
												})
											]
										})]
									})]
								}),
								p.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: p.imageUrl,
									alt: "Imagen ilustrativa de la publicación de ejemplo",
									width: 960,
									height: 600,
									loading: "lazy",
									decoding: "async",
									className: "mt-5 aspect-[16/10] w-full rounded-xl object-cover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-5 whitespace-pre-wrap break-words text-base leading-7",
									children: p.text
								}),
								p.listing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									href: marketplacePath(p.listing),
									className: "mt-4 block overflow-hidden rounded-xl border bg-[#f8f3ea]",
									children: [listingPhotos(p.listing)[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: listingPhotos(p.listing)[0].src,
										alt: listingPhotos(p.listing)[0].alt,
										width: 640,
										height: 400,
										className: "aspect-[16/9] w-full object-cover",
										loading: "lazy"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-semibold text-[#4c6b3a]",
												children: "ANUNCIO DE MERCADO AGRO"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 font-semibold",
												children: p.listing.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-2 text-xs",
												children: [p.listing.location, " · Ver disponibilidad con el anunciante →"]
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommunityWhatsAppContact, {
									post: p,
									farm: f
								}),
								p.listingId && !p.listing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 rounded-xl bg-[#f3ebdd] p-3 text-xs",
									children: "El anuncio compartido ya no está disponible públicamente."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 flex flex-wrap gap-2 border-t pt-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											disabled: p.demo || working,
											"aria-pressed": p.liked,
											onClick: async () => {
												if (!userId) {
													setMessage("Inicia sesión para reaccionar.");
													return;
												}
												const liked = !p.liked;
												setData((d) => ({
													...d,
													posts: d.posts.map((x) => x.id === p.id ? {
														...x,
														liked,
														likes: Math.max(0, x.likes + (liked ? 1 : -1))
													} : x)
												}));
												if (!await save("social-reaction", {
													postId: p.id,
													liked
												})) setData((d) => ({
													...d,
													posts: d.posts.map((x) => x.id === p.id ? p : x)
												}));
											},
											className: "button-light",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
													size: 17,
													fill: p.liked ? "currentColor" : "none"
												}),
												p.likes,
												" Me gusta"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: `#comentarios-${p.id}`,
											onClick: (event) => {
												if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
												const conversation = document.getElementById(`comentarios-${p.id}`);
												if (conversation instanceof HTMLDetailsElement) {
													event.preventDefault();
													conversation.open = true;
													conversation.scrollIntoView({ block: "start" });
													conversation.querySelector("summary")?.focus({ preventScroll: true });
												}
											},
											"aria-label": `Ver conversación de la publicación de ${p.authorName}`,
											className: "button-light",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { size: 17 }),
												p.comments.length,
												" ",
												p.comments.length === 1 ? "Comentario" : "Comentarios"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageShareButton, { content: postImageContent(p, f) })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
									id: `comentarios-${p.id}`,
									className: "mt-4 scroll-mt-24",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
											className: "min-h-11 cursor-pointer py-3 text-sm font-semibold",
											children: "Ver conversación"
										}),
										p.comments.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 rounded-xl bg-[#f3ebdd] p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-semibold",
												children: c.authorName
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 whitespace-pre-wrap break-words text-sm leading-6",
												children: c.text
											})]
										}, c.id)),
										!p.comments.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "py-3 text-sm text-[#71685f]",
											children: "Todavía no hay comentarios publicados."
										}),
										!p.demo && userId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
											className: "mt-3",
											onSubmit: async (e) => {
												e.preventDefault();
												const form = e.currentTarget;
												try {
													if (await save("social-comment", socialCommentSchema.parse({
														postId: p.id,
														text: String(new FormData(form).get("comment") || ""),
														actingUserId: userId
													}))) form.reset();
												} catch {
													setMessage("Escribe un comentario de 2 a 500 caracteres.");
												}
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "block text-sm font-semibold",
													children: ["Tu comentario *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
														name: "comment",
														"aria-describedby": `comment-help-${p.id}`,
														required: true,
														minLength: 2,
														maxLength: 500,
														className: "mt-2",
														placeholder: "Aporta una idea o pregunta con respeto."
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													disabled: working,
													className: "button-dark mt-3",
													children: "Guardar comentario"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													id: `comment-help-${p.id}`,
													className: "mt-2 text-xs leading-6",
													children: "Entre 2 y 500 caracteres. Se revisa antes de publicarse."
												})
											]
										})
									]
								})
							]
						}, p.id);
					}),
					online && !posts.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkEmptyState, {
						filtered: filtersActive,
						onReset: clearFilters
					}),
					pending.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl bg-[#eadfcd] p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Mis publicaciones guardadas"
						}), pending.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 border-t pt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "break-words text-sm",
									children: p.text
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs",
									children: p.syncState === "pending" ? "Pendiente de envío" : "Enviada; la publicación pública requiere aprobación"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: working,
									onClick: () => void save("social-post", { actingUserId: userId }, p.id, "delete"),
									className: "mt-2 min-h-11 text-xs underline",
									children: "Retirar publicación"
								})
							]
						}, p.id))]
					})
				]
			}),
			!directory && !userId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: chatGPTSignInPath("/red"),
				target: "_top",
				className: "button-dark mt-7",
				children: "Iniciar sesión para participar"
			}),
			directory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "registrar-finca",
				className: "mt-16 scroll-mt-28 rounded-[2rem] bg-[#eadfcd] p-5 sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl sm:text-4xl",
						children: "Haz que tu finca llegue a más personas."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-2xl text-sm leading-7",
						children: "Presenta tu finca al país y a visitantes de otros lugares: producción, cosechas, turismo, productos, visitas y capacitaciones. Regístrala para que más personas conozcan lo que haces y puedan contactarte. Para vender la propiedad o comercializar productos, crea además una publicación en Mercado Agro. Este directorio no certifica propiedad ni titularidad."
					}),
					userId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityCenter, {
							mode: "gate",
							requirePublic: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicFarmForm, {
							userId,
							name,
							onSave: save
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityCenter, {}),
						data.mine.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold",
								children: "Mis fichas públicas"
							}), data.mine.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "break-words text-sm",
									children: [
										f.name,
										" · ",
										f.status === "active" ? "Publicada" : f.status === "rejected" ? "Revisar solicitud" : "En revisión"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 text-xs underline",
									disabled: working,
									onClick: () => void save("public-farm", {}, f.id, "delete"),
									children: "Retirar ficha"
								})]
							}, f.id))]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: chatGPTSignInPath(directory ? "/fincas" : "/red"),
						target: "_top",
						className: "button-dark mt-6",
						children: "Registrar mi finca"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12 rounded-2xl bg-[#e8f0df] p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl",
						children: "Tu finca, parte de la conversación."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-sm leading-7",
						children: "Crea primero su ficha en el directorio. Cuando esté publicada, podrás compartir novedades con su nombre desde aquí."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						href: "/fincas#registrar-finca",
						className: "button-dark mt-5",
						children: "Registrar mi ficha pública"
					})
				]
			})
		]
	});
}
function NetworkEmptyState({ directory = false, filtered, onReset }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-dashed border-[#b9aa94] bg-white p-6 sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-semibold",
				children: filtered ? directory ? "No encontramos fincas con estos filtros." : "No encontramos publicaciones con estos filtros." : directory ? "Todavía no hay fincas disponibles." : "Todavía no hay publicaciones disponibles."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm leading-7 text-[#675f57]",
				children: filtered ? "Prueba otro nombre, rubro o estado. También puedes limpiar los filtros para volver a ver todo." : "Puedes volver a consultar más tarde con internet. Tus datos y borradores propios se conservan."
			}),
			filtered && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onReset,
				className: "button-light mt-4",
				children: "Ver todo"
			})
		]
	});
}
function FarmAvatar({ farm: f }) {
	const photo = farmPhoto(f);
	return photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: photo,
		width: 56,
		height: 56,
		alt: f.demo ? "Imagen ilustrativa de cultivo" : `Imagen de ${f.name}`,
		loading: "lazy",
		className: "size-14 shrink-0 rounded-full object-cover"
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "flex size-14 shrink-0 items-center justify-center rounded-full bg-[#e8f0df] text-[#365026]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tractor, { size: 24 })
	});
}
function FarmCard({ farm: f }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "min-w-0 rounded-2xl border bg-white p-6",
		children: [
			farmPhoto(f) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: farmPhoto(f),
				alt: `Imagen ilustrativa de ${f.name}`,
				width: 640,
				height: 400,
				loading: "lazy",
				decoding: "async",
				className: "mb-5 aspect-[16/10] w-full rounded-xl object-cover"
			}),
			!farmPhoto(f) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FarmAvatar, { farm: f }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-xs text-[#4c6b3a]",
				children: [
					f.state,
					" · ",
					f.municipality,
					f.demo ? " · Ejemplo demostrativo" : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display mt-3 break-words text-2xl",
				children: f.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 line-clamp-3 text-sm leading-7 text-[#71685f]",
				children: f.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: f.purposes.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-[#edf1e5] px-3 py-2 text-xs",
					children: v
				}, v))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				href: `/fincas/${f.id}`,
				"aria-label": `Conocer la finca ${f.name}`,
				className: "button-light mt-5",
				children: ["Conocer la finca", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 16 })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextualWhatsAppContact, {
				context: `la finca ${f.name}`,
				phone: f.phone,
				enabled: f.whatsapp,
				demo: f.demo,
				className: "mt-4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageShareButton, {
				content: farmImageContent(f),
				className: "button-light mt-3 w-full"
			})
		]
	});
}
function PublicFarmForm({ userId, name, onSave }) {
	const [photo, setPhoto] = (0, import_react.useState)(""), [notice, setNotice] = (0, import_react.useState)(""), [busy, setBusy] = (0, import_react.useState)(false), [submitting, setSubmitting] = (0, import_react.useState)(false), [tone, setTone] = (0, import_react.useState)("info");
	const lock = (0, import_react.useRef)(false);
	async function selectPhoto(file) {
		if (!file) return;
		setBusy(true);
		setTone("info");
		try {
			if (![
				"image/jpeg",
				"image/png",
				"image/webp"
			].includes(file.type) || file.size > 12e6) throw new Error();
			const url = URL.createObjectURL(file);
			try {
				const img = await new Promise((resolve, reject) => {
					const image = new Image();
					image.onload = () => resolve(image);
					image.onerror = reject;
					image.src = url;
				});
				const canvas = document.createElement("canvas"), scale = Math.min(1, 640 / Math.max(img.naturalWidth, img.naturalHeight));
				canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
				canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
				const ctx = canvas.getContext("2d");
				if (!ctx) throw new Error();
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				const result = canvas.toDataURL("image/webp", .78);
				if (result.length > 65e4) throw new Error();
				setPhoto(result);
				setNotice("Imagen optimizada.");
			} finally {
				URL.revokeObjectURL(url);
			}
		} catch {
			setTone("error");
			setNotice("Elige JPG, PNG o WebP de menos de 12 MB.");
		} finally {
			setBusy(false);
		}
	}
	async function submit(e) {
		e.preventDefault();
		if (lock.current || busy) return;
		lock.current = true;
		const form = e.currentTarget;
		setSubmitting(true);
		setNotice("");
		try {
			const f = new FormData(form);
			if (await onSave("public-farm", publicFarmSchema.parse({
				name: f.get("name"),
				responsibleName: f.get("responsibleName"),
				phone: f.get("phone"),
				whatsapp: f.get("whatsapp") === "on",
				productionProcess: f.get("productionProcess"),
				saleOptions: f.get("saleOptions"),
				farmType: f.get("farmType"),
				state: f.get("state"),
				municipality: f.get("municipality"),
				description: f.get("description"),
				rubrics: f.get("rubrics"),
				purposes: f.getAll("purposes"),
				visitConditions: f.get("visitConditions"),
				socials: Object.fromEntries(socialFields.map(([key]) => [key, String(f.get(key) || "")])),
				actingUserId: userId,
				...photo ? { imageDataUrl: photo } : {}
			}))) {
				form.reset();
				setPhoto("");
				setTone("info");
				setNotice("Ficha guardada. Consulta el estado del envío; requiere revisión antes de publicarse.");
			} else {
				setTone("error");
				setNotice("No se confirmó el guardado. Tus datos siguen aquí; revisa el aviso del directorio y vuelve a intentarlo.");
			}
		} catch (error) {
			setTone("error");
			setNotice(publicFormError(error, "Revisa nombre, responsable, teléfono, estado, descripción, rubros y al menos una actividad. Tus datos siguen en el formulario."));
		} finally {
			lock.current = false;
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		"aria-busy": busy || submitting,
		className: "mt-7 grid min-w-0 gap-4 sm:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sm:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicFormGuide, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				disabled: submitting,
				className: "contents",
				children: [
					[
						["name", "Nombre de la finca *"],
						["responsibleName", "Nombre del responsable *"],
						["phone", "Teléfono público *"],
						["municipality", "Municipio o zona"]
					].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: key,
							className: "mt-2",
							type: key === "phone" ? "tel" : "text",
							required: key !== "municipality",
							minLength: key === "phone" ? 7 : 3,
							maxLength: key === "phone" ? 40 : key === "municipality" ? 100 : 120,
							defaultValue: key === "responsibleName" ? name : ""
						})]
					}, key)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "sm:col-span-2 flex min-h-11 items-center gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "whatsapp",
							type: "checkbox",
							className: "size-5"
						}), "Habilitar WhatsApp con este teléfono público para consultas sobre la finca y sus publicaciones."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: ["Estado *", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							name: "state",
							required: true,
							className: "mt-2 h-12 w-full min-w-0 rounded-md border bg-white px-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Selecciona"
							}), venezuelanStates.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: ["Rubros de la finca *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: "rubrics",
							required: true,
							minLength: 3,
							maxLength: 500,
							placeholder: "Cacao, ganadería, café…",
							className: "mt-2"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: ["Tipo de finca", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							name: "farmType",
							className: "mt-2 h-12 w-full rounded-md border px-3",
							children: [
								"Productora",
								"Turística",
								"Mixta",
								"Cultivos y cosechas",
								"Transformación de alimentos",
								"Propiedad en venta"
							].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "sm:col-span-2 text-sm font-semibold",
						children: ["Proceso de producción y tiempos", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							name: "productionProcess",
							maxLength: 2e3,
							className: "mt-2",
							placeholder: "Etapas, duración aproximada y controles que realizas. Cada lote tiene sus propias condiciones."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "sm:col-span-2 text-sm font-semibold",
						children: ["Productos y formas de venta", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							name: "saleOptions",
							maxLength: 1500,
							className: "mt-2",
							placeholder: "Animales en pie, cortes, kg, toneladas, sacos, muestras o experiencias con reserva…"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "sm:col-span-2 text-sm font-semibold",
						children: ["Presenta tu finca *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							name: "description",
							required: true,
							minLength: 20,
							maxLength: 1200,
							className: "mt-2",
							placeholder: "Qué producen, cómo trabajan y qué ofrecen. Evita ubicación exacta o datos privados si no quieres publicarlos."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "sm:col-span-2 min-w-0 rounded-xl border bg-white p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "px-2 text-sm font-semibold",
								children: "Actividades públicas *"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-xs text-[#71685f]",
								children: "Selecciona al menos una actividad."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-2 sm:grid-cols-2",
								children: purposeOptions.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex min-h-11 items-center gap-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										name: "purposes",
										value: v,
										className: "size-4"
									}), v]
								}, v))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "sm:col-span-2 text-sm font-semibold",
						children: ["Condiciones de visitas o capacitaciones", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							name: "visitConditions",
							maxLength: 700,
							className: "mt-2",
							placeholder: "Cómo reservar, horarios y condiciones. Visitas solo después de confirmarlas contigo."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "sm:col-span-2 text-sm font-semibold",
						children: [
							"Fotografía o logo",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/jpeg,image/png,image/webp",
								disabled: busy,
								onChange: (e) => void selectPhoto(e.target.files?.[0]),
								className: "mt-2 block w-full min-w-0 text-xs"
							}),
							photo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: photo,
								alt: "Vista previa de tu ficha",
								width: 96,
								height: 96,
								className: "mt-3 size-24 rounded-xl object-cover"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "sm:col-span-2 rounded-xl border bg-white p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "min-h-11 cursor-pointer py-3 text-sm font-semibold",
							children: "Redes sociales y sitio web"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: socialFields.map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-xs font-semibold",
								children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									name: key,
									type: "url",
									maxLength: 500,
									placeholder: "https://…",
									className: "mt-2"
								})]
							}, key))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "sm:col-span-2 flex items-start gap-3 text-sm leading-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							required: true,
							className: "mt-1 size-5 shrink-0"
						}), "Soy responsable o estoy autorizado para publicar esta ficha. Entiendo que estos datos, teléfono e imagen serán públicos; no se publicará el registro privado de Mi Finca."]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				disabled: busy || submitting,
				className: "button-dark w-fit",
				children: busy ? "Optimizando…" : submitting ? "Guardando ficha…" : "Guardar ficha pública"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sm:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormFeedback, {
					message: notice,
					tone
				})
			})
		]
	});
}
function CommunityWhatsAppContact({ post, farm }) {
	const listingContact = post.listing ? readListingContact(post.listing.contact, post.listing.contactProfile) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextualWhatsAppContact, {
		context: post.listing ? `${post.listing.title} · publicación de ${post.authorName}: «${post.text}»` : `la publicación de ${post.authorName}: «${post.text}»`,
		phone: post.listing ? listingContact?.phone : farm.phone,
		enabled: post.listing ? listingContact?.whatsapp : farm.whatsapp,
		demo: !!(post.demo || farm.demo || post.listing?.demo),
		className: "mt-5"
	});
}
//#endregion
export { agro_network_exports as n, PublicFarmForm as t };
