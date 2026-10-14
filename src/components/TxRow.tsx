import type { Transaction } from '../types';
import { categoryById } from '../data';
import { fmt, fmtDate } from '../utils';
import { IconTrash } from './Icons';

interface Props {
  tx: Transaction;
  showDate?: boolean;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TxRow({ tx, showDate = false, onEdit, onDelete }: Props) {
  const cat = categoryById(tx.category);
  return (
    <div className="tx-row" onClick={() => onEdit?.(tx)} role={onEdit ? 'button' : undefined}>
      <div className="tx-icon" style={{ background: `${cat.color}1f`, color: cat.color }}>
        {cat.emoji}
      </div>
      <div className="tx-info">
        <span className="tx-note">{tx.note || cat.label}</span>
        <span className="tx-cat">
          {cat.label}
          {showDate ? ` · ${fmtDate(tx.date)}` : ''}
        </span>
      </div>
      <span className={`tx-amt ${tx.type}`}>
        {tx.type === 'income' ? '+' : '−'}
        {fmt(tx.amount)}
      </span>
      {onDelete && (
        <button
          className="icon-btn danger tx-delete"
          title="Eliminar movimiento"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(tx.id);
          }}
        >
          <IconTrash width={16} height={16} />
        </button>
      )}
    </div>
  );
}
