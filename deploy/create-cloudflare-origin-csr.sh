#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-audioguide.gamegiaoduc.co}"
APP_DIR="${APP_DIR:-/opt/audioGuide}"
CERT_DIR="${CERT_DIR:-$APP_DIR/certs}"
KEY_FILE="$CERT_DIR/cloudflare-origin.key"
CSR_FILE="$CERT_DIR/cloudflare-origin.csr"
CERT_FILE="$CERT_DIR/cloudflare-origin.pem"

mkdir -p "$CERT_DIR"
chmod 700 "$CERT_DIR"

openssl req -new -newkey rsa:2048 -nodes \
  -keyout "$KEY_FILE" \
  -out "$CSR_FILE" \
  -subj "/CN=$DOMAIN" \
  -addext "subjectAltName=DNS:$DOMAIN"

chmod 600 "$KEY_FILE"

cat <<EOF
Created:
  Private key: $KEY_FILE
  CSR:         $CSR_FILE

Next steps:
1. Open Cloudflare Dashboard > SSL/TLS > Origin Server > Create Certificate.
2. Choose "Use my private key and CSR".
3. Paste the CSR below.
4. Save Cloudflare's returned certificate to:
   $CERT_FILE
5. Set Cloudflare SSL/TLS mode to Full (strict).

CSR:
EOF

cat "$CSR_FILE"
