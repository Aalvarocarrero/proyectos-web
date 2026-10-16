import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { d as stringType, l as objectType, n as arrayType } from "./types-nz7Y6Ylx.js";
import { l as formatMoney } from "./exchange-rates-Dh445WGD.js";
import { a as readListingContact, i as phoneDigits } from "./whatsapp-contact-D2hkSaZs.js";
import { d as sellerIdentity, f as whatsappAvailabilityUrl, h as listingPhotoUrl, i as listingPhotos, l as relatedMarketplaceListings, n as legacyListingContactText, o as marketplacePath, r as listingDetails, s as productAttributeFields, t as availabilityMessage } from "./marketplace-details-Bh_zF0oZ.js";
import { p as verifySyncOwner, s as localOwner } from "./offline-account-boundary-hnu6xdcm.js";
import { t as createLucideIcon } from "./createLucideIcon-ZIVktEBq.js";
import { i as DialogDescription, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BB9AB3vt.js";
import { t as ArrowRight } from "./arrow-right-BK-E7gK8.js";
import { n as MarketplacePhoto, t as Store } from "./store-4WcoluRr.js";
import { t as PriceConversion } from "./price-conversion-RjpQe0IX.js";
import { t as QuoteConversion } from "./quote-conversion-Bk1UoxEX.js";
import { t as MessageCircle } from "./message-circle-BeenzVnM.js";
import { n as ImageSharePanel } from "./image-share-OFqHbnpR.js";
import { t as Share2 } from "./share-2-hETJIGMl.js";
import { i as marketplaceImageContent } from "./public-image-content-8oZuiwD9.js";
import { t as MapPin } from "./map-pin-CLoB_NAM.js";
import { t as Phone } from "./phone-CjU-4AYr.js";
import { t as Link } from "./link-CTsUsqTe.js";
import { t as Heart } from "./heart-DLhONV2f.js";
import { t as Tractor } from "./tractor-urrd7JYo.js";
import { t as AgroCategoryIcon } from "./agro-category-icon-BvENtu1T.js";
import { t as ChevronRight } from "./chevron-right-DEW50sAS.js";
import { t as UserRound } from "./user-round-BrCc97k9.js";
import { n as ZoomIn, t as ZoomOut } from "./zoom-out-BR-YrpgZ.js";
import { n as MarketplaceLocation } from "./marketplace-location-N3zgKCBC.js";
//#region components/listing-price.tsx
var import_jsx_runtime = require_jsx_runtime();
function listingUpdateLabel(listing) {
	if (listing.demo) return "Datos ficticios";
	if (!listing.serverUpdatedAt || !Number.isFinite(Date.parse(listing.serverUpdatedAt))) return "Fecha de actualización no indicada";
	return `Anuncio actualizado: ${new Intl.DateTimeFormat("es-VE", {
		timeZone: "America/Caracas",
		dateStyle: "short"
	}).format(new Date(listing.serverUpdatedAt))}`;
}
function ListingPrice({ listing, conversion = true, showUpdated = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 min-w-0",
		children: [listing.priceCents != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xl font-bold",
			children: [formatMoney(listing.priceCents / 100, listing.currency || "USD"), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "ml-2 text-sm font-medium text-[#675f57]",
				children: ["por ", listing.supplyUnit || "unidad"]
			})]
		}), conversion && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceConversion, {
			amount: listing.priceCents / 100,
			currency: listing.currency || "USD",
			unit: listing.supplyUnit || "unidad",
			showBasePrices: true
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold text-[#4c6b3a]",
			children: "Precio y disponibilidad por consultar"
		}), conversion && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteConversion, {
			context: listing.title,
			demo: listing.demo
		})] }), showUpdated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-xs leading-5 text-[#71685f]",
			children: [listingUpdateLabel(listing), listing.priceCents != null && !listing.demo ? " · Precio declarado por el vendedor." : ""]
		})]
	});
}
//#endregion
//#region components/marketplace-related-card.tsx
/** Shared by the detail dialog and permanent listing page. Keep the action in
* a growing column's footer so variable-length copy never moves it out of line. */
function MarketplaceRelatedCard({ listing, onSelect }) {
	const photo = listingPhotos(listing)[0];
	const actionClass = "button-light w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4c6b3a]";
	const actionLabel = `Ver anuncio: ${listing.title}`;
	const actionContent = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Ver anuncio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
		size: 17,
		"aria-hidden": "true"
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ded2c1] bg-white [overflow-wrap:anywhere]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[16/10] shrink-0 overflow-hidden bg-[#f3eee5]",
			children: [photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: photo.src,
				alt: photo.alt,
				width: 400,
				height: 250,
				loading: "lazy",
				className: `h-full w-full ${listing.imageFit === "contain" ? "object-contain" : "object-cover"}`
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-full flex-col items-center justify-center gap-2 text-[#71685f]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, {
					category: listing.category,
					size: 36
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs",
					children: "Sin fotografía"
				})]
			}), listing.demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute left-3 top-3 rounded-full bg-[#211d1a]/90 px-3 py-1 text-[10px] font-bold tracking-wider text-white",
				children: "DEMO"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col p-4 sm:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-[#4c6b3a]",
					children: listing.category
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-2 text-base font-semibold leading-6 text-[#211d1a]",
					children: listing.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-2 text-xs leading-5 text-[#71685f]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, {
							size: 15,
							className: "mt-0.5 shrink-0",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: listing.sellerName })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
							size: 15,
							className: "mt-0.5 shrink-0",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: listing.location })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingPrice, { listing }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-auto pt-5",
					children: onSelect ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: actionClass,
						"aria-label": actionLabel,
						onClick: () => onSelect(listing),
						children: actionContent
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						href: marketplacePath(listing),
						className: actionClass,
						"aria-label": actionLabel,
						children: actionContent
					})
				})
			]
		})]
	});
}
//#endregion
//#region ../venezuela-agro-auth/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChevronLeft = createLucideIcon("chevron-left", [["path", {
	d: "m15 18-6-6 6-6",
	key: "1wnfg3"
}]]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Expand = createLucideIcon("expand", [
	["path", {
		d: "m15 15 6 6",
		key: "1s409w"
	}],
	["path", {
		d: "m15 9 6-6",
		key: "ko1vev"
	}],
	["path", {
		d: "M21 16v5h-5",
		key: "1ck2sf"
	}],
	["path", {
		d: "M21 8V3h-5",
		key: "1qoq8a"
	}],
	["path", {
		d: "M3 16v5h5",
		key: "1t08am"
	}],
	["path", {
		d: "m3 21 6-6",
		key: "wwnumi"
	}],
	["path", {
		d: "M3 8V3h5",
		key: "1ln10m"
	}],
	["path", {
		d: "M9 9 3 3",
		key: "v551iv"
	}]
]);
//#endregion
//#region components/marketplace-gallery.tsx
function MarketplaceGallery({ photos, title, demo = false, hero = false }) {
	const [index, setIndex] = (0, import_react.useState)(0), [open, setOpen] = (0, import_react.useState)(false), [zoom, setZoom] = (0, import_react.useState)(false);
	const start = (0, import_react.useRef)(null), swiped = (0, import_react.useRef)(false);
	const current = photos[index] || photos[0];
	const move = (delta) => {
		setIndex((i) => (i + delta + photos.length) % photos.length);
		setZoom(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": `Fotografías de ${title}`,
		className: "min-w-0",
		onKeyDown: (e) => {
			if (photos.length > 1) {
				if (e.key === "ArrowLeft") {
					e.preventDefault();
					move(-1);
				}
				if (e.key === "ArrowRight") {
					e.preventDefault();
					move(1);
				}
			}
		},
		tabIndex: 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `relative flex w-full items-center overflow-hidden rounded-[1.6rem] bg-[#e8dece] ${hero ? "aspect-[4/3] max-h-[420px] sm:aspect-[16/7]" : "aspect-[4/3]"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplacePhoto, {
					src: current?.src,
					alt: current?.alt || title,
					fit: hero ? "contain" : "cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-label": "Ampliar fotografía del producto",
					onPointerDown: (e) => {
						start.current = {
							x: e.clientX,
							y: e.clientY
						};
						swiped.current = false;
					},
					onPointerUp: (e) => {
						const p = start.current;
						start.current = null;
						if (p && photos.length > 1 && Math.abs(e.clientX - p.x) > 45 && Math.abs(e.clientX - p.x) > Math.abs(e.clientY - p.y)) {
							move(e.clientX < p.x ? 1 : -1);
							swiped.current = true;
						}
					},
					onClick: () => {
						if (swiped.current) {
							swiped.current = false;
							return;
						}
						setZoom(false);
						setOpen(true);
					},
					style: { touchAction: "pan-y" },
					className: "absolute inset-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/75 px-3 py-2 text-xs text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Expand, { size: 16 }), "Ampliar"]
					}), demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute left-3 top-3 rounded-full bg-black/75 px-3 py-2 text-xs font-bold text-white",
						children: "DEMOSTRACIÓN"
					})]
				})]
			}),
			photos.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => move(-1),
						"aria-label": "Fotografía anterior",
						className: "flex size-11 shrink-0 items-center justify-center rounded-full border bg-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex min-w-0 flex-1 gap-2 overflow-x-auto",
						children: photos.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Ver fotografía ${i + 1}`,
							"aria-pressed": i === index,
							onClick: () => {
								setIndex(i);
								setZoom(false);
							},
							className: `size-16 shrink-0 overflow-hidden rounded-xl border-2 ${i === index ? "border-[#4c6b3a]" : "border-transparent"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: p.src,
								alt: p.alt,
								width: 64,
								height: 64,
								className: "size-full object-cover",
								loading: "lazy"
							})
						}, p.src))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => move(1),
						"aria-label": "Fotografía siguiente",
						className: "flex size-11 shrink-0 items-center justify-center rounded-full border bg-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs leading-5 text-[#71685f]",
				"aria-live": "polite",
				children: [
					photos.length ? `${index + 1} / ${photos.length}` : "Sin fotografía",
					current?.caption ? ` · ${current.caption}` : "",
					" ",
					current?.creditHref && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: current.creditHref,
						className: "underline",
						children: "Fuente y licencia"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: (v) => {
					setOpen(v);
					setZoom(false);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[94dvh] overflow-y-auto bg-[#f8f3ea] sm:max-w-5xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: title }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [demo ? "Fotografías ilustrativas de demostración." : "Fotografías declaradas por el anunciante.", " Usa Ampliar para ver los detalles y desplázate por la imagen."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-[64dvh] overflow-auto rounded-xl bg-[#e8dece]",
							tabIndex: 0,
							"aria-label": "Imagen ampliada; desplázate para ver sus detalles",
							children: current && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: current.src,
								alt: current.alt,
								style: {
									width: zoom ? "160%" : "100%",
									maxWidth: zoom ? "none" : "100%"
								},
								className: "mx-auto object-contain"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: photos.length < 2,
									onClick: () => move(-1),
									className: "button-light",
									"aria-label": "Foto anterior en vista ampliada",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setZoom((v) => !v),
									className: "button-light",
									children: [
										zoom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { size: 18 }),
										" ",
										zoom ? "Ajustar" : "Ampliar 160%"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: photos.length < 2,
									onClick: () => move(1),
									className: "button-light",
									"aria-label": "Foto siguiente en vista ampliada",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})
								})
							]
						})
					]
				})
			})
		]
	});
}
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Bookmark = createLucideIcon("bookmark", [["path", {
	d: "M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",
	key: "oz39mx"
}]]);
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Bell = createLucideIcon("bell", [["path", {
	d: "M10.268 21a2 2 0 0 0 3.464 0",
	key: "vwvbt9"
}], ["path", {
	d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
	key: "11g9vi"
}]]);
//#endregion
//#region lib/marketplace-owner.ts
/** Never keep using a previous signed-in account after an online account switch. */
async function marketplaceOwner() {
	const owner = await localOwner();
	if (navigator.onLine && !await verifySyncOwner(owner)) throw new Error("account_changed_or_unverified");
	return owner;
}
//#endregion
//#region lib/marketplace-preferences.ts
var follow = objectType({
	sellerKey: stringType().max(400),
	sellerName: stringType().max(180),
	seenIds: arrayType(stringType().max(160)).max(200)
});
var marketPreferencesSchema = objectType({
	saved: arrayType(stringType().max(160)).max(300).default([]),
	following: arrayType(follow).max(100).default([])
});
function marketPreferenceKey(owner) {
	return `venezuela-agro-market-preferences:v1:${encodeURIComponent(owner)}`;
}
function readMarketPreferences(storage, owner) {
	try {
		const raw = JSON.parse(storage.getItem(marketPreferenceKey(owner)) || "{}");
		return marketPreferencesSchema.parse(raw);
	} catch {
		return {
			saved: [],
			following: []
		};
	}
}
function writeMarketPreferences(storage, owner, prefs) {
	const text = JSON.stringify(marketPreferencesSchema.parse(prefs));
	storage.setItem(marketPreferenceKey(owner), text);
	if (storage.getItem(marketPreferenceKey(owner)) !== text) throw new Error("storage_not_confirmed");
}
function followUpdates(prefs, rows) {
	return rows.filter((row) => !row.demo && prefs.following.some((f) => f.sellerKey === sellerIdentity(row) && !f.seenIds.includes(row.id)));
}
//#endregion
//#region components/marketplace-actions.tsx
function MarketplaceActions({ listing, rows = [] }) {
	const [saved, setSaved] = (0, import_react.useState)(false), [following, setFollowing] = (0, import_react.useState)(false), [notice, setNotice] = (0, import_react.useState)(""), [panel, setPanel] = (0, import_react.useState)(null), [amount, setAmount] = (0, import_react.useState)(""), [note, setNote] = (0, import_react.useState)("");
	const lock = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		let active = true, readEpoch = 0;
		const load = () => {
			const epoch = ++readEpoch;
			marketplaceOwner().then((owner) => {
				if (!active || epoch !== readEpoch) return;
				const prefs = readMarketPreferences(localStorage, owner);
				setSaved(prefs.saved.includes(listing.id));
				setFollowing(prefs.following.some((f) => f.sellerKey === sellerIdentity(listing)));
			}).catch(() => {
				if (active && epoch === readEpoch) {
					setSaved(false);
					setFollowing(false);
				}
			});
		};
		load();
		window.addEventListener("focus", load);
		window.addEventListener("market-preferences-changed", load);
		return () => {
			active = false;
			window.removeEventListener("focus", load);
			window.removeEventListener("market-preferences-changed", load);
		};
	}, [listing]);
	async function preference(kind) {
		if (lock.current) return;
		lock.current = true;
		try {
			const owner = await marketplaceOwner(), prefs = readMarketPreferences(localStorage, owner);
			if (kind === "save") {
				const exists = prefs.saved.includes(listing.id);
				prefs.saved = exists ? prefs.saved.filter((id) => id !== listing.id) : [...prefs.saved, listing.id];
				writeMarketPreferences(localStorage, owner, prefs);
				setSaved(!exists);
				setNotice(exists ? "Quitado de tus guardados de este navegador." : "Guardado solo en este navegador y espacio de cuenta.");
			} else {
				const key = sellerIdentity(listing), exists = prefs.following.some((f) => f.sellerKey === key);
				prefs.following = exists ? prefs.following.filter((f) => f.sellerKey !== key) : [...prefs.following, {
					sellerKey: key,
					sellerName: listing.sellerName,
					seenIds: [...new Set([listing.id, ...rows.filter((r) => sellerIdentity(r) === key).map((r) => r.id)])].slice(0, 200)
				}];
				writeMarketPreferences(localStorage, owner, prefs);
				setFollowing(!exists);
				setNotice(exists ? "Avisos internos desactivados." : "Te mostraremos anuncios nuevos al abrir o actualizar Mercado Agro en este navegador. No envía correo, SMS ni avisos push.");
			}
			window.dispatchEvent(new Event("market-preferences-changed"));
		} catch {
			setNotice("No se pudo guardar esta preferencia. Reabre la página si cambiaste de cuenta y revisa el almacenamiento del navegador.");
		} finally {
			lock.current = false;
		}
	}
	const validAmount = Number(amount) > 0 && Number.isFinite(Number(amount)) && Number(amount) <= 2e7;
	const offer = {
		amount,
		currency: listing.currency || "USD",
		note: note.trim()
	};
	const offerUrl = validAmount ? whatsappAvailabilityUrl(listing, offer) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void preference("save"),
						"aria-pressed": saved,
						className: "button-light",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, {
							size: 17,
							fill: saved ? "currentColor" : "none"
						}), saved ? "Guardado" : "Guardar"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setPanel("share"),
						className: "button-light",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { size: 17 }), "Compartir"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setPanel("offer"),
						className: "button-light",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { size: 17 }), "Preparar oferta"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void preference("follow"),
						"aria-pressed": following,
						className: "button-light",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { size: 17 }), following ? "Siguiendo vendedor" : "Avisarme de novedades"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				"aria-live": "polite",
				className: "mt-3 break-words text-xs leading-6 text-[#4c6b3a]",
				children: notice || "Guardados y avisos se conservan en este navegador. Las ofertas se revisan antes de enviarlas."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: panel !== null,
				onOpenChange: (v) => {
					if (!v) setPanel(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90dvh] overflow-y-auto bg-[#f8f3ea] sm:max-w-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: panel === "share" ? "Comparte este anuncio" : "Prepara una consulta de oferta" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: panel === "share" ? "Revisa la imagen y elige dónde enviarla. La publicación final siempre la confirmas tú." : "Indica tu propuesta. No se envía automáticamente ni crea una compra." }),
						panel === "share" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageSharePanel, { content: marketplaceImageContent(listing) }),
							listing.demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl bg-[#f4e3ce] p-4 text-sm",
								children: "Este anuncio es ficticio. Puedes probar las imágenes y compartir su vista previa, pero no publicarlo como una venta real en la comunidad."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								className: "button-light",
								href: `/red?anuncio=${encodeURIComponent(listing.id)}#crear-novedad`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { size: 17 }), "Preparar publicación en comunidad"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs leading-6",
								children: "La comunidad conserva sus Me gusta y comentarios. Necesitas una finca pública activa y la publicación pasa por revisión."
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm font-semibold",
								children: [
									"Importe propuesto · ",
									offer.currency,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: amount,
										onChange: (e) => setAmount(e.target.value),
										type: "number",
										min: "0.01",
										max: "20000000",
										step: "0.01",
										inputMode: "decimal",
										className: "mt-2 h-12 w-full rounded-xl border bg-white px-3"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-w-0",
								children: validAmount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceConversion, {
									amount: Number(amount),
									currency: offer.currency
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm font-semibold",
								children: ["Cantidad, entrega y condiciones", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									maxLength: 400,
									value: note,
									onChange: (e) => setNote(e.target.value),
									className: "mt-2 min-h-24 w-full rounded-xl border bg-white p-3"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl bg-white p-4 text-sm leading-7",
								children: availabilityMessage(listing.title, validAmount ? offer : void 0)
							}),
							offerUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: offerUrl,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "button-dark",
								children: "Revisar en WhatsApp antes de enviar"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-6",
								children: listing.demo ? "Demostración: no existe un vendedor real ni se envía la oferta." : !validAmount ? "Introduce un importe válido para preparar la consulta." : "Este anunciante no habilitó WhatsApp. Consulta sus datos de contacto."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "button-light",
								onClick: () => setPanel(null),
								children: "Cerrar sin enviar"
							})
						] })
					]
				})
			})
		]
	});
}
/**
* @license lucide-react v1.31.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ExternalLink = createLucideIcon("external-link", [
	["path", {
		d: "M15 3h6v6",
		key: "1q9fwt"
	}],
	["path", {
		d: "M10 14 21 3",
		key: "gplh6r"
	}],
	["path", {
		d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
		key: "a6xqqp"
	}]
]);
//#endregion
//#region components/listing-whatsapp-contact.tsx
function ListingWhatsAppContact({ productTitle, contact, contactProfile, demo = false }) {
	const [preview, setPreview] = (0, import_react.useState)(false);
	const explanationId = (0, import_react.useId)();
	const profile = demo ? null : readListingContact(contact, contactProfile);
	const href = whatsappAvailabilityUrl({
		title: productTitle,
		contact,
		contactProfile,
		demo
	});
	const actionClass = "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#176b3b] px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[#12562f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176b3b]";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		"data-marketplace-contact": "whatsapp",
		children: [
			demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: actionClass,
				"aria-haspopup": "dialog",
				"aria-describedby": explanationId,
				onClick: () => setPreview(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
					size: 21,
					"aria-hidden": "true",
					className: "shrink-0"
				}), "WhatsApp · Ejemplo"]
			}) : href ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href,
				target: "_blank",
				rel: "noopener noreferrer",
				className: actionClass,
				"aria-describedby": explanationId,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
					size: 21,
					"aria-hidden": "true",
					className: "shrink-0"
				}), "Hablar con el vendedor por WhatsApp"]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled: true,
				"aria-describedby": explanationId,
				className: "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#3e2a19]/20 bg-[#eee8dd] px-4 py-3 text-sm font-semibold text-[#5f574f]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
					size: 21,
					"aria-hidden": "true",
					className: "shrink-0"
				}), "WhatsApp no disponible"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: explanationId,
				className: "mt-2 text-xs leading-5 text-[#5f574f]",
				children: demo ? "Mira el mensaje de ejemplo. No hay un vendedor real ni se envía nada." : href ? "Abre el mensaje de disponibilidad. Tú decides si lo envías en WhatsApp." : !profile ? "Este anunciante todavía no tiene un teléfono público registrado. Revisa sus datos de contacto." : !profile.whatsapp ? "El anunciante no habilitó WhatsApp. Puedes usar el teléfono de su ficha." : "El teléfono registrado necesita un código de país válido para abrir WhatsApp."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: preview,
				onOpenChange: setPreview,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90dvh] overflow-y-auto bg-[#f8f3ea] sm:max-w-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "WhatsApp · Mensaje de ejemplo" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Así se prepara la consulta de disponibilidad en un anuncio real. Esta demostración no tiene destinatario." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-xl bg-white p-4 text-sm leading-7",
							children: availabilityMessage(productTitle)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-6 text-[#5f574f]",
							children: "Cuando el vendedor registra su teléfono y habilita WhatsApp, este botón abre su conversación con el mensaje listo para revisar."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "button-light",
							onClick: () => setPreview(false),
							children: "Cerrar ejemplo"
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region components/listing-contact-card.tsx
function ListingContactCard({ sellerName, contact, contactProfile, location, demo = false, productTitle = "anunciado" }) {
	const profile = demo ? null : readListingContact(contact, contactProfile);
	const links = profile ? [
		["Instagram", profile.instagram],
		["Facebook", profile.facebook],
		["TikTok", profile.tiktok],
		["YouTube", profile.youtube],
		["Google Mi Negocio / Maps", profile.googleBusiness],
		["Sitio web", profile.website]
	].filter(([, href]) => href) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Datos de contacto del anunciante",
		className: "mt-5 min-w-0 rounded-2xl border border-[#3e2a19]/10 bg-white p-4 text-sm sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold text-[#3e2a19]",
				children: "Contacto del anunciante"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid min-w-0 gap-3 text-[#5f574f]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
						className: "flex items-center gap-2 text-xs text-[#71685f]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { size: 15 }), " Responsable"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 break-words font-semibold",
						children: profile?.responsibleName || (demo ? "Nombre del responsable · ejemplo" : sellerName)
					})] }),
					(profile?.farmName || demo) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
						className: "flex items-center gap-2 text-xs text-[#71685f]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tractor, { size: 15 }), " Finca o negocio"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 break-words",
						children: profile?.farmName || "Nombre de la finca · opcional"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
						className: "flex items-center gap-2 text-xs text-[#71685f]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 15 }), " Ubicación"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 break-words",
						children: location
					})] }),
					profile?.advertiserType && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-[#71685f]",
						children: "Tipo de anunciante"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: profile.advertiserType })] }),
					profile?.contactHours && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-[#71685f]",
						children: "Horario de contacto"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "break-words",
						children: profile.contactHours
					})] }),
					profile?.deliveryMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-[#71685f]",
						children: "Entrega"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: profile.deliveryMode })] })
				]
			}),
			profile && !demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: `tel:+${phoneDigits(profile.phone)}`,
					className: "flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3e2a19] px-3 py-3 font-semibold text-white",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { size: 17 }),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "break-all",
							children: profile.phone
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 break-words rounded-xl bg-[#f3ebdd] p-3 text-xs leading-6",
				children: demo ? "Teléfono del responsable · obligatorio al publicar. Esta muestra no contiene datos personales reales." : legacyListingContactText(contact) || "Este anuncio anterior no tiene un teléfono público registrado."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingWhatsAppContact, {
					productTitle,
					contact,
					contactProfile,
					demo
				})
			}),
			links.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Redes y enlaces del anunciante",
				className: "mt-4 grid gap-2 sm:grid-cols-2",
				children: links.map(([label, href]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href,
					target: "_blank",
					rel: "noopener noreferrer",
					className: "flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-xl border border-[#3e2a19]/10 px-3 py-2 text-xs font-semibold text-[#365026]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
						size: 14,
						className: "shrink-0"
					})]
				}, label))
			}),
			demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-[#71685f]",
				children: "El anunciante podrá añadir sus redes sociales, Google Mi Negocio, horario y modalidad de entrega."
			})
		]
	});
}
//#endregion
//#region components/marketplace-detail.tsx
function MarketplaceDetail({ listing, rows = [], onSelect, heading = true }) {
	const details = listingDetails(listing), profile = listing.demo ? null : readListingContact(listing.contact, listing.contactProfile), related = relatedMarketplaceListings(listing, rows), sellerImage = listing.demo ? listing.demoSellerImage : listingPhotoUrl(details.sellerImageKey);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 [overflow-wrap:anywhere]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplaceGallery, {
				photos: listingPhotos(listing),
				title: listing.title,
				demo: listing.demo,
				hero: true
			}, listing.id),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mt-5 grid items-center gap-4 border-b border-[#3e2a19]/10 pb-6 sm:mt-6 lg:grid-cols-[1fr_21rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "section-kicker flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgroCategoryIcon, {
							category: listing.category,
							size: 20
						}), listing.category]
					}),
					heading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-3xl leading-tight sm:text-4xl",
						children: listing.title
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mt-2 text-3xl leading-tight sm:text-4xl",
						children: listing.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingPrice, {
						listing,
						conversion: true
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingWhatsAppContact, {
					productTitle: listing.title,
					contact: listing.contact,
					contactProfile: listing.contactProfile,
					demo: listing.demo
				}, `whatsapp-${listing.id}`)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplaceActions, {
				listing,
				rows
			}, `actions-${listing.id}`),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid items-start gap-7 lg:grid-cols-[1.05fr_.95fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-2xl bg-white p-5 text-sm leading-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Modalidad:" }),
								" ",
								listing.saleFormat || "A convenir"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Unidad:" }),
								" ",
								listing.supplyUnit || "unidad",
								listing.minimumOrder ? ` · mínimo: ${listing.minimumOrder}` : ""
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Compradores:" }),
								" ",
								listing.buyerType || "Personas y empresas"
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 whitespace-pre-line text-sm leading-7 text-[#5f574f]",
						children: listing.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-6 rounded-2xl bg-white p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: "Características del producto"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-5 text-[#71685f]",
								children: "Datos opcionales declarados por el anunciante; verifica la información antes de negociar."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
								className: "mt-4 grid gap-3 sm:grid-cols-2",
								children: productAttributeFields.map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl bg-[#f8f3ea] p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-[#71685f]",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-1 text-sm font-semibold",
										children: details.attributes[key] || "No declarado"
									})]
								}, key))
							})
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex items-center gap-3",
						children: [sellerImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: sellerImage,
							width: 56,
							height: 56,
							alt: listing.demo ? "Imagen ilustrativa de perfil; no representa un vendedor real" : `Imagen del anunciante ${profile?.farmName || listing.sellerName}`,
							className: "size-14 rounded-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-14 items-center justify-center rounded-full bg-[#e5eadc]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { size: 24 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#71685f]",
							children: listing.demo ? "Vendedor ficticio de ejemplo" : "Publicado por"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: profile?.farmName || listing.sellerName
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingContactCard, {
						sellerName: listing.sellerName,
						contact: listing.contact,
						contactProfile: listing.contactProfile,
						location: listing.location,
						demo: listing.demo,
						productTitle: listing.title
					}),
					details.ruralReference && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-5 rounded-xl bg-[#f3ebdd] p-4 text-sm leading-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Referencia para llegar:" }),
							" ",
							details.ruralReference,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-xs text-[#71685f]",
								children: "Referencia pública del anunciante. Acuerda la visita antes de trasladarte."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplaceLocation, {
						state: listing.state,
						municipality: listing.municipality,
						point: details.publicLocation,
						location: listing.location,
						demo: listing.demo
					}, `location-${listing.id}`)
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 border-t border-[#3e2a19]/10 pt-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl",
						children: "Otros productos y productores"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm leading-6 text-[#71685f]",
						children: ["Primero los anuncios del mismo rubro; después otras opciones del campo.", listing.demo ? " Todos estos anuncios son ficticios." : ""]
					}),
					related.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid items-stretch gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3",
						children: related.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplaceRelatedCard, {
							listing: row,
							onSelect
						}, row.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-sm",
						children: ["No hay otras publicaciones activas para sugerir todavía. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							href: "/marketplace",
							className: "underline",
							children: "Volver al mercado"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-7 rounded-2xl bg-[#eadfcd] p-5 text-xs leading-6",
				children: "Verifica identidad, documentación, sanidad, condiciones y entrega con el anunciante. Venezuela Agro facilita el contacto; no certifica ni garantiza los productos."
			})
		]
	}, listing.id);
}
//#endregion
export { MarketplaceDetail, ListingPrice as a, marketplaceOwner as i, readMarketPreferences as n, listingUpdateLabel as o, writeMarketPreferences as r, followUpdates as t };
