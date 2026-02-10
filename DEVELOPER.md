# ROOMI — Developer Documentation

Developer reference for the ROOMI: current setup, target tech stack (Option C), and migration plan. Review this before starting development.

---

## What the system is about

**ROOMI** (under the “SecondLife Japan” concept) is a **second-hand inventory and transaction system**. It is used to manage items that are acquired (bought, received for free, or obtained cheaply), then either **rented** or **sold** to customers. The system is aimed at a single operator or small team running a second-life / reuse business (e.g. furniture, electronics, fashion, appliances).

**Core idea:** Track every item from **acquisition** → **in stock** → **listed** → **rented or sold** (or **disposed**). For each item you store category, condition, location, price, and notes. Customers are linked to rentals and sales so you know who has which item and for how long.

**Main workflows:**

- **Stock / acquisition** — Record new items (title, category, cost, condition, acquisition date, location). Items start as “in stock”.
- **Listing** — Mark items as “listed” when they are available for rent or sale.
- **Rental** — Assign an item to a customer for a period (monthly rent, deposit, start/end dates). Item becomes “rented”; when the rental ends, you can set a damage fee and return the item to “in stock” or another status.
- **Sale** — Record a sale (item + customer + sale price + date). Item becomes “sold”.
- **Output** — From an item, perform “sell” or “rent” in one flow (creates the sale or rental and updates item status). For rentals, “end rental” closes the rental and optionally sets a damage fee.

**Key concepts:**

- **Items** — Second-hand goods with status: in_stock, listed, rented, sold, reserved, disposed.
- **Categories** — Two-level: main (e.g. Furniture, Electronics) and sub (e.g. bed, desk, fridge).
- **Customers** — People who rent or buy; can have platform/app IDs and preferred language (JP/EN/CN).
- **Rentals** — Link item + customer + dates + price; status active/ended/overdue; optional damage_fee.
- **Sales** — Link item + customer + sale price + date.

The system does **not** handle payments, shipping, or marketplace listings; it focuses on **inventory, customers, and recording rentals and sales**. The UI is available in **English and Japanese** (i18n).

---

## 1. Project overview

ROOMI is an MVP web system for second-hand items: buy/sell/rent management. It includes:

- **Dashboard** — Item counts by status (in stock, listed, rented, sold), recently added items.
- **Items** — CRUD, filters, status lifecycle (in_stock → listed → rented/sold → disposed).
- **Categories** — Main categories (e.g. Furniture, Electronics) and sub-categories.
- **Customers** — CRUD; used for rentals and sales.
- **Rentals** — Create rental, end rental, set damage fee.
- **Sales** — Record sale (item → sold).
- **Output workflow** — Sell or rent from item detail; end rental with optional damage fee.
- **i18n** — EN / 日本語.

---

## 2. Current tech stack

| Layer     | Technology              | Notes                          |
|----------|--------------------------|--------------------------------|
| Frontend | HTML + vanilla JS + CSS  | Multi-page; `roomi-system/frontend/` |
| Backend  | Node.js + Express        | REST API; `roomi-system/backend/`   |
| Database | MySQL 8                  | `mysql2` driver; raw SQL            |

- **API base:** `http://localhost:3000/api`
- **Frontend:** Static files; can be served by backend (Express serves `frontend/` at `/`) or a separate static server.

---

## 3. Target tech stack (Option C)

| Layer     | Technology              | Purpose / benefit                          |
|----------|--------------------------|--------------------------------------------|
| Frontend | **React** + **TypeScript** + **Vite** | Components, type safety, fast HMR, single app |
| Backend  | **Node.js** + **Express** (or Fastify) | Keep REST API; optional tRPC/GraphQL later   |
| Database | **PostgreSQL**           | Strong typing, JSON, full-text search       |
| ORM      | **Prisma** (or Drizzle)  | Migrations, type-safe queries, schema as code |

Optional later: tRPC or GraphQL for typed client–server contract; Fastify for performance.

---

## 4. Current project structure

