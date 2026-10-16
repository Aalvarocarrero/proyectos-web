import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { B as storeCategories, H as unitRule, L as defaultQuantity, N as orderPayloadSchema, R as relatedStoreProducts, U as validStoreQuantity, V as storeProducts, l as getOperationStatus, m as queueMutation, n as cacheEntity, o as getCachedEntity, r as createLocalId, y as syncNow, z as restoreStoreLine } from "./offline-db-BE3xVTyb.js";
import { d as selectVerifiedDashboardOwner } from "./offline-account-boundary-hnu6xdcm.js";
import { a as formalSubmissionLoginPath, c as loadFormalDraft, d as saveFormalDraft, i as formalSubmissionError, l as requireFormalSubmissionSession, n as FormalSubmissionAuthError, o as formalSubmissionNeedsLogin, r as clearFormalDraft, s as isFormalSubmissionAuthError, t as FormalSubmissionNotice, u as requiresFormalSession } from "./formal-submission-notice-Dhskdcco.js";
import { t as createLucideIcon } from "./createLucideIcon-ZIVktEBq.js";
import { i as DialogDescription, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BB9AB3vt.js";
import { t as ArrowRight } from "./arrow-right-BK-E7gK8.js";
import { t as Input } from "./input-Coa5XNOy.js";
import { r as CurrencyCalculator, t as QuoteConversion } from "./quote-conversion-Bk1UoxEX.js";
import { t as ContextualWhatsAppContact } from "./contextual-whatsapp-contact-CuE8E_7S.js";
import { t as ImageShareButton } from "./image-share-OFqHbnpR.js";
import { s as storeImageContent } from "./public-image-content-8oZuiwD9.js";
import { t as Building2 } from "./building-2-BNaf1wUO.js";
import { t as Textarea } from "./textarea-C9uNbx98.js";
import { t as WifiOff } from "./wifi-off-Bb6uRUdV.js";
import { a as SheetTitle, i as SheetHeader, n as SheetContent, o as SheetTrigger, r as SheetDescription, s as Trash2, t as Sheet } from "./sheet-CrQr0EPV.js";
import { n as toast } from "./dist-DA4Me00g.js";
//#region ../venezuela-agro-auth/node_modules/lucide-react/dist/esm/icons/package-check.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var PackageCheck = createLucideIcon("package-check", [
	["path", {
		d: "M12 22V12",
		key: "d0xqtd"
	}],
	["path", {
		d: "m16 17 2 2 4-4",
		key: "uh5qu3"
	}],
	["path", {
		d: "M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753",
		key: "kpkbpo"
	}],
	["path", {
		d: "M3.29 7 12 12l8.71-5",
		key: "19ckod"
	}],
	["path", {
		d: "m7.5 4.27 8.997 5.148",
		key: "9yrvtv"
	}]
]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ShoppingBag = createLucideIcon("shopping-bag", [
	["path", {
		d: "M16 10a4 4 0 0 1-8 0",
		key: "1ltviw"
	}],
	["path", {
		d: "M3.103 6.034h17.794",
		key: "awc11p"
	}],
	["path", {
		d: "M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z",
		key: "o988cm"
	}]
]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Pencil = createLucideIcon("pencil", [["path", {
	d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
	key: "1a8usu"
}], ["path", {
	d: "m15 5 4 4",
	key: "1mk7zo"
}]]);
//#endregion
//#region components/store-catalog.tsx
var import_jsx_runtime = require_jsx_runtime();
var emptyRequestContact = {
	name: "",
	phone: "",
	email: "",
	note: "",
	companyName: "",
	companyType: "",
	taxId: "",
	deliveryLocation: "",
	frequency: "Única",
	requiredDate: "",
	deliveryMode: "A convenir"
};
function StoreCatalog() {
	const [category, setCategory] = (0, import_react.useState)("Todo"), [channel, setChannel] = (0, import_react.useState)("personal"), [cart, setCart] = (0, import_react.useState)([]), [open, setOpen] = (0, import_react.useState)(false), [draft, setDraft] = (0, import_react.useState)(null), [message, setMessage] = (0, import_react.useState)(""), [submitting, setSubmitting] = (0, import_react.useState)(false), [ready, setReady] = (0, import_react.useState)(false);
	const [requestedIds, setRequestedIds] = (0, import_react.useState)([]);
	const [loginNeeded, setLoginNeeded] = (0, import_react.useState)(false), [pendingOrder, setPendingOrder] = (0, import_react.useState)(null);
	const pendingOrderRef = (0, import_react.useRef)(null);
	function rememberPending(value) {
		pendingOrderRef.current = value;
		setPendingOrder(value);
	}
	function beginLogin() {
		if (locked.current) return;
		if (!saveFormalDraft("order", {
			cart,
			channel,
			contact: requestContact,
			pending: pendingOrderRef.current
		})) {
			setMessage("No pudimos conservar el borrador en esta pestaña. No salimos del formulario; revisa el almacenamiento antes de entrar.");
			return;
		}
		window.location.assign(formalSubmissionLoginPath("order", "/tienda#solicitud"));
	}
	const [requestContact, setRequestContact] = (0, import_react.useState)(() => ({ ...emptyRequestContact }));
	function contactField(name) {
		return {
			value: requestContact[name],
			onChange: (event) => {
				const value = event.currentTarget.value;
				setRequestContact((current) => ({
					...current,
					[name]: value
				}));
			}
		};
	}
	const locked = (0, import_react.useRef)(false), writes = (0, import_react.useRef)(Promise.resolve());
	(0, import_react.useEffect)(() => {
		let active = true;
		getCachedEntity("cart", "current").then((c) => {
			if (!active) return;
			if (c?.payload.items) {
				setCart(c.payload.items.map(restoreStoreLine).filter((l) => !!l));
				setChannel(c.payload.channel === "business" || c.payload.items[0]?.channel === "business" ? "business" : "personal");
			}
		}).catch(() => {
			if (active) setMessage("No pudimos recuperar la solicitud guardada. Revisa el almacenamiento de tu dispositivo.");
		}).finally(() => {
			if (!active) return;
			if (requiresFormalSession() && new URLSearchParams(window.location.search).get("resume") === "order") {
				const saved = loadFormalDraft("order");
				if (saved && Array.isArray(saved.cart) && saved.contact && typeof saved.contact === "object") {
					setCart(saved.cart.map((line) => restoreStoreLine(line)).filter((line) => !!line));
					setChannel(saved.channel === "business" ? "business" : "personal");
					setRequestContact(Object.fromEntries(Object.entries(emptyRequestContact).map(([key, fallback]) => [key, typeof saved.contact[key] === "string" ? saved.contact[key].slice(0, 1200) : fallback])));
					const pending = saved.pending, parsed = pending && orderPayloadSchema.safeParse(pending.payload);
					if (pending && parsed?.success && typeof pending.owner === "string" && typeof pending.entityId === "string" && typeof pending.operationId === "string") rememberPending({
						...pending,
						payload: parsed.data
					});
					setOpen(true);
					setMessage("Borrador recuperado. Revisa tus datos y confirma el envío; volver de Google no lo envía automáticamente.");
				}
			}
			setReady(true);
		});
		return () => {
			active = false;
		};
	}, []);
	const filtered = (0, import_react.useMemo)(() => category === "Todo" ? storeProducts : storeProducts.filter((p) => p.category === category), [category]);
	async function saveCart(items, nextChannel = channel) {
		setCart(items);
		const task = writes.current.then(() => cacheEntity("cart", "current", {
			items,
			channel: nextChannel
		}, "synced"));
		writes.current = task.catch(() => {});
		try {
			await task;
		} catch {
			setMessage("No se guardaron los últimos cambios en este dispositivo. Conservamos tu solicitud en pantalla.");
		}
	}
	function changeChannel(next) {
		if (locked.current || pendingOrderRef.current) return;
		setChannel(next);
		saveCart(cart, next);
	}
	function saveLine(line, index) {
		const next = [...cart];
		if (index !== void 0) next[index] = line;
		else next.push(line);
		saveCart(next);
		setDraft(null);
		setOpen(true);
	}
	async function submitRequest(e) {
		e.preventDefault();
		if (locked.current || !cart.length) return;
		const formElement = e.currentTarget, f = new FormData(formElement);
		if (cart.some((l) => !validStoreQuantity(l.quantity, l.measure))) {
			setMessage("Revisa las cantidades: animales, unidades y lotes deben ser números enteros.");
			return;
		}
		const payload = pendingOrderRef.current?.payload ?? {
			customerName: String(f.get("name") || ""),
			phone: String(f.get("phone") || ""),
			email: String(f.get("email") || ""),
			note: String(f.get("note") || ""),
			channel,
			items: cart,
			business: channel === "business" ? {
				companyName: String(f.get("companyName") || ""),
				companyType: String(f.get("companyType") || ""),
				taxId: String(f.get("taxId") || ""),
				deliveryLocation: String(f.get("deliveryLocation") || ""),
				frequency: String(f.get("frequency") || ""),
				requiredDate: String(f.get("requiredDate") || ""),
				deliveryMode: String(f.get("deliveryMode") || "")
			} : void 0
		};
		const parsed = orderPayloadSchema.safeParse(payload);
		if (!parsed.success) {
			setMessage(parsed.error.issues[0]?.message || "Revisa el contacto y los datos de la solicitud.");
			return;
		}
		if (!/^[+\d\s().-]{7,40}$/.test(payload.phone || "") || (payload.phone || "").replace(/\D/g, "").length < 7 || (payload.phone || "").replace(/\D/g, "").length > 15) {
			setMessage("Indica un teléfono válido con código de país.");
			return;
		}
		if (channel === "business" && !payload.business?.companyName.trim()) {
			setMessage("Indica el nombre de tu empresa.");
			return;
		}
		locked.current = true;
		setSubmitting(true);
		const notification = toast.loading("Guardando tu solicitud…");
		try {
			const owner = await requireFormalSubmissionSession(pendingOrderRef.current?.owner);
			if (owner) {
				selectVerifiedDashboardOwner(owner);
				let pending = pendingOrderRef.current;
				if (!pending) {
					const entityId = createLocalId("order");
					pending = {
						entityId,
						operationId: (await queueMutation({
							expectedOwner: owner,
							entityType: "order",
							entityId,
							action: "upsert",
							payload: parsed.data
						})).id,
						owner,
						payload: parsed.data
					};
					rememberPending(pending);
				}
				let receipt = await getOperationStatus(pending.operationId);
				if (receipt.state !== "confirmed") {
					if (formalSubmissionNeedsLogin(await syncNow())) throw new FormalSubmissionAuthError();
					receipt = await getOperationStatus(pending.operationId);
				}
				if (receipt.state !== "confirmed") {
					setMessage(receipt.state === "blocked" ? "El servidor no aceptó la solicitud. Conservamos los datos y la operación; revisa Mi Finca → Sincronización." : "Solicitud conservada en este dispositivo. El servidor todavía no ha confirmado el envío; puedes comprobarlo sin duplicarla.");
					toast.dismiss(notification);
					return;
				}
				setRequestedIds(cart.map((line) => line.id));
				setRequestContact({ ...emptyRequestContact });
				await saveCart([]);
				rememberPending(null);
				clearFormalDraft("order");
				setLoginNeeded(false);
				const text = "Solicitud enviada. Confirmaremos cortes, disponibilidad, precio, peso final y entrega.";
				setMessage(text);
				toast.success(text, { id: notification });
				return;
			}
			const id = createLocalId("order");
			await queueMutation({
				entityType: "order",
				entityId: id,
				action: "upsert",
				payload: parsed.data
			});
			setRequestedIds(cart.map((line) => line.id));
			setRequestContact({ ...emptyRequestContact });
			await saveCart([]);
			let sent = false;
			try {
				await syncNow();
				sent = (await getCachedEntity("order", id))?.syncState === "synced";
			} catch {}
			const text = sent ? "Solicitud enviada. Confirmaremos cortes, disponibilidad, precio, peso final y entrega." : "Solicitud guardada en este dispositivo y pendiente de envío. Al reconectar, abre la app y comprueba su confirmación.";
			setMessage(text);
			toast.success(text, { id: notification });
		} catch (error) {
			const auth = isFormalSubmissionAuthError(error);
			if (auth) setLoginNeeded(true);
			const text = auth ? formalSubmissionError(error) : requiresFormalSession() ? "No pudimos verificar o completar el envío. Tus datos siguen aquí; comprueba la conexión y vuelve a intentarlo." : "No pudimos guardar la solicitud. Tus datos siguen aquí para volver a intentarlo.";
			setMessage(text);
			toast.error(text, { id: notification });
		} finally {
			locked.current = false;
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-[1.8rem] bg-[#211d1a] p-5 text-white sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-kicker text-[#b7d79a]",
					children: "ELIGE, DETALLA Y COTIZA"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display mt-3 text-3xl leading-tight sm:text-4xl",
					children: "Como en tu carnicería. Con el campo más cerca."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-2xl text-sm leading-7 text-white/70",
					children: "Primero elige para quién compras. Después selecciona producto, corte o presentación, cantidad y preparación. Puedes combinar varios cortes en una misma solicitud."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid gap-3 sm:grid-cols-2",
					children: [{
						value: "personal",
						label: "Para mi hogar",
						copy: "Pedidos particulares, pequeñas cantidades y cortes a tu gusto.",
						Icon: PackageCheck
					}, {
						value: "business",
						label: "Para mi negocio",
						copy: "Restaurantes, carnicerías, tiendas, supermercados y distribuidores.",
						Icon: Building2
					}].map(({ value, label, copy, Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						"aria-pressed": channel === value,
						disabled: !ready || submitting || !!pendingOrder,
						onClick: () => changeChannel(value),
						className: `min-w-0 rounded-2xl border p-5 text-left ${channel === value ? "border-[#b7d79a] bg-[#4c6b3a]" : "border-white/20 bg-white/5"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 22 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-3 block font-semibold",
								children: label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-2 block text-sm leading-6 text-white/75",
								children: copy
							})
						]
					}, value))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencyCalculator, {
			title: "Convertir una cotización · USD, EUR, COP y VES",
			description: "Los productos se cotizan según el corte, peso y disponibilidad. Cuando recibas un importe de Parcela Los Morochos, escríbelo aquí para consultar su equivalente aproximado en otra moneda."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-7 flex flex-wrap gap-2",
			children: storeCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"aria-pressed": c === category,
				onClick: () => setCategory(c),
				className: `min-h-11 rounded-full border px-4 py-2 text-sm font-semibold ${c === category ? "bg-[#3e2a19] text-white" : "bg-white text-[#3e2a19]"}`,
				children: c
			}, c))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-xs leading-6 text-[#71685f]",
			children: "Catálogo para consultas. Las líneas en desarrollo y fotografías ilustrativas no representan inventario confirmado."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
			children: filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				id: `producto-${p.id}`,
				className: "scroll-mt-28 relative flex min-w-0 flex-col overflow-hidden rounded-[1.7rem] border bg-white",
				children: [
					p.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: p.image,
						alt: p.imageAlt || `Imagen ilustrativa de ${p.name}`,
						width: p.imageWidth || 640,
						height: p.imageHeight || 426,
						loading: "lazy",
						decoding: "async",
						className: "aspect-[16/10] w-full object-cover"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-28 items-center gap-4 bg-[#e9dfce] px-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-5xl",
							"aria-hidden": "true",
							children: p.emoji
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-semibold text-[#4c6b3a]",
							children: p.category
						})]
					}),
					p.imageCreditId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "px-6 pt-3 text-xs text-[#71685f]",
						children: ["Fotografía ilustrativa · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `/creditos-fotograficos#producto-${p.imageCreditId}`,
							className: "relative z-10 underline",
							children: "Créditos y licencia"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-1 flex-col p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-[#6b4a2f]",
								children: p.stage
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 text-2xl font-semibold",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-7 text-[#71685f]",
								children: p.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-4 flex-1 text-xs leading-6 text-[#4c6b3a]",
								children: [p.presentations.slice(0, 4).join(" · "), p.presentations.length > 4 ? " · y más" : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm font-semibold text-[#4c6b3a]",
								children: "Precio y disponibilidad por consultar"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteConversion, { context: p.name }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								disabled: !ready || submitting || !!pendingOrder,
								onClick: () => setDraft({ product: p }),
								className: "stretched-card-action button-dark mt-5 w-full",
								children: ["Elegir presentación", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 16 })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextualWhatsAppContact, {
								context: `${p.name} · Tienda Parcela Los Morochos`,
								unavailableMessage: "La tienda todavía no tiene un WhatsApp comercial publicado. Usa Elegir presentación para preparar tu solicitud.",
								className: "relative z-10 mt-4"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageShareButton, {
								content: storeImageContent(p),
								className: "button-light relative z-10 mt-3 w-full"
							})
						]
					})
				]
			}, p.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: !!draft,
			onOpenChange: (v) => !v && setDraft(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "bg-[#f8f3ea] sm:max-w-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "font-display text-3xl",
						children: draft?.product.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Indica exactamente qué necesitas. El precio y la disponibilidad se confirman antes de comprar." }),
					draft && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductConfiguration, {
						draft,
						onSave: saveLine
					}, `${draft.product.id}-${draft.index ?? "new"}`)
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
			open,
			onOpenChange: (next) => {
				if (!locked.current) setOpen(next);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					"aria-label": `${channel === "business" ? "Abrir cotización" : "Abrir solicitud"}: ${cart.length} ${cart.length === 1 ? "producto" : "productos"}`,
					className: "store-request-trigger fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+7rem)] right-3 z-[91] flex min-h-14 items-center gap-3 rounded-full bg-[#3e2a19] px-5 text-sm font-bold text-white shadow-2xl sm:right-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { size: 19 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "store-request-label",
							children: channel === "business" ? "Cotización" : "Solicitud"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "store-request-count rounded-full bg-[#f3ebdd] px-2 py-1 text-xs text-[#3e2a19]",
							children: cart.length
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
				className: "w-full overflow-y-auto overscroll-contain bg-[#f8f3ea] sm:max-w-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
						className: "border-b p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
							className: "font-display text-3xl",
							children: channel === "business" ? "Abastece tu negocio" : "Tu solicitud de productos"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Revisa cada corte y cantidad. No se realizará ningún cobro automático." })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4 px-5 py-6 sm:px-6",
						children: !cart.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-dashed p-6 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Elige productos para comenzar tu solicitud." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setOpen(false),
								className: "button-dark mt-4",
								children: "Volver al catálogo"
							})]
						}) : cart.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-2xl border bg-white p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "break-words font-semibold",
												children: l.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 break-words text-sm",
												children: l.presentation
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-2 text-lg font-semibold text-[#4c6b3a]",
												children: [
													l.quantity,
													" ",
													l.measure
												]
											}),
											l.preparation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-xs",
												children: l.preparation
											}),
											l.specifications && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 whitespace-pre-wrap break-words text-xs leading-6",
												children: l.specifications
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										disabled: submitting || !!pendingOrder,
										onClick: () => void saveCart(cart.filter((_, index) => i !== index)),
										className: "flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f3ebdd] text-[#922a21]",
										"aria-label": `Eliminar ${l.presentation}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 17 })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm font-semibold text-[#4c6b3a]",
									children: "Precio por confirmar · sin total calculado"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteConversion, { context: `${l.name} · ${l.presentation} · ${l.quantity} ${l.measure}` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									disabled: submitting || !!pendingOrder,
									onClick: () => {
										setOpen(false);
										setDraft({
											product: storeProducts.find((p) => p.id === l.id),
											line: l,
											index: i
										});
									},
									className: "mt-3 inline-flex min-h-11 items-center gap-2 text-sm underline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { size: 14 }), "Editar corte y cantidad"]
								})
							]
						}, `${l.id}-${i}`))
					}),
					!!cart.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submitRequest,
						className: "store-request-form min-w-0 space-y-4 px-5 pb-8 sm:px-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormalSubmissionNotice, {
								onLogin: beginLogin,
								loginNeeded
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
								disabled: submitting || !!pendingOrder,
								className: "min-w-0 space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-semibold",
										children: "¿A quién contactamos?"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-sm font-semibold",
										children: ["Nombre del responsable *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											name: "name",
											...contactField("name"),
											required: true,
											minLength: 2,
											maxLength: 120,
											className: "mt-2 h-12",
											autoComplete: "name"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-sm font-semibold",
										children: ["Celular / WhatsApp *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											name: "phone",
											...contactField("phone"),
											type: "tel",
											required: true,
											pattern: "[+0-9 ().-]{7,40}",
											maxLength: 40,
											className: "mt-2 h-12",
											autoComplete: "tel",
											placeholder: "+58 412 123 4567"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-sm font-semibold",
										children: ["Correo (opcional)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											name: "email",
											...contactField("email"),
											type: "email",
											maxLength: 180,
											className: "mt-2 h-12",
											autoComplete: "email"
										})]
									}),
									channel === "business" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
										className: "rounded-2xl border bg-[#edf3e7] p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", { children: "Datos de tu negocio" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-4",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "block text-sm font-semibold",
													children: ["Nombre de la empresa *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														name: "companyName",
														...contactField("companyName"),
														required: true,
														maxLength: 180,
														className: "mt-2 h-12"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "block text-sm font-semibold",
													children: ["Tipo de negocio *", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
														name: "companyType",
														...contactField("companyType"),
														required: true,
														className: "mt-2 h-12 w-full rounded-xl border px-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "",
															children: "Selecciona"
														}), [
															"Restaurante",
															"Carnicería",
															"Supermercado",
															"Tienda de alimentos",
															"Distribuidor",
															"Cafetería",
															"Transformador / industria",
															"Otro negocio"
														].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: v }, v))]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "block text-sm font-semibold",
													children: ["RIF (opcional)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														name: "taxId",
														...contactField("taxId"),
														maxLength: 80,
														className: "mt-2 h-12"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "block text-sm font-semibold",
													children: ["Ciudad y estado de entrega *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														name: "deliveryLocation",
														...contactField("deliveryLocation"),
														required: true,
														maxLength: 220,
														className: "mt-2 h-12"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "block text-sm font-semibold",
													children: ["Frecuencia", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
														name: "frequency",
														...contactField("frequency"),
														className: "mt-2 h-12 w-full rounded-xl border px-3",
														children: [
															"Única",
															"Semanal",
															"Quincenal",
															"Mensual",
															"A convenir"
														].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: v }, v))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "block text-sm font-semibold",
													children: ["Fecha requerida", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														name: "requiredDate",
														...contactField("requiredDate"),
														type: "date",
														className: "mt-2 h-12"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "block text-sm font-semibold",
													children: ["Entrega", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
														name: "deliveryMode",
														...contactField("deliveryMode"),
														className: "mt-2 h-12 w-full rounded-xl border px-3",
														children: [
															"A convenir",
															"Retiro en finca",
															"Entrega al negocio · consultar cobertura"
														].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: v }, v))
													})]
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-sm font-semibold",
										children: ["Destino, fecha y otras indicaciones", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											name: "note",
											...contactField("note"),
											maxLength: 1200,
											className: "mt-2",
											placeholder: "Ciudad, fecha, empaque, conservación o logística que necesitas."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-start gap-2 rounded-xl bg-[#e8f0df] p-4 text-xs leading-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, {
											size: 18,
											className: "mt-1 shrink-0"
										}), "Después de preparar tu dispositivo, puedes guardar sin señal. El envío formal necesita internet y, en la web con Google, una sesión. La confirmación comercial llega después."]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "button-dark w-full",
								disabled: submitting,
								children: submitting ? "Comprobando…" : pendingOrder ? "Comprobar solicitud pendiente" : channel === "business" ? "Solicitar cotización empresarial" : "Solicitar disponibilidad"
							})
						]
					}),
					!!requestedIds.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mx-5 mb-5 rounded-2xl border bg-[#edf3e7] p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold",
								children: "También puedes consultar"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-6",
								children: "Sugerencias según tu solicitud. Son consultas nuevas; no se añaden ni envían automáticamente. Disponibilidad por confirmar."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 space-y-3",
								children: relatedStoreProducts(requestedIds).map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: submitting || !!pendingOrder,
									onClick: () => {
										setOpen(false);
										setDraft({ product });
									},
									className: "flex min-h-16 w-full items-center gap-3 rounded-xl bg-white p-3 text-left",
									children: [product.image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: product.image,
										alt: product.imageAlt || product.name,
										width: 56,
										height: 56,
										className: "size-14 rounded-lg object-cover",
										loading: "lazy"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm font-semibold",
										children: [product.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
											className: "mt-1 block font-normal",
											children: [product.stage, " · Elegir presentación"]
										})]
									})]
								}, product.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mt-3 min-h-11 text-xs underline",
								onClick: () => setRequestedIds([]),
								children: "Ocultar sugerencias"
							})
						]
					}),
					message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						"aria-live": "polite",
						className: "mx-5 mb-8 rounded-xl bg-white p-4 text-sm leading-7",
						children: message
					})
				]
			})]
		})
	] });
}
function ProductConfiguration({ draft: { product: p, line, index }, onSave }) {
	const [measure, setMeasure] = (0, import_react.useState)(line?.measure || p.units[0]), [quantity, setQuantity] = (0, import_react.useState)(String(line?.quantity || defaultQuantity(p.units[0]))), [notice, setNotice] = (0, import_react.useState)("");
	const presentations = [...p.presentations, ...line && !p.presentations.includes(line.presentation) ? [line.presentation] : []];
	const measures = [...p.units, ...line && !p.units.includes(line.measure) ? [line.measure] : []];
	const r = unitRule(measure);
	function submit(e) {
		e.preventDefault();
		const f = new FormData(e.currentTarget);
		const amount = Number(quantity);
		if (!validStoreQuantity(amount, measure)) {
			setNotice("Revisa la cantidad: las unidades, animales, dosis y lotes se solicitan como números enteros.");
			return;
		}
		const presentation = String(f.get("presentation") || "");
		if (/Plántula/.test(presentation) && measure !== "unidad") {
			setNotice("Para solicitar plantas, selecciona la unidad «unidad».");
			return;
		}
		onSave({
			id: p.id,
			name: p.name,
			quantity: amount,
			presentation,
			measure,
			preparation: String(f.get("preparation") || ""),
			specifications: String(f.get("specifications") || "")
		}, index);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold text-[#4c6b3a]",
			children: "Precio y disponibilidad por consultar"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteConversion, { context: `${p.name} · ${quantity} ${measure}` }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "min-w-0 space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm font-semibold",
					children: ["Corte, producto o presentación *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						name: "presentation",
						defaultValue: line?.presentation || p.presentations[0],
						className: "mt-2 h-12 w-full rounded-xl border px-3",
						children: presentations.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: v }, v))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: ["Unidad", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: measure,
							onChange: (e) => {
								setMeasure(e.target.value);
								setQuantity(String(defaultQuantity(e.target.value)));
							},
							className: "mt-2 h-12 w-full rounded-xl border px-3",
							children: measures.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: v }, v))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: ["Cantidad *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							inputMode: "decimal",
							required: true,
							min: r.min,
							step: r.step,
							max: 1e6,
							value: quantity,
							onChange: (e) => setQuantity(e.target.value),
							className: "mt-2 h-12"
						})]
					})]
				}),
				measure === "g" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						200,
						500,
						1e3
					].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setQuantity(String(n)),
						className: "min-h-11 rounded-full border px-4 text-sm",
						children: [n, " g"]
					}, n))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm font-semibold",
					children: ["Preparación o propósito", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						name: "preparation",
						defaultValue: line?.preparation || p.preparations[0],
						className: "mt-2 h-12 w-full rounded-xl border px-3",
						children: [...p.preparations, ...line?.preparation && !p.preparations.includes(line.preparation) ? [line.preparation] : []].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: v }, v))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm font-semibold",
					children: ["Detalles de este producto", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						name: "specifications",
						defaultValue: line?.specifications || "",
						maxLength: 600,
						className: "mt-2",
						placeholder: "Otro corte, especie, raza, peso por animal, tamaño de empaque o preferencias…"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-xl bg-[#e8f0df] p-4 text-xs leading-6 text-[#365026]",
					children: [p.hint, measure === "arroba" ? " Para arrobas indica en los detalles el peso equivalente acordado en kg." : measure === "lote" ? " Indica cuántos animales o productos incluye cada lote." : ""]
				}),
				notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-sm text-[#922a21]",
					children: notice
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button-dark w-full",
					children: index === void 0 ? "Agregar a mi solicitud" : "Guardar cambios"
				})
			]
		})
	] });
}
//#endregion
export { StoreCatalog };
