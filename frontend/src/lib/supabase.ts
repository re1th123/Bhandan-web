import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wwxicktggkobdyuvgilb.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3eGlja3RnZ2tvYmR5dXZnaWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5Mzc2MzAsImV4cCI6MjEwMDUxMzYzMH0.4SvbnxCXzjwdg9auN_7hVMABCmj8-c5a8mCkZc69MHc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      businesses: { Row: Business; Insert: Partial<Business>; Update: Partial<Business> };
      customers: { Row: Customer; Insert: Partial<Customer>; Update: Partial<Customer> };
      suppliers: { Row: Supplier; Insert: Partial<Supplier>; Update: Partial<Supplier> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      tax_invoices: { Row: TaxInvoice; Insert: Partial<TaxInvoice>; Update: Partial<TaxInvoice> };
      purchase_invoices: { Row: PurchaseInvoice; Insert: Partial<PurchaseInvoice>; Update: Partial<PurchaseInvoice> };
      journal_entries: { Row: JournalEntry; Insert: Partial<JournalEntry>; Update: Partial<JournalEntry> };
      chart_of_accounts: { Row: ChartOfAccount; Insert: Partial<ChartOfAccount>; Update: Partial<ChartOfAccount> };
      stock_ledgers: { Row: StockLedger; Insert: Partial<StockLedger>; Update: Partial<StockLedger> };
      payments: { Row: Payment; Insert: Partial<Payment>; Update: Partial<Payment> };
      financial_years: { Row: FinancialYear; Insert: Partial<FinancialYear>; Update: Partial<FinancialYear> };
    };
  };
};

export interface Business {
  id: string;
  name: string;
  gstin?: string;
  pan?: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  fy_start_month: number;
  default_currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  gstin?: string;
  address?: string;
  phone?: string;
  credit_limit?: number;
  payment_terms?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  business_id: string;
  name: string;
  gstin?: string;
  pan?: string;
  address?: string;
  phone?: string;
  payment_terms?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  sku: string;
  hsn_code?: string;
  category?: string;
  wholesale_price?: number;
  price?: number;
  cost_price?: number;
  min_stock_alert?: number;
  warehouse_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxInvoice {
  id: string;
  business_id: string;
  sales_order_id?: string;
  challan_id?: string;
  invoice_no: string;
  customer_id: string;
  date: string;
  total_amount: number;
  gst_amount: number;
  items_json: string;
  payment_status: string;
  created_at: string;
}

export interface PurchaseInvoice {
  id: string;
  business_id: string;
  purchase_order_id?: string;
  grn_id?: string;
  invoice_no: string;
  supplier_id: string;
  date: string;
  total_amount: number;
  gst_amount: number;
  items_json: string;
  payment_status: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  business_id: string;
  journal_number: string;
  entry_date: string;
  voucher_type: 'Receipt' | 'Payment' | 'Journal' | 'Purchase' | 'Sales';
  reference_module?: string;
  narration?: string;
  financial_year_id: string;
  created_at: string;
}

export interface ChartOfAccount {
  id: string;
  business_id: string;
  code: string;
  name: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  account_type: string;
  parent_account_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface StockLedger {
  id: string;
  business_id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  before_quantity: number;
  after_quantity: number;
  reference_document: string;
  movement_type: string;
  timestamp: string;
}

export interface Payment {
  id: string;
  business_id: string;
  party_id: string;
  party_type: 'Customer' | 'Supplier';
  payment_no: string;
  date: string;
  amount: number;
  payment_type: 'Receipt' | 'Payment';
  bank_account_id: string;
  is_allocated: boolean;
  narration?: string;
  created_at: string;
}

export interface FinancialYear {
  id: string;
  business_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_closed: boolean;
  is_locked: boolean;
}

export default supabase;
