# ROOMI — Developer Documentation (Production-Grade Spec)

**Project:** ROOMI (SecondLife Japan / Roomi)  
**Audience:** Developers building MVP → v1 (single business + small team)  
**Timezone:** Asia/Kuala_Lumpur (+08)  
**Last updated:** 2026-02-10

---

## 0) What ROOMI is (and is not)

### What it is
ROOMI is an **internal operations system** for a second-hand reuse business that acquires items and then **rents or sells** them.

ROOMI tracks:
- inventory lifecycle
- categories (main/sub)
- customers
- rentals (start/end, damage fee)
- sales
- operational + finance dashboard
- audit/activity log
- multi-user login (Owner/Staff)
- EN / 日本語 UI (i18n)

### What it is NOT (out of scope for MVP)
- payment processing
- shipping / delivery / tracking
- marketplace auto-listing (Mercari, Jimoty, etc.)
- multi-tenant SaaS for many businesses (can be added later)

---

## 1) Product Goals & Success Metrics

### Goals
1. Never lose track of items (who has it, where it is, and its status)
2. Make rentals manageable (end dates, overdue, deposit, damage fees)
3. Make daily work easy (fast search, filters, dashboard “what to do today”)
4. Provide basic profit visibility (Owner only)

### MVP Success Metrics
- Time to find an item by keyword/location: **< 5 seconds**
- Creating a new item record: **< 30 seconds**
- Ending a rental: **< 20 seconds**
- Overdue list accuracy: **100%**
- Zero “status mismatch” bugs (item says rented but no active rental)

---

## 2) Roles, Authentication & Authorization

### Roles
- **OWNER**: full access (finance dashboard, user management, delete)
- **STAFF**: operational access (items/customers/rentals/sales) without destructive or finance controls

### Auth design (recommended)
- **Access token (JWT)**: short-lived (e.g. 15 minutes) stored in memory (frontend)
- **Refresh token**: long-lived (e.g. 14 days) stored as **httpOnly cookie**
- **CSRF**: if using cookies + same-site lax/strict + CSRF token for refresh endpoint (optional for MVP if same-origin)

### Permission matrix
| Feature | OWNER | STAFF |
|---|---:|---:|
| Items CRUD | ✅ | ✅ |
| Start/end rental | ✅ | ✅ |
| Record sale | ✅ | ✅ |
| Categories CRUD | ✅ | ❌ |
| Users CRUD | ✅ | ❌ |
| Delete item (hard) | ✅ | ❌ |
| Finance dashboard | ✅ | ❌ |
| Export data (CSV) | ✅ | ❌ (optional) |

### Security basics
- Passwords hashed with **bcrypt**
- Rate-limit login endpoint
- Log auth events (login/logout/refresh failures) to activity log

---

## 3) Domain Model & State Machine

### Item statuses
- `in_stock` — stored, not listed
- `listed` — available to rent/sell
- `reserved` — held for a customer
- `rented` — currently in rental
- `sold` — permanently sold (locked)
- `disposed` — removed from inventory (locked)

### Rental statuses
- `active` — rental is ongoing
- `ended` — rental was closed (via end-rental flow)

> **Overdue is computed, not stored.**  
> A rental is overdue when `today > expected_end_date AND status = 'active'`.  
> The backend exposes an `isOverdue` boolean in API responses and dashboard queries.  
> This avoids needing a cron job or manual trigger to flip statuses, and prevents data drift.

### State machine (allowed transitions)
| From | To |
|---|---|
| in_stock | listed, reserved, disposed |
| listed | reserved, rented, sold, in_stock, disposed |
| reserved | rented, sold, listed, in_stock |
| rented | in_stock, listed, disposed *(only via end-rental flow)* |
| sold | *(locked — no transitions allowed)* |
| disposed | *(locked — no transitions allowed)* |

### Source-of-truth invariants (must enforce in backend)
1. If an item has an **active rental**, item.status **must be `rented`**
2. If an item has a **sale**, item.status **must be `sold`**
3. An item can have **at most one active rental**
4. You cannot create a sale if item is `rented` or `sold`
5. You cannot start a rental if item is `sold` or already has an active rental

> Implementation tip: enforce by **transaction + constraints** (see DB section).

---

## 4) Tech Stack (Option C)

