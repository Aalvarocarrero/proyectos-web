function firstIssue(error) {
	return error instanceof Error && "issues" in error && Array.isArray(error.issues) ? error.issues[0] : void 0;
}
var names = {
	title: "el título",
	name: "el nombre",
	profession: "la profesión",
	specialties: "las especialidades",
	introduction: "la presentación",
	description: "la descripción",
	email: "el correo",
	contact: "el contacto",
	phone: "el teléfono",
	state: "el estado",
	sector: "el rubro",
	summary: "el objetivo del proyecto",
	has: "«Qué tienes hoy»",
	needs: "«Qué apoyo o colaboración necesita el proyecto»",
	impact: "el aporte a la comunidad",
	requestedSupport: "la colaboración solicitada",
	shortIntro: "la frase de presentación",
	photoContext: "la descripción de la foto",
	website: "el sitio web",
	instagram: "el enlace de Instagram",
	facebook: "el enlace de Facebook",
	tiktok: "el enlace de TikTok",
	youtube: "el enlace de YouTube",
	linkedin: "el enlace de LinkedIn",
	threads: "el enlace de Threads",
	x: "el enlace de X",
	pinterest: "el enlace de Pinterest",
	telegram: "el enlace de Telegram",
	message: "tu propuesta",
	area: "el área",
	role: "tu relación con el campo",
	corporateName: "el nombre corporativo",
	priceCents: "el precio",
	responsibleName: "el nombre del responsable",
	municipality: "el municipio",
	rubrics: "los rubros",
	purposes: "las actividades públicas",
	productionProcess: "el proceso de producción",
	saleOptions: "los productos y formas de venta",
	visitConditions: "las condiciones de visita",
	farmType: "el tipo de finca",
	imageDataUrl: "la fotografía",
	objective: "el objetivo de la finca",
	location: "la ubicación"
};
function fieldForIssue(issue) {
	return (issue?.path ?? []).slice().reverse().find((part) => typeof part === "string" && Object.hasOwn(names, part)) ?? "";
}
/** Only allowlisted fields and safe generic messages; never render raw server issues. */
function publicFormError(error, fallback) {
	if (!(error instanceof Error)) return fallback;
	if (error.message === "Confirma el mismo correo electrónico." || error.message.startsWith("Espera")) return error.message;
	const issue = firstIssue(error), field = fieldForIssue(issue), label = names[field];
	if (!issue || !label) return fallback;
	const fieldType = ["has", "needs"].includes(field) ? "list" : field === "purposes" ? "choices" : "text";
	return `Revisa ${label}. ${issue.code === "too_small" && typeof issue.minimum === "number" ? fieldType === "text" ? `Debe tener al menos ${issue.minimum} caracteres.` : "Completa este campo." : issue.code === "too_big" && typeof issue.maximum === "number" ? fieldType === "list" && issue.path?.length === 1 ? "Hay demasiadas entradas." : `Supera el límite técnico de un envío (${issue.maximum} caracteres).` : fieldType === "list" ? "Revisa si el texto supera la capacidad de un envío." : "Comprueba el formato y completa el dato."} Tus datos siguen en el formulario.`;
}
function focusInvalidPublicField(form, error) {
	const field = fieldForIssue(firstIssue(error));
	if (!field) return;
	const element = Array.from(form.elements).find((item) => item instanceof HTMLElement && item.getAttribute("name") === field);
	if (element) requestAnimationFrame(() => {
		if (!element.isConnected) return;
		const details = element.closest("details");
		if (details) details.open = true;
		element.focus();
	});
}
export { publicFormError as n, focusInvalidPublicField as t };
