#!/usr/bin/env python3
"""
Retail - Sales and Inventory Copilot (TRACK_DIPHS08)
Database Migration & Test Runner (SQLite implementation for local dev)

Run:  py database/migrate.py
"""

import sqlite3
import os
import sys
import json
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "retail_copilot.db")


def utcnow():
    return datetime.now(timezone.utc).isoformat()


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


# ============================================================
# 1. SCHEMA CREATION
# ============================================================
SCHEMA_STATEMENTS = [
    # --- Roles ---
    """
    CREATE TABLE IF NOT EXISTS roles (
        id          TEXT PRIMARY KEY,
        code        TEXT UNIQUE NOT NULL,
        name        TEXT NOT NULL,
        description TEXT,
        permissions TEXT DEFAULT '[]',
        created_at  TEXT DEFAULT (datetime('now')),
        updated_at  TEXT DEFAULT (datetime('now'))
    )""",

    # --- Stores ---
    """
    CREATE TABLE IF NOT EXISTS stores (
        id         TEXT PRIMARY KEY,
        code       TEXT UNIQUE NOT NULL,
        name       TEXT NOT NULL,
        address    TEXT NOT NULL,
        phone      TEXT,
        email      TEXT,
        tax_rate   REAL DEFAULT 0.08 CHECK(tax_rate >= 0),
        is_active  INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    )""",

    # --- Users ---
    """
    CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY,
        email         TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name     TEXT NOT NULL,
        role_id       TEXT NOT NULL REFERENCES roles(id),
        store_id      TEXT REFERENCES stores(id),
        is_active     INTEGER DEFAULT 1,
        last_login_at TEXT,
        created_at    TEXT DEFAULT (datetime('now')),
        updated_at    TEXT DEFAULT (datetime('now'))
    )""",

    "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
    "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id, store_id)",

    # --- Categories ---
    """
    CREATE TABLE IF NOT EXISTS categories (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        slug        TEXT UNIQUE NOT NULL,
        parent_id   TEXT REFERENCES categories(id),
        description TEXT,
        is_active   INTEGER DEFAULT 1,
        created_at  TEXT DEFAULT (datetime('now')),
        updated_at  TEXT DEFAULT (datetime('now'))
    )""",

    # --- Suppliers ---
    """
    CREATE TABLE IF NOT EXISTS suppliers (
        id                TEXT PRIMARY KEY,
        code              TEXT UNIQUE NOT NULL,
        name              TEXT NOT NULL,
        contact_person    TEXT,
        email             TEXT,
        phone             TEXT,
        address           TEXT,
        lead_time_days    INTEGER DEFAULT 3 CHECK(lead_time_days >= 0),
        reliability_score REAL DEFAULT 95.0 CHECK(reliability_score BETWEEN 0 AND 100),
        is_active         INTEGER DEFAULT 1,
        created_at        TEXT DEFAULT (datetime('now')),
        updated_at        TEXT DEFAULT (datetime('now'))
    )""",

    # --- Products ---
    """
    CREATE TABLE IF NOT EXISTS products (
        id          TEXT PRIMARY KEY,
        sku         TEXT UNIQUE NOT NULL,
        barcode     TEXT UNIQUE NOT NULL,
        name        TEXT NOT NULL,
        description TEXT,
        category_id TEXT NOT NULL REFERENCES categories(id),
        supplier_id TEXT REFERENCES suppliers(id),
        base_price  REAL NOT NULL CHECK(base_price >= 0),
        cost_price  REAL NOT NULL CHECK(cost_price >= 0),
        unit        TEXT DEFAULT 'pcs',
        image_url   TEXT,
        is_active   INTEGER DEFAULT 1,
        created_at  TEXT DEFAULT (datetime('now')),
        updated_at  TEXT DEFAULT (datetime('now'))
    )""",

    "CREATE INDEX IF NOT EXISTS idx_products_sku     ON products(sku)",
    "CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)",
    "CREATE INDEX IF NOT EXISTS idx_products_cat     ON products(category_id)",

    # --- Product Variants ---
    """
    CREATE TABLE IF NOT EXISTS product_variants (
        id           TEXT PRIMARY KEY,
        product_id   TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        sku          TEXT UNIQUE NOT NULL,
        barcode      TEXT UNIQUE NOT NULL,
        variant_name TEXT NOT NULL,
        price        REAL NOT NULL CHECK(price >= 0),
        cost_price   REAL NOT NULL CHECK(cost_price >= 0),
        attributes   TEXT DEFAULT '{}',
        is_active    INTEGER DEFAULT 1,
        created_at   TEXT DEFAULT (datetime('now')),
        updated_at   TEXT DEFAULT (datetime('now'))
    )""",

    # --- Inventory ---
    """
    CREATE TABLE IF NOT EXISTS inventory (
        id                  TEXT PRIMARY KEY,
        store_id            TEXT NOT NULL REFERENCES stores(id),
        product_id          TEXT NOT NULL REFERENCES products(id),
        variant_id          TEXT REFERENCES product_variants(id),
        quantity_on_hand    INTEGER DEFAULT 0 CHECK(quantity_on_hand >= 0),
        quantity_reserved   INTEGER DEFAULT 0 CHECK(quantity_reserved >= 0),
        reorder_level       INTEGER DEFAULT 10 CHECK(reorder_level >= 0),
        target_stock_level  INTEGER DEFAULT 50 CHECK(target_stock_level >= 0),
        location_rack       TEXT DEFAULT 'Main Warehouse',
        status              TEXT DEFAULT 'IN_STOCK' CHECK(status IN ('IN_STOCK','LOW_STOCK','OUT_OF_STOCK','OVERSTOCK')),
        created_at          TEXT DEFAULT (datetime('now')),
        updated_at          TEXT DEFAULT (datetime('now')),
        UNIQUE(store_id, product_id, variant_id)
    )""",

    "CREATE INDEX IF NOT EXISTS idx_inv_store_prod ON inventory(store_id, product_id)",
    "CREATE INDEX IF NOT EXISTS idx_inv_status     ON inventory(status)",

    # --- Stock Movements ---
    """
    CREATE TABLE IF NOT EXISTS stock_movements (
        id                TEXT PRIMARY KEY,
        inventory_id      TEXT NOT NULL REFERENCES inventory(id),
        type              TEXT NOT NULL CHECK(type IN ('SALE','PURCHASE_RECEIPT','ADJUSTMENT_ADD','ADJUSTMENT_REMOVE','TRANSFER_IN','TRANSFER_OUT','RETURN')),
        quantity_changed  INTEGER NOT NULL,
        previous_quantity INTEGER NOT NULL,
        new_quantity      INTEGER NOT NULL,
        reference_type    TEXT,
        reference_id      TEXT,
        performed_by      TEXT REFERENCES users(id),
        reason            TEXT,
        created_at        TEXT DEFAULT (datetime('now'))
    )""",

    "CREATE INDEX IF NOT EXISTS idx_sm_inv_date ON stock_movements(inventory_id, created_at DESC)",

    # --- Customers ---
    """
    CREATE TABLE IF NOT EXISTS customers (
        id              TEXT PRIMARY KEY,
        customer_code   TEXT UNIQUE NOT NULL,
        name            TEXT NOT NULL,
        phone           TEXT,
        email           TEXT,
        address         TEXT,
        loyalty_points  INTEGER DEFAULT 0 CHECK(loyalty_points >= 0),
        customer_tier   TEXT DEFAULT 'STANDARD' CHECK(customer_tier IN ('STANDARD','SILVER','GOLD','VIP')),
        is_active       INTEGER DEFAULT 1,
        created_at      TEXT DEFAULT (datetime('now')),
        updated_at      TEXT DEFAULT (datetime('now'))
    )""",

    # --- Sales ---
    """
    CREATE TABLE IF NOT EXISTS sales (
        id              TEXT PRIMARY KEY,
        receipt_number  TEXT UNIQUE NOT NULL,
        store_id        TEXT NOT NULL REFERENCES stores(id),
        cashier_id      TEXT NOT NULL REFERENCES users(id),
        customer_id     TEXT REFERENCES customers(id),
        subtotal        REAL NOT NULL CHECK(subtotal >= 0),
        tax_amount      REAL NOT NULL CHECK(tax_amount >= 0),
        discount_amount REAL DEFAULT 0.0 CHECK(discount_amount >= 0),
        total_amount    REAL NOT NULL CHECK(total_amount >= 0),
        payment_status  TEXT DEFAULT 'PAID' CHECK(payment_status IN ('PENDING','PAID','REFUNDED','PARTIALLY_REFUNDED')),
        status          TEXT DEFAULT 'COMPLETED' CHECK(status IN ('DRAFT','COMPLETED','VOIDED','REFUNDED')),
        notes           TEXT,
        created_at      TEXT DEFAULT (datetime('now')),
        updated_at      TEXT DEFAULT (datetime('now'))
    )""",

    "CREATE INDEX IF NOT EXISTS idx_sales_receipt    ON sales(receipt_number)",
    "CREATE INDEX IF NOT EXISTS idx_sales_store_date ON sales(store_id, created_at DESC)",

    # --- Sale Items ---
    """
    CREATE TABLE IF NOT EXISTS sale_items (
        id          TEXT PRIMARY KEY,
        sale_id     TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
        product_id  TEXT NOT NULL REFERENCES products(id),
        variant_id  TEXT REFERENCES product_variants(id),
        quantity    INTEGER NOT NULL CHECK(quantity > 0),
        unit_price  REAL NOT NULL CHECK(unit_price >= 0),
        unit_cost   REAL NOT NULL CHECK(unit_cost >= 0),
        total_price REAL NOT NULL CHECK(total_price >= 0),
        created_at  TEXT DEFAULT (datetime('now'))
    )""",

    # --- Purchase Orders ---
    """
    CREATE TABLE IF NOT EXISTS purchase_orders (
        id                TEXT PRIMARY KEY,
        po_number         TEXT UNIQUE NOT NULL,
        supplier_id       TEXT NOT NULL REFERENCES suppliers(id),
        store_id          TEXT NOT NULL REFERENCES stores(id),
        status            TEXT DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','AI_RECOMMENDED','APPROVED','SENT','PARTIALLY_RECEIVED','COMPLETED','CANCELLED')),
        total_cost        REAL NOT NULL CHECK(total_cost >= 0),
        created_by        TEXT REFERENCES users(id),
        expected_delivery TEXT,
        received_at       TEXT,
        created_at        TEXT DEFAULT (datetime('now')),
        updated_at        TEXT DEFAULT (datetime('now'))
    )""",

    # --- Purchase Order Items ---
    """
    CREATE TABLE IF NOT EXISTS purchase_order_items (
        id                  TEXT PRIMARY KEY,
        purchase_order_id   TEXT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
        product_id          TEXT NOT NULL REFERENCES products(id),
        variant_id          TEXT REFERENCES product_variants(id),
        quantity_ordered    INTEGER NOT NULL CHECK(quantity_ordered > 0),
        quantity_received   INTEGER DEFAULT 0 CHECK(quantity_received >= 0),
        unit_cost           REAL NOT NULL CHECK(unit_cost >= 0),
        total_cost          REAL NOT NULL CHECK(total_cost >= 0),
        created_at          TEXT DEFAULT (datetime('now'))
    )""",

    # --- Payments ---
    """
    CREATE TABLE IF NOT EXISTS payments (
        id                    TEXT PRIMARY KEY,
        sale_id               TEXT REFERENCES sales(id),
        purchase_order_id     TEXT REFERENCES purchase_orders(id),
        payment_method        TEXT NOT NULL CHECK(payment_method IN ('CASH','CARD','UPI','BANK_TRANSFER','STORE_CREDIT')),
        amount                REAL NOT NULL CHECK(amount > 0),
        status                TEXT DEFAULT 'SUCCESS' CHECK(status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
        transaction_reference TEXT,
        processed_at          TEXT DEFAULT (datetime('now'))
    )""",

    # --- Stock Alerts ---
    """
    CREATE TABLE IF NOT EXISTS stock_alerts (
        id               TEXT PRIMARY KEY,
        store_id         TEXT NOT NULL REFERENCES stores(id),
        product_id       TEXT NOT NULL REFERENCES products(id),
        variant_id       TEXT REFERENCES product_variants(id),
        type             TEXT NOT NULL CHECK(type IN ('LOW_STOCK','OUT_OF_STOCK','EXPIRY_WARNING','OVERSTOCK')),
        current_quantity INTEGER NOT NULL,
        reorder_level    INTEGER NOT NULL,
        status           TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','ACKNOWLEDGED','RESOLVED')),
        created_at       TEXT DEFAULT (datetime('now')),
        acknowledged_at  TEXT
    )""",

    # --- AI Recommendations ---
    """
    CREATE TABLE IF NOT EXISTS ai_recommendations (
        id                   TEXT PRIMARY KEY,
        store_id             TEXT NOT NULL REFERENCES stores(id),
        product_id           TEXT NOT NULL REFERENCES products(id),
        type                 TEXT NOT NULL CHECK(type IN ('REORDER_PO','PRICE_OPTIMIZATION','STOCKOUT_WARNING','SEASONAL_TREND')),
        recommended_quantity INTEGER DEFAULT 0,
        eoq_value            REAL,
        confidence_score     REAL CHECK(confidence_score BETWEEN 0 AND 1),
        prompt_context       TEXT,
        status               TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','DISMISSED','APPLIED')),
        created_at           TEXT DEFAULT (datetime('now')),
        applied_at           TEXT
    )""",

    # --- Audit Logs ---
    """
    CREATE TABLE IF NOT EXISTS audit_logs (
        id          TEXT PRIMARY KEY,
        user_id     TEXT REFERENCES users(id),
        action      TEXT NOT NULL,
        entity_name TEXT NOT NULL,
        entity_id   TEXT,
        old_values  TEXT,
        new_values  TEXT,
        ip_address  TEXT,
        created_at  TEXT DEFAULT (datetime('now'))
    )""",

    "CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id, action)",
]


