# ROOMI — Deploy to VPS

Guide to deploy ROOMI backend and frontend on a VPS (e.g. for **roomi** at [Sun Tzu Technologies](https://suntzutechnologies.com/)).

**Ports (as planned):**
- **Backend (API):** `4012`
- **Frontend (app):** `3012`

**Assumptions:** Ubuntu 22.04 LTS (or similar), one domain/subdomain (e.g. `roomi.suntzutechnologies.com`), Nginx as reverse proxy, HTTPS with Let’s Encrypt.

---

## 1) VPS requirements

- **OS:** Ubuntu 22.04 LTS (or 20.04)
- **Node.js:** 20 LTS or 22 LTS
- **PostgreSQL:** 14 or 16
- **Nginx:** for reverse proxy and (optionally) static frontend
- **PM2:** to run Node processes
- **Domain:** e.g. `roomi.suntzutechnologies.com` pointing to the VPS IP

---

## 2) Server setup (one-time)

### 2.1 Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # v20.x
```

### 2.2 Install PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

Create DB and user:

```bash
sudo -u postgres psql -c "CREATE USER roomi WITH PASSWORD 'YOUR_SECURE_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE roomi_db OWNER roomi;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE roomi_db TO roomi;"
```

(Use a strong password and store it in `.env` as below.)

### 2.3 Install Nginx and PM2

```bash
sudo apt install -y nginx
sudo npm install -g pm2
```

---

## 3) Deploy the app

### 3.1 Clone repo and install

```bash
cd /var/www   # or your preferred path
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
git clone <YOUR_REPO_URL> roomi
cd roomi
```

### 3.2 Backend

```bash
cd /var/www/roomi/backend
npm ci --omit=dev
cp .env.example .env
# Edit .env (see below)
npx prisma generate
npx prisma migrate deploy
npx prisma db seed   # optional, if you want seed data
npm run build
```

**Backend `.env` (production):**

```env
PORT=4012
NODE_ENV=production
DATABASE_URL="postgresql://roomi:YOUR_SECURE_PASSWORD@localhost:5432/roomi_db?schema=public"
CORS_ORIGIN=https://roomi.suntzutechnologies.com
```

Replace `YOUR_SECURE_PASSWORD` and the domain if different.

### 3.3 Frontend

Set the API base to the same origin (Nginx will proxy `/api` to the backend), so the frontend talks to `https://roomi.suntzutechnologies.com/api`.

```bash
cd /var/www/roomi/frontend
npm ci
npm run build
```

The build output is in `frontend/dist/`. You will either serve it with Nginx (recommended) or with a static server on port 3012 (see below).

---

## 4) Run with PM2

### Backend (port 4012)

```bash
cd /var/www/roomi/backend
pm2 start dist/index.js --name roomi-api
pm2 save
pm2 startup   # enable start on boot
```

Check:

```bash
pm2 status
curl -s http://localhost:4012/api/health
```

### Frontend on port 3012 (optional)

If you want the frontend as its own Node process on 3012:

```bash
cd /var/www/roomi/frontend
npx serve -s dist -l 3012
pm2 start npx --name roomi-web -- serve -s dist -l 3012
pm2 save
```

Then Nginx will proxy to `http://127.0.0.1:3012` for the app (see Nginx config below).

**Alternative (recommended):** Don’t run the frontend on 3012; serve the built files directly with Nginx (no extra process). The “frontend port 3012” then only matters if you explicitly want a separate app server.

---

## 5) Nginx reverse proxy

Use one server block for `roomi.suntzutechnologies.com`: proxy `/api` to backend (4012) and serve the frontend (either from disk or from 3012).

### Option A — Nginx serves frontend static files (recommended)

No frontend process on 3012; Nginx serves `frontend/dist` and proxies `/api` to 4012.

```bash
sudo nano /etc/nginx/sites-available/roomi
```

Paste (replace domain and paths if needed):

```nginx
server {
    listen 80;
    server_name roomi.suntzutechnologies.com;

    # Frontend (static build)
    root /var/www/roomi/frontend/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API (port 4012)
    location /api {
        proxy_pass http://127.0.0.1:4012;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/roomi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option B — Frontend on port 3012, Nginx proxies to both

If you run the frontend with `serve -s dist -l 3012`:

```nginx
server {
    listen 80;
    server_name roomi.suntzutechnologies.com;

    location / {
        proxy_pass http://127.0.0.1:3012;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://127.0.0.1:4012;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 6) HTTPS (Let’s Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d roomi.suntzutechnologies.com
```

Follow prompts. Certbot will adjust Nginx for HTTPS and set up renewal.

Test:

- https://roomi.suntzutechnologies.com (frontend)
- https://roomi.suntzutechnologies.com/api/health (backend)

---

## 7) Frontend API base in production

The frontend is built to use relative URLs (`/api`). With the Nginx setup above, the same origin is `https://roomi.suntzutechnologies.com`, so no change is needed. If you ever use a different API origin, add in `frontend/.env.production`:

```env
VITE_API_BASE=https://roomi.suntzutechnologies.com/api
```

and in code use `import.meta.env.VITE_API_BASE` for the API base (you’d need a small change in `frontend/src/api/client.ts` to read it when set).

---

## 8) Port summary

| Service   | Internal port | Public URL |
|----------|----------------|------------|
| Backend  | **4012**       | `https://roomi.suntzutechnologies.com/api` |
| Frontend | **3012** (optional) or Nginx static | `https://roomi.suntzutechnologies.com` |

---

## 9) Checklist

- [ ] DNS: `roomi.suntzutechnologies.com` → VPS IP
- [ ] PostgreSQL: DB `roomi_db`, user `roomi`, password in backend `.env`
- [ ] Backend: `.env` with `PORT=4012`, `DATABASE_URL`, `CORS_ORIGIN`
- [ ] Backend: `prisma migrate deploy`, `npm run build`, PM2 on 4012
- [ ] Frontend: `npm run build`, Nginx (or PM2 on 3012)
- [ ] Nginx: proxy `/api` → 4012, serve frontend (or proxy `/` → 3012)
- [ ] HTTPS: `certbot --nginx -d roomi.suntzutechnologies.com`
- [ ] Firewall: allow 80, 443; keep 3012/4012 only on localhost (default with Nginx proxy)

---

## 10) Updates (redeploy)

```bash
cd /var/www/roomi
git pull
cd backend && npm ci --omit=dev && npx prisma migrate deploy && npm run build && pm2 restart roomi-api
cd ../frontend && npm ci && npm run build
sudo systemctl reload nginx
```

---

*ROOMI — deploy to VPS. Backend 4012, frontend 3012 (optional) or Nginx static. [Sun Tzu Technologies](https://suntzutechnologies.com/).*
