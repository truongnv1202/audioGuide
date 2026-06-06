# AudioGuide

Hệ thống audio guide chạy bằng Next.js, Tailwind CSS và API backend tích hợp trong Next.js.

## Link truy cập

Ứng dụng dùng đúng dạng URL:

```text
https://audioguide.gamegiaoduc.co/?id=1
https://audioguide.gamegiaoduc.co/?id=2
...
https://audioguide.gamegiaoduc.co/?id=24
```

## Chạy local

```bash
npm install
cp .env.example .env
npm run dev
```

Mở `http://localhost:9000/?id=1`.

## Tạo dữ liệu seed mẫu

Chạy:

```bash
npm run seed
```

Script sẽ tạo `data/guides.json` với 24 bài mẫu để biên tập sau qua backend.

Nếu muốn lưu ở file khác:

```bash
GUIDES_DATA_PATH="/duong/dan/guides.json" npm run seed
```

Khi chạy Docker, thư mục `data/` được mount vào container để nội dung đã sửa không mất khi rebuild.

## Ảnh và audio

Đặt file theo quy ước:

```text
public/images/items/01.jpg
public/images/items/02.jpg
...
public/images/items/24.jpg

public/audio/01.mp3
public/audio/02.mp3
...
public/audio/24.mp3
```

Nếu ảnh chưa có, giao diện tự dùng ảnh placeholder. Nếu audio chưa có, nút play sẽ báo thiếu file.

## API backend

Backend không còn nằm ở `/api/guides` công khai. Link backend dùng secret trong `.env`:

```text
GET /backend/{BACKEND_SECRET}/guides
GET /backend/{BACKEND_SECRET}/guides/1
PATCH /backend/{BACKEND_SECRET}/guides/1
POST /backend/{BACKEND_SECRET}/guides/1/upload
```

Ví dụ nếu `.env` có `BACKEND_SECRET=abc123`:

```text
https://audioguide.gamegiaoduc.co/backend/abc123/guides
https://audioguide.gamegiaoduc.co/backend/abc123/guides/1
```

Nên đổi `BACKEND_SECRET` trước khi deploy production.

Ví dụ chỉnh bài số 1:

```bash
curl -X PATCH "https://audioguide.gamegiaoduc.co/backend/abc123/guides/1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tiêu đề mới",
    "subtitle": "(1921 - 1960)",
    "description": "Nội dung mới của bài thuyết minh.",
    "imageUrl": "/images/items/01.jpg",
    "audioUrl": "/audio/01.mp3"
  }'
```

Các field có thể sửa: `title`, `subtitle`, `description`, `imageUrl`, `audioUrl`.

Upload ảnh và MP3 cho bài số 1:

```bash
curl -X POST "https://audioguide.gamegiaoduc.co/backend/abc123/guides/1/upload" \
  -F "image=@/duong/dan/anh-01.jpg" \
  -F "audio=@/duong/dan/audio-01.mp3"
```

Có thể upload riêng từng loại:

```bash
curl -X POST "https://audioguide.gamegiaoduc.co/backend/abc123/guides/1/upload" \
  -F "image=@/duong/dan/anh-01.png"

curl -X POST "https://audioguide.gamegiaoduc.co/backend/abc123/guides/1/upload" \
  -F "audio=@/duong/dan/audio-01.mp3"
```

File upload được lưu trong `data/uploads` và được phục vụ qua `/media/images/...` hoặc `/media/audio/...`. Sau khi upload, backend tự cập nhật `imageUrl` và `audioUrl` của bài.

Reset lại 24 bài mẫu:

```bash
curl -X POST "https://audioguide.gamegiaoduc.co/backend/abc123/guides" \
  -H "Content-Type: application/json" \
  -d '{"action":"reset-samples"}'
```

## Deploy Docker tại `/opt/audioGuide`

Triển khai nhanh:

```bash
cd /opt/audioGuide
chmod +x deploy/quick-deploy.sh
./deploy/quick-deploy.sh
```

Script này tự tạo/cập nhật `.env`, seed dữ liệu, tạo thư mục upload, build Docker, tự tạo self-signed SSL cert nếu chưa có, ghi nginx site config và reload nginx.

Hoặc chạy từng bước:

```bash
cd /opt/audioGuide
cp .env.example .env
# sửa BACKEND_SECRET trong .env trước khi chạy
npm install
npm run seed
docker compose up -d --build
```

Container bind nội bộ tại `127.0.0.1:9000`.

## SSL origin tự ký

Ứng dụng có thể tự tạo self-signed certificate cho nginx origin. Nếu chạy sau Cloudflare với cert tự ký, đặt **SSL/TLS encryption mode** trong Cloudflare là **Full**. Không dùng `Flexible` vì dễ redirect loop, và không dùng `Full (strict)` vì Cloudflare sẽ không tin cert tự ký.

Tạo cert thủ công nếu cần:

```bash
cd /opt/audioGuide
chmod +x deploy/create-self-signed-origin-cert.sh
./deploy/create-self-signed-origin-cert.sh
```

`deploy/quick-deploy.sh` cũng tự tạo cert này nếu chưa tồn tại.

## Nginx reverse proxy

Thêm vào nginx chung. File mẫu nằm tại `deploy/nginx-audioguide.conf`:

```nginx
server {
    listen 80;
    server_name audioguide.gamegiaoduc.co;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name audioguide.gamegiaoduc.co;

    ssl_certificate /etc/nginx/ssl/audioguide/origin-selfsigned.pem;
    ssl_certificate_key /etc/nginx/ssl/audioguide/origin-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 100m;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location ^~ /api/ {
        return 404;
    }

    location ^~ /backend/ {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Cache-Control "no-store";
    }

    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Sau khi copy config và cert/key, test rồi reload nginx:

```bash
nginx -t
systemctl reload nginx
```
