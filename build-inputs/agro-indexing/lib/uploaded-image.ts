/** Validate raster uploads before storage; never trust the client MIME label alone. */
export class UploadedImageError extends Error {
  constructor(public code: "invalid_image" | "image_too_large" | "invalid_image_dimensions") { super(code); }
}
type ImageLimits = { maxBytes?: number; maxDimension?: number; maxPixels?: number };
export function decodeUploadedImage(dataUrl: string, limits: ImageLimits = {}) {
  const maxBytes = limits.maxBytes ?? 2_000_000;
  const maxDimension = limits.maxDimension ?? 4096;
  const maxPixels = limits.maxPixels ?? 16_000_000;
  if (typeof dataUrl !== "string" || dataUrl.length > Math.ceil(maxBytes / 3) * 4 + 32) throw new UploadedImageError("image_too_large");
  const match = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) throw new UploadedImageError("invalid_image");
  let bytes: Uint8Array;
  try { bytes = Uint8Array.from(atob(match[2]), character => character.charCodeAt(0)); }
  catch { throw new UploadedImageError("invalid_image"); }
  if (bytes.length > maxBytes) throw new UploadedImageError("image_too_large");
  if (bytes.length < 24) throw new UploadedImageError("invalid_image");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (start: number, length: number) => String.fromCharCode(...bytes.slice(start, start + length));
  let width = 0, height = 0;
  if (match[1] === "image/png" && bytes.length >= 33 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value) && view.getUint32(8) === 13 && text(12, 4) === "IHDR") {
    width = view.getUint32(16); height = view.getUint32(20);
  } else if (match[1] === "image/webp" && bytes.length >= 30 && text(0, 4) === "RIFF" && text(8, 4) === "WEBP" && view.getUint32(4, true) + 8 === bytes.length) {
    const chunkSize = view.getUint32(16, true);
    if (chunkSize + 20 <= bytes.length) {
      if (text(12, 4) === "VP8X" && chunkSize >= 10) { width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16); height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16); }
      else if (text(12, 4) === "VP8L" && chunkSize >= 5 && bytes[20] === 0x2f) { width = 1 + ((bytes[21] | bytes[22] << 8) & 0x3fff); height = 1 + ((bytes[22] >> 6 | bytes[23] << 2 | bytes[24] << 10) & 0x3fff); }
      else if (text(12, 4) === "VP8 " && chunkSize >= 10 && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) { width = view.getUint16(26, true) & 0x3fff; height = view.getUint16(28, true) & 0x3fff; }
    }
  } else if (match[1] === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 0xff) break;
      while (offset + 1 < bytes.length && bytes[offset + 1] === 0xff) offset++;
      const marker = bytes[offset + 1];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { offset += 2; continue; }
      if (offset + 4 > bytes.length) break;
      const length = view.getUint16(offset + 2);
      if (length < 2 || offset + 2 + length > bytes.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        if (length < 8) break;
        height = view.getUint16(offset + 5); width = view.getUint16(offset + 7); break;
      }
      offset += 2 + length;
    }
  }
  if (width < 1 || height < 1 || width > maxDimension || height > maxDimension || width * height > maxPixels) throw new UploadedImageError("invalid_image_dimensions");
  return { bytes, mime: match[1], extension: match[1] === "image/jpeg" ? "jpg" : match[1].slice(6), width, height };
}
