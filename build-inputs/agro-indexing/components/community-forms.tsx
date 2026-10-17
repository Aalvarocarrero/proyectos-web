"use client";

import { FormEvent, useState, useEffect, useRef } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createLocalId, queueMutation, syncNow, getOperationStatus } from "@/lib/offline-db";
import { venezuelanStates } from "@/lib/venezuela";
import { professionalDetailsSchema, professionalTariffsForEditing, serviceModes, agroSectors } from "@/lib/professional-profile";
import { selectVerifiedDashboardOwner } from "@/lib/offline-owner";
import { professionalPayloadSchema,projectPayloadSchema,feedbackPayloadSchema } from "@/lib/sync-validation";
import { withFormDefaults } from "@/lib/form-defaults";
import type {CachedEntity} from "@/lib/offline-db";
import { SecurityCenter } from "@/components/security-center";
import { FormalSubmissionNotice } from "@/components/formal-submission-notice";
import { clearFormalDraft, FormalSubmissionAuthError, formalSubmissionError, formalSubmissionLoginPath, formalSubmissionNeedsLogin, isFormalSubmissionAuthError, loadFormalDraft, requireFormalSubmissionSession, requiresFormalSession, saveFormalDraft } from "@/lib/formal-submission";

type FeedbackLoginDraft = { fields: Record<string, string>; operationId: string | null; expectedOwner?: string };

import { FormFeedback, PublicFormGuide, type FormFeedbackTone } from "@/components/form-feedback";
import { publicFormError } from "@/lib/public-form-errors";

import {ProfessionalTariffFields, tariffsToDraft} from "@/components/professional-tariffs";
import {socialFields} from "@/lib/network-profile";

