import { openMediaModal, type MediaPickResult } from './media-picker';
import {
  DEFAULT_THUMB_PARAMS,
  generateThumbnail,
  loadImageElement,
  revokePreviewUrl,
  thumbFileFromBlob,
  type ThumbParams,
  type ThumbResult,
} from './thumb-gen';
import { uploadSiteMedia } from './upload';
import { showToast } from './ui';

export type PhotoWizardResult = {
  fullUrl: string;
  thumbUrl: string;
};

export function missingThumb(thumb?: string | null, full?: string | null) {
  return Boolean(full) && (!thumb || thumb === full);
}

type WizardMode = 'keep' | 'generated' | 'custom';

type WizardState = {
  folder: string;
  full: MediaPickResult;
  sourceWidth: number;
  sourceHeight: number;
  params: ThumbParams;
  thumb: ThumbResult | null;
  customThumbUrl: string | null;
  customThumbFile: File | null;
  mode: WizardMode;
  editMode: boolean;
  existingThumbUrl: string | null;
  existingWidth: number;
  existingHeight: number;
  saving: boolean;
  onDone: (result: PhotoWizardResult) => void;
};

type PreviewZoom = {
  scale: number;
  panX: number;
  panY: number;
  dragging: boolean;
  didPan: boolean;
  dragStartX: number;
  dragStartY: number;
  panStartX: number;
  panStartY: number;
  comparing: boolean;
};

let wizardState: WizardState | null = null;
let wizardReady = false;
let resetPreviewZoom: (() => void) | null = null;
let layoutPreviewFrame: (() => void) | null = null;
let setCompareMode: ((on: boolean) => void) | null = null;

const previewZoom: PreviewZoom = {
  scale: 1,
  panX: 0,
  panY: 0,
  dragging: false,
  didPan: false,
  dragStartX: 0,
  dragStartY: 0,
  panStartX: 0,
  panStartY: 0,
  comparing: false,
};

const ZOOM_MIN = 1;
const ZOOM_MAX = 4.5;
const ZOOM_STEP = 0.14;
const ZOOM_CLICK = 3;
const PAN_THRESHOLD = 6;

function modalEl() {
  return document.querySelector<HTMLElement>('[data-photo-wizard]');
}

async function sourceForThumb(full: MediaPickResult): Promise<File | string> {
  if (full.file) return full.file;
  const url = full.remoteUrl || full.url;
  if (!url) throw new Error('Falta la imagen completa.');
  if (url.startsWith('blob:')) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const blob = await res.blob();
    return new File([blob], 'source.jpg', { type: blob.type || 'image/jpeg' });
  } catch {
    return url;
  }
}

export async function generateAndUploadThumb(fullUrl: string, folder: string): Promise<string> {
  const source = await sourceForThumb({ url: fullUrl, remoteUrl: fullUrl });
  const thumb = await generateThumbnail(source, DEFAULT_THUMB_PARAMS);
  const file = thumbFileFromBlob(thumb.blob, `thumb-${Date.now()}`);
  const thumbUrl = await uploadSiteMedia(file, `${folder.replace(/^\/+|\/+$/g, '')}/thumbs`);
  revokePreviewUrl(thumb.previewUrl);
  return thumbUrl;
}

function fullImageSrc() {
  if (!wizardState) return '';
  return wizardState.full.url || wizardState.full.remoteUrl || '';
}

