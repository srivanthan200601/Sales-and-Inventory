-- Retail Sales and Inventory Copilot (TRACK_DIPHS08)
-- Comprehensive Seed Data for All 18 Database Entities

-- ============================================================================
-- ROLES
-- ============================================================================
INSERT INTO roles (id, code, name, description, permissions) VALUES
('r0000001-0000-0000-0000-000000000001', 'SUPER_ADMIN',          'Super Administrator',      'Full system access across all stores',            '["*"]'),
('r0000001-0000-0000-0000-000000000002', 'STORE_MANAGER',        'Store Manager',            'Manage store operations, staff, and reporting',   '["sales.*","inventory.*","products.*","analytics.*","suppliers.*"]'),
('r0000001-0000-0000-0000-000000000003', 'INVENTORY_SPECIALIST', 'Inventory Specialist',     'Manage stock levels, adjustments and transfers',  '["inventory.*","products.read","suppliers.read"]'),
('r0000001-0000-0000-0000-000000000004', 'CASHIER',              'Cashier / Sales Rep',      'Process sales, handle POS terminal and receipts', '["sales.create","sales.read","products.read"]'),
('r0000001-0000-0000-0000-000000000005', 'AUDITOR',              'Executive / Auditor',      'Read-only access to analytics and reports',       '["analytics.*","sales.read","inventory.read"]')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STORES
-- ============================================================================
INSERT INTO stores (id, code, name, address, phone, email, tax_rate) VALUES
('s0000001-0000-0000-0000-000000000001', 'STORE-101', 'Apex Retail Flagship — Store #101', '742 Evergreen Terrace, Downtown, Springfield, IL 62704', '+1 (555) 019-9101', 'store101@apexretail.com', 0.0800),
('s0000001-0000-0000-0000-000000000002', 'STORE-102', 'Apex Retail — Westside Mall',       '18 Mall Blvd, West Springfield, IL 62703',             '+1 (555) 019-9102', 'store102@apexretail.com', 0.0800)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- USERS (password_hash represents bcrypt of "password123" for demo)
-- ============================================================================
INSERT INTO users (id, email, password_hash, full_name, role_id, store_id) VALUES
('u0000001-0000-0000-0000-000000000001', 'admin@apexretail.com',         '$2b$10$nB4oJn5j5wRBjRCgqQTJxuWQJWEVCUQdN.0dQj4bKnWtZ7VE7OiZ6', 'System Administrator', 'r0000001-0000-0000-0000-000000000001', NULL),
('u0000001-0000-0000-0000-000000000002', 'alex.morgan@apexretail.com',   '$2b$10$nB4oJn5j5wRBjRCgqQTJxuWQJWEVCUQdN.0dQj4bKnWtZ7VE7OiZ6', 'Alex Morgan',          'r0000001-0000-0000-0000-000000000002', 's0000001-0000-0000-0000-000000000001'),
('u0000001-0000-0000-0000-000000000003', 'diana.chen@apexretail.com',    '$2b$10$nB4oJn5j5wRBjRCgqQTJxuWQJWEVCUQdN.0dQj4bKnWtZ7VE7OiZ6', 'Diana Chen',           'r0000001-0000-0000-0000-000000000003', 's0000001-0000-0000-0000-000000000001'),
('u0000001-0000-0000-0000-000000000004', 'mia.walker@apexretail.com',    '$2b$10$nB4oJn5j5wRBjRCgqQTJxuWQJWEVCUQdN.0dQj4bKnWtZ7VE7OiZ6', 'Mia Walker',           'r0000001-0000-0000-0000-000000000004', 's0000001-0000-0000-0000-000000000001'),
('u0000001-0000-0000-0000-000000000005', 'james.patel@apexretail.com',   '$2b$10$nB4oJn5j5wRBjRCgqQTJxuWQJWEVCUQdN.0dQj4bKnWtZ7VE7OiZ6', 'James Patel',          'r0000001-0000-0000-0000-000000000004', 's0000001-0000-0000-0000-000000000001'),
('u0000001-0000-0000-0000-000000000006', 'olivia.james@apexretail.com',  '$2b$10$nB4oJn5j5wRBjRCgqQTJxuWQJWEVCUQdN.0dQj4bKnWtZ7VE7OiZ6', 'Olivia James',         'r0000001-0000-0000-0000-000000000005', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CATEGORIES
-- ============================================================================
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('c0000001-0000-0000-0000-000000000001', 'Electronics & Tech',      'electronics',      NULL, 'Consumer electronics, gadgets, and tech accessories'),
('c0000001-0000-0000-0000-000000000002', 'Apparel & Fashion',        'apparel',          NULL, 'Clothing, footwear, and fashion accessories'),
('c0000001-0000-0000-0000-000000000003', 'Home & Living',            'home',             NULL, 'Furniture, decor, kitchenware, and home essentials'),
('c0000001-0000-0000-0000-000000000004', 'Groceries & Snacks',       'groceries',        NULL, 'Fresh produce, packaged foods, and beverages'),
('c0000001-0000-0000-0000-000000000005', 'Accessories',              'accessories',      NULL, 'Bags, jewellery, sunglasses, and lifestyle accessories'),
('c0000001-0000-0000-0000-000000000006', 'Audio & Headphones',       'audio',            'c0000001-0000-0000-0000-000000000001', 'Headphones, earbuds, and speakers'),
('c0000001-0000-0000-0000-000000000007', 'Wearables & Smartwatches', 'wearables',        'c0000001-0000-0000-0000-000000000001', 'Smartwatches and fitness trackers')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUPPLIERS
-- ============================================================================
INSERT INTO suppliers (id, code, name, contact_person, email, phone, address, lead_time_days, reliability_score) VALUES
('sp000001-0000-0000-0000-000000000001', 'SUP-TDG', 'TechDistro Global Inc',     'Sarah Jenkins',  'orders@techdistro.com',     '+1 (555) 234-5678', '120 Tech Park Blvd, San Jose, CA 95110',      3,  98.50),
('sp000001-0000-0000-0000-000000000002', 'SUP-UAL', 'Urban Apparel Logistics',   'David Vance',    'supply@urbanapparel.co',    '+1 (555) 876-5432', '44 Fashion District Ave, New York, NY 10018', 5,  94.00),
('sp000001-0000-0000-0000-000000000003', 'SUP-ECO', 'EcoHome Supplies Co',       'Elena Rostova',  'b2b@ecohome.org',           '+1 (555) 345-6789', '8 Green Valley Rd, Portland, OR 97201',       4,  96.25),
('sp000001-0000-0000-0000-000000000004', 'SUP-FGW', 'FreshGourmet Wholesale',    'Marcus Brody',   'sales@freshgourmet.com',    '+1 (555) 987-6543', '200 Produce Lane, Chicago, IL 60609',         2,  99.10)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PRODUCTS
-- ============================================================================
INSERT INTO products (id, sku, barcode, name, description, category_id, supplier_id, base_price, cost_price, unit, image_url) VALUES
('p0000001-0000-0000-0000-000000000001', 'EL-HP-001', '8901234567891', 'Pro Wireless Noise-Canceling Headphones', 'Premium over-ear ANC headphones, 40h battery, Bluetooth 5.3',              'c0000001-0000-0000-0000-000000000006', 'sp000001-0000-0000-0000-000000000001', 249.99, 135.00, 'pcs',  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
('p0000001-0000-0000-0000-000000000002', 'EL-SW-002', '8901234567892', 'Apex Ultra Smartwatch Series 5',          'AMOLED smartwatch, heart-rate GPS, water-resistant IP68',                  'c0000001-0000-0000-0000-000000000007', 'sp000001-0000-0000-0000-000000000001', 199.50, 105.00, 'pcs',  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
('p0000001-0000-0000-0000-000000000003', 'EL-SP-003', '8901234567893', 'Compact Waterproof Bluetooth Speaker',    'IPX7 360° surround sound, 12-hour playtime, USB-C charging',               'c0000001-0000-0000-0000-000000000006', 'sp000001-0000-0000-0000-000000000001',  59.99,  25.00, 'pcs',  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'),
('p0000001-0000-0000-0000-000000000004', 'AP-JK-004', '8901234567894', 'Waterproof Thermal Winter Jacket',        'Insulated windproof jacket, fleece lining, multiple pockets',              'c0000001-0000-0000-0000-000000000002', 'sp000001-0000-0000-0000-000000000002', 129.99,  58.00, 'pcs',  'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500'),
('p0000001-0000-0000-0000-000000000005', 'AP-SN-005', '8901234567895', 'Urban Runner Air Sneakers',               'Breathable mesh sole, responsive memory foam cushioning',                  'c0000001-0000-0000-0000-000000000002', 'sp000001-0000-0000-0000-000000000002',  89.95,  38.50, 'prs',  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'),
('p0000001-0000-0000-0000-000000000006', 'HM-DL-006', '8901234567896', 'Minimalist Ceramic Desk Lamp',            'Warm LED dimmable lamp, touch sensor, wireless charging pad',              'c0000001-0000-0000-0000-000000000003', 'sp000001-0000-0000-0000-000000000003',  49.99,  21.00, 'pcs',  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'),
('p0000001-0000-0000-0000-000000000007', 'GR-CB-007', '8901234567897', 'Artisan Organic Coffee Beans (1kg)',      'Single-origin medium roast, dark chocolate and caramel notes',             'c0000001-0000-0000-0000-000000000004', 'sp000001-0000-0000-0000-000000000004',  24.50,   9.80, 'bag',  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500'),
('p0000001-0000-0000-0000-000000000008', 'AC-SG-008', '8901234567898', 'Polarized UV400 Aviator Sunglasses',      'Classic gold-framed polarized lenses, scratch-resistant coating',          'c0000001-0000-0000-0000-000000000005', 'sp000001-0000-0000-0000-000000000002',  64.99,  22.00, 'pcs',  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500'),
('p0000001-0000-0000-0000-000000000009', 'EL-LP-009', '8901234567899', 'Slim Wireless Charging Laptop Stand',     'Adjustable aluminum stand with 15W wireless charging pad',                 'c0000001-0000-0000-0000-000000000001', 'sp000001-0000-0000-0000-000000000001',  79.99,  32.00, 'pcs',  'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=500'),
('p0000001-0000-0000-0000-000000000010', 'GR-GR-010', '8901234567900', 'Cold Pressed Juice Pack (6-bottle set)',  'Assorted cold-pressed juices, no preservatives, refrigerated',             'c0000001-0000-0000-0000-000000000004', 'sp000001-0000-0000-0000-000000000004',  18.99,   7.20, 'set',  'https://images.unsplash.com/photo-1622597467836-f3e6a1a99b7c?w=500')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INVENTORY (Store #101)
-- ============================================================================
INSERT INTO inventory (id, store_id, product_id, quantity_on_hand, quantity_reserved, reorder_level, target_stock_level, location_rack, status) VALUES
('i0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001',  6, 1, 10, 30, 'Aisle A — Shelf 2',   'LOW_STOCK'),
('i0000001-0000-0000-0000-000000000002', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000002',  4, 0,  8, 25, 'Aisle A — Shelf 1',   'LOW_STOCK'),
('i0000001-0000-0000-0000-000000000003', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000003', 14, 1,  8, 25, 'Aisle A — Shelf 4',   'IN_STOCK'),
('i0000001-0000-0000-0000-000000000004', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000004', 18, 2,  5, 20, 'Aisle C — Rack 4',    'IN_STOCK'),
('i0000001-0000-0000-0000-000000000005', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000005',  2, 0, 12, 40, 'Aisle C — Rack 1',    'LOW_STOCK'),
('i0000001-0000-0000-0000-000000000006', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000006', 22, 0,  6, 20, 'Aisle B — Shelf 3',   'OVERSTOCK'),
('i0000001-0000-0000-0000-000000000007', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000007', 45, 5, 15, 60, 'Aisle D — Shelf 1',   'IN_STOCK'),
('i0000001-0000-0000-0000-000000000008', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000008',  0, 0, 10, 30, 'Aisle E — Counter 2', 'OUT_OF_STOCK'),
('i0000001-0000-0000-0000-000000000009', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000009', 11, 0,  8, 25, 'Aisle A — Shelf 3',   'IN_STOCK'),
('i0000001-0000-0000-0000-000000000010', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000010', 32, 0, 12, 48, 'Aisle D — Shelf 2',   'IN_STOCK')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CUSTOMERS
-- ============================================================================
INSERT INTO customers (id, customer_code, name, phone, email, loyalty_points, customer_tier) VALUES
('cu000001-0000-0000-0000-000000000001', 'CUST-00001', 'Sarah Connor',      '+1 (555) 111-2222', 'sarah.connor@mail.com',   4800, 'GOLD'),
('cu000001-0000-0000-0000-000000000002', 'CUST-00002', 'David Miller',      '+1 (555) 222-3333', 'david.miller@mail.com',   1250, 'SILVER'),
('cu000001-0000-0000-0000-000000000003', 'CUST-00003', 'Emma Watson',       '+1 (555) 333-4444', 'emma.watson@mail.com',    9200, 'VIP'),
('cu000001-0000-0000-0000-000000000004', 'CUST-00004', 'Liam Johnson',      '+1 (555) 444-5555', 'liam.j@mail.com',          320, 'STANDARD'),
('cu000001-0000-0000-0000-000000000005', 'CUST-00005', 'Priya Nair',        '+1 (555) 555-6666', 'priya.nair@mail.com',     2100, 'SILVER')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SALES (5 transactions over 2 days)
-- ============================================================================
INSERT INTO sales (id, receipt_number, store_id, cashier_id, customer_id, subtotal, tax_amount, discount_amount, total_amount, payment_status, status, notes) VALUES
('sl000001-0000-0000-0000-000000000001', 'REC-98231', 's0000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000004', 'cu000001-0000-0000-0000-000000000001', 249.99, 20.00, 0.00,  269.99, 'PAID', 'COMPLETED', NULL),
('sl000001-0000-0000-0000-000000000002', 'REC-98232', 's0000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000004', NULL,                                   179.90, 14.39, 10.00, 184.29, 'PAID', 'COMPLETED', 'Walk-in customer discount applied'),
('sl000001-0000-0000-0000-000000000003', 'REC-98233', 's0000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000005', 'cu000001-0000-0000-0000-000000000002', 324.48, 25.96, 15.00, 335.44, 'PAID', 'COMPLETED', NULL),
('sl000001-0000-0000-0000-000000000004', 'REC-98234', 's0000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000005', 'cu000001-0000-0000-0000-000000000003', 199.50, 15.96, 0.00,  215.46, 'PAID', 'COMPLETED', NULL),
('sl000001-0000-0000-0000-000000000005', 'REC-98235', 's0000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000004', 'cu000001-0000-0000-0000-000000000003', 148.97, 11.92, 5.00,  155.89, 'PAID', 'COMPLETED', 'VIP customer reward discount')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SALE ITEMS
-- ============================================================================
INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, total_price) VALUES
('si000001-0000-0000-0000-000000000001', 'sl000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 1, 249.99, 135.00, 249.99),
('si000001-0000-0000-0000-000000000002', 'sl000001-0000-0000-0000-000000000002', 'p0000001-0000-0000-0000-000000000005', 2,  89.95,  38.50, 179.90),
('si000001-0000-0000-0000-000000000003', 'sl000001-0000-0000-0000-000000000003', 'p0000001-0000-0000-0000-000000000004', 1, 129.99,  58.00, 129.99),
('si000001-0000-0000-0000-000000000004', 'sl000001-0000-0000-0000-000000000003', 'p0000001-0000-0000-0000-000000000003', 1,  59.99,  25.00,  59.99),
('si000001-0000-0000-0000-000000000005', 'sl000001-0000-0000-0000-000000000003', 'p0000001-0000-0000-0000-000000000007', 5,  24.50,   9.80, 122.50),
('si000001-0000-0000-0000-000000000006', 'sl000001-0000-0000-0000-000000000004', 'p0000001-0000-0000-0000-000000000002', 1, 199.50, 105.00, 199.50),
('si000001-0000-0000-0000-000000000007', 'sl000001-0000-0000-0000-000000000005', 'p0000001-0000-0000-0000-000000000006', 1,  49.99,  21.00,  49.99),
('si000001-0000-0000-0000-000000000008', 'sl000001-0000-0000-0000-000000000005', 'p0000001-0000-0000-0000-000000000007', 4,  24.50,   9.80,  98.00)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PAYMENTS
-- ============================================================================
INSERT INTO payments (id, sale_id, payment_method, amount, status, transaction_reference) VALUES
('py000001-0000-0000-0000-000000000001', 'sl000001-0000-0000-0000-000000000001', 'CARD',         269.99, 'SUCCESS', 'TXN-CARD-78201'),
('py000001-0000-0000-0000-000000000002', 'sl000001-0000-0000-0000-000000000002', 'CASH',         184.29, 'SUCCESS', 'TXN-CASH-78202'),
('py000001-0000-0000-0000-000000000003', 'sl000001-0000-0000-0000-000000000003', 'UPI',          335.44, 'SUCCESS', 'TXN-UPI-78203'),
('py000001-0000-0000-0000-000000000004', 'sl000001-0000-0000-0000-000000000004', 'CARD',         215.46, 'SUCCESS', 'TXN-CARD-78204'),
('py000001-0000-0000-0000-000000000005', 'sl000001-0000-0000-0000-000000000005', 'STORE_CREDIT',  80.00, 'SUCCESS', 'TXN-SC-78205'),
('py000001-0000-0000-0000-000000000006', 'sl000001-0000-0000-0000-000000000005', 'CASH',          75.89, 'SUCCESS', 'TXN-CASH-78205-2')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PURCHASE ORDERS
-- ============================================================================
INSERT INTO purchase_orders (id, po_number, supplier_id, store_id, status, total_cost, created_by, expected_delivery) VALUES
('po000001-0000-0000-0000-000000000001', 'PO-4091', 'sp000001-0000-0000-0000-000000000004', 's0000001-0000-0000-0000-000000000001', 'COMPLETED',       245.00, 'u0000001-0000-0000-0000-000000000002', '2026-09-04'),
('po000001-0000-0000-0000-000000000002', 'PO-4092', 'sp000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'AI_RECOMMENDED', 1490.00, 'u0000001-0000-0000-0000-000000000002', '2026-09-08'),
('po000001-0000-0000-0000-000000000003', 'PO-4093', 'sp000001-0000-0000-0000-000000000002', 's0000001-0000-0000-0000-000000000001', 'SENT',            768.00, 'u0000001-0000-0000-0000-000000000002', '2026-09-10')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PURCHASE ORDER ITEMS
-- ============================================================================
INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity_ordered, quantity_received, unit_cost, total_cost) VALUES
('pi000001-0000-0000-0000-000000000001', 'po000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000007',  25, 25,  9.80,  245.00),
('pi000001-0000-0000-0000-000000000002', 'po000001-0000-0000-0000-000000000002', 'p0000001-0000-0000-0000-000000000001',   8,  0, 135.00, 1080.00),
('pi000001-0000-0000-0000-000000000003', 'po000001-0000-0000-0000-000000000002', 'p0000001-0000-0000-0000-000000000002',   4,  0, 105.00,  420.00),
('pi000001-0000-0000-0000-000000000004', 'po000001-0000-0000-0000-000000000003', 'p0000001-0000-0000-0000-000000000005',  20,  0,  38.50,  770.00)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STOCK MOVEMENTS
-- ============================================================================
INSERT INTO stock_movements (id, inventory_id, type, quantity_changed, previous_quantity, new_quantity, reference_type, reference_id, performed_by, reason) VALUES
('sm000001-0000-0000-0000-000000000001', 'i0000001-0000-0000-0000-000000000001', 'SALE',             -1,  7, 6, 'SALE', 'REC-98231', 'u0000001-0000-0000-0000-000000000004', NULL),
('sm000001-0000-0000-0000-000000000002', 'i0000001-0000-0000-0000-000000000005', 'SALE',             -2,  4, 2, 'SALE', 'REC-98232', 'u0000001-0000-0000-0000-000000000004', NULL),
('sm000001-0000-0000-0000-000000000003', 'i0000001-0000-0000-0000-000000000007', 'PURCHASE_RECEIPT', 25, 20, 45, 'PURCHASE_ORDER', 'PO-4091', 'u0000001-0000-0000-0000-000000000002', 'Received FreshGourmet coffee restock'),
('sm000001-0000-0000-0000-000000000004', 'i0000001-0000-0000-0000-000000000008', 'ADJUSTMENT_REMOVE',-3,  3, 0, 'ADJUSTMENT', 'ADJ-0904', 'u0000001-0000-0000-0000-000000000002', 'Damaged in transit — written off'),
('sm000001-0000-0000-0000-000000000005', 'i0000001-0000-0000-0000-000000000002', 'SALE',             -1,  5, 4, 'SALE', 'REC-98234', 'u0000001-0000-0000-0000-000000000005', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STOCK ALERTS
-- ============================================================================
INSERT INTO stock_alerts (id, store_id, product_id, type, current_quantity, reorder_level, status) VALUES
('al000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 'LOW_STOCK',    6, 10, 'ACTIVE'),
('al000001-0000-0000-0000-000000000002', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000002', 'LOW_STOCK',    4,  8, 'ACTIVE'),
('al000001-0000-0000-0000-000000000003', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000005', 'LOW_STOCK',    2, 12, 'ACTIVE'),
('al000001-0000-0000-0000-000000000004', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000008', 'OUT_OF_STOCK', 0, 10, 'ACTIVE')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AI RECOMMENDATIONS
-- ============================================================================
INSERT INTO ai_recommendations (id, store_id, product_id, type, recommended_quantity, eoq_value, confidence_score, prompt_context, status) VALUES
('ai000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 'REORDER_PO',       24, 21.91, 0.9420, 'Based on 30-day moving average demand of 14 units/month, current stock=6, reorder_level=10. EOQ calculated using ordering_cost=$50, holding_cost=$13.5/unit/year.', 'PENDING'),
('ai000001-0000-0000-0000-000000000002', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000002', 'REORDER_PO',       21, 18.62, 0.9110, 'Based on 30-day moving average demand of 11 units/month, current stock=4, reorder_level=8. EOQ = sqrt(2*132*50/10.5).', 'PENDING'),
('ai000001-0000-0000-0000-000000000003', 's0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000005', 'STOCKOUT_WARNING',  38, 34.05, 0.9750, 'Stockout risk HIGH within 3 days. 30-day velocity = 18 units. Current stock = 2. Lead time from supplier = 5 days. Immediate emergency order recommended.', 'PENDING')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
INSERT INTO audit_logs (id, user_id, action, entity_name, entity_id, old_values, new_values) VALUES
('lg000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000004', 'CREATE', 'sales',         'REC-98231', NULL, '{"receipt":"REC-98231","total":269.99}'),
('lg000001-0000-0000-0000-000000000002', 'u0000001-0000-0000-0000-000000000002', 'UPDATE', 'inventory',     'i0000001-0000-0000-0000-000000000007', '{"quantity_on_hand":20}', '{"quantity_on_hand":45}'),
('lg000001-0000-0000-0000-000000000003', 'u0000001-0000-0000-0000-000000000002', 'UPDATE', 'inventory',     'i0000001-0000-0000-0000-000000000008', '{"quantity_on_hand":3}',  '{"quantity_on_hand":0}'),
('lg000001-0000-0000-0000-000000000004', 'u0000001-0000-0000-0000-000000000002', 'CREATE', 'purchase_orders','PO-4092',  NULL, '{"po_number":"PO-4092","status":"AI_RECOMMENDED","total_cost":1490.00}')
ON CONFLICT DO NOTHING;
