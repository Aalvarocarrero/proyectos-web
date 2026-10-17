"use client";

import { ChangeEvent, FormEvent, useState, useEffect, useRef } from "react";
import {AgroCategoryIcon} from "@/components/agro-category-icon";
import { MarketplacePublishFields, emptyMarketplaceExtras } from "@/components/marketplace-publish-extras";
import { Camera, CloudOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createLocalId, queueMutation, syncNow, getOperationStatus } from "@/lib/offline-db";
import { marketplaceCategories } from "@/lib/marketplace-categories";
import { listingPayloadSchema } from "@/lib/sync-validation";
import { selectVerifiedDashboardOwner } from "@/lib/offline-owner";
import { listingContactSchema,phoneDigits } from "@/lib/listing-contact";
import { FormFeedback, PublicFormGuide, type FormFeedbackTone } from "@/components/form-feedback";
import { publicFormError } from "@/lib/public-form-errors";
import { PriceConversion } from "@/components/price-conversion";
import { currencies, currencyLabels } from "@/lib/exchange-rates";
import { venezuelanStates } from "@/lib/venezuela";

export function ListingForm({ sellerName,userId,draftOwner }: { sellerName: string;userId?:string;draftOwner?:string }) {
  useEffect(()=>{if(userId)selectVerifiedDashboardOwner(userId);},[userId]);
  const locked=useRef(false);
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [pricePreview,setPricePreview]=useState("");
  const [currency, setCurrency] = useState("USD");
  const [state, setState] = useState("");
  const [buyerType, setBuyerType] = useState("Personas y empresas");
  const [supplyUnit, setSupplyUnit] = useState("unidad");
  const [imageDataUrl, setImageDataUrl] = useState<string>();
  const [imageName, setImageName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<FormFeedbackTone>("info");
  const [processing, setProcessing] = useState(false);
  const [extras,setExtras]=useState(emptyMarketplaceExtras);
  const [extrasKey,setExtrasKey]=useState(0);

  async function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setTone("error");
    if (!file.type.startsWith("image/")) {
      setMessage("Selecciona una fotografía válida.");
      return;
    }
    if (file.size > 12_000_000) {
      setMessage("La fotografía original debe pesar menos de 12 MB.");
      return;
    }
    setProcessing(true);
    try {
      const optimized = await optimizeImage(file);
      if (optimized.length > 1_900_000) {
        setMessage("No pudimos comprimir la fotografía lo suficiente. Elige una más liviana.");
        return;
      }
      setImageName(`${file.name} · optimizada`);
      setImageDataUrl(optimized);
      setMessage("");
    } catch {
      setMessage("No pudimos procesar esa imagen. Intenta con JPG, PNG o WebP.");
    } finally { setProcessing(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(locked.current || processing)return;
    setTone("error");
    if(!imageDataUrl){setMessage("Añade una fotografía real de lo que ofreces antes de enviarlo a revisión.");return;}
    const resolvedCategory = category === "Otra categoría" ? customCategory.trim() : category;
    if (!resolvedCategory) {
      setMessage("Selecciona una categoría.");
      return;
    }
    if (!state) {
      setMessage("Selecciona el estado donde está la oferta.");
      return;
    }
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const contactResult = listingContactSchema.safeParse({
      responsibleName: form.get("responsibleName"), phone: form.get("phone"), farmName: form.get("farmName"),
      whatsapp: form.get("whatsapp") === "on", advertiserType: form.get("advertiserType"),
      contactHours: form.get("contactHours"), deliveryMode: form.get("deliveryMode"),
      instagram: form.get("instagram"), facebook: form.get("facebook"), tiktok: form.get("tiktok"),
      youtube: form.get("youtube"), googleBusiness: form.get("googleBusiness"), website: form.get("website"),
    });
    if (!contactResult.success) { setMessage(contactResult.error.issues[0]?.message || "Revisa tus datos de contacto."); return; }
    if(contactResult.data.whatsapp&&!/^[1-9]\d{9,14}$/.test(phoneDigits(contactResult.data.phone))){setMessage("Para WhatsApp incluye el código de país y el número completo (ej. +58 414 1234567).");return;}
    setSubmitting(true);
    const price = String(form.get("price") ?? "").trim();
    const listingId = createLocalId("listing");
    const payload = {
      sellerName: contactResult.data.responsibleName,
      contactProfile: contactResult.data,
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      category: resolvedCategory,
      priceCents: price ? Math.round(Number(price) * 100) : null,
      currency,
      state,
      municipality: String(form.get("municipality") ?? ""),
      location: [String(form.get("municipality") ?? ""), state, "Venezuela"].filter(Boolean).join(", "),
      shortIntro: String(form.get("shortIntro") ?? ""),
      photoContext: String(form.get("photoContext") ?? ""),
      contact: contactResult.data.phone,
      saleFormat: String(form.get("saleFormat") ?? "A convenir"),
      supplyUnit,
      minimumOrder: String(form.get("minimumOrder") ?? ""),
      buyerType,
      productDetails:{...extras.details,ruralReference:String(form.get("ruralReference")??"").trim()},
      additionalImageDataUrls:extras.gallery,
      ...(extras.sellerImage?{sellerImageDataUrl:extras.sellerImage}:{}),
      ...(imageDataUrl ? { imageDataUrl } : {}),
    };

    try {
    const parsed=listingPayloadSchema.parse(payload);
    locked.current=true;
    const operation=await queueMutation({expectedOwner:userId??draftOwner,
      entityType: "listing",
      entityId: listingId,
      action: "upsert",
      payload:parsed,
    });
    const result = await syncNow().catch(() => ({ reason: "connection_interrupted" }));
    const receipt=await getOperationStatus(operation.id);
    setTone(receipt.state === "confirmed" ? "success" : "info");
    setMessage(receipt.state==="confirmed" ? "Publicación recibida para revisión. Aún no está publicada." : result.reason === "public_content_consent_required" ? "Publicación guardada. Autoriza primero el contenido público en Seguridad y privacidad para enviarla." : receipt.state==="blocked" ? "Borrador conservado. Revisa el motivo en Mi Finca → Sincronización antes de reenviar." : "Borrador guardado localmente; el envío todavía no está confirmado.");
    formElement.reset();
    setCategory("");
    setCustomCategory("");
    setCurrency("USD");setPricePreview("");
    setState("");
    setBuyerType("Personas y empresas");
    setSupplyUnit("unidad");
    setImageDataUrl(undefined);
    setImageName("");
    setExtras(emptyMarketplaceExtras());setExtrasKey(k=>k+1);
    } catch (error) {
      setTone("error");
      setMessage(publicFormError(error, "No pudimos guardar la publicación en este dispositivo. Tus datos siguen en el formulario; intenta nuevamente."));
    } finally {
      locked.current=false;
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} aria-busy={submitting || processing} className="space-y-6">
      <PublicFormGuide />
      <fieldset disabled={submitting || processing} className="space-y-6 min-w-0">
      <fieldset className="min-w-0 rounded-2xl border border-[#3e2a19]/10 bg-[#f8f3ea] p-4 sm:p-6"><legend className="px-2 text-base font-semibold">1. Producto, precio y fotografía</legend><p className="mb-5 text-sm leading-6 text-[#675f57]">Empieza por lo que ofreces. El precio es opcional; la fotografía debe mostrar el producto real.</p><div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2 text-sm font-semibold">Título de la publicación *
          <Input name="title" required minLength={3} maxLength={160} className="mt-2 h-12 bg-white" placeholder="Ej. Novillas doble propósito" />
        </label>
        <label className="text-sm font-semibold"><span className="flex items-center gap-2"><AgroCategoryIcon category={category||"Cultivos"} size={18}/>Categoría *</span>
          <Input value={category} onChange={e=>setCategory(e.target.value)} list="marketplace-rubrics" required className="mt-2 h-12 bg-white" placeholder="Busca tu rubro o escribe uno propio" />
          <datalist id="marketplace-rubrics">{marketplaceCategories.map(item=><option key={item.value} value={item.value}>{item.emoji} {item.group}</option>)}</datalist>
          <span className="mt-2 block text-xs font-normal text-[#71685f]">Ej. maíz blanco, café, bovinos, leche o maquinaria. También puedes escribir otro rubro.</span>
        </label>
        {category === "Otra categoría" && <label className="text-sm font-semibold">Categoría personalizada *
          <Input value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} required className="mt-2 h-12 bg-white" placeholder="Escribe la categoría agropecuaria" />
        </label>}
        <label className="text-sm font-semibold">Estado de Venezuela *
          <Select value={state} onValueChange={setState} required>
            <SelectTrigger className="mt-2 h-12 w-full bg-white"><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
            <SelectContent>{venezuelanStates.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </label>
        <label className="text-sm font-semibold">Municipio o zona
          <Input name="municipality" className="mt-2 h-12 bg-white" placeholder="Ej. Páez · El Nula" />
        </label>
        <label className="sm:col-span-2 text-sm font-semibold">Referencia para llegar (opcional)
          <Input name="ruralReference" maxLength={240} className="mt-2 h-12 bg-white" placeholder="Ej. sector La Yuca, vía principal, cerca de la escuela" />
          <span className="mt-2 block text-xs font-normal leading-5 text-[#71685f]">Será pública. Comparte solo una referencia que quieras mostrar; no hace falta publicar la entrada ni las coordenadas de tu finca.</span>
        </label>
        <label className="text-sm font-semibold">Precio por {supplyUnit} (opcional)
          <Input name="price" value={pricePreview} onChange={event=>setPricePreview(event.target.value)} type="number" min="0" max="20000000" step="0.01" inputMode="decimal" className="mt-2 h-12 bg-white" placeholder="0,00" />
        </label>
        <label className="text-sm font-semibold">Moneda
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="mt-2 h-12 w-full bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {currencies.map(currency=><SelectItem key={currency} value={currency}>{currencyLabels[currency]}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        {pricePreview.trim()!==""&&Number.isFinite(Number(pricePreview))&&Number(pricePreview)>=0&&Number(pricePreview)<=20000000&&<div className="sm:col-span-2"><PriceConversion amount={Number(pricePreview)} currency={currency} unit={supplyUnit} showBasePrices/></div>}
        <label className="text-sm font-semibold">¿Cómo lo vendes?
          <Select value={buyerType} onValueChange={setBuyerType}>
            <SelectTrigger className="mt-2 h-12 w-full bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Personas y empresas">Personas y empresas</SelectItem>
              <SelectItem value="Personas">Venta unitaria / personas</SelectItem>
              <SelectItem value="Solo empresas">Solo empresas / volumen</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="text-sm font-semibold">Presentación o modalidad *
          <Input name="saleFormat" required className="mt-2 h-12 bg-white" placeholder="Ej. animal en pie, cortes, grano seco" />
        </label>
        <label className="text-sm font-semibold">¿A qué corresponde el precio?
          <Select value={supplyUnit} onValueChange={setSupplyUnit}>
            <SelectTrigger className="mt-2 h-12 w-full bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["unidad", "kg", "animal", "lote", "g", "arroba", "tonelada", "litro", "saco", "caja", "dosis"].map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <p className="sm:col-span-2 text-xs leading-6 text-[#71685f]">Este precio se publicará en la moneda que elegiste, por {supplyUnit}. Si vendes por lote, indica cuántos animales o productos incluye. Las conversiones son aproximadas y no cambian tu precio.</p>
        <label className="text-sm font-semibold">Pedido mínimo (opcional)
          <Input name="minimumOrder" className="mt-2 h-12 bg-white" placeholder="Ej. 20 kg, 1 res, 1 tonelada" />
        </label>
        <label className="sm:col-span-2 text-sm font-semibold">Cuéntalo en una frase *
          <Input name="shortIntro" required minLength={8} maxLength={240} className="mt-2 h-12 bg-white" placeholder="Ej. Lote de novillas sanas para sistema doble propósito" />
          <span className="mt-2 block text-xs font-normal leading-5 text-[#71685f]">Nosotros ordenamos esta frase para que compradores y buscadores entiendan mejor tu oferta.</span>
        </label>
        <label className="sm:col-span-2 text-sm font-semibold">Detalles útiles *
          <Textarea name="description" required minLength={10} maxLength={3000} className="mt-2 min-h-36 bg-white" placeholder="Incluye cantidad, edad o estado, medidas, condiciones, procedencia y cualquier información útil." />
        </label>
        <label className="text-sm font-semibold">Fotografía principal (obligatoria)
          <span className="mt-2 flex min-h-12 min-w-0 cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 font-normal text-[#71685f]">
            <Camera size={18} className="shrink-0" /> <span className="min-w-0 [overflow-wrap:anywhere]">{imageName || "Elegir imagen (se optimiza automáticamente)"}</span>
            <input type="file" disabled={processing || submitting} accept="image/*" required={!imageDataUrl} onChange={selectImage} className="sr-only" />
          </span>
        </label>
        {imageDataUrl && <figure className="sm:col-span-2 overflow-hidden rounded-2xl border bg-white p-3"><img src={imageDataUrl} alt="Vista previa de la fotografía principal" className="max-h-72 w-full rounded-xl object-contain"/><figcaption className="mt-2 text-xs leading-5 text-[#675f57]">Fotografía principal lista. Puedes reemplazarla con Elegir imagen.</figcaption></figure>}
        <p className="sm:col-span-2 text-sm leading-6">Usa una fotografía real del producto, animal, terreno o servicio que ofreces y que tengas derecho a publicar. Los iconos de categoría no sustituyen esa fotografía.</p>
        <label className="sm:col-span-2 text-sm font-semibold">¿Qué se ve en la foto? *
          <Input name="photoContext" required minLength={5} maxLength={300} className="mt-2 h-12 bg-white" placeholder="Ej. Tres novillas marrones en potrero, vista lateral" />
          <span className="mt-2 block text-xs font-normal leading-5 text-[#71685f]">Este texto mejora la accesibilidad y se convierte automáticamente en una descripción útil para buscadores.</span>
        </label>
      </div></fieldset>

      <fieldset className="min-w-0 rounded-2xl border border-[#3e2a19]/10 bg-[#f8f3ea] p-4 sm:p-6">
        <legend className="px-2 text-base font-semibold">2. Contacto del anunciante</legend>
        <p className="mb-5 text-sm leading-6 text-[#71685f]">En esta sección solo son obligatorios el nombre del responsable y su teléfono. Estos datos aparecerán en tu publicación para que puedan contactarte.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">Nombre del responsable *<Input name="responsibleName" required minLength={2} maxLength={120} defaultValue={sellerName} autoComplete="name" className="mt-2 h-12 bg-white" placeholder="Nombre y apellido" /></label>
          <label className="text-sm font-semibold">Teléfono / celular *<Input name="phone" required type="tel" autoComplete="tel" inputMode="tel" maxLength={40} className="mt-2 h-12 bg-white" placeholder="Ej. +58 412 123 4567" /><span className="mt-2 block text-xs font-normal text-[#71685f]">Incluye el código de país para facilitar el contacto.</span></label>
          <label className="text-sm font-semibold">Nombre de la finca o negocio (opcional)<Input name="farmName" maxLength={160} className="mt-2 h-12 bg-white" placeholder="Nombre de tu finca" /></label>
          <label className="text-sm font-semibold">Tipo de anunciante (opcional)<select name="advertiserType" className="mt-2 h-12 w-full rounded-md border bg-white px-3 text-sm font-normal"><option value="">Seleccionar</option>{["Productor agropecuario", "Finca familiar", "Cooperativa", "Distribuidor", "Profesional / servicios", "Otro"].map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="flex min-h-11 items-center gap-3 text-sm sm:col-span-2"><input name="whatsapp" type="checkbox" className="size-5 accent-[#4c6b3a]" />Este teléfono también recibe WhatsApp</label>
          <label className="text-sm font-semibold">Horario de contacto (opcional)<Input name="contactHours" maxLength={120} className="mt-2 h-12 bg-white" placeholder="Ej. lunes a sábado, 8:00 a 17:00" /></label>
          <label className="text-sm font-semibold">Modalidad de entrega (opcional)<select name="deliveryMode" className="mt-2 h-12 w-full rounded-md border bg-white px-3 text-sm font-normal"><option value="">A convenir</option>{["Retiro en finca", "Entrega a convenir", "Retiro o entrega"].map(value => <option key={value}>{value}</option>)}</select></label>
        </div>
        <details className="mt-5 rounded-xl border border-[#3e2a19]/10 bg-white p-4">
          <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Agregar redes sociales y enlaces (opcional)</summary>
          <p className="mt-3 text-xs leading-5 text-[#71685f]">Pega los enlaces completos de tu finca o negocio. Puedes dejarlos vacíos.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">{[
            ["instagram", "Instagram", "https://www.instagram.com/tuusuario"], ["facebook", "Facebook", "https://www.facebook.com/…"],
            ["tiktok", "TikTok", "https://www.tiktok.com/@tuusuario"], ["youtube", "YouTube", "https://www.youtube.com/@tuusuario"],
            ["googleBusiness", "Google Mi Negocio / Maps", "https://maps.app.goo.gl/…"], ["website", "Sitio web", "https://tufinca.com"],
          ].map(([name, label, placeholder]) => <label key={name} className="min-w-0 text-sm font-semibold">{label}<Input type="url" name={name} maxLength={500} className="mt-2 h-12 min-w-0 bg-white" placeholder={placeholder} /></label>)}</div>
        </details>
      </fieldset>

      <h2 className="text-base font-semibold">3. Información adicional (opcional)</h2>
      <MarketplacePublishFields key={extrasKey} value={extras} onChange={setExtras} onProcessing={setProcessing}/>


      <div className="flex items-start gap-3 rounded-2xl bg-[#e8f0df] p-4 text-sm leading-6 text-[#365026]">
        <CloudOff className="mt-0.5 shrink-0" size={19} />
        Puedes completar y guardar esta publicación sin señal. Permanecerá en
        este dispositivo. Para enviarla a revisión necesitas conexión, sesión y permisos de publicación.
      </div>

      </fieldset>
      <FormFeedback message={message} tone={tone} />

      <Button type="submit" disabled={submitting || processing} className="h-13 w-full rounded-full bg-[#3e2a19] text-white hover:bg-[#4c6b3a] sm:w-auto sm:px-8">
        {submitting ? <Loader2 className="animate-spin" /> : null}
        {processing ? "Optimizando fotografía…" : submitting ? "Guardando publicación…" : "Guardar y enviar a revisión"}
      </Button>
    </form>
  );
}

function readFile(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function optimizeImage(file: File, maximum=1400, targetBytes=1_350_000): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  const source = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => {URL.revokeObjectURL(objectUrl);reject(new Error("image_decode_failed"));};
    image.src = objectUrl;
  });
  const scale = Math.min(1, maximum / Math.max(source.naturalWidth, source.naturalHeight));
  const width = Math.max(1, Math.round(source.naturalWidth * scale));
  const height = Math.max(1, Math.round(source.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {URL.revokeObjectURL(objectUrl);throw new Error("canvas_unavailable");}
  context.drawImage(source, 0, 0, width, height);
  URL.revokeObjectURL(objectUrl);
  let quality = 0.8;
  let blob: Blob | null = null;
  do {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    quality -= 0.1;
  } while (blob && blob.size > targetBytes && quality >= 0.3);
  if (!blob) throw new Error("compression_failed");
  return readFile(blob);
}
