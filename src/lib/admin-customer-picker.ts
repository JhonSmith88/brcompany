import { escapeHtml } from './media/ui';

export type PickerCustomer = {
  id: string;
  name: string;
  phone: string;
};

type PickerState = {
  customers: PickerCustomer[];
  selected: string;
  onSelect: (id: string) => void;
};

let state: PickerState | null = null;
let ready = false;

function modalEl() {
  return document.querySelector<HTMLElement>('[data-customer-modal]');
}

function selectedLabel(customers: PickerCustomer[], id: string) {
  const row = customers.find((item) => item.id === id);
  return row ? row.name : 'Ninguno seleccionado';
}

function renderList() {
  const modal = modalEl();
  if (!modal || !state) return;
  const query = (modal.querySelector<HTMLInputElement>('[data-customer-search]')?.value ?? '')
    .trim()
    .toLowerCase();
  const list = state.customers.filter((row) => {
    if (!query) return true;
    return row.name.toLowerCase().includes(query) || row.phone.toLowerCase().includes(query);
  });
  const grid = modal.querySelector('[data-customer-grid]');
  const empty = modal.querySelector<HTMLElement>('[data-customer-empty]');
  const confirm = modal.querySelector<HTMLButtonElement>('[data-customer-confirm]');
  const label = modal.querySelector('[data-customer-selected-label]');
  if (grid) {
    grid.innerHTML = list
      .map((row) => {
        const selected = row.id === state?.selected;
        return `
          <button type="button" class="product-item" data-customer-id="${escapeHtml(row.id)}" data-selected="${selected}">
            <span>
              <strong>${escapeHtml(row.name)}</strong>
              <small>${escapeHtml(row.phone || 'Sin WhatsApp')}</small>
            </span>
          </button>
        `;
      })
      .join('');
  }
  if (empty) {
    empty.hidden = list.length > 0;
    empty.textContent = state.customers.length
      ? 'No hay clientes con esa búsqueda.'
      : 'Aún no hay clientes.';
  }
  if (label) label.textContent = selectedLabel(state.customers, state.selected);
  if (confirm) confirm.disabled = !state.selected;
}

function closeCustomerModal() {
  modalEl()?.classList.remove('is-open');
  state = null;
}

function confirmSelection() {
  if (!state?.selected) return;
  const pick = state.selected;
  const onSelect = state.onSelect;
  closeCustomerModal();
  onSelect(pick);
}

function ensureModal() {
  let modal = modalEl();
  if (modal && ready) return modal;

  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'media-modal';
    modal.dataset.customerModal = '';
    modal.innerHTML = `
      <div class="media-dialog" role="dialog" aria-modal="true" aria-label="Elegir cliente">
        <header class="media-dialog__header">
          <div>
            <p class="media-dialog__eyebrow">Agenda</p>
            <h2>Elegir cliente</h2>
          </div>
          <button type="button" class="btn btn--outline" data-customer-close aria-label="Cerrar">Cerrar</button>
        </header>
        <div class="media-dialog__body">
          <div class="media-toolbar">
            <label>
              Buscar
              <input type="search" data-customer-search placeholder="Nombre o WhatsApp">
            </label>
          </div>
          <p class="muted" data-customer-empty hidden></p>
          <div class="media-grid product-grid" data-customer-grid></div>
        </div>
        <footer class="media-dialog__footer">
          <p data-customer-selected-label>Ninguno seleccionado</p>
          <div class="admin-actions" style="margin:0">
            <button type="button" class="btn btn--outline" data-customer-close>Cancelar</button>
            <button type="button" class="btn btn--gold" data-customer-confirm disabled>Usar cliente</button>
          </div>
        </footer>
      </div>
    `;
    document.body.appendChild(modal);
  }

  if (!ready) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeCustomerModal();
    });
    modal.querySelectorAll('[data-customer-close]').forEach((btn) => {
      btn.addEventListener('click', () => closeCustomerModal());
    });
    modal.querySelector('[data-customer-search]')?.addEventListener('input', () => renderList());
    modal.querySelector('[data-customer-grid]')?.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-customer-id]');
      if (!button || !state) return;
      state.selected = button.dataset.customerId ?? '';
      renderList();
    });
    modal.querySelector('[data-customer-grid]')?.addEventListener('dblclick', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-customer-id]');
      if (!button || !state) return;
      state.selected = button.dataset.customerId ?? '';
      confirmSelection();
    });
    modal.querySelector('[data-customer-confirm]')?.addEventListener('click', () => confirmSelection());
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modalEl()?.classList.contains('is-open')) closeCustomerModal();
    });
    ready = true;
  }

  return modal;
}

export function openCustomerPicker(options: {
  customers: PickerCustomer[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  const modal = ensureModal();
  state = {
    customers: options.customers,
    selected: options.selected ?? '',
    onSelect: options.onSelect,
  };
  const search = modal.querySelector<HTMLInputElement>('[data-customer-search]');
  if (search) search.value = '';
  renderList();
  modal.classList.add('is-open');
  search?.focus();
}
