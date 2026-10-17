"use client";

import { z } from "zod";
import { useEffect, useState } from "react";
import { HOME_DEFAULTS, homeContentSchema, homeImagePath, type HomeContent } from "@/lib/home-content";

type DocumentState = {content: HomeContent; revision: string | null; publishedAt: string | null};
const fieldGroups: Array<{title: string; fields: Array<[keyof HomeContent, string, number, boolean?]>}> = [
  {title: "Portada", fields: [["heroEyebrow", "Texto superior", 90], ["heroTitle", "Título · primera línea", 90], ["heroSubtitle", "Título · segunda línea", 90], ["heroDescription", "Descripción", 360, true], ["heroPrimaryLabel", "Botón a la finca modelo", 60], ["heroSecondaryLabel", "Botón a Mi Finca", 60], ["heroHint", "Texto de ayuda", 160]]},
  {title: "Presentación de Mi Finca", fields: [["farmEyebrow", "Texto superior", 90], ["farmTitle", "Título", 150], ["farmDescription", "Descripción", 360, true]]},
  {title: "SEO y enlaces compartidos", fields: [["seoTitle", "Título de la página", 100], ["seoDescription", "Descripción para buscadores y redes", 320, true]]},
];
const messages: Record<string, string> = {
  forbidden: "Tu sesión no tiene acceso. Inicia sesión con una cuenta administradora.",
  content_changed_refresh_required: "Otro administrador cambió este contenido. Tu texto sigue aquí. Cópialo antes de recargar y combinar los cambios.",
  content_storage_unavailable: "No pudimos acceder al contenido. Inténtalo de nuevo; no se confirmó el cambio.",
  image_unavailable: "La imagen no está disponible. Vuelve a subirla antes de publicar.",
  invalid_content: "Revisa los campos: usa texto sin HTML y respeta los límites indicados.",
};
async function readResponse<T>(response: Response, schema: z.ZodType<T>) {
  const data: unknown = await response.json().catch(() => ({}));
  const code = z.object({error: z.string()}).safeParse(data);
  if (!response.ok) throw new Error(messages[code.success ? code.data.error : ""] || "No pudimos completar la operación. Revisa tu conexión e inténtalo de nuevo.");
  return schema.parse(data);
}
// Same browser-canvas optimization approach used for company photos, sized for the homepage.
async function optimizeHero(file: File) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 15_000_000) throw new Error("Elige una imagen JPG, PNG o WebP de hasta 15 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error("No pudimos abrir la imagen.")); img.src = url;});
    if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 80_000_000) throw new Error("Reduce la resolución de la imagen antes de subirla.");
    const scale = Math.min(1, 1920 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("No pudimos optimizar la imagen.");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    let quality = .85, dataUrl = "";
    do { dataUrl = canvas.toDataURL("image/webp", quality); quality -= .1; } while (dataUrl.length > 2_500_000 && quality > .3);
    if (dataUrl.length > 2_500_000) throw new Error("La imagen sigue siendo demasiado pesada. Prueba con otra.");
    return dataUrl;
  } finally { URL.revokeObjectURL(url); }
}
export function HomeContentEditor() {
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [content, setContent] = useState<HomeContent>(HOME_DEFAULTS);
  const [busy, setBusy] = useState(true), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const dirty = !!document && JSON.stringify(content) !== JSON.stringify(document.content);
  async function load() {
    setBusy(true); setError(""); setNotice("");
    try { const data = await readResponse(await fetch("/api/admin/home-content", {cache: "no-store"}), z.object({content: homeContentSchema, revision: z.string().uuid().nullable(), publishedAt: z.string().nullable()})); setDocument(data); setContent(data.content); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos cargar el contenido."); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/admin/home-content", {cache: "no-store", signal: controller.signal})
      .then(response => readResponse(response, z.object({content: homeContentSchema, revision: z.string().uuid().nullable(), publishedAt: z.string().nullable()})))
      .then(data => { if (!controller.signal.aborted) { setDocument(data); setContent(data.content); } })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "No pudimos cargar el contenido."); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function mutate(action: "save" | "publish") {
    if (!document || busy) return;
    const validated = homeContentSchema.safeParse(content);
    if (!validated.success) { setError(messages.invalid_content); return; }
    if (action === "publish" && (dirty || !document.revision)) return;
    if (action === "publish" && !window.confirm("¿Publicar el borrador guardado? Los visitantes verán estos textos, la imagen y el SEO en la página de inicio.")) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const data = await readResponse(await fetch("/api/admin/home-content", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({action, expectedRevision: document.revision, ...(action === "save" ? {content: validated.data} : {})})}), z.object({revision: z.string().uuid(), publishedAt: z.string().optional()}));
      setContent(validated.data); setDocument({...document, content: validated.data, revision: data.revision, publishedAt: data.publishedAt ?? document.publishedAt});
      setNotice(action === "save" ? "Borrador guardado. Revisa la vista previa antes de publicar." : "Inicio publicado. Ya puedes comprobarlo en el sitio.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos guardar los cambios."); }
    finally { setBusy(false); }
  }
  async function upload(file: File) {
    setBusy(true); setError(""); setNotice("");
    try {
      const dataUrl = await optimizeHero(file);
      const data = await readResponse(await fetch("/api/admin/home-media", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({dataUrl})}), z.object({src: homeImagePath}));
      setContent(current => ({...current, heroImage: data.src})); setNotice("Imagen optimizada y subida. Añade su descripción y guarda el borrador.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos subir la imagen."); }
    finally { setBusy(false); }
  }
  return <section aria-labelledby="home-editor-title" className="rounded-3xl border border-[#3e2a19]/15 bg-white p-5 sm:p-8">
    <p className="section-kicker">CONTENIDO DEL SITIO</p><h2 id="home-editor-title" className="font-display mt-3 text-3xl sm:text-4xl">Editar página de inicio</h2>
    <p className="mt-3 max-w-3xl text-sm leading-7">Edita la portada, la presentación de Mi Finca, la imagen principal y el SEO. Guarda un borrador, revísalo y publícalo cuando esté listo. Las demás secciones, los enlaces y el diseño conservan su configuración actual.</p>
    <div className="mt-4 flex flex-wrap gap-3 text-sm"><a href="/" target="_blank" rel="noreferrer" className="underline">Ver sitio publicado</a><button type="button" disabled={busy} onClick={() => {if (!dirty || window.confirm("¿Descartar los cambios sin guardar y cargar la última versión?")) void load();}} className="underline disabled:opacity-50">Recargar contenido</button></div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-900">{notice}</p>}
    {!document ? <p className="mt-5 text-sm">{busy ? "Cargando contenido…" : "El editor necesita cargar el contenido antes de guardar."}</p> : <form className="mt-7" onSubmit={event => {event.preventDefault(); void mutate("save");}}>
      <fieldset disabled={busy} className="space-y-7 disabled:opacity-70">
        {fieldGroups.map(group => <fieldset key={group.title} className="rounded-2xl border border-[#3e2a19]/10 p-4 sm:p-5"><legend className="px-2 font-semibold">{group.title}</legend><div className="grid gap-4 sm:grid-cols-2">{group.fields.map(([key, label, max, multiline]) => <label key={key} className={multiline ? "text-sm sm:col-span-2" : "text-sm"}><span className="block font-medium">{label}</span>{multiline ? <textarea rows={3} value={content[key]} required maxLength={max} onChange={event => setContent({...content, [key]: event.target.value})} className="mt-2 w-full rounded-xl border border-[#3e2a19]/25 p-3" /> : <input value={content[key]} required maxLength={max} onChange={event => setContent({...content, [key]: event.target.value})} className="mt-2 w-full rounded-xl border border-[#3e2a19]/25 p-3" />}<span className="text-xs text-[#71685f]">{content[key].length}/{max}</span></label>)}</div></fieldset>)}
        <fieldset className="rounded-2xl border border-[#3e2a19]/10 p-4 sm:p-5"><legend className="px-2 font-semibold">Imagen de portada</legend>
          <img src={content.heroImage} alt={content.heroImageAlt} className="mb-4 aspect-[3/1] w-full rounded-xl object-cover" />
          <label className="block text-sm font-medium">Subir imagen propia (JPG, PNG o WebP; hasta 15 MB)<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={event => {const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file);}} /></label>
          <p className="mt-2 text-xs leading-6 text-[#71685f]">Usa una imagen horizontal que tengas permiso de publicar. Se optimiza en tu navegador antes de subirla; las imágenes de borrador solo son visibles para administradores.</p>
          <button type="button" className="mt-3 text-sm underline" onClick={() => setContent({...content, heroImage: HOME_DEFAULTS.heroImage, heroImageAlt: HOME_DEFAULTS.heroImageAlt})}>Usar imagen original</button>
          <label className="mt-4 block text-sm font-medium">Descripción accesible de la imagen<input value={content.heroImageAlt} required maxLength={180} onChange={event => setContent({...content, heroImageAlt: event.target.value})} className="mt-2 w-full rounded-xl border border-[#3e2a19]/25 p-3" /></label>
        </fieldset>
      </fieldset>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="button-dark disabled:opacity-50">{busy ? "Procesando…" : "Guardar borrador"}</button>
        {document.revision && <a href="/admin/home-preview" target="_blank" rel="noreferrer" className="rounded-full border px-5 py-3 text-sm font-semibold">Vista previa guardada</a>}
        <button type="button" disabled={busy || dirty || !document.revision} onClick={() => void mutate("publish")} className="button-primary disabled:opacity-40">Publicar inicio</button>
      </div>
      <p className="mt-3 text-sm text-[#71685f]">{dirty ? "Hay cambios sin guardar. Guárdalos antes de publicar; la vista previa muestra el último borrador guardado." : "No hay cambios locales pendientes."} {document.publishedAt ? `Última publicación: ${new Date(document.publishedAt).toLocaleString("es-VE")}.` : "Todavía se muestra el contenido original."}</p>
    </form>}
  </section>;
}