### Frontend
- **React + TypeScript + Vite**
- Routing: **React Router**
- Data fetching/cache: **TanStack Query**
- Forms: React Hook Form + Zod (or just Zod + controlled inputs)
- i18n: **react-i18next**
- UI styling options:
  - **Option A (fast MVP):** Tailwind CSS + simple component library (shadcn optional)
  - **Option B (minimal):** CSS Modules + design tokens

### Backend
- **Node.js + Express** (Fastify optional)
- Validation: **Zod**
- ORM: **Prisma**
- Auth: JWT + refresh cookie
- Logging: pino (optional), and **activity_logs**

### Database
- **PostgreSQL**
- Use **Prisma migrations**
- Use indexes and constraints listed below

### Recommended repo layout
```
roomi/
├── DEVELOPER.md
├── package.json              # root scripts (dev both, lint, format)
├── roomi-system/
│   └── backend/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── src/
│       │   ├── index.ts
│       │   ├── app.ts
│       │   ├── config/
│       │   ├── middlewares/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/      # business rules + transactions
│       │   ├── validators/
│       │   └── utils/
│       └── tests/
└── roomi-app/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   ├── i18n/
    │   ├── styles/
    │   └── types/
    └── public/
```

---

## 5) Database: Prisma Schema Draft (recommended)

> This schema is a starting point; adjust naming if you prefer snake_case in DB.

```prisma
// roomi-system/backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  OWNER
  STAFF
}

enum PreferredLanguage {
  en
  jp
  cn
}

enum AcquisitionType {
  free
  cheap
  bought
}

enum ItemCondition {
  new
  good
  fair
  poor
}

enum ItemStatus {
  in_stock
  listed
  reserved
  rented
  sold
  disposed
}

enum RentalStatus {
  active
  ended
  // overdue is computed dynamically (today > expectedEndDate AND status = active)
  // not stored as a status — see Section 3 for rationale
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         UserRole @default(STAFF)
  createdAt    DateTime @default(now())

  activityLogs ActivityLog[]
}

model MainCategory {
  id        String        @id @default(cuid())
  name      String        @unique
  createdAt DateTime      @default(now())
  subCategories SubCategory[]
}

model SubCategory {
  id             String       @id @default(cuid())
  mainCategoryId String
  name           String
  createdAt      DateTime     @default(now())

  mainCategory MainCategory @relation(fields: [mainCategoryId], references: [id], onDelete: Restrict)
  items        Item[]

  @@unique([mainCategoryId, name])
  @@index([mainCategoryId])
}

model Item {
  id              String         @id @default(cuid())
  title           String
  subCategoryId   String
  sourcePlatform  String?        // e.g. Rednote, Facebook, Walk-in
  acquisitionType AcquisitionType
  acquisitionCost Decimal        @default(0) @db.Decimal(12,2)
  originalPrice   Decimal?       @db.Decimal(12,2)
  condition       ItemCondition
  locationArea    String?        // e.g. "Tokyo - Itabashi"
  exactLocation   String?        // e.g. shelf/room
  status          ItemStatus     @default(in_stock)
  acquisitionDate DateTime?
  notes           String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  subCategory SubCategory @relation(fields: [subCategoryId], references: [id], onDelete: Restrict)
  rentals     Rental[]
  sale        Sale?

  @@index([status])
  @@index([subCategoryId])
  @@index([title])
}

model Customer {
  id                String            @id @default(cuid())
  name              String
  phone             String?
  email             String?
  preferredLanguage PreferredLanguage @default(en)
  sourcePlatform    String?           // where this customer came from
  appId             String?           // platform/app user id
  createdAt         DateTime          @default(now())

  rentals Rental[]
  sales   Sale[]

  @@index([name])
  @@index([phone])
  @@index([email])
}

// NOTE: The legacy MySQL schema had a `customer_type` enum (buyer/renter/both).
// This is intentionally dropped — customer type can be inferred from their
// rentals and sales records, removing a field that could easily become stale.

model Rental {
  id              String      @id @default(cuid())
  itemId          String
  customerId      String
  rentPriceMonthly Decimal?   @db.Decimal(12,2)
  deposit         Decimal?    @db.Decimal(12,2)
  startDate       DateTime
  expectedEndDate DateTime
  actualEndDate   DateTime?
  status          RentalStatus @default(active)
  damageFee       Decimal?    @db.Decimal(12,2)
  notes           String?
  handoverLocation String?

  createdAt DateTime @default(now())

  item     Item     @relation(fields: [itemId], references: [id], onDelete: Restrict)
  customer Customer @relation(fields: [customerId], references: [id], onDelete: Restrict)

  @@index([status])
  @@index([expectedEndDate])
  @@index([itemId])
  @@index([customerId])
}

model Sale {
  id          String   @id @default(cuid())
  itemId      String   @unique
  customerId  String
  salePrice   Decimal? @db.Decimal(12,2)
  saleDate    DateTime
  platformSold String?
  notes       String?
  handoverLocation String?
  createdAt   DateTime @default(now())

  item     Item     @relation(fields: [itemId], references: [id], onDelete: Restrict)
  customer Customer @relation(fields: [customerId], references: [id], onDelete: Restrict)

  @@index([saleDate])
  @@index([customerId])
}

model ActivityLog {
  id         String   @id @default(cuid())
  userId     String?
  actionType String   // ITEM_CREATED, RENTAL_STARTED, etc.
  entityType String   // item, rental, sale, customer, auth
  entityId   String?
  metadata   Json?
  createdAt  DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([createdAt])
  @@index([actionType])
  @@index([entityType])
}
```

