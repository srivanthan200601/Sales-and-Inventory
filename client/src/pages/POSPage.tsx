import React from 'react';

export const POSPage: React.FC = () => {
  return (
    <div className="pos-container">
      <div className="pos-catalog">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1 }}>
            <input type="text" placeholder="Scan Barcode (e.g. 8901234567891) or SKU..." style={{ width: '100%' }} />
          </div>
          <button className="btn btn-secondary">Test Scan</button>
        </div>

        <div className="product-grid">
          <div className="product-card">
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" className="product-img" alt="Headphones" />
            <div className="product-details">
              <div className="product-name">Pro Wireless Headphones</div>
              <div className="product-meta">
                <span className="product-price">$249.99</span>
                <span className="badge badge-warning">6 left</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pos-cart">
        <div className="cart-header">
          <h3>Active Order Cart</h3>
        </div>
        <div className="cart-items-list">
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
            Scan items or select products to build order
          </div>
        </div>
        <div className="cart-summary">
          <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            Checkout & Pay
          </button>
        </div>
      </div>
    </div>
  );
};
