"use client";

import {authFetch} from "@/lib/auth-fetch";

import { useCallback, useEffect, useState } from "react";

import {
  Check,
  Mail,
  KeyRound,
  Loader2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Status = {
  policyVersion: string;
  consent: null | {
    policyVersion: string;
    essentialAccepted: boolean;
    publicContentAccepted: boolean;
    securitySignalsAccepted: boolean;
  };
  email: string;
  phone: string | null;
  trustedDevice: null | {
    id: string;
    label: string;
    expiresAt: string;
    lastVerifiedAt: string | null;
  };
};

export function SecurityCenter({
  mode = "full",
  requirePublic = false,
}: {
  mode?: "full" | "gate";
  requirePublic?: boolean;
}) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [message, setMessage] = useState("");
  const [publicConsent, setPublicConsent] = useState(false);
  const [phone,setPhone]=useState("");
  const [emailConfirmation,setEmailConfirmation]=useState("");
  const [securityConsent, setSecurityConsent] = useState(false);

  const load = useCallback(async () => {
    const response = await authFetch("/api/security/status", { cache: "no-store" });
    if (response.ok) setStatus((await response.json()) as Status);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void authFetch("/api/security/status", { cache: "no-store" }).then(
      async (response) => {
        if (active && response.ok) setStatus((await response.json()) as Status);
        if (active) setLoading(false);
      },
    ).catch(()=>{if(active){setLoading(false);setMessage("Sin conexión. Tus registros locales siguen disponibles.");}});
    return () => {
      active = false;
    };
  }, []);

  async function acceptConsent() {
    setWorking("consent");
    try {
    const response = await authFetch("/api/security/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        publicContentAccepted: publicConsent,
        securitySignalsAccepted: securityConsent,
        phone, emailConfirmation,
      }),
    });
    if (response.ok) {
      setMessage("Preferencias de privacidad guardadas.");
      await load();
    } else
      setMessage(
        "No pudimos guardar tus preferencias. Intenta nuevamente con conexión.",
      );
    } catch {setMessage("Sin conexión. Completa este primer paso cuando tengas acceso a internet.");} finally {setWorking("");}
  }

  async function trustDevice() {
    setWorking("device");
    const connection =
      (navigator as Navigator & { connection?: { effectiveType?: string } })
        .connection?.effectiveType ?? "no disponible";
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ??
      navigator.platform ??
      "dispositivo";
    const response = await authFetch("/api/security/device", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        label: deviceLabel(),
        platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        connectionClass: connection,
      }),
    });
    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    setMessage(
      response.ok
        ? "Este dispositivo quedó reconocido por 90 días. Puedes revocarlo cuando quieras."
        : result.error === "security_signal_consent_required"
          ? "Activa primero el permiso de señales técnicas en privacidad."
          : "No pudimos reconocer este dispositivo.",
    );
    await load();
    setWorking("");
  }

  async function removeDevice() {
    setWorking("device");
    await authFetch("/api/security/device", { method: "DELETE" });
    setMessage("Se eliminó la confianza de este dispositivo.");
    await load();
    setWorking("");
  }

  const needsConsent =
    !loading &&
    status &&
    (!status.phone || !status.consent || status.consent.policyVersion!==status.policyVersion ||
      (requirePublic && !status.consent.publicContentAccepted));
  if (mode === "gate")
    return (
      <Dialog open={Boolean(needsConsent)}>
        <DialogContent
          className="max-w-xl border-[#3e2a19]/10 bg-[#f3ebdd]"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-3xl">
              Tus datos, bajo tu control.
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#5f574f]">
              Para guardar y sincronizar tu finca necesitamos los datos
              esenciales de tu cuenta y los registros que tú decidas crear. Nada
              privado se convierte en publicación sin tu acción.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-6">
            <p className="break-all text-sm">Correo de tu cuenta: <strong>{status?.email}</strong></p>
            <label className="block font-semibold">Confirma ese correo *<input type="email" value={emailConfirmation} onChange={e=>setEmailConfirmation(e.target.value)} required className="mt-2 block h-12 w-full rounded-xl border px-3" autoComplete="email"/></label>
            <label className="block font-semibold">Celular de contacto *<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} required className="mt-2 block h-12 w-full rounded-xl border px-3" autoComplete="tel" placeholder="+58 412 123 4567"/></label>
            <p className="text-xs">El correo y el celular se guardan en nuestra base de datos para tu cuenta. No enviamos códigos SMS ni tomamos datos biométricos.</p>

            <p className="flex gap-3 rounded-xl bg-white p-4">
              <Check className="mt-1 shrink-0 text-[#4c6b3a]" size={18} />
              <span>
                <strong>Necesario:</strong> cuenta, finca, registros locales y
                sincronización.
              </span>
            </p>
            <label className="flex cursor-pointer gap-3 rounded-xl bg-white p-4">
              <Checkbox
                checked={publicConsent}
                onCheckedChange={(value) => setPublicConsent(Boolean(value))}
              />
              <span>
                <strong>Contenido público:</strong> autorizo publicar los datos
                que yo envíe al marketplace, directorio o proyectos después de
                revisión.
              </span>
            </label>
            <label className="flex cursor-pointer gap-3 rounded-xl bg-white p-4">
              <Checkbox
                checked={securityConsent}
                onCheckedChange={(value) => setSecurityConsent(Boolean(value))}
              />
              <span>
                <strong>Seguridad opcional:</strong> autorizo guardar nombre del
                dispositivo, zona horaria, clase de conexión y una señal de red
                transformada, nunca la IP completa.
              </span>
            </label>
          </div>
          <p className="text-xs leading-5 text-[#71685f]">
            Puedes cambiar o revocar estas opciones en Seguridad y privacidad.
            Consulta la política completa antes de publicar información
            sensible.
          </p>
          {message&&<p role="status" className="text-sm leading-6 text-[#6b4a2f]">{message}</p>}
          <Button
            onClick={() => void acceptConsent()}
            disabled={
              working === "consent" || !phone || emailConfirmation.trim().toLowerCase()!==status?.email.toLowerCase() || (requirePublic && !publicConsent)
            }
            className="h-12 rounded-full bg-[#3e2a19] text-white"
          >
            {working === "consent" && <Loader2 className="animate-spin" />}{" "}
            Aceptar y continuar
          </Button>
        </DialogContent>
      </Dialog>
    );

  if (loading)
    return (
      <div className="flex min-h-52 items-center justify-center">
        <Loader2 className="animate-spin text-[#4c6b3a]" />
      </div>
    );
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SecurityCard icon={Mail} title="Correo y contacto de tu cuenta" status={status?.phone ? "Datos guardados" : "Completa tu contacto"} copy="Confirma el correo de tu cuenta y registra tu celular. Este contacto se guarda de forma privada; no se publica en tu ficha automáticamente.">
          <p className="break-all text-sm font-semibold">{status?.email}</p>
          {status?.phone && <p className="mt-2 text-sm">{status.phone}</p>}
          <p className="mt-3 text-xs leading-6">El acceso se gestiona con tu cuenta de ChatGPT. Repetir el correo confirma el dato; no sustituye una verificación por mensaje.</p>
        </SecurityCard>
        <SecurityCard
          icon={Smartphone}
          title="Dispositivo reconocido"
          status={status?.trustedDevice?.label ?? "No reconocido"}
          copy="Reduce avisos repetitivos durante 90 días. Guardamos señales técnicas mínimas y transformadas, con tu permiso."
        >
          {status?.trustedDevice ? (
            <Button
              onClick={() => void removeDevice()}
              disabled={Boolean(working)}
              variant="outline"
              className="rounded-full bg-white"
            >
              Revocar dispositivo
            </Button>
          ) : (
            <Button
              onClick={() => void trustDevice()}
              disabled={
                Boolean(working) || !status?.consent?.securitySignalsAccepted
              }
              className="rounded-full bg-[#4c6b3a] text-white"
            >
              {working === "device" && <Loader2 className="animate-spin" />}{" "}
              Reconocer este dispositivo
            </Button>
          )}
        </SecurityCard>
      </div>
      <section className="mt-5 rounded-[1.6rem] border border-[#3e2a19]/10 bg-white p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 shrink-0 text-[#4c6b3a]" />
          <div>
            <h3 className="text-lg font-bold">Qué comprobamos y qué no</h3>
            <p className="mt-2 text-sm leading-7 text-[#5f574f]">
              La sesión identifica tu cuenta. El dispositivo reconocido compara un
              token protegido y señales mínimas. La ubicación de red o la IP por
              sí solas nunca se usan como prueba de identidad ni se guarda la IP
              completa.
            </p>
          </div>
        </div>
      </section>
      {message && (
        <p
          role="status"
          className="mt-5 rounded-2xl bg-[#e8f0df] p-4 text-sm font-semibold text-[#365026]"
        >
          {message}
        </p>
      )}
    </div>
  );
}

function SecurityCard({
  icon: Icon,
  title,
  status,
  copy,
  children,
}: {
  icon: typeof KeyRound;
  title: string;
  status: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.6rem] border border-[#3e2a19]/10 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3e2a19] text-white">
          <Icon size={21} />
        </div>
        <span className="rounded-full bg-[#f3ebdd] px-3 py-1 text-xs font-bold">
          {status}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-2 min-h-20 text-sm leading-6 text-[#71685f]">{copy}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function deviceLabel() {
  if (/iPhone/i.test(navigator.userAgent)) return "Mi iPhone";
  if (/iPad/i.test(navigator.userAgent)) return "Mi iPad";
  if (/Macintosh/i.test(navigator.userAgent)) return "Mi Mac";
  if (/Android/i.test(navigator.userAgent)) return "Mi Android";
  return "Mi dispositivo";
}