### Critical DB constraints (recommended)
**One active rental per item** is hard to enforce with Prisma alone. Best options:

**Option A (MVP-friendly): backend transaction + check**
- In a DB transaction:
  - check if item has active rental
  - create rental
  - update item.status = rented

**Option B (stronger): partial unique index**
- Add SQL migration:
  - `CREATE UNIQUE INDEX rentals_one_active_per_item ON "Rental" ("itemId") WHERE status = 'active';`

(Prisma currently requires manual SQL migration for partial indexes.)

### Indexes (recommended)
- `Item(status)` — dashboard counts and filters
- `Item(subCategoryId)` — category filter
- `Item(title)` — keyword search (upgrade to full-text later)
- `Rental(status, expectedEndDate)` — overdue/upcoming queries
- `Sale(saleDate)` — monthly revenue charts
- Optional: PostgreSQL `tsvector` full-text index on `Item.title + notes` (start with `ILIKE` for MVP)

### Schema design decisions (summary)
| Decision | Rationale |
|----------|-----------|
| `cuid()` string IDs | URL-safe, no sequential guessing, works across distributed systems |
| `Sale.itemId @unique` | One sale per item (item is permanently sold) |
| `salePrice` optional | Allows giveaways (0 or null), or recording sale before price is confirmed; UI can show "—" when null |
| `acquisitionCost @default(0)` | Free items default to zero cost |
| `overdue` computed, not stored | Avoids cron jobs and data drift (see Section 3) |
| `customer_type` dropped | Inferred from rental/sale records; avoids stale data |
| `handoverLocation` on Rental/Sale | Distinct from `Item.exactLocation` (storage location) — see location rules below |

### Location field rules
- **`Item.locationArea`** — General area (e.g. "Tokyo - Itabashi")
- **`Item.exactLocation`** — Storage location (e.g. "Storage A / Row 2")
- **`Rental.handoverLocation`** — Where the item was handed to the renter
- **`Sale.handoverLocation`** — Where the item was handed to the buyer
- Items store the **default storage location**; rentals/sales store the **handover location** (may differ)

---

## 6) Backend API Spec (REST)

### General rules
- JSON in/out (`Content-Type: application/json`)
- Errors: `{ "error": "string", "code": "SOME_CODE" }`
- All protected endpoints require `Authorization: Bearer <accessToken>`

> **Phase 1 (no auth):** During Phase 1 (PostgreSQL + Prisma migration), all endpoints work **without authentication**. Auth middleware, JWT, refresh tokens, and role checks are added in **Phase 2**. Design controllers and services so auth can be layered on top (e.g. accept a `userId` parameter in services, pass `null` in Phase 1). Mark OWNER-only endpoints in code comments so the middleware is easy to add later.

### Auth
**POST** `/api/auth/login`
```json
{ "email": "owner@roomi.com", "password": "******" }
```
Response:
```json
{ "accessToken": "...", "user": { "id": "...", "email": "...", "role": "OWNER" } }
```
Refresh token is set as cookie.

**POST** `/api/auth/refresh`  
Returns new access token (cookie required).

