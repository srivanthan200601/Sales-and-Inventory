// Retail - Sales and Inventory Copilot (TRACK_DIPHS08)
// Business Intelligence & Sales Analytics Module

(function() {
  const store = window.RetailStore;

  window.renderAnalytics = function(container) {
    const totalSales = store.salesHistory.reduce((acc, s) => acc + s.total, 0);
    const totalInventoryValue = store.products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
    const totalRetailValue = store.products.reduce((acc, p) => acc + (p.stock * p.price), 0);
    const potentialProfit = totalRetailValue - totalInventoryValue;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Analytics Top Summary -->
        <div class="metrics-grid">
          <div class="glass-card metric-card">
            <div>
              <div class="metric-label">Total Store Revenue</div>
              <div class="metric-value">$${totalSales.toFixed(2)}</div>
              <div class="metric-change positive">Active Audit Ledger</div>
            </div>
          </div>
          <div class="glass-card metric-card">
            <div>
              <div class="metric-label">Inventory Asset Cost Value</div>
              <div class="metric-value">$${totalInventoryValue.toFixed(2)}</div>
              <div class="metric-change positive">At Cost (COGS)</div>
            </div>
          </div>
          <div class="glass-card metric-card">
            <div>
              <div class="metric-label">Unrealized Gross Margin</div>
              <div class="metric-value" style="color: var(--success);">$${potentialProfit.toFixed(2)}</div>
              <div class="metric-change positive">+${((potentialProfit / totalRetailValue)*100).toFixed(1)}% projected</div>
            </div>
          </div>
        </div>

        <!-- Top Selling Products Breakdown -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div class="glass-card">
            <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem;">Top 5 High Velocity Products</h3>
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${store.products.slice(0, 5).map(p => `
                <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255, 255, 255, 0.02); padding: 0.75rem; border-radius: 8px;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="${p.image}" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover;" />
                    <div>
                      <div style="font-weight: 600; font-size: 0.85rem;">${p.name}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">$${p.price.toFixed(2)} • Margin: ${(((p.price - p.costPrice)/p.price)*100).toFixed(0)}%</div>
                    </div>
                  </div>
                  <span class="badge badge-success">High Demand</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="glass-card">
            <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem;">Inventory Turnover & Velocity</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
                  <span>Electronics & Tech</span>
                  <span style="font-weight: 700; color: var(--primary);">8.4x / year</span>
                </div>
                <div style="height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                  <div style="width: 84%; height: 100%; background: var(--primary);"></div>
                </div>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
                  <span>Apparel & Fashion</span>
                  <span style="font-weight: 700; color: var(--accent-purple);">6.1x / year</span>
                </div>
                <div style="height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                  <div style="width: 61%; height: 100%; background: var(--accent-purple);"></div>
                </div>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
                  <span>Groceries & Snacks</span>
                  <span style="font-weight: 700; color: var(--success);">14.2x / year</span>
                </div>
                <div style="height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                  <div style="width: 95%; height: 100%; background: var(--success);"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };
})();
