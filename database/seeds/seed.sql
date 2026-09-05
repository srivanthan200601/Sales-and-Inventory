-- Retail Sales and Inventory Copilot (TRACK_DIPHS08)
-- Initial Seeds for Testing & Demonstration

INSERT INTO stores (id, name, code, address, phone, email, tax_rate) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Apex Retail Flagship - Store #101', 'STORE-101', '742 Evergreen Terrace, Springfield', '+1 555-0199', 'store101@apexretail.com', 0.0800)
ON CONFLICT DO NOTHING;

INSERT INTO categories (id, name, slug) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Electronics & Tech', 'electronics'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Apparel & Fashion', 'apparel'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Home & Living', 'home'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Groceries & Snacks', 'groceries'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Accessories', 'accessories')
ON CONFLICT DO NOTHING;

INSERT INTO suppliers (id, name, contact_person, email, phone, lead_time_days, reliability_score) VALUES
('s0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'TechDistro Global Inc', 'Sarah Jenkins', 'orders@techdistro.com', '+1 555-2345', 3, 98.50),
('s0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Urban Apparel Logistics', 'David Vance', 'supply@urbanapparel.co', '+1 555-8765', 5, 94.00)
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, sku, barcode, category_id, supplier_id, base_price, cost_price, unit, image_url) VALUES
('p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Pro Wireless Noise-Canceling Headphones', 'EL-HP-001', '8901234567891', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 's0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 249.99, 135.00, 'pcs', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
('p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Apex Ultra Smartwatch Series 5', 'EL-SW-002', '8901234567892', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 's0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 199.50, 105.00, 'pcs', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
('p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Waterproof Thermal Winter Jacket', 'AP-JK-003', '8901234567893', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 's0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 129.99, 58.00, 'pcs', 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500')
ON CONFLICT DO NOTHING;

INSERT INTO inventory (id, store_id, product_id, quantity_on_hand, reorder_level, target_stock_level, location_rack) VALUES
('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 6, 10, 30, 'Aisle A - Shelf 2'),
('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 4, 8, 25, 'Aisle A - Shelf 1'),
('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 18, 5, 20, 'Aisle C - Rack 4')
ON CONFLICT DO NOTHING;
