import { escapeHtml } from './ui';
import { missingThumb, openEditPhotoWizard, startAddPhotoWizard } from './photo-wizard';

export type PhotoFieldOptions = {
  folder: string;
  label: string;
  fullName?: string;
  thumbName?: string;
  fullUrl?: string;
  thumbUrl?: string;
  required?: boolean;
};

function syncPhotoField(field: HTMLElement) {
  const full = field.querySelector<HTMLInputElement>('[data-photo-full]');
  const thumb = field.querySelector<HTMLInputElement>('[data-photo-thumb]');
  const preview = field.querySelector<HTMLImageElement>('[data-photo-preview]');
  const empty = field.querySelector('[data-photo-empty]');
  const mark = field.querySelector('[data-photo-missing]');
  const fullUrl = full?.value.trim() || '';
  const thumbUrl = thumb?.value.trim() || '';
  const previewUrl = thumbUrl || fullUrl;

  if (preview) {
    preview.src = previewUrl;
    preview.classList.toggle('is-hidden', !previewUrl);
  }
  empty?.classList.toggle('is-hidden', Boolean(previewUrl));
  mark?.classList.toggle('is-hidden', !missingThumb(thumbUrl, fullUrl));
}

export function photoFieldHtml(opts: PhotoFieldOptions): string {
  const fullName = opts.fullName || 'imagen';
  const thumbName = opts.thumbName || 'imagen_thumb';
  const fullUrl = opts.fullUrl || '';
  const thumbUrl = opts.thumbUrl || '';
  const preview = thumbUrl || fullUrl;
  const needs = missingThumb(thumbUrl, fullUrl);

  return `
    <div class="media-field" data-photo-field data-folder="${escapeHtml(opts.folder)}">
      <span class="media-field__label">${escapeHtml(opts.label)}</span>
      <div class="media-field__row">
        <div class="media-field__preview">
          <img src="${escapeHtml(preview)}" alt="" data-photo-preview class="${preview ? '' : 'is-hidden'}">
          <div data-photo-empty class="media-field__empty ${preview ? 'is-hidden' : ''}">Sin imagen</div>
        </div>
        <div class="media-field__controls">
          <input type="hidden" name="${escapeHtml(fullName)}" value="${escapeHtml(fullUrl)}" ${opts.required ? 'required' : ''} data-photo-full>
          <input type="hidden" name="${escapeHtml(thumbName)}" value="${escapeHtml(thumbUrl)}" data-photo-thumb>
          <p class="admin-table-sub ${needs ? '' : 'is-hidden'}" data-photo-missing>Sin miniatura</p>
          <div class="admin-actions" style="margin:0">
            <button type="button" class="btn btn--outline" data-photo-open>Elegir foto y miniatura</button>
            <button type="button" class="btn btn--outline" data-photo-review ${preview ? '' : 'hidden'}>Revisar miniatura</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindPhotoFields(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-photo-field]').forEach((field) => {
    if (field.dataset.photoBound === 'true') return;
    field.dataset.photoBound = 'true';

    const folder = field.dataset.folder || 'uploads';
    const full = field.querySelector<HTMLInputElement>('[data-photo-full]');
    const thumb = field.querySelector<HTMLInputElement>('[data-photo-thumb]');
    const review = field.querySelector<HTMLButtonElement>('[data-photo-review]');

    const apply = (result: { fullUrl: string; thumbUrl: string }) => {
      if (full) full.value = result.fullUrl;
      if (thumb) thumb.value = result.thumbUrl;
      if (review) review.hidden = false;
      syncPhotoField(field);
    };

    field.querySelector('[data-photo-open]')?.addEventListener('click', () => {
      startAddPhotoWizard({ folder, onDone: apply });
    });

    review?.addEventListener('click', () => {
      const fullUrl = full?.value.trim() || '';
      if (!fullUrl) {
        startAddPhotoWizard({ folder, onDone: apply });
        return;
      }
      openEditPhotoWizard({
        folder,
        fullUrl,
        thumbUrl: thumb?.value.trim() || '',
        onDone: apply,
      });
    });
  });
}
