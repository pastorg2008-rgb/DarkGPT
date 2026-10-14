import { useState } from 'react';
import type { Goal } from '../types';
import { useStore } from '../store';
import { fmt, fmtDate, monthsBetween, parseAmount, todayISO, uid } from '../utils';
import { IconTrash } from './Icons';

const EMOJIS = ['🛡️', '✈️', '💻', '🚗', '🏡', '🎓', '💍', '📷', '🎸', '🐶'];

function GoalCard({ goal }: { goal: Goal }) {
  const { dispatch } = useStore();
  const [amount, setAmount] = useState('');
  const pct = goal.target > 0 ? Math.min(goal.saved / goal.target, 1) : 0;
  const missing = Math.max(goal.target - goal.saved, 0);
  const done = missing <= 0;

  const move = (sign: 1 | -1) => {
    const n = parseAmount(amount);
    if (n <= 0) return;
    const saved = Math.max(0, Math.round((goal.saved + sign * n) * 100) / 100);
    dispatch({ type: 'UPDATE_GOAL', goal: { ...goal, saved } });
    setAmount('');
  };

  let hint = '';
  if (!done && goal.deadline) {
    const months = monthsBetween(todayISO(), goal.deadline);
    hint = `Ahorrando ${fmt(missing / months)}/mes lo consigues antes del ${fmtDate(goal.deadline)}`;
  }

  return (
    <div className="card goal-card">
      <div className="goal-head">
        <span className="goal-emoji">{goal.emoji}</span>
        <div>
          <strong>{goal.name}</strong>
          {goal.deadline && <small className="goal-deadline">📅 {fmtDate(goal.deadline)}</small>}
        </div>
        <button
          className="icon-btn danger goal-delete"
          title="Eliminar meta"
          onClick={() => window.confirm(`¿Eliminar la meta «${goal.name}»?`) && dispatch({ type: 'DELETE_GOAL', id: goal.id })}
        >
          <IconTrash width={16} height={16} />
        </button>
      </div>

      <div className="goal-nums">
        <b>{fmt(goal.saved)}</b> <span>de {fmt(goal.target)}</span>
        <span className={`goal-pct ${done ? 'done' : ''}`}>{done ? '¡Completada! 🎉' : `${(pct * 100).toFixed(0)}%`}</span>
      </div>
      <div className="bar">
        <div className={`bar-fill goal ${done ? 'done' : ''}`} style={{ width: `${pct * 100}%` }} />
      </div>
      {hint && <p className="goal-hint">{hint}</p>}

      {!done && (
        <div className="goal-add">
          <input
            placeholder="Cantidad (€)"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && move(1)}
          />
          <button className="btn btn-primary" onClick={() => move(1)} disabled={parseAmount(amount) <= 0}>
            Añadir
          </button>
          <button className="btn btn-ghost" onClick={() => move(-1)} disabled={parseAmount(amount) <= 0}>
            Quitar
          </button>
        </div>
      )}
    </div>
  );
}

export function Goals() {
  const { state, dispatch } = useStore();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[1]);

  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);

  const addGoal = () => {
    const t = parseAmount(target);
    if (!name.trim() || t <= 0) return;
    const goal: Goal = {
      id: uid(),
      name: name.trim(),
      emoji,
      target: t,
      saved: 0,
      ...(deadline ? { deadline } : {}),
    };
    dispatch({ type: 'ADD_GOAL', goal });
    setName('');
    setTarget('');
    setDeadline('');
  };

  return (
    <div className="page">
      <div className="card">
        <div className="card-head">
          <h3>Nueva meta de ahorro</h3>
        </div>
        <div className="goal-form">
          <div className="emoji-picker">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className={`emoji-btn ${emoji === e ? 'active' : ''}`}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="goal-form-fields">
            <input placeholder="Nombre de la meta (ej. Viaje a Japón)" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
            <input placeholder="Objetivo (€)" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
            <label className="goal-deadline-input">
              <span>Fecha límite (opcional)</span>
              <input type="date" value={deadline} min={todayISO()} onChange={(e) => setDeadline(e.target.value)} />
            </label>
            <button className="btn btn-primary" onClick={addGoal} disabled={!name.trim() || parseAmount(target) <= 0}>
              Crear meta
            </button>
          </div>
        </div>
      </div>

      {state.goals.length > 0 && (
        <p className="goals-total">
          En total llevas ahorrado <b className="income-text">{fmt(totalSaved)}</b> de{' '}
          <b>{fmt(totalTarget)}</b> en {state.goals.length} meta{state.goals.length === 1 ? '' : 's'}.
        </p>
      )}

      <div className="goals-grid">
        {state.goals.length === 0 ? (
          <div className="card">
            <p className="empty">Todavía no tienes metas. Crea la primera arriba 👆</p>
          </div>
        ) : (
          state.goals.map((g) => <GoalCard key={g.id} goal={g} />)
        )}
      </div>
    </div>
  );
}
