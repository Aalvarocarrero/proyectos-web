/** Translate schema failures into actionable feedback without exposing internal error payloads. */
export function publicFormError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  if (error.message === "Confirma el mismo correo electrónico." || error.message.startsWith("Espera")) return error.message;
  if ("issues" in error && Array.isArray(error.issues)) {
    const issue = error.issues[0] as { path?: (string | number)[]; code?: string; minimum?: number; maximum?: number } | undefined;
    const field = String(issue?.path?.at(-1) ?? "");
    const names: Record<string, string> = { title:"el título", name:"el nombre", profession:"la profesión", specialties:"las especialidades", introduction:"la presentación", description:"la descripción", email:"el correo", contact:"el teléfono de contacto", phone:"el teléfono", state:"el estado", summary:"el objetivo del proyecto", impact:"el aporte a la comunidad", requestedSupport:"la colaboración solicitada", shortIntro:"la frase de presentación", photoContext:"la descripción de la foto", website:"el sitio web", instagram:"el enlace de Instagram", facebook:"el enlace de Facebook", message:"tu propuesta", corporateName:"el nombre corporativo", priceCents:"el precio" };
    const label = names[field];
    if (label) return `Revisa ${label}.${issue?.code === "too_small" && typeof issue.minimum === "number" ? ` Debe tener al menos ${issue.minimum} caracteres.` : issue?.code === "too_big" && typeof issue.maximum === "number" ? ` Supera el límite permitido (${issue.maximum}).` : " Comprueba el formato y completa el dato."} Tus datos siguen en el formulario.`;
    return "Revisa los campos: teléfono, enlaces y límites de texto deben ser válidos. Tus datos siguen en el formulario.";
  }
  return fallback;
}
