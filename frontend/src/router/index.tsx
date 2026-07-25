import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import AppShell from '../components/layout/AppShell';
import { useAuthStore } from '../stores/authStore';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Lazy loaded pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));

// Sales
const SalesDashboardPage = lazy(() => import('../pages/sales/SalesDashboardPage'));
const CustomersDashboardPage = lazy(() => import('../pages/sales/CustomersDashboardPage'));
const CustomersPage = lazy(() => import('../pages/sales/CustomersPage'));
const SalesOrdersPage = lazy(() => import('../pages/sales/SalesOrdersPage'));
const DeliveryChallansPage = lazy(() => import('../pages/sales/DeliveryChallansPage'));
const TaxInvoicesPage = lazy(() => import('../pages/sales/TaxInvoicesPage'));
const CustomerPaymentsPage = lazy(() => import('../pages/sales/CustomerPaymentsPage'));
const CreditNotesPage = lazy(() => import('../pages/sales/CreditNotesPage'));

// Purchases
const PurchaseDashboardPage = lazy(() => import('../pages/purchases/PurchaseDashboardPage'));
const SuppliersDashboardPage = lazy(() => import('../pages/purchases/SuppliersDashboardPage'));
const SuppliersPage = lazy(() => import('../pages/purchases/SuppliersPage'));
const PurchaseOrdersPage = lazy(() => import('../pages/purchases/PurchaseOrdersPage'));
const GRNPage = lazy(() => import('../pages/purchases/GRNPage'));
const PurchaseInvoicesPage = lazy(() => import('../pages/purchases/PurchaseInvoicesPage'));
const SupplierPaymentsPage = lazy(() => import('../pages/purchases/SupplierPaymentsPage'));

// Employees
const EmployeeDashboardPage = lazy(() => import('../pages/employees/EmployeeDashboardPage'));

// Inventory
const InventoryDashboardPage = lazy(() => import('../pages/inventory/InventoryDashboardPage'));
const ProductsPage = lazy(() => import('../pages/inventory/ProductsPage'));
const WarehousesPage = lazy(() => import('../pages/inventory/WarehousesPage'));
const StockLedgerPage = lazy(() => import('../pages/inventory/StockLedgerPage'));

// Finance
const ChartOfAccountsPage = lazy(() => import('../pages/finance/ChartOfAccountsPage'));
const JournalEntriesPage = lazy(() => import('../pages/finance/JournalEntriesPage'));
const BankAccountsPage = lazy(() => import('../pages/finance/BankAccountsPage'));
const OpeningBalancesPage = lazy(() => import('../pages/finance/OpeningBalancesPage'));
const LoansDashboardPage = lazy(() => import('../pages/finance/LoansDashboardPage'));
const ExpensesDashboardPage = lazy(() => import('../pages/finance/ExpensesDashboardPage'));

// Reports
const ProfitLossPage = lazy(() => import('../pages/reports/ProfitLossPage'));
const BalanceSheetPage = lazy(() => import('../pages/reports/BalanceSheetPage'));
const TrialBalancePage = lazy(() => import('../pages/reports/TrialBalancePage'));
const GSTReportsPage = lazy(() => import('../pages/reports/GSTReportsPage'));
const GSTDashboardPage = lazy(() => import('../pages/reports/GSTDashboardPage'));
const FinanceReportsDashboardPage = lazy(() => import('../pages/reports/FinanceReportsDashboardPage'));

// Settings
const BusinessSettingsPage = lazy(() => import('../pages/settings/BusinessSettingsPage'));
const FinancialYearsPage = lazy(() => import('../pages/settings/FinancialYearsPage'));
const UsersRolesPage = lazy(() => import('../pages/settings/UsersRolesPage'));

const PageLoader = () => (
  <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
    <CircularProgress color="primary" />
  </Box>
);

