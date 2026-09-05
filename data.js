// Retail - Sales and Inventory Copilot (TRACK_DIPHS08)
// Core Application State & Initial Mock Data

window.RetailStore = {
  meta: {
    projectId: "TRACK_DIPHS08",
    storeName: "Apex Retail Flagship - Store #101",
    currency: "$",
    taxRate: 0.08, // 8% sales tax
    user: {
      name: "Alex Morgan",
      role: "STORE_MANAGER",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    }
  },

  categories: [
    { id: "cat-1", name: "Electronics & Tech", slug: "electronics", icon: "laptop" },
    { id: "cat-2", name: "Apparel & Fashion", slug: "apparel", icon: "shirt" },
    { id: "cat-3", name: "Home & Living", slug: "home", icon: "home" },
    { id: "cat-4", name: "Groceries & Snacks", slug: "groceries", icon: "shopping-bag" },
    { id: "cat-5", name: "Accessories", slug: "accessories", icon: "watch" }
  ],

  suppliers: [
    { id: "sup-1", name: "TechDistro Global Inc", contact: "Sarah Jenkins", email: "orders@techdistro.com", phone: "+1 (555) 234-5678", leadTimeDays: 3, reliability: "98%" },
    { id: "sup-2", name: "Urban Apparel Logistics", contact: "David Vance", email: "supply@urbanapparel.co", phone: "+1 (555) 876-5432", leadTimeDays: 5, reliability: "94%" },
    { id: "sup-3", name: "EcoHome Supplies Co", contact: "Elena Rostova", email: "b2b@ecohome.org", phone: "+1 (555) 345-6789", leadTimeDays: 4, reliability: "96%" },
    { id: "sup-4", name: "FreshGourmet Wholesale", contact: "Marcus Brody", email: "sales@freshgourmet.com", phone: "+1 (555) 987-6543", leadTimeDays: 2, reliability: "99%" }
  ],

  products: [
    {
      id: "prod-101",
      sku: "EL-HP-001",
      barcode: "8901234567891",
      name: "Pro Wireless Noise-Canceling Headphones",
      category: "cat-1",
      supplierId: "sup-1",
      price: 249.99,
      costPrice: 135.00,
      stock: 6,
      reserved: 1,
      reorderLevel: 10,
      targetStock: 30,
      rack: "Aisle A - Shelf 2",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
      description: "Premium over-ear headphones with active noise cancellation and 40h battery life.",
      unit: "pcs",
      status: "LOW_STOCK"
    },
    {
      id: "prod-102",
      sku: "EL-SW-002",
      barcode: "8901234567892",
      name: "Apex Ultra Smartwatch Series 5",
      category: "cat-1",
      supplierId: "sup-1",
      price: 199.50,
      costPrice: 105.00,
      stock: 4,
      reserved: 0,
      reorderLevel: 8,
      targetStock: 25,
      rack: "Aisle A - Shelf 1",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
      description: "AMOLED display smartwatch with heart rate monitoring, GPS, and water resistance.",
      unit: "pcs",
      status: "LOW_STOCK"
    },
    {
      id: "prod-103",
      sku: "AP-JK-003",
      barcode: "8901234567893",
      name: "Waterproof Thermal Winter Jacket",
      category: "cat-2",
      supplierId: "sup-2",
      price: 129.99,
      costPrice: 58.00,
      stock: 18,
      reserved: 2,
      reorderLevel: 5,
      targetStock: 20,
      rack: "Aisle C - Rack 4",
      image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500&auto=format&fit=crop&q=80",
      description: "Insulated lightweight coat designed for extreme cold and wet weather.",
      unit: "pcs",
      status: "IN_STOCK"
    },
    {
      id: "prod-104",
      sku: "AP-SN-004",
      barcode: "8901234567894",
      name: "Urban Runner Air Sneakers",
      category: "cat-2",
      supplierId: "sup-2",
      price: 89.95,
      costPrice: 38.50,
      stock: 2,
      reserved: 0,
      reorderLevel: 12,
      targetStock: 40,
      rack: "Aisle C - Rack 1",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
      description: "Breathable mesh running shoes with responsive memory foam cushioning.",
      unit: "prs",
      status: "LOW_STOCK"
    },
    {
      id: "prod-105",
      sku: "HM-DL-005",
      barcode: "8901234567895",
      name: "Minimalist Ceramic Desk Lamp",
      category: "cat-3",
      supplierId: "sup-3",
      price: 49.99,
      costPrice: 21.00,
      stock: 22,
      reserved: 0,
      reorderLevel: 6,
      targetStock: 20,
      rack: "Aisle B - Shelf 3",
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80",
      description: "Warm LED dimmable desk lamp with touch sensor and wireless charging pad.",
      unit: "pcs",
      status: "IN_STOCK"
    },
    {
      id: "prod-106",
      sku: "HM-CB-006",
      barcode: "8901234567896",
      name: "Artisan Organic Coffee Beans (1kg)",
      category: "cat-4",
      supplierId: "sup-4",
      price: 24.50,
      costPrice: 9.80,
      stock: 45,
      reserved: 5,
      reorderLevel: 15,
      targetStock: 60,
      rack: "Aisle D - Shelf 1",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80",
      description: "Single-origin medium roast dark chocolate and caramel notes.",
      unit: "bag",
      status: "IN_STOCK"
    },
    {
      id: "prod-107",
      sku: "AC-SG-007",
      barcode: "8901234567897",
      name: "Polarized UV400 Aviator Sunglasses",
      category: "cat-5",
      supplierId: "sup-2",
      price: 64.99,
      costPrice: 22.00,
      stock: 0,
      reserved: 0,
      reorderLevel: 10,
      targetStock: 30,
      rack: "Aisle E - Counter 2",
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=80",
      description: "Classic gold-framed polarized lenses with scratch-resistant coating.",
      unit: "pcs",
      status: "OUT_OF_STOCK"
    },
    {
      id: "prod-108",
      sku: "EL-SP-008",
      barcode: "8901234567898",
      name: "Compact Waterproof Bluetooth Speaker",
      category: "cat-1",
      supplierId: "sup-1",
      price: 59.99,
      costPrice: 25.00,
      stock: 14,
      reserved: 1,
      reorderLevel: 8,
      targetStock: 25,
      rack: "Aisle A - Shelf 4",
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=80",
      description: "360-degree surround sound with IPX7 waterproofing and 12-hour playtime.",
      unit: "pcs",
      status: "IN_STOCK"
    }
  ],

  inventoryMovements: [
    { id: "mov-501", date: "2026-09-05 09:30", sku: "EL-HP-001", type: "SALE", qty: -1, prevQty: 7, newQty: 6, ref: "REC-98231", user: "Cashier - Mia" },
    { id: "mov-502", date: "2026-09-05 08:45", sku: "AP-SN-004", type: "SALE", qty: -2, prevQty: 4, newQty: 2, ref: "REC-98230", user: "Cashier - Mia" },
    { id: "mov-503", date: "2026-09-04 16:15", sku: "HM-CB-006", type: "PURCHASE_RECEIPT", qty: +25, prevQty: 20, newQty: 45, ref: "PO-4091", user: "Alex Morgan" },
    { id: "mov-504", date: "2026-09-04 14:00", sku: "AC-SG-007", type: "ADJUSTMENT_REMOVE", qty: -3, prevQty: 3, newQty: 0, ref: "AUDIT-0904", user: "Alex Morgan", reason: "Damaged in transit" }
  ],

  salesHistory: [
    { id: "REC-98231", date: "2026-09-05 09:30", customer: "Sarah Connor", itemsCount: 1, subtotal: 249.99, tax: 20.00, discount: 0, total: 269.99, paymentMethod: "CARD", status: "PAID" },
    { id: "REC-98230", date: "2026-09-05 08:45", customer: "Walk-in Customer", itemsCount: 2, subtotal: 179.90, tax: 14.39, discount: 10.00, total: 184.29, paymentMethod: "CASH", status: "PAID" },
    { id: "REC-98229", date: "2026-09-04 18:20", customer: "David Miller", itemsCount: 3, subtotal: 324.48, tax: 25.96, discount: 15.00, total: 335.44, paymentMethod: "UPI", status: "PAID" },
    { id: "REC-98228", date: "2026-09-04 15:10", customer: "Walk-in Customer", itemsCount: 1, subtotal: 199.50, tax: 15.96, discount: 0, total: 215.46, paymentMethod: "CARD", status: "PAID" },
    { id: "REC-98227", date: "2026-09-04 11:05", customer: "Emma Watson", itemsCount: 4, subtotal: 148.97, tax: 11.92, discount: 5.00, total: 155.89, paymentMethod: "CASH", status: "PAID" }
  ],

  purchaseOrders: [
    { id: "PO-4092", date: "2026-09-05", supplier: "TechDistro Global Inc", itemsCount: 2, totalCost: 1490.00, status: "AI_RECOMMENDED", expectedDelivery: "2026-09-08" },
    { id: "PO-4091", date: "2026-09-03", supplier: "FreshGourmet Wholesale", itemsCount: 1, totalCost: 245.00, status: "COMPLETED", expectedDelivery: "2026-09-04" }
  ],

  activeCart: {
    items: [],
    customerName: "Walk-in Customer",
    discountPercent: 0,
    appliedCoupon: null
  }
};
