import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TabType } from '../../types';

interface AppLayoutProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenCopilot: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onSelectTab,
  onOpenCopilot,
  children
}) => {
  const titles: Record<TabType, string> = {
    dashboard: 'Executive Sales & Inventory Overview',
    pos: 'Point of Sale (POS Terminal)',
    inventory: 'Real-Time Inventory & Stock Audit',
    products: 'Product Catalog & Variant Manager',
    suppliers: 'Suppliers & Automated Reorder Orders',
    sales: 'Transaction History & Digital Receipts',
    analytics: 'Business Intelligence & Profit Analytics',
    copilot: 'AI Retail Copilot Workspace'
  };

  return (
    <div id="app">
      <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />
      <main className="main-content">
        <Header title={titles[activeTab] || 'Retail Copilot'} onOpenCopilot={onOpenCopilot} />
        <div className="content-body">
          {children}
        </div>
      </main>
    </div>
  );
};
