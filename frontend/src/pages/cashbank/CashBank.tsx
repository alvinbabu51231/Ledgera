import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Printer, CreditCard, QrCode, Plus, Check, MoreVertical } from 'lucide-react';
import { useCompanyStore } from '../../store/companyStore';

export const CashBank: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanyStore();
  const [activeTab, setActiveTab] = useState<'bank' | 'cash'>('bank');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', overflowY: 'auto' }}>
      {/* Top Header */}
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
          Banks
        </div>

        <button className="btn btn-ghost btn-icon-sm">
          <MoreVertical size={18} style={{ color: '#64748b' }} />
        </button>
      </div>

      {/* Main Illustration & Information Section matching Screenshot 212509 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center'
      }}>
        {/* Classical Bank Building Illustration */}
        <div style={{
          position: 'relative',
          width: '180px',
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
            border: '2px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1e293b',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)'
          }}>
            <Landmark size={48} style={{ color: '#334155' }} />
          </div>
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Manage Multiple Bank Accounts
        </h2>
        <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '520px', marginBottom: '36px' }}>
          With Ledgera you can manage multiple banks and payment types like UPI, Net Banking, and Credit Card.
        </p>

        {/* 3 Feature Boxes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          maxWidth: '880px',
          width: '100%',
          marginBottom: '36px'
        }}>
          <div style={{
            padding: '20px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            textAlign: 'left',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <Printer size={18} />
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Print Bank Details on Invoices
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              Print account details on invoices and get payments via NEFT/RTGS/IMPS.
            </div>
          </div>

          <div style={{
            padding: '20px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            textAlign: 'left',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <Landmark size={18} />
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Unlimited Payment Types
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              Record transactions by methods like Banks, UPI, Net Banking and Cards.
            </div>
          </div>

          <div style={{
            padding: '20px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            textAlign: 'left',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <QrCode size={18} />
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Print UPI QR Code on Invoices
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              Print QR code on your invoices or send payment links directly to customers.
            </div>
          </div>
        </div>

        {/* Existing Company Bank Summary if available */}
        {selectedCompany && selectedCompany.bank_name && (
          <div style={{
            marginBottom: '24px',
            padding: '14px 20px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#334155'
          }}>
            Current Active Bank: <strong>{selectedCompany.bank_name}</strong> • Account: <strong>{selectedCompany.account_number}</strong> • IFSC: <strong>{selectedCompany.ifsc_code}</strong>
          </div>
        )}

        {/* CTA Button matching Screenshot 212509 */}
        <button
          className="btn btn-sale"
          onClick={() => navigate('/settings?tab=business')}
          style={{ height: '38px', padding: '0 24px', fontSize: '14px' }}
        >
          <Plus size={16} />
          <span>Add Bank Account</span>
        </button>
      </div>
    </div>
  );
};
