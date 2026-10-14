import { fmt } from '../utils';

export interface Slice {
  label: string;
  value: number;
  color: string;
  emoji: string;
}

export interface FlowPoint {
  label: string;
  income: number;
  expense: number;
}

/** Gráfico de donut con el total en el centro */
export function DonutChart({ data, size = 190, thickness = 22 }: { data: Slice[]; size?: number; thickness?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1b2530" strokeWidth={thickness} />
      {total > 0 &&
        data
          .filter((d) => d.value > 0)
          .map((d) => {
            const frac = d.value / total;
            const dash = Math.max(frac * c - 1.5, 0.5);
            const offset = acc;
            acc += frac * c;
            return (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              >
                <title>{`${d.emoji} ${d.label}: ${fmt(d.value)} (${(frac * 100).toFixed(1)}%)`}</title>
              </circle>
            );
          })}
      <text x="50%" y="47%" textAnchor="middle" className="donut-value">
        {fmt(total)}
      </text>
      <text x="50%" y="60%" textAnchor="middle" className="donut-caption">
        gastado
      </text>
    </svg>
  );
}

/** Barras agrupadas ingresos / gastos por mes */
export function FlowBars({ data }: { data: FlowPoint[] }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));
  return (
    <div className="flow">
      <div className="flow-bars">
        {data.map((d) => (
          <div className="flow-group" key={d.label}>
            <div className="flow-cols">
              <div
                className="flow-col in"
                style={{ height: `${Math.max((d.income / max) * 100, 1)}%` }}
                title={`Ingresos: ${fmt(d.income)}`}
              />
              <div
                className="flow-col out"
                style={{ height: `${Math.max((d.expense / max) * 100, 1)}%` }}
                title={`Gastos: ${fmt(d.expense)}`}
              />
            </div>
            <span className="flow-label">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span className="dot in" /> Ingresos
        <span className="dot out" /> Gastos
      </div>
    </div>
  );
}
