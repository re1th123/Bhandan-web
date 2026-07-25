# Bandhan ERP — Complete Cloud Schema & Architecture
### Multi-business, multi-user, always-online — full reference

---

## 1. Summary — What Actually Needs to Change

Grouped by category, this is the full checklist of changes from the current per-device SQLite schema to the cloud version.

**Identity & tenancy (entirely new)**
- [ ] Add `businesses` table (was implicit — one business per device)
- [ ] Add `users` table (was device-local PIN, not a real identity)
- [ ] Add `business_users` table (role-per-business membership; replaces `user_roles`)
- [ ] Remove `user_roles` (superseded)

**Primary keys & IDs**
- [ ] Convert every `id: Int (AutoGen)` → `id: UUID` across all ~30 tables
- [ ] Convert every foreign key from `Int` → `UUID` to match

**Tenant scoping**
- [ ] Add `business_id: UUID` (FK → businesses.id) to every existing table without exception
- [ ] Update every uniqueness constraint (SKU, account code, invoice number, bank account number, etc.) from globally-unique to unique-per-business

**Concurrency & auditability**
- [ ] Add `updated_at`, `version` (optimistic locking) to every table
- [ ] Replace free-text `createdBy: String` fields with real `created_by: UUID` (FK → users.id)
- [ ] Add `user_id: UUID` to `audit_logs` (was implicit)

**Numbering**
- [ ] Add `numbering_sequences` table (new) with an atomic, transaction-safe `next_document_number()` function — replaces client-side "read current number, add one" logic, which is unsafe under concurrent writers

**Accounting integrity**
- [ ] Drop the stored `balance` column on `chart_of_accounts` — always derive from `journal_entry_lines`
- [ ] Add a database-level trigger enforcing debit = credit per journal entry (previously only app-level validation)
- [ ] `financial_years` becomes per-business (was implicitly one FY calendar for the whole app)

**Security**
- [ ] Enable Row-Level Security on every table, policies keyed to `business_users` membership + role
- [ ] Real authentication (JWT/session) replacing device PIN as the access boundary

**Client-side (Android)**
- [ ] Room/SQLite demoted from source-of-truth to read cache only
- [ ] Local writes for financial documents go through the API/DB first, then update cache — no offline-optimistic writes for anything that posts to the GL

**New supporting tables needed for completeness** (referenced but not previously fully specified)
- [ ] `customers`, `suppliers` — master tables, now explicitly defined and tenant-scoped

---

## 2. Overall Architectural Components

```
                    ┌───────────────────┐        ┌───────────────────┐
                    │   Web Application  │        │  Android App       │
                    │  (Jetpack-style UI  │        │ (Jetpack Compose)  │
                    │   or React/etc.)    │        │  Room = cache only │
                    └─────────┬─────────┘        └─────────┬─────────┘
                              │                              │
                              │        Authenticated API calls (HTTPS)
                              └───────────────┬──────────────┘
                                              ▼
                          ┌──────────────────────────────────────┐
                          │         Auth Layer (JWT / Session)     │
                          │   Resolves: user_id + active business_id │
                          └──────────────────────┬─────────────────┘
                                                 ▼
                          ┌──────────────────────────────────────┐
                          │      Business Logic / Use Case Layer   │
                          │  CreateInvoiceUseCase · RecordPayment  │
                          │  GenerateJournalEntry · UpdateStock    │
                          │  CalculateGST · CloseFinancialYear     │
                          │  next_document_number() · ErpValidator │
                          │  (as Postgres functions / Edge Fns     │
                          │   or a thin API service layer)         │
                          └──────────────────────┬─────────────────┘
                                                 ▼
                          ┌──────────────────────────────────────┐
                          │     PostgreSQL (single source of truth)│
                          │  Row-Level Security enforces tenant +  │
                          │  role boundaries at the data layer     │
                          └──────────────────────────────────────┘
```

Key shift from the original architecture: the **Use Case layer moves from being purely inside the Android app to being shared/server-side** (Postgres functions, Edge Functions, or a small API service) — because it now has to produce the same correct result regardless of which client (web or Android) invoked it, for any business, for any authorized user.

