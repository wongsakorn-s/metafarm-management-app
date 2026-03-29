## Final Production Checklist

- เปลี่ยน secret ทุกตัวใน `deploy/prod/secrets/` ให้เป็นค่าจริงและสุ่มใหม่
- ติดตั้ง certificate จริงลง `deploy/prod/certs/app/` และ `deploy/prod/certs/api/`
- ตรวจ `CORS_ORIGINS`, domain, และ admin account ใน `deploy/prod/.env.production`
- รัน `docker compose -f docker-compose.prod.yml --env-file ./deploy/prod/.env.production up --build -d`
- เช็ก `docker compose -f docker-compose.prod.yml --env-file ./deploy/prod/.env.production ps`
- เช็ก `https://app.example.com` และ `https://api.example.com/health/live`
- เช็ก `/metrics` ผ่าน backend ภายในหรือ reverse proxy ตามนโยบายของระบบ
- ตั้ง cron หรือ scheduled task ให้รัน backup script ทุกวัน
- ทดสอบ restore จากไฟล์ backup อย่างน้อย 1 รอบก่อนใช้งานจริง
- เปิด monitoring/alerting จาก health endpoint, logs, และ metrics
