# Bandhan ERP — Modern Enterprise-Grade Wholesale Business Management System

**Bandhan ERP** is a full-featured, offline-first ERP web and mobile application designed specifically for family-owned wholesale businesses. Built with a modern tech stack (React 18, TypeScript, Material 3 design system with MUI v5, Recharts analytics, Framer Motion animations, and Supabase integration with resilient offline mock fallbacks), Bandhan ERP delivers executive cockpits for Sales, Customers, Inventory, Procurement, Suppliers, Employees, Finance, and Business Operations.

---

## ⚡ Navigation Optimization

* **Single-Tap Executive Navigation**: Tapping any left navigation section (**Sales**, **Purchases**, **Employees**, **Inventory**, **Suppliers**, **Finance**, **Reports**, **Settings**) automatically expands the section and **instantly loads the corresponding dashboard** without requiring extra clicks.
* **Instant Content Visibility**: Reduces unnecessary navigation steps, ensuring effortless interaction for business owners and managers.

---

## 🌟 Executive Dashboards & Key Modules

### 1. 👥 Customer Dashboard (`/sales/customers-dashboard` & `/customers`)
Serves as the **Customer Relationship & Accounts Receivable Control Center**, focused on customer financial health, wholesale sales relationships, daily payment collections, credit limit enforcement, customer loans, and business intelligence.

* **Top App Bar**: Title "Customer Dashboard", Live Date (`Saturday, July 25, 2026`), Search bar for customers, GSTINs, and phone numbers, Notification bell, Filter drawer trigger with active counter chip, Manual refresh action, and Empty Demo preview toggle.
* **8 Customer KPI Cards**:
  * **Total Customers**: 340 Total accounts (`312 Active`, `28 New this month`, `28 Inactive`).
  * **Total Accounts Receivable**: `₹14,20,000` outstanding customer balance, `₹4,80,000` overdue, `78.4%` collection rate.
  * **Today's Collections**: `₹1,85,400` collected today across 18 payments (`+14.2%` vs yesterday).
  * **Monthly Customer Revenue**: `₹38,50,000` total sales revenue across 240 invoices (`+15.6%` growth).
  * **Pending Invoices**: 32 Unpaid invoices worth `₹14,20,000` with 18 days avg days outstanding.
  * **Credit Limit Alerts**: 15 Customers over credit limit, 45 near limit.
  * **Customer Loans**: 8 Active customer financing loans worth `₹4,50,000` outstanding (`₹38,500` interest earned).
  * **Customer Retention**: `91.7%` retention rate with 312 repeat buyers.
* **Quick Customer Operations Bar**: Action buttons for Add Customer, Create Sales Invoice, Record Customer Payment, Customer Ledger, Customer Statement, Customer Report, Compare Accounts, and Customer Loans.
* **Customer Overview & Segmentation Directory**: Summary cards for Wholesale Customers (180), Retail Supermarkets (90), VIP Accounts (40), High Risk Overdue (15), and Inactive >90 Days (15).
* **Top Customer Accounts & Credit Limit Gauges**: Top B2B buyer cards featuring tier badges (**VIP Platinum**, **Gold Partner**, **Silver Retail**), purchase volume, balance, credit limit progress meters, and quick action buttons.
* **Overdue Accounts Receivable & Collection Modal**: Unpaid receivables table highlighting days overdue, credit limit status, and direct **Record Customer Payment** modal dialog.
* **Customer Loans & Repayments Table**: Active customer loans table (Principal, Outstanding Loan, Accrued Interest, Next Due Date) with direct **Record Repayment** modal dialog.
* **Revenue Analytics & Payment Channels**: Recharts AreaChart comparing invoiced sales revenue vs customer collections across custom timeframes, plus collection payment method distribution (UPI & QR 37%, Bank Transfer 27%, Cash 24%, Cheque 12%).
* **Activity Timeline, Insights & Customer Comparison Matrix**: Chronological log of transactions, AI-style business recommendations, and side-by-side customer comparison modal.
* **Material 3 Filter Drawer & Speed Dial FAB**: Drawer for Category, Credit Status, Payment Status, Loan Status, and Date Range, plus expandable Speed Dial FAB in bottom right corner.

---

### 2. 👥 Employee Management Dashboard (`/employees/dashboard` & `/employees`)
Serves as the **Workforce Management & Daily Wage Command Center**, tailored specifically for wholesale warehouse operations, attendance tracking, daily labor costs, overtime control, and wage disbursements.

---

### 3. 🤝 Suppliers Dashboard (`/purchases/suppliers-dashboard` & `/suppliers`)
Serves as the **Supplier Relationship & Procurement Control Center**, providing complete 360° visibility into supplier health, liabilities, delivery lead times, price matrix comparison, risk metrics, and supplier performance ranking.

---

### 4. 📈 Sales Dashboard (`/sales/dashboard`)
Serves as the **Sales Executive Cockpit** providing real-time visibility into sales performance, customer receivables, profitability, product velocities, and business trends.

---

### 5. 📦 Inventory Dashboard (`/inventory/dashboard`)
Acts as the **Inventory Command Center**, allowing business owners and warehouse managers to monitor stock availability, valuation, warehouse capacity, stock movement, dead stock trapped capital, and physical count audits.

---

### 6. 🛍️ Purchase Dashboard (`/purchases/dashboard`)
Serves as the **Purchase Command Center**, enabling business owners and procurement managers to oversee purchasing operations, vendor performance, open PO delivery tracking, un-invoiced GRNs, supplier payables, and cost fluctuations.

---

## 🏗️ Technical Architecture & Stack

* **Frontend Framework**: React 18, TypeScript, Vite.
* **UI Components & Guidelines**: Material UI (MUI v5) adopting Material 3 design principles (rounded 16–20dp cards, semantic color palette, 8dp grid spacing).
* **Data Visualization**: Recharts (Responsive AreaChart, BarChart, PieChart donut visualizations with custom tooltips).
* **Animations**: Framer Motion smooth entry transitions and hover effects.
* **State & Data Fetching**: TanStack React Query + Supabase JS Client with seamless offline-first mock fallbacks.
* **Routing**: React Router v6 with code-splitting, lazy loading, and error boundaries.

---

## 📱 Navigation & Routing Table

| Module | Route Path | Single-Tap Header Action |
| :--- | :--- | :--- |
| **Customers** | `/sales/customers-dashboard` | Expands Sales & loads Customer Dashboard instantly |
| **Employees** | `/employees/dashboard` | Expands Employees & loads Employee Dashboard instantly |
| **Suppliers** | `/purchases/suppliers-dashboard` | Expands Purchases & loads Suppliers Dashboard instantly |
| **Sales** | `/sales/dashboard` | Expands Sales group & loads Sales Dashboard instantly |
| **Purchases** | `/purchases/dashboard` | Expands Purchases group & loads Purchase Dashboard instantly |
| **Inventory** | `/inventory/dashboard` | Expands Inventory group & loads Inventory Dashboard instantly |
| **Finance** | `/finance/accounts` | Expands Finance group & loads Chart of Accounts instantly |
| **Reports** | `/reports/profit-loss` | Expands Reports group & loads P&L Statement instantly |
| **Settings** | `/settings/business` | Expands Settings group & loads Business Profile instantly |
| **Main Dashboard** | `/dashboard` | Loads Executive Overview Dashboard |
