# Retail – Sales and Inventory Copilot (`TRACK_DIPHS08`)

Production-ready enterprise retail management platform enhanced with real-time AI assistance, demand forecasting, stock alert triggers, POS cashier terminal, and business intelligence analytics.

---

## 🌟 Key Architecture & Capabilities

* **Point of Sale (POS) Terminal:** Fast barcode scanning, multi-payment drawer (Cash, Card, Digital Wallet), customer assignment, and instant receipt generation.
* **Inventory Audit & Movement Log:** Multi-location stock matrix (`Aisle A - Shelf 2`), atomic stock deduction, immutable movement ledger (`SALE`, `RECEIPT`, `ADJUSTMENT`), and threshold notifications.
* **AI Retail Copilot Engine:** Natural language query processor, automated Economic Order Quantity (EOQ) reorder generator, and interactive chat action cards.
* **Supplier & Purchase Order Automation:** Automated PO drafting, vendor lead-time metrics, and one-click order dispatching.
* **Sales Analytics & Reports:** Revenue velocity, gross profit margin calculations, top 5 best-sellers, and CSV export.

---

## 📂 Phase 1 Directory Structure

```
Sales-and-Inventory/
├── client/                   # Frontend SPA (React / Vite / TypeScript)
│   ├── src/
│   │   ├── components/       # Reusable UI & Layout components
│   │   ├── config/           # Environment & Constants
│   │   ├── pages/            # View Pages (Dashboard, POS, Inventory, etc.)
│   │   ├── routes/           # Router definitions & route guard matrix
│   │   ├── services/         # API HTTP Client wrappers
│   │   ├── store/            # State Management Store
│   │   ├── styles/           # Design tokens & Glassmorphism styles
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                   # Backend Microservice API (Node.js / Express / TS)
│   ├── src/
│   │   ├── config/           # DB Connection Pool & Zod env validation
│   │   ├── controllers/      # Route Handlers for Auth, Sales, Inventory, AI
│   │   ├── middleware/       # JWT Auth, RBAC, Validation & Error Envelope
│   │   ├── routes/           # API Routers (/api/v1/*)
│   │   ├── services/         # Business Logic Layer & AI Tool Engine
│   │   ├── types/            # DTOs & API Contracts
│   │   ├── utils/            # Winston Logger & Error Handlers
│   │   ├── app.ts            # Express App configuration
│   │   └── index.ts          # Server Entrypoint
│   ├── package.json
│   └── tsconfig.json
├── database/                 # Database Schemas & Seeds
│   ├── schema.sql            # PostgreSQL DDL for all 10 core tables
│   └── seeds/seed.sql        # Initial sample retail data seed
├── tests/                    # Integrated Test Suites
│   ├── client/
│   └── server/
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── docker-compose.yml        # Docker setup (API, Client, Postgres, Redis)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js v18+ & npm v9+ (or Docker & Docker Compose)
* PostgreSQL 16
* Redis 7

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Installation & Launching

#### Standard Development Mode:
```bash
# Install root dependencies
npm install

# Start Backend API Server
cd server
npm run dev

# In a separate terminal, start Frontend Vite Client
cd client
npm run dev
```

#### Containerized Launch:
```bash
docker-compose up --build -d
```

---

## 🔒 API Endpoints Index (`/api/v1`)

| Endpoint | Method | Description | Role Required |
| :--- | :---: | :--- | :---: |
| `/auth/login` | `POST` | Authenticate user & issue JWT | Public |
| `/auth/me` | `GET` | Get current user profile & store context | Authenticated |
| `/products` | `GET` | Fetch paginated catalog with low stock filter | All |
| `/products` | `POST` | Create product SKU with price tiers | Admin/Manager |
| `/inventory` | `GET` | Real-time inventory matrix & stock levels | All |
| `/inventory/adjustment`| `POST` | Record manual stock adjustment (spoilage/audit)| Manager/Specialist |
| `/sales` | `POST` | Process POS checkout transaction + stock deduct | Cashier/Manager |
| `/sales` | `GET` | Transaction history ledger & receipts | All |
| `/suppliers` | `GET` | Supplier directory & purchase orders | Manager/Specialist |
| `/analytics/dashboard` | `GET` | Revenue, gross profit margin & metrics | Admin/Executive |
| `/copilot/chat` | `POST` | AI Assistant query processor & tool execution | Authenticated |
