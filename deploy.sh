#!/usr/bin/env bash
# ROOMI deploy script — run after git pull from repo root:
#   ./deploy.sh
# Or: bash deploy.sh
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "==> Deploying ROOMI from $ROOT"

echo "==> Backend: install, prisma, build"
cd "$ROOT/backend"
npm ci --omit=dev
npx prisma generate
npx prisma migrate deploy
npm run build

echo "==> Frontend: install, build"
cd "$ROOT/frontend"
npm ci
npm run build

echo "==> PM2: restart roomi-backend"
cd "$ROOT"
pm2 restart roomi-backend
pm2 save

if command -v systemctl &>/dev/null && systemctl is-active --quiet nginx 2>/dev/null; then
  echo "==> Nginx: reload"
  sudo systemctl reload nginx
fi

echo "==> Deploy done."
