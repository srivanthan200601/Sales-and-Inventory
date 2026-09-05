// Retail - Sales and Inventory Copilot (TRACK_DIPHS08)
// Real-Time Inventory & Stock Audit Module Controller

(function() {
  const store = window.RetailStore;
  let activeTab = "overview"; // overview | movements | alerts

  window.renderInventory = function(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Header Actions & Tabs -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchInventorySubTab('overview')">Stock Overview</button>
            <button class="btn ${activeTab === 'movements' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchInventorySubTab('movements')">Stock Movement Audit Log</button>
            <button class="btn ${activeTab === 'alerts' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchInventorySubTab('alerts')">
              Low-Stock Alerts (${store.products.filter(p => p.stock <= p.reorderLevel).length})
            </button>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-secondary" onclick="window.openStockAdjustmentModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Manual Stock Adjustment
            </button>
          </div>
        </div>

        <!-- Subtab Content Body -->
        <div id="inventorySubTabBody">
          ${renderInventorySubTab()}
        </div>
      </div>
    `;
  };

  function renderInventorySubTab() {
    if (activeTab === "overview") {
      return `
        <div class="glass-card">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SKU / Barcode</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Location Rack</th>
                  <th>Available Stock</th>
                  <th>Reorder Threshold</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${store.products.map(p => {
                  const cat = store.categories.find(c => c.id === p.category);
                  return `
                    <tr>
                      <td class="mono">
                        <div style="font-weight: 600;">${p.sku}</div>
                        <div style="font-size: 0.75rem; color: var(--text-dim);">${p.barcode}</div>
                      </td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                          <img src="${p.image}" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover;" />
                          <div>
                            <div style="font-weight: 600; font-size: 0.85rem;">${p.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${p.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td>${cat ? cat.name : 'N/A'}</td>
                      <td>${p.rack}</td>
                      <td style="font-weight: 700; font-size: 1rem; color: ${p.stock <= p.reorderLevel ? 'var(--warning)' : '#FFF'}">${p.stock}</td>
                      <td>${p.reorderLevel} units</td>
                      <td>
                        <span class="badge ${p.stock === 0 ? 'badge-danger' : (p.stock <= p.reorderLevel ? 'badge-warning' : 'badge-success')}">
                          ${p.stock === 0 ? 'OUT OF STOCK' : (p.stock <= p.reorderLevel ? 'LOW STOCK' : 'IN STOCK')}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="window.openStockAdjustmentModal('${p.id}')">Adjust</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeTab === "movements") {
      return `
        <div class="glass-card">
          <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem;">Stock Movement Audit Trail</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>SKU</th>
                  <th>Movement Type</th>
                  <th>Quantity Changed</th>
                  <th>Previous -> New</th>
                  <th>Reference ID</th>
                  <th>Performed By</th>
                </tr>
              </thead>
              <tbody>
                ${store.inventoryMovements.map(m => `
                  <tr>
                    <td class="mono" style="font-size: 0.8rem; color: var(--text-muted);">${m.date}</td>
                    <td class="mono" style="font-weight: 600;">${m.sku}</td>
                    <td>
                      <span class="badge ${m.type === 'SALE' ? 'badge-info' : (m.type === 'PURCHASE_RECEIPT' ? 'badge-success' : 'badge-warning')}">
                        ${m.type}
                      </span>
                    </td>
                    <td style="font-weight: 700; color: ${m.qty > 0 ? 'var(--success)' : 'var(--danger)'}">
                      ${m.qty > 0 ? '+' + m.qty : m.qty}
                    </td>
                    <td>${m.prevQty} → <strong>${m.newQty}</strong></td>
                    <td class="mono" style="font-size: 0.8rem;">${m.ref}</td>
                    <td>${m.user}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeTab === "alerts") {
      const alertItems = store.products.filter(p => p.stock <= p.reorderLevel);
      return `
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1rem; font-weight: 700;">Active Low-Stock Triggered Alerts</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Stock thresholds updated automatically based on daily sales velocity.</p>
            </div>
            <button class="btn btn-copilot" onclick="window.openCopilotWithPrompt('Draft a Purchase Order for top low-stock items based on 30-day forecast')">
              🤖 Auto-Generate PO with Copilot
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${alertItems.map(p => `
              <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-left: 4px solid var(--warning); padding: 1rem; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <img src="${p.image}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" />
                  <div>
                    <div style="font-weight: 700; font-size: 0.95rem;">${p.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">SKU: ${p.sku} | Supplier: TechDistro Global | Rack: ${p.rack}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 1.1rem; font-weight: 800; color: var(--warning);">${p.stock} units left</div>
                  <div style="font-size: 0.75rem; color: var(--text-dim);">Reorder point: ${p.reorderLevel}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  window.switchInventorySubTab = function(tab) {
    activeTab = tab;
    window.renderInventory(document.getElementById("mainContentBody"));
  };

  window.openStockAdjustmentModal = function(productId = null) {
    const selectedProd = productId ? store.products.find(p => p.id === productId) : store.products[0];
    const modal = document.createElement("div");
    modal.className = "modal-overlay open";
    modal.id = "stockAdjustmentModal";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; font-weight: 700;">Record Stock Adjustment</h3>
          <button class="close-btn" onclick="document.getElementById('stockAdjustmentModal').remove()">&times;</button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Select Product SKU:</label>
            <select id="adjProdSelect" style="width: 100%; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); color: #FFF; padding: 0.6rem; border-radius: 8px;">
              ${store.products.map(p => `<option value="${p.id}" ${p.id === selectedProd?.id ? 'selected' : ''}>${p.sku} - ${p.name} (Current: ${p.stock})</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Adjustment Type:</label>
            <select id="adjTypeSelect" style="width: 100%; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); color: #FFF; padding: 0.6rem; border-radius: 8px;">
              <option value="ADJUSTMENT_ADD">ADD Stock (+)</option>
              <option value="ADJUSTMENT_REMOVE">REMOVE / Spoilage / Breakage (-)</option>
            </select>
          </div>

          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Quantity:</label>
            <input type="number" id="adjQtyInput" value="5" min="1" style="width: 100%; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); color: #FFF; padding: 0.6rem; border-radius: 8px;" />
          </div>

          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Reason / Audit Note:</label>
            <input type="text" id="adjReasonInput" placeholder="e.g. Received shipment discrepancy or physical count audit" style="width: 100%; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); color: #FFF; padding: 0.6rem; border-radius: 8px;" />
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          <button class="btn btn-secondary" onclick="document.getElementById('stockAdjustmentModal').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="window.submitStockAdjustment()">Save Adjustment</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.submitStockAdjustment = function() {
    const prodId = document.getElementById("adjProdSelect").value;
    const type = document.getElementById("adjTypeSelect").value;
    const qty = parseInt(document.getElementById("adjQtyInput").value, 10);
    const reason = document.getElementById("adjReasonInput").value || "Manual Stock Adjustment";

    const prod = store.products.find(p => p.id === prodId);
    if (!prod) return;

    const prevQty = prod.stock;
    const change = type === "ADJUSTMENT_ADD" ? qty : -qty;
    prod.stock = Math.max(0, prod.stock + change);

    store.inventoryMovements.unshift({
      id: "mov-" + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sku: prod.sku,
      type: type,
      qty: change,
      prevQty,
      newQty: prod.stock,
      ref: "ADJ-" + Math.floor(1000 + Math.random() * 9000),
      user: store.meta.user.name,
      reason
    });

    document.getElementById("stockAdjustmentModal")?.remove();
    window.showToast(`Updated ${prod.name} stock to ${prod.stock}`, "success");
    window.renderInventory(document.getElementById("mainContentBody"));
  };
})();
