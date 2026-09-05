import React from 'react';
import { TabType } from '../types';
import { DashboardPage } from '../pages/DashboardPage';
import { POSPage } from '../pages/POSPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductsPage } from '../pages/ProductsPage';
import { SuppliersPage } from '../pages/SuppliersPage';
import { SalesPage } from '../pages/SalesPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { CopilotPage } from '../pages/CopilotPage';

interface AppRouterProps {
  activeTab: TabType;
}

export const AppRouter: React.FC<AppRouterProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardPage />;
    case 'pos':
      return <POSPage />;
    case 'inventory':
      return <InventoryPage />;
    case 'products':
      return <ProductsPage />;
    case 'suppliers':
      return <SuppliersPage />;
    case 'sales':
      return <SalesPage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'copilot':
      return <CopilotPage />;
    default:
      return <DashboardPage />;
  }
};