**POST** `/api/auth/logout`  
Clears refresh cookie.

**GET** `/api/auth/me`  
Returns user profile from access token.

### Categories
**GET** `/api/categories/main`
**GET** `/api/categories/sub/:mainId`
**POST** `/api/categories/main` (OWNER only)
**POST** `/api/categories/sub` (OWNER only)

### Items
**GET** `/api/items?status=&sub_category_id=&search=`  
Search behavior (recommended):
- `search` matches title + notes (simple ilike for MVP)
- later upgrade to full-text

**POST** `/api/items`
```json
{
  "title": "2-door fridge",
  "sub_category_id": "sub123",
  "source_platform": "Rednote",
  "acquisition_type": "cheap",
  "acquisition_cost": 80,
  "original_price": 500,
  "condition": "good",
  "location_area": "Tokyo - Itabashi",
  "exact_location": "Storage A / Row 2",
  "status": "in_stock",
  "acquisition_date": "2026-02-01",
  "notes": "Works fine, small scratch"
}
```

**PUT** `/api/items/:id`  
Updates fields but must reject illegal transitions unless using explicit endpoints.

**POST** `/api/items/:id/list`  
Sets item.status to `listed` (if allowed).

**POST** `/api/items/:id/reserve`
Body:
```json
{ "customer_id": "cust123", "notes": "Hold until Friday" }
```

**DELETE** `/api/items/:id`
Soft delete: set status to `disposed` (and log). (Hard delete OWNER-only optional for later.)

### Rentals

**GET** `/api/rentals?status=active&overdue=true`
- `status` filter: `active` or `ended`
- `overdue=true` filter: only active rentals where `today > expectedEndDate`
- Each rental in the response includes a computed `isOverdue: boolean` field

**POST** `/api/rentals/start`
```json
{
  "item_id": "item123",
  "customer_id": "cust123",
  "rent_price_monthly": 50,
  "deposit": 100,
  "start_date": "2026-02-10",
  "expected_end_date": "2026-03-10",
  "handover_location": "Tokyo Station",
  "notes": "Deposit paid"
}
```
Backend must:
- validate item not sold
- validate no active rental
- create rental
- update item.status = rented
- log activity

**PUT** `/api/rentals/:id/end`
```json
{
  "actual_end_date": "2026-03-12",
  "damage_fee": 20,
  "next_item_status": "listed",
  "notes": "Minor damage, charged fee"
}
```
Backend must:
- set rental.status = ended
- set rental.actual_end_date
- set rental.damage_fee if provided
- update item.status = next_item_status (allowed: in_stock/listed/disposed)
- log activity

### Sales
**POST** `/api/sales`
```json
{
  "item_id": "item789",
  "customer_id": "cust123",
  "sale_price": 300,
  "sale_date": "2026-02-10",
  "platform_sold": "Walk-in",
  "handover_location": "Shop front",
  "notes": "Cash"
}
```
- `sale_price` is **optional** (null for giveaways or when price is recorded later)
- Backend must:
  - reject if item is rented or sold
  - create sale
  - set item.status = sold
  - log activity

### Dashboard
**GET** `/api/dashboard/overview`
Returns:
- counts by item status (in_stock, listed, rented, sold, reserved, disposed)
- active rentals count
- overdue count (computed: `today > expectedEndDate AND rental.status = active`)
- upcoming returns (next 7 days) count
- recent items list (last 10)
- reserved items list (last 10)
- overdue rentals list (with `isOverdue: true` flag)

**GET** `/api/dashboard/finance` (OWNER only)
Returns:
- revenue this month
- rental income (sum of active/ended within month by start/end rules)
- sales income
- acquisition cost sums (optional)
- profit estimate = revenue - acquisition (approx)

**GET** `/api/dashboard/activity`
Returns latest activity logs.

---

## 7) Backend Implementation Guidelines

### Service layer (recommended)
Keep controllers thin; put business rules in services:
- `ItemService`
- `RentalService`
- `SaleService`
- `DashboardService`
- `AuthService`
- `CategoryService`
- `ActivityLogService`

### Transactions (critical)
Use Prisma `$transaction` for:
- start rental
- end rental
- sell

### Validation
Use Zod schemas for request bodies and query params.
Return 400 with `{ error, code }` for validation errors.

