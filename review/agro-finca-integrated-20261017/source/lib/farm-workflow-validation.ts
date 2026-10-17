/** UI validation before an offline mutation. Server/ownership validation remains authoritative. */
export function farmNumber(value: FormDataEntryValue | null, label: string, minimum = 0): number {
  const raw = String(value ?? "").trim();
  const number = raw === "" ? 0 : Number(raw);
  if (!Number.isFinite(number) || number < minimum) {
    throw new Error(`Revisa: ${label} debe ser un número ${minimum > 0 ? "mayor que cero" : "igual o mayor que cero"}.`);
  }
  return number;
}

export function validateFarmDateRange(start: string, end: string) {
  if (start && end && end < start) throw new Error("Revisa: la fecha de cierre no puede ser anterior a la fecha de inicio.");
}

export function syncOutcomeMessage(reason?: string): string {
  if (reason === "account_changed") return "La cuenta cambió o no se pudo verificar. Tus cambios siguen en este dispositivo. Abre tu cuenta con internet antes de sincronizar.";
  if (reason === "offline" || reason === "network") return "No se pudo conectar. Tus registros locales se conservan; vuelve a intentar cuando tengas señal.";
  if (reason === "server" || reason === "invalid_response") return "El servidor no confirmó el respaldo. Tus registros locales se conservan; intenta sincronizar más tarde.";
  if (reason === "more_pending") return "Quedan cambios por enviar. Pulsa Sincronizar de nuevo para continuar.";
  return "Hay cambios que necesitan revisión. Abre Sincronización para consultar los pendientes antes de volver a guardarlos.";
}

/** Called before dismissing a record editor; busy saves never ask or dismiss. */
export function canDismissFarmDraft(draft: {busy:boolean;dirty:boolean}, confirmDiscard:()=>boolean): boolean {
  if (draft.busy) return false;
  return !draft.dirty || confirmDiscard();
}

/** An empty cache is not proof that an account has no existing farm. */
export function needsFarmAccountCheck(input:{localOnly:boolean;hasFarm:boolean;owner:string;checkedOwner:string|null}):boolean {
  return !input.localOnly && !input.hasFarm && input.checkedOwner !== input.owner;
}
