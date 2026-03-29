วาง certificate และ private key สำหรับ production ในโฟลเดอร์นี้

โครงสร้างที่ nginx ใช้งาน:

- `deploy/prod/certs/app/fullchain.pem`
- `deploy/prod/certs/app/privkey.pem`
- `deploy/prod/certs/api/fullchain.pem`
- `deploy/prod/certs/api/privkey.pem`
- `deploy/prod/certs/lan/fullchain.pem`
- `deploy/prod/certs/lan/privkey.pem`
- `deploy/prod/certs/lan/rootCA.crt`

การใช้งานแต่ละชุด:

- `app/` ใช้กับโดเมนจริงของ frontend เช่น `app.example.com`
- `api/` ใช้กับโดเมนจริงของ backend เช่น `api.example.com`
- `lan/` ใช้เปิดจากมือถือในวง Wi-Fi เดียวกัน เช่น `https://192.168.1.59`

ถ้าจะให้มือถือ trust certificate ในวง LAN:

1. สร้าง LAN CA และ cert:
   `./deploy/prod/scripts/generate-lan-cert.ps1 -LanIp 192.168.1.59`
2. เอาไฟล์ `deploy/prod/certs/lan/rootCA.crt` ไปติดตั้งบนมือถือ
3. iPhone/iPad:
   - เปิดไฟล์ `rootCA.crt`
   - ไปที่ `Settings > Profile Downloaded` แล้วติดตั้ง
   - ไปที่ `Settings > General > About > Certificate Trust Settings`
   - เปิด Full Trust ให้ `MetaFarm LAN Root CA`
4. Android:
   - ส่งไฟล์ `rootCA.crt` เข้าเครื่อง
   - ไปที่ `Settings > Security > Encryption & credentials > Install a certificate > CA certificate`
   - เลือกไฟล์ `rootCA.crt`
   - รีสตาร์ต browser ถ้ายังไม่เห็นผล

ถ้าจะให้ PWA ทำงานเต็มรูปแบบแบบไม่ต้องกด trust เอง:

- ใช้โดเมนจริง เช่น `app.yourdomain.com` และ `api.yourdomain.com`
- ใช้ certificate จาก CA จริง เช่น Let's Encrypt
- ตั้งค่า `APP_DOMAIN`, `API_DOMAIN`, `CORS_ORIGINS` ใน `deploy/prod/.env.production`
