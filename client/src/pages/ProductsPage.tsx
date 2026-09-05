import React from 'react';

export const ProductsPage: React.FC = () => {
  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Product Catalog</h3>
      <p style={{ color: 'var(--text-muted)' }}>Catalog manager staged with SKU indexing, COGS margins, and multi-tier prices.</p>
    </div>
  );
};
