import { escapeHtml, showToast } from './ui';
import {
  DEFAULT_MEDIA_FOLDERS,
  listSiteFolders,
  listSiteMedia,
  uploadSiteMedia,
  type MediaItem,
} from './upload';

export type MediaFieldOptions = {
  name: string;
  label: string;
  value?: string;
  folder?: string;
  required?: boolean;
};

export type MediaPickResult = {
  url: string;
  file?: File;
  remoteUrl?: string;
};

export function mediaFieldHtml(opts: MediaFieldOptions): string {
  const value = opts.value || '';
  const folder = opts.folder || 'uploads';

  return `
    <div class="media-field" data-media-field data-folder="${escapeHtml(folder)}">
      <span class="media-field__label">${escapeHtml(opts.label)}</span>
      <div class="media-field__row">
        <div class="media-field__preview">
          <img src="${escapeHtml(value)}" alt="" data-media-preview class="${value ? '' : 'is-hidden'}">
          <div data-media-empty class="media-field__empty ${value ? 'is-hidden' : ''}">Sin imagen</div>
        </div>
        <div class="media-field__controls">
          <input
            type="url"
            name="${escapeHtml(opts.name)}"
            value="${escapeHtml(value)}"
            ${opts.required ? 'required' : ''}
            data-media-input
            placeholder="URL de Storage"
          >
          <div class="admin-actions" style="margin:0">
            <button type="button" class="btn btn--outline" data-media-open>Biblioteca / subir</button>
            <button type="button" class="btn btn--outline" data-media-clear ${value ? '' : 'hidden'}>Quitar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

type PickerState = {
  onPick: (result: MediaPickResult) => void;
  preferredFolder: string;
  selectedUrl: string;
  selectedFile: File | null;
  selectedRemoteUrl: string | null;
  deferUpload: boolean;
  items: MediaItem[];
};

let pickerState: PickerState | null = null;
let modalReady = false;

function setTab(tab: 'library' | 'upload') {
  const modal = document.querySelector<HTMLElement>('[data-media-modal]');
  if (!modal) return;
  modal.querySelectorAll('[data-media-tab]').forEach((btn) => {
    const el = btn as HTMLElement;
    el.dataset.active = String(el.dataset.mediaTab === tab);
  });
  modal.querySelectorAll('[data-media-panel]').forEach((panel) => {
    const el = panel as HTMLElement;
    el.classList.toggle('is-hidden', el.dataset.mediaPanel !== tab);
  });
}

function selectUrl(url: string, opts?: { file?: File | null; remoteUrl?: string | null }) {
  if (!pickerState) return;
  if (pickerState.selectedFile && pickerState.selectedUrl.startsWith('blob:')) {
    URL.revokeObjectURL(pickerState.selectedUrl);
  }
  pickerState.selectedUrl = url;
  pickerState.selectedFile = opts?.file ?? null;
  pickerState.selectedRemoteUrl = opts?.remoteUrl ?? (opts?.file ? null : url || null);
  const modal = document.querySelector('[data-media-modal]');
  const label = modal?.querySelector('[data-media-selected-label]');
  const confirm = modal?.querySelector<HTMLButtonElement>('[data-media-confirm]');
  if (label) {
    label.textContent = opts?.file ? `Archivo: ${opts.file.name}` : url || 'Ninguna seleccionada';
  }
  if (confirm) confirm.disabled = !url;

  modal?.querySelectorAll('[data-media-item]').forEach((el) => {
    (el as HTMLElement).dataset.selected = String((el as HTMLElement).dataset.url === url);
  });
}

function setUploadPreview(url: string | null) {
  const modal = document.querySelector('[data-media-modal]');
  const wrap = modal?.querySelector<HTMLElement>('[data-media-upload-preview-wrap]');
  const img = modal?.querySelector<HTMLImageElement>('[data-media-upload-preview]');
  const dropzone = modal?.querySelector<HTMLElement>('[data-media-dropzone]');
  if (!wrap || !img) return;

  const visible = Boolean(url);
  wrap.classList.toggle('is-hidden', !visible);
  dropzone?.classList.toggle('is-hidden', visible);
  if (visible) img.src = url!;
  else img.removeAttribute('src');
}

function renderGrid(items: MediaItem[]) {
  const modal = document.querySelector('[data-media-modal]');
  const grid = modal?.querySelector('[data-media-grid]');
  const status = modal?.querySelector('[data-media-status]');
  if (!grid || !status) return;

  if (items.length === 0) {
    status.textContent = 'No hay imágenes en esta carpeta.';
    grid.innerHTML = '';
    return;
  }

  status.textContent = `${items.length} imagen${items.length === 1 ? '' : 'es'}`;
  grid.innerHTML = items
    .map(
      (item) => `
      <button
        type="button"
        class="media-item"
        data-media-item
        data-url="${escapeHtml(item.url)}"
        data-selected="${pickerState?.selectedUrl === item.url ? 'true' : 'false'}"
        title="${escapeHtml(item.path)}"
      >
        <img src="${escapeHtml(item.url)}" alt="" loading="lazy">
        <span>${escapeHtml(item.path)}</span>
      </button>
    `,
    )
    .join('');

  grid.querySelectorAll('[data-media-item]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = (btn as HTMLElement).dataset.url || '';
      selectUrl(url, { remoteUrl: url, file: null });
      setUploadPreview(null);
    });
  });
}

async function loadLibrary(folderFilter: string) {
  const modal = document.querySelector('[data-media-modal]');
  const status = modal?.querySelector('[data-media-status]');
  if (status) status.textContent = 'Cargando…';
  try {
    const items = await listSiteMedia(folderFilter);
    if (pickerState) pickerState.items = items;
    renderGrid(items);
  } catch (error) {
    if (status) status.textContent = error instanceof Error ? error.message : 'Error al listar';
    showToast(error instanceof Error ? error.message : 'Error al listar imágenes', 'err');
  }
}

async function populateFolders(preferred: string) {
  const modal = document.querySelector('[data-media-modal]');
  const select = modal?.querySelector<HTMLSelectElement>('[data-media-folder-filter]');
  const uploadFolder = modal?.querySelector<HTMLInputElement>('[data-media-upload-folder]');
  if (!select) return;

  let folders: string[] = [];
  try {
    folders = await listSiteFolders();
  } catch {
    folders = [];
  }

  const unique = Array.from(
    new Set([...DEFAULT_MEDIA_FOLDERS, preferred, ...folders].filter(Boolean)),
  );
  select.innerHTML =
    `<option value="">Todas</option>` +
    unique.map((f) => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`).join('');

  if (preferred && unique.includes(preferred)) select.value = preferred;
  if (uploadFolder) uploadFolder.value = preferred || 'uploads';
}

