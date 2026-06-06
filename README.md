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

## Tạo dữ liệu seed

Chạy:

```bash
npm run seed
```

Script dùng dữ liệu đã nhúng sẵn trong `seed.js` và tạo `data/guides/01.json` ... `data/guides/24.json`. File `data/guides.json` vẫn được ghi thêm để backup/tương thích.

Nếu muốn chỉ định nơi lưu JSON khác:

```bash
GUIDES_DATA_PATH="/duong/dan/guides.json" GUIDES_DATA_DIR="/duong/dan/guides" npm run seed
```

Nếu muốn tạo lại 24 bài mẫu rỗng:

```bash
npm run seed:samples
```

Khi chạy Docker, thư mục `data/` được mount vào container để nội dung đã sửa không mất khi rebuild.

Mỗi bài được lưu độc lập tại:

```text
data/guides/01.json
data/guides/02.json
...
data/guides/24.json
```

Nếu đang có file cũ `data/guides.json`, ứng dụng sẽ tự migrate sang các file riêng trong lần đọc đầu tiên.

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

Để trích xuất lại 24 ảnh từ file DOCX nguồn trên máy local:

```bash
python scripts/extract-docx-images.py
```

Script đọc file DOCX trong `Downloads` và ghi ảnh vào `public/images/items`. Các ảnh luôn có alias `01.jpg` ... `24.jpg` để khớp `imageUrl` trong dữ liệu seed.

## Sinh MP3 bằng fal.ai trên máy dev

Script `scripts/generate_fal_audio.py` chỉ đọc field `description` của từng bài, không đọc `title`, `subtitle`, `title1`, `title2`, `title3`.

```bash
pip install -r requirements.txt
export FAL_KEY="YOUR_FAL_KEY"
python scripts/generate_fal_audio.py --dry-run
python scripts/generate_fal_audio.py --overwrite
```

Trên Windows PowerShell:

```powershell
pip install -r requirements.txt
$env:FAL_KEY="YOUR_FAL_KEY"
python scripts/generate_fal_audio.py --dry-run
python scripts/generate_fal_audio.py --overwrite
```

Mặc định script dùng model `fal-ai/minimax/speech-2.8-hd`, `language_boost=Vietnamese`, voice `audiobook_male_1`, tốc độ `0.92`, pitch `-2` để có giọng nam trầm, chậm hơn, phù hợp kể chuyện audio guide. Nếu chọn được voice khác trên fal.ai, đổi bằng:

```bash
FAL_VOICE_ID="voice_id_mong_muon" python scripts/generate_fal_audio.py --overwrite
```

Sinh thử một vài bài:

```bash
python scripts/generate_fal_audio.py --only 1,8,21 --overwrite
```

Kết quả ghi vào:

```text
public/audio/01.mp3
public/audio/02.mp3
...
public/audio/24.mp3
```

Khi deploy tại `/opt/audioGuide`, Nginx phục vụ trực tiếp:

```text
https://audioguide.gamegiaoduc.co/images/items/21.jpg -> /opt/audioGuide/public/images/items/21.jpg
https://audioguide.gamegiaoduc.co/audio/21.mp3 -> /opt/audioGuide/public/audio/21.mp3
```

Copy ảnh đã trích xuất lên server:

```bash
rsync -av public/images/items/ user@server:/opt/audioGuide/public/images/items/
rsync -av public/audio/ user@server:/opt/audioGuide/public/audio/
```

Sau khi copy ảnh/audio mới lên server, chạy lại `./deploy/quick-deploy.sh` hoặc `sudo nginx -t && sudo systemctl reload nginx`.

## API backend

Backend không còn nằm ở `/api/guides` công khai. Link backend dùng secret trong `.env`.

UI sửa bài:

```text
GET /backend/{BACKEND_SECRET}
```

API JSON:

```text
GET /backend/{BACKEND_SECRET}/guides
GET /backend/{BACKEND_SECRET}/guides/1
PATCH /backend/{BACKEND_SECRET}/guides/1
POST /backend/{BACKEND_SECRET}/guides/1/upload
```

Ví dụ nếu `.env` có `BACKEND_SECRET=abc123`:

```text
https://audioguide.gamegiaoduc.co/backend/abc123
https://audioguide.gamegiaoduc.co/backend/abc123/guides
https://audioguide.gamegiaoduc.co/backend/abc123/guides/1
```

Nên đổi `BACKEND_SECRET` trước khi deploy production.

Trên server lấy link backend UI thật:

```bash
SECRET="$(grep '^BACKEND_SECRET=' /opt/audioGuide/.env | cut -d= -f2-)"
echo "https://audioguide.gamegiaoduc.co/backend/$SECRET"
```

Ví dụ chỉnh bài số 1:

```bash
curl -X PATCH "https://audioguide.gamegiaoduc.co/backend/abc123/guides/1" \
  -H "Content-Type: application/json" \
  -d '{
    "title1": "Tiêu đề dòng 1",
    "title2": "Tiêu đề dòng 2",
    "title3": "Tiêu đề dòng 3",
    "description": "Nội dung mới của bài thuyết minh.",
    "imageUrl": "/images/items/01.jpg",
    "audioUrl": "/audio/01.mp3",
    "playbackRate": 1,
    "titleLayout": {
      "left": "16px",
      "top": "38px",
      "width": "56%",
      "align": "left",
      "gap": "6px",
      "title1Size": "clamp(22px, 5.85vw, 68px)",
      "title2Size": "clamp(16px, 4.5vw, 52px)",
      "title3Size": "clamp(14px, 4vw, 44px)",
      "lineHeight": "1.05"
    },
    "imageLayout": {
      "foregroundPosition": "85% center",
      "backgroundPosition": "center",
      "backgroundOpacity": 1,
      "overlayOpacity": 0.8
    }
  }'
```

Các field có thể sửa: `title`, `subtitle`, `title1`, `title2`, `title3`, `description`, `imageUrl`, `audioUrl`, `playbackRate`, `titleLayout`, `imageLayout`.

`playbackRate` cấu hình tốc độ phát MP3 theo từng bài, ví dụ `0.9`, `1`, `1.25`, `1.5`. `title1`, `title2`, `title3` hỗ trợ xuống dòng. Dòng nào để trống sẽ tự ẩn khỏi giao diện. `titleLayout` cấu hình vị trí/cỡ chữ phần tiêu đề theo từng bài. `imageLayout.foregroundPosition` chỉnh độ lệch ảnh thật trong hero, `backgroundPosition` chỉnh vị trí ảnh nền, `backgroundOpacity` chỉnh độ mờ ảnh nền, `overlayOpacity` chỉnh độ che của lớp vàng từ `0` đến `1`.

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
mkdir -p data
chmod +x deploy/quick-deploy.sh
./deploy/quick-deploy.sh
```

Script này tự tạo/cập nhật `.env`, tạo thư mục upload, build Docker, tự tạo self-signed SSL cert nếu chưa có, ghi nginx site config và reload nginx. Script không tự chạy seed để tránh ghi đè dữ liệu đã biên tập.

Khi cần tạo lại dữ liệu seed:

```bash
cd /opt/audioGuide
docker run --rm -v "$PWD:/app" -w /app -e GUIDES_DATA_PATH=/app/data/guides.json -e GUIDES_DATA_DIR=/app/data/guides node:22-alpine sh -lc "npm install && npm run seed"
```

Hoặc chạy từng bước:

```bash
cd /opt/audioGuide
cp .env.example .env
# sửa BACKEND_SECRET trong .env trước khi chạy
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
