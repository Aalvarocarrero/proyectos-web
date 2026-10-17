/** File-only sharing. Preparation happens before the tap so transient activation survives. */
export type ImageShareResult = 'opened' | 'cancelled' | 'unsupported' | 'gesture-required' | 'busy' | 'failed';
export type ImageShareNavigator = {
  canShare?: (data: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
  userActivation?: {isActive: boolean};
};
export function canShareImage(file: File, browser: ImageShareNavigator): boolean {
  if (!file.size || !/^image\/(png|jpeg|webp)$/.test(file.type) || !browser.share || !browser.canShare) return false;
  try { return browser.canShare({files: [file]}); } catch { return false; }
}
export function createImageShareController() {
  let pending = false;
  return {
    // Deliberately no await before browser.share: call this directly in the click handler.
    share(file: File, browser: ImageShareNavigator): Promise<ImageShareResult> {
      if (pending) return Promise.resolve('busy');
      if (!canShareImage(file, browser)) return Promise.resolve('unsupported');
      if (browser.userActivation?.isActive === false) return Promise.resolve('gesture-required');
      pending = true;
      const failure = (error: unknown): ImageShareResult => {
        const name = typeof error === 'object' && error !== null && 'name' in error ? error.name : '';
        if (name === 'AbortError') return 'cancelled';
        if (name === 'NotAllowedError') return 'gesture-required';
        if (name === 'InvalidStateError') return 'busy';
        return 'failed';
      };
      try {
        // Files only prevents recipients from replacing the attachment with a URL preview.
        return Promise.resolve(browser.share!({files: [file]}))
          .then((): ImageShareResult => 'opened', failure)
          .finally(() => { pending = false; });
      } catch (error) { pending = false; return Promise.resolve(failure(error)); }
    },
  };
}
// One native share sheet at a time, including across closed/reopened dialogs.
export const imageShareController = createImageShareController();
export const imageShareMessages: Record<ImageShareResult, string> = {
  opened: 'La imagen se entregó al menú del dispositivo. Revisa el destino y confirma allí el envío o la publicación.',
  cancelled: 'Compartir cancelado. La imagen sigue lista por si quieres intentarlo de nuevo.',
  unsupported: 'Este navegador no permite enviar este archivo al menú de compartir. Descarga la imagen y selecciónala desde la app que prefieras.',
  'gesture-required': 'El navegador no permitió abrir el menú. Vuelve a tocar Compartir imagen; si sigue bloqueado, abre la web directamente en Safari o Chrome, o descarga la imagen.',
  busy: 'Ya hay un menú de compartir abierto. Ciérralo antes de volver a intentarlo.',
  failed: 'No se pudo abrir el menú con la imagen. Puedes volver a intentarlo o descargarla para adjuntarla desde la app.',
};
