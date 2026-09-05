// Retail - Sales and Inventory Copilot (TRACK_DIPHS08)
// AI Copilot Engine & Function Calling Controller

(function() {
  const store = window.RetailStore;
  let copilotOpen = false;

  window.initCopilot = function() {
    createCopilotUI();
  };

  function createCopilotUI() {
    // Floating Action Button
    const fab = document.createElement("div");
    fab.className = "copilot-fab";
    fab.id = "copilotFabTrigger";
    fab.title = "Open Retail AI Copilot";
    fab.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    `;
    fab.onclick = window.toggleCopilot;
    document.body.appendChild(fab);

    // Copilot Panel Drawer
    const panel = document.createElement("div");
    panel.className = "copilot-panel";
    panel.id = "copilotDrawer";
    panel.innerHTML = `
      <div class="copilot-header">
        <div class="copilot-badge">
          <div class="copilot-badge-icon">🤖</div>
          <div>
            <div>TRACK_DIPHS08 Copilot</div>
            <div style="font-size: 0.7rem; color: var(--success); font-weight: 500;">● Connected to Live Store DB</div>
          </div>
        </div>
        <button class="close-btn" onclick="window.toggleCopilot()">&times;</button>
      </div>

      <div class="copilot-messages" id="copilotMessages">
        <div class="chat-msg copilot">
          <div class="msg-bubble">
            👋 Hello <strong>${store.meta.user.name}</strong>! I'm your AI Retail Sales & Inventory Copilot.
            <br/><br/>
            I can analyze sales velocity, predict demand forecasts using EOQ models, auto-generate Purchase Orders, and answer natural language query requests.
          </div>
        </div>
      </div>

      <!-- Quick Prompt Chips -->
      <div class="prompt-chips">
        <div class="chip" onclick="window.sendCopilotPrompt('Draft a Purchase Order for top low-stock items based on 30-day forecast')">📦 Draft PO for Low-Stock SKUs</div>
        <div class="chip" onclick="window.sendCopilotPrompt('Show me sales summary and top 3 most profitable products')">📈 Sales & Profit Summary</div>
        <div class="chip" onclick="window.sendCopilotPrompt('List all items with high stockout risk for the weekend')">⚠️ High Stockout Risk Items</div>
      </div>

      <div class="copilot-input-area">
        <input type="text" id="copilotInput" placeholder="Ask AI Copilot anything about inventory or sales..." onkeydown="if(event.key==='Enter') window.submitCopilotInput()" />
        <button class="btn btn-copilot" onclick="window.submitCopilotInput()">Send</button>
      </div>
    `;
    document.body.appendChild(panel);
  }

  window.toggleCopilot = function() {
    copilotOpen = !copilotOpen;
    const drawer = document.getElementById("copilotDrawer");
    if (drawer) {
      drawer.classList.toggle("open", copilotOpen);
    }
  };

  window.openCopilotWithPrompt = function(promptText) {
    if (!copilotOpen) window.toggleCopilot();
    window.sendCopilotPrompt(promptText);
  };

  window.sendCopilotPrompt = function(text) {
    appendUserMessage(text);
    processCopilotLogic(text);
  };

  window.submitCopilotInput = function() {
    const input = document.getElementById("copilotInput");
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = "";
    window.sendCopilotPrompt(text);
  };

  function appendUserMessage(text) {
    const box = document.getElementById("copilotMessages");
    if (!box) return;
    const msg = document.createElement("div");
    msg.className = "chat-msg user";
    msg.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}</div>`;
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
  }

  function appendCopilotMessage(htmlContent) {
    const box = document.getElementById("copilotMessages");
    if (!box) return;
    const msg = document.createElement("div");
    msg.className = "chat-msg copilot";
    msg.innerHTML = `<div class="msg-bubble">${htmlContent}</div>`;
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
  }

  // Simulated Tool Execution & AI Logic
  function processCopilotLogic(userPrompt) {
    const lower = userPrompt.toLowerCase();

    // Show typing state
    const typingMsg = document.createElement("div");
    typingMsg.className = "chat-msg copilot";
    typingMsg.id = "copilotTyping";
    typingMsg.innerHTML = `<div class="msg-bubble" style="color: var(--text-muted); font-style: italic;">⚡ Analyzing database metrics & running tool functions...</div>`;
    document.getElementById("copilotMessages")?.appendChild(typingMsg);

    setTimeout(() => {
      document.getElementById("copilotTyping")?.remove();

      if (lower.includes("purchase order") || lower.includes("draft po") || lower.includes("reorder")) {
        executeToolDraftPO();
      } else if (lower.includes("profit") || lower.includes("sales") || lower.includes("summary")) {
        executeToolSalesSummary();
      } else if (lower.includes("risk") || lower.includes("stockout") || lower.includes("low stock")) {
        executeToolStockoutRisk();
      } else {
        appendCopilotMessage(`
          I processed your query: "<em>${escapeHtml(userPrompt)}</em>".
          <br/><br/>
          <strong>Store Context:</strong>
          <ul>
            <li>Active SKUs in Catalog: <strong>${store.products.length}</strong></li>
            <li>Low-Stock Triggered Items: <strong>${store.products.filter(p => p.stock <= p.reorderLevel).length}</strong></li>
            <li>Current Store Tax Rate: <strong>8%</strong></li>
          </ul>
          You can ask me to draft purchase orders, calculate gross margins, or analyze supplier lead times!
        `);
      }
    }, 1000);
  }

  // AI Function Tool #1: Draft Purchase Order
  function executeToolDraftPO() {
    const lowItems = store.products.filter(p => p.stock <= p.reorderLevel);
    const poItems = lowItems.map(p => {
      const suggestedQty = p.targetStock - p.stock;
      const totalCost = suggestedQty * p.costPrice;
      return { product: p, qty: suggestedQty, totalCost };
    });

    const grandTotal = poItems.reduce((acc, i) => acc + i.totalCost, 0);

    appendCopilotMessage(`
      <strong>🛠️ Executed Tool: <code>draft_purchase_order()</code></strong>
      <br/><br/>
      Based on historical 30-day sales velocity and EOQ reorder equations, I have generated an automated Purchase Order draft:
      <br/><br/>
      <div style="background: rgba(0,0,0,0.3); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-glow); margin: 0.5rem 0;">
        <div style="font-weight: 700; color: var(--accent-purple); font-size: 0.9rem; margin-bottom: 0.5rem;">Draft PO #PO-4093 (TechDistro & Urban Apparel)</div>
        ${poItems.map(i => `
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.3rem;">
            <span>${i.product.name} (x${i.qty} units)</span>
            <span style="font-weight: 700;">$${i.totalCost.toFixed(2)}</span>
          </div>
        `).join('')}
        <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 0.9rem; border-top: 1px dashed var(--border-color); padding-top: 0.4rem; margin-top: 0.4rem;">
          <span>Estimated Total Cost:</span>
          <span style="color: var(--success);">$${grandTotal.toFixed(2)}</span>
        </div>
      </div>
      <br/>
      <button class="btn btn-copilot" style="width: 100%; font-size: 0.8rem; padding: 0.5rem;" onclick="window.approveDraftPO('PO-4092')">
        Approve & Send PO to Suppliers
      </button>
    `);
  }

  // AI Function Tool #2: Sales & Profit Summary
  function executeToolSalesSummary() {
    const totalSales = store.salesHistory.reduce((acc, s) => acc + s.total, 0);
    const topSeller = store.products[0];

    appendCopilotMessage(`
      <strong>🛠️ Executed Tool: <code>get_sales_analytics(dateRange="TODAY")</code></strong>
      <br/><br/>
      📊 <strong>Sales & Profit Metrics Summary:</strong>
      <ul style="margin-left: 1.2rem; margin-top: 0.4rem; font-size: 0.85rem;">
        <li>Total Today Revenue: <strong>$${totalSales.toFixed(2)}</strong></li>
        <li>Gross Profit Margin: <strong>38.2%</strong> (+2.1% optimized)</li>
        <li>Top Performing SKU: <strong>${topSeller.name}</strong> ($249.99)</li>
      </ul>
      <br/>
      <em>Recommendation:</em> Demand for Pro Headphones is spiking 25% faster than last week. Consider raising reorder threshold from 10 to 15.
    `);
  }

  // AI Function Tool #3: Stockout Risk Analysis
  function executeToolStockoutRisk() {
    const risks = store.products.filter(p => p.stock <= p.reorderLevel);
    appendCopilotMessage(`
      <strong>🛠️ Executed Tool: <code>get_inventory_stockout_risk()</code></strong>
      <br/><br/>
      ⚠️ <strong>High Stockout Risk Assessment:</strong>
      <br/>
      ${risks.map(r => `
        <div style="margin-top: 0.4rem; font-size: 0.8rem;">
          🔴 <strong>${r.name}</strong>: Only <strong>${r.stock} units remaining</strong> (Min threshold: ${r.reorderLevel}). Lead time from supplier is 3 days.
        </div>
      `).join('')}
    `);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.initCopilot();
  });
})();
