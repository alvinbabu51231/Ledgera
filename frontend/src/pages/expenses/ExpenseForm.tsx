import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { expenseApi } from '../../api/expenseApi';
import { useCompanyStore } from '../../store/companyStore';
import { getErrorMessage } from '../../utils/errors';
import {
  CreateExpenseInput,
  EXPENSE_CATEGORIES,
  ExpenseCategory,
  PAYMENT_METHODS,
  PaymentMethod,
} from '../../../../shared/types/expense';

export const ExpenseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { companies, selectedCompanyId } = useCompanyStore();
  const [companyId, setCompanyId] = useState<number | ''>(selectedCompanyId ?? '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Raw Material');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit && !companyId && selectedCompanyId) setCompanyId(selectedCompanyId);
  }, [companyId, isEdit, selectedCompanyId]);

  useEffect(() => {
    if (!id) return;
    expenseApi.getById(Number(id)).then(response => {
      const expense = response.data;
      setCompanyId(expense.company_id); setDate(expense.expense_date); setAmount(String(expense.amount));
      setCategory(expense.category); setPaymentMethod(expense.payment_method); setNotes(expense.notes ?? '');
    }).catch(loadError => setError(getErrorMessage(loadError, 'Failed to load expense')))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(null);
    if (!companyId) { setError('Company is required'); return; }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) { setError('Amount must be greater than zero'); return; }
    const payload: CreateExpenseInput = {
      company_id: companyId,
      expense_date: date,
      amount: parsedAmount,
      category,
      payment_method: paymentMethod,
      notes: notes.trim() || null,
    };
    setSaving(true);
    try {
      if (isEdit) await expenseApi.update(Number(id), payload);
      else await expenseApi.create(payload);
      navigate('/expenses');
    } catch (saveError: unknown) {
      setError(getErrorMessage(saveError, 'Failed to save expense'));
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loading-state">Loading expense...</div>;
  return (
    <div>
      <div className="page-header"><div className="page-header-left" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link to="/expenses" className="btn btn-ghost btn-icon" title="Back to Expenses"><ArrowLeft size={18} /></Link>
        <div><h1>{isEdit ? 'Edit Expense' : 'New Expense'}</h1><p>Record a company expense</p></div>
      </div></div>
      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
      <form onSubmit={submit} className="card card-padded">
        <div className="form-grid-2">
          <div className="form-group"><label className="form-label">Company <span className="required">*</span></label><select className="form-select" value={companyId} onChange={event => setCompanyId(Number(event.target.value))} required><option value="">Select company...</option>{companies.map(company => <option key={company.id} value={company.id}>{company.company_name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Date <span className="required">*</span></label><input type="date" className="form-input" value={date} onChange={event => setDate(event.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Amount <span className="required">*</span></label><input type="number" min="0.01" step="0.01" className="form-input" value={amount} onChange={event => setAmount(event.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Category <span className="required">*</span></label><select className="form-select" value={category} onChange={event => setCategory(event.target.value as ExpenseCategory)}>{EXPENSE_CATEGORIES.map(value => <option key={value}>{value}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Payment Method <span className="required">*</span></label><select className="form-select" value={paymentMethod} onChange={event => setPaymentMethod(event.target.value as PaymentMethod)}>{PAYMENT_METHODS.map(value => <option key={value}>{value}</option>)}</select></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Notes</label><textarea className="form-textarea" rows={3} value={notes} onChange={event => setNotes(event.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}><button type="button" className="btn btn-secondary" onClick={() => navigate('/expenses')}>Cancel</button><button className="btn btn-primary" disabled={saving}><Save size={15} />{saving ? 'Saving...' : 'Save Expense'}</button></div>
      </form>
    </div>
  );
};