function ensureWizard(): HTMLElement {
  let modal = modalEl();
  if (modal && !modal.querySelector('[data-wizard-frame]')) {
    modal.remove();
    modal = null;
    wizardReady = false;
  }
  if (modal && wizardReady) return modal;

  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'photo-wizard-modal';
    modal.dataset.photoWizard = '';
    modal.innerHTML = `
      <div class="photo-wizard" role="dialog" aria-modal="true" aria-label="Revisar miniatura">
        <section class="photo-wizard__viewport" data-wizard-viewport>
          <div class="photo-wizard__stage" data-wizard-stage>
            <div class="photo-wizard__frame" data-wizard-frame>
              <img data-wizard-preview alt="Vista previa de la miniatura" draggable="false">
              <img data-wizard-full alt="Imagen completa para comparar" draggable="false" aria-hidden="true">
            </div>
          </div>
          <div class="photo-wizard__overlay">
            <p class="photo-wizard__kicker">Vista previa</p>
            <p class="photo-wizard__badge is-hidden" data-wizard-compare-badge>Imagen completa</p>
          </div>
          <p class="photo-wizard__hint">Clic = comparar con la original · rueda = zoom · arrastra para mover · clic derecho (mantener) = comparar</p>
        </section>

        <aside class="photo-wizard__aside">
          <header class="photo-wizard__header">
            <div>
              <p class="media-dialog__eyebrow" data-wizard-eyebrow>Nueva foto</p>
              <h2 data-wizard-title>Revisar miniatura</h2>
            </div>
            <button type="button" class="btn btn--outline" data-wizard-close>Cerrar</button>
          </header>

          <div class="photo-wizard__controls">
            <div class="photo-wizard__stats">
              <p class="photo-wizard__label">Resultado</p>
              <dl>
                <div>
                  <dt>Tamaño</dt>
                  <dd data-wizard-meta-size>—</dd>
                </div>
                <div>
                  <dt>Peso</dt>
                  <dd data-wizard-meta-weight>—</dd>
                </div>
              </dl>
              <p class="muted" data-wizard-meta-extra></p>
            </div>

            <div data-wizard-generated-controls>
              <p class="muted" data-wizard-help>Ajusta los parámetros y genera de nuevo, o elige una miniatura propia.</p>
              <label>Ancho máximo (px)
                <input type="range" min="160" max="640" step="20" value="640" data-wizard-width>
                <span data-wizard-width-label>640 px</span>
                <span class="muted" data-wizard-width-hint></span>
              </label>
              <label>Calidad
                <input type="range" min="50" max="95" step="5" value="78" data-wizard-quality>
                <span data-wizard-quality-label>78%</span>
              </label>
              <button type="button" class="btn btn--outline" data-wizard-regen>Generar miniatura nueva</button>
            </div>

            <p class="photo-wizard__note is-hidden" data-wizard-custom-note>
              Usando una miniatura propia. Puedes volver a generar desde la imagen completa.
            </p>
            <p class="photo-wizard__note is-hidden" data-wizard-keep-note>
              Mostrando la miniatura guardada. Genera una nueva o elige una propia si quieres cambiarla.
            </p>

            <div class="photo-wizard__extra">
              <button type="button" class="btn btn--outline" data-wizard-custom>Elegir miniatura propia</button>
              <button type="button" class="btn btn--outline is-hidden" data-wizard-restore-saved>Restaurar miniatura guardada</button>
              <button type="button" class="btn btn--outline is-hidden" data-wizard-use-generated>Volver a miniatura generada</button>
            </div>
          </div>

          <footer class="photo-wizard__footer">
            <p class="muted" data-wizard-status></p>
            <div class="admin-actions" style="margin:0">
              <button type="button" class="btn btn--outline" data-wizard-close>Cancelar</button>
              <button type="button" class="btn btn--gold" data-wizard-accept>Guardar foto</button>
            </div>
          </footer>
        </aside>
      </div>
    `;
    document.body.appendChild(modal);
  }

  if (!wizardReady) {
    modal.querySelectorAll('[data-wizard-close]').forEach((btn) => {
      btn.addEventListener('click', () => closePhotoWizard());
    });
    modal.querySelector('[data-wizard-regen]')?.addEventListener('click', () => {
      void regenerateFromControls();
    });
    modal.querySelector('[data-wizard-width]')?.addEventListener('input', syncParamLabels);
    modal.querySelector('[data-wizard-quality]')?.addEventListener('input', syncParamLabels);
    modal.querySelector('[data-wizard-custom]')?.addEventListener('click', () => pickCustomThumb());
    modal.querySelector('[data-wizard-restore-saved]')?.addEventListener('click', () => restoreSavedThumb());
    modal.querySelector('[data-wizard-use-generated]')?.addEventListener('click', () => {
      if (!wizardState) return;
      wizardState.mode = 'generated';
      wizardState.customThumbUrl = null;
      wizardState.customThumbFile = null;
      updateModeUI();
      void regenerateFromControls();
    });
    modal.querySelector('[data-wizard-accept]')?.addEventListener('click', () => {
      void acceptWizard();
    });
    bindPreviewInteractions(modal);
    wizardReady = true;
  }

  return modal;
}

