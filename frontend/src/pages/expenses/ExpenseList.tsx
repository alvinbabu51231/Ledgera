import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2, WalletCards } from 'lucide-react';

import { useCompanyStore } from '../../store/companyStore';
import { useExpenseStore } from '../../store/expenseStore';

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2,
  }).format(value);
}

export const ExpenseList: React.FC = () => {
  const { selectedCompanyId } = useCompanyStore();
  const { expenses, loading, error, fetchExpenses, deleteExpense } = useExpenseStore();
  const [search, setSearch] = useState('');
  const [archiveId, setArchiveId] = useState<number | null>(null);

  const load = useCallback(() => {
    fetchExpenses({ companyId: selectedCompanyId ?? undefined, search: search || undefined });
  }, [fetchExpenses, search, selectedCompanyId]);

  useEffect(() => { load(); }, [load]);

  const archiveTarget = expenses.find(expense => expense.id === archiveId);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Expenses</h1><p>Track costs for the selected company</p></div>
        <Link to="/expenses/new" className="btn btn-primary"><Plus size={16} /> New Expense</Link>
      </div>

      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-bar"><Search size={15} className="search-bar-icon" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search category, notes, or payment method..." /></div>
          <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--gray-400)' }}>{expenses.length} expenses</div>
        </div>
        {error && <div className="alert alert-error" style={{ margin: '16px 20px' }}>{error}</div>}
        {loading && expenses.length === 0 ? (
          <div className="loading-state">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><WalletCards size={24} /></div><h3>No expenses yet</h3><p>Record the first expense for this company.</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Date</th><th>Category</th><th>Payment Method</th><th>Notes</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>{expenses.map(expense => (
                <tr key={expense.id}>
                  <td>{new Date(`${expense.expense_date}T00:00:00`).toLocaleDateString('en-IN')}</td>
                  <td className="col-primary">{expense.category}</td><td>{expense.payment_method}</td>
                  <td className="col-muted">{expense.notes || '-'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{currency(expense.amount)}</td>
                  <td><div className="table-actions">
                    <Link to={`/expenses/edit/${expense.id}`} className="btn btn-ghost btn-icon-sm" title="Edit expense"><Pencil size={14} /></Link>
                    <button className="btn btn-ghost btn-icon-sm" title="Archive expense" onClick={() => setArchiveId(expense.id)}><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {archiveId && (
        <div className="modal-overlay"><div className="modal">
          <div className="modal-title">Archive Expense?</div>
          <div className="modal-body">The {archiveTarget?.category} expense will be removed from active financial totals while its record remains preserved.</div>
          <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setArchiveId(null)}>Cancel</button><button className="btn btn-primary" style={{ background: '#dc2626' }} onClick={async () => { await deleteExpense(archiveId); setArchiveId(null); }}>Archive</button></div>
        </div></div>
      )}
    </div>
  );
};