function ensureModal(): HTMLElement {
  let modal = document.querySelector<HTMLElement>('[data-media-modal]');
  if (modal && modalReady) return modal;

  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'media-modal';
    modal.dataset.mediaModal = '';
    modal.innerHTML = `
      <div class="media-dialog" role="dialog" aria-modal="true" aria-label="Selector de imagen">
        <header class="media-dialog__header">
          <div>
            <p class="media-dialog__eyebrow">Storage</p>
            <h2 data-media-title>Elegir imagen</h2>
          </div>
          <button type="button" class="btn btn--outline" data-media-close aria-label="Cerrar">Cerrar</button>
        </header>

        <div class="media-dialog__tabs">
          <button type="button" class="media-tab" data-media-tab="library" data-active="true">Biblioteca</button>
          <button type="button" class="media-tab" data-media-tab="upload" data-active="false">Subir nueva</button>
        </div>

        <div class="media-dialog__body" data-media-panel="library">
          <div class="media-toolbar">
            <label>
              Carpeta
              <select data-media-folder-filter>
                <option value="">Todas</option>
              </select>
            </label>
            <button type="button" class="btn btn--outline" data-media-refresh>Actualizar</button>
          </div>
          <p class="muted" data-media-status>Cargando…</p>
          <div class="media-grid" data-media-grid></div>
        </div>

        <div class="media-dialog__body is-hidden" data-media-panel="upload">
          <label class="media-upload-folder">
            Carpeta de destino
            <input data-media-upload-folder value="uploads">
          </label>
          <div class="media-dropzone" data-media-dropzone tabindex="0" role="button" aria-label="Elegir o soltar una imagen">
            <span>Haz clic o suelta una imagen</span>
            <small>JPG, PNG, WebP…</small>
            <input type="file" accept="image/*" class="sr-only" data-media-file tabindex="-1">
          </div>
          <div class="media-upload-preview is-hidden" data-media-upload-preview-wrap>
            <p>Vista previa</p>
            <div class="media-upload-preview__frame">
              <img data-media-upload-preview alt="Vista previa de la imagen seleccionada">
            </div>
            <button type="button" class="btn btn--outline" data-media-upload-change>Elegir otra imagen</button>
          </div>
          <p class="muted" data-media-upload-status></p>
        </div>

        <footer class="media-dialog__footer">
          <p data-media-selected-label>Ninguna seleccionada</p>
          <div class="admin-actions" style="margin:0">
            <button type="button" class="btn btn--outline" data-media-close>Cancelar</button>
            <button type="button" class="btn btn--gold" data-media-confirm disabled>Usar imagen</button>
          </div>
        </footer>
      </div>
    `;
    document.body.appendChild(modal);
  }

  if (!modalReady) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeMediaModal();
    });
    modal.querySelectorAll('[data-media-close]').forEach((btn) => {
      btn.addEventListener('click', () => closeMediaModal());
    });
    modal.querySelectorAll('[data-media-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.mediaTab as 'library' | 'upload';
        setTab(tab);
      });
    });
    modal.querySelector('[data-media-confirm]')?.addEventListener('click', () => {
      if (!pickerState?.selectedUrl) return;
      const result: MediaPickResult = {
        url: pickerState.selectedUrl,
        file: pickerState.selectedFile || undefined,
        remoteUrl: pickerState.selectedRemoteUrl || undefined,
      };
      const onPick = pickerState.onPick;
      closeMediaModal();
      onPick(result);
    });
    modal.querySelector('[data-media-refresh]')?.addEventListener('click', () => {
      const folderFilter = modal.querySelector<HTMLSelectElement>('[data-media-folder-filter]');
      loadLibrary(folderFilter?.value || '');
    });
    modal.querySelector<HTMLSelectElement>('[data-media-folder-filter]')?.addEventListener('change', (event) => {
      const value = (event.currentTarget as HTMLSelectElement).value || '';
      loadLibrary(value);
    });

    const fileInput = modal.querySelector<HTMLInputElement>('[data-media-file]');
    const dropzone = modal.querySelector<HTMLElement>('[data-media-dropzone]');

    async function handlePickedFile(file: File) {
      if (!pickerState || !fileInput) return;
      if (!file.type.startsWith('image/')) {
        showToast('El archivo debe ser una imagen', 'err');
        return;
      }

      const dest =
        modal.querySelector<HTMLInputElement>('[data-media-upload-folder]')?.value.trim() ||
        pickerState.preferredFolder ||
        'uploads';
      const uploadStatus = modal.querySelector('[data-media-upload-status]');

      if (pickerState.deferUpload) {
        const objectUrl = URL.createObjectURL(file);
        selectUrl(objectUrl, { file, remoteUrl: null });
        setUploadPreview(objectUrl);
        if (uploadStatus) {
          uploadStatus.textContent = 'Revisa la imagen y pulsa continuar (aún no se sube).';
        }
        setTab('upload');
        return;
      }

      if (uploadStatus) uploadStatus.textContent = 'Subiendo…';
      try {
        const url = await uploadSiteMedia(file, dest);
        selectUrl(url, { remoteUrl: url, file: null });
        setUploadPreview(url);
        if (uploadStatus) uploadStatus.textContent = 'Revisa la imagen y pulsa “Usar imagen”.';
        showToast('Imagen subida');
        const folderFilter = modal.querySelector<HTMLSelectElement>('[data-media-folder-filter]');
        if (folderFilter) folderFilter.value = dest;
        await loadLibrary(dest);
        setTab('upload');
      } catch (error) {
        if (uploadStatus) {
          uploadStatus.textContent = error instanceof Error ? error.message : 'Error al subir';
        }
        showToast(error instanceof Error ? error.message : 'Error al subir', 'err');
      } finally {
        fileInput.value = '';
      }
    }

    fileInput?.addEventListener('change', async (event) => {
      const input = event.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      await handlePickedFile(file);
    });

    dropzone?.addEventListener('click', (event) => {
      if ((event.target as HTMLElement).closest('input')) return;
      fileInput?.click();
    });

    dropzone?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fileInput?.click();
      }
    });

    dropzone?.addEventListener('dragenter', (event) => {
      event.preventDefault();
      dropzone.dataset.drag = 'true';
    });
    dropzone?.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      dropzone.dataset.drag = 'true';
    });
    dropzone?.addEventListener('dragleave', (event) => {
      const related = event.relatedTarget as Node | null;
      if (related && dropzone.contains(related)) return;
      dropzone.dataset.drag = 'false';
    });
    dropzone?.addEventListener('drop', async (event) => {
      event.preventDefault();
      dropzone.dataset.drag = 'false';
      const file = event.dataTransfer?.files?.[0];
      if (!file) return;
      await handlePickedFile(file);
    });

    modal.querySelector('[data-media-upload-change]')?.addEventListener('click', () => {
      fileInput?.click();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        closeMediaModal();
      }
    });

    modalReady = true;
  }

  return modal;
}

