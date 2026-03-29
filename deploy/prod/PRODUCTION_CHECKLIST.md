## Final Production Checklist

- เปลี่ยน secret ทุกตัวใน `deploy/prod/secrets/` ให้เป็นค่าจริงและสุ่มใหม่
- ตั้ง `APP_DOMAIN`, `API_DOMAIN`, `LAN_IP`, `CORS_ORIGINS` ใน [deploy/prod/.env.production.example](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/.env.production.example)
- วาง certificate จริงใน `deploy/prod/certs/app/` และ `deploy/prod/certs/api/`
- ถ้าทดสอบในวง LAN ให้สร้าง cert ด้วย [generate-lan-cert.ps1](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/scripts/generate-lan-cert.ps1) และติดตั้ง `rootCA.crt` ลงมือถือ
- รัน `docker compose -f docker-compose.prod.yml --env-file ./deploy/prod/.env.production up --build -d`
- เช็ก `docker compose -f docker-compose.prod.yml --env-file ./deploy/prod/.env.production ps`
- เช็ก `https://APP_DOMAIN` และ `https://API_DOMAIN/health/live`
- เช็ก `https://APP_DOMAIN/manifest.webmanifest` และ install PWA บนมือถือจริงอย่างน้อย 1 เครื่อง
- เช็ก `/metrics`, logs, และ rate limit หลัง deploy
- ตั้ง scheduled backup ด้วย [backup-postgres.ps1](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/scripts/backup-postgres.ps1)
- ทดสอบ restore จริงด้วย [restore-postgres.ps1](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/scripts/restore-postgres.ps1) อย่างน้อย 1 รอบ
