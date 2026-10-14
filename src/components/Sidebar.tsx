import { useRef } from 'react';
import { useStore } from '../store';
import { seedData } from '../data';
import { IconDownload, IconGrid, IconPie, IconRefresh, IconTarget, IconTransfer, IconUpload } from './Icons';

export type TabId = 'dashboard' | 'transactions' | 'budgets' | 'goals';

export const NAV_ITEMS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Panel', icon: <IconGrid /> },
  { id: 'transactions', label: 'Movimientos', icon: <IconTransfer /> },
  { id: 'budgets', label: 'Presupuestos', icon: <IconPie /> },
  { id: 'goals', label: 'Metas de ahorro', icon: <IconTarget /> },
];

export function Sidebar({ tab, setTab }: { tab: TabId; setTab: (t: TabId) => void }) {
  const { state, dispatch } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mis-finanzas-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    file
      .text()
      .then((text) => {
        const parsed = JSON.parse(text);
        if (!parsed || !Array.isArray(parsed.transactions)) throw new Error('formato inválido');
        if (!window.confirm('Esto sustituirá tus datos actuales por los del archivo. ¿Continuar?')) return;
        dispatch({
          type: 'REPLACE_ALL',
          state: {
            transactions: parsed.transactions,
            budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
            goals: Array.isArray(parsed.goals) ? parsed.goals : [],
          },
        });
      })
      .catch(() => window.alert('El archivo no es válido. Debe ser un JSON exportado desde esta app.'));
  };

  const resetData = () => {
    if (window.confirm('¿Sustituir todos tus datos por los datos de ejemplo?')) {
      dispatch({ type: 'REPLACE_ALL', state: seedData() });
    }
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-emoji">💰</span>
        <div className="logo-text">
          <strong>Mis Finanzas</strong>
          <small>Control personal</small>
        </div>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${tab === item.id ? 'active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="side-footer">
        <p className="side-footer-title">Tus datos</p>
        <button className="btn-ghost" onClick={exportData}>
          <IconDownload /> Exportar JSON
        </button>
        <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
          <IconUpload /> Importar
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importData(f);
            e.target.value = '';
          }}
        />
        <button className="btn-ghost danger" onClick={resetData}>
          <IconRefresh /> Datos de ejemplo
        </button>
        <p className="side-note">Todo se guarda localmente en tu navegador.</p>
      </div>
    </aside>
  );
}

/** Navegación inferior para móvil */
export function BottomNav({ tab, setTab }: { tab: TabId; setTab: (t: TabId) => void }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-item ${tab === item.id ? 'active' : ''}`}
          onClick={() => setTab(item.id)}
        >
          {item.icon}
          <span>{item.label.split(' ')[0]}</span>
        </button>
      ))}
    </nav>
  );
}