export async function openMediaModal(options: {
  currentUrl?: string;
  folder?: string;
  deferUpload?: boolean;
  title?: string;
  confirmLabel?: string;
  onSelect?: (url: string) => void;
  onPick?: (result: MediaPickResult) => void;
}): Promise<void> {
  const modal = ensureModal();
  const folder = options.folder || 'uploads';
  const title = options.title || 'Elegir imagen';
  const confirmLabel = options.confirmLabel || 'Usar imagen';

  pickerState = {
    onPick: (result) => {
      options.onPick?.(result);
      options.onSelect?.(result.remoteUrl || result.url);
    },
    preferredFolder: folder,
    selectedUrl: options.currentUrl || '',
    selectedFile: null,
    selectedRemoteUrl: options.currentUrl || null,
    deferUpload: Boolean(options.deferUpload),
    items: [],
  };

  const titleEl = modal.querySelector('[data-media-title]');
  if (titleEl) titleEl.textContent = title;
  const confirmBtn = modal.querySelector('[data-media-confirm]');
  if (confirmBtn) confirmBtn.textContent = confirmLabel;

  const uploadStatus = modal.querySelector('[data-media-upload-status]');
  if (uploadStatus) {
    uploadStatus.textContent = pickerState.deferUpload
      ? 'Puedes elegir de la biblioteca o un archivo nuevo (se subirá al guardar).'
      : '';
  }

  setUploadPreview(null);
  selectUrl(pickerState.selectedUrl, {
    remoteUrl: pickerState.selectedRemoteUrl,
    file: null,
  });
  setTab('library');
  modal.classList.add('is-open');

  await populateFolders(folder);
  const folderFilter = modal.querySelector<HTMLSelectElement>('[data-media-folder-filter]');
  await loadLibrary(folderFilter?.value || folder);
}

