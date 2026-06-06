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

## Deploy Docker tại `/opt/audioGuide`

Triển khai nhanh:

```bash
cd /opt/audioGuide
chmod +x deploy/quick-deploy.sh
CF_ORIGIN_CERT_FILE="/opt/audioGuide/certs/cloudflare-origin.pem" \
CF_ORIGIN_KEY_FILE="/opt/audioGuide/certs/cloudflare-origin.key" \
DOCX_PATH="/opt/audioGuide/data/source.docx" \
./deploy/quick-deploy.sh
```

Script này tự tạo/cập nhật `.env`, seed dữ liệu, build Docker, cài Cloudflare origin cert/key, ghi nginx site config và reload nginx.

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

## Cloudflare SSL tránh lỗi origin

Khi chạy sau Cloudflare, đặt **SSL/TLS encryption mode** trong Cloudflare là **Full (strict)**. Không dùng `Flexible` vì dễ gây redirect loop hoặc lỗi HTTPS giữa Cloudflare và nginx.

Cách nhanh nhất là dùng **Cloudflare Origin Certificate**:

1. Vào Cloudflare dashboard > `SSL/TLS` > `Origin Server` > `Create Certificate`.
2. Hostnames nên có `audioguide.gamegiaoduc.co` và có thể thêm `*.gamegiaoduc.co` nếu dùng chung cho subdomain khác.
3. Có thể tạo private key + CSR mới trên server:

```bash
cd /opt/audioGuide
chmod +x deploy/create-cloudflare-origin-csr.sh
./deploy/create-cloudflare-origin-csr.sh
```

Trong Cloudflare chọn **Use my private key and CSR**, paste CSR script in ra, rồi lưu certificate Cloudflare trả về:

```bash
tee /opt/audioGuide/certs/cloudflare-origin.pem >/dev/null <<'EOF'
-----BEGIN CERTIFICATE-----
PASTE_CLOUDFLARE_ORIGIN_CERTIFICATE_HERE
-----END CERTIFICATE-----
EOF

chmod 644 /opt/audioGuide/certs/cloudflare-origin.pem
chmod 600 /opt/audioGuide/certs/cloudflare-origin.key
```

Nếu để Cloudflare tự tạo cả cert/key, lưu cả hai file vào server:

```bash
mkdir -p /opt/audioGuide/certs

tee /opt/audioGuide/certs/cloudflare-origin.pem >/dev/null <<'EOF'
-----BEGIN CERTIFICATE-----
PASTE_CLOUDFLARE_ORIGIN_CERTIFICATE_HERE
-----END CERTIFICATE-----
EOF

tee /opt/audioGuide/certs/cloudflare-origin.key >/dev/null <<'EOF'
-----BEGIN PRIVATE KEY-----
PASTE_CLOUDFLARE_ORIGIN_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----
EOF

chmod 644 /opt/audioGuide/certs/cloudflare-origin.pem
chmod 600 /opt/audioGuide/certs/cloudflare-origin.key
```

Không commit cert/key thật vào repository. Nếu không dùng Cloudflare Origin Certificate, có thể dùng Let's Encrypt với DNS challenge cho `audioguide.gamegiaoduc.co`, rồi trỏ `ssl_certificate` và `ssl_certificate_key` sang đường dẫn certbot cấp.

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

    ssl_certificate /etc/nginx/ssl/audioguide/cloudflare-origin.pem;
    ssl_certificate_key /etc/nginx/ssl/audioguide/cloudflare-origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;

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

Sau khi copy config và cert/key, test rồi reload nginx:

```bash
nginx -t
systemctl reload nginx
```
