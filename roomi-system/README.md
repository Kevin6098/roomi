# ROOMI / SecondLife Japan

MVP web system for second-hand items buy/sell/rent management. Responsive frontend (vanilla HTML/CSS/JS) and Node.js + Express + MySQL backend.

---

## Project structure

```
roomi-system/
  backend/          # Node.js + Express API
  frontend/         # Static HTML/CSS/JS
```

---

## 1. Backend setup

### Install dependencies

```bash
cd roomi-system/backend
npm install
```

### MySQL setup

1. Install MySQL and start the server.
2. Create a database (e.g. `roomi_db`):

   ```sql
   CREATE DATABASE roomi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Run the schema to create tables:

   ```bash
   mysql -u root -p roomi_db < schema.sql
   ```

   Or from the MySQL shell:

   ```sql
   USE roomi_db;
   SOURCE /path/to/roomi-system/backend/schema.sql;
   ```

### Configure environment

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your MySQL credentials and port:

   ```
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=roomi_db
   ```

### Start the backend server

```bash
npm start
```

Or with auto-reload:

```bash
npm run dev
```

The API will be at **http://localhost:3000**. Health check: http://localhost:3000/api/health

---

## 2. Frontend (static pages)

The frontend is plain static files. Serve them with any static server so that:

- Pages load from the same origin (or you keep the default `API_BASE` and allow CORS).
- The backend is running at `http://localhost:3000` (or update `frontend/js/api.js` to your API URL).

### Option A: VS Code Live Server

1. Install the **Live Server** extension.
2. Right-click `frontend/index.html` → **Open with Live Server**.
3. The app opens at e.g. `http://127.0.0.1:5500/frontend/` (port may vary).

### Option B: Simple static server (Node)

From the project root:

```bash
npx serve frontend -p 5000
```

Then open **http://localhost:5000** (or the URL shown).

### Option C: Python

```bash
cd frontend
python3 -m http.server 8080
```

Open **http://localhost:8080**.

---

## 3. Using the app

- **Dashboard (index.html)** — Counts (in stock, listed, rented, sold) and recently added items.
- **Items** — List, filter, add, edit, change status, soft-delete (dispose).
- **Customers** — List, add, edit.
- **Rentals** — Create rental (item → rented), end rental (item → in_stock), set damage fee.
- **Sales** — Create sale (item → sold).

Ensure the backend is running before using the frontend; the frontend calls `http://localhost:3000/api` by default (see `frontend/js/api.js`).

---

## 4. API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | List items (query: status, category, location_area, search) |
| GET | /api/items/counts | Dashboard counts by status |
| GET | /api/items/recent | Last 5 items |
| GET | /api/items/:id | Get one item |
| POST | /api/items | Create item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Soft-delete (status = disposed) |
| GET/POST/PUT/DELETE | /api/customers | CRUD customers |
| GET/POST/PUT | /api/rentals | List, create, update rentals |
| PATCH | /api/rentals/:id/damage | Set damage_fee |
| GET/POST | /api/sales | List, create sales |

All request/response bodies are JSON. Use CORS-friendly origins in development.
