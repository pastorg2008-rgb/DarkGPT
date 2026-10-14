import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { AppState, Budget, Goal, Transaction } from './types';
import { seedData } from './data';

export type Action =
  | { type: 'ADD_TX'; tx: Transaction }
  | { type: 'UPDATE_TX'; tx: Transaction }
  | { type: 'DELETE_TX'; id: string }
  | { type: 'SET_BUDGET'; budget: Budget }
  | { type: 'DELETE_BUDGET'; category: string }
  | { type: 'ADD_GOAL'; goal: Goal }
  | { type: 'UPDATE_GOAL'; goal: Goal }
  | { type: 'DELETE_GOAL'; id: string }
  | { type: 'REPLACE_ALL'; state: AppState };

const STORAGE_KEY = 'mis-finanzas-v1';

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TX':
      return { ...state, transactions: [...state.transactions, action.tx] };
    case 'UPDATE_TX':
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.tx.id ? action.tx : t)),
      };
    case 'DELETE_TX':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) };
    case 'SET_BUDGET': {
      const exists = state.budgets.some((b) => b.category === action.budget.category);
      const budgets =
        action.budget.limit <= 0
          ? state.budgets.filter((b) => b.category !== action.budget.category)
          : exists
            ? state.budgets.map((b) => (b.category === action.budget.category ? action.budget : b))
            : [...state.budgets, action.budget];
      return { ...state, budgets };
    }
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter((b) => b.category !== action.category) };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.goal] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map((g) => (g.id === action.goal.id ? action.goal : g)) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.id) };
    case 'REPLACE_ALL':
      return action.state;
  }
}

function loadInitial(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions)) {
        return {
          transactions: parsed.transactions,
          budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
          goals: Array.isArray(parsed.goals) ? parsed.goals : [],
        };
      }
    }
  } catch {
    /* datos corruptos -> reiniciamos */
  }
  return seedData();
}

const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(loadInitial, []);
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* almacenamiento lleno o no disponible */
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}
