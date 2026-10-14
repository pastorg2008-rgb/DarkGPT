export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Cantidad siempre positiva (en euros) */
  amount: number;
  /** id de categoría (ver data.ts) */
  category: string;
  /** Fecha ISO 'YYYY-MM-DD' */
  date: string;
  note: string;
}

export interface Budget {
  /** id de categoría de gasto */
  category: string;
  /** Límite mensual en euros */
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  /** Objetivo en euros */
  target: number;
  /** Ahorrado hasta ahora */
  saved: number;
  /** Fecha límite opcional ISO 'YYYY-MM-DD' */
  deadline?: string;
}

export interface AppState {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
}
