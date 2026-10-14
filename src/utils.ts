/** Formatea un número como euros (es-ES): 1.234,56 € */
export const fmt = (n: number): string =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

/** Clave de mes 'YYYY-MM' a partir de una fecha */
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Desplaza una clave 'YYYY-MM' n meses */
export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

/** 'octubre de 2026' */
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** 'oct' */
export function monthShort(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
}

/** '14 oct 2026' */
export function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** 'Hoy' / 'Ayer' / 'martes, 14 de octubre' */
export function fmtDayGroup(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function todayISO(): string {
  const d = new Date();
  return `${monthKey(d)}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Acepta '12,50' o '12.50' y devuelve número redondeado a céntimos */
export function parseAmount(v: string): number {
  const n = parseFloat(v.replace(/\s/g, '').replace(',', '.'));
  return Number.isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

/** Meses completos (mínimo 1) entre dos fechas ISO — para calcular ahorro mensual necesario */
export function monthsBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + 'T00:00:00');
  const b = new Date(toISO + 'T00:00:00');
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() > a.getDate()) months += 1;
  return Math.max(1, months);
}

export function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
