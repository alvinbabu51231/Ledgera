import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import { useCompanyStore } from '../../store/companyStore';
import { invoiceApi } from '../../api/invoiceApi';
import { InvoiceWithDetails } from '../../../../shared/types/invoice';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Eye,
  Settings,
  MoreVertical,
  Sliders,
  FileSpreadsheet,
  AlertTriangle,
  Share2,
  Filter,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'products';

  const { products, loading, error, fetchProducts, deleteProduct } = useProductStore();
  const { selectedCompanyId } = useCompanyStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productInvoices, setProductInvoices] = useState<InvoiceWithDetails[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Default select first product
  useEffect(() => {
    if (products.length > 0 && selectedProductId === null) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // Load transactions for selected product
  useEffect(() => {
    if (!selectedProductId) {
      setProductInvoices([]);
      return;
    }
    const loadTransactions = async () => {
      setInvoicesLoading(true);
      try {
        const res = await invoiceApi.getAll({ companyId: selectedCompanyId ?? undefined });
        // Filter invoices containing this product in items
        const matching = res.data.filter(inv =>
          inv.items && inv.items.some(item => item.product_id === selectedProductId)
        );
        setProductInvoices(matching);
      } catch (err) {
        console.error('Failed to load item transactions', err);
      } finally {
        setInvoicesLoading(false);
      }
    };
    loadTransactions();
  }, [selectedProductId, selectedCompanyId]);

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  // Compute stock quantity and transactions
  const itemTransactions = useMemo(() => {
    if (!selectedProduct) return [];
    const list: {
      id: number;
      invoiceId: number;
      type: string;
      invoiceNo: string;
      customerName: string;
      date: string;
      quantity: number;
      rate: number;
      status: string;
    }[] = [];

    productInvoices.forEach(inv => {
      const lineItem = inv.items?.find(it => it.product_id === selectedProduct.id);
      if (lineItem) {
        list.push({
          id: lineItem.id,
          invoiceId: inv.id,
          type: 'Sale',
          invoiceNo: inv.invoice_number,
          customerName: inv.customer_name,
          date: inv.invoice_date,
          quantity: lineItem.quantity,
          rate: lineItem.rate,
          status: inv.status === 'Paid' ? 'Paid' : 'Unpaid'
        });
      }
    });

    if (!transactionSearch.trim()) return list;
    const q = transactionSearch.toLowerCase();
    return list.filter(t =>
      t.invoiceNo.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q)
    );
  }, [selectedProduct, productInvoices, transactionSearch]);

  const totalQuantitySold = useMemo(() => {
    return itemTransactions.reduce((sum, t) => sum + t.quantity, 0);
  }, [itemTransactions]);

  // Stock calculations: e.g. -totalQuantitySold or initial stock
  const currentStock = -totalQuantitySold;
  const stockValue = currentStock > 0 && selectedProduct ? currentStock * selectedProduct.selling_price : 0;

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteProduct(deleteConfirmId);
      setDeleteConfirmId(null);
      if (selectedProductId === deleteConfirmId) {
        setSelectedProductId(null);
      }
    }
  };

  const handleExportExcel = () => {
    if (!selectedProduct) return;
    const data = itemTransactions.map(t => ({
      'Type': t.type,
      'Invoice / Ref No': t.invoiceNo,
      'Name': t.customerName,
      'Date': t.date,
      'Quantity': t.quantity,
      'Price / Unit': t.rate,
      'Status': t.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Item Transactions');
    XLSX.writeFile(wb, `${selectedProduct.product_name}_Transactions.xlsx`);
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const q = searchTerm.toLowerCase();
    return products.filter(p =>
      p.product_name.toLowerCase().includes(q) ||
      p.product_code.toLowerCase().includes(q) ||
      (p.hsn_code && p.hsn_code.toLowerCase().includes(q))
    );
  }, [products, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
      {/* ── Top Tabs Bar (PRODUCTS / SERVICES / CATEGORY / UNITS) ── */}
      <div className="module-tabs-bar">
        <button
          className={`module-tab-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setSearchParams({ tab: 'products' })}
        >
          Products
        </button>
        <button
          className={`module-tab-item ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setSearchParams({ tab: 'services' })}
        >
          Services
        </button>
        <button
          className={`module-tab-item ${activeTab === 'category' ? 'active' : ''}`}
          onClick={() => setSearchParams({ tab: 'category' })}
        >
          Category
        </button>
        <button
          className={`module-tab-item ${activeTab === 'units' ? 'active' : ''}`}
          onClick={() => setSearchParams({ tab: 'units' })}
        >
          Units
        </button>
      </div>

      {/* ── Master-Detail Container ── */}
      <div className="master-detail-container" style={{ height: 'calc(100vh - 100px)' }}>
        {/* Left List Pane: Items List */}
        <div className="master-list-pane">
          {/* Search & Add Item Toolbar */}
          <div className="master-list-toolbar" style={{ gap: '8px' }}>
            <div className="search-bar" style={{ maxWidth: '100%', flex: 1 }}>
              <Search size={14} className="search-bar-icon" />
              <input
                type="text"
                placeholder="Search Item..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="btn btn-sale btn-sm"
              onClick={() => navigate('/products/add')}
              style={{ background: '#f59e0b', color: '#ffffff', borderRadius: 'var(--radius-md)', padding: '0 10px', height: '32px' }}
              title="Add New Item"
            >
              <Plus size={14} />
              <span>Add Item</span>
            </button>
          </div>

          {/* Table Header: ITEM | QUANTITY */}
          <div className="master-list-table-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Item</span>
              <Filter size={11} style={{ color: '#94a3b8' }} />
            </div>
            <span>Quantity</span>
          </div>

          {/* Items Scrollable List */}
          <div className="master-list-items-scroll">
            {loading && products.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                Loading items...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                <Package size={32} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600 }}>No items found</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Click "+ Add Item" above to create one.
                </div>
              </div>
            ) : (
              filteredProducts.map(product => {
                const isSelected = selectedProduct?.id === product.id;
                return (
                  <div
                    key={product.id}
                    className={`master-list-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    <div>
                      <div className="master-list-party-name">{product.product_name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {product.product_code} • {product.category}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: currentStock < 0 ? '#ef4444' : '#10b981'
                    }}>
                      {/* Negative or current stock representation */}
                      {currentStock}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Pane: Item Details & Transaction Table */}
        <div className="master-detail-pane">
          {selectedProduct ? (
            <>
              {/* Selected Item Top Bar */}
              <div className="master-detail-top-bar" style={{ padding: '16px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                    {selectedProduct.product_name}
                  </span>
                  <button
                    onClick={() => navigate(`/products/edit/${selectedProduct.id}`)}
                    className="btn btn-ghost btn-icon-sm"
                    title="Edit Item Details"
                    style={{ color: '#2563eb' }}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(selectedProduct.id)}
                    className="btn btn-ghost btn-icon-sm"
                    title="Archive Item"
                    style={{ color: '#94a3b8' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => alert(`Adjust item quantity/stock for ${selectedProduct.product_name}`)}
                    style={{
                      background: '#1e60db',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sliders size={14} />
                    <span>ADJUST ITEM</span>
                  </button>
                </div>
              </div>

              {/* Price & Stock Stats Bar (Matching Screenshot 212443) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                padding: '14px 24px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    SALE PRICE:
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                    ₹ {selectedProduct.selling_price.toFixed(2)} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>(excl)</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    PURCHASE PRICE:
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#64748b', marginTop: '2px' }}>
                    ₹ {selectedProduct.manufacturing_cost.toFixed(2)} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>(excl)</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} style={{ color: '#ef4444' }} />
                    <span>STOCK QUANTITY:</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: currentStock < 0 ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                    {currentStock} {selectedProduct.unit}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    STOCK VALUE:
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    ₹ {stockValue.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Transactions Subheader */}
              <div className="master-detail-transactions-header">
                <div className="master-detail-transactions-title">TRANSACTIONS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="search-bar" style={{ maxWidth: '180px', height: '30px' }}>
                    <Search size={13} className="search-bar-icon" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={transactionSearch}
                      onChange={e => setTransactionSearch(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-ghost btn-icon-sm"
                    onClick={handleExportExcel}
                    title="Export to Excel"
                  >
                    <FileSpreadsheet size={16} style={{ color: '#16a34a' }} />
                  </button>
                </div>
              </div>

              {/* Item Transactions Table matching Screenshot 212443 */}
              <div style={{ overflowX: 'auto', padding: '0 24px 24px' }}>
                <table className="data-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <thead>
                    <tr>
                      <th>TYPE</th>
                      <th>INVOICE/REF NO</th>
                      <th>NAME</th>
                      <th>DATE</th>
                      <th style={{ textAlign: 'right' }}>QUANTITY</th>
                      <th style={{ textAlign: 'right' }}>PRICE/UNIT</th>
                      <th>STATUS</th>
                      <th style={{ textAlign: 'center', width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesLoading ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                          Loading transactions...
                        </td>
                      </tr>
                    ) : itemTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                          <div>No transactions recorded yet for this item.</div>
                        </td>
                      </tr>
                    ) : (
                      itemTransactions.map(txn => (
                        <tr key={txn.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                              <span style={{ fontWeight: 600 }}>{txn.type}</span>
                            </div>
                          </td>
                          <td className="col-mono">
                            <Link to={`/invoices/view/${txn.invoiceId}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                              {txn.invoiceNo}
                            </Link>
                          </td>
                          <td className="col-primary">{txn.customerName}</td>
                          <td>
                            {new Date(txn.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{txn.quantity}</td>
                          <td style={{ textAlign: 'right' }}>₹{txn.rate.toFixed(2)}</td>
                          <td>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              background: txn.status === 'Paid' ? '#dcfce7' : '#fee2e2',
                              color: txn.status === 'Paid' ? '#166534' : '#991b1b'
                            }}>
                              {txn.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn btn-ghost btn-icon-sm"
                              onClick={() => navigate(`/invoices/view/${txn.invoiceId}`)}
                              title="View Invoice"
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
              <Package size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
              <div style={{ fontSize: '16px', fontWeight: 600 }}>Select an item from the list</div>
              <div style={{ fontSize: '13px' }}>View pricing, stock and transaction records.</div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Archive Product?</div>
            <div className="modal-body">
              This product will be hidden from active lists while preserving historical invoices.
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ background: '#dc2626' }} onClick={handleDelete}>
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