export function ProfessionalForm({ name,userId,draftOwner,initial,onSaved }: { name: string;userId?:string;draftOwner?:string;initial?:CachedEntity<Record<string,unknown>>;onSaved?:()=>void }) {
  useEffect(()=>{if(userId)selectVerifiedDashboardOwner(userId);},[userId]);
  const details=(initial?.payload.profileDetails||{}) as Record<string,unknown>;
  const [tariffs,setTariffs]=useState(()=>tariffsToDraft(professionalTariffsForEditing(details)));
  const [profileType,setProfileType]=useState(String(details.profileType||"Persona natural"));
  const [photo,setPhoto]=useState("");
  const [photoMessage,setPhotoMessage]=useState("");
  const [processing,setProcessing]=useState(false);
  async function selectPhoto(file?:File) {
    if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>12000000){setPhotoMessage("Elige una fotografía JPG, PNG o WebP de menos de 12 MB.");return;}
    setProcessing(true);setPhotoMessage("");
    const objectUrl=URL.createObjectURL(file);
    try {
      const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const i=new window.Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=objectUrl;});
      const canvas=document.createElement('canvas'),scale=Math.min(1,640/Math.max(image.naturalWidth,image.naturalHeight));
      canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);
      const context=canvas.getContext('2d');if(!context)throw new Error('canvas');context.drawImage(image,0,0,canvas.width,canvas.height);
      const data=canvas.toDataURL('image/webp',.78);if(data.length>650000)throw new Error('size');
      setPhoto(data);setPhotoMessage("Fotografía optimizada y lista para guardar.");
    } catch {setPhotoMessage("No pudimos procesar la fotografía. Prueba con otra imagen.");}
    finally {URL.revokeObjectURL(objectUrl);setProcessing(false);}
  }
  return <QueuedForm entityType="professional" expectedOwner={userId??draftOwner} initialId={initial?.id} initialRevision={initial?.serverRevision} initialData={initial?{...initial.payload,...details,...(details.socials as Record<string,unknown>||{}),emailConfirmation:details.email}:undefined} success="Perfil recibido para revisión. Aún no está publicado." onSaved={()=>{setPhoto("");setPhotoMessage("");setTariffs([]);onSaved?.();}}
    build={form=>{
      if(processing)throw new Error("Espera a que termine la optimización de la fotografía.");
      const email=String(form.get("email")||"").trim();
      if(!email || email.toLowerCase()!==String(form.get("emailConfirmation")||"").trim().toLowerCase())throw new Error("Confirma el mismo correo electrónico.");
      const payload={
        name:String(form.get("name")||name),profession:String(form.get("profession")||""),specialties:String(form.get("specialties")||""),
        state:String(form.get("state")||""),municipality:String(form.get("municipality")||""),serviceMode:String(form.get("serviceMode")||"Presencial y remoto"),
        introduction:String(form.get("introduction")||""),contact:String(form.get("contact")||""),credentialNote:String(form.get("credentialNote")||""),
        profileDetails:professionalDetailsSchema.parse({
          tariffs:tariffs.map(tariff=>({...tariff,amount:tariff.amount.trim()?Number(tariff.amount):NaN})),
          profileType,corporateName:String(form.get("corporateName")||""),tradeName:String(form.get("tradeName")||""),responsibleName:String(form.get("responsibleName")||""),taxId:String(form.get("taxId")||""),registrationBody:String(form.get("registrationBody")||""),registrationReference:String(form.get("registrationReference")||""),bookingProcess:String(form.get("bookingProcess")||""),availability:String(form.get("availability")||""),socials:Object.fromEntries(socialFields.map(([key])=>[key,String(form.get(key)||"")])),
          yearsExperience:Number(form.get("yearsExperience")||0),careerStage:String(form.get("careerStage")||"En ejercicio"),
          university:String(form.get("university")||""),degree:String(form.get("degree")||""),graduationYear:String(form.get("graduationYear")||""),
          training:String(form.get("training")||""),trajectory:String(form.get("trajectory")||""),projects:String(form.get("projects")||""),services:String(form.get("services")||""),
          coverageStates:form.getAll("coverageStates"),sectors:form.getAll("sectors"),email:String(form.get("email")||""),whatsapp:form.get("whatsapp")==="on",
          website:String(form.get("website")||""),linkedin:String(form.get("linkedin")||""),instagram:String(form.get("instagram")||""),...(photo?{imageDataUrl:photo}:{})
        })
      };
      return professionalPayloadSchema.parse(payload);
    }}>
    <p className="sm:col-span-2 text-sm leading-6 text-[#5f574f]">Cuéntanos cómo ayudas al campo. Aceptamos recién graduados y profesionales con experiencia. Publicaremos únicamente los datos que incluyas en este perfil, después de revisión.</p>
    <Field label="Tipo de perfil"><select value={profileType} onChange={e=>setProfileType(e.target.value)} className="h-12 w-full rounded-md border bg-white px-3 text-sm"><option value="Persona natural">Profesional independiente · persona natural</option><option>Empresa</option></select></Field>
    {profileType==="Empresa"&&<fieldset className="sm:col-span-2 min-w-0 rounded-2xl border bg-white p-4"><legend>Datos de la empresa</legend><div className="grid gap-4 sm:grid-cols-2">{[["corporateName","Nombre corporativo *"],["tradeName","Nombre comercial"],["responsibleName","Nombre del responsable"],["taxId","RIF público (opcional)"],["registrationBody","Ente o registro declarado"],["registrationReference","Referencia pública del registro (opcional)"]].map(([key,label])=><Field key={key} label={label}><Input name={key} maxLength={key==="taxId"?80:key==="responsibleName"?120:180} required={key==="corporateName"}/></Field>)}</div><p className="mt-3 text-xs leading-6">Estos datos aparecerán en el perfil. No subas documentos de identidad ni datos privados. Un registro declarado no equivale a verificación de la plataforma.</p></fieldset>}
    <Field label={profileType==="Empresa"?"Nombre visible de la empresa *":"Nombre profesional *"}><Input name="name" defaultValue={name} required minLength={3} maxLength={120}/></Field>
    <Field label="Profesión u oficio *"><Input name="profession" required minLength={2} maxLength={100} list="agro-professions" placeholder="Veterinaria, agronomía, piloto de drones…"/><datalist id="agro-professions">{["Medicina veterinaria","Ingeniería agronómica","Zootecnia","Piloto de drones agrícolas","Técnico agropecuario","Ingeniería agrícola","Gestión y comercialización","Derecho agrario","Operación de maquinaria y construcción de lagunas","Mecánica de maquinaria agrícola","Topografía","Logística agropecuaria"].map(v=><option key={v} value={v}/>)}</datalist></Field>
    <Field label="Especialidades *"><Input name="specialties" required minLength={3} maxLength={500} placeholder="Ej. bovinos, reproducción, cacao, riego"/></Field>
    <StateField defaultValue={String(initial?.payload.state||"")}/><Field label="Municipio o zona"><Input name="municipality" maxLength={100}/></Field>
    <Field label="Modalidad de atención"><select name="serviceMode" defaultValue="Presencial y remoto" className="h-12 w-full rounded-md border bg-white px-3 text-sm">{serviceModes.map(m=><option key={m}>{m}</option>)}</select></Field>
    <ProfessionalTariffFields value={tariffs} onChange={setTariffs}/>
    <Field label="Etapa profesional"><select name="careerStage" className="h-12 w-full rounded-md border bg-white px-3 text-sm" defaultValue="En ejercicio">{["Recién graduado","En ejercicio","Especialista","Consultor / trayectoria avanzada"].map(m=><option key={m}>{m}</option>)}</select></Field>
    <Field label="Años de experiencia"><Input name="yearsExperience" type="number" min={0} max={80} step={1} defaultValue={0}/><span className="mt-1 block text-xs font-normal">Puedes comenzar con cero años.</span></Field>
    <label className="sm:col-span-2 text-sm font-semibold">Presentación *<Textarea name="introduction" required minLength={20} maxLength={1200} className="mt-2 min-h-28" placeholder="¿A quién ayudas y qué problemas resuelves? Menciona tus rubros y zona de atención con tus propias palabras."/></label>
    <Field label="Teléfono / celular *"><Input name="contact" type="tel" inputMode="tel" required maxLength={40} pattern="[+0-9 ().-]{7,40}" placeholder="Ej. +58 412 123 4567"/></Field>
    <Field label="Correo de contacto público *"><Input name="email" type="email" required maxLength={180}/></Field><Field label="Confirma el correo *"><Input name="emailConfirmation" type="email" required maxLength={180}/></Field>
    <label className="sm:col-span-2 flex min-h-11 items-center gap-3 text-sm"><input name="whatsapp" type="checkbox" className="size-5"/> Mi teléfono recibe WhatsApp</label>
    <fieldset className="sm:col-span-2 min-w-0 rounded-2xl border bg-white p-4"><legend className="px-2 text-sm font-semibold">Fotografía y formación</legend><div className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2 text-sm font-semibold">{profileType==="Empresa"?"Logo o fotografía de la empresa (opcional)":"Fotografía o marca profesional (opcional)"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={processing} onChange={e=>selectPhoto(e.target.files?.[0])} className="mt-2 block w-full min-w-0 text-xs"/><span role="status" className="mt-2 block text-xs font-normal">{processing?"Optimizando fotografía…":photoMessage}</span>{photo&&<><img src={photo} width={96} height={96} alt="Vista previa de tu fotografía" className="mt-3 size-24 rounded-xl object-cover"/><button type="button" onClick={()=>{setPhoto("");setPhotoMessage("");}} className="mt-2 min-h-11 text-xs underline">Quitar fotografía</button></>}</label>
      <Field label="Universidad o institución"><Input name="university" maxLength={180}/></Field><Field label="Título obtenido"><Input name="degree" maxLength={180}/></Field><Field label="Año de graduación"><Input name="graduationYear" inputMode="numeric" maxLength={4} pattern="(19|20)[0-9]{2}" placeholder="2024"/></Field><Field label="Colegio, matrícula o respaldo"><Input name="credentialNote" maxLength={500} placeholder="Información declarada por el profesional"/></Field>
      <label className="sm:col-span-2 text-sm font-semibold">Cursos y certificaciones<Textarea name="training" maxLength={1800} className="mt-2" placeholder="Institución, curso y año. Incluye únicamente credenciales reales."/></label>
    </div></fieldset>
    <fieldset className="sm:col-span-2 min-w-0 rounded-2xl border bg-white p-4"><legend className="px-2 text-sm font-semibold">Servicios y trayectoria</legend><div className="grid gap-4">
     {[['services','Servicios que ofreces','Ej. visitas veterinarias, planes de siembra, cartografía con drones',1800],['trajectory','Tu trayectoria','Cuéntanos tu experiencia. Si comienzas, puedes mencionar prácticas profesionales.',2400],['projects','Proyectos en los que has participado','Nombre del proyecto, tu función, lugar y fecha. No incluyas datos privados de clientes.',2400]].map(([field,label,placeholder,max])=><label key={field} className="text-sm font-semibold">{label}<Textarea name={String(field)} maxLength={Number(max)} placeholder={String(placeholder)} className="mt-2 min-h-24"/></label>)}
    </div></fieldset>
    <fieldset className="sm:col-span-2 min-w-0 rounded-2xl border bg-white p-4"><legend className="px-2 text-sm font-semibold">Rubros que atiendes</legend><div className="grid gap-2 sm:grid-cols-2">{agroSectors.map(v=><label key={v} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="sectors" value={v} className="size-4"/>{v}</label>)}</div><p className="mt-3 text-xs text-[#71685f]">Si falta tu rubro, escríbelo en Especialidades.</p></fieldset>
    <details className="sm:col-span-2 rounded-2xl border bg-white p-4"><summary className="cursor-pointer text-sm font-semibold">Otros estados donde prestas servicios (opcional)</summary><div className="mt-4 grid gap-2 sm:grid-cols-2">{venezuelanStates.map(v=><label key={v} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="coverageStates" value={v} className="size-4"/>{v}</label>)}</div></details>
    <details className="sm:col-span-2 rounded-2xl border bg-white p-4"><summary className="cursor-pointer text-sm font-semibold">Redes y sitio web (opcional)</summary><div className="mt-4 grid gap-4">{socialFields.map(([field,label])=><Field key={field} label={label}><Input name={field} type="url" maxLength={500} placeholder="https://…"/></Field>)}</div></details>
    <label className="sm:col-span-2 text-sm font-semibold">¿Cómo se reserva tu servicio?<Textarea name="bookingProcess" maxLength={1200} className="mt-2" placeholder="Contacto, visita previa, cotización, confirmación y modalidades disponibles. Las reservas se coordinan directamente; la plataforma no confirma citas."/></label><Field label="Horarios y disponibilidad"><Input name="availability" maxLength={500}/></Field>
    <p className="sm:col-span-2 text-xs leading-6 text-[#71685f]">Tu profesión, especialidades, servicios y estados nos ayudan a organizar tu perfil para que los productores te encuentren. No necesitas conocimientos de SEO ni repetir palabras clave.</p>
  </QueuedForm>;
}

