import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { a as discriminatedUnionType, d as stringType, l as objectType, s as literalType } from "./types-O06YnHo2.js";
//#region lib/home-content.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var copy = (max) => stringType().trim().min(1, "Escribe un texto.").max(max).refine((value) => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value), "Usa texto sin etiquetas HTML.");
var homeImagePath = stringType().regex(/^(?:\/hero-apure-1200\.webp|\/api\/home-media\/[a-f0-9-]{36}\.(?:webp|jpg|png))$/);
var homeContentSchema = objectType({
	heroEyebrow: copy(90),
	heroTitle: copy(90),
	heroSubtitle: copy(90),
	heroDescription: copy(360),
	heroPrimaryLabel: copy(60),
	heroSecondaryLabel: copy(60),
	heroHint: copy(160),
	heroImage: homeImagePath,
	heroImageAlt: copy(180),
	farmEyebrow: copy(90),
	farmTitle: copy(150),
	farmDescription: copy(360),
	seoTitle: copy(100),
	seoDescription: copy(320)
}).strict();
var HOME_DEFAULTS = {
	heroEyebrow: "HECHO PARA EL PRODUCTOR VENEZOLANO",
	heroTitle: "Tu finca, organizada.",
	heroSubtitle: "Tu campo, conectado.",
	heroDescription: "Lleva tus animales, cultivos y cuentas con Mi Finca. Encuentra productos, conocimiento y personas para seguir creciendo.",
	heroPrimaryLabel: "Explorar finca modelo",
	heroSecondaryLabel: "Crear mi finca",
	heroHint: "Primero conoce la herramienta con una finca de ejemplo.",
	heroImage: "/hero-apure-1200.webp",
	heroImageAlt: "Paisaje productivo tropical de los llanos venezolanos al amanecer",
	farmEyebrow: "MI FINCA · TU HERRAMIENTA DE CADA DÍA",
	farmTitle: "Del terreno a los registros. Todo en su lugar.",
	farmDescription: "Visualiza tu terreno y organiza lo que pasa en él. Menos datos dispersos, más claridad para el trabajo de cada día.",
	seoTitle: "VenezuelaAgro | Gestión de fincas y mercado agropecuario en Venezuela",
	seoDescription: "VenezuelaAgro conecta productores, profesionales y empresas de Venezuela. Gestión local de fincas sin señal, mercado agropecuario y comunidad. Hecho por Parcela Los Morochos."
};
discriminatedUnionType("action", [objectType({
	action: literalType("save"),
	expectedRevision: stringType().uuid().nullable(),
	content: homeContentSchema
}).strict(), objectType({
	action: literalType("publish"),
	expectedRevision: stringType().uuid()
}).strict()]);
//#endregion
//#region components/home-content-editor.tsx
var import_jsx_runtime = require_jsx_runtime();
var fieldGroups = [
	{
		title: "Portada",
		fields: [
			[
				"heroEyebrow",
				"Texto superior",
				90
			],
			[
				"heroTitle",
				"Título · primera línea",
				90
			],
			[
				"heroSubtitle",
				"Título · segunda línea",
				90
			],
			[
				"heroDescription",
				"Descripción",
				360,
				true
			],
			[
				"heroPrimaryLabel",
				"Botón a la finca modelo",
				60
			],
			[
				"heroSecondaryLabel",
				"Botón a Mi Finca",
				60
			],
			[
				"heroHint",
				"Texto de ayuda",
				160
			]
		]
	},
	{
		title: "Presentación de Mi Finca",
		fields: [
			[
				"farmEyebrow",
				"Texto superior",
				90
			],
			[
				"farmTitle",
				"Título",
				150
			],
			[
				"farmDescription",
				"Descripción",
				360,
				true
			]
		]
	},
	{
		title: "SEO y enlaces compartidos",
		fields: [[
			"seoTitle",
			"Título de la página",
			100
		], [
			"seoDescription",
			"Descripción para buscadores y redes",
			320,
			true
		]]
	}
];
var messages = {
	forbidden: "Tu sesión no tiene acceso. Inicia sesión con una cuenta administradora.",
	content_changed_refresh_required: "Otro administrador cambió este contenido. Tu texto sigue aquí. Cópialo antes de recargar y combinar los cambios.",
	content_storage_unavailable: "No pudimos acceder al contenido. Inténtalo de nuevo; no se confirmó el cambio.",
	image_unavailable: "La imagen no está disponible. Vuelve a subirla antes de publicar.",
	invalid_content: "Revisa los campos: usa texto sin HTML y respeta los límites indicados."
};
async function readResponse(response, schema) {
	const data = await response.json().catch(() => ({}));
	const code = objectType({ error: stringType() }).safeParse(data);
	if (!response.ok) throw new Error(messages[code.success ? code.data.error : ""] || "No pudimos completar la operación. Revisa tu conexión e inténtalo de nuevo.");
	return schema.parse(data);
}
async function optimizeHero(file) {
	if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 15e6) throw new Error("Elige una imagen JPG, PNG o WebP de hasta 15 MB.");
	const url = URL.createObjectURL(file);
	try {
		const image = await new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(/* @__PURE__ */ new Error("No pudimos abrir la imagen."));
			img.src = url;
		});
		if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 8e7) throw new Error("Reduce la resolución de la imagen antes de subirla.");
		const scale = Math.min(1, 1920 / Math.max(image.naturalWidth, image.naturalHeight));
		const canvas = document.createElement("canvas");
		canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
		canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("No pudimos optimizar la imagen.");
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		let quality = .85, dataUrl = "";
		do {
			dataUrl = canvas.toDataURL("image/webp", quality);
			quality -= .1;
		} while (dataUrl.length > 25e5 && quality > .3);
		if (dataUrl.length > 25e5) throw new Error("La imagen sigue siendo demasiado pesada. Prueba con otra.");
		return dataUrl;
	} finally {
		URL.revokeObjectURL(url);
	}
}
function HomeContentEditor() {
	const [document, setDocument] = (0, import_react.useState)(null);
	const [content, setContent] = (0, import_react.useState)(HOME_DEFAULTS);
	const [busy, setBusy] = (0, import_react.useState)(true), [error, setError] = (0, import_react.useState)(""), [notice, setNotice] = (0, import_react.useState)("");
	const dirty = !!document && JSON.stringify(content) !== JSON.stringify(document.content);
	async function load() {
		setBusy(true);
		setError("");
		setNotice("");
		try {
			const data = await readResponse(await fetch("/api/admin/home-content", { cache: "no-store" }), objectType({
				content: homeContentSchema,
				revision: stringType().uuid().nullable(),
				publishedAt: stringType().nullable()
			}));
			setDocument(data);
			setContent(data.content);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "No pudimos cargar el contenido.");
		} finally {
			setBusy(false);
		}
	}
	(0, import_react.useEffect)(() => {
		const controller = new AbortController();
		fetch("/api/admin/home-content", {
			cache: "no-store",
			signal: controller.signal
		}).then((response) => readResponse(response, objectType({
			content: homeContentSchema,
			revision: stringType().uuid().nullable(),
			publishedAt: stringType().nullable()
		}))).then((data) => {
			if (!controller.signal.aborted) {
				setDocument(data);
				setContent(data.content);
			}
		}).catch((cause) => {
			if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "No pudimos cargar el contenido.");
		}).finally(() => {
			if (!controller.signal.aborted) setBusy(false);
		});
		return () => controller.abort();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!dirty) return;
		const warn = (event) => {
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [dirty]);
	async function mutate(action) {
		if (!document || busy) return;
		const validated = homeContentSchema.safeParse(content);
		if (!validated.success) {
			setError(messages.invalid_content);
			return;
		}
		if (action === "publish" && (dirty || !document.revision)) return;
		if (action === "publish" && !window.confirm("¿Publicar el borrador guardado? Los visitantes verán estos textos, la imagen y el SEO en la página de inicio.")) return;
		setBusy(true);
		setError("");
		setNotice("");
		try {
			const data = await readResponse(await fetch("/api/admin/home-content", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					action,
					expectedRevision: document.revision,
					...action === "save" ? { content: validated.data } : {}
				})
			}), objectType({
				revision: stringType().uuid(),
				publishedAt: stringType().optional()
			}));
			setContent(validated.data);
			setDocument({
				...document,
				content: validated.data,
				revision: data.revision,
				publishedAt: data.publishedAt ?? document.publishedAt
			});
			setNotice(action === "save" ? "Borrador guardado. Revisa la vista previa antes de publicar." : "Inicio publicado. Ya puedes comprobarlo en el sitio.");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "No pudimos guardar los cambios.");
		} finally {
			setBusy(false);
		}
	}
	async function upload(file) {
		setBusy(true);
		setError("");
		setNotice("");
		try {
			const dataUrl = await optimizeHero(file);
			const data = await readResponse(await fetch("/api/admin/home-media", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ dataUrl })
			}), objectType({ src: homeImagePath }));
			setContent((current) => ({
				...current,
				heroImage: data.src
			}));
			setNotice("Imagen optimizada y subida. Añade su descripción y guarda el borrador.");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "No pudimos subir la imagen.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "home-editor-title",
		className: "rounded-3xl border border-[#3e2a19]/15 bg-white p-5 sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "section-kicker",
				children: "CONTENIDO DEL SITIO"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "home-editor-title",
				className: "font-display mt-3 text-3xl sm:text-4xl",
				children: "Editar página de inicio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-3xl text-sm leading-7",
				children: "Edita la portada, la presentación de Mi Finca, la imagen principal y el SEO. Guarda un borrador, revísalo y publícalo cuando esté listo. Las demás secciones, los enlaces y el diseño conservan su configuración actual."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/",
					target: "_blank",
					rel: "noreferrer",
					className: "underline",
					children: "Ver sitio publicado"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => {
						if (!dirty || window.confirm("¿Descartar los cambios sin guardar y cargar la última versión?")) load();
					},
					className: "underline disabled:opacity-50",
					children: "Recargar contenido"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800",
				children: error
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-900",
				children: notice
			}),
			!document ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-sm",
				children: busy ? "Cargando contenido…" : "El editor necesita cargar el contenido antes de guardar."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-7",
				onSubmit: (event) => {
					event.preventDefault();
					mutate("save");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						disabled: busy,
						className: "space-y-7 disabled:opacity-70",
						children: [fieldGroups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "rounded-2xl border border-[#3e2a19]/10 p-4 sm:p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "px-2 font-semibold",
								children: group.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: group.fields.map(([key, label, max, multiline]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: multiline ? "text-sm sm:col-span-2" : "text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block font-medium",
											children: label
										}),
										multiline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											rows: 3,
											value: content[key],
											required: true,
											maxLength: max,
											onChange: (event) => setContent({
												...content,
												[key]: event.target.value
											}),
											className: "mt-2 w-full rounded-xl border border-[#3e2a19]/25 p-3"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: content[key],
											required: true,
											maxLength: max,
											onChange: (event) => setContent({
												...content,
												[key]: event.target.value
											}),
											className: "mt-2 w-full rounded-xl border border-[#3e2a19]/25 p-3"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-[#71685f]",
											children: [
												content[key].length,
												"/",
												max
											]
										})
									]
								}, key))
							})]
						}, group.title)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "rounded-2xl border border-[#3e2a19]/10 p-4 sm:p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
									className: "px-2 font-semibold",
									children: "Imagen de portada"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: content.heroImage,
									alt: content.heroImageAlt,
									className: "mb-4 aspect-[3/1] w-full rounded-xl object-cover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-sm font-medium",
									children: ["Subir imagen propia (JPG, PNG o WebP; hasta 15 MB)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "image/jpeg,image/png,image/webp",
										className: "mt-2 block w-full text-sm",
										onChange: (event) => {
											const file = event.target.files?.[0];
											event.target.value = "";
											if (file) upload(file);
										}
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs leading-6 text-[#71685f]",
									children: "Usa una imagen horizontal que tengas permiso de publicar. Se optimiza en tu navegador antes de subirla; las imágenes de borrador solo son visibles para administradores."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mt-3 text-sm underline",
									onClick: () => setContent({
										...content,
										heroImage: HOME_DEFAULTS.heroImage,
										heroImageAlt: HOME_DEFAULTS.heroImageAlt
									}),
									children: "Usar imagen original"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-4 block text-sm font-medium",
									children: ["Descripción accesible de la imagen", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: content.heroImageAlt,
										required: true,
										maxLength: 180,
										onChange: (event) => setContent({
											...content,
											heroImageAlt: event.target.value
										}),
										className: "mt-2 w-full rounded-xl border border-[#3e2a19]/25 p-3"
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: busy,
								className: "button-dark disabled:opacity-50",
								children: busy ? "Procesando…" : "Guardar borrador"
							}),
							document.revision && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/admin/home-preview",
								target: "_blank",
								rel: "noreferrer",
								className: "rounded-full border px-5 py-3 text-sm font-semibold",
								children: "Vista previa guardada"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: busy || dirty || !document.revision,
								onClick: () => void mutate("publish"),
								className: "button-primary disabled:opacity-40",
								children: "Publicar inicio"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-[#71685f]",
						children: [
							dirty ? "Hay cambios sin guardar. Guárdalos antes de publicar; la vista previa muestra el último borrador guardado." : "No hay cambios locales pendientes.",
							" ",
							document.publishedAt ? `Última publicación: ${new Date(document.publishedAt).toLocaleString("es-VE")}.` : "Todavía se muestra el contenido original."
						]
					})
				]
			})
		]
	});
}
//#endregion
export { HomeContentEditor };