---

## 3. Identity & Tenancy Layer (new)

```
businesses
  id                UUID (PK)
  name              String
  gstin             String?
  pan               String?
  address           String?
  phone             String?
  logo_url          String?
  fy_start_month    Int (default 4)
  default_currency  String (default "INR")
  is_active         Boolean
  created_at        Timestamp
  updated_at        Timestamp

users
  id                UUID (PK)             -- matches auth provider's identity
  full_name         String
  phone             String? (unique)
  email             String? (unique)
  is_active         Boolean
  created_at        Timestamp

business_users
  id                UUID (PK)
  business_id       UUID (FK -> businesses.id)
  user_id           UUID (FK -> users.id)
  role              String  ("Owner" | "Accountant" | "Employee")
  owner_label       String?   -- e.g. "Dad", "Uncle" — display only, not an access boundary
  is_active         Boolean
  invited_at        Timestamp
  joined_at         Timestamp?
  UNIQUE (business_id, user_id)
```

**Relationship:** one `user` can have many `business_users` rows (one per business they belong to); one `business` can have many `business_users` rows (its members). This many-to-many join is what makes "multi-business user" and per-business role differences both possible.

---

## 4. Global Convention (applied to every table below)

Every table in sections 5–11 carries these fields in addition to what's listed:

```
id            UUID (PK, default gen_random_uuid())
business_id   UUID (FK -> businesses.id)     -- tenant scoping, not nullable
created_by    UUID (FK -> users.id)
created_at    Timestamp
updated_at    Timestamp
version       Int (default 1)                -- optimistic concurrency
```

To keep this document readable, these six fields are **not repeated** in every table below — assume they're present on all of them.

---

## 5. Master Data

```
customers
  name              String
  gstin             String?
  address           String?
  phone             String?
  credit_limit      Numeric?
  payment_terms     String?
  price_list_id     UUID?
  category          String?
  is_active         Boolean

suppliers
  name              String
  gstin             String?
  pan               String?
  address           String?
  phone             String?
  payment_terms     String?
  category          String?
  is_active         Boolean

products
  name              String
  sku               String            -- UNIQUE (business_id, sku), not globally
  hsn_code          String?
  category          String?
  quantity          Int (derived/cached, see stock_ledgers as source of truth)
  wholesale_price   Numeric
  price             Numeric
  cost_price        Numeric
  min_stock_alert   Int
  warehouse_id      UUID? (FK -> warehouses.id, default location)
  unit_id           UUID?
  variants_json     Text?
  is_active         Boolean
  deleted_at        Timestamp?
  deleted_by        UUID?

warehouses
  name              String
  location          String?
  capacity          Numeric?
  is_active         Boolean
  deleted_at        Timestamp?
  deleted_by        UUID?
```

---

## 6. Accounting & General Ledger

```
chart_of_accounts
  code              String            -- UNIQUE (business_id, code)
  name              String
  category          String  ("Asset" | "Liability" | "Equity" | "Revenue" | "Expense")
  account_type      String  ("Cash" | "Bank" | "GST" | "Sales" | "Expense")
  parent_account_id UUID? (FK -> chart_of_accounts.id)   -- real FK now, was a string lookup
  is_active         Boolean
  -- NOTE: no stored `balance` column. Balance is always derived:
  --   SELECT SUM(debit_amount) - SUM(credit_amount)
  --   FROM journal_entry_lines WHERE account_id = ?

financial_years
  business_id       UUID (FK -> businesses.id)   -- per-business FY calendar
  name              String   -- e.g. "FY 2026-27"
  start_date        Date
  end_date          Date
  is_current        Boolean
  is_closed         Boolean
  is_locked         Boolean
  opening_date      Date?
  closing_date      Date?

journal_entries
  journal_number    String            -- UNIQUE (business_id, journal_number), via next_document_number()
  entry_date        Date
  voucher_type      String  ("Receipt" | "Payment" | "Journal" | "Purchase" | "Sales")
  reference_module  String
  reference_document_id UUID?
  narration         Text?
  financial_year_id UUID (FK -> financial_years.id)   -- real FK, was a free string

journal_entry_lines
  journal_id        UUID (FK -> journal_entries.id, ON DELETE CASCADE)
  account_id        UUID (FK -> chart_of_accounts.id)
  debit_amount      Numeric(14,2) default 0
  credit_amount     Numeric(14,2) default 0
  description       Text?
  -- CHECK: debit_amount = 0 OR credit_amount = 0 (a line is one or the other)
  -- DB TRIGGER: per journal_id, SUM(debit_amount) must equal SUM(credit_amount)
```

