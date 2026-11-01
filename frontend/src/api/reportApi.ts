import { apiClient } from './apiClient';

export interface MonthlySummaryData {
  period: { year: number; month: number; startDate: string; endDate: string };
  sales: {
    total: number;
    subtotal: number;
    cgst: number;
    sgst: number;
    discount: number;
    invoiceCount: number;
    paidCount: number;
    sentCount: number;
    draftCount: number;
  };
  expenses: {
    total: number;
    count: number;
    byCategory: Record<string, number>;
  };
  profit: number;
  topCustomers: { customer_id: number; customer_name: string; total: number; count: number }[];
  topProducts: { product_name: string; quantity: number; revenue: number; gst_amount: number }[];
}

export const reportApi = {
  getMonthlySummary(params: { companyId?: number; year: number; month: number }) {
    const search = new URLSearchParams();
    if (params.companyId) search.set('companyId', String(params.companyId));
    search.set('year', String(params.year));
    search.set('month', String(params.month));
    return apiClient.get<{ success: boolean; data: MonthlySummaryData }>(
      `/reports/monthly-summary?${search.toString()}`
    );
  },
};
