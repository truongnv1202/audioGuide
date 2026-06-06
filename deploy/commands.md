# Deploy commands

## 1. Copy code vào server

```bash
mkdir -p /opt/audioGuide
cd /opt/audioGuide
```

## 2. Cài dependency và tạo seed mẫu

Tạo file môi trường:

```bash
cp .env.example .env
SECRET="$(openssl rand -hex 24)"
sed -i "s/^BACKEND_SECRET=.*/BACKEND_SECRET=$SECRET/" .env
echo "Backend secret URL: https://audioguide.gamegiaoduc.co/backend/$SECRET/guides"
```

```bash
npm install
npm run seed
```

Kết quả sẽ ghi vào:

```text
data/guides.json
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

## 4.1. Chỉnh nội dung qua backend

Sau deploy, lấy `BACKEND_SECRET` trong `.env` rồi gọi:

```bash
SECRET="$(grep '^BACKEND_SECRET=' .env | cut -d= -f2-)"

curl -X PATCH "https://audioguide.gamegiaoduc.co/backend/$SECRET/guides/1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tiêu đề mới",
    "subtitle": "Tiêu đề phụ",
    "description": "Nội dung mới",
    "imageUrl": "/images/items/01.jpg",
    "audioUrl": "/audio/01.mp3"
  }'
```

## 5. Tự tạo SSL certificate cho origin

```bash
cd /opt/audioGuide
chmod +x deploy/create-self-signed-origin-cert.sh
./deploy/create-self-signed-origin-cert.sh
```

File được tạo tại:

```text
/etc/nginx/ssl/audioguide/origin-selfsigned.pem
/etc/nginx/ssl/audioguide/origin-selfsigned.key
```

Nếu chạy sau Cloudflare với cert tự ký, vào Cloudflare `SSL/TLS` > `Overview` và đặt mode là **Full**. Không dùng **Full (strict)** với self-signed cert.

## 6. Cấu hình nginx chung

```bash
sudo cp deploy/nginx-audioguide.conf /etc/nginx/conf.d/audioguide.conf
sudo nginx -t
sudo systemctl reload nginx
```

## Deploy nhanh toàn bộ

Chạy bằng script, script sẽ tự tạo self-signed cert nếu chưa có và ghi site config nginx:

```bash
cd /opt/audioGuide
chmod +x deploy/quick-deploy.sh
./deploy/quick-deploy.sh
```

Script sẽ tự:

- Tạo/cập nhật `.env` và `BACKEND_SECRET`.
- Chạy `npm install` và `npm run seed`.
- Build/chạy Docker bằng `docker compose up -d --build`.
- Tự tạo cert/key vào `/etc/nginx/ssl/audioguide` nếu chưa có.
- Ghi site config vào `/etc/nginx/conf.d/audioguide.conf`.
- Chạy `nginx -t` và `systemctl reload nginx`.

Hoặc chạy thủ công:

```bash
cd /opt/audioGuide
cp .env.example .env
SECRET="$(openssl rand -hex 24)"
sed -i "s/^BACKEND_SECRET=.*/BACKEND_SECRET=$SECRET/" .env
npm install
npm run seed
docker compose up -d --build
sudo cp deploy/nginx-audioguide.conf /etc/nginx/conf.d/audioguide.conf
sudo nginx -t
sudo systemctl reload nginx
echo "Frontend: https://audioguide.gamegiaoduc.co/?id=1"
echo "Backend: https://audioguide.gamegiaoduc.co/backend/$SECRET/guides"
```
