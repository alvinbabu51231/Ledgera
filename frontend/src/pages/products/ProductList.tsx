import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';

export const ProductList: React.FC = () => {
  const { products, loading, error, fetchProducts, deleteProduct } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(searchTerm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!e.target.value) fetchProducts();
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteProduct(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const unitBadgeClass = (unit: string) => {
    if (unit === 'Gross') return 'badge-info';
    if (unit === 'Dozen') return 'badge-warning';
    return 'badge-neutral';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Products</h1>
          <p>Manage your comb product catalogue</p>
        </div>
        <Link to="/products/add" className="btn btn-primary">
          <Plus size={16} />
          New Product
        </Link>
      </div>

      {/* Table Card */}
      <div className="card">
        {/* Toolbar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <form onSubmit={handleSearch} style={{ display: 'contents' }}>
            <div className="search-bar">
              <Search size={15} className="search-bar-icon" />
              <input
                type="text"
                placeholder="Search by code, name, or HSN…"
                value={searchTerm}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
          </form>
          <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--gray-400)' }}>
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ margin: '16px 20px' }}>
            {error}
          </div>
        )}

        {/* States */}
        {loading && products.length === 0 ? (
          <div className="loading-state">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={24} /></div>
            <h3>No products yet</h3>
            <p>Add your first comb product to the catalogue.</p>
            <Link to="/products/add" className="btn btn-primary" style={{ marginTop: '4px' }}>
              <Plus size={16} />
              Add Product
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Unit</th>
                  <th>Selling Price</th>
                  <th>GST %</th>
                  <th>HSN Code</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="col-mono" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
                      {product.product_code}
                    </td>
                    <td className="col-primary">{product.product_name}</td>
                    <td style={{ color: 'var(--gray-600)' }}>{product.category}</td>
                    <td style={{ color: 'var(--gray-600)' }}>{product.size}</td>
                    <td>
                      <span className={`badge ${unitBadgeClass(product.unit)}`}>
                        {product.unit}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                      ₹{product.selling_price.toFixed(2)}
                    </td>
                    <td style={{ color: 'var(--gray-600)' }}>{product.gst_percentage}%</td>
                    <td className="col-mono col-muted">
                      {product.hsn_code || '—'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/products/edit/${product.id}`}
                          className="btn btn-ghost btn-icon-sm"
                          title="Edit product"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="btn btn-ghost btn-icon-sm"
                          title="Delete product"
                          style={{ color: 'var(--gray-400)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Archive Product?</div>
            <div className="modal-body">
              This product will be hidden from active product lists while preserving its history.
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: '#dc2626' }}
                onClick={handleDelete}
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
