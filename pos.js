// Retail - Sales and Inventory Copilot (TRACK_DIPHS08)
// Point of Sale (POS) Module Controller

(function() {
  const store = window.RetailStore;
  let selectedCategory = "all";

  window.renderPOS = function(container) {
    container.innerHTML = `
      <div class="pos-container">
        <!-- Left Catalog Panel -->
        <div class="pos-catalog">
          <!-- Filter Controls -->
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <div class="search-box" style="flex: 1;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" id="posSearchInput" placeholder="Scan Barcode (e.g. 8901234567891) or type SKU..." style="width: 100%;" />
            </div>
            <button class="btn btn-secondary" onclick="window.simulateBarcodeScan()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>
              Test Scan
            </button>
          </div>

          <!-- Category Pills -->
          <div class="category-pills">
            <div class="category-pill ${selectedCategory === 'all' ? 'active' : ''}" onclick="window.filterPOSCategory('all')">All Products</div>
            ${store.categories.map(c => `
              <div class="category-pill ${selectedCategory === c.id ? 'active' : ''}" onclick="window.filterPOSCategory('${c.id}')">${c.name}</div>
            `).join('')}
          </div>

          <!-- Product Grid -->
          <div class="product-grid" id="posProductGrid">
            ${renderProductCards()}
          </div>
        </div>

        <!-- Right Cart Panel -->
        <div class="pos-cart">
          <div class="cart-header">
            <div>
              <h3 style="font-size: 1rem; font-weight: 700;">Active Order Cart</h3>
              <span style="font-size: 0.75rem; color: var(--text-muted);" id="cartItemCount">${store.activeCart.items.length} items selected</span>
            </div>
            <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="window.clearPOSCart()">Clear</button>
          </div>

          <!-- Customer Assignment -->
          <div style="padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border-color); background: rgba(255, 255, 255, 0.02); display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">Customer:</span>
            <select id="posCustomerSelect" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); color: #FFF; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem;" onchange="store.activeCart.customerName = this.value">
              <option value="Walk-in Customer">Walk-in Customer</option>
              <option value="Sarah Connor (VIP)">Sarah Connor (VIP)</option>
              <option value="David Miller (Rewards)">David Miller (Rewards)</option>
              <option value="Emma Watson">Emma Watson</option>
            </select>
          </div>

          <div class="cart-items-list" id="posCartList">
            ${renderCartItems()}
          </div>

          <!-- Cart Calculation Summary -->
          <div class="cart-summary">
            ${renderCartSummary()}
            <button class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 0.85rem; font-size: 1rem;" onclick="window.openCheckoutModal()" ${store.activeCart.items.length === 0 ? 'disabled' : ''}>
              Checkout & Pay ($${calculateTotal().total.toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    `;

    // Add Live Search Event
    document.getElementById("posSearchInput")?.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      const grid = document.getElementById("posProductGrid");
      if (grid) {
        grid.innerHTML = renderProductCards(term);
      }
    });
  };

  function renderProductCards(searchTerm = "") {
    let filtered = store.products;
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm) || p.sku.toLowerCase().includes(searchTerm) || p.barcode.includes(searchTerm));
    }

    if (filtered.length === 0) {
      return `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No products found matching your search.</div>`;
    }

    return filtered.map(p => `
      <div class="product-card" onclick="window.addToPOSCart('${p.id}')">
        <img src="${p.image}" class="product-img" alt="${p.name}" />
        <div class="product-details">
          <div class="product-name">${p.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace;">SKU: ${p.sku}</div>
          <div class="product-meta">
            <span class="product-price">$${p.price.toFixed(2)}</span>
            <span class="badge ${p.stock <= p.reorderLevel ? 'badge-warning' : 'badge-success'}">${p.stock} left</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderCartItems() {
    if (store.activeCart.items.length === 0) {
      return `
        <div style="text-align: center; color: var(--text-dim); margin: auto; padding: 2rem 0;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem;"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <div>Cart is empty</div>
          <div style="font-size: 0.75rem;">Scan item barcode or click products to build order</div>
        </div>
      `;
    }

    return store.activeCart.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.product.name}</div>
          <div class="cart-item-price">$${item.product.price.toFixed(2)} × ${item.qty}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="qty-controls">
            <button class="qty-btn" onclick="window.updatePOSCartQty('${item.product.id}', -1)">-</button>
            <span style="font-size: 0.85rem; font-weight: 700; width: 20px; text-align: center;">${item.qty}</span>
            <button class="qty-btn" onclick="window.updatePOSCartQty('${item.product.id}', 1)">+</button>
          </div>
          <div style="font-weight: 700; font-size: 0.9rem; min-width: 55px; text-align: right;">$${(item.product.price * item.qty).toFixed(2)}</div>
        </div>
      </div>
    `).join('');
  }

  function calculateTotal() {
    const subtotal = store.activeCart.items.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
    const discount = subtotal * (store.activeCart.discountPercent / 100);
    const tax = (subtotal - discount) * store.meta.taxRate;
    const total = subtotal - discount + tax;
    return { subtotal, discount, tax, total };
  }

  function renderCartSummary() {
    const { subtotal, discount, tax, total } = calculateTotal();
    return `
      <div class="summary-row"><span>Subtotal:</span> <span>$${subtotal.toFixed(2)}</span></div>
      <div class="summary-row"><span>Discount (${store.activeCart.discountPercent}%):</span> <span>-$${discount.toFixed(2)}</span></div>
      <div class="summary-row"><span>Sales Tax (8%):</span> <span>+$${tax.toFixed(2)}</span></div>
      <div class="summary-total summary-row"><span>Total Due:</span> <span>$${total.toFixed(2)}</span></div>
    `;
  }

  // Global POS Actions
  window.filterPOSCategory = function(catId) {
    selectedCategory = catId;
    window.renderPOS(document.getElementById("mainContentBody"));
  };

  window.addToPOSCart = function(productId) {
    const prod = store.products.find(p => p.id === productId);
    if (!prod) return;

    if (prod.stock <= 0) {
      window.showToast(`Cannot add ${prod.name} - Item is Out of Stock!`, "danger");
      return;
    }

    const existing = store.activeCart.items.find(i => i.product.id === productId);
    if (existing) {
      if (existing.qty + 1 > prod.stock) {
        window.showToast(`Max stock reached for ${prod.name}`, "warning");
        return;
      }
      existing.qty++;
    } else {
      store.activeCart.items.push({ product: prod, qty: 1 });
    }
    window.showToast(`Added ${prod.name} to cart`, "info");
    window.renderPOS(document.getElementById("mainContentBody"));
  };

  window.updatePOSCartQty = function(productId, delta) {
    const item = store.activeCart.items.find(i => i.product.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      store.activeCart.items = store.activeCart.items.filter(i => i.product.id !== productId);
    }
    window.renderPOS(document.getElementById("mainContentBody"));
  };

  window.clearPOSCart = function() {
    store.activeCart.items = [];
    window.renderPOS(document.getElementById("mainContentBody"));
  };

  window.simulateBarcodeScan = function() {
    const sample = store.products[0];
    window.addToPOSCart(sample.id);
    window.showToast(`[BARCODE SCANNER] Scanned SKU: ${sample.barcode} (${sample.name})`, "success");
  };

  window.openCheckoutModal = function() {
    const { total } = calculateTotal();
    const modal = document.createElement("div");
    modal.className = "modal-overlay open";
    modal.id = "checkoutModal";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 style="font-size: 1.1rem; font-weight: 700;">Process Payment</h3>
          <button class="close-btn" onclick="document.getElementById('checkoutModal').remove()">&times;</button>
        </div>
        <div style="margin-bottom: 1.5rem; text-align: center; background: rgba(99, 102, 241, 0.1); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-glow);">
          <div style="font-size: 0.85rem; color: var(--text-muted);">Amount Payable</div>
          <div style="font-size: 2.2rem; font-weight: 800; color: #FFF;">$${total.toFixed(2)}</div>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem;">
          <button class="btn btn-primary" style="flex: 1;" onclick="window.processPOSPayment('CARD')">💳 Credit Card</button>
          <button class="btn btn-secondary" style="flex: 1;" onclick="window.processPOSPayment('CASH')">💵 Cash</button>
          <button class="btn btn-copilot" style="flex: 1;" onclick="window.processPOSPayment('UPI')">📱 Digital Pay</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.processPOSPayment = function(method) {
    const { subtotal, discount, tax, total } = calculateTotal();
    const receiptId = "REC-" + Math.floor(10000 + Math.random() * 90000);

    // Atomically decrement stock in memory and create movements
    store.activeCart.items.forEach(item => {
      const prod = store.products.find(p => p.id === item.product.id);
      if (prod) {
        const prevStock = prod.stock;
        prod.stock -= item.qty;
        if (prod.stock <= prod.reorderLevel) {
          prod.status = prod.stock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK";
        }
        store.inventoryMovements.unshift({
          id: "mov-" + Date.now(),
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          sku: prod.sku,
          type: "SALE",
          qty: -item.qty,
          prevQty: prevStock,
          newQty: prod.stock,
          ref: receiptId,
          user: "Cashier - Alex"
        });
      }
    });

    // Record Sale
    store.salesHistory.unshift({
      id: receiptId,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customer: store.activeCart.customerName,
      itemsCount: store.activeCart.items.length,
      subtotal, tax, discount, total,
      paymentMethod: method,
      status: "PAID"
    });

    document.getElementById("checkoutModal")?.remove();
    store.activeCart.items = [];
    
    window.showToast(`Transaction Complete! Receipt ${receiptId} generated and stock updated.`, "success");
    window.renderPOS(document.getElementById("mainContentBody"));
  };
})();