```
roomi/
├── package.json                 # Root scripts (dev, start → backend)
├── DEVELOPER.md                 # This file
└── roomi-system/
    ├── README.md                # User-facing setup (backend + frontend)
    ├── backend/
    │   ├── .env.example
    │   ├── package.json
    │   ├── schema.sql            # MySQL schema + seed
    │   ├── schema-migration-*.sql # One-off migrations
    │   ├── scripts/              # setup-db, migrate-*.js
    │   └── src/
    │       ├── app.js            # Express app, CORS, routes, static frontend
    │       ├── db.js             # MySQL pool
    │       ├── controllers/     # items, categories, customers, rentals, sales, output
    │       ├── routes/
    │       ├── middlewares/      # error.middleware.js
    │       └── utils/            # validate.js
    └── frontend/
        ├── index.html, stock.html, items.html, customers.html, rentals.html, sales.html, buy.html, output.html
        ├── css/style.css
        ├── js/api.js, header.js, i18n.js, *.js (page-specific)
        └── images/
```

---

## 5. Proposed structure after Option C migration

```
roomi/
├── package.json                 # Workspace or root scripts
├── DEVELOPER.md
├── roomi-system/
│   ├── backend/                  # Node + Express + Prisma + PostgreSQL
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # PostgreSQL schema (replaces schema.sql)
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── index.ts         # Entry (or app.ts)
│   │       ├── db.ts or use Prisma client only
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── middlewares/
│   │       └── utils/
│   └── frontend/                # Legacy static (can remove after cutover)
│       └── ... (existing HTML/JS/CSS)
└── roomi-app/                   # New React app (or replace roomi-system/frontend)
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── api/                 # API client (fetch/axios + types)
    │   ├── components/
    │   ├── pages/               # Dashboard, Items, Customers, Rentals, Sales
    │   ├── hooks/
    │   ├── i18n/
    │   └── types/
    └── public/
```

Naming is flexible: e.g. keep everything under `roomi-system/` and add `roomi-system/frontend-react` instead of `roomi-app/`.

---

## 6. Current API overview

Base URL: `http://localhost:3000/api`. All JSON.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/categories/main` | List main categories |
| GET | `/categories/sub/:mainId` | List sub-categories for main |
| POST | `/categories/main`, `/categories/sub` | Create main/sub category |
| GET | `/items` | List (query: `status`, `sub_category_id`, `search`) |
| GET | `/items/counts` | Counts by status (dashboard) |
| GET | `/items/recent` | Recently added items |
| GET | `/items/recently-acquired` | Recently acquired |
| GET | `/items/available` | Available for rent/sale (query params) |
| GET | `/items/:id` | Get one item |
| POST | `/items` | Create item |
| PUT | `/items/:id` | Update item |
| DELETE | `/items/:id` | Soft-delete (status = disposed) |
| GET/POST/PUT/DELETE | `/customers` | CRUD customers |
| GET/POST/PUT | `/rentals` | List, create, update rentals |
| PATCH | `/rentals/:id/damage` | Set `damage_fee` (body: `{ damage_fee }`) |
| GET/POST | `/sales` | List, create sales |
| POST | `/output/sell` | Sell flow (item → sold) |
| POST | `/output/rent` | Rent flow (item → rented) |
| PUT | `/output/rentals/:id/end` | End rental (item status, damage_fee, etc.) |

---

## 7. Current data model (MySQL → PostgreSQL mapping)

- **main_categories** — id, name, created_at  
- **sub_categories** — id, main_category_id, name, created_at  
- **items** — id, title, sub_category_id, source_platform, acquisition_type, acquisition_cost, original_price, condition, location_area, exact_location, status, acquisition_date, notes, created_at, updated_at  
  - Enums: acquisition_type (free, cheap, bought), condition (new, good, fair, poor), status (in_stock, listed, rented, sold, reserved, disposed)  
- **customers** — id, name, phone, email, platform, app_id, preferred_language (jp, en, cn), customer_type (buyer, renter, both), created_at  
- **rentals** — id, item_id, customer_id, rent_price_monthly, deposit, start_date, end_date, expected_end_date, status (active, ended, overdue), damage_fee, notes, exact_location, created_at  
- **sales** — id, item_id, customer_id, sale_price, sale_date, platform_sold, notes, exact_location, created_at  

Prisma schema will mirror these with PostgreSQL types (e.g. `Decimal`, `DateTime`, enums).

---

## 8. Environment variables

### Backend (current — MySQL)

- `PORT` — Server port (default 3000)
- `NODE_ENV` — development / production
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — MySQL connection
- `CORS_ORIGIN` — Optional; for production frontend origin

### Backend (after Option C — PostgreSQL + Prisma)

- `PORT`, `NODE_ENV`
- `DATABASE_URL` — PostgreSQL connection string (used by Prisma)
- `CORS_ORIGIN` — Optional

### Frontend (React, after migration)

- `VITE_API_BASE` or similar — API base URL (e.g. `http://localhost:3000/api`) for dev/prod.

