// Retail - Sales and Inventory Copilot (TRACK_DIPHS08)
// Core Application Controller & UI Renderer

(function() {
  const store = window.RetailStore;
  let activeTab = "dashboard";

  // Helper Toast Notifications
  window.showToast = function(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 16v-4M12 8h.01"></path>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-100%)";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // Main Render Controller
  window.renderApp = function() {
    const content = document.getElementById("mainContentBody");
    const pageTitle = document.getElementById("pageTitle");

    // Update Nav Active state
    document.querySelectorAll(".nav-item").forEach(item => {
      if (item.getAttribute("data-tab") === activeTab) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    switch(activeTab) {
      case "dashboard":
        pageTitle.innerText = "Executive Sales & Inventory Overview";
        renderDashboard(content);
        break;
      case "pos":
        pageTitle.innerText = "Point of Sale (POS Terminal)";
        renderPOS(content);
        break;
      case "inventory":
        pageTitle.innerText = "Real-Time Inventory & Stock Audit";
        renderInventory(content);
        break;
      case "products":
        pageTitle.innerText = "Product Catalog & Variant Manager";
        renderProducts(content);
        break;
      case "suppliers":
        pageTitle.innerText = "Suppliers & Automated Reorder Orders";
        renderSuppliers(content);
        break;
      case "sales":
        pageTitle.innerText = "Transaction History & Digital Receipts";
        renderSales(content);
        break;
      case "analytics":
        pageTitle.innerText = "Business Intelligence & Profit Analytics";
        renderAnalytics(content);
        break;
    }
  };

  // Render Dashboard
  function renderDashboard(container) {
    const totalSales = store.salesHistory.reduce((acc, s) => acc + s.total, 0);
    const lowStockCount = store.products.filter(p => p.stock <= p.reorderLevel).length;
    const totalProducts = store.products.length;

    container.innerHTML = `
      <!-- Metrics Row -->
      <div class="metrics-grid">
        <div class="glass-card metric-card">
          <div>
            <div class="metric-label">Today's Revenue</div>
            <div class="metric-value">$${totalSales.toFixed(2)}</div>
            <div class="metric-change positive">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline></svg>
              +18.4% vs last period
            </div>
          </div>
          <div class="metric-icon-box" style="color: var(--primary);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
        </div>

        <div class="glass-card metric-card">
          <div>
            <div class="metric-label">Gross Profit Margin</div>
            <div class="metric-value">38.2%</div>
            <div class="metric-change positive">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline></svg>
              +2.1% optimized
            </div>
          </div>
          <div class="metric-icon-box" style="color: var(--success);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
        </div>

        <div class="glass-card metric-card">
          <div>
            <div class="metric-label">Low-Stock Alerts</div>
            <div class="metric-value" style="color: var(--warning);">${lowStockCount} Items</div>
            <div class="metric-change negative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Immediate reorder needed
            </div>
          </div>
          <div class="metric-icon-box" style="color: var(--warning);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
        </div>

        <div class="glass-card metric-card">
          <div>
            <div class="metric-label">Active SKUs Tracked</div>
            <div class="metric-value">${totalProducts}</div>
            <div class="metric-change positive">100% In Audit Sync</div>
          </div>
          <div class="metric-icon-box" style="color: var(--accent-cyan);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          </div>
        </div>
      </div>

      <!-- Quick AI Recommendation Callout -->
      <div class="glass-card" style="margin-bottom: 2rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.05)); border-color: rgba(139, 92, 246, 0.3);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, var(--accent-purple), var(--primary)); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">🤖</div>
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.2rem;">AI Copilot Recommendation Available</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">
                Demand model projects stockout risk for <strong>3 headphones & smartwatch SKUs</strong> within 48 hours. Economic Order Quantity PO draft is prepared.
              </p>
            </div>
          </div>
          <button class="btn btn-copilot" onclick="window.openCopilotWithPrompt('Draft a Purchase Order for top low-stock items based on 30-day forecast')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            Generate AI Purchase Order
          </button>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
        <!-- Sales Trend Graph Mock -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="font-size: 1rem; font-weight: 700;">Sales Revenue vs Historical Target</h3>
            <span class="badge badge-info">Real-time Stream</span>
          </div>
          <div style="height: 220px; display: flex; align-items: flex-end; gap: 0.75rem; padding-top: 1rem; border-bottom: 1px solid var(--border-color);">
            <div style="flex: 1; background: linear-gradient(0deg, rgba(99, 102, 241, 0.2), var(--primary)); height: 45%; border-radius: 6px 6px 0 0; position: relative;" title="08:00 AM - $1,240"><span style="position: absolute; top: -22px; width: 100%; text-align: center; font-size: 0.7rem; color: var(--text-muted);">$1.2k</span></div>
            <div style="flex: 1; background: linear-gradient(0deg, rgba(99, 102, 241, 0.2), var(--primary)); height: 65%; border-radius: 6px 6px 0 0; position: relative;" title="10:00 AM - $2,180"><span style="position: absolute; top: -22px; width: 100%; text-align: center; font-size: 0.7rem; color: var(--text-muted);">$2.1k</span></div>
            <div style="flex: 1; background: linear-gradient(0deg, rgba(99, 102, 241, 0.2), var(--primary)); height: 85%; border-radius: 6px 6px 0 0; position: relative;" title="12:00 PM - $3,450"><span style="position: absolute; top: -22px; width: 100%; text-align: center; font-size: 0.7rem; color: var(--text-muted);">$3.4k</span></div>
            <div style="flex: 1; background: linear-gradient(0deg, rgba(99, 102, 241, 0.2), var(--primary)); height: 95%; border-radius: 6px 6px 0 0; position: relative;" title="02:00 PM - $4,120"><span style="position: absolute; top: -22px; width: 100%; text-align: center; font-size: 0.7rem; color: var(--text-muted);">$4.1k</span></div>
            <div style="flex: 1; background: linear-gradient(0deg, rgba(99, 102, 241, 0.2), var(--primary)); height: 75%; border-radius: 6px 6px 0 0; position: relative;" title="04:00 PM - $2,950"><span style="position: absolute; top: -22px; width: 100%; text-align: center; font-size: 0.7rem; color: var(--text-muted);">$2.9k</span></div>
            <div style="flex: 1; background: linear-gradient(0deg, rgba(99, 102, 241, 0.2), var(--accent-purple)); height: 90%; border-radius: 6px 6px 0 0; position: relative;" title="06:00 PM - $3,800"><span style="position: absolute; top: -22px; width: 100%; text-align: center; font-size: 0.7rem; color: var(--text-muted);">$3.8k</span></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-dim); margin-top: 0.5rem;">
            <span>08:00 AM</span><span>10:00 AM</span><span>12:00 PM</span><span>02:00 PM</span><span>04:00 PM</span><span>06:00 PM</span>
          </div>
        </div>

        <!-- Stock Risk Table Callout -->
        <div class="glass-card">
          <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem;">Immediate Stock Risks</h3>
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${store.products.filter(p => p.stock <= p.reorderLevel).map(p => `
              <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255, 255, 255, 0.03); padding: 0.75rem; border-radius: 8px; border-left: 3px solid ${p.stock === 0 ? 'var(--danger)' : 'var(--warning)'};">
                <div>
                  <div style="font-size: 0.85rem; font-weight: 600;">${p.name}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${p.sku} • Stock: <strong style="color: #FFF;">${p.stock}</strong> / Min: ${p.reorderLevel}</div>
                </div>
                <span class="badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}">${p.stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Handle Navigation clicks
  document.addEventListener("DOMContentLoaded", () => {
    if (window.Auth) {
      window.Auth.init();
    }

    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        activeTab = btn.getAttribute("data-tab");
        window.renderApp();
      });
    });

    // Initialize initial view
    window.renderApp();
  });
})();
