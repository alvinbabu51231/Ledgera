import React, { useState, useRef } from 'react';
import { Upload, FileType, CheckCircle, AlertCircle } from 'lucide-react';
import { useCompanyStore } from '../../store/companyStore';
import { parseImportFile, ImportResult } from './importHelpers';
import { customerApi } from '../../api/customerApi';
import { productApi } from '../../api/productApi';
import { getErrorMessage } from '../../utils/errors';

export const ImportData: React.FC = () => {
  const { selectedCompanyId } = useCompanyStore();
  const [importType, setImportType] = useState<'customers' | 'products'>('customers');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult<any> | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setGlobalError(null);
      setSuccessMessage(null);
    }
  };

  const handleProcessFile = async () => {
    if (!file) return;
    if (!selectedCompanyId && importType === 'customers') {
      setGlobalError('Please select a company first.');
      return;
    }
    
    setLoading(true);
    setGlobalError(null);
    try {
      // Use 0 as fallback for products, since they aren't company-scoped in this DB schema.
      // Wait, let's pass selectedCompanyId for customers.
      const parsed = await parseImportFile(file, importType, selectedCompanyId || 0);
      setResult(parsed);
    } catch (err) {
      setGlobalError('Failed to parse file. Please ensure it is a valid Excel (.xlsx) or CSV file.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!result || result.valid.length === 0) return;
    setLoading(true);
    setGlobalError(null);
    try {
      let importedCount = 0;
      if (importType === 'customers') {
        for (const customer of result.valid) {
          await customerApi.create(customer);
          importedCount++;
        }
      } else {
        for (const product of result.valid) {
          await productApi.create(product);
          importedCount++;
        }
      }
      setSuccessMessage(`Successfully imported ${importedCount} ${importType}.`);
      setFile(null);
      setResult(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setGlobalError(getErrorMessage(err, `Failed to import ${importType}. Some records may have been imported.`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Import Data</h1>
          <p>Import customers and products from Excel or CSV files.</p>
        </div>
      </div>

      <div className="form-grid-3" style={{ marginBottom: '24px' }}>
        <div className="card card-padded" style={{ gridColumn: 'span 2' }}>
          <div className="form-group">
            <label className="form-label">What do you want to import?</label>
            <select
              className="form-select"
              value={importType}
              onChange={(e) => {
                setImportType(e.target.value as 'customers' | 'products');
                setFile(null);
                setResult(null);
                setSuccessMessage(null);
              }}
              disabled={loading}
            >
              <option value="customers">Customers</option>
              <option value="products">Products</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Upload File (.xlsx or .csv)</label>
            <div 
              style={{
                border: '2px dashed var(--gray-300)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
                textAlign: 'center',
                backgroundColor: 'var(--gray-50)',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} style={{ color: 'var(--gray-400)', marginBottom: '12px' }} />
              <div>
                <span style={{ color: 'var(--primary-600)', fontWeight: 500 }}>Click to upload</span>
                <span style={{ color: 'var(--gray-500)' }}> or drag and drop</span>
              </div>
              <div style={{ color: 'var(--gray-400)', fontSize: '12px', marginTop: '4px' }}>
                Excel (.xlsx) or CSV format only
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".xlsx, .csv" 
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            {file && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-700)' }}>
                <FileType size={16} color="var(--primary-600)" />
                <span style={{ fontWeight: 500 }}>{file.name}</span>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleProcessFile}
                  disabled={loading}
                  style={{ marginLeft: 'auto' }}
                >
                  {loading ? 'Processing...' : 'Analyze File'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Future Integrations / Info panel */}
        <div className="card card-padded" style={{ backgroundColor: 'var(--primary-50)', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-700)', fontWeight: 600 }}>
            <FileType size={18} />
            Supported Formats
          </div>
          <ul style={{ fontSize: '13px', color: 'var(--gray-700)', paddingLeft: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Excel Workbooks (.xlsx)</li>
            <li>Comma Separated Values (.csv)</li>
          </ul>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--gray-700)', fontWeight: 600 }}>
            Coming Soon
          </div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
            Import from EqSoft (.EQD)
          </div>
        </div>
      </div>

      {globalError && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <AlertCircle size={16} /> {globalError}
        </div>
      )}
      
      {successMessage && (
        <div className="alert" style={{ marginBottom: '24px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #10b981' }}>
          <CheckCircle size={16} /> {successMessage}
        </div>
      )}

      {result && (
        <div className="card card-padded">
          <div className="section-title">Import Preview</div>
          
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', flex: 1 }}>
              <div style={{ color: '#166534', fontWeight: 600, fontSize: '18px', marginBottom: '4px' }}>{result.valid.length}</div>
              <div style={{ color: '#15803d', fontSize: '13px' }}>Valid Records Ready to Import</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', flex: 1 }}>
              <div style={{ color: '#991b1b', fontWeight: 600, fontSize: '18px', marginBottom: '4px' }}>{result.errors.length}</div>
              <div style={{ color: '#b91c1c', fontSize: '13px' }}>Records with Errors</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontWeight: 600, color: 'var(--gray-700)', marginBottom: '8px' }}>Error Details</div>
              <div style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead style={{ backgroundColor: 'var(--gray-50)' }}>
                    <tr>
                      <th style={{ width: '80px' }}>Row</th>
                      <th>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((err, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{err.row}</td>
                        <td style={{ color: '#dc2626' }}>
                          <ul style={{ margin: 0, paddingLeft: '16px' }}>
                            {err.errors.map((e, j) => <li key={j}>{e}</li>)}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setResult(null)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleImport}
              disabled={loading || result.valid.length === 0}
            >
              {loading ? 'Importing...' : `Import ${result.valid.length} Records`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
