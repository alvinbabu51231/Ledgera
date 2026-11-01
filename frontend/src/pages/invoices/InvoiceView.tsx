import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, History, MessageCircle, Pencil } from 'lucide-react';

import { companyApi } from '../../api/companyApi';
import { customerApi } from '../../api/customerApi';
import { invoiceApi } from '../../api/invoiceApi';
import { generateInvoicePdf, openWhatsAppInvoice } from '../../utils/invoicePdf';
import { getErrorMessage } from '../../utils/errors';
import { Company } from '../../../../shared/types/company';
import { Customer } from '../../../../shared/types/customer';
import {
  InvoiceHistoryEntry,
  InvoiceStatus,
  InvoiceWithDetails,
} from '../../../../shared/types/invoice';

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  Draft: 'badge badge-neutral',
  Sent: 'badge badge-info',
  Paid: 'badge badge-success',
  Cancelled: 'badge badge-danger',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [history, setHistory] = useState<InvoiceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const invoiceResponse = await invoiceApi.getById(Number(id));
        const currentInvoice = invoiceResponse.data;
        const [companyResponse, customerResponse, historyResponse] = await Promise.all([
          companyApi.getById(currentInvoice.company_id),
          customerApi.getById(currentInvoice.customer_id),
          invoiceApi.getHistory(currentInvoice.id),
        ]);
        setInvoice(currentInvoice);
        setCompany(companyResponse.data);
        setCustomer(customerResponse.data);
        setHistory(historyResponse.data);
      } catch (loadError: unknown) {
        setError(getErrorMessage(loadError, 'Invoice not found'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="loading-state" style={{ height: '300px' }}>Loading invoice...</div>;
  if (error || !invoice || !company || !customer) {
    return (
      <div className="empty-state">
        <h3>{error ?? 'Invoice not found'}</h3>
        <button className="btn btn-secondary" onClick={() => navigate('/invoices')}>Back to Invoices</button>
      </div>
    );
  }

  const handleShare = async () => {
    setShareError(null);
    try {
      const fileName = await openWhatsAppInvoice(invoice, company, customer);
      alert(`PDF downloaded as ${fileName}. Please attach it to the WhatsApp chat.`);
    } catch (shareFailure: unknown) {
      setShareError(getErrorMessage(shareFailure, 'Unable to share invoice'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/invoices" className="btn btn-ghost btn-icon" title="Back to Invoices"><ArrowLeft size={18} /></Link>
          <div>
            <h1>{invoice.invoice_number}</h1>
            <p>{invoice.company_name} | {formatDate(invoice.invoice_date)}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className={STATUS_BADGE[invoice.status]}><span className="badge-dot" />{invoice.status}</span>
          <button className="btn btn-secondary" onClick={() => generateInvoicePdf(invoice, company, customer)}>
            <Download size={15} /> PDF
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleShare}
            disabled={!customer.whatsapp_number}
            title={customer.whatsapp_number ? 'Generate PDF and share on WhatsApp' : 'Add a WhatsApp number to this customer first'}
          >
            <MessageCircle size={15} /> Share on WhatsApp
          </button>
          <Link to={`/invoices/edit/${invoice.id}`} className="btn btn-secondary"><Pencil size={15} /> Edit</Link>
        </div>
      </div>

      {!customer.whatsapp_number && (
        <div className="alert" style={{ marginBottom: '16px' }}>WhatsApp sharing is unavailable because this customer has no WhatsApp number.</div>
      )}
      {shareError && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{shareError}</div>}

      <div className="card card-padded">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--gray-200)' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '4px' }}>TAX INVOICE</div>
            <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '16px' }}>
              {invoice.invoice_type === 'B2B' ? 'Business to Business' : 'Business to Consumer'}
            </div>
            {[
              ['Invoice #', invoice.invoice_number],
              ['Date', formatDate(invoice.invoice_date)],
              ['Financial Year', invoice.financial_year],
              ['Company GSTIN', company.gst_number || '-'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: '16px', fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ width: '110px', color: 'var(--gray-500)' }}>{label}</span>
                <span style={{ color: 'var(--gray-800)', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="section-title" style={{ marginBottom: '8px' }}>Bill To</div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>{customer.customer_name}</div>
            <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '5px', whiteSpace: 'pre-line' }}>{customer.billing_address}</div>
            {customer.gst_number && <div style={{ fontSize: '13px', marginTop: '5px' }}>GSTIN: {customer.gst_number}</div>}
            <div style={{ fontSize: '13px', marginTop: '5px' }}>{customer.phone_number}</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
          <table className="data-table">
            <thead><tr><th>#</th><th>Product</th><th style={{ textAlign: 'right' }}>Qty</th><th>Unit</th><th style={{ textAlign: 'right' }}>Rate</th><th style={{ textAlign: 'right' }}>GST %</th><th style={{ textAlign: 'right' }}>GST Amt</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
            <tbody>{invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td><td className="col-primary">{item.product_name}</td>
                <td style={{ textAlign: 'right' }}>{item.quantity}</td><td>{item.unit}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(item.rate)}</td>
                <td style={{ textAlign: 'right' }}>{item.gst_percentage}%</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(item.gst_amount)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '320px', background: 'var(--gray-50)', padding: '16px 20px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
            {[['Subtotal', invoice.subtotal], ['CGST', invoice.cgst], ['SGST', invoice.sgst]].map(([label, value]) => (
              <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13.5px' }}>
                <span>{label}</span><span>{formatCurrency(Number(value))}</span>
              </div>
            ))}
            {invoice.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13.5px', color: '#dc2626' }}>
                <span>
                  Discount
                  {invoice.discount_type === 'GST' ? ' (GST waived)' :
                   invoice.discount_type === 'Percentage' ? ` (${(invoice.discount_value / 100).toFixed(2)}%)` : ''}
                </span>
                <span>− {formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--gray-200)', fontSize: '17px', fontWeight: 700 }}>
              <span>Grand Total</span><span>{formatCurrency(invoice.grand_total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-padded" style={{ marginTop: '16px' }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><History size={15} /> Invoice History</div>
        {history.map(entry => (
          <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '13px' }}>
            <span style={{ fontWeight: 500 }}>{entry.action}</span>
            <span style={{ color: 'var(--gray-500)' }}>{new Date(entry.created_at).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