const renderPage = (Component: React.ComponentType) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: renderPage(LoginPage),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: renderPage(DashboardPage) },
      // Sales
      { path: 'customers', element: <Navigate to="/sales/customers-dashboard" replace /> },
      { path: 'sales', element: <Navigate to="/sales/dashboard" replace /> },
      { path: 'sales/dashboard', element: renderPage(SalesDashboardPage) },
      { path: 'sales/customers-dashboard', element: renderPage(CustomersDashboardPage) },
      { path: 'sales/customers', element: renderPage(CustomersPage) },
      { path: 'sales/orders', element: renderPage(SalesOrdersPage) },
      { path: 'sales/challans', element: renderPage(DeliveryChallansPage) },
      { path: 'sales/invoices', element: renderPage(TaxInvoicesPage) },
      { path: 'sales/payments', element: renderPage(CustomerPaymentsPage) },
      { path: 'sales/credit-notes', element: renderPage(CreditNotesPage) },
      // Purchases
      { path: 'suppliers', element: <Navigate to="/purchases/suppliers-dashboard" replace /> },
      { path: 'purchases', element: <Navigate to="/purchases/dashboard" replace /> },
      { path: 'purchases/dashboard', element: renderPage(PurchaseDashboardPage) },
      { path: 'purchases/suppliers-dashboard', element: renderPage(SuppliersDashboardPage) },
      { path: 'purchases/suppliers', element: renderPage(SuppliersPage) },
      { path: 'purchases/orders', element: renderPage(PurchaseOrdersPage) },
      { path: 'purchases/grn', element: renderPage(GRNPage) },
      { path: 'purchases/invoices', element: renderPage(PurchaseInvoicesPage) },
      { path: 'purchases/payments', element: renderPage(SupplierPaymentsPage) },
      // Employees
      { path: 'employees', element: <Navigate to="/employees/dashboard" replace /> },
      { path: 'employees/dashboard', element: renderPage(EmployeeDashboardPage) },
      // Inventory
      { path: 'inventory', element: <Navigate to="/inventory/dashboard" replace /> },
      { path: 'inventory/dashboard', element: renderPage(InventoryDashboardPage) },
      { path: 'inventory/products', element: renderPage(ProductsPage) },
      { path: 'inventory/warehouses', element: renderPage(WarehousesPage) },
      { path: 'inventory/stock-ledger', element: renderPage(StockLedgerPage) },
      // Finance
      { path: 'expenses', element: <Navigate to="/finance/expenses-dashboard" replace /> },
      { path: 'loans', element: <Navigate to="/finance/loans-dashboard" replace /> },
      { path: 'finance/expenses-dashboard', element: renderPage(ExpensesDashboardPage) },
      { path: 'finance/accounts', element: renderPage(ChartOfAccountsPage) },
      { path: 'finance/journal', element: renderPage(JournalEntriesPage) },
      { path: 'finance/banks', element: renderPage(BankAccountsPage) },
      { path: 'finance/opening-balances', element: renderPage(OpeningBalancesPage) },
      { path: 'finance/loans-dashboard', element: renderPage(LoansDashboardPage) },
      // Reports
      { path: 'finance-reports', element: <Navigate to="/reports/finance-dashboard" replace /> },
      { path: 'gst', element: <Navigate to="/reports/gst-dashboard" replace /> },
      { path: 'reports/finance-dashboard', element: renderPage(FinanceReportsDashboardPage) },
      { path: 'reports/profit-loss', element: renderPage(ProfitLossPage) },
      { path: 'reports/balance-sheet', element: renderPage(BalanceSheetPage) },
      { path: 'reports/trial-balance', element: renderPage(TrialBalancePage) },
      { path: 'reports/gst', element: renderPage(GSTReportsPage) },
      { path: 'reports/gst-dashboard', element: renderPage(GSTDashboardPage) },
      // Settings
      { path: 'settings/business', element: renderPage(BusinessSettingsPage) },
      { path: 'settings/financial-years', element: renderPage(FinancialYearsPage) },
      { path: 'settings/users', element: renderPage(UsersRolesPage) },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
