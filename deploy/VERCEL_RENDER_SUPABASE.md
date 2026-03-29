## Deploy แบบ Free Tier: Vercel + Render + Supabase

โครงที่แนะนำสำหรับโปรเจกต์นี้:

- `frontend` ไป `Vercel`
- `backend` ไป `Render`
- `database` ไป `Supabase Postgres`
- `inspection images` ไป `Supabase Storage`

### 1. เตรียม Supabase

1. สร้าง project ใหม่ใน Supabase
2. ไปที่ `Project Settings > Database`
3. ใช้ connection string แบบ `Session pooler` หรือ connection string ที่ Supabase ให้มา
4. ใส่ `?sslmode=require` ถ้ายังไม่มี
5. สร้าง public bucket ชื่อ `inspection-images`
6. ไปที่ `Project Settings > API` แล้วเตรียม:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Deploy Backend ไป Render

repo นี้เตรียม [render.yaml](C:/Users/wongs/OneDrive/Desktop/MetaFarm/render.yaml) และ [render-start.sh](C:/Users/wongs/OneDrive/Desktop/MetaFarm/backend/render-start.sh) ไว้แล้ว

ค่าที่ต้องตั้งบน Render:

- `APP_ENV=production`
- `DATABASE_URL=<supabase postgres url>`
- `CORS_ORIGINS=https://<your-vercel-production-domain>`
- `CORS_ORIGIN_REGEX=^https://.*\\.vercel\\.app$`
- `JWT_SECRET_KEY=<random 32+ bytes>`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=<strong password>`
- `REFRESH_COOKIE_SECURE=true`
- `REFRESH_COOKIE_SAMESITE=none`
- `OPENWEATHER_API_KEY=<optional>`
- `SUPABASE_URL=<your supabase url>`
- `SUPABASE_SERVICE_ROLE_KEY=<service role key>`
- `SUPABASE_STORAGE_BUCKET=inspection-images`

หลัง deploy:

1. เปิด `https://<your-render-service>.onrender.com/health/ready`
2. ต้องได้ `200`

### 3. Deploy Frontend ไป Vercel

repo นี้เตรียม [frontend/vercel.json](C:/Users/wongs/OneDrive/Desktop/MetaFarm/frontend/vercel.json) ไว้แล้ว

ตั้งค่า project บน Vercel:

1. `Root Directory = frontend`
2. `Framework Preset = Vite`
3. ตั้ง env:
   - `VITE_API_URL=https://<your-render-service>.onrender.com`

หลัง deploy:

1. เปิด `https://<your-vercel-app>.vercel.app`
2. ทดสอบ login
3. ทดสอบเพิ่มรัง
4. ทดสอบบันทึก harvest
5. ทดสอบ inspection พร้อมรูป

### 4. ทำโดเมนจริง

ถ้าจะเปิดใช้งานจริง:

- ผูก custom domain ให้ Vercel
- ผูก custom domain ให้ Render หรือวาง reverse proxy ด้านหน้า backend
- เปลี่ยน `CORS_ORIGINS` ให้เป็นโดเมนจริง
- คง `CORS_ORIGIN_REGEX` ไว้เพื่อรองรับ preview deployment ของ Vercel

### 5. หมายเหตุสำคัญ

- Render free จะมี cold start
- Supabase free อาจ pause ถ้า inactivity นาน
- การอัปโหลดรูปบน Render ไม่ควรเก็บ local disk จึงเปลี่ยนให้ใช้ Supabase Storage ได้แล้วใน repo นี้
