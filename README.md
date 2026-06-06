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

## Tạo dữ liệu seed từ DOCX

Script mặc định đọc file:

```text
C:\Users\vsp\Downloads\[Chiều 23.4. 2026] KB PHÂN KHU 5 - sửa theo góp ý của X03 (1).docx
```

Chạy:

```bash
npm run seed
```

Hoặc chỉ định file khác:

```bash
DOCX_PATH="/duong/dan/file.docx" npm run seed
```

Script sẽ ghi đè `src/data/seed.js` với 24 bản ghi.

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
```

Ví dụ nếu `.env` có `BACKEND_SECRET=abc123`:

```text
https://audioguide.gamegiaoduc.co/backend/abc123/guides
https://audioguide.gamegiaoduc.co/backend/abc123/guides/1
```

Nên đổi `BACKEND_SECRET` trước khi deploy production.

## Deploy Docker tại `/opt/audioguide`

Triển khai nhanh:

```bash
cd /opt/audioguide
chmod +x deploy/quick-deploy.sh
DOCX_PATH="/opt/audioguide/data/source.docx" ./deploy/quick-deploy.sh
```

Hoặc chạy từng bước:

```bash
cd /opt/audioguide
cp .env.example .env
# sửa BACKEND_SECRET trong .env trước khi chạy
npm install
npm run seed
docker compose up -d --build
```

Container bind nội bộ tại `127.0.0.1:9000`.

## Nginx reverse proxy

Thêm vào nginx chung:

```nginx
server {
    listen 80;
    server_name audioguide.gamegiaoduc.co;

    client_max_body_size 20m;

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

Sau khi cấu hình SSL bằng certbot/nginx hiện có, reload nginx:

```bash
nginx -t
systemctl reload nginx
```
