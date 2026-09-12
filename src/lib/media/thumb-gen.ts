export type ThumbFit = 'cover' | 'contain';

export type ThumbParams = {
  maxWidth: number;
  quality: number;
  fit: ThumbFit;
};

export type ThumbResult = {
  blob: Blob;
  width: number;
  height: number;
  previewUrl: string;
  mime: string;
};

export const DEFAULT_THUMB_PARAMS: ThumbParams = {
  maxWidth: 640,
  quality: 0.78,
  fit: 'contain',
};

function supportsWebp(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

export async function loadImageElement(src: string | File): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  const url = typeof src === 'string' ? src : URL.createObjectURL(src);

  if (typeof src === 'string') {
    img.crossOrigin = 'anonymous';
  }

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('No se pudo cargar la imagen para generar la miniatura'));
      img.src = url;
    });
    return img;
  } catch (error) {
    if (typeof src !== 'string') throw error;
    const fallback = new Image();
    fallback.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      fallback.onload = () => resolve();
      fallback.onerror = () => reject(new Error('No se pudo cargar la imagen para generar la miniatura'));
      fallback.src = src;
    });
    return fallback;
  }
}

function drawThumb(
  source: HTMLImageElement,
  params: ThumbParams,
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const sw = source.naturalWidth || source.width;
  const sh = source.naturalHeight || source.height;
  if (!sw || !sh) throw new Error('Imagen sin dimensiones');

  const maxW = Math.max(64, Math.min(2000, Math.round(params.maxWidth)));
  let sx = 0;
  let sy = 0;
  let sWidth = sw;
  let sHeight = sh;
  let tw: number;
  let th: number;

  if (params.fit === 'cover') {
    const targetRatio = 4 / 5;
    const srcRatio = sw / sh;
    if (srcRatio > targetRatio) {
      sHeight = sh;
      sWidth = Math.round(sh * targetRatio);
      sx = Math.round((sw - sWidth) / 2);
    } else {
      sWidth = sw;
      sHeight = Math.round(sw / targetRatio);
      sy = Math.round((sh - sHeight) / 2);
    }
    const scale = Math.min(1, maxW / sWidth);
    tw = Math.max(1, Math.round(sWidth * scale));
    th = Math.max(1, Math.round(sHeight * scale));
  } else {
    const scale = Math.min(1, maxW / sw);
    tw = Math.max(1, Math.round(sw * scale));
    th = Math.max(1, Math.round(sh * scale));
  }

  const canvas = document.createElement('canvas');
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, sx, sy, sWidth, sHeight, 0, 0, tw, th);
  return { canvas, width: tw, height: th };
}

export async function generateThumbnail(
  source: HTMLImageElement | File | string,
  params: ThumbParams = DEFAULT_THUMB_PARAMS,
): Promise<ThumbResult> {
  const img = source instanceof HTMLImageElement ? source : await loadImageElement(source);
  const { canvas, width, height } = drawThumb(img, params);
  const mime = supportsWebp() ? 'image/webp' : 'image/jpeg';
  const quality = Math.min(1, Math.max(0.4, params.quality));

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) reject(new Error('No se pudo generar el blob de la miniatura'));
        else resolve(result);
      },
      mime,
      quality,
    );
  });

  return {
    blob,
    width,
    height,
    previewUrl: URL.createObjectURL(blob),
    mime,
  };
}

export function revokePreviewUrl(url: string | null | undefined): void {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

export function thumbFileFromBlob(blob: Blob, baseName = 'thumb'): File {
  const ext = blob.type.includes('webp') ? 'webp' : 'jpg';
  return new File([blob], `${baseName}.${ext}`, { type: blob.type || `image/${ext}` });
}