### Error codes (suggested)
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `FORBIDDEN`
- `UNAUTHORIZED`
- `CONFLICT` (illegal state transition, active rental exists)
- `INTERNAL_ERROR`

---

## 8) Frontend UX & Design Spec

### Design principles
- fast data entry (operator workflow)
- minimal clicks (start rental / sell from item detail)
- strong filters & search
- consistent status colors/icons (optional)

### Layout
- Left sidebar navigation (desktop)
- Top bar: search + language toggle + user menu
- Mobile: bottom nav or hamburger (optional)

### Pages
1. **Login**
   - email + password
   - remember me (refresh cookie already covers)

2. **Dashboard**
   - cards: status counts
   - sections: Overdue, Upcoming, Reserved, Recent activity
   - (Owner) Finance cards + simple chart

3. **Items**
   - table/list with filters (status, category, location)
   - search bar (title/notes)
   - quick actions per row: View, List, Reserve, Rent, Sell (depending status)

4. **Item Detail**
   - full item info
   - status + history (rental/sale summary)
   - action buttons:
     - List / Reserve
     - Start rental
     - Sell
     - Dispose

5. **Customers**
   - list + create/edit
   - show rental/sale history per customer

6. **Rentals**
   - active, overdue, ended tabs
   - end rental action + damage fee

7. **Sales**
   - list + filters by date, platform, category

8. **Categories** (OWNER)
9. **Users** (OWNER)

### Component conventions
- `StatusBadge`
- `Money`
- `DateDisplay`
- `ConfirmDialog`
- `ItemActions` (renders allowed actions based on status + role)

### i18n (EN / 日本語)
- UI strings use translation keys
- Data fields (item titles, category names) are **not auto-translated**
- Store `preferred_language` on Customer for communication reference only

Suggested keys:
- `nav.dashboard`, `nav.items`, ...
- `status.in_stock`, ...
- `actions.start_rental`, `actions.sell`, ...

---

## 9) Dev Scripts & Tooling

### Root scripts (recommended)
- `npm run dev` → runs backend + frontend concurrently
- `npm run dev:backend`
- `npm run dev:frontend`
- `npm run lint`
- `npm run format`

### Backend scripts
- `npm run prisma:migrate`
- `npm run prisma:seed`
- `npm run test`

### Frontend scripts
- `npm run build`
- `npm run preview`

---

## 10) Testing Strategy (MVP)

### Backend
- **Unit tests:** services (rental start/end transitions, sale creation, state machine validation)
- **Integration tests:** full flows — start rental / end rental / sell, including invariant checks (e.g. cannot rent a sold item)
- **Overdue logic test:** create a rental with `expectedEndDate` in the past, verify `isOverdue = true` in API response
- Use a **separate test DB** (`DATABASE_URL_TEST` in `.env.test`)

### Frontend
- Smoke test critical flows (create item, start rental, end rental, sell)
- E2E later (Playwright)
- Test i18n: switch language, verify key labels render in both EN and JA

---

## 11) Deployment Notes (simple)

MVP deployment options:
- **Single VPS** running:
  - Node backend
  - PostgreSQL
  - React static build served by backend or Nginx
- Env separation:
  - dev `.env`
  - prod `.env`

Basic production checklist:
- HTTPS (Nginx + certbot)
- DB backups
- disable Prisma studio in prod
- log rotation

---

## 12) Migration Plan (from current system)

### Phases

| Phase | What | Details |
|-------|------|---------|
| 1 | **PostgreSQL + Prisma backend** | New schema, swap raw MySQL for Prisma client, keep REST endpoints. No auth yet. |
| 2 | **Auth + roles** | Add User model, JWT + refresh cookie, role middleware (OWNER/STAFF). |
| 3 | **React app** | Build new frontend (Vite + React + TS), page by page; cutover when ready. |
| 4 | **Dashboard analytics + activity log** | Finance dashboard (OWNER), activity log, overdue alerts. |
| 5 | **Cleanup** | Remove legacy HTML/JS frontend, remove MySQL (`mysql2`), archive old schema files. |

### ID format change: auto-increment → cuid

The current MySQL schema uses `INT AUTO_INCREMENT` IDs. The new Prisma schema uses `@default(cuid())` (string IDs like `clxyz123abc`).

