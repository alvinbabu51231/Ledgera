import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Company } from '../../../shared/types/company';
import { Customer } from '../../../shared/types/customer';
import { InvoiceWithDetails } from '../../../shared/types/invoice';

// ─── Constants ────────────────────────────────────────────────────────────────
const BRAND_BLUE: [number, number, number] = [22, 78, 167];
const BRAND_BLUE_LIGHT: [number, number, number] = [235, 241, 255];
const DARK: [number, number, number] = [15, 23, 42];
const MID: [number, number, number] = [71, 85, 105];
const LIGHT: [number, number, number] = [148, 163, 184];
const WHITE: [number, number, number] = [255, 255, 255];
const DIVIDER: [number, number, number] = [226, 232, 240];
const RED: [number, number, number] = [185, 28, 28];

function fmt(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value);
}

function safe(value: string | null | undefined) {
  return value?.trim() || '–';
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// Draw a horizontal rule
function hRule(doc: jsPDF, y: number, x1 = 14, x2 = 196) {
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.3);
  doc.line(x1, y, x2, y);
}

// Draw a filled label
function labelValue(doc: jsPDF, label: string, value: string, x: number, y: number, width = 80, align: 'left' | 'right' = 'left') {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...LIGHT);
  doc.text(label.toUpperCase(), x, y, { align });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  const lines = doc.splitTextToSize(value, width);
  doc.text(lines, x, y + 4.5, { align });
  return y + 4.5 + (lines.length - 1) * 4.5;
}