---

## 9. Scripts (current)

From repo root:

- `npm run dev` — Start backend with `--watch`
- `npm start` — Start backend (production)
- `npm run install:backend` — Install backend deps
- `npm run setup-db` — Backend DB setup script
- `npm run migrate-*` — Backend migration scripts

After migration, add e.g.:

- `npm run db:migrate` — Prisma migrate
- `npm run db:seed` — Prisma seed
- `npm run dev:frontend` — Vite dev server for React app
- `npm run build:frontend` — Vite build

---

## 10. Migration phases (Option C)

Use this as a checklist; implement in order.

1. **Documentation**  
   - [x] Developer doc (this file).

2. **Backend: PostgreSQL + Prisma**  
   - [ ] Add Prisma; define `schema.prisma` from current MySQL schema (tables + enums).  
   - [ ] Add `DATABASE_URL` to `.env.example` and docs.  
   - [ ] Create initial migration; optional seed script for main/sub categories.  
   - [ ] Keep existing API routes; swap raw MySQL in controllers for Prisma client.  
   - [ ] (Optional) Convert backend to TypeScript and use Prisma-generated types.

3. **Backend: Run and test**  
   - [ ] Run migrations against local PostgreSQL.  
   - [ ] Verify all existing API endpoints with current frontend or Postman/curl.

4. **Frontend: React + TypeScript + Vite**  
   - [ ] Scaffold new app (e.g. `roomi-app/` or `roomi-system/frontend-react/`).  
   - [ ] Add React Router, i18n (e.g. react-i18next), and API client with TypeScript types.  
   - [ ] Implement pages: Dashboard, Stock/Items, Customers, Rentals, Sales, Output (buy/rent/end rental).  
   - [ ] Reuse or port styles (e.g. bring over `style.css` or rebuild with Tailwind/CSS modules).

5. **Integration and cutover**  
   - [ ] Point React app at same backend (`/api`).  
   - [ ] Test full flows; then switch default “frontend” to React app (or replace old `frontend/`).  
   - [ ] Update README and DEVELOPER.md with new setup (PostgreSQL, Prisma, React, Vite).

6. **Cleanup (optional)**  
   - [ ] Remove or archive old MySQL schema and `mysql2` from backend.  
   - [ ] Remove legacy static frontend when no longer needed.

---

## 11. Conventions and tips

- **API:** Keep REST for now; same endpoints so legacy frontend can still work during migration.  
- **Auth:** Not in current scope; add later if needed (e.g. JWT, sessions).  
- **Errors:** Backend returns `{ error: string }` with appropriate HTTP status.  
- **i18n:** Current keys in `frontend/js/i18n.js`; replicate in React (e.g. EN/JA JSON and use translation keys in this doc for reference).

---

## 12. Quick reference — run current app

1. **MySQL:** Create DB, run `backend/schema.sql`.  
2. **Backend:** `cp roomi-system/backend/.env.example roomi-system/backend/.env`, set DB_*, then from root: `npm run dev`.  
3. **Frontend:** Open `http://localhost:3000` (backend serves frontend) or serve `roomi-system/frontend/` with any static server and ensure API is at `http://localhost:3000/api`.

---

*Last updated for Option C migration plan. Adjust phases and paths to match your chosen folder layout (e.g. single repo vs. apps under `roomi-system/`).*
