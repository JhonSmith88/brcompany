import type { SupabaseClient } from '@supabase/supabase-js';
import { buildWhatsAppUrl } from '../data/site';

export const saleStatuses = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'cancelado', label: 'Cancelado' },
] as const;

export const paymentMethods = [
  { value: '', label: 'Sin indicar' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'deposito', label: 'Depósito' },
] as const;

export const shippingOptions = [
  { value: '', label: 'Sin indicar' },
  { value: 'retiro', label: 'Retiro' },
  { value: 'envio', label: 'Envío' },
] as const;

export type SaleStatus = (typeof saleStatuses)[number]['value'];

export type SaleItemInput = {
  product_codigo: string;
  qty: number;
  unit_price: number;
  product_nombre: string;
};

export function saleStatusLabel(status: string) {
  return saleStatuses.find((item) => item.value === status)?.label ?? status;
}

export function saleTotal(items: { qty: number; unit_price: number }[]) {
  return items.reduce((sum, item) => sum + item.qty * item.unit_price, 0);
}

export function sanitizePhone(value: string) {
  return value.replace(/[^\d+]/g, '').trim();
}

export function paymentLabel(method: string) {
  return paymentMethods.find((item) => item.value === method)?.label ?? method;
}

export function shippingLabel(value: string) {
  return shippingOptions.find((item) => item.value === value)?.label ?? value;
}

export function paymentState(amountPaid: number, total: number) {
  if (total <= 0) return amountPaid > 0 ? 'pagado' : 'por cobrar';
  if (amountPaid <= 0) return 'por cobrar';
  if (amountPaid >= total) return 'pagado';
  return 'seña';
}

export function paymentStateLabel(amountPaid: number, total: number) {
  const state = paymentState(amountPaid, total);
  if (state === 'pagado') return 'Pagado';
  if (state === 'seña') return 'Seña';
  return 'Por cobrar';
}

export function customerWhatsAppUrl(phone: string, message = '') {
  const number = sanitizePhone(phone).replace(/^\+/, '');
  if (!number) return '';
  return buildWhatsAppUrl(message || 'Hola, te escribo desde RBCompany.', number);
}

export function startOfWeek(now = new Date()) {
  const date = new Date(now);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + diff);
  return date;
}

export function startOfMonth(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function toDateInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function paymentStateClass(amountPaid: number, total: number) {
  const state = paymentState(amountPaid, total);
  if (state === 'pagado') return 'pagado';
  if (state === 'seña') return 'sena';
  return 'cobrar';
}

export function uniquePhoneMessage(error: { message?: string; code?: string } | null | undefined) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`;
  if (text.includes('23505') || text.includes('customers_phone_unique')) {
    return 'Ese WhatsApp ya pertenece a otro cliente.';
  }
  return '';
}

export function saleInPeriod(createdAt: string, period: string, from = '', to = '') {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return false;
  if (period === 'semana') return date >= startOfWeek();
  if (period === 'mes') return date >= startOfMonth();
  if (period === 'rango') {
    if (from) {
      const start = new Date(`${from}T00:00:00`);
      if (date < start) return false;
    }
    if (to) {
      const end = new Date(`${to}T23:59:59.999`);
      if (date > end) return false;
    }
  }
  return true;
}

export function writeFilterUrl(keys: string[], values: Record<string, string>) {
  const url = new URL(window.location.href);
  for (const key of keys) {
    const value = values[key]?.trim() ?? '';
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

export async function findCustomerByPhone(supabase: SupabaseClient, phone: string) {
  const clean = sanitizePhone(phone);
  if (!clean) return null;
  const digits = clean.replace(/^\+/, '');
  const variants = [...new Set([clean, digits, `+${digits}`])];
  const { data, error } = await supabase.from('customers').select('id, name, phone').in('phone', variants).limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function reuseOrCreateCustomer(
  supabase: SupabaseClient,
  input: { name: string; phone: string },
) {
  const name = input.name.trim();
  const phone = sanitizePhone(input.phone);
  if (!name) throw new Error('Elige un cliente o escribe el nombre del nuevo.');
  if (phone) {
    const existing = await findCustomerByPhone(supabase, phone);
    if (existing) return existing.id;
  }
  const { data, error } = await supabase.from('customers').insert({ name, phone }).select('id').single();
  if (error) {
    const unique = uniquePhoneMessage(error);
    if (unique && phone) {
      const existing = await findCustomerByPhone(supabase, phone);
      if (existing) return existing.id;
      throw new Error(unique);
    }
    throw new Error(error.message);
  }
  return data.id as string;
}

async function changeStock(supabase: SupabaseClient, codigo: string, delta: number) {
  if (!delta) return;
  const { data, error } = await supabase.from('products').select('stock').eq('codigo', codigo).maybeSingle();
  if (error || !data) throw new Error(error?.message ?? `No se pudo leer el stock de ${codigo}.`);
  const next = Math.max(0, Number(data.stock ?? 0) + delta);
  const { error: updateError } = await supabase.from('products').update({ stock: next }).eq('codigo', codigo);
  if (updateError) throw updateError;
}

export async function syncSaleStock(
  supabase: SupabaseClient,
  previous: { stock_applied: boolean; items: SaleItemInput[] },
  next: { status: SaleStatus; items: SaleItemInput[] },
) {
  const shouldApply = next.status === 'vendido';
  if (previous.stock_applied) {
    for (const item of previous.items) {
      await changeStock(supabase, item.product_codigo, item.qty);
    }
  }
  if (shouldApply) {
    for (const item of next.items) {
      await changeStock(supabase, item.product_codigo, -item.qty);
    }
  }
  return shouldApply;
}
