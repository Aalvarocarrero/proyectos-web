"use client";
import {MarketplacePhoto} from "@/components/marketplace-photo";
import {listingPhotoUrl,hasStoredListingPhoto} from "@/lib/listing-photo";
import { describeOrder, type OrderDetails } from "@/lib/order-details";

import { FormEvent, useEffect, useState } from "react";
import { BookOpen, Check, Loader2, RefreshCw, Store, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfessionalProfileView } from "@/components/professional-profile-view";
import type { ProfessionalRecord } from "@/lib/professional-profile";
import { Textarea } from "@/components/ui/textarea";

type Listing = {
  imageKey?:string|null;
  id: string;
  sellerName: string;
  title: string;
  category: string;
  location: string;
  contact?: string | null;
  status: string;
};
type Order = OrderDetails & {
  id: string;
  customerName: string;
  email?: string | null;
  phone?: string | null;
  note?: string | null;
  status: string;
};
type Professional = ProfessionalRecord & { status: string };
type Project = {
  id: string;
  title: string;
  sector: string;
  state: string;
  summary: string;
  contact: string;
  status: string;
};
type Feedback = {
  id: string;
  area: string;
  role: string;
  message: string;
  contact?: string | null;
  status: string;
};
type UserRow = {
  id: string;
  email: string;
  displayName?: string | null;
  createdAt: string;
  lastSeenAt?: string | null;
};
type Article = { slug: string; category: string; emoji: string; title: string; description: string; keywords: string; readMinutes: number; status: string; updatedAt: string };
type NetworkReview={id:string;name?:string;state?:string;body?:string;authorName?:string;farmId?:string;postId?:string;profileJson?:string;status:string};
type Data = {
  publicFarms:NetworkReview[];socialPosts:NetworkReview[];socialComments:NetworkReview[];
  listings: Listing[];
  orders: Order[];
  professionals: Professional[];
  projects: Project[];
  feedback: Feedback[];
  users: UserRow[];
  articles: Article[];
};

