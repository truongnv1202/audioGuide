# Deploy commands

## 1. Copy code vào server

```bash
mkdir -p /opt/audioGuide
cd /opt/audioGuide
```

## 2. Cài dependency và tạo seed từ DOCX

Tạo file môi trường:

```bash
cp .env.example .env
SECRET="$(openssl rand -hex 24)"
sed -i "s/^BACKEND_SECRET=.*/BACKEND_SECRET=$SECRET/" .env
echo "Backend secret URL: https://audioguide.gamegiaoduc.co/backend/$SECRET/guides"
```

Nếu file DOCX nằm đúng đường dẫn mặc định trong `seed.js`:

```bash
npm install
npm run seed
```

Nếu DOCX nằm ở đường dẫn khác trên server:

```bash
DOCX_PATH="/opt/audioGuide/data/source.docx" npm run seed
```

Kết quả sẽ ghi vào:

```text
src/data/seed.js
```

## 3. Đặt ảnh và audio

```bash
mkdir -p public/images/items public/audio
```

Đặt file:

```text
public/images/items/01.jpg ... public/images/items/24.jpg
public/audio/01.mp3 ... public/audio/24.mp3
```

## 4. Build và chạy Docker

```bash
docker compose up -d --build
docker compose ps
```

App sẽ chạy nội bộ tại:

```text
127.0.0.1:9000
```

## 5. Tạo SSL certificate cho Cloudflare

Trong Cloudflare dashboard, vào `SSL/TLS` > `Overview` và đặt mode là **Full (strict)**.

Tạo Cloudflare Origin Certificate tại `SSL/TLS` > `Origin Server` > `Create Certificate`, dùng hostname `audioguide.gamegiaoduc.co`. Sau đó lưu cert/key vào server:

```bash
sudo mkdir -p /etc/nginx/ssl/audioguide

sudo tee /etc/nginx/ssl/audioguide/cloudflare-origin.pem >/dev/null <<'EOF'
-----BEGIN CERTIFICATE-----
PASTE_CLOUDFLARE_ORIGIN_CERTIFICATE_HERE
-----END CERTIFICATE-----
EOF

sudo tee /etc/nginx/ssl/audioguide/cloudflare-origin.key >/dev/null <<'EOF'
-----BEGIN PRIVATE KEY-----
PASTE_CLOUDFLARE_ORIGIN_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----
EOF

sudo chmod 644 /etc/nginx/ssl/audioguide/cloudflare-origin.pem
sudo chmod 600 /etc/nginx/ssl/audioguide/cloudflare-origin.key
```

Không đưa cert/key thật vào git. Nếu không muốn dùng Cloudflare Origin Certificate, dùng Let's Encrypt DNS challenge rồi sửa `ssl_certificate` và `ssl_certificate_key` trong nginx sang đường dẫn certbot cấp.

## 6. Cấu hình nginx chung

```bash
sudo cp deploy/nginx-audioguide.conf /etc/nginx/conf.d/audioguide.conf
sudo nginx -t
sudo systemctl reload nginx
```

## Deploy nhanh toàn bộ

Chạy bằng script, gồm cả cài Cloudflare cert/key và ghi site config nginx:

```bash
cd /opt/audioGuide
chmod +x deploy/quick-deploy.sh
CF_ORIGIN_CERT_FILE="/opt/audioGuide/certs/cloudflare-origin.pem" \
CF_ORIGIN_KEY_FILE="/opt/audioGuide/certs/cloudflare-origin.key" \
DOCX_PATH="/opt/audioGuide/data/source.docx" \
./deploy/quick-deploy.sh
```

Script sẽ tự:

- Tạo/cập nhật `.env` và `BACKEND_SECRET`.
- Chạy `npm install` và `npm run seed`.
- Build/chạy Docker bằng `docker compose up -d --build`.
- Copy cert/key vào `/etc/nginx/ssl/audioguide`.
- Ghi site config vào `/etc/nginx/conf.d/audioguide.conf`.
- Chạy `nginx -t` và `systemctl reload nginx`.

Hoặc chạy thủ công:

```bash
cd /opt/audioGuide
cp .env.example .env
SECRET="$(openssl rand -hex 24)"
sed -i "s/^BACKEND_SECRET=.*/BACKEND_SECRET=$SECRET/" .env
npm install
DOCX_PATH="/opt/audioGuide/data/source.docx" npm run seed
docker compose up -d --build
sudo cp deploy/nginx-audioguide.conf /etc/nginx/conf.d/audioguide.conf
sudo nginx -t
sudo systemctl reload nginx
echo "Frontend: https://audioguide.gamegiaoduc.co/?id=1"
echo "Backend: https://audioguide.gamegiaoduc.co/backend/$SECRET/guides"
```
