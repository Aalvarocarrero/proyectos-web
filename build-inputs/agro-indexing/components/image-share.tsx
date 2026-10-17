'use client';
import {useEffect, useId, useRef, useState} from 'react';
import {Copy, Download, Share2} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {buildSocialImage, socialImageFilename, socialImageFormats, urlFreeSocialPhoto, type SocialImageContent} from '@/lib/social-image';
import {canShareImage, imageShareController, imageShareMessages} from '@/lib/image-share';

export function ImageShareButton({content, label = 'Compartir imagen', className = 'button-light'}: {content: SocialImageContent; label?: string; className?: string}) {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><button type="button" className={className}><Share2 size={17} aria-hidden="true"/>{label}</button></DialogTrigger>
    <DialogContent className="bg-[#f8f3ea] sm:max-w-xl">
      <DialogTitle>Comparte una imagen</DialogTitle>
      <DialogDescription>Revisa la imagen y elige dónde enviarla. La publicación final siempre la confirmas tú.</DialogDescription>
      {open && <ImageSharePanel content={content}/>}
    </DialogContent>
  </Dialog>;
}
export function ImageSharePanel({content}: {content: SocialImageContent}) {
  const [formatId, setFormatId] = useState('instagram-feed'), [retry, setRetry] = useState(0);
  const [prepared, setPrepared] = useState<{key: string; file: File; url: string; supported: boolean} | null>(null);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [sharing, setSharing] = useState(false), [link, setLink] = useState('');
  const mounted = useRef(true), shareLock = useRef(false), preparationEpoch = useRef(0);
  const selectId = useId(), statusId = useId();
  const format = socialImageFormats.find(item => item.id === formatId)!;
  // Primitive key avoids restarting image creation when parents rerender an equivalent payload.
  const contentKey = JSON.stringify(content), preparationKey = `${contentKey}:${formatId}:${retry}`;
  const ready = prepared?.key === preparationKey ? prepared : null;
  useEffect(() => {mounted.current = true; return () => {mounted.current = false;};}, []);
  useEffect(() => {
    const controller = new AbortController(), epoch = ++preparationEpoch.current;
    let previewUrl: string | undefined;
    const data: SocialImageContent = JSON.parse(contentKey);
    // Resolve the browser-only origin together with this asynchronous preparation.
    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setPrepared(null); setError(''); setNotice('');
      const target = new URL(data.path, location.origin);
      setLink(target.origin === location.origin ? target.href : '');
      return buildSocialImage(data, format, controller.signal);
    }).then(blob => {
      if (!blob || controller.signal.aborted || preparationEpoch.current !== epoch) return;
      const file = new File([blob], socialImageFilename(data, format), {type: 'image/png'});
      previewUrl = URL.createObjectURL(file);
      setPrepared({key: preparationKey, file, url: previewUrl, supported: canShareImage(file, navigator)});
    }).catch(cause => {
      if (controller.signal.aborted || preparationEpoch.current !== epoch || cause?.name === 'AbortError') return;
      setError(cause?.message === 'share_photo_needs_replacement' ? 'Esta fotografía requiere créditos. Necesita una alternativa autorizada para compartirla sin créditos ni URLs.' : 'No pudimos preparar la imagen. Revisa la conexión y vuelve a intentarlo.');
    });
    return () => {controller.abort(); if (previewUrl) URL.revokeObjectURL(previewUrl);};
  }, [contentKey, format, preparationKey]);
  function share() {
    if (!ready || shareLock.current) return;
    shareLock.current = true; const epoch = preparationEpoch.current; setSharing(true); setNotice('');
    // The PNG is ready already. Invoke synchronously while this tap is still active.
    const result = imageShareController.share(ready.file, navigator);
    void result.then(status => {if (mounted.current && preparationEpoch.current === epoch) setNotice(imageShareMessages[status]);})
      .finally(() => {shareLock.current = false; if (mounted.current) setSharing(false);});
  }
  return <div className="min-w-0 space-y-4" data-image-share-panel>
    <label htmlFor={selectId} className="block text-xs font-semibold">Formato de la imagen</label>
    <select id={selectId} disabled={sharing} value={formatId} onChange={event => setFormatId(event.target.value)} className="h-12 w-full min-w-0 rounded-xl border bg-white px-3 text-sm">
      {socialImageFormats.map(item => <option key={item.id} value={item.id}>{item.label} · {item.width} × {item.height}</option>)}
    </select>
    {ready ? <img src={ready.url} alt={`Imagen preparada: ${content.title}`} width={format.width} height={format.height} className="max-h-64 w-full rounded-xl border bg-white object-contain"/> : <p role="status" className="rounded-xl bg-white p-5 text-sm">{error || 'Preparando imagen PNG…'}</p>}
    {urlFreeSocialPhoto(content.photo).replacement && <p className="rounded-xl bg-[#eadfcd] p-3 text-xs leading-6">Para compartir sin créditos, esta versión usa una {urlFreeSocialPhoto(content.photo).replacement === 'illustration' ? 'ilustración' : 'fotografía'} de referencia alternativa. La fotografía original y sus créditos siguen en la ficha.</p>}
    <p className="text-xs leading-6">Conserva nombre, teléfono público y descripción cuando estén disponibles. El texto largo se resume para que sea legible; no se añaden créditos ni URLs a la imagen.</p>
    {error && <button type="button" className="button-light" onClick={() => setRetry(value => value + 1)}>Reintentar imagen</button>}
    <button type="button" onClick={share} disabled={!ready || sharing} aria-describedby={statusId} className="button-dark w-full disabled:opacity-50"><Share2 size={18} aria-hidden="true"/>{sharing ? 'Menú de compartir abierto…' : 'Compartir imagen'}</button>
    {ready && !ready.supported && <p className="rounded-xl bg-[#eadfcd] p-3 text-xs leading-6">{imageShareMessages.unsupported}</p>}
    {ready && <a className="button-light w-full" href={ready.url} download={ready.file.name} onClick={event => {if (sharing) {event.preventDefault(); return;} setNotice('Descarga solicitada. Si el navegador abre la imagen, usa Guardar imagen. Después selecciónala en Fotos, Galería o Archivos desde la app.');}} aria-disabled={sharing}><Download size={17} aria-hidden="true"/>Descargar imagen PNG</a>}
    <p className="text-xs leading-6">Elige WhatsApp u otra app en el menú del dispositivo. Para un estado o historia, elige ese destino si aparece; si no, guarda la imagen y selecciónala dentro de WhatsApp, Instagram, Facebook o TikTok. La web no puede elegir la app ni publicar automáticamente.</p>
    <p className="text-xs leading-6">Se comparte el archivo que ves aquí. Envíalo solo si quieres que sus destinatarios lo vean. El sitio conserva su acceso privado.</p>
    <p id={statusId} role="status" aria-live="polite" className="break-words text-sm leading-6 text-[#365026]">{notice}</p>
    <details className="rounded-xl border bg-white p-3"><summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Copiar enlace de la ficha</summary>
      <p className="mb-3 text-xs leading-6">El enlace no adjunta la imagen ni concede acceso al sitio privado.</p>
      <input value={link} aria-label="Enlace de la ficha" readOnly onFocus={event => event.target.select()} className="h-12 w-full min-w-0 rounded-lg border px-3 text-xs"/>
      <button type="button" disabled={!link || sharing} className="button-light mt-3" onClick={() => {void navigator.clipboard?.writeText(link).then(() => setNotice('Enlace copiado.'), () => setNotice('No se pudo copiar. Selecciona el enlace para copiarlo manualmente.')); if (!navigator.clipboard) setNotice('Selecciona el enlace para copiarlo manualmente.');}}><Copy size={16} aria-hidden="true"/>Copiar enlace</button>
    </details>
  </div>;
}