**Impact:**
- Frontend URL patterns change: `/items/7` → `/items/clxyz123abc`
- Any bookmarks, external links, or hardcoded IDs in tests will break
- If migrating existing data, you need an ID mapping (old int → new cuid)

**If starting fresh** (no production data): no action needed — seed script creates new cuids.  
**If migrating existing data**: write a migration script that exports MySQL rows, generates cuids, and inserts into PostgreSQL while preserving foreign key relationships. See data migration strategy below.

### Data migration strategy

Choose one based on your situation:

**Option A — Fresh start (recommended for MVP / dev-only data)**
- Run `prisma migrate dev` to create PostgreSQL tables
- Run seed script (`prisma/seed.ts`) to populate categories and optional sample data
- No MySQL data is carried over

**Option B — Migrate existing MySQL data**
1. Export MySQL tables to JSON or CSV (e.g. `SELECT * FROM items` → `items.json`)
2. Write a Node script that:
   - Reads each JSON file
   - Creates a mapping of old INT ids → new cuid strings
   - Inserts rows into PostgreSQL via Prisma, using mapped IDs for foreign keys
3. Run in order: main_categories → sub_categories → items → customers → rentals → sales
4. Verify row counts and spot-check key records

### Retired endpoints

The current backend has `/api/output/sell`, `/api/output/rent`, and `/api/output/rentals/:id/end`. These are **retired** in the new API design and replaced by cleaner, resource-oriented endpoints:

| Old (retired) | New (replacement) | Notes |
|---|---|---|
| `POST /api/output/sell` | `POST /api/sales` | Sale creation; backend handles item status update |
| `POST /api/output/rent` | `POST /api/rentals/start` | Rental creation; backend handles item status update |
| `PUT /api/output/rentals/:id/end` | `PUT /api/rentals/:id/end` | Same path, cleaner prefix |

The new endpoints include the same business logic (status transitions, validation, activity logging) but live under their own resource routes instead of a shared `/output` namespace.

---

## 13) Open Decisions (documented for future)
- **Full-text search:** Postgres `tsvector` vs simple `ILIKE` — start with `ILIKE`, upgrade when item count > 1000 or search feels slow
- **CSV export:** Owner only; add when finance dashboard is built (Phase 4)
- **Multi-branch locations:** Add a `locations` table if the business grows to multiple storage sites
- **Item photos:** Add `item_images` table + S3/Cloudflare R2 later
- **Notifications:** Email/LINE alerts for overdue rentals (future)
- **Soft delete vs hard delete:** Currently items are soft-deleted (status = disposed). Consider adding a `deleted_at` timestamp pattern if you need to restore items or audit deletions
- **Timezone handling:** All dates stored as UTC in PostgreSQL; frontend converts to `Asia/Kuala_Lumpur` (+08) for display. Use `date-fns-tz` or `dayjs` with timezone plugin in React

---

## 14) Appendix: Activity Log Action Types (suggested)
- `AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILED`, `AUTH_LOGOUT`
- `ITEM_CREATED`, `ITEM_UPDATED`, `ITEM_STATUS_CHANGED`, `ITEM_DISPOSED`
- `CATEGORY_CREATED`, `CATEGORY_UPDATED`
- `CUSTOMER_CREATED`, `CUSTOMER_UPDATED`
- `RENTAL_STARTED`, `RENTAL_ENDED`, `RENTAL_DAMAGE_FEE_SET`
- `SALE_RECORDED`

---

## 15) Quick-Start Checklist (new developer)

1. **Clone repo** and read this doc
2. **Install PostgreSQL** locally (or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=roomi_db postgres:16`)
3. **Backend setup:**
   ```bash
   cd roomi-system/backend
   npm install
   cp .env.example .env   # set DATABASE_URL=postgresql://postgres:dev@localhost:5432/roomi_db
   npx prisma migrate dev  # creates tables
   npx prisma db seed      # seeds categories
   npm run dev              # starts API at http://localhost:3000
   ```
4. **Frontend setup (React app):**
   ```bash
   cd roomi-app
   npm install
   npm run dev              # starts Vite at http://localhost:5173
   ```
5. **Verify:** Open `http://localhost:5173`, dashboard should load with category seed data
6. **API test:** `curl http://localhost:3000/api/health` → `{ "ok": true }`

---

*Last updated: 2026-02-10. This is the single source of truth for ROOMI development.*
