import React from 'react';

export const InventoryPage: React.FC = () => {
  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Stock Audit Matrix</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Location</th>
              <th>Stock</th>
              <th>Reorder Threshold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="mono">EL-HP-001</td>
              <td>Pro Wireless Headphones</td>
              <td>Aisle A - Shelf 2</td>
              <td style={{ fontWeight: 700, color: 'var(--warning)' }}>6</td>
              <td>10 units</td>
              <td><span className="badge badge-warning">LOW STOCK</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
