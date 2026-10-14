import type { AppState, Transaction, TransactionType } from './types';
import { uid } from './utils';

export interface Category {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'vivienda', label: 'Vivienda', emoji: '🏠', color: '#a78bfa' },
  { id: 'alimentacion', label: 'Alimentación', emoji: '🛒', color: '#fbbf24' },
  { id: 'restaurantes', label: 'Restaurantes', emoji: '🍽️', color: '#fb923c' },
  { id: 'transporte', label: 'Transporte', emoji: '🚗', color: '#60a5fa' },
  { id: 'ocio', label: 'Ocio', emoji: '🎮', color: '#f472b6' },
  { id: 'salud', label: 'Salud', emoji: '💊', color: '#34d399' },
  { id: 'suscripciones', label: 'Suscripciones', emoji: '📱', color: '#818cf8' },
  { id: 'compras', label: 'Compras', emoji: '🛍️', color: '#2dd4bf' },
  { id: 'educacion', label: 'Educación', emoji: '📚', color: '#facc15' },
  { id: 'otros', label: 'Otros', emoji: '📦', color: '#94a3b8' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salario', label: 'Salario', emoji: '💼', color: '#4ade80' },
  { id: 'freelance', label: 'Freelance', emoji: '💻', color: '#34d399' },
  { id: 'inversiones', label: 'Inversiones', emoji: '📈', color: '#a3e635' },
  { id: 'regalos', label: 'Regalos', emoji: '🎁', color: '#fbbf24' },
  { id: 'otros-ing', label: 'Otros ingresos', emoji: '➕', color: '#94a3b8' },
];

export function categoryOf(type: TransactionType): Category[] {
  return type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}

export function categoryById(id: string): Category {
  return (
    [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find((c) => c.id === id) ?? {
      id,
      label: 'Otros',
      emoji: '📦',
      color: '#94a3b8',
    }
  );
}

/* ------------------------------------------------------------------ */
/* Datos de ejemplo (deterministas) de los últimos 6 meses            */
/* ------------------------------------------------------------------ */

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export function seedData(): AppState {
  const rnd = mulberry32(20261014);
  const between = (a: number, b: number) => a + rnd() * (b - a);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
  const transactions: Transaction[] = [];
  const now = new Date();

  for (let back = 5; back >= 0; back--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const y = ref.getFullYear();
    const m = ref.getMonth() + 1;
    const daysInMonth = new Date(y, m, 0).getDate();
    // En el mes en curso solo generamos hasta el día de hoy
    const maxDay = back === 0 ? now.getDate() : daysInMonth;

    const add = (dayNum: number, type: TransactionType, amount: number, category: string, note: string) => {
      if (dayNum > maxDay) return;
      transactions.push({
        id: uid(),
        type,
        amount: Math.round(amount * 100) / 100,
        category,
        date: iso(y, m, Math.min(dayNum, daysInMonth)),
        note,
      });
    };
    const randDay = () => 1 + Math.floor(rnd() * maxDay);

    // Ingresos
    add(1, 'income', 2450, 'salario', 'Nómina mensual');
    if (rnd() < 0.55)
      add(4 + Math.floor(rnd() * 20), 'income', between(180, 650), 'freelance',
        pick(['Proyecto web', 'Consultoría SEO', 'Diseño de logo', 'App para cliente']));
    if (rnd() < 0.25) add(15, 'income', between(30, 140), 'inversiones', 'Dividendos ETF');

    // Gastos fijos
    add(2, 'expense', 850, 'vivienda', 'Alquiler');
    add(8, 'expense', between(40, 95), 'vivienda', 'Luz y agua');
    add(10, 'expense', 39.99, 'vivienda', 'Internet fibra');
    add(1, 'expense', 29.9, 'suscripciones', 'Gimnasio');
    add(5, 'expense', 12.99, 'suscripciones', 'Netflix');
    add(12, 'expense', 10.99, 'suscripciones', 'Spotify');
    add(18, 'expense', 2.99, 'suscripciones', 'iCloud');

    // Gastos variables
    const nMercado = 5 + Math.floor(rnd() * 3);
    for (let i = 0; i < nMercado; i++)
      add(randDay(), 'expense', between(18, 85), 'alimentacion',
        pick(['Mercadona', 'Carrefour', 'Frutería', 'Mercado local', 'Panadería']));
    const nRest = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < nRest; i++)
      add(randDay(), 'expense', between(12, 58), 'restaurantes',
        pick(['Cena con amigos', 'Menú del día', 'Brunch', 'Pizza', 'Sushi']));
    const nTr = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < nTr; i++)
      add(randDay(), 'expense', between(5, 45), 'transporte',
        pick(['Recarga metro', 'Gasolina', 'Cabify', 'Parking']));
    const nOcio = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < nOcio; i++)
      add(randDay(), 'expense', between(9, 70), 'ocio',
        pick(['Cine', 'Concierto', 'Videojuego', 'Escape room', 'Museo']));
    if (rnd() < 0.35) add(randDay(), 'expense', between(15, 60), 'salud', pick(['Farmacia', 'Dentista', 'Óptica']));
    if (rnd() < 0.45) add(randDay(), 'expense', between(20, 120), 'compras', pick(['Ropa', 'Amazon', 'Zapatillas', 'Hogar']));
    if (rnd() < 0.25) add(randDay(), 'expense', between(19, 49), 'educacion', pick(['Curso online', 'Libros']));
  }

  transactions.sort((a, b) => a.date.localeCompare(b.date));

  return {
    transactions,
    budgets: [
      { category: 'vivienda', limit: 950 },
      { category: 'alimentacion', limit: 350 },
      { category: 'restaurantes', limit: 160 },
      { category: 'transporte', limit: 120 },
      { category: 'ocio', limit: 150 },
      { category: 'suscripciones', limit: 70 },
      { category: 'compras', limit: 200 },
    ],
    goals: [
      { id: uid(), name: 'Fondo de emergencia', emoji: '🛡️', target: 10000, saved: 6200 },
      { id: uid(), name: 'Viaje a Japón', emoji: '✈️', target: 3000, saved: 1150, deadline: iso(now.getFullYear() + 1, 4, 1) },
      { id: uid(), name: 'Portátil nuevo', emoji: '💻', target: 1600, saved: 420 },
    ],
  };
}