---

## 7. Inventory & Stock

```
stock_ledgers
  product_id        UUID (FK -> products.id)
  warehouse_id      UUID (FK -> warehouses.id)
  quantity          Numeric      -- movement qty, +/-
  before_quantity   Numeric
  after_quantity    Numeric
  reference_document String     -- linked voucher/document number
  movement_type     String  ("Opening" | "Purchase" | "Sales" | "TransferOut" | "TransferIn" | "Adjustment" | "Damage")
  reason            String?
  timestamp         Timestamp

inventory_transactions
  movement_type     String
  document          String
  warehouse_id      UUID (FK -> warehouses.id)
  product_id        UUID (FK -> products.id)
  quantity          Int
  unit_cost         Numeric
  valuation_method  String  ("FIFO" | "WeightedAverage")
  batch             String?
  lot               String?
  reason            String?
  approval_status   String
```

`stock_ledgers` remains the single source of truth for on-hand quantity — `products.quantity` is a cached/derived convenience column only, matching your existing GL-first principle applied to inventory as well.

---

## 8. Purchase-to-Pay Document Chain

```
purchase_orders
  supplier_id       UUID (FK -> suppliers.id)
  order_no          String        -- via next_document_number('PurchaseOrder', ...)
  date              Date
  items_json        Text
  total_amount      Numeric
  approval_status   String

goods_receipt_notes
  purchase_order_id UUID (FK -> purchase_orders.id)
  grn_no            String        -- via next_document_number('GRN', ...)
  date              Date
  items_json        Text
  received_by       UUID (FK -> users.id)
  status            String

purchase_invoices
  purchase_order_id UUID? (FK -> purchase_orders.id)
  grn_id            UUID? (FK -> goods_receipt_notes.id)
  invoice_no        String        -- via next_document_number('PurchaseInvoice', ...)
  supplier_id       UUID (FK -> suppliers.id)
  date              Date
  total_amount      Numeric
  gst_amount        Numeric
  items_json        Text
  payment_status    String

supplier_debit_notes
  purchase_invoice_id UUID (FK -> purchase_invoices.id)
  debit_note_no     String        -- via next_document_number('SupplierDebitNote', ...)
  reason            String
  items_json        Text
  gst_impact        Numeric

purchase_returns
  grn_id            UUID? (FK -> goods_receipt_notes.id)
  purchase_invoice_id UUID? (FK -> purchase_invoices.id)
  quantity_returned Numeric
  reason            String
  linked_debit_note_id UUID? (FK -> supplier_debit_notes.id)

supplier_payments
  supplier_id       UUID (FK -> suppliers.id)
  payment_no        String
  date              Date
  amount            Numeric
  payment_method    String
  bank_account_id   UUID (FK -> bank_accounts.id)
```

---

## 9. Order-to-Cash Document Chain

