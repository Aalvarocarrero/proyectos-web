"use client";

import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** A deliberately memory-only example. No API, storage or queue operations. */
export function DesignFormExample() {
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = input.current?.value.trim() ?? "";
    if (name.length < 3) {
      setComplete(false);
      setError("Escribe al menos 3 caracteres para identificar esta parcela.");
      input.current?.focus();
      return;
    }
    setError("");
    setComplete(true);
  }
  return <form onSubmit={submit} noValidate aria-describedby="design-form-note" className="space-y-5">
    <p id="design-form-note" className="text-sm leading-6 text-[#675f57]">Ejemplo interactivo. Valida los campos en esta pantalla; no guarda registros, no envía información y se reinicia al salir.</p>
    <div>
      <label htmlFor="design-parcel" className="text-sm font-bold">Nombre de la parcela <span className="font-normal">(obligatorio)</span></label>
      <Input ref={input} id="design-parcel" name="parcel" required minLength={3} maxLength={80} placeholder="Ej. Potrero El Samán" className="mt-2" aria-invalid={!!error} aria-describedby={error ? "design-parcel-hint design-parcel-error" : "design-parcel-hint"} onChange={() => { setError(""); setComplete(false); }} />
      <p id="design-parcel-hint" className="mt-2 text-xs leading-5 text-[#675f57]">Entre 3 y 80 caracteres. Usa un nombre fácil de reconocer.</p>
      {error && <p id="design-parcel-error" role="alert" className="mt-2 text-sm font-semibold text-[#b42318]">{error}</p>}
    </div>
    <div className="flex flex-wrap gap-3">
      <Button type="submit">Probar validación</Button>
      <Button type="reset" variant="outline" onClick={() => { setError(""); setComplete(false); input.current?.focus(); }}><RotateCcw aria-hidden="true" />Reiniciar</Button>
    </div>
    <div role="status" aria-live="polite" aria-atomic="true">{complete && <p className="flex items-start gap-2 rounded-xl border border-[#4c6b3a]/30 bg-[#edf2e7] p-4 text-sm leading-6 text-[#365026]"><CheckCircle2 className="mt-1 shrink-0" size={18} aria-hidden="true" />Campos válidos. Esta es una demostración: no se ha guardado ni enviado nada.</p>}</div>
  </form>;
}
