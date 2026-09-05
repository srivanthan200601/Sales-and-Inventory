import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div>
            <div className="metric-label">Today's Revenue</div>
            <div className="metric-value">$14,850.50</div>
            <div className="metric-change positive">+18.4% vs last period</div>
          </div>
        </div>
        <div className="glass-card metric-card">
          <div>
            <div className="metric-label">Gross Profit Margin</div>
            <div className="metric-value">38.2%</div>
            <div className="metric-change positive">+2.1% optimized</div>
          </div>
        </div>
        <div className="glass-card metric-card">
          <div>
            <div className="metric-label">Low-Stock Alerts</div>
            <div className="metric-value" style={{ color: 'var(--warning)' }}>4 Items</div>
            <div className="metric-change negative">Reorder needed</div>
          </div>
        </div>
        <div className="glass-card metric-card">
          <div>
            <div className="metric-label">Active SKUs</div>
            <div className="metric-value">8</div>
            <div className="metric-change positive">100% Synced</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.05))', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🤖</div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Demand Forecast Recommendation Ready</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>EOQ optimization equation identified stockout risks for 3 low-stock SKUs.</p>
            </div>
          </div>
          <button className="btn btn-copilot">Generate AI Purchase Order</button>
        </div>
      </div>
    </div>
  );
};
