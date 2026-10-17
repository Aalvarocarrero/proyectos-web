import { E as __toESM, T as __exportAll, b as require_react, n as require_jsx_runtime } from "../index.js";
import { F as projectPayloadSchema, P as professionalPayloadSchema, k as feedbackPayloadSchema, l as getOperationStatus, m as queueMutation, r as createLocalId, y as syncNow } from "./offline-db-Co86AgBD.js";
import { _ as socialFields, c as professionalTariffsForEditing, i as professionalDetailsSchema, l as serviceModes, t as agroSectors } from "./professional-profile-k05LGMn7.js";
import { t as venezuelanStates } from "./venezuela-Cj1crq10.js";
import { d as selectVerifiedDashboardOwner } from "./offline-account-boundary-hnu6xdcm.js";
import { a as formalSubmissionLoginPath, c as loadFormalDraft, d as saveFormalDraft, i as formalSubmissionError, l as requireFormalSubmissionSession, n as FormalSubmissionAuthError, o as formalSubmissionNeedsLogin, r as clearFormalDraft, s as isFormalSubmissionAuthError, t as FormalSubmissionNotice, u as requiresFormalSession } from "./formal-submission-notice-Dhskdcco.js";
import "./dialog-CBD8GOFt.js";
import { t as Button } from "./button-B3HvdP1w.js";
import { t as LoaderCircle } from "./loader-circle-C6swcBn0.js";
import { t as Input } from "./input-CcKdupPX.js";
import { a as tariffsToDraft, t as ProfessionalTariffFields } from "./professional-tariffs-Dfa9yaHh.js";
import { t as Textarea } from "./textarea-B0uyVTVX.js";
import { n as PublicFormGuide, t as FormFeedback } from "./form-feedback-r95D961y.js";
import { t as publicFormError } from "./public-form-errors-C9Km7-c4.js";
import { t as SecurityCenter } from "./security-center-BivcfP1j.js";
//#region lib/form-defaults.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** Populate the existing uncontrolled form from an immutable editing snapshot. */
function withFormDefaults(children, values) {
	if (!values) return children;
	return import_react.Children.map(children, (child) => {
		if (!(0, import_react.isValidElement)(child)) return child;
		const element = child;
		const props = element.props;
		const patch = {};
		if (typeof props.name === "string" && Object.hasOwn(values, props.name)) {
			const value = values[props.name];
			if (props.type === "checkbox") patch.defaultChecked = Array.isArray(value) ? value.includes(props.value) : Boolean(value);
			else if (value !== void 0 && value !== null && props.type !== "file") patch.defaultValue = Array.isArray(value) ? value.join("\n") : String(value);
		}
		if (props.children) patch.children = withFormDefaults(props.children, values);
		return (0, import_react.cloneElement)(element, patch);
	});
}
//#endregion
//#region components/community-forms.tsx
var community_forms_exports = /* @__PURE__ */ __exportAll({
	ProfessionalForm: () => ProfessionalForm,
	ProjectForm: () => ProjectForm
});
var import_jsx_runtime = require_jsx_runtime();
function ProfessionalForm({ name, userId, draftOwner, initial, onSaved }) {
	(0, import_react.useEffect)(() => {
		if (userId) selectVerifiedDashboardOwner(userId);
	}, [userId]);
	const details = initial?.payload.profileDetails || {};
	const [tariffs, setTariffs] = (0, import_react.useState)(() => tariffsToDraft(professionalTariffsForEditing(details)));
	const [profileType, setProfileType] = (0, import_react.useState)(String(details.profileType || "Persona natural"));
	const [photo, setPhoto] = (0, import_react.useState)("");
	const [photoMessage, setPhotoMessage] = (0, import_react.useState)("");
	const [processing, setProcessing] = (0, import_react.useState)(false);
	async function selectPhoto(file) {
		if (!file) return;
		if (![
			"image/jpeg",
			"image/png",
			"image/webp"
		].includes(file.type) || file.size > 12e6) {
			setPhotoMessage("Elige una fotografía JPG, PNG o WebP de menos de 12 MB.");
			return;
		}
		setProcessing(true);
		setPhotoMessage("");
		const objectUrl = URL.createObjectURL(file);
		try {
			const image = await new Promise((resolve, reject) => {
				const i = new window.Image();
				i.onload = () => resolve(i);
				i.onerror = reject;
				i.src = objectUrl;
			});
			const canvas = document.createElement("canvas"), scale = Math.min(1, 640 / Math.max(image.naturalWidth, image.naturalHeight));
			canvas.width = Math.round(image.naturalWidth * scale);
			canvas.height = Math.round(image.naturalHeight * scale);
			const context = canvas.getContext("2d");
			if (!context) throw new Error("canvas");
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			const data = canvas.toDataURL("image/webp", .78);
			if (data.length > 65e4) throw new Error("size");
			setPhoto(data);
			setPhotoMessage("Fotografía optimizada y lista para guardar.");
		} catch {
			setPhotoMessage("No pudimos procesar la fotografía. Prueba con otra imagen.");
		} finally {
			URL.revokeObjectURL(objectUrl);
			setProcessing(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueuedForm, {
		entityType: "professional",
		expectedOwner: userId ?? draftOwner,
		initialId: initial?.id,
		initialRevision: initial?.serverRevision,
		initialData: initial ? {
			...initial.payload,
			...details,
			...details.socials || {},
			emailConfirmation: details.email
		} : void 0,
		success: "Perfil recibido para revisión. Aún no está publicado.",
		onSaved: () => {
			setPhoto("");
			setPhotoMessage("");
			setTariffs([]);
			onSaved?.();
		},
		build: (form) => {
			if (processing) throw new Error("Espera a que termine la optimización de la fotografía.");
			const email = String(form.get("email") || "").trim();
			if (!email || email.toLowerCase() !== String(form.get("emailConfirmation") || "").trim().toLowerCase()) throw new Error("Confirma el mismo correo electrónico.");
			const payload = {
				name: String(form.get("name") || name),
				profession: String(form.get("profession") || ""),
				specialties: String(form.get("specialties") || ""),
				state: String(form.get("state") || ""),
				municipality: String(form.get("municipality") || ""),
				serviceMode: String(form.get("serviceMode") || "Presencial y remoto"),
				introduction: String(form.get("introduction") || ""),
				contact: String(form.get("contact") || ""),
				credentialNote: String(form.get("credentialNote") || ""),
				profileDetails: professionalDetailsSchema.parse({
					tariffs: tariffs.map((tariff) => ({
						...tariff,
						amount: tariff.amount.trim() ? Number(tariff.amount) : NaN
					})),
					profileType,
					corporateName: String(form.get("corporateName") || ""),
					tradeName: String(form.get("tradeName") || ""),
					responsibleName: String(form.get("responsibleName") || ""),
					taxId: String(form.get("taxId") || ""),
					registrationBody: String(form.get("registrationBody") || ""),
					registrationReference: String(form.get("registrationReference") || ""),
					bookingProcess: String(form.get("bookingProcess") || ""),
					availability: String(form.get("availability") || ""),
					socials: Object.fromEntries(socialFields.map(([key]) => [key, String(form.get(key) || "")])),
					yearsExperience: Number(form.get("yearsExperience") || 0),
					careerStage: String(form.get("careerStage") || "En ejercicio"),
					university: String(form.get("university") || ""),
					degree: String(form.get("degree") || ""),
					graduationYear: String(form.get("graduationYear") || ""),
					training: String(form.get("training") || ""),
					trajectory: String(form.get("trajectory") || ""),
					projects: String(form.get("projects") || ""),
					services: String(form.get("services") || ""),
					coverageStates: form.getAll("coverageStates"),
					sectors: form.getAll("sectors"),
					email: String(form.get("email") || ""),
					whatsapp: form.get("whatsapp") === "on",
					website: String(form.get("website") || ""),
					linkedin: String(form.get("linkedin") || ""),
					instagram: String(form.get("instagram") || ""),
					...photo ? { imageDataUrl: photo } : {}
				})
			};
			return professionalPayloadSchema.parse(payload);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sm:col-span-2 text-sm leading-6 text-[#5f574f]",
				children: "Cuéntanos cómo ayudas al campo. Aceptamos recién graduados y profesionales con experiencia. Publicaremos únicamente los datos que incluyas en este perfil, después de revisión."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Tipo de perfil",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: profileType,
					onChange: (e) => setProfileType(e.target.value),
					className: "h-12 w-full rounded-md border bg-white px-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "Persona natural",
						children: "Profesional independiente · persona natural"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Empresa" })]
				})
			}),
			profileType === "Empresa" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "sm:col-span-2 min-w-0 rounded-2xl border bg-white p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", { children: "Datos de la empresa" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [
							["corporateName", "Nombre corporativo *"],
							["tradeName", "Nombre comercial"],
							["responsibleName", "Nombre del responsable"],
							["taxId", "RIF público (opcional)"],
							["registrationBody", "Ente o registro declarado"],
							["registrationReference", "Referencia pública del registro (opcional)"]
						].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: key,
								maxLength: key === "taxId" ? 80 : key === "responsibleName" ? 120 : 180,
								required: key === "corporateName"
							})
						}, key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-6",
						children: "Estos datos aparecerán en el perfil. No subas documentos de identidad ni datos privados. Un registro declarado no equivale a verificación de la plataforma."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: profileType === "Empresa" ? "Nombre visible de la empresa *" : "Nombre profesional *",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "name",
					defaultValue: name,
					required: true,
					minLength: 3,
					maxLength: 120
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "Profesión u oficio *",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "profession",
					required: true,
					minLength: 2,
					maxLength: 100,
					list: "agro-professions",
					placeholder: "Veterinaria, agronomía, piloto de drones…"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
					id: "agro-professions",
					children: [
						"Medicina veterinaria",
						"Ingeniería agronómica",
						"Zootecnia",
						"Piloto de drones agrícolas",
						"Técnico agropecuario",
						"Ingeniería agrícola",
						"Gestión y comercialización",
						"Derecho agrario",
						"Operación de maquinaria y construcción de lagunas",
						"Mecánica de maquinaria agrícola",
						"Topografía",
						"Logística agropecuaria"
					].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: v }, v))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Especialidades *",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "specialties",
					required: true,
					minLength: 3,
					maxLength: 500,
					placeholder: "Ej. bovinos, reproducción, cacao, riego"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StateField, { defaultValue: String(initial?.payload.state || "") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Municipio o zona",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "municipality",
					maxLength: 100
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Modalidad de atención",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					name: "serviceMode",
					defaultValue: "Presencial y remoto",
					className: "h-12 w-full rounded-md border bg-white px-3 text-sm",
					children: serviceModes.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: m }, m))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfessionalTariffFields, {
				value: tariffs,
				onChange: setTariffs
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Etapa profesional",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					name: "careerStage",
					className: "h-12 w-full rounded-md border bg-white px-3 text-sm",
					defaultValue: "En ejercicio",
					children: [
						"Recién graduado",
						"En ejercicio",
						"Especialista",
						"Consultor / trayectoria avanzada"
					].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: m }, m))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "Años de experiencia",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "yearsExperience",
					type: "number",
					min: 0,
					max: 80,
					step: 1,
					defaultValue: 0
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block text-xs font-normal",
					children: "Puedes comenzar con cero años."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "sm:col-span-2 text-sm font-semibold",
				children: ["Presentación *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					name: "introduction",
					required: true,
					minLength: 20,
					maxLength: 1200,
					className: "mt-2 min-h-28",
					placeholder: "¿A quién ayudas y qué problemas resuelves? Menciona tus rubros y zona de atención con tus propias palabras."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Teléfono / celular *",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "contact",
					type: "tel",
					inputMode: "tel",
					required: true,
					maxLength: 40,
					pattern: "[+0-9 ().-]{7,40}",
					placeholder: "Ej. +58 412 123 4567"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Correo de contacto público *",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "email",
					type: "email",
					required: true,
					maxLength: 180
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Confirma el correo *",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "emailConfirmation",
					type: "email",
					required: true,
					maxLength: 180
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "sm:col-span-2 flex min-h-11 items-center gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "whatsapp",
					type: "checkbox",
					className: "size-5"
				}), " Mi teléfono recibe WhatsApp"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "sm:col-span-2 min-w-0 rounded-2xl border bg-white p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "px-2 text-sm font-semibold",
					children: "Fotografía y formación"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "sm:col-span-2 text-sm font-semibold",
							children: [
								profileType === "Empresa" ? "Logo o fotografía de la empresa (opcional)" : "Fotografía o marca profesional (opcional)",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "image/jpeg,image/png,image/webp",
									disabled: processing,
									onChange: (e) => selectPhoto(e.target.files?.[0]),
									className: "mt-2 block w-full min-w-0 text-xs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									role: "status",
									className: "mt-2 block text-xs font-normal",
									children: processing ? "Optimizando fotografía…" : photoMessage
								}),
								photo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: photo,
									width: 96,
									height: 96,
									alt: "Vista previa de tu fotografía",
									className: "mt-3 size-24 rounded-xl object-cover"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setPhoto("");
										setPhotoMessage("");
									},
									className: "mt-2 min-h-11 text-xs underline",
									children: "Quitar fotografía"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Universidad o institución",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "university",
								maxLength: 180
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Título obtenido",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "degree",
								maxLength: 180
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Año de graduación",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "graduationYear",
								inputMode: "numeric",
								maxLength: 4,
								pattern: "(19|20)[0-9]{2}",
								placeholder: "2024"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Colegio, matrícula o respaldo",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								name: "credentialNote",
								maxLength: 500,
								placeholder: "Información declarada por el profesional"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "sm:col-span-2 text-sm font-semibold",
							children: ["Cursos y certificaciones", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								name: "training",
								maxLength: 1800,
								className: "mt-2",
								placeholder: "Institución, curso y año. Incluye únicamente credenciales reales."
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "sm:col-span-2 min-w-0 rounded-2xl border bg-white p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "px-2 text-sm font-semibold",
					children: "Servicios y trayectoria"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4",
					children: [
						[
							"services",
							"Servicios que ofreces",
							"Ej. visitas veterinarias, planes de siembra, cartografía con drones",
							1800
						],
						[
							"trajectory",
							"Tu trayectoria",
							"Cuéntanos tu experiencia. Si comienzas, puedes mencionar prácticas profesionales.",
							2400
						],
						[
							"projects",
							"Proyectos en los que has participado",
							"Nombre del proyecto, tu función, lugar y fecha. No incluyas datos privados de clientes.",
							2400
						]
					].map(([field, label, placeholder, max]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm font-semibold",
						children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							name: String(field),
							maxLength: Number(max),
							placeholder: String(placeholder),
							className: "mt-2 min-h-24"
						})]
					}, field))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "sm:col-span-2 min-w-0 rounded-2xl border bg-white p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "px-2 text-sm font-semibold",
						children: "Rubros que atiendes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: agroSectors.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								name: "sectors",
								value: v,
								className: "size-4"
							}), v]
						}, v))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-[#71685f]",
						children: "Si falta tu rubro, escríbelo en Especialidades."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "sm:col-span-2 rounded-2xl border bg-white p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "cursor-pointer text-sm font-semibold",
					children: "Otros estados donde prestas servicios (opcional)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-2 sm:grid-cols-2",
					children: venezuelanStates.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							name: "coverageStates",
							value: v,
							className: "size-4"
						}), v]
					}, v))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "sm:col-span-2 rounded-2xl border bg-white p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "cursor-pointer text-sm font-semibold",
					children: "Redes y sitio web (opcional)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-4",
					children: socialFields.map(([field, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: field,
							type: "url",
							maxLength: 500,
							placeholder: "https://…"
						})
					}, field))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "sm:col-span-2 text-sm font-semibold",
				children: ["¿Cómo se reserva tu servicio?", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					name: "bookingProcess",
					maxLength: 1200,
					className: "mt-2",
					placeholder: "Contacto, visita previa, cotización, confirmación y modalidades disponibles. Las reservas se coordinan directamente; la plataforma no confirma citas."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Horarios y disponibilidad",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "availability",
					maxLength: 500
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sm:col-span-2 text-xs leading-6 text-[#71685f]",
				children: "Tu profesión, especialidades, servicios y estados nos ayudan a organizar tu perfil para que los productores te encuentren. No necesitas conocimientos de SEO ni repetir palabras clave."
			})
		]
	});
}
function ProjectForm({ userId, draftOwner }) {
	(0, import_react.useEffect)(() => {
		if (userId) selectVerifiedDashboardOwner(userId);
	}, [userId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueuedForm, {
		entityType: "project",
		expectedOwner: userId ?? draftOwner,
		success: "Proyecto agropecuario recibido para revisión editorial. Su publicación y cualquier apoyo requieren evaluación; no están garantizados.",
		build: (form) => projectPayloadSchema.parse({
			title: String(form.get("title") || ""),
			sector: String(form.get("sector") || ""),
			state: String(form.get("state") || ""),
			summary: String(form.get("summary") || ""),
			has: splitList(String(form.get("has") || "")),
			needs: splitList(String(form.get("needs") || "")),
			impact: String(form.get("impact") || ""),
			requestedSupport: String(form.get("requestedSupport") || ""),
			contact: String(form.get("contact") || "")
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sm:col-span-2 text-sm leading-6",
				children: "Cuéntanos tu proyecto agropecuario: su objetivo, recursos y necesidades de apoyo o colaboración. Para proponer cambios en las herramientas de Venezuela Agro, utiliza «Tu idea»."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Nombre del proyecto agropecuario *",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "title",
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Rubro *",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "sector",
					required: true,
					placeholder: "Ganadería, cacao, logística…"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StateField, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Contacto *",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "contact",
					required: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-sm font-semibold sm:col-span-2",
				children: ["¿Cuál es el objetivo de tu proyecto? *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					name: "summary",
					required: true,
					minLength: 30,
					className: "mt-2 min-h-28"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-sm font-semibold",
				children: ["¿Qué tienes hoy? *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					name: "has",
					required: true,
					className: "mt-2",
					placeholder: "Separa los puntos con comas"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-sm font-semibold",
				children: ["¿Qué apoyo o colaboración necesita el proyecto? *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					name: "needs",
					required: true,
					className: "mt-2",
					placeholder: "Inversión, logística, profesionales…"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-sm font-semibold sm:col-span-2",
				children: ["Aporte a tu comunidad o a Venezuela *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					name: "impact",
					required: true,
					minLength: 20,
					className: "mt-2"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-sm font-semibold sm:col-span-2",
				children: ["¿Qué colaboración buscas a través de Venezuela Agro? *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					name: "requestedSupport",
					required: true,
					minLength: 10,
					className: "mt-2"
				})]
			})
		]
	});
}
function QueuedForm({ entityType, expectedOwner, initialId, initialRevision, initialData, success, build, children, compact = false, onSaved }) {
	const [working, setWorking] = (0, import_react.useState)(false);
	const submitLock = (0, import_react.useRef)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const [tone, setTone] = (0, import_react.useState)("info");
	const formRef = (0, import_react.useRef)(null);
	const [loginNeeded, setLoginNeeded] = (0, import_react.useState)(false);
	const [feedbackOperationId, setFeedbackOperationId] = (0, import_react.useState)(null);
	const feedbackOperation = (0, import_react.useRef)(null);
	const feedbackOwner = (0, import_react.useRef)(expectedOwner);
	const feedbackFields = (0, import_react.useRef)({});
	const [restoredFields, setRestoredFields] = (0, import_react.useState)();
	const formalFeedback = entityType === "feedback" && requiresFormalSession();
	(0, import_react.useEffect)(() => {
		if (!formalFeedback || new URLSearchParams(window.location.search).get("resume") !== "feedback") return;
		const draft = loadFormalDraft("feedback");
		if (!draft || !draft.fields || typeof draft.fields !== "object" || Array.isArray(draft.fields)) return;
		const fields = Object.fromEntries(Object.entries(draft.fields).filter(([key, value]) => [
			"area",
			"role",
			"message",
			"contact"
		].includes(key) && typeof value === "string"));
		feedbackFields.current = fields;
		feedbackOperation.current = typeof draft.operationId === "string" ? draft.operationId : null;
		feedbackOwner.current = typeof draft.expectedOwner === "string" ? draft.expectedOwner : void 0;
		setFeedbackOperationId(feedbackOperation.current);
		setRestoredFields(fields);
		setMessage("Borrador recuperado. Revisa tu comentario y confirma el envío; volver de Google no lo envía automáticamente.");
	}, [formalFeedback]);
	function login() {
		if (submitLock.current || !formRef.current) return;
		if (!saveFormalDraft("feedback", {
			fields: feedbackOperation.current ? feedbackFields.current : feedbackFormFields(new FormData(formRef.current)),
			operationId: feedbackOperation.current,
			expectedOwner: feedbackOwner.current
		})) {
			setTone("error");
			setMessage("El navegador no pudo conservar el borrador. Copia tu texto antes de iniciar sesión; no salimos del formulario.");
			return;
		}
		window.location.assign(formalSubmissionLoginPath("feedback", window.location.pathname + window.location.search + window.location.hash));
	}
	async function submit(event) {
		event.preventDefault();
		if (submitLock.current) return;
		submitLock.current = true;
		const formElement = event.currentTarget;
		setWorking(true);
		setMessage("");
		const form = new FormData(formElement);
		try {
			let owner = expectedOwner;
			if (formalFeedback) {
				if (feedbackOperation.current && !feedbackOwner.current) throw new FormalSubmissionAuthError("submission_account_mismatch");
				const verified = await requireFormalSubmissionSession(feedbackOwner.current);
				if (verified) {
					owner = verified;
					feedbackOwner.current = verified;
					selectVerifiedDashboardOwner(verified);
				}
				setLoginNeeded(false);
			}
			let operationId = formalFeedback ? feedbackOperation.current : null;
			let receipt = operationId ? await getOperationStatus(operationId) : null;
			if (receipt?.state === "unknown") {
				setTone("info");
				setMessage("Tu texto sigue aquí, pero no encontramos la confirmación del envío en esta cuenta. No creamos otro para evitar duplicados.");
				return;
			}
			if (!operationId) {
				const payload = build(form);
				const valid = entityType === "feedback" ? feedbackPayloadSchema.parse(payload) : payload;
				const operation = await queueMutation({
					expectedOwner: owner,
					entityType,
					entityId: initialId ?? createLocalId(entityType),
					baseRevision: initialRevision ?? null,
					action: "upsert",
					payload: valid
				});
				operationId = operation.id;
				if (formalFeedback) {
					feedbackFields.current = feedbackFormFields(form);
					feedbackOperation.current = operation.id;
					setFeedbackOperationId(operation.id);
				}
			}
			const result = receipt?.state === "confirmed" || receipt?.state === "blocked" ? void 0 : await syncNow().catch(() => ({ reason: "connection_interrupted" }));
			if (formalSubmissionNeedsLogin(result)) {
				setLoginNeeded(true);
				setTone("error");
				setMessage(formalSubmissionError(void 0));
				return;
			}
			receipt = await getOperationStatus(operationId);
			if (formalSubmissionNeedsLogin(receipt)) {
				setLoginNeeded(true);
				setTone("error");
				setMessage(formalSubmissionError(void 0));
				return;
			}
			setTone(receipt.state === "confirmed" ? "success" : "info");
			setMessage(receipt.state === "confirmed" ? success : result?.reason === "account_contact_required" ? "Guardado en este dispositivo. Completa el correo y celular de tu cuenta para sincronizar." : result?.reason === "public_content_consent_required" ? "Autoriza primero la publicación de contenido. Tu borrador quedó guardado en este dispositivo." : receipt.state === "blocked" ? "Borrador conservado. Revisa el motivo en Mi Finca → Sincronización." : entityType === "project" ? "Proyecto agropecuario guardado en este dispositivo. Su envío a revisión todavía no está confirmado." : "Guardado en este dispositivo. El envío aún no está confirmado.");
			if (formalFeedback && receipt.state !== "confirmed") return;
			if (formalFeedback) {
				clearFormalDraft("feedback");
				feedbackOperation.current = null;
				feedbackOwner.current = void 0;
				feedbackFields.current = {};
				setFeedbackOperationId(null);
				setRestoredFields(void 0);
			}
			formElement.reset();
			onSaved?.();
		} catch (error) {
			setTone("error");
			const authError = error instanceof Error && error.message === "account_changed_reopen_form" ? new FormalSubmissionAuthError("submission_account_mismatch") : error;
			if (isFormalSubmissionAuthError(authError)) {
				setLoginNeeded(true);
				setMessage(formalSubmissionError(authError));
			} else setMessage(publicFormError(error, "No pudimos guardar la información. Tus datos siguen en el formulario para que puedas intentarlo otra vez."));
		} finally {
			submitLock.current = false;
			setWorking(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [entityType !== "feedback" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityCenter, {
		mode: "gate",
		requirePublic: true
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		ref: formRef,
		onSubmit: submit,
		"aria-busy": working,
		className: compact ? "grid gap-4 sm:grid-cols-2" : "grid gap-5 sm:grid-cols-2",
		children: [
			!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sm:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicFormGuide, {})
			}),
			formalFeedback && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sm:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormalSubmissionNotice, {
					onLogin: login,
					loginNeeded
				})
			}),
			feedbackOperationId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sm:col-span-2 text-xs leading-5",
				children: "Este comentario ya está guardado. Comprobaremos el mismo envío para evitar duplicados; el texto se conserva sin cambios."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fieldset", {
				disabled: working || Boolean(feedbackOperationId),
				className: "contents",
				children: withFormDefaults(children, restoredFields ?? initialData)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sm:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormFeedback, {
					message,
					tone
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				disabled: working,
				className: "sm:col-span-2 min-w-0 min-h-12 h-auto max-w-full whitespace-normal rounded-full bg-[#3e2a19] py-3 text-white",
				children: [working && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }), working ? "Guardando solicitud…" : entityType === "professional" ? "Enviar perfil" : entityType === "project" ? "Enviar proyecto agropecuario" : feedbackOperationId ? "Comprobar envío" : "Enviar sugerencia"]
			})
		]
	})] });
}
function feedbackFormFields(form) {
	return Object.fromEntries([
		"area",
		"role",
		"message",
		"contact"
	].map((key) => [key, String(form.get(key) || "")]));
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "text-sm font-semibold",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-2 block",
			children
		})]
	});
}
function StateField({ defaultValue = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "text-sm font-semibold",
		children: ["Estado *", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
			name: "state",
			defaultValue,
			required: true,
			className: "mt-2 h-12 w-full rounded-md border bg-white px-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: "",
				children: "Seleccionar"
			}), venezuelanStates.map((state) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: state }, state))]
		})]
	});
}
function splitList(value) {
	return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 20);
}
//#endregion
export { ProjectForm as n, community_forms_exports as r, ProfessionalForm as t };
