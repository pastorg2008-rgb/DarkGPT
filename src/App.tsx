import { useState } from 'react';
import type { Transaction } from './types';
import { monthKey } from './utils';
import { BottomNav, Sidebar, type TabId } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Budgets } from './components/Budgets';
import { Goals } from './components/Goals';
import { TransactionModal } from './components/TransactionModal';

const TITLES: Record<TabId, string> = {
  dashboard: 'Panel',
  transactions: 'Movimientos',
  budgets: 'Presupuestos',
  goals: 'Metas de ahorro',
};

export default function App() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [month, setMonth] = useState(monthKey(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (t: Transaction) => {
    setEditing(t);
    setModalOpen(true);
  };

  return (
    <div className="app">
      <Sidebar tab={tab} setTab={setTab} />
      <main className="main">
        <Header title={TITLES[tab]} month={month} setMonth={setMonth} onNew={openNew} />
        {tab === 'dashboard' && <Dashboard month={month} onEdit={openEdit} />}
        {tab === 'transactions' && <Transactions onEdit={openEdit} />}
        {tab === 'budgets' && <Budgets month={month} />}
        {tab === 'goals' && <Goals />}
      </main>
      <BottomNav tab={tab} setTab={setTab} />
      <TransactionModal open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} />
    </div>
  );
}