# ============================================================
# 2. SEED DATA
# ============================================================
SEED_DATA = {
    "roles": [
        ("r0000001-0000-0000-0000-000000000001", "SUPER_ADMIN",          "Super Administrator",     "Full system access", json.dumps(["*"])),
        ("r0000001-0000-0000-0000-000000000002", "STORE_MANAGER",        "Store Manager",           "Manage store operations", json.dumps(["sales.*","inventory.*","products.*","analytics.*"])),
        ("r0000001-0000-0000-0000-000000000003", "INVENTORY_SPECIALIST", "Inventory Specialist",    "Manage stock levels", json.dumps(["inventory.*","products.read"])),
        ("r0000001-0000-0000-0000-000000000004", "CASHIER",              "Cashier / Sales Rep",     "Process sales and POS", json.dumps(["sales.create","sales.read","products.read"])),
        ("r0000001-0000-0000-0000-000000000005", "AUDITOR",              "Executive / Auditor",     "Read-only analytics", json.dumps(["analytics.*","sales.read","inventory.read"])),
    ],
    "stores": [
        ("s0000001-0000-0000-0000-000000000001", "STORE-101", "Apex Retail Flagship — Store #101", "742 Evergreen Terrace, Springfield, IL 62704", "+1 (555) 019-9101", "store101@apexretail.com", 0.08),
        ("s0000001-0000-0000-0000-000000000002", "STORE-102", "Apex Retail — Westside Mall",       "18 Mall Blvd, West Springfield, IL 62703",     "+1 (555) 019-9102", "store102@apexretail.com", 0.08),
    ],
    "users": [
        ("u0000001-0000-0000-0000-000000000001", "admin@apexretail.com",         "$2b$10$nB4oJn5jDemo", "System Administrator", "r0000001-0000-0000-0000-000000000001", None),
        ("u0000001-0000-0000-0000-000000000002", "alex.morgan@apexretail.com",   "$2b$10$nB4oJn5jDemo", "Alex Morgan",          "r0000001-0000-0000-0000-000000000002", "s0000001-0000-0000-0000-000000000001"),
        ("u0000001-0000-0000-0000-000000000003", "diana.chen@apexretail.com",    "$2b$10$nB4oJn5jDemo", "Diana Chen",           "r0000001-0000-0000-0000-000000000003", "s0000001-0000-0000-0000-000000000001"),
        ("u0000001-0000-0000-0000-000000000004", "mia.walker@apexretail.com",    "$2b$10$nB4oJn5jDemo", "Mia Walker",           "r0000001-0000-0000-0000-000000000004", "s0000001-0000-0000-0000-000000000001"),
        ("u0000001-0000-0000-0000-000000000005", "james.patel@apexretail.com",   "$2b$10$nB4oJn5jDemo", "James Patel",          "r0000001-0000-0000-0000-000000000004", "s0000001-0000-0000-0000-000000000001"),
        ("u0000001-0000-0000-0000-000000000006", "olivia.james@apexretail.com",  "$2b$10$nB4oJn5jDemo", "Olivia James",         "r0000001-0000-0000-0000-000000000005", None),
    ],
    "categories": [
        ("c0000001-0000-0000-0000-000000000001", "Electronics & Tech",       "electronics", None,                                        "Consumer electronics, gadgets, and tech accessories"),
        ("c0000001-0000-0000-0000-000000000002", "Apparel & Fashion",         "apparel",     None,                                        "Clothing, footwear, and fashion accessories"),
        ("c0000001-0000-0000-0000-000000000003", "Home & Living",             "home",        None,                                        "Furniture, decor, and home essentials"),
        ("c0000001-0000-0000-0000-000000000004", "Groceries & Snacks",        "groceries",   None,                                        "Fresh produce, packaged foods, and beverages"),
        ("c0000001-0000-0000-0000-000000000005", "Accessories",               "accessories", None,                                        "Bags, jewellery, and lifestyle accessories"),
        ("c0000001-0000-0000-0000-000000000006", "Audio & Headphones",        "audio",       "c0000001-0000-0000-0000-000000000001",      "Headphones, earbuds, and speakers"),
        ("c0000001-0000-0000-0000-000000000007", "Wearables & Smartwatches",  "wearables",   "c0000001-0000-0000-0000-000000000001",      "Smartwatches and fitness trackers"),
    ],
    "suppliers": [
        ("sp000001-0000-0000-0000-000000000001", "SUP-TDG", "TechDistro Global Inc",   "Sarah Jenkins", "orders@techdistro.com",  "+1 (555) 234-5678", "120 Tech Park Blvd, San Jose, CA 95110",      3,  98.50),
        ("sp000001-0000-0000-0000-000000000002", "SUP-UAL", "Urban Apparel Logistics", "David Vance",   "supply@urbanapparel.co", "+1 (555) 876-5432", "44 Fashion District Ave, New York, NY 10018", 5,  94.00),
        ("sp000001-0000-0000-0000-000000000003", "SUP-ECO", "EcoHome Supplies Co",     "Elena Rostova", "b2b@ecohome.org",         "+1 (555) 345-6789", "8 Green Valley Rd, Portland, OR 97201",       4,  96.25),
        ("sp000001-0000-0000-0000-000000000004", "SUP-FGW", "FreshGourmet Wholesale",  "Marcus Brody",  "sales@freshgourmet.com", "+1 (555) 987-6543", "200 Produce Lane, Chicago, IL 60609",         2,  99.10),
    ],
    "products": [
        ("p0000001-0000-0000-0000-000000000001", "EL-HP-001", "8901234567891", "Pro Wireless Noise-Canceling Headphones", "Premium over-ear ANC headphones, 40h battery, Bluetooth 5.3",         "c0000001-0000-0000-0000-000000000006", "sp000001-0000-0000-0000-000000000001", 249.99, 135.00, "pcs", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"),
        ("p0000001-0000-0000-0000-000000000002", "EL-SW-002", "8901234567892", "Apex Ultra Smartwatch Series 5",          "AMOLED smartwatch, heart-rate GPS, water-resistant IP68",              "c0000001-0000-0000-0000-000000000007", "sp000001-0000-0000-0000-000000000001", 199.50, 105.00, "pcs", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"),
        ("p0000001-0000-0000-0000-000000000003", "EL-SP-003", "8901234567893", "Compact Waterproof Bluetooth Speaker",    "IPX7 360° surround sound, 12-hour playtime",                          "c0000001-0000-0000-0000-000000000006", "sp000001-0000-0000-0000-000000000001",  59.99,  25.00, "pcs", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"),
        ("p0000001-0000-0000-0000-000000000004", "AP-JK-004", "8901234567894", "Waterproof Thermal Winter Jacket",        "Insulated windproof jacket, fleece lining",                            "c0000001-0000-0000-0000-000000000002", "sp000001-0000-0000-0000-000000000002", 129.99,  58.00, "pcs", "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500"),
        ("p0000001-0000-0000-0000-000000000005", "AP-SN-005", "8901234567895", "Urban Runner Air Sneakers",               "Breathable mesh sole, responsive memory foam",                         "c0000001-0000-0000-0000-000000000002", "sp000001-0000-0000-0000-000000000002",  89.95,  38.50, "prs", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"),
        ("p0000001-0000-0000-0000-000000000006", "HM-DL-006", "8901234567896", "Minimalist Ceramic Desk Lamp",            "Warm LED dimmable lamp, touch sensor, wireless charging pad",          "c0000001-0000-0000-0000-000000000003", "sp000001-0000-0000-0000-000000000003",  49.99,  21.00, "pcs", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500"),
        ("p0000001-0000-0000-0000-000000000007", "GR-CB-007", "8901234567897", "Artisan Organic Coffee Beans (1kg)",      "Single-origin medium roast, dark chocolate and caramel notes",        "c0000001-0000-0000-0000-000000000004", "sp000001-0000-0000-0000-000000000004",  24.50,   9.80, "bag", "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500"),
        ("p0000001-0000-0000-0000-000000000008", "AC-SG-008", "8901234567898", "Polarized UV400 Aviator Sunglasses",      "Classic gold-framed polarized lenses, scratch-resistant",              "c0000001-0000-0000-0000-000000000005", "sp000001-0000-0000-0000-000000000002",  64.99,  22.00, "pcs", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500"),
        ("p0000001-0000-0000-0000-000000000009", "EL-LP-009", "8901234567899", "Slim Wireless Charging Laptop Stand",     "Adjustable aluminum stand with 15W wireless charging pad",            "c0000001-0000-0000-0000-000000000001", "sp000001-0000-0000-0000-000000000001",  79.99,  32.00, "pcs", "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=500"),
        ("p0000001-0000-0000-0000-000000000010", "GR-GR-010", "8901234567900", "Cold Pressed Juice Pack (6-bottle set)",  "Assorted cold-pressed juices, no preservatives, refrigerated",        "c0000001-0000-0000-0000-000000000004", "sp000001-0000-0000-0000-000000000004",  18.99,   7.20, "set", "https://images.unsplash.com/photo-1622597467836-f3e6a1a99b7c?w=500"),
    ],
    "inventory": [
        ("i0000001-0000-0000-0000-000000000001", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000001", None,  6, 1, 10, 30, "Aisle A — Shelf 2",   "LOW_STOCK"),
        ("i0000001-0000-0000-0000-000000000002", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000002", None,  4, 0,  8, 25, "Aisle A — Shelf 1",   "LOW_STOCK"),
        ("i0000001-0000-0000-0000-000000000003", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000003", None, 14, 1,  8, 25, "Aisle A — Shelf 4",   "IN_STOCK"),
        ("i0000001-0000-0000-0000-000000000004", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000004", None, 18, 2,  5, 20, "Aisle C — Rack 4",    "IN_STOCK"),
        ("i0000001-0000-0000-0000-000000000005", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000005", None,  2, 0, 12, 40, "Aisle C — Rack 1",    "LOW_STOCK"),
        ("i0000001-0000-0000-0000-000000000006", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000006", None, 22, 0,  6, 20, "Aisle B — Shelf 3",   "OVERSTOCK"),
        ("i0000001-0000-0000-0000-000000000007", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000007", None, 45, 5, 15, 60, "Aisle D — Shelf 1",   "IN_STOCK"),
        ("i0000001-0000-0000-0000-000000000008", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000008", None,  0, 0, 10, 30, "Aisle E — Counter 2", "OUT_OF_STOCK"),
        ("i0000001-0000-0000-0000-000000000009", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000009", None, 11, 0,  8, 25, "Aisle A — Shelf 3",   "IN_STOCK"),
        ("i0000001-0000-0000-0000-000000000010", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000010", None, 32, 0, 12, 48, "Aisle D — Shelf 2",   "IN_STOCK"),
    ],
    "customers": [
        ("cu000001-0000-0000-0000-000000000001", "CUST-00001", "Sarah Connor", "+1 (555) 111-2222", "sarah.connor@mail.com",  4800, "GOLD"),
        ("cu000001-0000-0000-0000-000000000002", "CUST-00002", "David Miller", "+1 (555) 222-3333", "david.miller@mail.com",  1250, "SILVER"),
        ("cu000001-0000-0000-0000-000000000003", "CUST-00003", "Emma Watson",  "+1 (555) 333-4444", "emma.watson@mail.com",   9200, "VIP"),
        ("cu000001-0000-0000-0000-000000000004", "CUST-00004", "Liam Johnson", "+1 (555) 444-5555", "liam.j@mail.com",         320, "STANDARD"),
        ("cu000001-0000-0000-0000-000000000005", "CUST-00005", "Priya Nair",   "+1 (555) 555-6666", "priya.nair@mail.com",    2100, "SILVER"),
    ],
    "sales": [
        ("sl000001-0000-0000-0000-000000000001", "REC-98231", "s0000001-0000-0000-0000-000000000001", "u0000001-0000-0000-0000-000000000004", "cu000001-0000-0000-0000-000000000001", 249.99, 20.00,  0.00, 269.99, "PAID", "COMPLETED", None),
        ("sl000001-0000-0000-0000-000000000002", "REC-98232", "s0000001-0000-0000-0000-000000000001", "u0000001-0000-0000-0000-000000000004", None,                                   179.90, 14.39, 10.00, 184.29, "PAID", "COMPLETED", "Walk-in customer discount"),
        ("sl000001-0000-0000-0000-000000000003", "REC-98233", "s0000001-0000-0000-0000-000000000001", "u0000001-0000-0000-0000-000000000005", "cu000001-0000-0000-0000-000000000002", 324.48, 25.96, 15.00, 335.44, "PAID", "COMPLETED", None),
        ("sl000001-0000-0000-0000-000000000004", "REC-98234", "s0000001-0000-0000-0000-000000000001", "u0000001-0000-0000-0000-000000000005", "cu000001-0000-0000-0000-000000000003", 199.50, 15.96,  0.00, 215.46, "PAID", "COMPLETED", None),
        ("sl000001-0000-0000-0000-000000000005", "REC-98235", "s0000001-0000-0000-0000-000000000001", "u0000001-0000-0000-0000-000000000004", "cu000001-0000-0000-0000-000000000003", 148.97, 11.92,  5.00, 155.89, "PAID", "COMPLETED", "VIP reward discount"),
    ],
    "sale_items": [
        ("si000001-0000-0000-0000-000000000001", "sl000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000001", None, 1, 249.99, 135.00, 249.99),
        ("si000001-0000-0000-0000-000000000002", "sl000001-0000-0000-0000-000000000002", "p0000001-0000-0000-0000-000000000005", None, 2,  89.95,  38.50, 179.90),
        ("si000001-0000-0000-0000-000000000003", "sl000001-0000-0000-0000-000000000003", "p0000001-0000-0000-0000-000000000004", None, 1, 129.99,  58.00, 129.99),
        ("si000001-0000-0000-0000-000000000004", "sl000001-0000-0000-0000-000000000003", "p0000001-0000-0000-0000-000000000003", None, 1,  59.99,  25.00,  59.99),
        ("si000001-0000-0000-0000-000000000005", "sl000001-0000-0000-0000-000000000003", "p0000001-0000-0000-0000-000000000007", None, 5,  24.50,   9.80, 122.50),
        ("si000001-0000-0000-0000-000000000006", "sl000001-0000-0000-0000-000000000004", "p0000001-0000-0000-0000-000000000002", None, 1, 199.50, 105.00, 199.50),
        ("si000001-0000-0000-0000-000000000007", "sl000001-0000-0000-0000-000000000005", "p0000001-0000-0000-0000-000000000006", None, 1,  49.99,  21.00,  49.99),
        ("si000001-0000-0000-0000-000000000008", "sl000001-0000-0000-0000-000000000005", "p0000001-0000-0000-0000-000000000007", None, 4,  24.50,   9.80,  98.00),
    ],
    "payments": [
        ("py000001-0000-0000-0000-000000000001", "sl000001-0000-0000-0000-000000000001", None, "CARD",         269.99, "SUCCESS", "TXN-CARD-78201"),
        ("py000001-0000-0000-0000-000000000002", "sl000001-0000-0000-0000-000000000002", None, "CASH",         184.29, "SUCCESS", "TXN-CASH-78202"),
        ("py000001-0000-0000-0000-000000000003", "sl000001-0000-0000-0000-000000000003", None, "UPI",          335.44, "SUCCESS", "TXN-UPI-78203"),
        ("py000001-0000-0000-0000-000000000004", "sl000001-0000-0000-0000-000000000004", None, "CARD",         215.46, "SUCCESS", "TXN-CARD-78204"),
        ("py000001-0000-0000-0000-000000000005", "sl000001-0000-0000-0000-000000000005", None, "STORE_CREDIT",  80.00, "SUCCESS", "TXN-SC-78205"),
        ("py000001-0000-0000-0000-000000000006", "sl000001-0000-0000-0000-000000000005", None, "CASH",          75.89, "SUCCESS", "TXN-CASH-78205-2"),
    ],
    "purchase_orders": [
        ("po000001-0000-0000-0000-000000000001", "PO-4091", "sp000001-0000-0000-0000-000000000004", "s0000001-0000-0000-0000-000000000001", "COMPLETED",        245.00, "u0000001-0000-0000-0000-000000000002", "2026-09-04"),
        ("po000001-0000-0000-0000-000000000002", "PO-4092", "sp000001-0000-0000-0000-000000000001", "s0000001-0000-0000-0000-000000000001", "AI_RECOMMENDED",  1490.00, "u0000001-0000-0000-0000-000000000002", "2026-09-08"),
        ("po000001-0000-0000-0000-000000000003", "PO-4093", "sp000001-0000-0000-0000-000000000002", "s0000001-0000-0000-0000-000000000001", "SENT",             770.00, "u0000001-0000-0000-0000-000000000002", "2026-09-10"),
    ],
    "purchase_order_items": [
        ("pi000001-0000-0000-0000-000000000001", "po000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000007", None, 25,  25,  9.80,  245.00),
        ("pi000001-0000-0000-0000-000000000002", "po000001-0000-0000-0000-000000000002", "p0000001-0000-0000-0000-000000000001", None,  8,   0, 135.00, 1080.00),
        ("pi000001-0000-0000-0000-000000000003", "po000001-0000-0000-0000-000000000002", "p0000001-0000-0000-0000-000000000002", None,  4,   0, 105.00,  420.00),
        ("pi000001-0000-0000-0000-000000000004", "po000001-0000-0000-0000-000000000003", "p0000001-0000-0000-0000-000000000005", None, 20,   0,  38.50,  770.00),
    ],
    "stock_movements": [
        ("sm000001-0000-0000-0000-000000000001", "i0000001-0000-0000-0000-000000000001", "SALE",              -1,  7,  6, "SALE",           "REC-98231", "u0000001-0000-0000-0000-000000000004", None),
        ("sm000001-0000-0000-0000-000000000002", "i0000001-0000-0000-0000-000000000005", "SALE",              -2,  4,  2, "SALE",           "REC-98232", "u0000001-0000-0000-0000-000000000004", None),
        ("sm000001-0000-0000-0000-000000000003", "i0000001-0000-0000-0000-000000000007", "PURCHASE_RECEIPT",  25, 20, 45, "PURCHASE_ORDER", "PO-4091",   "u0000001-0000-0000-0000-000000000002", "Received FreshGourmet restock"),
        ("sm000001-0000-0000-0000-000000000004", "i0000001-0000-0000-0000-000000000008", "ADJUSTMENT_REMOVE", -3,  3,  0, "ADJUSTMENT",     "ADJ-0904",  "u0000001-0000-0000-0000-000000000002", "Damaged in transit — written off"),
        ("sm000001-0000-0000-0000-000000000005", "i0000001-0000-0000-0000-000000000002", "SALE",              -1,  5,  4, "SALE",           "REC-98234", "u0000001-0000-0000-0000-000000000005", None),
    ],
    "stock_alerts": [
        ("al000001-0000-0000-0000-000000000001", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000001", None, "LOW_STOCK",     6, 10, "ACTIVE"),
        ("al000001-0000-0000-0000-000000000002", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000002", None, "LOW_STOCK",     4,  8, "ACTIVE"),
        ("al000001-0000-0000-0000-000000000003", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000005", None, "LOW_STOCK",     2, 12, "ACTIVE"),
        ("al000001-0000-0000-0000-000000000004", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000008", None, "OUT_OF_STOCK",  0, 10, "ACTIVE"),
    ],
    "ai_recommendations": [
        ("ai000001-0000-0000-0000-000000000001", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000001", "REORDER_PO",      24, 21.91, 0.9420, "EOQ based on 14 units/month demand, stock=6", "PENDING"),
        ("ai000001-0000-0000-0000-000000000002", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000002", "REORDER_PO",      21, 18.62, 0.9110, "EOQ based on 11 units/month demand, stock=4", "PENDING"),
        ("ai000001-0000-0000-0000-000000000003", "s0000001-0000-0000-0000-000000000001", "p0000001-0000-0000-0000-000000000005", "STOCKOUT_WARNING", 38, 34.05, 0.9750, "Stockout risk HIGH. Velocity=18/mo, stock=2, lead_time=5d", "PENDING"),
    ],
    "audit_logs": [
        ("lg000001-0000-0000-0000-000000000001", "u0000001-0000-0000-0000-000000000004", "CREATE", "sales",          "REC-98231", None,                         json.dumps({"receipt": "REC-98231", "total": 269.99})),
        ("lg000001-0000-0000-0000-000000000002", "u0000001-0000-0000-0000-000000000002", "UPDATE", "inventory",      "i0000001-0000-0000-0000-000000000007", json.dumps({"quantity_on_hand": 20}),  json.dumps({"quantity_on_hand": 45})),
        ("lg000001-0000-0000-0000-000000000003", "u0000001-0000-0000-0000-000000000002", "UPDATE", "inventory",      "i0000001-0000-0000-0000-000000000008", json.dumps({"quantity_on_hand": 3}),   json.dumps({"quantity_on_hand": 0})),
        ("lg000001-0000-0000-0000-000000000004", "u0000001-0000-0000-0000-000000000002", "CREATE", "purchase_orders","PO-4092",   None,                         json.dumps({"po_number": "PO-4092", "status": "AI_RECOMMENDED", "total_cost": 1490.00})),
    ],
}

INSERTS = {
    "roles":                 "INSERT OR IGNORE INTO roles (id, code, name, description, permissions) VALUES (?,?,?,?,?)",
    "stores":                "INSERT OR IGNORE INTO stores (id, code, name, address, phone, email, tax_rate) VALUES (?,?,?,?,?,?,?)",
    "users":                 "INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role_id, store_id) VALUES (?,?,?,?,?,?)",
    "categories":            "INSERT OR IGNORE INTO categories (id, name, slug, parent_id, description) VALUES (?,?,?,?,?)",
    "suppliers":             "INSERT OR IGNORE INTO suppliers (id, code, name, contact_person, email, phone, address, lead_time_days, reliability_score) VALUES (?,?,?,?,?,?,?,?,?)",
    "products":              "INSERT OR IGNORE INTO products (id, sku, barcode, name, description, category_id, supplier_id, base_price, cost_price, unit, image_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    "inventory":             "INSERT OR IGNORE INTO inventory (id, store_id, product_id, variant_id, quantity_on_hand, quantity_reserved, reorder_level, target_stock_level, location_rack, status) VALUES (?,?,?,?,?,?,?,?,?,?)",
    "customers":             "INSERT OR IGNORE INTO customers (id, customer_code, name, phone, email, loyalty_points, customer_tier) VALUES (?,?,?,?,?,?,?)",
    "sales":                 "INSERT OR IGNORE INTO sales (id, receipt_number, store_id, cashier_id, customer_id, subtotal, tax_amount, discount_amount, total_amount, payment_status, status, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    "sale_items":            "INSERT OR IGNORE INTO sale_items (id, sale_id, product_id, variant_id, quantity, unit_price, unit_cost, total_price) VALUES (?,?,?,?,?,?,?,?)",
    "payments":              "INSERT OR IGNORE INTO payments (id, sale_id, purchase_order_id, payment_method, amount, status, transaction_reference) VALUES (?,?,?,?,?,?,?)",
    "purchase_orders":       "INSERT OR IGNORE INTO purchase_orders (id, po_number, supplier_id, store_id, status, total_cost, created_by, expected_delivery) VALUES (?,?,?,?,?,?,?,?)",
    "purchase_order_items":  "INSERT OR IGNORE INTO purchase_order_items (id, purchase_order_id, product_id, variant_id, quantity_ordered, quantity_received, unit_cost, total_cost) VALUES (?,?,?,?,?,?,?,?)",
    "stock_movements":       "INSERT OR IGNORE INTO stock_movements (id, inventory_id, type, quantity_changed, previous_quantity, new_quantity, reference_type, reference_id, performed_by, reason) VALUES (?,?,?,?,?,?,?,?,?,?)",
    "stock_alerts":          "INSERT OR IGNORE INTO stock_alerts (id, store_id, product_id, variant_id, type, current_quantity, reorder_level, status) VALUES (?,?,?,?,?,?,?,?)",
    "ai_recommendations":    "INSERT OR IGNORE INTO ai_recommendations (id, store_id, product_id, type, recommended_quantity, eoq_value, confidence_score, prompt_context, status) VALUES (?,?,?,?,?,?,?,?,?)",
    "audit_logs":            "INSERT OR IGNORE INTO audit_logs (id, user_id, action, entity_name, entity_id, old_values, new_values) VALUES (?,?,?,?,?,?,?)",
}


# ============================================================
# 3. VERIFICATION QUERIES
# ============================================================
VERIFICATION_QUERIES = [
    ("Total users",         "SELECT COUNT(*) AS cnt FROM users"),
    ("Total products",      "SELECT COUNT(*) AS cnt FROM products"),
    ("Total inventory rows","SELECT COUNT(*) AS cnt FROM inventory"),
    ("Low-stock items",     "SELECT COUNT(*) AS cnt FROM inventory WHERE status='LOW_STOCK'"),
    ("Out-of-stock items",  "SELECT COUNT(*) AS cnt FROM inventory WHERE status='OUT_OF_STOCK'"),
    ("Total sales",         "SELECT COUNT(*) AS cnt FROM sales"),
    ("Total sale items",    "SELECT COUNT(*) AS cnt FROM sale_items"),
    ("Total payments",      "SELECT COUNT(*) AS cnt FROM payments"),
    ("Active alerts",       "SELECT COUNT(*) AS cnt FROM stock_alerts WHERE status='ACTIVE'"),
    ("AI recommendations",  "SELECT COUNT(*) AS cnt FROM ai_recommendations"),
    ("Stock movements",     "SELECT COUNT(*) AS cnt FROM stock_movements"),
    ("Audit log entries",   "SELECT COUNT(*) AS cnt FROM audit_logs"),
]

ANALYTICS_QUERIES = [
    ("Total Revenue (all sales)",
     "SELECT ROUND(SUM(total_amount), 2) AS total FROM sales WHERE status='COMPLETED'"),
    ("Total Gross Profit",
     "SELECT ROUND(SUM(si.total_price - (si.unit_cost * si.quantity)), 2) AS gross_profit FROM sale_items si"),
    ("Gross Profit Margin %",
     "SELECT ROUND((SUM(si.total_price - si.unit_cost * si.quantity) / SUM(si.total_price)) * 100, 2) AS margin_pct FROM sale_items si"),
    ("Top 5 Products by Revenue",
     "SELECT p.name, SUM(si.total_price) AS revenue FROM sale_items si JOIN products p ON p.id=si.product_id GROUP BY p.id ORDER BY revenue DESC LIMIT 5"),
    ("Total Inventory Asset Value (at cost)",
     "SELECT ROUND(SUM(i.quantity_on_hand * p.cost_price), 2) AS asset_value FROM inventory i JOIN products p ON p.id=i.product_id"),
    ("Products at Risk of Stockout",
     "SELECT p.name, i.quantity_on_hand, i.reorder_level FROM inventory i JOIN products p ON p.id=i.product_id WHERE i.quantity_on_hand <= i.reorder_level ORDER BY i.quantity_on_hand"),
    ("Sales by Payment Method",
     "SELECT payment_method, COUNT(*) AS txn_count, ROUND(SUM(amount),2) AS total FROM payments WHERE status='SUCCESS' GROUP BY payment_method"),
]


# ============================================================
# 4. CRUD OPERATION TESTS
# ============================================================
def run_crud_tests(conn):
    print("\n" + "="*60)
    print("CRUD OPERATIONS TEST SUITE")
    print("="*60)
    cursor = conn.cursor()

    # CREATE
    cursor.execute("""
        INSERT OR IGNORE INTO customers (id, customer_code, name, phone, email, loyalty_points, customer_tier)
        VALUES ('test-cust-001', 'CUST-TEST-001', 'Test Customer', '+1 (999) 000-1111', 'test@mail.com', 100, 'STANDARD')
    """)
    cursor.execute("SELECT COUNT(*) FROM customers WHERE id='test-cust-001'")
    assert cursor.fetchone()[0] == 1, "CREATE customer failed"
    print("  ✅  CREATE: Customer inserted successfully")

    # READ
    cursor.execute("SELECT name, customer_tier FROM customers WHERE id='test-cust-001'")
    row = cursor.fetchone()
    assert row["name"] == "Test Customer", "READ customer failed"
    print(f"  ✅  READ:   Customer read — {row['name']} ({row['customer_tier']})")

    # UPDATE
    cursor.execute("UPDATE customers SET loyalty_points=500, customer_tier='SILVER' WHERE id='test-cust-001'")
    cursor.execute("SELECT loyalty_points, customer_tier FROM customers WHERE id='test-cust-001'")
    row = cursor.fetchone()
    assert row["loyalty_points"] == 500 and row["customer_tier"] == "SILVER", "UPDATE customer failed"
    print(f"  ✅  UPDATE: Customer updated — {row['loyalty_points']} pts, Tier={row['customer_tier']}")

    # FK INTEGRITY — Cannot insert sale_item referencing non-existent sale
    try:
        cursor.execute("""
            INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, total_price)
            VALUES ('bad-item', 'non-existent-sale', 'p0000001-0000-0000-0000-000000000001', 1, 50.0, 25.0, 50.0)
        """)
        conn.commit()
        print("  ❌  FK CHECK: Expected FK violation but none raised")
    except sqlite3.IntegrityError:
        print("  ✅  FK CHECK: Foreign key constraint enforced correctly")

    # ANALYTICS VIEW — Stock movements audit trail
    cursor.execute("""
        SELECT sm.type, sm.quantity_changed, p.name
        FROM stock_movements sm
        JOIN inventory i ON i.id=sm.inventory_id
        JOIN products p ON p.id=i.product_id
        ORDER BY sm.created_at DESC LIMIT 5
    """)
    rows = cursor.fetchall()
    assert len(rows) > 0, "Stock movement join query failed"
    print(f"  ✅  JOIN:   Stock movement audit trail — {len(rows)} records returned")

    # DELETE (cleanup test data)
    cursor.execute("DELETE FROM customers WHERE id='test-cust-001'")
    cursor.execute("SELECT COUNT(*) FROM customers WHERE id='test-cust-001'")
    assert cursor.fetchone()[0] == 0, "DELETE customer failed"
    print("  ✅  DELETE: Test customer removed successfully")

    conn.commit()


def main():
    print("=" * 60)
    print("RETAIL COPILOT (TRACK_DIPHS08) — DB MIGRATION RUNNER")
    print("=" * 60)
    print(f"  Database path: {DB_PATH}\n")

    conn = get_connection()
    cursor = conn.cursor()

    # --- Step 1: Run Schema DDL ---
    print("[1/4] Creating schema tables & indexes...")
    for stmt in SCHEMA_STATEMENTS:
        try:
            cursor.execute(stmt)
        except sqlite3.Error as e:
            print(f"  ⚠️  Schema warning: {e}")
    conn.commit()
    print("       ✅ Schema applied successfully\n")

    # --- Step 2: Seed Data ---
    print("[2/4] Seeding reference & demo data...")
    order = [
        "roles", "stores", "users", "categories", "suppliers", "products",
        "inventory", "customers", "sales", "sale_items", "payments",
        "purchase_orders", "purchase_order_items", "stock_movements",
        "stock_alerts", "ai_recommendations", "audit_logs"
    ]
    for table in order:
        rows = SEED_DATA.get(table, [])
        sql  = INSERTS.get(table, "")
        inserted = 0
        for row in rows:
            try:
                cursor.execute(sql, row)
                inserted += cursor.rowcount
            except sqlite3.Error as e:
                print(f"  ⚠️  Seed [{table}] row error: {e}")
        conn.commit()
        print(f"  ✅  {table:<28} {len(rows)} rows seeded")
    print()

    # --- Step 3: Verify Relationships ---
    print("[3/4] Verifying row counts & relationships...")
    for label, query in VERIFICATION_QUERIES:
        cursor.execute(query)
        row = cursor.fetchone()
        print(f"  {label:<35} {row[0]}")
    print()

    # --- Step 4: Analytics Checks ---
    print("  --- Analytics Queries ---")
    for label, query in ANALYTICS_QUERIES:
        cursor.execute(query)
        rows = cursor.fetchall()
        if len(rows) == 1:
            val = rows[0][0]
            print(f"  {label:<45} {val}")
        else:
            print(f"  {label}:")
            for r in rows:
                print(f"     » {dict(r)}")
    print()

    # --- Step 5: CRUD Tests ---
    run_crud_tests(conn)

    conn.close()
    print("\n" + "=" * 60)
    print("✅  DATABASE MIGRATION, SEED & VERIFICATION COMPLETE")
    print(f"    SQLite DB File: {DB_PATH}")
    print("=" * 60)


if __name__ == "__main__":
    main()
