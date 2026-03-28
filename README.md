# MetaFarm Management App

ระบบจัดการฟาร์มชันโรงแบบ full-stack สำหรับติดตามรังผึ้ง ผลผลิต การตรวจรัง สภาพอากาศ และพิมพ์ QR สำหรับติดรัง

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS + Bun
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL
- Deployment-ready local stack: Docker Compose

## Features

- Dashboard สำหรับดูภาพรวมฟาร์ม
- จัดการข้อมูลรังผึ้งและสถานะรัง
- บันทึกการเก็บผลผลิตและการตรวจรัง
- ดูข้อมูลสภาพอากาศจาก OpenWeather
- สแกนและพิมพ์ QR label สำหรับแต่ละรัง
- รองรับ PWA สำหรับใช้งานบนมือถือ

## Project Structure

```text
MetaFarm/
|- backend/
|- frontend/
|- docker-compose.yml
|- .env.example
```

## Environment Variables

คัดลอกไฟล์ตัวอย่างแล้วแก้ค่าตามเครื่องของคุณ

```powershell
Copy-Item .env.example .env
```

ตัวแปรหลักที่ต้องใช้:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DATABASE_URL`
- `VITE_API_URL`
- `OPENWEATHER_API_KEY`
- `FARM_LAT`
- `FARM_LON`

## Run With Docker

```powershell
docker compose up --build
```

บริการที่ได้:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5433`

## Run Locally

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```powershell
cd frontend
bun install
bun run dev
```

## Seed Sample Data

หลังจาก backend และ database พร้อมแล้ว สามารถเพิ่มข้อมูลตัวอย่างได้ด้วย:

```powershell
cd backend
python seed_sample_data.py
```

## Build Frontend

```powershell
cd frontend
bun run build
```

## Test Backend

```powershell
cd backend
pytest
```

## GitHub Setup

หลังจาก `git init` และผูก remote แล้ว ให้ใช้คำสั่งนี้เพื่อ push:

```powershell
git branch -M main
git push -u origin main
```