function bindPreviewInteractions(modal: HTMLElement) {
  const viewport = modal.querySelector<HTMLElement>('[data-wizard-viewport]');
  const stage = modal.querySelector<HTMLElement>('[data-wizard-stage]');
  const frame = modal.querySelector<HTMLElement>('[data-wizard-frame]');
  const thumbEl = modal.querySelector<HTMLImageElement>('[data-wizard-preview]');
  const fullEl = modal.querySelector<HTMLImageElement>('[data-wizard-full]');
  const compareBadge = modal.querySelector<HTMLElement>('[data-wizard-compare-badge]');
  if (!viewport || !stage || !frame || !thumbEl || !fullEl) return;

  function applyZoom() {
    frame.style.transform = `translate3d(${previewZoom.panX}px, ${previewZoom.panY}px, 0) scale(${previewZoom.scale})`;
    const zoomed = previewZoom.scale > 1.01;
    frame.classList.toggle('is-zoomed', zoomed);
    frame.classList.toggle('is-comparing', previewZoom.comparing);
    frame.classList.toggle('is-panning', previewZoom.dragging);
  }

  function resetZoom() {
    previewZoom.scale = 1;
    previewZoom.panX = 0;
    previewZoom.panY = 0;
    previewZoom.dragging = false;
    previewZoom.didPan = false;
    frame.style.transition = 'transform 0.25s ease-out';
    applyZoom();
    window.setTimeout(() => {
      frame.style.transition = '';
    }, 280);
  }

  function layoutFrame() {
    const nw = thumbEl.naturalWidth;
    const nh = thumbEl.naturalHeight;
    if (!nw || !nh) return;
    const availW = Math.max(1, stage.clientWidth);
    const availH = Math.max(1, stage.clientHeight);
    const fit = Math.min(availW / nw, availH / nh);
    frame.style.width = `${Math.max(1, Math.round(nw * fit))}px`;
    frame.style.height = `${Math.max(1, Math.round(nh * fit))}px`;
  }

  function showCompare(on: boolean) {
    if (on) {
      if (!fullEl.src || !thumbEl.src) return;
      previewZoom.comparing = true;
      fullEl.style.opacity = '1';
      thumbEl.style.opacity = '0';
      compareBadge?.classList.remove('is-hidden');
      applyZoom();
      return;
    }
    if (!previewZoom.comparing) return;
    previewZoom.comparing = false;
    fullEl.style.opacity = '0';
    thumbEl.style.opacity = '1';
    compareBadge?.classList.add('is-hidden');
    applyZoom();
  }

  resetPreviewZoom = resetZoom;
  layoutPreviewFrame = layoutFrame;
  setCompareMode = showCompare;

  thumbEl.addEventListener('load', () => layoutFrame());
  window.addEventListener('resize', () => {
    if (!modal.classList.contains('is-open')) return;
    layoutFrame();
  });

  function setZoom(nextScale: number, clientX: number, clientY: number, smooth = true) {
    const prev = previewZoom.scale;
    previewZoom.scale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, nextScale));
    if (previewZoom.scale === prev) return;
    const view = viewport.getBoundingClientRect();
    const ox = clientX - (view.left + view.width / 2);
    const oy = clientY - (view.top + view.height / 2);
    const ratio = previewZoom.scale / prev;
    previewZoom.panX = ox - (ox - previewZoom.panX) * ratio;
    previewZoom.panY = oy - (oy - previewZoom.panY) * ratio;
    if (previewZoom.scale <= 1) {
      previewZoom.panX = 0;
      previewZoom.panY = 0;
    }
    frame.style.transition = smooth ? 'transform 0.2s ease-out' : 'none';
    applyZoom();
    if (smooth) {
      window.setTimeout(() => {
        frame.style.transition = '';
      }, 220);
    }
  }

  viewport.addEventListener(
    'wheel',
    (event) => {
      if (!modal.classList.contains('is-open')) return;
      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1;
      setZoom(previewZoom.scale + direction * ZOOM_STEP, event.clientX, event.clientY, false);
    },
    { passive: false },
  );

  frame.addEventListener('contextmenu', (event) => event.preventDefault());

  frame.addEventListener('pointerdown', (event) => {
    if (event.button === 2) {
      event.preventDefault();
      event.stopPropagation();
      showCompare(true);
      try {
        frame.setPointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
      return;
    }
    if (event.button !== 0) return;
    event.stopPropagation();
    previewZoom.didPan = false;
    previewZoom.dragStartX = event.clientX;
    previewZoom.dragStartY = event.clientY;
    previewZoom.panStartX = previewZoom.panX;
    previewZoom.panStartY = previewZoom.panY;
    frame.setPointerCapture(event.pointerId);
    if (previewZoom.scale > 1) {
      previewZoom.dragging = true;
      applyZoom();
    }
  });

  frame.addEventListener('pointermove', (event) => {
    if (previewZoom.comparing) return;
    const dx = event.clientX - previewZoom.dragStartX;
    const dy = event.clientY - previewZoom.dragStartY;
    if (Math.hypot(dx, dy) > PAN_THRESHOLD) previewZoom.didPan = true;
    if (!previewZoom.dragging || previewZoom.scale <= 1) return;
    previewZoom.panX = previewZoom.panStartX + dx;
    previewZoom.panY = previewZoom.panStartY + dy;
    frame.style.transition = 'none';
    applyZoom();
  });

  function endImagePointer(event: PointerEvent) {
    if (event.button === 2 || previewZoom.comparing) {
      showCompare(false);
      try {
        frame.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
      return;
    }

    const wasDragging = previewZoom.dragging;
    previewZoom.dragging = false;
    try {
      frame.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }

    if (!previewZoom.didPan && event.type !== 'pointercancel') {
      showCompare(!previewZoom.comparing);
    }
    if (wasDragging) applyZoom();
  }

  frame.addEventListener('pointerup', endImagePointer);
  frame.addEventListener('pointercancel', endImagePointer);
  frame.addEventListener('lostpointercapture', () => {
    if (previewZoom.comparing) showCompare(false);
    previewZoom.dragging = false;
    applyZoom();
  });

  frame.addEventListener('dblclick', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (previewZoom.comparing) return;
    if (previewZoom.scale > 1.01) resetZoom();
    else setZoom(ZOOM_CLICK, event.clientX, event.clientY);
  });

  frame.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
  thumbEl.addEventListener('dragstart', (event) => event.preventDefault());
  fullEl.addEventListener('dragstart', (event) => event.preventDefault());
  window.addEventListener('blur', () => showCompare(false));
  window.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closePhotoWizard();
    }
  });
}

