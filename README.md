# ROOMI — SecondLife Japan

Internal operations system for second-hand inventory: rent/sell tracking, customers, categories.  
Spec: **ROOMI_DEVELOPER_PRO.md**

## Structure

- **backend/** — Node.js + Express + Prisma + PostgreSQL (TypeScript)
- **frontend/** — React + TypeScript + Vite + TanStack Query + i18n (EN/日本語)

## Quick start

### 1. PostgreSQL

Create a database (e.g. `roomi_db`) and set `DATABASE_URL` in `backend/.env`:

```bash
# Example (adjust user/password/host)
createdb roomi_db
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/roomi_db"
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

API: **http://localhost:3000**  
Health: http://localhost:3000/api/health

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: **http://localhost:5173** (proxies `/api` to backend)

### 4. Run both from root

```bash
npm run install:all
npm run dev
```

Runs backend (port 3000) and frontend (port 5173) together.

## Scripts (root)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start backend + frontend (concurrently) |
| `npm run dev:backend` | Backend only |
| `npm run dev:frontend` | Frontend only |
| `npm run install:all` | Install root + backend + frontend deps |

## Backend scripts

- `npm run dev` — tsx watch
- `npm run prisma:migrate` — `prisma migrate dev`
- `npm run prisma:seed` — seed categories
- `npm run prisma:studio` — Prisma Studio

## Phase 1 (current)

- No authentication; all API endpoints are open.
- Auth (JWT + roles) is planned for Phase 2.