export function AdminDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [working, setWorking] = useState("");
  const [notice,setNotice]=useState("");
  async function load() {
    const response = await fetch("/api/admin", { cache: "no-store" });
    if (response.ok) setData((await response.json()) as Data);
  }
  useEffect(() => {
    let active = true;
    void fetch("/api/admin", { cache: "no-store" }).then(async (response) => {
      if (active && response.ok) setData((await response.json()) as Data);
    });
    return () => {
      active = false;
    };
  }, []);
  async function update(
    entityType: "listing" | "order" | "professional" | "project" | "feedback" | "article" | "public-farm" | "social-post" | "social-comment",
    id: string,
    status: string,
  ) {
    setWorking(id);
    const record=data?Object.values(data).flat().find(row=>("id" in row && row.id===id)||("slug" in row&&row.slug===id)):undefined;
    const expectedVersion=record && ("revision" in record?record.revision:"serverUpdatedAt" in record?record.serverUpdatedAt:"updatedAt" in record?record.updatedAt:undefined);
    const response = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entityType, id, status, expectedVersion }),
    });
    if (response.ok) {setNotice("Cambio guardado.");await load();} else {const result=await response.json().catch(()=>({})) as {error?:string};setNotice(result.error==="listing_photo_required"||result.error==="listing_photo_unavailable"?"No se puede publicar: falta una fotografía disponible de la oferta. El registro se conserva.":"El contenido cambió o no se pudo guardar. Actualiza y revisa la versión completa antes de aprobar.");await load();}
    setWorking("");
  }
  async function saveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setWorking("new-article");
    const response = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
    if (response.ok) { form.reset(); await load(); }
    setWorking("");
  }
  if (!data)
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-[#4c6b3a]">
        <Loader2 className="animate-spin" />
        <span className="text-sm font-bold">Cargando operación…</span>
      </div>
    );
  return (
    <div className="space-y-12">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Usuarios registrados" value={data.users.length} />
        <Metric label="Publicaciones" value={data.listings.length} />
        <Metric label="Profesionales" value={data.professionals.length} />
        <Metric label="Proyectos agropecuarios" value={data.projects.length} />
      </div>
      {([["public-farm","Fincas públicas",data.publicFarms],["social-post","Publicaciones de la comunidad",data.socialPosts],["social-comment","Comentarios de la comunidad",data.socialComments]] as const).map(([kind,title,items])=><Section key={kind} title={title} kicker="COMUNIDAD" onRefresh={load}>{items?.length?items.map(item=><div key={item.id}><ReviewRow title={item.name||item.authorName||"Publicación"} meta={item.body||item.state||"Ficha pública"} status={item.status} working={working===item.id} onAccept={()=>update(kind,item.id,"active")} onReject={()=>update(kind,item.id,"rejected")}/>{item.profileJson&&<details className="m-4 rounded-xl bg-white p-4"><summary className="cursor-pointer text-sm">Revisar todos los datos públicos</summary><pre className="mt-4 whitespace-pre-wrap break-all text-xs">{JSON.stringify(JSON.parse(item.profileJson),null,2)}</pre></details>}</div>):<Empty text="Sin solicitudes por revisar."/>}</Section>)}
      <Section title="Contenido de Aprende" kicker="BIBLIOTECA EDITORIAL" onRefresh={load}>
        <form onSubmit={saveArticle} className="grid gap-4 border-b border-[#3e2a19]/8 bg-[#fbf8f2] p-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">Título<Input name="title" required minLength={5} className="mt-2 bg-white" placeholder="Título claro para el productor" /></label>
          <label className="text-sm font-semibold">Dirección SEO<Input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="mt-2 bg-white" placeholder="ejemplo-guia-cacao" /></label>
          <label className="text-sm font-semibold">Categoría<Input name="category" required className="mt-2 bg-white" placeholder="Ganadería, cultivos, gestión…" /></label>
          <div className="grid grid-cols-[6rem_1fr] gap-3"><label className="text-sm font-semibold">Emoji<Input name="emoji" defaultValue="🌿" className="mt-2 bg-white" /></label><label className="text-sm font-semibold">Lectura (min)<Input name="readMinutes" type="number" min="1" max="60" defaultValue="5" className="mt-2 bg-white" /></label></div>
          <label className="text-sm font-semibold sm:col-span-2">Descripción para buscadores<Textarea name="description" required minLength={20} className="mt-2 bg-white" placeholder="Resume qué aprenderá la persona." /></label>
          <label className="text-sm font-semibold sm:col-span-2">Título de la sección<Input name="sectionHeading" required className="mt-2 bg-white" placeholder="Guía práctica" /></label>
          <label className="text-sm font-semibold sm:col-span-2">Contenido<Textarea name="body" required minLength={80} className="mt-2 min-h-48 bg-white" placeholder="Escribe párrafos claros. Deja una línea vacía para separar cada párrafo." /></label>
          <label className="text-sm font-semibold">Palabras clave<Input name="keywords" className="mt-2 bg-white" placeholder="cacao Venezuela, manejo de cultivo…" /></label>
          <label className="text-sm font-semibold">Estado<select name="status" defaultValue="draft" className="mt-2 h-10 w-full rounded-md border bg-white px-3"><option value="draft">Borrador</option><option value="published">Publicar</option></select></label>
          <Button disabled={working === "new-article"} className="rounded-full bg-[#3e2a19] text-white sm:col-span-2 sm:w-fit"><BookOpen /> Guardar artículo</Button>
        </form>
        {data.articles.length ? data.articles.map((article) => <ReviewRow key={article.slug} title={`${article.emoji} ${article.title}`} meta={`${article.category} · /aprende/${article.slug} · ${article.readMinutes} min`} status={article.status} working={working === article.slug} acceptLabel="Publicar" rejectLabel="Borrador" onAccept={() => update("article", article.slug, "published")} onReject={() => update("article", article.slug, "draft")} />) : <Empty text="Aún no hay artículos creados desde el panel." />}
      </Section>
      {notice&&<p role="status" className="rounded-xl bg-[#edf3e7] p-4 text-sm">{notice}</p>}
      <details className="my-5 rounded-xl border bg-white p-4"><summary className="cursor-pointer font-semibold">Revisar datos completos enviados antes de aprobar</summary><pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify({publicaciones:data.listings,proyectos:data.projects},null,2)}</pre></details>
      <Section title="Publicaciones" kicker="MERCADO AGRO" onRefresh={load}>
        {data.listings.length ? (
          data.listings.map((item) => (
            <div key={item.id}><div className="mx-5 mt-4 aspect-[4/3] max-w-sm overflow-hidden rounded-xl bg-[#e8dece]"><MarketplacePhoto src={listingPhotoUrl(item.imageKey)} alt={`Fotografía enviada para ${item.title}`}/></div><p className="mx-5 mt-2 text-xs leading-6">Comprueba que es una fotografía pertinente de la oferta antes de aprobar. Un icono o una imagen ajena no acredita el producto.</p><ReviewRow
              title={item.title}
              meta={`${item.sellerName} · ${item.category} · ${item.location}\n${"description" in item?String(item.description):""}\n${item.contact||""}`}
              status={item.status}
              working={working === item.id}
              acceptDisabled={!hasStoredListingPhoto(item.imageKey)}
              onAccept={() => update("listing", item.id, "active")}
              onReject={() => update("listing", item.id, "rejected")}
            /></div>
          ))
        ) : (
          <Empty text="No hay publicaciones para revisar." />
        )}
      </Section>
      <Section title="Profesionales" kicker="DIRECTORIO">
        {data.professionals.length ? (
          data.professionals.map((item) => (
            <div key={item.id}>
            <ReviewRow
              title={`${item.name} · ${item.profession}`}
              meta={`${item.specialties} · ${item.state} · ${item.contact}`}
              status={item.status}
              working={working === item.id}
              onAccept={() => update("professional", item.id, "active")}
              onReject={() => update("professional", item.id, "rejected")}
            />
            <details className="mb-5 min-w-0 rounded-xl border bg-white p-4"><summary className="cursor-pointer text-sm font-semibold">Revisar perfil completo antes de publicarlo</summary><div className="mt-5"><ProfessionalProfileView profile={item}/></div></details>
            </div>
          ))
        ) : (
          <Empty text="No hay perfiles profesionales." />
        )}
      </Section>
      <Section title="Proyectos agropecuarios" kicker="APOYO Y COLABORACIÓN">
        {data.projects.length ? (
          data.projects.map((item) => (
            <ReviewRow
              key={item.id}
              title={item.title}
              meta={`${item.sector} · ${item.state} · ${item.summary.slice(0, 120)}`}
              status={item.status}
              working={working === item.id}
              onAccept={() => update("project", item.id, "active")}
              onReject={() => update("project", item.id, "rejected")}
            />
          ))
        ) : (
          <Empty text="No hay proyectos para revisar." />
        )}
      </Section>
      <Section title="Ideas para mejorar Venezuela Agro" kicker="MEJORAS DE LA PLATAFORMA">
        {data.feedback.length ? (
          data.feedback.map((item) => (
            <ReviewRow
              key={item.id}
              title={`${item.area} · ${item.role}`}
              meta={item.message}
              status={item.status}
              working={working === item.id}
              acceptLabel="Planificar"
              onAccept={() => update("feedback", item.id, "planned")}
              onReject={() => update("feedback", item.id, "closed")}
            />
          ))
        ) : (
          <Empty text="Todavía no hay sugerencias." />
        )}
      </Section>
      <Section title="Solicitudes recibidas" kicker="TIENDA">
        {data.orders.length ? (
          data.orders.map((order) => (
            <ReviewRow
              key={order.id}
              title={order.customerName}
              meta={describeOrder(order)}
              status={order.status}
              working={working === order.id}
              acceptLabel="Contactada"
              rejectLabel="Cerrar"
              onAccept={() => update("order", order.id, "contacted")}
              onReject={() => update("order", order.id, "closed")}
            />
          ))
        ) : (
          <Empty text="Todavía no hay solicitudes." />
        )}
      </Section>
      <Section title="Personas registradas" kicker="BASE DE USUARIOS">
        {data.users.length ? (
          data.users.map((user) => (
            <div
              key={user.id}
              className="grid gap-2 border-b border-[#3e2a19]/8 p-5 last:border-0 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="text-sm font-bold">
                  {user.displayName || "Sin nombre visible"}
                </p>
                <p className="mt-1 text-xs text-[#71685f]">{user.email}</p>
              </div>
              <p className="text-xs font-semibold">
                Alta: {new Date(user.createdAt).toLocaleDateString("es-VE")}
              </p>
            </div>
          ))
        ) : (
          <Empty text="No hay usuarios registrados." />
        )}
      </Section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#211d1a] p-5 text-white">
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-white/48">{label}</p>
    </div>
  );
}
function Section({
  title,
  kicker,
  children,
  onRefresh,
}: {
  title: string;
  kicker: string;
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}) {
  return (
    <section>
      <div className="flex items-end justify-between">
        <div>
          <p className="section-kicker">{kicker}</p>
          <h2 className="font-display mt-2 text-4xl">{title}</h2>
        </div>
        {onRefresh && (
          <Button
            onClick={() => void onRefresh()}
            variant="outline"
            className="rounded-full bg-white"
          >
            <RefreshCw />
            Actualizar
          </Button>
        )}
      </div>
      <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[#3e2a19]/8 bg-white">
        {children}
      </div>
    </section>
  );
}
function ReviewRow({
  title,
  meta,
  status,
  working,
  onAccept,
  onReject,
  acceptDisabled=false,
  acceptLabel = "Aprobar",
  rejectLabel = "Rechazar",
}: {
  title: string;
  meta: string;
  status: string;
  working: boolean;
  onAccept: () => void;
  onReject: () => void;
  acceptDisabled?:boolean;
  acceptLabel?: string;
  rejectLabel?: string;
}) {
  return (
    <div className="grid gap-4 border-b border-[#3e2a19]/8 p-5 last:border-0 lg:grid-cols-[1fr_auto_auto] lg:items-center">
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#71685f]">{meta}</p>
      </div>
      <span className="w-fit rounded-full bg-[#f3ebdd] px-3 py-1 text-xs font-bold">
        {status}
      </span>
      <div className="flex gap-2">
        <Button
          disabled={working||acceptDisabled}
          onClick={onAccept}
          size="sm"
          className="rounded-full bg-[#4c6b3a] text-white"
        >
          <Check />
          {acceptLabel}
        </Button>
        <Button
          disabled={working}
          onClick={onReject}
          size="sm"
          variant="outline"
          className="rounded-full"
        >
          <X />
          {rejectLabel}
        </Button>
      </div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="p-12 text-center">
      <Store className="mx-auto text-[#b4aa9e]" />
      <p className="mt-3 text-sm text-[#71685f]">{text}</p>
    </div>
  );
}