function syncParamLabels() {
  const modal = modalEl();
  if (!modal || !wizardState) return;
  const width = modal.querySelector<HTMLInputElement>('[data-wizard-width]');
  const quality = modal.querySelector<HTMLInputElement>('[data-wizard-quality]');
  const widthLabel = modal.querySelector('[data-wizard-width-label]');
  const qualityLabel = modal.querySelector('[data-wizard-quality-label]');
  if (width && widthLabel) widthLabel.textContent = `${width.value} px`;
  if (quality && qualityLabel) qualityLabel.textContent = `${quality.value}%`;
  wizardState.params = readParams();
}

function configureWidthSlider(sourceWidth: number) {
  const modal = modalEl();
  const input = modal?.querySelector<HTMLInputElement>('[data-wizard-width]');
  const hint = modal?.querySelector('[data-wizard-width-hint]');
  if (!input) return;

  const max = Math.max(1, Math.round(sourceWidth));
  const min = Math.min(max, 160);
  const step = max >= 2000 ? 40 : max >= 800 ? 20 : 10;
  const preferred = Math.min(DEFAULT_THUMB_PARAMS.maxWidth, max);
  const value = Math.max(min, Math.min(max, preferred));

  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);

  if (hint) {
    hint.textContent =
      max <= min
        ? `La original mide ${max} px de ancho; no hace falta reducir más.`
        : `Máximo = ancho original (${max} px). No se amplía la imagen.`;
  }

  syncParamLabels();
}

function readParams(): ThumbParams {
  const modal = modalEl();
  const width = Number(modal?.querySelector<HTMLInputElement>('[data-wizard-width]')?.value || 640);
  const qualityPct = Number(modal?.querySelector<HTMLInputElement>('[data-wizard-quality]')?.value || 78);
  const maxAllowed = wizardState?.sourceWidth || width;
  return {
    maxWidth: Math.max(1, Math.min(width, maxAllowed)),
    quality: qualityPct / 100,
    fit: 'contain',
  };
}

