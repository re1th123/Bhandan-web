-- ============================================================================
-- BANDHAN ERP — SUPABASE DATABASE SETUP, RLS POLICIES & SEED DATA
-- Copy and run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wwxicktggkobdyuvgilb/sql/new
-- ============================================================================

-- 1. DISABLE OR ALLOW PUBLIC RLS FOR ERP TABLES
ALTER TABLE IF EXISTS public.businesses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow public insert on businesses" ON public.businesses;
CREATE POLICY "Allow public read access on businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on businesses" ON public.businesses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on businesses" ON public.businesses FOR UPDATE USING (true);

ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert on customers" ON public.customers;
CREATE POLICY "Allow public read access on customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on customers" ON public.customers FOR UPDATE USING (true);

ALTER TABLE IF EXISTS public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public insert on suppliers" ON public.suppliers;
CREATE POLICY "Allow public read access on suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on suppliers" ON public.suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on suppliers" ON public.suppliers FOR UPDATE USING (true);

ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert on products" ON public.products;
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert on products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on products" ON public.products FOR UPDATE USING (true);

ALTER TABLE IF EXISTS public.warehouses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on warehouses" ON public.warehouses;
DROP POLICY IF EXISTS "Allow public insert on warehouses" ON public.warehouses;
CREATE POLICY "Allow public read access on warehouses" ON public.warehouses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on warehouses" ON public.warehouses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on warehouses" ON public.warehouses FOR UPDATE USING (true);

-- 2. SEED BUSINESS MASTER DATA
INSERT INTO public.businesses (id, name, gstin, pan, phone, address, logo_url)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'Bandhan Wholesale Ltd',
  '27AABCB1234D1ZB',
  'AABCB1234D',
  '+91 98765 43210',
  'Plot 42, Industrial Wholesale Market, Sector 18, Mumbai, MH - 400705',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, gstin = EXCLUDED.gstin, phone = EXCLUDED.phone, address = EXCLUDED.address;

-- 3. SEED WAREHOUSES
INSERT INTO public.warehouses (id, business_id, name, location, capacity, is_active)
VALUES 
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Main Godown (Bhiwandi)', 'Bhiwandi Warehouse Hub, Thane', 50000, true),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Central Distribution Depot', 'Taloja MIDC, Navi Mumbai', 35000, true),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Vashi Wholesale Outlet', 'APMC Market, Vashi', 15000, true)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED CUSTOMERS
INSERT INTO public.customers (id, business_id, name, gstin, phone, address, credit_limit, payment_terms, category, is_active)
VALUES
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Rajesh Building Supplies', '27AAACR1234A1Z1', '+91 98200 11223', '12 Station Road, Kurla, Mumbai', 500000, 30, 'Wholesaler', true),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Gupta Hardware Store', '27AAACG5678B1Z2', '+91 98200 44556', 'Shop 5, Link Road, Andheri West, Mumbai', 300000, 15, 'Retailer', true),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Sharma Electricals', '27AAACS9012C1Z3', '+91 98200 77889', 'Market Yard, Pune, MH', 250000, 30, 'Distributor', true),
  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Apex Infrastructure Pvt Ltd', '27AAACA3456D1Z4', '+91 98200 99000', 'Bandra Kurla Complex, Mumbai', 1500000, 45, 'Corporate Contractor', true)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED SUPPLIERS
INSERT INTO public.suppliers (id, business_id, name, gstin, pan, phone, address, payment_terms, category, is_active)
VALUES
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'UltraTech Cement Ltd', '27AAACU1111A1Z1', 'AAACU1111A', '+91 22 6600 0000', 'Andheri East, Mumbai', '15 Days', 'Cement', true),
  ('d0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Tata Steel Industries Ltd', '27AAACT2222B1Z2', 'AAACT2222B', '+91 22 6655 8899', 'Fort, Mumbai', '30 Days', 'Steel', true),
  ('d0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Asian Paints India Ltd', '27AAACA3333C1Z3', 'AAACA3333C', '+91 22 6218 1000', 'Santacruz East, Mumbai', '21 Days', 'Paints', true)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED PRODUCTS
INSERT INTO public.products (id, business_id, sku, name, hsn_code, category, price, wholesale_price, cost_price, min_stock_alert, warehouse_id, is_active)
VALUES
  ('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'CEM-PPC-001', 'UltraTech PPC Cement Bag (50kg)', '25232910', 'Cement', 380, 360, 330, 500, 'b0000000-0000-4000-8000-000000000001', true),
  ('e0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'STL-TMT-12M', 'Tata Tiscon 550SD TMT Rebars 12mm', '72142090', 'Steel', 62000, 59500, 54000, 20, 'b0000000-0000-4000-8000-000000000001', true),
  ('e0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'PNT-ROY-20L', 'Asian Paints Royale Emulsion White 20L', '32091090', 'Paints', 4800, 4400, 3900, 30, 'b0000000-0000-4000-8000-000000000002', true),
  ('e0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'ELE-WIR-2.5', 'Finolex FR PVC Insulated Wire 2.5 sq mm', '85444999', 'Electricals', 1950, 1750, 1500, 100, 'b0000000-0000-4000-8000-000000000002', true)
ON CONFLICT (id) DO NOTHING;
