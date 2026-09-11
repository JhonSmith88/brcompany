export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function showToast(message: string, type: 'ok' | 'err' = 'ok'): void {
  const host = document.querySelector<HTMLElement>('[data-admin-toast]');
  if (!host) {
    if (type === 'err') console.error(message);
    else console.log(message);
    return;
  }
  host.textContent = message;
  host.dataset.state = type;
  host.hidden = false;
  host.classList.add('is-visible');
  window.clearTimeout(host.dataset.t ? Number(host.dataset.t) : 0);
  const timer = window.setTimeout(() => {
    host.classList.remove('is-visible');
    host.hidden = true;
  }, 3200);
  host.dataset.t = String(timer);
}