function updateModeUI() {
  const modal = modalEl();
  if (!modal || !wizardState) return;
  const { mode, editMode } = wizardState;

  modal.querySelector('[data-wizard-custom-note]')?.classList.toggle('is-hidden', mode !== 'custom');
  modal.querySelector('[data-wizard-keep-note]')?.classList.toggle('is-hidden', mode !== 'keep');
  modal.querySelector('[data-wizard-restore-saved]')?.classList.toggle(
    'is-hidden',
    !(editMode && mode !== 'keep' && Boolean(wizardState.existingThumbUrl)),
  );
  modal.querySelector('[data-wizard-use-generated]')?.classList.toggle('is-hidden', !(mode === 'custom' && !editMode));

  const eyebrow = modal.querySelector('[data-wizard-eyebrow]');
  const title = modal.querySelector('[data-wizard-title]');
  const help = modal.querySelector('[data-wizard-help]');
  if (eyebrow) eyebrow.textContent = editMode ? 'Editar foto' : 'Nueva foto';
  if (title) title.textContent = editMode ? 'Miniatura y comparación' : 'Revisar miniatura';
  if (help) {
    help.textContent = editMode
      ? 'Clic en la imagen para ver la original al mismo tamaño. También puedes generar una miniatura nueva o subir una propia.'
      : 'Ajusta parámetros y regenera, o elige una miniatura propia.';
  }
}

function setStatus(text: string) {
  const el = modalEl()?.querySelector('[data-wizard-status]');
  if (el) el.textContent = text;
}

function setResultMeta(opts: { size: string; weight: string; extra?: string }) {
  const modal = modalEl();
  const sizeEl = modal?.querySelector('[data-wizard-meta-size]');
  const weightEl = modal?.querySelector('[data-wizard-meta-weight]');
  const extraEl = modal?.querySelector('[data-wizard-meta-extra]');
  if (sizeEl) sizeEl.textContent = opts.size;
  if (weightEl) weightEl.textContent = opts.weight;
  if (extraEl) extraEl.textContent = opts.extra || '';
}

function setPreview(url: string, meta: { size: string; weight: string; extra?: string }) {
  const thumbEl = modalEl()?.querySelector<HTMLImageElement>('[data-wizard-preview]');
  const fullEl = modalEl()?.querySelector<HTMLImageElement>('[data-wizard-full]');
  setCompareMode?.(false);
  setResultMeta(meta);

  if (fullEl) {
    const src = fullImageSrc();
    if (src) fullEl.src = src;
    else fullEl.removeAttribute('src');
    fullEl.style.opacity = '0';
  }

  if (thumbEl) {
    thumbEl.style.opacity = '1';
    if (thumbEl.src === url && thumbEl.complete && thumbEl.naturalWidth) {
      layoutPreviewFrame?.();
    } else {
      thumbEl.src = url;
    }
  }
}

function restoreSavedThumb() {
  if (!wizardState?.existingThumbUrl) return;
  if (wizardState.thumb?.previewUrl) {
    revokePreviewUrl(wizardState.thumb.previewUrl);
    wizardState.thumb = null;
  }
  wizardState.mode = 'keep';
  wizardState.customThumbUrl = null;
  wizardState.customThumbFile = null;
  updateModeUI();
  setPreview(wizardState.existingThumbUrl, {
    size:
      wizardState.existingWidth && wizardState.existingHeight
        ? `${wizardState.existingWidth} × ${wizardState.existingHeight} px`
        : 'Guardada',
    weight: '—',
    extra: 'Miniatura actual',
  });
  setStatus('Miniatura guardada restaurada. Puedes guardar o generar una nueva.');
}

async function regenerateFromControls() {
  if (!wizardState) return;
  wizardState.mode = 'generated';
  updateModeUI();
  setStatus('Generando miniatura…');
  try {
    const source = await sourceForThumb(wizardState.full);
    if (wizardState.thumb?.previewUrl) revokePreviewUrl(wizardState.thumb.previewUrl);
    wizardState.params = readParams();
    wizardState.thumb = await generateThumbnail(source, wizardState.params);
    const kb = Math.round(wizardState.thumb.blob.size / 1024);
    setPreview(wizardState.thumb.previewUrl, {
      size: `${wizardState.thumb.width} × ${wizardState.thumb.height} px`,
      weight: `${kb} KB`,
      extra: wizardState.thumb.mime,
    });
    setStatus('Revisa la miniatura. Clic para ver la original al mismo tamaño; rueda para zoom.');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'No se pudo generar la miniatura.');
    showToast(error instanceof Error ? error.message : 'No se pudo generar la miniatura.', 'err');
  }
}

