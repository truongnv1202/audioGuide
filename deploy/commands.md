# Deploy commands

## 1. Copy code vào server

```bash
mkdir -p /opt/audioGuide
cd /opt/audioGuide
```

## 2. Cài dependency và tạo seed

Tạo file môi trường:

```bash
cp .env.example .env
SECRET="$(openssl rand -hex 24)"
sed -i "s/^BACKEND_SECRET=.*/BACKEND_SECRET=$SECRET/" .env
echo "Backend UI: https://audioguide.gamegiaoduc.co/backend/$SECRET"
```

```bash
mkdir -p data

docker run --rm \
  -v "$PWD:/app" \
  -w /app \
  -e GUIDES_DATA_PATH=/app/data/guides.json \
  -e GUIDES_DATA_DIR=/app/data/guides \
  node:22-alpine \
  sh -lc "npm install && npm run seed"
```

Kết quả sẽ ghi vào:

```text
data/guides/01.json ... data/guides/24.json
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

Nếu cần lấy ảnh từ DOCX nguồn trên máy local, chạy:

```bash
python scripts/extract-docx-images.py
```

Sau đó copy thư mục ảnh lên server:

```bash
rsync -av public/images/items/ user@server:/opt/audioGuide/public/images/items/
```

Trên server, các URL này được Nginx phục vụ trực tiếp từ thư mục `public`:

```text
https://audioguide.gamegiaoduc.co/images/items/21.jpg -> /opt/audioGuide/public/images/items/21.jpg
https://audioguide.gamegiaoduc.co/audio/21.mp3 -> /opt/audioGuide/public/audio/21.mp3
```

Nếu vừa copy thêm file ảnh/audio, chạy lại `./deploy/quick-deploy.sh` hoặc:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Kiểm tra riêng ảnh item 21 trên server:

```bash
ls -l /opt/audioGuide/public/images/items/21.jpg
curl -I http://127.0.0.1:9000/images/items/21.jpg
curl -I https://audioguide.gamegiaoduc.co/images/items/21.jpg
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

Sau deploy, mở UI backend:

```bash
SECRET="$(grep '^BACKEND_SECRET=' .env | cut -d= -f2-)"
echo "https://audioguide.gamegiaoduc.co/backend/$SECRET"
```

Mỗi bài lưu riêng trong `data/guides/NN.json`, nên có thể sửa/backup từng bài độc lập.

API vẫn dùng được nếu muốn gọi bằng `curl`:

```bash
curl -X PATCH "https://audioguide.gamegiaoduc.co/backend/$SECRET/guides/1" \
  -H "Content-Type: application/json" \
  -d '{
    "title1": "Tiêu đề dòng 1",
    "title2": "Tiêu đề dòng 2",
    "title3": "Tiêu đề dòng 3",
    "description": "Nội dung mới",
    "imageUrl": "/images/items/01.jpg",
    "audioUrl": "/audio/01.mp3",
    "titleLayout": {
      "left": "16px",
      "top": "38px",
      "width": "56%",
      "title1Size": "clamp(22px, 5.85vw, 68px)",
      "title2Size": "clamp(16px, 4.5vw, 52px)",
      "title3Size": "clamp(14px, 4vw, 44px)"
    },
    "imageLayout": {
      "foregroundPosition": "85% center",
      "backgroundPosition": "center",
      "backgroundOpacity": 1,
      "overlayOpacity": 0.8
    }
  }'
```

Upload ảnh và MP3 cho bài số 1:

```bash
curl -X POST "https://audioguide.gamegiaoduc.co/backend/$SECRET/guides/1/upload" \
  -F "image=@/duong/dan/anh-01.jpg" \
  -F "audio=@/duong/dan/audio-01.mp3"
```

File upload được lưu trong `data/uploads`, đã được mount vào container qua volume Docker.

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
- Tạo thư mục `data/uploads` để lưu ảnh/audio upload.
- Build/chạy Docker bằng `docker compose up -d --build`.
- Tự tạo cert/key vào `/etc/nginx/ssl/audioguide` nếu chưa có.
- Ghi site config vào `/etc/nginx/conf.d/audioguide.conf`.
- Chạy `nginx -t` và `systemctl reload nginx`.

Khi cần tạo lại dữ liệu seed thì chạy riêng:

```bash
cd /opt/audioGuide
docker run --rm -v "$PWD:/app" -w /app -e GUIDES_DATA_PATH=/app/data/guides.json -e GUIDES_DATA_DIR=/app/data/guides node:22-alpine sh -lc "npm install && npm run seed"
```

Hoặc chạy thủ công:

```bash
cd /opt/audioGuide
cp .env.example .env
SECRET="$(openssl rand -hex 24)"
sed -i "s/^BACKEND_SECRET=.*/BACKEND_SECRET=$SECRET/" .env
docker compose up -d --build
sudo cp deploy/nginx-audioguide.conf /etc/nginx/conf.d/audioguide.conf
sudo nginx -t
sudo systemctl reload nginx
echo "Frontend: https://audioguide.gamegiaoduc.co/?id=1"
echo "Backend: https://audioguide.gamegiaoduc.co/backend/$SECRET"
```
