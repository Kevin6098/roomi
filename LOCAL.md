# How to run ROOMI locally

Run the backend (API) and frontend (React app) on your machine with a local PostgreSQL database.

## Quick start checklist

1. Install **Node.js 18+** and **PostgreSQL**. Ensure PostgreSQL is running.
2. Create a database: `createdb roomi_db` (or `CREATE DATABASE roomi_db;` in `psql`).
3. Backend: `cd backend` → copy `.env.example` to `.env` → set `DATABASE_URL` and `JWT_SECRET` → `npm install` → `npx prisma generate` → `npx prisma migrate dev` → `npx prisma db seed` → `npm run dev`.
4. Frontend (new terminal): `cd frontend` → `npm install` → `npm run dev`.
5. Open **http://localhost:5173** and log in with `admin@roomi.local` / `admin123`.

---

## Prerequisites

- **Node.js** 18+ (with npm)
- **PostgreSQL** installed and running (e.g. start the service if you use one)

## 1. Database

Create a PostgreSQL database. Use your actual PostgreSQL username and password when you set `DATABASE_URL` later.

```bash
# Option A: command line (uses your current OS user as DB user)
createdb roomi_db
```

```sql
-- Option B: in psql or any PostgreSQL client
CREATE DATABASE roomi_db;
```

Default connection: host `localhost`, port `5432`. Note your **username** and **password** for the next step.

## 2. Backend

### 2.1 Environment

From the **project root** (the folder that contains `backend` and `frontend`):

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:

| Variable       | Description                          | Example |
|----------------|--------------------------------------|---------|
| `DATABASE_URL` | PostgreSQL connection string         | `postgresql://USER:PASSWORD@localhost:5432/roomi_db?schema=public` |
| `JWT_SECRET`   | Secret for JWT (min 32 chars in production) | `your-secret-at-least-32-chars-long` |

Replace `USER` and `PASSWORD` with your PostgreSQL username and password. Example for user `postgres` and password `mypass`:

```env
DATABASE_URL="postgresql://postgres:mypass@localhost:5432/roomi_db?schema=public"
JWT_SECRET=your-secret-at-least-32-chars-long
```

Optional: `PORT` (default `3000`), `NODE_ENV` (e.g. `development`).

### 2.2 Install, migrate, seed

Run these **inside the `backend/` folder**:

```bash
# Still in backend/
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

- **prisma generate** — generates the Prisma client from `prisma/schema.prisma`.
- **prisma migrate dev** — applies all existing migrations (creates/updates tables). No need to pass `--name init`; the repo already has an initial migration.
- **prisma db seed** — seeds main/sub categories and the default admin user (`admin@roomi.local` / `admin123`).  

### 2.3 Start the API

```bash
npm run dev
```

Backend runs at **http://localhost:3000**.

- Health: http://localhost:3000/api/health  
- API base: http://localhost:3000/api  

## 3. Frontend

In a **new terminal** (backend keeps running in the first):

```bash
# From project root
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**.

The Vite dev server proxies `/api` to `http://localhost:3000`, so the app talks to your local backend when you use the UI.

## 4. Log in

1. Open **http://localhost:5173** in your browser.  
2. You should be redirected to the login page.  
3. Use the seeded admin user:

   - **Email:** `admin@roomi.local`  
   - **Password:** `admin123`  

4. After login you can use Dashboard, Items, Customers, Rentals, Sales.  
5. If your user has role **OWNER**, the **Users** link appears in the nav for managing admin users.

## 5. Run both from the project root (optional)

From the **project root** (not inside `backend` or `frontend`):

```bash
npm run install:all   # installs deps for root, backend, and frontend
npm run dev           # starts backend and frontend together
```

- Backend: http://localhost:3000  
- Frontend: http://localhost:5173  

Stop with `Ctrl+C` in that terminal.

## Scripts reference

| Where    | Command              | Description                    |
|----------|----------------------|--------------------------------|
| Root     | `npm run dev`        | Start backend + frontend       |
| Root     | `npm run dev:backend`| Backend only                   |
| Root     | `npm run dev:frontend`| Frontend only                 |
| Root     | `npm run install:all`| Install all dependencies       |
| Backend  | `npm run dev`        | Start API (tsx watch)          |
| Backend  | `npm run prisma:migrate` | Run migrations             |
| Backend  | `npm run prisma:seed`   | Seed DB (categories + admin) |
| Backend  | `npm run prisma:studio` | Open Prisma Studio          |
| Frontend | `npm run dev`        | Start Vite dev server          |

## Troubleshooting

- **“Failed to load” or API errors**  
  Ensure the backend is running on port 3000 and `DATABASE_URL` in `backend/.env` is correct. Open http://localhost:3000/api/health to confirm the API is up.

- **Login fails with “Invalid email or password”**  
  Run the seed: in `backend/` run `npx prisma db seed`. Use **Email:** `admin@roomi.local`, **Password:** `admin123`.

- **Prisma: “Can’t reach database” / connection refused / authentication failed**  
  Check that PostgreSQL is running, the database `roomi_db` exists, and `DATABASE_URL` uses the correct username, password, host, and port. Test with: `psql postgresql://USER:PASSWORD@localhost:5432/roomi_db` (replace USER and PASSWORD).

- **Port already in use**  
  Change `PORT` in `backend/.env` or stop the process using that port. For the frontend, change `server.port` in `frontend/vite.config.ts` if 5173 is taken.

- **Prisma / DB schema errors**  
  From `backend/` run `npx prisma generate` and then `npx prisma migrate dev`. If you changed the schema, create a new migration with `npx prisma migrate dev --name your_change_name`.