export function ProjectForm({userId,draftOwner}:{userId?:string;draftOwner?:string}) {
  useEffect(()=>{if(userId)selectVerifiedDashboardOwner(userId);},[userId]);
  return (
    <QueuedForm
      entityType="project"
      expectedOwner={userId??draftOwner}
      success="Proyecto agropecuario recibido para revisión editorial. Su publicación y cualquier apoyo requieren evaluación; no están garantizados."
      build={(form) => projectPayloadSchema.parse({
        title: String(form.get("title") || ""),
        sector: String(form.get("sector") || ""),
        state: String(form.get("state") || ""),
        summary: String(form.get("summary") || ""),
        has: splitList(String(form.get("has") || "")),
        needs: splitList(String(form.get("needs") || "")),
        impact: String(form.get("impact") || ""),
        requestedSupport: String(form.get("requestedSupport") || ""),
        contact: String(form.get("contact") || ""),
      })}
    >
      <p className="sm:col-span-2 text-sm leading-6">Cuéntanos tu proyecto agropecuario: su objetivo, recursos y necesidades de apoyo o colaboración. Para proponer cambios en las herramientas de Venezuela Agro, utiliza «Tu idea».</p>
      <Field label="Nombre del proyecto agropecuario *">
        <Input name="title" required />
      </Field>
      <Field label="Rubro *">
        <Input
          name="sector"
          required
          placeholder="Ganadería, cacao, logística…"
        />
      </Field>
      <StateField />
      <Field label="Contacto *">
        <Input name="contact" required />
      </Field>
      <label className="text-sm font-semibold sm:col-span-2">
        ¿Cuál es el objetivo de tu proyecto? *
        <Textarea
          name="summary"
          required
          minLength={30}
          className="mt-2 min-h-28"
        />
      </label>
      <label className="text-sm font-semibold">
        ¿Qué tienes hoy? *
        <Textarea
          name="has"
          required
          className="mt-2"
          placeholder="Separa los puntos con comas"
        />
      </label>
      <label className="text-sm font-semibold">
        ¿Qué apoyo o colaboración necesita el proyecto? *
        <Textarea
          name="needs"
          required
          className="mt-2"
          placeholder="Inversión, logística, profesionales…"
        />
      </label>
      <label className="text-sm font-semibold sm:col-span-2">
        Aporte a tu comunidad o a Venezuela *
        <Textarea name="impact" required minLength={20} className="mt-2" />
      </label>
      <label className="text-sm font-semibold sm:col-span-2">
        ¿Qué colaboración buscas a través de Venezuela Agro? *
        <Textarea
          name="requestedSupport"
          required
          minLength={10}
          className="mt-2"
        />
      </label>
    </QueuedForm>
  );
}

