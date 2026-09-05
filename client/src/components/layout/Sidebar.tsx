import React from 'react';
import { TabType } from '../../types';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const menuItems: { id: TabType; label: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pos', label: 'Point of Sale (POS)' },
    { id: 'inventory', label: 'Inventory Audit', badge: 4 },
    { id: 'products', label: 'Product Catalog' },
    { id: 'suppliers', label: 'Suppliers & POs' },
    { id: 'sales', label: 'Sales Ledger' },
    { id: 'analytics', label: 'Analytics & Profit' }
  ];

  return (
    <aside className="sidebar">
      <div className="brand-header">
        <div className="brand-logo">R</div>
        <div>
          <div class="brand-title">Retail Copilot</div>
          <div class="brand-subtitle">ID: TRACK_DIPHS08</div>
        </div>
      </div>

      <nav className="nav-menu">
        {menuItems.map(item => (
          <a
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectTab(item.id);
            }}
            href="#"
          >
            <span>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </a>
        ))}
      </nav>

      <div className="user-profile">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          className="user-avatar"
          alt="Alex Morgan"
        />
        <div className="user-info">
          <span className="user-name">Alex Morgan</span>
          <span className="user-role">Store Manager</span>
        </div>
      </div>
    </aside>
  );
};
