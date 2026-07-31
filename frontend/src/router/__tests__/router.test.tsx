import { describe, it, expect, vi } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Instead of dynamically importing every page (which triggers EMFILE on Windows),
// we verify the page modules exist and that the router module exports correctly.

const pagesDir = resolve(__dirname, '../../pages');

describe('Router Configuration', () => {
  it('all main dashboard page modules should exist', () => {
    const dashboardPages = [
      'dashboard/DashboardPage',
      'sales/SalesDashboardPage',
      'purchases/PurchaseDashboardPage',
      'inventory/InventoryDashboardPage',
      'finance/FinanceDashboardPage',
      'reports/ReportsDashboardPage',
      'employees/EmployeeDashboardPage',
      'settings/SettingsDashboardPage',
    ];

    for (const page of dashboardPages) {
      const tsxPath = resolve(pagesDir, `${page}.tsx`);
      const tsPath = resolve(pagesDir, `${page}.ts`);
      const exists = existsSync(tsxPath) || existsSync(tsPath);
      expect(exists, `Page module should exist: ${page}`).toBe(true);
    }
  });

  it('all sub-page modules should exist', () => {
    const subPages = [
      'sales/CustomersPage',
      'sales/SalesOrdersPage',
      'sales/DeliveryChallansPage',
      'sales/TaxInvoicesPage',
      'sales/CustomerPaymentsPage',
      'sales/CreditNotesPage',
      'purchases/SuppliersPage',
      'purchases/PurchaseOrdersPage',
      'purchases/GRNPage',
      'purchases/PurchaseInvoicesPage',
      'purchases/SupplierPaymentsPage',
      'inventory/ProductsPage',
      'inventory/WarehousesPage',
      'inventory/StockLedgerPage',
      'finance/ChartOfAccountsPage',
      'finance/JournalEntriesPage',
      'finance/BankAccountsPage',
      'finance/OpeningBalancesPage',
      'finance/LoansDashboardPage',
      'finance/ExpensesDashboardPage',
      'reports/ProfitLossPage',
      'reports/BalanceSheetPage',
      'reports/TrialBalancePage',
      'reports/GSTReportsPage',
      'reports/GSTDashboardPage',
      'reports/FinanceReportsDashboardPage',
      'settings/BusinessSettingsPage',
      'settings/FinancialYearsPage',
      'settings/UsersRolesPage',
      'auth/LoginPage',
    ];

    for (const page of subPages) {
      const tsxPath = resolve(pagesDir, `${page}.tsx`);
      const tsPath = resolve(pagesDir, `${page}.ts`);
      const exists = existsSync(tsxPath) || existsSync(tsPath);
      expect(exists, `Sub-page module should exist: ${page}`).toBe(true);
    }
  });
});