function pickCustomThumb() {
  if (!wizardState) return;
  const folder = wizardState.folder;
  openMediaModal({
    folder,
    deferUpload: true,
    title: 'Miniatura propia',
    onPick: async (result) => {
      if (!wizardState) return;
      wizardState.mode = 'custom';
      wizardState.customThumbFile = result.file || null;
      wizardState.customThumbUrl = result.remoteUrl || result.url;
      updateModeUI();

      let size = 'Personalizada';
      const weight = result.file ? `${Math.round(result.file.size / 1024)} KB` : '—';
      try {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = result.url;
        });
        size = `${img.naturalWidth} × ${img.naturalHeight} px`;
      } catch {
        /* keep defaults */
      }

      setPreview(result.url, {
        size,
        weight,
        extra: result.file ? result.file.name : 'Biblioteca',
      });
      setStatus('Miniatura propia seleccionada. Puedes guardar o volver a generar.');
    },
  });
}

function closePhotoWizard() {
  const modal = modalEl();
  if (wizardState?.thumb?.previewUrl) revokePreviewUrl(wizardState.thumb.previewUrl);
  if (wizardState?.full.file && wizardState.full.url.startsWith('blob:')) {
    revokePreviewUrl(wizardState.full.url);
  }
  wizardState = null;
  previewZoom.comparing = false;
  setCompareMode?.(false);
  resetPreviewZoom?.();
  modal?.classList.remove('is-open');
  document.body.style.overflow = '';
}

async function acceptWizard() {
  if (!wizardState || wizardState.saving) return;
  wizardState.saving = true;
  const acceptBtn = modalEl()?.querySelector<HTMLButtonElement>('[data-wizard-accept]');
  if (acceptBtn) {
    acceptBtn.disabled = true;
    acceptBtn.textContent = 'Guardando…';
  }
  setStatus('Subiendo archivos…');

  try {
    const folder = wizardState.folder.replace(/^\/+|\/+$/g, '');
    let fullUrl = wizardState.full.remoteUrl || '';
    if (wizardState.full.file && !wizardState.full.remoteUrl) {
      fullUrl = await uploadSiteMedia(wizardState.full.file, folder);
    }
    if (!fullUrl) fullUrl = wizardState.full.url;
    if (!fullUrl || fullUrl.startsWith('blob:')) throw new Error('Falta la imagen completa.');

    let thumbUrl = '';
    if (wizardState.mode === 'keep') {
      thumbUrl = wizardState.existingThumbUrl || '';
      if (!thumbUrl) throw new Error('No hay miniatura guardada.');
    } else if (wizardState.mode === 'custom') {
      if (wizardState.customThumbFile) {
        thumbUrl = await uploadSiteMedia(wizardState.customThumbFile, `${folder}/thumbs`);
      } else if (wizardState.customThumbUrl?.startsWith('http')) {
        thumbUrl = wizardState.customThumbUrl;
      } else {
        throw new Error('Selecciona una miniatura propia válida.');
      }
    } else {
      if (!wizardState.thumb) throw new Error('Genera la miniatura antes de guardar.');
      const file = thumbFileFromBlob(wizardState.thumb.blob, `thumb-${Date.now()}`);
      thumbUrl = await uploadSiteMedia(file, `${folder}/thumbs`);
    }

    const done = wizardState.onDone;
    closePhotoWizard();
    done({ fullUrl, thumbUrl });
  } catch (error) {
    if (wizardState) wizardState.saving = false;
    if (acceptBtn) {
      acceptBtn.disabled = false;
      acceptBtn.textContent = wizardState?.editMode ? 'Guardar cambios' : 'Guardar foto';
    }
    const message = error instanceof Error ? error.message : 'No se pudo guardar.';
    setStatus(message);
    showToast(message, 'err');
  }
}