```
sales_orders
  customer_id       UUID (FK -> customers.id)
  order_no          String        -- via next_document_number('SalesOrder', ...)
  date              Date
  items_json        Text
  total_amount      Numeric
  approval_status   String

delivery_challans
  sales_order_id    UUID? (FK -> sales_orders.id)
  challan_no        String        -- via next_document_number('Challan', ...)
  date              Date
  items_json        Text
  dispatched_by     UUID (FK -> users.id)

tax_invoices
  sales_order_id    UUID? (FK -> sales_orders.id)
  challan_id        UUID? (FK -> delivery_challans.id)
  invoice_no        String        -- via next_document_number('TaxInvoice', ...)
  customer_id       UUID (FK -> customers.id)
  date              Date
  total_amount      Numeric
  gst_amount        Numeric
  items_json        Text
  payment_status    String

credit_notes
  tax_invoice_id    UUID (FK -> tax_invoices.id)
  credit_note_no    String        -- via next_document_number('CreditNote', ...)
  reason            String
  items_json        Text
  gst_impact        Numeric

sales_returns
  tax_invoice_id    UUID (FK -> tax_invoices.id)
  quantity_returned Numeric
  reason            String
  linked_credit_note_id UUID? (FK -> credit_notes.id)

customer_payments
  customer_id       UUID (FK -> customers.id)
  payment_no        String
  date              Date
  amount            Numeric
  payment_method    String
  bank_account_id   UUID (FK -> bank_accounts.id)
```

---

## 10. Payments & Allocation Engine

```
payments
  party_id          UUID           -- customer or supplier id
  party_type        String  ("Customer" | "Supplier")
  payment_no        String
  date              Date
  amount            Numeric
  payment_type      String  ("Receipt" | "Payment")
  bank_account_id   UUID (FK -> bank_accounts.id)
  is_allocated      Boolean
  narration         Text?

payment_allocations
  payment_id        UUID (FK -> payments.id)
  invoice_id        UUID           -- polymorphic: purchase_invoices.id or tax_invoices.id
  invoice_type      String  ("PurchaseInvoice" | "TaxInvoice")
  allocated_amount  Numeric
  date              Date
```

---

## 11. Banking, Financial Governance & Numbering

```
bank_accounts
  bank_name         String
  branch            String?
  account_number    String        -- UNIQUE (business_id, account_number)
  ifsc              String?
  opening_balance   Numeric
  current_balance   Numeric        -- consider deriving from bank ledger movements rather than storing, for the same drift-prevention reason as chart_of_accounts
  upi_id            String?
  qr_code           String?
  status            String

opening_balances
  entity_type       String  ("Customer" | "Supplier" | "Product" | "Cash" | "Bank" | "GLAccount")
  entity_id         UUID
  financial_year_id UUID (FK -> financial_years.id)
  opening_debit     Numeric
  opening_credit    Numeric

accounting_periods
  financial_year_id UUID (FK -> financial_years.id)
  period_label      String   -- e.g. "2026-07"
  is_closed         Boolean
  is_locked         Boolean

numbering_sequences   -- NEW
  document_type     String   ("PurchaseOrder" | "GRN" | "PurchaseInvoice" | "SalesOrder" |
                               "Challan" | "TaxInvoice" | "CreditNote" | "SupplierDebitNote" |
                               "PaymentVoucher" | "JournalVoucher")
  financial_year_id UUID (FK -> financial_years.id)
  prefix            String
  current_number    BigInt
  UNIQUE (business_id, document_type, financial_year_id)

audit_logs
  module            String
  entity_name       String
  entity_id         UUID
  action            String   ("Create" | "Update" | "Delete")
  old_value_json    Text?
  new_value_json    Text?
  user_id           UUID (FK -> users.id)   -- real FK now, was a loosely-tracked string
  timestamp         Timestamp

approvals
  entity_type       String
  entity_id         UUID
  approver_user_id  UUID (FK -> users.id)
  status            String  ("Pending" | "Approved" | "Rejected")
  comment           Text?
  decided_at        Timestamp?

attachments
  entity_type       String
  entity_id         UUID
  file_url          String
  uploaded_by       UUID (FK -> users.id)

reminders
  type              String
  entity_id         UUID?
  due_date          Date
  is_dismissed      Boolean

backup_histories
  -- Note: with an always-online cloud DB as source of truth, this table's role shifts
  -- from "device backup log" to "cloud DB snapshot/export log" (e.g., scheduled pg_dump
  -- or managed-provider backups) — still worth tracking for the same restore-tested discipline.
  backup_type       String
  destination       String
  status            String
  file_size         BigInt?
  timestamp         Timestamp
```

