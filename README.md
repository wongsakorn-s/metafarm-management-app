# MetaFarm Management App

ระบบจัดการฟาร์มผึ้งชันโรงแบบ full-stack สำหรับติดตามรัง ผลผลิต การตรวจรัง สภาพอากาศ และ QR label

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS + Bun
- Backend: FastAPI + SQLAlchemy + Alembic
- Database: PostgreSQL
- Auth: JWT access token + HttpOnly refresh cookie
- Deployment: Docker Compose + Nginx reverse proxy

## Features

- Dashboard สรุปภาพรวมฟาร์ม
- จัดการข้อมูลรังและสถานะรัง
- บันทึกผลผลิตและการตรวจรังพร้อมอัปโหลดรูป
- Weather endpoint พร้อม cache และ DB fallback
- Login, JWT, refresh token rotation, logout
- QR print และ QR scan
- Health check, metrics, logging, rate limit, secure headers
- Playwright e2e และ CI workflow

## Project Structure

```text
MetaFarm/
|- backend/
|- frontend/
|- deploy/prod/
|- docker-compose.yml
|- docker-compose.dev.yml
|- docker-compose.prod.yml
|- .env.example
```

## Environment Setup

คัดลอกไฟล์ตัวอย่าง:

```powershell
Copy-Item .env.example .env
Copy-Item deploy/prod/.env.production.example deploy/prod/.env.production
```

ค่าหลักที่ต้องตั้ง:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD` หรือ `deploy/prod/secrets/postgres_password.txt`
- `POSTGRES_DB`
- `DATABASE_URL`
- `DOCKER_DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET_KEY`
- `CORS_ORIGINS`
- `OPENWEATHER_API_KEY`

## Run In Development

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

บริการที่ได้:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5433`

## Run In Production Mode

production stack ใช้ reverse proxy เท่านั้น โดย expose แค่ `80/443`

```powershell
docker compose -f docker-compose.prod.yml --env-file ./deploy/prod/.env.production up --build -d
```

ไฟล์ที่เกี่ยวข้อง:

- compose: [docker-compose.prod.yml](C:/Users/wongs/OneDrive/Desktop/MetaFarm/docker-compose.prod.yml)
- checklist: [PRODUCTION_CHECKLIST.md](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/PRODUCTION_CHECKLIST.md)
- reverse proxy: [reverse-proxy.conf](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/reverse-proxy.conf)
- certs: [README.md](C:/Users/wongs/OneDrive/Desktop/MetaFarm/deploy/prod/certs/README.md)

## Monitoring

endpoint ที่มี:

- `GET /health/live`
- `GET /health/ready`
- `GET /metrics`

เช็ก stack แบบเร็ว:

```powershell
./deploy/prod/scripts/check-prod.ps1
```

## Backup And Restore

สำรองฐานข้อมูล:

```powershell
./deploy/prod/scripts/backup-postgres.ps1
```

กู้คืนฐานข้อมูล:

```powershell
./deploy/prod/scripts/restore-postgres.ps1 -BackupFile ./deploy/prod/backups/metafarm-YYYYMMDD-HHMMSS.sql
```

## Install Real Certificates

ถ้ามี certificate จริงอยู่แล้ว สามารถคัดลอกเข้า path ที่ nginx ใช้งานได้ด้วย:

```powershell
./deploy/prod/scripts/install-certificates.ps1 `
  -AppFullchain C:\certs\app\fullchain.pem `
  -AppPrivkey C:\certs\app\privkey.pem `
  -ApiFullchain C:\certs\api\fullchain.pem `
  -ApiPrivkey C:\certs\api\privkey.pem
```

## Seed Sample Data

```powershell
cd backend
python seed_sample_data.py
```

## Tests

Backend:

```powershell
cd backend
python -m pytest -q
```

Frontend build:

```powershell
cd frontend
bun run build
```

Frontend e2e:

```powershell
cd frontend
bun run test:e2e
```
