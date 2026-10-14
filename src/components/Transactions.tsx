import { useMemo, useState } from 'react';
import type { Transaction } from '../types';
import { useStore } from '../store';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data';
import { fmt, fmtDayGroup } from '../utils';
import { TxRow } from './TxRow';

type TypeFilter = 'all' | 'income' | 'expense';

export function Transactions({ onEdit }: { onEdit: (t: Transaction) => void }) {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return state.transactions
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (catFilter !== 'all' && t.category !== catFilter) return false;
        if (query && !`${t.note} ${t.category}`.toLowerCase().includes(query)) return false;
        return true;
      })
      .sort((a, b) => b.t.date.localeCompare(a.t.date) || b.i - a.i)
      .map((x) => x.t);
  }, [state.transactions, q, typeFilter, catFilter]);

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const arr = map.get(t.date) ?? [];
      arr.push(t);
      map.set(t.date, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  const totalIn = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page">
      {/* Filtros */}
      <div className="filters card">
        <input
          className="search"
          type="search"
          placeholder="🔍 Buscar por nota o categoría…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}>
          <option value="all">Ingresos y gastos</option>
          <option value="income">Solo ingresos</option>
          <option value="expense">Solo gastos</option>
        </select>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">Todas las categorías</option>
          <optgroup label="Gastos">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Ingresos">
            {INCOME_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Resumen del filtro */}
      <div className="chips">
        <span className="chip">
          {filtered.length} movimiento{filtered.length === 1 ? '' : 's'}
        </span>
        <span className="chip income">Ingresos: +{fmt(totalIn)}</span>
        <span className="chip expense">Gastos: −{fmt(totalOut)}</span>
        <span className={`chip ${totalIn - totalOut >= 0 ? 'income' : 'expense'}`}>
          Neto: {totalIn - totalOut >= 0 ? '+' : '−'}
          {fmt(Math.abs(totalIn - totalOut))}
        </span>
      </div>

      {/* Lista agrupada por día */}
      {groups.length === 0 ? (
        <div className="card">
          <p className="empty">Ningún movimiento coincide con los filtros.</p>
        </div>
      ) : (
        groups.map(([date, txs]) => {
          const dayNet = txs.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
          return (
            <div className="tx-group card" key={date}>
              <div className="tx-group-head">
                <span>{fmtDayGroup(date)}</span>
                <span className={dayNet >= 0 ? 'income-text' : 'expense-text'}>
                  {dayNet >= 0 ? '+' : '−'}
                  {fmt(Math.abs(dayNet))}
                </span>
              </div>
              <div className="tx-list">
                {txs.map((t) => (
                  <TxRow
                    key={t.id}
                    tx={t}
                    onEdit={onEdit}
                    onDelete={(id) => dispatch({ type: 'DELETE_TX', id })}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
