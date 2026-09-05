// Retail - Sales and Inventory Copilot (TRACK_DIPHS08)
// Product Catalog & Variant Manager

(function() {
  const store = window.RetailStore;

  window.renderProducts = function(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1.1rem; font-weight: 700;">Catalog & Price Matrix (${store.products.length} Products)</h3>
          <button class="btn btn-primary" onclick="window.openAddProductModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New Product SKU
          </button>
        </div>

        <div class="glass-card">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Product & SKU</th>
                  <th>Category</th>
                  <th>Retail Price</th>
                  <th>Cost Price (COGS)</th>
                  <th>Gross Margin</th>
                  <th>Stock Available</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${store.products.map(p => {
                  const margin = (((p.price - p.costPrice) / p.price) * 100).toFixed(1);
                  const cat = store.categories.find(c => c.id === p.category);
                  return `
                    <tr>
                      <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                          <img src="${p.image}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;" />
                          <div>
                            <div style="font-weight: 700; font-size: 0.9rem;">${p.name}</div>
                            <div class="mono" style="font-size: 0.75rem; color: var(--text-dim);">SKU: ${p.sku} | Barcode: ${p.barcode}</div>
                          </div>
                        </div>
                      </td>
                      <td>${cat ? cat.name : 'Uncategorized'}</td>
                      <td style="font-weight: 700; color: #FFF;">$${p.price.toFixed(2)}</td>
                      <td style="color: var(--text-muted);">$${p.costPrice.toFixed(2)}</td>
                      <td>
                        <span style="color: var(--success); font-weight: 700;">${margin}%</span>
                      </td>
                      <td style="font-weight: 700;">${p.stock} units</td>
                      <td>
                        <span class="badge ${p.stock === 0 ? 'badge-danger' : (p.stock <= p.reorderLevel ? 'badge-warning' : 'badge-success')}">
                          ${p.stock === 0 ? 'OUT OF STOCK' : (p.stock <= p.reorderLevel ? 'LOW STOCK' : 'ACTIVE')}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="window.showToast('Editing ${p.sku} catalog settings', 'info')">Edit</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  };

  window.openAddProductModal = function() {
    window.showToast("Add Product Modal staged for catalog expansion.", "info");
  };
})();