export function generateInvoicePdf(
  invoice: InvoiceWithDetails,
  company: Company,
  customer: Customer
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFont('helvetica', 'normal');

  const fileName = `${invoice.invoice_number.replace(/[^a-z0-9\-]/gi, '_')}.pdf`;
  const PAGE_W = 210;
  const MARGIN_L = 14;
  const MARGIN_R = 196;
  const CONTENT_W = MARGIN_R - MARGIN_L;

  // ── 1. Header band ──────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 0, PAGE_W, 28, 'F');

  // Tax Invoice label (left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...WHITE);
  doc.text('TAX INVOICE', MARGIN_L, 18);

  // Invoice number badge (right)
  const badgeW = 60;
  doc.setFillColor(255, 255, 255, 20); // semi-transparent white
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 255);
  doc.text('INVOICE NUMBER', MARGIN_R, 10, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  doc.text(invoice.invoice_number, MARGIN_R, 17, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 220, 255);
  doc.text(formatDate(invoice.invoice_date), MARGIN_R, 24, { align: 'right' });

  // ── 2. Company + Invoice meta two-column ────────────────────────────────────
  let yLeft = 38;
  let yRight = 38;
  const colMid = 112;

  // Left: Company info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text(company.company_name.toUpperCase(), MARGIN_L, yLeft);
  yLeft += 6;

  if (company.address) {
    const addrLines = doc.splitTextToSize(company.address, 90);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...MID);
    doc.text(addrLines, MARGIN_L, yLeft);
    yLeft += addrLines.length * 4.5;
  }

  yLeft += 2;
  const companyDetails: [string, string][] = [];
  if (company.gst_number) companyDetails.push(['GSTIN', company.gst_number]);
  if (company.phone) companyDetails.push(['Phone', company.phone]);
  if (company.email) companyDetails.push(['Email', company.email]);

  for (const [k, v] of companyDetails) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...LIGHT);
    doc.text(k + ':', MARGIN_L, yLeft);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MID);
    doc.text(v, MARGIN_L + 18, yLeft);
    yLeft += 4.5;
  }

  // Right: Invoice meta
  const metaRows: [string, string][] = [
    ['Financial Year', invoice.financial_year],
    ['Invoice Type', invoice.invoice_type === 'B2B' ? 'B2B (Business)' : 'B2C (Consumer)'],
    ['Status', invoice.status],
  ];

  for (const [k, v] of metaRows) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...LIGHT);
    doc.text(k, MARGIN_R, yRight, { align: 'right' });
    yRight += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(v, MARGIN_R, yRight, { align: 'right' });
    yRight += 6;
  }

  // ── 3. Bill To / Ship To band ───────────────────────────────────────────────
  const afterCompany = Math.max(yLeft, yRight) + 4;
  hRule(doc, afterCompany);

  const billY = afterCompany + 8;
  // "Bill To" pill
  doc.setFillColor(...BRAND_BLUE_LIGHT);
  doc.roundedRect(MARGIN_L, billY - 4, 30, 6, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND_BLUE);
  doc.text('BILL TO', MARGIN_L + 3, billY);

  let custY = billY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text(customer.customer_name, MARGIN_L, custY);
  custY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MID);
  const addrLines = doc.splitTextToSize(customer.billing_address, 90);
  doc.text(addrLines, MARGIN_L, custY);
  custY += addrLines.length * 4.5 + 2;

  if (customer.gst_number) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...LIGHT);
    doc.text('GSTIN:', MARGIN_L, custY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MID);
    doc.text(customer.gst_number, MARGIN_L + 18, custY);
    custY += 4.5;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...LIGHT);
  doc.text('Phone:', MARGIN_L, custY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MID);
  doc.text(customer.phone_number, MARGIN_L + 18, custY);

  // ── 4. Items Table ──────────────────────────────────────────────────────────
  const tableStartY = custY + 12;
  const hasHsn = invoice.items.some(i => i.hsn_code);

  const head = hasHsn
    ? [['#', 'Description', 'HSN', 'Qty', 'Unit', 'Rate', 'GST%', 'GST Amt', 'Total']]
    : [['#', 'Description', 'Qty', 'Unit', 'Rate', 'GST%', 'GST Amt', 'Total']];

  const body = invoice.items.map((item, i) => {
    const row = [
      String(i + 1),
      item.product_name,
      ...(hasHsn ? [safe(item.hsn_code)] : []),
      String(item.quantity),
      item.unit,
      fmt(item.rate),
      `${item.gst_percentage}%`,
      fmt(item.gst_amount),
      fmt(item.total),
    ];
    return row;
  });

  autoTable(doc, {
    startY: tableStartY,
    head,
    body,
    theme: 'plain',
    headStyles: {
      fillColor: BRAND_BLUE,
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: DARK,
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      [hasHsn ? 2 : -1]: { halign: 'center', cellWidth: 18 },
      [hasHsn ? 3 : 2]: { halign: 'center', cellWidth: 14 },
      [hasHsn ? 4 : 3]: { halign: 'center', cellWidth: 16 },
      [hasHsn ? 5 : 4]: { halign: 'right', cellWidth: 22 },
      [hasHsn ? 6 : 5]: { halign: 'center', cellWidth: 14 },
      [hasHsn ? 7 : 6]: { halign: 'right', cellWidth: 22 },
      [hasHsn ? 8 : 7]: { halign: 'right', cellWidth: 24 },
    },
    styles: { lineColor: DIVIDER, lineWidth: 0.2 },
    didDrawPage: () => {
      // Page footer
      const pg = (doc as any).internal.getNumberOfPages();
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(...LIGHT);
      doc.text(`Page ${pg}`, 105, 292, { align: 'center' });
    },
  });

  const finalY: number = (doc as any).lastAutoTable?.finalY ?? tableStartY + 30;

  // ── 5. Totals ───────────────────────────────────────────────────────────────
  const totalsX = 128;
  const totalsLabelX = 130;
  const totalsValueX = MARGIN_R;
  let tY = finalY + 8;

  const totalsRows: Array<{ label: string; value: string; bold?: boolean; red?: boolean }> = [
    { label: 'Subtotal', value: fmt(invoice.subtotal) },
    { label: 'CGST', value: fmt(invoice.cgst) },
    { label: 'SGST', value: fmt(invoice.sgst) },
  ];

  if (invoice.discount_amount > 0) {
    let dlabel = 'Discount';
    if (invoice.discount_type === 'GST') dlabel = 'Discount (GST Waived)';
    else if (invoice.discount_type === 'Percentage') {
      dlabel = `Discount (${(invoice.discount_value / 100).toFixed(0)}%)`;
    }
    totalsRows.push({ label: dlabel, value: `− ${fmt(invoice.discount_amount)}`, red: true });
  }

  totalsRows.push({ label: 'Grand Total', value: fmt(invoice.grand_total), bold: true });

  // Background for totals block
  doc.setFillColor(...BRAND_BLUE_LIGHT);
  doc.roundedRect(totalsX - 4, tY - 5, MARGIN_R - totalsX + 8, totalsRows.length * 8 + 4, 2, 2, 'F');

  for (const row of totalsRows) {
    if (row.bold) {
      doc.setFillColor(...BRAND_BLUE);
      doc.rect(totalsX - 4, tY - 3.5, MARGIN_R - totalsX + 8, 8, 'F');
    }
    doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
    doc.setFontSize(row.bold ? 10 : 8.5);
    doc.setTextColor(...(row.red ? RED : row.bold ? WHITE : DARK));
    doc.text(row.label, totalsLabelX, tY);
    doc.text(row.value, totalsValueX, tY, { align: 'right' });
    tY += 8;
  }

  // ── 6. Notes ────────────────────────────────────────────────────────────────
  if (invoice.notes) {
    const notesY = finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.text('Notes / Terms:', MARGIN_L, notesY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...MID);
    doc.text(doc.splitTextToSize(invoice.notes, 90), MARGIN_L, notesY + 5);
  }

  // ── 7. Footer ───────────────────────────────────────────────────────────────
  const footerY = 248;
  hRule(doc, footerY);

  // Bank Details (left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_BLUE);
  doc.text('Bank Details', MARGIN_L, footerY + 8);

  const bankRows: [string, string][] = [
    ['Bank Name', safe(company.bank_name)],
    ['Account No', safe(company.account_number)],
    ['Account Holder', safe(company.account_holder)],
    ['IFSC Code', safe(company.ifsc_code)],
  ];

  let bankY = footerY + 14;
  for (const [k, v] of bankRows) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...LIGHT);
    doc.text(k, MARGIN_L, bankY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.text(v, MARGIN_L + 32, bankY);
    bankY += 5;
  }

  // Authorized Signature (right)
  doc.setFillColor(...BRAND_BLUE_LIGHT);
  const sigBoxX = 140;
  doc.roundedRect(sigBoxX, footerY + 5, 56, 28, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_BLUE);
  doc.text('For ' + company.company_name.toUpperCase(), MARGIN_R, footerY + 10, { align: 'right' });
  // Signature line
  doc.setDrawColor(...BRAND_BLUE);
  doc.setLineWidth(0.4);
  doc.line(sigBoxX + 4, footerY + 28, MARGIN_R - 4, footerY + 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MID);
  doc.text('Authorized Signatory', MARGIN_R, footerY + 33, { align: 'right' });

  // Declaration
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...LIGHT);
  doc.text(
    'Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
    MARGIN_L, footerY + 40
  );

  // Powered by
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(200, 210, 230);
  doc.text('Powered by Ledgera', 105, 292, { align: 'center' });

  doc.save(fileName);
  return fileName;
}

export async function openWhatsAppInvoice(
  invoice: InvoiceWithDetails,
  company: Company,
  customer: Customer
) {
  if (!customer.whatsapp_number) throw new Error('Customer has no WhatsApp number');

  const fileName = generateInvoicePdf(invoice, company, customer);

  let phone = customer.whatsapp_number.replace(/\D/g, '');
  if (phone.length === 10) phone = `91${phone}`;
  if (phone.startsWith('0')) phone = `91${phone.slice(1)}`;

  function fmt(value: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 2,
    }).format(value);
  }

  const message = encodeURIComponent(
    `Hello ${customer.customer_name},\n\nPlease find attached Invoice #${invoice.invoice_number} for ${fmt(invoice.grand_total)}.\n\nThank you for your business!`
  );
  const nativeUrl = `whatsapp://send?phone=${phone}&text=${message}`;
  const webUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;

  if (window.electronAPI) {
    await window.electronAPI.openWhatsApp(nativeUrl, webUrl);
  } else {
    window.open(webUrl, '_blank', 'noopener,noreferrer');
  }

  return fileName;
}
