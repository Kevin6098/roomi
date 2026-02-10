# How to run ROOMI locally

Run the backend (API) and frontend (React app) on your machine with a local PostgreSQL database.

## Prerequisites

- **Node.js** 18+ (with npm)
- **PostgreSQL** (create a database for ROOMI)

## 1. Database

Create a PostgreSQL database:

```bash
# Using psql or your DB tool
createdb roomi_db
```

Or in the PostgreSQL shell:

```sql
CREATE DATABASE roomi_db;
```

Note the connection details: host (usually `localhost`), port (usually `5432`), username, and password. You’ll use them in the next step.

## 2. Backend

### 2.1 Environment

From the project root:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set at least:

| Variable       | Description                          | Example |
|----------------|--------------------------------------|---------|
| `DATABASE_URL` | PostgreSQL connection string         | `postgresql://USER:PASSWORD@localhost:5432/roomi_db?schema=public` |
| `JWT_SECRET`   | Secret for JWT (use a long random string in production) | `your-secret-at-least-32-chars-long` |

Optional:

- `PORT` — API port (default `3000`)
- `NODE_ENV` — e.g. `development`

### 2.2 Install, migrate, seed

```bash
# Still in backend/
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

- **prisma generate** — generates the Prisma client  
- **prisma migrate dev** — applies migrations and creates tables  
- **prisma db seed** — seeds categories and a default admin user  

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
  Ensure the backend is running on port 3000 and `DATABASE_URL` in `backend/.env` is correct.

- **Login fails with “Invalid email or password”**  
  Run the seed: in `backend/` run `npx prisma db seed`. Use `admin@roomi.local` / `admin123`.

- **Port already in use**  
  Change `PORT` in `backend/.env` or stop the process using that port. For the frontend, change `server.port` in `frontend/vite.config.ts` if 5173 is taken.

- **Prisma / DB errors**  
  Run `npx prisma generate` and `npx prisma migrate dev` again in `backend/`.