export function closeMediaModal(): void {
  const modal = document.querySelector<HTMLElement>('[data-media-modal]');
  if (!modal) return;
  modal.classList.remove('is-open');
  pickerState = null;
}

function syncFieldUI(field: HTMLElement) {
  const input = field.querySelector<HTMLInputElement>('[data-media-input]');
  const preview = field.querySelector<HTMLImageElement>('[data-media-preview]');
  const empty = field.querySelector('[data-media-empty]');
  const clear = field.querySelector<HTMLElement>('[data-media-clear]');
  const url = input?.value.trim() || '';

  if (preview) {
    preview.src = url || '';
    preview.classList.toggle('is-hidden', !url);
  }
  empty?.classList.toggle('is-hidden', Boolean(url));
  if (clear) clear.hidden = !url;
}

export function bindMediaFields(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-media-field]').forEach((field) => {
    if (field.dataset.mediaBound === 'true') return;
    field.dataset.mediaBound = 'true';

    const input = field.querySelector<HTMLInputElement>('[data-media-input]');
    const openBtn = field.querySelector('[data-media-open]');
    const clearBtn = field.querySelector('[data-media-clear]');
    const folder = field.dataset.folder || 'uploads';

    input?.addEventListener('input', () => syncFieldUI(field));

    openBtn?.addEventListener('click', () => {
      openMediaModal({
        currentUrl: input?.value || '',
        folder,
        onSelect: (url) => {
          if (input) input.value = url;
          syncFieldUI(field);
        },
      });
    });

    clearBtn?.addEventListener('click', () => {
      if (input) input.value = '';
      syncFieldUI(field);
    });
  });
}
