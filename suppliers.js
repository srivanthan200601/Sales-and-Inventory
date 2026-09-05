// Retail - Sales and Inventory Copilot (TRACK_DIPHS08)
// Suppliers & Purchase Order Automation

(function() {
  const store = window.RetailStore;

  window.renderSuppliers = function(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- AI Purchase Order Recommendation Callout -->
        <div class="glass-card" style="border-color: rgba(139, 92, 246, 0.4); background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(15, 23, 42, 0.6));">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, var(--accent-purple), var(--primary)); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">📦</div>
              <div>
                <h3 style="font-size: 1.05rem; font-weight: 700;">Automated Purchase Order Proposal (PO-4092)</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">
                  Supplier: <strong>TechDistro Global Inc</strong> • Estimated Total: <strong>$1,490.00</strong> • Delivery Lead Time: <strong>3 Days</strong>
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 0.75rem;">
              <button class="btn btn-copilot" onclick="window.approveDraftPO('PO-4092')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Approve & Dispatch PO
              </button>
            </div>
          </div>
        </div>

        <!-- Supplier Directory -->
        <div class="glass-card">
          <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem;">Approved Supplier Directory</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Supplier Name</th>
                  <th>Primary Contact</th>
                  <th>Email & Phone</th>
                  <th>Expected Lead Time</th>
                  <th>Vendor Reliability Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${store.suppliers.map(s => `
                  <tr>
                    <td style="font-weight: 700; font-size: 0.9rem;">${s.name}</td>
                    <td>${s.contact}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${s.email}<br/>${s.phone}</td>
                    <td><span class="badge badge-info">${s.leadTimeDays} Days</span></td>
                    <td style="font-weight: 700; color: var(--success);">${s.reliability}</td>
                    <td>
                      <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="window.openCopilotWithPrompt('Draft a Purchase Order for ${s.name}')">Create PO</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Purchase Order History Table -->
        <div class="glass-card">
          <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem;">Purchase Order Ledger</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>PO Reference</th>
                  <th>Date Created</th>
                  <th>Supplier</th>
                  <th>Total Cost</th>
                  <th>Expected Delivery</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${store.purchaseOrders.map(po => `
                  <tr>
                    <td class="mono" style="font-weight: 700;">${po.id}</td>
                    <td class="mono" style="font-size: 0.8rem; color: var(--text-muted);">${po.date}</td>
                    <td>${po.supplier}</td>
                    <td style="font-weight: 700; color: #FFF;">$${po.totalCost.toFixed(2)}</td>
                    <td style="font-size: 0.85rem;">${po.expectedDelivery}</td>
                    <td>
                      <span class="badge ${po.status === 'COMPLETED' ? 'badge-success' : (po.status === 'AI_RECOMMENDED' ? 'badge-warning' : 'badge-info')}">
                        ${po.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  };

  window.approveDraftPO = function(poId) {
    const po = store.purchaseOrders.find(p => p.id === poId);
    if (po) {
      po.status = "SENT";
    }
    window.showToast(`Purchase Order ${poId} approved and dispatched to supplier email!`, "success");
    window.renderSuppliers(document.getElementById("mainContentBody"));
  };
})();
