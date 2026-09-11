import { escapeHtml } from './media/ui';

export type PickerProduct = {
  codigo: string;
  nombre: string;
  thumb: string;
};

type PickerState = {
  products: PickerProduct[];
  selected: string;
  onSelect: (codigo: string) => void;
};

let state: PickerState | null = null;
let ready = false;

function modalEl() {
  return document.querySelector<HTMLElement>('[data-product-modal]');
}

function selectedLabel(products: PickerProduct[], codigo: string) {
  const row = products.find((item) => item.codigo === codigo);
  return row ? row.nombre : 'Ninguno seleccionado';
}

function renderGrid() {
  const modal = modalEl();
  if (!modal || !state) return;
  const query = (modal.querySelector<HTMLInputElement>('[data-product-search]')?.value ?? '')
    .trim()
    .toLowerCase();
  const list = state.products.filter((row) => {
    if (!query) return true;
    return row.nombre.toLowerCase().includes(query) || row.codigo.toLowerCase().includes(query);
  });
  const grid = modal.querySelector('[data-product-grid]');
  const empty = modal.querySelector<HTMLElement>('[data-product-empty]');
  const confirm = modal.querySelector<HTMLButtonElement>('[data-product-confirm]');
  const label = modal.querySelector('[data-product-selected-label]');
  if (grid) {
    grid.innerHTML = list
      .map((row) => {
        const selected = row.codigo === state?.selected;
        return `
          <button type="button" class="product-item" data-product-codigo="${escapeHtml(row.codigo)}" data-selected="${selected}">
            ${row.thumb ? `<img src="${escapeHtml(row.thumb)}" alt="">` : '<div class="product-item__empty" aria-hidden="true"></div>'}
            <span>
              <strong>${escapeHtml(row.nombre)}</strong>
              <small>${escapeHtml(row.codigo)}</small>
            </span>
          </button>
        `;
      })
      .join('');
  }
  if (empty) {
    empty.hidden = list.length > 0;
    empty.textContent = state.products.length
      ? 'No hay piezas con esa búsqueda.'
      : 'No quedan productos por añadir.';
  }
  if (label) label.textContent = selectedLabel(state.products, state.selected);
  if (confirm) confirm.disabled = !state.selected;
}

function closeProductModal() {
  modalEl()?.classList.remove('is-open');
  state = null;
}

function confirmSelection() {
  if (!state?.selected) return;
  const pick = state.selected;
  const onSelect = state.onSelect;
  closeProductModal();
  onSelect(pick);
}

function ensureModal() {
  let modal = modalEl();
  if (modal && ready) return modal;

  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'media-modal';
    modal.dataset.productModal = '';
    modal.innerHTML = `
      <div class="media-dialog" role="dialog" aria-modal="true" aria-label="Elegir producto">
        <header class="media-dialog__header">
          <div>
            <p class="media-dialog__eyebrow">Catálogo</p>
            <h2 data-product-title>Elegir producto</h2>
          </div>
          <button type="button" class="btn btn--outline" data-product-close aria-label="Cerrar">Cerrar</button>
        </header>
        <div class="media-dialog__body">
          <div class="media-toolbar">
            <label>
              Buscar
              <input type="search" data-product-search placeholder="Nombre o código">
            </label>
          </div>
          <p class="muted" data-product-empty hidden></p>
          <div class="media-grid product-grid" data-product-grid></div>
        </div>
        <footer class="media-dialog__footer">
          <p data-product-selected-label>Ninguno seleccionado</p>
          <div class="admin-actions" style="margin:0">
            <button type="button" class="btn btn--outline" data-product-close>Cancelar</button>
            <button type="button" class="btn btn--gold" data-product-confirm disabled>Añadir</button>
          </div>
        </footer>
      </div>
    `;
    document.body.appendChild(modal);
  }

  if (!ready) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeProductModal();
    });
    modal.querySelectorAll('[data-product-close]').forEach((btn) => {
      btn.addEventListener('click', () => closeProductModal());
    });
    modal.querySelector('[data-product-search]')?.addEventListener('input', () => renderGrid());
    modal.querySelector('[data-product-grid]')?.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-product-codigo]');
      if (!button || !state) return;
      state.selected = button.dataset.productCodigo ?? '';
      renderGrid();
    });
    modal.querySelector('[data-product-grid]')?.addEventListener('dblclick', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-product-codigo]');
      if (!button || !state) return;
      state.selected = button.dataset.productCodigo ?? '';
      confirmSelection();
    });
    modal.querySelector('[data-product-confirm]')?.addEventListener('click', () => confirmSelection());
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modalEl()?.classList.contains('is-open')) closeProductModal();
    });
    ready = true;
  }

  return modal;
}

export function openProductPicker(options: {
  title?: string;
  confirmLabel?: string;
  products: PickerProduct[];
  onSelect: (codigo: string) => void;
}) {
  const modal = ensureModal();
  state = {
    products: options.products,
    selected: '',
    onSelect: options.onSelect,
  };
  const title = modal.querySelector('[data-product-title]');
  const confirm = modal.querySelector('[data-product-confirm]');
  const search = modal.querySelector<HTMLInputElement>('[data-product-search]');
  if (title) title.textContent = options.title ?? 'Elegir producto';
  if (confirm) confirm.textContent = options.confirmLabel ?? 'Añadir';
  if (search) search.value = '';
  renderGrid();
  modal.classList.add('is-open');
  search?.focus();
}
