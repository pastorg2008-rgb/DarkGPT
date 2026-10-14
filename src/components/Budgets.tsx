import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { categoryById, EXPENSE_CATEGORIES } from '../data';
import { fmt, monthLabel, parseAmount } from '../utils';
import { IconTrash } from './Icons';

function BudgetRow({ category, limit, spent }: { category: string; limit: number; spent: number }) {
  const { dispatch } = useStore();
  const cat = categoryById(category);
  const [value, setValue] = useState(String(limit).replace('.', ','));

  useEffect(() => {
    setValue(String(limit).replace('.', ','));
  }, [limit]);

  const commit = () => {
    const n = parseAmount(value);
    if (n > 0 && n !== limit) dispatch({ type: 'SET_BUDGET', budget: { category, limit: n } });
    else setValue(String(limit).replace('.', ','));
  };

  const pct = limit > 0 ? spent / limit : 0;
  const cls = pct >= 1 ? 'over' : pct >= 0.8 ? 'warn' : 'ok';
  const remaining = limit - spent;

  return (
    <div className="budget-row">
      <div className="budget-row-main">
        <div className="tx-icon" style={{ background: `${cat.color}1f`, color: cat.color }}>
          {cat.emoji}
        </div>
        <div className="budget-row-info">
          <div className="budget-row-head">
            <strong>{cat.label}</strong>
            <span className="budget-row-amounts">
              <b>{fmt(spent)}</b> de{' '}
              <input
                className="limit-input"
                value={value}
                inputMode="decimal"
                onChange={(e) => setValue(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                title="Límite mensual — edítalo y pulsa Enter"
              />{' '}
              €
            </span>
          </div>
          <div className="bar">
            <div className={`bar-fill ${cls}`} style={{ width: `${Math.min(pct * 100, 100)}%` }} />
          </div>
          <span className={`budget-remaining ${cls}`}>
            {pct >= 1
              ? `Te has pasado ${fmt(Math.abs(remaining))} (${((pct - 1) * 100).toFixed(0)}% de más)`
              : `Te quedan ${fmt(remaining)} · ${(pct * 100).toFixed(0)}% usado`}
          </span>
        </div>
        <button
          className="icon-btn danger"
          title="Eliminar presupuesto"
          onClick={() => dispatch({ type: 'DELETE_BUDGET', category })}
        >
          <IconTrash width={16} height={16} />
        </button>
      </div>
    </div>
  );
}

export function Budgets({ month }: { month: string }) {
  const { state, dispatch } = useStore();
  const [newCat, setNewCat] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const spentByCat = new Map<string, number>();
  for (const t of state.transactions) {
    if (t.type === 'expense' && t.date.startsWith(month)) {
      spentByCat.set(t.category, (spentByCat.get(t.category) ?? 0) + t.amount);
    }
  }

  const available = EXPENSE_CATEGORIES.filter((c) => !state.budgets.some((b) => b.category === c.id));

  const totalLimit = state.budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = state.budgets.reduce((s, b) => s + (spentByCat.get(b.category) ?? 0), 0);
  const totalPct = totalLimit > 0 ? totalSpent / totalLimit : 0;

  const addBudget = () => {
    const n = parseAmount(newLimit);
    if (!newCat || n <= 0) return;
    dispatch({ type: 'SET_BUDGET', budget: { category: newCat, limit: n } });
    setNewCat('');
    setNewLimit('');
  };

  return (
    <div className="page narrow">
      {/* Resumen global */}
      <div className="card budget-summary">
        <div className="card-head">
          <h3>Presupuesto total</h3>
          <span className="card-sub">{monthLabel(month).toLowerCase()}</span>
        </div>
        {totalLimit === 0 ? (
          <p className="empty">Aún no has definido presupuestos.</p>
        ) : (
          <>
            <div className="budget-summary-nums">
              <span>
                <b>{fmt(totalSpent)}</b> gastados de {fmt(totalLimit)}
              </span>
              <span className={`delta ${totalPct >= 1 ? 'bad' : totalPct >= 0.8 ? 'na' : 'good'}`}>
                {(totalPct * 100).toFixed(0)}%
              </span>
            </div>
            <div className="bar big">
              <div
                className={`bar-fill ${totalPct >= 1 ? 'over' : totalPct >= 0.8 ? 'warn' : 'ok'}`}
                style={{ width: `${Math.min(totalPct * 100, 100)}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Nuevo presupuesto */}
      <div className="card">
        <div className="card-head">
          <h3>Nuevo presupuesto</h3>
        </div>
        {available.length === 0 ? (
          <p className="empty">Todas las categorías ya tienen presupuesto.</p>
        ) : (
          <div className="add-budget">
            <select value={newCat} onChange={(e) => setNewCat(e.target.value)}>
              <option value="">Elige categoría…</option>
              {available.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
            <input
              placeholder="Límite mensual (€)"
              inputMode="decimal"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addBudget()}
            />
            <button className="btn btn-primary" onClick={addBudget} disabled={!newCat || parseAmount(newLimit) <= 0}>
              Añadir
            </button>
          </div>
        )}
      </div>

      {/* Lista */}
      {state.budgets.length > 0 && (
        <div className="card">
          <div className="card-head">
            <h3>Por categoría</h3>
            <span className="card-sub">pulsa sobre el límite para editarlo</span>
          </div>
          <div>
            {[...state.budgets]
              .sort((a, b) => (spentByCat.get(b.category) ?? 0) / b.limit - (spentByCat.get(a.category) ?? 0) / a.limit)
              .map((b) => (
                <BudgetRow key={b.category} category={b.category} limit={b.limit} spent={spentByCat.get(b.category) ?? 0} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
