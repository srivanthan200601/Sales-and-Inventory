import React from 'react';

export const SalesPage: React.FC = () => {
  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Transaction History Ledger</h3>
      <p style={{ color: 'var(--text-muted)' }}>Historical receipts and transaction logs.</p>
    </div>
  );
};
