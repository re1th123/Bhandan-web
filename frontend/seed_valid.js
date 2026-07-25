const SUPABASE_REST_URL = 'https://wwxicktggkobdyuvgilb.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3eGlja3RnZ2tvYmR5dXZnaWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5Mzc2MzAsImV4cCI6MjEwMDUxMzYzMH0.4SvbnxCXzjwdg9auN_7hVMABCmj8-c5a8mCkZc69MHc';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates,return=representation'
};

const BIZ_ID = 'a0000000-0000-4000-8000-000000000001';

async function upsert(table, records) {
  console.log(`\n⏳ Seeding ${table}...`);
  const res = await fetch(`${SUPABASE_REST_URL}/${table}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(records)
  });

  const text = await res.text();
  if (res.ok) {
    console.log(`✅ ${table} seeded! Output:`, text.substring(0, 150));
  } else {
    console.error(`❌ ${table} Error (${res.status}):`, text);
  }
}

async function run() {
  // 1. Business
  await upsert('businesses', [{
    id: BIZ_ID,
    name: 'Bandhan Wholesale Ltd',
    gstin: '27AABCB1234D1ZB',
    pan: 'AABCB1234D',
    phone: '+91 98765 43210',
    address: 'Plot 42, Industrial Wholesale Market, Sector 18, Mumbai, MH',
    logo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80'
  }]);

  // 2. Warehouses
  await upsert('warehouses', [
    { id: 'b0000000-0000-4000-8000-000000000001', business_id: BIZ_ID, name: 'Main Godown (Bhiwandi)', location: 'Bhiwandi Hub, Thane', capacity: 50000, is_active: true },
    { id: 'b0000000-0000-4000-8000-000000000002', business_id: BIZ_ID, name: 'Central Distribution Depot', location: 'Taloja MIDC, Navi Mumbai', capacity: 35000, is_active: true },
    { id: 'b0000000-0000-4000-8000-000000000003', business_id: BIZ_ID, name: 'Vashi Wholesale Outlet', location: 'APMC Market, Vashi', capacity: 15000, is_active: true }
  ]);

  // 3. Customers
  await upsert('customers', [
    { id: 'c0000000-0000-4000-8000-000000000001', business_id: BIZ_ID, name: 'Rajesh Building Supplies', gstin: '27AAACR1234A1Z1', phone: '+91 98200 11223', address: '12 Station Road, Kurla, Mumbai', credit_limit: 500000, payment_terms: 30, category: 'Wholesaler', is_active: true },
    { id: 'c0000000-0000-4000-8000-000000000002', business_id: BIZ_ID, name: 'Gupta Hardware Store', gstin: '27AAACG5678B1Z2', phone: '+91 98200 44556', address: 'Shop 5, Link Road, Andheri West, Mumbai', credit_limit: 300000, payment_terms: 15, category: 'Retailer', is_active: true },
    { id: 'c0000000-0000-4000-8000-000000000003', business_id: BIZ_ID, name: 'Sharma Electricals', gstin: '27AAACS9012C1Z3', phone: '+91 98200 77889', address: 'Market Yard, Pune, MH', credit_limit: 250000, payment_terms: 30, category: 'Distributor', is_active: true },
    { id: 'c0000000-0000-0000-0000-000000000004', business_id: BIZ_ID, name: 'Apex Infrastructure Pvt Ltd', gstin: '27AAACA3456D1Z4', phone: '+91 98200 99000', address: 'Bandra Kurla Complex, Mumbai', credit_limit: 1500000, payment_terms: 45, category: 'Corporate Contractor', is_active: true }
  ]);

  // 4. Suppliers
  await upsert('suppliers', [
    { id: 'd0000000-0000-4000-8000-000000000001', business_id: BIZ_ID, name: 'UltraTech Cement Ltd', gstin: '27AAACU1111A1Z1', pan: 'AAACU1111A', phone: '+91 22 6600 0000', address: 'Andheri East, Mumbai', payment_terms: '15 Days', category: 'Cement', is_active: true },
    { id: 'd0000000-0000-4000-8000-000000000002', business_id: BIZ_ID, name: 'Tata Steel Industries Ltd', gstin: '27AAACT2222B1Z2', pan: 'AAACT2222B', phone: '+91 22 6655 8899', address: 'Fort, Mumbai', payment_terms: '30 Days', category: 'Steel', is_active: true },
    { id: 'd0000000-0000-4000-8000-000000000003', business_id: BIZ_ID, name: 'Asian Paints India Ltd', gstin: '27AAACA3333C1Z3', pan: 'AAACA3333C', phone: '+91 22 6218 1000', address: 'Santacruz East, Mumbai', payment_terms: '21 Days', category: 'Paints', is_active: true }
  ]);

  // 5. Products
  await upsert('products', [
    { id: 'e0000000-0000-4000-8000-000000000001', business_id: BIZ_ID, sku: 'CEM-PPC-001', name: 'UltraTech PPC Cement Bag (50kg)', hsn_code: '25232910', category: 'Cement', price: 380, wholesale_price: 360, cost_price: 330, min_stock_alert: 500, warehouse_id: 'b0000000-0000-4000-8000-000000000001', is_active: true },
    { id: 'e0000000-0000-4000-8000-000000000002', business_id: BIZ_ID, sku: 'STL-TMT-12M', name: 'Tata Tiscon 550SD TMT Rebars 12mm', hsn_code: '72142090', category: 'Steel', price: 62000, wholesale_price: 59500, cost_price: 54000, min_stock_alert: 20, warehouse_id: 'b0000000-0000-4000-8000-000000000001', is_active: true },
    { id: 'e0000000-0000-4000-8000-000000000003', business_id: BIZ_ID, sku: 'PNT-ROY-20L', name: 'Asian Paints Royale Emulsion White 20L', hsn_code: '32091090', category: 'Paints', price: 4800, wholesale_price: 4400, cost_price: 3900, min_stock_alert: 30, warehouse_id: 'b0000000-0000-4000-8000-000000000002', is_active: true },
    { id: 'e0000000-0000-4000-8000-000000000004', business_id: BIZ_ID, sku: 'ELE-WIR-2.5', name: 'Finolex FR PVC Insulated Wire 2.5 sq mm', hsn_code: '85444999', category: 'Electricals', price: 1950, wholesale_price: 1750, cost_price: 1500, min_stock_alert: 100, warehouse_id: 'b0000000-0000-4000-8000-000000000002', is_active: true }
  ]);
}

run();
