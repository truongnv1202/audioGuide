# Deploy commands

## 1. Copy code vào server

```bash
mkdir -p /opt/audioguide
cd /opt/audioguide
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
DOCX_PATH="/opt/audioguide/data/source.docx" npm run seed
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

## 5. Cấu hình nginx chung

```bash
cp deploy/nginx-audioguide.conf /etc/nginx/conf.d/audioguide.conf
nginx -t
systemctl reload nginx
```

Nếu server dùng certbot:

```bash
certbot --nginx -d audioguide.gamegiaoduc.co
nginx -t
systemctl reload nginx
```

## Deploy nhanh toàn bộ

Chạy bằng script:

```bash
cd /opt/audioguide
chmod +x deploy/quick-deploy.sh
DOCX_PATH="/opt/audioguide/data/source.docx" ./deploy/quick-deploy.sh
```

Hoặc chạy thủ công:

```bash
cd /opt/audioguide
cp .env.example .env
SECRET="$(openssl rand -hex 24)"
sed -i "s/^BACKEND_SECRET=.*/BACKEND_SECRET=$SECRET/" .env
npm install
DOCX_PATH="/opt/audioguide/data/source.docx" npm run seed
docker compose up -d --build
cp deploy/nginx-audioguide.conf /etc/nginx/conf.d/audioguide.conf
nginx -t
systemctl reload nginx
echo "Frontend: https://audioguide.gamegiaoduc.co/?id=1"
echo "Backend: https://audioguide.gamegiaoduc.co/backend/$SECRET/guides"
```
