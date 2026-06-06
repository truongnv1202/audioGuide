#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-audioguide.gamegiaoduc.co}"
SSL_DIR="${SSL_DIR:-/etc/nginx/ssl/audioguide}"
SSL_CERT_PATH="${SSL_CERT_PATH:-$SSL_DIR/origin-selfsigned.pem}"
SSL_KEY_PATH="${SSL_KEY_PATH:-$SSL_DIR/origin-selfsigned.key}"

if [ "${EUID:-$(id -u)}" -eq 0 ]; then
  SUDO=""
else
  SUDO="sudo"
fi

$SUDO mkdir -p "$SSL_DIR"

$SUDO openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout "$SSL_KEY_PATH" \
  -out "$SSL_CERT_PATH" \
  -subj "/CN=$DOMAIN" \
  -addext "subjectAltName=DNS:$DOMAIN"

$SUDO chmod 644 "$SSL_CERT_PATH"
$SUDO chmod 600 "$SSL_KEY_PATH"

cat <<EOF
Created self-signed origin certificate:
  Cert: $SSL_CERT_PATH
  Key:  $SSL_KEY_PATH

If using Cloudflare, set SSL/TLS encryption mode to Full.
Do not use Full (strict) with a self-signed origin certificate.
EOF