export function FeedbackPanel() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let current = true;
    if (requiresFormalSession() && new URLSearchParams(window.location.search).get("resume") === "feedback") queueMicrotask(() => { if (current) setOpen(true); });
    return () => { current = false; };
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="feedback-trigger fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-[90] flex h-11 w-11 items-center justify-center gap-2 rounded-full bg-[#e5927c] text-sm font-bold text-[#211d1a] shadow-xl transition sm:right-5 sm:w-auto sm:px-4"
          aria-label="Proponer una mejora para la plataforma"
        >
          <Lightbulb size={18} />
          <span className="hidden sm:inline">Proponer mejora</span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#f3ebdd]">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">
            El campo también diseña esto.
          </DialogTitle>
          <DialogDescription>
            Cuéntanos qué falta o qué debería ser más fácil.
          </DialogDescription>
        </DialogHeader>
        <QueuedForm
          entityType="feedback"
          success="Sugerencia guardada. Gracias por ayudarnos a mejorar."
          build={(form) => ({
            area: String(form.get("area") || "Sitio web"),
            role: String(form.get("role") || "Productor"),
            message: String(form.get("message") || ""),
            contact: String(form.get("contact") || ""),
          })}
          compact
        >
          <label className="text-sm font-semibold">
            Área
            <select
              name="area"
              className="mt-2 h-12 w-full rounded-md border bg-white px-3"
            >
              <option>Sitio web</option>
              <option>Mercado Agro</option>
              <option>Mi Finca</option>
              <option>Profesionales</option>
              <option>Proyectos</option>
              <option>Otro</option>
            </select>
          </label>
          <Field label="Tu relación con el campo *">
            <Input
              name="role"
              required
              placeholder="Productor, veterinaria, comprador…"
            />
          </Field>
          <label className="text-sm font-semibold sm:col-span-2">
            Tu propuesta *
            <Textarea
              name="message"
              required
              minLength={10}
              className="mt-2 min-h-28"
            />
          </label>
          <Field label="Contacto opcional">
            <Input name="contact" />
          </Field>
        </QueuedForm>
      </DialogContent>
    </Dialog>
  );
}

