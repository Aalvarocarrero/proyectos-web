export const CONSENT_VERSION = 'ideas-v1';
export const IDEA_FORM = '/proyectos/compartir-idea';
export const MODERATION = '/admin/ideas-publicas';
export const GALLERY = '/proyectos#vitrina-propuestas';
const states = ['Amazonas','Anzoátegui','Apure','Aragua','Barinas','Bolívar','Carabobo','Cojedes','Delta Amacuro','Distrito Capital','Falcón','Guárico','La Guaira','Lara','Mérida','Miranda','Monagas','Nueva Esparta','Portuguesa','Sucre','Táchira','Trujillo','Yaracuy','Zulia','Dependencias Federales','Varios estados'];
const statuses = ['pending','published','withdrawn'];
const labels = { pending:'En revisión', published:'Publicada', withdrawn:'Retirada' };
const refPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
export const escapeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
function contactPattern(flags='iu') {
  return new RegExp(String.raw`[\w.+-]+\s*@\s*[\w.-]+|(?:https?:\/\/|www\.|mailto:|tel:|wa\.me|chat\.whatsapp\.com)[^\s<>"']*|@\p{L}[\p{L}\d_.]{1,}|(?:\+?\d[ ().-]*){7,}`,flags);
}
export function containsContact(value) { return contactPattern().test(value); }
export function maskContact(value) { return typeof value === 'string' ? value.replace(contactPattern('giu'),'[dato de contacto omitido]') : value; }
export function validateIdea(form) {
  const title = String(form.get('title') ?? '').trim();
  const body = String(form.get('body') ?? '').trim();
  const state = String(form.get('state') ?? '');
  if (title.length < 5 || title.length > 100 || body.length < 20 || body.length > 1000 || !states.includes(state)) return {error:'Revisa el título, el estado y el resumen. El resumen debe tener entre 20 y 1.000 caracteres.'};
  if (containsContact(title + '\n' + body)) return {error:'El texto público no debe incluir teléfonos, correos, enlaces ni cuentas de redes sociales.'};
  if (form.get('consent') !== 'yes') return {error:'Marca la autorización si quieres pedir que esta ficha se publique. Si prefieres enviarla en privado, vuelve a Inicio y usa Compartir mi idea.'};
  return {title, body, state};
}
export async function listPublicIdeas(db) {
  const rows = await db.prepare("SELECT id, title, body, state FROM public_idea_proposals WHERE status = 'published' AND consent_version = ? AND consent_at IS NOT NULL AND approved_at IS NOT NULL ORDER BY approved_at DESC LIMIT 100").bind(CONSENT_VERSION).all();
  return rows.results.filter(r => refPattern.test(r.id) && !containsContact(r.title + '\n' + r.body));
}
export function supportHref(id) {
  const ref = String(id ?? '').replace(/[^A-Za-z0-9_-]/g,'').slice(0,64);
  return 'https://wa.me/584264263601?text=' + encodeURIComponent('Hola, me interesa una propuesta de la vitrina Venezuela Agro.' + (ref ? ' Referencia: ' + ref + '.' : ''));
}
const style = `html{font-family:system-ui,sans-serif;color:#211d1a;background:#f3ebdd}body{margin:0}main{max-width:56rem;margin:auto;padding:2rem 1rem 5rem}h1{font-family:Georgia,serif;font-size:clamp(2rem,7vw,3.6rem);line-height:1.05}p{line-height:1.55}nav{display:flex;flex-wrap:wrap;gap:1.2rem}a{color:#29431c;text-underline-offset:.18em}a:focus-visible,button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid #7a3c23;outline-offset:4px}form,article{box-sizing:border-box;background:white;border:1px solid #dacebd;border-radius:1rem;padding:1.3rem;margin:1rem 0}input:not([type=checkbox]),select,textarea{box-sizing:border-box;display:block;width:100%;margin:.45rem 0 1rem;padding:.7rem;border:1px solid #73664f;border-radius:.45rem;font:inherit;color:inherit;background:white}input[type=checkbox]{min-width:1.2rem;min-height:1.2rem;margin:0 .65rem 0 0}.consent{display:flex;align-items:flex-start;line-height:1.5}button{margin-top:.9rem;background:#324f22;color:white;border:0;border-radius:.5rem;font:inherit;font-weight:700;padding:.85rem 1.1rem;cursor:pointer}.desc{white-space:pre-wrap;overflow-wrap:anywhere}.err{border-left:4px solid #8a310b;background:#ffede5;padding:.8rem}`;
function page(title, body, status=200, cookie) {
  const headers = new Headers({'content-type':'text/html; charset=utf-8','cache-control':'private, no-store'});
  if (cookie) headers.append('set-cookie',cookie);
  return new Response(`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeText(title)} | Venezuela Agro</title><style>${style}</style><main><nav><a href="/">Venezuela Agro · Inicio</a><a href="${GALLERY}">Vitrina pública</a></nav><h1>${escapeText(title)}</h1>${body}</main></html>`, {status,headers});
}
function hidden(name, value) { return `<input type="hidden" name="${name}" value="${escapeText(value)}">`; }
function redirect(path) { return new Response(null,{status:303,headers:{location:path,'cache-control':'private,no-store'}}); }
function renderIdeaForm(token, values={}, error='') {
  return `<p>Envía una ficha para la vitrina pública. Solo se mostrará tras tu autorización y la revisión de Venezuela Agro. Tu correo y los datos de tu cuenta no se publican. No incluyas direcciones, documentos de identidad ni otros datos personales. Para sugerencias privadas usa «Compartir mi idea» desde Inicio.</p>${error ? `<p class="err" role="alert">${escapeText(error)}</p>` : ''}<form method="post" action="${IDEA_FORM}">${hidden('csrf',token)}${hidden('request_id',values.request_id || crypto.randomUUID())}<label>Título público <input name="title" required minlength="5" maxlength="100" value="${escapeText(values.title)}"></label><label>Estado o alcance <select name="state" required><option value="">Selecciona</option>${states.map(x=>`<option${values.state===x?' selected':''}>${escapeText(x)}</option>`).join('')}</select></label><label>Resumen público <textarea name="body" required minlength="20" maxlength="1000" rows="7">${escapeText(values.body)}</textarea></label><label class="consent"><input type="checkbox" name="consent" value="yes" required>Autorizo que el título, el estado y el resumen sean públicos si se aprueba la ficha.</label><button>Enviar para revisión</button></form>`;
}
async function listOwned(db, id) {
  return (await db.prepare("SELECT id,title,state,status FROM public_idea_proposals WHERE owner_id = ? AND status != 'withdrawn' ORDER BY created_at DESC LIMIT 50").bind(id).all()).results;
}
async function showSubmit(db, user, session, options={}) {
  const own = await listOwned(db,user.id);
  return page('Presentar una idea para la vitrina', renderIdeaForm(session.token,options.values,options.error) +
    (options.saved ? '<p role="status">Tu ficha se recibió y queda en revisión. No es pública todavía.</p>' : '') +
    (own.length ? `<section><h2>Mis ideas enviadas</h2>${own.map(x=>`<article><h3>${escapeText(x.title)}</h3><p>${escapeText(x.state)} · ${labels[x.status] || 'En revisión'}</p><form method="post" action="${IDEA_FORM}">${hidden('csrf',session.token)}${hidden('target',x.id)}${hidden('action','withdraw')}<button>Retirar ficha</button></form></article>`).join('')}</section>` : ''), options.error ? 422 : 200, session.cookie);
}
async function showReview(db, session) {
  const rows = (await db.prepare("SELECT id,title,body,state,status FROM public_idea_proposals WHERE status IN ('pending','published') AND consent_version = ? AND consent_at IS NOT NULL ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC LIMIT 100").bind(CONSENT_VERSION).all()).results;
  return page('Ideas de la vitrina · revisión', `<p>Confirma que el texto puede verse públicamente y no contiene datos personales o información privada. Las sugerencias privadas se mantienen en <a href="/admin">Administración</a>.</p>${rows.length ? rows.map(r=>`<article><h2>${escapeText(r.title)}</h2><p>${escapeText(r.state)} · ${labels[r.status]}</p><p class="desc">${escapeText(r.body)}</p><form method="post" action="${MODERATION}">${hidden('csrf',session.token)}${hidden('target',r.id)}${r.status==='pending' ? '<label class="consent"><input type="checkbox" name="privacy_review" value="yes">Revisé que el texto no exponga datos personales.</label><button name="action" value="approve">Aprobar y publicar</button> ' : ''}<button name="action" value="withdraw" formnovalidate>Retirar de la vitrina</button></form></article>`).join('') : '<p>No hay fichas públicas ni pendientes de revisión.</p>'}`,200,session.cookie);
}
async function readForm(request) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/x-www-form-urlencoded' || !request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8',{fatal:true});
  let size=0, raw='';
  try {
    for (;;) {
      const next=await reader.read();
      if (next.done) break;
      size+=next.value.byteLength;
      if (size>16384) { await reader.cancel(); return null; }
      raw+=decoder.decode(next.value,{stream:true});
    }
    return new URLSearchParams(raw+decoder.decode());
  } catch { return null; } finally { reader.releaseLock(); }
}
/** Called only after configuration/origin validation; existing session and CSRF helpers are reused. */
export async function handleGalleryRequest(request, env, config, {getSession,cookieValue,issueCsrf,verifyCsrf}) {
  const url = new URL(request.url);
  const admin = url.pathname === MODERATION;
  if (!admin && url.pathname !== IDEA_FORM) return null;
  if (!['GET','HEAD','POST'].includes(request.method)) return new Response(null,{status:405,headers:{allow:'GET, HEAD, POST'}});
  const user = await getSession(env.DB,config,cookieValue(request,'__Host-va_session'));
  if (!user) return redirect('/auth/signin?return_to='+encodeURIComponent(url.pathname));
  if (admin && user.googleOwnerAdmin !== true) return page('Acceso restringido','<p>Esta página es solo para administración.</p>',403);
  const db=env.DB;
  if (request.method==='GET' || request.method==='HEAD') {
    const csrf=await issueCsrf(request,config);
    const response=admin ? await showReview(db,csrf) : await showSubmit(db,user,csrf,{saved:url.searchParams.get('enviada')==='1'});
    return request.method==='HEAD' ? new Response(null,response) : response;
  }
  const form=await readForm(request);
  if (!form || !await verifyCsrf(request,config,form.get('csrf'))) return page('No se pudo guardar','<p>Vuelve a abrir el formulario e inténtalo de nuevo.</p>',403);
  const id=form.get('target'), action=form.get('action'), now=new Date().toISOString();
  if (action==='withdraw' && refPattern.test(id ?? '')) {
    if (admin) await db.prepare("UPDATE public_idea_proposals SET status = 'withdrawn', updated_at = ? WHERE id = ? AND status IN ('pending','published')").bind(now,id).run();
    else await db.prepare("UPDATE public_idea_proposals SET status = 'withdrawn', updated_at = ? WHERE owner_id = ? AND id = ? AND status IN ('pending','published')").bind(now,user.id,id).run();
    return redirect(url.pathname);
  }
  if (admin) {
    if (action!=='approve' || form.get('privacy_review')!=='yes' || !refPattern.test(id ?? '')) return page('Falta la revisión','<p>Confirma antes que el texto no contenga datos personales.</p>',422);
    const row=await db.prepare("SELECT title, body FROM public_idea_proposals WHERE id = ? AND status = 'pending' AND consent_version = ? AND consent_at IS NOT NULL").bind(id,CONSENT_VERSION).first();
    if (!row || containsContact(row.title+'\n'+row.body)) return page('No se publicó','<p>La ficha no está pendiente con autorización válida o contiene posibles datos de contacto.</p>',409);
    const result=await db.prepare("UPDATE public_idea_proposals SET status = 'published', approved_at = ?, updated_at = ? WHERE id = ? AND status = 'pending' AND consent_version = ? AND consent_at IS NOT NULL AND title = ? AND body = ?").bind(now,now,id,CONSENT_VERSION,row.title,row.body).run();
    if (!result.meta.changes) return page('No se publicó','<p>El estado cambió. Abre de nuevo la lista de revisión.</p>',409);
    return redirect(MODERATION);
  }
  const input=validateIdea(form), request_id=form.get('request_id');
  if (input.error || !refPattern.test(request_id ?? '')) {
    const values = {...Object.fromEntries(form.entries()), request_id: refPattern.test(request_id ?? '') ? request_id : undefined};
    return showSubmit(db,user,await issueCsrf(request,config),{values,error:input.error || 'Abre de nuevo el formulario e inténtalo otra vez.'});
  }
  // Idempotency is scoped to this author. Only an explicit opt-in reaches the moderation queue.
  await db.prepare("INSERT INTO public_idea_proposals (id,owner_id,request_id,title,body,state,status,consent_version,consent_at,created_at,updated_at) VALUES (?,?,?,?,?,?,'pending',?,?,?,?) ON CONFLICT(owner_id,request_id) DO NOTHING").bind(crypto.randomUUID(),user.id,request_id,input.title,input.body,input.state,CONSENT_VERSION,now,now,now).run();
  return redirect(IDEA_FORM+'?enviada=1');
}
