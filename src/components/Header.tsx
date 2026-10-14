import { monthKey, monthLabel, shiftMonth } from '../utils';
import { IconChevronLeft, IconChevronRight, IconPlus } from './Icons';

interface Props {
  title: string;
  month: string;
  setMonth: (m: string) => void;
  onNew: () => void;
}

export function Header({ title, month, setMonth, onNew }: Props) {
  const isCurrentMonth = month >= monthKey(new Date());
  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <div className="header-right">
        <div className="month-nav">
          <button className="icon-btn" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mes anterior">
            <IconChevronLeft />
          </button>
          <span className="month-label">{monthLabel(month)}</span>
          <button
            className="icon-btn"
            onClick={() => setMonth(shiftMonth(month, 1))}
            disabled={isCurrentMonth}
            aria-label="Mes siguiente"
          >
            <IconChevronRight />
          </button>
        </div>
        <button className="btn btn-primary" onClick={onNew}>
          <IconPlus /> <span className="btn-label">Nuevo movimiento</span>
        </button>
      </div>
    </header>
  );
}