function QueuedForm({
  entityType,
  expectedOwner,
  initialId,initialRevision,initialData,
  success,
  build,
  children,
  compact = false,
  onSaved,
}: {
  entityType: "professional" | "project" | "feedback";
  expectedOwner?:string;
  initialId?:string;initialRevision?:string|null;initialData?:Record<string,unknown>;
  success: string;
  build: (form: FormData) => Record<string, unknown>;
  children: React.ReactNode;
  compact?: boolean;
  onSaved?: () => void;
}) {
  const [working, setWorking] = useState(false);
  const submitLock=useRef(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<FormFeedbackTone>("info");
  const formRef = useRef<HTMLFormElement>(null);
  const [loginNeeded, setLoginNeeded] = useState(false);
  const [feedbackOperationId, setFeedbackOperationId] = useState<string | null>(null);
  const feedbackOperation = useRef<string | null>(null);
  const feedbackOwner = useRef<string | undefined>(expectedOwner);
  const feedbackFields = useRef<Record<string, string>>({});
  const [restoredFields, setRestoredFields] = useState<Record<string, string>>();
  const formalFeedback = entityType === "feedback" && requiresFormalSession();

  useEffect(() => {
    if (!formalFeedback || new URLSearchParams(window.location.search).get("resume") !== "feedback") return;
    const draft = loadFormalDraft<FeedbackLoginDraft>("feedback");
    if (!draft || !draft.fields || typeof draft.fields !== "object" || Array.isArray(draft.fields)) return;
    const fields = Object.fromEntries(Object.entries(draft.fields).filter(([key, value]) => ["area", "role", "message", "contact"].includes(key) && typeof value === "string"));
    feedbackFields.current = fields;
    feedbackOperation.current = typeof draft.operationId === "string" ? draft.operationId : null;
    feedbackOwner.current = typeof draft.expectedOwner === "string" ? draft.expectedOwner : undefined;
    setFeedbackOperationId(feedbackOperation.current); setRestoredFields(fields);
    setMessage("Borrador recuperado. Revisa tu comentario y confirma el envío; volver de Google no lo envía automáticamente.");
  }, [formalFeedback]);

  function login() {
    if (submitLock.current || !formRef.current) return;
    const fields = feedbackOperation.current ? feedbackFields.current : feedbackFormFields(new FormData(formRef.current));
    if (!saveFormalDraft("feedback", { fields, operationId: feedbackOperation.current, expectedOwner: feedbackOwner.current } satisfies FeedbackLoginDraft)) {
      setTone("error"); setMessage("El navegador no pudo conservar el borrador. Copia tu texto antes de iniciar sesión; no salimos del formulario.");
      return;
    }
    window.location.assign(formalSubmissionLoginPath("feedback", window.location.pathname + window.location.search + window.location.hash));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(submitLock.current)return;
    submitLock.current=true;
    const formElement = event.currentTarget;
    setWorking(true);
    setMessage("");
    const form = new FormData(formElement);
    try {
      let owner = expectedOwner;
      if (formalFeedback) {
        if (feedbackOperation.current && !feedbackOwner.current) throw new FormalSubmissionAuthError("submission_account_mismatch");
        const verified = await requireFormalSubmissionSession(feedbackOwner.current);
        if (verified) { owner = verified; feedbackOwner.current = verified; selectVerifiedDashboardOwner(verified); }
        setLoginNeeded(false);
      }
      let operationId = formalFeedback ? feedbackOperation.current : null;
      let receipt = operationId ? await getOperationStatus(operationId) : null;
      if (receipt?.state === "unknown") {
        setTone("info"); setMessage("Tu texto sigue aquí, pero no encontramos la confirmación del envío en esta cuenta. No creamos otro para evitar duplicados.");
        return;
      }
      if (!operationId) {
        const payload = build(form);
        const valid = entityType === "feedback" ? feedbackPayloadSchema.parse(payload) : payload;
        const operation = await queueMutation({ expectedOwner: owner,
          entityType,
          entityId: initialId ?? createLocalId(entityType),
          baseRevision: initialRevision ?? null,
          action: "upsert",
          payload: valid,
        });
        operationId = operation.id;
        if (formalFeedback) {
          feedbackFields.current = feedbackFormFields(form);
          feedbackOperation.current = operation.id; setFeedbackOperationId(operation.id);
        }
      }
      const result = receipt?.state === "confirmed" || receipt?.state === "blocked"
        ? undefined : await syncNow().catch(() => ({ reason: "connection_interrupted" }));
      // Authentication failures never clear fields or report a successful formal submission.
      if (formalSubmissionNeedsLogin(result)) {
        setLoginNeeded(true); setTone("error"); setMessage(formalSubmissionError(undefined));
        return;
      }
      receipt = await getOperationStatus(operationId);
      if (formalSubmissionNeedsLogin(receipt)) {
        setLoginNeeded(true); setTone("error"); setMessage(formalSubmissionError(undefined));
        return;
      }
      setTone(receipt.state === "confirmed" ? "success" : "info");
      setMessage(
        receipt.state === "confirmed"
          ? success
          : result?.reason === "account_contact_required" ? "Guardado en este dispositivo. Completa el correo y celular de tu cuenta para sincronizar." : result?.reason === "public_content_consent_required"
            ? "Autoriza primero la publicación de contenido. Tu borrador quedó guardado en este dispositivo."
            : receipt.state === "blocked" ? "Borrador conservado. Revisa el motivo en Mi Finca → Sincronización." : entityType === "project" ? "Proyecto agropecuario guardado en este dispositivo. Su envío a revisión todavía no está confirmado." : "Guardado en este dispositivo. El envío aún no está confirmado.",
      );
      if (formalFeedback && receipt.state !== "confirmed") return;
      if (formalFeedback) {
        clearFormalDraft("feedback"); feedbackOperation.current = null; feedbackOwner.current = undefined; feedbackFields.current = {};
        setFeedbackOperationId(null); setRestoredFields(undefined);
      }
      formElement.reset();
      onSaved?.();
    } catch (error) {
      setTone("error");
      const authError = error instanceof Error && error.message === "account_changed_reopen_form"
        ? new FormalSubmissionAuthError("submission_account_mismatch") : error;
      if (isFormalSubmissionAuthError(authError)) { setLoginNeeded(true); setMessage(formalSubmissionError(authError)); }
      else setMessage(publicFormError(error, "No pudimos guardar la información. Tus datos siguen en el formulario para que puedas intentarlo otra vez."));
    } finally {
      submitLock.current=false;
      setWorking(false);
    }
  }

  return (
    <>
      {entityType !== "feedback" && (
        <SecurityCenter mode="gate" requirePublic />
      )}
      <form
        ref={formRef}
        onSubmit={submit}
        aria-busy={working}
        className={
          compact ? "grid gap-4 sm:grid-cols-2" : "grid gap-5 sm:grid-cols-2"
        }
      >
        {!compact && <div className="sm:col-span-2"><PublicFormGuide /></div>}
        {formalFeedback && <div className="sm:col-span-2"><FormalSubmissionNotice onLogin={login} loginNeeded={loginNeeded} /></div>}
        {feedbackOperationId && <p className="sm:col-span-2 text-xs leading-5">Este comentario ya está guardado. Comprobaremos el mismo envío para evitar duplicados; el texto se conserva sin cambios.</p>}
        <fieldset disabled={working || Boolean(feedbackOperationId)} className="contents">{withFormDefaults(children,restoredFields ?? initialData)}</fieldset>
        <div className="sm:col-span-2"><FormFeedback message={message} tone={tone} /></div>
        <Button
          type="submit"
          disabled={working}
          className="sm:col-span-2 min-w-0 min-h-12 h-auto max-w-full whitespace-normal rounded-full bg-[#3e2a19] py-3 text-white"
        >
          {working && <Loader2 className="animate-spin" />}
          {working ? "Guardando solicitud…" : entityType === "professional"
            ? "Enviar perfil"
            : entityType === "project"
              ? "Enviar proyecto agropecuario"
              : feedbackOperationId ? "Comprobar envío" : "Enviar sugerencia"}
        </Button>
      </form>
    </>
  );
}

function feedbackFormFields(form: FormData): Record<string, string> {
  return Object.fromEntries(["area", "role", "message", "contact"].map(key => [key, String(form.get(key) || "")]));
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
function StateField({defaultValue=""}:{defaultValue?:string}) {
  return (
    <label className="text-sm font-semibold">
      Estado *
      <select
        name="state"
        defaultValue={defaultValue}
        required
        className="mt-2 h-12 w-full rounded-md border bg-white px-3"
      >
        <option value="">Seleccionar</option>
        {venezuelanStates.map((state) => (
          <option key={state}>{state}</option>
        ))}
      </select>
    </label>
  );
}
function splitList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}
