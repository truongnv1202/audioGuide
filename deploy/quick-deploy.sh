#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-audioguide.gamegiaoduc.co}"
APP_DIR="${APP_DIR:-/opt/audioGuide}"
CONTAINER_GUIDES_DATA_PATH="${CONTAINER_GUIDES_DATA_PATH:-/app/data/guides.json}"
HOST_UPLOADS_DIR="${HOST_UPLOADS_DIR:-$APP_DIR/data/uploads}"
CONTAINER_UPLOADS_DIR="${CONTAINER_UPLOADS_DIR:-/app/data/uploads}"
PORT="${PORT:-9000}"
SSL_DIR="${SSL_DIR:-/etc/nginx/ssl/audioguide}"
SSL_CERT_PATH="${SSL_CERT_PATH:-$SSL_DIR/origin-selfsigned.pem}"
SSL_KEY_PATH="${SSL_KEY_PATH:-$SSL_DIR/origin-selfsigned.key}"
NGINX_CONF="${NGINX_CONF:-/etc/nginx/conf.d/audioguide.conf}"

if [ "${EUID:-$(id -u)}" -eq 0 ]; then
  SUDO=""
else
  SUDO="sudo"
fi

require_command() {
  if ! command -v "$1" >/dev/null 2>&1 && [ ! -x "/usr/sbin/$1" ]; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

set_env_value() {
  local key="$1"
  local value="$2"

  if grep -q "^$key=" .env; then
    sed -i "s|^$key=.*|$key=$value|" .env
  else
    printf "\n%s=%s\n" "$key" "$value" >>.env
  fi
}

install_origin_cert() {
  $SUDO mkdir -p "$SSL_DIR"

  if [ -n "${ORIGIN_CERT_FILE:-}" ] && [ -n "${ORIGIN_KEY_FILE:-}" ]; then
    $SUDO cp "$ORIGIN_CERT_FILE" "$SSL_CERT_PATH"
    $SUDO cp "$ORIGIN_KEY_FILE" "$SSL_KEY_PATH"
  fi

  if [ ! -f "$SSL_CERT_PATH" ] || [ ! -f "$SSL_KEY_PATH" ]; then
    echo "Generating self-signed origin certificate for $DOMAIN"
    $SUDO openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
      -keyout "$SSL_KEY_PATH" \
      -out "$SSL_CERT_PATH" \
      -subj "/CN=$DOMAIN" \
      -addext "subjectAltName=DNS:$DOMAIN"
  fi

  $SUDO chmod 644 "$SSL_CERT_PATH"
  $SUDO chmod 600 "$SSL_KEY_PATH"
}

write_nginx_site_config() {
  $SUDO mkdir -p "$(dirname "$NGINX_CONF")"
  $SUDO tee "$NGINX_CONF" >/dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate $SSL_CERT_PATH;
    ssl_certificate_key $SSL_KEY_PATH;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 100m;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location ^~ /images/ {
        root $APP_DIR/public;
        try_files \$uri @audioguide_app;
        add_header Cache-Control "public, max-age=86400";
    }

    location ^~ /audio/ {
        root $APP_DIR/public;
        try_files \$uri @audioguide_app;
        add_header Cache-Control "public, max-age=86400";
    }

    location @audioguide_app {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location ^~ /api/ {
        return 404;
    }

    location ^~ /backend/ {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        add_header Cache-Control "no-store";
    }

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
}

require_command docker
require_command nginx
require_command openssl

cd "$APP_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
fi

SECRET="$(grep "^BACKEND_SECRET=" .env | cut -d= -f2- || true)"
if [ -z "$SECRET" ] || [ "$SECRET" = "change-this-backend-secret" ]; then
  SECRET="$(openssl rand -hex 24)"
  set_env_value "BACKEND_SECRET" "$SECRET"
fi
set_env_value "PORT" "$PORT"
set_env_value "GUIDES_DATA_PATH" "$CONTAINER_GUIDES_DATA_PATH"
set_env_value "UPLOADS_DIR" "$CONTAINER_UPLOADS_DIR"

mkdir -p "$HOST_UPLOADS_DIR" "$APP_DIR/public/images/items" "$APP_DIR/public/audio"

install_origin_cert

docker compose up -d --build

write_nginx_site_config
$SUDO nginx -t
$SUDO systemctl reload nginx

echo "Frontend: https://$DOMAIN/?id=1"
echo "Backend:  https://$DOMAIN/backend/$SECRET/guides"
echo "Nginx:    $NGINX_CONF"
echo "Cert:     $SSL_CERT_PATH"
echo "Cloudflare SSL/TLS mode: Full (not Full strict) when using this self-signed cert"
