import { E as __toESM, b as require_react, n as require_jsx_runtime } from "../index.js";
import { a as getCachedEntities, f as hydrateFromServer, l as getOperationStatus, m as queueMutation, v as subscribeOfflineChanges, y as syncNow } from "./offline-db-Co86AgBD.js";
import { d as selectVerifiedDashboardOwner } from "./offline-account-boundary-hnu6xdcm.js";
import { t as FormFeedback } from "./form-feedback-r95D961y.js";
import { t as ProfessionalForm } from "./community-forms-BPlzoo5F.js";
//#region components/professional-manager.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function ProfessionalManager({ userId, name }) {
	const [rows, setRows] = (0, import_react.useState)([]), [editing, setEditing] = (0, import_react.useState)(null), [showForm, setShowForm] = (0, import_react.useState)(false), [message, setMessage] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true), [loadError, setLoadError] = (0, import_react.useState)(false), [retry, setRetry] = (0, import_react.useState)(0), [working, setWorking] = (0, import_react.useState)(false), [tone, setTone] = (0, import_react.useState)("info");
	const lock = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		let active = true;
		selectVerifiedDashboardOwner(userId);
		const refresh = () => getCachedEntities("professional").then((items) => {
			if (active) {
				setRows(items.filter((row) => row.payload.status !== "deleted"));
				setLoadError(false);
			}
		}).catch(() => {
			if (active) setLoadError(true);
		}).finally(() => {
			if (active) setLoading(false);
		});
		refresh();
		hydrateFromServer().then(refresh).catch(() => {
			if (active) {
				setMessage("No pudimos actualizar desde el servidor. Puedes consultar los perfiles guardados en este dispositivo y reintentar.");
				setTone("info");
			}
		});
		const stop = subscribeOfflineChanges(() => void refresh());
		return () => {
			active = false;
			stop();
		};
	}, [userId, retry]);
	async function withdraw(row) {
		if (lock.current) return;
		if (!window.confirm("¿Retirar este perfil? La retirada se enviará al recuperar conexión; tus datos seguirán en la copia local y en el historial del servidor.")) return;
		lock.current = true;
		setWorking(true);
		try {
			const operation = await queueMutation({
				expectedOwner: userId,
				entityType: "professional",
				entityId: row.id,
				action: "delete",
				baseRevision: row.serverRevision ?? null,
				payload: {}
			});
			await syncNow().catch(() => {});
			const receipt = await getOperationStatus(operation.id);
			setTone(receipt.state === "confirmed" ? "success" : "info");
			setMessage(receipt.state === "confirmed" ? "Perfil retirado del directorio." : "Retirada guardada localmente. Revisa los pendientes en Mi Finca → Sincronización.");
		} catch {
			setTone("error");
			setMessage("No se pudo confirmar la retirada. Revisa el estado en Mi Finca → Sincronización antes de reintentar.");
		} finally {
			lock.current = false;
			setWorking(false);
		}
	}
	function openForm(row) {
		if (showForm && !window.confirm("¿Cambiar de formulario? Se perderán los cambios que aún no hayas guardado.")) return;
		setEditing(row);
		setShowForm(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-busy": loading || working,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-bold",
				children: "Mis perfiles enviados"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6",
				children: "Puedes revisar, actualizar o retirar tus propias solicitudes. Las modificaciones vuelven a revisión antes de publicarse."
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "py-5 text-sm",
				children: "Cargando tus perfiles…"
			}),
			loadError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormFeedback, {
					tone: "error",
					message: "No pudimos leer tus perfiles guardados. Reintenta antes de crear otro perfil."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button-light mt-3",
					onClick: () => {
						setLoading(true);
						setLoadError(false);
						setRetry((v) => v + 1);
					},
					children: "Reintentar"
				})]
			}),
			!loading && !loadError && !rows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 rounded-2xl border border-dashed p-5 text-sm leading-6",
				children: "Todavía no hay perfiles guardados en este dispositivo. Crea uno o actualiza para consultar tus solicitudes."
			}),
			rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "mt-3 rounded-xl border bg-white p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: String(row.payload.name || "Perfil")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs",
						children: row.syncState === "pending" ? "Pendiente de envío" : {
							active: "Publicado",
							pending: "En revisión",
							rejected: "Requiere cambios"
						}[String(row.payload.status)] || "Consultar estado de revisión"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							disabled: working,
							className: "min-h-11 text-sm underline",
							onClick: () => openForm(row),
							children: "Editar solicitud"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							disabled: working,
							className: "min-h-11 text-sm underline",
							onClick: () => void withdraw(row),
							children: "Retirar perfil"
						})]
					})
				]
			}, row.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					disabled: working,
					className: "button-dark",
					onClick: () => openForm(null),
					children: "Crear nuevo perfil"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					disabled: loading || working,
					className: "button-light",
					onClick: () => {
						setLoading(true);
						setLoadError(false);
						setRetry((v) => v + 1);
					},
					children: "Actualizar perfiles"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormFeedback, {
					message,
					tone
				})
			}),
			showForm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "mb-3 min-h-11 text-sm underline",
					onClick: () => {
						if (window.confirm("¿Cerrar el formulario sin guardar los cambios que aún no enviaste?")) setShowForm(false);
					},
					children: "Cerrar formulario"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfessionalForm, {
					userId,
					name,
					initial: editing ?? void 0,
					onSaved: () => {
						setShowForm(false);
						setTone("info");
						setMessage("Solicitud guardada. Consulta su estado y los pendientes antes de considerar confirmado el envío.");
					}
				}, editing?.id || "new")]
			})
		]
	});
}
//#endregion
export { ProfessionalManager };
