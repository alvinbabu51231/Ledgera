import * as XLSX from 'xlsx';

export interface ImportResult<T> {
  valid: T[];
  errors: { row: number; errors: string[] }[];
}

export async function parseImportFile<T>(
  file: File,
  type: 'customers' | 'products',
  companyId: number
): Promise<ImportResult<T>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON array
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const result: ImportResult<T> = {
          valid: [],
          errors: []
        };

        jsonData.forEach((row, index) => {
          const rowNumber = index + 2; // Excel row number (assuming header is row 1)
          const errors: string[] = [];

          if (type === 'customers') {
            const customer: any = {
              company_id: companyId,
              customer_name: String(row.customer_name || row.Name || row.CustomerName || ''),
              billing_address: String(row.billing_address || row.Address || row.BillingAddress || ''),
              shipping_address: row.shipping_address || row.ShippingAddress || row.billing_address || row.Address || row.BillingAddress || '',
              gst_number: row.gst_number || row.GSTIN || row.GST || null,
              phone_number: String(row.phone_number || row.Phone || row.Contact || ''),
              whatsapp_number: row.whatsapp_number || row.WhatsApp || null,
              email: row.email || row.Email || null,
              notes: row.notes || row.Notes || null,
            };

            if (!customer.customer_name) errors.push('Customer Name is required');
            if (!customer.billing_address) errors.push('Billing Address is required');
            if (!customer.phone_number) errors.push('Phone Number is required');

            if (errors.length > 0) {
              result.errors.push({ row: rowNumber, errors });
            } else {
              result.valid.push(customer as T);
            }
          } else if (type === 'products') {
            const product: any = {
              product_code: String(row.product_code || row.Code || row.SKU || ''),
              product_name: String(row.product_name || row.Name || row.ProductName || ''),
              category: String(row.category || row.Category || ''),
              size: String(row.size || row.Size || ''),
              unit: String(row.unit || row.Unit || 'Piece'),
              selling_price: Number(row.selling_price || row.SellingPrice || row.Price || 0),
              manufacturing_cost: Number(row.manufacturing_cost || row.ManufacturingCost || row.Cost || 0),
              gst_percentage: Number(row.gst_percentage || row.GST || row.GSTPercentage || 0),
              hsn_code: row.hsn_code || row.HSN || null,
              description: row.description || row.Description || null,
            };

            if (!product.product_code) errors.push('Product Code is required');
            if (!product.product_name) errors.push('Product Name is required');
            if (!product.category) errors.push('Category is required');
            if (!product.size) errors.push('Size is required');
            if (!product.unit) errors.push('Unit is required');
            if (product.selling_price < 0) errors.push('Selling Price must be positive');
            if (product.manufacturing_cost < 0) errors.push('Manufacturing Cost must be positive');
            if (product.gst_percentage < 0 || product.gst_percentage > 100) errors.push('GST must be between 0 and 100');

            if (errors.length > 0) {
              result.errors.push({ row: rowNumber, errors });
            } else {
              result.valid.push(product as T);
            }
          }
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