---

## 12. Key Entity Relationships

```
                         ┌───────────────┐
                         │   businesses   │
                         └───────┬───────┘
                                 │ 1 : N (every table below)
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐   ┌──────────────────┐    ┌──────────────────┐
│ business_users   │   │  chart_of_accounts│    │   customers /     │
│ (join: user+role) │   │                    │    │   suppliers        │
└────────┬─────────┘   └─────────┬──────────┘    └─────────┬─────────┘
         │ N : 1                 │ 1 : N                    │ 1 : N
         ▼                       ▼                           ▼
┌─────────────────┐    ┌──────────────────┐         ┌──────────────────┐
│      users        │    │ journal_entry_line │         │  sales_orders /    │
└──────────────────┘    │ (debit/credit rows) │         │  purchase_orders    │
                         └─────────┬──────────┘         └─────────┬─────────┘
                                   │ N : 1                          │
                                   ▼                                ▼
                         ┌──────────────────┐          ┌──────────────────────┐
                         │  journal_entries   │◄─────────┤ tax_invoices /         │
                         │  (1 journal : N     │ Generates │ purchase_invoices      │
                         │   lines, must balance)         │ (financial documents)   │
                         └──────────────────┘          └──────────┬───────────┘
                                                                   │ N : 1
                                                                   ▼
                                                        ┌──────────────────┐
                                                        │     payments       │
                                                        │        │            │
                                                        │        ▼            │
                                                        │ payment_allocations │
                                                        │ (1 payment : N       │
                                                        │  invoices settled)   │
                                                        └──────────────────┘

                    ┌──────────────────┐
                    │  products          │
                    └─────────┬─────────┘
                              │ 1 : N
                              ▼
                    ┌──────────────────┐
                    │  stock_ledgers     │  ◄── written by every Purchase/GRN/Sale/Challan/Adjustment,
                    │  (source of truth   │      never mutated directly
                    │   for on-hand qty)  │
                    └──────────────────┘
```

**Core rules (unchanged in spirit, now enforced at the DB layer where noted):**
- **Tenant isolation:** every row belongs to exactly one `business_id`; RLS makes cross-business access structurally impossible, not just an application convention.
- **Double-Entry Equilibrium:** every `journal_entries` row's child `journal_entry_lines` must sum to `debit = credit` — now a DB trigger, not only a Kotlin use case.
- **Stock Movement Rule:** stock quantity is never mutated directly; every change is a logged `stock_ledgers` row (unchanged from original design).
- **Payment Allocation Rule:** one `payments` row can settle multiple invoices via `payment_allocations` (unchanged).
- **Numbering Rule (new):** every document number is issued via the atomic `next_document_number()` function inside the same transaction as the document insert — never computed client-side.

---

## 13. Enterprise Architecture Summary

- **Single source of truth:** PostgreSQL, always-online. Room/SQLite on Android is a cache, not authoritative.
- **Tenant + role security enforced at the data layer:** Row-Level Security policies keyed on `business_users`, not just UI-level restrictions — the "Employee sees attendance only" boundary and equivalents now hold even if a client is compromised or buggy.
- **Business logic centralized:** Use Cases (invoice creation, journal generation, GST calculation, period close) live server-side (Postgres functions/Edge Functions or a thin API service) so web and Android always get identical, non-duplicated behavior.
- **Concurrency handled via optimistic locking (`version`) + atomic sequence functions**, not offline conflict-merge — appropriate specifically because always-online was confirmed as acceptable.
- **Auditability strengthened:** every table's `created_by`/`audit_logs.user_id` is now a real identity FK, not a loosely-tracked string, meaningful across multiple real users and devices.
- **GL-first and document-chain discipline preserved and hardened:** derived balances instead of stored ones, and a DB-level debit=credit trigger, make the two founding architectural principles harder to violate than they were even in the original single-device design.
