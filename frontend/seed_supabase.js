const SUPABASE_REST_URL = 'https://wwxicktggkobdyuvgilb.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3eGlja3RnZ2tvYmR5dXZnaWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5Mzc2MzAsImV4cCI6MjEwMDUxMzYzMH0.4SvbnxCXzjwdg9auN_7hVMABCmj8-c5a8mCkZc69MHc';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates,return=representation'
};

const BUSINESS_ID = 'b0000000-0000-0000-0000-000000000001';

async function upsert(table, records) {
  console.log(`\n⏳ Upserting into ${table}...`);
  try {
    const res = await fetch(`${SUPABASE_REST_URL}/${table}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(records)
    });
    
    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ Error on ${table} (${res.status}):`, errText);
      return false;
    }
    
    const data = await res.json();
    console.log(`✅ ${table}: Upserted ${data.length || records.length} records successfully!`);
    return true;
  } catch (err) {
    console.error(`❌ Network error on ${table}:`, err.message);
    return false;
  }
}

async function seedDatabase() {
  console.log('====================================================');
  console.log('🚀 Bandhan ERP Cloud Supabase Direct REST Seeder');
  console.log('====================================================');

  // 1. Businesses
  await upsert('businesses', [{
    id: BUSINESS_ID,
    name: 'Bandhan Wholesale Ltd',
    gstin: '27AABCB1234D1ZB',
    pan: 'AABCB1234D',
    email: 'contact@bandhanwholesale.com',
    phone: '+91 98765 43210',
    address: 'Plot 42, Industrial Wholesale Market, Sector 18, Mumbai, MH - 400705',
    logo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80',
    currency: 'INR',
    financial_year_start: '2025-04-01',
    is_active: true
  }]);

  // 2. Warehouses
  await upsert('warehouses', [
    { id: 'w0000000-0000-0000-0000-000000000001', business_id: BUSINESS_ID, name: 'Main Godown (Bhiwandi)', location: 'Bhiwandi Warehouse Hub, Thane', capacity: 50000, is_active: true },
    { id: 'w0000000-0000-0000-0000-000000000002', business_id: BUSINESS_ID, name: 'Central Distribution Center', location: 'Taloja MIDC, Navi Mumbai', capacity: 35000, is_active: true },
    { id: 'w0000000-0000-0000-0000-000000000003', business_id: BUSINESS_ID, name: 'Retail Outlet Depot', location: 'APMC Market, Vashi', capacity: 15000, is_active: true }
  ]);

  // 3. Customers
  await upsert('customers', [
    { id: 'c0000000-0000-0000-0000-000000000001', business_id: BUSINESS_ID, name: 'Rajesh Building Supplies', gstin: '27AAACR1234A1Z1', phone: '+91 98200 11223', email: 'rajesh@buildingsupplies.com', address: '12 Station Road, Kurla, Mumbai', credit_limit: 500000, payment_terms: 30, category: 'Wholesaler', is_active: true },
    { id: 'c0000000-0000-0000-0000-000000000002', business_id: BUSINESS_ID, name: 'Gupta Hardware Store', gstin: '27AAACG5678B1Z2', phone: '+91 98200 44556', email: 'guptahardware@gmail.com', address: 'Shop 5, Link Road, Andheri West, Mumbai', credit_limit: 300000, payment_terms: 15, category: 'Retailer', is_active: true },
    { id: 'c0000000-0000-0000-0000-000000000003', business_id: BUSINESS_ID, name: 'Sharma Electricals', gstin: '27AAACS9012C1Z3', phone: '+91 98200 77889', email: 'sales@sharmaelectricals.in', address: 'Market Yard, Pune, MH', credit_limit: 250000, payment_terms: 30, category: 'Distributor', is_active: true },
    { id: 'c0000000-0000-0000-0000-000000000004', business_id: BUSINESS_ID, name: 'Apex Infrastructure Pvt Ltd', gstin: '27AAACA3456D1Z4', phone: '+91 98200 99000', email: 'procurement@apexinfratech.com', address: 'Bandra Kurla Complex, Mumbai', credit_limit: 1500000, payment_terms: 45, category: 'Corporate Contractor', is_active: true },
    { id: 'c0000000-0000-0000-0000-000000000005', business_id: BUSINESS_ID, name: 'Metro Mart Mega Store', gstin: '27AAACM7890E1Z5', phone: '+91 98200 33445', email: 'billing@metromart.com', address: 'MG Road, Nashik, MH', credit_limit: 800000, payment_terms: 30, category: 'Supermarket Chain', is_active: true }
  ]);

  // 4. Suppliers
  await upsert('suppliers', [
    { id: 's0000000-0000-0000-0000-000000000001', business_id: BUSINESS_ID, name: 'UltraTech Cement Ltd', gstin: '27AAACU1111A1Z1', pan: 'AAACU1111A', phone: '+91 22 6600 0000', email: 'orders@ultratechcement.com', address: 'Ahura Centre, Andheri East, Mumbai', payment_terms: '15 Days', category: 'Cement', is_active: true },
    { id: 's0000000-0000-0000-0000-000000000002', business_id: BUSINESS_ID, name: 'Tata Steel Industries Ltd', gstin: '27AAACT2222B1Z2', pan: 'AAACT2222B', phone: '+91 22 6655 8899', email: 'sales@tatasteel.com', address: 'Bombay House, Fort, Mumbai', payment_terms: '30 Days', category: 'Steel & Metals', is_active: true },
    { id: 's0000000-0000-0000-0000-000000000003', business_id: BUSINESS_ID, name: 'Asian Paints India Ltd', gstin: '27AAACA3333C1Z3', pan: 'AAACA3333C', phone: '+91 22 6218 1000', email: 'corporate@asianpaints.com', address: 'Vakola, Santacruz East, Mumbai', payment_terms: '21 Days', category: 'Paints & Coatings', is_active: true },
    { id: 's0000000-0000-0000-0000-000000000004', business_id: BUSINESS_ID, name: 'Havells India Corporation', gstin: '27AAACH4444D1Z4', pan: 'AAACH4444D', phone: '+91 120 4771000', email: 'wholesale@havells.com', address: 'QRG Towers, Noida, UP', payment_terms: '30 Days', category: 'Electricals', is_active: true }
  ]);

  // 5. Products
  await upsert('products', [
    { id: 'p0000000-0000-0000-0000-000000000001', business_id: BUSINESS_ID, sku: 'CEM-PPC-001', name: 'UltraTech PPC Cement Bag (50kg)', hsn_code: '25232910', category: 'Cement', price: 380, wholesale_price: 360, cost_price: 330, min_stock_alert: 500, warehouse_id: 'w0000000-0000-0000-0000-000000000001', is_active: true },
    { id: 'p0000000-0000-0000-0000-000000000002', business_id: BUSINESS_ID, sku: 'STL-TMT-12M', name: 'Tata Tiscon 550SD TMT Rebars 12mm', hsn_code: '72142090', category: 'Steel', price: 62000, wholesale_price: 59500, cost_price: 54000, min_stock_alert: 20, warehouse_id: 'w0000000-0000-0000-0000-000000000001', is_active: true },
    { id: 'p0000000-0000-0000-0000-000000000003', business_id: BUSINESS_ID, sku: 'PNT-ROY-20L', name: 'Asian Paints Royale Emulsion White 20L', hsn_code: '32091090', category: 'Paints', price: 4800, wholesale_price: 4400, cost_price: 3900, min_stock_alert: 30, warehouse_id: 'w0000000-0000-0000-0000-000000000002', is_active: true },
    { id: 'p0000000-0000-0000-0000-000000000004', business_id: BUSINESS_ID, sku: 'ELE-WIR-2.5', name: 'Finolex FR PVC Insulated Wire 2.5 sq mm', hsn_code: '85444999', category: 'Electricals', price: 1950, wholesale_price: 1750, cost_price: 1500, min_stock_alert: 100, warehouse_id: 'w0000000-0000-0000-0000-000000000002', is_active: true },
    { id: 'p0000000-0000-0000-0000-000000000005', business_id: BUSINESS_ID, sku: 'ELE-SWT-MOD', name: 'Havells Modular 6A Switch White', hsn_code: '85365090', category: 'Electricals', price: 85, wholesale_price: 72, cost_price: 58, min_stock_alert: 200, warehouse_id: 'w0000000-0000-0000-0000-000000000003', is_active: true }
  ]);

  // 6. Tax Invoices
  await upsert('tax_invoices', [
    { id: 'i0000000-0000-0000-0000-000000000001', business_id: BUSINESS_ID, invoice_no: 'TAX-2025-001', customer_id: 'c0000000-0000-0000-0000-000000000001', date: '2025-07-20', total_amount: 147600, gst_amount: 22515, payment_status: 'Paid', created_at: new Date().toISOString() },
    { id: 'i0000000-0000-0000-0000-000000000002', business_id: BUSINESS_ID, invoice_no: 'TAX-2025-002', customer_id: 'c0000000-0000-0000-0000-000000000002', date: '2025-07-22', total_amount: 88500, gst_amount: 13500, payment_status: 'Partial', created_at: new Date().toISOString() },
    { id: 'i0000000-0000-0000-0000-000000000003', business_id: BUSINESS_ID, invoice_no: 'TAX-2025-003', customer_id: 'c0000000-0000-0000-0000-000000000003', date: '2025-07-24', total_amount: 236000, gst_amount: 36000, payment_status: 'Unpaid', created_at: new Date().toISOString() }
  ]);

  // 7. Purchase Invoices
  await upsert('purchase_invoices', [
    { id: 'pi000000-0000-0000-0000-000000000001', business_id: BUSINESS_ID, invoice_no: 'PINV-2025-010', supplier_id: 's0000000-0000-0000-0000-000000000001', date: '2025-07-15', total_amount: 389400, gst_amount: 59400, payment_status: 'Paid', created_at: new Date().toISOString() },
    { id: 'pi000000-0000-0000-0000-000000000002', business_id: BUSINESS_ID, invoice_no: 'PINV-2025-011', supplier_id: 's0000000-0000-0000-0000-000000000002', date: '2025-07-18', total_amount: 702100, gst_amount: 107100, payment_status: 'Unpaid', created_at: new Date().toISOString() }
  ]);

  console.log('\n🎉 ALL TABLES POPULATED IN SUPABASE CLOUD DATABASE!');
}

seedDatabase();
