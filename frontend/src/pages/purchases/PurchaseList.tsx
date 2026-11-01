import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Receipt, Printer, FileSpreadsheet } from 'lucide-react';
import { useExpenseStore } from '../../store/expenseStore';
import { useCompanyStore } from '../../store/companyStore';

export const PurchaseList: React.FC = () => {
  const navigate = useNavigate();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { selectedCompanyId } = useCompanyStore();

  useEffect(() => {
    fetchExpenses(selectedCompanyId ?? undefined);
  }, [fetchExpenses, selectedCompanyId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', overflowY: 'auto' }}>
      {/* Top Header Bar */}
      <div style={{
        height: '52px',
        padding: '0 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          Purchase Bills
        </div>

        <button
          className="btn btn-purchase"
          onClick={() => navigate('/expenses/new')}
          style={{ borderRadius: 'var(--radius-full)', padding: '0 18px', height: '34px' }}
        >
          <Plus size={16} />
          <span>Add Purchase</span>
        </button>
      </div>

      {/* Main Area: Empty State matching Screenshot 212455 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        {/* Shopping Cart Illustration Container */}
        <div style={{
          width: '180px',
          height: '140px',
          background: 'radial-gradient(circle, #e0f2fe 0%, #ffffff 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 10px 25px rgba(2, 132, 199, 0.3)'
          }}>
            <ShoppingCart size={42} />
          </div>
        </div>

        <div style={{
          fontSize: '15px',
          color: '#475569',
          maxWidth: '460px',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          Make Purchase invoices & Print or share with your suppliers directly via WhatsApp or Email.
        </div>

        <button
          onClick={() => navigate('/expenses/new')}
          style={{
            background: '#f59e0b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 28px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#d97706'}
          onMouseLeave={e => e.currentTarget.style.background = '#f59e0b'}
        >
          Add Your First Purchase Invoice
        </button>
      </div>
    </div>
  );
};
