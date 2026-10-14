import { useEffect, useState, type FormEvent } from 'react';
import type { Transaction, TransactionType } from '../types';
import { categoryOf, EXPENSE_CATEGORIES } from '../data';
import { parseAmount, todayISO, uid } from '../utils';
import { useStore } from '../store';
import { IconX } from './Icons';

interface Props {
  open: boolean;
  /** Si se pasa, estamos editando; si es null, es un alta */
  initial: Transaction | null;
  onClose: () => void;
}

export function TransactionModal({ open, initial, onClose }: Props) {
  const { dispatch } = useStore();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0].id);
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setType(initial.type);
      setAmount(String(initial.amount).replace('.', ','));
      setCategory(initial.category);
      setDate(initial.date);
      setNote(initial.note);
    } else {
      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].id);
      setDate(todayISO());
      setNote('');
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const cats = categoryOf(type);
  const valid = parseAmount(amount) > 0 && date.length === 10;

  const switchType = (t: TransactionType) => {
    setType(t);
    setCategory(categoryOf(t)[0].id);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const tx: Transaction = {
      id: initial?.id ?? uid(),
      type,
      amount: parseAmount(amount),
      category,
      date,
      note: note.trim(),
    };
    dispatch(initial ? { type: 'UPDATE_TX', tx } : { type: 'ADD_TX', tx });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{initial ? 'Editar movimiento' : 'Nuevo movimiento'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <IconX />
          </button>
        </div>
        <form className="modal-body" onSubmit={save}>
          <div className="seg">
            <button
              type="button"
              className={`seg-btn expense ${type === 'expense' ? 'active' : ''}`}
              onClick={() => switchType('expense')}
            >
              ↙ Gasto
            </button>
            <button
              type="button"
              className={`seg-btn income ${type === 'income' ? 'active' : ''}`}
              onClick={() => switchType('income')}
            >
              ↗ Ingreso
            </button>
          </div>

          <label className="field">
            <span>Importe (€)</span>
            <input
              className="amount-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              inputMode="decimal"
              autoFocus
            />
          </label>

          <div className="form-grid">
            <label className="field">
              <span>Categoría</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Fecha</span>
              <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
            </label>
          </div>

          <label className="field">
            <span>Nota (opcional)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej. Cena con amigos"
              maxLength={60}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!valid}>
              {initial ? 'Guardar cambios' : 'Añadir movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
