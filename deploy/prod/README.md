โฟลเดอร์นี้เก็บทุกอย่างที่เกี่ยวกับ production deployment

ไฟล์สำคัญ:

- compose: [docker-compose.prod.yml](C:/Users/wongs/OneDrive/Desktop/MetaFarm/docker-compose.prod.yml)
- env example: [deploy/prod/.env.production.example](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/.env.production.example)
- checklist: [deploy/prod/PRODUCTION_CHECKLIST.md](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/PRODUCTION_CHECKLIST.md)
- reverse proxy template: [deploy/prod/reverse-proxy.conf](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/reverse-proxy.conf)
- cert guide: [deploy/prod/certs/README.md](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/certs/README.md)

สิ่งที่ต้องเตรียมก่อน deploy:

- secret files ใน `deploy/prod/secrets/`
- ค่า `APP_DOMAIN`, `API_DOMAIN`, `LAN_IP`, `CORS_ORIGINS` ใน `.env.production`
- certificate จริงใน `deploy/prod/certs/app/` และ `deploy/prod/certs/api/`

คำสั่งหลัก:

```powershell
docker compose -f docker-compose.prod.yml --env-file ./deploy/prod/.env.production up --build -d
docker compose -f docker-compose.prod.yml --env-file ./deploy/prod/.env.production ps
docker compose -f docker-compose.prod.yml --env-file ./deploy/prod/.env.production logs reverse-proxy --tail 100
docker compose -f docker-compose.prod.yml --env-file ./deploy/prod/.env.production down
```

ตัวอย่างโดเมนจริง:

```env
APP_DOMAIN=app.metafarm.example
API_DOMAIN=api.metafarm.example
CORS_ORIGINS=https://app.metafarm.example,https://api.metafarm.example
```

PWA บนมือถือจะทำงานนิ่งที่สุดเมื่อ:

- เปิดผ่าน `https://APP_DOMAIN`
- certificate เป็นของ CA จริง
- browser ไม่ขึ้น certificate warning

สคริปต์ที่มีให้:

- health/proxy check: [check-prod.ps1](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/scripts/check-prod.ps1)
- backup: [backup-postgres.ps1](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/scripts/backup-postgres.ps1)
- restore: [restore-postgres.ps1](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/scripts/restore-postgres.ps1)
- install certificate: [install-certificates.ps1](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/scripts/install-certificates.ps1)
- generate LAN CA/cert: [generate-lan-cert.ps1](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/scripts/generate-lan-cert.ps1)

ทดสอบผ่าน ngrok บนเครื่อง local:

```powershell
docker compose -f docker-compose.prod.yml --env-file ./deploy/prod/.env.production up --build -d
ngrok http 80
```

จากนั้นเปิด `https://<your-ngrok-subdomain>.ngrok-free.dev` หรือโดเมน `ngrok` ที่ระบบให้มา