async function openReview(full: MediaPickResult, folder: string, onDone: (result: PhotoWizardResult) => void) {
  const modal = ensureWizard();
  const source = full.file || full.remoteUrl || full.url;
  let sourceWidth = DEFAULT_THUMB_PARAMS.maxWidth;
  let sourceHeight = 0;
  try {
    const img = await loadImageElement(source);
    sourceWidth = img.naturalWidth || img.width || sourceWidth;
    sourceHeight = img.naturalHeight || img.height || 0;
  } catch {
    showToast('No se pudo leer el tamaño de la imagen original.', 'err');
  }

  wizardState = {
    folder,
    full,
    sourceWidth,
    sourceHeight,
    params: { ...DEFAULT_THUMB_PARAMS, maxWidth: Math.min(DEFAULT_THUMB_PARAMS.maxWidth, sourceWidth) },
    thumb: null,
    customThumbUrl: null,
    customThumbFile: null,
    mode: 'generated',
    editMode: false,
    existingThumbUrl: null,
    existingWidth: 0,
    existingHeight: 0,
    saving: false,
    onDone,
  };

  const quality = modal.querySelector<HTMLInputElement>('[data-wizard-quality]');
  if (quality) quality.value = String(Math.round(DEFAULT_THUMB_PARAMS.quality * 100));
  configureWidthSlider(sourceWidth);
  updateModeUI();
  setResultMeta({ size: '—', weight: '—', extra: '' });
  resetPreviewZoom?.();

  const acceptBtn = modal.querySelector<HTMLButtonElement>('[data-wizard-accept]');
  if (acceptBtn) {
    acceptBtn.disabled = false;
    acceptBtn.textContent = 'Guardar foto';
  }

  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  const fullSrc = full.url || full.remoteUrl;
  if (fullSrc) {
    const preload = new Image();
    preload.decoding = 'async';
    preload.src = fullSrc;
  }

  await regenerateFromControls();
}

export function startAddPhotoWizard(options: { folder: string; onDone: (result: PhotoWizardResult) => void }) {
  openMediaModal({
    folder: options.folder,
    deferUpload: true,
    title: 'Imagen completa',
    confirmLabel: 'Continuar',
    onPick: (full) => {
      window.setTimeout(() => {
        void openReview(full, options.folder, options.onDone);
      }, 50);
    },
  });
}

export function openEditPhotoWizard(options: {
  folder: string;
  fullUrl: string;
  thumbUrl: string;
  onDone: (result: PhotoWizardResult) => void;
}) {
  void startEditPhotoWizard(options);
}

async function startEditPhotoWizard(options: {
  folder: string;
  fullUrl: string;
  thumbUrl: string;
  onDone: (result: PhotoWizardResult) => void;
}) {
  const modal = ensureWizard();
  const full: MediaPickResult = { url: options.fullUrl, remoteUrl: options.fullUrl };

  let sourceWidth = DEFAULT_THUMB_PARAMS.maxWidth;
  let sourceHeight = 0;
  try {
    const img = await loadImageElement(options.fullUrl);
    sourceWidth = img.naturalWidth || img.width || sourceWidth;
    sourceHeight = img.naturalHeight || img.height || 0;
  } catch {
    showToast('No se pudo leer el tamaño de la imagen original.', 'err');
  }

  let thumbW = 0;
  let thumbH = 0;
  try {
    const thumbImg = await loadImageElement(options.thumbUrl);
    thumbW = thumbImg.naturalWidth || 0;
    thumbH = thumbImg.naturalHeight || 0;
  } catch {
    /* keep zeros */
  }

  wizardState = {
    folder: options.folder,
    full,
    sourceWidth,
    sourceHeight,
    params: { ...DEFAULT_THUMB_PARAMS, maxWidth: Math.min(DEFAULT_THUMB_PARAMS.maxWidth, sourceWidth) },
    thumb: null,
    customThumbUrl: null,
    customThumbFile: null,
    mode: 'keep',
    editMode: true,
    existingThumbUrl: options.thumbUrl,
    existingWidth: thumbW,
    existingHeight: thumbH,
    saving: false,
    onDone: options.onDone,
  };

  const quality = modal.querySelector<HTMLInputElement>('[data-wizard-quality]');
  if (quality) quality.value = String(Math.round(DEFAULT_THUMB_PARAMS.quality * 100));
  configureWidthSlider(sourceWidth);
  updateModeUI();
  resetPreviewZoom?.();

  const acceptBtn = modal.querySelector<HTMLButtonElement>('[data-wizard-accept]');
  if (acceptBtn) {
    acceptBtn.disabled = false;
    acceptBtn.textContent = 'Guardar cambios';
  }

  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  const preload = new Image();
  preload.decoding = 'async';
  preload.src = options.fullUrl;

  setPreview(options.thumbUrl, {
    size: thumbW && thumbH ? `${thumbW} × ${thumbH} px` : 'Guardada',
    weight: '—',
    extra: 'Miniatura actual',
  });
  setStatus('Clic para comparar con la original. Genera una nueva miniatura o sube una propia si hace falta.');
}
