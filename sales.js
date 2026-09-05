// Retail - Sales and Inventory Copilot (TRACK_DIPHS08)
// Transaction Ledger & Receipt Viewer Controller

(function() {
  const store = window.RetailStore;

  window.renderSales = function(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1.1rem; font-weight: 700;">Completed Sales Receipts (${store.salesHistory.length})</h3>
          <button class="btn btn-secondary" onclick="window.exportSalesCSV()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Receipts CSV
          </button>
        </div>

        <div class="glass-card">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Timestamp</th>
                  <th>Customer</th>
                  <th>Items Count</th>
                  <th>Payment Method</th>
                  <th>Total Paid</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${store.salesHistory.map(s => `
                  <tr>
                    <td class="mono" style="font-weight: 700; color: var(--primary);">${s.id}</td>
                    <td class="mono" style="font-size: 0.8rem; color: var(--text-muted);">${s.date}</td>
                    <td style="font-weight: 600;">${s.customer}</td>
                    <td>${s.itemsCount} Items</td>
                    <td><span class="badge badge-info">${s.paymentMethod}</span></td>
                    <td style="font-weight: 800; font-size: 0.95rem; color: #FFF;">$${s.total.toFixed(2)}</td>
                    <td><span class="badge badge-success">${s.status}</span></td>
                    <td>
                      <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="window.viewReceiptModal('${s.id}')">View Receipt</button>
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

  window.viewReceiptModal = function(receiptId) {
    const sale = store.salesHistory.find(s => s.id === receiptId);
    if (!sale) return;

    const modal = document.createElement("div");
    modal.className = "modal-overlay open";
    modal.id = "receiptModal";
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 420px; background: #FFF; color: #1E293B; font-family: monospace;">
        <div style="text-align: center; border-bottom: 2px dashed #CBD5E1; padding-bottom: 1rem; margin-bottom: 1rem;">
          <h2 style="font-size: 1.2rem; font-weight: 800; color: #0F172A;">APEX RETAIL STORE</h2>
          <p style="font-size: 0.75rem; color: #64748B;">Store #101 • 742 Evergreen Terrace</p>
          <p style="font-size: 0.75rem; color: #64748B;">Receipt #${sale.id} • ${sale.date}</p>
        </div>

        <div style="font-size: 0.8rem; margin-bottom: 1rem;">
          <div>Customer: <strong>${sale.customer}</strong></div>
          <div>Payment: <strong>${sale.paymentMethod} (${sale.status})</strong></div>
        </div>

        <div style="border-top: 1px dashed #CBD5E1; border-bottom: 1px dashed #CBD5E1; padding: 0.75rem 0; margin-bottom: 1rem; font-size: 0.85rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
            <span>Sample Retail Item x${sale.itemsCount}</span>
            <span>$${sale.subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.2rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span> <span>$${sale.subtotal.toFixed(2)}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>Tax (8%):</span> <span>+$${sale.tax.toFixed(2)}</span></div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.05rem; border-top: 1px solid #0F172A; padding-top: 0.4rem; color: #0F172A;">
            <span>TOTAL:</span> <span>$${sale.total.toFixed(2)}</span>
          </div>
        </div>

        <div style="text-align: center; font-size: 0.75rem; color: #64748B; margin-top: 1.5rem;">
          *** THANK YOU FOR SHOPPING WITH US ***
        </div>

        <div style="display: flex; gap: 0.5rem; margin-top: 1.25rem;">
          <button class="btn btn-secondary" style="flex: 1;" onclick="document.getElementById('receiptModal').remove()">Close</button>
          <button class="btn btn-primary" style="flex: 1;" onclick="window.print();">🖨️ Print Receipt</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.exportSalesCSV = function() {
    let csv = "ReceiptID,Date,Customer,ItemsCount,PaymentMethod,Total,Status\n";
    store.salesHistory.forEach(s => {
      csv += `${s.id},${s.date},"${s.customer}",${s.itemsCount},${s.paymentMethod},${s.total},${s.status}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sales_Export_${Date.now()}.csv`;
    a.click();
    window.showToast("Exported Sales Receipts CSV file!", "success");
  };
})();
