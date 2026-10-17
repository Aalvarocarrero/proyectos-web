import { feedbackPayloadSchema } from "@/lib/sync-validation";

export const IDEA_INVITATION_DELAY_MS = 300;
export const IDEA_INVITATION_INTERVAL_MS = 7 * 24 * 60 * 60 * 1_000;
export const IDEA_INVITATION_SEEN_KEY = "venezuela-agro:idea-invitation:last-shown:v1";
export const IDEA_MESSAGE_MAX = 1_500;
export const IDEA_CONTACT_MAX = 180;

export const IDEA_INVITATION_COPY = {
  title: "Tu experiencia puede mejorar el agro venezolano.",
  emphasis: "Cada productor cuenta.",
  invitation: "Comparte qué necesitas o qué idea te gustaría ver en Venezuela Agro.",
  together: "Juntos podemos construir mejores herramientas para el campo.",
  button: "Compartir mi idea",
} as const;

/** Nothing from the idea or contact fields is stored in the frequency record. */
export function isIdeaInvitationDue(lastShown: string | null, now: number): boolean {
  if (!Number.isFinite(now) || now <= 0) return false;
  if (lastShown === null || lastShown.trim() === "") return true;
  const timestamp = Number(lastShown);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return true;
  // A clock moved backwards must not create repeated invitations.
  return now - timestamp >= IDEA_INVITATION_INTERVAL_MS;
}

type FrequencyStorage = Pick<Storage, "getItem" | "setItem">;

/** If the browser cannot retain dismissal, leave the manual trigger available. */
export function claimIdeaInvitation(storage: FrequencyStorage, now: number): boolean {
  try {
    if (!isIdeaInvitationDue(storage.getItem(IDEA_INVITATION_SEEN_KEY), now)) return false;
    const value = String(now);
    storage.setItem(IDEA_INVITATION_SEEN_KEY, value);
    return storage.getItem(IDEA_INVITATION_SEEN_KEY) === value;
  } catch {
    return false;
  }
}

export function markIdeaInvitationSeen(storage: FrequencyStorage, now: number): void {
  try { storage.setItem(IDEA_INVITATION_SEEN_KEY, String(now)); } catch { /* Manual access still works. */ }
}

export type IdeaFieldErrors = { message?: string; contact?: string };

/** Reuse the backend's feedback contract; this is not a second validation schema. */
export function validateIdeaFields(message: string, contact: string) {
  const parsed = feedbackPayloadSchema.safeParse({
    area: "Otro",
    // A general invitation must not assume the visitor is a producer.
    role: "Persona interesada",
    message,
    contact,
  });
  if (parsed.success) return { ok: true as const, payload: parsed.data };
  const errors: IdeaFieldErrors = {};
  for (const issue of parsed.error.issues) {
    if (issue.path[0] === "message") errors.message = "Escribe entre 10 y 1.500 caracteres, sin contar espacios al principio o al final.";
    if (issue.path[0] === "contact") errors.contact = "El contacto puede tener hasta 180 caracteres.";
  }
  return { ok: false as const, errors };
}

export type IdeaOperationStatus = {
  state: "confirmed" | "pending" | "blocked" | "unknown";
  confirmedAt?: string;
  reason?: string;
};

/** Only an acknowledgement of this exact operation permits a received receipt. */
export function ideaReceiptText(status: IdeaOperationStatus): string {
  switch (status.state) {
    case "confirmed": return "Idea recibida. Evaluaremos tu propuesta para mejorar Venezuela Agro; no implica una implementación garantizada.";
    case "blocked": return "Tu idea se guardó en este dispositivo, pero el servidor no la aceptó. Su recepción no está confirmada.";
    case "unknown": return "Tu idea se guardó en este dispositivo. No tenemos confirmación de recepción en el espacio actual. Tu texto sigue aquí.";
    default: return "Idea guardada en este dispositivo, pendiente de envío. Todavía no tenemos confirmación del servidor. Puedes reintentar aquí cuando tengas conexión.";
  }
}

/** Once per browser session; historical seven-day localStorage choices stay untouched. */
export const IDEA_VISIT_SHOWN_KEY="venezuela-agro:idea-invitation:session:v1";
export function claimIdeaVisit(storage:FrequencyStorage):boolean{try{if(storage.getItem(IDEA_VISIT_SHOWN_KEY)==="true")return false;storage.setItem(IDEA_VISIT_SHOWN_KEY,"true");return storage.getItem(IDEA_VISIT_SHOWN_KEY)==="true";}catch{return false;}}
export function markIdeaVisit(storage:FrequencyStorage):void{try{storage.setItem(IDEA_VISIT_SHOWN_KEY,"true");}catch{/* Manual controls remain available. */}}
