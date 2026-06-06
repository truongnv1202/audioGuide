#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-audioguide.gamegiaoduc.co}"
APP_DIR="${APP_DIR:-/opt/audioguide}"
DOCX_PATH="${DOCX_PATH:-/opt/audioguide/data/source.docx}"
NGINX_CONF="/etc/nginx/conf.d/audioguide.conf"

cd "$APP_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
fi

SECRET="$(openssl rand -hex 24)"
sed -i "s/^BACKEND_SECRET=.*/BACKEND_SECRET=$SECRET/" .env

npm install
DOCX_PATH="$DOCX_PATH" npm run seed

docker compose up -d --build

cp deploy/nginx-audioguide.conf "$NGINX_CONF"
nginx -t
systemctl reload nginx

echo "Frontend: https://$DOMAIN/?id=1"
echo "Backend:  https://$DOMAIN/backend/$SECRET/guides"
