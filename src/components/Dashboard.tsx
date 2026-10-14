import type { Transaction } from '../types';
import { useStore } from '../store';
import { categoryById } from '../data';
import { fmt, monthLabel, monthShort, shiftMonth } from '../utils';
import { DonutChart, FlowBars, type FlowPoint, type Slice } from './Charts';
import { TxRow } from './TxRow';
import { IconBank, IconTrendDown, IconTrendUp, IconWallet } from './Icons';

function Delta({ curr, prev, invert = false }: { curr: number; prev: number; invert?: boolean }) {
  if (prev <= 0) return <span className="delta na">—</span>;
  const change = (curr - prev) / prev;
  const good = invert ? change <= 0 : change >= 0;
  return (
    <span className={`delta ${good ? 'good' : 'bad'}`} title="Comparado con el mes anterior">
      {change >= 0 ? '▲' : '▼'} {Math.abs(change * 100).toFixed(0)}%
    </span>
  );
}

export function Dashboard({ month, onEdit }: { month: string; onEdit: (t: Transaction) => void }) {
  const { state, dispatch } = useStore();

  const monthTx = state.transactions.filter((t) => t.date.startsWith(month));
  const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const saved = income - expense;
  const rate = income > 0 ? Math.max(0, (saved / income) * 100) : 0;

  const prevKey = shiftMonth(month, -1);
  const prevTx = state.transactions.filter((t) => t.date.startsWith(prevKey));
  const prevIncome = prevTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const balance = state.transactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);

  // Flujo de caja de los últimos 6 meses
  const flow: FlowPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const key = shiftMonth(month, -i);
    let inc = 0;
    let exp = 0;
    for (const t of state.transactions) {
      if (t.date.startsWith(key)) {
        if (t.type === 'income') inc += t.amount;
        else exp += t.amount;
      }
    }
    flow.push({ label: monthShort(key), income: inc, expense: exp });
  }

  // Gastos del mes por categoría
  const byCat = new Map<string, number>();
  for (const t of monthTx) {
    if (t.type === 'expense') byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount);
  }
  const slices: Slice[] = [...byCat.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, value]) => ({ ...categoryById(id), value }));

  // Últimos movimientos
  const recent = state.transactions
    .map((t, i) => ({ t, i }))
    .sort((a, b) => b.t.date.localeCompare(a.t.date) || b.i - a.i)
    .slice(0, 8)
    .map((x) => x.t);

  // Presupuestos del mes seleccionado, ordenados por uso
  const budgetUsage = state.budgets
    .map((b) => ({
      ...b,
      spent: byCat.get(b.category) ?? 0,
    }))
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit)
    .slice(0, 5);

  return (
    <div className="page">
      {/* Tarjetas resumen */}
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-icon" style={{ background: 'rgba(52,211,153,.12)', color: '#34d399' }}>
              <IconWallet />
            </span>
          </div>
          <div className="stat-value">{fmt(balance)}</div>
          <div className="stat-label">Balance total</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-icon" style={{ background: 'rgba(74,222,128,.12)', color: '#4ade80' }}>
              <IconTrendUp />
            </span>
            <Delta curr={income} prev={prevIncome} />
          </div>
          <div className="stat-value income">{fmt(income)}</div>
          <div className="stat-label">Ingresos · {monthLabel(month).toLowerCase()}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-icon" style={{ background: 'rgba(248,113,113,.12)', color: '#f87171' }}>
              <IconTrendDown />
            </span>
            <Delta curr={expense} prev={prevExpense} invert />
          </div>
          <div className="stat-value expense">{fmt(expense)}</div>
          <div className="stat-label">Gastos · {monthLabel(month).toLowerCase()}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-icon" style={{ background: 'rgba(163,230,53,.12)', color: '#a3e635' }}>
              <IconBank />
            </span>
            <span className="delta good">{rate.toFixed(0)}% tasa</span>
          </div>
          <div className={`stat-value ${saved >= 0 ? 'income' : 'expense'}`}>{fmt(saved)}</div>
          <div className="stat-label">Ahorro del mes</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="dash-grid">
        <div className="card span7">
          <div className="card-head">
            <h3>Flujo de caja</h3>
            <span className="card-sub">últimos 6 meses</span>
          </div>
          <FlowBars data={flow} />
        </div>

        <div className="card span5">
          <div className="card-head">
            <h3>Gastos por categoría</h3>
            <span className="card-sub">{monthLabel(month).toLowerCase()}</span>
          </div>
          {slices.length === 0 ? (
            <p className="empty">No hay gastos registrados este mes.</p>
          ) : (
            <div className="donut-layout">
              <DonutChart data={slices} />
              <ul className="legend">
                {slices.slice(0, 6).map((s) => (
                  <li key={s.label}>
                    <span className="legend-dot" style={{ background: s.color }} />
                    <span className="legend-label">
                      {s.emoji} {s.label}
                    </span>
                    <span className="legend-value">{fmt(s.value)}</span>
                    <span className="legend-pct">{((s.value / expense) * 100).toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Movimientos recientes */}
        <div className="card span7">
          <div className="card-head">
            <h3>Movimientos recientes</h3>
          </div>
          {recent.length === 0 ? (
            <p className="empty">Aún no hay movimientos. Añade el primero con «Nuevo movimiento».</p>
          ) : (
            <div className="tx-list">
              {recent.map((t) => (
                <TxRow
                  key={t.id}
                  tx={t}
                  showDate
                  onEdit={onEdit}
                  onDelete={(id) => dispatch({ type: 'DELETE_TX', id })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Presupuestos */}
        <div className="card span5">
          <div className="card-head">
            <h3>Presupuestos</h3>
            <span className="card-sub">{monthLabel(month).toLowerCase()}</span>
          </div>
          {budgetUsage.length === 0 ? (
            <p className="empty">Sin presupuestos. Créalos en la sección «Presupuestos».</p>
          ) : (
            <div className="budget-mini">
              {budgetUsage.map((b) => {
                const cat = categoryById(b.category);
                const pct = b.limit > 0 ? b.spent / b.limit : 0;
                const cls = pct >= 1 ? 'over' : pct >= 0.8 ? 'warn' : 'ok';
                return (
                  <div className="budget-mini-row" key={b.category}>
                    <div className="budget-mini-head">
                      <span>
                        {cat.emoji} {cat.label}
                      </span>
                      <span className="budget-mini-amounts">
                        {fmt(b.spent)} / {fmt(b.limit)}
                      </span>
                    </div>
                    <div className="bar">
                      <div className={`bar-fill ${cls}`} style={{ width: `${Math.min(pct * 100, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
